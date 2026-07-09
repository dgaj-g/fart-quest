// FART QUEST — js/anims/written-methods.js
// THE CARRY CANNON — interactive column-method machine for the
// written-methods Scout Report. Tap a throne to add/subtract it; sums of 10+
// launch a glowing ① cannonball that must be CAUGHT and DROPPED on the next
// throne left; subtraction that can't be done unlocks a draggable TEN block
// borrowed from the throne next door. Borrowin' Barry supervises throughout.

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const BARRY_IMG = 'assets/monsters/borrowin-barry.png';
const RULE = 'Line up the columns by throne, work right to left, and carry like a hero.';
const THRONES = { H: 'Hundreds', T: 'Tens', U: 'Units' };
const WIN_PHRASES = ['CANNON FIRED! 💥', 'THRONE BY THRONE! 👑', 'BARRY APPROVES! 🎩', 'NAILED IT, STINKER!'];

/* ---------- pure engine (verified against every guided mission in a scratch
   node script — do not "improve" without re-running it) ---------- */
function digitsMSB(str, len) {
  return String(str).padStart(len, '0').split('').map(Number);
}
function makeAddState(a, b) {
  const len = Math.max(a.length, b.length);
  const A = digitsMSB(a, len); const B = digitsMSB(b, len);
  const cols = A.map((d, i) => ({ a: d, b: B[i], carryIn: 0, written: false, writeDigit: null }));
  return { type: 'add', len, cols, activeIdx: len - 1, ball: null, done: false };
}
function tapAdd(state, idx) {
  if (state.done || state.ball || idx !== state.activeIdx) return false;
  const col = state.cols[idx];
  if (col.written) return false;
  const sum = col.a + col.b + col.carryIn;
  col.writeDigit = sum % 10;
  col.written = true;
  if (sum >= 10 && idx > 0) {
    state.ball = { fromIdx: idx, toIdx: idx - 1, caught: false, sum };
  } else {
    state.activeIdx = idx - 1;
    state.done = state.activeIdx < 0;
  }
  return true;
}
function catchAddBall(state) {
  if (!state.ball || state.ball.caught) return false;
  state.ball.caught = true;
  return true;
}
function dropAddBall(state, targetIdx) {
  if (!state.ball || !state.ball.caught || targetIdx !== state.ball.toIdx) return false;
  state.cols[targetIdx].carryIn = 1;
  state.ball = null;
  state.activeIdx = targetIdx;
  return true;
}
function makeSubState(a, b) {
  const len = Math.max(a.length, b.length);
  const A = digitsMSB(a, len); const B = digitsMSB(b, len);
  const cols = A.map((d, i) => ({ a: d, b: B[i], written: false, writeDigit: null, borrowedFrom: false, borrowedInto: false }));
  return { type: 'sub', len, cols, activeIdx: len - 1, needsBorrow: false, done: false };
}
function tapSub(state, idx) {
  if (state.done || idx !== state.activeIdx) return false;
  const col = state.cols[idx];
  if (col.written) return false;
  if (col.a < col.b) { state.needsBorrow = true; return true; }
  col.writeDigit = col.a - col.b;
  col.written = true;
  state.needsBorrow = false;
  state.activeIdx = idx - 1;
  state.done = state.activeIdx < 0;
  return true;
}
function applyBorrow(state, fromIdx, toIdx) {
  if (!state.needsBorrow || toIdx !== state.activeIdx || fromIdx !== state.activeIdx - 1) return false;
  const fromCol = state.cols[fromIdx];
  if (!fromCol || fromCol.borrowedFrom || fromCol.a <= 0) return false;
  fromCol.a -= 1; fromCol.borrowedFrom = true;
  state.cols[toIdx].a += 10; state.cols[toIdx].borrowedInto = true;
  state.needsBorrow = false;
  return true;
}

/* ---------- content (numbers verified: 236+187=423, 358+164=522, 52-27=25) --------- */
const MISSIONS = [
  {
    id: 'm1', type: 'add', a: '236', b: '187', heads: ['H', 'T', 'U'],
    worked: 'Units: 6+7=13 → write 3, carry ① to Tens. Tens: 3+8+①=12 → write 2, carry ① to Hundreds. Hundreds: 2+1+①=4. Answer 423.',
  },
  {
    id: 'm2', type: 'add', a: '358', b: '164', heads: ['H', 'T', 'U'],
    worked: 'Units: 8+4=12 → write 2, carry ① to Tens. Tens: 5+6+①=12 → write 2, carry ① to Hundreds. Hundreds: 3+1+①=5. Answer 522.',
  },
  {
    id: 'm3', type: 'sub', a: '52', b: '27', heads: ['T', 'U'],
    worked: "Units: 2 take away 7 can't do it — borrow a ten from Tens (5→4), Units becomes 12. 12−7=5. Tens: 4−2=2. Answer 25.",
  },
];

const CSS = `
.ccn-q { text-align:center; font-weight:700; font-size:clamp(20px,3.4vw,30px); margin-bottom:2px; }
.ccn-qsub { text-align:center; font-size:13px; color:#6b5744; font-weight:600; margin-bottom:14px; min-height:18px; }
.ccn-boardhost { display:flex; justify-content:center; padding:6px 0 10px; }
.ccn-board { position:relative; margin:0 auto; }
.ccn-heads { display:flex; }
.ccn-head { flex:0 0 auto; display:flex; flex-direction:column; align-items:center; padding-bottom:3px; }
.ccn-head .hb { font-weight:700; font-size:14px; color:#7c6247; line-height:1; }
.ccn-head .hs { font-size:8px; color:#a08c74; font-weight:500; white-space:nowrap; }
.ccn-body { position:relative; display:flex; }
.ccn-gutter { flex:0 0 auto; display:flex; flex-direction:column; align-items:center; padding-top:2px; }
.ccn-col {
  flex:0 0 auto; display:flex; flex-direction:column; align-items:center; padding:2px 2px 6px;
  background:#fff; border:3px solid var(--ink); border-radius:12px; cursor:pointer;
  box-shadow:0 3px 0 rgba(51,38,29,.25); opacity:.68;
}
.ccn-col.active, .ccn-col.written { opacity:1; }
.ccn-col:active { transform:translateY(2px); box-shadow:0 1px 0 rgba(51,38,29,.25); }
.ccn-col.active { border-color:var(--stink); box-shadow:0 0 0 4px rgba(155,89,208,.28),0 3px 0 rgba(51,38,29,.25); animation:ccnPulse 1.4s ease-in-out infinite; }
.ccn-col.dropzone { border-color:var(--gold-deep); box-shadow:0 0 0 4px rgba(244,197,66,.4),0 3px 0 rgba(51,38,29,.25); animation:ccnPulse 1s ease-in-out infinite; }
.ccn-col.blocked { border-color:var(--wrong); animation:ccnShake .45s ease; }
@keyframes ccnPulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.045);} }
@keyframes ccnShake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-6px);} 70%{transform:translateX(5px);} }
.ccn-carry { height:15px; font-size:13px; font-weight:700; color:var(--wrong); line-height:15px; }
.ccn-a, .ccn-b { font-size:clamp(20px,3.6vw,28px); font-weight:700; color:var(--ink); line-height:1.15; min-height:1.15em; }
.ccn-b.ccn-op { color:var(--stink); }
.ccn-rule { width:78%; border-top:3px solid var(--ink); margin:3px 0; }
.ccn-ans { font-size:clamp(20px,3.6vw,28px); font-weight:700; color:var(--correct); min-height:1.15em; line-height:1.15; }
.ccn-old { text-decoration:line-through; opacity:.4; font-size:15px; margin-right:2px; }
.ccn-new { color:var(--wrong); }
.ccn-carrymk { color:var(--wrong); font-size:13px; vertical-align:top; }
.ccn-ball {
  position:absolute; top:-52px; width:42px; height:42px; border-radius:50%; z-index:9;
  background:radial-gradient(circle at 35% 30%,#fff2b8,#F4C542 60%,#B8860B);
  border:3px solid var(--ink); display:flex; align-items:center; justify-content:center;
  font-size:19px; box-shadow:0 4px 10px rgba(0,0,0,.35); cursor:pointer;
  transform:translateX(-50%); animation:ccnBob 1s ease-in-out infinite;
}
.ccn-ball.caught { animation:none; box-shadow:0 0 0 6px rgba(244,197,66,.4),0 4px 10px rgba(0,0,0,.35); }
@keyframes ccnBob { 0%,100%{transform:translate(-50%,0);} 50%{transform:translate(-50%,-6px);} }
.ccn-tile {
  position:absolute; top:-48px; width:56px; height:38px; border-radius:10px; z-index:9;
  background:linear-gradient(180deg,#FFF3D0,#F4C542); border:3px solid var(--gold-deep);
  display:flex; align-items:center; justify-content:center; font-weight:700; color:#5a4408;
  font-size:14px; box-shadow:0 4px 0 rgba(0,0,0,.25); cursor:grab; touch-action:none;
  transform:translate(-50%,0);
}
.ccn-tile.dragging { cursor:grabbing; }
.ccn-drop1 { position:absolute; font-weight:700; color:var(--gold-deep); font-size:15px; pointer-events:none; z-index:8; animation:ccnRain .7s ease-in both; }
@keyframes ccnRain { 0%{transform:translate(0,0); opacity:1;} 100%{transform:translate(var(--rx,0px),46px); opacity:0;} }
.ccn-win { margin-top:4px; text-align:center; background:linear-gradient(180deg,#E9FBEF,#D3F3DF); border:3px solid var(--correct); border-radius:14px; padding:10px 14px; }
.ccn-win .wp { font-weight:700; color:#1d8f4e; font-size:16px; }
.ccn-win .wk { font-size:13px; color:#4d6b58; font-weight:500; margin-top:3px; }
`;

export default {
  id: 'written-methods',
  title: 'THE CARRY CANNON',

  mount(host, ctx) {
    injectCss('written-methods', CSS);
    let alive = true;
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'ccn-q');
    const qsub = el('div', 'ccn-qsub');
    const boardHost = el('div', 'ccn-boardhost');
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
    let mission = null; let state = null; let shown = null;
    let genToken = 0;
    let boardEl = null; let gutterRef = null; let colRefs = [];
    let colW = 70;
    let ballEl = null; let ballFlightCancel = null;
    let tileEl = null; let tileDrag = null; let tileTweenCancel = null;

    const colCenterX = (i) => colW * (1.5 + i);

    /* ---------- rendering ---------- */
    function paintColumn(i) {
      const col = state.cols[i]; const r = colRefs[i];
      const isSub = mission.type === 'sub';
      if (isSub && col.borrowedFrom) {
        r.a.innerHTML = `<span class="ccn-old">${col.a + 1}</span><span class="ccn-new">${col.a}</span>`;
      } else if (isSub && col.borrowedInto) {
        r.a.innerHTML = `<span class="ccn-carrymk">¹</span>${col.a}`;
      } else {
        r.a.textContent = String(col.a);
      }
      r.b.textContent = String(col.b);
      r.ans.textContent = col.written ? String(col.writeDigit) : '';
      if (!isSub) r.carry.textContent = col.carryIn ? '①' : '';
      r.wrap.classList.toggle('active', !state.done && !state.ball && i === state.activeIdx);
      r.wrap.classList.toggle('written', col.written);
      r.wrap.classList.toggle('dropzone', !!state.ball && state.ball.caught && state.ball.toIdx === i);
    }
    function paint() { state.cols.forEach((_, i) => paintColumn(i)); }

    function refreshMsg() {
      if (state.done) { qsub.textContent = ''; return; }
      if (mission.type === 'add') {
        if (state.ball) {
          qsub.textContent = state.ball.caught
            ? `Now DROP it on the ${THRONES[mission.heads[state.ball.toIdx]]} throne!`
            : 'CATCH the ① cannonball!';
        } else {
          qsub.textContent = `Tap the ${THRONES[mission.heads[state.activeIdx]]} throne to add it up.`;
        }
      } else if (state.needsBorrow) {
        const col = state.cols[state.activeIdx];
        qsub.textContent = `${col.a} take away ${col.b} won't work — drag a TEN from the ${THRONES[mission.heads[state.activeIdx - 1]]} throne!`;
      } else {
        qsub.textContent = `Tap the ${THRONES[mission.heads[state.activeIdx]]} throne.`;
      }
    }

    function afterEngineChange() {
      paint();
      if (state.done) onMissionDone(); else refreshMsg();
    }

    /* ---------- layout ---------- */
    function layout() {
      if (ballFlightCancel) { ballFlightCancel(); ballFlightCancel = null; if (state.ball) state.ball.caught = false; }
      if (tileTweenCancel) { tileTweenCancel(); tileTweenCancel = null; }
      if (tileDrag && tileDrag.dragging()) tileDrag.abort();
      const nCols = mission.heads.length + 1;
      const avail = Math.min(560, (host.clientWidth || 640) - 24);
      colW = Math.max(58, Math.min(100, Math.floor(avail / nCols)));
      boardEl.style.width = (colW * nCols) + 'px';
      boardEl.querySelectorAll('.ccn-head').forEach((h) => { h.style.width = colW + 'px'; });
      gutterRef.style.width = colW + 'px';
      colRefs.forEach((r) => { r.wrap.style.width = colW + 'px'; });
      if (ballEl && state.ball) { ballEl.style.left = colCenterX(state.ball.fromIdx) + 'px'; ballEl.classList.toggle('caught', state.ball.caught); }
      if (tileEl && state.needsBorrow) { tileEl.style.left = colCenterX(state.activeIdx - 1) + 'px'; tileEl.style.transform = 'translate(-50%,0)'; }
    }

    /* ---------- carry cannonball ---------- */
    function spawnBall() {
      ballEl = el('button', 'ccn-ball', '①');
      ballEl.style.left = colCenterX(state.ball.fromIdx) + 'px';
      ballEl.addEventListener('click', onBallClick);
      boardEl.querySelector('.ccn-body').append(ballEl);
    }
    function onBallClick() {
      if (!catchAddBall(state)) return;
      sfx.blip(880, 0.08, 0.17);
      ballEl.classList.add('caught');
      afterEngineChange();
    }
    function doDropBall(idx) {
      if (!ballEl || !state.ball) return;
      const myGen = genToken; const st = state; const captured = ballEl;
      const fromX = colCenterX(state.ball.fromIdx); const toX = colCenterX(idx);
      ballFlightCancel = tween((x) => { captured.style.left = x + 'px'; }, fromX, toX, 300, () => {
        ballFlightCancel = null;
        if (myGen !== genToken || st !== state) return;
        dropAddBall(state, idx);
        captured.remove();
        if (ballEl === captured) ballEl = null;
        sfx.drop();
        afterEngineChange();
      });
    }

    /* ---------- the ten-block borrow ---------- */
    function spawnTile() {
      tileEl = el('button', 'ccn-tile', 'TEN');
      const originX = colCenterX(state.activeIdx - 1);
      tileEl.style.left = originX + 'px';
      boardEl.querySelector('.ccn-body').append(tileEl);
      tileDrag = makeDrag(tileEl, {
        onStart() { tileEl.classList.add('dragging'); if (tileTweenCancel) { tileTweenCancel(); tileTweenCancel = null; } },
        onMove(dx, dy) { tileEl.style.transform = `translate(calc(-50% + ${dx}px), ${dy}px)`; },
        onEnd(dx) {
          tileEl.classList.remove('dragging');
          const targetX = colCenterX(state.activeIdx);
          const hit = Math.abs((originX + dx) - targetX) < colW * 0.65;
          if (hit) { commitBorrow(originX, dx); } else {
            const capturedTile = tileEl; const myGen = genToken; const st = state;
            tileTweenCancel = tween((v) => { capturedTile.style.transform = `translate(calc(-50% + ${v}px), 0px)`; }, dx, 0, 240, () => {
              tileTweenCancel = null;
              if (myGen !== genToken || st !== state) return;
              toast(stage, "Barry's ten slipped free — try dragging it onto the throne next door!");
            });
          }
        },
      });
    }
    function commitBorrow(originX, dx) {
      const fromIdx = state.activeIdx - 1; const toIdx = state.activeIdx;
      if (!applyBorrow(state, fromIdx, toIdx)) return;
      const rainX = originX + dx;
      rainOnes(rainX);
      sparkleBurst(boardEl.querySelector('.ccn-body'), rainX, -10, 8);
      sfx.sparkle();
      if (tileDrag) { tileDrag.destroy(); tileDrag = null; }
      if (tileEl) { tileEl.remove(); tileEl = null; }
      afterEngineChange();
    }
    function rainOnes(x) {
      const body = boardEl.querySelector('.ccn-body');
      for (let i = 0; i < 8; i += 1) {
        const s = el('span', 'ccn-drop1', '1');
        s.style.left = (x + (Math.random() * 30 - 15)) + 'px';
        s.style.top = '-14px';
        s.style.setProperty('--rx', ((Math.random() - 0.5) * 26) + 'px');
        s.style.animationDelay = (i * 0.03) + 's';
        body.append(s);
        later(() => s.remove(), 800 + i * 30);
      }
    }

    /* ---------- teaching bubbles (built ONLY from live state — never hardcoded) ---------- */
    function showCarryBubble() {
      const b = state.ball; const col = state.cols[b.fromIdx]; const myGen = genToken;
      later(() => {
        if (myGen !== genToken) return;
        bubble(stage, {
          title: 'CARRY LAUNCH! ①',
          text: `${col.a} + ${col.b}${col.carryIn ? ' + the carried <b>①</b>' : ''} = <b>${b.sum}</b>. Too big for one throne — write the <b>${col.writeDigit}</b>, and the leftover ten launches next door as a cannonball. CATCH it, then drop it on the throne to the left!`,
          img: BARRY_IMG,
        });
      }, 260);
    }
    function showBorrowBubble() {
      const col = state.cols[state.activeIdx]; const myGen = genToken;
      later(() => {
        if (myGen !== genToken) return;
        bubble(stage, {
          title: "BORROWIN' BARRY TIME! 🦵",
          text: `<b>${col.a}</b> take away <b>${col.b}</b> won't work — ${col.a} is too small! Borrowin' Barry's favourite trick: drag a <b>TEN</b> from the throne next door — carrying, running in reverse.`,
          img: BARRY_IMG,
        });
      }, 260);
    }

    /* ---------- taps ---------- */
    function wrongOrderFeedback(i) {
      sfx.nudge();
      const r = colRefs[i];
      if (r) {
        r.wrap.classList.remove('blocked'); void r.wrap.offsetWidth; r.wrap.classList.add('blocked');
        later(() => { if (r) r.wrap.classList.remove('blocked'); }, 480);
      }
      toast(stage, 'Work RIGHT TO LEFT — start with the throne next in the queue!');
    }
    function onColumnClick(i) {
      if (!state || state.done) return;
      if (state.ball) {
        if (state.ball.caught && i === state.ball.toIdx) doDropBall(i);
        else { sfx.nudge(); toast(stage, state.ball.caught ? 'Drop it on the throne right next door!' : 'CATCH the ① cannonball first!'); }
        return;
      }
      if (i !== state.activeIdx) { wrongOrderFeedback(i); return; }
      if (mission.type === 'add') {
        if (!tapAdd(state, i)) return;
        if (state.ball) {
          spawnBall(); sfx.tick(1);
          afterEngineChange();
          if (!shown.has('carry')) { shown.add('carry'); showCarryBubble(); }
          else toast(stage, '① another cannonball — catch it and drop it next door!');
        } else { sfx.pop(); afterEngineChange(); }
      } else {
        const wasNeeds = state.needsBorrow;
        if (!tapSub(state, i)) return;
        if (state.needsBorrow && !wasNeeds) {
          spawnTile(); sfx.nudge();
          afterEngineChange();
          if (!shown.has('borrow')) { shown.add('borrow'); showBorrowBubble(); }
          else toast(stage, 'Still need that TEN — drag it over from next door!');
        } else { sfx.pop(); afterEngineChange(); }
      }
    }

    /* ---------- board build ---------- */
    function buildBoard() {
      boardHost.innerHTML = '';
      colRefs = [];
      const heads = el('div', 'ccn-heads');
      heads.append(el('div', 'ccn-head'));
      mission.heads.forEach((h) => {
        const hd = el('div', 'ccn-head');
        hd.append(el('div', 'hb', h), el('div', 'hs', THRONES[h]));
        heads.append(hd);
      });
      const body = el('div', 'ccn-body');
      gutterRef = el('div', 'ccn-gutter');
      gutterRef.append(
        el('div', 'ccn-carry'), el('div', 'ccn-a'),
        el('div', 'ccn-b ccn-op', mission.type === 'add' ? '+' : '−'),
        el('div', 'ccn-rule'), el('div', 'ccn-ans'),
      );
      body.append(gutterRef);
      state.cols.forEach((c, i) => {
        const wrap = el('button', 'ccn-col');
        const carry = el('div', 'ccn-carry');
        const a = el('div', 'ccn-a');
        const b = el('div', 'ccn-b');
        const rule = el('div', 'ccn-rule');
        const ans = el('div', 'ccn-ans');
        wrap.append(carry, a, b, rule, ans);
        wrap.addEventListener('click', () => onColumnClick(i));
        body.append(wrap);
        colRefs.push({ wrap, carry, a, b, ans });
      });
      boardEl = el('div', 'ccn-board');
      boardEl.append(heads, body);
      boardHost.append(boardEl);
      layout();
      paint();
    }

    /* ---------- missions ---------- */
    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const label = m.type === 'add' ? `${m.a} + ${m.b}` : `${m.a} − ${m.b}`;
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), label);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
    }
    function onMissionDone() {
      doneSet.add(mission.id);
      sfx.win();
      party(stage);
      paintChips();
      qsub.textContent = '';
      winBox.innerHTML = '';
      const ansStr = state.cols.map((c) => c.writeDigit).join('');
      const eq = mission.type === 'add' ? `${mission.a} + ${mission.b} = ${ansStr}` : `${mission.a} − ${mission.b} = ${ansStr}`;
      const w = el('div', 'ccn-win', `<div class="wp">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]} &nbsp; ${eq}</div><div class="wk">${mission.worked}</div>`);
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
      mi = i;
      mission = MISSIONS[i];
      shown = new Set();
      winBox.innerHTML = '';
      if (ballFlightCancel) { ballFlightCancel(); ballFlightCancel = null; }
      if (tileTweenCancel) { tileTweenCancel(); tileTweenCancel = null; }
      if (tileDrag) { tileDrag.destroy(); tileDrag = null; }
      ballEl = null; tileEl = null;
      paintChips();
      q.innerHTML = mission.type === 'add' ? `${mission.a} + ${mission.b} = ?` : `${mission.a} − ${mission.b} = ?`;
      state = mission.type === 'add' ? makeAddState(mission.a, mission.b) : makeSubState(mission.a, mission.b);
      buildBoard();
      refreshMsg();
    }

    resetBtn.addEventListener('click', () => { sfx.ui(); start(mi); });

    const onResize = () => { if (boardEl) layout(); };
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
      if (ballFlightCancel) ballFlightCancel();
      if (tileTweenCancel) tileTweenCancel();
      if (tileDrag) tileDrag.destroy();
      stage.remove();
      ruleCard.remove();
    };
  },
};
