(function(){
  var grid = document.getElementById("be-grid");
  if(!grid) return;
  var chips = Array.prototype.slice.call(document.querySelectorAll("[data-be-filter]"));
  var search = document.querySelector("[data-be-q]");
  var clearBtn = document.querySelector("[data-be-clear]");
  var countEl = document.querySelector("[data-be-count]");
  var emptyEl = document.querySelector("[data-be-empty]");
  var cards = Array.prototype.slice.call(grid.querySelectorAll(".be-card"));
  var map, markers = {};

  function filtersOn(){
    return chips.filter(function(c){ return c.getAttribute("aria-pressed") === "true"; }).map(function(c){ return c.getAttribute("data-be-filter"); });
  }
  function apply(){
    var on = filtersOn();
    var q = (search && search.value || "").trim().toLowerCase();
    var shown = 0;
    cards.forEach(function(card){
      var ok = on.every(function(f){ return card.getAttribute("data-"+f) === "1"; });
      if(q && (card.getAttribute("data-search")||"").indexOf(q) === -1) ok = false;
      card.hidden = !ok;
      if(ok) shown++;
      var mk = markers[card.getAttribute("data-slug")];
      if(mk){
        if(ok) { if(map && !map.hasLayer(mk)) mk.addTo(map); }
        else if(map && map.hasLayer(mk)) map.removeLayer(mk);
      }
    });
    grid.querySelectorAll("[data-be-group]").forEach(function(g){
      var any = g.querySelectorAll(".be-card:not([hidden])").length > 0;
      g.hidden = !any;
    });
    if(countEl){
      var label = shown === 1 ? "1 beach or access" : shown + " beaches and accesses";
      if(on.length || q) label += " (filtered)";
      countEl.textContent = label;
    }
    if(clearBtn) clearBtn.hidden = !(on.length || q);
    if(emptyEl) emptyEl.hidden = shown > 0;
  }

  chips.forEach(function(btn){
    btn.addEventListener("click", function(){
      var pressed = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", pressed ? "false" : "true");
      btn.classList.toggle("on", !pressed);
      apply();
    });
  });
  if(search) search.addEventListener("input", apply);
  if(clearBtn) clearBtn.addEventListener("click", function(){
    chips.forEach(function(b){ b.setAttribute("aria-pressed","false"); b.classList.remove("on"); });
    if(search) search.value = "";
    apply();
  });

  function closeCard(card){
    var btn = card.querySelector(".st-face");
    var panel = card.querySelector(".st-panel");
    if(btn) btn.setAttribute("aria-expanded","false");
    if(panel) panel.hidden = true;
    card.classList.remove("open");
  }
  function openCard(card, scroll){
    cards.forEach(function(c){ if(c !== card) closeCard(c); });
    var btn = card.querySelector(".st-face");
    var panel = card.querySelector(".st-panel");
    if(btn) btn.setAttribute("aria-expanded","true");
    if(panel) panel.hidden = false;
    card.classList.add("open");
    if(scroll){
      card.scrollIntoView({behavior:"smooth", block:"start"});
    }
  }
  grid.addEventListener("click", function(e){
    if(e.target.closest("a")) return;
    var face = e.target.closest(".st-face");
    var card = e.target.closest(".be-card");
    if(!card) return;
    if(face || (card.classList.contains("open") && !e.target.closest(".st-panel"))){
      if(card.classList.contains("open") && face){ closeCard(card); }
      else { openCard(card, false); history.replaceState(null,"","#beach-"+card.getAttribute("data-slug")); }
    }
  });

  function openFromHash(){
    var hash = (location.hash||"").replace(/^#/,"");
    if(!hash) return;
    var card = document.getElementById(hash);
    if(card && card.classList.contains("be-card")){
      openCard(card, true);
    }
  }
  window.addEventListener("hashchange", openFromHash);

  function initMap(){
    var el = document.getElementById("be-map");
    if(!el || typeof L === "undefined") return;
    var points = [];
    try { points = JSON.parse(el.getAttribute("data-points")||"[]"); } catch(e){ points = []; }
    map = L.map(el, { scrollWheelZoom:false, attributionControl:true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
    }).addTo(map);
    var icon = L.divIcon({ className:"", html:"<span class=\"be-pin\" style=\"display:block;width:16px;height:16px\"></span>", iconSize:[16,16], iconAnchor:[8,8], popupAnchor:[0,-10] });
    var bounds = [];
    points.forEach(function(p){
      var mk = L.marker([p.lat, p.lng], { icon:icon, title:p.name });
      mk.bindPopup("<div class=\"be-popup\"><h3>"+escapeHtml(p.name)+"</h3><a href=\"#beach-"+encodeURIComponent(p.slug)+"\">Open card</a></div>");
      mk.on("click", function(){
        var card = document.getElementById("beach-"+p.slug);
        if(card){ openCard(card, true); }
      });
      mk.addTo(map);
      markers[p.slug] = mk;
      bounds.push([p.lat, p.lng]);
    });
    if(bounds.length){
      map.fitBounds(bounds, { padding:[28,28], maxZoom:12 });
    } else {
      map.setView([26.14, -81.81], 10);
    }
  }
  function escapeHtml(s){
    return String(s||"").replace(/[&<>"']/g, function(c){ return ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[c]; });
  }

  if(document.readyState === "complete") { initMap(); openFromHash(); apply(); }
  else {
    window.addEventListener("load", function(){ initMap(); openFromHash(); apply(); });
  }
})();
