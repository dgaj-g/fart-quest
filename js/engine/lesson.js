// FART QUEST — js/engine/lesson.js (UI agent)
// Drives a topic's lesson[] card array: talk / show / try / weapon.
// Progress (current card index) persisted per topic in db meta store.

import formats from './formats/index.js';
import { mulberry32, rngInt } from '../rng.js';
import { generate } from '../gen/index.js';

function metaKey(topicId) {
  return `lessonProgress-${topicId}`;
}

export function createLessonEngine({ topic, ctx }) {
  const cards = topic.lesson;
  let index = 0;
  let destroyed = false;

  async function loadProgress() {
    try {
      const saved = await ctx.db.get('meta', metaKey(topic.id));
      if (typeof saved === 'number' && saved >= 0 && saved < cards.length) {
        index = saved;
      }
    } catch (e) {
      index = 0;
    }
  }

  async function saveProgress() {
    try {
      await ctx.db.put('meta', metaKey(topic.id), index);
    } catch (e) { /* swallow */ }
  }

  async function clearProgress() {
    try {
      await ctx.db.del('meta', metaKey(topic.id));
    } catch (e) { /* swallow */ }
  }

  function currentCard() {
    return cards[index];
  }

  function totalCards() {
    return cards.length;
  }

  function currentIndex() {
    return index;
  }

  async function goNext() {
    if (index < cards.length - 1) {
      index += 1;
      await saveProgress();
      return true;
    }
    // lesson complete
    await ctx.state.markTaught(topic.id);
    await clearProgress();
    return false;
  }

  async function goBack() {
    if (index > 0) {
      index -= 1;
      await saveProgress();
      return true;
    }
    return false;
  }

  function isDestroyed() { return destroyed; }
  function destroy() { destroyed = true; }

  return {
    loadProgress,
    currentCard,
    totalCards,
    currentIndex,
    goNext,
    goBack,
    isDestroyed,
    destroy,
  };
}

// Regenerate a fresh variant question for a 'try' card in scaffold mode
// (used when the authored q needs a fallback variant — Phase 1 uses the
// authored question directly on first try, but regenerates via genId if
// the topic has one, keeping hint/worked flow consistent).
export function regenerateVariant(topic, tier, seed) {
  const rng = mulberry32(seed >>> 0);
  return generate(topic.genId, tier, rng);
}

export function freshSeed() {
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}

export { formats };
