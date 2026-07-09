// FART QUEST — js/anims/symmetry.js
// THE FOLD TEST — interactive mirror-line machine for the symmetry Scout
// Report (Shape Caves). Every candidate line is judged the only way that
// counts: physically fold it (a real 180° flip about that line, done with a
// CSS 3D rotation) and see whether every point lands on its twin.

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const REFLECTO_IMG = 'assets/monsters/reflecto.png';
const RULE = 'Imagine folding on the line — every point must land exactly on its twin.';

/* ---------- pure fold geometry (DOM-free — proven in a scratch harness) ----------
   A rectangle of half-width a, half-height b, centred on the origin. For any
   candidate mirror line through the centre we split the rectangle into a
   STATIC half and a MOVING half. Rotating the moving half 180° about the
   line (an in-plane axis through the origin) is mathematically identical to
   reflecting it across that line — so "matches" is simply: does the
   reflected moving polygon land on the static polygon? */
function normalize(v) { const m = Math.hypot(v.x, v.y) || 1; return { x: v.x / m, y: v.y / m }; }
function reflect(p, axis) {
  const d = p.x * axis.x + p.y * axis.y;
  return { x: 2 * d * axis.x - p.x, y: 2 * d * axis.y - p.y };
}
function near(p, q, eps) { return Math.hypot(p.x - q.x, p.y - q.y) <= eps; }

function foldGeometry(a, b, lineKey, eps = 0.6) {
  let staticPts; let movingPts; let axis;
  if (lineKey === 'v') {
    axis = { x: 0, y: 1 };
    staticPts = [{ x: -a, y: -b }, { x: 0, y: -b }, { x: 0, y: b }, { x: -a, y: b }];
    movingPts = [{ x: 0, y: -b }, { x: a, y: -b }, { x: a, y: b }, { x: 0, y: b }];
  } else if (lineKey === 'h') {
    axis = { x: 1, y: 0 };
    staticPts = [{ x: -a, y: -b }, { x: a, y: -b }, { x: a, y: 0 }, { x: -a, y: 0 }];
    movingPts = [{ x: -a, y: 0 }, { x: a, y: 0 }, { x: a, y: b }, { x: -a, y: b }];
  } else if (lineKey === 'd1') {
    axis = normalize({ x: a, y: b });
    staticPts = [{ x: -a, y: -b }, { x: -a, y: b }, { x: a, y: b }];
    movingPts = [{ x: -a, y: -b }, { x: a, y: -b }, { x: a, y: b }];
  } else { // d2
    axis = normalize({ x: a, y: -b });
    staticPts = [{ x: -a, y: b }, { x: a, y: b }, { x: a, y: -b }];
    movingPts = [{ x: -a, y: b }, { x: -a, y: -b }, { x: a, y: -b }];
  }
  const reflected = movingPts.map((p) => reflect(p, axis));
  const matches = reflected.every((rp) => staticPts.some((sp) => near(rp, sp, eps)));
  return { staticPts, movingPts, reflected, axis, matches };
}

const LINES = [
  { key: 'v', label: 'VERTICAL ↕' },
  { key: 'h', label: 'HORIZONTAL ↔' },
  { key: 'd1', label: 'DIAGONAL ⤢' },
  { key: 'd2', label: 'DIAGONAL ⤡' },
];
const LINE_NOUN = { v: 'The vertical fold', h: 'The horizontal fold', d1: 'That diagonal fold', d2: 'The other diagonal fold' };
const SHAPES = { rectangle: { a: 95, b: 58 }, square: { a: 70, b: 70 } };
const FOLD_MARGIN = 65; // room in the viewBox for an overhang to poke into

function fisherYates(arr) {
  const a2 = arr.slice();
  for (let i = a2.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a2[i], a2[j]] = [a2[j], a2[i]];
  }
  return a2;
}

/* ---------- content ---------- */
const MISSIONS = [
  { id: 'rect', kind: 'fold', shape: 'rectangle', chip: 'RECTANGLE',
    q: 'Fold Reflecto’s <b>rectangle</b> along all four lines.',
    sub: 'Pick a line below, then drag the handle across to fold it — does it land on its twin?' },
  { id: 'square', kind: 'fold', shape: 'square', chip: 'SQUARE',
    q: 'Now fold the <b>square</b>.',
    sub: 'Test all four lines again. Reflecto reckons this shape is extra special…' },
  { id: 'twin', kind: 'twin', chip: 'TWIN ROCKET',
    q: 'Paint the missing half of the rocket.',
    sub: 'Tap squares on the right — same distance from the fold line as their twin on the left. Then fold to check.' },
  { id: 'letters', kind: 'letters', chip: 'LETTER PARADE',
    q: 'Which letters have a vertical line of symmetry?',
    sub: 'Tap every letter that folds perfectly down the middle, then check your line-up.' },
];

const ROCKET_LEFT = [ // rows × 4 cols; col0 = outer edge, col3 = nearest the fold
  [0, 0, 0, 1],
  [0, 0, 1, 1],
  [0, 1, 1, 1],
  [1, 1, 1, 1],
  [1, 0, 1, 1],
  [1, 1, 0, 1],
];
const G_ROWS = ROCKET_LEFT.length;
const G_HALF = 4;
const G_COLS = G_HALF * 2;

const LETTER_POOL = [
  { ch: 'A', sym: true }, { ch: 'H', sym: true }, { ch: 'M', sym: true }, { ch: 'T', sym: true },
  { ch: 'F', sym: false }, { ch: 'G', sym: false },
];

const CSS = `
.fld-linerow { margin-bottom: 4px; }
.fld-linechip.fld-ok::after { content: ' ✓'; color: var(--correct); }
.fld-linechip.fld-bad2::after { content: ' ✗'; color: var(--wrong); }
.fld-lane { display: flex; justify-content: center; margin: 8px 0 4px; }
.fld-lane.dragging .fld-hit { cursor: grabbing; }
.fld-stage3d { position: relative; perspective: 900px; }
.fld-stage3d svg { display: block; overflow: visible; }
.fld-half { position: absolute; inset: 0; z-index: 1; }
.fld-poly-static { fill: #7B5FBF; fill-opacity: .5; stroke: var(--ink); stroke-width: 3; }
.fld-poly-moving { fill: #A78BFA; fill-opacity: .88; stroke: var(--ink); stroke-width: 3; }
.fld-fenceline { stroke: #8a6d3b; stroke-width: 3; stroke-dasharray: 7 6; opacity: .65; }
.fld-movingwrap { position: absolute; inset: 0; z-index: 2; will-change: transform; }
.fld-movingshake { width: 100%; height: 100%; }
.fld-movingshake.fld-bad { animation: fldFlap .5s ease 2; }
@keyframes fldFlap {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-6deg) translate(2px, -2px); }
  60% { transform: rotate(5deg) translate(-2px, 2px); }
  80% { transform: rotate(-3deg); }
}
.fld-stage3d.fld-good .fld-poly { filter: drop-shadow(0 0 9px rgba(46,204,113,.85)); }
.fld-hit {
  position: absolute; left: 0; top: 0; width: 52px; height: 52px; margin: -26px 0 0 -26px;
  border-radius: 50%; background: rgba(255,255,255,.85); border: 3px solid var(--gold-deep);
  display: flex; align-items: center; justify-content: center; font-size: 22px; z-index: 5;
  cursor: grab; box-shadow: 0 3px 0 rgba(0,0,0,.25); touch-action: none;
}
.fld-twinwrap { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 6px; }
.fld-grid { position: relative; display: grid; gap: 2px; }
.fld-grid.fld-grid-folding { animation: fldGridFold .5s ease; }
@keyframes fldGridFold { 0% { filter: brightness(1); } 40% { filter: brightness(1.35); transform: scale(1.015); } 100% { filter: brightness(1); transform: scale(1); } }
.fld-cell { border: 2px solid rgba(51,38,29,.18); border-radius: 4px; background: rgba(255,255,255,.35); }
.fld-cell-fixed.fld-cell-filled { background: #A78BFA; border-color: var(--ink); }
.fld-cell-edit { cursor: pointer; border-style: dashed; }
.fld-cell-edit.fld-cell-filled { background: #A78BFA; border-color: var(--ink); border-style: solid; }
.fld-cell-ok { box-shadow: inset 0 0 0 3px var(--correct); }
.fld-cell-missing { box-shadow: inset 0 0 0 3px var(--gold-deep); animation: fldPulse 1s ease-in-out infinite; }
.fld-cell-wrong { box-shadow: inset 0 0 0 3px var(--wrong); animation: fldFlap .5s ease 1; }
@keyframes fldPulse { 0%, 100% { opacity: 1; } 50% { opacity: .45; } }
.fld-gridfence { position: absolute; top: 0; width: 0; border-left: 3px dashed #8a6d3b; opacity: .6; }
.fld-letterwrap { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 6px; }
.fld-letterrow { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
.fld-letter {
  position: relative; width: 62px; height: 70px; border-radius: 14px; background: var(--card);
  border: 3px solid var(--swamp-mid); box-shadow: 0 3px 0 rgba(0,0,0,.22); cursor: pointer;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.fld-lmirror { position: absolute; top: 6px; bottom: 6px; left: 50%; width: 0; border-left: 2px dashed rgba(51,38,29,.4); }
.fld-lch { font-size: 30px; font-weight: 800; color: var(--ink); position: relative; }
.fld-lchosen { border-color: var(--gold-deep); background: #FFF3D0; }
.fld-lok { border-color: var(--correct); background: #E9FBEF; }
.fld-lok .fld-lmirror { border-left-color: var(--correct); }
.fld-lbad { border-color: var(--wrong); animation: fldFlap .5s ease 1; }
.fld-lmiss { border-color: var(--gold-deep); animation: fldPulse 1s ease-in-out infinite; }
`;

/* ---------- FOLD board (rectangle / square missions) ---------- */
const SVGNS = 'http://www.w3.org/2000/svg';
function makeFoldBoard(host, opts) {
  let alive = true;
  const timers = new Set();
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); return id; };

  const wrap = el('div');
  const lineRow = el('div', 'anim-chiprow fld-linerow');
  const laneWrap = el('div', 'fld-lane');
  const stageDiv = el('div', 'fld-stage3d');
  const staticSvg = document.createElementNS(SVGNS, 'svg');
  staticSvg.setAttribute('class', 'fld-half');
  const staticPoly = document.createElementNS(SVGNS, 'polygon');
  staticPoly.setAttribute('class', 'fld-poly-static');
  const fenceLine = document.createElementNS(SVGNS, 'line');
  fenceLine.setAttribute('class', 'fld-fenceline');
  staticSvg.append(staticPoly, fenceLine);
  const movingOuter = el('div', 'fld-movingwrap');
  const movingShake = el('div', 'fld-movingshake');
  const movingSvg = document.createElementNS(SVGNS, 'svg');
  const movingPoly = document.createElementNS(SVGNS, 'polygon');
  movingPoly.setAttribute('class', 'fld-poly-moving');
  movingSvg.append(movingPoly);
  movingShake.append(movingSvg);
  movingOuter.append(movingShake);
  const hit = el('div', 'fld-hit', '✋');
  stageDiv.append(staticSvg, movingOuter, hit);
  laneWrap.append(stageDiv);
  wrap.append(lineRow, laneWrap);
  host.append(wrap);

  const B = {
    a: opts.a, b: opts.b, lineKey: 'v', angle: 0, W: 0, H: 0, scale: 1, vbHalfW: 0, vbHalfH: 0,
    cancelTween: null, cancelReturn: null, tested: { v: null, h: null, d1: null, d2: null }, els: { wrap },
  };
  let geo = null; let handleStart = { x: 0, y: 0 }; let handleEnd = { x: 0, y: 0 };
  let dragVec = { x: 1, y: 0 }; let dragLen = 1;

  function pxOf(p) { return { x: (p.x + B.vbHalfW) * B.scale, y: (p.y + B.vbHalfH) * B.scale }; }
  function ptsAttr(pts) { return pts.map(pxOf).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '); }

  function paintChips() {
    lineRow.innerHTML = '';
    LINES.forEach((L) => {
      const t = B.tested[L.key];
      const cls = 'anim-mchip fld-linechip' + (B.lineKey === L.key ? ' active' : '') + (t === true ? ' fld-ok' : t === false ? ' fld-bad2' : '');
      const c = el('button', cls, L.label);
      c.addEventListener('click', () => { sfx.ui(); B.setLine(L.key); });
      lineRow.append(c);
    });
  }

  function applyAngle(deg) {
    B.angle = deg;
    const t = deg / 180;
    movingOuter.style.transform = `rotate3d(${geo.axis.x},${geo.axis.y},0,${deg.toFixed(1)}deg)`;
    const bright = 0.55 + 0.45 * Math.abs(Math.cos((deg * Math.PI) / 180));
    movingOuter.style.filter = `brightness(${bright.toFixed(2)})`;
    hit.style.left = (handleStart.x + (handleEnd.x - handleStart.x) * t) + 'px';
    hit.style.top = (handleStart.y + (handleEnd.y - handleStart.y) * t) + 'px';
  }

  function clearPending() {
    if (B.cancelTween) { B.cancelTween(); B.cancelTween = null; }
    if (B.cancelReturn) { clearTimeout(B.cancelReturn); timers.delete(B.cancelReturn); B.cancelReturn = null; }
    stageDiv.classList.remove('fld-good');
    movingShake.classList.remove('fld-bad');
  }

  function rebuildLine(key) {
    B.lineKey = key;
    geo = foldGeometry(B.a, B.b, key);
    staticPoly.setAttribute('points', ptsAttr(geo.staticPts));
    movingPoly.setAttribute('points', ptsAttr(geo.movingPts));
    const fenceLocal = key === 'v' ? [{ x: 0, y: -B.b }, { x: 0, y: B.b }]
      : key === 'h' ? [{ x: -B.a, y: 0 }, { x: B.a, y: 0 }]
      : key === 'd1' ? [{ x: -B.a, y: -B.b }, { x: B.a, y: B.b }]
      : [{ x: -B.a, y: B.b }, { x: B.a, y: -B.b }];
    const f0 = pxOf(fenceLocal[0]); const f1 = pxOf(fenceLocal[1]);
    fenceLine.setAttribute('x1', f0.x); fenceLine.setAttribute('y1', f0.y);
    fenceLine.setAttribute('x2', f1.x); fenceLine.setAttribute('y2', f1.y);
    const perp = { x: -geo.axis.y, y: geo.axis.x };
    let best = 0; let bestD = -1;
    geo.movingPts.forEach((p, i) => { const d = Math.abs(p.x * perp.x + p.y * perp.y); if (d > bestD) { bestD = d; best = i; } });
    handleStart = pxOf(geo.movingPts[best]);
    handleEnd = pxOf(geo.reflected[best]);
    movingOuter.style.transformOrigin = '50% 50%';
    applyAngle(0);
  }

  B.setLine = function setLine(key) {
    if (drag.dragging()) return;
    clearPending();
    rebuildLine(key);
    paintChips();
  };

  let dragBaseT = 0;
  const drag = makeDrag(hit, {
    onStart() {
      dragBaseT = B.angle / 180;
      clearPending();
      dragVec = { x: handleEnd.x - handleStart.x, y: handleEnd.y - handleStart.y };
      dragLen = Math.hypot(dragVec.x, dragVec.y) || 1;
      laneWrap.classList.add('dragging');
    },
    onMove(dx, dy) {
      const proj = (dx * dragVec.x + dy * dragVec.y) / dragLen;
      const t = Math.max(0, Math.min(1, dragBaseT + proj / dragLen));
      applyAngle(t * 180);
    },
    onEnd() {
      laneWrap.classList.remove('dragging');
      settleTo(B.angle / 180 >= 0.5 ? 180 : 0);
    },
  });

  function settleTo(target) {
    if (B.cancelTween) B.cancelTween();
    const from = B.angle;
    B.cancelTween = tween((v) => applyAngle(v), from, target, 300, () => {
      B.cancelTween = null;
      if (target === 180) {
        const match = geo.matches;
        sfx[match ? 'sparkle' : 'nudge']();
        stageDiv.classList.toggle('fld-good', match);
        movingShake.classList.toggle('fld-bad', !match);
        B.tested[B.lineKey] = match;
        paintChips();
        if (opts.onSettle) opts.onSettle(match, B.lineKey);
        B.cancelReturn = later(() => { clearPending(); settleTo(0); }, 1050);
      }
    });
  }

  B.layout = function layout() {
    clearPending();
    drag.abort();
    laneWrap.classList.remove('dragging');
    B.vbHalfW = B.a + FOLD_MARGIN; B.vbHalfH = B.b + FOLD_MARGIN;
    const availW = Math.max(220, Math.min(320, (host.clientWidth || 640) - 40));
    B.scale = availW / (B.vbHalfW * 2);
    B.W = Math.round(B.vbHalfW * 2 * B.scale);
    B.H = Math.round(B.vbHalfH * 2 * B.scale);
    stageDiv.style.width = B.W + 'px'; stageDiv.style.height = B.H + 'px';
    [staticSvg, movingSvg].forEach((s) => { s.setAttribute('width', B.W); s.setAttribute('height', B.H); });
    rebuildLine(B.lineKey);
  };

  B.destroy = function destroy() {
    alive = false;
    timers.forEach((t) => clearTimeout(t));
    if (B.cancelTween) B.cancelTween();
    drag.destroy();
    wrap.remove();
  };

  B.layout();
  paintChips();
  return B;
}

/* ---------- TWIN GRID board (mission 3) ---------- */
function makeTwinGrid(host, opts) {
  let alive = true;
  const wrap = el('div', 'fld-twinwrap');
  const gridEl = el('div', 'fld-grid');
  const fence = el('div', 'fld-gridfence');
  const cells = [];
  for (let r = 0; r < G_ROWS; r += 1) {
    const row = [];
    for (let c = 0; c < G_COLS; c += 1) {
      const cell = el('div', 'fld-cell' + (c < G_HALF ? ' fld-cell-fixed' : ' fld-cell-edit'));
      if (c < G_HALF) {
        if (ROCKET_LEFT[r][c]) cell.classList.add('fld-cell-filled');
      } else {
        cell.addEventListener('click', () => {
          sfx.ui();
          cell.classList.toggle('fld-cell-filled');
          cell.classList.remove('fld-cell-ok', 'fld-cell-missing', 'fld-cell-wrong');
        });
      }
      gridEl.appendChild(cell);
      row.push(cell);
    }
    cells.push(row);
  }
  gridEl.appendChild(fence);
  const checkBtn = el('button', 'btn btn-gold', 'FOLD TO CHECK 🪞');
  wrap.append(gridEl, checkBtn);
  host.append(wrap);

  function layout() {
    const availW = Math.max(220, Math.min(300, (host.clientWidth || 640) - 30));
    const size = Math.max(24, Math.floor(availW / G_COLS));
    gridEl.style.gridTemplateColumns = `repeat(${G_COLS}, ${size}px)`;
    gridEl.style.gridTemplateRows = `repeat(${G_ROWS}, ${size}px)`;
    fence.style.left = (G_HALF * (size + 2)) + 'px';
    fence.style.height = (G_ROWS * (size + 2)) + 'px';
  }

  let solved = false;
  checkBtn.addEventListener('click', () => {
    if (!alive) return;
    sfx.ui();
    gridEl.classList.remove('fld-grid-folding'); void gridEl.offsetWidth; gridEl.classList.add('fld-grid-folding');
    let allOk = true;
    for (let r = 0; r < G_ROWS; r += 1) {
      for (let c = G_HALF; c < G_COLS; c += 1) {
        const expected = !!ROCKET_LEFT[r][G_COLS - 1 - c];
        const actual = cells[r][c].classList.contains('fld-cell-filled');
        cells[r][c].classList.remove('fld-cell-ok', 'fld-cell-missing', 'fld-cell-wrong');
        if (expected && actual) cells[r][c].classList.add('fld-cell-ok');
        else if (expected && !actual) { cells[r][c].classList.add('fld-cell-missing'); allOk = false; }
        else if (!expected && actual) { cells[r][c].classList.add('fld-cell-wrong'); allOk = false; }
      }
    }
    if (allOk) { if (!solved) { solved = true; sfx.win(); if (opts.onComplete) opts.onComplete(); } }
    else { sfx.nudge(); if (opts.onWrong) opts.onWrong(); }
  });

  layout();
  return {
    layout,
    destroy() { alive = false; wrap.remove(); },
  };
}

/* ---------- LETTER PARADE board (mission 4) ---------- */
function makeLetterParade(host, opts) {
  let alive = true;
  const wrap = el('div', 'fld-letterwrap');
  const row = el('div', 'fld-letterrow');
  const order = fisherYates(LETTER_POOL);
  const tiles = order.map((L) => {
    const t = el('button', 'fld-letter', `<span class="fld-lmirror"></span><span class="fld-lch">${L.ch}</span>`);
    t.dataset.sym = L.sym ? '1' : '0';
    t.addEventListener('click', () => {
      if (!alive) return;
      sfx.ui();
      t.classList.toggle('fld-lchosen');
      t.classList.remove('fld-lok', 'fld-lbad', 'fld-lmiss');
    });
    row.append(t);
    return t;
  });
  const checkBtn = el('button', 'btn btn-gold', 'CHECK MY LINE-UP 🪞');
  wrap.append(row, checkBtn);
  host.append(wrap);

  let solved = false;
  checkBtn.addEventListener('click', () => {
    if (!alive) return;
    sfx.ui();
    let allOk = true;
    tiles.forEach((t) => {
      const sym = t.dataset.sym === '1';
      const chosen = t.classList.contains('fld-lchosen');
      t.classList.remove('fld-lok', 'fld-lbad', 'fld-lmiss');
      if (sym && chosen) t.classList.add('fld-lok');
      else if (!sym && chosen) { t.classList.add('fld-lbad'); allOk = false; }
      else if (sym && !chosen) { t.classList.add('fld-lmiss'); allOk = false; }
    });
    if (allOk) { if (!solved) { solved = true; sfx.win(); if (opts.onComplete) opts.onComplete(); } }
    else { sfx.nudge(); if (opts.onWrong) opts.onWrong(); }
  });

  return {
    layout() {},
    destroy() { alive = false; wrap.remove(); },
  };
}

/* ---------- the anim card ---------- */
export default {
  id: 'symmetry',
  title: 'THE FOLD TEST',

  mount(host, ctx) {
    let alive = true;
    let board = null;
    let mi = 0;
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    injectCss('symmetry', CSS);

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'som-q');
    const qsub = el('div', 'som-qsub');
    const boardHost = el('div');
    const winBox = el('div');
    stage.append(chiprow, q, qsub, boardHost, winBox);
    host.append(stage);

    const ruleCard = el('div', null, RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;';
    host.append(ruleCard);

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), m.chip);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
    }

    function destroyBoard() { if (board) { board.destroy(); board = null; } }

    function handleFoldSettle(m, match, key) {
      if (!alive || !board) return;
      const nm = LINE_NOUN[key];
      toast(stage, match ? `✨ ${nm} — a perfect twin!` : `💥 ${nm} — a corner pokes out, no twin here!`);
      const vals = Object.values(board.tested);
      if (vals.every((v) => v !== null) && !doneSet.has(m.id)) {
        const tally = vals.filter(Boolean).length;
        later(() => {
          if (!alive || MISSIONS[mi] !== m) return;
          if (m.shape === 'square') {
            bubble(stage, {
              title: 'GOLDEN! ALL FOUR FOLD! 🏆',
              text: `Every single line landed a perfect twin — <b>${tally} lines of symmetry</b>. A square’s four equal sides let even the diagonals fold true, not just the vertical and horizontal.`,
              img: REFLECTO_IMG,
            }).then(() => win(m, `Vertical, horizontal AND both diagonals — ${tally} lines of symmetry. A square is that special.`));
          } else {
            bubble(stage, {
              title: 'THE RECTANGLE TRAP! 🪤',
              text: `Only <b>${tally}</b> line${tally === 1 ? '' : 's'} actually work — vertical and horizontal. NOT 4! A rectangle’s sides come in two different lengths, so the diagonals betray you: fold corner to corner and a corner sticks out.`,
              img: REFLECTO_IMG,
            }).then(() => win(m, `Vertical and horizontal fold true — ${tally} lines of symmetry, not 4. The diagonals don’t match.`));
          }
        }, 300);
      }
    }

    function start(i) {
      mi = i; winBox.innerHTML = ''; destroyBoard(); paintChips();
      const m = MISSIONS[i];
      q.innerHTML = m.q; qsub.textContent = m.sub;
      boardHost.innerHTML = '';
      if (m.kind === 'fold') {
        const shape = SHAPES[m.shape];
        board = makeFoldBoard(boardHost, {
          a: shape.a, b: shape.b,
          onSettle(match, key) { handleFoldSettle(m, match, key); },
        });
      } else if (m.kind === 'twin') {
        board = makeTwinGrid(boardHost, {
          onComplete() {
            later(() => {
              if (!alive || MISSIONS[mi] !== m) return;
              bubble(stage, {
                title: 'PERFECT TWINS! 🚀',
                text: 'Every point found its twin — same distance from the fold line, but on the opposite side. That’s the whole trick, on a shape OR a grid.',
                img: REFLECTO_IMG,
              }).then(() => win(m, 'Every square found its twin — the rocket is complete!'));
            }, 200);
          },
          onWrong() { toast(stage, '🎨 Not twinned yet — red squares don’t belong there, glowing gold squares are still hiding. Fix them and fold again!'); },
        });
      } else {
        board = makeLetterParade(boardHost, {
          onComplete() {
            later(() => {
              if (!alive || MISSIONS[mi] !== m) return;
              bubble(stage, {
                title: 'LINE-UP CORRECT! 🎉',
                text: 'A, H, M and T all fold perfectly down the middle — F and G never had a hope, their shapes don’t balance on either side of any vertical line.',
                img: REFLECTO_IMG,
              }).then(() => win(m, 'A H M T fold true down the middle — F and G never could.'));
            }, 200);
          },
          onWrong() { toast(stage, '🪞 Not quite lined up — green means matched, red should hop back off, gold is still hiding. Try again!'); },
        });
      }
    }

    function win(m, workedHtml) {
      if (!alive || MISSIONS[mi] !== m) return;
      doneSet.add(m.id);
      sfx.win(); party(stage);
      const r = boardHost.getBoundingClientRect(); const sr = stage.getBoundingClientRect();
      sparkleBurst(stage, r.left - sr.left + r.width / 2, r.top - sr.top + Math.min(120, r.height / 2));
      paintChips();
      winBox.innerHTML = '';
      const w = el('div', 'som-win', `<div class="wp">TWINNED! 🪞</div><div class="wk">${workedHtml}</div>`);
      winBox.append(w);
      if (doneSet.size === MISSIONS.length) ctx.complete();
      const nextIdx = MISSIONS.findIndex((mm) => !doneSet.has(mm.id));
      if (nextIdx !== -1) {
        const nb = el('button', 'btn btn-gold', 'NEXT ONE ➡');
        nb.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
        nb.addEventListener('click', () => { sfx.ui(); start(nextIdx); });
        w.append(nb);
      } else {
        ctx.complete();
      }
    }

    const onResize = () => { if (board && board.layout) board.layout(); };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    start(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      destroyBoard();
      stage.remove();
      ruleCard.remove();
    };
  },
};
