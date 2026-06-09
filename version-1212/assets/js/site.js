const menuButton = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");

if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () => {
        mobileNav.classList.toggle("open");
    });
}

const hero = document.querySelector("[data-hero]");

if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let current = 0;

    const showSlide = (index) => {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("active", slideIndex === current);
        });

        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("active", dotIndex === current);
        });
    };

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            showSlide(Number(dot.dataset.heroDot || 0));
        });
    });

    setInterval(() => {
        showSlide(current + 1);
    }, 5200);
}

const panels = Array.from(document.querySelectorAll("[data-filter-panel]"));

panels.forEach((panel) => {
    const root = panel.closest("section") || document;
    const cards = Array.from(root.querySelectorAll("[data-card]"));
    const searchInput = panel.querySelector("[data-search-input]");
    const categorySelect = panel.querySelector("[data-filter-category]");
    const regionSelect = panel.querySelector("[data-filter-region]");
    const typeSelect = panel.querySelector("[data-filter-type]");
    const yearSelect = panel.querySelector("[data-filter-year]");
    const emptyState = root.querySelector("[data-empty-state]");
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");

    if (q && searchInput) {
        searchInput.value = q;
    }

    const applyFilter = () => {
        const query = (searchInput?.value || "").trim().toLowerCase();
        const category = categorySelect?.value || "";
        const region = regionSelect?.value || "";
        const type = typeSelect?.value || "";
        const year = Number(yearSelect?.value || 0);
        let visibleCount = 0;

        cards.forEach((card) => {
            const text = card.dataset.search || "";
            const cardYear = Number(card.dataset.year || 0);
            const matched = (!query || text.includes(query))
                && (!category || card.dataset.category === category)
                && (!region || card.dataset.region === region)
                && (!type || card.dataset.type === type)
                && (!year || cardYear >= year);

            card.style.display = matched ? "" : "none";

            if (matched) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("show", visibleCount === 0);
        }
    };

    [searchInput, categorySelect, regionSelect, typeSelect, yearSelect].forEach((element) => {
        if (element) {
            element.addEventListener("input", applyFilter);
            element.addEventListener("change", applyFilter);
        }
    });

    applyFilter();
});
