export function init() {
  const modal = document.querySelector('[data-auth-modal]');
  if (!modal) return;

  let currentScreen = 'phone';
  let timerInterval = null;
  let otpController = null;
  const demoValidCode = '123456';

  const screens = {
    phone: modal.querySelector('[data-auth-screen="phone"]'),
    'sms-code': modal.querySelector('[data-auth-screen="sms-code"]'),
    registration: modal.querySelector('[data-auth-screen="registration"]'),
  };

  Object.entries(screens).forEach(([name, screen]) => {
    const title = screen?.querySelector('.auth-modal__title');
    if (title && !title.id) title.id = `auth-modal-heading-${name}`;
  });

  function switchScreen(name) {
    const nextScreen = screens[name] || screens.phone;
    currentScreen = screens[name] ? name : 'phone';

    Object.values(screens).forEach(screen => {
      if (screen) screen.hidden = screen !== nextScreen;
    });

    const title = nextScreen?.querySelector('.auth-modal__title');
    if (title?.id) modal.setAttribute('aria-labelledby', title.id);
  }

  function open(screen = 'phone') {
    switchScreen(screen);
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('is-modal-open');

    const firstInput = modal.querySelector(
      '.auth-modal__screen:not([hidden]) .auth-modal__input, .auth-modal__screen:not([hidden]) .auth-modal__otp-cell'
    );
    requestAnimationFrame(() => firstInput?.focus());
  }

  function stopTimer() {
    if (timerInterval !== null) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function close() {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('is-modal-open');
    stopTimer();
  }

  function startTimer(screenEl, seconds = 28) {
    stopTimer();

    const timerEl = screenEl?.querySelector('[data-auth-timer]');
    const hintEl = screenEl?.querySelector('[data-auth-resend-hint]');
    const resendBtn = screenEl?.querySelector('[data-auth-resend]');
    let remaining = seconds;

    if (timerEl) timerEl.textContent = remaining;
    if (hintEl) hintEl.hidden = false;
    if (resendBtn) resendBtn.hidden = true;

    timerInterval = window.setInterval(() => {
      remaining -= 1;
      if (timerEl) timerEl.textContent = remaining;

      if (remaining <= 0) {
        stopTimer();
        if (hintEl) hintEl.hidden = true;
        if (resendBtn) resendBtn.hidden = false;
      }
    }, 1000);
  }

  function initOtp(screenEl, onComplete) {
    const cells = Array.from(screenEl?.querySelectorAll('.auth-modal__otp-cell') || []);
    const errorEl = screenEl?.querySelector('[data-auth-otp-error]');

    function clearError() {
      cells.forEach(cell => {
        cell.classList.remove('is-error');
        cell.setAttribute('aria-invalid', 'false');
      });
      if (errorEl) errorEl.hidden = true;
    }

    function showError(message = 'Неверный код') {
      cells.forEach(cell => {
        cell.classList.add('is-error');
        cell.setAttribute('aria-invalid', 'true');
      });
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.hidden = false;
      }
    }

    function reset() {
      cells.forEach(cell => {
        cell.value = '';
      });
      clearError();
    }

    function getCode() {
      return cells.map(cell => cell.value).join('');
    }

    cells.forEach((cell, index) => {
      cell.addEventListener('focus', () => {
        requestAnimationFrame(() => cell.select());
      });

      cell.addEventListener('input', event => {
        const digit = event.target.value.replace(/\D/g, '').slice(-1);
        event.target.value = digit;
        clearError();

        if (digit && index < cells.length - 1) cells[index + 1].focus();

        const code = getCode();
        if (code.length === cells.length) onComplete?.(code, showError, reset);
      });

      cell.addEventListener('keydown', event => {
        if (event.key === 'Backspace' && !event.target.value && index > 0) {
          event.preventDefault();
          cells[index - 1].value = '';
          cells[index - 1].focus();
        }

        if (event.key === 'ArrowLeft' && index > 0) {
          event.preventDefault();
          cells[index - 1].focus();
        }

        if (event.key === 'ArrowRight' && index < cells.length - 1) {
          event.preventDefault();
          cells[index + 1].focus();
        }

        clearError();
      });

      if (index === 0) {
        cell.addEventListener('paste', event => {
          event.preventDefault();
          const text = (event.clipboardData || window.clipboardData)
            .getData('text')
            .replace(/\D/g, '')
            .slice(0, cells.length);

          cells.forEach((otpCell, cellIndex) => {
            otpCell.value = text[cellIndex] || '';
          });
          clearError();

          const nextIndex = Math.min(text.length, cells.length - 1);
          cells[nextIndex]?.focus();

          const code = getCode();
          if (code.length === cells.length) onComplete?.(code, showError, reset);
        });
      }
    });

    return { getCode, reset, showError };
  }

  modal.querySelectorAll('[data-auth-close]').forEach(button => {
    button.addEventListener('click', close);
  });

  modal.querySelector('.auth-modal__backdrop')?.addEventListener('click', close);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !modal.hidden) close();
  });

  modal.querySelectorAll('[data-auth-back]').forEach(button => {
    button.addEventListener('click', () => {
      stopTimer();
      if (currentScreen === 'sms-code') switchScreen('phone');
    });
  });

  const phoneInput = modal.querySelector('[data-auth-phone-input]');
  const phoneField = phoneInput?.closest('[data-input-field]');
  const phoneCaption = phoneInput?.getAttribute('aria-describedby')
    ? document.getElementById(phoneInput.getAttribute('aria-describedby'))
    : null;
  const personalConsent = modal.querySelector('[data-auth-personal-consent]');
  const consentError = modal.querySelector('[data-auth-consent-error]');
  let isPhoneValidationActive = false;
  let isConsentValidationActive = false;

  function setPhoneError(message = '') {
    const hasError = Boolean(message);
    phoneField?.classList.toggle('is-error', hasError);
    phoneInput?.setAttribute('aria-invalid', String(hasError));
    if (phoneCaption) phoneCaption.textContent = message;
  }

  function validatePhone() {
    const digits = phoneInput?.value?.replace(/\D/g, '') || '';
    const isValid = digits.length === 11;
    setPhoneError(isValid ? '' : 'Введите полный номер телефона');
    return isValid;
  }

  function validatePersonalConsent() {
    const isValid = Boolean(personalConsent?.checked);
    const agreement = personalConsent?.closest('.auth-modal__agreement');

    agreement?.classList.toggle('is-error', !isValid);
    personalConsent?.setAttribute('aria-invalid', String(!isValid));
    if (consentError) {
      consentError.textContent = isValid ? '' : 'Необходимо согласие на обработку персональных данных';
      consentError.hidden = isValid;
    }
    return isValid;
  }

  modal.querySelector('[data-auth-phone-submit]')?.addEventListener('click', () => {
    isPhoneValidationActive = true;
    isConsentValidationActive = true;

    const isPhoneValid = validatePhone();
    const isConsentValid = validatePersonalConsent();

    if (!isPhoneValid || !isConsentValid) {
      (isPhoneValid ? personalConsent : phoneInput)?.focus();
      return;
    }

    isPhoneValidationActive = false;
    isConsentValidationActive = false;

    modal.querySelectorAll('[data-auth-phone-display]').forEach(element => {
      element.textContent = phoneInput.value.trim();
    });

    otpController?.reset();
    switchScreen('sms-code');
    startTimer(screens['sms-code']);
    screens['sms-code']?.querySelector('.auth-modal__otp-cell')?.focus();
    // BITRIX: запрос одноразового кода по номеру телефона.
  });

  phoneInput?.addEventListener('input', () => {
    if (isPhoneValidationActive) validatePhone();
  });

  phoneInput?.addEventListener('focus', () => {
    if (isPhoneValidationActive) validatePhone();
  });

  phoneInput?.addEventListener('blur', () => {
    if (isPhoneValidationActive) validatePhone();
  });

  phoneInput?.addEventListener('keydown', event => {
    if (event.key === 'Enter') modal.querySelector('[data-auth-phone-submit]')?.click();
  });

  personalConsent?.addEventListener('change', () => {
    if (isConsentValidationActive || personalConsent.checked) validatePersonalConsent();
  });

  if (screens['sms-code']) {
    otpController = initOtp(screens['sms-code'], (code, showError) => {
      // Статический сценарий для проверки верстки. При интеграции Bitrix
      // заменяет сравнение на результат серверной проверки одноразового кода.
      if (code !== demoValidCode) {
        showError('Неверный код');
        return;
      }

      stopTimer();
      const resendBtn = screens['sms-code'].querySelector('[data-auth-resend]');
      const hintEl = screens['sms-code'].querySelector('[data-auth-resend-hint]');
      if (resendBtn) resendBtn.hidden = true;
      if (hintEl) hintEl.hidden = true;

      // BITRIX: после проверки кода существующий пользователь авторизуется,
      // а новый получает флаг requiresProfile и переходит к регистрации.
      switchScreen('registration');
      screens.registration?.querySelector('[data-auth-registration-name]')?.focus();
    });
  }

  modal.querySelectorAll('[data-auth-resend]').forEach(button => {
    button.addEventListener('click', () => {
      const screenEl = button.closest('[data-auth-screen]');
      if (!screenEl) return;

      otpController?.reset();
      startTimer(screenEl);
      screenEl.querySelector('.auth-modal__otp-cell')?.focus();
      // BITRIX: повторный запрос одноразового кода.
    });
  });

  const registrationName = modal.querySelector('[data-auth-registration-name]');
  const registrationEmail = modal.querySelector('[data-auth-registration-email]');
  const registrationNameError = modal.querySelector('[data-auth-registration-name-error]');
  const registrationEmailError = modal.querySelector('[data-auth-registration-email-error]');
  const offerConsent = modal.querySelector('[data-auth-offer-consent]');
  const registrationConsentError = modal.querySelector('[data-auth-registration-consent-error]');
  let isRegistrationValidationActive = false;
  let isOfferValidationActive = false;

  function setRegistrationError(input, errorElement, message = '') {
    const hasError = Boolean(message);
    input?.classList.toggle('is-error', hasError);
    input?.setAttribute('aria-invalid', String(hasError));
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.hidden = !hasError;
    }
  }

  function sanitizeName(value) {
    return value
      .replace(/[^A-Za-zА-Яа-яЁё\s-]/g, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/-{2,}/g, '-');
  }

  function validateRegistrationName() {
    const value = sanitizeName(registrationName?.value || '').trim();
    if (registrationName) registrationName.value = value;

    const isValid = /^[A-Za-zА-Яа-яЁё]+(?:[\s-][A-Za-zА-Яа-яЁё]+)*$/.test(value);
    setRegistrationError(
      registrationName,
      registrationNameError,
      isValid ? '' : 'Введите имя, используя буквы и дефис'
    );
    return isValid;
  }

  function validateRegistrationEmail() {
    const value = registrationEmail?.value?.trim() || '';
    const isValid = !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    setRegistrationError(
      registrationEmail,
      registrationEmailError,
      isValid ? '' : 'Введите корректную электронную почту'
    );
    return isValid;
  }

  function validateOfferConsent() {
    const isValid = Boolean(offerConsent?.checked);
    const agreement = offerConsent?.closest('.auth-modal__agreement');

    agreement?.classList.toggle('is-error', !isValid);
    offerConsent?.setAttribute('aria-invalid', String(!isValid));
    if (registrationConsentError) {
      registrationConsentError.textContent = isValid
        ? ''
        : 'Необходимо согласие с условиями публичной оферты';
      registrationConsentError.hidden = isValid;
    }
    return isValid;
  }

  registrationName?.addEventListener('input', () => {
    const sanitized = sanitizeName(registrationName.value);
    if (registrationName.value !== sanitized) registrationName.value = sanitized;
    if (isRegistrationValidationActive) validateRegistrationName();
  });

  registrationEmail?.addEventListener('input', () => {
    if (isRegistrationValidationActive) validateRegistrationEmail();
  });

  offerConsent?.addEventListener('change', () => {
    if (isOfferValidationActive || offerConsent.checked) validateOfferConsent();
  });

  modal.querySelector('[data-auth-registration-submit]')?.addEventListener('click', () => {
    isRegistrationValidationActive = true;
    isOfferValidationActive = true;
    const isNameValid = validateRegistrationName();
    const isEmailValid = validateRegistrationEmail();
    const isOfferValid = validateOfferConsent();

    if (!isNameValid || !isEmailValid || !isOfferValid) {
      if (!isNameValid) registrationName?.focus();
      else if (!isEmailValid) registrationEmail?.focus();
      else offerConsent?.focus();
      return;
    }

    // BITRIX: создать профиль нового пользователя, передав необязательный email
    // и значение [data-auth-registration-marketing-consent], затем завершить авторизацию.
    close();
  });

  registrationName?.addEventListener('keydown', event => {
    if (event.key === 'Enter') registrationEmail?.focus();
  });

  registrationEmail?.addEventListener('keydown', event => {
    if (event.key === 'Enter') modal.querySelector('[data-auth-registration-submit]')?.click();
  });

  document.querySelectorAll('[data-auth-open]').forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      open(button.dataset.authOpen || 'phone');
    });
  });

  // Постоянные ссылки для проверки состояний из preview.html.
  const previewState = new URLSearchParams(window.location.search).get('demo-auth');
  const previewScreen = previewState === 'sms-error' ? 'sms-code' : previewState;
  if (previewScreen && screens[previewScreen]) {
    if (previewScreen === 'sms-code') {
      modal.querySelectorAll('[data-auth-phone-display]').forEach(element => {
        element.textContent = '+7 (999) 123-45-67';
      });
    }

    open(previewScreen);
    if (previewScreen === 'sms-code') {
      startTimer(screens['sms-code']);

      if (previewState === 'sms-error') {
        screens['sms-code'].querySelectorAll('.auth-modal__otp-cell').forEach((cell, index) => {
          cell.value = String(index + 2);
        });
        otpController?.showError('Неверный код');
      }
    }
  }
}
