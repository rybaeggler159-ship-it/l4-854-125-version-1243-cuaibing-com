(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const input = form.querySelector('input[name="q"]');
            const value = input ? input.value.trim() : '';
            const url = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
            window.location.href = url;
        });
    });

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));

    if (slides.length > 1) {
        let current = 0;
        const showSlide = function (index) {
            current = index;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        };
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });
        window.setInterval(function () {
            showSlide((current + 1) % slides.length);
        }, 5600);
    }

    function populateSelect(select, values) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            if (!value) {
                return;
            }
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    const panel = document.querySelector('[data-filter-panel]');
    const cards = Array.from(document.querySelectorAll('.movie-card'));

    if (panel && cards.length) {
        const input = panel.querySelector('[data-filter-input]');
        const regionSelect = panel.querySelector('[data-filter-region]');
        const yearSelect = panel.querySelector('[data-filter-year]');
        const categorySelect = panel.querySelector('[data-filter-category]');
        const emptyState = document.querySelector('[data-empty-state]');
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q') || '';

        const regions = Array.from(new Set(cards.map(function (card) { return card.dataset.region || ''; }))).sort();
        const years = Array.from(new Set(cards.map(function (card) { return card.dataset.year || ''; }))).sort().reverse();

        populateSelect(regionSelect, regions);
        populateSelect(yearSelect, years);

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        const runFilter = function () {
            const query = input ? input.value.trim().toLowerCase() : '';
            const region = regionSelect ? regionSelect.value : '';
            const year = yearSelect ? yearSelect.value : '';
            const category = categorySelect ? categorySelect.value : '';
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.category,
                    card.textContent
                ].join(' ').toLowerCase();
                const matchQuery = !query || haystack.includes(query);
                const matchRegion = !region || card.dataset.region === region;
                const matchYear = !year || card.dataset.year === year;
                const matchCategory = !category || card.dataset.category === category;
                const show = matchQuery && matchRegion && matchYear && matchCategory;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('show', visible === 0);
            }
        };

        [input, regionSelect, yearSelect, categorySelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', runFilter);
                control.addEventListener('change', runFilter);
            }
        });

        runFilter();
    }

    function startPlayer(shell) {
        const video = shell.querySelector('video');
        const overlay = shell.querySelector('.play-overlay');
        const streamUrl = shell.getAttribute('data-play');

        if (!video || !streamUrl) {
            return;
        }

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        if (shell.dataset.ready === '1') {
            video.play().catch(function () {});
            return;
        }

        shell.dataset.ready = '1';

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            video.play().catch(function () {});
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            return;
        }

        video.src = streamUrl;
        video.play().catch(function () {});
    }

    document.querySelectorAll('.player-shell').forEach(function (shell) {
        const overlay = shell.querySelector('.play-overlay');
        const video = shell.querySelector('video');

        if (overlay) {
            overlay.addEventListener('click', function () {
                startPlayer(shell);
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                startPlayer(shell);
            });
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
        }
    });
})();
