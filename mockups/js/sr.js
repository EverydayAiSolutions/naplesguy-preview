(function(){
var R=window.SU_ROWS||[],TODAY=window.REG_TODAY||'2026-11-17',V=document.documentElement.getAttribute('data-sr');
var I='/naplesguy-preview/mockups/img/sr-';
var CATS=[
 {k:'daycamp',l:'Camps',acts:['daycamp'],img:'daycamp',alt:'Kids playing with a colorful parachute at camp'},
 {k:'swim',l:'Swimming',acts:['swim'],img:'swim',alt:'A smiling boy swimming underwater in goggles'},
 {k:'soccer',l:'Soccer',acts:['soccer'],img:'soccer',alt:'Kids celebrating during a soccer game'},
 {k:'basketball',l:'Basketball',acts:['basketball'],img:'basketball',alt:'Happy kids with a basketball under a blue sky'},
 {k:'baseball',l:'Baseball & Softball',acts:['baseball'],img:'baseball',alt:'Kids playing baseball on a field lined with palm trees'},
 {k:'football',l:'Flag Football',acts:['football'],img:'football',alt:'A young player throwing in a flag football game'},
 {k:'volleyball',l:'Volleyball',acts:['volleyball'],img:'volleyball',alt:'Beach volleyball on a sunny day'},
 {k:'golf',l:'Golf',acts:['golf'],img:'golf',alt:'A smiling girl holding a golf club on the course'},
 {k:'gym',l:'Gymnastics',acts:['gym'],img:'gym',alt:'A girl doing the splits on colorful gym mats'},
 {k:'cheer',l:'Cheer',acts:['cheer'],img:'cheer',alt:'A cheer team practicing a stunt'},
 {k:'dance',l:'Dance',acts:['dance'],img:'dance',alt:'Children dancing joyfully in a bright studio'},
 {k:'music',l:'Music',acts:['music'],img:'music',alt:'A cheerful boy playing an acoustic guitar'},
 {k:'art',l:'Art',acts:['art'],img:'art',alt:'A laughing child with hands and face covered in bright paint'},
 {k:'theater',l:'Acting & Theater',acts:['theater'],img:'theater',alt:'Two children in costume performing on a small stage'},
 {k:'stem',l:'STEM & Science',acts:['stem','nature'],img:'stem',alt:'A boy holding up a flask in a science class'},
 {k:'teens',l:'Teens',acts:['teens'],img:'teens',alt:'A smiling teen holding a skateboard'}
];
var CM={};CATS.forEach(function(c){CM[c.k]=c});
var AREAS=[['naples','Naples'],['bonita','Bonita Springs & Estero'],['fortmyers','Fort Myers & Cape Coral'],['home','Comes to your home']];
var CCPS=[
 {id:'fall',name:'Fall Break',range:'Mon 11/23 to Fri 11/27',start:'2026-11-23',end:'2026-11-27'},
 {id:'winter',name:'Winter Break',range:'Mon 12/21 to Fri 1/1',start:'2026-12-21',end:'2027-01-01'},
 {id:'plan-jan4',name:'Teacher Plan Day',range:'Mon 1/4/27',start:'2027-01-04',end:'2027-01-04'},
 {id:'mlk',name:'Martin Luther King Jr. Day',range:'Mon 1/18/27',start:'2027-01-18',end:'2027-01-18'},
 {id:'pres',name:"Presidents' Day",range:'Mon 2/15/27',start:'2027-02-15',end:'2027-02-15'},
 {id:'plan-mar19',name:'Teacher Plan Day',range:'Fri 3/19/27',start:'2027-03-19',end:'2027-03-19'},
 {id:'spring',name:'Spring Break',range:'Mon 3/22 to Mon 3/29',start:'2027-03-22',end:'2027-03-29'}
];
var MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
var DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],DOWL=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var $=function(i){return document.getElementById(i)};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function D(iso){return new Date(iso+'T12:00:00')}
function iso(d){var m=d.getMonth()+1,x=d.getDate();return d.getFullYear()+'-'+(m<10?'0':'')+m+'-'+(x<10?'0':'')+x}
function nd(s){if(!s)return'';var x=D(s);return DOW[x.getDay()]+' '+(x.getMonth()+1)+'/'+x.getDate()+'/'+String(x.getFullYear()).slice(2)}
function sd(s){var x=D(s);return (x.getMonth()+1)+'/'+x.getDate()}
function days(a,b){return Math.round((D(b)-D(a))/864e5)}
var WE=(function(){var d=D(TODAY);d.setDate(d.getDate()+((7-d.getDay())%7));return iso(d)})();
function catOf(r){if(r.fam==='daycamp')return 'daycamp';for(var i=1;i<CATS.length;i++){if(CATS[i].acts.some(function(a){return r.acts.indexOf(a)>-1}))return CATS[i].k}return 'daycamp'}
function photo(g){var c=CM[catOf(g[0])]||CM.daycamp;return [I+c.img+'.webp',c.alt]}
function key(s){if(s.ongoing||!s.start)return '9999';return s.start<TODAY?TODAY:s.start}
function groupBy(rows){var m={},o=[];rows.forEach(function(r){var k=r.pk+'|'+r.prog.toLowerCase();if(!m[k]){m[k]=[];o.push(k)}m[k].push(r)});return o.map(function(k){return m[k].sort(function(a,b){return key(a)<key(b)?-1:key(a)>key(b)?1:0})})}
function sortG(gs){return gs.sort(function(x,y){var a=gkey(x),b=gkey(y);if(a<b)return -1;if(a>b)return 1;return x[0].prog.localeCompare(y[0].prog)})}
function gkey(g){var k=g.map(key).sort();return k[0]}
function next(g){var d=g.filter(function(s){return s.start&&(s.start>=TODAY||(s.end&&s.end>=TODAY))}).sort(function(a,b){return a.start<b.start?-1:1});return d[0]||null}
function ages(g){var mn=99,mx=-1,t='';g.forEach(function(s){if(s.amin!=null&&s.amax!=null){mn=Math.min(mn,s.amin);mx=Math.max(mx,s.amax)}else if(s.ages&&!t)t=s.ages});if(mx>=0)return 'Ages '+(mn==mx?mn:mn+'–'+mx);return t}
function price(g){var u=[];g.forEach(function(s){if(s.price&&u.indexOf(s.price)<0)u.push(s.price)});return u.length?(u.length==1?u[0]:u[0]+' (varies)'):'See official page'}
function urls(g){var u=[];g.forEach(function(s){if(s.url&&u.indexOf(s.url)<0)u.push(s.url)});return u}
function link(g){var u=urls(g);return u.length===1?u[0]:(g[0].site||u[0]||'#')}
function tel(p){return (p||'').replace(/[^0-9+]/g,'')}
function thisWeek(g){return g.some(function(s){return s.start&&s.start>=TODAY&&s.start<=WE})}
function whenTxt(g){var s=next(g),p=g[0];
  if(!s){return p.ongoing?'Sign up any time':'Dates: See official page'}
  var e=(s.end&&s.end!==s.start)?' – '+nd(s.end):'';
  if(s.start<=TODAY)return 'Running now'+(s.end?', through '+nd(s.end):'');
  return 'Starts '+nd(s.start)+e;}
function schedTxt(g){var s=next(g)||g[0];var w=(s.when||'').trim();if(!w||/official page/i.test(w))return '';if(/^[A-Z][a-z]{2}, [A-Z][a-z]{2} \d/.test(w))return '';return w.length>70?w.slice(0,68)+'…':w}
function isDay(r){if(r.kind==='Camp')return true;if((r.acts||[]).indexOf('daycamp')>-1)return true;return /fun day|no school|holiday camp|break camp|day camp/i.test((r.title||'')+' '+(r.prog||''))}
function covers(r,w){if(!r.start)return false;var e=r.end||r.start;return r.start<=w.end&&e>=w.start}
function ccpsHits(rows,w){return sortG(groupBy(rows.filter(function(r){return isDay(r)&&covers(r,w)})))}
var S={cat:'',q:'',area:'',ccps:null,view:'soon',day:null};
function filt(){var c=S.cat?CM[S.cat]:null,q=S.q.trim().toLowerCase();
  return R.filter(function(r){
    if(S.area&&r.area!==S.area)return false;
    if(c&&!r.acts.some(function(a){return c.acts.indexOf(a)>-1})&&!(c.k==='daycamp'&&r.fam==='daycamp'))return false;
    if(q){var h=(r.place+' '+r.prog+' '+r.title+' '+r.town+' '+r.famL+' '+(c?'':'')).toLowerCase();if(q.split(/\s+/).some(function(w){return h.indexOf(w)<0}))return false}
    return true})}
function catCount(k){var c=CM[k];return groupBy(R.filter(function(r){return r.acts.some(function(a){return c.acts.indexOf(a)>-1})||(k==='daycamp'&&r.fam==='daycamp')})).length}
function nextBreak(){for(var i=0;i<CCPS.length;i++){if(CCPS[i].end>=TODAY)return CCPS[i]}return null}
function btns(g,cls){var p=g[0],h='<div class="sr-btns'+(cls?' '+cls:'')+'"><a class="sr-btn" href="'+esc(link(g))+'" target="_blank" rel="noopener">'+(urls(g).length>1?'Official site':'Sign up')+'</a>';if(p.phone)h+='<a class="sr-btn alt" href="tel:'+tel(p.phone)+'">Call</a>';return h+'</div>'}
function moreDates(g){if(g.length<2)return '';return '<details class="sr-fold"><summary>'+(g.length===2?'See the other date':'See all '+g.length+' dates')+'</summary><ul>'+g.map(function(s){return '<li><b>'+esc(s.start?nd(s.start)+(s.end&&s.end!==s.start?' – '+nd(s.end):''):(s.when||'See official page'))+'</b>'+(s.ages?' · '+esc(s.ages):'')+(s.url?' <a href="'+esc(s.url)+'" target="_blank" rel="noopener">Sign up</a>':'')+'</li>'}).join('')+'</ul></details>'}
function placeLine(g){var p=g[0];var a=[];if(p.place&&p.place.toLowerCase()!==p.prog.toLowerCase())a.push(p.place);return a.join('')}
function meta(g){var p=g[0],m=[p.town],a=ages(g);if(a)m.push(a);return m.join(' · ')}
/* ---------- shared card styles ---------- */
function rowCard(g){ /* option 1 list row */
  var ph=photo(g),p=g[0],sch=schedTxt(g);
  return '<article class="sr-row"><div class="sr-row-ph"><img loading="lazy" src="'+ph[0]+'" alt="'+esc(ph[1])+'">'+(thisWeek(g)?'<span class="sr-tag">This week</span>':'')+'</div><div class="sr-row-tx"><p class="sr-eye">'+esc(CM[catOf(p)].l)+'</p><h3>'+esc(p.prog)+'</h3><p class="sr-place">'+esc(placeLine(g))+'</p><p class="sr-meta">'+esc(meta(g))+'</p><p class="sr-when">'+esc(whenTxt(g))+'</p>'+(sch?'<p class="sr-sch">'+esc(sch)+'</p>':'')+'<p class="sr-price">'+esc(price(g))+'</p>'+moreDates(g)+btns(g)+'</div></article>'}
function photoCard(g){ /* option 2 grid card */
  var ph=photo(g),p=g[0],s=next(g),sch=schedTxt(g),badge='';
  if(s&&s.start&&s.start>=TODAY){var x=D(s.start);badge='<span class="sr-date"><small>'+MON[x.getMonth()].slice(0,3)+'</small><b>'+x.getDate()+'</b></span>'}
  return '<article class="sr-card"><div class="sr-card-ph"><img loading="lazy" src="'+ph[0]+'" alt="'+esc(ph[1])+'">'+badge+(thisWeek(g)?'<span class="sr-tag">Starts this week</span>':'')+'</div><div class="sr-card-tx"><p class="sr-eye">'+esc(CM[catOf(p)].l)+'</p><h3>'+esc(p.prog)+'</h3><p class="sr-place">'+esc(placeLine(g))+'</p><p class="sr-meta">'+esc(meta(g))+'</p><p class="sr-when">'+esc(whenTxt(g))+'</p>'+(sch?'<p class="sr-sch">'+esc(sch)+'</p>':'')+'<p class="sr-price">'+esc(price(g))+'</p>'+moreDates(g)+btns(g)+'</div></article>'}
function agendaItem(g){ /* option 3 */
  var ph=photo(g),p=g[0],sch=schedTxt(g);
  return '<article class="sr-ag-item"><img loading="lazy" src="'+ph[0]+'" alt="'+esc(ph[1])+'"><div><p class="sr-eye">'+esc(CM[catOf(p)].l)+(thisWeek(g)?' <span class="sr-tag">This week</span>':'')+'</p><h3>'+esc(p.prog)+'</h3><p class="sr-place">'+esc(placeLine(g))+'</p><p class="sr-meta">'+esc(meta(g))+'</p><p class="sr-when">'+esc(whenTxt(g))+'</p>'+(sch?'<p class="sr-sch">'+esc(sch)+'</p>':'')+'<p class="sr-price">'+esc(price(g))+'</p>'+moreDates(g)+btns(g)+'</div></article>'}
function byMonth(gs,cardFn,wrap){var o='',cur='',any=gs.filter(function(g){return gkey(g)==='9999'}),dated=gs.filter(function(g){return gkey(g)!=='9999'});
  dated.forEach(function(g){var x=D(gkey(g)),m=MON[x.getMonth()]+' '+x.getFullYear();if(m!==cur){if(cur)o+='</div>';o+='<h2 class="sr-month"><span>'+m+'</span></h2><div class="'+wrap+'">';cur=m}o+=cardFn(g)});
  if(cur)o+='</div>';if(any.length)o+='<h2 class="sr-month"><span>Sign up any time</span></h2><div class="'+wrap+'">'+any.map(cardFn).join('')+'</div>';return o}
function ccpsAll(rows,cardFn,wrap,only){var o='';CCPS.forEach(function(w){if(only&&only!==w.id)return;if(w.end<TODAY)return;var gs=ccpsHits(rows,w);o+='<div class="sr-break" id="brk-'+w.id+'"><h2>'+esc(w.name)+'</h2><p>'+esc(w.range)+(gs.length?' · '+gs.length+' open':'')+'</p></div>'+(gs.length?'<div class="'+wrap+'">'+gs.map(cardFn).join('')+'</div>':'<p class="sr-empty">Nothing listed for this day yet. See official pages.</p>')});return o}
function empty(){return '<p class="sr-empty">Nothing open matches that search. Try another activity or area.</p>'}
function countTxt(n){return n+(n===1?' program':' programs')}
/* ---------- OPTION 1 ---------- */
function v1(){
  var nb=nextBreak();
  $('sr-chips').innerHTML='<button class="sr-chip on" data-k=""><span class="sr-chip-ph sr-chip-all"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/></svg></span>All</button>'+CATS.map(function(c){return '<button class="sr-chip" data-k="'+c.k+'"><span class="sr-chip-ph"><img src="'+I+c.img+'.webp" alt="" loading="lazy"></span>'+esc(c.l)+'</button>'}).join('');
  if(nb){var d=days(TODAY,nb.start),n=ccpsHits(R,nb).length;
    $('sr-count').innerHTML='<div class="sr-cd-num"><b>'+(d>0?d:0)+'</b><span>'+(d===1?'day':'days')+'</span></div><div class="sr-cd-tx"><p class="sr-cd-k">School\'s out soon</p><p class="sr-cd-h">'+esc(nb.name)+' starts '+nd(nb.start)+'</p><p class="sr-cd-s">'+countTxt(n)+' run those days</p></div><button type="button" class="sr-btn" id="sr-ccps" aria-pressed="false">CCPS School Days Off</button>'}
  var wk=sortG(groupBy(R.filter(function(r){return r.start&&r.start>=TODAY&&r.start<=WE})));
  $('sr-week').innerHTML=wk.map(function(g){var ph=photo(g),s=next(g);return '<a class="sr-wk" href="'+esc(link(g))+'" target="_blank" rel="noopener"><img src="'+ph[0]+'" alt="'+esc(ph[1])+'" loading="lazy"><span class="sr-wk-sh"></span><span class="sr-wk-tx"><small>'+esc(nd(s.start))+'</small><b>'+esc(g[0].prog)+'</b><em>'+esc(g[0].place)+'</em></span></a>'}).join('');
  if(!wk.length)$('sr-week-wrap').hidden=true;
  document.addEventListener('click',function(e){var c=e.target.closest('.sr-chip');if(c){S.cat=c.dataset.k;[].forEach.call(document.querySelectorAll('.sr-chip'),function(x){x.classList.toggle('on',x===c)});r1()}
    var b=e.target.closest('#sr-ccps');if(b){var on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on);b.textContent=on?'Show all sign-ups':'CCPS School Days Off';S.ccps=on;r1();$('sr-results').scrollIntoView({behavior:'smooth'})}});
  r1();
}
function r1(){var rows=filt(),o;if(S.ccps)o=ccpsAll(rows,rowCard,'sr-rows');else{var gs=sortG(groupBy(rows));o=gs.length?byMonth(gs,rowCard,'sr-rows'):'';$('sr-rcount').textContent=countTxt(gs.length)+' open for sign-up'}
  if(S.ccps)$('sr-rcount').textContent='Open on CCPS school days off';
  $('sr-out').innerHTML=o||empty()}
/* ---------- OPTION 2 ---------- */
function v2(){
  $('sr-love').innerHTML=CATS.map(function(c){var n=catCount(c.k);if(!n)return '';return '<button class="sr-love" data-k="'+c.k+'"><img src="'+I+c.img+'.webp" alt="'+esc(c.alt)+'" loading="lazy"><span class="sr-love-sh"></span><span class="sr-love-tx"><b>'+esc(c.l)+'</b><small>'+n+' open</small></span></button>'}).join('');
  var nb=nextBreak();
  $('sr-strip').innerHTML=CCPS.filter(function(w){return w.end>=TODAY}).map(function(w){var a=D(w.start),b=D(w.end),n=ccpsHits(R,w).length,same=w.start===w.end;
    return '<button class="sr-day'+(w===nb?' next':'')+'" data-w="'+w.id+'"><small>'+MON[a.getMonth()].slice(0,3)+((same||a.getMonth()===b.getMonth())?'':' – '+MON[b.getMonth()].slice(0,3))+'</small><b>'+a.getDate()+(same?'':'–'+b.getDate())+'</b><span>'+esc(w.name)+'</span><em>'+(n?n+' open':'See official pages')+'</em></button>'}).join('');
  if(nb){var d=days(TODAY,nb.start);$('sr-next').textContent=d>0?nb.name+' starts in '+d+(d===1?' day':' days'):nb.name+' is here'}
  $('sr-cat').innerHTML='<option value="">All activities</option>'+CATS.map(function(c){return '<option value="'+c.k+'">'+esc(c.l)+'</option>'}).join('');
  $('sr-area').innerHTML='<option value="">All areas</option>'+AREAS.map(function(a){return '<option value="'+a[0]+'">'+esc(a[1])+'</option>'}).join('');
  $('sr-q').addEventListener('input',function(){S.q=this.value;r2()});
  $('sr-cat').addEventListener('change',function(){S.cat=this.value;S.ccps=null;r2()});
  $('sr-area').addEventListener('change',function(){S.area=this.value;r2()});
  document.addEventListener('click',function(e){var l=e.target.closest('.sr-love');if(l){S.cat=l.dataset.k;$('sr-cat').value=S.cat;S.ccps=null;r2();go()}
    var d=e.target.closest('.sr-day');if(d){S.ccps=d.dataset.w;S.cat='';$('sr-cat').value='';[].forEach.call(document.querySelectorAll('.sr-day'),function(x){x.classList.toggle('on',x===d)});r2();go()}
    var c=e.target.closest('#sr-clear');if(c){S.ccps=null;S.cat='';$('sr-cat').value='';[].forEach.call(document.querySelectorAll('.sr-day'),function(x){x.classList.remove('on')});r2()}
    var a=e.target.closest('#sr-ccps');if(a){e.preventDefault();$('sr-ccps-sec').scrollIntoView({behavior:'smooth'})}});
  r2();
}
function go(){$('sr-results').scrollIntoView({behavior:'smooth'})}
function r2(){var rows=filt(),o,h;
  if(S.ccps){var w=CCPS.filter(function(x){return x.id===S.ccps})[0];o=ccpsAll(rows,photoCard,'sr-grid',S.ccps);h='Open during '+w.name}
  else{var gs=sortG(groupBy(rows));o=gs.length?byMonth(gs,photoCard,'sr-grid'):'';h=(S.cat?CM[S.cat].l+': ':'')+countTxt(gs.length)+' open for sign-up'}
  $('sr-rhead').innerHTML=esc(h)+((S.ccps||S.cat)?' <button type="button" id="sr-clear" class="sr-clear">Show everything</button>':'');
  $('sr-out').innerHTML=o||empty()}
/* ---------- OPTION 3 ---------- */
var ICO={daycamp:'<path d="M3 20L12 4l9 16H3z"/><path d="M12 20v-6"/>',swim:'<path d="M2 15c2 0 2-1.5 4-1.5S8 15 10 15s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/><path d="M2 19c2 0 2-1.5 4-1.5S8 19 10 19s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/><circle cx="15" cy="6" r="2"/><path d="M5 12l4-4 3 3"/>',soccer:'<circle cx="12" cy="12" r="9"/><path d="M12 7l4 3-1.5 4.5h-5L8 10z"/>',basketball:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18M5.5 5.5c3 3 3 10 0 13M18.5 5.5c-3 3-3 10 0 13"/>',baseball:'<circle cx="12" cy="12" r="9"/><path d="M7 4.5c2 4 2 11 0 15M17 4.5c-2 4-2 11 0 15"/>',football:'<path d="M4 4v17M4 4h12l-3 4 3 4H4"/>',volleyball:'<circle cx="12" cy="12" r="9"/><path d="M12 3c0 5 3 8 8 9M12 12c-4 3-5 6-4 8.5M12 12c-4-2-7-2-9 0"/>',golf:'<path d="M8 21V3l9 4-9 4"/><ellipse cx="10" cy="21" rx="6" ry="1"/>',gym:'<path d="M12 2l2.5 6.5H21l-5.3 4 2 6.5L12 15l-5.7 4 2-6.5L3 8.5h6.5z"/>',cheer:'<path d="M3 10v4l11 5V5L3 10z"/><path d="M14 8a4 4 0 010 8"/>',dance:'<circle cx="13" cy="4" r="2"/><path d="M13 7l-2 6 4 3-1 6M11 13l-5 2M13 8l5 2"/>',music:'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',art:'<path d="M12 3a9 9 0 100 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2-1.5h2a4 4 0 004-4c0-4.5-4-8-9-8z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7" r="1"/>',theater:'<path d="M4 4h16v6a8 8 0 01-16 0z"/><path d="M8 9h.01M16 9h.01M9 13c1.5 1.5 4.5 1.5 6 0"/>',stem:'<path d="M9 3h6M10 3v6L4 20h16L14 9V3"/><path d="M7 15h10"/>',teens:'<path d="M3 15h18M6 15l-1 3M18 15l1 3"/><circle cx="7" cy="19.5" r="1.5"/><circle cx="17" cy="19.5" r="1.5"/>'};
function ico(k){return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(ICO[k]||'<rect x="4" y="4" width="16" height="16" rx="3"/>')+'</svg>'}
var CALM=null;
function v3(){
  $('sr-pills').innerHTML='<button class="sr-pill on" data-k="">All</button>'+CATS.map(function(c){return '<button class="sr-pill" data-k="'+c.k+'">'+ico(c.k)+esc(c.l)+'</button>'}).join('');
  $('sr-area').innerHTML='<option value="">All areas</option>'+AREAS.map(function(a){return '<option value="'+a[0]+'">'+esc(a[1])+'</option>'}).join('');
  CALM=D(TODAY);CALM.setDate(1);cal();
  $('sr-q').addEventListener('input',function(){S.q=this.value;r3()});
  $('sr-area').addEventListener('change',function(){S.area=this.value;r3();cal()});
  document.addEventListener('click',function(e){
    var p=e.target.closest('.sr-pill');if(p){S.cat=p.dataset.k;[].forEach.call(document.querySelectorAll('.sr-pill'),function(x){x.classList.toggle('on',x===p)});r3();cal()}
    var t=e.target.closest('.sr-seg button');if(t){S.view=t.dataset.v;S.day=null;[].forEach.call(document.querySelectorAll('.sr-seg button'),function(x){x.setAttribute('aria-selected',x===t)});r3();cal()}
    var nv=e.target.closest('.sr-cal-nav');if(nv){CALM.setMonth(CALM.getMonth()+(+nv.dataset.d));cal()}
    var dy=e.target.closest('.sr-cal-d[data-d]');if(dy){S.day=(S.day===dy.dataset.d)?null:dy.dataset.d;cal();r3();if(S.day)$('sr-results').scrollIntoView({behavior:'smooth'})}
    var cl=e.target.closest('#sr-dayclear');if(cl){S.day=null;cal();r3()}});
  r3();
}
function breakOn(d){for(var i=0;i<CCPS.length;i++){if(d>=CCPS[i].start&&d<=CCPS[i].end)return CCPS[i]}return null}
function cal(){var rows=filt(),y=CALM.getFullYear(),m=CALM.getMonth(),first=new Date(y,m,1,12),n=new Date(y,m+1,0).getDate(),h='';
  var starts={};rows.forEach(function(r){if(r.start&&r.start>=TODAY)starts[r.start]=(starts[r.start]||0)+1});
  var minM=D(TODAY);minM.setDate(1);
  h+='<div class="sr-cal-top"><button class="sr-cal-nav" data-d="-1" aria-label="Previous month"'+(first<=minM?' disabled':'')+'>‹</button><b>'+MON[m]+' '+y+'</b><button class="sr-cal-nav" data-d="1" aria-label="Next month"'+(y>=2027&&m>=4?' disabled':'')+'>›</button></div><div class="sr-cal-g">';
  ['S','M','T','W','T','F','S'].forEach(function(x){h+='<span class="sr-cal-w">'+x+'</span>'});
  for(var i=0;i<first.getDay();i++)h+='<span></span>';
  for(var d=1;d<=n;d++){var s=iso(new Date(y,m,d,12)),b=breakOn(s),past=s<TODAY,c='sr-cal-d'+(b?' off':'')+(s===TODAY?' today':'')+(past?' past':'')+(S.day===s?' sel':'');
    h+='<button class="'+c+'"'+(past?' disabled':' data-d="'+s+'"')+' aria-label="'+DOWL[D(s).getDay()]+' '+sd(s)+(b?', no school: '+esc(b.name):'')+'">'+d+(starts[s]&&!past?'<i></i>':'')+'</button>'}
  h+='</div><p class="sr-cal-key"><span class="k-off"></span>No school (CCPS) <span class="k-dot"></span>Something starts</p>';
  $('sr-cal').innerHTML=h}
function r3(){var rows=filt(),o='',h='';
  if(S.day){var b=breakOn(S.day);var st=sortG(groupBy(rows.filter(function(r){return r.start===S.day})));var run=b?sortG(groupBy(rows.filter(function(r){return isDay(r)&&covers(r,{start:S.day,end:S.day})&&r.start!==S.day}))):[];
    h=nd(S.day)+(b?' · '+b.name:'');
    o+=(st.length?'<h2 class="sr-month"><span>Starting this day</span></h2><div class="sr-ag-list">'+st.map(agendaItem).join('')+'</div>':'')+(run.length?'<h2 class="sr-month"><span>Camps running this day</span></h2><div class="sr-ag-list">'+run.map(agendaItem).join('')+'</div>':'');
    if(!o)o='<p class="sr-empty">Nothing starts this day. Tap another date.</p>';
    $('sr-rhead').innerHTML=esc(h)+' <button type="button" id="sr-dayclear" class="sr-clear">Back to full list</button>';$('sr-out').innerHTML=o;return}
  if(S.view==='ccps'){o=ccpsAll(rows,agendaItem,'sr-ag-list');h='Open on CCPS school days off'}
  else{var gs=sortG(groupBy(rows));
    if(S.view==='any'){gs=gs.filter(function(g){return gkey(g)==='9999'});h=countTxt(gs.length)+' you can join any time';o=gs.length?'<div class="sr-ag-list">'+gs.map(agendaItem).join('')+'</div>':''}
    else{gs=gs.filter(function(g){return gkey(g)!=='9999'});h=countTxt(gs.length)+' starting soon';
      var cur='',bucket={},order=[];gs.forEach(function(g){var st=g.map(function(x){return x.start||'9999'}).sort()[0];var k=(st<TODAY)?'now':gkey(g);if(!bucket[k]){bucket[k]=[];order.push(k)}bucket[k].push(g)});
      order.forEach(function(k){var lab;if(k==='now'){lab='Already underway, ask about joining';var dc='<div class="sr-ag-date now"><small>Now</small><b>•</b></div>'}else{var x=D(k);lab=MON[x.getMonth()]+' '+x.getFullYear();var dc='<div class="sr-ag-date"><small>'+DOW[x.getDay()]+'</small><b>'+x.getDate()+'</b><small>'+MON[x.getMonth()].slice(0,3)+'</small></div>'}
        if(lab!==cur){if(cur)o+='</div>';o+='<h2 class="sr-month"><span>'+lab+'</span></h2><div class="sr-ag">';cur=lab}
        o+='<div class="sr-ag-day">'+dc+'<div class="sr-ag-list">'+bucket[k].map(agendaItem).join('')+'</div></div>'});
      if(cur)o+='</div>'}}
  $('sr-rhead').textContent=h;$('sr-out').innerHTML=o||empty()}
document.addEventListener('DOMContentLoaded',function(){
  var t=D(TODAY),el=$('sr-today');if(el)el.textContent='Today is '+DOWL[t.getDay()]+', '+(t.getMonth()+1)+'/'+t.getDate()+'/'+String(t.getFullYear()).slice(2);
  if(V==='1'){var q=$('sr-q');q.addEventListener('input',function(){S.q=this.value;r1()});$('sr-area').innerHTML='<option value="">All areas</option>'+AREAS.map(function(a){return '<option value="'+a[0]+'">'+esc(a[1])+'</option>'}).join('');$('sr-area').addEventListener('change',function(){S.area=this.value;r1()});v1()}
  if(V==='2')v2();if(V==='3')v3();
});
})();
