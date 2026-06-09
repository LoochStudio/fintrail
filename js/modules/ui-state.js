import { spriteHref } from './utils.js';

export function init() {
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
    const clear = field.querySelector('.js-input-clear');
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
}
