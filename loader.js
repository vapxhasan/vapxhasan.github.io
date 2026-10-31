/* Loading screen + slow/failed-load handling.
   Put in <head> as a normal (non-deferred) script so it appears before the page body.
   - Fast loads: nothing flashes (screen only appears if loading takes > 1.5 s).
   - Slow loads: friendly message after 8 s, Retry button after 20 s.
   - No internet at start: clear message + automatic retry when the connection returns.
   - Failsafe: the screen always disappears, so a visitor is never stuck behind it. */
(function () {
  'use strict';
  if (window.__sitePreloader) return;
  var root = document.documentElement, done = false, shown = false, startedAt = Date.now();

  var light = false;
  try {
    var t = localStorage.getItem('themeMode');
    light = t ? t === 'light' : matchMedia('(prefers-color-scheme: light)').matches;
  } catch (e) {}

  var css = document.createElement('style');
  css.textContent =
    '#sitePreloader{position:fixed;inset:0;z-index:2147483600;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:22px;padding:24px;text-align:center;' +
      'background:' + (light ? '#F8FAFC' : '#0B1120') + ';color:' + (light ? '#0A0E1A' : '#F8FAFC') + ';' +
      'font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;opacity:0;visibility:hidden;transition:opacity .35s ease,visibility 0s linear .35s}' +
    '#sitePreloader.on{opacity:1;visibility:visible;transition-delay:0s}' +
    '#sitePreloader.out{opacity:0;visibility:hidden;pointer-events:none}' +
    '#sitePreloader .pl-ring{position:relative;width:64px;height:64px}' +
    '#sitePreloader .pl-ring::before{content:"";position:absolute;inset:0;border-radius:50%;border:3px solid ' + (light ? 'rgba(15,23,42,.1)' : 'rgba(148,163,184,.18)') + ';border-top-color:#3B82F6;animation:plspin .9s linear infinite}' +
    '#sitePreloader .pl-mark{position:absolute;inset:10px;border-radius:14px;display:grid;place-items:center;overflow:hidden;font-size:15px;font-weight:800;color:#fff;background:linear-gradient(135deg,#2563EB,#3B82F6)}' +
    '#sitePreloader .pl-mark img{width:100%;height:100%;display:block;object-fit:cover}' +
    '#sitePreloader .pl-msg{font-size:15px;line-height:1.5;color:' + (light ? '#475569' : '#A9B6CB') + ';max-width:320px;min-height:22px}' +
    '#sitePreloader .pl-btn{display:none;min-height:46px;padding:0 24px;border:0;border-radius:12px;font:inherit;font-size:15px;font-weight:600;color:#fff;cursor:pointer;background:linear-gradient(135deg,#2563EB,#3B82F6)}' +
    '#sitePreloader .pl-btn.show{display:inline-block}' +
    '@keyframes plspin{to{transform:rotate(360deg)}}' +
    '@media (prefers-reduced-motion:reduce){#sitePreloader .pl-ring::before{animation-duration:2.5s}}';
  root.appendChild(css);

  var el = document.createElement('div');
  el.id = 'sitePreloader';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.innerHTML = '<div class="pl-ring"><div class="pl-mark" id="plMark"><img src="/logo.png" alt="" width="44" height="44" decoding="async"></div></div><div class="pl-msg" id="plMsg"></div><button class="pl-btn" id="plBtn" type="button">Reload page</button>';
  root.appendChild(el);

  var msg = el.querySelector('#plMsg'), btn = el.querySelector('#plBtn');
  var logo = el.querySelector('#plMark img');
  if (logo) logo.addEventListener('error', function () { el.querySelector('#plMark').textContent = 'HR'; });
  btn.addEventListener('click', function () { location.reload(); });

  function say(text, withBtn) { msg.textContent = text; btn.classList.toggle('show', !!withBtn); }
  function show() { if (!done) { shown = true; el.classList.add('on'); } }

  function hide() {
    if (done) return; done = true;
    var wait = shown ? Math.max(0, 450 - (Date.now() - startedAt - 300)) : 0;
    setTimeout(function () {
      el.classList.add('out'); el.classList.remove('on');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); if (css.parentNode) css.parentNode.removeChild(css); }, 500);
    }, wait);
  }
  window.__sitePreloader = { hide: hide };

  /* Appear only if loading takes a moment */
  setTimeout(show, 1500);

  /* Offline right now */
  function offlineCheck() {
    if (done) return;
    if (navigator.onLine === false) { show(); say('No internet connection. The page will continue loading when you’re back online.', true); }
  }
  offlineCheck();
  window.addEventListener('online', function () { if (!done) say('Back online. Loading…', false); });
  window.addEventListener('offline', offlineCheck);

  /* Slow connection messages */
  setTimeout(function () { if (!done && navigator.onLine !== false) { show(); say('Taking longer than usual. Your connection seems slow…', false); } }, 8000);
  setTimeout(function () { if (!done && navigator.onLine !== false) { show(); say('Still loading. You can wait or reload the page.', true); } }, 20000);

  /* Hide as soon as the page structure is ready (not on 'load') */
  if (document.readyState === 'interactive' || document.readyState === 'complete') hide();
  else document.addEventListener('DOMContentLoaded', hide);
  /* Failsafe: never keep a visitor behind the loading screen */
  setTimeout(hide, 4000);
})();
