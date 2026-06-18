(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });
    startTimer();
  }

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
  filterForms.forEach(function (form) {
    var input = form.querySelector('[data-filter-input]');
    var select = form.querySelector('[data-filter-select]');
    var year = form.querySelector('[data-filter-year]');
    var clear = form.querySelector('[data-filter-clear]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-item]'));
    var empty = document.querySelector('[data-no-result]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(input && input.value);
      var genre = normalize(select && select.value);
      var selectedYear = normalize(year && year.value);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region')
        ].join(' '));
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesGenre = !genre || text.indexOf(genre) !== -1;
        var matchesYear = !selectedYear || normalize(card.getAttribute('data-year')) === selectedYear;
        var ok = matchesKeyword && matchesGenre && matchesYear;
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (select) {
      select.addEventListener('change', applyFilter);
    }
    if (year) {
      year.addEventListener('change', applyFilter);
    }
    if (clear) {
      clear.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (select) {
          select.value = '';
        }
        if (year) {
          year.value = '';
        }
        applyFilter();
      });
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && input) {
      input.value = q;
    }
    applyFilter();
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var state = player.querySelector('[data-player-state]');
    var stream = player.getAttribute('data-stream');
    var ready = false;
    var hlsInstance = null;

    function setState(text, hide) {
      if (!state) {
        return;
      }
      state.textContent = text;
      state.classList.toggle('hidden', Boolean(hide));
    }

    function hideButton() {
      if (button) {
        button.classList.add('hidden');
      }
    }

    function bindAndPlay() {
      if (!video || !stream) {
        setState('视频暂时无法播放，请稍后再试', false);
        return;
      }
      hideButton();
      setState('正在加载影片', false);
      if (!ready) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          ready = true;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          ready = true;
        } else {
          video.src = stream;
          ready = true;
        }
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(function () {
          setState('', true);
        }).catch(function () {
          setState('点击视频继续播放', false);
        });
      }
    }

    if (button) {
      button.addEventListener('click', bindAndPlay);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!ready || video.paused) {
          bindAndPlay();
        }
      });
      video.addEventListener('playing', function () {
        hideButton();
        setState('', true);
      });
      video.addEventListener('error', function () {
        setState('视频暂时无法播放，请稍后再试', false);
      });
    }
    window.addEventListener('pagehide', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  });
})();
