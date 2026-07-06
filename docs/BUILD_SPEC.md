# FART QUEST — Build Specification v1 (Phase 1)
Single source of truth for all implementation agents. Deviate only where this spec is silent; note every such choice in your report.
Companion docs: `/Users/damiengartland/Desktop/Claude Work/Jarlath SEAG App/DESIGN.md` (game design) and `TOPIC_MAP.md` (curriculum).

## 0. Product in one line
An offline-capable iPad PWA where Jarlath (age 9, P6) de-stinks a monster-infested kingdom by mastering SEAG topics: taught from zero → given a Secret Weapon (the exam shortcut) → battles minions/elites/boss → captures the cleaned creature. Phase 1 = full shell + Number Swamp's first three locations.

## 1. Hard constraints
- Vanilla HTML/CSS/JS, native ES modules, ZERO build step, ZERO external requests at runtime (all assets local to the repo; GitHub Pages serves them).
- iPad Safari primary (landscape). Touch targets ≥ 60px. Audio only after first user gesture. Works with NO voice-over files present (they arrive later).
- IndexedDB for progress. Service worker precaches the core shell; audio/images runtime-cached (cache-first).
- UK English everywhere. Warm, silly, never mocking in WRITTEN text (spicier humour lives in the VO recordings only).
- House rules: Fisher-Yates shuffle for options; correct #2ecc71 / wrong #e74c3c; no answer telegraphing; misconception-based distractors.

## 2. File tree & ownership (do not touch files owned by others)
```
index.html            UI agent
css/main.css          UI agent (tokens, layout, title, map, collection, armoury, parent, settings)
css/battle.css        UI agent
css/lesson.css        UI agent
css/formats.css       FORMATS agent (only .fmt-* classes)
js/main.js            UI agent (boot, ctx wiring)
js/router.js          UI agent (hash router)
js/db.js              CORE agent
js/state.js           CORE agent
js/rng.js             CORE agent (mulberry32 + shuffle + int helpers)
js/audio.js           AUDIO-ENGINE agent
js/engine/battle.js   UI agent
js/engine/lesson.js   UI agent
js/engine/formats/mcq.js     FORMATS agent
js/engine/formats/numpad.js  FORMATS agent
js/engine/formats/index.js   FORMATS agent (registry: format string → render fn)
js/gen/placevalue.js  GEN agent
js/gen/decimals.js    GEN agent
js/gen/rounding.js    GEN agent
js/gen/index.js       GEN agent (registry: genId → generate)
js/screens/*.js       UI agent (title, map, topic, battle, collection, armoury, parent, settings)
data/topics/*.js      ALREADY WRITTEN (Fable) — read, never modify
data/map.js           ALREADY WRITTEN (Fable)
data/creatures.js     ALREADY WRITTEN (Fable)
assets/**             ART agent
audio/sfx, audio/music, audio/CREDITS.md   AUDIO-ASSETS agent
audio/vo/manifest.json         AUDIO-ENGINE agent (ships as {"files":[]})
manifest.webmanifest  UI agent
sw.js                 UI agent
```

## 3. Design language (make it STUNNING — this is a AAA-feeling cartoon game, not a quiz)
### Tokens (define as CSS custom properties in main.css)
```
--swamp-night:#16241B; --swamp-deep:#1E3325; --swamp-mid:#2E4A33; --swamp-glow:#7BC950;
--stink:#9B59D0; --stink-lime:#C7F464; --parchment:#F6EBD4; --card:#FFF9EC; --ink:#33261D;
--gold:#F4C542; --gold-deep:#D9A21B; --correct:#2ecc71; --wrong:#e74c3c;
--r-lg:28px; --r-md:20px; --r-sm:14px;
--shadow-card:0 10px 0 rgba(0,0,0,.18), 0 18px 40px rgba(0,0,0,.35);
--spring:cubic-bezier(.34,1.56,.64,1);
```
### Typography
- Display/headers/buttons: **Fredoka** (self-hosted woff2, `assets/fonts/`), weights 500/700.
- Question stems & lesson body: system stack (-apple-system…), 22px minimum, 1.45 line-height, --ink on --card. Questions must read calm and clear — the silliness lives in the chrome, never in the stem typography.
### Motion rules
- Everything enters with springy transform (scale .9→1 or translateY 24→0, 320–420ms var(--spring)). No opacity-only fades for primary elements.
- Idle life: creatures bob (translateY ±6px, 2.4s ease-in-out infinite alternate) and blink (if art has eye variants, skip if not); stink fumes rise perpetually.
- Stink fumes = reusable `.fumes` element: 3 blurred radial-gradient blobs (mix of --stink and --stink-lime, opacity .5) animating upward + wobble on 3 offset keyframe timings. Density controlled by `--fume-scale`.
- Correct answer: card flashes green ring, floating "+1 PONG KNOCKED OUT!" text drifts up, creature recoils (translateX jolt + squash scaleY .85), gauge drains with 300ms ease.
- Wrong answer: screen-edge green haze vignette pulses once, creature does a cheeky wiggle, gentle (not harsh) shake ±4px. NEVER a harsh buzzer.
- Boss capture: gauge empties → slow-mo wobble (creature scale pulses) → white flash 120ms → confetti burst (house-style CSS confetti, 80 pieces) + big "CAPTURED!" stamp rotating in at -8deg.
- prefers-reduced-motion: honour it (reduce to fades).

## 4. App frame
- Hash router: `#/title #/map #/topic/:id #/lesson/:id #/battle/:id/:stage #/collection #/armoury #/parent #/settings`. Screen modules export `{ mount(rootEl, ctx, params), unmount() }`. `ctx = { db, state, audio, go(hash), toast(msg) }`.
- `index.html`: single `<main id="app">` + `<div id="overlay">` for modals/toasts. Landscape-lock hint: if portrait, show a friendly full-screen "Turn me sideways, hero!" card (CSS orientation media query).
- Boot (main.js): register SW → db.open → state.load → audio.preinit (defer real init to first pointerdown) → route. First run → #/title.

## 5. Screens (composition specs)
### Title
Full-bleed swamp night gradient + layered silhouette hills (ART agent's background elements) + rising fumes. Centered wordmark "FART QUEST" (Fredoka 700, ~96px, --gold with 4px --ink stroke via text-shadow stack, slight arc via per-letter rotate; a small 💨 puff animates out of the "Q" every ~6s). Subtitle: "The Kingdom needs YOU… it smells TERRIBLE." Buttons: big PLAY (gold), smaller Collection / Settings. Tiny crest bottom-right = parent long-press target (2.5s hold → keypad gate: show "6 × 7 = ?" style question, numeric entry, 3 tries).
### Map (#/map)
Horizontally scrollable panorama (~2600px wide stage in a scroll container, momentum scroll). Layers: far hills (slow parallax via transform on scroll), mid swamp, foreground pads. **Number Swamp** region occupies the left third with 10 location pads along a winding dotted trail: the 3 Phase-1 topics tappable (mossy stone pad, creature silhouette + name plaque + fumes at `stinkLevel` density; conquered = clean pad, creature statue, gold sparkle); 7 future pads visible but "fogged" with plank signs ("OPENS SOON"). Other 9 regions appear as distant fogged zones with funny closed signs (from data/map.js `closedSign`). Region boss (The Countfather) = large silhouette on a hill with "Defeat all 10 locations to face him". HUD top bar: crest, collection count chip (💩 icon + n/9), settings gear. First-visit coach bubble from Whiffbeard: "Tap a stinky pad to begin, my brave nose-soldier!"
### Topic screen (#/topic/:id)
Big parchment panel: creature art (silhouette until captured), name, funny one-liner, mastery ladder as 5 scratch-and-sniff style badges (Taught → Practising → Boss-Ready → Captured → Legend), buttons: **Scout Report** (lesson — pulsing if not done), **Minion Battle** (T1), **Elite Battle** (T2/3, locked until tier unlocked w/ padlock + "win N more minion scraps"), **BOSS** (locked until masteryLevel ≥ 3; shows requirements checklist), Armoury shortcut if weapon owned. Show the Secret Weapon card mini if owned.
### Lesson player (#/lesson/:id) — THE MOST IMPORTANT SCREEN
Parchment scroll aesthetic, Whiffbeard portrait bottom-left in a rounded frame, speech arrives as typed-in text (28ms/char, tap to complete). Card types from topic data:
- `talk`: Whiffbeard speech bubble (html), optional `vo` id → audio.vo(id).
- `show`: title + rich html visual. Lesson helper classes the UI agent must implement in lesson.css: `.pv-grid` (place-value throne table: columns Th|H|T|U|•|tenths|hundredths, big digit tiles, optional `.pv-slide-left/right` animation classes that slide tiles one column with a whoosh), `.numline` (SVG-free number line: flex ticks 0–100 with a bouncing marker `.numline-marker`, camps highlighted `.camp-a/.camp-b`), `.digit-tile` (chunky tile 64px, Fredoka 700).
- `try`: embedded question (uses FORMATS renderer) in scaffold mode: wrong answer → shake + reveal `hintSteps` one at a time (never fails out; after all hints, show the worked answer and move on with "we'll smash it in battle").
- `weapon`: full-screen Secret Weapon unlock: card flips in (rotateY 180→0, 600ms), gold shine sweep, name + tagline + the rule in big text; sfx jingle + soft parp; "Add to Armoury" button.
Progress dots top; back arrow always available (progress saved per card index).
### Battle (#/battle/:id/:stage) stage ∈ minion|elite|boss
Arena: background per region (`data/map.js` region.bg gradient identity), creature right (35% width, bobbing, fumes), question card centre-left (max 620px). Top: **PONG METER** — chunky gauge with bubbling green liquid (animated background-position stripes), boss shows creature nameplate. Streak pips (3) under the card; on 3rd: "MEGA PARP!" banner + double drain + audio.parp(big).
Flow (engine/battle.js): stageConfig = minion {n:6, tiers:[1], drainPerHit:1/6} · elite {n:8, tiers:[2,2,3], drain:1/8} · boss {hits:8, pool mixed t2/t3, wrong = gauge refills +1 step (cap 12 questions total), flawless flag}. Wrong answer flow: creature parps at you (sfx + vignette) → **Whiffbeard reteach card** slides up covering the question: `explain.rule` + `explain.worked` (+ `whyWrong` for the picked distractor if present) + "Got it — again!" button → NEW VARIANT question (regenerate; never repeat the same item). No lives, no lost progress, ever.
End screens: minion/elite → "SCRAP WON!" + tally + maybe stinkling drop (20% after elite win, from data/creatures.js commons not yet owned); boss → capture sequence (see §3 motion) + creature card + rarity stars; then return to topic screen (which now sparkles).
Every end screen shows ONE "Whiff of Wisdom" — a random revision tip from the topic's `tips` array (loads of hints/tips = Damien's explicit ask).
### Collection (#/collection) — "The Dungeon of Shame"
Dungeon shelf grid; owned creatures on plinths (idle bob, tap → big card: art, rarity stars, funny bio which sneaks in the topic's key fact, "topic guarded", shiny badge if flawless); unowned = black silhouette + "???". Includes locked teaser plinths: Golden Turd (「?」gold shimmer) and The Skidmark King (big chained door). Rarity: Common (stinklings), Rare (topic bosses), Epic (region bosses), Legendary (Skidmark King), Mythic (Golden Turd).
### Armoury (#/armoury)
Weapon cards on pegboard: name, tagline, the rule, "used against" topic link. This is his revision-notes screen in disguise.
### Parent dashboard (#/parent)
Plain, calm, teacher-style (deliberately un-silly). Table: topic | mastery label | last-10 accuracy | attempts | last practised | review due. Buttons: Export progress (JSON download), Import, Reset (double-confirm typing RESET). Sliders: music/sfx/vo volumes duplicated here.
### Settings (kid-facing)
Big toggles: Music, Sounds, Professor's Voice; **Fart-o-meter** slider (Silly → VERY SILLY; scales parp frequency/layering); text size (A/A+). All persisted in db settings.

## 6. Core APIs (exact signatures)
### js/db.js (CORE)
`await db.open()`; `await db.get(store,key)`; `await db.put(store,key,val)`; `await db.getAll(store)`; `await db.del(store,key)`; `await db.exportAll()` → obj; `await db.importAll(obj)`. Stores: `progress`, `settings`, `meta`. IndexedDB name `fartquest`, version 1. Promise wrapper, no deps. Handle Safari quirks (open inside user flow OK; retry once on transient error).
### js/rng.js (CORE)
`mulberry32(seed)` → fn; `rngInt(rng,min,max)`; `pick(rng,arr)`; `shuffle(rng,arr)` (Fisher-Yates, returns new array).
### js/state.js (CORE)
Owns per-topic record `{taught, attempts, last10:[], t2Unlocked, t3Unlocked, bossBeaten, flawless, captured, shiny, reviewStage, reviewDue, lastPlayed, commonsOwned:[]}` (commonsOwned global in meta, not per topic). API:
`await state.load(db)`; `state.topic(id)` → snapshot; `state.masteryLevel(id)` 0–5 (0 unseen; 1 taught; 2 ≥5 attempts; 3 t3Unlocked && last10 acc ≥ .8; 4 bossBeaten; 5 bossBeaten && reviewStage ≥ 3); `state.stink(id)` 0–100 (base [100,80,55,30,10,0] by level + min(40, overdueDays*8) if review overdue); `state.recordAnswer(id,{correct,tier})` (updates attempts/last10; unlock rules: t2 when ≥5 t1-correct and last8 acc ≥ .7; t3 same on t2); `state.recordBoss(id,{won,flawless})` (sets bossBeaten/captured/shiny, reviewStage 0, reviewDue now+3d); `state.recordRematch(id,won)` (won: stage+1, due +[3,7,14,30][stage]d; lost: stage max(0,stage-1), due +3d); `state.dueReviews()`; `state.grantCommon(creatureId)`; events: `state.onChange(fn)`. All mutations persist via db immediately.
### js/audio.js (AUDIO-ENGINE)
`audio.attachUnlock()` (bind once to first pointerdown: create/resume AudioContext, then start title music); `audio.sfx(name)` (from audio/sfx manifest object baked in file); `audio.parp(size)` size∈1..3 → WebAudio synth: filtered sawtooth burst w/ downward pitch envelope 90→45Hz, lowpass ~400Hz, LFO wobble, 150–600ms by size, slight random detune each call so no two parps identical; layer with a real sample when available (`sfx/fart-*.m4a`) chosen randomly — synth is the guaranteed fallback; respect Fart-o-meter setting (0 = replace with soft "poof"). `audio.vo(prefix)` → fetch-once `audio/vo/manifest.json`, pick random file matching `^vo-{prefix}`, play via <audio>; resolve silently if none (CRITICAL: zero errors when vo folder is empty); dedupe: never same file twice in a row; only one VO at a time (new interrupts old). `audio.music(track)` crossfade 800ms between loops (`audio/music/*.mp3`), remember position not required; `audio.duck(active)` lowers music to 25% while VO plays. `audio.setVolumes({music,sfx,vo})`, `audio.setFartOMeter(v)`. All levels persisted by caller.
### js/engine/formats (FORMATS)
`formats[question.format].render(container, question, api)` where `api = { rng, scaffold:bool, onAnswer(result) }`, result `{correct, chosenIndex?, value?}`. Implement Phase 1: `mcq5` (also handles 4 options): options as big chunky cards in a 1-col (long text) or auto 2-col (short) grid, letters A–E in gold chips, tap → lock in with press animation, then api.onAnswer; NO reveal of correct here (battle engine owns feedback), but add `.fmt-correct/.fmt-wrong` classes on request via returned handle `{reveal(correctIndex)}`. `num`: custom keypad (0-9, ".", "⌫", big gold "FIRE!"), display shows entry 40px, accepts `question.accept` array (string compare after trim, strip leading zeros, allow "3.5"="3.50" ONLY if accept lists both — generators control acceptance), unit chip displayed after the entry box if `question.unit`. Both formats must shuffle option order internally with api.rng (already-shuffled data forbidden). Keys ≥64px.
### js/gen (GEN) — see §8.

## 7. Question object (contract between GEN, FORMATS, battle, lesson)
```js
{ id, topicId, tier, format:'mcq5'|'num',
  stem,                       // plain text; may contain <b> only
  visual: null | {kind:'pvgrid'|'numline'|'digits', html},  // optional pre-stem visual, built by generator using documented classes
  options: [{text, misconception}],  correctIndex,          // mcq5 only (pre-shuffle order irrelevant; formats shuffle)
  accept: ['62'], unit: 'cm',                               // num only
  hintSteps: ['…','…'],       // 2 steps, used in scaffold mode
  explain: { rule, worked, whyWrong: {optionText: reason} , mnemonic? } }
```

## 8. Generator specs (GEN agent — correctness is sacred)
Common rules: `generate(tier, rng)` → Question. Recompute the answer independently inside a self-test (`node scratchpad test: 800 per tier per topic`): exactly one correct option; all options unique; distractors ≠ correct; stems free of NaN/undefined; numbers within spec bounds (≤2dp; whole numbers ≤ 5 digits). Include `explain` composed from templates (rule text supplied below must be used verbatim as `explain.rule` so it matches the lesson). Every distractor tagged with its `misconception`, and `whyWrong` written for each.
### placevalue (topic place-value)
- T1: (a) value of digit D in 3–4-digit N (mcq5; distractors: other place values of same digit, the bare digit, value ×10 slip); (b) which digit is in the H/T/U place of N; (c) which of 5 numbers has D in the tens place.
- T2: 4–5-digit N with comma formatting; partition recompose "4000+300+20+9 = ?" (mcq5); largest/smallest of 5 digit-swapped numbers; "the 7 in 37,410 is worth ___" (mcq5).
- T3 (`num`): "Write in figures: four thousand and sixty-two" (watch the empty-place zero — bank of 30 templated wordings across thousands/hundreds incl. zero-tens traps); value of digit as a number ("what is the 8 worth in 28,514" → 8000); make the largest number from digits [list] (accept single answer).
- rule: "Every digit sits on a throne. The THRONE tells you what the digit is worth."
### decimals (topic decimals-x10)
- T1: N×10, N÷10 (N whole or 1dp); which digit is in the tenths place; 10× bigger/smaller in words.
- T2: ×100 ×1000 ÷100 with results ≤2dp (never generate 3dp answers: choose inputs so results stay ≤2dp); order 4 decimals incl. a longer-is-bigger trap pair (0.3 vs 0.25); missing op: "3.7 × ___ = 370".
- T3 (`num`): 3.45×100; 620÷1000 → NO, keep ≤2dp: use ÷10/÷100 only for T3 write-ins (e.g. 62÷100=0.62); mixed real-life: "1.75 m = ___ cm" style ONLY with ×100 (bridges to Measure Marsh later).
- Distractors: add/remove-a-zero (3.50 for 3.5×10), slid wrong direction, slid wrong number of places.
- rule: "The point NEVER moves. The DIGITS slide — left when you ×, right when you ÷."
### rounding (topic rounding)
- T1: round 2-digit to nearest 10 (never ending in 5 at T1); 3-digit to nearest 100; numline visual variant (visual.kind='numline', marker on N, camps at the two multiples).
- T2: nearest 10 incl. 5-endings (75→80); nearest 100 incl. 49/51 boundaries; reverse: "which of these rounds to 400 (nearest 100)?"; nearest 10 of 3-digit numbers.
- T3 (`num` + estimate mcq): round to nearest 10/100 write-in; estimate 41×19 by rounding (mcq5 of magnitudes: 800 correct vs 80/8000/779/exact); "estimate the total: £3.95 + £8.10" (mcq5).
- Distractors: rounded down when should round up (the 5 rule), wrong place (nearest 10 vs 100), truncation (74→70 correct vs 74→74/75 slips).
- rule: "Find the two camps. Look at the DECIDER digit only: 5 or more, fling UP. 4 or less, roll BACK."

## 9. Data modules (already authored by Fable — READ THEM before building screens)
`data/topics/place-value.js`, `decimals-x10.js`, `rounding.js` export `{id, name, region, genId, creature, weapon, lesson:[cards], tips:[...]}`. `data/creatures.js` = full roster incl. commons + teasers. `data/map.js` = regions, locations, closed signs, bg gradients.

## 10. PWA
`manifest.webmanifest`: name "Fart Quest", short_name "Fart Quest", start_url ".", display standalone, orientation landscape, background/theme #16241B, icons 192/512 + maskable (ART agent supplies). index.html: apple-touch-icon 180, apple-mobile-web-app-capable, status-bar black-translucent, viewport-fit=cover (respect safe-area insets in HUD).
`sw.js`: `CACHE_V = 'fq-v1'`; precache: shell (html/css/js/data/fonts/monster art/manifest); runtime cache-first for `audio/**` and any misses; activate → clear old caches; skipWaiting + clientsClaim. NEVER cache vo/manifest.json with cache-first (network-first, fallback cache) so new recordings appear.

## 11. Tone & copy rules (written text)
Whiffbeard's written voice: pompous, warm, delighted by farts, on Jarlath's side. Written failure text NEVER says fail/wrong/bad — pattern: playful gasp + instant help ("Ooof! That one slipped out sideways. Watch this…"). Superlatives for wins ("You absolute legend of the bog!"). Kid is addressed as: brave hero, young stinker (affectionate), nose-soldier, Sir Jarlath. UK spelling. Exclamation marks welcome; sarcasm never.

## 12. Definition of done (Phase 1)
`python3 -m http.server` from repo root → full loop playable with NO console errors: title → map → topic → complete lesson (weapon unlocks) → minion → elite (t2 unlock visible) → boss → capture → collection shows creature → armoury shows weapon → parent dashboard shows real stats → settings toggles work → reload persists everything → SW installs, second load offline-capable (except audio not yet played). All node self-tests pass. Every asset/audio file referenced actually exists.
