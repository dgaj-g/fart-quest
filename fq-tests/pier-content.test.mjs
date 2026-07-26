// fq-tests/pier-content.test.mjs
// Self-test for js/pier/content.js (CONTENT agent). Run with:
//   node fq-tests/pier-content.test.mjs
// Asserts:
//   1. GREMLIN_NAMES covers all 78 canonical families a<=b, a,b in 1..12.
//   2. All gremlin names are unique.
//   3. Every digit-string in a gremlin name/oneliner is either that family's
//      true product (a*b, recomputed from the family key — not trusted from
//      prose) or an operand reference (<=12).
//   4. All VO_MANIFEST ids are unique (and match their source pools 1:1).

import { nana, announcer, dave, gremlin, GREMLIN_NAMES, VO_MANIFEST } from '../js/pier/content.js';

let failures = 0;
function check(cond, msg) {
  if (!cond) {
    failures++;
    console.error(`FAIL: ${msg}`);
  }
}

// ---------- 1. all 78 canonical families present ----------
const expectedKeys = [];
for (let a = 1; a <= 12; a++) {
  for (let b = a; b <= 12; b++) expectedKeys.push(`${a}x${b}`);
}
check(expectedKeys.length === 78, `expected 78 canonical families, computed ${expectedKeys.length}`);

const actualKeys = Object.keys(GREMLIN_NAMES);
check(actualKeys.length === 78, `GREMLIN_NAMES should have 78 entries, has ${actualKeys.length}`);

for (const key of expectedKeys) {
  check(Object.prototype.hasOwnProperty.call(GREMLIN_NAMES, key), `missing gremlin family ${key}`);
}
for (const key of actualKeys) {
  check(expectedKeys.includes(key), `unexpected/non-canonical family key ${key} (must be a<=b, a,b in 1..12)`);
}

// ---------- 2. all names unique ----------
const names = actualKeys.map((k) => GREMLIN_NAMES[k].name);
const nameSet = new Set(names);
check(nameSet.size === names.length, `gremlin names are not all unique (${names.length} names, ${nameSet.size} distinct)`);
if (nameSet.size !== names.length) {
  const seen = new Set();
  for (const n of names) {
    if (seen.has(n)) console.error(`  duplicate name: "${n}"`);
    seen.add(n);
  }
}

// ---------- 3. digit correctness: every digit-string is product or operand(<=12) ----------
for (const key of actualKeys) {
  const [aStr, bStr] = key.split('x');
  const a = parseInt(aStr, 10);
  const b = parseInt(bStr, 10);
  const product = a * b;
  const entry = GREMLIN_NAMES[key];
  const text = `${entry.name} ${entry.oneliner}`;
  const digitStrings = text.match(/\b\d+\b/g) || [];
  for (const ds of digitStrings) {
    const n = parseInt(ds, 10);
    const ok = n === product || n <= 12;
    check(ok, `family ${key} (product ${product}): digit "${ds}" in "${entry.name}" / "${entry.oneliner}" is neither the product nor an operand reference (<=12)`);
  }
  // Require the true product itself to appear at least once, digit-form —
  // keeps every entry mechanically checkable, not just "vibes-correct".
  const hasProductDigit = digitStrings.some((ds) => parseInt(ds, 10) === product);
  check(hasProductDigit, `family ${key} (product ${product}): no digit-form of the product ${product} appears in name/oneliner`);
}

// ---------- 4. VO_MANIFEST: all ids unique, well-formed, complete ----------
const allPoolEntries = [
  ...nana.welcome, ...nana.win, ...nana.goldBeaten, ...nana.deluxeOn, ...nana.deluxeOff, ...nana.tankClean,
  ...announcer.roundStart, ...announcer.highScore,
  ...dave.steal,
  ...gremlin.taunt, ...gremlin.flushed,
];
check(VO_MANIFEST.length === allPoolEntries.length, `VO_MANIFEST length ${VO_MANIFEST.length} should equal total pool entries ${allPoolEntries.length}`);

const voIds = VO_MANIFEST.map((e) => e.id);
const voIdSet = new Set(voIds);
check(voIdSet.size === voIds.length, `VO_MANIFEST ids are not all unique (${voIds.length} ids, ${voIdSet.size} distinct)`);

const idPattern = /^pier-(nana|announcer|dave|gremlin)-[a-z-]+-\d{2}$/;
for (const e of VO_MANIFEST) {
  check(idPattern.test(e.id), `VO_MANIFEST id "${e.id}" does not match the pier-<character>-<pool>-NN scheme`);
  check(typeof e.text === 'string' && e.text.length > 0, `VO_MANIFEST entry ${e.id} has no text`);
  check(['nana', 'announcer', 'dave', 'gremlin'].includes(e.character), `VO_MANIFEST entry ${e.id} has unexpected character "${e.character}"`);
}

// every pool entry itself has a well-formed unique id too
const poolIds = allPoolEntries.map((e) => e.id);
check(new Set(poolIds).size === poolIds.length, 'line-pool entry ids are not all unique');
for (const e of allPoolEntries) {
  check(idPattern.test(e.id), `pool entry id "${e.id}" does not match the pier-<character>-<pool>-NN scheme`);
}

// ---------- tone guard: written text never uses fail/wrong/bad ----------
const forbidden = /\b(fail(?:s|ed|ing)?|wrong|bad)\b/i;
for (const e of allPoolEntries) {
  check(!forbidden.test(e.text), `pool entry ${e.id} uses a forbidden word (fail/wrong/bad): "${e.text}"`);
}
for (const key of actualKeys) {
  const entry = GREMLIN_NAMES[key];
  check(!forbidden.test(entry.name) && !forbidden.test(entry.oneliner), `gremlin ${key} ("${entry.name}") uses a forbidden word (fail/wrong/bad)`);
}

// ---------- summary ----------
if (failures === 0) {
  console.log(`PASS: pier-content.test.mjs — 78 families, ${nameSet.size} unique names, ${VO_MANIFEST.length} VO manifest entries, all checks green.`);
  process.exit(0);
} else {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
