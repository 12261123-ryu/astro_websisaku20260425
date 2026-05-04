

async function loadWorkDetail() {
  const pathParts = window.location.pathname.split('/');
  const targetName = decodeURIComponent(pathParts[pathParts.length - 1]);

  if (!targetName) return;

  try {
    const [worksRes, projectRes] = await Promise.all([
      fetch('/work.json'),
      fetch('/project.json')
    ]);

    const works = await worksRes.json();
    const projectData = await projectRes.json();
    const knownMaterials = projectData.filter_keywords.map(item => item.id);

    const work = works.find(item => item.en_name && item.en_name.trim() === targetName.trim());

    //戻るリンクを書き換える(絞り込み状態を保存する)
    if (work) {

      // exception_HTMLの場合は別のrender関数を呼ぶ
      if (work.exception_HTML === 'true' || work.exception_HTML === 'TRUE') {
        renderExceptionWorkPage(work, knownMaterials);
      }

      renderRecommendations(work, works, knownMaterials);

      //つぶつぶカラー変更用：作者の所属プロジェクトカラーへ
      if (window.updateTubuColors) {
        window.updateTubuColors(work.project);
      }

      //個別ページを閲覧するたびに初期数を1つずつ最大5まで増やすギミックを試す用
      const visitedWorks = JSON.parse(sessionStorage.getItem('visitedWorks') || '[]');
      if (!visitedWorks.includes(work.en_name)) {
        visitedWorks.push(work.en_name);
        sessionStorage.setItem('visitedWorks', JSON.stringify(visitedWorks));
        const currentPlus = parseInt(sessionStorage.getItem('visitPlus') || '0');
        if (currentPlus < 5) {
          sessionStorage.setItem('visitPlus', String(currentPlus + 1));
        // 粒を即座に追加
        if (window.syncTubuCount) {
          window.syncTubuCount();
        }
      }
      }


      // 戻るリンクにfilterパラメータを付ける
      const lastFilter = sessionStorage.getItem('lastFilter');
      const returnLink = document.querySelector('.return-to-Top a');
      if (returnLink && lastFilter) {
        returnLink.href = `/?filter=${lastFilter}`;
      }
    } else {
      // 作品が見つからない場合
      const mainWindow = document.querySelector('.main-window');
      if (mainWindow) {
        mainWindow.innerHTML = '<p style="padding: 40px; color: #888;">作品が見つかりませんでした。<div class="return-to-Top"><a href="/">←一覧に戻る</a></div>';
      }
    }
  } catch (error) {
    console.error("エラー:", error);
  }
}






//レコメンド機能
// selectedNamesで重複を管理
function renderRecommendations(currentWork, allWorks, knownMaterials) {
  const container = document.getElementById('recommend-list');
  if (!container) return;

  //個別ページに入ったら、レコメンドをSessionStorageに保存して固定し、2回目以降は保存済みのものを表示
  //タブを閉じるとリセット
  const storageKey = `recommend_${currentWork.school_number}`;
  const savedRecommend = sessionStorage.getItem(storageKey);
  if (savedRecommend) {
    const savedWorks = JSON.parse(savedRecommend);
    savedWorks.forEach(work => {
      const html = `
        <div class="work-item">
          <a href="/work/${work.en_name}" class="work-item-link">
            <div class="work-thumbnail">
              <img src="${work.thumbnail}" alt="${work.title}" loading="lazy" decoding="async">
            </div>
            <div class="work-info">
              <span class="work-title">${work.title}</span>
              <span class="work-designer">${work.name}</span>
            </div>
          </a>
        </div>`;
      container.insertAdjacentHTML('beforeend', html);
    });
    return;
  }

  const selectedNames = new Set([currentWork.en_name]);
  const recommended = [];

  // --- 1. sort_numberによる前後 (ラベルなし) ---
  const currentSortNum = parseInt(currentWork.sort_number);
  const totalCount = allWorks.length;
  const prevNum = currentSortNum === 1 ? totalCount : currentSortNum - 1;
  const nextNum = currentSortNum === totalCount ? 1 : currentSortNum + 1;

  [prevNum, nextNum].forEach(num => {
    const found = allWorks.find(w => parseInt(w.sort_number) === num);
    if (found) {
      recommended.push(found);
      selectedNames.add(found.en_name);
    }
  });

  // --- 2. 同じゼミ(project)から1名 ---
  const sameProjectCandidates = allWorks.filter(w => 
    !selectedNames.has(w.en_name) && w.project === currentWork.project
  );
  if (sameProjectCandidates.length > 0) {
    const picked = sameProjectCandidates[Math.floor(Math.random() * sameProjectCandidates.length)];
    // ゼミ名のラベル設定
    recommended.push(picked);
    selectedNames.add(picked.en_name);
  }

  // --- 3. 素材(materials)から1名 --- 木材(木の種類名)とか、（）書きで指定してるものも大枠でレコメンド対応
  if (currentWork.materials && currentWork.materials.length > 0) {
    const myMatRaw = currentWork.materials[Math.floor(Math.random() * currentWork.materials.length)].trim();
    const myMat = myMatRaw.replace(/（.*）|\(.*\)/, '').trim(); // 括弧を除く
    const isKnown = knownMaterials.includes(myMat);

    const sameMatCandidates = allWorks.filter(w => {
      if (selectedNames.has(w.en_name)) return false;
      return w.materials.some(m => {
        const targetMat = m.trim().replace(/（.*）|\(.*\)/, '').trim(); // 括弧を除く
        return isKnown ? targetMat === myMat : !knownMaterials.includes(targetMat);
      });
    });

    if (sameMatCandidates.length > 0) {
      const picked = sameMatCandidates[Math.floor(Math.random() * sameMatCandidates.length)];
      // 素材ラベルの設定（主要素材ならその名前、その他なら「その他」）
      recommended.push(picked);
      selectedNames.add(picked.en_name);
    }
  }

  // --- 4. 補充 (ラベルなし) ---
  while (recommended.length < 4) {
    const backup = allWorks.filter(w => !selectedNames.has(w.en_name));
    if (backup.length === 0) break;
    const picked = backup[Math.floor(Math.random() * backup.length)];
    recommended.push(picked);
    selectedNames.add(picked.en_name);
  }

  // --- HTMLの描画 ---
  // renderRecommendations 関数内の描画ループ部分

  //レコメンドの固定。sessionStorageに保存
    const saveData = recommended.map(w => ({
      en_name: w.en_name,
      thumbnail: w.thumbnail,
      title: w.title,
      name: w.name
    }));
    sessionStorage.setItem(storageKey, JSON.stringify(saveData));

  recommended.forEach(work => {
    const html = `
      <div class="work-item">
        <a href="/work/${work.en_name}" class="work-item-link">
          <div class="work-thumbnail">
            <img src="${work.thumbnail}" alt="${work.title}" loading="lazy" decoding="async">
          </div>
          <div class="work-info">
            <span class="work-title">${work.title}</span>
            <span class="work-designer">${work.name}</span>
          </div>
        </a>
      </div>`;
    container.insertAdjacentHTML('beforeend', html);
  });
}






window.addEventListener('load', loadWorkDetail);






function renderExceptionWorkPage(work, knownMaterials = []) {
  document.title = `${work.title} / 統合デザイン学科卒業・修了制作展2026 / web図録`;

  const mainWindow = document.querySelector('.work-main-content');
  if (!mainWindow) return;
  mainWindow.classList.add('exception-page');

  const masterDetail = work.Master_project ? `（${work.Master_project}）` : "";
  const contactType = work.contact?.type?.toLowerCase().trim();
  const contactId = work.contact?.id?.toString().trim().replace('@', '');
  const contactUrl = contactType === 'instagram' ? `https://www.instagram.com/${contactId}/` : `https://x.com/${contactId}/`;
  const contactText = contactType === 'instagram' ? `Instagram @${contactId}` : `X @${contactId}`;


  const recommendBlock = document.querySelector('.recommend-part');
  const footer = document.querySelector('footer');

  // 既存のwork-partを削除して作り直す
  mainWindow.innerHTML = '';

  // 全体ブロック
  const overviewBlock = `
  <div class="content-wrapper work-part">
    <div class="work-part-grid">
      <div class="full-main-image">
        <img src="${work.overview_image || work.thumbnail}" style="width:100%; height:auto;" alt="">
      </div>
      <section class="work-info-block">
        <div id="work-title">${work.title}</div>
        <div id="work-designer">${work.name}</div>
        <div class="meta-info">
          <div class="meta-row">
            <span class="meta-label">所属：</span>
            <span class="meta-content"><a href="/?filter=M" class="tag-link">#大学院${masterDetail}</a></span>
          </div>
          <div class="meta-row">
            <span class="meta-label">連絡先：</span>
            <span id="work-contact" class="meta-content"><a href="${contactUrl}" target="_blank" rel="noopener noreferrer">${contactText}</a></span>
          </div>
        </div>
      </section>
    </div>
  </div>`;
  mainWindow.insertAdjacentHTML('beforeend', overviewBlock);

  // 各作品ブロック
  if (work.sub_works && work.sub_works.length > 0) {
    work.sub_works.forEach((sub, index) => {
      const isLast = index === work.sub_works.length - 1;

      const knowns = [];
      const others = [];
      sub.materials.forEach(m => {
        const trimmedM = m.trim();
        if (!trimmedM) return;
        const baseM = trimmedM.replace(/（.*）|\(.*\)/, '').trim();
        if (knownMaterials.includes(baseM)) {
        knowns.push(`<a href="/?filter=${baseM}" class="tag-link">#${trimmedM}</a>`);
        } else {
          others.push(trimmedM);
        }
      });
      let matParts = [];
      if (knowns.length > 0) matParts.push(knowns.join('、'));
      if (others.length > 0) matParts.push(`<a href="/?filter=その他" class="tag-link">#その他（${others.join('、')}）</a>`);
      const materialsHtml = matParts.join('、');

      const imagesHtml = sub.image_list.map(img => `
        <div class="content-item sub-image-item">
          <img src="${img}" loading="lazy" decoding="async" style="width:100%; height:auto;">
        </div>`).join('');

      const subBlock = `
        <div class="content-wrapper work-part">
          <div class="work-part-grid">
            <div class="full-main-image">
              <img src="${sub.image_list[0]}" style="width:100%; height:auto;" alt="">
            </div>
            <section class="work-info-block">
              <div class="sub-work-title">${sub.title}</div>
              <div class="sub-work-concept">${sub.concept}</div>
              <div class="meta-info">
                <div class="meta-row">
                  <span class="meta-label">素材：</span>
                  <span class="meta-content">${materialsHtml}</span>
                </div>
              </div>
            </section>
            <div class="sub-image-list">
              ${sub.image_list.slice(1).map(img => `
                <div class="content-item sub-image-item">
                  <img src="${img}" loading="lazy" decoding="async" style="width:100%; height:auto;">
                </div>`).join('')}
            </div>
          </div>
          ${isLast ? '<div style="height: 180px;"></div>' : ''}
        </div>`;
        mainWindow.insertAdjacentHTML('beforeend', subBlock);
    });
  }
  if (recommendBlock) mainWindow.appendChild(recommendBlock);
  if (footer) mainWindow.appendChild(footer);
}


