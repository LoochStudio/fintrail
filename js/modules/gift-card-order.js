import { resolvePublicAsset } from './utils.js';

export function init() {
  document.querySelectorAll('[data-gift-card-order]').forEach(root => {
    const select = root.querySelector('[data-gift-card-select]');
    const selectBtn = root.querySelector('[data-gift-card-select-btn]');
    const options = root.querySelector('[data-gift-card-options]');
    const optionsScroll = root.querySelector('[data-gift-card-options-scroll]');
    const current = root.querySelector('[data-gift-card-current]');
    const cardAmount = root.querySelector('[data-gift-card-card-amount]');
    const amountForm = root.querySelector('[data-gift-card-amount-form]');
    const detailsForm = root.querySelector('[data-gift-card-details-form]');
    const dateForm = root.querySelector('[data-gift-card-date-form]');
    const dateFields = root.querySelector('[data-gift-card-date-fields]');
    const dateNote = root.querySelector('[data-gift-card-date-note]');
    const dateModeInput = root.querySelector('[data-gift-card-date-mode-input]');
    const dateInput = root.querySelector('[data-gift-card-date-input]');
    const timeInput = root.querySelector('[data-gift-card-time-input]');
    const dateCurrent = root.querySelector('[data-gift-card-date-current]');
    const timeCurrent = root.querySelector('[data-gift-card-time-current]');
    const dateModal = root.querySelector('[data-gift-card-date-modal]');
    const timeModal = root.querySelector('[data-gift-card-time-modal]');
    const confirmBlock = root.querySelector('[data-gift-card-confirm]');
    const confirmPhone = root.querySelector('[data-gift-card-confirm-phone]');
    const confirmName = root.querySelector('[data-gift-card-confirm-name]');
    const confirmMessage = root.querySelector('[data-gift-card-confirm-message]');
    const confirmMessageField = root.querySelector('[data-gift-card-confirm-message-field]');
    const confirmDatetime = root.querySelector('[data-gift-card-confirm-datetime]');
    const successBlock = root.querySelector('[data-gift-card-success]');
    const successLine1 = root.querySelector('[data-gift-card-success-line1]');
    const successLine2 = root.querySelector('[data-gift-card-success-line2]');
    const detailsScroll = root.querySelector('[data-gift-card-details-scroll]');
    const detailsScrollbar = root.querySelector('[data-gift-card-details-scrollbar]');
    const recipientTypeInput = root.querySelector('[data-gift-card-recipient-type-input]');
    const messageFields = root.querySelector('[data-gift-card-message-fields]');
    const designInput = root.querySelector('[data-gift-card-design-input]');
    const amountInput = root.querySelector('[data-gift-card-amount-input]');
    const mainCard = root.querySelector('[data-gift-card-main-card]');
    const cardBgs = Array.from(root.querySelectorAll('[data-gift-card-card-bg]'));
    const bgImgs = Array.from(root.querySelectorAll('[data-gift-card-bg]'));
    const designButtons = Array.from(root.querySelectorAll('[data-gift-card-design]'));
    const carousel = root.querySelector('[data-gift-card-carousel]');
    const slotClasses = ['is-slot-prev-2', 'is-slot-prev-1', 'is-slot-next-1', 'is-slot-next-2', 'is-slot-next-3', 'is-slot-next-4'];

    // Determine initial active design from the card-bg that has is-active
    const initialBgDiv = cardBgs.find(bg => bg.classList.contains('is-active'));
    const initialStyle = initialBgDiv?.style.backgroundImage ?? '';
    const initialSrc = initialStyle.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1] ?? '';
    let activeDesignIndex = Math.max(0, designButtons.findIndex(btn =>
      resolvePublicAsset(btn.dataset.giftCardDesign) === initialSrc || btn.dataset.giftCardDesign === initialSrc
    ));
    let selectedAmount = current?.textContent?.trim() || '10 000 ₽';
    let selectedDate = dateCurrent?.textContent?.trim() || '11 июля 2026';
    let selectedTime = timeCurrent?.textContent?.trim() || '11:00';

    function getCardBackgroundImage(src) {
      const resolved = resolvePublicAsset(src);
      return `linear-gradient(180deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.00) 57.11%), url("${resolved}")`;
    }

    function getActiveDesignButton() {
      return designButtons[activeDesignIndex] || null;
    }

    function getActiveDesignLabel() {
      const index = activeDesignIndex + 1;
      return `Дизайн ${index}`;
    }

    function syncGiftCardSummary() {
      const activeBtn = getActiveDesignButton();
      if (designInput) designInput.value = activeBtn?.dataset.giftCardDesign || '';
      if (amountInput) amountInput.value = selectedAmount;
      if (dateInput) dateInput.value = selectedDate;
      if (timeInput) timeInput.value = selectedTime;
    }

    function closeGiftCardModal(modal) {
      if (!modal || modal.hidden) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('is-modal-open');
      window.setTimeout(() => { modal.hidden = true; }, 200);
    }

    function closeGiftCardModals() {
      closeGiftCardModal(dateModal);
      closeGiftCardModal(timeModal);
    }

    function openGiftCardModal(modal) {
      if (!modal) return;
      closeGiftCardModals();
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('is-modal-open');
      requestAnimationFrame(() => modal.classList.add('is-open'));
    }

    function updateDetailsScrollbar() {
      if (!detailsScroll || !detailsScrollbar) return;
      const scrollRange = Math.max(detailsScroll.scrollHeight - detailsScroll.clientHeight, 0);
      detailsScrollbar.hidden = scrollRange <= 0 || !root.classList.contains('is-recipient-other');
      if (detailsScrollbar.hidden) return;
      const trackHeight = detailsScrollbar.clientHeight || 170;
      const thumbHeight = Math.max(32, Math.round((detailsScroll.clientHeight / detailsScroll.scrollHeight) * trackHeight));
      const thumbTravel = Math.max(0, trackHeight - thumbHeight - 4);
      const thumbY = scrollRange > 0 ? Math.round((detailsScroll.scrollTop / scrollRange) * thumbTravel) : 0;
      detailsScrollbar.style.setProperty('--gift-card-details-scrollbar-thumb-h', `${thumbHeight}px`);
      detailsScrollbar.style.setProperty('--gift-card-details-scrollbar-thumb-y', `${thumbY}px`);
    }
    function setStep(step) {
      const stepIndexMap = { amount: 0, details: 1, date: 2, confirm: 3, success: 4 };
      const stepIndex = stepIndexMap[step] ?? 0;
      const isDetails = step === 'details';
      const isDate = step === 'date';
      const isConfirm = step === 'confirm';
      const isSuccess = step === 'success';
      root.classList.toggle('is-step-details', isDetails);
      root.classList.toggle('is-step-date', isDate);
      root.classList.toggle('is-step-confirm', isConfirm);
      root.classList.toggle('is-step-success', isSuccess);
      if (detailsForm) detailsForm.hidden = !isDetails;
      if (dateForm) dateForm.hidden = !isDate;
      if (confirmBlock) confirmBlock.hidden = !isConfirm;
      if (successBlock) successBlock.hidden = !isSuccess;
      if (amountForm) amountForm.setAttribute('aria-hidden', String(step !== 'amount'));
      root.querySelectorAll('.gift-card-order__progress-step').forEach((item, index) => {
        item.classList.toggle('is-active', index <= stepIndex);
      });
      const progress = root.querySelector('[data-gift-card-progress]');
      if (progress) progress.setAttribute('aria-label', `Шаг ${stepIndex + 1} из 5`);
      syncGiftCardSummary();
      requestAnimationFrame(syncCardBackgroundPosition);
      requestAnimationFrame(updateDetailsScrollbar);
    }

    function syncCardBackgroundPosition() {
      if (!mainCard) return;
      const activeBg = bgImgs.find(img => img.classList.contains('is-active'));
      if (!activeBg || !activeBg.naturalWidth || !activeBg.naturalHeight) return;

      const bgRect = activeBg.getBoundingClientRect();
      const cardRect = mainCard.getBoundingClientRect();
      const scale = Math.max(
        bgRect.width / activeBg.naturalWidth,
        bgRect.height / activeBg.naturalHeight
      );
      const renderedWidth = activeBg.naturalWidth * scale;
      const renderedHeight = activeBg.naturalHeight * scale;
      const renderedLeft = bgRect.left + ((bgRect.width - renderedWidth) / 2);
      const renderedTop = bgRect.top + ((bgRect.height - renderedHeight) / 2);

      mainCard.style.setProperty('--gift-card-bg-width', `${renderedWidth}px`);
      mainCard.style.setProperty('--gift-card-bg-height', `${renderedHeight}px`);
      mainCard.style.setProperty('--gift-card-bg-x', `${renderedLeft - cardRect.left}px`);
      mainCard.style.setProperty('--gift-card-bg-y', `${renderedTop - cardRect.top}px`);
    }
    // ── Design crossfade ──────────────────────────────────────────────────────
    function applyDesign(src, isDark) {
      const resolved = resolvePublicAsset(src);
      root.classList.toggle('is-design-dark', Boolean(isDark));
      root.classList.toggle('is-design-light', !isDark);

      const activeBg = bgImgs.find(img => img.classList.contains('is-active'));
      const nextBg = bgImgs.find(img => !img.classList.contains('is-active'));
      const activeCardBg = cardBgs.find(bg => bg.classList.contains('is-active'));
      const nextCardBg = cardBgs.find(bg => !bg.classList.contains('is-active'));

      if (!activeBg || !nextBg || !activeCardBg || !nextCardBg) return;

      nextCardBg.style.backgroundImage = getCardBackgroundImage(src);
      nextBg.src = resolved;

      const doSwap = () => requestAnimationFrame(() => {
        nextBg.classList.add('is-active');
        activeBg.classList.remove('is-active');
        nextCardBg.classList.add('is-active');
        activeCardBg.classList.remove('is-active');
        syncCardBackgroundPosition();
      });

      if (nextBg.complete && nextBg.naturalWidth > 0) {
        doSwap();
      } else {
        nextBg.addEventListener('load', doSwap, { once: true });
        nextBg.addEventListener('error', doSwap, { once: true });
      }
    }

    bgImgs.forEach(img => {
      img.addEventListener('load', syncCardBackgroundPosition);
    });
    window.addEventListener('resize', syncCardBackgroundPosition);
    requestAnimationFrame(syncCardBackgroundPosition);
    // ── Select ────────────────────────────────────────────────────────────────
    function updateSelectScrollbar() {
      if (!options || !optionsScroll) return;
      const maxTrack = 132;
      const scrollHeight = optionsScroll.scrollHeight || 1;
      const clientHeight = optionsScroll.clientHeight || maxTrack;
      const maxScroll = Math.max(1, scrollHeight - clientHeight);
      const thumbHeight = Math.max(24, Math.round((clientHeight / scrollHeight) * maxTrack));
      const thumbTravel = Math.max(0, maxTrack - thumbHeight - 4);
      const thumbY = Math.round((optionsScroll.scrollTop / maxScroll) * thumbTravel);
      options.style.setProperty('--gift-card-select-thumb-h', `${thumbHeight}px`);
      options.style.setProperty('--gift-card-select-thumb-y', `${thumbY}px`);
    }

    function closeSelect() {
      if (!select || !selectBtn || !options) return;
      select.classList.remove('is-open');
      selectBtn.setAttribute('aria-expanded', 'false');
      options.hidden = true;
    }

    function openSelect() {
      if (!select || !selectBtn || !options) return;
      select.classList.add('is-open');
      selectBtn.setAttribute('aria-expanded', 'true');
      options.hidden = false;
      requestAnimationFrame(updateSelectScrollbar);
    }

    // ── Carousel ──────────────────────────────────────────────────────────────
    function getWrappedIndex(index, total) {
      return ((index % total) + total) % total;
    }

    // Card content compresses instantly to scale(0.95), then springs back with overshoot.
    // Targets card-content (not the card itself) so transform doesn't break
    // background-attachment: fixed on the sibling card-bg divs.
    function bounceCard() {
      const content = mainCard?.querySelector('.gift-card-order__card-content');
      if (!content) return;
      content.style.transition = 'none';
      content.style.transform = 'scale(0.95)';
      void content.offsetWidth;
      content.style.transition = '';
      content.style.transform = '';
    }

    // Clicked thumbnail pops up slightly before disappearing
    function popThumb(btn) {
      if (!btn) return;
      void btn.offsetWidth; // ensure transition starts from current state
      btn.style.transform = 'scale(1.09)';
      // Existing CSS "transform 0.24s ease" handles the grow animation.
      // "is-hidden" (added by updateDesignSlots) handles the fade-out simultaneously.
      // Clean up after both are done.
      setTimeout(() => { btn.style.transform = ''; }, 300);
    }

    function updateDesignSlots() {
      const total = designButtons.length;
      if (!total) return;

      // The previously active (hidden) button will enter from off-screen.
      // Override its transition so it jumps instantly to the new position
      // and only fades in — no flying across the screen.
      const wasHiddenBtn = designButtons.find(btn => btn.classList.contains('is-hidden'));
      if (wasHiddenBtn) {
        wasHiddenBtn.style.transition = 'opacity 0.3s ease';
      }

      designButtons.forEach(btn => {
        // Clear any stale inline transform from a previous popThumb (rapid clicks)
        btn.style.transform = '';
        btn.classList.remove('is-selected', 'is-hidden', ...slotClasses);
        btn.setAttribute('aria-hidden', 'true');
        btn.tabIndex = -1;
      });

      const activeBtn = designButtons[activeDesignIndex];
      if (activeBtn) {
        applyDesign(activeBtn.dataset.giftCardDesign, activeBtn.hasAttribute('data-dark'));
        activeBtn.classList.add('is-selected', 'is-hidden');
      }

      const offsets = [-2, -1, 1, 2, 3, 4];
      offsets.forEach((offset, slotIndex) => {
        const btn = designButtons[getWrappedIndex(activeDesignIndex + offset, total)];
        if (!btn || btn === activeBtn) return;
        btn.classList.add(slotClasses[slotIndex]);
        btn.setAttribute('aria-hidden', 'false');
        btn.tabIndex = 0;
      });

      // Restore full transition after layout is painted
      if (wasHiddenBtn) {
        requestAnimationFrame(() => requestAnimationFrame(() => {
          wasHiddenBtn.style.transition = '';
        }));
      }
    }

    // ── Drag / swipe ──────────────────────────────────────────────────────────
    let isDragging = false;
    let dragStartX = 0;
    let hasDragged = false;
    const DRAG_THRESHOLD = 60;

    function startDrag(x) {
      isDragging = true;
      hasDragged = false;
      dragStartX = x;
      document.body.style.cursor = 'grabbing';
      carousel?.classList.add('is-dragging');
    }

    function moveDrag(x) {
      if (!isDragging) return;
      if (Math.abs(x - dragStartX) > 8) hasDragged = true;
    }

    function endDrag(x) {
      if (!isDragging) return;
      isDragging = false;
      document.body.style.cursor = '';
      carousel?.classList.remove('is-dragging');

      const delta = x - dragStartX;
      hasDragged = Math.abs(delta) > 5;

      if (Math.abs(delta) >= DRAG_THRESHOLD) {
        bounceCard();
        activeDesignIndex = getWrappedIndex(activeDesignIndex + (delta < 0 ? 1 : -1), designButtons.length);
        updateDesignSlots();
        syncGiftCardSummary();
      }
    }

    // Mouse drag — works on whole section except form/select
    root.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      if (e.target.closest('.gift-card-order__form, .gift-card-order__details') || e.target.closest('[data-gift-card-select]')) return;
      startDrag(e.clientX);
    });
    document.addEventListener('mousemove', e => moveDrag(e.clientX));
    document.addEventListener('mouseup', e => {
      if (e.button !== 0) return;
      endDrag(e.clientX);
    });

    // Touch swipe
    root.addEventListener('touchstart', e => {
      if (e.target.closest('.gift-card-order__form, .gift-card-order__details') || e.target.closest('[data-gift-card-select]')) return;
      startDrag(e.touches[0].clientX);
    }, { passive: true });
    document.addEventListener('touchmove', e => {
      if (isDragging) moveDrag(e.touches[0].clientX);
    }, { passive: true });
    document.addEventListener('touchend', e => endDrag(e.changedTouches[0].clientX));

    // ── Select events ─────────────────────────────────────────────────────────
    if (select && selectBtn && options) {
      selectBtn.addEventListener('click', e => {
        e.stopPropagation();
        select.classList.contains('is-open') ? closeSelect() : openSelect();
      });

      optionsScroll?.addEventListener('scroll', updateSelectScrollbar, { passive: true });

      options.querySelectorAll('[data-gift-card-option]').forEach(option => {
        option.addEventListener('click', () => {
          const value = option.dataset.giftCardOption || option.textContent.trim();
          selectedAmount = value;
          if (current) current.textContent = value;
          if (cardAmount) cardAmount.textContent = value;
          syncGiftCardSummary();
          options.querySelectorAll('[data-gift-card-option]').forEach(item =>
            item.setAttribute('aria-selected', item === option ? 'true' : 'false')
          );
          closeSelect();
        });
      });

      document.addEventListener('click', e => {
        if (!select.contains(e.target)) closeSelect();
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeSelect();
      });
    }

    detailsScroll?.addEventListener('scroll', updateDetailsScrollbar, { passive: true });
    window.addEventListener('resize', updateDetailsScrollbar);

    amountForm?.addEventListener('submit', e => {
      e.preventDefault();
      setStep('details');
    });

    detailsForm?.addEventListener('submit', e => {
      e.preventDefault();
      setStep('date');
    });

    dateForm?.addEventListener('submit', e => {
      e.preventDefault();
      syncGiftCardSummary();
      const nameInput = root.querySelector('[name="recipient_name"]');
      const phoneInput = root.querySelector('[name="recipient_phone"]');
      const messageInput = root.querySelector('[name="gift_card_message"]');
      const dateModeVal = dateModeInput?.value || 'now';
      if (confirmName) confirmName.textContent = nameInput?.value?.trim() || '—';
      if (confirmPhone) confirmPhone.textContent = phoneInput?.value?.trim() || '—';
      const messageText = messageInput?.value?.trim() || '';
      if (confirmMessageField) confirmMessageField.hidden = !messageText;
      if (confirmMessage) confirmMessage.textContent = messageText || '—';
      if (confirmDatetime) {
        confirmDatetime.textContent = dateModeVal === 'now'
          ? 'Сразу после оплаты'
          : `${selectedDate}, ${selectedTime}`;
      }
      setStep('confirm');
    });

    confirmBlock?.querySelector('[data-gift-card-confirm-edit]')?.addEventListener('click', () => {
      setStep('details');
    });

    confirmBlock?.querySelector('[data-gift-card-confirm-submit]')?.addEventListener('click', () => {
      const nameInput = root.querySelector('[name="recipient_name"]');
      const phoneInput = root.querySelector('[name="recipient_phone"]');
      const dateModeVal = dateModeInput?.value || 'now';
      const name = nameInput?.value?.trim() || '';
      const phone = phoneInput?.value?.trim() || '';
      if (successLine1) {
        successLine1.textContent = name
          ? `${name} получит подарочный сертификат`
          : 'Сертификат будет отправлен';
      }
      if (successLine2) {
        successLine2.textContent = dateModeVal === 'now'
          ? `Сразу после оплаты на телефон ${phone}`
          : `${selectedDate} в ${selectedTime} на телефон ${phone}`;
      }
      setStep('success');
    });
    root.querySelectorAll('[data-gift-card-recipient-type]').forEach(tab => {
      tab.addEventListener('click', () => {
        const value = tab.dataset.giftCardRecipientType || 'self';
        root.querySelectorAll('[data-gift-card-recipient-type]').forEach(item => {
          const isActive = item === tab;
          item.classList.toggle('is-active', isActive);
          item.setAttribute('aria-selected', String(isActive));
        });
        if (recipientTypeInput) recipientTypeInput.value = value;
        root.classList.toggle('is-recipient-other', value === 'other');
        if (messageFields) messageFields.hidden = value !== 'other';
        if (detailsScroll) detailsScroll.scrollTop = 0;
        requestAnimationFrame(updateDetailsScrollbar);
      });
    });

    root.querySelectorAll('[data-gift-card-date-mode]').forEach(tab => {
      tab.addEventListener('click', () => {
        const value = tab.dataset.giftCardDateMode || 'now';
        root.querySelectorAll('[data-gift-card-date-mode]').forEach(item => {
          const isActive = item === tab;
          item.classList.toggle('is-active', isActive);
          item.setAttribute('aria-selected', String(isActive));
        });
        if (dateModeInput) dateModeInput.value = value;
        if (dateFields) dateFields.hidden = value !== 'custom';
        if (dateNote) dateNote.hidden = value === 'custom';
      });
    });

    root.querySelector('[data-gift-card-date-open]')?.addEventListener('click', () => openGiftCardModal(dateModal));
    root.querySelector('[data-gift-card-time-open]')?.addEventListener('click', () => openGiftCardModal(timeModal));

    root.querySelectorAll('[data-gift-card-modal-close]').forEach(button => {
      button.addEventListener('click', () => closeGiftCardModals());
    });

    root.querySelectorAll('[data-gift-card-date-value]').forEach(button => {
      button.addEventListener('click', () => {
        selectedDate = button.dataset.giftCardDateValue || button.textContent.trim();
        if (dateCurrent) dateCurrent.textContent = selectedDate;
        root.querySelectorAll('[data-gift-card-date-value]').forEach(item => item.classList.toggle('is-selected', item === button));
        syncGiftCardSummary();
        closeGiftCardModal(dateModal);
      });
    });

    root.querySelectorAll('[data-gift-card-time-value]').forEach(button => {
      button.addEventListener('click', () => {
        selectedTime = button.dataset.giftCardTimeValue || button.textContent.trim();
        if (timeCurrent) timeCurrent.textContent = selectedTime;
        root.querySelectorAll('[data-gift-card-time-value]').forEach(item => item.classList.toggle('is-selected', item === button));
        syncGiftCardSummary();
        closeGiftCardModal(timeModal);
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeGiftCardModals();
    });
    // ── Design button clicks ──────────────────────────────────────────────────
    designButtons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        if (hasDragged) return;
        if (index === activeDesignIndex) return;
        popThumb(btn);
        bounceCard();
        activeDesignIndex = index;
        updateDesignSlots();
        syncGiftCardSummary();
      });
    });

    // ── Keyboard navigation ───────────────────────────────────────────────────
    root.addEventListener('keydown', e => {
      if (e.target.closest('[data-gift-card-select]') || e.target.closest('form')) return;
      if (e.key === 'ArrowLeft') {
        bounceCard();
        activeDesignIndex = getWrappedIndex(activeDesignIndex - 1, designButtons.length);
        updateDesignSlots();
        syncGiftCardSummary();
      } else if (e.key === 'ArrowRight') {
        bounceCard();
        activeDesignIndex = getWrappedIndex(activeDesignIndex + 1, designButtons.length);
        updateDesignSlots();
        syncGiftCardSummary();
      }
    });

    // ── Init ──────────────────────────────────────────────────────────────────
    updateDesignSlots();
    syncGiftCardSummary();
  });
}
