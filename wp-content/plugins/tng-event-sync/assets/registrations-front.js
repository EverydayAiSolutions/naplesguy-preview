(function(){
  var cfg = window.tngReg || {};
  function ready(fn){
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  function insertTiles(){
    if(document.getElementById('tng-fe-tiles')) return;
    if(!cfg.tiles) return;
    if(cfg.isFamily){
      var after = document.querySelector('.fe-to-places') || document.querySelector('.fe-landing-hub') || document.querySelector('.fe-filters');
      if(!after) return;
      after.insertAdjacentHTML('afterend', cfg.tiles);
    } else if(cfg.isHome){
      var row = document.querySelector('.home-places-link');
      if(!row) return;
      var html = cfg.tiles.replace('class="tng-fe-tiles"', 'class="tng-fe-tiles is-compact tng-fe-tiles-home"');
      row.insertAdjacentHTML('afterend', html);
    }
  }
  function insertOpenButton(){
    if(document.getElementById('tng-reg-open-btn')) return;
    if(!cfg.openButton) return;
    var row = document.querySelector('.fe-to-places') || document.querySelector('.home-places-link');
    if(!row) return;
    row.insertAdjacentHTML('beforeend', cfg.openButton);
  }
  function markToddlerCards(){
    var ids = cfg.toddlerIds || [];
    if(!ids.length) return;
    var set = {};
    ids.forEach(function(id){ set[String(id)] = 1; });
    document.querySelectorAll('.fe-card[data-id], .st-card[data-id]').forEach(function(card){
      if(set[card.getAttribute('data-id')||'']) card.setAttribute('data-toddler','1');
    });
  }
  ready(function(){
    insertTiles();
    insertOpenButton();
    markToddlerCards();
  });
})();
