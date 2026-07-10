// FART QUEST — js/anims/sentence-parts.js
// PETE'S BLOCK TOWER — interactive building-block machine for the
// sentence-parts Scout Report (Paragraph Pass). A phrase alone is WOBBLY —
// it cannot stand until a WHO chip and a DOING chip snap onto it and fuse it
// into a whole sentence brick. Bricks then stack into a paragraph tower that
// only stays upright while every brick shares ONE idea.

import {
  el, sfx, tween, makeDrag, toast, bubble, party, injectCss,
} from './_kit.js';

const PETE_IMG = 'assets/monsters/paragraph-pete.png';
const RULE = 'Phrase = a few words; sentence = a complete thought with a verb; paragraph = sentences about one idea; chapter = paragraphs about one part of the story.';
const EXAMPLE = '"Under the old bridge" is only a phrase — but "Jarlath hid under the old bridge" is a whole sentence. Job = <b>complete</b>.';
const LADDER_SCROLL = '📜 THE SIZE LADDER: phrase → sentence → paragraph → chapter. Each block is built from smaller blocks below it.';
const FACT_SNEAK = 'A sentence is a COMPLETE thought with a subject and a verb — a paragraph is several sentences that all share ONE idea.';
const WIN_PHRASES = ['BUILT TO STAND! 🧱', "PETE APPROVES!", 'SOLID AS A BRICK!', 'JOB = COMPLETE! 💨'];

/* ---------- pure logic (every state proven in a scratch node script —
   30 assertions green — do not "improve" without re-running it) ---------- */
function rectOverlap(a, b) {
  const x = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const y = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return x * y;
}
function standDone(state) { return !!(state.who && state.doing); }
function sortAllCorrect(sel, cards) { return cards.every((c, i) => sel[i] === c.answer); }
function towerLeanDeg(inTower, bricks) {
  const off = bricks.filter((b) => inTower.has(b.id) && !b.onTopic).length;
  return Math.min(18, off * 9);
}
function towerWin(inTower, bricks) {
  return bricks.filter((b) => b.onTopic).every((b) => inTower.has(b.id))
    && bricks.filter((b) => !b.onTopic).every((b) => !inTower.has(b.id));
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
const STAND = {
  phrase: 'under the old bridge',
  chips: [
    { id: 'jarlath', text: 'Jarlath', slot: 'who' },
    { id: 'quickly', text: 'Quickly', slot: null, wrongMsg: '"Quickly" tells us HOW it happened — it doesn’t name a WHO.' },
    { id: 'hid', text: 'hid', slot: 'doing' },
    { id: 'muddy', text: 'muddy', slot: null, wrongMsg: '"Muddy" describes a thing — it doesn’t DO anything.' },
  ],
};
const SORT_CARDS = [
  { id: 'c1', text: 'Whiffbeard packed the kit bag.', answer: 'sentence' },
  { id: 'c2', text: 'Behind the old climbing frame.', answer: 'phrase' },
  { id: 'c3', text: 'The whistle blew twice.', answer: 'sentence' },
  { id: 'c4', text: 'Waiting nervously by the gate.', answer: 'phrase' },
];
const TOWER_IDEA = 'THE MATCH';
const TOWER_BRICKS = [
  { id: 'b1', text: 'Jarlath laced up his boots.', onTopic: true },
  { id: 'b2', text: 'The whistle blew for kick-off.', onTopic: true },
  { id: 'b3', text: 'Whiffbeard cheered from the sideline.', onTopic: true },
  { id: 'b4', text: 'My gran collects spoons.', onTopic: false },
  { id: 'b5', text: 'The kitchen smelled of toast.', onTopic: false },
];
const LADDER = [
  { id: 'phrase', label: 'PHRASE', order: 0, bars: 1 },
  { id: 'sentence', label: 'SENTENCE', order: 1, bars: 2 },
  { id: 'paragraph', label: 'PARAGRAPH', order: 2, bars: 3 },
  { id: 'chapter', label: 'CHAPTER', order: 3, bars: 4 },
];
const MISSIONS = [
  { id: 'stand', type: 'stand', label: 'MAKE IT STAND' },
  { id: 'sort', type: 'sort', label: 'SENTENCE OR PHRASE?' },
  { id: 'tower', type: 'tower', label: 'BUILD THE TOWER' },
  { id: 'ladder', type: 'ladder', label: 'SIZE LADDER RECAP' },
];

const CSS = `
.pbt-q { text-align: center; font-weight: 700; font-size: clamp(18px, 3vw, 25px); margin-bottom: 2px; color: var(--ink); }
.pbt-qsub { text-align: center; font-size: 12.5px; color: #6b5744; font-weight: 500; margin-bottom: 10px; min-height: 16px; }
.pbt-boardhost { display: flex; flex-direction: column; align-items: center; gap: 4px; }

/* mission 1: stand */
.pbt-standboard { width: 100%; max-width: 620px; }
.pbt-assembly { display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.pbt-socket {
  min-width: 74px; min-height: 44px; display: flex; align-items: center; justify-content: center;
  border: 3px dashed rgba(51,38,29,.35); border-radius: 12px; background: var(--card);
  font-weight: 700; font-size: 15px; color: var(--ink); padding: 6px 12px;
}
.pbt-socket .pbt-placeholder { color: #a08c74; font-size: 11px; letter-spacing: .06em; }
.pbt-socket.filled { border-style: solid; border-color: var(--correct); color: #1d8f4e; }
.pbt-socket.shake { animation: pbtShake .4s ease; }
.pbt-phrase {
  min-height: 44px; display: flex; align-items: center; justify-content: center;
  border: 3px solid var(--swamp-mid); border-radius: 12px; background: var(--swamp-mid);
  color: var(--stink-lime); font-weight: 700; font-size: 15px; padding: 6px 16px;
}
.pbt-phrase.wobbly { animation: pbtWobble 1.7s ease-in-out infinite; }
.pbt-phrase.stands { animation: pbtStandIn .4s var(--spring) both; border-color: var(--gold-deep); background: var(--gold); color: #5a4408; }
.pbt-phrase.stands::after { content: '.'; }
@keyframes pbtWobble { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
@keyframes pbtStandIn { 0% { transform: scale(1.12,.85) rotate(0); } 60% { transform: scale(.96,1.06); } 100% { transform: scale(1,1); } }
@keyframes pbtShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 70% { transform: translateX(5px); } }
.pbt-tray { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; padding: 8px 4px; }
.pbt-chip {
  touch-action: none; -webkit-user-select: none; user-select: none; cursor: grab;
  background: var(--card); border: 2.5px solid var(--swamp-mid); color: var(--ink);
  border-radius: 999px; padding: 10px 18px; font-weight: 700; font-size: 15px;
  min-height: 44px; box-shadow: 0 3px 0 rgba(0,0,0,.2);
}
.pbt-chip.dragging { z-index: 40; cursor: grabbing; box-shadow: 0 8px 14px rgba(0,0,0,.35); }

/* mission 2: sort */
.pbt-cardgrid { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; max-width: 640px; }
.pbt-card {
  width: clamp(180px, 42vw, 260px); background: var(--card); border: 3px solid rgba(51,38,29,.16);
  border-radius: 14px; padding: 12px; box-shadow: 0 3px 0 rgba(0,0,0,.15);
}
.pbt-card.locked { border-color: var(--correct); }
.pbt-card.wrong { animation: pbtShake .4s ease; }
.pbt-cardtext { font-weight: 700; font-size: 14.5px; color: var(--ink); margin-bottom: 8px; min-height: 40px; }
.pbt-cardbtns { display: flex; gap: 6px; }
.pbt-cardbtn {
  flex: 1 1 0; background: transparent; border: 2px solid var(--swamp-mid); color: var(--ink);
  border-radius: 9px; padding: 7px 4px; font-weight: 700; font-size: 11px; min-height: 44px;
}
.pbt-cardbtn.chosen { background: var(--swamp-mid); color: var(--stink-lime); }
.pbt-card.locked .pbt-cardbtn.chosen { background: var(--correct); color: #08331a; border-color: var(--correct); }
.pbt-card.locked .pbt-cardbtn { pointer-events: none; }

/* mission 3: tower */
.pbt-towerwrap { display: flex; flex-direction: column; align-items: center; margin-bottom: 10px; }
.pbt-flag {
  background: var(--gold); color: #5a4408; font-weight: 700; font-size: 13px; padding: 6px 16px;
  border-radius: 999px; box-shadow: 0 3px 0 rgba(0,0,0,.2); margin-bottom: 6px;
}
.pbt-tower {
  display: flex; flex-direction: column-reverse; align-items: center; gap: 4px; min-height: 40px;
  min-width: 220px; padding: 8px; border-radius: 10px; transform-origin: bottom center;
}
.pbt-towerbrick {
  width: 100%; max-width: 260px; background: var(--card); border: 2.5px solid var(--swamp-mid);
  border-radius: 9px; padding: 7px 12px; font-weight: 700; font-size: 13px; color: var(--ink);
  cursor: pointer; box-shadow: 0 2px 0 rgba(0,0,0,.2); min-height: 44px;
}
.pbt-towerbrick.off { border-color: var(--wrong); background: #FBEAE7; color: #9c3626; }
.pbt-bricktray { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 6px; max-width: 640px; }
.pbt-brick {
  background: var(--card); border: 2.5px solid var(--swamp-mid); color: var(--ink); border-radius: 12px;
  padding: 9px 14px; font-weight: 700; font-size: 13px; min-height: 44px; box-shadow: 0 3px 0 rgba(0,0,0,.2);
}
.pbt-brick.used { opacity: .35; box-shadow: none; }

/* mission 4: ladder */
.pbt-ladderbuilt { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; min-height: 34px; margin-bottom: 10px; }
.pbt-ladtag {
  background: var(--swamp-mid); color: var(--stink-lime); font-weight: 700; font-size: 12px;
  padding: 6px 12px; border-radius: 999px; animation: pbtStandIn .3s var(--spring) both;
}
.pbt-laddertray { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.pbt-ladchip {
  display: flex; flex-direction: column; align-items: center; gap: 3px; background: var(--card);
  border: 2.5px solid var(--swamp-mid); color: var(--ink); border-radius: 12px; padding: 9px 14px;
  font-weight: 700; font-size: 12px; min-height: 44px; box-shadow: 0 3px 0 rgba(0,0,0,.2);
}
.pbt-ladchip .pbt-bars { color: var(--stink); letter-spacing: 1px; font-size: 13px; }
.pbt-ladchip.placed { opacity: .35; box-shadow: none; }
.pbt-ladchip.shake { animation: pbtShake .4s ease; }

.pbt-win {
  margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF);
  border: 3px solid var(--correct); border-radius: 14px; padding: 10px 14px;
  animation: pbtStandIn .34s var(--spring) both;
}
.pbt-win .pw-line { font-weight: 700; color: #1d8f4e; font-size: 16px; }
.pbt-win .pw-worked { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 2px; }
`;

/* ---------- the anim card ---------- */
export default {
  id: 'sentence-parts',
  title: "PETE'S BLOCK TOWER",

  mount(host, ctx) {
    injectCss('sentence-parts', CSS);
    let alive = true;
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };
    const activeDrags = []; const activeCancels = [];
    function clearActive() {
      activeDrags.forEach((d) => d && d.destroy()); activeDrags.length = 0;
      activeCancels.forEach((c) => c && c()); activeCancels.length = 0;
    }

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'pbt-q');
    const qsub = el('div', 'pbt-qsub');
    const boardHost = el('div', 'pbt-boardhost');
    const winBox = el('div');
    const controls = el('div', 'anim-controls');
    const actionBtn = el('button', 'btn btn-gold', '');
    const resetBtn = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(actionBtn, resetBtn);
    stage.append(chiprow, q, qsub, boardHost, winBox, controls);
    host.append(stage);

    const ruleCard = el('div', 'goldcard', RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;';
    host.append(ruleCard);

    let mi = 0;
    const doneSet = new Set();
    let mission = null;
    let standState = null;
    let sortSel = null;
    let towerSet = null; let towerDone = false;
    let ladderBuilt = null; let ladderAttempts = 0;

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), m.label);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
    }

    function onMissionDone(worked) {
      doneSet.add(mission.id);
      paintChips();
      winBox.innerHTML = '';
      const w = el('div', 'pbt-win',
        `<div class="pw-line">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]}</div><div class="pw-worked">${worked}</div>`);
      winBox.append(w);
      const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
      if (nextIdx !== -1) {
        const nb = el('button', 'btn btn-gold', 'NEXT ONE ➡');
        nb.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
        nb.addEventListener('click', () => { sfx.ui(); start(nextIdx); });
        w.append(nb);
      }
      if (doneSet.size === MISSIONS.length) {
        ctx.complete();
        later(() => {
          if (alive) bubble(stage, { title: 'BUILDER MASTER! 🧱', text: `${LADDER_SCROLL}<br><br>${FACT_SNEAK}`, img: PETE_IMG });
        }, 500);
      }
    }

    /* ===== mission 1: STAND ===== */
    function springBack(chipEl, cx, cy) {
      activeCancels.push(tween((k) => { chipEl.style.transform = `translate(${cx * (1 - k)}px, ${cy * (1 - k)}px)`; }, 0, 1, 220, () => { chipEl.style.transform = ''; }));
    }
    function landInSocket(chipEl, socketEl, cx, cy, done) {
      const cr = chipEl.getBoundingClientRect(); const sr = socketEl.getBoundingClientRect();
      const dx = (sr.left + sr.width / 2) - (cr.left + cr.width / 2);
      const dy = (sr.top + sr.height / 2) - (cr.top + cr.height / 2);
      const fx = cx + dx; const fy = cy + dy;
      activeCancels.push(tween((k) => { chipEl.style.transform = `translate(${cx + (fx - cx) * k}px, ${cy + (fy - cy) * k}px)`; }, 0, 1, 240, done));
    }
    function buildStand() {
      boardHost.innerHTML = '';
      standState = { who: null, doing: null };
      const board = el('div', 'pbt-standboard');
      const row = el('div', 'pbt-assembly');
      const whoSocket = el('div', 'pbt-socket', '<span class="pbt-placeholder">WHO?</span>');
      const doingSocket = el('div', 'pbt-socket', '<span class="pbt-placeholder">DOING?</span>');
      const phraseCard = el('div', 'pbt-phrase wobbly', STAND.phrase);
      row.append(whoSocket, doingSocket, phraseCard);
      const tray = el('div', 'pbt-tray');
      board.append(row, tray);
      boardHost.append(board);
      shuffle(STAND.chips).forEach((chip) => {
        const chipEl = el('button', 'pbt-chip', chip.text);
        chipEl.type = 'button';
        tray.append(chipEl);
        let cx = 0; let cy = 0;
        let locked = false;
        const drag = makeDrag(chipEl, {
          enabled: () => !locked,
          onStart() { chipEl.classList.add('dragging'); },
          onMove(dx, dy) { cx = dx; cy = dy; chipEl.style.transform = `translate(${dx}px, ${dy}px)`; },
          onEnd() {
            chipEl.classList.remove('dragging');
            const chipRect = chipEl.getBoundingClientRect();
            const overWho = rectOverlap(chipRect, whoSocket.getBoundingClientRect());
            const overDo = rectOverlap(chipRect, doingSocket.getBoundingClientRect());
            if (overWho === 0 && overDo === 0) { springBack(chipEl, cx, cy); return; }
            const target = overWho >= overDo ? 'who' : 'doing';
            const targetEl = target === 'who' ? whoSocket : doingSocket;
            if (chip.slot === target) {
              locked = true;
              chipEl.style.pointerEvents = 'none';
              landInSocket(chipEl, targetEl, cx, cy, () => {
                chipEl.style.display = 'none';
                targetEl.innerHTML = chipEl.textContent;
                targetEl.classList.add('filled');
                standState[target] = chip.id;
                sfx.pop();
                if (standDone(standState)) standWin(phraseCard);
              });
            } else {
              const msg = chip.slot ? `"${chip.text}" is a ${chip.slot.toUpperCase()} word — try the other socket.` : chip.wrongMsg;
              sfx.nudge(); toast(stage, msg);
              targetEl.classList.remove('shake'); void targetEl.offsetWidth; targetEl.classList.add('shake');
              springBack(chipEl, cx, cy);
            }
          },
        });
        activeDrags.push(drag);
      });
      q.textContent = `Make "${STAND.phrase}" stand`;
      qsub.textContent = 'Drag a WHO chip and a DOING chip into the sockets.';
      actionBtn.style.display = 'none';
    }
    function standWin(phraseCard) {
      phraseCard.classList.remove('wobbly');
      phraseCard.classList.add('stands');
      sfx.win(); party(stage);
      qsub.textContent = '';
      later(() => { if (alive) bubble(stage, { title: 'IT STANDS! 🧱', text: EXAMPLE, img: PETE_IMG }); }, 300);
      onMissionDone('Jarlath hid under the old bridge. — a WHO and a DOING turned a wobbly phrase into a whole sentence.');
    }

    /* ===== mission 2: SORT ===== */
    function buildSort() {
      boardHost.innerHTML = '';
      sortSel = new Array(SORT_CARDS.length).fill(null);
      const grid = el('div', 'pbt-cardgrid');
      shuffle(SORT_CARDS.map((c, i) => i)).forEach((idx) => {
        const c = SORT_CARDS[idx];
        const card = el('div', 'pbt-card');
        card.dataset.idx = String(idx);
        const txt = el('div', 'pbt-cardtext', c.text);
        const btns = el('div', 'pbt-cardbtns');
        const sBtn = el('button', 'pbt-cardbtn', 'SENTENCE');
        const pBtn = el('button', 'pbt-cardbtn', 'PHRASE');
        sBtn.type = 'button'; pBtn.type = 'button';
        sBtn.addEventListener('click', () => pickSort(idx, 'sentence', card, sBtn, pBtn));
        pBtn.addEventListener('click', () => pickSort(idx, 'phrase', card, pBtn, sBtn));
        btns.append(sBtn, pBtn);
        card.append(txt, btns);
        grid.append(card);
      });
      boardHost.append(grid);
      q.textContent = 'Sentence, or just a phrase?';
      qsub.textContent = 'Tap SENTENCE or PHRASE under every card, then check them all.';
      actionBtn.textContent = 'CHECK IT! 💨';
      actionBtn.style.display = '';
      actionBtn.onclick = checkSort;
    }
    function pickSort(idx, val, card, onBtn, offBtn) {
      if (card.classList.contains('locked')) return;
      sfx.ui();
      sortSel[idx] = val;
      onBtn.classList.add('chosen'); offBtn.classList.remove('chosen');
      card.classList.remove('wrong');
    }
    function checkSort() {
      if (sortSel.some((s) => s === null)) { sfx.nudge(); toast(stage, 'Give every card a bin before you check!'); return; }
      sfx.ui();
      let allOk = true;
      boardHost.querySelectorAll('.pbt-card').forEach((card) => {
        const idx = Number(card.dataset.idx);
        if (sortSel[idx] === SORT_CARDS[idx].answer) { card.classList.add('locked'); card.classList.remove('wrong'); } else {
          allOk = false;
          card.classList.remove('wrong'); void card.offsetWidth; card.classList.add('wrong');
        }
      });
      if (allOk) {
        sfx.win(); party(stage);
        actionBtn.style.display = 'none';
        onMissionDone('Every SENTENCE names a WHO and finishes with a DOING; every PHRASE leaves you asking "who?" or "so what happened?"');
      } else {
        const rightNow = sortSel.filter((s, i) => s === SORT_CARDS[i].answer).length;
        toast(stage, `${rightNow} out of ${SORT_CARDS.length} sorted right — the shaking ones need another look!`);
      }
    }

    /* ===== mission 3: TOWER ===== */
    function buildTower() {
      boardHost.innerHTML = '';
      towerSet = new Set(); towerDone = false;
      const wrap = el('div', 'pbt-towerwrap');
      const flag = el('div', 'pbt-flag', `🏆 ${TOWER_IDEA}`);
      const towerEl = el('div', 'pbt-tower');
      wrap.append(flag, towerEl);
      const tray = el('div', 'pbt-bricktray');
      shuffle(TOWER_BRICKS.map((b, i) => i)).forEach((idx) => {
        const b = TOWER_BRICKS[idx];
        const btn = el('button', 'pbt-brick', b.text);
        btn.type = 'button';
        btn.addEventListener('click', () => addBrick(idx, btn, towerEl));
        tray.append(btn);
      });
      boardHost.append(wrap, tray);
      q.textContent = 'Stack a tower about THE MATCH';
      qsub.textContent = 'Tap a brick to add it — only bricks about THE MATCH keep the tower standing straight.';
      actionBtn.style.display = 'none';
    }
    function addBrick(idx, btn, towerEl) {
      if (towerSet.has(idx) || btn.disabled) return;
      sfx.ui();
      towerSet.add(idx);
      btn.classList.add('used'); btn.disabled = true;
      const b = TOWER_BRICKS[idx];
      const tile = el('div', 'pbt-towerbrick' + (b.onTopic ? '' : ' off'), b.text);
      tile.addEventListener('click', () => removeBrick(idx, btn, tile, towerEl));
      towerEl.prepend(tile);
      refreshTower(towerEl, b, true);
    }
    function removeBrick(idx, btn, tile, towerEl) {
      sfx.tock();
      towerSet.delete(idx);
      btn.classList.remove('used'); btn.disabled = false;
      tile.remove();
      refreshTower(towerEl, TOWER_BRICKS[idx], false);
    }
    function refreshTower(towerEl, brick, added) {
      const deg = towerLeanDeg(towerSet, TOWER_BRICKS);
      towerEl.style.transform = `rotate(${deg}deg)`;
      if (added && !brick.onTopic) toast(stage, `"${brick.text}" isn’t about THE MATCH — feel the tower lean? Tap it to pull it back out.`);
      if (!towerDone && towerWin(towerSet, TOWER_BRICKS)) {
        towerDone = true;
        sfx.win(); party(stage);
        qsub.textContent = '';
        onMissionDone('Three bricks, one idea — THE MATCH — and the tower stood tall.');
      }
    }

    /* ===== mission 4: LADDER ===== */
    function buildLadder() {
      boardHost.innerHTML = '';
      ladderBuilt = []; ladderAttempts = 0;
      const built = el('div', 'pbt-ladderbuilt');
      const tray = el('div', 'pbt-laddertray');
      shuffle(LADDER.map((l, i) => i)).forEach((idx) => {
        const l = LADDER[idx];
        const btn = el('button', 'pbt-ladchip', `<span class="pbt-bars">${'▮'.repeat(l.bars)}</span><span>${l.label}</span>`);
        btn.type = 'button';
        btn.addEventListener('click', () => tapLadder(idx, btn, built));
        tray.append(btn);
      });
      boardHost.append(built, tray);
      q.textContent = 'Rebuild the size ladder';
      qsub.textContent = 'Tap the blocks in order — smallest to biggest.';
      actionBtn.style.display = 'none';
    }
    function tapLadder(idx, btn, built) {
      if (btn.disabled) return;
      const l = LADDER[idx];
      if (l.order === ladderBuilt.length) {
        sfx.tick(ladderBuilt.length);
        btn.disabled = true; btn.classList.add('placed');
        ladderBuilt.push(idx);
        built.append(el('div', 'pbt-ladtag', l.label));
        if (ladderBuilt.length === LADDER.length) {
          sfx.win(); party(stage);
          qsub.textContent = '';
          onMissionDone('phrase → sentence → paragraph → chapter — every block built from a few of the one below it.');
        }
      } else {
        ladderAttempts += 1;
        sfx.nudge();
        btn.classList.remove('shake'); void btn.offsetWidth; btn.classList.add('shake');
        let msg = "Not that one yet — check what’s already in the ladder.";
        if (ladderAttempts >= 3) msg += ` Psst: the order is ${LADDER.map((x) => x.label.toLowerCase()).join(' → ')}.`;
        toast(stage, msg);
      }
    }

    /* ===== mission flow ===== */
    function start(i) {
      clearActive();
      mi = i; mission = MISSIONS[i];
      winBox.innerHTML = '';
      actionBtn.onclick = null; actionBtn.style.display = 'none';
      paintChips();
      if (mission.type === 'stand') buildStand();
      else if (mission.type === 'sort') buildSort();
      else if (mission.type === 'tower') buildTower();
      else buildLadder();
    }
    resetBtn.addEventListener('click', () => { sfx.ui(); start(mi); });

    const onResize = () => { if (alive && mission) start(mi); };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    start(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      clearActive();
      stage.remove();
      ruleCard.remove();
    };
  },
};
