// FART QUEST topic: The Prowler's Fence — perimeter (Measure Marsh)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'perimeter',
  name: "The Prowler's Fence",
  region: 'measure-marsh',
  genId: 'perimeter',
  tagline: 'Where every single side gets walked. Every. Single. One.',

  creature: {
    id: 'the-perimeter-prowler',
    name: 'The Perimeter Prowler',
    rarity: 'rare',
    image: 'assets/monsters/the-perimeter-prowler.png',
    bio: 'The Prowler patrols every fence in the marsh on foot, refusing to skip so much as a single hidden side — he once circled the same garden fourteen times because he "wasn\'t sure he\'d counted properly". He has never taken a shortcut in his life, and quietly judges anyone who does.',
    factSneak: 'Perimeter is the TOTAL distance all the way round a shape. Hidden sides still count — find them, then walk every one.',
  },

  weapon: {
    id: 'fence-walkers-boots',
    name: "The Fence-Walker's Boots",
    tagline: 'Walk the edge of any shape — and never miss a hidden side again.',
    rule: 'Walk EVERY side and add as you go. Hidden sides still count — find them before you walk.',
    example: 'A rectangle 6 cm by 4 cm: walk 6 + 4 + 6 + 4 = <b>20 cm</b>.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-perimeter',
      text: 'Ah, my brave whiff-warrior, meet the most stubborn creature in the whole marsh: the Perimeter Prowler. He will not — CANNOT — tell you the distance round a fence unless he has personally walked <b>every single side</b> first. Today, you learn to walk with him.',
    },
    {
      type: 'show',
      title: 'Walk every side and add as you go',
      html: `<p>Picture a rectangular paddock. Its <b>perimeter</b> is the total distance all the way round the outside. To find it, you simply <b>walk every side and add as you go</b>.</p>
<div style="position:relative;width:240px;max-width:80%;height:140px;margin:26px auto 48px;border:4px solid var(--ink);border-radius:4px;background:rgba(123,201,80,.18);">
  <span style="position:absolute;top:-30px;left:50%;transform:translateX(-50%);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;padding:5px 10px;border-radius:8px;box-shadow:0 3px 0 rgba(0,0,0,.3);white-space:nowrap;">12 m</span>
  <span style="position:absolute;bottom:-30px;left:50%;transform:translateX(-50%);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;padding:5px 10px;border-radius:8px;box-shadow:0 3px 0 rgba(0,0,0,.3);white-space:nowrap;">12 m</span>
  <span style="position:absolute;left:0;top:50%;transform:translate(-115%,-50%);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;padding:5px 10px;border-radius:8px;box-shadow:0 3px 0 rgba(0,0,0,.3);white-space:nowrap;">7 m</span>
  <span style="position:absolute;right:0;top:50%;transform:translate(115%,-50%);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;padding:5px 10px;border-radius:8px;box-shadow:0 3px 0 rgba(0,0,0,.3);white-space:nowrap;">7 m</span>
</div>
<p>Start anywhere and walk: <b>12 + 7 + 12 + 7 = 38 m</b>. That's it — that's the whole idea. Notice that opposite sides of a rectangle are always <b>equal</b>, so you always add the same two lengths twice.</p>`,
    },
    {
      type: 'talk',
      text: 'Walking one side at a time always works, but heroes love a shortcut. Since opposite sides of a rectangle are always equal, you only ever need the length and the width: <b>2 × (length + width)</b>. A <b>square</b> is even easier — all four sides are equal, so its perimeter is just <b>4 × one side</b>.',
    },
    {
      type: 'try',
      q: {
        id: 'perimeter-try-1', topicId: 'perimeter', tier: 1, format: 'mcq5',
        stem: 'The Perimeter Prowler is patrolling this rectangular paddock. Walk every side and add them up. What is the perimeter?',
        visual: {
          kind: 'ladder',
          html: `<div style="position:relative;width:230px;max-width:80%;height:130px;margin:22px auto 44px;border:4px solid var(--ink);border-radius:4px;background:rgba(123,201,80,.18);">
  <span style="position:absolute;top:-28px;left:50%;transform:translateX(-50%);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:14px;padding:4px 9px;border-radius:8px;box-shadow:0 3px 0 rgba(0,0,0,.3);white-space:nowrap;">16 m</span>
  <span style="position:absolute;bottom:-28px;left:50%;transform:translateX(-50%);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:14px;padding:4px 9px;border-radius:8px;box-shadow:0 3px 0 rgba(0,0,0,.3);white-space:nowrap;">16 m</span>
  <span style="position:absolute;left:0;top:50%;transform:translate(-112%,-50%);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:14px;padding:4px 9px;border-radius:8px;box-shadow:0 3px 0 rgba(0,0,0,.3);white-space:nowrap;">9 m</span>
  <span style="position:absolute;right:0;top:50%;transform:translate(112%,-50%);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:14px;padding:4px 9px;border-radius:8px;box-shadow:0 3px 0 rgba(0,0,0,.3);white-space:nowrap;">9 m</span>
</div>`,
        },
        options: [
          { text: '50 m', misconception: null },
          { text: '25 m', misconception: 'half-only' },
          { text: '144 m', misconception: 'area-confusion' },
          { text: '41 m', misconception: 'miscount' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Walk around the shape one side at a time: 16 + 9 + 16 + 9. Don\'t skip a side!',
          '16 + 9 = 25. There are two of each side, so double it: 25 × 2 = ?',
        ],
        explain: {
          rule: 'Walk EVERY side and add as you go. Hidden sides still count — find them before you walk.',
          worked: '16 + 9 + 16 + 9 = 50 m. (Shortcut: 2 × (16 + 9) = 2 × 25 = 50 m.)',
          whyWrong: {
            '25 m': 'That\'s only two sides added together — length + width. The Prowler must walk all FOUR sides, not just two.',
            '144 m': 'That\'s the AREA (16 × 9, the space inside), not the perimeter (the walk around the outside edge).',
            '41 m': 'You added three sides but skipped the fourth! Count all four sides all the way round.',
          },
        },
      },
    },
    {
      type: 'try',
      q: {
        id: 'perimeter-try-2', topicId: 'perimeter', tier: 1, format: 'mcq5',
        stem: 'Every side of this square pen is the same length. What is the perimeter?',
        visual: {
          kind: 'ladder',
          html: `<div style="position:relative;width:160px;max-width:70%;height:160px;margin:22px auto 44px;border:4px solid var(--ink);border-radius:4px;background:rgba(123,201,80,.18);">
  <span style="position:absolute;top:-28px;left:50%;transform:translateX(-50%);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:14px;padding:4px 9px;border-radius:8px;box-shadow:0 3px 0 rgba(0,0,0,.3);white-space:nowrap;">11 cm</span>
  <span style="position:absolute;bottom:-28px;left:50%;transform:translateX(-50%);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:14px;padding:4px 9px;border-radius:8px;box-shadow:0 3px 0 rgba(0,0,0,.3);white-space:nowrap;">11 cm</span>
  <span style="position:absolute;left:0;top:50%;transform:translate(-115%,-50%);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:14px;padding:4px 9px;border-radius:8px;box-shadow:0 3px 0 rgba(0,0,0,.3);white-space:nowrap;">11 cm</span>
  <span style="position:absolute;right:0;top:50%;transform:translate(115%,-50%);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:14px;padding:4px 9px;border-radius:8px;box-shadow:0 3px 0 rgba(0,0,0,.3);white-space:nowrap;">11 cm</span>
</div>`,
        },
        options: [
          { text: '44 cm', misconception: null },
          { text: '22 cm', misconception: 'half-only' },
          { text: '121 cm', misconception: 'area-confusion' },
          { text: '33 cm', misconception: 'miscount' },
        ],
        correctIndex: 0,
        hintSteps: [
          'A square has FOUR equal sides. If one side is 11 cm, all four sides are 11 cm.',
          '11 + 11 + 11 + 11, or the shortcut: 11 × 4 = ?',
        ],
        explain: {
          rule: 'Walk EVERY side and add as you go. Hidden sides still count — find them before you walk.',
          worked: 'A square has 4 equal sides. 11 × 4 = 44 cm (or 11+11+11+11 = 44 cm).',
          whyWrong: {
            '22 cm': 'That\'s only two sides. A square has FOUR equal sides — walk all of them.',
            '121 cm': 'That\'s the AREA (11 × 11, the space inside), not the perimeter — the distance AROUND the edge.',
            '33 cm': 'You only walked three of the four equal sides.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Hidden sides still count',
      html: `<p>Some fences aren't simple rectangles — they have <b>steps</b> in them, like this L-shaped garden. Notice two of the sides are marked with a <b>?</b>. The Prowler still insists on walking them — you just have to work them out first.</p>
<style>@keyframes perimeterHiddenPulse{0%,100%{transform:scale(1);}50%{transform:scale(1.14);}}</style>
<div style="position:relative;width:100%;max-width:320px;height:230px;margin:20px auto 8px;padding:0 44px;box-sizing:content-box;">
  <div style="position:absolute;inset:0;clip-path:polygon(0% 0%, 60% 0%, 60% 50%, 100% 50%, 100% 100%, 0% 100%);background:linear-gradient(135deg,#bfe6a8,#8fcf6e);"></div>
  <div style="position:absolute;left:60%;top:0;height:50%;border-left:2px dashed var(--ink);opacity:.5;"></div>
  <span style="position:absolute;left:30%;top:-6%;transform:translate(-50%,-50%);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:13px;padding:4px 8px;border-radius:8px;box-shadow:0 3px 0 rgba(0,0,0,.3);white-space:nowrap;">9 m</span>
  <span style="position:absolute;left:68%;top:25%;transform:translate(-50%,-50%);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:13px;padding:4px 8px;border-radius:8px;box-shadow:0 3px 0 rgba(0,0,0,.3);white-space:nowrap;">3 m</span>
  <span style="position:absolute;left:80%;top:47%;transform:translate(-50%,-50%);background:var(--wrong);color:#fff;font-family:'Fredoka',sans-serif;font-weight:700;font-size:14px;padding:4px 9px;border-radius:8px;box-shadow:0 3px 0 rgba(0,0,0,.3);white-space:nowrap;animation:perimeterHiddenPulse 1.4s ease-in-out infinite;">?</span>
  <span style="position:absolute;left:107%;top:75%;transform:translate(-50%,-50%);background:var(--wrong);color:#fff;font-family:'Fredoka',sans-serif;font-weight:700;font-size:14px;padding:4px 9px;border-radius:8px;box-shadow:0 3px 0 rgba(0,0,0,.3);white-space:nowrap;animation:perimeterHiddenPulse 1.4s ease-in-out infinite;">?</span>
  <span style="position:absolute;left:50%;top:106%;transform:translate(-50%,-50%);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:13px;padding:4px 8px;border-radius:8px;box-shadow:0 3px 0 rgba(0,0,0,.3);white-space:nowrap;">15 m</span>
  <span style="position:absolute;left:-7%;top:50%;transform:translate(-50%,-50%);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:13px;padding:4px 8px;border-radius:8px;box-shadow:0 3px 0 rgba(0,0,0,.3);white-space:nowrap;">10 m</span>
</div>
<p style="text-align:center;font-size:12px;font-style:italic;color:#8c7a63;margin:2px 0 14px;">Not to scale</p>
<p>The bottom of the whole garden is <b>15 m</b>, and the top step is <b>9 m</b> of that — so the hidden horizontal gap must be <b>15 − 9 = 6 m</b>. The left side is <b>10 m</b>, and the little arm is <b>3 m</b> of that — so the hidden vertical gap must be <b>10 − 3 = 7 m</b>. Now walk ALL SIX sides: 9 + 3 + 6 + 7 + 15 + 10 = <b>50 m</b>.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'perimeter-try-3', topicId: 'perimeter', tier: 2, format: 'mcq5',
        stem: 'This L-shaped garden has two hidden sides marked with a <b>?</b>. Derive them, then walk EVERY side to find the total perimeter.',
        visual: {
          kind: 'ladder',
          html: `<div style="position:relative;width:100%;max-width:320px;height:230px;margin:20px auto 8px;padding:0 44px;box-sizing:content-box;">
  <div style="position:absolute;inset:0;clip-path:polygon(0% 0%, 60% 0%, 60% 50%, 100% 50%, 100% 100%, 0% 100%);background:linear-gradient(135deg,#bfe6a8,#8fcf6e);"></div>
  <div style="position:absolute;left:60%;top:0;height:50%;border-left:2px dashed var(--ink);opacity:.5;"></div>
  <span style="position:absolute;left:30%;top:-6%;transform:translate(-50%,-50%);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:13px;padding:4px 8px;border-radius:8px;box-shadow:0 3px 0 rgba(0,0,0,.3);white-space:nowrap;">9 m</span>
  <span style="position:absolute;left:68%;top:25%;transform:translate(-50%,-50%);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:13px;padding:4px 8px;border-radius:8px;box-shadow:0 3px 0 rgba(0,0,0,.3);white-space:nowrap;">4 m</span>
  <span style="position:absolute;left:80%;top:47%;transform:translate(-50%,-50%);background:var(--wrong);color:#fff;font-family:'Fredoka',sans-serif;font-weight:700;font-size:14px;padding:4px 9px;border-radius:8px;box-shadow:0 3px 0 rgba(0,0,0,.3);white-space:nowrap;">?</span>
  <span style="position:absolute;left:107%;top:75%;transform:translate(-50%,-50%);background:var(--wrong);color:#fff;font-family:'Fredoka',sans-serif;font-weight:700;font-size:14px;padding:4px 9px;border-radius:8px;box-shadow:0 3px 0 rgba(0,0,0,.3);white-space:nowrap;">?</span>
  <span style="position:absolute;left:50%;top:106%;transform:translate(-50%,-50%);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:13px;padding:4px 8px;border-radius:8px;box-shadow:0 3px 0 rgba(0,0,0,.3);white-space:nowrap;">16 m</span>
  <span style="position:absolute;left:-7%;top:50%;transform:translate(-50%,-50%);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:13px;padding:4px 8px;border-radius:8px;box-shadow:0 3px 0 rgba(0,0,0,.3);white-space:nowrap;">12 m</span>
</div>
<p style="text-align:center;font-size:12px;font-style:italic;color:#8c7a63;margin:2px 0 0;">Not to scale</p>`,
        },
        options: [
          { text: '56 m', misconception: null },
          { text: '41 m', misconception: 'only-labelled' },
          { text: '48 m', misconception: 'one-hidden-forgotten' },
          { text: '164 m', misconception: 'area-confusion' },
          { text: '82 m', misconception: 'added-not-subtracted' },
        ],
        correctIndex: 0,
        hintSteps: [
          'First find the hidden sides: the top arm is 9 m out of a 16 m base, so the missing horizontal piece is 16 − 9 = 7 m. The right arm is 4 m out of a 12 m side, so the missing vertical piece is 12 − 4 = 8 m.',
          'Now you have all six sides: 9, 4, 7, 8, 16, 12. Add every single one — the Prowler skips nothing!',
        ],
        explain: {
          rule: 'Walk EVERY side and add as you go. Hidden sides still count — find them before you walk.',
          worked: 'Hidden sides: 16 − 9 = 7 m and 12 − 4 = 8 m. Walk all six sides: 9 + 4 + 7 + 8 + 16 + 12 = 56 m.',
          whyWrong: {
            '41 m': 'That only counts the four LABELLED sides. The Prowler must walk the two hidden sides too — find them first!',
            '48 m': 'You found one hidden side but forgot the other — check both gaps in the fence.',
            '164 m': 'That\'s the AREA of the garden (the space inside), not the perimeter — the fence walk around the outside edge.',
            '82 m': 'The hidden sides come from SUBTRACTING the given piece from the outer length — not adding.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Two traps the Prowler always dodges',
      html: `<table style="width:100%;border-collapse:collapse;margin:14px 0;font-size:16px;">
<tr><th style="text-align:left;padding:8px;border-bottom:2px solid var(--ink);">Perimeter</th><th style="text-align:left;padding:8px;border-bottom:2px solid var(--ink);">Area</th></tr>
<tr><td style="padding:8px;vertical-align:top;">Distance <b>AROUND</b> the outside edge. Add every side.</td><td style="padding:8px;vertical-align:top;">Space <b>INSIDE</b> the shape. Length × width.</td></tr>
</table>
<p>And watch for <b>reverse</b> problems: sometimes the Prowler gives you the TOTAL perimeter instead of the sides, plus a clue linking length and width (like "the length is 3 m more than the width"). Halve the perimeter first to get one length + one width, then use the clue to split that in two.</p>`,
    },
    { type: 'weapon' },
  ],

  tips: [
    'Walk EVERY side, in order, and don\'t stop till you\'re back where you started.',
    'Rectangle shortcut: opposite sides are always equal, so perimeter = 2 × (length + width).',
    'Square shortcut: all four sides are equal, so perimeter = 4 × one side.',
    'Regular polygon shortcut: perimeter = number of sides × one side length.',
    'Hidden sides on an L-shape: find them by subtracting the labelled piece from the full length or width — then add EVERY side, hidden ones included.',
    'The classic trap: area is NOT perimeter. Area is the space inside (length × width); perimeter is the walk around the outside.',
    'Reverse problems: given the TOTAL perimeter, halve it first to get one length + one width — then use the clue linking them to split that total in two.',
  ],
};
