/* Family Events page: When / Where / Search filter, Style 3 compact cards, Show more. */
(function(){
  var main = document.querySelector('.fm-main');
  var grid = document.getElementById('fm-grid');
  if(!main || !grid) return;
  var PAGE = parseInt(main.getAttribute('data-fm-page')||'12',10) || 12;
  var whenSel = document.querySelector('[data-fm-when]');
  var onInput = document.querySelector('[data-fm-on]');
  var whereSel = document.querySelector('[data-fm-where]');
  var qInput = document.querySelector('[data-fm-q]');
  var featSec = document.querySelector('[data-fm-featured]');
  var featCard = featSec ? featSec.querySelector('.st-card, .fm-card') : null;
  var featId = featCard ? featCard.getAttribute('data-id') : '';
  var emptyEl = document.querySelector('[data-fm-empty]');
  var moreWrap = document.querySelector('[data-fm-more-wrap]');
  var moreBtn = document.querySelector('[data-fm-more]');
  var listHead = document.querySelector('[data-fm-listhead]');
  var cards = [].slice.call(grid.querySelectorAll('.st-card, .fm-card, .fe-card'));
  var limit = PAGE;
  var REGION = {naples:0,'bonita-estero':1,'fort-myers':2};
  function regionRank(c){ var r=c.getAttribute('data-region')||'naples'; return REGION.hasOwnProperty(r)?REGION[r]:0; }
  function stime(c){ return c.getAttribute('data-stime')||c.getAttribute('data-start-time')||'99'; }

  function pad(n){ return (n<10?'0':'')+n; }
  function iso(d){ return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
  function addDays(d,n){ var x=new Date(d.getTime()); x.setDate(x.getDate()+n); return x; }
  /* Today's date in Naples (America/New_York), whatever the visitor's device zone is. */
  function nyToday(){
    try{
      var parts = new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
      var o = {}; parts.forEach(function(p){ o[p.type]=p.value; });
      if(o.year && o.month && o.day) return o.year+'-'+o.month+'-'+o.day;
    }catch(e){}
    return iso(new Date());
  }
  var today = nyToday();
  var serverToday = main.getAttribute('data-fm-today') || today;
  if(today < serverToday) today = serverToday;
  var t0 = new Date(today+'T12:00:00');
  function ranges(){
    var dow = t0.getDay(); /* 0 Sun .. 6 Sat */
    var sat, sun;
    if(dow===6){ sat=t0; sun=addDays(t0,1); }
    else if(dow===0){ sat=t0; sun=t0; }
    else { sat=addDays(t0,6-dow); sun=addDays(sat,1); }
    var monthEnd = new Date(t0.getFullYear(), t0.getMonth()+1, 0, 12);
    return {
      today:[today,today],
      weekend:[iso(sat),iso(sun)],
      week:[today,iso(addDays(t0,6))],
      month:[today,iso(monthEnd)]
    };
  }
  var R = ranges();

  function datesOf(c){
    var raw = c.getAttribute('data-dates')||'';
    return raw ? raw.split(',') : [];
  }
  function inRange(c, a, b){
    var ds = datesOf(c);
    if(ds.length) return ds.some(function(d){ return d>=a && d<=b; });
    var s = c.getAttribute('data-start')||'', e = c.getAttribute('data-end')||s;
    if(s) return s<=b && (e||s)>=a;
    return false;
  }
  function upcoming(c){
    var ds = datesOf(c);
    if(ds.length) return ds.some(function(d){ return d>=today; });
    var s = c.getAttribute('data-start')||'', e = c.getAttribute('data-end')||s;
    if(!s) return true;
    return (e||s) >= today;
  }
  var DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function label(d){ var x=new Date(d+'T12:00:00'); return DOW[x.getDay()]+' '+(x.getMonth()+1)+'/'+x.getDate()+'/'+String(x.getFullYear()).slice(2); }
  function slabel(d){ var x=new Date(d+'T12:00:00'); return DOW[x.getDay()]+' '+(x.getMonth()+1)+'/'+x.getDate(); }
  /* First date this card actually happens inside [a,b]; '' when it doesn't. */
  function firstIn(c, a, b){
    var ds = datesOf(c).filter(function(d){ return d>=a && d<=b; }).sort();
    if(ds.length) return ds[0];
    if(datesOf(c).length) return '';
    var s = c.getAttribute('data-start')||'', e = c.getAttribute('data-end')||s;
    if(s && s<=b && e>=a) return s>a ? s : a;
    return '';
  }
  function relabel(c, d){
    var chip = c.querySelector('.st-whenchip, .fm-chip');
    if(chip && !chip.hasAttribute('data-orig')) chip.setAttribute('data-orig', chip.textContent);
    if(!d){
      if(chip) chip.textContent = chip.getAttribute('data-orig');
      return;
    }
    if(chip){
      var ct = c.getAttribute('data-ctime')||'';
      chip.textContent = label(d) + (ct ? ' · '+ct : '');
    }
  }
  function range(){
    var w = whenSel ? whenSel.value : '';
    if(w==='date'){
      var d = onInput && onInput.value ? onInput.value : '';
      return d ? [d,d] : null;
    }
    return R[w] || null;
  }
  function matches(c){
    var where = whereSel ? whereSel.value : 'all';
    if(where && where!=='all' && (c.getAttribute('data-region')||'naples')!==where) return false;
    var q = (qInput && qInput.value || '').trim().toLowerCase();
    if(q){
      var hay = c.getAttribute('data-search')||'';
      var words = q.split(/\s+/);
      for(var i=0;i<words.length;i++){ if(hay.indexOf(words[i])===-1) return false; }
    }
    var r = range();
    if(r) return firstIn(c, r[0], r[1]) !== '';
    return upcoming(c);
  }
  function loadImg(c){
    var img = c.querySelector('img[data-src]');
    if(img){ img.setAttribute('src', img.getAttribute('data-src')); img.removeAttribute('data-src'); }
  }
  function apply(resetLimit){
    if(resetLimit) limit = PAGE;
    var w = whenSel ? whenSel.value : '';
    var showFeat = false;
    if(featCard && (w==='' || w==='weekend')) showFeat = matches(featCard);
    if(featSec) featSec.hidden = !showFeat;
    var r = range();
    if(featCard) relabel(featCard, w==='weekend' && r ? firstIn(featCard, r[0], r[1]) : '');
    /* Order by the date in the chosen window, then Naples → Bonita & Estero → Fort Myers, then start time. */
    var order = cards.slice();
    if(r){
      order.forEach(function(c){ c._fmd = firstIn(c, r[0], r[1]) || '9999'; });
      order.sort(function(x,y){
        if(x._fmd<y._fmd) return -1;
        if(x._fmd>y._fmd) return 1;
        var rr = regionRank(x)-regionRank(y);
        if(rr) return rr;
        var sx=stime(x), sy=stime(y);
        if(sx<sy) return -1;
        if(sx>sy) return 1;
        return 0;
      });
    }
    closeAllCards();
    order.forEach(function(c){ grid.appendChild(c); });
    var shown = 0, total = 0;
    order.forEach(function(c){
      relabel(c, r ? firstIn(c, r[0], r[1]) : '');
      var ok = matches(c);
      if(ok && showFeat && c.getAttribute('data-id')===featId) ok = false;
      if(ok){
        total++;
        if(shown < limit){ c.hidden = false; loadImg(c); shown++; }
        else c.hidden = true;
      } else {
        c.hidden = true;
      }
    });
    if(emptyEl) emptyEl.hidden = total!==0;
    if(moreWrap) moreWrap.hidden = total <= shown;
    if(listHead){
      var labels = {'':'Coming up', today:'Today', weekend:'This weekend', week:'This week', month:'This month', date:'On that day'};
      listHead.textContent = labels[w] || 'Coming up';
      listHead.hidden = total===0;
    }
  }
  if(whenSel) whenSel.addEventListener('change', function(){
    if(onInput){
      onInput.hidden = whenSel.value!=='date';
      if(whenSel.value==='date'){ try{ onInput.focus(); if(onInput.showPicker) onInput.showPicker(); }catch(e){} }
    }
    apply(true);
  });
  if(onInput) onInput.addEventListener('change', function(){ apply(true); });
  if(whereSel) whereSel.addEventListener('change', function(){ apply(true); });
  if(qInput){
    var tmr;
    qInput.addEventListener('input', function(){ clearTimeout(tmr); tmr = setTimeout(function(){ apply(true); }, 120); });
  }
  if(moreBtn) moreBtn.addEventListener('click', function(){ limit += PAGE; apply(false); });

  /* Optional deep links: ?when=weekend&area=naples&q=santa */
  try{
    var u = new URL(window.location.href);
    var w = u.searchParams.get('when') || u.searchParams.get('filter') || '';
    if(w==='this-weekend') w='weekend';
    if(w==='this-week' || w==='next-7') w='week';
    if(whenSel && ['today','weekend','week','month'].indexOf(w)!==-1) whenSel.value = w;
    var a = u.searchParams.get('area');
    if(whereSel && a && whereSel.querySelector('option[value="'+a+'"]')) whereSel.value = a;
    var q = u.searchParams.get('q');
    if(qInput && q) qInput.value = q;
  }catch(e){}
  function closeCard(card){
    var b=card.querySelector('.st-face');
    var p=card.querySelector('.st-panel');
    if(b) b.setAttribute('aria-expanded','false');
    if(p) p.hidden=true;
    card.classList.remove('open');
  }
  function closeAllCards(){
    grid.querySelectorAll('.st-card.open').forEach(closeCard);
  }
  function isInteractive(el){
    return !!(el && el.closest && el.closest('a, button, input, select, textarea, label, [role="button"], [role="link"]'));
  }
  grid.addEventListener('click', function(e){
    var share=e.target.closest('.st-share');
    if(share && grid.contains(share)){
      e.preventDefault();
      e.stopPropagation();
      var url=share.getAttribute('data-url');
      var title=share.getAttribute('data-title')||'';
      if(navigator.share){ navigator.share({title:title, url:url}).catch(function(){}); return; }
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(url).then(function(){
          var prev=share.textContent;
          share.textContent='Link copied';
          setTimeout(function(){ share.textContent=prev; }, 2000);
        });
        return;
      }
      window.prompt('Copy this event link', url);
      return;
    }
    var card=e.target.closest('.st-card');
    if(!card || !grid.contains(card)) return;
    var btn=card.querySelector('.st-face');
    var panel=card.querySelector('.st-panel');
    if(!btn||!panel) return;
    if(btn.contains(e.target)){
      var open=btn.getAttribute('aria-expanded')==='true';
      closeAllCards();
      if(!open){
        btn.setAttribute('aria-expanded','true');
        panel.hidden=false;
        card.classList.add('open');
        try{ card.scrollIntoView({block:'nearest', behavior:'smooth'}); }catch(err){}
      }
      return;
    }
    if(card.classList.contains('open')){
      if(isInteractive(e.target) && !btn.contains(e.target)) return;
      closeCard(card);
      btn.focus();
    }
  });
  document.addEventListener('keydown', function(e){
    if(e.key!=='Escape') return;
    var open=grid.querySelector('.st-card.open');
    if(!open) return;
    var b=open.querySelector('.st-face');
    closeCard(open);
    if(b) b.focus();
  });

  apply(true);
})();

/* v35: today's date (Naples time), banner preview (?banner=a..f), flyer carousel + lightbox. */
(function(){
  var el = document.querySelector('[data-fm-todaytext]');
  if(el){
    try{
      var parts = new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'long',month:'numeric',day:'numeric',year:'2-digit'}).formatToParts(new Date());
      var g = function(t){ for(var i=0;i<parts.length;i++){ if(parts[i].type===t) return parts[i].value; } return ''; };
      el.textContent = g('weekday')+', '+g('month')+'/'+g('day')+'/'+g('year');
    }catch(e){}
  }
  /* Banner slideshow: 1.2s crossfade every 5s; ?banner=a..f shows one slide and holds it. */
  (function(){
    var box = document.querySelector('[data-fm-slides]');
    if(!box) return;
    var sl = Array.prototype.slice.call(box.querySelectorAll('.fm-slide'));
    if(sl.length < 2) return;
    var cur = 0, hold = false;
    var go = function(n){
      var a = sl[cur], b = sl[n];
      if(a === b) return;
      var bi = b.querySelector('img'), ai = a.querySelector('img');
      b.classList.add('is-on'); b.removeAttribute('aria-hidden'); if(bi) bi.alt = bi.getAttribute('data-alt')||'';
      a.classList.remove('is-on'); a.setAttribute('aria-hidden','true'); if(ai) ai.alt = '';
      cur = n;
    };
    try{
      var want = ((new URL(window.location.href)).searchParams.get('banner')||'').toLowerCase();
      if(want){ sl.forEach(function(s, i){ if(s.getAttribute('data-slide') === want){ go(i); hold = true; } }); }
    }catch(e){}
    var rm = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    if(hold || (rm && rm.matches)) return;
    var timer = null;
    var start = function(){ if(!timer) timer = setInterval(function(){ go((cur + 1) % sl.length); }, 5000); };
    var stop = function(){ if(timer){ clearInterval(timer); timer = null; } };
    document.addEventListener('visibilitychange', function(){ if(document.hidden) stop(); else start(); });
    if(rm && rm.addEventListener) rm.addEventListener('change', function(){ if(rm.matches) stop(); else start(); });
    start();
  })();

  var sec = document.querySelector('.fl');
  if(!sec) return;
  var row = sec.querySelector('[data-fl-row]');
  var items = Array.prototype.slice.call(sec.querySelectorAll('[data-fl-open]'));
  var step = function(dir){ var it = items[0]; var gap = 10; try{ gap = parseFloat(getComputedStyle(row).gap)||10; }catch(e){} var w = it ? it.getBoundingClientRect().width + gap : 170; row.scrollBy({left: dir*w, behavior:'smooth'}); };
  var prev = sec.querySelector('[data-fl-prev]'), next = sec.querySelector('[data-fl-next]');
  var arrows = sec.querySelector('.fl-arrows');
  var upd = function(){
    var over = row.scrollWidth > row.clientWidth + 4;
    if(arrows) arrows.hidden = !over;
    if(prev) prev.disabled = row.scrollLeft < 4;
    if(next) next.disabled = row.scrollLeft + row.clientWidth >= row.scrollWidth - 4;
  };
  if(prev) prev.addEventListener('click', function(){ step(-1); });
  if(next) next.addEventListener('click', function(){ step(1); });
  row.addEventListener('scroll', function(){ window.requestAnimationFrame(upd); }, {passive:true});
  window.addEventListener('resize', upd); upd();

  var box = sec.querySelector('[data-fl-box]'), bimg = sec.querySelector('[data-fl-img]'), cur = 0, lastFocus = null;
  var bp = sec.querySelector('[data-fl-bprev]'), bn = sec.querySelector('[data-fl-bnext]');
  var show = function(i){
    cur = (i + items.length) % items.length;
    var a = items[cur], im = a.querySelector('img');
    bimg.src = a.getAttribute('data-full'); bimg.alt = im ? im.alt : '';
    if(bp) bp.hidden = items.length < 2; if(bn) bn.hidden = items.length < 2;
  };
  var open = function(i){ lastFocus = document.activeElement; show(i); box.hidden = false; document.documentElement.classList.add('fl-lock'); sec.querySelector('[data-fl-close]').focus(); };
  var close = function(){ box.hidden = true; document.documentElement.classList.remove('fl-lock'); if(lastFocus) lastFocus.focus(); };
  items.forEach(function(a, i){ a.addEventListener('click', function(e){ e.preventDefault(); open(i); }); });
  sec.querySelector('[data-fl-close]').addEventListener('click', close);
  if(bp) bp.addEventListener('click', function(){ show(cur-1); });
  if(bn) bn.addEventListener('click', function(){ show(cur+1); });
  box.addEventListener('click', function(e){ if(e.target === box) close(); });
  document.addEventListener('keydown', function(e){
    if(box.hidden) return;
    if(e.key === 'Escape') close();
    else if(e.key === 'ArrowLeft') show(cur-1);
    else if(e.key === 'ArrowRight') show(cur+1);
  });
})();
