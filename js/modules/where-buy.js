export function init() {
  document.querySelectorAll('.where-buy-map').forEach(section => {
    const tabs = section.querySelectorAll('[data-where-buy-view]');
    if (!tabs.length) return;

    const setView = view => {
      const isMapView = view === 'map';
      section.classList.toggle('is-map-view', isMapView);
      tabs.forEach(tab => {
        const isActive = tab.dataset.whereBuyView === view;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
      });
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', () => setView(tab.dataset.whereBuyView || 'list'));
    });

    setView('list');
  });

  document.querySelectorAll('[data-where-buy-more]').forEach(button => {
    button.addEventListener('click', () => {
      const section = button.closest('.where-buy-map');
      if (!section) return;

      const hiddenItems = Array.from(section.querySelectorAll('[data-where-buy-extra][hidden]'));
      hiddenItems.slice(0, 2).forEach(item => item.hidden = false);

      if (!section.querySelector('[data-where-buy-extra][hidden]')) {
        button.hidden = true;
      }
    });
  });
  document.querySelectorAll('[data-where-buy-filter]').forEach(button => {
    button.addEventListener('click', () => {
      const group = button.closest('.where-buy-map__tags');
      group?.querySelectorAll('[data-where-buy-filter]').forEach(item => item.classList.remove('is-active'));
      button.classList.add('is-active');
    });
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