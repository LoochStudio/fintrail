export function init() {
  const rollHoverSelectors = [
    '.catalog-header .hero__nav-link',
    '.activity-picker__link',
    '.build-kit-desktop__filter',
    '.journal-showcase__category > span:not(.journal-showcase__category-media)',
    '.journal-showcase__all > span',
    '.recommendations-new__more > span',
    '.store-showcase__map > span',
    '.footer-desktop__link',
  ];

  document.querySelectorAll(rollHoverSelectors.join(',')).forEach(element => {
    const text = element.textContent.trim().replace(/\s+/g, ' ');
    if (!text) return;

    element.classList.add('roll-hover-text');
    element.dataset.hoverText = element.dataset.hoverText || text;
    element.setAttribute('aria-label', text);
  });

  const revealSelectors = [
    '.hero__title',
    '.hero__desc',
    '.login-bonus__title',
    '.login-bonus__desc',
    '.login-bonus__form',
    '.login-bonus__providers',
    '.recommendations-new__title',
    '.recommendations-new__more',
    '.activity-picker__title',
    '.activity-picker__link',
    '.gift-cards-showcase__title',
    '.build-kit-desktop__title',
    '.build-kit-desktop__gender',
    '.build-kit-desktop__filters',
    '.build-kit-desktop__kit-meta',
    '.build-kit-desktop__summary',
    '.journal-showcase__title',
    '.journal-showcase__category',
    '.journal-showcase__all',
    '.store-showcase__title',
    '.store-showcase__description',
    '.store-showcase__row',
    '.store-showcase__map',
    '.community-showcase__title',
    '.community-showcase__description',
    '.community-showcase__name',
    '.community-showcase__stats',
    '.footer-desktop__column',
    '.footer-desktop__socials',
    '.footer-desktop__legal',
  ];

  const revealItems = Array.from(document.querySelectorAll(revealSelectors.join(',')));
  const shouldAnimateTextReveal = window.matchMedia('(min-width: 1280px)').matches;

  if (shouldAnimateTextReveal && 'IntersectionObserver' in window && revealItems.length) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.18,
      rootMargin: '0px 0px -8% 0px',
    });

    const sectionCounters = new WeakMap();

    revealItems.forEach(element => {
      const section = element.closest('section, footer') || document.body;
      const index = sectionCounters.get(section) || 0;
      sectionCounters.set(section, index + 1);

      element.classList.add('text-reveal');
      element.style.setProperty('--reveal-delay', `${Math.min(index * 70, 420)}ms`);
      revealObserver.observe(element);
    });
  } else {
    revealItems.forEach(element => element.classList.add('is-visible'));
  }
}
