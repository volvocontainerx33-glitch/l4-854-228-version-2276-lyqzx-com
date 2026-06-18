(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function activate(index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                activate(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                activate((current + 1) % slides.length);
            }, 5200);
        }
    }

    var filterAreas = Array.prototype.slice.call(document.querySelectorAll('[data-filter-area]'));

    filterAreas.forEach(function (area) {
        var search = area.querySelector('[data-filter-search]');
        var year = area.querySelector('[data-filter-year]');
        var type = area.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(area.querySelectorAll('[data-filter-item]'));
        var empty = area.querySelector('[data-empty-state]');

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilters() {
            var keyword = normalize(search && search.value);
            var yearValue = year ? year.value : '';
            var typeValue = type ? type.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type')
                ].join(' '));
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
                var matchType = !typeValue || card.getAttribute('data-type') === typeValue;
                var show = matchKeyword && matchYear && matchType;

                card.classList.toggle('hidden-by-filter', !show);
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        [search, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });
    });

    function attachStream(video) {
        if (!video || video.getAttribute('data-ready') === '1') {
            return;
        }

        var streamUrl = video.getAttribute('data-stream');

        if (!streamUrl) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            video.setAttribute('data-ready', '1');
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                lowLatencyMode: true,
                enableWorker: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            video.setAttribute('data-ready', '1');
            return;
        }

        video.src = streamUrl;
        video.setAttribute('data-ready', '1');
    }

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
        var video = player.querySelector('video[data-stream]');
        var trigger = player.querySelector('[data-play-trigger]');

        function play() {
            attachStream(video);
            player.classList.add('is-playing');
            if (video) {
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }
        }

        if (trigger) {
            trigger.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
        }
    });
})();
