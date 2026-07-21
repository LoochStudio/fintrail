export function init() {
  initDraggableSliders();
  initOrderTabs();
  initOrderProductBookmarks();

  document.querySelectorAll('.order-item__icon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const active = btn.classList.toggle('is-active');
      btn.setAttribute('aria-label', active ? 'Убрать из избранного' : 'Добавить в избранное');
    });
  });
}

function initDraggableSliders() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  document.querySelectorAll('.personal-orders__slider, .personal-favorites__slider').forEach(slider => {
    let pointerId = null;
    let startX = 0;
    let startScrollLeft = 0;
    let hasDragged = false;

    slider.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      if (event.target.closest('button, input, select, textarea')) return;

      pointerId = event.pointerId;
      startX = event.clientX;
      startScrollLeft = slider.scrollLeft;
      hasDragged = false;
      slider.setPointerCapture(pointerId);
    });

    slider.addEventListener('pointermove', event => {
      if (event.pointerId !== pointerId) return;

      const delta = event.clientX - startX;
      if (!hasDragged && Math.abs(delta) < 5) return;

      hasDragged = true;
      slider.classList.add('is-dragging');
      slider.scrollLeft = startScrollLeft - delta;
      event.preventDefault();
    });

    slider.addEventListener('dragstart', event => event.preventDefault());

    const stopDragging = event => {
      if (event.pointerId !== pointerId) return;

      if (slider.hasPointerCapture(pointerId)) slider.releasePointerCapture(pointerId);
      pointerId = null;
      slider.classList.remove('is-dragging');
      window.setTimeout(() => { hasDragged = false; }, 0);
    };

    slider.addEventListener('pointerup', stopDragging);
    slider.addEventListener('pointercancel', stopDragging);
    slider.addEventListener('click', event => {
      if (!hasDragged) return;
      event.preventDefault();
      event.stopPropagation();
    }, true);
  });
}

function initOrderTabs() {
  document.querySelectorAll('[data-orders-tabs]').forEach(tabList => {
    const page = tabList.closest('.orders-page');
    const cards = Array.from(page?.querySelectorAll('[data-order-status]') || []);
    const empty = page?.querySelector('[data-orders-empty]');
    if (!page || !cards.length) return;

    const selectFilter = filter => {
      tabList.querySelectorAll('[data-orders-filter]').forEach(tab => {
        const isActive = tab.dataset.ordersFilter === filter;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-pressed', String(isActive));
      });

      let visibleCount = 0;
      cards.forEach(card => {
        const isVisible = card.dataset.orderStatus === filter;
        card.hidden = !isVisible;
        if (isVisible) visibleCount += 1;
      });

      if (empty) {
        empty.hidden = visibleCount > 0;
        empty.textContent = filter === 'completed'
          ? 'Завершенных заказов пока нет'
          : 'Актуальных заказов пока нет';
      }
    };

    tabList.addEventListener('click', event => {
      const tab = event.target.closest('[data-orders-filter]');
      if (tab) selectFilter(tab.dataset.ordersFilter);
    });
  });
}

function initOrderProductBookmarks() {
  document.querySelectorAll('.order-card__product-bookmark').forEach(bookmark => {
    const toggle = event => {
      event.preventDefault();
      event.stopPropagation();
      const isSaved = bookmark.classList.toggle('is-saved');
      bookmark.setAttribute('aria-label', isSaved ? 'Убрать из избранного' : 'Добавить в избранное');
    };

    bookmark.addEventListener('click', toggle);
  });
}
