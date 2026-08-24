// TOC smooth scroll + active highlight
(function () {
  const toc = document.querySelector('[data-article-toc]');
  if (!toc) return;

  const links = Array.from(toc.querySelectorAll('[data-toc-link]'));
  if (!links.length) return;

  const sections = links
    .map((link) => {
      const href = link.getAttribute('href');
      return href ? document.querySelector(href) : null;
    })
    .filter(Boolean);

  if (!sections.length) return;

  const getHeaderOffset = () => {
    const header = document.querySelector('.hero-header, .site-header, header');
    const headerHeight = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
    return Math.max(headerHeight + 24, 96);
  };

  function setActive(activeLink) {
    links.forEach((link) => {
      const isActive = link === activeLink;
      link.closest('.article-toc__item')?.classList.toggle('article-toc__item--active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      const target = href ? document.querySelector(href) : null;
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
      window.scrollTo({ top, behavior: 'smooth' });
      setActive(link);

      if (history.pushState) {
        history.pushState(null, '', href);
      }
    });
  });

  let ticking = false;

  function updateActive() {
    const offset = getHeaderOffset() + 8;
    const currentY = window.scrollY + offset;
    let activeIndex = 0;

    sections.forEach((section, index) => {
      if (section.offsetTop <= currentY) {
        activeIndex = index;
      }
    });

    setActive(links[activeIndex]);
    ticking = false;
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateActive);
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  updateActive();
})();
// TOC accordion (mobile)
(function () {
  const toggle = document.querySelector('[data-toc-toggle]');
  if (!toggle) return;
  const toc = toggle.closest('[data-article-toc]');
  toggle.addEventListener('click', () => {
    const isOpen = toc.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
})();

// Horizontal comparison tables: mouse drag without a visible scrollbar.
(function () {
  const tables = document.querySelectorAll('[data-drag-scroll]');

  tables.forEach((table) => {
    let startX = 0;
    let startScrollLeft = 0;
    let dragged = false;

    const updateState = () => {
      table.classList.toggle('is-scrollable', table.scrollWidth > table.clientWidth + 1);
    };

    table.scrollLeft = 0;
    updateState();

    table.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0 || !table.classList.contains('is-scrollable')) return;

      startX = event.clientX;
      startScrollLeft = table.scrollLeft;
      dragged = false;
      table.classList.add('is-dragging');
      table.setPointerCapture(event.pointerId);
    });

    table.addEventListener('pointermove', (event) => {
      if (!table.classList.contains('is-dragging')) return;

      const distance = event.clientX - startX;
      dragged ||= Math.abs(distance) > 4;
      table.scrollLeft = startScrollLeft - distance;
    });

    const stopDragging = (event) => {
      if (!table.classList.contains('is-dragging')) return;

      table.classList.remove('is-dragging');
      if (table.hasPointerCapture(event.pointerId)) table.releasePointerCapture(event.pointerId);
    };

    table.addEventListener('pointerup', stopDragging);
    table.addEventListener('pointercancel', stopDragging);
    table.addEventListener('click', (event) => {
      if (!dragged) return;
      event.preventDefault();
      event.stopPropagation();
      dragged = false;
    }, true);

    window.addEventListener('resize', updateState);
  });
})();

// Article comments: reveal extra preview comments
(function () {
  const button = document.querySelector('[data-comments-more]');
  const extra = document.querySelector('[data-comments-extra]');
  const moreWrap = document.querySelector('[data-comments-more-wrap]');

  if (!button || !extra || !moreWrap) return;

  button.addEventListener('click', () => {
    extra.hidden = false;
    moreWrap.hidden = true;
  });
})();
