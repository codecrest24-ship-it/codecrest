// main.js
// Core interactions, scroll animations and Firestore form handling for CodeCrest.

import { db, collection, addDoc, serverTimestamp } from './firebase.js';

function initYearBadge() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
}

function initMobileNav() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('[data-nav-menu]');

  if (!toggle || !menu) return;

  const updateState = (open) => {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      menu.classList.remove('hidden');
      requestAnimationFrame(() => {
        menu.classList.add('opacity-100');
        menu.classList.remove('opacity-0');
      });
    } else {
      menu.classList.add('opacity-0');
      menu.classList.remove('opacity-100');
      menu.addEventListener(
        'transitionend',
        () => {
          if (menu.classList.contains('opacity-0')) {
            menu.classList.add('hidden');
          }
        },
        { once: true }
      );
    }
  };

  let isOpen = false;

  toggle.addEventListener('click', () => {
    isOpen = !isOpen;
    updateState(isOpen);
  });

  menu.addEventListener('click', (event) => {
    if (event.target instanceof HTMLElement && event.target.tagName === 'A') {
      isOpen = false;
      updateState(false);
    }
  });
}

function initNavbarScrollState() {
  const navbar = document.querySelector('[data-navbar]');
  if (!navbar) return;

  const applyState = () => {
    const scrolled = window.scrollY > 10;
    navbar.classList.toggle('shadow-soft-glow', scrolled);
    navbar.classList.toggle('bg-black/40', !scrolled);
    navbar.classList.toggle('bg-black/70', scrolled);
  };

  applyState();
  window.addEventListener('scroll', applyState, { passive: true });
}

function initScrollAnimations() {
  const elements = document.querySelectorAll('.reveal-on-scroll');
  if (!elements.length) return;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: '0px 0px -12% 0px'
    }
  );

  elements.forEach((el) => observer.observe(el));
}

function getFormStatusElement(form) {
  return form.querySelector('[data-form-status]');
}

function setStatusMessage(statusEl, message, type) {
  if (!statusEl) return;

  statusEl.textContent = message;
  statusEl.classList.remove('text-emerald-400', 'text-red-400');

  if (type === 'success') {
    statusEl.classList.add('text-emerald-400');
  } else if (type === 'error') {
    statusEl.classList.add('text-red-400');
  }
}

async function submitToFirestore(collectionName, payload) {
  if (!db) {
    throw new Error('Firestore is not initialized. Check firebaseConfig.');
  }

  return addDoc(collection(db, collectionName), {
    ...payload,
    createdAt: serverTimestamp()
  });
}

function serializeForm(form) {
  const formData = new FormData(form);
  const data = {};

  for (const [key, value] of formData.entries()) {
    data[key] = value.toString().trim();
  }

  return data;
}

function attachFormHandler(formId, collectionName) {
  const form = document.getElementById(formId);
  if (!form) return;

  const statusEl = getFormStatusElement(form);
  const submitButton = form.querySelector('[data-submit-button]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatusMessage(statusEl, '', 'neutral');

    if (!form.reportValidity()) {
      return;
    }

    let originalLabel = '';

    if (submitButton instanceof HTMLButtonElement) {
      originalLabel = submitButton.textContent ?? '';
      submitButton.disabled = true;
      submitButton.textContent = 'Sending…';
    }

    const payload = serializeForm(form);

    try {
      await submitToFirestore(collectionName, payload);
      form.reset();
      setStatusMessage(
        statusEl,
        'Thank you — your submission has been received.',
        'success'
      );
    } catch (error) {
      console.error(
        `[CodeCrest] Error submitting ${collectionName} form:`,
        error
      );
      setStatusMessage(
        statusEl,
        'Something went wrong. Please try again in a moment.',
        'error'
      );
    } finally {
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel || 'Submit';
      }
    }
  });
}

function initForms() {
  attachFormHandler('hire-form', 'hireRequests');
  attachFormHandler('developer-form', 'developerApplications');
  attachFormHandler('contact-form', 'contactMessages');
}

function init() {
  initYearBadge();
  initMobileNav();
  initNavbarScrollState();
  initScrollAnimations();
  initForms();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

