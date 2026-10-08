const header = document.querySelector('.site-header');
const progress = document.querySelector('.progress span');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function updateScrollUi() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  header?.classList.toggle('scrolled', y > 18);
  if (progress) progress.style.width = `${max > 0 ? Math.min(100, (y / max) * 100) : 0}%`;
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
  if (willOpen) setTimeout(() => navigation?.querySelector('a')?.focus(), 0);
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

if (reducedMotion) {
  document.querySelectorAll('.reveal').forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -30px' });
  document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));
}

const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());
window.addEventListener('scroll', updateScrollUi, { passive: true });
window.addEventListener('resize', () => { if (window.innerWidth > 760) closeMenu(); });
updateScrollUi();
