# FINNTRAIL — Редизайн и адаптивная вёрстка

Адаптивная вёрстка интернет-магазина [finntrail.ru](https://finntrail.ru), подготовленная для интеграции в 1С-Битрикс. Выполнена по ТЗ веб-команды FINNTRAIL от 9 апреля 2026 года.

---

## Технологический стек

| Технология | Версия | Назначение |
|---|---|---|
| HTML5 | — | Семантическая разметка |
| SCSS (Sass) | — | Стили, разбиты по компонентам |
| JavaScript | ES6+ | Нативный JS, без фреймворков |
| Vite | 6.x | Сборщик, dev-сервер |
| Node.js | 20.x | Среда выполнения |

Фреймворки (Bootstrap, React, Vue, Angular) — **не используются**.

---

## Структура проекта

```
finntrail/
├── index.html                        # Главная страница
├── catalog/
│   ├── index.html                    # Страница каталога (листинг)
│   └── master-hood-1510/
│       └── index.html                # Страница детального товара
├── preview.html                      # Превью для разработки
│
├── scss/
│   ├── main.scss                     # Точка входа — подключает все компоненты
│   ├── _variables.scss               # Переменные: цвета, шрифты, отступы, брейкпоинты
│   ├── _reset.scss                   # Сброс стилей
│   ├── _fonts.scss                   # Подключение шрифтов
│   └── components/
│       ├── _hero.scss                # Hero-секция с слайдером
│       ├── _navbar.scss              # Мобильный навбар
│       ├── _activity-picker.scss     # Секция «Выберите активность»
│       ├── _build-kit-desktop.scss   # Секция «Собрать комплект»
│       ├── _recommendations-new.scss # Карусель рекомендаций
│       ├── _gift-cards-showcase.scss # Секция подарочных карт
│       ├── _journal-showcase.scss    # Секция «Журнал»
│       ├── _community-showcase.scss  # Секция «Коммьюнити»
│       ├── _store-showcase.scss      # Секция «Магазины»
│       ├── _catalog.scss             # Страница каталога
│       ├── _product.scss             # Страница детального товара
│       ├── _buttons.scss             # Кнопки
│       ├── _states.scss              # Общие состояния
│       ├── _motion.scss              # Анимации
│       ├── _footer.scss              # Мобильный футер
│       ├── _footer-desktop.scss      # Десктопный футер
│       ├── _tabbar.scss              # Мобильный таббар
│       └── _login-bonus.scss         # Форма регистрации за бонусы
│
├── js/
│   └── main.js                       # Вся интерактивность, единая точка входа
│
├── images/
│   ├── icons/sprite.svg              # SVG-спрайт всех иконок
│   ├── logo.svg
│   └── content/                      # Контентные изображения (hero, catalog, product и т.д.)
│
├── public/
│   └── images/                       # Статические ассеты — копируются в dist/ as-is
│       ├── content/
│       │   ├── activity/             # Секция «Выберите активность»
│       │   └── journal/              # Сторисы журнала
│       └── icons/sprite.svg
│
├── vite.config.js
├── package.json
└── .github/workflows/deploy-pages.yml
```

---

## Установка и запуск

```bash
# Установить зависимости
npm install

# Запустить dev-сервер → http://localhost:5173
npm run dev

# Production-сборка → папка dist/
npm run build

# Предварительный просмотр production-сборки
npm run preview
```

---

## Страницы

| Путь | Файл | Описание |
|---|---|---|
| `/` | `index.html` | Главная страница |
| `/catalog/` | `catalog/index.html` | Каталог товаров |
| `/catalog/master-hood-1510/` | `catalog/master-hood-1510/index.html` | Детальная страница товара |

---

## Брейкпоинты

| Диапазон | Тип |
|---|---|
| 320–767 px | Мобильный |
| 768–1279 px | Планшет |
| 1280 px+ | Десктоп |

---

## Интеграция в 1С-Битрикс

### Подключение стилей и скриптов

В `<head>` каждой страницы заменить:

```html
<!-- Вёрстка (dev): -->
<link rel="stylesheet" href="/scss/main.scss">

<!-- После интеграции в Bitrix: -->
<link rel="stylesheet" href="<?= SITE_TEMPLATE_PATH ?>/css/style.css">
<script src="<?= SITE_TEMPLATE_PATH ?>/js/main.js" defer></script>
```

### Ключевые Битрикс-компоненты

В HTML расставлены комментарии `<!-- BITRIX: ... -->` для каждой зоны интеграции.

| Зона | Компонент |
|---|---|
| Сетка товаров каталога | `bitrix:catalog.section` |
| AJAX-фильтр | `bitrix:catalog.smart.filter` |
| Корзина | `bitrix:sale.basket.basket` |
| Личный кабинет | `bitrix:main.profile` |
| Журнал / список статей | `bitrix:news.list` |
| Авторизация и регистрация | `bitrix:main.register` |

### Адаптивные изображения (srcset)

Все `<img>` имеют атрибуты `srcset` и `sizes`. Текущее значение `srcset="... 1x"` — заглушка. При интеграции заменить на реальные размеры из CMS:

```html
<!-- Текущая заглушка: -->
<img src="/images/photo.png" srcset="/images/photo.png 1x" sizes="...">

<!-- После интеграции (пример): -->
<img src="/upload/photo.webp"
     srcset="/upload/photo_320.webp 320w, /upload/photo_640.webp 640w, /upload/photo_1280.webp 1280w"
     sizes="(max-width: 767px) 100vw, 360px">
```

### SVG-спрайт

Иконки подключаются через `<use href="/images/icons/sprite.svg#symbol-id">`. При интеграции путь к спрайту привязать к шаблону Bitrix:

```html
<use href="<?= SITE_TEMPLATE_PATH ?>/images/icons/sprite.svg#icon-name">
```

### Путь к ассетам в JS

В `main.js` реализована функция `resolvePublicAsset(src)`, которая автоматически адаптирует пути изображений под `BASE_URL` из `vite.config.js`. При интеграции в Bitrix без Vite — убрать эту функцию и использовать пути относительно `SITE_TEMPLATE_PATH`.

---

## Сторонние библиотеки и лицензии

| Материал | Источник | Лицензия |
|---|---|---|
| Source Code Pro | Google Fonts | SIL Open Font License 1.1 |
| Nata Sans | Корпоративный шрифт FINNTRAIL | Предоставлен заказчиком |
| JavaScript | Нативный ES6+, без сторонних библиотек | — |
| CSS | Чистый SCSS, без фреймворков | — |

---

## Лицензия

Все материалы (дизайн, вёрстка, код) переданы заказчику — FINNTRAIL — на исключительных правах согласно договору подряда. Несанкционированное использование третьими лицами запрещено.
