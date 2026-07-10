// FART QUEST — js/anims/poetry.js
// SIMON'S RHYME STRINGS — interactive verse/rhyme machine for the poetry
// Scout Report. Three linked missions: bracket the two verses, string the
// four line-end rhyme pairs, then answer a STORY question (not a rhyme
// question) about what actually happened in the poem.

import {
  el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss,
} from './_kit.js';

const SIMON_IMG = 'assets/monsters/rhymin-simon.png';
const RULE = 'A verse is a paragraph of poetry; rhymes usually land at line-ends. Read a poem like a song: for story first, rhyme second.';
const TAGLINE = 'Everybody hunts for the rhymes first. The real detectives read for the STORY first.';

/* ---------- content: an original Rhymin' Simon poem, 2 verses x 4 lines ---------- */
const POEM = [
  'The sky turned grey and the wind began to moan,',
  'Simon felt a shiver run right through his skin.',
  'He hopped for cover, croaking all alone,',
  'And ducked beneath a lily pad to hide within.',
  'The thunder rumbled loud above the reeds,',
  'And lightning flashed and lit the sky up bright.',
  'But Simon found a fallen log to fit his needs,',
  'And curled up safe and snug and dry all night.',
];
/* rhyme scheme ABAB / CDCD — verified by ear: moan/alone, skin/within, reeds/needs, bright/night */
const PAIR_MAP = { 1: 3, 3: 1, 2: 4, 4: 2, 5: 7, 7: 5, 6: 8, 8: 6 };

const QUIZ_OPTIONS = [
  { id: 'story', correct: true, text: 'A storm blew in over the pond, and Simon found shelter under a fallen log to keep safe and dry.' },
  { id: 'r13', correct: false, text: '"Moan" rhymes with "alone" at the end of lines 1 and 3.' },
  { id: 'r24', correct: false, text: '"Skin" rhymes with "within" at the end of lines 2 and 4.' },
  { id: 'r68', correct: false, text: '"Bright" rhymes with "night" at the end of lines 6 and 8.' },
];

const PHASES = [
  { n: 1, label: '① BRACKET THE VERSES' },
  { n: 2, label: '② STRING THE RHYMES' },
  { n: 3, label: '③ READ THE STORY' },
];

/* ---------- pure helpers (unit-tested standalone before shipping) ---------- */
function rectsOverlap(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const CSS = `
.srs-q { text-align:center; font-weight:700; font-size:clamp(15px,2.6vw,18px); margin-bottom:10px; line-height:1.35; color:var(--ink); }
.srs-poemwrap { position:relative; display:flex; flex-direction:column; gap:14px; }
.srs-verse { position:relative; border:3px dashed rgba(51,38,29,.28); border-radius:14px; padding:10px 14px 10px 34px; background:rgba(255,255,255,.35); }
.srs-verse.claimed { border:3px solid var(--gold-deep); background:rgba(255,243,208,.55); }
.srs-vlabel { position:absolute; top:-13px; left:14px; background:var(--gold-deep); color:#fff; font-size:11px; font-weight:700; letter-spacing:.06em; padding:3px 10px; border-radius:999px; animation:srsPop .3s var(--spring) both; }
.srs-bmark { position:absolute; left:-2px; top:50%; transform:translateY(-50%); font-size:44px; font-weight:700; color:var(--gold-deep); line-height:1; animation:srsPop .3s var(--spring) both; pointer-events:none; }
.srs-line { display:flex; gap:8px; align-items:baseline; padding:2px 0; font-size:14.5px; line-height:1.55; }
.srs-lnum { flex:0 0 auto; width:18px; font-size:10px; font-weight:700; color:#9c8768; text-align:right; }
.srs-ltext { color:var(--ink); }
.srs-w { cursor:pointer; padding:5px 4px; border-radius:6px; }
.srs-w.picked { background:var(--gold); color:#4a3200; animation:srsPop .25s var(--spring) both; }
.srs-w.strung { background:rgba(46,204,113,.28); color:#1d8f4e; font-weight:700; }
.srs-w.wrong { animation:srsShake .4s ease; background:rgba(231,76,60,.22); }
.srs-w.slip { animation:srsShake .4s ease; opacity:.55; }
@keyframes srsPop { 0% { transform:scale(.6); opacity:0; } 60% { transform:scale(1.12); } 100% { transform:scale(1); opacity:1; } }
@keyframes srsShake { 0%,100% { transform:translateX(0); } 25% { transform:translateX(-5px); } 75% { transform:translateX(5px); } }
.srs-svg { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; overflow:visible; }
.srs-string { stroke:var(--gold-deep); stroke-width:2.5; stroke-linecap:round; filter:drop-shadow(0 0 3px rgba(228,184,36,.6)); }
.srs-tray { display:flex; justify-content:center; gap:26px; margin-top:16px; min-height:60px; }
.srs-bracket { width:56px; height:56px; border-radius:16px; background:var(--swamp-mid); color:var(--stink-lime); font-size:34px; font-weight:700; display:flex; align-items:center; justify-content:center; cursor:grab; box-shadow:0 4px 0 rgba(0,0,0,.35); touch-action:none; -webkit-user-select:none; user-select:none; }
.srs-bracket.dragging { cursor:grabbing; box-shadow:0 8px 14px rgba(0,0,0,.3); z-index:20; position:relative; }
.srs-quiz { display:flex; flex-direction:column; gap:8px; margin-top:14px; }
.srs-opt { text-align:left; background:var(--card); border:2.5px solid var(--swamp-mid); color:var(--ink); border-radius:13px; padding:11px 14px; font-weight:600; font-size:14px; cursor:pointer; min-height:44px; }
.srs-opt.picked { background:var(--swamp-mid); color:var(--stink-lime); border-color:var(--swamp-mid); }
.srs-opt.correct { background:rgba(46,204,113,.25); border-color:var(--correct); color:#1d8f4e; }
.srs-opt.wrong { animation:srsShake .4s ease; background:rgba(231,76,60,.2); border-color:#e74c3c; }
.srs-win { margin-top:14px; text-align:center; background:linear-gradient(180deg,#E9FBEF,#D3F3DF); border:3px solid var(--correct); border-radius:14px; padding:12px 16px; animation:srsPop .34s var(--spring) both; }
.srs-win .wp { font-weight:700; color:#1d8f4e; font-size:17px; }
.srs-win .wk { font-size:13.5px; color:#4d6b58; font-weight:500; margin-top:4px; }
`;

export default {
  id: 'poetry',
  title: "SIMON'S RHYME STRINGS",

  mount(host, ctx) {
    injectCss('poetry', CSS);
    let alive = true;
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); return id; };

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const phaseHost = el('div');
    stage.append(chiprow, phaseHost);

    const ruleCard = el('div', 'goldcard', RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;';
    stage.append(ruleCard);
    host.append(stage);

    let phase = 1;
    let unlockedPhase = 1;
    const doneSet = new Set();
    let phaseCleanups = [];
    let onPhaseResize = null;

    function paintChips() {
      chiprow.innerHTML = '';
      PHASES.forEach((p) => {
        const c = el('button', 'anim-mchip' + (p.n === phase ? ' active' : '') + (doneSet.has(p.n) ? ' done' : ''), p.label);
        c.addEventListener('click', () => { sfx.ui(); goPhase(p.n); });
        chiprow.append(c);
      });
    }

    function goPhase(n) {
      if (n > unlockedPhase) { sfx.nudge(); return; }
      phaseCleanups.forEach((fn) => fn());
      phaseCleanups = [];
      onPhaseResize = null;
      phase = n;
      paintChips();
      if (n === 1) renderPhase1();
      else if (n === 2) renderPhase2();
      else renderPhase3();
    }

    function addNextButton(wrap, n, label) {
      const b = el('button', 'btn btn-gold', label);
      b.style.cssText = 'margin-top:10px;padding:11px 22px;font-size:15px;display:block;';
      b.addEventListener('click', () => { sfx.ui(); goPhase(n); });
      wrap.append(b);
    }

    function renderLine(lineNum) {
      const row = el('div', 'srs-line');
      row.append(el('span', 'srs-lnum', String(lineNum)), el('span', 'srs-ltext', POEM[lineNum - 1]));
      return row;
    }

    function renderTappableLine(lineNum) {
      const row = el('div', 'srs-line');
      row.append(el('span', 'srs-lnum', String(lineNum)));
      const textSpan = el('span', 'srs-ltext');
      const words = POEM[lineNum - 1].split(' ');
      words.forEach((w, i) => {
        const wEl = el('span', 'srs-w', w);
        wEl.dataset.line = String(lineNum);
        wEl.dataset.end = i === words.length - 1 ? '1' : '0';
        textSpan.append(wEl, document.createTextNode(' '));
      });
      row.append(textSpan);
      return row;
    }

    /* ===================== PHASE 1 — bracket the verses ===================== */
    function renderPhase1() {
      const wrap = el('div');
      const q = el('div', 'srs-q', 'Drag a bracket around each VERSE — a verse is a paragraph of poetry.');
      const poemWrap = el('div', 'srs-poemwrap');
      const v1 = el('div', 'srs-verse');
      const v2 = el('div', 'srs-verse');
      for (let l = 1; l <= 4; l += 1) v1.append(renderLine(l));
      for (let l = 5; l <= 8; l += 1) v2.append(renderLine(l));
      poemWrap.append(v1, v2);
      const tray = el('div', 'srs-tray');
      wrap.append(q, poemWrap, tray);
      phaseHost.replaceChildren(wrap);

      const zones = [v1, v2];
      const claimed = [false, false];
      const tokenCtrls = [];

      function revealVerse(idx) {
        const zoneEl = zones[idx];
        zoneEl.classList.add('claimed');
        zoneEl.prepend(el('div', 'srs-bmark', '{'));
        zoneEl.prepend(el('div', 'srs-vlabel', `VERSE ${idx + 1}`));
        sfx.sparkle();
        const r = zoneEl.getBoundingClientRect(); const sr = stage.getBoundingClientRect();
        sparkleBurst(stage, r.left - sr.left + 24, r.top - sr.top + r.height / 2, 8);
        toast(stage, `VERSE ${idx + 1} bracketed — four lines that belong together!`);
        if (claimed[0] && claimed[1]) phase1Complete(wrap);
      }

      function makeToken() {
        const t = el('div', 'srs-bracket', '{');
        tray.append(t);
        let dx = 0; let dy = 0; let placed = false; let animCancel = null;
        const drag = makeDrag(t, {
          enabled: () => !placed,
          onStart() {
            if (animCancel) { animCancel(); animCancel = null; }
            t.classList.add('dragging'); sfx.ui();
          },
          onMove(ddx, ddy) { dx = ddx; dy = ddy; t.style.transform = `translate(${dx}px,${dy}px)`; },
          onEnd() {
            t.classList.remove('dragging');
            const tr = t.getBoundingClientRect();
            let hit = -1;
            zones.forEach((z, i) => { if (hit === -1 && !claimed[i] && rectsOverlap(tr, z.getBoundingClientRect())) hit = i; });
            if (hit === -1) {
              const onClaimed = zones.some((z, i) => claimed[i] && rectsOverlap(tr, z.getBoundingClientRect()));
              if (onClaimed) toast(stage, 'That verse already has its bracket — try the other four lines!');
              sfx.nudge();
              const fx = dx; const fy = dy;
              animCancel = tween((v) => { t.style.transform = `translate(${fx * (1 - v)}px,${fy * (1 - v)}px)`; }, 0, 1, 260, () => { t.style.transform = ''; dx = 0; dy = 0; animCancel = null; });
              return;
            }
            claimed[hit] = true;
            placed = true;
            const zr = zones[hit].getBoundingClientRect();
            const trayLeft = tr.left - dx; const trayTop = tr.top - dy;
            const tdx = zr.left - trayLeft + 10; const tdy = zr.top - trayTop + 6;
            const fx = dx; const fy = dy;
            sfx.tick();
            animCancel = tween((v) => {
              t.style.transform = `translate(${fx + (tdx - fx) * v}px,${fy + (tdy - fy) * v}px) scale(${1 - 0.5 * v})`;
              t.style.opacity = String(1 - v);
            }, 0, 1, 320, () => { t.remove(); revealVerse(hit); });
          },
        });
        phaseCleanups.push(() => drag.destroy());
        // Unconditionally cancel any in-flight fly-to-verse tween on teardown
        // (phase switch or full unmount) — reset() below is guarded by
        // `placed` for the resize-abandons-live-drag case, but a correct drop
        // sets placed=true before the tween starts, so it would otherwise
        // survive teardown and fire revealVerse()/phase1Complete() against a
        // detached stage.
        phaseCleanups.push(() => { if (animCancel) { animCancel(); animCancel = null; } });
        tokenCtrls.push({
          reset() {
            if (placed) return;
            drag.abort();
            if (animCancel) { animCancel(); animCancel = null; }
            t.classList.remove('dragging');
            t.style.transform = ''; dx = 0; dy = 0;
          },
        });
      }
      makeToken(); makeToken();

      onPhaseResize = () => { tokenCtrls.forEach((c) => c.reset()); };
    }

    function phase1Complete(wrap) {
      doneSet.add(1); unlockedPhase = Math.max(unlockedPhase, 2); paintChips();
      sfx.win();
      const tid = later(() => {
        if (phase !== 1) return;
        bubble(stage, {
          title: 'TWO VERSES FOUND! 📜',
          text: `${RULE}<br><br>Eight lines, split into two neat groups of four — you just SAW it happen.`,
          img: SIMON_IMG,
        }).then(() => { if (alive && phase === 1) addNextButton(wrap, 2, 'NEXT: STRING THE RHYMES ➡'); });
      }, 300);
      // The 300ms delay lets the win-jingle land before the modal veil — but
      // paintChips() above already unlocked chip ②, so the child can navigate
      // away before this fires. Cancel it on phase teardown (the phase===1
      // guard above is belt-and-suspenders for the same reason).
      phaseCleanups.push(() => clearTimeout(tid));
    }

    /* ===================== PHASE 2 — rhyme strings ===================== */
    function renderPhase2() {
      const wrap = el('div');
      const q = el('div', 'srs-q', 'Tap two LINE-END words to tie a rhyme string between them.');
      const poemWrap = el('div', 'srs-poemwrap');
      const v1 = el('div', 'srs-verse claimed'); v1.append(el('div', 'srs-vlabel', 'VERSE 1'));
      const v2 = el('div', 'srs-verse claimed'); v2.append(el('div', 'srs-vlabel', 'VERSE 2'));
      for (let l = 1; l <= 4; l += 1) v1.append(renderTappableLine(l));
      for (let l = 5; l <= 8; l += 1) v2.append(renderTappableLine(l));
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'srs-svg');
      poemWrap.append(v1, v2, svg);
      wrap.append(q, poemWrap);
      phaseHost.replaceChildren(wrap);

      const state = { pending: null, strung: new Set() };
      const pairs = [];

      function pointFor(line) {
        const w = poemWrap.querySelector(`.srs-w[data-line="${line}"][data-end="1"]`);
        const wr = w.getBoundingClientRect(); const pr = poemWrap.getBoundingClientRect();
        return { x: wr.left - pr.left + wr.width / 2, y: wr.top - pr.top + wr.height / 2 };
      }
      function redraw() {
        svg.innerHTML = '';
        pairs.forEach(([a, b]) => {
          const p1 = pointFor(a); const p2 = pointFor(b);
          const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          ln.setAttribute('x1', p1.x); ln.setAttribute('y1', p1.y);
          ln.setAttribute('x2', p2.x); ln.setAttribute('y2', p2.y);
          ln.setAttribute('class', 'srs-string');
          svg.appendChild(ln);
        });
      }
      function clearPendingGlow() { poemWrap.querySelectorAll('.srs-w.picked').forEach((x) => x.classList.remove('picked')); }
      function endWordEl(line) { return poemWrap.querySelector(`.srs-w[data-line="${line}"][data-end="1"]`); }

      function handleTap(line, isEnd, wordEl) {
        if (isEnd && state.strung.has(line)) { sfx.blip(760, 0.09, 0.14); return; }
        if (!isEnd) {
          sfx.nudge();
          wordEl.classList.add('slip');
          later(() => wordEl.classList.remove('slip'), 450);
          toast(stage, 'Rhymes live at line-ENDS — try the very last word of a line.');
          state.pending = null; clearPendingGlow();
          return;
        }
        if (state.pending === null) { state.pending = line; wordEl.classList.add('picked'); sfx.ui(); return; }
        if (state.pending === line) { state.pending = null; wordEl.classList.remove('picked'); return; }
        const a = state.pending; const b = line;
        const wa = endWordEl(a);
        clearPendingGlow();
        if (PAIR_MAP[a] === b) {
          state.strung.add(a); state.strung.add(b);
          pairs.push([a, b]);
          state.pending = null;
          wa.classList.add('strung'); wordEl.classList.add('strung');
          sfx.blip(660, 0.1, 0.16);
          later(() => sfx.blip(880, 0.12, 0.16), 110);
          redraw();
          if (state.strung.size === 8) phase2Complete(wrap);
        } else {
          state.pending = null;
          [wa, wordEl].forEach((x) => { x.classList.add('wrong'); later(() => x.classList.remove('wrong'), 500); });
          sfx.nudge();
          toast(stage, `"${wa.textContent.trim()}" and "${wordEl.textContent.trim()}" don't chime — read the line-ends again and listen for the match.`);
        }
      }

      const onClick = (e) => {
        const w = e.target.closest('.srs-w');
        if (!w) return;
        handleTap(Number(w.dataset.line), w.dataset.end === '1', w);
      };
      poemWrap.addEventListener('click', onClick);
      phaseCleanups.push(() => poemWrap.removeEventListener('click', onClick));

      onPhaseResize = () => { if (pairs.length) redraw(); };
    }

    function phase2Complete(wrap) {
      doneSet.add(2); unlockedPhase = Math.max(unlockedPhase, 3); paintChips();
      sfx.win(); party(stage);
      const tid = later(() => {
        if (phase !== 2) return;
        bubble(stage, {
          title: 'ALL FOUR RHYMES STRUNG! 🎵',
          text: 'Every string landed on a LINE-END word — that\'s where rhymes live. Now for the hardest part: what did the poem actually SAY?',
          img: SIMON_IMG,
        }).then(() => { if (alive && phase === 2) addNextButton(wrap, 3, 'NEXT: READ THE STORY ➡'); });
      }, 300);
      phaseCleanups.push(() => clearTimeout(tid));
    }

    /* ===================== PHASE 3 — the story question ===================== */
    function renderPhase3() {
      const wrap = el('div');
      const q = el('div', 'srs-q', `Rhymin' Simon says: "${TAGLINE}" What actually happened?`);
      const poemWrap = el('div', 'srs-poemwrap');
      const v1 = el('div', 'srs-verse claimed'); v1.append(el('div', 'srs-vlabel', 'VERSE 1'));
      const v2 = el('div', 'srs-verse claimed'); v2.append(el('div', 'srs-vlabel', 'VERSE 2'));
      for (let l = 1; l <= 4; l += 1) v1.append(renderLine(l));
      for (let l = 5; l <= 8; l += 1) v2.append(renderLine(l));
      poemWrap.append(v1, v2);

      const optsWrap = el('div', 'srs-quiz');
      const shuffled = shuffle(QUIZ_OPTIONS.slice());
      let picked = null;
      let checked = false;
      const btns = shuffled.map((opt) => {
        const b = el('button', 'srs-opt', opt.text);
        b.addEventListener('click', () => {
          if (checked) return;
          sfx.ui();
          btns.forEach((x) => x.el.classList.remove('picked'));
          if (picked === opt.id) { picked = null; return; }
          picked = opt.id; b.classList.add('picked');
        });
        optsWrap.append(b);
        return { id: opt.id, el: b, correct: opt.correct };
      });

      const checkBtn = el('button', 'btn btn-gold', 'CHECK MY ANSWER 💨');
      checkBtn.style.cssText = 'display:block;margin:12px auto 0;padding:12px 24px;font-size:15px;';
      checkBtn.addEventListener('click', () => {
        if (checked || !picked) { if (!picked) { sfx.nudge(); toast(stage, 'Pick an answer first!'); } return; }
        const chosen = btns.find((x) => x.id === picked);
        sfx.ui();
        if (chosen.correct) {
          checked = true;
          chosen.el.classList.add('correct');
          sfx.win(); party(stage);
          bubble(stage, {
            title: 'STORY SPOTTED! 🎉',
            text: 'Exactly right — <b>a storm blew in and Simon sheltered safely under a log</b>. The rhyme is the tune, but the story is the song — and you read for the STORY first, just like a real detective!',
            img: SIMON_IMG,
          }).then(() => { if (alive) phase3Complete(); });
        } else {
          chosen.el.classList.add('wrong');
          later(() => { if (chosen.el) chosen.el.classList.remove('wrong'); }, 500);
          sfx.nudge();
          toast(stage, 'That rhyme is real — but it\'s the TUNE, not the story. What actually HAPPENED to Simon?');
          picked = null; chosen.el.classList.remove('picked');
        }
      });

      wrap.append(q, poemWrap, optsWrap, checkBtn);
      phaseHost.replaceChildren(wrap);
    }

    function phase3Complete() {
      doneSet.add(3); paintChips();
      ctx.complete();
      const win = el('div', 'srs-win', `<div class="wp">SIMON'S SECRET UNLOCKED! 🐸</div><div class="wk">${TAGLINE}</div>`);
      phaseHost.appendChild(win);
    }

    paintChips();
    goPhase(1);

    const onResize = () => { if (onPhaseResize) onPhaseResize(); };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((id) => clearTimeout(id));
      timers.clear();
      phaseCleanups.forEach((fn) => fn());
      phaseCleanups = [];
      stage.remove();
      ruleCard.remove();
    };
  },
};
