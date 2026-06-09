(function () {
    "use strict";

    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function one(selector, root) {
        return (root || document).querySelector(selector);
    }

    function setupMenu() {
        var toggle = one("[data-menu-toggle]");
        var menu = one("[data-mobile-menu]");

        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupStage() {
        var slides = all("[data-stage-slide]");
        var dots = all("[data-stage-dot]");

        if (slides.length < 2) {
            return;
        }

        var current = 0;
        var timer = null;

        function activate(index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-current", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-current", dotIndex === current);
            });
        }

        function next() {
            activate((current + 1) % slides.length);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                activate(index);
                if (timer) {
                    clearInterval(timer);
                }
                timer = setInterval(next, 5200);
            });
        });

        timer = setInterval(next, 5200);
    }

    function setupFilters() {
        var cards = all(".filter-card");
        var input = one("[data-filter-input]");
        var region = one("[data-filter-region]");
        var kind = one("[data-filter-kind]");
        var year = one("[data-filter-year]");
        var empty = one("[data-empty-message]");

        if (!cards.length) {
            return;
        }

        function norm(value) {
            return String(value || "").toLowerCase().trim();
        }

        function apply() {
            var keyword = norm(input && input.value);
            var regionValue = region ? region.value : "";
            var kindValue = kind ? kind.value : "";
            var yearValue = year && year.value ? parseInt(year.value, 10) : 0;
            var visible = 0;

            cards.forEach(function (card) {
                var title = norm(card.getAttribute("data-title"));
                var tags = norm(card.getAttribute("data-tags"));
                var cardYear = parseInt(card.getAttribute("data-year") || "0", 10);
                var cardRegion = card.getAttribute("data-region") || "";
                var cardKind = card.getAttribute("data-kind") || "";
                var okKeyword = !keyword || title.indexOf(keyword) > -1 || tags.indexOf(keyword) > -1 || String(cardYear).indexOf(keyword) > -1;
                var okRegion = !regionValue || cardRegion === regionValue;
                var okKind = !kindValue || cardKind.indexOf(kindValue) > -1;
                var okYear = !yearValue || cardYear >= yearValue;
                var show = okKeyword && okRegion && okKind && okYear;

                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [input, region, kind, year].forEach(function (node) {
            if (node) {
                node.addEventListener("input", apply);
                node.addEventListener("change", apply);
            }
        });
    }

    window.startVideoPlayer = function (stream) {
        var video = one("[data-video-player]");
        var trigger = one("[data-play-trigger]");
        var mask = one("[data-play-mask]");
        var loaded = false;

        if (!video || !stream) {
            return;
        }

        function load() {
            if (loaded) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }

            loaded = true;
        }

        function play() {
            load();

            if (mask) {
                mask.classList.add("is-hidden");
            }

            var playResult = video.play();
            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {});
            }
        }

        if (trigger) {
            trigger.addEventListener("click", play);
        }

        if (mask) {
            mask.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupStage();
        setupFilters();
    });
}());
