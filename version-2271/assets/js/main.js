(function () {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      const input = form.querySelector("input[name='q']");
      if (!input) {
        return;
      }
      const value = input.value.trim();
      if (!value) {
        event.preventDefault();
        input.focus();
        return;
      }
      event.preventDefault();
      window.location.href = "./search.html?q=" + encodeURIComponent(value);
    });
  });

  const slider = document.querySelector("[data-hero-slider]");

  if (slider) {
    const slides = Array.from(slider.querySelectorAll(".hero-slide"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    const next = slider.querySelector("[data-hero-next]");
    const prev = slider.querySelector("[data-hero-prev]");
    let index = 0;
    let timer = null;

    const activate = function (nextIndex) {
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
    };

    const start = function () {
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5000);
    };

    const reset = function () {
      window.clearInterval(timer);
      start();
    };

    if (next) {
      next.addEventListener("click", function () {
        activate(index + 1);
        reset();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        activate(index - 1);
        reset();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        activate(Number(dot.getAttribute("data-hero-dot")) || 0);
        reset();
      });
    });

    start();
  }

  const filterInput = document.querySelector("[data-page-filter]");
  const cardList = document.querySelector("[data-card-list]");
  const filterCount = document.querySelector("[data-filter-count]");

  if (filterInput && cardList) {
    const cards = Array.from(cardList.querySelectorAll(".movie-card"));
    const updateFilter = function () {
      const term = filterInput.value.trim().toLowerCase();
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-tags") || "",
          card.getAttribute("data-year") || "",
          card.getAttribute("data-genre") || ""
        ].join(" ").toLowerCase();
        const matched = !term || haystack.indexOf(term) !== -1;
        card.classList.toggle("is-hidden-by-filter", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (filterCount) {
        filterCount.textContent = visible + " 部影片";
      }
    };

    filterInput.addEventListener("input", updateFilter);
    updateFilter();
  }

  const searchResults = document.getElementById("search-results");

  if (searchResults && window.SITE_MOVIES) {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get("q") || "").trim();
    const input = document.getElementById("searchInput");
    const title = document.getElementById("searchTitle");
    const summary = document.getElementById("searchSummary");

    if (input) {
      input.value = query;
    }

    const normalizedQuery = query.toLowerCase();
    const results = window.SITE_MOVIES.filter(function (movie) {
      if (!normalizedQuery) {
        return true;
      }
      return [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.category,
        movie.oneLine,
        (movie.tags || []).join(" ")
      ].join(" ").toLowerCase().indexOf(normalizedQuery) !== -1;
    }).slice(0, 160);

    if (title) {
      title.textContent = query ? "“" + query + "”的搜索结果" : "推荐影片";
    }

    if (summary) {
      summary.textContent = query ? "共匹配到 " + results.length + " 条结果，优先展示前 160 条。" : "输入关键词可继续筛选影片库。";
    }

    if (!results.length) {
      searchResults.innerHTML = '<div class="empty-state">没有找到匹配影片，请尝试其他关键词。</div>';
      return;
    }

    searchResults.innerHTML = results.map(function (movie) {
      const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return '<article class="movie-card">' +
        '<a href="' + movie.url + '" class="movie-card-link" aria-label="观看' + escapeHtml(movie.title) + '">' +
        '<figure class="poster-wrap">' +
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="movie-duration">' + movie.duration + '分钟</span>' +
        '<span class="movie-year">' + escapeHtml(movie.year) + '</span>' +
        '<span class="play-hover">▶</span>' +
        '</figure>' +
        '<div class="movie-card-body">' +
        '<h3>' + escapeHtml(movie.title) + '</h3>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="movie-meta-line"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
        '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
        '</a>' +
        '</article>';
    }).join("");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }
})();
