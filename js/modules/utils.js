export const appBasePath = import.meta.env.BASE_URL || '/';

export function resolvePublicAsset(src) {
  if (!src || /^(?:https?:|data:|blob:)/.test(src)) return src;
  if (src.startsWith(appBasePath) || src.startsWith('./') || src.startsWith('../')) return src;
  if (src.startsWith('/images/')) return `${appBasePath}${src.slice(1)}`;
  if (src.startsWith('images/')) return `${appBasePath}${src}`;
  return src;
}

export function spriteHref(symbolId) {
  return `${appBasePath}images/icons/sprite.svg#${symbolId}`;
}

// ─── Свайп мышью: общий хелпер для всех слайдеров ──────────────────────────
// element  — контейнер, на котором слушаем drag
// threshold — минимальное смещение (px) чтобы считалось свайпом
// onSwipe(dir) — dir = +1 (влево / следующий) или -1 (вправо / предыдущий)
// Интерактивные элементы (button, a, input) внутри не перехватываются.
export function addMouseDrag(element, threshold, onSwipe) {
  if (!element) return;
  let startX = 0;
  let active = false;

  element.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    if (e.target.closest('button, a, input, select')) return;
    startX = e.clientX;
    active = true;
    e.preventDefault(); // блокируем выделение текста во время drag
  });

  window.addEventListener('mouseup', e => {
    if (!active) return;
    active = false;
    const dx = e.clientX - startX;
    if (Math.abs(dx) < threshold) return;
    onSwipe(dx < 0 ? 1 : -1);
  });
}
