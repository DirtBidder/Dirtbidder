// The one house rule: a job that starts on DirtBidder is hired and paid on DirtBidder.
// Each person is asked to agree once, at the moment it starts to matter:
//   an operator before placing or changing a bid, a client before sharing a job's location.
// The server keeps the date they agreed and refuses those two actions until they have.
//
// Use:  if (!(await DirtRules.ensure('operator'))) return;   // or 'client'
(function () {
  var API = 'https://dirtbidder-backend-production.up.railway.app';
  var agreed = null; // null = not checked yet this page load

  var WORDS = {
    operator: {
      title: 'One rule before you bid',
      why: 'That’s what puts the client’s money in escrow before you move a machine, and it’s how you get paid if they go quiet.'
    },
    client: {
      title: 'One rule before you share the location',
      why: 'That’s what holds your money until the work is done right, and it’s how we can step in if something goes wrong.'
    }
  };

  function call(path, opts) {
    var token = null;
    try { token = localStorage.getItem('dirtbidder_token'); } catch (e) {}
    return fetch(API + path, Object.assign({}, opts || {}, { headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token } }))
      .then(function (res) { return res.json().catch(function () { return {}; }).then(function (d) { if (!res.ok) throw new Error(d.error || 'Something went wrong'); return d; }); });
  }

  function show(role) {
    var w = WORDS[role] || WORDS.operator;
    return new Promise(function (resolve) {
      var back = document.activeElement;
      var o = document.createElement('div');
      o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-labelledby', 'dbRulesTitle');
      o.style.cssText = 'position:fixed;inset:0;z-index:6000;background:rgba(10,7,5,0.82);display:flex;align-items:center;justify-content:center;padding:1rem;overflow:auto';
      o.innerHTML =
        '<div style="background:#2A1F17;border:1px solid rgba(232,137,42,0.35);border-radius:6px;max-width:440px;width:100%;padding:1.4rem 1.3rem;font-family:Barlow,Arial,sans-serif;color:#C4A882;line-height:1.5;margin:auto">' +
          '<div id="dbRulesTitle" style="font-family:\'Barlow Condensed\',Arial,sans-serif;font-weight:800;font-size:1.45rem;text-transform:uppercase;color:#F2EDE6;line-height:1.1;margin-bottom:0.9rem">' + w.title + '</div>' +
          '<p style="font-size:1rem;color:#F2EDE6;font-weight:600;margin:0 0 0.7rem">You met through DirtBidder, so this job is hired and paid through DirtBidder.</p>' +
          '<p style="font-size:0.93rem;margin:0 0 0.7rem">' + w.why + '</p>' +
          '<p style="font-size:0.93rem;margin:0 0 0.7rem">Talking, asking questions and looking at the site are all fine. Settle on a price in person if you like, then put that number in the bid and accept it here.</p>' +
          '<p style="font-size:0.93rem;margin:0 0 1.1rem">Jobs taken off the site get no escrow, no help in a dispute and no review. Accounts that take jobs off DirtBidder can be suspended.</p>' +
          '<div id="dbRulesErr" role="alert" style="display:none;color:#E57373;font-size:0.88rem;margin-bottom:0.7rem"></div>' +
          '<button type="button" id="dbRulesYes" style="width:100%;background:#E8892A;color:#1C1410;border:0;border-radius:3px;padding:0.85rem;font-family:\'Barlow Condensed\',Arial,sans-serif;font-weight:800;font-size:1.1rem;letter-spacing:0.05em;text-transform:uppercase;cursor:pointer">I understand</button>' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.8rem;font-size:0.88rem">' +
            '<a href="dirtbidder-how-it-works.html#rules" target="_blank" rel="noopener" style="color:#E8892A">Why we ask</a>' +
            '<button type="button" id="dbRulesNo" style="background:none;border:0;color:#8C7B6B;font:inherit;cursor:pointer;padding:0.3rem 0">Not now</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(o);
      var yes = o.querySelector('#dbRulesYes'), no = o.querySelector('#dbRulesNo'), err = o.querySelector('#dbRulesErr');
      function done(v) { document.removeEventListener('keydown', onKey, true); o.remove(); try { if (back && back.focus) back.focus(); } catch (e) {} resolve(v); }
      function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); done(false); } }
      document.addEventListener('keydown', onKey, true);
      no.onclick = function () { done(false); };
      yes.onclick = function () {
        yes.disabled = true; yes.textContent = 'Saving…'; err.style.display = 'none';
        call('/api/me/rules', { method: 'POST', body: JSON.stringify({ agree: true }) })
          .then(function () { agreed = true; done(true); })
          .catch(function (e) { yes.disabled = false; yes.textContent = 'I understand'; err.textContent = (e && e.message) || 'That didn’t save. Try again.'; err.style.display = ''; });
      };
      yes.focus();
    });
  }

  window.DirtRules = {
    // true once this person is known to have agreed (no network call)
    ok: function () { return agreed === true; },
    // Resolves true if they have agreed (now or before), false if they backed out
    ensure: function (role) {
      if (agreed === true) return Promise.resolve(true);
      return call('/api/me').then(function (me) {
        // Only an explicit "not yet" asks. Anything else lets the action through and the server has the final say.
        if (!me || me.rules_ack !== false) { agreed = !!(me && me.rules_ack === true); return true; }
        return show(role || me.role);
      }).catch(function () { return true; });
    }
  };
})();
