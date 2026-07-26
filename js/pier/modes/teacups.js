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
/* ---------- CHASSIS WORKAROUND (see mount()'s host.classList.add) ----------
   css/pier.css's \`.pier-mode-host\` rule (chassis-owned, not this file) sets
   flex/min-height for how the host behaves AS A CHILD of .pier-screen, but
   never declares \`display:flex; flex-direction:column\` for how it lays out
   ITS OWN children — so pier.mountChassis(host,...)'s hud/stage/dock stack
   as plain blocks instead of a flex column, and the dock (meant to be
   flex:none/never-shrink) silently adopts whatever height its content wants,
   pushing past the viewport with zero warning (measured: at 1000×540 with
   the wrong-answer hint open, GO's bottom sat at 569px, 29px below the
   fold — THE LAYOUT LAW violation this whole rework exists to fix, now one
   layer down in the shared chassis rather than in a mode). Flagged for the
   HUB/CHASSIS agent to fix properly in css/pier.css; scoped here to ONLY
   this mount's own host element (tagged in mount() below) so it can never
   affect another mode's .pier-mode-host. */
.tcp-host.pier-mode-host { display: flex; flex-direction: column; }

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
.tcp-picker { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 6px 16px; max-width: 640px; margin: 0 auto; }
.tcp-picker h2 { font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: clamp(18px, 3vh, 24px); color: var(--pier-bulb); margin: 0 0 4px; }
.tcp-picker-sub { font-size: 13.5px; color: rgba(246, 235, 212, .75); margin: 0 0 14px; }
.tcp-cupgrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(72px, 1fr)); gap: 10px; width: 100%; }
.tcp-cup {
  min-height: 68px; border: 3px solid rgba(47, 227, 196, .35); border-radius: 16px; cursor: pointer; padding: 6px 4px;
  background: linear-gradient(160deg, #141c44, #0a1230); color: var(--parchment);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px;
  box-shadow: 0 5px 0 rgba(0, 0, 0, .35); transition: transform 140ms var(--spring), box-shadow 140ms var(--spring);
}
.tcp-cup:active { transform: scale(.93) translateY(2px); box-shadow: 0 2px 0 rgba(0, 0, 0, .35); }
.tcp-cup-emoji { font-size: 21px; }
.tcp-cup-num { font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 16px; color: var(--pier-teal); }

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
.tcp-lap { display: flex; flex-direction: column; align-items: center; gap: clamp(4px, 1.4vh, 12px); height: 100%; justify-content: center; padding: 4px 12px; }
.tcp-dots { display: flex; flex-wrap: wrap; justify-content: center; gap: 5px; max-width: 300px; }
.tcp-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255, 255, 255, .18); flex: none; }
.tcp-dot.done { background: var(--correct); }
.tcp-dot.current { background: var(--pier-bulb); box-shadow: 0 0 0 3px rgba(255, 233, 168, .3); }

.tcp-cuparea { position: relative; display: flex; flex-direction: column; align-items: center; gap: clamp(2px, .8vh, 6px); }
.tcp-cuparea.tcp-flash-correct .tcp-cupwrap::after {
  content: ''; position: absolute; inset: -18px; border-radius: 50%;
  background: radial-gradient(circle, rgba(46, 204, 113, .4), transparent 70%);
  animation: tcp-correct-pulse 620ms ease both;
}
@keyframes tcp-correct-pulse { 0% { opacity: 0; scale: .7; } 30% { opacity: 1; scale: 1.05; } 100% { opacity: 0; scale: 1.25; } }
.tcp-cuparea.tcp-combo-glow .tcp-ring { border-color: var(--gold); box-shadow: 0 0 18px 2px rgba(244, 197, 66, .5); }

.tcp-ring {
  position: absolute; top: 46%; left: 50%; translate: -50% -50%;
  width: clamp(78px, 15vh, 128px); height: clamp(78px, 15vh, 128px);
  border-radius: 50%; border: 3px dashed rgba(255, 233, 168, .4);
  animation: tcp-ring-fwd 9s linear infinite; pointer-events: none; z-index: 0;
  transition: border-color 260ms ease, box-shadow 260ms ease;
}
.tcp-ring.tcp-ring-back { animation-name: tcp-ring-back; border-color: rgba(47, 227, 196, .5); }

.tcp-cupwrap { position: relative; z-index: 1; animation: tcp-idle-bob 2.6s ease-in-out infinite alternate; }
.tcp-cup-big { display: block; font-size: clamp(38px, 9vh, 62px); filter: drop-shadow(0 6px 8px rgba(0, 0, 0, .45)); }
@keyframes tcp-idle-bob { from { transform: translateY(0); } to { transform: translateY(-5px); } }

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

.tcp-stem { font-size: clamp(19px, 4.2vh, 28px); font-weight: 700; color: var(--parchment); text-align: center; min-height: 1.2em; }
.tcp-hint {
  max-width: 380px; text-align: center; font-size: 12.5px; line-height: 1.35; font-weight: 600;
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

      const wrap = el('div', 'tcp-picker enter-pop');
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
      const wrap = el('div', 'tcp-lap enter-pop');

      dotsEl = el('div', 'tcp-dots');
      for (let i = 0; i < queue.length; i += 1) dotsEl.append(el('span', 'tcp-dot'));

      cupAreaEl = el('div', 'tcp-cuparea');
      ringEl = el('div', 'tcp-ring' + (lap === 2 ? ' tcp-ring-back' : ''));
      cupWrapEl = el('div', 'tcp-cupwrap');
      cupEl = el('span', 'tcp-cup-big', '🍵');
      cupWrapEl.append(cupEl);
      stemEl = el('div', 'tcp-stem');
      cupAreaEl.append(ringEl, cupWrapEl, stemEl);

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
      const rideChip = el('button', 'tcp-ride-chip', `Fancy a bigger ride? <b>${ride.emoji} ${ride.label}</b> →`);
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
