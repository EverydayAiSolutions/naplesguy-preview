/* Family event page, design D: reveal, lightbox, tilt, ambient drift, sticky pill, carousel, .ics, share. */
(function(){
  var root=document.querySelector('.evd'); if(!root) return;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rv=root.querySelectorAll('.rv');
  if('IntersectionObserver' in window && !reduce){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px',threshold:.08});
    rv.forEach(function(el){io.observe(el);});
  } else rv.forEach(function(el){el.classList.add('in');});
  var lb=document.getElementById('evd-lb');
  function closeLb(){if(!lb)return;lb.classList.remove('on');document.body.style.overflow='';}
  root.querySelectorAll('[data-lightbox]').forEach(function(el){el.addEventListener('click',function(e){e.preventDefault();if(!lb)return;lb.querySelector('img').src=el.getAttribute('data-full')||el.getAttribute('href');lb.classList.add('on');document.body.style.overflow='hidden';});});
  if(lb){lb.addEventListener('click',function(e){if(e.target===lb||e.target.classList.contains('evd-lb-close'))closeLb();});document.addEventListener('keydown',function(e){if(e.key==='Escape')closeLb();});}
  root.querySelectorAll('[data-tilt]').forEach(function(el){
    if(reduce||!window.matchMedia('(hover:hover)').matches)return;
    var host=el.closest('[data-tilt-host]')||el;
    host.addEventListener('pointermove',function(e){var r=host.getBoundingClientRect();var x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.setProperty('--rx',(-y*7).toFixed(2)+'deg');el.style.setProperty('--ry',(x*9).toFixed(2)+'deg');});
    host.addEventListener('pointerleave',function(){el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg');});
  });
  var sb=root.querySelector('[data-showafter]');
  function onScroll(){ if(sb){var t=document.querySelector(sb.getAttribute('data-showafter'));if(t){sb.classList.toggle('show',t.getBoundingClientRect().bottom<60);}} }
  window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);onScroll();
  root.querySelectorAll('[data-car]').forEach(function(nav){
    var c=document.getElementById(nav.getAttribute('data-car'));if(!c)return;
    nav.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){var w=c.firstElementChild?c.firstElementChild.getBoundingClientRect().width+18:300;c.scrollBy({left:(b.dataset.dir==='prev'?-1:1)*w,behavior:'smooth'});});});
  });
  root.querySelectorAll('[data-ics]').forEach(function(btn){btn.addEventListener('click',function(){
    var d;try{d=JSON.parse(btn.getAttribute('data-ics'));}catch(e){return;}
    function esc(s){return String(s||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/[,;]/g,function(m){return '\\'+m;});}
    function ymd(s){return s.replace(/-/g,'');} function hm(s){return s.replace(':','')+'00';}
    function plus1(s){var p=s.split('-');var t=new Date(Date.UTC(+p[0],+p[1]-1,+p[2]+1));return t.toISOString().slice(0,10).replace(/-/g,'');}
    var now=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z');
    var L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//The Naples Guy//Family Events//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
    (d.dates||[]).forEach(function(day){
      L.push('BEGIN:VEVENT','UID:ng-event-'+d.uid+'-'+day+'@thenaplesguy','DTSTAMP:'+now);
      if(d.start){L.push('DTSTART;TZID=America/New_York:'+ymd(day)+'T'+hm(d.start));if(d.end){L.push('DTEND;TZID=America/New_York:'+ymd(day)+'T'+hm(d.end));}}
      else{L.push('DTSTART;VALUE=DATE:'+ymd(day),'DTEND;VALUE=DATE:'+plus1(day));}
      L.push('SUMMARY:'+esc(d.title));if(d.loc)L.push('LOCATION:'+esc(d.loc));
      L.push('DESCRIPTION:'+esc('Please check the official event page for the latest details before going.\n'+d.url),'URL:'+d.url,'END:VEVENT');
    });
    L.push('END:VCALENDAR');
    var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([L.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}));a.download=(d.slug||'event')+'.ics';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},500);
  });});
  var toast=document.getElementById('evd-toast');
  root.querySelectorAll('[data-share]').forEach(function(b){b.addEventListener('click',function(){var url=location.href;function ok(){if(!toast)return;toast.textContent='Link copied';toast.classList.add('on');setTimeout(function(){toast.classList.remove('on');},1800);}
    if(navigator.share){navigator.share({title:document.title,url:url}).catch(function(){});}else if(navigator.clipboard){navigator.clipboard.writeText(url).then(ok);}});});
})();
