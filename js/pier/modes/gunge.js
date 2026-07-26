// FART QUEST — js/pier/modes/gunge.js (GUNGE agent)
// THE GUNGE TANK — survival cabinet: numpad answers keep a plank aloft over
// a bubbling gunge vat. A continuous drain (ramping every 15s) is fought
// back with correct-answer boosts; a wrong OR too-slow answer lurches the
// plank down and flashes the real fact family. Score = seconds survived.
// See docs/PIER_SPEC.md §6 "gunge" (mechanic) and docs/PIER_REWORK.md §1
// (THE LAYOUT LAW — binding) + §3 "gunge" (the animation/feel overhaul this
// rework pass exists to deliver) + §0 (the measured v1 diagnosis this file
// fixes: at 1000×540 the GO key's bottom was 569px, 29px below the fold,
// with no scroll rescue — the numpad now lives in the chassis DOCK, which
// never shrinks and is never clipped; see the chassis-gap note below).
//
// Contract: mount(host, ctx, pier) -> cleanup(). `pier` = {facts, content,
// say, deluxe, mountChassis} (hub-provided kit, §4/§5 of PIER_SPEC +
// js/screens/pier.js's header comment). Everything fact-related goes through
// `pier.facts`, never a direct db/IndexedDB touch from here.
//
// REWORK v2 — REBUILT chassis-first: this file no longer owns its own
// in-stage veil/back-button/absolute-stage shell (that was v1's exact bug —
// `.gg-back`/`.gg-stage` sat OUTSIDE the flex column the hub established, so
// nothing forced the numpad to stay on screen). Everything now goes through
// `pier.mountChassis(...)` -> {hud, stage, dock, overlay}: the numpad lives
// in `dock` (flex:none, never shrinks, keys floor at 60px via css/pier.css's
// shared `.pier-numpad` rules — completely out of this file's hands, which
// is exactly the point), the welcome/end cards go through `chassis.overlay()`
// (screen-level, `translate:`-centred, `max-height:calc(100dvh-32px)`), and
// the vat/plank/winch SCENE lives in `stage` (flex:1; min-height:0 — it is
// the one thing allowed to shrink, and only decorative, non-interactive
// content lives there, so a tight viewport just makes the scene compact,
// never unreachable).
//
// *** CHASSIS GAP FOUND + WORKED AROUND (flagged for the chassis agent) ***
// `js/pier/padkit.js`'s `mountChassis(container, opts)` adds a `.pier-chassis`
// class to `container` and its own doc comment says "container must already
// be the flex column itself — css/pier.css pre-wires this for BOTH...
// `.pier-screen`... and `.pier-mode-host`". That is true for the HUB route
// (`.pier-screen.screen` hardcodes `display:flex;flex-direction:column`
// directly in css/pier.css), but as of this build there is NO CSS rule
// anywhere targeting `.pier-chassis` (grepped css/pier.css AND css/main.css —
// zero hits) and `.pier-mode-host` itself only declares
// `flex:1 1 auto; min-height:0; position:relative; overflow-y:...` — no
// `display:flex`. Without that, `.pier-hud`/`.pier-stage`/`.pier-dock`'s own
// `flex:none` / `flex:1 1 auto` rules are INERT (a `flex:` property only
// does anything on a flex ITEM, and a flex item requires a flex-container
// PARENT) — every mode that calls `pier.mountChassis(host, ...)` would get
// hud/stage/dock stacking as plain blocks with no shrink-the-stage-not-the-
// dock behaviour at all, silently reproducing THE EXACT v1 bug this whole
// rework exists to fix. Verified live in the browser (see report) before
// writing a single pixel of vat art on top of it.
// FIX (scoped to THIS file only — does not touch css/pier.css, does not
// affect any other mode; identical in spirit and selector to the SAME
// gap independently found+worked-around in splat.js/ghost.js/tank.js):
// this file's own injected CSS carries
// `.pier-mode-host.pier-chassis { display:flex; flex-direction:column; }`
// — using the `.pier-chassis` class `mountChassis()` ALREADY auto-adds to
// `host` (padkit.js), rather than a bespoke class, so the rule is byte-
// identical to the other three modes' own workaround (idempotent — no
// cascade fight regardless of mount order, per their own comments). Earlier
// in this build this rule also carried `overflow:hidden`, which — because
// this compound selector targets `.pier-mode-host` itself, the SAME element
// that holds hud/stage/DOCK (the numpad) — silently deleted THE LAYOUT LAW's
// mandatory scroll-rescue fallback (`.pier-mode-host`'s own `overflow-y:auto`,
// css/pier.css's explicit "degrades to scrollable, never physically
// unreachable" contract, §1.5). Dropped: this rule only ever needs to turn
// the host into a flex COLUMN so hud/stage/dock size correctly; nothing in
// this file's scene depends on the host itself clipping (the vat splash etc.
// live inside `chassis.stage`, which already owns its own
// `overflow-y:auto;overflow-x:hidden` from css/pier.css). css/pier.css still
// needs a real `.pier-chassis { display:flex; flex-direction:column; }` rule
// so every future mode gets this for free instead of each one re-discovering
// the same gap. Flagged loudly for reviewers / the chassis agent, per the
// task brief.

import {
  el, sfx, tween, party, injectCss,
} from '../../anims/_kit.js';
import { makeNumpad } from '../padkit.js';
import { mulberry32, pick } from '../../rng.js';
// `pier.content` (js/screens/pier.js's whitelist) only forwards
// nana/announcer/dave/gremlin — NOT `machine` (content.js's own header
// comment flags this explicitly and names this exact workaround: "each mode
// imports `machine` directly from this file the same way
// js/pier/modes/tank.js already does for `GREMLIN_NAMES`"). Mirrors that
// precedent — a plain sibling import, not an edit to a file this agent
// doesn't own.
import { machine } from '../content.js';

/* =====================================================================
 * Tuning constants
 * ===================================================================== */
const START_GAUGE = 100;
const BASE_DRAIN_PER_SEC = 4;       // an untouched plank empties in 25s
const RAMP_EVERY_MS = 15000;        // "drain ramp every 15s" (spec, binding)
const RAMP_MULTIPLIER = 1.28;
const TICK_MS = 220;                // one continuous-drain tween "tick"
const BOOST_AMOUNT = 16;            // correct answer, gauge points
const LURCH_AMOUNT = 18;            // wrong/slow answer, gauge points
const SLOW_MS = 6000;               // matches facts.js's own gremlin slow-time
                                     // threshold — a "slow" answer here is one
                                     // that would also nudge the family toward
                                     // gremlin status upstream.
const FLASH_MS = 1700;              // how long the fact-family flash holds —
                                     // comfortably clear of the "nothing that
                                     // carries meaning under 250ms" floor.
const RESET_RISE_MS = 550;          // plank hoist-back-up animation on (re)start
const STREAK_FOR_FLOURISH = 5;
const FLUSH_COMBO_STAGGER_MS = 1800; // see handleCorrect(): when a gremlin flush
                                     // and the 5th-streak combo land on the SAME
                                     // submit, the combo caption waits this long
                                     // behind the flush caption so pier.js's
                                     // shared caption bar (no queue, immediate
                                     // replace) shows both lines in sequence
                                     // instead of the combo silently discarding
                                     // the flush ceremony line at 0ms.

// Plank/vat geometry — all percentages of `.gg-vatwrap`'s own box, so the
// whole scene scales with however much room the flex STAGE actually has
// (down to a genuinely tight budget at 1000×540 — see the report's measured
// numbers) without a single hardcoded pixel assumption.
const PLANK_TOP_MIN = 13;   // % from vatwrap top, healthy plank (near the winch)
const PLANK_TOP_MAX = 50;   // % from vatwrap top, empty gauge (right at the goo line)
const MAX_TILT_DEG = 16;    // plank tilt at 0 gauge — "visibly tilts... as the gauge falls"
const FRAY_LOW_PCT = 45;    // rope starts fraying
const FRAY_CRIT_PCT = 20;   // rope fraying badly / meter critical / figure scared

const WINCH_NOTCH_DEG = 34; // one ratchet "notch" per correct answer

// Death set-piece stage durations (ms) — each a distinct, held beat; every
// one comfortably clears the 250ms "nothing that carries meaning may flash
// by" floor (docs/PIER_REWORK.md, binding).
const CRACK_MS = 320;
const FALL_MS = 850;
const SPLASH_HOLD_MS = 780;
const SURFACE_HOLD_MS = 820;
const DAVE_HOLD_MS = 680;

const STAMP_WORDS = ['GLOOOOOP!', 'SPLOOSH!', 'GUNGED!', 'KERSPLAT!'];

/* ---------- tiny pure helpers ---------- */
// Recomputed directly from the exact fact the player was just asked — NEVER
// from the family key's canonical lo/hi order. facts.js's buildFact() picks
// EITHER factor as the divisor with 50/50 chance for a division draw, so
// reconstructing purely from the sorted family silently swaps in the OTHER
// division fact half the time — a live rule breach (feedback must only
// quote the number/state exactly on screen). Anchoring on fact.a/fact.b/
// fact.answer keeps this locked to what was actually shown.
function familyFlashText(fact) {
  if (fact.dir === 'div') {
    const dividend = fact.a * fact.b;
    return `${fact.a} × ${fact.b} = ${dividend}, so ${dividend} ÷ ${fact.a} = ${fact.b}`;
  }
  return `${fact.a} × ${fact.b} = ${fact.answer}, so ${fact.answer} ÷ ${fact.b} = ${fact.a}`;
}
function liveSecondsText(ms) { return `${Math.floor(Math.max(0, ms) / 1000)}s`; }
function clamp01to100(v) { return Math.max(0, Math.min(100, v)); }

function sayFrom(pier, rng, pool) {
  if (!Array.isArray(pool) || !pool.length) return null;
  const entry = pick(rng, pool);
  if (entry) pier.say(entry);
  return entry;
}

/* ---------- self-contained styles ---------- */
const CSS = `
/* --- chassis workaround, see header comment: same idempotent selector as
   splat.js/ghost.js/tank.js's own fix, deliberately NO overflow override so
   .pier-mode-host's defensive overflow-y:auto scroll-rescue (css/pier.css
   §1.5) survives --- */
.pier-mode-host.pier-chassis { display:flex; flex-direction:column; }

/* ============================================================
   HUD — survival timer chip
   ============================================================ */
.gg-timer { font-family:'Fredoka',sans-serif; font-weight:700; font-size:clamp(12px,1.6vh + 8px,15px); color:var(--pier-teal); background:rgba(10,18,48,.6); border:2px solid rgba(47,227,196,.35); border-radius:999px; padding:5px 14px; min-height:34px; display:flex; align-items:center; transition:box-shadow 180ms ease; white-space:nowrap; }
.gg-timer.gg-ramp-pulse { animation:gg-ramp-flash .5s ease-out; }
@keyframes gg-ramp-flash { 0%{ box-shadow:0 0 0 0 rgba(255,79,163,.55); } 100%{ box-shadow:0 0 0 14px rgba(255,79,163,0); } }

/* ============================================================
   STAGE — the whole vat/plank/winch scene. flex column so the fact stem
   and the play area share whatever height the chassis actually grants
   (down to a genuinely tight budget at 1000×540 — see the report).
   ============================================================ */
.gg-stage { padding: 4px 10px 6px; }
.gg-stage-inner { height:100%; display:flex; flex-direction:column; gap:clamp(2px,0.8vh,8px); align-items:stretch; }

/* Question stems read plain and calm — silliness lives in the chrome, never
   the stem typography (PIER_SPEC §2, binding). System font, not Fredoka.
   Sized off vh so it shrinks gracefully rather than ever forcing scroll. */
.gg-fact { flex:none; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-weight:700; font-size:clamp(15px,3.6vh,32px); color:var(--parchment); text-align:center; line-height:1.15; }

.gg-playarea { flex:1 1 auto; min-height:0; display:flex; gap:clamp(8px,2vw,20px); align-items:stretch; justify-content:center; }

/* ============================================================
   THE VAT SCENE
   ============================================================ */
.gg-vatwrap { --vatH: 46%; position:relative; flex:1 1 auto; min-height:0; max-width:min(340px,44vw); margin:0 auto; }

/* winch + rope, top of the scene */
.gg-winchpost { position:absolute; top:0; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; z-index:4; }
.gg-winch { position:relative; width:clamp(20px,4.4vh,30px); height:clamp(20px,4.4vh,30px); border-radius:50%; background:radial-gradient(circle at 35% 30%,#fff3ce,#b9862a); border:2px solid #6b4a12; box-shadow:0 2px 0 rgba(0,0,0,.4); }
.gg-winch-handle { position:absolute; left:50%; top:50%; width:64%; height:3px; background:#3a2a10; border-radius:2px; transform-origin:0% 50%; transform:translate(0,-50%) rotate(0deg); transition:transform 260ms var(--spring); }
.gg-winch-handle::after { content:''; position:absolute; right:-2px; top:-2px; width:6px; height:6px; border-radius:50%; background:#fff3ce; }
.gg-puff { position:absolute; left:50%; top:50%; font-size:13px; opacity:0; pointer-events:none; animation:gg-puff-float 620ms ease-out forwards; }
@keyframes gg-puff-float { 0% { transform:translate(-50%,-50%) scale(.5); opacity:.9; } 100% { transform:translate(calc(-50% + var(--dx,0px)),calc(-50% + var(--dy,-26px))) scale(1.5); opacity:0; } }

.gg-rope-group { position:absolute; top:clamp(20px,4.6vh,32px); left:50%; transform:translateX(-50%); display:flex; justify-content:center; z-index:3; }
.gg-rope { width:4px; background:repeating-linear-gradient(180deg,#8a7458 0 4px,#6b5744 4px 8px); border-radius:2px; transition:height 60ms linear; }
.gg-fray { position:absolute; top:0; width:14px; height:5px; border-radius:2px; background:#8a7458; opacity:0; transform-origin:0 50%; }
.gg-fray.f1 { left:-3px; top:22%; transform:rotate(-28deg) scaleX(0); }
.gg-fray.f2 { left:3px; top:48%; transform:rotate(24deg) scaleX(0); }
.gg-fray.f3 { left:-2px; top:70%; transform:rotate(-18deg) scaleX(0); }
.gg-rope-group.gg-rope-fray .gg-fray { opacity:.85; animation:gg-fray-jitter 1.4s ease-in-out infinite; }
.gg-rope-group.gg-rope-fray .gg-fray.f1 { transform:rotate(-28deg) scaleX(1); animation-delay:0s; }
.gg-rope-group.gg-rope-fray .gg-fray.f2 { transform:rotate(24deg) scaleX(1); animation-delay:.2s; }
.gg-rope-group.gg-rope-fray .gg-fray.f3 { transform:rotate(-18deg) scaleX(1); animation-delay:.4s; }
.gg-rope-group.gg-rope-fray-crit .gg-fray { opacity:1; }
@keyframes gg-fray-jitter { 0%,100% { opacity:.7; } 50% { opacity:1; } }

/* the plank — position/tilt are CONTINUOUS state, driven every tween frame
   by setGauge() below (rule: all state movement via kit tween(), never a
   bare rAF loop) via the --travel/--tilt custom properties. */
.gg-plank { position:absolute; left:50%; top:var(--travel,13%); width:76%; height:clamp(8px,1.8vh,16px); transform:translate(-50%,0) rotate(var(--tilt,0deg)); background:linear-gradient(90deg,#a06b3a,#7a4a22); border-radius:5px; box-shadow:0 4px 0 rgba(0,0,0,.35), inset 0 0 0 2px rgba(0,0,0,.15); z-index:2; transition:top 60ms linear; }
.gg-plank.gg-strain { animation:gg-plank-strain .5s ease-in-out infinite; }
@keyframes gg-plank-strain { 0%,100% { box-shadow:0 4px 0 rgba(0,0,0,.35), inset 0 0 0 2px rgba(0,0,0,.15); } 50% { box-shadow:0 4px 0 rgba(0,0,0,.35), inset 0 0 0 2px rgba(231,76,60,.4); } }
@keyframes gg-crack {
  0%,100% { transform:translate(-50%,0) rotate(var(--tilt,0deg)); }
  20% { transform:translate(-50%,2px) rotate(calc(var(--tilt,0deg) - 6deg)); }
  40% { transform:translate(-50%,-2px) rotate(calc(var(--tilt,0deg) + 5deg)); }
  60% { transform:translate(-50%,3px) rotate(calc(var(--tilt,0deg) - 7deg)); }
  80% { transform:translate(-50%,-1px) rotate(calc(var(--tilt,0deg) + 3deg)); }
}
.gg-plank.gg-crack { animation:gg-crack ${CRACK_MS}ms ease-in-out both; }
@keyframes gg-fall {
  0% { transform:translate(-50%,0) rotate(18deg); opacity:1; }
  35% { transform:translate(-50%,16px) rotate(78deg); opacity:1; }
  100% { transform:translate(-50%,190px) rotate(235deg); opacity:0; }
}
.gg-plank.gg-fall { animation:gg-fall ${FALL_MS}ms cubic-bezier(.36,.66,.4,1) forwards; transition:none; }

.gg-figure { position:absolute; left:50%; bottom:100%; transform:translate(-50%,0); font-size:clamp(20px,4.6vh,34px); animation:gg-idlebob 2.2s ease-in-out infinite alternate; filter:drop-shadow(0 4px 5px rgba(0,0,0,.4)); }
.gg-figure.gg-scared { animation:gg-scared-shake .32s ease-in-out infinite; }
@keyframes gg-idlebob { from { transform:translate(-50%,0); } to { transform:translate(-50%,-6px); } }
@keyframes gg-scared-shake { 0%,100% { transform:translate(-50%,0) rotate(0deg); } 50% { transform:translate(-53%,0) rotate(-5deg); } }
/* re-parented straight onto .gg-vatwrap for the SURFACE beat (see
   showSurfacing() — figure detaches from the (now-sunk) plank so it isn't
   dragged down by the plank's own opacity/transform). */
.gg-figure.gg-surface { bottom:var(--vatH); transform:translate(-50%,14px); opacity:0; animation:gg-surface-rise ${SURFACE_HOLD_MS}ms var(--spring) both; }
@keyframes gg-surface-rise { 0% { transform:translate(-50%,26px) rotate(-6deg); opacity:0; } 60% { transform:translate(-50%,-4px) rotate(3deg); opacity:1; } 100% { transform:translate(-50%,0) rotate(0deg); opacity:1; } }
.gg-gloop { position:absolute; left:50%; top:60%; width:5px; height:9px; border-radius:0 0 4px 4px; background:linear-gradient(180deg,#c8f06a,#6f9c28); animation:gg-gloop-drip 950ms ease-in forwards; pointer-events:none; }
@keyframes gg-gloop-drip { 0% { transform:translate(-50%,0) scaleY(.6); opacity:.95; } 70% { opacity:.9; } 100% { transform:translate(-50%,34px) scaleY(1.3); opacity:0; } }

/* Dave — the mid-round rope-peck cameo AND the final head-landing beat
   share one element, reset between the two via classList. */
.gg-dave { position:absolute; left:50%; bottom:var(--vatH); transform:translate(-50%,-100%); font-size:clamp(16px,3.6vh,26px); opacity:0; pointer-events:none; z-index:6; }
.gg-dave-card { font-size:.62em; margin-left:1px; }
@keyframes gg-dave-peck {
  0% { transform:translate(calc(-50% - 90px),calc(-100% - 30px)) rotate(-10deg); opacity:0; }
  22% { transform:translate(-50%,-140%) rotate(0deg); opacity:1; }
  38%,46% { transform:translate(-46%,-150%) rotate(14deg); opacity:1; }
  54%,62% { transform:translate(-54%,-135%) rotate(-14deg); opacity:1; }
  100% { transform:translate(calc(-50% + 90px),calc(-100% - 30px)) rotate(10deg); opacity:0; }
}
.gg-dave.gg-dave-peck { animation:gg-dave-peck 900ms ease-in-out both; }
@keyframes gg-dave-land {
  0% { transform:translate(calc(-50% + 70px),-220%) rotate(-18deg); opacity:0; }
  55% { transform:translate(-50%,-118%) rotate(6deg); opacity:1; }
  75% { transform:translate(-50%,-96%) rotate(-4deg); opacity:1; }
  100% { transform:translate(-50%,-104%) rotate(0deg); opacity:1; }
}
.gg-dave.gg-dave-land { animation:gg-dave-land ${DAVE_HOLD_MS + 120}ms var(--spring) forwards; }

.gg-vat { position:absolute; left:0; right:0; bottom:0; height:var(--vatH); border-radius:16px 16px 10px 10px; background:linear-gradient(180deg,#4a6b1e,#2c4210); box-shadow:inset 0 6px 14px rgba(0,0,0,.5), 0 6px 0 rgba(0,0,0,.35); overflow:hidden; }
.gg-vat::after { content:''; position:absolute; inset:0; border-radius:inherit; box-shadow:inset 0 0 0 2px rgba(255,255,255,.14); pointer-events:none; }

/* layered wobbling gunge — three blobby waves, out of phase */
.gg-wave { position:absolute; left:-18%; right:-18%; height:66%; border-radius:46% 54% 42% 58% / 58% 46% 54% 42%; }
.gg-wave-1 { top:2%; background:linear-gradient(160deg,#9ee44a,#6f9c28); opacity:.9; animation:gg-wave-roll 4.4s ease-in-out infinite; }
.gg-wave-2 { top:14%; background:linear-gradient(160deg,#7fcf3a,#598a20); opacity:.75; animation:gg-wave-roll 3.6s ease-in-out infinite reverse; }
.gg-wave-3 { top:26%; background:linear-gradient(160deg,#5f9224,#3f6a14); opacity:.92; animation:gg-wave-roll 5.2s ease-in-out infinite; animation-delay:-1.4s; }
@keyframes gg-wave-roll { 0%,100% { transform:translateY(0) rotate(0deg) scaleX(1); } 50% { transform:translateY(-5%) rotate(2deg) scaleX(1.05); } }

.gg-bub { position:absolute; bottom:2px; border-radius:50%; background:radial-gradient(circle at 32% 28%,rgba(255,255,255,.85),rgba(255,255,255,.35) 60%,rgba(255,255,255,.05)); animation:gg-bub-rise 2.8s ease-in infinite; }
@keyframes gg-bub-rise {
  0% { transform:translateY(0) scale(.5); opacity:0; }
  14% { opacity:.9; }
  78% { transform:translateY(-68%) scale(1.1); opacity:.9; }
  88% { transform:translateY(-77%) scale(1.55); opacity:1; box-shadow:0 0 6px 2px rgba(255,255,255,.5); }
  100% { transform:translateY(-80%) scale(.2); opacity:0; }
}

.gg-drip { position:absolute; top:-2%; width:3px; border-radius:0 0 3px 3px; background:linear-gradient(180deg,rgba(210,245,140,.9),rgba(140,200,60,.35)); animation:gg-drip-fall 3.4s linear infinite; }
@keyframes gg-drip-fall { 0% { height:0; opacity:0; } 10% { opacity:.85; } 65% { height:34%; opacity:.75; } 100% { height:42%; top:56%; opacity:0; } }

.gg-meter { position:absolute; right:-18px; top:0; width:10px; height:58%; border-radius:8px; background:rgba(255,255,255,.12); overflow:hidden; box-shadow:inset 0 0 0 2px rgba(255,255,255,.16); }
.gg-meter-fill { position:absolute; left:0; right:0; bottom:0; background:linear-gradient(0deg,var(--pier-teal),#8ff0d8); transition:height 60ms linear; }
.gg-meter-fill.gg-low { background:linear-gradient(0deg,var(--gold),#ffdb7a); }
.gg-meter-fill.gg-critical { background:linear-gradient(0deg,var(--wrong),#ff8a7a); animation:gg-crit-pulse .6s ease-in-out infinite; }
@keyframes gg-crit-pulse { 0%,100% { opacity:1; } 50% { opacity:.55; } }
.gg-floatplus { position:absolute; left:50%; top:0; transform:translate(-50%,0); font-family:'Fredoka',sans-serif; font-weight:700; font-size:16px; color:var(--correct); text-shadow:0 0 8px rgba(46,204,113,.5); animation:gg-floatup .9s ease-out forwards; pointer-events:none; z-index:5; }
@keyframes gg-floatup { 0% { transform:translate(-50%,0); opacity:1; } 100% { transform:translate(-50%,-42px); opacity:0; } }

.gg-vatwrap.gg-combo-glow { animation:gg-combo-pulse 700ms ease-out; }
@keyframes gg-combo-pulse { 0% { filter:drop-shadow(0 0 0 rgba(244,197,66,0)); } 40% { filter:drop-shadow(0 0 14px rgba(244,197,66,.85)); } 100% { filter:drop-shadow(0 0 0 rgba(244,197,66,0)); } }

/* ============================================================
   SIDE PANEL — fact-family flash on a miss/slow answer
   ============================================================ */
.gg-side { flex:0 1 auto; align-self:center; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; width:min(260px,72vw); min-width:0; }
.gg-flash { width:100%; background:rgba(231,76,60,.14); border:2px solid rgba(231,76,60,.4); border-radius:14px; padding:8px 12px; text-align:center; opacity:0; transform:translateY(-6px); transition:opacity 220ms var(--spring), transform 220ms var(--spring); pointer-events:none; }
.gg-flash.show { opacity:1; transform:translateY(0); }
.gg-flash-heading { font-family:'Fredoka',sans-serif; font-weight:700; font-size:12px; color:#ffd7d0; margin-bottom:3px; }
.gg-flash-body { font-size:clamp(12px,2vh,14.5px); font-weight:600; color:var(--parchment); }

/* ============================================================
   SPLASH FINALE — huge splash + flying droplets, sits over the whole stage
   ============================================================ */
.gg-splash { position:absolute; inset:0; z-index:40; display:flex; align-items:center; justify-content:center; overflow:hidden; opacity:0; pointer-events:none; }
.gg-splash.show { opacity:1; }
.gg-splash-wash { position:absolute; inset:0; background:radial-gradient(circle at 50% 100%,rgba(158,228,74,.94),rgba(70,110,20,.88) 55%,rgba(20,30,8,.94)); animation:gg-wash-in .5s ease-out both; }
@keyframes gg-wash-in { from { transform:scale(.35); opacity:0; } to { transform:scale(1); opacity:1; } }
.gg-splashblobs { position:absolute; inset:0; }
.gg-splat-blob { position:absolute; bottom:0; border-radius:50%; background:radial-gradient(circle at 30% 30%,#c8f06a,#6f9c28); animation:gg-blob-burst .85s cubic-bezier(.2,.9,.3,1) both; }
@keyframes gg-blob-burst { 0% { transform:translate(var(--bx0,0),0) scale(.2); opacity:0; } 38% { opacity:1; } 100% { transform:translate(var(--bx,0),var(--by,-160px)) scale(1); opacity:0; } }
.gg-droplet { position:absolute; bottom:6%; border-radius:50%; background:radial-gradient(circle at 32% 28%,#eaffb0,#8fca3c); animation:gg-droplet-fly .95s cubic-bezier(.15,.85,.3,1) both; }
@keyframes gg-droplet-fly { 0% { transform:translate(0,0) rotate(0deg) scale(.4); opacity:0; } 30% { opacity:1; } 100% { transform:translate(var(--dbx,0),var(--dby,-200px)) rotate(var(--drot,180deg)) scale(.7); opacity:0; } }
.gg-splash-stamp { position:relative; z-index:2; font-family:'Fredoka',sans-serif; font-weight:700; font-size:clamp(24px,7vw,52px); color:#fff; text-shadow:0 0 12px rgba(0,0,0,.5); text-align:center; transform:rotate(-8deg); animation:gg-stamp-in .5s var(--spring) both; }
@keyframes gg-stamp-in { from { transform:rotate(-8deg) scale(.4); opacity:0; } to { transform:rotate(-8deg) scale(1); opacity:1; } }

/* ============================================================
   OVERLAY CARD CONTENT (chassis.overlay() supplies the veil/card chrome —
   this is just the inner content each card shows)
   ============================================================ */
.gg-card-emoji { font-size:44px; margin-bottom:4px; filter:drop-shadow(0 4px 6px rgba(0,0,0,.4)); }
.gg-welcome-inner h2, .gg-end-inner h2 { font-family:'Fredoka',sans-serif; font-weight:700; color:var(--pier-bulb); margin:0 0 8px; letter-spacing:.02em; font-size:20px; }
.gg-card-line { font-size:14px; font-weight:600; color:var(--parchment); line-height:1.4; margin:0 0 6px; }
.gg-card-sub { font-size:12.5px; color:rgba(246,235,212,.7); line-height:1.4; margin:0 0 16px; }
.gg-startbtn, .gg-onemorebtn, .gg-pierbtn { min-height:60px; padding:0 26px; font-size:16px; touch-action:manipulation; width:100%; }

.gg-dave-row { display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:8px; }
.gg-dave-tag { font-family:'Fredoka',sans-serif; font-weight:700; font-size:10px; letter-spacing:.03em; color:#dceeff; background:rgba(255,255,255,.08); border-radius:8px; padding:5px 9px; text-align:left; }
.gg-score-big { font-family:'Fredoka',sans-serif; font-weight:700; font-size:46px; color:var(--pier-teal); text-shadow:0 0 14px rgba(47,227,196,.5); margin:4px 0 0; }
.gg-score-sub { font-size:12px; color:rgba(246,235,212,.7); margin-bottom:12px; }
.gg-pb-row { font-weight:700; font-size:13px; margin-bottom:10px; padding:6px 12px; border-radius:999px; display:inline-block; }
.gg-pb-row.gg-newrecord { background:rgba(244,197,66,.18); color:var(--gold); }
.gg-pb-row.gg-oldrecord { background:rgba(47,227,196,.12); color:var(--pier-teal); }
.gg-tier-row { display:flex; align-items:center; justify-content:center; gap:6px; margin-bottom:16px; }
.gg-tier-chip { font-size:20px; opacity:.28; filter:grayscale(1); }
.gg-tier-chip.achieved { opacity:1; filter:none; }
.gg-trophy { font-size:20px; margin-left:2px; animation:gg-trophy-spin 2.6s ease-in-out infinite; }
@keyframes gg-trophy-spin { 0%,100% { transform:rotate(-6deg) scale(1); } 50% { transform:rotate(6deg) scale(1.12); } }
.gg-endbtns { display:flex; flex-direction:column; gap:10px; }

@media (prefers-reduced-motion: reduce) {
  .gg-figure, .gg-wave, .gg-bub, .gg-drip, .gg-meter-fill.gg-critical, .gg-timer.gg-ramp-pulse, .gg-plank.gg-strain, .gg-fray, .gg-trophy { animation:none !important; }
  .gg-plank.gg-crack, .gg-plank.gg-fall, .gg-dave.gg-dave-peck, .gg-dave.gg-dave-land, .gg-figure.gg-surface { animation-duration:.01ms !important; }
  .gg-splash-stamp, .gg-splat-blob, .gg-droplet, .gg-splash-wash { animation:none !important; opacity:1 !important; transform:none !important; }
}
`;

export default {
  id: 'gunge',
  title: 'THE GUNGE TANK',
  blurb: "Answer fast, keep the plank up — don't get gunged!",

  mount(host, ctx, pier) {
    injectCss('pier-gunge', CSS);

    let alive = true;
    const timers = new Set();
    const later = (fn, ms) => {
      const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms);
      timers.add(id);
      return id;
    };
    const every = (fn, ms) => { const id = setInterval(() => { if (alive) fn(); }, ms); timers.add(id); return id; };
    const clearTimer = (id) => { clearTimeout(id); clearInterval(id); timers.delete(id); };

    const rng = mulberry32((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
    // {welcome, combo, nearMiss, daveTheft, gremlinFlush, newPB, goldBeaten} —
    // defensive fallback so a content.js shape drift can't trap the child on
    // a dead machine (matches this codebase's "a broken X must never break
    // navigation" convention elsewhere in this file).
    const beats = (machine && machine.gunge) || {};

    /* ---------- chassis (see header note re: the .pier-chassis CSS gap;
       mountChassis() below auto-adds the .pier-chassis class to `host`
       itself, which this file's injected CSS rule above targets — no
       bespoke class needed) ---------- */
    const chassis = pier.mountChassis({
      onBack: () => { ctx.audio.sfx('back'); ctx.go('#/pier'); },
      backLabel: '← PIER',
      stageClass: 'gg-stage',
    });

    const timerEl = el('div', 'gg-timer', '⏱ 0s survived');
    chassis.hud.append(timerEl);

    /* ---------- STAGE: the vat scene (decorative only — no controls live
       here, so the LAYOUT LAW's "zero scrolling to reach a control" is
       satisfied regardless of how small this gets) ---------- */
    const stageInner = el('div', 'gg-stage-inner');
    const factEl = el('div', 'gg-fact', 'Press START to begin!');
    const playarea = el('div', 'gg-playarea');

    const vatwrap = el('div', 'gg-vatwrap');

    const winchpost = el('div', 'gg-winchpost');
    const winch = el('div', 'gg-winch');
    const winchHandle = el('div', 'gg-winch-handle');
    winch.append(winchHandle);
    winchpost.append(winch);

    const ropeGroup = el('div', 'gg-rope-group');
    const rope = el('div', 'gg-rope');
    const fray1 = el('div', 'gg-fray f1');
    const fray2 = el('div', 'gg-fray f2');
    const fray3 = el('div', 'gg-fray f3');
    ropeGroup.append(rope, fray1, fray2, fray3);

    const plank = el('div', 'gg-plank');
    let figure = el('div', 'gg-figure', '🧍');
    plank.append(figure);

    const dave = el('div', 'gg-dave', '🐦<span class="gg-dave-card">📋</span>');

    const vat = el('div', 'gg-vat');
    const wave1 = el('div', 'gg-wave gg-wave-1');
    const wave2 = el('div', 'gg-wave gg-wave-2');
    const wave3 = el('div', 'gg-wave gg-wave-3');
    vat.append(wave1, wave2, wave3);
    for (let i = 0; i < 5; i += 1) {
      const b = el('div', 'gg-bub');
      const size = 6 + rng() * 7;
      b.style.width = `${size}px`; b.style.height = `${size}px`;
      b.style.left = `${8 + rng() * 82}%`;
      b.style.animationDelay = `${(rng() * 2.8).toFixed(2)}s`;
      vat.append(b);
    }
    for (let i = 0; i < 4; i += 1) {
      const d = el('div', 'gg-drip');
      d.style.left = `${10 + rng() * 78}%`;
      d.style.animationDelay = `${(rng() * 3.4).toFixed(2)}s`;
      vat.append(d);
    }

    const meter = el('div', 'gg-meter');
    const meterFill = el('div', 'gg-meter-fill');
    meter.append(meterFill);

    vatwrap.append(vat, ropeGroup, winchpost, plank, dave, meter);

    const side = el('div', 'gg-side');
    const flash = el('div', 'gg-flash');
    const flashHeading = el('div', 'gg-flash-heading');
    const flashBody = el('div', 'gg-flash-body');
    flash.append(flashHeading, flashBody);
    side.append(flash);

    playarea.append(vatwrap, side);
    // Deliberately playarea THEN factEl (not the reverse): the shared
    // caption bar (js/screens/pier.js pier.say()) is chassis-owned and
    // renders `position:fixed` at a FIXED pixel offset right below the HUD
    // (css/pier.css: `top: calc(78px + safe-t)`, ~64px tall) — it has no
    // idea what a mode puts at the top of its own stage. Measured live: at
    // 1000×540 the caption bar occupies stage y:[78,142] (out of a 139px-
    // tall stage) — ANY critical text placed at the top of stage is
    // regularly hidden under it for the caption's ~5.2s life (confirmed via
    // screenshot: an in-flight fact stem was unreadable under a round-start
    // announcer line). The vat/plank/winch scene is pure decoration (no
    // text you must read to play), so it can sit under the caption band
    // harmlessly — the fact stem (text you MUST read to answer) goes
    // LAST, anchored at the BOTTOM of the stage, right above the dock,
    // which is provably clear of the caption's fixed 78–142px band at every
    // proven size (stage height only shrinks going the other way as the
    // viewport gets smaller, and the caption band is a fixed pixel offset
    // near the top — the gap below it only grows). Flagging this pattern
    // for reviewers/the chassis agent: it's a general caption-bar/stage-
    // content collision risk, not something specific to gunge.
    stageInner.append(playarea, factEl);
    chassis.stage.append(stageInner);

    const splash = el('div', 'gg-splash');
    const splashWash = el('div', 'gg-splash-wash');
    const splashBlobs = el('div', 'gg-splashblobs');
    const splashStamp = el('div', 'gg-splash-stamp');
    splash.append(splashWash, splashBlobs, splashStamp);
    chassis.stage.append(splash);

    /* ---------- DOCK: the numpad — flex:none, never shrinks, keys floor
       at 60px via css/pier.css's shared .pier-numpad rules. This is the
       structural fix for the v1 bug (GO key 29px below the fold, no
       scroll rescue): the numpad is appended straight into chassis.dock,
       nothing else competes with it for room, and the STAGE gives up
       space first, per THE LAYOUT LAW. ---------- */
    let numpad = null;

    /* ---------- game state ---------- */
    let gaugeValue = START_GAUGE;
    let gaugeCancel = null;
    let drainPerSec = BASE_DRAIN_PER_SEC;
    let rampInterval = null;
    let survivalInterval = null;
    let runStart = 0;
    let fact = null;
    let factStart = 0;
    let streak = 0;
    let ended = true; // true until the first round begins
    let winchRot = 0;
    let lastFrayTier = 0; // 0 healthy / 1 low / 2 critical — edge-triggered
    let daveCameoShown = false; // one rope-peck cameo per round
    let roundToken = 0;  // guards a delayed caption against firing after a
                          // fresh "ONE MORE GO" has already started a new
                          // round — mirrors ghost.js's runToken pattern.
    let hiddenSince = null; // performance.now() when the tab went hidden mid-round

    function cancelGauge() { if (gaugeCancel) { gaugeCancel(); gaugeCancel = null; } }

    function setGauge(v) {
      gaugeValue = v;
      const pct = clamp01to100(v);
      const travel = PLANK_TOP_MIN + (1 - pct / 100) * (PLANK_TOP_MAX - PLANK_TOP_MIN);
      const tilt = (1 - pct / 100) * MAX_TILT_DEG;
      plank.style.setProperty('--travel', `${travel}%`);
      plank.style.setProperty('--tilt', `${tilt}deg`);
      rope.style.height = `${travel}%`;
      meterFill.style.height = `${pct}%`;
      const critical = pct <= FRAY_CRIT_PCT;
      const low = pct > FRAY_CRIT_PCT && pct <= FRAY_LOW_PCT;
      meterFill.classList.toggle('gg-critical', critical);
      meterFill.classList.toggle('gg-low', low);
      figure.classList.toggle('gg-scared', pct <= FRAY_CRIT_PCT + 5);
      plank.classList.toggle('gg-strain', pct <= FRAY_LOW_PCT);
      ropeGroup.classList.toggle('gg-rope-fray', pct <= FRAY_LOW_PCT);
      ropeGroup.classList.toggle('gg-rope-fray-crit', critical);

      const tier = critical ? 2 : low ? 1 : 0;
      if (tier > lastFrayTier && !ended) {
        sfx.blip(158 - tier * 22, 0.22, 0.1); // one-shot creak on the way DOWN only
        if (tier === 2 && !daveCameoShown) { daveCameoShown = true; playDaveCameo(); }
      }
      lastFrayTier = tier;
    }
    setGauge(START_GAUGE); // initial static paint — not gameplay "movement"

    // ALL gauge movement funnels through here (rule: state movement via kit
    // tween() only): exactly one active tween owns gaugeValue at a time.
    function driveTo(target, dur, onDone) {
      cancelGauge();
      const from = gaugeValue;
      gaugeCancel = tween((val) => setGauge(val), from, target, dur, () => {
        gaugeCancel = null;
        if (onDone) onDone();
      });
    }

    function clearRampTimer() { if (rampInterval) { clearTimer(rampInterval); rampInterval = null; } }
    function clearSurvivalTimer() { if (survivalInterval) { clearTimer(survivalInterval); survivalInterval = null; } }

    function scheduleTick() {
      if (!alive || ended) return;
      const dec = drainPerSec * (TICK_MS / 1000);
      const target = Math.max(0, gaugeValue - dec);
      driveTo(target, TICK_MS, () => {
        if (!alive || ended) return;
        if (gaugeValue <= 0) { endRun(); return; }
        scheduleTick();
      });
    }

    function drawNextFact() {
      fact = pier.facts.draw(rng, { deluxe: pier.deluxe });
      factStart = performance.now();
      factEl.textContent = fact.stem;
    }

    function hideFlash() { flash.classList.remove('show'); }
    function showFlash(heading, body) {
      flashHeading.textContent = heading;
      flashBody.textContent = body;
      flash.classList.add('show');
    }

    function floatPlus() {
      const s = el('span', 'gg-floatplus', `+${BOOST_AMOUNT}`);
      plank.append(s);
      later(() => s.remove(), 900);
    }

    /* ---------- winch: "correct = the winch cranks up a notch, ratchet +
       puff" ---------- */
    function puffBurst() {
      for (let i = 0; i < 3; i += 1) {
        const p = el('span', 'gg-puff', i === 1 ? '💨' : '☁️');
        const ang = (i / 3) * 6.283 + rng() * 0.6;
        p.style.setProperty('--dx', `${(Math.cos(ang) * 18).toFixed(1)}px`);
        p.style.setProperty('--dy', `${(-14 - Math.sin(ang) * 12).toFixed(1)}px`);
        winch.append(p);
        later(() => p.remove(), 660);
      }
    }
    function crankWinch() {
      winchRot += WINCH_NOTCH_DEG;
      winchHandle.style.transform = `translate(0,-50%) rotate(${winchRot}deg)`;
      puffBurst();
      sfx.tick(Math.min(streak, 5)); // kit's documented "stepping ratchet, rising" — literally this
      later(() => sfx.pop(), 70); // the puff
    }

    function comboFlourish() {
      vatwrap.classList.remove('gg-combo-glow');
      void vatwrap.offsetWidth;
      vatwrap.classList.add('gg-combo-glow');
      sfx.sparkle();
    }

    function playDaveCameo() {
      dave.className = 'gg-dave';
      void dave.offsetWidth;
      dave.className = 'gg-dave gg-dave-peck';
      sayFrom(pier, rng, beats.daveTheft);
      later(() => { sfx.blip(520, 0.05, 0.1); }, 260);
    }

    // Returns true when a flush ceremony line was actually shown, so
    // handleCorrect() (called right after, same tick, on the same correct
    // submit — see onSubmit()) knows to stagger its OWN caption rather than
    // stomping this one before it ever paints (see FLUSH_COMBO_STAGGER_MS).
    function handleFlush(rec) {
      if (!rec || !rec.justFlushed) return false;
      const said = sayFrom(pier, rng, beats.gremlinFlush);
      later(() => { sfx.whoosh(); }, 0);
      later(() => sfx.drop(), 260);
      return !!said;
    }

    function handleCorrect(justFlushed) {
      streak += 1;
      crankWinch();
      floatPlus();
      if (streak > 0 && streak % STREAK_FOR_FLOURISH === 0) {
        comboFlourish();
        // pier.js's shared caption bar (js/screens/pier.js say()) replaces
        // text immediately with no queue — a flush ceremony line and a
        // combo line landing on the SAME submit (an ordinary occurrence: any
        // 3rd-consecutive-correct-for-a-gremlin that also happens to be the
        // 5th answer of a streak) would otherwise have the combo line
        // silently discard the flush line at 0ms of display time. Stagger
        // the combo caption behind the flush caption's own read window so
        // both are actually seen, in sequence; roundToken guards against
        // firing after the round has already ended or a fresh one began.
        if (justFlushed) {
          const myRoundToken = roundToken;
          later(() => {
            if (ended || roundToken !== myRoundToken) return;
            sayFrom(pier, rng, beats.combo);
          }, FLUSH_COMBO_STAGGER_MS);
        } else {
          sayFrom(pier, rng, beats.combo);
        }
      }
      drawNextFact(); // snappy — the next question shows immediately
      numpad.clear();
      const target = Math.min(100, gaugeValue + BOOST_AMOUNT);
      driveTo(target, 300, () => {
        if (!alive || ended) return;
        if (gaugeValue <= 0) { endRun(); return; }
        scheduleTick();
      });
    }

    // Shared tail for both "wrong" and "correct-but-slow": lurch the gauge,
    // hold the flash for its full read time, then resume.
    function lurchThenContinue() {
      numpad.setEnabled(false);
      const target = Math.max(0, gaugeValue - LURCH_AMOUNT);
      driveTo(target, 340, () => {
        if (!alive || ended) return;
        if (gaugeValue <= 0) { endRun(); return; }
        later(() => {
          if (!alive || ended) return;
          hideFlash();
          numpad.setEnabled(true);
          numpad.clear();
          drawNextFact();
          scheduleTick();
        }, Math.max(200, FLASH_MS - 340));
      });
    }

    function handleWrong(answeredFact) {
      streak = 0;
      sfx.tock(2);
      sayFrom(pier, rng, beats.nearMiss);
      showFlash("Here's the fact:", familyFlashText(answeredFact));
      lurchThenContinue();
    }

    function handleSlowCorrect(answeredFact) {
      streak = 0;
      sfx.tock(1);
      showFlash('Quick as you can, hero! ⏱', familyFlashText(answeredFact));
      lurchThenContinue();
    }

    function onSubmit(valueString) {
      if (!fact || ended) return;
      const answeredFact = fact;
      const value = parseInt(valueString, 10);
      const elapsed = performance.now() - factStart;
      const isCorrect = value === answeredFact.answer;
      let rec = { justFlushed: false };
      try {
        rec = pier.facts.record(answeredFact.family, { correct: isCorrect, ms: Math.round(elapsed), mode: 'gunge' }) || rec;
      } catch (e) { /* the plank must never freeze because a persist call hiccupped */ }
      if (isCorrect) {
        const flushed = handleFlush(rec);
        if (elapsed <= SLOW_MS) handleCorrect(flushed);
        else handleSlowCorrect(answeredFact);
      } else {
        handleWrong(answeredFact);
      }
    }

    function scheduleRampTimer() {
      clearRampTimer();
      rampInterval = every(() => {
        if (ended) return;
        drainPerSec *= RAMP_MULTIPLIER;
        sfx.blip(320, 0.12, 0.12);
        timerEl.classList.remove('gg-ramp-pulse');
        void timerEl.offsetWidth;
        timerEl.classList.add('gg-ramp-pulse');
      }, RAMP_EVERY_MS);
    }

    function startSurvivalDisplay() {
      clearSurvivalTimer();
      survivalInterval = every(() => {
        timerEl.textContent = `⏱ ${liveSecondsText(performance.now() - runStart)} survived`;
      }, 200);
    }

    // Hidden tabs throttle rAF to zero (kit tween()'s own guard comment), so
    // the drain chain (scheduleTick's self-reschedule) stalls the instant
    // the tab backgrounds — but runStart/factStart are fixed wall-clock
    // anchors that keep counting regardless. Pausing everything on hidden
    // and shifting every wall-clock anchor forward by exactly the hidden
    // gap on resume keeps the drain, the displayed/persisted score, and the
    // current fact's timing all honestly describing only time the plank was
    // actually draining in front of the player.
    function handleVisibilityChange() {
      if (!alive) return;
      if (document.hidden) {
        if (!ended && hiddenSince == null) {
          hiddenSince = performance.now();
          cancelGauge();
          clearRampTimer();
          clearSurvivalTimer();
        }
      } else if (hiddenSince != null) {
        const hiddenMs = performance.now() - hiddenSince;
        hiddenSince = null;
        if (!ended) {
          runStart += hiddenMs;
          factStart += hiddenMs;
          scheduleRampTimer();
          startSurvivalDisplay();
          scheduleTick();
        }
      }
    }

    /* ---------- round reset: put the scene back to its pre-round shape
       (undoes the death choreography's DOM surgery) ---------- */
    function resetSceneForRound() {
      splash.classList.remove('show');
      plank.classList.remove('gg-crack', 'gg-fall', 'gg-strain');
      plank.style.opacity = '';
      dave.className = 'gg-dave';
      // figure may have been re-parented onto vatwrap for the SURFACE beat
      // (see showSurfacing()) — put it back on the plank for normal play.
      if (figure.parentElement !== plank) {
        figure.remove();
        figure.className = 'gg-figure';
        figure.style.transform = '';
        plank.append(figure);
      }
      ropeGroup.classList.remove('gg-rope-fray', 'gg-rope-fray-crit');
      lastFrayTier = 0;
      daveCameoShown = false;
      winchRot = 0;
      winchHandle.style.transform = 'translate(0,-50%) rotate(0deg)';
    }

    function beginRound() {
      roundToken += 1;
      resetSceneForRound();
      ended = false;
      streak = 0;
      drainPerSec = BASE_DRAIN_PER_SEC;
      runStart = performance.now();
      hideFlash();
      numpad.setEnabled(true);
      numpad.clear();
      drawNextFact();
      scheduleRampTimer();
      startSurvivalDisplay();
      driveTo(START_GAUGE, RESET_RISE_MS, () => {
        if (!alive || ended) return;
        scheduleTick();
      });
      sayFrom(pier, rng, pier.content.announcer && pier.content.announcer.roundStart);
      sfx.ui();
    }

    /* ---------- THE DEATH SET-PIECE (docs/PIER_REWORK.md §3 "gunge"):
       plank snaps -> brief slow-mo fall -> HUGE splash with flying
       droplets -> hero surfaces, gunge sliding off in gloops -> Dave lands
       on his head holding the scorecard. Every beat held well past the
       250ms floor (see the constants above); each step guarded by `alive`
       and cancellable via the `timers` Set in cleanup(). ---------- */
    function endRun() {
      if (ended) return;
      ended = true;
      cancelGauge();
      clearRampTimer();
      clearSurvivalTimer();
      numpad.setEnabled(false);
      hideFlash();
      const finalSeconds = (performance.now() - runStart) / 1000;

      // Stage 1 — CRACK: the plank shakes/strains right at the hinge.
      sfx.thud();
      plank.classList.add('gg-crack');

      // Stage 2 — the slow-mo FALL.
      later(() => {
        if (!alive) return;
        plank.classList.remove('gg-crack');
        plank.classList.add('gg-fall');
        sfx.whoosh();
      }, CRACK_MS);

      // Stage 3 — impact: HUGE splash, flying droplets.
      later(() => {
        if (!alive) return;
        sfx.drop();
        showSplash();
      }, CRACK_MS + FALL_MS);

      // Stage 4 — the hero SURFACES, gunge sliding off in gloops.
      later(() => {
        if (!alive) return;
        splash.classList.remove('show');
        showSurfacing();
      }, CRACK_MS + FALL_MS + SPLASH_HOLD_MS);

      // Stage 5 — Dave lands on the hero's head holding the scorecard.
      later(() => {
        if (!alive) return;
        dave.className = 'gg-dave';
        void dave.offsetWidth;
        dave.className = 'gg-dave gg-dave-land';
        sfx.blip(700, 0.05, 0.13);
        later(() => sfx.blip(420, 0.07, 0.12), 90);
      }, CRACK_MS + FALL_MS + SPLASH_HOLD_MS + SURFACE_HOLD_MS);

      // Transition into the end-card overlay.
      later(() => {
        if (!alive) return;
        showEndScreen(finalSeconds);
      }, CRACK_MS + FALL_MS + SPLASH_HOLD_MS + SURFACE_HOLD_MS + DAVE_HOLD_MS);
    }

    function showSplash() {
      splashBlobs.innerHTML = '';
      for (let i = 0; i < 14; i += 1) {
        const b = el('div', 'gg-splat-blob');
        const size = 22 + rng() * 44;
        b.style.width = `${size}px`;
        b.style.height = `${size}px`;
        b.style.left = `${6 + rng() * 84}%`;
        b.style.setProperty('--bx', `${((rng() - 0.5) * 190).toFixed(0)}px`);
        b.style.setProperty('--by', `${-(100 + rng() * 160).toFixed(0)}px`);
        b.style.animationDelay = `${(rng() * 0.14).toFixed(2)}s`;
        splashBlobs.append(b);
      }
      for (let i = 0; i < 9; i += 1) {
        const d = el('div', 'gg-droplet');
        const size = 6 + rng() * 10;
        d.style.width = `${size}px`;
        d.style.height = `${size}px`;
        d.style.left = `${10 + rng() * 80}%`;
        d.style.setProperty('--dbx', `${((rng() - 0.5) * 320).toFixed(0)}px`);
        d.style.setProperty('--dby', `${-(160 + rng() * 220).toFixed(0)}px`);
        d.style.setProperty('--drot', `${(rng() * 540 - 270).toFixed(0)}deg`);
        d.style.animationDelay = `${(rng() * 0.2).toFixed(2)}s`;
        splashBlobs.append(d);
      }
      splashStamp.textContent = pick(rng, STAMP_WORDS);
      splash.classList.add('show');
    }

    function showSurfacing() {
      // Detach the figure from the (now sunk/invisible) plank and place it
      // straight on the vatwrap so it isn't dragged down by the plank's own
      // opacity:0 — see resetSceneForRound() for the reverse of this.
      figure.remove();
      figure.className = 'gg-figure gg-surface';
      vatwrap.append(figure);
      sfx.drop();
      for (let i = 0; i < 3; i += 1) {
        later(() => {
          if (!alive) return;
          const g = el('div', 'gg-gloop');
          g.style.left = `${44 + rng() * 12}%`;
          g.style.animationDelay = `${(rng() * 0.12).toFixed(2)}s`;
          figure.append(g);
          later(() => g.remove(), 1050);
          sfx.pop();
        }, i * 180);
      }
    }

    /* ---------- overlays (welcome / end) — screen-level, via
       chassis.overlay(), never an in-stage veil (that was v1's bug). ---------- */
    let welcomeOv = null;
    let endOv = null;

    function showWelcome() {
      const inner = el('div', 'gg-welcome-inner');
      inner.innerHTML = '<div class="gg-card-emoji">🪣</div><h2>THE GUNGE TANK</h2>';
      const line = el('p', 'gg-card-line');
      const sub = el('p', 'gg-card-sub', "Answer fast to keep your plank up. Miss one, or dawdle, and down it goes — survive as long as you can!");
      const startBtn = el('button', 'btn btn-gold gg-startbtn', 'START ⚡');
      const welcomeEntry = Array.isArray(beats.welcome) && beats.welcome.length ? pick(rng, beats.welcome) : null;
      if (welcomeEntry) {
        line.textContent = welcomeEntry.text;
        inner.append(line, sub, startBtn);
      } else {
        inner.append(sub, startBtn);
      }

      welcomeOv = chassis.overlay(inner, {
        cardClass: 'gg-welcome-card',
        speaks: welcomeEntry || undefined,
      });
      if (welcomeEntry) pier.say(welcomeEntry); // VO fires; visual bubble self-suppresses (isOnScreen)

      startBtn.addEventListener('click', () => {
        sfx.ui();
        welcomeOv.close();
        welcomeOv = null;
        beginRound();
      });
    }

    function tierChipsHtml(tiers, bestVal) {
      if (!tiers) return '';
      const order = ['bronze', 'silver', 'gold'];
      const icon = { bronze: '🥉', silver: '🥈', gold: '🥇' };
      return order.map((t) => {
        const achieved = bestVal != null && bestVal >= tiers[t];
        return `<span class="gg-tier-chip${achieved ? ' achieved' : ''}" title="${t}">${icon[t]}</span>`;
      }).join('');
    }

    async function showEndScreen(rawSeconds) {
      if (!alive) return;
      const myRoundToken = roundToken; // snapshot: see the later() guard below
      const roundedSeconds = Math.round(rawSeconds);
      let bests = {};
      try { bests = (await pier.facts.getBests()) || {}; } catch (e) { bests = {}; }
      if (!alive) return;
      const prevBest = bests.gunge || null;
      const prevSeconds = prevBest ? prevBest.seconds : null;
      const isNewRecord = prevSeconds == null || roundedSeconds > prevSeconds;
      const tiers = pier.facts.nanaTiers('gunge');
      const goldAlreadySeen = !!(prevBest && prevBest.goldSeen);
      const goldNow = !!(tiers && roundedSeconds >= tiers.gold);
      const firstTimeGold = goldNow && !goldAlreadySeen;

      const patch = {};
      if (isNewRecord) { patch.seconds = roundedSeconds; patch.when = Date.now(); }
      if (firstTimeGold) { patch.goldSeen = true; }
      let finalBest = prevBest;
      if (Object.keys(patch).length) {
        try { finalBest = await pier.facts.putBest('gunge', patch); } catch (e) { finalBest = { ...(prevBest || {}), ...patch }; }
      }
      if (!finalBest) finalBest = { seconds: roundedSeconds };
      if (!alive) return;

      // Entry 6 of dave.steal keeps the "SCORECARD" wording this pattern
      // relies on — content.js's own comment flags this integration point;
      // do not rename that entry without checking here first.
      const daveSteal = pier.content.dave && Array.isArray(pier.content.dave.steal) ? pier.content.dave.steal : [];
      const daveLine = daveSteal.length
        ? (daveSteal.find((e) => /SCORECARD/i.test(e.text)) || pick(rng, daveSteal))
        : null;

      const pbHtml = isNewRecord
        ? '<div class="gg-pb-row gg-newrecord">🏅 NEW RECORD!</div>'
        : `<div class="gg-pb-row gg-oldrecord">PB: ${prevSeconds}s</div>`;
      const trophyHtml = finalBest.goldSeen ? '<span class="gg-trophy" title="Gold beaten!">🏆</span>' : '';

      const inner = el('div', 'gg-end-inner');
      inner.innerHTML = '<div class="gg-dave-row">🐦'
        + `<span class="gg-dave-tag">${daveLine ? daveLine.text : 'DAVE THE SEAGULL HOLDS UP THE SCORECARD.'}</span></div>`
        + '<h2>SURVIVAL SCORECARD</h2>'
        + `<div class="gg-score-big">${roundedSeconds}s</div>`
        + '<div class="gg-score-sub">survived on the plank</div>'
        + pbHtml
        + `<div class="gg-tier-row">${tierChipsHtml(tiers, finalBest.seconds)}${trophyHtml}</div>`;
      const btnRow = el('div', 'gg-endbtns');
      const onemoreBtn = el('button', 'btn btn-gold gg-onemorebtn', 'ONE MORE GO 🔁');
      const pierBtn = el('button', 'btn btn-ghost gg-pierbtn', '← PIER');
      btnRow.append(onemoreBtn, pierBtn);
      inner.append(btnRow);

      endOv = chassis.overlay(inner, {
        cardClass: 'gg-end-card',
        speaks: daveLine || undefined,
      });
      if (daveLine) pier.say(daveLine); // registered on-card via `speaks` — caption bar won't echo it
      if (isNewRecord) party(chassis.stage);

      onemoreBtn.addEventListener('click', () => {
        sfx.ui();
        endOv.close();
        endOv = null;
        beginRound();
      });
      pierBtn.addEventListener('click', () => { ctx.audio.sfx('back'); ctx.go('#/pier'); });

      later(() => {
        if (!alive) return;
        if (roundToken !== myRoundToken) return; // a fresh round began (ONE MORE
        // GO tapped fast) before this fired — the finished round's caption
        // would now be describing a plank/vat state the board no longer shows.
        if (firstTimeGold) {
          sayFrom(pier, rng, beats.goldBeaten);
          sfx.win();
        } else if (isNewRecord) {
          sayFrom(pier, rng, beats.newPB);
        } else {
          sayFrom(pier, rng, pier.content.nana && pier.content.nana.win);
        }
      }, 1300);
    }

    /* ---------- boot ---------- */
    numpad = makeNumpad(chassis.dock, { onSubmit });
    numpad.setEnabled(false);
    showWelcome();

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return function cleanup() {
      alive = false;
      ended = true;
      cancelGauge();
      clearRampTimer();
      clearSurvivalTimer();
      timers.forEach((id) => { clearTimeout(id); clearInterval(id); });
      timers.clear();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (welcomeOv) { welcomeOv.close(); welcomeOv = null; }
      if (endOv) { endOv.close(); endOv = null; }
      if (numpad) numpad.destroy();
      chassis.stage.remove();
      chassis.hud.remove();
      chassis.dock.remove();
      chassis.overlayHost.remove();
    };
  },
};
