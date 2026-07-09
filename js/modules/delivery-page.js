export function init() {
  document.querySelectorAll('[data-delivery-tabs]').forEach((tabsRoot) => {
    const tabs = Array.from(tabsRoot.querySelectorAll('[data-delivery-tab]'));
    const section = tabsRoot.closest('.delivery-page__table');
    if (!section) return;

    const panels = Array.from(section.querySelectorAll('[data-delivery-panel]'));

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.deliveryTab;

        tabs.forEach((item) => {
          const isActive = item === tab;
          item.classList.toggle('is-active', isActive);
          item.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        panels.forEach((panel) => {
          const isActive = panel.dataset.deliveryPanel === target;
          panel.classList.toggle('is-active', isActive);
          panel.hidden = !isActive;
        });
      });
    });
  });
}
