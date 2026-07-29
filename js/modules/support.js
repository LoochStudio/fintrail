import { spriteHref } from './utils.js';

function initSupportTopics() {
  const form = document.querySelector('.support-form');
  if (!form) return;

  const topicValue = form.querySelector('[data-support-topic-value]');

  form.querySelectorAll('.support-form__topic').forEach(btn => {
    btn.addEventListener('click', () => {
      form.querySelectorAll('.support-form__topic').forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      if (topicValue) topicValue.value = btn.textContent.trim();
    });
  });
}

function initSupportFiles() {
  const form = document.querySelector('[data-support-form]');
  if (!form) return;

  const input = form.querySelector('[data-support-files]');
  const openButton = form.querySelector('[data-support-files-open]');
  const openButtonText = openButton?.querySelector('span');
  const list = form.querySelector('[data-support-files-list]');
  const status = form.querySelector('[data-support-files-status]');
  const maxFiles = 5;
  let selectedFiles = [];
  let previewUrls = [];

  if (!input || !openButton || !list || !status) return;

  function revokePreviewUrls() {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    previewUrls = [];
  }

  function syncInputFiles() {
    if (typeof DataTransfer === 'undefined') return;

    const transfer = new DataTransfer();
    selectedFiles.forEach(file => transfer.items.add(file));
    input.files = transfer.files;
  }

  function formatFileSize(bytes) {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} МБ`;
  }

  function renderFiles() {
    revokePreviewUrls();
    list.replaceChildren();

    selectedFiles.forEach((file, index) => {
      const item = document.createElement('li');
      item.className = 'support-form__file';

      const preview = document.createElement('span');
      preview.className = 'support-form__file-preview';
      preview.setAttribute('aria-hidden', 'true');

      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        previewUrls.push(previewUrl);

        const image = document.createElement('img');
        image.src = previewUrl;
        image.alt = '';
        preview.append(image);
        item.classList.add('support-form__file--image');
      } else {
        const extension = file.name.includes('.')
          ? file.name.split('.').pop().slice(0, 4).toUpperCase()
          : 'FILE';
        preview.classList.add('support-form__file-preview--document');
        preview.textContent = extension;
      }

      const copy = document.createElement('span');
      copy.className = 'support-form__file-copy';

      const name = document.createElement('span');
      name.className = 'support-form__file-name';
      name.textContent = file.name;

      const size = document.createElement('span');
      size.className = 'support-form__file-size';
      size.textContent = formatFileSize(file.size);

      const removeButton = document.createElement('button');
      removeButton.className = 'support-form__file-remove';
      removeButton.type = 'button';
      removeButton.dataset.supportFileRemove = String(index);
      removeButton.setAttribute('aria-label', `Удалить файл ${file.name}`);
      removeButton.innerHTML = `<svg aria-hidden="true"><use href="${spriteHref('icon-input-clear')}"></use></svg>`;

      copy.append(name, size);
      item.append(preview, copy, removeButton);
      list.append(item);
    });

    const hasFiles = selectedFiles.length > 0;
    list.hidden = !hasFiles;
    status.hidden = true;
    if (openButtonText) openButtonText.textContent = hasFiles ? 'Добавить ещё' : 'Добавить файлы';
  }

  openButton.addEventListener('click', () => input.click());

  input.addEventListener('change', () => {
    const nextFiles = Array.from(input.files || []);
    const uniqueFiles = [...selectedFiles];
    let limitExceeded = false;

    nextFiles.forEach(file => {
      const key = `${file.name}-${file.size}-${file.lastModified}`;
      const exists = uniqueFiles.some(item => (
        `${item.name}-${item.size}-${item.lastModified}` === key
      ));
      if (exists) return;
      if (uniqueFiles.length < maxFiles) {
        uniqueFiles.push(file);
      } else {
        limitExceeded = true;
      }
    });

    selectedFiles = uniqueFiles;
    syncInputFiles();
    renderFiles();

    if (limitExceeded) {
      status.textContent = `Можно прикрепить не более ${maxFiles} файлов`;
      status.hidden = false;
    }
  });

  list.addEventListener('click', event => {
    const removeButton = event.target.closest('[data-support-file-remove]');
    if (!removeButton) return;

    const index = Number(removeButton.dataset.supportFileRemove);
    if (!Number.isInteger(index)) return;

    selectedFiles.splice(index, 1);
    syncInputFiles();
    renderFiles();
    openButton.focus();
  });

  form.addEventListener('reset', () => {
    selectedFiles = [];
    window.requestAnimationFrame(() => {
      syncInputFiles();
      renderFiles();
    });
  });

  window.addEventListener('pagehide', revokePreviewUrls, { once: true });
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
  initSupportFiles();
  initSupportHistory();
}
