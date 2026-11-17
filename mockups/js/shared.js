(function(){
  var BASE = window.NG_BASE || '';
  var data = window.NG_EVENTS || {events:[], ranges:{}, today:'2026-11-17', featured_order:[]};
  var TODAY = data.today || '2026-11-17';
  var EVENTS = data.events || [];
  var RANGES = data.ranges || {};
  var FEATURED = data.featured_order || [];

  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var DOW_LONG = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  function parseYMD(s){
    var p = (s||'').split('-');
    return new Date(Number(p[0]), Number(p[1])-1, Number(p[2]));
  }
  function fmtDayLong(s){
    var d = parseYMD(s);
    return DOW_LONG[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate();
  }
  function fmtTime(hhmm){
    if(!hhmm) return '';
    var p = hhmm.split(':');
    var h = parseInt(p[0],10), m = p[1]||'00';
    var ap = h>=12 ? 'PM' : 'AM';
    h = h%12; if(h===0) h=12;
    return m==='00' ? (h+' '+ap) : (h+':'+m+' '+ap);
  }
  function shortPlace(e){
    var p = (e.place||'').replace(/^Area:\s*/i,'').trim();
    p = p.replace(/,?\s*\d{2,6}\s+[^·,]+/g, '');
    p = p.replace(/\s*·\s*/g, ' · ').replace(/^·\s*|\s*·$/g,'').replace(/,\s*,/g,',').replace(/,\s*$/,'').trim();
    p = p.replace(/,\s*Naples\b/ig, '');
    var tag = e.area_tag||'';
    if(tag && p.toLowerCase().indexOf(tag.toLowerCase())===-1){
      p = p ? (p + ' · ' + tag) : tag;
    }
    if(p.length>52){
      var first = p.split(' · ')[0];
      p = first;
      if(tag && p.toLowerCase().indexOf(tag.toLowerCase())===-1) p += ' · ' + tag;
    }
    return p;
  }
  function cardWhen(e){
    if(e.dates && e.dates[0]){
      var d = parseYMD(e.dates[0]);
      var mon = MONTHS[d.getMonth()].slice(0,3);
      var s = DOW[d.getDay()] + ', ' + mon + ' ' + d.getDate();
      if(e.start_time) s += ' · ' + fmtTime(e.start_time);
      return s;
    }
    return e.when_chip || '';
  }
  function inRange(dates, start, end){
    for(var i=0;i<dates.length;i++){
      if(dates[i]>=start && dates[i]<=end) return true;
    }
    return false;
  }
  function onDate(dates, day){
    return dates.indexOf(day)!==-1;
  }
  function regionOk(e, region){
    if(!region || region==='all') return true;
    return e.region===region;
  }
  function ageOk(e, age){
    if(!age || age==='any') return true;
    var a = (e.ages||'').toLowerCase();
    var isAll = !a || a.indexOf('all ages')!==-1 || a==='families' || a==='family' || a.indexOf('family show')!==-1;
    if(age==='little'){
      if(e.toddler) return true;
      return /preschool|ages?\s*0|ages?\s*2½|ages?\s*2|age 3|ages 3|ages 4|0–5|0-5/.test(a);
    }
    if(age==='kids'){
      if(/13–17|13-17|ages 13|teens/.test(a) && !/5–|6–|4–|kids/.test(a)) return false;
      return true;
    }
    if(age==='teens'){
      return isAll || /13–17|13-17|ages 13|teen|5–99|5-99/.test(a);
    }
    return true;
  }
  function whenOk(e, when){
    if(!when) return true;
    var r = RANGES[when];
    if(!r) return true;
    return inRange(e.dates, r[0], r[1]);
  }
  function specialScore(e){
    var n = (e.dates||[]).length;
    if(e.featured) return 0;
    if(n<=2) return 1;
    if(n<=7) return 2;
    return 3;
  }
  function sortEvents(list, day){
    return list.slice().sort(function(a,b){
      var fa = FEATURED.indexOf(a.id), fb = FEATURED.indexOf(b.id);
      var aF = fa!==-1, bF = fb!==-1;
      if(aF && bF) return fa-fb;
      if(aF) return -1;
      if(bF) return 1;
      var sa = specialScore(a), sb = specialScore(b);
      if(sa!==sb) return sa-sb;
      var ta = a.start_time||'99:99', tb = b.start_time||'99:99';
      if(ta!==tb) return ta<tb?-1:1;
      return a.title.localeCompare(b.title);
    });
  }
  function featuredWeekend(region){
    var r = RANGES.weekend || ['2026-11-21','2026-11-22'];
    var list = EVENTS.filter(function(e){
      return e.featured && inRange(e.dates, r[0], r[1]) && regionOk(e, region||'all');
    });
    if(!list.length){
      list = EVENTS.filter(function(e){ return e.featured && inRange(e.dates, r[0], r[1]); });
    }
    list = sortEvents(list);
    // Prefer a people photo over a building shot when both are featured this weekend
    var prefer = list.filter(function(e){ return e.image.indexOf('/uploads/')===-1 || e.id===850; });
    // 5K Turkey Run (850) has a bright action photo; Grand Illuminations is a building
    var run = list.filter(function(e){ return e.id===850; });
    return (run[0] || list[0] || null);
  }
  function eventHref(e){
    if(!e.slug) return '#';
    return BASE + '/family-events/' + e.slug + '/';
  }
  function esc(s){
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function cardHTML(e, opts){
    opts = opts||{};
    var cls = 'mk-card' + (opts.feature ? ' feature' : '');
    var chip = e.when_chip || fmtTime(e.start_time);
    var img = e.image ? (BASE + e.image) : '';
    var meta = [];
    var whenLine = cardWhen(e);
    if(whenLine) meta.push(whenLine);
    var place = shortPlace(e);
    if(place) meta.push(place);
    var blurb = (!opts.feature && e.blurb) ? e.blurb : (opts.feature ? e.blurb : '');
    return (
      '<a class="'+cls+'" href="'+esc(eventHref(e))+'">'+
        '<div class="ph">'+
          (img ? '<img src="'+esc(img)+'" alt="'+esc(e.alt||e.title)+'" width="800" height="500">' : '')+
          (e.area_tag ? '<span class="tag">'+esc(e.area_tag)+'</span>' : '')+
          (chip ? '<span class="chip">'+esc(chip)+'</span>' : '')+
        '</div>'+
        '<div class="bd">'+
          (opts.kicker ? '<p class="mk-kicker" style="margin:0 0 6px">'+esc(opts.kicker)+'</p>' : '')+
          '<'+(opts.feature?'h2':'h3')+'>'+esc(e.title)+'</'+(opts.feature?'h2':'h3')+'>'+
          (meta.length ? '<p class="meta">'+esc(meta.join(' · '))+'</p>' : '')+
          (blurb ? '<p class="blurb">'+esc(blurb)+'</p>' : '')+
        '</div>'+
      '</a>'
    );
  }

  /* ---------- Option 1 ---------- */
  function initMagazine(){
    var root = document.querySelector('[data-mk="magazine"]');
    if(!root) return;
    var state = {when:'weekend', region:'all', age:'any'};
    var listEl = root.querySelector('[data-list]');
    var featEl = root.querySelector('[data-featured]');
    function closeDrops(except){
      root.querySelectorAll('.mg-field').forEach(function(f){
        if(f!==except) f.classList.remove('is-open');
      });
    }
    function labelWhen(){
      return {today:'Today',tomorrow:'Tomorrow',weekend:'This weekend',week:'This week',month:'This month'}[state.when]||'This weekend';
    }
    function labelRegion(){
      return {all:'All areas',naples:'Naples','bonita-estero':'Estero & Bonita','fort-myers':'Fort Myers'}[state.region]||'All areas';
    }
    function labelAge(){
      return {any:'Any age',little:'Little ones',kids:'Kids',teens:'Teens'}[state.age]||'Any age';
    }
    function renderVals(){
      root.querySelector('[data-val="when"]').textContent = labelWhen();
      root.querySelector('[data-val="where"]').textContent = labelRegion();
      root.querySelector('[data-val="age"]').textContent = labelAge();
      root.querySelectorAll('.mg-drop[data-for="when"] button').forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-v')===state.when ? 'true':'false'); });
      root.querySelectorAll('.mg-drop[data-for="where"] button').forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-v')===state.region ? 'true':'false'); });
      root.querySelectorAll('.mg-drop[data-for="age"] button').forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-v')===state.age ? 'true':'false'); });
    }
    function render(){
      renderVals();
      var feat = (state.when==='weekend' || !state.when) ? featuredWeekend(state.region) : null;
      if(feat && ageOk(feat, state.age) && whenOk(feat, state.when) && regionOk(feat, state.region)){
        featEl.innerHTML = '<p class="mk-kicker">Featured this weekend</p>' + cardHTML(feat, {feature:true});
        featEl.hidden = false;
      } else if(feat && state.when==='weekend'){
        featEl.innerHTML = '<p class="mk-kicker">Featured this weekend</p>' + cardHTML(feat, {feature:true});
        featEl.hidden = false;
      } else {
        featEl.innerHTML = '';
        featEl.hidden = true;
      }
      var items = EVENTS.filter(function(e){
        return regionOk(e, state.region) && whenOk(e, state.when) && ageOk(e, state.age);
      });
      items = sortEvents(items);
      if(feat) items = items.filter(function(e){ return e.id!==feat.id; });
      var html = items.slice(0, 14).map(function(e){ return cardHTML(e); }).join('');
      listEl.innerHTML = html || '<p class="mk-empty">Nothing matches this search. Try another day or area.</p>';
    }
    root.querySelectorAll('.mg-field > button').forEach(function(btn){
      btn.addEventListener('click', function(ev){
        ev.stopPropagation();
        var field = btn.parentElement;
        var open = field.classList.contains('is-open');
        closeDrops();
        if(!open) field.classList.add('is-open');
      });
    });
    root.querySelectorAll('.mg-drop button').forEach(function(b){
      b.addEventListener('click', function(ev){
        ev.stopPropagation();
        var which = b.closest('.mg-drop').getAttribute('data-for');
        var v = b.getAttribute('data-v');
        if(which==='when') state.when=v;
        if(which==='where') state.region=v;
        if(which==='age') state.age=v;
        closeDrops();
        render();
      });
    });
    document.addEventListener('click', function(){ closeDrops(); });
    render();
  }

  /* ---------- Option 2 ---------- */
  function initStrip(){
    var root = document.querySelector('[data-mk="strip"]');
    if(!root) return;
    var state = {day:'2026-11-21', region:'naples'};
    var datesEl = root.querySelector('[data-dates]');
    var listEl = root.querySelector('[data-list]');
    var headEl = root.querySelector('[data-dayhead]');
    var drawer = root.querySelector('[data-drawer]');
    var filterBtn = root.querySelector('[data-filter]');

    var days = [];
    var d0 = parseYMD(TODAY);
    for(var i=0;i<16;i++){
      var d = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate()+i);
      var iso = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
      days.push(iso);
    }
    function countFor(day){
      return EVENTS.filter(function(e){ return onDate(e.dates, day) && regionOk(e, state.region); }).length;
    }
    function renderDates(){
      datesEl.innerHTML = days.map(function(iso){
        var d = parseYMD(iso);
        var n = countFor(iso);
        var pressed = iso===state.day ? 'true' : 'false';
        var cls = 'st-day' + (iso===TODAY ? ' is-today' : '');
        var cnt = n===1 ? '1 event' : (n+' events');
        return '<button type="button" class="'+cls+'" data-day="'+iso+'" aria-pressed="'+pressed+'">'+
          '<span class="dow">'+DOW[d.getDay()]+'</span>'+
          '<span class="num">'+d.getDate()+'</span>'+
          '<span class="cnt">'+cnt+'</span>'+
        '</button>';
      }).join('');
      datesEl.querySelectorAll('[data-day]').forEach(function(b){
        b.addEventListener('click', function(){
          state.day = b.getAttribute('data-day');
          render();
        });
      });
      var sel = datesEl.querySelector('[data-day="'+state.day+'"]');
      if(sel){
        var pad = 16;
        var left = sel.offsetLeft;
        var right = left + sel.offsetWidth;
        var viewL = datesEl.scrollLeft;
        var viewR = viewL + datesEl.clientWidth;
        if(left < viewL + pad || right > viewR - pad){
          datesEl.scrollLeft = Math.max(0, left - (datesEl.clientWidth/2) + (sel.offsetWidth/2));
        }
      }
    }
    function renderList(){
      headEl.textContent = fmtDayLong(state.day);
      var items = sortEvents(EVENTS.filter(function(e){
        return onDate(e.dates, state.day) && regionOk(e, state.region);
      }), state.day);
      listEl.innerHTML = items.slice(0,16).map(function(e){ return cardHTML(e); }).join('')
        || '<p class="mk-empty">No events on this day in this area.</p>';
    }
    function renderDrawer(){
      drawer.querySelectorAll('button[data-v]').forEach(function(b){
        b.setAttribute('aria-pressed', b.getAttribute('data-v')===state.region ? 'true':'false');
      });
    }
    function render(){
      renderDates();
      renderDrawer();
      renderList();
    }
    filterBtn.addEventListener('click', function(ev){
      ev.stopPropagation();
      var open = drawer.classList.toggle('is-open');
      filterBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    drawer.querySelectorAll('button[data-v]').forEach(function(b){
      b.addEventListener('click', function(){
        state.region = b.getAttribute('data-v');
        drawer.classList.remove('is-open');
        filterBtn.setAttribute('aria-expanded','false');
        render();
      });
    });
    document.addEventListener('click', function(ev){
      if(!drawer.contains(ev.target) && ev.target!==filterBtn && !filterBtn.contains(ev.target)){
        drawer.classList.remove('is-open');
        filterBtn.setAttribute('aria-expanded','false');
      }
    });
    render();
  }

  /* ---------- Option 3 ---------- */
  function initMonth(){
    var root = document.querySelector('[data-mk="month"]');
    if(!root) return;
    var state = {day:'2026-11-21', region:'naples', year:2026, month:10}; // 0-indexed Nov
    var calEl = root.querySelector('[data-cal]');
    var listEl = root.querySelector('[data-list]');
    var headEl = root.querySelector('[data-dayhead]');
    var featEl = root.querySelector('[data-feat]');
    var switchEl = root.querySelector('[data-switch]');
    var calTitle = root.querySelector('[data-caltitle]');

    function renderFeatured(){
      var feat = featuredWeekend(state.region) || featuredWeekend('all');
      if(!feat){ featEl.innerHTML=''; return; }
      var img = feat.image ? (BASE + feat.image) : '';
      var meta = [];
      if(feat.when_chip) meta.push(feat.when_chip);
      else if(feat.start_time) meta.push(fmtTime(feat.start_time));
      if(feat.area_tag) meta.push(feat.area_tag);
      else {
        var place = shortPlace(feat);
        if(place) meta.push(place);
      }
      featEl.innerHTML =
        '<a class="fx-feat" href="'+esc(eventHref(feat))+'">'+
          '<div class="ph">'+(img?'<img src="'+esc(img)+'" alt="'+esc(feat.alt||feat.title)+'">':'')+'</div>'+
          '<div class="bd">'+
            '<p class="kicker">Featured this weekend</p>'+
            '<h2>'+esc(feat.title)+'</h2>'+
            (meta.length?'<p class="meta">'+esc(meta.join(' · '))+'</p>':'')+
          '</div>'+
        '</a>';
    }
    function dotsFor(iso){
      var n = EVENTS.filter(function(e){ return onDate(e.dates, iso) && regionOk(e, state.region); }).length;
      if(!n) return 0;
      return n>=15 ? 2 : 1;
    }
    function renderCal(){
      calTitle.textContent = MONTHS[state.month] + ' ' + state.year;
      var first = new Date(state.year, state.month, 1);
      var startDow = first.getDay();
      var lastDate = new Date(state.year, state.month+1, 0).getDate();
      var prevLast = new Date(state.year, state.month, 0).getDate();
      var cells = [];
      for(var i=0;i<startDow;i++){
        var d = prevLast - startDow + 1 + i;
        cells.push({out:true, day:d, iso:null});
      }
      for(var d=1;d<=lastDate;d++){
        var iso = state.year+'-'+String(state.month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
        cells.push({out:false, day:d, iso:iso});
      }
      while(cells.length%7!==0) cells.push({out:true, day:cells.length, iso:null});
      var grid = cells.map(function(c){
        if(c.out || !c.iso){
          return '<button type="button" class="fx-cell is-out" disabled><span></span></button>';
        }
        var cls = 'fx-cell';
        if(c.iso<TODAY) cls += ' is-past';
        if(c.iso===TODAY) cls += ' is-today';
        var dots = dotsFor(c.iso);
        var dotHtml = '<span class="dots">'+Array(dots).fill('<span class="dot"></span>').join('')+'</span>';
        var pressed = c.iso===state.day ? 'true' : 'false';
        return '<button type="button" class="'+cls+'" data-day="'+c.iso+'" aria-pressed="'+pressed+'" aria-label="'+esc(fmtDayLong(c.iso))+'">'+
          '<span>'+c.day+'</span>'+dotHtml+'</button>';
      }).join('');
      calEl.querySelector('[data-grid]').innerHTML = grid;
      calEl.querySelectorAll('[data-day]').forEach(function(b){
        b.addEventListener('click', function(){
          state.day = b.getAttribute('data-day');
          render();
        });
      });
    }
    function renderList(){
      headEl.textContent = fmtDayLong(state.day);
      var items = sortEvents(EVENTS.filter(function(e){
        return onDate(e.dates, state.day) && regionOk(e, state.region);
      }), state.day);
      listEl.innerHTML = items.slice(0,16).map(function(e){ return cardHTML(e); }).join('')
        || '<p class="mk-empty">No events on this day in this area.</p>';
    }
    function renderSwitch(){
      switchEl.querySelectorAll('button').forEach(function(b){
        b.setAttribute('aria-pressed', b.getAttribute('data-v')===state.region ? 'true':'false');
      });
    }
    function render(){
      renderFeatured();
      renderSwitch();
      renderCal();
      renderList();
    }
    switchEl.querySelectorAll('button').forEach(function(b){
      b.addEventListener('click', function(){
        state.region = b.getAttribute('data-v');
        render();
      });
    });
    render();
  }

  document.addEventListener('DOMContentLoaded', function(){
    initMagazine();
    initStrip();
    initMonth();
  });
})();
