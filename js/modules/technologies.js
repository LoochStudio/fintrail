const MOBILE_MEDIA = '(max-width: 767px)';

export function init() {
  const content = document.querySelector('[data-tech-content]');
  if (!content) return;

  const filters = Array.from(document.querySelectorAll('[data-tech-filter]'));
  const loadMoreWrap = document.querySelector('[data-tech-load-more-wrap]');
  const loadMoreBtn = loadMoreWrap?.querySelector('[data-tech-load-more]');
  const status = loadMoreWrap?.querySelector('[data-tech-status]');
  const mobileQuery = window.matchMedia(MOBILE_MEDIA);
  let currentCategory = filters.find(btn => btn.classList.contains('is-active'))?.dataset.filter || 'все';
  const photoCardOrigins = new WeakMap();
  const photoCardOrder = [];

  const setStatus = message => {
    if (status) status.textContent = message;
  };

  const isMobile = () => mobileQuery.matches;
  const getRows = () => Array.from(content.querySelectorAll('[data-tech-row]'));
  const getCards = () => Array.from(content.querySelectorAll('[data-tech-card]'));
  const getHiddenLazyNodes = () => Array.from(content.querySelectorAll('[data-tech-lazy].is-load-hidden'));

  const rememberPhotoCardOrigins = () => {
    content.querySelectorAll('.technologies-page__photo-row').forEach(row => {
      row.querySelectorAll('.technologies-page__photo-card').forEach(card => {
        if (photoCardOrigins.has(card)) return;
        photoCardOrigins.set(card, row);
        photoCardOrder.push(card);
      });
    });
  };

  const restorePhotoCardRows = () => {
    photoCardOrder.forEach(card => {
      photoCardOrigins.get(card)?.append(card);
    });
  };

  const groupFilteredPhotoCards = category => {
    if (category === 'все' || isMobile()) return;

    const visibleCards = photoCardOrder.filter(card => !card.classList.contains('is-hidden'));
    if (visibleCards.length < 2) return;

    const targetRow = photoCardOrigins.get(visibleCards[0]);
    visibleCards.forEach(card => targetRow?.append(card));
  };

  const setLoading = isLoading => {
    content.setAttribute('aria-busy', isLoading ? 'true' : 'false');
    if (!loadMoreBtn) return;
    loadMoreBtn.disabled = isLoading;
    loadMoreBtn.classList.toggle('is-loading', isLoading);
    loadMoreBtn.setAttribute('aria-busy', isLoading ? 'true' : 'false');
  };

  const updateStaticLoadMoreVisibility = () => {
    if (!loadMoreWrap || !loadMoreBtn) return;
    if (loadMoreBtn.dataset.techNextUrl) {
      loadMoreWrap.hidden = false;
      return;
    }

    loadMoreWrap.hidden = isMobile() ? getHiddenLazyNodes().length === 0 : false;
  };

  const normalizeDividers = () => {
    const children = Array.from(content.children);
    let prevRowVisible = false;

    children.forEach(el => {
      if (el.dataset.techRow !== undefined) {
        prevRowVisible = !el.classList.contains('is-hidden') && !(isMobile() && el.classList.contains('is-load-hidden'));
      } else if (el.dataset.techDivider !== undefined) {
        const loadHidden = isMobile() && el.classList.contains('is-load-hidden');
        el.classList.toggle('is-hidden', loadHidden || !prevRowVisible);
      }
    });

    let lastDivider = null;
    children.forEach(el => {
      const loadHidden = isMobile() && el.classList.contains('is-load-hidden');
      if (el.dataset.techDivider !== undefined && !el.classList.contains('is-hidden') && !loadHidden) {
        lastDivider = el;
      } else if (el.dataset.techRow !== undefined && !el.classList.contains('is-hidden') && !loadHidden) {
        lastDivider = null;
      }
    });

    if (lastDivider) lastDivider.classList.add('is-hidden');
  };

  const applyFilter = category => {
    currentCategory = category || 'все';
    rememberPhotoCardOrigins();
    restorePhotoCardRows();

    getCards().forEach(card => {
      const cardCategory = card.dataset.category || '';
      card.classList.toggle('is-hidden', currentCategory !== 'все' && cardCategory !== currentCategory);
    });

    groupFilteredPhotoCards(currentCategory);

    getRows().forEach(row => {
      const loadHidden = isMobile() && row.classList.contains('is-load-hidden');
      const visibleCards = row.querySelectorAll('[data-tech-card]:not(.is-hidden)');
      row.classList.toggle('is-hidden', loadHidden || visibleCards.length === 0);
    });

    normalizeDividers();
    updateStaticLoadMoreVisibility();
  };

  const setActiveFilter = activeBtn => {
    filters.forEach(btn => {
      const isActiveBtn = btn === activeBtn;
      btn.classList.toggle('is-active', isActiveBtn);
      btn.setAttribute('aria-selected', isActiveBtn ? 'true' : 'false');
    });
  };

  const parseLoadedFragment = html => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const ajaxContent = doc.querySelector('[data-tech-ajax-content], [data-tech-content]');
    const source = ajaxContent || doc.body;
    const nodes = Array.from(source.children).filter(node => (
      node.nodeType === Node.ELEMENT_NODE
      && (node.matches('[data-tech-row]') || node.matches('[data-tech-divider]'))
    ));
    const nextButton = doc.querySelector('[data-tech-load-more]');

    return {
      nodes,
      nextUrl: nextButton?.dataset.techNextUrl || '',
      hasMore: nextButton ? !nextButton.hidden : false,
    };
  };

  const appendLoadedNodes = nodes => {
    if (!nodes.length || !loadMoreWrap) return false;

    nodes.forEach(node => {
      content.insertBefore(document.importNode(node, true), loadMoreWrap);
    });

    applyFilter(currentCategory);
    return true;
  };

  const updateLoadMoreState = (nextUrl, hasMore) => {
    if (!loadMoreBtn || !loadMoreWrap) return;

    loadMoreBtn.dataset.techNextUrl = nextUrl || '';

    if (!hasMore || !nextUrl) {
      loadMoreWrap.hidden = true;
    }
  };

  const revealStaticLazyNodes = () => {
    const hiddenLazyNodes = getHiddenLazyNodes();
    if (!hiddenLazyNodes.length) return false;

    hiddenLazyNodes.forEach(node => node.classList.remove('is-load-hidden'));
    applyFilter(currentCategory);
    setStatus('Технологии показаны');
    return true;
  };

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveFilter(btn);
      applyFilter(btn.dataset.filter);
    });
  });

  // Bitrix: set data-tech-next-url to the next AJAX page returning data-tech-row/data-tech-divider nodes.
  loadMoreBtn?.addEventListener('click', async () => {
    if (loadMoreBtn.disabled) return;

    const nextUrl = loadMoreBtn.dataset.techNextUrl || '';
    if (!nextUrl) {
      if (isMobile() && revealStaticLazyNodes()) return;
      setStatus('Следующие технологии будут подгружаться через AJAX после подключения Bitrix.');
      return;
    }

    setLoading(true);
    setStatus('Загружаем технологии');

    try {
      const response = await fetch(nextUrl, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });

      if (!response.ok) throw new Error(`Request failed: ${response.status}`);

      const fragment = parseLoadedFragment(await response.text());
      const appended = appendLoadedNodes(fragment.nodes);

      if (!appended) throw new Error('No technology rows in response');

      updateLoadMoreState(fragment.nextUrl, fragment.hasMore);
      setStatus('Технологии загружены');
    } catch {
      setStatus('Не удалось загрузить технологии. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  });

  mobileQuery.addEventListener?.('change', () => applyFilter(currentCategory));
  applyFilter(currentCategory);
}
