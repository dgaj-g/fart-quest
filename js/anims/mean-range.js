// FART QUEST — js/anims/mean-range.js
// THE MEANIE'S LEVELLING SCOOP — interactive block-tower machine for the
// mean-range Scout Report. Child scoops blocks off a TALLER pile onto a
// shorter one; the TOTAL never changes as blocks move, and when every pile
// stands equal the level-line lights up as THE MEAN. A separate mission
// hands over a two-jawed caliper to measure the RANGE across four ghost
// piles: biggest minus smallest, middle numbers are bystanders.

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const MEANIE_IMG = 'assets/monsters/the-meanie.png';
const RULE = 'Mean = share the total out equally (add all, divide by how many). Range = biggest minus smallest.';
const WIN_PHRASES = ['LEVELLED! 🥄', 'FAIR SHARES ALL ROUND!', 'THE MEANIE APPROVES!', 'SPOT ON, STINKER!'];
const LETTERS = ['A', 'B', 'C', 'D', 'E'];

/* ---------- pure engine (every guided mission's numbers verified in a
   scratch node script — do not "improve" without re-running it) ---------- */
function sum(arr) { return arr.reduce((a, b) => a + b, 0); }
function makeLevelState(nums) {
  const total = sum(nums);
  const n = nums.length;
  return { heights: nums.slice(), total, n, mean: total / n, levelled: false };
}
// Only a STRICTLY TALLER pile may donate onto a shorter-or-equal one — this
// is exactly the brief's "scoop off tall towers onto short ones", and as a
// side effect no pile can ever grow past the set's original tallest pile.
function moveBlock(state, from, to) {
  if (from === to) return false;
  if (state.heights[from] <= state.heights[to]) return false;
  state.heights[from] -= 1;
  state.heights[to] += 1;
  return true;
}
function isLevelled(state) { return state.heights.every((h) => h === state.mean); }

function makeRangeState(nums) {
  const max = Math.max(...nums);
  const min = Math.min(...nums);
  return { nums: nums.slice(), max, min, range: max - min, done: false };
}
function checkRangePair(state, idxA, idxB) {
  if (idxA === idxB) return { ok: false, same: true, gap: 0 };
  const a = state.nums[idxA]; const b = state.nums[idxB];
  const gap = Math.abs(a - b);
  const ok = (a === state.max && b === state.min) || (a === state.min && b === state.max);
  return { ok, same: false, gap };
}

/* ---------- content ---------- */
const MISSIONS = [
  {
    id: 'm1', type: 'level', nums: [4, 6, 8], label: 'Level 4, 6, 8', formula: false,
    worked: '4 + 6 + 8 = 18 shared between 3 piles → 18 ÷ 3 = 6 each.',
  },
  {
    id: 'm2', type: 'level', nums: [2, 3, 7], label: 'Level 2, 3, 7', formula: false,
    worked: '2 + 3 + 7 = 12 shared between 3 piles → 12 ÷ 3 = 4 each.',
  },
  {
    id: 'm3', type: 'level', nums: [4, 6, 8], label: 'Recap 4, 6, 8', formula: true,
    worked: 'Same piles, same ritual: 4 + 6 + 8 = 18, then 18 ÷ 3 = 6.',
  },
  {
    id: 'm4', type: 'range', nums: [3, 9, 4, 8], label: 'Range 3, 9, 4, 8',
    worked: 'Biggest 9, smallest 3. Range = 9 − 3 = 6 — the middle numbers (4 and 8) are bystanders.',
  },
];

const BLOCK_H = 22;
const ROWS = 10;
const LANE_H = ROWS * BLOCK_H;

const CSS = `
.mls-q { text-align:center; font-weight:700; font-size:clamp(19px,3.2vw,28px); margin-bottom:2px; }
.mls-qsub { text-align:center; font-size:13px; color:#6b5744; font-weight:600; margin-bottom:10px; min-height:18px; }
.mls-total { display:flex; justify-content:center; margin-bottom:8px; }
.mls-total-chip {
  background:var(--swamp-mid); color:var(--parchment); border-radius:999px; padding:7px 16px;
  font-weight:700; font-size:13px; box-shadow:0 3px 0 rgba(0,0,0,.3); text-align:center;
}
.mls-total-chip b { color:var(--stink-lime); }
.mls-boardhost { display:flex; justify-content:center; padding:4px 0; }
.mls-board { position:relative; margin:0 auto; }
.mls-yard {
  position:relative; margin:0 auto; border-radius:14px;
  background:linear-gradient(180deg,#efe1c4,#e8d7b4); box-shadow:inset 0 3px 8px rgba(51,38,29,.18);
  touch-action:none; overflow:visible;
}
.mls-yard.ghost { background:linear-gradient(180deg,#e6ded0,#ddd3c0); opacity:.92; }
.mls-block {
  position:absolute; border-radius:6px; background:linear-gradient(180deg,#fff,#f1e4c2);
  border:2.5px solid var(--ink); box-shadow:0 2px 0 rgba(51,38,29,.3);
}
.mls-block.ghost { background:linear-gradient(180deg,#f4efe3,#e5dcc8); border-color:rgba(51,38,29,.55); box-shadow:none; }
.mls-block.grab { cursor:grab; }
.mls-block.grab::before {
  content:''; position:absolute; inset:-13px 0; /* invisible hit-area pad: 18px visual brick -> 44px effective touch target */
}
.mls-block.grab::after {
  content:''; position:absolute; inset:3px; border-radius:3px; border:1.5px dashed rgba(51,38,29,.3);
}
.mls-block.dragging { cursor:grabbing; z-index:40; box-shadow:0 8px 14px rgba(0,0,0,.35); }
.mls-block.landing { animation:mlsLand .4s cubic-bezier(.22,1.2,.36,1) both; }
@keyframes mlsLand { 0%{ transform:scale(1.15,.82); } 60%{ transform:scale(.94,1.08); } 100%{ transform:scale(1,1); } }
.mls-labels { display:flex; justify-content:center; margin:0 auto; }
.mls-label {
  flex:0 0 auto; text-align:center; font-size:12px; font-weight:700; color:#6b5744; padding-top:4px;
}
.mls-label b { color:var(--ink); }
.mls-meanline {
  position:absolute; left:0; right:0; height:0; border-top:3px dashed var(--gold-deep); z-index:9;
  opacity:0; transform:scaleX(.4); transform-origin:center;
}
.mls-meanline.lit { animation:mlsLineIn .5s var(--spring) both; }
@keyframes mlsLineIn { 0%{ opacity:0; transform:scaleX(.2); } 100%{ opacity:1; transform:scaleX(1); } }
.mls-meantag {
  position:absolute; right:6px; top:-24px; background:var(--gold); color:#5a4408; font-weight:700;
  font-size:11px; padding:3px 9px; border-radius:999px; box-shadow:0 2px 0 rgba(0,0,0,.2); white-space:nowrap;
}
.mls-formula {
  display:flex; flex-direction:column; align-items:center; gap:3px; margin-top:12px;
  font-weight:700; font-size:clamp(14px,2.4vw,17px); color:var(--ink);
}
.mls-formula .f2 { color:#6b5744; font-size:clamp(13px,2.2vw,16px); }
.mls-formula b { color:var(--stink); }
.mls-formula .qmark { color:#a08c74; }
.mls-formula .stamp { animation:mlsStamp .4s var(--spring) both; }
@keyframes mlsStamp { 0%{ transform:scale(2.2); opacity:0; } 100%{ transform:scale(1); opacity:1; } }
.mls-jawrow { position:relative; margin:0 auto 4px; }
.mls-jaw {
  position:absolute; top:0; width:44px; height:44px; border-radius:50%; transform:translate(-50%,0);
  background:radial-gradient(circle at 35% 30%,#fff2b8,#F4C542 60%,#B8860B); border:3px solid var(--ink);
  display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; color:#5a4408;
  box-shadow:0 4px 0 rgba(0,0,0,.3); cursor:grab; touch-action:none; z-index:20;
}
.mls-jaw::after {
  content:''; position:absolute; left:50%; top:100%; width:0; border-left:2px dashed rgba(51,38,29,.5);
  height:14px; transform:translateX(-50%);
}
.mls-jaw.dragging { cursor:grabbing; box-shadow:0 0 0 6px rgba(244,197,66,.35),0 4px 0 rgba(0,0,0,.3); }
.mls-bracket {
  position:absolute; top:16px; height:0; border-top:2.5px solid var(--stink); z-index:10;
}
.mls-gap {
  position:absolute; top:-14px; transform:translateX(-50%); background:var(--card); border:2px solid var(--stink);
  border-radius:999px; padding:2px 9px; font-size:11px; font-weight:700; color:var(--stink); white-space:nowrap; z-index:21;
}
.mls-win { margin-top:10px; text-align:center; background:linear-gradient(180deg,#E9FBEF,#D3F3DF); border:3px solid var(--correct); border-radius:14px; padding:10px 14px; }
.mls-win .wp { font-weight:700; color:#1d8f4e; font-size:16px; }
.mls-win .wk { font-size:13px; color:#4d6b58; font-weight:500; margin-top:3px; }
`;

export default {
  id: 'mean-range',
  title: "THE MEANIE'S LEVELLING SCOOP",

  mount(host, ctx) {
    injectCss('mean-range', CSS);
    let alive = true;
    let genToken = 0;
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };
    const everShown = new Set(); // cross-mission, once-ever explainer bubbles

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'mls-q');
    const qsub = el('div', 'mls-qsub');
    const boardHost = el('div', 'mls-boardhost');
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
    let mission = null; let state = null;
    let n = 0; let towerW = 90; let yardW = 270;
    let els = {}; // per-mission DOM refs
    let towerDrags = []; let flightCancel = null;
    let jawA = null; let jawB = null;
    let lastCheckedKey = null;

    const towerX = (i) => i * towerW;
    const centerX = (i) => towerX(i) + towerW / 2;
    const blockTop = (idx) => LANE_H - (idx + 1) * BLOCK_H;
    const idxAt = (x) => Math.max(0, Math.min(n - 1, Math.floor(x / towerW)));

    /* ---------- shared board scaffolding ---------- */
    function computeMetrics() {
      n = mission.type === 'level' ? state.n : state.nums.length;
      const avail = Math.min(560, (host.clientWidth || 640) - 24);
      towerW = Math.max(64, Math.min(150, Math.floor(avail / n)));
      yardW = towerW * n;
    }

    /* ---------- LEVEL mission ---------- */
    function buildLevelBoard() {
      boardHost.innerHTML = '';
      const board = el('div', 'mls-board');
      const totalRow = el('div', 'mls-total', `<div class="mls-total-chip">TOTAL: <b>${state.total}</b> — never changes as blocks move</div>`);
      const yard = el('div', 'mls-yard');
      const meanline = el('div', 'mls-meanline', '<div class="mls-meantag"></div>');
      yard.append(meanline);
      const labels = el('div', 'mls-labels');
      for (let i = 0; i < n; i += 1) {
        const lb = el('div', 'mls-label', `${LETTERS[i]} <b class="cnt"></b>`);
        labels.append(lb);
      }
      board.append(totalRow, yard, labels);
      let formulaEl = null;
      if (mission.formula) {
        formulaEl = el('div', 'mls-formula',
          `<span class="f1">${mission.nums.join(' + ')} = <b>${state.total}</b></span>`
          + `<span class="f2">${state.total} ÷ ${state.n} = <b class="ans qmark">?</b></span>`);
        board.append(formulaEl);
      }
      boardHost.append(board);
      els = { board, yard, meanline, labels, formulaEl };
      layoutLevel();
      paintTowers(true);
    }
    function layoutLevel() {
      computeMetrics();
      els.yard.style.width = yardW + 'px';
      els.yard.style.height = LANE_H + 'px';
      els.labels.style.width = yardW + 'px';
      els.labels.querySelectorAll('.mls-label').forEach((lb) => { lb.style.width = towerW + 'px'; });
      els.meanline.style.top = (LANE_H - state.mean * BLOCK_H) + 'px';
    }
    function paintTowers(instant, landedIdx) {
      els.yard.querySelectorAll('.mls-block').forEach((b) => b.remove());
      const blockRefs = [];
      for (let i = 0; i < n; i += 1) {
        const col = [];
        for (let k = 0; k < state.heights[i]; k += 1) {
          const b = el('div', 'mls-block');
          b.style.left = (towerX(i) + 8) + 'px';
          b.style.width = (towerW - 16) + 'px';
          b.style.height = (BLOCK_H - 4) + 'px';
          b.style.top = blockTop(k) + 'px';
          if (!instant && i === landedIdx && k === state.heights[i] - 1) b.classList.add('landing');
          els.yard.append(b);
          col.push(b);
        }
        blockRefs.push(col);
      }
      els.labels.querySelectorAll('.mls-label .cnt').forEach((c, i) => { c.textContent = `(${state.heights[i]})`; });
      attachTowerDrags(blockRefs);
    }
    function attachTowerDrags(blockRefs) {
      towerDrags.forEach((d) => d && d.destroy());
      towerDrags = state.heights.map((h, i) => {
        if (h <= 0 || state.levelled) return null;
        const blockEl = blockRefs[i][h - 1];
        blockEl.classList.add('grab');
        return makeDrag(blockEl, {
          enabled: () => !flightCancel,
          onStart() {
            if (flightCancel) { flightCancel(); flightCancel = null; }
            blockEl.classList.add('dragging');
          },
          onMove(dx, dy) { blockEl.style.transform = `translate(${dx}px, ${dy}px)`; },
          onEnd(dx, dy) {
            blockEl.classList.remove('dragging');
            const target = idxAt(centerX(i) + dx);
            if (target === i || state.heights[i] <= state.heights[target]) {
              flightCancel = tween((k) => { blockEl.style.transform = `translate(${dx * k}px, ${dy * k}px)`; }, 1, 0, 220, () => {
                flightCancel = null; blockEl.style.transform = '';
              });
              if (target !== i) { sfx.nudge(); toast(stage, `Pile ${LETTERS[target]} isn't shorter than pile ${LETTERS[i]} — scoop from the TALLER one!`); }
              return;
            }
            commitLevelMove(i, target, blockEl, dx, dy);
          },
        });
      });
    }
    function commitLevelMove(from, to, blockEl, dx0, dy0) {
      const myGen = genToken; const st = state;
      const originLeft = towerX(from) + 8; const originTop = blockTop(state.heights[from] - 1);
      const targetLeft = towerX(to) + 8; const targetTop = blockTop(state.heights[to]);
      const toDX = targetLeft - originLeft; const toDY = targetTop - originTop;
      flightCancel = tween((k) => {
        const cx = dx0 + (toDX - dx0) * k; const cy = dy0 + (toDY - dy0) * k;
        blockEl.style.transform = `translate(${cx}px, ${cy}px)`;
      }, 0, 1, 240, () => {
        flightCancel = null;
        if (myGen !== genToken || st !== state) return;
        moveBlock(state, from, to);
        sfx.drop();
        paintTowers(false, to);
        if (!everShown.has('total')) {
          everShown.add('total');
          later(() => bubble(stage, {
            title: 'SHARING MOVES, NEVER MAKES! 🥄',
            text: `The Meanie insists you watch the TOTAL chip — it's still <b>${state.total}</b>, no matter how many blocks you scoop! Sharing moves blocks around, it never makes new ones.`,
            img: MEANIE_IMG,
          }), 260);
        }
        checkLevelled();
      });
    }
    function checkLevelled() {
      if (state.levelled || !isLevelled(state)) return;
      state.levelled = true;
      paintTowers(true);
      sfx.win();
      party(stage);
      qsub.textContent = '';
      const sr = stage.getBoundingClientRect(); const yr = els.yard.getBoundingClientRect();
      sparkleBurst(stage, yr.left - sr.left + yr.width / 2, yr.top - sr.top + yr.height / 2);
      els.meanline.classList.add('lit');
      els.meanline.querySelector('.mls-meantag').textContent = `THE MEAN = ${state.mean}`;
      if (els.formulaEl) {
        const ans = els.formulaEl.querySelector('.ans');
        ans.textContent = String(state.mean);
        ans.classList.remove('qmark');
        ans.classList.add('stamp');
      }
      onMissionDone();
      if (mission.id === 'm3' && !everShown.has('recap')) {
        everShown.add('recap');
        later(() => bubble(stage, {
          title: 'THE RITUAL, PROVEN! 🥄',
          text: `That's The Meanie's whole rulebook in one go: ${RULE} You just watched it happen with your own hands — <b>${state.total} ÷ ${state.n} = ${state.mean}</b>.`,
          img: MEANIE_IMG,
        }), 500);
      }
    }

    /* ---------- RANGE mission ---------- */
    function buildRangeBoard() {
      boardHost.innerHTML = '';
      const board = el('div', 'mls-board');
      const rail = el('div', 'mls-jawrow');
      const bracket = el('div', 'mls-bracket');
      const gap = el('div', 'mls-gap');
      const jA = el('button', 'mls-jaw', 'A');
      const jB = el('button', 'mls-jaw', 'B');
      rail.append(bracket, gap, jA, jB);
      const yard = el('div', 'mls-yard ghost');
      const labels = el('div', 'mls-labels');
      for (let i = 0; i < n; i += 1) labels.append(el('div', 'mls-label', `${LETTERS[i]} <b>(${state.nums[i]})</b>`));
      board.append(rail, yard, labels);
      boardHost.append(board);
      els = { board, rail, bracket, gap, jA, jB, yard, labels };
      // start neither jaw already on the true biggest+smallest pair
      jawA = { idx: 2 % n, cancel: null, drag: null };
      jawB = { idx: 3 % n, cancel: null, drag: null };
      if (jawA.idx === jawB.idx) jawB.idx = (jawA.idx + 1) % n;
      lastCheckedKey = null;
      layoutRange();
      paintGhostBlocks();
      positionJaw(jA, jawA.idx, true);
      positionJaw(jB, jawB.idx, true);
      updateBracket();
      attachJawDrag(jA, jawA);
      attachJawDrag(jB, jawB);
    }
    function layoutRange() {
      computeMetrics();
      els.rail.style.width = yardW + 'px';
      els.rail.style.height = '40px';
      els.yard.style.width = yardW + 'px';
      els.yard.style.height = LANE_H + 'px';
      els.labels.style.width = yardW + 'px';
      els.labels.querySelectorAll('.mls-label').forEach((lb) => { lb.style.width = towerW + 'px'; });
    }
    function paintGhostBlocks() {
      els.yard.querySelectorAll('.mls-block').forEach((b) => b.remove());
      for (let i = 0; i < n; i += 1) {
        for (let k = 0; k < state.nums[i]; k += 1) {
          const b = el('div', 'mls-block ghost');
          b.style.left = (towerX(i) + 8) + 'px';
          b.style.width = (towerW - 16) + 'px';
          b.style.height = (BLOCK_H - 4) + 'px';
          b.style.top = blockTop(k) + 'px';
          els.yard.append(b);
        }
      }
    }
    function positionJaw(jEl, idx, instant) {
      jEl.style.left = centerX(idx) + 'px';
      if (instant) jEl.style.transform = '';
    }
    function updateBracket() {
      const xa = centerX(jawA.idx); const xb = centerX(jawB.idx);
      const left = Math.min(xa, xb); const right = Math.max(xa, xb);
      els.bracket.style.left = left + 'px';
      els.bracket.style.width = (right - left) + 'px';
      const gap = Math.abs(state.nums[jawA.idx] - state.nums[jawB.idx]);
      els.gap.textContent = jawA.idx === jawB.idx ? '—' : `gap: ${gap}`;
      els.gap.style.left = ((left + right) / 2) + 'px';
    }
    function attachJawDrag(jEl, jawRef) {
      jawRef.drag = makeDrag(jEl, {
        onStart() {
          if (jawRef.cancel) { jawRef.cancel(); jawRef.cancel = null; }
          jEl.classList.add('dragging');
        },
        onMove(dx) { jEl.style.transform = `translate(calc(-50% + ${dx}px), 0)`; },
        onEnd(dx) {
          jEl.classList.remove('dragging');
          const origin = centerX(jawRef.idx);
          const newIdx = idxAt(origin + dx);
          const targetOffset = centerX(newIdx) - origin;
          const myGen = genToken;
          jawRef.cancel = tween((k) => { jEl.style.transform = `translate(calc(-50% + ${dx + (targetOffset - dx) * k}px), 0)`; }, 0, 1, 200, () => {
            jawRef.cancel = null;
            if (myGen !== genToken) return;
            jawRef.idx = newIdx;
            jEl.style.left = centerX(newIdx) + 'px';
            jEl.style.transform = '';
            sfx.tick();
            updateBracket();
            checkRangeAttempt();
          });
        },
      });
    }
    function checkRangeAttempt() {
      if (state.done) return;
      const result = checkRangePair(state, jawA.idx, jawB.idx);
      const key = `${jawA.idx}-${jawB.idx}`;
      if (result.ok) {
        state.done = true;
        sfx.win();
        party(stage);
        qsub.textContent = '';
        const sr = stage.getBoundingClientRect(); const br = els.bracket.getBoundingClientRect();
        sparkleBurst(stage, br.left - sr.left + br.width / 2, br.top - sr.top);
        onMissionDone();
        return;
      }
      if (key === lastCheckedKey) return;
      lastCheckedKey = key;
      sfx.nudge();
      if (result.same) toast(stage, 'Both jaws found the same pile — spread them over TWO different piles!');
      else toast(stage, `That's a gap of ${result.gap} — but is that the very BIGGEST pile to the very SMALLEST? Keep hunting!`);
    }

    /* ---------- shared mission flow ---------- */
    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), m.label);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
    }
    function onMissionDone() {
      doneSet.add(mission.id);
      paintChips();
      winBox.innerHTML = '';
      const eq = mission.type === 'level'
        ? `${mission.nums.join(' + ')} → mean <b>${state.mean}</b>`
        : `range of ${mission.nums.join(', ')} = <b>${state.range}</b>`;
      const w = el('div', 'mls-win', `<div class="wp">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]} &nbsp; ${eq}</div><div class="wk">${mission.worked}</div>`);
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
    function start(i) {
      genToken += 1;
      if (flightCancel) { flightCancel(); flightCancel = null; }
      towerDrags.forEach((d) => d && d.destroy()); towerDrags = [];
      if (jawA) { if (jawA.cancel) jawA.cancel(); if (jawA.drag) jawA.drag.destroy(); jawA = null; }
      if (jawB) { if (jawB.cancel) jawB.cancel(); if (jawB.drag) jawB.drag.destroy(); jawB = null; }
      mi = i;
      mission = MISSIONS[i];
      winBox.innerHTML = '';
      paintChips();
      if (mission.type === 'level') {
        state = makeLevelState(mission.nums);
        q.innerHTML = `Level these piles: ${mission.nums.join(', ')}`;
        qsub.textContent = 'Drag a block off a TALLER pile onto a shorter one with the Sharing-Out Scoop.';
        buildLevelBoard();
      } else {
        state = makeRangeState(mission.nums);
        q.innerHTML = `Find the RANGE of: ${mission.nums.join(', ')}`;
        qsub.textContent = 'Drag both jaws — one onto the BIGGEST pile, one onto the SMALLEST.';
        buildRangeBoard();
      }
    }

    resetBtn.addEventListener('click', () => { sfx.ui(); start(mi); });

    const onResize = () => {
      if (!mission) return;
      genToken += 1;
      if (flightCancel) { flightCancel(); flightCancel = null; }
      towerDrags.forEach((d) => d && d.destroy()); towerDrags = [];
      if (mission.type === 'level') {
        layoutLevel();
        paintTowers(true);
        if (state.levelled) {
          els.meanline.classList.add('lit');
          els.meanline.querySelector('.mls-meantag').textContent = `THE MEAN = ${state.mean}`;
        }
      } else {
        [jawA, jawB].forEach((j) => {
          if (j.cancel) { j.cancel(); j.cancel = null; }
          if (j.drag) j.drag.abort();
          els[j === jawA ? 'jA' : 'jB'].style.transform = '';
        });
        layoutRange();
        paintGhostBlocks();
        positionJaw(els.jA, jawA.idx, true);
        positionJaw(els.jB, jawB.idx, true);
        updateBracket();
      }
    };
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
      if (flightCancel) flightCancel();
      towerDrags.forEach((d) => d && d.destroy());
      if (jawA) { if (jawA.cancel) jawA.cancel(); if (jawA.drag) jawA.drag.destroy(); }
      if (jawB) { if (jawB.cancel) jawB.cancel(); if (jawB.drag) jawB.drag.destroy(); }
      stage.remove();
      ruleCard.remove();
    };
  },
};
