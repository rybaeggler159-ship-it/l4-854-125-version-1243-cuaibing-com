(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(i);
        play();
      });
    });

    show(0);
    play();
  }

  function initPlayer() {
    var player = document.querySelector('[data-player]');
    if (!player) {
      return;
    }
    var video = player.querySelector('video');
    var layer = player.querySelector('.play-layer');
    var src = player.getAttribute('data-src');
    var hls = null;

    function attach() {
      if (!video || !src || video.getAttribute('data-ready') === '1') {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
      video.setAttribute('data-ready', '1');
    }

    function start() {
      attach();
      if (layer) {
        layer.style.display = 'none';
      }
      video.setAttribute('controls', 'controls');
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    }

    if (layer) {
      layer.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    }
  }

  function initSearch() {
    var input = document.querySelector('[data-search-input]');
    var type = document.querySelector('[data-type-filter]');
    var region = document.querySelector('[data-region-filter]');
    var results = document.querySelector('[data-search-results]');
    if (!input || !type || !region || !results || !window.MOVIES) {
      return;
    }

    function includesText(movie, query) {
      var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
      return text.indexOf(query) !== -1;
    }

    function render() {
      var query = input.value.trim().toLowerCase();
      var typeValue = type.value;
      var regionValue = region.value;
      var items = window.MOVIES.filter(function (movie) {
        var typeOk = !typeValue || movie.type.indexOf(typeValue) !== -1;
        var regionOk = !regionValue || movie.region.indexOf(regionValue) !== -1 || movie.tags.indexOf(regionValue) !== -1;
        var queryOk = !query || includesText(movie, query);
        return typeOk && regionOk && queryOk;
      }).slice(0, 120);

      results.innerHTML = items.map(function (movie) {
        return [
          '<article class="movie-card">',
          '  <a class="poster-link" href="./movie/' + movie.file + '">',
          '    <img src="./' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '    <span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
          '  </a>',
          '  <div class="card-content">',
          '    <div class="card-kicker">' + escapeHtml(movie.genre) + ' · ' + escapeHtml(movie.region) + '</div>',
          '    <h3><a href="./movie/' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
          '    <p>' + escapeHtml(movie.oneLine) + '</p>',
          '    <div class="card-meta"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    input.addEventListener('input', render);
    type.addEventListener('change', render);
    region.addEventListener('change', render);
    render();
  }

  ready(function () {
    initMenu();
    initHero();
    initPlayer();
    initSearch();
  });
})();
