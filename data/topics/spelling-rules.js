// FART QUEST topic: The Rule Pipes (The Spelling Sewers)
// Authored content — implementation agents: read, never modify.
// Bank-driven English topic (errorspot + wordentry). No generator.

const WEAPON_RULE = 'i before e except after c (when it rhymes with bee); drop the e when adding -ing; y turns to ies.';

export default {
  id: 'spelling-rules',
  name: 'The Rule Pipes',
  region: 'spelling-sewers',
  bankTopic: true,
  tagline: 'Three ancient laws keep every word in order down here. Break one, and she smells it a mile off.',

  creature: {
    id: 'i-before-e-leen',
    name: 'I-Before-E-leen',
    rarity: 'rare',
    image: 'assets/monsters/i-before-e-leen.png',
    bio: 'I-Before-E-leen has memorised every spelling rule ever written, and every exception too, which she will recite whether you asked or not. She patrols The Rule Pipes correcting graffiti as it drips past.',
    factSneak: '"i" before "e", except after "c" — but only when the sound rhymes with "bee": believe, but receive.',
  },

  weapon: {
    id: 'rule-wrench',
    name: 'The Rule Wrench',
    tagline: 'One tool. Every stuck word. Give it a twist and the spelling clicks into place.',
    rule: WEAPON_RULE,
    example: '"believe" (no c, so i first) but "receive" (after c, so e first) — and "hope" drops its silent e to become "hoping", never "hopeing".',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-spelling',
      text: 'Gather round, brave nose-soldier! Down in these Rule Pipes, every word obeys THREE ancient laws — and if a word breaks one, I-Before-E-leen smells it a mile off. Today we bolt those laws straight into your brain, so nothing ever slips past you again.',
    },
    {
      type: 'show',
      title: 'Law One: i before e',
      html: `<p>Some letters argue over who goes first: <b>i</b> or <b>e</b>? Here is the ancient law that settles it:</p>
<div class="law-scroll">📜 <b>i</b> before <b>e</b>, except after <b>c</b> — but only when the sound rhymes with <b>"bee"</b>.</div>
<p>No <b>c</b> nearby? <b>i</b> goes first: bel<b>ie</b>ve, ch<b>ie</b>f, n<b>ie</b>ce, th<b>ie</b>f. Straight after a <b>c</b>? <b>e</b> goes first: re<b>ce</b>ive, <b>ce</b>iling, de<b>ce</b>ive.</p>
<p>Try it out loud: "The chief was relieved to receive a certificate for his brave rescue." Chief and relieved have no c nearby, so i goes first. Receive comes straight after the c, so e goes first.</p>`,
    },
    {
      type: 'show',
      title: 'Law Two: drop the e',
      html: `<p>Lots of words end in a silent <b>e</b> that you barely hear. When you bolt <b>-ing</b> onto one of these words, that silent e has to go.</p>
<div class="law-scroll">📜 Ends in a silent <b>e</b>? Drop it before you add <b>-ing</b>.</div>
<p>hope + ing = hop<b>ing</b> (never hopeing). make + ing = mak<b>ing</b>. smile + ing = smil<b>ing</b>.</p>
<p>"Whiffbeard kept hoping the storm would pass, while bravely smiling at the thunder." Notice: both hoping and smiling have already dropped their silent e.</p>`,
    },
    {
      type: 'show',
      title: 'Law Three: y turns to ies',
      html: `<p>Words ending in <b>y</b> split into two gangs, depending on what sits right before the y.</p>
<div class="law-scroll">📜 A <b>consonant</b> before the y? Swap the y for <b>ies</b>. A <b>vowel</b> before the y? Just add <b>s</b> — the y stays put.</div>
<p>cry → cr<b>ies</b>, try → tr<b>ies</b>, carry → carr<b>ies</b> (consonant + y). But boy → boy<b>s</b>, monkey → monkey<b>s</b> (vowel + y — no change needed!).</p>
<p>"Two flies buzz around the bin, but the monkeys swing straight past without caring." Flies has a consonant (l) before the y, so it changes. Monkeys has a vowel (e) before the y, so it just adds s.</p>`,
    },
    {
      type: 'show',
      title: 'Bonus laws: doubling and the "shun" sound',
      html: `<p>Two more traps lurk in these pipes.</p>
<div class="law-scroll">📜 Short word, one vowel, one consonant at the end? <b>Double</b> that consonant before -ing or -ed.</div>
<p>run → ru<b>nn</b>ing, hop → ho<b>pp</b>ed, swim → swi<b>mm</b>ing. (But NOT words with two vowels or two consonants already — rain → raining, jump → jumping, no doubling needed.)</p>
<div class="law-scroll">📜 The "shun" sound is almost always spelt <b>-tion</b> or <b>-sion</b> — never -shun.</div>
<p>"After months of planning, the swimming club finally got permission for a seaside trip." Planning and swimming both doubled their consonant. Permission ends in -sion, not -shun.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'spelling-rules-try-1', topicId: 'spelling-rules', tier: 1, format: 'errorspot',
        segments: [
          { text: "Jarlath's little cousin" },
          { text: 'was so releived' },
          { text: 'when the school trip' },
          { text: 'was not cancelled.' },
        ],
        faultyIndex: 1,
        explain: {
          rule: WEAPON_RULE,
          worked: '"releived" swaps the letters round. There is no c nearby, so i goes first: r-e-l-i-e-v-e-d, relieved.',
        },
        hintSteps: [
          'Find the word that has an i and an e sitting together. Is there a c right before it?',
          'No c here — so i goes first. Which segment has the letters swapped round?',
        ],
      },
    },
    {
      type: 'try',
      q: {
        id: 'spelling-rules-try-2', topicId: 'spelling-rules', tier: 1, format: 'wordentry',
        stem: "Write the <b>-ing</b> form of the word <b>'hope'</b>.",
        hint: 'one word — careful, this one drops a letter',
        maxLen: 20,
        accept: ['hoping'],
        explain: {
          rule: WEAPON_RULE,
          worked: '"hope" ends in a silent e. Drop it before adding -ing: hop + ing = hoping.',
        },
        hintSteps: [
          'Does "hope" end in a silent e? What happens to that e when -ing arrives?',
          'Drop the e, then bolt on -ing: h-o-p-…',
        ],
      },
    },
    { type: 'weapon' },
  ],

  tips: [
    '"i" before "e", except after "c" — but only when it rhymes with "bee": believe, but receive.',
    'Silent e drops before -ing: hope → hoping (never hopeing).',
    'Consonant + y becomes ies: cry → cries. Vowel + y just adds s: boy → boys.',
    'Short word, one vowel, one final consonant? Double it before -ing or -ed: run → running, hop → hopped.',
    'The "shun" sound is almost always spelt -tion or -sion, never -shun: invitation, permission, decision.',
    "Don't assume every sentence hides a mistake — sometimes every single word is spelt correctly. Check each word against its own rule before you accuse it.",
  ],

  bank: [
    // ---------------------------------------------------------------- TIER 1 (12: 9 errors + 3 all-clean)
    {
      id: 'spelling-rules-t1-01', topicId: 'spelling-rules', tier: 1, format: 'errorspot',
      segments: [
        { text: 'The sneaky theif crept' },
        { text: 'past the sleeping' },
        { text: 'guard dogs without' },
        { text: 'making a single sound.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: WEAPON_RULE,
        worked: '"theif" has the letters swapped. No c nearby, so i comes first: t-h-i-e-f, thief.',
      },
      hintSteps: [
        'Look for a word with an i and an e sitting together. Is there a c right before it?',
        'No c here, so i goes first. Which segment has it backwards?',
      ],
    },
    {
      id: 'spelling-rules-t1-02', topicId: 'spelling-rules', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Our whole class' },
        { text: 'did not beleive' },
        { text: 'the school trip' },
        { text: 'was really cancelled.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: WEAPON_RULE,
        worked: '"beleive" has e before i. No c nearby, so i must come first: b-e-l-i-e-v-e, believe.',
      },
      hintSteps: [
        'Say the rule to yourself: no c nearby means i goes first.',
        'Which word has the e sitting in front of the i by mistake?',
      ],
    },
    {
      id: 'spelling-rules-t1-03', topicId: 'spelling-rules', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Every Saturday morning' },
        { text: 'the football team' },
        { text: 'trains on the feild' },
        { text: 'before their big match.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: WEAPON_RULE,
        worked: '"feild" has it backwards. No c nearby, so i comes first: f-i-e-l-d, field.',
      },
      hintSteps: [
        'Find the ie/ei word and check whether a c sits right before it.',
        'No c here — so it should be i before e. Which segment has the letters flipped?',
      ],
    },
    {
      id: 'spelling-rules-t1-04', topicId: 'spelling-rules', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Jarlath watched the sky' },
        { text: 'all afternoon,' },
        { text: 'waiting for rain,' },
        { text: 'secretly hopeing it would come.' },
      ],
      faultyIndex: 3,
      explain: {
        rule: WEAPON_RULE,
        worked: '"hope" ends in a silent e, so it must be dropped before -ing: hop + ing = hoping, not hopeing.',
      },
      hintSteps: [
        'Find the -ing word. What did the original word end in before -ing was added?',
        'A silent e gets dropped before -ing. Which segment kept the e that should have gone?',
      ],
    },
    {
      id: 'spelling-rules-t1-05', topicId: 'spelling-rules', tier: 1, format: 'errorspot',
      segments: [
        { text: 'The twins were makeing' },
        { text: 'a giant sandcastle' },
        { text: 'on the golden beach' },
        { text: 'before the tide arrived.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: WEAPON_RULE,
        worked: '"make" ends in a silent e, dropped before -ing: mak + ing = making, not makeing.',
      },
      hintSteps: [
        'Spot the -ing word. Does it still have a leftover e it should have lost?',
        'Drop the silent e first, then add -ing: m-a-k-…',
      ],
    },
    {
      id: 'spelling-rules-t1-06', topicId: 'spelling-rules', tier: 1, format: 'errorspot',
      segments: [
        { text: 'The tired referee' },
        { text: 'kept smileing bravely' },
        { text: 'even after the match' },
        { text: 'went to extra time.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: WEAPON_RULE,
        worked: '"smile" drops its silent e before -ing: smil + ing = smiling, not smileing.',
      },
      hintSteps: [
        'Which word ends in -ing but still has an extra e hanging on?',
        'Drop that silent e before you bolt on -ing.',
      ],
    },
    {
      id: 'spelling-rules-t1-07', topicId: 'spelling-rules', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Down by the bins,' },
        { text: 'the dog snaps' },
        { text: 'at every fly that flys' },
        { text: 'past his nose.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: WEAPON_RULE,
        worked: '"fly" ends consonant + y (l + y), so swap the y for ies: fl + ies = flies, not flys.',
      },
      hintSteps: [
        'Find the word ending in y that has just had an s bolted on. What letter sits right before the y?',
        'A consonant before y means swap the y for ies.',
      ],
    },
    {
      id: 'spelling-rules-t1-08', topicId: 'spelling-rules', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Every single afternoon' },
        { text: 'Jarlath sets up cones' },
        { text: 'in the garden and' },
        { text: 'tryes a new trick.' },
      ],
      faultyIndex: 3,
      explain: {
        rule: WEAPON_RULE,
        worked: '"try" ends consonant + y (r + y), so swap the y for ies: tr + ies = tries, not tryes.',
      },
      hintSteps: [
        'Find the y-word with an s stuck on the end. Is the letter before the y a consonant or a vowel?',
        'Consonant before y means the y changes to ies.',
      ],
    },
    {
      id: 'spelling-rules-t1-09', topicId: 'spelling-rules', tier: 1, format: 'errorspot',
      segments: [
        { text: 'The postman carrys' },
        { text: 'a heavy sack' },
        { text: 'of letters and parcels' },
        { text: 'right up our lane.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: WEAPON_RULE,
        worked: '"carry" ends consonant + y (r + y), so swap the y for ies: carr + ies = carries, not carrys.',
      },
      hintSteps: [
        'Which word ending in y just had an s added instead of changing?',
        'Consonant before the y — it needs to become ies.',
      ],
    },
    {
      id: 'spelling-rules-t1-10', topicId: 'spelling-rules', tier: 1, format: 'errorspot',
      segments: [
        { text: 'The whole class felt relief' },
        { text: 'when the strict teacher' },
        { text: 'finally smiled at' },
        { text: 'their answers.' },
      ],
      faultyIndex: null,
      explain: {
        rule: WEAPON_RULE,
        worked: '"relief" has no c nearby, so i before e is correct. "smiled" already drops its silent e properly. Every word here follows its own rule — ALL CLEAN!',
        whyN: 'Check "relief" against the ie/ei law (no c, so i first — correct) and "smiled" against the drop-e law (already dropped — correct). Nothing has slipped.',
      },
      hintSteps: [
        "Don't assume there's always a mistake. Check each tricky word one at a time.",
        '"relief" and "smiled" — test both against their own laws. Do either break the rule?',
      ],
    },
    {
      id: 'spelling-rules-t1-11', topicId: 'spelling-rules', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Jarlath kept chasing his' },
        { text: 'excited puppy around' },
        { text: 'the muddy garden' },
        { text: 'until teatime.' },
      ],
      faultyIndex: null,
      explain: {
        rule: WEAPON_RULE,
        worked: '"chasing" already drops the silent e from "chase" before adding -ing — that is exactly correct. ALL CLEAN!',
        whyN: '"chase" ends in a silent e, and "chasing" has already dropped it, which is exactly what the law demands. There is nothing left to fix.',
      },
      hintSteps: [
        'Find the -ing word. What did it end in before -ing was added, and did that letter get dropped?',
        'The silent e is already gone — "chasing" obeys the law perfectly.',
      ],
    },
    {
      id: 'spelling-rules-t1-12', topicId: 'spelling-rules', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Every morning our' },
        { text: 'neighbour worries that' },
        { text: 'her hens have' },
        { text: 'escaped again.' },
      ],
      faultyIndex: null,
      explain: {
        rule: WEAPON_RULE,
        worked: '"worry" ends consonant + y (r + y), and "worries" correctly swaps the y for ies. ALL CLEAN!',
        whyN: 'Check the letter before the y in "worry" — it is a consonant, r, so swapping to ies is exactly correct.',
      },
      hintSteps: [
        'Find the y-word. What letter sits before the y, and has it changed the right way?',
        'Consonant before y, changed to ies — that is the law followed correctly.',
      ],
    },

    // ---------------------------------------------------------------- TIER 2 (12: 9 errors + 3 all-clean)
    {
      id: 'spelling-rules-t2-01', topicId: 'spelling-rules', tier: 2, format: 'errorspot',
      segments: [
        { text: 'On Friday morning' },
        { text: 'Jarlath was thrilled to recieve' },
        { text: 'a shiny new football' },
        { text: 'from his granddad.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: WEAPON_RULE,
        worked: '"recieve" comes straight after a c, so e must come first: rec-e-i-ve, receive.',
      },
      hintSteps: [
        'Find the ie/ei word. Is there a c sitting right in front of it?',
        'There is a c here — so e comes first, not i.',
      ],
    },
    {
      id: 'spelling-rules-t2-02', topicId: 'spelling-rules', tier: 2, format: 'errorspot',
      segments: [
        { text: 'During the storm' },
        { text: 'a branch crashed through' },
        { text: 'the kitchen cieling' },
        { text: 'and rain poured in.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: WEAPON_RULE,
        worked: '"cieling" comes straight after a c, so e goes first: c-e-i-ling, ceiling.',
      },
      hintSteps: [
        'Find the ie/ei word and check the letter right before it.',
        'A c sits directly before it — so e first, not i.',
      ],
    },
    {
      id: 'spelling-rules-t2-03', topicId: 'spelling-rules', tier: 2, format: 'errorspot',
      segments: [
        { text: 'After the whistle' },
        { text: 'the tired coach sat' },
        { text: 'on the bench' },
        { text: 'still decideing what to say.' },
      ],
      faultyIndex: 3,
      explain: {
        rule: WEAPON_RULE,
        worked: '"decide" drops its silent e before -ing: decid + ing = deciding, not decideing.',
      },
      hintSteps: [
        'Which word ends in -ing but still shows a leftover e?',
        'Drop the silent e before adding -ing.',
      ],
    },
    {
      id: 'spelling-rules-t2-04', topicId: 'spelling-rules', tier: 2, format: 'errorspot',
      segments: [
        { text: 'The excited puppy was chaseing' },
        { text: 'a red ball' },
        { text: 'around the garden' },
        { text: 'until it got dark.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: WEAPON_RULE,
        worked: '"chase" drops its silent e before -ing: chas + ing = chasing, not chaseing.',
      },
      hintSteps: [
        'Find the -ing word. Has the original silent e actually been dropped?',
        'It should have gone before -ing was added.',
      ],
    },
    {
      id: 'spelling-rules-t2-05', topicId: 'spelling-rules', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Every single night' },
        { text: 'our neighbour worrys' },
        { text: 'that a fox' },
        { text: 'will visit her hens.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: WEAPON_RULE,
        worked: '"worry" ends consonant + y (r + y), so swap y for ies: worr + ies = worries, not worrys.',
      },
      hintSteps: [
        'Find the y-word with a plain s stuck on. What letter comes before the y?',
        'A consonant before y needs ies, not just s.',
      ],
    },
    {
      id: 'spelling-rules-t2-06', topicId: 'spelling-rules', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Each morning' },
        { text: 'Jarlath grabs his bag' },
        { text: 'and hurrys down the stairs' },
        { text: 'before the bus leaves.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: WEAPON_RULE,
        worked: '"hurry" ends consonant + y (r + y), so swap y for ies: hurr + ies = hurries, not hurrys.',
      },
      hintSteps: [
        'Which y-word just added an s instead of changing?',
        'Consonant before the y — it needs to become ies.',
      ],
    },
    {
      id: 'spelling-rules-t2-07', topicId: 'spelling-rules', tier: 2, format: 'errorspot',
      segments: [
        { text: 'At break time' },
        { text: 'the class lines up' },
        { text: 'before the whistle blows' },
        { text: 'and everyone starts runing.' },
      ],
      faultyIndex: 3,
      explain: {
        rule: WEAPON_RULE,
        worked: '"run" is a short word ending vowel-consonant (u-n), so double the n before -ing: ru + nn + ing = running, not runing.',
      },
      hintSteps: [
        'Find the -ing word. Is it a short word with just one vowel before its last letter?',
        'That last consonant needs doubling before -ing: r-u-n-n-…',
      ],
    },
    {
      id: 'spelling-rules-t2-08', topicId: 'spelling-rules', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Jarlath droped the ball' },
        { text: 'on the goal line' },
        { text: 'in front of the whole' },
        { text: 'cheering crowd.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: WEAPON_RULE,
        worked: '"drop" ends vowel-consonant (o-p), so double the p before -ed: dro + pp + ed = dropped, not droped.',
      },
      hintSteps: [
        'Find the -ed word. Is it a short word with one vowel before its last letter?',
        'Double that final consonant before -ed.',
      ],
    },
    {
      id: 'spelling-rules-t2-09', topicId: 'spelling-rules', tier: 2, format: 'errorspot',
      segments: [
        { text: 'For his birthday party' },
        { text: 'Jarlath designed an invitasion' },
        { text: 'with a funny drawing' },
        { text: 'of his smelly dog.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: WEAPON_RULE,
        worked: 'The "shun" sound here should be spelt -tion: invita + tion = invitation, not invitasion.',
      },
      hintSteps: [
        'Find the word that ends with the "shun" sound. Is it spelt -tion or -sion?',
        'It should be -tion here, not a made-up "-sion" spelt with an s.',
      ],
    },
    {
      id: 'spelling-rules-t2-10', topicId: 'spelling-rules', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Every Tuesday the whole class' },
        { text: 'goes swimming' },
        { text: 'at the leisure centre' },
        { text: 'after lunch.' },
      ],
      faultyIndex: null,
      explain: {
        rule: WEAPON_RULE,
        worked: '"swim" is short with one vowel before its last letter, and "swimming" has correctly doubled the m. ALL CLEAN!',
        whyN: 'Check "swimming" against the doubling law: swim ends vowel-consonant, so the m doubles before -ing. That is exactly right.',
      },
      hintSteps: [
        "Don't assume there's a mistake hiding — test the doubling word properly.",
        '"swim" → double the last consonant before -ing. Has that happened correctly here?',
      ],
    },
    {
      id: 'spelling-rules-t2-11', topicId: 'spelling-rules', tier: 2, format: 'errorspot',
      segments: [
        { text: 'The head teacher took her time' },
        { text: 'before giving permission' },
        { text: 'for the school trip' },
        { text: 'next month.' },
      ],
      faultyIndex: null,
      explain: {
        rule: WEAPON_RULE,
        worked: '"permission" spells its "shun" sound correctly with -sion. ALL CLEAN!',
        whyN: 'The "shun" sound in "permission" is spelt -sion, which is one of the two correct spellings the law allows.',
      },
      hintSteps: [
        'Find the word with the "shun" sound. Is it spelt -tion or -sion, or something else entirely?',
        'It is spelt -sion here, which is correct — no made-up "-shun" in sight.',
      ],
    },
    {
      id: 'spelling-rules-t2-12', topicId: 'spelling-rules', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Believe it or not,' },
        { text: "Jarlath's granddad still enjoys" },
        { text: 'running down the muddy' },
        { text: 'field for fun.' },
      ],
      faultyIndex: null,
      explain: {
        rule: WEAPON_RULE,
        worked: '"Believe" (no c, i first), "running" (doubled n before -ing) and "field" (no c, i first) all follow their own laws perfectly. ALL CLEAN!',
        whyN: 'Three tricky words in one sentence, and all three are spelt correctly — check each one separately against its own rule rather than guessing.',
      },
      hintSteps: [
        'Three tricky words here: believe, running, field. Test each one on its own.',
        'ie/ei with no c nearby needs i first — both believe and field have it right. Running has doubled its n correctly too.',
      ],
    },

    // ---------------------------------------------------------------- TIER 3 (10: 6 errors + 2 all-clean + 2 wordentry)
    {
      id: 'spelling-rules-t3-01', topicId: 'spelling-rules', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Even from a distance' },
        { text: 'the clever sheepdog could' },
        { text: 'somehow percieve which way' },
        { text: 'sheep would run.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: WEAPON_RULE,
        worked: '"percieve" comes straight after a c, so e goes first: perc-e-i-ve, perceive.',
      },
      hintSteps: [
        'Find the ie/ei word. Look at the letter directly in front of it.',
        'A c sits right there — so it must be e before i.',
      ],
    },
    {
      id: 'spelling-rules-t3-02', topicId: 'spelling-rules', tier: 3, format: 'errorspot',
      segments: [
        { text: 'The coach was already' },
        { text: 'ten minutes late' },
        { text: 'when the head teacher noticed' },
        { text: 'everyone arriveing at once.' },
      ],
      faultyIndex: 3,
      explain: {
        rule: WEAPON_RULE,
        worked: '"arrive" drops its silent e before -ing: arriv + ing = arriving, not arriveing.',
      },
      hintSteps: [
        'Find the -ing word. Has the silent e from the original word actually gone?',
        'Drop that e before bolting on -ing.',
      ],
    },
    {
      id: 'spelling-rules-t3-03', topicId: 'spelling-rules', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Six familys signed up' },
        { text: "for the school's charity" },
        { text: 'fun run around' },
        { text: 'the muddy playing fields.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: WEAPON_RULE,
        worked: '"family" ends consonant + y (l + y), so swap y for ies: famil + ies = families, not familys.',
      },
      hintSteps: [
        'Find the y-word with a plain s added. What letter is right before the y?',
        'A consonant before y — it should become ies.',
      ],
    },
    {
      id: 'spelling-rules-t3-04', topicId: 'spelling-rules', tier: 3, format: 'errorspot',
      segments: [
        { text: 'At the summer fete' },
        { text: 'Jarlath won the bigest' },
        { text: 'prize of the whole' },
        { text: 'afternoon, a giant marrow.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: WEAPON_RULE,
        worked: '"big" is short with one vowel before its last letter, so double the g before -est: bi + gg + est = biggest, not bigest.',
      },
      hintSteps: [
        'Find the word comparing sizes. Is it a short word with just one vowel before its final letter?',
        'That final consonant should double before -est.',
      ],
    },
    {
      id: 'spelling-rules-t3-05', topicId: 'spelling-rules', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Before the trip' },
        { text: 'every single pupil needed' },
        { text: 'written permition from' },
        { text: 'a parent or guardian.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: WEAPON_RULE,
        worked: 'The "shun" sound here should be -ssion: permi + ssion = permission, not permition.',
      },
      hintSteps: [
        'Find the word with the "shun" sound. Is it spelt -tion, -ssion, or something invented?',
        'It should be -ssion here — "permition" is not one of the real spellings.',
      ],
    },
    {
      id: 'spelling-rules-t3-06', topicId: 'spelling-rules', tier: 3, format: 'errorspot',
      segments: [
        { text: 'The football referee paused' },
        { text: 'for a long moment,' },
        { text: 'then finally made his' },
        { text: 'decission before the whistle.' },
      ],
      faultyIndex: 3,
      explain: {
        rule: WEAPON_RULE,
        worked: 'The "shun" sound here should be a single s: deci + sion = decision, not decission.',
      },
      hintSteps: [
        'Find the "shun" sound word. Count the letters — does it have one s or two?',
        'It only needs one s: decision, not decission.',
      ],
    },
    {
      id: 'spelling-rules-t3-07', topicId: 'spelling-rules', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Two monkeys were jumping' },
        { text: 'between the branches' },
        { text: 'while the boys' },
        { text: 'cheered loudly below.' },
      ],
      faultyIndex: null,
      explain: {
        rule: WEAPON_RULE,
        worked: '"monkeys" and "boys" both have a vowel before the y, so they simply add s (no ies needed) — and "jumping" needs no doubling since jump already ends in two consonants. ALL CLEAN!',
        whyN: 'Vowel + y just adds s: monkey and boy both keep their y. "Jump" ends in two consonants, m and p, so nothing doubles before -ing. Nothing here breaks any law.',
      },
      hintSteps: [
        "These y-words look tempting to change, but check the letter before each y first.",
        'A vowel sits before both y-words here — vowel + y just adds s. No mistake to find.',
      ],
    },
    {
      id: 'spelling-rules-t3-08', topicId: 'spelling-rules', tier: 3, format: 'errorspot',
      segments: [
        { text: 'I truly believe' },
        { text: 'the referee was right' },
        { text: 'to receive that surprising' },
        { text: 'decision today.' },
      ],
      faultyIndex: null,
      explain: {
        rule: WEAPON_RULE,
        worked: '"believe" (no c, i first), "receive" (after c, e first) and "decision" (single s, correct -sion) are all spelt exactly right. ALL CLEAN!',
        whyN: 'Three famous troublemakers appear together here — believe, receive, decision — and every single one follows its own rule perfectly. Check each on its own merits rather than assuming.',
      },
      hintSteps: [
        'Three tricky words: believe, receive, decision. Test each against its own law separately.',
        'ie/ei depends on the c; decision only needs one s. All three pass the test here.',
      ],
    },
    {
      id: 'spelling-rules-t3-09', topicId: 'spelling-rules', tier: 3, format: 'wordentry',
      stem: "Write the <b>-ing</b> form of the word <b>'smile'</b>.",
      hint: 'one word',
      maxLen: 20,
      accept: ['smiling'],
      explain: {
        rule: WEAPON_RULE,
        worked: '"smile" ends in a silent e. Drop it before adding -ing: smil + ing = smiling.',
      },
      hintSteps: [
        'Does "smile" end in a silent e? What happens to that e when -ing is added?',
        'Drop the e, then bolt on -ing: s-m-i-l-…',
      ],
    },
    {
      id: 'spelling-rules-t3-10', topicId: 'spelling-rules', tier: 3, format: 'wordentry',
      stem: "Write the <b>-ing</b> form of the word <b>'run'</b>.",
      hint: 'one word',
      maxLen: 20,
      accept: ['running'],
      explain: {
        rule: WEAPON_RULE,
        worked: '"run" is a short word ending vowel-consonant (u-n). Double the n before adding -ing: ru + nn + ing = running.',
      },
      hintSteps: [
        'Is "run" a short word with just one vowel before its last letter?',
        'Double that final letter before adding -ing: r-u-n-n-…',
      ],
    },
  ],
};
