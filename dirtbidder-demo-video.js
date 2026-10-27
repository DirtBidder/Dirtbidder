// "How it works" demo videos (screen recordings with captions, no sound).
// Any element with data-demo="client" or data-demo="operator" opens that video full screen when tapped.
// It only loads and plays when tapped, so the page stays fast.
(function () {
  var VIDS = {
    client: { src: '/videos/dirtbidder-client-demo.mp4', poster: '/videos/dirtbidder-client-poster.jpg', label: 'How DirtBidder works for landowners' },
    operator: { src: '/videos/dirtbidder-operator-demo.mp4', poster: '/videos/dirtbidder-operator-poster.jpg', label: 'How DirtBidder works for operators' }
  };
  var box = null, lastFocus = null;

  function close() {
    if (!box) return;
    var v = box.querySelector('video'); if (v) { v.pause(); v.removeAttribute('src'); v.load(); }
    box.remove(); box = null;
    document.removeEventListener('keydown', onKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function onKey(e) { if (e.key === 'Escape') close(); }

  function open(kind) {
    var d = VIDS[kind]; if (!d) return;
    close();
    lastFocus = document.activeElement;
    box = document.createElement('div');
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', d.label);
    box.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(10,7,5,0.94);display:flex;align-items:center;justify-content:center;padding:12px';
    box.innerHTML =
      '<button type="button" aria-label="Close video" style="position:absolute;top:10px;right:12px;width:44px;height:44px;border-radius:50%;border:1px solid rgba(242,237,230,0.35);background:rgba(28,20,16,0.85);color:#F2EDE6;font-size:1.4rem;line-height:1;cursor:pointer;z-index:2">✕</button>' +
      '<video controls playsinline autoplay preload="auto" poster="' + d.poster + '" src="' + d.src + '" ' +
      'style="max-height:calc(100vh - 24px);max-height:calc(100dvh - 24px);max-width:100%;aspect-ratio:390/844;border-radius:10px;background:#1A130E;box-shadow:0 10px 40px rgba(0,0,0,0.6)"></video>';
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    box.querySelector('button').addEventListener('click', close);
    document.body.appendChild(box);
    document.addEventListener('keydown', onKey);
    box.querySelector('button').focus();
    var v = box.querySelector('video');
    var p = v.play(); if (p && p.catch) p.catch(function () {}); // if the phone blocks autoplay, the play button is there
    v.addEventListener('ended', function () { setTimeout(close, 600); });
    if (window.dbTrack) { try { dbTrack('ViewContent', { content_name: 'demo_video_' + kind }); } catch (e) {} }
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-demo]');
    if (!el) return;
    e.preventDefault();
    open(el.getAttribute('data-demo'));
  });
  window.DemoVideo = { open: open, close: close };
})();
