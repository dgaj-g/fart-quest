// FART QUEST topic: The Pie Bakery — pie charts (The Data Dump)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'pie-charts',
  name: 'The Pie Bakery',
  region: 'data-dump',
  genId: 'piecharts',
  tagline: 'Where every slice tells you exactly how many people wanted it — IF you know what the whole pie is worth.',

  creature: {
    id: 'pie-face',
    name: 'Pie-Face',
    rarity: 'rare',
    image: 'assets/monsters/pie-face.png',
    bio: 'Pie-Face bakes exactly one pie a day and guards every last slice of it with his life — which is only fair, since his pie is precisely everyone who visited the bakery that day, not a crumb more. Ask him for “half the pie” and he will cut you exactly half of everyone. No arguments.',
    factSneak: 'The whole pie = everyone. Half the pie = half of everyone.',
  },

  weapon: {
    id: 'slice-splitter',
    name: 'The Slice Splitter',
    tagline: 'Read any pie chart like a seasoned baker — slice size tells the whole story.',
    rule: 'The whole pie = everything. Half the pie = half of everything.',
    example: '36 pupils were asked their favourite pet. The whole pie is all 36 of them. Half the pie = half of 36 = <b>18</b> pupils.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-piecharts',
      text: 'Ahhh, welcome to the bakery, my brave nose-soldier! This is Pie-Face, and he bakes exactly ONE pie every single day — sliced up by what people chose. Here is his golden rule, guarded more fiercely than his till: <b>the WHOLE pie is EVERYONE who was asked.</b> Not a hundred people. Not "loads". Whatever number was actually surveyed — that is the whole pie, every last crumb of it.',
    },
    {
      type: 'show',
      title: 'The Whole Pie Is Everyone',
      html: `<p>Pie-Face asked <b>40 pupils</b> their favourite pet. He baked their answers into a pie chart:</p>
<div style="display:flex;gap:22px;justify-content:center;align-items:center;flex-wrap:wrap;margin:18px 0;">
  <div style="width:150px;height:150px;border-radius:50%;border:3px solid #333;background:conic-gradient(#5b7fa6 0% 50%, #c98a52 50% 75%, #6e9b6e 75% 90%, #b06a86 90% 100%);flex:0 0 auto;"></div>
  <div style="font-size:17px;line-height:1.7;">
    <div><span style="display:inline-block;width:14px;height:14px;background:#5b7fa6;border-radius:3px;margin-right:8px;"></span><b>Dog</b> — 20 pupils</div>
    <div><span style="display:inline-block;width:14px;height:14px;background:#c98a52;border-radius:3px;margin-right:8px;"></span><b>Cat</b> — 10 pupils</div>
    <div><span style="display:inline-block;width:14px;height:14px;background:#6e9b6e;border-radius:3px;margin-right:8px;"></span><b>Fish</b> — 6 pupils</div>
    <div><span style="display:inline-block;width:14px;height:14px;background:#b06a86;border-radius:3px;margin-right:8px;"></span><b>Rabbit</b> — 4 pupils</div>
  </div>
</div>
<p>Add those up: 20 + 10 + 6 + 4 = <b>40</b> — exactly the number of pupils Pie-Face asked. That whole circle is ALL of them, sliced up by what they picked. The BIGGEST slice (Dog) is the most popular answer. The SMALLEST slice (Rabbit) is the least popular. You don’t need to calculate a single thing to spot that — just look at which slice is fattest and which is skinniest.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'pie-try-1', topicId: 'pie-charts', tier: 1, format: 'mcq5',
        stem: '40 pupils were asked their favourite pet. Which pet was the <b>MOST</b> popular?',
        visual: { kind: 'pie', sectors: [{ label: 'Dog', value: 20 }, { label: 'Cat', value: 10 }, { label: 'Fish', value: 6 }, { label: 'Rabbit', value: 4 }] },
        options: [
          { text: 'Dog', misconception: null },
          { text: 'Cat', misconception: 'second-biggest' },
          { text: 'Fish', misconception: 'random-slice' },
          { text: 'Rabbit', misconception: 'picked-smallest' },
        ],
        correctIndex: 0,
        hintSteps: [
          'You don’t need to add anything up for this one — just LOOK at the pie. Which slice takes up the most room?',
          'The biggest slice belongs to Dog. Biggest slice = most popular answer.',
        ],
        explain: {
          rule: 'The whole pie = everything. Half the pie = half of everything.',
          worked: 'Dog’s slice is the biggest one on the pie — bigger slice always means more pupils chose it. Dog is the most popular pet.',
          whyWrong: {
            'Cat': 'Cat’s slice is the second-biggest — bigger than Fish and Rabbit, but smaller than Dog.',
            'Fish': 'Fish has one of the smallest slices, not the biggest — check again which slice takes up the most of the circle.',
            'Rabbit': 'Rabbit has the SMALLEST slice of all — that’s the LEAST popular pet, the opposite of what the question asks.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Half the Pie, Half the People',
      html: `<p>Pie-Face also asked <b>40 pupils</b> their favourite sport:</p>
<div style="display:flex;gap:22px;justify-content:center;align-items:center;flex-wrap:wrap;margin:18px 0;">
  <div style="width:150px;height:150px;border-radius:50%;border:3px solid #333;background:conic-gradient(#5b7fa6 0% 50%, #c98a52 50% 75%, #6e9b6e 75% 90%, #b06a86 90% 100%);flex:0 0 auto;"></div>
  <div style="font-size:17px;line-height:1.7;">
    <div><span style="display:inline-block;width:14px;height:14px;background:#5b7fa6;border-radius:3px;margin-right:8px;"></span><b>Football</b> — <u>HALF</u> the pie</div>
    <div><span style="display:inline-block;width:14px;height:14px;background:#c98a52;border-radius:3px;margin-right:8px;"></span><b>Swimming</b> — a <u>QUARTER</u> of the pie</div>
    <div><span style="display:inline-block;width:14px;height:14px;background:#6e9b6e;border-radius:3px;margin-right:8px;"></span><b>Athletics</b> — 6 pupils</div>
    <div><span style="display:inline-block;width:14px;height:14px;background:#b06a86;border-radius:3px;margin-right:8px;"></span><b>Rugby</b> — 4 pupils</div>
  </div>
</div>
<p>The question says HALF the pie chose Football. Half of the pie means <b>half of the 40 pupils</b> — not half of 100, not half of some other number Pie-Face never mentioned. Half of 40 = <b>20</b> pupils chose Football.</p>
<p>Swimming is a QUARTER of the pie — a quarter of 40 = <b>10</b> pupils. That leaves 10 pupils split between Athletics (6) and Rugby (4), and 20 + 10 + 6 + 4 = 40. Every slice comes from the SAME whole.</p>
<div class="law-scroll">📜 The whole pie = everything. Half the pie = half of everything.</div>`,
    },
    {
      type: 'try',
      q: {
        id: 'pie-try-2', topicId: 'pie-charts', tier: 2, format: 'mcq5',
        stem: '40 pupils were asked their favourite sport. A <b>QUARTER</b> of the pie chose Swimming. How many pupils chose Swimming?',
        options: [
          { text: '10', misconception: null },
          { text: '20', misconception: 'half-not-quarter' },
          { text: '4', misconception: 'fraction-as-count' },
          { text: '30', misconception: 'found-the-rest' },
          { text: '160', misconception: 'multiplied-not-divided' },
        ],
        correctIndex: 0,
        hintSteps: [
          'A QUARTER of the pie means a quarter of the WHOLE 40 pupils. Divide 40 by 4.',
          '40 ÷ 4 = …?',
        ],
        explain: {
          rule: 'The whole pie = everything. Half the pie = half of everything.',
          worked: 'A quarter of the pie = a quarter of 40. 40 ÷ 4 = 10 pupils chose Swimming.',
          whyWrong: {
            '20': 'That’s HALF of 40 — but the question says a QUARTER, which is a smaller slice than half.',
            '4': 'That treats “a quarter” as if it were literally the number 4 — a quarter is a FRACTION of the total, so you must divide 40 by 4, not just write down the 4.',
            '30': 'That’s the pupils who did NOT choose Swimming (40 − 10) — the question asks how many DID choose it.',
            '160': 'That multiplies instead of dividing — a quarter is SMALLER than the whole, so the answer must be smaller than 40, not bigger.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Percentages On The Pie',
      html: `<p>Here is another way Pie-Face labels his pies: instead of writing the headcount on each slice, sometimes he writes a <b>percentage</b>. Mixing up the percentage with the actual number of pupils is the single most common pie-chart mistake in the whole exam.</p>
<p>Pie-Face asked <b>200 pupils</b> their favourite school subject. Watch how each slice’s PERCENTAGE turns into a real headcount:</p>
<table style="width:100%;border-collapse:collapse;margin:14px 0;font-size:17px;text-align:center;">
  <thead>
    <tr style="background:var(--swamp-deep);color:var(--gold);">
      <th style="padding:8px;border-radius:10px 0 0 0;">Subject</th><th style="padding:8px;">Percentage</th><th style="padding:8px;border-radius:0 10px 0 0;">Pupils</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:rgba(0,0,0,.04);"><td style="padding:7px;">Maths</td><td style="padding:7px;">50%</td><td style="padding:7px;">0.5 × 200 = <b>100</b></td></tr>
    <tr><td style="padding:7px;">English</td><td style="padding:7px;">25%</td><td style="padding:7px;">0.25 × 200 = <b>50</b></td></tr>
    <tr style="background:rgba(0,0,0,.04);"><td style="padding:7px;">Art</td><td style="padding:7px;">15%</td><td style="padding:7px;">0.15 × 200 = <b>30</b></td></tr>
    <tr><td style="padding:7px;">PE</td><td style="padding:7px;">10%</td><td style="padding:7px;">0.10 × 200 = <b>20</b></td></tr>
  </tbody>
</table>
<p>Check it: 50 + 25 + 15 + 10 = <b>100</b>. Every time. A pie chart’s percentages always add up to 100%, not the headcount. If your slice percentages don’t add up to 100, something slipped.</p>
<div class="law-scroll">📜 To turn a percentage into a headcount: change the percentage to a decimal (÷100), then multiply by the total.</div>`,
    },
    {
      type: 'talk',
      text: 'This is the trick that wins you marks under exam pressure, o mighty stinker: whatever the question shows you — a pie picture, a table of numbers, or a labelled percentage — it is ALWAYS the same whole pie underneath. Find the total, find the fraction (or the percentage), and the Slice Splitter does the rest.',
    },
    {
      type: 'try',
      q: {
        id: 'pie-try-3', topicId: 'pie-charts', tier: 3, format: 'num',
        stem: '200 pupils were asked their favourite school subject. Maths is shown as <b>50%</b> of the pie chart. How many pupils chose Maths?',
        accept: ['100'],
        hintSteps: [
          'Turn 50% into a decimal: 50 ÷ 100 = 0.5.',
          'Now multiply that decimal by the total: 0.5 × 200.',
        ],
        explain: {
          rule: 'To turn a percentage into a headcount: change the percentage to a decimal (÷100), then multiply by the total.',
          worked: '50 ÷ 100 = 0.5. 0.5 × 200 = 100.',
          whyWrong: {},
        },
      },
    },
    { type: 'anim', anim: 'pie-charts' },
    { type: 'weapon' },
  ],

  tips: [
    'For “most popular” or “least popular”, just LOOK at the slices — the biggest slice is the most popular answer, the smallest is the least. No calculation needed.',
    'The whole pie is EVERYONE who was actually asked — whatever total the question gives you. Never assume it means 100 people.',
    '“Half the pie” = half of the TOTAL. “A quarter of the pie” = a quarter of the TOTAL. Turn the fraction word into a division: half → ÷2, quarter → ÷4.',
    'A pie chart’s percentages always add up to 100%, not the headcount. If your slice percentages don’t add up to 100, a slip crept in somewhere.',
    'To turn a percentage into a headcount: change the percentage to a decimal (÷100), then multiply by the total. 50% of 200 → 0.5 × 200 = 100.',
    'To go backwards from a headcount to a percentage: divide the count by the total, then multiply by 100.',
    'A pie chart, a table and a list of percentages can all describe the exact SAME pupils — whichever one the question shows you, find the total first, then work out the fraction or percentage from there.',
  ],
};
