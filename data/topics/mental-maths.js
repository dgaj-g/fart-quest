// FART QUEST topic: Mental Maths Mudflats (Number Swamp)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'mental-maths',
  name: 'Mental Maths Mudflats',
  region: 'number-swamp',
  genId: 'mentalmaths',
  tagline: 'Where the fastest splat in the swamp never once picks up a pencil.',

  creature: {
    id: 'splatrick-the-swift',
    name: 'Splatrick the Swift',
    rarity: 'rare',
    image: 'assets/monsters/splatrick-the-swift.png',
    bio: 'Splatrick is the fastest splat in the whole swamp. Ask him to show his written working and he simply vanishes in a green blur — paper, he insists, is for the slow.',
    factSneak: 'To add or subtract fast in your head: jump to the nearest FRIENDLY ten first, then jump whatever is left.',
  },

  weapon: {
    id: 'tens-friend-glove',
    name: 'The Tens-Friend Glove',
    tagline: 'Turn any tricky sum into two easy little hops.',
    rule: 'Jump to the nearest TEN first, then jump the rest.',
    example: '36 + 7: jump <b>4</b> to the ten-friend 40, then jump the leftover <b>3</b>. 40 + 3 = <b>43</b>.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-mentalmaths',
      text: 'Ahoy, my quick-footed hero! Meet <b>Splatrick the Swift</b> — fastest splat in the entire bog, and he simply CANNOT abide written working. “Why creep down a page,” he says, “when you can just JUMP?” Today I’m teaching you his secret weapon: jump to a friendly number first, then jump the rest. No columns. No fuss. Just speed.',
    },
    {
      type: 'show',
      title: 'Friends of Ten — and the first jump',
      html: `<p>Before you can jump, you need your <b>Friends of Ten</b> — pairs that snap together to make exactly 10, instantly, no counting on fingers.</p>
<div class="pv-grid">
  <div class="pv-col"><div class="pv-head">6</div><div class="pv-cell">6</div><div class="pv-val">+ 4 = 10</div></div>
  <div class="pv-col"><div class="pv-head">7</div><div class="pv-cell">7</div><div class="pv-val">+ 3 = 10</div></div>
  <div class="pv-col"><div class="pv-head">8</div><div class="pv-cell">8</div><div class="pv-val">+ 2 = 10</div></div>
  <div class="pv-col"><div class="pv-head">9</div><div class="pv-cell">9</div><div class="pv-val">+ 1 = 10</div></div>
</div>
<p>The same idea stretches to twenty, too: <b>13</b> and <b>7</b> are Friends of Twenty. <b>16</b> and <b>4</b> are Friends of Twenty. Know these cold, and you can jump to ANY friendly ten — not just neat ones, but numbers like 47, because 47’s best friend is <b>50</b>.</p>
<p>Watch Splatrick add <b>47 + 8</b>. He never adds 8 in one clumsy hop — he SPLITS it:</p>
<div class="numline" data-min="47" data-max="50">
  <div class="camp camp-a">47</div>
  <div class="numline-track"><span class="numline-marker" style="--pos:0%">+3</span></div>
  <div class="camp camp-b">50</div>
</div>
<div class="slide-arrow">ten-friend reached! 8 − 3 = 5 left to jump…</div>
<div class="numline" data-min="50" data-max="58">
  <div class="camp camp-a">50</div>
  <div class="numline-track"><span class="numline-marker" style="--pos:100%">+5</span></div>
  <div class="camp camp-b">58</div>
</div>
<p>Two easy jumps: <b>47 + 3 = 50</b>, then <b>50 + 5 = 58</b>. So 47 + 8 = <b>58</b>. That’s the whole trick — jump to the ten-friend FIRST, then jump whatever is left.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'mm-try-1', topicId: 'mental-maths', tier: 1, format: 'mcq5',
        stem: 'What is <b>36 + 7</b>?',
        options: [
          { text: '43', misconception: null },
          { text: '33', misconception: 'forgot-carry' },
          { text: '53', misconception: 'extra-ten' },
          { text: '44', misconception: 'off-by-one' },
        ],
        correctIndex: 0,
        hintSteps: [
          '36’s ten-friend is 40. How many do you need to jump to get there?',
          'Jump 4 to land on 40. You’ve got 7 − 4 = 3 left. 40 + 3 = …?',
        ],
        explain: {
          rule: 'Jump to the nearest TEN first, then jump the rest.',
          worked: '36 + 4 = 40 (ten-friend!). Then 40 + 3 = 43. So 36 + 7 = 43.',
          whyWrong: {
            '33': 'That forgets the carried ten — 6 + 7 = 13, but the ten from that 13 still counts!',
            '53': 'Ten too many — check how far you actually jumped to reach the ten-friend.',
            '44': 'One out — recount the second little jump.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Jumping backwards — mind the direction!',
      html: `<p>Subtracting works the very same way — jump to a ten-friend FIRST, only heading DOWN instead of up.</p>
<p>Take <b>63 − 8</b>. Splatrick doesn’t hop back 8 in one go. He splits it, aiming for the ten-friend BELOW: <b>60</b>.</p>
<div class="numline" data-min="60" data-max="63">
  <div class="camp camp-a">60</div>
  <div class="numline-track"><span class="numline-marker" style="--pos:100%">−3</span></div>
  <div class="camp camp-b">63</div>
</div>
<div class="slide-arrow">ten-friend reached! 8 − 3 = 5 left to jump back…</div>
<div class="numline" data-min="55" data-max="60">
  <div class="camp camp-a">55</div>
  <div class="numline-track"><span class="numline-marker" style="--pos:0%">−5</span></div>
  <div class="camp camp-b">60</div>
</div>
<p>63 − 3 = 60, then 60 − 5 = 55. So 63 − 8 = <b>55</b>.</p>
<p><b>Watch the direction!</b> Every jump in a subtraction travels DOWN the number line, toward zero — never up. It’s easy to get muddled mid-jump and accidentally add instead. Splatrick’s rule: for subtraction, BOTH jumps go backwards.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'mm-try-2', topicId: 'mental-maths', tier: 1, format: 'mcq5',
        stem: 'What is <b>52 − 6</b>?',
        options: [
          { text: '46', misconception: null },
          { text: '58', misconception: 'wrong-direction' },
          { text: '36', misconception: 'extra-ten' },
          { text: '47', misconception: 'off-by-one' },
        ],
        correctIndex: 0,
        hintSteps: [
          '52’s ten-friend below is 50. How far do you jump DOWN to get there?',
          'Jump 2 down to land on 50. You’ve got 6 − 2 = 4 left to jump down. 50 − 4 = …?',
        ],
        explain: {
          rule: 'Jump to the nearest TEN first, then jump the rest.',
          worked: '52 − 2 = 50 (ten-friend!). Then 50 − 4 = 46. So 52 − 6 = 46.',
          whyWrong: {
            '58': 'That jumped UP instead of down — subtraction jumps always travel backwards, toward zero.',
            '36': 'Ten too many — check how far you jumped to reach the ten-friend.',
            '47': 'One out — recount the second little jump.',
          },
        },
      },
    },
    {
      type: 'talk',
      text: 'Right, time for your times tables — but never chanted like a robot. Think of them as ANCHORS: know <b>7 × 8</b> rock solid, and suddenly 8 × 7, 56 ÷ 7 AND 56 ÷ 8 are all free — because they’re the same four numbers, rearranged. Division isn’t a brand-new fact to learn — it’s a table fact running BACKWARDS. So if 7 × 8 = 56, then 56 ÷ 7 = 8 and 56 ÷ 8 = 7. For free! One warning, though: 7 × 8 is the most muddled fact in the entire swamp. Splatrick has personally watched heroes panic and blurt out 54, or 63, or 48. It is FIFTY-SIX. Say it with me: fifty-six.',
    },
    {
      type: 'try',
      q: {
        id: 'mm-try-3', topicId: 'mental-maths', tier: 1, format: 'mcq5',
        stem: 'What is <b>7 × 8</b>?',
        options: [
          { text: '56', misconception: null },
          { text: '54', misconception: 'adjacent-fact' },
          { text: '63', misconception: 'adjacent-fact' },
          { text: '48', misconception: 'adjacent-fact' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Skip-count in 7s: 7, 14, 21, 28, 35, 42, 49, 56 — that’s 8 jumps.',
          'Or skip-count in 8s: 8, 16, 24, 32, 40, 48, 56 — also 8 jumps. Both land on the same fact.',
        ],
        explain: {
          rule: 'Jump to the nearest TEN first, then jump the rest.',
          worked: '7 × 8 = 56. It sits right between two famous neighbours: 7 × 7 = 49 and 8 × 8 = 64 — but 7 × 8 itself is 56.',
          whyWrong: {
            '54': 'That’s 6 × 9 — a neighbouring fact, not 7 × 8.',
            '63': 'That’s 7 × 9 — one skip too many.',
            '48': 'That’s 6 × 8 — one skip too few.',
          },
        },
      },
    },
    { type: 'anim', anim: 'mental-maths' },
    { type: 'weapon' },
  ],

  tips: [
    'Jump to the ten-friend FIRST, then jump whatever is left — never one clumsy hop.',
    'Every ten-friend jump for subtraction goes DOWN the number line, toward zero — never up.',
    'Know your bonds to 10 (and 20) instantly — they’re the fuel for every tens-jump.',
    '7 × 8 = 56. If you ever blurt out 54, 63 or 48 — stop, skip-count, and check.',
    'Division is just a times table running backwards: if 7 × 8 = 56, then 56 ÷ 7 = 8 and 56 ÷ 8 = 7.',
    'Missing-number facts like 7 × ☐ = 56 are still just tables — read backwards.',
    'Forgot the carried ten in a sum? Recheck the units first, then remember the extra ten it made.',
  ],
};
