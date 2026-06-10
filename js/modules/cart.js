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

  // Cart page — recipient data modal
  document.querySelectorAll('[data-cart-recipient-modal]').forEach(modal => {
    const openButtons = document.querySelectorAll('[data-cart-recipient-open]');
    const closeButtons = modal.querySelectorAll('[data-cart-recipient-close]');
    const closeButton = modal.querySelector('.js-modal-close');
    const form = modal.querySelector('.cart-recipient-modal__form');
    const nameOutput = document.querySelector('[data-cart-recipient-name]');
    const phoneOutput = document.querySelector('[data-cart-recipient-phone]');
    let closeTimer = 0;

    // Clear buttons + active state for uk-field-wrap
    modal.querySelectorAll('.uk-field-wrap').forEach(wrap => {
      const input = wrap.querySelector('.uk-field__input');
      const clearBtn = wrap.querySelector('.uk-field__clear');
      if (!input) return;

      const isPhone = input.classList.contains('js-phone-input');

      function syncClear() {
        const empty = isPhone
          ? input.value.replace(/\D/g, '').length <= 1
          : input.value.trim() === '';
        wrap.classList.toggle('uk-s-value', !empty);
      }

      input.addEventListener('focus', () => wrap.classList.add('uk-s-active'));
      input.addEventListener('blur', () => {
        wrap.classList.remove('uk-s-active');
        syncClear();
      });
      input.addEventListener('input', syncClear);

      if (clearBtn) {
        clearBtn.addEventListener('mousedown', event => {
          event.preventDefault();
        });
        clearBtn.addEventListener('click', () => {
          input.value = '';
          wrap.classList.remove('uk-s-value');
          input.focus();
        });
      }
    });

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

    const fieldRules = [
      { name: 'first-name', test: v => v.trim() !== '',                                    error: 'Заполните поле' },
      { name: 'last-name',  test: v => v.trim() !== '',                                    error: 'Заполните поле' },
      { name: 'phone',      test: v => v.replace(/\D/g, '').length >= 11,                  error: 'Введите корректный номер' },
      { name: 'email',      test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),        error: 'Введите корректный email' },
    ];

    function setFieldError(input, message) {
      const wrap = input.closest('[data-input-field]');
      if (!wrap) return;
      const caption = wrap.querySelector('.uk-field__caption');
      wrap.classList.toggle('is-error', !!message);
      if (caption) caption.textContent = message || '';
    }

    function validateField(input) {
      const rule = fieldRules.find(r => r.name === input.name);
      if (!rule) return true;
      const message = rule.test(input.value) ? '' : rule.error;
      setFieldError(input, message);
      return !message;
    }

    function validateForm() {
      let valid = true;
      for (const rule of fieldRules) {
        const input = form.querySelector(`[name="${rule.name}"]`);
        if (input && !validateField(input)) valid = false;
      }
      return valid;
    }

    form?.querySelectorAll('.uk-field__input').forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => setFieldError(input, ''));
    });

    form?.addEventListener('submit', event => {
      event.preventDefault();
      if (!validateForm()) return;
      const firstName = form.querySelector('[name="first-name"]')?.value.trim() || '';
      const lastName = form.querySelector('[name="last-name"]')?.value.trim() || '';
      const phone = form.querySelector('[name="phone"]')?.value.trim() || '';
      if (nameOutput && (firstName || lastName)) {
        nameOutput.textContent = [firstName, lastName].filter(Boolean).join(' ');
      }
      if (phoneOutput && phone) {
        phoneOutput.textContent = phone;
      }
      closeModal();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !modal.hidden) closeModal();
    });
  });
}
