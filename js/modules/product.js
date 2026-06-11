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
    const dropzone = modal.querySelector('[data-product-upload-dropzone]');
    const fileButton = modal.querySelector('[data-product-upload-file-button]');
    const fileButtonText = fileButton?.querySelector('span');
    const submitButton = modal.querySelector('[data-product-upload-submit]');
    const defaultTitle = title?.textContent || '';
    const defaultLead = lead?.textContent || '';
    let closeTimer = 0;

    function resetModalState() {
      modal.classList.remove('is-success');
      dropzone?.classList.remove('is-filled');
      if (title) title.textContent = defaultTitle;
      if (lead) lead.textContent = defaultLead;
      if (fileButtonText) fileButtonText.textContent = 'Загрузить файлы';
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
    fileButton?.addEventListener('click', () => {
      dropzone?.classList.add('is-filled');
      if (fileButtonText) fileButtonText.textContent = 'Загрузить ещё';
    });
    submitButton?.addEventListener('click', () => {
      modal.classList.add('is-success');
      if (title) title.textContent = 'Изображения отправлены';
      if (lead) lead.textContent = 'Спасибо!\nВ ближайшее время мы сообщим о публикации';
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !modal.hidden) closeModal();
    });
  });

  // Product page — color picker
  document.querySelectorAll('.product-option--color-picker').forEach(option => {
    const trigger   = option.querySelector('.js-color-trigger');
    const dropdown  = option.querySelector('.product-option__color-dropdown');
    const swatch    = option.querySelector('.product-option__color-swatch');
    const nameEl    = option.querySelector('.product-option__color-name');
    const section   = option.closest('.product-detail');
    const page      = option.closest('.product-page');

    if (!trigger || !dropdown) return;

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
    });

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

    addMouseDrag(track, 50, dir => track.scrollBy({ left: dir * SCROLL_STEP, behavior: 'smooth' }));
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
    const numEl  = starsEl.closest('[data-reviews-form]')
                          ?.querySelector('[data-reviews-rating-num]');

    const setRating = value => {
      stars.forEach(s => {
        s.classList.toggle('is-active', Number(s.dataset.value) <= value);
      });
      if (numEl) numEl.textContent = value;
    };

    // Инициализируем из начального состояния (4 активных)
    const initialActive = stars.filter(s => s.classList.contains('is-active'));
    if (initialActive.length && numEl) numEl.textContent = initialActive.length;

    stars.forEach(star => {
      star.addEventListener('click', () => setRating(Number(star.dataset.value)));

      // Hover preview
      star.addEventListener('mouseenter', () => {
        stars.forEach(s => {
          s.style.background = Number(s.dataset.value) <= Number(star.dataset.value)
            ? '' // вернёт к is-active или дефолту через CSS
            : '';
        });
      });
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
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('product-reviews__fit-btn--active'));
        btn.classList.add('product-reviews__fit-btn--active');
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

        if (titleEl   && item.dataset.title)   titleEl.textContent   = item.dataset.title;
        if (articleEl && item.dataset.article) articleEl.textContent = item.dataset.article;
        if (descEl    && item.dataset.desc)    descEl.textContent    = item.dataset.desc;
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

    if (!inner || !items.length) return;

    let currentIndex = 0;

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

    items.forEach((item, i) => item.addEventListener('click', () => goTo(i)));
    btnPrev?.addEventListener('click', () => goTo(currentIndex - 1));
    btnNext?.addEventListener('click', () => goTo(currentIndex + 1));

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
    button.textContent = select.selectedOptions[0]?.textContent || select.options[0]?.textContent || '';
    button.setAttribute('aria-haspopup', 'listbox');
    button.setAttribute('aria-expanded', 'false');

    const list = document.createElement('div');
    list.className = 'product-kit-item__size-list';
    list.setAttribute('role', 'listbox');

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
        button.textContent = option.textContent;
        list.querySelectorAll('.product-kit-item__size-option').forEach(optBtn => {
          optBtn.setAttribute('aria-selected', String(optBtn === item));
        });
        sizeEl.classList.remove('is-open');
        button.setAttribute('aria-expanded', 'false');
      });

      list.appendChild(item);
    });

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
    });

    select.addEventListener('change', () => {
      button.textContent = select.selectedOptions[0]?.textContent || '';
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
