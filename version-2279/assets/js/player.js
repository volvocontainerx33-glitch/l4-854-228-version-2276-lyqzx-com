import { H as Hls } from './hls-DrU42sTK.js';

const playerShells = Array.from(document.querySelectorAll('[data-player-shell]'));

const setError = function (shell, message) {
  const errorBox = shell.querySelector('[data-player-error]');

  if (!errorBox) {
    return;
  }

  errorBox.hidden = false;
  errorBox.textContent = message;
};

const initializePlayer = function (shell) {
  const video = shell.querySelector('[data-hls-player]');
  const playButton = shell.querySelector('[data-play-button]');

  if (!video) {
    return;
  }

  const source = video.getAttribute('data-src');

  if (!source) {
    setError(shell, '当前影片缺少播放源。');
    return;
  }

  if (Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.ERROR, function (_event, data) {
      if (!data || !data.fatal) {
        return;
      }

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        setError(shell, '网络连接异常，正在尝试重新加载播放源。');
        hls.startLoad();
        return;
      }

      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        setError(shell, '媒体解码异常，正在尝试恢复播放。');
        hls.recoverMediaError();
        return;
      }

      setError(shell, '当前浏览器暂时无法播放该视频。');
      hls.destroy();
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
  } else {
    setError(shell, '当前浏览器不支持 HLS 播放，请更换支持 HLS 的浏览器。');
  }

  const playOrPause = function () {
    if (video.paused) {
      video.play().catch(function () {
        setError(shell, '播放启动失败，请再次点击播放按钮。');
      });
    } else {
      video.pause();
    }
  };

  if (playButton) {
    playButton.addEventListener('click', playOrPause);
  }

  video.addEventListener('click', function () {
    if (!video.controls) {
      playOrPause();
    }
  });

  video.addEventListener('play', function () {
    shell.classList.add('is-playing');
  });

  video.addEventListener('pause', function () {
    shell.classList.remove('is-playing');
  });
};

playerShells.forEach(initializePlayer);
