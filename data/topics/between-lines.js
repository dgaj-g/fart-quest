// FART QUEST topic: Nudge-Nudge Narrows — between-lines (Storybog)
// Authored content — implementation agents: read, never modify.
// Passage-skill topic (passageSkill:'inf'): battles draw tagged inference
// questions from the shared passage pool (data/passages/). No bank lives
// here — only the lesson's own mini-passage and its two 'try' questions.

const RULE = "The text gives clues, not answers. Ask: what do these clues ADD UP to? Beware answers with 'always', 'never', 'entirely'.";

export default {
  id: 'between-lines',
  name: 'Nudge-Nudge Narrows',
  region: 'storybog',
  passageSkill: 'inf',
  tagline: 'Nobody in a good story ever just SAYS what they feel. You have to sniff it out.',

  creature: {
    id: 'nudge-nudge-ned',
    name: 'Nudge-Nudge Ned',
    rarity: 'rare',
    image: 'assets/monsters/nudge-nudge-ned.png',
    bio: "Ned never once says what he means — he twitches his snout, drops a hint, and waits for YOU to work it out. Whiffbeard finds him utterly exhausting and completely brilliant.",
    factSneak: "A story rarely SAYS how a character feels — it gives you clues (what they DO, what they say, what they DON'T say) and trusts you to add them up.",
  },

  weapon: {
    id: 'sniff-it-out-snout',
    name: 'The Sniff-It-Out Snout',
    tagline: 'Follow the clues to the feeling nobody wrote down.',
    rule: RULE,
    example: "Line 2 says Michael's hands would not stop moving; line 7 says he dropped his bottle when the whistle blew. Nobody writes the word \"nervous\" — but sniff those two clues together and that is exactly what they add up to.",
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-betweenlines',
      text: "Gather round, brave nose-soldier! Today you meet Nudge-Nudge Ned, and he has one VERY annoying habit: he never says what he means. Good writers do the same thing on purpose — they hide a character's true feelings inside little clues, and leave YOU to sniff them out. Today you become the sniffer.",
    },
    {
      type: 'show',
      title: 'A Clue Before We Start',
      html: `<p>Quick warm-up. Read this one line: <b>"Jarlath hurled his controller onto the sofa and thudded up the stairs two at a time, slamming his door so hard the landing light flickered."</b></p>
<p>Nobody wrote the word "furious". Nobody wrote "upset" either. So how do you know EXACTLY how Jarlath feels? You add up the clues: hurling, thudding, slamming. Three actions, one feeling underneath them all. That is the entire trick — the text hands you the clues, and your job is the sum.</p>`,
    },
    {
      type: 'show',
      title: 'The Big Match',
      html: `<p>Here is a fresh mini-passage. Read it carefully — nobody in it ever announces how they feel.</p>
<ol class="mini-passage">
<li>Michael sat on the bench and stared out at the empty pitch.</li>
<li>His hands would not stop moving, tapping out a rhythm on his knees.</li>
<li>He checked his watch, then checked it again barely ten seconds later.</li>
<li>"You'll be fine," said his sister gently, but he only nodded and looked away.</li>
<li>He tried to tie his laces and got the knot muddled twice.</li>
<li>When the whistle finally blew for warm-ups, he jumped as if he'd been stung.</li>
<li>His water bottle slipped from his fingers and rolled under the bench.</li>
<li>Coach Reyes clapped her hands and called his name for the starting eleven.</li>
<li>Michael let out a long breath, picked up the bottle, and finally smiled.</li>
</ol>`,
    },
    {
      type: 'talk',
      text: "So then — how did Michael feel before kick-off? Go on, look back. The passage never once tells you outright. Read those lines again with your Sniff-It-Out Snout switched ON…",
    },
    {
      type: 'show',
      title: 'Adding Up The Clues',
      html: `<p>Here is how a champion sniffer works through it. Never trust just ONE clue — collect several and see what they add up to.</p>
<ul>
<li><b>Line 2</b> — hands that will not stop moving. A body doing something it can't control.</li>
<li><b>Line 3</b> — checking his watch twice in ten seconds. That's someone who cannot settle.</li>
<li><b>Line 5</b> — fumbling a simple knot he's tied a thousand times before.</li>
<li><b>Line 6</b> — jumping at the whistle "as if he'd been stung". A tiny, ordinary sound feels enormous.</li>
</ul>
<p>Four separate clues, all pointing the SAME way. Add them up and they sniff out one feeling: Michael is nervous, even though the word "nervous" is never written anywhere on the page.</p>
<div class="law-scroll">📜 <b>THE SNIFF-IT-OUT LAW:</b> ${RULE}</div>
<p>Watch for that trap word "beware" above! An answer that says a character is <i>always</i> confident, or <i>never</i> worried, or <i>entirely</i> fine is almost always a fake — real feelings in real stories are rarely that simple, and Line 9 proves it: by the end, Michael's breath and his smile show the nerves have lifted.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'btl-try-1', topicId: 'between-lines', tier: 1, format: 'mcq5',
        lineRef: '2-7',
        stem: 'What do lines 2, 3, 5 and 6 add up to suggest Michael is feeling as he waits for kick-off?',
        options: [
          { text: 'Nervous, even though he tries not to show it', misconception: null },
          { text: "Annoyed that his sister keeps talking to him", misconception: 'plausible-misreading' },
          { text: 'Certain that he will never be picked for the team', misconception: 'absolute-bait' },
          { text: 'Full of energy with nothing at all on his mind', misconception: 'clearly-wrong' },
          { text: 'Cross with Coach Reyes for arriving late', misconception: 'clearly-wrong' },
        ],
        correctIndex: 0,
        hintSteps: [
          "Look at what his BODY does, not what anyone SAYS — lines 2, 3, 5 and 6 all show the same kind of behaviour.",
          'Fidgeting hands, checking a watch twice, a muddled knot, jumping at a whistle — what one feeling causes ALL of those at once?',
        ],
        explain: {
          rule: RULE,
          worked: "Add the clues: restless hands (line 2), checking the time obsessively (line 3), a fumbled knot (line 5) and jumping at the whistle (line 6). Four separate clues pointing the same way sniff out one answer — nerves — even though the passage never uses that word.",
          whyWrong: {
            "Annoyed that his sister keeps talking to him": "She speaks to him only once, gently, in line 4 — that single moment can't explain the fidgeting, the watch-checking or the fumbled knot.",
            "Certain that he will never be picked for the team": "Watch the trap word \"never\" — the passage shows worry, not a fixed belief about being picked at all.",
            "Full of energy with nothing at all on his mind": "Restless energy from nerves looks nothing like carefree energy — a truly relaxed player doesn't fumble a knot he's tied a thousand times.",
            "Cross with Coach Reyes for arriving late": "Coach Reyes isn't described as late anywhere — this clue simply isn't in the text.",
          },
        },
      },
    },
    {
      type: 'try',
      q: {
        id: 'btl-try-2', topicId: 'between-lines', tier: 2, format: 'mcq5',
        lineRef: '9',
        stem: "Why does Michael finally smile in line 9?",
        options: [
          { text: 'He feels relieved and happy to have been picked for the team', misconception: null },
          { text: 'He is simply glad to have found his water bottle again', misconception: 'plausible-misreading' },
          { text: 'He is now entirely certain he will never feel nervous again', misconception: 'absolute-bait' },
          { text: 'He is laughing at something Coach Reyes just said', misconception: 'clearly-wrong' },
          { text: 'He has just heard that the match has been cancelled', misconception: 'clearly-wrong' },
        ],
        correctIndex: 0,
        hintSteps: [
          "Look at what happens in the line JUST before the smile — line 8 — before you decide what caused it.",
          "Coach Reyes calls his name for the starting eleven, THEN he breathes out and smiles. What does that order of events tell you?",
        ],
        explain: {
          rule: RULE,
          worked: "Line 8 is the turning point: Coach Reyes calls Michael's name for the starting eleven. Straight after, he breathes out and smiles — the long breath is relief leaving his body, and the smile is happiness at being picked, closing the loop that opened with all his nervous fidgeting.",
          whyWrong: {
            'He is simply glad to have found his water bottle again': "That's a real detail from line 7, but it's a small, ordinary event — it can't explain the long breath of relief that lands straight after being picked for the team.",
            'He is now entirely certain he will never feel nervous again': "Watch the trap words \"entirely\" and \"never\" — the passage tells you about this one moment, not a promise about every match to come.",
            'He is laughing at something Coach Reyes just said': "Coach Reyes only calls his name — no joke or funny comment is described anywhere in the text.",
            'He has just heard that the match has been cancelled': "There is no mention of the match being cancelled — in fact he's just been named in the starting eleven, so the match is clearly still on.",
          },
        },
      },
    },
    { type: 'anim', anim: 'between-lines' },
    { type: 'weapon' },
  ],

  tips: [
    "The text gives you clues, not the answer — your job is to add them up, just like Nudge-Nudge Ned would.",
    "Look at what a character DOES, not just what they SAY. Actions often give away far more than words.",
    "One clue on its own can mislead you — collect two or three clues that all point the same way before you decide.",
    "Beware answer options with 'always', 'never', 'entirely' or 'completely' — real feelings in real stories are rarely that absolute.",
    "A change partway through a passage (a breath, a smile, a shrug) is often the biggest clue of all — it shows a feeling shifting.",
    "If an option describes something the passage never actually mentions, it can't be the answer — however sensible it sounds.",
  ],
};
