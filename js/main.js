document.addEventListener('DOMContentLoaded', () => {
  const rollHoverSelectors = [
    '.activity-picker__link',
    '.build-kit-desktop__filter',
    '.journal-showcase__category > span:not(.journal-showcase__category-media)',
    '.journal-showcase__all > span',
    '.recommendations-new__more > span',
    '.store-showcase__map > span',
    '.footer-desktop__link',
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
    '.footer-desktop__legal',
  ];

  const revealItems = Array.from(document.querySelectorAll(revealSelectors.join(',')));
  const shouldAnimateTextReveal = window.matchMedia('(min-width: 1280px)').matches;

  if (shouldAnimateTextReveal && 'IntersectionObserver' in window && revealItems.length) {
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

  document.querySelectorAll('[data-input-field]').forEach(field => {
    const input = field.querySelector('input');
    const clear = field.querySelector('.login-bonus__clear');
    if (!input) return;

    const syncInputState = () => {
      const hasValue = input.value.trim().length > 0;
      const isFocused = document.activeElement === input;
      field.classList.toggle('has-value', hasValue && !input.disabled);
      field.classList.toggle('is-disabled', input.disabled);
      if (clear) clear.hidden = (!hasValue && !isFocused) || input.disabled;
    };

    input.addEventListener('input', syncInputState);
    input.addEventListener('change', syncInputState);
    input.addEventListener('focus', syncInputState);
    input.addEventListener('blur', () => {
      window.setTimeout(syncInputState, 0);
    });

    clear?.addEventListener('click', () => {
      input.value = '';
      field.classList.remove('is-error');
      input.focus();
      syncInputState();
    });

    syncInputState();
  });

  const heroHeader = document.querySelector('.hero');
  const heroTopbar = document.querySelector('.hero__topbar');
  const desktopHeaderQuery = window.matchMedia('(min-width: 1280px)');
  let headerTicking = false;

  const getReadableHeaderTheme = () => {
    if (!heroTopbar) return 'light';

    const sampleX = Math.round(window.innerWidth / 2);
    const topbarRect = heroTopbar.getBoundingClientRect();
    const sampleY = Math.round(topbarRect.top + topbarRect.height / 2);
    const elements = document.elementsFromPoint(sampleX, sampleY);
    const target = elements.find(element => !heroTopbar.contains(element));

    let node = target;
    while (node && node !== document.documentElement) {
      const background = window.getComputedStyle(node).backgroundColor;
      const match = background.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);

      if (match && (match[4] === undefined || Number(match[4]) > 0.1)) {
        const r = Number(match[1]) / 255;
        const g = Number(match[2]) / 255;
        const b = Number(match[3]) / 255;
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return luminance > 0.62 ? 'dark' : 'light';
      }

      node = node.parentElement;
    }

    return 'light';
  };

  const syncHeroHeaderState = () => {
    headerTicking = false;
    if (!heroHeader) return;

    const shouldCompact = desktopHeaderQuery.matches && window.scrollY > 2;
    heroHeader.classList.toggle('is-header-compact', shouldCompact);
    heroHeader.classList.toggle('is-header-dark', shouldCompact || getReadableHeaderTheme() === 'dark');
  };

  const requestHeroHeaderSync = () => {
    if (headerTicking) return;
    headerTicking = true;
    window.requestAnimationFrame(syncHeroHeaderState);
  };

  syncHeroHeaderState();
  window.addEventListener('scroll', requestHeroHeaderSync, { passive: true });
  window.addEventListener('resize', requestHeroHeaderSync);
  desktopHeaderQuery.addEventListener('change', syncHeroHeaderState);

  // ─── Hero slider ────────────────────────────────────────────────────────────
  const heroSlidesWrap = document.querySelector('.hero__slides');
  if (heroSlidesWrap) {
    const slides  = document.querySelectorAll('.hero__slide');
    const infos   = document.querySelectorAll('.hero__info');
    const dots    = document.querySelectorAll('.hero__pagination-dot');
    const heroArrows = Array.from(document.querySelectorAll('.hero__arrow'));
    const btnPrev = heroArrows.find(button => /предыдущий|назад/i.test(button.getAttribute('aria-label') || '')) || heroArrows[0];
    const btnNext = heroArrows.find(button => /следующий|вперед|вперёд/i.test(button.getAttribute('aria-label') || '')) || heroArrows[1];
    const hero = document.querySelector('.hero');
    const total   = Math.max(dots.length, slides.length);
    let current   = 0;

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

    function goTo(idx, force = false) {
      const next = (idx + total) % total;
      if (next === current && !force) {
        restartProgress();
        replayCurrentSlide();
        return;
      }

      dots[current]?.classList.remove('is-active', 'is-loading');
      infos[current % infos.length]?.classList.remove('is-active');

      current = next;
      heroSlidesWrap.style.transform = slides.length > 1
        ? `translateX(-${(current % slides.length) * 100}%)`
        : 'translateX(0)';

      dots[current]?.classList.add('is-active');
      infos[current % infos.length]?.classList.add('is-active');
      restartProgress();
      replayCurrentSlide();

      btnPrev?.classList.toggle('is-inactive', false);
      btnNext?.classList.toggle('is-inactive', false);
    }

    restartProgress();
    const autoplayTimer = window.setInterval(() => {
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

    function isCarouselLayout() {
      return window.innerWidth >= 768;
    }

    function cardWidth() {
      return cards[0]?.getBoundingClientRect().width || (isCarouselLayout() ? 360 : viewport.getBoundingClientRect().width / 4);
    }

    function setPosition(nextIndex, animate = true) {
      if (!isCarouselLayout()) {
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
      if (!isCarouselLayout() || isAnimating) return;
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

    let touchStartX = 0;

    viewport.addEventListener('touchstart', event => {
      touchStartX = event.touches[0].clientX;
    }, { passive: true });

    viewport.addEventListener('touchend', event => {
      const dx = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) < 50) return;
      goTo(dx < 0 ? index + 1 : index - 1);
    }, { passive: true });

    window.addEventListener('resize', () => setPosition(index, false));
    setPosition(index, false);
  });

  // ─── Activity picker ──────────────────────────────────────────────────────
  document.querySelectorAll('.activity-picker').forEach(section => {
    const links = section.querySelectorAll('[data-activity-link]');
    const preview = section.querySelector('.activity-picker__preview-img');
    const image = section.querySelector('.activity-picker__image-img');
    const cta = section.querySelector('.activity-picker__cta');

    if (!links.length) return;

    function setImage(img, src) {
      if (!img || !src) return;
      img.classList.remove('is-changing');
      void img.offsetWidth;
      img.classList.add('is-changing');
      img.src = src;
    }

    function activate(link) {
      links.forEach(item => {
        const isActive = item === link;
        item.classList.toggle('is-active', isActive);
        item.toggleAttribute('aria-current', isActive);
      });

      setImage(preview, link.dataset.preview);
      setImage(image, link.dataset.image);

      if (cta) cta.href = link.getAttribute('href') || cta.href;
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
    let index = total + initialOriginal;
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
    let lastLayoutMode = '';

    function isDesktop() {
      return window.innerWidth >= 1280;
    }

    function getLayoutMode() {
      if (window.innerWidth >= 1280) return 'desktop';
      if (window.innerWidth >= 768) return 'tablet';
      return 'mobile';
    }

    function getTrackGap() {
      const styles = window.getComputedStyle(track);
      return parseFloat(styles.columnGap || styles.gap) || 32;
    }

    function getCardMetric(name, fallback) {
      const styles = window.getComputedStyle(section);
      const value = parseFloat(styles.getPropertyValue(name));
      return Number.isFinite(value) && value > 0 ? value : fallback;
    }

    function getFinalCardCenter(activeIndex) {
      const gap = getTrackGap();
      const sideWidth = getCardMetric('--gift-card-side-width', cards[activeIndex]?.getBoundingClientRect().width || 0);
      const activeWidth = getCardMetric('--gift-card-active-width', sideWidth);

      let left = 0;
      for (let i = 0; i < activeIndex; i += 1) {
        left += sideWidth + gap;
      }

      return left + activeWidth / 2;
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
      setActive(nextIndex);
      track.style.transition = animate ? '' : 'none';

      const bodyWidth = body.getBoundingClientRect().width;
      const cardCenter = getFinalCardCenter(nextIndex);
      const offset = bodyWidth / 2 - cardCenter;
      track.style.transform = `translateX(${offset}px)`;

      if (!animate) {
        void track.offsetWidth;
        track.style.transition = '';
      }
    }

    function goTo(nextIndex) {
      if (isAnimating) return;
      isAnimating = true;
      index = nextIndex;
      centerActive(index);

      if (!isDesktop()) {
        window.setTimeout(() => {
          isAnimating = false;
        }, 760);
      }
    }

    track.addEventListener('transitionend', event => {
      if (event.target !== track || event.propertyName !== 'transform') return;

      if (index >= total * 2) {
        index -= total;
        section.classList.add('is-resetting');
        centerActive(index, false);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => section.classList.remove('is-resetting'));
        });
      }

      if (index < total) {
        index += total;
        section.classList.add('is-resetting');
        centerActive(index, false);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => section.classList.remove('is-resetting'));
        });
      }

      isAnimating = false;
    });

    btnPrev.addEventListener('click', () => goTo(index - 1));
    btnNext.addEventListener('click', () => goTo(index + 1));
    cards.forEach((card, cardIndex) => {
      card.addEventListener('click', event => {
        if (card.classList.contains('is-active')) return;

        event.preventDefault();

        const direction = cardIndex < index ? -1 : 1;
        goTo(index + direction);
      });
    });

    let touchStartX = 0;
    section.addEventListener('touchstart', event => {
      touchStartX = event.touches[0].clientX;
    }, { passive: true });

    section.addEventListener('touchend', event => {
      if (isDesktop()) return;
      const delta = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) < 45) return;
      goTo(index + (delta < 0 ? 1 : -1));
    }, { passive: true });

    let resizeFrame = 0;
    function refreshPosition() {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        const currentMode = getLayoutMode();
        const didChangeMode = currentMode !== lastLayoutMode;
        lastLayoutMode = currentMode;

        if (didChangeMode) {
          section.classList.add('is-resetting');
        }

        centerActive(index, false);
        window.requestAnimationFrame(() => {
          centerActive(index, false);
          section.classList.remove('is-resetting');
        });
      });
    }

    window.addEventListener('resize', refreshPosition);
    window.addEventListener('orientationchange', refreshPosition);
    window.addEventListener('load', refreshPosition);
    cards.forEach(card => {
      card.querySelectorAll('img').forEach(img => {
        img.addEventListener('load', refreshPosition, { once: true });
      });
    });
    lastLayoutMode = getLayoutMode();
    centerActive(index, false);
  });

  // ─── Build kit product carousel ──────────────────────────────────────────
  document.querySelectorAll('.build-kit-desktop').forEach(section => {
    const accordionToggle = section.querySelector('.build-kit-desktop__accordion-toggle');

    accordionToggle?.addEventListener('click', () => {
      const isOpen = section.classList.toggle('is-kit-open');
      accordionToggle.setAttribute('aria-expanded', String(isOpen));
      accordionToggle.setAttribute('aria-label', isOpen ? 'Свернуть комплект' : 'Раскрыть комплект');
    });

    const genderButtons = Array.from(section.querySelectorAll('.build-kit-desktop__gender-btn'));
    const filterButtons = Array.from(section.querySelectorAll('.build-kit-desktop__filter'));
    const previewTiles = Array.from(section.querySelectorAll('.build-kit-desktop__tile'));

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

    previewTiles.forEach(tile => {
      tile.addEventListener('click', () => {
        if (window.innerWidth >= 1280) return;
        previewTiles.forEach(item => item.classList.remove('is-active'));
        tile.classList.add('is-active');
        const product = getTileProduct(tile);
        updateSelectedJacket(product);
        syncJacketKitItem(product);
      });
    });

    const grid = section.querySelector('.build-kit-desktop__tiles');
    const tiles = previewTiles;
    const dotsContainer = section.querySelector('.build-kit-desktop__dots');
    const btnPrev = section.querySelector('.build-kit-desktop__arrow[aria-label="Назад"]');
    const btnNext = section.querySelector('.build-kit-desktop__arrow[aria-label="Вперед"]');
    const kitList = section.querySelector('.build-kit-desktop__kit-list');
    const kitCount = section.querySelector('.build-kit-desktop__kit-count');
    const totalPrice = section.querySelector('.build-kit-desktop__total-price');
    const productImage = section.querySelector('.build-kit-desktop__product-pic img');
    const productName = section.querySelector('.build-kit-desktop__product-name');
    const productPrice = section.querySelector('.build-kit-desktop__product-price');

    const perPage = 9;
    const pageWidth = 340;
    const desktopQuery = window.matchMedia('(min-width: 1280px)');
    let page = 0;
    let pages = 1;
    let isDesktopCarouselReady = false;
    let dots = [];

    function normalize(index) {
      return (index + pages) % pages;
    }

    function renderDots() {
      if (!dotsContainer) return;

      dotsContainer.innerHTML = '';
      for (let i = 0; i < pages; i += 1) {
        const dot = document.createElement('span');
        dot.className = 'build-kit-desktop__dot';
        if (i === page) dot.classList.add('is-active');
        dot.addEventListener('click', () => updatePage(i));
        dotsContainer.appendChild(dot);
      }
      dots = Array.from(dotsContainer.querySelectorAll('.build-kit-desktop__dot'));
    }

    function updateControls() {
      const isSinglePage = pages <= 1;
      [btnPrev, btnNext].forEach(button => {
        if (!button) return;
        button.classList.toggle('is-inactive', isSinglePage);
        button.toggleAttribute('disabled', isSinglePage);
        button.setAttribute('aria-disabled', String(isSinglePage));
      });
    }

    function updatePage(nextPage) {
      if (!grid || !isDesktopCarouselReady) return;

      page = normalize(nextPage);
      grid.style.transform = `translateX(-${page * pageWidth}px)`;

      dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === page);
      });
    }

    function destroyDesktopCarousel() {
      if (!grid || !isDesktopCarouselReady) return;

      grid.style.transform = '';
      tiles.forEach(tile => {
        tile.hidden = false;
        grid.appendChild(tile);
      });
      grid.querySelectorAll('.build-kit-desktop__page').forEach(pageEl => pageEl.remove());
      isDesktopCarouselReady = false;
      page = 0;
    }

    function initDesktopCarousel() {
      if (!grid || !tiles.length || isDesktopCarouselReady) return;

      pages = Math.max(1, Math.ceil(tiles.length / perPage));
      page = Math.min(page, pages - 1);

      for (let i = 0; i < pages; i += 1) {
        const pageEl = document.createElement('div');
        pageEl.className = 'build-kit-desktop__page';
        tiles.slice(i * perPage, (i + 1) * perPage).forEach(tile => {
          pageEl.appendChild(tile);
          tile.hidden = false;
        });
        grid.appendChild(pageEl);
      }

      isDesktopCarouselReady = true;
      renderDots();
      updateControls();
      updatePage(page);
    }

    function syncDesktopCarousel() {
      if (desktopQuery.matches) {
        initDesktopCarousel();
      } else {
        destroyDesktopCarousel();
      }
    }

    function parsePrice(value) {
      return Number(String(value).replace(/[^\d]/g, '')) || 0;
    }

    function formatPrice(value) {
      return `${Math.max(0, value).toLocaleString('ru-RU')} ₽`;
    }

    // Данные товара читаются из data-атрибутов тайла (подставляет Bitrix).
    // data-name — NAME товара, data-price — CATALOG_PRICE_1, data-size — "true" если есть выбор размера.
    function getTileProduct(tile) {
      const img = tile.querySelector('img');
      const src = img?.getAttribute('src') || '';

      return {
        name:  tile.dataset.name  || '',
        price: tile.dataset.price || '',
        size:  tile.dataset.size !== 'false',
        img:   src,
      };
    }

    const activeTile = tiles.find(t => t.classList.contains('is-active')) || tiles[0];
    let selectedJacket = activeTile ? getTileProduct(activeTile) : {
      name: productName?.textContent?.trim() || '',
      price: productPrice?.textContent?.trim() || '',
      img: productImage?.getAttribute('src') || '',
      size: true,
    };

    function updateSelectedJacket(product) {
      selectedJacket = product;

      if (productImage) {
        productImage.setAttribute('src', product.img);
        productImage.setAttribute('srcset', `${product.img} 1x`);
        productImage.setAttribute('alt', product.name);
      }

      if (productName) {
        productName.textContent = product.name;
      }

      if (productPrice) {
        productPrice.textContent = product.price;
      }

      updateKitSummary();
    }

    function getKitItems() {
      return Array.from(section.querySelectorAll('.build-kit-desktop__kit-item:not(.build-kit-desktop__kit-item--empty)'));
    }

    const initialItemsTotal = getKitItems().reduce((sum, item) => {
      return sum + parsePrice(item.querySelector('.build-kit-desktop__kit-price')?.textContent);
    }, 0);
    const initialSelectedJacketTotal = parsePrice(selectedJacket.price);
    const initialDisplayedTotal = parsePrice(totalPrice?.textContent);
    const totalCorrection = initialDisplayedTotal ? initialDisplayedTotal - initialItemsTotal - initialSelectedJacketTotal : 0;

    function updateKitSummary() {
      const items = getKitItems();
      const itemsTotal = items.reduce((sum, item) => {
        return sum + parsePrice(item.querySelector('.build-kit-desktop__kit-price')?.textContent);
      }, 0);
      const hasJacketInList = Boolean(section.querySelector('.build-kit-desktop__kit-item[data-kit-type="jacket"]'));
      const selectedTotal = selectedJacket && !hasJacketInList ? parsePrice(selectedJacket.price) : 0;
      const selectedCount = selectedJacket && !hasJacketInList ? 1 : 0;
      const correctedTotal = items.length || selectedCount ? itemsTotal + selectedTotal + totalCorrection : 0;

      if (kitCount) {
        kitCount.textContent = `${Math.min(items.length + selectedCount, 4)}/4`;
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

    function createKitItem(product, type = '') {
      const article = document.createElement('article');
      article.className = 'build-kit-desktop__kit-item';
      if (type) {
        article.dataset.kitType = type;
      }
      article.innerHTML = `
        <img class="build-kit-desktop__kit-img" src="${product.img}" srcset="${product.img} 1x" sizes="100vw" alt="" loading="lazy">
        <div class="build-kit-desktop__kit-content">
          <div class="build-kit-desktop__kit-top">
            <h3 class="build-kit-desktop__kit-name">${product.name}</h3>
            <button class="build-kit-desktop__remove" type="button" aria-label="Удалить"></button>
          </div>
          <div class="build-kit-desktop__kit-bottom">
            <span class="build-kit-desktop__kit-price">${product.price}</span>
            ${product.size ? `
              <label class="build-kit-desktop__size" aria-label="Размер">
                <select class="build-kit-desktop__size-select">
                  <option selected>XL</option>
                  <option>L</option>
                  <option>M</option>
                </select>
              </label>
            ` : ''}
          </div>
        </div>
      `;
      return article;
    }

    function syncJacketKitItem(product = selectedJacket) {
      const currentJacket = section.querySelector('.build-kit-desktop__kit-item[data-kit-type="jacket"]');

      if (desktopQuery.matches) {
        currentJacket?.remove();
        updateKitSummary();
        return;
      }

      const jacketItem = createKitItem(product, 'jacket');

      if (currentJacket) {
        currentJacket.replaceWith(jacketItem);
      } else {
        const firstItem = kitList?.querySelector('.build-kit-desktop__kit-item');
        if (firstItem) {
          firstItem.after(jacketItem);
        } else {
          kitList?.prepend(jacketItem);
        }
      }

      updateKitSummary();
    }

    function addProductToKit(product) {
      const emptySlot = section.querySelector('.build-kit-desktop__kit-item--empty');
      const items = getKitItems();

      if (emptySlot) {
        emptySlot.replaceWith(createKitItem(product));
      } else if (items.length) {
        items[items.length - 1].replaceWith(createKitItem(product));
      }

      updateKitSummary();
    }

    tiles.forEach(tile => {
      tile.addEventListener('click', () => {
        if (!desktopQuery.matches) return;
        tiles.forEach(item => item.classList.remove('is-active'));
        tile.classList.add('is-active');
        updateSelectedJacket(getTileProduct(tile));
      });
    });

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

    btnPrev?.addEventListener('click', () => updatePage(page - 1));
    btnNext?.addEventListener('click', () => updatePage(page + 1));
    desktopQuery.addEventListener('change', () => {
      syncDesktopCarousel();
      syncJacketKitItem();
    });
    syncDesktopCarousel();
    syncJacketKitItem();
  });


});
