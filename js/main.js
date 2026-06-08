const appBasePath = import.meta.env.BASE_URL || '/';

function resolvePublicAsset(src) {
  if (!src || /^(?:https?:|data:|blob:)/.test(src)) return src;
  if (src.startsWith(appBasePath) || src.startsWith('./') || src.startsWith('../')) return src;
  if (src.startsWith('/images/')) return `${appBasePath}${src.slice(1)}`;
  if (src.startsWith('images/')) return `${appBasePath}${src}`;
  return src;
}

const responsiveImageWidths = {
  "/images/content/activity/fishing-main-framed.png": 540,
  "/images/content/activity/fishing-product-1.png": 1000,
  "/images/content/activity/fishing-product-2.png": 1000,
  "/images/content/activity/quad-main-framed.png": 540,
  "/images/content/activity/quad-product-1.png": 1000,
  "/images/content/activity/quad-product-2.png": 1000,
  "/images/content/activity/ski-main.png": 1035,
  "/images/content/activity/ski-product-1.png": 1000,
  "/images/content/activity/ski-product-2.png": 1000,
  "/images/content/activity/snowmobile-main-framed.png": 540,
  "/images/content/activity/snowmobile-product-1.png": 1000,
  "/images/content/activity/snowmobile-product-2.png": 1000,
  "/images/content/activity/tourism-main-framed.png": 540,
  "/images/content/activity/tourism-main.png": 987,
  "/images/content/activity/tourism-product-1.png": 1000,
  "/images/content/activity/tourism-product-2.png": 1000,
  "/images/content/activity/travel-main-framed.png": 540,
  "/images/content/activity/travel-product-1.png": 1000,
  "/images/content/activity/travel-product-2.png": 1000,
  "/images/content/build-kit/hat-1.png": 1000,
  "/images/content/build-kit/hat-2.png": 1000,
  "/images/content/build-kit/hat-3.png": 1000,
  "/images/content/build-kit/hat-4.png": 1000,
  "/images/content/build-kit/hat-6.png": 1000,
  "/images/content/build-kit/hat-7.png": 1000,
  "/images/content/build-kit/hat-8.png": 1000,
  "/images/content/build-kit/hat-9.png": 1000,
  "/images/content/build-kit/hat.png": 1000,
  "/images/content/build-kit/item-2.png": 1000,
  "/images/content/build-kit/item-3.png": 1000,
  "/images/content/build-kit/item-4.png": 1000,
  "/images/content/build-kit/item-5.png": 1000,
  "/images/content/build-kit/item-6.png": 1000,
  "/images/content/build-kit/item-7.png": 1000,
  "/images/content/build-kit/item-8.png": 1000,
  "/images/content/build-kit/item-9.png": 1000,
  "/images/content/build-kit/jacket.png": 1000,
  "/images/content/build-kit/model-female.png": 896,
  "/images/content/build-kit/model.png": 1888,
  "/images/content/build-kit/pants-1.png": 1000,
  "/images/content/build-kit/pants-2.png": 440,
  "/images/content/build-kit/pants-3.png": 1000,
  "/images/content/build-kit/pants-4.png": 1000,
  "/images/content/build-kit/pants-5.png": 1000,
  "/images/content/build-kit/pants-6.png": 1000,
  "/images/content/build-kit/pants-7.png": 1000,
  "/images/content/build-kit/pants-8.png": 1000,
  "/images/content/build-kit/pants-9.png": 1000,
  "/images/content/build-kit/pants.png": 1000,
  "/images/content/build-kit/shoes-1.png": 1000,
  "/images/content/build-kit/shoes-2.png": 1000,
  "/images/content/build-kit/shoes-3.png": 1000,
  "/images/content/build-kit/shoes-4.png": 1000,
  "/images/content/build-kit/shoes-5.png": 1000,
  "/images/content/build-kit/shoes-6.png": 1000,
  "/images/content/build-kit/shoes-7.png": 1000,
  "/images/content/build-kit/shoes-8.png": 1000,
  "/images/content/build-kit/shoes-9.png": 1000,
  "/images/content/community-showcase/fishing.png": 987,
  "/images/content/community-showcase/offroad.png": 848,
  "/images/content/community-showcase/tourism.png": 1094,
  "/images/content/gift-cards-showcase/card-main.png": 2880,
  "/images/content/gift-cards-showcase/card-side-left.png": 1200,
  "/images/content/gift-cards-showcase/card-side-right.png": 4096,
  "/images/content/gift-cards-showcase/mountains.png": 4096,
  "/images/content/hero/hero-product-jacket.png": 1000,
  "/images/content/hero/hero-product-pants.png": 1000,
  "/images/content/hero/hero-slide-outdoor.png": 2752,
  "/images/content/journal/cat-fishing.png": 714,
  "/images/content/journal/cat-quad.png": 546,
  "/images/content/journal/cat-ski.png": 526,
  "/images/content/journal/cat-snowmobile.png": 444,
  "/images/content/journal/cat-tourism.png": 541,
  "/images/content/journal/cat-travel.png": 567,
  "/images/content/journal/hero-tent.png": 1024,
  "/images/content/journal/snowmobile.png": 910,
  "/images/content/journal/stories-frame-main.png": 405,
  "/images/content/journal/stories-frame-side.png": 202,
  "/images/content/journal/trekking.png": 1024,
  "/images/content/placeholder.png": 60,
  "/images/content/recommended/recommended-1.png": 780,
  "/images/content/recommended/recommended-2.png": 442,
  "/images/content/recommended/recommended-3.png": 498,
  "/images/content/recommended/recommended-4.png": 197,
  "/images/content/site-menu/hiking-promo.png": 900,
  "/images/content/store-showcase/metropolis-store.png": 1400
};
const responsiveImageBreakpoints = [160, 320, 480, 768, 1024, 1440];

function normalizePublicImagePath(src) {
  if (!src || /^(?:https?:|data:|blob:)/.test(src)) return src;
  let normalized = src;
  if (normalized.startsWith(appBasePath)) {
    normalized = '/' + normalized.slice(appBasePath.length).replace(/^\/?/, '');
  }
  if (normalized.startsWith('images/')) normalized = '/' + normalized;
  return normalized;
}

function responsiveVariantPath(src, width) {
  const normalized = normalizePublicImagePath(src);
  const dotIndex = normalized.lastIndexOf('.');
  const slashIndex = normalized.lastIndexOf('/');
  const dir = normalized.slice('/images/content'.length, slashIndex);
  const name = normalized.slice(slashIndex + 1, dotIndex);
  const ext = normalized.slice(dotIndex);
  return `/images/content/_responsive${dir}/${name}-${width}${ext}`;
}

function getResponsiveSrcset(src) {
  const normalized = normalizePublicImagePath(src);
  const originalWidth = responsiveImageWidths[normalized];
  if (!originalWidth) return resolvePublicAsset(src);

  const entries = responsiveImageBreakpoints
    .filter(width => width < originalWidth)
    .map(width => `${resolvePublicAsset(responsiveVariantPath(normalized, width))} ${width}w`);

  entries.push(`${resolvePublicAsset(normalized)} ${originalWidth}w`);
  return entries.join(', ');
}
function spriteHref(symbolId) {
  return `${appBasePath}images/icons/sprite.svg#${symbolId}`;
}

document.addEventListener('DOMContentLoaded', () => {
  const rollHoverSelectors = [
    '.catalog-header .hero__nav-link',
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

  const catalogDropdownButtons = Array.from(document.querySelectorAll(
    '.catalog-toolbar__button[aria-expanded], .catalog-toolbar__chip[aria-expanded]'
  ));
  const catalogProducts = document.querySelector('.catalog-products');
  const catalogLoading = catalogProducts?.querySelector('.catalog-products__loading');
  const catalogFilterModal = document.querySelector('[data-catalog-filter-modal]');
  const catalogFilterOpenButton = document.querySelector('[data-filter-toggle]');
  const catalogFilterForm = catalogFilterModal?.querySelector('[data-catalog-filter-form]');
  const catalogFilterCloseButtons = catalogFilterModal
    ? Array.from(catalogFilterModal.querySelectorAll('[data-catalog-filter-close]'))
    : [];
  let catalogLoadingTimer;

  const showCatalogLoading = () => {
    if (!catalogProducts || !catalogLoading) return;

    window.clearTimeout(catalogLoadingTimer);
    catalogProducts.classList.add('is-loading');
    catalogProducts.setAttribute('aria-busy', 'true');
    catalogLoading.hidden = false;

    catalogLoadingTimer = window.setTimeout(() => {
      catalogProducts.classList.remove('is-loading');
      catalogProducts.setAttribute('aria-busy', 'false');
      catalogLoading.hidden = true;
    }, 520);
  };

  const closeCatalogFilterModal = () => {
    if (!catalogFilterModal || catalogFilterModal.hidden) return;

    catalogFilterModal.hidden = true;
    catalogFilterModal.setAttribute('aria-hidden', 'true');
    catalogFilterOpenButton?.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('is-modal-open');
  };

  const openCatalogFilterModal = () => {
    if (!catalogFilterModal) return;

    catalogFilterModal.hidden = false;
    catalogFilterModal.setAttribute('aria-hidden', 'false');
    catalogFilterOpenButton?.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('is-modal-open');
    catalogFilterModal.querySelector('[data-catalog-filter-close]')?.focus();
  };

  if (catalogDropdownButtons.length) {
    const closeCatalogDropdowns = exceptButton => {
      catalogDropdownButtons.forEach(button => {
        if (button !== exceptButton) button.setAttribute('aria-expanded', 'false');
      });
    };

    catalogDropdownButtons.forEach(button => {
      button.addEventListener('click', () => {
        if (button.matches('[data-filter-toggle]')) {
          if (catalogFilterModal?.hidden === false) {
            closeCatalogFilterModal();
          } else {
            closeCatalogDropdowns(button);
            openCatalogFilterModal();
          }
          return;
        }

        const shouldOpen = button.getAttribute('aria-expanded') !== 'true';
        closeCatalogDropdowns(button);
        button.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
        if (button.matches('[data-filter-key], [data-sort-toggle]')) showCatalogLoading();
      });
    });

    document.addEventListener('click', event => {
      if (event.target.closest('.catalog-toolbar')) return;
      if (event.target.closest('[data-catalog-filter-modal]')) return;
      closeCatalogDropdowns();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeCatalogDropdowns();
        closeCatalogFilterModal();
      }
    });
  }

  catalogFilterCloseButtons.forEach(button => {
    button.addEventListener('click', closeCatalogFilterModal);
  });

  catalogFilterForm?.addEventListener('submit', event => {
    event.preventDefault();
    closeCatalogFilterModal();
    showCatalogLoading();
  });

  document.querySelector('[data-load-more]')?.addEventListener('click', showCatalogLoading);

  const heroHeader = document.querySelector('.hero');
  const heroTopbar = document.querySelector('.hero__topbar');
  const desktopHeaderQuery = window.matchMedia('(min-width: 1280px)');
  const menuPanelQuery = window.matchMedia('(min-width: 768px)');
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
    const shouldShowMobileHeaderBg = !desktopHeaderQuery.matches && window.scrollY > 2;
    heroHeader.classList.toggle('is-header-compact', shouldCompact);
    heroHeader.classList.toggle('is-header-scrolled', shouldShowMobileHeaderBg);
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

  const catalogHeader = document.querySelector('.catalog-header');
  let catalogHeaderTicking = false;
  // Если хедер уже compact в HTML — страница стартует compact и не разворачивается при скролле наверх
  const catalogHeaderInitiallyCompact = catalogHeader?.classList.contains('is-header-compact') ?? false;
  let catalogHeaderCompact = catalogHeaderInitiallyCompact;

  const syncCatalogHeaderState = () => {
    catalogHeaderTicking = false;
    if (!catalogHeader) return;

    if (!desktopHeaderQuery.matches) {
      catalogHeaderCompact = false;
    } else if (!catalogHeaderCompact && window.scrollY > 24) {
      catalogHeaderCompact = true;
    } else if (catalogHeaderCompact && window.scrollY <= 0 && !catalogHeaderInitiallyCompact) {
      // Разворачиваем только если страница изначально не была compact
      catalogHeaderCompact = false;
    }

    catalogHeader.classList.toggle('is-header-compact', catalogHeaderCompact);
    catalogHeader.classList.toggle('is-header-dark', true);
  };

  const requestCatalogHeaderSync = () => {
    if (catalogHeaderTicking) return;
    catalogHeaderTicking = true;
    window.requestAnimationFrame(syncCatalogHeaderState);
  };

  syncCatalogHeaderState();
  window.addEventListener('scroll', requestCatalogHeaderSync, { passive: true });
  window.addEventListener('resize', requestCatalogHeaderSync);
  desktopHeaderQuery.addEventListener('change', syncCatalogHeaderState);

  // Desktop header catalog dropdown
  document.querySelectorAll('[data-header-mega-root]').forEach(headerRoot => {
    const mega = headerRoot.querySelector('[data-header-mega]');
    const nav = headerRoot.querySelector('.hero__nav');
    const topbar = headerRoot.querySelector('.hero__topbar');
    const triggers = headerRoot.querySelectorAll('[data-header-mega-trigger]');
    const groups = headerRoot.querySelectorAll('[data-header-mega-group]');
    const staticNavLinks = nav?.querySelectorAll('.hero__nav-link:not([data-header-mega-trigger])') || [];
    const megaCloseDuration = 320;
    let closeMegaDelayTimer;
    let closeMegaResetTimer;

    if (!mega || !nav || !triggers.length) return;

    const clearActiveGroups = () => {
      mega.classList.remove('is-group-hovered');
      groups.forEach(group => {
        group.classList.remove('is-active');
        group.querySelectorAll('a').forEach(link => link.classList.remove('is-active'));
      });
    };

    const setActiveGroup = (activeGroup, activeLink = null) => {
      mega.classList.add('is-group-hovered');
      groups.forEach(group => {
        group.classList.toggle('is-active', group === activeGroup && Boolean(activeLink));
        group.querySelectorAll('a').forEach(link => {
          link.classList.toggle('is-active', link === activeLink);
        });
      });
    };

    const openMega = activeTrigger => {
      if (!desktopHeaderQuery.matches) return;

      window.clearTimeout(closeMegaDelayTimer);
      window.clearTimeout(closeMegaResetTimer);
      mega.hidden = false;
      headerRoot.classList.add('is-mega-open');
      nav.classList.add('is-mega-open');
      triggers.forEach(trigger => {
        trigger.classList.toggle('is-mega-active', trigger === activeTrigger);
        trigger.setAttribute('aria-expanded', trigger === activeTrigger ? 'true' : 'false');
      });
      clearActiveGroups();
      window.requestAnimationFrame(() => mega.classList.add('is-open'));
    };

    const resetMegaState = () => {
      mega.hidden = true;
      clearActiveGroups();
      triggers.forEach(trigger => {
        trigger.classList.remove('is-mega-active');
        trigger.setAttribute('aria-expanded', 'false');
      });
    };

    const closeMega = () => {
      window.clearTimeout(closeMegaDelayTimer);
      window.clearTimeout(closeMegaResetTimer);
      if (mega.hidden) return;

      mega.classList.remove('is-open');
      headerRoot.classList.remove('is-mega-open');
      nav.classList.remove('is-mega-open');
      closeMegaResetTimer = window.setTimeout(resetMegaState, megaCloseDuration);
    };

    triggers.forEach(trigger => {
      trigger.setAttribute('aria-haspopup', 'true');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.addEventListener('mouseenter', () => openMega(trigger));
      trigger.addEventListener('focus', () => openMega(trigger));
    });

    staticNavLinks.forEach(link => {
      link.addEventListener('mouseenter', closeMega);
      link.addEventListener('focus', closeMega);
    });

    groups.forEach(group => {
      const title = group.querySelector('.header-mega__title');

      group.addEventListener('mouseenter', () => setActiveGroup(group));
      group.addEventListener('focusin', () => setActiveGroup(group));
      title?.addEventListener('mouseenter', () => setActiveGroup(group, title));
      title?.addEventListener('mouseleave', () => {
        title.classList.remove('is-active');
        group.classList.remove('is-active');
      });
      title?.addEventListener('focus', () => setActiveGroup(group, title));
      group.querySelectorAll('.header-mega__list a').forEach(link => {
        link.addEventListener('mouseenter', () => setActiveGroup(group, link));
        link.addEventListener('mouseleave', () => {
          link.classList.remove('is-active');
          group.classList.remove('is-active');
        });
        link.addEventListener('focus', () => setActiveGroup(group, link));
      });
    });

    topbar?.addEventListener('mouseleave', () => {
      window.clearTimeout(closeMegaDelayTimer);
      closeMegaDelayTimer = window.setTimeout(closeMega, 120);
    });
    mega.addEventListener('mouseenter', () => window.clearTimeout(closeMegaDelayTimer));
    mega.addEventListener('mouseleave', closeMega);
    headerRoot.addEventListener('mouseleave', closeMega);
    headerRoot.addEventListener('focusout', event => {
      if (!headerRoot.contains(event.relatedTarget)) closeMega();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !mega.hidden) closeMega();
    });

    desktopHeaderQuery.addEventListener('change', event => {
      if (!event.matches) closeMega();
    });
  });

  // Mobile menu
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const mobileMenuOpenButtons = document.querySelectorAll('[data-site-menu-open]');
  const mobileCatalogOpenButtons = document.querySelectorAll('[data-mobile-catalog-open]');

  if (mobileMenu && (mobileMenuOpenButtons.length || mobileCatalogOpenButtons.length)) {
    const mobileMenuViews = mobileMenu.querySelectorAll('[data-mobile-menu-view]');
    const mobileMenuCloseButtons = mobileMenu.querySelectorAll('[data-mobile-menu-close]');
    const mobileMenuCustomersButton = mobileMenu.querySelector('[data-mobile-menu-customers]');
    const mobileMenuBackButton = mobileMenu.querySelector('[data-mobile-menu-back]');
    const mobileCatalogBackButton = mobileMenu.querySelector('[data-mobile-menu-catalog-back]');
    const mobileSectionButtons = mobileMenu.querySelectorAll('[data-mobile-menu-section-toggle]');
    const mobileCategoryButtons = mobileMenu.querySelectorAll('[data-mobile-menu-category]');
    const mobileCategoryTitle = mobileMenu.querySelector('[data-mobile-menu-category-title]');
    let mobileMenuReturnFocus = null;
    let mobileMenuCurrentView = 'main';

    const setMobileMenuView = viewName => {
      mobileMenuCurrentView = viewName;
      mobileMenuViews.forEach(view => {
        view.hidden = view.dataset.mobileMenuView !== viewName;
      });
    };

    const syncMobileCatalogButtons = isOpen => {
      mobileCatalogOpenButtons.forEach(button => {
        button.classList.toggle('is-menu-open', isOpen);
        button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        const use = button.querySelector('use');
        if (use) use.setAttribute('href', spriteHref(isOpen ? 'icon-menu-close' : 'icon-tab-menu'));
      });
    };

    const setMobileMenuOpen = (isOpen, force = false, viewName = 'main') => {
      if (!force && menuPanelQuery.matches) return;

      if (isOpen) {
        mobileMenuReturnFocus = document.activeElement;
        setMobileMenuView(viewName);
        mobileMenu.hidden = false;
        mobileMenu.setAttribute('aria-hidden', 'false');
        document.documentElement.classList.add('is-mobile-menu-open');
        syncMobileCatalogButtons(viewName === 'catalog' || viewName === 'category');
        window.requestAnimationFrame(() => mobileMenu.classList.add('is-open'));
        if (viewName !== 'catalog') {
          mobileMenu.querySelector('[data-mobile-menu-close]')?.focus({ preventScroll: true });
        }
        return;
      }

      mobileMenu.classList.remove('is-open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('is-mobile-menu-open');
      syncMobileCatalogButtons(false);
      mobileMenu.hidden = true;

      if (mobileMenuReturnFocus instanceof HTMLElement) {
        mobileMenuReturnFocus.focus({ preventScroll: true });
      }
      mobileMenuReturnFocus = null;
    };

    mobileMenuOpenButtons.forEach(button => {
      button.addEventListener('click', event => {
        if (menuPanelQuery.matches) return;
        event.preventDefault();
        setMobileMenuOpen(true, false, 'main');
      });
    });

    mobileCatalogOpenButtons.forEach(button => {
      button.setAttribute('aria-expanded', 'false');
      button.addEventListener('click', event => {
        if (menuPanelQuery.matches) return;
        event.preventDefault();

        if (!mobileMenu.hidden && (mobileMenuCurrentView === 'catalog' || mobileMenuCurrentView === 'category')) {
          setMobileMenuOpen(false);
          return;
        }

        setMobileMenuOpen(true, false, 'catalog');
      });
    });

    mobileMenuCloseButtons.forEach(button => {
      button.addEventListener('click', () => setMobileMenuOpen(false));
    });

    mobileMenuCustomersButton?.addEventListener('click', () => setMobileMenuView('customers'));
    mobileMenuBackButton?.addEventListener('click', () => setMobileMenuView('main'));
    mobileCatalogBackButton?.addEventListener('click', () => setMobileMenuView('catalog'));

    mobileSectionButtons.forEach(button => {
      button.addEventListener('click', () => {
        const section = button.closest('[data-mobile-menu-section]');
        if (!section) return;

        const shouldOpen = !section.classList.contains('is-open');
        mobileMenu.querySelectorAll('[data-mobile-menu-section]').forEach(item => {
          item.classList.toggle('is-open', item === section && shouldOpen);
          item.querySelector('[data-mobile-menu-section-toggle]')?.setAttribute(
            'aria-expanded',
            item === section && shouldOpen ? 'true' : 'false'
          );
        });
      });
    });

    mobileCategoryButtons.forEach(button => {
      button.addEventListener('click', () => {
        if (mobileCategoryTitle) {
          mobileCategoryTitle.textContent = button.dataset.mobileMenuCategory || button.textContent.trim();
        }
        setMobileMenuView('category');
        syncMobileCatalogButtons(true);
      });
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !mobileMenu.hidden) setMobileMenuOpen(false);
    });

    menuPanelQuery.addEventListener('change', event => {
      if (event.matches && !mobileMenu.hidden) setMobileMenuOpen(false, true);
    });
  }

  // Desktop sidebar menu
  const siteMenu = document.querySelector('[data-site-menu]');
  const siteMenuOpenButtons = document.querySelectorAll('[data-site-menu-open]');

  if (siteMenu && siteMenuOpenButtons.length) {
    const closeButtons = siteMenu.querySelectorAll('[data-site-menu-close]');
    const submenu = siteMenu.querySelector('[data-site-menu-submenu]');
    const submenuViews = siteMenu.querySelectorAll('[data-site-menu-submenu-view]');
    const sectionButtons = siteMenu.querySelectorAll('[data-site-menu-section]');
    const categoryButtons = siteMenu.querySelectorAll('[data-site-menu-category]');
    const subcategories = siteMenu.querySelector('[data-site-menu-subcategories]');
    const infoButtons = siteMenu.querySelectorAll('[data-site-menu-info]');
    let menuReturnFocus = null;
    let menuCloseTimer;

    const setSubmenuView = viewName => {
      submenuViews.forEach(view => {
        view.hidden = view.dataset.siteMenuSubmenuView !== viewName;
      });
    };

    const closeSubmenu = () => {
      if (!submenu) return;

      submenu.classList.remove('is-open');
      submenu.setAttribute('aria-hidden', 'true');
      submenu.hidden = true;
      siteMenu.classList.remove('is-submenu-open');
      siteMenu.classList.remove('is-info-submenu-open');
      sectionButtons.forEach(button => {
        button.classList.remove('is-active');
        button.setAttribute('aria-expanded', 'false');
      });
      infoButtons.forEach(button => button.classList.remove('is-active'));
      categoryButtons.forEach(button => button.classList.remove('is-active'));
      if (subcategories) subcategories.hidden = true;
    };

    const openSubmenu = activeButton => {
      if (!submenu) return;

      submenu.hidden = false;
      submenu.setAttribute('aria-hidden', 'false');
      siteMenu.classList.add('is-submenu-open');
      siteMenu.classList.remove('is-info-submenu-open');
      setSubmenuView('catalog');
      sectionButtons.forEach(button => {
        const isActive = button === activeButton;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      });
      infoButtons.forEach(button => button.classList.remove('is-active'));
      categoryButtons.forEach(button => button.classList.remove('is-active'));
      if (subcategories) subcategories.hidden = true;
      window.requestAnimationFrame(() => submenu.classList.add('is-open'));
    };

    const openInfoSubmenu = activeButton => {
      if (!submenu) return;

      submenu.hidden = false;
      submenu.setAttribute('aria-hidden', 'false');
      siteMenu.classList.remove('is-submenu-open');
      siteMenu.classList.add('is-info-submenu-open');
      setSubmenuView('customers');
      sectionButtons.forEach(button => {
        button.classList.remove('is-active');
        button.setAttribute('aria-expanded', 'false');
      });
      categoryButtons.forEach(button => button.classList.remove('is-active'));
      if (subcategories) subcategories.hidden = true;
      infoButtons.forEach(button => {
        button.classList.toggle('is-active', button === activeButton);
      });
      window.requestAnimationFrame(() => submenu.classList.add('is-open'));
    };

    const setMenuOpen = isOpen => {
      window.clearTimeout(menuCloseTimer);

      if (isOpen) {
        menuReturnFocus = document.activeElement;
        siteMenu.hidden = false;
        siteMenu.setAttribute('aria-hidden', 'false');
        document.documentElement.classList.add('is-site-menu-open');
        window.requestAnimationFrame(() => siteMenu.classList.add('is-open'));
        siteMenu.querySelector('[data-site-menu-close]')?.focus({ preventScroll: true });
        return;
      }

      siteMenu.classList.remove('is-open');
      siteMenu.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('is-site-menu-open');
      closeSubmenu();
      menuCloseTimer = window.setTimeout(() => {
        siteMenu.hidden = true;
      }, 340);

      if (menuReturnFocus instanceof HTMLElement) {
        menuReturnFocus.focus({ preventScroll: true });
      }
      menuReturnFocus = null;
    };

    siteMenuOpenButtons.forEach(button => {
      button.addEventListener('click', event => {
        if (!menuPanelQuery.matches) return;
        event.preventDefault();
        setMenuOpen(true);
      });
    });

    closeButtons.forEach(button => {
      button.addEventListener('click', () => setMenuOpen(false));
    });

    // Открытие доп-панели по hover, а не по клику
    let submenuHoverTimer = null;
    const submenuCloseDelay = 900;

    const cancelSubmenuClose = () => {
      clearTimeout(submenuHoverTimer);
      submenuHoverTimer = null;
    };

    const scheduleSubmenuClose = () => {
      cancelSubmenuClose();
      submenuHoverTimer = setTimeout(closeSubmenu, submenuCloseDelay);
    };

    sectionButtons.forEach(button => {
      button.addEventListener('mouseenter', () => {
        cancelSubmenuClose();
        openSubmenu(button);
      });
      button.addEventListener('mouseleave', scheduleSubmenuClose);
    });

    submenu?.addEventListener('mouseenter', cancelSubmenuClose);
    submenu?.addEventListener('mouseleave', scheduleSubmenuClose);

    infoButtons.forEach(button => {
      const openCurrentInfoSubmenu = () => {
        cancelSubmenuClose();
        openInfoSubmenu(button);
      };

      button.addEventListener('mouseenter', openCurrentInfoSubmenu);
      button.addEventListener('focus', openCurrentInfoSubmenu);
      button.addEventListener('mouseleave', scheduleSubmenuClose);
    });

    categoryButtons.forEach(button => {
      const openCurrentCategory = () => {
        categoryButtons.forEach(categoryButton => {
          categoryButton.classList.toggle('is-active', categoryButton === button);
        });
        if (subcategories) subcategories.hidden = false;
      };

      button.addEventListener('mouseenter', openCurrentCategory);
      button.addEventListener('focus', openCurrentCategory);
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !siteMenu.hidden) {
        setMenuOpen(false);
      }
    });

    menuPanelQuery.addEventListener('change', event => {
      if (!event.matches && !siteMenu.hidden) {
        setMenuOpen(false);
      }
    });
  }

  // ─── Hero slider ────────────────────────────────────────────────────────────
  const heroSlidesWrap = document.querySelector('.hero__slides');
  if (heroSlidesWrap) {
    const slides  = document.querySelectorAll('.hero__slide');
    const infos   = document.querySelectorAll('.hero__info');
    const dots    = document.querySelectorAll('.hero__pagination-dot');
    const productSets = document.querySelectorAll('[data-hero-products]');
    const heroArrows = Array.from(document.querySelectorAll('.hero__arrow'));
    const btnPrev = heroArrows.find(button => /предыдущий|назад/i.test(button.getAttribute('aria-label') || '')) || heroArrows[0];
    const btnNext = heroArrows.find(button => /следующий|вперед|вперёд/i.test(button.getAttribute('aria-label') || '')) || heroArrows[1];
    const hero = document.querySelector('.hero');
    const total   = Math.max(dots.length, slides.length);
    let current   = 0;
    let autoplayTimer;

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
      productSets[current % productSets.length]?.classList.remove('is-active');
      productSets[current % productSets.length]?.setAttribute('hidden', '');

      current = next;
      heroSlidesWrap.style.transform = slides.length > 1
        ? `translateX(-${(current % slides.length) * 100}%)`
        : 'translateX(0)';

      dots[current]?.classList.add('is-active');
      infos[current % infos.length]?.classList.add('is-active');
      productSets[current % productSets.length]?.classList.add('is-active');
      productSets[current % productSets.length]?.removeAttribute('hidden');
      restartProgress();
      replayCurrentSlide();

      btnPrev?.classList.toggle('is-inactive', false);
      btnNext?.classList.toggle('is-inactive', false);
    }

    function startAutoplay() {
      window.clearInterval(autoplayTimer);
      autoplayTimer = window.setInterval(() => {
        goTo(current + 1, true);
      }, 5000);
    }

    function goToManual(idx) {
      goTo(idx);
      startAutoplay();
    }

    restartProgress();
    startAutoplay();

    btnPrev?.addEventListener('click', () => goToManual(current - 1));
    btnNext?.addEventListener('click', () => goToManual(current + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goToManual(i)));

    // Свайп на мобайле
    let touchStartX = 0;

    hero?.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    hero?.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) < 50) return;
      goToManual(dx < 0 ? current + 1 : current - 1);
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

    let wheelAccumulated = 0;
    let wheelLocked = false;

    viewport.addEventListener('wheel', event => {
      if (!isCarouselLayout()) return;
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) return;

      event.preventDefault();

      if (wheelLocked) {
        wheelAccumulated = 0;
        return;
      }

      wheelAccumulated += event.deltaX;

      if (Math.abs(wheelAccumulated) > 30) {
        const dir = wheelAccumulated > 0 ? 1 : -1;
        wheelAccumulated = 0;
        wheelLocked = true;
        goTo(index + dir);
        setTimeout(() => { wheelLocked = false; }, 600);
      }
    }, { passive: false });

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Сбрасываем флаг анимации — transitionend мог не сработать при ресайзе
        isAnimating = false;

        if (!isCarouselLayout()) {
          track.style.transition = 'none';
          track.style.transform = '';
          return;
        }

        // Сбрасываем на первую реальную карточку если index невалидный
        if (index < total || index >= total * 2) {
          index = total;
        }

        // Двойной rAF: первый — фиксирует изменения стилей,
        // второй — гарантирует что getBoundingClientRect() вернёт новые значения
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setPosition(index, false);
          });
        });
      }, 100); // debounce 100ms — не пересчитываем на каждый пиксель ресайза
    });
    setPosition(index, false);
  });

  // Cart page — login modal
  document.querySelectorAll('[data-cart-login-modal]').forEach(modal => {
    const openButtons = document.querySelectorAll('[data-cart-login-open]');
    const closeButtons = modal.querySelectorAll('[data-cart-login-close]');
    const closeButton = modal.querySelector('.cart-login-modal__close');
    let closeTimer = 0;

    function openModal(event) {
      event?.preventDefault();
      window.clearTimeout(closeTimer);
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('is-modal-open');
      window.requestAnimationFrame(() => {
        modal.classList.add('is-open');
        closeButton?.focus();
      });
    }

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('is-modal-open');
      closeTimer = window.setTimeout(() => {
        modal.hidden = true;
      }, 200);
    }

    openButtons.forEach(button => button.addEventListener('click', openModal));
    closeButtons.forEach(button => button.addEventListener('click', closeModal));

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !modal.hidden) closeModal();
    });
  });

  // Cart page — pickup point modal
  document.querySelectorAll('[data-cart-pickup-modal]').forEach(modal => {
    const openButtons = document.querySelectorAll('[data-cart-pickup-open]');
    const closeButtons = modal.querySelectorAll('[data-cart-pickup-close]');
    const closeButton = modal.querySelector('.cart-pickup-modal__close');
    const points = Array.from(modal.querySelectorAll('[data-cart-pickup-point]'));
    const submitButton = modal.querySelector('[data-cart-pickup-submit]');
    const listView = modal.querySelector('[data-cart-pickup-view="list"]');
    const detailView = modal.querySelector('[data-cart-pickup-view="detail"]');
    const deliveryAddress = document.querySelector('[data-cart-pickup-address]');
    const deliveryDate = document.querySelector('[data-cart-pickup-date]');
    const detailAddress = modal.querySelector('[data-cart-pickup-detail-address]');
    const detailSchedule = modal.querySelector('[data-cart-pickup-detail-schedule]');
    const detailDelivery = modal.querySelector('[data-cart-pickup-detail-delivery]');
    let activePoint = points.find(point => point.classList.contains('is-active')) || points[0] || null;
    let closeTimer = 0;

    function syncDetail(point) {
      if (!point) return;

      if (detailAddress) detailAddress.textContent = point.dataset.address || '';
      if (detailSchedule) detailSchedule.textContent = point.dataset.schedule || '';
      if (detailDelivery) detailDelivery.textContent = point.dataset.delivery || point.dataset.date || '';
    }

    function selectPoint(point, showDetail = true) {
      if (!point) return;

      activePoint = point;
      points.forEach(item => {
        const isActive = item === point;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-checked', String(isActive));
      });
      syncDetail(point);

      if (showDetail && listView && detailView) {
        listView.hidden = true;
        detailView.hidden = false;
      }
    }

    function openModal(event) {
      event?.preventDefault();
      window.clearTimeout(closeTimer);
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      if (listView && detailView) {
        listView.hidden = false;
        detailView.hidden = true;
      }
      syncDetail(activePoint);
      document.documentElement.classList.add('is-modal-open');
      window.requestAnimationFrame(() => {
        modal.classList.add('is-open');
        closeButton?.focus();
      });
    }

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('is-modal-open');
      closeTimer = window.setTimeout(() => {
        modal.hidden = true;
      }, 200);
    }

    openButtons.forEach(button => button.addEventListener('click', openModal));
    closeButtons.forEach(button => button.addEventListener('click', closeModal));
    points.forEach(point => point.addEventListener('click', () => selectPoint(point)));
    submitButton?.addEventListener('click', () => {
      if (activePoint) {
        if (deliveryAddress) deliveryAddress.textContent = activePoint.dataset.address || deliveryAddress.textContent;
        if (deliveryDate) deliveryDate.textContent = `Доставим ${activePoint.dataset.date || ''}`.trim();
      }
      closeModal();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !modal.hidden) closeModal();
    });
  });

  // ─── Activity picker ──────────────────────────────────────────────────────
  document.querySelectorAll('.activity-picker').forEach(section => {
    const links = section.querySelectorAll('[data-activity-link]');
    const preview = section.querySelector('.activity-picker__preview-img');
    const image = section.querySelector('.activity-picker__image-img');
    const cta = section.querySelector('.activity-picker__cta');
    const productCards = Array.from(section.querySelectorAll('.activity-product-card'));

    if (!links.length) return;

    function setImage(img, src) {
      if (!img || !src) return;
      const resolvedSrc = resolvePublicAsset(src);
      img.classList.remove('is-changing');
      void img.offsetWidth;
      img.classList.add('is-changing');
      img.src = resolvedSrc;
      img.srcset = getResponsiveSrcset(src);
    }

    function setProduct(card, link, index) {
      if (!card || !link) return;

      // data-product-1-name → dataset["product-1Name"] (дефис перед цифрой остаётся по HTML spec)
      const name     = link.dataset[`product-${index}Name`];
      const price    = link.dataset[`product-${index}Price`];
      const discount = link.dataset[`product-${index}Discount`];
      const imageSrc = link.dataset[`product-${index}Image`];
      const url      = link.dataset[`product-${index}Url`];
      const img = card.querySelector('img');
      const nameNode = card.querySelector('.activity-product-card__name');
      const priceNode = card.querySelector('.activity-product-card__price');
      let discountNode = card.querySelector('.activity-product-card__discount');

      card.classList.remove('is-changing');
      void card.offsetWidth;
      card.classList.add('is-changing');

      if (url) card.href = url;
      if (name && nameNode) nameNode.textContent = name;
      if (price && priceNode) priceNode.textContent = price;
      if (discount) {
        if (!discountNode) {
          discountNode = document.createElement('span');
          discountNode.className = 'activity-product-card__discount';
          card.insertBefore(discountNode, card.firstChild);
        }
        discountNode.textContent = discount;
        discountNode.hidden = false;
      } else if (discountNode) {
        discountNode.hidden = true;
      }
      if (img && imageSrc) {
        const resolvedImageSrc = resolvePublicAsset(imageSrc);
        img.src = resolvedImageSrc;
        img.srcset = getResponsiveSrcset(imageSrc);
        img.alt = name || '';
      }
    }

    function activate(link) {
      links.forEach(item => {
        const isActive = item === link;
        item.classList.toggle('is-active', isActive);
        if (isActive) {
          item.setAttribute('aria-current', 'true');
        } else {
          item.removeAttribute('aria-current');
        }
      });

      setImage(preview, link.dataset.preview);
      setImage(image, link.dataset.image);
      if (image) {
        image.style.setProperty('--activity-image-position', link.dataset.imagePosition || 'center center');
        image.style.setProperty('--activity-image-scale', link.dataset.imageScale || '1');
      }
      productCards.forEach((card, index) => setProduct(card, link, index + 1));

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
    const modelImg = section.querySelector('.build-kit-desktop__model-img');

    genderButtons.forEach(button => {
      button.addEventListener('click', () => {
        genderButtons.forEach(item => {
          const isActive = item === button;
          item.classList.toggle('is-active', isActive);
          item.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        // Меняем манекен если у кнопки есть data-model
        if (modelImg && button.dataset.model) {
          const modelSrc = resolvePublicAsset(button.dataset.model);
          modelImg.src = modelSrc;
          modelImg.srcset = getResponsiveSrcset(button.dataset.model);
        }
      });
    });

    function activateCategory(category) {
      const button = filterButtons.find(item => item.dataset.kitCategory === category);
      if (!button) return;

      const row = button.closest('.build-kit-desktop__filter-row');
      row?.querySelectorAll('.build-kit-desktop__filter').forEach(item => item.classList.remove('is-active'));
      button.classList.add('is-active');
      section.dataset.kitActiveSlot = category;

      // Если категория сменилась — перестраиваем карусель и обновляем превью
      if (category === currentCategory) return;
      currentCategory = category;

      activeTiles = allTiles.filter(t => t.dataset.kitCategory === category);
      destroyDesktopCarousel();
      page = 0;
      syncDesktopCarousel();

      // Активируем первый тайл новой категории и обновляем превью карточки
      const firstTile = activeTiles[0];
      if (firstTile) {
        allTiles.forEach(t => t.classList.remove('is-active'));
        firstTile.classList.add('is-active');
        updateSelectedJacket(getTileProduct(firstTile));
      }
    }

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        if (button.dataset.kitCategory) {
          activateCategory(button.dataset.kitCategory);
          return;
        }

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
      });
    });

    const grid = section.querySelector('.build-kit-desktop__tiles');
    const allTiles = previewTiles;
    let currentCategory = 'jacket';
    let activeTiles = allTiles.filter(t => t.dataset.kitCategory === currentCategory);
    const dotsContainer = section.querySelector('.build-kit-desktop__dots');
    const btnPrev = section.querySelector('.build-kit-desktop__arrow[aria-label="Назад"]');
    const btnNext = section.querySelector('.build-kit-desktop__arrow[aria-label="Вперед"]');
    const kitList = section.querySelector('.build-kit-desktop__kit-list');
    const kitCount = section.querySelector('.build-kit-desktop__kit-count');
    const totalPrice = section.querySelector('.build-kit-desktop__total-price');
    const productImage = section.querySelector('.build-kit-desktop__product-pic img');
    const productName = section.querySelector('.build-kit-desktop__product-name');
    const productPrice = section.querySelector('.build-kit-desktop__product-price');
    const productAddButton = section.querySelector('[data-kit-add-selected]');
    const productAddIcon = productAddButton?.querySelector('use');

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
      allTiles.forEach(tile => {
        tile.hidden = false;
        grid.appendChild(tile);
      });
      grid.querySelectorAll('.build-kit-desktop__page').forEach(pageEl => pageEl.remove());
      isDesktopCarouselReady = false;
      page = 0;
    }

    function initDesktopCarousel() {
      if (!grid || !activeTiles.length || isDesktopCarouselReady) return;

      // Скрываем тайлы других категорий — они остаются плоскими в гриде после destroyDesktopCarousel
      allTiles.forEach(tile => {
        if (!activeTiles.includes(tile)) tile.hidden = true;
      });

      pages = Math.max(1, Math.ceil(activeTiles.length / perPage));
      page = Math.min(page, pages - 1);

      for (let i = 0; i < pages; i += 1) {
        const pageEl = document.createElement('div');
        pageEl.className = 'build-kit-desktop__page';
        activeTiles.slice(i * perPage, (i + 1) * perPage).forEach(tile => {
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
    // data-sizes — список размеров через запятую, если нужен нестандартный ряд.
    function getTileProduct(tile) {
      const img = tile.querySelector('img');
      const src = img?.getAttribute('src') || '';
      const sizes = (tile.dataset.sizes || 'XL,L,M')
        .split(',')
        .map(size => size.trim())
        .filter(Boolean);

      return {
        id:    `${tile.dataset.kitSlot || tile.dataset.kitCategory || 'product'}:${tile.dataset.name || ''}:${src}`,
        name:  tile.dataset.name  || '',
        price: tile.dataset.price || '',
        size:  tile.dataset.size !== 'false',
        sizes,
        slot:  tile.dataset.kitSlot || tile.dataset.kitCategory || 'product',
        category: tile.dataset.kitCategory || tile.dataset.kitSlot || 'product',
        img:   src,
      };
    }

    const activeTile = allTiles.find(t => t.classList.contains('is-active')) || allTiles.find(t => t.dataset.kitCategory === 'jacket');
    let selectedJacket = activeTile ? getTileProduct(activeTile) : {
      name: productName?.textContent?.trim() || '',
      price: productPrice?.textContent?.trim() || '',
      img: productImage?.getAttribute('src') || '',
      size: true,
      slot: 'jacket',
      category: 'jacket',
    };

    activateCategory(selectedJacket.category);

    function updateSelectedJacket(product) {
      selectedJacket = product;
      activateCategory(product.category);

      if (productImage) {
        productImage.setAttribute('src', product.img);
        productImage.setAttribute('srcset', getResponsiveSrcset(product.img));
        productImage.setAttribute('alt', product.name);
      }

      if (productName) {
        productName.textContent = product.name;
      }

      if (productPrice) {
        productPrice.textContent = product.price;
      }

      updateKitSummary();
      syncProductAddState();
    }

    function getKitItems() {
      return Array.from(section.querySelectorAll('.build-kit-desktop__kit-item:not(.build-kit-desktop__kit-item--empty)'));
    }

    function updateKitSummary() {
      const items = getKitItems();
      const itemsTotal = items.reduce((sum, item) => {
        return sum + parsePrice(item.querySelector('.build-kit-desktop__kit-price')?.textContent);
      }, 0);

      if (kitCount) {
        kitCount.textContent = `${Math.min(items.length, 4)}/4`;
      }

      if (totalPrice) {
        totalPrice.textContent = formatPrice(itemsTotal);
      }
    }

    function getSlotLabel(slot) {
      const labels = {
        hat: 'Добавить шапку',
        jacket: 'Добавить куртку',
        pants: 'Добавить штаны',
        shoes: 'Добавить обувь',
      };

      return labels[slot] || 'Добавить товар';
    }

    function createEmptyKitSlot(label = 'Добавить товар', slot = '') {
      const button = document.createElement('button');
      button.className = 'build-kit-desktop__kit-item build-kit-desktop__kit-item--empty';
      button.type = 'button';
      if (slot) {
        button.dataset.kitSlot = slot;
        button.dataset.kitEmptyLabel = label;
      }
      button.innerHTML = `<span>${label}</span>`;
      return button;
    }

    function createKitItem(product) {
      const article = document.createElement('article');
      article.className = 'build-kit-desktop__kit-item';
      article.dataset.kitSlot = product.slot || product.category || 'product';
      article.dataset.kitCategory = product.category || product.slot || 'product';
      article.dataset.kitProductId = product.id || '';

      // Используем DOM-методы вместо innerHTML, чтобы избежать XSS.
      // textContent автоматически экранирует любые HTML-символы в данных из CMS.
      const img = document.createElement('img');
      img.className = 'build-kit-desktop__kit-img';
      img.src = resolvePublicAsset(product.img || '');
      img.srcset = getResponsiveSrcset(product.img);
      img.sizes = '80px';
      img.alt = '';
      img.loading = 'lazy';

      const content = document.createElement('div');
      content.className = 'build-kit-desktop__kit-content';

      const top = document.createElement('div');
      top.className = 'build-kit-desktop__kit-top';

      const nameEl = document.createElement('h3');
      nameEl.className = 'build-kit-desktop__kit-name';
      nameEl.textContent = product.name || ''; // textContent — безопасно

      const removeBtn = document.createElement('button');
      removeBtn.className = 'build-kit-desktop__remove';
      removeBtn.type = 'button';
      removeBtn.setAttribute('aria-label', 'Удалить');

      top.appendChild(nameEl);
      top.appendChild(removeBtn);

      const bottom = document.createElement('div');
      bottom.className = 'build-kit-desktop__kit-bottom';

      const priceEl = document.createElement('span');
      priceEl.className = 'build-kit-desktop__kit-price';
      priceEl.textContent = product.price || ''; // textContent — безопасно

      bottom.appendChild(priceEl);

      if (product.size) {
        const label = document.createElement('label');
        label.className = 'build-kit-desktop__size';
        label.setAttribute('aria-label', 'Размер');

        const select = document.createElement('select');
        select.className = 'build-kit-desktop__size-select';

        const sizes = (product.sizes && product.sizes.length) ? product.sizes : ['XL', 'L', 'M'];
        sizes.forEach((size, index) => {
          const option = document.createElement('option');
          option.textContent = String(size); // textContent — безопасно
          if (index === 0) option.selected = true;
          select.appendChild(option);
        });

        label.appendChild(select);
        bottom.appendChild(label);
      }

      content.appendChild(top);
      content.appendChild(bottom);
      article.appendChild(img);
      article.appendChild(content);

      return article;
    }

    function selectedProductInKit() {
      if (!selectedJacket) return false;
      return getKitItems().some(item => item.dataset.kitProductId === selectedJacket.id);
    }

    function syncProductAddState() {
      if (!productAddButton || !productAddIcon) return;

      const isAdded = selectedProductInKit();
      productAddButton.classList.toggle('is-added', isAdded);
      productAddButton.setAttribute('aria-label', isAdded ? 'Товар уже в комплекте' : 'Добавить товар в комплект');
      productAddIcon.setAttribute('href', spriteHref(isAdded ? 'icon-kit-check' : 'icon-rec-plus'));
    }

    function addProductToKit(product) {
      if (!product || !kitList) return;

      const slot = product.slot || product.category || 'product';
      const kitItem = createKitItem(product);
      const currentItem = getKitItems().find(item => item.dataset.kitSlot === slot);
      const emptySlot = Array.from(kitList.querySelectorAll('.build-kit-desktop__kit-item--empty')).find(item => item.dataset.kitSlot === slot);

      if (currentItem) {
        currentItem.replaceWith(kitItem);
      } else if (emptySlot) {
        emptySlot.replaceWith(kitItem);
      } else {
        kitList.appendChild(kitItem);
      }

      updateKitSummary();
      syncProductAddState();
    }

    allTiles.forEach(tile => {
      tile.addEventListener('click', () => {
        if (!desktopQuery.matches) return;
        allTiles.forEach(item => item.classList.remove('is-active'));
        tile.classList.add('is-active');
        updateSelectedJacket(getTileProduct(tile));
      });
    });

    kitList?.addEventListener('click', event => {
      const emptyButton = event.target.closest('.build-kit-desktop__kit-item--empty');
      if (emptyButton) {
        const slot = emptyButton.dataset.kitSlot;
        if (slot) activateCategory(slot);
        return;
      }

      const removeButton = event.target.closest('.build-kit-desktop__remove');
      if (!removeButton) return;

      const item = removeButton.closest('.build-kit-desktop__kit-item');
      const slot = item?.dataset.kitSlot || '';
      const fallbackLabel = getSlotLabel(slot);

      item?.replaceWith(createEmptyKitSlot(fallbackLabel, slot));
      updateKitSummary();
      syncProductAddState();
    });

    productAddButton?.addEventListener('click', event => {
      event.preventDefault();
      addProductToKit(selectedJacket);
    });

    btnPrev?.addEventListener('click', () => updatePage(page - 1));
    btnNext?.addEventListener('click', () => updatePage(page + 1));
    desktopQuery.addEventListener('change', () => {
      syncDesktopCarousel();
    });
    syncDesktopCarousel();
    updateKitSummary();
    syncProductAddState();
  });

  // Product page — description modal
  document.querySelectorAll('[data-product-description-modal]').forEach(modal => {
    const openButtons = document.querySelectorAll('[data-product-description-open]');
    const closeButtons = modal.querySelectorAll('[data-product-description-close]');
    const closeButton = modal.querySelector('.product-description-modal__close');
    let closeTimer = 0;

    function openModal(event) {
      event?.preventDefault();
      window.clearTimeout(closeTimer);
      modal.hidden = false;
      document.documentElement.classList.add('is-modal-open');
      window.requestAnimationFrame(() => {
        modal.classList.add('is-open');
        closeButton?.focus();
      });
    }

    function closeModal() {
      modal.classList.remove('is-open');
      document.documentElement.classList.remove('is-modal-open');
      closeTimer = window.setTimeout(() => {
        modal.hidden = true;
      }, 200);
    }

    openButtons.forEach(button => button.addEventListener('click', openModal));
    closeButtons.forEach(button => button.addEventListener('click', closeModal));

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !modal.hidden) closeModal();
    });
  });

  // Product page — upload review modal
  document.querySelectorAll('[data-product-upload-modal]').forEach(modal => {
    const openButtons = document.querySelectorAll('[data-product-conditions-upload-open]');
    const closeButtons = modal.querySelectorAll('[data-product-upload-close]');
    const closeButton = modal.querySelector('.product-upload-modal__close');
    const title = modal.querySelector('.product-upload-modal__title');
    const lead = modal.querySelector('.product-upload-modal__lead');
    const dropzone = modal.querySelector('[data-product-upload-dropzone]');
    const fileButton = modal.querySelector('[data-product-upload-file-button]');
    const fileButtonText = fileButton?.querySelector('span');
    const submitButton = modal.querySelector('[data-product-upload-submit]');
    const defaultTitle = title?.textContent || '';
    const defaultLead = lead?.textContent || '';
    let closeTimer = 0;

    function resetModalState() {
      modal.classList.remove('is-success');
      dropzone?.classList.remove('is-filled');
      if (title) title.textContent = defaultTitle;
      if (lead) lead.textContent = defaultLead;
      if (fileButtonText) fileButtonText.textContent = 'Загрузить файлы';
    }

    function openModal(event) {
      event?.preventDefault();
      window.clearTimeout(closeTimer);
      resetModalState();
      modal.hidden = false;
      document.documentElement.classList.add('is-modal-open');
      window.requestAnimationFrame(() => {
        modal.classList.add('is-open');
        closeButton?.focus({ preventScroll: true });
      });
    }

    function closeModal() {
      modal.classList.remove('is-open');
      document.documentElement.classList.remove('is-modal-open');
      closeTimer = window.setTimeout(() => {
        modal.hidden = true;
      }, 200);
    }

    openButtons.forEach(button => button.addEventListener('click', openModal));
    closeButtons.forEach(button => button.addEventListener('click', closeModal));
    fileButton?.addEventListener('click', () => {
      dropzone?.classList.add('is-filled');
      if (fileButtonText) fileButtonText.textContent = 'Загрузить ещё';
    });
    submitButton?.addEventListener('click', () => {
      modal.classList.add('is-success');
      if (title) title.textContent = 'Изображения отправлены';
      if (lead) lead.textContent = 'Спасибо!\nВ ближайшее время мы сообщим о публикации';
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !modal.hidden) closeModal();
    });
  });

  // Product page — color picker
  document.querySelectorAll('.product-option--color-picker').forEach(option => {
    const trigger   = option.querySelector('.product-option__color');
    const dropdown  = option.querySelector('.product-option__color-dropdown');
    const swatch    = option.querySelector('.product-option__color-swatch');
    const nameEl    = option.querySelector('.product-option__color-name');
    const section   = option.closest('.product-detail');
    const page      = option.closest('.product-page');

    if (!trigger || !dropdown) return;

    // Инициализируем начальное состояние из первого is-selected
    function applyColor(item) {
      const color   = item.dataset.color;
      const name    = item.dataset.name;
      const inStock = item.dataset.inStock === 'true';

      // Обновляем свотч в кнопке
      if (color === 'bw') {
        swatch.innerHTML = `<svg aria-hidden="true"><use href="/images/icons/sprite.svg#icon-color-bw"></use></svg>`;
        swatch.style.background = 'none';
        swatch.style.borderRadius = '0';
      } else {
        swatch.innerHTML = '';
        swatch.style.background = color;
        swatch.style.borderRadius = '24px';
      }

      // Обновляем название
      nameEl.textContent = name;
      nameEl.title = name;
      // Градиент только если текст обрезается
      requestAnimationFrame(() => {
        nameEl.classList.toggle('is-truncated', nameEl.scrollWidth > nameEl.clientWidth);
      });

      // Переключаем OOS-состояние
      section.classList.toggle('product-detail--oos', !inStock);
      page?.classList.toggle('product-page--oos', !inStock);

      // Отмечаем is-selected
      dropdown.querySelectorAll('.product-option__color-item').forEach(i => {
        i.classList.toggle('is-selected', i === item);
        i.setAttribute('aria-selected', i === item ? 'true' : 'false');
      });
    }

    // Применяем начальное состояние
    const initial = dropdown.querySelector('.product-option__color-item.is-selected')
                 || dropdown.querySelector('.product-option__color-item');
    if (initial) applyColor(initial);

    // Открыть / закрыть дропдаун
    trigger.addEventListener('click', () => {
      const isOpen = !dropdown.hidden;
      dropdown.hidden = isOpen;
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });

    // Выбор цвета
    dropdown.addEventListener('click', e => {
      const item = e.target.closest('.product-option__color-item');
      if (!item) return;
      applyColor(item);
      dropdown.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    });

    // Закрыть при клике вне
    document.addEventListener('click', e => {
      if (!option.contains(e.target)) {
        dropdown.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Product page — size selector
  document.querySelectorAll('.product-option--sizes .product-option__sizes').forEach(group => {
    group.addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn || btn.disabled) return;
      group.querySelectorAll('button').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });

  // Похожие товары — бесконечная карусель
  document.querySelectorAll('.product-similar').forEach(section => {
    const container = section.querySelector('.product-similar__cards');
    const prevBtn   = section.querySelector('[aria-label="Предыдущие"]');
    const nextBtn   = section.querySelector('[aria-label="Следующие"]');
    if (!container || !prevBtn || !nextBtn) return;

    const VISIBLE = 2;
    const GAP     = 8;

    // Реальные карточки
    const realCards = [...container.querySelectorAll('.product-similar__card')];
    const totalPages = Math.ceil(realCards.length / VISIBLE);

    // Создаём трек
    const track = document.createElement('div');
    track.className = 'product-similar__track';
    container.innerHTML = '';
    container.appendChild(track);

    // Клоны последней страницы в начало (для prev с первой страницы)
    realCards.slice(-VISIBLE).forEach(c => {
      const cl = c.cloneNode(true);
      cl.setAttribute('aria-hidden', 'true');
      track.appendChild(cl);
    });
    // Реальные карточки
    realCards.forEach(c => track.appendChild(c));
    // Клоны первой страницы в конец (для next с последней страницы)
    realCards.slice(0, VISIBLE).forEach(c => {
      const cl = c.cloneNode(true);
      cl.setAttribute('aria-hidden', 'true');
      track.appendChild(cl);
    });

    // Начинаем с индекса 1 — первая реальная страница
    let idx         = 1;
    let isAnimating = false;

    function measure() {
      // Возвращает ширину контейнера — 0 если скрыт
      return container.offsetWidth;
    }

    function layout() {
      const W = measure();
      if (W === 0) return; // скрыт, ResizeObserver вызовет нас позже
      const cw = (W - GAP * (VISIBLE - 1)) / VISIBLE;
      const pw = W + GAP; // ширина одного «слота» = контейнер + межкарточный gap
      track.querySelectorAll('.product-similar__card').forEach(c => {
        c.style.width      = cw + 'px';
        c.style.flexShrink = '0';
      });
      // Перепозиционируем без анимации (ширина могла измениться)
      track.style.transition = 'none';
      track.style.transform  = `translateX(${-idx * pw}px)`;
      // Сохраняем pw для кликов
      track._pw = pw;
    }

    function moveTo(i, animate) {
      track.style.transition = animate
        ? 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        : 'none';
      track.style.transform = `translateX(${-i * (track._pw || measure() + GAP)}px)`;
    }

    track.addEventListener('transitionend', () => {
      if (idx === totalPages + 1) { idx = 1; moveTo(idx, false); }
      else if (idx === 0)          { idx = totalPages; moveTo(idx, false); }
      isAnimating = false;
    });

    prevBtn.disabled = false;
    nextBtn.disabled = false;

    prevBtn.addEventListener('click', () => {
      if (isAnimating) return;
      isAnimating = true;
      moveTo(--idx, true);
    });

    nextBtn.addEventListener('click', () => {
      if (isAnimating) return;
      isAnimating = true;
      moveTo(++idx, true);
    });

    // ResizeObserver срабатывает и при первом появлении секции (OOS), и при ресайзе окна
    new ResizeObserver(() => layout()).observe(container);
  });

  // Product page — "В реальных условиях" slider
  document.querySelectorAll('[data-product-conditions]').forEach(section => {
    const viewport = section.querySelector('.product-conditions__viewport');
    const track = section.querySelector('.product-conditions__track');
    const prevButton = section.querySelector('[data-product-conditions-prev]');
    const nextButton = section.querySelector('[data-product-conditions-next]');
    const slides = Array.from(section.querySelectorAll('.product-conditions__upload-card, .product-conditions__slide'));

    if (!viewport || !track || !prevButton || !nextButton || slides.length < 2) return;

    let index = 0;
    let maxIndex = 0;
    let step = 0;

    function readGap() {
      const styles = window.getComputedStyle(track);
      return parseFloat(styles.columnGap || styles.gap) || 0;
    }

    function measure() {
      const firstSlide = slides[0];
      const slideWidth = firstSlide.getBoundingClientRect().width;
      step = slideWidth + readGap();
      const overflow = Math.max(0, track.scrollWidth - viewport.clientWidth);
      maxIndex = step > 0 ? Math.ceil(overflow / step) : 0;
      index = Math.min(index, maxIndex);
      update(false);
    }

    function update(animate = true) {
      const overflow = Math.max(0, track.scrollWidth - viewport.clientWidth);
      const offset = Math.min(index * step, overflow);
      track.style.transition = animate ? 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none';
      track.style.transform = `translateX(${-offset}px)`;
      prevButton.disabled = index <= 0;
      nextButton.disabled = index >= maxIndex;
    }

    prevButton.addEventListener('click', () => {
      index = Math.max(0, index - 1);
      update();
    });

    nextButton.addEventListener('click', () => {
      index = Math.min(maxIndex, index + 1);
      update();
    });

    new ResizeObserver(measure).observe(viewport);
    window.addEventListener('load', measure);
    measure();
  });

  // OOS form — кнопка «Связаться» задизейблена пока email не введён
  document.querySelectorAll('.product-oos-form').forEach(form => {
    const input = form.querySelector('.product-oos-form__input');
    const btn   = form.querySelector('button');
    if (!input || !btn) return;

    btn.disabled = true;

    input.addEventListener('input', () => {
      btn.disabled = input.value.trim() === '';
    });
  });

  // Product page — характеристики и преимущества (горизонтальный слайдер)
  document.querySelectorAll('.product-props').forEach(section => {
    const track = section.querySelector('.product-props__track');
    const btnPrev = section.querySelector('.product-props__btn[aria-label="Назад"]');
    const btnNext = section.querySelector('.product-props__btn[aria-label="Вперёд"]');

    if (!track || !btnPrev || !btnNext) return;

    const ITEM_W = 250; // ширина одного слайда
    const SCROLL_STEP = ITEM_W * 3; // скроллим по 3 слайда за клик

    const updateButtons = () => {
      btnPrev.disabled = track.scrollLeft <= 0;
      btnNext.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
    };

    btnPrev.addEventListener('click', () => {
      track.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' });
    });

    btnNext.addEventListener('click', () => {
      track.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' });
    });

    track.addEventListener('scroll', updateButtons, { passive: true });
    updateButtons();
  });

  // ── Product page — отзывы ─────────────────────────────────────────────────

  // Сортировка: toggle дропдауна
  document.querySelectorAll('[data-reviews-sort]').forEach(wrap => {
    const btn  = wrap.querySelector('[data-reviews-sort-btn]');
    const menu = wrap.querySelector('.product-reviews__sort-dropdown');
    if (!btn || !menu) return;

    const close = () => {
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    };

    btn.addEventListener('click', e => {
      e.stopPropagation();
      const open = menu.hidden;
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
    });

    menu.querySelectorAll('button').forEach(opt => {
      opt.addEventListener('click', () => {
        menu.querySelectorAll('button').forEach(o => o.removeAttribute('aria-selected'));
        opt.setAttribute('aria-selected', 'true');
        wrap.querySelector('.product-reviews__sort-label').textContent = opt.textContent.trim();
        close();
      });
    });

    document.addEventListener('click', close);
  });

  // Форма: кликабельные звёзды-эллипсы
  document.querySelectorAll('[data-reviews-form-stars]').forEach(starsEl => {
    const stars  = [...starsEl.querySelectorAll('.product-reviews__form-star')];
    const numEl  = starsEl.closest('[data-reviews-form]')
                          ?.querySelector('[data-reviews-rating-num]');

    const setRating = value => {
      stars.forEach(s => {
        s.classList.toggle('is-active', Number(s.dataset.value) <= value);
      });
      if (numEl) numEl.textContent = value;
    };

    // Инициализируем из начального состояния (4 активных)
    const initialActive = stars.filter(s => s.classList.contains('is-active'));
    if (initialActive.length && numEl) numEl.textContent = initialActive.length;

    stars.forEach(star => {
      star.addEventListener('click', () => setRating(Number(star.dataset.value)));

      // Hover preview
      star.addEventListener('mouseenter', () => {
        stars.forEach(s => {
          s.style.background = Number(s.dataset.value) <= Number(star.dataset.value)
            ? '' // вернёт к is-active или дефолту через CSS
            : '';
        });
      });
    });
  });

  // Показать ещё отзывы
  document.querySelectorAll('[data-reviews-load-more]').forEach(btn => {
    const extra = btn.closest('[data-reviews-list]')
                    ?.querySelector('[data-reviews-extra]');
    if (!extra) return;

    btn.addEventListener('click', () => {
      extra.hidden = false;
      btn.hidden = true;
      // скрываем и финальный разделитель перед кнопкой, если нужно
    });
  });

  // Соответствие размеру
  document.querySelectorAll('[data-reviews-fit]').forEach(group => {
    const btns = [...group.querySelectorAll('.product-reviews__fit-btn')];
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('product-reviews__fit-btn--active'));
        btn.classList.add('product-reviews__fit-btn--active');
      });
    });
  });

  // ── Product page — переключение kit-items (desktop + mobile) ────────────
  // Находим все контейнеры с [data-kit-switch] (product-info-section и product-store-info).
  // Для каждого: клик на item → is-active на нём, обновляем title/article/desc
  // в ближайшем элементе с совпадающим data-kit-section.
  document.querySelectorAll('[data-kit-switch]').forEach(switchEl => {
    const sectionKey = switchEl.dataset.kitSection;
    const items = [...switchEl.querySelectorAll('[data-kit-item]')];

    // Ищем текстовый контейнер: тот же data-kit-section, но НЕ сам switchEl.
    // Атрибуты data-kit-title/article/desc — на дочерних элементах внутри контейнера.
    const textContainer = document.querySelector(
      `[data-kit-section="${sectionKey}"]:not([data-kit-switch])`
    );

    items.forEach(item => {
      item.addEventListener('click', () => {
        // Снимаем active со всех
        items.forEach(i => i.classList.remove('is-active'));
        item.classList.add('is-active');

        if (!textContainer) return;

        // Обновляем текст если есть данные
        const titleEl   = textContainer.querySelector('[data-kit-title]');
        const articleEl = textContainer.querySelector('[data-kit-article]');
        const descEl    = textContainer.querySelector('[data-kit-desc]');

        if (titleEl   && item.dataset.title)   titleEl.textContent   = item.dataset.title;
        if (articleEl && item.dataset.article) articleEl.textContent = item.dataset.article;
        if (descEl    && item.dataset.desc)    descEl.textContent    = item.dataset.desc;
      });
    });
  });

  // ── Product page — форма отзыва (mobile bottom sheet) ────────────────────
  const reviewsRight = document.querySelector('.product-reviews__right');

  const openReviewForm = () => {
    if (!reviewsRight) return;
    reviewsRight.classList.add('is-open');
    document.documentElement.classList.add('is-modal-open');
  };

  const closeReviewForm = () => {
    if (!reviewsRight) return;
    reviewsRight.classList.remove('is-open');
    document.documentElement.classList.remove('is-modal-open');
  };

  // Открытие по кнопке «Отправить отзыв» (mobile)
  document.querySelectorAll('[data-reviews-form-open]').forEach(btn => {
    btn.addEventListener('click', openReviewForm);
  });

  // Закрытие по крестику внутри формы
  document.querySelectorAll('[data-reviews-form-close]').forEach(btn => {
    btn.addEventListener('click', closeReviewForm);
  });

  // Закрытие по клику на backdrop (область вне панели формы)
  reviewsRight?.addEventListener('click', e => {
    if (e.target === reviewsRight) closeReviewForm();
  });

  // Закрытие по Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && reviewsRight?.classList.contains('is-open')) {
      closeReviewForm();
    }
  });

  // ── Product page — аккордеон product-specs (мобильный) ──────────────────
  // На десктопе панели всегда видны (display: contents в CSS).
  // На мобиле клик по кнопке тоглит is-open на панели и aria-expanded на кнопке.
  document.querySelectorAll('[data-specs-accordion-btn]').forEach(btn => {
    const parent = btn.parentElement;
    const panel  = parent?.querySelector('[data-specs-accordion-panel]');
    if (!panel) return;

    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      panel.classList.toggle('is-open', !expanded);
    });
  });

  // ── Product page — раскрытие характеристик
  document.querySelectorAll('[data-product-specs-expand]').forEach(btn => {
    const table = btn.closest('[data-product-specs-table]');
    if (!table) return;

    btn.addEventListener('click', () => {
      const expanded = table.classList.toggle('is-expanded');
      btn.setAttribute('aria-expanded', String(expanded));
      btn.querySelector('.product-specs__expand-label').textContent = expanded
        ? 'Свернуть характеристики'
        : 'Развернуть все характеристики';
    });
  });

  // Product page — media carousel
  document.querySelectorAll('.product-detail__media').forEach(media => {
    const mainImage = media.querySelector('.product-detail__image');
    const carousel = media.querySelector('.product-media-carousel');
    const inner = media.querySelector('.product-media-carousel__inner');
    const items = [...media.querySelectorAll('.product-media-carousel__item')];
    const btnPrev = media.querySelector('.product-media-btn--prev');
    const btnNext = media.querySelector('.product-media-btn--next');

    if (!inner || !items.length) return;

    let currentIndex = 0;

    function getMetrics() {
      const firstItem = items[0];
      const styles = window.getComputedStyle(inner);
      const gap = parseFloat(styles.columnGap || styles.gap) || 0;
      const itemWidth = firstItem?.getBoundingClientRect().width || 0;
      const viewport = carousel?.clientWidth || inner.parentElement?.clientWidth || 0;
      return { gap, itemWidth, viewport };
    }

    function goTo(index) {
      const count = items.length;
      currentIndex = (index + count) % count;

      items.forEach((item, i) => item.classList.toggle('is-active', i === currentIndex));

      // Switch main image
      if (mainImage) {
        const thumb = items[currentIndex].querySelector('img');
        if (thumb) {
          const nextSrc = thumb.getAttribute('src') || thumb.src;
          const nextSrcset = thumb.getAttribute('srcset') || getResponsiveSrcset(nextSrc);

          mainImage.src = nextSrc;
          mainImage.srcset = nextSrcset;
        }
      }

      // Translate inner strip so the active thumb is centered in the visible viewport.
      const { gap, itemWidth, viewport } = getMetrics();
      const activeCenter = currentIndex * (itemWidth + gap) + itemWidth / 2;
      const trackWidth = items.length * itemWidth + Math.max(0, items.length - 1) * gap;
      const offset = Math.min(0, Math.max(
        -(trackWidth - viewport),
        viewport / 2 - activeCenter
      ));
      inner.style.transform = `translateX(${offset}px)`;
    }

    items.forEach((item, i) => item.addEventListener('click', () => goTo(i)));
    btnPrev?.addEventListener('click', () => goTo(currentIndex - 1));
    btnNext?.addEventListener('click', () => goTo(currentIndex + 1));

    let touchStartX = 0;
    let touchStartY = 0;

    media.addEventListener('touchstart', event => {
      const touch = event.changedTouches[0];
      if (!touch) return;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }, { passive: true });

    media.addEventListener('touchend', event => {
      const touch = event.changedTouches[0];
      if (!touch) return;

      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;

      if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY)) return;
      goTo(deltaX < 0 ? currentIndex + 1 : currentIndex - 1);
    }, { passive: true });

    goTo(0);
    new ResizeObserver(() => goTo(currentIndex)).observe(media);
  });

  // Product mobile sticky buy panel appears only after the full price block is scrolled past.
  document.querySelectorAll('.product-mobile-buy').forEach(panel => {
    const productBuy = document.querySelector('.product-buy');
    const mobileQuery = window.matchMedia('(max-width: 767px)');

    if (!productBuy) return;

    const syncMobileBuyPanel = () => {
      const isProductBuyVisible = productBuy.offsetParent !== null && getComputedStyle(productBuy).display !== 'none';
      const shouldShow = mobileQuery.matches && isProductBuyVisible && productBuy.getBoundingClientRect().bottom <= 64;
      panel.classList.toggle('is-visible', shouldShow);
      panel.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
    };

    window.addEventListener('scroll', syncMobileBuyPanel, { passive: true });
    window.addEventListener('resize', syncMobileBuyPanel);
    mobileQuery.addEventListener('change', syncMobileBuyPanel);
    syncMobileBuyPanel();
  });

  // Journal stories modal
  document.querySelectorAll('[data-stories-modal]').forEach(modal => {
    const openButtons = document.querySelectorAll('[data-stories-open]');
    const closeButtons = modal.querySelectorAll('[data-stories-close]');
    const prevButton = modal.querySelector('[data-stories-prev]');
    const nextButton = modal.querySelector('[data-stories-next]');
    const muteButton = modal.querySelector('[data-stories-mute]');
    const slides = Array.from(modal.querySelectorAll('.stories-modal__slide'));
    const videos = Array.from(modal.querySelectorAll('video.stories-modal__slide'));
    const progressItems = Array.from(modal.querySelectorAll('.stories-modal__progress-item'));
    const sidePrev = modal.querySelector('[data-stories-side-prev]');
    const sideNext = modal.querySelector('[data-stories-side-next]');
    const sideFarPrev = modal.querySelector('[data-stories-side-far-prev]');
    const sideFarNext = modal.querySelector('[data-stories-side-far-next]');
    let activeIndex = 0;
    let autoplayId = 0;
    let isMuted = false;

    if (!slides.length) return;

    function stopAutoplay() {
      window.clearTimeout(autoplayId);
      autoplayId = 0;
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayId = window.setTimeout(() => goTo(activeIndex + 1), 5000);
    }

    function goTo(index) {
      activeIndex = (index + slides.length) % slides.length;
      const activeSlide = slides[activeIndex];

      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        slide.classList.toggle('is-active', isActive);

        if (slide instanceof HTMLVideoElement) {
          slide.muted = isMuted;

          if (isActive) {
            slide.currentTime = 0;
            slide.play().catch(() => {});
          } else {
            slide.pause();
          }
        }
      });

      [
        [sidePrev, activeSlide?.dataset.sidePrev],
        [sideNext, activeSlide?.dataset.sideNext],
        [sideFarPrev, activeSlide?.dataset.sideFarPrev],
        [sideFarNext, activeSlide?.dataset.sideFarNext],
      ].forEach(([preview, previewSrc]) => {
        if (!preview || !previewSrc) return;
        const src = resolvePublicAsset(previewSrc);
        preview.setAttribute('src', src);
        preview.setAttribute('srcset', getResponsiveSrcset(previewSrc));
      });

      progressItems.forEach((item, itemIndex) => {
        item.classList.toggle('is-filled', itemIndex < activeIndex);
        item.classList.toggle('is-active', itemIndex === activeIndex);
        const bar = item.querySelector('span');
        if (bar) {
          bar.style.animation = 'none';
          void bar.offsetWidth;
          bar.style.animation = '';
        }
      });

      startAutoplay();
    }

    function openStories(event) {
      event.preventDefault();
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('is-modal-open');
      goTo(0);
    }

    function closeStories() {
      stopAutoplay();
      videos.forEach(video => video.pause());
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('is-modal-open');
    }

    openButtons.forEach(button => button.addEventListener('click', openStories));
    closeButtons.forEach(button => button.addEventListener('click', closeStories));
    prevButton?.addEventListener('click', () => goTo(activeIndex - 1));
    nextButton?.addEventListener('click', () => goTo(activeIndex + 1));
    muteButton?.addEventListener('click', () => {
      isMuted = !isMuted;
      videos.forEach(video => {
        video.muted = isMuted;
      });
      muteButton.classList.toggle('is-muted', isMuted);
      muteButton.setAttribute('aria-label', isMuted ? 'Включить звук' : 'Выключить звук');
    });

    document.addEventListener('keydown', event => {
      if (modal.hidden) return;

      if (event.key === 'Escape') closeStories();
      if (event.key === 'ArrowLeft') goTo(activeIndex - 1);
      if (event.key === 'ArrowRight') goTo(activeIndex + 1);
    });
  });

});
