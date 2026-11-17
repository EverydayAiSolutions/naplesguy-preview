(function(){
var ITEMS=window.REG_ITEMS||[], TODAY=window.REG_TODAY;
var main=document.querySelector('[data-rg]'); if(!main) return;
var OPT=main.getAttribute('data-rg');
function D(s){var p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2]);}
function iso(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function add(d,n){var x=new Date(d);x.setDate(x.getDate()+n);return x;}
var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
// When options (Collier County Public Schools calendar)
var WHEN=[
 {k:'any',l:'Any time'},
 {k:'2026-11-16',l:'This week',r:['2026-11-17','2026-11-22']},
 {k:'2026-11-23',l:'Thanksgiving break · Nov 23–27',r:['2026-11-23','2026-11-29'],tag:'Thanksgiving'},
 {k:'2026-11-30',l:'Week of Nov 30',r:['2026-11-30','2026-12-06']},
 {k:'2026-12-07',l:'Week of Dec 7',r:['2026-12-07','2026-12-13']},
 {k:'2026-12-14',l:'Week of Dec 14',r:['2026-12-14','2026-12-20']},
 {k:'2026-12-21',l:'Winter break, week 1 · Dec 21–25',r:['2026-12-21','2026-12-27'],tag:'Winter break'},
 {k:'2026-12-28',l:'Winter break, week 2 · Dec 28–Jan 1',r:['2026-12-28','2027-01-03'],tag:'Winter break'},
 {k:'2027-01-04',l:'Week of Jan 4',r:['2027-01-04','2027-01-10'],tag:'No school Jan 4'},
 {k:'jan',l:'January 2027',r:['2027-01-01','2027-01-31']},
 {k:'feb',l:'February 2027',r:['2027-02-01','2027-02-28']},
 {k:'mar',l:'March 2027 (spring break Mar 22–26)',r:['2027-03-01','2027-03-31']},
 {k:'later',l:'April and later',r:['2027-04-01','2027-12-31']}
];
var AGES=[{k:'',l:'Any age'},{k:'0-2',l:'Under 3'},{k:'3-4',l:'3 to 4'},{k:'5-7',l:'5 to 7'},{k:'8-10',l:'8 to 10'},{k:'11-13',l:'11 to 13'},{k:'14-17',l:'14 to 17'}];
var ACTS=[['','All activities'],['daycamp','Day Camps'],['sports','Sports'],['swim','Swimming'],['gym','Gymnastics & Cheer'],['arts','Arts & Crafts'],['stage','Acting, Dance & Music'],['science','Science & Nature'],['teens','Teens']];
var AREAS=[['','All areas'],['naples','Naples'],['bonita','Bonita Springs & Estero'],['east','Immokalee & Ave Maria'],['north','Fort Myers & Cape Coral']];
function areaKey(a){a=(a||'').toLowerCase(); if(/bonita|estero/.test(a))return'bonita'; if(/immokalee|ave maria/.test(a))return'east'; if(/fort myers|cape coral/.test(a))return'north'; return 'naples';}
function datesOf(it){ if(it.dates&&it.dates.length) return it.dates; if(!it.s) return []; var out=[],d=D(it.s),e=D(it.e||it.s),n=0; while(d<=e&&n<400){out.push(iso(d));d=add(d,1);n++;} return out;}
ITEMS.forEach(function(it){it._d=datesOf(it); it._ar=areaKey(it.area); it._h=(it.t+' '+it.sum+' '+it.place+' '+it.an+' '+it.k+' '+it.ages).toLowerCase();});
function inRange(it,a,b){ if(!it._d.length) return false; if(it.s&&it.e&&it.s<=b&&it.e>=a&&(!it.dates||!it.dates.length)) return true; for(var i=0;i<it._d.length;i++){var x=it._d[i]; if(x>=a&&x<=b) return true;} return false;}
function stem(w){return w.replace(/(ming|ning|ing|es|s)$/,'');}
var SYN={swim:'swim',pool:'swim',soccer:'soccer',art:'art',paint:'art',theater:'theat',theatre:'theat',drama:'act',coding:'stem',science:'scien',gym:'gym',gymnastic:'gymnast',ball:'ball'};
function matchQ(it,q){ if(!q) return true; var ws=q.toLowerCase().split(/\s+/).filter(Boolean); return ws.every(function(w){var s=stem(w); s=SYN[s]||s; return it._h.indexOf(s)>-1;}); }
function matchAge(it,k){ if(!k) return true; if(it.amin==null) return true; var p=k.split('-'),lo=+p[0],hi=+p[1]; return it.amin<=hi && (it.amax==null?99:it.amax)>=lo; }
function whenObj(k){for(var i=0;i<WHEN.length;i++) if(WHEN[i].k===k) return WHEN[i]; return null;}
function filter(st){
  return ITEMS.filter(function(it){
    if(st.act && it.a!==st.act) return false;
    if(st.area && it._ar!==st.area) return false;
    if(!matchAge(it,st.age)) return false;
    if(!matchQ(it,st.q)) return false;
    if(st.date){ if(!inRange(it,st.date,st.date)) return false; }
    else if(st.when && st.when!=='any'){ var w=whenObj(st.when); if(w&&w.r&&!inRange(it,w.r[0],w.r[1])) return false; }
    return true;
  }).map(function(it){it._k=firstOn(it,floorOf(st));return it;}).sort(function(a,b){ var x=a._k, y=b._k; return x<y?-1:x>y?1:a.t.localeCompare(b.t); });
}
function floorOf(st){ if(st.date) return st.date; var w=whenObj(st.when); if(w&&w.r&&w.r[0]>TODAY) return w.r[0]; return TODAY; }
function firstOn(it,fl){ if(!it.s) return '9999'; for(var i=0;i<it._d.length;i++){ if(it._d[i]>=fl) return it._d[i]; } return it.e&&it.e>=fl?fl:(it.s<fl?fl:it.s);
}
function esc(s){return String(s||'').replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
var CAL='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';
function dayCount(it){ if(!it.s||!it.e||it.s===it.e) return it.s?'1 day':''; if(it.timing==='weekly') return ''; var n=it._d.filter(function(x){var d=D(x).getDay();return d>0&&d<6;}).length; if(!n) n=it.days; return n>1&&n<15? n+' days':''; }
function timingLabel(it){ return it.timing==='break'?'School break':it.timing==='weekly'?'Weekly':'One day'; }
function card(it){
  var dc=dayCount(it), t=it.time+(dc?' · '+dc:'');
  return '<article class="rg-card"><div class="rg-ph"><img loading="lazy" src="'+esc(it.img)+'" alt="'+esc(it.alt)+'"><span class="rg-kind">'+esc(it.k)+'</span></div>'+
  '<div class="rg-bd"><p class="rg-cat">'+esc(it.an)+' · '+timingLabel(it)+'</p><h3>'+esc(it.t)+'</h3>'+
  '<div class="rg-when">'+CAL+'<div><span class="l">When it happens</span><b>'+esc(it.when)+'</b><span class="t">'+esc(t)+'</span>'+(it.note?'<em>'+esc(it.note)+'</em>':'')+'</div></div>'+
  '<ul class="rg-meta"><li><b>Ages</b> · '+esc((it.ages||'See the official page').replace(/^Ages\s+/,''))+'</li><li><b>Where</b> · '+esc(it.place)+'</li>'+(it.price?'<li><b>Price</b> · '+esc(it.price)+'</li>':'')+'</ul>'+
  '<p class="rg-status is-'+it.st+'">'+esc(it.stl)+'</p>'+
  '<div class="rg-btns"><a class="btn coral" href="'+esc(it.url)+'" target="_blank" rel="noopener">Sign up</a><a class="lk" href="'+esc(it.det)+'">Details</a></div></div></article>';
}
function dateTile(it){
  if(!it.s) return '<div class="rg-date"><small>Ongoing</small><b>—</b><span>see dates</span></div>';
  var a=D(it.s), b=D(it.e||it.s), DW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  if(it.timing==='weekly' && it.s!==it.e && (b-a)/864e5>13){ var sd=a<D(TODAY)?D(TODAY):a; return '<div class="rg-date"><small>'+(a<D(TODAY)?'Now':'Starts')+'</small><b>'+MON[a.getMonth()]+' '+a.getDate()+'</b><span>weekly</span></div>'; }
  var top=MON[a.getMonth()]+(b.getMonth()!==a.getMonth()?'–'+MON[b.getMonth()]:'');
  var mid=a.getDate()+(it.s!==it.e?'–'+b.getDate():'');
  var bot=it.s===it.e?DW[a.getDay()]:(it.timing==='weekly'?'weekly':DW[a.getDay()]+'–'+DW[b.getDay()]);
  return '<div class="rg-date"><small>'+top+'</small><b>'+mid+'</b><span>'+bot+'</span></div>';
}
function row(it){
  return '<article class="rg-li">'+dateTile(it)+'<div class="th"><img loading="lazy" src="'+esc(it.img)+'" alt="'+esc(it.alt)+'"></div>'+
  '<div><p class="rg-cat">'+esc(it.an)+' · '+esc(it.k)+'</p><h3>'+esc(it.t)+'</h3><p class="ln"><b>'+esc(it.when)+'</b> · '+esc(it.time)+(it.note?' · '+esc(it.note):'')+'</p><p class="ln">'+esc(it.ages||'Ages on the official page')+' · '+esc(it.place)+(it.price?' · '+esc(it.price):'')+'</p><p class="rg-status is-'+it.st+'">'+esc(it.stl)+'</p></div>'+
  '<div class="go"><a class="btn coral" href="'+esc(it.url)+'" target="_blank" rel="noopener">Sign up</a><a class="lk" style="font:500 12px Jost;letter-spacing:.14em;text-transform:uppercase;color:var(--navy)" href="'+esc(it.det)+'">Details</a></div></article>';
}
function opts(sel,list){ sel.innerHTML=list.map(function(o){return '<option value="'+o[0]+'">'+o[1]+'</option>';}).join(''); }
var $=function(s){return main.querySelector(s);};
var st={q:'',when:'any',age:'',act:'',area:'',date:''}, shown=12;
var q=$('#rg-q'), w=$('#rg-when'), ag=$('#rg-age'), ac=$('#rg-act'), ar=$('#rg-area'), dt=$('#rg-date');
if(w) opts(w,WHEN.map(function(o){return[o.k,o.l];}));
if(ag) opts(ag,AGES.map(function(o){return[o.k,o.l];}));
if(ac) opts(ac,ACTS); if(ar) opts(ar,AREAS);
if(dt){dt.min=TODAY;dt.max='2027-08-31';}
var out=$('#rg-out'), title=$('#rg-title');
function heading(){
  var parts=[]; var wo=whenObj(st.when);
  if(st.date){var d=D(st.date);parts.push(['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]+', '+MON[d.getMonth()]+' '+d.getDate());}
  else if(wo&&st.when!=='any') parts.push(wo.l.split(' · ')[0]);
  return parts.length?'Happening '+parts.join(''):(OPT==='3'&&st.act?ACTS.filter(function(a){return a[0]===st.act;})[0][1]:'Coming up soonest');
}
function render(reset){
  if(reset) shown=OPT==='2'?20:12;
  var res=filter(st);
  if(title) title.textContent=heading();
  if(!res.length){ out.innerHTML='<div class="rg-empty"><p>Nothing matches all of those choices yet.</p><p style="margin-top:12px"><a class="btn coral" href="#" data-rg-reset>See everything</a></p></div>'; moreBtn(false); return; }
  if(OPT==='2'){ renderWeeks(res); return; }
  var html=res.slice(0,shown).map(card).join('');
  out.innerHTML='<div class="rg-grid">'+html+'</div>';
  moreBtn(res.length>shown);
}
function weekKey(it){ if(!it.s) return 'ongoing'; var s=it._k||it.s; var d=D(s); var m=add(d,-((d.getDay()+6)%7)); return iso(m);}
function weekName(k){ if(k==='ongoing') return ['Ongoing classes & lessons','Join any time; dates on the official page']; if(k==='weekly') return ['Weekly classes, lessons & leagues','Season runs several weeks']; var w=whenObj(k); var d=D(k), e=add(d,6); var sub=MON[d.getMonth()]+' '+d.getDate()+' – '+MON[e.getMonth()]+' '+e.getDate(); if(w&&w.tag) return [w.tag,sub]; if(k==='2026-11-16') return ['This week',MON[D(TODAY).getMonth()]+' '+D(TODAY).getDate()+' – '+MON[e.getMonth()]+' '+e.getDate()]; return ['Week of '+MON[d.getMonth()]+' '+d.getDate(),sub]; }
function renderWeeks(res){
  var groups={},order=[]; res.forEach(function(it){var k=weekKey(it); if(!groups[k]){groups[k]=[];order.push(k);} groups[k].push(it);});
  order.sort(function(a,b){var x=a==='ongoing'?'9999':a, y=b==='ongoing'?'9999':b; return x<y?-1:x>y?1:0;});
  var html='',n=0;
  order.forEach(function(k){ if(n>=shown) return; var nm=weekName(k); var its=groups[k].slice(0,shown-n); n+=its.length; html+='<div class="rg-wkhead"><h2>'+esc(nm[0])+'</h2><span>'+esc(nm[1])+'</span></div>'+its.map(row).join(''); });
  out.innerHTML='<div class="rg-list">'+html+'</div>';
  moreBtn(res.length>shown);
}
var more=$('#rg-more');
function moreBtn(on){ if(more) more.hidden=!on; }
if(more) more.querySelector('button').addEventListener('click',function(){shown+=12;render(false);});
main.addEventListener('click',function(e){ if(e.target.closest('[data-rg-reset]')){e.preventDefault(); resetAll(); }});
function resetAll(){ st={q:'',when:'any',age:'',act:'',area:'',date:''}; if(q)q.value=''; if(w)w.value='any'; if(ag)ag.value=''; if(ac)ac.value=''; if(ar)ar.value=''; if(dt)dt.value=''; syncWeeks(); syncTiles(); render(true); }
var tmr; if(q) q.addEventListener('input',function(){clearTimeout(tmr);tmr=setTimeout(function(){st.q=q.value.trim();render(true);},150);});
if(w) w.addEventListener('change',function(){st.when=w.value;st.date='';if(dt)dt.value='';syncWeeks();render(true);});
if(ag) ag.addEventListener('change',function(){st.age=ag.value;render(true);});
if(ac) ac.addEventListener('change',function(){st.act=ac.value;syncTiles();render(true);});
if(ar) ar.addEventListener('change',function(){st.area=ar.value;render(true);});
if(dt) dt.addEventListener('change',function(){st.date=dt.value;if(w&&dt.value)w.value='any';st.when='any';syncWeeks();render(true);});
// Option 2: week strip
var strip=$('#rg-weeks');
if(strip){
  var WK=[['any','All dates','Every week','']].concat(WHEN.filter(function(o){return o.r&&o.k.length===10;}).map(function(o){var d=D(o.r[0]);var e=D(o.r[1]); if(o.k==='2026-11-16') d=D(TODAY); return [o.k,o.tag||(o.k==='2026-11-16'?'This week':'Week of'),MON[d.getMonth()]+' '+d.getDate()+'–'+(e.getMonth()!==d.getMonth()?MON[e.getMonth()]+' ':'')+e.getDate(), ''];})).concat([['jan','Month','Rest of January',''],['feb','Month','February',''],['mar','Spring break','March',''],['later','Later','April & later','']]);
  strip.innerHTML=WK.map(function(o){var tag=/break|No school|Thanksgiving/i.test(o[1])?'School is out':'';return '<button type="button" class="rg-wk" data-wk="'+o[0]+'" aria-pressed="false"><small>'+o[1]+'</small><b>'+o[2]+'</b><span>'+tag+'&nbsp;</span></button>';}).join('');
  strip.addEventListener('click',function(e){var b=e.target.closest('[data-wk]'); if(!b) return; st.when=b.getAttribute('data-wk'); st.date=''; if(dt)dt.value=''; syncWeeks(); render(true);});
}
function syncWeeks(){ if(!strip) return; [].forEach.call(strip.querySelectorAll('[data-wk]'),function(b){b.setAttribute('aria-pressed',(b.getAttribute('data-wk')===st.when&&!st.date)?'true':'false');}); }
// Option 3: activity tiles
var tiles=$('#rg-tiles');
if(tiles){
  tiles.addEventListener('click',function(e){var b=e.target.closest('[data-act]'); if(!b) return; var k=b.getAttribute('data-act'); st.act=(st.act===k?'':k); if(ac) ac.value=st.act; syncTiles(); render(true); var r=$('#rg-results'); if(r) r.scrollIntoView({behavior:'smooth',block:'start'});});
  [].forEach.call(tiles.querySelectorAll('[data-act]'),function(b){var k=b.getAttribute('data-act'); });
}
function syncTiles(){ if(!tiles) return; [].forEach.call(tiles.querySelectorAll('[data-act]'),function(b){b.setAttribute('aria-pressed',b.getAttribute('data-act')===st.act?'true':'false');}); }
// deep link for testing: ?when=2026-12-21&age=5-7&q=swim&act=sports
var P=new URLSearchParams(location.search); ['q','when','age','act','area','date'].forEach(function(k){ if(P.get(k)){ st[k]=P.get(k); var el={q:q,when:w,age:ag,act:ac,area:ar,date:dt}[k]; if(el) el.value=st[k]; }});
syncWeeks(); syncTiles(); render(true);
})();
