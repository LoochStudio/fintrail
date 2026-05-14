document.addEventListener('DOMContentLoaded', () => {
  // Активный пункт таббара по текущему URL
  const tabItems = document.querySelectorAll('.tabbar__item');
  tabItems.forEach(item => {
    if (item.getAttribute('href') === window.location.pathname) {
      item.classList.add('is-active');
    }
  });

  // Активная ссылка десктопного навбара по текущему URL
  const navLinks = document.querySelectorAll('.navbar__nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && window.location.pathname.startsWith(href)) {
      link.classList.add('is-active');
    }
  });

  // CSS-переменные высот навбара и таббара — нужны для правильных отступов
  const navbar = document.querySelector('.navbar');
  const tabbar = document.querySelector('.tabbar');

  const updateLayoutVars = () => {
    if (navbar) document.documentElement.style.setProperty('--navbar-height', navbar.offsetHeight + 'px');
    if (tabbar) document.documentElement.style.setProperty('--tabbar-height', tabbar.offsetHeight + 'px');
  };

  updateLayoutVars();
  window.addEventListener('resize', updateLayoutVars);

  // ─── Hero slider ────────────────────────────────────────────────────────────
  const heroSlidesWrap = document.querySelector('.hero__slides');
  if (heroSlidesWrap) {
    const slides  = document.querySelectorAll('.hero__slide');
    const infos   = document.querySelectorAll('.hero__info');
    const dots    = document.querySelectorAll('.hero__pagination-dot');
    const btnPrev = document.querySelector('.hero__arrow[aria-label="Предыдущий слайд"]');
    const btnNext = document.querySelector('.hero__arrow[aria-label="Следующий слайд"]');
    const total   = Math.max(slides.length, dots.length);
    let current   = 0;
    const activeDotIcon = '/images/icons/sprite.svg#icon-hero-pagination-active';
    const defaultDotIcon = '/images/icons/sprite.svg#icon-hero-pagination-dot';

    function restartProgress() {
      const activeDot = dots[current];
      if (!activeDot) return;

      activeDot.classList.remove('is-loading');
      void activeDot.offsetWidth;
      activeDot.classList.add('is-loading');
    }

    function setDotIcon(dot, icon) {
      dot?.querySelector('use')?.setAttribute('href', icon);
    }

    function goTo(idx, force = false) {
      const next = (idx + total) % total;
      if (next === current && !force) {
        restartProgress();
        return;
      }

      setDotIcon(dots[current], defaultDotIcon);
      dots[current]?.classList.remove('is-active', 'is-loading');
      infos[current % infos.length]?.classList.remove('is-active');

      current = next;
      heroSlidesWrap.style.transform = `translateX(-${(current % slides.length) * 100}%)`;

      setDotIcon(dots[current], activeDotIcon);
      dots[current]?.classList.add('is-active');
      infos[current % infos.length]?.classList.add('is-active');
      restartProgress();

      btnPrev?.classList.toggle('is-inactive', false);
      btnNext?.classList.toggle('is-inactive', false);
    }

    restartProgress();
    window.setInterval(() => {
      goTo(current + 1, true);
    }, 5000);

    btnPrev?.addEventListener('click', () => goTo(current - 1));
    btnNext?.addEventListener('click', () => goTo(current + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    // Свайп на мобайле
    const hero = document.querySelector('.hero');
    let touchStartX = 0;

    hero?.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    hero?.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) < 50) return;
      goTo(dx < 0 ? current + 1 : current - 1);
    }, { passive: true });
  }

  // ─── Recommendations carousel ─────────────────────────────────────────────
  document.querySelectorAll('.recommendations-new').forEach(section => {
    const viewport = section.querySelector('.recommendations-new__viewport');
    const track = section.querySelector('.recommendations-new__track');
    const btnPrev = section.querySelector('.recommendations-new__arrow[aria-label="Назад"]');
    const btnNext = section.querySelector('.recommendations-new__arrow[aria-label="Вперед"]');
    const originals = Array.from(section.querySelectorAll('.recommendation-card'));

    if (!viewport || !track || !btnPrev || !btnNext || originals.length <= 1) return;

    const total = originals.length;
    let index = total;
    let isAnimating = false;

    function cloneCard(card) {
      const clone = card.cloneNode(true);
      clone.dataset.carouselClone = 'true';
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('a, button, [tabindex]').forEach(el => {
        el.setAttribute('tabindex', '-1');
      });
      return clone;
    }

    const before = originals.map(cloneCard);
    const after = originals.map(cloneCard);
    before.forEach(card => track.insertBefore(card, track.firstChild));
    after.forEach(card => track.appendChild(card));

    const cards = Array.from(track.querySelectorAll('.recommendation-card'));

    btnPrev.classList.remove('is-inactive');
    btnNext.classList.remove('is-inactive');

    function isDesktop() {
      return window.innerWidth >= 1280;
    }

    function cardWidth() {
      return cards[0]?.getBoundingClientRect().width || viewport.getBoundingClientRect().width / 4;
    }

    function setPosition(nextIndex, animate = true) {
      if (!isDesktop()) {
        track.style.transform = '';
        return;
      }

      track.style.transition = animate ? '' : 'none';
      track.style.transform = `translateX(-${nextIndex * cardWidth()}px)`;

      if (!animate) {
        void track.offsetWidth;
        track.style.transition = '';
      }
    }

    function goTo(nextIndex) {
      if (!isDesktop() || isAnimating) return;
      isAnimating = true;
      index = nextIndex;
      setPosition(index);
    }

    track.addEventListener('transitionend', event => {
      if (event.propertyName !== 'transform') return;

      if (index >= total * 2) {
        index -= total;
        setPosition(index, false);
      }

      if (index < total) {
        index += total;
        setPosition(index, false);
      }

      isAnimating = false;
    });

    btnPrev.addEventListener('click', () => goTo(index - 1));
    btnNext.addEventListener('click', () => goTo(index + 1));

    window.addEventListener('resize', () => setPosition(index, false));
    setPosition(index, false);
  });

  // ─── Activity picker ──────────────────────────────────────────────────────
  document.querySelectorAll('.activity-picker').forEach(section => {
    const links = section.querySelectorAll('[data-activity-link]');
    const preview = section.querySelector('.activity-picker__preview-img');
    const image = section.querySelector('.activity-picker__image-img');

    if (!links.length) return;

    function activate(link) {
      links.forEach(item => item.classList.toggle('is-active', item === link));

      if (preview && link.dataset.preview) {
        preview.setAttribute('src', link.dataset.preview);
      }

      if (image && link.dataset.image) {
        image.setAttribute('src', link.dataset.image);
      }
    }

    links.forEach(link => {
      link.addEventListener('mouseenter', () => activate(link));
      link.addEventListener('focus', () => activate(link));
    });
  });

  // ─── Gift cards carousel ─────────────────────────────────────────────────
  document.querySelectorAll('.gift-cards-showcase').forEach(section => {
    const body = section.querySelector('.gift-cards-showcase__body');
    const track = section.querySelector('.gift-cards-showcase__track');
    const btnPrev = section.querySelector('.gift-cards-showcase__arrow[aria-label="Назад"]');
    const btnNext = section.querySelector('.gift-cards-showcase__arrow[aria-label="Вперед"]');
    const originals = Array.from(section.querySelectorAll('.gift-cards-showcase__card'));

    if (!body || !track || !btnPrev || !btnNext || originals.length <= 1) return;

    const total = originals.length;
    const initialOriginal = Math.max(0, originals.findIndex(card => card.classList.contains('is-active')));
    let index = total + (initialOriginal === -1 ? 0 : initialOriginal);
    let isAnimating = false;

    function cloneCard(card) {
      const clone = card.cloneNode(true);
      clone.classList.remove('is-active');
      clone.dataset.carouselClone = 'true';
      clone.setAttribute('aria-hidden', 'true');
      if (clone.matches('a, button, [tabindex]')) {
        clone.setAttribute('tabindex', '-1');
      }
      clone.querySelectorAll('a, button, [tabindex]').forEach(el => {
        el.setAttribute('tabindex', '-1');
      });
      return clone;
    }

    originals.forEach(card => card.classList.remove('is-active'));
    originals.map(cloneCard).reverse().forEach(card => track.insertBefore(card, track.firstChild));
    originals.map(cloneCard).forEach(card => track.appendChild(card));

    const cards = Array.from(track.querySelectorAll('.gift-cards-showcase__card'));

    function isDesktop() {
      return window.innerWidth >= 1280;
    }

    function setActive(nextIndex) {
      cards.forEach((card, i) => {
        const isActive = i === nextIndex;
        card.classList.toggle('is-active', isActive);
        card.setAttribute('aria-hidden', card.dataset.carouselClone === 'true' ? 'true' : 'false');
        card.tabIndex = isActive && card.dataset.carouselClone !== 'true' ? 0 : -1;
      });
    }

    function centerActive(nextIndex, animate = true) {
      if (!isDesktop()) {
        track.style.transform = '';
        return;
      }

      setActive(nextIndex);
      track.style.transition = animate ? '' : 'none';

      const activeCard = cards[nextIndex];
      const bodyWidth = body.getBoundingClientRect().width;
      const cardCenter = activeCard.offsetLeft + activeCard.offsetWidth / 2;
      const offset = bodyWidth / 2 - cardCenter;
      track.style.transform = `translateX(${offset}px)`;

      if (!animate) {
        void track.offsetWidth;
        track.style.transition = '';
      }
    }

    function goTo(nextIndex) {
      if (!isDesktop() || isAnimating) return;
      isAnimating = true;
      index = nextIndex;
      centerActive(index);
    }

    track.addEventListener('transitionend', event => {
      if (event.target !== track || event.propertyName !== 'transform') return;

      if (index >= total * 2) {
        index -= total;
        centerActive(index, false);
      }

      if (index < total) {
        index += total;
        centerActive(index, false);
      }

      isAnimating = false;
    });

    btnPrev.addEventListener('click', () => goTo(index - 1));
    btnNext.addEventListener('click', () => goTo(index + 1));

    window.addEventListener('resize', () => centerActive(index, false));
    centerActive(index, false);
  });

  // ─── Build kit product carousel ──────────────────────────────────────────
  document.querySelectorAll('.build-kit-desktop').forEach(section => {
    const grid = section.querySelector('.build-kit-desktop__tiles');
    const tiles = Array.from(section.querySelectorAll('.build-kit-desktop__tile'));
    const dots = Array.from(section.querySelectorAll('.build-kit-desktop__dot'));
    const btnPrev = section.querySelector('.build-kit-desktop__arrow[aria-label="Назад"]');
    const btnNext = section.querySelector('.build-kit-desktop__arrow[aria-label="Вперед"]');
    const genderButtons = Array.from(section.querySelectorAll('.build-kit-desktop__gender-btn'));
    const filterButtons = Array.from(section.querySelectorAll('.build-kit-desktop__filter'));
    const kitList = section.querySelector('.build-kit-desktop__kit-list');
    const kitCount = section.querySelector('.build-kit-desktop__kit-count');
    const totalPrice = section.querySelector('.build-kit-desktop__total-price');

    if (!grid || !tiles.length || !btnPrev || !btnNext) return;

    const perPage = 9;
    const pages = Math.max(1, Math.ceil(tiles.length / perPage), dots.length);
    const pageWidth = 340;
    let page = 0;

    for (let i = 0; i < pages; i += 1) {
      const pageEl = document.createElement('div');
      pageEl.className = 'build-kit-desktop__page';
      tiles.slice(i * perPage, (i + 1) * perPage).forEach(tile => {
        pageEl.appendChild(tile);
        tile.hidden = false;
      });
      grid.appendChild(pageEl);
    }

    function normalize(index) {
      return (index + pages) % pages;
    }

    function updatePage(nextPage) {
      page = normalize(nextPage);
      grid.style.transform = `translateX(-${page * pageWidth}px)`;

      dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === page);
      });
    }

    tiles.forEach(tile => {
      tile.addEventListener('click', () => {
        tiles.forEach(item => item.classList.remove('is-active'));
        tile.classList.add('is-active');
      });
    });

    genderButtons.forEach(button => {
      button.addEventListener('click', () => {
        genderButtons.forEach(item => {
          const isActive = item === button;
          item.classList.toggle('is-active', isActive);
          item.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
      });
    });

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const row = button.closest('.build-kit-desktop__filter-row');
        row?.querySelectorAll('.build-kit-desktop__filter').forEach(item => item.classList.remove('is-active'));
        button.classList.add('is-active');
      });
    });

    function parsePrice(value) {
      return Number(String(value).replace(/[^\d]/g, '')) || 0;
    }

    function formatPrice(value) {
      return `${Math.max(0, value).toLocaleString('ru-RU')} ₽`;
    }

    function getKitItems() {
      return Array.from(section.querySelectorAll('.build-kit-desktop__kit-item:not(.build-kit-desktop__kit-item--empty)'));
    }

    const initialItemsTotal = getKitItems().reduce((sum, item) => {
      return sum + parsePrice(item.querySelector('.build-kit-desktop__kit-price')?.textContent);
    }, 0);
    const initialDisplayedTotal = parsePrice(totalPrice?.textContent);
    const totalCorrection = initialDisplayedTotal ? initialDisplayedTotal - initialItemsTotal : 0;

    function updateKitSummary() {
      const items = getKitItems();
      const itemsTotal = items.reduce((sum, item) => {
        return sum + parsePrice(item.querySelector('.build-kit-desktop__kit-price')?.textContent);
      }, 0);
      const correctedTotal = items.length ? itemsTotal + totalCorrection : 0;

      if (kitCount) {
        kitCount.textContent = `Товары,${items.length}`;
      }

      if (totalPrice) {
        totalPrice.textContent = formatPrice(correctedTotal);
      }
    }

    function createEmptyKitSlot(label = 'Добавить товар') {
      const button = document.createElement('button');
      button.className = 'build-kit-desktop__kit-item build-kit-desktop__kit-item--empty';
      button.type = 'button';
      button.innerHTML = `<span>${label}</span>`;
      return button;
    }

    kitList?.addEventListener('click', event => {
      const removeButton = event.target.closest('.build-kit-desktop__remove');
      if (!removeButton) return;

      const item = removeButton.closest('.build-kit-desktop__kit-item');
      const title = item?.querySelector('.build-kit-desktop__kit-name')?.textContent || '';
      const fallbackLabel = title.toLowerCase().includes('брюки') ? 'Добавить штаны'
        : title.toLowerCase().includes('куртка') ? 'Добавить куртку'
          : title.toLowerCase().includes('шапка') ? 'Добавить шапку'
            : 'Добавить товар';

      item?.replaceWith(createEmptyKitSlot(fallbackLabel));
      updateKitSummary();
    });

    btnPrev.addEventListener('click', () => updatePage(page - 1));
    btnNext.addEventListener('click', () => updatePage(page + 1));
    dots.forEach((dot, index) => dot.addEventListener('click', () => updatePage(index)));

    updatePage(0);
  });


});
