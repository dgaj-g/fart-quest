// FART QUEST — FORMATS agent
// mcq5: chunky option cards (also handles 4 options), gold letter chips A-E.
import { shuffle } from '../../rng.js';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export function render(container, question, api) {
  const { rng, onAnswer } = api;

  // Build [{text, misconception, origIndex}] and shuffle with api.rng.
  const withIndex = question.options.map((o, i) => ({ ...o, origIndex: i }));
  const shuffled = shuffle(rng, withIndex);

  const longText = shuffled.some((o) => (o.text || '').length > 28);
  const cols = longText ? 1 : 2;

  const root = document.createElement('div');
  root.className = 'fmt-mcq5';

  const stem = document.createElement('div');
  stem.className = 'fmt-stem';
  stem.innerHTML = question.stem;
  root.appendChild(stem);

  if (question.visual && question.visual.html) {
    const vis = document.createElement('div');
    vis.className = 'fmt-visual';
    vis.innerHTML = question.visual.html;
    root.appendChild(vis);
  }

  const grid = document.createElement('div');
  grid.className = 'fmt-options';
  grid.classList.add(cols === 1 ? 'fmt-options-1col' : 'fmt-options-2col');

  const cards = [];
  let locked = false;

  shuffled.forEach((opt, displayIndex) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'fmt-option-card';
    card.setAttribute('data-orig-index', String(opt.origIndex));

    const chip = document.createElement('span');
    chip.className = 'fmt-letter-chip';
    chip.textContent = LETTERS[displayIndex] || String(displayIndex + 1);

    const text = document.createElement('span');
    text.className = 'fmt-option-text';
    text.innerHTML = opt.text;

    card.appendChild(chip);
    card.appendChild(text);
    grid.appendChild(card);
    cards.push(card);

    card.addEventListener('click', () => {
      if (locked) return;
      locked = true;
      cards.forEach((c) => { c.style.pointerEvents = 'none'; });

      card.classList.add('fmt-pressed');

      const correct = opt.origIndex === question.correctIndex;
      onAnswer({
        correct,
        chosenIndex: opt.origIndex,
        chosenText: opt.text,
      });
    });
  });

  root.appendChild(grid);
  container.innerHTML = '';
  container.appendChild(root);

  function reveal(correctOriginalIndex) {
    cards.forEach((c) => {
      const idx = Number(c.getAttribute('data-orig-index'));
      if (idx === correctOriginalIndex) {
        c.classList.add('fmt-correct');
      } else if (c.classList.contains('fmt-pressed')) {
        c.classList.add('fmt-wrong');
      }
    });
  }

  return { reveal };
}

export default { render };
