import { resolvePublicAsset } from './utils.js';

export function init() {
  // Journal stories modal
  document.querySelectorAll('[data-stories-modal]').forEach(modal => {
    const openButtons = document.querySelectorAll('[data-stories-open]');
    const closeButtons = modal.querySelectorAll('[data-stories-close]');
    const prevButton = modal.querySelector('[data-stories-prev]');
    const nextButton = modal.querySelector('[data-stories-next]');
    const muteButton = modal.querySelector('[data-stories-mute]');
    const slides = Array.from(modal.querySelectorAll('.stories-modal__slide'));
    const videos = Array.from(modal.querySelectorAll('video.stories-modal__slide'));
    const progressItems = Array.from(modal.querySelectorAll('.stories-modal__progress-item'));
    const sidePrev = modal.querySelector('[data-stories-side-prev]');
    const sideNext = modal.querySelector('[data-stories-side-next]');
    const sideFarPrev = modal.querySelector('[data-stories-side-far-prev]');
    const sideFarNext = modal.querySelector('[data-stories-side-far-next]');
    let activeIndex = 0;
    let autoplayId = 0;
    let isMuted = false;

    if (!slides.length) return;

    function stopAutoplay() {
      window.clearTimeout(autoplayId);
      autoplayId = 0;
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayId = window.setTimeout(() => goTo(activeIndex + 1), 5000);
    }

    function goTo(index) {
      activeIndex = (index + slides.length) % slides.length;
      const activeSlide = slides[activeIndex];

      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        slide.classList.toggle('is-active', isActive);

        if (slide instanceof HTMLVideoElement) {
          slide.muted = isMuted;

          if (isActive) {
            slide.currentTime = 0;
            slide.play().catch(() => {});
          } else {
            slide.pause();
          }
        }
      });

      [
        [sidePrev, activeSlide?.dataset.sidePrev],
        [sideNext, activeSlide?.dataset.sideNext],
        [sideFarPrev, activeSlide?.dataset.sideFarPrev],
        [sideFarNext, activeSlide?.dataset.sideFarNext],
      ].forEach(([preview, previewSrc]) => {
        if (!preview || !previewSrc) return;
        const src = resolvePublicAsset(previewSrc);
        preview.setAttribute('src', src);
      });

      progressItems.forEach((item, itemIndex) => {
        item.classList.toggle('is-filled', itemIndex < activeIndex);
        item.classList.toggle('is-active', itemIndex === activeIndex);
        const bar = item.querySelector('span');
        if (bar) {
          bar.style.animation = 'none';
          void bar.offsetWidth;
          bar.style.animation = '';
        }
      });

      startAutoplay();
    }

    function openStories(event) {
      event.preventDefault();
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('is-modal-open');
      goTo(0);
    }

    function closeStories() {
      stopAutoplay();
      videos.forEach(video => video.pause());
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('is-modal-open');
    }

    openButtons.forEach(button => button.addEventListener('click', openStories));
    closeButtons.forEach(button => button.addEventListener('click', closeStories));
    prevButton?.addEventListener('click', () => goTo(activeIndex - 1));
    nextButton?.addEventListener('click', () => goTo(activeIndex + 1));
    muteButton?.addEventListener('click', () => {
      isMuted = !isMuted;
      videos.forEach(video => {
        video.muted = isMuted;
      });
      muteButton.classList.toggle('is-muted', isMuted);
      muteButton.setAttribute('aria-label', isMuted ? 'Включить звук' : 'Выключить звук');
    });

    document.addEventListener('keydown', event => {
      if (modal.hidden) return;

      if (event.key === 'Escape') closeStories();
      if (event.key === 'ArrowLeft') goTo(activeIndex - 1);
      if (event.key === 'ArrowRight') goTo(activeIndex + 1);
    });
  });
}
