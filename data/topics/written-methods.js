// FART QUEST topic: The Written-Methods Wallow (Number Swamp)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'written-methods',
  name: 'The Written-Methods Wallow',
  region: 'number-swamp',
  genId: 'writtenmethods',
  tagline: 'Where every ten gets borrowed, and nobody ever sees it again.',

  creature: {
    id: 'borrowin-barry',
    name: 'Borrowin’ Barry',
    rarity: 'rare',
    image: 'assets/monsters/borrowin-barry.png',
    bio: 'Barry owes a ten to nearly every column in the Wallow, and business is booming. He always carries what he’s given — he just never, ever pays anything back.',
    factSneak: 'When the top digit is too small to subtract, BORROW a ten from the throne next door — carrying is the very same trick, running in reverse.',
  },

  weapon: {
    id: 'column-cannon',
    name: 'The Column Cannon',
    tagline: 'Line up any calculation and fire it straight down the thrones.',
    rule: 'Line up the columns by throne, work right to left, and carry like a hero.',
    example: '236 + 187: line up by throne, work right to left, carry each ten forward → <b>423</b>.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-writtenmethods',
      text: 'AH, my favourite kind of maths, young stinker — the kind you can actually <b>SEE</b>! Numbers are about to line up in neat little columns, like soldiers on parade. Meet Borrowin’ Barry: he owes a ten to every column in the Wallow and has NEVER once paid one back. Today you learn his tricks — carrying, borrowing, and firing the mighty Column Cannon.',
    },
    {
      type: 'show',
      title: 'Every Column is a Throne',
      html: `<p>Remember your thrones from the Palace? Column sums use them too — but now <b>two digits</b> sit on each throne, and you add them together, starting from the throne on the <b>FAR RIGHT</b>.</p>
<div style="overflow-x:auto;">
<table style="border-collapse:collapse;margin:18px auto;font-family:'Fredoka',sans-serif;text-align:center;">
<tr>
  <td style="width:26px;"></td>
  <td style="width:44px;font-size:11px;color:#8c7a63;font-weight:700;">H</td>
  <td style="width:44px;font-size:11px;color:#8c7a63;font-weight:700;">T</td>
  <td style="width:44px;font-size:11px;color:#8c7a63;font-weight:700;">U</td>
</tr>
<tr>
  <td></td>
  <td style="font-size:14px;color:#e74c3c;font-weight:700;">¹</td>
  <td style="font-size:14px;color:#e74c3c;font-weight:700;">¹</td>
  <td></td>
</tr>
<tr>
  <td></td>
  <td style="font-size:28px;font-weight:700;">2</td>
  <td style="font-size:28px;font-weight:700;">4</td>
  <td style="font-size:28px;font-weight:700;">7</td>
</tr>
<tr>
  <td style="font-size:28px;font-weight:700;">+</td>
  <td style="font-size:28px;font-weight:700;">1</td>
  <td style="font-size:28px;font-weight:700;">8</td>
  <td style="font-size:28px;font-weight:700;">6</td>
</tr>
<tr><td colspan="4" style="border-top:3px solid #33261d;padding:0;"></td></tr>
<tr>
  <td></td>
  <td style="font-size:28px;font-weight:700;color:#2ecc71;">4</td>
  <td style="font-size:28px;font-weight:700;color:#2ecc71;">3</td>
  <td style="font-size:28px;font-weight:700;color:#2ecc71;">3</td>
</tr>
</table>
</div>
<p>Look at the Units throne: 7 + 6 = 13. Too big for one throne! So the <b>3</b> stays on the Units throne, and the leftover <b>1</b> ten marches over to help the Tens throne. That’s a <b>carry</b> — and it can happen again and again, all the way along, just like it did here in the Tens column too.</p>
<p><b>Watch out:</b> if the numbers are different lengths (like 235 and 47), still line up the <b>UNITS</b> columns on the right — never the leftmost digits. Lining up the wrong end sends every digit to the wrong throne!</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'wm-try-1', topicId: 'written-methods', tier: 1, format: 'mcq5',
        stem: 'Add these using the column method: <b>356 + 287</b>',
        options: [
          { text: '643', misconception: null },
          { text: '533', misconception: 'dropped-carry' },
          { text: '633', misconception: 'place-value-slip' },
          { text: '634', misconception: 'digit-swap' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Start on the Units throne: 6 + 7 = ? Is it too big for one throne? If so, write the units digit and carry the ten.',
          'Units: 6 + 7 = 13 → write 3, carry 1. Tens: 5 + 8 + the carried 1 = ? Then Hundreds: 3 + 2 + any carry.',
        ],
        explain: {
          rule: 'Line up the columns by throne, work right to left, and carry like a hero.',
          worked: 'Units: 6+7=13 → write 3, carry 1. Tens: 5+8+1=14 → write 4, carry 1. Hundreds: 3+2+1=6. Answer: 643.',
          whyWrong: {
            '533': 'The carries got dropped — each throne was added on its own, with none of the leftover tens marched over.',
            '633': 'Ten too few — check the Tens throne carry again.',
            '634': 'The last two digits swapped thrones — recount which throne holds the tens and which holds the units.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Borrowin’ Barry’s Favourite Trick',
      html: `<p>Sometimes the top digit is <b>SMALLER</b> than the digit you’re taking away. Barry’s answer? Borrow a ten from the throne next door — he’s brilliant at borrowing, terrible at paying it back.</p>
<div style="overflow-x:auto;">
<table style="border-collapse:collapse;margin:18px auto;font-family:'Fredoka',sans-serif;text-align:center;">
<tr>
  <td style="width:26px;"></td>
  <td style="width:44px;font-size:11px;color:#8c7a63;font-weight:700;">T</td>
  <td style="width:44px;font-size:11px;color:#8c7a63;font-weight:700;">U</td>
</tr>
<tr>
  <td></td>
  <td style="font-size:28px;font-weight:700;">
    <span style="text-decoration:line-through;opacity:.45;font-size:20px;">8</span><br>
    <span style="color:#e74c3c;font-size:20px;">7</span>
  </td>
  <td style="font-size:28px;font-weight:700;">
    <span style="color:#e74c3c;font-size:14px;vertical-align:top;">¹</span>2
  </td>
</tr>
<tr>
  <td style="font-size:28px;font-weight:700;">−</td>
  <td style="font-size:28px;font-weight:700;">4</td>
  <td style="font-size:28px;font-weight:700;">7</td>
</tr>
<tr><td colspan="3" style="border-top:3px solid #33261d;padding:0;"></td></tr>
<tr>
  <td></td>
  <td style="font-size:28px;font-weight:700;color:#2ecc71;">3</td>
  <td style="font-size:28px;font-weight:700;color:#2ecc71;">5</td>
</tr>
</table>
</div>
<p>2 take away 7 won’t work — so the Tens throne lends the Units throne one whole ten, turning 2 into 12. 12 − 7 = 5. The Tens throne, now down to 7 (it gave one away), does 7 − 4 = 3. Answer: <b>35</b>.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'wm-try-2', topicId: 'written-methods', tier: 1, format: 'mcq5',
        stem: 'Subtract using the column method: <b>92 − 58</b>',
        options: [
          { text: '34', misconception: null },
          { text: '46', misconception: 'no-borrow' },
          { text: '24', misconception: 'place-value-slip' },
          { text: '43', misconception: 'digit-swap' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Units throne: 2 take away 8. Is the top digit big enough? If not, borrow a ten from the Tens throne next door.',
          'Borrow: 2 becomes 12, and the Tens throne drops from 9 to 8. 12−8=? Then 8−5=?',
        ],
        explain: {
          rule: 'Line up the columns by throne, work right to left, and carry like a hero.',
          worked: 'Units: 2 is too small for 8, so borrow — Tens 9→8, Units 2→12. 12−8=4. Tens: 8−5=3. Answer: 34.',
          whyWrong: {
            '46': 'That’s each column subtracted the wrong way round (bigger take away smaller) — when the TOP digit is smaller, you must borrow, not flip it.',
            '24': 'Check the Tens throne again — that’s ten too few.',
            '43': 'The digits landed on the wrong thrones — recount which throne holds the tens and which holds the units.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Short Multiplication: One Row, One Cannonball',
      html: `<p>Multiplying works the same way — right to left, throne by throne — except now <b>every</b> digit gets multiplied, and carries can stack up fast.</p>
<div style="overflow-x:auto;">
<table style="border-collapse:collapse;margin:18px auto;font-family:'Fredoka',sans-serif;text-align:center;">
<tr>
  <td style="width:26px;"></td>
  <td style="width:44px;font-size:11px;color:#8c7a63;font-weight:700;">H</td>
  <td style="width:44px;font-size:11px;color:#8c7a63;font-weight:700;">T</td>
  <td style="width:44px;font-size:11px;color:#8c7a63;font-weight:700;">U</td>
</tr>
<tr>
  <td></td>
  <td style="font-size:14px;color:#e74c3c;font-weight:700;">¹</td>
  <td style="font-size:14px;color:#e74c3c;font-weight:700;">¹</td>
  <td></td>
</tr>
<tr>
  <td></td>
  <td style="font-size:28px;font-weight:700;">2</td>
  <td style="font-size:28px;font-weight:700;">3</td>
  <td style="font-size:28px;font-weight:700;">4</td>
</tr>
<tr>
  <td style="font-size:28px;font-weight:700;">×</td>
  <td></td>
  <td></td>
  <td style="font-size:28px;font-weight:700;">3</td>
</tr>
<tr><td colspan="4" style="border-top:3px solid #33261d;padding:0;"></td></tr>
<tr>
  <td></td>
  <td style="font-size:28px;font-weight:700;color:#2ecc71;">7</td>
  <td style="font-size:28px;font-weight:700;color:#2ecc71;">0</td>
  <td style="font-size:28px;font-weight:700;color:#2ecc71;">2</td>
</tr>
</table>
</div>
<p>4 × 3 = 12. Write the 2, carry the 1. Then 3 × 3 = 9, PLUS the carried 1 = 10. Write the 0, carry the 1 again! Finally 2 × 3 = 6, plus the carried 1 = 7. Reading the thrones back: <b>702</b>.</p>`,
    },
    {
      type: 'show',
      title: 'Short Division: Sharing Out, Throne by Throne',
      html: `<p>Division shares a number out equally. This time work <b>left to right</b>, throne by throne — and instead of carrying a ten, you carry what’s LEFT OVER into the next throne.</p>
<div class="estimate-demo">
  <div class="est-line">19 ÷ 6 = 3 remainder 1 <span class="est-note">(3 sits on the Tens throne; the leftover 1 carries to the Units)</span></div>
  <div class="est-line">Carried 1, next digit 7 → makes 17</div>
  <div class="est-line">17 ÷ 6 = 2 remainder 5</div>
  <div class="est-line"><b>197 ÷ 6 = 32 remainder 5</b></div>
</div>
<p>Sometimes there’s no remainder left at all to write — the sharing just carries on <b>past the decimal point</b> instead of stopping. Money loves this trick:</p>
<div class="estimate-demo">
  <div class="est-line">£7.50 ÷ 3 → exact same method, just keep the point lined up</div>
  <div class="est-line">7 ÷ 3 = 2 remainder 1 <span class="est-note">(carry the 1 to make the next digit 15)</span></div>
  <div class="est-line">15 ÷ 3 = 5 <span class="est-note">(the point drops straight down into the answer)</span></div>
  <div class="est-line"><b>£7.50 ÷ 3 = £2.50</b></div>
</div>`,
    },
    {
      type: 'show',
      title: 'The Law of the Leftovers',
      html: `<p>Ah, but here’s the ONE question that catches everyone out, my brave nose-soldier. A remainder is just a leftover — but when you’re <b>filling a CONTAINER</b> (minibus, box, shelf), that leftover still needs somewhere to go!</p>
<div class="law-scroll">🚌 <b>Filling a CONTAINER</b> (minibus, box, shelf)? Round UP — that leftover group still needs one more, even half-empty.</div>
<div class="estimate-demo">
  <div class="est-line">50 sweets need boxes that hold 8 each → 6 remainder 2</div>
  <div class="est-line"><b>7 boxes</b> <span class="est-note">(round UP — those last 2 sweets still need a box of their own)</span></div>
</div>
<p>Always ask yourself: <b>does that leftover group still need a container, even though it isn’t full?</b> If yes — round UP.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'wm-try-3', topicId: 'written-methods', tier: 3, format: 'mcq5',
        stem: '197 pupils go on a school trip. Each minibus seats 6 pupils. How many minibuses are needed so that EVERY pupil has a seat?',
        options: [
          { text: '33', misconception: null },
          { text: '32', misconception: 'rounded-down-wrongly' },
          { text: '5', misconception: 'remainder-as-answer' },
          { text: '37', misconception: 'remainder-miscombined' },
          { text: '6', misconception: 'divisor-as-answer' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Divide 197 by 6 using short division — how many minibuses fit exactly, and how many pupils are left over?',
          '197 ÷ 6 = 32 remainder 5 — that’s 32 full minibuses plus 5 pupils still standing at the kerb. Do those 5 pupils need a whole extra minibus, or none at all?',
        ],
        explain: {
          rule: 'Line up the columns by throne, work right to left, and carry like a hero.',
          worked: '197 ÷ 6 = 32 remainder 5. The 5 leftover pupils still need somewhere to sit — a minibus is a CONTAINER, so round UP to 33 minibuses.',
          whyWrong: {
            '32': 'That leaves 5 pupils with no bus at all — a container question always rounds UP to fit the leftovers.',
            '5': 'That’s just the remainder, not the total number of minibuses.',
            '37': 'That wrongly adds the remainder on top — you only need ONE more minibus for the leftovers, not five more.',
            '6': 'That’s the number of seats per minibus, not how many minibuses are needed.',
          },
        },
      },
    },
    { type: 'anim', anim: 'written-methods' },
    { type: 'weapon' },
  ],

  tips: [
    'Always line up columns by their throne — units under units — even when the numbers are different lengths.',
    'Carrying: if a column adds to 10 or more, write the units digit and carry the ten to the NEXT throne left. Never forget it.',
    'Borrowing: if the top digit is smaller, borrow a ten from the throne next door — that throne now has one less to give.',
    'Short multiplication: multiply EVERY digit, and add any carried amount before you write the next digit down.',
    'Remainders in context: containers (buses, boxes, shelves) round UP — that last leftover group still needs one, even half-full.',
    'Dividing decimals or money by a whole number: don’t stop at the remainder — bring the point straight down and keep sharing out the leftover as tenths.',
    '£3.4 in your working still means £3.40 — always write money to two decimal places.',
  ],
};
