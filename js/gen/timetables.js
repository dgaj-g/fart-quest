// FART QUEST — GEN agent
// Topic: timetables (The Timetable Terminus). generate(tier, rng) -> Question.
import { rngInt, pick, shuffle } from '../rng.js';

const RULE = 'One finger on the row, one on the column — read where they meet. For journey time, count UP to the next hour, then on.';

const STOP_NAMES = ['Village Green', 'Market Square', 'The Terminus'];
const STOP_KEYS = ['depart', 'atMarket', 'atTerminus'];
const BUS_LETTERS = ['A', 'B', 'C', 'D'];

// ---------- number / time formatting ----------
function fmt(n) {
  return Math.round(n).toLocaleString('en-GB');
}
function fmtTime(totalMin) {
  const m = ((Math.round(totalMin) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function dedupe(correctText, list) {
  const seen = new Set([correctText]);
  const out = [];
  for (const c of list) {
    if (seen.has(c.text)) continue;
    seen.add(c.text);
    out.push(c);
  }
  return out;
}

// Pads with plausible near-miss numeric distractors (never random garbage) if the crafted set
// left us short of the tier minimum after de-duplication.
function padWithNearMiss(rng, options, minTotal, correctVal, spread) {
  const seen = new Set(options.map((o) => o.text));
  let tries = 0;
  const step = Math.max(1, Math.round(spread));
  while (options.length < minTotal && tries < 60) {
    tries += 1;
    const delta = rngInt(rng, 1, step * 3) * (rng() < 0.5 ? 1 : -1);
    const val = Math.round(correctVal + delta);
    if (val < 0) continue;
    const text = fmt(val);
    if (seen.has(text)) continue;
    seen.add(text);
    options.push({ text, misconception: 'padded-near-miss' });
  }
  return options;
}

function buildWhyWrong(options) {
  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'wrong-stop') whyWrong[o.text] = 'One finger slipped onto the wrong ROW — that’s a different stop.';
    else if (o.misconception === 'wrong-bus') whyWrong[o.text] = 'One finger slipped onto the wrong COLUMN — that’s a different bus.';
    else if (o.misconception === 'opposite-extreme') whyWrong[o.text] = 'That’s actually the opposite end of the timetable — check the row again from the other side.';
    else if (o.misconception === 'wrong-order') whyWrong[o.text] = 'Close, but another bus is further along the row still.';
    else if (o.misconception === 'digit-subtraction') whyWrong[o.text] = 'That subtracts the clock times like ordinary numbers — but 60 minutes make an hour, not 100. Count UP instead.';
    else if (o.misconception === 'partial-leg') whyWrong[o.text] = 'That’s only PART of the journey — check you counted all the way from the first stop to the last.';
    else if (o.misconception === 'too-late') whyWrong[o.text] = 'That bus arrives AFTER the deadline — too late!';
    else if (o.misconception === 'earlier-but-not-optimal') whyWrong[o.text] = 'That bus does get you there in time, but a LATER bus still arrives by the deadline — check the finger-track again.';
    else if (o.misconception === 'impossible-claim') whyWrong[o.text] = 'One of the buses definitely gets you there in time — check every arrival time against the deadline.';
    else if (o.misconception === 'miscounted-gap') whyWrong[o.text] = 'The number of buses between them was miscounted — count the columns carefully.';
    else if (o.misconception === 'assumed-adjacent') whyWrong[o.text] = 'That assumes the buses are right next to each other on the timetable — check how many services actually separate them.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check the finger-track again, row then column, nice and slow.';
  }
  return whyWrong;
}

// ---------- shared timetable builder ----------
// 3 stops (Village Green, Market Square, The Terminus) x 4 buses (A-D). Every bus keeps the
// SAME two leg-lengths (Village Green->Market Square, Market Square->Terminus) so the timetable
// is internally consistent (a real service pattern), and buses depart at a fixed interval —
// exactly like a real bus company's regular service. `tt.buses` is kept in CHRONOLOGICAL order
// (buses[0] always departs earliest, buses[3] latest) so index arithmetic (gaps, "latest bus
// that's still on time", earliest/latest search) stays simple and correct — but the LETTER label
// on each chronological slot is independently shuffled (fix: without this, "Bus A" would always
// be the earliest/leftmost bus in every generated question, a permanent answer-pattern tell for
// the earliest/latest and best-bus templates). The visual table's columns are then displayed in
// alphabetical letter order (A, B, C, D) like a real printed timetable, so a column's times are
// not necessarily increasing left-to-right — exactly the row/column discipline the weapon teaches.
function buildTimetable(rng) {
  const startHour = rngInt(rng, 6, 18);
  const startMin = pick(rng, [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
  const interval = pick(rng, [20, 25, 30]);
  const leg1 = rngInt(rng, 8, 22); // Village Green -> Market Square
  let leg2 = rngInt(rng, 10, 30); // Market Square -> The Terminus
  if (leg2 === leg1) leg2 += 5;
  const baseDepart = startHour * 60 + startMin;
  const letterOrder = shuffle(rng, BUS_LETTERS.slice());
  const buses = [0, 1, 2, 3].map((i) => {
    const depart = baseDepart + i * interval;
    const atMarket = depart + leg1;
    const atTerminus = atMarket + leg2;
    return { letter: letterOrder[i], depart, atMarket, atTerminus };
  });
  return { buses, leg1, leg2, interval };
}

function timetableVisual(tt) {
  const byLetter = [...tt.buses].sort((a, b) => a.letter.localeCompare(b.letter));
  const headers = ['Stop', ...byLetter.map((b) => `Bus ${b.letter}`)];
  const rows = STOP_KEYS.map((key, i) => [STOP_NAMES[i], ...byLetter.map((b) => fmtTime(b[key]))]);
  return { kind: 'table', headers, rows };
}

// -------- T1 templates --------

function t1ReadCell(rng) {
  const tt = buildTimetable(rng);
  const stopIdx = rngInt(rng, 0, 2);
  const busIdx = rngInt(rng, 0, 3);
  const key = STOP_KEYS[stopIdx];
  const verb = stopIdx === 0 ? 'leave' : 'arrive at';
  const bus = tt.buses[busIdx];
  const correctVal = bus[key];
  const correctText = fmtTime(correctVal);
  const stem = `One finger on the row, one on the column! What time does <b>Bus ${bus.letter}</b> ${verb} <b>${STOP_NAMES[stopIdx]}</b>?`;

  const wrongStopIdx = pick(rng, [0, 1, 2].filter((x) => x !== stopIdx));
  const otherBusIdxs = shuffle(rng, [0, 1, 2, 3].filter((x) => x !== busIdx));

  const distractors = [
    { text: fmtTime(bus[STOP_KEYS[wrongStopIdx]]), misconception: 'wrong-stop' },
    { text: fmtTime(tt.buses[otherBusIdxs[0]][key]), misconception: 'wrong-bus' },
    { text: fmtTime(tt.buses[otherBusIdxs[1]][key]), misconception: 'wrong-bus' },
  ];

  const correct = { text: correctText, misconception: null };
  let options = [correct, ...dedupe(correctText, distractors)];
  options = padWithNearMiss(rng, options, 4, correctVal, tt.interval / 2);

  const whyWrong = buildWhyWrong(options);
  return {
    templateId: 'tt-t1-read-cell',
    stem,
    visual: timetableVisual(tt),
    options,
    correctIndex: 0,
    hintSteps: [
      `Find the <b>${STOP_NAMES[stopIdx]}</b> row first, then find the <b>Bus ${bus.letter}</b> column.`,
      'Where the row and column meet — that’s your answer.',
    ],
    explain: {
      rule: RULE,
      worked: `The ${STOP_NAMES[stopIdx]} row meets the Bus ${bus.letter} column at ${correctText}.`,
      whyWrong,
    },
  };
}

function t1WhichBusAtTime(rng) {
  const tt = buildTimetable(rng);
  const stopIdx = rngInt(rng, 0, 2);
  const busIdx = rngInt(rng, 0, 3);
  const key = STOP_KEYS[stopIdx];
  const verb = stopIdx === 0 ? 'leaves' : 'arrives at';
  const targetVal = tt.buses[busIdx][key];
  const targetText = fmtTime(targetVal);
  const stem = `Which bus ${verb} <b>${STOP_NAMES[stopIdx]}</b> at <b>${targetText}</b>?`;

  const options = tt.buses.map((b) => ({
    text: `Bus ${b.letter}`,
    misconception: b.letter === tt.buses[busIdx].letter ? null : 'wrong-bus',
  }));
  const correctIndex = options.findIndex((o) => o.misconception === null);

  const whyWrong = buildWhyWrong(options);
  return {
    templateId: 'tt-t1-which-bus-at-time',
    stem,
    visual: timetableVisual(tt),
    options,
    correctIndex,
    hintSteps: [
      `Find the <b>${STOP_NAMES[stopIdx]}</b> row, then run your finger along it looking for ${targetText}.`,
      'Now look straight up that column — which bus owns it?',
    ],
    explain: {
      rule: RULE,
      worked: `${targetText} sits in Bus ${tt.buses[busIdx].letter}'s column on the ${STOP_NAMES[stopIdx]} row.`,
      whyWrong,
    },
  };
}

function t1EarliestOrLatestAtStop(rng) {
  const tt = buildTimetable(rng);
  const stopIdx = rngInt(rng, 0, 2);
  const wantEarliest = rng() < 0.5;
  const verb = stopIdx === 0 ? 'leaves' : 'arrives at';
  const correctIdx = wantEarliest ? 0 : 3; // times always increase A->D by construction
  const oppositeIdx = wantEarliest ? 3 : 0;
  const stem = `Which bus ${verb} <b>${STOP_NAMES[stopIdx]}</b> the <b>${wantEarliest ? 'EARLIEST' : 'LATEST'}</b>?`;

  const options = tt.buses.map((b, i) => {
    let misconception = null;
    if (i === correctIdx) misconception = null;
    else if (i === oppositeIdx) misconception = 'opposite-extreme';
    else misconception = 'wrong-order';
    return { text: `Bus ${b.letter}`, misconception: i === correctIdx ? null : misconception };
  });

  const whyWrong = buildWhyWrong(options);
  return {
    templateId: 'tt-t1-earliest-latest',
    stem,
    visual: timetableVisual(tt),
    options,
    correctIndex: correctIdx,
    hintSteps: [
      `Run your finger along the <b>${STOP_NAMES[stopIdx]}</b> row, left to right.`,
      `The ${wantEarliest ? 'smallest' : 'biggest'} time on that row wins.`,
    ],
    explain: {
      rule: RULE,
      worked: `Along the ${STOP_NAMES[stopIdx]} row, Bus ${tt.buses[correctIdx].letter} is the ${wantEarliest ? 'earliest' : 'latest'}.`,
      whyWrong,
    },
  };
}

// -------- T2 templates --------

function t2JourneyDuration(rng) {
  const tt = buildTimetable(rng);
  const busIdx = rngInt(rng, 0, 3);
  const bus = tt.buses[busIdx];
  const correctVal = bus.atTerminus - bus.depart; // = leg1 + leg2, constant across buses
  const stem = `<b>Bus ${bus.letter}</b> leaves <b>Village Green</b> at <b>${fmtTime(bus.depart)}</b> and arrives at <b>The Terminus</b> at <b>${fmtTime(bus.atTerminus)}</b>. How long does the whole journey take? Give your answer in minutes.`;

  const depHHMM = Math.floor(bus.depart / 60) * 100 + (bus.depart % 60);
  const arrHHMM = Math.floor(bus.atTerminus / 60) * 100 + (bus.atTerminus % 60);
  const naiveDigitSub = arrHHMM - depHHMM;

  const distractors = [
    { text: fmt(naiveDigitSub), misconception: 'digit-subtraction' },
    { text: fmt(tt.leg1), misconception: 'partial-leg' },
    { text: fmt(tt.leg2), misconception: 'partial-leg' },
  ];

  const correct = { text: fmt(correctVal), misconception: null };
  let options = [correct, ...dedupe(correct.text, distractors)];
  options = padWithNearMiss(rng, options, 5, correctVal, Math.max(3, tt.interval / 3));

  const whyWrong = buildWhyWrong(options);
  return {
    templateId: 'tt-t2-journey-duration',
    stem,
    visual: timetableVisual(tt),
    options,
    correctIndex: 0,
    hintSteps: [
      `Count UP from ${fmtTime(bus.depart)} to the next whole hour first, then keep counting on to ${fmtTime(bus.atTerminus)}.`,
      `Never subtract clock times like ordinary numbers — 60 minutes make an hour, not 100.`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmtTime(bus.depart)} to ${fmtTime(bus.atTerminus)} is ${correctVal} minutes, counted UP hour by hour.`,
      whyWrong,
    },
  };
}

function t2BestBusByDeadline(rng) {
  const tt = buildTimetable(rng);
  const arrivals = tt.buses.map((b) => b.atTerminus);
  const bestIdx = rngInt(rng, 0, 2); // guarantees at least one later bus exists (too-late option)
  const offset = rngInt(rng, 1, tt.interval - 1);
  const target = arrivals[bestIdx] + offset;
  const stem = `You need to arrive at <b>The Terminus</b> by <b>${fmtTime(target)}</b>. Which bus should you catch from <b>Village Green</b>?`;

  const options = tt.buses.map((b, i) => ({
    text: `Bus ${b.letter}`,
    misconception: i === bestIdx ? null : (i > bestIdx ? 'too-late' : 'earlier-but-not-optimal'),
  }));
  options.push({ text: 'None of these buses arrive in time', misconception: 'impossible-claim' });

  const whyWrong = buildWhyWrong(options);
  return {
    templateId: 'tt-t2-best-bus-deadline',
    stem,
    visual: timetableVisual(tt),
    options,
    correctIndex: bestIdx,
    hintSteps: [
      `Run your finger along the <b>The Terminus</b> row and check each bus's arrival time against ${fmtTime(target)}.`,
      `Pick the LATEST bus that still arrives by the deadline — no earlier than it needs to be.`,
    ],
    explain: {
      rule: RULE,
      worked: `Bus ${tt.buses[bestIdx].letter} arrives at ${fmtTime(arrivals[bestIdx])} — the latest arrival that is still by ${fmtTime(target)}.`,
      whyWrong,
    },
  };
}

function t2CompareArrivals(rng) {
  const tt = buildTimetable(rng);
  let i = rngInt(rng, 0, 3);
  let j = rngInt(rng, 0, 3);
  while (j === i) j = rngInt(rng, 0, 3);
  const earlierIdx = Math.min(i, j);
  const laterIdx = Math.max(i, j);
  const stopIdx = rngInt(rng, 0, 2);
  const key = STOP_KEYS[stopIdx];
  const earlierVal = tt.buses[earlierIdx][key];
  const laterVal = tt.buses[laterIdx][key];
  const gap = laterIdx - earlierIdx;
  const correctVal = laterVal - earlierVal; // = gap * interval

  const stem = `Bus ${tt.buses[earlierIdx].letter} ${stopIdx === 0 ? 'leaves' : 'arrives at'} <b>${STOP_NAMES[stopIdx]}</b> at <b>${fmtTime(earlierVal)}</b>. Bus ${tt.buses[laterIdx].letter} ${stopIdx === 0 ? 'leaves' : 'arrives at'} the same stop at <b>${fmtTime(laterVal)}</b>. How many minutes EARLIER does <b>Bus ${tt.buses[earlierIdx].letter}</b> go than <b>Bus ${tt.buses[laterIdx].letter}</b>? Give your answer in minutes.`;

  const earlierHHMM = Math.floor(earlierVal / 60) * 100 + (earlierVal % 60);
  const laterHHMM = Math.floor(laterVal / 60) * 100 + (laterVal % 60);
  const naiveDigitSub = laterHHMM - earlierHHMM;

  const distractors = [
    { text: fmt(naiveDigitSub), misconception: 'digit-subtraction' },
    { text: fmt(tt.interval), misconception: 'assumed-adjacent' },
    { text: fmt((gap + 1) * tt.interval), misconception: 'miscounted-gap' },
  ];

  const correct = { text: fmt(correctVal), misconception: null };
  let options = [correct, ...dedupe(correct.text, distractors)];
  options = padWithNearMiss(rng, options, 5, correctVal, Math.max(3, tt.interval / 2));

  const whyWrong = buildWhyWrong(options);
  return {
    templateId: 'tt-t2-compare-arrivals',
    stem,
    visual: timetableVisual(tt),
    options,
    correctIndex: 0,
    hintSteps: [
      `Count how many buses apart Bus ${tt.buses[earlierIdx].letter} and Bus ${tt.buses[laterIdx].letter} are on the timetable.`,
      `Count UP from ${fmtTime(earlierVal)} to ${fmtTime(laterVal)} to check.`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmtTime(earlierVal)} to ${fmtTime(laterVal)} is ${correctVal} minutes, counted UP.`,
      whyWrong,
    },
  };
}

// -------- T3 templates (num format) --------

function t3MidnightCrossing(rng) {
  const departMin = rngInt(rng, 22 * 60 + 10, 23 * 60 + 50);
  let dur = rngInt(rng, 20, 75);
  let arriveRaw = departMin + dur;
  if (arriveRaw < 1440) {
    dur += (1440 - arriveRaw) + rngInt(rng, 5, 40);
    arriveRaw = departMin + dur;
  }
  const arriveClock = arriveRaw % 1440;
  const toMidnight = 1440 - departMin;
  const stem = `The last bus leaves <b>Village Green</b> at <b>${fmtTime(departMin)}</b> and arrives at <b>The Terminus</b> at <b>${fmtTime(arriveClock)} the next day</b>. How many minutes does the journey take?`;

  return {
    templateId: 'tt-t3-midnight-crossing',
    stem,
    format: 'num',
    unit: 'min',
    accept: [String(dur)],
    hintSteps: [
      `Count UP to midnight first: ${fmtTime(departMin)} to 00:00 is ${toMidnight} minutes.`,
      `Then keep counting from midnight to ${fmtTime(arriveClock)}: that's another ${arriveClock} minutes. ${toMidnight} + ${arriveClock} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmtTime(departMin)} to midnight is ${toMidnight} minutes. Midnight to ${fmtTime(arriveClock)} is another ${arriveClock} minutes. ${toMidnight} + ${arriveClock} = ${dur} minutes.`,
      whyWrong: {},
    },
  };
}

const MONTHS = [
  { name: 'January', len: 31, next: 'February' },
  { name: 'February', len: 28, next: 'March' },
  { name: 'March', len: 31, next: 'April' },
  { name: 'April', len: 30, next: 'May' },
  { name: 'May', len: 31, next: 'June' },
  { name: 'June', len: 30, next: 'July' },
  { name: 'July', len: 31, next: 'August' },
  { name: 'August', len: 31, next: 'September' },
  { name: 'September', len: 30, next: 'October' },
  { name: 'October', len: 31, next: 'November' },
  { name: 'November', len: 30, next: 'December' },
  { name: 'December', len: 31, next: 'January' },
];

function t3CalendarDaysAfter(rng) {
  const m = pick(rng, MONTHS);
  const d = rngInt(rng, Math.max(1, m.len - 15), m.len);
  const daysLeft = m.len - d;
  const n = rngInt(rng, daysLeft + 1, daysLeft + 21);
  const daysInto = d + n - m.len;
  const stem = `<b>${m.name}</b> has <b>${m.len}</b> days. Today is <b>${d} ${m.name}</b>. What date will it be <b>${n} days</b> later? It will be in <b>${m.next}</b> — just write the day number.`;

  return {
    templateId: 'tt-t3-calendar-days-after',
    stem,
    format: 'num',
    unit: m.next,
    accept: [String(daysInto)],
    hintSteps: [
      `First count how many days are LEFT in ${m.name}: ${m.len} − ${d} = ${daysLeft}.`,
      `That uses up ${daysLeft} of your ${n} days. The rest — ${n} − ${daysLeft} = ${daysInto} — land in ${m.next}.`,
    ],
    explain: {
      rule: RULE,
      worked: `${m.len} − ${d} = ${daysLeft} days left in ${m.name}. ${n} − ${daysLeft} = ${daysInto}, so the date is ${daysInto} ${m.next}.`,
      whyWrong: {},
    },
  };
}

function t3WaitingTime(rng) {
  const nowMin = rngInt(rng, 6 * 60, 21 * 60);
  const wait = rngInt(rng, 6, 55);
  const busMin = nowMin + wait;
  const stopName = pick(rng, STOP_NAMES);
  const stem = `It is <b>${fmtTime(nowMin)}</b> at <b>${stopName}</b>. The next bus is due at <b>${fmtTime(busMin)}</b>. How many minutes do you have to wait?`;

  return {
    templateId: 'tt-t3-waiting-time',
    stem,
    format: 'num',
    unit: 'min',
    accept: [String(wait)],
    hintSteps: [
      `Count UP from ${fmtTime(nowMin)} to the next whole hour first.`,
      `Then keep counting on to ${fmtTime(busMin)}.`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmtTime(nowMin)} to ${fmtTime(busMin)} is ${wait} minutes, counted UP.`,
      whyWrong: {},
    },
  };
}

// -------- dispatch --------

const T1 = [t1ReadCell, t1WhichBusAtTime, t1EarliestOrLatestAtStop];
const T2 = [t2JourneyDuration, t2BestBusByDeadline, t2CompareArrivals];
const T3 = [t3MidnightCrossing, t3CalendarDaysAfter, t3WaitingTime];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `tt-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'timetables',
    tier,
    format,
    stem: built.stem,
    visual: built.visual || null,
    hintSteps: built.hintSteps,
    explain: built.explain,
    _templateId: built.templateId,
  };

  if (format === 'mcq5') {
    question.options = built.options;
    question.correctIndex = built.correctIndex;
  } else {
    question.accept = built.accept;
    if (built.unit) question.unit = built.unit;
  }

  return question;
}

export default { generate };
