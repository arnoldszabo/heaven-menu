(() => {
  'use strict';
  const config = window.HEAVEN_BLACK_FRIDAY || {};
  const preview = config.BLACK_FRIDAY_PREVIEW === true && new URLSearchParams(location.search).get('bf') === 'preview';
  const parseDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\+02:00|\+03:00)$/.test(value) ? Date.parse(value) : NaN;
  const start = parseDate(config.BLACK_FRIDAY_START), end = parseDate(config.BLACK_FRIDAY_END);
  // Explicit offsets are checked against Europe/Bucharest, including DST.
  function validBucharest(value, stamp) {
    if (!Number.isFinite(stamp)) return false;
    const parts = new Intl.DateTimeFormat('sv-SE', {timeZone:'Europe/Bucharest', year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(new Date(stamp)).replace(' ', 'T');
    return parts === value.slice(0,19);
  }
  const scheduled = config.BLACK_FRIDAY_ENABLED === true && start < end && validBucharest(config.BLACK_FRIDAY_START,start) && validBucharest(config.BLACK_FRIDAY_END,end);
  const immediate = config.BLACK_FRIDAY_ENABLED === true && config.BLACK_FRIDAY_START === null && config.BLACK_FRIDAY_END === null;
  const mode = () => preview ? 'PREVIEW' : immediate || (scheduled && Date.now() >= start && Date.now() < end) ? 'LIVE' : 'NORMAL';
  let current = mode();
  document.documentElement.classList.toggle('bf-active',current !== 'NORMAL');
  const originals = new Map();
  const fmt = cents => (cents / 100).toFixed(2).replace('.', ',');
  let ready = false;
  function render() {
    if (!ready) return;
    const active = current !== 'NORMAL';
    document.documentElement.classList.toggle('bf-active', active);
    document.querySelectorAll('[data-bf-promo]').forEach(el => el.hidden = !active);
    for (const [el, data] of originals) {
      el.replaceChildren();
      if (!active) { el.innerHTML = data.html; continue; }
      const old = document.createElement('del'); old.className = 'bf-old'; old.textContent = data.text;
      const sale = document.createElement('strong'); sale.className = 'bf-sale'; sale.textContent = data.cents.map(n => fmt(Math.round(n * 80 / 100))).join(' / ') + ' RON';
      const badge = document.createElement('span'); badge.className = 'bf-badge'; badge.textContent = '−20%';
      el.append(old, sale, badge);
    }
    document.querySelectorAll('a[data-bf-link]').forEach(a => {
      a.setAttribute('href', a.dataset.bfLink + (preview ? '?bf=preview' : ''));
    });
  }
  function init() {
    ready = true;
    document.querySelectorAll('.price').forEach(el => {
      const text = el.textContent.trim();
      if (!text) return;
      if (!/^\d+(?:[.,]\d{1,2})?(?:\s*\/\s*\d+(?:[.,]\d{1,2})?)*\s+RON$/.test(text)) { console.warn('Black Friday: ambiguous price', text); return; }
      const cents = text.replace(/\s*RON$/, '').split('/').map(v => Math.round(Number(v.trim().replace(',', '.')) * 100));
      originals.set(el, {html:el.innerHTML, text, cents});
    });
    const en = document.documentElement.lang === 'en';
    const bar = document.createElement('div'); bar.className = 'bf-bar'; bar.dataset.bfPromo = '';
    bar.textContent = (preview ? 'PREVIEW · ' : '') + (en ? 'BLACK FRIDAY • −20% ON THE ENTIRE MENU' : 'BLACK FRIDAY • −20% LA TOATE PRODUSELE');
    const hero = document.createElement('section'); hero.className = 'bf-hero'; hero.dataset.bfPromo = '';
    const home = !document.querySelector('.container');
    hero.innerHTML = `<div class="bf-hero-inner"><p class="bf-eyebrow">HEAVEN ZALĂU / SPECIAL EDITION 2026</p><h2>BLACK FRIDAY<br><span>HEAVEN</span></h2><p class="bf-discount">−20% <span>${en ? 'ON THE ENTIRE MENU' : 'LA TOT MENIUL'}</span></p><p class="bf-copy">${en ? 'Your favourite dishes and drinks, now with 20% off.' : 'Preparatele și băuturile tale preferate, acum cu 20% reducere.'}</p><p class="bf-footnote">${en ? 'All dishes. All drinks. The same Heaven.' : 'Toate preparatele. Toate băuturile. Același Heaven.'}</p></div><div class="bf-art" aria-hidden="true"><span>20</span><small>% OFF</small></div>`;
    document.body.prepend(bar);
    const existing = document.querySelector('.hero');
    if (existing) existing.after(hero); else document.body.insertBefore(hero, document.querySelector('main'));
    const menu = document.querySelector('.container'); if (menu) { const anchor=document.createElement('div'); anchor.id='bf-menu'; menu.before(anchor); }
    document.querySelectorAll('a[href]').forEach(a => { const href=a.getAttribute('href'); if (/^(?:\.\/)?(?:meniu|menu-en)\.html$/.test(href)) a.dataset.bfLink=href; });
    render();
    document.documentElement.classList.add('bf-ready');
    setInterval(() => { const next = mode(); if (next !== current) {current=next;render();} }, 1000);
    document.addEventListener('visibilitychange', () => {current=mode();render();});
    window.HEAVEN_BF_STATUS = () => ({mode:current, prices:originals.size, timeZone:'Europe/Bucharest'});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
