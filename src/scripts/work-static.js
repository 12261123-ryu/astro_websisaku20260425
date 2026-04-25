async function loadWorkDetail() {
  const work = window.__WORK_DATA__;
  if (!work) return;

  try {
    const [projectRes, worksRes] = await Promise.all([
      fetch('/project.json'),
      fetch('/work.json')
    ]);
    const projectData = await projectRes.json();
    const knownMaterials = projectData.filter_keywords.map(item => item.id);
    const works = await worksRes.json();

    // つぶつぶカラー変更
    if (window.updateTubuColors) {
      window.updateTubuColors(work.project);
    }

    // 閲覧数カウント
    const visitedWorks = JSON.parse(sessionStorage.getItem('visitedWorks') || '[]');
    if (!visitedWorks.includes(work.en_name)) {
      visitedWorks.push(work.en_name);
      sessionStorage.setItem('visitedWorks', JSON.stringify(visitedWorks));
      const currentPlus = parseInt(sessionStorage.getItem('visitPlus') || '0');
      if (currentPlus < 5) {
        sessionStorage.setItem('visitPlus', String(currentPlus + 1));
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

    // 素材・所属タグのクリックでスクロールリセット
    document.querySelectorAll('.tag-link').forEach(link => {
      link.addEventListener('click', () => {
        sessionStorage.removeItem('scrollY');
      });
    });

    // Instagram埋め込み
    document.querySelectorAll('[data-instagram-url]').forEach(el => {
      const instaUrl = el.dataset.instagramUrl;
      el.innerHTML = `
        <blockquote class="instagram-media"
          data-instgrm-permalink="${instaUrl}"
          data-instgrm-version="14"
          style="width:100%; max-width:360px;">
        </blockquote>`;
      if (!document.getElementById('instagram-embed-script')) {
        const script = document.createElement('script');
        script.id = 'instagram-embed-script';
        script.src = 'https://www.instagram.com/embed.js';
        script.async = true;
        document.body.appendChild(script);
      } else if (window.instgrm) {
        window.instgrm.Embeds.process();
      }
    });

    // レコメンド
    renderRecommendations(work, works, knownMaterials);

  } catch (error) {
    console.error("エラー:", error);
  }
}

function renderRecommendations(currentWork, allWorks, knownMaterials) {
  const container = document.getElementById('recommend-list');
  if (!container) return;

  const storageKey = `recommend_${currentWork.school_number}`;
  const savedRecommend = sessionStorage.getItem(storageKey);
  if (savedRecommend) {
    const savedWorks = JSON.parse(savedRecommend);
    savedWorks.forEach(work => {
      container.insertAdjacentHTML('beforeend', `
        <div class="work-item">
          <a href="/work/${work.en_name}" class="work-item-link">
            <div class="work-thumbnail">
              <img src="${work.main_image}" alt="${work.title}" loading="lazy" decoding="async">
            </div>
            <div class="work-info">
              <span class="work-title">${work.title}</span>
              <span class="work-designer">${work.name}</span>
            </div>
          </a>
        </div>`);
    });
    return;
  }

  const selectedNames = new Set([currentWork.en_name]);
  const recommended = [];

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

  const sameProjectCandidates = allWorks.filter(w =>
    !selectedNames.has(w.en_name) && w.project === currentWork.project
  );
  if (sameProjectCandidates.length > 0) {
    const picked = sameProjectCandidates[Math.floor(Math.random() * sameProjectCandidates.length)];
    recommended.push(picked);
    selectedNames.add(picked.en_name);
  }

  if (currentWork.materials && currentWork.materials.length > 0) {
    const myMat = currentWork.materials[Math.floor(Math.random() * currentWork.materials.length)].trim();
    const isKnown = knownMaterials.includes(myMat);
    const sameMatCandidates = allWorks.filter(w => {
      if (selectedNames.has(w.en_name)) return false;
      return w.materials.some(m => {
        const targetMat = m.trim();
        return isKnown ? targetMat === myMat : !knownMaterials.includes(targetMat);
      });
    });
    if (sameMatCandidates.length > 0) {
      const picked = sameMatCandidates[Math.floor(Math.random() * sameMatCandidates.length)];
      recommended.push(picked);
      selectedNames.add(picked.en_name);
    }
  }

  while (recommended.length < 4) {
    const backup = allWorks.filter(w => !selectedNames.has(w.en_name));
    if (backup.length === 0) break;
    const picked = backup[Math.floor(Math.random() * backup.length)];
    recommended.push(picked);
    selectedNames.add(picked.en_name);
  }

  const saveData = recommended.map(w => ({
    en_name: w.en_name,
    main_image: w.main_image,
    title: w.title,
    name: w.name
  }));
  sessionStorage.setItem(storageKey, JSON.stringify(saveData));

  recommended.forEach(work => {
    container.insertAdjacentHTML('beforeend', `
      <div class="work-item">
        <a href="/work/${work.en_name}" class="work-item-link">
          <div class="work-thumbnail">
            <img src="${work.main_image}" alt="${work.title}" loading="lazy" decoding="async">
          </div>
          <div class="work-info">
            <span class="work-title">${work.title}</span>
            <span class="work-designer">${work.name}</span>
          </div>
        </a>
      </div>`);
  });
}

document.addEventListener('DOMContentLoaded', loadWorkDetail);