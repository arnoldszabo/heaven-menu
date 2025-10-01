document.addEventListener("DOMContentLoaded",()=>{
  const tabs = document.querySelectorAll(".tab");
  const underline = document.querySelector(".tab-underline");
  const sections = [...document.querySelectorAll("section")];
  let currentHash = "";

// --- Performance: throttle scroll with rAF and fix underline position when tabs scroll ---
const tabsContainer = document.querySelector(".tabs");

function updateUnderlineFor(active){
  if(!active || !underline) return;
  const left = active.offsetLeft - tabsContainer.scrollLeft;
  underline.style.width = active.getBoundingClientRect().width + "px";
  underline.style.transform = `translateX(${left}px)`;
}

let ticking = false;
function onScrollTick(){
  const fromTop = window.scrollY + 120; // account for sticky tabs height
  let currentSection = sections[0];
  for(const sec of sections){
    if(sec.offsetTop <= fromTop) currentSection = sec;
    else break;
  }
  setActiveTab("#" + currentSection.id);
  ticking = false;
}

window.addEventListener("scroll",()=>{
  if(!ticking){
    window.requestAnimationFrame(onScrollTick);
    ticking = true;
  }
}, {passive:true});

// Reposition underline when the tabs list scrolls horizontally (e.g., user pans the carousel)
tabsContainer.addEventListener("scroll", ()=>{
  const active = tabsContainer.querySelector(".tab.active");
  updateUnderlineFor(active);
}, {passive:true});


  function setActiveTab(hash){
    if(hash === currentHash) return;
    currentHash = hash;
    tabs.forEach(t=>t.classList.remove("active"));
    const active = document.querySelector(`.tab[href="${hash}"]`);
    if(active){
      active.classList.add("active");
      updateUnderlineFor(active);
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
  updateUnderlineFor(document.querySelector('.tab.active'));

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
