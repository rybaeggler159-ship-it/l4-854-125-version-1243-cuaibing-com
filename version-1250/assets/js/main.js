(function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  document.querySelectorAll('.nav-dropdown > button').forEach(function (button) {
    button.addEventListener('click', function () {
      var parent = button.parentElement;
      if (parent) {
        parent.classList.toggle('open');
      }
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  document.querySelectorAll('.filter-panel').forEach(function (panel) {
    var input = panel.querySelector('.filter-input');
    var select = panel.querySelector('.filter-select');
    var list = panel.parentElement ? panel.parentElement.querySelector('.js-filter-list') : null;
    var items = list ? Array.prototype.slice.call(list.querySelectorAll('.js-filter-item')) : [];

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var type = select ? select.value.trim().toLowerCase() : '';
      items.forEach(function (item) {
        var haystack = [
          item.getAttribute('data-title'),
          item.getAttribute('data-year'),
          item.getAttribute('data-region'),
          item.getAttribute('data-type'),
          item.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedType = !type || haystack.indexOf(type) !== -1;
        item.classList.toggle('is-filtered-out', !(matchedKeyword && matchedType));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (select) {
      select.addEventListener('change', applyFilter);
    }
  });
})();
