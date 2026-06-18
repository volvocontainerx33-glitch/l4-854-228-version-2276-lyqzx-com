(function () {
  window.initMoviePlayer = function (videoId, url) {
    var video = document.getElementById(videoId);
    if (!video || !url) {
      return;
    }
    var shell = video.closest('.player-shell');
    var cover = shell ? shell.querySelector('.player-cover') : null;
    var hls = null;
    var ready = false;

    function attach() {
      if (ready) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      ready = true;
    }

    function start() {
      attach();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.controls = true;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (!ready || video.paused) {
        start();
      } else {
        video.pause();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
