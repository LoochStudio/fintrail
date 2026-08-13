const NAME_PATTERN = /^[\p{L}\s'’-]+$/u;

function fieldValue(form, name) {
  return String(new FormData(form).get(name) || '').trim();
}

function isValidDate(value) {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
  if (!match) return false;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day;
}

function validate(form) {
  const errors = {};
  const firstName = fieldValue(form, 'first_name');
  const lastName = fieldValue(form, 'last_name');
  const middleName = fieldValue(form, 'middle_name');
  const phoneDigits = fieldValue(form, 'phone').replace(/\D/g, '');
  const email = fieldValue(form, 'email');

  if (!firstName) errors.first_name = 'Введите имя';
  else if (!NAME_PATTERN.test(firstName)) errors.first_name = 'Допустимы буквы, пробел, апостроф и дефис';

  if (!lastName) errors.last_name = 'Введите фамилию';
  else if (!NAME_PATTERN.test(lastName)) errors.last_name = 'Допустимы буквы, пробел, апостроф и дефис';

  if (middleName && !NAME_PATTERN.test(middleName)) {
    errors.middle_name = 'Допустимы буквы, пробел, апостроф и дефис';
  }

  if (phoneDigits.length !== 11) errors.phone = 'Введите полный номер телефона';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Введите корректную электронную почту';
  if (!fieldValue(form, 'product_name')) errors.product_name = 'Укажите наименование товара';
  if (!fieldValue(form, 'purchase_place')) errors.purchase_place = 'Укажите место приобретения';
  if (!isValidDate(fieldValue(form, 'purchase_date'))) errors.purchase_date = 'Введите дату в формате ДД.ММ.ГГГГ';
  if (!fieldValue(form, 'defects')) errors.defects = 'Опишите обнаруженные дефекты';

  return errors;
}

function clearErrors(form) {
  form.querySelectorAll('[data-warranty-field]').forEach(field => {
    field.classList.remove('is-error');
    field.querySelector('.uk-field__caption')?.replaceChildren();
    field.querySelector('input, textarea')?.removeAttribute('aria-invalid');
  });
}

function showErrors(form, errors) {
  clearErrors(form);

  Object.entries(errors).forEach(([name, message]) => {
    const field = form.querySelector(`[data-warranty-field="${CSS.escape(name)}"]`);
    if (!field) return;

    field.classList.add('is-error');
    field.querySelector('input, textarea')?.setAttribute('aria-invalid', 'true');
    const caption = field.querySelector('.uk-field__caption');
    if (caption) caption.textContent = message;
  });

  const firstInvalid = form.querySelector(
    '[data-warranty-field].is-error input, [data-warranty-field].is-error textarea',
  );
  firstInvalid?.focus({ preventScroll: true });
  firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function initDateMask(form) {
  form.querySelectorAll('[data-date-mask]').forEach(input => {
    input.addEventListener('input', () => {
      const digits = input.value.replace(/\D/g, '').slice(0, 8);
      input.value = [
        digits.slice(0, 2),
        digits.slice(2, 4),
        digits.slice(4, 8),
      ].filter(Boolean).join('.');
    });
  });
}

function initWarrantyForm(form) {
  if (form.dataset.warrantyReady === 'true') return;
  form.dataset.warrantyReady = 'true';

  form.addEventListener('submit', event => {
    event.preventDefault();
    const errors = validate(form);

    if (Object.keys(errors).length > 0) {
      showErrors(form, errors);
      return;
    }

    clearErrors(form);
    form.dispatchEvent(new CustomEvent('finntrail:warranty-form-valid'));
  });

  form.addEventListener('input', event => {
    const field = event.target.closest('[data-warranty-field]');
    if (!field) return;

    field.classList.remove('is-error');
    field.querySelector('.uk-field__caption')?.replaceChildren();
    event.target.removeAttribute('aria-invalid');
  });

  initDateMask(form);
}

function initCallbackModal(modal) {
  if (modal.dataset.callbackReady === 'true') return;
  modal.dataset.callbackReady = 'true';

  const form = modal.querySelector('[data-warranty-callback-form]');
  const formScreen = modal.querySelector('[data-warranty-callback-form-screen]');
  const successScreen = modal.querySelector('[data-warranty-callback-success]');
  const continueButton = modal.querySelector('[data-warranty-callback-continue]');
  const closeButtons = modal.querySelectorAll('[data-warranty-callback-close]');
  const openButtons = document.querySelectorAll('[data-callback-request][data-callback-source="warranty"]');
  let activeTrigger = null;
  let closeTimer = 0;

  const setFieldError = (name, message = '') => {
    const field = form?.querySelector(`[data-warranty-callback-field="${CSS.escape(name)}"]`);
    if (!field) return;

    field.classList.toggle('is-error', message !== '');
    field.querySelector('input')?.setAttribute('aria-invalid', String(message !== ''));
    const caption = field.querySelector('.uk-field__caption, .warranty-callback-modal__agreement-error');
    if (caption) caption.textContent = message;
  };

  const clearCallbackErrors = () => {
    form?.querySelectorAll('[data-warranty-callback-field]').forEach(field => {
      field.classList.remove('is-error');
      field.querySelector('input')?.setAttribute('aria-invalid', 'false');
      const caption = field.querySelector('.uk-field__caption, .warranty-callback-modal__agreement-error');
      if (caption) caption.textContent = '';
    });
  };

  const resetModal = () => {
    form?.reset();
    if (form) form.hidden = false;
    clearCallbackErrors();
    form?.querySelectorAll('[data-input-field]').forEach(field => {
      field.classList.remove('uk-s-active', 'uk-s-value', 'is-error');
    });
    if (formScreen) formScreen.hidden = false;
    if (successScreen) successScreen.hidden = true;
  };

  const validateCallbackForm = () => {
    const errors = {};
    const name = String(form?.elements.name?.value || '').trim();
    const phoneDigits = String(form?.elements.phone?.value || '').replace(/\D/g, '');
    const email = String(form?.elements.email?.value || '').trim();

    if (!name) errors.name = 'Введите имя';
    else if (!NAME_PATTERN.test(name)) errors.name = 'Допустимы буквы, пробел, апостроф и дефис';
    if (phoneDigits.length !== 11) errors.phone = 'Введите полный номер телефона';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Введите корректную электронную почту';
    }
    if (!form?.elements.agree?.checked) {
      errors.agree = 'Подтвердите согласие на обработку персональных данных';
    }

    clearCallbackErrors();
    Object.entries(errors).forEach(([name, message]) => setFieldError(name, message));
    form?.querySelector('[aria-invalid="true"]')?.focus({ preventScroll: true });
    return Object.keys(errors).length === 0;
  };

  const openModal = event => {
    event?.preventDefault();
    window.clearTimeout(closeTimer);
    activeTrigger = event?.currentTarget || null;
    resetModal();
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('is-modal-open');

    window.requestAnimationFrame(() => {
      modal.classList.add('is-open');
      modal.querySelector('.warranty-callback-modal__close')?.focus({ preventScroll: true });
    });
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('is-modal-open');

    closeTimer = window.setTimeout(() => {
      modal.hidden = true;
      resetModal();
      activeTrigger?.focus({ preventScroll: true });
      activeTrigger = null;
    }, 200);
  };

  form?.addEventListener('input', event => {
    const field = event.target.closest('[data-warranty-callback-field]');
    const name = field?.dataset.warrantyCallbackField;
    if (name) setFieldError(name);
  });

  form?.addEventListener('submit', event => {
    event.preventDefault();
    if (!validateCallbackForm()) return;

    if (formScreen) formScreen.hidden = true;
    form.hidden = true;
    if (successScreen) successScreen.hidden = false;
    continueButton?.focus({ preventScroll: true });
    form.dispatchEvent(new CustomEvent('finntrail:warranty-callback-valid'));
  });

  openButtons.forEach(button => button.addEventListener('click', openModal));
  closeButtons.forEach(button => button.addEventListener('click', closeModal));
  continueButton?.addEventListener('click', closeModal);

  modal.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeModal();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = [...modal.querySelectorAll(
      'a[href], button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])',
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
}

export function init() {
  document.querySelectorAll('[data-warranty-form]').forEach(initWarrantyForm);
  document.querySelectorAll('[data-warranty-callback-modal]').forEach(initCallbackModal);
}
