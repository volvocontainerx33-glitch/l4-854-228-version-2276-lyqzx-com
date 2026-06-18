(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) return;
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", nav.classList.contains("is-open") ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        button.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initHero() {
    document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      if (!slides.length) return;
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
          dot.setAttribute("aria-selected", i === index ? "true" : "false");
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      function stop() {
        if (timer) window.clearInterval(timer);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });
      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
      show(0);
      start();
    });
  }

  function initCatalogTools() {
    document.querySelectorAll("[data-catalog]").forEach(function (catalog) {
      var input = catalog.querySelector("[data-search]");
      var buttons = Array.prototype.slice.call(catalog.querySelectorAll("[data-filter]"));
      var cards = Array.prototype.slice.call(catalog.querySelectorAll("[data-card]"));
      var empty = catalog.querySelector("[data-empty]");
      var active = "all";

      function apply() {
        var term = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-title") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-year")).toLowerCase();
          var type = card.getAttribute("data-type") || "";
          var matchText = !term || text.indexOf(term) !== -1;
          var matchType = active === "all" || type === active;
          var keep = matchText && matchType;
          card.classList.toggle("hidden-by-filter", !keep);
          if (keep) visible += 1;
        });
        if (empty) empty.classList.toggle("is-visible", visible === 0);
      }

      if (input) input.addEventListener("input", apply);
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          active = button.getAttribute("data-filter") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          apply();
        });
      });
      apply();
    });
  }

  window.initMoviePlayer = function (source, id) {
    var root = document.getElementById(id || "movie-player");
    if (!root) return;
    var video = root.querySelector("video");
    var overlay = root.querySelector(".player-overlay");
    var button = root.querySelector(".player-start");
    var started = false;
    var hlsInstance = null;
    if (!video) return;

    function play() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    function start() {
      if (started) {
        play();
        return;
      }
      started = true;
      if (overlay) overlay.classList.add("is-hidden");
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, play);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            root.classList.add("is-error");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", play, { once: true });
        video.load();
      } else {
        video.src = source;
        video.load();
        play();
      }
    }

    if (overlay) overlay.addEventListener("click", start);
    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }
    video.addEventListener("play", function () {
      if (overlay) overlay.classList.add("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") hlsInstance.destroy();
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initCatalogTools();
  });
})();
