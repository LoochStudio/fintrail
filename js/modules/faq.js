export function init() {
  // Tab switching
  document.querySelectorAll('[data-faq-tabs]').forEach((tabsRoot) => {
    const tabs = Array.from(tabsRoot.querySelectorAll('[data-faq-tab]'));
    const content = tabsRoot.closest('.faq-page__content');
    if (!content) return;

    const panels = Array.from(content.querySelectorAll('[data-faq-panel]'));

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.faqTab;

        tabs.forEach((item) => {
          const isActive = item === tab;
          item.classList.toggle('is-active', isActive);
          item.setAttribute('aria-selected', String(isActive));
        });

        panels.forEach((panel) => {
          const isActive = panel.dataset.faqPanel === target;
          panel.hidden = !isActive;
        });
      });
    });
  });

  // Accordion toggle
  document.querySelectorAll('[data-faq-toggle]').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const item = toggle.closest('.faq-item');
      if (!item) return;
      const isOpen = item.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  });
}
