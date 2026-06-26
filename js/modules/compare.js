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
    return window.innerWidth >= 1280 ? 72 : 0;
  }

  function getCompactHeight() {
    return window.innerWidth >= 1280 ? 124 : 0;
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
    stickyStart = root.getBoundingClientRect().bottom + window.scrollY - getStickyTop() - getCompactHeight();
    root.classList.toggle('is-compact', wasCompact && window.scrollY >= stickyStart);
    setPlaceholder(root.classList.contains('is-compact'));
  }

  function updateCompactState() {
    const wasCompact = root.classList.contains('is-compact');

    if (window.innerWidth < 1280) {
      root.classList.remove('is-compact');
      setPlaceholder(false);
      return wasCompact;
    }

    root.classList.toggle('is-compact', window.scrollY >= stickyStart);
    setPlaceholder(root.classList.contains('is-compact'));
    return wasCompact !== root.classList.contains('is-compact');
  }

  function updateSlider() {
    const visible = getVisibleCount();
    const maxIndex = getMaxIndex();

    currentIndex = Math.min(currentIndex, maxIndex);

    const firstCard = track.querySelector('.recommendation-card');
    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap || '0') || 0;
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width + gap : track.offsetWidth / visible;
    track.style.transform = `translateX(${-currentIndex * cardWidth}px)`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex;
  }

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateSlider();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentIndex < getMaxIndex()) {
      currentIndex++;
      updateSlider();
    }
  });

  // Keyboard navigation on the slider
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' && currentIndex > 0) {
      currentIndex--;
      updateSlider();
    } else if (e.key === 'ArrowRight' && currentIndex < getMaxIndex()) {
      currentIndex++;
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
      if (updateCompactState()) updateSlider();
      scrollTicking = false;
    });
  }, { passive: true });

  setStickyStart();
  updateCompactState();
  updateSlider();
}
