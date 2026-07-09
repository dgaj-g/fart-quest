// FART QUEST — js/anims/coordinates.js
// GRIDLOCK'S DELIVERY RUN — interactive first-quadrant grid for the
// coordinates Scout Report. Gridlock only ever moves ALONG the hall first,
// THEN up the stairs — the drag is physically locked to one axis at a time
// so the order can never be skipped. Structure follows timetables.js /
// decimals-x10.js (the house reference implementations).

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const GRIDLOCK_IMG = 'assets/monsters/gridlock.png';
const RULE = 'ALONG the hall first, THEN up the stairs. (x, y) — always in that order.';

/* ---------- pure grid geometry (unit-tested in a scratch node script — do not "improve") ---------- */
const GRID_W = 8;
const GRID_H = 6;
function gridGeom(hostWidth) {
  const padL = 34; const padT = 16; const padB = 26;
  const avail = Math.max(300, Math.min(680, hostWidth - 24));
  const cell = Math.max(34, Math.min(58, Math.floor((avail - padL) / GRID_W)));
  const W = padL + cell * GRID_W + 14;
  const H = padT + cell * GRID_H + padB;
  return { padL, padT, padB, cell, W, H, originX: padL, originY: padT + cell * GRID_H };
}
function xPix(g, gx) { return g.originX + gx * g.cell; }
function yPix(g, gy) { return g.originY - gy * g.cell; }
function xIdx(g, px) { return Math.max(0, Math.min(GRID_W, Math.round((px - g.originX) / g.cell))); }
function yIdx(g, px) { return Math.max(0, Math.min(GRID_H, Math.round((g.originY - px) / g.cell))); }
function classify(mission, gx, gy) {
  if (gx === mission.target.x && gy === mission.target.y) return 'win';
  if (mission.decoy && gx === mission.decoy.x && gy === mission.decoy.y) return 'decoy';
  if (gx === mission.target.y && gy === mission.target.x) return 'swap';
  return 'wrong';
}
function isGrumble(dx, dy) { return Math.abs(dy) > 16 && Math.abs(dy) > Math.abs(dx) + 8; }

/* ---------- content (verbatim vocab from data/topics/coordinates.js) ---------- */
const MISSIONS = [
  {
    id: 'a', type: 'deliver', chip: 'Deliver to (4, 3)',
    target: { x: 4, y: 3 },
    q: 'Deliver the parcel to <b>(4, 3)</b>',
    qsub: 'Drag Gridlock ALONG the hall to 4, then UP the stairs to 3.',
    worked: 'Gridlock walked 4 ALONG the hall, then 3 UP the stairs — the parcel landed at (4, 3)!',
  },
  {
    id: 'b', type: 'deliver', chip: 'Deliver to (0, 5)',
    target: { x: 0, y: 5 },
    q: 'Deliver the parcel to <b>(0, 5)</b>',
    qsub: 'Zero along! Tap Gridlock to confirm ALONG is 0 — then he can climb.',
    worked: 'ALONG was 0 — Gridlock still confirmed it right at the origin\'s own doorstep. Then 5 UP — the parcel landed at (0, 5)!',
  },
  {
    id: 'c', type: 'read', chip: 'Read the chest’s address',
    target: { x: 6, y: 2 },
    q: 'What’s the treasure chest’s address?',
    qsub: 'Walk Gridlock ALONG to the chest’s column first, then UP to meet it — read off the address as you go.',
    worked: '6 ALONG, 2 UP — the chest’s address is (6, 2)!',
  },
  {
    id: 'd', type: 'deliver', chip: 'Deliver to (2, 5) ⚠️',
    target: { x: 2, y: 5 }, decoy: { x: 5, y: 2 },
    q: 'Deliver the parcel to <b>(2, 5)</b>',
    qsub: 'Careful — there’s a decoy chest at (5, 2). Don’t swap the order round!',
    worked: '2 ALONG, then 5 UP — safely at (2, 5), nowhere near the decoy’s (5, 2)!',
  },
];
const WIN_PHRASES = ['DELIVERED! 📦', 'RIGHT DOOR, RIGHT ORDER!', 'GRIDLOCK NEVER GETS LOST!', 'ALONG THEN UP — PERFECT!'];

/* ---------- CSS (prefix gdr-) ---------- */
injectCss('coordinates', `
  .gdr-q { text-align: center; font-weight: 700; font-size: clamp(18px, 3.1vw, 26px); margin-bottom: 2px; }
  .gdr-qsub { text-align: center; font-size: 12.5px; color: #6b5744; font-weight: 500; margin-bottom: 12px; min-height: 16px; }
  .gdr-scene { position: relative; margin: 0 auto; }
  .gdr-plane { position: relative; margin: 0 auto; touch-action: none; -webkit-user-select: none; user-select: none; }
  .gdr-grid {
    position: absolute; border-radius: 4px;
    background-image: linear-gradient(to right, rgba(51,38,29,.16) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(51,38,29,.16) 1px, transparent 1px);
    background-position: -1px -1px;
  }
  .gdr-hall { position: absolute; background: rgba(244,197,66,.22); pointer-events: none; border-radius: 3px; }
  .gdr-stairs {
    position: absolute; background: rgba(155,89,208,.16); pointer-events: none; border-radius: 3px;
    opacity: 0; transform: scaleY(.4); transform-origin: bottom; transition: opacity .4s var(--spring), transform .4s var(--spring);
  }
  .gdr-stairs.gdr-unlocked { opacity: 1; transform: scaleY(1); }
  .gdr-axis { position: absolute; background: var(--ink); opacity: .55; }
  .gdr-axis-x { height: 2px; }
  .gdr-axis-y { width: 2px; }
  .gdr-home { position: absolute; font-size: 15px; transform: translate(-55%,40%); pointer-events: none; }
  .gdr-xlbl, .gdr-ylbl { position: absolute; font-size: 10.5px; font-weight: 700; color: #7c6247; text-align: center; pointer-events: none; }
  .gdr-caption {
    position: absolute; font-size: 9.5px; font-weight: 700; letter-spacing: .06em; color: var(--gold-deep);
    white-space: nowrap; pointer-events: none;
  }
  .gdr-caption.gdr-vert { writing-mode: vertical-rl; }
  .gdr-mark {
    position: absolute; transform: translate(-50%,-50%); font-size: 24px; pointer-events: none; z-index: 4;
    filter: drop-shadow(0 3px 3px rgba(0,0,0,.28));
  }
  .gdr-mark .gm-lbl {
    position: absolute; top: 100%; left: 50%; transform: translateX(-50%); margin-top: 1px;
    background: var(--card); border: 2px solid var(--swamp-mid); color: var(--ink); font-weight: 700;
    font-size: 10px; border-radius: 999px; padding: 1px 7px; white-space: nowrap;
  }
  .gdr-token {
    position: absolute; width: 54px; height: 54px; transform: translate(-50%,-50%);
    display: flex; align-items: center; justify-content: center; cursor: grab; touch-action: none; z-index: 9;
  }
  .gdr-token.gdr-dragging { cursor: grabbing; }
  .gdr-token img { width: 38px; height: auto; pointer-events: none; filter: drop-shadow(0 4px 4px rgba(0,0,0,.3)); }
  .gdr-token.gdr-grumble { animation: gdrWobble .5s ease; }
  @keyframes gdrWobble {
    0%, 100% { transform: translate(-50%,-50%) rotate(0); }
    25% { transform: translate(-50%,-50%) rotate(-10deg); }
    60% { transform: translate(-50%,-50%) rotate(9deg); }
  }
  .gdr-arrow {
    position: absolute; font-size: 20px; transform: translate(-50%,-50%); opacity: 0; pointer-events: none; z-index: 10;
    transition: opacity .25s;
  }
  .gdr-arrow.gdr-show { opacity: 1; animation: gdrPoke .5s ease 2; }
  @keyframes gdrPoke { 0%, 100% { transform: translate(-50%,-50%) translateX(0); } 50% { transform: translate(-50%,-50%) translateX(8px); } }
  .gdr-readout {
    background: #241d15; border-radius: 12px; padding: 8px 18px; min-width: 170px; text-align: center;
    box-shadow: inset 0 3px 10px rgba(0,0,0,.6); border: 3px solid #4a3b28; margin: 12px auto 0;
  }
  .gdr-readout .gr-l { font-size: 9px; letter-spacing: .18em; color: #8f7a5e; font-weight: 700; }
  .gdr-readout .gr-n { font-size: clamp(20px, 3.2vw, 26px); font-weight: 700; color: var(--stink-lime); letter-spacing: .03em; }
  .gdr-readout .gr-n .gr-dim { color: #6b5744; }
  .gdr-win {
    margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF);
    border: 3px solid var(--correct); border-radius: 14px; padding: 11px 16px;
    animation: animBubbleIn .34s var(--spring) both;
  }
  .gdr-win .gw-title { font-weight: 700; color: #1d8f4e; font-size: 16px; }
  .gdr-win .gw-worked { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 3px; }
  .gdr-win .gw-btn { margin-top: 9px; padding: 10px 22px; font-size: 15px; }
`);

/* ---------- the anim card ---------- */
export default {
  id: 'coordinates',
  title: 'GRIDLOCK’S DELIVERY RUN',

  mount(host, ctx) {
    let alive = true;
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'gdr-q');
    const qsub = el('div', 'gdr-qsub');
    const sceneHost = el('div', 'gdr-scene');
    const winBox = el('div');
    const controls = el('div', 'anim-controls');
    const nMinus = el('button', 'anim-nudge', '⬅');
    const checkBtn = el('button', 'btn btn-gold', 'DELIVER 📦');
    const nPlus = el('button', 'anim-nudge', '➡');
    const resetBtn = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(nMinus, checkBtn, nPlus, resetBtn);
    stage.append(chiprow, q, qsub, sceneHost, winBox, controls);
    host.append(stage);

    const ruleCard = el('div', 'goldcard', RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;';
    host.append(ruleCard);

    let mi = 0;
    let mission = null;
    let scene = null; // { layout(), destroy() }

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), m.chip);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
    }

    function finishMission(missionObj, workedHtml) {
      doneSet.add(missionObj.id);
      if (missionObj !== mission) { paintChips(); return; }
      sfx.win(); party(stage); paintChips();
      winBox.innerHTML = '';
      const w = el('div', 'gdr-win',
        `<div class="gw-title">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]}</div>`
        + `<div class="gw-worked">${workedHtml}</div>`);
      winBox.append(w);
      if (doneSet.size === MISSIONS.length) ctx.complete();
      const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
      const btn = el('button', 'btn btn-gold gw-btn', nextIdx !== -1 ? 'NEXT ONE ➡' : 'REVISIT A MISSION 🔁');
      btn.addEventListener('click', () => { sfx.ui(); start(nextIdx !== -1 ? nextIdx : mi); });
      w.append(btn);
    }

    /* ---------- the grid plane ---------- */
    function buildPlane(m) {
      const missionRef = m; // captured once — never read the outer mutable `mission` from a deferred callback
      sceneHost.innerHTML = '';
      const wrap = el('div', 'gdr-plane');
      const gridEl = el('div', 'gdr-grid');
      const hallEl = el('div', 'gdr-hall');
      const stairsEl = el('div', 'gdr-stairs');
      const axisX = el('div', 'gdr-axis gdr-axis-x');
      const axisY = el('div', 'gdr-axis gdr-axis-y');
      const homeEl = el('div', 'gdr-home', '🏠');
      const alongCap = el('div', 'gdr-caption', 'ALONG THE HALL →');
      const upCap = el('div', 'gdr-caption gdr-vert', '↑ UP THE STAIRS');
      const xLbls = []; for (let x = 0; x <= GRID_W; x++) xLbls.push(el('div', 'gdr-xlbl', String(x)));
      const yLbls = []; for (let y = 0; y <= GRID_H; y++) yLbls.push(el('div', 'gdr-ylbl', String(y)));
      const targetMark = el('div', 'gdr-mark', m.type === 'read' ? '🧰<span class="gm-lbl">?</span>' : '');
      const decoyMark = el('div', 'gdr-mark', m.decoy ? '🎁<span class="gm-lbl">tempting…</span>' : '');
      const arrow = el('div', 'gdr-arrow', '➡️');
      const token = el('div', 'gdr-token', `<img src="${GRIDLOCK_IMG}" alt="">`);
      const readout = el('div', 'gdr-readout', '<div class="gr-l">GRIDLOCK’S ADDRESS</div><div class="gr-n"></div>');
      wrap.append(gridEl, hallEl, stairsEl, axisX, axisY, homeEl, alongCap, upCap, ...xLbls, ...yLbls, targetMark, decoyMark, arrow, token);
      sceneHost.append(wrap, readout);

      let g = gridGeom(sceneHost.clientWidth || 640);
      let phase = 'along'; // 'along' -> 'up'
      let gx = 0; let gy = 0;
      let liveGx = 0; let liveGy = 0;
      let pendingGx = 0; let pendingGy = 0; // where a settle-tween is HEADING (rule 3: repeat-taps act on this, not the last settled value)
      let missionDone = false;
      let settling = false;
      let cancelTween = null;
      let grumbleTimer = null;
      const shownPops = new Set();

      function readoutText() {
        const xTxt = phase === 'along' ? liveGx : gx;
        const yTxt = phase === 'along' ? '_' : liveGy;
        return `(<span>${xTxt}</span>, <span class="${yTxt === '_' ? 'gr-dim' : ''}">${yTxt}</span>)`;
      }
      function updateReadout() { readout.querySelector('.gr-n').innerHTML = readoutText(); }

      function place() {
        token.style.left = xPix(g, phase === 'along' ? liveGx : gx) + 'px';
        token.style.top = yPix(g, phase === 'along' ? 0 : liveGy) + 'px';
      }

      function layout() {
        // abandon any live drag/tween BEFORE recomputing geometry — never fight a finger
        // the child is still touching, or a settle-tween mid-flight
        if (cancelTween) { cancelTween(); cancelTween = null; settling = false; }
        drag.abort();
        token.classList.remove('gdr-dragging');
        g = gridGeom(sceneHost.clientWidth || 640);
        wrap.style.width = g.W + 'px'; wrap.style.height = g.H + 'px';
        gridEl.style.left = g.padL + 'px'; gridEl.style.top = g.padT + 'px';
        gridEl.style.width = (g.cell * GRID_W) + 'px'; gridEl.style.height = (g.cell * GRID_H) + 'px';
        gridEl.style.backgroundSize = `${g.cell}px ${g.cell}px`;
        hallEl.style.left = g.padL + 'px'; hallEl.style.top = (yPix(g, 0) - g.cell * 0.16) + 'px';
        hallEl.style.width = (g.cell * GRID_W) + 'px'; hallEl.style.height = (g.cell * 0.32) + 'px';
        axisX.style.left = g.originX + 'px'; axisX.style.top = yPix(g, 0) + 'px'; axisX.style.width = (g.cell * GRID_W) + 'px';
        axisY.style.left = g.originX + 'px'; axisY.style.top = g.padT + 'px'; axisY.style.height = (g.cell * GRID_H) + 'px';
        homeEl.style.left = xPix(g, 0) + 'px'; homeEl.style.top = yPix(g, 0) + 'px';
        alongCap.style.left = xPix(g, GRID_W / 2) + 'px'; alongCap.style.top = (yPix(g, 0) + g.padB - 4) + 'px'; alongCap.style.transform = 'translateX(-50%)';
        upCap.style.left = (g.padL - 24) + 'px'; upCap.style.top = yPix(g, GRID_H / 2) + 'px'; upCap.style.transform = 'translate(-50%,-50%)';
        xLbls.forEach((lb, x) => { lb.style.left = xPix(g, x) + 'px'; lb.style.top = (yPix(g, 0) + 4) + 'px'; lb.style.width = g.cell + 'px'; lb.style.transform = 'translateX(-50%)'; });
        yLbls.forEach((lb, y) => { lb.style.left = (g.padL - 20) + 'px'; lb.style.top = yPix(g, y) + 'px'; lb.style.width = '16px'; lb.style.transform = 'translateY(-50%)'; });
        if (m.type === 'read') { targetMark.style.left = xPix(g, m.target.x) + 'px'; targetMark.style.top = yPix(g, m.target.y) + 'px'; }
        if (m.decoy) { decoyMark.style.left = xPix(g, m.decoy.x) + 'px'; decoyMark.style.top = yPix(g, m.decoy.y) + 'px'; }
        stairsEl.style.left = (xPix(g, phase === 'along' ? liveGx : gx) - g.cell * 0.16) + 'px';
        stairsEl.style.top = g.padT + 'px'; stairsEl.style.width = (g.cell * 0.32) + 'px'; stairsEl.style.height = (g.cell * GRID_H) + 'px';
        stairsEl.classList.toggle('gdr-unlocked', phase === 'up');
        place();
        updateReadout();
        updateNudgeLabels();
        checkBtn.disabled = phase !== 'up' || missionDone;
      }

      function commitAlong(idx) {
        gx = idx; liveGx = idx; pendingGx = idx; phase = 'up'; liveGy = gy; pendingGy = gy;
        sfx.settle();
        stairsEl.style.left = (xPix(g, gx) - g.cell * 0.16) + 'px';
        stairsEl.classList.add('gdr-unlocked');
        updateReadout();
        updateNudgeLabels();
        checkBtn.disabled = missionDone;
        if (m.id === 'b' && gx === 0 && !shownPops.has('zero')) {
          shownPops.add('zero');
          later(() => bubble(stage, {
            title: 'ZERO STILL COUNTS! 🚪',
            text: 'Gridlock hasn’t taken a single step ALONG the hall — he’s still confirmed it, right at the origin’s own doorstep. Now he’s free to climb: drag him UP to <b>5</b>.',
            img: GRIDLOCK_IMG,
          }), 260);
        }
      }
      function commitUp(idx) { gy = idx; liveGy = idx; pendingGy = idx; sfx.settle(); updateReadout(); checkBtn.disabled = missionDone; }

      function settleAlong(idx) {
        if (cancelTween) cancelTween();
        pendingGx = idx; settling = true;
        const from = parseFloat(token.style.left);
        cancelTween = tween((v) => {
          token.style.left = v + 'px';
          const prov = xIdx(g, v);
          if (prov !== liveGx) { liveGx = prov; updateReadout(); }
        }, from, xPix(g, idx), 220, () => {
          settling = false; cancelTween = null; commitAlong(idx);
        });
      }
      function settleUp(idx) {
        if (cancelTween) cancelTween();
        pendingGy = idx; settling = true;
        const from = parseFloat(token.style.top);
        cancelTween = tween((v) => {
          token.style.top = v + 'px';
          const prov = yIdx(g, v);
          if (prov !== liveGy) { liveGy = prov; updateReadout(); }
        }, from, yPix(g, idx), 220, () => {
          settling = false; cancelTween = null; commitUp(idx);
        });
      }

      let dragBase = 0; let grumbled = false;
      const drag = makeDrag(token, {
        enabled: () => alive && !missionDone && !settling,
        onStart() {
          grumbled = false;
          dragBase = phase === 'along' ? xPix(g, gx) : yPix(g, gy);
          liveGx = gx; liveGy = gy;
          token.classList.add('gdr-dragging');
        },
        onMove(dx, dy) {
          if (phase === 'along') {
            const nx = Math.max(xPix(g, 0), Math.min(xPix(g, GRID_W), dragBase + dx));
            token.style.left = nx + 'px';
            const idx = xIdx(g, nx);
            if (idx !== liveGx) { (idx > liveGx ? sfx.tick : sfx.tock)(); liveGx = idx; updateReadout(); }
            if (!grumbled && isGrumble(dx, dy)) {
              grumbled = true; sfx.nudge();
              token.classList.remove('gdr-grumble'); void token.offsetWidth; token.classList.add('gdr-grumble');
              arrow.style.left = (xPix(g, liveGx) + g.cell * 0.7) + 'px';
              arrow.style.top = yPix(g, 0) + 'px';
              arrow.classList.add('gdr-show');
              if (grumbleTimer) { clearTimeout(grumbleTimer); timers.delete(grumbleTimer); }
              grumbleTimer = setTimeout(() => { grumbleTimer = null; if (alive) arrow.classList.remove('gdr-show'); }, 900);
              timers.add(grumbleTimer);
              toast(stage, 'Gridlock plants his feet and grumbles — ALONG the hall first!');
            }
          } else {
            const ny = Math.max(yPix(g, GRID_H), Math.min(yPix(g, 0), dragBase + dy));
            token.style.top = ny + 'px';
            const idy = yIdx(g, ny);
            if (idy !== liveGy) { (idy > liveGy ? sfx.tick : sfx.tock)(); liveGy = idy; updateReadout(); }
          }
        },
        onEnd() {
          token.classList.remove('gdr-dragging');
          if (phase === 'along') settleAlong(liveGx); else settleUp(liveGy);
        },
      });

      layout();

      let attempts = 0;
      function onCheck() {
        if (!alive || missionDone || phase !== 'up' || settling || drag.dragging()) return;
        sfx.ui();
        const kind = classify(m, gx, gy);
        if (kind === 'win') {
          missionDone = true;
          checkBtn.disabled = true;
          sparkleBurst(wrap, xPix(g, gx), yPix(g, gy));
          if (m.type === 'deliver') sfx.drop();
          later(() => finishMission(missionRef, missionRef.worked), m.type === 'deliver' ? 260 : 0);
          return;
        }
        attempts += 1; sfx.nudge();
        let text;
        if (kind === 'decoy') {
          text = `Careful — <b>(${gx}, ${gy})</b> is the DECOY chest! Swap the order round and you knock on the wrong house. The real parcel needs <b>(${m.target.x}, ${m.target.y})</b>.`;
        } else if (kind === 'swap') {
          text = 'ALONG comes first, then UP — you have swapped the order round.';
        } else if (gx !== m.target.x) {
          text = `Gridlock’s ALONG count is <b>${gx}</b> — tap ↩ RESET and count ALONG again to <b>${m.target.x}</b> before climbing.`;
        } else {
          text = `ALONG is spot on at <b>${gx}</b> — but UP needs work. You’re at <b>${gy}</b>; slide up (or down) the stairs to line it up.`;
        }
        if (attempts >= 2) text += `<br><br>🎩 Psst: the address is exactly <b>(${m.target.x}, ${m.target.y})</b> — ALONG ${m.target.x}, then UP ${m.target.y}.`;
        bubble(stage, { title: 'NOT QUITE THERE! 🤔', text, img: GRIDLOCK_IMG });
      }

      // repeat-taps act on where the UI is HEADING (the pending settle target), never on the
      // last value that actually settled — otherwise a fast double-tap mid-animation undershoots
      function nudge(dir) {
        if (!alive || missionDone || drag.dragging()) return;
        if (phase === 'along') {
          const base = settling ? pendingGx : gx;
          const target = Math.max(0, Math.min(GRID_W, base + dir));
          if (target === base) { sfx.nudge(); return; }
          settleAlong(target);
        } else {
          const base = settling ? pendingGy : gy;
          const target = Math.max(0, Math.min(GRID_H, base + dir));
          if (target === base) { sfx.nudge(); return; }
          settleUp(target);
        }
      }

      function updateNudgeLabels() {
        nMinus.textContent = phase === 'along' ? '⬅' : '⬇';
        nPlus.textContent = phase === 'along' ? '➡' : '⬆';
      }

      return {
        layout,
        onCheck,
        nudge,
        reset() {
          if (drag.dragging()) return;
          if (cancelTween) { cancelTween(); cancelTween = null; }
          settling = false; phase = 'along'; gx = 0; gy = 0; liveGx = 0; liveGy = 0; pendingGx = 0; pendingGy = 0; missionDone = false; attempts = 0;
          stairsEl.classList.remove('gdr-unlocked');
          winBox.innerHTML = '';
          layout();
        },
        destroy() {
          if (cancelTween) cancelTween();
          if (grumbleTimer) { clearTimeout(grumbleTimer); timers.delete(grumbleTimer); }
          drag.destroy();
        },
      };
    }

    function start(i) {
      if (scene) scene.destroy();
      mi = i; mission = MISSIONS[i];
      winBox.innerHTML = '';
      paintChips();
      q.innerHTML = mission.q;
      qsub.textContent = mission.qsub;
      checkBtn.textContent = mission.type === 'read' ? 'READ IT OFF 📝' : 'DELIVER 📦';
      scene = buildPlane(mission);
    }

    checkBtn.addEventListener('click', () => scene && scene.onCheck());
    nMinus.addEventListener('click', () => scene && scene.nudge(-1));
    nPlus.addEventListener('click', () => scene && scene.nudge(1));
    resetBtn.addEventListener('click', () => { sfx.ui(); scene && scene.reset(); });

    const onResize = () => { if (scene) scene.layout(); };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    start(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      if (scene) scene.destroy();
      stage.remove();
      ruleCard.remove();
    };
  },
};
