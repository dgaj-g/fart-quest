// FART QUEST — js/anims/shapes-2d.js
// POLLY'S SHAPE SHIFTER — interactive polygon machine for the shapes-2d
// Scout Report (Shape Caves). SIDES mode morphs a regular polygon on a
// draggable 3-8 slider; CORNERS mode is a drag-any-corner quadrilateral that
// announces RHOMBUS / RECTANGLE / SQUARE the instant the geometry earns it.

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const POLLY_IMG = 'assets/monsters/polly-gone.png';
const RULE = 'Count the sides, check the angles, look for equal marks — the shape names itself.';

/* ---------- pure geometry (DOM-free — proven in a scratch harness) ---------- */
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function normalize(v) { const m = Math.hypot(v.x, v.y) || 1; return { x: v.x / m, y: v.y / m }; }
function angleAt(prev, at, next) {
  const v1 = { x: prev.x - at.x, y: prev.y - at.y };
  const v2 = { x: next.x - at.x, y: next.y - at.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const m1 = Math.hypot(v1.x, v1.y); const m2 = Math.hypot(v2.x, v2.y);
  const cos = Math.max(-1, Math.min(1, dot / (m1 * m2)));
  return Math.acos(cos) * 180 / Math.PI;
}
const ANGLE_TOL = 7; // degrees either side of 90
const SIDE_TOL = 0.09; // relative tolerance for "equal" sides
function classifyQuad(pts) {
  const sides = [dist(pts[0], pts[1]), dist(pts[1], pts[2]), dist(pts[2], pts[3]), dist(pts[3], pts[0])];
  const angles = [
    angleAt(pts[3], pts[0], pts[1]),
    angleAt(pts[0], pts[1], pts[2]),
    angleAt(pts[1], pts[2], pts[3]),
    angleAt(pts[2], pts[3], pts[0]),
  ];
  const avg = sides.reduce((a, b) => a + b, 0) / 4;
  const tol = avg * SIDE_TOL;
  const allSidesEqual = sides.every((s) => Math.abs(s - avg) <= tol);
  const allRight = angles.every((a) => Math.abs(a - 90) <= ANGLE_TOL);
  return {
    sides, angles, allSidesEqual, allRight,
    isSquare: allSidesEqual && allRight,
    isRectangle: allRight,
    isRhombus: allSidesEqual,
  };
}
// groups sides into equal-length clusters for tick marks; returns [gid,gid,gid,gid]
function equalGroups(sides) {
  const assigned = [-1, -1, -1, -1];
  let gid = 0;
  for (let i = 0; i < 4; i += 1) {
    if (assigned[i] !== -1) continue;
    assigned[i] = gid;
    for (let j = i + 1; j < 4; j += 1) {
      if (assigned[j] !== -1) continue;
      const rel = Math.abs(sides[i] - sides[j]) / ((sides[i] + sides[j]) / 2);
      if (rel <= SIDE_TOL) assigned[j] = gid;
    }
    gid += 1;
  }
  const counts = {};
  assigned.forEach((g) => { counts[g] = (counts[g] || 0) + 1; });
  return { assigned, counts };
}
function regularPolyPts(n, cx, cy, r) {
  // odd n: vertex-up (apex at top, flat base at bottom — matches the topic's
  // own triangle/pentagon artwork). even n: rotate half a step so a flat
  // edge faces up/down (n=4 renders an upright square, not a diamond).
  const rot = n % 2 === 0 ? -90 + 180 / n : -90;
  const pts = [];
  for (let i = 0; i < n; i += 1) {
    const ang = (rot + i * (360 / n)) * Math.PI / 180;
    pts.push({ x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) });
  }
  return pts;
}
function fisherYates(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
// each corner stays inside its own quadrant (plus a generous overlap band)
// so the quad never self-crosses while still reaching an exact square/rect.
const QUAD_BOUNDS = [
  { xmin: 0.03, xmax: 0.62, ymin: 0.06, ymax: 0.62 },
  { xmin: 0.38, xmax: 0.97, ymin: 0.06, ymax: 0.62 },
  { xmin: 0.38, xmax: 0.97, ymin: 0.38, ymax: 0.94 },
  { xmin: 0.03, xmax: 0.62, ymin: 0.38, ymax: 0.94 },
];
function clampCorner(i, p) {
  const b = QUAD_BOUNDS[i];
  return { x: Math.max(b.xmin, Math.min(b.xmax, p.x)), y: Math.max(b.ymin, Math.min(b.ymax, p.y)) };
}

/* ---------- content ---------- */
const SIDE_NAMES = { 3: 'Equilateral Triangle', 4: 'Square', 5: 'Pentagon', 6: 'Hexagon', 7: 'Heptagon', 8: 'Octagon' };
const START_QUADS = {
  rectangle: [{ x: 0.20, y: 0.15 }, { x: 0.80, y: 0.15 }, { x: 0.95, y: 0.85 }, { x: 0.05, y: 0.85 }],
  square: [{ x: 0.28, y: 0.08 }, { x: 0.92, y: 0.24 }, { x: 0.66, y: 0.92 }, { x: 0.14, y: 0.96 }],
};
const QUIZ_QUAD = [{ x: 0.5, y: 0.14 }, { x: 0.84, y: 0.5 }, { x: 0.5, y: 0.86 }, { x: 0.16, y: 0.5 }]; // rhombus, no right angles
const QUIZ_OPTIONS = [
  { text: 'RHOMBUS', correct: true },
  { text: 'SQUARE', why: 'A square DOES have 4 equal sides — but it also always has 4 right angles, which this shape does not.' },
  { text: 'KITE', why: 'A kite has two SEPARATE pairs of equal sides, not all four the same.' },
  { text: 'PARALLELOGRAM', why: 'A parallelogram only needs OPPOSITE sides equal — this shape has ALL FOUR sides equal, which is a stronger clue.' },
];
const MISSIONS = [
  { id: 'pentagon', mode: 'sides', target: 5,
    q: 'Make Polly a <b>pentagon</b>.', sub: 'Slide to set the number of sides, then let go.',
    worked: '5 sides settled → a PENTAGON.' },
  { id: 'rectangle', mode: 'corners', check: 'isRectangle', quad: 'rectangle',
    q: 'Drag me into a <b>rectangle</b>.', sub: 'Move the corners until every angle is a right angle.',
    worked: 'Four right angles, opposite sides equal → a RECTANGLE.' },
  { id: 'square', mode: 'corners', check: 'isSquare', quad: 'square',
    q: 'Now the royal one — a <b>square</b>!', sub: 'Every side equal AND every angle a right angle.',
    worked: 'All 4 sides equal AND all 4 angles right → a SQUARE.' },
  { id: 'namequiz', mode: 'quiz',
    q: 'Name this shape!', sub: '4 sides all equal. No right angles.',
    worked: 'RHOMBUS — 4 equal sides name the family; no right angles rules out square.' },
];

const CSS = `
.pss-q { text-align:center; font-weight:700; font-size: clamp(20px, 3.4vw, 30px); margin-bottom:2px; }
.pss-qsub { text-align:center; font-size:12.5px; color:#6b5744; font-weight:500; margin-bottom:10px; }
.pss-win { margin-top:12px; text-align:center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF); border:3px solid var(--correct); border-radius:14px; padding:10px 14px; animation: animBubbleIn .34s var(--spring) both; }
.pss-win .wp { font-weight:700; color:#1d8f4e; font-size:16px; }
.pss-side-canvas { display:block; margin:0 auto; }
.pss-poly { fill:#8577b0; fill-opacity:.85; stroke:var(--ink); stroke-width:3; transform-box: fill-box; transform-origin: 50% 50%; }
.pss-poly.pss-pop { animation: pssPop .38s var(--spring) both; }
@keyframes pssPop { 0% { transform: scale(1); } 45% { transform: scale(1.14); } 100% { transform: scale(1); } }
.pss-name { text-align:center; font-weight:700; font-size: clamp(17px,3vw,22px); color: var(--stink); min-height: 26px; margin-top: 2px; }
.pss-track-wrap { display:flex; align-items:center; justify-content:center; gap:8px; margin-top:8px; }
.pss-track { position:relative; height:40px; border-radius:20px; background: linear-gradient(180deg,#efe1c4,#e8d7b4); box-shadow: inset 0 3px 8px rgba(51,38,29,.18); touch-action:none; }
.pss-track .pss-stop { position:absolute; top:50%; width:6px; height:6px; border-radius:50%; background: rgba(51,38,29,.22); transform: translate(-50%,-50%); }
.pss-hit { position:absolute; inset: -10px 0; cursor:grab; }
.pss-track.dragging .pss-hit { cursor:grabbing; }
.pss-handle { position:absolute; top:50%; width:36px; height:36px; border-radius:50%; background:#fff; border:3px solid var(--ink); box-shadow: 0 3px 0 rgba(51,38,29,.3); transform: translate(-50%,-50%); pointer-events:none; }
.pss-corners-canvas { position:relative; margin:0 auto; touch-action:none; }
.pss-corners-canvas svg { position:absolute; inset:0; pointer-events:none; overflow:visible; }
.pss-corner-poly { fill:#8577b0; fill-opacity:.55; stroke:var(--ink); stroke-width:3; }
.pss-tick { stroke: var(--stink); stroke-width:3; stroke-linecap:round; }
.pss-badge { fill: var(--gold-deep); stroke: var(--ink); stroke-width: 1.4; }
.pss-corner { position:absolute; left:0; top:0; width:38px; height:38px; margin:-19px 0 0 -19px; border-radius:50%; background:#fff; border:3px solid var(--stink); box-shadow: 0 3px 0 rgba(51,38,29,.3); cursor:grab; }
.pss-corner:active, .pss-corner.pss-dragging { cursor:grabbing; }
.pss-quiz-canvas { position:relative; margin: 4px auto 10px; }
.pss-quiz-canvas svg { display:block; }
.pss-quiz-opts { display:flex; gap:9px; flex-wrap:wrap; justify-content:center; margin-top:10px; }
.pss-opt { background: var(--card); border: 2.5px solid var(--swamp-mid); color: var(--ink); border-radius: 14px; padding: 12px 18px; font-weight:700; font-size:15px; min-height:48px; cursor:pointer; box-shadow: 0 3px 0 rgba(0,0,0,.2); }
.pss-opt.pss-wrong { animation: pssWobble .5s ease; border-color: var(--wrong); }
.pss-opt.pss-right { border-color: var(--correct); background: #E9FBEF; }
@keyframes pssWobble { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-6deg); } 60% { transform: rotate(5deg); } }
.pss-readout { text-align:center; font-weight:700; font-size: 15px; color: var(--gold-deep); min-height: 22px; margin-top: 6px; }
.pss-modes { display:flex; gap:9px; justify-content:center; margin-bottom: 8px; }
`;

/* ---------- SIDES mode board ---------- */
function makeSidesBoard(host, opts) {
  let alive = true;
  const timers = new Set();
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };
  const wrap = el('div');
  const canvas = el('div');
  const svgWrap = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgWrap.setAttribute('class', 'pss-side-canvas');
  const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  poly.setAttribute('class', 'pss-poly');
  svgWrap.appendChild(poly);
  canvas.appendChild(svgWrap);
  const name = el('div', 'pss-name');
  const trackWrap = el('div', 'pss-track-wrap');
  const nlBtn = el('button', 'anim-nudge', '⬅');
  const track = el('div', 'pss-track');
  const hit = el('div', 'pss-hit');
  const handle = el('div', 'pss-handle');
  track.append(hit, handle);
  const nrBtn = el('button', 'anim-nudge', '➡');
  trackWrap.append(nlBtn, track, nrBtn);
  wrap.append(canvas, name, trackWrap);
  host.append(wrap);

  const B = { n: opts.nStart, targetN: opts.nStart, settling: false, cancelTween: null, trackW: 0, W: 0, H: 0, els: { wrap } };

  function stopX(idx) { return idx * (B.trackW / 5); }
  function idxOf(n) { return n - 3; }

  function redraw(n) {
    const cx = B.W / 2; const cy = B.H * 0.46; const r = Math.min(B.W, B.H) * 0.34;
    const pts = regularPolyPts(n, cx, cy, r);
    poly.setAttribute('points', pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
    name.textContent = SIDE_NAMES[n];
  }

  B.layout = function layout() {
    if (B.cancelTween) { B.cancelTween(); B.cancelTween = null; }
    drag.abort();
    track.classList.remove('dragging');
    B.settling = false;
    B.W = Math.max(180, Math.min(320, (host.clientWidth || 340) - 20));
    B.H = Math.round(B.W * 0.62);
    svgWrap.setAttribute('width', B.W); svgWrap.setAttribute('height', B.H);
    canvas.style.width = B.W + 'px';
    B.trackW = Math.max(160, Math.min(260, B.W - 60));
    track.style.width = B.trackW + 'px';
    track.querySelectorAll('.pss-stop').forEach((s) => s.remove());
    for (let i = 0; i < 6; i += 1) {
      const s = el('div', 'pss-stop');
      s.style.left = stopX(i) + 'px';
      track.insertBefore(s, hit);
    }
    handle.style.left = stopX(idxOf(B.n)) + 'px';
    redraw(B.n);
  };

  nlBtn.addEventListener('click', () => B.nudge(-1));
  nrBtn.addEventListener('click', () => B.nudge(1));

  const drag = makeDrag(hit, {
    onStart() {
      if (B.cancelTween) { B.cancelTween(); B.cancelTween = null; }
      B.dragBase = stopX(idxOf(B.n));
      B.lastIdx = idxOf(B.n);
      track.classList.add('dragging');
    },
    onMove(dx) {
      const x = Math.max(0, Math.min(B.trackW, B.dragBase + dx));
      handle.style.left = x + 'px';
      const idx = Math.max(0, Math.min(5, Math.round(x / (B.trackW / 5))));
      if (idx !== B.lastIdx) {
        if (idx > B.lastIdx) sfx.tick(idx); else sfx.tock(5 - idx);
        B.lastIdx = idx;
        redraw(idx + 3);
      }
    },
    onEnd() {
      track.classList.remove('dragging');
      settleTo(B.lastIdx);
    },
  });

  function settleTo(idx) {
    B.targetN = idx + 3;
    B.settling = true;
    const from = parseFloat(handle.style.left) || 0;
    const to = stopX(idx);
    if (B.cancelTween) B.cancelTween();
    B.cancelTween = tween((v) => { handle.style.left = v + 'px'; }, from, to, 260, () => {
      B.settling = false; B.cancelTween = null;
      const changed = B.n !== B.targetN;
      B.n = B.targetN;
      redraw(B.n);
      if (changed) {
        poly.classList.remove('pss-pop'); poly.getBoundingClientRect();
        poly.classList.add('pss-pop');
        later(() => { if (poly.isConnected) poly.classList.remove('pss-pop'); }, 420);
        sfx.pop();
      }
      if (opts.onSettle) opts.onSettle(B.n);
    });
  }

  B.nudge = function nudge(dir) {
    if (drag.dragging()) return;
    const base = B.settling ? idxOf(B.targetN) : idxOf(B.n);
    const idx = Math.max(0, Math.min(5, base + dir));
    if (idx === base) { sfx.nudge(); return; }
    if (dir > 0) sfx.tick(1); else sfx.tock(1);
    settleTo(idx);
  };
  B.reset = function reset() {
    if (drag.dragging()) return;
    settleTo(idxOf(3));
  };
  B.destroy = function destroy() {
    alive = false;
    timers.forEach((t) => clearTimeout(t));
    if (B.cancelTween) B.cancelTween();
    drag.destroy();
    wrap.remove();
  };

  B.layout();
  return B;
}

/* ---------- CORNERS mode board ---------- */
function makeCornersBoard(host, opts) {
  let alive = true;
  const timers = new Set();
  const wrap = el('div', 'pss-corners-canvas');
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  const poly = document.createElementNS(svgNS, 'polygon');
  poly.setAttribute('class', 'pss-corner-poly');
  const tickLayer = document.createElementNS(svgNS, 'g');
  const badgeLayer = document.createElementNS(svgNS, 'g');
  svg.append(poly, tickLayer, badgeLayer);
  wrap.appendChild(svg);
  const readout = el('div', 'pss-readout');
  const cornerEls = [0, 1, 2, 3].map(() => { const c = el('div', 'pss-corner'); wrap.appendChild(c); return c; });
  host.append(wrap, readout);

  const B = { W: 0, H: 0, pts: opts.startFractions.map((p) => ({ ...p })), cancelTween: null, els: { wrap } };
  B.lastLiveClass = null;

  function px(p) { return { x: p.x * B.W, y: p.y * B.H }; }

  function render() {
    const abs = B.pts.map(px);
    poly.setAttribute('points', abs.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
    cornerEls.forEach((c, i) => { c.style.transform = `translate(${abs[i].x}px, ${abs[i].y}px)`; });
    const cls = classifyQuad(abs);
    tickLayer.innerHTML = '';
    const { assigned, counts } = equalGroups(cls.sides);
    for (let i = 0; i < 4; i += 1) {
      const gid = assigned[i];
      if (counts[gid] < 2) continue;
      const count = Math.min(2, gid + 1);
      const p1 = abs[i]; const p2 = abs[(i + 1) % 4];
      const dir = normalize({ x: p2.x - p1.x, y: p2.y - p1.y });
      const perp = { x: -dir.y, y: dir.x };
      const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      for (let k = 0; k < count; k += 1) {
        const off = (k - (count - 1) / 2) * 7;
        const cx = mid.x + dir.x * off; const cy = mid.y + dir.y * off;
        const t = document.createElementNS(svgNS, 'line');
        t.setAttribute('class', 'pss-tick');
        t.setAttribute('x1', cx - perp.x * 6); t.setAttribute('y1', cy - perp.y * 6);
        t.setAttribute('x2', cx + perp.x * 6); t.setAttribute('y2', cy + perp.y * 6);
        tickLayer.appendChild(t);
      }
    }
    badgeLayer.innerHTML = '';
    cls.angles.forEach((a, i) => {
      if (Math.abs(a - 90) > ANGLE_TOL) return;
      const prev = abs[(i + 3) % 4]; const cur = abs[i]; const next = abs[(i + 1) % 4];
      const v1 = normalize({ x: prev.x - cur.x, y: prev.y - cur.y });
      const v2 = normalize({ x: next.x - cur.x, y: next.y - cur.y });
      const bis = normalize({ x: v1.x + v2.x, y: v1.y + v2.y });
      const bx = cur.x + bis.x * 15; const by = cur.y + bis.y * 15;
      const r = document.createElementNS(svgNS, 'rect');
      r.setAttribute('class', 'pss-badge');
      r.setAttribute('x', bx - 5); r.setAttribute('y', by - 5);
      r.setAttribute('width', 10); r.setAttribute('height', 10);
      badgeLayer.appendChild(r);
    });
    let label = '';
    if (cls.isSquare) label = 'SQUARE!'; else if (cls.isRectangle) label = 'RECTANGLE!'; else if (cls.isRhombus) label = 'RHOMBUS!';
    readout.textContent = label;
    return cls;
  }

  B.layout = function layout() {
    if (B.cancelTween) { B.cancelTween(); B.cancelTween = null; }
    cornerDrags.forEach((d) => d.abort());
    B.W = Math.max(220, Math.min(420, (host.clientWidth || 400) - 20));
    B.H = Math.round(B.W * 0.72);
    wrap.style.width = B.W + 'px'; wrap.style.height = B.H + 'px';
    svg.setAttribute('width', B.W); svg.setAttribute('height', B.H);
    render();
  };

  const cornerDrags = cornerEls.map((c, i) => makeDrag(c, {
    onStart() {
      B.dragBase = { ...B.pts[i] };
      c.classList.add('pss-dragging');
    },
    onMove(dx, dy) {
      B.pts[i] = clampCorner(i, { x: B.dragBase.x + dx / B.W, y: B.dragBase.y + dy / B.H });
      const cls = render();
      let live = null;
      if (cls.isSquare) live = 'square'; else if (cls.isRectangle) live = 'rectangle'; else if (cls.isRhombus) live = 'rhombus';
      if (live !== B.lastLiveClass) { if (live) sfx.tick(1); else if (B.lastLiveClass) sfx.tock(1); B.lastLiveClass = live; }
    },
    onEnd() {
      c.classList.remove('pss-dragging');
      const cls = render();
      if (opts.onSettle) opts.onSettle(cls);
    },
  }));

  B.reset = function reset() {
    if (cornerDrags.some((d) => d.dragging())) return;
    const from = B.pts.map((p) => ({ ...p }));
    const to = opts.startFractions.map((p) => ({ ...p }));
    if (B.cancelTween) B.cancelTween();
    B.cancelTween = tween((t) => {
      B.pts = from.map((p, i) => ({ x: p.x + (to[i].x - p.x) * t, y: p.y + (to[i].y - p.y) * t }));
      render();
    }, 0, 1, 320, () => { B.cancelTween = null; B.lastLiveClass = null; });
  };
  B.destroy = function destroy() {
    alive = false;
    timers.forEach((t) => clearTimeout(t));
    if (B.cancelTween) B.cancelTween();
    cornerDrags.forEach((d) => d.destroy());
    wrap.remove();
    readout.remove();
  };

  B.layout();
  return B;
}

/* ---------- QUIZ (name-that-shape) board ---------- */
function makeQuizBoard(host, opts) {
  const wrap = el('div', 'pss-quiz-canvas');
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  const poly = document.createElementNS(svgNS, 'polygon');
  poly.setAttribute('class', 'pss-corner-poly');
  const tickLayer = document.createElementNS(svgNS, 'g');
  svg.append(poly, tickLayer);
  wrap.appendChild(svg);
  const optRow = el('div', 'pss-quiz-opts');
  host.append(wrap, optRow);

  const order = fisherYates(QUIZ_OPTIONS);
  let answered = false;
  order.forEach((opt) => {
    const b = el('button', 'pss-opt', opt.text);
    b.addEventListener('click', () => {
      if (answered) return;
      sfx.ui();
      if (opt.correct) {
        answered = true;
        b.classList.add('pss-right');
        if (opts.onCorrect) opts.onCorrect();
      } else {
        b.classList.remove('pss-wrong'); void b.offsetWidth; b.classList.add('pss-wrong');
        sfx.nudge();
        if (opts.onWrong) opts.onWrong(opt);
      }
    });
    optRow.appendChild(b);
  });

  function draw() {
    const W = Math.max(200, Math.min(300, (host.clientWidth || 320) - 20));
    const H = Math.round(W * 0.8);
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    const abs = QUIZ_QUAD.map((p) => ({ x: p.x * W, y: p.y * H }));
    poly.setAttribute('points', abs.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
    tickLayer.innerHTML = '';
    const cls = classifyQuad(abs);
    const { assigned, counts } = equalGroups(cls.sides);
    for (let i = 0; i < 4; i += 1) {
      if (counts[assigned[i]] < 2) continue;
      const p1 = abs[i]; const p2 = abs[(i + 1) % 4];
      const dir = normalize({ x: p2.x - p1.x, y: p2.y - p1.y });
      const perp = { x: -dir.y, y: dir.x };
      const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      const t = document.createElementNS(svgNS, 'line');
      t.setAttribute('class', 'pss-tick');
      t.setAttribute('x1', mid.x - perp.x * 6); t.setAttribute('y1', mid.y - perp.y * 6);
      t.setAttribute('x2', mid.x + perp.x * 6); t.setAttribute('y2', mid.y + perp.y * 6);
      tickLayer.appendChild(t);
    }
  }
  draw();
  return {
    layout: draw,
    destroy() { wrap.remove(); optRow.remove(); },
  };
}

/* ---------- the anim card ---------- */
export default {
  id: 'shapes-2d',
  title: "POLLY'S SHAPE SHIFTER",

  mount(host, ctx) {
    let alive = true;
    let board = null;
    let mi = 0;
    let curMode = 'sides';
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    injectCss('shapes-2d', CSS);

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const modeRow = el('div', 'pss-modes');
    const q = el('div', 'pss-q');
    const qsub = el('div', 'pss-qsub');
    const boardHost = el('div');
    const winBox = el('div');
    const controls = el('div', 'anim-controls');
    stage.append(chiprow, modeRow, q, qsub, boardHost, winBox, controls);
    host.append(stage);

    const ruleCard = el('div', null, RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;';
    host.append(ruleCard);

    let mission = null;
    let attempts = 0;

    function paintChips() {
      chiprow.innerHTML = '';
      const labels = { pentagon: 'PENTAGON', rectangle: 'RECTANGLE', square: 'SQUARE', namequiz: 'NAME IT' };
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), labels[m.id]);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
      const fp = el('button', 'anim-mchip' + (mi === MISSIONS.length ? ' active' : ''), 'FREE PLAY 🕹️');
      fp.addEventListener('click', () => { sfx.ui(); start(MISSIONS.length); });
      chiprow.append(fp);
    }

    function destroyBoard() { if (board) { board.destroy(); board = null; } }

    function buildSides() {
      curMode = 'sides';
      destroyBoard();
      controls.innerHTML = '';
      const resetBtn = el('button', 'anim-ghostbtn', '↩ RESET');
      resetBtn.addEventListener('click', () => { sfx.ui(); board && board.reset(); });
      controls.append(resetBtn);
      board = makeSidesBoard(boardHost, {
        nStart: 3,
        onSettle(n) { handleSidesSettle(n); },
      });
    }
    function buildCorners(startKey) {
      curMode = 'corners';
      destroyBoard();
      controls.innerHTML = '';
      const resetBtn = el('button', 'anim-ghostbtn', '↩ RESET SHAPE');
      resetBtn.addEventListener('click', () => { sfx.ui(); board && board.reset(); });
      controls.append(resetBtn);
      board = makeCornersBoard(boardHost, {
        startFractions: START_QUADS[startKey],
        onSettle(cls) { handleCornersSettle(cls); },
      });
    }
    function buildQuiz() {
      curMode = 'quiz';
      destroyBoard();
      controls.innerHTML = '';
      board = makeQuizBoard(boardHost, {
        onCorrect() { win(); },
        onWrong(opt) {
          bubble(stage, { title: 'NOT QUITE! 🔎', text: opt.why, img: POLLY_IMG });
        },
      });
    }

    function handleSidesSettle(n) {
      if (!mission || mission.mode !== 'sides') return;
      if (n === mission.target) { win(); return; }
      attempts += 1;
      sfx.nudge();
      let text = `That's a <b>${SIDE_NAMES[n]}</b> — not quite what Polly needs. Slide again and watch the name change!`;
      if (attempts >= 2) text += `<br><br>🎩 Psst: count to exactly <b>${mission.target} sides</b> for this one.`;
      bubble(stage, { title: 'KEEP SLIDING! 💪', text, img: POLLY_IMG });
    }
    function handleCornersSettle(cls) {
      if (!mission || mission.mode !== 'corners') return;
      const matched = cls[mission.check];
      if (matched) { win(); return; }
      attempts += 1;
      if (cls.isRectangle || cls.isRhombus || cls.isSquare) {
        // achievement toast for the shape they actually made, without a wrong-answer sting
        const label = cls.isSquare ? 'SQUARE' : cls.isRectangle ? 'RECTANGLE' : 'RHOMBUS';
        toast(stage, `✨ ${label}! Not the one Polly asked for this time — keep dragging.`);
      } else if (attempts >= 3) {
        bubble(stage, {
          title: 'KEEP DRAGGING! 💪',
          text: mission.check === 'isSquare'
            ? 'Look for the little gold squares landing on EVERY corner, and equal tick marks on ALL FOUR sides at once.'
            : 'Look for the little gold squares landing on EVERY corner — that\'s the right-angle badge.',
          img: POLLY_IMG,
        });
      } else sfx.nudge();
    }

    function start(i) {
      mi = i; attempts = 0;
      winBox.innerHTML = '';
      paintChips();
      const sandbox = i === MISSIONS.length;
      mission = sandbox ? null : MISSIONS[i];
      if (sandbox) {
        modeRow.innerHTML = '';
        const sBtn = el('button', 'anim-mchip active', 'SIDES MODE');
        const cBtn = el('button', 'anim-mchip', 'CORNERS MODE');
        sBtn.addEventListener('click', () => { sfx.ui(); sBtn.classList.add('active'); cBtn.classList.remove('active'); buildSides(); q.innerHTML = 'Free play — slide the sides!'; qsub.textContent = 'Watch Polly gasp as she gains and loses sides.'; });
        cBtn.addEventListener('click', () => { sfx.ui(); cBtn.classList.add('active'); sBtn.classList.remove('active'); buildCorners('rectangle'); q.innerHTML = 'Free play — drag the corners!'; qsub.textContent = 'Chase RHOMBUS, RECTANGLE and SQUARE.'; });
        modeRow.append(sBtn, cBtn);
        q.innerHTML = 'Free play — slide the sides!';
        qsub.textContent = 'Watch Polly gasp as she gains and loses sides.';
        buildSides();
        return;
      }
      modeRow.innerHTML = '';
      q.innerHTML = mission.q;
      qsub.textContent = mission.sub;
      if (mission.mode === 'sides') buildSides();
      else if (mission.mode === 'corners') buildCorners(mission.quad);
      else buildQuiz();
    }

    function win() {
      if (mission) doneSet.add(mission.id);
      sfx.win();
      party(stage);
      const r = boardHost.getBoundingClientRect(); const sr = stage.getBoundingClientRect();
      sparkleBurst(stage, r.left - sr.left + r.width / 2, r.top - sr.top + r.height / 2);
      paintChips();
      winBox.innerHTML = '';
      const w = el('div', 'pss-win', `<div class="wp">${mission ? mission.worked || 'NICE ONE! 🎉' : 'SORTED!'}</div>`);
      winBox.append(w);
      if (mission && mission.id === 'square') {
        later(() => bubble(stage, {
          title: 'FAMILY SECRET! 👑',
          text: 'A square is <b>ALWAYS</b> a rectangle (4 right angles, opposite sides equal) AND <b>ALWAYS</b> a rhombus (4 equal sides). But a rectangle isn\'t always a square, and a rhombus isn\'t always a square — <b>family loyalty only flows one way!</b>',
          img: POLLY_IMG,
        }), 500);
      }
      if (doneSet.size === MISSIONS.length) ctx.complete();
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
