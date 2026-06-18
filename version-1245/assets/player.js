(function () {
    function initPlayer(player) {
        var video = player.querySelector('video');
        var overlay = player.querySelector('.player-overlay');
        var url = player.getAttribute('data-video-url');

        if (!video || !url) {
            return;
        }

        function load() {
            if (video.dataset.loaded === '1') {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegURL')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(url);
                hls.attachMedia(video);
                player.hlsInstance = hls;
            } else {
                video.src = url;
            }

            video.dataset.loaded = '1';
        }

        function start() {
            load();

            if (overlay) {
                overlay.classList.add('is-hidden');
            }

            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (video.dataset.loaded !== '1') {
                start();
            }
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
    }

    document.querySelectorAll('.player-shell').forEach(initPlayer);
})();
