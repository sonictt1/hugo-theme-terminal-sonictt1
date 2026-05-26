// age-gate.js — 18+ Content Warning Dialog Logic
// Handles dialog show/hide, cookie/session storage, scroll prevention, keyboard shortcuts

(function() {
  'use strict';

  // Configuration
  const COOKIE_NAME = 'ageGateConfirmed';
  const SESSION_KEY = 'ageGateSessionConfirmed';
  const COOKIE_DAYS = 90;
  const BODY_CLASS = 'age-gate-active';

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAgeGate);
  } else {
    initAgeGate();
  }

  /**
   * Main initialization function
   */
  function initAgeGate() {
    const overlay = document.getElementById('age-gate-overlay');

    // Only run if age-gate overlay exists on this page
    if (!overlay) {
      return;
    }

    // Check if user has already confirmed age
    if (hasConfirmedAge()) {
      // Hide overlay and do nothing
      overlay.style.display = 'none';
      return;
    }

    // Show overlay and attach event listeners
    showOverlay(overlay);
    attachEventListeners(overlay);
  }

  /**
   * Check if user has confirmed age via cookie or session storage
   * @returns {boolean}
   */
  function hasConfirmedAge() {
    // Check for persistent cookie
    if (getCookie(COOKIE_NAME)) {
      return true;
    }

    // Check for session storage flag
    if (sessionStorage.getItem(SESSION_KEY)) {
      return true;
    }

    return false;
  }

  /**
   * Show the age-gate overlay and prevent background scroll
   * @param {HTMLElement} overlay
   */
  function showOverlay(overlay) {
    overlay.style.display = 'flex';
    document.body.classList.add(BODY_CLASS);
    setFocusToOverlay(overlay);
  }

  /**
   * Hide the age-gate overlay and restore background scroll
   * @param {HTMLElement} overlay
   */
  function hideOverlay(overlay) {
    overlay.style.display = 'none';
    document.body.classList.remove(BODY_CLASS);
  }

  /**
   * Set initial focus to the first button in the overlay
   * @param {HTMLElement} overlay
   */
  function setFocusToOverlay(overlay) {
    const firstButton = overlay.querySelector('button');
    if (firstButton) {
      // Use setTimeout to ensure focus after render
      setTimeout(() => {
        firstButton.focus();
      }, 100);
    }
  }

  /**
   * Trap focus within the overlay (for accessibility)
   * @param {KeyboardEvent} event
   * @param {HTMLElement} overlay
   */
  function handleTabKey(event, overlay) {
    const focusableElements = overlay.querySelectorAll('button, a[href], [tabindex="0"]');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift+Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Attach event listeners to overlay buttons
   * @param {HTMLElement} overlay
   */
  function attachEventListeners(overlay) {
    const acceptCookieBtn = overlay.querySelector('#age-gate-accept-cookie');
    const acceptSessionBtn = overlay.querySelector('#age-gate-accept-session');

    if (acceptCookieBtn) {
      acceptCookieBtn.addEventListener('click', () => {
        setCookie(COOKIE_NAME, 'true', COOKIE_DAYS);
        hideOverlay(overlay);
      });
    }

    if (acceptSessionBtn) {
      acceptSessionBtn.addEventListener('click', () => {
        sessionStorage.setItem(SESSION_KEY, 'true');
        hideOverlay(overlay);
      });
    }

    // Keyboard shortcuts
    overlay.addEventListener('keydown', (event) => {
      // Tab key: trap focus
      if (event.key === 'Tab') {
        handleTabKey(event, overlay);
      }

      // Escape key: decline (redirect to home)
      if (event.key === 'Escape') {
        window.location.href = '/';
      }
    });
  }

  /**
   * Set a cookie with expiration date
   * @param {string} name - Cookie name
   * @param {string} value - Cookie value
   * @param {number} days - Expiration in days
   */
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + date.toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + ';' + expires + ';path=/;SameSite=Lax';
  }

  /**
   * Get a cookie value
   * @param {string} name - Cookie name
   * @returns {string|null}
   */
  function getCookie(name) {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }

    return null;
  }
})();
