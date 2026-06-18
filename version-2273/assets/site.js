(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMenu() {
    var toggle = qs('.menu-toggle');
    var panel = qs('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = panel.hasAttribute('hidden');
      if (open) {
        panel.removeAttribute('hidden');
        document.body.classList.add('menu-open');
      } else {
        panel.setAttribute('hidden', '');
        document.body.classList.remove('menu-open');
      }
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  function initSearchForms() {
    qsa('form[data-search-path]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input[name="q"]', form);
        var keyword = input ? input.value.trim() : '';
        var path = form.getAttribute('data-search-path') || form.getAttribute('action') || 'search.html';
        window.location.href = keyword ? path + '?q=' + encodeURIComponent(keyword) : path;
      });
    });
  }

  function initHero() {
    var root = qs('[data-hero]');
    if (!root) {
      return;
    }
    var slides = qsa('.hero-slide', root);
    var dots = qsa('.hero-dot', root);
    var prev = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide') || 0));
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function cardText(card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-year'),
      card.getAttribute('data-type'),
      card.getAttribute('data-region'),
      card.getAttribute('data-category'),
      card.getAttribute('data-tags'),
      card.textContent
    ].join(' '));
  }

  function getYear(card) {
    var value = card.getAttribute('data-year') || '';
    var match = value.match(/\d{4}/);
    return match ? Number(match[0]) : 0;
  }

  function applyFilters() {
    var list = qs('.filter-list');
    if (!list) {
      return;
    }
    var cards = qsa('.movie-card', list);
    var input = qs('.filter-input');
    var regionSelect = qs('.region-select');
    var typeSelect = qs('.type-select');
    var keyword = normalize(input ? input.value : '');
    var region = regionSelect ? regionSelect.value : '全部地区';
    var type = typeSelect ? typeSelect.value : '全部类型';
    var visible = 0;

    cards.forEach(function (card) {
      var text = cardText(card);
      var cardRegion = card.getAttribute('data-region') || '';
      var cardType = card.getAttribute('data-type') || '';
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchRegion = !region || region === '全部地区' || cardRegion.indexOf(region) !== -1 || (region === '其他' && ['中国大陆', '中国香港', '中国台湾', '中国', '美国', '日本', '韩国', '英国', '法国'].every(function (item) { return cardRegion.indexOf(item) === -1; }));
      var matchType = !type || type === '全部类型' || cardType === type;
      var show = matchKeyword && matchRegion && matchType;
      card.classList.toggle('is-hidden-card', !show);
      if (show) {
        visible += 1;
      }
    });

    var empty = qs('.empty-state');
    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  function sortCards() {
    var list = qs('.filter-list');
    var select = qs('.sort-select');
    if (!list || !select) {
      return;
    }
    var cards = qsa('.movie-card', list);
    var mode = select.value;
    if (mode === 'default') {
      cards.sort(function (a, b) {
        return Number((a.href.match(/movie-(\d+)/) || [0, 0])[1]) - Number((b.href.match(/movie-(\d+)/) || [0, 0])[1]);
      });
    }
    if (mode === 'year-desc') {
      cards.sort(function (a, b) {
        return getYear(b) - getYear(a);
      });
    }
    if (mode === 'year-asc') {
      cards.sort(function (a, b) {
        return getYear(a) - getYear(b);
      });
    }
    if (mode === 'title') {
      cards.sort(function (a, b) {
        return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-Hans-CN');
      });
    }
    cards.forEach(function (card) {
      list.appendChild(card);
    });
    applyFilters();
  }

  function initFilters() {
    var input = qs('.filter-input');
    var searchInput = qs('.search-input');
    var sort = qs('.sort-select');
    var region = qs('.region-select');
    var type = qs('.type-select');
    if (searchInput) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        searchInput.value = q;
      }
    }
    [input, region, type].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilters);
        element.addEventListener('change', applyFilters);
      }
    });
    if (sort) {
      sort.addEventListener('change', sortCards);
    }
    applyFilters();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initSearchForms();
    initHero();
    initFilters();
  });
})();
