import { resolvePublicAsset } from './utils.js';

export function init() {
  // ─── Activity picker ──────────────────────────────────────────────────────
  document.querySelectorAll('.activity-picker').forEach(section => {
    const links = section.querySelectorAll('[data-activity-link]');
    const preview = section.querySelector('.activity-picker__preview-img');
    const image = section.querySelector('.activity-picker__image-img');
    const cta = section.querySelector('.activity-picker__cta');
    const productCards = Array.from(section.querySelectorAll('.activity-product-card'));

    if (!links.length) return;

    function setImage(img, src) {
      if (!img || !src) return;
      const resolvedSrc = resolvePublicAsset(src);
      img.classList.remove('is-changing');
      void img.offsetWidth;
      img.classList.add('is-changing');
      img.srcset = '';
      img.src = resolvedSrc;
    }

    function setProduct(card, link, index) {
      if (!card || !link) return;

      // data-product-1-name → dataset["product-1Name"] (дефис перед цифрой остаётся по HTML spec)
      const name     = link.dataset[`product-${index}Name`];
      const price    = link.dataset[`product-${index}Price`];
      const discount = link.dataset[`product-${index}Discount`];
      const imageSrc = link.dataset[`product-${index}Image`];
      const url      = link.dataset[`product-${index}Url`];
      const img = card.querySelector('img');
      const nameNode = card.querySelector('.activity-product-card__name');
      const priceNode = card.querySelector('.activity-product-card__price');
      let discountNode = card.querySelector('.activity-product-card__discount');

      card.classList.remove('is-changing');
      void card.offsetWidth;
      card.classList.add('is-changing');

      if (url) card.href = url;
      if (name && nameNode) nameNode.textContent = name;
      if (price && priceNode) priceNode.textContent = price;
      if (discount) {
        if (!discountNode) {
          discountNode = document.createElement('span');
          discountNode.className = 'activity-product-card__discount';
          card.insertBefore(discountNode, card.firstChild);
        }
        discountNode.textContent = discount;
        discountNode.hidden = false;
      } else if (discountNode) {
        discountNode.hidden = true;
      }
      if (img && imageSrc) {
        const resolvedImageSrc = resolvePublicAsset(imageSrc);
        img.srcset = '';
        img.src = resolvedImageSrc;
        img.alt = name || '';
      }
    }

    function activate(link) {
      links.forEach(item => {
        const isActive = item === link;
        item.classList.toggle('is-active', isActive);
        if (isActive) {
          item.setAttribute('aria-current', 'true');
        } else {
          item.removeAttribute('aria-current');
        }
      });

      setImage(preview, link.dataset.preview);
      setImage(image, link.dataset.image);
      if (image) {
        image.style.setProperty('--activity-image-position', link.dataset.imagePosition || 'center center');
        image.style.setProperty('--activity-image-scale', link.dataset.imageScale || '1');
      }
      productCards.forEach((card, index) => setProduct(card, link, index + 1));

      if (cta) cta.href = link.getAttribute('href') || cta.href;
    }

    links.forEach(link => {
      link.addEventListener('mouseenter', () => activate(link));
      link.addEventListener('focus', () => activate(link));
      link.addEventListener('click', event => {
        event.preventDefault();
        activate(link);
      });
    });

    activate(section.querySelector('[data-activity-link].is-active') || links[0]);
  });
}
