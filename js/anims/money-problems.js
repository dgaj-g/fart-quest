// FART QUEST — js/anims/money-problems.js
// SKINTY'S TILL — interactive column-crunch machine for the money-problems
// Scout Report. Three guided missions: (1) drag a misaligned price-stack
// until its decimal point CLUNKS into line with the first, then crunch the
// columns right-to-left (light carry). (2) Dress a calculator's dropped
// pence-zero back onto the till screen. (3) Stamp a unit price down a
// column three times, then read the total off in pounds.

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const SKINTY_IMG = 'assets/monsters/skinty-mcgrabhands.png';
const RULE = 'Money is just decimals wearing a £. Line up the point and crunch.';
const WIN_PHRASES = ['KA-CHING! 💰', 'TILL BALANCED! 🧾', 'SKINTY CAN\'T ARGUE WITH THAT!', 'CRUNCHED IT! 💨'];

/* ---------- pure engine (every guided mission re-verified in a scratch
   node script — 45p×3, calculator digits and the 235+145 crunch all check
   out; do not "improve" without re-running it) ---------- */
function digitsOf(str) { return String(str).split('').map(Number); }
function makeCrunchState(aStr, bStr) {
  const A = digitsOf(aStr); const B = digitsOf(bStr);
  const cols = A.map((d, i) => ({ a: d, b: B[i], carryIn: 0, written: false, writeDigit: null }));
  return { cols, activeIdx: cols.length - 1, done: false };
}
function tapCrunch(state, idx) {
  if (state.done || idx !== state.activeIdx) return null;
  const col = state.cols[idx];
  if (col.written) return null;
  const sum = col.a + col.b + col.carryIn;
  col.writeDigit = sum % 10;
  col.written = true;
  const carry = sum >= 10 ? 1 : 0;
  if (carry && idx > 0) state.cols[idx - 1].carryIn = 1;
  state.activeIdx = idx - 1;
  state.done = state.activeIdx < 0;
  return { carry, sum };
}
function penceStrToPounds(digitStr) {
  const n = Number(digitStr);
  const pounds = Math.floor(n / 100);
  const pence = String(n % 100).padStart(2, '0');
  return `£${pounds}.${pence}`;
}
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const snapOffset = (raw, lo, hi) => clamp(Math.round(raw), lo, hi);
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- content ---------- */
const MISSIONS = [
  {
    id: 'align', kind: 'align', chip: '£2.35 + £1.45', aStr: '235', bStr: '145', aLabel: '£2.35', bLabel: '£1.45',
    hint: '5 + 5 = 10 pence — that\'s a whole 10p, so carry a ① into the tenths column before you add 3 + 4.',
    worked: '£2.35 + £1.45: hundredths 5+5=10 → write 0, carry 1. Tenths 3+4=7, plus the carried 1 = 8. Pounds 2+1=3. Total = £3.80.',
  },
  {
    id: 'calc', kind: 'calc', chip: 'DRESS THE TILL', screen: ['3', '.', '4'], candidates: ['0', '4', '5'], correct: '0', target: '£3.40',
    hint: 'A calculator only ever drops a ZERO off the very end — nothing else.',
    worked: 'A calculator drops the last pence digit off the end — it isn\'t lying, 3.4 and 3.40 are the same SIZE — but money always keeps two digits after the point. Always write £3.40.',
  },
  {
    id: 'sticker', kind: 'sticker', chip: '3 × 45p', unit: 45, count: 3,
    hint: 'Crunch it in pence to keep it tidy: 45p × 3.',
    worked: '45p stamped 3 times: 45 + 45 + 45 = 135p = £1.35.',
  },
];

const CSS = `
.skt-q { text-align:center; font-weight:700; font-size:clamp(19px,3.2vw,28px); margin-bottom:2px; }
.skt-qsub { text-align:center; font-size:13px; color:#6b5744; font-weight:600; margin-bottom:12px; min-height:18px; }
.skt-boardhost { display:flex; justify-content:center; padding:6px 0 10px; }

/* --- align/crunch --- */
.skt-lane { position:relative; margin:0 auto; touch-action:none; }
.skt-tile {
  position:absolute; display:flex; align-items:center; justify-content:center;
  background:#fff; border:3px solid var(--ink); border-radius:11px; color:var(--ink);
  font-weight:700; box-shadow:0 3px 0 rgba(51,38,29,.3);
}
.skt-tile.ans { background:#E9FBEF; border-color:var(--correct); color:#1d8f4e; }
.skt-tile.ans.empty { background:transparent; border-style:dashed; border-color:rgba(51,38,29,.3); box-shadow:none; }
.skt-point { position:absolute; display:flex; align-items:center; justify-content:center; font-weight:900; color:var(--ink); font-size:1.4em; }
.skt-carrymk {
  position:absolute; font-size:13px; font-weight:700; color:var(--wrong); text-align:center;
  animation:sktPop .3s var(--spring) both;
}
@keyframes sktPop { from { transform:scale(.4); opacity:0; } to { transform:scale(1); opacity:1; } }
.skt-rowlabel { position:absolute; font-size:10px; font-weight:700; color:#a08c74; white-space:nowrap; }
.skt-rail { position:relative; touch-action:none; }
.skt-rail.leaning .skt-tile, .skt-rail.leaning .skt-point { cursor:grab; }
.skt-rail.dragging .skt-tile, .skt-rail.dragging .skt-point { cursor:grabbing; }
.skt-railhit { position:absolute; z-index:6; cursor:grab; }
.skt-rail.dragging .skt-railhit { cursor:grabbing; }
.skt-rail.locked .skt-railhit { display:none; }
.skt-rule { position:absolute; height:3px; background:var(--ink); opacity:.5; }
.skt-colglow {
  position:absolute; border-radius:14px; background:rgba(155,89,208,.12); border:3px solid var(--stink);
  pointer-events:none; animation:sktPulse 1.4s ease-in-out infinite;
}
@keyframes sktPulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.045); } }
.skt-colhit { position:absolute; z-index:7; border:none; background:transparent; cursor:pointer; padding:0; }
.skt-carrychip {
  position:absolute; z-index:9; width:30px; height:30px; border-radius:50%;
  background:radial-gradient(circle at 35% 30%,#fff2b8,#F4C542 60%,#B8860B);
  border:3px solid var(--ink); display:flex; align-items:center; justify-content:center;
  font-size:13px; font-weight:700; box-shadow:0 3px 6px rgba(0,0,0,.35); pointer-events:none;
}
.skt-win { margin-top:12px; text-align:center; background:linear-gradient(180deg,#E9FBEF,#D3F3DF); border:3px solid var(--correct); border-radius:14px; padding:10px 14px; animation:sktWinIn .34s var(--spring) both; }
@keyframes sktWinIn { from { transform:scale(.85) translateY(14px); opacity:0; } to { transform:scale(1) translateY(0); opacity:1; } }
.skt-win .wp { font-weight:700; color:#1d8f4e; font-size:16px; }
.skt-win .wk { font-size:13px; color:#4d6b58; font-weight:500; margin-top:3px; }

/* --- calculator trap --- */
.skt-calc { background:#3a2f22; border-radius:20px; padding:16px 14px; max-width:360px; margin:0 auto; box-shadow:0 6px 0 rgba(0,0,0,.3); }
.skt-calc-screen {
  background:#1b2b1f; border-radius:9px; box-shadow:inset 0 0 0 3px #0d1710;
  padding:16px 10px; display:flex; justify-content:center; align-items:center; gap:3px;
  font-family:'Courier New',monospace; font-size:clamp(26px,6vw,36px); color:#7CFC98; letter-spacing:1px;
}
.skt-calc-screen .cur { color:var(--gold); }
.skt-gap {
  width:0.85em; height:1em; border:3px dashed #7CFC98; border-radius:6px; opacity:.75;
  display:inline-flex; align-items:center; justify-content:center;
}
.skt-gap.filled { border-style:solid; border-color:#7CFC98; background:rgba(124,252,152,.16); opacity:1; animation:sktPop .3s var(--spring) both; }
.skt-tray { display:flex; justify-content:center; gap:14px; margin-top:18px; flex-wrap:wrap; }
.skt-caltile {
  width:56px; height:56px; border-radius:13px; background:#fff; border:3px solid var(--ink);
  color:var(--ink); font-weight:700; font-size:24px; display:flex; align-items:center; justify-content:center;
  box-shadow:0 4px 0 rgba(0,0,0,.3); cursor:grab; touch-action:none; position:relative; z-index:5;
}
.skt-caltile.dragging { cursor:grabbing; z-index:20; box-shadow:0 8px 14px rgba(0,0,0,.4); }
.skt-caltile.gone { display:none; }

/* --- sticker stamper --- */
.skt-stickerwrap { display:flex; flex-direction:column; align-items:center; gap:16px; }
.skt-master {
  width:82px; height:82px; border-radius:16px; background:linear-gradient(180deg,#FFE9A8,#F4C542);
  border:3px solid var(--gold-deep); display:flex; flex-direction:column; align-items:center; justify-content:center;
  font-weight:700; color:#5a4408; cursor:grab; touch-action:none; box-shadow:0 4px 0 rgba(0,0,0,.3);
  position:relative; z-index:5;
}
.skt-master.dragging { cursor:grabbing; z-index:20; box-shadow:0 8px 14px rgba(0,0,0,.4); }
.skt-master .em { font-size:24px; line-height:1; }
.skt-master .pr { font-size:15px; margin-top:2px; }
.skt-master.spent { opacity:.35; pointer-events:none; }
.skt-dropzone {
  width:100%; max-width:210px; min-height:170px; border:3px dashed rgba(51,38,29,.35); border-radius:18px;
  display:flex; flex-direction:column-reverse; align-items:center; gap:6px; padding:10px; justify-content:flex-start;
}
.skt-dropzone.hot { border-color:var(--gold-deep); background:rgba(244,197,66,.14); }
.skt-stampedtile {
  width:70px; height:36px; border-radius:10px; background:linear-gradient(180deg,#FFE9A8,#F4C542);
  border:3px solid var(--gold-deep); color:#5a4408; font-weight:700; font-size:14px;
  display:flex; align-items:center; justify-content:center; box-shadow:0 3px 0 rgba(0,0,0,.25);
  animation:sktStampIn .4s var(--spring) both;
}
@keyframes sktStampIn { from { transform:translateY(-16px) scale(.7); opacity:0; } to { transform:translateY(0) scale(1); opacity:1; } }
.skt-total {
  background:var(--swamp-mid); color:var(--parchment); border-radius:12px; padding:9px 17px;
  font-weight:700; font-size:clamp(14px,2vw,16px); box-shadow:0 3px 0 rgba(0,0,0,.3); text-align:center; min-width:170px;
}
.skt-total b { color:var(--stink-lime); }
`;

export default {
  id: 'money-problems',
  title: "SKINTY'S TILL",

  mount(host, ctx) {
    injectCss('money-problems', CSS);
    let alive = true;
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'skt-q');
    const qsub = el('div', 'skt-qsub');
    const boardHost = el('div', 'skt-boardhost');
    const winBox = el('div');
    const controls = el('div', 'anim-controls');
    const resetBtn = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(resetBtn);
    stage.append(chiprow, q, qsub, boardHost, winBox, controls);
    host.append(stage);

    const ruleCard = el('div', 'goldcard', RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;';
    host.append(ruleCard);

    let mi = 0;
    const doneSet = new Set();
    let mission = null;
    let genToken = 0;
    let relayout = () => {}; // current mission's resize hook
    let abortLive = () => {}; // current mission's "cancel any live drag/tween" hook

    /* ============================================================ */
    /* mission chips                                                */
    /* ============================================================ */
    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), m.chip);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
    }

    function showWin(eqHtml, workedText) {
      doneSet.add(mission.id);
      sfx.win();
      party(stage);
      paintChips();
      qsub.textContent = '';
      winBox.innerHTML = '';
      const w = el('div', 'skt-win',
        `<div class="wp">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]} &nbsp; ${eqHtml}</div>`
        + `<div class="wk">${workedText}</div>`);
      winBox.append(w);
      if (doneSet.size === MISSIONS.length) ctx.complete();
      const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
      if (nextIdx !== -1) {
        const nb = el('button', 'btn btn-gold', 'NEXT ONE ➡');
        nb.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
        nb.addEventListener('click', () => { sfx.ui(); start(nextIdx); });
        w.append(nb);
      }
    }

    /* ============================================================ */
    /* MISSION 1 — align & crunch                                   */
    /* ============================================================ */
    function buildAlign(m) {
      const state = makeCrunchState(m.aStr, m.bStr);
      let offsetCols = 1; // starts one column misaligned, per brief
      let locked = false;
      let cancelTween = null;
      let shownCarry = false;
      let colW = 90; let tileH = 90; let laneH = 0;
      let yCarry = 0; let yA = 0; let yB = 0; let yRule = 0; let yAns = 0;

      q.innerHTML = `${m.aLabel} <span style="color:var(--stink)">+</span> ${m.bLabel} = ?`;
      qsub.textContent = 'Drag the second price until the points line up.';

      const lane = el('div', 'skt-lane');
      boardHost.innerHTML = '';
      boardHost.append(lane);

      const carryEls = []; const aTiles = []; const ansTiles = [];
      let pointA; let ansPoint; let ruleEl; let glowEl; const colHits = [];
      const rail = el('div', 'skt-rail leaning');
      const railHit = el('div', 'skt-railhit');
      let bTiles = []; let pointB;

      function colX(i) { return i * colW; }

      function build() {
        lane.innerHTML = '';
        carryEls.length = 0; aTiles.length = 0; ansTiles.length = 0; colHits.length = 0; bTiles = [];
        state.cols.forEach((c, i) => {
          const cm = el('div', 'skt-carrymk');
          lane.append(cm); carryEls.push(cm);
          const at = el('div', 'skt-tile', String(c.a));
          lane.append(at); aTiles.push(at);
          const an = el('div', 'skt-tile ans empty');
          lane.append(an); ansTiles.push(an);
        });
        pointA = el('div', 'skt-point', '•'); lane.append(pointA);
        ansPoint = el('div', 'skt-point', '•'); lane.append(ansPoint);
        ruleEl = el('div', 'skt-rule'); lane.append(ruleEl);
        glowEl = el('div', 'skt-colglow'); lane.append(glowEl);
        state.cols.forEach((c, i) => {
          const hb = el('button', 'skt-colhit');
          hb.addEventListener('click', () => onColTap(i));
          lane.append(hb); colHits.push(hb);
        });
        rail.innerHTML = '';
        state.cols.forEach((c) => { const t = el('div', 'skt-tile', String(c.b)); rail.append(t); bTiles.push(t); });
        pointB = el('div', 'skt-point', '•'); rail.append(pointB);
        rail.append(railHit);
        lane.append(rail);
      }
      build();

      function applyRailTransform(v) {
        const px = v * colW;
        const deg = clamp(v * 8, -16, 16);
        rail.style.transform = `translateX(${px}px) rotate(${deg}deg)`;
      }

      function layout() {
        const avail = Math.min(360, (host.clientWidth || 640) - 40);
        colW = Math.max(70, Math.min(108, Math.floor(avail / 3)));
        tileH = Math.round(colW * 0.92);
        yCarry = 4; yA = 20; yB = yA + tileH + 10; yRule = yB + tileH + 8; yAns = yRule + 12;
        laneH = yAns + tileH + 6;
        lane.style.width = (colW * 3) + 'px';
        lane.style.height = laneH + 'px';
        const pw = Math.round(colW * 0.34);
        state.cols.forEach((c, i) => {
          Object.assign(carryEls[i].style, { left: (colX(i)) + 'px', top: yCarry + 'px', width: colW + 'px', textAlign: 'center' });
          Object.assign(aTiles[i].style, { left: (colX(i) + 4) + 'px', top: yA + 'px', width: (colW - 8) + 'px', height: tileH + 'px', fontSize: Math.round(colW * 0.5) + 'px' });
          Object.assign(ansTiles[i].style, { left: (colX(i) + 4) + 'px', top: yAns + 'px', width: (colW - 8) + 'px', height: tileH + 'px', fontSize: Math.round(colW * 0.5) + 'px' });
          Object.assign(colHits[i].style, { left: colX(i) + 'px', top: '0px', width: colW + 'px', height: laneH + 'px' });
          bTiles[i].style.cssText += `position:absolute;left:${colX(i) + 4}px;top:0px;width:${colW - 8}px;height:${tileH}px;font-size:${Math.round(colW * 0.5)}px;`;
        });
        Object.assign(pointA.style, { left: (colX(1) - pw / 2) + 'px', top: yA + 'px', width: pw + 'px', height: tileH + 'px', fontSize: Math.round(colW * 0.5) + 'px' });
        pointB.style.cssText += `position:absolute;left:${colX(1) - pw / 2}px;top:0px;width:${pw}px;height:${tileH}px;font-size:${Math.round(colW * 0.5)}px;`;
        Object.assign(ansPoint.style, { left: (colX(1) - pw / 2) + 'px', top: yAns + 'px', width: pw + 'px', height: tileH + 'px', fontSize: Math.round(colW * 0.5) + 'px' });
        Object.assign(ruleEl.style, { left: '2px', top: yRule + 'px', width: (colW * 3 - 4) + 'px' });
        Object.assign(rail.style, { position: 'absolute', left: '0px', top: yB + 'px', width: (colW * 3) + 'px', height: tileH + 'px' });
        Object.assign(railHit.style, { left: '-10px', top: '-10px', width: (colW * 3 + 20) + 'px', height: (tileH + 20) + 'px' });
        applyRailTransform(offsetCols);
        paint();
      }

      function paint() {
        state.cols.forEach((c, i) => {
          carryEls[i].textContent = (c.carryIn && !c.written) ? '①' : '';
          ansTiles[i].textContent = c.written ? String(c.writeDigit) : '';
          ansTiles[i].classList.toggle('empty', !c.written);
          colHits[i].style.pointerEvents = (locked && !state.done && i === state.activeIdx) ? 'auto' : 'none';
        });
        if (locked && !state.done) {
          Object.assign(glowEl.style, { display: 'block', left: (colX(state.activeIdx) - 2) + 'px', top: '0px', width: (colW + 4) + 'px', height: laneH + 'px' });
        } else {
          glowEl.style.display = 'none';
        }
      }

      const drag = makeDrag(railHit, {
        enabled: () => !locked,
        onStart() {
          if (cancelTween) { cancelTween(); cancelTween = null; }
          rail.classList.add('dragging');
          drag._basePx = offsetCols * colW;
        },
        onMove(dx) {
          const rawPx = drag._basePx + dx;
          let rawCols = rawPx / colW;
          rawCols = clamp(rawCols, -2.5, 2.5);
          offsetCols = rawCols;
          applyRailTransform(rawCols);
        },
        onEnd() {
          rail.classList.remove('dragging');
          const target = snapOffset(offsetCols, -2, 2);
          const from = offsetCols;
          cancelTween = tween((v) => { offsetCols = v; applyRailTransform(v); }, from, target, 240, () => {
            cancelTween = null;
            offsetCols = target;
            if (target === 0) lockAligned(); else { sfx.nudge(); toast(stage, "Not lined up yet — the decimal points don't match!"); }
          });
        },
      });

      function lockAligned() {
        locked = true;
        rail.classList.add('locked');
        rail.classList.remove('leaning');
        sfx.drop();
        sparkleBurst(lane, colX(1), yB);
        paint();
        later(() => bubble(stage, {
          title: 'CLUNK! POINTS LINED UP! 🪙',
          text: `Now ${m.aLabel} and ${m.bLabel} are stacked properly. Tap the <b>1p column</b> first and crunch right to left, just like any decimal.`,
          img: SKINTY_IMG,
        }), 200);
      }

      let carryFlight = null;
      function onColTap(i) {
        if (!locked || state.done || i !== state.activeIdx) return;
        const r = tapCrunch(state, i);
        if (!r) return;
        sfx.pop();
        paint();
        if (r.carry) {
          const chip = el('div', 'skt-carrychip', '①');
          const fromX = colX(i) + colW / 2 - 15; const toX = colX(i - 1) + colW / 2 - 15;
          Object.assign(chip.style, { left: fromX + 'px', top: yCarry + 'px' });
          lane.append(chip);
          if (carryFlight) carryFlight();
          carryFlight = tween((x) => { chip.style.left = x + 'px'; }, fromX, toX, 320, () => {
            carryFlight = null;
            chip.remove();
            sfx.tick(1);
            paint();
          });
          if (!shownCarry) {
            shownCarry = true;
            later(() => bubble(stage, { title: 'CARRY THE PENNY! ①', text: m.hint, img: SKINTY_IMG }), 420);
          }
        }
        if (state.done) {
          const finalDigits = state.cols.map((c) => c.writeDigit).join('');
          const totalText = penceStrToPounds(finalDigits);
          later(() => showWin(`${m.aLabel} + ${m.bLabel} = <b>${totalText}</b>`, m.worked), r.carry ? 500 : 150);
        }
      }

      layout();

      relayout = () => {
        if (cancelTween) { cancelTween(); cancelTween = null; }
        if (carryFlight) { carryFlight(); carryFlight = null; }
        drag.abort();
        rail.classList.remove('dragging');
        layout();
      };
      abortLive = () => { if (cancelTween) { cancelTween(); cancelTween = null; } drag.abort(); if (carryFlight) { carryFlight(); carryFlight = null; } };

      return () => { drag.destroy(); if (cancelTween) cancelTween(); if (carryFlight) carryFlight(); };
    }

    /* ============================================================ */
    /* MISSION 2 — the calculator trap                              */
    /* ============================================================ */
    function buildCalc(m) {
      q.innerHTML = 'Dress the till screen — write the true price.';
      qsub.textContent = 'Skinty\'s calculator ate a zero. Drag the right digit into the gap.';

      boardHost.innerHTML = '';
      const wrap = el('div');
      const calc = el('div', 'skt-calc');
      const screen = el('div', 'skt-calc-screen');
      screen.append(el('span', null, '£'), el('span', 'cur', m.screen[0]), el('span', 'cur', m.screen[1]), el('span', 'cur', m.screen[2]));
      const gap = el('div', 'skt-gap');
      screen.append(gap);
      calc.append(screen);
      const tray = el('div', 'skt-tray');
      wrap.append(calc, tray);
      boardHost.append(wrap);

      let solved = false;
      let liveTweens = new Set();
      const order = shuffle(m.candidates);
      const tiles = order.map((digit) => {
        const t = el('button', 'skt-caltile', digit);
        tray.append(t);
        const drag = makeDrag(t, {
          enabled: () => !solved,
          onStart() { t.classList.add('dragging'); },
          onMove(dx, dy) { t.style.transform = `translate(${dx}px, ${dy}px)`; },
          onEnd(dx, dy, e) {
            t.classList.remove('dragging');
            const gr = gap.getBoundingClientRect();
            const hit = e.clientX >= gr.left - 16 && e.clientX <= gr.right + 16 && e.clientY >= gr.top - 16 && e.clientY <= gr.bottom + 16;
            if (hit && digit === m.correct) { commit(t); return; }
            if (hit && digit !== m.correct) {
              sfx.nudge();
              toast(stage, 'A calculator only ever drops a ZERO off the end — that\'s not it!');
            }
            const cancel = tween((v) => { t.style.transform = `translate(${v}px, 0px)`; }, dx, 0, 220, () => { liveTweens.delete(cancel); });
            liveTweens.add(cancel);
          },
        });
        return { t, drag, digit };
      });

      function commit(tileEl) {
        solved = true;
        tiles.forEach(({ t, drag }) => { if (t !== tileEl) t.classList.add('gone'); drag.destroy(); });
        tileEl.classList.add('gone');
        gap.textContent = '0';
        gap.classList.add('filled');
        sfx.drop();
        sparkleBurst(calc, calc.clientWidth / 2, calc.clientHeight * 0.4);
        later(() => showWin(`3.4 &rarr; <b>${m.target}</b>`, m.worked), 500);
      }

      relayout = () => {}; // flex layout, no pixel geometry to recompute
      abortLive = () => {
        liveTweens.forEach((c) => c());
        liveTweens.clear();
        tiles.forEach(({ t }) => { t.style.transform = 'translate(0px,0px)'; t.classList.remove('dragging'); });
      };

      return () => { tiles.forEach(({ drag }) => drag.destroy()); liveTweens.forEach((c) => c()); };
    }

    /* ============================================================ */
    /* MISSION 3 — the sticker stamper                              */
    /* ============================================================ */
    function buildSticker(m) {
      q.innerHTML = `${m.count} stickers at <span style="color:var(--stink)">${m.unit}p</span> each`;
      qsub.textContent = 'Find ONE first — then stamp it down the column.';

      boardHost.innerHTML = '';
      const wrap = el('div', 'skt-stickerwrap');
      const master = el('div', 'skt-master', `<span class="em">🏷️</span><span class="pr">${m.unit}p</span>`);
      const zone = el('div', 'skt-dropzone');
      const totalChip = el('div', 'skt-total', `<b>0</b>p stamped so far`);
      wrap.append(master, zone, totalChip);
      boardHost.append(wrap);

      let stamps = 0;
      let liveTweens = new Set();
      let masterDrag = null;

      function updateTotal() {
        const pence = stamps * m.unit;
        totalChip.innerHTML = `<b>${pence}</b>p stamped so far`;
      }

      function tweenMasterBack() {
        const r = master.getBoundingClientRect();
        const cancel = tween((v) => { master.style.transform = `translate(${v}px,0px)`; }, master._dx || 0, 0, 220, () => {
          liveTweens.delete(cancel);
          master.style.transform = '';
        });
        liveTweens.add(cancel);
      }

      function attachDrag() {
        masterDrag = makeDrag(master, {
          enabled: () => stamps < m.count,
          onStart() { master.classList.add('dragging'); master._dx = 0; },
          onMove(dx, dy) { master._dx = dx; master.style.transform = `translate(${dx}px, ${dy}px)`; zone.classList.toggle('hot', overZone(dx, dy)); },
          onEnd(dx, dy, e) {
            master.classList.remove('dragging');
            zone.classList.remove('hot');
            const zr = zone.getBoundingClientRect();
            const hit = e.clientX >= zr.left && e.clientX <= zr.right && e.clientY >= zr.top && e.clientY <= zr.bottom;
            if (hit) { commitStamp(); } else { tweenMasterBack(); }
          },
        });
      }
      function overZone(dx, dy) {
        const mr = master.getBoundingClientRect(); const zr = zone.getBoundingClientRect();
        const cx = mr.left + mr.width / 2; const cy = mr.top + mr.height / 2;
        return cx >= zr.left && cx <= zr.right && cy >= zr.top && cy <= zr.bottom;
      }
      attachDrag();

      function commitStamp() {
        stamps += 1;
        const tile = el('div', 'skt-stampedtile', `${m.unit}p`);
        zone.append(tile);
        sfx.tick(stamps);
        updateTotal();
        master.style.transform = '';
        if (stamps === 1) toast(stage, m.hint);
        if (stamps < m.count) {
          if (masterDrag) masterDrag.destroy();
          attachDrag();
        } else {
          if (masterDrag) { masterDrag.destroy(); masterDrag = null; }
          master.classList.add('spent');
          later(() => convertTotal(), 450);
        }
      }

      function convertTotal() {
        const totalPence = stamps * m.unit;
        const totalText = penceStrToPounds(String(totalPence));
        sfx.sparkle();
        totalChip.innerHTML = `<b>${totalPence}</b>p = <b>${totalText}</b>`;
        sparkleBurst(wrap, wrap.clientWidth / 2, 40);
        later(() => showWin(`${m.count} &times; ${m.unit}p = <b>${totalText}</b>`, m.worked), 550);
      }

      relayout = () => {}; // flex layout, no pixel geometry to recompute
      abortLive = () => {
        liveTweens.forEach((c) => c());
        liveTweens.clear();
        if (masterDrag) masterDrag.abort();
        master.style.transform = '';
        master.classList.remove('dragging');
        zone.classList.remove('hot');
      };

      return () => { if (masterDrag) masterDrag.destroy(); liveTweens.forEach((c) => c()); };
    }

    /* ============================================================ */
    /* mission switcher                                             */
    /* ============================================================ */
    let missionCleanup = () => {};
    function start(i) {
      genToken += 1;
      missionCleanup();
      mi = i;
      mission = MISSIONS[i];
      winBox.innerHTML = '';
      relayout = () => {};
      abortLive = () => {};
      paintChips();
      if (mission.kind === 'align') missionCleanup = buildAlign(mission);
      else if (mission.kind === 'calc') missionCleanup = buildCalc(mission);
      else missionCleanup = buildSticker(mission);
    }

    resetBtn.addEventListener('click', () => { sfx.ui(); start(mi); });

    const onResize = () => { abortLive(); relayout(); };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    start(0);

    return function cleanup() {
      alive = false;
      genToken += 1;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      missionCleanup();
      stage.remove();
      ruleCard.remove();
    };
  },
};
