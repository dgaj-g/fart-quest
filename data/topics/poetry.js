// FART QUEST topic: The Rhyme Reeds — poetry (Storybog)
// Authored content — implementation agents: read, never modify.
// Passage-skill topic (passageSkill:'verse'): battles draw tagged verse
// questions from the shared passage pool (data/passages/). No bank lives
// here — only the lesson's own mini-passage and its two 'try' questions.

const RULE = 'A verse is a paragraph of poetry; rhymes usually land at line-ends. Read a poem like a song: for story first, rhyme second.';

export default {
  id: 'poetry',
  name: 'The Rhyme Reeds',
  region: 'storybog',
  passageSkill: 'verse',
  tagline: 'Everybody hunts for the rhymes first. The real detectives read for the STORY first.',

  creature: {
    id: 'rhymin-simon',
    name: "Rhymin' Simon",
    rarity: 'rare',
    image: 'assets/monsters/rhymin-simon.png',
    bio: "Simon is a small pond frog with an enormous problem: he can only speak in quatrains. Ask him the time and you'll get four rhyming lines back — exhausting at parties, brilliant in the Reeds.",
    factSneak: 'A poem is built from verses (a verse is simply a paragraph of poetry), and its rhymes almost always land on the LAST word of a line — but the story always matters more than the rhyme.',
  },

  weapon: {
    id: 'verse-decoder',
    name: 'The Verse Decoder',
    tagline: 'Read the tale a poem is telling before you go hunting for its rhymes.',
    rule: RULE,
    example: 'A poem about a stormy night might rhyme "roar" with "shore" — but the rhyme is just the tune. The STORY is that something is happening at the shore in a storm. Get the story first, and the rhyme falls into place.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-poetry',
      text: "Ribbit ribbit — greetings, brave nose-soldier! I am Rhymin' Simon, and I speak ONLY in verse, so bear with me. Every child who meets a poem in an exam makes the SAME mistake: they go hunting for rhymes straight away and forget the poem is actually telling them a story. Today you learn my secret: story first, rhyme second. Ribbit!",
    },
    {
      type: 'show',
      title: 'A Poem About Me (Naturally)',
      html: `<p>Simon only ever writes about one subject: himself. Read this one slowly, like a song, before you hunt for a single rhyme.</p>
<p><i>Verse 1</i></p>
<ol class="mini-passage">
<li>Down by the reeds where the still water gleams,</li>
<li>Simon the frog sits and dreams up his rhyme.</li>
<li>He croaks out his verses in bubbles and streams,</li>
<li>And never stops talking — not one single time.</li>
</ol>
<p><i>Verse 2</i></p>
<ol class="mini-passage" start="5">
<li>He rhymed at the wedding, in front of the crowd,</li>
<li>He rhymed through the breakfast and rhymed through the night.</li>
<li>The rest of the pond sighs, embarrassed and loud —</li>
<li>But secretly love him: his rhymes feel so right.</li>
</ol>
<p>Eight lines, two verses. Keep this poem in your head — every question from here on points at these eight lines.</p>`,
    },
    {
      type: 'talk',
      text: "First things first: a <b>verse</b> is just a paragraph of poetry — a group of lines that belong together, same as a paragraph groups sentences in a story. My poem has TWO verses of four lines each. And notice something: the rhymes don't land in the middle of a line, all higgledy-piggledy — they land on the very LAST word of each line, almost every time.",
    },
    {
      type: 'show',
      title: 'Watch Me Work the Rhyme',
      html: `<p>Look at Verse 1 again. Read only the LAST word of each line:</p>
<div class="law-scroll">📜 Line 1 ends: "gleams" &nbsp;·&nbsp; Line 2 ends: "rhyme" &nbsp;·&nbsp; Line 3 ends: "streams" &nbsp;·&nbsp; Line 4 ends: "time"</div>
<p>"Gleams" and "streams" chime together (lines 1 and 3). "Rhyme" and "time" chime together (lines 2 and 4) — two matching pairs, found simply by checking which line-end words actually rhyme. But notice: I only found them by checking the END of each line, never a word from the middle.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'po-try-1', topicId: 'poetry', tier: 1, format: 'mcq5',
        stem: 'In <b>Verse 1</b> (lines 1–4), which word rhymes with "gleams" at the end of line 1?',
        options: [
          { text: 'streams', misconception: null },
          { text: 'rhyme', misconception: 'wrong-rhyme-pair' },
          { text: 'time', misconception: 'wrong-rhyme-pair' },
          { text: 'frog', misconception: 'mid-line-not-end' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Rhymes land at line-ENDS — check only the very last word of each line in Verse 1.',
          '"Gleams" is line 1\'s last word. Which OTHER line-ending word chimes with it — not just any word from the verse?',
        ],
        explain: {
          rule: RULE,
          worked: 'Line 3 ends with "streams", which chimes exactly with "gleams" at the end of line 1 — that\'s the matching rhyme pair (lines 1 and 3).',
          whyWrong: {
            'rhyme': 'That\'s the end of line 2 — it pairs with "time" in line 4, not with "gleams". Different rhyme pair entirely.',
            'time': 'That\'s the end of line 4, part of the OTHER rhyme pair (with "rhyme") — not the one matching "gleams".',
            'frog': '"Frog" sits in the MIDDLE of line 2, not at a line-end — rhymes are hunted at line-ends only.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'The Story-First Trap',
      html: `<p>Here's where children lose easy marks: they get so excited spotting rhymes that they stop actually READING what the poem is saying. Rhyme-hunting is only step two. Step one is always: what is this poem actually TELLING me?</p>
<p>Read Verse 2 again, properly, like a story: <i>"He rhymed at the wedding, in front of the crowd, he rhymed through the breakfast and rhymed through the night. The rest of the pond sighs, embarrassed and loud — but secretly love him: his rhymes feel so right."</i> That's not just rhyming sounds — that's telling you WHERE Simon rhymes (everywhere) and HOW the pond really feels about it (embarrassed, but secretly fond). Miss that, and you'll lose marks on any question that asks about the STORY, even if you can spot every rhyme in the poem.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'po-try-2', topicId: 'poetry', tier: 1, format: 'mcq5',
        stem: 'According to <b>lines 1–2</b>, where does Simon sit and dream up his rhymes?',
        options: [
          { text: 'By the reeds, where the still water gleams', misconception: null },
          { text: 'At the wedding, in front of the crowd', misconception: 'wrong-verse' },
          { text: 'Through the whole of the night', misconception: 'when-not-where' },
          { text: 'On top of the highest hill', misconception: 'not-in-passage' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Don\'t rhyme-hunt yet — read lines 1 and 2 like a sentence and ask what they\'re actually SAYING.',
          'Line 1 names the exact place. Go back and read it slowly, word for word.',
        ],
        explain: {
          rule: RULE,
          worked: 'Lines 1–2 read: "Down by the reeds where the still water gleams, Simon the frog sits and dreams up his rhyme." The place is named exactly — by the reeds, where the still water gleams.',
          whyWrong: {
            'At the wedding, in front of the crowd': 'That\'s from Verse 2, line 5 — a different part of the poem describing a different moment.',
            'Through the whole of the night': 'That answers WHEN Simon rhymes (from Verse 2, line 6), not WHERE he sits and dreams.',
            'On top of the highest hill': 'A hill is never mentioned anywhere in the poem — that answer isn\'t written down at all.',
          },
        },
      },
    },
    {
      type: 'talk',
      text: "You've got it, nose-soldier! Two verses, eight lines, one golden order: read for the STORY first — what's actually happening, who feels what — and only THEN go hunting the rhymes at each line's end. Do it backwards, rhyme first, and you'll answer a completely different question than the one being asked. Ribbit, and well sniffed!",
    },
    { type: 'anim', anim: 'poetry' },
    { type: 'weapon' },
  ],

  tips: [
    'A verse is a paragraph of poetry — lines grouped together, just like sentences grouped into a paragraph.',
    'Rhymes almost always land on the LAST word of a line — check line-ends first, never a word from the middle.',
    'Read a poem like a song: for STORY first (what\'s happening, who feels what), rhyme second.',
    'Rhymes don\'t have to be next-door neighbours — line 1 might rhyme with line 3, not line 2. Check every line-end against every other line-end, not just the one right below it.',
    'Decoy answers often borrow a real line-ending word from a DIFFERENT verse — always check which verse the question is actually asking about.',
    'If a question asks WHERE or WHO, that answer is a fact stated in the story part of the poem — don\'t confuse it with a rhyme word that merely sounds similar.',
  ],
};
