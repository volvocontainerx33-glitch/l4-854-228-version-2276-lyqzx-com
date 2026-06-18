(function () {
  function attachSource(video, source) {
    if (video.dataset.ready === '1') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.hlsPlayer = hls;
    } else {
      video.src = source;
    }

    video.dataset.ready = '1';
  }

  window.initMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);

    if (!video) {
      return;
    }

    function start() {
      attachSource(video, options.source);

      if (overlay) {
        overlay.hidden = true;
      }

      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  };
})();
