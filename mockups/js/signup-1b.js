(function(){
var R=window.SU_ROWS||[],TODAY=window.REG_TODAY||'2026-11-17';
var T='/naplesguy-preview/wp-content/themes/hello-naplesguy/assets/img/';
var M='/naplesguy-preview/mockups/img/';
var PHOTOS={
  swim:[T+'fe-theme-swim.webp','Children in a swimming lesson'],
  soccer:[T+'fe-theme-soccer.webp','Kids playing soccer'],
  baseball:[T+'fe-theme-baseball.webp','A child at a baseball game'],
  basketball:[T+'fe-theme-basketball.webp','Kids playing basketball'],
  football:[M+'act-flag-football.webp','Kids playing flag football'],
  volleyball:[T+'fe-theme-volleyball.webp','Kids playing volleyball'],
  tennis:[M+'act-tennis.webp','A child in a tennis lesson'],
  pickleball:[M+'act-pickleball.webp','People playing pickleball'],
  golf:[M+'act-golf.webp','A child learning golf'],
  martial:[M+'act-martial-arts.webp','Children in a martial arts class'],
  gym:[M+'act-gymnastics.webp','A child in a gymnastics class'],
  cheer:[T+'fe-theme-cheer.webp','Kids in a cheer class'],
  dance:[M+'act-dance.webp','Children in a dance class'],
  music:[M+'act-music.webp','A child at a piano lesson'],
  art:[T+'fe-theme-art-workshop.webp','Children in an art workshop'],
  theater:[T+'fe-theme-theater.webp','Kids in a theater class'],
  stem:[T+'fe-theme-science-kids.webp','Children in a science activity'],
  nature:[T+'fe-theme-nature-wildlife.webp','Children exploring nature'],
  horse:[M+'act-horseback.webp','A child horseback riding'],
  daycamp:[T+'fe-theme-camp.webp','Kids at a day camp'],
  teens:[T+'fe-theme-bmx-skate.webp','Teens at a skate park']
};
var ACTS=[['','All activities',[]],['swim','Swimming',['swim']],['soccer','Soccer',['soccer']],['baseball','Baseball & Softball',['baseball']],['basketball','Basketball',['basketball']],['football','Flag Football',['football']],['volleyball','Volleyball',['volleyball']],['golf','Golf',['golf']],['gym','Gymnastics',['gym']],['cheer','Cheer',['cheer']],['dance','Dance',['dance']],['music','Music',['music']],['art','Art',['art']],['theater','Acting & Theater',['theater']],['stem','STEM & Nature',['stem','nature']],['daycamp','Day Camps',['daycamp']],['teens','Teens',['teens']]];
var AREAS=[['naples','Naples'],['bonita','Bonita Springs & Estero'],['fortmyers','Fort Myers & Cape Coral'],['home','Comes to your home']];
var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
var DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
/* Official CCPS 2026-27 student no-school days. Source noted in findings.md, not on the page. */
var CCPS=[
  {id:'fall',name:'Fall Break',range:'11/23/26 to 11/27/26',start:'2026-11-23',end:'2026-11-27'},
  {id:'winter',name:'Winter Break',range:'12/21/26 to 1/1/27',start:'2026-12-21',end:'2027-01-01'},
  {id:'plan-jan4',name:'Teacher Plan Day',range:'Mon 1/4/27',start:'2027-01-04',end:'2027-01-04'},
  {id:'mlk',name:'Martin Luther King Jr. Day',range:'Mon 1/18/27',start:'2027-01-18',end:'2027-01-18'},
  {id:'pres',name:"President's Day",range:'Mon 2/15/27',start:'2027-02-15',end:'2027-02-15'},
  {id:'plan-mar19',name:'Teacher Plan Day',range:'Fri 3/19/27',start:'2027-03-19',end:'2027-03-19'},
  {id:'spring',name:'Spring Break',range:'3/22/27 to 3/29/27',start:'2027-03-22',end:'2027-03-29'}
];
var $=function(i){return document.getElementById(i)};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function ndate(iso){
  if(!iso) return '';
  var x=new Date(iso+'T12:00:00');
  return DOW[x.getDay()]+' '+(x.getMonth()+1)+'/'+x.getDate()+'/'+String(x.getFullYear()).slice(2);
}
function monthLabel(iso){
  var x=new Date(iso+'T12:00:00');
  return MONTHS[x.getMonth()]+' '+x.getFullYear();
}
function weekEnd(iso){
  var d=new Date(iso+'T12:00:00'), add=(7-d.getDay())%7;
  d.setDate(d.getDate()+add);
  var m=d.getMonth()+1, day=d.getDate();
  return d.getFullYear()+'-'+(m<10?'0':'')+m+'-'+(day<10?'0':'')+day;
}
var WEEK_END=weekEnd(TODAY);
function dt(s){var w=(s.when||'').replace(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun), /g,'');return w.replace(/^([A-Z][a-z]{2}) (\d+) – \1 (\d+)/,'$1 $2–$3').replace(/ – /g,'–')}
function runs(s){
  var w=dt(s);
  if(s.ongoing) return w||'Sign up any time';
  if(/^[A-Z][a-z]{2} \d/.test(w)) return (s.timing=='weekly'?'Weekly, ':'Runs ')+w;
  return w||'See official page';
}
function key(s){if(s.ongoing||!s.start) return '9999'; return s.start<TODAY?TODAY:s.start}
function tel(p){return (p||'').replace(/[^0-9+]/g,'')}
function ages(g){var mn=99,mx=-1,t=[];g.forEach(function(s){if(s.amin!=null&&s.amax!=null){mn=Math.min(mn,s.amin);mx=Math.max(mx,s.amax)}else if(s.ages&&t.indexOf(s.ages)<0)t.push(s.ages)});
  if(mx>=0) return 'Ages '+(mn==mx?mn:mn+'–'+mx); return t[0]||''}
function price(g){var u=[];g.forEach(function(s){if(s.price&&u.indexOf(s.price)<0)u.push(s.price)}); if(!u.length) return ''; return u.length==1?u[0]:u[0]+' (varies by session)'}
function kinds(g){var u=[];g.forEach(function(s){if(s.ongoing) return; if(s.kind&&u.indexOf(s.kind)<0)u.push(s.kind)}); return u.map(function(k){return '<span class="su-kind">'+esc(k)+'</span>'}).join('')}
function urlOf(g){var u=[];g.forEach(function(s){if(s.url&&u.indexOf(s.url)<0)u.push(s.url)}); return u}
function groupBy(rows,f){var m={},o=[];rows.forEach(function(r){var k=f(r);if(!m[k]){m[k]=[];o.push(k)}m[k].push(r)}); return o.map(function(k){return m[k].sort(function(a,b){return key(a)<key(b)?-1:key(a)>key(b)?1:0})})}
function photoOf(p){
  var fam=p.fam;
  if(fam==='nature'&&PHOTOS.nature) return PHOTOS.nature;
  return PHOTOS[fam]||PHOTOS.daycamp;
}
function isDayProg(r){
  if(r.kind==='Camp') return true;
  if((r.acts||[]).indexOf('daycamp')>-1) return true;
  var b=((r.title||'')+' '+(r.prog||'')+' '+(r.famL||'')).toLowerCase();
  return /fun day|no school|holiday camp|break camp|day camp/.test(b);
}
function covers(r,win){
  if(!r.start) return false;
  var en=r.end||r.start;
  return r.start<=win.end && en>=win.start;
}
function startsThisWeek(g){
  return g.some(function(s){return s.start&&s.start>=TODAY&&s.start<=WEEK_END});
}
function soonestDated(g){
  var d=g.filter(function(s){return s.start});
  if(!d.length) return null;
  d.sort(function(a,b){return a.start<b.start?-1:a.start>b.start?1:0});
  /* prefer an upcoming or in-range session for the headline date */
  var up=d.filter(function(s){return s.start>=TODAY||(s.end&&s.end>=TODAY)});
  return (up[0]||d[0]);
}
function whenBlock(g){
  var s=soonestDated(g), p=g[0];
  if(p.ongoing&&!s) return '<p class="su-when"><b>Sign up any time</b></p>';
  if(!s||!s.start) return '<p class="su-when"><b>See official page</b></p>'+(p.when?'<p class="su-sesline">'+esc(runs(p))+'</p>':'');
  var startLbl=ndate(s.start), endLbl=(s.end&&s.end!==s.start)?ndate(s.end):'';
  var head;
  if(s.start>TODAY) head='Starts '+startLbl;
  else if(s.start===TODAY) head='Starts today, '+startLbl;
  else if(s.end&&s.end>=TODAY) head='Running now';
  else head='Starts '+startLbl;
  var thru='';
  if(s.start>=TODAY&&endLbl) thru=' <span class="su-thru">· through '+endLbl+'</span>';
  else if(s.start<TODAY&&endLbl) thru=' <span class="su-thru">· through '+endLbl+'</span>';
  var line=runs(s);
  var sub='';
  if(s.ongoing&&line&&line!=='Sign up any time') sub='<p class="su-sesline">'+esc(line)+'</p>';
  else if(line&&(/^Weekly/i.test(line)||(!/^Runs /.test(line)&&line!=='See official page'))){
    sub='<p class="su-sesline">'+esc(line)+'</p>';
  }
  return '<p class="su-when"><b>'+esc(head)+'</b>'+thru+'</p>'+sub;
}
function sesLi(s,showTitle){
  var b=[]; var a=s.ages; if(a) b.push(a); if(s.price) b.push(s.price);
  return '<li><span class="su-run">'+esc(s.start?ndate(s.start)+(s.end&&s.end!==s.start?' – '+ndate(s.end):''):runs(s))+'</span>'+(showTitle?'<span class="su-st">'+esc(s.title)+'</span>':'')+(b.length?'<span class="su-sm">'+esc(b.join(' · '))+'</span>':'')+(s.url?'<a class="su-link" href="'+esc(s.url)+'" target="_blank" rel="noopener">Sign up</a>':'')+'</li>';
}
function btns(g){
  var u=urlOf(g), p=g[0], h='<div class="su-btns">';
  if(u.length) h+='<a class="su-btn" href="'+esc(u.length===1?u[0]:(p.site||u[0]))+'" target="_blank" rel="noopener">'+(u.length>1?'Official site':'Sign up')+'</a>';
  if(p.phone) h+='<a class="su-btn alt" href="tel:'+tel(p.phone)+'">Call</a>';
  return h+'</div>';
}
function card(g){
  var p=g[0], n=g.length, ph=photoOf(p), tag=startsThisWeek(g);
  var h='<article class="su-card"><div class="su-photo">';
  h+='<img loading="lazy" src="'+esc(ph[0])+'" alt="'+esc(ph[1])+'">';
  if(tag) h+='<span class="su-tag">Starts this week</span>';
  h+='</div><div class="su-body">';
  h+='<p class="su-eyebrow">'+esc(p.famL)+kinds(g)+'</p>';
  h+='<h3>'+esc(p.prog)+'</h3>';
  if(p.place&&p.place.toLowerCase()!==p.prog.toLowerCase()) h+='<p class="su-place">'+esc(p.place)+'</p>';
  var meta=[p.town], a=ages(g); if(a) meta.push(a);
  h+='<p class="su-meta">'+esc(meta.join(' · '))+'</p>';
  h+=whenBlock(g);
  if(n>1){
    h+='<details class="su-fold"><summary>'+(n===2?'See the other date':'See all '+n+' dates')+'</summary><ul class="su-ses">'+g.map(function(s){return sesLi(s,!!s.title&&s.title.toLowerCase().indexOf((p.prog||'').toLowerCase())<0)}).join('')+'</ul></details>';
  }
  var pr=price(g); if(pr) h+='<p class="su-price"><b>Price:</b> '+esc(pr)+'</p>';
  return h+btns(g)+'</div></article>';
}
function sortGroups(gs){
  return gs.sort(function(x,y){
    var kx=key(x[0]), ky=key(y[0]);
    if(kx<ky) return -1; if(kx>ky) return 1;
    return x[0].place.localeCompare(y[0].place)||x[0].prog.localeCompare(y[0].prog);
  });
}
function listByMonth(gs){
  var out='', cur='', dated=gs.filter(function(g){return key(g[0])!=='9999'}), any=gs.filter(function(g){return key(g[0])==='9999'});
  dated.forEach(function(g){
    var m=monthLabel(key(g[0]));
    if(m!==cur){ if(cur) out+='</div>'; out+='<h2 class="su-month">'+esc(m)+'</h2><div class="su-list">'; cur=m; }
    out+=card(g);
  });
  if(cur) out+='</div>';
  if(any.length) out+='<h2 class="su-month">Sign up any time</h2><div class="su-list">'+any.map(card).join('')+'</div>';
  return out;
}
function ccpsView(rows){
  var out='';
  CCPS.forEach(function(win){
    var hits=rows.filter(function(r){return isDayProg(r)&&covers(r,win)});
    var gs=sortGroups(groupBy(hits,function(r){return r.pk+'|'+r.prog.toLowerCase()}));
    out+='<div class="su-break"><h2>'+esc(win.name)+'</h2><p>'+esc(win.range)+'</p></div>';
    if(gs.length) out+='<div class="su-list">'+gs.map(card).join('')+'</div>';
    else out+='<p class="su-empty">No open sign-ups listed for this day.</p>';
  });
  return out;
}
function filterRows(){
  var q=($('su-q').value||'').trim().toLowerCase(), ak=$('su-act').value, ar=$('su-area').value, keys=null;
  ACTS.forEach(function(a){if(a[0]===ak&&ak) keys=a[2]});
  return R.filter(function(r){
    if(ar&&r.area!==ar) return false;
    if(keys&&!r.acts.some(function(a){return keys.indexOf(a)>-1})) return false;
    if(q){var h=(r.place+' '+r.prog+' '+r.title+' '+r.town+' '+r.famL).toLowerCase(); if(q.split(/\s+/).some(function(w){return h.indexOf(w)<0})) return false}
    return true;
  });
}
function render(){
  var ccps=$('su-ccps').getAttribute('aria-pressed')==='true';
  var rows=filterRows();
  var out;
  if(ccps) out=ccpsView(rows);
  else {
    var gs=sortGroups(groupBy(rows,function(r){return r.pk+'|'+r.prog.toLowerCase()}));
    out=listByMonth(gs);
  }
  $('su-out').innerHTML=out||'<p class="su-empty">Nothing open matches that search. Try another activity or area.</p>';
}
document.addEventListener('DOMContentLoaded',function(){
  var t=new Date(TODAY+'T12:00:00');
  $('su-today').textContent='Today is '+t.toLocaleDateString('en-US',{weekday:'long'})+', '+(t.getMonth()+1)+'/'+t.getDate()+'/'+String(t.getFullYear()).slice(2);
  $('su-act').innerHTML=ACTS.map(function(a){return '<option value="'+a[0]+'">'+esc(a[1])+'</option>'}).join('');
  $('su-area').innerHTML='<option value="">All areas</option>'+AREAS.map(function(a){return '<option value="'+a[0]+'">'+esc(a[1])+'</option>'}).join('');
  ['su-q','su-act','su-area'].forEach(function(i){$(i).addEventListener(i==='su-q'?'input':'change',render)});
  $('su-ccps').addEventListener('click',function(){
    var on=this.getAttribute('aria-pressed')==='true';
    this.setAttribute('aria-pressed', on?'false':'true');
    render();
    if(!on) $('su-out').scrollIntoView({behavior:'smooth',block:'start'});
  });
  render();
});
})();
