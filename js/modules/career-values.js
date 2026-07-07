const DOT_CIRCUMFERENCE = 2 * Math.PI * 7; // 43.9823
const SLIDE_DURATION = 5000;

export function init() {
  document.querySelectorAll('.career-values').forEach(initSlider);
}

function initSlider(section) {
  const dots = [...section.querySelectorAll('[data-values-dot]')];
  const infoEl = section.querySelector('.career-values__info');
  const infoTitle = section.querySelector('.career-values__info-title');
  const infoDesc = section.querySelector('.career-values__info-desc');
  const prevBtn = section.querySelector('[data-values-prev]');
  const nextBtn = section.querySelector('[data-values-next]');

  if (!dots.length) return;

  let current = 0;
  let elapsed = 0;
  let lastTs = null;
  let rafId = null;

  function setDotOffset(dot, offset) {
    const fill = dot?.querySelector('.career-values__dot-progress');
    if (fill) fill.style.strokeDashoffset = offset;
  }

  function syncDots() {
    dots.forEach((dot, i) => {
      const active = i === current;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
      if (!active) setDotOffset(dot, DOT_CIRCUMFERENCE);
    });
  }

  function activate(index) {
    setDotOffset(dots[current], DOT_CIRCUMFERENCE);
    current = (index + dots.length) % dots.length;
    syncDots();

    elapsed = 0;
    lastTs = null;
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(tick);

    const { title, desc } = dots[current].dataset;
    infoEl?.classList.add('is-changing');

    setTimeout(() => {
      if (infoTitle && title !== undefined) infoTitle.textContent = title;
      if (infoDesc && desc !== undefined) infoDesc.textContent = desc;
      infoEl?.classList.remove('is-changing');
    }, 300);
  }

  function tick(ts) {
    if (lastTs !== null) elapsed += ts - lastTs;
    lastTs = ts;

    const progress = Math.min(elapsed / SLIDE_DURATION, 1);
    setDotOffset(dots[current], DOT_CIRCUMFERENCE * (1 - progress));

    if (progress < 1) {
      rafId = requestAnimationFrame(tick);
    } else {
      activate(current + 1);
    }
  }

  const first = dots[0];
  if (infoTitle) infoTitle.textContent = first.dataset.title || '';
  if (infoDesc) infoDesc.textContent = first.dataset.desc || '';
  syncDots();
  rafId = requestAnimationFrame(tick);

  prevBtn?.addEventListener('click', () => {
    cancelAnimationFrame(rafId);
    activate(current - 1);
  });

  nextBtn?.addEventListener('click', () => {
    cancelAnimationFrame(rafId);
    activate(current + 1);
  });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      if (i === current) return;
      cancelAnimationFrame(rafId);
      activate(i);
    });
  });
}
