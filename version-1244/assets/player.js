(function () {
    function connect(video, url) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            video.load();
            return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (video.__hlsInstance) {
                video.__hlsInstance.destroy();
            }
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            video.__hlsInstance = hls;
            return new Promise(function (resolve, reject) {
                var finished = false;
                function done() {
                    if (!finished) {
                        finished = true;
                        resolve();
                    }
                }
                hls.on(Hls.Events.MANIFEST_PARSED, done);
                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal && !finished) {
                        finished = true;
                        reject(new Error(data.type || "media"));
                    }
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                window.setTimeout(done, 2500);
            });
        }
        video.src = url;
        video.load();
        return Promise.resolve();
    }

    window.bindMoviePlayer = function (videoId, overlayId, url) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        if (!video || !overlay || !url) {
            return;
        }
        var loaded = false;
        var busy = false;

        function start() {
            if (busy) {
                return;
            }
            busy = true;
            overlay.classList.add("is-hidden");
            var ready = loaded ? Promise.resolve() : connect(video, url);
            loaded = true;
            ready.then(function () {
                return video.play();
            }).catch(function () {
                overlay.classList.remove("is-hidden");
            }).finally(function () {
                busy = false;
            });
        }

        overlay.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (!loaded) {
                start();
            }
        });
    };
})();
