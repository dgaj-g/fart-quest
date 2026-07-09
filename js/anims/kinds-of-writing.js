// FART QUEST — js/anims/kinds-of-writing.js
// THE SIGNPOST SHELF — a physical book (front cover + a fore-edge tab column)
// for the kinds-of-writing Scout Report (Storybog). A question card arrives;
// the child drags it onto the signpost tab that answers it: CONTENTS at the
// front, or INDEX / GLOSSARY / BIBLIOGRAPHY at the back. Right tab: the book
// opens to that section and the answer highlights. Wrong tab: the book
// shrugs shut and bounces the card back. Final mission: sort book covers
// onto a FICTION / NON-FICTION shelf (place-all-then-check).

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const CREATURE_IMG = 'assets/monsters/contents-mcindex.png';
const RULE = 'Contents = where chapters start; index = where topics hide (back, A-Z); glossary = word meanings; bibliography = books used. Fiction is invented; non-fiction is fact.';

/* ---------- pure geometry helpers (unit-tested in a /tmp scratch script —
   do not "improve" without re-running it) ---------- */
// margin genuinely widens the card's hit region (not just an overlap test —
// the area itself is measured against the inflated rect), so a near-miss
// drop within `margin` px of a tab still snaps to it, not to null.
export function pickTab(cardRect, tabs, margin = 8) {
  const inf = { left: cardRect.left - margin, right: cardRect.right + margin, top: cardRect.top - margin, bottom: cardRect.bottom + margin };
  let best = null; let bestArea = 0;
  for (const t of tabs) {
    const ix = Math.min(inf.right, t.right) - Math.max(inf.left, t.left);
    const iy = Math.min(inf.bottom, t.bottom) - Math.max(inf.top, t.top);
    const area = Math.max(0, ix) * Math.max(0, iy);
    if (area > bestArea) { bestArea = area; best = t.id; }
  }
  return best;
}
export function pointInRect(x, y, r, margin = 0) {
  return x >= r.left - margin && x <= r.right + margin && y >= r.top - margin && y <= r.bottom + margin;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- authored content (verified in the scratch script: chapter
   numbers/pages/index pages/alphabetical order all self-consistent) ---------- */
const TAB_INFO = {
  contents: { label: 'CONTENTS', job: 'lists chapters in the order they appear, each one lined up with its starting page number' },
  index: { label: 'INDEX', job: 'lists topics A-Z, at the back, with every page each one appears on' },
  glossary: { label: 'GLOSSARY', job: 'explains the tricky WORDS used in this book, A-Z, with their meanings' },
  bibliography: { label: 'BIBLIOGRAPHY', job: "lists every other book or source the author read — proof the facts are real" },
};
const CONTENTS_ROWS = [
  { n: 1, title: 'The Swamp Awakens', page: 4 },
  { n: 2, title: 'Into the Bog', page: 15 },
  { n: 3, title: 'Creatures of the Mire', page: 26 },
  { n: 4, title: 'Nightfall Prowlers', page: 41 },
  { n: 5, title: 'The Final Stink', page: 54 },
];
const INDEX_ROWS = [
  { word: 'Bogland', pages: [9] },
  { word: 'Frogs', pages: [22, 47] },
  { word: 'Geese', pages: [12, 34, 58] },
  { word: 'Mire', pages: [26] },
  { word: 'Swamp gas', pages: [5, 19] },
];
const GLOSSARY_ROWS = [
  { word: 'Bog', meaning: 'wet, spongy ground.' },
  { word: 'Mire', meaning: 'deep, thick mud that traps unwary feet.' },
  { word: 'Nocturnal', meaning: 'active at night, sleeping through the day.' },
  { word: 'Prowler', meaning: 'a creature that moves stealthily, hunting.' },
];
const BIBLIOGRAPHY_ROWS = [
  '"Secrets of the Swamp" by I. Squelch (2019)',
  'Bogland Wildlife Trust research papers',
  'Interviews with three swamp rangers',
  '"The Complete Guide to Mire Creatures" by P. Sopp',
];
const MISSIONS = [
  {
    id: 'contents', kind: 'signpost', target: 'contents', chip: 'CH.4 PAGE?',
    card: 'Which PAGE does Chapter 4 start on?',
    worked: 'Chapter 4 — Nightfall Prowlers — starts on page 41. The contents page lists every chapter in the order it appears, each lined up with its starting page number.',
    highlight: (row) => row.n === 4,
  },
  {
    id: 'index', kind: 'signpost', target: 'index', chip: 'GEESE PAGES?',
    card: 'Every page that mentions GEESE?',
    worked: 'Geese turn up on pages 12, 34 and 58! The index lists every page a topic is mentioned on, alphabetically, at the back.',
    highlight: (row) => row.word === 'Geese',
  },
  {
    id: 'glossary', kind: 'signpost', target: 'glossary', chip: 'NOCTURNAL?',
    card: "What does 'NOCTURNAL' mean in this book?",
    worked: 'Nocturnal means active at night, sleeping through the day — exactly the kind of tricky word the glossary explains.',
    highlight: (row) => row.word === 'Nocturnal',
  },
  {
    id: 'bibliography', kind: 'signpost', target: 'bibliography', chip: 'REAL FACTS?',
    card: 'Did the author make these facts up?',
    worked: "Four real sources! The bibliography is the proof shelf — it shows exactly where the author's facts came from.",
    highlight: () => true,
  },
  { id: 'sort', kind: 'sort', chip: 'SORT SHELF' },
];
// wrong-tab feedback, adapted from the topic bank's own whyWrong wording
const WRONG_TEXT = {
  contents: {
    index: 'The index lists topics A-Z, not chapters in story order — no help for a chapter number.',
    glossary: 'The glossary explains tricky words, not chapter page numbers.',
    bibliography: "The bibliography lists the author's sources, not chapter page numbers.",
  },
  index: {
    contents: 'The contents page only shows where chapters START — not every page a topic is mentioned on.',
    glossary: 'The glossary explains word meanings, not which pages mention a topic.',
    bibliography: 'The bibliography lists research sources, not page numbers for a topic.',
  },
  glossary: {
    contents: 'The contents page lists chapters, not word meanings.',
    index: 'The index gives page numbers for topics, not meanings for tricky words.',
    bibliography: 'The bibliography lists sources, not word meanings.',
  },
  bibliography: {
    contents: 'The contents page lists chapters — it proves nothing about where facts came from.',
    index: 'The index gives page numbers for topics — it proves nothing about where facts came from.',
    glossary: 'The glossary explains words — it proves nothing about where facts came from.',
  },
};
const SORT_CARDS = [
  { id: 'dragon', title: 'The Dragon Who Lost His Roar', shelf: 'fiction' },
  { id: 'volcano', title: 'How Volcanoes Erupt', shelf: 'nonfiction' },
  { id: 'wizard', title: 'The Wizard Who Lost His Wand', shelf: 'fiction' },
  { id: 'frog', title: 'The Life Cycle of a Frog', shelf: 'nonfiction' },
];
const WIN_PHRASES = ['SIGNPOST FOUND! 📖', 'STRAIGHT TO THE PAGE!', 'McINDEX POINTS TRUE!', 'NEVER LOST AGAIN!'];

function rowsHtml(mission) {
  const t = mission.target;
  if (t === 'contents') {
    return CONTENTS_ROWS.map((r) => `<div class="ssf-row${mission.highlight(r) ? ' hi' : ''}"><span class="ssf-rn">Ch.${r.n}</span><span class="ssf-rt">${r.title}</span><span class="ssf-rp">p.${r.page}</span></div>`).join('');
  }
  if (t === 'index') {
    return INDEX_ROWS.map((r) => `<div class="ssf-row${mission.highlight(r) ? ' hi' : ''}"><span class="ssf-rt">${r.word}</span><span class="ssf-rp">${r.pages.map((p) => `p.${p}`).join(', ')}</span></div>`).join('');
  }
  if (t === 'glossary') {
    return GLOSSARY_ROWS.map((r) => `<div class="ssf-row${mission.highlight(r) ? ' hi' : ''}"><span class="ssf-rt">${r.word}</span><span class="ssf-rm">${r.meaning}</span></div>`).join('');
  }
  return BIBLIOGRAPHY_ROWS.map((s) => `<div class="ssf-row hi"><span class="ssf-rt">📖 ${s}</span></div>`).join('');
}
function renderSignpost(mission) {
  return `<div class="ssf-pagehead">${TAB_INFO[mission.target].label}</div><div class="ssf-pagebody">${rowsHtml(mission)}</div>`;
}

/* ---------- the anim card ---------- */
export default {
  id: 'kinds-of-writing',
  title: 'THE SIGNPOST SHELF',

  mount(host, ctx) {
    let alive = true;
    let mi = 0;
    const doneSet = new Set();
    const attempts = {};
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const qEl = el('div', 'ssf-q');
    const qsub = el('div', 'ssf-qsub');

    /* ---- signpost (book) widget ---- */
    const cardEl = el('div', 'ssf-card');
    const cardHome = el('div', 'ssf-cardhome'); cardHome.append(cardEl);
    const coverEl = el('div', 'ssf-cover', '<div class="ssf-covertitle">📚 THE BUMPER BOOK<br>OF SWAMP BEASTS</div><div class="ssf-coversub">closed — drag a question to a signpost tab</div>');
    const pageEl = el('div', 'ssf-page'); pageEl.style.display = 'none';
    const pagesWrap = el('div', 'ssf-pages'); pagesWrap.append(coverEl, pageEl);
    const tabContents = el('div', 'ssf-tab', 'CONTENTS'); tabContents.dataset.id = 'contents';
    const tabFrontGrp = el('div', 'ssf-tabgrp front'); tabFrontGrp.append(tabContents);
    const tabDiv = el('div', 'ssf-tabdiv', '· BACK OF BOOK ·');
    const tabIndex = el('div', 'ssf-tab', 'INDEX'); tabIndex.dataset.id = 'index';
    const tabGlossary = el('div', 'ssf-tab', 'GLOSSARY'); tabGlossary.dataset.id = 'glossary';
    const tabBiblio = el('div', 'ssf-tab', 'BIBLIOGRAPHY'); tabBiblio.dataset.id = 'bibliography';
    const tabBackGrp = el('div', 'ssf-tabgrp back'); tabBackGrp.append(tabIndex, tabGlossary, tabBiblio);
    const tabCol = el('div', 'ssf-tabcol'); tabCol.append(tabFrontGrp, tabDiv, tabBackGrp);
    const tabEls = [tabContents, tabIndex, tabGlossary, tabBiblio];
    const bookEl = el('div', 'ssf-book'); bookEl.append(pagesWrap, tabCol);
    const bookWrap = el('div', 'ssf-scene'); bookWrap.append(cardHome, bookEl);

    /* ---- sort (shelf) widget ---- */
    const trayEl = el('div', 'ssf-tray');
    const shelfFictionEl = el('div', 'ssf-shelf fiction'); shelfFictionEl.append(el('div', 'ssf-shelflabel', '🐉 FICTION'));
    const shelfNonfictionEl = el('div', 'ssf-shelf nonfiction'); shelfNonfictionEl.append(el('div', 'ssf-shelflabel', '🔬 NON-FICTION'));
    const shelvesEl = el('div', 'ssf-shelves'); shelvesEl.append(shelfFictionEl, shelfNonfictionEl);
    const sortWrap = el('div', 'ssf-sortscene'); sortWrap.append(trayEl, shelvesEl);

    const winBox = el('div');
    const controls = el('div', 'anim-controls');
    const checkBtn = el('button', 'btn btn-gold', 'CHECK SHELVES 📚');
    const resetBtn = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(checkBtn, resetBtn);
    stage.append(chiprow, qEl, qsub, bookWrap, sortWrap, winBox, controls);
    host.append(stage);

    const ruleCard = el('div', 'goldcard', RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;text-align:center;';
    host.append(ruleCard);

    /* ---- signpost drag state ---- */
    let cardBusy = false;
    let cardCancelTween = null;
    function bounceCard(dx, dy) {
      cardBusy = true;
      if (cardCancelTween) cardCancelTween();
      cardCancelTween = tween((v) => { cardEl.style.transform = `translate(${dx * v}px, ${dy * v}px)`; }, 1, 0, 260, () => {
        cardEl.style.transform = ''; cardCancelTween = null; cardBusy = false;
      });
    }
    function correctDrop(mission, tabId) {
      cardBusy = true;
      sfx.ui(); sfx.whoosh();
      tabEls.find((t) => t.dataset.id === tabId).classList.add('active');
      cardEl.classList.add('vanish');
      later(() => { if (alive) { cardEl.style.display = 'none'; openPage(mission); } }, 380);
    }
    function openPage(mission) {
      coverEl.style.display = 'none';
      pageEl.innerHTML = renderSignpost(mission);
      pageEl.style.display = '';
      pageEl.classList.remove('opening'); void pageEl.offsetWidth; pageEl.classList.add('opening');
      sfx.pop(); sfx.sparkle();
      const r = pageEl.getBoundingClientRect(); const sr = stage.getBoundingClientRect();
      sparkleBurst(stage, r.left - sr.left + r.width / 2, r.top - sr.top + 26, 8);
      doneSet.add(mission.id); paintChips();
      winBox.innerHTML = '';
      const w = el('div', 'ssf-win', `<div class="ssf-wp">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]}</div><div class="ssf-wk">${mission.worked}</div>`);
      winBox.append(w);
      appendNextButton(w);
      if (doneSet.size === MISSIONS.length) {
        ctx.complete();
        later(() => bubble(stage, {
          title: 'SHELF MASTERED! 📚',
          text: "A book's signposts each answer ONE kind of lostness — contents for chapter pages, index for every mention, glossary for tricky words, bibliography for proof — and one simple question (invented, or true?) sorts fiction from non-fiction. You'll never get lost between two covers again!",
          img: CREATURE_IMG,
        }), 700);
      }
    }
    function wrongDrop(mission, pickedId, dx, dy) {
      attempts[mission.id] = (attempts[mission.id] || 0) + 1;
      sfx.nudge();
      const tabEl = tabEls.find((t) => t.dataset.id === pickedId);
      tabEl.classList.remove('wrong'); void tabEl.offsetWidth; tabEl.classList.add('wrong');
      bookEl.classList.remove('shrug'); void bookEl.offsetWidth; bookEl.classList.add('shrug');
      bounceCard(dx, dy);
      let text = WRONG_TEXT[mission.target][pickedId];
      if (attempts[mission.id] >= 2) text += `<br><br>🐸 Psst: you need the signpost that <b>${TAB_INFO[mission.target].job}</b>.`;
      bubble(stage, { title: 'BOOK SHRUGS SHUT! 📖', text, img: CREATURE_IMG });
    }
    function handleCardDrop(dx, dy) {
      if (!alive) return;
      const r = cardEl.getBoundingClientRect();
      const cardRect = { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
      const tabRects = tabEls.map((t) => { const tr = t.getBoundingClientRect(); return { id: t.dataset.id, left: tr.left, right: tr.right, top: tr.top, bottom: tr.bottom }; });
      const picked = pickTab(cardRect, tabRects, 10);
      const mission = MISSIONS[mi];
      if (!picked) { bounceCard(dx, dy); toast(stage, 'Signposts live on the tabs — drop the question right on one!'); return; }
      if (picked === mission.target) correctDrop(mission, picked);
      else wrongDrop(mission, picked, dx, dy);
    }
    const cardDrag = makeDrag(cardEl, {
      enabled: () => alive && MISSIONS[mi].kind === 'signpost' && !cardBusy,
      onStart() { if (cardCancelTween) { cardCancelTween(); cardCancelTween = null; } cardEl.classList.add('dragging'); },
      onMove(dx, dy) { cardEl.style.transform = `translate(${dx}px, ${dy}px)`; },
      onEnd(dx, dy) { cardEl.classList.remove('dragging'); handleCardDrop(dx, dy); },
    });
    function startSignpost(mission) {
      attempts[mission.id] = 0;
      if (cardDrag.dragging()) cardDrag.abort();
      if (cardCancelTween) { cardCancelTween(); cardCancelTween = null; }
      cardBusy = false;
      cardEl.style.transform = ''; cardEl.style.display = '';
      cardEl.classList.remove('dragging', 'vanish');
      cardEl.textContent = mission.card;
      tabEls.forEach((t) => t.classList.remove('active', 'wrong'));
      bookEl.classList.remove('shrug');
      coverEl.style.display = ''; pageEl.style.display = 'none'; pageEl.classList.remove('opening');
    }

    /* ---- sort widget wiring ---- */
    const sortCards = shuffle(SORT_CARDS).map((c) => ({ ...c, el: null, locked: false, cancelTween: null, drag: null }));
    let sortSolved = false;
    function updateCheckBtn() { checkBtn.disabled = trayEl.children.length > 0 || sortSolved; }
    function bounceSortCard(c, dx, dy) {
      if (c.cancelTween) c.cancelTween();
      c.cancelTween = tween((v) => { c.el.style.transform = `translate(${dx * v}px, ${dy * v}px)`; }, 1, 0, 240, () => { c.el.style.transform = ''; c.cancelTween = null; });
    }
    function handleSortDrop(c, dx, dy) {
      if (!alive) return;
      const r = c.el.getBoundingClientRect();
      const cx = r.left + r.width / 2; const cy = r.top + r.height / 2;
      const fr = shelfFictionEl.getBoundingClientRect();
      const nr = shelfNonfictionEl.getBoundingClientRect();
      let target = null;
      if (pointInRect(cx, cy, { left: fr.left, right: fr.right, top: fr.top, bottom: fr.bottom }, 14)) target = 'fiction';
      else if (pointInRect(cx, cy, { left: nr.left, right: nr.right, top: nr.top, bottom: nr.bottom }, 14)) target = 'nonfiction';
      if (!target) { bounceSortCard(c, dx, dy); return; }
      c.el.style.transform = '';
      (target === 'fiction' ? shelfFictionEl : shelfNonfictionEl).append(c.el);
      sfx.pop();
      updateCheckBtn();
    }
    function buildCoverCard(c) {
      const e = el('div', 'ssf-cover-card', `<span class="ccc-ico">📕</span><span class="ccc-title">${c.title}</span>`);
      c.el = e;
      c.drag = makeDrag(e, {
        enabled: () => alive && MISSIONS[mi].kind === 'sort' && !c.locked,
        onStart() { if (c.cancelTween) { c.cancelTween(); c.cancelTween = null; } e.classList.add('dragging'); },
        onMove(dx, dy) { e.style.transform = `translate(${dx}px, ${dy}px)`; },
        onEnd(dx, dy) { e.classList.remove('dragging'); handleSortDrop(c, dx, dy); },
      });
      return e;
    }
    sortCards.forEach((c) => trayEl.append(buildCoverCard(c)));
    function flapAndReturn(c) {
      c.el.classList.remove('flap'); void c.el.offsetWidth; c.el.classList.add('flap');
      later(() => { if (!alive) return; c.el.classList.remove('flap'); c.el.style.transform = ''; trayEl.append(c.el); updateCheckBtn(); }, 650);
    }
    function checkSort() {
      if (trayEl.children.length > 0 || sortSolved || !alive) return;
      sfx.ui();
      let allCorrect = true;
      sortCards.forEach((c) => {
        const parent = c.el.parentElement;
        const onCorrectShelf = (c.shelf === 'fiction' && parent === shelfFictionEl) || (c.shelf === 'nonfiction' && parent === shelfNonfictionEl);
        if (onCorrectShelf) { if (!c.locked) { c.locked = true; c.el.classList.add('locked'); sfx.sparkle(); } } else { allCorrect = false; flapAndReturn(c); }
      });
      if (allCorrect) sortWin(); else toast(stage, 'A few covers are on the wrong shelf — nudge the flapping ones and try again!');
      updateCheckBtn();
    }
    function sortWin() {
      sortSolved = true; doneSet.add('sort');
      sfx.win(); party(stage); paintChips();
      winBox.innerHTML = '';
      const w = el('div', 'ssf-win', '<div class="ssf-wp">SHELF SORTED! 🐉🔬</div><div class="ssf-wk">Ask ONE question of every book: is it INVENTED, or is it TRUE? That single question sorts the whole shelf.</div>');
      winBox.append(w); appendNextButton(w);
      if (doneSet.size === MISSIONS.length) {
        ctx.complete();
        later(() => bubble(stage, {
          title: 'SHELF MASTERED! 📚',
          text: "A book's signposts each answer ONE kind of lostness — contents for chapter pages, index for every mention, glossary for tricky words, bibliography for proof — and one simple question (invented, or true?) sorts fiction from non-fiction. You'll never get lost between two covers again!",
          img: CREATURE_IMG,
        }), 700);
      }
    }
    function startSort() {
      sortSolved = false;
      sortCards.forEach((c) => {
        if (c.cancelTween) { c.cancelTween(); c.cancelTween = null; }
        if (c.drag.dragging()) c.drag.abort();
        c.locked = false;
        c.el.classList.remove('locked', 'dragging', 'flap');
        c.el.style.transform = '';
      });
      trayEl.innerHTML = ''; sortCards.forEach((c) => trayEl.append(c.el));
      updateCheckBtn();
    }

    /* ---- shared navigation ---- */
    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), m.chip);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
    }
    function appendNextButton(container) {
      const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
      const nb = el('button', 'btn btn-gold', nextIdx !== -1 ? 'NEXT ONE ➡' : 'PLAY AGAIN 🔁');
      nb.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
      nb.addEventListener('click', () => { sfx.ui(); start(nextIdx !== -1 ? nextIdx : 0); });
      container.append(nb);
    }
    function start(i) {
      mi = i; winBox.innerHTML = ''; paintChips();
      const cur = MISSIONS[i];
      const isSignpost = cur.kind === 'signpost';
      bookWrap.style.display = isSignpost ? '' : 'none';
      sortWrap.style.display = isSignpost ? 'none' : '';
      checkBtn.style.display = isSignpost ? 'none' : '';
      if (isSignpost) {
        qEl.textContent = 'A QUESTION ARRIVES...';
        qsub.textContent = 'Drag the card to the signpost tab that answers it.';
        startSignpost(cur);
      } else {
        qEl.textContent = 'Sort the shelf!';
        qsub.textContent = 'Drag each cover onto FICTION or NON-FICTION, then press CHECK SHELVES.';
        startSort();
      }
    }
    checkBtn.addEventListener('click', () => { if (MISSIONS[mi].kind === 'sort') checkSort(); });
    resetBtn.addEventListener('click', () => {
      sfx.ui();
      const cur = MISSIONS[mi];
      doneSet.delete(cur.id);
      winBox.innerHTML = '';
      if (cur.kind === 'signpost') startSignpost(cur); else startSort();
      paintChips();
    });

    function onResize() {
      if (!alive) return;
      if (cardDrag.dragging()) cardDrag.abort();
      if (cardCancelTween) { cardCancelTween(); cardCancelTween = null; }
      if (cardEl.style.display !== 'none') { cardEl.style.transform = ''; cardBusy = false; }
      sortCards.forEach((c) => {
        if (c.drag.dragging()) c.drag.abort();
        if (c.cancelTween) { c.cancelTween(); c.cancelTween = null; }
        c.el.style.transform = '';
      });
    }
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    start(0);
    later(() => bubble(stage, {
      title: 'CONTENTS McINDEX ARRIVES! 📚',
      text: "Contents McIndex has read every page of every book on the Shelf — but he only remembers WHERE things are written, never what they say! Drag each question to the signpost tab that answers it, and he'll point the way.",
      img: CREATURE_IMG,
    }), 300);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      if (cardCancelTween) cardCancelTween();
      cardDrag.destroy();
      sortCards.forEach((c) => { if (c.cancelTween) c.cancelTween(); c.drag.destroy(); });
      stage.remove();
      ruleCard.remove();
    };
  },
};

const CSS = `
.ssf-q { text-align: center; font-weight: 700; font-size: clamp(18px, 2.8vw, 24px); margin-bottom: 2px; }
.ssf-qsub { text-align: center; font-size: 12.5px; color: #6b5744; font-weight: 500; margin-bottom: 10px; }
.ssf-scene { position: relative; max-width: 640px; margin: 0 auto; }
.ssf-cardhome { display: flex; justify-content: center; margin-bottom: 14px; min-height: 64px; }
.ssf-card { background: var(--card); border: 3px solid var(--ink); border-radius: 14px; padding: 12px 16px; font-weight: 700; font-size: 14px; text-align: center; max-width: 280px; cursor: grab; box-shadow: 0 4px 0 rgba(51,38,29,.3); touch-action: none; -webkit-user-select: none; user-select: none; }
.ssf-card.dragging { cursor: grabbing; box-shadow: 0 1px 0 rgba(0,0,0,.3); position: relative; z-index: 9; }
.ssf-card.vanish { animation: ssfVanish .38s ease forwards; }
@keyframes ssfVanish { to { transform: scale(.3); opacity: 0; } }
.ssf-book { display: flex; gap: 10px; align-items: stretch; background: linear-gradient(180deg,#efe1c4,#e8d7b4); border-radius: 16px; border: 3px solid rgba(51,38,29,.18); box-shadow: inset 0 3px 8px rgba(51,38,29,.15); padding: 14px; min-height: 230px; }
.ssf-book.shrug { animation: ssfShrug .5s ease; }
@keyframes ssfShrug { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(-1.4deg); } 55% { transform: rotate(1.2deg); } 80% { transform: rotate(-.6deg); } }
.ssf-pages { flex: 1; position: relative; background: #fffaf0; border-radius: 12px; border: 2px solid rgba(51,38,29,.15); padding: 14px; min-height: 200px; display: flex; }
.ssf-cover { margin: auto; text-align: center; color: #8a7355; }
.ssf-covertitle { font-weight: 800; font-size: 16px; line-height: 1.3; color: #5a4838; }
.ssf-coversub { font-size: 11px; margin-top: 8px; font-style: italic; }
.ssf-page { display: none; width: 100%; }
.ssf-page.opening { animation: ssfPageIn .45s var(--spring) both; }
@keyframes ssfPageIn { from { opacity: 0; transform: scale(.9) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
.ssf-pagehead { font-weight: 800; letter-spacing: .06em; font-size: 13px; color: var(--gold-deep); text-align: center; margin-bottom: 8px; border-bottom: 2px dashed rgba(51,38,29,.2); padding-bottom: 6px; }
.ssf-pagebody { display: flex; flex-direction: column; gap: 4px; max-height: 220px; overflow-y: auto; }
.ssf-row { display: flex; justify-content: space-between; gap: 8px; font-size: 12.5px; padding: 5px 8px; border-radius: 8px; color: #5a4838; }
.ssf-row.hi { background: linear-gradient(180deg,#FFF3CE,#FBE29A); box-shadow: 0 0 0 2px var(--gold-deep) inset; font-weight: 800; color: #3a2c05; animation: ssfRowGlow .9s ease 1; }
@keyframes ssfRowGlow { 0% { box-shadow: 0 0 0 2px var(--gold-deep) inset, 0 0 0 0 rgba(244,197,66,.7); } 60% { box-shadow: 0 0 0 2px var(--gold-deep) inset, 0 0 14px 4px rgba(244,197,66,.5); } 100% { box-shadow: 0 0 0 2px var(--gold-deep) inset, 0 0 0 0 rgba(244,197,66,0); } }
.ssf-rn { font-weight: 700; color: #a08c74; flex: 0 0 auto; }
.ssf-rt { flex: 1; text-align: left; }
.ssf-rp, .ssf-rm { flex: 0 0 auto; text-align: right; color: #7c6247; font-weight: 700; }
.ssf-row.hi .ssf-rp, .ssf-row.hi .ssf-rm, .ssf-row.hi .ssf-rn { color: #5a4408; }
.ssf-tabcol { flex: 0 0 auto; display: flex; flex-direction: column; justify-content: flex-start; gap: 6px; width: 104px; }
.ssf-tabgrp { display: flex; flex-direction: column; gap: 6px; }
.ssf-tabdiv { text-align: center; font-size: 8.5px; color: #a08c74; font-weight: 700; letter-spacing: .05em; margin: 2px 0; }
.ssf-tab { background: var(--swamp-mid); color: var(--stink-lime); font-weight: 800; font-size: 10px; letter-spacing: .03em; border-radius: 10px 4px 4px 10px; padding: 11px 6px; text-align: center; box-shadow: 0 3px 0 rgba(0,0,0,.3); min-height: 44px; display: flex; align-items: center; justify-content: center; }
.ssf-tab.active { background: var(--correct); color: #08331a; box-shadow: 0 0 0 3px #fff, 0 0 14px rgba(46,204,113,.6); }
.ssf-tab.wrong { animation: ssfTabWobble .45s ease; }
@keyframes ssfTabWobble { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 60% { transform: translateX(4px); } 85% { transform: translateX(-2px); } }
.ssf-sortscene { max-width: 640px; margin: 0 auto; }
.ssf-tray { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; min-height: 80px; margin-bottom: 12px; }
.ssf-shelves { display: flex; gap: 12px; flex-wrap: wrap; }
.ssf-shelf { flex: 1 1 220px; min-height: 120px; background: linear-gradient(180deg,#efe1c4,#e8d7b4); border: 3px dashed rgba(51,38,29,.25); border-radius: 14px; padding: 10px; display: flex; flex-wrap: wrap; gap: 8px; align-content: flex-start; justify-content: center; }
.ssf-shelflabel { flex: 0 0 100%; text-align: center; font-weight: 800; font-size: 12px; color: #7c6247; margin-bottom: 4px; }
.ssf-cover-card { background: var(--card); border: 3px solid var(--ink); border-radius: 12px; padding: 10px 8px; width: 120px; font-weight: 700; font-size: 11.5px; text-align: center; line-height: 1.25; cursor: grab; box-shadow: 0 3px 0 rgba(51,38,29,.3); touch-action: none; -webkit-user-select: none; user-select: none; }
.ssf-cover-card .ccc-ico { display: block; font-size: 20px; margin-bottom: 4px; }
.ssf-cover-card.dragging { cursor: grabbing; position: relative; z-index: 9; box-shadow: 0 1px 0 rgba(0,0,0,.3); }
.ssf-cover-card.locked { border-color: var(--correct); background: #E9FBEF; cursor: default; }
.ssf-cover-card.flap { animation: ssfFlap .6s ease; }
@keyframes ssfFlap { 0%, 100% { transform: rotate(0); } 20% { transform: rotate(-9deg); } 45% { transform: rotate(7deg); } 70% { transform: rotate(-5deg); } }
.ssf-win { margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF); border: 3px solid var(--correct); border-radius: 14px; padding: 10px 14px; animation: animBubbleIn .34s var(--spring) both; }
.ssf-wp { font-weight: 700; color: #1d8f4e; font-size: 16px; }
.ssf-wk { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 4px; }
`;
injectCss('kinds-of-writing', CSS);
