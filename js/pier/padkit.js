// FART QUEST — js/pier/padkit.js (HUB/CHASSIS agent)
// WHIFF-END PIER shared kit, three pieces:
//   1. makeNumpad(host, {onSubmit(valueString)}) -> {clear(),setEnabled(bool),destroy()}
//      Digits 0-9, backspace, GO. Used by gunge/ghost/teacups/tank (splat is
//      tap-based, no numpad). No minus, no decimal — every Pier answer is a
//      positive whole number (max 144), so the keyboard can't even type a
//      shape of answer the fact engine wouldn't accept. Key SIZE is CSS
//      (css/pier.css .pier-numpad-key, clamp()-driven — see that file's
//      header contract block), not this factory's concern.
//   2. mountChassis(container, opts) -> {hud,stage,dock,overlay,backBtn}
//      THE LAYOUT LAW skeleton (docs/PIER_REWORK.md §1) — see its own doc
//      comment below. This is the ONE place hud/stage/dock get built so the
//      hub and every machine agent's mode produce the same shape.
//   3. buildMuteButton(ctx) -> the pier's always-visible 🔊/🔇 toggle (§4).
// Plus markOnScreen()/isOnScreen(): the tiny registry that lets pier.js's
// caption bar (pier.say()) know when a welcome/end card is ALREADY showing a
// line's text, so it never echoes it (§2/#6) — see mountChassis's `overlay()`
// doc comment for how a mode opts in.

import { el, sfx } from '../anims/_kit.js';

/* =====================================================================
 * 1. NUMPAD
 * ===================================================================== */

const MAX_DIGITS = 3; // every Pier answer is <=144 — three digits is always headroom enough

const KEY_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['⌫', '0', 'GO'],
];

/**
 * makeNumpad(host, opts)
 *   host          — element to append the numpad into
 *   opts.onSubmit — called with the typed value as a STRING when GO is
 *                   pressed on a non-empty entry. The numpad does not clear
 *                   itself after submit — the caller decides (right away for
 *                   a "locks in and moves on" mode, or after showing feedback).
 * returns { clear(), setEnabled(bool), destroy() }
 */
export function makeNumpad(host, opts) {
  const o = opts || {};
  let value = '';
  let enabled = true;
  let alive = true;

  const wrap = el('div', 'pier-numpad');
  const readout = el('div', 'pier-numpad-readout');
  const rval = el('span', 'pnr-value');
  const rcursor = el('span', 'pnr-cursor');
  readout.append(rval, rcursor);
  const grid = el('div', 'pier-numpad-grid');
  wrap.append(readout, grid);

  function paint() {
    rval.textContent = value;
    rcursor.style.display = value ? 'none' : '';
  }

  function pressDigit(d) {
    if (!enabled) return;
    if (value.length >= MAX_DIGITS) { sfx.nudge(); return; }
    value += d;
    sfx.ui();
    paint();
  }
  function pressBack() {
    if (!enabled) return;
    if (!value) { sfx.nudge(); return; }
    value = value.slice(0, -1);
    sfx.tock(1);
    paint();
  }
  function pressGo() {
    if (!enabled) return;
    if (!value) { sfx.nudge(); return; }
    const submitted = value;
    sfx.ui();
    if (o.onSubmit) o.onSubmit(submitted);
  }

  KEY_ROWS.forEach((row) => {
    row.forEach((label) => {
      const isBack = label === '⌫';
      const isGo = label === 'GO';
      const btn = el('button', 'pier-numpad-key' + (isGo ? ' pnk-go' : isBack ? ' pnk-back' : ''), label);
      btn.type = 'button';
      btn.addEventListener('click', () => {
        if (isBack) pressBack();
        else if (isGo) pressGo();
        else pressDigit(label);
      });
      grid.appendChild(btn);
    });
  });

  paint();
  host.appendChild(wrap);

  return {
    clear() { value = ''; paint(); },
    setEnabled(v) {
      enabled = !!v;
      wrap.classList.toggle('pnp-disabled', !enabled);
    },
    destroy() {
      if (!alive) return;
      alive = false;
      wrap.remove();
    },
  };
}

/* =====================================================================
 * 2. ON-SCREEN TEXT REGISTRY — caption-bar dedupe (contract §2/#6)
 * ===================================================================== */
// mountChassis's overlay() registers whatever line a welcome/end/ceremony
// card is CURRENTLY showing verbatim (opts.speaks); pier.js's caption bar
// consults isOnScreen() before rendering a bubble for that same text, so the
// v1 bug (Nana's welcome line printed on the card AND the caption bar at
// once) can't recur for any mode that adopts the overlay() pattern. A simple
// Map (not a single slot) so more than one overlay can theoretically be
// "speaking" without one's close() clobbering another's registration.
const onScreenTexts = new Map();
let onScreenSeq = 0;

/** markOnScreen(text) -> unmark(). Call unmark() when that text leaves the screen. */
export function markOnScreen(text) {
  if (!text) return () => {};
  const token = (onScreenSeq += 1);
  onScreenTexts.set(token, text);
  return () => { onScreenTexts.delete(token); };
}

/** isOnScreen(text) -> true if some live overlay is currently showing this exact text. */
export function isOnScreen(text) {
  if (!text) return false;
  for (const t of onScreenTexts.values()) { if (t === text) return true; }
  return false;
}

/* =====================================================================
 * 3. mountChassis — THE LAYOUT LAW skeleton (docs/PIER_REWORK.md §1)
 * ===================================================================== */
/**
 * mountChassis(container, opts) -> { hud, stage, dock, overlayHost, overlay, backBtn }
 *
 * Builds the mandatory `[hud:flex:none][stage:flex:1;min-height:0][dock:flex:
 * none]` column as direct children of `container`. `container` must already
 * be the flex column itself — css/pier.css pre-wires this for BOTH the
 * elements this file's callers use: `.pier-screen` (the hub calls
 * mountChassis on it directly) and `.pier-mode-host` (a mode's own
 * `mount(host, ctx, pier)` may call mountChassis(host, ...) to get the same
 * skeleton for its machine — entirely opt-in per mode; see css/pier.css's
 * header contract block for the class names each slot needs).
 *
 * opts:
 *   onBack(fn)   — optional. Adds a "← <backLabel>" ghost button (>=60px,
 *                  css .pier-hud-back) to `hud`, wired to this handler. The
 *                  hub uses this for "← MAP"; a mode rebuilt against this
 *                  helper would use it for its mandatory "← PIER" (PIER_SPEC
 *                  §4). NB the pier's MUTE button is NOT built here — it is
 *                  always rendered once by js/screens/pier.js itself
 *                  (position:fixed, screen-level) so it is guaranteed present
 *                  on every route regardless of whether a given mode has been
 *                  rebuilt against this chassis yet (§4 "always visible").
 *   backLabel    — button text, default '← PIER'.
 *   hudClass / stageClass / dockClass — extra classes appended to each slot,
 *                  for a mode's own hooks (e.g. a stage-specific background).
 *
 * Returns `overlay(contentEl, opts2)` — THE contract's screen-level overlay
 * (§1.4): a `position:fixed; inset:0` veil holding a card CENTRED with the
 * `translate:` property (never `transform:` — that's how fq-v11's coach-card
 * bug pinned a transform forever via animation-fill-mode:both; see
 * css/pier.css for the actual rule). The card gets `max-height:calc(100dvh -
 * 32px); overflow-y:auto`. `contentEl` is appended inside the card verbatim
 * — build whatever welcome/end/ceremony markup the mode needs and hand it in.
 *   overlay(contentEl, { cardClass, veilClass, speaks }) -> { el, card, close() }
 * Pass `speaks: {id, text}` (a content.js line entry) when contentEl is
 * ALREADY showing that line's text verbatim on the card — this registers it
 * via markOnScreen() so pier.say() knows not to echo it in the caption bar
 * (§2/#6). close() un-registers it and removes the overlay.
 */
export function mountChassis(container, opts) {
  const o = opts || {};
  container.classList.add('pier-chassis');

  const hud = el('div', 'pier-hud' + (o.hudClass ? ' ' + o.hudClass : ''));
  const stage = el('div', 'pier-stage' + (o.stageClass ? ' ' + o.stageClass : ''));
  const dock = el('div', 'pier-dock' + (o.dockClass ? ' ' + o.dockClass : ''));
  container.append(hud, stage, dock);

  let backBtn = null;
  if (o.onBack) {
    backBtn = el('button', 'btn btn-ghost pier-hud-back', o.backLabel || '← PIER');
    backBtn.type = 'button';
    backBtn.addEventListener('click', o.onBack);
    hud.append(backBtn);
  }

  // Overlay host is a DIRECT sibling of hud/stage/dock (a child of `container`
  // itself), never nested inside `stage` — belt-and-braces against clipping,
  // on top of `position:fixed` already escaping ancestor overflow (see
  // css/pier.css header comment for the full reasoning, incl. why the
  // .pier-screen enter-pop animation's pinned `transform` doesn't break this).
  const overlayHost = el('div', 'pier-overlay-host');
  container.append(overlayHost);

  function overlay(contentEl, opts2) {
    const o2 = opts2 || {};
    const veil = el('div', 'pier-overlay-veil' + (o2.veilClass ? ' ' + o2.veilClass : ''));
    const card = el('div', 'pier-overlay-card' + (o2.cardClass ? ' ' + o2.cardClass : ''));
    card.append(contentEl);
    veil.append(card);
    overlayHost.append(veil);
    const unmark = (o2.speaks && o2.speaks.text) ? markOnScreen(o2.speaks.text) : () => {};
    let closed = false;
    function close() {
      if (closed) return;
      closed = true;
      unmark();
      veil.remove();
    }
    return { el: veil, card, close };
  }

  return {
    hud, stage, dock, overlayHost, overlay, backBtn,
  };
}

/* =====================================================================
 * 4. MUTE BUTTON — contract §4
 * ===================================================================== */
/**
 * buildMuteButton(ctx) -> button element, already wired.
 * Flips the app's REAL music setting (`ctx.prefs.musicOn`) — the EXACT same
 * flag js/screens/settings.js's Music toggle uses — persisting through the
 * same `ctx.db.put('settings','prefs', ctx.prefs)` call and re-deriving all
 * three volumes via `ctx.audio.setVolumes(...)` exactly as settings.js's
 * persist() does. This is deliberately not a parallel/invented setting.
 * Silences immediately: setVolumes() sets the live <audio> element's
 * `.volume` synchronously (js/audio.js applyMusicVolume()) — no fade, no
 * awaited network round-trip gates the mute itself (persistence is
 * best-effort/fire-and-forget after).
 */
export function buildMuteButton(ctx) {
  const btn = el('button', 'btn btn-ghost pier-mute-btn');
  btn.type = 'button';
  const isOn = () => ctx.prefs.musicOn !== false;
  function paint() {
    const on = isOn();
    btn.textContent = on ? '🔊' : '🔇';
    btn.setAttribute('aria-label', on ? 'Mute pier music' : 'Unmute pier music');
    btn.setAttribute('aria-pressed', String(!on));
    btn.classList.toggle('is-muted', !on);
  }
  paint();
  btn.addEventListener('click', () => {
    ctx.prefs.musicOn = !isOn();
    paint();
    try {
      ctx.audio.setVolumes({
        music: ctx.prefs.musicOn ? ctx.prefs.music : 0,
        sfx: ctx.prefs.sfxOn ? ctx.prefs.sfx : 0,
        vo: ctx.prefs.voOn ? ctx.prefs.vo : 0,
      });
    } catch (e) { /* audio must never throw */ }
    try { ctx.audio.sfx('click'); } catch (e) { /* never throw */ }
    Promise.resolve(ctx.db.put('settings', 'prefs', ctx.prefs)).catch(() => {
      /* best-effort persistence — the toggle already reflects reality on screen */
    });
  });
  return btn;
}

export default {
  makeNumpad, mountChassis, buildMuteButton, markOnScreen, isOnScreen,
};
