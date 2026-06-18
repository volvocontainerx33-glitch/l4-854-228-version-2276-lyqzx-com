(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobilePanel.hidden = expanded;
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    show(0);
    restart();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var sortSelect = document.querySelector('[data-sort-select]');
  var grid = document.querySelector('[data-filter-grid]');
  var empty = document.querySelector('[data-empty]');

  function textOf(card) {
    return [
      card.dataset.title,
      card.dataset.region,
      card.dataset.type,
      card.dataset.year,
      card.dataset.genre,
      card.dataset.tags
    ].join(' ').toLowerCase();
  }

  function applyFilter() {
    if (!grid) {
      return;
    }

    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-title]'));
    var visible = 0;

    cards.forEach(function (card) {
      var matched = !query || textOf(card).indexOf(query) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.style.display = visible ? 'none' : 'block';
    }
  }

  function applySort() {
    if (!grid || !sortSelect) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-title]'));
    var mode = sortSelect.value;

    cards.sort(function (a, b) {
      if (mode === 'views') {
        return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
      }
      if (mode === 'score') {
        return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
      }
      if (mode === 'year') {
        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
      }
      return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
    });

    cards.forEach(function (card) {
      grid.appendChild(card);
    });
    applyFilter();
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', applySort);
  }

  var searchInput = document.querySelector('[data-search-page-input]');

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get('q') || '';
    searchInput.value = keyword;
    applyFilter();
  }
})();
