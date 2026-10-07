// Makes DirtBidder usable with a screen reader, a keyboard, a switch or voice control.
// Loaded on every page. It changes nothing you can see when using a finger or a mouse.
//
// What it does:
//   1. Shows a clear focus ring, but only while someone is moving around with the keyboard.
//   2. Adds a "Skip to main content" link (appears on the first Tab press).
//   3. Anything tappable that isn't a real <button> or link (a <div onclick>) is announced as a button,
//      can be reached with Tab, and works with Enter / Space. Covers content the page builds later, too.
//   4. Keeps on/off state readable: on elements marked data-db-sync, aria-pressed / aria-checked follow
//      the "selected" class. The current sidebar item is marked as the current page.
//      Elements without data-db-sync are never touched, so a page that sets its own state keeps it.
//   5. Pop-up forms are announced as dialogs, take the focus when they open, keep Tab inside,
//      close with Escape, and give the focus back when they close.
//
// Labels for form boxes and names for icon-only buttons live in each page's own HTML, not here.
(function () {
  if (window.__dbA11y) return;
  window.__dbA11y = true;

  var NATIVE = 'a[href],button,input,select,textarea,summary,label,option';
  var INNER = 'a[href],button,input:not([type=hidden]),select,textarea';
  var KEY_ROLES = { button: 1, checkbox: 1, radio: 1, tab: 1, link: 1, 'switch': 1, menuitem: 1 };
  var ON = ['selected', 'active', 'checked', 'on'];
  var MODALS = '.modal-overlay,.db-modal-overlay';
  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

  // ---------- 1. focus ring for keyboard users only ----------
  var style = document.createElement('style');
  style.textContent =
    '.db-skip{position:absolute;left:-9999px;top:0;z-index:10000;background:#E8892A;color:#1C1410;font:700 15px/1.2 Arial,Helvetica,sans-serif;padding:10px 16px;text-decoration:none;border-radius:0 0 4px 0}' +
    '.db-skip:focus{left:0}' +
    'html.db-kbd :focus{outline:3px solid #FFD9A8 !important;outline-offset:2px !important}' +
    '.db-sr-only{position:absolute !important;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}' +
    '@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important;scroll-behavior:auto !important}}';
  (document.head || document.documentElement).appendChild(style);
  var root = document.documentElement;
  document.addEventListener('keydown', function (e) { if (e.key === 'Tab') root.classList.add('db-kbd'); }, true);
  document.addEventListener('mousedown', function () { root.classList.remove('db-kbd'); }, true);
  document.addEventListener('touchstart', function () { root.classList.remove('db-kbd'); }, { capture: true, passive: true });

  function shown(el) {
    if (!el) return false;
    for (var n = el; n && n.nodeType === 1; n = n.parentElement) {
      var s = getComputedStyle(n);
      if (s.display === 'none' || s.visibility === 'hidden') return false;
    }
    return true;
  }

  // ---------- 2. skip link ----------
  function skipLink() {
    if (document.getElementById('dbSkip') || !document.body) return;
    var main = document.querySelector('main,[role=main]');
    if (!main) return;
    if (!main.id) main.id = 'dbMain';
    var a = document.createElement('a');
    a.id = 'dbSkip'; a.className = 'db-skip'; a.href = '#' + main.id; a.textContent = 'Skip to main content';
    // The main area only becomes focusable for the moment the skip link sends focus there, so ordinary taps and clicks are unaffected
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var had = main.hasAttribute('tabindex');
      if (!had) { main.setAttribute('tabindex', '-1'); main.addEventListener('blur', function off() { main.removeAttribute('tabindex'); main.removeEventListener('blur', off); }); }
      main.focus(); if (main.scrollIntoView) main.scrollIntoView();
    });
    document.body.insertBefore(a, document.body.firstChild);
  }

  // ---------- 3. tappable things that aren't real buttons ----------
  function fixClickable(el) {
    if (el.matches(NATIVE)) return;
    if (el.getAttribute('aria-hidden') === 'true') return;
    var role = el.getAttribute('role');
    if (role === 'presentation' || role === 'none' || role === 'dialog') return;
    if (role) { if (KEY_ROLES[role] && !el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0'); return; }
    var code = el.getAttribute('onclick') || '';
    if (/^\s*(event\.)?stopPropagation\(\)\s*;?\s*$/.test(code)) return; // only stops a tap from bubbling
    var name = (el.getAttribute('aria-label') || el.textContent || '').trim();
    if (!name && !el.querySelector('img[alt]:not([alt=""])')) return; // a backdrop or spacer, not a control
    // A tappable card that already holds real buttons or links: leave it, those are the controls
    var inner = el.querySelectorAll(INNER);
    for (var i = 0; i < inner.length; i++) {
      if (inner[i].type === 'checkbox' || inner[i].type === 'radio') { if (shown(inner[i])) return; continue; }
      return;
    }
    el.setAttribute('role', 'button');
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
  }

  // ---------- 4. on/off state and current page ----------
  function isOn(el) { for (var i = 0; i < ON.length; i++) if (el.classList.contains(ON[i])) return true; return false; }
  function syncState(el) {
    // Only elements that ask for it (data-db-sync). Anything else manages its own state and is never touched.
    if (el.hasAttribute('data-db-sync')) {
      var on = String(isOn(el));
      if (el.hasAttribute('aria-pressed') && el.getAttribute('aria-pressed') !== on) el.setAttribute('aria-pressed', on);
      if (el.hasAttribute('aria-checked') && el.getAttribute('aria-checked') !== on) el.setAttribute('aria-checked', on);
      if (el.hasAttribute('aria-selected') && el.getAttribute('aria-selected') !== on) el.setAttribute('aria-selected', on);
    }
    if (el.classList.contains('nav-item')) {
      if (el.classList.contains('active')) { if (el.getAttribute('aria-current') !== 'page') el.setAttribute('aria-current', 'page'); }
      else if (el.hasAttribute('aria-current')) el.removeAttribute('aria-current');
    }
  }

  function scan(node) {
    if (!node || node.nodeType !== 1) return;
    if (node.hasAttribute('onclick')) fixClickable(node);
    var list = node.querySelectorAll('[onclick]');
    for (var i = 0; i < list.length; i++) fixClickable(list[i]);
    var st = node.querySelectorAll('[data-db-sync],.nav-item');
    for (var j = 0; j < st.length; j++) syncState(st[j]);
    if (node.matches('[data-db-sync],.nav-item')) syncState(node);
  }

  // Enter / Space work on anything announced as a button, checkbox, tab and so on
  document.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k !== 'Enter' && k !== ' ' && k !== 'Spacebar') return;
    var t = e.target;
    if (!t || !t.getAttribute || t.isContentEditable || t.matches(NATIVE)) return;
    var role = t.getAttribute('role');
    if (!KEY_ROLES[role] || t.getAttribute('aria-disabled') === 'true') return;
    if (role === 'link' && k !== 'Enter') return;
    e.preventDefault();
    t.click();
  });

  // ---------- 5. pop-up forms ----------
  var returnTo = new WeakMap();
  var openOnes = [];
  function dialogBox(ov) { return ov.querySelector('.modal,.db-modal') || ov; }
  function modalOpened(ov) {
    if (openOnes.indexOf(ov) !== -1) return;
    openOnes.push(ov);
    var box = dialogBox(ov);
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    var title = box.querySelector('.modal-title,.db-modal-title');
    if (title) { if (!title.id) title.id = 'dbDlgTitle' + Math.random().toString(36).slice(2, 8); box.setAttribute('aria-labelledby', title.id); }
    if (!box.hasAttribute('tabindex')) box.setAttribute('tabindex', '-1');
    var was = document.activeElement;
    if (was && was !== document.body && !ov.contains(was)) returnTo.set(ov, was);
    // put the focus on the first box to fill in, or on the dialog itself
    setTimeout(function () {
      if (!ov.classList.contains('active') || ov.contains(document.activeElement)) return;
      var first = box.querySelector('input:not([type=hidden]):not([type=file]):not([disabled]),select:not([disabled]),textarea:not([disabled])');
      try { (first && shown(first) ? first : box).focus({ preventScroll: false }); } catch (err) { box.focus(); }
    }, 30);
  }
  function modalClosed(ov) {
    var i = openOnes.indexOf(ov);
    if (i === -1) return;
    openOnes.splice(i, 1);
    var back = returnTo.get(ov);
    returnTo.delete(ov);
    if (back && document.contains(back) && (ov.contains(document.activeElement) || document.activeElement === document.body)) { try { back.focus(); } catch (err) {} }
  }
  function checkModal(ov) { if (ov.classList.contains('active')) modalOpened(ov); else modalClosed(ov); }
  document.addEventListener('keydown', function (e) {
    var ov = openOnes[openOnes.length - 1];
    if (!ov) return;
    // another dialog drawn over this one (the "one rule" box, for example) handles its own keys
    var top = document.querySelector('[role=dialog][aria-modal=true]:not(.modal):not(.db-modal)');
    if (top && !ov.contains(top) && shown(top)) return;
    if (e.key === 'Escape') {
      var x = ov.querySelector('.modal-close,.db-modal-close,[data-close],.btn-cancel');
      if (!x) { var bs = ov.querySelectorAll('button'); for (var i = 0; i < bs.length; i++) if (/^(✕|×|x|cancel|close|not now)$/i.test(bs[i].textContent.trim())) { x = bs[i]; break; } }
      if (x) { e.preventDefault(); x.click(); }
      return;
    }
    if (e.key !== 'Tab') return;
    var all = Array.prototype.filter.call(ov.querySelectorAll(FOCUSABLE), shown);
    if (!all.length) { e.preventDefault(); return; }
    var first = all[0], last = all[all.length - 1], a = document.activeElement;
    if (!ov.contains(a)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && (a === first || a === dialogBox(ov))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
  });

  // ---------- run now, and again whenever the page adds or changes things ----------
  function start() {
    skipLink();
    scan(document.body);
    var ms = document.querySelectorAll(MODALS);
    for (var i = 0; i < ms.length; i++) checkModal(ms[i]);
    var pending = [], timer = null;
    function flush() { timer = null; var p = pending; pending = []; for (var i = 0; i < p.length; i++) if (document.contains(p[i])) scan(p[i]); }
    new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) {
        var m = list[i];
        if (m.type === 'attributes') {
          var t = m.target;
          if (t.matches && t.matches(MODALS)) checkModal(t);
          if (t.hasAttribute && (t.hasAttribute('data-db-sync') || t.classList.contains('nav-item'))) syncState(t);
        } else {
          for (var j = 0; j < m.addedNodes.length; j++) if (m.addedNodes[j].nodeType === 1) pending.push(m.addedNodes[j]);
        }
      }
      if (pending.length && !timer) timer = setTimeout(flush, 40);
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
