// FART QUEST — js/pier/modes/tank.js (TANK agent)
// THE GREMLIN TANK — an aquarium view of every current Gas Gremlin (a weak
// times-table fact family) plus a short "SPLAT 'EM" numpad round that
// flushes them for good. See docs/PIER_SPEC.md §6 "tank" (mechanic) and
// docs/PIER_REWORK.md §1 (THE LAYOUT LAW) + §3 "tank" (binding for THIS
// file — the three-state rebuild) for what this build fixes.
//
// *** THE BUG THIS REWORK FIXES ***
// v1 rendered the SPARKLING CLEAN celebration (stamp + full confetti +
// "Marvellous work!") whenever `facts.gremlins().length === 0` — which is
// ALSO true on a brand-new profile that has never played a single sum.
// Damien: "when entered, just tells you you've finished the game" — it was
// congratulating a boy for finishing a game he had not started.
// FIX: three explicitly distinct states, chosen from TWO signals
// (`facts.gremlins().length` and `facts.flushed()`), never conflated:
//   FRESH    — 0 gremlins EVER (flushed === 0 too)       -> no celebration
//   AQUARIUM — >=1 live gremlin right now                 -> the tank itself
//   CLEAN    — 0 live gremlins AND flushed > 0             -> THE celebration
// (docs/PIER_REWORK.md §3 "tank", contract-exact.)
//
// *** CHASSIS: uses pier.mountChassis(), never an in-stage veil ***
// hud/stage/dock via `pier.mountChassis(opts)` (js/pier/padkit.js). The
// numpad and every primary-action button live in `dock` (flex:none, never
// shrinks/clips — THE LAYOUT LAW §1.3); only decorative/informational
// content (the tank glass, the gremlin grid, the question card) lives in
// `stage` (flex:1; min-height:0 — the one thing allowed to shrink). The
// round-complete SCORECARD goes through `chassis.overlay()` (screen-level,
// `translate:`-centred, `max-height:calc(100dvh-32px)`) per §1.4's explicit
// "scorecards" listing — v1 rendered that card loose inside the stage,
// which is exactly the pattern §1.4 forbids.
//
// *** CHASSIS GAP, independently re-found + worked around here too ***
// `mountChassis(container, opts)` tags `container` with a `.pier-chassis`
// class expecting it to already BE (or become) a flex column, but
// `css/pier.css` has no rule for `.pier-chassis` and `.pier-mode-host`
// itself is only a flex ITEM (`flex:1 1 auto`), never a flex CONTAINER for
// its own hud/stage/dock children — without a fix, THIS file's dock could
// be pushed off-screen exactly like v1's bug. The GHOST and GUNGE agents
// hit and flagged the identical gap in their own files (their headers cite
// the same grep-confirmed absence in css/pier.css); this file applies the
// SAME one-line, same-selector fix for consistency (idempotent with theirs
// — identical declarations, so no cascade fight regardless of mount order):
//   .pier-mode-host.pier-chassis { display:flex; flex-direction:column; }
// See the final report for the recommendation to promote this single rule
// into css/pier.css so no future mode has to rediscover it.
//
// *** OVERLAY CONFETTI GOTCHA (found + worked around) ***
// `chassis.overlay()`'s veil is `position:fixed; z-index:200` on
// `.pier-screen` — an ancestor with a permanently pinned `transform`
// (css/pier.css's own header comment explains why: `.enter-pop`'s
// `animation-fill-mode:both`), which makes `.pier-screen` a stacking
// context. `party()`/`sparkleBurst()` append particles as children of
// whatever element they're given; calling them on `chassis.stage` while
// the round-complete veil is showing would render the confetti UNDER the
// veil (z-index 24 vs 200) — invisible. Fixed by targeting the overlay's
// OWN veil element (`ov.el`, returned by `chassis.overlay()`) for any
// celebration fired at round-complete time, and reserving `chassis.stage`
// for celebrations fired while no veil is up (the CLEAN state's own
// sparkle, which renders directly with nothing covering it).
//
// *** DELIBERATE DEVIATION: no separate "welcome overlay to dismiss" ***
// PIER_SPEC §6's common preamble describes every machine opening with a
// welcome-overlay-then-START gate. Tank's three states (per REWORK §3) are
// each already a complete, actionable screen the moment you land on them —
// gating them behind an extra "STEP UP TO THE TANK" click (v1's actual
// behaviour) is pure friction with nothing to explain that the state itself
// doesn't already explain, and works against "never a dead end" for the
// FRESH state specifically (an extra tap between arriving and being told
// what to do). All three states render directly in the chassis stage/dock;
// `chassis.overlay()` is reserved for the one true modal moment tank has —
// the round-complete scorecard.
//
// Rules honoured throughout: Hard Rule ② (a fact/state is only ever quoted
// in feedback while the board is showing exactly that state — see the
// isGremlin-vs-round-kind reasoning in paintQuestion()); Hard Rule ④ (Dave's
// flight is the only state-driven motion in this file, and it goes through
// kit `tween()` — everything else is either a discrete DOM swap or an
// ambient CSS @keyframes loop, which is the established codebase norm for
// idle/decorative motion, not the "no bare rAF" rule's target); cleanup
// cancels every timer/tween/numpad/on-screen-text registration it made.

import {
  el, sfx, tween, sparkleBurst, party, injectCss,
} from '../../anims/_kit.js';
import { makeNumpad, markOnScreen } from '../padkit.js';
import { mulberry32, pick } from '../../rng.js';
// Direct sibling import of content.js — same precedent already established
// by this file's v1 (and independently by GHOST/GUNGE this pass): the hub's
// `pier.content` kit only forwards the top-level nana/announcer/dave/
// gremlin pools (js/screens/pier.js ensureContent()), not `machine` (the
// per-mode welcome/combo/nearMiss/daveTheft/gremlinFlush/newPB/goldBeaten
// pools this file needs) or `GREMLIN_NAMES`. content.js is a pure data
// module — importing it directly is exactly as safe as pier.js's own
// dynamic import, with none of the "still-landing module" risk that guard
// existed for.
import {
  nana, announcer, machine, GREMLIN_NAMES,
} from '../content.js';

const LINES = machine.tank;
const PRACTICE_LEN = 10; // free-practice round length — short, matches the "never a dead end" spirit without turning into a whole session

/* ---------- tiny pure helpers (unchanged from v1 — already correct) ---------- */

// A stable (not random-per-render) emoji per fact family, so a gremlin keeps
// the same face every time the tank re-renders.
const GREMLIN_EMOJI = ['👺', '👹', '🧌', '👻', '🦠', '🐌', '🦑', '🐙', '🐛', '🪱', '👾', '🦟'];
function emojiForFamily(family) {
  let h = 0;
  for (let i = 0; i < family.length; i += 1) h = (h * 31 + family.charCodeAt(i)) >>> 0;
  return GREMLIN_EMOJI[h % GREMLIN_EMOJI.length];
}

function familyParts(family) {
  const [lo, hi] = family.split('x').map(Number);
  return { lo, hi, product: lo * hi };
}
// "6 × 7 = 42, so 42 ÷ 7 = 6" — the same worked-fact phrasing Gunge uses for
// its own wrong/slow reveal (PIER_SPEC §6), reused here so the whole pier
// teaches a family the same way wherever you meet it.
function workedFactText(family) {
  const { lo, hi, product } = familyParts(family);
  return `${lo} × ${hi} = ${product}, so ${product} ÷ ${hi} = ${lo}`;
}

function freshRng() {
  return mulberry32((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
}

function gremlinInfo(family, fallbackName) {
  return GREMLIN_NAMES[family] || { name: fallbackName || family, oneliner: '' };
}

/* ---------- styles ---------- */
const CSS = `
/* ---- chassis flex-container fix (see header block) ---- */
.pier-mode-host.pier-chassis { display: flex; flex-direction: column; }

.pt-body { display:flex; flex-direction:column; }

/* ---- HUD chips ---- */
.pt-title-chip, .pt-progress-chip {
  background:rgba(10,18,48,.7); border:2px solid rgba(255,79,163,.32); color:var(--parchment);
  padding:8px 14px; border-radius:999px; font-family:'Fredoka',sans-serif; font-weight:700; font-size:13px;
  box-shadow:0 4px 0 rgba(0,0,0,.3); white-space:nowrap; min-height:34px; display:flex; align-items:center;
}
.pt-progress-chip { border-color:rgba(47,227,196,.4); display:none; }
.pt-progress-chip b { color:var(--pier-teal,#2fe3c4); }
/* .pier-flushed-chip is a GLOBAL class already defined by css/pier.css (the
   hub's flushed-counter chip) — reused verbatim here (not redefined) so this
   cabinet's own flushed counter looks identical to the hub's, for free. */
.pier-flushed-chip.pt-bump { animation:pt-chip-bump .5s var(--spring) both; }
@keyframes pt-chip-bump { 0% { scale:1; } 40% { scale:1.2; } 100% { scale:1; } }

/* ---- dock: CTA buttons (fresh / aquarium / clean idle states) ---- */
.pt-dock-row { display:flex; flex-wrap:wrap; gap:10px; justify-content:center; align-items:center; width:100%; }
.pt-dock-btn { min-height:60px; padding:0 20px; font-size:14.5px; }

/* ---- fresh / clean: the tank shell ---- */
.pt-empty-wrap { display:flex; flex-direction:column; align-items:center; gap:10px; padding:10px 14px; text-align:center; max-width:420px; margin:0 auto; }
.pt-tank-glass {
  position:relative; width:min(210px,58vw); height:92px; border-radius:var(--r-md); overflow:hidden;
  background:linear-gradient(180deg, rgba(47,227,196,.12), rgba(10,18,48,.55) 70%);
  border:3px solid rgba(47,227,196,.28); box-shadow:inset 0 0 28px rgba(47,227,196,.1), 0 6px 0 rgba(0,0,0,.3);
  display:flex; align-items:center; justify-content:center;
}
.pt-tank-glass::before, .pt-tank-glass::after {
  content:''; position:absolute; width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,.3);
  bottom:-10px; animation:pt-bubble-rise 4.6s linear infinite;
}
.pt-tank-glass::before { left:22%; animation-delay:.2s; }
.pt-tank-glass::after { left:68%; width:6px; height:6px; animation-delay:1.6s; }
@keyframes pt-bubble-rise { 0% { translate:0 0; opacity:.7; } 90% { opacity:.4; } 100% { translate:0 -104px; opacity:0; } }
.pt-net { font-size:34px; rotate:-12deg; animation:pt-net-sway 2.4s ease-in-out infinite; filter:drop-shadow(0 3px 4px rgba(0,0,0,.4)); }
@keyframes pt-net-sway { 0%,100% { rotate:-14deg; } 50% { rotate:-4deg; } }
.pt-stamp {
  font-family:'Fredoka',sans-serif; font-weight:700; font-size:14px; color:#1d8f4e;
  background:linear-gradient(180deg,#E9FBEF,#D3F3DF); border:3px solid var(--correct);
  border-radius:12px; padding:6px 14px; rotate:-6deg; animation:pt-stamp-in 460ms var(--spring) both;
}
@keyframes pt-stamp-in { from { scale:.4; opacity:0; } to { scale:1; opacity:1; } }
.pt-empty-copy { color:rgba(246,235,212,.88); font-size:13.5px; line-height:1.4; margin:0; }

/* ---- aquarium grid ---- */
.pt-grid { display:flex; flex-wrap:wrap; justify-content:center; gap:12px; width:100%; padding:6px 10px; }
.pt-gremlin-card {
  width:148px; background:linear-gradient(160deg,#131c3e,#0c1330); border:3px solid rgba(255,79,163,.3);
  border-radius:var(--r-md); box-shadow:0 5px 0 rgba(0,0,0,.3), 0 10px 18px rgba(0,0,0,.3);
  padding:12px 10px; text-align:center;
  animation: enter-pop 380ms var(--spring) both, pt-swim-bob 2.6s ease-in-out infinite alternate, pt-swim-rock 3.6s ease-in-out infinite;
}
@keyframes pt-swim-bob { from { translate:0 0; } to { translate:0 -6px; } }
@keyframes pt-swim-rock { 0%,100% { rotate:-2.5deg; } 50% { rotate:2.5deg; } }
.pt-g-emoji { font-size:32px; filter:drop-shadow(0 3px 5px rgba(0,0,0,.4)); }
.pt-g-name { font-family:'Fredoka',sans-serif; font-weight:700; color:var(--pier-bulb,#ffe9a8); font-size:13px; margin-top:4px; }
.pt-g-oneliner { font-size:10.5px; color:rgba(246,235,212,.7); line-height:1.3; margin-top:5px; min-height:38px; }
.pt-g-fact { font-family:'Fredoka',sans-serif; font-weight:700; color:var(--pier-teal,#2fe3c4); font-size:14px; margin-top:5px; }
.pt-g-tally { font-size:10.5px; color:rgba(255,150,150,.95); margin-top:3px; font-weight:600; }

/* ---- round: the play card ---- */
.pt-play-wrap { position:relative; width:100%; max-width:340px; margin:auto; padding-top:30px; display:flex; justify-content:center; }
.pt-play-card {
  width:100%; background:linear-gradient(160deg,#131c3e,#0c1330); border:3px solid rgba(255,233,168,.45);
  border-radius:var(--r-md); box-shadow:0 6px 0 rgba(0,0,0,.3); padding:10px 16px 12px; text-align:center;
  animation: pt-swim-bob 2.8s ease-in-out infinite alternate;
}
.pt-play-card.pt-wiggle { animation: pt-card-wiggle .42s ease-in-out; }
@keyframes pt-card-wiggle { 0%,100% { translate:0 0; } 25% { translate:-5px 0; } 50% { translate:5px 0; } 75% { translate:-3px 0; } }
.pt-play-card.pt-flushing { animation: pt-flush-spiral .9s cubic-bezier(.5,0,.75,0) forwards; }
@keyframes pt-flush-spiral {
  0% { translate:0 0; scale:1; rotate:0deg; opacity:1; }
  60% { translate:0 34px; scale:.7; rotate:220deg; opacity:.85; }
  100% { translate:0 74px; scale:.15; rotate:520deg; opacity:0; }
}
.pt-flavor-row { display:flex; align-items:center; justify-content:center; gap:6px; margin-bottom:4px; }
.pt-flavor-emoji { font-size:20px; }
.pt-flavor-name { font-family:'Fredoka',sans-serif; font-weight:700; font-size:12px; color:var(--pier-bulb,#ffe9a8); }
.pt-stem-text {
  font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-weight:600;
  font-size:clamp(20px,4.4vw,28px); color:var(--parchment);
}
.pt-stem-text.pt-flash-correct { text-shadow:0 0 12px rgba(46,204,113,.75); }
.pt-stem-text.pt-flash-wrong { text-shadow:0 0 12px rgba(231,76,60,.6); }

/* ---- feedback banner: ABSOLUTE, never affects layout height (THE LAW) ---- */
.pt-feedback-banner {
  position:absolute; left:50%; top:0; translate:-50% 0;
  padding:7px 14px; border-radius:999px; font-weight:700; font-size:13px;
  max-width:94%; text-align:center; z-index:5; box-shadow:0 4px 0 rgba(0,0,0,.25);
  animation: pt-fb-pop 1.15s ease both; pointer-events:none;
}
@keyframes pt-fb-pop {
  0% { translate:-50% 8px; scale:.85; opacity:0; }
  14% { translate:-50% 0; scale:1.06; opacity:1; }
  30% { translate:-50% 0; scale:1; opacity:1; }
  100% { translate:-50% -12px; scale:1; opacity:0; }
}
.pt-fb-correct { background:linear-gradient(180deg,#eafff1,#d3f3df); color:#1d8f4e; border:2px solid var(--correct); }
.pt-fb-wrong { background:rgba(8,12,26,.94); color:var(--parchment); border:2px solid var(--wrong); white-space:normal; font-weight:600; font-size:12.5px; padding:8px 14px; }
.pt-fb-wrong b { color:var(--pier-bulb,#ffe9a8); }
.pt-fb-flush { background:linear-gradient(180deg,#fff7e0,#ffe9a8); color:#7a5a06; border:2px solid #d9a21b; }

/* ---- combo badge ---- */
.pt-combo-badge {
  position:absolute; right:-4px; top:-10px; z-index:6; pointer-events:none;
  background:linear-gradient(180deg,var(--gold),var(--gold-deep)); color:var(--ink);
  font-family:'Fredoka',sans-serif; font-weight:700; font-size:12px;
  padding:5px 10px; border-radius:999px; box-shadow:0 3px 0 rgba(0,0,0,.3);
  animation: pt-combo-pop .9s var(--spring) both;
}
@keyframes pt-combo-pop { 0% { scale:.5; opacity:0; } 30% { scale:1.15; opacity:1; } 100% { scale:1; opacity:0; } }

/* ---- flush ceremony toilet ---- */
.pt-toilet {
  position:absolute; left:50%; top:24px; translate:-50% 0; z-index:4; pointer-events:none;
  width:64px; height:64px; display:flex; align-items:center; justify-content:center;
}
.pt-swirl {
  position:absolute; width:60px; height:60px; border-radius:50%;
  background:conic-gradient(from 0deg, rgba(47,227,196,.55), rgba(255,79,163,.35), rgba(47,227,196,.55));
  filter:blur(2px); animation: pt-swirl-spin 900ms linear infinite;
}
@keyframes pt-swirl-spin { to { rotate:360deg; } }
.pt-toilet-emoji { font-size:48px; position:relative; z-index:1; animation: enter-pop 300ms var(--spring) both; }

/* ---- Dave sight gag ---- */
.pt-dave { position:absolute; top:2px; font-size:24px; z-index:6; pointer-events:none; animation: pt-dave-flap .3s ease-in-out infinite alternate; }
@keyframes pt-dave-flap { from { translate:0 0; } to { translate:0 -4px; } }

/* ---- round-complete overlay card ---- */
.pt-complete-h { font-family:'Fredoka',sans-serif; color:var(--pier-bulb,#ffe9a8); margin:0 0 8px; font-size:19px; }
.pt-complete-score { font-family:'Fredoka',sans-serif; font-weight:700; color:var(--pier-teal,#2fe3c4); font-size:16px; margin-bottom:8px; }
.pt-complete-flushed { font-size:13px; color:rgba(246,235,212,.85); margin-bottom:10px; line-height:1.4; }
.pt-complete-flushed b { color:var(--pier-bulb,#ffe9a8); }
.pt-complete-line { font-size:13.5px; color:rgba(246,235,212,.92); margin:0 0 14px; line-height:1.4; font-weight:600; }
.pt-complete-btns { display:flex; flex-wrap:wrap; gap:10px; justify-content:center; }
.pt-complete-btn { min-height:60px; padding:0 18px; font-size:13.5px; }

@media (prefers-reduced-motion: reduce) {
  .pt-tank-glass::before, .pt-tank-glass::after, .pt-net, .pt-gremlin-card,
  .pt-play-card, .pt-swirl, .pt-dave, .pt-stamp { animation: none !important; }
}
`;

export default {
  id: 'tank',
  title: 'THE GREMLIN TANK',
  blurb: 'Meet your Gas Gremlins, then splat them for good.',

  mount(host, ctx, pier) {
    injectCss('pier-tank', CSS);

    let alive = true;
    const timers = new Set();
    const tweens = new Set();
    const later = (fn, ms) => {
      const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms);
      timers.add(id);
      return id;
    };
    const runTween = (apply, from, to, dur, done) => {
      let cancel;
      cancel = tween(apply, from, to, dur, () => { tweens.delete(cancel); if (alive && done) done(); });
      tweens.add(cancel);
      return cancel;
    };
    const rng = freshRng();

    /* ---------- chassis ---------- */
    const chassis = pier.mountChassis({
      onBack: () => { ctx.audio.sfx('back'); ctx.go('#/pier'); },
      backLabel: '← PIER',
      hudClass: 'pt-hud',
      stageClass: 'pt-body',
      dockClass: 'pt-dock',
    });

    const titleChip = el('div', 'pt-title-chip', '🫧 THE GREMLIN TANK');
    const flushChip = el('div', 'pier-flushed-chip'); // reuses the hub's global chip look
    const progressChip = el('div', 'pt-progress-chip');
    chassis.hud.append(titleChip, flushChip, progressChip);

    function paintFlushChip() {
      const n = pier.facts.flushed();
      flushChip.innerHTML = `🚽 <b>${n}</b> flushed forever`;
    }
    function bumpFlushChip() {
      paintFlushChip();
      flushChip.classList.remove('pt-bump');
      void flushChip.offsetWidth; // restart the pulse even on back-to-back flushes
      flushChip.classList.add('pt-bump');
    }

    /* ---------- on-screen caption-text registry (§2/#6 dedupe) ---------- */
    let releaseOnScreen = null;
    function registerCardLine(entry) {
      if (releaseOnScreen) { releaseOnScreen(); releaseOnScreen = null; }
      if (entry) releaseOnScreen = markOnScreen(entry.text);
    }

    /* ---------- round-scoped state ---------- */
    let numpad = null;
    let roundState = null;
    let currentFact = null;
    let currentQid = 0;
    let questionCounter = 0;
    let qStart = 0;
    let playWrap = null;
    let playCard = null;
    let flavorRow = null;
    let stemEl = null;
    let announcedAquarium = false;

    /* ---------- phase resolution — THE fix (see header) ---------- */
    function currentPhase() {
      const gremlinsNow = pier.facts.gremlins();
      if (gremlinsNow.length > 0) return 'aquarium';
      if (pier.facts.flushed() > 0) return 'clean';
      return 'fresh';
    }

    /* ---------- idle states: fresh / aquarium / clean ---------- */
    function renderIdle() {
      if (numpad) { numpad.destroy(); numpad = null; }
      registerCardLine(null);
      progressChip.style.display = 'none';
      chassis.stage.innerHTML = '';
      chassis.dock.innerHTML = '';
      paintFlushChip();

      const phase = currentPhase();
      if (phase === 'fresh') renderFresh();
      else if (phase === 'clean') renderClean();
      else renderAquarium();
    }

    function renderFresh() {
      titleChip.textContent = '🫧 THE GREMLIN TANK';
      const wrap = el('div', 'pt-empty-wrap');
      wrap.innerHTML = `
        <div class="pt-tank-glass"><div class="pt-net">🎣</div></div>
        <p class="pt-empty-copy"></p>
      `;
      chassis.stage.append(wrap);
      // machine.tank.welcome has 3 entries; only index 2 ("The tank fills
      // itself the more sums you play. Go on.") is true of an EMPTY tank —
      // entries 0/1 both say a gremlin is "in here" (Hard Rule ②: a line may
      // only be shown while the display matches it), so this pick is
      // deliberately fixed, not random, unlike every other pool use below.
      const line = LINES.welcome[2];
      wrap.querySelector('.pt-empty-copy').textContent = line.text;
      registerCardLine(line);
      pier.say(line);

      const dockRow = el('div', 'pt-dock-row');
      const toSplat = el('button', 'btn btn-gold pt-dock-btn', '🔨 SPLAT-A-GREMLIN');
      const practice = el('button', 'btn btn-ghost pt-dock-btn', '🎯 FREE PRACTICE');
      toSplat.addEventListener('click', () => { ctx.audio.sfx('confirm'); ctx.go('#/pier/splat'); });
      practice.addEventListener('click', () => { sfx.ui(); startRound('practice'); });
      dockRow.append(toSplat, practice);
      chassis.dock.append(dockRow);
    }

    function renderClean() {
      titleChip.textContent = '🫧 TANK STATUS';
      const wrap = el('div', 'pt-empty-wrap');
      wrap.innerHTML = `
        <div class="pt-tank-glass"><div class="pt-stamp">SPARKLING CLEAN!</div></div>
        <p class="pt-empty-copy"></p>
      `;
      chassis.stage.append(wrap);
      const line = pick(rng, nana.tankClean);
      wrap.querySelector('.pt-empty-copy').textContent = line.text;
      registerCardLine(line);
      pier.say(line);
      later(() => {
        if (!alive || !wrap.isConnected) return;
        const glass = wrap.querySelector('.pt-tank-glass');
        const r = glass.getBoundingClientRect();
        const stageR = chassis.stage.getBoundingClientRect();
        party(chassis.stage);
        sparkleBurst(chassis.stage, r.left - stageR.left + r.width / 2, r.top - stageR.top + r.height / 2, 14);
        sfx.sparkle();
      }, 150);

      const dockRow = el('div', 'pt-dock-row');
      const practice = el('button', 'btn btn-gold pt-dock-btn', '🎯 FREE PRACTICE');
      const toSplat = el('button', 'btn btn-ghost pt-dock-btn', '🔨 SPLAT-A-GREMLIN');
      practice.addEventListener('click', () => { sfx.ui(); startRound('practice'); });
      toSplat.addEventListener('click', () => { ctx.audio.sfx('confirm'); ctx.go('#/pier/splat'); });
      dockRow.append(practice, toSplat);
      chassis.dock.append(dockRow);
    }

    function buildGremlinCard(g, i) {
      const info = gremlinInfo(g.family, g.name);
      const card = el('div', 'pt-gremlin-card');
      card.style.animationDelay = `${(i * 0.1).toFixed(2)}s, ${(i * 0.15).toFixed(2)}s, ${(i * 0.22).toFixed(2)}s`;
      card.innerHTML = `
        <div class="pt-g-emoji">${emojiForFamily(g.family)}</div>
        <div class="pt-g-name">${info.name}</div>
        <div class="pt-g-oneliner">${info.oneliner}</div>
        <div class="pt-g-fact">${g.name}</div>
        <div class="pt-g-tally">😖 slipped up ×${g.misses}</div>
      `;
      return card;
    }

    function renderAquarium() {
      titleChip.textContent = '🫧 THE GREMLIN TANK';
      const gremlinsNow = pier.facts.gremlins();
      const grid = el('div', 'pt-grid');
      gremlinsNow.forEach((g, i) => grid.append(buildGremlinCard(g, i)));
      chassis.stage.append(grid);

      const dockRow = el('div', 'pt-dock-row');
      const cta = el('button', 'btn btn-gold pt-dock-btn', "SPLAT 'EM! 🔨");
      cta.addEventListener('click', () => { sfx.ui(); startRound('targeted'); });
      dockRow.append(cta);
      chassis.dock.append(dockRow);

      if (!announcedAquarium) {
        announcedAquarium = true;
        const line = pick(rng, [LINES.welcome[0], LINES.welcome[1]]);
        if (line) pier.say(line); // flavour-only — nothing on this card duplicates it, so no registerCardLine needed
      }
    }

    /* ---------- SPLAT 'EM / free-practice round ---------- */
    function paintProgress() {
      progressChip.innerHTML = `🎯 <b>${roundState.index}</b>/${roundState.total}`;
    }

    function renderRoundShell() {
      registerCardLine(null);
      chassis.stage.innerHTML = '';
      chassis.dock.innerHTML = '';
      titleChip.textContent = roundState.kind === 'targeted' ? "SPLAT 'EM!" : 'FREE PRACTICE';
      progressChip.style.display = 'flex'; // .pt-progress-chip's stylesheet default is display:none (hidden outside a round) — an empty string here would just fall back to that CSS default and never show it
      paintProgress();

      playWrap = el('div', 'pt-play-wrap');
      playCard = el('div', 'pt-play-card');
      flavorRow = el('div', 'pt-flavor-row');
      stemEl = el('div', 'pt-stem-text');
      playCard.append(flavorRow, stemEl);
      playWrap.append(playCard);
      chassis.stage.append(playWrap);

      numpad = makeNumpad(chassis.dock, { onSubmit: handleSubmit });
    }

    function paintQuestion(fact) {
      // Hard Rule ②: only decorate with gremlin flavour while that's an
      // honest description of what's on screen. A TARGETED round is, by its
      // whole premise, drawing from families that WERE gremlins at the
      // moment the round started (drawFrom uses the fixed family list
      // captured in startRound) — so flavour is shown for every question in
      // a targeted round, even one drawn just after ITS OWN flush cleared
      // isGremlin live. A PRACTICE round draws from the full mixed pool, so
      // flavour only shows when the drawn fact is a gremlin RIGHT NOW.
      const showFlavor = roundState.kind === 'targeted' || pier.facts.isGremlin(fact.family);
      if (showFlavor) {
        const info = gremlinInfo(fact.family);
        flavorRow.style.display = '';
        flavorRow.innerHTML = `<span class="pt-flavor-emoji">${emojiForFamily(fact.family)}</span><span class="pt-flavor-name">${info.name}</span>`;
      } else {
        flavorRow.style.display = 'none';
        flavorRow.innerHTML = '';
      }
      stemEl.textContent = fact.stem;
      stemEl.classList.remove('pt-flash-correct', 'pt-flash-wrong');
      numpad.clear();
      numpad.setEnabled(true);
    }

    function nextQuestion() {
      if (!alive || !roundState) return;
      if (roundState.index >= roundState.total) { finishRound(); return; }
      const fact = roundState.kind === 'targeted'
        ? pier.facts.drawFrom(rng, roundState.families)
        : pier.facts.draw(rng, { deluxe: pier.deluxe });
      if (!fact) { finishRound(); return; }
      currentFact = fact;
      currentQid = (questionCounter += 1);
      qStart = performance.now();
      paintQuestion(fact);

      // Dave's sight gag — once per round, a beat after the round settles in.
      if (!roundState.daveDone && roundState.index >= 3) {
        roundState.daveDone = true;
        later(() => { if (alive && roundState) daveSwoop(); }, 350);
      }
    }

    function advanceAfter(qid) {
      if (!alive || !roundState || qid !== currentQid) return;
      nextQuestion();
    }

    function showFeedback(kind, text) {
      const banner = el('div', `pt-feedback-banner pt-fb-${kind}`, text);
      playWrap.append(banner);
      later(() => banner.remove(), kind === 'wrong' ? 2000 : kind === 'flush' ? 2500 : 950);
    }

    function flashComboBadge(n) {
      const badge = el('div', 'pt-combo-badge', `🔥 COMBO ×${n}`);
      playWrap.append(badge);
      later(() => badge.remove(), 950);
    }

    function maybeCombo() {
      if (roundState.streak >= 3 && roundState.streak % 3 === 0 && roundState.streak !== roundState.comboFired) {
        roundState.comboFired = roundState.streak;
        flashComboBadge(roundState.streak);
        sfx.sparkle();
        const line = pick(rng, LINES.combo);
        if (line) pier.say(line);
      }
    }

    function daveSwoop() {
      const stageR = chassis.stage.getBoundingClientRect();
      const dave = el('div', 'pt-dave', '🐦');
      const startX = -40;
      const endX = Math.max(60, stageR.width - 24);
      dave.style.left = startX + 'px';
      chassis.stage.append(dave);
      runTween((x) => { dave.style.left = x + 'px'; }, startX, endX, 700, () => {
        later(() => dave.remove(), 100);
      });
      const line = pick(rng, LINES.daveTheft);
      if (line) pier.say(line);
    }

    function playCorrectFeedback(qid) {
      stemEl.classList.add('pt-flash-correct');
      showFeedback('correct', 'SPLAT! 💥 +1');
      const r = playCard.getBoundingClientRect();
      const stageR = chassis.stage.getBoundingClientRect();
      sparkleBurst(chassis.stage, r.left - stageR.left + r.width / 2, r.top - stageR.top + r.height / 2, 7);
      sfx.pop();
      later(() => advanceAfter(qid), 900);
    }

    function playWrongFeedback(fact, qid) {
      stemEl.classList.add('pt-flash-wrong');
      playCard.classList.add('pt-wiggle');
      later(() => { if (playCard) playCard.classList.remove('pt-wiggle'); }, 450);
      showFeedback('wrong', `So close, pet! <b>${workedFactText(fact.family)}</b>`);
      sfx.nudge();
      const line = pick(rng, LINES.nearMiss);
      if (line) pier.say(line);
      later(() => advanceAfter(qid), 2000);
    }

    function playFlushCeremony(fact, qid) {
      showFeedback('flush', 'FLUSHED FOR GOOD! 🚽');
      const toilet = el('div', 'pt-toilet', '<div class="pt-swirl"></div><div class="pt-toilet-emoji">🚽</div>');
      playWrap.append(toilet);
      playCard.classList.add('pt-flushing');
      sfx.whoosh();
      bumpFlushChip();
      later(() => {
        if (!alive) return;
        sfx.drop();
        sfx.sparkle();
        if (toilet.isConnected) {
          const r = toilet.getBoundingClientRect();
          const stageR = chassis.stage.getBoundingClientRect();
          sparkleBurst(chassis.stage, r.left - stageR.left + r.width / 2, r.top - stageR.top + r.height / 2, 12);
        }
        const line = pick(rng, LINES.gremlinFlush);
        if (line) pier.say(line);
      }, 600);
      later(() => { toilet.remove(); advanceAfter(qid); }, 2500);
    }

    function handleSubmit(str) {
      if (!alive || !roundState || !currentFact) return;
      const qid = currentQid;
      const fact = currentFact;
      const val = parseInt(str, 10);
      const correct = val === fact.answer;
      const ms = Math.round(performance.now() - qStart);
      numpad.setEnabled(false);

      const result = pier.facts.record(fact.family, { correct, ms, mode: 'tank' });
      roundState.index += 1;
      if (correct) { roundState.correctCount += 1; roundState.streak += 1; } else { roundState.wrongCount += 1; roundState.streak = 0; }
      paintProgress();

      if (result.justFlushed) {
        const info = gremlinInfo(fact.family);
        roundState.flushed.push(info.name);
        playFlushCeremony(fact, qid);
      } else if (correct) {
        playCorrectFeedback(qid);
        maybeCombo();
      } else {
        playWrongFeedback(fact, qid);
      }
    }

    function startRound(kind) {
      const gremlinsNow = pier.facts.gremlins();
      const families = kind === 'targeted' ? gremlinsNow.map((g) => g.family) : null;
      const resolvedKind = (kind === 'targeted' && (!families || families.length === 0)) ? 'practice' : kind;
      const total = resolvedKind === 'targeted' ? Math.min(12, families.length * 2) : PRACTICE_LEN;

      roundState = {
        kind: resolvedKind, families, total, index: 0, correctCount: 0, wrongCount: 0, streak: 0, comboFired: 0, flushed: [], daveDone: false,
      };
      renderRoundShell();
      const startLine = pick(rng, announcer.roundStart);
      if (startLine) pier.say(startLine);
      nextQuestion();
    }

    function finishRound() {
      const summary = {
        kind: roundState.kind,
        correct: roundState.correctCount,
        total: roundState.total,
        flushed: roundState.flushed.slice(),
        flawless: roundState.wrongCount === 0 && roundState.correctCount > 0,
      };
      if (numpad) { numpad.destroy(); numpad = null; }
      roundState = null;
      renderIdle(); // rebuild the correct base state (fresh/aquarium/clean) FIRST — the overlay then sits on top of it
      showRoundComplete(summary);
    }

    function showRoundComplete(summary) {
      const card = el('div', 'pt-complete');
      let headlineLine = null;
      if (summary.flawless) headlineLine = pick(rng, LINES.goldBeaten);
      else if (summary.flushed.length) headlineLine = pick(rng, LINES.newPB);

      const flushedHtml = summary.flushed.length
        ? `<div class="pt-complete-flushed">🚽 Flushed for good: <b>${summary.flushed.join(', ')}</b></div>` : '';
      const lineHtml = headlineLine
        ? `<p class="pt-complete-line">${headlineLine.text}</p>`
        : `<p class="pt-complete-line">${summary.correct} out of ${summary.total} — nice work, pet!</p>`;
      card.innerHTML = `
        <h3 class="pt-complete-h">${summary.kind === 'targeted' ? "SPLAT 'EM — DONE!" : 'PRACTICE COMPLETE!'}</h3>
        <div class="pt-complete-score">${summary.correct}/${summary.total} correct</div>
        ${flushedHtml}
        ${lineHtml}
      `;
      const btnRow = el('div', 'pt-complete-btns');
      const nowGremlins = pier.facts.gremlins();
      const againBtn = el('button', 'btn btn-gold pt-complete-btn', nowGremlins.length ? "SPLAT 'EM AGAIN 🔨" : 'FREE PRACTICE 🎯');
      const backBtn = el('button', 'btn btn-ghost pt-complete-btn', 'BACK TO TANK 🫧');
      btnRow.append(againBtn, backBtn);
      card.append(btnRow);

      const ov = chassis.overlay(card, { cardClass: 'pt-complete-card', speaks: headlineLine || undefined });
      if (headlineLine) pier.say(headlineLine);
      if (summary.correct > 0) sfx.win();
      // Celebrate on the VEIL, not the stage — the veil is z-index:200 above
      // .pier-screen's pinned-transform stacking context; stage-level confetti
      // would render invisibly UNDER it (see header block for the full why).
      if (summary.flawless || summary.flushed.length) party(ov.el);

      againBtn.addEventListener('click', () => {
        sfx.ui();
        ov.close();
        startRound(nowGremlins.length ? 'targeted' : 'practice');
      });
      backBtn.addEventListener('click', () => {
        sfx.ui();
        ov.close();
      });
    }

    /* ---------- go ---------- */
    renderIdle();

    return function cleanup() {
      alive = false;
      timers.forEach((id) => clearTimeout(id));
      timers.clear();
      tweens.forEach((cancel) => cancel());
      tweens.clear();
      if (numpad) { numpad.destroy(); numpad = null; }
      if (releaseOnScreen) { releaseOnScreen(); releaseOnScreen = null; }
      // host/hud/stage/dock/overlayHost DOM is torn down by js/router.js's
      // `currentRoot.innerHTML = ''` on the NEXT mount (see js/router.js) —
      // nothing else to detach here.
    };
  },
};
