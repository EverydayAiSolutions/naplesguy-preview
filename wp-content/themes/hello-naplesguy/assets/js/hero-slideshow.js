(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var HOLD_DEFAULT = 6000;
  var HOLD_HOME = 5000;

  function loadSlide(slide) {
    if (!slide) return;
    var img = slide.querySelector("img[data-src]");
    if (img && img.getAttribute("data-src")) {
      img.src = img.getAttribute("data-src");
      img.removeAttribute("data-src");
    }
  }

  function restartKenBurns(slide) {
    var img = slide.querySelector("img");
    if (!img) return;
    img.style.animation = "none";
    void img.offsetWidth;
    img.style.animation = "";
  }

  document.querySelectorAll("[data-hs]").forEach(function (root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hs-slide"));
    if (!slides.length) return;

    loadSlide(slides[0]);
    if (reduce) {
      slides.forEach(function (s, i) {
        s.classList.toggle("is-on", i === 0);
      });
      return;
    }

    if (slides[1]) {
      window.setTimeout(function () { loadSlide(slides[1]); }, 400);
    }
    if (slides.length > 2) {
      window.setTimeout(function () {
        for (var i = 2; i < slides.length; i++) loadSlide(slides[i]);
      }, 1800);
    }

    var i = 0;
    var HOLD = (document.body.classList.contains("home") && root.closest(".hero")) ? HOLD_HOME : HOLD_DEFAULT;
    window.setInterval(function () {
      var next = (i + 1) % slides.length;
      loadSlide(slides[next]);
      loadSlide(slides[(next + 1) % slides.length]);
      slides[i].classList.remove("is-on");
      slides[next].classList.remove("is-on");
      restartKenBurns(slides[next]);
      slides[next].classList.add("is-on");
      i = next;
    }, HOLD);
  });
})();
