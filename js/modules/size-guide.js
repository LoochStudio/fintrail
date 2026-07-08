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

function getSize(chest, waist, hips) {
  const avg = (chest + waist + hips) / 3;
  return SIZES.find(s => avg < s.maxAvg) ?? SIZES[SIZES.length - 1];
}

function updateProgress(input) {
  const min = Number(input.min);
  const max = Number(input.max);
  const val = Number(input.value);
  const pct = ((val - min) / (max - min)) * 100;
  input.style.setProperty('--sg-progress', pct + '%');
}

function updateResult(sliders, sizeEl, nameEl, waistEl, hipsEl) {
  const vals = {};
  sliders.forEach(({ input, key }) => { vals[key] = Number(input.value); });

  const size = getSize(vals.chest, vals.waist, vals.hips);

  sizeEl.textContent = size.code;
  nameEl.textContent = size.name;
  waistEl.textContent = size.waist;
  hipsEl.textContent = size.hips;
}

export function init() {
  const workspace = document.querySelector('.size-guide__workspace');
  if (!workspace) return;

  const sliders = [
    { input: workspace.querySelector('[data-sg="height"]'), key: 'height', label: workspace.querySelector('[data-sg-val="height"]') },
    { input: workspace.querySelector('[data-sg="arm"]'),    key: 'arm',    label: workspace.querySelector('[data-sg-val="arm"]') },
    { input: workspace.querySelector('[data-sg="chest"]'),  key: 'chest',  label: workspace.querySelector('[data-sg-val="chest"]') },
    { input: workspace.querySelector('[data-sg="waist"]'),  key: 'waist',  label: workspace.querySelector('[data-sg-val="waist"]') },
    { input: workspace.querySelector('[data-sg="hips"]'),   key: 'hips',   label: workspace.querySelector('[data-sg-val="hips"]') },
  ].filter(s => s.input);

  const sizeEl  = workspace.querySelector('[data-sg-size]');
  const nameEl  = workspace.querySelector('[data-sg-name]');
  const waistEl = workspace.querySelector('[data-sg-waist]');
  const hipsEl  = workspace.querySelector('[data-sg-hips]');

  if (!sizeEl || !nameEl || !waistEl || !hipsEl) return;

  // Init progress fills
  sliders.forEach(({ input }) => updateProgress(input));

  // Init result
  updateResult(sliders, sizeEl, nameEl, waistEl, hipsEl);

  // Listen
  sliders.forEach(({ input, label }) => {
    input.addEventListener('input', () => {
      updateProgress(input);
      if (label) label.textContent = input.value;
      updateResult(sliders, sizeEl, nameEl, waistEl, hipsEl);
    });
  });


  const measureTabs = [...workspace.querySelectorAll('.size-guide__measure-tab')];
  const measurePanels = [...workspace.querySelectorAll('.size-guide__slider-item[data-sg-measure]')];

  function setActiveMeasure(key) {
    measureTabs.forEach(tab => {
      const isActive = tab.dataset.sgMeasureTab === key;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    measurePanels.forEach(panel => {
      const isActive = panel.dataset.sgMeasure === key;
      panel.classList.toggle('is-measure-active', isActive);
    });
  }

  if (measureTabs.length && measurePanels.length) {
    const initial = measureTabs.find(tab => tab.classList.contains('is-active'))?.dataset.sgMeasureTab || measureTabs[0].dataset.sgMeasureTab;
    setActiveMeasure(initial);

    measureTabs.forEach(tab => {
      tab.addEventListener('click', () => setActiveMeasure(tab.dataset.sgMeasureTab));
    });
  }
  // Gender + type tabs
  workspace.closest('.size-guide')?.querySelectorAll('.size-guide__gender-tab').forEach(btn => {
    btn.setAttribute('aria-selected', btn.classList.contains('is-active') ? 'true' : 'false');

    btn.addEventListener('click', () => {
      btn.closest('.size-guide__gender-tabs')?.querySelectorAll('.size-guide__gender-tab').forEach(b => {
        const isActive = b === btn;
        b.classList.toggle('is-active', isActive);
        b.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    });
  });

  workspace.closest('.size-guide')?.querySelectorAll('.size-guide__type-btn').forEach(btn => {
    btn.setAttribute('aria-pressed', btn.classList.contains('is-active') ? 'true' : 'false');

    btn.addEventListener('click', () => {
      btn.closest('.size-guide__type-filter')?.querySelectorAll('.size-guide__type-btn').forEach(b => {
        const isActive = b === btn;
        b.classList.toggle('is-active', isActive);
        b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    });
  });
}

