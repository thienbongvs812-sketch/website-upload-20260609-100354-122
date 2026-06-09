(() => {
  const mobileButton = document.querySelector('[data-mobile-menu-button]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (mobileButton && mobileMenu) {
    mobileButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  const prevButton = document.querySelector('[data-hero-prev]');
  const nextButton = document.querySelector('[data-hero-next]');
  let heroIndex = 0;
  let heroTimer = null;

  function setHeroSlide(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === heroIndex);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === heroIndex);
    });
  }

  function restartHeroTimer() {
    if (!slides.length) {
      return;
    }

    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(() => setHeroSlide(heroIndex + 1), 5200);
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      setHeroSlide(Number(dot.dataset.heroDot || 0));
      restartHeroTimer();
    });
  });

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      setHeroSlide(heroIndex - 1);
      restartHeroTimer();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      setHeroSlide(heroIndex + 1);
      restartHeroTimer();
    });
  }

  restartHeroTimer();

  const filterRoots = Array.from(document.querySelectorAll('[data-filter-root]'));

  filterRoots.forEach((root) => {
    const input = root.querySelector('[data-filter-input]');
    const select = root.querySelector('[data-filter-select]');
    const list = document.querySelector('[data-filter-list]');
    const count = document.querySelector('[data-filter-count]');

    if (!list) {
      return;
    }

    const cards = Array.from(list.querySelectorAll('.movie-card'));
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      const query = normalize(input ? input.value : '');
      const category = normalize(select ? select.value : '');
      let visible = 0;

      cards.forEach((card) => {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.tags,
          card.textContent,
        ].join(' '));
        const matchQuery = !query || haystack.includes(query);
        const matchCategory = !category || haystack.includes(category);
        const shouldShow = matchQuery && matchCategory;
        card.style.display = shouldShow ? '' : 'none';
        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = `当前显示 ${visible} 部内容`;
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (select) {
      select.addEventListener('change', applyFilter);
    }

    applyFilter();
  });

  const players = Array.from(document.querySelectorAll('[data-player]'));

  players.forEach((player) => {
    const video = player.querySelector('video[data-video-src]');
    const button = player.querySelector('[data-player-button]');

    if (!video || !button) {
      return;
    }

    let initialized = false;

    function initializePlayer() {
      if (initialized) {
        video.play().catch(() => undefined);
        return;
      }

      initialized = true;
      const source = video.dataset.videoSrc;

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => undefined);
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(() => undefined);
        }, { once: true });
      } else {
        video.src = source;
        video.play().catch(() => undefined);
      }
    }

    button.addEventListener('click', () => {
      button.classList.add('is-hidden');
      initializePlayer();
    });

    video.addEventListener('play', () => {
      button.classList.add('is-hidden');
    });
  });
})();
