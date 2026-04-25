async function b(){const e=window.__WORK_DATA__;if(e)try{const h=(await(await fetch("/project.json")).json()).filter_keywords.map(o=>o.id);$(e,h);const u=await(await fetch("/work.json")).json();M(e,u,h),window.updateTubuColors&&window.updateTubuColors(e.project);const l=JSON.parse(sessionStorage.getItem("visitedWorks")||"[]");if(!l.includes(e.en_name)){l.push(e.en_name),sessionStorage.setItem("visitedWorks",JSON.stringify(l));const o=parseInt(sessionStorage.getItem("visitPlus")||"0");o<5&&(sessionStorage.setItem("visitPlus",String(o+1)),window.syncTubuCount&&window.syncTubuCount())}const r=sessionStorage.getItem("lastFilter"),s=document.querySelector(".return-to-Top a");s&&(r&&(s.href=`/?filter=${r}`),s.addEventListener("click",()=>{}))}catch(f){console.error("エラー:",f)}}function $(e,f=[]){const y=e.image_list&&e.image_list.length>0?e.image_list[0]:e.main_image;document.getElementById("main-visual").innerHTML=`<img src="${y}" style="width:100%; height:auto;" decoding="async" alt="" onerror="this.style.background='#f9f9f9'; this.removeAttribute('src'); this.style.display='block'; this.style.width='100%';">`,document.getElementById("work-title").innerText=e.title,document.getElementById("work-designer").innerText=e.name,document.getElementById("work-concept").innerText=e.concept;const h=document.getElementById("work-project");if(e.project==="M"){const s=e.Master_project?`（${e.Master_project}）`:"";h.innerHTML=`<a href="/?filter=M" class="tag-link">#大学院${s}</a>`}else h.innerHTML=`<a href="/?filter=${e.project}" class="tag-link">#${e.project}プロジェクト</a>`;const p=document.getElementById("work-materials");if(p&&e.materials&&Array.isArray(e.materials)){const s=[],o=[];e.materials.forEach(c=>{const n=c.trim();if(!n)return;const d=n.replace(/（.*）|\(.*\)/,"").trim();f.includes(d)?s.push(`<a href="/?filter=${d}" class="tag-link">#${n}</a>`):o.push(n)});let a=[];s.length>0&&a.push(s.join("、")),o.length>0&&a.push(`<a href="/?filter=その他" class="tag-link">#その他（${o.join("、")}）</a>`),p.innerHTML=a.join("、")}const u=document.getElementById("work-contact-area"),l=document.getElementById("work-contact");if(e.contact&&e.contact.type&&e.contact.id){const s=e.contact.type.toLowerCase().trim();let o=e.contact.id.toString().trim(),a="",c="";if(s==="instagram"){const n=o.replace("@","");a=`https://www.instagram.com/${n}/`,c=`Instagram @${n}`}else if(s==="x"||s==="twitter"){const n=o.replace("@","");a=`https://x.com/${n}/`,c=`X @${n}`}else if(s==="email"){const n=o.includes("@")?o:`${o}@gmail.com`;a=`mailto:${n}`,c=n}a&&u&&(u.style.display="flex",l.innerHTML=`<a href="${a}" target="_blank" rel="noopener noreferrer">${c}</a>`)}else u&&(u.style.display="none");if(e.link&&e.link_type==="web"){const s=document.getElementById("work-contact-area"),o=document.getElementById("work-contact");if(s&&o){s.style.display="flex";const c=o.innerHTML?"<br>":"";o.innerHTML+=`${c}<a href="${e.link}" target="_blank" rel="noopener noreferrer">個人ウェブサイト</a>`}}const r=document.getElementById("sub-images");if(r){r.innerHTML="";const s=()=>{e.video_list&&e.video_list.length>0&&e.video_list.forEach(a=>{const c=a.toString().trim();let n=null,d=!1;const t=c.match(/(?:v=|shorts\/|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);if(t&&(d=c.includes("shorts/")||e.video_class&&e.video_class.includes("vertical"),n=`<iframe src="https://www.youtube.com/embed/${t[1]}" allowfullscreen></iframe>`),!n){const i=c.match(/vimeo\.com\/(?:video\/)?(\d+)/);i&&(d=e.link_type==="vimeo"||e.video_class&&e.video_class.includes("vertical"),n=`<iframe src="https://player.vimeo.com/video/${i[1]}" allowfullscreen></iframe>`)}if(!n){const i=c.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);i&&(n=`<iframe src="https://drive.google.com/file/d/${i[1]}/preview" allowfullscreen></iframe>`)}if(!n){const i=c.match(/instagram\.com\/(p|reel|tv)\/([a-zA-Z0-9_-]+)/);if(i){const m=`https://www.instagram.com/${i[1]}/${i[2]}/`;if(r.insertAdjacentHTML("beforeend",`
                <div class="content-item video-item vertical">
                  <blockquote class="instagram-media"
                    data-instgrm-permalink="${m}"
                    data-instgrm-version="14"
                    style="width:100%; max-width:360px;">
                  </blockquote>
                </div>
              `),document.getElementById("instagram-embed-script"))window.instgrm&&window.instgrm.Embeds.process();else{const g=document.createElement("script");g.id="instagram-embed-script",g.src="https://www.instagram.com/embed.js",g.async=!0,document.body.appendChild(g)}return}}if(n){const i=d?" vertical":"";r.insertAdjacentHTML("beforeend",`
              <div class="content-item video-item${i}">
                ${n}
              </div>`)}})},o=()=>{e.image_list&&e.image_list.length>0&&e.image_list.forEach((a,c)=>{if(c===0)return;const n=typeof a=="string"?a:a.path,d=typeof a=="object"&&a.layout?a.layout:null,t=typeof a=="object"&&a.width?a.width:null,i=d?` image-layout-${d}`:"",m=t?`style="width:${t}%"`:"";r.insertAdjacentHTML("beforeend",`
            <div class="content-item sub-image-item${i}">
              <img src="${n}" loading="lazy" decoding="async" ${m}
              onerror="this.style.background='#f9f9f9'; this.removeAttribute('src');">
            </div>`)})};if(e.video_to_last?(o(),s()):(s(),o()),e.link&&e.link_type==="pdf"){const a=e.link.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);a&&r.insertAdjacentHTML("beforeend",`
          <div class="content-item pdf-item">
            <iframe src="https://drive.google.com/file/d/${a[1]}/preview"
              style="width:100%; height:600px; border:none;">
            </iframe>
          </div>`)}}document.querySelectorAll(".tag-link").forEach(s=>{s.addEventListener("click",()=>{sessionStorage.removeItem("scrollY")})})}function M(e,f,y){const h=document.getElementById("recommend-list");if(!h)return;const p=`recommend_${e.school_number}`,u=sessionStorage.getItem(p);if(u){JSON.parse(u).forEach(i=>{h.insertAdjacentHTML("beforeend",`
        <div class="work-item">
          <a href="/work/${i.en_name}" class="work-item-link">
            <div class="work-thumbnail">
              <img src="${i.main_image}" alt="${i.title}" loading="lazy" decoding="async">
            </div>
            <div class="work-info">
              <span class="work-title">${i.title}</span>
              <span class="work-designer">${i.name}</span>
            </div>
          </a>
        </div>`)});return}const l=new Set([e.en_name]),r=[],s=parseInt(e.sort_number),o=f.length,a=s===1?o:s-1,c=s===o?1:s+1;[a,c].forEach(t=>{const i=f.find(m=>parseInt(m.sort_number)===t);i&&(r.push(i),l.add(i.en_name))});const n=f.filter(t=>!l.has(t.en_name)&&t.project===e.project);if(n.length>0){const t=n[Math.floor(Math.random()*n.length)];r.push(t),l.add(t.en_name)}if(e.materials&&e.materials.length>0){const t=e.materials[Math.floor(Math.random()*e.materials.length)].trim(),i=y.includes(t),m=f.filter(g=>l.has(g.en_name)?!1:g.materials.some(_=>{const v=_.trim();return i?v===t:!y.includes(v)}));if(m.length>0){const g=m[Math.floor(Math.random()*m.length)];r.push(g),l.add(g.en_name)}}for(;r.length<4;){const t=f.filter(m=>!l.has(m.en_name));if(t.length===0)break;const i=t[Math.floor(Math.random()*t.length)];r.push(i),l.add(i.en_name)}const d=r.map(t=>({en_name:t.en_name,main_image:t.main_image,title:t.title,name:t.name}));sessionStorage.setItem(p,JSON.stringify(d)),r.forEach(t=>{h.insertAdjacentHTML("beforeend",`
      <div class="work-item">
        <a href="/work/${t.en_name}" class="work-item-link">
          <div class="work-thumbnail">
            <img src="${t.main_image}" alt="${t.title}" loading="lazy" decoding="async">
          </div>
          <div class="work-info">
            <span class="work-title">${t.title}</span>
            <span class="work-designer">${t.name}</span>
          </div>
        </a>
      </div>`)})}document.addEventListener("DOMContentLoaded",b);
