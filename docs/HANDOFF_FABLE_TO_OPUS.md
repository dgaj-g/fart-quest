# FART QUEST — Succession handoff (Fable 5 → Opus 4.8)
**If you are Opus 4.8 (or any later model) picking this up: this file + the docs it links are everything you need. Read this file first, fully. Written 7 Jul 2026 by Fable 5 mid-build, designed so the app can be finished without any Fable access.**

## What this project is
A complete SEAG transfer-test revision game ("Fart Quest") for Damien's son **Jarlath** (P6, sits the test Nov 2027). Teaching quality is the explicit #1 priority; comedy (affectionate poo/fart humour, VOICE lines spicier than written text) is the engagement engine. Live at https://dgaj-g.github.io/fart-quest/ · repo `dgaj-g/fart-quest` · local `/Users/damiengartland/Sites/fart-quest` (git, HTTPS remote, gh keyring auth works).

## The design constitution (do not violate)
1. Vanilla ES modules, zero build step, zero runtime deps, UK English, iPad Safari primary.
2. Every topic: teach from ZERO → concrete → visual → scaffolded try (can't fail; hints escalate to worked answer) → **Secret Weapon** (the exam shortcut, rule reused VERBATIM as every question's `explain.rule`) → minion/elite/boss battles → capture the creature.
3. Wrong answers never lose progress; reteach card (rule + worked + whyWrong) then a FRESH variant, never the same item.
4. Question stimuli/diagrams are **exam-plain** (mimic real SEAG papers); game styling lives in the chrome only. Castle Clench (mock exam) drops the theme entirely on purpose.
5. Misconception-tagged distractors, whyWrong for each, no answer-pattern tells (length/position/bracketing), Fisher-Yates everything, T2/T3 ≥5 options.
6. Written text warm-never-mocking (never "fail/wrong/bad"); spicy insults only in Damien's VO recordings.
7. SEAG exclusions (bottom of `Claude Work/Jarlath SEAG App/TOPIC_MAP.md`): ≤2dp, no imperial, Celsius only, first-quadrant only, internal angles of triangles/quadrilaterals only, no measuring angles, UK spelling.
8. NUMPAD HAS NO MINUS KEY — no generator may emit a negative `num` answer (temperature must use mcq for negative results). One factory author flagged this; enforce in review.

## Key documents (all in this repo's docs/)
- `BUILD_SPEC.md` — phase-1 architecture, tokens, contracts (screens, db, state, audio, question object).
- `ENGINE_SPEC_2.md` — new formats (errorspot/clozebox/wordentry/selecttwo), passage engine, diagram lib, region bosses, Castle Clench exam, story/tutorial, map v2, progress decisions.
- `CONTENT_SPECS_MATHS.md` / `CONTENT_SPECS_ENGLISH.md` — per-topic briefs incl. weapon rules (verbatim), tier templates, traps, bank sizes, verification protocol.
- `ROSTER.md` — every creature name/character/palette + slug rule (kebab of name).
- `INTEGRATION_NOTES.md` — THE integration checklist (registries regen, examProvider wiring, VO fallback, sw precache regen fq-v5, audits 1-15). Follow it literally.
- `AUDIO_SCRIPTS.md` — Wave 1 (37 clips, ALL recorded+installed) + Wave 2 (17 clips: story/tutorial/exam — NOT yet recorded; app must caption-carry). `AUDIO_PLACEMENT.md` — the install prompt for recordings.
- Curriculum ground truth: `/Users/damiengartland/Desktop/Claude Work/Jarlath SEAG App/` (TOPIC_MAP.md, DESIGN.md, paper-analysis/*.json).

## Exact state at handoff (7 Jul 2026, after credit-outage interruptions)
**DONE & VERIFIED:** Phase 1 (3 Number Swamp topics) live; all 37 Wave-1 VO clips installed+live; art factory 100% (every creature/boss/special composited, slug-named, verified — 120 files in assets/monsters/); engine factory 6/7 agents verified-done (formats-2, diagrams [348 assertions], passage, battle-ext, story/tutorial, map-v2-shell).
**UNVERIFIED:** Castle Clench exam — js/screens/exam.js + css/exam.css + js/db.js v2 migration EXIST (written before an API crash) but have NO verification report. A verifier agent brief exists — see "Recovery" below.
**INCOMPLETE (credit outage — resume from cache):**
- Maths factory: 7/27 topics done (mental-maths, written-methods, fractions, fdp, sequences, special-numbers, machines-mystery). 20 failed BEFORE writing (verify none left partial files!). Resume: `Workflow({scriptPath:'/Users/damiengartland/.claude/projects/-Users-damiengartland-Desktop-Claude-Work/cf052284-69cc-4fa9-87a9-84f0f93010f2/workflows/scripts/fq-maths-factory-wf_b7c4f0fb-4df.js', resumeFromRunId:'wf_b7c4f0fb-4df'})` — done agents replay cached, failed re-run.
- English factory: 10/25 done (capitals-endmarks, commas-colons, apostrophes, speech-brackets, spelling-rules, homophones, tricky-words, parts-of-speech, plurals-collectives, reading-detective — verify exact list vs data/topics/ on disk). 15 failed incl. ALL 6 passages. Resume: same pattern, scriptPath `.../fq-english-factory-wf_9064e78b-a4f.js`, resumeFromRunId `wf_9064e78b-a4f`.
- NOTE: these scriptPaths/runIds belong to the ORIGINAL session (cf052284-…). Same-session-only resume: if you are a NEW session, you cannot resume those runs — instead re-dispatch ONLY the missing units: diff `ls data/topics/*.js` + `ls data/passages/*.js` against the full topic list in data/map.js, then run per-unit agents using the EXACT per-topic prompt templates inside the two workflow script files above (read them — they contain the complete authoring briefs; copy the prompt, substitute the topic id).

## Remaining pipeline after content lands (in order)
1. Exam verification (brief: audit js/screens/exam.js against ENGINE_SPEC_2 §E requirement-by-requirement, prove db v1→v2 migration preserves data, run composition/scoring/timer node tests).
2. INTEGRATION (one strong Sonnet agent + the checklist in INTEGRATION_NOTES.md — registries, examProvider, VO teach-generic fallback, creature-image audit, collection completeness, storybog wiring, patrol, sw regen fq-v5, static sweeps, run ALL scratch tests incl. fq-tests/topics/*).
3. VERIFICATION: blind double-solve EVERY English bank item + passage question (2× independent Haiku solvers WITHOUT the key; disagreement → Sonnet arbiter → fix/delete). Maths: re-run all self-tests fresh.
4. REVIEW PANEL (Sonnet, adversarial, evidence-required): pedagogy vs specs+exclusions; exam fidelity vs paper-analysis facts; code/iOS lifecycle; copy/tone sweep. Fix confirmed findings.
5. HUMAN-QUALITY PASS: read all 6 passages + their 78 questions end-to-end (this was reserved for Fable; Opus should do it with the same bar: every answer unambiguously anchored, distractor rules honoured, genuinely good children's writing).
6. PLAYTEST in browser (Claude Preview, launch config "fart-quest", viewport 1180×820, NEVER location.reload — hash-navigate; if paint squashes into a corner, preview_stop/start fresh): full loop on one new maths topic, one errorspot topic, one storybog topic, region-boss gauntlet, training skirmish, story+tutorial first-run, parent reset, fresh-profile region gating.
7. DEPLOY: commit (Co-Authored-By trailer per repo convention), push, poll https://dgaj-g.github.io/fart-quest/ + spot-check new asset URLs 200. Update Damien's memory (`~/.claude/projects/-Users-damiengartland-Desktop-Claude-Work/memory/project_jarlath_seag_app.md`).
8. REPORT to Damien: what shipped, what he records (Wave 2), any honest caveats. Plain-text URL, absolute file paths (his preferences: no AskUserQuestion popups; pbcopy anything he'll paste with LC_CTYPE=en_US.UTF-8).

## Model routing (Damien's economics — binding)
Fable 5 gone/nearly gone. Opus 4.8 = the new judgement tier: use it ONLY for design calls, passage quality pass, final review arbitration. Sonnet = all implementation/authoring/review agents. Haiku = blind solvers, mechanical validation. Damien's weekly allowance is finite — batch work into background agents/workflows, keep the orchestrator lean, don't re-read what a structured report already summarises.

## Open items ledger (beyond the pipeline)
- Wave 2 VO (17 clips) → Damien records → AUDIO_PLACEMENT.md prompt installs (any cheap session).
- vo-teach-<topic> clips for the 46 new topics: OPTIONAL (generic fallback works); if Damien ever wants them, generate the script list from each topic file's lesson[0].vo id.
- Known accepted quirks: reverse-rounding tripwire throw (never fired in 15k samples); music lesson-track probes .mp3 then .m4a (harmless 404); Whiffbeard has no literal beard (Kenney parts limit — VO carries the character); diagrams' `shape` kind uses `shapeKind` sub-field (collision fix, documented in code).
- Damien's progress-sync question was answered: LOCAL IndexedDB + export/import; NO GitHub sync (public repo, no safe token). Don't reopen.
