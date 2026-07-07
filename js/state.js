// FART QUEST — js/state.js (CORE agent)
// Per-topic progress state. Pure logic lives in exported helper functions
// (node-testable, no db/DOM dependency); the default-exported `state` object
// wraps those helpers with an in-memory map hydrated from / persisted to db.

const STINK_BASE = [100, 80, 55, 30, 10, 0]; // indexed by masteryLevel 0-5
const REMATCH_STEPS_DAYS = [3, 7, 14, 30];
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Build a fresh, empty per-topic record.
 */
export function emptyTopicRecord() {
  return {
    taught: false,
    attempts: 0,
    last10: [], // rolling window of {correct, tier} — most recent last, overall accuracy
    // Per-tier bookkeeping needed to implement the unlock rule precisely
    // (spec names last10/last8 by concept; tracked per-tier here since the
    // unlock rule is tier-scoped: "5 t1-correct" and "last8 acc" for that tier).
    tierCorrectCount: { 1: 0, 2: 0, 3: 0 },
    tierLast8: { 1: [], 2: [], 3: [] }, // rolling window of booleans (correct?) per tier
    t2Unlocked: false,
    t3Unlocked: false,
    bossBeaten: false,
    flawless: false,
    captured: false,
    shiny: false,
    reviewStage: 0,
    reviewDue: null,
    lastPlayed: null,
    // ENGINE_SPEC_2 §D/§H: ids of bank/passage items already drawn this "cycle"
    // (resets to [] once the whole bank has been seen — see unseenFrom/resetCycle
    // below). Generator-driven (maths) topics never touch this field.
    seenItems: [],
  };
}

/**
 * masteryLevel(record, now) -> 0-5
 * 0 unseen; 1 taught; 2 >=5 attempts; 3 t3Unlocked && last10 acc >= .8;
 * 4 bossBeaten; 5 bossBeaten && reviewStage >= 3.
 * Each level's condition implies the ones before it (checked cumulatively).
 */
export function masteryLevel(record) {
  if (!record || !record.taught) return 0;
  let level = 1;
  if (record.attempts >= 5) level = 2;
  if (record.t3Unlocked && last10Accuracy(record) >= 0.8) level = 3;
  if (record.bossBeaten) level = 4;
  if (record.bossBeaten && record.reviewStage >= 3) level = 5;
  return level;
}

/**
 * last10Accuracy(record) -> 0..1 (0 if no attempts recorded yet)
 */
export function last10Accuracy(record) {
  const window = record.last10 || [];
  if (window.length === 0) return 0;
  const correctCount = window.filter((a) => a.correct).length;
  return correctCount / window.length;
}

/**
 * stink(record, level, now) -> 0-100
 * base by masteryLevel + min(40, overdueDays*8) if review overdue.
 */
export function stink(record, level, now) {
  const base = STINK_BASE[Math.max(0, Math.min(5, level))];
  let overdueBonus = 0;
  if (record.reviewDue != null && now > record.reviewDue) {
    const overdueDays = (now - record.reviewDue) / DAY_MS;
    overdueBonus = Math.min(40, overdueDays * 8);
  }
  return Math.min(100, base + overdueBonus);
}

function pushRolling(arr, value, maxLen) {
  const out = arr.slice();
  out.push(value);
  while (out.length > maxLen) out.shift();
  return out;
}

/**
 * recordAnswer(record, {correct, tier}) -> NEW record (does not mutate input)
 * Updates attempts/last10/per-tier bookkeeping and applies unlock rules:
 *   t2 unlocks when tier1 cumulative correct count >= 5 AND last8 (tier1) acc >= .7
 *   t3 unlocks the same way, scoped to tier2, once t2 is unlocked
 */
export function recordAnswer(record, { correct, tier }) {
  const next = {
    ...record,
    tierCorrectCount: { ...record.tierCorrectCount },
    tierLast8: {
      1: record.tierLast8[1].slice(),
      2: record.tierLast8[2].slice(),
      3: record.tierLast8[3].slice(),
    },
  };

  next.attempts = record.attempts + 1;
  next.last10 = pushRolling(record.last10, { correct: !!correct, tier }, 10);

  if (tier === 1 || tier === 2 || tier === 3) {
    if (correct) next.tierCorrectCount[tier] = record.tierCorrectCount[tier] + 1;
    next.tierLast8[tier] = pushRolling(record.tierLast8[tier], !!correct, 8);
  }

  if (!next.t2Unlocked) {
    const t1Correct = next.tierCorrectCount[1];
    const t1Last8 = next.tierLast8[1];
    const t1Acc = t1Last8.length ? t1Last8.filter(Boolean).length / t1Last8.length : 0;
    if (t1Correct >= 5 && t1Acc >= 0.7) {
      next.t2Unlocked = true;
    }
  }

  if (next.t2Unlocked && !next.t3Unlocked) {
    const t2Correct = next.tierCorrectCount[2];
    const t2Last8 = next.tierLast8[2];
    const t2Acc = t2Last8.length ? t2Last8.filter(Boolean).length / t2Last8.length : 0;
    if (t2Correct >= 5 && t2Acc >= 0.7) {
      next.t3Unlocked = true;
    }
  }

  return next;
}

/**
 * recordBoss(record, {won, flawless}, now) -> NEW record
 * Sets bossBeaten/captured/shiny, reviewStage 0, reviewDue now+3d — only when won.
 * A lost boss attempt still counts as an attempt/lastPlayed touch but does not
 * beat the boss (no lives are lost per spec — this just doesn't set the flags).
 */
export function recordBoss(record, { won, flawless }, now) {
  const next = { ...record };
  if (won) {
    next.bossBeaten = true;
    next.captured = true;
    next.shiny = !!flawless;
    next.flawless = !!flawless;
    next.reviewStage = 0;
    next.reviewDue = now + 3 * DAY_MS;
  }
  next.lastPlayed = now;
  return next;
}

/**
 * recordRematch(record, won, now) -> NEW record
 * won: reviewStage + 1 (capped at last index), reviewDue += steps[stage] days
 * lost: reviewStage = max(0, stage-1), reviewDue += 3 days
 * (both measured from `now`, not stacked onto the old due date, so a rematch
 * played late doesn't inherit staleness.)
 */
export function recordRematch(record, won, now) {
  const next = { ...record };
  const stage = record.reviewStage || 0;
  if (won) {
    const stepDays = REMATCH_STEPS_DAYS[Math.min(stage, REMATCH_STEPS_DAYS.length - 1)];
    next.reviewStage = stage + 1;
    next.reviewDue = now + stepDays * DAY_MS;
  } else {
    next.reviewStage = Math.max(0, stage - 1);
    next.reviewDue = now + 3 * DAY_MS;
  }
  next.lastPlayed = now;
  return next;
}

/**
 * dueReviews(records, now) -> array of topicIds whose reviewDue < now.
 * records: { topicId: record }
 */
export function dueReviewsFrom(records, now) {
  const out = [];
  for (const topicId of Object.keys(records)) {
    const r = records[topicId];
    if (r && r.reviewDue != null && r.reviewDue < now) out.push(topicId);
  }
  return out;
}

/**
 * markSeen(seenItems, itemId) -> NEW array with itemId appended (deduped).
 * Used every time a bank/passage item is drawn into a battle, so it drops
 * out of the "unseen" pool for the rest of this cycle (ENGINE_SPEC_2 §D).
 */
export function markSeen(seenItems, itemId) {
  const list = seenItems || [];
  if (itemId == null || list.includes(itemId)) return list.slice();
  return [...list, itemId];
}

/**
 * unseenFrom(bank, seenItems) -> the subset of `bank` (an array of items,
 * each with an `id`) whose id is NOT in seenItems.
 */
export function unseenFrom(bank, seenItems) {
  const seen = new Set(seenItems || []);
  return (bank || []).filter((item) => !seen.has(item.id));
}

/**
 * resetCycle() -> a fresh empty seenItems array. Called when a bank's unseen
 * pool has been exhausted (every item has now been shown once this cycle) —
 * the next draw starts a brand new cycle from the full bank again.
 */
export function resetCycle() {
  return [];
}

/**
 * regionCleansed map helpers — pure, persisted under meta key 'regionCleansed'
 * as a plain { [regionId]: true } object (ENGINE_SPEC_2 §D/§G).
 */
export function isRegionCleansedIn(map, regionId) {
  return !!(map && map[regionId]);
}

export function setRegionCleansedIn(map, regionId) {
  return { ...(map || {}), [regionId]: true };
}

// ---------------------------------------------------------------------------
// Stateful wrapper: in-memory map hydrated by state.load(db), persisted on
// each mutation, with onChange listeners firing after every mutation.
// ---------------------------------------------------------------------------

let _db = null;
let _topics = {}; // topicId -> record
let _commonsOwned = []; // global list of creatureIds, stored in meta store
let _regionCleansed = {}; // regionId -> true, stored in meta store
let _listeners = [];

function notify() {
  for (const fn of _listeners) {
    try {
      fn();
    } catch (err) {
      // Listener errors must never break state mutation flow.
      // eslint-disable-next-line no-console
      console.error('state.onChange listener threw:', err);
    }
  }
}

async function persistTopic(topicId) {
  if (!_db) return;
  try {
    await _db.put('progress', topicId, _topics[topicId]);
  } catch (err) {
    // Best-effort: iOS private mode / storage pressure can reject writes.
    // In-memory state is already correct; a persistence failure must never
    // propagate to action callers, who should keep behaving as if it saved.
    // eslint-disable-next-line no-console
    console.error('state.js: persistTopic failed (in-memory state unaffected):', err);
  }
}

async function persistMeta() {
  if (!_db) return;
  try {
    await _db.put('meta', 'commonsOwned', _commonsOwned);
  } catch (err) {
    // Best-effort — see persistTopic's comment above; same rationale applies.
    // eslint-disable-next-line no-console
    console.error('state.js: persistMeta failed (in-memory state unaffected):', err);
  }
}

async function persistRegionCleansed() {
  if (!_db) return;
  try {
    await _db.put('meta', 'regionCleansed', _regionCleansed);
  } catch (err) {
    // Best-effort — see persistTopic's comment above; same rationale applies.
    // eslint-disable-next-line no-console
    console.error('state.js: persistRegionCleansed failed (in-memory state unaffected):', err);
  }
}

/**
 * state.load(db) -> hydrates the in-memory map from the given db instance
 * (or fake db implementing get/put/getAll/del/exportAll/importAll).
 */
async function load(db) {
  _db = db;
  _topics = {};
  _commonsOwned = [];
  _regionCleansed = {};
  _listeners = _listeners; // keep existing listeners across reloads

  const allProgress = await _db.getAll('progress');
  for (const topicId of Object.keys(allProgress || {})) {
    // Merge onto a fresh empty record so topics persisted before this field
    // existed (e.g. seenItems) still come back with a sane default rather
    // than undefined.
    _topics[topicId] = { ...emptyTopicRecord(), ...allProgress[topicId] };
  }

  const meta = await _db.get('meta', 'commonsOwned');
  _commonsOwned = Array.isArray(meta) ? meta.slice() : [];

  const regionMeta = await _db.get('meta', 'regionCleansed');
  _regionCleansed = regionMeta && typeof regionMeta === 'object' ? { ...regionMeta } : {};

  notify();
}

function ensureTopic(id) {
  if (!_topics[id]) _topics[id] = emptyTopicRecord();
  return _topics[id];
}

/**
 * state.topic(id) -> snapshot (shallow-cloned record + commonsOwned reference
 * kept globally, not per topic, per spec).
 */
function topic(id) {
  const record = ensureTopic(id);
  return { ...record };
}

function getMasteryLevel(id) {
  return masteryLevel(ensureTopic(id));
}

function getStink(id, now = Date.now()) {
  const record = ensureTopic(id);
  const level = masteryLevel(record);
  return stink(record, level, now);
}

async function markTaught(id, now = Date.now()) {
  const record = ensureTopic(id);
  _topics[id] = { ...record, taught: true, lastPlayed: now };
  await persistTopic(id);
  notify();
  return topic(id);
}

async function recordAnswerAction(id, { correct, tier }, now = Date.now()) {
  const record = ensureTopic(id);
  const next = recordAnswer(record, { correct, tier });
  next.lastPlayed = now;
  _topics[id] = next;
  await persistTopic(id);
  notify();
  return topic(id);
}

async function recordBossAction(id, { won, flawless }, now = Date.now()) {
  const record = ensureTopic(id);
  _topics[id] = recordBoss(record, { won, flawless }, now);
  await persistTopic(id);
  notify();
  return topic(id);
}

async function recordRematchAction(id, won, now = Date.now()) {
  const record = ensureTopic(id);
  _topics[id] = recordRematch(record, won, now);
  await persistTopic(id);
  notify();
  return topic(id);
}

function getDueReviews(now = Date.now()) {
  return dueReviewsFrom(_topics, now);
}

/**
 * state.getSeenItems(id) -> current seenItems array for a topic (used to seed
 * a battle engine's bank-sampling memory when a battle starts).
 */
function getSeenItems(id) {
  return ensureTopic(id).seenItems.slice();
}

/**
 * state.setSeenItems(id, seenItems) -> overwrites the topic's seenItems array
 * and persists. The battle screen calls this as bank/passage items are drawn
 * during a battle (and whenever a cycle resets), so progress survives a
 * mid-battle app close.
 */
async function setSeenItemsAction(id, seenItems) {
  const record = ensureTopic(id);
  _topics[id] = { ...record, seenItems: Array.isArray(seenItems) ? seenItems.slice() : [] };
  await persistTopic(id);
  notify();
  return topic(id);
}

/**
 * state.resetTopic(id) -> full per-topic wipe (parent dashboard "Reset topic"
 * action, ENGINE_SPEC_2 §H): clears the topic's progress record (including
 * seenItems), its lesson-player progress meta key, and re-seeds an empty
 * record so the UI reflects "never played" immediately.
 */
async function resetTopic(id) {
  delete _topics[id];
  if (_db) {
    try {
      await _db.del('progress', id);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('state.js: resetTopic failed to clear progress store:', err);
    }
    try {
      await _db.del('meta', `lessonProgress-${id}`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('state.js: resetTopic failed to clear lesson progress:', err);
    }
  }
  ensureTopic(id); // re-seed a fresh empty record in memory
  notify();
  return topic(id);
}

/**
 * state.regionCleansed(regionId) -> bool (ENGINE_SPEC_2 §D: region marked
 * cleansed once its boss is beaten).
 */
function getRegionCleansed(regionId) {
  return isRegionCleansedIn(_regionCleansed, regionId);
}

/**
 * state.recordRegionBoss(regionId, {won, creatureId}) -> on a win, marks the
 * region cleansed and (if a creatureId is supplied — the region boss's
 * creature id, e.g. 'countfather') grants it into the shared owned-creatures
 * list alongside commons, so the collection screen can recognise it later.
 */
async function recordRegionBossAction(regionId, { won, creatureId } = {}) {
  if (won) {
    _regionCleansed = setRegionCleansedIn(_regionCleansed, regionId);
    await persistRegionCleansed();
    if (creatureId) {
      // grantCommon is a generic "add this creature id to the owned list"
      // helper despite its name — reused here for epic region bosses too.
      await grantCommon(creatureId);
    }
  }
  notify();
  return { regionCleansed: getRegionCleansed(regionId) };
}

/**
 * state.recordMock(result) -> appends a Castle Clench mock-exam result to
 * history. Writes to the db 'mocks' store when it exists (added by a later
 * db-schema bump owned by another agent); if that store isn't present yet,
 * falls back to an array kept under meta key 'mockHistory' so history is
 * never silently lost while the two pieces of work land independently.
 */
async function recordMockAction(result, now = Date.now()) {
  const entry = { ...result, ts: now };
  if (_db) {
    try {
      await _db.put('mocks', String(now), entry);
      notify();
      return entry;
    } catch (err) {
      // 'mocks' store likely doesn't exist yet (or a transient failure) —
      // fall back to meta so the result still isn't lost.
      // eslint-disable-next-line no-console
      console.error('state.js: recordMock could not write to "mocks" store, falling back to meta:', err);
      try {
        const history = (await _db.get('meta', 'mockHistory')) || [];
        const nextHistory = Array.isArray(history) ? [...history, entry] : [entry];
        await _db.put('meta', 'mockHistory', nextHistory);
      } catch (err2) {
        // eslint-disable-next-line no-console
        console.error('state.js: recordMock fallback to meta also failed:', err2);
      }
    }
  }
  notify();
  return entry;
}

async function grantCommon(creatureId) {
  if (!_commonsOwned.includes(creatureId)) {
    _commonsOwned = [..._commonsOwned, creatureId];
    await persistMeta();
    notify();
  }
  return _commonsOwned.slice();
}

function getCommonsOwned() {
  return _commonsOwned.slice();
}

function onChange(fn) {
  _listeners.push(fn);
  return () => {
    _listeners = _listeners.filter((f) => f !== fn);
  };
}

function allTopics() {
  const out = {};
  for (const id of Object.keys(_topics)) out[id] = { ..._topics[id] };
  return out;
}

const state = {
  load,
  topic,
  masteryLevel: getMasteryLevel,
  stink: getStink,
  markTaught,
  recordAnswer: recordAnswerAction,
  recordBoss: recordBossAction,
  recordRematch: recordRematchAction,
  dueReviews: getDueReviews,
  grantCommon,
  commonsOwned: getCommonsOwned,
  onChange,
  allTopics,
  getSeenItems,
  setSeenItems: setSeenItemsAction,
  resetTopic,
  regionCleansed: getRegionCleansed,
  recordRegionBoss: recordRegionBossAction,
  recordMock: recordMockAction,
};

export default state;
