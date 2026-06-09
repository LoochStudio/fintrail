import { addMouseDrag } from './utils.js';

export function init() {
  // ─── Recommendations carousel ─────────────────────────────────────────────
  document.querySelectorAll('.recommendations-new').forEach(section => {
    const viewport = section.querySelector('.recommendations-new__viewport');
    const track = section.querySelector('.recommendations-new__track');
    const btnPrev = section.querySelector('.js-slider-prev');
    const btnNext = section.querySelector('.js-slider-next');
    const originals = Array.from(section.querySelectorAll('.recommendation-card'));

    if (!viewport || !track || !btnPrev || !btnNext || originals.length <= 1) return;

    const total = originals.length;
    let index = total;
    let isAnimating = false;

    function cloneCard(card) {
      const clone = card.cloneNode(true);
      clone.dataset.carouselClone = 'true';
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('a, button, [tabindex]').forEach(el => {
        el.setAttribute('tabindex', '-1');
      });
      return clone;
    }

    const before = originals.map(cloneCard);
    const after = originals.map(cloneCard);
    before.forEach(card => track.insertBefore(card, track.firstChild));
    after.forEach(card => track.appendChild(card));

    const cards = Array.from(track.querySelectorAll('.recommendation-card'));

    btnPrev.classList.remove('is-inactive');
    btnNext.classList.remove('is-inactive');

    function isCarouselLayout() {
      return window.innerWidth >= 768;
    }

    function cardWidth() {
      return cards[0]?.getBoundingClientRect().width || (isCarouselLayout() ? 360 : viewport.getBoundingClientRect().width / 4);
    }

    function setPosition(nextIndex, animate = true) {
      if (!isCarouselLayout()) {
        track.style.transform = '';
        return;
      }

      track.style.transition = animate ? '' : 'none';
      track.style.transform = `translateX(-${nextIndex * cardWidth()}px)`;

      if (!animate) {
        void track.offsetWidth;
        track.style.transition = '';
      }
    }

    function goTo(nextIndex) {
      if (!isCarouselLayout() || isAnimating) return;
      isAnimating = true;
      index = nextIndex;
      setPosition(index);
    }

    track.addEventListener('transitionend', event => {
      if (event.propertyName !== 'transform') return;

      if (index >= total * 2) {
        index -= total;
        setPosition(index, false);
      }

      if (index < total) {
        index += total;
        setPosition(index, false);
      }

      isAnimating = false;
    });

    btnPrev.addEventListener('click', () => goTo(index - 1));
    btnNext.addEventListener('click', () => goTo(index + 1));

    let touchStartX = 0;

    viewport.addEventListener('touchstart', event => {
      touchStartX = event.touches[0].clientX;
    }, { passive: true });

    viewport.addEventListener('touchend', event => {
      const dx = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) < 50) return;
      goTo(dx < 0 ? index + 1 : index - 1);
    }, { passive: true });

    addMouseDrag(viewport, 50, dir => goTo(index + dir));

    let wheelAccumulated = 0;
    let wheelLocked = false;

    viewport.addEventListener('wheel', event => {
      if (!isCarouselLayout()) return;
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) return;

      event.preventDefault();

      if (wheelLocked) {
        wheelAccumulated = 0;
        return;
      }

      wheelAccumulated += event.deltaX;

      if (Math.abs(wheelAccumulated) > 30) {
        const dir = wheelAccumulated > 0 ? 1 : -1;
        wheelAccumulated = 0;
        wheelLocked = true;
        goTo(index + dir);
        setTimeout(() => { wheelLocked = false; }, 600);
      }
    }, { passive: false });

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Сбрасываем флаг анимации — transitionend мог не сработать при ресайзе
        isAnimating = false;

        if (!isCarouselLayout()) {
          track.style.transition = 'none';
          track.style.transform = '';
          return;
        }

        // Сбрасываем на первую реальную карточку если index невалидный
        if (index < total || index >= total * 2) {
          index = total;
        }

        // Двойной rAF: первый — фиксирует изменения стилей,
        // второй — гарантирует что getBoundingClientRect() вернёт новые значения
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setPosition(index, false);
          });
        });
      }, 100); // debounce 100ms — не пересчитываем на каждый пиксель ресайза
    });
    setPosition(index, false);
  });
}
