# Adding a topic to Fart Quest (any future session)

The app is manifest-driven: one authored data file + one generator + three registry touches. Read `docs/BUILD_SPEC.md` §7–§9 first, and match the teaching quality bar of `data/topics/place-value.js` (teach from zero → concrete → visual → try → Secret Weapon; misconception-tagged distractors; whyWrong for every distractor; 5+ tips).

Checklist:
1. **Curriculum**: find the topic in `Claude Work/Jarlath SEAG App/TOPIC_MAP.md` (spec bullets, weight, trap teaching, region, boss/creature name). Mine `Jarlath SEAG App/paper-analysis/*.json` for real question styles at each tier.
2. **Content** — `data/topics/<topic-id>.js`: creature (bio + factSneak), weapon (rule stated ONCE, verbatim reused as every generator's explain.rule), lesson cards (talk/show/try/weapon; visuals via the documented classes .pv-grid/.numline/etc. or add a new class + its CSS to css/lesson.css), tips[]. VO: add `vo-teach-<short>-01` line to `docs/AUDIO_SCRIPTS.md` and reference the prefix from the intro card.
3. **Generator** — `js/gen/<genId>.js`: ≥3 templates per tier, misconception distractors, T3 = 'num' write-ins. Register in `js/gen/index.js`. EXTEND the test file pattern (800/tier, independent recompute — see scratch tests referenced in git history / rebuild equivalent) and run it.
4. **Registry**: import the topic in `data/topics/index.js` (or wherever topics are aggregated — check js/screens/map.js imports); flip the location `live: true` in `data/map.js` (the pad already exists, named).
5. **Art**: composite a creature PNG (+ shiny) per BUILD_SPEC art direction using Kenney parts in `assets/monsters/` (sharp; see assets/CREDITS.md for the pack).
6. **Ship**: add new files to `sw.js` precache list and BUMP `CACHE_V`. `node --check` everything, run generator tests, playtest the full topic loop in a browser (lesson → minion → elite → boss), then commit + push.
7. **Review bar**: adversarial content review before push — every generated answer independently recomputed, every lesson claim checked against the SEAG spec exclusions (no imperial units, ≤2dp, first-quadrant only, etc. — full list at the bottom of TOPIC_MAP.md).

Model guidance (Damien's standing preference): run these sessions on Sonnet; use Haiku subagents for bulk variant generation once templates are locked. Fable/ultracode only if the topic needs new mechanics designed from scratch.
