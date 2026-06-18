(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var links = document.querySelector("[data-nav-links]");

    if (toggle && links) {
        toggle.addEventListener("click", function () {
            links.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;

        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        };

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
            });
        });

        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var homeSearch = document.querySelector("[data-home-search]");

    if (homeSearch) {
        homeSearch.addEventListener("submit", function (event) {
            var input = homeSearch.querySelector("input[name='q']");

            if (!input || !input.value.trim()) {
                return;
            }

            event.preventDefault();
            window.location.href = "./search.html?q=" + encodeURIComponent(input.value.trim());
        });
    }

    var filterContainer = document.querySelector("[data-filter-container]");

    if (filterContainer) {
        var cards = Array.prototype.slice.call(filterContainer.querySelectorAll("[data-filter-card]"));
        var searchInput = document.querySelector("[data-filter-search]");
        var regionSelect = document.querySelector("[data-filter-region]");
        var yearSelect = document.querySelector("[data-filter-year]");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");

        if (searchInput && initialQuery) {
            searchInput.value = initialQuery;
        }

        var applyFilters = function () {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var region = regionSelect ? regionSelect.value : "";
            var year = yearSelect ? yearSelect.value : "";

            cards.forEach(function (card) {
                var text = (card.getAttribute("data-filter-text") || "").toLowerCase();
                var cardRegion = card.getAttribute("data-region") || "";
                var cardYear = card.getAttribute("data-year") || "";
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesRegion = !region || cardRegion === region;
                var matchesYear = !year || cardYear === year;

                card.classList.toggle("is-hidden-card", !(matchesQuery && matchesRegion && matchesYear));
            });
        };

        [searchInput, regionSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        applyFilters();
    }
})();
