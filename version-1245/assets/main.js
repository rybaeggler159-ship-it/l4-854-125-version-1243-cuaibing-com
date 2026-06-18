(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = qs('[data-menu-button]');
    var mobilePanel = qs('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            menuButton.classList.toggle('is-open');
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = qs('[data-hero]');

    if (hero) {
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });

            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                play();
            });
        });

        hero.addEventListener('mouseenter', function () {
            window.clearInterval(timer);
        });

        hero.addEventListener('mouseleave', play);
        show(0);
        play();
    }

    qsa('[data-filter-panel]').forEach(function (panel) {
        var scope = panel.parentElement || document;
        var grid = qs('[data-filter-grid]', scope) || qs('.movie-grid', scope) || qs('.ranking-grid', scope);
        var input = qs('[data-filter-input]', panel);
        var year = qs('[data-filter-year]', panel);
        var type = qs('[data-filter-type]', panel);
        var category = qs('[data-filter-category]', panel);
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (input && input.hasAttribute('data-query-sync') && initialQuery) {
            input.value = initialQuery;
        }

        function normalize(value) {
            return (value || '').toString().trim().toLowerCase();
        }

        function apply() {
            if (!grid) {
                return;
            }

            var query = normalize(input ? input.value : '');
            var yearValue = normalize(year ? year.value : '');
            var typeValue = normalize(type ? type.value : '');
            var categoryValue = normalize(category ? category.value : '');

            qsa('[data-search-card]', grid).forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var passQuery = !query || haystack.indexOf(query) !== -1;
                var passYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
                var passType = !typeValue || normalize(card.getAttribute('data-type')) === typeValue;
                var passCategory = !categoryValue || normalize(card.getAttribute('data-category')) === categoryValue;

                card.classList.toggle('is-hidden-by-filter', !(passQuery && passYear && passType && passCategory));
            });
        }

        [input, year, type, category].forEach(function (el) {
            if (el) {
                el.addEventListener('input', apply);
                el.addEventListener('change', apply);
            }
        });

        apply();
    });
})();
