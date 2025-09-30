// v4: Lightbox that preserves scroll, visible category 'card', and low-end perf tweaks
(function(){
  const onReady = (fn) => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') fn();
    else document.addEventListener('DOMContentLoaded', fn, { once:true });
  };

  onReady(() => {
    const tabs = Array.from(document.querySelectorAll('.tab'));
    const tabsContainer = document.querySelector('.tabs');
    const underline = document.querySelector('.tab-underline');
    const sections = Array.from(document.querySelectorAll('main section[id], .section[id]'));
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-img') : null;
    let currentHash = '';
    let lowEnd = false;
    let lockedScrollY = 0;

    // Detect low-end
    try {
      const dm = navigator.deviceMemory || 0;
      const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      lowEnd = reduced || (dm && dm <= 3);
    } catch(e){}
    if (lowEnd) document.body.classList.add('low-end');

    // Tabs height -> CSS var
    function updateTabsMetrics(){
      if (!tabsContainer) return;
      const h = Math.round(tabsContainer.getBoundingClientRect().height || 56);
      document.documentElement.style.setProperty('--tabs-height', h + 'px');
    }
    updateTabsMetrics();
    window.addEventListener('resize', updateTabsMetrics, { passive:true });
    window.addEventListener('orientationchange', updateTabsMetrics, { passive:true });

    // Underline
    function moveUnderlineTo(el, animate=true){
      if (!underline || !tabsContainer || !el) return;
      const width = el.getBoundingClientRect().width;
      const x = el.offsetLeft - tabsContainer.scrollLeft;
      if (!animate || lowEnd) {
        const old = underline.style.transition;
        underline.style.transition = 'none';
        requestAnimationFrame(() => {
          underline.style.width = width + 'px';
          underline.style.transform = `translateX(${Math.max(0, x)}px)`;
          underline.style.transition = old;
        });
      } else {
        underline.style.width = width + 'px';
        underline.style.transform = `translateX(${Math.max(0, x)}px)`;
      }
    }

    function setActiveTab(hash, {source='scroll'} = {}){
      if (!hash || hash === currentHash) return;
      currentHash = hash;
      tabs.forEach(t => t.classList.remove('active'));
      const active = document.querySelector(`.tab[href="${hash}"]`);
      if (active) {
        active.classList.add('active');
        moveUnderlineTo(active, source === 'click');
        if (source === 'click') {
          const targetLeft = active.offsetLeft - (tabsContainer.clientWidth/2 - active.offsetWidth/2);
          tabsContainer.scrollTo({ left: Math.max(0, targetLeft), behavior: lowEnd ? 'auto' : 'smooth' });
        }
      }
      if (source === 'click' && history.replaceState) {
        history.replaceState(null, '', hash);
      }
    }

    // Anchor click: offset-aware smooth scroll
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const hash = tab.getAttribute('href');
        const target = hash ? document.querySelector(hash) : null;
        if (!target) return;
        e.preventDefault();
        const tabsHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--tabs-height')) || 56;
        const rect = target.getBoundingClientRect();
        const y = Math.max(0, rect.top + window.pageYOffset - tabsHeight - 8);
        window.scrollTo({ top: y, behavior: lowEnd ? 'auto' : 'smooth' });
        setActiveTab(hash, { source:'click' });
      }, { passive:false });
    });

    if (tabsContainer) {
      tabsContainer.addEventListener('scroll', () => {
        moveUnderlineTo(document.querySelector('.tab.active'), false);
      }, { passive:true });
    }

    // Section tracking via IntersectionObserver
    if (sections.length) {
      const vis = new Map();
      let lastId = sections[0].id;
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const id = entry.target.id;
          if (entry.isIntersecting) vis.set(id, entry.intersectionRatio);
          else vis.delete(id);
        });
        if (vis.size) {
          const best = Array.from(vis.entries()).sort((a,b) => b[1]-a[1])[0];
          if (best && best[0] !== lastId) {
            lastId = best[0];
            setActiveTab('#'+lastId, { source:'scroll' });
          }
        }
      }, { root:null, rootMargin:'-45% 0px -50% 0px', threshold:[0,.1,.25,.5,.75,1] });
      sections.forEach(sec => io.observe(sec));
      setActiveTab('#'+lastId, { source:'scroll' });
    }

    // ===== Lightbox that preserves scroll position =====
    function lockScroll(){
      lockedScrollY = window.pageYOffset;
      document.body.style.top = `-${lockedScrollY}px`;
      document.body.classList.add('no-scroll');
    }
    function unlockScroll(){
      document.body.classList.remove('no-scroll');
      document.body.style.top = '';
      window.scrollTo(0, lockedScrollY || 0);
    }
    function openLightbox(src, alt){
      if (!lightbox || !lightboxImg || !src) return;
      lightboxImg.src = src;
      lightboxImg.alt = alt || 'Imagine mărită';
      lockScroll();
      lightbox.classList.add('active');
    }
    function closeLightbox(){
      if (!lightbox) return;
      lightbox.classList.remove('active');
      // Clear src after transition to free memory
      setTimeout(() => { if (lightboxImg) lightboxImg.removeAttribute('src'); }, 200);
      unlockScroll();
    }

    // Delegated click: open lightbox when clicking a card image or the card itself
    document.addEventListener('click', (e) => {
      // Already clicking on close
      if (e.target && e.target.hasAttribute('data-close')) {
        closeLightbox();
        return;
      }
      // Click outside image on overlay closes it
      if (lightbox && lightbox.classList.contains('active') && e.target === lightbox){
        closeLightbox();
        return;
      }
      // Open if clicked img inside a .card or .card-link
      const img = e.target.closest && e.target.closest('.card')?.querySelector('.card-img')
                || (e.target.matches && e.target.matches('.card-img') ? e.target : null);
      if (img) {
        e.preventDefault();
        const largeSrc = img.getAttribute('data-large') || img.getAttribute('src');
        const alt = img.getAttribute('alt') || 'Imagine produs';
        openLightbox(largeSrc, alt);
      }
    }, { passive:false });

    // ESC to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) closeLightbox();
    }, { passive:true });

    // Lazy-load images except hero
    (function lazyImages(){
      const imgs = Array.from(document.querySelectorAll('img'));
      imgs.forEach(img => {
        if (!img.closest('.hero')) {
          img.setAttribute('loading','lazy');
          img.setAttribute('decoding','async');
        }
      });
    })();

  });
})();