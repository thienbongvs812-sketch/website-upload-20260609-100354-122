(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', function () {
        mobileMenu.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          return;
        }
        event.preventDefault();
        var action = form.getAttribute('action') || 'search.html';
        window.location.href = action + '?q=' + encodeURIComponent(input.value.trim());
      });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === index);
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

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          show(dotIndex);
          start();
        });
      });

      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    }

    var panel = document.querySelector('[data-filter-panel]');
    if (panel) {
      var items = Array.prototype.slice.call(document.querySelectorAll('.filter-item'));
      var keywordInput = panel.querySelector('[data-filter="keyword"]');
      var yearSelect = panel.querySelector('[data-filter="year"]');
      var typeSelect = panel.querySelector('[data-filter="type"]');
      var categorySelect = panel.querySelector('[data-filter="category"]');
      var count = panel.querySelector('[data-filter-count]');
      var params = new URLSearchParams(window.location.search);
      var initialKeyword = params.get('q') || '';

      function fillSelect(select, key) {
        if (!select) {
          return;
        }
        var values = [];
        items.forEach(function (item) {
          var value = item.getAttribute('data-' + key) || '';
          if (value && values.indexOf(value) === -1) {
            values.push(value);
          }
        });
        values.sort(function (a, b) {
          var numberA = parseInt(a, 10);
          var numberB = parseInt(b, 10);
          if (!isNaN(numberA) && !isNaN(numberB)) {
            return numberB - numberA;
          }
          return a.localeCompare(b, 'zh-CN');
        });
        values.forEach(function (value) {
          var option = document.createElement('option');
          option.value = value;
          option.textContent = value;
          select.appendChild(option);
        });
      }

      function applyFilters() {
        var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var category = categorySelect ? categorySelect.value : '';
        var visible = 0;

        items.forEach(function (item) {
          var haystack = (item.getAttribute('data-search') || '').toLowerCase();
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchYear = !year || item.getAttribute('data-year') === year;
          var matchType = !type || item.getAttribute('data-type') === type;
          var matchCategory = !category || item.getAttribute('data-category') === category;
          var show = matchKeyword && matchYear && matchType && matchCategory;
          item.classList.toggle('is-hidden', !show);
          if (show) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '显示 ' + visible + ' 部';
        }
      }

      fillSelect(yearSelect, 'year');
      fillSelect(typeSelect, 'type');

      if (keywordInput && initialKeyword) {
        keywordInput.value = initialKeyword;
      }

      [keywordInput, yearSelect, typeSelect, categorySelect].forEach(function (control) {
        if (!control) {
          return;
        }
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      });

      applyFilters();
    }
  });
})();
