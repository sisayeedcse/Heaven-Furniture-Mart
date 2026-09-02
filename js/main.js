/**
 * Heaven Furniture Mart — Main JavaScript
 * Handles: sticky nav, mobile menu, scroll reveals, WhatsApp form, mobile sticky CTA
 */

'use strict';

// ============================================================
// UTILITY: Query helpers
// ============================================================
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ============================================================
// STICKY NAVIGATION
// ============================================================
(function initNav() {
  const nav = $('#nav');
  if (!nav) return;

  let lastScroll = 0;
  const SCROLL_THRESHOLD = 80;

  function updateNav() {
    const scrollY = window.scrollY;
    if (scrollY > SCROLL_THRESHOLD) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
    lastScroll = scrollY;
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav(); // run once on load
})();

// ============================================================
// MOBILE NAVIGATION — Hamburger + Drawer
// ============================================================
(function initMobileMenu() {
  const toggle = $('#nav-toggle');
  const drawer = $('#nav-drawer');
  if (!toggle || !drawer) return;

  let isOpen = false;

  function openMenu() {
    isOpen = true;
    toggle.classList.add('is-open');
    drawer.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    isOpen = false;
    toggle.classList.remove('is-open');
    drawer.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    isOpen ? closeMenu() : openMenu();
  });

  // Close on drawer link click
  $$('a', drawer).forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) {
      closeMenu();
      toggle.focus();
    }
  });

  // Close on overlay click (outside drawer inner)
  drawer.addEventListener('click', e => {
    if (e.target === drawer) closeMenu();
  });
})();

// ============================================================
// SMOOTH SCROLL — anchor links
// ============================================================
(function initSmoothScroll() {
  const navH = 72;

  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const target = $(link.getAttribute('href'));
    if (!target) return;

    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
})();

// ============================================================
// SCROLL REVEAL — IntersectionObserver
// ============================================================
(function initReveal() {
  // Respect user preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    $$('.reveal').forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '-60px 0px', threshold: 0.1 }
  );

  $$('.reveal').forEach(el => observer.observe(el));
})();

// ============================================================
// MOBILE STICKY CTA — show after hero scrolls past
// ============================================================
(function initMobileSticky() {
  const sticky = $('#mobile-sticky');
  const hero = $('.hero');
  if (!sticky || !hero) return;

  function checkSticky() {
    const heroBottom = hero.getBoundingClientRect().bottom;
    if (heroBottom < 0) {
      sticky.classList.add('is-visible');
      sticky.setAttribute('aria-hidden', 'false');
    } else {
      sticky.classList.remove('is-visible');
      sticky.setAttribute('aria-hidden', 'true');
    }
  }

  // Only show on mobile
  const mql = window.matchMedia('(max-width: 767px)');

  function handleMQL() {
    if (mql.matches) {
      window.addEventListener('scroll', checkSticky, { passive: true });
      checkSticky();
    } else {
      window.removeEventListener('scroll', checkSticky);
      sticky.classList.remove('is-visible');
    }
  }

  mql.addEventListener('change', handleMQL);
  handleMQL();
})();

// ============================================================
// CONSULTATION FORM — WhatsApp submission
// ============================================================
(function initForm() {
  const form = $('#consult-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = $('#f-name').value.trim();
    const phone = $('#f-phone').value.trim();
    const interest = $('#f-interest').value;
    const message = $('#f-message').value.trim();

    // Basic validation
    if (!name) {
      alert('Please enter your name.');
      $('#f-name').focus();
      return;
    }
    if (!phone) {
      alert('Please enter your phone number.');
      $('#f-phone').focus();
      return;
    }

    // Build WhatsApp message
    const lines = [
      'Hello Heaven Furniture Mart!',
      '',
      'I would like to request a free design consultation.',
      '',
      `Name: ${name}`,
      `Phone: ${phone}`,
    ];

    if (interest) lines.push(`Interested in: ${interest}`);
    if (message) lines.push(`\nMessage: ${message}`);

    lines.push('', 'Please let me know when we can connect. Thank you!');

    const text = lines.join('\n');
    const waUrl = `https://wa.me/8801960481983?text=${encodeURIComponent(text)}`;

    // Open WhatsApp
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // Show confirmation
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '✓ Request Sent via WhatsApp';
    submitBtn.disabled = true;
    submitBtn.style.backgroundColor = 'var(--teal-600)';
    submitBtn.style.borderColor = 'var(--teal-600)';
    submitBtn.style.color = 'var(--white)';

    // Reset after 5 seconds
    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      submitBtn.style.backgroundColor = '';
      submitBtn.style.borderColor = '';
      submitBtn.style.color = '';
      form.reset();
    }, 5000);
  });
})();

// ============================================================
// ACTIVE NAV LINK — highlight current section
// ============================================================
(function initActiveNav() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.removeAttribute('aria-current');
            if (link.getAttribute('href') === `#${id}`) {
              link.setAttribute('aria-current', 'true');
            }
          });
        }
      });
    },
    { rootMargin: '-50% 0px -50% 0px' }
  );

  sections.forEach(s => observer.observe(s));
})();

// ============================================================
// COLLECTIONS — keyboard support for hover overlays
// ============================================================
(function initCollections() {
  $$('.col-item').forEach(item => {
    item.setAttribute('tabindex', '0');

    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const cta = $('a', item);
        if (cta) cta.click();
      }
    });
  });
})();
