document.addEventListener("DOMContentLoaded",()=>{
  const tabs = document.querySelectorAll(".tab");
  const underline = document.querySelector(".tab-underline");
  const sections = [...document.querySelectorAll("section")];
  let currentHash = "";

// ---- Smooth vertical scrolling focus; keep carousel secondary ----
const isIOS = /iP(hone|ad|od)/.test(navigator.platform) || 
              (navigator.userAgent.includes('Mac') && 'ontouchend' in document);

const tabsEl = document.querySelector('.tabs');
const tabsHeight = () => (tabsEl ? tabsEl.getBoundingClientRect().height : 0);

function scrollToSectionId(id, smooth=true){
  const target = document.getElementById(id);
  if(!target) return;
  const y = target.getBoundingClientRect().top + window.pageYOffset - tabsHeight() - 8;
  const behavior = (smooth && !isIOS) ? 'smooth' : 'auto';
  window.scrollTo({ top: Math.max(0, y), behavior });
  if(history.replaceState){
    history.replaceState(null, '', '#' + id);
  } else {
    window.location.hash = id;
  }
}

function applyActive(hash){
  const links = document.querySelectorAll('.tab');
  links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === hash));
  const active = document.querySelector('.tab.active');
  if (active && underline){
    const left = active.offsetLeft - (tabsEl ? tabsEl.scrollLeft : 0);
    underline.style.width = active.getBoundingClientRect().width + 'px';
    underline.style.transform = `translateX(${left}px)`;
  }
}


  function setActiveTab(hash){
    if(hash === currentHash) return;
    currentHash = hash;
    tabs.forEach(t=>t.classList.remove("active"));
    const active = document.querySelector(`.tab[href="${hash}"]`);
    if(active){
      active.classList.add("active");
      const rect = active.getBoundingClientRect();
      underline.style.width = rect.width + "px";
      underline.style.transform = `translateX(${active.offsetLeft}px)`;
      active.scrollIntoView({behavior:"smooth",inline:"center"});
    }
  }

  window.addEventListener("scroll",()=>{
    const fromTop = window.scrollY + 100;
    let currentSection = sections[0];
    for(const sec of sections){
      if(sec.offsetTop <= fromTop){
        currentSection = sec;
      }
    }
    setActiveTab("#" + currentSection.id);
  });

  setActiveTab("#" + sections[0].id);

  const observer = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting) e.target.classList.add("visible");
    });
  },{threshold:0.1});
  document.querySelectorAll(".card, .big-card, .category-title").forEach(el=>observer.observe(el));

  const lightboxes = document.querySelectorAll(".lightbox");
  const links = document.querySelectorAll(".card-link");
  links.forEach(link=>{
    link.addEventListener("click",e=>{
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      if(target) target.classList.add("active");
    });
  });
  lightboxes.forEach(lb=>{
    lb.addEventListener("click",e=>{
      if(e.target.hasAttribute("data-close") || e.target === lb){
        lb.classList.remove("active");
      }
    });
  });
});


// Delegate clicks on .tab anchors
document.addEventListener('click', (e)=>{
  const a = e.target.closest('.tab');
  if(!a) return;
  const href = a.getAttribute('href');
  if(!href || !href.startsWith('#')) return;
  e.preventDefault();
  const id = href.slice(1);
  scrollToSectionId(id, true);
  applyActive('#' + id);
}, {passive:false});

if(tabsEl){ tabsEl.addEventListener('scroll', ()=>applyActive(currentHash||('#'+sections[0].id)), {passive:true}); }
