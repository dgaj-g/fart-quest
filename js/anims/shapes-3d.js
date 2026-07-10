// FART QUEST — js/anims/shapes-3d.js
// SIR FACELOT'S TAG COUNT — a real CSS-3D solid the child spins by dragging.
// Three tag modes (FACES/EDGES/VERTICES) build the strict-order count; a
// pyramid speed-round, a triangular-prism tie-breaker round, and a curved
// cylinder guest round out the Solid Cellar. Prefix: sfc.
//
// SPEC_CANON.md audit note: the former ③ mission was "DOES IT FOLD?" (cube-net
// folding) — removed entirely, since no spec bullet names nets and Section C has
// zero PP1/PP2 citation for a net-folding question. It is replaced by a triangular
// prism tag-and-count mission (bullet 38 + PP2 Q55 FEV-recall style), which also
// dramatises the topic's own "Face-Count Trap" teaching card (a triangular prism
// and a square-based pyramid both have 5 faces — edges/vertices tell them apart).
// Do not re-add net content without a spec bullet or paper citation (Section D).

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const IMG = 'assets/monsters/sir-facelot.png';
const RULE = 'Faces are flat, edges are where faces meet, vertices are the corners. Count in that order.';

/* ---------- pure 3D geometry engine (proven in /tmp/geom-test.mjs) ---------- */
function sub(a, b) { return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }; }
function add(a, b) { return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }; }
function scl(a, s) { return { x: a.x * s, y: a.y * s, z: a.z * s }; }
function dot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }
function cross(a, b) { return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }; }
function vlen(a) { return Math.sqrt(dot(a, a)) || 1; }
function vnorm(a) { const l = vlen(a); return { x: a.x / l, y: a.y / l, z: a.z / l }; }

// Orthographic re-projection of the SAME rotation the pivot's CSS transform applies
// (rotateX(rx) rotateY(ry), composed as Rx(Ry(p)) — verified against real getBoundingClientRect
// output in scratchpad/geom-test.mjs). Used for deterministic tap hit-testing: DOM
// elementFromPoint() through a deep preserve-3d chain is unreliable right around 90°
// multiples (own bug, verified empirically), so taps are picked by maths, not hit-testing.
function rotY(p, rad) { const c = Math.cos(rad), s = Math.sin(rad); return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c }; }
function rotX(p, rad) { const c = Math.cos(rad), s = Math.sin(rad); return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c }; }
function project(p, rxDeg, ryDeg) { return rotX(rotY(p, ryDeg * Math.PI / 180), rxDeg * Math.PI / 180); }
function pip(pt, poly) { // point-in-polygon, ray casting
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x; const yi = poly[i].y; const xj = poly[j].x; const yj = poly[j].y;
    if (((yi > pt.y) !== (yj > pt.y)) && (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}
function distSeg(pt, a, b) {
  const abx = b.x - a.x; const aby = b.y - a.y;
  const len2 = abx * abx + aby * aby || 1;
  let t = ((pt.x - a.x) * abx + (pt.y - a.y) * aby) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(pt.x - (a.x + abx * t), pt.y - (a.y + aby * t));
}

// Any planar polygon (3+ world points) -> a flat CSS div: matrix3d + clip-path.
function faceBasis(pts) {
  const o = pts[0];
  const xA = vnorm(sub(pts[1], o));
  const nrm = vnorm(cross(xA, sub(pts[2], o)));
  const yA = cross(nrm, xA);
  const loc = pts.map((p) => { const d = sub(p, o); return { x: dot(d, xA), y: dot(d, yA) }; });
  const xs = loc.map((l) => l.x); const ys = loc.map((l) => l.y);
  const minX = Math.min(...xs); const maxX = Math.max(...xs);
  const minY = Math.min(...ys); const maxY = Math.max(...ys);
  const w = Math.max(1, maxX - minX); const h = Math.max(1, maxY - minY);
  const boxO = add(add(o, scl(xA, minX)), scl(yA, minY));
  const clip = loc.map((l) => `${((l.x - minX) / w * 100).toFixed(1)}% ${((l.y - minY) / h * 100).toFixed(1)}%`).join(',');
  const m = `matrix3d(${xA.x.toFixed(4)},${xA.y.toFixed(4)},${xA.z.toFixed(4)},0,${yA.x.toFixed(4)},${yA.y.toFixed(4)},${yA.z.toFixed(4)},0,${nrm.x.toFixed(4)},${nrm.y.toFixed(4)},${nrm.z.toFixed(4)},0,${boxO.x.toFixed(2)},${boxO.y.toFixed(2)},${boxO.z.toFixed(2)},1)`;
  return { m, w, h, clip: `polygon(${clip})` };
}
function edgeQuad(a, b, thick) {
  const dir = vnorm(sub(b, a));
  const ref = Math.abs(dir.y) > 0.9 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 };
  const perp = vnorm(cross(dir, ref));
  const h2 = thick / 2;
  return [sub(a, scl(perp, h2)), sub(b, scl(perp, h2)), add(b, scl(perp, h2)), add(a, scl(perp, h2))];
}
function buildCubeGeom(h) {
  const v = [[-h,-h,-h],[h,-h,-h],[h,h,-h],[-h,h,-h],[-h,-h,h],[h,-h,h],[h,h,h],[-h,h,h]].map((p) => ({ x: p[0], y: p[1], z: p[2] }));
  const faces = [
    { id: 'front', vi: [4,5,6,7] }, { id: 'back', vi: [0,1,2,3] },
    { id: 'top', vi: [0,1,5,4] }, { id: 'bottom', vi: [3,2,6,7] },
    { id: 'left', vi: [0,3,7,4] }, { id: 'right', vi: [1,5,6,2] },
  ];
  const edges = [[0,1],[1,5],[5,4],[4,0],[3,2],[2,6],[6,7],[7,3],[0,3],[1,2],[5,6],[4,7]];
  return { v, faces, edges, name: 'cube', counts: { face: 6, edge: 12, vert: 8 } };
}
function buildPyramidGeom(bh, apexY, baseY) {
  const v = [{ x: 0, y: apexY, z: 0 }, { x: -bh, y: baseY, z: bh }, { x: bh, y: baseY, z: bh }, { x: bh, y: baseY, z: -bh }, { x: -bh, y: baseY, z: -bh }];
  const faces = [
    { id: 'base', vi: [1,2,3,4] }, { id: 'front', vi: [0,1,2] },
    { id: 'right', vi: [0,2,3] }, { id: 'back', vi: [0,3,4] }, { id: 'left', vi: [0,4,1] },
  ];
  const edges = [[1,2],[2,3],[3,4],[4,1],[0,1],[0,2],[0,3],[0,4]];
  return { v, faces, edges, name: 'square-based pyramid', counts: { face: 5, edge: 8, vert: 5 } };
}
// Two triangular ends (front/back, z = ∓pz) joined by three rectangles — the "Toblerone
// box" from data/topics/shapes-3d.js. Shares its 5-face count with the pyramid above (the
// topic's own "Face-Count Trap" tie), but has 9 edges/6 vertices, not 8/5.
function buildPrismGeom(h) {
  const pw = h * 1.15; const pz = h; const apexY = -h * 1.3; const baseY = h * 0.75;
  const v = [
    { x: 0, y: apexY, z: -pz }, { x: -pw, y: baseY, z: -pz }, { x: pw, y: baseY, z: -pz },
    { x: 0, y: apexY, z: pz }, { x: -pw, y: baseY, z: pz }, { x: pw, y: baseY, z: pz },
  ];
  const faces = [
    { id: 'front', vi: [0,1,2] }, { id: 'back', vi: [3,5,4] },
    { id: 'left', vi: [0,1,4,3] }, { id: 'bottom', vi: [1,2,5,4] }, { id: 'right', vi: [2,0,3,5] },
  ];
  const edges = [[0,1],[1,2],[2,0],[3,4],[4,5],[5,3],[0,3],[1,4],[2,5]];
  return { v, faces, edges, name: 'triangular prism', counts: { face: 5, edge: 9, vert: 6 } };
}

/* ---------- content ---------- */
const MISSIONS = [
  { id: 'cube', chip: '① CUBE', label: "SIR FACELOT'S OWN DICE", q: 'Drag to spin the cube. Tag every FACE, then every EDGE, then every VERTEX.' },
  { id: 'pyramid', chip: '⚡ ② PYRAMID SPEED', label: 'SPEED ROUND: SQUARE-BASED PYRAMID', q: 'Same drill, new solid — tag every face, edge and vertex!' },
  { id: 'prism', chip: '③ THE TIE-BREAKER', label: 'THE TIE-BREAKER: TRIANGULAR PRISM', q: 'Watch out — this one has 5 faces too, just like the pyramid! Tag every face, edge and vertex to prove which solid it really is.' },
];
function announceCube() { return 'A cube: <b>6</b> flat faces, <b>12</b> edges (where two faces meet), <b>8</b> vertices (where edges meet at a point) → <b>6, 12, 8</b>. Sir Facelot could not be prouder.'; }
function announcePyramid() { return 'A square-based pyramid: <b>5</b> faces, <b>8</b> edges, <b>5</b> vertices → <b>5, 8, 5</b>! Same order, new solid — speed round SMASHED.'; }
function announcePrism() { return 'A triangular prism: <b>5</b> faces, <b>9</b> edges, <b>6</b> vertices → <b>5, 9, 6</b>! Same face count as the pyramid — but the edges and vertices prove it\'s a different solid entirely.'; }

const CSS = `
.sfc-q { text-align: center; font-weight: 700; font-size: clamp(14px, 2.4vw, 17px); margin-bottom: 8px; color: var(--ink); }
.sfc-dash { position: relative; }
.sfc-scene { position: relative; width: 100%; touch-action: none; cursor: grab; }
.sfc-scene:active { cursor: grabbing; }
.sfc-pivot { position: absolute; left: 50%; top: 50%; transform-style: preserve-3d; will-change: transform; }
.sfc-face, .sfc-edge {
  position: absolute; left: 0; top: 0; transform-origin: 0 0; box-sizing: border-box;
  cursor: pointer;
}
.sfc-face { background: rgba(255,249,236,.88); border: 2.5px solid var(--ink); }
.sfc-edge { background: var(--ink); opacity: .45; border-radius: 3px; cursor: pointer; }
.sfc-vert {
  position: absolute; left: 0; top: 0; width: 20px; height: 20px; transform-origin: 0 0;
  border-radius: 50%; background: #fff; border: 2.5px solid var(--ink); cursor: pointer;
}
.sfc-face.tagged { background: linear-gradient(160deg,#C7F464,#8BD24A); }
.sfc-edge.tagged { background: var(--gold); opacity: 1; box-shadow: 0 0 8px rgba(244,197,66,.8); }
.sfc-vert.tagged { background: var(--stink); border-color: var(--stink); box-shadow: 0 0 10px rgba(155,89,208,.8); }
.sfc-scene.mode-edge .sfc-face, .sfc-scene.mode-vert .sfc-face { opacity: .3; pointer-events: none; }
.sfc-scene.mode-face .sfc-edge, .sfc-scene.mode-vert .sfc-edge { opacity: .15; pointer-events: none; }
.sfc-scene.mode-face .sfc-vert, .sfc-scene.mode-edge .sfc-vert { opacity: .25; pointer-events: none; }
.sfc-modebar { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 8px; }
.sfc-modebtn { font-size: 12.5px; padding: 7px 11px; }
.sfc-cylwrap { display: flex; justify-content: center; padding: 10px 0; }
.sfc-cyl { display: flex; flex-direction: column; align-items: center; }
.sfc-cylcap {
  border-radius: 50%; background: rgba(255,249,236,.88); border: 2.5px solid var(--ink);
  cursor: pointer; margin-bottom: -1px;
}
.sfc-cylcap-b { margin-top: -1px; margin-bottom: 0; }
.sfc-cylbody {
  background: linear-gradient(90deg,#e8ddc5,rgba(255,249,236,.88) 40%,rgba(255,249,236,.88) 60%,#e8ddc5);
  border-left: 2.5px solid var(--ink); border-right: 2.5px solid var(--ink); cursor: pointer;
}
.sfc-cyledge { height: 5px; background: var(--ink); opacity: .4; cursor: pointer; }
.sfc-cylcap.tagged, .sfc-cylbody.tagged { background: linear-gradient(160deg,#C7F464,#8BD24A); }
.sfc-cyledge.tagged { background: var(--gold); opacity: 1; box-shadow: 0 0 8px rgba(244,197,66,.8); }
`;

/* ---------- the anim card ---------- */
export default {
  id: 'shapes-3d',
  title: "SIR FACELOT'S TAG COUNT",

  mount(host, ctx) {
    let alive = true;
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };
    const doneSet = new Set();
    let mi = 0; // index into MISSIONS, or MISSIONS.length for the bonus cylinder

    let H = 60, BH = 63, AY = -78, BY = 45, THICK = 12; // recomputed on layout()
    let rx = -18, ry = 30;
    let mode = 'face';
    let tagged = { face: new Set(), edge: new Set(), vert: new Set() };
    let geom = null; let missionKind = null; // 'tag' | 'cyl'
    let momentumCancel = null;

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'sfc-q');
    const dash = el('div', 'sfc-dash');
    const scene = el('div', 'sfc-scene');
    const pivot = el('div', 'sfc-pivot');
    scene.append(pivot);
    const modebar = el('div', 'sfc-modebar');
    const cylWrap = el('div', 'sfc-cylwrap');
    const winBox = el('div');
    const controls = el('div', 'anim-controls');
    const resetBtn = el('button', 'anim-ghostbtn', '↩ FACE ME FORWARD');
    controls.append(resetBtn);
    dash.append(scene, cylWrap);
    stage.append(chiprow, q, modebar, dash, winBox, controls);
    host.append(stage);

    injectCss('shapes-3d', CSS);
    const ruleCard = el('div', 'goldcard sfc-rule', RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;';
    host.append(ruleCard);

    function geomForMission(id) {
      if (id === 'cube') return buildCubeGeom(H);
      if (id === 'pyramid') return buildPyramidGeom(BH, AY, BY);
      return buildPrismGeom(H);
    }

    /* ---------- layout / sizing ---------- */
    function layout() {
      const w = Math.max(320, Math.min(920, host.clientWidth || 700));
      H = Math.round(40 + (w - 640) / 340 * 34); H = Math.max(40, Math.min(74, H));
      BH = Math.round(H * 1.05); AY = -Math.round(H * 1.3); BY = Math.round(H * 0.75);
      THICK = Math.max(8, Math.round(H * 0.16));
      const sceneH = Math.round(H * 4.6);
      scene.style.height = sceneH + 'px';
      scene.style.perspective = Math.round(H * 15) + 'px';
      pivot.style.transformOrigin = '0 0';
      applyRot(true);
      if (missionKind === 'tag') {
        const freshGeom = geomForMission(MISSIONS[mi].id);
        buildTagSolid(freshGeom, true);
      } else if (missionKind === 'cyl') buildCylinder(true);
    }

    function applyRot() {
      pivot.style.transform = `translate(-50%,-50%) rotateX(${rx}deg) rotateY(${ry}deg)`;
    }

    /* ---------- rotate + tap-vs-drag ---------- */
    let dragState = null;
    const drag = makeDrag(scene, {
      onStart() {
        if (momentumCancel) { momentumCancel(); momentumCancel = null; }
        dragState = { rx0: rx, ry0: ry, moved: false };
      },
      onMove(dx, dy) {
        if (!dragState) return;
        if (!dragState.moved && Math.hypot(dx, dy) > 7) dragState.moved = true;
        if (dragState.moved) {
          rx = Math.max(-68, Math.min(68, dragState.rx0 - dy * 0.35));
          ry = dragState.ry0 + dx * 0.35;
          applyRot();
          dragState.lastDx = dragState.curDx || 0; dragState.curDx = dx;
        }
      },
      onEnd(dx, dy, e) {
        if (dragState && !dragState.moved) {
          handleTap(e.clientX, e.clientY);
        } else if (dragState) {
          const flick = Math.max(-50, Math.min(50, (dragState.curDx - (dragState.lastDx || 0)) * 4));
          const target = ry + flick;
          momentumCancel = tween((v) => { ry = v; applyRot(); }, ry, target, 380, () => { momentumCancel = null; });
        }
        dragState = null;
      },
    });

    function handleTap(cx, cy) {
      if (missionKind !== 'tag' || !geom) return;
      const r = scene.getBoundingClientRect();
      const pt = { x: cx - (r.left + r.width / 2), y: cy - (r.top + r.height / 2) };
      let bestId = null; let bestZ = -Infinity; let bestKind = null;
      if (mode === 'face') {
        geom.faces.forEach((f) => {
          const poly = f.vi.map((i) => project(geom.v[i], rx, ry));
          if (pip(pt, poly)) {
            const z = poly.reduce((s, p) => s + p.z, 0) / poly.length;
            if (z > bestZ) { bestZ = z; bestId = f.id; bestKind = 'face'; }
          }
        });
      } else if (mode === 'edge') {
        geom.edges.forEach(([a, b], i) => {
          const pa = project(geom.v[a], rx, ry); const pb = project(geom.v[b], rx, ry);
          if (distSeg(pt, pa, pb) < Math.max(22, THICK * 0.8 + 6)) {
            const z = (pa.z + pb.z) / 2;
            if (z > bestZ) { bestZ = z; bestId = String(i); bestKind = 'edge'; }
          }
        });
      } else if (mode === 'vert') {
        geom.v.forEach((v, i) => {
          const p = project(v, rx, ry);
          if (Math.hypot(pt.x - p.x, pt.y - p.y) < 22) {
            if (p.z > bestZ) { bestZ = p.z; bestId = String(i); bestKind = 'vert'; }
          }
        });
      }
      if (bestId != null) {
        const elx = pivot.querySelector(`.sfc-${bestKind}[data-id="${bestId}"]`);
        onTagTap(bestKind, bestId, elx);
      }
    }

    /* ---------- tag-mode solid (cube / pyramid) ---------- */
    function buildTagSolid(g, keepState) {
      geom = g;
      if (!keepState) { tagged = { face: new Set(), edge: new Set(), vert: new Set() }; mode = 'face'; rx = -18; ry = 30; applyRot(); }
      pivot.innerHTML = '';
      g.faces.forEach((f) => {
        const pts = f.vi.map((i) => g.v[i]);
        const { m, w, h, clip } = faceBasis(pts);
        const d = el('div', 'sfc-face');
        d.style.cssText = `width:${w}px;height:${h}px;transform:${m};clip-path:${clip};`;
        d.dataset.kind = 'face'; d.dataset.id = f.id;
        if (tagged.face.has(f.id)) d.classList.add('tagged');
        pivot.append(d);
      });
      g.edges.forEach(([a, b], i) => {
        const quad = edgeQuad(g.v[a], g.v[b], THICK);
        const { m, w, h, clip } = faceBasis(quad);
        const d = el('div', 'sfc-edge');
        d.style.cssText = `width:${w}px;height:${h}px;transform:${m};clip-path:${clip};`;
        d.dataset.kind = 'edge'; d.dataset.id = String(i);
        if (tagged.edge.has(String(i))) d.classList.add('tagged');
        pivot.append(d);
      });
      g.v.forEach((v, i) => {
        const d = el('div', 'sfc-vert');
        d.style.transform = `translate3d(${v.x}px,${v.y}px,${v.z}px) translate(-50%,-50%)`;
        d.dataset.kind = 'vert'; d.dataset.id = String(i);
        if (tagged.vert.has(String(i))) d.classList.add('tagged');
        pivot.append(d);
      });
      scene.className = 'sfc-scene mode-' + mode;
      paintModebar();
      paintCounters();
    }

    function paintModebar() {
      modebar.innerHTML = '';
      [['face', 'FACES', '🟪'], ['edge', 'EDGES', '📏'], ['vert', 'VERTICES', '📍']].forEach(([k, label, ic]) => {
        const max = geom.counts[k];
        const n = tagged[k].size;
        const b = el('button', 'anim-mchip sfc-modebtn' + (mode === k ? ' active' : '') + (n === max ? ' done' : ''), `${ic} ${label} ${n}/${max}`);
        b.addEventListener('click', () => { if (mode === k) return; sfx.ui(); mode = k; scene.className = 'sfc-scene mode-' + mode; paintModebar(); });
        modebar.append(b);
      });
    }
    function paintCounters() { /* counts live inside the modebar chips; kept in sync by paintModebar() */ }

    function onTagTap(kind, id, elx) {
      if (missionKind !== 'tag' || kind !== mode) return;
      if (tagged[kind].has(id)) { sfx.blip(520, 0.05, 0.07); return; }
      tagged[kind].add(id);
      elx.classList.add('tagged');
      if (kind === 'face') sfx.tick(tagged.face.size);
      else if (kind === 'edge') sfx.blip(720, 0.07, 0.12);
      else sfx.pop();
      paintModebar();
      const done = tagged.face.size === geom.counts.face && tagged.edge.size === geom.counts.edge && tagged.vert.size === geom.counts.vert;
      if (done) later(() => winTag(), 260);
    }

    function winTag() {
      if (!alive || missionKind !== 'tag') return;
      const mDef = MISSIONS[mi];
      doneSet.add(mDef.id);
      sfx.win(); party(stage);
      const rect = scene.getBoundingClientRect(); const srect = stage.getBoundingClientRect();
      sparkleBurst(stage, rect.left - srect.left + rect.width / 2, rect.top - srect.top + rect.height / 2, 16);
      paintChips();
      const text = mDef.id === 'cube' ? announceCube() : mDef.id === 'pyramid' ? announcePyramid() : announcePrism();
      bubble(stage, { title: 'FACES. EDGES. VERTICES. 🎩', text, img: IMG }).then(() => { if (alive) showWinBox(mDef); });
      if (doneSet.size === MISSIONS.length) ctx.complete();
    }

    function showWinBox(mDef) {
      winBox.innerHTML = '';
      const w = el('div', 'som-win', `<div class="wp">SOLID COUNTED! 🎩</div><div class="wk">${mDef.label} — every face, edge and vertex, tagged.</div>`);
      const nextIdx = nextUndone();
      const btn = el('button', 'btn btn-gold', nextIdx === -1 ? 'FREE EXPLORE 🔄' : 'NEXT ➡');
      btn.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
      btn.addEventListener('click', () => { sfx.ui(); start(nextIdx === -1 ? mi : nextIdx); });
      w.append(btn);
      winBox.append(w);
    }
    function nextUndone() { const i = MISSIONS.findIndex((m) => !doneSet.has(m.id)); return i; }

    /* ---------- curved guest: the cylinder (bonus, not gating) ---------- */
    let cylTagged = { face: new Set(), edge: new Set() };
    function buildCylinder(keep) {
      if (!keep) cylTagged = { face: new Set(), edge: new Set() };
      cylWrap.innerHTML = '';
      const capW = Math.round(H * 2.3); const capH = Math.round(H * 0.72); const bodyH = Math.round(H * 2.4);
      const wrap = el('div', 'sfc-cyl');
      const topCap = el('div', 'sfc-cylcap', ''); topCap.dataset.kind = 'cface'; topCap.dataset.id = 'top';
      const topEdge = el('div', 'sfc-cyledge'); topEdge.dataset.kind = 'cedge'; topEdge.dataset.id = 'toprim';
      const body = el('div', 'sfc-cylbody'); body.dataset.kind = 'cface'; body.dataset.id = 'curved';
      const botEdge = el('div', 'sfc-cyledge'); botEdge.dataset.kind = 'cedge'; botEdge.dataset.id = 'botrim';
      const botCap = el('div', 'sfc-cylcap sfc-cylcap-b', ''); botCap.dataset.kind = 'cface'; botCap.dataset.id = 'bottom';
      [topCap, body, botCap].forEach((e2) => { e2.style.width = capW + 'px'; });
      topCap.style.height = capH + 'px'; botCap.style.height = capH + 'px';
      body.style.height = bodyH + 'px';
      topEdge.style.width = capW + 'px'; botEdge.style.width = capW + 'px';
      wrap.append(topCap, topEdge, body, botEdge, botCap);
      cylWrap.append(wrap);
      wrap.querySelectorAll('[data-kind]').forEach((e2) => {
        const k = e2.dataset.kind === 'cface' ? 'face' : 'edge';
        if (cylTagged[k].has(e2.dataset.id)) e2.classList.add('tagged');
        e2.addEventListener('click', () => onCylTap(e2));
      });
    }
    function onCylTap(elx) {
      const kind = elx.dataset.kind === 'cface' ? 'face' : 'edge';
      const id = elx.dataset.id;
      if (cylTagged[kind].has(id)) { sfx.blip(520, 0.05, 0.07); return; }
      cylTagged[kind].add(id);
      elx.classList.add('tagged');
      if (kind === 'face') sfx.tick(cylTagged.face.size); else sfx.blip(720, 0.07, 0.12);
      if (cylTagged.face.size === 3 && cylTagged.edge.size === 2) {
        later(() => {
          sfx.win(); party(stage);
          bubble(stage, { title: 'THE CURVED GUEST! 🥫', text: 'Faces: <b>3</b> (2 flat + 1 curved). Edges: <b>2</b> (the top rim and the bottom rim). Vertices: <b>0</b> — a curved rim never comes to a sharp point, so <b>a curve never makes a vertex</b>.', img: IMG });
        }, 200);
      }
    }


    /* ---------- mission chrome ---------- */
    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), m.chip);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
        if (i === 1) {
          const bonus = el('button', 'anim-mchip' + (mi === MISSIONS.length ? ' active' : ''), '🥫 CURVED GUEST');
          bonus.addEventListener('click', () => { sfx.ui(); start(MISSIONS.length); });
          chiprow.append(bonus);
        }
      });
    }

    function start(i) {
      mi = i;
      winBox.innerHTML = '';
      // cancel any pending delayed win/announce callback from whatever mission was
      // showing before — otherwise a mission switch inside that delay (e.g. tapping a
      // different chip right after tagging the last vertex) lets a stale callback
      // fire on the NEW mission/board (marks it done, announces the wrong solid).
      timers.forEach((t) => clearTimeout(t)); timers.clear();
      if (momentumCancel) { momentumCancel(); momentumCancel = null; }
      paintChips();
      scene.style.display = ''; cylWrap.style.display = 'none'; modebar.style.display = '';
      scene.className = 'sfc-scene'; // clear any stale mode-edge/mode-vert dimming left from a tag mission
      const mDef = MISSIONS[i];
      if (i === MISSIONS.length) { // bonus cylinder
        missionKind = 'cyl';
        q.textContent = 'A curved guest — tap every flat face, then the two curved rims.';
        scene.style.display = 'none'; modebar.style.display = 'none'; cylWrap.style.display = '';
        buildCylinder();
        return;
      }
      q.textContent = mDef.q;
      missionKind = 'tag';
      buildTagSolid(geomForMission(mDef.id), false);
      if (mDef.id === 'cube') later(() => toast(stage, '👆 drag to spin Sir Facelot — find the hidden faces!'), 400);
    }

    resetBtn.addEventListener('click', () => {
      sfx.ui();
      if (momentumCancel) { momentumCancel(); momentumCancel = null; }
      rx = -18; ry = 30; applyRot();
    });

    const onResize = () => {
      if (momentumCancel) { momentumCancel(); momentumCancel = null; }
      drag.abort(); layout();
    };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    layout();
    start(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      if (momentumCancel) momentumCancel();
      drag.destroy();
      stage.remove();
      ruleCard.remove();
    };
  },
};
