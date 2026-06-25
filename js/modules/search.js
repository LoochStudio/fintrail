export function init() {
  const modal = document.querySelector('[data-search-modal]');
  if (!modal) return;

  const input = modal.querySelector('[data-search-input]');
  const clearBtn = modal.querySelector('[data-search-clear]');

  // ── Открытие / закрытие ───────────────────────────────────────────────────

  function open() {
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('is-modal-open');
    requestAnimationFrame(() => input?.focus());
  }

  function close() {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('is-modal-open');
    if (input) input.value = '';
    if (clearBtn) clearBtn.hidden = true;
    showPopular();
  }

  // ── Слушатели ─────────────────────────────────────────────────────────────

  modal.querySelector('[data-search-close]')?.addEventListener('click', close);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) close();
  });

  document.querySelectorAll('[data-search-open]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      open();
    });
  });

  clearBtn?.addEventListener('click', () => {
    if (input) input.value = '';
    clearBtn.hidden = true;
    input?.focus();
    showPopular();
  });

  const results = modal.querySelector('[data-search-results]');
  const popular = modal.querySelector('.search-modal__popular');
  const allResultsLink = modal.querySelector('[data-search-all]');
  const items = modal.querySelector('[data-search-items]');
  const scrollbar = modal.querySelector('[data-search-scrollbar]');
  const scrollbarThumb = modal.querySelector('[data-search-scrollbar-thumb]');
  const gradient = modal.querySelector('[data-search-gradient]');

  function updateSearchScrollbar() {
    if (!items || !scrollbar || !scrollbarThumb) return;
    const { scrollTop, scrollHeight, clientHeight } = items;
    const hasOverflow = scrollHeight > clientHeight + 1;
    if (!hasOverflow) {
      scrollbar.hidden = true;
      if (gradient) gradient.hidden = true;
      return;
    }
    scrollbar.hidden = false;
    const maxScroll = scrollHeight - clientHeight;
    const ratio = clientHeight / scrollHeight;
    const thumbH = Math.max(16, Math.round(ratio * clientHeight));
    const maxOffset = Math.max(0, clientHeight - thumbH - 4);
    const thumbY = Math.round((scrollTop / maxScroll) * maxOffset);
    scrollbarThumb.style.top = `${2 + thumbY}px`;
    scrollbarThumb.style.height = `${thumbH}px`;
    if (gradient) gradient.hidden = scrollTop >= maxScroll - 1;
  }

  items?.addEventListener('scroll', updateSearchScrollbar, { passive: true });

  function showResults(query) {
    if (results) results.hidden = false;
    if (popular) popular.hidden = true;
    // BITRIX: обновить href кнопки "Все результаты" с поисковым запросом
    if (allResultsLink) allResultsLink.href = `/search/?q=${encodeURIComponent(query)}`;
    setTimeout(updateSearchScrollbar, 0);
  }

  function showPopular() {
    if (results) results.hidden = true;
    if (popular) popular.hidden = false;
  }

  input?.addEventListener('input', () => {
    const query = input.value.trim();
    if (clearBtn) clearBtn.hidden = query.length === 0;
    if (query.length > 0) {
      showResults(query);
      // BITRIX: запрос результатов поиска, заполнение [data-search-items] и [data-search-categories]
    } else {
      showPopular();
    }
  });
}
