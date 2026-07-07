// FART QUEST topic: Simile Slough — writers-tricks (Storybog)
// Authored content — implementation agents: read, never modify.
// Passage-skill topic (passageSkill:'lang'): battles draw tagged language/
// writer's-craft questions from the shared passage pool (data/passages/).
// No bank lives here — only the lesson's own mini-passage and its two
// 'try' questions.

const RULE = "A simile compares with like or as; a metaphor says it IS; a list piles things up to overwhelm you — always ask what EFFECT it has.";

export default {
  id: 'writers-tricks',
  name: 'Simile Slough',
  region: 'storybog',
  passageSkill: 'lang',
  tagline: 'A good writer never just tells you it was scary — they trick you into feeling it.',

  creature: {
    id: 'simile-emily',
    name: 'Simile Emily',
    rarity: 'rare',
    image: 'assets/monsters/simile-emily.png',
    bio: "Emily cannot describe ANYTHING plainly — she's as sneaky as a fox, as brave as a lion, and, by her own admission, as subtle as a brick. She only ever speaks in tricks, and she wants you spotting every single one.",
    factSneak: "A simile compares using 'like' or 'as' (fast AS a cheetah); a metaphor is bolder and just SAYS it IS (he WAS a rocket); a list piles up detail to overwhelm you. All three exist to create an EFFECT on the reader, not just to sound fancy.",
  },

  weapon: {
    id: 'trick-detector',
    name: 'The Trick Detector',
    tagline: "Spot the trick — then ask what it's doing to YOU, the reader.",
    rule: RULE,
    example: 'Saying the sea was "like a monster" (simile) is sneaky. Saying the sea WAS "a monster" (metaphor), with no comparing word at all, hits even harder — it dares you to believe it.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-writerstricks',
      text: "Psssst — over here, nose-soldier. I'm Simile Emily, and I never say anything plainly if I can help it. Writers are exactly the same. They don't just write \"it was scary\" and leave it there — that's boring! They TRICK you into feeling scared, using three sneaky devices. Today you learn to catch every single one, red-handed.",
    },
    {
      type: 'show',
      title: 'The Three Sneaky Tricks',
      html: `<p>Here are Emily's three favourite tricks. Learn to spot the SIGNAL for each one:</p>
<ul>
<li><b>SIMILE</b> — compares two things using the word <b>like</b> or <b>as</b>. "The wind howled <i>like</i> a wolf."</li>
<li><b>METAPHOR</b> — no comparing word at all. It just boldly claims one thing <b>IS</b> another. "The wind <i>was</i> a wolf."</li>
<li><b>LIST</b> — piles up three or more things in a row to overwhelm the reader with detail. "Rain, hail, thunder and lightning."</li>
</ul>
<p>Spotting the trick is only HALF the job. The exam always wants the other half too: <b>what EFFECT does it create?</b> Does it make something feel bigger, scarier, faster, sadder? That's the real mark.</p>`,
    },
    {
      type: 'show',
      title: 'The Night The Storm Came',
      html: `<p>Here's a fresh mini-passage. Read it once, slowly — Emily has hidden all three tricks inside it.</p>
<ol class="mini-passage">
<li>The storm arrived just after midnight, without warning or mercy.</li>
<li>Rain hammered the rooftops like a thousand tiny drummers.</li>
<li>The wind howled as loud as a starving wolf.</li>
<li>Down at the harbour, the sea was a monster, thrashing and clawing at the rocks.</li>
<li>Boats rocked, ropes snapped, and lanterns swung wildly on their hooks.</li>
<li>Mrs Okafor gripped the door frame and stared out at the chaos.</li>
<li>Rain, hail, thunder and lightning all struck the village at once.</li>
<li>The old lighthouse stood like a lonely soldier against the dark.</li>
<li>By dawn, the storm had vanished as quietly as it came.</li>
</ol>`,
    },
    {
      type: 'talk',
      text: "Go on then — read it again with your Trick Detector switched on. Where's the SIMILE? Where's the bold, no-comparing-word METAPHOR? And where has the writer piled things up into a LIST to overwhelm you? I've counted at least five tricks in there…",
    },
    {
      type: 'show',
      title: "Emily's Trick-By-Trick Breakdown",
      html: `<p>Let's walk it together, trick by trick, and — most importantly — the EFFECT each one creates:</p>
<ul>
<li><b>Line 2</b> — "like a thousand tiny drummers" is a SIMILE. Effect: it lets you practically HEAR the rain's fast, rhythmic battering, because drumming is a sound you already know.</li>
<li><b>Line 3</b> — "as loud as a starving wolf" is another SIMILE. Effect: comparing the wind to something hungry and dangerous makes it feel alive and threatening, not just noisy.</li>
<li><b>Line 4</b> — "the sea <b>was</b> a monster" is a METAPHOR — no "like", no "as", just a flat, bold claim. Effect: it's stronger than a simile because it doesn't just compare the sea to a monster, it dares you to believe the sea actually IS one, thrashing and clawing.</li>
<li><b>Line 5 and line 7</b> — "Boats rocked, ropes snapped, and lanterns swung" and "Rain, hail, thunder and lightning" are LISTS. Effect: piling up four things in one breath makes the chaos feel non-stop and overwhelming — exactly like a real storm hitting you from every direction at once.</li>
<li><b>Line 8</b> — "like a lonely soldier" is a SIMILE. Effect: it makes the lighthouse feel brave and isolated, standing firm while everything else is thrown about.</li>
</ul>
<div class="law-scroll">📜 <b>THE TRICK DETECTOR LAW:</b> ${RULE}</div>`,
    },
    {
      type: 'try',
      q: {
        id: 'wt-try-1', topicId: 'writers-tricks', tier: 1, format: 'mcq5',
        lineRef: '3',
        stem: 'Line 3 describes the wind as howling "as loud as a starving wolf". What EFFECT does this simile create?',
        options: [
          { text: 'It makes the wind feel dangerous and alive, not just noisy', misconception: null },
          { text: 'It tells us that a real wolf was actually howling outside', misconception: 'plausible-misreading' },
          { text: 'It proves that every storm always sounds exactly like a wolf', misconception: 'absolute-bait' },
          { text: 'It is a metaphor, because it says the wind WAS a wolf', misconception: 'wrong-device' },
          { text: 'It tells us what time of day the storm arrived', misconception: 'clearly-wrong' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Spot the signal word first — "as loud AS a starving wolf" — that\'s the mark of a simile, not a metaphor.',
          'Now ask Emily\'s real question: what does comparing the wind to a hungry, dangerous animal make YOU feel about it?',
        ],
        explain: {
          rule: RULE,
          worked: 'The word "as" signals a simile, comparing the wind\'s howl to a starving wolf. The effect: a wolf is hungry and dangerous, so the comparison makes the wind feel threatening and alive, not just a loud noise.',
          whyWrong: {
            'It tells us that a real wolf was actually howling outside': 'The passage never mentions a real wolf anywhere — this is a comparison, not a fact about what was actually there.',
            'It proves that every storm always sounds exactly like a wolf': 'Watch the trap word "always" — this simile is describing THIS wind, in THIS passage, not making a rule about every storm ever.',
            'It is a metaphor, because it says the wind WAS a wolf': 'Look again — the line uses "as loud AS", a comparing word. A metaphor would drop that word and just say "the wind was a wolf".',
            'It tells us what time of day the storm arrived': 'That information is in line 1 ("just after midnight"), not in this simile about the wind\'s sound.',
          },
        },
      },
    },
    {
      type: 'try',
      q: {
        id: 'wt-try-2', topicId: 'writers-tricks', tier: 2, format: 'mcq5',
        lineRef: '7',
        stem: 'In line 7, the writer lists "Rain, hail, thunder and lightning" all in one line instead of describing each one in its own sentence. What EFFECT does this list create?',
        options: [
          { text: 'It piles everything up at once, making the storm feel overwhelming and non-stop', misconception: null },
          { text: 'It shows that only one of these four things actually happened that night', misconception: 'plausible-misreading' },
          { text: 'It proves this storm was the worst storm that has ever happened anywhere', misconception: 'absolute-bait' },
          { text: 'It tells us the exact order the weather arrived in, one after another', misconception: 'clearly-wrong' },
          { text: 'It is a metaphor, because it compares the storm to a monster', misconception: 'wrong-device' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Count how many separate things are crammed into this one line — that pile-up IS the trick. What\'s that device called?',
          "Now think like Emily: why bunch four things into one breath instead of four calm sentences? What does that do to how the moment FEELS?",
        ],
        explain: {
          rule: RULE,
          worked: 'Four things — rain, hail, thunder, lightning — are piled into a single list rather than spread across separate sentences. That pile-up is the whole effect: it makes the storm feel like it\'s attacking from every direction at once, non-stop and overwhelming.',
          whyWrong: {
            'It shows that only one of these four things actually happened that night': 'The line names all four as happening together ("all struck the village at once") — a list stacks things UP, it doesn\'t narrow them down to one.',
            'It proves this storm was the worst storm that has ever happened anywhere': 'Watch the trap word "ever" — the passage only describes THIS storm, in THIS village; it makes no claim about every storm everywhere.',
            'It tells us the exact order the weather arrived in, one after another': 'The line says these things struck "all at once" — the whole point of this list is togetherness, not a step-by-step order.',
            'It is a metaphor, because it compares the storm to a monster': 'That monster metaphor is back in line 4, about the sea — this line in line 7 is a list of four separate things, with no "is" claim about the storm at all.',
          },
        },
      },
    },
    {
      type: 'talk',
      text: "See how it works now? Spot the SIGNAL — like/as for a simile, a flat IS for a metaphor, three-or-more things piled up for a list — and then always, ALWAYS ask the real question: what EFFECT is this having on me, the reader? Get that habit into your bones and Emily's tricks will never catch you out again.",
    },
    { type: 'weapon' },
  ],

  tips: [
    "A simile compares using like or as (fast AS a cheetah). A metaphor is bolder — no comparing word, it just says something IS another thing (he WAS a rocket).",
    "A metaphor usually feels stronger than a simile, because it doesn't just compare — it flatly claims the thing IS something else.",
    "A list piles up three or more things in a row to overwhelm the reader — the effect is usually 'too much, all at once', mirroring chaos or excitement.",
    "Spotting the device is only half the marks. Always finish with the EFFECT: what feeling or idea is the writer trying to create in YOU?",
    "Beware answers that turn a writer's trick into a literal fact (a 'real wolf', a 'real monster') — a simile or metaphor is a comparison, not an event that actually happened.",
    "Watch for trap words like 'always', 'never', 'every' or 'ever' in effect-questions — a single simile or list describes THIS moment, not a permanent rule.",
  ],
};
