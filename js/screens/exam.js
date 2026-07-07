// FART QUEST — js/screens/exam.js (EXAM agent)
// Castle Clench: the mock exam. #/exam.
//
// INTEGRATION NOTE (not done here — outside this agent's owned files):
//   1. index.html   needs  <link rel="stylesheet" href="css/exam.css">
//   2. js/main.js   needs  import * as examScreen from './screens/exam.js';
//                          router.register('/exam', examScreen);
//                          (and add '#/exam' to the app-frame route list)
//   3. ctx.examProvider — a real {getQuestion(slotSpec)} implementation that draws
//      from the maths generators / English banks. Until wired, this screen falls
//      back to its own createStubProvider() so it is fully playable/testable alone.
//
// ---------------------------------------------------------------------------
// CONTRACTS this file defines/consumes
// ---------------------------------------------------------------------------
// ctx.examProvider (optional; stub used if absent):
//   { getQuestion(slotSpec) -> Question }
//   slotSpec = { subject: 'english'|'maths', format, topicPool }
//   Question = BUILD_SPEC §7 base shape, PLUS per format (ENGINE_SPEC_2 §A):
//     mcq5/clozebox: { options:[{text}], correctIndex }
//     errorspot:     { segments:[{text}x4], faultyIndex: 0-3|null }
//     selecttwo:     { options:[{text}x5], correctIndices:[i,j] }
//     wordentry/num: { accept:[...], unit?, exact? }
//   Reading-block (topicPool 'storybog') questions additionally carry:
//     { passage: { id, title, lines:[string] }, lineRef: string|null }
//   Every reading-block question in the SAME paper is expected to share the same
//   q.passage object/id (13 calls, 1 passage) so this screen renders one panel.
//
// ctx.state.recordMock (optional) — if the CORE agent adds it, called defensively
// with the finished mock record so per-topic review-nudges can be wired in later.
// This screen ALWAYS persists the record itself via ctx.db (store 'mocks',
// added in js/db.js v2), so results/history work with or without recordMock.
//
// db 'mocks' record shape:
//   { id, type:'king'|'skirmish', startedAt, finishedAt, durationMs, score, total,
//     perTopic:{topicId:{correct,total}}, perSection:{section:{correct,total}},
//     flaggedCount, blanksAtSubmit, passed }

import { REGIONS } from '../../data/map.js';
import { normaliseForCompare } from '../engine/formats/numpad.js';

/* =====================================================================
   1. PAPER COMPOSITION (pure — node-tested)
   ===================================================================== */

// Mirrors the real paper exactly (ENGINE_SPEC_2 §E): 56 questions total.
export const FULL_MOCK_COMPOSITION = [
  { count: 5, subject: 'english', format: 'errorspot', topicPool: 'punctuation-pits', section: 'Punctuation' },
  { count: 5, subject: 'english', format: 'clozebox', topicPool: 'grammar-grotto', section: 'Grammar' },
  { count: 5, subject: 'english', format: 'errorspot', topicPool: 'spelling-sewers', section: 'Spelling' },
  { count: 7, subject: 'english', format: 'mcq5', topicPool: 'storybog', section: 'Reading' },
  { count: 6, subject: 'english', format: 'wordentry', topicPool: 'storybog', section: 'Reading' },
  { count: 22, subject: 'maths', format: 'mcq5', topicPool: 'maths-mixed', section: 'Maths (multiple choice)' },
  { count: 6, subject: 'maths', format: 'num', topicPool: 'maths-mixed', section: 'Maths (write-in)' },
];

// Training Skirmish: "20 questions, 20 min: 10 English + 10 Maths, same machinery".
// Not literally specified beyond the split, so the mix below reuses the full mock's
// format families in miniature (deviation noted in the build report).
export const SKIRMISH_COMPOSITION = [
  { count: 4, subject: 'english', format: 'mcq5', topicPool: 'storybog', section: 'English' },
  { count: 3, subject: 'english', format: 'errorspot', topicPool: 'punctuation-pits', section: 'English' },
  { count: 3, subject: 'english', format: 'wordentry', topicPool: 'storybog', section: 'English' },
  { count: 7, subject: 'maths', format: 'mcq5', topicPool: 'maths-mixed', section: 'Maths' },
  { count: 3, subject: 'maths', format: 'num', topicPool: 'maths-mixed', section: 'Maths' },
];

export function compositionFor(type) {
  return (type === 'skirmish' ? SKIRMISH_COMPOSITION : FULL_MOCK_COMPOSITION).map((b) => ({ ...b }));
}

export function totalQuestions(composition) {
  return composition.reduce((sum, block) => sum + block.count, 0);
}

/**
 * expandSlots(composition) -> flat array of { qNumber, subject, format, topicPool, section }
 * qNumber is 1-based and sequential across the whole paper (matches "Q1-5…Q51-56" wording).
 */
export function expandSlots(composition) {
  const slots = [];
  let qNumber = 1;
  for (const block of composition) {
    for (let i = 0; i < block.count; i++) {
      slots.push({
        qNumber,
        subject: block.subject,
        format: block.format,
        topicPool: block.topicPool,
        section: block.section,
      });
      qNumber++;
    }
  }
  return slots;
}

/* =====================================================================
   2. STUB EXAM PROVIDER (pure factory — node-tested)
   ===================================================================== */

const STUB_PASSAGE = {
  id: 'stub-passage',
  title: 'The Placeholder Passage',
  lines: [
    'Once, in a kingdom nobody had cleaned in years, a small stinkling called Whiffy',
    'sat by the swamp and thought about lunch.',
    '',
    'He was not a hero. He was, if anything, quite the opposite: round, damp, and',
    'permanently a bit confused about where he had left his hat.',
    '',
    'But every hero starts somewhere, and Whiffy had just found a very interesting',
    'stick.',
    '',
    'This is placeholder text only — the real passage bank ships separately.',
  ],
};

function makeStubQuestion(slotSpec, index) {
  const { subject, format, topicPool } = slotSpec;
  const id = `stub-${topicPool}-${format}-${index}`;
  const base = {
    id,
    topicId: topicPool,
    tier: 2,
    format,
    explain: {
      rule: 'Placeholder rule text.',
      worked: 'Placeholder worked example.',
      whyWrong: {},
    },
    hintSteps: ['Placeholder hint one.', 'Placeholder hint two.'],
  };

  switch (format) {
    case 'mcq5':
      return {
        ...base,
        stem: `Placeholder ${subject} question ${index}. What is 2 + 2?`,
        options: [{ text: '3' }, { text: '4' }, { text: '5' }, { text: '22' }],
        correctIndex: 1,
        ...(topicPool === 'storybog' ? { passage: STUB_PASSAGE, lineRef: String(1 + (index % 6)) } : {}),
      };
    case 'num':
      return {
        ...base,
        stem: `Placeholder ${subject} write-in question ${index}.`,
        accept: ['42'],
        unit: subject === 'maths' ? 'cm' : undefined,
      };
    case 'errorspot':
      return {
        ...base,
        stem: `Read the sentence below and decide which part (if any) has the mistake.`,
        segments: [
          { text: 'The two dogs' },
          { text: 'ran quickly' },
          { text: 'to the muddy park' },
          { text: 'yesterday afternoon.' },
        ],
        faultyIndex: index % 5 === 0 ? null : index % 4,
      };
    case 'clozebox':
      return {
        ...base,
        stem: 'Choose the best word for the gap.',
        stemParts: ['Placeholder sentence with a ', ' gap.'],
        options: [{ text: 'plain' }, { text: 'placeholder' }, { text: 'purple' }, { text: 'plastic' }, { text: 'proud' }],
        correctIndex: 1,
      };
    case 'wordentry':
      return {
        ...base,
        stem: `Placeholder ${subject} short-answer question ${index}.`,
        accept: ['answer'],
        maxLen: 40,
        ...(topicPool === 'storybog' ? { passage: STUB_PASSAGE, lineRef: String(1 + (index % 6)) } : {}),
      };
    case 'selecttwo':
      return {
        ...base,
        stem: `Placeholder select-two question ${index}. Choose TWO.`,
        options: [{ text: 'A' }, { text: 'B' }, { text: 'C' }, { text: 'D' }, { text: 'E' }],
        correctIndices: [0, 2],
      };
    default:
      return { ...base, stem: `Placeholder question ${index}.`, options: [{ text: 'A' }, { text: 'B' }], correctIndex: 0 };
  }
}

/**
 * createStubProvider() -> { getQuestion(slotSpec) } fresh instance (own counter).
 * Ships placeholder-but-well-formed Question objects so the screen is fully
 * playable/testable standalone, per the "code against a stub provider" instruction.
 */
export function createStubProvider() {
  let counter = 0;
  return {
    getQuestion(slotSpec) {
      counter += 1;
      return makeStubQuestion(slotSpec, counter);
    },
  };
}

/**
 * buildPaper(type, provider) -> array of Question objects, each stamped with
 * { qNumber, section, subject } from its slot.
 */
export function buildPaper(type, provider) {
  const slots = expandSlots(compositionFor(type));
  return slots.map((slot) => {
    const q = provider.getQuestion({ subject: slot.subject, format: slot.format, topicPool: slot.topicPool });
    return { ...q, qNumber: slot.qNumber, section: slot.section, subject: slot.subject };
  });
}

/* =====================================================================
   3. SCORING (pure — node-tested)
   ===================================================================== */

/**
 * normaliseWordEntry per ENGINE_SPEC_2 §A3: trim, collapse inner whitespace,
 * lowercase (unless exact), strip leading/trailing punctuation.
 */
export function normaliseWordEntry(raw, exact) {
  let s = String(raw == null ? '' : raw).trim();
  if (!exact) s = s.toLowerCase();
  s = s.replace(/\s+/g, ' ');
  s = s.replace(/^[.,!?"'‘’“”]+|[.,!?"'‘’“”]+$/g, '');
  return s;
}

export function wordEntryCorrect(question, rawAnswer) {
  const norm = normaliseWordEntry(rawAnswer, !!question.exact);
  return (question.accept || []).some((a) => normaliseWordEntry(a, !!question.exact) === norm);
}

// Reuses FORMATS' own numeric-compare rules (already shipped in numpad.js) so
// exam scoring never drifts from in-game scoring for the same accept lists.
export function numCorrect(question, rawAnswer) {
  const norm = normaliseForCompare(rawAnswer == null ? '' : rawAnswer);
  return (question.accept || []).some((a) => normaliseForCompare(a) === norm);
}

/**
 * scoreAnswer(question, answer) -> bool. Never throws on a blank/undefined answer.
 * answer shapes: mcq5/clozebox -> index (number); errorspot -> index (number) or 'N';
 * selecttwo -> [i,j]; num/wordentry -> string.
 */
export function scoreAnswer(question, answer) {
  if (answer === undefined || answer === null || answer === '') return false;
  switch (question.format) {
    case 'mcq5':
    case 'clozebox':
      return Number(answer) === question.correctIndex;
    case 'errorspot': {
      const expected = question.faultyIndex === null || question.faultyIndex === undefined ? 'N' : question.faultyIndex;
      const got = answer === 'N' ? 'N' : Number(answer);
      return got === expected;
    }
    case 'selecttwo': {
      if (!Array.isArray(answer) || answer.length !== 2) return false;
      const want = (question.correctIndices || []).slice().sort((a, b) => a - b);
      const got = answer.slice().sort((a, b) => a - b);
      return want.length === 2 && want[0] === got[0] && want[1] === got[1];
    }
    case 'num':
      return numCorrect(question, answer);
    case 'wordentry':
      return wordEntryCorrect(question, answer);
    default:
      return false;
  }
}

/**
 * gradeExam(questions, answersByQNumber) -> { score, total, perTopic, perSection, results }
 * answersByQNumber: { [qNumber]: answer }
 */
export function gradeExam(questions, answersByQNumber) {
  let score = 0;
  const perTopic = {};
  const perSection = {};
  const results = questions.map((q) => {
    const answer = answersByQNumber ? answersByQNumber[q.qNumber] : undefined;
    const correct = scoreAnswer(q, answer);
    if (correct) score += 1;

    const t = perTopic[q.topicId] || (perTopic[q.topicId] = { correct: 0, total: 0 });
    t.total += 1;
    if (correct) t.correct += 1;

    const s = perSection[q.section] || (perSection[q.section] = { correct: 0, total: 0 });
    s.total += 1;
    if (correct) s.correct += 1;

    return { qNumber: q.qNumber, correct, answered: answer !== undefined && answer !== null && answer !== '' };
  });
  return { score, total: questions.length, perTopic, perSection, results };
}

/* =====================================================================
   4. TIMING (pure — node-tested)
   ===================================================================== */

export const EXAM_DURATIONS_MIN = { king: 60, skirmish: 20 };

export function examEndsAt(type, startedAt) {
  const mins = EXAM_DURATIONS_MIN[type] || EXAM_DURATIONS_MIN.king;
  return startedAt + mins * 60 * 1000;
}

export function timeRemainingMs(endsAt, now) {
  return Math.max(0, endsAt - now);
}

export function formatClock(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * nudgesFor(type) -> [{ atElapsedMin, message }]
 * Only the full mock gets the 30/50-minute nudges per spec; the skirmish is a
 * short, low-stakes practice run so it stays quiet beyond the countdown itself.
 */
export function nudgesFor(type) {
  if (type !== 'king') return [];
  return [
    { atElapsedMin: 30, message: 'Halfway — switch section?' },
    { atElapsedMin: 50, message: '10 minutes left!' },
  ];
}

/* =====================================================================
   5. SKIDMARK KING / ROYAL GUARD (pure — node-tested)
   ===================================================================== */

export const KING_PASS_SCORE = 48; // out of 56 (spec: "≥48 = he falls")

export function kingFalls(score, total) {
  if (total === 56) return score >= KING_PASS_SCORE;
  // Defensive fallback if the composition ever changes size: same proportion.
  return total > 0 && score / total >= KING_PASS_SCORE / 56;
}

// Training Skirmish has no real gate (it's practice) — this just drives the
// Royal Guard's HP-bar flavour on the results screen with a friendly bar.
export function guardFalls(score, total) {
  return total > 0 && score / total >= 0.75;
}

export function hpFraction(score, total) {
  if (total <= 0) return 1;
  return Math.max(0, 1 - score / total);
}

/* =====================================================================
   6. REGION-UNLOCK LOGIC (pure — node-tested)
   ===================================================================== */

/**
 * isRegionCleansed(region, getTopicRecord) -> bool
 * A region only counts once EVERY one of its listed locations has a real
 * topicId and that topic is captured — a region that isn't fully authored yet
 * (Phase 1: most regions have no `locations` at all, or placeholder entries
 * with no topicId) can never be prematurely marked cleansed.
 */
export function isRegionCleansed(region, getTopicRecord) {
  if (!region || !Array.isArray(region.locations) || region.locations.length === 0) return false;
  return region.locations.every((loc) => {
    if (!loc || !loc.topicId) return false;
    const rec = getTopicRecord(loc.topicId);
    return !!(rec && rec.captured);
  });
}

export function countCleansedRegions(regions, getTopicRecord) {
  return (regions || []).filter((r) => isRegionCleansed(r, getTopicRecord)).length;
}

export function doorUnlocks(cleansedCount, totalRegions) {
  return {
    skirmish: cleansedCount >= 4,
    king: totalRegions > 0 && cleansedCount >= totalRegions,
  };
}

/* =====================================================================
   7. SCREEN MODULE — mount/unmount + DOM
   ===================================================================== */

let alive = false; // guards deferred callbacks after unmount (see battle.js pattern)
let cleanupFns = [];
// Module-level (NOT reset by unmount) so an in-progress mock survives a router
// re-render of the same #/exam route — only cleared when the exam finishes or
// the child explicitly exits. The interval handle itself lives in cleanupFns
// and IS torn down on unmount, then recreated on the next mount if `session`
// is still live.
let session = null;

function deferTimeout(fn, ms) {
  const id = setTimeout(fn, ms);
  cleanupFns.push(() => clearTimeout(id));
  return id;
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const WHIFF_LOW_LINES = [
  'The King staggers — not beaten yet, but rattled! Return stronger, hero.',
  'Ooof — so close! Have another crack when you\'re ready, Sir Jarlath.',
];
const WHIFF_WIN_LINES = [
  'HE FALLS! You absolute legend of the bog — the King is DONE.',
  'DOWN HE GOES! Castle Clench has never smelled so victorious!',
];

export async function mount(root, ctx, params) {
  cleanupFns = [];
  alive = true;
  if (session && !session.finished) {
    renderRunner(root, ctx);
  } else {
    renderHub(root, ctx);
  }
}

export function unmount() {
  alive = false;
  cleanupFns.forEach((fn) => { try { fn(); } catch (e) { /* swallow */ } });
  cleanupFns = [];
}

export default { mount, unmount };

/* ---------------------- HUB ---------------------- */

function getTopicRecordFactory(ctx) {
  return (topicId) => ctx.state.topic(topicId);
}

async function renderHub(root, ctx) {
  const cleansedCount = countCleansedRegions(REGIONS, getTopicRecordFactory(ctx));
  const totalRegions = REGIONS.length;
  const unlocks = doorUnlocks(cleansedCount, totalRegions);

  let history = [];
  try {
    const all = await ctx.db.getAll('mocks');
    history = Object.values(all || {}).sort((a, b) => (b.finishedAt || 0) - (a.finishedAt || 0));
  } catch (e) {
    history = [];
  }
  if (!alive) return;

  const screen = document.createElement('div');
  screen.className = 'exam-screen exam-hub enter-pop';
  screen.innerHTML = `
    <button class="btn btn-ghost exam-back">← Back to Map</button>
    <h1 class="exam-hub-title">Castle Clench</h1>
    <p class="exam-hub-sub">The Skidmark King's own front door. Two ways in.</p>
    <div class="exam-doors">
      <div class="exam-door ${unlocks.skirmish ? '' : 'locked'}">
        <div class="exam-door-emoji">🛡️</div>
        <h2>Training Skirmish</h2>
        <p>20 questions · 20 minutes · 10 English + 10 Maths</p>
        <p class="exam-door-lock">${unlocks.skirmish ? 'Ready when you are.' : `Locked — cleanse 4 regions first (${cleansedCount}/${totalRegions} so far).`}</p>
        <button class="btn btn-parchment exam-door-btn" data-type="skirmish" ${unlocks.skirmish ? '' : 'disabled'}>Enter</button>
      </div>
      <div class="exam-door ${unlocks.king ? '' : 'locked'}">
        <div class="exam-door-emoji">👑</div>
        <h2>FACE THE SKIDMARK KING</h2>
        <p>56 questions · 60 minutes · the full mock</p>
        <p class="exam-door-lock">${unlocks.king ? 'The whole kingdom is behind you. Go.' : `Locked — cleanse ALL 10 regions first (${cleansedCount}/${totalRegions} so far).`}</p>
        <button class="btn btn-gold exam-door-btn" data-type="king" ${unlocks.king ? '' : 'disabled'}>Enter</button>
      </div>
    </div>
    <div class="exam-history">
      <h3>Mock history</h3>
      ${history.length === 0 ? '<p class="exam-history-empty">No attempts yet — your first mock will appear here.</p>' : `
        <ul class="exam-history-list">
          ${history.slice(0, 10).map((h) => `
            <li>
              <span class="exam-history-date">${new Date(h.finishedAt || h.startedAt).toLocaleDateString('en-GB')}</span>
              <span class="exam-history-type">${h.type === 'king' ? 'Skidmark King' : 'Training Skirmish'}</span>
              <span class="exam-history-score">${h.score}/${h.total}</span>
              <span class="exam-history-badge ${h.passed ? 'pass' : 'try-again'}">${h.passed ? (h.type === 'king' ? 'HE FELL!' : 'STRONG RUN') : 'RETRY SOON'}</span>
            </li>
          `).join('')}
        </ul>
      `}
    </div>
  `;
  root.innerHTML = '';
  root.appendChild(screen);

  screen.querySelector('.exam-back').addEventListener('click', () => {
    ctx.audio.sfx('back');
    ctx.go('#/map');
  });

  screen.querySelectorAll('.exam-door-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      ctx.audio.sfx('confirm');
      startExam(root, ctx, btn.getAttribute('data-type'));
    });
  });
}

/* ---------------------- RUNNER ---------------------- */

function startExam(root, ctx, type) {
  const provider = ctx.examProvider || createStubProvider();
  const questions = buildPaper(type, provider);
  const startedAt = Date.now();
  session = {
    type,
    questions,
    answers: {}, // qNumber -> raw answer
    flags: new Set(),
    currentIndex: 0,
    startedAt,
    endsAt: examEndsAt(type, startedAt),
    firedNudges: new Set(),
    finished: false,
  };
  renderRunner(root, ctx);
}

function renderRunner(root, ctx) {
  const screen = document.createElement('div');
  screen.className = 'exam-screen exam-paper';
  screen.innerHTML = `
    <div class="exam-paper-topbar">
      <button class="btn btn-ghost exam-exit-btn" style="padding:6px 12px;font-size:13px;">Exit</button>
      <div class="exam-progress">Question <span class="exam-progress-num"></span> of ${session.questions.length}</div>
      <div class="exam-timer"></div>
    </div>
    <div class="exam-paper-body">
      <div class="exam-question-area"></div>
      <div class="exam-palette-wrap">
        <h4>Question palette</h4>
        <div class="exam-palette"></div>
        <button class="btn btn-gold exam-finish-btn" style="margin-top:14px;width:100%;">Finish paper</button>
      </div>
    </div>
  `;
  root.innerHTML = '';
  root.appendChild(screen);

  screen.querySelector('.exam-exit-btn').addEventListener('click', () => showExitConfirm(root, ctx));
  screen.querySelector('.exam-finish-btn').addEventListener('click', () => attemptFinish(root, ctx));

  renderPalette(screen, root, ctx);
  renderQuestion(screen, root, ctx, session.currentIndex);

  // Timer: tick every second off the absolute endsAt (survives re-render/resume
  // cleanly since it's computed from a fixed timestamp, never from a counter).
  const timerEl = screen.querySelector('.exam-timer');
  const intervalId = setInterval(tick, 1000);
  cleanupFns.push(() => clearInterval(intervalId));
  function tick() {
    if (!alive || !session || session.finished) { clearInterval(intervalId); return; }
    const remaining = timeRemainingMs(session.endsAt, Date.now());
    timerEl.textContent = formatClock(remaining);
    timerEl.classList.toggle('exam-timer-low', remaining <= 5 * 60 * 1000);

    const elapsedMin = (Date.now() - session.startedAt) / 60000;
    for (const nudge of nudgesFor(session.type)) {
      if (elapsedMin >= nudge.atElapsedMin && !session.firedNudges.has(nudge.atElapsedMin)) {
        session.firedNudges.add(nudge.atElapsedMin);
        showInfoModal(root, ctx, nudge.message);
      }
    }

    if (remaining <= 0) {
      clearInterval(intervalId);
      finishExam(root, ctx, { autoSubmitted: true });
    }
  }
  tick();
}

function renderPalette(screen, root, ctx) {
  const wrap = screen.querySelector('.exam-palette');
  wrap.innerHTML = session.questions.map((q) => {
    const answered = session.answers[q.qNumber] !== undefined && session.answers[q.qNumber] !== null && session.answers[q.qNumber] !== '';
    const flagged = session.flags.has(q.qNumber);
    const current = q.qNumber === session.questions[session.currentIndex].qNumber;
    const cls = ['exam-palette-cell'];
    if (answered) cls.push('answered');
    if (flagged) cls.push('flagged');
    if (current) cls.push('current');
    return `<button type="button" class="${cls.join(' ')}" data-qnum="${q.qNumber}">${q.qNumber}</button>`;
  }).join('');

  wrap.querySelectorAll('.exam-palette-cell').forEach((btn) => {
    btn.addEventListener('click', () => {
      const qnum = Number(btn.getAttribute('data-qnum'));
      const idx = session.questions.findIndex((q) => q.qNumber === qnum);
      if (idx >= 0) {
        session.currentIndex = idx;
        renderQuestion(screen, root, ctx, idx);
        renderPalette(screen, root, ctx);
      }
    });
  });
}

function renderQuestion(screen, root, ctx, index) {
  session.currentIndex = index;
  const q = session.questions[index];
  const area = screen.querySelector('.exam-question-area');
  screen.querySelector('.exam-progress-num').textContent = String(q.qNumber);

  const card = document.createElement('div');
  card.className = 'exam-question-card';

  const header = document.createElement('div');
  header.className = 'exam-question-header';
  header.innerHTML = `
    <span class="exam-q-section">${q.section}</span>
    <button type="button" class="exam-flag-btn ${session.flags.has(q.qNumber) ? 'on' : ''}">🚩 ${session.flags.has(q.qNumber) ? 'Flagged' : 'Flag'}</button>
  `;
  card.appendChild(header);

  if (q.passage) {
    card.appendChild(renderPassagePanel(q.passage, q.lineRef));
  }

  const body = document.createElement('div');
  body.className = 'exam-question-body';
  body.appendChild(renderQuestionBody(q));
  card.appendChild(body);

  const nav = document.createElement('div');
  nav.className = 'exam-question-nav';
  nav.innerHTML = `
    <button type="button" class="btn btn-ghost exam-prev-btn" ${index === 0 ? 'disabled' : ''}>← Prev</button>
    <button type="button" class="btn btn-ghost exam-next-btn" ${index === session.questions.length - 1 ? 'disabled' : ''}>Next →</button>
  `;
  card.appendChild(nav);

  area.innerHTML = '';
  area.appendChild(card);

  header.querySelector('.exam-flag-btn').addEventListener('click', () => {
    if (session.flags.has(q.qNumber)) session.flags.delete(q.qNumber);
    else session.flags.add(q.qNumber);
    renderQuestion(screen, root, ctx, index);
    renderPalette(screen, root, ctx);
  });
  nav.querySelector('.exam-prev-btn').addEventListener('click', () => {
    if (index > 0) { renderQuestion(screen, root, ctx, index - 1); renderPalette(screen, root, ctx); }
  });
  nav.querySelector('.exam-next-btn').addEventListener('click', () => {
    if (index < session.questions.length - 1) { renderQuestion(screen, root, ctx, index + 1); renderPalette(screen, root, ctx); }
  });
}

function renderPassagePanel(passage, lineRef) {
  const wrap = document.createElement('div');
  wrap.className = 'exam-passage-panel';
  const title = document.createElement('h4');
  title.textContent = passage.title;
  wrap.appendChild(title);
  const linesWrap = document.createElement('div');
  linesWrap.className = 'exam-passage-lines';
  passage.lines.forEach((line, i) => {
    const lineNum = i + 1;
    const row = document.createElement('div');
    row.className = 'exam-passage-line';
    if (String(lineNum) === String(lineRef)) row.classList.add('highlight');
    const marginNum = lineNum % 5 === 0 ? `<span class="exam-line-num">${lineNum}</span>` : '<span class="exam-line-num"></span>';
    row.innerHTML = `${marginNum}<span class="exam-line-text">${line || '&nbsp;'}</span>`;
    linesWrap.appendChild(row);
  });
  wrap.appendChild(linesWrap);
  if (lineRef) {
    const chip = document.createElement('div');
    chip.className = 'exam-lineref-chip';
    chip.textContent = `See line${String(lineRef).includes('-') ? 's' : ''} ${lineRef}`;
    chip.addEventListener('click', () => {
      const target = linesWrap.querySelector('.highlight');
      if (target) target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
    wrap.appendChild(chip);
  }
  return wrap;
}

const OMR_LETTERS = ['A', 'B', 'C', 'D', 'E'];

function renderQuestionBody(q) {
  const wrap = document.createElement('div');

  const stem = document.createElement('div');
  stem.className = 'exam-stem';

  if (q.format === 'errorspot') {
    stem.innerHTML = q.segments.map((seg, i) => `<span class="exam-segment">${seg.text}<sup>${OMR_LETTERS[i]}</sup></span>`).join(' ');
  } else if (q.format === 'clozebox') {
    stem.innerHTML = `${q.stemParts[0]}<span class="exam-gap">▁▁▁▁</span>${q.stemParts[1]}`;
  } else {
    stem.innerHTML = q.stem || '';
  }
  wrap.appendChild(stem);

  if (q.unit && (q.format === 'num')) {
    const unitLine = document.createElement('div');
    unitLine.className = 'exam-unit-hint';
    unitLine.textContent = `Give your answer in ${q.unit}.`;
    wrap.appendChild(unitLine);
  }

  // Reference option text (printed like a real paper) for choice-style formats.
  if (q.format === 'mcq5' || q.format === 'clozebox' || q.format === 'selecttwo') {
    const list = document.createElement('div');
    list.className = 'exam-option-list';
    list.innerHTML = q.options.map((o, i) => `<div><b>${OMR_LETTERS[i]}.</b> ${o.text}</div>`).join('');
    wrap.appendChild(list);
  }

  wrap.appendChild(renderOMRStrip(q));
  return wrap;
}

function renderOMRStrip(q) {
  const strip = document.createElement('div');
  strip.className = 'exam-omr-strip';

  const currentAnswer = session.answers[q.qNumber];

  if (q.format === 'num' || q.format === 'wordentry') {
    const box = document.createElement('input');
    box.type = 'text';
    box.className = 'exam-writein-box';
    box.autocapitalize = 'off';
    box.autocorrect = 'off';
    box.spellcheck = false;
    box.maxLength = q.maxLen || 40;
    box.value = currentAnswer != null ? currentAnswer : '';
    box.placeholder = q.format === 'num' ? 'Type your answer…' : (q.hint || 'Type your answer…');
    box.addEventListener('input', () => {
      session.answers[q.qNumber] = box.value;
      refreshPaletteBadge(q.qNumber);
    });
    strip.appendChild(box);
    return strip;
  }

  if (q.format === 'errorspot') {
    const bubbles = document.createElement('div');
    bubbles.className = 'exam-omr-bubbles';
    q.segments.forEach((seg, i) => {
      bubbles.appendChild(makeBubble(OMR_LETTERS[i], i === currentAnswer, () => setAnswer(q, i)));
    });
    bubbles.appendChild(makeBubble('N', currentAnswer === 'N', () => setAnswer(q, 'N'), 'ALL CLEAN!'));
    strip.appendChild(bubbles);
    return strip;
  }

  if (q.format === 'selecttwo') {
    const bubbles = document.createElement('div');
    bubbles.className = 'exam-omr-bubbles';
    const selected = Array.isArray(currentAnswer) ? currentAnswer : [];
    q.options.forEach((o, i) => {
      bubbles.appendChild(makeBubble(OMR_LETTERS[i], selected.includes(i), () => toggleSelectTwo(q, i)));
    });
    strip.appendChild(bubbles);
    return strip;
  }

  // mcq5 / clozebox
  const bubbles = document.createElement('div');
  bubbles.className = 'exam-omr-bubbles';
  q.options.forEach((o, i) => {
    bubbles.appendChild(makeBubble(OMR_LETTERS[i], i === currentAnswer, () => setAnswer(q, i)));
  });
  strip.appendChild(bubbles);
  return strip;
}

function makeBubble(label, active, onClick, title) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'exam-omr-bubble' + (active ? ' filled' : '');
  b.textContent = label;
  if (title) b.title = title;
  b.addEventListener('click', onClick);
  return b;
}

function setAnswer(q, value) {
  session.answers[q.qNumber] = value;
  // Re-render just the strip's active state (cheap full re-render of the body is fine —
  // the paper is short-lived and this keeps the code simple/robust).
  const area = document.querySelector('.exam-question-area');
  if (area) {
    const body = area.querySelector('.exam-question-body');
    if (body) { body.innerHTML = ''; body.appendChild(renderQuestionBody(q)); }
  }
  refreshPaletteBadge(q.qNumber);
}

function toggleSelectTwo(q, index) {
  const current = Array.isArray(session.answers[q.qNumber]) ? session.answers[q.qNumber].slice() : [];
  const at = current.indexOf(index);
  if (at >= 0) {
    current.splice(at, 1);
  } else {
    current.push(index);
    if (current.length > 2) current.shift(); // third tap swaps the oldest (mirrors battle's selecttwo rule)
  }
  session.answers[q.qNumber] = current;
  const area = document.querySelector('.exam-question-area');
  if (area) {
    const body = area.querySelector('.exam-question-body');
    if (body) { body.innerHTML = ''; body.appendChild(renderQuestionBody(q)); }
  }
  refreshPaletteBadge(q.qNumber);
}

function refreshPaletteBadge(qNumber) {
  const cell = document.querySelector(`.exam-palette-cell[data-qnum="${qNumber}"]`);
  if (!cell) return;
  const val = session.answers[qNumber];
  const answered = val !== undefined && val !== null && val !== '' && !(Array.isArray(val) && val.length === 0);
  cell.classList.toggle('answered', answered);
}

/* ---------------------- FINISH / BLANK-CHECK ---------------------- */

function unansweredQNumbers() {
  return session.questions
    .filter((q) => {
      const v = session.answers[q.qNumber];
      return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
    })
    .map((q) => q.qNumber);
}

function attemptFinish(root, ctx) {
  const blanks = unansweredQNumbers();
  if (blanks.length > 0) {
    showBlankCheckModal(root, ctx, blanks);
  } else {
    finishExam(root, ctx, { autoSubmitted: false });
  }
}

function showBlankCheckModal(root, ctx, blanks) {
  const overlay = document.createElement('div');
  overlay.className = 'exam-modal-overlay';
  overlay.innerHTML = `
    <div class="exam-modal-card">
      <h3>Never leave blanks!</h3>
      <p>You've got ${blanks.length} unanswered question${blanks.length === 1 ? '' : 's'}. Best-guess the rest?</p>
      <div class="exam-modal-actions">
        <button type="button" class="btn btn-ghost exam-modal-back">Go back</button>
        <button type="button" class="btn btn-gold exam-modal-finish">Finish anyway</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('.exam-modal-back').addEventListener('click', () => {
    overlay.remove();
    const idx = session.questions.findIndex((q) => q.qNumber === blanks[0]);
    const screen = root.querySelector('.exam-paper');
    if (idx >= 0 && screen) { renderQuestion(screen, root, ctx, idx); renderPalette(screen, root, ctx); }
  });
  overlay.querySelector('.exam-modal-finish').addEventListener('click', () => {
    overlay.remove();
    finishExam(root, ctx, { autoSubmitted: false });
  });
}

function showInfoModal(root, ctx, message) {
  const overlay = document.createElement('div');
  overlay.className = 'exam-modal-overlay';
  overlay.innerHTML = `
    <div class="exam-modal-card">
      <h3>${message}</h3>
      <div class="exam-modal-actions">
        <button type="button" class="btn btn-gold exam-modal-ok">Carry on</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('.exam-modal-ok').addEventListener('click', () => overlay.remove());
  deferTimeout(() => { if (overlay.isConnected) overlay.remove(); }, 15000);
}

function showExitConfirm(root, ctx) {
  const overlay = document.createElement('div');
  overlay.className = 'exam-modal-overlay';
  overlay.innerHTML = `
    <div class="exam-modal-card">
      <h3>Leave the paper?</h3>
      <p>Your answers so far are kept — you can come back and carry on.</p>
      <div class="exam-modal-actions">
        <button type="button" class="btn btn-ghost exam-modal-stay">Keep going</button>
        <button type="button" class="btn btn-gold exam-modal-leave">Leave for now</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('.exam-modal-stay').addEventListener('click', () => overlay.remove());
  overlay.querySelector('.exam-modal-leave').addEventListener('click', () => {
    overlay.remove();
    ctx.go('#/map');
  });
}

/* ---------------------- GRADE + RESULTS ---------------------- */

async function finishExam(root, ctx, { autoSubmitted }) {
  if (!session || session.finished) return;
  session.finished = true;
  const finishedAt = Date.now();
  const graded = gradeExam(session.questions, session.answers);
  const passed = session.type === 'king' ? kingFalls(graded.score, graded.total) : guardFalls(graded.score, graded.total);

  const record = {
    id: `mock-${session.startedAt}`,
    type: session.type,
    startedAt: session.startedAt,
    finishedAt,
    durationMs: finishedAt - session.startedAt,
    score: graded.score,
    total: graded.total,
    perTopic: graded.perTopic,
    perSection: graded.perSection,
    flaggedCount: session.flags.size,
    blanksAtSubmit: unansweredQNumbers().length,
    autoSubmitted: !!autoSubmitted,
    passed,
  };

  try {
    await ctx.db.put('mocks', record.id, record);
  } catch (e) {
    // Best-effort, same rationale as state.js: a save failure must never strand
    // the child on a frozen paper — always continue to the results screen.
    // eslint-disable-next-line no-console
    console.error('exam.js: failed to persist mock record (continuing to results anyway):', e);
  }

  if (ctx.state && typeof ctx.state.recordMock === 'function') {
    try { await ctx.state.recordMock(record); } catch (e) { /* optional contract — safe to ignore */ }
  }

  if (!alive) return;
  renderResults(root, ctx, record);
}

function renderResults(root, ctx, record) {
  const isKing = record.type === 'king';
  const hp = hpFraction(record.score, record.total);
  const weakest = Object.entries(record.perTopic)
    .map(([topicId, v]) => ({ topicId, acc: v.total ? v.correct / v.total : 0 }))
    .sort((a, b) => a.acc - b.acc)
    .slice(0, 3);

  const screen = document.createElement('div');
  screen.className = 'exam-screen exam-results enter-pop';
  screen.innerHTML = `
    <h1 class="exam-results-title">${record.passed ? (isKing ? 'HE FALLS!' : 'Strong run!') : (isKing ? 'So close, hero!' : 'Nearly there!')}</h1>
    <div class="exam-boss-card">
      <div class="exam-boss-emoji">${isKing ? '👑' : '🛡️'}</div>
      <div class="exam-boss-name">${isKing ? 'The Skidmark King' : 'The Royal Guard'}</div>
      <div class="exam-hp-bar"><div class="exam-hp-fill" style="width:${Math.round(hp * 100)}%"></div></div>
    </div>
    <div class="exam-score-line">Score: <b>${record.score} / ${record.total}</b></div>
    <p class="exam-flavour">${record.passed ? pick(WHIFF_WIN_LINES) : pick(WHIFF_LOW_LINES)}</p>
    ${weakest.length ? `
      <div class="exam-weakest">
        <h4>Whiff of Wisdom — worth a re-stink:</h4>
        <ul>${weakest.map((w) => `<li>${w.topicId} — ${Math.round(w.acc * 100)}% correct</li>`).join('')}</ul>
      </div>
    ` : ''}
    <div class="exam-results-actions">
      <button type="button" class="btn btn-ghost exam-results-hub">Back to Castle Clench</button>
      <button type="button" class="btn btn-gold exam-results-map">Back to Map</button>
    </div>
  `;
  root.innerHTML = '';
  root.appendChild(screen);

  ctx.audio.sfx(record.passed ? 'capture' : 'confirm');
  ctx.audio.parp(record.passed ? 3 : 1);

  screen.querySelector('.exam-results-hub').addEventListener('click', () => {
    session = null; // clears the module-level session so the hub renders fresh
    renderHub(root, ctx);
  });
  screen.querySelector('.exam-results-map').addEventListener('click', () => {
    session = null;
    ctx.go('#/map');
  });
}
