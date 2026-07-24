import { resolvePublicAsset, spriteHref } from './utils.js';

export function init() {
  const catalogDropdownButtons = Array.from(document.querySelectorAll(
    '.catalog-toolbar__button[aria-expanded], .catalog-toolbar__chip[aria-expanded]'
  ));
  const catalogProducts = document.querySelector('.catalog-products');
  const catalogLoading = catalogProducts?.querySelector('.catalog-products__loading');
  const catalogEmptyState = document.querySelector('[data-catalog-empty-state]');
  const catalogFilterEmptyState = document.querySelector('[data-catalog-filter-empty-state]');
  const catalogEmptyReset = catalogFilterEmptyState?.querySelector('[data-catalog-empty-reset]');
  const catalogEmptyRecommendations = document.querySelector('[data-catalog-empty-recommendations]');
  const catalogGrid = catalogProducts?.querySelector('[data-catalog-grid]');
  const catalogLoadMore = catalogProducts?.querySelector('[data-load-more]');
  const catalogPagination = catalogProducts?.querySelector('.catalog-pagination');
  const catalogFilterModal = document.querySelector('[data-catalog-filter-modal]');
  const catalogFilterOpenButton = document.querySelector('[data-filter-toggle]');
  const catalogFilterForm = catalogFilterModal?.querySelector('[data-catalog-filter-form]');
  const catalogFilterBody = catalogFilterModal?.querySelector('.catalog-filter-modal__body');
  const catalogFilterContent = catalogFilterModal?.querySelector('.catalog-filter-modal__content');
  const catalogFilterScrollbar = catalogFilterModal?.querySelector('[data-catalog-filter-scrollbar]');
  const catalogFilterScrollbarThumb = catalogFilterModal?.querySelector('[data-catalog-filter-scrollbar-thumb]');
  const catalogFilterCloseButtons = catalogFilterModal
    ? Array.from(catalogFilterModal.querySelectorAll('[data-catalog-filter-close]'))
    : [];
  let catalogLoadingTimer;

  const demoState = new URLSearchParams(window.location.search).get('demo-state');
  if (demoState === 'empty-category' && catalogProducts && catalogEmptyState) {
    catalogProducts.hidden = true;
    catalogEmptyState.hidden = false;
    if (catalogEmptyRecommendations) catalogEmptyRecommendations.hidden = false;
  }

  if (demoState === 'empty-filter-results' && catalogProducts && catalogFilterEmptyState) {
    catalogFilterEmptyState.hidden = false;
    if (catalogGrid) catalogGrid.hidden = true;
    if (catalogLoadMore) catalogLoadMore.hidden = true;
    if (catalogPagination) catalogPagination.hidden = true;
    if (catalogEmptyRecommendations) catalogEmptyRecommendations.hidden = false;

    const pricePopup = document.querySelector('[data-filter-popup="price"]');
    const priceInputs = pricePopup?.querySelectorAll('.catalog-filter-popup__price-input');
    if (priceInputs?.length >= 2) {
      priceInputs[0].value = '399';
      priceInputs[1].value = '167 939';
    }

    const typePopup = document.querySelector('[data-filter-popup="type"]');
    Array.from(typePopup?.querySelectorAll('.catalog-filter-popup__label') || [])
      .slice(0, 2)
      .forEach(label => {
        const input = label.querySelector('input[type="checkbox"]');
        const checkbox = label.querySelector('.catalog-filter-popup__checkbox');
        if (input) input.checked = true;
        checkbox?.classList.add('is-checked');
        checkbox?.setAttribute('aria-checked', 'true');
      });
  }

  initCatalogProductImageFallbacks(catalogGrid, demoState);

  catalogEmptyReset?.addEventListener('click', () => {
    document.querySelectorAll('.catalog-toolbar__chip.is-active .catalog-toolbar__chip-reset')
      .forEach(reset => reset.click());

    catalogFilterEmptyState.hidden = true;
    if (catalogGrid) catalogGrid.hidden = false;
    if (catalogLoadMore) catalogLoadMore.hidden = false;
    if (catalogPagination) catalogPagination.hidden = false;
    if (catalogEmptyRecommendations) catalogEmptyRecommendations.hidden = true;

    const url = new URL(window.location.href);
    url.searchParams.delete('demo-state');
    window.history.replaceState({}, '', url);
    catalogProducts?.dispatchEvent(new CustomEvent('catalog:filters-reset', { bubbles: true }));
  });

  const priceRanges = Array.from(document.querySelectorAll(
    '.catalog-filter-popup__price-row, .catalog-filter-modal__price-row'
  ));

  const parsePrice = input => {
    const digits = input?.value.replace(/\D/g, '') || '';
    return digits ? Number(digits) : null;
  };

  const formatPrice = value => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  const normalizePriceRange = range => {
    const inputs = range?.querySelectorAll('input');
    if (!inputs || inputs.length < 2) return;

    const [fromInput, toInput] = inputs;
    const from = parsePrice(fromInput);
    let to = parsePrice(toInput);

    if (from !== null) fromInput.value = formatPrice(from);
    if (to !== null && from !== null && to < from) {
      to = from;
    }
    if (to !== null) toInput.value = formatPrice(to);
  };

  priceRanges.forEach(range => {
    range.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '');
      });
      input.addEventListener('blur', () => normalizePriceRange(range));
    });
  });

  document.addEventListener('click', event => {
    const applyButton = event.target.closest('.catalog-filter-popup__apply');
    if (!applyButton) return;
    normalizePriceRange(applyButton.closest('.catalog-filter-popup')?.querySelector('.catalog-filter-popup__price-row'));
  }, true);

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

  const updateCatalogFilterScrollbar = () => {
    if (!catalogFilterBody || !catalogFilterContent || !catalogFilterScrollbar || !catalogFilterScrollbarThumb) return;

    const { scrollTop, scrollHeight, clientHeight } = catalogFilterContent;
    const hasOverflow = scrollHeight > clientHeight + 1;
    catalogFilterBody.classList.toggle('has-scrollbar', hasOverflow);

    if (!hasOverflow) {
      catalogFilterScrollbar.hidden = true;
      catalogFilterContent.scrollTop = 0;
      return;
    }

    catalogFilterScrollbar.hidden = false;
    const trackHeight = catalogFilterScrollbar.clientHeight;
    const maxScroll = scrollHeight - clientHeight;
    const ratio = clientHeight / scrollHeight;
    const thumbHeight = Math.max(16, Math.round(ratio * trackHeight));
    const maxOffset = Math.max(0, trackHeight - thumbHeight - 4);
    const thumbY = Math.round((scrollTop / maxScroll) * maxOffset);

    catalogFilterScrollbarThumb.style.setProperty('--catalog-filter-modal-scrollbar-thumb-h', `${thumbHeight}px`);
    catalogFilterScrollbarThumb.style.setProperty('--catalog-filter-modal-scrollbar-thumb-y', `${thumbY}px`);
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
    window.requestAnimationFrame(updateCatalogFilterScrollbar);
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
  catalogFilterModal?.querySelectorAll('[data-filter-collapse]').forEach(section => {
    const button = section.querySelector('[data-filter-collapse-toggle]');
    const label = button?.querySelector('span');
    if (!button || !label) return;

    button.addEventListener('click', () => {
      const isExpanded = section.classList.toggle('is-expanded');
      button.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      label.textContent = isExpanded ? 'Свернуть' : 'Показать все';
      window.requestAnimationFrame(updateCatalogFilterScrollbar);
    });
  });

  catalogFilterContent?.addEventListener('scroll', updateCatalogFilterScrollbar, { passive: true });
  window.addEventListener('resize', updateCatalogFilterScrollbar);

  catalogFilterForm?.addEventListener('submit', event => {
    event.preventDefault();
    catalogFilterForm.querySelectorAll('.catalog-filter-modal__price-row').forEach(normalizePriceRange);
    closeCatalogFilterModal();
    showCatalogLoading();
  });

  document.querySelector('[data-load-more]')?.addEventListener('click', showCatalogLoading);

  // Пагинация
  const pagination = catalogPagination;
  const grid = catalogGrid;
  if (pagination && grid) initPagination(pagination, grid);
}

function initCatalogProductImageFallbacks(grid, demoState) {
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.catalog-product-card'));

  const showFallback = (card, variant = 'camera') => {
    const imageLink = card?.querySelector('.recommendation-card__image-link');
    if (!imageLink || imageLink.classList.contains('is-image-unavailable')) return;

    const fallback = document.createElement('span');
    fallback.className = `recommendation-card__image-fallback recommendation-card__image-fallback--${variant}`;
    fallback.setAttribute('role', 'img');
    fallback.setAttribute('aria-label', 'Изображение товара недоступно');

    if (variant === 'brand') {
      const logo = document.createElement('img');
      logo.className = 'recommendation-card__image-fallback-logo';
      logo.src = resolvePublicAsset('/images/content/catalog/product-image-fallback-logo.png');
      logo.alt = '';
      logo.width = 220;
      logo.height = 39;
      fallback.append(logo);
    } else {
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      icon.classList.add('recommendation-card__image-fallback-icon');
      icon.setAttribute('aria-hidden', 'true');
      icon.setAttribute('viewBox', '0 0 36 36');
      icon.setAttribute('focusable', 'false');
      use.setAttribute('href', spriteHref('icon-product-image-unavailable'));
      icon.append(use);

      const label = document.createElement('span');
      label.className = 'recommendation-card__image-fallback-label';
      label.textContent = 'Нет изображения';
      fallback.append(icon, label);
    }

    imageLink.replaceChildren(fallback);
    imageLink.classList.add('is-image-unavailable');
    card.classList.add('is-image-unavailable');
  };

  cards.forEach(card => {
    const image = card.querySelector('.recommendation-card__image');
    if (!image) return;

    const variant = image.dataset.imageFallback || card.dataset.imageFallback || 'camera';
    image.addEventListener('error', () => showFallback(card, variant), { once: true });

    if (image.complete && image.naturalWidth === 0) {
      showFallback(card, variant);
    }
  });

  if (demoState === 'image-fallbacks') {
    showFallback(cards[2], 'brand');
    showFallback(cards[5], 'camera');
  }
}

function getCardsPerPage() {
  if (window.innerWidth < 768) return 4;
  if (window.innerWidth < 1280) return 6;
  return 8;
}

function initPagination(pagination, grid) {
  let currentPage = 1;
  let loadedUpTo = 1; // сколько страниц накоплено через «Показать ещё»
  const allCards = Array.from(grid.querySelectorAll('.catalog-product-card'));
  const prevBtn = pagination.querySelector('.catalog-pagination__side--prev');
  const nextBtn = pagination.querySelector('.catalog-pagination__side--next');
  const pageLinks = Array.from(
    pagination.querySelectorAll('.catalog-pagination__page:not(.catalog-pagination__page--dots)')
  );
  const loadMoreBtn = document.querySelector('[data-load-more]');

  const updatePaginationState = (page, totalPages) => {
    const isFirst = page === 1;
    const isLast = page >= totalPages;
    prevBtn?.toggleAttribute('disabled', isFirst);
    prevBtn?.classList.toggle('is-disabled', isFirst);
    nextBtn?.toggleAttribute('disabled', isLast);
    nextBtn?.classList.toggle('is-disabled', isLast);

    pageLinks.forEach(link => {
      const num = parseInt(link.textContent.trim(), 10);
      const active = num === page;
      link.classList.toggle('is-active', active);
      active ? link.setAttribute('aria-current', 'page') : link.removeAttribute('aria-current');
    });
  };

  // Переключение страницы — заменяет текущий набор карточек
  const showPage = (page, scroll = true) => {
    const perPage = getCardsPerPage();
    const totalPages = Math.ceil(allCards.length / perPage);
    page = Math.max(1, Math.min(page, totalPages));
    currentPage = page;
    loadedUpTo = page; // сброс накопления при переходе на страницу

    const start = (page - 1) * perPage;
    const end = start + perPage;

    allCards.forEach((card, i) => {
      card.style.display = i >= start && i < end ? '' : 'none';
    });

    updatePaginationState(page, totalPages);
    updateLoadMore(page, totalPages);
    if (scroll) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // «Показать ещё» — накапливает карточки поверх текущих
  const loadMore = () => {
    const perPage = getCardsPerPage();
    const totalPages = Math.ceil(allCards.length / perPage);
    if (loadedUpTo >= totalPages) return;
    if (loadMoreBtn?.classList.contains('is-loading')) return;

    if (loadMoreBtn) {
      loadMoreBtn.classList.add('is-loading');
      loadMoreBtn.disabled = true;
    }

    setTimeout(() => {
      loadedUpTo += 1;
      const end = loadedUpTo * perPage;

      allCards.forEach((card, i) => {
        if (i < end) card.style.display = '';
      });

      updatePaginationState(loadedUpTo, totalPages);
      updateLoadMore(loadedUpTo, totalPages);

      if (loadMoreBtn) {
        loadMoreBtn.classList.remove('is-loading');
        loadMoreBtn.disabled = false;
      }
    }, 420);
  };

  const updateLoadMore = (page, totalPages) => {
    if (!loadMoreBtn) return;
    loadMoreBtn.style.display = page >= totalPages ? 'none' : '';
  };

  pageLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const num = parseInt(link.textContent.trim(), 10);
      if (!isNaN(num)) showPage(num);
    });
  });

  prevBtn?.addEventListener('click', () => showPage(currentPage - 1));
  nextBtn?.addEventListener('click', () => showPage(currentPage + 1));
  loadMoreBtn?.addEventListener('click', loadMore);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => showPage(currentPage, false), 150);
  });

  showPage(1, false);
}
