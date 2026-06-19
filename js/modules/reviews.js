export function init() {
  initSortDropdown();
  initReviewMenus();
  initReviewFormModal();
}

function initSortDropdown() {
  document.querySelectorAll('[data-reviews-sort]').forEach(root => {
    const btn = root.querySelector('[data-reviews-sort-btn]');
    const dropdown = root.querySelector('.reviews-page__sort-dropdown');
    if (!btn || !dropdown) return;

    btn.addEventListener('click', () => {
      const isOpen = !dropdown.hasAttribute('hidden');
      if (isOpen) {
        close(btn, dropdown);
      } else {
        open(btn, dropdown);
      }
    });

    dropdown.querySelectorAll('button[role="option"]').forEach(option => {
      option.addEventListener('click', () => {
        const label = root.querySelector('.reviews-page__sort-label');
        if (label) label.textContent = option.textContent;
        dropdown.querySelectorAll('button[role="option"]').forEach(o => o.removeAttribute('aria-selected'));
        option.setAttribute('aria-selected', 'true');
        close(btn, dropdown);
      });
    });

    document.addEventListener('click', e => {
      if (!root.contains(e.target)) close(btn, dropdown);
    });
  });
}

function initReviewMenus() {
  document.querySelectorAll('[data-review-menu]').forEach(btn => {
    const dropdown = btn.parentElement.querySelector('.review-card__dropdown');
    if (!dropdown) return;

    btn.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = !dropdown.hasAttribute('hidden');
      // close all other open menus first
      document.querySelectorAll('.review-card__dropdown:not([hidden])').forEach(d => {
        const b = d.parentElement.querySelector('[data-review-menu]');
        if (b) b.setAttribute('aria-expanded', 'false');
        d.setAttribute('hidden', '');
      });
      if (!isOpen) {
        dropdown.removeAttribute('hidden');
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    document.addEventListener('click', () => {
      if (!dropdown.hasAttribute('hidden')) {
        dropdown.setAttribute('hidden', '');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

function open(btn, dropdown) {
  dropdown.removeAttribute('hidden');
  btn.setAttribute('aria-expanded', 'true');
}

function close(btn, dropdown) {
  dropdown.setAttribute('hidden', '');
  btn.setAttribute('aria-expanded', 'false');
}

function initReviewFormModal() {
  const modal = document.querySelector('[data-review-form-modal]');
  if (!modal) return;

  const panel = modal.querySelector('.review-form-modal__panel');

  function openModal() {
    modal.removeAttribute('hidden');
    modal.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => modal.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    panel.addEventListener('transitionend', () => {
      modal.setAttribute('hidden', '');
      modal.setAttribute('aria-hidden', 'true');
    }, { once: true });
  }

  // Open on «Редактировать»
  document.querySelectorAll('[data-review-form-open]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      // Close the dropdown that triggered this
      const dropdown = btn.closest('.review-card__dropdown');
      if (dropdown) {
        dropdown.setAttribute('hidden', '');
        const menuBtn = dropdown.parentElement?.querySelector('[data-review-menu]');
        if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
      }
      openModal();
    });
  });

  // Close on backdrop / close buttons
  modal.querySelectorAll('[data-review-form-close]').forEach(el => {
    el.addEventListener('click', closeModal);
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  // Stars interaction
  const starsContainer = modal.querySelector('[data-review-form-stars]');
  const ratingValue = modal.querySelector('[data-review-form-rating]');
  if (starsContainer && ratingValue) {
    starsContainer.querySelectorAll('.review-form-modal__star').forEach(star => {
      star.addEventListener('click', () => {
        const val = Number(star.dataset.value);
        ratingValue.textContent = val;
        starsContainer.querySelectorAll('.review-form-modal__star').forEach(s => {
          s.classList.toggle('is-active', Number(s.dataset.value) <= val);
        });
      });
    });
  }

  // Size fit toggle
  const sizeContainer = modal.querySelector('[data-review-form-size]');
  if (sizeContainer) {
    sizeContainer.querySelectorAll('.review-form-modal__size-option').forEach(btn => {
      btn.addEventListener('click', () => {
        sizeContainer.querySelectorAll('.review-form-modal__size-option').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
      });
    });
  }
}
