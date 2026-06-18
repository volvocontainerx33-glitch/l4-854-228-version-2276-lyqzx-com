(function () {
    window.setupMoviePlayer = function (videoId, coverId, videoUrl) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        var hlsInstance = null;
        var loaded = false;

        if (!video) {
            return;
        }

        var prepare = function () {
            if (loaded) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(videoUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = videoUrl;
            }

            loaded = true;
        };

        var play = function () {
            prepare();
            var request = video.play();

            if (request && typeof request.catch === "function") {
                request.catch(function () {});
            }
        };

        if (cover) {
            cover.addEventListener("click", function () {
                play();
            });
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });

        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });

        video.addEventListener("pause", function () {
            if (cover) {
                cover.classList.remove("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
