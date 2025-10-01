document.addEventListener("DOMContentLoaded", function () {
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var sections = Array.prototype.slice.call(document.querySelectorAll("section"));
  var underline = document.querySelector(".tab-underline");
  var tabsBar = document.querySelector(".tabs");

  function getStickyOffset() {
    return (tabsBar && tabsBar.offsetHeight ? tabsBar.offsetHeight : 0) + 6;
  }

  function setUnderline(el) {
    if (!underline || !el) return;
    underline.style.width = el.offsetWidth + "px";
    underline.style.transform = "translateX(" + el.offsetLeft + "px)";
  }

  function setActiveByHash(hash) {
    for (var i = 0; i < tabs.length; i++) {
      var t = tabs[i];
      t.classList.toggle("active", t.getAttribute("href") === hash);
    }
    setUnderline(document.querySelector('.tab[href="' + hash + '"]'));
  }

  // Click pe tab
  for (var i = 0; i < tabs.length; i++) {
    (function(tab){
      tab.addEventListener("click", function(e){
        e.preventDefault();
        var id = tab.getAttribute("href").slice(1);
        var target = document.getElementById(id);
        if (!target) return;
        var y = target.getBoundingClientRect().top + window.pageYOffset - getStickyOffset();
        window.scrollTo({ top: y, behavior: "smooth" });
        setActiveByHash("#" + id);
        try { tab.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); } catch(e){}
      }, false);
    })(tabs[i]);
  }

  // Scroll tracking optimizat (RAF)
  var activeId = "";
  var ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function(){
      var fromTop = window.scrollY + getStickyOffset() + 1;
      var current = sections.length ? sections[0].id : "";
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].offsetTop <= fromTop) current = sections[i].id; else break;
      }
      if (current && current !== activeId) {
        activeId = current;
        setActiveByHash("#" + current);
      }
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  if (sections.length) setActiveByHash("#" + sections[0].id);

  // Fade-in: adaugă clasa .visible când intră în viewport (fallback: toate sunt vizibile implicit în CSS)
  var observer;
  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(function(entries){
      for (var i=0; i<entries.length; i++){
        if (entries[i].isIntersecting) entries[i].target.classList.add("visible");
      }
    }, { threshold: 0.1 });
    var els = document.querySelectorAll(".card, .big-card, .category-title");
    for (var j=0; j<els.length; j++){ observer.observe(els[j]); }
  }
});
