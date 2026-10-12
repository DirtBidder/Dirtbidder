// View-only admin login (e.g. DirtBidder's lawyer): shows a banner, hides every button that changes something,
// and keeps the login on the admin pages. The server refuses any change from this login anyway, and only ever
// sends it test data; this just keeps the pages from offering buttons that would be refused.
(function () {
  var API = 'https://dirtbidder-backend-production.up.railway.app';
  var token = null;
  try { token = localStorage.getItem('dirtbidder_token'); } catch (e) {}
  if (!token) return;
  fetch(API + '/api/me', { headers: { Authorization: 'Bearer ' + token } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (me) {
      if (!me || !me.is_viewer) return;
      var go = function () {
        document.body.classList.add('view-only');
        var css = document.createElement('style');
        css.textContent =
          'body.view-only .btn, body.view-only button.btn, body.view-only form, body.view-only label.toggle,' +
          'body.view-only #reportBtn, body.view-only .todo input[type=checkbox], body.view-only a.back,' +
          'body.view-only .wrap a[onclick], body.view-only .todo button { display: none !important; }' +
          'body.view-only .tabs .tab, body.view-only a.btn[href] { display: inline-flex !important; }' +
          '.vo-banner { background: #2A1F17; border: 1px solid rgba(232,137,42,0.5); color: #F2EDE6; border-radius: 10px;' +
          ' padding: 0.8rem 1rem; margin: 1rem 1.25rem 0; font-size: 0.92rem; line-height: 1.45; }' +
          '.vo-banner b { color: #E8892A; } .vo-banner a { color: #C4A882; }';
        document.head.appendChild(css);
        var b = document.createElement('div');
        b.className = 'vo-banner';
        b.setAttribute('role', 'note');
        b.innerHTML = '<b>View-only login.</b> You can open every admin screen, but nothing can be changed from this login. ' +
          'Only test accounts and sample jobs are shown, so no real customer’s information appears here. ' +
          '<a href="dirtbidder-admin.html">Admin</a> · <a href="dirtbidder-hq.html">HQ</a> · ' +
          '<a href="#" id="voSignOut">Sign out</a>';
        var top = document.querySelector('.top');
        if (top && top.parentNode) top.parentNode.insertBefore(b, top.nextSibling); else document.body.insertBefore(b, document.body.firstChild);
        document.getElementById('voSignOut').addEventListener('click', function (e) {
          e.preventDefault();
          try { localStorage.removeItem('dirtbidder_token'); } catch (x) {}
          location.href = 'dirtbidder-login.html';
        });
        // The logo goes back to the admin page instead of a dashboard
        var logo = document.querySelector('a.logo');
        if (logo) logo.href = 'dirtbidder-admin.html';
      };
      if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
    })
    .catch(function () {});
})();
