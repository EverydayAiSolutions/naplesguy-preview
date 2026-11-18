(function(){
  var lb=document.getElementById('flyer-lb');
  function openLb(e){
    e.preventDefault();
    if(!lb) return;
    var img=lb.querySelector('img');
    var src=e.currentTarget.getAttribute('data-full')||e.currentTarget.querySelector('img')?.src;
    if(img&&src) img.src=src;
    lb.classList.add('on');
    document.body.style.overflow='hidden';
  }
  document.querySelectorAll('[data-lightbox]').forEach(function(el){
    el.addEventListener('click', openLb);
    el.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' ') openLb(e); });
  });
  if(lb){
    lb.addEventListener('click', function(e){ if(e.target===lb||e.target.classList.contains('lb-close')) closeLb(); });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeLb(); });
  }
  function closeLb(){ if(!lb) return; lb.classList.remove('on'); document.body.style.overflow=''; }

  var icsBtn=document.getElementById('ev-ics');
  if(icsBtn){
    icsBtn.addEventListener('click', function(){
      var d; try{ d=JSON.parse(icsBtn.getAttribute('data-ics')); }catch(e){ return; }
      function esc(s){ return String(s||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/[,;]/g,function(m){return '\\'+m;}); }
      function ymd(s){ return s.replace(/-/g,''); }
      function hm(s){ return s.replace(':','')+'00'; }
      var now=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z');
      var L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//The Naples Guy//Family Events//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT','UID:ng-event-'+(d.uid||'preview')+'@thenaplesguy','DTSTAMP:'+now];
      if(d.start){ L.push('DTSTART;TZID=America/New_York:'+ymd(d.date)+'T'+hm(d.start)); if(d.end) L.push('DTEND;TZID=America/New_York:'+ymd(d.date)+'T'+hm(d.end)); }
      else { L.push('DTSTART;VALUE=DATE:'+ymd(d.date)); }
      L.push('SUMMARY:'+esc(d.title));
      if(d.loc) L.push('LOCATION:'+esc(d.loc));
      L.push('DESCRIPTION:'+esc('Please check the official event page for the latest details before going.\n'+(d.url||'')), d.url?('URL:'+d.url):'', 'END:VEVENT','END:VCALENDAR');
      var blob=new Blob([L.filter(Boolean).join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'});
      var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=(d.slug||'event')+'.ics';
      document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 400);
    });
  }

  var share=document.getElementById('ev-share');
  var toast=document.getElementById('toast');
  if(share){
    share.addEventListener('click', function(){
      var title=share.getAttribute('data-title')||document.title;
      var url=share.getAttribute('data-url')||location.href;
      function copied(){ if(!toast) return; toast.textContent='Link copied'; toast.classList.add('on'); setTimeout(function(){ toast.classList.remove('on'); }, 1800); }
      if(navigator.share){ navigator.share({title:title,url:url}).catch(function(){ navigator.clipboard.writeText(url).then(copied); }); }
      else if(navigator.clipboard){ navigator.clipboard.writeText(url).then(copied); }
    });
  }
})();
