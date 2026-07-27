export function init() {
  initCompareSlider();
  initCompareChips();
}

function initCompareSlider() {
  const root = document.querySelector('[data-compare]');
  if (!root) return;

  const placeholder = document.querySelector('[data-compare-placeholder]');
  const track = root.querySelector('[data-compare-track]');
  const prevBtn = root.querySelector('[data-compare-prev]');
  const nextBtn = root.querySelector('[data-compare-next]');
  const valueTracks = Array.from(document.querySelectorAll('.compare-data__values'));
  if (!track || !prevBtn || !nextBtn) return;

  let currentIndex = 0;
  let stickyStart = 0;
  let viewportScrollFrame = 0;

  function getVisibleCount() {
    const vw = window.innerWidth;
    if (vw >= 1280) return 4;
    if (vw >= 768) return 2;
    return 1;
  }

  function getTotalCards() {
    return track.querySelectorAll('.recommendation-card').length;
  }

  function getMaxIndex() {
    return Math.max(0, getTotalCards() - getVisibleCount());
  }

  function getStickyTop() {
    return window.innerWidth >= 1280 ? 72 : 64; // desktop: 72px, mobile+tablet: 64px
  }

  function getCompactHeight() {
    if (window.innerWidth >= 1280) return 124;
    if (window.innerWidth >= 768) return 246;
    return 230;
  }

  function getCompactRevealOffset() {
    if (window.innerWidth >= 1280) return 120;
    return 20;
  }

  function setPlaceholder(active) {
    if (!placeholder) return;

    if (active) {
      placeholder.style.height = `${root.dataset.compareFullHeight || root.offsetHeight}px`;
      placeholder.hidden = false;
    } else {
      placeholder.hidden = true;
      placeholder.style.height = '';
    }
  }

  function setStickyStart() {
    const wasCompact = root.classList.contains('is-compact');
    root.classList.remove('is-compact');
    setPlaceholder(false);
    root.dataset.compareFullHeight = String(root.offsetHeight);

    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    const fullSliderEnd = root.getBoundingClientRect().bottom + window.scrollY - getStickyTop() - getCompactHeight();
    stickyStart = Math.min(fullSliderEnd - getCompactRevealOffset(), Math.max(maxScroll - 1, 0));

    root.classList.toggle('is-compact', wasCompact && window.scrollY >= stickyStart);
    setPlaceholder(root.classList.contains('is-compact'));
  }

  function updateCompactState() {
    const wasCompact = root.classList.contains('is-compact');

    root.classList.toggle('is-compact', window.scrollY >= stickyStart);
    setPlaceholder(root.classList.contains('is-compact'));

    const compactChanged = wasCompact !== root.classList.contains('is-compact');
    if (compactChanged) requestAnimationFrame(updateSlider);
    return compactChanged;
  }

  // Синхронизация таблиц с нативным скроллом карточек на мобильном
  // и в компактном состоянии на планшете.
  const viewport = track.parentElement;
  const dataTables = Array.from(document.querySelectorAll('.compare-data__table'));

  function isTablet() {
    return window.innerWidth >= 768 && window.innerWidth < 1280;
  }

  function usesNativeScroll() {
    return window.innerWidth < 768 || (isTablet() && root.classList.contains('is-compact'));
  }

  function getItemStep(items) {
    if (!items.length) return 1;
    if (items.length === 1) return items[0].getBoundingClientRect().width || 1;

    const firstRect = items[0].getBoundingClientRect();
    const secondRect = items[1].getBoundingClientRect();
    return Math.abs(secondRect.left - firstRect.left) || firstRect.width || 1;
  }

  function updateSliderState(cards, visible, maxIndex) {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex;

    root.classList.toggle('is-at-start', currentIndex === 0);
    root.classList.toggle('is-at-end', currentIndex >= maxIndex);
    root.classList.toggle('has-no-overflow', maxIndex === 0);

    cards.forEach(card => card.classList.remove('is-compare-edge'));
    const edgeIndex = Math.min(currentIndex + visible - 1, cards.length - 1);
    cards[edgeIndex]?.classList.add('is-compare-edge');
  }

  function syncDataTablesFromViewport() {
    const maxViewportScroll = viewport.scrollWidth - viewport.clientWidth;
    if (maxViewportScroll <= 0) return;

    const cards = Array.from(track.querySelectorAll('.recommendation-card'));
    const cardStep = getItemStep(cards);

    dataTables.forEach(table => {
      const columns = Array.from(table.querySelectorAll('.compare-data__values span'));
      const columnStep = getItemStep(columns);
      table.scrollLeft = viewport.scrollLeft * (columnStep / cardStep);
    });
  }

  viewport.addEventListener('scroll', () => {
    if (!usesNativeScroll() || viewportScrollFrame) return;

    viewportScrollFrame = requestAnimationFrame(() => {
      syncDataTablesFromViewport();

      if (isTablet() && root.classList.contains('is-compact')) {
        const cards = Array.from(track.querySelectorAll('.recommendation-card'));
        const cardStep = getItemStep(cards);
        currentIndex = Math.min(
          Math.max(Math.round(viewport.scrollLeft / cardStep), 0),
          getMaxIndex()
        );
        updateSliderState(cards, getVisibleCount(), getMaxIndex());
      }

      viewportScrollFrame = 0;
    });
  }, { passive: true });

  function updateSlider() {
    const visible = getVisibleCount();
    const maxIndex = getMaxIndex();
    const cards = Array.from(track.querySelectorAll('.recommendation-card'));

    currentIndex = Math.min(currentIndex, maxIndex);

    // Мобильный — полностью нативный скролл.
    if (window.innerWidth < 768) {
      track.style.transform = '';
      valueTracks.forEach(vt => { vt.style.transform = ''; });
      updateSliderState(cards, visible, maxIndex);
      return;
    }

    // Компактные карточки на планшете листаются нативно и стрелками.
    if (isTablet() && root.classList.contains('is-compact')) {
      track.style.transform = '';
      valueTracks.forEach(valueTrack => { valueTrack.style.transform = ''; });

      const cardStep = getItemStep(cards);
      if (cardStep) {
        viewport.scrollTo({
          left: currentIndex * cardStep,
          behavior: 'smooth'
        });
      }

      updateSliderState(cards, visible, maxIndex);
      return;
    }

    // После выхода из compact возвращаем viewport в исходное положение:
    // смещение дальше выполняется transform трека.
    if (isTablet() && viewport.scrollLeft) viewport.scrollLeft = 0;

    const slideStep = 100 / visible;
    track.style.transform = `translateX(${-currentIndex * slideStep}%)`;

    if (isTablet()) {
      // На планшете данные всегда в native scroll — sync по scrollLeft при prev/next
      valueTracks.forEach(vt => { vt.style.transform = ''; });
      const colWidth = dataTables[0]?.querySelector('span')?.offsetWidth || 220;
      dataTables.forEach(t => { t.scrollTo({ left: currentIndex * colWidth, behavior: 'smooth' }); });
    } else {
      valueTracks.forEach(valueTrack => {
        valueTrack.style.transform = `translateX(${-currentIndex * slideStep}%)`;
      });
    }

    updateSliderState(cards, visible, maxIndex);
  }

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      root.classList.add('is-moving-back');
      updateSlider();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentIndex < getMaxIndex()) {
      currentIndex++;
      root.classList.remove('is-moving-back');
      updateSlider();
    }
  });

  root.addEventListener('click', event => {
    const removeButton = event.target.closest('.compare-products__compact-remove');
    if (!removeButton) return;

    const card = removeButton.closest('.recommendation-card');
    const cards = Array.from(track.querySelectorAll('.recommendation-card'));
    const cardIndex = cards.indexOf(card);
    if (!card || cardIndex < 0) return;

    const focusTarget = cards[cardIndex + 1] || cards[cardIndex - 1];
    const compareButton = card.querySelector('.js-compare');

    // Используем общий обработчик сравнения, чтобы синхронно обновить счётчик
    // в шапке. На странице сравнения карточка уже считается добавленной.
    if (compareButton) {
      compareButton.classList.add('is-compared');
      compareButton.click();
    }

    valueTracks.forEach(valueTrack => {
      valueTrack.children[cardIndex]?.remove();
    });
    card.remove();

    if (cardIndex < currentIndex) currentIndex--;
    currentIndex = Math.min(Math.max(currentIndex, 0), getMaxIndex());

    setStickyStart();
    updateCompactState();
    updateSlider();

    requestAnimationFrame(() => {
      focusTarget
        ?.querySelector('.compare-products__compact-remove')
        ?.focus({ preventScroll: true });
    });
  });

  // Keyboard navigation on the slider
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' && currentIndex > 0) {
      currentIndex--;
      root.classList.add('is-moving-back');
      updateSlider();
    } else if (e.key === 'ArrowRight' && currentIndex < getMaxIndex()) {
      currentIndex++;
      root.classList.remove('is-moving-back');
      updateSlider();
    }
  });

  // На планшете основной ряд переключается свайпом по карточкам, а компактный
  // ряд дополнительно поддерживает drag мышью поверх нативного scroll-контейнера.
  let dragState = null;
  let suppressClickAfterDrag = false;

  const finishDrag = event => {
    if (!dragState || event.pointerId !== dragState.pointerId) return;

    const {
      mode,
      startX,
      lastX,
      moved,
      pointerId
    } = dragState;
    const deltaX = lastX - startX;

    if (viewport.hasPointerCapture(pointerId)) {
      viewport.releasePointerCapture(pointerId);
    }

    root.classList.remove('is-dragging');
    track.style.transition = '';
    dragState = null;

    if (!moved) {
      if (mode === 'slide') updateSlider();
      return;
    }

    const cards = Array.from(track.querySelectorAll('.recommendation-card'));
    const cardStep = getItemStep(cards);

    if (mode === 'slide') {
      const shift = Math.max(1, Math.round(Math.abs(deltaX) / cardStep));
      currentIndex = Math.min(
        Math.max(currentIndex + (deltaX < 0 ? shift : -shift), 0),
        getMaxIndex()
      );
      root.classList.toggle('is-moving-back', deltaX > 0);
      updateSlider();
    } else {
      currentIndex = Math.min(
        Math.max(Math.round(viewport.scrollLeft / cardStep), 0),
        getMaxIndex()
      );
      viewport.scrollTo({
        left: currentIndex * cardStep,
        behavior: 'smooth'
      });
      updateSliderState(cards, getVisibleCount(), getMaxIndex());
    }

    suppressClickAfterDrag = true;
    setTimeout(() => {
      suppressClickAfterDrag = false;
    }, 0);
  };

  viewport.addEventListener('dragstart', event => {
    if (window.innerWidth < 1280) event.preventDefault();
  });

  viewport.addEventListener('pointerdown', event => {
    if (window.innerWidth >= 1280 || event.button !== 0) return;
    if (window.innerWidth < 768 && event.pointerType !== 'mouse') return;

    const compact = root.classList.contains('is-compact');
    if (compact && event.pointerType !== 'mouse') return;

    dragState = {
      pointerId: event.pointerId,
      mode: compact || window.innerWidth < 768 ? 'scroll' : 'slide',
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: viewport.scrollLeft,
      lastX: event.clientX,
      moved: false
    };
  });

  viewport.addEventListener('pointermove', event => {
    if (!dragState || event.pointerId !== dragState.pointerId) return;

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    if (!dragState.moved) {
      if (Math.abs(deltaX) < 8) return;
      if (Math.abs(deltaY) > Math.abs(deltaX)) return;
      dragState.moved = true;
      root.classList.add('is-dragging');
      viewport.setPointerCapture(event.pointerId);
    }

    dragState.lastX = event.clientX;
    event.preventDefault();

    if (dragState.mode === 'scroll') {
      viewport.scrollLeft = dragState.startScrollLeft - deltaX;
      return;
    }

    const slideStep = 100 / getVisibleCount();
    track.style.transition = 'none';
    track.style.transform = `translateX(calc(${-currentIndex * slideStep}% + ${deltaX}px))`;
  }, { passive: false });

  viewport.addEventListener('pointerup', finishDrag);
  viewport.addEventListener('pointercancel', finishDrag);
  viewport.addEventListener('click', event => {
    if (!suppressClickAfterDrag) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  // Re-calc on resize (debounced)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      setStickyStart();
      updateCompactState();
      updateSlider();
    }, 100);
  });

  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      updateCompactState();
      scrollTicking = false;
    });
  }, { passive: true });

  setStickyStart();
  updateCompactState();
  updateSlider();
}

function initCompareChips() {
  const container = document.querySelector('.compare-page__chips');
  if (!container) return;

  const ACTIVE = 'compare-page__chip--active';

  container.addEventListener('click', e => {
    const chip = e.target.closest('[data-compare-chip]');
    if (!chip) return;

    if (e.target.closest('.compare-page__chip-close')) {
      const wasActive = chip.classList.contains(ACTIVE);
      chip.remove();
      if (wasActive) {
        const first = container.querySelector('[data-compare-chip]');
        if (first) first.classList.add(ACTIVE);
      }
      return;
    }

    Array.from(container.querySelectorAll('[data-compare-chip]'))
      .forEach(c => c.classList.remove(ACTIVE));
    chip.classList.add(ACTIVE);
  });
}

