// FART QUEST — js/pier/modes/splat.js (SPLAT agent)
// SPLAT-A-GREMLIN: a 60-second whack-a-mole blitz. Five holes, a gremlin
// popping out of each holding a number card (one correct answer + plausible
// distractors from facts.distractors, positions shuffled with rng shuffle —
// see docs/PIER_SPEC.md §6 "splat"). Tap the right card = SPLAT, score +1,
// next question. Tap a wrong one = the gremlin blows a raspberry and the
// CORRECT card flashes green for as long as (and only as long as) that exact
// board stays on screen (Hard Rule ②) before the next question replaces it.
// A 3+ streak lights up a MEGA SPLAT combo flash; there's no OS pointer on an
// iPad, so "the mallet cursor grows" is realised as a mallet-strike graphic
// at the hit hole that scales up with the streak (see final report).
//
// The 60s countdown is driven entirely by kit `tween()` (Hard Rule ④, and the
// brief's explicit "no bare rAF" for the clock) — never a bare rAF loop and
// never a raw setInterval. tween()'s own cubic easing is meant for springy UI
// motion, not a literal second-by-second clock, so the tween's `apply`
// callback here ignores the eased value it's handed and instead recomputes
// the TRUE linear remaining time from a captured start timestamp each frame.
// That keeps the visible seconds ticking down evenly and correctly, while
// still riding on tween()'s rAF+timeout-guard scaffolding — which is exactly
// what makes the round survive a hidden tab: the guard `setTimeout(finish,
// dur+250)` fires `onTimeUp` at the correct wall-clock moment even if rAF
// never once ran while the tab was hidden.
import {
  el, sfx, tween, toast, sparkleBurst, party, injectCss,
} from '../../anims/_kit.js';
import { mulberry32, pick, shuffle } from '../../rng.js';

const ROUND_MS = 60000;
const HOLE_COUNT = 5;
const COMBO_THRESHOLD = 3;
const TICK_WINDOW_SEC = 10;
const CORRECT_PAUSE_MS = 420; // long enough to see the squash+float, short enough to read as "immediately"
const WRONG_PAUSE_MS = 950;   // the correct card must be visible and readable before the board changes
const DAVE_MS = 1450;
const COUNTDOWN_STEP_MS = 560;

/* ---------- caption line picking (own throwaway rng — kept separate from
   the gameplay rng so cosmetic line variety never perturbs fact draws) ---------- */
function freshRng() {
  return mulberry32((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
}
function pickLine(pool) {
  if (!Array.isArray(pool) || pool.length === 0) return null;
  return pick(freshRng(), pool);
}

const CSS = `
.splat-back { position:absolute; top:calc(16px + var(--safe-t,0px)); left:calc(16px + var(--safe-l,0px)); min-height:60px; padding:0 20px; font-size:15px; z-index:50; }

.splat-stage {
  position:relative; min-height:100%; overflow:hidden; touch-action:manipulation;
  display:flex; flex-direction:column; align-items:center;
  padding:calc(78px + var(--safe-t,0px)) calc(16px + var(--safe-r,0px)) calc(28px + var(--safe-b,0px)) calc(16px + var(--safe-l,0px));
}

/* ---------- HUD ---------- */
.splat-topbar { width:100%; max-width:720px; display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:18px; }
.splat-chip {
  background: rgba(10,18,48,.7); border:2px solid rgba(255,255,255,.16); border-radius:999px;
  padding:8px 16px; font-family:'Fredoka',sans-serif; font-weight:700; font-size:14px;
  color:var(--parchment); box-shadow:0 4px 0 rgba(0,0,0,.3);
}
.splat-chip b { color: var(--pier-bulb, #ffe9a8); font-size:18px; margin-left:4px; }
.splat-chip.pop { animation: splatChipPop .32s var(--spring) both; }
@keyframes splatChipPop { 0% { transform:scale(1); } 45% { transform:scale(1.2); } 100% { transform:scale(1); } }
.splat-streak-chip { background: linear-gradient(160deg, rgba(255,79,163,.28), rgba(255,79,163,.12)); border-color: rgba(255,79,163,.5); }
.splat-streak-chip[hidden] { display:none; }

.splat-ring {
  --pct: 100; position:relative; width:60px; height:60px; border-radius:50%; flex:0 0 auto;
  background: conic-gradient(var(--pier-teal, #2fe3c4) calc(var(--pct) * 1%), rgba(255,255,255,.14) 0);
  display:flex; align-items:center; justify-content:center; box-shadow:0 4px 0 rgba(0,0,0,.3);
}
.splat-ring::before { content:''; position:absolute; inset:6px; border-radius:50%; background:#0a1230; }
.splat-ring-num { position:relative; z-index:1; font-family:'Fredoka',sans-serif; font-weight:700; font-size:19px; color:var(--parchment); }
.splat-ring.urgent { animation: splatUrgentPulse .5s ease-in-out infinite; }
.splat-ring.urgent .splat-ring-num { color: var(--wrong); }
@keyframes splatUrgentPulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.12); } }

/* ---------- question ---------- */
.splat-question {
  font-size:clamp(24px,4.6vw,38px); font-weight:700; color:var(--parchment);
  text-align:center; margin-bottom:24px; text-shadow:0 3px 0 rgba(0,0,0,.35); min-height:1.2em;
}

/* ---------- holes ---------- */
.splat-holes { display:flex; flex-wrap:wrap; justify-content:center; align-items:flex-end; gap:18px; width:100%; max-width:760px; transition:opacity .35s ease; }
.splat-holes.splat-fade-out { opacity:0; pointer-events:none; }

.splat-hole {
  position:relative; width:112px; height:130px; border:none; background:transparent; cursor:pointer;
  padding:0; display:flex; flex-direction:column; align-items:center; justify-content:flex-end;
  -webkit-tap-highlight-color:transparent; touch-action:manipulation;
}
.splat-mound {
  position:absolute; bottom:0; left:50%; transform:translateX(-50%);
  width:112px; height:34px; border-radius:50%;
  background: radial-gradient(ellipse at 50% 30%, #3a2a10, #1c1408 75%);
  box-shadow: 0 6px 0 rgba(0,0,0,.35);
}
.splat-gremlin {
  position:relative; z-index:2; font-size:40px; margin-bottom:-6px; display:block;
  filter:drop-shadow(0 4px 6px rgba(0,0,0,.4));
  animation: splatBob 1.8s ease-in-out infinite;
}
.splat-hole:nth-child(2n) .splat-gremlin { animation-delay: .3s; }
.splat-hole:nth-child(3n) .splat-gremlin { animation-delay: .6s; }
@keyframes splatBob { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-5px); } }
.splat-card {
  position:relative; z-index:3; margin-top:2px; display:block;
  background: linear-gradient(160deg,#fff3ce,#f4c542); color:var(--ink);
  font-family:'Fredoka',sans-serif; font-weight:700; font-size:22px;
  min-width:56px; padding:6px 10px; border-radius:12px; text-align:center;
  box-shadow: 0 4px 0 var(--gold-deep,#d9a21b); border:2px solid rgba(255,255,255,.5);
}

.splat-hole.splat-hit .splat-gremlin { animation: splatSquash .4s cubic-bezier(.22,1.2,.36,1) both; }
@keyframes splatSquash {
  0% { transform: scale(1); }
  35% { transform: scale(1.25,.7) translateY(6px); }
  70% { transform: scale(.9,1.12) translateY(-3px); }
  100% { transform: scale(1); }
}
.splat-hole.splat-hit .splat-card { animation: splatCardPop .4s var(--spring) both; }
@keyframes splatCardPop { 0% { transform:scale(1); } 40% { transform:scale(1.3) rotate(-6deg); } 100% { transform:scale(1) rotate(0); } }

.splat-hole.splat-miss .splat-gremlin { animation: splatWobble .45s ease both; }
@keyframes splatWobble {
  0%,100% { transform: rotate(0); }
  25% { transform: rotate(-12deg); }
  50% { transform: rotate(10deg); }
  75% { transform: rotate(-6deg); }
}

.splat-hole.splat-flash-correct .splat-card { animation: splatFlashGreen .9s ease-in-out both; }
@keyframes splatFlashGreen {
  0%, 100% { box-shadow: 0 4px 0 var(--gold-deep,#d9a21b); background:linear-gradient(160deg,#fff3ce,#f4c542); }
  15%, 85% { box-shadow: 0 0 0 4px var(--correct), 0 4px 0 var(--gold-deep,#d9a21b); background: linear-gradient(160deg,#eafff2,#8ce6ae); }
}

/* ---------- floating feedback ---------- */
.splat-float {
  position:absolute; top:-4px; left:50%; transform:translateX(-50%);
  font-family:'Fredoka',sans-serif; font-weight:700; font-size:15px; color:var(--pier-bulb,#ffe9a8);
  text-shadow:0 2px 4px rgba(0,0,0,.5); pointer-events:none; z-index:6; white-space:nowrap;
  animation: splatFloatUp .48s ease-out both;
}
@keyframes splatFloatUp {
  0% { opacity:0; transform:translate(-50%,0) scale(.7); }
  30% { opacity:1; transform:translate(-50%,-12px) scale(1.1); }
  100% { opacity:0; transform:translate(-50%,-38px) scale(1); }
}
.splat-mallet {
  position:absolute; top:-30px; left:50%; z-index:7; pointer-events:none; font-size:34px;
  transform-origin:70% 90%; animation: splatMalletHit .38s ease-out both;
}
@keyframes splatMalletHit {
  0% { transform: translate(-50%,-24px) scale(var(--mscale,1)) rotate(-55deg); opacity:0; }
  55% { opacity:1; transform: translate(-50%,4px) scale(var(--mscale,1)) rotate(8deg); }
  100% { opacity:0; transform: translate(-50%,10px) scale(var(--mscale,1)) rotate(-8deg); }
}

/* ---------- combo flash ---------- */
.splat-combo {
  position:absolute; top:36%; left:50%; transform:translate(-50%,-50%) scale(.6);
  font-family:'Fredoka',sans-serif; font-weight:700; font-size:clamp(28px,6vw,46px);
  color:var(--pier-pink,#ff4fa3); text-shadow:0 0 16px rgba(255,79,163,.7), 0 4px 0 rgba(0,0,0,.4);
  pointer-events:none; z-index:15; opacity:0; letter-spacing:.02em; white-space:nowrap;
}
.splat-combo.show { animation: splatComboFlash .75s var(--spring) both; }
@keyframes splatComboFlash {
  0% { opacity:0; transform:translate(-50%,-50%) scale(.4) rotate(-6deg); }
  30% { opacity:1; transform:translate(-50%,-50%) scale(1.15) rotate(3deg); }
  60% { transform:translate(-50%,-50%) scale(1) rotate(0deg); }
  100% { opacity:0; transform:translate(-50%,-58%) scale(1.05) rotate(0deg); }
}

/* ---------- pre-round countdown ---------- */
.splat-countdown {
  position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
  font-family:'Fredoka',sans-serif; font-weight:700; font-size:88px; color:var(--pier-bulb,#ffe9a8);
  text-shadow:0 0 20px rgba(255,233,168,.6), 0 5px 0 rgba(0,0,0,.4); z-index:25; pointer-events:none;
}
.splat-countdown.pop { animation: splatCdPop .5s var(--spring) both; }
@keyframes splatCdPop {
  0% { transform:translate(-50%,-50%) scale(.4); opacity:0; }
  60% { transform:translate(-50%,-50%) scale(1.15); opacity:1; }
  100% { transform:translate(-50%,-50%) scale(1); opacity:1; }
}

/* ---------- Dave steals the mallet ---------- */
.splat-dave {
  position:absolute; top:22%; left:-15%; font-size:46px; z-index:20; pointer-events:none;
  filter:drop-shadow(0 6px 10px rgba(0,0,0,.4));
  animation: splatDaveSwoop 1.3s cubic-bezier(.4,.1,.3,1) both;
}
@keyframes splatDaveSwoop {
  0% { left:-15%; transform:translateY(0) rotate(-8deg); }
  50% { transform:translateY(-40px) rotate(6deg); }
  100% { left:115%; transform:translateY(10px) rotate(-4deg); }
}

/* ---------- welcome / end-screen veil ---------- */
.splat-veil {
  position:absolute; inset:0; z-index:30; display:none; align-items:center; justify-content:center;
  padding:20px calc(20px + var(--safe-r,0px)) 20px calc(20px + var(--safe-l,0px));
  background: rgba(4,8,20,.72); backdrop-filter: blur(2px);
}
.splat-veil.show { display:flex; }
.splat-card-panel {
  background: linear-gradient(160deg, #131c3e, #0c1330);
  border:3px solid rgba(255,79,163,.35); border-radius:var(--r-lg);
  box-shadow: 0 10px 0 rgba(0,0,0,.35), 0 20px 40px rgba(0,0,0,.5);
  padding:30px 28px; max-width:440px; width:100%; text-align:center;
  animation: splatCardIn .38s var(--spring) both;
}
@keyframes splatCardIn { from { opacity:0; transform:scale(.88) translateY(18px); } to { opacity:1; transform:scale(1) translateY(0); } }
.splat-title-emoji { font-size:52px; margin-bottom:6px; filter:drop-shadow(0 4px 8px rgba(0,0,0,.4)); }
.splat-title { font-family:'Fredoka',sans-serif; font-weight:700; font-size:24px; color:var(--pier-bulb,#ffe9a8); margin:0 0 10px; letter-spacing:.02em; }
.splat-line {
  font-size:14.5px; line-height:1.4; font-weight:500; color:rgba(246,235,212,.85);
  background:rgba(255,255,255,.06); border-radius:12px; padding:10px 12px; margin-bottom:12px;
}
.splat-blurb { font-size:14px; line-height:1.4; color:rgba(246,235,212,.75); margin:0 0 18px; }
.splat-start-btn, .splat-again-btn { min-height:60px; padding:0 34px; font-size:18px; }
.splat-newrecord {
  font-family:'Fredoka',sans-serif; font-weight:700; font-size:16px; color:var(--gold,#f4c542);
  margin-bottom:8px; animation: splatNewRecordGlow 1.1s ease-in-out infinite;
}
@keyframes splatNewRecordGlow { 0%,100% { text-shadow:0 0 6px rgba(244,197,66,.4); } 50% { text-shadow:0 0 18px rgba(244,197,66,.9); } }
.splat-end-score { font-family:'Fredoka',sans-serif; font-weight:700; font-size:52px; color:var(--parchment); margin-bottom:6px; }
.splat-end-score span { font-size:18px; font-weight:500; color:rgba(246,235,212,.7); margin-left:6px; }
.splat-tier-row { justify-content:center; margin-bottom:14px; }

@media (max-width: 680px) {
  .splat-hole { width:88px; height:108px; }
  .splat-mound { width:88px; height:28px; }
  .splat-gremlin { font-size:32px; }
  .splat-card { font-size:18px; min-width:46px; padding:5px 8px; }
  .splat-holes { gap:12px; }
}
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

    const timers = new Set();
    const later = (fn, ms) => {
      const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms);
      timers.add(id);
      return id;
    };
    const clearAllTimers = () => { timers.forEach((id) => clearTimeout(id)); timers.clear(); };

    /* ---------- chrome ---------- */
    const back = el('button', 'btn btn-ghost splat-back', '← PIER');
    const stage = el('div', 'splat-stage');

    const topbar = el('div', 'splat-topbar');
    const scoreChip = el('div', 'splat-chip splat-score-chip', 'SCORE <b>0</b>');
    const ring = el('div', 'splat-ring');
    ring.style.setProperty('--pct', '100');
    const ringNum = el('span', 'splat-ring-num', '60');
    ring.append(ringNum);
    const streakChip = el('div', 'splat-chip splat-streak-chip', '🔥 <b>0</b>');
    streakChip.hidden = true;
    topbar.append(scoreChip, ring, streakChip);

    const questionEl = el('div', 'splat-question', '');
    const holesWrap = el('div', 'splat-holes');
    const comboEl = el('div', 'splat-combo');
    const veil = el('div', 'splat-veil');

    stage.append(topbar, questionEl, holesWrap, comboEl, veil);
    host.append(back, stage);

    back.addEventListener('click', () => {
      ctx.audio.sfx('back');
      ctx.go('#/pier');
    });

    const scoreNum = scoreChip.querySelector('b');
    const streakNum = streakChip.querySelector('b');

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
    function updateStreakHud() {
      if (streak >= 2) {
        streakChip.hidden = false;
        streakNum.textContent = String(streak);
        bump(streakChip);
      } else {
        streakChip.hidden = true;
      }
    }
    function hideVeil() { veil.classList.remove('show'); veil.innerHTML = ''; }

    function tierChipsHtml(bestVal, goldSeen) {
      const tiers = pier.facts.nanaTiers('splat') || { bronze: 12, silver: 20, gold: 30 };
      const icons = { bronze: '🥉', silver: '🥈', gold: '🥇' };
      const chips = ['bronze', 'silver', 'gold'].map((t) => {
        const achieved = bestVal != null && bestVal >= tiers[t];
        return `<span class="pier-tier-chip${achieved ? ' achieved' : ''}" title="${t}">${icons[t]}</span>`;
      }).join('');
      const trophy = goldSeen ? '<span class="pier-trophy" title="Gold beaten!">🏆</span>' : '';
      return chips + trophy;
    }

    /* ---------- in-hole flourishes ---------- */
    function spawnFloat(hole, text) {
      const f = el('span', 'splat-float', text);
      hole.append(f);
      later(() => f.remove(), 520);
    }
    function spawnMallet(hole, currentStreak) {
      const scale = Math.min(1.9, 1 + currentStreak * 0.12);
      const m = el('span', 'splat-mallet', '🔨');
      m.style.setProperty('--mscale', scale.toFixed(2));
      hole.append(m);
      later(() => m.remove(), 420);
    }
    function comboFlash() {
      comboEl.textContent = 'MEGA SPLAT! 🔥';
      comboEl.classList.remove('show');
      void comboEl.offsetWidth;
      comboEl.classList.add('show');
    }
    function celebrateFlush(name) {
      const line = pickLine(pier.content.gremlin.flushed);
      if (line) pier.say(line);
      toast(stage, `${name} FLUSHED! 🚽💨`);
      sparkleBurst(stage, stage.clientWidth / 2, stage.clientHeight / 2, 12);
    }

    /* ---------- question lifecycle ---------- */
    function renderHoles(values, answer) {
      holesWrap.classList.remove('splat-fade-out');
      holesWrap.innerHTML = '';
      holeEls = [];
      values.forEach((val) => {
        const hole = el('button', 'splat-hole');
        hole.type = 'button';
        hole.dataset.val = String(val);
        hole.innerHTML = '<span class="splat-mound"></span>'
          + '<span class="splat-gremlin">👺</span>'
          + `<span class="splat-card">${val}</span>`;
        hole.addEventListener('click', () => onTapHole(hole, val, answer));
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

    function onTapHole(holeEl, val, answer) {
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
        updateScoreHud();
        updateStreakHud();
        sfx.pop();
        holeEl.classList.add('splat-hit');
        spawnFloat(holeEl, streak >= COMBO_THRESHOLD ? 'MEGA SPLAT!' : 'SPLAT! +1');
        spawnMallet(holeEl, streak);
        if (streak >= COMBO_THRESHOLD) { comboFlash(); sfx.sparkle(); }
        if (rec.justFlushed) celebrateFlush(rec.name);
        later(() => { if (!roundOver) nextQuestion(); }, CORRECT_PAUSE_MS);
      } else {
        streak = 0;
        updateStreakHud();
        ctx.audio.sfx('wrong');
        holeEl.classList.add('splat-miss');
        spawnFloat(holeEl, 'PBBBT!');
        const correctHole = holeEls.find((h) => Number(h.dataset.val) === answer);
        if (correctHole) correctHole.classList.add('splat-flash-correct');
        const line = pickLine(pier.content.gremlin.taunt);
        if (line) pier.say(line);
        later(() => { if (!roundOver) nextQuestion(); }, WRONG_PAUSE_MS);
      }
    }

    /* ---------- round clock ---------- */
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
      // NB: the (from,to) pair passed to tween() here is a dummy 0->1 — its
      // eased value is never read. `apply` recomputes the real elapsed time
      // itself every frame so the displayed clock is linear/accurate; tween()
      // is used purely for its rAF-cadence + tab-hide-safe completion guard
      // (Hard Rule ④ — no bare rAF loop drives this countdown).
      mainTweenCancel = tween(() => {
        const remaining = Math.max(0, ROUND_MS - (performance.now() - t0));
        paintRing(remaining);
      }, 0, 1, ROUND_MS, () => { mainTweenCancel = null; onTimeUp(); });
    }

    function onTimeUp() {
      if (!alive) return;
      roundOver = true;
      acceptingTaps = false;
      holesWrap.classList.add('splat-fade-out');
      const line = pickLine(pier.content.dave.steal);
      if (line) pier.say(line);
      const dave = el('div', 'splat-dave', '🐦🔨');
      stage.append(dave);
      later(() => dave.remove(), DAVE_MS + 150);
      later(() => { if (alive) showEndScreen(score); }, DAVE_MS);
    }

    /* ---------- pre-round "GET READY" beat ---------- */
    function runCountdown(cb) {
      hideVeil();
      const cd = el('div', 'splat-countdown');
      stage.append(cd);
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
      updateScoreHud(); updateStreakHud();
      const line = pickLine(pier.content.announcer.roundStart);
      if (line) pier.say(line);
      nextQuestion();
      startRoundTimer();
    }

    /* ---------- welcome + end screens ---------- */
    function showWelcome() {
      veil.innerHTML = '';
      const card = el('div', 'splat-card-panel');
      const line = pickLine(pier.content.nana.welcome);
      card.innerHTML = '<div class="splat-title-emoji">🔨</div>'
        + '<h2 class="splat-title">SPLAT-A-GREMLIN</h2>'
        + (line ? `<div class="splat-line">${line.text}</div>` : '')
        + '<p class="splat-blurb">Tap the right number before the gremlin scarpers! Sixty seconds, five holes, as many splats as you can land.</p>'
        + '<button type="button" class="btn btn-gold splat-start-btn">START 🔨</button>';
      veil.append(card);
      veil.classList.add('show');
      if (line) pier.say(line);
      card.querySelector('.splat-start-btn').addEventListener('click', (ev) => {
        ev.currentTarget.disabled = true;
        sfx.ui();
        runCountdown(startRound);
      });
    }

    async function showEndScreen(finalScore) {
      if (!alive) return;
      questionEl.textContent = '';
      holesWrap.innerHTML = '';

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
      if (goldJustBeaten) lineEntry = pickLine(pier.content.nana.goldBeaten);
      else if (isNewRecord) lineEntry = pickLine(pier.content.announcer.highScore);
      else lineEntry = pickLine(pier.content.nana.win);
      if (lineEntry) pier.say(lineEntry);
      if (isNewRecord || goldJustBeaten) { sfx.win(); party(stage); }

      veil.innerHTML = '';
      const card = el('div', 'splat-card-panel');
      card.innerHTML = '<div class="splat-title-emoji">🔨</div>'
        + '<h2 class="splat-title">TIME\'S UP!</h2>'
        + (isNewRecord ? '<div class="splat-newrecord">🏆 NEW RECORD! 🏆</div>' : '')
        + `<div class="splat-end-score">${finalScore}<span> splat${finalScore === 1 ? '' : 's'}</span></div>`
        + `<div class="pier-tier-row splat-tier-row">${tierChipsHtml(bestValAfter, goldSeenAfter)}</div>`
        + (lineEntry ? `<div class="splat-line">${lineEntry.text}</div>` : '')
        + '<button type="button" class="btn btn-gold splat-again-btn">ONE MORE GO 🔨</button>';
      veil.append(card);
      veil.classList.add('show');
      card.querySelector('.splat-again-btn').addEventListener('click', (ev) => {
        ev.currentTarget.disabled = true;
        sfx.ui();
        hideVeil();
        runCountdown(startRound);
      });
    }

    showWelcome();

    return function cleanup() {
      alive = false;
      clearAllTimers();
      if (mainTweenCancel) { mainTweenCancel(); mainTweenCancel = null; }
      back.remove();
      stage.remove();
    };
  },
};
