(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");
    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        var opened = mobileMenu.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
        document.body.classList.toggle("lock-scroll", opened);
      });
    }

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer;
      var activate = function (index) {
        current = index;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      };
      var next = function () {
        if (slides.length) {
          activate((current + 1) % slides.length);
        }
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          activate(index);
          if (timer) {
            clearInterval(timer);
          }
          timer = setInterval(next, 5000);
        });
      });
      if (slides.length > 1) {
        timer = setInterval(next, 5000);
      }
    }

    var list = document.querySelector('[data-card-list="searchable"]');
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll("[data-search]")) : [];
    var empty = document.querySelector("[data-empty-state]");
    var activeQuery = "";
    var activeFilter = "all";

    function normalize(value) {
      return (value || "").toString().trim().toLowerCase();
    }

    function applySearch() {
      if (!cards.length) {
        return;
      }
      var query = normalize(activeQuery);
      var filter = normalize(activeFilter);
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesFilter = filter === "all" || haystack.indexOf(filter) !== -1;
        var visible = matchesQuery && matchesFilter;
        card.style.display = visible ? "" : "none";
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", shown === 0);
      }
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    if (initialQuery && cards.length) {
      activeQuery = initialQuery;
      document.querySelectorAll('[name="q"]').forEach(function (input) {
        input.value = initialQuery;
      });
      applySearch();
      var target = document.querySelector("#catalog");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector('[name="q"]');
        var value = input ? input.value.trim() : "";
        if (cards.length) {
          event.preventDefault();
          activeQuery = value;
          applySearch();
          if (history.replaceState) {
            var url = value ? (window.location.pathname + "?q=" + encodeURIComponent(value)) : window.location.pathname;
            history.replaceState(null, "", url);
          }
        }
      });
    });

    document.querySelectorAll("[data-filter-value]").forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = button.getAttribute("data-filter-value") || "all";
        document.querySelectorAll("[data-filter-value]").forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applySearch();
      });
    });
  });
})();
