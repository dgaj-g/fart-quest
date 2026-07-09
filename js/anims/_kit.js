// FART QUEST — js/anims/_kit.js
// Shared toolkit for Scout Report helper animations ("anim" lesson cards).
// Every anim module builds on these so the hard-won interaction rules live in
// ONE place: lag-free pointer drags, rAF tweens that survive throttling,
// synthesised SFX that never outlive a hidden tab, stacking toasts.
//
// Contract for anim modules (js/anims/<topicId>.js):
//   export default {
//     id: '<topicId>',
//     title: 'DISPLAY NAME',       // shown on the lesson card chip
//     mount(host, ctx) { ... return cleanupFn }
//   }
// ctx = { audio, sfx, complete() }.
//   audio    — the app audio module (vo/sfx/music); use sparingly.
//   sfx      — the shared synth below (tick/tock/drop/pop/sparkle/win/ui/nudge/blip).
//   complete() — call once when the child has finished the core interaction;
//                it makes CARRY ON pulse. The button is NEVER gated on it.
// Rules every anim must follow (learned the hard way on decimals-x10):
//   1. NO transform transitions while a pointer drag is live — track 1:1.
//   2. Feedback text that quotes numbers/states must only appear when the
//      board is showing exactly that state.
//   3. Repeat-tap controls must act on where the UI is HEADING, not where the
//      last animation settled.
//   4. Cleanup must cancel every rAF/timeout it created.

export function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

// ---------- synthesised SFX (singleton, shared by all anims) ----------
let sctx = null;
let sfxOn = true;
let visibilityHooked = false;

function ensureCtx() {
  if (!sctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) sctx = new AC();
    if (sctx && !visibilityHooked) {
      visibilityHooked = true;
      // sound must never outlive the page being visible
      document.addEventListener('visibilitychange', () => {
        if (!sctx) return;
        if (document.hidden) sctx.suspend();
        else if (sfxOn) sctx.resume();
      });
    }
  }
  if (sctx && sctx.state === 'suspended' && !document.hidden) sctx.resume();
  return sctx;
}

function env(g, t0, a, hold, rel, peak) {
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + a);
  g.gain.setValueAtTime(peak, t0 + a + hold);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + hold + rel);
}

function tone(type, f0, f1, t0, dur, peak, filterHz) {
  const o = sctx.createOscillator(); const g = sctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t0);
  if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  env(g, t0, 0.004, dur * 0.3, dur * 0.7, peak);
  let node = o;
  if (filterHz) {
    const fl = sctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = filterHz;
    o.connect(fl); node = fl;
  }
  node.connect(g); g.connect(sctx.destination);
  o.start(t0); o.stop(t0 + dur + 0.15);
}

function noise(t0, dur, peak, hz) {
  const n = Math.max(1, Math.floor(sctx.sampleRate * dur));
  const buf = sctx.createBuffer(1, n, sctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const src = sctx.createBufferSource(); src.buffer = buf;
  const fl = sctx.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = hz; fl.Q.value = 1.2;
  const g = sctx.createGain(); env(g, t0, 0.001, dur * 0.2, dur * 0.8, peak);
  src.connect(fl); fl.connect(g); g.connect(sctx.destination);
  src.start(t0);
}

function play(fn) {
  if (!sfxOn || document.hidden) return;
  if (!ensureCtx()) return;
  try { fn(sctx.currentTime); } catch (e) { /* sound must never throw */ }
}

export const sfx = {
  setEnabled(v) { sfxOn = !!v; if (sctx) { if (v && !document.hidden) sctx.resume(); else sctx.suspend(); } },
  ensure: ensureCtx,
  /* stepping ratchet, rising (e.g. multiply / move up / add) */
  tick(n = 0) { play((t) => { noise(t, 0.02, 0.12, 2600); const f = 760 * Math.pow(1.14, Math.max(0, Math.min(n, 5))); tone('triangle', f, f * 1.08, t, 0.055, 0.22); }); },
  /* stepping ratchet, falling (e.g. divide / move down / remove) */
  tock(n = 0) { play((t) => { noise(t, 0.02, 0.09, 900); const f = 430 * Math.pow(0.86, Math.max(0, Math.min(n, 5))); tone('sine', f, f * 0.92, t, 0.09, 0.26); }); },
  settle() { play((t) => tone('triangle', 300, 280, t, 0.04, 0.08)); },
  drop() { play((t) => { tone('sine', 640, 150, t, 0.13, 0.16); tone('sine', 85, 70, t + 0.13, 0.1, 0.3, 300); tone('sine', 210, 330, t + 0.24, 0.07, 0.14); tone('sine', 330, 250, t + 0.32, 0.07, 0.1); }); },
  pop() { play((t) => { noise(t, 0.03, 0.2, 1500); tone('sine', 380, 620, t, 0.09, 0.12); }); },
  sparkle() { play((t) => [660, 830, 1050].forEach((f, i) => tone('sine', f, f * 1.02, t + i * 0.07, 0.12, 0.13))); },
  nudge() { play((t) => { tone('sine', 330, 320, t, 0.1, 0.1); tone('sine', 285, 275, t + 0.12, 0.13, 0.1); }); },
  win() { play((t) => { tone('square', 150, 88, t, 0.24, 0.12, 420); [523, 659, 784, 1047].forEach((f, i) => tone('triangle', f, f, t + 0.28 + i * 0.085, 0.14, 0.16)); }); },
  ui() { play((t) => tone('sine', 500, 520, t, 0.05, 0.08)); },
  /* one short pip at a chosen pitch — for anims that map pitch to meaning */
  blip(freq = 600, dur = 0.08, peak = 0.15) { play((t) => tone('sine', freq, freq * 1.02, t, dur, peak)); },
  thud() { play((t) => tone('sine', 90, 70, t, 0.12, 0.3, 300)); },
  whoosh() { play((t) => noise(t, 0.18, 0.14, 700)); },
};

// ---------- tween that survives rAF throttling ----------
// Returns a cancel function. `done` always fires exactly once (rAF end or the
// setTimeout guard) unless cancelled first — hidden tabs can throttle rAF to
// zero, and an animation that never settles wedges whatever waits on it.
export function tween(apply, from, to, dur, done) {
  let raf = null; let guard = null; let settled = false;
  const finish = () => {
    if (settled) return;
    settled = true;
    if (raf) cancelAnimationFrame(raf);
    if (guard) clearTimeout(guard);
    apply(to);
    if (done) done();
  };
  if (Math.abs(to - from) < 0.5) { finish(); return () => { settled = true; }; }
  const t0 = performance.now();
  const step = (now) => {
    if (settled) return;
    const k = Math.min(1, (now - t0) / dur);
    apply(from + (to - from) * (1 - Math.pow(1 - k, 3)));
    if (k < 1) raf = requestAnimationFrame(step);
    else finish();
  };
  raf = requestAnimationFrame(step);
  guard = setTimeout(finish, dur + 250);
  return () => { // cancel
    settled = true;
    if (raf) cancelAnimationFrame(raf);
    if (guard) clearTimeout(guard);
  };
}

// ---------- pointer drag discipline ----------
// makeDrag(hitEl, { enabled?, onStart(e), onMove(dx, dy, e), onEnd(dx, dy, e) })
// Single-pointer, captures, never transitions mid-drag (that's the caller's
// job to honour), preventDefault to stop scroll fights. Returns { destroy }.
export function makeDrag(hit, opts) {
  let drag = null;
  const down = (e) => {
    if (opts.enabled && !opts.enabled()) return;
    if (drag) return;
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY };
    try { hit.setPointerCapture(e.pointerId); } catch (err) { /* synthetic pointers */ }
    if (opts.onStart) opts.onStart(e);
    e.preventDefault();
  };
  const move = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (opts.onMove) opts.onMove(e.clientX - drag.x0, e.clientY - drag.y0, e);
  };
  const up = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x0; const dy = e.clientY - drag.y0;
    drag = null;
    if (opts.onEnd) opts.onEnd(dx, dy, e);
  };
  hit.addEventListener('pointerdown', down);
  hit.addEventListener('pointermove', move);
  hit.addEventListener('pointerup', up);
  hit.addEventListener('pointercancel', up);
  return {
    dragging: () => !!drag,
    abort() { drag = null; },
    destroy() {
      hit.removeEventListener('pointerdown', down);
      hit.removeEventListener('pointermove', move);
      hit.removeEventListener('pointerup', up);
      hit.removeEventListener('pointercancel', up);
    },
  };
}

// ---------- stacking toasts (scoped to an anim's own stage) ----------
export function toast(stage, msg, ms = 2600) {
  const live = stage.querySelectorAll('.anim-toast').length;
  const t = el('div', 'anim-toast', msg);
  t.style.top = (8 + live * 44) + 'px';
  stage.appendChild(t);
  setTimeout(() => t.remove(), ms);
}

// ---------- tiny celebrations ----------
export function sparkleBurst(stage, x, y, count = 10) {
  for (let i = 0; i < count; i++) {
    const s = el('span', 'anim-sparkler', ['✨', '⭐', '💫'][i % 3]);
    s.style.left = x + 'px'; s.style.top = y + 'px';
    s.style.setProperty('--dx', (Math.cos((i / count) * 6.283) * 70) + 'px');
    s.style.setProperty('--dy', (Math.sin((i / count) * 6.283) * 70) + 'px');
    stage.appendChild(s);
    setTimeout(() => s.remove(), 950);
  }
}

export function party(stage, count = 18) {
  const EMO = ['💨', '✨', '⭐', '🎉', '💚'];
  const r = stage.getBoundingClientRect();
  for (let i = 0; i < count; i++) {
    const s = el('span', 'anim-particle', EMO[i % EMO.length]);
    s.style.left = (Math.random() * Math.max(60, r.width - 30)) + 'px';
    s.style.top = '-30px';
    s.style.setProperty('--dx', ((Math.random() - 0.5) * 120) + 'px');
    s.style.setProperty('--rot', ((Math.random() - 0.5) * 620) + 'deg');
    s.style.setProperty('--dur', (1.2 + Math.random() * 1.1) + 's');
    s.style.setProperty('--fall', (r.height + 60) + 'px');
    stage.appendChild(s);
    setTimeout(() => s.remove(), 2500);
  }
}

// ---------- in-card explainer bubble (replaces full-screen popups) ----------
// Shows a dismissible panel INSIDE the anim stage. Returns a promise that
// resolves when dismissed. Only one at a time per stage; extra calls queue.
const bubbleQueues = new WeakMap();
export function bubble(stage, { title, text, img }) {
  let q = bubbleQueues.get(stage);
  if (!q) { q = { open: false, items: [] }; bubbleQueues.set(stage, q); }
  return new Promise((resolve) => {
    q.items.push({ title, text, img, resolve });
    pump(stage, q);
  });
}
function pump(stage, q) {
  if (q.open || !q.items.length) return;
  if (!stage.isConnected) { q.items.forEach((i) => i.resolve()); q.items.length = 0; return; }
  q.open = true;
  const { title, text, img, resolve } = q.items.shift();
  const ov = el('div', 'anim-bubble-veil');
  const b = el('div', 'anim-bubble',
    (img ? `<img src="${img}" alt="">` : '') +
    `<div class="ab-body"><div class="ab-title">${title}</div><div class="ab-text">${text}</div>` +
    '<button class="btn btn-gold ab-btn">GOT IT! 💨</button></div>');
  ov.appendChild(b);
  stage.appendChild(ov);
  ov.querySelector('.ab-btn').addEventListener('click', () => {
    sfx.ui();
    ov.remove();
    q.open = false;
    resolve();
    pump(stage, q);
  });
}

export default { el, sfx, tween, makeDrag, toast, sparkleBurst, party, bubble };
