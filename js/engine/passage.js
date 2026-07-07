// FART QUEST — ENGINE agent (js/engine/passage.js)
// Passage panel for Storybog "interrogation" battles: parchment scroll rendering
// of an English passage with every-5th-line margin numbering, plus a line-ref
// chip factory that scrolls + flash-highlights the referenced lines.
//
// Passage data shape (authored in data/passages/*.js — read only):
//   { id, title, genre:'fiction'|'nonfiction'|'poetry', lines:[string], questions:[Question] }
// Question.lineRef is a string like '12' or '21-36', or null (no specific lines).
//
// Dependency-free of battle internals — pure DOM building + scroll/highlight.

const GENRE_ICON = {
  fiction: '📖',
  nonfiction: '📰',
  poetry: '🪶',
};

const GENRE_LABEL = {
  fiction: 'Fiction',
  nonfiction: 'Non-fiction',
  poetry: 'Poetry',
};

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Parse a lineRef string ('12', '21-36') into a clamped {start, end} range.
 * - null/undefined/unparseable -> null
 * - reversed ranges ('36-21') are swapped into order
 * - out-of-bounds values are clamped to [1, maxLine] when maxLine is given
 * Exported (in addition to the two required exports) purely so scratchpad
 * tests can exercise the parser without a DOM.
 */
export function parseLineRef(ref, maxLine) {
  if (ref === null || ref === undefined) return null;
  const str = String(ref).trim();
  if (!str) return null;

  let start;
  let end;
  const rangeMatch = str.match(/^(\d+)\s*-\s*(\d+)$/);
  if (rangeMatch) {
    start = parseInt(rangeMatch[1], 10);
    end = parseInt(rangeMatch[2], 10);
  } else if (/^\d+$/.test(str)) {
    start = end = parseInt(str, 10);
  } else {
    return null;
  }

  if (Number.isNaN(start) || Number.isNaN(end)) return null;

  // reversed range guard
  if (start > end) {
    const tmp = start;
    start = end;
    end = tmp;
  }

  const hasMax = typeof maxLine === 'number' && Number.isFinite(maxLine) && maxLine > 0;
  const lo = 1;
  const hi = hasMax ? maxLine : Infinity;

  start = Math.min(Math.max(start, lo), hi);
  end = Math.min(Math.max(end, lo), hi);

  return { start, end };
}

function formatRefLabel(range) {
  if (range.start === range.end) return `line ${range.start}`;
  return `lines ${range.start}–${range.end}`;
}

/**
 * Build the parchment-scroll passage panel element.
 * Every 5th text line gets a margin number (5, 10, 15…), blank lines in the
 * data become stanza/paragraph gaps (no number, extra space) — this is what
 * gives poetry its stanza breaks, and works harmlessly for prose too.
 */
export function passagePanel(passage) {
  const panel = document.createElement('div');
  panel.className = `passage-panel passage-genre-${passage.genre || 'fiction'}`;
  panel.dataset.passageId = passage.id || '';

  const header = document.createElement('div');
  header.className = 'passage-header';
  const icon = document.createElement('span');
  icon.className = 'passage-genre-icon';
  icon.textContent = GENRE_ICON[passage.genre] || '📄';
  const titleWrap = document.createElement('div');
  titleWrap.className = 'passage-title-wrap';
  const title = document.createElement('h2');
  title.className = 'passage-title';
  title.textContent = passage.title || '';
  const genreLabel = document.createElement('span');
  genreLabel.className = 'passage-genre-label';
  genreLabel.textContent = GENRE_LABEL[passage.genre] || '';
  titleWrap.appendChild(title);
  titleWrap.appendChild(genreLabel);
  header.appendChild(icon);
  header.appendChild(titleWrap);
  panel.appendChild(header);

  const scroll = document.createElement('div');
  scroll.className = 'passage-scroll';

  const lines = Array.isArray(passage.lines) ? passage.lines : [];
  let lineCounter = 0;

  lines.forEach((raw) => {
    const text = typeof raw === 'string' ? raw : '';
    if (text.trim() === '') {
      const gap = document.createElement('div');
      gap.className = passage.genre === 'poetry' ? 'passage-gap passage-gap-stanza' : 'passage-gap passage-gap-para';
      scroll.appendChild(gap);
      return;
    }

    lineCounter += 1;
    const row = document.createElement('div');
    row.className = 'passage-line';
    row.dataset.line = String(lineCounter);

    const num = document.createElement('span');
    num.className = 'passage-linenum';
    if (lineCounter % 5 === 0) num.textContent = String(lineCounter);
    row.appendChild(num);

    const body = document.createElement('span');
    body.className = 'passage-text';
    body.textContent = text;
    row.appendChild(body);

    scroll.appendChild(row);
  });

  panel.dataset.maxLine = String(lineCounter);
  panel.appendChild(scroll);

  return panel;
}

/**
 * Scroll the panel to the given line-ref (string or already-parsed
 * {start,end}) and flash-highlight the matching lines. No-ops quietly if the
 * ref is unparseable or no matching lines exist.
 */
function scrollToLines(panel, ref) {
  if (!panel) return;
  const maxLine = Number(panel.dataset.maxLine) || undefined;
  const range = (ref && typeof ref === 'object' && 'start' in ref) ? ref : parseLineRef(ref, maxLine);
  if (!range) return;

  const scroll = panel.querySelector('.passage-scroll');
  if (!scroll) return;

  const rows = Array.from(scroll.querySelectorAll('.passage-line')).filter((row) => {
    const n = Number(row.dataset.line);
    return n >= range.start && n <= range.end;
  });
  if (!rows.length) return;

  // Clear any previous highlight, then re-trigger the flash animation.
  scroll.querySelectorAll('.line-hit').forEach((el) => el.classList.remove('line-hit'));
  // Force reflow so re-adding the class restarts the CSS animation even if
  // the same lines are tapped twice in a row.
  void scroll.offsetWidth;

  rows[0].scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'center',
  });

  rows.forEach((row) => row.classList.add('line-hit'));
}

/**
 * Factory for the small pill the battle screen mounts next to a question:
 * tapping it scrolls the given passage panel to the question's lineRef and
 * flash-highlights those lines. Returns null when there is no lineRef (some
 * passage questions are general and carry no specific lines) — callers
 * should simply skip mounting anything in that case.
 */
export function lineRefChip(ref, panel) {
  const maxLine = panel ? Number(panel.dataset.maxLine) || undefined : undefined;
  const range = parseLineRef(ref, maxLine);
  if (!range) return null;

  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'line-ref-chip';
  chip.textContent = formatRefLabel(range);
  chip.setAttribute('aria-label', `Jump to ${formatRefLabel(range)} in the passage`);

  chip.addEventListener('click', () => {
    scrollToLines(panel, range);
  });

  return chip;
}

export default { passagePanel, lineRefChip };
