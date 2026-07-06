// FART QUEST — GEN agent
// Registry: genId -> generate(tier, rng) -> Question
import placevalue from './placevalue.js';
import decimals from './decimals.js';
import rounding from './rounding.js';

const registry = {
  placevalue: placevalue.generate,
  decimals: decimals.generate,
  rounding: rounding.generate,
};

export function generate(genId, tier, rng) {
  const fn = registry[genId];
  if (!fn) throw new Error(`Unknown genId: ${genId}`);
  return fn(tier, rng);
}

export default registry;
