// Facebook (Meta Pixel) tracking: lets Facebook see which ads lead to sign-ups and posted jobs.
// It does nothing until PIXEL_ID below is filled in.
//   - Every page: PageView
//   - Sign-up finished: CompleteRegistration (client or operator)
//   - Job posted: Lead
// Not loaded on owner-only pages (HQ, admin).
(function () {
  var PIXEL_ID = '4023990411230641'; // paste the Pixel / Dataset ID from Facebook Events Manager here
  window.dbTrack = function () {};
  if (!PIXEL_ID) return;
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
    t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');
  window.dbTrack = function (event, params) { try { window.fbq('track', event, params || {}); } catch (e) {} };
})();
