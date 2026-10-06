// When the Terms of Service or Privacy Policy change, people who already have an account are asked to agree
// to the new version the next time they open their dashboard. The server keeps the date and version they agreed to.
// The box comes back on every visit until they tap "I agree". New sign-ups agree on the sign-up form instead.
(function () {
  var API = 'https://dirtbidder-backend-production.up.railway.app';

  // What changed, in plain words, for each version. Add a line here whenever the Terms change.
  var CHANGES = {
    '2026-10-06': [
      'DirtBidder can read messages, bids and job posts to settle disputes, enforce the rules and prevent fraud.',
      'A client can share a job’s exact location with one operator before hiring, so they can look at the site.'
    ]
  };

  function call(path, opts) {
    var token = null;
    try { token = localStorage.getItem('dirtbidder_token'); } catch (e) {}
    if (!token) return Promise.reject(new Error('signed out'));
    return fetch(API + path, Object.assign({}, opts || {}, { headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token } }))
      .then(function (res) { return res.json().catch(function () { return {}; }).then(function (d) { if (!res.ok) { var e = new Error(d.error || 'Something went wrong'); e.stale = !!d.stale; throw e; } return d; }); });
  }
  function niceDate(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
    if (!m) return '';
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[Number(m[2]) - 1] + ' ' + Number(m[3]) + ', ' + m[1];
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function show(version) {
    if (document.getElementById('dbTermsBox')) return;
    var list = CHANGES[version] || [];
    var date = niceDate(version);
    var o = document.createElement('div');
    o.id = 'dbTermsBox';
    o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-labelledby', 'dbTermsTitle');
    o.style.cssText = 'position:fixed;inset:0;z-index:5900;background:rgba(10,7,5,0.82);display:flex;align-items:center;justify-content:center;padding:1rem;overflow:auto';
    var A = 'color:#E8892A';
    o.innerHTML =
      '<div style="background:#2A1F17;border:1px solid rgba(232,137,42,0.35);border-radius:6px;max-width:440px;width:100%;padding:1.4rem 1.3rem;font-family:Barlow,Arial,sans-serif;color:#C4A882;line-height:1.5;margin:auto">' +
        '<div id="dbTermsTitle" style="font-family:\'Barlow Condensed\',Arial,sans-serif;font-weight:800;font-size:1.45rem;text-transform:uppercase;color:#F2EDE6;line-height:1.1;margin-bottom:0.5rem">We updated our Terms</div>' +
        '<p style="font-size:0.93rem;margin:0 0 0.8rem">' + (date ? 'Our Terms of Service and Privacy Policy changed on ' + esc(date) + '.' : 'Our Terms of Service and Privacy Policy have changed.') + (list.length ? ' Here’s what’s different:' : ' Please read them before you continue.') + '</p>' +
        (list.length ? '<ul style="margin:0 0 0.9rem;padding-left:1.2rem;font-size:0.93rem;color:#F2EDE6">' + list.map(function (t) { return '<li style="margin-bottom:0.45rem">' + esc(t) + '</li>'; }).join('') + '</ul>' : '') +
        '<p style="font-size:0.9rem;margin:0 0 1.1rem">Read the full <a href="dirtbidder-terms.html" target="_blank" rel="noopener" style="' + A + '">Terms of Service</a> and <a href="dirtbidder-privacy.html" target="_blank" rel="noopener" style="' + A + '">Privacy Policy</a>.</p>' +
        '<div id="dbTermsErr" role="alert" style="display:none;color:#E57373;font-size:0.88rem;margin-bottom:0.7rem"></div>' +
        '<button type="button" id="dbTermsYes" style="width:100%;background:#E8892A;color:#1C1410;border:0;border-radius:3px;padding:0.85rem 0.6rem;font-family:\'Barlow Condensed\',Arial,sans-serif;font-weight:800;font-size:1.05rem;letter-spacing:0.04em;text-transform:uppercase;cursor:pointer">I agree to the updated Terms and Privacy Policy</button>' +
        '<div style="text-align:right;margin-top:0.8rem;font-size:0.88rem"><button type="button" id="dbTermsNo" style="background:none;border:0;color:#8C7B6B;font:inherit;cursor:pointer;padding:0.3rem 0">Not now</button></div>' +
      '</div>';
    document.body.appendChild(o);
    var yes = o.querySelector('#dbTermsYes'), no = o.querySelector('#dbTermsNo'), err = o.querySelector('#dbTermsErr');
    function close() { document.removeEventListener('keydown', onKey, true); o.remove(); }
    function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }
    document.addEventListener('keydown', onKey, true);
    no.onclick = close; // it comes back on their next visit
    yes.onclick = function () {
      yes.disabled = true; var label = yes.textContent; yes.textContent = 'Saving…'; err.style.display = 'none';
      call('/api/me/terms', { method: 'POST', body: JSON.stringify({ agree: true, version: version }) })
        .then(close)
        .catch(function (e) { yes.disabled = false; yes.textContent = label; err.textContent = (e && e.message) || 'That didn’t save. Try again.'; err.style.display = ''; });
    };
    yes.focus();
  }

  function check() {
    call('/api/me').then(function (me) {
      // Only an explicit "not on the current version" asks
      if (me && me.terms_current === false && me.terms_version_current) show(me.terms_version_current);
    }).catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', check); else check();
})();
