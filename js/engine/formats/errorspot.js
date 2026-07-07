// FART QUEST — FORMATS agent
// errorspot: "Spot the Stink" — sentence segments flow inline, tap the faulty one
// (A-D) or the N button ("ALL CLEAN!") if nothing is wrong. Segments are NEVER
// shuffled — position is meaning — rng is accepted for api parity only.

const LETTERS = ['A', 'B', 'C', 'D'];

export function render(container, question, api) {
  const { onAnswer } = api;

  const root = document.createElement('div');
  root.className = 'fmt-errorspot';

  if (question.stem) {
    const stem = document.createElement('div');
    stem.className = 'fmt-stem';
    stem.innerHTML = question.stem;
    root.appendChild(stem);
  }

  if (question.visual && question.visual.html) {
    const vis = document.createElement('div');
    vis.className = 'fmt-visual';
    vis.innerHTML = question.visual.html;
    root.appendChild(vis);
  }

  const sentence = document.createElement('div');
  sentence.className = 'fmt-errorspot-sentence';

  const segCards = [];
  let locked = false;

  function lockAll() {
    locked = true;
    segCards.forEach((c) => { c.style.pointerEvents = 'none'; });
    nButton.style.pointerEvents = 'none';
  }

  question.segments.forEach((seg, i) => {
    const segWrap = document.createElement('span');
    segWrap.className = 'fmt-errorspot-seg-wrap';

    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'fmt-errorspot-pill';
    pill.setAttribute('data-index', String(i));
    pill.textContent = seg.text;

    const chip = document.createElement('span');
    chip.className = 'fmt-errorspot-chip';
    chip.textContent = LETTERS[i] || String(i + 1);

    segWrap.appendChild(pill);
    segWrap.appendChild(chip);
    sentence.appendChild(segWrap);
    segCards.push(pill);

    pill.addEventListener('click', () => {
      if (locked) return;
      lockAll();
      pill.classList.add('fmt-pressed');
      const correct = i === question.faultyIndex;
      onAnswer({ correct, chosenIndex: i });
    });
  });

  root.appendChild(sentence);

  const nButton = document.createElement('button');
  nButton.type = 'button';
  nButton.className = 'fmt-errorspot-nbutton';
  nButton.textContent = 'ALL CLEAN! (N)';
  nButton.addEventListener('click', () => {
    if (locked) return;
    lockAll();
    nButton.classList.add('fmt-pressed');
    const correct = question.faultyIndex === null;
    onAnswer({ correct, chosenIndex: 'N' });
  });
  root.appendChild(nButton);

  container.innerHTML = '';
  container.appendChild(root);

  function reveal(faultyIndex) {
    if (faultyIndex === null || faultyIndex === undefined) {
      nButton.classList.add('fmt-correct');
    } else {
      const seg = segCards[faultyIndex];
      if (seg) seg.classList.add('fmt-wrong-seg');
      if (nButton.classList.contains('fmt-pressed')) {
        nButton.classList.add('fmt-wrong');
      }
    }
  }

  return { reveal };
}

export default { render };
