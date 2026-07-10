// FART QUEST — js/anims/reading-detective.js
// THE LINE-NUMBER LASSO — interactive line-reference machine for the
// reading-detective Scout Report (Storybog / Inspector Sniff). A short case
// file sits on the bench, each line numbered like a real exam passage. The
// child drags Sniff down onto the line a question names — lasso the right
// line and the padlocked answers click open; lasso the wrong one and Sniff
// finds nothing but crumbs. The final case needs a RANGE roped end to end
// before it unlocks, teaching the habit the whole topic hangs on: never
// answer from memory — go back to the line first.

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const SNIFF_IMG = 'assets/monsters/inspector-sniff.png';
const RULE = 'The line number is a gift — go BACK to the line, put your finger on it, and the answer is within arm\'s reach.';
const TOKEN_SIZE = 52;

/* ---------- the case file (verbatim from data/topics/reading-detective.js) ---------- */
const PASSAGE = [
  'On Tuesday morning, Priya arrived at school before anyone else.',
  'She wanted to check the trophy cabinet in the main hall.',
  'The silver football trophy had vanished since Friday\'s assembly.',
  'Mr Adeyemi, the caretaker, said he had locked the hall himself.',
  'Priya noticed the side door was propped open with a brick.',
  'Muddy footprints led from the door towards the sports store.',
  'Inside the store, she found the trophy wrapped in a spare kit bag.',
  'A note beside it read: "Sorry, I just wanted to polish it!"',
  'The note was signed by Callum, the team captain, in blue pen.',
];

/* ---------- pure helpers (no DOM — covered by a /tmp scratch test) ---------- */
export function fisherYates(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Decides what a lasso drop means. `touchedLines` is every line number the
// token passed over during THIS drag; `releaseLine` is where it let go
// (null if released off the passage entirely).
export function evaluateLasso(mission, touchedLines, releaseLine) {
  if (releaseLine == null) return { status: 'miss' };
  if (mission.type === 'range') {
    const [a, b] = mission.lines;
    if (releaseLine !== a && releaseLine !== b) return { status: 'wrong', line: releaseLine };
    if (touchedLines.has(a) && touchedLines.has(b)) return { status: 'correct' };
    return { status: 'half', line: releaseLine };
  }
  if (releaseLine === mission.line) return { status: 'correct' };
  return { status: 'wrong', line: releaseLine };
}

export function lineLabel(m) {
  return m.type === 'range' ? `LINES ${m.lines[0]}–${m.lines[1]}` : `LINE ${m.line}`;
}

/* ---------- content — 3 single-line missions + 1 range. Exactly one option
   per mission has correct:true (checked in a /tmp scratch script). Decoys
   always borrow real wording from a DIFFERENT line, per the topic's own
   warning about that trick. ---------- */
const MISSIONS = [
  {
    id: 'm1', type: 'single', line: 2,
    stem: 'According to <b>line 2</b>, what did Priya want to check?',
    options: [
      { text: 'The trophy cabinet in the main hall.', correct: true },
      { text: 'The side door.', correct: false, why: 'That’s line 5 — Priya notices the side door later. Line 2 is about what she wanted to check FIRST, before any of that.' },
      { text: 'The sports store.', correct: false, why: 'The sports store doesn’t turn up until line 6 — a completely different part of the case file.' },
      { text: 'Mr Adeyemi’s office.', correct: false, why: 'No office is ever mentioned anywhere in the case file — that name was never written down.' },
    ],
    worked: 'Line 2 says: “She wanted to check the trophy cabinet in the main hall.” The answer is sitting right there, word for word.',
  },
  {
    id: 'm2', type: 'single', line: 5,
    stem: 'According to <b>line 5</b>, what was propping the side door open?',
    options: [
      { text: 'A brick.', correct: true },
      { text: 'A kit bag.', correct: false, why: 'That’s line 7 — the kit bag is what the trophy was wrapped in, not what propped the door open.' },
      { text: 'A note.', correct: false, why: 'The note doesn’t appear until line 8, beside the trophy — nowhere near the door.' },
      { text: 'Muddy footprints.', correct: false, why: 'The footprints are line 6 — found near the door, but they didn’t prop it open.' },
    ],
    worked: 'Line 5 says: “Priya noticed the side door was propped open with a brick.” That’s the exact answer, straight off the line.',
  },
  {
    id: 'm3', type: 'single', line: 9,
    stem: 'According to <b>line 9</b>, what colour pen did Callum use to sign the note?',
    options: [
      { text: 'Blue pen.', correct: true },
      { text: 'Black pen.', correct: false, why: 'No black pen is mentioned anywhere in the case file — go back to line 9 and check again.' },
      { text: 'Silver ink.', correct: false, why: 'Silver belongs to the TROPHY, back in line 3 — not to Callum’s pen.' },
      { text: 'He didn’t sign it.', correct: false, why: 'Line 9 says the note WAS signed by Callum — read it again, finger on the line.' },
    ],
    worked: 'Line 9 says: “The note was signed by Callum, the team captain, in blue pen.” Blue pen — word for word.',
  },
  {
    id: 'm4', type: 'range', lines: [7, 8],
    stem: 'According to <b>lines 7–8</b>, what did the note beside the trophy say?',
    options: [
      { text: '“Sorry, I just wanted to polish it!”', correct: true },
      { text: '“Sorry, I locked the hall myself.”', correct: false, why: 'That’s line 4’s wording, about Mr Adeyemi locking the hall — not the note at all.' },
      { text: '“The trophy has vanished since Friday.”', correct: false, why: 'That’s line 3 — the discovery, not the note left beside the trophy.' },
      { text: '“I found muddy footprints leading here.”', correct: false, why: 'That’s line 6’s footprints, not what the note itself said.' },
    ],
    worked: 'Line 7 tells you WHERE the note was — beside the trophy — and line 8 tells you what it said: “Sorry, I just wanted to polish it!” A range means the clue is split across two lines, so you need BOTH before you can answer.',
  },
];

const CSS = `
.lnl-qsub { text-align:center; font-size:12.5px; color:#6b5744; font-weight:500; margin-bottom:12px; max-width:600px; margin-left:auto; margin-right:auto; }
.lnl-field { position:relative; max-width:640px; margin:0 auto; }
.lnl-home { width:${TOKEN_SIZE}px; height:${TOKEN_SIZE}px; margin:0 auto 14px; border-radius:50%; border:3px dashed rgba(51,38,29,.35); position:relative; }
.lnl-homelabel { position:absolute; top:100%; left:50%; transform:translateX(-50%); white-space:nowrap; font-size:9.5px; font-weight:700; color:#8a7457; letter-spacing:.05em; margin-top:3px; }
.lnl-passage { background:var(--card); border:3px solid rgba(51,38,29,.16); border-radius:16px; padding:10px 12px; box-shadow: inset 0 2px 6px rgba(51,38,29,.08); }
.lnl-row { display:flex; align-items:flex-start; gap:8px; padding:5px 8px; border-radius:9px; }
.lnl-row + .lnl-row { margin-top:1px; }
.lnl-num { flex:0 0 auto; width:20px; height:20px; border-radius:50%; background:rgba(51,38,29,.12); color:#6b5744; font-size:11px; font-weight:800; display:flex; align-items:center; justify-content:center; margin-top:1px; }
.lnl-text { font-size:clamp(12.5px,1.9vw,14.5px); font-weight:600; color:var(--ink); line-height:1.4; }
.lnl-row.hover { background: rgba(155,89,208,.15); box-shadow:0 0 0 2px rgba(155,89,208,.35) inset; }
.lnl-row.roped { background: rgba(244,197,66,.28); box-shadow:0 0 0 2.5px var(--gold-deep) inset; }
.lnl-row.roped .lnl-num { background: var(--gold-deep); color:#fff; }
.lnl-row.solved .lnl-num { position:relative; }
.lnl-row.solved .lnl-num::after { content:'\\2713'; position:absolute; right:-9px; bottom:-4px; font-size:9px; color:#1d8f4e; background:#fff; border-radius:50%; }
.lnl-row.wrongflash { animation: lnlWrongFlash .85s ease; }
@keyframes lnlWrongFlash { 0%,100% { background:transparent; } 22% { background:rgba(231,76,60,.3); } 60% { background:rgba(231,76,60,.14); } }
.lnl-row.half { animation: lnlHalfPulse .9s ease; }
@keyframes lnlHalfPulse { 0%,100% { background:transparent; } 40% { background:rgba(244,197,66,.4); } }
.lnl-token { position:absolute; z-index:20; width:${TOKEN_SIZE}px; height:${TOKEN_SIZE}px; display:flex; align-items:center; justify-content:center; cursor:grab; touch-action:none; -webkit-user-select:none; user-select:none; }
.lnl-token img { width:100%; height:100%; object-fit:contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,.35)); pointer-events:none; }
.lnl-token .lnl-rope { position:absolute; bottom:-5px; right:-6px; font-size:17px; pointer-events:none; }
.lnl-token.dragging { cursor:grabbing; }
.lnl-qcard { margin-top:16px; text-align:center; font-size:clamp(14.5px,2vw,17px); font-weight:700; color:var(--ink); max-width:640px; margin-left:auto; margin-right:auto; }
.lnl-options { display:flex; flex-wrap:wrap; gap:9px; justify-content:center; margin-top:12px; }
.lnl-opt { position:relative; background:#fff; border:3px solid var(--ink); border-radius:13px; padding:10px 16px 10px 30px; font-weight:700; font-size:14px; color:var(--ink); box-shadow:0 3px 0 rgba(51,38,29,.3); cursor:pointer; min-height:44px; }
.lnl-opt::before { content:'\\1F513'; position:absolute; left:9px; top:50%; transform:translateY(-50%) scale(.85); opacity:.55; }
.lnl-opt.locked { opacity:.4; cursor:not-allowed; }
.lnl-opt.locked::before { content:'\\1F512'; opacity:1; }
.lnl-opt.wrongpick { opacity:.5; cursor:not-allowed; border-color:#a53125; animation: lnlShake .4s ease; }
.lnl-opt.correctpick { background: rgba(46,204,113,.22); border-color:var(--correct); color:#1d8f4e; }
@keyframes lnlShake { 0%,100% { transform:translateX(0); } 25% { transform:translateX(-5px); } 75% { transform:translateX(5px); } }
.lnl-win { margin-top:14px; text-align:center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF); border:3px solid var(--correct); border-radius:14px; padding:10px 14px; animation: animBubbleIn .34s var(--spring) both; }
.lnl-wp { font-weight:700; color:#1d8f4e; font-size:16px; }
.lnl-wk { font-size:13.5px; color:#4d6b58; font-weight:500; margin-top:2px; }
.lnl-rulecard { margin-top:12px; font-size:13.5px; line-height:1.35; background: linear-gradient(180deg,#FFF3CE,#FBE29A); border:3px solid var(--gold-deep); border-radius:14px; padding:10px 14px; color:#5a4408; font-weight:700; max-width:980px; margin-left:auto; margin-right:auto; }
`;

/* ---------- the anim card ---------- */
export default {
  id: 'reading-detective',
  title: 'THE LINE-NUMBER LASSO',

  mount(host, ctx) {
    let alive = true;
    injectCss('reading-detective', CSS);

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const qsub = el('div', 'lnl-qsub', 'Drag Inspector Sniff down onto the line the question names. Lasso the right line and the answers unlock — lasso the wrong one and all he finds is crumbs.');
    const field = el('div', 'lnl-field');
    const homeSlot = el('div', 'lnl-home', '<span class="lnl-homelabel">SNIFF’S SPOT</span>');
    const passageBox = el('div', 'lnl-passage');
    const token = el('div', 'lnl-token', `<img src="${SNIFF_IMG}" alt=""><span class="lnl-rope">\u{1FAA2}</span>`);
    field.append(homeSlot, passageBox, token);
    const qcard = el('div', 'lnl-qcard');
    const optionsBox = el('div', 'lnl-options');
    const winBox = el('div');
    stage.append(chiprow, qsub, field, qcard, optionsBox, winBox);
    host.append(stage);

    const ruleCard = el('div', 'lnl-rulecard', RULE);
    host.append(ruleCard);

    const rowEls = PASSAGE.map((text, idx) => {
      const row = el('div', 'lnl-row');
      row.dataset.line = String(idx + 1);
      row.append(el('span', 'lnl-num', String(idx + 1)), el('span', 'lnl-text', text));
      passageBox.append(row);
      return row;
    });

    let mi = 0;
    let roundSolved = false;
    let settling = false;
    let parked = 'home'; // 'home' | lineNumber | [a,b]
    let hoverLine = null;
    let optEls = [];
    let tokenTween = null;
    let dragOrigLeft = 0;
    let dragOrigTop = 0;
    let rowRects = [];
    let touchedLines = new Set();
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    function fieldRect() { return field.getBoundingClientRect(); }
    function homeXY() {
      const fr = fieldRect(); const hr = homeSlot.getBoundingClientRect();
      return { x: hr.left - fr.left + hr.width / 2 - TOKEN_SIZE / 2, y: hr.top - fr.top + hr.height / 2 - TOKEN_SIZE / 2 };
    }
    function rowXY(line) {
      const fr = fieldRect(); const rr = rowEls[line - 1].getBoundingClientRect();
      return { x: rr.left - fr.left + 4, y: rr.top - fr.top + rr.height / 2 - TOKEN_SIZE / 2 };
    }
    function spotXY(where) {
      if (where === 'home') return homeXY();
      if (Array.isArray(where)) return rowXY(where[1]);
      return rowXY(where);
    }

    function tweenTokenTo(x, y, ms, cb) {
      if (tokenTween) { tokenTween(); tokenTween = null; }
      const curLeft = parseFloat(token.style.left) || 0;
      const curTop = parseFloat(token.style.top) || 0;
      settling = true;
      tokenTween = tween((t) => {
        token.style.left = (curLeft + (x - curLeft) * t) + 'px';
        token.style.top = (curTop + (y - curTop) * t) + 'px';
      }, 0, 1, ms, () => { tokenTween = null; settling = false; if (cb) cb(); });
    }
    function parkToken(where, instant) {
      parked = where;
      const xy = spotXY(where);
      if (instant) { token.style.left = xy.x + 'px'; token.style.top = xy.y + 'px'; }
      else tweenTokenTo(xy.x, xy.y, 320);
    }

    function setRowClass(line, cls, on) { rowEls[line - 1].classList.toggle(cls, on); }
    function flashRow(line, cls) {
      if (line == null) return;
      setRowClass(line, cls, true);
      later(() => setRowClass(line, cls, false), 850);
    }

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), lineLabel(m));
        c.addEventListener('click', () => { sfx.ui(); startMission(i); });
        chiprow.append(c);
      });
    }

    function buildOptions(mission) {
      optionsBox.innerHTML = '';
      optEls = fisherYates(mission.options).map((o) => {
        const b = el('button', 'lnl-opt locked', o.text);
        b.disabled = true;
        b.addEventListener('click', () => onPickOption(mission, o, b));
        optionsBox.append(b);
        return b;
      });
    }
    function unlockOptions() { optEls.forEach((b) => { b.classList.remove('locked'); b.disabled = false; }); }

    function onPickOption(mission, opt, btn) {
      if (!alive || roundSolved || btn.classList.contains('locked') || btn.classList.contains('wrongpick')) return;
      if (opt.correct) {
        roundSolved = true;
        btn.classList.add('correctpick');
        optEls.forEach((b) => { b.disabled = true; });
        sfx.win();
        const r = btn.getBoundingClientRect(); const sr = stage.getBoundingClientRect();
        sparkleBurst(stage, r.left - sr.left + r.width / 2, r.top - sr.top + r.height / 2, 12);
        doneSet.add(mission.id);
        paintChips();
        showWin(mission);
      } else {
        sfx.nudge();
        btn.classList.add('wrongpick');
        btn.disabled = true;
        later(() => { if (alive && !roundSolved && MISSIONS[mi] === mission) bubble(stage, { title: 'NOT QUITE! \u{1F443}', text: opt.why, img: SNIFF_IMG }); }, 80);
      }
    }

    function showWin(mission) {
      winBox.innerHTML = '';
      const w = el('div', 'lnl-win',
        `<div class="lnl-wp">CASE CRACKED! \u{1F575}️</div><div class="lnl-wk">${mission.worked}</div>`);
      winBox.append(w);
      party(stage, 10);
      const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
      if (nextIdx !== -1) {
        const nb = el('button', 'btn btn-gold', 'NEXT CLUE ➡️');
        nb.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
        nb.addEventListener('click', () => { sfx.ui(); startMission(nextIdx); });
        w.append(nb);
      }
      if (doneSet.size === MISSIONS.length) {
        ctx.complete();
        later(() => {
          if (!alive) return;
          bubble(stage, { title: 'CASE CLOSED! \u{1F4C1}', text: `${RULE} That’s the whole trick — every single time.`, img: SNIFF_IMG });
        }, 550);
      }
    }

    function resolveDrop() {
      const mission = MISSIONS[mi];
      const releaseLine = rowAt(lastPointerX, lastPointerY);
      const result = evaluateLasso(mission, touchedLines, releaseLine);
      if (result.status === 'correct') {
        sfx.pop(); sfx.sparkle();
        if (mission.type === 'range') {
          setRowClass(mission.lines[0], 'roped', true);
          setRowClass(mission.lines[1], 'roped', true);
          parkToken(mission.lines, false);
        } else {
          setRowClass(mission.line, 'roped', true);
          parkToken(mission.line, false);
        }
        unlockOptions();
        toast(stage, '\u{1FAA2} Roped! Read it carefully, then answer below.');
      } else if (result.status === 'half') {
        sfx.nudge();
        flashRow(result.line, 'half');
        parkToken('home', false);
        toast(stage, '\u{1F443} Only ONE line roped — a range means walk BOTH lines with your finger!');
      } else if (result.status === 'wrong') {
        sfx.nudge();
        flashRow(result.line, 'wrongflash');
        parkToken('home', false);
        toast(stage, '\u{1F443} "Nothing here but crumbs!" — try another line.');
      } else {
        parkToken('home', false);
      }
    }

    function rowAt(cx, cy) {
      if (cx == null) return null;
      for (let idx = 0; idx < rowRects.length; idx += 1) {
        const rc = rowRects[idx];
        if (cy >= rc.top - 4 && cy <= rc.bottom + 4 && cx >= rc.left - 24 && cx <= rc.right + 24) return idx + 1;
      }
      return null;
    }

    let lastPointerX = null;
    let lastPointerY = null;
    const dragCtl = makeDrag(token, {
      enabled: () => alive && !settling && !roundSolved,
      onStart() {
        if (tokenTween) { tokenTween(); tokenTween = null; }
        settling = false;
        dragOrigLeft = parseFloat(token.style.left) || 0;
        dragOrigTop = parseFloat(token.style.top) || 0;
        rowRects = rowEls.map((r) => r.getBoundingClientRect());
        touchedLines = new Set();
        token.classList.add('dragging');
        sfx.ui();
      },
      onMove(dx, dy, e) {
        token.style.left = (dragOrigLeft + dx) + 'px';
        token.style.top = (dragOrigTop + dy) + 'px';
        lastPointerX = e.clientX; lastPointerY = e.clientY;
        const hovered = rowAt(e.clientX, e.clientY);
        if (hovered !== hoverLine) {
          if (hoverLine != null) setRowClass(hoverLine, 'hover', false);
          hoverLine = hovered;
          if (hoverLine != null) setRowClass(hoverLine, 'hover', true);
        }
        if (hovered != null) touchedLines.add(hovered);
      },
      onEnd(dx, dy, e) {
        token.classList.remove('dragging');
        lastPointerX = e.clientX; lastPointerY = e.clientY;
        if (hoverLine != null) { setRowClass(hoverLine, 'hover', false); hoverLine = null; }
        resolveDrop();
      },
    });

    function clearTransientRowClasses() {
      rowEls.forEach((r) => r.classList.remove('hover', 'roped', 'wrongflash', 'half'));
    }
    function markSolvedRows() {
      rowEls.forEach((r) => r.classList.remove('solved'));
      doneSet.forEach((id) => {
        const m = MISSIONS.find((x) => x.id === id);
        if (!m) return;
        if (m.type === 'range') { setRowClass(m.lines[0], 'solved', true); setRowClass(m.lines[1], 'solved', true); }
        else setRowClass(m.line, 'solved', true);
      });
    }

    function startMission(i) {
      mi = i;
      roundSolved = false;
      winBox.innerHTML = '';
      clearTransientRowClasses();
      markSolvedRows();
      paintChips();
      const mission = MISSIONS[i];
      qcard.innerHTML = mission.stem;
      buildOptions(mission);
      parkToken('home', false);
    }

    const onResize = () => {
      if (dragCtl.dragging()) dragCtl.abort();
      if (tokenTween) { tokenTween(); tokenTween = null; }
      settling = false;
      if (hoverLine != null) { setRowClass(hoverLine, 'hover', false); hoverLine = null; }
      parkToken(parked, true);
    };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    parkToken('home', true);
    startMission(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      if (tokenTween) tokenTween();
      dragCtl.destroy();
      stage.remove();
      ruleCard.remove();
    };
  },
};
