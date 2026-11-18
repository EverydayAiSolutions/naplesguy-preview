(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // scroll reveal
  var rv=document.querySelectorAll('.rv');
  if('IntersectionObserver' in window && !reduce){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px',threshold:.08});
    rv.forEach(function(el){io.observe(el);});
  } else rv.forEach(function(el){el.classList.add('in');});
  // lightbox
  var lb=document.getElementById('flyer-lb');
  function closeLb(){if(!lb)return;lb.classList.remove('on');document.body.style.overflow='';}
  document.querySelectorAll('[data-lightbox]').forEach(function(el){el.addEventListener('click',function(e){e.preventDefault();if(!lb)return;lb.querySelector('img').src=el.getAttribute('data-full')||el.getAttribute('href');lb.classList.add('on');document.body.style.overflow='hidden';});});
  if(lb){lb.addEventListener('click',function(e){if(e.target===lb||e.target.classList.contains('lb-close'))closeLb();});document.addEventListener('keydown',function(e){if(e.key==='Escape')closeLb();});}
  // tilt (desktop pointer)
  document.querySelectorAll('[data-tilt]').forEach(function(el){
    if(reduce||!window.matchMedia('(hover:hover)').matches)return;
    var host=el.closest('[data-tilt-host]')||el;
    host.addEventListener('pointermove',function(e){var r=host.getBoundingClientRect();var x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.setProperty('--rx',(-y*7).toFixed(2)+'deg');el.style.setProperty('--ry',(x*9).toFixed(2)+'deg');});
    host.addEventListener('pointerleave',function(){el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg');});
  });
  // scroll-linked progress (parallax, flatten)
  var px=document.querySelectorAll('[data-scroll]');
  function onScroll(){
    px.forEach(function(el){var r=el.getBoundingClientRect(),vh=window.innerHeight;var p=Math.min(1,Math.max(0,(vh-r.top)/(vh+r.height)));el.style.setProperty('--p',p.toFixed(3));});
    var sb=document.querySelector('[data-showafter]');
    if(sb){var t=document.querySelector(sb.getAttribute('data-showafter'));if(t){sb.classList.toggle('show',t.getBoundingClientRect().bottom<60);}}
  }
  if(!reduce){window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);}
  onScroll();
  // carousel arrows
  document.querySelectorAll('[data-car]').forEach(function(nav){
    var c=document.getElementById(nav.getAttribute('data-car'));if(!c)return;
    nav.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){var w=c.firstElementChild?c.firstElementChild.getBoundingClientRect().width+18:300;c.scrollBy({left:(b.dataset.dir==='prev'?-1:1)*w,behavior:'smooth'});});});
  });
  // add to calendar (.ics)
  document.querySelectorAll('[data-ics]').forEach(function(btn){btn.addEventListener('click',function(){
    var d;try{d=JSON.parse(btn.getAttribute('data-ics'));}catch(e){return;}
    function esc(s){return String(s||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/[,;]/g,function(m){return '\\'+m;});}
    var ymd=function(s){return s.replace(/-/g,'');},hm=function(s){return s.replace(':','')+'00';};
    var now=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z');
    var L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//The Naples Guy//Family Events//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT','UID:ng-event-'+d.uid+'@thenaplesguy','DTSTAMP:'+now];
    if(d.start){L.push('DTSTART;TZID=America/New_York:'+ymd(d.date)+'T'+hm(d.start));if(d.end)L.push('DTEND;TZID=America/New_York:'+ymd(d.date)+'T'+hm(d.end));}
    else{L.push('DTSTART;VALUE=DATE:'+ymd(d.date));if(d.endDate)L.push('DTEND;VALUE=DATE:'+ymd(d.endDate));}
    L.push('SUMMARY:'+esc(d.title));if(d.loc)L.push('LOCATION:'+esc(d.loc));
    L.push('DESCRIPTION:'+esc('Please check the official page for the latest details before going.\n'+(d.url||'')));if(d.url)L.push('URL:'+d.url);L.push('END:VEVENT','END:VCALENDAR');
    var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([L.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}));a.download=d.uid+'.ics';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},400);
  });});
  // share
  var toast=document.getElementById('toast');
  document.querySelectorAll('[data-share]').forEach(function(b){b.addEventListener('click',function(){var url=location.href;function ok(){if(!toast)return;toast.textContent='Link copied';toast.classList.add('on');setTimeout(function(){toast.classList.remove('on');},1800);}
    if(navigator.share){navigator.share({title:document.title,url:url}).catch(function(){});}else if(navigator.clipboard){navigator.clipboard.writeText(url).then(ok);}});});
})();
