// FART QUEST — FORMATS agent
// selecttwo: choose exactly TWO tiles. Tiles toggle-select (max 2, a third tap
// swaps out the oldest selection); CONFIRM enables only at exactly 2 selected.
import { shuffle } from '../../rng.js';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export function render(container, question, api) {
  const { rng, onAnswer } = api;

  const withIndex = question.options.map((o, i) => ({ ...o, origIndex: i }));
  const shuffled = shuffle(rng, withIndex);

  const root = document.createElement('div');
  root.className = 'fmt-selecttwo';

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
  grid.className = 'fmt-selecttwo-grid';

  const tiles = [];
  // Order matters for the "third tap swaps oldest" rule.
  const selectedOrder = [];
  let locked = false;

  shuffled.forEach((opt, displayIndex) => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'fmt-selecttwo-tile';
    tile.setAttribute('data-orig-index', String(opt.origIndex));

    const chip = document.createElement('span');
    chip.className = 'fmt-letter-chip';
    chip.textContent = LETTERS[displayIndex] || String(displayIndex + 1);

    const text = document.createElement('span');
    text.className = 'fmt-selecttwo-text';
    text.innerHTML = opt.text;

    tile.appendChild(chip);
    tile.appendChild(text);
    grid.appendChild(tile);
    tiles.push({ tile, origIndex: opt.origIndex });

    tile.addEventListener('click', () => {
      if (locked) return;

      const already = selectedOrder.indexOf(tile);
      if (already !== -1) {
        // Toggle off if re-tapped.
        selectedOrder.splice(already, 1);
        tile.classList.remove('fmt-selecttwo-selected');
      } else {
        if (selectedOrder.length >= 2) {
          const oldest = selectedOrder.shift();
          oldest.classList.remove('fmt-selecttwo-selected');
        }
        selectedOrder.push(tile);
        tile.classList.add('fmt-selecttwo-selected');
      }

      confirmBtn.disabled = selectedOrder.length !== 2;
    });
  });

  root.appendChild(grid);

  const confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.className = 'fmt-selecttwo-confirm';
  confirmBtn.textContent = 'CONFIRM';
  confirmBtn.disabled = true;
  root.appendChild(confirmBtn);

  confirmBtn.addEventListener('click', () => {
    if (locked) return;
    if (selectedOrder.length !== 2) return;
    locked = true;
    tiles.forEach(({ tile }) => { tile.style.pointerEvents = 'none'; });
    confirmBtn.style.pointerEvents = 'none';

    const chosenIndices = selectedOrder
      .map((t) => Number(t.getAttribute('data-orig-index')))
      .sort((a, b) => a - b);
    const correctSorted = question.correctIndices.slice().sort((a, b) => a - b);
    const correct = chosenIndices.length === correctSorted.length
      && chosenIndices.every((v, i) => v === correctSorted[i]);

    onAnswer({
      correct,
      chosenIndices,
    });
  });

  container.innerHTML = '';
  container.appendChild(root);

  function reveal(correctIndices) {
    const correctSet = new Set(correctIndices || []);
    tiles.forEach(({ tile, origIndex }) => {
      if (correctSet.has(origIndex)) {
        tile.classList.add('fmt-correct');
      } else if (tile.classList.contains('fmt-selecttwo-selected')) {
        tile.classList.add('fmt-wrong');
      }
    });
  }

  return { reveal };
}

export default { render };
