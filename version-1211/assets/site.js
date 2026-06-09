(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initSortableLists() {
    var list = document.querySelector("[data-sortable-list]");
    var toolbar = document.querySelector("[data-list-toolbar]");
    if (!list || !toolbar) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
    var input = toolbar.querySelector("[data-local-search]");
    var buttons = Array.prototype.slice.call(toolbar.querySelectorAll("[data-sort]"));

    function applySearch() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var title = (card.getAttribute("data-title") || "").toLowerCase();
        var text = card.textContent.toLowerCase();
        var matched = !keyword || title.indexOf(keyword) > -1 || text.indexOf(keyword) > -1;
        card.classList.toggle("hidden-card", !matched);
      });
    }

    function sortBy(mode) {
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === "views") {
          return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
        }
        if (mode === "rating") {
          return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
        }
        return String(b.getAttribute("data-date")).localeCompare(String(a.getAttribute("data-date")));
      });
      sorted.forEach(function (card) {
        list.appendChild(card);
      });
      cards = sorted;
      applySearch();
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        sortBy(button.getAttribute("data-sort") || "date");
      });
    });

    if (input) {
      input.addEventListener("input", applySearch);
    }
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\" data-movie-card data-title=\"" + escapeHtml(movie.title) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-type=\"" + escapeHtml(movie.type) + "\" data-rating=\"" + movie.rating + "\" data-views=\"" + movie.views + "\" data-date=\"" + escapeHtml(movie.date) + "\">" +
      "<a href=\"" + escapeHtml(movie.url) + "\" class=\"card-link\">" +
      "<div class=\"poster-wrap\"><img src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"score-badge\">★ " + Number(movie.rating).toFixed(1) + "</span></div>" +
      "<div class=\"card-body\"><h3>" + escapeHtml(movie.title) + "</h3><p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"meta-row\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
      "<div class=\"tag-row\">" + tags + "</div></div></a></article>";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function initSearch() {
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    if (!input || !results || !window.siteMovies) {
      return;
    }
    var clear = document.querySelector("[data-search-clear]");
    var title = document.querySelector("[data-search-title]");
    var category = document.querySelector("[data-search-category]");
    var type = document.querySelector("[data-search-type]");
    var year = document.querySelector("[data-search-year]");

    function render() {
      var keyword = input.value.trim().toLowerCase();
      var categoryValue = category ? category.value : "";
      var typeValue = type ? type.value : "";
      var yearValue = year ? year.value : "";
      var items = window.siteMovies.filter(function (movie) {
        var haystack = [movie.title, movie.oneLine, movie.region, movie.year, movie.genre, movie.type, (movie.tags || []).join(" ")].join(" ").toLowerCase();
        return (!keyword || haystack.indexOf(keyword) > -1) &&
          (!categoryValue || movie.category === categoryValue) &&
          (!typeValue || movie.type === typeValue) &&
          (!yearValue || movie.year === yearValue);
      });
      items.sort(function (a, b) {
        return b.views - a.views;
      });
      results.innerHTML = items.map(movieCard).join("");
      if (title) {
        title.textContent = keyword || categoryValue || typeValue || yearValue ? "搜索结果 · " + items.length + " 部影视" : "热门影视";
      }
    }

    input.addEventListener("input", render);
    [category, type, year].forEach(function (select) {
      if (select) {
        select.addEventListener("change", render);
      }
    });
    if (clear) {
      clear.addEventListener("click", function () {
        input.value = "";
        if (category) {
          category.value = "";
        }
        if (type) {
          type.value = "";
        }
        if (year) {
          year.value = "";
        }
        render();
        input.focus();
      });
    }
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var url = player.getAttribute("data-url");
      var attached = false;
      var hls = null;

      function attach() {
        if (!video || !url || attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
      }

      function play() {
        attach();
        if (button) {
          button.classList.add("hidden");
        }
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
        video.addEventListener("play", function () {
          if (button) {
            button.classList.add("hidden");
          }
        });
        video.addEventListener("loadedmetadata", function () {
          if (button && button.classList.contains("hidden")) {
            var promise = video.play();
            if (promise && promise.catch) {
              promise.catch(function () {});
            }
          }
        });
      }
      player.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          play();
        }
      });
      player.__hls = hls;
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSortableLists();
    initSearch();
    initPlayers();
  });
})();
