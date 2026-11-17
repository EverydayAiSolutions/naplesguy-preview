(function(){
var R=window.SU_ROWS||[],TODAY=window.REG_TODAY||'',MODE=document.documentElement.getAttribute('data-su')||'1';
var ACTS=[['','All activities',[]],['swim','Swimming',['swim']],['soccer','Soccer',['soccer']],['baseball','Baseball & Softball',['baseball']],['basketball','Basketball',['basketball']],['football','Flag Football',['football']],['volleyball','Volleyball',['volleyball']],['golf','Golf',['golf']],['gym','Gymnastics',['gym']],['cheer','Cheer',['cheer']],['dance','Dance',['dance']],['music','Music',['music']],['art','Art',['art']],['theater','Acting & Theater',['theater']],['stem','STEM & Nature',['stem','nature']],['daycamp','Day Camps',['daycamp']],['teens','Teens',['teens']]];
var AREAS=[['naples','Naples, Marco Island & Immokalee'],['bonita','Bonita Springs & Estero'],['fortmyers','Fort Myers & Cape Coral'],['home','Comes to your home']];
var $=function(i){return document.getElementById(i)};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function dt(s){var w=(s.when||'').replace(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun), /g,'');return w.replace(/^([A-Z][a-z]{2}) (\d+) – \1 (\d+)/,'$1 $2–$3').replace(/ – /g,'–')}
function runs(s){var w=dt(s);if(s.ongoing)return w||'Sign up any time';if(/^[A-Z][a-z]{2} \d/.test(w))return(s.timing=='weekly'?'Weekly, ':'Runs ')+w;return w||'Dates on the official page'}
function key(s){if(s.ongoing||!s.start)return '9999';return s.start<TODAY?TODAY:s.start}
function tel(p){return p.replace(/[^0-9+]/g,'')}
function ages(g){var mn=99,mx=-1,t=[];g.forEach(function(s){if(s.amin!=null&&s.amax!=null){mn=Math.min(mn,s.amin);mx=Math.max(mx,s.amax)}else if(s.ages&&t.indexOf(s.ages)<0)t.push(s.ages)});
  if(mx>=0)return 'Ages '+(mn==mx?mn:mn+'–'+mx);return t[0]||''}
function price(g){var u=[];g.forEach(function(s){if(s.price&&u.indexOf(s.price)<0)u.push(s.price)});if(!u.length)return '';return u.length==1?u[0]:u[0]+' (varies by session)'}
function kinds(g){var u=[];g.forEach(function(s){if(s.ongoing)return;if(s.kind&&u.indexOf(s.kind)<0)u.push(s.kind)});return u.map(function(k){return '<span class="su-kind">'+esc(k)+'</span>'}).join('')}
function urlOf(g){var u=[];g.forEach(function(s){if(s.url&&u.indexOf(s.url)<0)u.push(s.url)});return u}
function groupBy(rows,f){var m={},o=[];rows.forEach(function(r){var k=f(r);if(!m[k]){m[k]=[];o.push(k)}m[k].push(r)});return o.map(function(k){var g=m[k].sort(function(a,b){return key(a)<key(b)?-1:key(a)>key(b)?1:0});return g})}
function sesLi(s,showTitle){var b=[];var a=s.ages;if(a)b.push(a);if(s.price)b.push(s.price);
  return '<li><span class="su-run">'+esc(runs(s))+'</span>'+(showTitle?'<span class="su-st">'+esc(s.title)+'</span>':'')+(b.length?'<span class="su-sm">'+esc(b.join(' · '))+'</span>':'')+(s.url?'<a class="su-link" href="'+esc(s.url)+'" target="_blank" rel="noopener">Sign up</a>':'')+'</li>'}
function btns(g,label){var u=urlOf(g),p=g[0];var h='<div class="su-btns">';
  if(u.length) h+='<a class="su-btn" href="'+esc(u.length==1?u[0]:(p.site||u[0]))+'" target="_blank" rel="noopener">'+(label||'Sign up')+'</a>';
  if(p.phone)h+='<a class="su-btn alt" href="tel:'+tel(p.phone)+'">Call</a>';return h+'</div>'}
function meta(g){var p=g[0],m=[p.town],a=ages(g);if(a)m.push(a);return '<p class="su-meta">'+esc(m.join(' · '))+'</p>'}
function card1(g){var p=g[0],n=g.length,h='<article class="su-card"><p class="su-eyebrow">'+esc(p.famL)+kinds(g)+'</p><h3>'+esc(p.place)+'</h3>'+meta(g);
  if(p.ongoing){h+='<p class="su-when"><b>'+esc(runs(p))+'</b></p><p class="su-desc">'+esc(p.title)+'</p>'}
  else if(n==1){h+='<p class="su-when"><b>'+esc(runs(p))+'</b></p><p class="su-desc">'+esc(p.title)+'</p>'}
  else{var d=[];g.forEach(function(s){var x=dt(s);if(x&&d.indexOf(x)<0)d.push(x)});var more=d.length>3;d=d.slice(0,3);h+='<p class="su-when"><b>'+n+' sessions:</b> '+esc(d.join(', '))+(more?', and more':'')+'</p>';
    h+='<details class="su-fold"><summary>See all '+n+' sessions and sign-up links</summary><ul class="su-ses">'+g.map(function(s){return sesLi(s,true)}).join('')+'</ul></details>'}
  var pr=price(g);if(pr)h+='<p class="su-price"><b>Price:</b> '+esc(pr)+'</p>';
  return h+btns(g,n>1&&urlOf(g).length>1?'Official site':'Sign up')+'</article>'}
function card2(g){var p=g[0],h='<article class="su-card"><p class="su-eyebrow">'+esc(p.famL)+kinds(g)+'</p><h3>'+esc(p.prog)+'</h3>'+(p.place.indexOf(p.prog)==0?'':'<p class="su-place">'+esc(p.place)+'</p>')+meta(g);
  if(g.length==1&&!p.ongoing)h+='<p class="su-when"><b>'+esc(runs(p))+'</b></p>';
  else if(p.ongoing)h+='<p class="su-when"><b>'+esc(runs(p))+'</b></p><p class="su-desc">'+esc(p.title)+'</p>';
  else h+='<ul class="su-dates">'+g.map(function(s){var x=s.ages&&ages(g)!=s.ages?' · '+s.ages:'';return '<li><span>'+esc(runs(s))+esc(x)+'</span>'+(s.url&&urlOf(g).length>1?'<a class="su-link" href="'+esc(s.url)+'" target="_blank" rel="noopener">Sign up</a>':'')+'</li>'}).join('')+'</ul>';
  var pr=price(g);if(pr)h+='<p class="su-price"><b>Price:</b> '+esc(pr)+'</p>';
  return h+btns(g,urlOf(g).length>1?'Official site':'Sign up')+'</article>'}
function place3(g){var p=g[0],h='<div class="su-place3"><div class="su-ph"><div><h3>'+esc(p.place)+'</h3><p class="su-meta">'+esc(p.town)+(p.phone?' · <a href="tel:'+tel(p.phone)+'">'+esc(p.phone)+'</a>':'')+'</p></div>'+(p.site?'<a class="su-btn sm" href="'+esc(p.site)+'" target="_blank" rel="noopener">Official site</a>':'')+'</div><ul class="su-rows">';
  groupBy(g,function(s){return s.prog.toLowerCase()}).forEach(function(q){var s=q[0],d=q.map(function(x){return x.ongoing?runs(x):dt(x)}).filter(Boolean);var b=[];var a=ages(q);if(a)b.push(a);var pr=price(q);if(pr)b.push(pr);var u=urlOf(q);
    h+='<li><div class="su-rt"><b>'+esc(s.prog)+'</b>'+kinds(q)+'</div><div class="su-rd">'+esc((s.ongoing?'':(q.length>1?'':(s.timing=='weekly'?'Weekly, ':'Runs ')))+d.slice(0,4).join(', ')+(d.length>4?', and more':''))+'</div>'+(b.length?'<div class="su-sm">'+esc(b.join(' · '))+'</div>':'')+(u.length?'<a class="su-link" href="'+esc(u[0])+'" target="_blank" rel="noopener">Sign up</a>':'')+'</li>'});
  return h+'</ul></div>'}
function render(){
  var q=($('su-q').value||'').trim().toLowerCase(),ak=$('su-act').value,ar=$('su-area').value,keys=null;
  ACTS.forEach(function(a){if(a[0]==ak&&ak)keys=a[2]});
  var rows=R.filter(function(r){if(ar&&r.area!=ar)return false;if(keys&&!r.acts.some(function(a){return keys.indexOf(a)>-1}))return false;
    if(q){var h=(r.place+' '+r.prog+' '+r.title+' '+r.town+' '+r.famL).toLowerCase();if(q.split(/\s+/).some(function(w){return h.indexOf(w)<0}))return false}return true});
  var out='';
  if(MODE=='3'){AREAS.forEach(function(a){var gs=groupBy(rows.filter(function(r){return r.area==a[0]}),function(r){return r.pk}).sort(function(x,y){return x[0].place.localeCompare(y[0].place)});
      if(gs.length)out+='<h2 class="su-area">'+esc(a[1])+'</h2>'+gs.map(place3).join('')});}
  else{var gs=groupBy(rows,MODE=='1'?function(r){return r.pk+'|'+r.fam}:function(r){return r.pk+'|'+r.prog.toLowerCase()}).sort(function(x,y){return key(x[0])<key(y[0])?-1:key(x[0])>key(y[0])?1:x[0].place.localeCompare(y[0].place)});
    var dated=gs.filter(function(g){return key(g[0])!='9999'}),any=gs.filter(function(g){return key(g[0])=='9999'}),f=MODE=='1'?card1:card2;
    if(dated.length)out+='<h2 class="su-area">Starting soonest</h2><div class="su-list">'+dated.map(f).join('')+'</div>';
    if(any.length)out+='<h2 class="su-area">Sign up any time</h2><div class="su-list">'+any.map(f).join('')+'</div>';}
  $('su-out').innerHTML=out||'<p class="su-empty">Nothing open matches that search. Try another activity or area.</p>';
}
document.addEventListener('DOMContentLoaded',function(){
  $('su-today').textContent=new Date(TODAY+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
  $('su-act').innerHTML=ACTS.map(function(a){return '<option value="'+a[0]+'">'+esc(a[1])+'</option>'}).join('');
  $('su-area').innerHTML='<option value="">All areas</option>'+AREAS.map(function(a){return '<option value="'+a[0]+'">'+esc(a[1])+'</option>'}).join('');
  ['su-q','su-act','su-area'].forEach(function(i){$(i).addEventListener(i=='su-q'?'input':'change',render)});
  render();
});
})();
