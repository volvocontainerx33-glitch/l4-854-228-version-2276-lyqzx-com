(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function loadStreamTool(done) {
    if (window.Hls) {
      done();
      return;
    }
    var existing = document.querySelector('script[data-stream-tool="true"]');
    if (existing) {
      existing.addEventListener('load', done, { once: true });
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
    script.async = true;
    script.setAttribute('data-stream-tool', 'true');
    script.addEventListener('load', done, { once: true });
    document.head.appendChild(script);
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', menu.classList.contains('open') ? 'true' : 'false');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    show(0);
    restart();
  }

  function setupSearch() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-search-panel]'));
    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-search-input]');
      var region = panel.querySelector('[data-region-filter]');
      var scope = document.querySelector(panel.getAttribute('data-search-panel')) || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card[data-search-text], .rank-row[data-search-text]'));
      var empty = document.querySelector('[data-empty-state="' + panel.getAttribute('data-empty-target') + '"]');

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var regionValue = region ? region.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search-text') || '').toLowerCase();
          var cardRegion = card.getAttribute('data-region') || '';
          var matched = (!keyword || haystack.indexOf(keyword) !== -1) && (!regionValue || cardRegion === regionValue);
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (region) {
        region.addEventListener('change', apply);
      }
      apply();
    });
  }

  window.bindMoviePlayer = function (streamUrl) {
    ready(function () {
      var video = document.getElementById('movie-player');
      var startButton = document.getElementById('player-start');
      if (!video || !startButton || !streamUrl) {
        return;
      }
      var attached = false;
      var instance = null;

      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
        } else {
          loadStreamTool(function () {
            if (window.Hls && window.Hls.isSupported()) {
              instance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
              instance.loadSource(streamUrl);
              instance.attachMedia(video);
            } else {
              video.src = streamUrl;
            }
          });
        }
      }

      function play() {
        startButton.classList.add('is-hidden');
        attach();
        var started = video.play();
        if (started && typeof started.catch === 'function') {
          started.catch(function () {
            startButton.classList.remove('is-hidden');
          });
        }
      }

      startButton.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      window.addEventListener('pagehide', function () {
        if (instance) {
          instance.destroy();
        }
      });
    });
  };

  ready(function () {
    setupNavigation();
    setupHero();
    setupSearch();
  });
})();
