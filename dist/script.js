const header = document.querySelector('.site-header');
const progress = document.querySelector('.progress span');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const hero = document.querySelector('.hero');
const heroImage = document.querySelector('.hero-media img');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let scrollTicking = false;

function updateScrollUi() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  header?.classList.toggle('scrolled', y > 18);
  if (progress) {
    const ratio = max > 0 ? Math.min(1, y / max) : 0;
    progress.style.transform = `scaleX(${ratio})`;
  }

  if (!reducedMotion && hero && heroImage && window.innerWidth > 760) {
    const rect = hero.getBoundingClientRect();
    const travel = Math.max(-28, Math.min(28, -rect.top * 0.045));
    heroImage.style.setProperty('--photo-shift', `${travel}px`);
  }
  scrollTicking = false;
}

function requestScrollUpdate() {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(updateScrollUi);
}

function closeMenu({ restoreFocus = false } = {}) {
  if (!menuButton || !navigation) return;
  const wasOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Ouvrir le menu');
  navigation.classList.remove('open');
  document.body.classList.remove('menu-open');
  if (restoreFocus && wasOpen) menuButton.focus();
}

menuButton?.addEventListener('click', () => {
  const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(willOpen));
  menuButton.setAttribute('aria-label', willOpen ? 'Fermer le menu' : 'Ouvrir le menu');
  navigation?.classList.toggle('open', willOpen);
  document.body.classList.toggle('menu-open', willOpen);
});

navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.querySelector('.brand')?.addEventListener('click', closeMenu);
window.addEventListener('hashchange', closeMenu);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenu({ restoreFocus: true });
    return;
  }
  if (event.key !== 'Tab' || window.innerWidth > 760 || !navigation?.classList.contains('open')) return;
  const items = [menuButton, ...navigation.querySelectorAll('a')];
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

const revealGroups = [
  '.impact-bar article',
  '.section-intro',
  '.mission-content',
  '.field-photo',
  '.section-heading > *',
  '.action-grid article',
  '.school-grid > *',
  '.class-list li',
  '.project-list article',
  '.needs .shell > *',
  '.volunteer .two-col > *',
  '.credibility .shell > *',
  '.reference-links a',
  '.contact .shell > *',
  '.contact-card'
];

const revealItems = [...document.querySelectorAll(revealGroups.join(','))];
revealItems.forEach((item, index) => {
  item.classList.add('reveal-on-scroll');
  item.style.setProperty('--reveal-delay', `${(index % 3) * 70}ms`);
});

function animateNumber(element) {
  if (element.dataset.counted === 'true') return;
  element.dataset.counted = 'true';
  const original = element.textContent.trim();
  const target = Number(original.replace(/\D/g, ''));
  if (!Number.isFinite(target)) return;
  const duration = target > 500 ? 1250 : 900;
  const start = performance.now();

  function frame(now) {
    const elapsed = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - elapsed, 3);
    element.textContent = String(Math.round(target * eased));
    if (elapsed < 1) requestAnimationFrame(frame);
    else element.textContent = original;
  }
  requestAnimationFrame(frame);
}

if (reducedMotion) {
  revealItems.forEach((item) => item.classList.add('in-view'));
} else {
  document.documentElement.classList.add('motion-ready');
  requestAnimationFrame(() => document.body.classList.add('hero-visible'));

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      if (entry.target.matches('.impact-bar article')) {
        const number = entry.target.querySelector('strong');
        if (number) animateNumber(number);
      }
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
  revealItems.forEach((item) => revealObserver.observe(item));
}

const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]:not(.nav-cta)')];
const observedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window && observedSections.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${visible.target.id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-28% 0px -58% 0px', threshold: [0, 0.1, 0.4] });
  observedSections.forEach((section) => sectionObserver.observe(section));
}

const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());
window.addEventListener('scroll', requestScrollUpdate, { passive: true });
window.addEventListener('resize', () => {
  if (window.innerWidth > 760) closeMenu();
  requestScrollUpdate();
});
updateScrollUi();
