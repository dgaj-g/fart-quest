// FART QUEST — GEN agent
// Topic: clocks-time (Tick-Tock Hollow, genId 'clocks'). generate(tier, rng) -> Question.
import { rngInt, pick, shuffle } from '../rng.js';

const RULE = 'Past or to? Minute hand left half = TO, right half = PAST. For 24-hour: afternoon = add 12.';

// Single numeric formatter (times are always whole numbers here — no float junk possible).
function fmt(n) {
  return String(Math.round(n));
}
function pad2(n) {
  return String(n).padStart(2, '0');
}

// -------- time helpers (12-hour arithmetic; all pure, no Date object involved) --------

function fmtTime12(h, m) {
  // h: 1-12, m: 0-59. UK style: hour not zero-padded, minutes always 2 digits.
  return `${fmt(h)}:${pad2(m)}`;
}
function fmtTime24(h24, m) {
  // h24: 0-23, m: 0-59. Both padded to 2 digits (the standard 24-hour form).
  return `${pad2(h24)}:${pad2(m)}`;
}
function fmtTime24NoPad(h24, m) {
  return `${fmt(h24)}:${pad2(m)}`;
}
function nextHour(h) {
  return h === 12 ? 1 : h + 1;
}
function prevHour(h) {
  return h === 1 ? 12 : h - 1;
}
function to24(h12, m, isPM) {
  let h24;
  if (isPM) h24 = h12 === 12 ? 12 : h12 + 12;
  else h24 = h12 === 12 ? 0 : h12;
  return { h24, m };
}
function to12(h24) {
  const isPM = h24 >= 12;
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return { h12, isPM };
}

// Word phrase for a 5-minute-interval clock reading. m must be a multiple of 5 (0-55).
const MIN_PHRASE = {
  5: 'five past', 10: 'ten past', 15: 'quarter past', 20: 'twenty past', 25: 'twenty-five past',
  35: 'twenty-five to', 40: 'twenty to', 45: 'quarter to', 50: 'ten to', 55: 'five to',
};
function wordsForClock(h, m) {
  if (m === 0) return `${h} o’clock`;
  if (m === 30) return `half past ${h}`;
  const isTo = m > 30;
  const key = MIN_PHRASE[m];
  const displayHour = isTo ? nextHour(h) : h;
  return `${key} ${displayHour}`;
}
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function uniqueOptions(correctText, candidates) {
  const seen = new Set([correctText]);
  const out = [];
  for (const c of candidates) {
    if (seen.has(c.text)) continue;
    seen.add(c.text);
    out.push(c);
  }
  return out;
}

// Generic padding source for clock-time-string mcqs: nearby plausible clock/24hr strings built
// from the same underlying h/m so they never look like random garbage.
function padTimeDistractors(kind, h, m) {
  const candidates = [];
  if (kind === '12h') {
    candidates.push({ h: nextHour(h), m }, { h: prevHour(h), m });
    const altM = (m + 15) % 60;
    candidates.push({ h, m: altM });
    return candidates
      .filter((c) => Number.isInteger(c.m) && c.m >= 0 && c.m < 60)
      .map((c) => ({ text: fmtTime12(c.h, c.m), misconception: 'padded-near-miss' }));
  }
  // 24h
  candidates.push({ h24: (h + 1) % 24, m }, { h24: (h + 23) % 24, m });
  return candidates.map((c) => ({ text: fmtTime24(c.h24, c.m), misconception: 'padded-near-miss' }));
}

// Ensure at least `min` total options. Pads with plausible time-flavoured distractors if the
// hand-built distractor set + dedup left us short.
function makeMcq(correct, distractorPool, opts = {}) {
  const chosen = uniqueOptions(correct.text, distractorPool);
  const options = [correct, ...chosen];
  const min = opts.min || 4;
  if (options.length < min && opts.padH !== undefined) {
    const seen = new Set(options.map((o) => o.text));
    const padCandidates = padTimeDistractors(opts.padKind || '12h', opts.padH, opts.padM);
    for (const cand of padCandidates) {
      if (options.length >= min) break;
      if (seen.has(cand.text)) continue;
      seen.add(cand.text);
      options.push(cand);
    }
  }
  return options;
}

// -------- T1 templates: read an analogue clock diagram (mcq of digital times / words) --------

function t1ReadClockFive(rng) {
  // Standard 5-minute-interval reading, minutes kept away from the late [45,55] hour-boundary
  // zone (that trap gets its own dedicated template below).
  const h = rngInt(rng, 1, 12);
  const m = pick(rng, [0, 5, 10, 15, 20, 25, 30, 35, 40]);
  const mirror = (60 - m) % 60;

  const stem = 'What time does the clock show?';
  const distractors = [];
  distractors.push({ text: fmtTime12(nextHour(h), m), misconception: 'hour-hand-early' });
  if (mirror !== m) distractors.push({ text: fmtTime12(h, mirror), misconception: 'past-to-swap' });
  distractors.push({ text: fmtTime12(prevHour(h), m), misconception: 'hour-hand-late' });
  const halfShift = (m + 30) % 60;
  distractors.push({ text: fmtTime12(h, halfShift), misconception: 'half-hour-off' });

  const correct = { text: fmtTime12(h, m), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), { min: 4, padH: h, padM: m, padKind: '12h' });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'hour-hand-early') whyWrong[o.text] = 'The hour hand hasn’t reached that number yet — the hour only changes once the minute hand completes its full lap.';
    else if (o.misconception === 'past-to-swap') whyWrong[o.text] = 'That’s the mirror time on the other half of the clock face — check which side the minute hand is really on.';
    else if (o.misconception === 'hour-hand-late') whyWrong[o.text] = 'The hour hand has already moved on from that number — look again at which two numbers it sits between.';
    else if (o.misconception === 'half-hour-off') whyWrong[o.text] = 'The minute hand is half an hour out — recount which number it’s pointing at.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check both hands carefully — the hour from the short hand, the minutes from the long one.';
  }

  return {
    templateId: 'clk-t1-read-five',
    stem,
    visual: { kind: 'clock', h, m },
    options,
    correctIndex: 0,
    hintSteps: [
      'Look at the SHORT hand first — which two numbers is it between? The hour hasn’t changed until the long hand completes a full lap.',
      'Now the LONG hand — which number is it pointing at? Multiply that number by 5 to get the minutes.',
    ],
    explain: {
      rule: RULE,
      worked: `The hour hand shows the hour is ${h}. The minute hand points at ${m / 5} — ${m / 5} × 5 = ${m} minutes. Time: ${fmtTime12(h, m)}.`,
      whyWrong,
    },
  };
}

function t1ReadClockHourTrap(rng) {
  // Deliberately in the late-minutes zone so the hour hand sits right next to the NEXT number —
  // the classic "reading the next hour early" trap.
  const h = rngInt(rng, 1, 12);
  const m = pick(rng, [45, 50, 55]);
  const mirror = 60 - m; // always a distinct value (15, 10, 5)

  const stem = 'What time does the clock show?';
  // Two different "shapes" for the remaining distractors, chosen at random. Shape A alone would
  // always place the correct answer as the 2nd-smallest option by minute-value (an exploitable
  // answer-position tell); mixing in Shape B — which brackets the correct answer differently —
  // breaks that pattern.
  const distractors = [
    { text: fmtTime12(nextHour(h), m), misconception: 'hour-hand-early' },
  ];
  if (rng() < 0.5) {
    distractors.push({ text: fmtTime12(h, mirror), misconception: 'past-to-swap' });
    distractors.push({ text: fmtTime12(nextHour(h), mirror), misconception: 'double-error' });
  } else {
    distractors.push({ text: fmtTime12(prevHour(h), m), misconception: 'hour-hand-late' });
    const offByFive = m === 45 ? 40 : m - 5;
    distractors.push({ text: fmtTime12(h, offByFive), misconception: 'off-by-five' });
  }

  const correct = { text: fmtTime12(h, m), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), { min: 4, padH: h, padM: m, padKind: '12h' });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'hour-hand-early') whyWrong[o.text] = 'The hour hand LOOKS like it has arrived at the next number, but it only truly gets there once the minute hand sweeps all the way back round to 12.';
    else if (o.misconception === 'past-to-swap') whyWrong[o.text] = 'That’s the mirror position on the other half of the face — the minute hand here is on the LEFT half, so it means TO the next hour, not past this one.';
    else if (o.misconception === 'double-error') whyWrong[o.text] = 'Two mistakes stacked up here — the wrong hour AND the wrong side of the clock. Check the minute hand’s side first.';
    else if (o.misconception === 'hour-hand-late') whyWrong[o.text] = 'The hour hand has already moved on from that number — look again at which two numbers it sits between.';
    else if (o.misconception === 'off-by-five') whyWrong[o.text] = 'That’s one tick out — recount the minutes carefully from the long hand’s exact position.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check both hands carefully before deciding — the hour hand can be misleading this close to the next number.';
  }

  return {
    templateId: 'clk-t1-read-hour-trap',
    stem,
    visual: { kind: 'clock', h, m },
    options,
    correctIndex: 0,
    hintSteps: [
      'The short hand is close to the next number — but has it truly ARRIVED? Not until the long hand finishes its lap back to 12.',
      `The long hand shows ${m} minutes. The hour stays at ${h} until the minute hand reaches 12 again.`,
    ],
    explain: {
      rule: RULE,
      worked: `The hour hand is nearly at ${nextHour(h)}, but the hour is still ${h} until the minute hand completes its lap. The minute hand shows ${m} minutes. Time: ${fmtTime12(h, m)}.`,
      whyWrong,
    },
  };
}

function t1DigitalToWords(rng) {
  // Given a digital-clock visual, pick the matching spoken phrase — tests the past/to language
  // directly, complementing the analogue-reading templates above.
  const h = rngInt(rng, 1, 12);
  const m = pick(rng, [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
  const stem = 'Which of these matches the time on the clock?';

  const correctPhrase = capitalize(wordsForClock(h, m));
  const distractors = [];
  // wrong hour (reading one hour either side)
  distractors.push({ text: capitalize(wordsForClock(nextHour(h), m)), misconception: 'wrong-hour' });
  distractors.push({ text: capitalize(wordsForClock(prevHour(h), m)), misconception: 'wrong-hour' });
  // past/to swap: keep the SAME hour number spoken, but flip past<->to (or o'clock/half confusion)
  if (m !== 0 && m !== 30) {
    const mirror = 60 - m;
    distractors.push({ text: capitalize(wordsForClock(h, mirror)), misconception: 'past-to-swap' });
  } else {
    // o'clock and half-past have no "to" counterpart at the same minute value, so the
    // plausible slip here is mixing up WHICH of the two states the hands are in.
    const altPhrase = m === 0 ? `half past ${h}` : `${h} o’clock`;
    distractors.push({ text: capitalize(altPhrase), misconception: 'ignored-minutes' });
  }

  const correct = { text: correctPhrase, misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), { min: 4 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'wrong-hour') whyWrong[o.text] = 'That names the wrong hour — check which hour the short hand belongs to (or is heading towards).';
    else if (o.misconception === 'past-to-swap') whyWrong[o.text] = 'That swaps past and to — check which half of the clock face the minute hand sits on.';
    else if (o.misconception === 'ignored-minutes') whyWrong[o.text] = 'That mixes up o’clock and half past — check exactly where the minute hand is pointing.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Read the digital time carefully, hour then minutes, before matching it to words.';
  }

  return {
    templateId: 'clk-t1-digital-words',
    stem,
    visual: { kind: 'digitalclock', text: fmtTime12(h, m) },
    options,
    correctIndex: 0,
    hintSteps: [
      `The clock reads ${fmtTime12(h, m)}. Is ${m} minutes on the right half (PAST) or the left half (TO) of a clock face?`,
      m > 30 ? `${m} minutes past means it’s heading TO the next hour — count how many minutes short of the hour.` : `${m} minutes is PAST the hour shown.`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmtTime12(h, m)} in words is "${correctPhrase.toLowerCase()}".`,
      whyWrong,
    },
  };
}

// -------- T2 templates: 24-hour conversions + quarter-to/past language --------

function t2ConvertPmTo24(rng) {
  const h12 = rngInt(rng, 1, 11); // 12 p.m. edge lives in T3
  const m = rngInt(rng, 0, 59);
  const { h24 } = to24(h12, m, true);
  const stem = `Write <b>${h12}:${pad2(m)} p.m.</b> using the 24-hour clock.`;

  const hourOff1 = (h24 + 1) % 24;
  const hourOff2 = (h24 + 23) % 24;
  const distractors = [
    { text: fmtTime24(h12, m), misconception: 'forgot-add-12' },
    { text: fmtTime24(hourOff1, m), misconception: 'hour-off-by-one' },
    { text: fmtTime24(hourOff2, m), misconception: 'hour-off-by-one' },
    { text: fmtTime24(h24, (m + 30) % 60), misconception: 'minutes-shifted' },
  ];

  const correct = { text: fmtTime24(h24, m), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), { min: 5, padH: h24, padM: m, padKind: '24h' });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'forgot-add-12') whyWrong[o.text] = 'That’s the morning version — for the afternoon, the Two-Face Watch needs its OTHER face: add 12.';
    else if (o.misconception === 'hour-off-by-one') whyWrong[o.text] = 'The hour has shifted by one for no reason — you only add 12, you don’t also change which hour it started as.';
    else if (o.misconception === 'minutes-shifted') whyWrong[o.text] = 'The hour is right, but the minutes have changed — they should stay exactly as given.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check the addition again: only the hour gets +12, the minutes never change.';
  }

  return {
    templateId: 'clk-t2-pm-to-24',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'It’s the afternoon (p.m.), so the Two-Face Watch shows its OTHER face: add 12 to the hour.',
      `${h12} + 12 = ? Keep the minutes exactly the same.`,
    ],
    explain: {
      rule: RULE,
      worked: `${h12}:${pad2(m)} p.m. is in the afternoon, so add 12 to the hour: ${h12} + 12 = ${h24}. The minutes stay the same. 24-hour time: ${fmtTime24(h24, m)}.`,
      whyWrong,
    },
  };
}

function t2ConvertAmTo24(rng) {
  const h12 = rngInt(rng, 1, 11); // 12 a.m. edge lives in T3
  const m = rngInt(rng, 0, 59);
  const { h24 } = to24(h12, m, false); // h24 === h12 here
  const stem = `Write <b>${h12}:${pad2(m)} a.m.</b> using the 24-hour clock.`;

  const hourOff1 = (h24 + 1) % 24;
  const hourOff2 = (h24 + 23) % 24;
  // Four distractors that are ALWAYS distinct from the correct text and from each other,
  // regardless of h24 — guarantees the T2 minimum of 5 options without relying on padding.
  const distractors = [
    { text: fmtTime24(h12 + 12, m), misconception: 'added-12-to-am' },
    { text: fmtTime24(hourOff1, m), misconception: 'hour-off-by-one' },
    { text: fmtTime24(hourOff2, m), misconception: 'hour-off-by-one' },
    { text: fmtTime24(h24, (m + 30) % 60), misconception: 'minutes-shifted' },
  ];
  // Bonus 5th distractor (only meaningful — and only distinct from correct — when the hour is
  // a single digit): dropping the leading zero.
  if (h24 < 10) {
    distractors.push({ text: fmtTime24NoPad(h24, m), misconception: 'no-leading-zero' });
  }

  const correct = { text: fmtTime24(h24, m), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), { min: 5, padH: h24, padM: m, padKind: '24h' });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'added-12-to-am') whyWrong[o.text] = 'Adding 12 to a a.m. time by mistake — only afternoon and evening (p.m.) times get +12. Morning times keep the same hour.';
    else if (o.misconception === 'hour-off-by-one') whyWrong[o.text] = 'The hour has shifted by one — a morning time keeps exactly the same hour number.';
    else if (o.misconception === 'minutes-shifted') whyWrong[o.text] = 'The hour is right, but the minutes have changed — they should stay exactly as given.';
    else if (o.misconception === 'no-leading-zero') whyWrong[o.text] = 'The 24-hour clock always writes the hour with two digits — don’t drop the leading zero.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'A morning time keeps its hour number — just add the leading zero if it’s a single digit.';
  }

  return {
    templateId: 'clk-t2-am-to-24',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'It’s the morning (a.m.), so the Two-Face Watch keeps its FIRST face: the hour stays exactly the same.',
      'Just tuck a leading zero on the front if the hour is a single digit.',
    ],
    explain: {
      rule: RULE,
      worked: `${h12}:${pad2(m)} a.m. is in the morning, so the hour stays as ${h12} — just written with a leading zero: ${fmtTime24(h24, m)}.`,
      whyWrong,
    },
  };
}

function t2Convert24ToPm(rng) {
  // Reverse direction, 12-hour edge (h24 === 0 or 12) deliberately excluded from T1-2.
  const pool = [];
  for (let x = 1; x <= 11; x++) pool.push(x);
  for (let x = 13; x <= 23; x++) pool.push(x);
  const h24 = pick(rng, pool);
  const m = rngInt(rng, 0, 59);
  const { h12, isPM } = to12(h24);
  const stem = `Write <b>${fmtTime24(h24, m)}</b> using the 12-hour clock.`;
  const correctText = `${h12}:${pad2(m)} ${isPM ? 'p.m.' : 'a.m.'}`;

  // Four distractors that are ALWAYS present regardless of h24 — guarantees the T2 minimum of
  // 5 options without relying on padding (the "no-subtract-12" one is only meaningful, and only
  // distinct from correct, in the p.m. case, so it's a conditional BONUS on top of these four).
  const altUp = to12((h24 + 1) % 24);
  const altDown = to12((h24 + 23) % 24);
  const minuteShiftM = (m + 30) % 60;
  const distractors = [
    { text: `${h12}:${pad2(m)} ${isPM ? 'a.m.' : 'p.m.'}`, misconception: 'wrong-meridiem' },
    { text: `${altUp.h12}:${pad2(m)} ${altUp.isPM ? 'p.m.' : 'a.m.'}`, misconception: 'hour-off-by-one' },
    { text: `${altDown.h12}:${pad2(m)} ${altDown.isPM ? 'p.m.' : 'a.m.'}`, misconception: 'hour-off-by-one' },
    { text: `${h12}:${pad2(minuteShiftM)} ${isPM ? 'p.m.' : 'a.m.'}`, misconception: 'minutes-shifted' },
  ];
  if (h24 !== h12) {
    // raw-hour-as-12hr: forgetting to subtract 12 off an afternoon 24-hour value at all.
    distractors.push({ text: `${h24}:${pad2(m)} ${isPM ? 'p.m.' : 'a.m.'}`, misconception: 'no-subtract-12' });
  }

  const correct = { text: correctText, misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), { min: 5 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'wrong-meridiem') whyWrong[o.text] = 'Right hour and minutes, wrong half of the day — check whether 24-hour hour was below 12 (a.m.) or 12 and above (p.m.).';
    else if (o.misconception === 'no-subtract-12') whyWrong[o.text] = 'For a 24-hour hour of 13 or more, you must subtract 12 to get the 12-hour clock hour.';
    else if (o.misconception === 'hour-off-by-one') whyWrong[o.text] = 'The hour has shifted by one — recheck the subtraction (or addition) of 12.';
    else if (o.misconception === 'minutes-shifted') whyWrong[o.text] = 'The hour and meridiem are right, but the minutes have changed — they should stay exactly as given.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Convert the hour carefully, then decide a.m. or p.m. from whether the 24-hour hour was 12 or more.';
  }

  return {
    templateId: 'clk-t2-24-to-ampm',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      isPM ? `${h24} is 12 or more, so it’s the afternoon/evening (p.m.) — subtract 12 to find the 12-hour clock hour.` : `${h24} is below 12, so it’s the morning (a.m.) — the hour stays the same.`,
      `The minutes (${pad2(m)}) never change between the two clocks.`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmtTime24(h24, m)} ${isPM ? 'is 12 or more, so subtract 12 to get ' + h12 + ', and it’s p.m.' : 'is below 12, so the hour stays ' + h12 + ', and it’s a.m.'} 12-hour time: ${correctText}.`,
      whyWrong,
    },
  };
}

function t2QuarterToPastWords(rng) {
  // Reading an analogue clock specifically at quarter-past/half-past/quarter-to, tested via
  // spoken-word options (the language emphasis the spec calls for at T2).
  const h = rngInt(rng, 1, 12);
  const m = pick(rng, [15, 30, 45]);
  const stem = 'What time does the clock show?';

  const correctPhrase = capitalize(wordsForClock(h, m));
  const distractors = [];
  // past/to swap keeping a plausible-but-wrong hour choice
  if (m === 30) {
    distractors.push({ text: capitalize(wordsForClock(nextHour(h), m)), misconception: 'wrong-hour' });
    distractors.push({ text: capitalize(wordsForClock(prevHour(h), m)), misconception: 'wrong-hour' });
  } else {
    const swappedWord = m === 15 ? `quarter to ${h}` : `quarter past ${nextHour(h)}`;
    distractors.push({ text: capitalize(swappedWord), misconception: 'past-to-swap' });
    distractors.push({ text: capitalize(wordsForClock(m === 15 ? prevHour(h) : nextHour(nextHour(h)), m)), misconception: 'wrong-hour' });
  }
  // quarter/half confusion — mixing up which of the three landmark minute-values applies,
  // always keeping the SAME hour number so it's a distinct, always-present 4th distractor.
  const halfQuarterConfusion = m === 30 ? `quarter past ${h}` : `half past ${h}`;
  distractors.push({ text: capitalize(halfQuarterConfusion), misconception: 'half-quarter-confusion' });
  distractors.push({ text: `${h} o’clock`, misconception: 'ignored-minutes' });

  const correct = { text: correctPhrase, misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), { min: 5 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'past-to-swap') whyWrong[o.text] = 'That keeps the wrong hour for the preposition used — check whether the minute hand is on the past side or the to side.';
    else if (o.misconception === 'wrong-hour') whyWrong[o.text] = 'The minute reading is right, but the hour named is wrong — check which hour the phrase should attach to.';
    else if (o.misconception === 'half-quarter-confusion') whyWrong[o.text] = 'That mixes up quarter and half — check exactly which number the minute hand is pointing at.';
    else if (o.misconception === 'ignored-minutes') whyWrong[o.text] = 'That ignores the minute hand completely — it isn’t pointing straight up at 12.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check which half of the clock face the minute hand sits on before choosing past or to.';
  }

  return {
    templateId: 'clk-t2-quarter-words',
    stem,
    visual: { kind: 'clock', h, m },
    options,
    correctIndex: 0,
    hintSteps: [
      m <= 30 ? 'The minute hand is on the right half of the face — that means PAST the hour shown.' : 'The minute hand is on the left half of the face — that means TO the next hour.',
      `Put the correct hour with the correct word: ${m === 15 ? 'quarter past' : m === 30 ? 'half past' : 'quarter to'}.`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmtTime12(h, m)} in words is "${correctPhrase.toLowerCase()}".`,
      whyWrong,
    },
  };
}

// -------- T3 templates (num format) --------

function t3DurationToNextEvent(rng) {
  // Simple duration within an hour — no rollover, so it's pure addition.
  const h = rngInt(rng, 1, 12);
  const startM = rngInt(rng, 0, 30);
  const duration = pick(rng, [5, 10, 15, 20, 25]);
  const endM = startM + duration; // always < 60 by construction (max 30+25=55)
  const stem = `A quest starts at <b>${fmtTime12(h, startM)}</b> and lasts <b>${duration} minutes</b>. What time does it finish?`;

  const answer = fmtTime12(h, endM);
  const accept = [answer];
  if (h < 10) accept.push(fmtTime24NoPad(h, endM)); // already same as answer when unpadded; harmless dupe-safe
  const acceptSet = Array.from(new Set(accept));

  return {
    templateId: 'clk-t3-duration',
    stem,
    format: 'num',
    accept: acceptSet,
    hintSteps: [
      `Start at ${fmtTime12(h, startM)}. Count on the ${duration} minutes — the hour stays the same because you don’t reach the top of the hour.`,
      `${startM} + ${duration} = ${endM} minutes.`,
    ],
    explain: {
      rule: RULE,
      worked: `${startM} + ${duration} = ${endM}. The hour doesn’t change. Finish time: ${answer}.`,
      whyWrong: {},
    },
  };
}

function t3Write24HourGeneral(rng) {
  // General (non-12-edge) spoken 12-hour time -> 24-hour write-in.
  const h12 = rngInt(rng, 1, 11);
  const m = rngInt(rng, 0, 59);
  const isPM = rng() < 0.5;
  const { h24 } = to24(h12, m, isPM);
  const stem = `Write <b>${h12}:${pad2(m)} ${isPM ? 'p.m.' : 'a.m.'}</b> using the 24-hour clock.`;

  const padded = fmtTime24(h24, m);
  const unpadded = fmtTime24NoPad(h24, m);
  const accept = Array.from(new Set([padded, unpadded]));

  return {
    templateId: 'clk-t3-write24-general',
    stem,
    format: 'num',
    accept,
    hintSteps: [
      isPM ? 'It’s the afternoon/evening, so add 12 to the hour.' : 'It’s the morning, so the hour stays exactly the same.',
      'Keep the minutes exactly as given — only the hour changes (and only for p.m.).',
    ],
    explain: {
      rule: RULE,
      worked: isPM
        ? `${h12}:${pad2(m)} p.m. → add 12: ${h12} + 12 = ${h24}. 24-hour time: ${padded}.`
        : `${h12}:${pad2(m)} a.m. → the hour stays ${h12}, written as ${padded}.`,
      whyWrong: {},
    },
  };
}

function t3TwelveEdgeCase(rng) {
  // The one gentle 12 a.m./p.m. edge template (kept out of T1-2 per spec).
  const isAM = rng() < 0.5;
  const m = rngInt(rng, 0, 59);
  const label = `12:${pad2(m)} ${isAM ? 'a.m.' : 'p.m.'}`;
  const stem = `Write <b>${label}</b> using the 24-hour clock.`;

  const h24 = isAM ? 0 : 12;
  const padded = fmtTime24(h24, m);
  const unpadded = fmtTime24NoPad(h24, m); // only differs for the a.m. (00) case
  const accept = Array.from(new Set([padded, unpadded]));

  return {
    templateId: 'clk-t3-twelve-edge',
    stem,
    format: 'num',
    accept,
    hintSteps: [
      isAM ? '12 a.m. is the very start of the day, before 1 a.m. — it is NOT "12 something", it’s the zero hour.' : '12 p.m. is midday — it already stays as 12, no adding and no subtracting.',
      isAM ? 'Write the hour as 00, then keep the minutes the same.' : 'Write the hour as 12, then keep the minutes the same.',
    ],
    explain: {
      rule: RULE,
      worked: isAM
        ? `12 a.m. (midnight) is the special case — it becomes hour 00, not 12. 24-hour time: ${padded}.`
        : `12 p.m. (midday) is the other special case — it stays as hour 12, no adding 12 again. 24-hour time: ${padded}.`,
      whyWrong: {},
    },
  };
}

// -------- dispatch --------

const T1 = [t1ReadClockFive, t1ReadClockHourTrap, t1DigitalToWords];
const T2 = [t2ConvertPmTo24, t2ConvertAmTo24, t2Convert24ToPm, t2QuarterToPastWords];
const T3 = [t3DurationToNextEvent, t3Write24HourGeneral, t3TwelveEdgeCase];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `clk-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'clocks-time',
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
