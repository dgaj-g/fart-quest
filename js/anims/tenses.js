// FART QUEST — js/anims/tenses.js
// GARY'S TIME MACHINE — a verb stands on a three-zone time platform
// (YESTERDAY | TODAY | TOMORROW). The child predicts which word the machine
// will produce, then drags the verb-token itself (the lever handle) across
// to the target zone. Regular verbs bolt on -ed with a clank; irregular
// rebels transform completely in a puff; the future assembles by borrowing
// WILL. The machine's truth is fixed — only the child's PREDICTION is what
// gets judged, Gary-style: warm, never mocking.

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const GARY_IMG = 'assets/monsters/yesterdays-gary.png';
const RULE = 'Say it out loud with ‘yesterday’ or ‘tomorrow’ — your ear knows: seek becomes sought, find becomes found.';

const ZONES = [
  { key: 'yesterday', icon: '🕰️', label: 'YESTERDAY' },
  { key: 'today', icon: '📍', label: 'TODAY' },
  { key: 'tomorrow', icon: '🔮', label: 'TOMORROW' },
];

/* ---------- pure helpers (verified against every mission — see /tmp check) ---------- */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function targetIdxOf(m) { return m.target === 'yesterday' ? 0 : 2; }
function styleSpans(m) {
  if (m.style === 'bolt') return `<span class="gtm-base">${m.verb}</span><span class="gtm-suf"></span>`;
  if (m.style === 'will') return `<span class="gtm-pre"></span><span class="gtm-base">${m.verb}</span>`;
  return `<span class="gtm-base">${m.verb}</span>`;
}
function garyWrongText(m) {
  const w = m.predictWrong.toUpperCase(); const r = m.result.toUpperCase();
  if (m.wrongKind === 'unchanged') {
    return `Easy trap! <b>${w}</b> is what TODAY looks like, but yesterday needs a change too — even boring regular verbs bolt on -ed. It's <b>${r}</b>.`;
  }
  if (m.wrongKind === 'double-marked') {
    return `Even Gary's future-tense guesses can wobble! <b>${w}</b> piles an extra -ed onto a word that already has WILL doing the work. It's just <b>${r}</b>.`;
  }
  return `Yesterday's Gary once swore <b>${w}</b> was a real word too — he's still got the sign to prove it! The truth is <b>${r}</b>.`;
}

/* ---------- content (numbers/spellings checked in /tmp) ---------- */
const MISSIONS = [
  {
    id: 'jump', verb: 'jump', style: 'bolt', suffix: 'ed', target: 'yesterday', result: 'jumped',
    stem: ['Every morning, Jarlath ', ' clean over the garden wall.'],
    predictWrong: 'jump', wrongKind: 'unchanged',
    worked: 'Jump is a regular verb — the -ed just bolts on: jump becomes jumped.',
  },
  {
    id: 'seek', verb: 'seek', style: 'puff', target: 'yesterday', result: 'sought',
    stem: ['Yesterday, Jarlath ', ' the ball all over the pitch.'],
    predictWrong: 'seeked', wrongKind: 'overregularised',
    worked: 'Seek is a rebel verb — it changes shape completely into SOUGHT, never “seeked”.',
  },
  {
    id: 'find', verb: 'find', style: 'puff', target: 'yesterday', result: 'found',
    stem: ['Yesterday, Jarlath ', ' a fifty pence coin under the sofa cushions.'],
    predictWrong: 'finded', wrongKind: 'overregularised',
    worked: 'Find is a rebel verb — it changes shape completely into FOUND, never “finded”.',
  },
  {
    id: 'go', verb: 'go', style: 'puff', target: 'yesterday', result: 'went',
    stem: ['Last summer, the whole family ', ' to the seaside for a soggy picnic.'],
    predictWrong: 'goed', wrongKind: 'overregularised',
    worked: 'Go is the biggest rebel of all — nothing survives! Go becomes WENT, never “goed”.',
  },
  {
    id: 'score', verb: 'score', style: 'will', target: 'tomorrow', result: 'will score',
    stem: ['Tomorrow, Jarlath ', ' in the next match, just you wait.'],
    predictWrong: 'will scored', wrongKind: 'double-marked',
    worked: 'The future just borrows WILL — score stays exactly as it is: will score, never “will scored”.',
  },
];
const WIN_PHRASES = ['SPOT ON! 💨', 'TIME-MACHINE MASTER! ⏱️', "GARY'S IMPRESSED! 🎩", 'PERFECTLY PREDICTED! ⭐'];

/* ---------- the anim card ---------- */
export default {
  id: 'tenses',
  title: "GARY'S TIME MACHINE",

  mount(host, ctx) {
    let alive = true;
    let mi = 0;
    let mission = MISSIONS[0];
    let zoneW = 0;
    let tokenW = 0;
    let predictCardsEls = [];
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };
    const state = {
      idx: 1, targetIdxHeading: 1, tokenX: 0, lastProv: 1, settling: false,
      predicted: null, locked: false, busy: false, dragBase: 0, cancelTween: null,
    };

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'gtm-q');
    const qsub = el('div', 'gtm-qsub');
    const platform = el('div', 'gtm-platform');
    const zonesRow = el('div', 'gtm-zones');
    const zoneEls = ZONES.map((z) => {
      const zEl = el('div', 'gtm-zone', `<div class="gtm-zicon">${z.icon}</div><div class="gtm-zlabel">${z.label}</div>`);
      zonesRow.append(zEl);
      return zEl;
    });
    const hit = el('div', 'gtm-hit');
    const token = el('div', 'gtm-token');
    const tokenWord = el('div', 'gtm-word');
    token.append(tokenWord);
    zonesRow.append(hit, token);
    platform.append(zonesRow);
    const predictLabel = el('div', 'gtm-predictlabel', 'YOUR PREDICTION:');
    const predictRow = el('div', 'anim-chiprow gtm-predictrow');
    const winBox = el('div');
    const controls = el('div', 'anim-controls');
    const nl = el('button', 'anim-nudge', '⬅');
    const resetBtn = el('button', 'anim-ghostbtn', '↩ RESET');
    const nr = el('button', 'anim-nudge', '➡');
    controls.append(nl, resetBtn, nr);
    stage.append(chiprow, q, qsub, platform, predictLabel, predictRow, winBox, controls);
    host.append(stage);

    const ruleCard = el('div', 'gtm-rulecard', RULE);
    host.append(ruleCard);

    /* ---------- geometry ---------- */
    function colCenterX(idx) { return idx * zoneW + zoneW / 2; }
    function nearestIdx(x) { return clamp(Math.round((x + tokenW / 2) / zoneW - 0.5), 0, 2); }
    function rubber(x) {
      const minX = colCenterX(0) - tokenW / 2; const maxX = colCenterX(2) - tokenW / 2;
      if (x > maxX) return maxX + (x - maxX) * 0.22;
      if (x < minX) return minX + (x - minX) * 0.22;
      return x;
    }
    function applyX(x) {
      state.tokenX = x;
      token.style.transform = `translateX(${x}px)`;
      const prov = nearestIdx(x);
      if (prov !== state.lastProv) { (prov > state.lastProv ? sfx.tick : sfx.tock)(1); state.lastProv = prov; }
    }
    function layoutTrack() {
      if (state.cancelTween) { state.cancelTween(); state.cancelTween = null; state.settling = false; }
      drag.abort();
      token.classList.remove('dragging');
      const avail = Math.min(680, (host.clientWidth || 700) - 24);
      zoneW = avail / 3;
      tokenW = Math.min(190, zoneW - 16);
      zonesRow.style.width = avail + 'px';
      zoneEls.forEach((z) => { z.style.width = zoneW + 'px'; });
      token.style.width = tokenW + 'px';
      state.lastProv = state.idx;
      applyX(colCenterX(state.idx) - tokenW / 2);
    }

    /* ---------- drag / settle ---------- */
    const drag = makeDrag(hit, {
      enabled: () => !state.locked && !state.busy,
      onStart() {
        if (state.cancelTween) { state.cancelTween(); state.cancelTween = null; state.settling = false; }
        state.dragBase = state.tokenX;
        token.classList.add('dragging');
      },
      onMove(dx) { applyX(rubber(state.dragBase + dx)); },
      onEnd() {
        token.classList.remove('dragging');
        settleTo(nearestIdx(state.tokenX));
      },
    });
    function settleTo(idx) {
      if (state.cancelTween) state.cancelTween();
      state.settling = true;
      state.targetIdxHeading = idx;
      const toX = colCenterX(idx) - tokenW / 2;
      state.cancelTween = tween((v) => applyX(v), state.tokenX, toX, 260, () => {
        state.settling = false; state.cancelTween = null; state.idx = idx;
        onSettle(idx);
      });
    }
    function nudge(dir) {
      if (state.locked || state.busy || drag.dragging()) return;
      const base = state.settling ? state.targetIdxHeading : state.idx;
      const next = clamp(base + dir, 0, 2);
      if (next === base) { sfx.nudge(); return; }
      settleTo(next);
    }
    function onSettle(idx) {
      if (!alive) return;
      const tIdx = targetIdxOf(mission);
      if (idx === 1) {
        qsub.textContent = state.predicted
          ? `Now pull the lever to ${mission.target.toUpperCase()}!`
          : 'Pick a prediction card below — which word will the machine make?';
        return;
      }
      if (idx !== tIdx) {
        sfx.nudge();
        toast(stage, `This machine is heading to ${mission.target.toUpperCase()} today — try pulling the other way!`);
        later(() => { if (alive && !state.busy && !drag.dragging()) settleTo(1); }, 750);
        return;
      }
      if (!state.predicted) {
        sfx.nudge();
        toast(stage, 'Pick your prediction card first — which word will the machine make?');
        later(() => { if (alive && !state.busy && !drag.dragging()) settleTo(1); }, 750);
        return;
      }
      reveal();
    }

    /* ---------- transform + reveal ---------- */
    function playTransform(m, cb) {
      if (m.style === 'bolt') {
        sfx.drop();
        const suf = tokenWord.querySelector('.gtm-suf');
        suf.textContent = m.suffix;
        suf.classList.add('gtm-suf-in');
        later(cb, 480);
        return;
      }
      if (m.style === 'will') {
        sfx.tick(2);
        const pre = tokenWord.querySelector('.gtm-pre');
        pre.textContent = 'will ';
        pre.classList.add('gtm-pre-in');
        later(cb, 480);
        return;
      }
      sfx.pop();
      tokenWord.classList.add('gtm-puffout');
      later(() => {
        if (!alive) return;
        tokenWord.classList.remove('gtm-puffout');
        tokenWord.innerHTML = `<span class="gtm-base">${m.result}</span>`;
        tokenWord.classList.add('gtm-puffin');
        sfx.sparkle();
        const r = token.getBoundingClientRect(); const sr = stage.getBoundingClientRect();
        sparkleBurst(stage, r.left - sr.left + r.width / 2, r.top - sr.top + r.height / 2, 8);
        later(() => { if (alive) tokenWord.classList.remove('gtm-puffin'); }, 420);
        later(cb, 420);
      }, 230);
    }
    function reveal() {
      state.busy = true; state.locked = true;
      predictCardsEls.forEach((c) => c.classList.add('gtm-locked'));
      qsub.textContent = "The machine's working...";
      later(() => { if (alive) playTransform(mission, () => { if (alive) finishReveal(); }); }, 200);
    }
    function finishReveal() {
      state.busy = false;
      const correct = state.predicted === mission.result;
      doneSet.add(mission.id);
      predictCardsEls.forEach((c) => {
        if (c.dataset.text === mission.result) c.classList.add('gtm-rightcard');
        else if (c.dataset.text === state.predicted) c.classList.add('gtm-misscard');
      });
      if (correct) {
        sfx.win(); party(stage);
        qsub.textContent = 'Nailed it — the machine agrees with you!';
      } else {
        qsub.textContent = "Not quite what you predicted — here's what the machine really made.";
        later(() => bubble(stage, { title: 'GARY KNOWS THAT FEELING 😔', text: garyWrongText(mission), img: GARY_IMG }), 250);
      }
      showWin(mission, correct);
      paintChips();
      if (doneSet.size === MISSIONS.length) ctx.complete();
    }
    function showWin(m, correct) {
      winBox.innerHTML = '';
      const phrase = correct ? WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)] : 'NOW YOU KNOW! 📖';
      const w = el('div', 'gtm-win',
        `<div class="wp">${phrase} &nbsp; ${m.verb} → <b>${m.result}</b></div>`
        + `<div class="wk">${m.worked}</div>`);
      winBox.append(w);
      const nextIdx = MISSIONS.findIndex((mm) => !doneSet.has(mm.id));
      const nb = el('button', 'btn btn-gold', nextIdx !== -1 ? 'NEXT ONE ➡' : 'PLAY AGAIN 🔁');
      nb.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
      nb.addEventListener('click', () => { sfx.ui(); start(nextIdx !== -1 ? nextIdx : 0); });
      w.append(nb);
    }

    /* ---------- prediction cards ---------- */
    function buildPredictCards() {
      predictRow.innerHTML = '';
      predictCardsEls = shuffle([
        { text: mission.result, correct: true },
        { text: mission.predictWrong, correct: false },
      ]).map((c) => {
        const btn = el('button', 'anim-mchip gtm-pcard', c.text);
        btn.dataset.text = c.text;
        btn.addEventListener('click', () => onPickCard(btn));
        predictRow.append(btn);
        return btn;
      });
    }
    function onPickCard(btn) {
      if (state.locked || state.busy) return;
      state.predicted = btn.dataset.text;
      predictCardsEls.forEach((c) => c.classList.toggle('gtm-selected', c === btn));
      sfx.ui();
      qsub.textContent = `Now pull the lever to ${mission.target.toUpperCase()}!`;
    }

    /* ---------- mission control ---------- */
    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), m.verb.toUpperCase());
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
    }
    function start(i) {
      mi = i; mission = MISSIONS[i];
      state.predicted = null; state.locked = false; state.busy = false;
      state.idx = 1; state.targetIdxHeading = 1;
      winBox.innerHTML = '';
      paintChips();
      q.innerHTML = `${mission.stem[0]}<span class="gtm-blank">___</span>${mission.stem[1]}`;
      qsub.textContent = 'Pick a prediction card below — which word will the machine make?';
      tokenWord.innerHTML = styleSpans(mission);
      zoneEls.forEach((z, idx) => z.classList.toggle('gtm-target', idx === targetIdxOf(mission)));
      buildPredictCards();
      layoutTrack();
    }

    nl.addEventListener('click', () => nudge(-1));
    nr.addEventListener('click', () => nudge(1));
    resetBtn.addEventListener('click', () => { sfx.ui(); start(mi); });

    const onResize = () => { if (alive) layoutTrack(); };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    start(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      if (state.cancelTween) state.cancelTween();
      drag.destroy();
      timers.forEach((t) => clearTimeout(t));
      stage.remove();
      ruleCard.remove();
    };
  },
};

const CSS = `
.gtm-q { text-align: center; font-weight: 700; font-size: clamp(16px, 2.6vw, 20px); margin-bottom: 2px; line-height: 1.35; }
.gtm-blank { display: inline-block; min-width: 54px; border-bottom: 3px solid var(--stink); color: var(--stink); font-weight: 800; text-align: center; }
.gtm-qsub { text-align: center; font-size: 12.5px; color: #6b5744; font-weight: 500; margin-bottom: 10px; min-height: 16px; }
.gtm-platform { margin: 6px auto 4px; max-width: 700px; }
.gtm-zones { position: relative; display: flex; margin: 0 auto; border-radius: 16px; background: linear-gradient(180deg,#efe1c4,#e8d7b4); box-shadow: inset 0 3px 8px rgba(51,38,29,.18); padding: 14px 0 40px; touch-action: none; }
.gtm-zone { flex: 0 0 auto; display: flex; flex-direction: column; align-items: center; gap: 2px; padding-top: 2px; border-radius: 12px; }
.gtm-zone + .gtm-zone { border-left: 1.5px dashed rgba(51,38,29,.12); }
.gtm-zicon { font-size: 22px; }
.gtm-zlabel { font-size: 11px; font-weight: 800; letter-spacing: .06em; color: #7c6247; }
.gtm-zone.gtm-target .gtm-zlabel { color: var(--gold-deep); }
.gtm-zone.gtm-target { animation: gtmZonePulse 1.6s ease-in-out infinite; }
@keyframes gtmZonePulse { 0%,100% { box-shadow: inset 0 0 0 0 rgba(244,197,66,.35); } 50% { box-shadow: inset 0 0 0 6px rgba(244,197,66,.22); } }
.gtm-hit { position: absolute; left: 0; right: 0; top: -10px; bottom: 20px; z-index: 5; cursor: grab; }
.gtm-hit:active { cursor: grabbing; }
.gtm-token {
  position: absolute; left: 0; top: 50%; margin-top: -32px; z-index: 6; will-change: transform;
  height: 64px; border-radius: 16px; background: linear-gradient(180deg,#fff,#fdf3d6);
  border: 3px solid var(--ink); box-shadow: 0 4px 0 rgba(51,38,29,.35);
  display: flex; align-items: center; justify-content: center; pointer-events: none; padding: 0 10px;
}
.gtm-token.dragging { box-shadow: 0 2px 0 rgba(51,38,29,.35); }
.gtm-token::after { content: ''; position: absolute; top: -9px; left: 50%; transform: translateX(-50%); width: 14px; height: 14px; border-radius: 50%; background: var(--stink); box-shadow: 0 2px 0 rgba(0,0,0,.3); }
.gtm-word { font-weight: 800; font-size: clamp(17px, 2.6vw, 23px); color: var(--ink); white-space: nowrap; }
.gtm-word.gtm-puffout { animation: gtmPuffOut .22s ease both; }
.gtm-word.gtm-puffin { animation: gtmPuffIn .4s var(--spring) both; }
@keyframes gtmPuffOut { to { opacity: 0; transform: scale(.4) rotate(8deg); } }
@keyframes gtmPuffIn { from { opacity: 0; transform: scale(.3) rotate(-10deg); } to { opacity: 1; transform: scale(1) rotate(0); } }
.gtm-suf, .gtm-pre { display: inline-block; opacity: 0; color: var(--stink); }
.gtm-suf.gtm-suf-in { animation: gtmBoltIn .45s cubic-bezier(.22,1.2,.36,1) both; }
.gtm-pre.gtm-pre-in { animation: gtmPreIn .45s cubic-bezier(.22,1.2,.36,1) both; }
@keyframes gtmBoltIn { 0% { opacity: 0; transform: translateX(20px) scale(.4) rotate(14deg); } 60% { opacity: 1; transform: translateX(-3px) scale(1.18) rotate(-5deg); } 100% { opacity: 1; transform: translateX(0) scale(1) rotate(0); } }
@keyframes gtmPreIn { 0% { opacity: 0; transform: translateX(-20px) scale(.4) rotate(-14deg); } 60% { opacity: 1; transform: translateX(3px) scale(1.18) rotate(5deg); } 100% { opacity: 1; transform: translateX(0) scale(1) rotate(0); } }
.gtm-predictlabel { text-align: center; font-size: 11px; font-weight: 800; letter-spacing: .1em; color: #8a7256; margin-top: 14px; }
.gtm-predictrow { margin-top: 4px; }
.gtm-pcard.gtm-selected { background: var(--gold); border-color: var(--gold-deep); color: var(--ink); }
.gtm-pcard.gtm-locked { pointer-events: none; opacity: .8; }
.gtm-pcard.gtm-rightcard { border-color: var(--correct); box-shadow: 0 3px 0 rgba(46,204,113,.4); }
.gtm-pcard.gtm-rightcard::after { content: ' ✓'; color: var(--correct); }
.gtm-pcard.gtm-misscard { border-color: var(--wrong); opacity: .75; }
.gtm-win { margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF); border: 3px solid var(--correct); border-radius: 14px; padding: 10px 14px; animation: animBubbleIn .34s var(--spring) both; }
.gtm-win .wp { font-weight: 700; color: #1d8f4e; font-size: 16px; }
.gtm-win .wk { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 2px; }
.gtm-rulecard { margin-top: 12px; font-size: 13.5px; line-height: 1.35; background: linear-gradient(180deg,#FFF3CE,#FBE29A); border: 3px solid var(--gold-deep); border-radius: 14px; padding: 10px 14px; color: #5a4408; font-weight: 700; max-width: 980px; margin-left: auto; margin-right: auto; }
`;
injectCss('tenses', CSS);
