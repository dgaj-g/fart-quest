// FART QUEST — js/anims/speech-brackets.js
// THE AIR-QUOTER'S HUG — interactive speech-mark/bracket placement machine for
// the speech-brackets Scout Report. Structure and interaction discipline follow
// decimals-x10.js / rounding.js (the house reference implementations).

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const AIRQ_IMG = 'assets/monsters/the-air-quoter.png';
const RULE = 'Speech marks hug ONLY the spoken words — and the punctuation stays inside the hug.';

/* ---------- pure hug engine (unit-tested in scratch script — do not "improve") ---------- */
function computeBounds(tokens) {
  const firstInside = tokens.findIndex((t) => t.inside);
  let lastInside = -1;
  for (let i = tokens.length - 1; i >= 0; i -= 1) { if (tokens[i].inside) { lastInside = i; break; } }
  return { correctOpen: firstInside, correctClose: lastInside + 1 };
}
function joinSpan(toks) {
  let s = '';
  toks.forEach((t, i) => { if (i > 0 && t.kind !== 'punct') s += ' '; s += t.text; });
  return s;
}
function diagnose(mission, openGap, closeGap) {
  const { tokens, correctOpen, correctClose } = mission;
  if (openGap === correctOpen && closeGap === correctClose) return { win: true };
  let openIssue = null;
  if (openGap !== correctOpen) {
    if (openGap < correctOpen) openIssue = { type: 'open-early', words: joinSpan(tokens.slice(openGap, correctOpen)) };
    else openIssue = { type: 'open-late', words: joinSpan(tokens.slice(correctOpen, openGap)) };
  }
  let closeIssue = null;
  if (closeGap !== correctClose) {
    if (closeGap > correctClose) closeIssue = { type: 'close-late', words: joinSpan(tokens.slice(correctClose, closeGap)) };
    else {
      const missedToks = tokens.slice(closeGap, correctClose);
      closeIssue = { type: 'close-early', words: joinSpan(missedToks), punctOnly: missedToks.length === 1 && missedToks[0].kind === 'punct' };
    }
  }
  return { win: false, openIssue, closeIssue };
}
function issueRange(mission, st, issue) {
  if (issue.type === 'open-early') return [st.openGap, mission.correctOpen, 'aqh-wriggle'];
  if (issue.type === 'open-late') return [mission.correctOpen, st.openGap, 'aqh-beckon'];
  if (issue.type === 'close-late') return [mission.correctClose, st.closeGap, 'aqh-wriggle'];
  return [st.closeGap, mission.correctClose, issue.punctOnly ? 'aqh-shiver' : 'aqh-beckon'];
}
function issueText(mission, issue) {
  const bracket = mission.kind === 'bracket';
  if (issue.type === 'open-early') {
    return bracket
      ? `"${issue.words}" is part of the MAIN sentence — slide the front bracket forward so it only wraps the extra detail.`
      : `"${issue.words}" ${issue.words.trim().includes(' ') ? "weren't" : "wasn't"} actually said out loud — slide the front arm forward so the hug starts exactly where the speech begins.`;
  }
  if (issue.type === 'open-late') {
    return bracket
      ? `You're leaving out "${issue.words}" from the extra bit — slide the front bracket back to catch it.`
      : `You're leaving out "${issue.words}" from the start — the hug has to begin right at the very first spoken word.`;
  }
  if (issue.type === 'close-late') {
    return bracket
      ? `"${issue.words}" wriggles free — that's back in the main sentence, not the extra bit.`
      : `"${issue.words}" wriggles free of the hug — that's the reporting clause. It was never spoken aloud.`;
  }
  if (issue.punctOnly) return `The "${issue.words}" is shivering outside the hug! It's part of what was said, so it must stay INSIDE, right before the closing mark.`;
  return bracket
    ? `Not quite enough — "${issue.words}" is still part of the extra detail. Slide the back bracket further along.`
    : `Not quite enough — "${issue.words}" is still part of what was said. Pull the back arm further along.`;
}

/* ---------- content ---------- */
const w = (t) => ({ text: t, kind: 'word', inside: false });
const p = (t) => ({ text: t, kind: 'punct', inside: false });
function mark(toks, from, to) { toks.forEach((t, i) => { if (i >= from && i < to) t.inside = true; }); return toks; }

const MISSIONS = [
  {
    id: 'a', kind: 'hug', chip: 'THE SHOUT', armGlyphs: ['“', '”'],
    prompt: 'Hug ONLY the words Maya heard shouted.',
    sub: 'Drag both arms into place — remember, the punctuation stays inside the hug!',
    tokens: mark([w('Watch'), w('out'), p(','), w('that'), w('puddle'), w('is'), w('deep'), p('!'), w('warned'), w('Maya'), p('.')], 0, 8),
    worked: 'The hug wraps "Watch out, that puddle is deep!" — every spoken word AND the "!" that belongs to it. "warned Maya." stays outside — Maya never said that about herself.',
  },
  {
    id: 'b', kind: 'hug', chip: 'THE WHISPER', armGlyphs: ['“', '”'],
    prompt: 'Hug ONLY the words Maya whispered.',
    sub: 'See the comma after "whispered"? That sits BEFORE the hug even starts.',
    spotlightIdx: 2,
    tokens: mark([w('Maya'), w('whispered'), p(','), w('The'), w('geese'), w('are'), w('watching'), w('us'), p('.')], 3, 9),
    worked: 'The comma after "whispered" comes BEFORE the hug — then "The geese are watching us." is hugged complete, full stop and all, because that’s exactly what Maya whispered.',
  },
  {
    id: 'c', kind: 'bracket', chip: 'THE BRACKETS', armGlyphs: ['(', ')'],
    prompt: 'Bracket ONLY the extra bit you could remove.',
    sub: 'Brackets hug EXTRA detail — the sentence must still work without it.',
    tokens: mark([w('My'), w('brother'), w('who'), w('is'), w('seven'), w('ate'), w('the'), w('whole'), w('pie'), p('.')], 2, 5),
    worked: 'The brackets hug the extra detail — "(who is seven)" — and if you lift it out, "My brother ate the whole pie." still reads perfectly. That proves it was only EXTRA information.',
  },
];
MISSIONS.forEach((m) => { Object.assign(m, computeBounds(m.tokens)); m.liftText = joinSpan(m.tokens.filter((t) => !t.inside)); });
const WIN_PHRASES = ['HUGGED PERFECTLY! \u{1F917}', 'THE AIR-QUOTER APPROVES!', 'NOTHING ESCAPED! ✨', 'A PERFECT PAIR OF ARMS!'];

const CSS = `
.aqh-q { text-align: center; font-weight: 700; font-size: clamp(17px, 2.8vw, 22px); margin-bottom: 2px; }
.aqh-qsub { text-align: center; font-size: 12.5px; color: #6b5744; font-weight: 500; margin-bottom: 12px; min-height: 16px; }
.aqh-benchwrap {
  position: relative; margin: 0 auto; max-width: 100%; padding: 46px 14px 16px; border-radius: 16px;
  background: linear-gradient(180deg,#efe1c4,#e8d7b4); box-shadow: inset 0 3px 8px rgba(51,38,29,.18);
  overflow: visible; touch-action: none;
}
.aqh-bench { position: relative; display: flex; flex-wrap: nowrap; align-items: baseline; justify-content: center; gap: 7px; }
.aqh-tok { font-size: 15px; font-weight: 600; color: var(--ink); white-space: nowrap; padding: 2px 1px; position: relative; }
.aqh-tok.punct { font-weight: 700; color: #6b5744; margin-left: -7px; }
.aqh-tok.aqh-spot { background: rgba(244,197,66,.35); border-radius: 6px; box-shadow: 0 0 0 2px var(--gold-deep); animation: aqhSpotPulse 1.6s ease-in-out infinite; }
@keyframes aqhSpotPulse { 0%,100% { box-shadow: 0 0 0 2px var(--gold-deep); } 50% { box-shadow: 0 0 0 5px rgba(244,197,66,.22); } }
.aqh-tok.aqh-wriggle { animation: aqhWriggle .6s ease; color: var(--wrong); }
@keyframes aqhWriggle { 0%,100% { transform: translateY(0) rotate(0); } 20% { transform: translateY(-3px) rotate(-7deg); } 40% { transform: translateY(0) rotate(6deg); } 60% { transform: translateY(-2px) rotate(-5deg); } 80% { transform: translateY(0) rotate(3deg); } }
.aqh-tok.aqh-shiver { animation: aqhShiver .5s ease; color: var(--wrong); }
@keyframes aqhShiver { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-3px); } 40% { transform: translateX(3px); } 60% { transform: translateX(-2px); } 80% { transform: translateX(2px); } }
.aqh-tok.aqh-beckon { animation: aqhBeckon .6s ease; color: var(--gold-deep); }
@keyframes aqhBeckon { 0%,100% { transform: scale(1); } 50% { transform: scale(1.22); } }
.aqh-tok.aqh-lifted { opacity: .25; transform: translateY(-10px); }
.aqh-hugzone { position: absolute; top: 4px; bottom: 4px; border-radius: 10px; background: rgba(155,89,208,.16); border: 2px dashed rgba(155,89,208,.5); pointer-events: none; z-index: 1; }
.aqh-arm {
  position: absolute; top: -40px; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center;
  background: none; border: none; padding: 2px 12px; cursor: grab; touch-action: none; z-index: 5;
  -webkit-user-select: none; user-select: none;
}
.aqh-arm:active, .aqh-arm.dragging { cursor: grabbing; filter: drop-shadow(0 6px 8px rgba(0,0,0,.3)); }
.aqh-armglyph { font-size: 36px; font-weight: 800; line-height: 1; color: var(--stink); text-shadow: 0 2px 0 rgba(0,0,0,.15); }
.aqh-arm.aqh-close .aqh-armglyph { color: #6b3fa0; }
.aqh-armstem { width: 3px; height: 20px; background: var(--stink); border-radius: 2px; margin-top: -2px; }
.aqh-arm.aqh-close .aqh-armstem { background: #6b3fa0; }
.aqh-arm.aqh-selected .aqh-armglyph { box-shadow: 0 0 0 3px rgba(244,197,66,.6); border-radius: 12px; }
.aqh-selectrow { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 12px; }
.aqh-selchip {
  background: var(--card); border: 2.5px solid var(--swamp-mid); color: var(--ink); border-radius: 999px;
  padding: 8px 15px; font-weight: 700; font-size: 13px; min-height: 40px; cursor: pointer; box-shadow: 0 3px 0 rgba(0,0,0,.2);
}
.aqh-selchip.active { background: var(--swamp-mid); color: var(--stink-lime); }
.aqh-win {
  margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF);
  border: 3px solid var(--correct); border-radius: 14px; padding: 11px 16px; animation: animBubbleIn .34s var(--spring) both;
}
.aqh-win .aw-p { font-weight: 700; color: #1d8f4e; font-size: 16px; }
.aqh-win .aw-k { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 3px; }
.aqh-win .aqh-lift { margin-top: 8px; font-size: 12.5px; color: #4d6b58; background: rgba(255,255,255,.55); border-radius: 10px; padding: 6px 10px; }
.aqh-win .btn { margin-top: 9px; padding: 10px 22px; font-size: 15px; }
`;

/* ---------- the hug bench (tokens + two draggable arms) ---------- */
function makeBench(host, mission, opts) {
  let alive = true;
  const tokens = mission.tokens;
  const idx = { open: 0, close: tokens.length };
  const state = { openX: 0, closeX: 0 };
  const settling = { open: false, close: false };
  const cancelT = { open: null, close: null };
  const wobbleTimers = new Set();

  const benchWrap = el('div', 'aqh-benchwrap');
  const bench = el('div', 'aqh-bench');
  const hugzoneEl = el('div', 'aqh-hugzone');
  bench.append(hugzoneEl);
  const tokEls = tokens.map((t, i) => {
    const e = el('span', 'aqh-tok' + (t.kind === 'punct' ? ' punct' : '') + (mission.spotlightIdx === i ? ' aqh-spot' : ''), t.text);
    bench.append(e);
    return e;
  });
  const openArmEl = el('div', 'aqh-arm aqh-open', `<span class="aqh-armglyph">${mission.armGlyphs[0]}</span><span class="aqh-armstem"></span>`);
  const closeArmEl = el('div', 'aqh-arm aqh-close', `<span class="aqh-armglyph">${mission.armGlyphs[1]}</span><span class="aqh-armstem"></span>`);
  bench.append(openArmEl, closeArmEl);
  benchWrap.append(bench);
  host.append(benchWrap);

  let gapX = [0, 1];

  function measure() {
    const bRect = bench.getBoundingClientRect();
    const rects = tokEls.map((t) => t.getBoundingClientRect());
    const n = rects.length;
    const g = new Array(n + 1);
    const pad = 14;
    g[0] = rects[0].left - bRect.left - pad;
    for (let i = 1; i < n; i += 1) g[i] = (rects[i - 1].right + rects[i].left) / 2 - bRect.left;
    g[n] = rects[n - 1].right - bRect.left + pad;
    return g;
  }
  function renderArm(which, x) { (which === 'open' ? openArmEl : closeArmEl).style.left = x + 'px'; }
  function renderHugzone() {
    const left = Math.min(state.openX, state.closeX);
    const width = Math.max(0, Math.abs(state.closeX - state.openX));
    hugzoneEl.style.left = left + 'px';
    hugzoneEl.style.width = width + 'px';
  }
  function goTo(which, targetIdx) {
    idx[which] = targetIdx;
    const curX = which === 'open' ? state.openX : state.closeX;
    const targetX = gapX[targetIdx];
    if (cancelT[which]) { cancelT[which](); cancelT[which] = null; }
    settling[which] = true;
    cancelT[which] = tween((v) => {
      if (which === 'open') state.openX = v; else state.closeX = v;
      renderArm(which, v);
      renderHugzone();
    }, curX, targetX, 230, () => {
      settling[which] = false;
      cancelT[which] = null;
      if (alive) sfx.settle();
      if (alive && opts.onSettle) opts.onSettle();
    });
  }
  function nearestAllowed(which, x) {
    const other = which === 'open' ? idx.close : idx.open;
    let lo = 0; let hi = gapX.length - 1;
    if (which === 'open') hi = Math.min(hi, other - 1); else lo = Math.max(lo, other + 1);
    let best = lo; let bestD = Infinity;
    for (let i = lo; i <= hi; i += 1) { const d = Math.abs(gapX[i] - x); if (d < bestD) { bestD = d; best = i; } }
    return best;
  }

  const dragBase = { open: 0, close: 0 };
  const openDrag = makeDrag(openArmEl, {
    onStart() {
      if (cancelT.open) { cancelT.open(); cancelT.open = null; settling.open = false; }
      dragBase.open = state.openX;
      openArmEl.classList.add('dragging');
      if (opts.onSelect) opts.onSelect('open');
    },
    onMove(dx) {
      const lo = gapX[0]; const hi = gapX[gapX.length - 1];
      let x = Math.max(lo, Math.min(hi, dragBase.open + dx));
      x = Math.min(x, state.closeX - 6);
      state.openX = x; renderArm('open', x); renderHugzone();
    },
    onEnd() {
      openArmEl.classList.remove('dragging');
      goTo('open', nearestAllowed('open', state.openX));
    },
  });
  const closeDrag = makeDrag(closeArmEl, {
    onStart() {
      if (cancelT.close) { cancelT.close(); cancelT.close = null; settling.close = false; }
      dragBase.close = state.closeX;
      closeArmEl.classList.add('dragging');
      if (opts.onSelect) opts.onSelect('close');
    },
    onMove(dx) {
      const lo = gapX[0]; const hi = gapX[gapX.length - 1];
      let x = Math.max(lo, Math.min(hi, dragBase.close + dx));
      x = Math.max(x, state.openX + 6);
      state.closeX = x; renderArm('close', x); renderHugzone();
    },
    onEnd() {
      closeArmEl.classList.remove('dragging');
      goTo('close', nearestAllowed('close', state.closeX));
    },
  });

  const B = {};
  B.layout = function layout() {
    if (cancelT.open) { cancelT.open(); cancelT.open = null; settling.open = false; }
    if (cancelT.close) { cancelT.close(); cancelT.close = null; settling.close = false; }
    openDrag.abort(); closeDrag.abort();
    openArmEl.classList.remove('dragging'); closeArmEl.classList.remove('dragging');
    gapX = measure();
    state.openX = gapX[idx.open];
    state.closeX = gapX[idx.close];
    renderArm('open', state.openX);
    renderArm('close', state.closeX);
    renderHugzone();
  };
  B.getState = () => ({ openGap: idx.open, closeGap: idx.close });
  B.busy = () => settling.open || settling.close || openDrag.dragging() || closeDrag.dragging();
  B.nudge = function nudge(which, dir) {
    console.log('DEBUG nudge called', which, dir);
    if (which === 'open' ? openDrag.dragging() : closeDrag.dragging()) { console.log('DEBUG nudge blocked: dragging'); return; }
    const other = which === 'open' ? idx.close : idx.open;
    let lo = 0; let hi = gapX.length - 1;
    if (which === 'open') hi = Math.min(hi, other - 1); else lo = Math.max(lo, other + 1);
    const cur = idx[which];
    const target = Math.max(lo, Math.min(hi, cur + dir));
    console.log('DEBUG nudge calc', { other, lo, hi, cur, target, gapXlen: gapX.length });
    if (target === cur) { sfx.nudge(); return; }
    goTo(which, target);
  };
  B.reset = function reset() { goTo('open', 0); goTo('close', tokens.length); };
  B.select = function select(which) {
    openArmEl.classList.toggle('aqh-selected', which === 'open');
    closeArmEl.classList.toggle('aqh-selected', which === 'close');
  };
  B.wobble = function wobble(from, to, cls) {
    for (let i = from; i < to; i += 1) {
      const t = tokEls[i]; if (!t) continue;
      t.classList.remove('aqh-wriggle', 'aqh-beckon', 'aqh-shiver');
      void t.offsetWidth;
      t.classList.add(cls);
    }
    const tid = setTimeout(() => {
      wobbleTimers.delete(tid);
      if (!alive) return;
      for (let i = from; i < to; i += 1) { const t = tokEls[i]; if (t) t.classList.remove(cls); }
    }, 650);
    wobbleTimers.add(tid);
  };
  B.liftOut = function liftOut() {
    for (let i = mission.correctOpen; i < mission.correctClose; i += 1) { const t = tokEls[i]; if (t) t.classList.add('aqh-lifted'); }
  };
  B.hugCenter = function hugCenter(stageEl) {
    const hz = hugzoneEl.getBoundingClientRect();
    const sr = stageEl.getBoundingClientRect();
    return { x: hz.left + hz.width / 2 - sr.left, y: hz.top + hz.height / 2 - sr.top };
  };
  B.destroy = function destroy() {
    alive = false;
    if (cancelT.open) cancelT.open();
    if (cancelT.close) cancelT.close();
    wobbleTimers.forEach((t) => clearTimeout(t));
    openDrag.destroy(); closeDrag.destroy();
    benchWrap.remove();
  };

  B.layout();
  return B;
}

/* ---------- the anim card ---------- */
export default {
  id: 'speech-brackets',
  title: "THE AIR-QUOTER'S HUG",

  mount(host, ctx) {
    let alive = true;
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    injectCss('speech-brackets', CSS);

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'aqh-q');
    const qsub = el('div', 'aqh-qsub');
    const benchHost = el('div');
    const selectrow = el('div', 'aqh-selectrow');
    const selOpen = el('button', 'aqh-selchip active', '\u{1F91F} FRONT ARM');
    const selClose = el('button', 'aqh-selchip', '\u{1F91C} BACK ARM');
    selectrow.append(selOpen, selClose);
    const controls = el('div', 'anim-controls');
    const nl = el('button', 'anim-nudge', '⬅');
    const checkBtn = el('button', 'btn btn-gold', 'CHECK THE HUG \u{1F917}');
    const nr = el('button', 'anim-nudge', '➡');
    const resetBtn = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(nl, checkBtn, nr, resetBtn);
    const dash = el('div');
    stage.append(chiprow, q, qsub, benchHost, selectrow, controls, dash);
    host.append(stage);

    const ruleCard = el('div', 'goldcard', RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;';
    host.append(ruleCard);

    let mi = 0;
    let mission = null;
    let bench = null;
    let attempts = 0;
    let selected = 'open';

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), m.chip);
        c.addEventListener('click', () => { if (bench && bench.busy()) return; sfx.ui(); start(i); });
        chiprow.append(c);
      });
    }
    function selectArm(which) {
      selected = which;
      selOpen.classList.toggle('active', which === 'open');
      selClose.classList.toggle('active', which === 'close');
      if (bench) bench.select(which);
    }

    function start(i) {
      mi = i;
      attempts = 0;
      dash.innerHTML = '';
      if (bench) { bench.destroy(); bench = null; }
      mission = MISSIONS[i];
      paintChips();
      q.textContent = mission.prompt;
      qsub.textContent = mission.sub;
      bench = makeBench(benchHost, mission, { onSelect: selectArm });
      selectArm('open');
    }

    function checkHug() {
      if (!bench || bench.busy()) return;
      sfx.ui();
      const st = bench.getState();
      const result = diagnose(mission, st.openGap, st.closeGap);
      if (result.win) { win(); return; }
      attempts += 1;
      sfx.nudge();
      const issue = result.openIssue || result.closeIssue;
      const [from, to, cls] = issueRange(mission, st, issue);
      bench.wobble(from, to, cls);
      let text = issueText(mission, issue);
      if (attempts >= 2) {
        text += `<br><br>\u{1F3A9} Psst: the hug should start right before "${mission.tokens[mission.correctOpen].text}" and close right after "${mission.tokens[mission.correctClose - 1].text}".`;
      }
      bubble(stage, { title: (issue.type === 'close-early' && issue.punctOnly) ? 'IT ESCAPED! \u{1F631}' : 'NOT QUITE HUGGED \u{1F917}', text, img: AIRQ_IMG });
    }

    function win() {
      doneSet.add(mission.id);
      sfx.win();
      party(stage);
      paintChips();
      const c = bench.hugCenter(stage);
      sparkleBurst(stage, c.x, c.y);
      dash.innerHTML = '';
      const wbox = el('div', 'aqh-win',
        `<div class="aw-p">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]}</div>`
        + `<div class="aw-k">${mission.worked}</div>`);
      dash.append(wbox);
      if (mission.kind === 'bracket') {
        bench.liftOut();
        wbox.append(el('div', 'aqh-lift', `Lift the extra bit out: <b>${mission.liftText}</b>`));
      }
      if (doneSet.size === MISSIONS.length) ctx.complete();
      const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
      const btn = el('button', 'btn btn-gold', nextIdx !== -1 ? 'NEXT ONE ➡' : 'HUG AGAIN \u{1F917}');
      btn.addEventListener('click', () => { sfx.ui(); start(nextIdx !== -1 ? nextIdx : mi); });
      wbox.append(btn);
    }

    selOpen.addEventListener('click', () => { if (bench && bench.busy()) return; sfx.ui(); selectArm('open'); });
    selClose.addEventListener('click', () => { if (bench && bench.busy()) return; sfx.ui(); selectArm('close'); });
    nl.addEventListener('click', () => { console.log('DEBUG nl click', selected, !!bench); bench && bench.nudge(selected, -1); });
    nr.addEventListener('click', () => { console.log('DEBUG nr click', selected, !!bench); bench && bench.nudge(selected, 1); });
    resetBtn.addEventListener('click', () => { sfx.ui(); bench && bench.reset(); });
    checkBtn.addEventListener('click', checkHug);

    const onResize = () => { if (bench) bench.layout(); };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    start(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      if (bench) bench.destroy();
      stage.remove();
      ruleCard.remove();
    };
  },
};
