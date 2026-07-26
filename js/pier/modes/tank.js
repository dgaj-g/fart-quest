// FART QUEST — js/pier/modes/tank.js (TANK agent)
// THE GREMLIN TANK — an aquarium view of every current Gas Gremlin (a weak
// times-table fact family), plus a short targeted "SPLAT 'EM" numpad round
// that flushes them for good. See docs/PIER_SPEC.md §6 "tank" (binding).
//
// Two deliberate deviations from the generic §6 preamble, reasoned here so
// reviewers don't have to hunt for them (also repeated in the build report):
//
//  1. NO PB / NO TIERS. §7 states plainly "teacups/tank: no tiers", and the
//     hub's own MACHINE_META entry for 'tank' (js/screens/pier.js) carries no
//     `metric`/`fmt` — nothing on the hub card would ever read a stored
//     pierBests.tank. So this file never calls facts.getBests()/putBest():
//     there is no benchmark for a weak-facts browser to beat.
//
//  2. Gremlin flavour (name + oneliner per family) comes from content.js's
//     GREMLIN_NAMES map — but the hub's `pier.content` kit (see
//     js/screens/pier.js -> ensureContent()) only forwards nana/announcer/
//     dave/gremlin, not GREMLIN_NAMES. Rather than edit pier.js (HUB-owned),
//     this file imports content.js directly (read-only sibling import, not
//     an edit) and uses it as the single source for ALL caption content,
//     including GREMLIN_NAMES. `pier.facts` and `pier.say` are still used via
//     the hub-provided kit, per §4 ("everything through pier.facts").

import {
  el, sfx, sparkleBurst, party, injectCss,
} from '../../anims/_kit.js';
import { makeNumpad } from '../padkit.js';
import { mulberry32, pick } from '../../rng.js';
import { nana, announcer, gremlin, GREMLIN_NAMES } from '../content.js';

/* ---------- tiny pure helpers ---------- */

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
// "6 × 7 = 42, so 42 ÷ 7 = 6" — the exact fact-family-flash phrasing PIER_SPEC
// §6 uses for gunge's wrong/slow reveal; reused here for tank's wrong answers
// so the whole pier teaches the family the same way.
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
.pt-root { min-height:100%; position:relative; }
.pt-back { position:absolute; top:calc(16px + var(--safe-t,0px)); left:calc(16px + var(--safe-l,0px)); min-height:60px; padding:0 20px; font-size:16px; z-index:50; }
.pt-stage { min-height:100%; padding:calc(84px + var(--safe-t)) 20px calc(28px + var(--safe-b)); display:flex; flex-direction:column; align-items:center; gap:16px; max-width:920px; margin:0 auto; }

/* ---- welcome overlay ---- */
.pt-overlay {
  position:fixed; inset:0; z-index:30; display:flex; align-items:center; justify-content:center; padding:24px;
  background:
    radial-gradient(120% 80% at 50% 10%, rgba(255,79,163,.18), transparent 60%),
    rgba(5,9,20,.86);
}
.pt-ov-card {
  background:linear-gradient(160deg,#131c3e,#0a1230); border:3px solid rgba(255,233,168,.35);
  border-radius:var(--r-lg); box-shadow:var(--shadow-card); padding:34px 28px; max-width:440px; text-align:center;
}
.pt-ov-emoji { font-size:56px; margin-bottom:8px; }
.pt-ov-card h2 { font-family:'Fredoka',sans-serif; color:var(--pier-bulb,#ffe9a8); margin:0 0 12px; font-size:clamp(20px,4vw,26px); }
.pt-ov-card p { color:rgba(246,235,212,.85); font-size:15.5px; line-height:1.5; margin:0 0 20px; font-weight:500; }
.pt-start-btn { min-height:64px; padding:0 30px; font-size:17px; }

/* ---- header ---- */
.pt-header { display:flex; align-items:center; justify-content:center; flex-wrap:wrap; gap:12px; width:100%; text-align:center; }
.pt-title { font-family:'Fredoka',sans-serif; font-size:clamp(20px,4vw,28px); color:var(--pier-bulb,#ffe9a8); margin:0; text-shadow:0 0 10px rgba(255,233,168,.4); }
.pt-chip { background:rgba(10,18,48,.7); border:2px solid rgba(47,227,196,.35); color:var(--parchment); padding:7px 14px; border-radius:999px; font-family:'Fredoka',sans-serif; font-weight:700; font-size:13.5px; }
.pt-chip b { color:var(--pier-teal,#2fe3c4); }

/* ---- tank / water area ---- */
.pt-tank-area {
  width:100%; position:relative; border-radius:var(--r-lg); overflow:hidden;
  background:linear-gradient(180deg, rgba(47,227,196,.14), rgba(10,18,48,.55) 70%);
  border:3px solid rgba(47,227,196,.3);
  box-shadow:inset 0 0 40px rgba(47,227,196,.12), 0 10px 0 rgba(0,0,0,.3);
  padding:22px 16px 26px;
  display:flex; flex-direction:column; align-items:center; gap:18px;
}
.pt-tank-area::before, .pt-tank-area::after {
  content:''; position:absolute; width:10px; height:10px; border-radius:50%;
  background:rgba(255,255,255,.35); bottom:-14px; animation:pt-bubble-rise 5.4s linear infinite;
}
.pt-tank-area::before { left:18%; animation-delay:.2s; }
.pt-tank-area::after { left:70%; width:7px; height:7px; animation-delay:1.8s; }
@keyframes pt-bubble-rise {
  0% { transform:translateY(0) scale(1); opacity:.7; }
  90% { opacity:.5; }
  100% { transform:translateY(-320px) scale(.4); opacity:0; }
}

.pt-grid { display:flex; flex-wrap:wrap; justify-content:center; gap:16px; width:100%; }
.pt-gremlin-card {
  width:168px; background:linear-gradient(160deg,#131c3e,#0c1330); border:3px solid rgba(255,79,163,.3);
  border-radius:var(--r-md); box-shadow:0 6px 0 rgba(0,0,0,.3), 0 12px 22px rgba(0,0,0,.35);
  padding:14px 12px; text-align:center; position:relative;
  animation: enter-pop 380ms var(--spring) both, pt-bob 2.6s ease-in-out infinite alternate;
}
@keyframes pt-bob { from { transform:translateY(0); } to { transform:translateY(-7px); } }
.pt-g-emoji { font-size:38px; filter:drop-shadow(0 4px 6px rgba(0,0,0,.4)); }
.pt-g-name { font-family:'Fredoka',sans-serif; font-weight:700; color:var(--pier-bulb,#ffe9a8); font-size:14px; margin-top:4px; }
.pt-g-oneliner { font-size:11.5px; color:rgba(246,235,212,.72); line-height:1.35; margin-top:6px; min-height:44px; }
.pt-g-fact { font-family:'Fredoka',sans-serif; font-weight:700; color:var(--pier-teal,#2fe3c4); font-size:15px; margin-top:6px; }
.pt-g-tally { font-size:11.5px; color:rgba(255,150,150,.95); margin-top:4px; font-weight:600; }

.pt-splat-btn { min-height:64px; padding:0 30px; font-size:17px; }

/* ---- empty (celebration) state ---- */
.pt-empty { text-align:center; padding:16px 10px 6px; }
.pt-empty-stamp {
  display:inline-block; font-family:'Fredoka',sans-serif; font-weight:700; font-size:clamp(18px,3.6vw,24px);
  color:#1d8f4e; background:linear-gradient(180deg,#E9FBEF,#D3F3DF); border:3px solid var(--correct);
  border-radius:14px; padding:8px 20px; transform:rotate(-8deg); box-shadow:0 6px 0 rgba(0,0,0,.2);
  animation:pt-stamp-in 460ms var(--spring) both;
}
@keyframes pt-stamp-in { from { transform:rotate(-8deg) scale(.4); opacity:0; } to { transform:rotate(-8deg) scale(1); opacity:1; } }
.pt-empty-bubbles { font-size:26px; margin:14px 0 6px; letter-spacing:8px; animation:pt-bob 2.2s ease-in-out infinite alternate; }
.pt-empty-line { color:rgba(246,235,212,.88); font-size:14.5px; max-width:380px; margin:0 auto; line-height:1.45; }

/* ---- round view ---- */
.pt-round-header { text-align:center; width:100%; }
.pt-pips { display:flex; justify-content:center; gap:6px; margin-top:10px; flex-wrap:wrap; }
.pt-pip { width:12px; height:12px; border-radius:50%; background:rgba(255,255,255,.18); border:2px solid rgba(255,255,255,.25); }
.pt-pip-correct { background:var(--correct); border-color:var(--correct); }
.pt-pip-wrong { background:var(--wrong); border-color:var(--wrong); }

.pt-target-wrap { display:flex; justify-content:center; width:100%; min-height:160px; align-items:flex-start; position:relative; }
.pt-target-card {
  width:190px; background:linear-gradient(160deg,#131c3e,#0c1330); border:3px solid rgba(255,233,168,.5);
  border-radius:var(--r-md); box-shadow:0 0 0 6px rgba(255,233,168,.08), 0 8px 0 rgba(0,0,0,.3);
  padding:16px 14px; text-align:center; animation:pt-bob 2.4s ease-in-out infinite alternate;
}
.pt-target-emoji { font-size:44px; }
.pt-target-card.pt-recoil { animation:pt-recoil 360ms var(--spring) both; }
@keyframes pt-recoil {
  0% { transform:translateX(0) scaleY(1); }
  35% { transform:translateX(6px) scaleY(.85); }
  100% { transform:translateX(0) scaleY(1); }
}
.pt-target-card.pt-wiggle { animation:pt-wiggle 420ms ease-in-out both; }
@keyframes pt-wiggle {
  0%, 100% { transform:translateX(0); }
  25% { transform:translateX(-4px); }
  50% { transform:translateX(4px); }
  75% { transform:translateX(-3px); }
}
.pt-target-card.pt-flushing { animation:pt-flush-spiral 900ms cubic-bezier(.5,0,.75,0) forwards; }
@keyframes pt-flush-spiral {
  0% { transform:translateY(0) scale(1) rotate(0deg); opacity:1; }
  60% { transform:translateY(40px) scale(.7) rotate(240deg); opacity:.85; }
  100% { transform:translateY(90px) scale(.15) rotate(540deg); opacity:0; }
}
.pt-toilet-wrap { position:absolute; left:50%; top:64px; transform:translateX(-50%); display:flex; align-items:center; justify-content:center; width:76px; height:76px; }
.pt-swirl {
  position:absolute; width:70px; height:70px; border-radius:50%;
  background:conic-gradient(from 0deg, rgba(47,227,196,.55), rgba(255,79,163,.35), rgba(47,227,196,.55));
  filter:blur(2px); animation:pt-swirl-spin 900ms linear infinite;
}
@keyframes pt-swirl-spin { to { transform:rotate(360deg); } }
.pt-toilet-emoji { font-size:56px; position:relative; z-index:1; animation:enter-pop 300ms var(--spring) both; }

.pt-stem {
  background:#0a0f22; border:3px solid rgba(255,255,255,.14); border-radius:16px;
  padding:16px 26px; min-width:220px; text-align:center;
  font-size:clamp(22px,4.4vw,30px); font-weight:600; color:var(--parchment);
  font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  box-shadow:inset 0 3px 10px rgba(0,0,0,.6);
}
.pt-stem-flash-correct { box-shadow:inset 0 3px 10px rgba(0,0,0,.6), 0 0 0 4px rgba(46,204,113,.7); }
.pt-stem-flash-wrong { box-shadow:inset 0 3px 10px rgba(0,0,0,.6), 0 0 0 4px rgba(231,76,60,.6); }

.pt-feedback { min-height:26px; text-align:center; font-weight:700; font-size:14.5px; color:var(--parchment); max-width:420px; }
.pt-feedback-correct { color:var(--correct); animation:pt-float-up 900ms ease-out both; }
@keyframes pt-float-up {
  0% { transform:translateY(6px); opacity:0; }
  30% { opacity:1; }
  100% { transform:translateY(-14px); opacity:0; }
}
.pt-feedback-wrong { color:rgba(246,235,212,.92); }
.pt-feedback-wrong b { color:var(--pier-bulb,#ffe9a8); }
.pt-feedback-flush { color:var(--pier-bulb,#ffe9a8); font-size:16px; }

.pt-pad-host { margin-top:4px; }

/* ---- round-complete card ---- */
.pt-complete-card {
  width:100%; max-width:460px; background:linear-gradient(160deg,#131c3e,#0a1230);
  border:3px solid rgba(255,233,168,.4); border-radius:var(--r-lg); box-shadow:var(--shadow-card);
  padding:20px 20px 24px; text-align:center; margin-bottom:4px;
}
.pt-complete-card h3 { font-family:'Fredoka',sans-serif; color:var(--pier-bulb,#ffe9a8); margin:0 0 8px; font-size:19px; }
.pt-complete-score { font-family:'Fredoka',sans-serif; font-weight:700; color:var(--pier-teal,#2fe3c4); font-size:17px; margin-bottom:10px; }
.pt-complete-flushed { font-size:13.5px; color:rgba(246,235,212,.85); margin-bottom:14px; line-height:1.4; }
.pt-complete-flushed b { color:var(--pier-bulb,#ffe9a8); }
.pt-complete-btns { display:flex; flex-wrap:wrap; gap:10px; justify-content:center; }
.pt-complete-btns .btn { min-height:60px; padding:0 20px; font-size:14.5px; }
`;

export default {
  id: 'tank',
  title: 'THE GREMLIN TANK',
  blurb: 'Track your Gas Gremlins — and splat them for good.',

  mount(host, ctx, pier) {
    injectCss('pier-tank', CSS);

    let alive = true;
    const timers = new Set();
    const later = (fn, ms) => {
      const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms);
      timers.add(id);
      return id;
    };
    const rng = freshRng();

    /* ---------- shell: back button + stage ---------- */
    const root = el('div', 'pt-root');
    host.append(root);

    const back = el('button', 'btn btn-ghost pt-back', '← PIER');
    back.addEventListener('click', () => {
      ctx.audio.sfx('back');
      ctx.go('#/pier');
    });
    root.append(back);

    const stage = el('div', 'pt-stage');
    root.append(stage);

    const bodyHost = el('div', 'pt-body');
    bodyHost.style.cssText = 'width:100%;display:flex;flex-direction:column;align-items:center;gap:16px;';
    stage.append(bodyHost);

    /* ---------- round-scoped state ---------- */
    let currentTankArea = null;
    let roundActive = false;
    let roundState = null;
    let currentFact = null;
    let currentQid = 0;
    let questionCounter = 0;
    let qStart = 0;
    let numpad = null;
    let targetCardHost = null;
    let stemEl = null;
    let feedbackEl = null;
    let pipsHost = null;

    /* ---------- aquarium ---------- */
    function buildGremlinCard(g, i) {
      const info = gremlinInfo(g.family, g.name);
      const card = el('div', 'pt-gremlin-card');
      card.style.animationDelay = `${i * 0.12}s, ${i * 0.18}s`;
      card.innerHTML = `
        <div class="pt-g-emoji">${emojiForFamily(g.family)}</div>
        <div class="pt-g-name">${info.name}</div>
        <div class="pt-g-oneliner">${info.oneliner}</div>
        <div class="pt-g-fact">${g.name}</div>
        <div class="pt-g-tally">😖 slipped up ×${g.misses}</div>
      `;
      return card;
    }

    function buildEmptyState(tankArea) {
      const wrap = el('div', 'pt-empty');
      const line = pick(rng, nana.tankClean);
      wrap.innerHTML = `
        <div class="pt-empty-stamp">SPARKLING CLEAN!</div>
        <div class="pt-empty-bubbles">🫧 ✨ 🫧 ✨ 🫧</div>
        <p class="pt-empty-line">${line ? line.text : 'Not a single gremlin left in here — marvellous work!'}</p>
      `;
      if (line) pier.say(line);
      later(() => {
        if (!tankArea.isConnected) return;
        party(stage);
        const r = tankArea.getBoundingClientRect();
        sparkleBurst(tankArea, r.width / 2, 60);
      }, 120);
      return wrap;
    }

    function buildCompleteCard(summary) {
      const card = el('div', 'pt-complete-card enter-pop');
      const flushedHtml = summary.flushed.length
        ? `<div class="pt-complete-flushed">🚽 Flushed for good: <b>${summary.flushed.join(', ')}</b></div>`
        : '<div class="pt-complete-flushed">No flushes this round — every splat still wears them down!</div>';
      card.innerHTML = `
        <h3>ROUND COMPLETE!</h3>
        <div class="pt-complete-score">${summary.correct}/${summary.total} splats landed</div>
        ${flushedHtml}
        <div class="pt-complete-btns">
          ${summary.hasGremlinsLeft ? '<button type="button" class="btn btn-gold pt-again-btn">SPLAT \'EM AGAIN 🔨</button>' : ''}
          <button type="button" class="btn btn-ghost pt-back-tank-btn">BACK TO TANK 🫧</button>
        </div>
      `;
      const againBtn = card.querySelector('.pt-again-btn');
      if (againBtn) {
        againBtn.addEventListener('click', () => {
          sfx.ui();
          card.remove();
          const fresh = pier.facts.gremlins();
          if (fresh.length) startRound(fresh); else renderAquarium();
        });
      }
      card.querySelector('.pt-back-tank-btn').addEventListener('click', () => {
        sfx.ui();
        card.remove();
      });
      return card;
    }

    function renderAquarium(pendingSummary) {
      roundActive = false;
      bodyHost.innerHTML = '';

      const gremlinsNow = pier.facts.gremlins();
      const lifetimeFlushed = pier.facts.flushed();

      const header = el('div', 'pt-header');
      header.innerHTML = `
        <h2 class="pt-title">🫧 THE GREMLIN TANK</h2>
        <div class="pt-chip">🚽 <b>${lifetimeFlushed}</b> flushed forever</div>
      `;
      bodyHost.append(header);

      const tankArea = el('div', 'pt-tank-area');
      bodyHost.append(tankArea);
      currentTankArea = tankArea;

      if (pendingSummary) tankArea.append(buildCompleteCard(pendingSummary));

      if (gremlinsNow.length === 0) {
        tankArea.append(buildEmptyState(tankArea));
      } else {
        const grid = el('div', 'pt-grid');
        gremlinsNow.forEach((g, i) => grid.append(buildGremlinCard(g, i)));
        tankArea.append(grid);
        const cta = el('button', 'btn btn-gold pt-splat-btn', "SPLAT 'EM! 🔨");
        cta.addEventListener('click', () => {
          sfx.ui();
          startRound(pier.facts.gremlins());
        });
        tankArea.append(cta);
      }
    }

    /* ---------- SPLAT 'EM round ---------- */
    function paintPips() {
      if (!pipsHost) return;
      pipsHost.innerHTML = '';
      for (let i = 0; i < roundState.total; i += 1) {
        const done = i < roundState.pipResults.length;
        const wasCorrect = done && roundState.pipResults[i];
        const cls = `pt-pip${done ? (wasCorrect ? ' pt-pip-correct' : ' pt-pip-wrong') : ''}`;
        pipsHost.append(el('span', cls));
      }
    }

    function renderRoundShell() {
      bodyHost.innerHTML = '';

      const header = el('div', 'pt-round-header');
      header.innerHTML = '<h2 class="pt-title">SPLAT \'EM!</h2>';
      pipsHost = el('div', 'pt-pips');
      header.append(pipsHost);
      bodyHost.append(header);

      targetCardHost = el('div', 'pt-target-wrap');
      bodyHost.append(targetCardHost);

      stemEl = el('div', 'pt-stem');
      bodyHost.append(stemEl);

      feedbackEl = el('div', 'pt-feedback');
      bodyHost.append(feedbackEl);

      const padHost = el('div', 'pt-pad-host');
      bodyHost.append(padHost);
      numpad = makeNumpad(padHost, { onSubmit: handleSubmit });

      paintPips();
    }

    function paintQuestion(fact) {
      const info = gremlinInfo(fact.family);
      targetCardHost.innerHTML = `
        <div class="pt-target-card">
          <div class="pt-g-emoji pt-target-emoji">${emojiForFamily(fact.family)}</div>
          <div class="pt-g-name">${info.name}</div>
        </div>
      `;
      stemEl.textContent = fact.stem;
      stemEl.classList.remove('pt-stem-flash-correct', 'pt-stem-flash-wrong');
      feedbackEl.className = 'pt-feedback';
      feedbackEl.textContent = '';
      numpad.clear();
      numpad.setEnabled(true);
    }

    function nextQuestion() {
      if (!alive || !roundActive) return;
      if (roundState.index >= roundState.total) { finishRound(); return; }
      const fact = pier.facts.drawFrom(rng, roundState.families);
      if (!fact) { finishRound(); return; }
      currentFact = fact;
      currentQid = (questionCounter += 1);
      qStart = performance.now();
      paintQuestion(fact);
    }

    function advanceAfter(qid) {
      if (!alive || !roundActive || qid !== currentQid) return;
      nextQuestion();
    }

    function playCorrectFeedback(qid) {
      stemEl.classList.add('pt-stem-flash-correct');
      feedbackEl.className = 'pt-feedback pt-feedback-correct';
      feedbackEl.textContent = 'SPLAT! 💥 +1';
      const card = targetCardHost.querySelector('.pt-target-card');
      if (card) card.classList.add('pt-recoil');
      sfx.pop();
      later(() => advanceAfter(qid), 900);
    }

    function playWrongFeedback(fact, qid) {
      stemEl.classList.add('pt-stem-flash-wrong');
      feedbackEl.className = 'pt-feedback pt-feedback-wrong';
      feedbackEl.innerHTML = `So close, pet! <b>${workedFactText(fact.family)}</b>`;
      const card = targetCardHost.querySelector('.pt-target-card');
      if (card) card.classList.add('pt-wiggle');
      sfx.nudge();
      const line = pick(rng, gremlin.taunt);
      if (line) pier.say(line);
      later(() => advanceAfter(qid), 1900);
    }

    function playFlushCeremony(fact, qid) {
      feedbackEl.className = 'pt-feedback pt-feedback-flush';
      feedbackEl.textContent = 'FLUSHED FOR GOOD! 🚽';
      const card = targetCardHost.querySelector('.pt-target-card');
      const toilet = el('div', 'pt-toilet-wrap', '<div class="pt-swirl"></div><div class="pt-toilet-emoji">🚽</div>');
      targetCardHost.append(toilet);
      if (card) card.classList.add('pt-flushing');
      sfx.whoosh();
      later(() => {
        if (!alive) return;
        sfx.drop();
        sfx.sparkle();
        if (toilet.isConnected) {
          const r = toilet.getBoundingClientRect();
          const hostR = targetCardHost.getBoundingClientRect();
          sparkleBurst(targetCardHost, r.left - hostR.left + r.width / 2, r.top - hostR.top + r.height / 2);
        }
        const line = pick(rng, gremlin.flushed);
        if (line) pier.say(line);
      }, 550);
      later(() => advanceAfter(qid), 2200);
    }

    function handleSubmit(str) {
      if (!alive || !roundActive || !currentFact) return;
      const qid = currentQid;
      const fact = currentFact;
      const val = parseInt(str, 10);
      const correct = val === fact.answer;
      const ms = Math.round(performance.now() - qStart);
      numpad.setEnabled(false);

      const result = pier.facts.record(fact.family, { correct, ms, mode: 'tank' });
      roundState.index += 1;
      roundState.pipResults.push(correct);
      if (correct) roundState.correctCount += 1;
      paintPips();

      if (result.justFlushed) {
        const info = gremlinInfo(fact.family);
        roundState.flushed.push(info.name);
        playFlushCeremony(fact, qid);
      } else if (correct) {
        playCorrectFeedback(qid);
      } else {
        playWrongFeedback(fact, qid);
      }
    }

    function finishRound() {
      roundActive = false;
      if (numpad) { numpad.destroy(); numpad = null; }
      const summary = {
        correct: roundState.correctCount,
        total: roundState.total,
        flushed: roundState.flushed.slice(),
        hasGremlinsLeft: pier.facts.gremlins().length > 0,
      };
      renderAquarium(summary);
    }

    function startRound(gremlinsNow) {
      const families = gremlinsNow.map((g) => g.family);
      if (families.length === 0) return;
      roundActive = true;
      roundState = {
        families, total: Math.min(12, families.length * 2), index: 0, correctCount: 0, flushed: [], pipResults: [],
      };
      renderRoundShell();
      const line = pick(rng, announcer.roundStart);
      if (line) pier.say(line);
      nextQuestion();
    }

    /* ---------- welcome overlay ---------- */
    const overlay = el('div', 'pt-overlay');
    overlay.innerHTML = `
      <div class="pt-ov-card enter-pop">
        <div class="pt-ov-emoji">🫧</div>
        <h2>THE GREMLIN TANK</h2>
        <p>Every Gas Gremlin that's ever tripped you up is bobbing about in here, pet. Have a good look — then SPLAT 'EM back where they came from!</p>
        <button type="button" class="btn btn-gold pt-start-btn">STEP UP TO THE TANK 🫧</button>
      </div>
    `;
    stage.append(overlay);
    overlay.querySelector('.pt-start-btn').addEventListener('click', () => {
      sfx.ui();
      overlay.remove();
      renderAquarium();
    });

    const welcomeLine = pick(rng, nana.welcome);
    if (welcomeLine) pier.say(welcomeLine);

    return function cleanup() {
      alive = false;
      timers.forEach((id) => clearTimeout(id));
      timers.clear();
      if (numpad) { numpad.destroy(); numpad = null; }
      root.remove();
    };
  },
};
