// FART QUEST — js/anims/parts-of-speech.js
// THE NOUN HOUND'S FETCH YARD — interactive word-sorting yard for the
// parts-of-speech Scout Report (Grammar Grotto). Words are throwable balls;
// four kennels (NOUN / VERB / ADJECTIVE / ADVERB) each have a resident who
// reacts when the right ball lands. Throw a verb at the Hound and he just
// stares, deeply unimpressed — his lore, straight from the topic file.

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const HOUND_IMG = 'assets/monsters/the-noun-hound.png';
const RULE = 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.';

/* ---------- small pure helper ---------- */
function fisherYates(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- content ---------- */
const KENNELS = [
  { id: 'noun', name: 'NOUN', q: 'who or what?', img: HOUND_IMG },
  { id: 'verb', name: 'VERB', q: 'what’s happening?', emoji: '\u{1F3C3}' },
  { id: 'adjective', name: 'ADJECTIVE', q: 'what kind?', emoji: '\u{1F99A}' },
  { id: 'adverb', name: 'ADVERB', q: 'how, when, where?', emoji: '\u{1F407}' },
];
const KLABEL = { noun: 'NOUN', verb: 'VERB', adjective: 'ADJECTIVE', adverb: 'ADVERB' };

const MISSIONS = [
  {
    id: 'm1',
    sentence: 'The brave hound barked loudly.',
    tokens: [
      { text: 'The', pos: 'glue' },
      { text: 'brave', pos: 'adjective', hint: 'What KIND of hound is he?' },
      { text: 'hound', pos: 'noun', hint: 'WHO is doing the barking?' },
      { text: 'barked', pos: 'verb', hint: 'What is HAPPENING?' },
      { text: 'loudly', pos: 'adverb', hint: 'HOW did he bark?' },
    ],
    worked: 'brave → ADJECTIVE · hound → NOUN · barked → VERB · loudly → ADVERB',
  },
  {
    id: 'm2',
    sentence: 'Jarlath kicked the muddy ball.',
    tokens: [
      { text: 'Jarlath', pos: 'noun', hint: 'WHO kicked the ball?' },
      { text: 'kicked', pos: 'verb', hint: 'What is HAPPENING?' },
      { text: 'the', pos: 'glue' },
      { text: 'muddy', pos: 'adjective', hint: 'What KIND of ball?' },
      { text: 'ball', pos: 'noun', hint: 'WHAT did Jarlath kick?' },
    ],
    worked: 'Jarlath → NOUN · kicked → VERB · muddy → ADJECTIVE · ball → NOUN',
  },
  {
    id: 'm3a',
    pairKey: 'watch-switch',
    sentence: 'I watch the match.',
    tokens: [
      { text: 'I', pos: 'glue' },
      { text: 'watch', pos: 'verb', hint: 'What is he DOING right now?' },
      { text: 'the', pos: 'glue' },
      { text: 'match', pos: 'noun', hint: 'WHAT is he watching?' },
    ],
    worked: 'watch → VERB (the doing word) · match → NOUN',
  },
  {
    id: 'm3b',
    pairKey: 'watch-switch',
    sentence: 'My watch is broken.',
    sub: 'Same word, new sentence — ask what job WATCH is doing HERE.',
    tokens: [
      { text: 'My', pos: 'glue' },
      { text: 'watch', pos: 'noun', hint: 'WHAT thing is broken?' },
      { text: 'is', pos: 'verb', hint: 'Being words count too — what IS the watch, right now?' },
      { text: 'broken', pos: 'adjective', hint: 'What KIND of watch is it?' },
    ],
    worked: 'watch → NOUN this time! · is → VERB (a being word) · broken → ADJECTIVE',
  },
];

const SANDBOX = [
  {
    id: 'sb1',
    sentence: 'The enormous spider crawled slowly across the ceiling.',
    tokens: [
      { text: 'The', pos: 'glue' },
      { text: 'enormous', pos: 'adjective', hint: 'What KIND of spider?' },
      { text: 'spider', pos: 'noun', hint: 'WHO is crawling?' },
      { text: 'crawled', pos: 'verb', hint: 'What is HAPPENING?' },
      { text: 'slowly', pos: 'adverb', hint: 'HOW did it crawl?' },
      { text: 'across', pos: 'glue' },
      { text: 'the', pos: 'glue' },
      { text: 'ceiling', pos: 'noun', hint: 'WHAT is it crawling across?' },
    ],
  },
  {
    id: 'sb2',
    sentence: 'Two hungry dogs chased the frisbee across the field.',
    tokens: [
      { text: 'Two', pos: 'adjective', hint: 'How MANY dogs?' },
      { text: 'hungry', pos: 'adjective', hint: 'What KIND of dogs?' },
      { text: 'dogs', pos: 'noun', hint: 'WHO chased the frisbee?' },
      { text: 'chased', pos: 'verb', hint: 'What is HAPPENING?' },
      { text: 'the', pos: 'glue' },
      { text: 'frisbee', pos: 'noun', hint: 'WHAT did they chase?' },
      { text: 'across', pos: 'glue' },
      { text: 'the', pos: 'glue' },
      { text: 'field', pos: 'noun', hint: 'WHAT place did they chase it across?' },
    ],
  },
];

const CSS = `
.nhf-q { text-align:center; font-weight:700; font-size: clamp(19px, 3.2vw, 27px); margin-bottom:2px; }
.nhf-qsub { text-align:center; font-size:12.5px; color:#6b5744; font-weight:500; margin-bottom:8px; }
.nhf-gluerow { display:flex; align-items:center; justify-content:center; gap:7px; flex-wrap:wrap; margin-bottom:10px; font-size:12px; color:#6b5744; font-weight:600; min-height: 14px; }
.nhf-gluechip { background:rgba(51,38,29,.08); border:2px dashed rgba(51,38,29,.28); border-radius:999px; padding:4px 11px; font-weight:700; color:#8a7860; }
.nhf-field { position:relative; }
.nhf-kennels { display:flex; gap:clamp(6px,1.8vw,16px); justify-content:center; flex-wrap:wrap; }
.nhf-kennel {
  flex:1 1 128px; max-width:220px; min-width:118px; display:flex; flex-direction:column; align-items:center;
  background: var(--card); border:3px solid var(--swamp-mid); border-radius:16px; padding:10px 6px 8px;
  box-shadow:0 4px 0 rgba(0,0,0,.18); transition: background .2s, border-color .2s;
}
.nhf-kennel.nhf-hover { background: rgba(155,89,208,.16); border-color: var(--stink); }
.nhf-resident { font-size:38px; line-height:1; height:52px; display:flex; align-items:center; justify-content:center; }
.nhf-resident img { height:52px; display:block; filter:drop-shadow(0 3px 4px rgba(0,0,0,.3)); }
.nhf-klabel { text-align:center; margin-top:4px; }
.nhf-klabel b { display:block; font-size:12.5px; color:var(--stink); letter-spacing:.03em; }
.nhf-klabel span { display:block; font-size:9.5px; color:#6b5744; font-weight:600; margin-top:1px; }
.nhf-landed { display:flex; flex-wrap:wrap; gap:3px; justify-content:center; margin-top:6px; min-height:20px; }
.nhf-tray { display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin-top:18px; padding-top:14px; border-top:2px dashed rgba(51,38,29,.18); min-height: 46px; }
.nhf-ball {
  display:inline-flex; align-items:center; justify-content:center; padding:10px 16px; margin:3px;
  background:#fff; border:3px solid var(--ink); border-radius:999px; font-weight:700; font-size:15px;
  color:var(--ink); box-shadow:0 3px 0 rgba(51,38,29,.3); cursor:grab; touch-action:none;
  -webkit-user-select:none; user-select:none;
}
.nhf-ball.nhf-flying { cursor:grabbing; box-shadow:0 9px 16px rgba(0,0,0,.35); }
.nhf-ball.nhf-caught { background:#FFF3D0; border-color: var(--gold-deep); cursor:default; margin:2px; padding:6px 11px; font-size:12.5px; box-shadow:0 2px 0 rgba(217,162,27,.4); }
.nhf-win { margin-top:12px; text-align:center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF); border:3px solid var(--correct); border-radius:14px; padding:10px 14px; animation: animBubbleIn .34s var(--spring) both; }
.nhf-win .wp { font-weight:700; color:#1d8f4e; font-size:16px; }
.nhf-win .wk { font-size:13px; color:#4d6b58; font-weight:500; margin-top:2px; }
.nhf-kennel.nhf-react-noun .nhf-resident { animation: nhfHop .55s var(--spring); }
.nhf-kennel.nhf-react-verb .nhf-resident { animation: nhfStarjump .5s ease; }
.nhf-kennel.nhf-react-adjective .nhf-resident { animation: nhfPreen .6s ease; }
.nhf-kennel.nhf-react-adverb .nhf-resident { animation: nhfZoom .45s ease; }
.nhf-kennel.nhf-react-wrong .nhf-resident { animation: nhfWobble .4s ease; }
.nhf-kennel.nhf-react-stare .nhf-resident { animation: nhfStare .8s ease; }
@keyframes nhfHop { 0%,100% { transform: translateY(0) rotate(0); } 30% { transform: translateY(-10px) rotate(-6deg); } 55% { transform: translateY(2px) rotate(4deg); } 75% { transform: translateY(-4px) rotate(-2deg); } }
@keyframes nhfStarjump { 0%,100% { transform: translateY(0) scale(1); } 40% { transform: translateY(-16px) scale(1.08); } 70% { transform: translateY(0) scale(.96); } }
@keyframes nhfPreen { 0%,100% { transform: rotate(0) scale(1); } 25% { transform: rotate(-8deg) scale(1.05); } 50% { transform: rotate(6deg) scale(1.08); } 75% { transform: rotate(-4deg) scale(1.02); } }
@keyframes nhfZoom { 0% { transform: translateX(0); } 20% { transform: translateX(-9px); } 40% { transform: translateX(8px); } 60% { transform: translateX(-6px); } 80% { transform: translateX(4px); } 100% { transform: translateX(0); } }
@keyframes nhfWobble { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-7deg); } 60% { transform: rotate(6deg); } 85% { transform: rotate(-3deg); } }
@keyframes nhfStare { 0%,100% { transform: translateY(0); } 15% { transform: translateY(4px); } 40% { transform: translateY(6px) scale(.97); } }
`;

/* ---------- the fetch-yard board (one sentence's worth of balls) ---------- */
function makeBoard(host, mission, opts) {
  let alive = true;
  const timers = new Set();
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

  const field = el('div', 'nhf-field');
  const kennelsRow = el('div', 'nhf-kennels');
  const kennelEls = {};
  KENNELS.forEach((k) => {
    const kEl = el('div', 'nhf-kennel');
    const resident = el('div', 'nhf-resident', k.img ? `<img src="${k.img}" alt="">` : k.emoji);
    const label = el('div', 'nhf-klabel', `<b>${k.name}</b><span>${k.q}</span>`);
    const landedRow = el('div', 'nhf-landed');
    kEl.append(resident, label, landedRow);
    kennelsRow.append(kEl);
    kennelEls[k.id] = { el: kEl, landedRow, count: 0 };
  });
  const trayRow = el('div', 'nhf-tray');
  field.append(kennelsRow, trayRow);
  host.append(field);

  function fieldRect() { return field.getBoundingClientRect(); }
  function kennelAt(x, y) {
    const fr = fieldRect();
    for (const k of KENNELS) {
      const r = kennelEls[k.id].el.getBoundingClientRect();
      const lx = r.left - fr.left - 10; const ty = r.top - fr.top - 10;
      const rx = r.right - fr.left + 10; const by = r.bottom - fr.top + 10;
      if (x >= lx && x <= rx && y >= ty && y <= by) return k.id;
    }
    return null;
  }
  function clearHover() { KENNELS.forEach((k) => kennelEls[k.id].el.classList.remove('nhf-hover')); }
  function react(kennelId, kind) {
    const kEl = kennelEls[kennelId].el;
    const cls = 'nhf-react-' + (kind === 'correct' ? kennelId : kind);
    kEl.classList.remove(cls); void kEl.offsetWidth; kEl.classList.add(cls);
    later(() => { if (kEl.isConnected) kEl.classList.remove(cls); }, 700);
  }

  const throwable = fisherYates(mission.tokens.filter((t) => t.pos !== 'glue'));
  const balls = throwable.map((t, i) => {
    const ballEl = el('div', 'nhf-ball', t.text);
    trayRow.append(ballEl);
    return { ...t, id: mission.id + '-' + i, el: ballEl, status: 'tray', attempts: 0, hintShown: false, cancelTween: null, pendingLand: null, drag: null };
  });

  // FLIP-style pre-measure: the tray already reflowed (closed the gap) the
  // moment this ball was lifted out of it, so its captured drag-start
  // position is stale. Briefly reinsert it to measure where it will actually
  // rest, then pull it back out — synchronous, so nothing paints in between.
  function measureTrayRest(b) {
    const saved = b.el.style.cssText;
    b.el.style.cssText = '';
    trayRow.appendChild(b.el);
    const r = b.el.getBoundingClientRect();
    const fr = fieldRect();
    const pos = { x: r.left - fr.left, y: r.top - fr.top };
    field.appendChild(b.el);
    b.el.style.cssText = saved;
    return pos;
  }

  function settle(b, hit, curLeft, curTop) {
    const correct = hit === b.pos;
    clearHover();
    if (correct) {
      const kd = kennelEls[hit];
      const kr = kd.landedRow.getBoundingClientRect(); const fr = fieldRect();
      const targetX = (kr.left - fr.left) + kd.count * (b.w + 6);
      const targetY = (kr.top - fr.top);
      kd.count += 1;
      b.pendingLand = hit;
      b.cancelTween = tween((t) => {
        b.el.style.left = (curLeft + (targetX - curLeft) * t) + 'px';
        b.el.style.top = (curTop + (targetY - curTop) * t) + 'px';
      }, 0, 1, 260, () => {
        b.cancelTween = null;
        if (!alive) return;
        b.pendingLand = null;
        b.status = 'landed';
        b.el.classList.remove('nhf-flying');
        b.el.style.position = ''; b.el.style.left = ''; b.el.style.top = ''; b.el.style.width = ''; b.el.style.height = ''; b.el.style.zIndex = '';
        kd.landedRow.appendChild(b.el);
        b.el.classList.add('nhf-caught');
        react(hit, 'correct');
        sfx.pop();
        const r2 = b.el.getBoundingClientRect(); const fr2 = fieldRect();
        sparkleBurst(field, r2.left - fr2.left + r2.width / 2, r2.top - fr2.top + r2.height / 2, 8);
        if (opts.onCatch) opts.onCatch(b);
      });
      return;
    }
    const stare = b.pos === 'verb' && hit === 'noun';
    const rest = measureTrayRest(b);
    b.cancelTween = tween((t) => {
      b.el.style.left = (curLeft + (rest.x - curLeft) * t) + 'px';
      b.el.style.top = (curTop + (rest.y - curTop) * t) + 'px';
    }, 0, 1, stare ? 400 : 300, () => {
      b.cancelTween = null;
      if (!alive) return;
      b.status = 'tray';
      b.el.classList.remove('nhf-flying');
      b.el.style.position = ''; b.el.style.left = ''; b.el.style.top = ''; b.el.style.width = ''; b.el.style.height = ''; b.el.style.zIndex = '';
      trayRow.appendChild(b.el);
    });
    if (!hit) return; // released over nothing — quiet return, no sting
    if (stare) {
      sfx.thud();
      react('noun', 'stare');
      toast(opts.stage, '\u{1F610} The Hound lets it drop and STARES, deeply unimpressed. He only fetches NOUNS!');
    } else {
      sfx.nudge();
      react(hit, 'wrong');
      b.attempts += 1;
      if (opts.onWrong) opts.onWrong(b, hit);
    }
  }

  balls.forEach((b) => {
    b.drag = makeDrag(b.el, {
      enabled: () => alive && b.status === 'tray',
      onStart() {
        if (b.cancelTween) { b.cancelTween(); b.cancelTween = null; }
        const fr = fieldRect();
        const r = b.el.getBoundingClientRect();
        b.origLeft = r.left - fr.left; b.origTop = r.top - fr.top;
        b.w = r.width; b.h = r.height;
        b.el.style.width = b.w + 'px'; b.el.style.height = b.h + 'px';
        b.el.style.position = 'absolute';
        b.el.style.left = b.origLeft + 'px'; b.el.style.top = b.origTop + 'px';
        b.el.style.zIndex = 50;
        field.appendChild(b.el);
        b.el.classList.add('nhf-flying');
        b.status = 'flying';
      },
      onMove(dx, dy) {
        const left = b.origLeft + dx; const top = b.origTop + dy;
        b.el.style.left = left + 'px'; b.el.style.top = top + 'px';
        const hit = kennelAt(left + b.w / 2, top + b.h / 2);
        KENNELS.forEach((k) => kennelEls[k.id].el.classList.toggle('nhf-hover', hit === k.id));
      },
      onEnd(dx, dy) {
        const left = b.origLeft + dx; const top = b.origTop + dy;
        const hit = kennelAt(left + b.w / 2, top + b.h / 2);
        settle(b, hit, left, top);
      },
    });
  });

  return {
    balls,
    allLanded: () => balls.every((b) => b.status === 'landed'),
    layout() {
      // relayout abandons any live flight — flex handles idle balls automatically
      clearHover();
      balls.forEach((b) => {
        if (b.status === 'flying') {
          if (b.drag) b.drag.abort();
          if (b.cancelTween) { b.cancelTween(); b.cancelTween = null; }
          if (b.pendingLand) { kennelEls[b.pendingLand].count -= 1; b.pendingLand = null; }
          b.status = 'tray';
          b.el.classList.remove('nhf-flying');
          b.el.style.position = ''; b.el.style.left = ''; b.el.style.top = ''; b.el.style.width = ''; b.el.style.height = ''; b.el.style.zIndex = '';
          trayRow.appendChild(b.el);
        }
      });
    },
    destroy() {
      alive = false;
      timers.forEach((t) => clearTimeout(t));
      balls.forEach((b) => { if (b.cancelTween) b.cancelTween(); if (b.drag) b.drag.destroy(); });
      field.remove();
    },
  };
}

/* ---------- the anim card ---------- */
export default {
  id: 'parts-of-speech',
  title: "THE NOUN HOUND'S FETCH YARD",

  mount(host, ctx) {
    let alive = true;
    let board = null;
    let mi = 0;
    let currentMission = null;
    const doneSet = new Set();
    let ahaShown = false;
    let gluePopupShown = false;
    let missionGen = 0;
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    injectCss('parts-of-speech', CSS);

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'nhf-q');
    const qsub = el('div', 'nhf-qsub');
    const gluerow = el('div', 'nhf-gluerow');
    const boardHost = el('div');
    const winBox = el('div');
    const controls = el('div', 'anim-controls');
    const resetBtn = el('button', 'anim-ghostbtn', '↩ RESET SENTENCE');
    controls.append(resetBtn);
    stage.append(chiprow, q, qsub, gluerow, boardHost, winBox, controls);
    host.append(stage);

    const ruleCard = el('div', null, RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;';
    host.append(ruleCard);

    function paintChips() {
      chiprow.innerHTML = '';
      const LABELS = { m1: 'SENTENCE 1', m2: 'SENTENCE 2', m3a: 'WATCH #1', m3b: 'WATCH #2' };
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), LABELS[m.id]);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
      const fp = el('button', 'anim-mchip' + (mi === MISSIONS.length ? ' active' : ''), 'FREE PLAY \u{1F3AE}');
      fp.addEventListener('click', () => { sfx.ui(); start(MISSIONS.length); });
      chiprow.append(fp);
    }

    function destroyBoard() { if (board) { board.destroy(); board = null; } }

    function handleWrong(b) {
      if (b.attempts === 1) {
        toast(stage, `Not that kennel for “${b.text}” — give it another throw!`);
      } else if (b.attempts === 2 && b.hint) {
        toast(stage, b.hint, 3400);
      } else if (b.attempts >= 3 && !b.hintShown) {
        b.hintShown = true;
        const myGen = missionGen;
        later(() => {
          if (myGen !== missionGen) return;
          bubble(stage, {
            title: 'JOB CLUE! \u{1F50D}',
            text: `${b.hint || ''} That’s the <b>${KLABEL[b.pos]}</b>’s job — try the ${KLABEL[b.pos]} kennel!`,
            img: HOUND_IMG,
          });
        }, 200);
      } else if (b.attempts > 3) {
        toast(stage, `You’ll get “${b.text}” this time!`);
      }
    }

    function checkComplete(mission) {
      if (!board || !board.allLanded()) return;
      win(mission);
    }

    function buildMission(mission) {
      destroyBoard();
      missionGen += 1;
      currentMission = mission;
      winBox.innerHTML = '';
      gluerow.innerHTML = '';
      const glueTokens = mission.tokens.filter((t) => t.pos === 'glue');
      if (glueTokens.length) {
        gluerow.append(el('span', null, '\u{1FAA3} glue words, already sorted:'));
        glueTokens.forEach((t) => gluerow.append(el('span', 'nhf-gluechip', t.text)));
      }
      board = makeBoard(boardHost, mission, {
        stage,
        onCatch() { checkComplete(mission); },
        onWrong(b) { handleWrong(b); },
      });
      if (!gluePopupShown && glueTokens.length) {
        const myGen = missionGen;
        later(() => {
          if (myGen !== missionGen) return;
          gluePopupShown = true;
          bubble(stage, {
            title: 'GLUE WORDS! \u{1FAA3}',
            text: 'Little words like “the” hold the sentence together, but they don’t name, do, describe or tell HOW — they’re already sorted for you. Focus on the big four!',
            img: HOUND_IMG,
          });
        }, 300);
      }
    }

    function loadSandbox(s) {
      const m = { id: 'sb-' + s.id, sentence: s.sentence, tokens: s.tokens, sandbox: true, worked: '' };
      q.textContent = s.sentence;
      buildMission(m);
    }

    function start(i) {
      mi = i;
      winBox.innerHTML = '';
      paintChips();
      const sandbox = i === MISSIONS.length;
      if (sandbox) {
        q.textContent = 'Free play — pick a sentence:';
        qsub.innerHTML = '';
        const label = el('div', null, 'Drag each ball into the kennel doing its JOB.');
        const picker = el('div', 'anim-chiprow');
        SANDBOX.forEach((s, k) => {
          const c = el('button', 'anim-mchip' + (k === 0 ? ' active' : ''), 'SENTENCE ' + (k + 1));
          c.addEventListener('click', () => {
            picker.querySelectorAll('.anim-mchip').forEach((x) => x.classList.remove('active'));
            c.classList.add('active'); sfx.ui(); loadSandbox(s);
          });
          picker.append(c);
        });
        qsub.append(label, picker);
        loadSandbox(SANDBOX[0]);
        return;
      }
      const mission = MISSIONS[i];
      q.textContent = mission.sentence;
      qsub.textContent = mission.sub || 'Drag each ball into the kennel doing its JOB in THIS sentence.';
      buildMission(mission);
    }

    function win(mission) {
      const sandbox = !!mission.sandbox;
      if (!sandbox) doneSet.add(mission.id);
      sfx.win(); party(stage);
      paintChips();
      winBox.innerHTML = '';
      const w = el('div', 'nhf-win',
        `<div class="wp">${sandbox ? 'ALL FETCHED! \u{1F43E}' : 'FETCH COMPLETE! \u{1F43E}'}</div>`
        + `<div class="wk">${mission.worked || ''}</div>`);
      winBox.append(w);
      if (sandbox) {
        const again = el('button', 'btn btn-gold', 'TRY ANOTHER ➡');
        again.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;min-height:44px;display:inline-flex;align-items:center;justify-content:center;';
        again.addEventListener('click', () => { sfx.ui(); start(MISSIONS.length); });
        w.append(again);
        return;
      }
      if (mission.pairKey && !ahaShown) {
        const partner = MISSIONS.find((m) => m.pairKey === mission.pairKey && m.id !== mission.id);
        if (partner && doneSet.has(partner.id)) {
          ahaShown = true;
          const myGen = missionGen;
          later(() => {
            if (myGen !== missionGen) return;
            bubble(stage, {
              title: 'SAME BALL, DIFFERENT KENNEL! \u{1F3BE}',
              text: '“Watch” landed in the <b>VERB</b> kennel in one sentence and the <b>NOUN</b> kennel in the other — the SAME word, doing a different JOB! Always ask what job it’s doing in THIS sentence.',
              img: HOUND_IMG,
            });
          }, 700);
        }
      }
      if (doneSet.size === MISSIONS.length) ctx.complete();
      const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
      if (nextIdx !== -1) {
        const nb = el('button', 'btn btn-gold', 'NEXT ONE ➡');
        nb.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;min-height:44px;display:inline-flex;align-items:center;justify-content:center;';
        nb.addEventListener('click', () => { sfx.ui(); start(nextIdx); });
        w.append(nb);
      } else {
        const fp = el('button', 'btn btn-gold', 'FREE PLAY \u{1F3AE}');
        fp.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;min-height:44px;display:inline-flex;align-items:center;justify-content:center;';
        fp.addEventListener('click', () => { sfx.ui(); start(MISSIONS.length); });
        w.append(fp);
      }
    }

    resetBtn.addEventListener('click', () => { sfx.ui(); if (currentMission) buildMission(currentMission); });

    const onResize = () => { if (board) board.layout(); };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    start(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      destroyBoard();
      stage.remove();
      ruleCard.remove();
    };
  },
};
