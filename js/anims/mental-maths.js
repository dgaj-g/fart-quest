// FART QUEST — js/anims/mental-maths.js
// THE TEN-FRIEND TRAMPOLINE — Splatrick the Swift bounces along a number
// line: tap the ten-friend to land the first hop, then tap the answer to
// land the second. Two neat jumps beat one clumsy leap.

import { el, sfx, tween, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const SPLATRICK_IMG = 'assets/monsters/splatrick-the-swift.png';
const RULE = 'Jump to the nearest TEN first, then jump the rest.';

/* ---------- pure jump-logic engine (unit-tested; do not "improve") ----------
   phase: 'first' (needs the ten-friend hop) -> 'second' (needs the final hop)
   -> 'done'. tapLogic never mutates anything — the caller decides what a
   verdict means for the DOM. */
function buildMission(start, op, amount) {
  const dir = op === '+' ? 1 : -1;
  const target = start + dir * amount;
  const friend = dir === 1 ? Math.ceil(start / 10) * 10 : Math.floor(start / 10) * 10;
  const amt1 = Math.abs(friend - start);
  const amt2 = Math.abs(target - friend);
  const lo = Math.min(start, friend, target) - 3;
  const hi = Math.max(start, friend, target) + 3;
  const sign = dir === 1 ? '+' : '−';
  const worked = `${start} ${sign} ${amt1} = ${friend} (ten-friend!). Then ${friend} ${sign} ${amt2} = ${target}. `
    + `So ${start} ${op} ${amount} = ${target}.`;
  return { start, op, amount, dir, target, friend, amt1, amt2, lo, hi, worked };
}
function tapLogic(mission, phase, num) {
  if (phase === 'first') {
    if (num === mission.friend) return { type: 'jump1' };
    if (num === mission.target) return { type: 'wobble' };
    return { type: 'miss' };
  }
  if (phase === 'second') {
    if (num === mission.target) return { type: 'jump2' };
    return { type: 'miss' };
  }
  return { type: 'miss' };
}

/* ---------- content ---------- */
const MISSIONS = [
  { id: 'a', ...buildMission(36, '+', 7) },
  { id: 'b', ...buildMission(58, '+', 6) },
  { id: 'c', ...buildMission(42, '-', 5) },
  { id: 'd', ...buildMission(63, '-', 7) },
];
const SANDBOX = [
  { label: '24 + 8', ...buildMission(24, '+', 8) },
  { label: '47 + 5', ...buildMission(47, '+', 5) },
  { label: '61 − 9', ...buildMission(61, '-', 9) },
  { label: '33 − 6', ...buildMission(33, '-', 6) },
];
const WIN_PHRASES = ['TRAMPOLINE-TASTIC! 🚀', 'TWO NEAT HOPS! ✨', 'SPLATRICK IS PROUD!', 'ZERO EFFORT, FULL SPEED!'];

const ARC_H = 96;   // svg region above the baseline
const TICK_H = 54;  // tick row below the baseline
const BASE_Y = ARC_H - 10;

/* ---------- the number-line widget ---------- */
function makeLine(host, mission, opts) {
  const L = {
    W: 0, lo: mission.lo, hi: mission.hi, phase: 'first', tokenNum: mission.start,
    busy: false, alive: true, cancelTween: null, doneArcs: [], gen: 0,
  };
  const wrap = el('div', 'tft-wrap');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'tft-svg');
  const rail = el('div', 'tft-rail');
  const ticks = el('div', 'tft-ticks');
  const token = el('div', 'tft-token', `<img src="${SPLATRICK_IMG}" alt="">`);
  wrap.append(svg, rail, ticks, token);
  host.append(wrap);

  const num2x = (num) => (num - L.lo) * L.W + L.W / 2;
  const setTokenXY = (x, y) => { token.style.left = x + 'px'; token.style.top = y + 'px'; };
  const bez = (x0, x1, t) => {
    const midX = (x0 + x1) / 2;
    const dist = Math.abs(x1 - x0);
    const peak = Math.min(80, Math.max(30, 26 + dist * 0.55));
    const peakY = BASE_Y - peak;
    const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * midX + t * t * x1;
    const y = (1 - t) * (1 - t) * BASE_Y + 2 * (1 - t) * t * peakY + t * t * BASE_Y;
    return { x, y, midX, peakY };
  };

  function drawArcEl(x0, x1, revealT) {
    const { midX, peakY } = bez(x0, x1, 0.5);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${x0} ${BASE_Y} Q ${midX} ${peakY} ${x1} ${BASE_Y}`);
    path.setAttribute('class', 'tft-arc');
    path.setAttribute('pathLength', '1');
    path.style.strokeDasharray = '1';
    path.style.strokeDashoffset = String(1 - revealT);
    svg.appendChild(path);
    return path;
  }
  function drawLabel(x0, x1, text) {
    const { midX, peakY } = bez(x0, x1, 0.5);
    const lab = el('div', 'tft-arclabel', text);
    lab.style.left = midX + 'px';
    lab.style.top = (peakY - 6) + 'px';
    wrap.appendChild(lab);
    return lab;
  }

  function redrawDone() {
    svg.querySelectorAll('.tft-arc').forEach((n) => n.remove());
    wrap.querySelectorAll('.tft-arclabel').forEach((n) => n.remove());
    L.doneArcs.forEach((a) => { drawArcEl(num2x(a.from), num2x(a.to), 1); drawLabel(num2x(a.from), num2x(a.to), a.label); });
  }

  L.layout = function layout() {
    // relayout abandons ANY live interaction — including the async gap between
    // the wobble landing and its bubble being dismissed, where no tween is
    // actively running but a stale pixel-position closure is still pending.
    L.gen += 1;
    if (L.cancelTween) { L.cancelTween(); L.cancelTween = null; }
    L.busy = false;
    token.classList.remove('tft-wobbling', 'tft-shake');
    const n = L.hi - L.lo + 1;
    const avail = Math.min(900, (host.clientWidth || 640) - 20);
    L.W = Math.max(34, Math.min(64, Math.floor(avail / n)));
    const totalW = L.W * n;
    wrap.style.width = totalW + 'px';
    svg.setAttribute('viewBox', `0 0 ${totalW} ${ARC_H}`);
    svg.setAttribute('width', totalW); svg.setAttribute('height', ARC_H);
    rail.style.width = totalW + 'px'; rail.style.top = BASE_Y + 'px';
    ticks.innerHTML = ''; ticks.style.width = totalW + 'px';
    for (let num = L.lo; num <= L.hi; num += 1) {
      const b = el('button', 'tft-tick' + (num === mission.start ? ' tft-start' : ''));
      b.style.left = num2x(num) + 'px'; b.style.width = L.W + 'px';
      b.innerHTML = `<span class="tft-dot"></span><span class="tft-lbl">${num}</span>`;
      b.setAttribute('aria-label', 'land on ' + num);
      b.addEventListener('click', () => onTap(num));
      ticks.append(b);
    }
    redrawDone();
    const x = num2x(L.tokenNum);
    setTokenXY(x - 27, BASE_Y - 46);
  };

  function onTap(num) {
    if (!L.alive || L.busy || L.phase === 'done') return;
    const res = tapLogic(mission, L.phase, num);
    if (res.type === 'miss') { opts.onMiss(num, L.phase, L.tokenNum); return; }
    if (res.type === 'wobble') { doWobble(num); return; }
    if (res.type === 'jump1') { doJump(mission.start, mission.friend, mission.amt1, 'second', () => opts.onJump1()); return; }
    if (res.type === 'jump2') { doJump(mission.friend, mission.target, mission.amt2, 'done', () => opts.onJump2()); return; }
  }

  function doJump(fromNum, toNum, amt, nextPhase, done) {
    L.busy = true;
    const x0 = num2x(fromNum); const x1 = num2x(toNum);
    const live = drawArcEl(x0, x1, 0);
    const rising = toNum > fromNum;
    (rising ? sfx.tick : sfx.tock)(amt);
    L.cancelTween = tween((t) => {
      const { x, y } = bez(x0, x1, t);
      setTokenXY(x - 27, y - 46);
      live.style.strokeDashoffset = String(1 - t);
    }, 0, 1, 520, () => {
      L.cancelTween = null; L.busy = false; L.phase = nextPhase; L.tokenNum = toNum;
      const sign = mission.dir === 1 ? '+' : '−';
      L.doneArcs.push({ from: fromNum, to: toNum, label: `${sign}${amt}` });
      redrawDone();
      sfx.pop();
      if (done) done();
    });
  }

  function doWobble(num) {
    L.busy = true;
    const myGen = L.gen; // guards the async bubble-wait gap below (no tween runs
    // during it, so layout()'s tween-cancel alone can't abandon this interaction)
    const x0 = num2x(mission.start); const x1 = num2x(num);
    token.classList.add('tft-wobbling');
    sfx.tick(2);
    L.cancelTween = tween((t) => {
      const { x, y } = bez(x0, x1, t);
      setTokenXY(x - 27, y - 46);
    }, 0, 1, 460, () => {
      L.cancelTween = null;
      sfx.thud();
      token.classList.add('tft-shake');
      opts.onWobble(() => {
        if (!L.alive || L.gen !== myGen) return; // a resize already reset this interaction
        token.classList.remove('tft-shake', 'tft-wobbling');
        L.cancelTween = tween((t) => {
          const { x } = bez(x1, x0, t);
          setTokenXY(x - 27, BASE_Y - 46);
        }, 0, 1, 380, () => {
          L.cancelTween = null; L.busy = false;
          setTokenXY(x0 - 27, BASE_Y - 46);
        });
      });
    });
  }

  L.reset = function reset() {
    if (L.cancelTween) { L.cancelTween(); L.cancelTween = null; }
    token.classList.remove('tft-shake', 'tft-wobbling');
    L.busy = false; L.phase = 'first'; L.tokenNum = mission.start; L.doneArcs = [];
    L.layout();
  };
  L.tokenCenter = function tokenCenter() {
    const r = token.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  L.destroy = function destroy() { L.alive = false; if (L.cancelTween) L.cancelTween(); wrap.remove(); };

  L.layout();
  return L;
}

/* ---------- the anim card ---------- */
export default {
  id: 'mental-maths',
  title: 'THE TEN-FRIEND TRAMPOLINE',

  mount(host, ctx) {
    let alive = true;
    let line = null;
    let mi = 0; // MISSIONS.length index === sandbox
    let sb = 0; // sandbox pick index
    const doneSet = new Set();

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const sbrow = el('div', 'anim-chiprow');
    const q = el('div', 'tft-q');
    const qsub = el('div', 'tft-qsub');
    const lineHost = el('div');
    const stepsRow = el('div', 'tft-steps');
    const step1 = el('div', 'tft-step', '···');
    const step2 = el('div', 'tft-step', '···');
    stepsRow.append(step1, step2);
    const winBox = el('div');
    const controls = el('div', 'anim-controls');
    const reset = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(reset);
    stage.append(chiprow, sbrow, q, qsub, lineHost, stepsRow, winBox, controls);
    host.append(stage);

    const ruleCard = el('div', 'tft-rulecard', RULE);
    host.append(ruleCard);

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const label = `${m.start} ${m.op} ${m.amount}`;
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), label);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
      const fp = el('button', 'anim-mchip' + (mi === MISSIONS.length ? ' active' : ''), 'FREE PLAY 🎮');
      fp.addEventListener('click', () => { sfx.ui(); start(MISSIONS.length); });
      chiprow.append(fp);
    }
    function paintSandboxRow() {
      sbrow.innerHTML = '';
      if (mi !== MISSIONS.length) { sbrow.style.display = 'none'; return; }
      sbrow.style.display = '';
      SANDBOX.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === sb ? ' active' : ''), m.label);
        c.addEventListener('click', () => { sfx.ui(); sb = i; paintSandboxRow(); buildLine(SANDBOX[sb]); });
        sbrow.append(c);
      });
    }

    function setQuestion(m) {
      const sign = m.op === '+' ? '+' : '−';
      q.innerHTML = `${m.start} <span class="op">${sign} ${m.amount}</span> = ?`;
    }
    function setSub(phase) {
      // rule 2: this text only ever describes the phase that is TRUE right now.
      if (phase === 'first') qsub.textContent = 'Tap where the FIRST jump should land.';
      else if (phase === 'second') qsub.textContent = 'Ten-friend reached! Now tap where the SECOND jump should land.';
      else qsub.textContent = 'Both jumps stuck the landing!';
    }
    function resetSteps() {
      step1.textContent = '···'; step1.classList.remove('filled');
      step2.textContent = '···'; step2.classList.remove('filled');
    }

    function start(i) {
      mi = i; winBox.innerHTML = '';
      const sandbox = i === MISSIONS.length;
      buildLine(sandbox ? SANDBOX[sb] : MISSIONS[i]);
      paintChips(); paintSandboxRow();
    }

    function buildLine(m) {
      if (line) { line.destroy(); line = null; }
      setQuestion(m); setSub('first'); resetSteps();
      line = makeLine(lineHost, m, {
        onMiss(num, phase, tokenNum) {
          if (!alive) return;
          sfx.nudge();
          if (phase === 'first' && m.dir === -1 && num > tokenNum) {
            toast(stage, 'Jumps here go DOWN the line — try a smaller number!');
          } else if (phase === 'first' && m.dir === 1 && num < tokenNum) {
            toast(stage, 'Jumps here go UP the line — try a bigger number!');
          } else if (phase === 'first') {
            toast(stage, 'Not a landing spot — look for Splatrick’s TEN-FRIEND!');
          } else {
            toast(stage, 'Not quite — count on from the ten-friend to land exactly on the answer.');
          }
        },
        onWobble(finish) {
          if (!alive) return;
          bubble(stage, {
            title: 'ONE CLUMSY HOP! 😵‍💫',
            text: 'Splatrick leapt straight there in one giant wobble! <b>Two neat jumps beat one clumsy hop</b> — every time. Watch him hop back, then land the ten-friend first.',
            img: SPLATRICK_IMG,
          }).then(finish); // finish() itself no-ops if this line's own gen/alive moved on
        },
        onJump1() {
          if (!alive) return;
          setSub('second');
          const sign = m.op === '+' ? '+' : '−';
          step1.textContent = `${m.start} ${sign} ${m.amt1} = ${m.friend}`;
          step1.classList.add('filled');
        },
        onJump2() {
          if (!alive) return;
          setSub('done');
          const sign = m.op === '+' ? '+' : '−';
          step2.textContent = `${m.friend} ${sign} ${m.amt2} = ${m.target}`;
          step2.classList.add('filled');
          const c = line.tokenCenter(); const sr = stage.getBoundingClientRect();
          sparkleBurst(stage, c.x - sr.left, c.y - sr.top, 12);
          win(m);
        },
      });
    }

    reset.addEventListener('click', () => { sfx.ui(); if (line) { line.reset(); setSub('first'); resetSteps(); winBox.innerHTML = ''; } });

    function win(m) {
      const isMission = mi < MISSIONS.length;
      if (isMission) doneSet.add(m.id);
      sfx.win(); party(stage); paintChips();
      winBox.innerHTML = '';
      const sign = m.op === '+' ? '+' : '−';
      const w = el('div', 'tft-win',
        `<div class="wp">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]} &nbsp; ${m.start} ${sign} ${m.amount} = <b>${m.target}</b></div>`
        + `<div class="wk">${m.worked}</div>`);
      winBox.append(w);
      if (isMission) {
        if (doneSet.size === MISSIONS.length) ctx.complete();
        const nextIdx = MISSIONS.findIndex((mm) => !doneSet.has(mm.id));
        const nb = el('button', 'btn btn-gold', nextIdx !== -1 ? 'NEXT ONE ➡' : 'FREE PLAY 🎮');
        nb.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
        nb.addEventListener('click', () => { sfx.ui(); start(nextIdx !== -1 ? nextIdx : MISSIONS.length); });
        w.append(nb);
      } else {
        const nb = el('button', 'btn btn-gold', 'ANOTHER ONE ➡');
        nb.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
        nb.addEventListener('click', () => { sfx.ui(); sb = (sb + 1) % SANDBOX.length; paintSandboxRow(); buildLine(SANDBOX[sb]); });
        w.append(nb);
      }
    }

    const onResize = () => { if (line) line.layout(); };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    start(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      if (line) line.destroy();
      stage.remove();
      ruleCard.remove();
    };
  },
};

const CSS = `
.tft-q { text-align: center; font-weight: 700; font-size: clamp(20px, 3.4vw, 30px); margin-bottom: 2px; }
.tft-q .op { color: var(--stink); }
.tft-qsub { text-align: center; font-size: 12.5px; color: #6b5744; font-weight: 500; margin-bottom: 10px; min-height: 16px; }
.tft-wrap { position: relative; margin: 0 auto ${TICK_H}px; height: ${ARC_H}px; touch-action: none; }
.tft-svg { position: absolute; left: 0; top: 0; pointer-events: none; overflow: visible; }
.tft-arc { fill: none; stroke: var(--swamp-glow); stroke-width: 3.5; stroke-linecap: round; }
.tft-arclabel {
  position: absolute; transform: translate(-50%, -100%); background: var(--swamp-mid);
  color: var(--stink-lime); font-weight: 700; font-size: 12.5px; padding: 2px 8px;
  border-radius: 999px; white-space: nowrap; box-shadow: 0 2px 0 rgba(0,0,0,.25); pointer-events: none;
}
.tft-rail { position: absolute; left: 0; height: 3px; background: rgba(51,38,29,.25); border-radius: 2px; }
.tft-ticks { position: absolute; left: 0; top: ${ARC_H}px; height: ${TICK_H}px; }
.tft-tick {
  position: absolute; top: 0; height: ${TICK_H}px; background: none; border: none; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; padding-top: 2px; min-height: 44px;
}
.tft-tick .tft-dot { width: 11px; height: 11px; border-radius: 50%; background: var(--card); border: 2.5px solid var(--swamp-mid); }
.tft-tick .tft-lbl { font-size: 11.5px; font-weight: 700; color: var(--ink); margin-top: 4px; }
.tft-tick:active .tft-dot { background: var(--gold); }
.tft-tick.tft-start .tft-dot { background: var(--gold); border-color: var(--gold-deep); }
.tft-token {
  position: absolute; width: 54px; height: 54px; pointer-events: none; z-index: 5;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,.3));
}
.tft-token img { width: 100%; height: 100%; object-fit: contain; }
.tft-token.tft-wobbling { animation: tftWobbleSpin .46s ease-in-out; }
@keyframes tftWobbleSpin { 0%,100% { transform: rotate(0deg); } 30% { transform: rotate(-16deg); } 65% { transform: rotate(12deg); } }
.tft-token.tft-shake { animation: tftShake .4s ease; }
@keyframes tftShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px) rotate(-6deg); } 75% { transform: translateX(6px) rotate(6deg); } }
.tft-steps { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 4px; flex-wrap: wrap; }
.tft-step {
  background: var(--swamp-mid); color: #9fb39f; border-radius: 12px; padding: 9px 15px;
  font-weight: 700; font-size: clamp(13px, 2vw, 15px); box-shadow: 0 3px 0 rgba(0,0,0,.3);
  min-width: 150px; text-align: center; transition: color .2s;
}
.tft-step.filled { color: var(--stink-lime); }
.tft-win {
  margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF);
  border: 3px solid var(--correct); border-radius: 14px; padding: 10px 14px;
}
.tft-win .wp { font-weight: 700; color: #1d8f4e; font-size: 16px; }
.tft-win .wk { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 2px; }
.tft-rulecard {
  margin-top: 12px; font-size: 13.5px; line-height: 1.35; background: linear-gradient(180deg,#FFF3CE,#FBE29A);
  border: 3px solid var(--gold-deep); border-radius: 14px; padding: 10px 14px; color: #5a4408;
  font-weight: 700; max-width: 980px; margin-left: auto; margin-right: auto;
}
`;
injectCss('mental-maths', CSS);
