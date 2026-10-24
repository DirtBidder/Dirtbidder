// Operators confirm once that Iowa lien notices and deadlines are their own job, not DirtBidder's.
// New operators tick this box on the sign-up form. Operators who signed up before it existed are asked here,
// on their dashboard, until they tap "I understand". The server keeps the date they confirmed.
// DirtBidder never reminds anyone about a particular job's lien deadline (the Terms say so).
(function () {
  var API = 'https://dirtbidder-backend-production.up.railway.app';

  function call(path, opts) {
    var token = null;
    try { token = localStorage.getItem('dirtbidder_token'); } catch (e) {}
    if (!token) return Promise.reject(new Error('signed out'));
    return fetch(API + path, Object.assign({}, opts || {}, { headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token } }))
      .then(function (res) { return res.json().catch(function () { return {}; }).then(function (d) { if (!res.ok) throw new Error(d.error || 'Something went wrong'); return d; }); });
  }

  function show() {
    if (document.getElementById('dbLienBox') || document.getElementById('dbTermsBox')) return false;
    var o = document.createElement('div');
    o.id = 'dbLienBox';
    o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-labelledby', 'dbLienTitle');
    o.style.cssText = 'position:fixed;inset:0;z-index:5800;background:rgba(10,7,5,0.82);display:flex;align-items:center;justify-content:center;padding:1rem;overflow:auto';
    o.innerHTML =
      '<div style="background:#2A1F17;border:1px solid rgba(232,137,42,0.35);border-radius:6px;max-width:440px;width:100%;padding:1.4rem 1.3rem;font-family:Barlow,Arial,sans-serif;color:#C4A882;line-height:1.5;margin:auto">' +
        '<div id="dbLienTitle" style="font-family:\'Barlow Condensed\',Arial,sans-serif;font-weight:800;font-size:1.45rem;text-transform:uppercase;color:#F2EDE6;line-height:1.1;margin-bottom:0.7rem">Protect your lien rights</div>' +
        '<p style="font-size:0.93rem;margin:0 0 0.7rem">In Iowa you can lose your right to a lien on day one. On a job at someone’s home, post a notice of commencement to the state registry within 10 days of starting, and give the owner the written notice the law requires.</p>' +
        '<p style="font-size:0.93rem;margin:0 0 0.9rem">DirtBidder doesn’t file these or track your deadlines. <a href="dirtbidder-lien-notice.html" target="_blank" rel="noopener" style="color:#E8892A">Read the 2-minute guide</a>.</p>' +
        '<div id="dbLienErr" role="alert" style="display:none;color:#E57373;font-size:0.88rem;margin-bottom:0.7rem"></div>' +
        '<button type="button" id="dbLienYes" style="width:100%;background:#E8892A;color:#1C1410;border:0;border-radius:3px;padding:0.85rem 0.6rem;font-family:\'Barlow Condensed\',Arial,sans-serif;font-weight:800;font-size:1rem;letter-spacing:0.03em;text-transform:uppercase;cursor:pointer;line-height:1.25">I understand lien notices and deadlines are my responsibility</button>' +
        '<div style="text-align:right;margin-top:0.8rem;font-size:0.88rem"><button type="button" id="dbLienNo" style="background:none;border:0;color:#A89887;font:inherit;cursor:pointer;padding:0.3rem 0">Not now</button></div>' +
      '</div>';
    document.body.appendChild(o);
    var yes = o.querySelector('#dbLienYes'), no = o.querySelector('#dbLienNo'), err = o.querySelector('#dbLienErr');
    function close() { document.removeEventListener('keydown', onKey, true); o.remove(); }
    function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }
    document.addEventListener('keydown', onKey, true);
    no.onclick = close; // asked again next visit
    yes.onclick = function () {
      yes.disabled = true; var label = yes.textContent; yes.textContent = 'Saving…'; err.style.display = 'none';
      call('/api/me/lien', { method: 'POST', body: JSON.stringify({ agree: true }) })
        .then(close)
        .catch(function (e) { yes.disabled = false; yes.textContent = label; err.textContent = (e && e.message) || 'That didn’t save. Try again.'; err.style.display = ''; });
    };
    yes.focus();
    return true;
  }

  function check(tries) {
    call('/api/me').then(function (me) {
      if (!me || me.role !== 'operator' || me.lien_ack !== false || me.is_viewer) return;
      // The Terms box goes first; ask about liens once it's closed
      (function wait(n) {
        if (document.getElementById('dbTermsBox')) { if (n < 600) setTimeout(function () { wait(n + 1); }, 1000); return; }
        show();
      })(0);
    }).catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(check, 1500); }); else setTimeout(check, 1500);
})();
