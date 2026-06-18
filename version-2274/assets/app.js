(function () {
  var menuButton = document.querySelector("[data-mobile-menu-button]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    if (previous) {
      previous.addEventListener("click", function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var sortSelect = document.querySelector("[data-sort-select]");
  var cardGrid = document.querySelector("[data-filter-grid]");

  function filterCards() {
    if (!cardGrid) {
      return;
    }

    var query = filterInput ? filterInput.value.trim().toLowerCase() : "";
    var cards = Array.prototype.slice.call(cardGrid.querySelectorAll("[data-movie-card]"));

    cards.forEach(function (card) {
      var text = [
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-genre")
      ].join(" ").toLowerCase();
      card.classList.toggle("hidden-card", query && text.indexOf(query) === -1);
    });
  }

  function sortCards() {
    if (!cardGrid || !sortSelect) {
      return;
    }

    var mode = sortSelect.value;
    var cards = Array.prototype.slice.call(cardGrid.querySelectorAll("[data-movie-card]"));

    cards.sort(function (a, b) {
      if (mode === "rating") {
        return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
      }

      if (mode === "views") {
        return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
      }

      return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
    });

    cards.forEach(function (card) {
      cardGrid.appendChild(card);
    });

    filterCards();
  }

  if (filterInput) {
    filterInput.addEventListener("input", filterCards);
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", sortCards);
    sortCards();
  }

  var searchRoot = document.querySelector("[data-search-root]");

  if (searchRoot && window.siteMovieIndex) {
    var params = new URLSearchParams(window.location.search);
    var searchInput = document.querySelector("[data-search-input]");
    var initialQuery = params.get("q") || "";

    if (searchInput) {
      searchInput.value = initialQuery;
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function createCard(movie) {
      var tags = movie.tags.slice(0, 4).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");

      return `
<article class="movie-card" data-movie-card>
  <a class="poster-link" href="./${movie.file}" aria-label="观看${escapeHtml(movie.title)}">
    <img src="./${movie.cover}.jpg" alt="${escapeHtml(movie.title)}" loading="lazy">
    <span class="poster-badge">${escapeHtml(movie.duration)}</span>
  </a>
  <div class="card-body">
    <a class="card-title" href="./${movie.file}">${escapeHtml(movie.title)}</a>
    <p class="card-desc">${escapeHtml(movie.oneLine)}</p>
    <div class="card-meta"><span>${escapeHtml(movie.year)}</span><span>${escapeHtml(movie.region)}</span><span>${escapeHtml(movie.category)}</span></div>
    <div class="tag-row">${tags}</div>
  </div>
</article>`;
    }

    function performSearch(query) {
      var normalized = query.trim().toLowerCase();
      var results = window.siteMovieIndex.filter(function (movie) {
        if (!normalized) {
          return true;
        }

        return [movie.title, movie.oneLine, movie.region, movie.year, movie.genre, movie.category, movie.tags.join(" ")]
          .join(" ")
          .toLowerCase()
          .indexOf(normalized) !== -1;
      }).slice(0, 120);

      if (!results.length) {
        searchRoot.innerHTML = "<div class=\"empty-state\">没有找到匹配内容，可以换一个关键词继续搜索。</div>";
        return;
      }

      searchRoot.innerHTML = results.map(createCard).join("");
    }

    var searchForm = document.querySelector("[data-search-form]");

    if (searchForm && searchInput) {
      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var query = searchInput.value.trim();
        var url = new URL(window.location.href);
        if (query) {
          url.searchParams.set("q", query);
        } else {
          url.searchParams.delete("q");
        }
        window.history.replaceState(null, "", url.toString());
        performSearch(query);
      });
    }

    performSearch(initialQuery);
  }
})();
