// FART QUEST — js/anims/turns-compass.js
// WANDA'S SPINNING CHAMBER — a rotary compass Wrong-Way Wanda spins on, for
// the turns-compass Scout Report. Structure follows decimals-x10.js /
// angles-lines.js (house reference implementations): SVG board + rotary
// makeDrag (angle accumulation borrowed from angles-lines' jaw), tween-driven
// snapping, predict-then-spin missions with genuine-consequence grading.

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const WANDA_IMG = 'assets/monsters/wrong-way-wanda.png';
const RULE = "N-E-S-W clockwise ('Naughty Elephants Squirt Water'). A quarter turn = one letter along.";
const CARD = ['N', 'E', 'S', 'W'];
const FULLNAME = ['NORTH', 'EAST', 'SOUTH', 'WEST'];
const SONGWORD = ['Naughty', 'Elephants', 'Squirt', 'Water'];
const TURNLABEL = ['no turn', 'quarter turn', 'half turn', 'three-quarter turn'];
const WIN_PHRASES = ['SPIN-TASTIC! 💨', 'BANG ON BEARING!', 'WANDA APPROVES! 🧭', 'NEVER LOST AGAIN!'];

/* ---------- pure geometry (unit-tested in /tmp scratch — do not "improve") ---------- */
function mod4(n) { return ((n % 4) + 4) % 4; }
function bearingXY(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}
function bearingFromPointer(cx, cy, lx, ly) {
  let b = (Math.atan2(lx - cx, -(ly - cy)) * 180) / Math.PI;
  if (b < 0) b += 360;
  return b;
}
function shortestDelta(a, b) {
  let d = (b - a) % 360;
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- content (guided missions — targets checked in /tmp scratch) ---------- */
const MISSIONS = [
  {
    id: 'a', mode: 'forward', label: '¼ CW FROM N', startIdx: 0, targetIdx: 1,
    stem: 'Wanda is facing <b>NORTH</b>. Give her a <b>QUARTER TURN CLOCKWISE</b>. Where will she end up?',
    ask: 'Tap where you think she’ll END UP.',
    worked: 'N-E-S-W clockwise. One letter along from North is East.',
    remind: 'Say the mnemonic from North and take ONE letter along, clockwise: N, then…',
    wrongHints: {
      0: 'That’s where she STARTED — a real turn always lands somewhere new.',
      2: 'That’s TWO letters along — a half turn, not a quarter turn.',
      3: 'That’s one letter BACK — the anticlockwise way, not clockwise.',
    },
  },
  {
    id: 'b', mode: 'forward', label: '½ TURN FROM W', startIdx: 3, targetIdx: 1,
    stem: 'Wanda is facing <b>WEST</b>. Give her a <b>HALF TURN</b>. Where will she end up?',
    ask: 'Tap where you think she’ll END UP.',
    worked: 'A half turn is two letters along. Two letters on from West is East.',
    remind: 'A half turn is TWO letters along from West — count two, either direction.',
    wrongHints: {
      3: 'She hasn’t moved at all yet — spin her a full half turn.',
      0: 'That’s only ONE letter along — a quarter turn, not a half turn.',
      2: 'That’s THREE letters along — a three-quarter turn, not a half turn.',
    },
  },
  {
    id: 'c', mode: 'forward', label: '¼ ACW FROM S', startIdx: 2, targetIdx: 1,
    stem: 'Wanda is facing <b>SOUTH</b>. Give her a <b>QUARTER TURN ANTI-CLOCKWISE</b>. Where will she end up?',
    ask: 'Tap where you think she’ll END UP.',
    worked: 'Anticlockwise walks the mnemonic backwards. One letter back from South is East.',
    remind: 'Anticlockwise walks the mnemonic BACKWARDS — from South, take one letter back.',
    wrongHints: {
      2: 'That’s where she STARTED — a real turn always lands somewhere new.',
      3: 'That’s one letter along CLOCKWISE — the wrong way round.',
      0: 'That’s two letters back — a half turn, not a quarter.',
    },
  },
  {
    id: 'd', mode: 'reverse', label: 'FIND THE START', endIdx: 3, targetIdx: 2, dir: 1, steps: 1,
    turnLabel: 'a quarter turn clockwise',
    stem: 'Wanda ended up facing <b>WEST</b> after a <b>QUARTER TURN CLOCKWISE</b>. Where did she START?',
    ask: 'Tap where you think she STARTED.',
    worked: 'To undo a quarter turn clockwise, turn a quarter turn anticlockwise from West: one letter back is South.',
    remind: 'To find the START, undo the turn: same size, OPPOSITE direction — one letter BACK from West.',
    wrongHints: {
      3: 'That’s where she ENDED, not where she started.',
      0: 'That turns FORWARDS again — to find the START you must go the OPPOSITE way.',
      1: 'That undoes a HALF turn, not a quarter turn.',
    },
  },
];

/* ---------- the compass board ---------- */
function makeCompass(host, opts) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const CX = 150; const CY = 150; const R = 95; const LR = 113; const LW = 133;
  const wrap = el('div', 'wsc-wrap');
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 300 300');
  svg.setAttribute('class', 'wsc-svg');

  const face = document.createElementNS(svgNS, 'circle'); face.setAttribute('class', 'wsc-face');
  face.setAttribute('cx', CX); face.setAttribute('cy', CY); face.setAttribute('r', R);
  const ticksG = document.createElementNS(svgNS, 'g'); ticksG.setAttribute('class', 'wsc-ticks');
  for (let d = 0; d < 360; d += 45) {
    const p1 = bearingXY(CX, CY, R - 9, d); const p2 = bearingXY(CX, CY, R, d);
    const ln = document.createElementNS(svgNS, 'line');
    ln.setAttribute('x1', p1.x); ln.setAttribute('y1', p1.y); ln.setAttribute('x2', p2.x); ln.setAttribute('y2', p2.y);
    ticksG.append(ln);
  }
  const ring = document.createElementNS(svgNS, 'circle'); ring.setAttribute('class', 'wsc-ring');
  ring.setAttribute('cx', CX); ring.setAttribute('cy', CY); ring.setAttribute('r', R);
  svg.append(face, ticksG, ring);

  const points = CARD.map((letter, i) => {
    const deg = i * 90;
    const lp = bearingXY(CX, CY, LR, deg);
    const wp = bearingXY(CX, CY, LW, deg);
    const g = document.createElementNS(svgNS, 'g'); g.setAttribute('class', 'wsc-point');
    const lt = document.createElementNS(svgNS, 'text'); lt.setAttribute('class', 'wsc-letter');
    lt.setAttribute('x', lp.x); lt.setAttribute('y', lp.y); lt.textContent = letter;
    const wt = document.createElementNS(svgNS, 'text'); wt.setAttribute('class', 'wsc-word');
    wt.setAttribute('x', wp.x); wt.setAttribute('y', wp.y); wt.textContent = SONGWORD[i];
    g.append(lt, wt);
    svg.append(g);
    return g;
  });

  const needle = document.createElementNS(svgNS, 'g'); needle.setAttribute('class', 'wsc-needle');
  const needleTail = document.createElementNS(svgNS, 'circle'); needleTail.setAttribute('class', 'wsc-needletail');
  needleTail.setAttribute('cx', CX); needleTail.setAttribute('cy', CY + 28); needleTail.setAttribute('r', 8);
  const needlePoly = document.createElementNS(svgNS, 'polygon'); needlePoly.setAttribute('class', 'wsc-needlepoly');
  needlePoly.setAttribute('points', `${CX},${CY - 88} ${CX - 12},${CY - 14} ${CX + 12},${CY - 14}`);
  needle.append(needleTail, needlePoly);
  svg.append(needle);
  const hub = document.createElementNS(svgNS, 'circle'); hub.setAttribute('class', 'wsc-hub');
  hub.setAttribute('cx', CX); hub.setAttribute('cy', CY); hub.setAttribute('r', 7);
  svg.append(hub);

  const wandaImg = document.createElement('img');
  wandaImg.className = 'wsc-wanda'; wandaImg.alt = ''; wandaImg.src = WANDA_IMG;
  const hit = el('div', 'wsc-hit');
  wrap.append(svg, wandaImg, hit);
  host.append(wrap);

  const B = { totalDeg: 0, refDeg: 0, refProv: 0, targetDeg: 0, lastProv: 0, lastRel: 0, settling: false, cancelTween: null };

  function render(deg) {
    needle.setAttribute('transform', `rotate(${deg} ${CX} ${CY})`);
    const idx = mod4(Math.round(deg / 90));
    points.forEach((g, i) => g.classList.toggle('lit', i === idx));
  }
  render(0);

  function setDeg(deg, silent) {
    B.totalDeg = deg;
    render(deg);
    const prov = Math.round(deg / 90);
    if (prov !== B.lastProv) {
      const step = prov > B.lastProv ? 1 : -1;
      if (!silent) {
        for (let p = B.lastProv + step; step > 0 ? p <= prov : p >= prov; p += step) {
          if (step > 0) sfx.tick(); else sfx.tock();
        }
      }
      B.lastProv = prov;
      const rel = prov - B.refProv;
      if (!silent && Math.abs(rel) >= 1 && Math.abs(rel) <= 3 && Math.abs(rel) > Math.abs(B.lastRel)) {
        if (opts.onBadge) opts.onBadge(Math.abs(rel), rel > 0 ? 1 : -1);
      }
      B.lastRel = rel;
      if (opts.onChip) opts.onChip(mod4(prov), rel);
    }
  }

  function jumpTo(deg) {
    if (B.cancelTween) { B.cancelTween(); B.cancelTween = null; }
    drag.abort(); wrap.classList.remove('dragging'); B.settling = false;
    B.totalDeg = deg; B.refDeg = deg; B.targetDeg = deg;
    B.lastProv = Math.round(deg / 90); B.refProv = B.lastProv; B.lastRel = 0;
    render(deg);
    if (opts.onChip) opts.onChip(mod4(B.lastProv), 0);
  }

  function settleAt(targetDeg) {
    B.targetDeg = targetDeg;
    if (B.cancelTween) B.cancelTween();
    B.settling = true;
    const from = B.totalDeg;
    B.cancelTween = tween((v) => setDeg(v, false), from, targetDeg, 320, () => {
      B.settling = false; B.cancelTween = null; sfx.settle();
    });
  }

  let lastBearing = 0;
  const drag = makeDrag(hit, {
    enabled: () => !!opts.enabled && opts.enabled(),
    onStart(e) {
      if (B.cancelTween) { B.cancelTween(); B.cancelTween = null; }
      B.settling = false;
      wrap.classList.add('dragging');
      const rect = svg.getBoundingClientRect();
      lastBearing = bearingFromPointer(rect.left + rect.width / 2, rect.top + rect.height / 2, e.clientX, e.clientY);
    },
    onMove(dx, dy, e) {
      const rect = svg.getBoundingClientRect();
      const b = bearingFromPointer(rect.left + rect.width / 2, rect.top + rect.height / 2, e.clientX, e.clientY);
      const delta = shortestDelta(lastBearing, b);
      lastBearing = b;
      setDeg(B.totalDeg + delta, false);
    },
    onEnd() {
      wrap.classList.remove('dragging');
      settleAt(Math.round(B.totalDeg / 90) * 90);
    },
  });

  return {
    jumpTo,
    nudge(dir) {
      if (!opts.enabled || !opts.enabled() || drag.dragging()) return;
      const base = B.settling ? B.targetDeg : B.totalDeg;
      settleAt(Math.round(base / 90) * 90 + dir * 90);
    },
    resetToStart() {
      if (drag.dragging()) return;
      if (B.cancelTween) { B.cancelTween(); B.cancelTween = null; }
      B.settling = false;
      settleAt(B.refDeg);
    },
    programSpin(deltaDeg, cb) {
      if (B.cancelTween) B.cancelTween();
      const from = B.totalDeg; const to = from + deltaDeg;
      B.settling = true;
      B.cancelTween = tween((v) => setDeg(v, false), from, to, 420, () => {
        B.settling = false; B.cancelTween = null; sfx.settle(); if (cb) cb();
      });
    },
    busy: () => B.settling || drag.dragging(),
    currentIdxNow: () => mod4(Math.round(B.totalDeg / 90)),
    abort() {
      if (B.cancelTween) { B.cancelTween(); B.cancelTween = null; }
      drag.abort(); B.settling = false; wrap.classList.remove('dragging');
    },
    destroy() { if (B.cancelTween) B.cancelTween(); drag.destroy(); wrap.remove(); },
  };
}

/* ---------- the anim card ---------- */
export default {
  id: 'turns-compass',
  title: "WANDA'S SPINNING CHAMBER",

  mount(host, ctx) {
    let alive = true;
    let compass = null;
    let mi = 0;
    let mission = null;
    let predictedIdx = null;
    let attempts = 0;
    let introShown = false;
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    injectCss('turns-compass', `
      .wsc-q { text-align: center; font-weight: 700; font-size: clamp(16px, 3vw, 22px); margin-bottom: 2px; line-height: 1.3; }
      .wsc-qsub { text-align: center; font-size: 12.5px; color: #6b5744; font-weight: 500; margin-bottom: 10px; min-height: 16px; }
      .wsc-predictrow { margin-bottom: 12px; }
      .wsc-chipoff { opacity: .35; pointer-events: none; }
      .wsc-inert { opacity: .4; pointer-events: none; }
      .wsc-compasshost { position: relative; width: 100%; }
      .wsc-wrap { position: relative; width: 100%; max-width: 300px; margin: 0 auto; touch-action: none; }
      .wsc-svg { display: block; width: 100%; height: auto; touch-action: none; overflow: visible; }
      .wsc-hit { position: absolute; inset: 0; cursor: grab; touch-action: none; z-index: 5; }
      .wsc-wrap.dragging .wsc-hit { cursor: grabbing; }
      .wsc-face { fill: var(--card); }
      .wsc-ring { fill: none; stroke: var(--ink); stroke-width: 4; }
      .wsc-ticks line { stroke: rgba(51,38,29,.28); stroke-width: 2.5; }
      .wsc-point .wsc-letter { font-size: 22px; font-weight: 700; fill: #a08c74; text-anchor: middle; dominant-baseline: middle; transition: fill .18s; }
      .wsc-point .wsc-word { font-size: 9px; font-weight: 700; fill: #b9ab97; text-anchor: middle; dominant-baseline: middle; letter-spacing: .03em; transition: fill .18s; }
      .wsc-point.lit .wsc-letter { fill: var(--stink); }
      .wsc-point.lit .wsc-word { fill: var(--gold-deep); }
      .wsc-needle .wsc-needlepoly { fill: var(--gold); stroke: var(--ink); stroke-width: 2.5; }
      .wsc-needle .wsc-needletail { fill: var(--swamp-mid); stroke: var(--ink); stroke-width: 2.5; }
      .wsc-hub { fill: var(--ink); }
      .wsc-wanda {
        position: absolute; left: 50%; top: 50%; width: 26%; max-width: 70px;
        transform: translate(-50%, -78%); pointer-events: none; z-index: 3;
        filter: drop-shadow(0 4px 6px rgba(0,0,0,.3));
      }
      .wsc-badge {
        position: absolute; top: 4px; left: 50%; transform: translateX(-50%); z-index: 9;
        background: var(--swamp-mid); color: var(--stink-lime); font-weight: 700; font-size: 14px;
        padding: 6px 14px; border-radius: 999px; box-shadow: 0 3px 0 rgba(0,0,0,.3);
        animation: wscBadgePop .9s ease both; pointer-events: none; white-space: nowrap;
      }
      @keyframes wscBadgePop {
        0% { opacity: 0; transform: translate(-50%, 6px) scale(.7); }
        18% { opacity: 1; transform: translate(-50%, 0) scale(1.08); }
        30% { transform: translate(-50%, 0) scale(1); }
        80% { opacity: 1; }
        100% { opacity: 0; transform: translate(-50%, -10px) scale(.95); }
      }
      .wsc-dash { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; margin-top: 12px; }
      .wsc-readout { background: #241d15; border-radius: 12px; padding: 6px 18px; min-width: 150px; text-align: center; box-shadow: inset 0 3px 10px rgba(0,0,0,.6); border: 3px solid #4a3b28; }
      .wsc-readout .rl { font-size: 9px; letter-spacing: .2em; color: #8f7a5e; font-weight: 700; }
      .wsc-readout .rn { line-height: 1.15; }
      .wsc-readout .rletter { font-size: clamp(22px, 3.6vw, 28px); font-weight: 700; color: var(--stink-lime); margin-right: 6px; }
      .wsc-readout .rword { font-size: 12.5px; font-weight: 700; color: var(--stink-lime); opacity: .8; }
      .wsc-counter { background: var(--swamp-mid); color: var(--parchment); border-radius: 12px; padding: 9px 15px; font-weight: 700; font-size: clamp(13px, 2vw, 15px); box-shadow: 0 3px 0 rgba(0,0,0,.3); text-align: center; min-width: 175px; }
      .wsc-counter b { color: var(--stink-lime); }
      .wsc-win { margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF); border: 3px solid var(--correct); border-radius: 14px; padding: 10px 14px; animation: animBubbleIn .34s var(--spring) both; }
      .wsc-win .wp { font-weight: 700; color: #1d8f4e; font-size: 16px; }
      .wsc-win .wk { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 2px; }
    `);

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'wsc-q');
    const qsub = el('div', 'wsc-qsub');
    const predictRow = el('div', 'anim-chiprow wsc-predictrow');
    const compassHost = el('div', 'wsc-compasshost');
    const dash = el('div', 'wsc-dash');
    const readout = el('div', 'wsc-readout', '<div class="rl">WANDA FACES</div><div class="rn"></div>');
    const counter = el('div', 'wsc-counter');
    dash.append(readout, counter);
    const winBox = el('div');
    const controls = el('div', 'anim-controls');
    const nl = el('button', 'anim-nudge', '↺');
    const lock = el('button', 'btn btn-gold', 'LOCK IT IN 💨');
    const nr = el('button', 'anim-nudge', '↻');
    const reset = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(nl, lock, nr, reset);
    stage.append(chiprow, q, qsub, predictRow, compassHost, dash, winBox, controls);
    host.append(stage);

    const ruleCard = el('div', 'goldcard', RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;';
    host.append(ruleCard);

    function setReadout(idx) {
      readout.querySelector('.rn').innerHTML = `<span class="rletter">${CARD[idx]}</span><span class="rword">${FULLNAME[idx]}</span>`;
    }
    function setCounter(rel) {
      if (rel === 0) { counter.innerHTML = 'no turn yet — <b>spin her round!</b>'; return; }
      const mag = Math.abs(rel) % 4 === 0 ? 4 : Math.abs(rel) % 4;
      const label = mag === 4 ? 'FULL TURN' : TURNLABEL[mag].toUpperCase();
      const dirLabel = rel > 0 ? 'CLOCKWISE' : 'ANTI-CLOCKWISE';
      counter.innerHTML = `<b>${label}</b> ${dirLabel}`;
    }
    function popBadge(mag, dir) {
      const label = mag === 1 ? 'QUARTER TURN!' : mag === 2 ? 'HALF TURN!' : 'THREE-QUARTER TURN!';
      const arrow = dir > 0 ? '↻' : '↺';
      const b = el('div', 'wsc-badge', `${arrow} ${label}`);
      compassHost.appendChild(b);
      sfx.pop();
      later(() => b.remove(), 900);
    }
    function setControlsEnabled(on) {
      [nl, nr, lock].forEach((b) => { b.classList.toggle('wsc-inert', !on); b.disabled = !on; });
    }

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), m.label);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
      const fp = el('button', 'anim-mchip' + (mi === MISSIONS.length ? ' active' : ''), 'FREE PLAY 🧭');
      fp.addEventListener('click', () => { sfx.ui(); start(MISSIONS.length); });
      chiprow.append(fp);
    }

    function paintPredict() {
      predictRow.innerHTML = '';
      shuffle([0, 1, 2, 3]).forEach((idx) => {
        const c = el('button', 'anim-mchip', FULLNAME[idx]);
        c.addEventListener('click', () => {
          if (predictedIdx != null) return;
          predictedIdx = idx;
          sfx.ui();
          predictRow.querySelectorAll('.anim-mchip').forEach((btn) => btn.classList.add('wsc-chipoff'));
          c.classList.remove('wsc-chipoff'); c.classList.add('active');
          qsub.textContent = 'Now SPIN her round to check — then LOCK IT IN!';
          setControlsEnabled(true);
        });
        predictRow.append(c);
      });
    }

    function buildCompass(startDeg) {
      if (compass) { compass.destroy(); compass = null; }
      compass = makeCompass(compassHost, {
        enabled: () => mi === MISSIONS.length || predictedIdx != null,
        onChip(idx, rel) { setReadout(idx); setCounter(rel); },
        onBadge(mag, dir) { popBadge(mag, dir); },
      });
      compass.jumpTo(startDeg);
    }

    function start(i) {
      mi = i; attempts = 0; predictedIdx = null;
      winBox.innerHTML = '';
      paintChips();
      const sandbox = i === MISSIONS.length;
      mission = sandbox ? null : MISSIONS[i];
      lock.style.display = sandbox ? 'none' : '';
      predictRow.style.display = sandbox ? 'none' : '';
      if (sandbox) {
        q.textContent = 'FREE PLAY — spin her however you like!';
        qsub.textContent = 'Watch the letters light, feel the ratchet, catch the turn badges.';
        setControlsEnabled(true);
        buildCompass(0);
        return;
      }
      q.innerHTML = mission.stem;
      qsub.textContent = mission.ask;
      setControlsEnabled(false);
      const shownIdx = mission.mode === 'forward' ? mission.startIdx : mission.endIdx;
      buildCompass(shownIdx * 90);
      paintPredict();
      if (!introShown) {
        introShown = true;
        later(() => bubble(stage, {
          title: 'SPIN ME IF YOU DARE! 🌀',
          text: 'Poor Wrong-Way Wanda never knows which way she’s facing. Predict where she’ll end up, then SPIN her round to find out — the compass never lies!',
          img: WANDA_IMG,
        }), 250);
      }
    }

    nl.addEventListener('click', () => compass && compass.nudge(-1));
    nr.addEventListener('click', () => compass && compass.nudge(1));
    reset.addEventListener('click', () => { sfx.ui(); compass && compass.resetToStart(); });

    lock.addEventListener('click', () => {
      if (!compass || compass.busy() || !mission || predictedIdx == null) return;
      sfx.ui();
      const finalIdx = compass.currentIdxNow();
      if (finalIdx === mission.targetIdx) { win(finalIdx); return; }
      attempts += 1;
      sfx.nudge();
      let text = `Right now Wanda’s facing <b>${FULLNAME[finalIdx]}</b>. ${mission.wrongHints[finalIdx] || 'That’s not quite it — check the direction and count the letters again.'}`;
      if (attempts >= 2) text += `<br><br>🧭 Psst: ${mission.remind}`;
      bubble(stage, { title: 'SPIN AGAIN! 🌀', text, img: WANDA_IMG });
    });

    function win(finalIdx) {
      doneSet.add(mission.id);
      sfx.win(); party(stage);
      sparkleBurst(stage, (stage.clientWidth || 300) / 2, compassHost.offsetTop + compassHost.offsetHeight / 2);
      paintChips();
      winBox.innerHTML = '';
      const predictLine = predictedIdx === mission.targetIdx
        ? 'Your hunch was bang on!'
        : 'Not what you first predicted — but the spin never lies. Trust the mnemonic next time!';
      const w = el('div', 'wsc-win',
        `<div class="wp">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]}</div>`
        + `<div class="wk">${mission.worked}</div>`
        + `<div class="wk">${predictLine}</div>`);
      winBox.append(w);
      const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
      const btn = el('button', 'btn btn-gold', nextIdx !== -1 ? 'NEXT ONE ➡' : 'FREE PLAY 🧭');
      btn.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
      btn.addEventListener('click', () => { sfx.ui(); start(nextIdx !== -1 ? nextIdx : MISSIONS.length); });
      w.append(btn);
      if (doneSet.size === MISSIONS.length) ctx.complete();
      if (mission.mode === 'reverse') {
        const m = mission;
        later(() => {
          if (!alive || !compass) return;
          compass.programSpin(m.dir * m.steps * 90, () => {
            if (!alive) return;
            toast(stage, `And forward from there — ${m.turnLabel} — she lands on ${FULLNAME[m.endIdx]}! Just like the question said.`);
          });
        }, 650);
      }
    }

    const onResize = () => { if (!alive) return; if (compass) compass.abort(); };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    start(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      if (compass) compass.destroy();
      stage.remove();
      ruleCard.remove();
    };
  },
};
