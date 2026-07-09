// FART QUEST — js/anims/perimeter.js
// THE PROWLER'S PATROL — interactive fence-walking perimeter machine for the
// perimeter Scout Report. Structure and interaction discipline follow
// decimals-x10.js / rounding.js (the house reference implementations).

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const PROWLER_IMG = 'assets/monsters/the-perimeter-prowler.png';
const RULE = 'Walk EVERY side and add as you go. Hidden sides still count — find them before you walk.';

/* ---------- pure boundary-walk engine (unit-tested in scratch script — do not "improve") ---------- */
function edgesFor(vertices) {
  const n = vertices.length;
  const edges = [];
  let cum = 0;
  for (let i = 0; i < n; i += 1) {
    const p0 = vertices[i]; const p1 = vertices[(i + 1) % n];
    const len = Math.abs(p1[0] - p0[0]) + Math.abs(p1[1] - p0[1]); // axis-aligned only
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
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- content (numbers verified independently — see report) ---------- */
const MISSIONS = [
  {
    id: 'rect', name: 'Rectangle 6 × 4', unit: 'cm',
    vertices: [[0, 0], [6, 0], [6, 4], [0, 4]], hiddenIdx: [],
    worked: '6 + 4 + 6 + 4 = 20 cm — every side walked, nothing skipped.',
  },
  {
    id: 'square', name: 'Square, side 5', unit: 'cm',
    vertices: [[0, 0], [5, 0], [5, 5], [0, 5]], hiddenIdx: [],
    worked: '5 + 5 + 5 + 5 = 20 cm — four equal walks round a square.',
  },
  {
    id: 'lshape', name: 'L-shaped garden', unit: 'm',
    vertices: [[0, 0], [7, 0], [7, 3], [11, 3], [11, 8], [0, 8]], hiddenIdx: [0, 3],
    // edge0 top = 11 - 4 = 7 (given: bottom 11, notch width 4)
    // edge3 right = 8 - 3 = 5 (given: left 8, notch height 3)
    hiddenOptions: { 0: [7, 11, 4], 3: [5, 8, 3] },
    hiddenWhy: {
      0: { 7: 'Found it! 7 m — the top runs under the full 11 m bottom width, minus the 4 m the notch bites out: 11 − 4 = 7.', 11: 'That\'s the WHOLE 11 m width — but the notch bites a piece out of it first. Subtract the notch width.', 4: 'That\'s just the notch\'s OWN width (4 m) — not the piece of the top that\'s left after it.' },
      3: { 5: 'Found it! 5 m — the right side runs under the full 8 m left height, minus the 3 m the notch bites out: 8 − 3 = 5.', 8: 'That\'s the WHOLE 8 m height (the left side) — the notch trims part of that away first.', 3: 'That\'s just the notch\'s OWN height (3 m) — not what\'s left of the side after it.' },
    },
    worked: '7 + 3 + 4 + 5 + 11 + 8 = 38 m — the hidden sides get found, then walked like everyone else.',
  },
];
const WIN_PHRASES = ['PATROL COMPLETE! 🏆', 'NOT ONE SIDE MISSED!', 'THE FENCE IS FULLY WALKED!', 'PROWLER APPROVES! 🥾'];

/* ---------- geometry fit (pure) ---------- */
function geomFor(vertices, hostWidth) {
  const maxX = Math.max(...vertices.map((v) => v[0]));
  const maxY = Math.max(...vertices.map((v) => v[1]));
  const padL = 58; const padR = 58; const padT = 46; const padB = 46;
  const availW = Math.max(220, Math.min(520, hostWidth - 24)) - padL - padR;
  const availH = 260 - padT - padB;
  const scale = Math.max(12, Math.min(availW / maxX, availH / maxY));
  const W = maxX * scale + padL + padR;
  const H = maxY * scale + padT + padB;
  const cx = vertices.reduce((s, v) => s + v[0], 0) / vertices.length;
  const cy = vertices.reduce((s, v) => s + v[1], 0) / vertices.length;
  return { scale, padL, padT, W, H, cx, cy };
}
function px(g, p) { return { x: g.padL + p[0] * g.scale, y: g.padT + p[1] * g.scale }; }

/* ---------- the anim card ---------- */
export default {
  id: 'perimeter',
  title: "THE PROWLER'S PATROL",

  mount(host, ctx) {
    let alive = true;
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };
    let introShown = false;
    let hiddenAhaShown = false;

    injectCss('perimeter', `
      .ppw-q { text-align: center; font-weight: 700; font-size: clamp(18px, 3.2vw, 25px); margin-bottom: 2px; }
      .ppw-qsub { text-align: center; font-size: 12.5px; color: #6b5744; font-weight: 500; margin-bottom: 8px; min-height: 16px; }
      .ppw-wrap { position: relative; margin: 0 auto; touch-action: none; }
      .ppw-svg { position: absolute; inset: 0; overflow: visible; }
      .ppw-svg polygon { fill: rgba(123,201,80,.18); }
      .ppw-svg .ppw-edge { stroke: var(--ink); stroke-width: 4; stroke-linecap: round; fill: none; opacity: .55; }
      .ppw-svg .ppw-edge.given { opacity: .8; }
      .ppw-svg .ppw-edge.hidden { stroke-dasharray: 7 7; opacity: .6; }
      .ppw-svg .ppw-edge.done { stroke: var(--correct); opacity: 1; stroke-width: 5; }
      .ppw-label {
        position: absolute; transform: translate(-50%,-50%); background: var(--swamp-deep); color: var(--gold);
        font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 13px; padding: 4px 9px; border-radius: 8px;
        box-shadow: 0 3px 0 rgba(0,0,0,.3); white-space: nowrap; pointer-events: none; transition: background .3s, color .3s;
      }
      .ppw-label.done { background: var(--correct); color: #fff; }
      .ppw-label.hidden-btn {
        pointer-events: auto; cursor: pointer; background: var(--wrong); color: #fff; border: none;
        animation: ppwPulse 1.3s ease-in-out infinite; font-size: 15px;
      }
      .ppw-label.hidden-btn.resolved { animation: none; background: var(--correct); cursor: default; pointer-events: none; }
      @keyframes ppwPulse { 0%,100% { transform: translate(-50%,-50%) scale(1); } 50% { transform: translate(-50%,-50%) scale(1.16); } }
      .ppw-prowler { position: absolute; z-index: 5; pointer-events: none; filter: drop-shadow(0 4px 5px rgba(0,0,0,.3)); }
      .ppw-hit { position: absolute; z-index: 6; cursor: grab; touch-action: none; border-radius: 50%; }
      .ppw-hit:active { cursor: grabbing; }
      .ppw-hint { position: absolute; z-index: 7; font-size: 10px; font-weight: 700; color: var(--gold-deep); white-space: nowrap; transform: translate(-50%,-100%); pointer-events: none; }
      .ppw-optrow { display: flex; gap: 8px; justify-content: center; margin-top: 10px; flex-wrap: wrap; min-height: 0; }
      .ppw-strip { display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap; margin-top: 12px; min-height: 40px; }
      .ppw-chip {
        background: var(--card); border: 2.5px solid var(--swamp-mid); color: var(--ink); border-radius: 10px;
        padding: 6px 11px; font-weight: 700; font-size: 14px; box-shadow: 0 3px 0 rgba(0,0,0,.2);
        animation: ppwChipIn .32s var(--spring) both;
      }
      @keyframes ppwChipIn { 0% { transform: scale(.4) translateY(-10px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
      .ppw-total {
        background: var(--swamp-mid); color: var(--stink-lime); border-radius: 12px; padding: 8px 16px;
        font-weight: 700; font-size: clamp(14px, 2.2vw, 17px); box-shadow: 0 3px 0 rgba(0,0,0,.3);
      }
      .ppw-dash {
        margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF);
        border: 3px solid var(--correct); border-radius: 14px; padding: 11px 16px;
        animation: animBubbleIn .34s var(--spring) both;
      }
      .ppw-dash .pd-title { font-weight: 700; font-size: 16px; color: #1d8f4e; }
      .ppw-dash .pd-worked { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 3px; }
      .ppw-dash .pd-btn { margin-top: 9px; padding: 10px 22px; font-size: 15px; }
    `);

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'ppw-q');
    const qsub = el('div', 'ppw-qsub');
    const wrap = el('div', 'ppw-wrap');
    const optrow = el('div', 'ppw-optrow');
    const strip = el('div', 'ppw-strip');
    const controls = el('div', 'anim-controls');
    const nl = el('button', 'anim-nudge', '⬅');
    const nr = el('button', 'anim-nudge', '➡');
    const reset = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(nl, nr, reset);
    const dash = el('div');
    stage.append(chiprow, q, qsub, wrap, optrow, strip, controls, dash);
    host.append(stage);

    const ruleCard = el('div', 'goldcard', RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;';
    host.append(ruleCard);

    let mi = 0;
    let mission = null;
    let edgeData = null; // { edges, total }
    let resolvedHidden = new Set(); // hidden edge indices resolved this mission
    let hiddenLabelEls = {}; // edgeIndex -> label el
    let Scm = 0; // displayed distance walked (canonical state, cm/m units)
    let pendingS = 0; // heading target for nudge repeat-taps (rule 3)
    let completed = new Set();
    let cancelTween = null;
    let dragCtrl = null;
    let finished = false;
    let g = null;
    let svgEl = null; let polyEl = null; let edgeLineEls = []; let labelEls = [];
    let prowlerEl = null; let hitEl = null;
    let chipEls = {}; // edgeIndex -> its running-sum chip element (keeps strip in sync with the fence)

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), m.name);
        c.addEventListener('click', () => { if (finished && !doneSet.has(mission.id)) return; sfx.ui(); start(i); });
        chiprow.append(c);
      });
    }

    function unresolvedHidden() { return mission.hiddenIdx.filter((idx) => !resolvedHidden.has(idx)); }
    function walkEnabled() { return alive && !finished && unresolvedHidden().length === 0; }

    function layout() {
      if (cancelTween) { cancelTween(); cancelTween = null; }
      if (dragCtrl) dragCtrl.abort();
      wrap.innerHTML = ''; labelEls = []; edgeLineEls = []; hiddenLabelEls = {};
      g = geomFor(mission.vertices, stage.clientWidth || 700);
      wrap.style.width = g.W + 'px';
      wrap.style.height = g.H + 'px';
      const svgNS = 'http://www.w3.org/2000/svg';
      svgEl = document.createElementNS(svgNS, 'svg');
      svgEl.setAttribute('class', 'ppw-svg');
      svgEl.setAttribute('width', g.W); svgEl.setAttribute('height', g.H);
      svgEl.setAttribute('viewBox', `0 0 ${g.W} ${g.H}`);
      const ptsStr = mission.vertices.map((v) => { const p = px(g, v); return `${p.x},${p.y}`; }).join(' ');
      polyEl = document.createElementNS(svgNS, 'polygon');
      polyEl.setAttribute('points', ptsStr);
      svgEl.append(polyEl);
      edgeData.edges.forEach((e) => {
        const p0 = px(g, e.p0); const p1 = px(g, e.p1);
        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', p0.x); line.setAttribute('y1', p0.y);
        line.setAttribute('x2', p1.x); line.setAttribute('y2', p1.y);
        const isHidden = mission.hiddenIdx.includes(e.i);
        line.setAttribute('class', 'ppw-edge' + (isHidden ? ' hidden' : ' given'));
        svgEl.append(line);
        edgeLineEls[e.i] = line;
      });
      wrap.append(svgEl);
      // labels at outward-offset edge midpoints
      edgeData.edges.forEach((e) => {
        const mx = (e.p0[0] + e.p1[0]) / 2; const my = (e.p0[1] + e.p1[1]) / 2;
        const mid = px(g, [mx, my]);
        const centroidPx = px(g, [g.cx, g.cy]);
        let ox = 0; let oy = 0;
        if (e.axis === 'x') oy = mid.y < centroidPx.y ? -20 : 20;
        else ox = mid.x < centroidPx.x ? -30 : 30;
        const isHidden = mission.hiddenIdx.includes(e.i);
        const isResolved = isHidden && resolvedHidden.has(e.i);
        const showAsNumber = !isHidden || isResolved;
        const lab = el('div', 'ppw-label' + (isHidden && !isResolved ? ' hidden-btn' : '') + (isResolved ? ' hidden-btn resolved' : ''), showAsNumber ? String(e.len) + ' ' + mission.unit : '?');
        lab.style.left = (mid.x + ox) + 'px';
        lab.style.top = (mid.y + oy) + 'px';
        if (isHidden) {
          if (!isResolved) lab.addEventListener('click', () => openHiddenOptions(e.i));
          hiddenLabelEls[e.i] = lab;
        }
        wrap.append(lab);
        labelEls[e.i] = lab;
      });
      prowlerEl = el('img', 'ppw-prowler'); prowlerEl.src = PROWLER_IMG; prowlerEl.alt = 'The Perimeter Prowler';
      hitEl = el('div', 'ppw-hit');
      wrap.append(prowlerEl, hitEl);
      const size = Math.round(Math.max(38, Math.min(56, g.scale * 1.1)));
      prowlerEl.style.width = size + 'px'; prowlerEl.style.height = size + 'px';
      hitEl.style.width = (size + 34) + 'px'; hitEl.style.height = (size + 34) + 'px';
      positionProwler();
      renderCompleted(true);

      dragCtrl = makeDrag(hitEl, {
        enabled: () => walkEnabled(),
        onStart() { dragCtrl._lx = 0; dragCtrl._ly = 0; },
        onMove(dx, dy) {
          const ddx = dx - dragCtrl._lx; const ddy = dy - dragCtrl._ly;
          dragCtrl._lx = dx; dragCtrl._ly = dy;
          const pos = posAtS(edgeData.edges, Scm);
          const ds = (ddx * pos.tangent.x + ddy * pos.tangent.y) / g.scale;
          setScm(Scm + ds, false);
          pendingS = Scm;
        },
        onEnd() { pendingS = Scm; },
      });
      hitEl.addEventListener('click', () => {
        if (!walkEnabled() && unresolvedHidden().length) { sfx.nudge(); toast(stage, '❔ Find the hidden sides first — tap each glowing ?'); }
      });
    }

    function positionProwler() {
      const pos = posAtS(edgeData.edges, Scm);
      const p = px(g, [pos.x, pos.y]);
      const size = parseFloat(prowlerEl.style.width);
      prowlerEl.style.left = (p.x - size / 2) + 'px';
      prowlerEl.style.top = (p.y - size / 2) + 'px';
      const hs = parseFloat(hitEl.style.width);
      hitEl.style.left = (p.x - hs / 2) + 'px';
      hitEl.style.top = (p.y - hs / 2) + 'px';
    }

    function renderCompleted(instant) {
      const nowDone = completedSet(edgeData.edges, Scm);
      edgeData.edges.forEach((e) => {
        const wasDone = completed.has(e.i);
        const isDone = nowDone.has(e.i);
        if (isDone && !wasDone) {
          completed.add(e.i);
          edgeLineEls[e.i].classList.add('done');
          if (!mission.hiddenIdx.includes(e.i) || resolvedHidden.has(e.i)) labelEls[e.i].classList.add('done');
          if (!instant) {
            sfx.tick(completed.size);
            const chip = el('div', 'ppw-chip', (strip.children.length ? '+' : '') + e.len);
            strip.append(chip);
            chipEls[e.i] = chip;
            updateTotal();
          }
        } else if (!isDone && wasDone) {
          completed.delete(e.i);
          edgeLineEls[e.i].classList.remove('done');
          if (!mission.hiddenIdx.includes(e.i) || resolvedHidden.has(e.i)) labelEls[e.i].classList.remove('done');
          // dragging the Prowler BACKWARD un-walks a side — the strip must drop
          // back in step with the fence, or the total would quote a state the
          // board is no longer showing (hard rule 2).
          if (!instant && chipEls[e.i]) {
            chipEls[e.i].remove();
            delete chipEls[e.i];
            updateTotal();
          }
        }
      });
      if (instant) rebuildStrip();
    }
    function rebuildStrip() {
      strip.innerHTML = '';
      chipEls = {};
      const ordered = edgeData.edges.filter((e) => completed.has(e.i));
      ordered.forEach((e, i) => {
        const chip = el('div', 'ppw-chip', (i ? '+' : '') + e.len);
        strip.append(chip);
        chipEls[e.i] = chip;
      });
      updateTotal();
    }
    function updateTotal() {
      const sum = edgeData.edges.filter((e) => completed.has(e.i)).reduce((s, e) => s + e.len, 0);
      const t = strip.querySelector('.ppw-total');
      if (t) t.remove();
      if (completed.size) {
        const tot = el('div', 'ppw-total', 'so far: ' + sum + ' ' + mission.unit);
        strip.append(tot);
      }
    }

    function setScm(v, silent) {
      const total = edgeData.total;
      const next = Math.max(0, Math.min(total, v));
      Scm = next;
      positionProwler();
      renderCompleted(silent);
      if (Scm >= total - 1e-9 && !finished) finishWalk();
    }

    function finishWalk() {
      finished = true;
      const total = edgeData.total;
      later(() => {
        if (!alive) return;
        sfx.thud();
        sfx.win();
        party(stage);
        const p = px(g, [mission.vertices[0][0], mission.vertices[0][1]]);
        const wrapRect = wrap.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();
        sparkleBurst(stage, wrapRect.left - stageRect.left + p.x, wrapRect.top - stageRect.top + p.y);
        doneSet.add(mission.id);
        paintChips();
        const d = el('div', 'ppw-dash',
          `<div class="pd-title">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]} Perimeter = <b>${total} ${mission.unit}</b></div>`
          + `<div class="pd-worked">${mission.worked}</div>`);
        dash.innerHTML = ''; dash.append(d);
        qsub.textContent = 'Gate slams shut — the whole fence is walked!';
        if (doneSet.size === MISSIONS.length) ctx.complete();
        const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
        const btn = el('button', 'btn btn-gold pd-btn', nextIdx !== -1 ? 'NEXT PATROL ➡' : 'WALK AGAIN 🥾');
        btn.addEventListener('click', () => { sfx.ui(); start(nextIdx !== -1 ? nextIdx : mi); });
        d.append(btn);
      }, 160);
    }

    function openHiddenOptions(idx) {
      if (resolvedHidden.has(idx) || finished || !alive) return;
      optrow.innerHTML = '';
      const choices = shuffle(mission.hiddenOptions[idx]);
      const label = el('div', 'ppw-qsub', 'How long is this hidden side?');
      label.style.cssText = 'width:100%;margin-bottom:2px;';
      optrow.append(label);
      choices.forEach((val) => {
        const b = el('button', 'anim-mchip', val + ' ' + mission.unit);
        b.addEventListener('click', () => pickHidden(idx, val));
        optrow.append(b);
      });
    }
    function pickHidden(idx, val) {
      const correct = edgeData.edges[idx].len === val;
      if (correct) {
        resolvedHidden.add(idx);
        sfx.pop();
        const lab = hiddenLabelEls[idx];
        lab.textContent = val + ' ' + mission.unit;
        lab.classList.add('resolved');
        toast(stage, mission.hiddenWhy[idx][val]);
        optrow.innerHTML = '';
        if (unresolvedHidden().length === 0) {
          qsub.textContent = 'Both hidden sides found! Now drag the Prowler along the fence — he can\'t leave it.';
          if (!hiddenAhaShown) {
            hiddenAhaShown = true;
            later(() => { if (alive) bubble(stage, { title: 'HIDDEN SIDES STILL COUNT! 🥾', text: RULE, img: PROWLER_IMG }); }, 260);
          }
        } else {
          qsub.textContent = 'One more hidden side to go — tap the other ?';
        }
      } else {
        sfx.nudge();
        toast(stage, mission.hiddenWhy[idx][val]);
      }
    }

    function start(i) {
      mi = i;
      mission = MISSIONS[i];
      edgeData = edgesFor(mission.vertices);
      resolvedHidden = new Set();
      completed = new Set();
      chipEls = {};
      Scm = 0; pendingS = 0; finished = false;
      optrow.innerHTML = ''; strip.innerHTML = ''; dash.innerHTML = '';
      paintChips();
      q.innerHTML = `Walk ${mission.name}`;
      qsub.textContent = mission.hiddenIdx.length
        ? 'Two sides are hidden — tap each glowing ? and pick its length before the Prowler can walk.'
        : 'Drag the Prowler along the fence — he can\'t leave it. Every side lights up as he walks it.';
      layout();
      if (!introShown) {
        introShown = true;
        later(() => { if (alive) bubble(stage, { title: 'MEET THE PROWLER 🥾', text: 'He will not tell you the distance round a fence unless he has personally walked <b>every single side</b> first. No shortcuts. Ever.', img: PROWLER_IMG }); }, 200);
      }
    }

    const STEP = 1;
    nl.addEventListener('click', () => {
      if (!walkEnabled() || (dragCtrl && dragCtrl.dragging())) { if (unresolvedHidden().length) { sfx.nudge(); toast(stage, '❔ Find the hidden sides first — tap each glowing ?'); } return; }
      if (cancelTween) cancelTween();
      pendingS = Math.max(0, pendingS - STEP);
      const from = Scm;
      cancelTween = tween((v) => setScm(v, false), from, pendingS, 260, () => { cancelTween = null; });
    });
    nr.addEventListener('click', () => {
      if (!walkEnabled() || (dragCtrl && dragCtrl.dragging())) { if (unresolvedHidden().length) { sfx.nudge(); toast(stage, '❔ Find the hidden sides first — tap each glowing ?'); } return; }
      if (cancelTween) cancelTween();
      pendingS = Math.min(edgeData.total, pendingS + STEP);
      const from = Scm;
      cancelTween = tween((v) => setScm(v, false), from, pendingS, 260, () => { cancelTween = null; });
    });
    reset.addEventListener('click', () => {
      if (dragCtrl && dragCtrl.dragging()) return;
      sfx.ui();
      if (cancelTween) { cancelTween(); cancelTween = null; }
      finished = false;
      qsub.textContent = mission.hiddenIdx.length && unresolvedHidden().length
        ? 'Two sides are hidden — tap each glowing ? and pick its length before the Prowler can walk.'
        : 'Drag the Prowler along the fence — he can\'t leave it. Every side lights up as he walks it.';
      dash.innerHTML = '';
      strip.innerHTML = '';
      chipEls = {};
      pendingS = 0;
      const from = Scm;
      cancelTween = tween((v) => setScm(v, false), from, 0, 380, () => { cancelTween = null; });
    });

    const onResize = () => {
      if (!alive) return;
      if (cancelTween) { cancelTween(); cancelTween = null; }
      if (dragCtrl) dragCtrl.abort();
      layout();
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
      if (cancelTween) cancelTween();
      if (dragCtrl) dragCtrl.destroy();
      stage.remove();
      ruleCard.remove();
    };
  },
};
