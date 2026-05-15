document.addEventListener('DOMContentLoaded', () => {
  const rollHoverSelectors = [
    '.activity-picker__link',
    '.build-kit-desktop__gender-btn',
    '.build-kit-desktop__filter',
    '.build-kit-desktop__submit > span',
    '.journal-showcase__category > span:not(.journal-showcase__category-media)',
    '.journal-showcase__all > span',
    '.recommendations-new__more > span',
    '.store-showcase__map > span',
    '.footer-desktop__link',
    '.footer-desktop__legal a',
  ];

  document.querySelectorAll(rollHoverSelectors.join(',')).forEach(element => {
    const text = element.textContent.trim().replace(/\s+/g, ' ');
    if (!text) return;

    element.classList.add('roll-hover-text');
    element.dataset.hoverText = element.dataset.hoverText || text;
    element.setAttribute('aria-label', text);
  });

  const revealSelectors = [
    '.hero__title',
    '.hero__desc',
    '.login-bonus__title',
    '.login-bonus__desc',
    '.login-bonus__form',
    '.login-bonus__providers',
    '.recommendations-new__title',
    '.recommendations-new__more',
    '.activity-picker__title',
    '.activity-picker__link',
    '.gift-cards-showcase__title',
    '.build-kit-desktop__title',
    '.build-kit-desktop__gender',
    '.build-kit-desktop__filters',
    '.build-kit-desktop__kit-meta',
    '.build-kit-desktop__summary',
    '.journal-showcase__title',
    '.journal-showcase__category',
    '.journal-showcase__all',
    '.store-showcase__title',
    '.store-showcase__description',
    '.store-showcase__row',
    '.store-showcase__map',
    '.community-showcase__title',
    '.community-showcase__description',
    '.community-showcase__name',
    '.community-showcase__stats',
    '.footer-desktop__column',
    '.footer-desktop__socials',
    '.footer-desktop__credits',
    '.footer-desktop__legal',
  ];

  const revealItems = Array.from(document.querySelectorAll(revealSelectors.join(',')));

  if ('IntersectionObserver' in window && revealItems.length) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.18,
      rootMargin: '0px 0px -8% 0px',
    });

    const sectionCounters = new WeakMap();

    revealItems.forEach(element => {
      const section = element.closest('section, footer') || document.body;
      const index = sectionCounters.get(section) || 0;
      sectionCounters.set(section, index + 1);

      element.classList.add('text-reveal');
      element.style.setProperty('--reveal-delay', `${Math.min(index * 70, 420)}ms`);
      revealObserver.observe(element);
    });
  } else {
    revealItems.forEach(element => element.classList.add('is-visible'));
  }

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
    const hero = document.querySelector('.hero');
    const total   = Math.max(dots.length, slides.length);
    let current   = 0;
    const activeDotIcon = dots[0]?.querySelector('use')?.getAttribute('href') || '';
    const defaultDotIcon = dots[1]?.querySelector('use')?.getAttribute('href')
      || dots[0]?.querySelector('use')?.getAttribute('href')
      || '';

    function replayCurrentSlide() {
      if (slides.length !== 1 || !hero) return;

      hero.classList.remove('is-replaying');
      void hero.offsetWidth;
      hero.classList.add('is-replaying');
    }

    function restartProgress() {
      const activeDot = dots[current];
      if (!activeDot) return;

      activeDot.classList.remove('is-loading');
      void activeDot.offsetWidth;
      activeDot.classList.add('is-loading');
    }

    function setDotIcon(dot, icon) {
      if (!icon) return;
      dot?.querySelector('use')?.setAttribute('href', icon);
    }

    function goTo(idx, force = false) {
      const next = (idx + total) % total;
      if (next === current && !force) {
        restartProgress();
        replayCurrentSlide();
        return;
      }

      setDotIcon(dots[current], defaultDotIcon);
      dots[current]?.classList.remove('is-active', 'is-loading');
      infos[current % infos.length]?.classList.remove('is-active');

      current = next;
      heroSlidesWrap.style.transform = slides.length > 1
        ? `translateX(-${(current % slides.length) * 100}%)`
        : 'translateX(0)';

      setDotIcon(dots[current], activeDotIcon);
      dots[current]?.classList.add('is-active');
      infos[current % infos.length]?.classList.add('is-active');
      restartProgress();
      replayCurrentSlide();

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

    const initialPreview = preview?.currentSrc || preview?.getAttribute('src') || '';
    const initialImage = image?.currentSrc || image?.getAttribute('src') || '';
    const resolvedAssets = new Map([
      ['/images/content/activity/ski-preview.png', initialPreview],
      ['images/content/activity/ski-preview.png', initialPreview],
      ['/images/content/activity/ski-main.png', initialImage],
      ['images/content/activity/ski-main.png', initialImage],
    ]);

    function resolveAsset(src) {
      if (!src) return '';
      if (resolvedAssets.has(src)) return resolvedAssets.get(src);
      return src;
    }

    function setImage(img, src) {
      const resolvedSrc = resolveAsset(src);
      if (!img || !resolvedSrc) return;

      img.classList.remove('is-changing');
      void img.offsetWidth;
      img.classList.add('is-changing');
      img.setAttribute('src', resolvedSrc);
      img.setAttribute('srcset', `${resolvedSrc} 1x`);
    }

    function activate(link) {
      links.forEach(item => {
        const isActive = item === link;
        item.classList.toggle('is-active', isActive);
        item.toggleAttribute('aria-current', isActive);
      });

      setImage(preview, link.dataset.preview);
      setImage(image, link.dataset.image);
    }

    links.forEach(link => {
      link.addEventListener('mouseenter', () => activate(link));
      link.addEventListener('focus', () => activate(link));
      link.addEventListener('click', event => {
        event.preventDefault();
        activate(link);
      });
    });

    activate(section.querySelector('[data-activity-link].is-active') || links[0]);
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
        section.classList.add('is-resetting');
        centerActive(index, false);
        requestAnimationFrame(() => section.classList.remove('is-resetting'));
      }

      if (index < total) {
        index += total;
        section.classList.add('is-resetting');
        centerActive(index, false);
        requestAnimationFrame(() => section.classList.remove('is-resetting'));
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
