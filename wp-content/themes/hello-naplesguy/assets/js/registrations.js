(function(){
'use strict';
var CFG=window.NG_REG||{};
var RAW=CFG.sessions||[];
var I=CFG.imgBase||'';
var CCPS=CFG.ccps||[];
function todayISO(){
  try{
    return new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  }catch(e){
    var d=new Date();
    var m=d.getMonth()+1,x=d.getDate();
    return d.getFullYear()+'-'+(m<10?'0':'')+m+'-'+(x<10?'0':'')+x;
  }
}
var TODAY=todayISO();
function isLive(s){
  if(s&&s.ongoing)return true;
  var e=(s&&(s.end||s.start))||'';
  if(!e)return true;
  return e>=TODAY;
}
var R=RAW.filter(isLive);
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
var MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
var DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],DOWL=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var $=function(i){return document.getElementById(i)};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function D(iso){return new Date(iso+'T12:00:00')}
function iso(d){var m=d.getMonth()+1,x=d.getDate();return d.getFullYear()+'-'+(m<10?'0':'')+m+'-'+(x<10?'0':'')+x}
function nd(s){if(!s)return'';var x=D(s);return DOW[x.getDay()]+' '+(x.getMonth()+1)+'/'+x.getDate()+'/'+String(x.getFullYear()).slice(2)}
function days(a,b){return Math.round((D(b)-D(a))/864e5)}
var WE=(function(){var d=D(TODAY);d.setDate(d.getDate()+((7-d.getDay())%7));return iso(d)})();
function catOf(r){if(r.fam==='daycamp')return 'daycamp';for(var i=1;i<CATS.length;i++){if(CATS[i].acts.some(function(a){return (r.acts||[]).indexOf(a)>-1}))return CATS[i].k}return 'daycamp'}
function photo(g){var c=CM[catOf(g[0])]||CM.daycamp;return [I+c.img+'.webp',c.alt]}
function key(s){if(s.ongoing||!s.start)return '9999';return s.start<TODAY?TODAY:s.start}
function groupBy(rows){var m={},o=[];rows.forEach(function(r){var k=r.pk+'|'+(r.prog||'').toLowerCase();if(!m[k]){m[k]=[];o.push(k)}m[k].push(r)});return o.map(function(k){return m[k].sort(function(a,b){return key(a)<key(b)?-1:key(a)>key(b)?1:0})})}
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
var S={cat:'',q:'',area:'',ccps:null};
function filt(){var c=S.cat?CM[S.cat]:null,q=S.q.trim().toLowerCase();
  return R.filter(function(r){
    if(S.area&&r.area!==S.area)return false;
    if(c&&!(r.acts||[]).some(function(a){return c.acts.indexOf(a)>-1})&&!(c.k==='daycamp'&&r.fam==='daycamp'))return false;
    if(q){var h=(r.place+' '+r.prog+' '+r.title+' '+r.town+' '+r.famL+' ').toLowerCase();if(q.split(/\s+/).some(function(w){return h.indexOf(w)<0}))return false}
    return true})}
function catCount(k){var c=CM[k];return groupBy(R.filter(function(r){return (r.acts||[]).some(function(a){return c.acts.indexOf(a)>-1})||(k==='daycamp'&&r.fam==='daycamp')})).length}
function nextBreak(){for(var i=0;i<CCPS.length;i++){if(CCPS[i].end>=TODAY)return CCPS[i]}return null}
function btns(g){var p=g[0],h='<div class="sr-btns"><a class="sr-btn" href="'+esc(link(g))+'" target="_blank" rel="noopener">'+(urls(g).length>1?'Official site':'Sign up')+'</a>';if(p.phone)h+='<a class="sr-btn alt" href="tel:'+tel(p.phone)+'">Call</a>';return h+'</div>'}
function moreDates(g){if(g.length<2)return '';return '<details class="sr-fold"><summary>'+(g.length===2?'See the other date':'See all '+g.length+' dates')+'</summary><ul>'+g.map(function(s){return '<li><b>'+esc(s.start?nd(s.start)+(s.end&&s.end!==s.start?' – '+nd(s.end):''):(s.when||'See official page'))+'</b>'+(s.ages?' · '+esc(s.ages):'')+(s.url?' <a href="'+esc(s.url)+'" target="_blank" rel="noopener">Sign up</a>':'')+'</li>'}).join('')+'</ul></details>'}
function placeLine(g){var p=g[0];var a=[];if(p.place&&p.place.toLowerCase()!==p.prog.toLowerCase())a.push(p.place);return a.join('')}
function meta(g){var p=g[0],m=[p.town],a=ages(g);if(a)m.push(a);return m.join(' · ')}
function photoCard(g){
  var ph=photo(g),p=g[0],s=next(g),sch=schedTxt(g),badge='';
  if(s&&s.start&&s.start>=TODAY){var x=D(s.start);badge='<span class="sr-date"><small>'+MON[x.getMonth()].slice(0,3)+'</small><b>'+x.getDate()+'</b></span>'}
  return '<article class="sr-card"><div class="sr-card-ph"><img loading="lazy" src="'+ph[0]+'" alt="'+esc(ph[1])+'">'+badge+(thisWeek(g)?'<span class="sr-tag">Starts this week</span>':'')+'</div><div class="sr-card-tx"><p class="sr-eye">'+esc(CM[catOf(p)].l)+'</p><h3>'+esc(p.prog)+'</h3><p class="sr-place">'+esc(placeLine(g))+'</p><p class="sr-meta">'+esc(meta(g))+'</p><p class="sr-when">'+esc(whenTxt(g))+'</p>'+(sch?'<p class="sr-sch">'+esc(sch)+'</p>':'')+'<p class="sr-price">'+esc(price(g))+'</p>'+moreDates(g)+btns(g)+'</div></article>'}
function byMonth(gs,cardFn,wrap){var o='',cur='',any=gs.filter(function(g){return gkey(g)==='9999'}),dated=gs.filter(function(g){return gkey(g)!=='9999'});
  dated.forEach(function(g){var x=D(gkey(g)),m=MON[x.getMonth()]+' '+x.getFullYear();if(m!==cur){if(cur)o+='</div>';o+='<h2 class="sr-month"><span>'+m+'</span></h2><div class="'+wrap+'">';cur=m}o+=cardFn(g)});
  if(cur)o+='</div>';if(any.length)o+='<h2 class="sr-month"><span>Sign up any time</span></h2><div class="'+wrap+'">'+any.map(cardFn).join('')+'</div>';return o}
function ccpsAll(rows,cardFn,wrap,only){var o='';CCPS.forEach(function(w){if(only&&only!==w.id)return;if(w.end<TODAY)return;var gs=ccpsHits(rows,w);o+='<div class="sr-break" id="brk-'+w.id+'"><h2>'+esc(w.name)+'</h2><p>'+esc(w.range)+(gs.length?' · '+gs.length+' open':'')+'</p></div>'+(gs.length?'<div class="'+wrap+'">'+gs.map(cardFn).join('')+'</div>':'<p class="sr-empty">Nothing listed for this day yet. See official pages.</p>')});return o}
function empty(){return '<p class="sr-empty">Nothing open matches that search. Try another activity or area.</p>'}
function countTxt(n){return n+(n===1?' program':' programs')}
function go(){var el=$('sr-results');if(el)el.scrollIntoView({behavior:'smooth'})}
function r2(){var rows=filt(),o,h;
  if(S.ccps){var w=CCPS.filter(function(x){return x.id===S.ccps})[0];o=ccpsAll(rows,photoCard,'sr-grid',S.ccps);h=w?'Open during '+w.name:'Open on CCPS school days off'}
  else{var gs=sortG(groupBy(rows));o=gs.length?byMonth(gs,photoCard,'sr-grid'):'';h=(S.cat&&CM[S.cat]?CM[S.cat].l+': ':'')+countTxt(gs.length)+' open for sign-up'}
  var head=$('sr-rhead'),out=$('sr-out');
  if(head)head.innerHTML=esc(h)+((S.ccps||S.cat)?' <button type="button" id="sr-clear" class="sr-clear">Show everything</button>':'');
  if(out)out.innerHTML=o||empty()}
function v2(){
  var love=$('sr-love');
  if(love)love.innerHTML=CATS.map(function(c){var n=catCount(c.k);if(!n)return '';return '<button type="button" class="sr-love" data-k="'+c.k+'"><img src="'+I+c.img+'.webp" alt="'+esc(c.alt)+'" loading="lazy"><span class="sr-love-sh"></span><span class="sr-love-tx"><b>'+esc(c.l)+'</b><small>'+n+' open</small></span></button>'}).join('');
  var nb=nextBreak();
  var strip=$('sr-strip');
  if(strip)strip.innerHTML=CCPS.filter(function(w){return w.end>=TODAY}).map(function(w){var a=D(w.start),b=D(w.end),n=ccpsHits(R,w).length,same=w.start===w.end;
    return '<button type="button" class="sr-day'+(w===nb?' next':'')+'" data-w="'+w.id+'"><small>'+MON[a.getMonth()].slice(0,3)+((same||a.getMonth()===b.getMonth())?'':' – '+MON[b.getMonth()].slice(0,3))+'</small><b>'+a.getDate()+(same?'':'–'+b.getDate())+'</b><span>'+esc(w.name)+'</span><em>'+(n?n+' open':'See official pages')+'</em></button>'}).join('');
  var nextEl=$('sr-next');
  if(nb&&nextEl){var d=days(TODAY,nb.start);nextEl.textContent=d>0?nb.name+' starts in '+d+(d===1?' day':' days'):nb.name+' is here'}
  var cat=$('sr-cat'),area=$('sr-area'),q=$('sr-q');
  if(cat)cat.innerHTML='<option value="">All activities</option>'+CATS.map(function(c){return '<option value="'+c.k+'">'+esc(c.l)+'</option>'}).join('');
  if(area)area.innerHTML='<option value="">All areas</option>'+AREAS.map(function(a){return '<option value="'+a[0]+'">'+esc(a[1])+'</option>'}).join('');
  if(q)q.addEventListener('input',function(){S.q=this.value;r2()});
  if(cat)cat.addEventListener('change',function(){S.cat=this.value;S.ccps=null;r2()});
  if(area)area.addEventListener('change',function(){S.area=this.value;r2()});
  document.addEventListener('click',function(e){
    var l=e.target.closest('.sr-love');if(l){S.cat=l.dataset.k;if(cat)cat.value=S.cat;S.ccps=null;r2();go();return}
    var d=e.target.closest('.sr-day');if(d){S.ccps=d.dataset.w;S.cat='';if(cat)cat.value='';[].forEach.call(document.querySelectorAll('.sr-day'),function(x){x.classList.toggle('on',x===d)});r2();go();return}
    var c=e.target.closest('#sr-clear');if(c){S.ccps=null;S.cat='';if(cat)cat.value='';[].forEach.call(document.querySelectorAll('.sr-day'),function(x){x.classList.remove('on')});r2();return}
    var a=e.target.closest('#sr-ccps');if(a){e.preventDefault();var sec=$('sr-ccps-sec');if(sec)sec.scrollIntoView({behavior:'smooth'})}
  });
  r2();
}
document.addEventListener('DOMContentLoaded',function(){
  var t=D(TODAY),el=$('sr-today');
  if(el)el.textContent='Today is '+DOWL[t.getDay()]+', '+(t.getMonth()+1)+'/'+t.getDate()+'/'+String(t.getFullYear()).slice(2);
  v2();
});
})();
