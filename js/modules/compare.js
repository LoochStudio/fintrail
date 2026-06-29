export function init() {
  initCompareSlider();
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
    return window.innerWidth >= 1280 ? 124 : 0;
  }

  function getCompactRevealOffset() {
    return window.innerWidth >= 1280 ? 120 : 0;
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

  // Синхронизация скролла таблиц данных с viewport карточек на мобильном
  const viewport = track.parentElement;
  const dataTables = Array.from(document.querySelectorAll('.compare-data__table'));
  viewport.addEventListener('scroll', () => {
    // Синхронизировать только когда viewport в native-scroll режиме (мобильный или планшет-compact)
    if (window.innerWidth >= 768 && !(window.innerWidth < 1280 && root.classList.contains('is-compact'))) return;
    const maxVP = viewport.scrollWidth - viewport.clientWidth;
    if (maxVP <= 0) return;
    dataTables.forEach(t => {
      const maxT = t.scrollWidth - t.clientWidth;
      t.scrollLeft = viewport.scrollLeft * (maxT / maxVP);
    });
  }, { passive: true });

  function updateSlider() {
    // Мобильный и планшет-compact — нативный скролл, трансформации не нужны
    if (window.innerWidth < 768 || (window.innerWidth < 1280 && root.classList.contains('is-compact'))) {
      track.style.transform = '';
      valueTracks.forEach(vt => { vt.style.transform = ''; });
      return;
    }

    const visible = getVisibleCount();
    const maxIndex = getMaxIndex();
    const cards = Array.from(track.querySelectorAll('.recommendation-card'));

    currentIndex = Math.min(currentIndex, maxIndex);

    const slideStep = 100 / visible;
    track.style.transform = `translateX(${-currentIndex * slideStep}%)`;

    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1280;
    if (isTablet) {
      // На планшете данные всегда в native scroll — sync по scrollLeft при prev/next
      valueTracks.forEach(vt => { vt.style.transform = ''; });
      const colWidth = dataTables[0]?.querySelector('span')?.offsetWidth || 220;
      dataTables.forEach(t => { t.scrollTo({ left: currentIndex * colWidth, behavior: 'smooth' }); });
    } else {
      valueTracks.forEach(valueTrack => {
        valueTrack.style.transform = `translateX(${-currentIndex * slideStep}%)`;
      });
    }

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex;

    root.classList.toggle('is-at-start', currentIndex === 0);
    root.classList.toggle('is-at-end', currentIndex >= maxIndex);

    cards.forEach(card => card.classList.remove('is-compare-edge'));
    const edgeIndex = Math.min(currentIndex + visible - 1, cards.length - 1);
    cards[edgeIndex]?.classList.add('is-compare-edge');
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
      const compactChanged = updateCompactState();
      if (!compactChanged && root.classList.contains('is-compact')) updateSlider();
      scrollTicking = false;
    });
  }, { passive: true });

  setStickyStart();
  updateCompactState();
  updateSlider();
}
