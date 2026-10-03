// Account Settings panel shared by the client and operator dashboards.
// Renders into <div id="settingsCard">: edit name / phone / company, change password.
(function () {
  const BASE = 'https://dirtbidder-backend-production.up.railway.app';
  const KEY = 'dirtbidder_token';
  const box = document.getElementById('settingsCard');
  if (!box) return;

  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const call = async (path, opts = {}) => {
    const res = await fetch(BASE + path, { ...opts, headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem(KEY) } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Something went wrong');
    return data;
  };

  const css = `
    #settingsCard .st-sec{padding:1.25rem 1.5rem;border-bottom:1px solid rgba(196,168,130,0.1)}
    #settingsCard .st-sec:last-child{border-bottom:none}
    #settingsCard .st-h{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--chalk);margin-bottom:1rem}
    #settingsCard label{display:block;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--dust);margin-bottom:0.35rem}
    #settingsCard input{width:100%;max-width:420px;background:var(--clay);border:1.5px solid rgba(196,168,130,0.18);color:var(--chalk);border-radius:3px;padding:0.7rem 0.8rem;font:inherit;font-size:1rem;margin-bottom:0.9rem;box-sizing:border-box}
    #settingsCard input:focus{outline:none;border-color:var(--amber)}
    #settingsCard input[readonly]{opacity:0.6}
    #settingsCard button{background:var(--amber);color:var(--soil);border:none;border-radius:3px;padding:0.7rem 1.3rem;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:0.9rem;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer}
    #settingsCard button:disabled{opacity:0.6}
    #settingsCard .st-msg{font-size:0.85rem;margin-top:0.6rem;min-height:1.1em}
    #settingsCard label.st-check{font-family:inherit;font-weight:500;display:flex;align-items:center;gap:0.6rem;cursor:pointer;font-size:0.95rem;color:var(--chalk);text-transform:none;letter-spacing:0;margin:0}
    #settingsCard label.st-check input{width:20px;height:20px;flex:none;margin:0;accent-color:var(--amber)}
    #settingsCard .st-hint{font-size:0.8rem;color:var(--stone);margin:-0.6rem 0 0.9rem}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function msg(id, text, ok) {
    const el = document.getElementById(id);
    el.textContent = text; el.style.color = ok ? 'var(--success)' : 'var(--error)';
  }

  function render(me) {
    const isOp = me.role === 'operator';
    box.innerHTML = `
      <div class="st-sec">
        <div class="st-h">Your Info</div>
        <label for="stName">Your name</label><input id="stName" value="${esc(me.name)}" autocomplete="name">
        <label for="stCompany">${isOp ? 'Company name' : 'Company name (optional)'}</label><input id="stCompany" value="${esc(me.company_name)}" autocomplete="organization">
        ${isOp ? '<div class="st-hint">Clients see this name on your bids.</div>' : ''}
        <label for="stPhone">Phone</label><input id="stPhone" type="tel" value="${esc(me.phone)}" autocomplete="tel" placeholder="(515) 555-1234">
        <div class="st-hint">${isOp ? 'Only shared with a client after they hire you.' : 'Only shared with the operator you hire, so they can reach you.'}</div>
        <label for="stEmail">Email</label><input id="stEmail" value="${esc(me.email)}" readonly>
        <div class="st-hint">To change your email, reply to any DirtBidder email and we’ll help.</div>
        <button id="stSave">Save Changes</button>
        <div class="st-msg" id="stInfoMsg"></div>
      </div>
      ${isOp ? `<div class="st-sec">
        <div class="st-h">Email Alerts</div>
        <label class="st-check" for="stAlerts"><input id="stAlerts" type="checkbox" ${me.profile && me.profile.jobAlerts === false ? '' : 'checked'}><span>Email me when a new job is posted</span></label>
        <div class="st-hint" style="margin-top:0.5rem">You’ll always get emails about your own bids, jobs and payments.</div>
        <div class="st-msg" id="stAlertMsg"></div>
      </div>` : ''}
      <div class="st-sec">
        <div class="st-h">Change Password</div>
        <label for="stCur">Current password</label><input id="stCur" type="password" autocomplete="current-password">
        <label for="stNew">New password</label><input id="stNew" type="password" autocomplete="new-password" placeholder="At least 8 characters">
        <label for="stNew2">Type it again</label><input id="stNew2" type="password" autocomplete="new-password">
        <button id="stPw">Update Password</button>
        <div class="st-msg" id="stPwMsg"></div>
      </div>`;

    document.getElementById('stSave').onclick = async (e) => {
      const btn = e.currentTarget; btn.disabled = true;
      try {
        const u = await call('/api/me', { method: 'PUT', body: JSON.stringify({
          name: document.getElementById('stName').value,
          company_name: document.getElementById('stCompany').value,
          phone: document.getElementById('stPhone').value
        }) });
        msg('stInfoMsg', '✓ Saved', true);
        document.querySelectorAll('.user-name, #userName, #sidebarName').forEach(el => { el.textContent = u.company_name || u.name; });
      } catch (err) { msg('stInfoMsg', err.message); }
      btn.disabled = false;
    };

    const alerts = document.getElementById('stAlerts');
    if (alerts) alerts.onchange = async () => {
      alerts.disabled = true;
      try {
        await call('/api/me/profile', { method: 'PUT', body: JSON.stringify({ jobAlerts: alerts.checked }) });
        msg('stAlertMsg', alerts.checked ? '✓ New-job emails are on' : '✓ New-job emails are off', true);
      } catch (err) { alerts.checked = !alerts.checked; msg('stAlertMsg', err.message); }
      alerts.disabled = false;
    };

    document.getElementById('stPw').onclick = async (e) => {
      const cur = document.getElementById('stCur').value, n1 = document.getElementById('stNew').value, n2 = document.getElementById('stNew2').value;
      if (n1.length < 8) return msg('stPwMsg', 'New password must be at least 8 characters.');
      if (n1 !== n2) return msg('stPwMsg', 'The two new passwords don’t match.');
      const btn = e.currentTarget; btn.disabled = true;
      try {
        await call('/api/me/password', { method: 'POST', body: JSON.stringify({ current_password: cur, new_password: n1 }) });
        ['stCur', 'stNew', 'stNew2'].forEach(id => { document.getElementById(id).value = ''; });
        msg('stPwMsg', '✓ Password updated', true);
      } catch (err) { msg('stPwMsg', err.message); }
      btn.disabled = false;
    };
  }

  call('/api/me').then(render).catch(() => {
    box.innerHTML = '<div class="st-sec" style="color:var(--stone)">Couldn’t load your settings. Refresh to try again.</div>';
  });
})();
