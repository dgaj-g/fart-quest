// FART QUEST topic: The Maybe Ledge — probability & likelihood (Chance Cliffs)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'probability',
  name: 'The Maybe Ledge',
  region: 'chance-cliffs',
  genId: 'probability',
  tagline: 'Where nothing is ever quite certain — except the view.',

  creature: {
    id: 'maybe-marvin',
    name: 'Maybe-Marvin',
    rarity: 'rare',
    image: 'assets/monsters/maybe-marvin.png',
    bio: 'Poor Marvin has never once finished a decision: heads or tails, left or right, sprouts or no sprouts — he just shrugs. He lives EXACTLY halfway along the Likelihood Line, which is extremely on-brand.',
    factSneak: 'Every chance sits somewhere between IMPOSSIBLE and CERTAIN — and slap in the middle sits EVENS, the fifty-fifty spot.',
  },

  weapon: {
    id: 'chance-compass',
    name: 'The Chance Compass',
    tagline: 'Point it at anything and it tells you exactly how likely it is.',
    rule: 'Impossible–unlikely–evens–likely–certain. For dice: wanted outcomes out of six.',
    example: 'Chance of rolling an EVEN number on a fair dice numbered 1–6: the evens are 2, 4, 6 → <b>3 out of 6</b> (that’s the same as evens!).',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-probability',
      text: 'Greetings, my marvellously undecided hero! Up here on the Maybe Ledge lives poor Marvin — he can NEVER work out if something WILL happen or WON’T. Today I shall teach you five magic words and one simple line that let YOU know his mind better than he does. Behold!',
    },
    {
      type: 'show',
      title: 'The Likelihood Line',
      html: `<p>Everything that could ever happen sits SOMEWHERE on this line. One end is things that can <b>NEVER</b> happen. The other end is things that <b>MUST</b> happen. And there are three stops in between.</p>
<div class="numline" data-min="impossible" data-max="certain">
  <div class="camp camp-a">IMPOSSIBLE</div>
  <div class="numline-track">
    <span class="tick"></span><span class="tick"></span><span class="tick"></span>
    <span class="numline-marker" style="--pos:2%">\u{1F3B2} rolling a 7 on a dice</span>
    <span class="numline-marker" style="--pos:50%">\u{1FA99} coin lands on heads</span>
    <span class="numline-marker" style="--pos:98%">☀️ the sun rises tomorrow</span>
  </div>
  <div class="camp camp-b">CERTAIN</div>
</div>
<div style="display:flex;justify-content:space-between;font-weight:700;margin-top:4px;font-size:14px;">
  <span>Impossible</span><span>Unlikely</span><span>Evens</span><span>Likely</span><span>Certain</span>
</div>
<p>Five words, always in that order: <b>Impossible → Unlikely → Evens → Likely → Certain</b>. Learn them like a marching chant — the papers use every single one.</p>`,
    },
    {
      type: 'talk',
      text: 'The word right in the MIDDLE is the important one: <b>Evens</b>. It means fifty-fifty — EXACTLY half the time, no more, no less. A fair coin landing on heads? Evens. And here’s the bit that wins you marks: for a dice or a bag of counters, the chance is always however many outcomes you WANT, out of however many there are ALTOGETHER. My Chance Compass calls it "wanted out of total".',
    },
    {
      type: 'try',
      q: {
        id: 'prob-try-1', topicId: 'probability', tier: 1, format: 'mcq5',
        stem: 'Marvin flips a fair coin. Where does <b>"it lands on heads"</b> sit on the Likelihood Line?',
        options: [
          { text: 'Evens', misconception: null },
          { text: 'Likely', misconception: 'overestimate' },
          { text: 'Certain', misconception: 'over-certain' },
          { text: 'Unlikely', misconception: 'underestimate' },
        ],
        correctIndex: 0,
        hintSteps: [
          'A coin only has TWO sides — heads and tails. How many of those two are heads?',
          '1 out of 2 is exactly half. What’s the word on the Likelihood Line for "exactly half"?',
        ],
        explain: {
          rule: 'Impossible–unlikely–evens–likely–certain. For dice: wanted outcomes out of six.',
          worked: '1 side out of 2 is heads — that’s exactly half, which is Evens.',
          whyWrong: {
            'Likely': 'Likely means MORE than half the time — a coin gives heads only half the time, not more.',
            'Certain': 'Certain means it MUST happen every time — but tails is still possible too!',
            'Unlikely': 'Unlikely means LESS than half the time — but heads happens exactly half the time.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Fair or Not Fair?',
      html: `<p><b>Fair</b> does NOT mean "nice" or "pretty" — in chance-world it means every outcome has an <b>EQUAL</b> slice of the pie. Look at these two spinners:</p>
<div style="display:flex;gap:28px;justify-content:center;align-items:flex-end;margin:18px 0;flex-wrap:wrap;">
  <div style="text-align:center;">
    <div style="width:120px;height:120px;border-radius:50%;margin:0 auto 8px;border:3px solid #333;background:conic-gradient(#c0392b 0deg 90deg, #2e6da4 90deg 180deg, #3ba55c 180deg 270deg, #d9a21b 270deg 360deg);"></div>
    <b>Fair</b> — 4 equal slices
  </div>
  <div style="text-align:center;">
    <div style="width:120px;height:120px;border-radius:50%;margin:0 auto 8px;border:3px solid #333;background:conic-gradient(#c0392b 0deg 270deg, #2e6da4 270deg 360deg);"></div>
    <b>Not fair</b> — red’s slice is huge
  </div>
</div>
<p>The left spinner is <b>fair</b>: every colour gets the same size slice, so every colour has an equal chance. The right one is <b>NOT fair</b>: red takes up three-quarters of the circle, so red is far more likely than blue — even though it’s still just one spin.</p>
<p>And here’s a trap Marvin falls for constantly: a FAIR dice has no memory. Roll five 3s in a row and the next roll is <b>still</b> 1 out of 6 for every number — the dice does NOT owe you a 6. "It’s due!" is nonsense. Don’t fall for it.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'prob-try-2', topicId: 'probability', tier: 1, format: 'mcq5',
        stem: 'A spinner has 4 equal-sized slices: red, blue, green, yellow. Is this a <b>fair</b> way to choose a colour?',
        options: [
          { text: 'Yes — every colour has the same size slice', misconception: null },
          { text: 'No — there are too many colours to be fair', misconception: 'irrelevant-count' },
          { text: 'No — red always wins', misconception: 'baseless-bias' },
          { text: 'Yes — because it’s nice and colourful', misconception: 'fair-is-nice' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Look at the sizes of the four slices — are they all exactly the same size?',
          'Fair means EQUAL chance for every outcome, nothing to do with how many colours or how pretty it looks.',
        ],
        explain: {
          rule: 'Impossible–unlikely–evens–likely–certain. For dice: wanted outcomes out of six.',
          worked: 'All 4 slices are the same size, so all 4 colours have an equal chance — that IS fair.',
          whyWrong: {
            'No — there are too many colours to be fair': 'The number of colours doesn’t matter — only whether the slices are EQUAL sizes.',
            'No — red always wins': 'There’s no reason red would win more often — every equal slice has the same chance.',
            'Yes — because it’s nice and colourful': 'Fair has nothing to do with looking nice — it means every slice is the SAME SIZE.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'The Chance Compass: wanted out of total',
      html: `<p>Ready for the actual weapon? For a dice or a bag of counters, the chance of something is always:</p>
<div class="law-scroll">\u{1F9ED} <b>WANTED OUT OF TOTAL:</b> count how many outcomes you WANT, then write it as "that many out of the total".</div>
<p>Example: a fair dice numbered 1–6. What’s the chance of rolling an EVEN number? The evens are 2, 4, 6 — that’s <b>3 out of 6</b>. Simple as that.</p>
<div class="estimate-demo">
  <div class="est-line">Wanted: 2, 4, 6 → <b>3 numbers</b></div>
  <div class="est-line">Total: 1, 2, 3, 4, 5, 6 → <b>6 numbers</b></div>
  <div class="est-line">Chance = <b>3 out of 6</b> <span class="est-note">(which is exactly the same as Evens!)</span></div>
</div>
<p>One more trick for exams: if a question asks for the chance of <b>NOT</b> something, just take your "wanted" away from the total. 3 out of 6 are even, so 3 out of 6 are NOT even too — always double-check by making sure both halves add back up to the total.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'prob-try-3', topicId: 'probability', tier: 2, format: 'mcq5',
        stem: 'A fair dice numbered 1–6 is rolled once. What is the chance of rolling a number <b>greater than 4</b>?',
        options: [
          { text: '2 out of 6', misconception: null },
          { text: '4 out of 6', misconception: 'complement-swap' },
          { text: '1 out of 6', misconception: 'miscount-under' },
          { text: '3 out of 6', misconception: 'miscount-over' },
          { text: '6 out of 6', misconception: 'certain-confusion' },
        ],
        correctIndex: 0,
        hintSteps: [
          'List the numbers 1 to 6, then circle the ones greater than 4 — which ones count?',
          'Only 5 and 6 are greater than 4. How many is that, out of the 6 total?',
        ],
        explain: {
          rule: 'Impossible–unlikely–evens–likely–certain. For dice: wanted outcomes out of six.',
          worked: 'Numbers greater than 4 on a 1–6 dice: 5 and 6 — that’s 2 out of 6.',
          whyWrong: {
            '4 out of 6': 'That’s the numbers NOT greater than 4 (1,2,3,4) — you swapped wanted and not-wanted.',
            '1 out of 6': 'Check again — both 5 AND 6 are greater than 4, that’s two numbers, not one.',
            '3 out of 6': 'Careful — 4 itself is NOT greater than 4, only 5 and 6 count.',
            '6 out of 6': 'That would mean EVERY number is greater than 4, which isn’t true — count again.',
          },
        },
      },
    },
    { type: 'anim', anim: 'probability' },
    { type: 'weapon' },
  ],

  tips: [
    'The Likelihood Line always runs in this order: Impossible → Unlikely → Evens → Likely → Certain. Papers use all five words — learn them by heart.',
    'Evens means fifty-fifty — EXACTLY half the time, no more, no less. A fair coin lands on heads on Evens.',
    'For dice and bags of counters: count the outcomes you WANT, then write it as "wanted out of total". A normal dice always has 6 total outcomes.',
    'Fair does NOT mean "nice" or "colourful" — it means every outcome has an EQUAL-sized chance. Check the slice sizes, not the colours.',
    'Unlikely is NOT the same as impossible. Unlikely can still happen — impossible means it can NEVER happen, no matter what.',
    'Dice and coins have no memory. Rolled five 3s in a row? The next roll is STILL 1 out of 6 for every number — it is NOT "due" a 6.',
    '3 out of 6 and 1 out of 2 are the exact SAME chance. Simplify in your head to spot when two probability statements actually agree.',
    'If a question asks for the chance of something NOT happening, take your "wanted" count away from the total — don’t start counting from scratch.',
  ],
};
