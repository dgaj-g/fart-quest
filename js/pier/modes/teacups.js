// FART QUEST — js/pier/modes/teacups.js (TEACUPS agent)
// WHIFF-END PIER — THE TEACUPS: the gentle, untimed, single-table warm-up.
// See docs/PIER_SPEC.md §6 "teacups" (mechanics) and docs/PIER_REWORK.md
// (THE binding fix contract — esp. §1 THE LAYOUT LAW and the teacups
// paragraph of §3) for what this rebuild implements.
//
// REWORK v2 (this pass) — full rebuild on the new chassis:
// - Every screen/state (welcome, table picker, lap-change ceremony, playing,
//   completion sticker) is built through `pier.mountChassis()` (hud/stage/
//   dock) and `chassis.overlay()` (screen-level veil+card) — see
//   js/pier/padkit.js's header contract. The old in-stage `.tcp-back` /
//   `.tcp-stage` veil (v1) is GONE — that pattern is exactly what sliced
//   splat's START button in half at 1000×540 (PIER_REWORK.md §0).
// - The numpad lives in `chassis.dock` (never the stage) so it always gets
//   first claim on vertical space, per THE LAYOUT LAW §1.3.
// - `TABLE N · LAP` context moved into the HUD (fixed-height real estate
//   that's reserved either way) instead of the stage, freeing the stage
//   for just the spinning cup + progress dots + hint — the tightest state
//   at 1000×540 (dock ≈ numpad height) needed every spare pixel.
// - The cups now VISIBLY spin between facts (a full rotation burst, kit
//   CSS `@keyframes`, direction flips for lap 2) with a decorative ring
//   spinning the OPPOSITE way (real teacup-ride physics) as a second,
//   redundant visual cue for the reversal — see docs/PIER_REWORK.md §3
//   "teacups: keep it gentle and untimed, but the cups must VISIBLY SPIN
//   ... lap 2 must spin the other way with the reversal made obvious and
//   silly." The lap-change ceremony overlay runs the SAME demo cup+ring
//   before the player even starts the lap, so the reversal is taught
//   before it's tested.
// - Reactive beats (combo / near-miss / Dave theft / gremlin flush) now use
//   content.js's per-machine `machine.teacups` pool (imported directly —
//   see content.js's own integration note: `pier.content` only forwards
//   the top-level nana/announcer/dave/gremlin pools, not `machine`, so this
//   mirrors how js/pier/modes/tank.js already imports `GREMLIN_NAMES`
//   directly as a plain sibling import).
//
// Deviations from a literal reading of PIER_SPEC.md §6 (noted here + in the
// build report):
//  - `facts.record(family, {ms, ...})` is always called with `ms: null` for
//    Teacups results (kept from v1) — the gremlin engine's "median
//    correct-response time" check (§5) is a fluency signal meant for the
//    TIMED machines; an untimed, think-as-long-as-you-like lap would
//    otherwise pollute that shared, cross-mode stat with slow-but-not-
//    actually-weak times. Correct/incorrect still feeds the miss-count side
//    of gremlin tracking exactly as spec'd.
//  - A whole-table "flawless" bonus (zero wrong answers across BOTH laps)
//    is new this pass: it swaps the end sticker's line pool from
//    `machine.teacups.newPB` ("table polished") to
//    `machine.teacups.goldBeaten` ("flawless round") and adds a bigger
//    party() + gold-trimmed sticker. Teacups has no PB/tiers per §7, so
//    this reuses content.js's own reframing of that pool (see content.js's
//    comment on `machine.teacups.goldBeaten`) as the one "you did great"
//    peak this gentle machine gets — not a deviation from spec, just using
//    content the CONTENT agent already wrote for exactly this purpose.
//  - Dave's theft and the gremlin-flush moment are small physical beats
//    (a seagull flies past, a gremlin spirals off), not full set pieces —
//    Teacups stays the calm machine; the spectacle budget for a genuine
//    ceremony belongs to Tank's "Big Toilet" (§6).
//
// REWORK v2, SECOND PASS (F1/F2/F3 fix pass — chassis adopted, not rebuilt) —
// css/pier.css's `.pier-mode-host.pier-chassis` is now a CSS GRID that puts
// the dock BESIDE the stage (not under it) on any landscape viewport
// ≥680px wide — see that file's header contract block §1a. `mountChassis()`
// itself didn't change shape (still hud/stage/dock), so nothing here needed
// to change HOW the chassis is built — only how the STAGE'S OWN CONTENTS
// use the much taller column that layout now hands it (measured: stage
// height goes from a squashed stacked-mode strip to ~460–670px tall across
// the three proven sizes, see this file's build report). Changes made:
//  - `.tcp-host.pier-mode-host { display:flex; flex-direction:column; }`
//    (this file's OWN chassis workaround, written when css/pier.css had no
//    `.pier-chassis` rule at all) is DELETED per css/pier.css's own
//    contract note naming it directly — the real grid rule now ships with
//    `!important` specifically so a leftover copy of this workaround could
//    never silently defeat it, but keeping dead CSS that reads as a lie
//    about the real layout mechanism serves nobody.
//  - The ring/cup/platform/orbit sizing formulas below are now sized off a
//    much larger vh budget (previously tuned for a squashed strip) so the
//    ride actually LOOKS like it is using the reclaimed height rather than
//    floating in the middle of a mostly-empty tall column (PIER_REWORK.md
//    §3 "teacups: keep it gentle and untimed, but the cups must VISIBLY
//    SPIN"). Two purely decorative additions fill that height honestly
//    rather than just inflating the one cup: a soft radial platform glow
//    under the ride, and three small satellite cups that ride the SAME
//    rotating ring (so they revolve AND tumble together, like a real
//    teacups attraction) — see the CSS block below for how they compose
//    with the idle-bob animation without fighting it (independent `rotate`
//    property, not a second `transform` animation on the same element).
//    The big cup itself now also carries a slow, continuous, direction-
//    matched spin (not just an idle bob) so "spinning" is the resting
//    state of the ride, not just a burst on a correct answer — the burst
//    animation on a correct answer still layers on top of that as an
//    accelerando flourish, unchanged.
//  - `.tcp-picker`/`.tcp-lap` no longer use css/main.css's shared
//    `enter-pop` (`transform: scale(.9) translateY(18px) -> scale(1)
//    translateY(0)`) — css/pier.css's own contract (rule 3a) flagged this
//    BY NAME as a latent instance of the exact F1 mechanism (a scale
//    animation on a container holding real ≥60px controls — `.tcp-picker`
//    wraps the `.tcp-cup` table buttons — visually AND hit-test shrinks
//    them at any frozen/mid-flight point of its own entrance). A local
//    `.tcp-fade-in` (opacity only, matching `.pier-enter`'s own fix one
//    layer up) was defined for exactly this — this THIRD pass is what
//    actually swaps both `el(...)` calls below over to it; an earlier pass
//    added the class but left the two `enter-pop` usages in place, which
//    would have been a real (if numerically harmless, given `.tcp-cup`'s
//    72px floor: 72*.9=64.8, still >=60) instance of the exact bug this
//    rule exists to rule out categorically rather than case-by-case.
//
// REWORK v2, THIRD PASS (orchestrator playtest fix pass, 26 Jul) — two real
// bugs found and fixed against the landscape chassis described above:
//  - CRITICAL: this file's own CSS template literal (`const CSS = \`...\`;`)
//    contained several literal backtick characters inside what were meant to
//    be plain CSS comments (documentation prose using backticks for
//    markdown-style emphasis). A JS template literal has no concept of a
//    nested CSS comment — ANY raw backtick inside it closes the string
//    outright, so those backticks silently truncated the module's source at
//    parse time in a real browser (`SyntaxError: Unexpected identifier
//    'rotate'`), which broke this file's import and, because
//    js/screens/pier.js imports all five mode files statically, broke the
//    ENTIRE pier for every route, not just Teacups. `node --check` did not
//    catch this (it does not fully validate template-literal contents the
//    same way a real ESM parse does — confirmed by reproducing the failure
//    with a genuine `import()` in Node too). Fixed by de-backtick-ing the
//    affected comment prose (plain hyphens/no-emphasis instead). Any future
//    edit to this file's CSS block must NOT put a raw ` character in a CSS
//    comment for emphasis — there is no safe way to do that inside a
//    template literal.
//  - The lap-2 "spin the other way" reversal was incomplete: `buildLapUI()`
//    only ever added the `-back` class to the decorative ring, never to the
//    big cup's own continuous carousel spin nor to the (CSS-defined but
//    never-instantiated) satellite-cup orbit — so on lap 2 the ring visibly
//    reversed but the cup and would-be satellites did not, undercutting
//    PIER_REWORK.md §3's "make the direction reversal obvious ... on ALL of
//    it". Fixed by: (a) actually instantiating `.tcp-platform` (soft floor
//    glow) and `.tcp-orbit` + three `.tcp-orbit-cup` satellites in
//    `buildLapUI()` — CSS for these already existed from an earlier pass but
//    was dead until now; (b) applying `tcp-cupwrap-back`/`tcp-orbit-back`
//    alongside `tcp-ring-back` whenever `lap === 2`, so cup, satellites and
//    ring all reverse together. Verified live at 1000×540/1024×640/1180×745:
//    stage/dock now genuinely landscape side-by-side (stage ~765–1136px wide
//    stretching the full remaining height, dock a compact ~28px-empty/
//    ~193–262px-with-numpad right column), every state (welcome/picker/lap
//    ceremony/playing/wrong-answer hint/end card) has zero interactive
//    elements under 60px or outside the viewport, and lap 2's cup+orbit+ring
//    all confirmed carrying `-back` animation classes together.

import {
  el, sfx, sparkleBurst, party, injectCss,
} from '../../anims/_kit.js';
import { makeNumpad } from '../padkit.js';
import { mulberry32, pick, shuffle } from '../../rng.js';
import { machine } from '../content.js';

const TC = machine.teacups;

const BIG_RIDES = [
  { id: 'splat', label: 'SPLAT-A-GREMLIN', emoji: '🔨' },
  { id: 'gunge', label: 'THE GUNGE TANK', emoji: '🪣' },
  { id: 'ghost', label: 'THE GHOST TRAIN', emoji: '👻' },
  { id: 'tank', label: 'THE GREMLIN TANK', emoji: '🫧' },
];

const CSS = `
/* ---------- local opacity-only entrance (replaces main.css's enter-pop —
   see this file's header comment, "SECOND PASS", for why: a scale/translateY
   entrance on a container holding real >=60px controls is the exact F1
   mechanism, flagged by name in css/pier.css's own contract). ---------- */
.tcp-fade-in { animation: tcp-fade-in 260ms ease both; }
@keyframes tcp-fade-in { from { opacity: 0; } to { opacity: 1; } }

/* ---------- HUD ---------- */
.tcp-hud-title {
  font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: clamp(14px, 2.4vw, 18px);
  color: var(--pier-bulb); white-space: nowrap;
}
.tcp-hud-chip {
  display: flex; align-items: center; gap: 6px;
  background: rgba(10, 18, 48, .6); border: 2px solid rgba(255, 209, 102, .35);
  border-radius: 999px; padding: 8px 16px; min-height: 34px;
  font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: clamp(12px, 2vw, 14px);
  color: var(--parchment); white-space: nowrap;
}
.tcp-hud-dir { color: var(--pier-teal); margin-left: 5px; font-weight: 600; font-size: .92em; }

/* ---------- dock ---------- */
.tcp-dock { display: flex; align-items: center; justify-content: center; }

/* ---------- overlay content (chrome comes from .pier-overlay-card) ---------- */
.tcp-welcome-emoji { font-size: 44px; margin-bottom: 2px; animation: tcp-bob 2.4s ease-in-out infinite alternate; }
.tcp-welcome h2, .tcp-lapcard h2, .tcp-end h2 {
  font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 23px; color: var(--pier-bulb); margin: 4px 0 8px;
}
.tcp-welcome-blurb, .tcp-lapcard p, .tcp-end-sub { font-size: 14px; line-height: 1.4; color: rgba(246, 235, 212, .82); margin: 0 0 12px; }
.tcp-lapcard p b { color: var(--pier-pink); }
.tcp-nana-line {
  display: flex; align-items: flex-start; gap: 10px; text-align: left;
  background: rgba(255, 255, 255, .06); border-radius: 14px; padding: 10px 14px; margin: 0 0 16px;
  font-size: 13.5px; line-height: 1.4; color: var(--parchment);
}
.tcp-nana-avatar { font-size: 22px; flex: 0 0 auto; }
.tcp-start, .tcp-lap-go { min-height: 60px; padding: 0 30px; font-size: 17px; width: 100%; }
@keyframes tcp-bob { from { transform: translateY(0); } to { transform: translateY(-6px); } }

/* ---------- table picker (stage) ---------- */
/* height:100% + justify-content:center — the landscape chassis (F2) hands
   this stage a near-full-height column now, not a squashed strip; without
   this the picker would just sit at the top of that tall column and leave
   a dead void below it (the F5 sparseness pattern, avoided proactively). */
.tcp-picker { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; height: 100%; padding: clamp(4px, 1.6vh, 18px) 16px; max-width: 720px; margin: 0 auto; }
.tcp-picker-ride { font-size: clamp(28px, 6.4vh, 52px); margin-bottom: 2px; animation: tcp-bob 2.4s ease-in-out infinite alternate; }
.tcp-picker h2 { font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: clamp(19px, 3.6vh, 27px); color: var(--pier-bulb); margin: 0 0 5px; }
.tcp-picker-sub { font-size: clamp(12.5px, 2vh, 15px); color: rgba(246, 235, 212, .75); margin: 0 0 clamp(12px, 2.8vh, 24px); }
.tcp-cupgrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(82px, 1fr)); gap: clamp(9px, 1.8vh, 16px); width: 100%; }
.tcp-cup {
  min-height: clamp(72px, 12.6vh, 104px); border: 3px solid rgba(47, 227, 196, .35); border-radius: 18px; cursor: pointer; padding: clamp(5px, 1.2vh, 10px) 4px;
  background: linear-gradient(160deg, #141c44, #0a1230); color: var(--parchment);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
  box-shadow: 0 5px 0 rgba(0, 0, 0, .35); transition: transform 140ms var(--spring), box-shadow 140ms var(--spring);
}
.tcp-cup:active { transform: scale(.93) translateY(2px); box-shadow: 0 2px 0 rgba(0, 0, 0, .35); }
.tcp-cup-emoji { font-size: clamp(20px, 3.8vh, 32px); }
.tcp-cup-num { font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: clamp(15px, 2.5vh, 20px); color: var(--pier-teal); }

/* ---------- lap-change ceremony demo (obvious + silly reversal) ---------- */
.tcp-lap-demo { position: relative; width: 96px; height: 96px; margin: 2px auto 8px; display: flex; align-items: center; justify-content: center; }
.tcp-demo-ring {
  position: absolute; inset: 0; border-radius: 50%; border: 3px dashed rgba(255, 233, 168, .55);
  animation: tcp-ring-fwd 3.6s linear infinite;
}
.tcp-lap-demo.tcp-lap-demo-flip .tcp-demo-ring { animation-name: tcp-ring-back; border-color: rgba(47, 227, 196, .6); }
.tcp-demo-cup { font-size: 40px; filter: drop-shadow(0 4px 6px rgba(0, 0, 0, .4)); animation: tcp-demo-fwd 1.4s cubic-bezier(.5, .1, .5, .9) infinite; }
.tcp-lap-demo.tcp-lap-demo-flip .tcp-demo-cup { animation-name: tcp-demo-back; }
@keyframes tcp-ring-fwd { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
@keyframes tcp-ring-back { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes tcp-demo-fwd { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes tcp-demo-back { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }

/* ---------- playing (stage) ---------- */
/* Gaps/padding are now clamp()ed off vh too — the old fixed 4px/12px values
   were tuned for a squashed strip; with the landscape chassis handing this
   stage ~460-670px of real height (F2), a fixed-tiny gap just leaves it as
   unused dead space rather than an airier, more deliberate composition. */
.tcp-lap { display: flex; flex-direction: column; align-items: center; gap: clamp(10px, 2.6vh, 26px); height: 100%; justify-content: center; padding: clamp(4px, 1.4vh, 14px) 12px; }
.tcp-dots { display: flex; flex-wrap: wrap; justify-content: center; gap: clamp(5px, .9vh, 8px); max-width: 320px; }
.tcp-dot { width: clamp(8px, 1.3vh, 11px); height: clamp(8px, 1.3vh, 11px); border-radius: 50%; background: rgba(255, 255, 255, .18); flex: none; }
.tcp-dot.done { background: var(--correct); }
.tcp-dot.current { background: var(--pier-bulb); box-shadow: 0 0 0 3px rgba(255, 233, 168, .3); }

.tcp-cuparea { position: relative; display: flex; flex-direction: column; align-items: center; gap: clamp(6px, 1.6vh, 16px); }
.tcp-cuparea.tcp-flash-correct .tcp-cupwrap::after {
  content: ''; position: absolute; inset: -18px; border-radius: 50%;
  background: radial-gradient(circle, rgba(46, 204, 113, .4), transparent 70%);
  animation: tcp-correct-pulse 620ms ease both;
}
@keyframes tcp-correct-pulse { 0% { opacity: 0; scale: .7; } 30% { opacity: 1; scale: 1.05; } 100% { opacity: 0; scale: 1.25; } }
.tcp-cuparea.tcp-combo-glow .tcp-ring { border-color: var(--gold); box-shadow: 0 0 18px 2px rgba(244, 197, 66, .5); }

/* Soft floor glow — pure ambience, grounds the ride in the reclaimed
   height instead of leaving the cup floating in a void. Purely decorative
   (z-index below everything, pointer-events:none), never touched by JS. */
.tcp-platform {
  position: absolute; top: 46%; left: 50%; translate: -50% -50%;
  width: clamp(210px, 42vh, 420px); height: clamp(64px, 10.5vh, 120px);
  border-radius: 50%; z-index: -2; pointer-events: none;
  background: radial-gradient(ellipse at center, rgba(255, 79, 163, .22), transparent 72%);
}

/* Three small satellite cups riding the SAME rotating ring as the main
   cup - .tcp-orbit is the thing that spins (via the independent rotate
   property, see below); each .tcp-orbit-cup is placed at a fixed angle+
   radius with a plain static transform, so the parent's continuous
   rotation carries them round AND tumbles them together - exactly how a
   real teacups ride's satellite cups move, no per-child animation needed. */
.tcp-orbit {
  position: absolute; top: 46%; left: 50%; translate: -50% -50%;
  width: clamp(150px, 32vh, 330px); height: clamp(150px, 32vh, 330px);
  z-index: -1; pointer-events: none;
  animation: tcp-carousel-fwd 13s linear infinite;
}
.tcp-orbit.tcp-orbit-back { animation-name: tcp-carousel-back; }
.tcp-orbit-cup {
  position: absolute; top: 50%; left: 50%; opacity: .55;
  font-size: clamp(15px, 3.2vh, 27px);
  filter: drop-shadow(0 3px 4px rgba(0, 0, 0, .4));
}
.tcp-orbit-cup:nth-child(1) { transform: translate(-50%, -50%) rotate(20deg) translateY(calc(-1 * clamp(72px, 16.5vh, 165px))); }
.tcp-orbit-cup:nth-child(2) { transform: translate(-50%, -50%) rotate(150deg) translateY(calc(-1 * clamp(72px, 16.5vh, 165px))); filter: drop-shadow(0 3px 4px rgba(0, 0, 0, .4)) hue-rotate(90deg); }
.tcp-orbit-cup:nth-child(3) { transform: translate(-50%, -50%) rotate(280deg) translateY(calc(-1 * clamp(72px, 16.5vh, 165px))); filter: drop-shadow(0 3px 4px rgba(0, 0, 0, .4)) hue-rotate(210deg); }

.tcp-ring {
  position: absolute; top: 46%; left: 50%; translate: -50% -50%;
  width: clamp(150px, 34vh, 340px); height: clamp(150px, 34vh, 340px);
  border-radius: 50%; border: 3px dashed rgba(255, 233, 168, .4);
  animation: tcp-ring-fwd 9s linear infinite; pointer-events: none; z-index: 0;
  transition: border-color 260ms ease, box-shadow 260ms ease;
}
.tcp-ring.tcp-ring-back { animation-name: tcp-ring-back; border-color: rgba(47, 227, 196, .5); }

/* The cup itself now spins continuously too (not just an idle bob) -
   "spinning" is the ride's resting state, lap-direction-matched, escalated
   further on lap 2's reversal. Bob keeps writing transform (unchanged);
   the continuous turn uses the INDEPENDENT rotate CSS property so the two
   compose instead of fighting over the same transform slot - same
   technique css/pier.css itself uses for .pier-screen's static translate
   vs its opacity-only entrance (see that file's header contract, rule 3a). */
.tcp-cupwrap {
  position: relative; z-index: 1;
  animation: tcp-idle-bob 2.6s ease-in-out infinite alternate, tcp-carousel-fwd 11s linear infinite;
}
.tcp-cupwrap.tcp-cupwrap-back { animation-name: tcp-idle-bob, tcp-carousel-back; }
.tcp-cup-big { display: block; font-size: clamp(68px, 17vh, 168px); filter: drop-shadow(0 8px 10px rgba(0, 0, 0, .45)); }
@keyframes tcp-idle-bob { from { transform: translateY(0); } to { transform: translateY(-5px); } }
@keyframes tcp-carousel-fwd { from { rotate: 0deg; } to { rotate: 360deg; } }
@keyframes tcp-carousel-back { from { rotate: 0deg; } to { rotate: -360deg; } }

.tcp-cup-big.tcp-spin-fwd { animation: tcp-spin-fwd 420ms cubic-bezier(.34, 1.1, .4, 1) both; }
.tcp-cup-big.tcp-spin-back { animation: tcp-spin-back 420ms cubic-bezier(.34, 1.1, .4, 1) both; }
.tcp-cup-big.tcp-wobble { animation: tcp-wobble 460ms ease both; }
.tcp-cup-big.tcp-flinch { animation: tcp-flinch 500ms ease both; }
@keyframes tcp-spin-fwd { 0% { transform: rotate(0deg) scale(1); } 55% { transform: rotate(220deg) scale(.8); } 100% { transform: rotate(380deg) scale(1); } }
@keyframes tcp-spin-back { 0% { transform: rotate(0deg) scale(1); } 55% { transform: rotate(-220deg) scale(.8); } 100% { transform: rotate(-380deg) scale(1); } }
@keyframes tcp-wobble {
  0%, 100% { transform: rotate(0deg); } 18% { transform: rotate(-14deg); } 36% { transform: rotate(11deg); }
  54% { transform: rotate(-8deg); } 72% { transform: rotate(6deg); } 88% { transform: rotate(-3deg); }
}
@keyframes tcp-flinch { 0%, 100% { transform: scale(1); } 40% { transform: scale(.86) rotate(-4deg); } 70% { transform: scale(1.05); } }

.tcp-spill { position: absolute; top: 30%; left: 50%; font-size: 15px; pointer-events: none; animation: tcp-spill-fall 620ms ease both; z-index: 2; }
@keyframes tcp-spill-fall {
  0% { transform: translate(-50%, 0) scale(.6); opacity: 0; }
  35% { opacity: 1; transform: translate(calc(-50% + var(--sx, 0px)), 8px) scale(1); }
  100% { transform: translate(calc(-50% + var(--sx, 0px)), 34px) scale(.7); opacity: 0; }
}

.tcp-dave { position: absolute; top: 6%; left: -10%; font-size: 30px; z-index: 3; pointer-events: none; animation: tcp-dave-fly 900ms cubic-bezier(.3, .6, .3, 1) both; }
@keyframes tcp-dave-fly {
  0% { transform: translate(0, 0) rotate(-8deg) scaleX(-1); opacity: 0; }
  12% { opacity: 1; }
  50% { transform: translate(120%, -18px) rotate(4deg) scaleX(-1); }
  100% { transform: translate(260%, 4px) rotate(10deg) scaleX(-1); opacity: 0; }
}

.tcp-flush-gremlin { position: absolute; top: 40%; left: 50%; font-size: 26px; z-index: 2; pointer-events: none; animation: tcp-flush-spiral 900ms cubic-bezier(.5, 0, .75, 0) both; }
@keyframes tcp-flush-spiral {
  0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); opacity: 1; }
  100% { transform: translate(-50%, 120%) rotate(540deg) scale(.15); opacity: 0; }
}

.tcp-stem { font-size: clamp(20px, 5vh, 36px); font-weight: 700; color: var(--parchment); text-align: center; min-height: 1.2em; position: relative; z-index: 1; }
.tcp-hint {
  max-width: 420px; text-align: center; font-size: clamp(12.5px, 1.9vh, 14.5px); line-height: 1.35; font-weight: 600;
  color: var(--parchment); background: rgba(255, 79, 163, .12); border: 2px solid rgba(255, 79, 163, .4);
  border-radius: 12px; padding: 0; opacity: 0; max-height: 0; overflow: hidden;
  transition: opacity 200ms ease, padding 200ms ease, max-height 200ms ease;
}
.tcp-hint.show { opacity: 1; padding: 7px 14px; max-height: 90px; }
.tcp-hint b { color: var(--pier-teal); }
.tcp-hint-tag { display: block; font-size: 10px; letter-spacing: .07em; font-weight: 700; color: var(--pier-pink); margin-bottom: 2px; }

/* ---------- end card (overlay) ---------- */
.tcp-sticker {
  display: inline-flex; flex-direction: column; align-items: center; justify-content: center;
  background: linear-gradient(160deg, #fff6da, #ffe29a); color: #5a4408; border: 4px solid var(--gold-deep);
  border-radius: 50%; width: 150px; height: 150px; margin: 0 auto 14px; transform: rotate(-6deg);
  box-shadow: 0 10px 0 rgba(0, 0, 0, .25), 0 18px 34px rgba(0, 0, 0, .35);
  animation: tcp-sticker-in 520ms var(--spring) both;
}
.tcp-sticker.tcp-sticker-gold { background: linear-gradient(160deg, #fff9e0, #ffd76b); box-shadow: 0 10px 0 rgba(0, 0, 0, .25), 0 0 40px rgba(244, 197, 66, .55); }
@keyframes tcp-sticker-in { from { transform: scale(.4) rotate(-6deg); opacity: 0; } to { transform: scale(1) rotate(-6deg); opacity: 1; } }
.tcp-sticker-emoji { font-size: 20px; margin-bottom: 3px; }
.tcp-sticker-text { font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 16px; line-height: 1.15; }
.tcp-ride-chip {
  display: flex; align-items: center; justify-content: center; width: 100%; text-align: center; border: none; cursor: pointer;
  background: rgba(47, 227, 196, .14); border: 2px solid rgba(47, 227, 196, .4); color: var(--parchment);
  border-radius: 999px; padding: 10px 16px; font-size: 13px; font-weight: 600; margin-bottom: 14px; min-height: 60px;
}
.tcp-ride-chip b { color: var(--pier-bulb); }
.tcp-end-btns { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.tcp-end-btns .btn { min-height: 60px; padding: 0 22px; font-size: 14px; flex: 1 1 auto; }
`;

export default {
  id: 'teacups',
  title: 'THE TEACUPS',
  blurb: 'A gentle warm-up spin through one whole times table.',

  mount(host, ctx, pier) {
    injectCss('pier-teacups', CSS);

    let alive = true;
    const timers = new Set();
    const later = (fn, ms) => {
      const tid = setTimeout(() => { timers.delete(tid); if (alive) fn(); }, ms);
      timers.add(tid);
      return tid;
    };

    const rng = mulberry32((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);

    // Tags THIS mount's host element so the chassis-workaround CSS rule
    // above only ever targets teacups' own instance — see that rule's
    // comment for why it's needed at all.
    host.classList.add('tcp-host');

    // ---- THE LAYOUT LAW skeleton (docs/PIER_REWORK.md §1) ----
    const chassis = pier.mountChassis({
      onBack: () => { ctx.audio.sfx('back'); ctx.go('#/pier'); },
      backLabel: '← PIER',
      dockClass: 'tcp-dock',
    });
    const hudTitle = el('div', 'tcp-hud-title', '🍵 THE TEACUPS');
    const hudChip = el('div', 'tcp-hud-chip');
    hudChip.style.display = 'none';
    chassis.hud.append(hudTitle, hudChip);

    // Exactly one overlay "speaks" at a time — closing the previous one
    // before opening the next un-registers its markOnScreen() text so the
    // caption bar (pier.say) never suppresses a LATER, unrelated line that
    // happens to share the same string (padkit.js's onScreenTexts registry
    // is a page-level singleton, not scoped to this mount).
    let activeOverlay = null;
    function openOverlay(contentEl, opts) {
      if (activeOverlay) activeOverlay.close();
      activeOverlay = chassis.overlay(contentEl, opts);
      return activeOverlay;
    }
    function closeOverlay() {
      if (activeOverlay) { activeOverlay.close(); activeOverlay = null; }
    }

    // ---- per-run state ----
    let table = null;
    let lap = 1; // 1 = multiplication, 2 = division inverses
    let queue = [];
    let qIndex = 0;
    let fact = null;
    let busy = false; // guards rapid repeat-taps during a spin/settle transition (HARD RULE 3)
    let numpad = null;
    let comboStreak = 0;
    let flawless = true; // whole-table (both laps) zero-mistakes tracker

    // DOM refs for the in-lap HUD (rebuilt fresh each lap via buildLapUI)
    let cupWrapEl = null;
    let cupEl = null;
    let ringEl = null;
    let stemEl = null;
    let hintEl = null;
    let dotsEl = null;
    let cupAreaEl = null;

    function setHudChip() {
      hudTitle.style.display = 'none';
      hudChip.style.display = '';
      hudChip.innerHTML = `TABLE ${table}<span class="tcp-hud-dir">${lap === 1 ? '× FORWARDS ↻' : '÷ BACKWARDS ↺'}</span>`;
    }
    function setHudTitle() {
      hudTitle.style.display = '';
      hudChip.style.display = 'none';
    }

    function familyParts(family) {
      const [p, q] = String(family).split('x').map(Number);
      return [p, q];
    }

    function hintFor(f) {
      const [p, q] = familyParts(f.family);
      const product = p * q;
      if (f.dir === 'mul') {
        return `Ooh — spin it again! <b>${f.a} × ${f.b} = ${f.answer}</b>.`;
      }
      return `Ooh — spin it again! <b>${p} × ${q} = ${product}</b>, so <b>${product} ÷ ${f.a} = ${f.answer}</b>.`;
    }

    /* ================= welcome (screen-level overlay) ================= */
    function showWelcome() {
      const line = pick(rng, TC.welcome);
      const card = el('div', 'tcp-welcome');
      card.innerHTML = `
        <div class="tcp-welcome-emoji">🍵</div>
        <h2>THE TEACUPS</h2>
        <p class="tcp-welcome-blurb">A gentle spin through one whole times table — no clock, no score.</p>
        ${line ? `<div class="tcp-nana-line"><span class="tcp-nana-avatar">👵</span><span>${line.text}</span></div>` : ''}
      `;
      const startBtn = el('button', 'btn btn-gold tcp-start', 'START 🍵');
      card.append(startBtn);
      openOverlay(card, { cardClass: 'tcp-ov-welcome', speaks: line });
      if (line) pier.say(line); // VO attempts even though the bubble self-suppresses (isOnScreen)
      startBtn.addEventListener('click', () => { ctx.audio.sfx('confirm'); sfx.ui(); closeOverlay(); });
    }

    /* ================= table picker (stage) ================= */
    function renderPicker() {
      setHudTitle();
      chassis.stage.innerHTML = '';
      // Read the Deluxe flag FRESH every time the picker renders (never a
      // cached copy) — "spin another table" from the end card returns here
      // without a full remount, so a stale boolean would be a real bug.
      const deluxe = pier.facts.deluxeOn();
      const max = deluxe ? 12 : 10;

      const wrap = el('div', 'tcp-picker tcp-fade-in');
      wrap.innerHTML = `
        <h2>PICK YOUR CUP</h2>
        <p class="tcp-picker-sub">${deluxe ? 'Deluxe’s on — even 11 and 12 fancy a spin today!' : 'Which table fancies a spin today?'}</p>
      `;
      const grid = el('div', 'tcp-cupgrid');
      for (let n = 2; n <= max; n += 1) {
        const cup = el('button', 'tcp-cup', `<span class="tcp-cup-emoji">🍵</span><span class="tcp-cup-num">${n}</span>`);
        cup.type = 'button';
        cup.addEventListener('click', () => { ctx.audio.sfx('confirm'); sfx.pop(); startTable(n); });
        grid.append(cup);
      }
      wrap.append(grid);
      chassis.stage.append(wrap);
    }

    /* ================= running a table ================= */
    function startTable(n) {
      table = n;
      lap = 1;
      flawless = true;
      comboStreak = 0;
      buildQueue();
      showLapCeremony(() => { buildLapUI(); showQuestion(); });
    }

    function buildQueue() {
      const raw = pier.facts.tableFacts(table, { division: lap === 2 });
      queue = shuffle(rng, raw);
      qIndex = 0;
    }

    /* ---- lap-change ceremony (screen-level overlay) — the reversal demo ---- */
    function showLapCeremony(onGo) {
      const flip = lap === 2;
      const card = el('div', 'tcp-lapcard');
      card.innerHTML = `
        <div class="tcp-lap-demo${flip ? ' tcp-lap-demo-flip' : ''}">
          <span class="tcp-demo-ring"></span>
          <span class="tcp-demo-cup">🍵</span>
        </div>
        <h2>${flip ? 'LAP 1 DONE!' : `TABLE ${table}`}</h2>
        <p>${flip ? 'Now the cups spin <b>BACKWARDS</b> — division time!' : 'Lap 1 — <b>forwards!</b> Watch the cup spin as you go.'}</p>
      `;
      const goBtn = el('button', 'btn btn-gold tcp-lap-go', flip ? 'SPIN BACKWARDS! 🔄' : "LET'S GO! 🍵");
      card.append(goBtn);
      openOverlay(card, { cardClass: 'tcp-ov-lap' });
      goBtn.addEventListener('click', () => {
        ctx.audio.sfx('confirm'); sfx.ui(); closeOverlay(); onGo();
      });
    }

    function buildLapUI() {
      chassis.stage.innerHTML = '';
      setHudChip();
      busy = false;
      const wrap = el('div', 'tcp-lap tcp-fade-in');

      dotsEl = el('div', 'tcp-dots');
      for (let i = 0; i < queue.length; i += 1) dotsEl.append(el('span', 'tcp-dot'));

      cupAreaEl = el('div', 'tcp-cuparea');
      const back = lap === 2;
      const platformEl = el('div', 'tcp-platform');
      const orbitEl = el('div', 'tcp-orbit' + (back ? ' tcp-orbit-back' : ''));
      orbitEl.append(
        el('span', 'tcp-orbit-cup', '🍵'),
        el('span', 'tcp-orbit-cup', '🍵'),
        el('span', 'tcp-orbit-cup', '🍵'),
      );
      ringEl = el('div', 'tcp-ring' + (back ? ' tcp-ring-back' : ''));
      cupWrapEl = el('div', 'tcp-cupwrap' + (back ? ' tcp-cupwrap-back' : ''));
      cupEl = el('span', 'tcp-cup-big', '🍵');
      cupWrapEl.append(cupEl);
      stemEl = el('div', 'tcp-stem');
      cupAreaEl.append(platformEl, orbitEl, ringEl, cupWrapEl, stemEl);

      hintEl = el('div', 'tcp-hint');

      wrap.append(dotsEl, cupAreaEl, hintEl);
      chassis.stage.append(wrap);

      if (numpad) numpad.destroy();
      numpad = makeNumpad(chassis.dock, { onSubmit: handleSubmit });
    }

    function paintDots() {
      Array.from(dotsEl.children).forEach((dot, i) => {
        dot.classList.toggle('done', i < qIndex);
        dot.classList.toggle('current', i === qIndex);
      });
    }

    function showQuestion() {
      fact = queue[qIndex];
      stemEl.textContent = fact.stem;
      hintEl.classList.remove('show');
      hintEl.innerHTML = '';
      paintDots();
    }

    function handleSubmit(valueStr) {
      // Second guard on top of numpad.setEnabled(false): repeat-tap controls
      // must act on the pending target, never a settled/about-to-change one
      // (HARD RULE 3) — while busy, there IS no valid target yet, so ignore.
      if (busy || !fact) return;
      const activeFact = fact; // snapshot — the comparison below always
      // matches exactly what's on screen right now (HARD RULE 2).
      const val = parseInt(valueStr, 10);
      const correct = val === activeFact.answer;
      // Teacups is untimed by design (§6) — `ms: null` deliberately, so this
      // gentle lap never feeds a "too slow" gremlin verdict off real-world
      // thinking time.
      const result = pier.facts.record(activeFact.family, { correct, ms: null, mode: 'teacups' });
      if (correct) handleCorrect(activeFact, result);
      else handleWrong(activeFact);
    }

    function spawnSpill() {
      for (let i = 0; i < 3; i += 1) {
        const drop = el('span', 'tcp-spill', '💧');
        drop.style.setProperty('--sx', `${(i - 1) * 16}px`);
        drop.style.animationDelay = `${i * 40}ms`;
        cupAreaEl.append(drop);
        later(() => drop.remove(), 700 + i * 40);
      }
    }

    function handleWrong(activeFact) {
      flawless = false;
      comboStreak = 0;
      ctx.audio.sfx('wrong');
      sfx.nudge();
      cupEl.classList.remove('tcp-wobble');
      void cupEl.offsetWidth; // restart the keyframe even on back-to-back misses
      cupEl.classList.add('tcp-wobble');
      spawnSpill();
      hintEl.innerHTML = `<span class="tcp-hint-tag">WARM HINT</span>${hintFor(activeFact)}`;
      hintEl.classList.add('show');
      numpad.clear();
      const line = pick(rng, TC.nearMiss);
      if (line) pier.say(line);
      // No advance, no cap, no penalty — retry the SAME fact until it lands.
    }

    function flushMoment(line) {
      sfx.whoosh();
      const g = el('div', 'tcp-flush-gremlin', '👺');
      cupAreaEl.append(g);
      later(() => sfx.drop(), 260);
      later(() => g.remove(), 900);
      // sparkleBurst()'s x/y are relative to the STAGE's own box (it appends
      // position:absolute children into it — see js/anims/_kit.js), not the
      // viewport, so a raw getBoundingClientRect() must be re-based against
      // the stage's own origin first.
      const stageRect = chassis.stage.getBoundingClientRect();
      const r = cupAreaEl.getBoundingClientRect();
      sparkleBurst(chassis.stage, r.left + r.width / 2 - stageRect.left, r.top + r.height * 0.35 - stageRect.top, 8);
      if (line) pier.say(line);
    }

    function comboMoment() {
      sfx.sparkle();
      cupAreaEl.classList.add('tcp-combo-glow');
      later(() => cupAreaEl.classList.remove('tcp-combo-glow'), 900);
      const line = pick(rng, TC.combo);
      if (line) pier.say(line);
    }

    function daveMoment() {
      const dave = el('div', 'tcp-dave', '🐦');
      cupAreaEl.append(dave);
      later(() => {
        cupEl.classList.remove('tcp-flinch');
        void cupEl.offsetWidth;
        cupEl.classList.add('tcp-flinch');
      }, 380);
      later(() => dave.remove(), 900);
      sfx.whoosh();
      const line = pick(rng, TC.daveTheft);
      if (line) pier.say(line);
    }

    function handleCorrect(activeFact, result) {
      busy = true;
      numpad.setEnabled(false);
      ctx.audio.sfx('correct');
      (lap === 1 ? sfx.tick : sfx.tock)(1);
      comboStreak += 1;
      cupAreaEl.classList.remove('tcp-flash-correct');
      void cupAreaEl.offsetWidth;
      cupAreaEl.classList.add('tcp-flash-correct');

      let delay = 620;

      if (result && result.justFlushed) {
        delay = 900;
        flushMoment(pick(rng, TC.gremlinFlush));
      } else if (comboStreak > 0 && comboStreak % 3 === 0) {
        comboMoment();
      } else if (qIndex > 0 && rng() < (1 / 7)) {
        // A rare, unblocking Dave cameo — physical comedy, never a penalty.
        daveMoment();
      }

      later(() => {
        cupAreaEl.classList.remove('tcp-flash-correct');
        qIndex += 1;
        if (qIndex >= queue.length) onLapComplete();
        else spinToNextQuestion();
      }, delay);
    }

    function spinToNextQuestion() {
      cupEl.classList.remove('tcp-spin-fwd', 'tcp-spin-back');
      void cupEl.offsetWidth;
      cupEl.classList.add(lap === 1 ? 'tcp-spin-fwd' : 'tcp-spin-back');
      later(() => {
        showQuestion();
        numpad.clear();
        numpad.setEnabled(true);
        busy = false;
      }, 420);
    }

    function onLapComplete() {
      if (lap === 1) {
        lap = 2;
        comboStreak = 0;
        buildQueue();
        showLapCeremony(() => { buildLapUI(); showQuestion(); });
      } else {
        finish();
      }
    }

    /* ================= end screen (screen-level overlay) ================= */
    function finish() {
      setHudTitle();
      const ride = pick(rng, BIG_RIDES);
      const pool = flawless ? TC.goldBeaten : TC.newPB;
      const line = pick(rng, pool);
      const card = el('div', 'tcp-end');
      card.innerHTML = `
        <div class="tcp-sticker${flawless ? ' tcp-sticker-gold' : ''}">
          <div class="tcp-sticker-emoji">${flawless ? '🏆🍵' : '✨🍵✨'}</div>
          <div class="tcp-sticker-text">TABLE ${table}<br>POLISHED!</div>
        </div>
        <p class="tcp-end-sub">${flawless
          ? 'Not one wobble on either lap — a flawless polish!'
          : 'Both laps spun clean — multiplication and the division inverses.'}</p>
        ${line ? `<div class="tcp-nana-line"><span class="tcp-nana-avatar">👵</span><span>${line.text}</span></div>` : ''}
      `;
      // F4 fix: `.tcp-ride-chip` is `display:flex` (for vertical centring) with
      // mixed raw-text + `<b>` content directly inside it — flexbox wraps each
      // maximal run of inline content in its own anonymous flex item and trims
      // LEADING/TRAILING whitespace at each of those boxes' own edges, silently
      // eating the space either side of `<b>` (the same "🚽0flushed forever"
      // mechanism already fixed on the hub's/tank's flushed chip — see
      // js/screens/pier.js's and js/pier/modes/tank.js's matching comments).
      // Fix: wrap the whole label in ONE inline `<span>` so it is the flex
      // container's only child/flex item — ordinary inline whitespace rules
      // then apply throughout its content.
      const rideChip = el('button', 'tcp-ride-chip', `<span>Fancy a bigger ride? <b>${ride.emoji} ${ride.label}</b> →</span>`);
      rideChip.type = 'button';
      rideChip.addEventListener('click', () => { ctx.audio.sfx('confirm'); ctx.go(`#/pier/${ride.id}`); });

      const btnRow = el('div', 'tcp-end-btns');
      const again = el('button', 'btn btn-gold', 'SPIN ANOTHER TABLE 🍵');
      const homeBtn = el('button', 'btn btn-ghost', '← PIER');
      again.addEventListener('click', () => { ctx.audio.sfx('confirm'); closeOverlay(); renderPicker(); });
      homeBtn.addEventListener('click', () => { ctx.audio.sfx('back'); ctx.go('#/pier'); });
      btnRow.append(again, homeBtn);

      card.append(rideChip, btnRow);
      openOverlay(card, { cardClass: 'tcp-ov-end', speaks: line });
      if (line) pier.say(line); // VO attempts even though the bubble self-suppresses (isOnScreen)

      sfx.sparkle();
      party(chassis.stage, flawless ? 22 : 14);
    }

    renderPicker();
    showWelcome();

    return function cleanup() {
      alive = false;
      timers.forEach((tid) => clearTimeout(tid));
      timers.clear();
      if (numpad) { numpad.destroy(); numpad = null; }
      // Un-registers whatever line the currently-open overlay (if any) is
      // "speaking" from padkit.js's page-level onScreenTexts registry — see
      // the openOverlay() comment above for why this must not be skipped.
      closeOverlay();
    };
  },
};
