(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;
    let timerId = null;

    const showSlide = function (nextIndex) {
      if (!slides.length) {
        return;
      }

      activeIndex = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === activeIndex);
      });

      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === activeIndex);
      });
    };

    const startTimer = function () {
      timerId = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5000);
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        window.clearInterval(timerId);
        showSlide(index);
        startTimer();
      });
    });

    startTimer();
  }

  const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
  const searchInput = document.querySelector('[data-search-input]');
  const regionFilter = document.querySelector('[data-region-filter]');
  const yearFilter = document.querySelector('[data-year-filter]');
  const genreFilter = document.querySelector('[data-genre-filter]');
  const resultCount = document.querySelector('[data-result-count]');

  const uniqueValues = function (attributeName) {
    return Array.from(new Set(cards.map(function (card) {
      return card.getAttribute(attributeName) || '';
    }).filter(Boolean))).sort(function (a, b) {
      return b.localeCompare(a, 'zh-CN');
    });
  };

  const fillSelect = function (select, values) {
    if (!select) {
      return;
    }

    values.slice(0, 120).forEach(function (value) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  };

  fillSelect(regionFilter, uniqueValues('data-region'));
  fillSelect(yearFilter, uniqueValues('data-year'));
  fillSelect(genreFilter, uniqueValues('data-genre'));

  const applyFilters = function () {
    if (!cards.length) {
      return;
    }

    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const region = regionFilter ? regionFilter.value : '';
    const year = yearFilter ? yearFilter.value : '';
    const genre = genreFilter ? genreFilter.value : '';
    let visibleCount = 0;

    cards.forEach(function (card) {
      const searchBlob = (card.getAttribute('data-search') || '').toLowerCase();
      const matchesKeyword = !keyword || searchBlob.indexOf(keyword) !== -1;
      const matchesRegion = !region || card.getAttribute('data-region') === region;
      const matchesYear = !year || card.getAttribute('data-year') === year;
      const matchesGenre = !genre || card.getAttribute('data-genre') === genre;
      const visible = matchesKeyword && matchesRegion && matchesYear && matchesGenre;

      card.hidden = !visible;
      if (visible) {
        visibleCount += 1;
      }
    });

    if (resultCount) {
      resultCount.textContent = '当前显示 ' + visibleCount + ' 条结果';
    }
  };

  [searchInput, regionFilter, yearFilter, genreFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  applyFilters();

  document.querySelectorAll('img[data-cover]').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-unavailable');
    }, { once: true });
  });
})();
