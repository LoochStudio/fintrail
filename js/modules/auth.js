export function init() {
  const modal = document.querySelector('[data-auth-modal]');
  if (!modal) return;

  let currentScreen = 'phone';
  let timerInterval = null;

  const screens = {
    phone: modal.querySelector('[data-auth-screen="phone"]'),
    'sms-code': modal.querySelector('[data-auth-screen="sms-code"]'),
    email: modal.querySelector('[data-auth-screen="email"]'),
    'email-code': modal.querySelector('[data-auth-screen="email-code"]'),
  };

  // ── Открытие / закрытие ───────────────────────────────────────────────────

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

  function close() {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('is-modal-open');
    stopTimer();
  }

  // ── Переключение экранов ──────────────────────────────────────────────────

  function switchScreen(name) {
    currentScreen = name;
    Object.keys(screens).forEach(key => {
      if (screens[key]) screens[key].hidden = key !== name;
    });
  }

  // ── Таймер повторной отправки ─────────────────────────────────────────────

  function startTimer(screenEl, seconds = 28) {
    stopTimer();

    const timerEl = screenEl.querySelector('[data-auth-timer]');
    const hintEl = screenEl.querySelector('[data-auth-resend-hint]');
    const resendBtn = screenEl.querySelector('[data-auth-resend]');

    let remaining = seconds;
    if (timerEl) timerEl.textContent = remaining;
    if (hintEl) hintEl.hidden = false;
    if (resendBtn) resendBtn.hidden = true;

    timerInterval = setInterval(() => {
      remaining -= 1;
      if (timerEl) timerEl.textContent = remaining;

      if (remaining <= 0) {
        stopTimer();
        if (hintEl) hintEl.hidden = true;
        if (resendBtn) resendBtn.hidden = false;
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval !== null) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  // ── OTP-ввод ──────────────────────────────────────────────────────────────

  function initOtp(screenEl, onComplete) {
    const cells = Array.from(screenEl.querySelectorAll('.auth-modal__otp-cell'));
    const errorEl = screenEl.querySelector('[data-auth-otp-error]');

    function clearError() {
      if (!errorEl || errorEl.hidden) return;
      errorEl.hidden = true;
      cells.forEach(c => c.classList.remove('is-error'));
    }

    function showError() {
      cells.forEach(c => c.classList.add('is-error'));
      if (errorEl) errorEl.hidden = false;
    }

    function reset() {
      cells.forEach(c => {
        c.value = '';
        c.classList.remove('is-error');
      });
      if (errorEl) errorEl.hidden = true;
    }

    function getCode() {
      return cells.map(c => c.value).join('');
    }

    cells.forEach((cell, i) => {
      cell.addEventListener('focus', () => {
        requestAnimationFrame(() => cell.select());
      });

      cell.addEventListener('input', e => {
        const digit = e.target.value.replace(/\D/g, '').slice(-1);
        e.target.value = digit;
        clearError();

        if (digit && i < cells.length - 1) {
          cells[i + 1].focus();
        }

        const code = getCode();
        if (code.length === 6 && onComplete) {
          onComplete(code, showError, reset);
        }
      });

      cell.addEventListener('keydown', e => {
        if (e.key === 'Backspace') {
          if (!e.target.value && i > 0) {
            e.preventDefault();
            cells[i - 1].value = '';
            cells[i - 1].focus();
          }
          clearError();
        }
        if (e.key === 'ArrowLeft' && i > 0) {
          e.preventDefault();
          cells[i - 1].focus();
        }
        if (e.key === 'ArrowRight' && i < cells.length - 1) {
          e.preventDefault();
          cells[i + 1].focus();
        }
      });

      // Вставка кода из буфера (только на первой ячейке)
      if (i === 0) {
        cell.addEventListener('paste', e => {
          e.preventDefault();
          const text = (e.clipboardData || window.clipboardData)
            .getData('text').replace(/\D/g, '').slice(0, 6);

          cells.forEach((c, j) => {
            c.value = text[j] || '';
            c.classList.remove('is-error');
          });

          const nextIdx = Math.min(text.length, cells.length - 1);
          cells[nextIdx].focus();
          clearError();

          const code = getCode();
          if (code.length === 6 && onComplete) {
            onComplete(code, showError, reset);
          }
        });
      }
    });

    return { reset, showError, getCode };
  }

  // ── Слушатели событий ─────────────────────────────────────────────────────

  // Кнопки «Закрыть» (X)
  modal.querySelectorAll('[data-auth-close]').forEach(btn => {
    btn.addEventListener('click', close);
  });

  // Бэкдроп
  modal.querySelector('.auth-modal__backdrop')?.addEventListener('click', close);

  // Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) close();
  });

  // Кнопки «Назад»
  modal.querySelectorAll('[data-auth-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      stopTimer();
      if (currentScreen === 'sms-code') switchScreen('phone');
      else if (currentScreen === 'email-code') switchScreen('email');
    });
  });

  // Переход на email-экран
  modal.querySelector('[data-auth-to-email]')?.addEventListener('click', () => {
    switchScreen('email');
  });

  // Переход на phone-экран
  modal.querySelector('[data-auth-to-phone]')?.addEventListener('click', () => {
    switchScreen('phone');
  });

  // Отправить телефон
  const phoneInput = modal.querySelector('[data-auth-phone-input]');
  modal.querySelector('[data-auth-phone-submit]')?.addEventListener('click', () => {
    const phone = phoneInput?.value?.trim();
    const phoneDigits = phone?.replace(/\D/g, '') || '';
    const phoneField = phoneInput?.closest('[data-input-field]');
    const phoneCaption = phoneInput?.getAttribute('aria-describedby')
      ? document.getElementById(phoneInput.getAttribute('aria-describedby'))
      : null;

    if (phoneDigits.length !== 11) {
      if (phoneCaption) phoneCaption.textContent = 'Введите полный номер телефона';
      phoneField?.classList.add('is-error');
      phoneInput?.focus();
      return;
    }

    phoneField?.classList.remove('is-error');
    if (phoneCaption) phoneCaption.textContent = '';

    modal.querySelectorAll('[data-auth-phone-display]').forEach(el => {
      el.textContent = phone;
    });

    switchScreen('sms-code');
    startTimer(screens['sms-code']);
    screens['sms-code']?.querySelector('.auth-modal__otp-cell')?.focus();
    // BITRIX: запрос кода по телефону
  });

  // Enter в поле телефона
  phoneInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      modal.querySelector('[data-auth-phone-submit]')?.click();
    }
  });

  // Отправить email
  const emailInput = modal.querySelector('[data-auth-email-input]');
  modal.querySelector('[data-auth-email-submit]')?.addEventListener('click', () => {
    const email = emailInput?.value?.trim();
    if (!email) { emailInput?.focus(); return; }

    modal.querySelectorAll('[data-auth-email-display]').forEach(el => {
      el.textContent = email;
    });

    switchScreen('email-code');
    startTimer(screens['email-code']);
    screens['email-code']?.querySelector('.auth-modal__otp-cell')?.focus();
    // BITRIX: запрос кода на почту
  });

  // Enter в поле email
  emailInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      modal.querySelector('[data-auth-email-submit]')?.click();
    }
  });

  // OTP — SMS (автоотправка при заполнении)
  if (screens['sms-code']) {
    initOtp(screens['sms-code'], (_code, showError, reset) => {
      // Скрываем кнопку повтора пока идёт проверка
      const resendBtn = screens['sms-code'].querySelector('[data-auth-resend]');
      const hintEl   = screens['sms-code'].querySelector('[data-auth-resend-hint]');
      if (resendBtn) resendBtn.hidden = true;
      if (hintEl)   hintEl.hidden = true;
      stopTimer();
      // BITRIX: передать код серверу, при ошибке вызвать showError()
    });
  }

  // OTP — Email (ручная отправка)
  let emailOtp = null;
  if (screens['email-code']) {
    emailOtp = initOtp(screens['email-code'], null);

    modal.querySelector('[data-auth-email-code-submit]')?.addEventListener('click', () => {
      const code = emailOtp?.getCode() ?? '';
      if (code.length < 6) {
        screens['email-code']?.querySelector('.auth-modal__otp-cell')?.focus();
        return;
      }
      // BITRIX: передать код письма серверу
    });
  }

  // Кнопки «Получить новый код»
  modal.querySelectorAll('[data-auth-resend]').forEach(btn => {
    btn.addEventListener('click', () => {
      const screenEl = btn.closest('[data-auth-screen]');
      if (!screenEl) return;

      screenEl.querySelectorAll('.auth-modal__otp-cell').forEach(c => {
        c.value = '';
        c.classList.remove('is-error');
      });
      const errEl = screenEl.querySelector('[data-auth-otp-error]');
      if (errEl) errEl.hidden = true;

      startTimer(screenEl);
      screenEl.querySelector('.auth-modal__otp-cell')?.focus();
      // BITRIX: повторный запрос кода
    });
  });

  // ── Публичный API ─────────────────────────────────────────────────────────
  // Любая кнопка с data-auth-open открывает модалку
  // data-auth-open="email" → открыть на email-экране
  document.querySelectorAll('[data-auth-open]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const screen = btn.dataset.authOpen || 'phone';
      open(screen);
    });
  });
}
