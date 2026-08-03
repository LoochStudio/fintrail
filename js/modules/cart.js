export function init() {
  const accountDeleteModal = document.querySelector('[data-account-delete-modal]');
  const accountDeleteDialog = (() => {
    if (!accountDeleteModal) return null;

    const title = accountDeleteModal.querySelector('[data-account-delete-title]');
    const description = accountDeleteModal.querySelector('[data-account-delete-description]');
    const confirmButton = accountDeleteModal.querySelector('[data-account-delete-confirm]');
    const cancelButtons = accountDeleteModal.querySelectorAll('[data-account-delete-cancel]');
    let closeTimer = 0;
    let pendingAction = null;
    let returnFocus = null;

    function close({ restoreFocus = true } = {}) {
      accountDeleteModal.classList.remove('is-open');
      accountDeleteModal.setAttribute('aria-hidden', 'true');
      pendingAction = null;
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(() => {
        accountDeleteModal.hidden = true;
        if (restoreFocus) returnFocus?.focus();
        returnFocus = null;
      }, 200);
    }

    function open({ type, trigger, onConfirm }) {
      const isAddress = type === 'address';
      if (title) title.textContent = isAddress ? 'Удалить адрес?' : 'Удалить получателя?';
      if (description) {
        description.textContent = isAddress
          ? 'Адрес будет удалён без возможности восстановления.'
          : 'Данные получателя будут удалены без возможности восстановления.';
      }

      pendingAction = onConfirm;
      returnFocus = trigger || document.activeElement;
      window.clearTimeout(closeTimer);
      accountDeleteModal.hidden = false;
      accountDeleteModal.setAttribute('aria-hidden', 'false');
      window.requestAnimationFrame(() => {
        accountDeleteModal.classList.add('is-open');
        confirmButton?.focus();
      });
    }

    cancelButtons.forEach(button => button.addEventListener('click', () => close()));
    confirmButton?.addEventListener('click', () => {
      const action = pendingAction;
      close({ restoreFocus: false });
      action?.();
    });

    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || accountDeleteModal.hidden) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      close();
    }, true);

    return { open };
  })();

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
    const searchClearBtn = modal.querySelector('[data-cart-pickup-search-clear]');
    const noResults = modal.querySelector('.cart-pickup-modal__no-results');
    const pointsContainer = modal.querySelector('.cart-pickup-modal__points');
    const detailCloseBtn = modal.querySelector('[data-cart-pickup-detail-close]');
    const pickupMap = modal.querySelector('.cart-pickup-modal__map');
    const mapClusters = Array.from(modal.querySelectorAll('.cart-pickup-modal__cluster'));
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const tabletQuery = window.matchMedia('(min-width: 768px) and (max-width: 1279px)');
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
      pickupMap?.classList.remove('is-clustered');
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
        const isTablet = tabletQuery.matches;
        if (isMobileMapView || isTablet) {
          panel?.classList.remove('is-list-view');
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

    function setMapClustered(isClustered) {
      pickupMap?.classList.toggle('is-clustered', isClustered);
    }

    pickupMap?.addEventListener('wheel', event => {
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
      setMapClustered(event.deltaY > 0);
    }, { passive: true });

    mapClusters.forEach(cluster => {
      cluster.addEventListener('click', () => setMapClustered(false));
    });

    function returnToPickupList() {
      panel?.classList.remove('has-detail');
      panel?.classList.add('is-list-view');
      if (listView) listView.hidden = false;
      if (detailView) detailView.hidden = true;
    }

    // Detail close returns to the full pickup list instead of leaving an empty sidebar.
    detailCloseBtn?.addEventListener('click', returnToPickupList);

    searchClearBtn?.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        searchInput.focus();
      }
    });

    function filterPoints() {
      const query = searchInput.value.trim().toLowerCase();
      if (!query) {
        points.forEach(p => { p.hidden = false; });
        if (pointsContainer) pointsContainer.style.display = '';
        if (noResults) noResults.hidden = true;
        return;
      }
      let hasVisible = false;
      points.forEach(point => {
        const address = (point.dataset.address || '').toLowerCase();
        const matches = address.includes(query);
        point.hidden = !matches;
        if (matches) hasVisible = true;
      });
      if (pointsContainer) pointsContainer.style.display = hasVisible ? '' : 'none';
      if (noResults) noResults.hidden = hasVisible;
    }

    searchInput?.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        filterPoints();
      }
    });

    // Search focus on mobile/tablet → switch to list view
    searchInput?.addEventListener('focus', () => {
      if ((mobileQuery.matches || tabletQuery.matches) && !panel?.classList.contains('is-list-view')) {
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
    const form = modal.querySelector('[data-cart-recipient-form-view]') || modal.querySelector('.cart-recipient-modal__form');
    const listView = modal.querySelector('[data-cart-recipient-list-view]');
    const formView = modal.querySelector('[data-cart-recipient-form-view]') || form;
    const title = modal.querySelector('[data-cart-recipient-title]') || modal.querySelector('.cart-recipient-modal__title');
    const backButton = modal.querySelector('[data-cart-recipient-back]');
    const addButton = modal.querySelector('[data-cart-recipient-add]');
    const selectButton = modal.querySelector('[data-cart-recipient-select]');
    const nameOutputs = document.querySelectorAll('[data-cart-recipient-name]');
    const phoneOutputs = document.querySelectorAll('[data-cart-recipient-phone]');
    const submitBtn = modal.querySelector('.cart-recipient-modal__submit');
    const deleteBtn = modal.querySelector('[data-cart-recipient-delete]');
    let closeTimer = 0;
    let editedOption = null;

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

    function fillForm(btn) {
      const isExisting = btn && btn.dataset.recipientFirstName !== undefined;
      editedOption = isExisting ? btn : null;
      const fieldMap = {
        'first-name': 'recipientFirstName',
        'last-name':  'recipientLastName',
        'email':      'recipientEmail',
      };
      Object.entries(fieldMap).forEach(([name, key]) => {
        const input = form?.elements[name];
        if (!input) return;
        input.value = isExisting ? (btn.dataset[key] ?? '') : '';
        const wrap = input.closest('[data-input-field]');
        if (wrap) wrap.classList.toggle('uk-s-value', input.value.trim() !== '');
      });
      const phoneInput = form?.elements['phone'];
      if (phoneInput) {
        phoneInput.value = isExisting ? (btn.dataset.recipientPhone ?? '') : '';
        const wrap = phoneInput.closest('[data-input-field]');
        if (wrap) wrap.classList.toggle('uk-s-value', phoneInput.value.replace(/\D/g, '').length > 1);
      }
      if (submitBtn) submitBtn.textContent = isExisting ? 'Сохранить изменения' : 'Добавить получателя';
      if (deleteBtn) deleteBtn.hidden = !isExisting;
    }

    function showList() {
      if (!listView) return;
      listView.hidden = false;
      if (formView) formView.hidden = true;
      if (backButton) backButton.hidden = true;
      if (title) title.textContent = 'Получатель';
      editedOption = null;
    }

    function showForm(option = null) {
      fillForm(option);
      if (listView) listView.hidden = true;
      if (formView) formView.hidden = false;
      if (backButton) backButton.hidden = false;
      if (title) title.textContent = option ? 'Данные получателя' : 'Новый получатель';
      window.requestAnimationFrame(() => form.querySelector('.uk-field__input')?.focus());
    }

    function syncSelectedRecipient() {
      modal.querySelectorAll('[data-cart-recipient-option]').forEach(option => {
        const radio = option.querySelector('.cart-saved-list__radio');
        option.classList.toggle('is-selected', Boolean(radio?.checked));
      });
    }

    function openModal() {
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

    function deleteEditedRecipient() {
      if (!editedOption) return;
      const item = editedOption.closest('[data-cart-recipient-option], .settings-list__item');
      if (!item) return;

      const deleteEvent = new CustomEvent('finntrail:profile-delete', {
        bubbles: true,
        cancelable: true,
        detail: { type: 'recipient', source: editedOption },
      });
      if (!editedOption.dispatchEvent(deleteEvent)) return;

      const list = item.parentElement;
      const wasSelected = Boolean(item.querySelector('input[type="radio"]:checked'));
      item.remove();

      if (wasSelected) {
        const nextRadio = list?.querySelector('input[type="radio"]');
        if (nextRadio) nextRadio.checked = true;
      }
      syncSelectedRecipient();
      editedOption = null;
      closeModal();
    }

    openButtons.forEach(button => button.addEventListener('click', event => {
      event.preventDefault();
      const opener = event.currentTarget;
      if (listView) {
        showList();
      } else {
        fillForm(opener.dataset.recipientFirstName !== undefined ? opener : null);
      }
      openModal();
    }));
    closeButtons.forEach(button => button.addEventListener('click', closeModal));
    deleteBtn?.addEventListener('click', () => {
      if (!editedOption || !accountDeleteDialog) return;
      accountDeleteDialog.open({
        type: 'recipient',
        trigger: deleteBtn,
        onConfirm: deleteEditedRecipient,
      });
    });
    backButton?.addEventListener('click', showList);
    addButton?.addEventListener('click', () => showForm());

    modal.querySelectorAll('[data-cart-recipient-edit]').forEach(button => {
      button.addEventListener('click', () => showForm(button.closest('[data-cart-recipient-option]')));
    });

    modal.querySelectorAll('input[name="saved-recipient"]').forEach(radio => {
      radio.addEventListener('change', syncSelectedRecipient);
    });

    selectButton?.addEventListener('click', () => {
      const option = modal.querySelector('input[name="saved-recipient"]:checked')?.closest('[data-cart-recipient-option]');
      if (!option) return;
      const fullName = [option.dataset.recipientFirstName, option.dataset.recipientLastName].filter(Boolean).join(' ');
      nameOutputs.forEach(output => { output.textContent = fullName; });
      phoneOutputs.forEach(output => { output.textContent = option.dataset.recipientPhone || ''; });
      closeModal();
    });

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
      const email = form.querySelector('[name="email"]')?.value.trim() || '';
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

      if (editedOption) {
        editedOption.dataset.recipientFirstName = firstName;
        editedOption.dataset.recipientLastName = lastName;
        editedOption.dataset.recipientPhone = phone;
        editedOption.dataset.recipientEmail = email;
        const heading = editedOption.querySelector('.cart-saved-list__heading');
        const meta = editedOption.querySelectorAll('.cart-saved-list__meta');
        if (heading) heading.textContent = [firstName, lastName].filter(Boolean).join(' ');
        if (meta[0]) meta[0].textContent = phone;
        if (meta[1]) meta[1].textContent = email;
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
    const form = modal.querySelector('[data-cart-address-form-view]') || modal.querySelector('.cart-address-modal__form');
    const listView = modal.querySelector('[data-cart-address-list-view]');
    const formView = modal.querySelector('[data-cart-address-form-view]') || form;
    const title = modal.querySelector('[data-cart-address-title]') || modal.querySelector('.cart-address-modal__title');
    const backButton = modal.querySelector('[data-cart-address-back]');
    const addButton = modal.querySelector('[data-cart-address-add]');
    const selectButton = modal.querySelector('[data-cart-address-select]');
    const summary = document.querySelector('[data-cart-address-summary]');
    let closeTimer = 0;
    let editedOption = null;

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

    const privateHouseCheckbox = modal.querySelector('[name="private-house"]');
    const detailsRow = modal.querySelector('[data-cart-address-details]');
    if (privateHouseCheckbox && detailsRow) {
      privateHouseCheckbox.addEventListener('change', () => {
        detailsRow.hidden = privateHouseCheckbox.checked;
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

    closeButtons.forEach(button => button.addEventListener('click', closeModal));

    const submitBtn = modal.querySelector('.cart-address-modal__submit');
    const deleteBtn = modal.querySelector('[data-cart-address-delete]');

    const selectTrigger = modal.querySelector('[data-address-select-trigger]');
    const selectLabel = modal.querySelector('[data-address-select-label]');
    const selectPopup = modal.querySelector('[data-address-select-popup]');
    const selectOptions = modal.querySelectorAll('[data-address-option]');
    const countryInput = modal.querySelector('input[name="country"]');

    function setCountry(value) {
      if (countryInput) countryInput.value = value;
      if (selectLabel) selectLabel.textContent = value || 'Страна';
      selectOptions.forEach(opt => {
        opt.classList.toggle('is-checked', opt.dataset.addressOption === value);
      });
    }

    if (selectTrigger && selectPopup) {
      selectTrigger.addEventListener('click', () => {
        const isOpen = selectTrigger.getAttribute('aria-expanded') === 'true';
        selectTrigger.setAttribute('aria-expanded', String(!isOpen));
        selectPopup.hidden = isOpen;
      });

      selectOptions.forEach(opt => {
        opt.addEventListener('click', () => {
          setCountry(opt.dataset.addressOption);
          selectTrigger.setAttribute('aria-expanded', 'false');
          selectPopup.hidden = true;
        });
      });

      document.addEventListener('click', event => {
        if (!selectTrigger.closest('.catalog-filter-popup-wrap').contains(event.target)) {
          selectTrigger.setAttribute('aria-expanded', 'false');
          selectPopup.hidden = true;
        }
      });
    }

    function fillForm(btn) {
      const isExisting = btn && btn.dataset.addressCity !== undefined;
      editedOption = isExisting ? btn : null;

      const fields = ['city', 'street', 'house', 'entrance', 'floor', 'flat', 'comment'];
      fields.forEach(name => {
        const input = form?.elements[name];
        if (!input) return;
        const key = 'address' + name.charAt(0).toUpperCase() + name.slice(1);
        input.value = isExisting ? (btn.dataset[key] ?? '') : '';
        const wrap = input.closest('[data-input-field]');
        if (wrap) wrap.classList.toggle('uk-s-value', input.value.trim() !== '');
      });

      const countryValue = isExisting ? (btn.dataset.addressCountry ?? 'Россия') : 'Россия';
      setCountry(countryValue);

      const privateCheckbox = form?.elements['private-house'];
      if (privateCheckbox) privateCheckbox.checked = false;
      if (detailsRow) detailsRow.hidden = false;

      if (submitBtn) submitBtn.textContent = isExisting ? 'Сохранить изменения' : 'Добавить адрес';
      if (deleteBtn) deleteBtn.hidden = !isExisting;
      if (!listView && title) title.textContent = isExisting ? 'Данные адреса' : 'Добавить адрес';
    }

    function showList() {
      if (!listView) return;
      listView.hidden = false;
      if (formView) formView.hidden = true;
      if (backButton) backButton.hidden = true;
      if (title) title.textContent = 'Адрес доставки';
      editedOption = null;
    }

    function showForm(option = null) {
      fillForm(option);
      if (listView) listView.hidden = true;
      if (formView) formView.hidden = false;
      if (backButton) backButton.hidden = false;
      if (title) title.textContent = option ? 'Данные адреса' : 'Новый адрес';
      window.requestAnimationFrame(() => form.querySelector('.uk-field__input')?.focus());
    }

    function syncSelectedAddress() {
      modal.querySelectorAll('[data-cart-address-option]').forEach(option => {
        const radio = option.querySelector('.cart-saved-list__radio');
        option.classList.toggle('is-selected', Boolean(radio?.checked));
      });
    }

    function deleteEditedAddress() {
      if (!editedOption) return;
      const item = editedOption.closest('[data-cart-address-option], .settings-list__item');
      if (!item) return;

      const deleteEvent = new CustomEvent('finntrail:profile-delete', {
        bubbles: true,
        cancelable: true,
        detail: { type: 'address', source: editedOption },
      });
      if (!editedOption.dispatchEvent(deleteEvent)) return;

      const list = item.parentElement;
      const wasSelected = Boolean(item.querySelector('input[type="radio"]:checked'));
      item.remove();

      if (wasSelected) {
        const nextRadio = list?.querySelector('input[type="radio"]');
        if (nextRadio) {
          nextRadio.checked = true;
          const nextItem = nextRadio.closest('[data-cart-address-option], .settings-list__item');
          const nextInfo = nextItem?.querySelector('.settings-list__info');
          if (nextInfo && !nextInfo.querySelector('.settings-list__badge')) {
            const badge = document.createElement('span');
            badge.className = 'settings-list__badge';
            badge.textContent = 'Основной';
            nextInfo.append(badge);
          }
        }
      }
      syncSelectedAddress();
      editedOption = null;
      closeModal();
    }

    openButtons.forEach(button => button.addEventListener('click', event => {
      event.preventDefault();
      if (listView) {
        showList();
      } else {
        fillForm(event.currentTarget);
      }
      window.clearTimeout(closeTimer);
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('is-modal-open');
      window.requestAnimationFrame(() => {
        modal.classList.add('is-open');
        closeButton?.focus();
      });
    }));

    backButton?.addEventListener('click', showList);
    addButton?.addEventListener('click', () => showForm());

    modal.querySelectorAll('[data-cart-address-edit]').forEach(button => {
      button.addEventListener('click', () => showForm(button.closest('[data-cart-address-option]')));
    });

    modal.querySelectorAll('input[name="saved-address"]').forEach(radio => {
      radio.addEventListener('change', syncSelectedAddress);
    });

    deleteBtn?.addEventListener('click', () => {
      if (!editedOption || !accountDeleteDialog) return;
      accountDeleteDialog.open({
        type: 'address',
        trigger: deleteBtn,
        onConfirm: deleteEditedAddress,
      });
    });

    selectButton?.addEventListener('click', () => {
      const option = modal.querySelector('input[name="saved-address"]:checked')?.closest('[data-cart-address-option]');
      if (!option) return;
      const address = [
        option.dataset.addressCity,
        option.dataset.addressStreet,
        option.dataset.addressHouse && `д. ${option.dataset.addressHouse}`,
        option.dataset.addressFlat && `кв. ${option.dataset.addressFlat}`,
      ].filter(Boolean).join(', ');
      if (summary) summary.textContent = address;
      closeModal();
    });

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
      const flat = form.elements.flat?.value.trim() || '';
      const address = [city, street, house && `д. ${house}`, flat && `кв. ${flat}`].filter(Boolean).join(', ');

      if (summary && address) {
        summary.textContent = address;
      }

      const fields = ['country', 'city', 'street', 'house', 'entrance', 'floor', 'flat', 'comment'];
      if (editedOption) {
        fields.forEach(name => {
          const input = form.elements[name];
          if (!input) return;
          const key = 'address' + name.charAt(0).toUpperCase() + name.slice(1);
          editedOption.dataset[key] = input.value;
        });
        const heading = editedOption.querySelector('.cart-saved-list__heading');
        const meta = editedOption.querySelector('.cart-saved-list__meta');
        if (heading) heading.textContent = address;
        if (meta) {
          meta.textContent = [
            form.elements.entrance?.value.trim() && `Подъезд ${form.elements.entrance.value.trim()}`,
            form.elements.floor?.value.trim() && `этаж ${form.elements.floor.value.trim()}`,
          ].filter(Boolean).join(', ');
        }
      }

      closeModal();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !modal.hidden) closeModal();
    });
  });

  // Settings — payment modal
  document.querySelectorAll('[data-cart-payment-modal]').forEach(modal => {
    const openButtons = document.querySelectorAll('[data-cart-payment-open]');
    const closeButtons = modal.querySelectorAll('[data-cart-payment-close]');
    const form = modal.querySelector('.cart-payment-modal__form');
    const submitBtn = modal.querySelector('.cart-payment-modal__submit');
    const deleteBtn = modal.querySelector('[data-cart-payment-delete]');
    let closeTimer = 0;

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('is-modal-open');
      closeTimer = window.setTimeout(() => { modal.hidden = true; }, 200);
    }

    function fillForm(btn) {
      const isExisting = btn && btn.dataset.cardNumber !== undefined;
      const fields = ['card-number', 'card-expiry', 'card-cvc'];
      fields.forEach(name => {
        const input = form?.elements[name];
        if (!input) return;
        const key = 'card' + name.slice(4).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        input.value = isExisting ? (btn.dataset[key] ?? '') : '';
        const wrap = input.closest('[data-input-field]');
        if (wrap) wrap.classList.toggle('uk-s-value', input.value.trim() !== '');
      });
      if (submitBtn) submitBtn.textContent = isExisting ? 'Сохранить изменения' : 'Привязать карту';
      if (deleteBtn) deleteBtn.hidden = !isExisting;
    }

    openButtons.forEach(button => button.addEventListener('click', event => {
      event.preventDefault();
      fillForm(event.currentTarget.dataset.cardNumber !== undefined ? event.currentTarget : null);
      window.clearTimeout(closeTimer);
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('is-modal-open');
      window.requestAnimationFrame(() => {
        modal.classList.add('is-open');
        modal.querySelector('.js-modal-close')?.focus();
      });
    }));

    closeButtons.forEach(button => button.addEventListener('click', closeModal));

    form?.querySelectorAll('.uk-field__input').forEach(input => {
      input.addEventListener('input', () => {
        const wrap = input.closest('[data-input-field]');
        if (wrap) wrap.classList.toggle('uk-s-value', input.value.trim() !== '');
      });
    });

    form?.addEventListener('submit', event => {
      event.preventDefault();
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

    // Кнопка подтверждения очистки — сбрасываем счётчик корзины
    modal.querySelector('.cart-clear-modal__actions a')?.addEventListener('click', () => {
      localStorage.setItem('cart_count', '0');
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !modal.hidden) closeModal();
    });
  });
}
