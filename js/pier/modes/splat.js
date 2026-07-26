// FART QUEST — js/pier/modes/splat.js (SPLAT agent)
// SPLAT-A-GREMLIN — REWORK v2 (docs/PIER_REWORK.md).
//
// Damien's verdict on v1: "the animation of the hammer is barely visible; it
// flashes too quickly and there should be more funny effect." This rebuild
// makes the whack unmissable: a >=140px mallet swings in on an ARC with a
// ~120ms wind-up (anticipation), the impact frame HOLDS ~350ms+, the stage
// shakes, a radial splat-star bursts, the gremlin FLATTENS TO A PANCAKE and
// pings off-screen spinning, and a puddle of goo persists on that hole for a
// few seconds after (a separate, never-recreated layer under the holes, so
// it survives the next question redrawing the hole above it). Combo tiers
// visibly GROW the mallet and rename it MALLET -> SLEDGE -> THE BIG ONE with
// escalating sound. A miss = a raspberry + a cheeky duck-and-wiggle, never a
// "wrong" flash alone. See the CSS block below for the exact keyframe timing
// (percentages of a fixed 900ms sequence) and this file's final report for
// the measured Layout Law proof at all three viewport sizes.
//
// CHASSIS INTEGRATION (this pass): the v1 file built its OWN in-stage
// `.splat-veil` for welcome/end — THAT is the exact bug PIER_REWORK.md §0
// screenshot-confirmed (sliced START button, physically unreachable at
// 1000x540). This rebuild uses `pier.mountChassis(...)` for the mandatory
// [hud][stage][dock] skeleton and `chassis.overlay(...)` (screen-level,
// `position:fixed`, centred with `translate:`, `max-height:calc(100dvh -
// 32px); overflow-y:auto`) for every welcome/end card. See js/pier/padkit.js
// and css/pier.css's header contract blocks for the full shape this relies
// on. There is deliberately no `.splat-dock` content — this machine is
// tap-based (no numpad/primary-action control), so the dock slot is left
// empty per the contract ("a mode that wants the same skeleton calls
// mountChassis... nothing forces a mode to fill every slot").
//
// Content: per-machine line pools now live in js/pier/content.js's `machine`
// export, NOT surfaced through `pier.content` (that whitelist only forwards
// nana/announcer/dave/gremlin — see content.js's own "INTEGRATION NOTE FOR
// REVIEWERS"). This file imports `machine`/`nana`/`announcer` directly as a
// plain sibling import, exactly as js/pier/modes/tank.js already does for
// `GREMLIN_NAMES` — a read-only import of a file this agent doesn't own, not
// an edit to it.
import {
  el, sfx, tween, toast, sparkleBurst, party, injectCss,
} from '../../anims/_kit.js';
import { mulberry32, pick, shuffle } from '../../rng.js';
import { nana, announcer, machine } from '../content.js';

const ROUND_MS = 60000;
const HOLE_COUNT = 5;
const TICK_WINDOW_SEC = 10;
const HIT_ANIM_MS = 900;         // total mallet/gremlin sequence — see CSS splatMalletSwing/splatWhack
const IMPACT_DELAY_MS = 270;     // matches the 30% keyframe mark (270ms of 900ms) — the actual strike
const CORRECT_PAUSE_MS = HIT_ANIM_MS + 50; // next question waits for the FULL sequence to be seen
const WRONG_PAUSE_MS = 900;      // long enough to read the duck+wiggle and the green flash
const GOO_FADE_MS = 3400;        // "persists on that hole for a few seconds"
const DAVE_MS = 1650;
const COUNTDOWN_STEP_MS = 560;
// A tier-unlock and a gremlin-flush can land on the same correct tap (the
// gremlin-weighted draw biases toward weak families, so hitting a streak
// boundary AND a 3rd-correct-in-a-row is common). pier.say() replaces the
// caption bar text rather than queuing it (js/screens/pier.js `say()`), so
// firing both captions synchronously in the same callback would swap the
// combo line out before it ever paints. Stagger the flush beat behind the
// combo beat so each caption gets real, readable screen time.
const FLUSH_CAPTION_STAGGER_MS = 900;

const M = machine.splat;

/* ---------- combo tiers — "visibly GROW the mallet and rename it" ---------- */
const TOOL_TIERS = [
  { min: 0, name: 'MALLET', emoji: '🔨', cls: 'tier-0' },
  { min: 3, name: 'SLEDGE', emoji: '🔨', cls: 'tier-1' },
  { min: 6, name: 'THE BIG ONE', emoji: '🔨', cls: 'tier-2' },
];
function toolForStreak(streak) {
  let t = TOOL_TIERS[0];
  for (const tier of TOOL_TIERS) { if (streak >= tier.min) t = tier; }
  return t;
}

/* ---------- caption line picking (own throwaway rng — kept separate from
   the gameplay rng so cosmetic line/flight/goo variety never perturbs fact
   draws, same discipline v1 established) ---------- */
function freshRng() {
  return mulberry32((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
}
function pickLine(pool) {
  if (!Array.isArray(pool) || pool.length === 0) return null;
  return pick(freshRng(), pool);
}
function pickFlight() {
  const r = freshRng();
  const dir = r() < 0.5 ? -1 : 1;
  const x = dir * (60 + r() * 70);
  const y = -(90 + r() * 70);
  const rot = dir * (520 + r() * 360);
  return { x: Math.round(x), y: Math.round(y), rot: Math.round(rot) };
}

const CSS = `
/* Local .pier-mode-host.pier-chassis flex-column workaround REMOVED this
   pass — css/pier.css §1a now owns that rule permanently (a real CSS GRID,
   with the landscape stage-beside-dock switch, !important-guarded), so this
   file's old copy would only have fought the cascade for nothing. See
   css/pier.css's header contract block, "MODE AGENTS: DELETE YOUR LOCAL
   WORKAROUND", for the full reasoning. */

/* ---------- HUD chips ---------- */
.splat-chip {
  background: rgba(10,18,48,.7); border:2px solid rgba(255,255,255,.16); border-radius:999px;
  padding:7px 15px; font-family:'Fredoka',sans-serif; font-weight:700; font-size:14px;
  color:var(--parchment); box-shadow:0 4px 0 rgba(0,0,0,.3);
  min-height:34px; display:flex; align-items:center; white-space:nowrap;
}
.splat-chip b { color: var(--pier-bulb,#ffe9a8); font-size:16px; margin:0 2px; }
.splat-chip.pop { animation: splatChipPop .32s var(--spring) both; }
@keyframes splatChipPop { 0% { scale:1; } 45% { scale:1.18; } 100% { scale:1; } }

.splat-ring {
  --pct:100; position:relative; width:60px; height:60px; border-radius:50%; flex:0 0 auto;
  background: conic-gradient(var(--pier-teal,#2fe3c4) calc(var(--pct) * 1%), rgba(255,255,255,.14) 0);
  display:flex; align-items:center; justify-content:center; box-shadow:0 4px 0 rgba(0,0,0,.3);
}
.splat-ring::before { content:''; position:absolute; inset:6px; border-radius:50%; background:#0a1230; }
.splat-ring-num { position:relative; z-index:1; font-family:'Fredoka',sans-serif; font-weight:700; font-size:19px; color:var(--parchment); }
.splat-ring.urgent { animation: splatUrgentPulse .5s ease-in-out infinite; }
.splat-ring.urgent .splat-ring-num { color: var(--wrong); }
@keyframes splatUrgentPulse { 0%,100% { scale:1; } 50% { scale:1.12; } }

.splat-tool-chip[hidden] { display:none; }
.splat-tool-chip { border-color: rgba(255,79,163,.5); background: linear-gradient(160deg, rgba(255,79,163,.24), rgba(255,79,163,.1)); }
.splat-tool-chip.tier-1 { border-color: rgba(255,159,67,.65); background: linear-gradient(160deg, rgba(255,159,67,.32), rgba(255,159,67,.12)); }
.splat-tool-chip.tier-2 { border-color: var(--gold); background: linear-gradient(160deg, rgba(244,197,66,.42), rgba(244,197,66,.14)); box-shadow: 0 4px 0 rgba(0,0,0,.3), 0 0 14px rgba(244,197,66,.55); }

/* ---------- stage content — REWORK v2, F2/F5 pass ---------- */
/* The chassis now hands this machine a TALL stage (landscape:
   [hud hud]/[stage dock], stage the near-full-height LEFT column, splat's
   own dock left empty so it claims almost the full width too — see
   css/pier.css §1a). The OLD \`.splat-shakewrap\` centred a small fixed-
   content island (\`min-height:100%\` + \`justify-content:center\`) in that
   box — measured, pre-fix: a 720x178 arena floating inside a 958x464 stage
   at 1000x540, a void of ~260px above+below (F5). Fix: shakewrap now takes
   the stage's FULL height and \`.splat-arena\`/\`.splat-field\` are flex:1
   children that actually CONSUME the leftover height, so there is no gap
   left to go dead — see the F5 comment on \`.splat-fivegrid\` below for how
   the five holes then use all of it. */
.splat-shakewrap {
  display:flex; flex-direction:column; align-items:center;
  height:100%; width:100%; box-sizing:border-box;
  gap: clamp(6px,1.4vh,16px); padding: clamp(6px,1.2vh,12px) 10px;
}
.splat-shakewrap.shake { animation: splatShake .3s ease both; }
@keyframes splatShake {
  0%,100% { translate:0 0; }
  15% { translate:-9px 2px; } 30% { translate:8px -3px; } 45% { translate:-7px 3px; }
  60% { translate:6px -2px; } 75% { translate:-3px 1px; } 90% { translate:2px 0; }
}

/* \`margin-top\` here is a DELIBERATE fixed-px constant, not a clamp()/vh
   value — it exists to clear \`.pier-caption-bar\` (css/pier.css), which is
   \`position:fixed\` at a fixed-px \`top:calc(78px + safe-t)\` and renders a
   fixed ~64px-tall pill (measured live at all three proven sizes: bar spans
   78-142px from the viewport top, IDENTICAL at 1000x540/1024x640/1180x745,
   because neither its offset nor its content is vh-scaled). Pre-fix, this
   question sat flush under the HUD (~82px top) — squarely inside that
   78-142 band — so EVERY \`pier.say()\` this mode fires (announcer.roundStart
   at every round start, gremlin.nearMiss on every miss) rendered the caption
   pill's opaque background directly over the current question, making the
   one thing a player must read to answer unreadable for up to 5.2s at a
   time (screenshot-confirmed: "2 x 1 = ?" ghosted out under the tannoy
   bubble). Fix: push the question down past the caption's fixed 142px
   bottom edge with a matching fixed constant (not clamp/vh, since the thing
   it must clear isn't vh-based either) — the ~8-14px of remaining headroom
   this leaves at every size was re-verified against F2's reclaimed stage
   height (still 276-436px of \`.splat-field\` left over, comfortably more
   than the pre-rework squashed-strip baseline this whole pass exists to
   fix) rather than reusing the shared caption bar's own CSS var (mode files
   don't own/edit chassis chrome — this stays a self-contained splat.js
   fix). */
.splat-question {
  flex: 0 0 auto;
  margin: 68px 0 0;
  font-size:clamp(22px,4.2vh,40px); font-weight:700; color:var(--parchment);
  text-align:center; text-shadow:0 3px 0 rgba(0,0,0,.35); min-height:1.2em;
}

/* \`.splat-arena\` fills the height the chassis reclaimed (F2) instead of
   sizing to its own small content — \`flex:1 1 auto; min-height:0\` is the
   same "let the growing box actually grow/shrink" pairing THE LAYOUT LAW
   uses everywhere else in this app. */
.splat-arena {
  position:relative; flex:1 1 auto; min-height:0;
  width:min(96%,980px); display:flex; flex-direction:column; box-sizing:border-box;
}
/* \`.splat-field\` is the actual whack-a-mole cabinet floor: everything below
   the mallet's swing clearance (the old \`.splat-arena\` padding-top, moved
   here unchanged) — a flex:1 box so the goo layer and the holes can both be
   \`position:absolute; inset:0\` against ONE shared rect (\`.splat-fivegrid\`,
   below) and land pixel-identical whatever the real stage height turns out
   to be at a given viewport. */
.splat-field {
  position:relative; flex:1 1 auto; min-height:0; width:100%;
  margin-top: clamp(56px,13vh,100px);
}

/* ---------- goo layer — its OWN layer, never recreated by renderHoles(), so
   a splat outlives that question's holes redrawing on top of it. Shares
   \`.splat-fivegrid\`'s placement rules with \`.splat-holes\` below (same
   column/row per index) so a goo cell always lands under ITS hole, in
   either row of the staggered cabinet. ---------- */
.splat-goo-layer { z-index:1; pointer-events:none; }
.splat-goo-cell { position:relative; }
.splat-goo-cell::before {
  content:''; position:absolute; left:50%; bottom:4px;
  width:76%; height:62%; border-radius:52% 48% 46% 44% / 62% 58% 42% 38%;
  background: radial-gradient(ellipse at 38% 28%, #9be15d, #3d8a26 72%);
  box-shadow: 0 3px 8px rgba(0,0,0,.35);
  translate:-50% 0; rotate: var(--goo-rot,0deg); scale:0; opacity:0;
}
.splat-goo-cell.splat::before { animation: splatGooIn 3.4s cubic-bezier(.22,1,.36,1) both; }
@keyframes splatGooIn {
  0% { opacity:0; scale:0; }
  8% { opacity:1; scale: var(--goo-scale,1); }
  74% { opacity:1; scale: var(--goo-scale,1); }
  100% { opacity:0; scale: calc(var(--goo-scale,1) * .86); }
}

/* ---------- F5 fix: two STAGGERED rows — a real cabinet, not one thin
   strip. Back row (holes 2 & 4, smaller/further) alternates with front row
   (holes 1/3/5, bigger/closer), a classic whack-a-mole zig-zag. Both
   \`.splat-holes\` and \`.splat-goo-layer\` share \`.splat-fivegrid\`'s grid so
   the same index always lands in the same cell in both layers. Grid
   \`stretch\` (the default — nothing overridden here) means every hole/goo
   cell fills its whole cell, so the two rows use the FULL height
   \`.splat-field\` was given — nothing left over to read as a void, at any
   of the three proven sizes. ---------- */
.splat-fivegrid {
  position:absolute; inset:0;
  display:grid;
  grid-template-columns: repeat(5,1fr);
  grid-template-rows: 1fr 1.3fr;
  gap: clamp(6px,1.8vh,20px) clamp(6px,1.4vw,16px);
}
.splat-fivegrid > *:nth-child(1) { grid-column:1; grid-row:2; }
.splat-fivegrid > *:nth-child(2) { grid-column:2; grid-row:1; }
.splat-fivegrid > *:nth-child(3) { grid-column:3; grid-row:2; }
.splat-fivegrid > *:nth-child(4) { grid-column:4; grid-row:1; }
.splat-fivegrid > *:nth-child(5) { grid-column:5; grid-row:2; }

.splat-holes { z-index:2; }
.splat-hole {
  position:relative; border:none; background:transparent; cursor:pointer; padding:0;
  width:100%; height:100%; min-width:60px; min-height:60px;
  display:flex; flex-direction:column; align-items:center; justify-content:flex-end;
  -webkit-tap-highlight-color:transparent; touch-action:manipulation;
}
.splat-mound {
  position:absolute; bottom:0; left:50%; translate:-50% 0;
  width:88%; height:24%; border-radius:50%;
  background: radial-gradient(ellipse at 50% 30%, #3a2a10, #1c1408 75%);
  box-shadow: 0 6px 0 rgba(0,0,0,.35);
}
.splat-gremlin {
  position:relative; z-index:2; font-size:clamp(34px,7vh,56px); margin-bottom:-4px; display:block;
  filter:drop-shadow(0 4px 6px rgba(0,0,0,.4));
  animation: splatBob 1.8s ease-in-out infinite;
}
.splat-hole:nth-child(2n) .splat-gremlin { animation-delay:.3s; }
.splat-hole:nth-child(3n) .splat-gremlin { animation-delay:.6s; }
/* Back row (the 2 staggered-behind holes) reads slightly smaller — a cheap
   depth cue for the cabinet. Nothing else about them changes: same bob,
   same whack/duck animations, same mallet, same goo. */
.splat-holes > .splat-hole:nth-child(even) .splat-gremlin { font-size:clamp(27px,5.6vh,45px); }
@keyframes splatBob { 0%,100% { translate:0 0; } 50% { translate:0 -5px; } }

.splat-card {
  position:relative; z-index:3; margin-top:2px; display:block;
  background: linear-gradient(160deg,#fff3ce,#f4c542); color:var(--ink);
  font-family:'Fredoka',sans-serif; font-weight:700; font-size:clamp(16px,3.2vh,24px);
  min-width:46px; padding:5px 10px; border-radius:12px; text-align:center;
  box-shadow: 0 4px 0 var(--gold-deep,#d9a21b); border:2px solid rgba(255,255,255,.5);
}
.splat-holes > .splat-hole:nth-child(even) .splat-card { font-size:clamp(14px,2.6vh,19px); padding:4px 8px; }

/* ---------- the whack: gremlin flattens to a pancake, then pings off spinning ---------- */
.splat-gremlin.whack { animation: splatWhack .9s both; }
@keyframes splatWhack {
  0%   { translate:0 0; rotate:0deg; scale:1 1; opacity:1; }
  13%  { translate:0 -2px; rotate:-4deg; scale:.94 1.08; opacity:1; }
  30%  { translate:0 9px; rotate:-2deg; scale:1.55 .24; opacity:1; }
  75%  { translate:0 9px; rotate:2deg; scale:1.5 .27; opacity:1; }
  100% { translate: var(--fly-x,70px) var(--fly-y,-140px); rotate: var(--fly-rot,640deg); scale:.4 .4; opacity:0; }
}
.splat-card.whack { animation: splatCardWhack .9s both; }
@keyframes splatCardWhack {
  0% { scale:1; opacity:1; }
  30% { scale:1.24; opacity:1; }
  55%,75% { scale:1.05; opacity:1; }
  100% { scale:.7; opacity:0; translate:0 -10px; }
}

/* ---------- miss: raspberry + a duck-and-wiggle, never a flat "wrong" ---------- */
.splat-gremlin.duck { animation: splatDuck .62s ease both; }
@keyframes splatDuck {
  0%   { translate:0 0; rotate:0deg; scale:1 1; }
  18%  { translate:0 13px; rotate:-7deg; scale:1.06 .82; }
  38%  { translate:0 13px; rotate:9deg; scale:1.06 .82; }
  58%  { translate:0 9px; rotate:-8deg; scale:1.03 .88; }
  78%  { translate:0 5px; rotate:5deg; scale:1.01 .95; }
  100% { translate:0 0; rotate:0deg; scale:1 1; }
}
.splat-card.flash-correct { animation: splatFlashGreen .95s ease-in-out both; }
@keyframes splatFlashGreen {
  0%,100% { box-shadow:0 4px 0 var(--gold-deep,#d9a21b); background:linear-gradient(160deg,#fff3ce,#f4c542); }
  15%,85% { box-shadow:0 0 0 4px var(--correct), 0 4px 0 var(--gold-deep,#d9a21b); background:linear-gradient(160deg,#eafff2,#8ce6ae); }
}

/* ---------- the mallet — >=140px, arcs in with a wind-up, holds on impact ---------- */
.splat-mallet-fx {
  position:absolute; left:50%; bottom:16%; z-index:6; pointer-events:none;
  font-size:140px; line-height:1; translate:-50% -6px;
  animation: splatMalletSwing .9s both;
  filter: drop-shadow(0 8px 10px rgba(0,0,0,.45));
}
.splat-mallet-fx.tier-1 { font-size:172px; filter: drop-shadow(0 8px 10px rgba(0,0,0,.45)) drop-shadow(0 0 22px rgba(255,159,67,.65)); }
.splat-mallet-fx.tier-2 { font-size:206px; filter: drop-shadow(0 8px 10px rgba(0,0,0,.45)) drop-shadow(0 0 30px rgba(244,197,66,.9)); }
@keyframes splatMalletSwing {
  0%   { rotate:-22deg; translate:-50% -6px;  scale:1;    opacity:1; }
  13%  { rotate:-66deg; translate:-50% -30px; scale:1.05; opacity:1; }
  30%  { rotate:16deg;  translate:-50% 6px;   scale:1;    opacity:1; }
  75%  { rotate:9deg;   translate:-50% 8px;   scale:.97;  opacity:1; }
  100% { rotate:-40deg; translate:-50% -38px; scale:1;    opacity:0; }
}

/* ---------- radial splat-star at the moment of impact ---------- */
.splat-star {
  position:absolute; left:50%; top:36%; translate:-50% -50%; z-index:7; pointer-events:none;
  font-size:56px; opacity:0; scale:.3;
  animation: splatStarBurst .5s cubic-bezier(.2,1.4,.4,1) both;
}
@keyframes splatStarBurst {
  0% { opacity:0; scale:.2; rotate:-15deg; }
  35% { opacity:1; scale:1.35; rotate:8deg; }
  100% { opacity:0; scale:1.1; rotate:0deg; }
}

.splat-float {
  position:absolute; top:-2px; left:50%; translate:-50% 0;
  font-family:'Fredoka',sans-serif; font-weight:700; font-size:14px; color:var(--pier-bulb,#ffe9a8);
  text-shadow:0 2px 4px rgba(0,0,0,.5); pointer-events:none; z-index:8; white-space:nowrap;
  animation: splatFloatUp .7s ease-out both;
}
@keyframes splatFloatUp {
  0% { opacity:0; translate:-50% 0; scale:.7; }
  25% { opacity:1; translate:-50% -14px; scale:1.1; }
  100% { opacity:0; translate:-50% -46px; scale:1; }
}

/* ---------- combo tier-up flash ---------- */
.splat-combo {
  position:absolute; top:4%; left:50%; translate:-50% -50%; scale:.6;
  font-family:'Fredoka',sans-serif; font-weight:700; font-size:clamp(20px,4.6vh,34px);
  color:var(--pier-pink,#ff4fa3); text-shadow:0 0 16px rgba(255,79,163,.7), 0 4px 0 rgba(0,0,0,.4);
  pointer-events:none; z-index:9; opacity:0; letter-spacing:.02em; white-space:nowrap; text-align:center;
}
.splat-combo.show { animation: splatComboFlash .85s var(--spring) both; }
@keyframes splatComboFlash {
  0% { opacity:0; translate:-50% -50%; scale:.4; rotate:-6deg; }
  30% { opacity:1; translate:-50% -50%; scale:1.15; rotate:3deg; }
  60% { translate:-50% -50%; scale:1; rotate:0deg; }
  100% { opacity:0; translate:-50% -62%; scale:1.05; rotate:0deg; }
}

/* ---------- pre-round GET READY countdown ---------- */
.splat-countdown {
  position:absolute; top:50%; left:50%; translate:-50% -50%; z-index:25; pointer-events:none;
  font-family:'Fredoka',sans-serif; font-weight:700; font-size:min(88px,16vh); color:var(--pier-bulb,#ffe9a8);
  text-shadow:0 0 20px rgba(255,233,168,.6), 0 5px 0 rgba(0,0,0,.4);
}
.splat-countdown.pop { animation: splatCdPop .5s var(--spring) both; }
@keyframes splatCdPop {
  0% { translate:-50% -50%; scale:.4; opacity:0; }
  60% { translate:-50% -50%; scale:1.15; opacity:1; }
  100% { translate:-50% -50%; scale:1; opacity:1; }
}

/* ---------- Dave steals the mallet ---------- */
.splat-dave-layer { position:absolute; inset:0; z-index:20; pointer-events:none; }
.splat-dave {
  position:absolute; top:18%; left:-15%; font-size:50px;
  filter:drop-shadow(0 6px 10px rgba(0,0,0,.4));
  animation: splatDaveSwoop 1.5s cubic-bezier(.4,.1,.3,1) both;
}
@keyframes splatDaveSwoop {
  0% { left:-15%; translate:0 0; rotate:-8deg; }
  50% { translate:0 -44px; rotate:6deg; }
  100% { left:115%; translate:0 12px; rotate:-4deg; }
}

/* ---------- welcome / end-screen overlay content (chassis.overlay() card) ---------- */
.splat-ov-emoji { font-size:52px; margin-bottom:6px; filter:drop-shadow(0 4px 8px rgba(0,0,0,.4)); }
.splat-ov-title { font-family:'Fredoka',sans-serif; font-weight:700; font-size:22px; color:var(--pier-bulb,#ffe9a8); margin:0 0 10px; letter-spacing:.02em; }
.splat-ov-line {
  font-size:14px; line-height:1.4; font-weight:500; color:rgba(246,235,212,.85);
  background:rgba(255,255,255,.06); border-radius:12px; padding:9px 12px; margin-bottom:12px;
}
.splat-ov-blurb { font-size:13.5px; line-height:1.4; color:rgba(246,235,212,.75); margin:0 0 16px; }
.splat-ov-btn { min-height:60px; padding:0 30px; font-size:17px; width:100%; }
.splat-ov-newrecord {
  font-family:'Fredoka',sans-serif; font-weight:700; font-size:15px; color:var(--gold,#f4c542);
  margin-bottom:8px; animation: splatNewRecordGlow 1.1s ease-in-out infinite;
}
@keyframes splatNewRecordGlow { 0%,100% { text-shadow:0 0 6px rgba(244,197,66,.4); } 50% { text-shadow:0 0 18px rgba(244,197,66,.9); } }
.splat-ov-score { font-family:'Fredoka',sans-serif; font-weight:700; font-size:48px; color:var(--parchment); margin-bottom:4px; }
.splat-ov-score span { font-size:16px; font-weight:500; color:rgba(246,235,212,.7); margin-left:6px; }
.splat-ov-tierrow { justify-content:center; margin-bottom:12px; }
`;

export default {
  id: 'splat',
  title: 'SPLAT-A-GREMLIN',
  blurb: 'Whack the right number before the gremlins scarper!',

  mount(host, ctx, pier) {
    injectCss('pier-splat', CSS);

    let alive = true;
    let rng = mulberry32((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
    let score = 0;
    let streak = 0;
    let roundOver = true;
    let acceptingTaps = false;
    let currentFact = null;
    let questionShownAt = 0;
    let holeEls = [];
    let lastTickSec = null;
    let mainTweenCancel = null;
    let activeOverlay = null;

    const timers = new Set();
    const later = (fn, ms) => {
      const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms);
      timers.add(id);
      return id;
    };
    const clearAllTimers = () => { timers.forEach((id) => clearTimeout(id)); timers.clear(); };

    /* ---------- chassis skeleton (docs/PIER_REWORK.md §1) — the dock is
       deliberately left empty: this machine is tap-based, no numpad/primary
       control belongs there. ---------- */
    const chassis = pier.mountChassis({
      onBack: () => { ctx.audio.sfx('back'); ctx.go('#/pier'); },
      backLabel: '← PIER',
      hudClass: 'splat-hud',
      stageClass: 'splat-stagefx',
      dockClass: 'splat-dock',
    });

    // F4 fix: `.splat-chip` is `display:flex` (for vertical centring) with
    // mixed raw-text + `<b>` content directly inside it — the EXACT bug
    // js/screens/pier.js and js/pier/modes/tank.js already found and fixed
    // on their own chips (flexbox wraps each maximal run of inline content
    // in its own anonymous flex item, then trims THAT item's own leading/
    // trailing whitespace, silently eating the space either side of `<b>` —
    // "SCORE0" / "MALLET×0" instead of "SCORE 0" / "MALLET ×0"). Fix
    // (identical to theirs): wrap the whole label in one inline `<span>` so
    // it's the flex container's only child/flex item, where ordinary inline
    // whitespace rules apply throughout its content.
    const scoreChip = el('div', 'splat-chip splat-score-chip', '<span>SCORE <b>0</b></span>');
    const ring = el('div', 'splat-ring');
    ring.style.setProperty('--pct', '100');
    const ringNum = el('span', 'splat-ring-num', '60');
    ring.append(ringNum);
    const toolChip = el('div', 'splat-chip splat-tool-chip', '<span>🔨 <b>MALLET</b> ×0</span>');
    toolChip.hidden = true;
    chassis.hud.append(scoreChip, ring, toolChip);

    const questionEl = el('div', 'splat-question', '');
    const arena = el('div', 'splat-arena');
    // `.splat-field` (F5 fix) is the cabinet floor below the mallet's swing
    // clearance — the goo layer and the holes grid are both pinned to its
    // exact rect (`.splat-fivegrid`, see the CSS), so they always line up.
    const field = el('div', 'splat-field');
    const gooLayer = el('div', 'splat-goo-layer splat-fivegrid');
    const gooCells = [];
    for (let i = 0; i < HOLE_COUNT; i += 1) {
      const c = el('div', 'splat-goo-cell');
      gooLayer.append(c);
      gooCells.push(c);
    }
    const holesWrap = el('div', 'splat-holes splat-fivegrid');
    const comboEl = el('div', 'splat-combo');
    const daveLayer = el('div', 'splat-dave-layer');
    field.append(gooLayer, holesWrap);
    arena.append(field, comboEl, daveLayer);

    const shakeWrap = el('div', 'splat-shakewrap');
    shakeWrap.append(questionEl, arena);
    chassis.stage.append(shakeWrap);

    const scoreNum = scoreChip.querySelector('b');

    /* ---------- tiny helpers ---------- */
    function bump(chipEl) {
      chipEl.classList.remove('pop');
      void chipEl.offsetWidth; // restart the pop animation even on rapid-fire hits
      chipEl.classList.add('pop');
    }
    function updateScoreHud() {
      scoreNum.textContent = String(score);
      bump(scoreChip);
    }
    function updateToolHud() {
      const tier = toolForStreak(streak);
      if (streak >= 2) {
        toolChip.hidden = false;
        toolChip.className = 'splat-chip splat-tool-chip ' + tier.cls;
        // Same F4 fix as the chip's initial markup above: keep the whole
        // label inside ONE `<span>` on every rewrite, not just at creation.
        toolChip.innerHTML = `<span>${tier.emoji} <b>${tier.name}</b> ×${streak}</span>`;
        bump(toolChip);
      } else {
        toolChip.hidden = true;
      }
      return tier;
    }
    function shakeStage() {
      shakeWrap.classList.remove('shake');
      void shakeWrap.offsetWidth;
      shakeWrap.classList.add('shake');
      later(() => shakeWrap.classList.remove('shake'), 300);
    }
    function spawnStar(holeEl) {
      const s = el('span', 'splat-star', '💥');
      holeEl.append(s);
      later(() => s.remove(), 520);
    }
    function spawnFloat(holeEl, text) {
      const f = el('span', 'splat-float', text);
      holeEl.append(f);
      later(() => f.remove(), 720);
    }
    function spawnMallet(holeEl, tier) {
      const m = el('span', 'splat-mallet-fx ' + tier.cls, tier.emoji);
      holeEl.append(m);
      later(() => m.remove(), HIT_ANIM_MS + 60);
    }
    function splatGoo(i) {
      const c = gooCells[i];
      if (!c) return;
      const fr = freshRng();
      c.style.setProperty('--goo-rot', (fr() * 46 - 23).toFixed(1) + 'deg');
      c.style.setProperty('--goo-scale', (0.85 + fr() * 0.35).toFixed(2));
      c.classList.remove('splat');
      void c.offsetWidth; // restart if the same slot splats again before the previous fade finished
      c.classList.add('splat');
      later(() => c.classList.remove('splat'), GOO_FADE_MS);
    }
    function comboFlash(name) {
      comboEl.textContent = `${name} UNLOCKED! 🔥`;
      comboEl.classList.remove('show');
      void comboEl.offsetWidth;
      comboEl.classList.add('show');
    }
    function celebrateFlush(name) {
      const line = pickLine(M.gremlinFlush);
      if (line) pier.say(line);
      toast(chassis.stage, `${name} FLUSHED! 🚽💨`);
      sparkleBurst(chassis.stage, chassis.stage.clientWidth / 2, chassis.stage.clientHeight / 2, 12);
    }
    function tierChipsHtml(bestVal, goldSeen, tiers) {
      const icons = { bronze: '🥉', silver: '🥈', gold: '🥇' };
      const chips = ['bronze', 'silver', 'gold'].map((t) => {
        const achieved = bestVal != null && bestVal >= tiers[t];
        return `<span class="pier-tier-chip${achieved ? ' achieved' : ''}" title="${t}">${icons[t]}</span>`;
      }).join('');
      const trophy = goldSeen ? '<span class="pier-trophy" title="Gold beaten!">🏆</span>' : '';
      return chips + trophy;
    }

    /* ---------- question lifecycle ---------- */
    function renderHoles(values, answer) {
      holesWrap.innerHTML = '';
      holeEls = [];
      values.forEach((val, i) => {
        const hole = el('button', 'splat-hole');
        hole.type = 'button';
        hole.dataset.val = String(val);
        hole.innerHTML = '<span class="splat-mound"></span>'
          + '<span class="splat-gremlin">👺</span>'
          + `<span class="splat-card">${val}</span>`;
        hole.addEventListener('click', () => onTapHole(hole, val, answer, i));
        holesWrap.append(hole);
        holeEls.push(hole);
      });
    }

    function nextQuestion() {
      if (!alive || roundOver) return;
      const fact = pier.facts.draw(rng, { deluxe: pier.deluxe });
      currentFact = fact;
      questionShownAt = performance.now();
      questionEl.textContent = fact.stem;
      const distractors = pier.facts.distractors(fact, rng, HOLE_COUNT - 1);
      const values = shuffle(rng, [fact.answer, ...distractors]);
      renderHoles(values, fact.answer);
      acceptingTaps = true;
    }

    function onTapHole(holeEl, val, answer, holeIndex) {
      if (!acceptingTaps || roundOver || !alive) return;
      acceptingTaps = false;
      const elapsedMs = Math.round(performance.now() - questionShownAt);
      const correct = val === answer;
      const family = currentFact.family;
      let rec = { justFlushed: false };
      try {
        rec = pier.facts.record(family, { correct, ms: elapsedMs, mode: 'splat' }) || rec;
      } catch (e) { /* a stats hiccup must never freeze the game */ }

      if (correct) {
        score += 1;
        streak += 1;
        const tier = updateToolHud();
        const tierJustReached = streak === tier.min && tier.min > 0;
        updateScoreHud();

        const gremlinEl = holeEl.querySelector('.splat-gremlin');
        const cardEl = holeEl.querySelector('.splat-card');
        const flight = pickFlight();
        gremlinEl.style.setProperty('--fly-x', flight.x + 'px');
        gremlinEl.style.setProperty('--fly-y', flight.y + 'px');
        gremlinEl.style.setProperty('--fly-rot', flight.rot + 'deg');
        gremlinEl.classList.add('whack');
        cardEl.classList.add('whack');
        spawnFloat(holeEl, streak >= 3 ? (tierJustReached ? `${tier.name} UNLOCKED!` : `${tier.name}!`) : 'SPLAT! +1');
        spawnMallet(holeEl, tier);

        later(() => {
          if (!alive) return;
          sfx.pop();
          if (tier.cls === 'tier-1') sfx.tick(2);
          if (tier.cls === 'tier-2') { sfx.tick(3); sfx.sparkle(); }
          shakeStage();
          spawnStar(holeEl);
          splatGoo(holeIndex);
          if (tierJustReached) {
            comboFlash(tier.name);
            const line = pickLine(M.combo);
            if (line) pier.say(line);
          }
          if (rec.justFlushed) {
            // See FLUSH_CAPTION_STAGGER_MS above: only stagger when a combo
            // caption just claimed the bar this same tick — an unaccompanied
            // flush still celebrates immediately, same as before.
            if (tierJustReached) later(() => celebrateFlush(rec.name), FLUSH_CAPTION_STAGGER_MS);
            else celebrateFlush(rec.name);
          }
        }, IMPACT_DELAY_MS);

        later(() => { if (!roundOver) nextQuestion(); }, CORRECT_PAUSE_MS);
      } else {
        streak = 0;
        updateToolHud();
        ctx.audio.sfx('wrong');
        const gremlinEl = holeEl.querySelector('.splat-gremlin');
        gremlinEl.classList.add('duck');
        spawnFloat(holeEl, 'PBBBT!');
        const correctHole = holeEls.find((h) => Number(h.dataset.val) === answer);
        if (correctHole) correctHole.querySelector('.splat-card').classList.add('flash-correct');
        const line = pickLine(M.nearMiss);
        if (line) pier.say(line);
        later(() => { if (!roundOver) nextQuestion(); }, WRONG_PAUSE_MS);
      }
    }

    /* ---------- round clock — tween() used purely for its rAF-cadence +
       tab-hide-safe completion guard (Hard Rule ④); the eased value it hands
       `apply` is ignored in favour of a recomputed true elapsed time, exactly
       v1's proven technique (see that file's original header note). ---------- */
    function paintRing(remainingMs) {
      const pct = Math.max(0, Math.min(100, (remainingMs / ROUND_MS) * 100));
      ring.style.setProperty('--pct', pct.toFixed(2));
      const secLeft = Math.max(0, Math.ceil(remainingMs / 1000));
      ringNum.textContent = String(secLeft);
      ring.classList.toggle('urgent', secLeft <= TICK_WINDOW_SEC && secLeft > 0);
      if (secLeft <= TICK_WINDOW_SEC && secLeft >= 1 && secLeft !== lastTickSec) {
        lastTickSec = secLeft;
        ctx.audio.sfx('tick');
      }
    }

    function startRoundTimer() {
      if (mainTweenCancel) { mainTweenCancel(); mainTweenCancel = null; }
      const t0 = performance.now();
      mainTweenCancel = tween(() => {
        const remaining = Math.max(0, ROUND_MS - (performance.now() - t0));
        paintRing(remaining);
      }, 0, 1, ROUND_MS, () => { mainTweenCancel = null; onTimeUp(); });
    }

    function onTimeUp() {
      if (!alive) return;
      if (acceptingTaps && currentFact) {
        const elapsedMs = Math.round(performance.now() - questionShownAt);
        try {
          pier.facts.record(currentFact.family, { correct: false, ms: elapsedMs, mode: 'splat' });
        } catch (e) { /* a stats hiccup must never freeze the game */ }
      }
      roundOver = true;
      acceptingTaps = false;
      questionEl.textContent = '';
      holesWrap.innerHTML = '';
      const line = pickLine(M.daveTheft);
      if (line) pier.say(line);
      const dave = el('div', 'splat-dave', '🐦🔨');
      daveLayer.append(dave);
      later(() => dave.remove(), DAVE_MS + 150);
      later(() => { if (alive) showEndScreen(score); }, DAVE_MS);
    }

    /* ---------- pre-round "GET READY" beat ---------- */
    function runCountdown(cb) {
      const cd = el('div', 'splat-countdown');
      chassis.stage.append(cd);
      const seq = ['3', '2', '1', 'GO!'];
      let i = 0;
      const step = () => {
        if (!alive) { cd.remove(); return; }
        cd.textContent = seq[i];
        cd.classList.remove('pop');
        void cd.offsetWidth;
        cd.classList.add('pop');
        if (seq[i] === 'GO!') sfx.pop(); else sfx.tick(i);
        i += 1;
        if (i < seq.length) later(step, COUNTDOWN_STEP_MS);
        else later(() => { cd.remove(); if (alive) cb(); }, COUNTDOWN_STEP_MS);
      };
      step();
    }

    function startRound() {
      rng = mulberry32((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
      score = 0; streak = 0; lastTickSec = null; roundOver = false;
      updateScoreHud(); updateToolHud();
      const line = pickLine(announcer.roundStart);
      if (line) pier.say(line);
      nextQuestion();
      startRoundTimer();
    }

    /* ---------- welcome + end screens — SCREEN-LEVEL overlay (contract §1.4) ---------- */
    function showWelcome() {
      const card = el('div', 'splat-ov');
      const line = pickLine(M.welcome);
      card.innerHTML = '<div class="splat-ov-emoji">🔨</div>'
        + '<h2 class="splat-ov-title">SPLAT-A-GREMLIN</h2>'
        + (line ? `<div class="splat-ov-line">${line.text}</div>` : '')
        + '<p class="splat-ov-blurb">Whack the right number — five holes, sixty seconds, as many splats as you can land!</p>'
        + '<button type="button" class="btn btn-gold splat-ov-btn splat-start-btn">START 🔨</button>';
      activeOverlay = chassis.overlay(card, { cardClass: 'splat-ov-card', speaks: line || undefined });
      if (line) pier.say(line);
      card.querySelector('.splat-start-btn').addEventListener('click', (ev) => {
        ev.currentTarget.disabled = true;
        sfx.ui();
        if (activeOverlay) { activeOverlay.close(); activeOverlay = null; }
        runCountdown(startRound);
      });
    }

    async function showEndScreen(finalScore) {
      if (!alive) return;
      let bests = {};
      try { bests = (await pier.facts.getBests()) || {}; } catch (e) { bests = {}; }
      if (!alive) return;
      const prevBest = bests.splat || null;
      const prevScore = prevBest ? prevBest.score : null;
      const isNewRecord = prevScore == null || finalScore > prevScore;
      const tiers = pier.facts.nanaTiers('splat') || { bronze: 12, silver: 20, gold: 30 };
      const goldAlready = !!(prevBest && prevBest.goldSeen);
      const goldJustBeaten = finalScore >= tiers.gold && !goldAlready;

      if (isNewRecord || goldJustBeaten) {
        const patch = {};
        if (isNewRecord) { patch.score = finalScore; patch.when = Date.now(); }
        if (goldJustBeaten) patch.goldSeen = true;
        try { await pier.facts.putBest('splat', patch); } catch (e) { /* best effort — the round still shows correctly */ }
      }
      if (!alive) return;

      const bestValAfter = isNewRecord ? finalScore : prevScore;
      const goldSeenAfter = goldAlready || goldJustBeaten;

      let lineEntry;
      if (goldJustBeaten) lineEntry = pickLine(M.goldBeaten);
      else if (isNewRecord) lineEntry = pickLine(M.newPB);
      else lineEntry = pickLine(nana.win);
      if (isNewRecord || goldJustBeaten) { sfx.win(); party(chassis.stage); }

      const card = el('div', 'splat-ov');
      card.innerHTML = '<div class="splat-ov-emoji">🔨</div>'
        + '<h2 class="splat-ov-title">TIME\'S UP!</h2>'
        + (isNewRecord ? '<div class="splat-ov-newrecord">🏆 NEW RECORD! 🏆</div>' : '')
        + `<div class="splat-ov-score">${finalScore}<span> splat${finalScore === 1 ? '' : 's'}</span></div>`
        + `<div class="pier-tier-row splat-ov-tierrow">${tierChipsHtml(bestValAfter, goldSeenAfter, tiers)}</div>`
        + (lineEntry ? `<div class="splat-ov-line">${lineEntry.text}</div>` : '')
        + '<button type="button" class="btn btn-gold splat-ov-btn splat-again-btn">ONE MORE GO 🔨</button>';
      activeOverlay = chassis.overlay(card, { cardClass: 'splat-ov-card', speaks: lineEntry || undefined });
      if (lineEntry) pier.say(lineEntry);
      card.querySelector('.splat-again-btn').addEventListener('click', (ev) => {
        ev.currentTarget.disabled = true;
        sfx.ui();
        if (activeOverlay) { activeOverlay.close(); activeOverlay = null; }
        runCountdown(startRound);
      });
    }

    showWelcome();

    return function cleanup() {
      alive = false;
      clearAllTimers();
      if (mainTweenCancel) { mainTweenCancel(); mainTweenCancel = null; }
      if (activeOverlay) { activeOverlay.close(); activeOverlay = null; }
      // host/screen removal (js/screens/pier.js unmount()) takes the whole
      // chassis DOM tree with it — nothing else to tear down by hand here.
    };
  },
};
