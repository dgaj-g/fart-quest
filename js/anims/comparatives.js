// FART QUEST — js/anims/comparatives.js
// THE -ER/-EST PODIUM — interactive comparative/superlative builder for the
// comparatives Scout Report (Grammar Grotto). Structure and interaction
// discipline follow decimals-x10.js / probability.js (the house reference
// implementations): drag-to-target chips, place/commit-then-react, tween()
// for anything read back, cancellable timers, full cleanup.

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const CREATURE_IMG = 'assets/monsters/the-goodest-boy.png';
const RULE = "Two things: -er (or 'more'). Three or more: -est (or 'most'). Never both at once — and it's fewer for things you can count.";
const FACT_SNEAK = 'Comparing TWO things needs -er or “more”; three or more needs -est or “most” — and you never use both endings on the same word, no matter how much this dog insists.';
const WEAPON_TAGLINE = 'Climb the right rung and you will never stack a crime again.';

/* ---------- pure comparative engine (unit-tested in scratch script — do not "improve") ---------- */
export function correctSuffixFor(n) { return n <= 2 ? 'ER' : 'EST'; }
export function correctPrefixFor(n) { return n <= 2 ? 'MORE' : 'MOST'; }
export function correctIrregularFor(n) { return n <= 2 ? 'BETTER' : 'BEST'; }

export function suffixOutcome(base, runnersNeed, runners, chipId) {
  const need = correctSuffixFor(runners);
  if (chipId !== need) {
    const msg = chipId === 'EST'
      ? `-EST needs a crowd of three! Right now it's <b>${runners}</b> racing — add another before -EST will click on.`
      : `-ER only compares two — you've got <b>${runners}</b> now! -EST is what clicks on with three or more.`;
    return { ok: false, msg };
  }
  return { ok: true, chipId, word: base + chipId, complete: runners === runnersNeed };
}

export function prefixOutcome(base, runnersNeed, runners, chipId) {
  const need = correctPrefixFor(runners);
  if (chipId !== need) {
    const msg = chipId === 'MOST'
      ? `MOST needs three or more — right now it's just <b>${runners}</b>!`
      : `MORE compares just two — you've got <b>${runners}</b> now, that needs MOST!`;
    return { ok: false, msg };
  }
  return { ok: true, chipId, word: `${chipId} ${base}`, complete: runners === runnersNeed };
}

export function irregularOutcome(runnersNeed, runners, chipId) {
  const need = correctIrregularFor(runners);
  if (chipId !== need) {
    const msg = chipId === 'BEST'
      ? `BEST needs three or more — right now it's <b>${runners}</b>! BETTER is the word for two.`
      : `BETTER only compares two — you've got <b>${runners}</b> now! BEST is the top rung for a crowd.`;
    return { ok: false, msg };
  }
  return { ok: true, chipId, word: chipId, complete: runners === runnersNeed };
}

export function crimesMatch(selected, wanted) {
  if (selected.length !== wanted.length) return false;
  const s = new Set(selected);
  return wanted.every((w) => s.has(w));
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
const SCENES = {
  dogs: [{ n: 'The Goodest Boy', e: '🐶' }, { n: 'Whiffbeard', e: '🦨' }, { n: 'Snailia', e: '🐌' }],
  paintings: [{ n: 'Sunset Swamp', e: '🖼️' }, { n: 'Mud Puddle Deluxe', e: '🎨' }],
  biscuits: [{ n: 'Ginger Snap', e: '🍪' }, { n: 'Choc Chip', e: '🍫' }, { n: 'Custard Cream', e: '🧁' }],
};

const MISSIONS = [
  {
    id: 'faster', kind: 'build', mode: 'suffix', scene: 'dogs', base: 'FAST', runnersNeed: 2,
    chip: 'TWO DOGS',
    q: 'Two racers on the track!',
    qsub: 'Drag the ending that fits onto FAST — then watch the winner get crowned.',
    worked: 'Two racers compared needs -er: FAST + ER = FASTER.',
  },
  {
    id: 'fastest', kind: 'build', mode: 'suffix', scene: 'dogs', base: 'FAST', runnersNeed: 3,
    chip: 'THREE DOGS',
    q: 'A crowd joins the race!',
    qsub: 'Tap + ADD A RACER, then drag the ending that fits a crowd of three.',
    worked: 'Three racers compared needs -est: FAST + EST = FASTEST.',
  },
  {
    id: 'beautiful', kind: 'build', mode: 'prefix', scene: 'paintings', base: 'BEAUTIFUL', runnersNeed: 2,
    chip: 'ART CONTEST',
    q: 'Judging the swamp art contest',
    qsub: 'BEAUTIFUL is a long word — drag the right card in FRONT of it.',
    worked: 'BEAUTIFUL is a long word comparing just two paintings — long words use MORE: MORE BEAUTIFUL.',
  },
  {
    id: 'better', kind: 'build', mode: 'irregular', scene: 'biscuits', base: 'GOOD', runnersNeed: 2,
    chip: 'BETTER ROUND',
    q: 'Biscuit judging begins!',
    qsub: "GOOD breaks every rule — its endings have melted away. Drag a golden card instead.",
    worked: 'GOOD breaks every rule: good → better → best. Two biscuits compared needs better.',
  },
  {
    id: 'best', kind: 'build', mode: 'irregular', scene: 'biscuits', base: 'GOOD', runnersNeed: 3,
    chip: 'BEST ROUND',
    q: 'A third biscuit enters!',
    qsub: "Tap + ADD A RACER, then find the top rung of GOOD's ladder.",
    worked: 'Comparing three biscuits needs the top of the irregular ladder: best.',
  },
  {
    id: 'poster', kind: 'crimes',
    chip: 'WANTED POSTER',
    q: 'WANTED: two crimes in one sentence',
    qsub: 'Tap every word doing something wrong, then tap CASE CLOSED.',
    worked: 'MOST + GOODEST stacks two comparing jobs on one word — and GOODEST was never a real word. Good breaks every rule: good → better → best.',
  },
];

const WANTED_TOKENS = ['I', 'am', 'the', 'most', 'goodest', 'dog', 'in', 'the', 'whole', 'swamp!'];
const WANTED_IDX = [3, 4]; // most, goodest
const WIN_PHRASES = ['PODIUM CLIMBED! 🏁', 'RUNG NAILED!', 'THE GOODEST BOY APPROVES! 🐶', 'CROWNED CORRECTLY!'];

/* ---------- the anim card ---------- */
export default {
  id: 'comparatives',
  title: 'THE -ER/-EST PODIUM',

  mount(host, ctx) {
    let alive = true;
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };
    const liveCancels = new Set();
    const chipCtrls = [];

    injectCss('comparatives', `
      .cep-q { text-align: center; font-weight: 700; font-size: clamp(17px, 2.8vw, 22px); margin-bottom: 2px; }
      .cep-qsub { text-align: center; font-size: 12.5px; color: #6b5744; font-weight: 500; margin-bottom: 10px; min-height: 16px; }
      .cep-scene { display: flex; gap: 14px; justify-content: center; align-items: flex-end; flex-wrap: wrap; margin: 6px 0 14px; min-height: 108px; }
      .cep-contestant { display: flex; flex-direction: column; align-items: center; gap: 2px; position: relative; animation: cepEnter .4s var(--spring) both; }
      @keyframes cepEnter { from { transform: scale(.4) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
      .cep-emo { font-size: 40px; line-height: 1; filter: drop-shadow(0 4px 4px rgba(0,0,0,.25)); }
      .cep-name { font-size: 10.5px; font-weight: 700; color: #7c6247; }
      .cep-ribbon { position: absolute; top: -14px; right: -10px; font-size: 22px; opacity: 0; transform: scale(.3) rotate(-20deg); }
      .cep-contestant.won .cep-ribbon { opacity: 1; animation: cepRibbonPop .5s var(--spring) both; }
      @keyframes cepRibbonPop { 0% { transform: scale(.2) rotate(-30deg); opacity: 0; } 70% { transform: scale(1.25) rotate(8deg); opacity: 1; } 100% { transform: scale(1) rotate(-8deg); } }
      .cep-stamp { font-size: 11px; font-weight: 700; color: var(--correct); min-height: 14px; letter-spacing: .03em; }
      .cep-addracer { align-self: center; background: transparent; border: 2.5px dashed rgba(51,38,29,.4); color: var(--ink); padding: 9px 14px; border-radius: 13px; font-size: 12.5px; font-weight: 700; min-height: 44px; cursor: pointer; }
      .cep-addracer:active { background: rgba(51,38,29,.08); }
      .cep-plate { display: flex; align-items: center; justify-content: center; gap: 6px; margin: 6px auto 14px; flex-wrap: wrap; }
      .cep-baseword { font-size: clamp(20px, 3.8vw, 30px); font-weight: 700; color: var(--ink); background: var(--card); border: 3px solid var(--ink); border-radius: 14px; padding: 8px 16px; box-shadow: 0 4px 0 rgba(51,38,29,.25); }
      .cep-baseword.cep-melting { border-style: dashed; opacity: .92; }
      .cep-baseword.filled { border-color: var(--correct); background: #E9FBEF; animation: cepPop .4s var(--spring) both; }
      @keyframes cepPop { 0% { transform: scale(.85); } 60% { transform: scale(1.08); } 100% { transform: scale(1); } }
      .cep-slot { min-width: 56px; min-height: 52px; display: flex; align-items: center; justify-content: center; font-size: clamp(18px, 3.4vw, 26px); font-weight: 700; color: #a08c74; background: rgba(255,255,255,.5); border: 3px dashed rgba(51,38,29,.35); border-radius: 14px; padding: 6px 10px; }
      .cep-slot.filled { color: var(--gold-deep); border-style: solid; border-color: var(--gold-deep); background: #FFF3D0; animation: cepPop .4s var(--spring) both; }
      .cep-slot.cep-toosmall { min-width: 30px; min-height: 30px; font-size: 12px; opacity: .5; }
      .cep-slot.wobble { animation: cepWobble .45s ease; }
      @keyframes cepWobble { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(-8deg); } 65% { transform: rotate(7deg); } }
      .cep-tray { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin: 4px 0 8px; touch-action: none; min-height: 56px; }
      .cep-chip { position: relative; background: var(--card); border: 3px solid var(--ink); border-radius: 999px; padding: 10px 18px; font-weight: 700; font-size: 15px; color: var(--ink); cursor: grab; box-shadow: 0 3px 0 rgba(51,38,29,.3); touch-action: none; -webkit-user-select: none; user-select: none; z-index: 4; }
      .cep-chip.dragging { cursor: grabbing; z-index: 9; box-shadow: 0 1px 0 rgba(0,0,0,.3); }
      .cep-chip.gold { background: linear-gradient(180deg,#FFF3CE,#FBE29A); border-color: var(--gold-deep); color: #5a4408; }
      .cep-chip.melted { opacity: .4; filter: grayscale(.5); border-style: dashed; cursor: default; transform: rotate(-3deg); }
      .cep-chip.melted::after { content: '💧'; position: absolute; right: -4px; bottom: -8px; font-size: 12px; }
      .cep-poster { text-align: center; position: relative; }
      .cep-poster img { width: 74px; filter: drop-shadow(0 5px 8px rgba(0,0,0,.3)); margin-bottom: 4px; }
      .cep-poster-title { font-weight: 700; font-size: 13px; letter-spacing: .08em; color: var(--wrong); margin-bottom: 8px; }
      .cep-sentence { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; margin: 10px auto; max-width: 600px; }
      .cep-word { background: var(--card); border: 2.5px solid rgba(51,38,29,.3); border-radius: 10px; padding: 7px 11px; font-weight: 700; font-size: 15px; cursor: pointer; box-shadow: 0 3px 0 rgba(51,38,29,.15); }
      .cep-word.sel { background: var(--gold); border-color: var(--gold-deep); }
      .cep-word.caught { background: #E9FBEF; border-color: var(--correct); color: #1d8f4e; }
      .cep-word.wobble { animation: cepWobble .45s ease; }
      .cep-stampoverlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; }
      .cep-stampoverlay .st { font-weight: 800; font-size: 26px; color: var(--correct); border: 5px solid var(--correct); border-radius: 10px; padding: 4px 18px; transform: rotate(-12deg) scale(0); opacity: 0; letter-spacing: .04em; background: rgba(255,255,255,.9); }
      .cep-stampoverlay.show .st { animation: cepStampSlam .4s ease-out forwards; }
      @keyframes cepStampSlam { 0% { transform: rotate(-12deg) scale(2.4); opacity: 0; } 60% { transform: rotate(-12deg) scale(.85); opacity: 1; } 100% { transform: rotate(-12deg) scale(1); opacity: 1; } }
      .cep-win { margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF); border: 3px solid var(--correct); border-radius: 14px; padding: 10px 14px; animation: animBubbleIn .34s var(--spring) both; }
      .cep-win .cw-title { font-weight: 700; color: #1d8f4e; font-size: 16px; }
      .cep-win .cw-line { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 2px; }
      .cep-win .cw-btn { margin-top: 8px; padding: 10px 22px; font-size: 15px; }
    `);

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const qEl = el('div', 'cep-q');
    const qsubEl = el('div', 'cep-qsub');
    const sceneRow = el('div', 'cep-scene');
    const plateEl = el('div', 'cep-plate');
    const trayEl = el('div', 'cep-tray');
    const posterWrap = el('div', 'cep-poster');
    const posterImg = el('img'); posterImg.src = CREATURE_IMG; posterImg.alt = '';
    const posterTitle = el('div', 'cep-poster-title', '🚨 WANTED FOR GRAMMAR CRIMES 🚨');
    const sentenceWrap = el('div', 'cep-sentence');
    const stampOverlay = el('div', 'cep-stampoverlay', '<div class="st">CASE CLOSED</div>');
    posterWrap.append(posterImg, posterTitle, sentenceWrap, stampOverlay);
    const winBox = el('div');
    const controls = el('div', 'anim-controls');
    const actionBtn = el('button', 'btn btn-gold', 'CASE CLOSED 🔍');
    const resetBtn = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(actionBtn, resetBtn);
    stage.append(chiprow, qEl, qsubEl, sceneRow, plateEl, trayEl, posterWrap, winBox, controls);
    host.append(stage);

    const ruleCard = el('div', 'goldcard', RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;text-align:center;';
    host.append(ruleCard);

    let mi = 0;
    let mission = MISSIONS[0];
    let runners = 2;
    let partialShown = false;
    let plateWordEl = null; let suffixSlotEl = null; let prefixSlotEl = null;
    let posterLocked = false; let posterAttempts = 0; let selected = new Set(); let tokenEls = [];

    /* ---------- chips / navigation ---------- */
    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), m.chip);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
    }
    function appendNextButton(container) {
      const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
      if (nextIdx !== -1) {
        const nb = el('button', 'btn btn-gold cw-btn', `NEXT: ${MISSIONS[nextIdx].chip} ➡`);
        nb.addEventListener('click', () => { sfx.ui(); start(nextIdx); });
        container.append(nb);
      } else {
        const nb = el('button', 'btn btn-gold cw-btn', 'PLAY IT AGAIN 🔁');
        nb.addEventListener('click', () => { sfx.ui(); doneSet.clear(); start(0); });
        container.append(nb);
        later(() => bubble(stage, {
          title: 'THE GOODEST BOY GRADUATES! 🎓',
          text: `${RULE} Every crime, caught. Every podium, correctly climbed.`,
          img: CREATURE_IMG,
        }), 500);
      }
    }

    /* ---------- scene (contestants) ---------- */
    function renderScene() {
      sceneRow.innerHTML = '';
      const arr = SCENES[mission.scene];
      for (let i = 0; i < runners; i += 1) {
        const c = arr[i];
        sceneRow.append(el('div', 'cep-contestant',
          `<div class="cep-emo">${c.e}</div><div class="cep-name">${c.n}</div><div class="cep-ribbon">🏆</div><div class="cep-stamp"></div>`));
      }
      if (runners < arr.length) {
        const add = el('button', 'cep-addracer', '+ ADD A RACER');
        add.addEventListener('click', onAddRacer);
        sceneRow.append(add);
      }
    }
    function onAddRacer() {
      if (!alive || mission.kind !== 'build') return;
      const arr = SCENES[mission.scene];
      if (runners >= arr.length) return;
      runners += 1;
      sfx.pop();
      partialShown = false;
      renderScene();
      renderPlate();
    }

    /* ---------- word plate ---------- */
    function renderPlate() {
      plateEl.innerHTML = '';
      suffixSlotEl = null; prefixSlotEl = null;
      if (mission.mode === 'prefix') {
        prefixSlotEl = el('div', 'cep-slot', '?');
        plateWordEl = el('div', 'cep-baseword', mission.base);
        const dummy = el('div', 'cep-slot cep-toosmall', '');
        plateEl.append(prefixSlotEl, plateWordEl, dummy);
      } else if (mission.mode === 'suffix') {
        plateWordEl = el('div', 'cep-baseword', mission.base);
        suffixSlotEl = el('div', 'cep-slot', '?');
        plateEl.append(plateWordEl, suffixSlotEl);
      } else {
        plateWordEl = el('div', 'cep-baseword cep-melting', mission.base);
        plateEl.append(plateWordEl);
      }
    }

    /* ---------- tray (draggable chips) ---------- */
    function wireChipDrag(chip) {
      const ctrl = makeDrag(chip.el, {
        enabled: () => alive && !chip.melted && mission.kind === 'build',
        onStart() { chip.el.classList.add('dragging'); },
        onMove(dx, dy) { chip.el.style.transform = `translate(${dx}px, ${dy}px)`; },
        onEnd(dx, dy) { chip.el.classList.remove('dragging'); handleChipDrop(chip, dx, dy); },
      });
      chipCtrls.push(ctrl);
    }
    function renderTray() {
      chipCtrls.forEach((c) => c.destroy()); chipCtrls.length = 0;
      trayEl.innerHTML = '';
      let defs;
      if (mission.mode === 'suffix') {
        defs = shuffle([{ id: 'ER', label: '-ER', kind: 'suffix' }, { id: 'EST', label: '-EST', kind: 'suffix' }]);
      } else if (mission.mode === 'prefix') {
        defs = shuffle([{ id: 'ER', label: '-ER', kind: 'suffix' }, { id: 'MORE', label: 'MORE', kind: 'prefix' }, { id: 'MOST', label: 'MOST', kind: 'prefix' }]);
      } else {
        defs = [
          { id: 'ER', label: '-ER', kind: 'suffix', melted: true },
          { id: 'EST', label: '-EST', kind: 'suffix', melted: true },
          ...shuffle([{ id: 'BETTER', label: 'BETTER', kind: 'whole', gold: true }, { id: 'BEST', label: 'BEST', kind: 'whole', gold: true }]),
        ];
      }
      defs.forEach((chip) => {
        const c = el('button', 'cep-chip' + (chip.gold ? ' gold' : '') + (chip.melted ? ' melted' : ''), chip.label);
        chip.el = c;
        trayEl.append(c);
        if (!chip.melted) wireChipDrag(chip);
      });
    }

    function bounceChip(chipEl, dx, dy) {
      const cancel = tween((v) => { chipEl.style.transform = `translate(${dx * v}px, ${dy * v}px)`; }, 1, 0, 240, () => { chipEl.style.transform = ''; liveCancels.delete(cancel); });
      liveCancels.add(cancel);
    }
    function wobbleZone(zoneEl) {
      zoneEl.classList.remove('wobble'); void zoneEl.offsetWidth; zoneEl.classList.add('wobble');
    }

    function handleChipDrop(chip, dx, dy) {
      if (!alive) return;
      if (mission.mode === 'prefix' && chip.kind === 'suffix') {
        bounceChip(chip.el, dx, dy);
        toast(stage, `${mission.base} is too long for a tiny ${chip.label} — long words like this use MORE or MOST instead!`);
        return;
      }
      const zoneEl = mission.mode === 'suffix' ? suffixSlotEl : mission.mode === 'prefix' ? prefixSlotEl : plateWordEl;
      const zr = zoneEl.getBoundingClientRect();
      const cr = chip.el.getBoundingClientRect();
      const cx = cr.left + cr.width / 2; const cy = cr.top + cr.height / 2;
      const over = cx >= zr.left - 12 && cx <= zr.right + 12 && cy >= zr.top - 16 && cy <= zr.bottom + 16;
      bounceChip(chip.el, dx, dy);
      if (!over) return;
      let outcome;
      if (mission.mode === 'suffix') outcome = suffixOutcome(mission.base, mission.runnersNeed, runners, chip.id);
      else if (mission.mode === 'prefix') outcome = prefixOutcome(mission.base, mission.runnersNeed, runners, chip.id);
      else outcome = irregularOutcome(mission.runnersNeed, runners, chip.id);
      if (!outcome.ok) {
        wobbleZone(zoneEl);
        sfx.nudge();
        toast(stage, outcome.msg);
        return;
      }
      applyBuild(outcome);
    }

    function applyBuild(outcome) {
      sfx.pop();
      if (mission.mode === 'suffix') {
        suffixSlotEl.textContent = '-' + outcome.chipId;
        suffixSlotEl.classList.remove('filled'); void suffixSlotEl.offsetWidth; suffixSlotEl.classList.add('filled');
      } else if (mission.mode === 'prefix') {
        prefixSlotEl.textContent = outcome.chipId;
        prefixSlotEl.classList.remove('filled'); void prefixSlotEl.offsetWidth; prefixSlotEl.classList.add('filled');
      } else {
        plateWordEl.classList.remove('cep-melting');
        plateWordEl.textContent = outcome.word;
        plateWordEl.classList.remove('filled'); void plateWordEl.offsetWidth; plateWordEl.classList.add('filled');
      }
      const pr = plateEl.getBoundingClientRect(); const sr = stage.getBoundingClientRect();
      sparkleBurst(stage, pr.left - sr.left + pr.width / 2, pr.top - sr.top + pr.height / 2, 8);
      if (outcome.complete) {
        winMission(outcome.word);
      } else {
        sfx.sparkle();
        if (!partialShown) {
          partialShown = true;
          const need = mission.runnersNeed;
          const guidance = runners < need
            ? `Tap <b>+ ADD A RACER</b> until there are ${need}, then build it again for the crowd.`
            : `Tap <b>↩ RESET</b> to bring it back down to ${need} — that's what this round needs.`;
          later(() => bubble(stage, {
            title: 'RIGHT FOR NOW! 🎉',
            text: `Spot on for <b>${runners}</b> — that's <b>${outcome.word.toUpperCase()}</b>! But this round wants exactly <b>${need}</b>. ${guidance}`,
            img: CREATURE_IMG,
          }), 250);
        }
      }
    }

    function winMission(word) {
      doneSet.add(mission.id);
      sfx.win(); party(stage);
      const lead = sceneRow.querySelector('.cep-contestant');
      if (lead) {
        lead.classList.add('won');
        const st = lead.querySelector('.cep-stamp'); if (st) st.textContent = word;
      }
      paintChips();
      winBox.innerHTML = '';
      const w = el('div', 'cep-win',
        `<div class="cw-title">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]}</div>`
        + `<div class="cw-line">${mission.worked}</div>`);
      winBox.append(w);
      appendNextButton(w);
      if (doneSet.size === MISSIONS.length) ctx.complete();
    }

    /* ---------- wanted poster (crime-spotting) ---------- */
    function renderPoster() {
      sentenceWrap.innerHTML = '';
      tokenEls = WANTED_TOKENS.map((word, idx) => {
        const t = el('span', 'cep-word', word);
        t.addEventListener('click', () => toggleWord(idx, t));
        sentenceWrap.append(t);
        return t;
      });
    }
    function toggleWord(idx, t) {
      if (!alive || posterLocked) return;
      if (selected.has(idx)) { selected.delete(idx); t.classList.remove('sel'); sfx.tock(); }
      else { selected.add(idx); t.classList.add('sel'); sfx.tick(); }
    }
    function checkPoster() {
      if (!alive || posterLocked) return;
      sfx.ui();
      const arr = Array.from(selected).sort((a, b) => a - b);
      if (crimesMatch(arr, WANTED_IDX)) {
        posterLocked = true;
        doneSet.add(mission.id);
        sfx.win(); party(stage);
        WANTED_IDX.forEach((i) => tokenEls[i].classList.add('caught'));
        stampOverlay.classList.add('show');
        paintChips();
        actionBtn.textContent = 'CASE CLOSED ✓'; actionBtn.disabled = true;
        winBox.innerHTML = '';
        const w = el('div', 'cep-win',
          `<div class="cw-title">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]}</div>`
          + `<div class="cw-line">${mission.worked}</div>`);
        winBox.append(w);
        appendNextButton(w);
        if (doneSet.size === MISSIONS.length) ctx.complete();
      } else {
        posterAttempts += 1;
        selected.forEach((i) => { tokenEls[i].classList.remove('wobble'); void tokenEls[i].offsetWidth; tokenEls[i].classList.add('wobble'); });
        sfx.nudge();
        let text = "Not every word you tapped is guilty — and one might still be hiding. Read the sentence again and adjust your taps.";
        if (posterAttempts >= 2) text += '<br><br>🐶 Psst: one word repeats an ending that was never real English, and another stacks a SECOND comparing word right on top of it.';
        bubble(stage, { title: 'CASE STILL OPEN 🔍', text, img: CREATURE_IMG });
      }
    }

    /* ---------- mission control ---------- */
    function start(i) {
      mi = i;
      mission = MISSIONS[i];
      winBox.innerHTML = '';
      chipCtrls.forEach((c) => c.destroy()); chipCtrls.length = 0;
      paintChips();
      qEl.textContent = mission.q;
      qsubEl.textContent = mission.qsub;
      if (mission.kind === 'crimes') {
        sceneRow.style.display = 'none'; plateEl.style.display = 'none'; trayEl.style.display = 'none';
        posterWrap.style.display = '';
        actionBtn.style.display = '';
        actionBtn.textContent = 'CASE CLOSED 🔍';
        actionBtn.disabled = false;
        posterLocked = false; posterAttempts = 0; selected = new Set();
        stampOverlay.classList.remove('show');
        renderPoster();
        return;
      }
      posterWrap.style.display = 'none';
      sceneRow.style.display = ''; plateEl.style.display = ''; trayEl.style.display = '';
      actionBtn.style.display = 'none';
      runners = 2;
      partialShown = false;
      renderScene();
      renderPlate();
      renderTray();
    }

    actionBtn.addEventListener('click', () => {
      if (!alive || mission.kind !== 'crimes' || posterLocked) return;
      checkPoster();
    });
    resetBtn.addEventListener('click', () => {
      if (!alive) return;
      sfx.ui();
      doneSet.delete(mission.id);
      start(mi);
    });

    function abortLive() {
      chipCtrls.forEach((c) => { if (c.dragging()) c.abort(); });
      trayEl.querySelectorAll('.cep-chip').forEach((c) => { c.style.transform = ''; c.classList.remove('dragging'); });
      liveCancels.forEach((c) => c()); liveCancels.clear();
    }
    const onResize = () => { if (alive) abortLive(); };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    start(0);
    later(() => bubble(stage, {
      title: 'THE -ER/-EST PODIUM 🏁',
      text: `${FACT_SNEAK} ${WEAPON_TAGLINE}`,
      img: CREATURE_IMG,
    }), 300);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      liveCancels.forEach((c) => c()); liveCancels.clear();
      chipCtrls.forEach((c) => c.destroy());
      stage.remove();
      ruleCard.remove();
    };
  },
};
