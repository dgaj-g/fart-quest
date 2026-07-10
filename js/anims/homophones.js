// FART QUEST — js/anims/homophones.js
// THE TWIN SCANNER — a sentence sits with a glowing gap; the sound-twins
// line up below. Tap a twin to lift it INTO the scanner: the scanner runs
// ITS OWN proof (a place-compass, a belonging-thread, or an un-squeeze
// re-read) and shows the truth — pass or fail — right there in the
// sentence. The proof does the judging, not memory. Once the child has
// watched enough proofs, they STAMP the survivor: get it right and the
// gap locks green; stamp a twin whose own proof just failed and the stamp
// wobbles off — no auto-correct, try another.

import { el, sfx, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const CREATURE_IMG = 'assets/monsters/two-too-the-twinned.png';
const RULE = "Same sound, different job: there = place, their = belonging, they're = they are. Prove it by un-squeezing.";

/* ---------- pure content: twin sets + missions ----------
   Every gap has exactly ONE pass candidate (keyed by the correct word) and
   TWO fail candidates (the other twins in its set) — verified in a /tmp
   scratch script alongside a full sentence-reconstruction check for every
   mission. Anchor/owner/owned fields only ever point at real words that
   are actually present in that mission's sentence. */
const TWINSETS = {
  a: [
    { word: 'there', kind: 'place', color: '#3B6FD1' },
    { word: 'their', kind: 'belonging', color: '#D9A21B' },
    { word: "they're", kind: 'squeeze', color: '#9B59D0', expand: 'they are' },
  ],
  b: [
    { word: 'where', kind: 'askplace', color: '#3B6FD1', meaning: 'asks "which place?"' },
    { word: 'were', kind: 'pastform', color: '#D9A21B', meaning: 'the past of "are"' },
    { word: 'wear', kind: 'clothing', color: '#9B59D0', meaning: 'putting clothes on a body' },
  ],
};

const MISSIONS = [
  {
    id: 'bags', chip: 'BAGS', setKey: 'a',
    tokens: ['The', 'rugby', 'squad', 'say', { gap: 0 }, 'bags', 'are', 'heavy.'],
    gaps: [{
      correct: 'their',
      pass: { their: { owner: 'squad', owned: 'bags', text: 'The bags belong to the squad — the thread pulls taut. THEIR is the belonging twin.' } },
      fail: {
        there: { text: 'The compass hunts the whole sentence for a place… nothing there. THERE only ever points at a place.' },
        "they're": { text: 'Un-squeezed in place: "The rugby squad say they are bags are heavy." — nonsense! Klaxon.' },
      },
    }],
    worked: 'their bags are heavy — the belonging thread ties the bags to the squad.',
  },
  {
    id: 'over', chip: 'OVER', setKey: 'a',
    tokens: ['Look', 'over', { gap: 0 }, '!'],
    gaps: [{
      correct: 'there',
      pass: { there: { anchor: 'over', text: 'The compass flies to "over" and locks on — THERE is pointing at a place.' } },
      fail: {
        their: { text: 'Nothing here is OWNED by anyone — the thread hangs loose. THEIR needs something to belong to someone.' },
        "they're": { text: 'Un-squeezed in place: "Look over they are!" — nonsense! Klaxon.' },
      },
    }],
    worked: 'Look over there! — the compass found a place to point at.',
  },
  {
    id: 'late', chip: 'LATE', setKey: 'a',
    tokens: ['The', 'twins', 'missed', 'the', 'bus', '—', { gap: 0 }, 'late', 'again!'],
    gaps: [{
      correct: "they're",
      pass: { "they're": { text: 'Un-squeezed in place: "The twins missed the bus — they are late again!" — reads perfectly. THEY’RE is correct.' } },
      fail: {
        there: { text: 'The compass hunts the whole sentence for a place… nothing there. THERE only ever points at a place.' },
        their: { text: 'Nothing here is OWNED by anyone — the thread hangs loose. THEIR needs something to belong to someone.' },
      },
    }],
    worked: 'they’re late again — the un-squeeze proof reads perfectly: they ARE late again.',
  },
  {
    id: 'boots', chip: 'BOOTS', setKey: 'b',
    tokens: ['Jarlath', 'forgot', { gap: 0 }, 'he’d', 'left', 'his', 'boots,', 'so', 'he', 'had', 'nothing', 'to', { gap: 1 }, 'for', 'training.'],
    gaps: [
      {
        correct: 'where',
        pass: { where: { text: 'This is asking WHICH PLACE the boots are — WHERE is the place-question twin.' } },
        fail: {
          were: { text: '"Were" is only ever the past of "are" — it can’t ask a place question. WHERE fits the "which place?" job.' },
          wear: { text: '"Wear" only ever means putting clothes on a body — it can’t ask a place question either.' },
        },
      },
      {
        correct: 'wear',
        pass: { wear: { text: 'Putting boots ON A BODY is exactly WEAR’s job — nothing else fits.' } },
        fail: {
          where: { text: '"Where" only ever asks a place question — there’s no place being asked about here.' },
          were: { text: '"Were" is only ever the past of "are" — it can’t describe putting something on.' },
        },
      },
    ],
    worked: 'Jarlath forgot where he’d left his boots, so he had nothing to wear for training. — WHERE asks the place, WEAR puts clothes on a body.',
  },
];
const WIN_PHRASES = ['TWINS SEPARATED! 🔍', 'PROOF POSITIVE! ✅', 'CASE CLOSED, SCANNER STYLE!', 'NO SOUND-TWIN FOOLED YOU!'];
const KIND_ICON = { place: '🧭', belonging: '🧵', squeeze: '🔁', askplace: '🧭', pastform: '⏪', clothing: '👕' };

function candidateFor(gap, word) {
  const isPass = word === gap.correct;
  const src = isPass ? gap.pass[word] : gap.fail[word];
  return Object.assign({ pass: isPass }, src);
}
function kindLabel(kind, pass) {
  const L = {
    place: pass ? '🧭 PLACE FOUND!' : '🧭 NO PLACE FOUND',
    belonging: pass ? '🧵 THREAD SNAPS TAUT!' : '🧵 NOTHING TO TIE',
    squeeze: pass ? '🔁 UN-SQUEEZE WORKS!' : '🔁 UN-SQUEEZE FAILS!',
    askplace: pass ? '🧭 PLACE QUESTION!' : '🧭 NOT A PLACE QUESTION',
    pastform: pass ? '⏪ PAST-TENSE FIT!' : '⏪ NOT A PAST-TENSE SPOT',
    clothing: pass ? '👕 CLOTHING FITS!' : '👕 NOTHING TO WEAR HERE',
  };
  return L[kind] || '';
}
function proofBody(meta, word, cand) {
  if (meta.kind === 'place') {
    return `<div class="tsc-arrow-row"><span class="tsc-arrow-icon">🧭</span>${cand.pass ? `found: <b>${cand.anchor}</b>` : 'searching… nothing found'}</div>`;
  }
  if (meta.kind === 'belonging') {
    if (cand.pass) {
      return `<div class="tsc-thread-row"><span class="tsc-chip">${cand.owner}</span><span class="tsc-threadline"></span><span class="tsc-chip">${cand.owned}</span></div>`;
    }
    return '<div class="tsc-thread-row slack">🧵 …nothing here to tie…</div>';
  }
  if (meta.kind === 'join') {
    return `<div class="tsc-arrow-row"><span class="tsc-arrow-icon">🔗</span>${cand.pass ? `joins: <b>${cand.anchor}</b>` : 'no verb it can join'}</div>`;
  }
  if (meta.kind === 'squeeze') {
    return `<div class="tsc-expand-row"><span class="tsc-chip">${word}</span><span class="tsc-arrowtxt">=</span><span class="tsc-chip">${meta.expand}</span></div>`;
  }
  return `<div class="tsc-expand-row"><span class="tsc-chip">${word}</span><span class="tsc-arrowtxt">=</span><span class="tsc-arrowtxt">${meta.meaning}</span></div>`;
}
// Joins sentence tokens with sensible spacing: tight punctuation (!?.,)
// never gets a leading space, everything else does. `gapHtml(idx)` renders
// the markup for gap token `idx`.
function renderTokens(tokens, gapHtml) {
  const pieces = tokens.map((tok) => (typeof tok === 'string'
    ? { html: tok, noSpace: /^[!?.,]+$/.test(tok) }
    : { html: gapHtml(tok.gap), noSpace: false }));
  return pieces.reduce((acc, p, i) => acc + (i > 0 && !p.noSpace ? ' ' : '') + p.html, '');
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- the anim card ---------- */
export default {
  id: 'homophones',
  title: 'THE TWIN SCANNER',

  mount(host, ctx) {
    injectCss('homophones', CSS);
    let alive = true;
    let mi = 0; let gi = 0;
    let loaded = null; let scanningWord = null; let busy = false;
    let lineupOrder = []; let scannedStatus = {};
    const doneSet = new Set();
    let masteredShown = false;
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };
    const clearAllTimers = () => { timers.forEach((t) => clearTimeout(t)); timers.clear(); };

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'tsc-sentence');
    const qsub = el('div', 'tsc-qsub');
    const proofPanel = el('div', 'tsc-proof');
    proofPanel.style.display = 'none';
    const lineup = el('div', 'tsc-lineup');
    const actions = el('div', 'tsc-actions');
    const stampBtn = el('button', 'tsc-stamp', 'SCAN A TWIN FIRST');
    actions.append(stampBtn);
    const winBox = el('div');
    stage.append(chiprow, q, qsub, proofPanel, lineup, actions, winBox);
    host.append(stage);

    const ruleCard = el('div', 'tsc-rulecard', RULE);
    host.append(ruleCard);

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), m.chip);
        c.style.minHeight = '44px';
        c.disabled = busy;
        c.addEventListener('click', () => { if (busy) return; sfx.ui(); startMission(i); });
        chiprow.append(c);
      });
    }

    function paintSentence() {
      const mission = MISSIONS[mi];
      const gap = mission.gaps[gi];
      let candNow = null;
      if (loaded) candNow = candidateFor(gap, loaded);
      q.innerHTML = renderTokens(mission.tokens, (idx) => {
        if (idx < gi) return `<span class="tsc-gap solved">${mission.gaps[idx].correct}</span>`;
        if (idx === gi) {
          if (loaded) return `<span class="tsc-gap loaded ${candNow.pass ? 'pass' : 'fail'}">${loaded}</span>`;
          return '<span class="tsc-gap active">___</span>';
        }
        return '<span class="tsc-gap future">___</span>';
      });
    }

    function paintLineup() {
      const mission = MISSIONS[mi];
      const twinData = TWINSETS[mission.setKey];
      lineup.innerHTML = '';
      lineupOrder.forEach((word) => {
        const meta = twinData.find((t) => t.word === word);
        const status = scannedStatus[word];
        const cls = 'tsc-tile' + (status ? ' scanned-' + status : '') + (scanningWord === word ? ' loading' : '');
        const b = el('button', cls,
          `<span class="tsc-tile-icon">${KIND_ICON[meta.kind]}</span><span>${word}</span>`
          + (status ? `<span class="tsc-tile-badge">${status === 'pass' ? '✓' : '✕'}</span>` : ''));
        b.style.borderColor = meta.color; b.style.color = meta.color;
        b.disabled = busy;
        b.addEventListener('click', () => scanWord(word));
        lineup.append(b);
      });
    }

    function paintProof() {
      if (!loaded) { proofPanel.style.display = 'none'; return; }
      const mission = MISSIONS[mi];
      const gap = mission.gaps[gi];
      const meta = TWINSETS[mission.setKey].find((t) => t.word === loaded);
      const cand = candidateFor(gap, loaded);
      proofPanel.className = 'tsc-proof ' + (cand.pass ? 'pass' : 'fail');
      proofPanel.innerHTML = `<div class="tsc-proof-head">${kindLabel(meta.kind, cand.pass)}</div>`
        + `<div class="tsc-proof-body">${proofBody(meta, loaded, cand)}</div>`
        + `<div class="tsc-proof-text">${cand.text}</div>`;
      proofPanel.style.display = '';
    }

    function paintStamp() {
      stampBtn.style.display = '';
      stampBtn.disabled = !loaded || busy;
      stampBtn.textContent = loaded ? `STAMP "${loaded}" ✅` : 'SCAN A TWIN FIRST';
    }

    function renderGapStart() {
      const mission = MISSIONS[mi];
      lineupOrder = shuffle(TWINSETS[mission.setKey].map((c) => c.word));
      scannedStatus = {}; loaded = null; scanningWord = null; busy = false;
      qsub.textContent = mission.gaps.length > 1
        ? `Gap ${gi + 1} of ${mission.gaps.length} — scan a twin, watch its proof, then stamp the survivor.`
        : 'Scan a twin, watch its proof, then stamp the survivor.';
      paintSentence(); paintLineup(); paintProof(); paintStamp(); paintChips();
    }

    function startMission(i) {
      mi = i; gi = 0;
      winBox.innerHTML = '';
      paintChips();
      renderGapStart();
    }

    function scanWord(word) {
      if (busy) return;
      busy = true; scanningWord = word;
      sfx.ui(); sfx.whoosh();
      paintLineup(); paintStamp(); paintChips();
      later(() => {
        scanningWord = null;
        loaded = word;
        const mission = MISSIONS[mi]; const gap = mission.gaps[gi];
        const cand = candidateFor(gap, word);
        scannedStatus[word] = cand.pass ? 'pass' : 'fail';
        sfx[cand.pass ? 'sparkle' : 'nudge']();
        busy = false;
        paintSentence(); paintLineup(); paintProof(); paintStamp(); paintChips();
      }, 420);
    }

    function onStamp() {
      if (busy || !loaded) return;
      const mission = MISSIONS[mi]; const gap = mission.gaps[gi];
      if (loaded === gap.correct) {
        busy = true;
        sfx.win();
        paintLineup(); paintStamp(); paintChips();
        const gr = q.querySelector('.tsc-gap.loaded');
        if (gr) {
          const gb = gr.getBoundingClientRect(); const sb = stage.getBoundingClientRect();
          sparkleBurst(stage, gb.left - sb.left + gb.width / 2, gb.top - sb.top + gb.height / 2, 8);
        }
        later(() => {
          if (!alive) return;
          gi += 1;
          if (gi < mission.gaps.length) renderGapStart();
          else finishMission();
        }, 700);
      } else {
        sfx.nudge();
        stampBtn.classList.remove('shake'); void stampBtn.offsetWidth; stampBtn.classList.add('shake');
        toast(stage, 'That twin’s own proof just failed — scan another, or check the readout again.');
      }
    }
    stampBtn.addEventListener('click', onStamp);

    function finishMission() {
      busy = false;
      const mission = MISSIONS[mi];
      doneSet.add(mission.id);
      paintChips();
      sfx.win(); party(stage, 14);
      q.innerHTML = renderTokens(mission.tokens, (idx) => `<span class="tsc-gap solved">${mission.gaps[idx].correct}</span>`);
      proofPanel.style.display = 'none';
      lineup.innerHTML = '';
      stampBtn.style.display = 'none';
      qsub.textContent = 'Solved! The proof did the judging.';
      const phrase = WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)];
      const w = el('div', 'tsc-win', `<div class="tsc-wp">${phrase}</div><div class="tsc-wk">${mission.worked}</div>`);
      winBox.innerHTML = ''; winBox.append(w);
      const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
      const nb = el('button', 'btn btn-gold', nextIdx !== -1 ? 'NEXT ONE ➡' : 'PLAY AGAIN 🔁');
      nb.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
      nb.addEventListener('click', () => { sfx.ui(); startMission(nextIdx !== -1 ? nextIdx : 0); });
      w.append(nb);
      if (doneSet.size === MISSIONS.length && !masteredShown) {
        masteredShown = true;
        ctx.complete();
        later(() => {
          if (!alive) return;
          bubble(stage, {
            title: 'TWIN SCANNER MASTERED! 🔎',
            text: 'Don’t guess twins — run the proof: un-squeeze it, point at the place, or tie the belonging thread.',
            img: CREATURE_IMG,
          });
        }, 700);
      }
    }

    // no live drags/tweens exist in this module (every movement is a short
    // settle timer + CSS keyframe) — resize just cancels any in-flight scan
    // reveal so a mid-flip proof never lands after the stage has moved.
    const onResize = () => {
      if (!alive || !scanningWord) return;
      clearAllTimers();
      scanningWord = null; busy = false;
      paintLineup(); paintStamp(); paintChips();
    };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    startMission(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      clearAllTimers();
      stampBtn.removeEventListener('click', onStamp);
      stage.remove();
      ruleCard.remove();
    };
  },
};

const CSS = `
.tsc-sentence { text-align: center; font-weight: 700; font-size: clamp(18px, 3vw, 26px); line-height: 1.6; margin-bottom: 2px; }
.tsc-qsub { text-align: center; font-size: 12.5px; color: #6b5744; font-weight: 500; margin-bottom: 10px; max-width: 560px; margin-left: auto; margin-right: auto; }
.tsc-gap { display: inline-block; min-width: 3.2em; text-align: center; border-bottom: 3px dashed var(--gold-deep); color: #a08c74; }
.tsc-gap.active { animation: tscGapGlow 1.3s ease-in-out infinite; border-color: var(--stink); }
@keyframes tscGapGlow { 0%, 100% { opacity: .55; } 50% { opacity: 1; } }
.tsc-gap.loaded { border-bottom-style: solid; border-radius: 8px; padding: 0 6px; }
.tsc-gap.loaded.pass { border-color: var(--correct); background: #E9FBEF; color: #1d8f4e; }
.tsc-gap.loaded.fail { border-color: var(--wrong); background: #FDEDEC; color: #b03a2e; }
.tsc-gap.solved { border: none; background: transparent; color: #1d8f4e; font-weight: 800; }
.tsc-gap.future { opacity: .38; }
.tsc-proof { margin: 10px auto 0; max-width: 560px; border-radius: 16px; padding: 11px 16px; border: 3px solid; animation: animBubbleIn .3s var(--spring) both; }
.tsc-proof.pass { background: linear-gradient(180deg,#E9FBEF,#D3F3DF); border-color: var(--correct); }
.tsc-proof.fail { background: linear-gradient(180deg,#FDEDEC,#FBD7D2); border-color: var(--wrong); animation: tscShake .4s ease, animBubbleIn .3s var(--spring) both; }
.tsc-proof-head { font-weight: 800; font-size: 14px; margin-bottom: 6px; }
.tsc-proof.fail .tsc-proof-head { color: #a4382a; }
.tsc-proof.pass .tsc-proof-head { color: #1d8f4e; }
.tsc-proof-body { margin-bottom: 6px; font-size: 14px; }
.tsc-proof-text { font-size: 13.5px; font-weight: 500; line-height: 1.4; color: #4d443a; }
.tsc-proof.fail .tsc-proof-text { color: #7a2e22; }
.tsc-arrow-row { text-align: center; font-size: 14px; font-weight: 700; }
.tsc-arrow-icon { font-size: 22px; display: inline-block; margin-right: 6px; }
.tsc-proof.fail .tsc-arrow-icon { animation: tscSearch 1s ease-in-out infinite; }
@keyframes tscSearch { 0%, 100% { transform: rotate(-12deg); } 50% { transform: rotate(12deg); } }
.tsc-thread-row { display: flex; align-items: center; justify-content: center; gap: 8px; }
.tsc-thread-row.slack { opacity: .75; font-style: italic; font-size: 13.5px; }
.tsc-threadline { width: 46px; height: 3px; background: repeating-linear-gradient(90deg, #8a7a63 0 6px, transparent 6px 10px); }
.tsc-proof.pass .tsc-threadline { background: var(--correct); animation: tscTaut .3s ease; }
@keyframes tscTaut { 0% { width: 10px; } 100% { width: 46px; } }
.tsc-expand-row { display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700; flex-wrap: wrap; text-align: center; }
.tsc-chip { background: #fff; border: 2.5px solid var(--ink); border-radius: 10px; padding: 4px 10px; font-weight: 700; }
.tsc-arrowtxt { font-weight: 700; color: #6b5744; font-size: 13px; }
.tsc-lineup { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin: 12px 0; }
.tsc-tile {
  min-width: 96px; padding: 10px 14px; border-radius: 14px; border: 3px solid; font-weight: 800; font-size: 15px;
  cursor: pointer; background: var(--card); box-shadow: 0 3px 0 rgba(0,0,0,.2);
  display: flex; flex-direction: column; align-items: center; gap: 2px; position: relative;
}
.tsc-tile .tsc-tile-icon { font-size: 18px; }
.tsc-tile .tsc-tile-badge { position: absolute; top: -8px; right: -8px; background: #fff; border-radius: 50%; width: 20px; height: 20px; font-size: 13px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 0 rgba(0,0,0,.2); }
.tsc-tile.scanned-pass .tsc-tile-badge { color: var(--correct); }
.tsc-tile.scanned-fail .tsc-tile-badge { color: var(--wrong); }
.tsc-tile:active { transform: translateY(2px); box-shadow: 0 1px 0 rgba(0,0,0,.2); }
.tsc-tile.loading { animation: tscTileLoad .42s ease; }
@keyframes tscTileLoad { 0% { transform: translateY(0) scale(1); } 40% { transform: translateY(-14px) scale(1.08); } 100% { transform: translateY(0) scale(1); } }
.tsc-tile:disabled { opacity: .5; cursor: default; }
.tsc-actions { display: flex; justify-content: center; margin-top: 8px; }
.tsc-stamp {
  background: linear-gradient(180deg,#F4C542,#D9A21B); border: 3px solid #7a5a0f; border-radius: 16px;
  padding: 12px 26px; font-weight: 800; font-size: 15.5px; color: #3a2c05; cursor: pointer;
  box-shadow: 0 4px 0 rgba(0,0,0,.25); min-height: 48px;
}
.tsc-stamp:disabled { opacity: .45; cursor: default; }
.tsc-stamp:active:not(:disabled) { transform: translateY(3px); box-shadow: 0 1px 0 rgba(0,0,0,.25); }
.tsc-stamp.shake { animation: tscShake .4s ease; }
@keyframes tscShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-7px); } 75% { transform: translateX(7px); } }
.tsc-win {
  margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF);
  border: 3px solid var(--correct); border-radius: 14px; padding: 10px 14px;
  animation: animBubbleIn .34s var(--spring) both;
}
.tsc-wp { font-weight: 700; color: #1d8f4e; font-size: 16px; }
.tsc-wk { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 4px; }
.tsc-rulecard {
  margin-top: 12px; font-size: 13.5px; line-height: 1.35; background: linear-gradient(180deg,#FFF3CE,#FBE29A);
  border: 3px solid var(--gold-deep); border-radius: 14px; padding: 10px 14px; color: #5a4408;
  font-weight: 700; max-width: 980px; margin-left: auto; margin-right: auto;
}
`;
