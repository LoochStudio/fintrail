import { addMouseDrag } from './utils.js';

export function init() {
  // ─── Hero slider ────────────────────────────────────────────────────────────
  const heroSlidesWrap = document.querySelector('.hero__slides');
  if (heroSlidesWrap) {
    const hero = document.querySelector('.hero');
    const slides  = document.querySelectorAll('.hero__slide');
    const infos   = document.querySelectorAll('.hero__info');
    const dots    = hero?.querySelectorAll('.js-slider-dot') || [];
    const productSets = document.querySelectorAll('[data-hero-products]');
    const btnPrev = hero?.querySelector('.js-slider-prev');
    const btnNext = hero?.querySelector('.js-slider-next');
    const total   = Math.max(dots.length, slides.length);
    let current   = 0;
    let autoplayTimer;

    function replayCurrentSlide() {
      if (slides.length !== 1 || !hero) return;

      hero.classList.remove('is-replaying');
      void hero.offsetWidth;
      hero.classList.add('is-replaying');
    }

    function restartProgress() {
      const activeDot = dots[current];
      if (!activeDot) return;

      activeDot.classList.remove('is-loading');
      void activeDot.offsetWidth;
      activeDot.classList.add('is-loading');
    }

    function goTo(idx, force = false) {
      const next = (idx + total) % total;
      if (next === current && !force) {
        restartProgress();
        replayCurrentSlide();
        return;
      }

      dots[current]?.classList.remove('is-active', 'is-loading');
      infos[current % infos.length]?.classList.remove('is-active');
      productSets[current % productSets.length]?.classList.remove('is-active');
      productSets[current % productSets.length]?.setAttribute('hidden', '');

      current = next;
      heroSlidesWrap.style.transform = slides.length > 1
        ? `translateX(-${(current % slides.length) * 100}%)`
        : 'translateX(0)';

      dots[current]?.classList.add('is-active');
      infos[current % infos.length]?.classList.add('is-active');
      productSets[current % productSets.length]?.classList.add('is-active');
      productSets[current % productSets.length]?.removeAttribute('hidden');
      restartProgress();
      replayCurrentSlide();

      btnPrev?.classList.toggle('is-inactive', false);
      btnNext?.classList.toggle('is-inactive', false);
    }

    function startAutoplay() {
      window.clearInterval(autoplayTimer);
      autoplayTimer = window.setInterval(() => {
        goTo(current + 1, true);
      }, 5000);
    }

    function goToManual(idx) {
      goTo(idx);
      startAutoplay();
    }

    restartProgress();
    startAutoplay();

    btnPrev?.addEventListener('click', () => goToManual(current - 1));
    btnNext?.addEventListener('click', () => goToManual(current + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goToManual(i)));

    // Свайп на мобайле
    let touchStartX = 0;

    hero?.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    hero?.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) < 50) return;
      goToManual(dx < 0 ? current + 1 : current - 1);
    }, { passive: true });

    addMouseDrag(heroSlidesWrap, 50, dir => goToManual(current + dir));
  }
}
