// FART QUEST — js/anims/timetables.js
// BOGFACE'S FINGER-TRACK — interactive timetable-grid + journey-time counter
// for the timetables Scout Report. Structure and interaction discipline
// follow decimals-x10.js / rounding.js (the house reference implementations).

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const BOG_IMG = 'assets/monsters/bus-conductor-bogface.png';
const RULE = 'One finger on the row, one on the column — read where they meet. For journey time, count UP to the next hour, then on.';

/* ---------- timetable data (verbatim from data/topics/timetables.js brief) ---------- */
const STOPS = ['Swamp Gate', 'Puddle Lane', 'Catapult Hill', 'Terminus'];
const BUSES = [
  { name: 'Bus A', times: ['08:40', '08:52', '09:03', '09:15'] },
  { name: 'Bus B', times: ['09:00', '09:12', '09:23', '09:35'] },
  { name: 'Bus C', times: ['09:30', '09:42', '09:53', '10:05'] },
];

/* ---------- pure helpers (unit-checked in a scratch node script — do not "improve") ---------- */
function parseHM(str) { const [h, m] = str.split(':').map(Number); return h * 60 + m; }
function lerp(a, b, k) { return a + (b - a) * k; }

/* ---------- derived mission facts, computed from the data above ---------- */
const READ = { stopIdx: 2, busIdx: 1 }; // Catapult Hill × Bus B
const READ_TIME = BUSES[READ.busIdx].times[READ.stopIdx]; // 09:23

const JNY = { busIdx: 0, fromIdx: 0, toIdx: 3 }; // Bus A, Swamp Gate -> Terminus
const JNY_FROM = BUSES[JNY.busIdx].times[JNY.fromIdx]; // 08:40
const JNY_TO = BUSES[JNY.busIdx].times[JNY.toIdx]; // 09:15
const JNY_ELBOW = '09:00';
const JNY_LEG1 = parseHM(JNY_ELBOW) - parseHM(JNY_FROM); // 20
const JNY_LEG2 = parseHM(JNY_TO) - parseHM(JNY_ELBOW); // 15
const JNY_TOTAL = parseHM(JNY_TO) - parseHM(JNY_FROM); // 35
const JNY_FRAC_ELBOW = JNY_LEG1 / JNY_TOTAL;

const NEXT = { stopIdx: 1, arrival: '09:05' }; // Puddle Lane, arrive 09:05
const NEXT_ARRIVAL_MIN = parseHM(NEXT.arrival);
const NEXT_TIMES_MIN = BUSES.map((b) => parseHM(b.times[NEXT.stopIdx]));
const NEXT_TARGET_BUS = NEXT_TIMES_MIN.reduce(
  (best, t, i) => (t >= NEXT_ARRIVAL_MIN && (best === -1 || t < NEXT_TIMES_MIN[best]) ? i : best), -1,
);

/* ---------- content ---------- */
const MISSIONS = [
  {
    id: 'a', type: 'read', chip: 'Bus B → Catapult Hill', stopIdx: READ.stopIdx, busIdx: READ.busIdx,
    q: 'When does <b>Bus B</b> reach <b>Catapult Hill</b>?',
    qsub: 'Slide your ROW finger down to Catapult Hill and your COLUMN finger across to Bus B — read where they meet, then LOCK IT IN.',
    worked: `Bogface's fingers meet at <b>${READ_TIME}</b> — Bus B reaches Catapult Hill at ${READ_TIME}!`,
  },
  {
    id: 'b', type: 'journey', chip: 'Bus A journey time',
    q: `How long does <b>Bus A</b>'s WHOLE journey take — Swamp Gate to the Terminus?`,
    qsub: 'Tap the HOUR marker first to count up to it, then tap the TERMINUS flag to finish counting on.',
    worked: `${JNY_FROM} → ${JNY_ELBOW} is <b>${JNY_LEG1}</b> minutes. ${JNY_ELBOW} → ${JNY_TO} is another <b>${JNY_LEG2}</b> minutes. ${JNY_LEG1} + ${JNY_LEG2} = <b>${JNY_TOTAL}</b> minutes!`,
  },
  {
    id: 'c', type: 'next', chip: 'Next bus from Puddle Lane', stopIdx: NEXT.stopIdx, arrival: NEXT.arrival, busIdx: NEXT_TARGET_BUS,
    q: `You arrive at <b>Puddle Lane</b> at <b>${NEXT.arrival}</b> — which bus should you catch?`,
    qsub: `Your ROW finger is pinned at Puddle Lane. Slide your COLUMN finger onto the bus that's NEXT, then LOCK IT IN.`,
    worked: `${BUSES[NEXT_TARGET_BUS].name} is next — it reaches Puddle Lane at <b>${BUSES[NEXT_TARGET_BUS].times[NEXT.stopIdx]}</b>, the soonest bus after you arrive at ${NEXT.arrival}!`,
  },
];
const WIN_PHRASES = ['SPOT ON, CONDUCTOR! 🎫', 'FINGERS NEVER LIE!', 'ALL ABOARD! 🚌', 'BOGFACE APPROVES! 🎩'];

/* ---------- grid geometry (pure) ---------- */
function gridGeom(hostWidth) {
  const padL = 30; const padT = 30;
  const avail = Math.max(260, Math.min(650, hostWidth - 20));
  const innerW = avail - padL;
  const labelW = Math.round(Math.max(70, Math.min(108, innerW * 0.27)));
  const colW = Math.floor((innerW - labelW) / 3);
  const headH = Math.round(Math.max(30, innerW * 0.075));
  const rowH = Math.round(Math.max(40, Math.min(56, innerW * 0.115)));
  return { padL, padT, labelW, colW, headH, rowH, W: padL + labelW + colW * 3, H: padT + headH + rowH * 4 };
}
const rowY = (g, i) => g.padT + g.headH + g.rowH * (i + 0.5);
const colX = (g, j) => g.padL + g.labelW + g.colW * (j + 0.5);

/* ---------- journey geometry (pure) ---------- */
function jnyGeom(hostWidth) {
  const W = Math.max(280, Math.min(620, hostWidth - 16));
  const H = 152;
  const marginX = Math.max(44, W * 0.09);
  const xStart = marginX; const xEnd = W - marginX;
  const xElbow = lerp(xStart, xEnd, JNY_FRAC_ELBOW);
  const baseY = H - 36; const peakY = 44;
  return { W, H, xStart, xEnd, xElbow, baseY, peakY };
}
function jnyX(g, frac) { return lerp(g.xStart, g.xEnd, frac); }
function jnyY(g, frac) {
  return frac <= JNY_FRAC_ELBOW
    ? lerp(g.baseY, g.peakY, frac / JNY_FRAC_ELBOW)
    : lerp(g.peakY, g.baseY, (frac - JNY_FRAC_ELBOW) / (1 - JNY_FRAC_ELBOW));
}

/* ---------- CSS (prefix bft-) ---------- */
injectCss('timetables', `
  .bft-q { text-align: center; font-weight: 700; font-size: clamp(18px, 3.1vw, 26px); margin-bottom: 2px; }
  .bft-qsub { text-align: center; font-size: 12.5px; color: #6b5744; font-weight: 500; margin-bottom: 12px; min-height: 16px; }
  .bft-scene { position: relative; margin: 0 auto; }

  /* grid scene */
  .bft-gridwrap { position: relative; margin: 0 auto; touch-action: none; -webkit-user-select: none; user-select: none; }
  .bft-cell {
    position: absolute; box-sizing: border-box; display: flex; align-items: center; justify-content: center;
    border-radius: 10px; font-weight: 700; font-size: 13.5px; background: var(--card);
    border: 2px solid rgba(51,38,29,.14); text-align: center; padding: 2px;
    transition: transform .22s var(--spring), background .22s, box-shadow .22s, opacity .22s;
  }
  .bft-cell.bft-head { background: var(--swamp-mid); color: var(--stink-lime); font-size: 13px; }
  .bft-cell.bft-label { background: var(--swamp-mid); color: var(--stink-lime); font-size: 12.5px; }
  .bft-cell.bft-time { background: #fff; color: var(--ink); font-size: clamp(12px, 2.3vw, 15px); }
  .bft-cell.bft-hot { transform: scale(1.14); background: var(--gold); color: #3a2c07; box-shadow: 0 4px 0 rgba(217,162,27,.45); z-index: 5; }
  .bft-cell.bft-grey { opacity: .38; text-decoration: line-through; }
  .bft-cell .bg-gonelbl { display: block; font-size: 8.5px; font-weight: 700; letter-spacing: .04em; margin-top: 1px; }
  .bft-rowhi, .bft-colhi { position: absolute; background: rgba(244,197,66,.16); border-radius: 10px; pointer-events: none; z-index: 1; }
  .bft-rowhi.bft-pinned, .bft-colhi.bft-pinned { background: rgba(126,196,255,.22); }
  .bft-finger {
    position: absolute; font-size: 28px; transform: translate(-50%,-50%); cursor: grab; touch-action: none;
    z-index: 9; -webkit-user-select: none; user-select: none; padding: 10px;
    filter: drop-shadow(0 3px 3px rgba(0,0,0,.3));
  }
  .bft-finger.bft-dragging { cursor: grabbing; }
  .bft-finger.bft-locked { opacity: .9; cursor: default; }
  .bft-pin {
    position: absolute; transform: translate(-50%,-100%); font-size: 9.5px; font-weight: 700;
    color: var(--gold-deep); white-space: nowrap; z-index: 9; pointer-events: none;
  }
  .bft-readout {
    background: #241d15; border-radius: 12px; padding: 8px 16px; text-align: center; margin: 10px auto 0;
    box-shadow: inset 0 3px 10px rgba(0,0,0,.6); border: 3px solid #4a3b28; max-width: 420px;
  }
  .bft-readout .bft-rl { font-size: 9px; letter-spacing: .18em; color: #8f7a5e; font-weight: 700; }
  .bft-readout .bft-rn { font-size: clamp(14px, 2.6vw, 18px); font-weight: 700; color: var(--stink-lime); line-height: 1.3; }
  .bft-readout .bft-rn b { color: var(--gold); font-size: clamp(18px, 3.2vw, 24px); }

  /* journey scene */
  .bft-jwrap { position: relative; margin: 0 auto; touch-action: none; -webkit-user-select: none; user-select: none; }
  .bft-jsvg path { fill: none; stroke: #b9ab97; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1 12; }
  .bft-jmark {
    position: absolute; transform: translate(-50%,-50%); display: flex; flex-direction: column; align-items: center; gap: 1px;
    background: none; border: none; cursor: pointer; padding: 6px; -webkit-user-select: none; user-select: none; z-index: 6;
  }
  .bft-jmark .jm-icon { font-size: 26px; filter: drop-shadow(0 2px 2px rgba(0,0,0,.25)); }
  .bft-jmark .jm-lbl {
    background: var(--card); border: 2px solid var(--swamp-mid); color: var(--ink); font-weight: 700;
    font-size: 11.5px; border-radius: 999px; padding: 2px 9px; box-shadow: 0 2px 0 rgba(0,0,0,.2);
  }
  .bft-jmark.bft-fixed { cursor: default; }
  .bft-jmark.bft-disabled { opacity: .45; pointer-events: none; }
  .bft-jtoken { position: absolute; font-size: 28px; transform: translate(-50%,-50%); pointer-events: none; z-index: 7; filter: drop-shadow(0 3px 3px rgba(0,0,0,.3)); }
  .bft-jtoken.bft-wobble { animation: bftWobble .5s ease; }
  @keyframes bftWobble {
    0%, 100% { transform: translate(-50%,-50%) rotate(0); }
    25% { transform: translate(-50%,-50%) rotate(-12deg); }
    60% { transform: translate(-50%,-50%) rotate(10deg); }
    80% { transform: translate(-50%,-50%) rotate(-5deg); }
  }
  .bft-chip {
    position: absolute; transform: translate(-50%,-100%); background: var(--gold); color: #3a2c07;
    font-weight: 700; font-size: 13px; border-radius: 999px; padding: 3px 10px; z-index: 8;
    box-shadow: 0 3px 0 rgba(217,162,27,.4); animation: bftChipIn .3s var(--spring) both;
  }
  @keyframes bftChipIn { 0% { transform: translate(-50%,-100%) scale(.4); opacity: 0; } 100% { transform: translate(-50%,-100%) scale(1); opacity: 1; } }
  .bft-jtotal {
    background: var(--swamp-mid); color: var(--parchment); border-radius: 12px; padding: 9px 15px;
    font-weight: 700; font-size: clamp(13px, 2vw, 15px); box-shadow: 0 3px 0 rgba(0,0,0,.3);
    text-align: center; margin: 10px auto 0; max-width: 420px;
  }
  .bft-jtotal b { color: var(--stink-lime); }

  /* shared win box */
  .bft-win {
    margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF);
    border: 3px solid var(--correct); border-radius: 14px; padding: 11px 16px;
    animation: animBubbleIn .34s var(--spring) both;
  }
  .bft-win .bw-title { font-weight: 700; color: #1d8f4e; font-size: 16px; }
  .bft-win .bw-worked { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 3px; }
  .bft-win .bw-btn { margin-top: 9px; padding: 10px 22px; font-size: 15px; }
`);

/* ---------- the anim card ---------- */
export default {
  id: 'timetables',
  title: "BOGFACE'S FINGER-TRACK",

  mount(host, ctx) {
    let alive = true;
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); return id; };

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'bft-q');
    const qsub = el('div', 'bft-qsub');
    const sceneHost = el('div', 'bft-scene');
    const winBox = el('div');
    const controls = el('div', 'anim-controls');
    const lockBtn = el('button', 'btn btn-gold', 'LOCK IT IN 💨');
    const resetBtn = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(lockBtn, resetBtn);
    stage.append(chiprow, q, qsub, sceneHost, winBox, controls);
    host.append(stage);

    const ruleCard = el('div', 'goldcard', RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;';
    host.append(ruleCard);

    let mi = 0;
    let mission = null;
    let scene = null; // { type, layout(), destroy(), onLock? }
    let missionDone = false;
    let attempts = 0;

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), m.chip);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
    }

    // missionObj is captured by the caller at the time the interaction happened —
    // never read the outer (mutable) `mission` variable here, so a mission-switch
    // during an in-flight tween/timer can never finish the WRONG mission.
    function finishMission(missionObj, workedHtml) {
      doneSet.add(missionObj.id);
      // total-completion must be recognised even if the view has already moved on —
      // check it BEFORE the quiet early-return below, or a mission finishing while the
      // child has switched away can permanently skip ctx.complete() for the session
      if (doneSet.size === MISSIONS.length) ctx.complete();
      if (missionObj !== mission) { paintChips(); return; } // scene moved on — record it quietly, don't disturb the view
      missionDone = true;
      sfx.win(); party(stage); paintChips();
      winBox.innerHTML = '';
      const w = el('div', 'bft-win',
        `<div class="bw-title">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]}</div>`
        + `<div class="bw-worked">${workedHtml}</div>`);
      winBox.append(w);
      const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
      const btn = el('button', 'btn btn-gold bw-btn', nextIdx !== -1 ? 'NEXT ONE ➡' : 'REVISIT A MISSION 🔁');
      btn.addEventListener('click', () => { sfx.ui(); start(nextIdx !== -1 ? nextIdx : mi); });
      w.append(btn);
    }

    /* ---------- grid scene (missions: read, next) ---------- */
    function buildGrid(m) {
      sceneHost.innerHTML = '';
      const wrap = el('div', 'bft-gridwrap');
      const rowHi = el('div', 'bft-rowhi' + (m.type === 'next' ? ' bft-pinned' : ''));
      const colHi = el('div', 'bft-colhi');
      const labelEls = STOPS.map((s) => el('div', 'bft-cell bft-label', s));
      const headEls = BUSES.map((b) => el('div', 'bft-cell bft-head', b.name));
      const cellEls = BUSES.map((b, j) => STOPS.map((_, i) => el('div', 'bft-cell bft-time', b.times[i])));
      const rowFinger = el('div', 'bft-finger' + (m.type === 'next' ? ' bft-locked' : ''), '👉');
      const colFinger = el('div', 'bft-finger', '👆');
      const readout = el('div', 'bft-readout');
      wrap.append(rowHi, colHi, ...labelEls, ...headEls, ...cellEls.flat(), rowFinger, colFinger);
      let pinLbl = null;
      if (m.type === 'next') { pinLbl = el('div', 'bft-pin', `📍 arrived ${m.arrival}`); wrap.append(pinLbl); }
      sceneHost.append(wrap, readout);

      let g = gridGeom(sceneHost.clientWidth || 640);
      let rowIdx = m.type === 'next' ? m.stopIdx : 0;
      let colIdx = 0;
      let hotCell = null;
      let rowCancel = null; let colCancel = null;
      let rowDragBase = 0; let colDragBase = 0;

      // grey out any Puddle-Lane-row cell that's already left before the child arrives
      if (m.type === 'next') {
        BUSES.forEach((b, j) => {
          if (NEXT_TIMES_MIN[j] < NEXT_ARRIVAL_MIN) {
            cellEls[j][m.stopIdx].classList.add('bft-grey');
            cellEls[j][m.stopIdx].innerHTML = `${b.times[m.stopIdx]}<span class="bg-gonelbl">GONE 💨</span>`;
          }
        });
      }

      function updateCrossing() {
        if (hotCell) hotCell.classList.remove('bft-hot');
        hotCell = cellEls[colIdx][rowIdx];
        // don't gold-highlight a cell that's already greyed-out as GONE — the two
        // treatments fight (scaled-up gold vs faded strikethrough) and falsely flag
        // an already-departed bus as "fingers meet here, this looks right"
        if (!hotCell.classList.contains('bft-grey')) hotCell.classList.add('bft-hot');
        readout.innerHTML = `<div class="bft-rl">FINGERS MEET AT</div>`
          + `<div class="bft-rn">${STOPS[rowIdx]} × ${BUSES[colIdx].name}<br><b>${BUSES[colIdx].times[rowIdx]}</b></div>`;
      }

      function placeRow(y, silent) {
        rowFinger.style.top = y + 'px';
        rowHi.style.top = (y - g.rowH / 2) + 'px';
        if (silent) return;
        const idx = Math.max(0, Math.min(3, Math.round((y - (g.padT + g.headH + g.rowH / 2)) / g.rowH)));
        if (idx !== rowIdx) { rowIdx = idx; updateCrossing(); }
      }
      function placeCol(x, silent) {
        colFinger.style.left = x + 'px';
        colHi.style.left = (x - g.colW / 2) + 'px';
        if (silent) return;
        const idx = Math.max(0, Math.min(2, Math.round((x - (g.padL + g.labelW + g.colW / 2)) / g.colW)));
        if (idx !== colIdx) { colIdx = idx; updateCrossing(); }
      }

      function layout() {
        // abandon any live drag/settle-tween BEFORE recomputing geometry (hard rule: resize must
        // never fight a finger the child is still touching, or a tween mid-flight)
        if (rowCancel) { rowCancel(); rowCancel = null; }
        if (colCancel) { colCancel(); colCancel = null; }
        if (rowDrag) rowDrag.abort();
        colDrag.abort();
        rowFinger.classList.remove('bft-dragging'); colFinger.classList.remove('bft-dragging');
        g = gridGeom(sceneHost.clientWidth || 640);
        wrap.style.width = g.W + 'px'; wrap.style.height = g.H + 'px';
        labelEls.forEach((elC, i) => { elC.style.left = g.padL + 'px'; elC.style.top = (g.padT + g.headH + g.rowH * i) + 'px'; elC.style.width = g.labelW + 'px'; elC.style.height = g.rowH + 'px'; });
        headEls.forEach((elC, j) => { elC.style.left = (g.padL + g.labelW + g.colW * j) + 'px'; elC.style.top = g.padT + 'px'; elC.style.width = g.colW + 'px'; elC.style.height = g.headH + 'px'; });
        cellEls.forEach((col, j) => col.forEach((cellC, i) => {
          cellC.style.left = (g.padL + g.labelW + g.colW * j) + 'px'; cellC.style.top = (g.padT + g.headH + g.rowH * i) + 'px';
          cellC.style.width = g.colW + 'px'; cellC.style.height = g.rowH + 'px';
        }));
        rowHi.style.left = g.padL + 'px'; rowHi.style.width = (g.labelW + g.colW * 3) + 'px'; rowHi.style.height = g.rowH + 'px';
        colHi.style.top = g.padT + 'px'; colHi.style.width = g.colW + 'px'; colHi.style.height = (g.headH + g.rowH * 4) + 'px';
        rowFinger.style.left = (g.padL * 0.5) + 'px';
        colFinger.style.top = (g.padT * 0.5) + 'px';
        placeRow(rowY(g, rowIdx), true); placeCol(colX(g, colIdx), true);
        if (pinLbl) { pinLbl.style.left = (g.padL * 0.5) + 'px'; pinLbl.style.top = (rowY(g, m.stopIdx) - g.rowH / 2 - 4) + 'px'; }
        updateCrossing();
      }

      const rowDrag = m.type === 'next' ? null : makeDrag(rowFinger, {
        enabled: () => alive && !missionDone,
        onStart() { if (rowCancel) { rowCancel(); rowCancel = null; } rowDragBase = parseFloat(rowFinger.style.top); rowFinger.classList.add('bft-dragging'); },
        onMove(dx, dy) { placeRow(Math.max(rowY(g, 0), Math.min(rowY(g, 3), rowDragBase + dy))); },
        onEnd() {
          rowFinger.classList.remove('bft-dragging');
          const targetY = rowY(g, rowIdx); const fromY = parseFloat(rowFinger.style.top);
          rowCancel = tween((y) => placeRow(y), fromY, targetY, 200, () => { rowCancel = null; sfx.settle(); });
        },
      });
      const colDrag = makeDrag(colFinger, {
        enabled: () => alive && !missionDone,
        onStart() { if (colCancel) { colCancel(); colCancel = null; } colDragBase = parseFloat(colFinger.style.left); colFinger.classList.add('bft-dragging'); },
        onMove(dx) { placeCol(Math.max(colX(g, 0), Math.min(colX(g, 2), colDragBase + dx))); },
        onEnd() {
          colFinger.classList.remove('bft-dragging');
          const targetX = colX(g, colIdx); const fromX = parseFloat(colFinger.style.left);
          colCancel = tween((x) => placeCol(x), fromX, targetX, 200, () => { colCancel = null; sfx.settle(); });
        },
      });

      layout();

      function onLock() {
        if (!alive || missionDone) return;
        sfx.ui();
        if (m.type === 'read') {
          if (rowIdx === m.stopIdx && colIdx === m.busIdx) {
            sparkleBurst(wrap, colX(g, colIdx), rowY(g, rowIdx));
            finishMission(m, m.worked);
            return;
          }
          attempts += 1; sfx.nudge();
          const wrongRow = rowIdx !== m.stopIdx; const wrongCol = colIdx !== m.busIdx;
          const targetStop = STOPS[m.stopIdx]; const targetBus = BUSES[m.busIdx].name;
          let text;
          if (wrongRow && wrongCol) text = `Your ROW finger's on <b>${STOPS[rowIdx]}</b> and your COLUMN finger's on <b>${BUSES[colIdx].name}</b> — the question needs <b>${targetStop}</b> and <b>${targetBus}</b>. Slide them both, then try again.`;
          else if (wrongRow) text = `Your COLUMN finger's in the right place, but your ROW finger's on <b>${STOPS[rowIdx]}</b> — slide it to <b>${targetStop}</b>.`;
          else text = `Your ROW finger's in the right place, but your COLUMN finger's on <b>${BUSES[colIdx].name}</b> — slide it to <b>${targetBus}</b>.`;
          if (attempts >= 2) text += `<br><br>🎩 Psst: put your ROW finger on <b>${targetStop}</b> and your COLUMN finger on <b>${targetBus}</b>, then watch where they meet.`;
          bubble(stage, { title: 'NOT QUITE MET YET! 🤏', text, img: BOG_IMG });
        } else if (m.type === 'next') {
          if (colIdx === m.busIdx) {
            sparkleBurst(wrap, colX(g, colIdx), rowY(g, rowIdx));
            finishMission(m, m.worked);
            return;
          }
          attempts += 1; sfx.nudge();
          let text;
          if (colIdx === 0) text = `${BUSES[0].name} already left Puddle Lane at <b>${BUSES[0].times[m.stopIdx]}</b> — before you even arrived! Pick a bus that hasn't gone yet.`;
          else text = `${BUSES[colIdx].name} works, but it's not the NEXT one — there's an earlier bus still coming. Find the one that arrives soonest after <b>${m.arrival}</b>.`;
          if (attempts >= 2) text += `<br><br>🎩 Psst: run down the Puddle Lane row and find the EARLIEST time that's still AFTER ${m.arrival}.`;
          bubble(stage, { title: 'NOT THIS ONE! 🚌', text, img: BOG_IMG });
        }
      }

      return {
        type: m.type,
        layout,
        onLock,
        destroy() {
          if (rowCancel) rowCancel(); if (colCancel) colCancel();
          if (rowDrag) rowDrag.destroy();
          colDrag.destroy();
        },
      };
    }

    /* ---------- journey scene (mission: journey) ---------- */
    function buildJourney() {
      const missionRef = mission; // captured once — never read the outer mutable `mission` from a deferred callback
      sceneHost.innerHTML = '';
      const wrap = el('div', 'bft-jwrap');
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg'); svg.setAttribute('class', 'bft-jsvg');
      const path = document.createElementNS(svgNS, 'path'); svg.append(path);
      const startMark = el('div', 'bft-jmark bft-fixed', `<span class="jm-icon">🚏</span><span class="jm-lbl">${JNY_FROM}</span>`);
      const elbowMark = el('button', 'bft-jmark', `<span class="jm-icon">🕐</span><span class="jm-lbl">${JNY_ELBOW}</span>`);
      const endMark = el('button', 'bft-jmark', `<span class="jm-icon">🏁</span><span class="jm-lbl">${JNY_TO}</span>`);
      const token = el('div', 'bft-jtoken', '🚌');
      const chips = el('div');
      const total = el('div', 'bft-jtotal');
      wrap.append(svg, startMark, elbowMark, endMark, chips, token);
      sceneHost.append(wrap, total);

      let g = jnyGeom(sceneHost.clientWidth || 640);
      let phase = 'start'; // 'start' -> 'atElbow' -> 'done'
      let flying = false;
      let cancelTween = null;
      let sceneAlive = true; // flips false on destroy(); guards later()-deferred UI so a
      // mission-switch can't pop a bubble/animation over a DIFFERENT mission's view
      let trapTimer = null; // the trap-path's pending later() id, tracked so destroy() can
      // actually cancel it (later()'s own `alive` guard only covers full unmount, not a
      // same-session mission switch — the scene stays mounted, stage stays connected)

      function totalText() {
        if (phase === 'start') return 'Tap the HOUR marker to start counting the journey…';
        if (phase === 'atElbow') return `<b>${JNY_LEG1}</b> minutes so far — up to the hour!`;
        return `${JNY_LEG1} + ${JNY_LEG2} = <b>${JNY_TOTAL}</b> minutes — the WHOLE journey!`;
      }
      function renderChips() {
        chips.innerHTML = '';
        if (phase === 'atElbow' || phase === 'done') {
          chips.append(el('div', 'bft-chip', `+${JNY_LEG1}`));
          const c = chips.lastChild; c.style.left = g.xElbow + 'px'; c.style.top = (g.peakY - 14) + 'px';
        }
        if (phase === 'done') {
          chips.append(el('div', 'bft-chip', `+${JNY_LEG2}`));
          const c = chips.lastChild; c.style.left = g.xEnd + 'px'; c.style.top = (g.baseY - 18) + 'px';
        }
      }
      function setToken(frac, straight) {
        token.style.left = jnyX(g, frac) + 'px';
        token.style.top = (straight ? g.baseY : jnyY(g, frac)) + 'px';
      }
      function refreshMarks() {
        elbowMark.classList.toggle('bft-disabled', flying || phase !== 'start');
        endMark.classList.toggle('bft-disabled', flying || phase === 'done');
      }

      function layout() {
        // abandon any live flight tween BEFORE recomputing geometry — never let a resize fight
        // an animation mid-flight; revert cleanly to the last settled phase instead
        if (cancelTween) { cancelTween(); cancelTween = null; }
        flying = false;
        token.classList.remove('bft-wobble');
        g = jnyGeom(sceneHost.clientWidth || 640);
        wrap.style.width = g.W + 'px'; wrap.style.height = g.H + 'px';
        svg.setAttribute('viewBox', `0 0 ${g.W} ${g.H}`); svg.setAttribute('width', g.W); svg.setAttribute('height', g.H);
        path.setAttribute('d', `M ${g.xStart} ${g.baseY} L ${g.xElbow} ${g.peakY} L ${g.xEnd} ${g.baseY}`);
        startMark.style.left = g.xStart + 'px'; startMark.style.top = g.baseY + 'px';
        elbowMark.style.left = g.xElbow + 'px'; elbowMark.style.top = g.peakY + 'px';
        endMark.style.left = g.xEnd + 'px'; endMark.style.top = g.baseY + 'px';
        const frac = phase === 'done' ? 1 : phase === 'atElbow' ? JNY_FRAC_ELBOW : 0;
        setToken(frac);
        renderChips();
        refreshMarks();
        total.innerHTML = totalText();
      }

      elbowMark.addEventListener('click', () => {
        if (!alive || flying || phase !== 'start') return;
        flying = true; refreshMarks(); sfx.tick();
        cancelTween = tween((f) => setToken(f), 0, JNY_FRAC_ELBOW, 550, () => {
          if (!alive) return;
          cancelTween = null; flying = false; phase = 'atElbow';
          renderChips(); refreshMarks(); total.innerHTML = totalText();
          sfx.pop();
        });
      });

      endMark.addEventListener('click', () => {
        if (!alive || flying || phase === 'done') return;
        if (phase === 'atElbow') {
          flying = true; refreshMarks(); sfx.tick();
          cancelTween = tween((f) => setToken(f), JNY_FRAC_ELBOW, 1, 480, () => {
            if (!alive) return;
            cancelTween = null; flying = false; phase = 'done';
            renderChips(); refreshMarks(); total.innerHTML = totalText();
            sfx.pop(); sparkleBurst(wrap, g.xEnd, g.baseY);
            later(() => { if (alive) finishMission(missionRef, missionRef.worked); }, 500);
          });
          return;
        }
        // phase === 'start': skip straight to the end — allowed, but it wobbles and resets
        flying = true; refreshMarks(); sfx.nudge();
        cancelTween = tween((f) => setToken(f, true), 0, 1, 380, () => {
          if (!alive || !sceneAlive) return;
          cancelTween = null;
          token.classList.add('bft-wobble');
          trapTimer = later(() => {
            trapTimer = null;
            if (!alive || !sceneAlive) return;
            token.classList.remove('bft-wobble');
            bubble(stage, {
              title: 'ONE BIG GUESS! 🚌',
              text: 'That skips straight past the hour! Clock times don\'t subtract cleanly — always count UP to the hour FIRST, then keep going. Tap the HOUR marker, then the Terminus flag.',
              img: BOG_IMG,
            }).then(() => {
              if (!alive || !sceneAlive) return;
              cancelTween = tween((f) => setToken(f, true), 1, 0, 380, () => {
                cancelTween = null; flying = false; refreshMarks();
              });
            });
          }, 420);
        });
      });

      layout();

      return {
        type: 'journey',
        layout,
        destroy() {
          sceneAlive = false;
          if (cancelTween) cancelTween();
          if (trapTimer !== null) { clearTimeout(trapTimer); timers.delete(trapTimer); trapTimer = null; }
        },
      };
    }

    function start(i) {
      if (scene) scene.destroy();
      mi = i; mission = MISSIONS[i]; missionDone = false; attempts = 0;
      winBox.innerHTML = '';
      paintChips();
      q.innerHTML = mission.q;
      qsub.textContent = mission.qsub;
      lockBtn.style.display = mission.type === 'journey' ? 'none' : '';
      scene = mission.type === 'journey' ? buildJourney() : buildGrid(mission);
    }

    lockBtn.addEventListener('click', () => { if (scene && scene.onLock) scene.onLock(); });
    resetBtn.addEventListener('click', () => { sfx.ui(); start(mi); });

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
