// FART QUEST — js/pier/modes/ghost.js (GHOST agent)
// WHIFF-END PIER — THE GHOST TRAIN, rebuilt per docs/PIER_REWORK.md §1 (THE
// LAYOUT LAW) and §3 "ghost" (feel overhaul). Mechanic (20-fact time trial vs
// your own stored PB "ghost") is UNCHANGED from docs/PIER_SPEC.md §6 — this
// pass rebuilds the chassis (mountChassis/overlay, not an in-stage veil) and
// the whole feel (parallax tunnel, physical set-dressing reactions, a real
// photo-finish, tail-tension escalation).
//
// CHASSIS: uses `pier.mountChassis(opts)` (js/pier/padkit.js, HUB/CHASSIS
// agent) for the [hud][stage][dock] skeleton and its screen-level
// `overlay(contentEl, opts)` for welcome/end/photo-finish cards — NOT an
// in-stage veil. That in-stage-veil pattern is the exact v1 bug
// (docs/PIER_REWORK.md §0: `.gh-veil` sat inside `.gh-root`, itself inside a
// clipped `.pier-mode-host`, and would have sliced controls the same way
// splat's `.splat-veil` did).
//
// FLEX-CONTAINER GAP (flagged for the chassis owner, see final report):
// `mountChassis()` adds a `.pier-chassis` class to whatever container it's
// given (padkit.js), but css/pier.css never defines `display:flex;
// flex-direction:column` for that class — only `.pier-screen.screen` (the
// HUB route) gets that treatt via a different selector. A MODE route's
// container is `.pier-mode-host`, which is styled as a flex ITEM (flex:1 1
// auto) but never declared to be a flex CONTAINER for its own children — so
// without this, `.pier-hud`/`.pier-stage`/`.pier-dock`'s `flex:none` /
// `flex:1 1 auto` rules would have zero effect (they'd just stack as plain
// blocks, stage would grow to content height, and the dock could be pushed
// off-screen — THE EXACT v1 BUG). Fixed here, scoped to this mode only, via
// the ALREADY-applied `.pier-chassis` hook (no chassis file touched):
//   `.pier-mode-host.pier-chassis { display:flex; flex-direction:column; }`
// See this file's final report for the recommendation to promote this one
// rule to css/pier.css so every future mode gets it for free.
import {
  el, sfx, tween, toast, sparkleBurst, party, injectCss,
} from '../../anims/_kit.js';
import { mulberry32, pick } from '../../rng.js';
import { makeNumpad } from '../padkit.js';
// Direct sibling import of content.js, same precedent as js/pier/modes/tank.js
// (see content.js's own header note): `pier.content` (the hub-provided kit)
// only forwards the top-level nana/announcer/dave/gremlin pools today, NOT
// `machine` (the per-mode pools this mode needs for welcome/combo/nearMiss/
// daveTheft/gremlinFlush/newPB/goldBeaten) — content.js is a pure data
// module (no DOM, no imports of its own), so importing it directly here is
// exactly as safe as pier.js's own dynamic import, with none of the
// "still-landing module" risk that import existed to guard against.
import {
  machine as PIER_MACHINE, gremlin as GREMLIN_LINES, nana as NANA_LINES,
} from '../content.js';

const LINES = PIER_MACHINE.ghost;
const TOTAL = 20;
const TAIL_GAP = 1; // stations — "within one station" per the rework brief
const TAIL_RESET_GAP = 2.5; // hysteresis so the tension beat doesn't spam

const CSS = `
/* ---------- flex-container fix for the mode-route chassis (see header) ---------- */
.pier-mode-host.pier-chassis { display: flex; flex-direction: column; }

/* ---------- HUD ---------- */
.gh-hud { row-gap: 8px; }
.gh-chip {
  font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 13px;
  background: rgba(10, 18, 48, .65); border: 2px solid rgba(255, 255, 255, .14);
  color: var(--parchment); border-radius: 999px; padding: 7px 14px;
  box-shadow: 0 4px 0 rgba(0, 0, 0, .3); white-space: nowrap;
}
.gh-clock-val { color: var(--pier-teal, #2fe3c4); }
.gh-fact-n { color: var(--pier-pink, #ff4fa3); }

/* ---------- STAGE ---------- */
.gh-stage {
  display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
  gap: clamp(3px, 1vh, 8px);
  padding: clamp(4px, 1vh, 10px) clamp(8px, 2vw, 16px) clamp(2px, .6vh, 6px);
}
.gh-stem {
  background: var(--card); color: var(--ink); border-radius: 14px;
  box-shadow: 0 4px 0 rgba(0, 0, 0, .25), 0 8px 16px rgba(0, 0, 0, .3);
  padding: clamp(3px, .9vh, 9px) clamp(14px, 3vw, 24px);
  font-weight: 700; font-size: clamp(16px, 3.4vh, 27px); text-align: center;
  min-width: 150px;
}
.gh-stem.gh-flash-correct { animation: gh-flash-green .55s ease; }
.gh-stem.gh-flash-wrong { animation: gh-shake-card .45s ease; }
@keyframes gh-flash-green {
  0% { box-shadow: 0 4px 0 rgba(0,0,0,.25), 0 8px 16px rgba(0,0,0,.3), 0 0 0 0 rgba(46,204,113,0); }
  30% { box-shadow: 0 4px 0 rgba(0,0,0,.25), 0 8px 16px rgba(0,0,0,.3), 0 0 0 8px rgba(46,204,113,.45); }
  100% { box-shadow: 0 4px 0 rgba(0,0,0,.25), 0 8px 16px rgba(0,0,0,.3), 0 0 0 0 rgba(46,204,113,0); }
}
@keyframes gh-shake-card {
  0%, 100% { translate: 0 0; } 20% { translate: -6px 0; } 40% { translate: 5px 0; }
  60% { translate: -4px 0; } 80% { translate: 3px 0; }
}

/* ---------- TUNNEL ---------- */
.gh-tunnel {
  position: relative; width: min(680px, 100%); border-radius: 20px;
  height: clamp(66px, 17vh, 148px);
  overflow: hidden; /* pure decoration inside (rule §1.5) — no controls ever live here */
  box-shadow: inset 0 0 26px rgba(0, 0, 0, .55), 0 6px 0 rgba(0, 0, 0, .3);
  background: linear-gradient(180deg, #241a3c, #140f26);
}
.gh-wall, .gh-sleepers {
  position: absolute; inset: 0; opacity: .5; pointer-events: none;
  background-repeat: repeat-x; background-size: 46px 100%;
  animation: gh-scroll 2.6s linear infinite; animation-play-state: paused;
}
.gh-tunnel.gh-running .gh-wall, .gh-tunnel.gh-running .gh-sleepers { animation-play-state: running; }
.gh-wall { background-image: repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 2px, transparent 2px 46px); animation-duration: 3.6s; }
.gh-sleepers {
  bottom: 0; top: auto; height: 26%;
  background-image: repeating-linear-gradient(90deg, rgba(0,0,0,.35) 0 8px, transparent 8px 26px);
  animation-duration: 1.4s; opacity: .8;
}
@keyframes gh-scroll { from { background-position: 0 0; } to { background-position: -46px 0; } }

.gh-lantern-glow {
  position: absolute; inset: -20% -10% auto -10%; height: 70%;
  background: radial-gradient(60% 100% at 50% 0%, rgba(255, 233, 168, .28), transparent 70%);
  animation: gh-lantern-wobble 2.2s ease-in-out infinite; pointer-events: none;
}
@keyframes gh-lantern-wobble { 0%, 100% { opacity: .55; } 50% { opacity: 1; } }
.gh-lamprow { position: absolute; top: 5px; left: 0; right: 0; display: flex; justify-content: space-around; z-index: 1; }
.gh-lamp { width: 6px; height: 6px; border-radius: 50%; background: var(--pier-bulb, #ffe9a8); box-shadow: 0 0 8px 2px var(--pier-bulb, #ffe9a8); animation: pier-bulb-flicker 1.6s ease-in-out infinite; }

.gh-web { position: absolute; font-size: 16px; opacity: .4; z-index: 1; }
.gh-web-l { top: -4px; left: -2px; } .gh-web-r { top: -4px; right: -2px; transform: scaleX(-1); }
.gh-bat { position: absolute; top: 12%; font-size: 13px; opacity: .55; pointer-events: none; z-index: 1; animation: gh-drift 8s ease-in-out infinite; }
.gh-bat-b { top: 30%; font-size: 11px; animation-duration: 11s; animation-delay: 1.8s; }
@keyframes gh-drift { 0% { left: -6%; } 50% { left: 96%; transform: translateY(-6px); } 100% { left: -6%; } }

.gh-sheet {
  position: absolute; top: 8%; right: 8%; font-size: 18px; opacity: 0; z-index: 1;
  transform-origin: 50% 0%;
}
.gh-sheet.gh-react { animation: gh-flap .65s ease; }
@keyframes gh-flap {
  0% { opacity: 0; scale: .7; }
  15% { opacity: 1; scale: 1; }
  35% { rotate: -14deg; } 55% { rotate: 12deg; } 75% { rotate: -8deg; }
  100% { opacity: 0; rotate: 0deg; scale: .8; }
}
.gh-skel {
  position: absolute; top: 10%; left: 6%; font-size: 17px; opacity: 0; z-index: 1;
}
.gh-skel.gh-react { animation: gh-rattle .65s ease; }
@keyframes gh-rattle {
  0% { opacity: 0; translate: 0 4px; }
  15% { opacity: 1; translate: 0 0; }
  30% { rotate: -10deg; } 50% { rotate: 10deg; } 70% { rotate: -6deg; } 85% { rotate: 4deg; }
  100% { opacity: 0; rotate: 0deg; }
}

.gh-fly-tag {
  position: absolute; top: 20%; font-size: 12px; font-weight: 700; color: #ffdede; z-index: 2;
  background: rgba(60, 10, 20, .55); border-radius: 8px; padding: 1px 6px; pointer-events: none;
  animation: gh-fly-off .8s ease-in both;
}
@keyframes gh-fly-off { 0% { opacity: 1; left: 50%; translate: -50% 0; } 100% { opacity: 0; left: 104%; translate: 0 -22px; } }

.gh-speedlines { position: absolute; inset: 0; z-index: 1; opacity: 0; pointer-events: none;
  background: repeating-linear-gradient(90deg, rgba(47,227,196,.55) 0 3px, transparent 3px 26px); }
.gh-speedlines.gh-burst { animation: gh-speed-burst .5s ease-out; }
.gh-speedlines.gh-mega { background: repeating-linear-gradient(90deg, rgba(255,233,168,.7) 0 4px, transparent 4px 20px); }
.gh-speedlines.gh-mega.gh-burst { animation: gh-speed-burst .68s ease-out; }
@keyframes gh-speed-burst { 0% { opacity: 0; translate: 40px 0; } 30% { opacity: 1; } 100% { opacity: 0; translate: -40px 0; } }

.gh-track {
  position: relative; z-index: 2; height: clamp(24px, 6vh, 42px);
  border-radius: 12px; margin: clamp(2px, .6vh, 6px) 8px;
  background: linear-gradient(180deg, rgba(255,255,255,.05), rgba(0,0,0,.28));
  box-shadow: inset 0 2px 5px rgba(0,0,0,.5);
}
.gh-track-tag {
  position: absolute; top: -14px; left: 2px; font-family: 'Fredoka', sans-serif; font-weight: 700;
  font-size: 9px; letter-spacing: .06em; color: rgba(246, 235, 212, .7);
}
.gh-cart {
  position: absolute; top: 50%; left: 4%; translate: -50% -50%;
  font-size: clamp(16px, 4vh, 26px); z-index: 3; filter: drop-shadow(0 2px 4px rgba(0,0,0,.5));
}
.gh-cart-ghost { opacity: .65; filter: drop-shadow(0 0 8px rgba(47,227,196,.75)); }
.gh-cart.gh-wobble { animation: gh-wobble .45s ease; }
@keyframes gh-wobble {
  0%, 100% { rotate: 0deg; } 25% { rotate: -10deg; translate: calc(-50% - 3px) -50%; }
  50% { rotate: 9deg; translate: calc(-50% + 3px) -50%; } 75% { rotate: -6deg; }
}
.gh-track-ghost.gh-tension { animation: gh-tension-pulse .9s ease-in-out infinite; }
@keyframes gh-tension-pulse { 0%, 100% { box-shadow: inset 0 2px 5px rgba(0,0,0,.5); } 50% { box-shadow: inset 0 2px 5px rgba(0,0,0,.5), 0 0 14px 3px rgba(255,79,163,.55); } }
.gh-dare-pill {
  position: absolute; inset: 0; display: none; align-items: center; justify-content: center;
  text-align: center; font-family: 'Fredoka', sans-serif; font-weight: 700;
  font-size: 10.5px; color: var(--pier-bulb, #ffe9a8); padding: 0 10px; letter-spacing: .02em;
}
.gh-track-ghost.gh-no-ghost .gh-cart-ghost { opacity: 0; }
.gh-track-ghost.gh-no-ghost .gh-dare-pill { display: flex; }
.gh-finish { position: absolute; right: 2px; top: 50%; translate: 0 -50%; font-size: 15px; z-index: 2; }

/* ---------- DOCK ---------- */
.gh-numpad-wrap { display: flex; justify-content: center; }

/* ---------- WELCOME / END OVERLAY CONTENT (chassis .pier-overlay-card wraps this) ---------- */
.gh-card-emoji { font-size: 44px; margin-bottom: 4px; }
.gh-card h2 { font-family: 'Fredoka', sans-serif; font-size: clamp(18px, 3.6vw, 23px); margin: 0 0 8px; color: var(--pier-bulb, #ffe9a8); }
.gh-card-line { font-size: 14px; line-height: 1.4; font-weight: 500; color: rgba(246,235,212,.88); margin: 0 0 12px; }
.gh-pb-line { font-size: 13.5px; font-weight: 700; color: var(--pier-teal, #2fe3c4); background: rgba(47,227,196,.12); border-radius: 12px; padding: 8px 12px; margin-bottom: 12px; }
.gh-pb-line.gh-pb-dare { color: var(--pier-bulb, #ffe9a8); background: rgba(255,233,168,.14); }
.gh-tiers { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 14px; }
.gh-tier-chip { font-size: 12px; font-weight: 700; background: rgba(255,255,255,.08); border-radius: 999px; padding: 6px 10px; color: rgba(246,235,212,.85); }
.gh-start-btn, .gh-again-btn { min-height: 60px; padding: 0 26px; font-size: 16px; width: 100%; }
.gh-end-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 4px; }
.gh-end-card .gh-final-time { font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 24px; color: var(--pier-bulb, #ffe9a8); margin: 4px 0 10px; }
.gh-compare { font-size: 13.5px; font-weight: 600; color: rgba(246,235,212,.85); background: rgba(155,107,240,.16); border-radius: 12px; padding: 8px 12px; margin-bottom: 12px; }
.gh-compare-win { background: rgba(46,204,113,.2); color: #7be3a4; }
.gh-compare-first { background: rgba(255,233,168,.18); color: var(--pier-bulb, #ffe9a8); }
.gh-tier-row { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 14px; }
.gh-tier-row .gh-tier-chip { font-size: 18px; padding: 4px 6px; opacity: .3; background: none; }
.gh-tier-row .gh-tier-chip.achieved { opacity: 1; }
.gh-trophy { font-size: 20px; animation: gh-trophy-spin 2.4s ease-in-out infinite; }
@keyframes gh-trophy-spin { 0%, 100% { rotate: -8deg; scale: 1; } 50% { rotate: 8deg; scale: 1.14; } }

/* ---------- PHOTO FINISH (auto-dismissing, non-interactive screen-level flash) ---------- */
.gh-photo-veil { background: transparent; animation: gh-photoveil-flash 900ms ease both; pointer-events: none; }
@keyframes gh-photoveil-flash {
  0% { background: rgba(255,255,255,0); }
  14% { background: rgba(255,255,255,.94); }
  55% { background: rgba(255,255,255,.5); }
  100% { background: rgba(255,255,255,0); }
}
.gh-photo-card { background: transparent; border: none; box-shadow: none; padding: 0; max-width: none; width: auto; animation: gh-photo-pop 900ms ease both; }
@keyframes gh-photo-pop { 0% { opacity: 0; scale: .8; } 20% { opacity: 1; scale: 1.08; } 32% { scale: 1; } 78% { opacity: 1; } 100% { opacity: 0; } }
.gh-photo-emoji { font-size: 52px; text-align: center; filter: drop-shadow(0 6px 10px rgba(0,0,0,.4)); }
.gh-photo-label {
  font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 20px; text-align: center;
  color: var(--ink); background: var(--card); border-radius: 12px; padding: 6px 18px; margin-top: 6px;
  box-shadow: 0 4px 0 rgba(0,0,0,.3);
}

@media (prefers-reduced-motion: reduce) {
  .gh-wall, .gh-sleepers, .gh-lantern-glow, .gh-bat, .gh-lamp, .gh-track-ghost.gh-tension,
  .gh-trophy, .gh-photo-veil, .gh-photo-card { animation: none !important; }
  .gh-wall, .gh-sleepers { animation-play-state: paused !important; }
}
`;

function formatMs(ms) {
  if (typeof ms !== 'number' || !Number.isFinite(ms)) return '—';
  const totalSec = ms / 1000;
  const m = Math.floor(totalSec / 60);
  const s = totalSec - m * 60;
  return m > 0 ? `${m}m ${s.toFixed(2)}s` : `${s.toFixed(2)}s`;
}
function formatClockLive(ms) {
  const totalSec = Math.max(0, ms) / 1000;
  const m = Math.floor(totalSec / 60);
  const s = totalSec - m * 60;
  return m > 0 ? `${m}m ${s.toFixed(1)}s` : `${s.toFixed(1)}s`;
}
// Cart left offset: inset the 0-100% travel range slightly so the emoji
// never hangs half outside the (decorative, overflow:hidden) track at either
// end — purely cosmetic, not a LAYOUT LAW concern (no control lives here).
function stationToPct(v) {
  const k = Math.max(0, Math.min(1, v / TOTAL));
  return 4 + k * 92;
}

export default {
  id: 'ghost',
  title: 'THE GHOST TRAIN',
  blurb: 'Race your own ghost through 20 mixed facts!',

  mount(host, ctx, pier) {
    let alive = true;
    const timers = new Set();
    const later = (fn, ms) => {
      const tid = setTimeout(() => { timers.delete(tid); if (alive) fn(); }, ms);
      timers.add(tid);
      return tid;
    };

    injectCss('pier-ghost', CSS);

    const rng = mulberry32((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
    const tiers = pier.facts.nanaTiers('ghost'); // {bronze, silver, gold} ms, lower=better

    const chassis = pier.mountChassis({
      onBack: () => { ctx.audio.sfx('back'); ctx.go('#/pier'); },
      backLabel: '← PIER',
      hudClass: 'gh-hud',
      stageClass: 'gh-stage',
      dockClass: 'gh-dock',
    });

    let currentBest = null;    // {ms, when, splits, goldSeen} | null
    let runToken = 0;          // guards delayed captions/timers against a fresh "ONE MORE GO"
    let ghostCancelTween = null;
    let cartCancelTween = null;
    let clockInterval = null;
    let activeOverlayClose = null;

    let currentFact = null;
    let factIndex = 0;
    let recordedSplits = [];
    let runStart = 0;
    let lastAttemptAt = 0;
    let playerPos = 0;
    let ghostPos = 0;
    let comboStreak = 0;
    let tailActive = false;
    let usableSplits = null;

    /* ---------- HUD ---------- */
    const clockChip = el('div', 'gh-chip gh-clock', '⏱ <span class="gh-clock-val">0.0s</span>');
    const counterChip = el('div', 'gh-chip gh-counter', 'FACT <span class="gh-fact-n">1</span>/20');
    chassis.hud.append(clockChip, counterChip);
    const clockValEl = clockChip.querySelector('.gh-clock-val');
    const factNEl = counterChip.querySelector('.gh-fact-n');

    /* ---------- STAGE: stem + tunnel ---------- */
    const stemCard = el('div', 'gh-stem');
    const stemText = el('span', 'gh-stem-text', '');
    stemCard.appendChild(stemText);

    const tunnel = el('div', 'gh-tunnel');
    tunnel.append(
      el('div', 'gh-wall'),
      el('div', 'gh-sleepers'),
      el('div', 'gh-lantern-glow'),
    );
    const lampRow = el('div', 'gh-lamprow');
    for (let i = 0; i < 6; i += 1) {
      const lamp = el('span', 'gh-lamp');
      lamp.style.animationDelay = `${(i * 0.16).toFixed(2)}s`;
      lampRow.appendChild(lamp);
    }
    const speedlines = el('div', 'gh-speedlines');
    const sheet = el('span', 'gh-sheet', '🫥');
    const skel = el('span', 'gh-skel', '💀');
    tunnel.append(
      el('span', 'gh-web gh-web-l', '🕸️'),
      el('span', 'gh-web gh-web-r', '🕸️'),
      el('span', 'gh-bat gh-bat-a', '🦇'),
      el('span', 'gh-bat gh-bat-b', '🦇'),
      sheet, skel, speedlines, lampRow,
    );

    const trackPlayer = el('div', 'gh-track gh-track-player');
    trackPlayer.append(el('div', 'gh-track-tag', 'YOU'), el('div', 'gh-cart gh-cart-player', '🚋'));
    const cartPlayer = trackPlayer.querySelector('.gh-cart-player');

    const trackGhost = el('div', 'gh-track gh-track-ghost');
    trackGhost.append(
      el('div', 'gh-track-tag', 'PB GHOST'),
      el('div', 'gh-cart gh-cart-ghost', '👻'),
      el('div', 'gh-dare-pill', "🎯 NANA'S DARE — no ghost tonight, set the first one!"),
    );
    const cartGhost = trackGhost.querySelector('.gh-cart-ghost');

    const finishFlag = el('div', 'gh-finish', '🏁');
    tunnel.append(trackPlayer, trackGhost, finishFlag);

    chassis.stage.append(stemCard, tunnel);

    /* ---------- DOCK: numpad ---------- */
    const numpadWrap = el('div', 'gh-numpad-wrap');
    chassis.dock.append(numpadWrap);
    const numpad = makeNumpad(numpadWrap, { onSubmit: handleSubmit });
    numpad.setEnabled(false);

    /* ---------- cart / ghost position helpers ---------- */
    function setCartPos(cartEl, stationValue) {
      cartEl.style.left = `${stationToPct(stationValue)}%`;
    }

    function stopGhostChain() { if (ghostCancelTween) { ghostCancelTween(); ghostCancelTween = null; } }
    function stopCartTween() { if (cartCancelTween) { cartCancelTween(); cartCancelTween = null; } }
    function stopClock() { if (clockInterval) { clearInterval(clockInterval); clockInterval = null; } }

    function checkTailTension() {
      if (!usableSplits) return; // first-ever run — no ghost to be chased by
      const gap = Math.abs(playerPos - ghostPos);
      if (!tailActive && gap <= TAIL_GAP) {
        tailActive = true;
        trackGhost.classList.add('gh-tension');
        const line = pick(rng, LINES.nearMiss);
        if (line) pier.say(line);
      } else if (tailActive && gap > TAIL_RESET_GAP) {
        tailActive = false;
        trackGhost.classList.remove('gh-tension');
      }
    }

    function scheduleGhostSegment(idx, splits) {
      if (!alive || idx >= TOTAL) return;
      const prevMs = idx === 0 ? 0 : splits[idx - 1];
      const segMs = Math.max(60, splits[idx] - prevMs);
      ghostCancelTween = tween((v) => {
        ghostPos = v;
        setCartPos(cartGhost, v);
        checkTailTension();
      }, idx, idx + 1, segMs, () => {
        ghostCancelTween = null;
        scheduleGhostSegment(idx + 1, splits);
      });
    }

    function advancePlayerCart(toIndex, onDone) {
      stopCartTween();
      const from = playerPos;
      cartCancelTween = tween((v) => {
        playerPos = v;
        setCartPos(cartPlayer, v);
        checkTailTension();
      }, from, toIndex, 420, () => {
        cartCancelTween = null;
        if (onDone) onDone();
      });
    }

    function cartWobble() {
      cartPlayer.classList.remove('gh-wobble');
      void cartPlayer.offsetWidth; // restart the keyframe even on rapid repeats
      cartPlayer.classList.add('gh-wobble');
    }

    function burstSpeedlines(mega) {
      speedlines.classList.toggle('gh-mega', !!mega);
      speedlines.classList.remove('gh-burst');
      void speedlines.offsetWidth;
      speedlines.classList.add('gh-burst');
    }

    // Two interchangeable "the pier reacts as you pass" wrong-answer beats —
    // (a) a bat makes off with the wrong digits you just typed (dave.steal
    // caption flavour), (b) the skeleton rattles through an unrelated bone-
    // dry joke (gremlin taunt) — picked at random each miss for variety
    // (rework brief: "daft-spooky set dressing that reacts as you pass").
    // Neither ever shows the CURRENT fact's answer (no hint-on-miss, see
    // header note / mechanic summary below).
    function reactToMiss(typedValue) {
      if (rng() < 0.5) {
        const bat = tunnel.querySelector('.gh-bat-a');
        const tag = el('span', 'gh-fly-tag', typedValue);
        const r = bat.getBoundingClientRect();
        const tr = tunnel.getBoundingClientRect();
        tag.style.left = `${r.left - tr.left}px`;
        tag.style.top = `${r.top - tr.top}px`;
        tunnel.appendChild(tag);
        later(() => tag.remove(), 850);
        const line = pick(rng, LINES.daveTheft);
        if (line) pier.say(line);
      } else {
        skel.classList.remove('gh-react');
        void skel.offsetWidth;
        skel.classList.add('gh-react');
        const line = pick(rng, GREMLIN_LINES.taunt);
        if (line) pier.say(line);
      }
      sheet.classList.remove('gh-react');
      void sheet.offsetWidth;
      sheet.classList.add('gh-react');
    }

    /* ---------- welcome ---------- */
    function closeActiveOverlay() {
      if (activeOverlayClose) { activeOverlayClose(); activeOverlayClose = null; }
    }

    function showWelcome() {
      usableSplits = currentBest && Array.isArray(currentBest.splits) && currentBest.splits.length === TOTAL
        ? currentBest.splits : null;
      const havePb = !!usableSplits;
      const goldStr = tiers ? formatMs(tiers.gold) : '—';
      const silverStr = tiers ? formatMs(tiers.silver) : '—';
      const bronzeStr = tiers ? formatMs(tiers.bronze) : '—';
      const line = pick(rng, LINES.welcome);

      const card = el('div', 'gh-card');
      card.innerHTML = `
        <div class="gh-card-emoji">👻🚋</div>
        <h2>THE GHOST TRAIN</h2>
        ${line ? `<p class="gh-card-line">${line.text}</p>` : ''}
        ${havePb
    ? `<div class="gh-pb-line">👻 Your ghost's time to beat: <b>${formatMs(currentBest.ms)}</b></div>`
    : '<div class="gh-pb-line gh-pb-dare">🎯 No ghost in the tunnel yet — tonight it\'s NANA\'S DARE. Set the very first haunting!</div>'}
        <div class="gh-tiers">
          <span class="gh-tier-chip">🥉 ${bronzeStr}</span>
          <span class="gh-tier-chip">🥈 ${silverStr}</span>
          <span class="gh-tier-chip">🥇 ${goldStr}</span>
        </div>
      `;
      const startBtn = el('button', 'btn btn-gold gh-start-btn', havePb ? 'START THE CHASE 👻' : "ACCEPT NANA'S DARE 🎯");
      card.appendChild(startBtn);

      const { close } = chassis.overlay(card, { cardClass: 'gh-welcome-card', speaks: line });
      activeOverlayClose = close;
      if (line) pier.say(line); // VO attempts even though the bubble self-suppresses (isOnScreen)

      startBtn.addEventListener('click', () => {
        ctx.audio.sfx('confirm');
        closeActiveOverlay();
        startRun();
      });
    }

    /* ---------- run loop ---------- */
    function loadFact() {
      currentFact = pier.facts.draw(rng, { deluxe: pier.deluxe });
      lastAttemptAt = performance.now();
      stemText.textContent = currentFact.stem;
      factNEl.textContent = String(factIndex + 1);
      numpad.clear();
      numpad.setEnabled(true);
    }

    function handleSubmit(valueString) {
      if (!alive || !currentFact) return;
      const now = performance.now();
      const attemptMs = Math.round(now - lastAttemptAt);
      const val = parseInt(valueString, 10);
      const correct = Number.isFinite(val) && val === currentFact.answer;
      const result = pier.facts.record(currentFact.family, { correct, ms: attemptMs, mode: 'ghost' });
      lastAttemptAt = now;
      numpad.clear();

      if (correct) {
        stemCard.classList.remove('gh-flash-wrong');
        void stemCard.offsetWidth;
        stemCard.classList.add('gh-flash-correct');
        sfx.tick(Math.min(factIndex, 5));

        comboStreak += 1;
        const mega = comboStreak >= 3 && comboStreak % 3 === 0;
        burstSpeedlines(mega);
        if (mega) {
          const line = pick(rng, LINES.combo);
          if (line) pier.say(line);
        }

        const cum = Math.round(now - runStart);
        recordedSplits.push(cum);
        factIndex += 1;

        if (result && result.justFlushed) celebrateFlush(result.name);

        if (factIndex >= TOTAL) {
          // Time is already locked in (recordedSplits above) — everything from
          // here is pure presentation and never inflates the recorded run.
          numpad.setEnabled(false);
          stopClock();
          stopGhostChain(); // freezes the ghost cart at its live "photo" position
          advancePlayerCart(TOTAL, () => later(runPhotoFinish, 60));
        } else {
          advancePlayerCart(factIndex);
          loadFact();
        }
      } else {
        stemCard.classList.remove('gh-flash-correct');
        void stemCard.offsetWidth;
        stemCard.classList.add('gh-flash-wrong');
        cartWobble();
        comboStreak = 0;
        sfx.nudge();
        reactToMiss(valueString);
      }
    }

    function celebrateFlush(name) {
      const line = pick(rng, LINES.gremlinFlush);
      if (line) pier.say(line);
      sparkleBurst(chassis.stage, chassis.stage.clientWidth / 2, chassis.stage.clientHeight * 0.6);
      toast(chassis.stage, `🚽 ${name || 'A gremlin'} FLUSHED!`);
    }

    function startClock() {
      stopClock();
      clockInterval = setInterval(() => {
        if (!alive) return;
        clockValEl.textContent = formatClockLive(performance.now() - runStart);
      }, 100);
    }

    function startRun() {
      runToken += 1;
      stopGhostChain();
      stopCartTween();
      stopClock();

      recordedSplits = [];
      factIndex = 0;
      playerPos = 0;
      ghostPos = 0;
      comboStreak = 0;
      tailActive = false;
      setCartPos(cartPlayer, 0);
      setCartPos(cartGhost, 0);
      cartPlayer.classList.remove('gh-wobble');
      stemCard.classList.remove('gh-flash-correct', 'gh-flash-wrong');
      trackGhost.classList.remove('gh-tension');
      tunnel.classList.add('gh-running');

      trackGhost.classList.toggle('gh-no-ghost', !usableSplits);

      runStart = performance.now();
      clockValEl.textContent = '0.0s';
      startClock();
      if (usableSplits) scheduleGhostSegment(0, usableSplits);

      numpad.setEnabled(true);
      loadFact();
    }

    /* ---------- photo finish -> end screen ---------- */
    function runPhotoFinish() {
      const myToken = runToken;
      const content = el('div', 'gh-photo-content');
      content.append(el('div', 'gh-photo-emoji', '📸'), el('div', 'gh-photo-label', 'PHOTO FINISH!'));
      const { close } = chassis.overlay(content, { cardClass: 'gh-photo-card', veilClass: 'gh-photo-veil' });
      activeOverlayClose = close; // tracked like every other overlay so cleanup() can close it mid-flash
      sfx.sparkle();
      later(() => {
        closeActiveOverlay();
        if (runToken !== myToken || !alive) return;
        tunnel.classList.remove('gh-running');
        finishRun();
      }, 900);
    }

    async function finishRun() {
      const finalMs = recordedSplits[recordedSplits.length - 1];
      const wasBest = (currentBest && typeof currentBest.ms === 'number') ? currentBest : null;
      const isNewRecord = !wasBest || finalMs < wasBest.ms;
      let goldNewlyBeaten = false;

      if (isNewRecord) {
        const goldAchieved = !!(tiers && finalMs <= tiers.gold);
        goldNewlyBeaten = goldAchieved && !(wasBest && wasBest.goldSeen);
        // Single atomic putBest call: headline time + the splits driving next
        // run's ghost are written together so they can never drift apart.
        const patch = { ms: finalMs, when: Date.now(), splits: recordedSplits.slice() };
        if (goldNewlyBeaten) patch.goldSeen = true;
        try {
          currentBest = await pier.facts.putBest('ghost', patch);
        } catch (e) {
          currentBest = { ...(wasBest || {}), ...patch };
        }
      }

      if (!alive) return;
      showEndScreen({ finalMs, wasBest, isNewRecord, goldNewlyBeaten });
    }

    function showEndScreen({
      finalMs, wasBest, isNewRecord, goldNewlyBeaten,
    }) {
      const myToken = runToken;

      let compareHtml;
      if (!wasBest) {
        compareHtml = "<div class=\"gh-compare gh-compare-first\">🎯 You are the very FIRST ghost of Whiff-End Pier!</div>";
      } else if (isNewRecord) {
        compareHtml = `<div class="gh-compare gh-compare-win">You beat your old ghost by <b>${formatMs(wasBest.ms - finalMs)}</b>!</div>`;
      } else {
        compareHtml = `<div class="gh-compare">Your ghost got there <b>${formatMs(finalMs - wasBest.ms)}</b> ahead this time — have another go!</div>`;
      }

      const bestForChips = isNewRecord ? finalMs : (wasBest ? wasBest.ms : finalMs);
      const chipsHtml = tiers ? ['bronze', 'silver', 'gold'].map((t) => {
        const icon = t === 'bronze' ? '🥉' : (t === 'silver' ? '🥈' : '🥇');
        const achieved = bestForChips <= tiers[t];
        return `<span class="gh-tier-chip${achieved ? ' achieved' : ''}">${icon}</span>`;
      }).join('') : '';

      const card = el('div', 'gh-card gh-end-card');
      card.innerHTML = `
        <div class="gh-card-emoji">${isNewRecord ? '🏆👻' : '👻'}</div>
        <h2>${isNewRecord ? 'A NEW GHOST HAUNTS THE PIER!' : 'RUN COMPLETE!'}</h2>
        <div class="gh-final-time">⏱ <b>${formatMs(finalMs)}</b></div>
        ${compareHtml}
        <div class="gh-tier-row">${chipsHtml}${goldNewlyBeaten ? '<span class="gh-trophy">🏆</span>' : ''}</div>
      `;
      const actions = el('div', 'gh-end-actions');
      const again = el('button', 'btn btn-gold gh-again-btn', 'ONE MORE GO 👻');
      actions.appendChild(again);
      card.appendChild(actions);

      const { close } = chassis.overlay(card, { cardClass: 'gh-end-card-wrap' });
      activeOverlayClose = close;

      again.addEventListener('click', () => {
        ctx.audio.sfx('confirm');
        closeActiveOverlay();
        startRun();
      });

      if (isNewRecord) {
        sfx.win();
        party(chassis.stage);
        const l1 = pick(rng, LINES.newPB);
        if (l1) pier.say(l1);
        later(() => {
          if (runToken !== myToken) return; // a fresh run started before this fired — stale, skip
          const l2 = goldNewlyBeaten ? pick(rng, LINES.goldBeaten) : pick(rng, NANA_LINES.win);
          if (l2) pier.say(l2);
        }, 2200);
      } else {
        sfx.settle();
        const l = pick(rng, NANA_LINES.win); // machine.ghost has no dedicated "not-a-record" pool — warm fallback
        if (l) pier.say(l);
      }
    }

    /* ---------- initial load ---------- */
    (async () => {
      let allBests = {};
      try { allBests = await pier.facts.getBests(); } catch (e) { allBests = {}; }
      if (!alive) return;
      currentBest = (allBests && allBests.ghost) || null;
      showWelcome();
    })();

    return function cleanup() {
      alive = false;
      timers.forEach((tid) => clearTimeout(tid));
      timers.clear();
      stopClock();
      stopGhostChain();
      stopCartTween();
      closeActiveOverlay(); // un-registers any still-open overlay's markOnScreen() text
      numpad.destroy();
    };
  },
};
