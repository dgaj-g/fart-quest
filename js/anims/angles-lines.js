// FART QUEST — js/anims/angles-lines.js
// THE ANGLE JAWS — Obtusius's hinged jaw + a triangle apex you can drag,
// for the angles-lines Scout Report. Structure follows decimals-x10.js
// (the house reference implementation).

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const OBT_IMG = 'assets/monsters/obtusius.png';
const RULE = 'Sharper than a corner = acute. Past a corner = obtuse. Past a straight line = reflex. A triangle’s angles always total 180°.';
const PROMISE = 'THE TRIANGLE PROMISE: the three angles inside ANY triangle always add up to 180°.';
const SQUARE_MARK = 'See a little square 🔲 drawn in the corner of an angle? That is the official “this one is EXACTLY 90°” stamp.';

/* ---------- pure geometry / classification engine (unit-tested — do not "improve") ---------- */
const SNAP_TOL = 3.5;

function classify(deg) {
  if (deg === 90) return 'right';
  if (deg === 180) return 'straight';
  if (deg > 0 && deg < 90) return 'acute';
  if (deg > 90 && deg < 180) return 'obtuse';
  if (deg > 180 && deg < 360) return 'reflex';
  return 'closed';
}
function snapAngle(deg) {
  if (Math.abs(deg - 90) <= SNAP_TOL) return 90;
  if (Math.abs(deg - 180) <= SNAP_TOL) return 180;
  return deg;
}
function clampAngle(deg) { return Math.max(3, Math.min(357, deg)); }

function pt(vertex, theta, r) {
  const rad = (-theta) * Math.PI / 180;
  return { x: vertex.x + r * Math.cos(rad), y: vertex.y + r * Math.sin(rad) };
}
function arcPoints(vertex, theta, r) {
  const steps = Math.max(2, Math.round(theta / 4));
  const pts = [vertex];
  for (let i = 0; i <= steps; i += 1) pts.push(pt(vertex, (theta * i) / steps, r));
  return pts;
}
function triangleAngles(A, B, C) {
  const ang = (V, P, Q) => {
    const v1x = P.x - V.x; const v1y = P.y - V.y;
    const v2x = Q.x - V.x; const v2y = Q.y - V.y;
    const dot = v1x * v2x + v1y * v2y;
    const m1 = Math.hypot(v1x, v1y); const m2 = Math.hypot(v2x, v2y);
    const cos = Math.max(-1, Math.min(1, dot / (m1 * m2)));
    return (Math.acos(cos) * 180) / Math.PI;
  };
  return [ang(A, B, C), ang(B, A, C), ang(C, A, B)];
}
function roundSum180(raw) {
  const floors = raw.map(Math.floor);
  const remainder = 180 - floors.reduce((a, b) => a + b, 0);
  const order = raw.map((v, i) => ({ i, frac: v - floors[i] })).sort((a, b) => b.frac - a.frac);
  const out = floors.slice();
  for (let k = 0; k < remainder; k += 1) out[order[k].i] += 1;
  return out;
}

/* ---------- content ---------- */
const CATS = {
  acute: { label: 'ACUTE', icon: '🦷', color: 'var(--swamp-glow)', win: 'SHARP AS A TOOTH!', note: 'sharper than a corner' },
  right: { label: 'RIGHT ANGLE', icon: '📐', color: 'var(--stink)', win: 'CLUNK! PERFECT CORNER!', note: 'exactly a corner' },
  obtuse: { label: 'OBTUSE', icon: '😌', color: 'var(--gold-deep)', win: 'AAAH, ROOM TO SPRAWL!', note: 'wider than a corner, not yet flat' },
  straight: { label: 'STRAIGHT', icon: '📏', color: '#b06a86', win: 'FLAT AS A PANCAKE!', note: 'exactly a flat line' },
  reflex: { label: 'REFLEX', icon: '🌀', color: '#4f9c9c', win: 'RIGHT ROUND THE BACK!', note: 'past a flat line' },
};
const JAW_MISSIONS = [
  { id: 'acute', cat: 'acute', title: 'OPEN ME AN ACUTE ANGLE!', sub: 'Obtusius wants something SHARP. Open the jaw — anything sharper than a corner — then lock it in.' },
  { id: 'right', cat: 'right', title: 'EXACTLY A RIGHT ANGLE!', sub: 'Open until you feel the jaw CLUNK into a perfect corner — no more, no less.' },
  { id: 'obtuse', cat: 'obtuse', title: 'MAKE OBTUSIUS COMFORTABLE — OBTUSE!', sub: 'He needs room to sprawl. Wider than a corner, but stop before a flat line.' },
  { id: 'reflex', cat: 'reflex', title: 'PAST A STRAIGHT LINE — REFLEX!', sub: 'Keep going — right round the back of the jaw.' },
];
const ALL = [...JAW_MISSIONS, { id: 'triangle', kind: 'triangle', title: 'THE TRIANGLE PROMISE' }];

function jawFeedback(missionCat, actualCat) {
  const T = {
    acute: {
      right: 'CLUNK — that snapped into an exact RIGHT angle. Acute needs to be sharper than that. Close it up a little!',
      obtuse: 'That’s OBTUSE — wider than a corner. Acute needs to be sharper. Close it up!',
      straight: 'That’s a flat STRAIGHT line — miles too wide. Acute needs to be sharp and small.',
      reflex: 'That’s REFLEX — right round the back! Acute needs to be sharp and small — close it right up.',
    },
    right: {
      acute: 'That’s ACUTE — close, but not quite a corner yet. Nudge it further until you feel the CLUNK.',
      obtuse: 'That’s OBTUSE — just tipped past a corner. Nudge it back until you feel the CLUNK.',
      straight: 'That’s a flat STRAIGHT line — way past a corner. Bring it back to the CLUNK.',
      reflex: 'That’s REFLEX — right round the back! Bring it all the way back to the CLUNK of a corner.',
    },
    obtuse: {
      acute: 'That’s ACUTE — too sharp! Obtuse needs to be wider than a corner.',
      right: 'CLUNK — that’s an exact RIGHT angle. Obtuse needs to go a little further past the corner.',
      straight: 'That’s a flat STRAIGHT line — too far! Obtuse stops just before flat. Ease it back a touch.',
      reflex: 'That’s REFLEX — way past a flat line! Obtuse sits between a corner and flat. Ease it back.',
    },
    reflex: {
      acute: 'That’s ACUTE — nowhere near far enough! Reflex needs to go PAST a flat line.',
      right: 'CLUNK — that’s an exact RIGHT angle, still a long way to go. Reflex needs to pass a flat line.',
      obtuse: 'That’s OBTUSE — getting there, but not past flat yet. Keep opening!',
      straight: 'That’s a flat STRAIGHT line — SO close! Push just a little further into reflex.',
    },
  };
  return (T[missionCat] && T[missionCat][actualCat]) || `That’s ${CATS[actualCat].label} — try again!`;
}

/* ---------- the jaw board ---------- */
function buildJaw(host, opts) {
  const VB = { w: 320, h: 300 };
  const vertex = { x: 150, y: 165 };
  const R = 108;
  const svgNS = 'http://www.w3.org/2000/svg';
  const wrap = el('div', 'ajw-wrap');
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${VB.w} ${VB.h}`);
  svg.setAttribute('class', 'ajw-svg');
  const arcFill = document.createElementNS(svgNS, 'polygon'); arcFill.setAttribute('class', 'ajw-arcfill');
  const bottomArm = document.createElementNS(svgNS, 'line'); bottomArm.setAttribute('class', 'ajw-arm');
  const topArm = document.createElementNS(svgNS, 'line'); topArm.setAttribute('class', 'ajw-arm ajw-arm-top');
  const vertexDot = document.createElementNS(svgNS, 'circle'); vertexDot.setAttribute('class', 'ajw-vertex'); vertexDot.setAttribute('r', 7);
  const rightMark = document.createElementNS(svgNS, 'polygon'); rightMark.setAttribute('class', 'ajw-rightmark');
  const handle = document.createElementNS(svgNS, 'circle'); handle.setAttribute('class', 'ajw-handle'); handle.setAttribute('r', 12);
  svg.append(arcFill, bottomArm, topArm, rightMark, vertexDot, handle);
  const hit = el('div', 'ajw-hit');
  wrap.append(svg, hit);
  host.append(wrap);

  const B = { theta: opts.start, target: opts.start, dragging: false, lastCat: null, lastSnap: null, cancelTween: null };

  function render(theta) {
    B.theta = theta;
    const cat = classify(theta);
    const pts = arcPoints(vertex, theta, R);
    arcFill.setAttribute('points', pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
    arcFill.style.fill = CATS[cat] ? CATS[cat].color : 'transparent';
    const p0 = pt(vertex, 0, R + 6);
    const pT = pt(vertex, theta, R + 6);
    bottomArm.setAttribute('x1', vertex.x); bottomArm.setAttribute('y1', vertex.y);
    bottomArm.setAttribute('x2', p0.x); bottomArm.setAttribute('y2', p0.y);
    topArm.setAttribute('x1', vertex.x); topArm.setAttribute('y1', vertex.y);
    topArm.setAttribute('x2', pT.x); topArm.setAttribute('y2', pT.y);
    vertexDot.setAttribute('cx', vertex.x); vertexDot.setAttribute('cy', vertex.y);
    handle.setAttribute('cx', pT.x); handle.setAttribute('cy', pT.y);
    if (cat === 'right') {
      const d = 20;
      const p1 = pt(vertex, 0, d); const p2 = pt(vertex, 90, d);
      const corner = { x: p1.x + (p2.x - vertex.x), y: p1.y + (p2.y - vertex.y) };
      rightMark.setAttribute('points', `${p1.x.toFixed(1)},${p1.y.toFixed(1)} ${corner.x.toFixed(1)},${corner.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`);
      rightMark.style.opacity = 1;
    } else {
      rightMark.style.opacity = 0;
    }
    wrap.classList.toggle('ajw-flat', cat === 'straight');
    if (cat !== B.lastCat) { B.lastCat = cat; if (opts.onCat) opts.onCat(cat); }
    return cat;
  }
  render(B.theta);

  const drag = makeDrag(hit, {
    enabled: () => !(opts.disabled && opts.disabled()),
    onStart() {
      if (B.cancelTween) { B.cancelTween(); B.cancelTween = null; }
      B.dragging = true;
      wrap.classList.add('ajw-dragging');
    },
    onMove(dx, dy, e) {
      const rect = svg.getBoundingClientRect();
      const sx = VB.w / rect.width; const sy = VB.h / rect.height;
      const lx = (e.clientX - rect.left) * sx;
      const ly = (e.clientY - rect.top) * sy;
      let raw = (-Math.atan2(ly - vertex.y, lx - vertex.x) * 180) / Math.PI;
      if (raw < 0) raw += 360;
      let theta = clampAngle(raw);
      const snapped = snapAngle(theta);
      if (snapped !== theta) {
        if (B.lastSnap !== snapped) { B.lastSnap = snapped; sfx.thud(); }
        theta = snapped;
      } else {
        B.lastSnap = null;
      }
      B.theta = theta; B.target = theta;
      render(theta);
    },
    onEnd() { B.dragging = false; wrap.classList.remove('ajw-dragging'); },
  });

  B.nudge = function nudge(dir) {
    if (B.dragging) return true;
    let next = clampAngle(B.target + dir * 6);
    next = snapAngle(next);
    if (next === B.target) { sfx.nudge(); return false; }
    B.target = next;
    if (B.cancelTween) B.cancelTween();
    const from = B.theta;
    B.cancelTween = tween((v) => render(v), from, next, 240, () => {
      B.theta = next; B.cancelTween = null;
      if (next === 90 || next === 180) sfx.thud(); else sfx.tick();
    });
    return true;
  };
  B.resetTo = function resetTo(deg) {
    if (B.dragging) return;
    B.target = deg;
    if (B.cancelTween) B.cancelTween();
    B.cancelTween = tween((v) => render(v), B.theta, deg, 300, () => { B.theta = deg; B.cancelTween = null; });
  };
  B.busy = () => B.dragging || !!B.cancelTween;
  B.abort = function abort() {
    if (B.cancelTween) { B.cancelTween(); B.cancelTween = null; }
    drag.abort(); B.dragging = false; wrap.classList.remove('ajw-dragging');
  };
  B.destroy = function destroy() { drag.destroy(); wrap.remove(); };
  return B;
}

/* ---------- the triangle-promise board ---------- */
function buildTriangle(host, opts) {
  const VB = { w: 320, h: 240 };
  const A = { x: 45, y: 205 };
  const Bv = { x: 275, y: 205 };
  const bounds = { xMin: 70, xMax: 250, yMin: 30, yMax: 202 };
  const svgNS = 'http://www.w3.org/2000/svg';
  const wrap = el('div', 'ajw-triwrap');
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${VB.w} ${VB.h}`);
  svg.setAttribute('class', 'ajw-trisvg');
  const tri = document.createElementNS(svgNS, 'polygon'); tri.setAttribute('class', 'ajw-tripoly');
  const dotA = document.createElementNS(svgNS, 'circle'); dotA.setAttribute('r', 5); dotA.setAttribute('class', 'ajw-tridot');
  const dotB = document.createElementNS(svgNS, 'circle'); dotB.setAttribute('r', 5); dotB.setAttribute('class', 'ajw-tridot');
  const labelA = document.createElementNS(svgNS, 'text'); labelA.setAttribute('class', 'ajw-trilabel');
  const labelB = document.createElementNS(svgNS, 'text'); labelB.setAttribute('class', 'ajw-trilabel');
  const labelC = document.createElementNS(svgNS, 'text'); labelC.setAttribute('class', 'ajw-trilabel');
  const handle = document.createElementNS(svgNS, 'circle'); handle.setAttribute('class', 'ajw-trihandle'); handle.setAttribute('r', 13);
  svg.append(tri, dotA, dotB, labelA, labelB, labelC, handle);
  const hit = el('div', 'ajw-trihit');
  wrap.append(svg, hit);
  host.append(wrap);
  const total = el('div', 'ajw-total');
  host.append(total);

  dotA.setAttribute('cx', A.x); dotA.setAttribute('cy', A.y);
  dotB.setAttribute('cx', Bv.x); dotB.setAttribute('cy', Bv.y);

  const T = { apex: { x: 160, y: 60 }, shapes: 0, lastRecorded: null };

  function labelPos(V) {
    const cx = (A.x + Bv.x + T.apex.x) / 3; const cy = (A.y + Bv.y + T.apex.y) / 3;
    const dx = cx - V.x; const dy = cy - V.y;
    const d = Math.hypot(dx, dy) || 1;
    return { x: V.x + (dx / d) * 24, y: V.y + (dy / d) * 24 };
  }
  function render() {
    const C = T.apex;
    tri.setAttribute('points', `${A.x},${A.y} ${Bv.x},${Bv.y} ${C.x},${C.y}`);
    handle.setAttribute('cx', C.x); handle.setAttribute('cy', C.y);
    const raw = triangleAngles(A, Bv, C);
    const rnd = roundSum180(raw);
    const pa = labelPos(A); const pb = labelPos(Bv); const pc = labelPos(C);
    labelA.setAttribute('x', pa.x); labelA.setAttribute('y', pa.y); labelA.textContent = `${rnd[0]}°`;
    labelB.setAttribute('x', pb.x); labelB.setAttribute('y', pb.y); labelB.textContent = `${rnd[1]}°`;
    labelC.setAttribute('x', pc.x); labelC.setAttribute('y', pc.y); labelC.textContent = `${rnd[2]}°`;
    total.innerHTML = `<b>${rnd[0]}°</b> + <b>${rnd[1]}°</b> + <b>${rnd[2]}°</b> = <b class="ajw-total180">180°</b> — always!`;
  }
  render();

  const drag = makeDrag(hit, {
    enabled: () => true,
    onStart() { wrap.classList.add('ajw-dragging'); },
    onMove(dx, dy, e) {
      const rect = svg.getBoundingClientRect();
      const sx = VB.w / rect.width; const sy = VB.h / rect.height;
      let lx = (e.clientX - rect.left) * sx;
      let ly = (e.clientY - rect.top) * sy;
      lx = Math.max(bounds.xMin, Math.min(bounds.xMax, lx));
      ly = Math.max(bounds.yMin, Math.min(bounds.yMax, ly));
      T.apex = { x: lx, y: ly };
      render();
    },
    onEnd() {
      wrap.classList.remove('ajw-dragging');
      sfx.settle();
      if (!T.lastRecorded || Math.hypot(T.apex.x - T.lastRecorded.x, T.apex.y - T.lastRecorded.y) > 30) {
        T.lastRecorded = { ...T.apex };
        T.shapes += 1;
        if (opts.onShape) opts.onShape(T.shapes);
      }
    },
  });

  return {
    abort() { drag.abort(); wrap.classList.remove('ajw-dragging'); },
    destroy() { drag.destroy(); wrap.remove(); total.remove(); },
  };
}

/* ---------- the anim card ---------- */
export default {
  id: 'angles-lines',
  title: 'THE ANGLE JAWS',

  mount(host, ctx) {
    let alive = true;
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    injectCss('angles-lines', `
      .ajw-wrap { position: relative; width: 100%; max-width: 320px; margin: 0 auto; touch-action: none; }
      .ajw-svg { display: block; width: 100%; height: auto; touch-action: none; }
      .ajw-hit { position: absolute; inset: 0; cursor: grab; touch-action: none; }
      .ajw-wrap.ajw-dragging .ajw-hit { cursor: grabbing; }
      .ajw-arcfill { opacity: .55; transition: fill .12s linear; }
      .ajw-arm { stroke: var(--ink); stroke-width: 6; stroke-linecap: round; }
      .ajw-arm-top { stroke: var(--stink); }
      .ajw-vertex { fill: var(--ink); }
      .ajw-handle { fill: var(--gold); stroke: var(--ink); stroke-width: 3; }
      .ajw-rightmark { fill: none; stroke: #fff; stroke-width: 3; opacity: 0; transition: opacity .18s; }
      .ajw-wrap.ajw-flat .ajw-arm { filter: drop-shadow(0 0 5px rgba(176,106,134,.85)); }
      .ajw-q { text-align: center; font-weight: 700; font-size: clamp(17px, 3vw, 24px); margin-bottom: 2px; }
      .ajw-sub { text-align: center; font-size: 12.5px; color: #6b5744; font-weight: 500; margin-bottom: 10px; min-height: 16px; }
      .ajw-catchip {
        display: flex; align-items: center; justify-content: center; gap: 8px; margin: 0 auto 10px;
        width: fit-content; padding: 8px 20px; border-radius: 999px; font-weight: 700; font-size: 15px;
        color: #fff; box-shadow: 0 3px 0 rgba(0,0,0,.25); min-height: 20px;
      }
      .ajw-chipicon { font-size: 18px; }
      .ajw-fbbox { margin-top: 12px; text-align: center; border-radius: 14px; padding: 10px 16px; animation: animBubbleIn .34s var(--spring) both; }
      .ajw-fbbox.win { background: linear-gradient(180deg,#E9FBEF,#D3F3DF); border: 3px solid var(--correct); }
      .ajw-fbbox.retry { background: linear-gradient(180deg,#FFF3CE,#FBE29A); border: 3px solid var(--gold-deep); color: #5a4408; font-weight: 600; font-size: 13.5px; }
      .ajw-wp { font-weight: 700; color: #1d8f4e; font-size: 16px; }
      .ajw-wk { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 2px; }
      .ajw-triwrap { position: relative; width: 100%; max-width: 340px; margin: 0 auto; touch-action: none; }
      .ajw-trisvg { display: block; width: 100%; height: auto; touch-action: none; }
      .ajw-trihit { position: absolute; inset: 0; touch-action: none; cursor: grab; }
      .ajw-triwrap.ajw-dragging .ajw-trihit { cursor: grabbing; }
      .ajw-tripoly { fill: rgba(155,89,208,.18); stroke: var(--ink); stroke-width: 4; transition: fill .12s linear; }
      .ajw-tridot { fill: var(--ink); }
      .ajw-trihandle { fill: var(--gold); stroke: var(--ink); stroke-width: 3; }
      .ajw-trilabel { font-size: 15px; font-weight: 700; fill: var(--gold-deep); text-anchor: middle; dominant-baseline: middle; paint-order: stroke; stroke: #fff; stroke-width: 3px; stroke-linejoin: round; }
      .ajw-total { text-align: center; margin-top: 10px; font-weight: 700; font-size: clamp(13px, 2vw, 15px); background: var(--swamp-mid); color: var(--parchment); border-radius: 12px; padding: 9px 14px; box-shadow: 0 3px 0 rgba(0,0,0,.3); }
      .ajw-total b { color: var(--stink-lime); }
      .ajw-total .ajw-total180 { color: var(--gold); }
      .ajw-provebtn[disabled] { opacity: .45; cursor: not-allowed; }
    `);

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const qEl = el('div', 'ajw-q');
    const subEl = el('div', 'ajw-sub');
    const chipCard = el('div', 'ajw-catchip');
    const boardHost = el('div');
    const jawControls = el('div', 'anim-controls');
    const nl = el('button', 'anim-nudge', '−'); nl.setAttribute('aria-label', 'close a little');
    const lockBtn = el('button', 'btn btn-gold', 'LOCK IT IN 🦷');
    const nr = el('button', 'anim-nudge', '+'); nr.setAttribute('aria-label', 'open a little');
    const resetBtn = el('button', 'anim-ghostbtn', '↩ RESET');
    jawControls.append(nl, lockBtn, nr, resetBtn);
    const triControls = el('div', 'anim-controls');
    const proveBtn = el('button', 'btn btn-gold ajw-provebtn', '🤝 PROVE THE PROMISE');
    proveBtn.disabled = true;
    triControls.append(proveBtn);
    const feedbackBox = el('div');
    stage.append(chiprow, qEl, subEl, chipCard, boardHost, jawControls, triControls, feedbackBox);
    host.append(stage);

    const ruleCard = el('div', 'goldcard', RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;';
    host.append(ruleCard);

    const START = 45;
    let board = null;
    let triBoard = null;
    let mi = 0;
    let introShown = false;
    let rightSquareShown = false;

    function paintChips() {
      chiprow.innerHTML = '';
      ALL.forEach((m, i) => {
        const label = m.kind === 'triangle' ? 'TRIANGLE PROMISE' : CATS[m.cat].label;
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), label);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
      const fp = el('button', 'anim-mchip' + (mi === ALL.length ? ' active' : ''), 'FREE PLAY 🎮');
      fp.addEventListener('click', () => { sfx.ui(); start(ALL.length); });
      chiprow.append(fp);
    }

    function teardown() {
      if (board) { board.destroy(); board = null; }
      if (triBoard) { triBoard.destroy(); triBoard = null; }
    }

    function updateChipCard(cat, silent) {
      const c = CATS[cat];
      chipCard.innerHTML = c ? `<span class="ajw-chipicon">${c.icon}</span><span>${c.label}</span>` : '';
      chipCard.style.background = c ? c.color : '';
      if (!silent && c && cat !== 'right' && cat !== 'straight') {
        sfx.blip(cat === 'acute' ? 900 : cat === 'obtuse' ? 560 : 380, 0.07, 0.11);
      }
    }

    function onShapeCount(n) {
      if (n >= 3) { proveBtn.disabled = false; proveBtn.textContent = '🤝 PROVE THE PROMISE'; }
      else { const left = 3 - n; proveBtn.disabled = true; proveBtn.textContent = `🤝 drag ${left} more shape${left === 1 ? '' : 's'}…`; }
    }

    function start(i) {
      mi = i;
      feedbackBox.innerHTML = '';
      teardown();
      paintChips();
      const sandbox = i === ALL.length;
      const m = sandbox ? null : ALL[i];
      const isTri = m && m.kind === 'triangle';
      jawControls.style.display = isTri ? 'none' : '';
      triControls.style.display = isTri ? '' : 'none';
      chipCard.style.display = isTri ? 'none' : '';
      lockBtn.style.display = sandbox ? 'none' : '';
      boardHost.innerHTML = '';

      if (!introShown) { introShown = true; later(() => bubble(stage, { title: 'BEHOLD! 🦷', text: 'Obtusius has flung open his mighty jaw — open it wide or snap it tight, and learn every angle family by its SHAPE alone.', img: OBT_IMG }), 250); }

      if (isTri) {
        qEl.textContent = m.title;
        subEl.textContent = 'Drag Obtusius’s corner. Watch what the three angles always add up to.';
        proveBtn.disabled = true;
        proveBtn.textContent = '🤝 drag 3 more shapes…';
        triBoard = buildTriangle(boardHost, { onShape: onShapeCount });
        return;
      }
      if (sandbox) {
        qEl.textContent = 'FREE PLAY — drag the jaw wide open.';
        subEl.textContent = 'No target here — just explore every family of angle and feel the CLUNKS.';
        let firstPaint = true;
        board = buildJaw(boardHost, { start: START, onCat: (cat) => { updateChipCard(cat, firstPaint); firstPaint = false; } });
        return;
      }
      qEl.textContent = m.title;
      subEl.textContent = m.sub;
      let firstPaint = true;
      board = buildJaw(boardHost, { start: START, onCat: (cat) => { updateChipCard(cat, firstPaint); firstPaint = false; } });
    }

    nl.addEventListener('click', () => { if (board && !board.nudge(-1)) toast(stage, 'Obtusius’s jaw won’t close any further than that!'); });
    nr.addEventListener('click', () => { if (board && !board.nudge(1)) toast(stage, 'Obtusius’s jaw is open as wide as it goes!'); });
    resetBtn.addEventListener('click', () => { sfx.ui(); board && board.resetTo(START); });

    lockBtn.addEventListener('click', () => {
      const m = ALL[mi];
      if (!board || board.busy() || !m || m.kind === 'triangle') return;
      sfx.ui();
      const cat = classify(board.theta);
      if (cat === m.cat) { win(m, cat); return; }
      sfx.nudge();
      feedbackBox.innerHTML = '';
      feedbackBox.append(el('div', 'ajw-fbbox retry', jawFeedback(m.cat, cat)));
    });

    function win(m, cat) {
      doneSet.add(m.id);
      sfx.win(); party(stage);
      sparkleBurst(stage, (stage.clientWidth || 300) / 2, 70);
      paintChips();
      const c = CATS[cat];
      feedbackBox.innerHTML = '';
      const w = el('div', 'ajw-fbbox win', `<div class="ajw-wp">${c.win}</div><div class="ajw-wk">That’s <b>${c.label}</b> — ${c.note}.</div>`);
      feedbackBox.append(w);
      if (doneSet.size === ALL.length) ctx.complete();
      const nextIdx = ALL.findIndex((x) => !doneSet.has(x.id));
      const btn = el('button', 'btn btn-gold', nextIdx !== -1 ? 'NEXT ONE ➡' : 'FREE PLAY 🎮');
      btn.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
      btn.addEventListener('click', () => { sfx.ui(); start(nextIdx !== -1 ? nextIdx : ALL.length); });
      w.append(btn);
      if (cat === 'right' && !rightSquareShown) {
        rightSquareShown = true;
        later(() => bubble(stage, { title: 'SQUARE UP! ⬜', text: SQUARE_MARK, img: OBT_IMG }), 550);
      }
    }

    proveBtn.addEventListener('click', () => {
      if (proveBtn.disabled) return;
      sfx.win(); party(stage);
      sparkleBurst(stage, (stage.clientWidth || 300) / 2, 70);
      doneSet.add('triangle');
      paintChips();
      proveBtn.disabled = true;
      later(() => {
        bubble(stage, { title: 'PROMISE PROVEN! 🤝', text: `${PROMISE} Drag it however wild you like — the total always lands on <b>180°</b>, exactly.`, img: OBT_IMG })
          .then(() => {
            if (!alive) return;
            feedbackBox.innerHTML = '';
            const w = el('div', 'ajw-fbbox win', '<div class="ajw-wp">PROMISE PROVEN! 🤝</div><div class="ajw-wk">Every triangle you drag always totals 180°.</div>');
            feedbackBox.append(w);
            if (doneSet.size === ALL.length) ctx.complete();
            const nextIdx = ALL.findIndex((x) => !doneSet.has(x.id));
            const btn = el('button', 'btn btn-gold', nextIdx !== -1 ? 'NEXT ONE ➡' : 'FREE PLAY 🎮');
            btn.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
            btn.addEventListener('click', () => { sfx.ui(); start(nextIdx !== -1 ? nextIdx : ALL.length); });
            w.append(btn);
          });
      }, 200);
    });

    const onResize = () => { if (!alive) return; if (board) board.abort(); if (triBoard) triBoard.abort(); };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    start(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      teardown();
      stage.remove();
      ruleCard.remove();
    };
  },
};
