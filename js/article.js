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

  const sectionRoot = toc.closest('.article-content-section');

  function updateTocPosition() {
    if (!sectionRoot || window.innerWidth < 1280) {
      toc.classList.remove('article-toc--fixed', 'article-toc--bottom');
      toc.style.removeProperty('top');
      return;
    }

    const topOffset = getHeaderOffset();
    const sectionTop = sectionRoot.offsetTop;
    const sectionBottom = sectionTop + sectionRoot.offsetHeight;
    const tocHeight = toc.offsetHeight;
    const currentTop = window.scrollY + topOffset;

    if (currentTop <= sectionTop) {
      toc.classList.remove('article-toc--fixed', 'article-toc--bottom');
      toc.style.removeProperty('top');
      return;
    }

    if (currentTop + tocHeight >= sectionBottom) {
      toc.classList.remove('article-toc--fixed');
      toc.classList.add('article-toc--bottom');
      toc.style.removeProperty('top');
      return;
    }

    toc.classList.add('article-toc--fixed');
    toc.classList.remove('article-toc--bottom');
    toc.style.top = topOffset + 'px';
  }

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
    updateTocPosition();
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
  updateTocPosition();
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

