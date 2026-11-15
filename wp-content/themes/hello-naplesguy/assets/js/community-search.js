/* Client-side community and neighborhood search — works on the static preview. */
(function () {
  function norm(s) {
    return (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }
  function parseData(el) {
    if (!el) return [];
    try { return JSON.parse(el.textContent || '[]'); } catch (e) { return []; }
  }
  function hide(el, on) {
    if (el) el.hidden = !!on;
  }

  function bindCommunitySearch() {
    var root = document.querySelector('.comm-find');
    if (!root) return;
    var input = root.querySelector('#comm-hub-q');
    var results = root.querySelector('[data-comm-results], #comm-results');
    var countEl = root.querySelector('[data-comm-count]');
    var emptyEl = root.querySelector('[data-comm-empty]');
    var data = parseData(document.getElementById('ng-comm-data'));
    if (!input || !results || !data.length) return;
    var LIMIT = 40;

    function row(item) {
      var a = document.createElement('a');
      a.className = 'crow';
      a.href = item.url;
      var h = document.createElement('h4');
      h.textContent = item.name || '';
      a.appendChild(h);
      if (item.hood) {
        var p = document.createElement('p');
        p.textContent = item.hood;
        a.appendChild(p);
      }
      var s = document.createElement('span');
      s.textContent = 'View';
      a.appendChild(s);
      return a;
    }

    function run() {
      var term = norm(input.value);
      results.innerHTML = '';
      if (!term) {
        hide(results, true);
        hide(countEl, true);
        hide(emptyEl, true);
        return;
      }
      var hits = data.filter(function (item) {
        return norm(item.name).indexOf(term) !== -1 || norm(item.hood).indexOf(term) !== -1;
      });
      if (!hits.length) {
        hide(results, true);
        hide(countEl, true);
        hide(emptyEl, false);
        return;
      }
      hide(emptyEl, true);
      hide(results, false);
      var shown = hits.slice(0, LIMIT);
      shown.forEach(function (item) { results.appendChild(row(item)); });
      if (countEl) {
        countEl.hidden = false;
        countEl.textContent = hits.length > LIMIT
          ? ('Showing ' + LIMIT + ' of ' + hits.length + ' matches. Type more of the name to narrow it.')
          : (hits.length + (hits.length === 1 ? ' match' : ' matches') + '.');
      }
    }

    input.addEventListener('input', run);
    input.addEventListener('search', run);
    if (input.value) run();
  }

  function bindNeighborhoodSearch() {
    var input = document.getElementById('n-q');
    if (!input) return;
    var cards = Array.prototype.slice.call(document.querySelectorAll('.ncard[data-name],.n-tile[data-name]'));
    if (!cards.length) return;
    var empty = document.getElementById('nb-empty');
    var form = input.closest('form');
    if (form) {
      form.addEventListener('submit', function (ev) { ev.preventDefault(); });
    }
    function run() {
      var term = norm(input.value);
      var visible = 0;
      cards.forEach(function (card) {
        var hay = (card.getAttribute('data-name') || '') + ' ' + (card.textContent || '');
        var hit = !term || norm(hay).indexOf(term) !== -1;
        card.hidden = !hit;
        if (hit) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
    }
    input.addEventListener('input', run);
    input.addEventListener('search', run);
    try {
      var q = new URLSearchParams(window.location.search).get('q');
      if (q && !input.value) input.value = q;
    } catch (e) {}
    if (input.value) run();
  }

  bindCommunitySearch();
  bindNeighborhoodSearch();
})();
