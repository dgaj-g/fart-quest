// FART QUEST — js/anims/tables-tally.js
// WALLY'S GATE BUILDER — interactive tally/table machine for the tables-tally
// Scout Report. Four guided missions: build a tally by tapping, read one back,
// spot the six-stick fake, and cross-check a row/column table like Bogface's
// Finger-Track.

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const WALLY_IMG = 'assets/monsters/tally-wally.png';
const RULE = 'Tally gates come in fives: four sticks and a gate. Count gates, then strays.';

/* ---------- pure logic (checked against every mission's expected state in a
   scratch node script before shipping) ---------- */
function breakdown(n) {
  return { gates: Math.floor(n / 5), strays: n % 5 };
}
function chipText(n) {
  if (n === 0) return 'the yard is empty — <b>tap to bring the first one in!</b>';
  const { gates, strays } = breakdown(n);
  return `<b>${gates}</b> gate${gates === 1 ? '' : 's'} × 5 + <b>${strays}</b> stray${strays === 1 ? '' : 's'} = <b>${n}</b>`;
}
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
  { id: 'm1', chip: '13 in!', type: 'build', target: 13 },
  { id: 'm2', chip: 'read it back', type: 'readback', gates: 3, strays: 4 },
  { id: 'm3', chip: 'spot the fake', type: 'trap' },
  { id: 'm4', chip: 'Y6 + Walk', type: 'table' },
];
const M2_TOTAL = 3 * 5 + 4; // 19 — brief's read-back mission
const M2_OPTIONS = [M2_TOTAL, 18, 14, 22];
const M2_FEEDBACK = {
  18: 'So close! Count the STRAYS again — how many lonely sticks stand AFTER the closed gates?',
  14: 'Check the GATES again — count every closed gate before you add the strays.',
  22: 'A gate is never worth six — four sticks and one slash makes exactly five, not six.',
};
const M3_CLUSTERS = [
  { stroke: 4, trap: false },
  { stroke: 5, trap: true },
  { stroke: 4, trap: false },
];
const TABLE_ROWS = ['Y5', 'Y6'];
const TABLE_COLS = ['Walk', 'Bus'];
const TABLE_VALUES = [[12, 8], [15, 5]];
const M4_TARGET = { row: 1, col: 0 }; // Y6 + Walk = 15
const T_LABEL = 74; const T_HEAD = 40; const T_COL = 108; const T_ROW = 62;
const T_W = T_LABEL + T_COL * 2; const T_H = T_HEAD + T_ROW * 2;

const CSS = `
.wgb-q { text-align:center; font-weight:700; font-size:clamp(18px,3vw,26px); margin-bottom:2px; }
.wgb-qsub { text-align:center; font-size:12.5px; color:#6b5744; font-weight:500; margin-bottom:12px; }
.wgb-boardhost { display:flex; justify-content:center; flex-wrap:wrap; }
.wgb-dash { display:flex; justify-content:center; margin-top:10px; }
.wgb-chip {
  background: var(--swamp-mid); color: var(--parchment); border-radius:12px; padding:9px 16px;
  font-weight:700; font-size:clamp(13px,2vw,15px); box-shadow:0 3px 0 rgba(0,0,0,.3); text-align:center;
}
.wgb-chip b { color: var(--stink-lime); }
.wgb-yard, .wgb-trapyard {
  display:flex; flex-wrap:wrap; align-items:flex-end; justify-content:center; gap:6px 16px;
  background: linear-gradient(180deg,#efe1c4,#e8d7b4); border-radius:16px;
  box-shadow: inset 0 3px 8px rgba(51,38,29,.18); padding:20px 18px; min-height:80px; min-width:260px;
}
.wgb-cluster { position:relative; display:inline-flex; align-items:flex-end; height:40px; }
.wgb-stick { width:6px; height:34px; background:var(--ink); margin-right:5px; border-radius:2px; }
.wgb-stick:last-child { margin-right:0; }
.wgb-slash {
  position:absolute; left:-4px; top:13px; height:5px; background:var(--gold-deep);
  border-radius:3px; transform-origin:left center; transform:rotate(-34deg);
}
.wgb-cluster.justclosed { animation: wgbGateGlow .7s ease both; }
@keyframes wgbGateGlow {
  0% { filter:drop-shadow(0 0 0 rgba(244,197,66,0)); }
  35% { filter:drop-shadow(0 0 10px rgba(244,197,66,.9)); }
  100% { filter:drop-shadow(0 0 0 rgba(244,197,66,0)); }
}
.wgb-cluster.pop .wgb-stick:last-child { animation: wgbPopIn .3s var(--spring) both; }
@keyframes wgbPopIn { from { transform:scaleY(0); opacity:0; } to { transform:scaleY(1); opacity:1; } }
.wgb-cluster.tappable { cursor:pointer; padding:5px; border-radius:10px; }
.wgb-cluster.tappable:active { background: rgba(51,38,29,.08); }
.wgb-cluster.shake { animation: wgbShake .45s ease; }
@keyframes wgbShake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-6px);} 60%{transform:translateX(5px);} 85%{transform:translateX(-3px);} }
.wgb-cluster.busted { animation: wgbBust .6s ease both; }
@keyframes wgbBust { 0%{transform:scale(1) rotate(0);} 40%{transform:scale(1.15) rotate(-6deg);} 100%{transform:scale(.85) rotate(4deg); opacity:.35;} }
.wgb-optrow { display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-top:14px; }
.wgb-opt.correct { background: var(--correct); color:#fff; border-color: var(--correct); }
.wgb-opt.wrong { animation: wgbShake .45s ease; }
.wgb-lock { font-size:16px; padding:12px 24px; }
.wgb-tablewrap { display:flex; justify-content:center; padding:8px 0; }
.wgb-tbox { position:relative; }
.wgb-grid { display:grid; }
.wgb-chead, .wgb-rhead {
  display:flex; align-items:center; justify-content:center; font-weight:700; font-size:13px; color:#7c6247;
}
.wgb-rhead { justify-content:flex-end; padding-right:10px; color: var(--gold-deep); }
.wgb-tcell {
  display:flex; align-items:center; justify-content:center; font-weight:700; font-size:18px;
  background: var(--card); border:2px solid rgba(51,38,29,.12); color:var(--ink); margin:2px;
  border-radius:10px; transition: background .2s, transform .2s, box-shadow .2s;
}
.wgb-tcell.active {
  background: linear-gradient(180deg,#FFF3CE,#FBE29A); border-color:var(--gold-deep);
  transform:scale(1.08); box-shadow:0 0 10px rgba(244,197,66,.6);
}
.wgb-rowfinger, .wgb-colfinger {
  position:absolute; z-index:5; display:flex; align-items:center; justify-content:center;
  font-weight:700; font-size:12px; color:#5e3387; background:rgba(155,89,208,.18);
  border:2.5px dashed #9B59D0; border-radius:12px; cursor:grab; touch-action:none; transition:opacity .3s;
}
.wgb-rowfinger { left:0; }
.wgb-colfinger { top:0; }
.wgb-rowfinger.unset, .wgb-colfinger.unset { opacity:.5; }
.wgb-crossread {
  text-align:center; font-size:14px; font-weight:600; color:var(--ink); margin-top:4px;
  background: var(--card); border-radius:12px; padding:8px 14px; box-shadow: 0 3px 0 rgba(0,0,0,.12);
}
.wgb-crossread b { color: var(--gold-deep); }
.wgb-win {
  margin-top:12px; text-align:center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF);
  border:3px solid var(--correct); border-radius:14px; padding:10px 14px;
  animation: animBubbleIn .34s var(--spring) both;
}
.wgb-win .wp { font-weight:700; color:#1d8f4e; font-size:16px; }
.wgb-win .wk { font-size:13.5px; color:#4d6b58; font-weight:500; margin-top:2px; }
.wgb-rule {
  margin-top:12px; font-size:13.5px; line-height:1.35; background:linear-gradient(180deg,#FFF3CE,#FBE29A);
  border:3px solid var(--gold-deep); border-radius:14px; padding:10px 14px; color:#5a4408; font-weight:700;
}
`;

function renderCluster(strokeCount, closed) {
  const c = el('div', 'wgb-cluster' + (closed ? ' closed' : ''));
  for (let i = 0; i < strokeCount; i += 1) c.append(el('span', 'wgb-stick'));
  if (closed) {
    const slash = el('span', 'wgb-slash');
    slash.style.width = (strokeCount * 11 + 8) + 'px';
    c.append(slash);
  }
  return c;
}

function clusterCenter(stage, cl) {
  const cr = cl.getBoundingClientRect();
  const sr = stage.getBoundingClientRect();
  return [cr.left - sr.left + cr.width / 2, cr.top - sr.top + cr.height / 2];
}

/* ---------- the row/column finger table (mission 4) ---------- */
function makeTableBoard(host) {
  const wrap = el('div', 'wgb-tbox');
  wrap.style.width = T_W + 'px';
  wrap.style.height = T_H + 'px';
  const grid = el('div', 'wgb-grid');
  grid.style.gridTemplateColumns = `${T_LABEL}px ${T_COL}px ${T_COL}px`;
  grid.style.gridTemplateRows = `${T_HEAD}px ${T_ROW}px ${T_ROW}px`;
  grid.append(el('div', 'wgb-corner'));
  TABLE_COLS.forEach((c) => grid.append(el('div', 'wgb-chead', c)));
  const cells = [];
  TABLE_ROWS.forEach((r, ri) => {
    grid.append(el('div', 'wgb-rhead', r));
    const row = [];
    TABLE_COLS.forEach((c, ci) => {
      const cell = el('div', 'wgb-tcell');
      row.push(cell);
      grid.append(cell);
    });
    cells.push(row);
  });
  const rowFinger = el('div', 'wgb-rowfinger unset', '👉 ROW');
  const colFinger = el('div', 'wgb-colfinger unset', '👇 COL');
  rowFinger.style.cssText += `width:${T_W}px;height:${T_ROW}px;top:${T_HEAD}px;`;
  colFinger.style.cssText += `height:${T_H}px;width:${T_COL}px;left:${T_LABEL}px;`;
  wrap.append(grid, rowFinger, colFinger);
  host.append(wrap);

  let rowIdx = 0; let colIdx = 0; let rowY = 0; let colX = 0;
  let rowAnchor = 0; let colAnchor = 0;
  let settledRow = false; let settledCol = false;
  let cancelRow = null; let cancelCol = null;
  const api = { onCross: null };

  function paintActive() {
    cells.forEach((row) => row.forEach((c) => { c.classList.remove('active'); c.textContent = ''; }));
    if (settledRow && settledCol) {
      const cell = cells[rowIdx][colIdx];
      cell.classList.add('active');
      cell.textContent = String(TABLE_VALUES[rowIdx][colIdx]);
      if (api.onCross) api.onCross(rowIdx, colIdx);
    }
  }

  const rowDrag = makeDrag(rowFinger, {
    onStart() {
      if (cancelRow) { cancelRow(); cancelRow = null; }
      rowAnchor = rowY;
      if (settledRow) { settledRow = false; paintActive(); }
    },
    onMove(dx, dy) {
      rowY = Math.max(-T_ROW * 0.3, Math.min(T_ROW * 1.3, rowAnchor + dy));
      rowFinger.style.transform = `translateY(${rowY}px)`;
    },
    onEnd() {
      const idx = rowY > T_ROW / 2 ? 1 : 0;
      const target = idx * T_ROW;
      cancelRow = tween((v) => { rowY = v; rowFinger.style.transform = `translateY(${v}px)`; }, rowY, target, 220, () => {
        cancelRow = null; rowY = target; rowIdx = idx; settledRow = true;
        rowFinger.classList.remove('unset');
        sfx.settle(); paintActive();
      });
    },
  });
  const colDrag = makeDrag(colFinger, {
    onStart() {
      if (cancelCol) { cancelCol(); cancelCol = null; }
      colAnchor = colX;
      if (settledCol) { settledCol = false; paintActive(); }
    },
    onMove(dx) {
      colX = Math.max(-T_COL * 0.3, Math.min(T_COL * 1.3, colAnchor + dx));
      colFinger.style.transform = `translateX(${colX}px)`;
    },
    onEnd() {
      const idx = colX > T_COL / 2 ? 1 : 0;
      const target = idx * T_COL;
      cancelCol = tween((v) => { colX = v; colFinger.style.transform = `translateX(${v}px)`; }, colX, target, 220, () => {
        cancelCol = null; colX = target; colIdx = idx; settledCol = true;
        colFinger.classList.remove('unset');
        sfx.settle(); paintActive();
      });
    },
  });

  api.settled = () => settledRow && settledCol;
  api.current = () => ({ row: rowIdx, col: colIdx });
  api.abortDrags = () => {
    rowDrag.abort(); colDrag.abort();
    if (cancelRow) { cancelRow(); cancelRow = null; }
    if (cancelCol) { cancelCol(); cancelCol = null; }
  };
  api.destroy = () => {
    if (cancelRow) cancelRow();
    if (cancelCol) cancelCol();
    rowDrag.destroy(); colDrag.destroy();
    wrap.remove();
  };
  return api;
}

/* ---------- the anim card ---------- */
export default {
  id: 'tables-tally',
  title: "WALLY'S GATE BUILDER",

  mount(host, ctx) {
    injectCss('tables-tally', CSS);
    let alive = true;
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'wgb-q');
    const qsub = el('div', 'wgb-qsub');
    const boardHost = el('div', 'wgb-boardhost');
    const dash = el('div', 'wgb-dash');
    const winBox = el('div');
    const controls = el('div', 'anim-controls');
    stage.append(chiprow, q, qsub, boardHost, dash, winBox, controls);
    host.append(stage);

    const ruleCard = el('div', 'wgb-rule', RULE);
    host.append(ruleCard);

    const doneSet = new Set();
    let mi = 0;
    let current = null;

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), m.chip);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
    }

    function markDone(id) {
      doneSet.add(id);
      paintChips();
      if (doneSet.size === MISSIONS.length) ctx.complete();
    }

    function winCard(title, worked) {
      if (!alive) return;
      sfx.win();
      party(stage);
      winBox.innerHTML = '';
      const w = el('div', 'wgb-win', `<div class="wp">${title}</div><div class="wk">${worked}</div>`);
      winBox.append(w);
      markDone(MISSIONS[mi].id);
      const nextIdx = MISSIONS.findIndex((mm) => !doneSet.has(mm.id));
      if (nextIdx !== -1) {
        const nb = el('button', 'btn btn-gold', 'NEXT ONE ➡');
        nb.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
        nb.addEventListener('click', () => { sfx.ui(); start(nextIdx); });
        w.append(nb);
      } else {
        const done = el('div', 'wk', 'Every gate counted, every fake spotted — Wally salutes you! 🫡');
        done.style.cssText = 'margin-top:6px;font-weight:700;color:#1d8f4e;';
        w.append(done);
      }
    }

    /* ---------- mission 1: build the tally by tapping ---------- */
    function mountBuild(m) {
      q.innerHTML = `Count <b>${m.target}</b> frogs into the yard 🐸`;
      qsub.textContent = 'Tap ADD FROG each time one arrives — watch the gates snap shut!';
      const yard = el('div', 'wgb-yard');
      boardHost.append(yard);
      const chip = el('div', 'wgb-chip');
      dash.append(chip);
      let total = 0;
      let solved = false;

      function render(justAdded) {
        yard.innerHTML = '';
        const { gates, strays } = breakdown(total);
        for (let g = 0; g < gates; g += 1) {
          const cl = renderCluster(4, true);
          if (justAdded && g === gates - 1 && total > 0 && total % 5 === 0) cl.classList.add('justclosed');
          yard.append(cl);
        }
        if (strays > 0 || total === 0) {
          const cl = renderCluster(strays, false);
          if (strays > 0 && justAdded) cl.classList.add('pop');
          yard.append(cl);
        }
        chip.innerHTML = chipText(total);
      }
      render();

      const addBtn = el('button', 'btn btn-gold', 'ADD FROG 🐸');
      const undoBtn = el('button', 'anim-ghostbtn', '↩ UNDO');
      const lock = el('button', 'btn btn-gold wgb-lock', 'LOCK IT IN 💨');
      controls.append(addBtn, undoBtn, lock);

      addBtn.addEventListener('click', () => {
        if (!alive || solved || total >= 20) return;
        total += 1;
        render(true);
        if (total % 5 === 0) sfx.drop(); else sfx.tick((total - 1) % 5);
      });
      undoBtn.addEventListener('click', () => {
        if (!alive || solved || total === 0) return;
        total -= 1;
        render(false);
        sfx.tock(0);
      });
      lock.addEventListener('click', () => {
        if (!alive || solved) return;
        sfx.ui();
        if (total === m.target) {
          solved = true;
          const { gates, strays } = breakdown(total);
          const lockedTotal = total;
          winCard('GATE BY GATE! 🎉', `${gates} gates × 5 + ${strays} strays = ${lockedTotal} — spot on!`);
          later(() => bubble(stage, {
            title: 'FIVE, NEVER SIX! 🚪',
            text: `See how the yard settled? <b>${gates} gates</b> worth 5 each, plus <b>${strays} stray${strays === 1 ? '' : 's'}</b> — that's ${gates} × 5 + ${strays} = <b>${lockedTotal}</b>. Gates first, strays second, every single time!`,
            img: WALLY_IMG,
          }), 350);
        } else {
          sfx.nudge();
          const { gates, strays } = breakdown(total);
          const text = total < m.target
            ? `You've got <b>${gates}</b> gate${gates === 1 ? '' : 's'} and <b>${strays}</b> stray${strays === 1 ? '' : 's'} in the yard — that's <b>${total}</b>. Wally counted <b>${m.target}</b> frogs — tap ADD FROG a few more times!`
            : `You've got <b>${gates}</b> gate${gates === 1 ? '' : 's'} and <b>${strays}</b> stray${strays === 1 ? '' : 's'} in the yard — that's <b>${total}</b>, too many! Wally only counted <b>${m.target}</b> — tap UNDO to send a few home.`;
          bubble(stage, { title: 'KEEP COUNTING! 💪', text, img: WALLY_IMG });
        }
      });

      return { destroy() {} };
    }

    /* ---------- mission 2: read a finished tally back ---------- */
    function mountReadback(m) {
      q.textContent = "Wally already counted these ducks 🦆 — what's the total?";
      qsub.textContent = 'Count the GATES first, then the STRAYS.';
      const yard = el('div', 'wgb-yard');
      for (let g = 0; g < m.gates; g += 1) yard.append(renderCluster(4, true));
      if (m.strays > 0) yard.append(renderCluster(m.strays, false));
      boardHost.append(yard);
      const opts = el('div', 'wgb-optrow');
      boardHost.append(opts);
      let solved = false;
      shuffle(M2_OPTIONS).forEach((val) => {
        const b = el('button', 'anim-mchip wgb-opt', String(val));
        b.addEventListener('click', () => {
          if (!alive || solved) return;
          sfx.ui();
          if (val === M2_TOTAL) {
            solved = true;
            b.classList.add('correct');
            winCard('COUNTED IT! 🎉', `${m.gates} gates × 5 + ${m.strays} strays = ${M2_TOTAL}.`);
          } else {
            sfx.nudge();
            b.classList.add('wrong');
            later(() => b.classList.remove('wrong'), 500);
            bubble(stage, { title: 'RECOUNT! 🔍', text: M2_FEEDBACK[val] || 'Count the GATES first, then the STRAYS.', img: WALLY_IMG });
          }
        });
        opts.append(b);
      });
      return { destroy() {} };
    }

    /* ---------- mission 3: spot the six-stick imposter ---------- */
    function mountTrap() {
      q.textContent = 'One of these gates is a FAKE — spot it!';
      qsub.textContent = 'Tap the gate with a stick too many.';
      const yard = el('div', 'wgb-trapyard');
      boardHost.append(yard);
      let solved = false;
      shuffle(M3_CLUSTERS).forEach((spec) => {
        const cl = renderCluster(spec.stroke, true);
        cl.classList.add('tappable');
        cl.addEventListener('click', () => {
          if (!alive || solved) return;
          if (spec.trap) {
            solved = true;
            sfx.sparkle();
            sparkleBurst(stage, ...clusterCenter(stage, cl));
            cl.classList.add('busted');
            winCard('GOTCHA! 🗑️', 'Five sticks and a slash is SIX, not five — Wally is sulking in the bin.');
          } else {
            sfx.nudge();
            cl.classList.add('shake');
            later(() => cl.classList.remove('shake'), 450);
            toast(stage, 'That gate is honest — four sticks, one slash, five total. Keep looking!');
          }
        });
        yard.append(cl);
      });
      return { destroy() {} };
    }

    /* ---------- mission 4: row + column fingers on a mini table ---------- */
    function mountTable() {
      q.innerHTML = 'How many <b>Y6</b> pupils <b>Walk</b> to school?';
      qsub.textContent = 'Slide the ROW finger and the COLUMN finger until they meet.';
      const wrap = el('div');
      boardHost.append(wrap);
      const board = makeTableBoard(wrap);
      const readout = el('div', 'wgb-crossread', 'Slide both fingers to find a cell.');
      dash.append(readout);
      const lock = el('button', 'btn btn-gold wgb-lock', 'LOCK IT IN 💨');
      controls.append(lock);
      let solved = false;

      board.onCross = (r, c) => {
        if (!alive) return;
        const val = TABLE_VALUES[r][c];
        readout.innerHTML = `You're on <b>${TABLE_ROWS[r]}</b> + <b>${TABLE_COLS[c]}</b> — that cell reads <b>${val}</b>.`;
      };

      lock.addEventListener('click', () => {
        if (!alive || solved) return;
        if (!board.settled()) { sfx.nudge(); toast(stage, 'Slide BOTH fingers first!'); return; }
        sfx.ui();
        const { row, col } = board.current();
        if (row === M4_TARGET.row && col === M4_TARGET.col) {
          solved = true;
          winCard('FOUND IT! 🎉', `Y6 + Walk cross at ${TABLE_VALUES[row][col]}.`);
        } else {
          sfx.nudge();
          bubble(stage, {
            title: 'NOT QUITE THERE! 🖐️',
            text: `Right now you're on <b>${TABLE_ROWS[row]}</b> + <b>${TABLE_COLS[col]}</b>. Wally wants <b>Y6</b> + <b>Walk</b> — slide both fingers to find it.`,
            img: WALLY_IMG,
          });
        }
      });

      return { destroy() { board.destroy(); }, onResize() { board.abortDrags(); } };
    }

    function start(i) {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
      mi = i;
      winBox.innerHTML = '';
      dash.innerHTML = '';
      controls.innerHTML = '';
      boardHost.innerHTML = '';
      if (current) { current.destroy(); current = null; }
      paintChips();
      const m = MISSIONS[i];
      if (m.type === 'build') current = mountBuild(m);
      else if (m.type === 'readback') current = mountReadback(m);
      else if (m.type === 'trap') current = mountTrap();
      else current = mountTable();
    }

    const onResize = () => { if (current && current.onResize) current.onResize(); };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    start(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      if (current) current.destroy();
      stage.remove();
      ruleCard.remove();
    };
  },
};
