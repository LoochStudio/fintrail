const NAME_PATTERN = /^[A-Za-zА-Яа-яЁё]+(?:[\s'’\-][A-Za-zА-Яа-яЁё]+)*$/;

function initAmbassadorModal(modal) {
  if (modal.dataset.ambassadorReady === 'true') return;
  modal.dataset.ambassadorReady = 'true';

  const form = modal.querySelector('[data-contacts-ambassador-form]');
  const formScreen = modal.querySelector('[data-contacts-ambassador-form-screen]');
  const successScreen = modal.querySelector('[data-contacts-ambassador-success]');
  const continueButton = modal.querySelector('[data-contacts-ambassador-continue]');
  const closeButtons = modal.querySelectorAll('[data-contacts-ambassador-close]');
  const openButtons = document.querySelectorAll('[data-contacts-ambassador-open]');
  let activeTrigger = null;
  let closeTimer = 0;

  const setFieldError = (name, message = '') => {
    const field = form?.querySelector(`[data-contacts-ambassador-field="${CSS.escape(name)}"]`);
    if (!field) return;

    field.classList.toggle('is-error', message !== '');
    const input = field.querySelector('input, textarea');
    input?.setAttribute('aria-invalid', String(message !== ''));

    const caption = field.querySelector('.uk-field__caption, .contacts-ambassador-modal__agreement-error');
    if (caption) caption.textContent = message;
  };

  const clearErrors = () => {
    form?.querySelectorAll('[data-contacts-ambassador-field]').forEach(field => {
      field.classList.remove('is-error');
      field.querySelector('input, textarea')?.setAttribute('aria-invalid', 'false');
      const caption = field.querySelector('.uk-field__caption, .contacts-ambassador-modal__agreement-error');
      if (caption) caption.textContent = '';
    });
  };

  const resetModal = () => {
    form?.reset();
    if (form) form.hidden = false;
    clearErrors();
    form?.querySelectorAll('[data-input-field]').forEach(field => {
      field.classList.remove('uk-s-active', 'uk-s-value', 'is-error');
    });
    if (formScreen) formScreen.hidden = false;
    if (successScreen) successScreen.hidden = true;
  };

  const validateForm = () => {
    const errors = {};
    const name = String(form?.elements.name?.value || '').trim();
    const phoneDigits = String(form?.elements.phone?.value || '').replace(/\D/g, '');
    const email = String(form?.elements.email?.value || '').trim();

    if (!name) errors.name = 'Введите имя';
    else if (!NAME_PATTERN.test(name)) {
      errors.name = 'Допустимы буквы, пробел, апостроф и дефис';
    }
    if (phoneDigits.length !== 11) errors.phone = 'Введите полный номер телефона';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Введите корректную электронную почту';
    }
    if (!form?.elements.agree?.checked) {
      errors.agree = 'Подтвердите согласие на обработку персональных данных';
    }

    clearErrors();
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
      modal.querySelector('.contacts-ambassador-modal__close')?.focus({ preventScroll: true });
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
    const field = event.target.closest('[data-contacts-ambassador-field]');
    const name = field?.dataset.contactsAmbassadorField;
    if (name) setFieldError(name);
  });

  form?.addEventListener('change', event => {
    const field = event.target.closest('[data-contacts-ambassador-field]');
    const name = field?.dataset.contactsAmbassadorField;
    if (name) setFieldError(name);
  });

  form?.addEventListener('submit', event => {
    event.preventDefault();
    if (!validateForm()) return;

    if (formScreen) formScreen.hidden = true;
    form.hidden = true;
    if (successScreen) successScreen.hidden = false;
    continueButton?.focus({ preventScroll: true });
    form.dispatchEvent(new CustomEvent('finntrail:ambassador-valid'));
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
      'a[href], button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
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
  document.querySelectorAll('[data-contacts-ambassador-modal]').forEach(initAmbassadorModal);
}
