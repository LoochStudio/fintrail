const SIZE_RANGES = [
  { maxWeight: 64, code: 'XS' },
  { maxWeight: 74, code: 'S' },
  { maxWeight: 89, code: 'M' },
  { maxWeight: 105, code: 'L' },
  { maxWeight: 118, code: 'XL' },
  { maxWeight: Infinity, code: 'XXL' },
];

const headers = (...labels) => labels.map(label => label.replace(' / ', '<br>'));
const rows = value => value.split(';').map(row => row.split('|'));

const TABLES = {
  waders: {
    title: 'Вейдерсы',
    headers: {
      default: headers('Размеры / (INT)', 'Россия / (RUS)', 'Рост / (см)', 'Обхват бедер / талии (см)', 'Размер сапог / (EUR, RUS)', 'Размер сапог / (см)'),
      kids: headers('Размеры / (INT)', 'Россия / (RUS)', 'Рост / (см)', 'Обхват груди / (см)', 'Обхват талии / (см)', 'Обхват бедер / (см)', 'Размер сапог / (см)', 'Длина стопы / (см)'),
    },
    rows: {
      men: rows('XXS|40–42|158–162|84–88|—|—;XS|42–44|163–167|89–93|—|—;S|44–46|168–172|94–100|8 (41) / 9 (42)|27,7 / 28,6;SK|50–52|168–172|106–111|8 (41) / 9 (42)|27,7 / 28,6;M|48–50|173–177|101–105|9 (42) / 10 (43) / 11 (44)|28,6 / 29,4 / 30,2;ML|48–50|183–187|101–105|11 (44)|30,2;MK|54–56|173–177|112–120|9 (42) / 10 (43)|28,6 / 29,4;L|50–52|178–182|106–111|10 (43) / 11 (44) / 12 (45)|29,4 / 30,2 / 31,1;LL|50–52|188–192|106–111|12 (45)|31,1;LK|58–60|178–182|121–127|11 (44)|30,2;XL|54–56|178–182|112–120|11 (44) / 12 (45) / 13 (46)|30,2 / 31,1 / 31,9;XLL|54–56|198–202|112–120|—|—;XLK|62–64|183–187|128–136|13 (46)|31,9;XXL|58–60|188–192|121–127|12 (45) / 13 (46)|31,1 / 31,9;XXLK|66–68|188–192|135–143|—|—;XXXL|62–64|193–197|128–136|14 (47)|32,8'),
      women: rows('XXS|40–42|150–160|86–92|—|—;XS|42–44|155–165|90–96|5 (38)|24,7;S|44–46|160–170|94–100|5 (38)|24,7;SQ|48–50|160–170|102–108|5 (38)|24,7;M|46–48|165–175|98–104|6 (39)|25,6;MQ|50–52|165–175|106–112|6 (39)|25,6;L|48–50|170–180|102–108|6 (39)|25,6;XL|50–52|170–180|106–112|7 (40)|26,5;XXL|52–54|170–180|110–116|7 (40)|26,5'),
      kids: rows('134–140|134–140|134–140|68–72|63–66|76–79|37|23,5;146–152|146–152|146–152|76–80|66–69|82–85|39|25,2'),
    },
  },
  apparel: {
    title: 'Куртки, костюмы и термобельё',
    headers: {
      default: headers('Размеры / (INT)', 'Россия / (RUS)', 'Рост / (см)', 'Обхват груди / (см)', 'Обхват талии / (см)'),
      women: headers('Размеры / (INT)', 'Россия / (RUS)', 'Рост / (см)', 'Обхват груди / (см)', 'Обхват талии / (см)', 'Обхват бедер / (см)'),
      kids: headers('Размеры / (INT)', 'Россия / (RUS)', 'Рост / (см)', 'Обхват груди / (см)', 'Обхват талии / (см)', 'Обхват бедер / (см)'),
    },
    rows: {
      men: rows('XXS|40–42|158–162|81–84|71–74;XS|42–44|163–167|85–89|75–80;S|44–46|168–172|91–96|81–86;SK|50–52|168–172|103–108|93–98;M|48–50|173–177|97–102|87–92;ML|48–50|183–187|97–102|87–92;MK|54–56|173–177|109,5–116,5|99,5–106,5;L|50–52|178–182|103–108|93–98;LK|58–60|178–182|117,5–124,5|107,5–114,5;XL|54–56|178–182|109,5–116,5|99,5–106,5;XLK|62–64|183–187|125,5–131,5|115,5–122,5;XXL|58–60|188–192|117,5–124,5|107,5–114,5;XXXL|62–64|193–197|125,5–131,5|115,5–122,5'),
      women: rows('XXS|40–42|153–157|81–84|61–64|87–90;XS|42–44|158–162|85–88|65–68|91–94;S|44–46|163–167|89–92|69–72|95–98;SQ|48–50|163–167|97–100|77–80|103–106;M|46–48|168–172|93–96|73–76|99–102;MQ|50–52|168–172|101–104|81–84|107–110;L|48–50|173–177|97–100|77–80|103–106;XL|50–52|173–177|101–104|81–84|107–110;XXL|52–54|178–182|105–109|85–89|111–115'),
      kids: rows('134–140|134–140|134–140|68–72|63–66|76–79;146–152|146–152|146–152|76–80|66–69|82–85;158–164|158–164|158–164|84–88|69–72|88–91'),
    },
  },
  snowmobile: {
    title: 'Снегоходная экипировка',
    headers: {
      default: headers('Размеры / (INT)', 'Россия / (RUS)', 'Европа / (EUR)', 'Рост / (см)', 'Обхват груди / (см)', 'Обхват талии / (см)', 'Обхват бедер / (см)'),
      women: headers('Размеры / (INT)', 'Россия / (RUS)', 'Европа / (EUR)', 'Рост / (см)', 'Обхват груди / (см)', 'Обхват талии / (см)', 'Обхват бедер / (см)', 'Внутренняя длина ноги / (см)', 'Длина руки / (см)'),
      kids: headers('Размеры / (INT)', 'Россия / (RUS)', 'Рост / (см)', 'Обхват груди / (см)', 'Обхват талии / (см)', 'Обхват бедер / (см)'),
    },
    rows: {
      men: rows('XS|40–42|36–38|160–170|89–94|74–90|86–96;S|44–46|38–40|165–175|88–100|78–96|90–102;SK|50–52|44–46|165–175|100–112|90–108|102–114;M|48–50|42–44|170–180|96–106|86–102|98–108;ML|48–50|42–44|180–190|96–106|86–102|98–108;MK|54–56|48–50|170–180|108–120|98–116|110–122;L|50–52|44–46|175–185|100–112|90–108|102–114;LK|58–60|52–54|175–185|116–128|106–124|118–130;XL|54–56|48–50|180–190|108–120|98–116|110–122;XLK|62–64|56–58|180–190|124–136|114–132|126–138;XXL|58–60|52–54|185–195|116–128|106–124|118–130;XXXL|≥ 62|≥ 56|190–200|124–136|114–132|126–138'),
      women: rows('XS|40–42|36–38|160–170|89–94|74–90|86–96|71–77|69–74;S|44–46|38–40|165–175|88–100|78–96|90–102|74–80|72–77;SK|50–52|44–46|165–175|100–112|90–108|102–114|74–80|72–77;M|48–50|42–44|170–180|96–106|86–102|98–108|77–83|74–79;ML|48–50|42–44|180–190|96–106|86–102|98–108|83–89|80–83;MK|54–56|48–50|170–180|108–120|98–116|110–122|77–83|74–79;L|50–52|44–46|175–185|100–112|90–108|102–114|80–86|77–81;LK|58–60|52–54|175–185|116–128|106–124|118–130|80–86|77–81;XL|54–56|48–50|180–190|108–120|98–116|110–122|83–89|80–83;XLK|62–64|56–58|180–190|124–136|114–132|126–138|83–89|80–83;XXL|58–60|52–54|185–195|116–128|106–124|118–130|86–92|81–85;XXXL|≥ 62|≥ 56|190–200|124–136|114–132|126–138|89–95|83–88'),
      kids: rows('134–140|134–140|134–140|91|87|90;146–152|146–152|146–152|99|95|98'),
    },
  },
  footwear: {
    title: 'Обувь',
    headers: { default: headers('США / (USA)', 'Европа / (EUR)', 'Россия / (RUS)', 'Длина стопы / (см)'), women: headers('Россия / (RUS)', 'Канада, США / (USA)', 'Длина стопы / (см)') },
    rows: {
      men: rows('5|38|37|23;6|39|38|24;7|40|39|25;8|41|40|26;9|42|41|27;10|43|42|28;11|44|43|29;12|45|44|30;13|46|45|31'),
      women: rows('37|7|23;38|8|24;39|9|25;40|10|26;41|11|27;42|12|28'),
    },
  },
  gloves: {
    title: 'Перчатки',
    headers: { default: headers('Размер / (INT)', 'Обхват ладони без большого пальца / (см)') },
    rows: { men: rows('S|19–20;M|21–22;L|23–24;XL|25–26'), women: rows('S|19–20;M|21–22;L|23–24;XL|25–26') },
  },
  headwear: {
    title: 'Головные уборы',
    headers: { default: headers('Размер / (INT)', 'Обхват головы / (см)') },
    rows: { men: rows('M–L|56–58;XL–2XL|60–62'), women: rows('M–L|56–58;XL–2XL|60–62') },
  },
};

const apparelTable = TABLES.apparel;
TABLES.jackets = { ...apparelTable, title: 'Куртки' };
TABLES.suits = { ...apparelTable, title: 'Костюмы' };
TABLES.thermal = { ...apparelTable, title: 'Термобельё' };
delete TABLES.apparel;

const TYPES_BY_GENDER = {
  men: ['waders', 'jackets', 'suits', 'thermal', 'snowmobile', 'footwear', 'gloves', 'headwear'],
  women: ['waders', 'jackets', 'suits', 'thermal', 'snowmobile', 'footwear', 'gloves', 'headwear'],
  kids: ['waders', 'jackets', 'suits', 'thermal', 'snowmobile'],
};
const MEASUREMENT_IMAGES = {
  men: [sizesMan, sizesManHand, sizesManFoot],
  women: [sizesWoman, sizesWomanHand, sizesWomanFoot],
  kids: [sizesKids, sizesKidsHand, sizesKidsFoot],
};

function numericValue(input) { return Number(String(input?.value || '').replace(/\D/g, '')) || 0; }
function syncInput(input) { input?.classList.toggle('has-value', Boolean(input.value.trim())); }

function calculateSize(height, weight, gender) {
  if (height < 120 || height > 215 || weight < 25 || weight > 180) return null;
  if (gender === 'kids') {
    if (height <= 145) return { code: '134–140' };
    if (height <= 157) return { code: '146–152' };
    return { code: '158–164' };
  }
  const adjustedWeight = weight + Math.max(-8, Math.min(8, (height - 179) * 0.22)) + (gender === 'women' ? -8 : 0);
  return SIZE_RANGES.find(item => adjustedWeight <= item.maxWeight) || null;
}

function recommendationFor(root, height, weight) {
  const type = root.dataset.sizeType || 'all';
  const gender = root.dataset.sizeGender || 'men';
  if (!height || !weight) return null;
  if (type === 'footwear') return { code: gender === 'women' ? '9' : '9 (42)' };
  if (type === 'gloves') return { code: 'L' };
  if (type === 'headwear') return { code: 'M–L' };
  return calculateSize(height, weight, gender);
}

function updateResult(root) {
  const result = root.querySelector('.size-guide__result-pill');
  const size = root.querySelector('[data-sg-size]');
  const probability = root.querySelector('[data-sg-probability]');
  const match = recommendationFor(root, numericValue(root.querySelector('[data-sg="height"]')), numericValue(root.querySelector('[data-sg="weight"]')));
  if (!result || !size || !probability) return;
  result.classList.toggle('is-empty', !match);
  size.textContent = match?.code || '';
  probability.textContent = match ? '100%' : '';
}

function activateButton(button, selector) {
  button?.parentElement?.querySelectorAll(selector).forEach(item => {
    const active = item === button;
    item.classList.toggle('is-active', active);
    if (item.hasAttribute('role')) item.setAttribute('aria-selected', String(active));
    if (selector === '.size-guide__type-btn') item.setAttribute('aria-pressed', String(active));
  });
}

function tableMarkup(type, gender) {
  const config = TABLES[type];
  const tableHeaders = config.headers[gender] || config.headers.default;
  const tableRows = config.rows[gender] || [];
  const minWidth = tableHeaders.length <= 4 ? 560 : Math.max(760, tableHeaders.length * 150);
  return `<section class="size-guide__table-section" aria-labelledby="size-guide-${type}-title">
    <div class="size-guide__table-heading">
      <h2 id="size-guide-${type}-title">${config.title}</h2>
      <button type="button" data-size-guide-measure-link>Как измерять?</button>
    </div>
    <div class="size-guide__table-scroll" tabindex="0" aria-label="Таблица размеров. Проведите в сторону для просмотра всех столбцов">
      <table class="size-guide__table" style="--size-table-min-width:${minWidth}px">
        <thead><tr>${tableHeaders.map(header => `<th scope="col">${header}</th>`).join('')}</tr></thead>
        <tbody>${tableRows.map(row => `<tr>${row.map((cell, index) => index === 0 ? `<th scope="row">${cell}</th>` : `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    </div>
  </section>`;
}

function renderTables(root) {
  const gender = root.dataset.sizeGender || 'men';
  const selected = root.dataset.sizeType || 'all';
  const types = selected === 'all' ? TYPES_BY_GENDER[gender] : [selected];
  const container = root.querySelector('[data-size-tables]');
  if (!container) return;
  container.innerHTML = types.filter(type => TABLES[type]?.rows[gender]).map(type => tableMarkup(type, gender)).join('');
  container.querySelectorAll('.size-guide__table-scroll').forEach(enablePointerScroll);
}

function syncGenderContent(root) {
  const gender = root.dataset.sizeGender || 'men';
  const supported = TYPES_BY_GENDER[gender];
  root.querySelectorAll('.size-guide__type-btn').forEach(button => {
    const type = button.dataset.sizeType;
    button.hidden = button.dataset.sizeType !== 'all' && !supported.includes(type);
  });
  const selected = root.dataset.sizeType;
  if (root.dataset.sizeType !== 'all' && !supported.includes(selected)) {
    root.dataset.sizeType = 'all';
    activateButton(root.querySelector('[data-size-type="all"]'), '.size-guide__type-btn');
  }
  const [person, hand, foot] = MEASUREMENT_IMAGES[gender];
  root.querySelector('[data-size-measurement-person]')?.setAttribute('src', person);
  root.querySelector('[data-size-measurement-hand]')?.setAttribute('src', hand);
  root.querySelector('[data-size-measurement-foot]')?.setAttribute('src', foot);
}

function enablePointerScroll(element) {
  if (!element || element.dataset.pointerScroll === 'ready') return;
  element.dataset.pointerScroll = 'ready';
  let startX = 0;
  let startScroll = 0;
  let pointerId = null;
  let dragging = false;
  let suppressClick = false;
  element.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch' || event.button !== 0) return;
    startX = event.clientX; startScroll = element.scrollLeft; pointerId = event.pointerId; dragging = false;
  });
  element.addEventListener('pointermove', event => {
    if (pointerId !== event.pointerId) return;
    const distance = event.clientX - startX;
    if (!dragging && Math.abs(distance) < 6) return;
    if (!dragging) { dragging = true; suppressClick = true; element.setPointerCapture(event.pointerId); element.classList.add('is-dragging'); }
    event.preventDefault(); element.scrollLeft = startScroll - distance;
  });
  const stop = event => {
    if (pointerId !== event.pointerId) return;
    if (dragging && element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
    pointerId = null; dragging = false; element.classList.remove('is-dragging');
  };
  element.addEventListener('pointerup', stop);
  element.addEventListener('pointercancel', stop);
  element.addEventListener('click', event => {
    if (!suppressClick) return;
    event.preventDefault(); event.stopPropagation(); suppressClick = false;
  }, true);
}

export function init() {
  const root = document.querySelector('.size-guide');
  if (!root) return;
  root.dataset.sizeGender = 'men';
  root.dataset.sizeType = 'all';

  root.querySelectorAll('.size-guide__input').forEach(input => {
    syncInput(input);
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(0, 3);
      syncInput(input); updateResult(root);
    });
  });
  root.querySelectorAll('.size-guide__input-clear').forEach(button => {
    button.addEventListener('click', () => {
      const input = button.closest('[data-size-guide-field]')?.querySelector('.size-guide__input');
      if (!input) return;
      input.value = ''; syncInput(input); updateResult(root); input.focus();
    });
  });
  root.querySelectorAll('.size-guide__gender-tab').forEach(button => {
    button.addEventListener('click', () => {
      activateButton(button, '.size-guide__gender-tab');
      root.dataset.sizeGender = button.dataset.sizeGender || 'men';
      syncGenderContent(root); renderTables(root); updateResult(root);
    });
  });
  root.querySelectorAll('.size-guide__type-btn').forEach(button => {
    button.setAttribute('aria-pressed', String(button.classList.contains('is-active')));
    button.addEventListener('click', () => {
      activateButton(button, '.size-guide__type-btn');
      root.dataset.sizeType = button.dataset.sizeType || 'all';
      renderTables(root); updateResult(root);
    });
  });
  enablePointerScroll(root.querySelector('.size-guide__type-filter'));
  syncGenderContent(root); renderTables(root); updateResult(root);
}
import sizesMan from '../../images/content/size-guide/sizes-man.png';
import sizesManHand from '../../images/content/size-guide/sizes-man-hand.png';
import sizesManFoot from '../../images/content/size-guide/sizes-man-foot.png';
import sizesWoman from '../../images/content/size-guide/sizes-woman.png';
import sizesWomanHand from '../../images/content/size-guide/sizes-woman-hand.png';
import sizesWomanFoot from '../../images/content/size-guide/sizes-woman-foot.png';
import sizesKids from '../../images/content/size-guide/sizes-kids.png';
import sizesKidsHand from '../../images/content/size-guide/sizes-kids-hand.png';
import sizesKidsFoot from '../../images/content/size-guide/sizes-kids-foot.png';
