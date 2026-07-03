const CIRCUMFERENCE = 2 * Math.PI * 34; // 213.63
const SLIDE_DURATION = 5000; // ms per slide

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

  if (!items.length) return;

  let current = 0;
  let elapsed = 0;   // накопленное время текущего слайда
  let lastTs = null; // timestamp последнего кадра
  let rafId = null;
  let paused = false;

  function activate(index) {
    items[current].classList.remove('is-active');
    setRingOffset(items[current], CIRCUMFERENCE);

    current = (index + items.length) % items.length;
    items[current].classList.add('is-active');

    elapsed = 0;
    lastTs = null;
    cancelAnimationFrame(rafId);
    if (!paused) rafId = requestAnimationFrame(tick);

    // Анимация: fade out → смена контента → fade in
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

  function tick(ts) {
    if (paused) return;
    if (lastTs !== null) elapsed += ts - lastTs;
    lastTs = ts;

    const progress = Math.min(elapsed / SLIDE_DURATION, 1);
    setRingOffset(items[current], CIRCUMFERENCE * (1 - progress));

    if (progress < 1) {
      rafId = requestAnimationFrame(tick);
    } else {
      activate(current + 1);
    }
  }

  // Инициализация первого слайда
  const first = items[0];
  if (infoTitle) infoTitle.textContent = first.dataset.title || '';
  if (infoDesc) infoDesc.textContent = first.dataset.desc || '';

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

  // Пауза на hover — не сбрасывает прогресс, только замораживает
  section.addEventListener('mouseenter', () => {
    paused = true;
    lastTs = null; // не считаем время пока мышь внутри
    cancelAnimationFrame(rafId);
  });

  section.addEventListener('mouseleave', () => {
    paused = false;
    lastTs = null; // новый кадр начнёт отсчёт без скачка
    rafId = requestAnimationFrame(tick);
  });
}
