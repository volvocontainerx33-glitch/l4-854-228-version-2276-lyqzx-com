function initMoviePlayer(source, videoId, buttonId, messageId) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var message = document.getElementById(messageId);
  var loaded = false;
  var player = null;

  if (!video || !button) {
    return;
  }

  function showMessage(text) {
    if (!message) {
      return;
    }

    message.textContent = text;
    message.classList.add("is-visible");
  }

  function loadVideo() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      player = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      player.loadSource(source);
      player.attachMedia(video);
      player.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showMessage("播放暂时不可用，请稍后再试");
        }
      });
      return;
    }

    video.src = source;
  }

  function startPlayback() {
    loadVideo();
    button.classList.add("is-hidden");
    video.setAttribute("controls", "controls");
    var playTask = video.play();

    if (playTask && typeof playTask.catch === "function") {
      playTask.catch(function () {
        button.classList.remove("is-hidden");
      });
    }
  }

  button.addEventListener("click", startPlayback);
  video.addEventListener("click", function () {
    if (!loaded || video.paused) {
      startPlayback();
    }
  });
  video.addEventListener("play", function () {
    button.classList.add("is-hidden");
  });
  video.addEventListener("pause", function () {
    if (loaded) {
      button.classList.remove("is-hidden");
    }
  });
  window.addEventListener("pagehide", function () {
    if (player && typeof player.destroy === "function") {
      player.destroy();
    }
  });
}
