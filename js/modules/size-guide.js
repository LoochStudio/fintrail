const SIZES = [
  {
    code: 'XS',
    name: 'Лёгкий как пёрышко',
    waist: 'Заметно уже плеч, выраженная талия',
    hips: 'Совпадает с плечами по ширине',
    maxAvg: 83,
  },
  {
    code: 'S',
    name: 'В своей тарелке',
    waist: 'Немного уже плеч, есть небольшая талия',
    hips: 'Чуть шире плеч или наравне с ними',
    maxAvg: 88,
  },
  {
    code: 'M',
    name: 'Золотая середина',
    waist: 'Умеренная ширина, примерно как у груди',
    hips: 'Наравне или чуть шире груди',
    maxAvg: 93,
  },
  {
    code: 'L',
    name: 'Всё при себе',
    waist: 'Широкая, практически совпадает с грудью',
    hips: 'Немного шире груди, пропорционально',
    maxAvg: 97,
  },
  {
    code: 'XL',
    name: 'Крупный кадр',
    waist: 'Широкая, заметная комплекция',
    hips: 'Широкие, заметно шире груди',
    maxAvg: 101,
  },
  {
    code: 'XXL',
    name: 'Большой и мощный',
    waist: 'Очень широкая, соответствует груди',
    hips: 'Полные, широкие по всей длине',
    maxAvg: 103,
  },
  {
    code: 'XLL',
    name: 'Ну чисто Зевс',
    waist: 'Может быть наравне с плечами или уже',
    hips: 'Заметно шире и больше, чем верх',
    maxAvg: Infinity,
  },
];

function getSize(height, weight) {
  const normalizedHeight = Number.isFinite(height) && height > 0 ? height : 179;
  const normalizedWeight = Number.isFinite(weight) && weight > 0 ? weight : 103;
  const heightDelta = Math.max(0, normalizedHeight - 180) * 0.15;
  const metric = normalizedWeight + heightDelta;

  return SIZES.find(size => metric < size.maxAvg) ?? SIZES[SIZES.length - 1];
}

function getNumericValue(input) {
  const value = Number(String(input?.value || '').replace(/\D/g, ''));
  return Number.isFinite(value) ? value : 0;
}

function syncInputState(input) {
  input?.classList.toggle('has-value', String(input.value || '').trim() !== '');
}

function updateResult(inputs, sizeEl, nameEl, waistEl, hipsEl) {
  const height = getNumericValue(inputs.height);
  const weight = getNumericValue(inputs.weight);
  const size = getSize(height, weight);

  sizeEl.textContent = size.code;
  nameEl.textContent = size.name;
  waistEl.textContent = size.waist;
  hipsEl.textContent = size.hips;
}

export function init() {
  const workspace = document.querySelector('.size-guide__workspace');
  if (!workspace) return;

  const inputs = {
    height: workspace.querySelector('[data-sg="height"]'),
    weight: workspace.querySelector('[data-sg="weight"]'),
  };

  const sizeEl = workspace.querySelector('[data-sg-size]');
  const nameEl = workspace.querySelector('[data-sg-name]');
  const waistEl = workspace.querySelector('[data-sg-waist]');
  const hipsEl = workspace.querySelector('[data-sg-hips]');

  if (!sizeEl || !nameEl || !waistEl || !hipsEl) return;

  Object.values(inputs).filter(Boolean).forEach(input => {
    syncInputState(input);

    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '');
      syncInputState(input);
      updateResult(inputs, sizeEl, nameEl, waistEl, hipsEl);
    });
  });

  workspace.querySelectorAll('.size-guide__input-clear').forEach(button => {
    button.addEventListener('click', () => {
      const input = button.closest('[data-size-guide-field]')?.querySelector('.size-guide__input');
      if (!input) return;

      input.value = '';
      syncInputState(input);
      updateResult(inputs, sizeEl, nameEl, waistEl, hipsEl);
      input.focus();
    });
  });

  updateResult(inputs, sizeEl, nameEl, waistEl, hipsEl);

  workspace.closest('.size-guide')?.querySelectorAll('.size-guide__gender-tab').forEach(btn => {
    btn.setAttribute('aria-selected', btn.classList.contains('is-active') ? 'true' : 'false');

    btn.addEventListener('click', () => {
      btn.closest('.size-guide__gender-tabs')?.querySelectorAll('.size-guide__gender-tab').forEach(item => {
        const isActive = item === btn;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    });
  });

  workspace.closest('.size-guide')?.querySelectorAll('.size-guide__type-btn').forEach(btn => {
    btn.setAttribute('aria-pressed', btn.classList.contains('is-active') ? 'true' : 'false');

    btn.addEventListener('click', () => {
      btn.closest('.size-guide__type-filter')?.querySelectorAll('.size-guide__type-btn').forEach(item => {
        const isActive = item === btn;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    });
  });
}
