// FART QUEST — js/anims/machines-mystery.js
// BERTHA'S REVERSE LEVER — a two-window number machine the child feeds
// FORWARDS once to learn the mechanism, then must run BACKWARDS to solve
// Backwards Bertha's mystery: pull the lever, watch it flip, then re-set
// each window with the OPPOSITE operation, LAST original step first.

import { el, sfx, tween, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const BERTHA_IMG = 'assets/monsters/backwards-bertha.png';
const RULE = 'To find what went IN, run the machine BACKWARDS: undo each step with its opposite.';

/* ---------- pure machine engine (verified against every guided mission —
   see the mission comments for the worked check; do not "improve") ---------- */
function applyOp(v, op, val) {
  if (op === '+') return v + val;
  if (op === '−') return v - val;
  if (op === '×') return v * val;
  return v / val; // ÷
}
function invert(step) {
  const OPP = { '+': '−', '−': '+', '×': '÷', '÷': '×' };
  return { op: OPP[step.op], val: step.val };
}
function opLabel(step) { return `${step.op} ${step.val}`; }
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
// each window's chip trio: the true inverse, the un-flipped original op
// ("forgot to flip it"), and the correct op-type with a borrowed wrong
// number ("right idea, wrong number"). Verified: 5→16 (+3,×2), 5→18 (×4,−2),
// 15→27 (+12) — see /tmp verify script run during build.
function buildChips(win) {
  const correct = invert(win.fwd);
  return shuffle([
    { op: correct.op, val: correct.val, kind: 'correct' },
    { op: win.fwd.op, val: win.fwd.val, kind: 'sameop' },
    { op: correct.op, val: win.wrongVal, kind: 'wrongnum' },
  ]);
}

/* ---------- content ---------- */
const MISSIONS = [
  {
    id: 'm1', letter: false,
    steps: [{ op: '+', val: 3 }, { op: '×', val: 2 }],
    outVal: 16, inVal: 5,
    windows: [
      { fwd: { op: '×', val: 2 }, wrongVal: 3 },
      { fwd: { op: '+', val: 3 }, wrongVal: 2 },
    ],
    worked: 'Undo × 2 first: 16 ÷ 2 = 8. Then undo + 3: 8 − 3 = 5. IN was <b>5</b>. Check it forwards: 5 + 3 = 8, then 8 × 2 = 16 ✓',
  },
  {
    id: 'm2', letter: false,
    steps: [{ op: '×', val: 4 }, { op: '−', val: 2 }],
    outVal: 18, inVal: 5,
    windows: [
      { fwd: { op: '−', val: 2 }, wrongVal: 4 },
      { fwd: { op: '×', val: 4 }, wrongVal: 2 },
    ],
    worked: 'Undo − 2 first: 18 + 2 = 20. Then undo × 4: 20 ÷ 4 = 5. IN was <b>5</b>. Check it forwards: 5 × 4 = 20, then 20 − 2 = 18 ✓',
  },
  {
    id: 'm3', letter: true, letterName: 'a',
    steps: [{ op: '+', val: 12 }],
    outVal: 27, inVal: 15,
    windows: [
      { fwd: { op: '+', val: 12 }, wrongVal: 13 },
    ],
    worked: 'Undo + 12: 27 − 12 = 15. So <b>a = 15</b>. Check it forwards: 15 + 12 = 27 ✓',
  },
];
const WIN_PHRASES = ['LEVER PULLED, MYSTERY SOLVED! 🔴', 'BERTHA CAN\'T FOOL YOU! 🎩', 'REVERSED PERFECTLY! ⚙️', 'BACKWARDS AND BRILLIANT! 💨'];

function questionStem(m) {
  if (m.letter) {
    const s = m.steps[0];
    return `<b>${m.letterName} ${s.op} ${s.val} = ${m.outVal}</b>. What is <b>${m.letterName}</b>?`;
  }
  const chain = m.steps.map(opLabel).join(' then ');
  return `${chain} &nbsp;→&nbsp; OUT = <b>${m.outVal}</b>. What went IN?`;
}
function introStem(m) {
  const chain = m.steps.map(opLabel).join(' then ');
  return `IN = <b>${m.inVal}</b> &nbsp;→&nbsp; ${chain} &nbsp;→&nbsp; OUT = ?`;
}
function chipLabel(m) {
  if (m.letter) return `${m.letterName}+${m.steps[0].val}=${m.outVal}`;
  return `${m.steps.map((s) => s.op + s.val).join(',')}→${m.outVal}`;
}

/* ---------- the anim card ---------- */
export default {
  id: 'machines-mystery',
  title: "BERTHA'S REVERSE LEVER",

  mount(host, ctx) {
    let alive = true;
    let mi = 0;
    let mission = MISSIONS[0];
    let phase = 'ready'; // 'intro' | 'ready' | 'flip' | 'solving' | 'done'
    let activeWin = 0;
    let tokenVal = 0;
    let posEls = [];
    let busy = false;
    let cancelTok = null;
    let pendingFinish = null; // completion logic for the in-flight token tween, if any
    let flipTimers = [];
    let introTimer = null;
    let introDone = false;
    let letterBubbleShown = false;
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'brl-q');
    const qsub = el('div', 'brl-qsub');
    const machine = el('div', 'brl-machine');
    const row = el('div', 'brl-row');
    const token = el('div', 'brl-token', '<span class="brl-tokval"></span>');
    machine.append(row, token);
    const leverRow = el('div', 'brl-leverrow');
    const lever = el('button', 'brl-lever', '🔴 PULL THE REVERSE LEVER');
    leverRow.append(lever);
    const chipsRow = el('div', 'anim-chiprow brl-chips');
    const winBox = el('div');
    const controls = el('div', 'anim-controls');
    const runBtn = el('button', 'btn btn-gold', 'RUN IT ▶');
    const resetBtn = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(runBtn, resetBtn);
    stage.append(chiprow, q, qsub, machine, leverRow, chipsRow, winBox, controls);
    host.append(stage);

    const ruleCard = el('div', 'brl-rulecard', RULE);
    host.append(ruleCard);

    /* ---------- small DOM builders ---------- */
    function slotEl(label, text, cls) {
      const s = el('div', 'brl-slot' + (cls ? ' ' + cls : ''));
      s.append(el('div', 'brl-slotlabel', label), el('div', 'brl-slotval', text));
      return s;
    }
    function windowEl(mode, fwdLabel, bigText, cls) {
      const w = el('div', 'brl-window' + (cls ? ' ' + cls : ''));
      if (mode === 'reverse') w.append(el('div', 'brl-was', 'was ' + fwdLabel));
      w.append(el('div', 'brl-big', bigText));
      return w;
    }
    function arrowEl() { return el('div', 'brl-arrow', '→'); }

    function centerX(elem) {
      const mRect = machine.getBoundingClientRect();
      const eRect = elem.getBoundingClientRect();
      return (eRect.left - mRect.left) + eRect.width / 2;
    }
    function positionTokenInstant(idx, val) {
      if (cancelTok) { cancelTok(); cancelTok = null; }
      pendingFinish = null;
      if (val !== undefined) tokenVal = val;
      token.querySelector('.brl-tokval').textContent = String(tokenVal);
      token.style.left = centerX(posEls[idx]) + 'px';
      token.style.opacity = '1';
    }
    function animateTokenTo(idx, newVal, cb) {
      const fromX = parseFloat(token.style.left) || 0;
      const toX = centerX(posEls[idx]);
      (newVal >= tokenVal ? sfx.tick : sfx.tock)(1);
      const finish = () => {
        pendingFinish = null;
        cancelTok = null;
        if (!alive) return;
        tokenVal = newVal;
        token.querySelector('.brl-tokval').textContent = String(tokenVal);
        sfx.pop();
        if (cb) cb();
      };
      pendingFinish = finish;
      cancelTok = tween((x) => { token.style.left = x + 'px'; }, fromX, toX, 480, finish);
    }

    /* ---------- layout builders per phase ---------- */
    function buildForwardDOM(kind) {
      row.innerHTML = ''; posEls = [];
      const inKnown = kind === 'intro';
      const outKnown = kind === 'ready';
      const inLabel = mission.letter ? mission.letterName : 'IN';
      const inSlot = slotEl(inLabel, inKnown ? String(mission.inVal) : '?', inKnown ? 'known' : 'unknown');
      row.append(inSlot); posEls.push(inSlot);
      mission.steps.forEach((s) => {
        row.append(arrowEl());
        const w = windowEl('forward', null, opLabel(s));
        row.append(w); posEls.push(w);
      });
      row.append(arrowEl());
      const outSlot = slotEl('OUT', outKnown ? String(mission.outVal) : '?', outKnown ? 'known' : 'unknown');
      row.append(outSlot); posEls.push(outSlot);
    }
    function buildReverseDOM() {
      row.innerHTML = ''; posEls = [];
      const outSlot = slotEl('OUT', String(mission.outVal), 'known');
      row.append(outSlot); posEls.push(outSlot);
      mission.windows.forEach((w, idx) => {
        row.append(arrowEl());
        const state = w.solved ? 'solved' : (idx === activeWin ? 'active' : 'locked');
        const bigText = w.solved ? opLabel(w.chosen) : '?';
        const winEl = windowEl('reverse', opLabel(w.fwd), bigText, 'brl-' + state);
        if (state === 'locked') {
          winEl.addEventListener('click', () => {
            if (!alive) return;
            sfx.nudge();
            toast(stage, '🔒 Undo the LAST step first — finish the window on the left!');
          });
        }
        row.append(winEl); posEls.push(winEl);
      });
      row.append(arrowEl());
      const inLabel = mission.letter ? mission.letterName : 'IN';
      const allSolved = mission.windows.every((w) => w.solved);
      const inSlot = slotEl(inLabel, allSolved ? String(mission.inVal) : '?', allSolved ? 'known' : 'unknown');
      row.append(inSlot); posEls.push(inSlot);
    }

    function showLever(v) { leverRow.classList.toggle('brl-hidden', !v); lever.disabled = false; lever.classList.remove('pulled'); }
    function showRunBtn(v) { runBtn.classList.toggle('brl-hidden', !v); runBtn.disabled = false; resetBtn.classList.toggle('brl-hidden', v); }
    function showChips(v) { chipsRow.classList.toggle('brl-hidden', !v); if (!v) chipsRow.innerHTML = ''; }

    function windowQsub() {
      const win = mission.windows[activeWin];
      const label = opLabel(win.fwd);
      if (mission.windows.length === 1) {
        return mission.letter
          ? `${mission.letterName} is just a number in disguise! Which operation undoes <b>${label}</b>?`
          : `Which operation undoes <b>${label}</b>?`;
      }
      return activeWin === 0
        ? `Bertha's machine flipped! Undo her LAST step first — which operation undoes <b>${label}</b>?`
        : `Now undo her FIRST step — which operation undoes <b>${label}</b>?`;
    }

    function renderChips() {
      chipsRow.innerHTML = '';
      const win = mission.windows[activeWin];
      buildChips(win).forEach((c) => {
        const btn = el('button', 'anim-mchip brl-chip', `${c.op} ${c.val}`);
        btn.addEventListener('click', () => onChipTap(win, c, btn));
        chipsRow.append(btn);
      });
      qsub.innerHTML = windowQsub();
    }

    function onChipTap(win, chip, btn) {
      if (!alive || busy || win.solved) return;
      if (chip.kind === 'correct') {
        busy = true;
        sfx.ui();
        win.solved = true; win.chosen = chip;
        buildReverseDOM();
        showChips(false);
        const newVal = applyOp(tokenVal, chip.op, chip.val);
        const winIdx = activeWin + 1; // posEls index of the window just solved
        animateTokenTo(winIdx, newVal, () => {
          if (!alive) return;
          activeWin += 1;
          if (activeWin >= mission.windows.length) {
            animateTokenTo(posEls.length - 1, newVal, () => { if (alive) finishMission(); });
          } else {
            busy = false;
            showChips(true);
            renderChips();
          }
        });
      } else {
        sfx.nudge();
        btn.classList.add('brl-shake');
        later(() => { if (btn.isConnected) btn.classList.remove('brl-shake'); }, 400);
        const msg = chip.kind === 'sameop'
          ? "That's the SAME operation Bertha's machine used FORWARDS — flip it to the OPPOSITE to undo it!"
          : `Right idea, different number — Bertha's step here was really <b>${opLabel(win.fwd)}</b>.`;
        toast(stage, msg);
      }
    }

    /* ---------- phase entry points ---------- */
    function enterIntro() {
      phase = 'intro';
      buildForwardDOM('intro');
      q.innerHTML = introStem(mission);
      qsub.textContent = "Watch what Bertha's machine does — tap RUN IT!";
      positionTokenInstant(0, mission.inVal);
      showLever(false); showChips(false); showRunBtn(true);
    }
    function enterReady() {
      phase = 'ready';
      mission.windows.forEach((w) => { w.solved = false; w.chosen = null; });
      activeWin = 0; busy = false;
      buildForwardDOM('ready');
      q.innerHTML = questionStem(mission);
      qsub.textContent = mission.letter
        ? `Pull the REVERSE LEVER to find out what ${mission.letterName} really is!`
        : 'Pull the REVERSE LEVER to send it backwards!';
      positionTokenInstant(posEls.length - 1, mission.outVal);
      showChips(false); showRunBtn(false); showLever(true);
      if (mission.letter && !letterBubbleShown) {
        letterBubbleShown = true;
        const scheduledForMi = mi; // guard: don't show this over a DIFFERENT mission
        later(() => {
          if (mi !== scheduledForMi) return;
          bubble(stage, {
            title: 'LETTERS IN DISGUISE 🎭',
            text: 'Sometimes the mystery IN number gets dressed up as a <b>letter</b> instead of a blank space. It’s still just a machine wearing a mask — the exact same rules apply!',
            img: BERTHA_IMG,
          });
        }, 350);
      }
    }
    function enterSolving() {
      phase = 'solving';
      activeWin = 0; busy = false;
      buildReverseDOM();
      positionTokenInstant(0, mission.outVal);
      showLever(false); showRunBtn(false); showChips(true);
      renderChips();
    }
    function finishMission() {
      phase = 'done';
      doneSet.add(mission.id);
      buildReverseDOM();
      showChips(false);
      sfx.win(); party(stage);
      const c = token.getBoundingClientRect(); const sr = stage.getBoundingClientRect();
      sparkleBurst(stage, c.left - sr.left + c.width / 2, c.top - sr.top + c.height / 2, 12);
      paintChips();
      qsub.textContent = 'Solved! Bertha never saw it coming.';
      const w = el('div', 'brl-win',
        `<div class="wp">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]}</div>`
        + `<div class="wk">${mission.worked}</div>`);
      winBox.innerHTML = ''; winBox.append(w);
      if (doneSet.size === MISSIONS.length) ctx.complete();
      const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
      const nb = el('button', 'btn btn-gold', nextIdx !== -1 ? 'NEXT ONE ➡' : 'PLAY AGAIN 🔁');
      nb.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
      nb.addEventListener('click', () => { sfx.ui(); startMission(nextIdx !== -1 ? nextIdx : 0); });
      w.append(nb);
      busy = false;
    }

    function runForwardChain() {
      let k = 0;
      const step = () => {
        if (!alive) return;
        if (k >= mission.steps.length) { revealOut(); return; }
        const s = mission.steps[k];
        const newVal = applyOp(tokenVal, s.op, s.val);
        animateTokenTo(k + 1, newVal, () => { k += 1; step(); });
      };
      step();
    }
    function revealOut() {
      const outSlot = posEls[posEls.length - 1];
      outSlot.querySelector('.brl-slotval').textContent = String(mission.outVal);
      outSlot.classList.remove('unknown'); outSlot.classList.add('known');
      sfx.sparkle(); party(stage, 10);
      qsub.textContent = "Bertha's turned it into a MYSTERY — now find the way back!";
      introTimer = setTimeout(() => {
        introTimer = null;
        if (!alive) return;
        introDone = true;
        busy = false;
        enterReady();
      }, 1400);
    }

    /* ---------- flip ---------- */
    function clearFlipTimers() { flipTimers.forEach((t) => clearTimeout(t)); flipTimers = []; machine.classList.remove('brl-flip'); }
    function pullLever() {
      if (phase !== 'ready' || busy) return;
      busy = true;
      phase = 'flip';
      sfx.whoosh();
      lever.disabled = true;
      lever.classList.add('pulled');
      machine.classList.add('brl-flip');
      flipTimers.push(setTimeout(() => { if (alive) enterSolving(); }, 220));
      flipTimers.push(setTimeout(() => { flipTimers = []; machine.classList.remove('brl-flip'); }, 440));
    }

    /* ---------- mission chips / controls ---------- */
    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip brl-topchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), chipLabel(m));
        c.addEventListener('click', () => { sfx.ui(); startMission(i); });
        chiprow.append(c);
      });
    }
    function startMission(i) {
      mi = i; mission = MISSIONS[i];
      if (cancelTok) { cancelTok(); cancelTok = null; }
      pendingFinish = null;
      clearFlipTimers();
      if (introTimer) { clearTimeout(introTimer); introTimer = null; }
      busy = false;
      winBox.innerHTML = '';
      paintChips();
      if (i === 0 && !introDone) enterIntro(); else enterReady();
    }

    runBtn.addEventListener('click', () => {
      if (busy || phase !== 'intro') return;
      busy = true;
      runBtn.disabled = true;
      sfx.ui();
      runForwardChain();
    });
    lever.addEventListener('click', () => { sfx.ui(); pullLever(); });
    resetBtn.addEventListener('click', () => { sfx.ui(); startMission(mi); });

    const onResize = () => {
      if (!alive) return;
      if (phase === 'solving' && pendingFinish) {
        // A correct-chip token tween was mid-flight: the window's DOM was already
        // committed to 'solved' synchronously in onChipTap, so merely cancelling the
        // tween (as we do for every other phase) would leave activeWin/tokenVal/chips
        // stuck at their pre-tween values with the chip tray hidden — an unrecoverable
        // soft-lock. Run the tween's own completion logic synchronously instead, so the
        // state transition (activeWin++, tokenVal update, next chips or finishMission)
        // still happens; only the animation itself is abandoned, per the resize contract.
        if (cancelTok) { cancelTok(); cancelTok = null; }
        const finish = pendingFinish;
        pendingFinish = null;
        finish();
        // if that didn't chain into a fresh tween (i.e. more windows remain), snap the
        // token to its correct rest position now that layout may have changed size
        if (!cancelTok && alive) {
          const idx = activeWin >= mission.windows.length ? posEls.length - 1 : activeWin;
          positionTokenInstant(idx, tokenVal);
        }
        return;
      }
      if (cancelTok) { cancelTok(); cancelTok = null; }
      pendingFinish = null;
      if (introTimer) { clearTimeout(introTimer); introTimer = null; introDone = true; }
      const wasFlipping = phase === 'flip';
      clearFlipTimers();
      if (wasFlipping) { enterSolving(); return; }
      if (phase === 'intro') {
        // abandon any in-flight forward-run tween/step chain so RUN IT never
        // stays stuck disabled after a mid-animation resize
        busy = false;
        buildForwardDOM('intro');
        positionTokenInstant(0, mission.inVal);
        showRunBtn(true);
        return;
      }
      if (phase === 'ready') { buildForwardDOM('ready'); positionTokenInstant(posEls.length - 1, mission.outVal); return; }
      if (phase === 'solving' || phase === 'done') {
        buildReverseDOM();
        const idx = activeWin >= mission.windows.length ? posEls.length - 1 : activeWin;
        positionTokenInstant(idx, tokenVal);
        busy = false;
      }
    };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    startMission(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      if (cancelTok) cancelTok();
      clearFlipTimers();
      if (introTimer) clearTimeout(introTimer);
      timers.forEach((t) => clearTimeout(t));
      stage.remove();
      ruleCard.remove();
    };
  },
};

const CSS = `
.brl-q { text-align: center; font-weight: 700; font-size: clamp(17px, 2.6vw, 23px); margin-bottom: 2px; }
.brl-qsub { text-align: center; font-size: 12.5px; color: #6b5744; font-weight: 500; margin-bottom: 8px; min-height: 16px; }
.brl-machine { position: relative; margin: 12px auto 6px; max-width: 900px; min-height: 92px; }
.brl-row { display: flex; align-items: stretch; justify-content: center; gap: clamp(3px, 1vw, 8px); flex-wrap: nowrap; }
.brl-slot, .brl-window {
  flex: 1 1 0; min-width: 50px; max-width: 150px; background: var(--card); border: 3px solid var(--swamp-mid);
  border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 8px 4px; box-shadow: 0 3px 0 rgba(0,0,0,.25); text-align: center;
}
.brl-slotlabel { font-size: 10px; font-weight: 700; color: #7c6247; letter-spacing: .08em; }
.brl-slotval { font-size: clamp(17px, 2.8vw, 24px); font-weight: 700; color: var(--ink); margin-top: 2px; }
.brl-slot.known .brl-slotval { color: #1d8f4e; }
.brl-slot.unknown .brl-slotval { color: var(--stink); }
.brl-window .brl-was { font-size: 9.5px; color: #a08c74; font-weight: 600; }
.brl-window .brl-big { font-size: clamp(16px, 2.6vw, 22px); font-weight: 700; color: var(--ink); margin-top: 2px; }
.brl-window.brl-active { border-color: var(--gold-deep); box-shadow: 0 0 0 4px rgba(244,197,66,.28), 0 3px 0 rgba(0,0,0,.25); animation: brlPulse 1.4s ease-in-out infinite; }
.brl-window.brl-locked { opacity: .5; cursor: pointer; }
.brl-window.brl-locked .brl-big::after { content: ' 🔒'; }
.brl-window.brl-solved { border-color: var(--correct); background: linear-gradient(180deg,#E9FBEF,#D3F3DF); }
.brl-window.brl-solved .brl-big { color: #1d8f4e; }
@keyframes brlPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
.brl-arrow { flex: 0 0 auto; font-size: 18px; color: #a08c74; align-self: center; }
.brl-token {
  position: absolute; top: 50%; width: 44px; height: 44px; transform: translate(-50%,-50%);
  background: var(--swamp-mid); border: 3px solid var(--stink-lime); border-radius: 50%;
  display: flex; align-items: center; justify-content: center; color: var(--stink-lime); font-weight: 700;
  font-size: 14.5px; box-shadow: 0 4px 6px rgba(0,0,0,.35); z-index: 6; pointer-events: none; opacity: 0;
}
.brl-machine.brl-flip .brl-row { animation: brlFlipSquish .43s ease; }
.brl-machine.brl-flip .brl-token { animation: brlTokenFade .43s ease; }
@keyframes brlFlipSquish { 0% { transform: scaleX(1); } 48%,52% { transform: scaleX(.04); } 100% { transform: scaleX(1); } }
@keyframes brlTokenFade { 0% { opacity: 1; } 40%,60% { opacity: 0; } 100% { opacity: 1; } }
.brl-leverrow { display: flex; justify-content: center; margin: 6px 0 4px; }
.brl-lever {
  background: linear-gradient(180deg,#e2453b,#b0281f); color: #fff; border: 3px solid #7a150f; border-radius: 16px;
  padding: 14px 24px; font-weight: 800; font-size: 14.5px; letter-spacing: .02em; box-shadow: 0 5px 0 #6b120c;
  cursor: pointer; min-height: 44px;
}
.brl-lever:active, .brl-lever.pulled { transform: translateY(4px); box-shadow: 0 1px 0 #6b120c; }
.brl-lever:disabled { opacity: .6; cursor: default; }
.brl-chips { margin-top: 4px; }
.brl-chip, .brl-topchip { min-height: 44px; } /* shared .anim-mchip's 42px falls under the 44px touch-target minimum */
.brl-chip.brl-shake { animation: brlShake .4s ease; }
@keyframes brlShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
.brl-hidden { display: none !important; }
.brl-win {
  margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF);
  border: 3px solid var(--correct); border-radius: 14px; padding: 10px 14px;
}
.brl-win .wp { font-weight: 700; color: #1d8f4e; font-size: 16px; }
.brl-win .wk { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 2px; }
.brl-rulecard {
  margin-top: 12px; font-size: 13.5px; line-height: 1.35; background: linear-gradient(180deg,#FFF3CE,#FBE29A);
  border: 3px solid var(--gold-deep); border-radius: 14px; padding: 10px 14px; color: #5a4408;
  font-weight: 700; max-width: 980px; margin-left: auto; margin-right: auto;
}
`;
injectCss('machines-mystery', CSS);
