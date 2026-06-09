export function init() {
  // Cart page — login modal
  document.querySelectorAll('[data-cart-login-modal]').forEach(modal => {
    const openButtons = document.querySelectorAll('[data-cart-login-open]');
    const closeButtons = modal.querySelectorAll('[data-cart-login-close]');
    const closeButton = modal.querySelector('.js-modal-close');
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
    const closeButton = modal.querySelector('.js-modal-close');
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
}
