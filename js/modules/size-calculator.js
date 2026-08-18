function digits(value) {
  return String(value || '').replace(/\D/g, '');
}

export function init() {
  const modal = document.querySelector('[data-size-calculator-modal]');
  if (!modal) return;

  const openButtons = [...document.querySelectorAll('[data-size-calculator-open]')];
  const closeButtons = modal.querySelectorAll('[data-size-calculator-close]');
  const closeButton = modal.querySelector('.size-calculator-modal__close');
  const clothingFields = modal.querySelector('[data-size-calculator-fields="clothing"]');
  const footwearFields = modal.querySelector('[data-size-calculator-fields="footwear"]');
  const badge = modal.querySelector('[data-size-calculator-badge]');
  const size = modal.querySelector('[data-size-calculator-size]');
  const probability = modal.querySelector('[data-size-calculator-probability]');
  const message = modal.querySelector('[data-size-calculator-message]');
  const cartButton = modal.querySelector('[data-size-calculator-cart]');
  const consultation = modal.querySelector('[data-size-calculator-consultation]');
  const phone = modal.querySelector('[data-size-calculator-phone]');
  const phoneField = phone?.closest('.size-calculator-modal__phone-field');
  const error = modal.querySelector('[data-size-calculator-error]');
  const form = modal.querySelector('.size-calculator-modal__consultation');
  let activeTrigger = null;
  let currentType = 'clothing';
  let closeTimer = 0;

  function setResult(nextSize, nextProbability, nextMessage) {
    const empty = !nextSize;
    badge?.classList.toggle('is-empty', empty);
    if (size) size.textContent = nextSize || '';
    if (probability) probability.textContent = nextProbability || '';
    if (message) message.textContent = nextMessage;
    if (cartButton) cartButton.hidden = empty;
    if (consultation) consultation.hidden = !empty;
  }

  function resetFields() {
    modal.querySelectorAll('[data-size-calculator-input]').forEach(input => {
      input.value = '';
      input.closest('.size-calculator-modal__field')?.classList.remove('has-value');
    });
    if (phone) phone.value = '';
    phoneField?.classList.remove('is-error');
    if (error) error.hidden = true;
  }

  function showType(type) {
    currentType = type === 'footwear' || type === 'empty' ? type : 'clothing';
    const footwear = currentType !== 'clothing';
    clothingFields.hidden = footwear;
    footwearFields.hidden = !footwear;

    if (currentType === 'clothing') {
      setResult('L', '100%', 'Рекомендация основана на данных клиентов с похожими параметрами.');
    } else if (currentType === 'footwear') {
      setResult('9', '(42)', 'Рекомендация основана на средних значениях. Размеры не гарантируются и могут меняться в зависимости от телосложения.');
    } else {
      setResult('', '', 'Не удалось подобрать размер');
    }
  }

  function openModal(type = 'clothing', trigger = null) {
    window.clearTimeout(closeTimer);
    activeTrigger = trigger;
    resetFields();
    showType(type);
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
      if (restoreFocus && activeTrigger?.isConnected) activeTrigger.focus({ preventScroll: true });
      activeTrigger = null;
    }, 200);
  }

  function updateFromInputs() {
    const height = Number(modal.querySelector('[data-size-calculator-input="height"]')?.value || 0);
    const weight = Number(modal.querySelector('[data-size-calculator-input="weight"]')?.value || 0);
    const foot = Number(String(modal.querySelector('[data-size-calculator-input="foot"]')?.value || '').replace(',', '.'));

    if (currentType === 'clothing') {
      if (!height || !weight) {
        setResult('L', '100%', 'Рекомендация основана на данных клиентов с похожими параметрами.');
      } else if (height >= 140 && height <= 215 && weight >= 40 && weight <= 180) {
        setResult(weight > 105 ? 'XL' : weight > 89 ? 'L' : weight > 74 ? 'M' : 'S', '100%', 'Рекомендация основана на данных клиентов с похожими параметрами.');
      } else {
        setResult('', '', 'Не удалось подобрать размер');
      }
    }

    if (currentType !== 'clothing') {
      if (!foot) {
        setResult('9', '(42)', 'Рекомендация основана на средних значениях. Размеры не гарантируются и могут меняться в зависимости от телосложения.');
      } else if (foot >= 22 && foot <= 33) {
        const euSize = Math.round(foot * 1.5 + 2);
        setResult(String(Math.max(7, Math.round((euSize - 24) / 2))), `(${euSize})`, 'Рекомендация основана на средних значениях. Размеры не гарантируются и могут меняться в зависимости от телосложения.');
      } else {
        setResult('', '', 'Не удалось подобрать размер');
      }
    }
  }

  openButtons.forEach(button => {
    button.addEventListener('click', () => openModal(button.dataset.sizeCalculatorType, button));
  });

  closeButtons.forEach(button => button.addEventListener('click', () => closeModal()));

  modal.querySelectorAll('[data-size-calculator-input]').forEach(input => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^\d,.]/g, '').slice(0, 5);
      input.closest('.size-calculator-modal__field')?.classList.toggle('has-value', Boolean(input.value));
      updateFromInputs();
    });
  });

  modal.querySelectorAll('[data-size-calculator-clear]').forEach(button => {
    button.addEventListener('click', () => {
      const input = button.closest('.size-calculator-modal__field')?.querySelector('[data-size-calculator-input]');
      if (!input) return;
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();
    });
  });

  cartButton?.addEventListener('click', () => {
    closeModal({ restoreFocus: false });
    window.setTimeout(() => document.querySelector('[data-product-cart-open]')?.click(), 220);
  });

  form?.addEventListener('submit', event => {
    event.preventDefault();
    const valid = digits(phone?.value).length === 11;
    phoneField?.classList.toggle('is-error', !valid);
    if (error) error.hidden = valid;
    if (!valid) {
      phone?.focus();
      return;
    }
    const submit = form.querySelector('.size-calculator-modal__submit');
    submit.textContent = 'Отправлено';
    submit.disabled = true;
  });

  modal.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeModal();
  });

  const demoState = new URLSearchParams(window.location.search).get('size-calculator');
  if (['clothing', 'footwear', 'empty'].includes(demoState)) openModal(demoState);
}
