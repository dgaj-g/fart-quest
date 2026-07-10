// FART QUEST — js/anims/area-volume.js
// CUBBY'S TILE-AND-STACK — interactive tiling/stacking machine for the
// area-volume Scout Report (Measure Marsh). Structure follows the house
// reference implementations decimals-x10.js / perimeter.js.

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const CUBBY_IMG = 'assets/monsters/cubby-mcsquareface.png';
const RULE = 'Area = tiles that cover it (length × width). Volume = stacked layers (× height too).';

/* ---------- pure engines (unit-tested in a scratch script — do not "improve") ---------- */
function edgesForRect(cols, rows) {
  const vertices = [[0, 0], [cols, 0], [cols, rows], [0, rows]];
  let cum = 0; const edges = [];
  for (let i = 0; i < 4; i += 1) {
    const p0 = vertices[i]; const p1 = vertices[(i + 1) % 4];
    const len = Math.abs(p1[0] - p0[0]) + Math.abs(p1[1] - p0[1]);
    const axis = p0[0] === p1[0] ? 'y' : 'x';
    const dir = axis === 'x' ? Math.sign(p1[0] - p0[0]) : Math.sign(p1[1] - p0[1]);
    edges.push({ i, p0, p1, len, axis, dir, cumStart: cum, cumEnd: cum + len });
    cum += len;
  }
  return { edges, total: cum };
}
function posAtS(edges, Scm) {
  const s = Math.max(0, Math.min(edges[edges.length - 1].cumEnd, Scm));
  for (const e of edges) {
    if (s <= e.cumEnd + 1e-9 || e.i === edges.length - 1) {
      const local = Math.max(0, Math.min(e.len, s - e.cumStart));
      const t = e.len === 0 ? 0 : local / e.len;
      return {
        x: e.p0[0] + (e.p1[0] - e.p0[0]) * t,
        y: e.p0[1] + (e.p1[1] - e.p0[1]) * t,
        edgeIndex: e.i,
        tangent: { x: e.axis === 'x' ? e.dir : 0, y: e.axis === 'y' ? e.dir : 0 },
      };
    }
  }
  return { x: edges[0].p0[0], y: edges[0].p0[1], edgeIndex: 0, tangent: { x: 1, y: 0 } };
}
function completedSet(edges, Scm) {
  const done = new Set();
  edges.forEach((e) => { if (e.cumEnd <= Scm + 1e-9) done.add(e.i); });
  return done;
}
function cellFromPoint(px, py, cellPx, cols, rows) {
  const col = Math.floor(px / cellPx); const row = Math.floor(py / cellPx);
  if (col < 0 || col >= cols || row < 0 || row >= rows) return null;
  return { row, col };
}

/* ---------- content (numbers verified independently — see report) ---------- */
const MISSIONS = [
  { id: 'a1', mode: 'area', cols: 4, rows: 3,
    q: 'Tile Cubby’s new patch — sweep the whole inside!',
    sub: 'Press and drag your finger across every square, edge to edge.' },
  { id: 'a2', mode: 'volume', cols: 4, rows: 3, target: 2,
    q: 'Now stack that same crate 2 layers high!',
    sub: 'Pull the STACK tab, then LOCK IT IN when you’re happy.' },
  { id: 'a3', mode: 'edge', cols: 4, rows: 3,
    q: 'How much SKIRTING walks the edge of this patch?',
    sub: 'Pick a tool and get measuring — Cubby wants a number.' },
  { id: 'b1', mode: 'area', cols: 5, rows: 2,
    q: 'A brand new patch — tile it all!',
    sub: 'Sweep across every square, edge to edge.' },
  { id: 'b2', mode: 'volume', cols: 5, rows: 2, target: 3,
    q: 'Stack this one 3 layers high!',
    sub: 'Pull the STACK tab, then LOCK IT IN when you’re happy.' },
];
const WIN_PHRASES = ['TILE-TASTIC! 🧱', 'CUBBY IS BRAGGING ALREADY!', 'NOT A GAP IN SIGHT!', 'STACKED TO PERFECTION!'];

const CSS = `
  .cts-q { text-align: center; font-weight: 700; font-size: clamp(18px, 3.2vw, 26px); margin-bottom: 2px; }
  .cts-qsub { text-align: center; font-size: 12.5px; color: #6b5744; font-weight: 500; margin-bottom: 10px; min-height: 16px; }
  .cts-toolrow { display: flex; gap: 8px; justify-content: center; margin-bottom: 10px; flex-wrap: wrap; }
  .cts-toolbtn {
    background: var(--card); border: 2.5px solid var(--swamp-mid); color: var(--ink); border-radius: 12px;
    padding: 9px 16px; font-weight: 700; font-size: 14px; min-height: 44px; cursor: pointer;
    box-shadow: 0 3px 0 rgba(0,0,0,.2);
  }
  .cts-toolbtn.active { background: var(--swamp-mid); color: var(--stink-lime); }
  .cts-boardwrap { display: flex; gap: 24px; justify-content: center; align-items: flex-end; flex-wrap: wrap; margin: 0 auto; }
  .cts-gridhost { position: relative; touch-action: none; }
  .cts-tile {
    position: absolute; background: #fff; border: 2.5px solid rgba(51,38,29,.28); border-radius: 7px; box-sizing: border-box;
  }
  .cts-tile.filled { background: var(--swamp-mid); border-color: var(--swamp-deep); }
  .cts-tile.pop { animation: ctsPop .4s cubic-bezier(.22,1.2,.36,1) both; }
  @keyframes ctsPop { 0% { transform: scale(.3); opacity: 0; } 60% { transform: scale(1.14); opacity: 1; } 100% { transform: scale(1); } }
  .cts-hit { position: absolute; inset: 0; cursor: grab; touch-action: none; }
  .cts-hit:active { cursor: grabbing; }
  .cts-edgesvg { position: absolute; inset: 0; overflow: visible; pointer-events: none; }
  .cts-edgesvg line { stroke: var(--ink); stroke-width: 4; stroke-linecap: round; opacity: .5; }
  .cts-edgesvg line.done { stroke: var(--correct); opacity: 1; stroke-width: 5; }
  .cts-walker { position: absolute; z-index: 5; font-size: 26px; transform: translate(-50%,-50%); pointer-events: none; filter: drop-shadow(0 3px 4px rgba(0,0,0,.3)); }
  .cts-edgehit {
    position: absolute; z-index: 6; width: 44px; height: 44px; border-radius: 50%; transform: translate(-50%,-50%);
    cursor: grab; touch-action: none;
  }
  .cts-edgehit:active { cursor: grabbing; }
  .cts-stack { position: relative; display: flex; flex-direction: column-reverse; align-items: center; min-height: 34px; }
  .cts-layer {
    position: relative; border: 2.5px solid var(--swamp-deep); border-radius: 8px; background: rgba(46,74,51,.9);
    box-shadow: 0 5px 0 rgba(28,51,31,.55); margin-top: 6px;
  }
  .cts-layer.ghost { background: rgba(46,74,51,.3); border-style: dashed; box-shadow: none; }
  .cts-layer.entering { animation: ctsLayerIn .5s cubic-bezier(.22,1.2,.36,1) both; }
  @keyframes ctsLayerIn { 0% { transform: translateY(-24px) scale(.85); opacity: 0; } 60% { transform: translateY(4px) scale(1.03); opacity: 1; } 100% { transform: translateY(0) scale(1); } }
  .cts-layer.leaving { animation: ctsLayerOut .28s ease-in both; }
  @keyframes ctsLayerOut { to { transform: translateY(-14px) scale(.85); opacity: 0; } }
  .cts-layer .cl-n {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    font-weight: 700; color: #fff; font-size: 12px; text-shadow: 0 1px 2px rgba(0,0,0,.4);
  }
  .cts-stackrow { display: flex; align-items: center; gap: 10px; }
  .cts-badge {
    background: #241d15; border-radius: 12px; padding: 6px 16px; min-width: 130px; text-align: center;
    box-shadow: inset 0 3px 10px rgba(0,0,0,.6); border: 3px solid #4a3b28;
  }
  .cts-badge .bl { font-size: 9px; letter-spacing: .16em; color: #8f7a5e; font-weight: 700; }
  .cts-badge .bn { font-size: clamp(19px, 3vw, 26px); font-weight: 700; color: var(--stink-lime); }
  .cts-strip { display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap; margin-top: 10px; min-height: 0; }
  .cts-chip {
    background: var(--card); border: 2.5px solid var(--swamp-mid); color: var(--ink); border-radius: 10px;
    padding: 6px 11px; font-weight: 700; font-size: 14px; box-shadow: 0 3px 0 rgba(0,0,0,.2);
    animation: ctsChipIn .32s var(--spring) both;
  }
  @keyframes ctsChipIn { 0% { transform: scale(.4) translateY(-10px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
  .cts-total { background: var(--swamp-mid); color: var(--stink-lime); border-radius: 12px; padding: 8px 16px; font-weight: 700; font-size: clamp(14px, 2.2vw, 17px); box-shadow: 0 3px 0 rgba(0,0,0,.3); }
  .cts-win { margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF); border: 3px solid var(--correct); border-radius: 14px; padding: 11px 16px; animation: animBubbleIn .34s var(--spring) both; }
  .cts-win .wt { font-weight: 700; color: #1d8f4e; font-size: 16px; }
  .cts-win .wk { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 3px; }
  .cts-win .wb { margin-top: 9px; padding: 10px 22px; font-size: 15px; }
  .cts-lockrow .btn { font-size: 16px; padding: 12px 24px; }
`;

/* ---------- the anim card ---------- */
export default {
  id: 'area-volume',
  title: "CUBBY'S TILE-AND-STACK",

  mount(host, ctx) {
    let alive = true;
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };
    let introShown = false;
    let stackIntroShown = false;
    let edgeIntroShown = false;
    let wrongToolShown = false;
    let allDoneAnnounced = false;

    injectCss('area-volume', CSS);

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'cts-q');
    const qsub = el('div', 'cts-qsub');
    const toolrow = el('div', 'cts-toolrow');
    const boardWrap = el('div', 'cts-boardwrap');
    const gridHost = el('div', 'cts-gridhost');
    boardWrap.append(gridHost);
    const dash = el('div');
    const winBox = el('div');
    const controls = el('div', 'anim-controls cts-lockrow');
    const stackDown = el('button', 'anim-nudge', '▼');
    const lock = el('button', 'btn btn-gold', 'LOCK IT IN 💨');
    const stackUp = el('button', 'anim-nudge', '▲');
    const reset = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(stackDown, lock, stackUp, reset);
    stage.append(chiprow, q, qsub, toolrow, boardWrap, dash, winBox, controls);
    host.append(stage);

    const ruleCard = el('div', 'goldcard', RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;';
    host.append(ruleCard);

    let mi = 0;
    let gen = 0; // bumped on every start() so late-firing later() win callbacks from a mission the child has since left/restarted can no-op
    let mission = null;
    let cols = 0; let rows = 0; let cellPx = 48;
    let filled = new Set();
    let tileEls = [];
    let layers = 0;
    let tool = 'tile';
    let Scm = 0;
    let edgeData = null;
    let edgeLineEls = [];
    let finished = false;
    let attempts = 0;
    let areaDragCtrl = null; let edgeDragCtrl = null; let cancelTween = null;
    let hitEl = null; let walkerEl = null; let edgeHitEl = null; let edgeSvg = null;

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const label = `${m.cols} × ${m.rows}` + (m.mode === 'volume' ? ` (×${m.target})` : m.mode === 'edge' ? ' — edge' : '');
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), label);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
    }

    /* ---------- grid build ---------- */
    function computeCellPx() {
      const avail = Math.min(560, (stage.clientWidth || 700) - 40);
      const forCols = Math.floor(avail / Math.max(cols, 4));
      return Math.max(38, Math.min(76, forCols));
    }

    function buildGrid(preFilled) {
      gridHost.innerHTML = '';
      tileEls = [];
      if (preFilled) {
        filled = new Set(Array.from({ length: cols * rows }, (_, i) => i));
      }
      // else: leave `filled` as-is — it already holds either the fresh empty
      // Set start() seeded for a brand-new area mission, or the in-progress
      // tiles from before a resize/relayout, so a rotate mid-sweep never
      // wipes the child's progress.
      cellPx = computeCellPx();
      gridHost.style.width = (cols * cellPx) + 'px';
      gridHost.style.height = (rows * cellPx) + 'px';
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const idx = r * cols + c;
          const t = el('div', 'cts-tile' + (filled.has(idx) ? ' filled' : ''));
          t.style.left = (c * cellPx + 3) + 'px';
          t.style.top = (r * cellPx + 3) + 'px';
          t.style.width = (cellPx - 6) + 'px';
          t.style.height = (cellPx - 6) + 'px';
          gridHost.append(t);
          tileEls[idx] = t;
        }
      }
      hitEl = el('div', 'cts-hit');
      gridHost.append(hitEl);
      if (areaDragCtrl) areaDragCtrl.destroy();
      let hitRect = null;
      areaDragCtrl = makeDrag(hitEl, {
        enabled: () => alive && mission && mission.mode === 'area' && !finished,
        onStart(e) { hitRect = hitEl.getBoundingClientRect(); tryFillAt(e.clientX, e.clientY); },
        onMove(dx, dy, e) { tryFillAt(e.clientX, e.clientY); },
        onEnd() { hitRect = null; },
      });
      function tryFillAt(cx, cy) {
        if (!hitRect) hitRect = hitEl.getBoundingClientRect();
        const cell = cellFromPoint(cx - hitRect.left, cy - hitRect.top, cellPx, cols, rows);
        if (!cell) return;
        const idx = cell.row * cols + cell.col;
        if (filled.has(idx)) return;
        filled.add(idx);
        const t = tileEls[idx];
        t.classList.add('filled', 'pop');
        sfx.pop();
        updateAreaBadge();
        if (filled.size === cols * rows) { const g = gen; later(() => { if (g === gen) winArea(); }, 160); }
      }
      hitEl.addEventListener('pointerdown', (e) => {
        if (!mission || mission.mode !== 'edge' || tool !== 'tile' || finished) return;
        const rect = hitEl.getBoundingClientRect();
        const cell = cellFromPoint(e.clientX - rect.left, e.clientY - rect.top, cellPx, cols, rows);
        if (!cell) return;
        sfx.nudge();
        if (!wrongToolShown) {
          wrongToolShown = true;
          bubble(stage, {
            title: 'WRONG TOOL! 🧰',
            text: 'Tiling covers the INSIDE — that measures AREA. Skirting only walks the OUTSIDE. <b>Tap the EDGE tool</b> to switch, then trace round the boundary.',
            img: CUBBY_IMG,
          });
        } else {
          toast(stage, '🧱 tiles measure area, not the edge — switch to the EDGE tool');
        }
      });
    }

    function updateAreaBadge() {
      dash.innerHTML = '';
      const b = el('div', 'cts-badge', `<div class="bl">TILES DOWN</div><div class="bn">${filled.size} / ${cols * rows}</div>`);
      dash.append(b);
    }

    /* ---------- volume stack ---------- */
    function renderStack(added) {
      const stackEl = el('div', 'cts-stack');
      for (let n = 1; n <= layers; n += 1) {
        const h = Math.max(16, Math.round(cellPx * 0.34));
        const lyr = el('div', 'cts-layer ghost' + (n === added ? ' entering' : ''), `<div class="cl-n">${cols}×${rows}</div>`);
        lyr.style.width = Math.round(cols * cellPx * 0.62) + 'px';
        lyr.style.height = h + 'px';
        stackEl.append(lyr);
      }
      const badge = el('div', 'cts-badge',
        `<div class="bl">LAYERS STACKED</div><div class="bn">${layers} <span style="font-size:.5em;color:#c9b892;">(${cols * rows} cm² × ${layers} = ${cols * rows * layers} cm³)</span></div>`);
      const row = el('div', 'cts-stackrow');
      row.append(stackEl, badge);
      dash.innerHTML = '';
      dash.append(row);
    }

    function setLayers(n) {
      const clamped = Math.max(0, Math.min(6, n));
      if (clamped === layers) { if (n !== clamped) sfx.nudge(); return; }
      const added = clamped > layers ? clamped : null;
      layers = clamped;
      renderStack(added);
      if (added) { sfx.thud(); } else { sfx.tock(1); }
    }

    /* ---------- edge walk ---------- */
    function buildEdgeOverlay() {
      const svgNS = 'http://www.w3.org/2000/svg';
      edgeSvg = document.createElementNS(svgNS, 'svg');
      edgeSvg.setAttribute('class', 'cts-edgesvg');
      edgeSvg.setAttribute('width', cols * cellPx);
      edgeSvg.setAttribute('height', rows * cellPx);
      edgeData = edgesForRect(cols, rows);
      edgeLineEls = [];
      edgeData.edges.forEach((e) => {
        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', e.p0[0] * cellPx); line.setAttribute('y1', e.p0[1] * cellPx);
        line.setAttribute('x2', e.p1[0] * cellPx); line.setAttribute('y2', e.p1[1] * cellPx);
        edgeSvg.append(line);
        edgeLineEls[e.i] = line;
      });
      gridHost.append(edgeSvg);
      walkerEl = el('div', 'cts-walker', '👣');
      edgeHitEl = el('div', 'cts-edgehit');
      edgeHitEl.style.pointerEvents = tool === 'edge' ? '' : 'none';
      gridHost.append(walkerEl, edgeHitEl);
      positionWalker();
      const strip = el('div', 'cts-strip');
      dash.innerHTML = ''; dash.append(strip);
      if (edgeDragCtrl) edgeDragCtrl.destroy();
      let lx = 0; let ly = 0;
      edgeDragCtrl = makeDrag(edgeHitEl, {
        enabled: () => alive && mission && mission.mode === 'edge' && tool === 'edge' && !finished,
        onStart() { lx = 0; ly = 0; },
        onMove(dx, dy) {
          const ddx = dx - lx; const ddy = dy - ly;
          lx = dx; ly = dy;
          const pos = posAtS(edgeData.edges, Scm);
          const ds = (ddx * pos.tangent.x + ddy * pos.tangent.y) / cellPx;
          setScm(Scm + ds);
        },
        onEnd() {},
      });
    }
    function positionWalker() {
      const pos = posAtS(edgeData.edges, Scm);
      walkerEl.style.left = (pos.x * cellPx) + 'px';
      walkerEl.style.top = (pos.y * cellPx) + 'px';
      edgeHitEl.style.left = (pos.x * cellPx) + 'px';
      edgeHitEl.style.top = (pos.y * cellPx) + 'px';
    }
    function renderEdgeProgress() {
      const nowDone = completedSet(edgeData.edges, Scm);
      const strip = dash.querySelector('.cts-strip');
      let changed = false;
      edgeData.edges.forEach((e) => {
        const isDone = nowDone.has(e.i);
        const has = edgeLineEls[e.i].classList.contains('done');
        if (isDone && !has) { edgeLineEls[e.i].classList.add('done'); changed = true; }
        else if (!isDone && has) { edgeLineEls[e.i].classList.remove('done'); changed = true; }
      });
      if (changed && strip) {
        strip.innerHTML = '';
        const ordered = edgeData.edges.filter((e) => nowDone.has(e.i));
        ordered.forEach((e, i) => strip.append(el('div', 'cts-chip', (i ? '+' : '') + e.len)));
        if (ordered.length) {
          const sum = ordered.reduce((s, e) => s + e.len, 0);
          strip.append(el('div', 'cts-total', 'so far: ' + sum + ' cm'));
        }
        sfx.tick(nowDone.size);
      }
    }
    function setScm(v) {
      const total = edgeData.total;
      const next = Math.max(0, Math.min(total, v));
      Scm = next;
      positionWalker();
      renderEdgeProgress();
      if (Scm >= total - 1e-9 && !finished) { const g = gen; later(() => { if (g === gen) winEdge(); }, 160); }
    }

    /* ---------- mode switching ---------- */
    function setTool(t) {
      if (tool === t) return;
      tool = t;
      toolrow.querySelectorAll('.cts-toolbtn').forEach((b) => b.classList.toggle('active', b.dataset.tool === t));
      if (edgeHitEl) edgeHitEl.style.pointerEvents = t === 'edge' ? '' : 'none';
    }

    function layoutTools() {
      toolrow.innerHTML = '';
      if (!mission || mission.mode !== 'edge') return;
      const tb = el('button', 'cts-toolbtn' + (tool === 'tile' ? ' active' : ''), '🧱 TILE');
      tb.dataset.tool = 'tile';
      tb.addEventListener('click', () => { sfx.ui(); setTool('tile'); });
      const eb = el('button', 'cts-toolbtn' + (tool === 'edge' ? ' active' : ''), '👣 EDGE');
      eb.dataset.tool = 'edge';
      eb.addEventListener('click', () => {
        sfx.ui(); setTool('edge');
        if (!edgeIntroShown) {
          edgeIntroShown = true;
          later(() => bubble(stage, {
            title: 'THE EDGE TOOL 👣',
            text: 'Now drag your finger round the OUTSIDE boundary. Every side you walk lights up and joins the running total.',
            img: CUBBY_IMG,
          }), 120);
        }
      });
      toolrow.append(tb, eb);
    }

    function layoutControls() {
      const m = mission.mode;
      stackDown.style.display = m === 'volume' ? '' : 'none';
      stackUp.style.display = m === 'volume' ? '' : 'none';
      lock.style.display = m === 'volume' ? '' : 'none';
    }

    /* ---------- layout / relayout ---------- */
    function layout() {
      if (cancelTween) { cancelTween(); cancelTween = null; }
      if (areaDragCtrl) areaDragCtrl.abort();
      if (edgeDragCtrl) edgeDragCtrl.abort();
      buildGrid(mission.mode !== 'area');
      layoutTools();
      layoutControls();
      if (mission.mode === 'volume') { renderStack(null); }
      else if (mission.mode === 'edge') { buildEdgeOverlay(); }
      else { updateAreaBadge(); }
    }

    function start(i) {
      mi = i;
      gen += 1;
      mission = MISSIONS[i];
      cols = mission.cols; rows = mission.rows;
      layers = 0; Scm = 0; tool = 'tile'; finished = false; attempts = 0;
      filled = new Set(); // fresh progress for this mission (area mode fills it as the child sweeps)
      winBox.innerHTML = '';
      paintChips();
      q.textContent = mission.q;
      qsub.textContent = mission.sub;
      layout();
      if (!introShown && mission.id === 'a1') {
        introShown = true;
        later(() => bubble(stage, {
          title: 'MEET CUBBY McSQUAREFACE 🧱',
          text: 'He can squeeze into ANY box, then instantly tell you how many centimetres it took up. First power: <b>AREA</b>. Sweep your finger across the whole patch to tile it — no gaps, no overlaps.',
          img: CUBBY_IMG,
        }), 200);
      }
      if (!stackIntroShown && mission.id === 'a2') {
        stackIntroShown = true;
        later(() => bubble(stage, {
          title: 'THE STACK TAB 🏗️',
          text: 'Pull ▲ to drop in a whole ghost LAYER — a full copy of the tiled base, stacked on top. Push ▼ if you overshoot. When you’re happy, LOCK IT IN.',
          img: CUBBY_IMG,
        }), 200);
      }
    }

    /* ---------- wins ---------- */
    function winArea() {
      if (finished || !alive) return;
      finished = true;
      doneSet.add(mission.id);
      sfx.win();
      party(stage);
      const r = gridHost.getBoundingClientRect(); const sr = stage.getBoundingClientRect();
      sparkleBurst(stage, r.left - sr.left + r.width / 2, r.top - sr.top + r.height / 2);
      paintChips();
      const total = cols * rows;
      showWin(`${cols} × ${rows} = <b>${total} cm²</b>`, `Every tile counted — that’s ${rows} rows of ${cols}, or seen the other way, ${cols} columns of ${rows}. Same tiles, same answer either way.`);
    }
    function winVolume() {
      if (finished || !alive) return;
      finished = true;
      doneSet.add(mission.id);
      sfx.win();
      party(stage);
      dash.querySelectorAll('.cts-layer').forEach((l) => l.classList.remove('ghost'));
      paintChips();
      const base = cols * rows; const vol = base * layers;
      showWin(`${base} cm² × ${layers} layers = <b>${vol} cm³</b>`, `The base was already tiled — stacking it ${layers} layer${layers === 1 ? '' : 's'} high just multiplies by the height. Same trick as area, one extra stack.`);
    }
    function winEdge() {
      if (finished || !alive) return;
      finished = true;
      doneSet.add(mission.id);
      sfx.win();
      party(stage);
      paintChips();
      const total = edgeData.total;
      showWin(`${cols}+${rows}+${cols}+${rows} = <b>${total} cm</b>`, `That’s the SKIRTING, not the tiles — tiling this same patch would have said ${cols * rows} cm² instead. Two totally different questions: "edge is perimeter, tiles are area."`);
    }
    function showWin(headline, worked) {
      const w = el('div', 'cts-win',
        `<div class="wt">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]} &nbsp; ${headline}</div>`
        + `<div class="wk">${worked}</div>`);
      winBox.innerHTML = '';
      winBox.append(w);
      if (!allDoneAnnounced && doneSet.size === MISSIONS.length) { allDoneAnnounced = true; ctx.complete(); }
      const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
      const btn = el('button', 'btn btn-gold wb', nextIdx !== -1 ? 'NEXT ONE ➡' : 'ONE MORE GO 🔁');
      btn.addEventListener('click', () => { sfx.ui(); start(nextIdx !== -1 ? nextIdx : mi); });
      w.append(btn);
    }

    /* ---------- controls ---------- */
    stackUp.addEventListener('click', () => { if (!mission || mission.mode !== 'volume' || finished) return; sfx.ui(); setLayers(layers + 1); });
    stackDown.addEventListener('click', () => { if (!mission || mission.mode !== 'volume' || finished) return; sfx.ui(); setLayers(layers - 1); });
    reset.addEventListener('click', () => {
      if (mission.mode === 'edge' && edgeDragCtrl && edgeDragCtrl.dragging()) return;
      sfx.ui();
      if (mission.mode === 'edge' && !finished) {
        // animate the walker back to the start; no need to rebuild the grid
        if (cancelTween) cancelTween();
        const from = Scm;
        cancelTween = tween((v) => setScm(v), from, 0, 320, () => { cancelTween = null; });
        setTool('tile');
        return;
      }
      start(mi);
    });
    lock.addEventListener('click', () => {
      if (!mission || mission.mode !== 'volume' || finished) return;
      sfx.ui();
      if (layers === mission.target) { winVolume(); return; }
      attempts += 1;
      sfx.nudge();
      let text;
      if (layers === 0) text = 'Pull the STACK tab first — the crate needs at least one layer before you can lock it in!';
      else if (layers < mission.target) text = `You’ve stacked <b>${layers}</b> layer${layers === 1 ? '' : 's'} so far — pull the tab a bit more.`;
      else text = `That’s <b>${layers}</b> layers — a little too many. Push one back down.`;
      if (attempts >= 2) text += `<br><br>🧱 Psst: this crate needs exactly <b>${mission.target}</b> layer${mission.target === 1 ? '' : 's'}.`;
      bubble(stage, { title: 'KEEP STACKING! 💪', text, img: CUBBY_IMG });
    });

    const onResize = () => { if (!alive || !mission) return; layout(); };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    start(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      if (cancelTween) cancelTween();
      if (areaDragCtrl) areaDragCtrl.destroy();
      if (edgeDragCtrl) edgeDragCtrl.destroy();
      stage.remove();
      ruleCard.remove();
    };
  },
};
