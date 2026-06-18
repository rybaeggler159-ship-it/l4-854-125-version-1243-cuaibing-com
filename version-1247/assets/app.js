(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  function startHero() {
    if (slides.length <= 1) {
      return;
    }

    heroTimer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5600);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      if (heroTimer) {
        window.clearInterval(heroTimer);
      }

      showSlide(index);
      startHero();
    });
  });

  showSlide(0);
  startHero();

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters(form) {
    var scope = document.querySelector(form.getAttribute('data-filter-scope')) || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var keyword = normalize((form.querySelector('[name="q"]') || {}).value);
    var region = normalize((form.querySelector('[name="region"]') || {}).value);
    var type = normalize((form.querySelector('[name="type"]') || {}).value);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var cardType = normalize(card.getAttribute('data-type'));
      var matched = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        matched = false;
      }

      if (region && cardRegion !== region) {
        matched = false;
      }

      if (type && cardType !== type) {
        matched = false;
      }

      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    var empty = scope.querySelector('[data-no-results]');
    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  filterForms.forEach(function (form) {
    var params = new URLSearchParams(window.location.search);
    var queryInput = form.querySelector('[name="q"]');

    if (queryInput && params.get('q')) {
      queryInput.value = params.get('q');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilters(form);
    });

    Array.prototype.slice.call(form.querySelectorAll('input, select')).forEach(function (control) {
      control.addEventListener('input', function () {
        applyFilters(form);
      });

      control.addEventListener('change', function () {
        applyFilters(form);
      });
    });

    applyFilters(form);
  });

  var playerShells = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  function attachSource(shell, video) {
    var src = shell.getAttribute('data-src');

    if (!src || video.getAttribute('data-ready') === '1') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      shell.hlsInstance = hls;
    } else {
      video.src = src;
    }

    video.setAttribute('data-ready', '1');
  }

  function playVideo(shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.play-overlay');

    if (!video) {
      return;
    }

    attachSource(shell, video);

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    video.controls = true;
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  }

  playerShells.forEach(function (shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.play-overlay');

    if (overlay) {
      overlay.addEventListener('click', function () {
        playVideo(shell);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo(shell);
        }
      });
    }
  });
})();
