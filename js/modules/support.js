function initSupportTopics() {
  const form = document.querySelector('.support-form');
  if (!form) return;

  form.querySelectorAll('.support-form__topic').forEach(btn => {
    btn.addEventListener('click', () => {
      form.querySelectorAll('.support-form__topic').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });
}

function initSupportHistory() {
  document.querySelectorAll('.support-history__item').forEach(item => {
    const toggle = item.querySelector('.support-history__toggle');
    const panel = item.querySelector('.support-history__panel');
    if (!toggle || !panel) return;

    toggle.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      item.classList.toggle('is-open', !isOpen);
      toggle.setAttribute('aria-expanded', String(!isOpen));
      panel.hidden = isOpen;
    });
  });
}

export function init() {
  initSupportTopics();
  initSupportHistory();
}
