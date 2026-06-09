(function () {
  const menuButton = document.querySelector('.mobile-menu-button');
  const mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      const open = mobilePanel.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    const prev = hero.querySelector('.hero-prev');
    const next = hero.querySelector('.hero-next');
    let current = 0;
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
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
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const index = Number(dot.getAttribute('data-slide')) || 0;
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  const searchInput = document.getElementById('movieSearch');
  const categoryFilter = document.getElementById('categoryFilter');
  const yearFilter = document.getElementById('yearFilter');
  const filterCards = Array.from(document.querySelectorAll('.movie-card[data-title]'));

  if (searchInput && filterCards.length) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;

    function applyFilters() {
      const query = searchInput.value.trim().toLowerCase();
      const category = categoryFilter ? categoryFilter.value : '';
      const year = yearFilter ? yearFilter.value : '';

      filterCards.forEach(function (card) {
        const title = (card.getAttribute('data-title') || '').toLowerCase();
        const meta = (card.getAttribute('data-meta') || '').toLowerCase();
        const cardCategory = card.getAttribute('data-category') || '';
        const cardYear = card.getAttribute('data-year') || '';
        const matchesQuery = !query || title.includes(query) || meta.includes(query);
        const matchesCategory = !category || cardCategory === category;
        const matchesYear = !year || cardYear === year;
        card.classList.toggle('is-hidden', !(matchesQuery && matchesCategory && matchesYear));
      });
    }

    searchInput.addEventListener('input', applyFilters);

    if (categoryFilter) {
      categoryFilter.addEventListener('change', applyFilters);
    }

    if (yearFilter) {
      yearFilter.addEventListener('change', applyFilters);
    }

    applyFilters();
  }
})();

function initMoviePlayer(streamUrl) {
  const video = document.getElementById('movieVideo');
  const overlay = document.getElementById('playOverlay');

  if (!video || !streamUrl) {
    return;
  }

  function bindStream() {
    if (video.dataset.bound === '1') {
      return;
    }

    video.dataset.bound = '1';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function startPlayback() {
    bindStream();

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  bindStream();
}
