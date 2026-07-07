// FART QUEST — data/topics/index.js (UI agent)
// Single registry / import point for all topic data modules. Screens read
// `ctx.topics` (wired from TOPICS below in js/main.js) instead of importing
// topic files directly — this is what makes a topic "live": if its id isn't
// a key here, map.js renders it as an "arriving soon" pad and every other
// screen treats it as not-yet-existing (never crashes).
//
// Phase 1 hand-authored imports (do not remove/reorder):
import placeValueTopic from './place-value.js';
import decimalsTopic from './decimals-x10.js';
import roundingTopic from './rounding.js';

export const TOPICS = {
  'place-value': placeValueTopic,
  'decimals-x10': decimalsTopic,
  'rounding': roundingTopic,

  // ===================================================================
  // AUTO-REGEN: integration appends further `import`s above this comment
  // and further `'topic-id': topicModule` entries below it as new topics
  // are authored. Do not remove this marker. Entries above are Phase 1's
  // hand-authored baseline and must always remain importable on their own
  // (this file must keep working with ONLY the three imports above present).
  // ===================================================================
};

export default TOPICS;
