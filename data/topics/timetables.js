// FART QUEST topic: The Timetable Terminus (Measure Marsh)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'timetables',
  name: 'The Timetable Terminus',
  region: 'measure-marsh',
  genId: 'timetables',
  tagline: 'Where every bus is running to a plan… just never the one you expect.',

  creature: {
    id: 'bus-conductor-bogface',
    name: 'Bus-Conductor Bogface',
    rarity: 'rare',
    image: 'assets/monsters/bus-conductor-bogface.png',
    bio: 'Bogface has driven every route through Measure Marsh for four hundred years and has never once arrived on time — mostly because he keeps stopping mid-road to double-check the grid with his own enormous finger. Smells of diesel, damp tickets and mild panic.',
    factSneak: 'Reading a timetable: one finger on the ROW, one finger on the COLUMN — read where they meet.',
  },

  weapon: {
    id: 'finger-track',
    name: 'The Finger-Track',
    tagline: 'Never lose your place on a timetable again — and never mis-time a journey.',
    rule: 'One finger on the row, one on the column — read where they meet. For journey time, count UP to the next hour, then on.',
    example: 'Bus B’s row meets the Terminus column at <b>09:17</b> — that’s where your finger lands.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-timetables',
      text: 'Parp-parp! All aboard, young stinker — I am <b>Bus-Conductor Bogface</b>, and I have driven every route through this marsh for four hundred years. Have I EVER arrived on time? Not once. But YOU are about to learn the one trick that means <b>you</b> never get it wrong: the Finger-Track. Climb on, we’re reading a timetable!',
    },
    {
      type: 'show',
      title: 'One finger on the row, one on the column',
      html: `<p>A timetable is just a big grid. Down the side are the <b>stops</b> — the ROWS. Along the top are the <b>buses</b> — the COLUMNS. To find any time at all, put one finger on the row and one finger on the column, and slide them together until they MEET.</p>
<div style="overflow-x:auto;">
<table style="border-collapse:collapse; width:100%; font-size:15px;">
<tr style="background:#e9e3d2;"><th style="border:1px solid #595959; padding:8px;">Stop</th><th style="border:1px solid #595959; padding:8px;">Bus A</th><th style="border:1px solid #595959; padding:8px;">Bus B</th><th style="border:1px solid #595959; padding:8px;">Bus C</th><th style="border:1px solid #595959; padding:8px;">Bus D</th></tr>
<tr><td style="border:1px solid #595959; padding:8px; font-weight:700;">Village Green</td><td style="border:1px solid #595959; padding:8px;">08:05</td><td style="border:1px solid #595959; padding:8px; background:#fff3c9;">08:35</td><td style="border:1px solid #595959; padding:8px;">09:05</td><td style="border:1px solid #595959; padding:8px;">09:35</td></tr>
<tr><td style="border:1px solid #595959; padding:8px; font-weight:700;">Market Square</td><td style="border:1px solid #595959; padding:8px;">08:20</td><td style="border:1px solid #595959; padding:8px; background:#fff3c9;">08:50</td><td style="border:1px solid #595959; padding:8px;">09:20</td><td style="border:1px solid #595959; padding:8px;">09:50</td></tr>
<tr><td style="border:1px solid #595959; padding:8px; font-weight:700;">The Terminus</td><td style="border:1px solid #595959; padding:8px;">08:47</td><td style="border:1px solid #595959; padding:8px; background:#fff3c9;">09:17</td><td style="border:1px solid #595959; padding:8px;">09:47</td><td style="border:1px solid #595959; padding:8px;">10:17</td></tr>
</table>
</div>
<p>Want to know what time <b>Bus B</b> leaves <b>Market Square</b>? Finger on the Market Square row… finger on the Bus B column… slide until they meet: <b>08:50</b>. That’s the whole trick. Nothing more to it — just don’t let your fingers wander!</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'tt-try-1', topicId: 'timetables', tier: 1, format: 'mcq5',
        stem: 'Using Bogface’s timetable above, what time does <b>Bus C</b> arrive at <b>The Terminus</b>?',
        options: [
          { text: '09:47', misconception: null },
          { text: '09:20', misconception: 'wrong-stop' },
          { text: '09:17', misconception: 'wrong-bus' },
          { text: '10:17', misconception: 'wrong-bus' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Find the Bus C column first, then find The Terminus row.',
          'Slide your fingers until they meet — that cell is the answer.',
        ],
        explain: {
          rule: 'One finger on the row, one on the column — read where they meet. For journey time, count UP to the next hour, then on.',
          worked: 'The Terminus row meets the Bus C column at 09:47.',
          whyWrong: {
            '09:20': 'That’s Bus C at Market Square — one row too early. Check The Terminus row.',
            '09:17': 'That’s Bus B’s time, not Bus C’s — one column too far left.',
            '10:17': 'That’s Bus D’s time, not Bus C’s — one column too far right.',
          },
        },
      },
    },
    {
      type: 'talk',
      text: 'Now then — reading a single time is easy. But how long does the WHOLE journey take? Here’s where every hero (and every conductor, if I’m honest) trips up: clock times are NOT like ordinary numbers. There is no such thing as “70 minutes past the hour” — once you hit 60, the hour rolls over! So we NEVER subtract clock times the normal way. We <b>count UP</b> instead.',
    },
    {
      type: 'show',
      title: 'Count UP to the next hour, then on',
      html: `<p>Bus A leaves <b>Village Green</b> at <b>08:05</b> and arrives at <b>The Terminus</b> at <b>08:47</b>. How long is that journey?</p>
<div class="estimate-demo">
  <div class="est-line">08:05 − 08:47 = ❌ <span class="est-note">NOT how clocks work!</span></div>
  <div class="est-line">↓ count UP instead ↓</div>
  <div class="est-line">08:05 → 08:47 is <b>42 minutes</b> ✅ <span class="est-note">just count on!</span></div>
</div>
<p>Since both times are inside the SAME hour here, you can just count on from 05 to 47: that’s 42 minutes. But when a journey crosses OVER an hour — say, 07:45 to 08:20 — count UP to the next hour first (07:45 → 08:00 is 15 minutes), THEN keep counting on (08:00 → 08:20 is another 20 minutes). Add the two pieces: 15 + 20 = <b>35 minutes</b>. That is the Finger-Track’s second trick, and it NEVER fails you.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'tt-try-2', topicId: 'timetables', tier: 2, format: 'mcq5',
        stem: 'Bus D leaves <b>Village Green</b> at <b>09:35</b> and arrives at <b>The Terminus</b> at <b>10:17</b>. How long does the whole journey take? Give your answer in minutes.',
        options: [
          { text: '42', misconception: null },
          { text: '82', misconception: 'digit-subtraction' },
          { text: '12', misconception: 'partial-leg' },
          { text: '30', misconception: 'partial-leg' },
          { text: '38', misconception: 'padded-near-miss' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Count UP from 09:35 to the next whole hour first: 09:35 → 10:00.',
          'Then keep counting on from 10:00 → 10:17. Add the two pieces together.',
        ],
        explain: {
          rule: 'One finger on the row, one on the column — read where they meet. For journey time, count UP to the next hour, then on.',
          worked: '09:35 → 10:00 is 25 minutes. 10:00 → 10:17 is another 17 minutes. 25 + 17 = 42 minutes.',
          whyWrong: {
            '82': 'That subtracts the clock times like ordinary numbers (10:17 − 9:35 read as 1017 − 935) — but 60 minutes make an hour, not 100. Count UP instead.',
            '12': 'That’s only the Market Square-to-Terminus leg — the WHOLE journey starts at Village Green.',
            '30': 'That’s only the Village-Green-to-Market-Square leg — the WHOLE journey ends at The Terminus.',
            '38': 'Close, but count the two pieces again carefully: to the hour, then on.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'The best bus to catch',
      html: `<p>Exam papers love asking: <b>“Which bus should you catch to arrive by a certain time?”</b> The trick is simple — run your finger along the arrival row and find the LATEST bus that STILL arrives by the deadline. Not the earliest safe one — the latest one, so you don’t waste time waiting around.</p>
<div class="law-scroll">🚌 Need to arrive by 09:30? Bus A (08:47) and Bus B (09:17) both make it — but Bus B is later, so Bus B is the one to catch. Bus C (09:47) is too late.</div>
<p>And one more trap for the record books: <b>Bogface’s last bus of the night sometimes crosses midnight.</b> If it leaves at 23:42 and arrives at 00:15, don’t panic — count UP to midnight first (23:42 → 00:00 is 18 minutes), then keep counting on to the arrival time (00:00 → 00:15 is another 15 minutes). 18 + 15 = <b>33 minutes</b>. Midnight doesn’t stop the count — it’s just another camp along the road.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'tt-try-3', topicId: 'timetables', tier: 3, format: 'num',
        stem: 'The last bus of the night leaves <b>Village Green</b> at <b>23:48</b> and arrives at <b>The Terminus</b> at <b>00:20 the next day</b>. How many minutes does the journey take?',
        unit: 'min',
        accept: ['32'],
        hintSteps: [
          'Count UP to midnight first: 23:48 → 00:00 is 12 minutes.',
          'Then keep counting from midnight to 00:20: that’s another 20 minutes. 12 + 20 = ?',
        ],
        explain: {
          rule: 'One finger on the row, one on the column — read where they meet. For journey time, count UP to the next hour, then on.',
          worked: '23:48 to midnight is 12 minutes. Midnight to 00:20 is another 20 minutes. 12 + 20 = 32 minutes.',
          whyWrong: {},
        },
      },
    },
    {
      type: 'talk',
      text: 'One last stop before you get the Finger-Track for keeps. Bogface also has to plan his shifts across a WHOLE MONTH — and months are sneaky, because they don’t all have the same number of days. October has 31. November only has 30. If you’re counting days forward and you run out of the current month, don’t panic — count how many days are LEFT in this month first, then carry the rest into the next one. Same trick as counting past an hour, just bigger camps! Say October has 31 days, and today is the 24th — what date is it 12 days later? First, how many days are LEFT in October? 31 − 24 = 7 days. That uses up 7 of your 12 days, leaving 12 − 7 = 5 days to carry into November. So the answer is the 5th of November. See? Exactly the same trick, just with days instead of minutes!',
    },
    { type: 'weapon' },
  ],

  tips: [
    'One finger on the ROW (the stop), one finger on the COLUMN (the bus) — slide until they meet. That single cell is your answer.',
    'NEVER subtract clock times like ordinary numbers. 8:20 − 7:45 is NOT 75 — 60 minutes make an hour, not 100. Always count UP instead.',
    'Journey time: count UP to the next whole hour first, then keep counting on to the arrival time. Add the two pieces together.',
    '“Which bus should I catch to arrive by a certain time?” — find the LATEST bus that still arrives by the deadline, not just any bus that gets there in time.',
    'Midnight doesn’t stop the count. Crossing from 23:xx into 00:xx the next day? Count UP to midnight, then keep counting on from midnight — exactly like counting past any other hour.',
    'Months are different lengths — always check how many days are left in the CURRENT month before carrying the rest of your count into the next one.',
    'Read the timetable calmly, one row and one column at a time. Rushing is how fingers slip onto the wrong bus — or the wrong stop!',
  ],
};
