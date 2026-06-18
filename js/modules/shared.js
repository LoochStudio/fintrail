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

  // ─── UX-4: stopPropagation для кнопок внутри ссылок ─────────────────────────
  // hero-product-card__cart находится внутри <a> — без stopPropagation
  // клик по кнопке одновременно переходит на страницу товара
  document.addEventListener('click', e => {
    const btn = e.target.closest('.js-add-to-cart');
    if (!btn) return;
    // Если кнопка внутри <a> — блокируем переход
    if (btn.closest('a')) {
      e.preventDefault();
      e.stopPropagation();
    }
    const newCount = getCartCount() + 1;
    setCartCount(newCount);
    updateCartBadges(newCount);
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
