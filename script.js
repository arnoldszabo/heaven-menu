document.addEventListener("DOMContentLoaded",()=>{
  const tabs = document.querySelectorAll(".tab");
  const underline = document.querySelector(".tab-underline");
  const sections = [...document.querySelectorAll("section")];
  let currentHash = "";

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
