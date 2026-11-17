(function () {
  var mapEl = document.getElementById('dir-map');
  var grid = document.getElementById('dir-grid');
  if (!grid) return;
  var cards = [].slice.call(grid.querySelectorAll('.sc-dir-card'));
  var chips = [].slice.call(document.querySelectorAll('[data-dir-chip]'));
  var qInput = document.querySelector('[data-dir-q]');
  var countEl = document.querySelector('[data-dir-count]');
  var empty = document.getElementById('dir-empty');
  var moreBtn = document.getElementById('dir-more');
  var moreWrap = document.getElementById('dir-more-wrap');
  var PAGE = 16;
  var shown = PAGE;
  var tag = '';
  var q = '';
  var markers = [];
  var leafletMap = null;

  function cardMatch(card) {
    var tags = (card.getAttribute('data-tags') || '').split(',');
    if (tag && tags.indexOf(tag) === -1) return false;
    if (q && (card.getAttribute('data-search') || '').indexOf(q) === -1) return false;
    return true;
  }

  function apply() {
    var matched = cards.filter(cardMatch);
    var visible = 0;
    cards.forEach(function (card) {
      var ok = cardMatch(card);
      if (!ok) {
        card.hidden = true;
        card.classList.add('is-beyond');
        return;
      }
      if (visible < shown) {
        card.hidden = false;
        card.classList.remove('is-beyond');
        visible++;
      } else {
        card.hidden = false;
        card.classList.add('is-beyond');
      }
    });
    if (countEl) {
      var total = cards.length;
      if (!tag && !q) countEl.textContent = 'Showing ' + visible + ' of ' + total + ' licensed communities.';
      else countEl.textContent = 'Showing ' + visible + ' of ' + matched.length + ' matches (' + total + ' in the full list).';
    }
    if (empty) empty.hidden = matched.length > 0;
    if (moreWrap && moreBtn) {
      if (matched.length > shown) {
        moreWrap.hidden = false;
        moreBtn.textContent = 'Show more (' + (matched.length - shown) + ' left)';
      } else {
        moreWrap.hidden = true;
      }
    }
    syncMap(matched);
  }

  function pinClass(tags) {
    if (tags.indexOf('Memory Care') !== -1) return 'mem';
    if (tags.indexOf('Nursing') !== -1) return 'nurse';
    if (tags.indexOf('Independent') !== -1) return 'ind';
    if (tags.indexOf('Adult Day') !== -1) return 'day';
    return 'al';
  }

  function loadLeaflet() {
    if (window.L) return Promise.resolve();
    return new Promise(function (res, rej) {
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
  }

  function esc(t) {
    var d = document.createElement('div');
    d.textContent = t || '';
    return d.innerHTML;
  }

  function buildMap() {
    if (!mapEl) return;
    var pts;
    try { pts = JSON.parse(mapEl.getAttribute('data-ng-dir-map') || '[]'); } catch (e) { return; }
    if (!pts.length) return;
    loadLeaflet().then(function () {
      var L = window.L;
      leafletMap = L.map(mapEl, { scrollWheelZoom: false, tap: true, attributionControl: true });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
      }).addTo(leafletMap);
      var bounds = [];
      pts.forEach(function (p) {
        var kind = pinClass(p.tags || []);
        var icon = L.divIcon({
          className: 'ng-pin-wrap sc-dir-pin-' + kind,
          html: '<span class="ng-pin sc-dir-pin"></span>',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
          popupAnchor: [0, -10]
        });
        var m = L.marker([p.lat, p.lng], { icon: icon, title: p.name, keyboard: true }).addTo(leafletMap);
        var tagLine = (p.tags || []).join(' · ');
        m.bindPopup('<a class="ng-pop" href="' + esc(p.url) + '"><strong>' + esc(p.name) + '</strong><span class="ng-pop-sub">' + esc(tagLine || p.city || '') + '</span><span class="ng-pop-go">Open details →</span></a>');
        m._ngSlug = p.slug;
        m._ngTags = p.tags || [];
        markers.push(m);
        bounds.push([p.lat, p.lng]);
      });
      if (bounds.length) {
        leafletMap.fitBounds(bounds, { padding: [18, 18] });
      }
      mapEl.classList.add('ready');
      apply();
    }).catch(function () { mapEl.classList.add('failed'); });
  }

  function syncMap(matched) {
    if (!markers.length) return;
    var slugs = {};
    matched.forEach(function (card) { slugs[card.getAttribute('data-slug')] = true; });
    var bounds = [];
    markers.forEach(function (m) {
      var on = !tag && !q ? true : !!slugs[m._ngSlug];
      if (on) {
        if (!leafletMap.hasLayer(m)) m.addTo(leafletMap);
        var ll = m.getLatLng();
        bounds.push([ll.lat, ll.lng]);
      } else if (leafletMap.hasLayer(m)) {
        leafletMap.removeLayer(m);
      }
    });
    if (leafletMap && bounds.length) {
      try { leafletMap.fitBounds(bounds, { padding: [18, 18], maxZoom: 14 }); } catch (e) {}
    }
  }

  chips.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tag = btn.getAttribute('data-dir-chip') || '';
      shown = PAGE;
      chips.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      apply();
    });
  });
  if (qInput) {
    qInput.addEventListener('input', function () {
      q = (qInput.value || '').trim().toLowerCase();
      shown = PAGE;
      apply();
    });
  }
  if (moreBtn) {
    moreBtn.addEventListener('click', function () {
      shown += PAGE;
      apply();
    });
  }

  // Honor ?tag= or ?type= or ?memory=1 from older links
  (function initFromQuery() {
    var p = new URLSearchParams(window.location.search);
    var t = p.get('tag') || '';
    if (!t && p.get('memory') === '1') t = 'Memory Care';
    var type = p.get('type') || '';
    if (!t && type) {
      if (type.indexOf('Assisted') === 0) t = 'Assisted';
      else if (type.indexOf('Independent') === 0 || type.indexOf('Life Plan') !== -1) t = 'Independent';
      else if (type.indexOf('Nursing') === 0) t = 'Nursing';
      else if (type.indexOf('Adult Day') === 0) t = 'Adult Day';
    }
    if (t) {
      var match = chips.filter(function (b) { return b.getAttribute('data-dir-chip') === t; })[0];
      if (match) match.click();
    }
    if (p.get('q') && qInput) {
      qInput.value = p.get('q');
      q = p.get('q').trim().toLowerCase();
    }
  })();

  apply();
  if (mapEl) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { buildMap(); io.disconnect(); } });
      }, { rootMargin: '300px 0px' });
      io.observe(mapEl);
    } else {
      buildMap();
    }
  }
})();
