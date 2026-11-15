/* The Naples Guy: fade-in on scroll, count-up stats, fit quiz, lazy Leaflet map. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ---------- Fade-in on scroll ---------- */
  function fadeIn() {
    if (reduce || !hasIO) return;
    var sel = 'main section, body > section, body > .cards, body > div.wrap > section, .home-start-card, .home-wk-card, .ng-stat, .ng-fit-promo, .n-grid > *, .g-row-care > *, footer.lux .top > div';
    var vh = window.innerHeight || 800;
    var nodes = Array.prototype.slice.call(document.querySelectorAll(sel));
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('ng-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    var groups = new Map();
    nodes.forEach(function (el) {
      if (el.classList.contains('reveal') || el.closest('.reveal')) return;
      if (el.closest('.hero, .rehero, .has-slides, .ng-mbar, header.site, .util, .leaflet-container, [data-fit]')) return;
      if (el.matches('.hero, .has-slides')) return;
      var parentFade = el.parentElement && el.parentElement.closest('.ng-fade');
      if (parentFade && !el.matches('.home-start-card, .home-wk-card, .ng-stat, .n-grid > *, .g-row-care > *, footer.lux .top > div')) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 || r.height === 0) return; /* never hide what is already on screen */
      el.classList.add('ng-fade');
      var p = el.parentElement;
      var i = groups.get(p) || 0;
      groups.set(p, i + 1);
      if (i) el.style.transitionDelay = Math.min(i, 5) * 70 + 'ms';
      io.observe(el);
    });
  }

  /* ---------- Count-up stats ---------- */
  function countUp() {
    var els = document.querySelectorAll('[data-countup]');
    if (!els.length) return;
    function run(el) {
      var to = parseInt(el.getAttribute('data-countup'), 10) || 0;
      if (reduce || to <= 0) { el.textContent = to; return; }
      var dur = 1400, t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * eased);
        if (p < 1) requestAnimationFrame(step);
      }
      el.textContent = '0';
      requestAnimationFrame(step);
    }
    if (!hasIO) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  }

  /* ---------- Find the right fit quiz ---------- */
  function quiz() {
    var root = document.querySelector('[data-fit]');
    if (!root) return;
    var form = root.querySelector('[data-fit-form]');
    var qs = Array.prototype.slice.call(root.querySelectorAll('[data-fit-q]'));
    var next = root.querySelector('[data-fit-next]');
    var back = root.querySelector('[data-fit-back]');
    var stepEl = root.querySelector('[data-fit-step]');
    var bar = root.querySelector('[data-fit-bar]');
    var result = root.querySelector('[data-fit-result]');
    var recs = root.querySelector('[data-fit-recs]');
    var summary = root.querySelector('[data-fit-summary]');
    var title = root.querySelector('[data-fit-title]');
    var lib = root.querySelector('.ng-fit-lib');
    var cur = 0, total = qs.length;

    function val(name) {
      var c = form.querySelector('input[name="' + name + '"]:checked');
      return c ? c.value : '';
    }
    function show(i) {
      cur = i;
      qs.forEach(function (q, j) { q.hidden = j !== i; });
      back.hidden = i === 0;
      next.textContent = i === total - 1 ? 'See my guides' : 'Next';
      next.disabled = !qs[i].querySelector('input:checked');
      stepEl.textContent = 'Question ' + (i + 1) + ' of ' + total;
      bar.style.width = ((i) / total * 100) + '%';
    }
    form.addEventListener('change', function () {
      next.disabled = !qs[cur].querySelector('input:checked');
    });
    next.addEventListener('click', function () {
      if (cur < total - 1) {
        show(cur + 1);
        var first = qs[cur].querySelector('input');
        if (first) first.focus({ preventScroll: true });
      } else {
        finish();
      }
    });
    back.addEventListener('click', function () { if (cur > 0) show(cur - 1); });
    root.querySelector('[data-fit-restart]').addEventListener('click', function () {
      form.reset();
      result.hidden = true;
      form.hidden = false;
      show(0);
      root.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });

    function finish() {
      var who = val('who'), help = val('help'), mem = val('memory'), where = val('where'), when = val('when');
      var keys = [];
      function add(k) { if (keys.indexOf(k) === -1) keys.push(k); }
      var main = '';
      if (mem === 'yes') { main = 'Memory Care'; add('memory'); }
      if (help === 'nursing') { if (!main) main = 'Skilled Nursing & Rehab'; add('snf'); if (when === 'now') add('discharge'); }
      if (where === 'home') { if (!main) main = 'Home Care'; add('home'); add('home-vs'); }
      if (help === 'daily') { if (!main) main = 'Assisted Living'; add('assisted'); }
      if (help === 'little') { if (!main) main = 'Independent Living'; add('independent'); }
      if (mem === 'some') add('memory-signs');
      if (where && where !== 'home' && where !== 'unsure') add('town-' + where);
      if (where !== 'home') add('directory');
      if (when === 'now') add('placement');
      add('cost');
      if (when === 'later' || when === 'soon') add('paying');
      if (where === 'home' && who !== 'self') add('respite');
      if ((who === 'parent') && where !== 'home') add('parent-move');
      keys = keys.slice(0, 6);

      recs.innerHTML = '';
      keys.forEach(function (k) {
        var li = lib.querySelector('[data-fit-guide="' + k + '"]');
        if (li) recs.appendChild(li.cloneNode(true));
      });
      var whoTxt = { parent: 'your loved one', spouse: 'your spouse or partner', self: 'you', other: 'the person you are helping' }[who] || 'your family';
      title.innerHTML = main ? 'Start with <em>' + main.replace(/&/g, '&amp;') + '</em>' : 'Guides that fit';
      var whenTxt = { now: 'Since help is needed right away, a quick call with Jeff is the fastest next step.', soon: 'With a few months to plan, the guides below are a good place to compare options and costs.', later: 'Planning ahead gives you time to read, compare costs, and tour.' }[when] || '';
      summary.textContent = 'Based on your answers, these Naples guides are the best fit for ' + whoTxt + '. ' + whenTxt;
      form.hidden = true;
      result.hidden = false;
      bar.style.width = '100%';
      result.focus({ preventScroll: true });
      root.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
    show(0);
  }

  /* ---------- Lazy Leaflet map ---------- */
  var leafletPromise = null;
  function loadLeaflet() {
    if (window.L) return Promise.resolve();
    if (leafletPromise) return leafletPromise;
    leafletPromise = new Promise(function (res, rej) {
      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';
      css.crossOrigin = '';
      document.head.appendChild(css);
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';
      s.async = true;
      s.onload = function () { res(); };
      s.onerror = rej;
      document.head.appendChild(s);
    });
    return leafletPromise;
  }
  function esc(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
  function buildMap(el) {
    var pts;
    try { pts = JSON.parse(el.getAttribute('data-ng-map') || '[]'); } catch (e) { return; }
    if (!pts.length) return;
    loadLeaflet().then(function () {
      var L = window.L;
      var map = L.map(el, { scrollWheelZoom: false, tap: true, attributionControl: true });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
      }).addTo(map);
      var bounds = [];
      pts.forEach(function (p) {
        var icon = L.divIcon({ className: 'ng-pin-wrap', html: '<span class="ng-pin"></span><span class="ng-pin-lbl">' + esc(p.name) + '</span>', iconSize: [18, 18], iconAnchor: [9, 9], popupAnchor: [0, -10] });
        var m = L.marker([p.lat, p.lng], { icon: icon, title: p.name, keyboard: true }).addTo(map);
        var sub = p.guide && p.guide !== p.name ? '<span class="ng-pop-sub">' + esc(p.guide) + ' guide</span>' : '';
        m.bindPopup('<a class="ng-pop" href="' + esc(p.url) + '"><strong>' + esc(p.name) + '</strong>' + sub + '<span class="ng-pop-go">Open the guide →</span></a>');
        bounds.push([p.lat, p.lng]);
      });
      map.fitBounds(bounds, { padding: [28, 28] });
      el.classList.add('ready');
    }).catch(function () { el.classList.add('failed'); });
  }
  function maps() {
    var els = document.querySelectorAll('[data-ng-map]');
    if (!els.length) return;
    if (!hasIO) { Array.prototype.forEach.call(els, buildMap); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { buildMap(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '300px 0px' });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  }

  function init() { fadeIn(); countUp(); quiz(); maps(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
