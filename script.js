// Mobile robustness + performance improvements
// - Reliable anchor scrolling on iOS (accounts for sticky header)
// - Smooth, low-jank underline updates
// - Carousel fixes (momentum, touch handling)
// - Passive listeners to avoid scroll blocking

document.addEventListener("DOMContentLoaded", () => {
  const tabs = Array.from(document.querySelectorAll(".tab"));
  const tabsContainer = document.querySelector(".tabs");
  const underline = document.querySelector(".tab-underline");
  const sections = Array.from(document.querySelectorAll("main section"));
  let currentHash = "";
  let ticking = false;

  // Compute and expose --tabs-height for CSS scroll-margin-top
  function updateTabsMetrics(){
    const h = Math.round(tabsContainer.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--tabs-height", h + "px");
  }
  updateTabsMetrics();
  window.addEventListener("resize", updateTabsMetrics, { passive: true });
  window.addEventListener("orientationchange", updateTabsMetrics, { passive: true });

  // Helper: position underline under visible active tab
  function moveUnderlineTo(el){
    if(!el) return;
    const width = el.getBoundingClientRect().width;
    const x = el.offsetLeft - tabsContainer.scrollLeft; // account for horizontal scroll
    underline.style.width = width + "px";
    underline.style.transform = `translateX(${Math.max(0, x)}px)`;
  }

  function setActiveTab(hash, {source="scroll"} = {}){
    if(hash === currentHash) return;
    currentHash = hash;
    tabs.forEach(t => t.classList.remove("active"));
    const active = document.querySelector(`.tab[href="${hash}"]`);
    if(active){
      active.classList.add("active");
      moveUnderlineTo(active);
      // Keep active tab in view; avoid smooth scrolling while main page is scrolling
      active.scrollIntoView({ behavior: source === "click" ? "smooth" : "auto", inline: "center", block: "nearest" });
    }
    // Update URL hash without jumping (for iOS correctness)
    if(source === "click" && history.replaceState){
      history.replaceState(null, "", hash);
    }
  }

  // Scroll spy (throttled via rAF to minimize jank)
  function onScroll(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const fromTop = window.scrollY + 100;
      let currentSection = sections[0];
      for (const sec of sections){
        if (sec.offsetTop <= fromTop) currentSection = sec;
      }
      setActiveTab("#" + currentSection.id, {source: "scroll"});
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  // Initial state
  setActiveTab("#" + (sections[0]?.id || ""), {source:"scroll"});

  // Smooth, offset-aware anchor scrolling for category tabs (fixes iOS jump)
  tabs.forEach(tab => {
    tab.addEventListener("click", (e) => {
      const hash = tab.getAttribute("href");
      const target = document.querySelector(hash);
      if(!target) return; // allow normal behavior if not found
      e.preventDefault(); // stop default jump
      const tabsHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--tabs-height")) || 56;
      const rect = target.getBoundingClientRect();
      const absoluteTop = rect.top + window.pageYOffset;
      const y = Math.max(0, absoluteTop - tabsHeight - 8);
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveTab(hash, {source:"click"});
    }, { passive: false });
  });

  // Keep underline in place while horizontally scrolling the carousel
  tabsContainer.addEventListener("scroll", () => {
    const active = document.querySelector(".tab.active");
    moveUnderlineTo(active);
  }, { passive: true });

  // Reveal animations via IntersectionObserver (unchanged)
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add("visible");
    });
  }, {threshold: 0.1});
  document.querySelectorAll(".card, .big-card, .category-title").forEach(el => observer.observe(el));

  // Lightbox behavior (unchanged)
  const lightboxes = document.querySelectorAll(".lightbox");
  const links = document.querySelectorAll(".card-link");
  links.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      if (target) target.classList.add("active");
    }, { passive: false });
  });
  lightboxes.forEach(lb => {
    lb.addEventListener("click", e => {
      if (e.target.hasAttribute("data-close") || e.target === lb) {
        lb.classList.remove("active");
      }
    }, { passive: true });
  });
});
