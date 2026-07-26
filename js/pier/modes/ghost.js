// FART QUEST — js/pier/modes/ghost.js (GHOST agent)
// WHIFF-END PIER — THE GHOST TRAIN. Mechanic (20-fact time trial vs your own
// stored PB "ghost", splits/PB atomicity, first-run Nana's Dare framing) is
// UNCHANGED from docs/PIER_SPEC.md §6 across every pass. See docs/
// PIER_REWORK.md §1 (THE LAYOUT LAW) and §3 "ghost" for the chassis + feel
// contract this file implements.
//
// CHASSIS: uses `pier.mountChassis(opts)` (js/pier/padkit.js, HUB/CHASSIS
// agent) for the [hud][stage][dock] skeleton and its screen-level
// `overlay(contentEl, opts)` for welcome/end/photo-finish cards — NOT an
// in-stage veil. That in-stage-veil pattern is the exact v1 bug
// (docs/PIER_REWORK.md §0: `.gh-veil` sat inside `.gh-root`, itself inside a
// clipped `.pier-mode-host`, and would have sliced controls the same way
// splat's `.splat-veil` did).
//
// REWORK v2, THIRD PASS (F2/F3 fix pass, THIS pass) — the chassis owner has
// rewritten `.pier-mode-host.pier-chassis` into a CSS GRID (css/pier.css
// §1a): on landscape ≥680px (all three proven sizes clear this) the stage
// becomes a TALL LEFT COLUMN at near-full height and the dock becomes a
// compact right-hand numpad column, instead of the old squashed
// stage-on-top-of-a-tall-numpad stack that starved the tunnel to a 92-148px
// sliver. This file's own former workaround — `.pier-mode-host.pier-chassis
// { display:flex; flex-direction:column; }`, added back when css/pier.css
// had no rule for `.pier-chassis` at all — is now DELETED (css/pier.css's
// own header comment calls this exact rule out by name): keeping it would
// re-impose the old single-column flex stack and silently defeat the new
// grid, even though the grid rules carry `!important` as a safety net for
// exactly this handoff window.
//
// F3 (this pass's PRIMARY target): with a genuinely tall stage now available
// (measured ~400-620px at the three proven sizes, vs v1's 92-148px sliver),
// `.gh-tunnel` is rebuilt into a real full-height scene instead of a thin
// decorated strip — three background layers scroll continuously at three
// different speeds (far wall slowest+dimmest, mid arches medium, sleeper
// floor fastest+nearest — genuine parallax depth, each with its OWN
// loop-distance so none of them stutters, not one shared scroll rate), the
// PB ghost cart's lantern-glow escalates (colour + pulse + scale) the moment
// the live split gap closes to one station (checkTailTension()), a
// skeleton recites a flavour-only times-table snippet on a miss (never the
// live fact — no hint leak), and a checkered finish-line strip spans the
// full tunnel height at the far end so the closing photo-finish reads as a
// real line being crossed, not an emoji sitting in a progress bar.
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

// The skeleton's "reciting a times table" set-dressing beat (F3) — pure
// flavour text, deliberately NOT drawn from the live fact/answer (that would
// be a hint leak on a miss, rule ②). Just a silly, unrelated recitation.
const SKEL_RECITALS = [
  '…seven eights are fifty-six…',
  '…nine nines are eighty-one…',
  '…six sevens are forty-two…',
  '…four twelves are forty-eight…',
  '…three elevens are thirty-three…',
  '…eight fours are thirty-two…',
];

const CSS = `
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
/* F3: no align-items:center override here any more — the default
   align-items:stretch on a flex COLUMN lets .gh-tunnel (width:100%
   below) fill the stage's full width automatically, while .gh-stem opts
   itself back OUT of that stretch with its own align-self:center (right
   below) so the question card stays a compact centred pill, not a
   full-width stretched banner. This is what turns the stage from "a narrow
   centred column with dead space either side" into the tall, wide scene F3
   asks for. NOTE: this CSS lives inside a JS template literal (the CSS
   const, below) — never use backtick characters in these comments, they
   close the string early and corrupt the whole module (measured:
   "SyntaxError: Unexpected identifier 'align'" the first time this rule was
   broken). */
.gh-stage {
  display: flex; flex-direction: column;
  gap: clamp(6px, 1.4vh, 14px);
  padding: clamp(6px, 1.4vh, 14px) clamp(10px, 1.8vw, 20px) clamp(6px, 1.2vh, 12px);
}
.gh-stem {
  flex: none; align-self: center;
  background: var(--card); color: var(--ink); border-radius: 14px;
  box-shadow: 0 4px 0 rgba(0, 0, 0, .25), 0 8px 16px rgba(0, 0, 0, .3);
  padding: clamp(4px, 1.1vh, 11px) clamp(16px, 3vw, 26px);
  font-weight: 700; font-size: clamp(17px, 3.6vh, 29px); text-align: center;
  min-width: 160px;
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

/* ---------- TUNNEL (F3: a genuine full-height scene, see header) ---------- */
.gh-tunnel {
  position: relative; width: 100%; flex: 1 1 auto; min-height: 0;
  border-radius: 20px;
  display: flex; flex-direction: column; justify-content: space-around;
  padding: clamp(10px, 3vh, 26px) 0;
  overflow: hidden; /* pure decoration inside (rule §1.5) — no controls ever live here */
  box-shadow: inset 0 0 40px rgba(0, 0, 0, .6), 0 6px 0 rgba(0, 0, 0, .3);
  background: linear-gradient(180deg, #241a3c 0%, #1b1430 55%, #100c1e 100%);
}

/* Three depth bands at three speeds — the actual parallax (F3's core ask):
   far wall slowest+dimmest, mid arches medium, sleeper floor fastest+
   nearest underfoot. Each layer gets its OWN keyframe (not a shared one) so
   its loop restart lands on an exact multiple of ITS OWN background-size —
   a shared scroll distance would visibly stutter for whichever layer's tile
   width didn't divide it evenly. */
.gh-wall, .gh-arches, .gh-sleepers {
  position: absolute; inset: 0; pointer-events: none;
  background-repeat: repeat-x; animation-play-state: paused;
}
.gh-tunnel.gh-running .gh-wall,
.gh-tunnel.gh-running .gh-arches,
.gh-tunnel.gh-running .gh-sleepers { animation-play-state: running; }
.gh-wall {
  opacity: .4; background-size: 56px 100%;
  background-image: repeating-linear-gradient(90deg, rgba(255,255,255,.07) 0 2px, transparent 2px 56px);
  animation: gh-scroll-wall 3.8s linear infinite;
}
@keyframes gh-scroll-wall { from { background-position: 0 0; } to { background-position: -56px 0; } }
.gh-arches {
  top: 4%; bottom: 22%; opacity: .5; background-size: 148px 100%;
  background-image: radial-gradient(ellipse 56px 130% at 50% -18%, transparent 82%, rgba(8, 5, 20, .78) 85%, transparent 100%);
  animation: gh-scroll-arch 2.4s linear infinite;
}
@keyframes gh-scroll-arch { from { background-position: 0 0; } to { background-position: -148px 0; } }
.gh-sleepers {
  top: auto; bottom: 0; height: 16%; opacity: .85; background-size: 32px 100%;
  background-image: repeating-linear-gradient(90deg, rgba(0,0,0,.42) 0 8px, rgba(120,90,60,.3) 8px 10px, transparent 10px 32px);
  animation: gh-scroll-floor 1.05s linear infinite;
}
@keyframes gh-scroll-floor { from { background-position: 0 0; } to { background-position: -32px 0; } }

/* Soft edge vignette on top — reads as "looking down a tunnel", not a flat
   stack of layered rectangles. z-index:2, same tier as the finish assets/
   fly-tag/skel-bubble below — appended last so it sits over them (their
   own alpha is high enough near the (mostly-transparent) centre that this
   doesn't hurt legibility); the carts stay at z-index:3, above the
   vignette, so gameplay is never dimmed. */
.gh-vignette {
  position: absolute; inset: 0; z-index: 2; pointer-events: none;
  background: radial-gradient(130% 90% at 50% 42%, transparent 58%, rgba(0, 0, 0, .55) 100%);
}

.gh-lantern-glow {
  position: absolute; inset: -20% -10% auto -10%; height: 62%;
  background: radial-gradient(60% 100% at 50% 0%, rgba(255, 233, 168, .3), transparent 72%);
  animation: gh-lantern-wobble 2.2s ease-in-out infinite; pointer-events: none;
}
@keyframes gh-lantern-wobble { 0%, 100% { opacity: .55; } 50% { opacity: 1; } }
.gh-lamprow { position: absolute; top: 5px; left: 0; right: 0; display: flex; justify-content: space-around; z-index: 1; }
.gh-lamp { width: 6px; height: 6px; border-radius: 50%; background: var(--pier-bulb, #ffe9a8); box-shadow: 0 0 8px 2px var(--pier-bulb, #ffe9a8); animation: pier-bulb-flicker 1.6s ease-in-out infinite; }

/* Near-foreground cobwebs — the spec's "near cobwebs" layer deliberately
   does NOT scroll with the far/mid layers (they're corner-fixed framing,
   closest to the "camera"); a gentle continuous sway keeps them feeling
   alive rather than static wallpaper. */
.gh-web {
  position: absolute; font-size: 20px; opacity: .45; z-index: 1;
  animation: gh-web-sway 3.2s ease-in-out infinite;
}
.gh-web-l { top: -6px; left: -2px; transform-origin: 20% 0%; }
.gh-web-r { top: -6px; right: -2px; transform: scaleX(-1); transform-origin: 80% 0%; }
@keyframes gh-web-sway { 0%, 100% { rotate: -2deg; } 50% { rotate: 2deg; } }

.gh-bat { position: absolute; top: 14%; font-size: 14px; opacity: .55; pointer-events: none; z-index: 1; animation: gh-drift 8s ease-in-out infinite; }
.gh-bat-b { top: 36%; font-size: 12px; animation-duration: 11s; animation-delay: 1.8s; }
@keyframes gh-drift { 0% { left: -6%; } 50% { left: 96%; transform: translateY(-6px); } 100% { left: -6%; } }

.gh-sheet {
  position: absolute; top: 10%; right: 8%; font-size: 20px; opacity: 0; z-index: 1;
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
  position: absolute; top: 58%; left: 6%; font-size: 19px; opacity: 0; z-index: 1;
}
.gh-skel.gh-react { animation: gh-rattle .65s ease; }
@keyframes gh-rattle {
  0% { opacity: 0; translate: 0 4px; }
  15% { opacity: 1; translate: 0 0; }
  30% { rotate: -10deg; } 50% { rotate: 10deg; } 70% { rotate: -6deg; } 85% { rotate: 4deg; }
  100% { opacity: 0; rotate: 0deg; }
}
/* The skeleton's "reciting a times table" beat — flavour text ONLY, picked
   from SKEL_RECITALS (never the live fact/answer — no hint leak, rule ②). */
.gh-skel-bubble {
  position: absolute; top: 46%; left: 13%; z-index: 2; opacity: 0;
  font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 9.5px; letter-spacing: .01em;
  color: #e4ffe6; background: rgba(20, 45, 22, .68); border-radius: 8px; padding: 3px 7px;
  white-space: nowrap; pointer-events: none;
}
.gh-skel-bubble.gh-react { animation: gh-skel-bubble-pop .9s ease; }
@keyframes gh-skel-bubble-pop {
  0% { opacity: 0; translate: 0 4px; }
  18% { opacity: 1; translate: 0 0; }
  80% { opacity: 1; }
  100% { opacity: 0; }
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
  position: relative; z-index: 3; height: clamp(30px, 8.5vh, 60px);
  border-radius: 14px; margin: clamp(2px, .8vh, 8px) clamp(8px, 2vw, 22px);
  background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(0,0,0,.3));
  box-shadow: inset 0 2px 6px rgba(0,0,0,.5);
}
.gh-track-tag {
  position: absolute; top: -15px; left: 2px; font-family: 'Fredoka', sans-serif; font-weight: 700;
  font-size: 9.5px; letter-spacing: .06em; color: rgba(246, 235, 212, .7);
}
.gh-cart {
  position: absolute; top: 50%; left: 4%; translate: -50% -50%;
  font-size: clamp(19px, 5.5vh, 34px); z-index: 3; filter: drop-shadow(0 2px 4px rgba(0,0,0,.5));
}
.gh-cart-ghost { opacity: .8; filter: drop-shadow(0 0 10px rgba(47,227,196,.85)) drop-shadow(0 0 22px rgba(47,227,196,.5)); }
/* Escalation, F3: when checkTailTension() flags the gap has closed to one
   station, the ghost's lantern doesn't just sit there glowing — it flips to
   an urgent pink pulse-and-grow so "IT'S ON YOUR TAIL" is legible at a
   glance, not just read in a caption. */
.gh-cart-ghost.gh-tension-cart { animation: gh-lantern-pulse .7s ease-in-out infinite; }
@keyframes gh-lantern-pulse {
  0%, 100% { filter: drop-shadow(0 0 10px rgba(255,79,163,.9)) drop-shadow(0 0 24px rgba(255,79,163,.6)); scale: 1; }
  50% { filter: drop-shadow(0 0 18px rgba(255,79,163,1)) drop-shadow(0 0 34px rgba(255,79,163,.9)); scale: 1.28; }
}
.gh-cart.gh-wobble { animation: gh-wobble .45s ease; }
@keyframes gh-wobble {
  0%, 100% { rotate: 0deg; } 25% { rotate: -10deg; translate: calc(-50% - 3px) -50%; }
  50% { rotate: 9deg; translate: calc(-50% + 3px) -50%; } 75% { rotate: -6deg; }
}
.gh-track-ghost.gh-tension { animation: gh-tension-pulse .9s ease-in-out infinite; }
@keyframes gh-tension-pulse { 0%, 100% { box-shadow: inset 0 2px 6px rgba(0,0,0,.5); } 50% { box-shadow: inset 0 2px 6px rgba(0,0,0,.5), 0 0 16px 4px rgba(255,79,163,.55); } }
.gh-dare-pill {
  position: absolute; inset: 0; display: none; align-items: center; justify-content: center;
  text-align: center; font-family: 'Fredoka', sans-serif; font-weight: 700;
  font-size: 11px; color: var(--pier-bulb, #ffe9a8); padding: 0 10px; letter-spacing: .02em;
}
.gh-track-ghost.gh-no-ghost .gh-cart-ghost { opacity: 0; }
.gh-track-ghost.gh-no-ghost .gh-dare-pill { display: flex; }

/* Checkered finish-line STRIP spans the whole tunnel height (a real line to
   cross, not an emoji sitting in a bar) plus the flag itself above it. */
.gh-finish {
  position: absolute; right: 3%; top: 4%; bottom: 4%; width: clamp(8px, 1.4vw, 14px);
  background: repeating-linear-gradient(180deg, #f4f4f4 0 9px, #1a1a1a 9px 18px);
  border-radius: 4px; box-shadow: 0 0 10px rgba(255,255,255,.35); z-index: 2;
}
.gh-finish-flag {
  position: absolute; right: calc(3% + clamp(8px, 1.4vw, 14px) + 6px); top: 4%;
  font-size: clamp(16px, 3.4vh, 26px); z-index: 2;
}

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
  .gh-wall, .gh-arches, .gh-sleepers, .gh-lantern-glow, .gh-web, .gh-bat, .gh-lamp,
  .gh-track-ghost.gh-tension, .gh-cart-ghost.gh-tension-cart,
  .gh-trophy, .gh-photo-veil, .gh-photo-card { animation: none !important; }
  .gh-wall, .gh-arches, .gh-sleepers { animation-play-state: paused !important; }
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
      el('div', 'gh-arches'),
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
    const skelBubble = el('span', 'gh-skel-bubble', '');
    tunnel.append(
      el('span', 'gh-web gh-web-l', '🕸️'),
      el('span', 'gh-web gh-web-r', '🕸️'),
      el('span', 'gh-bat gh-bat-a', '🦇'),
      el('span', 'gh-bat gh-bat-b', '🦇'),
      sheet, skel, skelBubble, speedlines, lampRow,
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

    // F3: a real finish LINE (checkered strip, full tunnel height) behind the
    // flag emoji, not just the flag sitting alone in a bar — plus the
    // vignette last so it sits over the background layers/decor (see its
    // own CSS comment for the stacking-order reasoning).
    const finishStrip = el('div', 'gh-finish');
    const finishFlagEmoji = el('div', 'gh-finish-flag', '🏁');
    tunnel.append(trackPlayer, trackGhost, finishStrip, finishFlagEmoji, el('div', 'gh-vignette'));

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
        // The lantern itself escalates (colour + pulse + scale), not just
        // the track's box-shadow — "IT'S ON YOUR TAIL" needs to be legible
        // at a glance on the cart a child is actually watching.
        cartGhost.classList.add('gh-tension-cart');
        const line = pick(rng, LINES.nearMiss);
        if (line) pier.say(line);
      } else if (tailActive && gap > TAIL_RESET_GAP) {
        tailActive = false;
        trackGhost.classList.remove('gh-tension');
        cartGhost.classList.remove('gh-tension-cart');
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
        skelBubble.textContent = pick(rng, SKEL_RECITALS);
        skel.classList.remove('gh-react');
        skelBubble.classList.remove('gh-react');
        void skel.offsetWidth;
        skel.classList.add('gh-react');
        skelBubble.classList.add('gh-react');
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

    // Recomputed from currentBest every time a run is about to start (both
    // from the welcome card's START button AND from the end card's ONE MORE
    // GO button) — NOT just once at mount. currentBest is refreshed by
    // finishRun()'s atomic putBest() before the end card's button even
    // exists, so re-deriving here (rather than trusting a variable only
    // showWelcome() ever wrote) is what makes a freshly-set PB show up as a
    // ghost on the very next run instead of only after leaving and
    // re-entering the mode.
    function computeUsableSplits() {
      return currentBest && Array.isArray(currentBest.splits) && currentBest.splits.length === TOTAL
        ? currentBest.splits : null;
    }

    function showWelcome() {
      usableSplits = computeUsableSplits();
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

      // Re-derive fresh every run start (see computeUsableSplits() note) —
      // this is the fix for ONE MORE GO never refreshing the ghost after a
      // just-set PB: that button calls startRun() directly, not
      // showWelcome(), so this variable must not rely on showWelcome() alone.
      usableSplits = computeUsableSplits();

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
      cartGhost.classList.remove('gh-tension-cart');
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
