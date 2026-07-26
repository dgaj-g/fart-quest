// FART QUEST — js/pier/modes/teacups.js (TEACUPS agent)
// WHIFF-END PIER — THE TEACUPS: the gentle, untimed, single-table warm-up.
// See docs/PIER_SPEC.md §6 "teacups" (binding for this file).
//
// Flow: welcome overlay (cabinet name, a Nana line, big START) -> table
// picker (2-10, or 2-12 with Deluxe) -> Lap 1 (that table's x1..10, Fisher-
// Yates order) -> lap-change banner -> Lap 2 (the division inverses, also
// Fisher-Yates order) -> "table polished" sticker end screen with a
// suggestion chip for one of the four timed/scored machines. No score, no
// PB, no timer anywhere — this is deliberately the gentle machine (§6).
//
// Deviations from a literal reading of §6 (noted here + in the build report):
//  - `facts.record(family, {ms, ...})` is always called with `ms: null` for
//    Teacups results. The gremlin engine's "median correct-response time"
//    check (§5) is a fluency signal meant for the TIMED machines; an untimed,
//    think-as-long-as-you-like lap would otherwise pollute that shared,
//    cross-mode stat with slow-but-not-actually-weak times. Correct/incorrect
//    still feeds the miss-count side of gremlin tracking exactly as spec'd.
//  - The justFlushed nod (a sparkle + a `gremlin.flushed` caption line) is a
//    small extra, not the full Tank "Big Toilet" ceremony (that spectacle is
//    explicitly Tank's per §6) — kept deliberately lightweight so it doesn't
//    duplicate another machine's set-piece.
//  - Nana's welcome line is the only content.js pool line used; lap-change/
//    end-screen copy is plain mode-owned microcopy (content.js's pools are
//    the CONTENT agent's frozen VO-id surface — inventing new ad-hoc ids here
//    would never get a real recording and isn't this file's call to make).

import {
  el, sfx, sparkleBurst, party, injectCss,
} from '../../anims/_kit.js';
import { makeNumpad } from '../padkit.js';
import { mulberry32, pick, shuffle } from '../../rng.js';

const BIG_RIDES = [
  { id: 'splat', label: 'SPLAT-A-GREMLIN', emoji: '🔨' },
  { id: 'gunge', label: 'THE GUNGE TANK', emoji: '🪣' },
  { id: 'ghost', label: 'THE GHOST TRAIN', emoji: '👻' },
  { id: 'tank', label: 'THE GREMLIN TANK', emoji: '🫧' },
];

const CSS = `
.pt-back {
  position: absolute; top: calc(16px + var(--safe-t, 0px)); left: calc(16px + var(--safe-l, 0px));
  min-height: 60px; padding: 0 20px; font-size: 15px; z-index: 6;
}
.pt-stage {
  min-height: 100%; display: flex; align-items: center; justify-content: center;
  padding: calc(84px + var(--safe-t, 0px)) 20px calc(30px + var(--safe-b, 0px));
}
.pt-card {
  background: linear-gradient(160deg, #131c3e, #0c1330);
  border: 3px solid rgba(255, 79, 163, .28);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-card);
  padding: 30px 26px 26px;
  max-width: 460px; width: 100%; text-align: center;
}

/* ---------- welcome ---------- */
.pt-welcome-emoji { font-size: 52px; margin-bottom: 6px; animation: pt-bob 2.4s ease-in-out infinite alternate; }
.pt-welcome h2 { font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 26px; color: var(--pier-bulb); margin: 4px 0 10px; }
.pt-welcome-blurb { font-size: 15px; line-height: 1.4; color: rgba(246, 235, 212, .82); margin: 0 0 16px; }
.pt-nana-line {
  display: flex; align-items: flex-start; gap: 10px; text-align: left;
  background: rgba(255, 255, 255, .06); border-radius: 14px; padding: 10px 14px; margin-bottom: 18px;
  font-size: 13.5px; line-height: 1.4; color: var(--parchment);
}
.pt-nana-avatar { font-size: 24px; flex: 0 0 auto; }
.pt-start { min-height: 60px; padding: 0 34px; font-size: 18px; }
@keyframes pt-bob { from { transform: translateY(0); } to { transform: translateY(-6px); } }

/* ---------- table picker ---------- */
.pt-picker h2 { font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 24px; color: var(--pier-bulb); margin: 0 0 4px; }
.pt-picker-sub { font-size: 14px; color: rgba(246, 235, 212, .75); margin: 0 0 18px; }
.pt-cupgrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(76px, 1fr)); gap: 12px; }
.pt-cup {
  min-height: 76px; border: 3px solid rgba(47, 227, 196, .35); border-radius: 18px; cursor: pointer;
  background: linear-gradient(160deg, #141c44, #0a1230); color: var(--parchment);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 0;
  box-shadow: 0 5px 0 rgba(0, 0, 0, .35); transition: transform 140ms var(--spring), box-shadow 140ms var(--spring);
}
.pt-cup:active { transform: scale(.93) translateY(2px); box-shadow: 0 2px 0 rgba(0, 0, 0, .35); }
.pt-cup-emoji { font-size: 26px; }
.pt-cup-num { font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 19px; color: var(--pier-teal); }

/* ---------- lap change banner ---------- */
.pt-lapcard-emoji { font-size: 48px; margin-bottom: 8px; }
.pt-lapcard h2 { font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 23px; color: var(--pier-bulb); margin: 2px 0 10px; }
.pt-lapcard p { font-size: 15px; line-height: 1.4; color: rgba(246, 235, 212, .85); margin: 0 0 20px; }
.pt-lapcard p b { color: var(--pier-pink); }
.pt-lap-go { min-height: 60px; padding: 0 28px; font-size: 16px; }

/* ---------- lap play ---------- */
.pt-lap { display: flex; flex-direction: column; align-items: center; gap: 14px; }
.pt-lap-header { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.pt-lap-title { font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 17px; color: var(--pier-bulb); letter-spacing: .02em; }
.pt-lap-dir { color: var(--pier-teal); margin-left: 8px; font-size: 14px; }
.pt-dots { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; max-width: 280px; }
.pt-dot { width: 10px; height: 10px; border-radius: 50%; background: rgba(255, 255, 255, .18); }
.pt-dot.done { background: var(--correct); }
.pt-dot.current { background: var(--pier-bulb); box-shadow: 0 0 0 3px rgba(255, 233, 168, .3); }
.pt-cuparea { position: relative; display: flex; flex-direction: column; align-items: center; gap: 10px; padding-top: 6px; }
.pt-cuparea.pt-flash-correct::before {
  content: ''; position: absolute; top: -8px; left: 50%; transform: translateX(-50%);
  width: 120px; height: 120px; border-radius: 50%;
  background: radial-gradient(circle, rgba(46, 204, 113, .38), transparent 70%);
  animation: pt-correct-pulse 620ms ease both;
}
@keyframes pt-correct-pulse {
  0% { opacity: 0; transform: translateX(-50%) scale(.7); }
  30% { opacity: 1; transform: translateX(-50%) scale(1.05); }
  100% { opacity: 0; transform: translateX(-50%) scale(1.2); }
}
.pt-cup-big { font-size: 64px; filter: drop-shadow(0 6px 10px rgba(0, 0, 0, .45)); }
.pt-cup-big.pt-spin-fwd { animation: pt-spin-fwd 420ms cubic-bezier(.34, 1.1, .4, 1) both; }
.pt-cup-big.pt-spin-back { animation: pt-spin-back 420ms cubic-bezier(.34, 1.1, .4, 1) both; }
.pt-cup-big.pt-wobble { animation: pt-wobble 420ms ease both; }
@keyframes pt-spin-fwd { 0% { transform: rotate(0deg) scale(1); } 55% { transform: rotate(200deg) scale(.82); } 100% { transform: rotate(360deg) scale(1); } }
@keyframes pt-spin-back { 0% { transform: rotate(0deg) scale(1); } 55% { transform: rotate(-200deg) scale(.82); } 100% { transform: rotate(-360deg) scale(1); } }
@keyframes pt-wobble {
  0%, 100% { transform: rotate(0deg); } 20% { transform: rotate(-9deg); } 40% { transform: rotate(8deg); }
  60% { transform: rotate(-6deg); } 80% { transform: rotate(4deg); }
}
.pt-stem { font-size: clamp(22px, 4.4vw, 30px); font-weight: 700; color: var(--parchment); text-align: center; min-height: 40px; }
.pt-hint {
  max-width: 380px; text-align: center; font-size: 13.5px; line-height: 1.4; font-weight: 600;
  color: var(--parchment); background: rgba(255, 79, 163, .12); border: 2px solid rgba(255, 79, 163, .4);
  border-radius: 14px; padding: 0; opacity: 0; max-height: 0; overflow: hidden;
  transition: opacity 220ms ease, padding 220ms ease, max-height 220ms ease;
}
.pt-hint.show { opacity: 1; padding: 10px 16px; max-height: 120px; }
.pt-hint b { color: var(--pier-teal); }
.pt-hint-tag { display: block; font-size: 10.5px; letter-spacing: .08em; font-weight: 700; color: var(--pier-pink); margin-bottom: 3px; }
.pt-numhost { margin-top: 2px; }

/* ---------- end screen ---------- */
.pt-sticker {
  display: inline-flex; flex-direction: column; align-items: center; justify-content: center;
  background: linear-gradient(160deg, #fff6da, #ffe29a); color: #5a4408; border: 4px solid var(--gold-deep);
  border-radius: 50%; width: 190px; height: 190px; margin: 0 auto 18px; transform: rotate(-6deg);
  box-shadow: 0 10px 0 rgba(0, 0, 0, .25), 0 18px 34px rgba(0, 0, 0, .35);
  animation: pt-sticker-in 520ms var(--spring) both;
}
@keyframes pt-sticker-in { from { transform: scale(.4) rotate(-6deg); opacity: 0; } to { transform: scale(1) rotate(-6deg); opacity: 1; } }
.pt-sticker-emoji { font-size: 24px; margin-bottom: 4px; }
.pt-sticker-text { font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 19px; line-height: 1.15; }
.pt-end-sub { font-size: 14.5px; line-height: 1.4; color: rgba(246, 235, 212, .85); margin: 0 0 20px; }
.pt-ride-chip {
  display: flex; align-items: center; justify-content: center; width: 100%; text-align: center; border: none; cursor: pointer;
  background: rgba(47, 227, 196, .14); border: 2px solid rgba(47, 227, 196, .4); color: var(--parchment);
  border-radius: 999px; padding: 10px 18px; font-size: 14px; font-weight: 600; margin-bottom: 18px; min-height: 60px;
}
.pt-ride-chip b { color: var(--pier-bulb); }
.pt-end-btns { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
.pt-end-btns .btn { min-height: 60px; padding: 0 24px; font-size: 15px; }
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

    const back = el('button', 'btn btn-ghost pt-back', '← PIER');
    back.addEventListener('click', () => { ctx.audio.sfx('back'); ctx.go('#/pier'); });
    const stage = el('div', 'pt-stage');
    host.append(back, stage);

    // ---- per-run state ----
    let table = null;
    let lap = 1; // 1 = multiplication, 2 = division inverses
    let queue = [];
    let qIndex = 0;
    let fact = null;
    let busy = false; // guards rapid repeat-taps during a spin/settle transition (HARD RULE 3)
    let numpad = null;

    // DOM refs for the in-lap HUD (rebuilt fresh each lap via buildLapUI)
    let cupEl = null;
    let stemEl = null;
    let hintEl = null;
    let dotsEl = null;
    let cupAreaEl = null;

    function clearStage() { stage.innerHTML = ''; }

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

    /* ================= welcome ================= */
    function renderWelcome() {
      clearStage();
      const pool = (pier.content && pier.content.nana && pier.content.nana.welcome) || [];
      const line = pick(rng, pool);
      if (line) pier.say(line);

      const card = el('div', 'pt-card pt-welcome enter-pop');
      card.innerHTML = `
        <div class="pt-welcome-emoji">🍵</div>
        <h2>THE TEACUPS</h2>
        <p class="pt-welcome-blurb">A gentle spin through one whole times table — no clock, no score, just you and the cups.</p>
        ${line ? `<div class="pt-nana-line"><span class="pt-nana-avatar">👵</span><span>${line.text}</span></div>` : ''}
      `;
      const startBtn = el('button', 'btn btn-gold pt-start', 'START 🍵');
      card.append(startBtn);
      stage.append(card);

      startBtn.addEventListener('click', () => { ctx.audio.sfx('confirm'); sfx.ui(); renderPicker(); });
    }

    /* ================= table picker ================= */
    function renderPicker() {
      clearStage();
      // Read the Deluxe flag FRESH every time the picker renders (never a
      // cached snapshot) — this is the one screen where it actually matters,
      // and "spin another table" from the end screen returns here without a
      // full remount, so a stale boolean would be a real (if rare) bug.
      const deluxe = pier.facts.deluxeOn();
      const max = deluxe ? 12 : 10;

      const wrap = el('div', 'pt-card pt-picker enter-pop');
      wrap.innerHTML = `
        <h2>PICK YOUR CUP</h2>
        <p class="pt-picker-sub">${deluxe ? 'Deluxe is on — even 11 and 12 fancy a spin today!' : 'Which table fancies a spin today?'}</p>
      `;
      const grid = el('div', 'pt-cupgrid');
      for (let n = 2; n <= max; n += 1) {
        const cup = el('button', 'pt-cup', `<span class="pt-cup-emoji">🍵</span><span class="pt-cup-num">${n}</span>`);
        cup.type = 'button';
        cup.addEventListener('click', () => { ctx.audio.sfx('confirm'); sfx.pop(); startTable(n); });
        grid.append(cup);
      }
      wrap.append(grid);
      stage.append(wrap);
    }

    /* ================= running a table ================= */
    function startTable(n) {
      table = n;
      lap = 1;
      buildQueue();
      renderLapBanner(() => { buildLapUI(); showQuestion(); });
    }

    function buildQueue() {
      const raw = pier.facts.tableFacts(table, { division: lap === 2 });
      queue = shuffle(rng, raw);
      qIndex = 0;
    }

    function renderLapBanner(onGo) {
      clearStage();
      const wrap = el('div', 'pt-card pt-lapcard enter-pop');
      wrap.innerHTML = lap === 1
        ? `<div class="pt-lapcard-emoji">🍵</div><h2>TABLE ${table}</h2><p>Lap 1 — multiplication! Answer each cup as it spins round.</p>`
        : `<div class="pt-lapcard-emoji">🔄</div><h2>LAP 1 DONE!</h2><p>Now the cups spin <b>BACKWARDS</b> — division time!</p>`;
      const goBtn = el('button', 'btn btn-gold pt-lap-go', lap === 1 ? "LET'S GO! 🍵" : 'SPIN BACKWARDS! 🔄');
      wrap.append(goBtn);
      stage.append(wrap);
      goBtn.addEventListener('click', () => { ctx.audio.sfx('confirm'); onGo(); });
    }

    function buildLapUI() {
      clearStage();
      busy = false;
      const wrap = el('div', 'pt-card pt-lap enter-pop');

      const header = el('div', 'pt-lap-header');
      header.innerHTML = `<div class="pt-lap-title">TABLE ${table}<span class="pt-lap-dir">${lap === 1 ? '× MULTIPLY' : '÷ DIVIDE'}</span></div>`;
      dotsEl = el('div', 'pt-dots');
      for (let i = 0; i < queue.length; i += 1) dotsEl.append(el('span', 'pt-dot'));
      header.append(dotsEl);

      cupAreaEl = el('div', 'pt-cuparea');
      cupEl = el('div', 'pt-cup-big', '🍵');
      stemEl = el('div', 'pt-stem');
      cupAreaEl.append(cupEl, stemEl);

      hintEl = el('div', 'pt-hint');

      const numHost = el('div', 'pt-numhost');

      wrap.append(header, cupAreaEl, hintEl, numHost);
      stage.append(wrap);

      if (numpad) numpad.destroy();
      numpad = makeNumpad(numHost, { onSubmit: handleSubmit });
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
      // matches exactly what's on screen right now (HARD RULE 2), even
      // though nothing async happens before it's used.
      const val = parseInt(valueStr, 10);
      const correct = val === activeFact.answer;
      // Teacups is untimed by design (§6) — `ms: null` deliberately, so this
      // gentle lap never feeds a "too slow" gremlin verdict off real-world
      // thinking time (see header note).
      const result = pier.facts.record(activeFact.family, { correct, ms: null, mode: 'teacups' });
      if (correct) handleCorrect(activeFact, result);
      else handleWrong(activeFact);
    }

    function handleWrong(activeFact) {
      ctx.audio.sfx('wrong');
      sfx.nudge();
      cupEl.classList.remove('pt-wobble');
      void cupEl.offsetWidth; // restart the keyframe even on back-to-back misses
      cupEl.classList.add('pt-wobble');
      hintEl.innerHTML = `<span class="pt-hint-tag">WARM HINT</span>${hintFor(activeFact)}`;
      hintEl.classList.add('show');
      numpad.clear();
      // No advance, no cap, no penalty — retry the SAME fact until it lands.
    }

    function handleCorrect(activeFact, result) {
      busy = true;
      numpad.setEnabled(false);
      ctx.audio.sfx('correct');
      (lap === 1 ? sfx.tick : sfx.tock)(1);
      cupAreaEl.classList.remove('pt-flash-correct');
      void cupAreaEl.offsetWidth;
      cupAreaEl.classList.add('pt-flash-correct');

      if (result && result.justFlushed) {
        const flushPool = (pier.content && pier.content.gremlin && pier.content.gremlin.flushed) || [];
        const flushLine = pick(rng, flushPool);
        sparkleBurst(stage, stage.clientWidth / 2, stage.clientHeight * 0.4);
        if (flushLine) pier.say(flushLine);
      }

      later(() => {
        cupAreaEl.classList.remove('pt-flash-correct');
        qIndex += 1;
        if (qIndex >= queue.length) onLapComplete();
        else spinToNextQuestion();
      }, 620);
    }

    function spinToNextQuestion() {
      cupEl.classList.remove('pt-spin-fwd', 'pt-spin-back');
      void cupEl.offsetWidth;
      cupEl.classList.add(lap === 1 ? 'pt-spin-fwd' : 'pt-spin-back');
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
        buildQueue();
        renderLapBanner(() => { buildLapUI(); showQuestion(); });
      } else {
        finish();
      }
    }

    /* ================= end screen ================= */
    function finish() {
      clearStage();
      const ride = pick(rng, BIG_RIDES);
      const wrap = el('div', 'pt-card pt-end enter-pop');
      wrap.innerHTML = `
        <div class="pt-sticker">
          <div class="pt-sticker-emoji">✨🍵✨</div>
          <div class="pt-sticker-text">TABLE ${table}<br>POLISHED!</div>
        </div>
        <p class="pt-end-sub">Both laps spun clean — multiplication AND the division inverses. Lovely, gentle work, nose-soldier.</p>
      `;
      const rideChip = el('button', 'pt-ride-chip', `Fancy a bigger ride? <b>${ride.emoji} ${ride.label}</b> →`);
      rideChip.type = 'button';
      rideChip.addEventListener('click', () => { ctx.audio.sfx('confirm'); ctx.go(`#/pier/${ride.id}`); });

      const btnRow = el('div', 'pt-end-btns');
      const again = el('button', 'btn btn-gold', 'SPIN ANOTHER TABLE 🍵');
      const homeBtn = el('button', 'btn btn-ghost', '← PIER');
      again.addEventListener('click', () => { ctx.audio.sfx('confirm'); renderPicker(); });
      homeBtn.addEventListener('click', () => { ctx.audio.sfx('back'); ctx.go('#/pier'); });
      btnRow.append(again, homeBtn);

      wrap.append(rideChip, btnRow);
      stage.append(wrap);

      sfx.sparkle();
      party(stage, 14); // a modest flourish — teacups has no score/PB to make a fuss over
    }

    renderWelcome();

    return function cleanup() {
      alive = false;
      timers.forEach((tid) => clearTimeout(tid));
      timers.clear();
      if (numpad) { numpad.destroy(); numpad = null; }
      back.remove();
      stage.remove();
    };
  },
};
