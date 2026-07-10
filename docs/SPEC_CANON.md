# SEAG Content Canon

**Purpose.** This is the authority document for what content is *legitimate* inside Fart Quest. Every quiz item, every animation script, every "trap teaching" note in the app must trace back to something in Section A or B below — either directly, or via Section C's citations. Section D is the audit rule. If a reviewer (human or agent) can't find a line item's justification in this document, the content is superfluous and should be cut or re-derived.

**Authority order** (highest first):
1. **Spec transcription** — `Jarlath SEAG App/TOPIC_MAP.md`, which faithfully transcribes the official 2026 SEAG specification, bullet by bullet, including the exclusions list.
2. **Official evidence** — GL Assessment's two official practice papers, per-question inventories in `paper-analysis/seag-pp1.json` (Practice Paper 1, 2022) and `seag-pp2.json` (Practice Paper 2, 2023). These define *how* the spec's catch-all bullets actually get tested.
3. **Catapult inventories** (`catapult-1.json` … `catapult-5.json`) — secondary corroboration only. A style found *only* in Catapult, with no anchor in a spec bullet, is **not** sufficient basis for app content. Catapult is not cited anywhere below for this reason — every citation in Section C is to PP1 or PP2.

Source files referenced throughout: `/Users/damiengartland/Desktop/Claude Work/Jarlath SEAG App/TOPIC_MAP.md`, `/Users/damiengartland/Desktop/Claude Work/Jarlath SEAG App/paper-analysis/seag-pp1.json`, `/Users/damiengartland/Desktop/Claude Work/Jarlath SEAG App/paper-analysis/seag-pp2.json`.

---

## A. The complete spec bullet list (verbatim, numbered)

Each bullet is transcribed verbatim from TOPIC_MAP.md's "Spec coverage" column — one bullet per topic. The bracketed tag is the topic's TOPIC_MAP region/number, given for cross-reference into Section C.

### English (19 bullets)

1. capital letter, full stop, question mark, exclamation mark `[E1.1]`
2. comma, colon, semi-colon `[E1.2]`
3. apostrophe (possession + contraction) `[E1.3]`
4. speech/quotation marks, brackets, hyphen `[E1.4]`
5. common spelling rules `[E2.1]`
6. there/their/they're, where/were/wear, him/hymn etc. `[E2.2]`
7. irregular spellings; UK-not-US spelling `[E2.3]`
8. noun, pronoun, verb, adjective, adverb, conjunction, preposition `[E3.1]`
9. present/past, irregular (seek/sought), will/would awareness `[E3.2]`
10. they're, could've `[E3.3]`
11. plurals beyond s/es, collective nouns (oxen) `[E3.4]`
12. comparative/superlative adjectives & adverbs `[E3.5]`
13. phrase/sentence/paragraph/chapter `[E3.6]`
14. locating/selecting information from a source `[E4.1]`
15. inferential interpretation, justify by evidence `[E4.2]`
16. meaning of words from passages; synonyms/homonyms `[E4.3]`
17. language manipulated for effect; imagery, simile, metaphor `[E4.4]`
18. rhyme, verse structure, word play, dialect `[E4.5]`
19. purposes/audiences, style & form, layout features; index/contents/glossary/bibliography/author; prose/poetry/fiction/non-fiction `[E4.6]`

### Maths (30 bullets)

20. whole numbers, digits signifying value `[M1.1]`
21. mental two 2-digit; written incl. 2dp decimals `[M1.2]`
22. multiplication to 10×10, division, ÷ decimals by whole numbers `[M1.3]`
23. decimals to 2dp; ×÷ by 10/100/1000 `[M1.4]`
24. estimates to nearest 10/100 `[M1.5]`
25. vulgar fractions, equivalence `[M1.6]`
26. fractions ↔ decimals ↔ percentages `[M1.7]`
27. steps, doubling/halving, predicting sequential numbers `[M1.8]`
28. prime, square, cube, triangular, indices `[M1.9]`
29. function machines; letter for a number (6+a=24) `[M1.10]`
30. metre/gram/litre; kilo/centi/milli; conversions (175cm = 1.75m) `[M2.1]`
31. analogue, 12/24-hour, a.m./p.m. `[M2.2]`
32. timetables with 24-hour clock `[M2.3]`
33. temperature differences incl. negatives (Celsius) `[M2.4]`
34. perimeter of simple shapes `[M2.5]`
35. area by counting squares, volume by cubes; calculating both `[M2.6]`
36. calculating/using scale for distance `[M2.7]`
37. regular/irregular 2-D; quadrilateral family, triangles, polygons, circles `[M3.1]`
38. cubes, cuboids, cones, cylinders, spheres, prisms, pyramids `[M3.2]`
39. acute/obtuse/reflex; vertical/horizontal/perpendicular/parallel; angles in triangles & quadrilaterals (internal only) `[M3.3]`
40. ¼/½/¾/whole turns, clockwise/anti-, 8 compass points `[M3.4]`
41. first-quadrant plotting, drawing shapes `[M3.5]`
42. line symmetry; reflecting shapes `[M3.6]`
43. +−×÷ with money; estimation `[M4.1]`
44. change up to £10; fewest coins; interpreting a calculator display `[M4.2]`
45. certain/likely/unlikely/impossible/fair; order by likelihood; fifty-fifty; dice probability `[M5.1]`
46. Venn, block graphs, bar charts, bar-line, line graphs (axis from zero) `[M6.1]`
47. frequency tables, tallying `[M6.2]`
48. interpreting pie charts `[M6.3]`
49. calculate/use mean and range of discrete data `[M6.4]`

> Note for auditors: TOPIC_MAP.md's own footer says "35 topics" but the table rows sum to 49 (19 English + 30 Maths). That footer figure appears stale relative to the actual table content — this canon numbers what is actually written in the topic rows, since that is the verbatim transcription the brief asks for.

---

## B. Spec exclusions (never test these) — verbatim, numbered

Transcribed verbatim from TOPIC_MAP.md's "Spec exclusions" line (originally `·`-separated):

1. No imperial units
2. Scale only from simple drawings
3. No congruence meaning
4. No measuring/drawing angles
5. Internal angles of triangles/quadrilaterals only
6. Celsius only
7. First quadrant only
8. No extended writing
9. No future/conditional perfect beyond would've/could've
10. UK spelling only

**Implication for the app:** any game mechanic requiring a protractor/ruler measurement, an imperial-unit conversion, a Fahrenheit reading, a second/third-quadrant coordinate, a congruence-vocabulary question, or an extended-writing response is out of scope regardless of how well it would play — these are explicit spec *exclusions*, not just low-weight topics.

---

## C. Operationalised styles index

Every distinct question style/device identified in the two OFFICIAL practice papers, with its citation (paper + Q#) and the spec bullet (from Section A) it operationalises. Grouped by region. Bold **[CATCH-ALL]** flags a bullet whose wording names a general capability rather than a closed, enumerated list of terms — these are the bullets where an official-paper citation is *load-bearing*, not decorative (see Section D).

### E1 · Punctuation (bullets 1–4)

| Style / device | Bullet | Citation |
|---|---|---|
| Capitals / full stop / question / exclamation mark error-spot | 1 | PP1 Q1 |
| Comma error-spot | 2 | PP1 Q4; PP2 Q2 (missing comma after appositive) |
| Apostrophe (possession/contraction) error-spot | 3 | PP1 Q2, Q4; PP2 Q3, Q4, Q5 |
| Speech marks / brackets / hyphen-dash error-spot | 4 | PP1 Q1, Q3, Q5; PP2 Q1 (misplaced bracket) |
| 4-segment (A–D) or 5-way error-spot format, mixed types in one exercise | **[CATCH-ALL: format, not a single bullet — operationalises 1–4 together]** | PP1 Q1–5; PP2 Q1–5 |
| "N = no mistake" trap option | **[CATCH-ALL]** — the proofreading discipline is implied by testing 1–4 via error-spot, not named as its own bullet | PP1 Q13 (spelling N); PP2 Q4, Q14 (deliberate N-ambiguity items) |

### E2 · Spelling (bullets 5–7)

| Style / device | Bullet | Citation |
|---|---|---|
| Common spelling-rule misapplication (doubling, drop-e, suffixing) | 5 | PP1 Q11 (preferance), Q14 (undoutedly); PP2 Q12 (especialy), Q13 (desparation), Q15 (optitian) |
| UK-not-US spelling trap | 7 | PP1 Q12 (marvelous, US form used as the error) |
| Homophones/confusables (there/their, where/were, him/hymn) | 6 | **NOT EVIDENCED** — no PP1 or PP2 spelling item tests a homophone pair; both papers' spelling exercises are exclusively irregular/rule-based misspellings. See gap list below. |

### E3 · Grammar (bullets 8–13)

| Style / device | Bullet | Citation |
|---|---|---|
| Best-word cloze: article/determiner | 8 | PP1 P2 |
| Best-word cloze: preposition | 8 | PP1 Q8 |
| Best-word cloze: conjunction/subordinating conjunction | 8 | PP1 Q9; PP2 Q7 (Despite/Although/Since) |
| Best-word cloze: relative/interrogative pronoun (whose/who's/which/whom) | 8 | PP1 Q7; PP2 Q9, P2 |
| Identify shared part of speech across passage words (incl. word-class trap: nouns that look like verbs, "passes") | 8 | PP1 Q27, Q28; PP2 Q27 (adverbs), Q28 (nouns/trap words) |
| Verb tense best-word cloze | 9 | PP1 Q10 |
| Comparative form choice (farther/further, as…as) | 12 | PP1 Q6; PP2 Q8 |
| Contraction discipline (could've, never "could of") | 10 | PP2 Q6, Q10 |
| Identify story-opening structure / narrative device | 13 (or 19, style & form) | PP1 Q16 |
| Plurals beyond s/es, collective nouns (oxen/geese, herd/flock) | 11 | **NOT EVIDENCED** — no distinct question in PP1 or PP2 tests irregular plurals or collective nouns. TOPIC_MAP itself records "0 seen" for this topic. See gap list below. |

### E4 · Comprehension (bullets 14–19)

| Style / device | Bullet | Citation |
|---|---|---|
| Literal retrieval, line-referenced | 14 | PP1 Q23, Q24; PP2 Q18, Q21, Q23, Q24 |
| Precise phrase-extraction (exact word-count, "six-word phrase") | 14 | PP2 Q26 |
| Select-TWO-of-5 literal retrieval (paired-option answer format) | 14 **[format variant]** | PP2 Q17 |
| Inference: character motive / theme / title meaning | 15 | PP1 Q19, Q20, Q21, Q22 (why titled "The Conjurer's Revenge"); PP2 Q16, Q22 |
| Words-in-context synonym retrieval | 16 | PP1 P5, Q25, Q26; PP2 P5, Q25 |
| Effect-of-a-list language device | 17 **[CATCH-ALL — "language manipulated for effect" names no specific device list; this is exactly the worked example]** | PP1 Q18 |
| Figurative-language interpretation (imagery/metaphor of expression) | 17 | PP1 Q17 |
| Rhyme / verse structure / word play / dialect | 18 | **NOT EVIDENCED** — both PP1 and PP2 main-test passages are prose (fiction and non-fiction respectively); neither contains a poem or a verse-structure question. TOPIC_MAP itself flags that poetry evidence comes from "Catapult 3," which is explicitly insufficient under the Rule (Section D). See gap list below. |
| Kinds of writing / signposts / layout features (index, contents, glossary, subheadings) | 19 **[CATCH-ALL]** | **NOT EVIDENCED** as a dedicated question in either paper — closest proxy is PP1 Q16 (narrative-opening structure), which supports "style & form" but not the layout-feature/reference-skills half of the bullet. See gap list below. |

### M1 · Number (bullets 20–29)

| Style / device | Bullet | Citation |
|---|---|---|
| Digit place-value sense | 20 | Embedded across many items, no standalone question in either paper (TOPIC_MAP: "embedded everywhere"). |
| Mental/written addition & subtraction incl. decimals | 21 | PP1 Q29 (415 − 168); PP1 Q51, PP2 Q52/Q54 (decimal subtraction) |
| Multiplication array / repeated groups | 22 | PP1 Q8 (3 rows × 36) |
| Division with rounding-up in context | 22 | PP1 Q33 (litres→ml then divide, "containers" rounding logic) |
| Decimal ×÷ by 10/100/1000 and 2dp decimal arithmetic | 23 | PP2 Q49 (currency conversion, decimal multiplication) |
| Estimate to nearest 10/100 (nearest-value MCQ) | 24 | PP2 P8 |
| Fraction from a picture, simplify | 25 | PP1 Q32 |
| Fraction ↔ decimal ↔ percentage conversions & word problems | 26 | PP1 Q37 (25%→decimal), Q56 (fraction of remainder, multi-step); PP2 Q41 (percentages summing to 100), Q43 (fraction of class) |
| NOT-format fraction equivalence | 26 **[format variant]** | PP1 Q35; PP2 Q36 |
| Sequence continuation (interleaved/alternating pattern) | 27 | PP1 Q34 |
| Sequence generalisation to the Nth term | 27 | PP1 Q55 (30th term); PP2 Q47 (10th term, halving past zero) |
| Off-by-one / exclude-start-point trap in a repeating-interval problem | 27 (adjacent to 22) | PP2 Q44 (checkpoints every 10km, exclude start) |
| Factor-checking, NOT-format ("does NOT have both 3 and 7 as factors") | 28 **[borderline — factor-checking is adjacent to, not identical to, "prime, square, cube, triangular, indices"; treated here as the closest available proxy]** | PP2 Q50 |
| Function machines / letter-for-a-number algebra | 29 | **NOT EVIDENCED** — no M.NUM.FUNC/M.NUM.ALG-coded question in either paper. See gap list below. |

### M2 · Measurement (bullets 30–36)

| Style / device | Bullet | Citation |
|---|---|---|
| Metric unit conversion (cm↔m, l↔ml) inside a word problem | 30 | PP1 Q33, Q38; PP2 Q38 (bridge-height gap), Q54 (balance scale) |
| Reading an analogue clock | 31 | PP1 P6 |
| 24-hour timetable cross-reference, repeating pattern | 32 | PP1 Q45 (bus timetable); PP2 P6 (practice) |
| Calendar/month-boundary day-of-week extension | 32 | PP2 Q39 |
| Elapsed-time interval crossing the hour or midnight | 31/32 | PP1 Q52 (crossing the hour); PP2 Q53 (10:25pm→6:15am, crossing midnight) |
| Multi-step time subtraction (whole day minus multiple breaks) | 31/32 | PP1 Q44 |
| Temperature crossing zero into negatives | 33 | PP1 Q40; PP2 Q46 (analogue dial reading vs target) |
| Compound-shape perimeter comparison across several shapes | 34 | PP1 Q53; PP2 Q56 (algebraic perimeter, length = width+3) |
| Inverse-operation area problem (side length from given area) | 35 | PP1 Q46 (√64) |
| Scale & maps for distance | 36 | **NOT EVIDENCED** — no M.MEAS.SCALE-coded question in either paper. TOPIC_MAP itself keeps this topic deliberately small ("1 — spec-required"). See gap list below. |

### M3 · Shape & Space (bullets 37–42)

| Style / device | Bullet | Citation |
|---|---|---|
| 2-D shape/quadrilateral property identification | 37 | **NOT EVIDENCED** as a standalone question in either paper — no general M.SHAPE.2D code appears; only the symmetry (42) and coordinate (41) sub-skills are directly tested. See gap list below. |
| 3-D shape property recall (vertices/edges/faces) | 38 | PP2 Q55 (cuboid vertices) |
| Angles (acute/obtuse/reflex; parallel/perpendicular; triangle/quadrilateral internal angles) | 39 | **NOT EVIDENCED** — no M.SHAPE.ANG-coded question in either paper (PP2's own analysis explicitly notes this absence). See gap list below. |
| Turns & compass points | 40 | **NOT EVIDENCED** — no dedicated turns/compass question in either paper. See gap list below. |
| First-quadrant coordinate plotting / reflection / extrapolation | 41 | PP1 Q48 (reflection in horizontal mirror line); PP2 Q33 (extrapolate pattern to distant point K) |
| Line symmetry identification (incl. distractor lines that are not true symmetry) | 42 | PP1 Q31; PP2 Q30 |

### M4 · Money (bullets 43–44)

| Style / device | Bullet | Citation |
|---|---|---|
| Multi-step money word problem (price table, several add-ons) | 43 | PP1 Q41 (pizza+toppings+drinks); PP2 Q32 (three fair stalls) |
| Unit-price comparison ("per pen vs per pencil") | 43 | PP1 Q49 |
| NOT-format change/coin reasoning | 44 | PP1 Q36 |
| Coin-total / coin-value comparison in word form | 44 | PP2 Q37 (written number words for coin quantities), PP2 P7 |

### M5 · Chance (bullet 45)

| Style / device | Bullet | Citation |
|---|---|---|
| Probability excluding stated disliked/impossible options | 45 | PP1 Q42; PP2 Q45 |

### M6 · Data (bullets 46–49)

| Style / device | Bullet | Citation |
|---|---|---|
| Pictogram with symbol value that must be derived (not given directly) | 46 **[CATCH-ALL — "pictogram" is not itself named in the bullet's enumerated list (Venn/block/bar/bar-line/line); treated as the closest graph-family proxy]** | PP1 P7, Q30 |
| Bar chart requiring a sum across two categories (not a single read) | 46 | PP1 Q39 |
| Scatter/line graph point-value read | 46 | PP2 Q29 |
| Height-chart / unlabelled-scale-gradation reading | 46 | PP1 P10 |
| Dense multi-column table cross-reference / ranking by points across categories | 47 | PP1 Q50; PP2 Q35 (15-column table) |
| Mileage/distance-grid table cross-reference | 47 | PP1 Q54 |
| Missing-value-from-total table (subtract two known from a stated total) | 47 | PP2 Q51 |
| Pie chart interpretation | 48 | **NOT EVIDENCED** — no pie-chart question in either paper. |
| Mean calculation from a data list | 49 | PP2 Q40 (mean of 7 scores) |
| Mean-invariance conceptual trap ("all ages +3 in 3 years, does the mean change?") | 49 | PP1 Q47 |

### Gap list — spec bullets with ZERO citation in either official paper

These bullets are named in the spec (Section A) and therefore remain legitimate to teach *as written*, but they have **no official-paper operationalisation evidence** — meaning no catch-all extension beyond the bullet's own wording is currently justifiable for them. Building beyond the literal bullet text here on the strength of Catapult alone is exactly the situation the Rule (Section D) is designed to catch.

- Bullet 6 — homophones/confusables (E2.2)
- Bullet 11 — plurals beyond s/es, collective nouns (E3.4) — TOPIC_MAP itself records "0 seen"
- Bullet 18 — rhyme/verse structure/word play/dialect (E4.5) — TOPIC_MAP itself flags the substantive evidence as Catapult-only ("poems ARE main passages (Catapult 3)")
- Bullet 19 — layout features/reference skills half of "Kinds of Writing & Signposts" (E4.6)
- Bullet 20 — place value as a standalone question (M1.1) — embedded only, not directly tested
- Bullet 29 — function machines / letter-for-a-number algebra (M1.10)
- Bullet 36 — scale & maps for distance (M2.7) — TOPIC_MAP itself keeps this "spec-required, keep small"
- Bullet 37 — general 2-D shape/quadrilateral properties beyond symmetry (M3.1)
- Bullet 39 — angles & lines (M3.3)
- Bullet 40 — turns & compass (M3.4)
- Bullet 48 — pie charts (M6.3)

---

## D. THE RULE

**App content is legitimate if and only if it traces to:**

**(a)** a **named spec bullet** — one of the 49 bullets in Section A, used as written (its own enumerated terms, examples, and scope) — **or**

**(b)** a **spec catch-all bullet** (a bullet in Section A whose wording names a general capability rather than a closed, enumerated list — marked **[CATCH-ALL]** in Section C) **plus** an **official-paper citation** (PP1 or PP2, question number) showing how that catch-all is actually operationalised.

**Anything else is SUPERFLUOUS** — cut it or re-derive it before it ships.

**Worked example of a legitimate catch-all application (route (b)):** PP1 Q18 ("effect of a list of items in given lines") is not itself named anywhere in bullet 17 ("language manipulated for effect; imagery, simile, metaphor") — the bullet names imagery/simile/metaphor but not "effect of a list." Because PP1 Q18 is an *official* paper citation, "effect of a list" is legitimately in-canon as an operationalisation of bullet 17. An app quiz item asking "what effect does this list of three details create?" is legitimate content.

**Worked counter-example of SUPERFLUOUS content:** suppose a builder wants to add a quiz item testing "onomatopoeia" because it appears in Catapult paper 3's poem passage. Onomatopoeia is not named in any Section A bullet (the nearest bullet, 17, names imagery/simile/metaphor only — not sound-devices), and there is no PP1 or PP2 citation for it (Catapult is explicitly excluded as a standalone basis by the authority order at the top of this document). This content is SUPERFLUOUS: it should not ship, or must first be re-scoped to a term the bullet actually names (e.g. teach it as "imagery" if the example genuinely is imagery) or dropped entirely.

**Practical audit checklist for any content item:**
1. Find the specific claimed spec bullet number (1–49) from Section A.
2. Check whether that bullet's own wording, read literally, already covers the content. If yes → legitimate via route (a), stop here.
3. If the content goes beyond the bullet's literal wording (a new device, a new format, a new sub-skill), check Section C for a citation to PP1 or PP2 under that same bullet number.
4. Found a citation → legitimate via route (b). Not found → check the gap list. If the bullet is in the gap list, the content is unsupported and should be flagged SUPERFLUOUS or rewritten to stay within the bullet's literal wording.
5. A Catapult-only citation, on its own, never satisfies step 3 — it may only be used as a design idea to go and independently verify against PP1/PP2, never as the citation itself.

---

## Section sizes (for the caller)

- A: 49 numbered spec bullets (19 English + 30 Maths)
- B: 10 numbered exclusions
- C: ~70 style/device rows across 6 English + 6 Maths sub-regions, plus an 11-item gap list
- D: the rule, one worked example, one worked counter-example, a 5-step audit checklist
