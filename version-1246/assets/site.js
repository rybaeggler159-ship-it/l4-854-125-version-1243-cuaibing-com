(function () {
    var header = document.querySelector('[data-header]');
    var toggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    if (header) {
        window.addEventListener('scroll', function () {
            header.classList.toggle('is-scrolled', window.scrollY > 8);
        }, { passive: true });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var next = slider.querySelector('[data-hero-next]');
        var prev = slider.querySelector('[data-hero-prev]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                start();
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        showSlide(0);
        start();
    }

    var searchInput = document.querySelector('[data-card-search]');
    var cardList = document.querySelector('[data-card-list]');
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    var currentFilter = '';

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        if (!cardList) {
            return;
        }
        var query = normalize(searchInput ? searchInput.value : '');
        var cards = Array.prototype.slice.call(cardList.children);
        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search') || card.textContent);
            var type = normalize(card.getAttribute('data-type') || text);
            var matchQuery = !query || text.indexOf(query) !== -1;
            var matchFilter = !currentFilter || type.indexOf(normalize(currentFilter)) !== -1 || text.indexOf(normalize(currentFilter)) !== -1;
            card.classList.toggle('is-filtered-out', !(matchQuery && matchFilter));
        });
    }

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            searchInput.value = q;
        }
        searchInput.addEventListener('input', applyFilters);
    }

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            chips.forEach(function (item) {
                item.classList.remove('is-active');
            });
            chip.classList.add('is-active');
            currentFilter = chip.getAttribute('data-filter-value') || '';
            applyFilters();
        });
    });

    applyFilters();

    document.querySelectorAll('[data-player]').forEach(function (box) {
        var video = box.querySelector('video');
        var poster = box.querySelector('.player-poster');
        var stream = box.getAttribute('data-stream');
        var hls = null;
        var ready = false;

        function attach() {
            if (!video || !stream || ready) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                ready = true;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    maxBufferLength: 30,
                    capLevelToPlayerSize: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                ready = true;
            } else {
                video.src = stream;
                ready = true;
            }
        }

        function play() {
            attach();
            if (poster) {
                poster.classList.add('is-hidden');
            }
            if (video) {
                video.controls = true;
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            }
        }

        if (poster) {
            poster.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!ready || video.paused) {
                    play();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
