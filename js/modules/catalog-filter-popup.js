// ── Catalog filter popups ─────────────────────────────────────────────────────
// Управляет 6 дропдаун-попапами в тулбаре каталога:
//   price / gender / type / season / color — чекбоксы + «Применить»
//   sort — radio-поведение, попап закрывается при выборе
//
// Работает только на десктопе (≥ 1280px), так как .catalog-toolbar__chips
// скрыт на мобилке/планшете через CSS. JS слушает события без проверки
// брейкпоинта — это безопасно, так как невидимые элементы не могут получить
// клик от пользователя.

export function init() {
  // Попапы прокрутки — инициализируем кастомный скроллбар
  const SCROLLABLE_KEYS = ['type', 'color'];
  const TRACK_HEIGHT = 336; // px — совпадает с max-height в CSS

  // ── Сбор элементов ───────────────────────────────────────────────────────

  /** @type {Array<{trigger: HTMLElement, popup: HTMLElement}>} */
  const entries = [];

  // Чипы фильтров (price, gender, type, season, color)
  document.querySelectorAll('[data-filter-key]').forEach(trigger => {
    const wrap = trigger.closest('.catalog-filter-popup-wrap');
    if (!wrap) return;
    const popup = wrap.querySelector('[data-filter-popup]');
    if (!popup) return;
    entries.push({ trigger, popup });
  });

  // Кнопка сортировки
  const sortTrigger = document.querySelector('[data-sort-toggle]');
  if (sortTrigger) {
    const wrap = sortTrigger.closest('.catalog-filter-popup-wrap');
    const popup = wrap?.querySelector('[data-filter-popup="sort"]');
    if (popup) entries.push({ trigger: sortTrigger, popup });
  }

  if (!entries.length) return;

  // ── Открытие / закрытие ──────────────────────────────────────────────────

  const closeAll = (except = null) => {
    entries.forEach(({ trigger, popup }) => {
      if (popup === except) return;
      popup.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    });
  };

  const open = ({ trigger, popup }) => {
    popup.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');

    // Инициализируем скроллбар при первом открытии
    const key = trigger.dataset.filterKey;
    if (key && SCROLLABLE_KEYS.includes(key)) {
      initScrollbar(popup);
    }
  };

  const close = ({ trigger, popup }) => {
    popup.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  };

  // ── Обработчики кликов на триггеры ───────────────────────────────────────

  entries.forEach(entry => {
    entry.trigger.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = !entry.popup.hidden;
      closeAll(entry.popup);
      if (isOpen) {
        close(entry);
      } else {
        open(entry);
      }
    });
  });

  // ── Клик вне попапа — закрыть всё ───────────────────────────────────────

  document.addEventListener('click', e => {
    // Если клик внутри любого враппера — ничего не делаем
    if (e.target.closest('.catalog-filter-popup-wrap')) return;
    closeAll();
  });

  // ── Escape — закрыть всё ─────────────────────────────────────────────────

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAll();
  });

  // ── Синхронизация is-active на триггере ──────────────────────────────────

  const syncTriggerActive = (trigger, popup) => {
    const checkedCount = popup.querySelectorAll('input[type="checkbox"]:checked').length;
    trigger.classList.toggle('is-active', checkedCount > 0);

    const countEl = trigger.querySelector('.catalog-toolbar__chip-count');
    if (countEl) countEl.textContent = checkedCount > 0 ? String(checkedCount) : '';

    const resetBtn = popup.querySelector('.catalog-filter-popup__reset');
    if (resetBtn) resetBtn.classList.toggle('is-visible', checkedCount > 0);
  };

  // ── Сброс всех чекбоксов попапа ──────────────────────────────────────────

  const resetPopup = (trigger, popup) => {
    popup.querySelectorAll('input[type="checkbox"]').forEach(input => {
      input.checked = false;
    });
    popup.querySelectorAll('.catalog-filter-popup__checkbox').forEach(cb => {
      cb.classList.remove('is-checked');
      cb.setAttribute('aria-checked', 'false');
    });
    syncTriggerActive(trigger, popup);
  };

  // ── Кнопки «Применить» ───────────────────────────────────────────────────

  entries.forEach(({ trigger, popup }) => {
    const applyBtn = popup.querySelector('.catalog-filter-popup__apply');
    if (!applyBtn) return;
    applyBtn.addEventListener('click', () => {
      syncTriggerActive(trigger, popup);
      close({ trigger, popup });
    });
  });

  // ── Чекбоксы ─────────────────────────────────────────────────────────────
  // Переключение визуального состояния .is-checked при клике на label

  entries.forEach(({ trigger, popup }) => {
    popup.querySelectorAll('.catalog-filter-popup__label').forEach(label => {
      label.addEventListener('click', () => {
        const checkbox = label.querySelector('.catalog-filter-popup__checkbox');
        const input = label.querySelector('input[type="checkbox"]');
        if (!checkbox || !input) return;

        requestAnimationFrame(() => {
          const checked = input.checked;
          checkbox.classList.toggle('is-checked', checked);
          checkbox.setAttribute('aria-checked', String(checked));
          syncTriggerActive(trigger, popup);
        });
      });
    });
  });

  // ── Кнопка × в чипе — сброс фильтра ─────────────────────────────────────

  entries.forEach(({ trigger, popup }) => {
    const chipReset = trigger.querySelector('.catalog-toolbar__chip-reset');
    if (!chipReset) return;
    chipReset.addEventListener('click', e => {
      e.stopPropagation();
      resetPopup(trigger, popup);
    });
  });

  // ── Кнопка «Сбросить» в попапе ───────────────────────────────────────────

  entries.forEach(({ trigger, popup }) => {
    const popupResetBtn = popup.querySelector('.catalog-filter-popup__reset');
    if (!popupResetBtn) return;
    popupResetBtn.addEventListener('click', () => {
      resetPopup(trigger, popup);
    });
  });

  // ── Sort — radio-поведение ────────────────────────────────────────────────

  const sortPopup = document.querySelector('[data-filter-popup="sort"]');
  if (sortPopup) {
    sortPopup.querySelectorAll('.catalog-filter-popup__sort-item').forEach(item => {
      item.querySelector('.catalog-filter-popup__sort-btn')?.addEventListener('click', () => {
        // Снять is-selected у всех
        sortPopup.querySelectorAll('.catalog-filter-popup__sort-item').forEach(i => {
          i.classList.remove('is-selected');
        });
        // Поставить на кликнутый
        item.classList.add('is-selected');

        // Обновить текст кнопки-триггера
        if (sortTrigger) {
          const label = item.querySelector('.catalog-filter-popup__sort-text')?.textContent?.trim();
          const span = sortTrigger.querySelector('span');
          if (span && label) span.textContent = label;
        }

        // Закрыть попап
        if (sortTrigger) close({ trigger: sortTrigger, popup: sortPopup });
      });
    });
  }

  // ── Начальная синхронизация состояния ────────────────────────────────────
  // На случай если чекбоксы предзаполнены в HTML

  entries.forEach(({ trigger, popup }) => {
    syncTriggerActive(trigger, popup);
  });

  // ── Кастомный скроллбар ───────────────────────────────────────────────────
  // Схема аналогична product-option__color-dropdown в product.js:
  //   scrollWrap::before — трек 6px серый
  //   scrollWrap::after  — бегунок 2px белый, смещается через CSS var
  // Высота бегунка рассчитывается динамически.

  function initScrollbar(popup) {
    const scrollWrap = popup.querySelector('.catalog-filter-popup__scroll-wrap');
    const scrollList = popup.querySelector('.catalog-filter-popup__scroll-list');
    if (!scrollWrap || !scrollList) return;

    // Уже инициализирован
    if (scrollWrap.dataset.scrollInit) return;
    scrollWrap.dataset.scrollInit = '1';

    const updateScrollbar = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollList;
      const maxScroll = Math.max(0, scrollHeight - clientHeight);

      // Видимое соотношение
      const ratio = clientHeight > 0 ? Math.min(1, clientHeight / scrollHeight) : 1;
      const thumbHeight = Math.round(ratio * TRACK_HEIGHT);

      // Максимальное смещение бегунка (с учётом отступа 2px сверху и снизу)
      const maxOffset = Math.max(0, TRACK_HEIGHT - thumbHeight - 4);
      const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
      const thumbY = Math.round(progress * maxOffset);

      scrollWrap.style.setProperty('--fp-scroll-thumb-y', `${thumbY}px`);

      // Высоту бегунка (::after) задаём через дополнительную CSS-переменную
      scrollWrap.style.setProperty('--fp-scroll-thumb-h', `${thumbHeight}px`);
    };

    scrollList.addEventListener('scroll', updateScrollbar, { passive: true });
    updateScrollbar();
  }
}
