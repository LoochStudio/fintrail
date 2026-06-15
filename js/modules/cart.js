export function init() {
  // Cart page — delivery method switch
  document.querySelectorAll('[data-cart-delivery]').forEach(delivery => {
    const tabs = Array.from(delivery.querySelectorAll('[data-cart-delivery-tab]'));
    const panels = Array.from(delivery.querySelectorAll('[data-cart-delivery-panel]'));

    function selectDeliveryMode(mode) {
      tabs.forEach(tab => {
        const isActive = tab.dataset.cartDeliveryTab === mode;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
      });

      panels.forEach(panel => {
        const isActive = panel.dataset.cartDeliveryPanel === mode;
        panel.hidden = !isActive;
        panel.classList.toggle('is-active', isActive);
      });
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => selectDeliveryMode(tab.dataset.cartDeliveryTab));
    });
  });

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
    const panel = modal.querySelector('.cart-pickup-modal__panel');
    const points = Array.from(modal.querySelectorAll('[data-cart-pickup-point]'));
    const submitButton = modal.querySelector('[data-cart-pickup-submit]');
    const listView = modal.querySelector('[data-cart-pickup-view="list"]');
    const detailView = modal.querySelector('[data-cart-pickup-view="detail"]');
    const deliveryAddress = document.querySelector('[data-cart-pickup-address]');
    const deliveryDate = document.querySelector('[data-cart-pickup-date]');
    const detailAddress = modal.querySelector('[data-cart-pickup-detail-address]');
    const detailSchedule = modal.querySelector('[data-cart-pickup-detail-schedule]');
    const detailDelivery = modal.querySelector('[data-cart-pickup-detail-delivery]');
    const searchInput = modal.querySelector('.cart-pickup-modal__search input');
    const detailCloseBtn = modal.querySelector('[data-cart-pickup-detail-close]');
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    let activePoint = points.find(point => point.classList.contains('is-active')) || points[0] || null;
    let closeTimer = 0;

    function syncDetail(point) {
      if (!point) return;
      if (detailAddress) detailAddress.textContent = point.dataset.address || '';
      if (detailSchedule) detailSchedule.textContent = point.dataset.schedule || '';
      if (detailDelivery) detailDelivery.textContent = point.dataset.delivery || point.dataset.date || '';
    }

    function resetToMapView() {
      panel?.classList.remove('is-list-view', 'has-detail');
      if (listView) listView.hidden = false;
      if (detailView) detailView.hidden = true;
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

      if (showDetail) {
        const isMobileMapView = mobileQuery.matches && !panel?.classList.contains('is-list-view');
        if (isMobileMapView) {
          if (detailView) detailView.hidden = false;
          panel?.classList.add('has-detail');
        } else if (listView && detailView) {
          listView.hidden = true;
          detailView.hidden = false;
        }
      }
    }

    function openModal(event) {
      event?.preventDefault();
      window.clearTimeout(closeTimer);
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      resetToMapView();
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

    function handleBackOrClose() {
      if (mobileQuery.matches && panel?.classList.contains('is-list-view')) {
        resetToMapView();
      } else {
        closeModal();
      }
    }

    openButtons.forEach(button => button.addEventListener('click', openModal));

    // Backdrop and other data-cart-pickup-close elements always close
    closeButtons.forEach(button => {
      if (button !== closeButton) button.addEventListener('click', closeModal);
    });
    // Main header button: back or close depending on mobile view state
    closeButton?.addEventListener('click', handleBackOrClose);

    points.forEach(point => point.addEventListener('click', () => selectPoint(point)));

    // Map markers: clicking any marker selects the corresponding list point
    const mapMarkers = Array.from(modal.querySelectorAll('.cart-pickup-modal__marker'));
    mapMarkers.forEach((marker, i) => {
      const point = points[Math.min(i, points.length - 1)];
      if (point) marker.addEventListener('click', () => selectPoint(point));
    });

    // Detail bottom-sheet close: dismiss card, stay on map
    detailCloseBtn?.addEventListener('click', () => {
      panel?.classList.remove('has-detail');
      if (detailView) detailView.hidden = true;
    });

    // Search focus on mobile → switch to list view
    searchInput?.addEventListener('focus', () => {
      if (mobileQuery.matches && !panel?.classList.contains('is-list-view')) {
        panel?.classList.add('is-list-view');
        panel?.classList.remove('has-detail');
        if (listView) listView.hidden = false;
        if (detailView) detailView.hidden = true;
      }
    });

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
    const nameOutputs = document.querySelectorAll('[data-cart-recipient-name]');
    const phoneOutputs = document.querySelectorAll('[data-cart-recipient-phone]');
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
      input.addEventListener('input', () => setFieldError(input, ''));
    });

    form?.addEventListener('submit', event => {
      event.preventDefault();
      if (!validateForm()) return;
      const firstName = form.querySelector('[name="first-name"]')?.value.trim() || '';
      const lastName = form.querySelector('[name="last-name"]')?.value.trim() || '';
      const phone = form.querySelector('[name="phone"]')?.value.trim() || '';
      if (firstName || lastName) {
        nameOutputs.forEach(output => {
          output.textContent = [firstName, lastName].filter(Boolean).join(' ');
        });
      }
      if (phone) {
        phoneOutputs.forEach(output => {
          output.textContent = phone;
        });
      }
      closeModal();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !modal.hidden) closeModal();
    });
  });

  // Cart page — delivery address modal
  document.querySelectorAll('[data-cart-address-modal]').forEach(modal => {
    const openButtons = document.querySelectorAll('[data-cart-address-open]');
    const closeButtons = modal.querySelectorAll('[data-cart-address-close]');
    const closeButton = modal.querySelector('.js-modal-close');
    const form = modal.querySelector('.cart-address-modal__form');
    const summary = document.querySelector('[data-cart-address-summary]');
    let closeTimer = 0;

    modal.querySelectorAll('.uk-field-wrap').forEach(wrap => {
      const field = wrap.querySelector('.uk-field__input');
      const clearBtn = wrap.querySelector('.uk-field__clear');
      if (!field) return;

      function syncClear() {
        const hasValue = field.value.trim() !== '';
        wrap.classList.toggle('uk-s-value', hasValue && field.tagName !== 'SELECT');
      }

      field.addEventListener('focus', () => wrap.classList.add('uk-s-active'));
      field.addEventListener('blur', () => {
        wrap.classList.remove('uk-s-active');
        syncClear();
      });
      field.addEventListener('input', syncClear);
      field.addEventListener('change', syncClear);

      if (clearBtn) {
        clearBtn.addEventListener('mousedown', event => {
          event.preventDefault();
        });
        clearBtn.addEventListener('click', () => {
          field.value = '';
          wrap.classList.remove('uk-s-value');
          field.focus();
        });
      }

      syncClear();
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

    const addressFieldRules = [
      { name: 'city',   test: v => v.trim() !== '', error: 'Заполните поле' },
      { name: 'street', test: v => v.trim() !== '', error: 'Заполните поле' },
      { name: 'house',  test: v => v.trim() !== '', error: 'Заполните поле' },
    ];

    function setAddressFieldError(input, message) {
      const wrap = input.closest('[data-input-field]');
      if (!wrap) return;
      const caption = wrap.querySelector('.uk-field__caption');
      wrap.classList.toggle('is-error', !!message);
      if (caption) caption.textContent = message || '';
    }

    function validateAddressForm() {
      let valid = true;
      for (const rule of addressFieldRules) {
        const input = form.querySelector(`[name="${rule.name}"]`);
        if (!input) continue;
        const message = rule.test(input.value) ? '' : rule.error;
        setAddressFieldError(input, message);
        if (message) valid = false;
      }
      return valid;
    }

    form?.querySelectorAll('.uk-field__input').forEach(input => {
      input.addEventListener('input', () => setAddressFieldError(input, ''));
    });

    form?.addEventListener('submit', event => {
      event.preventDefault();
      if (!validateAddressForm()) return;
      const city = form.elements.city?.value.trim() || '';
      const street = form.elements.street?.value.trim() || '';
      const house = form.elements.house?.value.trim() || '';
      const address = [city, street, house && `д. ${house}`].filter(Boolean).join(', ');

      if (summary && address) {
        summary.textContent = address;
      }

      closeModal();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !modal.hidden) closeModal();
    });
  });

  // Cart page — mobile sticky checkout bar
  const mobileBuyPanel = document.querySelector('.cart-mobile-buy');
  const cartSubmitBtn = document.querySelector('.cart-total__submit');
  const cartTotalSum = document.querySelector('.cart-total__sum');
  const mobileBuyQuery = window.matchMedia('(max-width: 767px)');

  if (mobileBuyPanel && cartSubmitBtn) {
    const priceEl = cartTotalSum?.querySelector('dd');
    const priceSpan = mobileBuyPanel.querySelector('.cart-mobile-buy__price');
    if (priceEl && priceSpan) priceSpan.textContent = priceEl.textContent.trim();

    const syncMobileBuy = () => {
      if (!mobileBuyQuery.matches) {
        mobileBuyPanel.classList.remove('is-visible');
        mobileBuyPanel.setAttribute('aria-hidden', 'true');
        return;
      }
      const submitRect = cartSubmitBtn.getBoundingClientRect();
      const submitVisible = submitRect.top < window.innerHeight && submitRect.bottom > 0;
      mobileBuyPanel.classList.toggle('is-visible', !submitVisible);
      mobileBuyPanel.setAttribute('aria-hidden', String(submitVisible));

      if (cartTotalSum) {
        const totalRect = cartTotalSum.getBoundingClientRect();
        mobileBuyPanel.classList.toggle('has-price', totalRect.bottom < 0);
      }
    };

    window.addEventListener('scroll', syncMobileBuy, { passive: true });
    window.addEventListener('resize', syncMobileBuy);
    mobileBuyQuery.addEventListener('change', syncMobileBuy);
    syncMobileBuy();
  }

  // Cart page — payment method switch
  document.querySelectorAll('.cart-payment__methods').forEach(group => {
    const methods = Array.from(group.querySelectorAll('.cart-payment__method'));
    methods.forEach(method => {
      const radio = method.querySelector('input[type="radio"]');
      if (!radio) return;
      radio.addEventListener('change', () => {
        methods.forEach(m => m.classList.toggle('is-active', m === method));
      });
      method.addEventListener('click', () => {
        methods.forEach(m => m.classList.toggle('is-active', m === method));
      });
    });
  });

  // Cart page — promo field focus states
  document.querySelectorAll('.cart-total__promo-row .uk-field-wrap').forEach(wrap => {
    const input = wrap.querySelector('.uk-field__input');
    if (!input) return;
    input.addEventListener('focus', () => wrap.classList.add('uk-s-active'));
    input.addEventListener('blur', () => wrap.classList.remove('uk-s-active'));
  });

  // Cart page — promo code: turns discount row green on apply
  document.querySelectorAll('.cart-total__promo-row').forEach(form => {
    const discountRow = form.closest('.cart-total')?.querySelector('.cart-total__discount-row');
    if (!discountRow) return;

    form.addEventListener('submit', event => {
      event.preventDefault();
      const input = form.querySelector('input');
      if (input?.value.trim()) {
        discountRow.classList.add('is-promo-applied');
        form.classList.add('is-promo-applied');
        const label = form.querySelector('button span');
        if (label) label.textContent = 'Применено';
      }
    });
  });

  // Cart page — clear cart confirmation modal
  document.querySelectorAll('[data-cart-clear-modal]').forEach(modal => {
    const openButtons = document.querySelectorAll('[data-cart-clear-open]');
    const closeButtons = modal.querySelectorAll('[data-cart-clear-close]');
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
}
