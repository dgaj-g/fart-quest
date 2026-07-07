# FART QUEST — Engine Spec 2 (full-app build-out)
Extends `BUILD_SPEC.md` (still binding: tokens §3, tone §11, contracts §6-§7). Same rules: vanilla ES modules, no deps, UK English, iPad-first, silent-graceful audio, file ownership is sacred.

## A. New question formats (`js/engine/formats/`)
All follow the existing contract: `render(container, q, api)` → handle `{reveal(...)}`; internal shuffle via `api.rng` where options exist; ≥60px targets; no answer tells. Register in `formats/index.js`.

### A1. `errorspot` — the exam's signature format ("Spot the Stink")
`q = { format:'errorspot', segments:[{text}×4], faultyIndex: 0-3 | null, explain, hintSteps }`
Render the sentence as its four segments flowing INLINE like a real sentence (not a list), each segment a tappable pill with its letter chip (A–D) beneath, plus a separate big button: **"ALL CLEAN! (N)"**. Tap = lock + `onAnswer({correct, chosenIndex|'N'})`. `reveal(faultyIndex|null)`: mark the faulty segment `.fmt-wrong-seg` (or flash the N button green when null). The N option is a first-class answer, never visually secondary. Segments keep sentence order (never shuffled — position IS meaning); rng unused except API parity.

### A2. `clozebox` — boxed-choice grammar cloze
`q = { format:'clozebox', stemParts:[before, after], options:[{text, misconception}], correctIndex, ... }`
Sentence shows with a gap slot `▁▁▁▁` between stemParts; 5 boxed word/phrase tiles beneath (shuffled). Tapping a tile snaps it into the gap with a spring, then locks + answers (single-tap commit — no separate confirm). `reveal` as mcq.

### A3. `wordentry` — free-text English write-in
`q = { format:'wordentry', accept:[...], hint?: 'one word' | 'copy the exact phrase', maxLen:40 }`
Real `<input type="text" autocapitalize="off" autocorrect="off" spellcheck="false">` (the iPad keyboard is the point — exam answer sheets need writing) + gold FIRE! button. Normalise for compare: trim, collapse inner whitespace, lowercase, strip trailing/leading punctuation (.,!?"'). `accept` entries pre-normalised by authors. Exact-phrase questions set `exact:true` → skip lowercase (still trim). Never autofocus on mount (iOS scroll-jump) — focus on first tap of the field.

### A4. `selecttwo` — choose exactly TWO
`q = { format:'selecttwo', options:[{text}×5], correctIndices:[i,j] }`
Tiles toggle-select (max 2, third tap swaps oldest); CONFIRM button enables at exactly 2. Correct only if both match. `reveal([i,j])`.

### A5. `num` (existing) — unchanged.

## B. Passage engine (`js/engine/passage.js` + `css/passage.css` + `data/passages/`)
- Passage data module: `{ id, title, genre:'fiction'|'nonfiction'|'poetry', lines:[string], questions:[Question] }` where each question carries `skill` (E4 sub-skill tag: lit|inf|vocab|lang|verse|text) and `lineRef` (e.g. `'12'`, `'21-36'`, or null).
- `passagePanel(passage)` → element: parchment scroll, EVERY 5th line numbered in the margin (5, 10, 15…) exactly like the papers, serif-free plain text (exam-calm), poetry preserves stanza gaps (empty-string lines).
- Battle variant "interrogation": when a question has `passageId`, battle screen renders passage panel left (~52%) + question right; the question's line-ref chip ("lines 21–36") scrolls the panel there and flash-highlights those lines when tapped. Creature (smaller) sits above the passage — it's being interrogated.
- Questions from passages use the standard formats (mcq5 / wordentry / selecttwo).

## C. Diagram primitives (`js/engine/diagrams.js`)
`renderDiagram(spec)` → SVG element. **Deliberate style rule: these mimic REAL SEAG paper figures — plain white card, dark ink lines, small sans labels, zero game styling, no colour except where the maths needs it (pie sectors, bar fills in flat muted tones).** Deterministic pure output from spec. Kinds (all needed by generator specs in CONTENT_SPECS):
`clock{h,m}` analogue with minute ticks · `digitalclock{text}` · `barchart{labels,values,yStep,yLabel}` axis from zero · `linegraph{points,xLabels,yStep}` · `table{headers,rows,highlight?}` · `tally{rows:[[label,count]]}` · `pictogram{rows,symbol,per}` · `pie{sectors:[{label,value}]}` · `venn{aLabel,bLabel,aOnly,bOnly,both,neither}` · `numline{min,max,marker?,step}` · `coordgrid{size,points:[{x,y,label}],shape?}` first quadrant only · `shape{kind:'triangle-iso'|'rect'|'parallelogram'|…,labels}` · `polygrid{rows,cols,shaded:[cells]}` fraction/area grids · `cuboid{w,h,d}` isometric with dimension labels · `net{cubeNetId:1-11}` · `angle{deg}` arc + rays (never to-scale-measurable; label "not to scale") · `thermometer{min,max,value}` · `spinner{sectors:[label]}` · `coins{values:[…]}` drawn as labelled circles (no currency images needed) · `scaledrawing{shape,scaleText}`.
Each ≤ ~40 lines of SVG-building JS; share axis/text helpers. A test page in scratchpad rendering every kind once.

## D. Battle engine extensions (`js/engine/battle.js` + screens)
- `stage='regionboss'` at `#/battle/region/:regionId`: 12-question gauntlet mixed from ALL that region's topics (tiers 2-3, generator topics regenerate; bank topics sample unseen-first), boss HP 10 hits, miss heals 1, cap 16 questions. Uses the region's boss creature (full size + aura). Reward: capture region boss (epic), region marked **cleansed** (map state + `vo('regionboss')` + mapclean beat). Unlock: every topic in region `captured`.
- Bank-driven topics (English): battle draws from the topic's bank — sampling rule: prefer items the player hasn't seen this cycle (`seenItems` per topic in state, resets when exhausted); NEVER the same item twice in a row; reteach retry pulls a *different unseen* item of the same tier (banks are big enough).
- Storybog topics: minion/elite = that skill's tagged questions across passages (passage panel shown); topic boss = one full random passage, all 13 questions, HP 13 (misses heal 0 here, cap 13 — mirror the real "one passage, every mark counts" feel but still no fail-out: score ≥10 wins).

## E. Castle Clench — the mock exam (`js/screens/exam.js`, `#/exam`)
- **Two doors:** "Training Skirmish" (20 questions, 20 min: 10 English + 10 Maths, same machinery) unlocks when ≥4 regions cleansed; "FACE THE SKIDMARK KING" (full mock) unlocks when all 10 cleansed.
- Full mock composition (mirrors the real paper exactly): Q1–5 punctuation `errorspot` · Q6–10 grammar `clozebox` · Q11–15 spelling `errorspot` · Q16–28 one full passage (7 mcq5 + 6 wordentry) · Q29–50 maths mcq5 · Q51–56 maths num (units given). Drawn across all topics via their generators/banks, difficulty mix t2-heavy.
- **The theme drops away**: plain paper styling (white, black text, small serif-ish headers), OMR-style answer strip (bubbles A–E / write-in box) under each question, question palette grid for flag-and-return, 60-min countdown (top-right, calm), modal nudge at 30 min ("Halfway — switch section?") and 50 min ("10 minutes left"). No feedback during; unanswered = prompted once at the end ("Never leave blanks — best-guess the rest?").
- Results: score /56, Skidmark King HP bar drains by score with parp barrage; **≥48 = he falls** (captures Legendary Skidmark King + Golden Turd awarded at a later flawless… no: Golden Turd = all-10-regions Legend status, keep). Below 48: he staggers, taunts warmly, "return stronger". Per-topic breakdown written to db `mocks` history; parent dashboard shows mock list + trend; weakest topics get re-stink nudges.
- Training Skirmish identical machinery, 20 min, no King (a "Royal Guard" dummy target).

## F. Story intro + tutorial (`js/screens/story.js`, `#/story`; tutorial overlay in `js/engine/coach.js`)
- **Story: 6 scenes**, each a full-bleed CSS-animated composition from existing assets (hills, creatures, tints, fumes) + caption band + VO (`vo-story-01..06`, silent-graceful). Advance: tap anywhere or auto after VO ends (fallback 7s); SKIP button always visible (top-right, small). Scenes: 1 peaceful kingdom (bright tint, no fumes) · 2 the Skidmark King appears (dark, big silhouette slides up) · 3 the Great Stink spreads (fumes engulf, creatures tint green, wail sfx+parp) · 4 the monsters aren't bad — just VERY smelly (stinkling close-up, sad→cheeky) · 5 Whiffbeard arrives (portrait, sparkle) · 6 "Only one hero…" (map zoom toward first pad + title card "SIR JARLATH OF FART QUEST").
- First run: after first PLAY tap (audio now unlocked) → story → tutorial → map. Replay: title screen small "📖 Story" button + settings toggles.
- **Tutorial (coach overlay):** spotlight-cutout steps over the real UI: (1) map pad "tap a stinky pad" → (2) topic screen "Scout Report first — ALWAYS learn before you fight" → (3) inside first battle, 2 sacrificial questions vs Whiffy with meter/streak explained → (4) collection peek "everything you de-stink lives here". Driven by a step script; `vo-tutorial-01..04`; skippable each step; auto-marks done in db meta.
- Until Damien records the new clips, captions carry the story (VO optional as ever).

## G. Map v2 (`js/screens/map.js` + data/map.js v2)
- ALL 10 regions rendered with their full location pads (49 topics), each region a themed band (bg gradient + sign + prop accents per data), its boss on a hill, winding trail throughout; Castle Clench looms at the far right behind a gate (opens per §E).
- **Region unlocking** (anti-overwhelm, kid-clear): two tracks open at start — Number Swamp (maths) + Punctuation Pits (English). Each subsequent region in a track unlocks when the previous region has ≥2 captured topics ("the path de-stinks"). Locked regions show fog + sign; tapping explains exactly what to do ("Capture 2 more monsters in Measure Marsh to clear this path!"). Order — maths: number-swamp → measure-marsh → money-mines → shape-caves → data-dump → chance-cliffs; english: punctuation-pits → spelling-sewers → grammar-grotto → storybog.
- Region cleansed state: band brightens, fumes gone, boss statue + flag.
- Map remembers scroll position per session; a "📍 Next quest" HUD button scrolls to the recommended next location (weakest unlocked / due review / next untaught).

## H. Progress & continuity (Damien's requirements)
- **Continue:** already inherent (IndexedDB). Surface it: topic screen Scout Report button shows "Continue (card 4/9)" when mid-lesson; title PLAY becomes "CONTINUE" when any progress exists.
- **Per-topic reset:** parent dashboard row action "Reset topic" (clears topic record + lesson progress + seenItems; double-confirm). Full reset stays.
- **Kid-facing 'Play it again':** captured topics offer "Rematch" (existing) and "Re-read Scout Report" — never a destructive reset.
- **No cloud/GitHub sync** (decision): a public client-side app cannot write progress to GitHub safely (would require an exposed token). Export/Import JSON in the parent dashboard covers device migration/backup; dashboard shows "last exported" date and nudges monthly.
- New db store `mocks` (exam history) + meta keys `storySeen`, `tutorialDone`, per-topic `seenItems`.

## I. Misc
- Morning Patrol activates (≥2 captured topics): HUD bugle button on map when reviews due; 10 mixed due-topic questions, streak parps, ends with `vo('patrol')`… intro uses `vo('patrol')` at start (recorded). Non-due days it offers a light 6-question mixed warm-up.
- `sw.js`: regenerate PRECACHE_URLS from disk (script), bump `fq-v4`. Passages/data/diagrams precached; audio stays runtime-cached.
- Settings: add "Replay story", "Replay tutorial", "Exam timer sounds" toggle.
- Manifest/topics registry: `data/topics/index.js` exports all topics (single import point for screens; no more per-file imports scattered).
