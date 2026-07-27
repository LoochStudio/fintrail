import { spriteHref } from './utils.js';

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} МБ`;
}

function fileKey(file) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function syncInputFiles(input, files) {
  if (typeof DataTransfer === 'undefined') return;

  const transfer = new DataTransfer();
  files.forEach(file => transfer.items.add(file));
  input.files = transfer.files;
}

function initFilePicker(root) {
  const input = root.querySelector('[data-file-picker-input]');
  const trigger = root.querySelector('[data-file-picker-trigger]');
  if (!input || root.dataset.filePickerReady) return;

  root.dataset.filePickerReady = 'true';

  const maxFiles = Number(root.dataset.fileMax) || 1;
  const maxSizeMb = Number(root.dataset.fileMaxSize) || 0;
  const maxSizeBytes = maxSizeMb > 0 ? maxSizeMb * 1024 * 1024 : 0;
  const selection = document.createElement('div');
  const list = document.createElement('ul');
  const status = document.createElement('p');
  let selectedFiles = [];

  selection.className = 'file-picker-selection';
  list.className = 'file-picker-selection__list';
  list.setAttribute('aria-label', 'Выбранные файлы');
  status.className = 'file-picker-selection__status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.hidden = true;
  selection.hidden = true;
  selection.append(list, status);
  root.insertAdjacentElement('afterend', selection);

  function render() {
    list.replaceChildren();

    selectedFiles.forEach((file, index) => {
      const item = document.createElement('li');
      item.className = 'file-picker-selection__item';

      const copy = document.createElement('span');
      copy.className = 'file-picker-selection__copy';

      const name = document.createElement('span');
      name.className = 'file-picker-selection__name';
      name.textContent = file.name;

      const size = document.createElement('span');
      size.className = 'file-picker-selection__size';
      size.textContent = formatFileSize(file.size);

      const remove = document.createElement('button');
      remove.className = 'file-picker-selection__remove';
      remove.type = 'button';
      remove.dataset.filePickerRemove = String(index);
      remove.setAttribute('aria-label', `Удалить файл ${file.name}`);
      remove.innerHTML = `<svg aria-hidden="true"><use href="${spriteHref('icon-input-clear')}"></use></svg>`;

      copy.append(name, size);
      item.append(copy, remove);
      list.append(item);
    });

    selection.hidden = selectedFiles.length === 0 && status.hidden;
    root.classList.toggle('is-filled', selectedFiles.length > 0);
  }

  function addFiles(fileList) {
    let limitExceeded = false;
    let sizeExceeded = false;
    const nextFiles = [...selectedFiles];

    Array.from(fileList || []).forEach(file => {
      if (nextFiles.some(item => fileKey(item) === fileKey(file))) return;
      if (maxSizeBytes && file.size > maxSizeBytes) {
        sizeExceeded = true;
        return;
      }
      if (nextFiles.length >= maxFiles) {
        limitExceeded = true;
        return;
      }
      nextFiles.push(file);
    });

    selectedFiles = nextFiles;
    syncInputFiles(input, selectedFiles);

    if (sizeExceeded) {
      status.textContent = `Размер одного файла не должен превышать ${maxSizeMb} МБ`;
      status.hidden = false;
    } else if (limitExceeded) {
      status.textContent = `Можно прикрепить не более ${maxFiles} файлов`;
      status.hidden = false;
    } else {
      status.hidden = true;
    }

    render();
  }

  trigger?.addEventListener('click', () => input.click());
  input.addEventListener('change', () => addFiles(input.files));

  list.addEventListener('click', event => {
    const remove = event.target.closest('[data-file-picker-remove]');
    if (!remove) return;

    const index = Number(remove.dataset.filePickerRemove);
    if (!Number.isInteger(index)) return;

    selectedFiles.splice(index, 1);
    syncInputFiles(input, selectedFiles);
    status.hidden = true;
    render();
  });

  root.addEventListener('dragover', event => {
    event.preventDefault();
    root.classList.add('is-dragover');
  });

  root.addEventListener('dragleave', event => {
    if (!root.contains(event.relatedTarget)) root.classList.remove('is-dragover');
  });

  root.addEventListener('drop', event => {
    event.preventDefault();
    root.classList.remove('is-dragover');
    addFiles(event.dataTransfer?.files);
  });

  root.closest('form')?.addEventListener('reset', () => {
    selectedFiles = [];
    window.requestAnimationFrame(() => {
      syncInputFiles(input, selectedFiles);
      status.hidden = true;
      render();
    });
  });
}

export function init() {
  document.querySelectorAll('[data-file-picker]').forEach(initFilePicker);
}
