const CIRCUMFERENCE = 2 * Math.PI * 34; // 213.63
const DOT_CIRCUMFERENCE = 2 * Math.PI * 7; // 43.9823
const SLIDE_DURATION = 5000; // ms per slide
const DESKTOP_QUERY = '(min-width: 1280px)';

export function init() {
  document.querySelectorAll('.about-audience').forEach(initSlider);
}

function initSlider(section) {
  const items = [...section.querySelectorAll('.about-audience__item')];
  const bannerImg = section.querySelector('.about-audience__banner-img');
  const infoEl = section.querySelector('.about-audience__info');
  const infoTitle = section.querySelector('.about-audience__info-title');
  const infoDesc = section.querySelector('.about-audience__info-desc');
  const prevBtn = section.querySelector('[data-audience-prev]');
  const nextBtn = section.querySelector('[data-audience-next]');
  const dots = [...section.querySelectorAll('[data-audience-dot]')];

  if (!items.length) return;

  let current = 0;
  let elapsed = 0;
  let lastTs = null;
  let rafId = null;

  function activate(index) {
    items[current].classList.remove('is-active');
    setRingOffset(items[current], CIRCUMFERENCE);
    setDotOffset(dots[current], DOT_CIRCUMFERENCE);

    current = (index + items.length) % items.length;
    items[current].classList.add('is-active');
    syncDots();
    scrollActiveCategoryIntoView();

    elapsed = 0;
    lastTs = null;
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(tick);

    const { banner, title, desc } = items[current].dataset;
    bannerImg?.classList.add('is-changing');
    infoEl?.classList.add('is-changing');

    setTimeout(() => {
      if (bannerImg && banner) bannerImg.src = banner;
      if (infoTitle && title) infoTitle.textContent = title;
      if (infoDesc && desc) infoDesc.textContent = desc;
      bannerImg?.classList.remove('is-changing');
      infoEl?.classList.remove('is-changing');
    }, 300);
  }

  function setRingOffset(item, offset) {
    const fill = item.querySelector('.about-audience__ring-fill');
    if (fill) fill.style.strokeDashoffset = offset;
  }

  function setDotOffset(dot, offset) {
    const fill = dot?.querySelector('.about-audience__dot-progress');
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

  function scrollActiveCategoryIntoView() {
    const activeItem = items[current];
    const list = section.querySelector('.about-audience__list');
    if (!activeItem || !list || window.matchMedia(DESKTOP_QUERY).matches) return;

    const targetLeft = activeItem.offsetLeft - (list.clientWidth - activeItem.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
  }

  function tick(ts) {
    if (lastTs !== null) elapsed += ts - lastTs;
    lastTs = ts;

    const progress = Math.min(elapsed / SLIDE_DURATION, 1);
    setRingOffset(items[current], CIRCUMFERENCE * (1 - progress));
    setDotOffset(dots[current], DOT_CIRCUMFERENCE * (1 - progress));

    if (progress < 1) {
      rafId = requestAnimationFrame(tick);
    } else {
      activate(current + 1);
    }
  }

  const first = items[0];
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

  items.forEach((item, i) => {
    item.querySelector('.about-audience__trigger')?.addEventListener('click', () => {
      if (i === current) return;
      cancelAnimationFrame(rafId);
      activate(i);
    });
  });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      if (i === current) return;
      cancelAnimationFrame(rafId);
      activate(i);
    });
  });
}
