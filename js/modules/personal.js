export function init() {
  document.querySelectorAll('.order-item__icon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const active = btn.classList.toggle('is-active');
      btn.setAttribute('aria-label', active ? 'Убрать из избранного' : 'Добавить в избранное');
    });
  });
}
