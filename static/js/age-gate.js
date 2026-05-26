/* Age Gate — follows the same pattern as deck-hover.js */
(function () {
  'use strict';

  function getCookie(name) {
    var escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var match = document.cookie.match(new RegExp('(?:^|; )' + escaped + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function hideOverlay() {
    var overlay = document.getElementById('age-gate-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  function showOverlay() {
    var overlay = document.getElementById('age-gate-overlay');
    if (overlay) overlay.style.display = 'flex';
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Only activate on pages flagged as adult content
    if (!document.querySelector('meta[name="x-adult-content"]')) { return; }

    // Already verified via persistent cookie?
    if (getCookie('age_verified') === '1') { return; }

    // Already verified in this tab via sessionStorage?
    if (sessionStorage.getItem('age_verified') === '1') { return; }

    // Show the gate
    showOverlay();

    // "Accept & Remember Me" — set a 90-day cookie
    var btnCookie = document.getElementById('age-gate-accept-cookie');
    if (btnCookie) {
      btnCookie.addEventListener('click', function () {
        // 90 days = 7,776,000 seconds
        document.cookie = 'age_verified=1; max-age=7776000; path=/; SameSite=Lax';
        hideOverlay();
      });
    }

    // "Accept for This Tab" — sessionStorage only, clears when tab closes
    var btnSession = document.getElementById('age-gate-accept-session');
    if (btnSession) {
      btnSession.addEventListener('click', function () {
        sessionStorage.setItem('age_verified', '1');
        hideOverlay();
      });
    }
  });
}());
