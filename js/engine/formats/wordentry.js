// FART QUEST — FORMATS agent
// wordentry: free-text English write-in. Real <input type="text"> (the iPad
// keyboard is the point) + gold FIRE! button.

// Normalise for compare: trim, collapse inner whitespace, lowercase, strip
// leading/trailing punctuation (.,!?"'). `exact:true` skips the lowercase step
// (still trims + collapses whitespace + strips edge punctuation) for
// exact-phrase questions ("copy the exact phrase").
export function normaliseForCompare(raw, exact) {
  let s = String(raw == null ? '' : raw).trim();
  s = s.replace(/\s+/g, ' ');
  s = s.replace(/^[.,!?"']+|[.,!?"']+$/g, '');
  s = s.trim();
  if (!exact) s = s.toLowerCase();
  return s;
}

export function isAccepted(entry, acceptList, exact) {
  const normEntry = normaliseForCompare(entry, exact);
  return (acceptList || []).some((a) => normaliseForCompare(a, exact) === normEntry);
}

export function render(container, question, api) {
  const { onAnswer } = api;
  const maxLen = question.maxLen || 40;
  const exact = !!question.exact;

  let locked = false;

  const root = document.createElement('div');
  root.className = 'fmt-wordentry';

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

  if (question.hint) {
    const hint = document.createElement('div');
    hint.className = 'fmt-wordentry-hint';
    hint.textContent = question.hint;
    root.appendChild(hint);
  }

  const entryWrap = document.createElement('div');
  entryWrap.className = 'fmt-entry-wrap fmt-wordentry-wrap';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'fmt-wordentry-input';
  input.autocapitalize = 'off';
  input.autocorrect = 'off';
  input.spellcheck = false;
  input.maxLength = maxLen;
  input.setAttribute('autocomplete', 'off');
  // Spec: never autofocus on mount (iOS scroll-jump) — focus on first tap.
  input.addEventListener('pointerdown', () => {
    input.focus();
  }, { once: true });

  entryWrap.appendChild(input);
  root.appendChild(entryWrap);

  const fireBtn = document.createElement('button');
  fireBtn.type = 'button';
  fireBtn.className = 'fmt-key fmt-key-fire fmt-wordentry-fire';
  fireBtn.textContent = 'FIRE!';
  fireBtn.disabled = true;
  root.appendChild(fireBtn);

  input.addEventListener('input', () => {
    fireBtn.disabled = input.value.trim().length === 0;
  });

  function submit() {
    if (locked) return;
    if (input.value.trim().length === 0) return;
    locked = true;
    input.disabled = true;
    fireBtn.style.pointerEvents = 'none';

    const correct = isAccepted(input.value, question.accept, exact);
    onAnswer({
      correct,
      value: input.value,
    });
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submit();
  });

  fireBtn.addEventListener('click', submit);

  container.innerHTML = '';
  container.appendChild(root);

  function reveal() {
    // No per-character reveal spec beyond mcq5's; wordentry has no additional
    // visual reveal requirement, kept as no-op handle for parity.
  }

  return { reveal };
}

export default { render };
