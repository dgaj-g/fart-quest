// FART QUEST topic: The Noun Kennels (Grammar Grotto)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'parts-of-speech',
  name: 'The Noun Kennels',
  region: 'grammar-grotto',
  bankTopic: true,
  tagline: 'Every word has a job. The Hound only fetches nouns — but he’ll happily sniff out the rest for you.',

  creature: {
    id: 'noun-hound',
    name: 'The Noun Hound',
    rarity: 'rare',
    image: 'assets/monsters/the-noun-hound.png',
    bio: 'The Noun Hound bounds through the Kennels fetching only three things: people, places and things. Throw him a verb by mistake and he’ll just stare at you, deeply unimpressed.',
    factSneak: 'A noun NAMES a person, place or thing — nothing else. If it can’t answer “who?” or “what?”, the Hound won’t fetch it.',
  },

  weapon: {
    id: 'word-job-scanner',
    name: 'The Word-Job Scanner',
    tagline: 'Never get fooled by a word wearing a disguise again.',
    rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
    example: 'In “The <b>brave</b> hound barked,” brave answers WHAT KIND of hound? Job = <b>adjective</b>.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-partsofs',
      text: 'Right, my nose-soldier, listen closely! Every single word in a sentence has got a <b>JOB</b> to do. Some words NAME things, some words DO things, some words DESCRIBE things — and some are just glue holding the whole gang together. Spot the job, and you’ll never confuse a word again!',
    },
    {
      type: 'show',
      title: 'The Big Four Word Jobs',
      html: `<p>Ask this ONE question about any word: <b>“What JOB is it doing in THIS sentence?”</b></p>
<ul>
<li><b>Noun</b> — names a person, place or thing. <i>Job-question: who or what?</i> (dog, playground, Tuesday)</li>
<li><b>Verb</b> — the doing or being word. <i>Job-question: what is happening?</i> (kicks, sleeps, is)</li>
<li><b>Adjective</b> — describes a noun. <i>Job-question: what kind?</i> (muddy, giant, three)</li>
<li><b>Adverb</b> — describes a verb, usually HOW, WHEN or WHERE. <i>Job-question: how, when, where?</i> (loudly, yesterday, outside)</li>
</ul>
<p>“The <b>muddy</b> dog <b>barked</b> <b>loudly</b> at the <b>postman</b>.” Muddy describes the dog (adjective). Barked is the doing word (verb). Loudly tells us HOW it barked (adverb). Postman is a thing being named (noun).</p>`,
    },
    {
      type: 'show',
      title: 'The Glue Words',
      html: `<p>Three more workers keep the sentence gang stuck together:</p>
<ul>
<li><b>Pronoun</b> — stands IN for a noun so we don’t repeat it. <i>Job-question: who or what am I replacing?</i> (he, she, it, they)</li>
<li><b>Preposition</b> — shows WHERE or WHEN something is. <i>Job-question: where or when, compared to what?</i> (under, before, during)</li>
<li><b>Conjunction</b> — joins two ideas together. <i>Job-question: what is this word connecting?</i> (and, but, because)</li>
</ul>
<p>“<b>Jarlath</b> hid <b>under</b> the table <b>because</b> <b>he</b> heard a parp.” Under shows WHERE (preposition). Because joins the two ideas (conjunction). He stands in for Jarlath (pronoun).</p>`,
    },
    {
      type: 'talk',
      text: 'Here’s the sneaky bit, young stinker: the SAME word can switch jobs depending on the sentence! You can’t just memorise a word — you’ve got to catch it in the ACT.',
    },
    {
      type: 'show',
      title: 'Same Word, Different Job',
      html: `<p>Watch this word: <b>park</b>.</p>
<p>“Jarlath kicked the ball across the <b>park</b>.” — here park NAMES a place. Job-question: what? → It’s a <b>noun</b>.</p>
<p>“Dad will <b>park</b> the car near the smelly bins.” — here park is the DOING word. Job-question: what’s happening? → It’s a <b>verb</b>.</p>
<div class="law-scroll">📜 Same spelling, different jobs. NEVER trust the word alone — always ask what job it’s doing HERE, in THIS sentence.</div>`,
    },
    {
      type: 'try',
      q: {
        id: 'pos-try-1', topicId: 'parts-of-speech', tier: 1, format: 'mcq5',
        stem: 'In “The three goblins hid behind the smelly bin,” what job is the word <b>smelly</b> doing?',
        options: [
          { text: 'adjective', misconception: null },
          { text: 'noun', misconception: 'confused-with-noun' },
          { text: 'verb', misconception: 'confused-with-verb' },
          { text: 'adverb', misconception: 'confused-with-adverb' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Ask the job-question: what KIND of bin is it?',
          'Smelly describes the bin — that’s the adjective’s job.',
        ],
        explain: {
          rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
          worked: 'Smelly answers “what kind of bin?” — it describes a noun, so it’s an adjective.',
          whyWrong: {
            noun: 'A noun would NAME the bin itself — smelly only describes it.',
            verb: 'There’s no doing happening in the word smelly.',
            adverb: 'An adverb would describe a VERB — smelly is describing the bin, a noun.',
          },
        },
      },
    },
    {
      type: 'try',
      q: {
        id: 'pos-try-2', topicId: 'parts-of-speech', tier: 2, format: 'mcq5',
        stem: 'In “Jarlath will watch the film after tea, then go to bed,” what job is <b>watch</b> doing HERE?',
        options: [
          { text: 'verb', misconception: null },
          { text: 'noun', misconception: 'confused-context-noun' },
          { text: 'adjective', misconception: 'confused-with-adjective' },
          { text: 'adverb', misconception: 'confused-with-adverb' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Watch can be tricky — it means a wristwatch sometimes, and “to look at” other times.',
          'Here it comes straight after “will” — what’s happening? He will WATCH. That’s the doing word.',
        ],
        explain: {
          rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
          worked: '“Will watch” tells us what Jarlath is going to DO — so watch is the verb here, even though it can be a noun (“my watch stopped”) in other sentences.',
          whyWrong: {
            noun: 'That’s true in a DIFFERENT sentence (“my watch stopped”) — but here it’s the doing word.',
            adjective: 'Watch isn’t describing anything here.',
            adverb: 'Watch isn’t telling us HOW something happens here.',
          },
        },
      },
    },
    { type: 'weapon' },
  ],

  tips: [
    'Ask the JOB question, not “what word is this” — the SAME word can do different jobs in different sentences.',
    'Noun = names a person, place or thing. Job-question: who or what?',
    'Verb = the doing or being word. Job-question: what’s happening?',
    'Adjective describes a noun (what kind?); adverb describes a verb (how, when or where?).',
    'Pronoun stands in for a noun (he, she, it, they); preposition shows where or when (under, before, during); conjunction joins ideas (and, but, because).',
    'Watch for the context-shift trap: words like “park” or “watch” change job depending on the sentence around them.',
    'Read the WHOLE sentence before deciding — the job is decided by the words around it, not the word alone.',
  ],

  bank: [
    // ---------- TIER 1 (12) — straightforward "identify the word class" mcq5 ----------
    {
      id: 'parts-of-speech-t1-01', tier: 1, format: 'mcq5',
      stem: 'Which word is the NOUN in “The goalkeeper dived bravely for the muddy ball”?',
      options: [
        { text: 'goalkeeper', misconception: null },
        { text: 'dived', misconception: 'confused-with-verb' },
        { text: 'bravely', misconception: 'confused-with-adverb' },
        { text: 'muddy', misconception: 'confused-with-adjective' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Ask: which word NAMES a person, place or thing?',
        'Which word answers “who is diving?”',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'Goalkeeper answers “who?” — it names a person, so it’s the noun.',
        whyWrong: {
          dived: 'That’s the doing word — a verb, not a noun.',
          bravely: 'That describes HOW he dived — an adverb.',
          muddy: 'That describes the ball — an adjective.',
        },
      },
    },
    {
      id: 'parts-of-speech-t1-02', tier: 1, format: 'mcq5',
      stem: 'Which word is the VERB in “Two hungry dogs chased the frisbee across the field”?',
      options: [
        { text: 'chased', misconception: null },
        { text: 'hungry', misconception: 'confused-with-adjective' },
        { text: 'across', misconception: 'confused-with-preposition' },
        { text: 'frisbee', misconception: 'confused-with-noun' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Ask: what is HAPPENING in this sentence?',
        'What are the dogs doing to the frisbee?',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'Chased is the doing word — it tells us what the dogs did.',
        whyWrong: {
          hungry: 'That describes the dogs — an adjective, not a doing word.',
          across: 'That shows WHERE the frisbee travelled — a preposition.',
          frisbee: 'That names the thing being chased — a noun.',
        },
      },
    },
    {
      id: 'parts-of-speech-t1-03', tier: 1, format: 'mcq5',
      stem: 'Which word is the ADJECTIVE in “The enormous spider crawled slowly across the ceiling”?',
      options: [
        { text: 'enormous', misconception: null },
        { text: 'crawled', misconception: 'confused-with-verb' },
        { text: 'slowly', misconception: 'confused-with-adverb' },
        { text: 'ceiling', misconception: 'confused-with-noun' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Ask: what KIND of spider is it?',
        'Which word describes the noun “spider”?',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'Enormous answers “what kind of spider?” — it describes a noun, so it’s an adjective.',
        whyWrong: {
          crawled: 'That’s the doing word — a verb.',
          slowly: 'That tells us HOW it crawled — an adverb.',
          ceiling: 'That names the place — a noun.',
        },
      },
    },
    {
      id: 'parts-of-speech-t1-04', tier: 1, format: 'mcq5',
      stem: 'Which word is the ADVERB in “Whiffbeard cheerfully announced the smelly winner of the contest”?',
      options: [
        { text: 'cheerfully', misconception: null },
        { text: 'announced', misconception: 'confused-with-verb' },
        { text: 'smelly', misconception: 'confused-with-adjective' },
        { text: 'winner', misconception: 'confused-with-noun' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Ask: HOW did Whiffbeard announce it?',
        'Which word describes the verb “announced”?',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'Cheerfully answers “how did he announce it?” — it describes the verb, so it’s an adverb.',
        whyWrong: {
          announced: 'That’s the doing word itself — a verb.',
          smelly: 'That describes the winner — an adjective.',
          winner: 'That names the person — a noun.',
        },
      },
    },
    {
      id: 'parts-of-speech-t1-05', tier: 1, format: 'mcq5',
      stem: 'Which word is the PRONOUN in “Jarlath found the ball, so he kicked it towards the goal”?',
      options: [
        { text: 'he', misconception: null },
        { text: 'found', misconception: 'confused-with-verb' },
        { text: 'ball', misconception: 'confused-with-noun' },
        { text: 'towards', misconception: 'confused-with-preposition' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Ask: which word stands IN for a noun, so we don’t say the name again?',
        'Who kicked the ball? The sentence uses a short word instead of saying “Jarlath” again.',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'He replaces the name “Jarlath” so it doesn’t repeat — that’s a pronoun’s job.',
        whyWrong: {
          found: 'That’s the doing word — a verb.',
          ball: 'That names the thing — a noun.',
          towards: 'That shows WHERE it was kicked — a preposition.',
        },
      },
    },
    {
      id: 'parts-of-speech-t1-06', tier: 1, format: 'mcq5',
      stem: 'Which word is the PREPOSITION in “The scared stinkling hid quickly under the old bench”?',
      options: [
        { text: 'under', misconception: null },
        { text: 'hid', misconception: 'confused-with-verb' },
        { text: 'quickly', misconception: 'confused-with-adverb' },
        { text: 'scared', misconception: 'confused-with-adjective' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Ask: which word shows WHERE the stinkling is hiding?',
        'It links the hiding place to the bench.',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'Under shows WHERE the stinkling hid, compared to the bench — that’s a preposition.',
        whyWrong: {
          hid: 'That’s the doing word — a verb.',
          quickly: 'That tells us HOW it hid — an adverb.',
          scared: 'That describes the stinkling — an adjective.',
        },
      },
    },
    {
      id: 'parts-of-speech-t1-07', tier: 1, format: 'mcq5',
      stem: 'Which word is the CONJUNCTION in “Jarlath wanted to play outside, but the rain would not stop”?',
      options: [
        { text: 'but', misconception: null },
        { text: 'wanted', misconception: 'confused-with-verb' },
        { text: 'outside', misconception: 'confused-with-adverb' },
        { text: 'rain', misconception: 'confused-with-noun' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Ask: which word JOINS two ideas together?',
        'It connects “wanted to play outside” with “the rain wouldn’t stop”.',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'But joins the two ideas of the sentence together — that’s a conjunction’s job.',
        whyWrong: {
          wanted: 'That’s the doing word — a verb.',
          outside: 'That tells us WHERE he wanted to play — an adverb.',
          rain: 'That names the thing — a noun.',
        },
      },
    },
    {
      id: 'parts-of-speech-t1-08', tier: 1, format: 'mcq5',
      stem: 'Which word is the NOUN in “The teacher collected every muddy welly at the door”?',
      options: [
        { text: 'welly', misconception: null },
        { text: 'collected', misconception: 'confused-with-verb' },
        { text: 'muddy', misconception: 'confused-with-adjective' },
        { text: 'at', misconception: 'confused-with-preposition' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Ask: which word NAMES a thing?',
        'What did the teacher collect?',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'Welly names the thing collected — it’s the noun.',
        whyWrong: {
          collected: 'That’s the doing word — a verb.',
          muddy: 'That describes the welly — an adjective.',
          at: 'That shows WHERE, linking to the door — a preposition.',
        },
      },
    },
    {
      id: 'parts-of-speech-t1-09', tier: 1, format: 'mcq5',
      stem: 'Which word is the VERB in “Whiffbeard sniffed the air and grinned mischievously at the mess”?',
      options: [
        { text: 'grinned', misconception: null },
        { text: 'mischievously', misconception: 'confused-with-adverb' },
        { text: 'mess', misconception: 'confused-with-noun' },
        { text: 'and', misconception: 'confused-with-conjunction' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Ask: what is Whiffbeard DOING to his face?',
        'Which word shows the action, not the joining word “and”?',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'Grinned tells us what Whiffbeard did — it’s the verb.',
        whyWrong: {
          mischievously: 'That tells us HOW he grinned — an adverb.',
          mess: 'That names the thing — a noun.',
          and: 'That joins “sniffed” and “grinned” together — a conjunction.',
        },
      },
    },
    {
      id: 'parts-of-speech-t1-10', tier: 1, format: 'mcq5',
      stem: 'Which word is the ADJECTIVE in “A tiny stinkling squeezed through the narrow castle gate”?',
      options: [
        { text: 'narrow', misconception: null },
        { text: 'squeezed', misconception: 'confused-with-verb' },
        { text: 'gate', misconception: 'confused-with-noun' },
        { text: 'through', misconception: 'confused-with-preposition' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Ask: what KIND of gate is it?',
        'Which word describes the noun “gate”, not the stinkling?',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'Narrow answers “what kind of gate?” — it’s the adjective.',
        whyWrong: {
          squeezed: 'That’s the doing word — a verb.',
          gate: 'That names the thing — a noun.',
          through: 'That shows WHERE the stinkling squeezed — a preposition.',
        },
      },
    },
    {
      id: 'parts-of-speech-t1-11', tier: 1, format: 'mcq5',
      stem: 'Which word is the ADVERB in “The goalkeeper punched the ball away just before the whistle”?',
      options: [
        { text: 'away', misconception: null },
        { text: 'punched', misconception: 'confused-with-verb' },
        { text: 'ball', misconception: 'confused-with-noun' },
        { text: 'before', misconception: 'confused-with-preposition' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Ask: WHERE did the ball go when he punched it?',
        'Which word describes the verb “punched”?',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'Away tells us WHERE the ball went — it describes the verb, so it’s an adverb.',
        whyWrong: {
          punched: 'That’s the doing word — a verb.',
          ball: 'That names the thing — a noun.',
          before: 'That links the punch to the whistle in time — a preposition.',
        },
      },
    },
    {
      id: 'parts-of-speech-t1-12', tier: 1, format: 'mcq5',
      stem: 'Which word is the PRONOUN in “The dragon breathed fire, and they all ran for cover”?',
      options: [
        { text: 'they', misconception: null },
        { text: 'breathed', misconception: 'confused-with-verb' },
        { text: 'fire', misconception: 'confused-with-noun' },
        { text: 'for', misconception: 'confused-with-preposition' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Ask: which word stands IN for the group of people, instead of naming them?',
        'Who ran for cover? The sentence uses a short word instead of a list of names.',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'They stands in for the group of people — that’s a pronoun’s job.',
        whyWrong: {
          breathed: 'That’s the doing word — a verb.',
          fire: 'That names the thing — a noun.',
          for: 'That links “ran” to “cover” — a preposition.',
        },
      },
    },

    // ---------- TIER 2 (12) — 6 context-shift mcq5 + 6 clozebox preposition/conjunction ----------
    {
      id: 'parts-of-speech-t2-01', tier: 2, format: 'mcq5',
      stem: 'In “Jarlath will watch the film after tea, then go to bed,” what job is <b>watch</b> doing HERE?',
      options: [
        { text: 'verb', misconception: null },
        { text: 'noun', misconception: 'confused-context-noun' },
        { text: 'adjective', misconception: 'confused-with-adjective' },
        { text: 'adverb', misconception: 'confused-with-adverb' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Watch can mean a wristwatch OR “to look at” — which meaning fits here?',
        'It follows “will” — what is Jarlath going to DO?',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: '“Will watch” tells us what Jarlath is about to DO — so watch is the verb here.',
        whyWrong: {
          noun: 'That’s true in a different sentence (“my watch stopped”) — not here.',
          adjective: 'Watch isn’t describing anything in this sentence.',
          adverb: 'Watch doesn’t tell us HOW something happens here.',
        },
      },
    },
    {
      id: 'parts-of-speech-t2-02', tier: 2, format: 'mcq5',
      stem: 'In “Every Saturday the football coach shouts encouragement from the sideline,” what job is <b>coach</b> doing HERE?',
      options: [
        { text: 'noun', misconception: null },
        { text: 'verb', misconception: 'confused-context-verb' },
        { text: 'adjective', misconception: 'confused-with-adjective' },
        { text: 'adverb', misconception: 'confused-with-adverb' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Coach can be a person OR a doing word (“to coach someone”) — which fits here?',
        'Who is shouting? Coach is naming that person.',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'Coach names the person who shouts — it’s a noun here, even though “to coach” can be a verb elsewhere.',
        whyWrong: {
          verb: 'The doing word here is “shouts”, not coach.',
          adjective: 'Coach isn’t describing anything here.',
          adverb: 'Coach doesn’t tell us HOW anything happens.',
        },
      },
    },
    {
      id: 'parts-of-speech-t2-03', tier: 2, format: 'mcq5',
      stem: 'In “The gardener will plant the seeds before the frost arrives,” what job is <b>plant</b> doing HERE?',
      options: [
        { text: 'verb', misconception: null },
        { text: 'noun', misconception: 'confused-context-noun' },
        { text: 'adjective', misconception: 'confused-with-adjective' },
        { text: 'adverb', misconception: 'confused-with-adverb' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Plant can name a growing thing OR mean “to put seeds in soil” — which fits here?',
        'It follows “will” — what is the gardener about to DO?',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: '“Will plant” tells us the action the gardener is about to do — verb.',
        whyWrong: {
          noun: 'That fits “a plant on the windowsill” — a different sentence, not this one.',
          adjective: 'Plant isn’t describing anything here.',
          adverb: 'Plant doesn’t tell us HOW anything happens here.',
        },
      },
    },
    {
      id: 'parts-of-speech-t2-04', tier: 2, format: 'mcq5',
      stem: 'In “The old football felt perfectly round after Jarlath pumped it up,” what job is <b>round</b> doing HERE?',
      options: [
        { text: 'adjective', misconception: null },
        { text: 'noun', misconception: 'confused-context-noun' },
        { text: 'verb', misconception: 'confused-with-verb' },
        { text: 'adverb', misconception: 'confused-with-adverb' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Round can name a turn, mean “to go around”, or describe a shape — which fits here?',
        'What KIND of shape did the football feel? Round is describing it.',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'Round answers “what kind of shape did the football feel?” — adjective.',
        whyWrong: {
          noun: 'That fits “it was Jarlath’s round to buy crisps” — a different sentence.',
          verb: 'There’s no doing happening with round here.',
          adverb: 'Round is describing the ball’s shape, not a verb.',
        },
      },
    },
    {
      id: 'parts-of-speech-t2-05', tier: 2, format: 'mcq5',
      stem: 'In “Mind you don’t trip over the goalkeeper’s dropped glove near the goal,” what job is <b>trip</b> doing HERE?',
      options: [
        { text: 'verb', misconception: null },
        { text: 'noun', misconception: 'confused-context-noun' },
        { text: 'adjective', misconception: 'confused-with-adjective' },
        { text: 'adverb', misconception: 'confused-with-adverb' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Trip can name a journey OR mean “to stumble” — which fits here?',
        'What might happen if you’re not careful over the glove?',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'Trip is the action being warned about — it’s the verb here, not a journey.',
        whyWrong: {
          noun: 'That fits “the class went on a trip” — a different sentence, not this one.',
          adjective: 'Trip isn’t describing anything here.',
          adverb: 'Trip doesn’t tell us HOW anything happens here.',
        },
      },
    },
    {
      id: 'parts-of-speech-t2-06', tier: 2, format: 'mcq5',
      stem: 'In “In spring, the frogspawn hatches beside the muddy pond,” what job is <b>spring</b> doing HERE?',
      options: [
        { text: 'noun', misconception: null },
        { text: 'verb', misconception: 'confused-context-verb' },
        { text: 'adjective', misconception: 'confused-with-adjective' },
        { text: 'adverb', misconception: 'confused-with-adverb' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Spring can name a season OR mean “to jump” — which fits here?',
        'It follows “in”, like a time — which season is being named?',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'Spring names the season here — it’s a noun, not the jumping action.',
        whyWrong: {
          verb: 'That fits “the cat will spring off the wall” — a different sentence.',
          adjective: 'Spring isn’t describing anything here.',
          adverb: 'Spring doesn’t tell us HOW anything happens here.',
        },
      },
    },
    {
      id: 'parts-of-speech-t2-07', tier: 2, format: 'clozebox',
      stemParts: ['Jarlath wore his wellies ', ' the field was covered in mud.'],
      options: [
        { text: 'because', misconception: null },
        { text: 'although', misconception: 'wrong-conjunction-contrast' },
        { text: 'so what', misconception: 'sound-alike' },
        { text: 'because of', misconception: 'preposition-not-conjunction' },
        { text: 'but', misconception: 'wrong-conjunction-contrast' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Read the whole sentence with each word in the gap — your ear will spot the odd ones out.',
        'WHY did he wear wellies? The answer word shows a reason…',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'He wore wellies FOR THE REASON that the field was muddy — because gives that reason.',
        whyWrong: {
          although: 'That signals a contrast — but there’s no contrast here.',
          'so what': 'That’s a cheeky question, not a joining word!',
          'because of': 'Needs a thing after it (“because of the mud”), not a whole sentence.',
          but: 'That signals a contrast, not a reason.',
        },
      },
    },
    {
      id: 'parts-of-speech-t2-08', tier: 2, format: 'clozebox',
      stemParts: ['The stinkling kept smiling ', ' everyone held their nose.'],
      options: [
        { text: 'although', misconception: null },
        { text: 'because', misconception: 'wrong-conjunction-reason' },
        { text: 'so that', misconception: 'wrong-conjunction-purpose' },
        { text: 'when', misconception: 'wrong-conjunction-time' },
        { text: 'and', misconception: 'wrong-conjunction-additive' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Read the whole sentence with each word in the gap — your ear will spot the odd ones out.',
        'Is this a REASON, or a CONTRAST between smiling and everyone holding their nose?',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'Everyone held their nose EVEN THOUGH the stinkling kept smiling — that’s a contrast: although.',
        whyWrong: {
          because: 'That would give a reason, but smiling isn’t the reason people held their nose.',
          'so that': 'That signals purpose, not a contrast.',
          when: 'That signals time, not a contrast.',
          and: 'That just adds ideas together — it misses the contrast.',
        },
      },
    },
    {
      id: 'parts-of-speech-t2-09', tier: 2, format: 'clozebox',
      stemParts: ['Please tidy your room ', ' Grandad arrives for tea.'],
      options: [
        { text: 'before', misconception: null },
        { text: 'after', misconception: 'wrong-time-direction' },
        { text: 'until', misconception: 'wrong-conjunction-duration' },
        { text: 'behind', misconception: 'preposition-place-not-time' },
        { text: 'because', misconception: 'wrong-conjunction-reason' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Read the whole sentence with each word in the gap — your ear will spot the odd ones out.',
        'Should the room be tidy BEFORE or AFTER Grandad gets there?',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'The tidying must happen ahead of Grandad’s arrival — before shows that order.',
        whyWrong: {
          after: 'That would mean tidying happens once Grandad is already there — too late!',
          until: 'That suggests ongoing tidying that stops when he arrives — not quite right here.',
          behind: 'That shows PLACE, not time — it doesn’t fit a time gap here.',
          because: 'That would give a reason, not a time order.',
        },
      },
    },
    {
      id: 'parts-of-speech-t2-10', tier: 2, format: 'clozebox',
      stemParts: ['The team hid the stinky boots ', ' the changing room bench.'],
      options: [
        { text: 'under', misconception: null },
        { text: 'over', misconception: 'wrong-position-vertical' },
        { text: 'between', misconception: 'needs-two-things' },
        { text: 'through', misconception: 'wrong-position-motion' },
        { text: 'about', misconception: 'wrong-preposition-topic' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Read the whole sentence with each word in the gap — your ear will spot the odd ones out.',
        'Where would smelly boots best hide — above the bench, or below it?',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'Boots hiding below the bench — under shows that position exactly.',
        whyWrong: {
          over: 'That would put the boots ABOVE the bench — a strange hiding spot.',
          between: 'That needs TWO things to sit between — there’s only one bench here.',
          through: 'That suggests motion passing across the bench, not hiding beneath it.',
          about: 'That would mean the boots are ON THE TOPIC of the bench — makes no sense.',
        },
      },
    },
    {
      id: 'parts-of-speech-t2-11', tier: 2, format: 'clozebox',
      stemParts: ['We cannot start the match ', ' both goalkeepers are ready.'],
      options: [
        { text: 'unless', misconception: null },
        { text: 'so that', misconception: 'wrong-conjunction-purpose' },
        { text: 'because', misconception: 'wrong-conjunction-reason' },
        { text: 'and', misconception: 'wrong-conjunction-additive' },
        { text: 'unless that', misconception: 'incomplete-phrase' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Read the whole sentence with each word in the gap — your ear will spot the odd ones out.',
        'Is this saying the match needs a CONDITION met first?',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'The match waits on a CONDITION — both keepers being ready — unless fits that exactly.',
        whyWrong: {
          'so that': 'That signals purpose, not a condition.',
          because: 'That would give a reason, not a condition that must be met.',
          and: 'That just adds ideas — it misses the condition.',
          'unless that': 'Extra word “that” doesn’t belong — it’s not a real phrase here.',
        },
      },
    },
    {
      id: 'parts-of-speech-t2-12', tier: 2, format: 'clozebox',
      stemParts: ['No talking is allowed ', ' the fire alarm test.'],
      options: [
        { text: 'during', misconception: null },
        { text: 'before', misconception: 'wrong-time-direction' },
        { text: 'between', misconception: 'needs-two-things' },
        { text: 'because', misconception: 'wrong-conjunction-reason' },
        { text: 'along', misconception: 'wrong-preposition-motion' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Read the whole sentence with each word in the gap — your ear will spot the odd ones out.',
        'Is the no-talking rule happening WHILE the test runs?',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'The rule applies WHILE the alarm test is happening — during shows that.',
        whyWrong: {
          before: 'That would mean the rule stops once the test starts — the opposite of what’s meant.',
          between: 'That needs TWO things to sit between — there’s only one test here.',
          because: 'That would give a reason, not a time span.',
          along: 'That suggests movement alongside something, not a time span.',
        },
      },
    },

    // ---------- TIER 3 (10) — 4 subtler context-shift mcq5 + 3 selecttwo adverbs + 3 tricky clozebox ----------
    {
      id: 'parts-of-speech-t3-01', tier: 3, format: 'mcq5',
      stem: 'In “The coach is training the whole team before Saturday’s big match,” what job is <b>training</b> doing HERE?',
      options: [
        { text: 'verb', misconception: null },
        { text: 'noun', misconception: 'confused-context-noun' },
        { text: 'adjective', misconception: 'confused-with-adjective' },
        { text: 'adverb', misconception: 'confused-with-adverb' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Training can name a session (“training was cancelled”) OR be part of a doing word — which fits here?',
        'It comes straight after “is” — together they show what the coach is DOING right now.',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: '“Is training” shows what the coach is doing right now — training is part of the verb here, even though it can be a noun (“training was cancelled”) elsewhere.',
        whyWrong: {
          noun: 'That fits “training was cancelled” — a different sentence, not this one.',
          adjective: 'Training isn’t describing anything here.',
          adverb: 'Training doesn’t tell us HOW anything happens here.',
        },
      },
    },
    {
      id: 'parts-of-speech-t3-02', tier: 3, format: 'mcq5',
      stem: 'In “Jarlath’s trainers are perfect for running long muddy cross-country races,” what job is <b>running</b> doing HERE?',
      options: [
        { text: 'noun', misconception: null },
        { text: 'verb', misconception: 'confused-context-verb' },
        { text: 'adjective', misconception: 'confused-with-adjective' },
        { text: 'adverb', misconception: 'confused-with-adverb' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Running can be part of a doing word (“is running”) OR name the activity itself — which fits here?',
        'It follows “for”, like a thing you’re good for — the trainers are perfect for WHAT?',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'Running names the activity itself here, after “for” — it’s a noun, even though it’s part of the verb in “he is running” elsewhere.',
        whyWrong: {
          verb: 'That fits “he is running” — a different sentence, not this one.',
          adjective: 'Running isn’t describing anything here.',
          adverb: 'Running doesn’t tell us HOW anything happens here.',
        },
      },
    },
    {
      id: 'parts-of-speech-t3-03', tier: 3, format: 'mcq5',
      stem: 'In “The goalkeeper judged the diving save well despite the slippery pitch,” what job is <b>well</b> doing HERE?',
      options: [
        { text: 'adverb', misconception: null },
        { text: 'noun', misconception: 'confused-context-noun' },
        { text: 'verb', misconception: 'confused-with-verb' },
        { text: 'adjective', misconception: 'confused-with-adjective' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Well can name a water hole OR describe HOW something was done — which fits here?',
        'HOW did the goalkeeper judge the save? Well answers that job-question.',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'Well answers “how did he judge it?” — it describes the verb, so it’s an adverb here.',
        whyWrong: {
          noun: 'That fits “water from the well” — a different sentence, not this one.',
          verb: 'There’s no doing happening in the word well.',
          adjective: 'Well is describing HOW he judged, not naming or describing a noun.',
        },
      },
    },
    {
      id: 'parts-of-speech-t3-04', tier: 3, format: 'mcq5',
      stem: 'In “Whiffbeard gave the plan his sound, sensible approval before the match,” what job is <b>sound</b> doing HERE?',
      options: [
        { text: 'adjective', misconception: null },
        { text: 'noun', misconception: 'confused-context-noun' },
        { text: 'verb', misconception: 'confused-with-verb' },
        { text: 'adverb', misconception: 'confused-with-adverb' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Sound can name a noise OR describe something reliable — which fits here?',
        'What KIND of approval did Whiffbeard give? Sound answers that.',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'Sound answers “what kind of approval?” — meaning solid and sensible — an adjective here.',
        whyWrong: {
          noun: 'That fits “the sound of the parp” — a different sentence, not this one.',
          verb: 'There’s no doing happening in the word sound here.',
          adverb: 'Sound is describing the approval, a noun — not a verb.',
        },
      },
    },
    {
      id: 'parts-of-speech-t3-05', tier: 3, format: 'selecttwo',
      stem: 'In “The tired goalkeeper trudged slowly towards the muddy dressing room afterwards,” tap the TWO ADVERBS.',
      options: [
        { text: 'slowly' },
        { text: 'afterwards' },
        { text: 'tired' },
        { text: 'trudged' },
        { text: 'room' },
      ],
      correctIndices: [0, 1],
      hintSteps: [
        'Adverbs answer how, when or where — test each option with a job-question.',
        'Slowly answers HOW he trudged; afterwards answers WHEN.',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'Slowly tells us HOW he trudged; afterwards tells us WHEN — both answer adverb job-questions.',
        whyWrong: {
          tired: 'That describes the goalkeeper, a noun — it’s an adjective.',
          trudged: 'That’s the doing word itself — a verb.',
          room: 'That names the place — a noun.',
        },
      },
    },
    {
      id: 'parts-of-speech-t3-06', tier: 3, format: 'selecttwo',
      stem: 'In “Jarlath quickly hid the smelly sock somewhere upstairs before tea,” tap the TWO ADVERBS.',
      options: [
        { text: 'quickly' },
        { text: 'upstairs' },
        { text: 'hid' },
        { text: 'sock' },
        { text: 'smelly' },
      ],
      correctIndices: [0, 1],
      hintSteps: [
        'Adverbs answer how, when or where — test each option with a job-question.',
        'Quickly answers HOW he hid it; upstairs answers WHERE.',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'Quickly tells us HOW he hid the sock; upstairs tells us WHERE — both are adverbs.',
        whyWrong: {
          hid: 'That’s the doing word itself — a verb.',
          sock: 'That names the thing — a noun.',
          smelly: 'That describes the sock — an adjective.',
        },
      },
    },
    {
      id: 'parts-of-speech-t3-07', tier: 3, format: 'selecttwo',
      stem: 'In “The huge dragon roared fiercely and stomped angrily across the courtyard,” tap the TWO ADVERBS.',
      options: [
        { text: 'fiercely' },
        { text: 'angrily' },
        { text: 'huge' },
        { text: 'roared' },
        { text: 'courtyard' },
      ],
      correctIndices: [0, 1],
      hintSteps: [
        'Adverbs answer how, when or where — test each option with a job-question.',
        'Fiercely answers HOW it roared; angrily answers HOW it stomped.',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'Fiercely tells us HOW the dragon roared; angrily tells us HOW it stomped — both are adverbs.',
        whyWrong: {
          huge: 'That describes the dragon, a noun — it’s an adjective.',
          roared: 'That’s a doing word itself — a verb.',
          courtyard: 'That names the place — a noun.',
        },
      },
    },
    {
      id: 'parts-of-speech-t3-08', tier: 3, format: 'clozebox',
      stemParts: ['Jarlath practised his free kicks every evening ', ' his sister preferred reading comics.'],
      options: [
        { text: 'whereas', misconception: null },
        { text: 'because', misconception: 'wrong-conjunction-reason' },
        { text: 'so that', misconception: 'wrong-conjunction-purpose' },
        { text: 'unless', misconception: 'wrong-conjunction-condition' },
        { text: 'and', misconception: 'wrong-conjunction-additive' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Read the whole sentence with each word in the gap — your ear will spot the odd ones out.',
        'The two habits CONTRAST — football practice against reading comics.',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'The two habits contrast — practice versus comics — whereas signals exactly that contrast.',
        whyWrong: {
          because: 'That would give a reason, but there’s no reason link here — just a contrast.',
          'so that': 'That signals purpose, not a contrast between two habits.',
          unless: 'That signals a condition, which doesn’t fit two ongoing habits.',
          and: 'That just adds the ideas — it misses the contrast completely.',
        },
      },
    },
    {
      id: 'parts-of-speech-t3-09', tier: 3, format: 'clozebox',
      stemParts: ['The match went ahead ', ' the heavy rain and thick mud.'],
      options: [
        { text: 'despite', misconception: null },
        { text: 'because of', misconception: 'wrong-preposition-reason' },
        { text: 'during', misconception: 'wrong-preposition-time' },
        { text: 'without', misconception: 'wrong-preposition-absence' },
        { text: 'between', misconception: 'needs-two-things' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Read the whole sentence with each word in the gap — your ear will spot the odd ones out.',
        'Did the rain and mud STOP the match, or did it go ahead ANYWAY?',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'The match happened EVEN THOUGH there was rain and mud — despite shows that contrast.',
        whyWrong: {
          'because of': 'That would mean the rain CAUSED the match to go ahead — the opposite of what’s meant.',
          during: 'That would just place it in time, missing the contrast of playing on regardless.',
          without: 'That would mean the rain and mud weren’t there at all — but they were.',
          between: 'That needs TWO things to sit between — rain and mud aren’t a pair of locations.',
        },
      },
    },
    {
      id: 'parts-of-speech-t3-10', tier: 3, format: 'clozebox',
      stemParts: ['Jarlath has smelled of farts ', ' he first met Whiffbeard.'],
      options: [
        { text: 'since', misconception: null },
        { text: 'because', misconception: 'wrong-conjunction-reason-not-time' },
        { text: 'until', misconception: 'wrong-time-direction' },
        { text: 'so that', misconception: 'wrong-conjunction-purpose' },
        { text: 'unless', misconception: 'wrong-conjunction-condition' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Read the whole sentence with each word in the gap — your ear will spot the odd ones out.',
        'Is this about WHEN it started, or WHY it happened?',
      ],
      explain: {
        rule: 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.',
        worked: 'This is about TIME — the point it started — not reason: since fits, because would answer “why” instead of “from when”.',
        whyWrong: {
          because: 'That answers WHY, but the sentence is about WHEN it started.',
          until: 'That would mean it stopped when he met Whiffbeard — the opposite of what’s meant.',
          'so that': 'That signals purpose, which doesn’t fit a starting point in time.',
          unless: 'That signals a condition, not a starting point in time.',
        },
      },
    },
  ],
};
