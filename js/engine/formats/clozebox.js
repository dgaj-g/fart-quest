// FART QUEST — FORMATS agent
// clozebox: boxed-choice grammar cloze. Sentence with a gap between stemParts;
// shuffled word/phrase tiles beneath. Tapping a tile snaps it into the gap
// (single-tap commit — no separate confirm step).
import { shuffle } from '../../rng.js';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export function render(container, question, api) {
  const { rng, onAnswer } = api;

  const withIndex = question.options.map((o, i) => ({ ...o, origIndex: i }));
  const shuffled = shuffle(rng, withIndex);

  const root = document.createElement('div');
  root.className = 'fmt-clozebox';

  if (question.visual && question.visual.html) {
    const vis = document.createElement('div');
    vis.className = 'fmt-visual';
    vis.innerHTML = question.visual.html;
    root.appendChild(vis);
  }

  const sentence = document.createElement('div');
  sentence.className = 'fmt-clozebox-sentence';

  const before = document.createElement('span');
  before.className = 'fmt-clozebox-before';
  before.innerHTML = question.stemParts[0] || '';

  const gap = document.createElement('span');
  gap.className = 'fmt-clozebox-gap';
  gap.textContent = '▁▁▁▁';

  const after = document.createElement('span');
  after.className = 'fmt-clozebox-after';
  after.innerHTML = question.stemParts[1] || '';

  sentence.appendChild(before);
  sentence.appendChild(gap);
  sentence.appendChild(after);
  root.appendChild(sentence);

  const tray = document.createElement('div');
  tray.className = 'fmt-clozebox-tray';

  const tiles = [];
  let locked = false;

  shuffled.forEach((opt, displayIndex) => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'fmt-clozebox-tile';
    tile.setAttribute('data-orig-index', String(opt.origIndex));

    const chip = document.createElement('span');
    chip.className = 'fmt-letter-chip';
    chip.textContent = LETTERS[displayIndex] || String(displayIndex + 1);

    const text = document.createElement('span');
    text.className = 'fmt-clozebox-tile-text';
    text.innerHTML = opt.text;

    tile.appendChild(chip);
    tile.appendChild(text);
    tray.appendChild(tile);
    tiles.push(tile);

    tile.addEventListener('click', () => {
      if (locked) return;
      locked = true;
      tiles.forEach((t) => { t.style.pointerEvents = 'none'; });

      // Single-tap commit: snap the chosen tile's text into the gap with a spring.
      gap.textContent = opt.text;
      gap.classList.add('fmt-clozebox-filled');
      tile.classList.add('fmt-pressed');

      const correct = opt.origIndex === question.correctIndex;
      onAnswer({
        correct,
        chosenIndex: opt.origIndex,
        chosenText: opt.text,
      });
    });
  });

  root.appendChild(tray);

  container.innerHTML = '';
  container.appendChild(root);

  function reveal(correctOriginalIndex) {
    tiles.forEach((t) => {
      const idx = Number(t.getAttribute('data-orig-index'));
      if (idx === correctOriginalIndex) {
        t.classList.add('fmt-correct');
      } else if (t.classList.contains('fmt-pressed')) {
        t.classList.add('fmt-wrong');
      }
    });
  }

  return { reveal };
}

export default { render };
