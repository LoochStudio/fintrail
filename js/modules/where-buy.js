export function init() {
  document.querySelectorAll('.where-buy-map').forEach(section => {
    const tabs = Array.from(section.querySelectorAll('[data-where-buy-view]'));
    const filters = Array.from(section.querySelectorAll('[data-where-buy-filter]'));
    const locations = Array.from(section.querySelectorAll('[data-where-buy-location]'));
    const markers = Array.from(section.querySelectorAll('[data-where-buy-marker]'));
    const searchInput = section.querySelector('[data-where-buy-search]');
    const searchClear = section.querySelector('[data-where-buy-search-clear]');
    const moreButton = section.querySelector('[data-where-buy-more]');
    const emptyState = section.querySelector('[data-where-buy-empty]');
    const resetButton = section.querySelector('[data-where-buy-reset]');
    const cluster = section.querySelector('[data-where-buy-cluster]');
    const selectedCard = section.querySelector('[data-where-buy-selected]');
    const selectedTitle = selectedCard?.querySelector('[data-where-buy-selected-title]');
    const selectedAddress = selectedCard?.querySelector('[data-where-buy-selected-address]');
    const selectedSchedule = selectedCard?.querySelector('[data-where-buy-selected-schedule]');
    const selectedClose = selectedCard?.querySelector('[data-where-buy-selected-close]');
    const selectedShow = selectedCard?.querySelector('[data-where-buy-selected-show]');
    let activeFilter = 'all';
    let activeStoreId = '';
    let extrasExpanded = false;
    let currentView = 'list';

    const normalizeText = value => value
      .toLocaleLowerCase('ru-RU')
      .replaceAll('ё', 'е')
      .trim();

    const matchesCategory = (item, category) => {
      if (category === 'all') return true;
      return (item.dataset.categories || '').split(/\s+/).includes(category);
    };

    const matchesSearch = (item, query) => {
      if (!query) return true;
      return normalizeText(item.textContent || '').includes(query);
    };

    const setView = view => {
      currentView = view === 'map' ? 'map' : 'list';
      const isMapView = currentView === 'map';
      section.classList.toggle('is-map-view', isMapView);
      tabs.forEach(tab => {
        const isActive = tab.dataset.whereBuyView === currentView;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
      });
    };

    const clearSelection = () => {
      activeStoreId = '';
      locations.forEach(location => location.classList.remove('is-active'));
      markers.forEach(marker => {
        marker.classList.remove('is-active');
        marker.setAttribute('aria-pressed', 'false');
      });
      if (selectedCard) selectedCard.hidden = true;
    };

    const getLocation = storeId => locations.find(location => location.dataset.storeId === storeId);

    const updateResults = () => {
      const query = normalizeText(searchInput?.value || '');
      const hasNarrowedResults = activeFilter !== 'all' || query.length > 0;
      let visibleCount = 0;

      locations.forEach(location => {
        const isMatch = matchesCategory(location, activeFilter) && matchesSearch(location, query);
        const isCollapsedExtra = location.hasAttribute('data-where-buy-extra')
          && !extrasExpanded
          && !hasNarrowedResults;
        location.hidden = !isMatch || isCollapsedExtra;
        if (!location.hidden) visibleCount += 1;
      });

      markers.forEach(marker => {
        const location = getLocation(marker.dataset.storeId || '');
        marker.hidden = !location
          || !matchesCategory(location, activeFilter)
          || !matchesSearch(location, query);
      });

      if (cluster) cluster.hidden = hasNarrowedResults;
      if (emptyState) emptyState.hidden = visibleCount > 0;
      if (moreButton) {
        const hasCollapsedExtras = locations.some(location => (
          location.hasAttribute('data-where-buy-extra') && !extrasExpanded
        ));
        moreButton.hidden = hasNarrowedResults || !hasCollapsedExtras;
      }

      const activeLocation = getLocation(activeStoreId);
      if (activeStoreId && (!activeLocation || activeLocation.hidden)) clearSelection();
    };

    const setFilter = filter => {
      activeFilter = filter || 'all';
      filters.forEach(button => {
        const isActive = button.dataset.whereBuyFilter === activeFilter;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });
      updateResults();
    };

    const selectStore = storeId => {
      const location = getLocation(storeId);
      if (!location) return;

      if (location.hidden && location.hasAttribute('data-where-buy-extra')) {
        extrasExpanded = true;
        updateResults();
      }

      activeStoreId = storeId;
      locations.forEach(item => item.classList.toggle('is-active', item === location));
      markers.forEach(marker => {
        const isActive = marker.dataset.storeId === storeId;
        marker.classList.toggle('is-active', isActive);
        marker.setAttribute('aria-pressed', String(isActive));
      });

      const title = location.querySelector('.where-buy-location__title span')?.textContent?.trim() || '';
      const meta = location.querySelectorAll('.where-buy-location__meta p');
      if (selectedTitle) selectedTitle.textContent = title;
      if (selectedAddress) selectedAddress.textContent = meta[0]?.textContent?.trim() || '';
      if (selectedSchedule) selectedSchedule.textContent = meta[1]?.textContent?.trim() || '';

      if (window.matchMedia('(max-width: 1023px)').matches && currentView === 'map') {
        if (selectedCard) selectedCard.hidden = false;
      } else {
        location.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        location.focus({ preventScroll: true });
      }
    };

    if (searchInput && searchClear) {
      const updateSearchClear = () => {
        searchClear.hidden = searchInput.value.length === 0;
      };

      searchInput.addEventListener('input', () => {
        updateSearchClear();
        updateResults();
      });
      searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        searchInput.focus();
      });
      updateSearchClear();
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => setView(tab.dataset.whereBuyView || 'list'));
    });

    filters.forEach(button => {
      button.addEventListener('click', () => setFilter(button.dataset.whereBuyFilter));
    });

    locations.forEach(location => {
      const activateLocation = event => {
        if (event.target.closest('a, button')) return;
        selectStore(location.dataset.storeId || '');
      };

      location.addEventListener('click', activateLocation);
      location.addEventListener('keydown', event => {
        if (event.target.closest('a, button')) return;
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        selectStore(location.dataset.storeId || '');
      });
    });

    markers.forEach(marker => {
      marker.addEventListener('click', () => selectStore(marker.dataset.storeId || ''));
    });

    moreButton?.addEventListener('click', () => {
      extrasExpanded = true;
      updateResults();
    });

    resetButton?.addEventListener('click', () => {
      extrasExpanded = false;
      if (searchInput) searchInput.value = '';
      if (searchClear) searchClear.hidden = true;
      clearSelection();
      setFilter('all');
      searchInput?.focus();
    });

    selectedClose?.addEventListener('click', clearSelection);
    selectedShow?.addEventListener('click', () => {
      const location = getLocation(activeStoreId);
      if (!location) return;
      if (selectedCard) selectedCard.hidden = true;
      setView('list');
      window.setTimeout(() => {
        location.scrollIntoView({ block: 'center', behavior: 'smooth' });
        location.focus({ preventScroll: true });
      }, 50);
    });

    setView('list');
    setFilter('all');
  });

  document.querySelectorAll('[data-where-buy-slider]').forEach(section => {
    const track = section.querySelector('.where-buy-stores__track');
    const prev = section.querySelector('.js-where-buy-prev');
    const next = section.querySelector('.js-where-buy-next');
    const card = section.querySelector('.where-buy-store-card');

    if (!track || !prev || !next || !card) return;

    const getStep = () => {
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
      return card.getBoundingClientRect().width + gap;
    };

    const updateControls = () => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      prev.disabled = track.scrollLeft <= 1;
      next.disabled = track.scrollLeft >= maxScroll - 1;
    };

    prev.addEventListener('click', () => {
      track.scrollBy({ left: -getStep(), behavior: 'smooth' });
    });

    next.addEventListener('click', () => {
      track.scrollBy({ left: getStep(), behavior: 'smooth' });
    });

    track.addEventListener('scroll', updateControls, { passive: true });
    window.addEventListener('resize', updateControls);
    updateControls();
  });
}
