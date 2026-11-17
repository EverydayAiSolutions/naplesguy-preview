(function(){
  var cfg = window.ngFamilyEvents || {};
  var today = cfg.today || '';
  var ranges = cfg.ranges || {};
  var ccpsDates = cfg.ccpsDates || [];
  var filters = {when:'', on:'', type:'', q:'', region:'naples'};
  var defaultRegion = 'naples';
  var areaKeys = ['naples','bonita-estero','fort-myers'];
  var grid = document.getElementById('fe-grid');
  if(!grid) return;
  var empty = document.getElementById('fe-empty');
  var moreWrap = document.getElementById('fe-more');
  var moreBtn = document.querySelector('[data-fe-more]');
  var countEl = document.querySelector('[data-fe-count]');
  var clearBtn = document.querySelector('[data-fe-clear]');
  var undatedNote = document.getElementById('fe-undated-note');
  var groups = [].slice.call(grid.querySelectorAll('[data-fe-group]'));
  var index = Array.isArray(cfg.index) ? cfg.index : [];
  var initialShown = cfg.initialShown || {featured:99, naples:12, 'bonita-estero':8, 'fort-myers':8};
  var extraShown = {featured:0, naples:0, 'bonita-estero':0, 'fort-myers':0};
  var pageSize = cfg.pageSize || 12;
  var restUrl = cfg.restUrl || '';
  var searchUrl = cfg.searchUrl || '';
  var searchCache = {};
  var fetchQueue = Promise.resolve();
  var fetching = {};

  function cardEl(id){
    return grid.querySelector('.fe-card[data-id="'+id+'"]');
  }
  function inRangeEntry(entry, start, end){
    var dates = entry.dates || [];
    if(dates.length) return dates.some(function(d){return d>=start && d<=end;});
    var a = entry.start || '';
    var b = entry.end || a;
    if(a && b) return a<=end && b>=start;
    return false;
  }
  function isWeekdayDate(d){
    var dt = new Date(d+'T12:00:00');
    var wd = dt.getDay();
    return wd>=1 && wd<=5;
  }
  function startMinutes(entry){
    var t = entry.start_time || '';
    var m = t.match(/^(\d{1,2}):(\d{2})/);
    if(!m) return null;
    return parseInt(m[1],10)*60+parseInt(m[2],10);
  }
  function matchesWhen(entry, key){
    if(!key) return true;
    var dates = entry.dates || [];
    if(key==='weekdays'){
      return dates.some(isWeekdayDate);
    }
    if(key==='after-school'){
      var mins = startMinutes(entry);
      return mins!==null && mins>=15*60 && dates.some(isWeekdayDate);
    }
    if(key==='evenings'){
      var mins2 = startMinutes(entry);
      return mins2!==null && mins2>=17*60;
    }
    if(key==='toddlers'){
      return entry.toddler===1;
    }
    if(key==='no-school'){
      if(entry.ccps===1) return true;
      var set = ccpsDates||[];
      return dates.some(function(d){ return set.indexOf(d)!==-1; });
    }
    if(key==='rainy-day'){
      if(entry.rainy!==1) return false;
      if(!today) return true;
      var end = new Date(today+'T12:00:00');
      end.setDate(end.getDate()+13);
      var endStr = end.toISOString().slice(0,10);
      return inRangeEntry(entry, today, endStr);
    }
    if(key==='thanksgiving'){ return entry.thanksgiving===1; }
    if(key==='christmas'){ return entry.christmas===1; }
    if(key==='holiday'){ return entry.holiday===1; }
    if(key==='farmers-markets'){ return entry.farmers===1; }
    return true;
  }
  var specialWhen = {weekdays:1,'after-school':1,evenings:1,'no-school':1,toddlers:1,'rainy-day':1,thanksgiving:1,christmas:1,holiday:1,'farmers-markets':1};
  var moreWhen = {tomorrow:1,'next-weekend':1,'after-weekend':1,weekdays:1,'after-school':1,evenings:1,'no-school':1,toddlers:1,'rainy-day':1,thanksgiving:1,christmas:1,holiday:1,'farmers-markets':1};
  function openMoreIfNeeded(key){
    if(!key || !moreWhen[key]) return;
    var box = document.querySelector('.fe-more-filters');
    if(box && !box.open) box.open = true;
  }
  function active(){
    return !!(filters.when || filters.on || filters.type || filters.q || (filters.region && filters.region!==defaultRegion));
  }
  function uniqueCount(ids){
    var seen = {}, n = 0;
    ids.forEach(function(id){
      if(!seen[id]){ seen[id]=1; n++; }
    });
    return n;
  }
  function matchingEntries(searchIds){
    var range = null;
    if(filters.on) range = [filters.on, filters.on];
    else if(filters.when && ranges[filters.when]) range = ranges[filters.when];
    var q = (filters.q||'').trim().toLowerCase();
    var dated = [];
    var undatedKept = [];
    index.forEach(function(entry){
      var ok = true;
      var isUndated = entry.undated===1;
      if(range && !isUndated) ok = ok && inRangeEntry(entry, range[0], range[1]);
      if(filters.when && specialWhen[filters.when]) ok = ok && matchesWhen(entry, filters.when);
      if(filters.type) ok = ok && entry.type===filters.type;
      if(filters.region && filters.region!=='all') ok = ok && (entry.region||'naples')===filters.region;
      if(q && searchIds) ok = ok && searchIds.indexOf(entry.id)!==-1;
      if(!ok) return;
      if(isUndated){
        if(range || filters.when || filters.on) return;
        undatedKept.push(entry);
      } else {
        dated.push(entry);
      }
    });
    return {dated:dated, undated:undatedKept, range:range};
  }
  function fitTitles(){
    document.querySelectorAll('#fe-grid .st-title').forEach(function(el){
      var card = el.closest('.st-card');
      if(card && card.hidden) return;
      if(!el.clientHeight) return;
      el.style.fontSize='';
      el.style.maxHeight='';
      var cs = window.getComputedStyle(el);
      var size = parseFloat(cs.fontSize)||16;
      var min = 14;
      function lineHeight(){
        var lh = parseFloat(window.getComputedStyle(el).lineHeight);
        return (!lh || isNaN(lh)) ? size*1.2 : lh;
      }
      el.style.maxHeight = (lineHeight()*3)+'px';
      while(size>min && el.scrollHeight>el.clientHeight+1){
        size -= 0.5;
        el.style.fontSize = size+'px';
        el.style.maxHeight = (lineHeight()*3)+'px';
      }
    });
  }
  function writeUrl(){
    var u = new URL(window.location.href);
    ['on','type','q'].forEach(function(k){
      if(filters[k]) u.searchParams.set(k, filters[k]);
      else u.searchParams.delete(k);
    });
    u.searchParams.delete('when');
    u.searchParams.delete('filter');
    if(filters.when){
      u.searchParams.set('filter', filters.when);
      u.searchParams.set('when', filters.when);
    }
    if(filters.region && filters.region!=='all' && filters.region!==defaultRegion) u.searchParams.set('area', filters.region);
    else u.searchParams.delete('area');
    history.replaceState({}, '', u.pathname + u.search + u.hash);
  }
  function groupOrder(region){
    return index.filter(function(e){ return (e.region||'naples')===region; }).map(function(e){ return e.id; });
  }
  function insertCard(item){
    if(!item || !item.html) return;
    if(cardEl(item.id)) return;
    var groupKey = areaKeys.indexOf(item.region)!==-1 ? item.region : 'naples';
    var group = grid.querySelector('[data-fe-group="'+groupKey+'"]');
    if(!group) return;
    var holder = group.querySelector('.fe-grid');
    if(!holder) return;
    var wrap = document.createElement('div');
    wrap.innerHTML = item.html;
    var article = wrap.querySelector('article');
    if(!article) return;
    var order = groupOrder(groupKey);
    var pos = order.indexOf(item.id);
    var placed = false;
    if(pos!==-1){
      var existing = [].slice.call(holder.querySelectorAll('.fe-card'));
      for(var i=0;i<existing.length;i++){
        var eid = parseInt(existing[i].getAttribute('data-id')||'0',10);
        var epos = order.indexOf(eid);
        if(epos!==-1 && epos>pos){
          holder.insertBefore(article, existing[i]);
          placed = true;
          break;
        }
      }
    }
    if(!placed) holder.appendChild(article);
  }
  function fetchCards(ids){
    var missing = ids.filter(function(id){
      return !cardEl(id) && !fetching[id];
    });
    if(!missing.length){
      return Promise.resolve();
    }
    if(!restUrl) return Promise.resolve();
    missing.forEach(function(id){ fetching[id]=true; });
    var url = restUrl + (restUrl.indexOf('?')===-1 ? '?' : '&') + 'ids=' + missing.join(',');
    return fetch(url, {credentials:'same-origin'}).then(function(r){
      if(!r.ok) throw new Error('cards');
      return r.json();
    }).then(function(data){
      (data.cards||[]).forEach(insertCard);
    }).catch(function(){
      /* Keep already-rendered cards visible if a later page fails to load. */
    }).then(function(){
      missing.forEach(function(id){ delete fetching[id]; });
    });
  }
  function setMoreLoading(on){
    document.querySelectorAll('[data-fe-more-group], [data-fe-more]').forEach(function(btn){
      btn.disabled = !!on;
      var wrap = btn.closest('.fe-more');
      if(wrap) wrap.classList.toggle('is-loading', !!on);
    });
  }
  function resolveSearch(){
    var q = (filters.q||'').trim().toLowerCase();
    if(!q) return Promise.resolve(null);
    if(searchCache[q]) return Promise.resolve(searchCache[q]);
    if(!searchUrl) return Promise.resolve([]);
    var url = searchUrl + (searchUrl.indexOf('?')===-1 ? '?' : '&') + 'q=' + encodeURIComponent(q);
    return fetch(url, {credentials:'same-origin'}).then(function(r){
      if(!r.ok) throw new Error('search');
      return r.json();
    }).then(function(data){
      var ids = data.ids || [];
      searchCache[q] = ids;
      return ids;
    }).catch(function(){ return []; });
  }
  var applyGen = 0;
  function paint(matched){
    var dated = matched.dated;
    var undatedKept = matched.undated;
    var range = matched.range;
    var filtered = dated.concat(undatedKept);
    var datePicked = !!range || !!(filters.when && specialWhen[filters.when]);
    var visibleIds = [];
    var needed = [];
    groups.forEach(function(g){
      var key = g.getAttribute('data-fe-group');
      var matches = filtered.filter(function(e){ return (e.region||'naples')===key; });
      var base = datePicked ? 40 : (initialShown[key]||8);
      var limit = base + (extraShown[key]||0);
      var slice = matches.slice(0, limit);
      slice.forEach(function(e){ needed.push(e.id); visibleIds.push(e.id); });
      g.hidden = matches.length===0 && slice.length===0;
      var wrap = g.querySelector('[data-fe-more-wrap]');
      if(wrap) wrap.hidden = limit>=matches.length || matches.length===0;
    });
    var visibleSet = {};
    visibleIds.forEach(function(id){ visibleSet[id]=1; });
    [].slice.call(grid.querySelectorAll('.fe-card')).forEach(function(card){
      var id = parseInt(card.getAttribute('data-id')||'0',10);
      card.hidden = !visibleSet[id];
    });
    groups.forEach(function(g){
      var key = g.getAttribute('data-fe-group');
      var any = g.querySelector('.fe-card:not([hidden])');
      var matches = filtered.filter(function(e){ return (e.region||'naples')===key; });
      g.hidden = !any && matches.length===0;
      var head = g.querySelector('.fe-group-head');
      if(head) head.hidden = filters.region!=='all';
    });
    var n = uniqueCount(filtered.map(function(e){ return e.id; }));
    var visible = uniqueCount(visibleIds);
    var total = uniqueCount(index.map(function(e){ return e.id; }));
    if(empty) empty.hidden = n>0;
    if(moreWrap) moreWrap.hidden = true;
    if(undatedNote) undatedNote.hidden = true;
    if(countEl){
      var other = !!(filters.when || filters.on || filters.type || filters.q);
      if(!n) countEl.textContent = (other || (filters.region && filters.region!=='all')) ? 'No events for this filter.' : 'No upcoming events.';
      else if(!other) countEl.textContent='Showing '+visible+' of '+n+' upcoming events';
      else if(visible===n) countEl.textContent=n+' events.';
      else countEl.textContent='Showing '+visible+' of '+n+' events.';
    }
    if(clearBtn) clearBtn.hidden=!active();
    fitTitles();
    return needed;
  }
  function apply(){
    var gen = ++applyGen;
    writeUrl();
    fetchQueue = fetchQueue.then(resolveSearch).then(function(searchIds){
      if(gen!==applyGen) return;
      var matched = matchingEntries(searchIds);
      var needed = paint(matched);
      var missing = needed.filter(function(id){ return !cardEl(id); });
      if(!missing.length) return;
      setMoreLoading(true);
      return fetchCards(missing).then(function(){
        if(gen!==applyGen) return;
        setMoreLoading(false);
        paint(matched);
      });
    }).catch(function(){ if(gen===applyGen) setMoreLoading(false); });
  }

  function setWhen(key, scrollToList){
    filters.when=key||'';
    filters.on='';
    var dateInput=document.getElementById('fe-on');
    if(dateInput) dateInput.value='';
    document.querySelectorAll('[data-fe-when]').forEach(function(b){
      var press=b.getAttribute('data-fe-when')===filters.when;
      b.setAttribute('aria-pressed', press?'true':'false');
      b.classList.toggle('on', press);
    });
    extraShown={featured:0, naples:0, 'bonita-estero':0, 'fort-myers':0};
    apply();
    if(scrollToList && filters.when){
      var list=document.getElementById('fe-list');
      if(list){
        try{ list.scrollIntoView({block:'start', behavior:'smooth'}); }
        catch(e){ list.scrollIntoView(true); }
      }
      var u=new URL(window.location.href);
      if(u.hash!=='#fe-list') history.replaceState({}, '', u.pathname + u.search + '#fe-list');
    }
  }
  document.querySelectorAll('[data-fe-when]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var key=btn.getAttribute('data-fe-when');
      var on=filters.when===key;
      setWhen(on?'':key, false);
    });
  });
  var dateInput=document.getElementById('fe-on');
  if(dateInput){
    dateInput.addEventListener('change', function(){
      filters.on=dateInput.value||'';
      filters.when='';
      document.querySelectorAll('[data-fe-when]').forEach(function(b){
        b.setAttribute('aria-pressed','false');
        b.classList.remove('on');
      });
      extraShown={featured:0, naples:0, 'bonita-estero':0, 'fort-myers':0};
      apply();
    });
  }
  document.querySelectorAll('[data-fe-region]').forEach(function(btn){
    btn.addEventListener('click', function(){
      filters.region=btn.getAttribute('data-fe-region')||'all';
      document.querySelectorAll('[data-fe-region]').forEach(function(b){
        var on=b.getAttribute('data-fe-region')===filters.region;
        b.setAttribute('aria-pressed', on?'true':'false');
        b.classList.toggle('on', on);
      });
      extraShown={featured:0, naples:0, 'bonita-estero':0, 'fort-myers':0};
      apply();
    });
  });
  document.querySelectorAll('[data-fe-select]').forEach(function(sel){
    sel.addEventListener('change', function(){
      filters[sel.getAttribute('data-fe-select')]=sel.value;
      extraShown={featured:0, naples:0, 'bonita-estero':0, 'fort-myers':0};
      apply();
    });
  });
  var qInput=document.querySelector('[data-fe-q]');
  var qTimer=null;
  if(qInput){
    qInput.addEventListener('input', function(){
      clearTimeout(qTimer);
      qTimer=setTimeout(function(){
        filters.q=qInput.value||'';
        extraShown={featured:0, naples:0, 'bonita-estero':0, 'fort-myers':0};
        apply();
      }, 150);
    });
  }
  document.querySelectorAll('[data-fe-more-group]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var key=btn.getAttribute('data-fe-more-group');
      extraShown[key]=(extraShown[key]||0)+pageSize;
      apply();
    });
  });
  if(moreBtn){
    moreBtn.addEventListener('click', function(){
      extraShown={featured:0, naples:(extraShown.naples||0)+pageSize, 'bonita-estero':(extraShown['bonita-estero']||0)+pageSize, 'fort-myers':(extraShown['fort-myers']||0)+pageSize};
      apply();
    });
  }
  if(clearBtn){
    clearBtn.addEventListener('click', function(){
      filters={when:'', on:'', type:'', q:'', region:defaultRegion};
      document.querySelectorAll('[data-fe-when]').forEach(function(b){
        b.setAttribute('aria-pressed','false');
        b.classList.remove('on');
      });
      document.querySelectorAll('[data-fe-region]').forEach(function(b){
        var on=b.getAttribute('data-fe-region')===defaultRegion;
        b.setAttribute('aria-pressed', on?'true':'false');
        b.classList.toggle('on', on);
      });
      if(dateInput) dateInput.value='';
      var typeSel=document.getElementById('fe-type');
      if(typeSel) typeSel.value='';
      if(qInput) qInput.value='';
      extraShown={featured:0, naples:0, 'bonita-estero':0, 'fort-myers':0};
      apply();
    });
  }
  function pressWhen(when){
    if(!when) return;
    openMoreIfNeeded(when);
    var known=!!(ranges[when] || specialWhen[when] || document.querySelector('[data-fe-when="'+when+'"]'));
    if(!known) return;
    filters.when=when;
    var b=document.querySelector('[data-fe-when="'+when+'"]');
    if(b){ b.setAttribute('aria-pressed','true'); b.classList.add('on'); }
  }
  (function restoreFromUrl(){
    var u=new URL(window.location.href);
    var hash=(u.hash||'').replace(/^#/, '');
    var when=u.searchParams.get('filter')||u.searchParams.get('when')||'';
    if(!when){
      if(hash==='no-school' || hash==='filter=no-school') when='no-school';
      else if(hash.indexOf('filter=')===0) when=decodeURIComponent(hash.split('=')[1]||'');
    }
    var on=u.searchParams.get('on')||'';
    var type=u.searchParams.get('type')||'';
    var q=u.searchParams.get('q')||'';
    var area=u.searchParams.get('area')||defaultRegion;
    if(area==='nearby') area='all';
    if(areaKeys.indexOf(area)!==-1 || area==='all'){
      filters.region=area;
      document.querySelectorAll('[data-fe-region]').forEach(function(b){
        var onR=b.getAttribute('data-fe-region')===area;
        b.setAttribute('aria-pressed', onR?'true':'false');
        b.classList.toggle('on', onR);
      });
    }
    pressWhen(when);
    if(on){
      filters.on=on;
      filters.when='';
      if(dateInput) dateInput.value=on;
      document.querySelectorAll('[data-fe-when]').forEach(function(b){
        b.setAttribute('aria-pressed','false');
        b.classList.remove('on');
      });
    }
    if(type){
      filters.type=type;
      var sel=document.getElementById('fe-type');
      if(sel) sel.value=type;
    }
    if(q){
      filters.q=q;
      if(qInput) qInput.value=q;
    }
    var shouldScroll=!!(u.searchParams.get('filter') || hash==='fe-list' || hash.indexOf('filter=')===0 || hash==='no-school');
    apply();
    if(shouldScroll && (filters.when||filters.on)){
      var list=document.getElementById('fe-list');
      if(list){
        window.setTimeout(function(){
          try{ list.scrollIntoView({block:'start', behavior:'smooth'}); }
          catch(e){ list.scrollIntoView(true); }
        }, 50);
      }
    }
  })();

  document.querySelectorAll('[data-fe-filter]').forEach(function(a){
    a.addEventListener('click', function(e){
      var key=a.getAttribute('data-fe-filter');
      if(!key) return;
      e.preventDefault();
      setWhen(key, true);
    });
  });

  var fitTimer=null;
  window.addEventListener('resize', function(){
    clearTimeout(fitTimer);
    fitTimer=setTimeout(fitTitles, 100);
  });

  function closeCard(card){
    var b=card.querySelector('.st-face');
    var p=card.querySelector('.st-panel');
    if(b) b.setAttribute('aria-expanded','false');
    if(p) p.hidden=true;
    card.classList.remove('open');
  }
  function closeAllCards(){
    grid.querySelectorAll('.st-card').forEach(closeCard);
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
        fitTitles();
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

  function calendarOffset(){
    var offset = 16;
    var header = document.querySelector('header.site');
    if(header){
      var cs = window.getComputedStyle(header);
      if(cs.position==='sticky' || cs.position==='fixed'){
        offset += header.getBoundingClientRect().height;
      }
    }
    var admin = document.getElementById('wpadminbar');
    if(admin){
      offset += admin.getBoundingClientRect().height;
    }
    return offset;
  }
  function jumpToCalendar(e){
    var el = document.getElementById('fe-calendar');
    if(!el) return;
    if(e) e.preventDefault();
    var html = document.documentElement;
    var prev = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    var top = el.getBoundingClientRect().top + (window.pageYOffset||0) - calendarOffset();
    window.scrollTo(0, Math.max(0, top));
    html.style.scrollBehavior = prev;
    if(history.replaceState){
      var u = new URL(window.location.href);
      if(u.hash!=='#fe-calendar') history.replaceState({}, '', u.pathname + u.search + '#fe-calendar');
    }
  }
  document.querySelectorAll('a[href="#fe-calendar"]').forEach(function(a){
    a.addEventListener('click', jumpToCalendar);
  });
  if((window.location.hash||'')==='#fe-calendar'){
    window.setTimeout(function(){ jumpToCalendar(); }, 0);
  }

})();
