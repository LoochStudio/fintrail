import { resolvePublicAsset, spriteHref, addMouseDrag } from './utils.js';

export function init() {
  // ─── Build kit product carousel ──────────────────────────────────────────
  document.querySelectorAll('.build-kit-desktop').forEach(section => {
    const accordionToggle = section.querySelector('.js-accordion-trigger');

    accordionToggle?.addEventListener('click', () => {
      const isOpen = section.classList.toggle('is-kit-open');
      accordionToggle.setAttribute('aria-expanded', String(isOpen));
      accordionToggle.setAttribute('aria-label', isOpen ? 'Свернуть комплект' : 'Раскрыть комплект');
    });

    const genderButtons = Array.from(section.querySelectorAll('.js-kit-gender'));
    const filterButtons = Array.from(section.querySelectorAll('.js-kit-filter'));
    const previewTiles = Array.from(section.querySelectorAll('.js-kit-tile'));
    const modelImg = section.querySelector('.build-kit-desktop__model-img');

    genderButtons.forEach(button => {
      button.addEventListener('click', () => {
        genderButtons.forEach(item => {
          const isActive = item === button;
          item.classList.toggle('is-active', isActive);
          item.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        // Меняем манекен если у кнопки есть data-model
        if (modelImg && button.dataset.model) {
          const modelSrc = resolvePublicAsset(button.dataset.model);
          modelImg.srcset = '';
          modelImg.src = modelSrc;
        }
      });
    });

    function activateCategory(category) {
      const button = filterButtons.find(item => item.dataset.kitCategory === category);
      if (!button) return;

      const row = button.closest('.build-kit-desktop__filter-row');
      row?.querySelectorAll('.build-kit-desktop__filter').forEach(item => item.classList.remove('is-active'));
      button.classList.add('is-active');
      section.dataset.kitActiveSlot = category;
      setFilterSelectValue(categorySelect, category);

      // Если категория сменилась — перестраиваем карусель и обновляем превью
      if (category === currentCategory) return;
      currentCategory = category;

      activeTiles = allTiles.filter(t => t.dataset.kitCategory === category);
      destroyDesktopCarousel();
      page = 0;
      syncDesktopCarousel();

      // Активируем первый тайл новой категории и обновляем превью карточки
      const firstTile = activeTiles[0];
      if (firstTile) {
        allTiles.forEach(t => t.classList.remove('is-active'));
        firstTile.classList.add('is-active');
        updateSelectedJacket(getTileProduct(firstTile));
      }
    }

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        if (button.dataset.kitCategory) {
          activateCategory(button.dataset.kitCategory);
          return;
        }

        const row = button.closest('.build-kit-desktop__filter-row');
        row?.querySelectorAll('.build-kit-desktop__filter').forEach(item => item.classList.remove('is-active'));
        button.classList.add('is-active');
        setFilterSelectValue(activitySelect, button.dataset.kitActivity);
      });
    });

    const activitySelect = section.querySelector('.js-kit-activity-select');
    const categorySelect = section.querySelector('.js-kit-category-select');

    function syncFilterSelect(select) {
      if (!select) return;
      const wrap = select.closest('.build-kit-desktop__filter-select-wrap');
      const button = wrap?.querySelector('.build-kit-desktop__filter-select-button');
      const options = wrap?.querySelectorAll('.build-kit-desktop__filter-select-option');
      const selectedText = select.selectedOptions[0]?.textContent || select.options[0]?.textContent || '';
      const label = button?.querySelector('.build-kit-desktop__filter-select-button-text');

      if (label) {
        label.textContent = selectedText;
      } else if (button) {
        button.textContent = selectedText;
      }
      options?.forEach((option, index) => {
        option.setAttribute('aria-selected', String(index === select.selectedIndex));
      });
    }

    function setFilterSelectValue(select, value) {
      if (!select || !value) return;
      if (select.value !== value) select.value = value;
      syncFilterSelect(select);
    }

    function closeFilterSelects(except = null) {
      section.querySelectorAll('.build-kit-desktop__filter-select-wrap.is-open').forEach(wrap => {
        if (wrap === except) return;
        wrap.classList.remove('is-open');
        wrap.querySelector('.build-kit-desktop__filter-select-button')?.setAttribute('aria-expanded', 'false');
      });
    }

    function enhanceFilterSelect(select) {
      const wrap = select?.closest('.build-kit-desktop__filter-select-wrap');
      if (!select || !wrap || wrap.querySelector('.build-kit-desktop__filter-select-button')) return;

      wrap.classList.add('is-enhanced');

      const button = document.createElement('button');
      button.className = 'build-kit-desktop__filter-select-button';
      button.type = 'button';
      button.setAttribute('aria-haspopup', 'listbox');
      button.setAttribute('aria-expanded', 'false');

      const buttonText = document.createElement('span');
      buttonText.className = 'build-kit-desktop__filter-select-button-text';
      const buttonIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      buttonIcon.classList.add('build-kit-desktop__filter-select-button-icon');
      buttonIcon.setAttribute('aria-hidden', 'true');
      const buttonIconUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      buttonIconUse.setAttribute('href', spriteHref('icon-rec-button-arrow-down'));
      buttonIcon.appendChild(buttonIconUse);
      button.appendChild(buttonText);
      button.appendChild(buttonIcon);

      const list = document.createElement('div');
      list.className = 'build-kit-desktop__filter-select-list';
      list.setAttribute('role', 'listbox');

      Array.from(select.options).forEach((option, index) => {
        const item = document.createElement('button');
        item.className = 'build-kit-desktop__filter-select-option';
        item.type = 'button';
        item.textContent = option.textContent;
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', String(option.selected));

        item.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          select.selectedIndex = index;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          syncFilterSelect(select);
          closeFilterSelects();
        });

        list.appendChild(item);
      });

      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        const isOpen = wrap.classList.toggle('is-open');
        closeFilterSelects(isOpen ? wrap : null);
        button.setAttribute('aria-expanded', String(isOpen));
      });

      button.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          closeFilterSelects();
          button.focus();
        }
      });

      select.addEventListener('change', () => syncFilterSelect(select));
      wrap.appendChild(button);
      wrap.appendChild(list);
      syncFilterSelect(select);
    }

    enhanceFilterSelect(activitySelect);
    enhanceFilterSelect(categorySelect);

    activitySelect?.addEventListener('change', () => {
      const btn = filterButtons.find(b => b.dataset.kitActivity === activitySelect.value);
      btn?.click();
    });

    categorySelect?.addEventListener('change', () => {
      activateCategory(categorySelect.value);
    });

    previewTiles.forEach(tile => {
      tile.addEventListener('click', () => {
        if (window.innerWidth >= 1280) return;
        previewTiles.forEach(item => item.classList.remove('is-active'));
        tile.classList.add('is-active');
        const product = getTileProduct(tile);
        updateSelectedJacket(product);
      });
    });

    const grid = section.querySelector('.build-kit-desktop__tiles');
    const allTiles = previewTiles;
    let currentCategory = 'jacket';
    let activeTiles = allTiles.filter(t => t.dataset.kitCategory === currentCategory);
    const dotsContainer = section.querySelector('.build-kit-desktop__dots');
    const btnPrev = section.querySelector('.js-slider-prev');
    const btnNext = section.querySelector('.js-slider-next');
    const kitList = section.querySelector('.build-kit-desktop__kit-list');
    const kitCount = section.querySelector('.build-kit-desktop__kit-count');
    const totalPrice = section.querySelector('.build-kit-desktop__total-price');
    const productImage = section.querySelector('.build-kit-desktop__product-pic img');
    const productName = section.querySelector('.build-kit-desktop__product-name');
    const productPrice = section.querySelector('.build-kit-desktop__product-price');
    const productAddButton = section.querySelector('[data-kit-add-selected]');
    const productAddIcon = productAddButton?.querySelector('use');
    const submitButton = section.querySelector('.build-kit-desktop__submit');
    const submitLabel = submitButton?.querySelector('span');

    const perPage = 9;
    const pageWidth = 340;
    const desktopQuery = window.matchMedia('(min-width: 1280px)');
    let page = 0;
    let pages = 1;
    let isDesktopCarouselReady = false;
    let isPageAnimating = false;
    let pageAnimationTimer = 0;
    let dots = [];

    function normalize(index) {
      return (index + pages) % pages;
    }

    function renderDots() {
      if (!dotsContainer) return;

      dotsContainer.innerHTML = '';
      for (let i = 0; i < pages; i += 1) {
        const dot = document.createElement('span');
        dot.className = 'build-kit-desktop__dot';
        if (i === page) dot.classList.add('is-active');
        dot.addEventListener('click', () => updatePage(i));
        dotsContainer.appendChild(dot);
      }
      dots = Array.from(dotsContainer.querySelectorAll('.build-kit-desktop__dot'));
    }

    function updateControls() {
      const isSinglePage = pages <= 1;
      [btnPrev, btnNext].forEach(button => {
        if (!button) return;
        button.classList.toggle('is-inactive', isSinglePage);
        button.toggleAttribute('disabled', isSinglePage);
        button.setAttribute('aria-disabled', String(isSinglePage));
      });
    }

    function clearPageAnimation() {
      isPageAnimating = false;
      grid?.classList.remove('is-animating');
      if (pageAnimationTimer) {
        window.clearTimeout(pageAnimationTimer);
        pageAnimationTimer = 0;
      }
    }

    function updatePage(nextPage, instant = false) {
      if (!grid || !isDesktopCarouselReady) return;
      if (isPageAnimating && !instant) return;

      const next = normalize(nextPage);
      if (next === page && !instant) return;

      page = next;

      if (instant) {
        grid.classList.add('is-initializing');
      } else {
        clearPageAnimation();
        isPageAnimating = true;
        grid.classList.add('is-animating');
      }

      grid.style.transform = `translateX(-${page * pageWidth}px)`;

      dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === page);
      });

      if (instant) {
        requestAnimationFrame(() => {
          grid.classList.remove('is-initializing');
        });
      } else {
        pageAnimationTimer = window.setTimeout(clearPageAnimation, 460);
      }
    }

    function destroyDesktopCarousel() {
      if (!grid || !isDesktopCarouselReady) return;

      clearPageAnimation();
      grid.style.transform = '';
      grid.querySelectorAll('.build-kit-desktop__tile--clone').forEach(tile => tile.remove());
      allTiles.forEach(tile => {
        tile.hidden = false;
        grid.appendChild(tile);
      });
      grid.querySelectorAll('.build-kit-desktop__page').forEach(pageEl => pageEl.remove());
      isDesktopCarouselReady = false;
      page = 0;
    }

    function initDesktopCarousel() {
      if (!grid || !activeTiles.length || isDesktopCarouselReady) return;

      // Скрываем тайлы других категорий — они остаются плоскими в гриде после destroyDesktopCarousel
      allTiles.forEach(tile => {
        if (!activeTiles.includes(tile)) tile.hidden = true;
      });

      const realPages = Math.max(1, Math.ceil(activeTiles.length / perPage));
      const usePreviewClonePage = realPages === 1 && activeTiles.length > 1;
      pages = usePreviewClonePage ? 2 : realPages;
      page = Math.min(page, pages - 1);

      for (let i = 0; i < pages; i += 1) {
        const pageEl = document.createElement('div');
        pageEl.className = 'build-kit-desktop__page';

        if (usePreviewClonePage && i === 1) {
          activeTiles.forEach(tile => {
            const clone = tile.cloneNode(true);
            clone.classList.add('build-kit-desktop__tile--clone');
            clone.classList.remove('is-active');
            clone.setAttribute('aria-hidden', 'true');
            clone.tabIndex = -1;
            clone.disabled = true;
            pageEl.appendChild(clone);
          });
        } else {
          activeTiles.slice(i * perPage, (i + 1) * perPage).forEach(tile => {
            pageEl.appendChild(tile);
            tile.hidden = false;
          });
        }

        grid.appendChild(pageEl);
      }

      isDesktopCarouselReady = true;
      renderDots();
      updateControls();
      updatePage(page, true);
    }

    function syncDesktopCarousel() {
      if (desktopQuery.matches) {
        initDesktopCarousel();
      } else {
        destroyDesktopCarousel();
      }
    }

    function parsePrice(value) {
      return Number(String(value).replace(/[^\d]/g, '')) || 0;
    }

    function formatPrice(value) {
      return `${Math.max(0, value).toLocaleString('ru-RU')} ₽`;
    }

    // Данные товара читаются из data-атрибутов тайла (подставляет Bitrix).
    // data-name — NAME товара, data-price — CATALOG_PRICE_1, data-size — "true" если есть выбор размера.
    // data-sizes — список размеров через запятую, если нужен нестандартный ряд.
    function getTileProduct(tile) {
      const img = tile.querySelector('img');
      const src = img?.getAttribute('src') || '';
      const sizes = (tile.dataset.sizes || 'XL,L,M')
        .split(',')
        .map(size => size.trim())
        .filter(Boolean);

      return {
        id:    `${tile.dataset.kitSlot || tile.dataset.kitCategory || 'product'}:${tile.dataset.name || ''}:${src}`,
        name:  tile.dataset.name  || '',
        price: tile.dataset.price || '',
        size:  tile.dataset.size !== 'false',
        sizes,
        slot:  tile.dataset.kitSlot || tile.dataset.kitCategory || 'product',
        category: tile.dataset.kitCategory || tile.dataset.kitSlot || 'product',
        img:   src,
      };
    }

    const activeTile = allTiles.find(t => t.classList.contains('is-active')) || allTiles.find(t => t.dataset.kitCategory === 'jacket');
    let selectedJacket = activeTile ? getTileProduct(activeTile) : {
      name: productName?.textContent?.trim() || '',
      price: productPrice?.textContent?.trim() || '',
      img: productImage?.getAttribute('src') || '',
      size: true,
      slot: 'jacket',
      category: 'jacket',
    };

    activateCategory(selectedJacket.category);

    function updateSelectedJacket(product) {
      selectedJacket = product;
      activateCategory(product.category);

      if (productImage) {
        productImage.setAttribute('srcset', '');
        productImage.setAttribute('src', product.img);
        productImage.setAttribute('alt', product.name);
      }

      if (productName) {
        productName.textContent = product.name;
      }

      if (productPrice) {
        productPrice.textContent = product.price;
      }

      updateKitSummary();
      syncProductAddState();
      setSubmitState(false);
    }

    function getKitItems() {
      return Array.from(section.querySelectorAll('.build-kit-desktop__kit-item:not(.build-kit-desktop__kit-item--empty)'));
    }

    function updateKitSummary() {
      const items = getKitItems();
      const itemsTotal = items.reduce((sum, item) => {
        return sum + parsePrice(item.querySelector('.build-kit-desktop__kit-price')?.textContent);
      }, 0);

      if (kitCount) {
        kitCount.textContent = `${Math.min(items.length, 4)}/4`;
      }

      if (totalPrice) {
        totalPrice.textContent = formatPrice(itemsTotal);
      }
    }

    function getSlotLabel(slot) {
      const labels = {
        hat: 'Добавить шапку',
        jacket: 'Добавить куртку',
        pants: 'Добавить штаны',
        shoes: 'Добавить обувь',
      };

      return labels[slot] || 'Добавить товар';
    }

    function createEmptyKitSlot(label = 'Добавить товар', slot = '') {
      const button = document.createElement('button');
      button.className = 'build-kit-desktop__kit-item build-kit-desktop__kit-item--empty';
      button.type = 'button';
      if (slot) {
        button.dataset.kitSlot = slot;
        button.dataset.kitEmptyLabel = label;
      }
      button.innerHTML = `<span>${label}</span>`;
      return button;
    }

    function createKitItem(product) {
      const article = document.createElement('article');
      article.className = 'build-kit-desktop__kit-item';
      article.dataset.kitSlot = product.slot || product.category || 'product';
      article.dataset.kitCategory = product.category || product.slot || 'product';
      article.dataset.kitProductId = product.id || '';

      // Используем DOM-методы вместо innerHTML, чтобы избежать XSS.
      // textContent автоматически экранирует любые HTML-символы в данных из CMS.
      const img = document.createElement('img');
      img.className = 'build-kit-desktop__kit-img';
      img.src = resolvePublicAsset(product.img || '');
      img.sizes = '80px';
      img.alt = '';
      img.loading = 'lazy';

      const content = document.createElement('div');
      content.className = 'build-kit-desktop__kit-content';

      const top = document.createElement('div');
      top.className = 'build-kit-desktop__kit-top';

      const nameEl = document.createElement('h3');
      nameEl.className = 'build-kit-desktop__kit-name';
      nameEl.textContent = product.name || ''; // textContent — безопасно

      const removeBtn = document.createElement('button');
      removeBtn.className = 'build-kit-desktop__remove';
      removeBtn.type = 'button';
      removeBtn.setAttribute('aria-label', 'Удалить');

      const removeIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      removeIcon.setAttribute('aria-hidden', 'true');

      const removeIconUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      removeIconUse.setAttribute('href', spriteHref('icon-kit-remove'));
      removeIcon.appendChild(removeIconUse);
      removeBtn.appendChild(removeIcon);

      top.appendChild(nameEl);
      top.appendChild(removeBtn);

      const bottom = document.createElement('div');
      bottom.className = 'build-kit-desktop__kit-bottom';

      const priceEl = document.createElement('span');
      priceEl.className = 'build-kit-desktop__kit-price';
      priceEl.textContent = product.price || ''; // textContent — безопасно

      bottom.appendChild(priceEl);

      if (product.size) {
        const label = document.createElement('label');
        label.className = 'build-kit-desktop__size';
        label.setAttribute('aria-label', 'Размер');

        const select = document.createElement('select');
        select.className = 'build-kit-desktop__size-select';

        const sizes = (product.sizes && product.sizes.length) ? product.sizes : ['XL', 'L', 'M'];
        sizes.forEach((size, index) => {
          const option = document.createElement('option');
          option.textContent = String(size); // textContent — безопасно
          if (index === 0) option.selected = true;
          select.appendChild(option);
        });

        label.appendChild(select);
        enhanceSizeSelect(label);
        bottom.appendChild(label);
      }

      content.appendChild(top);
      content.appendChild(bottom);
      article.appendChild(img);
      article.appendChild(content);

      return article;
    }

    function enhanceSizeSelect(sizeEl) {
      const select = sizeEl?.querySelector('.build-kit-desktop__size-select');
      if (!select || sizeEl.querySelector('.build-kit-desktop__size-button')) return;

      sizeEl.classList.add('is-enhanced');

      const button = document.createElement('button');
      button.className = 'build-kit-desktop__size-button';
      button.type = 'button';
      button.textContent = select.selectedOptions[0]?.textContent || select.options[0]?.textContent || '';
      button.disabled = select.disabled;
      button.setAttribute('aria-haspopup', 'listbox');
      button.setAttribute('aria-expanded', 'false');


      const list = document.createElement('div');
      list.className = 'build-kit-desktop__size-list';
      list.setAttribute('role', 'listbox');

      const inner = document.createElement('div');
      inner.className = 'build-kit-desktop__size-inner';
      list.appendChild(inner);

      const scroll = document.createElement('div');
      scroll.className = 'build-kit-desktop__size-scroll';
      inner.appendChild(scroll);

      const scrollbar = document.createElement('div');
      scrollbar.className = 'build-kit-desktop__size-scrollbar';
      const thumb = document.createElement('div');
      thumb.className = 'build-kit-desktop__size-scrollbar-thumb';
      scrollbar.appendChild(thumb);
      inner.appendChild(scrollbar);

      Array.from(select.options).forEach((option, index) => {
        const item = document.createElement('button');
        item.className = 'build-kit-desktop__size-option';
        item.type = 'button';
        item.textContent = option.textContent;
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', option.selected ? 'true' : 'false');

        item.addEventListener('click', () => {
          select.selectedIndex = index;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          button.textContent = option.textContent;
          scroll.querySelectorAll('.build-kit-desktop__size-option').forEach(optionButton => {
            optionButton.setAttribute('aria-selected', String(optionButton === item));
          });
          sizeEl.classList.remove('is-open');
          button.setAttribute('aria-expanded', 'false');
        });

        scroll.appendChild(item);
      });

      function updateBkitScrollbar() {
        const { scrollTop, scrollHeight, clientHeight } = scroll;
        if (!clientHeight) return;
        const maxScroll = Math.max(0, scrollHeight - clientHeight);
        const ratio = Math.min(1, clientHeight / scrollHeight);
        const thumbH = Math.max(16, Math.round(ratio * clientHeight));
        const maxOffset = Math.max(0, clientHeight - thumbH - 4);
        const thumbY = Math.round((maxScroll > 0 ? scrollTop / maxScroll : 0) * maxOffset);
        thumb.style.top = `${2 + thumbY}px`;
        thumb.style.height = `${thumbH}px`;
      }

      scroll.addEventListener('scroll', updateBkitScrollbar, { passive: true });

      const sizeGrid = sizeEl.closest('.build-kit-desktop__grid');

      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        if (button.disabled) return;

        section.querySelectorAll('.build-kit-desktop__size.is-open').forEach(item => {
          if (item === sizeEl) return;
          item.classList.remove('is-open');
          item.querySelector('.build-kit-desktop__size-button')?.setAttribute('aria-expanded', 'false');
        });

        const isOpen = sizeEl.classList.toggle('is-open');
        button.setAttribute('aria-expanded', String(isOpen));
        if (sizeGrid) sizeGrid.style.overflow = isOpen ? 'visible' : '';
        section.style.overflow = isOpen ? 'visible' : '';
        if (isOpen) requestAnimationFrame(updateBkitScrollbar);
      });

      select.addEventListener('change', () => {
        button.textContent = select.selectedOptions[0]?.textContent || '';
        button.disabled = select.disabled;
      });

      sizeEl.appendChild(button);
      sizeEl.appendChild(list);
    }

    function selectedProductInKit() {
      if (!selectedJacket) return false;
      return getKitItems().some(item => item.dataset.kitProductId === selectedJacket.id);
    }

    function syncProductAddState() {
      if (!productAddButton || !productAddIcon) return;

      const isAdded = selectedProductInKit();
      productAddButton.classList.toggle('is-added', isAdded);
      productAddButton.setAttribute('aria-label', isAdded ? 'Товар уже в комплекте' : 'Добавить товар в комплект');
      productAddIcon.setAttribute('href', spriteHref(isAdded ? 'icon-kit-check' : 'icon-hero-card-cart'));
    }

    function setSubmitState(isInCart) {
      if (!submitButton || !submitLabel) return;

      submitButton.classList.toggle('is-in-cart', isInCart);
      submitButton.setAttribute('aria-label', isInCart ? 'Перейти в корзину' : 'Добавить комплект в корзину');
      submitLabel.textContent = isInCart ? 'Перейти в корзину' : 'Добавить в корзину';
    }

    function addProductToKit(product) {
      if (!product || !kitList) return;

      const slot = product.slot || product.category || 'product';
      const kitItem = createKitItem(product);
      const currentItem = getKitItems().find(item => item.dataset.kitSlot === slot);
      const emptySlot = Array.from(kitList.querySelectorAll('.build-kit-desktop__kit-item--empty')).find(item => item.dataset.kitSlot === slot);

      if (currentItem) {
        currentItem.replaceWith(kitItem);
      } else if (emptySlot) {
        emptySlot.replaceWith(kitItem);
      } else {
        kitList.appendChild(kitItem);
      }

      updateKitSummary();
      syncProductAddState();
      setSubmitState(false);
    }

    allTiles.forEach(tile => {
      tile.addEventListener('click', () => {
        if (!desktopQuery.matches) return;
        allTiles.forEach(item => item.classList.remove('is-active'));
        tile.classList.add('is-active');
        updateSelectedJacket(getTileProduct(tile));
      });
    });

    kitList?.addEventListener('click', event => {
      const emptyButton = event.target.closest('.build-kit-desktop__kit-item--empty');
      if (emptyButton) {
        const slot = emptyButton.dataset.kitSlot;
        if (slot) activateCategory(slot);
        return;
      }

      const removeButton = event.target.closest('.build-kit-desktop__remove');
      if (!removeButton) return;

      const item = removeButton.closest('.build-kit-desktop__kit-item');
      const slot = item?.dataset.kitSlot || '';
      const fallbackLabel = getSlotLabel(slot);

      item?.replaceWith(createEmptyKitSlot(fallbackLabel, slot));
      updateKitSummary();
      syncProductAddState();
      setSubmitState(false);
    });

    productAddButton?.addEventListener('click', event => {
      event.preventDefault();
      addProductToKit(selectedJacket);
    });

    submitButton?.addEventListener('click', event => {
      if (submitButton.classList.contains('is-in-cart')) return;

      event.preventDefault();
      setSubmitState(true);
    });

    section.querySelectorAll('.build-kit-desktop__size').forEach(enhanceSizeSelect);

    document.addEventListener('click', event => {
      if (event.target.closest('.build-kit-desktop__filter-select-wrap')) return;
      closeFilterSelects();

      if (event.target.closest('.build-kit-desktop__size')) return;

      section.querySelectorAll('.build-kit-desktop__size.is-open').forEach(sizeEl => {
        sizeEl.classList.remove('is-open');
        sizeEl.querySelector('.build-kit-desktop__size-button')?.setAttribute('aria-expanded', 'false');
      });
      section.style.overflow = '';
      const bkGrid = section.querySelector('.build-kit-desktop__grid');
      if (bkGrid) bkGrid.style.overflow = '';
    });

    btnPrev?.addEventListener('click', () => updatePage(page - 1));
    btnNext?.addEventListener('click', () => updatePage(page + 1));

    addMouseDrag(section, 50, dir => {
      if (desktopQuery.matches) updatePage(page + dir);
    });

    desktopQuery.addEventListener('change', () => {
      syncDesktopCarousel();
    });
    syncDesktopCarousel();
    updateKitSummary();
    syncProductAddState();
  });
}
