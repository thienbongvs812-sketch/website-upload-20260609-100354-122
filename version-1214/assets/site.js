(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-main-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('active', idx === current);
      });
    };
    dots.forEach(function (dot, idx) {
      dot.addEventListener('click', function () {
        show(idx);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }
  }

  var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
  forms.forEach(function (form) {
    var root = form.closest('section') || document;
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-movie-card]'));
    var empty = root.querySelector('[data-empty-state]');
    var textInput = form.querySelector('[data-filter-text]');
    var yearSelect = form.querySelector('[data-filter-year]');
    var regionSelect = form.querySelector('[data-filter-region]');
    var typeSelect = form.querySelector('[data-filter-type]');
    var categorySelect = form.querySelector('[data-filter-category]');
    var apply = function () {
      var query = textInput ? textInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var category = categorySelect ? categorySelect.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var ok = true;
        if (query && text.indexOf(query) === -1) ok = false;
        if (year && card.getAttribute('data-year') !== year) ok = false;
        if (region && card.getAttribute('data-region') !== region) ok = false;
        if (type && card.getAttribute('data-type') !== type) ok = false;
        if (category && card.getAttribute('data-category') !== category) ok = false;
        card.style.display = ok ? '' : 'none';
        if (ok) visible += 1;
      });
      if (empty) empty.classList.toggle('show', visible === 0);
    };
    ['input', 'change'].forEach(function (eventName) {
      form.addEventListener(eventName, apply);
    });
  });
})();
