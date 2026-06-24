export function init() {
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

  // Пагинация
  const pagination = document.querySelector('.catalog-pagination');
  const grid = document.querySelector('[data-catalog-grid]');
  if (pagination && grid) initPagination(pagination, grid);
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
