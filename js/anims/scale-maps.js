// FART QUEST — js/anims/scale-maps.js
// THE SHRINKLER'S RAY — interactive scale-drawing machine for the scale-maps
// Scout Report. Structure and interaction discipline follow decimals-x10.js /
// perimeter.js (the house reference implementations).

import { el, sfx, tween, makeDrag, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const SHRINKLER_IMG = 'assets/monsters/the-shrinkler.png';
const RULE = 'Read the scale like a recipe: 1 cm means X in real life. Measure, then multiply.';

/* ---------- pure scale engine (unit-tested in scratch script — do not "improve") ---------- */
function growSteps(cm, factor) {
  const steps = [];
  for (let i = 1; i <= cm; i += 1) steps.push(i * factor);
  return steps;
}
function realTotal(cm, factor) { return cm * factor; }
function shrinkCm(real, factor) { return real / factor; }
function shrinkSteps(real, factor, cm) {
  const steps = [];
  for (let i = 1; i <= cm; i += 1) steps.push(real - i * factor);
  return steps;
}

/* ---------- content (numbers verified independently — see report) ---------- */
const DIAL_VALUES = [1, 2, 3, 4, 5, 10];
const MISSIONS = [
  {
    id: 'bridge1', mode: 'grow', obj: 'THE BRIDGE', chip: 'BRIDGE', icon: '🌉',
    cmLen: 6, factor: 4, real: 24,
    worked: '6 cm × 4 = 24 m — measure the drawing, then multiply by the scale.',
  },
  {
    id: 'bridge2', mode: 'redial', obj: 'THE BRIDGE', chip: 'REDIAL', icon: '🌉',
    cmLen: 6, fromFactor: 4, factor: 2, real: 12,
    worked: 'Same 6 cm drawing, new scale: 6 × 2 = 12 m — same drawing, different world!',
  },
  {
    id: 'path', mode: 'grow', obj: 'THE GARDEN PATH', chip: 'PATH', icon: '🚪', endIcon: '🏡',
    cmLen: 3, factor: 5, real: 15,
    worked: '3 cm × 5 = 15 m — measure the drawing, then multiply by the scale.',
  },
  {
    id: 'pond', mode: 'shrink', obj: "THE POND'S EDGE", chip: 'POND', icon: '🐸', endIcon: '🪷',
    cmLen: 5, factor: 4, real: 20, railMax: 8,
    worked: '20 m ÷ 4 = 5 cm — working backwards, divide instead of multiply.',
  },
];
const WIN_PHRASES = ['WHOMP! 💥', 'RAY FIRED TRUE!', 'THE SHRINKLER GRINS! 😏', 'RECIPE READ PERFECTLY!'];

/* ---------- the anim card ---------- */
export default {
  id: 'scale-maps',
  title: "THE SHRINKLER'S RAY",

  mount(host, ctx) {
    let alive = true;
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };
    const liveCancels = new Set();
    const runTween = (apply, from, to, dur, done) => {
      const c = tween(apply, from, to, dur, () => { liveCancels.delete(c); if (done) done(); });
      liveCancels.add(c);
      return c;
    };
    let introShown = false;

    injectCss('scale-maps', `
      .shr-q { text-align: center; font-weight: 700; font-size: clamp(17px, 3vw, 23px); margin-bottom: 2px; }
      .shr-qsub { text-align: center; font-size: 12.5px; color: #6b5744; font-weight: 500; margin-bottom: 10px; min-height: 16px; }
      .shr-machine { display: flex; flex-direction: column; gap: 10px; align-items: center; }
      .shr-panel { width: 100%; max-width: 560px; background: var(--card); border: 3px solid rgba(51,38,29,.16); border-radius: 16px; padding: 10px 14px 12px; box-shadow: 0 3px 0 rgba(0,0,0,.12); }
      .shr-ptitle { font-size: 11px; font-weight: 700; letter-spacing: .08em; color: #8a7357; text-align: center; margin-bottom: 6px; }
      .shr-rail { position: relative; height: 46px; margin: 4px auto 20px; touch-action: none; }
      .shr-railbg { position: absolute; left: 0; right: 0; top: 19px; height: 8px; background: rgba(51,38,29,.12); border-radius: 6px; }
      .shr-fill { position: absolute; left: 0; top: 19px; height: 8px; width: 0; background: var(--stink); border-radius: 6px; }
      .shr-tick { position: absolute; top: 12px; width: 2px; height: 22px; background: rgba(51,38,29,.22); transform: translateX(-1px); }
      .shr-tick.reached { background: var(--stink); }
      .shr-ticknum { position: absolute; top: 36px; font-size: 9.5px; font-weight: 700; color: #8a7357; transform: translateX(-50%); }
      .shr-handle {
        position: absolute; top: 6px; width: 30px; height: 30px; margin-left: -15px;
        background: var(--stink); border: 3px solid var(--ink); border-radius: 50%;
        display: flex; align-items: center; justify-content: center; font-size: 14px;
        box-shadow: 0 3px 0 rgba(0,0,0,.3); cursor: grab; z-index: 4; pointer-events: none;
      }
      .shr-hit { position: absolute; top: -14px; width: 56px; height: 60px; margin-left: -28px; z-index: 5; cursor: grab; touch-action: none; }
      .shr-hit:active { cursor: grabbing; }
      .shr-readout { text-align: center; font-size: 13px; font-weight: 700; color: var(--ink); }
      .shr-readout b { color: var(--stink); }
      .shr-dial { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; }
      .shr-dialface {
        background: var(--swamp-mid); color: var(--stink-lime); font-weight: 700; font-size: 14px;
        padding: 9px 16px; border-radius: 12px; box-shadow: 0 3px 0 rgba(0,0,0,.3);
      }
      .shr-dialface b { color: var(--gold); }
      .shr-dialbtn { width: 44px; height: 44px; border-radius: 12px; background: var(--swamp-mid); color: var(--stink-lime); font-size: 19px; font-weight: 700; border: none; box-shadow: 0 3px 0 rgba(0,0,0,.35); cursor: pointer; }
      .shr-dialbtn:active { transform: translateY(2px); box-shadow: 0 1px 0 rgba(0,0,0,.35); }
      .shr-lock { font-size: 12px; color: #8a7357; font-weight: 700; }
      .shr-worldbar { position: relative; height: 46px; margin: 4px auto 6px; border-radius: 10px; background: rgba(51,38,29,.08); }
      .shr-worldfill { position: absolute; left: 0; top: 0; bottom: 0; width: 0; border-radius: 10px; background: linear-gradient(180deg,#8fd66a,#5fb845); }
      .shr-worldicon { position: absolute; top: 50%; transform: translate(-50%,-50%); font-size: 22px; z-index: 3; filter: drop-shadow(0 2px 3px rgba(0,0,0,.3)); }
      .shr-win {
        margin-top: 2px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF);
        border: 3px solid var(--correct); border-radius: 14px; padding: 11px 16px;
        animation: animBubbleIn .34s var(--spring) both;
      }
      .shr-win .wt { font-weight: 700; color: #1d8f4e; font-size: 16px; }
      .shr-win .wk { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 3px; }
      .shr-win .wb { margin-top: 9px; padding: 10px 22px; font-size: 15px; }
    `);

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'shr-q');
    const qsub = el('div', 'shr-qsub');
    const machine = el('div', 'shr-machine');

    const drawPanel = el('div', 'shr-panel');
    const drawTitle = el('div', 'shr-ptitle', '📜 THE DRAWING');
    const drawRail = el('div', 'shr-rail');
    const drawReadout = el('div', 'shr-readout');
    drawPanel.append(drawTitle, drawRail, drawReadout);

    const dialRow = el('div', 'shr-dial');

    const worldPanel = el('div', 'shr-panel');
    const worldTitle = el('div', 'shr-ptitle', '🌍 THE REAL WORLD');
    const worldBar = el('div', 'shr-worldbar');
    const worldReadout = el('div', 'shr-readout');
    worldPanel.append(worldTitle, worldBar, worldReadout);

    machine.append(drawPanel, dialRow, worldPanel);

    const controls = el('div', 'anim-controls');
    const nl = el('button', 'anim-nudge', '⬅');
    const fire = el('button', 'btn btn-gold', '🔫 FIRE THE RAY');
    const nr = el('button', 'anim-nudge', '➡');
    const reset = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(nl, fire, nr, reset);

    const winBox = el('div');
    stage.append(chiprow, q, qsub, machine, controls, winBox);
    host.append(stage);

    const ruleCard = el('div', 'goldcard', RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;';
    host.append(ruleCard);

    /* ---------- state ---------- */
    let mi = 0;
    let mission = null;
    let busy = false;
    let attempts = 0;
    let wonThisAttempt = false;
    let dialIdx = 0;
    let railMaxCm = 0; let pxPerCm = 0;
    let measuredCm = 0; // canonical settled cm reading
    let pendingCm = 0; // heading target for repeat-tap nudges (rule 3)
    let displayCm = 0; // whatever the rail is currently showing (drag/tween in flight)
    let lastInt = 0;
    let settledWorldM = 0;
    let worldPxPerM = 0;
    let ticks = []; let fillEl = null; let handleEl = null; let hitEl = null;
    let worldFillEl = null;
    let dragCtrl = null;
    let handleTweenCancel = null;
    let whompTimer = null;

    function currentDialValue() { return mission.mode === 'redial' ? DIAL_VALUES[dialIdx] : mission.factor; }

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), m.chip);
        c.addEventListener('click', () => { if (busy) return; sfx.ui(); start(i); });
        chiprow.append(c);
      });
    }

    /* ---------- dial ---------- */
    function buildDial() {
      dialRow.innerHTML = '';
      if (mission.mode === 'redial') {
        const minus = el('button', 'shr-dialbtn', '−');
        const face = el('div', 'shr-dialface');
        const plus = el('button', 'shr-dialbtn', '+');
        minus.addEventListener('click', () => nudgeDial(-1));
        plus.addEventListener('click', () => nudgeDial(1));
        dialRow.append(minus, face, plus);
      } else {
        dialRow.append(el('div', 'shr-dialface'), el('div', 'shr-lock', '🔒 set by the Shrinkler'));
      }
      updateDialFace();
    }
    function updateDialFace() {
      const face = dialRow.querySelector('.shr-dialface');
      if (face) face.innerHTML = `1 cm = <b>${currentDialValue()}</b> m`;
    }
    function nudgeDial(dir) {
      if (busy || mission.mode !== 'redial') return;
      const next = Math.max(0, Math.min(DIAL_VALUES.length - 1, dialIdx + dir));
      if (next === dialIdx) { sfx.nudge(); return; }
      dialIdx = next;
      sfx.blip(520 + dialIdx * 55, 0.08, 0.14);
      updateDialFace();
    }

    /* ---------- the measuring rail ---------- */
    function updateDrawReadout(cm) {
      const n = Math.round(cm);
      if (mission.mode === 'shrink') {
        drawReadout.innerHTML = n === 0 ? 'drag the strip to set the drawing length' : `drawing set to <b>${n}</b> cm`;
      } else {
        drawReadout.innerHTML = `measured <b>${n}</b> of <b>${mission.cmLen}</b> cm`;
      }
    }
    function positionHandle(cm) {
      displayCm = cm;
      const px = cm * pxPerCm;
      fillEl.style.width = px + 'px';
      handleEl.style.left = px + 'px';
      hitEl.style.left = px + 'px';
      ticks.forEach((t, i) => t.classList.toggle('reached', i <= Math.round(cm) + 1e-9));
      updateDrawReadout(cm);
    }
    function layoutRail() {
      if (handleTweenCancel) { handleTweenCancel(); handleTweenCancel = null; }
      if (dragCtrl) dragCtrl.abort();
      drawRail.innerHTML = ''; ticks = [];
      const avail = Math.min(440, (stage.clientWidth || host.clientWidth || 640) - 60);
      railMaxCm = mission.mode === 'shrink' ? (mission.railMax || 8) : mission.cmLen;
      pxPerCm = avail / railMaxCm;
      drawRail.style.width = avail + 'px';
      const bg = el('div', 'shr-railbg');
      fillEl = el('div', 'shr-fill');
      drawRail.append(bg, fillEl);
      for (let c = 0; c <= railMaxCm; c += 1) {
        const t = el('div', 'shr-tick'); t.style.left = (c * pxPerCm) + 'px'; drawRail.append(t); ticks.push(t);
        const nlab = el('div', 'shr-ticknum', String(c)); nlab.style.left = (c * pxPerCm) + 'px'; drawRail.append(nlab);
      }
      hitEl = el('div', 'shr-hit');
      handleEl = el('div', 'shr-handle', '📏');
      drawRail.append(hitEl, handleEl);
      positionHandle(measuredCm);
      setupDrag();
    }
    function setupDrag() {
      if (dragCtrl) dragCtrl.destroy();
      let dragBaseCm = 0;
      dragCtrl = makeDrag(hitEl, {
        enabled: () => !busy,
        onStart() {
          if (handleTweenCancel) { handleTweenCancel(); handleTweenCancel = null; }
          dragBaseCm = measuredCm;
          lastInt = Math.round(measuredCm);
        },
        onMove(dx) {
          const raw = Math.max(0, Math.min(railMaxCm, dragBaseCm + dx / pxPerCm));
          positionHandle(raw);
          const ni = Math.round(raw);
          if (ni !== lastInt) { if (ni > lastInt) sfx.tick(ni); else sfx.tock(railMaxCm - ni); lastInt = ni; }
          pendingCm = raw;
        },
        onEnd() { settleTo(Math.max(0, Math.min(railMaxCm, Math.round(pendingCm)))); },
      });
    }
    function settleTo(target) {
      pendingCm = target;
      if (handleTweenCancel) { handleTweenCancel(); handleTweenCancel = null; }
      const from = displayCm;
      handleTweenCancel = runTween((v) => positionHandle(v), from, target, 220, () => {
        handleTweenCancel = null;
        measuredCm = target;
        sfx.settle();
      });
    }

    /* ---------- the real-world bar ---------- */
    function buildWorld() {
      worldBar.innerHTML = '';
      const avail = Math.min(480, (stage.clientWidth || host.clientWidth || 640) - 60);
      worldPxPerM = avail / mission.real;
      worldBar.style.width = avail + 'px';
      worldFillEl = el('div', 'shr-worldfill');
      worldBar.append(worldFillEl);
      if (mission.endIcon) {
        const a = el('div', 'shr-worldicon', mission.icon); a.style.left = '3%';
        const b = el('div', 'shr-worldicon', mission.endIcon); b.style.left = '97%';
        worldBar.append(a, b);
      } else {
        const a = el('div', 'shr-worldicon', mission.icon); a.style.left = '50%';
        worldBar.append(a);
      }
    }
    function setWorldFill(m) {
      const clamped = Math.max(0, Math.min(mission.real, m));
      worldFillEl.style.width = (clamped * worldPxPerM) + 'px';
      const n = Math.round(clamped);
      if (mission.mode === 'shrink') {
        worldReadout.innerHTML = (wonThisAttempt && n === 0)
          ? 'shrunk fully onto the drawing! 🌟'
          : `real length: <b>${n}</b> m`;
      } else {
        worldReadout.innerHTML = n === 0 ? 'real length: <b>?</b> — fire the ray!' : `real length: <b>${n}</b> m`;
      }
    }

    /* ---------- whomp animation (shared by grow + shrink) ---------- */
    function runWhomp(fromStart, valuesAsc, playSfx, cb) {
      busy = true;
      let i = 0; let prev = fromStart;
      const step = () => {
        if (!alive) return;
        if (i >= valuesAsc.length) { busy = false; whompTimer = null; later(cb, 150); return; }
        const target = valuesAsc[i];
        playSfx();
        runTween((v) => setWorldFill(v), prev, target, 240, () => {
          settledWorldM = target;
          prev = target; i += 1;
          whompTimer = setTimeout(step, 130);
        });
      };
      step();
    }

    /* ---------- firing ---------- */
    function tryFire() {
      if (busy) return;
      if (mission.mode === 'shrink') { tryShrinkFire(); return; }
      if (Math.round(measuredCm) !== mission.cmLen) {
        sfx.nudge();
        bubble(stage, {
          title: 'MEASURE IT FIRST! 📏',
          text: `Drag the strip all the way along ${mission.obj.toLowerCase()} before you fire — right now you've measured <b>${Math.round(measuredCm)}</b> of <b>${mission.cmLen}</b> cm.`,
          img: SHRINKLER_IMG,
        });
        return;
      }
      const dialVal = currentDialValue();
      const real = realTotal(mission.cmLen, dialVal);
      if (real === mission.real) {
        sfx.blip(700, 0.1, 0.15);
        wonThisAttempt = false;
        runWhomp(0, growSteps(mission.cmLen, dialVal), () => sfx.thud(), () => winMission());
      } else {
        attempts += 1;
        sfx.nudge();
        let text = `Right now the dial reads <b>1 cm = ${dialVal} m</b> — firing now would give <b>${real} m</b>. That's not it yet — turn the dial and try again.`;
        if (attempts >= 2) text += `<br><br>🎩 Psst: you need the dial on <b>1 cm = ${mission.factor} m</b> — that will fire exactly <b>${mission.real} m</b>.`;
        bubble(stage, { title: 'NOT QUITE THE RIGHT WORLD! 🌍', text, img: SHRINKLER_IMG });
      }
    }
    function tryShrinkFire() {
      const guess = Math.round(measuredCm);
      if (guess === 0) {
        sfx.nudge();
        bubble(stage, {
          title: 'SET THE STRIP FIRST! 📏',
          text: 'Drag the strip along the drawing to set how many centimetres YOU think it should be, then fire the reverse ray.',
          img: SHRINKLER_IMG,
        });
        return;
      }
      const target = shrinkCm(mission.real, mission.factor);
      if (guess === target) {
        sfx.blip(500, 0.1, 0.15);
        sparkleBurst(stage, drawRail.getBoundingClientRect().left - stage.getBoundingClientRect().left + guess * pxPerCm, drawRail.getBoundingClientRect().top - stage.getBoundingClientRect().top + 20);
        runWhomp(mission.real, shrinkSteps(mission.real, mission.factor, mission.cmLen), () => sfx.tock(1), () => winMission());
      } else {
        attempts += 1;
        sfx.nudge();
        const real = realTotal(guess, mission.factor);
        let text = `Your strip is set to <b>${guess}</b> cm — at 1 cm = ${mission.factor} m, that would draw a real length of <b>${real} m</b>, not the ${mission.real} m pond edge. Try a different length.`;
        if (attempts >= 2) text += `<br><br>🎩 Psst: ${mission.real} ÷ ${mission.factor} = <b>${target}</b> cm — set the strip there.`;
        bubble(stage, { title: 'NOT THE RIGHT SIZE YET! 📐', text, img: SHRINKLER_IMG });
      }
    }

    function winMission() {
      wonThisAttempt = true;
      doneSet.add(mission.id);
      sfx.win(); party(stage); paintChips();
      winBox.innerHTML = '';
      const phrase = WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)];
      const resultTxt = mission.mode === 'shrink' ? `${mission.cmLen} cm` : `${mission.real} m`;
      const w = el('div', 'shr-win',
        `<div class="wt">${phrase} ${mission.obj}: <b>${resultTxt}</b></div>`
        + `<div class="wk">${mission.worked}</div>`);
      winBox.append(w);
      if (doneSet.size === MISSIONS.length) ctx.complete();
      const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
      const btn = el('button', 'btn btn-gold wb', nextIdx !== -1 ? 'NEXT ONE ➡' : 'PLAY AGAIN 🔁');
      btn.addEventListener('click', () => { sfx.ui(); start(nextIdx !== -1 ? nextIdx : mi); });
      w.append(btn);
      if (mission.id === 'bridge2') {
        later(() => {
          if (!alive) return;
          bubble(stage, {
            title: 'SAME DRAWING, DIFFERENT WORLD! 🌍',
            text: 'Nothing on the drawing changed — only the LABEL did. Whatever the label says is the recipe you must follow. Read it first, every single time.',
            img: SHRINKLER_IMG,
          });
        }, 550);
      }
    }

    /* ---------- mission setup ---------- */
    function start(i) {
      mi = i; mission = MISSIONS[i]; attempts = 0; busy = false; wonThisAttempt = false;
      winBox.innerHTML = '';
      dialIdx = DIAL_VALUES.indexOf(mission.mode === 'redial' ? mission.fromFactor : mission.factor);
      if (dialIdx < 0) dialIdx = 0;
      paintChips();
      q.textContent = `${mission.icon}${mission.endIcon ? ' ' + mission.endIcon : ''} ${mission.obj}`;
      qsub.textContent = mission.mode === 'shrink'
        ? `The real pond edge is ${mission.real} m, scale 1 cm = ${mission.factor} m. Set the drawing strip, then fire the reverse ray.`
        : mission.mode === 'redial'
          ? `Same ${mission.cmLen} cm drawing — turn the dial to 1 cm = ${mission.factor} m, then fire again.`
          : `Measure the drawing (${mission.cmLen} cm), then fire — scale is 1 cm = ${mission.factor} m.`;
      buildDial();
      measuredCm = mission.mode === 'redial' ? mission.cmLen : 0;
      pendingCm = measuredCm;
      fire.textContent = mission.mode === 'shrink' ? '🔫 REVERSE RAY' : '🔫 FIRE THE RAY';
      layoutRail();
      settledWorldM = mission.mode === 'shrink' ? mission.real : 0;
      buildWorld();
      setWorldFill(settledWorldM);
      if (!introShown) {
        introShown = true;
        later(() => {
          if (!alive) return;
          bubble(stage, {
            title: 'MEET THE SHRINKLER 😏',
            text: 'He can shrink anything onto paper — but he ALWAYS leaves his scale label behind. Measure the drawing, then multiply by the label to blast it back to real size. Turn the label, and the WHOLE WORLD changes!',
            img: SHRINKLER_IMG,
          });
        }, 250);
      }
    }

    nl.addEventListener('click', () => { if (busy) return; sfx.ui(); settleTo(Math.max(0, pendingCm - 1)); });
    nr.addEventListener('click', () => { if (busy) return; sfx.ui(); settleTo(Math.min(railMaxCm, pendingCm + 1)); });
    reset.addEventListener('click', () => {
      if (busy) return;
      sfx.ui();
      attempts = 0; wonThisAttempt = false;
      winBox.innerHTML = '';
      if (mission.mode === 'redial') { dialIdx = DIAL_VALUES.indexOf(mission.fromFactor); updateDialFace(); }
      settleTo(mission.mode === 'redial' ? mission.cmLen : 0);
      settledWorldM = mission.mode === 'shrink' ? mission.real : 0;
      setWorldFill(settledWorldM);
    });
    fire.addEventListener('click', () => { if (busy) return; sfx.ui(); tryFire(); });

    const onResize = () => {
      if (!alive) return;
      liveCancels.forEach((c) => c()); liveCancels.clear();
      if (whompTimer) { clearTimeout(whompTimer); whompTimer = null; }
      if (dragCtrl) dragCtrl.abort();
      busy = false;
      if (!wonThisAttempt) settledWorldM = mission.mode === 'shrink' ? mission.real : 0;
      layoutRail();
      buildWorld();
      setWorldFill(settledWorldM);
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
      if (whompTimer) clearTimeout(whompTimer);
      liveCancels.forEach((c) => c()); liveCancels.clear();
      if (dragCtrl) dragCtrl.destroy();
      stage.remove();
      ruleCard.remove();
    };
  },
};
