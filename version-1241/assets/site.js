(function () {
  var navButton = document.querySelector("[data-nav-toggle]");
  var navMenu = document.querySelector("[data-nav-menu]");

  if (navButton && navMenu) {
    navButton.addEventListener("click", function () {
      var isOpen = navMenu.classList.toggle("is-open");
      navButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  document.addEventListener("error", function (event) {
    if (event.target && event.target.tagName === "IMG") {
      event.target.classList.add("is-hidden");
    }
  }, true);

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (slides.length > 1) {
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
          schedule();
        });
      });

      if (previous) {
        previous.addEventListener("click", function () {
          showSlide(current - 1);
          schedule();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
          schedule();
        });
      }

      schedule();
    }
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-card-search]"));

  searchInputs.forEach(function (input) {
    var scope = input.closest("[data-search-scope]") || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
    var empty = scope.querySelector("[data-empty-state]");

    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var matched = !query || haystack.indexOf(query) !== -1;

        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    });
  });

  function preparePlayer(shell) {
    var video = shell.querySelector("video[data-video]");
    var overlay = shell.querySelector(".player-overlay");

    if (!video) {
      return;
    }

    function loadAndPlay() {
      var source = video.getAttribute("data-video");

      if (!video.dataset.ready) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            maxBufferLength: 30,
            backBufferLength: 30
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          shell.hlsPlayer = hls;
        } else {
          video.src = source;
        }

        video.dataset.ready = "true";
      }

      shell.classList.add("is-ready");
      var playAction = video.play();

      if (playAction && typeof playAction.catch === "function") {
        playAction.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", loadAndPlay);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        loadAndPlay();
      }
    });

    video.addEventListener("play", function () {
      shell.classList.add("is-ready");
    });
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(preparePlayer);
})();
