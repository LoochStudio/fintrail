function initAccordion(rootSelector, itemSelector, toggleSelector, panelSelector) {
  document.querySelectorAll(rootSelector).forEach(root => {
    root.querySelectorAll(toggleSelector).forEach(toggle => {
      toggle.addEventListener('click', () => {
        const item = toggle.closest(itemSelector);
        const panel = item?.querySelector(panelSelector);
        if (!item || !panel) return;

        const shouldOpen = !item.classList.contains('is-open');

        root.querySelectorAll(itemSelector).forEach(otherItem => {
          const otherToggle = otherItem.querySelector(toggleSelector);
          const otherPanel = otherItem.querySelector(panelSelector);
          otherItem.classList.remove('is-open');
          otherToggle?.setAttribute('aria-expanded', 'false');
          otherPanel?.setAttribute('hidden', '');
        });

        if (shouldOpen) {
          item.classList.add('is-open');
          toggle.setAttribute('aria-expanded', 'true');
          panel.removeAttribute('hidden');
        }
      });
    });
  });
}

function initProgress() {
  const section = document.querySelector('[data-loyalty-progress]');
  if (!section) return;

  const scale = section.querySelector('.loyalty-progress__scale');
  const levels = Array.from(section.querySelectorAll('[data-loyalty-level]'));
  if (!scale || levels.length === 0) return;

  const setProgress = value => {
    const progress = Math.max(0, Math.min(1, value));
    const activeIndex = Math.min(levels.length - 1, Math.floor(progress * levels.length));

    section.style.setProperty('--loyalty-progress-value', progress * 100 + '%');
    scale.setAttribute('aria-valuenow', String(Math.round(progress * 100)));

    levels.forEach((level, index) => {
      level.classList.toggle('is-active', index === activeIndex);
      level.classList.toggle('is-reached', index / levels.length <= progress);
    });
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setProgress(0.27);
    return;
  }

  const duration = 30000;
  const offset = duration * 0.27;
  const startedAt = performance.now() - offset;

  const tick = now => {
    setProgress(((now - startedAt) % duration) / duration);
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function initOperationsCarousel() {
  const carousel = document.querySelector('[data-loyalty-operations-carousel]');
  if (!carousel) return;

  let startX = 0;
  let startScrollLeft = 0;
  let isDragging = false;

  carousel.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;

    isDragging = true;
    startX = event.clientX;
    startScrollLeft = carousel.scrollLeft;
    carousel.classList.add('is-dragging');
    carousel.setPointerCapture(event.pointerId);
  });

  carousel.addEventListener('pointermove', event => {
    if (!isDragging) return;
    carousel.scrollLeft = startScrollLeft - (event.clientX - startX);
  });

  const stopDragging = event => {
    if (!isDragging) return;

    isDragging = false;
    carousel.classList.remove('is-dragging');
    if (carousel.hasPointerCapture(event.pointerId)) {
      carousel.releasePointerCapture(event.pointerId);
    }
  };

  carousel.addEventListener('pointerup', stopDragging);
  carousel.addEventListener('pointercancel', stopDragging);

  carousel.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    event.preventDefault();
    const card = carousel.querySelector('.loyalty-operation');
    const gap = Number.parseFloat(getComputedStyle(carousel).columnGap) || 0;
    const step = (card?.getBoundingClientRect().width || 200) + gap;
    carousel.scrollBy({
      left: event.key === 'ArrowRight' ? step : -step,
      behavior: 'smooth',
    });
  });
}
function initOperationsTabs() {
  const tabList = document.querySelector('.loyalty-ops [role="tablist"]');
  if (!tabList) return;

  const ops = tabList.closest('.loyalty-ops');
  const list = ops?.querySelector('.loyalty-ops__list');
  if (!list) return;

  tabList.addEventListener('click', e => {
    const btn = e.target.closest('.loyalty-ops__tab');
    if (!btn) return;

    const tabs = Array.from(tabList.querySelectorAll('.loyalty-ops__tab'));
    const index = tabs.indexOf(btn);
    if (index === -1) return;

    tabs.forEach((t, i) => {
      t.classList.toggle('is-active', i === index);
      t.setAttribute('aria-selected', String(i === index));
    });

    list.querySelectorAll('.loyalty-ops__item').forEach(item => {
      const amount = item.querySelector('.loyalty-ops__amount');
      let visible = true;
      if (index === 1) visible = amount?.classList.contains('is-positive') ?? true;
      if (index === 2) visible = amount?.classList.contains('is-negative') ?? true;
      item.hidden = !visible;
    });
  });
}

export function init() {
  initProgress();
  initOperationsCarousel();
  initOperationsTabs();
  initAccordion(
    '[data-loyalty-accordion]',
    '[data-loyalty-accordion-item]',
    '[data-loyalty-accordion-toggle]',
    '[data-loyalty-accordion-panel]'
  );
  initAccordion(
    '[data-loyalty-faq]',
    '.loyalty-faq__item',
    '[data-loyalty-faq-toggle]',
    '[data-loyalty-faq-panel]'
  );
}