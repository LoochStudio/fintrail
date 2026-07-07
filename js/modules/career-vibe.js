export function init() {
  document.querySelectorAll('.career-vibe').forEach(initVibe);
}

function initVibe(section) {
  const track = section.querySelector('.career-vibe__track');
  const prevBtn = section.querySelector('[data-vibe-prev]');
  const nextBtn = section.querySelector('[data-vibe-next]');

  if (!track) return;

  const slides = [...track.querySelectorAll('.career-vibe__slide')];
  if (!slides.length) return;

  function getStep() {
    const gap = parseFloat(getComputedStyle(track).gap) || 20;
    return slides[0].offsetWidth + gap;
  }

  function syncButtons() {
    const atStart = track.scrollLeft <= 0;
    const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
    prevBtn?.toggleAttribute('disabled', atStart);
    nextBtn?.toggleAttribute('disabled', atEnd);
  }

  prevBtn?.addEventListener('click', () => {
    track.scrollBy({ left: -getStep() });
  });

  nextBtn?.addEventListener('click', () => {
    track.scrollBy({ left: getStep() });
  });

  track.addEventListener('scroll', syncButtons, { passive: true });

  syncButtons();
}
