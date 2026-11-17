(function(){
  function loadVideo(btn){
    var id=btn.getAttribute('data-yt-play');
    if(!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return;
    var wrap=btn.closest('.ng-helpful-video')||btn.parentNode;
    var box=document.createElement('div');
    box.className='ng-helpful-thumb is-playing';
    var iframe=document.createElement('iframe');
    iframe.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+'?autoplay=1&rel=0';
    iframe.title=btn.getAttribute('aria-label')||'Video';
    iframe.setAttribute('allow','accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    iframe.setAttribute('allowfullscreen','');
    iframe.setAttribute('loading','eager');
    box.appendChild(iframe);
    btn.replaceWith(box);
  }
  document.addEventListener('click', function(e){
    var btn=e.target.closest('[data-yt-play]');
    if(!btn) return;
    e.preventDefault();
    loadVideo(btn);
  });

  window.ngRevealDeferredImages=function(root){
    var scope=root||document;
    [].slice.call(scope.querySelectorAll('img[data-src]')).forEach(function(img){
      if(img.getAttribute('src')===img.getAttribute('data-src')) return;
      if(img.closest('.is-beyond') || img.closest('.dir-card.is-beyond') || img.closest('.tng-reg-card.is-beyond')) return;
      img.src=img.getAttribute('data-src');
      img.removeAttribute('data-src');
    });
  };

  function bindPagedList(opts){
    var root=document.querySelector(opts.root);
    if(!root) return;
    var step=opts.step||8;
    var shown=step;
    var btn=document.querySelector(opts.button);
    function cards(){
      return [].slice.call(root.querySelectorAll(opts.item)).filter(function(c){
        return opts.isMatch ? opts.isMatch(c) : true;
      });
    }
    function apply(){
      var list=opts.allItems ? opts.allItems() : [].slice.call(root.querySelectorAll(opts.item));
      var matched=0;
      list.forEach(function(c){
        var ok=opts.isMatch ? opts.isMatch(c) : true;
        if(!ok){
          c.classList.add('is-beyond');
          return;
        }
        matched++;
        if(matched<=shown) c.classList.remove('is-beyond');
        else c.classList.add('is-beyond');
      });
      if(btn){
        var more=matched>shown;
        btn.hidden=!more;
        btn.textContent=opts.label ? opts.label(matched, shown) : ('Show more ('+Math.min(step, matched-shown)+')');
      }
      if(window.ngRevealDeferredImages) window.ngRevealDeferredImages(root);
    }
    if(btn){
      btn.addEventListener('click', function(){
        shown+=step;
        apply();
      });
    }
    apply();
    return {refresh:function(){ shown=step; apply(); }, apply:apply};
  }
  window.ngBindPagedList=bindPagedList;

  function openDetailsForHash(){
    var id=(location.hash||'').replace(/^#/,'');
    if(!id) return;
    var el=document.getElementById(id);
    if(!el) return;
    var d=el.closest('details.g-more');
    if(d && !d.open){
      d.open=true;
    }
  }
  window.addEventListener('hashchange', openDetailsForHash);
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', openDetailsForHash);
  } else {
    openDetailsForHash();
  }
})();
