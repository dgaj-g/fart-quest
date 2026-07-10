// FART QUEST topic: Fraction Falls (Number Swamp)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'fractions',
  name: 'Fraction Falls',
  region: 'number-swamp',
  genId: 'fractions',
  tagline: 'Where every whole gets cut fair and square — and Halfbottom counts every crumb.',

  creature: {
    id: 'halfbottom-the-divided',
    name: 'Halfbottom the Divided',
    rarity: 'rare',
    image: 'assets/monsters/halfbottom-the-divided.png',
    bio: 'Halfbottom insists he is a WHOLE creature, despite a regrettable hedge-trimming incident leaving him five-eighths of his former self. He has not stopped counting equal pieces since — and neither, now, will you.',
    factSneak: 'The bottom number of a fraction is how many EQUAL pieces the whole is split into. The top number is how many of those pieces you take.',
  },

  weapon: {
    id: 'fair-share-blade',
    name: 'The Fair-Share Blade',
    tagline: 'Slice any whole into perfectly fair shares — top and bottom, sorted.',
    rule: 'The bottom number says how many equal pieces. The top says how many you take.',
    example: '<b>3</b>/<b>4</b> of the pizza: the bottom (4) cuts it into 4 equal slices. The top (3) says take <b>3</b> of them.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-fractions',
      text: 'Ah, Sir Jarlath — feast your eyes on Halfbottom, guardian of Fraction Falls! Poor fellow lost half his bottom in a hedge-trimming mishap and has been utterly obsessed with FAIR SHARES ever since. Today you’ll learn his secret: how to cut any whole into perfectly equal pieces, and know exactly what each piece is worth.',
    },
    {
      type: 'show',
      title: 'Equal Pieces Only',
      html: `<p>A <b>fraction</b> is what you get when you cut a whole thing into pieces — but here is the rule Halfbottom guards with his life: <b>every piece MUST be exactly the same size</b>. Equal pieces. No cheating, no wonky bits.</p>
<div style="display:flex;justify-content:center;gap:28px;margin:18px 0;flex-wrap:wrap;">
  <div>
    <div style="display:grid;grid-template-columns:repeat(2,56px);grid-template-rows:repeat(2,56px);gap:4px;">
      <div style="background:var(--stink);border-radius:8px;"></div>
      <div style="background:rgba(0,0,0,.08);border:2px solid #cbb98f;border-radius:8px;"></div>
      <div style="background:rgba(0,0,0,.08);border:2px solid #cbb98f;border-radius:8px;"></div>
      <div style="background:rgba(0,0,0,.08);border:2px solid #cbb98f;border-radius:8px;"></div>
    </div>
    <p style="text-align:center;font-weight:700;margin-top:8px;">1 out of 4 EQUAL pieces = ¼ ✅</p>
  </div>
  <div>
    <div style="display:flex;height:56px;gap:2px;">
      <div style="width:30px;background:rgba(0,0,0,.08);border:2px solid #cbb98f;"></div>
      <div style="width:74px;background:var(--stink);"></div>
      <div style="width:44px;background:rgba(0,0,0,.08);border:2px solid #cbb98f;"></div>
      <div style="width:58px;background:rgba(0,0,0,.08);border:2px solid #cbb98f;"></div>
    </div>
    <p style="text-align:center;font-weight:700;margin-top:8px;color:var(--wrong);">Different-sized pieces — NOT a fraction grid! ❌</p>
  </div>
</div>
<p>If the pieces are not equal, the grid is LYING to you. Always check the pieces are the <b>same size</b> before you trust it — even if one of them looks tempting because it is shaded.</p>`,
    },
    {
      type: 'talk',
      text: 'Here is Halfbottom’s own trick, sharper than his hedge-trimmer: The Fair-Share Blade! <b>The bottom number says how many equal pieces. The top says how many you take.</b> Say it with me: BOTTOM = pieces, TOP = taken. Get this right and fractions never confuse you again.',
    },
    {
      type: 'try',
      q: {
        id: 'frac-try-1', topicId: 'fractions', tier: 1, format: 'mcq5',
        stem: 'What fraction of this grid is shaded?',
        visual: { kind: 'polygrid', rows: 2, cols: 4, shaded: [0, 3, 5] },
        options: [
          { text: '3/8', misconception: null },
          { text: '5/8', misconception: 'shaded-unshaded-swap' },
          { text: '3/5', misconception: 'wrong-denominator' },
          { text: '8/3', misconception: 'top-bottom-swap' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Count the TOTAL number of equal pieces first — that is your BOTTOM number.',
          'Now count only the SHADED pieces — that is your TOP number.',
        ],
        explain: {
          rule: 'The bottom number says how many equal pieces. The top says how many you take.',
          worked: 'There are 8 equal pieces altogether, so the bottom is 8. 3 of them are shaded, so the top is 3. That gives 3/8.',
          whyWrong: {
            '5/8': 'That’s the pieces left UNshaded, not the ones shaded — count the shaded pieces for your top number.',
            '3/5': '5 is the number of pieces NOT shaded — the bottom must be the TOTAL number of equal pieces, which is 8.',
            '8/3': 'That’s the fraction upside down! The bottom is always the total pieces, the top is always how many you take.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Same Size, Different Disguise',
      html: `<p>Halfbottom loves this bit: these three fractions below look totally different… but they are secretly the exact same amount!</p>
<div style="display:flex;justify-content:center;gap:26px;margin:18px 0;flex-wrap:wrap;align-items:flex-end;">
  <div>
    <div style="display:grid;grid-template-columns:repeat(2,32px);gap:3px;">
      <div style="height:32px;background:var(--stink);border-radius:6px;"></div>
      <div style="height:32px;background:rgba(0,0,0,.08);border:2px solid #cbb98f;border-radius:6px;"></div>
    </div>
    <p style="text-align:center;font-weight:700;margin-top:6px;">½</p>
  </div>
  <div>
    <div style="display:grid;grid-template-columns:repeat(4,32px);gap:3px;">
      <div style="height:32px;background:var(--stink);border-radius:6px;"></div>
      <div style="height:32px;background:var(--stink);border-radius:6px;"></div>
      <div style="height:32px;background:rgba(0,0,0,.08);border:2px solid #cbb98f;border-radius:6px;"></div>
      <div style="height:32px;background:rgba(0,0,0,.08);border:2px solid #cbb98f;border-radius:6px;"></div>
    </div>
    <p style="text-align:center;font-weight:700;margin-top:6px;">2/4</p>
  </div>
  <div>
    <div style="display:grid;grid-template-columns:repeat(5,26px);gap:3px;">
      <div style="height:26px;background:var(--stink);border-radius:5px;"></div>
      <div style="height:26px;background:var(--stink);border-radius:5px;"></div>
      <div style="height:26px;background:var(--stink);border-radius:5px;"></div>
      <div style="height:26px;background:var(--stink);border-radius:5px;"></div>
      <div style="height:26px;background:var(--stink);border-radius:5px;"></div>
      <div style="height:26px;background:rgba(0,0,0,.08);border:2px solid #cbb98f;border-radius:5px;"></div>
      <div style="height:26px;background:rgba(0,0,0,.08);border:2px solid #cbb98f;border-radius:5px;"></div>
      <div style="height:26px;background:rgba(0,0,0,.08);border:2px solid #cbb98f;border-radius:5px;"></div>
      <div style="height:26px;background:rgba(0,0,0,.08);border:2px solid #cbb98f;border-radius:5px;"></div>
      <div style="height:26px;background:rgba(0,0,0,.08);border:2px solid #cbb98f;border-radius:5px;"></div>
    </div>
    <p style="text-align:center;font-weight:700;margin-top:6px;">5/10</p>
  </div>
</div>
<div class="law-scroll">✂️ <b>To make an equivalent fraction, multiply (or divide) the TOP and the BOTTOM by the SAME number.</b></div>
<p>½ ×2 on the top, ×2 on the bottom → 2/4. ½ ×5 on the top, ×5 on the bottom → 5/10. Multiply top AND bottom by the SAME number, and the fraction’s SIZE never changes — only its disguise.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'frac-try-2', topicId: 'fractions', tier: 1, format: 'mcq5',
        stem: 'Which fraction is the same size as <b>½</b>?',
        options: [
          { text: '2/4', misconception: null },
          { text: '1/4', misconception: 'only-bottom-scaled' },
          { text: '2/2', misconception: 'only-top-scaled' },
          { text: '3/4', misconception: 'added-not-multiplied' },
        ],
        correctIndex: 0,
        hintSteps: [
          'To make an equivalent fraction, multiply the TOP and the BOTTOM by the SAME number.',
          'Try multiplying both 1 and 2 by 2. What do you get?',
        ],
        explain: {
          rule: 'To make an equivalent fraction, multiply (or divide) the TOP and the BOTTOM by the SAME number.',
          worked: '½ ×2 on the top and ×2 on the bottom gives 2/4 — exactly the same size, just a different disguise.',
          whyWrong: {
            '1/4': 'Only the bottom got multiplied by 2 — the top must be scaled by the SAME number too, so it should also become 2.',
            '2/2': 'Only the top got multiplied by 2 — the bottom needs the SAME treatment, so it should become 4, not stay at 2.',
            '3/4': 'That looks like 1 was added to the top and bottom instead of multiplying — equivalent fractions always come from multiplying (or dividing), never adding.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Fraction of an Amount — Halfbottom’s Sweet Shop',
      html: `<div class="law-scroll">🍬 <b>Fraction of an amount: divide by the BOTTOM, then multiply by the TOP.</b></div>
<p>Halfbottom has <b>24 sweets</b> to fair-share. He wants to know: what is <b>¾ of 24</b>?</p>
<div style="display:flex;justify-content:center;gap:10px;margin:18px 0;flex-wrap:wrap;">
  <div style="border:3px solid var(--gold-deep);border-radius:10px;padding:8px 10px;font-size:22px;">🍬🍬🍬<br>🍬🍬🍬</div>
  <div style="border:3px solid var(--gold-deep);border-radius:10px;padding:8px 10px;font-size:22px;">🍬🍬🍬<br>🍬🍬🍬</div>
  <div style="border:3px solid var(--gold-deep);border-radius:10px;padding:8px 10px;font-size:22px;">🍬🍬🍬<br>🍬🍬🍬</div>
  <div style="border:3px dashed #cbb98f;border-radius:10px;padding:8px 10px;font-size:22px;opacity:.55;">🍬🍬🍬<br>🍬🍬🍬</div>
</div>
<p>Step 1 — divide by the BOTTOM: 24 ÷ 4 = <b>6</b> sweets in each equal group.</p>
<p>Step 2 — multiply by the TOP: take 3 of those 4 groups (gold borders). 3 × 6 = <b>18</b> sweets.</p>`,
    },
    {
      type: 'talk',
      text: 'Two last things, my fragrant friend. First: if the top and bottom of a fraction share a common factor, you can DIVIDE both by it to simplify — 4 tenths and 2 fifths are secretly the exact same fraction, just tidied up. Second: one day, over at the FDP Triangle, Percy Percent will try to trick you with a fraction OF THE REMAINDER — a nasty trap for another lesson. For now, always work from the WHOLE amount you started with, and you’ll never go wrong.',
    },
    {
      type: 'try',
      q: {
        id: 'frac-try-3', topicId: 'fractions', tier: 2, format: 'mcq5',
        stem: 'What is <b>¾ of 24</b>?',
        options: [
          { text: '18', misconception: null },
          { text: '8', misconception: 'divided-by-top' },
          { text: '21', misconception: 'subtracted-top' },
          { text: '6', misconception: 'forgot-multiply' },
          { text: '32', misconception: 'top-bottom-swap' },
        ],
        correctIndex: 0,
        hintSteps: [
          'First divide 24 by the BOTTOM number (4). What do you get?',
          'Now multiply that answer by the TOP number (3).',
        ],
        explain: {
          rule: 'Fraction of an amount: divide by the BOTTOM, then multiply by the TOP.',
          worked: '24 ÷ 4 (the bottom) = 6. Then 6 × 3 (the top) = 18.',
          whyWrong: {
            '8': 'That’s 24 divided by the TOP number, 3 — always divide by the BOTTOM first.',
            '21': 'Fractions of an amount are never found by subtracting — divide by the bottom, then multiply by the top.',
            '6': 'That’s only the first step (24 ÷ 4) — don’t forget to multiply by the top number too!',
            '32': 'That’s the bottom and top swapped around in the working — divide by 4 (the bottom), not by 3.',
          },
        },
      },
    },
    { type: 'anim', anim: 'fractions' },
    { type: 'weapon' },
  ],

  tips: [
    'Bottom = how many equal pieces the whole is cut into. Top = how many you take.',
    'Every piece MUST be equal size — a grid with wonky pieces is never a real fraction grid, even if a big piece is shaded.',
    'To make an equivalent fraction, multiply (or divide) the TOP and BOTTOM by the SAME number: ½ = 2/4 = 5/10.',
    'Fraction OF an amount: divide by the bottom first, then multiply by the top. ¾ of 24 → 24 ÷ 4 = 6, then 6 × 3 = 18.',
    'Counting a shaded grid? Count the shaded pieces for the TOP and the TOTAL pieces for the BOTTOM — never the unshaded ones by mistake.',
    'Watch for the top/bottom swap trap — 2/5 is not the same as 5/2.',
    'If the top and bottom share a common factor, divide both by it to simplify — 4/10 simplifies to 2/5, exactly the same size.',
  ],
};
