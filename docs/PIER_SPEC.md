# WHIFF-END PIER — Build Specification v1 (times-tables world)
Single source of truth for all Pier implementation agents. Deviate only where this spec is silent; note every such choice in your report. Companion context: `docs/BUILD_SPEC.md` §3 (design tokens/motion) §11 (tone), `docs/HANDOFF_FABLE_TO_OPUS.md` (CURRENT STATE + THE FIVE HARD RULES), `js/anims/_kit.js` (toolkit), `js/anims/fractions.js` (quality bar reference).

## 0. Product in one line
A standalone seaside amusement-arcade world ("Whiff-End Pier") for drilling times tables at speed: five mechanically distinct machines, mixed 1–10 multiplication + division by default, automatic weak-fact ("Gas Gremlin") tracking and targeting, per-machine personal bests with Nana Windbreaker's Bronze/Silver/Gold benchmark scores. Pure practice world: no lessons, no captures, no curriculum gating — always unlocked from the map.

## 1. Hard constraints (binding, same as whole app)
- Vanilla ES modules, zero build step, zero external runtime requests, offline-capable, iPad Safari primary (landscape), touch targets ≥60px, UK English.
- THE FIVE HARD RULES (from HANDOFF, binding here): ① no transform transitions during live pointer drags; ② feedback quoting a number/state only when the display shows exactly that state; ③ repeat-tap controls act on the pending target; ④ all state movement via kit `tween()` — no bare rAF loops; ⑤ warm-never-mocking written text.
- Written failure text NEVER "fail/wrong/bad" — failure is always a Dave-the-seagull event or warm Nana comedy. No sarcasm. Exclamation marks welcome.
- Fisher-Yates via `js/rng.js` `shuffle`/`pick`. Correct #2ecc71 / wrong #e74c3c.
- Question text itself is plain and calm ("6 × 7 = ?" big and clear); silliness lives in the chrome. NUMPAD HAS NO MINUS KEY — all answers are positive integers (max 144).
- Cleanup discipline: every mode returns a cleanup fn cancelling every timer/rAF/tween/drag it created (anim-card standard).
- New files must NOT start with `_` (Jekyll; .nojekyll exists but don't tempt it). NOBODY touches `sw.js` except the final integration step.

## 2. Facts domain rules
- Core pool: multiplication a×b for a,b ∈ 1..10, and the paired division facts (a·b ÷ a and a·b ÷ b).
- DELUXE (11s & 12s): only when the Deluxe lever is ON (meta `pierDeluxe`, default false, kid-facing lever in the hub, persisted). Adds a or b ∈ {11,12} facts to mixed draws and two extra Teacups tables. NEVER in default draws when off. Never required for anything.
- Fact family key: canonical `"AxB"` with A ≤ B (e.g. 6×7, 42÷7, 42÷6 are all family `"6x7"`).
- Division stems always use `÷` and whole-number results (they're inverse table facts by construction).
- Mixed draws serve both directions: ~60% multiplication / ~40% division.

## 3. Architecture & file ownership (do not touch files owned by others)
```
js/screens/pier.js      HUB agent — hub screen + mode host (routes #/pier and #/pier/:mode)
css/pier.css            HUB agent — hub + shared pier chrome ONLY (modes self-inject their CSS)
js/screens/map.js       HUB agent — EDIT: add the pier landmark (see §8); minimal, surgical
js/main.js              HUB agent — EDIT: import pier screen, register('/pier'…) + register('/pier/:mode'…)
index.html              HUB agent — EDIT: add css/pier.css <link> after anims.css
js/pier/facts.js        ENGINE agent — fact engine, stats, gremlins, bests (+ node self-test in scratch)
js/pier/padkit.js       HUB agent — shared numpad factory: makeNumpad(host, {onSubmit(valueString)}) →
                        {clear(), setEnabled(bool), destroy()}; keys 0-9/⌫/GO, ≥64px, chunky app style;
                        NO minus, NO decimal. Used by gunge/ghost/teacups/tank.
js/pier/content.js      CONTENT agent — gremlin names, line pools, VO id map
js/pier/modes/splat.js  SPLAT agent
js/pier/modes/gunge.js  GUNGE agent
js/pier/modes/ghost.js  GHOST agent
js/pier/modes/teacups.js TEACUPS agent
js/pier/modes/tank.js   TANK agent
audio/music/pier.mp3    MUSIC agent (+ audio/CREDITS.md append)
sw.js                   INTEGRATION step ONLY (regen precache, CACHE_V → fq-v17)
```
Shared toolkit: import `el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss` from `../anims/_kit.js` (modes: `../../anims/_kit.js`). Modes inject their own styles via `injectCss('pier-<mode>', css)` — fully self-contained modules, the proven anim architecture.

## 4. Mode module contract
```js
export default {
  id: 'splat',                 // matches filename and route segment
  title: 'SPLAT-A-GREMLIN',    // cabinet name
  blurb: 'Whack the right answer!',  // hub card one-liner
  mount(host, ctx, pier) { …; return cleanupFn; }
}
```
`ctx` = the app ctx ({db, state, audio, go, toast}). `pier` = the hub-provided kit (§5). Modes never touch IndexedDB directly — everything through `pier.facts`. A mode ALWAYS renders a "← PIER" ghost button (top-left, ≥60px) → `ctx.go('#/pier')`.

## 5. `js/pier/facts.js` — exact API (ENGINE agent implements; everyone codes against this)
```js
await facts.load(ctx)                    // reads meta keys; call once per pier session (hub mount)
facts.draw(rng, {deluxe})                // → {a, b, dir:'mul'|'div', stem:'6 × 7 = ?', answer:42, family:'6x7'}
                                         // gremlin-weighted: gremlin families 3× draw weight, capped ≤40% of draws;
                                         // never the same family twice in a row.
facts.drawFrom(rng, families)            // draw restricted to given family list (Tank mode)
facts.distractors(fact, rng, n)          // n unique wrong answers, plausible slips: neighbouring table
                                         // (±a or ±b), digit-swap, a+b, off-by-a; never the answer, all ≥1
facts.record(family, {correct, ms, mode})// updates stats + gremlin status + persists (meta 'pierFacts')
facts.gremlins()                         // → [{family, a, b, name, misses, streak}] current gremlins, worst first
facts.isGremlin(family)                  // bool
facts.flushed()                          // → count of lifetime flushed gremlins (meta counter)
facts.tableFacts(n, {division})          // ordered 1..10 facts for table n (Teacups)
await facts.getBests() / facts.putBest(modeId, best)  // meta 'pierBests': {splat:{score,when}, gunge:{seconds,when}, ghost:{ms,when,splits:[…20 cumulative ms]}}
facts.nanaTiers(modeId)                  // → {bronze, silver, gold} (§7 values)
```
- Gremlin rule: a family becomes a gremlin when ≥2 of its last 5 results are misses, OR its median correct-response time over the last 4 exceeds 6000ms. A "miss" = wrong answer or mode-defined timeout.
- Flush rule: 3 consecutive correct results for that family (any direction, any mode, any session) → gremlin cleared, `flushed` incremented; the CALLING mode is told via the record() return value `{justFlushed: true, name}` so it can celebrate.
- Persistence: meta keys `pierFacts`, `pierBests`, `pierDeluxe`, `pierFlushed` via `ctx.db.put('meta', key, val)`. No db schema/version changes.
- Self-test (scratch, not committed to repo root — put in `fq-tests/pier-facts.test.mjs`): 2000 draws → every fact's answer recomputed independently and correct; direction mix within 50-70% mul; no consecutive same-family; deluxe-off never yields 11/12; distractors never equal answer, always unique; gremlin/flush state machine walked through a scripted sequence.

## 6. The five machines (mechanics; each agent owns the full experience incl. welcome overlay, HUD, end screen)
Common: each machine opens with a short welcome overlay (cabinet name, Nana line from content.js, big START ≥60px). End screens show score, PB status (NEW RECORD! with party() if beaten), Nana tier progress (Bronze/Silver/Gold chips), a "ONE MORE GO" button and "← PIER". A caption bar (§9) shows character lines. All questions from `facts.draw` / per-mode source. Every wrong/missed fact silently feeds `facts.record`.

### splat — SPLAT-A-GREMLIN (60-second blitz, tap-based)
Whack-a-mole cabinet: current question big at top ("7 × 8 = ?"); 5 holes; gremlins pop up holding number cards = 1 correct + distractors (facts.distractors), positions shuffled. Tap the right one → SPLAT (squash animation, +1, next question immediately). Tap wrong → that gremlin blows a raspberry, the correct card flashes green briefly (rule ②: only while displayed), then next question; no score loss, combo resets. Streak of 3+ = MEGA SPLAT combo flash, mallet cursor grows. Score = splats in 60s. Countdown ring visible; final 10s the music-side sfx tick. Time up → Dave swoops across and nicks the mallet; scorecard.
### gunge — THE GUNGE TANK (survival, numpad)
Plank above a bubbling gunge vat. Numpad entry (0-9, ⌫, big GO — reuse the app's chunky key style, keys ≥64px; NO minus, NO decimal point). A plank-height gauge drains continuously; correct answer +boost (tween), wrong/slow answer = plank lurches down + brief fact-family flash ("6 × 7 = 42, so 42 ÷ 7 = 6"). Drain rate ramps every 15s. When the gauge empties: the plank snaps, full-screen gunge splash (CSS, green, gloriously daft), Dave holds up a scorecard with the survival time. Score = seconds survived.
### ghost — THE GHOST TRAIN (20-fact time trial vs your own ghost)
Fixed run: 20 mixed facts, numpad entry, elapsed clock running. Two parallel tunnel tracks: your cart advances a station per answered fact; the PB ghost cart advances per the stored splits (interpolated with tween; rule ④). Wrong answer = cart wobbles, must re-answer correctly to advance (clock keeps running — that IS the penalty). Finish → time vs PB; beat it = new splits stored, ghost celebration ("A NEW GHOST HAUNTS THE PIER!"). First-ever run: no ghost, "set the first ghost" framing.
### teacups — THE TEACUPS (single-table warm-up, untimed)
Pick a table 2–10 (2–12 with Deluxe) from big cup buttons. Lap 1: that table's ×1..10 in Fisher-Yates order, numpad, gentle spin animation between facts. Lap 2 ("the cups spin BACKWARDS!"): the division inverses. Wrong = cup wobbles, warm hint showing the fact family, retry same fact. End: "table polished" sticker + suggestion chip for a big ride. No score, no PB, no timer — explicitly the gentle one.
### tank — THE GREMLIN TANK (weak-facts view + targeted splat rounds)
Aquarium view: each current gremlin as a floating creature (bobbing, fume) with name + fact + miss tally (from facts.gremlins()). Empty state: sparkling clean tank + Nana congratulations. "SPLAT 'EM" (enabled when ≥1 gremlin) → short targeted round (facts.drawFrom over gremlin families, numpad, up to 12 questions or 2 passes). A `justFlushed` result → the FLUSH CEREMONY: gremlin spirals into the pier's Big Toilet, flush sfx (kit whoosh+drop), flushed-counter increments. Round end: tank re-renders (survivors remain).

## 7. Nana's benchmark tiers (v1 values — facts.nanaTiers returns these)
splat {bronze:12, silver:20, gold:30} · gunge seconds {45, 90, 150} · ghost total ms {100000, 75000, 55000} · teacups/tank: no tiers. Beating GOLD anywhere → one-time-per-machine special: Nana's shocked-trump celebration line + a gold trophy chip on that cabinet (persist in pierBests as `goldSeen:true`).

## 8. Map entry + hub
- Map: a pier landmark on the panorama coast near Chance Cliffs — wooden boardwalk + flashing-bulb sign "WHIFF-END PIER" (CSS bulb-flicker keyframes), always unlocked, whole block clickable → `ctx.go('#/pier')`. Follow the castle-gate block in js/screens/map.js as the structural precedent (fq-v13). Keep the edit surgical.
- Hub (#/pier): seaside-arcade look — night sky, neon, bulb strings; DIFFERENT palette from the swamp (pinks/teals/gold neon on deep navy) but same Fredoka/type system. Cabinet cards for the 5 machines (title, blurb, your PB, tier chips, big PLAY), the DELUXE brass lever (state + Nana caption when flipped), the flushed-gremlins counter, "← BACK TO MAP". Nana sprite presence + welcome caption line on mount (rotating pool). Music: `ctx.audio.music('pier')` on hub AND mode mount (same track keeps playing — music() early-returns on same track). Mirror lesson.js's `animSfx.setEnabled(...)` sounds-toggle call at pier mount (see renderAnimCard in js/screens/lesson.js).
- Hub screen module handles BOTH routes: no params → hub; params.mode → mount that mode's module full-screen (import the 5 mode modules statically; unknown mode → hub + toast).

## 9. Voice lines & captions (VO deferred — THIS BUILD SHIPS CAPTIONS ONLY)
- `content.js` exports LINE pools: `nana.welcome[]`, `nana.win[]`, `nana.goldBeaten[]`, `nana.deluxeOn/Off[]`, `nana.tankClean[]`, `announcer.roundStart[]`, `announcer.highScore[]`, `dave.steal[]` (Dave's are stage-direction captions like "DAVE HAS STOLEN THE MALLET.", never speech), `gremlin.taunt[]`, `gremlin.flushed[]` — each entry `{id:'pier-nana-welcome-01', text:'…'}`.
- Caption bar: `pier.say(entry)` (hub provides; implemented once in pier.js) shows the text in a character-tagged caption strip AND calls `ctx.audio.vo(entry.id)` — audio.vo resolves silently while no files exist; when the Maya1 clips later land as `audio/vo/vo-pier-nana-welcome-01.m4a` etc. they play with zero code change. NEVER gate anything on VO having played.
- Tone: Nana = boastful, warm, on Jarlath's side, "pet"/"petal", 1974 mythology. Announcer = pier tannoy showman. Gremlins = squeaky menace, proud of wrongness. Comedy must land in TEXT alone. UK English. Kid addressed as: brave hero, young stinker, nose-soldier, Sir Jarlath (existing app vocabulary).
- Gremlin names (content.js): deterministic map for ALL 78 families a≤b∈1..12 — daft name + one-liner each, answer-themed where possible ("Trevor the Fifty-Sixer" for 6x7... wait 6×7=42 — names must match their family's ANSWER: check every one). Names unique. No name reused from the existing creature roster (docs/ROSTER.md).

## 10. Music (MUSIC agent)
Source ONE new track: fast, daft, seaside-organ/chiptune-fairground energy. MUST be CC0/public-domain with the licence statement verified on the hosting page (FreePD.com is CC0 — good default source; OpenGameArt CC0 filter also fine). Download → verify with ffprobe (valid mp3, 1–3 min, mono/stereo 44.1k, ≤5MB; re-encode with ffmpeg if needed) → save as `audio/music/pier.mp3` → append title/author/source URL/licence to `audio/CREDITS.md`. Keep 2 alternate candidates in the scratchpad and list them in your report (Damien may swap after listening). Do NOT touch the three existing tracks.

## 11. Definition of done (integration step + orchestrator verify)
`node --check` clean on every new/edited JS; all relative imports resolve; css/pier.css linked; routes live; map landmark navigates; every machine playable end-to-end in preview with zero console errors; facts self-test green; sw.js precache regenerated from disk (+ pier files, + pier.mp3 excluded? NO — music is runtime-cached, NOT precached, match existing convention: audio/** excluded from PRECACHE_URLS) and CACHE_V → 'fq-v17'; .nojekyll untouched; fresh un-cache-busted browser boot renders title; commit + push + live-poll sw.js to fq-v17 + spot-curl new URLs → 200.
