import { spriteHref } from './utils.js';

export function init() {
  // ─── uk-field: клик по обёртке фокусирует инпут ─────────────────────────────
  document.addEventListener('click', e => {
    const field = e.target.closest('.uk-field');
    if (!field) return;
    if (e.target.closest('.uk-field__clear') || e.target === field.querySelector('.uk-field__input')) return;
    field.querySelector('.uk-field__input')?.focus();
  });

  // ─── Маска телефона ──────────────────────────────────────────────────────────
  document.querySelectorAll('.js-phone-input').forEach(input => {
    function applyMask(raw) {
      // Оставляем только цифры
      let digits = raw.replace(/\D/g, '');
      // Приводим 8xxx к 7xxx
      if (digits.startsWith('8')) digits = '7' + digits.slice(1);
      if (digits.startsWith('7')) digits = digits.slice(1);
      // Ограничиваем 10 цифрами (без кода страны)
      digits = digits.slice(0, 10);

      let result = '+7';
      if (digits.length > 0) result += ' (' + digits.slice(0, 3);
      if (digits.length >= 3) result += ') ' + digits.slice(3, 6);
      if (digits.length >= 6) result += '-' + digits.slice(6, 8);
      if (digits.length >= 8) result += '-' + digits.slice(8, 10);

      return result;
    }

    input.addEventListener('input', () => {
      const masked = applyMask(input.value);
      input.value = masked;
    });

    input.addEventListener('blur', () => {
      const digits = input.value.replace(/\D/g, '');
      // Если реальных цифр нет (только префикс +7 или пусто) — очищаем поле
      if (digits.length <= 1) {
        input.value = '';
      }
      const isValid = digits.length === 11; // 7 + 10 цифр
      const isEmpty = input.value === '';
      const caption = document.getElementById(input.getAttribute('aria-describedby'));
      const fieldWrap = input.closest('[data-input-field]');

      if (caption) {
        caption.textContent = isValid || isEmpty ? '' : 'Введите полный номер телефона';
      }
      // Добавляем/убираем is-error на обёртке — CSS показывает caption и рамку
      fieldWrap?.classList.toggle('is-error', !isValid && !isEmpty);
    });

    input.addEventListener('focus', () => {
      if (!input.value) input.value = '+7 (';
      // При фокусе сразу убираем ошибку — пользователь исправляет
      input.closest('[data-input-field]')?.classList.remove('is-error');
    });
  });

  // ─── Счётчик корзины ─────────────────────────────────────────────────────────
  const CART_KEY = 'cart_count';

  function getCartCount() {
    return parseInt(localStorage.getItem(CART_KEY) || '0', 10);
  }

  function setCartCount(n) {
    localStorage.setItem(CART_KEY, String(n));
  }

  function updateCartBadges(count) {
    document.querySelectorAll('.hero-cart-badge').forEach(badge => {
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : String(count);
        badge.hidden = false;
      } else {
        badge.hidden = true;
      }
    });
  }

  updateCartBadges(getCartCount());

  function markAddButtonInCart(btn) {
    const useEl = btn?.querySelector('use');
    if (useEl) {
      useEl.setAttribute('href', spriteHref('icon-kit-check'));
    }
    btn?.classList.add('is-in-cart');
    const labelSpan = btn?.querySelector('.recommendation-card__cart-label span');
    if (labelSpan) labelSpan.textContent = 'В корзине';
  }

  function addCartItem(btn) {
    markAddButtonInCart(btn);
    const newCount = getCartCount() + 1;
    setCartCount(newCount);
    updateCartBadges(newCount);
  }

  // ─── Модалка выбора цвета/размера при добавлении из каталога ────────────────
  const CATALOG_ADD_COLORS = [
    { value: 'blue', label: 'Голубой (Blue)', hex: '#67c8bf' },
    { value: 'black', label: 'Черный (Black)', hex: '#1f1f1f' },
    { value: 'graphite', label: 'Графит (Graphite)', hex: '#303235' },
    { value: 'gray', label: 'Серый (Grey)', hex: '#73787b' },
    { value: 'olive', label: 'Оливковый (Olive)', hex: '#4c533f' },
    { value: 'red', label: 'Красный (Red)', hex: '#b81924' },
    { value: 'light-gray', label: 'Светло-серый (Light Grey)', hex: '#cdd2d5' },
  ];

  const CATALOG_ADD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const CATALOG_ADD_DEMO_IMAGES = [
    '/images/content/recommended/recommended-2.png',
    '/images/content/recommended/recommended-3.png',
    '/images/content/recommended/recommended-4.png',
    '/images/content/catalog/products/catalog-product-1.png',
    '/images/content/catalog/products/catalog-product-2.png',
    '/images/content/catalog/products/catalog-product-3.png',
    '/images/content/catalog/products/catalog-product-4.png',
  ];

  let catalogAddModal = null;
  let catalogAddActiveButton = null;
  let catalogAddState = {
    colors: [],
    colorIndex: 0,
    size: 'XL',
  };

  function isCatalogAddButton(btn) {
    return Boolean(btn.closest('.catalog-product-card, .catalog-mini-product'));
  }

  function getCatalogCardData(card) {
    const title = card.querySelector('.recommendation-card__name a, .catalog-mini-product__name')?.textContent?.trim()
      || 'Куртка FINNTRAIL Master Hood 1510 Graphite';
    const img = card.querySelector('.recommendation-card__image, .catalog-mini-product__pic img');
    const price = card.querySelector('.recommendation-card__price, .catalog-mini-product__price')?.textContent?.trim() || '13 999 ₽';
    const oldPrice = card.querySelector('.recommendation-card__old-price')?.textContent?.trim() || '16 999 ₽';
    const badge = card.querySelector('.recommendation-card__badge, .catalog-mini-product__discount')?.textContent?.trim() || 'Новинка';
    const cardDots = Array.from(card.querySelectorAll('.recommendation-card__color[data-image]'));
    const cardImage = img?.getAttribute('src') || CATALOG_ADD_DEMO_IMAGES[0];

    const colors = CATALOG_ADD_COLORS.map((color, index) => ({
      ...color,
      image: cardDots[index]?.dataset.image || (index === 0 ? cardImage : CATALOG_ADD_DEMO_IMAGES[index - 1] || cardImage),
    }));

    return {
      title,
      image: cardImage,
      alt: img?.getAttribute('alt') || title,
      price,
      oldPrice,
      badge,
      colors,
    };
  }

  function createCatalogAddModal() {
    if (catalogAddModal) return catalogAddModal;

    const modal = document.createElement('div');
    modal.className = 'catalog-add-modal';
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'catalog-add-modal-title');
    modal.innerHTML = `
      <button class="catalog-add-modal__backdrop" type="button" aria-label="Закрыть выбор товара" data-catalog-add-close></button>
      <div class="catalog-add-modal__panel" role="document">
        <div class="catalog-add-modal__body">
          <header class="catalog-add-modal__header">
            <h2 class="catalog-add-modal__title" id="catalog-add-modal-title" data-catalog-add-title></h2>
            <button class="catalog-add-modal__close" type="button" aria-label="Закрыть" data-catalog-add-close>
              <svg aria-hidden="true"><use href="${spriteHref('icon-cart-close')}"></use></svg>
            </button>
          </header>

          <div class="catalog-add-modal__image-wrap">
            <img class="catalog-add-modal__image" src="" alt="" data-catalog-add-image>
            <span class="catalog-add-modal__badge" data-catalog-add-badge></span>
          </div>

          <div class="catalog-add-modal__dots" aria-label="Доступные цвета" data-catalog-add-dots></div>

          <div class="catalog-add-modal__controls">
            <div class="catalog-add-modal__field" data-catalog-add-field="color">
              <span class="catalog-add-modal__label">Цвет</span>
              <button class="catalog-add-modal__select" type="button" aria-expanded="false" data-catalog-add-toggle="color">
                <span class="catalog-add-modal__select-value" data-catalog-add-color-value></span>
                <svg aria-hidden="true"><use href="${spriteHref('icon-cart-down-arrow')}"></use></svg>
              </button>
              <div class="catalog-add-modal__menu" hidden data-catalog-add-menu="color"></div>
            </div>

            <div class="catalog-add-modal__field" data-catalog-add-field="size">
              <span class="catalog-add-modal__label">Размер (INT)</span>
              <button class="catalog-add-modal__select" type="button" aria-expanded="false" data-catalog-add-toggle="size">
                <span class="catalog-add-modal__select-value" data-catalog-add-size-value>XL</span>
                <svg aria-hidden="true"><use href="${spriteHref('icon-cart-down-arrow')}"></use></svg>
              </button>
              <div class="catalog-add-modal__menu" hidden data-catalog-add-menu="size"></div>
            </div>
          </div>
        </div>

        <footer class="catalog-add-modal__footer">
          <div class="catalog-add-modal__prices">
            <span class="catalog-add-modal__price" data-catalog-add-price></span>
            <span class="catalog-add-modal__old-price" data-catalog-add-old-price></span>
          </div>
          <button class="catalog-add-modal__submit" type="button" data-catalog-add-submit>Добавить в корзину</button>
        </footer>
      </div>`;

    document.body.appendChild(modal);

    modal.addEventListener('click', e => {
      if (e.target.closest('[data-catalog-add-close]')) {
        closeCatalogAddModal();
        return;
      }

      const toggle = e.target.closest('[data-catalog-add-toggle]');
      if (toggle) {
        const type = toggle.dataset.catalogAddToggle;
        toggleCatalogAddMenu(type);
        return;
      }

      const option = e.target.closest('[data-catalog-add-option]');
      if (option) {
        const type = option.dataset.catalogAddOption;
        if (type === 'color') selectCatalogAddColor(Number(option.dataset.index));
        if (type === 'size') selectCatalogAddSize(option.dataset.value);
        closeCatalogAddMenus();
        return;
      }

      if (e.target.closest('[data-catalog-add-submit]')) {
        addCartItem(catalogAddActiveButton);
        closeCatalogAddModal();
      }
    });

    document.addEventListener('click', e => {
      if (!catalogAddModal || catalogAddModal.hidden) return;
      if (e.target.closest('.catalog-add-modal__field')) return;
      closeCatalogAddMenus();
    });

    modal.addEventListener('scroll', e => {
      const list = e.target.closest?.('[data-catalog-add-menu-list]');
      if (list) updateCatalogAddMenuScrollbar(list);
    }, true);

    document.addEventListener('keydown', e => {
      if (!catalogAddModal || catalogAddModal.hidden) return;
      if (e.key === 'Escape') closeCatalogAddModal();
    });

    catalogAddModal = modal;
    return modal;
  }


  function updateCatalogAddMenuScrollbar(list) {
    const menu = list?.closest('[data-catalog-add-menu]');
    if (!menu) return;

    const scrollRange = Math.max(list.scrollHeight - list.clientHeight, 0);
    const trackHeight = Math.max(list.clientHeight, 1);
    const thumbHeight = scrollRange > 0
      ? Math.max(Math.round((list.clientHeight / list.scrollHeight) * trackHeight), 28)
      : trackHeight;
    const thumbTravel = Math.max(trackHeight - thumbHeight, 0);
    const thumbY = scrollRange > 0
      ? Math.round((list.scrollTop / scrollRange) * thumbTravel)
      : 0;

    menu.style.setProperty('--catalog-add-scroll-h', `${thumbHeight}px`);
    menu.style.setProperty('--catalog-add-scroll-y', `${thumbY}px`);
  }

  function updateCatalogAddMenuScrollbars() {
    if (!catalogAddModal) return;
    catalogAddModal.querySelectorAll('[data-catalog-add-menu-list]').forEach(updateCatalogAddMenuScrollbar);
  }

  function closeCatalogAddMenus() {
    if (!catalogAddModal) return;
    catalogAddModal.querySelectorAll('[data-catalog-add-menu]').forEach(menu => {
      menu.hidden = true;
    });
    catalogAddModal.querySelectorAll('[data-catalog-add-toggle]').forEach(btn => {
      btn.setAttribute('aria-expanded', 'false');
    });
  }

  function toggleCatalogAddMenu(type) {
    const menu = catalogAddModal?.querySelector(`[data-catalog-add-menu="${type}"]`);
    const btn = catalogAddModal?.querySelector(`[data-catalog-add-toggle="${type}"]`);
    if (!menu || !btn) return;
    const shouldOpen = menu.hidden;
    closeCatalogAddMenus();
    menu.hidden = !shouldOpen;
    btn.setAttribute('aria-expanded', String(shouldOpen));
    if (shouldOpen) requestAnimationFrame(updateCatalogAddMenuScrollbars);
  }

  function renderCatalogAddMenus() {
    const colorMenu = catalogAddModal.querySelector('[data-catalog-add-menu="color"]');
    const sizeMenu = catalogAddModal.querySelector('[data-catalog-add-menu="size"]');
    const dots = catalogAddModal.querySelector('[data-catalog-add-dots]');

    const colorOptions = catalogAddState.colors.map((color, index) => `
      <button class="catalog-add-modal__option${index === catalogAddState.colorIndex ? ' is-selected' : ''}" type="button" data-catalog-add-option="color" data-index="${index}">
        <span class="catalog-add-modal__color" style="--catalog-add-color:${color.hex}"></span>
        <span>${color.label}</span>
      </button>
    `).join('');

    const sizeOptions = CATALOG_ADD_SIZES.map(size => `
      <button class="catalog-add-modal__option${size === catalogAddState.size ? ' is-selected' : ''}" type="button" data-catalog-add-option="size" data-value="${size}">${size}</button>
    `).join('');

    colorMenu.innerHTML = `<div class="catalog-add-modal__menu-list" data-catalog-add-menu-list>${colorOptions}</div>`;
    sizeMenu.innerHTML = `<div class="catalog-add-modal__menu-list" data-catalog-add-menu-list>${sizeOptions}</div>`;

    dots.innerHTML = catalogAddState.colors.map((color, index) => `
      <button class="catalog-add-modal__dot${index === catalogAddState.colorIndex ? ' is-active' : ''}" type="button" aria-label="${color.label}" data-catalog-add-option="color" data-index="${index}" style="--catalog-add-color:${color.hex}"></button>
    `).join('');

    requestAnimationFrame(updateCatalogAddMenuScrollbars);
  }

  function updateCatalogAddModalSelection() {
    const selectedColor = catalogAddState.colors[catalogAddState.colorIndex];
    const image = catalogAddModal.querySelector('[data-catalog-add-image]');
    if (selectedColor?.image && image) {
      image.src = selectedColor.image;
      image.srcset = '';
    }

    catalogAddModal.querySelector('[data-catalog-add-color-value]').innerHTML = `
      <span class="catalog-add-modal__color" style="--catalog-add-color:${selectedColor?.hex || '#1f1f1f'}"></span>
      <span>${selectedColor?.label || ''}</span>
    `;
    catalogAddModal.querySelector('[data-catalog-add-size-value]').textContent = catalogAddState.size;
    renderCatalogAddMenus();
  }

  function selectCatalogAddColor(index) {
    if (!Number.isFinite(index) || !catalogAddState.colors[index]) return;
    catalogAddState.colorIndex = index;
    updateCatalogAddModalSelection();
  }

  function selectCatalogAddSize(size) {
    if (!CATALOG_ADD_SIZES.includes(size)) return;
    catalogAddState.size = size;
    updateCatalogAddModalSelection();
  }

  function openCatalogAddModal(card, btn) {
    const modal = createCatalogAddModal();
    const data = getCatalogCardData(card);
    catalogAddActiveButton = btn;
    catalogAddState = {
      colors: data.colors,
      colorIndex: 0,
      size: 'XL',
    };

    modal.querySelector('[data-catalog-add-title]').textContent = data.title;
    modal.querySelector('[data-catalog-add-image]').src = data.image;
    modal.querySelector('[data-catalog-add-image]').alt = data.alt;
    modal.querySelector('[data-catalog-add-badge]').textContent = data.badge;
    modal.querySelector('[data-catalog-add-price]').textContent = data.price;
    modal.querySelector('[data-catalog-add-old-price]').textContent = data.oldPrice;
    updateCatalogAddModalSelection();

    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => modal.classList.add('is-open'));
    document.documentElement.classList.add('is-modal-open');
    modal.querySelector('[data-catalog-add-close]')?.focus();
  }

  function closeCatalogAddModal() {
    if (!catalogAddModal) return;
    closeCatalogAddMenus();
    catalogAddModal.classList.remove('is-open');
    document.documentElement.classList.remove('is-modal-open');
    window.setTimeout(() => {
      if (!catalogAddModal.classList.contains('is-open')) {
        catalogAddModal.hidden = true;
        catalogAddModal.setAttribute('aria-hidden', 'true');
      }
    }, 200);
    catalogAddActiveButton?.focus?.();
    catalogAddActiveButton = null;
  }

  // ─── UX-4: stopPropagation для кнопок внутри ссылок ─────────────────────────
  // hero-product-card__cart находится внутри <a> — без stopPropagation
  // клик по кнопке одновременно переходит на страницу товара
  document.addEventListener('click', e => {
    const btn = e.target.closest('.js-add-to-cart');
    if (!btn) return;
    if (btn.closest('a')) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isCatalogAddButton(btn)) {
      e.preventDefault();
      e.stopPropagation();
      const card = btn.closest('.catalog-product-card, .catalog-mini-product');
      openCatalogAddModal(card, btn);
      return;
    }

    addCartItem(btn);
  });

  document.addEventListener('click', e => {
    const btn = e.target.closest('.js-wishlist');
    if (!btn) return;
    if (btn.closest('a')) {
      e.preventDefault();
      e.stopPropagation();
    }
    btn.classList.toggle('is-saved');
    btn.setAttribute('aria-label', btn.classList.contains('is-saved') ? 'Убрать из избранного' : 'В избранное');
  });

  // ─── Цветовые точки в карточках товаров ─────────────────────────────────────
  // Клик на точку: переключает активное состояние (--active) и меняет фото.
  // Приоритет источника изображения:
  //   1. data-image на точке (Bitrix подставит реальный URL варианта цвета)
  //   2. Demo-пул: циклически подставляем другие доступные изображения
  const CARD_COLOR_DEMO_IMAGES = [
    '/images/content/recommended/recommended-1.png',
    '/images/content/recommended/recommended-2.png',
    '/images/content/recommended/recommended-3.png',
    '/images/content/recommended/recommended-4.png',
  ];

  document.addEventListener('click', e => {
    const dot = e.target.closest('.recommendation-card__color');
    if (!dot) return;

    const card = dot.closest('.recommendation-card');
    if (!card) return;

    const img = card.querySelector('.recommendation-card__image');
    const dots = Array.from(card.querySelectorAll('.recommendation-card__color'));
    const dotIndex = dots.indexOf(dot);

    // Переключаем активный класс
    dots.forEach(d => d.classList.remove('recommendation-card__color--active'));
    dot.classList.add('recommendation-card__color--active');

    if (!img) return;

    // Сохраняем оригинальный src при первом взаимодействии
    if (!img.dataset.originalSrc) {
      img.dataset.originalSrc = img.getAttribute('src');
    }

    let newSrc = dot.dataset.image || null;

    if (!newSrc) {
      if (dotIndex === 0) {
        // Первая точка — восстанавливаем оригинал
        newSrc = img.dataset.originalSrc;
      } else {
        // Остальные — demo-пул без оригинального изображения
        const others = CARD_COLOR_DEMO_IMAGES.filter(src => src !== img.dataset.originalSrc);
        newSrc = others[(dotIndex - 1) % others.length] || null;
      }
    }

    if (newSrc && img.getAttribute('src') !== newSrc) {
      img.srcset = '';
      img.src = newSrc;
    }
  });

  // ─── Копирование трек-номера ─────────────────────────────────────────────────
  function fallbackCopy(text) {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }

  document.addEventListener('click', e => {
    const btn = e.target.closest('button.order-card__action-btn, button.order-tracking-card');
    if (!btn) return;

    const text = btn.classList.contains('order-card__action-btn')
      ? btn.querySelector('span')?.textContent?.trim()
      : btn.querySelector('.order-tracking-card__value')?.textContent?.trim();

    if (!text) return;

    btn.classList.add('is-copied');
    setTimeout(() => btn.classList.remove('is-copied'), 1500);

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  });

  // ─── Orders load more ────────────────────────────────────────────────────────
  // data-orders-load-more — кнопка «Показать ещё» на странице заказов.
  // Bitrix: заменить fetch-заглушку на реальный AJAX-запрос к компоненту
  // bitrix:main.profile (personal/orders/index.php) с параметром PAGEN_1.
  document.querySelectorAll('[data-orders-load-more]').forEach(btn => {
    const list = document.querySelector('.orders-list');
    if (!list) return;

    btn.addEventListener('click', async () => {
      if (btn.disabled) return;

      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');

      try {
        // TODO: заменить на реальный URL Bitrix с параметром страницы
        // const nextPage = parseInt(btn.dataset.page || '1', 10) + 1;
        // const res = await fetch(`?PAGEN_1=${nextPage}&ajax=y`);
        // const html = await res.text();
        // вставить карточки из html в list

        // Временная заглушка для разработки
        await new Promise(resolve => setTimeout(resolve, 800));
        btn.hidden = true; // скрываем если больше нет страниц
      } catch {
        btn.disabled = false;
      } finally {
        btn.removeAttribute('aria-busy');
      }
    });
  });

  // ─── Orders sort dropdown ────────────────────────────────────────────────────
  document.querySelectorAll('[data-orders-sort]').forEach(wrap => {
    const btn  = wrap.querySelector('[data-orders-sort-btn]');
    const menu = wrap.querySelector('.orders-page__sort-dropdown');
    if (!btn || !menu) return;

    const close = () => {
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    };

    btn.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = !menu.hidden;
      menu.hidden = isOpen;
      btn.setAttribute('aria-expanded', String(!isOpen));
    });

    menu.querySelectorAll('button').forEach(opt => {
      opt.addEventListener('click', () => {
        menu.querySelectorAll('button').forEach(o => o.removeAttribute('aria-selected'));
        opt.setAttribute('aria-selected', 'true');
        const label = wrap.querySelector('.orders-page__sort-label');
        if (label) label.textContent = opt.textContent.trim();
        close();
      });
    });

    document.addEventListener('click', close);
  });

  // ─── Lazy loading видео ──────────────────────────────────────────────────────
  // Видео не грузятся до тех пор, пока не окажутся в зоне видимости (+ 200px запас).
  // В HTML: preload="none" + data-src (или data-src на <source>).
  const lazyVideos = document.querySelectorAll('[data-lazy-video]');

  if (lazyVideos.length) {
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    const loadVideo = video => {
      // Вариант 1: <source data-src="..."> внутри <video>
      const source = video.querySelector('source[data-src]');
      if (source) {
        source.src = base + source.dataset.src;
      }
      // Вариант 2: data-src прямо на <video>
      if (video.dataset.src) {
        video.src = base + video.dataset.src;
      }
      video.load(); // инициируем загрузку
      // autoplay запускается браузером автоматически после load() на элементах с атрибутом autoplay
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          loadVideo(entry.target);
          obs.unobserve(entry.target);
        });
      }, { rootMargin: '200px' });

      lazyVideos.forEach(video => observer.observe(video));
    } else {
      // Запасной вариант для старых браузеров без IntersectionObserver
      lazyVideos.forEach(loadVideo);
    }
  }
}
