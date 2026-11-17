(function(){
var P=window.REG_PROVIDERS||[],TODAY=window.REG_TODAY||'';
var T='/naplesguy-preview/wp-content/themes/hello-naplesguy/assets/img/',M='/naplesguy-preview/mockups/img/';
var ACTS=[
['swim','Swimming',T+'fe-theme-swim.webp',['swim']],
['soccer','Soccer',T+'fe-theme-soccer.webp',['soccer']],
['baseball','Baseball & Softball',T+'fe-theme-baseball.webp',['baseball']],
['basketball','Basketball',T+'fe-theme-basketball.webp',['basketball']],
['football','Flag Football',M+'act-flag-football.webp',['football']],
['volleyball','Volleyball',T+'fe-theme-volleyball.webp',['volleyball']],
['tennis','Tennis',M+'act-tennis.webp',['tennis']],
['pickleball','Pickleball',M+'act-pickleball.webp',['pickleball']],
['golf','Golf',M+'act-golf.webp',['golf']],
['martial','Martial Arts',M+'act-martial-arts.webp',['martial']],
['gym','Gymnastics & Ninja',M+'act-gymnastics.webp',['gym']],
['cheer','Cheer & Tumbling',T+'fe-theme-cheer.webp',['cheer']],
['dance','Dance',M+'act-dance.webp',['dance']],
['music','Music Lessons',M+'act-music.webp',['music']],
['art','Art Classes',T+'fe-theme-art-workshop.webp',['art']],
['theater','Acting & Theater',T+'fe-theme-theater.webp',['theater']],
['stem','STEM & Nature',T+'fe-theme-science-kids.webp',['stem','nature']],
['horse','Horseback Riding',M+'act-horseback.webp',['horse']],
['daycamp','Day Camps',T+'fe-theme-camp.webp',['daycamp']],
['teens','Teens',T+'fe-theme-bmx-skate.webp',['teens']]
];
var AREAS=[['naples','Naples'],['bonita','Bonita Springs & Estero'],['fortmyers','Fort Myers & Cape Coral'],['home','Comes to your home']];
var $=function(id){return document.getElementById(id)};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function actBy(k){for(var i=0;i<ACTS.length;i++)if(ACTS[i][0]==k)return ACTS[i];return null}
function runs(s){
  var w=(s.when||'').replace(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun), /g,'');
  w=w.replace(/^([A-Z][a-z]{2}) (\d+) – \1 (\d+)/,'$1 $2–$3').replace(/ – /g,'–');
  if(/^[A-Z][a-z]{2} \d/.test(w)) return (s.timing=='weekly'?'Weekly, ':'Runs ')+w;
  if(/^Fridays/.test(w)) return w;
  return w||'Dates on the official page';
}
function live(s){return !s.end||s.end>=TODAY}
function sessFor(p,keys){return p.sessions.filter(function(s){return live(s)&&s.acts.some(function(a){return keys.indexOf(a)>-1})})}
function card(p,keys){
  var ss=sessFor(p,keys),open=ss.length>0||p.enroll_anytime;
  var h='<article class="rg3-card"><h3>'+esc(p.name)+'</h3>';
  var meta=[p.town]; if(p.ages) meta.push(p.ages);
  h+='<p class="rg3-meta">'+esc(meta.join(' · '))+'</p>';
  if(open) h+='<span class="rg3-badge">Sign-up open</span>';
  h+='<p class="rg3-offers">'+esc(p.offers)+'</p><ul class="rg3-facts">';
  if(p.price) h+='<li><b>Price:</b> '+esc(p.price)+'</li>';
  if(p.enroll_note) h+='<li><b>Sign-up:</b> '+esc(p.enroll_note)+'</li>';
  if(p.address) h+='<li><b>Where:</b> '+esc(p.address)+'</li>';
  if(p.phone) h+='<li><b>Phone:</b> <a href="tel:'+p.phone.replace(/[^0-9+]/g,'')+'">'+esc(p.phone)+'</a></li>';
  h+='</ul>';
  if(ss.length){
    h+='<div class="rg3-ses"><h4>Upcoming sessions</h4><ul>';
    ss.forEach(function(s,i){
      var bits=[]; if(s.ages) bits.push(s.ages); if(s.price) bits.push(s.price);
      h+='<li'+(i>=3?' hidden':'')+'><strong>'+esc(s.title)+(s.kind?'<span class="rg3-kind">'+esc(s.kind)+'</span>':'')+'</strong><span class="rg3-run">'+esc(runs(s))+'</span>'+(bits.length?' · '+esc(bits.join(' · ')):'')+(s.url?' · <a href="'+esc(s.url)+'" target="_blank" rel="noopener">Sign up</a>':'')+'</li>';
    });
    h+='</ul>'+(ss.length>3?'<button type="button" class="rg3-more">Show '+(ss.length-3)+' more sessions</button>':'')+'</div>';
  }
  var url=p.url||(ss[0]&&ss[0].url)||'';
  h+='<div class="rg3-btns">';
  if(url) h+='<a class="rg3-btn" href="'+esc(url)+'" target="_blank" rel="noopener">'+(open?'Sign up':'Visit official site')+'</a>';
  if(p.phone) h+='<a class="rg3-btn alt" href="tel:'+p.phone.replace(/[^0-9+]/g,'')+'">Call</a>';
  return h+'</div></article>';
}
function score(p,keys){return (sessFor(p,keys).length||p.enroll_anytime)?0:1}
function render(){
  var k=state.act,q=($('rg3-q2').value||'').trim().toLowerCase(),area=$('rg3-area').value;
  var A=k?actBy(k):null,keys=A?A[3]:null;
  var list=P.filter(function(p){
    if(keys&&!p.activities.some(function(a){return keys.indexOf(a)>-1}))return false;
    if(area&&p.area!=area)return false;
    if(q){var hay=(p.name+' '+p.offers+' '+p.town+' '+p.activities.join(' ')+' '+p.sessions.map(function(s){return s.title}).join(' ')).toLowerCase();
      if(q.split(/\s+/).some(function(w){return hay.indexOf(w)<0}))return false;}
    return true});
  var kk=keys||[].concat.apply([],ACTS.map(function(a){return a[3]}));
  var h='';
  AREAS.forEach(function(ar){
    var g=list.filter(function(p){return p.area==ar[0]}).sort(function(a,b){return score(a,kk)-score(b,kk)||a.name.localeCompare(b.name)});
    if(!g.length)return;
    h+='<h3 class="rg3-area">'+esc(ar[1])+'</h3><div class="rg3-list">'+g.map(function(p){return card(p,kk)}).join('')+'</div>';
  });
  $('rg3-out').innerHTML=h||'<p class="rg3-empty">Nothing matches that search here. Try another area or a different word.</p>';
  $('rg3-sub').textContent=state.act?'Places from Naples to Fort Myers':'';
}
var state={act:null};
function show(k,push){
  state.act=k; var A=k?actBy(k):null;
  $('rg3-browse').hidden=true; $('rg3-results').hidden=false;
  $('rg3-title').textContent=A?A[1]:'Search results';
  var im=$('rg3-img'); if(A){im.src=A[2];im.hidden=false}else im.hidden=true;
  $('rg3-area').value=''; if(k) $('rg3-q2').value='';
  render();
  if(push!==false) history.pushState({a:k},'',k?'#'+k:location.pathname);
  var r=$('rg3-results'); window.scrollTo(0,r.getBoundingClientRect().top+window.scrollY-12);
}
function home(push){state.act=null;$('rg3-browse').hidden=false;$('rg3-results').hidden=true;$('rg3-q').value='';if(push!==false)history.pushState({},'',location.pathname)}
document.addEventListener('DOMContentLoaded',function(){
  var d=new Date(TODAY+'T12:00:00');
  $('rg3-today').textContent=d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
  $('rg3-tiles').innerHTML=ACTS.map(function(a){return '<button type="button" class="rg3-tile" data-act="'+a[0]+'"><img loading="lazy" src="'+a[2]+'" alt=""><span>'+esc(a[1])+'</span></button>'}).join('');
  $('rg3-area').innerHTML='<option value="">All areas, Naples to Fort Myers</option>'+AREAS.map(function(a){return '<option value="'+a[0]+'">'+esc(a[1])+'</option>'}).join('');
  $('rg3-tiles').addEventListener('click',function(e){var b=e.target.closest('.rg3-tile');if(b)show(b.dataset.act)});
  $('rg3-back').addEventListener('click',function(){home()});
  $('rg3-area').addEventListener('change',render);
  $('rg3-q2').addEventListener('input',render);
  $('rg3-q').addEventListener('keydown',function(e){if(e.key=='Enter'&&this.value.trim()){var v=this.value;show(null);$('rg3-q2').value=v;render()}});
  $('rg3-q').addEventListener('search',function(){if(this.value.trim()){var v=this.value;show(null);$('rg3-q2').value=v;render()}});
  $('rg3-out').addEventListener('click',function(e){var b=e.target.closest('.rg3-more');if(!b)return;b.parentNode.querySelectorAll('li[hidden]').forEach(function(l){l.hidden=false});b.remove()});
  window.addEventListener('popstate',function(){var k=location.hash.slice(1);if(k&&actBy(k))show(k,false);else home(false)});
  var k=location.hash.slice(1); if(k&&actBy(k))show(k,false);
});
})();
