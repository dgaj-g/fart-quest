// FART QUEST — js/anims/contractions.js
// COLIN'S SQUEEZE PRESS — interactive contraction machine for the
// contractions Scout Report (Grammar Grotto). Feed word pairs into the
// press, pull the big lever, watch the letters that vanish pop out and the
// apostrophe drop in to plug the hole. "Of" never comes out — it never
// goes in (Colin's blood oath against the imposter "could of").

import { el, sfx, tween, makeDrag, toast, bubble, party, injectCss } from './_kit.js';

const COLIN_IMG = 'assets/monsters/couldve-colin.png';
const RULE = "Stretch it back out to check: could've = could HAVE. 'Could of' is always an imposter.";

/* ---------- pure squeeze engine (tested independently — do not "improve") ----------
   A word only squeezes if it has a registered SPLIT: prefix + removed + suffix.
   "of" has no entry — which is exactly the Aha: it never went in, so it can
   never come out. */
const SPLIT = {
  not: { prefix: 'n', removed: 'o', suffix: 't' },
  are: { prefix: '', removed: 'a', suffix: 're' },
  have: { prefix: '', removed: 'ha', suffix: 've' },
  is: { prefix: '', removed: 'i', suffix: 's' },
};
function squeezeWord(w1, w2) {
  const s = SPLIT[w2];
  if (!s) return null;
  return w1 + s.prefix + "'" + s.suffix;
}
function stretchWord(w2) {
  const s = SPLIT[w2];
  return s ? s.prefix + s.removed + s.suffix : w2;
}
function fisherYates(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- content ---------- */
const MISSIONS = [
  { id: 'a', mode: 'squeeze', label: 'DO + NOT', w1: 'do', w2: 'not', target: "don't",
    q: 'Squeeze <b>do + not</b> into one word.',
    sub: 'Pull the lever and watch the press go to work.',
    worked: '"do not" squeezes into don\'t — the apostrophe marks the missing "o" in "not".' },
  { id: 'b', mode: 'squeeze', label: 'THEY + ARE', w1: 'they', w2: 'are', target: "they're",
    q: 'Squeeze <b>they + are</b> into one word.',
    sub: 'Pull the lever and watch the press go to work.',
    worked: '"they are" squeezes into they\'re — the apostrophe marks the missing "a".' },
  { id: 'c', mode: 'stretch', label: 'STRETCH IT', w1: 'should', w2: 'have', input: "should've", target: 'should have',
    q: 'Stretch <b>should\'ve</b> back out to its two full words.',
    sub: 'Pull the lever — this time it STRETCHES, and the letters fly back in.',
    worked: '"should\'ve" un-squeezes to "should have" — the apostrophe was marking the missing "ha".' },
  { id: 'd', mode: 'trap', label: 'THE TRAP', target: "could've",
    q: 'After the final whistle, Jarlath sighed that he ___ scored twice with a bit more luck.',
    sub: 'Tap a pair to load it, then pull the lever — but Could Of might be lurking.',
    options: [{ w1: 'could', w2: 'have' }, { w1: 'could', w2: 'of' }, { w1: 'would', w2: 'have' }, { w1: 'must', w2: 'of' }],
    worked: '"could\'ve" un-squeezes to "could have" — Jarlath means he HAD the ability to score more, just not the luck.' },
  { id: 'e', mode: 'rebel', label: 'WILL + NOT', w1: 'will', w2: 'not', target: "won't",
    q: 'Squeeze <b>will + not</b> — but watch out, this one\'s a rebel!',
    sub: 'Pull the lever and see what the press does with this troublemaker.',
    worked: '"will not" rebels completely into won\'t — this is one of the three squeezes you simply have to know.' },
];
const SANDBOX_PAIRS = [
  { w1: 'is', w2: 'not' }, { w1: 'we', w2: 'have' }, { w1: 'who', w2: 'is' },
  { w1: 'there', w2: 'is' }, { w1: 'they', w2: 'have' },
];
const WIN_PHRASES = ['SQUEEZE PERFECT! 💨', 'COLIN APPROVES! 🎩', 'PRESSED TO PERFECTION!', 'NOT A LETTER OUT OF PLACE!'];

/* ---------- the press machine (DOM only, no game state) ---------- */
function buildMachine(host) {
  const root = el('div', 'csp-machine');
  const labelEl = el('div', 'csp-label', "COLIN'S SQUEEZE PRESS");
  const body = el('div', 'csp-body');
  const hatch = el('div', 'csp-hatch', "'");
  const tray = el('div', 'csp-tray');
  const slotA = el('div', 'csp-slot', '?');
  const plus = el('div', 'csp-plus', '+');
  const slotB = el('div', 'csp-slot', '?');
  tray.append(slotA, plus, slotB);
  const outWrap = el('div', 'csp-outwrap');
  const outSlot = el('div', 'csp-output', '<span class="csp-ph">?</span>');
  outWrap.append(outSlot);
  body.append(hatch, tray, outWrap);
  root.append(labelEl, body);
  host.append(root);
  return { root, body, hatch, tray, slotA, slotB, outSlot };
}

function flyLetters(container, letters, cls, schedule) {
  if (!letters) return;
  const s = el('span', cls, letters);
  container.appendChild(s);
  (schedule || setTimeout)(() => { if (s.parentNode) s.remove(); }, 750);
}

function renderOutput(outSlot, text, animApo) {
  if (!text) { outSlot.innerHTML = '<span class="csp-ph">?</span>'; return; }
  outSlot.innerHTML = text.split('').map((c) => (
    c === "'" ? `<span class="csp-apo${animApo ? ' csp-apo-drop' : ''}">'</span>` : `<span>${c}</span>`
  )).join('');
  outSlot.classList.remove('csp-pop'); void outSlot.offsetWidth; outSlot.classList.add('csp-pop');
}

/* ---------- the anim card ---------- */
export default {
  id: 'contractions',
  title: "COLIN'S SQUEEZE PRESS",

  mount(host, ctx) {
    let alive = true;
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    injectCss('contractions', CSS);

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'som-q');
    const qsub = el('div', 'som-qsub');
    const machineHost = el('div');
    const optionRow = el('div', 'csp-optrow');
    const leverWrap = el('div', 'csp-leverwrap');
    const track = el('div', 'csp-track');
    const handle = el('div', 'csp-handle', '⬇');
    const leverLabel = el('div', 'csp-leverlabel', 'PULL');
    track.append(handle);
    leverWrap.append(track, leverLabel);
    const controls = el('div', 'anim-controls');
    const resetBtn = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(resetBtn);
    const winBox = el('div');
    stage.append(chiprow, q, qsub, machineHost, optionRow, leverWrap, controls, winBox);
    host.append(stage);

    const ruleCard = el('div', 'csp-rulecard', RULE);
    host.append(ruleCard);

    const M = buildMachine(machineHost);

    let mi = 0;
    let mission = null;
    let currentPair = null;
    let leverY = 0;
    let leverBusy = false;
    let leverCancelTween = null;
    let trackH = 0;
    let ahaShown = false;
    let completedCalled = false;

    function setLeverY(y) {
      leverY = y;
      handle.style.transform = `translateY(${y}px)`;
    }
    function settleLever(target, after) {
      if (leverCancelTween) { leverCancelTween(); leverCancelTween = null; }
      leverCancelTween = tween((v) => setLeverY(v), leverY, target, 220, () => {
        leverCancelTween = null;
        if (after) after();
      });
    }

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), m.label);
        c.addEventListener('click', () => { if (leverBusy) return; sfx.ui(); start(i); });
        chiprow.append(c);
      });
      const fp = el('button', 'anim-mchip' + (mi === MISSIONS.length ? ' active' : ''), 'FREE PLAY 🕹️');
      fp.addEventListener('click', () => { if (leverBusy) return; sfx.ui(); start(MISSIONS.length); });
      chiprow.append(fp);
    }

    function loadPairIntoTray(w1, w2) {
      M.slotA.textContent = w1;
      M.slotB.textContent = w2;
    }

    function resetTray() {
      currentPair = null;
      M.slotA.textContent = '?';
      M.slotB.textContent = '?';
      renderOutput(M.outSlot, '', false);
      optionRow.querySelectorAll('.anim-mchip').forEach((b) => b.classList.remove('active'));
    }

    function buildOptionChips(pairs, preselect) {
      optionRow.innerHTML = '';
      pairs.forEach((opt, idx) => {
        const c = el('button', 'anim-mchip' + (preselect && idx === 0 ? ' active' : ''), `${opt.w1.toUpperCase()} + ${opt.w2.toUpperCase()}`);
        c.addEventListener('click', () => {
          if (leverBusy) return;
          sfx.ui();
          currentPair = opt;
          loadPairIntoTray(opt.w1, opt.w2);
          renderOutput(M.outSlot, '', false);
          optionRow.querySelectorAll('.anim-mchip').forEach((b) => b.classList.remove('active'));
          c.classList.add('active');
        });
        optionRow.append(c);
      });
    }

    function setupMission() {
      optionRow.innerHTML = '';
      M.tray.classList.toggle('csp-tray-single', mission.mode === 'stretch');
      renderOutput(M.outSlot, '', false);
      if (mission.mode === 'trap') {
        currentPair = null;
        M.slotA.textContent = '?'; M.slotB.textContent = '?';
        buildOptionChips(fisherYates(mission.options), false);
      } else if (mission.mode === 'stretch') {
        currentPair = { w1: mission.w1, w2: mission.w2 };
        M.slotA.textContent = mission.input;
      } else {
        currentPair = { w1: mission.w1, w2: mission.w2 };
        loadPairIntoTray(mission.w1, mission.w2);
      }
    }

    function setupSandbox() {
      M.tray.classList.remove('csp-tray-single');
      renderOutput(M.outSlot, '', false);
      buildOptionChips(SANDBOX_PAIRS, true);
      currentPair = SANDBOX_PAIRS[0];
      loadPairIntoTray(currentPair.w1, currentPair.w2);
    }

    function start(i) {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
      mi = i;
      winBox.innerHTML = '';
      if (leverCancelTween) { leverCancelTween(); leverCancelTween = null; }
      setLeverY(0);
      leverBusy = false;
      paintChips();
      const sandbox = i === MISSIONS.length;
      mission = sandbox ? null : MISSIONS[i];
      if (sandbox) {
        q.innerHTML = 'Free play — pick a pair to squeeze:';
        qsub.textContent = 'Tap a pair, then pull the lever.';
        setupSandbox();
        return;
      }
      q.innerHTML = mission.q;
      qsub.textContent = mission.sub;
      setupMission();
    }

    /* ---------- outcomes ---------- */
    function finishMission() {
      if (mission) {
        doneSet.add(mission.id);
        sfx.win();
        party(stage);
        paintChips();
        showWinCard();
        if (doneSet.size === MISSIONS.length && !completedCalled) {
          completedCalled = true;
          ctx.complete();
          if (!ahaShown) {
            ahaShown = true;
            later(() => {
              if (!alive) return;
              bubble(stage, {
                title: 'THE PRESS NEVER LIES! 🏆',
                text: 'The apostrophe always drops in EXACTLY where letters were squeezed out — and "of" can never come out of the press, because it never went in.',
                img: COLIN_IMG,
              });
            }, 700);
          }
        }
      }
    }

    function showWinCard() {
      winBox.innerHTML = '';
      const w = el('div', 'csp-win',
        `<div class="csp-wp">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]}</div>`
        + `<div class="csp-wk">${mission.worked}</div>`);
      winBox.append(w);
      const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
      if (nextIdx !== -1) {
        const nb = el('button', 'btn btn-gold', 'NEXT ONE ➡');
        nb.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
        nb.addEventListener('click', () => { sfx.ui(); start(nextIdx); });
        w.append(nb);
      } else {
        const fp = el('button', 'btn btn-gold', 'FREE PLAY 🕹️');
        fp.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
        fp.addEventListener('click', () => { sfx.ui(); start(MISSIONS.length); });
        w.append(fp);
      }
    }

    function showDecoy(result) {
      bubble(stage, {
        title: 'REAL WORD, WRONG PAIR! 🤔',
        text: `<b>${result}</b> is a genuine squeeze — but Jarlath's sentence needs <b>could HAVE</b>, not <b>${currentPair.w1} have</b>. Feed COULD + HAVE and try again.`,
        img: COLIN_IMG,
      }).then(() => { if (alive) resetTray(); });
    }

    function doJam() {
      M.body.classList.add('csp-jam');
      sfx.thud();
      const jammedWord = currentPair.w1;
      later(() => {
        M.body.classList.remove('csp-jam');
        renderOutput(M.outSlot, '', false);
        settleLever(0, () => { leverBusy = false; });
        bubble(stage, {
          title: 'JAMMED! 🚨',
          text: `OF was NEVER in there! It's could HAVE! "${jammedWord} of" has never once come out of this press — <b>of never goes in, so it never comes out.</b>`,
          img: COLIN_IMG,
        }).then(() => { if (alive) resetTray(); });
      }, 480);
    }

    function doSqueezeSuccess() {
      const removed = SPLIT[currentPair.w2].removed;
      flyLetters(M.slotB, removed, 'csp-letter-out', later);
      M.hatch.classList.add('csp-hatch-pulse');
      sfx.pop();
      later(() => {
        M.hatch.classList.remove('csp-hatch-pulse');
        const result = squeezeWord(currentPair.w1, currentPair.w2);
        renderOutput(M.outSlot, result, true);
        sfx.drop();
        settleLever(0, () => { leverBusy = false; });
        if (!mission) { toast(stage, `${currentPair.w1} + ${currentPair.w2} → ${result}!`); return; }
        if (result === mission.target) finishMission();
        else showDecoy(result);
      }, 320);
    }

    function doRebel() {
      M.root.classList.add('csp-somersault');
      sfx.pop();
      later(() => {
        M.root.classList.remove('csp-somersault');
        renderOutput(M.outSlot, mission.target, true);
        sfx.sparkle();
        settleLever(0, () => { leverBusy = false; });
        toast(stage, "Some squeezes mangle the word completely — will + not becomes won't. Learn the rebels by heart!");
        finishMission();
      }, 650);
    }

    function doStretch() {
      sfx.tock();
      flyLetters(M.slotA, SPLIT[mission.w2].removed, 'csp-letter-in', later);
      M.hatch.classList.add('csp-hatch-pulse');
      later(() => {
        M.hatch.classList.remove('csp-hatch-pulse');
        renderOutput(M.outSlot, `${mission.w1} ${stretchWord(mission.w2)}`, false);
        sfx.drop();
        settleLever(0, () => { leverBusy = false; });
        finishMission();
      }, 340);
    }

    function runPress() {
      sfx.tick();
      M.tray.classList.add('csp-squish');
      later(() => {
        M.tray.classList.remove('csp-squish');
        const mode = mission ? mission.mode : 'squeeze';
        if (mode === 'rebel') { doRebel(); return; }
        if (mode === 'stretch') { doStretch(); return; }
        const result = squeezeWord(currentPair.w1, currentPair.w2);
        if (result === null) doJam();
        else doSqueezeSuccess();
      }, 380);
    }

    /* ---------- the lever (drag discipline: rules 1 & 4) ---------- */
    const leverDrag = makeDrag(handle, {
      enabled: () => alive && !leverBusy,
      onStart() {
        trackH = Math.max(40, track.clientHeight - handle.clientHeight);
        if (leverCancelTween) { leverCancelTween(); leverCancelTween = null; }
      },
      onMove(dx, dy) { setLeverY(Math.max(0, Math.min(trackH, dy))); },
      onEnd() {
        const pulled = leverY >= trackH * 0.6;
        if (!pulled) { settleLever(0); return; }
        if (mission && mission.mode === 'trap' && !currentPair) {
          toast(stage, 'Pick a pair first — feed the press!');
          settleLever(0);
          return;
        }
        leverBusy = true;
        settleLever(trackH, () => { runPress(); });
      },
    });

    resetBtn.addEventListener('click', () => {
      if (leverBusy) return;
      sfx.ui();
      start(mi);
    });

    const onResize = () => {
      leverDrag.abort();
      if (leverCancelTween) { leverCancelTween(); leverCancelTween = null; }
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
      // a cancelled mid-flight timer can strand a one-shot animation class —
      // clear them so the next press can retrigger its animation cleanly.
      M.tray.classList.remove('csp-squish');
      M.body.classList.remove('csp-jam');
      M.root.classList.remove('csp-somersault');
      M.hatch.classList.remove('csp-hatch-pulse');
      setLeverY(0);
      leverBusy = false;
    };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    start(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      if (leverCancelTween) leverCancelTween();
      leverDrag.destroy();
      stage.remove();
      ruleCard.remove();
    };
  },
};

/* ---------- scoped styles (prefix csp-) ---------- */
const CSS = `
.csp-machine { max-width: 460px; margin: 0 auto; }
.csp-label { text-align: center; font-weight: 800; letter-spacing: .08em; font-size: 12px; color: var(--gold); margin-bottom: 8px; text-shadow: 0 2px 0 rgba(0,0,0,.4); }
.csp-body { position: relative; display: flex; flex-direction: column; align-items: center; gap: 12px; background: linear-gradient(180deg,#55555e,#3a3a42); border-radius: 18px; padding: 18px 12px; border: 3px solid #22222a; box-shadow: inset 0 3px 10px rgba(0,0,0,.4), 0 6px 0 rgba(0,0,0,.3); overflow: hidden; }
.csp-hatch { width: 36px; height: 24px; border-radius: 10px 10px 4px 4px; background: linear-gradient(180deg,#2b2b30,#111114); border: 2px solid var(--gold-deep); display: flex; align-items: center; justify-content: center; color: var(--gold); font-weight: 800; font-size: 15px; transition: none; }
.csp-hatch-pulse { animation: cspHatchPulse .4s ease; }
@keyframes cspHatchPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.3); box-shadow: 0 0 12px var(--gold); } }
.csp-tray { display: flex; align-items: center; gap: 10px; }
.csp-tray.csp-tray-single .csp-plus, .csp-tray.csp-tray-single .csp-slot:last-child { display: none; }
.csp-slot { position: relative; min-width: 74px; min-height: 44px; padding: 8px 12px; background: var(--card); border: 3px solid var(--ink); border-radius: 12px; font-weight: 800; font-size: clamp(14px,2.6vw,18px); color: var(--ink); text-align: center; box-shadow: 0 3px 0 rgba(0,0,0,.35); }
.csp-plus { color: var(--gold); font-weight: 900; font-size: 20px; }
.csp-tray.csp-squish { animation: cspSquish .38s ease; }
@keyframes cspSquish { 0% { transform: scaleY(1); } 45% { transform: scaleY(.6); } 75% { transform: scaleY(1.08); } 100% { transform: scaleY(1); } }
.csp-letter-out { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-weight: 800; color: var(--wrong); font-size: 16px; pointer-events: none; animation: cspFlyOut .7s ease-out both; }
@keyframes cspFlyOut { 0% { transform: translate(-50%,-50%) scale(1); opacity: 1; } 100% { transform: translate(-50%,-160%) scale(.6) rotate(18deg); opacity: 0; } }
.csp-letter-in { position: absolute; top: -26px; left: 50%; transform: translate(-50%,0); font-weight: 800; color: var(--correct); font-size: 16px; pointer-events: none; animation: cspFlyIn .55s ease-in both; }
@keyframes cspFlyIn { 0% { transform: translate(-50%,-24px) scale(.4); opacity: 0; } 70% { transform: translate(-50%,4px) scale(1.15); opacity: 1; } 100% { transform: translate(-50%,0) scale(1); opacity: 1; } }
.csp-outwrap { width: 100%; display: flex; justify-content: center; }
.csp-output { position: relative; min-width: 160px; min-height: 52px; padding: 10px 18px; background: #101014; border-radius: 12px; border: 3px solid var(--gold-deep); display: flex; align-items: center; justify-content: center; box-shadow: inset 0 3px 10px rgba(0,0,0,.6); }
.csp-output span { font-weight: 800; font-size: clamp(20px,4vw,28px); color: var(--stink-lime); }
.csp-output .csp-ph { color: #5a5a63; font-weight: 600; }
.csp-apo { color: var(--gold); }
.csp-apo-drop { display: inline-block; animation: cspApoDrop .4s ease-out both; }
@keyframes cspApoDrop { 0% { transform: translateY(-16px); opacity: 0; } 60% { transform: translateY(3px); opacity: 1; } 100% { transform: translateY(0); opacity: 1; } }
.csp-pop { animation: cspPop .32s var(--spring) both; }
@keyframes cspPop { 0% { transform: scale(.7); } 100% { transform: scale(1); } }
.csp-jam { animation: cspJamShake .48s ease; }
@keyframes cspJamShake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-8px); } 40% { transform: translateX(7px); } 60% { transform: translateX(-5px); } 80% { transform: translateX(4px); } }
.csp-jam::after { content: ''; position: absolute; inset: 0; border-radius: 16px; background: var(--wrong); opacity: 0; animation: cspJamFlash .48s ease; pointer-events: none; }
@keyframes cspJamFlash { 0%,100% { opacity: 0; } 25%,75% { opacity: .35; } 50% { opacity: .55; } }
.csp-somersault { animation: cspSomersault .65s ease; transform-origin: 50% 50%; }
@keyframes cspSomersault { 0% { transform: rotate(0); } 50% { transform: rotate(180deg) scale(.92); } 100% { transform: rotate(360deg); } }
.csp-optrow { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-top: 10px; min-height: 1px; }
.csp-leverwrap { display: flex; flex-direction: column; align-items: center; gap: 4px; margin-top: 14px; }
.csp-track { position: relative; width: 46px; height: 108px; background: linear-gradient(180deg,#2b2b30,#1a1a1e); border-radius: 23px; border: 3px solid #111; box-shadow: inset 0 3px 8px rgba(0,0,0,.6); touch-action: none; }
.csp-handle { position: absolute; top: 0; left: 50%; width: 54px; height: 54px; margin-left: -27px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #ff6b5e, #c0392b); border: 3px solid #7a1e14; box-shadow: 0 4px 0 rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; font-size: 20px; color: #fff; cursor: grab; touch-action: none; will-change: transform; }
.csp-leverlabel { font-size: 11px; font-weight: 800; letter-spacing: .1em; color: var(--gold); }
.csp-win { margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF); border: 3px solid var(--correct); border-radius: 14px; padding: 10px 14px; animation: animBubbleIn .34s var(--spring) both; }
.csp-wp { font-weight: 700; color: #1d8f4e; font-size: 16px; }
.csp-wk { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 2px; }
.csp-rulecard { margin-top: 12px; font-size: 13.5px; line-height: 1.35; background: linear-gradient(180deg,#FFF3CE,#FBE29A); border: 3px solid var(--gold-deep); border-radius: 14px; padding: 10px 14px; color: #5a4408; font-weight: 700; }
`;
