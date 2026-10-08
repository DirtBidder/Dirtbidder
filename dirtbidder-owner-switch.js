// Owner testing shortcuts.
//  - On the owner's dashboard, the "Testing" box lists the owner's test accounts (+test / +op addresses).
//    One tap signs in as that account. The owner's own sign-in is kept aside on this device.
//  - While in a test account, a bar at the bottom says so and offers "Back to my owner account".
// The server only allows this for the owner, and only for the owner's own test accounts.
(function () {
  var API = 'https://dirtbidder-backend-production.up.railway.app';
  var KEY = 'dirtbidder_token', OWNER = 'dirtbidder_owner_token';
  var TEST = /\+(test|op)\d*@/i;

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function put(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function call(path, opts, token) {
    return fetch(API + path, Object.assign({}, opts || {}, { headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (token || get(KEY)) } }))
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok) throw new Error(d.error || 'Something went wrong'); return d; }); });
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function dash(role) { return role === 'operator' ? 'dirtbidder-operator-dashboard.html' : 'dirtbidder-client-dashboard.html'; }

  function open(id, btn) {
    var mine = get(KEY);
    if (btn) { btn.disabled = true; btn.textContent = 'Opening…'; }
    return call('/api/admin/test-accounts/' + id + '/login', { method: 'POST' }).then(function (d) {
      if (!get(OWNER)) put(OWNER, mine); // keep the owner's sign-in to come back to
      put(KEY, d.token);
      put('dirtbidder_admin', null);
      location.href = dash(d.role);
    }).catch(function (e) {
      if (btn) { btn.disabled = false; btn.textContent = 'Try again'; }
      var m = document.getElementById('dbTestMsg'); if (m) { m.textContent = e.message || 'That didn’t work. Try again.'; m.style.display = ''; }
    });
  }

  function back() {
    var o = get(OWNER);
    if (!o) { location.href = 'dirtbidder-login.html'; return; }
    put(KEY, o); put(OWNER, null);
    location.href = 'dirtbidder-client-dashboard.html';
  }

  // The owner's Testing box (client dashboard). Called once the page knows this is the owner.
  function fill() {
    var box = document.getElementById('dbTestBox');
    if (!box) return;
    call('/api/admin/test-accounts').then(function (d) {
      var list = (d && d.accounts) || [];
      var A = 'color:#E8892A';
      box.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;margin-bottom:0.6rem">' +
          '<div role="heading" aria-level="2" style="font-family:\'Barlow Condensed\',Arial,sans-serif;font-weight:800;font-size:1.05rem;letter-spacing:0.06em;text-transform:uppercase;color:#F2EDE6">🧪 Testing</div>' +
          '<div style="font-size:0.75rem;color:#A89887">Only you see this</div>' +
        '</div>' +
        (list.length ? '<div style="display:grid;gap:0.5rem">' + list.map(function (a) {
          var kind = a.role === 'operator' ? 'Test operator' : 'Test client';
          var who = String(a.company_name || '').trim() || String(a.name || '').trim();
          return '<button type="button" data-test-id="' + a.id + '" style="display:flex;justify-content:space-between;align-items:center;gap:0.75rem;width:100%;text-align:left;background:#1C1410;border:1px solid rgba(232,137,42,0.35);border-radius:4px;padding:0.7rem 0.8rem;color:#F2EDE6;font:inherit;cursor:pointer">' +
            '<span><strong style="display:block;font-size:0.92rem">Open ' + esc(kind.toLowerCase()) + (who ? ' · ' + esc(who) : '') + '</strong><span style="font-size:0.78rem;color:#A89887">' + esc(a.email) + '</span></span>' +
            '<span aria-hidden="true" style="' + A + ';font-weight:700">→</span></button>';
        }).join('') + '</div>' : '<p style="font-size:0.85rem;color:#C4A882;margin:0">No test accounts found. Sign up with an address like yourname+test1@gmail.com (client) or yourname+op1@gmail.com (operator) and it shows up here.</p>') +
        '<div id="dbTestMsg" role="alert" style="display:none;color:#F2776A;font-size:0.82rem;margin-top:0.5rem"></div>' +
        '<p style="font-size:0.78rem;color:#A89887;margin:0.6rem 0 0">Test accounts only see test jobs, and nothing they do counts on HQ. A bar at the bottom brings you back here.</p>';
      Array.prototype.forEach.call(box.querySelectorAll('[data-test-id]'), function (b) {
        b.addEventListener('click', function () { open(b.getAttribute('data-test-id'), b); });
      });
      box.style.display = '';
    }).catch(function () {});
  }

  // While signed in to a test account: the bar at the bottom
  function bar() {
    var o = get(OWNER);
    if (!o) return;
    if (o === get(KEY)) { put(OWNER, null); return; }
    call('/api/me').then(function (me) {
      if (!me || !TEST.test(me.email || '')) { put(OWNER, null); return; } // signed in some other way since: forget it
      if (document.getElementById('dbTestBar')) return;
      var who = String(me.company_name || '').trim() || String(me.name || '').trim() || me.email;
      var b = document.createElement('div');
      b.id = 'dbTestBar';
      b.setAttribute('role', 'region'); b.setAttribute('aria-label', 'Test account');
      b.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:5000;background:#E8892A;color:#1C1410;font:600 0.88rem/1.3 Barlow,Arial,sans-serif;padding:0.6rem 0.9rem;display:flex;gap:0.6rem;align-items:center;justify-content:space-between;box-shadow:0 -2px 10px rgba(0,0,0,0.35)';
      b.innerHTML = '<span>🧪 Test ' + (me.role === 'operator' ? 'operator' : 'client') + ': ' + esc(who) + '</span>' +
        '<button type="button" id="dbTestBack" style="background:#1C1410;color:#F2EDE6;border:0;border-radius:3px;padding:0.5rem 0.8rem;font:700 0.85rem Barlow,Arial,sans-serif;cursor:pointer;white-space:nowrap">Back to my owner account</button>';
      document.body.appendChild(b);
      document.body.style.paddingBottom = (b.offsetHeight + 8) + 'px';
      b.querySelector('#dbTestBack').addEventListener('click', back);
    }).catch(function () {});
  }

  window.DirtOwner = { fill: fill, open: open, back: back };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bar); else bar();
})();
