// FART QUEST — js/anims/probability.js
// THE MAYBE LEDGE WASHING LINE — interactive likelihood-line machine for the
// probability Scout Report (Data Dump). Structure and interaction discipline
// follow decimals-x10.js / change-coins.js (the house reference implementations).

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const MARVIN_IMG = 'assets/monsters/maybe-marvin.png';
const RULE = 'Impossible–unlikely–evens–likely–certain. For dice: wanted outcomes out of six.';

/* ---------- pure line/chance engine (unit-tested in scratch script — do not "improve") ---------- */
export const ZONES = [
  { id: 'impossible', label: 'IMPOSSIBLE' },
  { id: 'unlikely', label: 'UNLIKELY' },
  { id: 'evens', label: 'EVENS' },
  { id: 'likely', label: 'LIKELY' },
  { id: 'certain', label: 'CERTAIN' },
];
export function zoneIndexOf(id) { return ZONES.findIndex((z) => z.id === id); }
export function zoneIndexForPercent(pct) { return Math.max(0, Math.min(4, Math.floor(pct / 20))); }
export function zoneIndexForDropX(dropX, lineWidth) { return zoneIndexForPercent((dropX / lineWidth) * 100); }
// Dedicated zone mapping for "wanted out of total" dice counts — unlike the peg line's
// equal-fifths zoneIndexForPercent(), only 0/total is truly IMPOSSIBLE and only total/total
// is truly CERTAIN; the four in-between counts split unlikely/evens/likely around half.
export function diceZoneIndex(count, total) {
  if (count <= 0) return 0;
  if (count >= total) return 4;
  const half = total / 2;
  if (count < half) return 1;
  if (count > half) return 3;
  return 2;
}
export function pegCorrect(targetId, zoneIdx) { return zoneIndexOf(targetId) === zoneIdx; }
export function chancePercent(count, total) { return (count / total) * 100; }
export function chipLabel(count, total) { return `${count} out of ${total}`; }
export function diceMatch(selected, wanted) {
  if (selected.length !== wanted.length) return false;
  const s = new Set(selected);
  return wanted.every((w) => s.has(w));
}

/* ---------- content ---------- */
const CARDS = [
  { id: 'morning', text: 'Tomorrow has a morning', target: 'certain' },
  { id: 'roll7', text: 'Roll a 7 on one dice', target: 'impossible' },
  { id: 'coin', text: 'A fair coin lands on heads', target: 'evens' },
  { id: 'redbag', text: 'Pull a red from a bag of 9 red + 1 blue', target: 'likely' },
];
const DICE_MISSIONS = [
  { id: 'even', kind: 'dice', label: 'EVEN?', q: 'Tap every face that is an <b>EVEN</b> number.', wanted: [2, 4, 6] },
  { id: 'gt4', kind: 'dice', label: 'MORE THAN 4?', q: 'Tap every face that is <b>MORE THAN 4</b>.', wanted: [5, 6] },
  { id: 'lt7', kind: 'dice', label: 'LESS THAN 7?', q: 'Tap every face that is <b>LESS THAN 7</b>.', wanted: [1, 2, 3, 4, 5, 6] },
];
const MISSIONS = [{ id: 'pegs', kind: 'peg', label: 'PEG THE LINE' }, ...DICE_MISSIONS];
const FACE_GLYPH = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
const WIN_PHRASES = ['LINE READ! 🧭', 'CHANCE NAILED!', 'MARVIN AGREES (RARE)!', 'PEG-FECT!'];
const WRONG_TEXT = {
  even: [
    'Not quite — walk round the deck and check EVERY face again: does it split into two equal piles with none left over?',
    'The Chance Compass says: EVEN numbers split perfectly into pairs. Check every single face, not just a couple.',
  ],
  gt4: [
    'Not quite — read every face against the number 4 again.',
    'Remember: 4 itself is NOT more than 4 — only faces that beat it count.',
  ],
  lt7: [
    'Not quite — this dice only goes up to 6. Check every face against 7.',
    'Is there a single face on this dice that reaches 7? Look at all six before you decide.',
  ],
};

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CARD_W = 128;
const CARD_SPACING = 140;

/* ---------- the anim card ---------- */
export default {
  id: 'probability',
  title: 'THE MAYBE LEDGE WASHING LINE',

  mount(host, ctx) {
    let alive = true;
    const doneSet = new Set();
    // Tracks whether the peg mission has EVER been solved, independent of doneSet('pegs'),
    // so resetting the pegs mission after a dice mission is already done doesn't re-lock
    // that dice mission's chip (doneSet('pegs') gets cleared on reset; this flag doesn't).
    let pegsEverSolved = false;
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };
    const liveCancels = new Set();

    injectCss('probability', `
      .mwl-q { text-align: center; font-weight: 700; font-size: clamp(16px, 2.8vw, 21px); margin-bottom: 2px; }
      .mwl-qsub { text-align: center; font-size: 12.5px; color: #6b5744; font-weight: 500; margin-bottom: 8px; min-height: 16px; }
      .mwl-barwrap { margin: 40px auto 4px; position: relative; }
      .mwl-bar { position: relative; margin: 0 auto; height: 176px; border-radius: 16px; touch-action: none; overflow: visible; }
      .mwl-zonebg { position: absolute; inset: 0; display: flex; border-radius: 16px; overflow: hidden; box-shadow: inset 0 3px 8px rgba(51,38,29,.2); }
      .mwl-zone { flex: 1; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 6px; font-weight: 700; font-size: 9.5px; letter-spacing: .03em; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,.35); box-shadow: inset 0 0 0 0 rgba(255,255,255,0); transition: box-shadow .25s; }
      .mwl-zone:nth-child(1) { background: var(--wrong); }
      .mwl-zone:nth-child(2) { background: #E08A3C; }
      .mwl-zone:nth-child(3) { background: var(--gold-deep); color: #3a2c07; text-shadow: none; }
      .mwl-zone:nth-child(4) { background: #6FAF3C; }
      .mwl-zone:nth-child(5) { background: var(--correct); }
      .mwl-zone.active { box-shadow: inset 0 0 0 3px #fff, 0 0 16px rgba(255,255,255,.65); }
      .mwl-rope { position: absolute; left: 6px; right: 6px; top: 28px; height: 3px; z-index: 2; border-radius: 3px; background: repeating-linear-gradient(90deg, #8a6d3b 0 10px, #6b5227 10px 20px); }
      .mwl-marvin { position: absolute; top: -30px; width: 50px; transform: translateX(-50%); z-index: 3; pointer-events: none; filter: drop-shadow(0 4px 6px rgba(0,0,0,.35)); animation: mwlSway 2.6s ease-in-out infinite; }
      @keyframes mwlSway { 0%, 100% { transform: translateX(-50%) rotate(-6deg); } 50% { transform: translateX(-50%) rotate(6deg); } }
      .mwl-pointer { position: absolute; top: 29px; font-size: 26px; transform: translate(-50%, -50%); z-index: 5; pointer-events: none; opacity: 0; transition: opacity .3s; filter: drop-shadow(0 3px 4px rgba(0,0,0,.35)); }
      .mwl-card { position: relative; width: ${CARD_W}px; min-height: 58px; background: var(--card); border: 3px solid var(--ink); border-radius: 12px; padding: 9px 8px 6px; font-weight: 700; font-size: 11.5px; line-height: 1.25; text-align: center; cursor: grab; box-shadow: 0 3px 0 rgba(51,38,29,.3); touch-action: none; -webkit-user-select: none; user-select: none; z-index: 4; }
      .mwl-card.on-line { position: absolute; top: 48px; }
      .mwl-card.dragging { cursor: grabbing; z-index: 9; box-shadow: 0 1px 0 rgba(0,0,0,.3); }
      .mwl-card .mwl-peg { position: absolute; top: -11px; left: 50%; transform: translateX(-50%); font-size: 16px; }
      .mwl-card.locked { border-color: var(--correct); background: #E9FBEF; }
      .mwl-card.flap { animation: mwlFlap .6s ease; }
      @keyframes mwlFlap { 0%, 100% { transform: rotate(0); } 20% { transform: rotate(-9deg); } 45% { transform: rotate(7deg); } 70% { transform: rotate(-5deg); } }
      .mwl-tray { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin: 12px 0 4px; touch-action: none; min-height: 62px; }
      .mwl-dice { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin: 14px 0 8px; }
      .mwl-face { width: 62px; height: 72px; border-radius: 14px; background: var(--card); border: 3px solid var(--ink); display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 3px 0 rgba(51,38,29,.3); -webkit-user-select: none; user-select: none; }
      .mwl-face .fg { font-size: 28px; line-height: 1; }
      .mwl-face .fn { font-size: 10px; font-weight: 700; color: #7c6247; margin-top: 3px; }
      .mwl-face.selected { background: var(--gold); border-color: var(--gold-deep); }
      .mwl-face.selected .fn { color: var(--ink); }
      .mwl-face.locked { opacity: .85; cursor: default; }
      .mwl-face.wobble { animation: mwlWobble .4s ease; }
      @keyframes mwlWobble { 0%, 100% { transform: rotate(0); } 30% { transform: rotate(-8deg); } 65% { transform: rotate(6deg); } }
      .mwl-chipwrap { text-align: center; margin-bottom: 4px; }
      .mwl-chipline { display: inline-block; text-align: center; font-weight: 700; font-size: 13.5px; color: #5a4408; background: linear-gradient(180deg,#FFF3CE,#FBE29A); border: 2.5px solid var(--gold-deep); border-radius: 12px; padding: 7px 14px; }
      .mwl-chipline b { color: var(--stink); }
      .mwl-win { margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF); border: 3px solid var(--correct); border-radius: 14px; padding: 10px 14px; animation: animBubbleIn .34s var(--spring) both; }
      .mwl-win .mw-title { font-weight: 700; color: #1d8f4e; font-size: 16px; }
      .mwl-win .mw-line { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 2px; }
      .mwl-win .mw-line b { color: #1d8f4e; }
      .mwl-win .mw-btn { margin-top: 8px; padding: 10px 22px; font-size: 15px; }
    `);

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const qEl = el('div', 'mwl-q');
    const subEl = el('div', 'mwl-qsub');
    const barWrap = el('div', 'mwl-barwrap');
    const lineBar = el('div', 'mwl-bar');
    const zonebg = el('div', 'mwl-zonebg');
    ZONES.forEach((z) => zonebg.append(el('div', 'mwl-zone', z.label)));
    const zoneEls = Array.from(zonebg.children);
    const rope = el('div', 'mwl-rope');
    const marvinEl = el('img', 'mwl-marvin');
    marvinEl.src = MARVIN_IMG; marvinEl.alt = '';
    const pointerEl = el('div', 'mwl-pointer', '🧭');
    lineBar.append(zonebg, rope, marvinEl, pointerEl);
    barWrap.append(lineBar);
    const trayEl = el('div', 'mwl-tray');
    const diceEl = el('div', 'mwl-dice');
    const chipWrap = el('div', 'mwl-chipwrap');
    const chipEl = el('div', 'mwl-chipline');
    chipWrap.append(chipEl);
    const winBox = el('div');
    const controls = el('div', 'anim-controls');
    const actionBtn = el('button', 'btn btn-gold', 'CHECK PEGS 🧷');
    const resetBtn = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(actionBtn, resetBtn);
    stage.append(chiprow, qEl, subEl, barWrap, trayEl, diceEl, chipWrap, winBox, controls);
    host.append(stage);

    const ruleCard = el('div', 'goldcard', RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;text-align:center;';
    host.append(ruleCard);

    let mi = 0;
    const cards = shuffle(CARDS).map((c) => ({ ...c, el: null, placedZone: null, locked: false, x: 0, cancelTween: null }));
    const cardDrags = [];
    let activeCardEl = null;
    const lineGeom = { width: 300, zoneW: 60 };
    let pointerCancel = null;
    let pointerX = 0;

    let selectedFaces = new Set();
    let diceLocked = false;
    let diceAttempts = 0;
    const faceEls = [];

    function zoneCenter(zi) { return zi * lineGeom.zoneW + lineGeom.zoneW / 2; }

    /* ---------- peg cards ---------- */
    function buildCard(card) {
      const c = el('div', 'mwl-card', `<span class="mwl-peg">📌</span>${card.text}`);
      card.el = c;
      wireCardDrag(card);
      return c;
    }
    function wireCardDrag(card) {
      const ctrl = makeDrag(card.el, {
        enabled: () => alive && mi === 0 && !card.locked,
        onStart() {
          if (card.cancelTween) { card.cancelTween(); card.cancelTween = null; }
          card.el.classList.add('dragging');
          activeCardEl = card.el;
        },
        onMove(dx, dy) { card.el.style.transform = `translate(${dx}px, ${dy}px)`; },
        onEnd(dx, dy) {
          card.el.classList.remove('dragging');
          activeCardEl = null;
          handleCardDrop(card, dx, dy);
        },
      });
      cardDrags.push({ ctrl, card });
    }
    function handleCardDrop(card, dx, dy) {
      if (!alive) return;
      const barRect = lineBar.getBoundingClientRect();
      const cardRect = card.el.getBoundingClientRect();
      const cx = cardRect.left + cardRect.width / 2;
      const cy = cardRect.top + cardRect.height / 2;
      const overBar = cx >= barRect.left - 10 && cx <= barRect.right + 10 && cy >= barRect.top - 30 && cy <= barRect.bottom + 30;
      if (!overBar) { bounceCard(card, dx, dy); return; }
      const dropX = Math.max(0, Math.min(lineGeom.width, cx - barRect.left));
      const zoneIdx = zoneIndexForDropX(dropX, lineGeom.width);
      card.el.style.transform = '';
      placeCard(card, zoneIdx);
    }
    function bounceCard(card, dx, dy) {
      const cancel = tween((v) => { card.el.style.transform = `translate(${dx * v}px, ${dy * v}px)`; }, 1, 0, 240, () => { card.el.style.transform = ''; liveCancels.delete(cancel); });
      liveCancels.add(cancel);
    }
    function placeCard(card, zoneIdx, instant) {
      const firstTime = card.placedZone === null;
      const oldZone = card.placedZone;
      card.placedZone = zoneIdx;
      if (firstTime) {
        card.el.classList.add('on-line');
        card.el.style.left = '0px';
        lineBar.append(card.el);
      }
      if (!instant) sfx.pop();
      if (oldZone !== null && oldZone !== zoneIdx) relayoutZone(oldZone, instant);
      relayoutZone(zoneIdx, instant);
      updateActionBtn();
    }
    function relayoutZone(zoneIdx, instant) {
      const occupants = cards.filter((c) => c.placedZone === zoneIdx);
      const cx = zoneCenter(zoneIdx);
      const startOffset = -((occupants.length - 1) * CARD_SPACING) / 2;
      occupants.forEach((c, i) => {
        const targetX = cx + startOffset + i * CARD_SPACING - CARD_W / 2;
        moveCardTo(c, targetX, instant);
      });
    }
    function moveCardTo(card, x, instant) {
      if (card.cancelTween) { card.cancelTween(); card.cancelTween = null; }
      if (instant || !card.el.isConnected || card.x === undefined) {
        card.x = x; card.el.style.left = x + 'px'; return;
      }
      const from = card.x;
      card.cancelTween = tween((v) => { card.x = v; card.el.style.left = v + 'px'; }, from, x, 260, () => { card.cancelTween = null; });
    }
    function lockCardVisual(card) {
      card.locked = true;
      card.el.classList.add('locked');
      const r = card.el.getBoundingClientRect();
      const barR = lineBar.getBoundingClientRect();
      sparkleBurst(lineBar, r.left - barR.left + r.width / 2, r.top - barR.top + r.height / 2, 7);
      sfx.sparkle();
    }
    function flapCard(card) {
      card.el.classList.remove('flap'); void card.el.offsetWidth; card.el.classList.add('flap');
      const id = setTimeout(() => { timers.delete(id); if (alive) card.el.classList.remove('flap'); }, 650);
      timers.add(id);
    }
    function resetPegs() {
      cards.forEach((c) => {
        if (c.cancelTween) { c.cancelTween(); c.cancelTween = null; }
        c.placedZone = null; c.locked = false; c.x = undefined;
        c.el.classList.remove('locked', 'flap', 'dragging', 'on-line');
        c.el.style.left = ''; c.el.style.transform = '';
      });
      trayEl.innerHTML = '';
      cards.forEach((c) => trayEl.append(c.el));
      doneSet.delete('pegs');
    }
    function checkPegs() {
      if (trayEl.children.length > 0 || !alive) return;
      sfx.ui();
      let allCorrect = true;
      cards.forEach((c) => {
        if (pegCorrect(c.target, c.placedZone)) {
          if (!c.locked) lockCardVisual(c);
        } else {
          allCorrect = false;
          flapCard(c);
        }
      });
      if (allCorrect) pegWin(); else toast(stage, 'Some pegs have slipped off the line — nudge the flapping ones and check again!');
      updateActionBtn();
    }
    function pegWin() {
      doneSet.add('pegs');
      pegsEverSolved = true;
      sfx.win(); party(stage);
      paintChips();
      winBox.innerHTML = '';
      const w = el('div', 'mwl-win',
        '<div class="mw-title">LINE PEGGED! 🧷</div>'
        + '<div class="mw-line">Every card found its spot on the Likelihood Line.</div>');
      winBox.append(w);
      appendNextButton(w);
      if (doneSet.size === MISSIONS.length) ctx.complete();
    }

    /* ---------- dice deck ---------- */
    function buildFace(n) {
      const f = el('div', 'mwl-face', `<span class="fg">${FACE_GLYPH[n]}</span><span class="fn">${n}</span>`);
      const rec = { n, el: f };
      f.addEventListener('click', () => toggleFace(rec));
      faceEls.push(rec);
      return f;
    }
    function toggleFace(rec) {
      if (!alive || diceLocked || MISSIONS[mi].kind !== 'dice') return;
      const has = selectedFaces.has(rec.n);
      if (has) { selectedFaces.delete(rec.n); sfx.tock(); } else { selectedFaces.add(rec.n); sfx.tick(); }
      rec.el.classList.toggle('selected', !has);
      updatePointer(false);
    }
    function updatePointer(instant) {
      const count = selectedFaces.size;
      const pct = chancePercent(count, 6);
      const x = (pct / 100) * lineGeom.width;
      if (pointerCancel) { pointerCancel(); pointerCancel = null; }
      if (instant) { pointerX = x; pointerEl.style.left = x + 'px'; } else {
        pointerCancel = tween((v) => { pointerX = v; pointerEl.style.left = v + 'px'; }, pointerX, x, 260, () => { pointerCancel = null; });
      }
      chipEl.innerHTML = `Chance so far: <b>${chipLabel(count, 6)}</b>`;
      const liveZoneIdx = diceZoneIndex(count, 6);
      zoneEls.forEach((z, i) => z.classList.toggle('active', i === liveZoneIdx && MISSIONS[mi].kind === 'dice'));
    }
    function lockDice(missionDef) {
      if (!alive || diceLocked) return;
      sfx.ui();
      const selectedArr = Array.from(selectedFaces).sort((a, b) => a - b);
      const ok = diceMatch(selectedArr, missionDef.wanted);
      if (ok) {
        diceLocked = true;
        doneSet.add(missionDef.id);
        sfx.win(); party(stage);
        faceEls.forEach((f) => f.el.classList.add('locked'));
        paintChips();
        updateActionBtn();
        diceWin(missionDef, selectedArr.length);
        if (missionDef.id === 'even') {
          later(() => bubble(stage, {
            title: 'THE CHANCE COMPASS AGREES! 🧭',
            text: 'The Chance Compass: "Chance of rolling an EVEN number on a fair dice numbered 1–6: the evens are 2, 4, 6 → <b>3 out of 6</b> (that’s the same as evens!)."',
            img: MARVIN_IMG,
          }), 500);
        }
        if (doneSet.size === MISSIONS.length) ctx.complete();
      } else {
        diceAttempts += 1;
        sfx.nudge();
        faceEls.forEach((f) => { if (f.el.classList.contains('selected')) { f.el.classList.remove('wobble'); void f.el.offsetWidth; f.el.classList.add('wobble'); } });
        const id = setTimeout(() => { timers.delete(id); if (alive) faceEls.forEach((f) => f.el.classList.remove('wobble')); }, 450);
        timers.add(id);
        let text = WRONG_TEXT[missionDef.id][0];
        if (diceAttempts >= 2) text += '<br><br>' + WRONG_TEXT[missionDef.id][1];
        bubble(stage, { title: 'CHECK THE DECK! 🎲', text, img: MARVIN_IMG });
      }
    }
    function diceWin(missionDef, count) {
      winBox.innerHTML = '';
      const zoneLabel = ZONES[diceZoneIndex(count, 6)].label;
      const phrase = WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)];
      const w = el('div', 'mwl-win',
        `<div class="mw-title">${phrase}</div>`
        + `<div class="mw-line">${chipLabel(count, 6)} → the compass lands on <b>${zoneLabel}</b></div>`);
      winBox.append(w);
      appendNextButton(w);
    }

    /* ---------- chips / navigation ---------- */
    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const locked = m.kind === 'dice' && !pegsEverSolved;
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), (locked ? '🔒 ' : '') + m.label);
        c.addEventListener('click', () => {
          if (locked) { sfx.nudge(); toast(stage, 'Peg the Likelihood Line first!'); return; }
          sfx.ui(); start(i);
        });
        chiprow.append(c);
      });
    }
    function appendNextButton(container) {
      const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
      if (nextIdx !== -1) {
        const nb = el('button', 'btn btn-gold mw-btn', `NEXT: ${MISSIONS[nextIdx].label} ➡`);
        nb.addEventListener('click', () => { sfx.ui(); start(nextIdx); });
        container.append(nb);
      } else {
        const nb = el('button', 'btn btn-gold mw-btn', 'PLAY IT AGAIN 🔁');
        nb.addEventListener('click', () => {
          sfx.ui(); doneSet.clear(); pegsEverSolved = false; resetPegs(); start(0);
        });
        container.append(nb);
      }
    }
    function updateActionBtn() {
      const cur = MISSIONS[mi];
      if (cur.kind === 'peg') {
        actionBtn.textContent = doneSet.has('pegs') ? 'ALL PEGGED ✓' : 'CHECK PEGS 🧷';
        actionBtn.disabled = doneSet.has('pegs') || trayEl.children.length > 0;
      } else {
        actionBtn.textContent = diceLocked ? 'LOCKED IN ✓' : 'LOCK IT IN 💨';
        actionBtn.disabled = diceLocked;
      }
    }
    function start(i) {
      mi = i;
      const cur = MISSIONS[i];
      winBox.innerHTML = '';
      paintChips();
      if (cur.kind === 'peg') {
        qEl.textContent = 'Peg every card onto the Likelihood Line!';
        subEl.textContent = 'Drag each card to where it belongs, then press CHECK PEGS.';
        trayEl.style.display = ''; diceEl.style.display = 'none'; chipWrap.style.display = 'none';
        pointerEl.style.opacity = '0';
        zoneEls.forEach((z) => z.classList.remove('active'));
      } else {
        qEl.innerHTML = cur.q;
        subEl.textContent = 'Tap the faces, then LOCK IT IN.';
        trayEl.style.display = 'none'; diceEl.style.display = ''; chipWrap.style.display = '';
        pointerEl.style.opacity = '1';
        diceLocked = false; diceAttempts = 0; selectedFaces = new Set();
        faceEls.forEach((f) => f.el.classList.remove('selected', 'locked', 'wobble'));
        updatePointer(true);
      }
      updateActionBtn();
    }

    /* ---------- assemble ---------- */
    cards.forEach((c) => trayEl.append(buildCard(c)));
    for (let n = 1; n <= 6; n += 1) diceEl.append(buildFace(n));

    actionBtn.addEventListener('click', () => {
      if (!alive) return;
      const cur = MISSIONS[mi];
      if (cur.kind === 'peg') checkPegs(); else lockDice(cur);
    });
    resetBtn.addEventListener('click', () => {
      if (!alive) return;
      sfx.ui();
      const cur = MISSIONS[mi];
      if (cur.kind === 'peg') { resetPegs(); winBox.innerHTML = ''; paintChips(); }
      else {
        diceLocked = false; diceAttempts = 0; selectedFaces = new Set();
        faceEls.forEach((f) => f.el.classList.remove('selected', 'locked', 'wobble'));
        doneSet.delete(cur.id);
        winBox.innerHTML = ''; paintChips();
        updatePointer(true);
      }
      updateActionBtn();
    });

    function layout() {
      cardDrags.forEach(({ ctrl }) => { if (ctrl.dragging()) ctrl.abort(); });
      if (activeCardEl) { activeCardEl.style.transform = ''; activeCardEl.classList.remove('dragging'); activeCardEl = null; }
      cards.forEach((c) => { if (c.cancelTween) { c.cancelTween(); c.cancelTween = null; } });
      if (pointerCancel) { pointerCancel(); pointerCancel = null; }
      const w = Math.min(860, Math.max(280, (stage.clientWidth || host.clientWidth || 700) - 24));
      lineGeom.width = w;
      lineGeom.zoneW = w / 5;
      lineBar.style.width = w + 'px';
      marvinEl.style.left = zoneCenter(2) + 'px';
      for (let zi = 0; zi < 5; zi += 1) relayoutZone(zi, true);
      updatePointer(true);
    }

    const onResize = () => { if (alive) layout(); };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    layout();
    start(0);
    later(() => bubble(stage, {
      title: 'THE MAYBE LEDGE 🧭',
      text: 'Poor Marvin has never once finished a decision: heads or tails, left or right, sprouts or no sprouts — he just shrugs. He lives EXACTLY halfway along the Likelihood Line, which is extremely on-brand. Every chance sits somewhere between IMPOSSIBLE and CERTAIN — and slap in the middle sits EVENS, the fifty-fifty spot. Peg each card where it belongs!',
      img: MARVIN_IMG,
    }), 300);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      liveCancels.forEach((c) => c()); liveCancels.clear();
      cards.forEach((c) => { if (c.cancelTween) c.cancelTween(); });
      if (pointerCancel) pointerCancel();
      cardDrags.forEach(({ ctrl }) => ctrl.destroy());
      stage.remove();
      ruleCard.remove();
    };
  },
};
