import { spriteHref } from './utils.js';

export function init() {
  const tagsRoot = document.querySelector('.vacancies__tags');

  if (tagsRoot) {
    const tags = Array.from(tagsRoot.querySelectorAll('.vacancies__tag'));

    tags.forEach((tag) => {
      tag.setAttribute('role', 'button');
      tag.setAttribute('aria-pressed', tag.classList.contains('is-active') ? 'true' : 'false');

      tag.addEventListener('click', (event) => {
        event.preventDefault();

        const shouldClear = tag.classList.contains('is-active');

        tags.forEach((item) => {
          const isActive = !shouldClear && item === tag;
          item.classList.toggle('is-active', isActive);
          item.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
      });
    });
  }

  document.querySelectorAll('.vacancy-response__tabs').forEach((tabsRoot) => {
    const tabs = Array.from(tabsRoot.querySelectorAll('.vacancy-response__tab'));

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((item) => {
          const isActive = item === tab;
          item.classList.toggle('is-active', isActive);
          item.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
      });
    });
  });

  const closeResponseSelects = (except = null) => {
    document.querySelectorAll('.vacancy-response__select.is-open, .vacancy-response__country.is-open').forEach((field) => {
      if (field === except) return;
      field.classList.remove('is-open');
      field.querySelector('.vacancy-response__select-button')?.setAttribute('aria-expanded', 'false');
    });
  };

  document.querySelectorAll('.vacancy-response__select, .vacancy-response__country').forEach((field) => {
    const select = field.querySelector('select');
    if (!select || field.querySelector('.vacancy-response__select-button')) return;

    const isCountry = field.classList.contains('vacancy-response__country');
    field.classList.add('is-enhanced');

    const button = document.createElement('button');
    button.className = 'vacancy-response__select-button';
    button.type = 'button';
    button.setAttribute('aria-haspopup', 'listbox');
    button.setAttribute('aria-expanded', 'false');

    const buttonText = document.createElement('span');
    buttonText.className = 'vacancy-response__select-button-text';

    if (isCountry) {
      const flag = field.querySelector('.vacancy-response__flag svg')?.cloneNode(true);
      buttonText.classList.add('vacancy-response__select-button-text--flag');
      if (flag) buttonText.appendChild(flag);
    }

    const buttonIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    buttonIcon.classList.add('vacancy-response__select-button-icon');
    buttonIcon.setAttribute('aria-hidden', 'true');
    const buttonIconUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    buttonIconUse.setAttribute('href', spriteHref('icon-rec-button-arrow-down'));
    buttonIcon.appendChild(buttonIconUse);
    button.appendChild(buttonText);
    button.appendChild(buttonIcon);

    const list = document.createElement('div');
    list.className = 'vacancy-response__select-list';
    list.setAttribute('role', 'listbox');

    const syncSelect = () => {
      if (!isCountry) buttonText.textContent = select.selectedOptions[0]?.textContent?.trim() || '';
      list.querySelectorAll('.vacancy-response__select-option').forEach((option, index) => {
        option.setAttribute('aria-selected', String(index === select.selectedIndex));
      });
    };

    Array.from(select.options).forEach((option, index) => {
      const item = document.createElement('button');
      item.className = 'vacancy-response__select-option';
      item.type = 'button';
      item.textContent = option.textContent;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', String(option.selected));

      item.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        select.selectedIndex = index;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        syncSelect();
        closeResponseSelects();
      });

      list.appendChild(item);
    });

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const isOpen = field.classList.toggle('is-open');
      closeResponseSelects(isOpen ? field : null);
      button.setAttribute('aria-expanded', String(isOpen));
    });

    button.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      closeResponseSelects();
      button.focus();
    });

    select.addEventListener('change', syncSelect);
    syncSelect();
    field.appendChild(button);
    field.appendChild(list);
  });

  document.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('.vacancy-response__select, .vacancy-response__country')) return;
    closeResponseSelects();
  });

  document.querySelectorAll('.vacancy-response__field').forEach((field) => {
    const input = field.querySelector('input');
    const clear = field.querySelector('.vacancy-response__clear');
    if (!input || !clear) return;

    const hasInputValue = () => {
      if (input.type === 'tel') {
        const digits = input.value.replace(/\D/g, '');
        const localDigits = digits.startsWith('7') ? digits.slice(1) : digits;

        return localDigits.length > 0;
      }

      return input.value.trim().length > 0;
    };

    const syncClear = () => field.classList.toggle('is-filled', hasInputValue());

    input.addEventListener('input', syncClear);
    input.addEventListener('focus', syncClear);
    clear.addEventListener('click', (event) => {
      event.preventDefault();
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      field.classList.remove('is-error');
      field.closest('[data-input-field]')?.classList.remove('is-error');
      const caption = document.getElementById(input.getAttribute('aria-describedby'));
      if (caption) caption.textContent = '';
      input.focus();
      syncClear();
    });

    syncClear();
  });
  const vacancyCards = Array.from(document.querySelectorAll('.vacancy-card'));

  vacancyCards.forEach((card) => {
    const link = card.querySelector('.vacancy-card__link');
    if (!link) return;

    card.setAttribute('role', 'link');
    card.tabIndex = 0;

    card.addEventListener('click', (event) => {
      const target = event.target;

      if (target instanceof Element && target.closest('a, button, input, select, textarea, label')) return;
      link.click();
    });

    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      link.click();
    });
  });
}


