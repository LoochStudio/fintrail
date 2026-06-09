import { addMouseDrag } from './utils.js';

export function init() {
  // ─── Gift cards carousel ─────────────────────────────────────────────────
  document.querySelectorAll('.gift-cards-showcase').forEach(section => {
    const body = section.querySelector('.gift-cards-showcase__body');
    const track = section.querySelector('.gift-cards-showcase__track');
    const btnPrev = section.querySelector('.gift-cards-showcase__arrow[aria-label="Назад"]');
    const btnNext = section.querySelector('.gift-cards-showcase__arrow[aria-label="Вперед"]');
    const originals = Array.from(section.querySelectorAll('.gift-cards-showcase__card'));

    if (!body || !track || !btnPrev || !btnNext || originals.length <= 1) return;

    const total = originals.length;
    const initialOriginal = Math.max(0, originals.findIndex(card => card.classList.contains('is-active')));
    let index = total + initialOriginal;
    let isAnimating = false;

    function cloneCard(card) {
      const clone = card.cloneNode(true);
      clone.classList.remove('is-active');
      clone.dataset.carouselClone = 'true';
      clone.setAttribute('aria-hidden', 'true');
      if (clone.matches('a, button, [tabindex]')) {
        clone.setAttribute('tabindex', '-1');
      }
      clone.querySelectorAll('a, button, [tabindex]').forEach(el => {
        el.setAttribute('tabindex', '-1');
      });
      return clone;
    }

    originals.forEach(card => card.classList.remove('is-active'));
    originals.map(cloneCard).reverse().forEach(card => track.insertBefore(card, track.firstChild));
    originals.map(cloneCard).forEach(card => track.appendChild(card));

    const cards = Array.from(track.querySelectorAll('.gift-cards-showcase__card'));
    let lastLayoutMode = '';

    function isDesktop() {
      return window.innerWidth >= 1280;
    }

    function getLayoutMode() {
      if (window.innerWidth >= 1280) return 'desktop';
      if (window.innerWidth >= 768) return 'tablet';
      return 'mobile';
    }

    function getTrackGap() {
      const styles = window.getComputedStyle(track);
      return parseFloat(styles.columnGap || styles.gap) || 32;
    }

    function getCardMetric(name, fallback) {
      const styles = window.getComputedStyle(section);
      const value = parseFloat(styles.getPropertyValue(name));
      return Number.isFinite(value) && value > 0 ? value : fallback;
    }

    function getFinalCardCenter(activeIndex) {
      const gap = getTrackGap();
      const sideWidth = getCardMetric('--gift-card-side-width', cards[activeIndex]?.getBoundingClientRect().width || 0);
      const activeWidth = getCardMetric('--gift-card-active-width', sideWidth);

      let left = 0;
      for (let i = 0; i < activeIndex; i += 1) {
        left += sideWidth + gap;
      }

      return left + activeWidth / 2;
    }

    function setActive(nextIndex) {
      cards.forEach((card, i) => {
        const isActive = i === nextIndex;
        card.classList.toggle('is-active', isActive);
        card.setAttribute('aria-hidden', card.dataset.carouselClone === 'true' ? 'true' : 'false');
        card.tabIndex = isActive && card.dataset.carouselClone !== 'true' ? 0 : -1;
      });
    }

    function centerActive(nextIndex, animate = true) {
      setActive(nextIndex);
      track.style.transition = animate ? '' : 'none';

      const bodyWidth = body.getBoundingClientRect().width;
      const cardCenter = getFinalCardCenter(nextIndex);
      const offset = bodyWidth / 2 - cardCenter;
      track.style.transform = `translateX(${offset}px)`;

      if (!animate) {
        void track.offsetWidth;
        track.style.transition = '';
      }
    }

    function goTo(nextIndex) {
      if (isAnimating) return;
      isAnimating = true;
      index = nextIndex;
      centerActive(index);

      if (!isDesktop()) {
        window.setTimeout(() => {
          isAnimating = false;
        }, 760);
      }
    }

    track.addEventListener('transitionend', event => {
      if (event.target !== track || event.propertyName !== 'transform') return;

      if (index >= total * 2) {
        index -= total;
        section.classList.add('is-resetting');
        centerActive(index, false);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => section.classList.remove('is-resetting'));
        });
      }

      if (index < total) {
        index += total;
        section.classList.add('is-resetting');
        centerActive(index, false);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => section.classList.remove('is-resetting'));
        });
      }

      isAnimating = false;
    });

    btnPrev.addEventListener('click', () => goTo(index - 1));
    btnNext.addEventListener('click', () => goTo(index + 1));
    cards.forEach((card, cardIndex) => {
      card.addEventListener('click', event => {
        if (card.classList.contains('is-active')) return;

        event.preventDefault();

        const direction = cardIndex < index ? -1 : 1;
        goTo(index + direction);
      });
    });

    let touchStartX = 0;
    section.addEventListener('touchstart', event => {
      touchStartX = event.touches[0].clientX;
    }, { passive: true });

    section.addEventListener('touchend', event => {
      if (isDesktop()) return;
      const delta = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) < 45) return;
      goTo(index + (delta < 0 ? 1 : -1));
    }, { passive: true });

    addMouseDrag(section, 45, dir => goTo(index + dir));

    let resizeFrame = 0;
    function refreshPosition() {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        const currentMode = getLayoutMode();
        const didChangeMode = currentMode !== lastLayoutMode;
        lastLayoutMode = currentMode;

        if (didChangeMode) {
          section.classList.add('is-resetting');
        }

        centerActive(index, false);
        window.requestAnimationFrame(() => {
          centerActive(index, false);
          section.classList.remove('is-resetting');
        });
      });
    }

    window.addEventListener('resize', refreshPosition);
    window.addEventListener('orientationchange', refreshPosition);
    window.addEventListener('load', refreshPosition);
    cards.forEach(card => {
      card.querySelectorAll('img').forEach(img => {
        img.addEventListener('load', refreshPosition, { once: true });
      });
    });
    lastLayoutMode = getLayoutMode();
    centerActive(index, false);
  });
}
