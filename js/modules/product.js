import { addMouseDrag, spriteHref } from './utils.js';

export function init() {
  // Product page — description modal
  document.querySelectorAll('[data-product-description-modal]').forEach(modal => {
    const openButtons = document.querySelectorAll('[data-product-description-open]');
    const closeButtons = modal.querySelectorAll('[data-product-description-close]');
    const closeButton = modal.querySelector('.product-description-modal__close');
    let closeTimer = 0;

    function openModal(event) {
      event?.preventDefault();
      window.clearTimeout(closeTimer);
      modal.hidden = false;
      document.documentElement.classList.add('is-modal-open');
      window.requestAnimationFrame(() => {
        modal.classList.add('is-open');
        closeButton?.focus();
      });
    }

    function closeModal() {
      modal.classList.remove('is-open');
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

  // Product page — upload review modal
  document.querySelectorAll('[data-product-upload-modal]').forEach(modal => {
    const openButtons = document.querySelectorAll('[data-product-conditions-upload-open]');
    const closeButtons = modal.querySelectorAll('[data-product-upload-close]');
    const closeButton = modal.querySelector('.product-upload-modal__close');
    const title = modal.querySelector('.product-upload-modal__title');
    const lead = modal.querySelector('.product-upload-modal__lead');
    const form = modal.querySelector('[data-product-upload-form]');
    const dropzone = modal.querySelector('[data-product-upload-dropzone]');
    const fileInput = modal.querySelector('[data-product-upload-file-input]');
    const fileButton = modal.querySelector('[data-product-upload-file-button]');
    const fileButtonText = fileButton?.querySelector('span');
    const previewList = modal.querySelector('[data-product-upload-filled]');
    const fileStatus = modal.querySelector('[data-product-upload-file-status]');
    const defaultTitle = title?.textContent || '';
    const defaultLead = lead?.textContent || '';
    const maxFiles = 8;
    const maxFileSize = 2 * 1024 * 1024;
    let selectedFiles = [];
    let previewUrls = [];
    let closeTimer = 0;

    function syncFileInput() {
      if (!fileInput || typeof DataTransfer === 'undefined') return;
      const transfer = new DataTransfer();
      selectedFiles.forEach(file => transfer.items.add(file));
      fileInput.files = transfer.files;
    }

    function clearPreviewUrls() {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      previewUrls = [];
    }

    function renderFiles() {
      if (!previewList) return;

      clearPreviewUrls();
      previewList.replaceChildren();

      selectedFiles.forEach((file, index) => {
        const item = document.createElement('div');
        const url = URL.createObjectURL(file);
        const media = file.type.startsWith('video/')
          ? document.createElement('video')
          : document.createElement('img');
        const remove = document.createElement('button');

        previewUrls.push(url);
        item.className = 'product-upload-modal__preview';
        media.src = url;
        media.setAttribute('aria-label', file.name);
        if (media instanceof HTMLImageElement) media.alt = file.name;
        if (media instanceof HTMLVideoElement) {
          media.muted = true;
          media.preload = 'metadata';
        }

        remove.className = 'product-upload-modal__preview-remove';
        remove.type = 'button';
        remove.dataset.productUploadRemove = String(index);
        remove.setAttribute('aria-label', `Удалить файл ${file.name}`);
        remove.innerHTML = `<svg aria-hidden="true"><use href="${spriteHref('icon-input-clear')}"></use></svg>`;

        item.append(media, remove);
        previewList.append(item);
      });

      const hasFiles = selectedFiles.length > 0;
      dropzone?.classList.toggle('is-filled', hasFiles);
      if (fileButtonText) fileButtonText.textContent = hasFiles ? 'Загрузить ещё' : 'Загрузить файлы';
    }

    function addFiles(fileList) {
      let limitExceeded = false;
      let sizeExceeded = false;
      const nextFiles = [...selectedFiles];

      Array.from(fileList || []).forEach(file => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        const exists = nextFiles.some(item => (
          `${item.name}-${item.size}-${item.lastModified}` === key
        ));
        if (exists) return;
        if (file.size > maxFileSize) {
          sizeExceeded = true;
          return;
        }
        if (nextFiles.length >= maxFiles) {
          limitExceeded = true;
          return;
        }
        nextFiles.push(file);
      });

      selectedFiles = nextFiles;
      syncFileInput();
      renderFiles();

      if (fileStatus) {
        if (sizeExceeded) {
          fileStatus.textContent = 'Размер одного файла не должен превышать 2 МБ';
          fileStatus.hidden = false;
        } else if (limitExceeded) {
          fileStatus.textContent = `Можно прикрепить не более ${maxFiles} файлов`;
          fileStatus.hidden = false;
        } else {
          fileStatus.hidden = true;
        }
      }
    }

    function resetModalState() {
      modal.classList.remove('is-success');
      selectedFiles = [];
      syncFileInput();
      clearPreviewUrls();
      previewList?.replaceChildren();
      dropzone?.classList.remove('is-filled');
      if (title) title.textContent = defaultTitle;
      if (lead) lead.textContent = defaultLead;
      if (fileButtonText) fileButtonText.textContent = 'Загрузить файлы';
      if (fileStatus) fileStatus.hidden = true;
    }

    function openModal(event) {
      event?.preventDefault();
      window.clearTimeout(closeTimer);
      resetModalState();
      modal.hidden = false;
      document.documentElement.classList.add('is-modal-open');
      window.requestAnimationFrame(() => {
        modal.classList.add('is-open');
        closeButton?.focus({ preventScroll: true });
      });
    }

    function closeModal() {
      modal.classList.remove('is-open');
      document.documentElement.classList.remove('is-modal-open');
      closeTimer = window.setTimeout(() => {
        modal.hidden = true;
      }, 200);
    }

    openButtons.forEach(button => button.addEventListener('click', openModal));
    closeButtons.forEach(button => button.addEventListener('click', closeModal));
    fileButton?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', () => addFiles(fileInput.files));
    previewList?.addEventListener('click', event => {
      const remove = event.target.closest('[data-product-upload-remove]');
      if (!remove) return;
      const index = Number(remove.dataset.productUploadRemove);
      if (!Number.isInteger(index)) return;
      selectedFiles.splice(index, 1);
      syncFileInput();
      if (fileStatus) fileStatus.hidden = true;
      renderFiles();
    });

    dropzone?.addEventListener('dragover', event => {
      event.preventDefault();
      dropzone.classList.add('is-dragover');
    });
    dropzone?.addEventListener('dragleave', event => {
      if (!dropzone.contains(event.relatedTarget)) dropzone.classList.remove('is-dragover');
    });
    dropzone?.addEventListener('drop', event => {
      event.preventDefault();
      dropzone.classList.remove('is-dragover');
      addFiles(event.dataTransfer?.files);
    });

    form?.addEventListener('submit', event => {
      event.preventDefault();
      if (!selectedFiles.length) {
        if (fileStatus) {
          fileStatus.textContent = 'Добавьте фотографию или видео';
          fileStatus.hidden = false;
        }
        return;
      }
      modal.classList.add('is-success');
      if (title) title.textContent = 'Изображения отправлены';
      if (lead) lead.textContent = 'Спасибо!\nВ ближайшее время мы сообщим о публикации';
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !modal.hidden) closeModal();
    });
  });


  // Product page — preorder modal
  document.querySelectorAll('[data-product-preorder-modal]').forEach(modal => {
    const openButtons = document.querySelectorAll('[data-product-preorder-open]');
    const closeButtons = modal.querySelectorAll('[data-product-preorder-close]');
    const closeButton = modal.querySelector('.product-preorder-modal__close');
    const form = modal.querySelector('[data-product-preorder-form]');
    const formScreen = modal.querySelector('[data-product-preorder-form-screen]');
    const successScreen = modal.querySelector('[data-product-preorder-success-screen]');
    const submitButton = modal.querySelector('[data-product-preorder-submit]');
    const continueButton = modal.querySelector('[data-product-preorder-continue]');
    let closeTimer = 0;

    function resetModal() {
      modal.classList.remove('is-success');
      form?.reset();
      if (formScreen) formScreen.hidden = false;
      if (successScreen) successScreen.hidden = true;
    }

    function openModal(event) {
      event?.preventDefault();
      window.clearTimeout(closeTimer);
      resetModal();
      modal.hidden = false;
      document.documentElement.classList.add('is-modal-open');
      window.requestAnimationFrame(() => {
        modal.classList.add('is-open');
        closeButton?.focus({ preventScroll: true });
      });
    }

    function closeModal() {
      modal.classList.remove('is-open');
      document.documentElement.classList.remove('is-modal-open');
      closeTimer = window.setTimeout(() => {
        modal.hidden = true;
        resetModal();
      }, 200);
    }

    function showSuccess(event) {
      event?.preventDefault();
      modal.classList.add('is-success');
      if (formScreen) formScreen.hidden = true;
      if (successScreen) successScreen.hidden = false;
      continueButton?.focus({ preventScroll: true });
    }

    openButtons.forEach(button => button.addEventListener('click', openModal));
    closeButtons.forEach(button => button.addEventListener('click', closeModal));
    submitButton?.addEventListener('click', showSuccess);
    form?.addEventListener('submit', showSuccess);
    continueButton?.addEventListener('click', closeModal);

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !modal.hidden) closeModal();
    });
  });

  // Product page — one-click order modal
  document.querySelectorAll('[data-product-one-click-modal]').forEach(modal => {
    const openButtons = [...document.querySelectorAll('[data-product-one-click-open]')];
    const closeButtons = modal.querySelectorAll('[data-product-one-click-close]');
    const closeButton = modal.querySelector('.product-one-click-modal__close');
    const form = modal.querySelector('[data-product-one-click-form]');
    let activeTrigger = null;
    let closeTimer = 0;

    function setFieldError(input, message = '') {
      const field = input?.closest('[data-input-field]');
      const caption = input
        ? document.getElementById(input.getAttribute('aria-describedby'))
        : null;
      field?.classList.toggle('is-error', Boolean(message));
      input?.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (caption) caption.textContent = message;
    }

    function resetForm() {
      form?.reset();
      form?.querySelectorAll('[data-input-field]').forEach(field => {
        field.classList.remove('is-error', 'uk-s-active', 'uk-s-value');
        const input = field.querySelector('input');
        input?.setAttribute('aria-invalid', 'false');
        const caption = field.querySelector('.uk-field__caption');
        if (caption) caption.textContent = '';
      });
    }

    function openModal(event) {
      event?.preventDefault();
      window.clearTimeout(closeTimer);
      activeTrigger = event?.currentTarget || null;
      resetForm();
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('is-modal-open');
      window.requestAnimationFrame(() => {
        modal.classList.add('is-open');
        closeButton?.focus({ preventScroll: true });
      });
    }

    function closeModal({ restoreFocus = true } = {}) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('is-modal-open');
      closeTimer = window.setTimeout(() => {
        modal.hidden = true;
        resetForm();
        if (restoreFocus && activeTrigger?.isConnected) {
          activeTrigger.focus({ preventScroll: true });
        }
        activeTrigger = null;
      }, 200);
    }

    function validateForm() {
      const nameInput = form?.elements.namedItem('name');
      const phoneInput = form?.elements.namedItem('phone');
      const emailInput = form?.elements.namedItem('email');
      const nameValue = nameInput?.value.trim() || '';
      const phoneDigits = phoneInput?.value.replace(/\D/g, '') || '';
      const emailValue = emailInput?.value.trim() || '';
      const emailValid = Boolean(emailValue) && emailInput?.validity.valid;

      setFieldError(nameInput, nameValue ? '' : 'Введите имя');
      setFieldError(phoneInput, phoneDigits.length === 11 ? '' : 'Введите полный номер телефона');
      setFieldError(emailInput, emailValid ? '' : 'Введите корректную электронную почту');

      const firstInvalid = form?.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus({ preventScroll: true });
      return !firstInvalid;
    }

    openButtons.forEach(button => button.addEventListener('click', openModal));
    closeButtons.forEach(button => button.addEventListener('click', () => closeModal()));

    form?.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => setFieldError(input));
    });

    form?.addEventListener('submit', event => {
      event.preventDefault();
      if (!validateForm()) return;

      modal.dispatchEvent(new CustomEvent('finntrail:one-click-submit', {
        bubbles: true,
        detail: { formData: new FormData(form) }
      }));
      closeModal();
    });

    modal.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeModal();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = [...modal.querySelectorAll(
        'button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])'
      )].filter(element => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  });

  // Product page — installment payment modal
  document.querySelectorAll('[data-product-installment-modal]').forEach(modal => {
    const openButtons = [...document.querySelectorAll('[data-product-installment-open]')];
    const closeButtons = modal.querySelectorAll('[data-product-installment-close]');
    const closeButton = modal.querySelector('.product-installment-modal__close');
    const providerButtons = [...modal.querySelectorAll('[data-installment-provider]')];
    const termButtons = [...modal.querySelectorAll('[data-installment-term]')];
    const lead = modal.querySelector('[data-product-installment-lead]');
    const schedule = modal.querySelector('[data-product-installment-schedule]');
    const submitButton = modal.querySelector('[data-product-installment-submit]');
    const currencyFormatter = new Intl.NumberFormat('ru-RU');
    let activeTrigger = null;
    let closeTimer = 0;
    let selectedProvider = 'parts';
    let selectedMonths = 3;
    let schedulePointerId = null;
    let scheduleStartX = 0;
    let scheduleStartScrollLeft = 0;
    let scheduleHasDragged = false;

    function getProductPrice() {
      const priceText = document.querySelector('.product-buy__price strong')?.textContent || '';
      const price = Number(priceText.replace(/\D/g, ''));
      return Number.isFinite(price) && price > 0 ? price : 30799;
    }

    function getMonthLabel(month) {
      const mod10 = month % 10;
      const mod100 = month % 100;
      if (mod10 === 1 && mod100 !== 11) return `${month} месяц`;
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${month} месяца`;
      return `${month} месяцев`;
    }

    function getPartsLabel(count) {
      const mod10 = count % 10;
      const mod100 = count % 100;
      if (mod10 === 1 && mod100 !== 11) return 'часть';
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'части';
      return 'частей';
    }

    function updateScheduleOverflow() {
      if (!schedule) return;
      schedule.classList.toggle(
        'is-scrollable',
        schedule.scrollWidth - schedule.clientWidth > 1
      );
    }

    function renderSchedule() {
      if (!schedule) return;

      const total = getProductPrice();
      const paymentCount = selectedMonths + 1;
      const basePayment = Math.floor(total / paymentCount);
      const remainder = total % paymentCount;
      const payments = Array.from(
        { length: paymentCount },
        (_, index) => basePayment + (index < remainder ? 1 : 0)
      ).slice(1);

      schedule.replaceChildren();
      payments.forEach((amount, index) => {
        const payment = document.createElement('div');
        const date = document.createElement('span');
        const value = document.createElement('strong');
        payment.className = 'product-installment-modal__payment';
        date.textContent = `Через ${getMonthLabel(index + 1)}`;
        value.textContent = `${currencyFormatter.format(amount)} ₽`;
        payment.append(date, value);
        schedule.append(payment);
      });
      schedule.scrollLeft = 0;
      window.requestAnimationFrame(updateScheduleOverflow);

      if (lead) {
        lead.textContent = `Расчёт примерного платежа. Оставшиеся ${selectedMonths} ${getPartsLabel(selectedMonths)} спишутся автоматически`;
      }
    }

    function syncSelection() {
      providerButtons.forEach(button => {
        const isActive = button.dataset.installmentProvider === selectedProvider;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-selected', String(isActive));
        button.tabIndex = isActive ? 0 : -1;
      });

      termButtons.forEach(button => {
        const isActive = Number(button.dataset.installmentTerm) === selectedMonths;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });

      renderSchedule();
    }

    function resetModal() {
      selectedProvider = 'parts';
      selectedMonths = 3;
      syncSelection();
    }

    function openModal(event) {
      event?.preventDefault();
      window.clearTimeout(closeTimer);
      activeTrigger = event?.currentTarget || null;
      resetModal();
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('is-modal-open');
      window.requestAnimationFrame(() => {
        modal.classList.add('is-open');
        closeButton?.focus({ preventScroll: true });
      });
    }

    function closeModal({ restoreFocus = true } = {}) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('is-modal-open');
      closeTimer = window.setTimeout(() => {
        modal.hidden = true;
        if (restoreFocus && activeTrigger?.isConnected) {
          activeTrigger.focus({ preventScroll: true });
        }
        activeTrigger = null;
      }, 200);
    }

    openButtons.forEach(button => button.addEventListener('click', openModal));
    closeButtons.forEach(button => button.addEventListener('click', () => closeModal()));

    if (schedule) {
      schedule.addEventListener('pointerdown', event => {
        if (event.pointerType !== 'mouse' || event.button !== 0) return;
        if (!schedule.classList.contains('is-scrollable')) return;

        schedulePointerId = event.pointerId;
        scheduleStartX = event.clientX;
        scheduleStartScrollLeft = schedule.scrollLeft;
        scheduleHasDragged = false;
        schedule.setPointerCapture(schedulePointerId);
      });

      schedule.addEventListener('pointermove', event => {
        if (event.pointerId !== schedulePointerId) return;

        const delta = event.clientX - scheduleStartX;
        if (!scheduleHasDragged && Math.abs(delta) < 5) return;

        scheduleHasDragged = true;
        schedule.classList.add('is-dragging');
        schedule.scrollLeft = scheduleStartScrollLeft - delta;
        event.preventDefault();
      });

      const stopScheduleDragging = event => {
        if (event.pointerId !== schedulePointerId) return;

        if (schedule.hasPointerCapture(schedulePointerId)) {
          schedule.releasePointerCapture(schedulePointerId);
        }
        schedulePointerId = null;
        schedule.classList.remove('is-dragging');
        window.setTimeout(() => {
          scheduleHasDragged = false;
        }, 0);
      };

      schedule.addEventListener('pointerup', stopScheduleDragging);
      schedule.addEventListener('pointercancel', stopScheduleDragging);
      schedule.addEventListener('dragstart', event => event.preventDefault());
      schedule.addEventListener('keydown', event => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

        event.preventDefault();
        const payment = schedule.querySelector('.product-installment-modal__payment');
        const gap = Number.parseFloat(getComputedStyle(schedule).columnGap) || 0;
        const step = (payment?.getBoundingClientRect().width || 96) + gap;
        schedule.scrollBy({
          left: event.key === 'ArrowRight' ? step : -step,
          behavior: 'smooth'
        });
      });
      window.addEventListener('resize', updateScheduleOverflow);
    }

    providerButtons.forEach(button => {
      button.addEventListener('click', () => {
        selectedProvider = button.dataset.installmentProvider;
        syncSelection();
      });

      button.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

        event.preventDefault();
        const currentIndex = providerButtons.indexOf(button);
        let nextIndex = currentIndex;

        if (event.key === 'ArrowLeft') {
          nextIndex = (currentIndex - 1 + providerButtons.length) % providerButtons.length;
        } else if (event.key === 'ArrowRight') {
          nextIndex = (currentIndex + 1) % providerButtons.length;
        } else if (event.key === 'Home') {
          nextIndex = 0;
        } else if (event.key === 'End') {
          nextIndex = providerButtons.length - 1;
        }

        providerButtons[nextIndex].click();
        providerButtons[nextIndex].focus();
      });
    });

    termButtons.forEach(button => {
      button.addEventListener('click', () => {
        selectedMonths = Number(button.dataset.installmentTerm);
        syncSelection();
      });
    });

    submitButton?.addEventListener('click', () => {
      modal.dispatchEvent(new CustomEvent('finntrail:installment-selected', {
        bubbles: true,
        detail: {
          provider: selectedProvider,
          months: selectedMonths,
          productPrice: getProductPrice()
        }
      }));
      closeModal();
    });

    modal.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeModal();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = [...modal.querySelectorAll(
        'button:not(:disabled), [tabindex]:not([tabindex="-1"])'
      )].filter(element => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    resetModal();
  });

  // Product page — cart confirmation modal
  document.querySelectorAll('[data-product-cart-modal]').forEach(modal => {
    const openButtons = [...document.querySelectorAll('[data-product-cart-open]')];
    const closeButtons = modal.querySelectorAll('[data-product-cart-close]');
    const closeButton = modal.querySelector('.product-cart-modal__close');
    const continueButton = modal.querySelector('[data-product-cart-continue]');
    const removeButton = modal.querySelector('[data-product-cart-remove]');
    const minusButton = modal.querySelector('[data-product-cart-minus]');
    const plusButton = modal.querySelector('[data-product-cart-plus]');
    const quantityOutput = modal.querySelector('[data-product-cart-quantity]');
    const productImage = modal.querySelector('[data-product-cart-image]');
    const productTitle = modal.querySelector('[data-product-cart-title]');
    const productPrice = modal.querySelector('[data-product-cart-price]');
    const productOldPrice = modal.querySelector('[data-product-cart-old-price]');
    let activeTrigger = null;
    let closeTimer = 0;
    let quantity = 1;

    function syncQuantity() {
      if (quantityOutput) quantityOutput.value = String(quantity);
      if (quantityOutput) quantityOutput.textContent = String(quantity);
      if (minusButton) minusButton.setAttribute('aria-disabled', quantity <= 1 ? 'true' : 'false');
    }

    function syncProduct() {
      const sourceTitle = document.querySelector('#product-title');
      const sourcePrice = document.querySelector('.product-buy__price strong');
      const sourceOldPrice = document.querySelector('.product-buy__price del');

      if (productTitle && sourceTitle) {
        const title = sourceTitle.textContent.trim();
        productTitle.textContent = title;
        if (productImage) productImage.alt = title;
      }
      if (productPrice && sourcePrice) productPrice.textContent = sourcePrice.textContent.trim();
      if (productOldPrice && sourceOldPrice) {
        productOldPrice.textContent = sourceOldPrice.textContent.trim();
        productOldPrice.hidden = false;
      } else if (productOldPrice) {
        productOldPrice.hidden = true;
      }
    }

    function openModal(event) {
      event?.preventDefault();
      window.clearTimeout(closeTimer);
      activeTrigger = event?.currentTarget || null;
      quantity = 1;
      syncQuantity();
      syncProduct();
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('is-modal-open');
      window.requestAnimationFrame(() => {
        openButtons.forEach(button => {
          button.classList.add('is-in-cart');
          button.setAttribute('aria-label', 'Товар в корзине');
        });
        modal.classList.add('is-open');
        closeButton?.focus({ preventScroll: true });
      });
    }

    function closeModal({ restoreFocus = true } = {}) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('is-modal-open');
      closeTimer = window.setTimeout(() => {
        modal.hidden = true;
        if (restoreFocus && activeTrigger?.isConnected) {
          activeTrigger.focus({ preventScroll: true });
        }
        activeTrigger = null;
      }, 200);
    }

    function removeProduct() {
      openButtons.forEach(button => {
        button.classList.remove('is-in-cart');
        button.removeAttribute('aria-label');
        button.querySelector('use')?.setAttribute('href', spriteHref('icon-hero-bag'));
      });
      document.dispatchEvent(new CustomEvent('finntrail:cart-item-removed'));
      closeModal();
    }

    openButtons.forEach(button => button.addEventListener('click', openModal));
    closeButtons.forEach(button => button.addEventListener('click', () => closeModal()));
    continueButton?.addEventListener('click', () => closeModal());
    removeButton?.addEventListener('click', removeProduct);
    minusButton?.addEventListener('click', () => {
      quantity = Math.max(1, quantity - 1);
      syncQuantity();
    });
    plusButton?.addEventListener('click', () => {
      quantity += 1;
      syncQuantity();
    });

    modal.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeModal();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = [...modal.querySelectorAll(
        'a[href], button:not(:disabled), [tabindex]:not([tabindex="-1"])'
      )].filter(element => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    syncQuantity();
  });

  // Product page — color picker
  document.querySelectorAll('.product-option--color-picker').forEach(option => {
    const trigger   = option.querySelector('.js-color-trigger');
    const dropdown  = option.querySelector('.product-option__color-dropdown');
    const swatch    = option.querySelector('.product-option__color-swatch');
    const nameEl    = option.querySelector('.product-option__color-name');
    const section   = option.closest('.product-detail');
    const page      = option.closest('.product-page');

    const colorList = dropdown.querySelector('.product-option__color-list');

    if (!trigger || !dropdown || !colorList) return;

    function updateColorScrollbar() {
      const trackHeight = 336;
      const thumbHeight = 159;
      const maxThumbOffset = Math.max(0, trackHeight - thumbHeight - 4);
      const maxScroll = Math.max(0, colorList.scrollHeight - colorList.clientHeight);
      const progress = maxScroll > 0 ? colorList.scrollTop / maxScroll : 0;
      dropdown.style.setProperty('--color-scroll-thumb-y', `${Math.round(progress * maxThumbOffset)}px`);
    }

    // Инициализируем начальное состояние из первого is-selected
    function applyColor(item) {
      const color   = item.dataset.color;
      const name    = item.dataset.name;
      const inStock = item.dataset.inStock === 'true';

      // Обновляем свотч в кнопке
      if (color === 'bw') {
        swatch.innerHTML = `<svg aria-hidden="true"><use href="${spriteHref('icon-color-bw')}"></use></svg>`;
        swatch.style.background = 'none';
        swatch.style.borderRadius = '0';
      } else {
        swatch.innerHTML = '';
        swatch.style.background = color;
        swatch.style.borderRadius = '24px';
      }

      // Обновляем название
      nameEl.textContent = name;
      nameEl.title = name;
      // Градиент только если текст обрезается
      requestAnimationFrame(() => {
        nameEl.classList.toggle('is-truncated', nameEl.scrollWidth > nameEl.clientWidth);
      });

      // Переключаем OOS-состояние
      section.classList.toggle('product-detail--oos', !inStock);
      page?.classList.toggle('product-page--oos', !inStock);

      // Отмечаем is-selected
      dropdown.querySelectorAll('.js-color-item').forEach(i => {
        i.classList.toggle('is-selected', i === item);
        i.setAttribute('aria-selected', i === item ? 'true' : 'false');
      });
    }

    // Применяем начальное состояние
    const initial = dropdown.querySelector('.js-color-item.is-selected')
                 || dropdown.querySelector('.js-color-item');
    if (initial) applyColor(initial);

    // Открыть / закрыть дропдаун
    trigger.addEventListener('click', () => {
      const isOpen = !dropdown.hidden;
      dropdown.hidden = isOpen;
      trigger.setAttribute('aria-expanded', String(!isOpen));
      if (isOpen) return;
      requestAnimationFrame(updateColorScrollbar);
    });

    colorList.addEventListener('scroll', updateColorScrollbar, { passive: true });
    colorList.addEventListener('wheel', event => {
      const maxScroll = colorList.scrollHeight - colorList.clientHeight;
      if (maxScroll <= 0) {
        event.preventDefault();
        return;
      }

      const atTop = colorList.scrollTop <= 0;
      const atBottom = Math.ceil(colorList.scrollTop + colorList.clientHeight) >= colorList.scrollHeight;
      const scrollingUp = event.deltaY < 0;
      const scrollingDown = event.deltaY > 0;

      if ((atTop && scrollingUp) || (atBottom && scrollingDown)) {
        event.preventDefault();
      }
    }, { passive: false });

    // Выбор цвета
    dropdown.addEventListener('click', e => {
      const item = e.target.closest('.js-color-item');
      if (!item) return;
      applyColor(item);
      dropdown.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    });

    // Закрыть при клике вне
    document.addEventListener('click', e => {
      if (!option.contains(e.target)) {
        dropdown.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
      }
    });

    updateColorScrollbar();
  });

  // Product page — size selector
  document.querySelectorAll('.product-option--sizes .product-option__sizes').forEach(group => {
    group.addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn || btn.disabled) return;
      group.querySelectorAll('button').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });

  // Похожие товары — бесконечная карусель
  document.querySelectorAll('.product-similar').forEach(section => {
    const container = section.querySelector('.product-similar__cards');
    const prevBtn   = section.querySelector('[aria-label="Предыдущие"]');
    const nextBtn   = section.querySelector('[aria-label="Следующие"]');
    if (!container || !prevBtn || !nextBtn) return;

    const VISIBLE = 2;
    const GAP     = 8;

    // Реальные карточки
    const realCards = [...container.querySelectorAll('.product-similar__card')];
    const totalPages = Math.ceil(realCards.length / VISIBLE);

    // Создаём трек
    const track = document.createElement('div');
    track.className = 'product-similar__track';
    container.innerHTML = '';
    container.appendChild(track);

    // Клоны последней страницы в начало (для prev с первой страницы)
    realCards.slice(-VISIBLE).forEach(c => {
      const cl = c.cloneNode(true);
      cl.setAttribute('aria-hidden', 'true');
      track.appendChild(cl);
    });
    // Реальные карточки
    realCards.forEach(c => track.appendChild(c));
    // Клоны первой страницы в конец (для next с последней страницы)
    realCards.slice(0, VISIBLE).forEach(c => {
      const cl = c.cloneNode(true);
      cl.setAttribute('aria-hidden', 'true');
      track.appendChild(cl);
    });

    // Начинаем с индекса 1 — первая реальная страница
    let idx         = 1;
    let isAnimating = false;

    function measure() {
      // Возвращает ширину контейнера — 0 если скрыт
      return container.offsetWidth;
    }

    function layout() {
      const W = measure();
      if (W === 0) return; // скрыт, ResizeObserver вызовет нас позже
      const cw = (W - GAP * (VISIBLE - 1)) / VISIBLE;
      const pw = W + GAP; // ширина одного «слота» = контейнер + межкарточный gap
      track.querySelectorAll('.product-similar__card').forEach(c => {
        c.style.width      = cw + 'px';
        c.style.flexShrink = '0';
      });
      // Перепозиционируем без анимации (ширина могла измениться)
      track.style.transition = 'none';
      track.style.transform  = `translateX(${-idx * pw}px)`;
      // Сохраняем pw для кликов
      track._pw = pw;
    }

    function moveTo(i, animate) {
      track.style.transition = animate
        ? 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        : 'none';
      track.style.transform = `translateX(${-i * (track._pw || measure() + GAP)}px)`;
    }

    track.addEventListener('transitionend', () => {
      if (idx === totalPages + 1) { idx = 1; moveTo(idx, false); }
      else if (idx === 0)          { idx = totalPages; moveTo(idx, false); }
      isAnimating = false;
    });

    prevBtn.disabled = false;
    nextBtn.disabled = false;

    prevBtn.addEventListener('click', () => {
      if (isAnimating) return;
      isAnimating = true;
      moveTo(--idx, true);
    });

    nextBtn.addEventListener('click', () => {
      if (isAnimating) return;
      isAnimating = true;
      moveTo(++idx, true);
    });

    // ResizeObserver срабатывает и при первом появлении секции (OOS), и при ресайзе окна
    new ResizeObserver(() => layout()).observe(container);
  });

  // Product page — "В реальных условиях" slider
  document.querySelectorAll('[data-product-conditions]').forEach(section => {
    const viewport = section.querySelector('.product-conditions__viewport');
    const track = section.querySelector('.product-conditions__track');
    const prevButton = section.querySelector('[data-product-conditions-prev]');
    const nextButton = section.querySelector('[data-product-conditions-next]');
    const slides = Array.from(section.querySelectorAll('.product-conditions__upload-card, .product-conditions__slide'));

    if (!viewport || !track || !prevButton || !nextButton || slides.length < 2) return;

    let index = 0;
    let maxIndex = 0;
    let step = 0;

    function readGap() {
      const styles = window.getComputedStyle(track);
      return parseFloat(styles.columnGap || styles.gap) || 0;
    }

    function measure() {
      const firstSlide = slides[0];
      const slideWidth = firstSlide.getBoundingClientRect().width;
      step = slideWidth + readGap();
      const overflow = Math.max(0, track.scrollWidth - viewport.clientWidth);
      maxIndex = step > 0 ? Math.ceil(overflow / step) : 0;
      index = Math.min(index, maxIndex);
      update(false);
    }

    function update(animate = true) {
      const overflow = Math.max(0, track.scrollWidth - viewport.clientWidth);
      const offset = Math.min(index * step, overflow);
      track.style.transition = animate ? 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none';
      track.style.transform = `translateX(${-offset}px)`;
      prevButton.disabled = index <= 0;
      nextButton.disabled = index >= maxIndex;
    }

    prevButton.addEventListener('click', () => {
      index = Math.max(0, index - 1);
      update();
    });

    nextButton.addEventListener('click', () => {
      index = Math.min(maxIndex, index + 1);
      update();
    });

    new ResizeObserver(measure).observe(viewport);
    window.addEventListener('load', measure);
    measure();

    addMouseDrag(viewport, 50, dir => {
      index = Math.max(0, Math.min(maxIndex, index + dir));
      update();
    });
  });

  // Product page — real conditions images as stories
  document.querySelectorAll('[data-product-conditions]').forEach(section => {
    const modal = document.querySelector('[data-product-conditions-stories-modal]');
    if (!modal) return;

    const sourceSlides = Array.from(section.querySelectorAll('.product-conditions__slide'))
      .map(slide => ({ slide, image: slide.querySelector('img.product-conditions__media') }))
      .filter(item => item.image);

    if (!sourceSlides.length) return;

    const media = modal.querySelector('[data-product-conditions-stories-media]');
    const progress = modal.querySelector('[data-product-conditions-stories-progress]');
    const closeButtons = modal.querySelectorAll('[data-product-conditions-stories-close]');
    const prevButton = modal.querySelector('[data-product-conditions-stories-prev]');
    const nextButton = modal.querySelector('[data-product-conditions-stories-next]');
    const sidePrev = modal.querySelector('[data-product-conditions-stories-side-prev]');
    const sideNext = modal.querySelector('[data-product-conditions-stories-side-next]');
    const sideFarPrev = modal.querySelector('[data-product-conditions-stories-side-far-prev]');
    const sideFarNext = modal.querySelector('[data-product-conditions-stories-side-far-next]');
    const slides = [];
    const progressItems = [];
    let activeIndex = 0;
    let autoplayId = 0;

    if (!media || !progress) return;

    function getSourceData(image) {
      return {
        src: image.currentSrc || image.getAttribute('src') || '',
        srcset: image.getAttribute('srcset') || '',
        alt: image.getAttribute('alt') || 'FINNTRAIL в реальных условиях',
      };
    }

    function normalize(index) {
      return (index + slides.length) % slides.length;
    }

    function stopAutoplay() {
      window.clearTimeout(autoplayId);
      autoplayId = 0;
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayId = window.setTimeout(() => goTo(activeIndex + 1), 5000);
    }

    function setPreview(preview, index) {
      if (!preview || !slides.length) return;
      const data = slides[normalize(index)].dataset;
      preview.src = data.storySrc || '';
      if (data.storySrcset) {
        preview.srcset = data.storySrcset;
      } else {
        preview.removeAttribute('srcset');
      }
    }

    function goTo(index) {
      if (!slides.length) return;
      activeIndex = normalize(index);

      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      setPreview(sidePrev, activeIndex - 1);
      setPreview(sideNext, activeIndex + 1);
      setPreview(sideFarPrev, activeIndex - 2);
      setPreview(sideFarNext, activeIndex + 2);

      progressItems.forEach((item, itemIndex) => {
        item.classList.toggle('is-filled', itemIndex < activeIndex);
        item.classList.toggle('is-active', itemIndex === activeIndex);
        const bar = item.querySelector('span');
        if (bar) {
          bar.style.animation = 'none';
          void bar.offsetWidth;
          bar.style.animation = '';
        }
      });

      startAutoplay();
    }

    function openStories(index) {
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('is-modal-open');
      goTo(index);
    }

    function closeStories() {
      stopAutoplay();
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('is-modal-open');
    }

    sourceSlides.forEach(({ slide, image }, index) => {
      const data = getSourceData(image);
      const storyImage = document.createElement('img');
      storyImage.className = 'stories-modal__slide';
      storyImage.src = data.src;
      if (data.srcset) storyImage.srcset = data.srcset;
      storyImage.sizes = '405px';
      storyImage.alt = data.alt;
      storyImage.loading = 'lazy';
      storyImage.dataset.storySrc = data.src;
      storyImage.dataset.storySrcset = data.srcset;
      media.appendChild(storyImage);
      slides.push(storyImage);

      const progressItem = document.createElement('span');
      progressItem.className = 'stories-modal__progress-item';
      progressItem.appendChild(document.createElement('span'));
      progress.appendChild(progressItem);
      progressItems.push(progressItem);

      slide.classList.add('is-story-openable');
      slide.setAttribute('role', 'button');
      slide.tabIndex = 0;
      slide.setAttribute('aria-label', 'Открыть фото в полноэкранном просмотре');
      slide.addEventListener('click', () => openStories(index));
      slide.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        openStories(index);
      });
    });

    closeButtons.forEach(button => button.addEventListener('click', closeStories));
    prevButton?.addEventListener('click', () => goTo(activeIndex - 1));
    nextButton?.addEventListener('click', () => goTo(activeIndex + 1));

    document.addEventListener('keydown', event => {
      if (modal.hidden) return;
      if (event.key === 'Escape') closeStories();
      if (event.key === 'ArrowLeft') goTo(activeIndex - 1);
      if (event.key === 'ArrowRight') goTo(activeIndex + 1);
    });
  });
  // OOS form — кнопка «Связаться» задизейблена пока email не введён
  document.querySelectorAll('.product-oos-form').forEach(form => {
    const input = form.querySelector('.product-oos-form__input');
    const btn   = form.querySelector('button');
    if (!input || !btn) return;

    btn.disabled = true;

    input.addEventListener('input', () => {
      btn.disabled = input.value.trim() === '';
    });
  });

  // Product page — характеристики и преимущества (горизонтальный слайдер)
  document.querySelectorAll('.product-props').forEach(section => {
    const track = section.querySelector('.product-props__track');
    const btnPrev = section.querySelector('.js-slider-prev');
    const btnNext = section.querySelector('.js-slider-next');

    if (!track || !btnPrev || !btnNext) return;

    const getScrollStep = () => {
      const item = track.querySelector('.product-props__item');
      const itemW = item ? item.getBoundingClientRect().width : 250;
      return itemW * 3;
    };

    const updateButtons = () => {
      btnPrev.disabled = track.scrollLeft <= 0;
      btnNext.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
    };

    btnPrev.addEventListener('click', () => {
      track.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
    });

    btnNext.addEventListener('click', () => {
      track.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
    });

    track.addEventListener('scroll', updateButtons, { passive: true });
    updateButtons();

    addMouseDrag(track, 50, dir => track.scrollBy({ left: dir * getScrollStep(), behavior: 'smooth' }));
  });

  // Product page — технологии: touch-scroll и drag мышью на mobile/tablet.
  document.querySelectorAll('.product-highlight-row').forEach(track => {
    const getScrollStep = () => {
      const card = track.querySelector('.product-highlight');
      if (!card) return 300;

      const styles = window.getComputedStyle(track);
      const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
      return card.getBoundingClientRect().width + gap;
    };

    addMouseDrag(track, 40, direction => {
      if (!window.matchMedia('(max-width: 1279px)').matches) return;
      track.scrollBy({ left: direction * getScrollStep(), behavior: 'smooth' });
    });
  });

  // ── Product page — отзывы ─────────────────────────────────────────────────

  // Сортировка: toggle дропдауна
  document.querySelectorAll('[data-reviews-sort]').forEach(wrap => {
    const btn  = wrap.querySelector('[data-reviews-sort-btn]');
    const menu = wrap.querySelector('.product-reviews__sort-dropdown');
    if (!btn || !menu) return;

    const close = () => {
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    };

    btn.addEventListener('click', e => {
      e.stopPropagation();
      const open = menu.hidden;
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
    });

    menu.querySelectorAll('button').forEach(opt => {
      opt.addEventListener('click', () => {
        menu.querySelectorAll('button').forEach(o => o.removeAttribute('aria-selected'));
        opt.setAttribute('aria-selected', 'true');
        wrap.querySelector('.product-reviews__sort-label').textContent = opt.textContent.trim();
        close();
      });
    });

    document.addEventListener('click', close);
  });

  // Форма: кликабельные звёзды-эллипсы
  document.querySelectorAll('[data-reviews-form-stars]').forEach(starsEl => {
    const stars  = [...starsEl.querySelectorAll('.js-review-star')];
    const formEl = starsEl.closest('[data-reviews-form]');
    const numEl  = formEl?.querySelector('[data-reviews-rating-num]');
    const ratingInput = formEl?.querySelector('[data-reviews-rating-input]');

    const setRating = value => {
      stars.forEach(s => {
        s.classList.toggle('is-active', Number(s.dataset.value) <= value);
        s.classList.remove('is-preview');
      });
      if (numEl) numEl.textContent = value;
      if (ratingInput) ratingInput.value = String(value);
      formEl?.classList.toggle('personal-rating-card--rated', value > 0);
    };

    // Инициализируем из начального состояния (4 активных)
    const initialActive = stars.filter(s => s.classList.contains('is-active'));
    if (initialActive.length && numEl) numEl.textContent = initialActive.length;

    stars.forEach(star => {
      star.addEventListener('click', () => setRating(Number(star.dataset.value)));

      // Hover preview
      star.addEventListener('mouseenter', () => {
        stars.forEach(s => {
          s.classList.toggle('is-preview', Number(s.dataset.value) <= Number(star.dataset.value));
        });
      });
    });

    starsEl.addEventListener('mouseleave', () => {
      stars.forEach(s => s.classList.remove('is-preview'));
    });
  });

  // Показать ещё отзывы
  document.querySelectorAll('[data-reviews-load-more]').forEach(btn => {
    const extra = btn.closest('[data-reviews-list]')
                    ?.querySelector('[data-reviews-extra]');
    if (!extra) return;

    btn.addEventListener('click', () => {
      extra.hidden = false;
      btn.hidden = true;
      // скрываем и финальный разделитель перед кнопкой, если нужно
    });
  });

  // Соответствие размеру
  document.querySelectorAll('[data-reviews-fit]').forEach(group => {
    const btns = [...group.querySelectorAll('.js-review-fit')];
    const fitInput = group.parentElement?.querySelector('[data-reviews-fit-input]');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('product-reviews__fit-btn--active'));
        btn.classList.add('product-reviews__fit-btn--active');
        if (fitInput) fitInput.value = btn.dataset.fit || '';
      });
    });
  });

  // ── Product page — переключение kit-items (desktop + mobile) ────────────
  // Находим все контейнеры с [data-kit-switch] (product-info-section и product-store-info).
  // Для каждого: клик на item → is-active на нём, обновляем title/article/desc
  // в ближайшем элементе с совпадающим data-kit-section.
  document.querySelectorAll('[data-kit-switch]').forEach(switchEl => {
    const sectionKey = switchEl.dataset.kitSection;
    const items = [...switchEl.querySelectorAll('[data-kit-item]')];

    // Ищем текстовый контейнер: тот же data-kit-section, но НЕ сам switchEl.
    // Атрибуты data-kit-title/article/desc — на дочерних элементах внутри контейнера.
    const textContainer = document.querySelector(
      `[data-kit-section="${sectionKey}"]:not([data-kit-switch])`
    );

    items.forEach(item => {
      item.addEventListener('click', () => {
        // Снимаем active со всех
        items.forEach(i => i.classList.remove('is-active'));
        item.classList.add('is-active');

        if (!textContainer) return;

        // Обновляем текст если есть данные
        const titleEl   = textContainer.querySelector('[data-kit-title]');
        const articleEl = textContainer.querySelector('[data-kit-article]');
        const descEl    = textContainer.querySelector('[data-kit-desc]');
        const cartButton = textContainer.querySelector('[data-kit-cart-button]');

        if (titleEl   && item.dataset.title)   titleEl.textContent   = item.dataset.title;
        if (articleEl && item.dataset.article) articleEl.textContent = item.dataset.article;
        if (descEl    && item.dataset.desc)    descEl.textContent    = item.dataset.desc;
        if (cartButton) {
          const cartLabel = item.dataset.cartLabel || `Добавить ${item.dataset.title || 'товар'} в корзину`;
          cartButton.setAttribute('aria-label', cartLabel);
          cartButton.classList.remove('is-in-cart');
          const cartIcon = cartButton.querySelector('use');
          if (cartIcon) cartIcon.setAttribute('href', spriteHref('icon-hero-bag'));
          const cartText = cartButton.querySelector('.product-info-section__cart-label');
          if (cartText) cartText.textContent = 'В корзину';
        }
      });
    });
  });

  // ── Product page — форма отзыва (mobile bottom sheet) ────────────────────
  const reviewsRight = document.querySelector('.product-reviews__right');

  const openReviewForm = () => {
    if (!reviewsRight) return;
    reviewsRight.classList.add('is-open');
    document.documentElement.classList.add('is-modal-open');
  };

  const closeReviewForm = () => {
    if (!reviewsRight) return;
    reviewsRight.classList.remove('is-open');
    document.documentElement.classList.remove('is-modal-open');
  };

  // Открытие по кнопке «Отправить отзыв» (mobile)
  document.querySelectorAll('[data-reviews-form-open]').forEach(btn => {
    btn.addEventListener('click', openReviewForm);
  });

  // Закрытие по крестику внутри формы
  document.querySelectorAll('[data-reviews-form-close]').forEach(btn => {
    btn.addEventListener('click', closeReviewForm);
  });

  // Закрытие по клику на backdrop (область вне панели формы)
  reviewsRight?.addEventListener('click', e => {
    if (e.target === reviewsRight) closeReviewForm();
  });

  // Закрытие по Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && reviewsRight?.classList.contains('is-open')) {
      closeReviewForm();
    }
  });

  // ── Product page — аккордеон product-specs (мобильный) ──────────────────
  // На десктопе панели всегда видны (display: contents в CSS).
  // На мобиле клик по кнопке тоглит is-open на панели и aria-expanded на кнопке.
  document.querySelectorAll('[data-specs-accordion-btn]').forEach(btn => {
    const parent = btn.parentElement;
    const panel  = parent?.querySelector('[data-specs-accordion-panel]');
    if (!panel) return;

    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      panel.classList.toggle('is-open', !expanded);
    });
  });

  // ── Product page — раскрытие характеристик
  document.querySelectorAll('[data-product-specs-expand]').forEach(btn => {
    const table = btn.closest('[data-product-specs-table]');
    if (!table) return;

    btn.addEventListener('click', () => {
      const expanded = table.classList.toggle('is-expanded');
      btn.setAttribute('aria-expanded', String(expanded));
      btn.querySelector('.product-specs__expand-label').textContent = expanded
        ? 'Свернуть характеристики'
        : 'Развернуть все характеристики';
    });
  });

  // Product page — media carousel
  document.querySelectorAll('.product-detail__media').forEach(media => {
    const mainImage = media.querySelector('.product-detail__image');
    const carousel = media.querySelector('.product-media-carousel');
    const inner = media.querySelector('.product-media-carousel__inner');
    const items = [...media.querySelectorAll('.js-carousel-item')];
    const btnPrev = media.querySelector('.js-slider-prev');
    const btnNext = media.querySelector('.js-slider-next');
    const zoomButton = media.querySelector('[data-product-gallery-open]');
    const galleryModal = document.querySelector('[data-product-gallery-modal]');
    const galleryImage = galleryModal?.querySelector('[data-product-gallery-image]');
    const galleryThumbs = galleryModal?.querySelector('[data-product-gallery-thumbs]');
    const galleryPrev = galleryModal?.querySelector('[data-product-gallery-prev]');
    const galleryNext = galleryModal?.querySelector('[data-product-gallery-next]');
    const galleryCloseButtons = galleryModal ? [...galleryModal.querySelectorAll('[data-product-gallery-close]')] : [];

    if (!inner || !items.length) return;

    let currentIndex = 0;
    let galleryIndex = 0;
    let galleryBuilt = false;

    function getMetrics() {
      const firstItem = items[0];
      const styles = window.getComputedStyle(inner);
      const gap = parseFloat(styles.columnGap || styles.gap) || 0;
      const itemWidth = firstItem?.getBoundingClientRect().width || 0;
      const viewport = carousel?.clientWidth || inner.parentElement?.clientWidth || 0;
      return { gap, itemWidth, viewport };
    }

    function goTo(index) {
      const count = items.length;
      currentIndex = (index + count) % count;

      items.forEach((item, i) => item.classList.toggle('is-active', i === currentIndex));

      // Switch main image
      if (mainImage) {
        const thumb = items[currentIndex].querySelector('img');
        if (thumb) {
          const nextSrc = thumb.getAttribute('src') || thumb.src;
          const nextSrcset = thumb.getAttribute('srcset') || '';

          mainImage.src = nextSrc;
          mainImage.srcset = nextSrcset;
        }
      }

      // Translate inner strip so the active thumb is centered in the visible viewport.
      const { gap, itemWidth, viewport } = getMetrics();
      const activeCenter = currentIndex * (itemWidth + gap) + itemWidth / 2;
      const trackWidth = items.length * itemWidth + Math.max(0, items.length - 1) * gap;
      const offset = Math.min(0, Math.max(
        -(trackWidth - viewport),
        viewport / 2 - activeCenter
      ));
      inner.style.transform = `translateX(${offset}px)`;
    }

    function getGalleryItem(index) {
      const thumb = items[index]?.querySelector('img');
      return {
        src: thumb?.getAttribute('src') || mainImage?.getAttribute('src') || '',
        srcset: thumb?.getAttribute('srcset') || mainImage?.getAttribute('srcset') || '',
        alt: mainImage?.getAttribute('alt') || thumb?.getAttribute('alt') || 'Фото товара',
      };
    }

    function setGalleryIndex(index) {
      if (!galleryModal || !galleryImage || !items.length) return;
      galleryIndex = (index + items.length) % items.length;
      const data = getGalleryItem(galleryIndex);
      galleryImage.src = data.src;
      if (data.srcset) {
        galleryImage.srcset = data.srcset;
      } else {
        galleryImage.removeAttribute('srcset');
      }
      galleryImage.alt = data.alt;
      galleryThumbs?.querySelectorAll('.product-gallery-modal__thumb').forEach((thumb, thumbIndex) => {
        const isActive = thumbIndex === galleryIndex;
        thumb.classList.toggle('is-active', isActive);
        thumb.setAttribute('aria-current', String(isActive));
      });
      goTo(galleryIndex);
    }

    function buildGalleryThumbs() {
      if (!galleryThumbs || galleryBuilt) return;
      galleryThumbs.innerHTML = items.map((item, index) => {
        const thumb = item.querySelector('img');
        const src = thumb?.getAttribute('src') || '';
        const srcset = thumb?.getAttribute('srcset') || '';
        return `
          <button class="product-gallery-modal__thumb" type="button" aria-label="Фото ${index + 1}" data-product-gallery-thumb="${index}">
            <img src="${src}"${srcset ? ` srcset="${srcset}"` : ''} sizes="56px" alt="" loading="lazy">
          </button>
        `;
      }).join('');
      galleryBuilt = true;
    }

    function openGallery(event) {
      event?.preventDefault();
      if (!galleryModal || !galleryImage) return;
      buildGalleryThumbs();
      galleryModal.hidden = false;
      galleryModal.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('is-modal-open');
      setGalleryIndex(currentIndex);
      galleryModal.querySelector('.product-gallery-modal__close')?.focus({ preventScroll: true });
    }

    function closeGallery() {
      if (!galleryModal || galleryModal.hidden) return;
      galleryModal.hidden = true;
      galleryModal.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('is-modal-open');
      zoomButton?.focus({ preventScroll: true });
    }

    items.forEach((item, i) => item.addEventListener('click', () => goTo(i)));
    btnPrev?.addEventListener('click', () => goTo(currentIndex - 1));
    btnNext?.addEventListener('click', () => goTo(currentIndex + 1));
    zoomButton?.addEventListener('click', openGallery);
    galleryPrev?.addEventListener('click', () => setGalleryIndex(galleryIndex - 1));
    galleryNext?.addEventListener('click', () => setGalleryIndex(galleryIndex + 1));
    galleryCloseButtons.forEach(button => button.addEventListener('click', closeGallery));
    galleryThumbs?.addEventListener('click', event => {
      const thumb = event.target.closest('[data-product-gallery-thumb]');
      if (!thumb) return;
      setGalleryIndex(Number(thumb.dataset.productGalleryThumb));
    });

    document.addEventListener('keydown', event => {
      if (!galleryModal || galleryModal.hidden) return;
      if (event.key === 'Escape') closeGallery();
      if (event.key === 'ArrowLeft') setGalleryIndex(galleryIndex - 1);
      if (event.key === 'ArrowRight') setGalleryIndex(galleryIndex + 1);
    });

    let touchStartX = 0;
    let touchStartY = 0;

    media.addEventListener('touchstart', event => {
      const touch = event.changedTouches[0];
      if (!touch) return;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }, { passive: true });

    media.addEventListener('touchend', event => {
      const touch = event.changedTouches[0];
      if (!touch) return;

      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;

      if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY)) return;
      goTo(deltaX < 0 ? currentIndex + 1 : currentIndex - 1);
    }, { passive: true });

    addMouseDrag(media, 48, dir => goTo(currentIndex + dir));

    goTo(0);
    new ResizeObserver(() => goTo(currentIndex)).observe(media);
  });

  // Product page — Дополните комплект: кастомные дропдауны выбора размера
  function enhanceProductKitSelect(sizeEl) {
    const select = sizeEl?.querySelector('.product-kit-item__size-select');
    if (!select || sizeEl.querySelector('.product-kit-item__size-button')) return;

    sizeEl.classList.add('is-enhanced');

    const button = document.createElement('button');
    button.className = 'product-kit-item__size-button';
    button.type = 'button';
    button.setAttribute('aria-haspopup', 'listbox');
    button.setAttribute('aria-expanded', 'false');

    const btnLabel = document.createElement('span');
    btnLabel.textContent = select.selectedOptions[0]?.textContent || select.options[0]?.textContent || '';
    const btnIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    btnIcon.setAttribute('aria-hidden', 'true');
    btnIcon.setAttribute('class', 'product-kit-item__size-btn-icon');
    const btnIconUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    btnIconUse.setAttribute('href', spriteHref('icon-rec-button-arrow-down'));
    btnIcon.appendChild(btnIconUse);
    button.appendChild(btnLabel);
    button.appendChild(btnIcon);

    const list = document.createElement('div');
    list.className = 'product-kit-item__size-list';
    list.setAttribute('role', 'listbox');

    const inner = document.createElement('div');
    inner.className = 'product-kit-item__size-inner';
    list.appendChild(inner);

    const scroll = document.createElement('div');
    scroll.className = 'product-kit-item__size-scroll';
    inner.appendChild(scroll);

    const scrollbar = document.createElement('div');
    scrollbar.className = 'product-kit-item__size-scrollbar';
    const thumb = document.createElement('div');
    thumb.className = 'product-kit-item__size-scrollbar-thumb';
    scrollbar.appendChild(thumb);
    inner.appendChild(scrollbar);

    Array.from(select.options).forEach((option, index) => {
      const item = document.createElement('button');
      item.className = 'product-kit-item__size-option';
      item.type = 'button';
      item.textContent = option.textContent;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', option.selected ? 'true' : 'false');

      item.addEventListener('click', () => {
        select.selectedIndex = index;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        btnLabel.textContent = option.textContent;
        scroll.querySelectorAll('.product-kit-item__size-option').forEach(optBtn => {
          optBtn.setAttribute('aria-selected', String(optBtn === item));
        });
        sizeEl.classList.remove('is-open');
        button.setAttribute('aria-expanded', 'false');
      });

      scroll.appendChild(item);
    });

    function updateKitScrollbar() {
      const { scrollTop, scrollHeight, clientHeight } = scroll;
      if (!clientHeight) return;
      const maxScroll = Math.max(0, scrollHeight - clientHeight);
      const ratio = Math.min(1, clientHeight / scrollHeight);
      const thumbH = Math.max(16, Math.round(ratio * clientHeight));
      const maxOffset = Math.max(0, clientHeight - thumbH - 4);
      const thumbY = Math.round((maxScroll > 0 ? scrollTop / maxScroll : 0) * maxOffset);
      thumb.style.top = `${2 + thumbY}px`;
      thumb.style.height = `${thumbH}px`;
    }

    scroll.addEventListener('scroll', updateKitScrollbar, { passive: true });

    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();

      document.querySelectorAll('.product-kit-item__size.is-open').forEach(el => {
        if (el === sizeEl) return;
        el.classList.remove('is-open');
        el.querySelector('.product-kit-item__size-button')?.setAttribute('aria-expanded', 'false');
      });

      const isOpen = sizeEl.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) requestAnimationFrame(updateKitScrollbar);
    });

    select.addEventListener('change', () => {
      btnLabel.textContent = select.selectedOptions[0]?.textContent || '';
    });

    sizeEl.appendChild(button);
    sizeEl.appendChild(list);
  }

  document.querySelectorAll('.product-kit-item__size').forEach(enhanceProductKitSelect);

  document.addEventListener('click', event => {
    if (event.target.closest('.product-kit-item__size')) return;
    document.querySelectorAll('.product-kit-item__size.is-open').forEach(sizeEl => {
      sizeEl.classList.remove('is-open');
      sizeEl.querySelector('.product-kit-item__size-button')?.setAttribute('aria-expanded', 'false');
    });
  });

  // Product page — детальная товара: кастомный dropdown выбора размера (планшет + мобилка)
  function enhanceProductSizeSelect(wrap) {
    const select = wrap?.querySelector('.product-option__size-select');
    if (!select || wrap.querySelector('.product-option__size-btn')) return;

    wrap.classList.add('is-enhanced');

    const button = document.createElement('button');
    button.className = 'product-option__size-btn';
    button.type = 'button';
    button.setAttribute('aria-haspopup', 'listbox');
    button.setAttribute('aria-expanded', 'false');

    const psizeBtnLabel = document.createElement('span');
    psizeBtnLabel.textContent = select.selectedOptions[0]?.textContent || select.options[0]?.textContent || '';
    const psizeBtnIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    psizeBtnIcon.setAttribute('aria-hidden', 'true');
    psizeBtnIcon.setAttribute('class', 'product-option__size-btn-icon');
    const psizeBtnIconUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    psizeBtnIconUse.setAttribute('href', spriteHref('icon-rec-button-arrow-down'));
    psizeBtnIcon.appendChild(psizeBtnIconUse);
    button.appendChild(psizeBtnLabel);
    button.appendChild(psizeBtnIcon);

    const list = document.createElement('div');
    list.className = 'product-option__size-list';
    list.setAttribute('role', 'listbox');

    const inner = document.createElement('div');
    inner.className = 'product-option__size-inner';
    list.appendChild(inner);

    const scroll = document.createElement('div');
    scroll.className = 'product-option__size-scroll';
    inner.appendChild(scroll);

    const scrollbar = document.createElement('div');
    scrollbar.className = 'product-option__size-scrollbar';
    const thumb = document.createElement('div');
    thumb.className = 'product-option__size-scrollbar-thumb';
    scrollbar.appendChild(thumb);
    inner.appendChild(scrollbar);

    Array.from(select.options).forEach((option, index) => {
      const item = document.createElement('button');
      item.className = 'product-option__size-item';
      item.type = 'button';
      item.textContent = option.textContent;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', option.selected ? 'true' : 'false');

      item.addEventListener('click', () => {
        select.selectedIndex = index;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        psizeBtnLabel.textContent = option.textContent;
        scroll.querySelectorAll('.product-option__size-item').forEach(btn => {
          btn.setAttribute('aria-selected', String(btn === item));
        });
        wrap.classList.remove('is-open');
        button.setAttribute('aria-expanded', 'false');
      });

      scroll.appendChild(item);
    });

    function updatePsizeScrollbar() {
      const { scrollTop, scrollHeight, clientHeight } = scroll;
      if (!clientHeight) return;
      const maxScroll = Math.max(0, scrollHeight - clientHeight);
      const ratio = Math.min(1, clientHeight / scrollHeight);
      const thumbH = Math.max(16, Math.round(ratio * clientHeight));
      const maxOffset = Math.max(0, clientHeight - thumbH - 4);
      const thumbY = Math.round((maxScroll > 0 ? scrollTop / maxScroll : 0) * maxOffset);
      thumb.style.top = `${2 + thumbY}px`;
      thumb.style.height = `${thumbH}px`;
    }

    scroll.addEventListener('scroll', updatePsizeScrollbar, { passive: true });

    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();

      document.querySelectorAll('.product-option__size-select-wrap.is-open').forEach(el => {
        if (el === wrap) return;
        el.classList.remove('is-open');
        el.querySelector('.product-option__size-btn')?.setAttribute('aria-expanded', 'false');
      });

      const isOpen = wrap.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) requestAnimationFrame(updatePsizeScrollbar);
    });

    select.addEventListener('change', () => {
      psizeBtnLabel.textContent = select.selectedOptions[0]?.textContent || '';
    });

    wrap.appendChild(button);
    wrap.appendChild(list);
  }

  document.querySelectorAll('.product-option__size-select-wrap').forEach(enhanceProductSizeSelect);

  document.addEventListener('click', event => {
    if (event.target.closest('.product-option__size-select-wrap')) return;
    document.querySelectorAll('.product-option__size-select-wrap.is-open').forEach(wrap => {
      wrap.classList.remove('is-open');
      wrap.querySelector('.product-option__size-btn')?.setAttribute('aria-expanded', 'false');
    });
  });

  // Product mobile sticky buy panel appears only after the full price block is scrolled past.
  document.querySelectorAll('.product-mobile-buy').forEach(panel => {
    const productBuy = document.querySelector('.product-buy');
    const mobileQuery = window.matchMedia('(max-width: 767px)');

    if (!productBuy) return;

    const syncMobileBuyPanel = () => {
      const isProductBuyVisible = productBuy.offsetParent !== null && getComputedStyle(productBuy).display !== 'none';
      const shouldShow = mobileQuery.matches && isProductBuyVisible && productBuy.getBoundingClientRect().bottom <= 64;
      panel.classList.toggle('is-visible', shouldShow);
      panel.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
    };

    window.addEventListener('scroll', syncMobileBuyPanel, { passive: true });
    window.addEventListener('resize', syncMobileBuyPanel);
    mobileQuery.addEventListener('change', syncMobileBuyPanel);
    syncMobileBuyPanel();
  });
}
