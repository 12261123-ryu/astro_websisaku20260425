async function loadWorkDetail() {
  const work = window.__WORK_DATA__;
  if (!work) return;

  try {
    const projectRes = await fetch('/project.json');
    const projectData = await projectRes.json();
    const knownMaterials = projectData.filter_keywords.map(item => item.id);

    renderWorkPage(work, knownMaterials);

    const worksRes = await fetch('/work.json');
    const works = await worksRes.json();
    renderRecommendations(work, works, knownMaterials);

    if (window.updateTubuColors) {
      window.updateTubuColors(work.project);
    }

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

    const lastFilter = sessionStorage.getItem('lastFilter');
    const returnLink = document.querySelector('.return-to-Top a');
    //一覧ページで絞り込む・絞り込みを解除・個別ページから素材または所属タグで一覧に飛ぶ、の3つではスクロールを一番上にリセット
    //ブラウザの戻る・個別ページでの「一覧に戻る」クリックではスクロール量を保存する
    if (returnLink) {
  if (lastFilter) {
    returnLink.href = `/?filter=${lastFilter}`;
  }
  // 「一覧に戻る」クリック時のみscrollYを保持、それ以外は削除
  returnLink.addEventListener('click', () => {
    // scrollYはそのまま保持（復元のため）
  });
}

  } catch (error) {
    console.error("エラー:", error);
  }
}

function renderWorkPage(work, knownMaterials = []) {
  const mainDisplayImage = (work.image_list && work.image_list.length > 0) ? work.image_list[0] : work.main_image;
  document.getElementById('main-visual').innerHTML = `<img src="${mainDisplayImage}" style="width:100%; height:auto;" decoding="async" alt="" onerror="this.style.background='#f9f9f9'; this.removeAttribute('src'); this.style.display='block'; this.style.width='100%';">`;

  document.getElementById('work-title').innerText = work.title;
  document.getElementById('work-designer').innerText = work.name;
  document.getElementById('work-concept').innerText = work.concept;

  const projectElem = document.getElementById('work-project');
  if (work.project === "M") {
    const masterDetail = work.Master_project ? `（${work.Master_project}）` : "";
    projectElem.innerHTML = `<a href="/?filter=M" class="tag-link">#大学院${masterDetail}</a>`;
  } else {
    projectElem.innerHTML = `<a href="/?filter=${work.project}" class="tag-link">#${work.project}プロジェクト</a>`;
  }

  const matElem = document.getElementById('work-materials');
  if (matElem && work.materials && Array.isArray(work.materials)) {
    const knowns = [];
    const others = [];

    work.materials.forEach(m => {
      const trimmedM = m.trim();
      if (!trimmedM) return;
      const baseM = trimmedM.replace(/（.*）|\(.*\)/, '').trim();
      if (knownMaterials.includes(baseM)) {
        knowns.push(`<a href="/?filter=${baseM}" class="tag-link">#${trimmedM}</a>`);
      } else {
        others.push(trimmedM);
      }
    });

    let displayParts = [];
    if (knowns.length > 0) displayParts.push(knowns.join('、'));
    if (others.length > 0) {
      displayParts.push(`<a href="/?filter=その他" class="tag-link">#その他（${others.join('、')}）</a>`);
    }
    matElem.innerHTML = displayParts.join('、');
  }

  const contactArea = document.getElementById('work-contact-area');
  const contactElem = document.getElementById('work-contact');

  if (work.contact && work.contact.type && work.contact.id) {
    const type = work.contact.type.toLowerCase().trim();
    let id = work.contact.id.toString().trim();
    let linkUrl = "";
    let displayText = "";

    if (type === "instagram") {
      const cleanId = id.replace('@', '');
      linkUrl = `https://www.instagram.com/${cleanId}/`;
      displayText = `Instagram @${cleanId}`;
    } else if (type === "x" || type === "twitter") {
      const cleanId = id.replace('@', '');
      linkUrl = `https://x.com/${cleanId}/`;
      displayText = `X @${cleanId}`;
    } else if (type === "email") {
      const fullEmail = id.includes('@') ? id : `${id}@gmail.com`;
      linkUrl = `mailto:${fullEmail}`;
      displayText = fullEmail;
    }

    if (linkUrl && contactArea) {
      contactArea.style.display = 'flex';
      contactElem.innerHTML = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${displayText}</a>`;
    }
  } else {
    if (contactArea) contactArea.style.display = 'none';
  }

  if (work.link && work.link_type === 'web') {
    const webLinkElem = document.getElementById('work-contact-area');
    const webLinkContent = document.getElementById('work-contact');
    if (webLinkElem && webLinkContent) {
      webLinkElem.style.display = 'flex';
      const existingContent = webLinkContent.innerHTML;
      const separator = existingContent ? '<br>' : '';
      webLinkContent.innerHTML += `${separator}<a href="${work.link}" target="_blank" rel="noopener noreferrer">個人ウェブサイト</a>`;
    }
  }

  const subContentContainer = document.getElementById('sub-images');
  if (subContentContainer) {
    subContentContainer.innerHTML = '';

    const renderVideos = () => {
      if (work.video_list && work.video_list.length > 0) {
        work.video_list.forEach(url => {
          const trimmedUrl = url.toString().trim();
          let embedHtml = null;
          let isVertical = false;

          const youtubeMatch = trimmedUrl.match(/(?:v=|shorts\/|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
          if (youtubeMatch) {
            isVertical = trimmedUrl.includes('shorts/') || (work.video_class && work.video_class.includes('vertical'));
            embedHtml = `<iframe src="https://www.youtube.com/embed/${youtubeMatch[1]}" allowfullscreen></iframe>`;
          }

          if (!embedHtml) {
            const vimeoMatch = trimmedUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/);
            if (vimeoMatch) {
              isVertical = work.link_type === 'vimeo' || (work.video_class && work.video_class.includes('vertical'));
              embedHtml = `<iframe src="https://player.vimeo.com/video/${vimeoMatch[1]}" allowfullscreen></iframe>`;
            }
          }

          if (!embedHtml) {
            const driveMatch = trimmedUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
            if (driveMatch) {
              embedHtml = `<iframe src="https://drive.google.com/file/d/${driveMatch[1]}/preview" allowfullscreen></iframe>`;
            }
          }

          if (!embedHtml) {
            const instaMatch = trimmedUrl.match(/instagram\.com\/(p|reel|tv)\/([a-zA-Z0-9_-]+)/);
            if (instaMatch) {
              const instaUrl = `https://www.instagram.com/${instaMatch[1]}/${instaMatch[2]}/`;
              subContentContainer.insertAdjacentHTML('beforeend', `
                <div class="content-item video-item vertical">
                  <blockquote class="instagram-media"
                    data-instgrm-permalink="${instaUrl}"
                    data-instgrm-version="14"
                    style="width:100%; max-width:360px;">
                  </blockquote>
                </div>
              `);
              if (!document.getElementById('instagram-embed-script')) {
                const script = document.createElement('script');
                script.id = 'instagram-embed-script';
                script.src = 'https://www.instagram.com/embed.js';
                script.async = true;
                document.body.appendChild(script);
              } else if (window.instgrm) {
                window.instgrm.Embeds.process();
              }
              return;
            }
          }

          if (embedHtml) {
            const verticalClass = isVertical ? ' vertical' : '';
            subContentContainer.insertAdjacentHTML('beforeend', `
              <div class="content-item video-item${verticalClass}">
                ${embedHtml}
              </div>`);
          }
        });
      }
    };

    const renderImages = () => {
      if (work.image_list && work.image_list.length > 0) {
        work.image_list.forEach((item, index) => {
          if (index === 0) return;
          const imgPath = typeof item === 'string' ? item : item.path;
          const layout = typeof item === 'object' && item.layout ? item.layout : null;
          const width = typeof item === 'object' && item.width ? item.width : null;
          const layoutClass = layout ? ` image-layout-${layout}` : '';
          const widthStyle = width ? `style="width:${width}%"` : '';
          subContentContainer.insertAdjacentHTML('beforeend', `
            <div class="content-item sub-image-item${layoutClass}">
              <img src="${imgPath}" loading="lazy" decoding="async" ${widthStyle}
              onerror="this.style.background='#f9f9f9'; this.removeAttribute('src');">
            </div>`);
        });
      }
    };

    if (work.video_to_last) {
      renderImages();
      renderVideos();
    } else {
      renderVideos();
      renderImages();
    }

    if (work.link && work.link_type === 'pdf') {
      const driveMatch = work.link.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (driveMatch) {
        subContentContainer.insertAdjacentHTML('beforeend', `
          <div class="content-item pdf-item">
            <iframe src="https://drive.google.com/file/d/${driveMatch[1]}/preview"
              style="width:100%; height:600px; border:none;">
            </iframe>
          </div>`);
      }
    }
  }

  document.querySelectorAll('.tag-link').forEach(link => {
  link.addEventListener('click', () => {
    sessionStorage.removeItem('scrollY');
  });
});

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