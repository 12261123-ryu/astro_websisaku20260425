async function _(){const f=new URLSearchParams(window.location.search).get("p");if(f)try{const[p,h]=await Promise.all([fetch("/work.json"),fetch("/project.json")]),u=await p.json(),c=(await h.json()).filter_keywords.map(i=>i.id),s=u.find(i=>i.en_name&&i.en_name.trim()===f.trim());if(s){document.title=`${s.title} / 統合デザイン学科卒業・修了制作展2026 / web図録`,$(s,c),M(s,u,c),window.updateTubuColors&&window.updateTubuColors(s.project);const i=JSON.parse(sessionStorage.getItem("visitedWorks")||"[]");if(!i.includes(s.en_name)){i.push(s.en_name),sessionStorage.setItem("visitedWorks",JSON.stringify(i));const r=parseInt(sessionStorage.getItem("visitPlus")||"0");r<5&&(sessionStorage.setItem("visitPlus",String(r+1)),window.syncTubuCount&&window.syncTubuCount())}const l=sessionStorage.getItem("lastFilter"),m=document.querySelector(".return-to-Top a");m&&l&&(m.href=`/?filter=${l}`)}else{const i=document.querySelector(".main-window");i&&(i.innerHTML='<p style="padding: 40px; color: #888;">作品が見つかりませんでした。<a href="/">一覧に戻る</a></p>')}}catch(p){console.error("エラー:",p)}}function $(e,f=[]){const p=e.image_list&&e.image_list.length>0?e.image_list[0]:e.main_image;document.getElementById("main-visual").innerHTML=`<img src="${p}" style="width:100%; height:auto;" decoding="async" alt="" onerror="this.style.background='#f9f9f9'; this.removeAttribute('src'); this.style.display='block'; this.style.width='100%';">`,document.getElementById("work-title").innerText=e.title,document.getElementById("work-designer").innerText=e.name,document.getElementById("work-concept").innerText=e.concept;const h=document.getElementById("work-project");if(e.project==="M"){const c=e.Master_project?`（${e.Master_project}）`:"";h.innerHTML=`<a href="/?filter=M" class="tag-link">#大学院${c}</a>`}else h.innerHTML=`<a href="/?filter=${e.project}" class="tag-link">#${e.project}プロジェクト</a>`;const u=document.getElementById("work-materials");if(u&&e.materials&&Array.isArray(e.materials)){const c=[],s=[];e.materials.forEach(r=>{const a=r.trim();if(!a)return;const o=a.replace(/（.*）|\(.*\)/,"").trim();f.includes(o)?c.push(`<a href="/?filter=${o}" class="tag-link">#${a}</a>`):s.push(a)});let i=[];c.length>0&&i.push(c.join("、")),s.length>0&&i.push(`<a href="/?filter=その他" class="tag-link">#その他（${s.join("、")}）</a>`),u.innerHTML=i.join("、");const l=document.getElementById("work-contact-area"),m=document.getElementById("work-contact");if(e.contact&&e.contact.type&&e.contact.id){const r=e.contact.type.toLowerCase().trim();let a=e.contact.id.toString().trim(),o="",t="";if(r==="instagram"){const n=a.replace("@","");o=`https://www.instagram.com/${n}/`,t=`Instagram @${n}`}else if(r==="x"||r==="twitter"){const n=a.replace("@","");o=`https://x.com/${n}/`,t=`X @${n}`}else if(r==="email"){const n=a.includes("@")?a:`${a}@gmail.com`;o=`mailto:${n}`,t=n}o&&l&&(l.style.display="flex",m.innerHTML=`<a href="${o}" target="_blank" rel="noopener noreferrer">${t}</a>`)}else l&&(l.style.display="none");if(e.link&&e.link_type==="web"){const r=document.getElementById("work-contact-area"),a=document.getElementById("work-contact");if(r&&a){r.style.display="flex";const t=a.innerHTML?"<br>":"";a.innerHTML+=`${t}<a href="${e.link}" target="_blank" rel="noopener noreferrer">個人ウェブサイト</a>`}}}const g=document.getElementById("sub-images");if(g){g.innerHTML="";const c=()=>{e.video_list&&e.video_list.length>0&&e.video_list.forEach(i=>{const l=i.toString().trim();let m=null,r=!1;const a=l.match(/(?:v=|shorts\/|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);if(a&&(r=l.includes("shorts/")||e.video_class&&e.video_class.includes("vertical"),m=`<iframe src="https://www.youtube.com/embed/${a[1]}" allowfullscreen></iframe>`),!m){const o=l.match(/vimeo\.com\/(?:video\/)?(\d+)/);o&&(r=e.link_type==="vimeo"||e.video_class&&e.video_class.includes("vertical"),m=`<iframe src="https://player.vimeo.com/video/${o[1]}" allowfullscreen></iframe>`)}if(!m){const o=l.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);o&&(m=`<iframe src="https://drive.google.com/file/d/${o[1]}/preview" allowfullscreen></iframe>`)}if(!m){const o=l.match(/instagram\.com\/(p|reel|tv)\/([a-zA-Z0-9_-]+)/);if(o){const t=`https://www.instagram.com/${o[1]}/${o[2]}/`;if(g.insertAdjacentHTML("beforeend",`
          <div class="content-item video-item vertical">
            <blockquote class="instagram-media" 
              data-instgrm-permalink="${t}"
              data-instgrm-version="14"
              style="width:100%; max-width:360px;">
            </blockquote>
          </div>
        `),document.getElementById("instagram-embed-script"))window.instgrm&&window.instgrm.Embeds.process();else{const n=document.createElement("script");n.id="instagram-embed-script",n.src="https://www.instagram.com/embed.js",n.async=!0,document.body.appendChild(n)}return}}if(m){const t=`
          <div class="content-item video-item${r?" vertical":""}">
            ${m}
          </div>`;g.insertAdjacentHTML("beforeend",t)}})},s=()=>{e.image_list&&e.image_list.length>0&&e.image_list.forEach((i,l)=>{if(l===0)return;const m=typeof i=="string"?i:i.path,r=typeof i=="object"&&i.layout?i.layout:null,a=typeof i=="object"&&i.width?i.width:null,o=r?` image-layout-${r}`:"",t=a?`style="width:${a}%"`:"",n=`
        <div class="content-item sub-image-item${o}">
          <img src="${m}" loading="lazy" decoding="async" ${t}
          onerror="this.style.background='#f9f9f9'; this.removeAttribute('src');">
        </div>`;g.insertAdjacentHTML("beforeend",n)})};e.video_to_last?(s(),c()):(c(),s())}if(e.link&&e.link_type==="pdf"){const c=e.link.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);if(c){const s=`
      <div class="content-item pdf-item">
        <iframe src="https://drive.google.com/file/d/${c[1]}/preview" 
          style="width:100%; height:600px; border:none;">
        </iframe>
      </div>`;g.insertAdjacentHTML("beforeend",s)}}}function M(e,f,p){const h=document.getElementById("recommend-list");if(!h)return;const u=`recommend_${e.school_number}`,g=sessionStorage.getItem(u);if(g){JSON.parse(g).forEach(n=>{const d=`
        <div class="work-item">
          <a href="/work?p=${n.en_name}" class="work-item-link">
            <div class="work-thumbnail">
              <img src="${n.main_image}" alt="${n.title}" loading="lazy" decoding="async">
            </div>
            <div class="work-info">
              <span class="work-title">${n.title}</span>
              <span class="work-designer">${n.name}</span>
            </div>
          </a>
        </div>`;h.insertAdjacentHTML("beforeend",d)});return}const c=new Set([e.en_name]),s=[],i=parseInt(e.sort_number),l=f.length,m=i===1?l:i-1,r=i===l?1:i+1;[m,r].forEach(t=>{const n=f.find(d=>parseInt(d.sort_number)===t);n&&(n.recLabel="",s.push(n),c.add(n.en_name))});const a=f.filter(t=>!c.has(t.en_name)&&t.project===e.project);if(a.length>0){const t=a[Math.floor(Math.random()*a.length)];t.recLabel=t.project==="M"?"(大学院)":`(${t.project}プロジェクト)`,s.push(t),c.add(t.en_name)}if(e.materials&&e.materials.length>0){const t=e.materials[Math.floor(Math.random()*e.materials.length)].trim(),n=p.includes(t),d=f.filter(y=>c.has(y.en_name)?!1:y.materials.some(v=>{const b=v.trim();return n?b===t:!p.includes(b)}));if(d.length>0){const y=d[Math.floor(Math.random()*d.length)],v=n?t:"その他";y.recLabel=`(素材：${v})`,s.push(y),c.add(y.en_name)}}for(;s.length<4;){const t=f.filter(d=>!c.has(d.en_name));if(t.length===0)break;const n=t[Math.floor(Math.random()*t.length)];n.recLabel="",s.push(n),c.add(n.en_name)}const o=s.map(t=>({en_name:t.en_name,main_image:t.main_image,title:t.title,name:t.name}));sessionStorage.setItem(u,JSON.stringify(o)),s.forEach(t=>{const d=`
      <div class="work-item">
        <a href="/work?p=${t.en_name}" class="work-item-link">
          <div class="work-thumbnail">
            <img src="${t.main_image}" alt="${t.title}" loading="lazy" decoding="async">
          </div>
          <div class="work-info">
            <span class="work-title">${t.title}</span>
            <span class="work-designer">${t.name}</span>
            
          </div>
        </a>
      </div>`;h.insertAdjacentHTML("beforeend",d)})}document.addEventListener("DOMContentLoaded",_);
