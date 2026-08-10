export function init() {
  const page = document.querySelector('[data-wishlist-page]');
  if (!page) return;

  const cards = Array.from(page.querySelectorAll('.catalog-product-card'));
  const count = page.querySelector('[data-wishlist-count]');
  const empty = page.querySelector('[data-wishlist-empty]');
  const loadMore = page.querySelector('[data-load-more]');
  const pagination = page.querySelector('.catalog-pagination');

  cards.forEach(card => {
    const button = card.querySelector('.js-wishlist');
    if (!button) return;

    button.classList.add('is-saved');
    button.setAttribute('aria-label', 'Убрать из избранного');
  });

  const updateState = () => {
    const remaining = cards.filter(card => !card.hidden).length;
    if (count) count.textContent = String(remaining);
    if (empty) empty.hidden = remaining > 0;
    if (loadMore && remaining === 0) loadMore.hidden = true;
    if (pagination && remaining === 0) pagination.hidden = true;
  };

  page.addEventListener('click', event => {
    const button = event.target.closest('.js-wishlist');
    const card = button?.closest('.catalog-product-card');
    if (!button || !card || card.classList.contains('is-removing')) return;

    window.setTimeout(() => {
      if (button.classList.contains('is-saved')) return;

      card.classList.add('is-removing');
      window.setTimeout(() => {
        card.hidden = true;
        card.classList.remove('is-removing');
        updateState();
      }, 200);
    }, 0);
  });

  updateState();
}
