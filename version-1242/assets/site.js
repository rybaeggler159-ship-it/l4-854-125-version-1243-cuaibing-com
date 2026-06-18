(function () {
  var navButton = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");

  if (navButton && nav) {
    navButton.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      navButton.setAttribute("aria-expanded", String(open));
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  });

  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    var input = scope.querySelector("[data-filter-input]");
    var year = scope.querySelector("[data-year-filter]");
    var grid = scope.querySelector(".movie-grid");
    var empty = scope.querySelector("[data-empty-tip]");
    var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".movie-card")) : [];

    function apply() {
      var q = input ? input.value.trim().toLowerCase() : "";
      var y = year ? year.value : "";
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year")
        ].join(" ").toLowerCase();
        var ok = (!q || haystack.indexOf(q) !== -1) && (!y || card.getAttribute("data-year") === y);
        card.style.display = ok ? "" : "none";
        if (ok) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("active", shown === 0);
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (year) {
      year.addEventListener("change", apply);
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query && input) {
      input.value = query;
      apply();
    }
  });
})();

window.SitePlayer = {
  init: function (config) {
    var video = document.querySelector(config.selector);
    var cover = document.querySelector(config.cover);
    var button = document.querySelector(config.button);
    var hlsInstance = null;
    var ready = false;

    if (!video || !config.source) {
      return;
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    function attach() {
      if (ready) {
        playVideo();
        return;
      }

      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = config.source;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(config.source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      } else {
        video.src = config.source;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
      }
    }

    function start() {
      if (cover) {
        cover.classList.add("is-hidden");
      }
      attach();
    }

    if (cover) {
      cover.addEventListener("click", start);
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        start();
      });
    }

    video.addEventListener("click", function () {
      if (!ready) {
        start();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }
};
