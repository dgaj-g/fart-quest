# Integration checklist — full build-out session (7 Jul 2026)
Working notes for the integration phase. Status board lives in the session task list; workflow runs: engine=wf_6ec685f4-ded, art=wf_c3910284-cb5, maths=wf_b7c4f0fb-4df, english=wf_9064e78b-a4f.

## Must-do at integration (after all factories land)
1. **Regenerate registries** (script, not hand-edit): `js/gen/index.js` from js/gen/*.js exports; `data/topics/index.js` from data/topics/*.js; NEW `data/passages/index.js` from data/passages/*.js. Verify every topic's `genId` resolves OR topic is bankTopic/passageSkill.
2. **VO teach fallback**: lesson intro cards use per-topic vo ids that mostly have no recording. Change `audio.vo(prefix)` to return `true/false` (played or not), and in lesson.js: `if (!(await ctx.audio.vo(card.vo))) ctx.audio.vo('teach-generic')`. Keep all other call sites fire-and-forget.
3. **Wire ctx.examProvider** (exam.js ships a stub): provider maps slotSpec → real question: maths slots via gen registry (topicPool from data/map.js maths regions), english errorspot/clozebox slots via drill-topic banks, passage block = one full passage from data/passages (7 mcq + 6 wordentry in file order). Difficulty mix t2-heavy, t3 tail (Q51-56 num from maths gens at t3).
4. **Creature image audit**: every data/topics/*.js creature.image + every data/map.js boss image must exist in assets/monsters/ (art factory slug rule: kebab of creature name). Fix slug mismatches on the DATA side (art filenames win).
5. **Collection completeness**: The Stink Vault must show — commons (6), topic creatures (49, silhouette till captured), region bosses (10, from map.js + state.regionCleansed), Skidmark King + Golden Turd (locked teasers until earned). Verify collection.js derives all five groups; extend if the engine agent only did topics.
6. **Storybog battle wiring**: skill topics (passageSkill field, no bank/genId) draw tagged questions across data/passages pool; topic boss = full single passage run (battle-ext agent's §D implementation) — verify end-to-end with one skill topic.
7. **Morning Patrol**: wire the map bugle → battle stage 'patrol' if engine supports; else hide button (no dead UI).
8. **sw.js**: REGENERATE PRECACHE_URLS from disk (all js/css/data/passages/fonts/monsters/ui; NO audio/), bump CACHE_V → 'fq-v5'.
9. **Static sweeps** (the proven crosscheck.mjs pattern): node --check ALL js; every import resolves; every asset string exists (skip audio/vo); sw precache all exist.
10. **Run every scratch test**: fq-tests/topics/*.test.mjs (27 maths) + *.validate.mjs (English) — all green; re-run the original gen.test.mjs trio.
11. **First-run flow**: fresh profile → PLAY → #/story → tutorial → map. storySeen/tutorialDone meta keys respected; replay paths from title + settings work.
12. **Region unlock sanity**: with a fresh profile exactly number-swamp + punctuation-pits open; simulate captures via state to verify the ≥2-captures unlock cascade in both tracks; Castle Clench gate states (4-region skirmish / 10-region full mock).
13. **DB migration**: db.js v2 'mocks' store upgrade must not lose existing v1 progress (test with a seeded v1 fake — exam agent claims a node test; re-verify against REAL IndexedDB in browser during playtest, incl. the deployed-site upgrade path for Jarlath's existing iPad data if he played Phase 1).
14. **Diagram spot-check**: one battle question rendering each of: clock, barchart, coordgrid, net, venn, pie — visually verified in preview.
15. **Answer-sheet keyboard**: wordentry input focus behaviour on iPad (no autofocus; scroll-into-view on focus) — preview-verify at 1180×820.

## Decisions already made (do not relitigate)
- Progress stays LOCAL (IndexedDB) + export/import. NO GitHub-hosted progress (public repo, no safe token path). Per-topic reset + continue labels are in the engine build.
- Exam/diagram styling is deliberately exam-plain (fidelity to SEAG papers beats app theming).
- vo-teach-generic is the fallback voice for all new lessons until Damien records more; Wave 2 script appended to AUDIO_SCRIPTS.md (17 clips incl. story/tutorial/exam).
- Reverse-rounding tripwire throw stays (0/15k fire rate; a wrong exam question is worse than a crash).

## Post-integration verification plan
- Blind double-solve workflow over EVERY English bank item + passage question (2× haiku solvers, sonnet arbiter on disagreement) — items failing get fixed or deleted; report per-topic pass rates.
- Fable reads all 6 passages + their 78 questions in full (non-delegable).
- Adversarial review panel: pedagogy (new topics vs CONTENT_SPECS + SEAG exclusions), exam-fidelity (mock composition vs paper-analysis facts), code/iOS, copy/tone.
- Full Fable preview playtest of: one new maths topic loop, one errorspot topic loop, one storybog loop, region-boss gauntlet, training skirmish, story+tutorial, then deploy fq-v5 and live-verify.
