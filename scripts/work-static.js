

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







