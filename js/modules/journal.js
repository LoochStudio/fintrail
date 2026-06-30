const TAG_ALIASES = {
  tourism: ['туризм'],
  quad: ['квадро'],
  fishing: ['рыбалка'],
  travel: ['путешествия'],
  snowmobile: ['снегоходы'],
  ski: ['горные лыжи'],
  guides: ['гайды', 'гайд'],
  interview: ['интервью'],
  new: ['новинки'],
  news: ['новости'],
  reviews: ['обзоры'],
  'customer-experience': ['опыт покупателей'],
  technology: ['технологии'],
};

// Static demo metadata. In Bitrix this will be replaced by real article section/type fields.
const EXTRA_CARD_TAGS = [
  ['tourism', 'guides', 'technology'],
  ['snowmobile', 'guides'],
  ['quad', 'reviews'],
  ['fishing', 'guides'],
  ['snowmobile', 'news'],
  ['travel', 'guides'],
  ['customer-experience', 'snowmobile'],
  ['technology', 'snowmobile'],
  ['ski', 'new'],
];

function getSlugFromHref(href) {
  if (!href) return '';
  const cleanHref = href.split('?')[0].replace(/\/$/, '');
  return cleanHref.split('/').filter(Boolean).pop() || '';
}

function normalizeText(value) {
  return value.trim().toLowerCase();
}

function getFilterGroup(chip) {
  return chip.closest('.catalog-tags__group--activities') ? 'activity' : 'type';
}

function getCardTags(card, index) {
  const tagTexts = Array.from(card.querySelectorAll('.journal-feed-card__tags span'))
    .map((tag) => normalizeText(tag.textContent || ''))
    .filter(Boolean);

  const slugs = new Set(EXTRA_CARD_TAGS[index] || []);

  Object.entries(TAG_ALIASES).forEach(([slug, aliases]) => {
    if (tagTexts.some((tagText) => aliases.includes(tagText))) {
      slugs.add(slug);
    }
  });

  return slugs;
}

export function init() {
  const tagsRoot = document.querySelector('.journal-page__tags');
  const showcase = document.querySelector('.journal-showcase--journal-page');
  const subscribe = document.querySelector('.journal-subscribe');
  const feed = document.querySelector('.journal-feed');
  const grid = feed?.querySelector('.journal-feed__grid');

  if (!tagsRoot || !feed || !grid) return;

  const chips = Array.from(tagsRoot.querySelectorAll('.catalog-tags__chip'));
  const cards = Array.from(grid.querySelectorAll('.journal-feed-card'));

  if (!chips.length || !cards.length) return;

  const filters = {
    activity: null,
    type: null,
  };

  const cardMeta = cards.map((card, index) => ({
    card,
    tags: getCardTags(card, index),
  }));

  function updateActiveChips() {
    chips.forEach((chip) => {
      const group = getFilterGroup(chip);
      const slug = getSlugFromHref(chip.getAttribute('href'));
      const isActive = filters[group] === slug;

      chip.classList.toggle('is-active', isActive);
      chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');

      if (isActive) {
        chip.setAttribute('aria-current', 'true');
      } else {
        chip.removeAttribute('aria-current');
      }
    });
  }

  function getActiveFilterValues() {
    return Object.values(filters).filter(Boolean);
  }

  function updatePageSections() {
    const hasFilters = getActiveFilterValues().length > 0;

    if (showcase) showcase.hidden = hasFilters;
    if (subscribe) subscribe.hidden = hasFilters;

    feed.classList.toggle('journal-feed--only', hasFilters);
  }

  function applyFilters() {
    const activeFilters = getActiveFilterValues();
    let visibleCount = 0;

    cardMeta.forEach(({ card, tags }) => {
      const isVisible = activeFilters.length === 0 || activeFilters.every((slug) => tags.has(slug));
      card.hidden = !isVisible;
      card.classList.toggle('is-hidden', !isVisible);

      if (isVisible) visibleCount += 1;
    });

    feed.classList.toggle('journal-feed--filtered', activeFilters.length > 0);
    feed.classList.toggle('journal-feed--empty', visibleCount === 0);
    updatePageSections();
  }

  chips.forEach((chip) => {
    chip.setAttribute('role', 'button');
    chip.setAttribute('aria-pressed', 'false');

    chip.addEventListener('click', (event) => {
      const group = getFilterGroup(chip);
      const slug = getSlugFromHref(chip.getAttribute('href'));
      if (!slug) return;

      event.preventDefault();

      // One active chip per visual group. Clicking the active chip again clears that group.
      filters[group] = filters[group] === slug ? null : slug;

      updateActiveChips();
      applyFilters();
    });
  });
}

