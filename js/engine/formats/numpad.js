// FART QUEST — FORMATS agent
// num: custom numeric keypad entry format.

const MAX_LEN = 8;

// Spec amendment: mathematically-equal entries must be accepted, so trailing zeros after the
// decimal point (and a trailing bare '.') are stripped too, e.g. '0.80'->'0.8', '778.0'->'778'.
export function normaliseForCompare(raw) {
  let s = String(raw).trim();
  if (s === '') return s;
  const neg = s.startsWith('-');
  if (neg) s = s.slice(1);
  if (s.includes('.')) {
    let [intPart, decPart] = s.split('.');
    intPart = intPart.replace(/^0+(?=\d)/, '');
    if (intPart === '') intPart = '0';
    decPart = decPart.replace(/0+$/, ''); // strip trailing zeros: '80' -> '8', '0' -> ''
    s = decPart === '' ? intPart : `${intPart}.${decPart}`; // drop a now-bare trailing '.'
  } else {
    s = s.replace(/^0+(?=\d)/, '');
    if (s === '') s = '0';
  }
  return (neg ? '-' : '') + s;
}

function isAccepted(entry, acceptList) {
  const normEntry = normaliseForCompare(entry);
  return (acceptList || []).some((a) => normaliseForCompare(a) === normEntry);
}

export function render(container, question, api) {
  const { onAnswer } = api;

  let entry = '';
  let locked = false;

  const root = document.createElement('div');
  root.className = 'fmt-numpad';

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

  const displayWrap = document.createElement('div');
  displayWrap.className = 'fmt-entry-wrap';

  const display = document.createElement('div');
  display.className = 'fmt-entry-display';
  display.textContent = '';

  displayWrap.appendChild(display);

  if (question.unit) {
    const unitChip = document.createElement('span');
    unitChip.className = 'fmt-unit-chip';
    unitChip.textContent = question.unit;
    displayWrap.appendChild(unitChip);
  }

  root.appendChild(displayWrap);

  const keypad = document.createElement('div');
  keypad.className = 'fmt-keypad';

  const keyDefs = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

  const keyEls = {};

  keyDefs.forEach((k) => {
    const key = document.createElement('button');
    key.type = 'button';
    key.className = 'fmt-key';
    if (k === '⌫') key.classList.add('fmt-key-back');
    if (k === '.') key.classList.add('fmt-key-dot');
    key.textContent = k;
    keyEls[k] = key;
    keypad.appendChild(key);

    key.addEventListener('click', () => {
      if (locked) return;
      if (k === '⌫') {
        entry = entry.slice(0, -1);
      } else if (k === '.') {
        if (!entry.includes('.') && entry.length < MAX_LEN) {
          entry = entry === '' ? '0.' : entry + '.';
        }
      } else {
        if (entry.length < MAX_LEN) {
          entry = entry + k;
        }
      }
      updateDisplay();
    });
  });

  const fireBtn = document.createElement('button');
  fireBtn.type = 'button';
  fireBtn.className = 'fmt-key fmt-key-fire';
  fireBtn.textContent = 'FIRE!';
  fireBtn.disabled = true;
  keypad.appendChild(fireBtn);

  root.appendChild(keypad);

  container.innerHTML = '';
  container.appendChild(root);

  function updateDisplay() {
    display.textContent = entry;
    fireBtn.disabled = entry.length === 0;
  }

  fireBtn.addEventListener('click', () => {
    if (locked) return;
    if (entry.length === 0) return;
    locked = true;
    Object.values(keyEls).forEach((k) => { k.style.pointerEvents = 'none'; });
    fireBtn.style.pointerEvents = 'none';

    const correct = isAccepted(entry, question.accept);
    onAnswer({
      correct,
      value: entry,
    });
  });

  function reveal() {
    // No visual reveal spec beyond mcq5's; num format has no per-key
    // correct/wrong styling requirement, kept as no-op handle for parity.
  }

  return { reveal };
}

export default { render };
