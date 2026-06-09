(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function updateFilter(input) {
    var query = normalize(input.value);
    var items = all('[data-filter-card]');
    var visible = 0;
    items.forEach(function (item) {
      var haystack = normalize(item.getAttribute('data-search'));
      var match = !query || haystack.indexOf(query) !== -1;
      item.hidden = !match;
      if (match) {
        visible += 1;
      }
    });
    var empty = one('[data-empty-state]');
    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  function sortCards(select) {
    var target = one(select.getAttribute('data-sort-target'));
    if (!target) {
      return;
    }
    var cards = all('[data-filter-card]', target);
    var mode = select.value;
    cards.sort(function (a, b) {
      if (mode === 'title') {
        return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
      }
      var ay = parseInt(a.getAttribute('data-year') || '0', 10);
      var by = parseInt(b.getAttribute('data-year') || '0', 10);
      return by - ay;
    });
    cards.forEach(function (card) {
      target.appendChild(card);
    });
  }

  function initMenu() {
    var button = one('[data-menu-button]');
    var panel = one('[data-mobile-menu]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      button.textContent = open ? '×' : '☰';
    });
  }

  function initHero() {
    var slides = all('[data-hero-slide]');
    var dots = all('[data-hero-dot]');
    if (slides.length < 2) {
      return;
    }
    var active = 0;
    var timer = null;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === active);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === active);
      });
    }
    function play() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }
    dots.forEach(function (dot, idx) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(idx);
        play();
      });
    });
    show(0);
    play();
  }

  function initSearchAndSort() {
    var search = one('[data-movie-search]');
    if (search) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        search.value = q;
      }
      search.addEventListener('input', function () {
        updateFilter(search);
      });
      updateFilter(search);
    }
    all('[data-sort-target]').forEach(function (select) {
      select.addEventListener('change', function () {
        sortCards(select);
      });
    });
  }

  window.initMoviePlayer = function (playUrl) {
    var video = one('#movie-player');
    var overlay = one('[data-play-overlay]');
    var hlsInstance = null;
    if (!video || !playUrl) {
      return;
    }
    function bind() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(playUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = playUrl;
      }
    }
    function start() {
      if (!video.src && !hlsInstance) {
        bind();
      }
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }
    if (overlay) {
      overlay.addEventListener('click', start);
    }
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSearchAndSort();
  });
})();
