/* Connection status banner + service-worker registration.
   Load with <script src="net-status.js" defer></script> */
(function () {
  'use strict';

  /* 1. Offline support */
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () { /* optional feature, fail silently */ });
    });
  }

  /* 2. Banner */
  var css = document.createElement('style');
  css.textContent =
    '#netBanner{position:fixed;left:50%;top:calc(12px + env(safe-area-inset-top,0px));z-index:2147483000;transform:translate(-50%,-140%);' +
      'max-width:min(92vw,460px);display:flex;align-items:center;gap:10px;padding:10px 16px;border-radius:999px;' +
      'font:600 13.5px/1.35 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#fff;box-shadow:0 10px 30px rgba(0,0,0,.35);' +
      'transition:transform .35s cubic-bezier(.16,1,.3,1);pointer-events:none}' +
    '#netBanner.show{transform:translate(-50%,0);pointer-events:auto}' +
    '#netBanner.off{background:#B91C1C}#netBanner.slow{background:#B45309}#netBanner.on{background:#15803D}' +
    '#netBanner i{flex:0 0 8px;height:8px;border-radius:50%;background:#fff;opacity:.9}' +
    '@media (prefers-reduced-motion:reduce){#netBanner{transition:none}}';
  document.head.appendChild(css);

  var bar = document.createElement('div');
  bar.id = 'netBanner';
  bar.setAttribute('role', 'status');
  bar.setAttribute('aria-live', 'polite');
  bar.innerHTML = '<i></i><span></span>';
  document.body.appendChild(bar);
  var label = bar.querySelector('span'), timer = null, wasOffline = false;

  function show(kind, text, autoHideMs) {
    clearTimeout(timer);
    bar.className = kind + ' show';
    label.textContent = text;
    if (autoHideMs) timer = setTimeout(hide, autoHideMs);
  }
  function hide() { bar.classList.remove('show'); }

  function goOffline() { wasOffline = true; show('off', 'You’re offline. Some content may not load.'); }
  function goOnline()  { if (wasOffline) { wasOffline = false; show('on', 'Back online'); timer = setTimeout(hide, 2500); } else { hide(); } }

  window.addEventListener('offline', goOffline);
  window.addEventListener('online', goOnline);
  if (navigator.onLine === false) goOffline();

  /* Slow connection (2G / data saver): one gentle heads-up per visit */
  try {
    var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var slow = c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || ''));
    if (slow && navigator.onLine !== false && !sessionStorage.getItem('slowNoticeShown')) {
      sessionStorage.setItem('slowNoticeShown', '1');
      show('slow', 'Slow connection detected. Content may take longer to load.', 6000);
    }
  } catch (e) {}
})();
