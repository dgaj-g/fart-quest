// FART QUEST — js/anims/writers-tricks.js
// EMILY'S TRICK DETECTOR — interactive writer's-craft spotting machine for
// the writers-tricks Scout Report (Storybog / Simile Emily). The child sets
// the detector LENS first (SIMILE / METAPHOR / LIST), then sweeps it down a
// storm-night sentence card. A matching lens locks on and reveals its own
// EVIDENCE (the comparing word, the bare IS/WAS claim, or the piled-up
// items); a wrong lens fizzles with a reason but never gives the answer
// away — the child just re-picks and scans again. The final mission drags
// each spotted trick onto the EFFECT it creates on the reader.

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const EMILY_IMG = 'assets/monsters/simile-emily.png';
const RULE = 'A simile compares with like or as; a metaphor says it IS; a list piles things up to overwhelm you — always ask what EFFECT it has.';
const TAGLINE = "Spot the trick — then ask what it's doing to YOU, the reader.";

/* ---------- pure helper (Fisher-Yates — proven pattern, reused verbatim) ---------- */
function fisherYates(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const LENS_DEFS = {
  simile: { label: 'SIMILE', icon: '🔗' },
  metaphor: { label: 'METAPHOR', icon: '💥' },
  list: { label: 'LIST', icon: '📚' },
};

/* ---------- content — three scan missions (each authored as text segments
   so evidence highlighting is exact, never a runtime string-search that
   could mis-highlight) plus one drag-to-effect mission. Sentences reuse the
   topic file's own stormy-night imagery and its "the sea was a monster"
   metaphor verbatim. Every miss-reason was checked against its sentence in
   a /tmp scratch script: no false "no like/as" claims, item counts correct. */
const SCAN_MISSIONS = [
  {
    id: 'sim', trick: 'simile',
    segs: [
      { t: 'The sea was ', k: 'plain' },
      { t: 'like', k: 'ev' },
      { t: ' a growling monster.', k: 'plain' },
    ],
    worked: 'The word "like" signals a SIMILE — it compares the sea to a growling monster. Effect: it lets you picture something wild and dangerous, without ever claiming the sea actually IS a monster.',
    miss: {
      metaphor: "There's no bold IS/WAS claim standing alone here — ‘like’ is doing the comparing. Scan again.",
      list: 'Only one thing is being described here — a list needs three or more piled up. Scan again.',
    },
  },
  {
    id: 'met', trick: 'metaphor',
    segs: [
      { t: 'The sea ', k: 'plain' },
      { t: 'was', k: 'ev' },
      { t: ' a monster, thrashing and clawing at the rocks.', k: 'plain' },
    ],
    worked: '"was" makes a bold claim with no comparing word at all — that\'s a METAPHOR. Effect: it hits harder than a simile, because it dares you to believe the sea actually IS the monster.',
    miss: {
      simile: "No ‘like’ or ‘as’ anywhere — scan again.",
      list: 'Only one thing is being described here — the sea. A list needs three or more piled up. Scan again.',
    },
  },
  {
    id: 'lst', trick: 'list',
    segs: [
      { t: 'Rain hammered ', k: 'plain' },
      { t: 'the roof', k: 'it' },
      { t: ', ', k: 'plain' },
      { t: 'the windows', k: 'it' },
      { t: ', ', k: 'plain' },
      { t: 'the door', k: 'it' },
      { t: ', ', k: 'plain' },
      { t: 'the whole shaking house', k: 'it' },
      { t: '.', k: 'plain' },
    ],
    worked: 'Four things are piled up in one breath — the roof, the windows, the door, the whole shaking house — that\'s a LIST. Effect: it overwhelms you, exactly like a storm attacking from every direction at once.',
    miss: {
      simile: "No ‘like’ or ‘as’ anywhere — scan again.",
      metaphor: "There's no single bold IS/WAS claim here — four different things are piled up instead. Scan again.",
    },
  },
];

const MATCH = {
  tricks: [
    { id: 'simile', label: 'SIMILE', snippet: '“like a growling monster”' },
    { id: 'metaphor', label: 'METAPHOR', snippet: '“was a monster”' },
    { id: 'list', label: 'LIST', snippet: '“roof, windows, door, house”' },
  ],
  effects: [
    { id: 'simile', text: 'makes you picture it' },
    { id: 'metaphor', text: 'hits harder — claims it IS' },
    { id: 'list', text: 'overwhelms you — too much at once' },
  ],
};

/* ---------- scan board (one sentence-card mission) ---------- */
function makeScanBoard(host, mission, opts) {
  let alive = true;
  let busy = false;
  let solved = false;
  let selected = null;
  let cancelTween = null;
  const pending = new Set();
  const later = (fn, ms) => { const id = setTimeout(() => { pending.delete(id); if (alive) fn(); }, ms); pending.add(id); };

  const lensOrder = fisherYates(['simile', 'metaphor', 'list']);
  const lensRow = el('div', 'etd-lensrow');
  const lensBtns = {};
  lensOrder.forEach((id) => {
    const d = LENS_DEFS[id];
    const b = el('button', 'etd-lens', `<span class="etd-li">${d.icon}</span><span class="etd-ll">${d.label}</span>`);
    b.addEventListener('click', () => {
      if (busy || solved) return;
      sfx.ui();
      selected = id;
      Object.entries(lensBtns).forEach(([k, e]) => e.classList.toggle('active', k === id));
    });
    lensBtns[id] = b;
    lensRow.append(b);
  });

  const card = el('div', 'etd-card');
  const sentence = el('div', 'etd-sentence');
  mission.segs.forEach((s) => {
    if (s.k === 'plain') { sentence.append(document.createTextNode(s.t)); return; }
    const sp = el('span', 'etd-word' + (s.k === 'it' ? ' etd-item' : ' etd-evidence'), s.t);
    if (s.k === 'it') sp.dataset.n = String(sentence.querySelectorAll('.etd-item').length + 1);
    sentence.append(sp);
  });
  const glass = el('div', 'etd-glass', '\u{1F50D}');
  card.append(sentence, glass);

  const scanBtn = el('button', 'btn btn-gold etd-scanbtn', 'SCAN \u{1F50D}');
  const foot = el('div', 'etd-foot');
  foot.append(scanBtn);

  const wrap = el('div', 'etd-scanwrap');
  wrap.append(lensRow, card, foot);
  host.append(wrap);

  function resetGlass() {
    glass.style.transition = 'none';
    glass.style.opacity = '0';
    glass.style.top = '0px';
    glass.style.transform = 'translate(-50%,-50%) rotate(0deg)';
  }
  resetGlass();

  function doScan() {
    if (busy || solved) return;
    if (!selected) { sfx.nudge(); toast(opts.stage, 'Choose a lens first — SIMILE, METAPHOR or LIST!'); return; }
    busy = true;
    sfx.whoosh();
    const ch = mission.trick === selected;
    const cardH = card.clientHeight;
    glass.style.opacity = '1';
    cancelTween = tween((v) => {
      glass.style.top = (v * Math.max(1, cardH - 30)) + 'px';
      glass.style.transform = `translate(-50%,-50%) rotate(${Math.sin(v * 18) * 9}deg)`;
    }, 0, 1, 620, () => {
      cancelTween = null;
      if (!alive) return;
      if (ch) lockCorrect(); else fizzle();
    });
  }

  function lockCorrect() {
    solved = true;
    sfx.sparkle();
    card.classList.add('etd-locked');
    const evEls = sentence.querySelectorAll('.etd-evidence, .etd-item');
    const first = evEls[0];
    if (first) {
      const cr = card.getBoundingClientRect(); const fr = first.getBoundingClientRect();
      cancelTween = tween((v) => {
        glass.style.left = (v * (fr.left - cr.left + fr.width / 2) + (1 - v) * (card.clientWidth / 2)) + 'px';
        glass.style.top = (v * (fr.top - cr.top + fr.height / 2) + (1 - v) * glass.offsetTop) + 'px';
      }, 0, 1, 260, () => {
        cancelTween = null;
        if (!alive) return;
        evEls.forEach((eEl, i) => {
          later(() => { if (alive) { eEl.classList.add('etd-glow'); sfx.pop(); } }, i * 150);
        });
        const b = card.getBoundingClientRect();
        sparkleBurst(opts.stage, b.left - opts.stageRect().left + b.width / 2, b.top - opts.stageRect().top + 14, 8);
        later(() => { glass.style.opacity = '0'; }, evEls.length * 150 + 300);
        later(() => { if (alive) { busy = false; opts.onSolved(mission); } }, evEls.length * 150 + 500);
      });
    } else {
      busy = false; opts.onSolved(mission);
    }
  }

  function fizzle() {
    sfx.nudge();
    card.classList.remove('etd-fizzle'); void card.offsetWidth; card.classList.add('etd-fizzle');
    const reason = mission.miss[selected];
    cancelTween = tween((v) => { glass.style.top = ((1 - v) * Math.max(1, card.clientHeight - 30)) + 'px'; }, 0, 1, 300, () => {
      cancelTween = null;
      glass.style.opacity = '0';
      busy = false;
      if (alive) toast(opts.stage, reason || 'Not quite — scan again.');
    });
  }

  scanBtn.addEventListener('click', doScan);

  return {
    layout() {
      if (cancelTween) { cancelTween(); cancelTween = null; }
      busy = false;
      if (!solved) resetGlass(); else glass.style.opacity = '0';
    },
    destroy() {
      alive = false;
      pending.forEach((t) => clearTimeout(t));
      if (cancelTween) cancelTween();
      wrap.remove();
    },
  };
}

/* ---------- match board (drag each trick onto its effect) ---------- */
function makeMatchBoard(host, opts) {
  let alive = true;
  const pending = new Set();
  const later = (fn, ms) => { const id = setTimeout(() => { pending.delete(id); if (alive) fn(); }, ms); pending.add(id); };

  const field = el('div', 'etd-mfield');
  const slotsRow = el('div', 'etd-slots');
  const trayRow = el('div', 'etd-tray');
  field.append(slotsRow, trayRow);
  host.append(field);

  const slotOrder = fisherYates(MATCH.effects);
  const slots = {};
  slotOrder.forEach((eff) => {
    const s = el('div', 'etd-slot', `<div class="etd-stxt">${eff.text}</div><div class="etd-sdrop"></div>`);
    slots[eff.id] = { id: eff.id, el: s, drop: s.querySelector('.etd-sdrop'), filled: false };
    slotsRow.append(s);
  });

  const chipOrder = fisherYates(MATCH.tricks);
  const chips = {};
  chipOrder.forEach((tr) => {
    const c = el('div', 'etd-chip', `<b>${tr.label}</b><span>${tr.snippet}</span>`);
    trayRow.append(c);
    chips[tr.id] = { id: tr.id, el: c, drag: null, status: 'tray', w: 0, h: 0, origLeft: 0, origTop: 0 };
  });

  let solvedCount = 0;

  function fieldRect() { return field.getBoundingClientRect(); }
  function overSlot(x, y) {
    const fr = fieldRect();
    for (const s of Object.values(slots)) {
      if (s.filled) continue;
      const r = s.el.getBoundingClientRect();
      const pad = 10;
      if (x >= r.left - fr.left - pad && x <= r.right - fr.left + pad && y >= r.top - fr.top - pad && y <= r.bottom - fr.top + pad) return s;
    }
    return null;
  }

  function measureTrayRest(chip) {
    const saved = chip.el.style.cssText;
    chip.el.style.cssText = '';
    trayRow.appendChild(chip.el);
    const r = chip.el.getBoundingClientRect();
    const fr = fieldRect();
    const pos = { x: r.left - fr.left, y: r.top - fr.top };
    field.appendChild(chip.el);
    chip.el.style.cssText = saved;
    return pos;
  }

  function returnToTray(chip, curLeft, curTop) {
    const rest = measureTrayRest(chip);
    chip.cancelTween = tween((t) => {
      chip.el.style.left = (curLeft + (rest.x - curLeft) * t) + 'px';
      chip.el.style.top = (curTop + (rest.y - curTop) * t) + 'px';
    }, 0, 1, 260, () => {
      chip.cancelTween = null;
      if (!alive) return;
      chip.status = 'tray';
      chip.el.classList.remove('etd-flying');
      chip.el.style.cssText = '';
      trayRow.appendChild(chip.el);
    });
  }

  function settleIn(chip, slot, curLeft, curTop) {
    const dr = slot.drop.getBoundingClientRect(); const fr = fieldRect();
    const tx = dr.left - fr.left + dr.width / 2 - chip.w / 2;
    const ty = dr.top - fr.top + dr.height / 2 - chip.h / 2;
    chip.cancelTween = tween((t) => {
      chip.el.style.left = (curLeft + (tx - curLeft) * t) + 'px';
      chip.el.style.top = (curTop + (ty - curTop) * t) + 'px';
    }, 0, 1, 220, () => {
      chip.cancelTween = null;
      if (!alive) return;
      chip.status = 'seated';
      chip.el.classList.remove('etd-flying');
      chip.el.classList.add('etd-seated');
      slot.filled = true;
      slot.el.classList.add('etd-slot-done');
      sfx.drop(); sfx.sparkle();
      const b = slot.el.getBoundingClientRect(); const fr2 = fieldRect();
      sparkleBurst(opts.stage, opts.stageRect().x + (b.left - fr2.left) + b.width / 2, opts.stageRect().y + (b.top - fr2.top) + b.height / 2, 8);
      solvedCount += 1;
      if (solvedCount === MATCH.tricks.length) later(() => { if (alive) opts.onAllMatched(); }, 350);
    });
  }

  Object.values(chips).forEach((chip) => {
    chip.drag = makeDrag(chip.el, {
      enabled: () => alive && chip.status === 'tray',
      onStart() {
        if (chip.cancelTween) { chip.cancelTween(); chip.cancelTween = null; }
        const fr = fieldRect();
        const r = chip.el.getBoundingClientRect();
        chip.origLeft = r.left - fr.left; chip.origTop = r.top - fr.top;
        chip.w = r.width; chip.h = r.height;
        chip.el.style.width = chip.w + 'px'; chip.el.style.height = chip.h + 'px';
        chip.el.style.position = 'absolute';
        chip.el.style.left = chip.origLeft + 'px'; chip.el.style.top = chip.origTop + 'px';
        chip.el.style.zIndex = 50;
        field.appendChild(chip.el);
        chip.el.classList.add('etd-flying');
        chip.status = 'flying';
      },
      onMove(dx, dy) {
        const left = chip.origLeft + dx; const top = chip.origTop + dy;
        chip.el.style.left = left + 'px'; chip.el.style.top = top + 'px';
        Object.values(slots).forEach((s) => s.el.classList.remove('etd-slot-hover'));
        const hov = overSlot(left + chip.w / 2, top + chip.h / 2);
        if (hov) hov.el.classList.add('etd-slot-hover');
      },
      onEnd(dx, dy) {
        const left = chip.origLeft + dx; const top = chip.origTop + dy;
        Object.values(slots).forEach((s) => s.el.classList.remove('etd-slot-hover'));
        const hov = overSlot(left + chip.w / 2, top + chip.h / 2);
        if (hov && hov.id === chip.id) { settleIn(chip, hov, left, top); return; }
        if (hov && hov.id !== chip.id) {
          sfx.nudge();
          hov.el.classList.remove('etd-slot-wrong'); void hov.el.offsetWidth; hov.el.classList.add('etd-slot-wrong');
          later(() => { if (hov.el.isConnected) hov.el.classList.remove('etd-slot-wrong'); }, 500);
          if (alive) toast(opts.stage, `${LENS_DEFS[chip.id].label} doesn't do that — try a different card here.`);
        }
        returnToTray(chip, left, top);
      },
    });
  });

  return {
    layout() {
      Object.values(chips).forEach((chip) => {
        if (chip.drag) chip.drag.abort();
        if (chip.cancelTween) { chip.cancelTween(); chip.cancelTween = null; }
        if (chip.status !== 'seated') {
          chip.status = 'tray';
          chip.el.classList.remove('etd-flying');
          chip.el.style.cssText = '';
          trayRow.appendChild(chip.el);
        }
      });
      Object.values(slots).forEach((s) => s.el.classList.remove('etd-slot-hover'));
    },
    destroy() {
      alive = false;
      pending.forEach((t) => clearTimeout(t));
      Object.values(chips).forEach((chip) => {
        if (chip.cancelTween) chip.cancelTween();
        if (chip.drag) chip.drag.destroy();
      });
      field.remove();
    },
  };
}

const CSS = `
.etd-qsub { text-align:center; font-size:12.5px; color:#6b5744; font-weight:500; margin-bottom:12px; max-width:600px; margin-left:auto; margin-right:auto; }
.etd-lensrow { display:flex; gap:9px; justify-content:center; flex-wrap:wrap; margin-bottom:12px; }
.etd-lens { display:flex; flex-direction:column; align-items:center; gap:2px; background:var(--card); border:2.5px solid var(--swamp-mid); color:var(--ink); border-radius:14px; padding:8px 16px; font-weight:700; cursor:pointer; box-shadow:0 3px 0 rgba(0,0,0,.2); min-height:44px; }
.etd-lens .etd-li { font-size:19px; line-height:1; }
.etd-lens .etd-ll { font-size:11.5px; letter-spacing:.04em; }
.etd-lens.active { background:var(--swamp-mid); color:var(--stink-lime); border-color:var(--stink-lime); }
.etd-scanwrap { max-width:640px; margin:0 auto; }
.etd-card {
  position:relative; background:linear-gradient(180deg,#efe1c4,#e8d7b4); border-radius:16px;
  box-shadow:inset 0 3px 8px rgba(51,38,29,.18); padding:22px 18px; overflow:hidden;
}
.etd-sentence { font-size:clamp(17px,2.6vw,21px); font-weight:600; line-height:1.65; text-align:center; color:var(--ink); }
.etd-word { position:relative; display:inline; border-radius:6px; padding:0 2px; }
.etd-word.etd-glow.etd-evidence { background:rgba(46,204,113,.28); color:#1d8f4e; font-weight:800; box-shadow:0 0 0 2px rgba(46,204,113,.5); }
.etd-word.etd-glow.etd-item { background:rgba(155,89,208,.24); color:#6a3894; font-weight:800; box-shadow:0 0 0 2px rgba(155,89,208,.45); }
.etd-word.etd-item[data-n].etd-glow::after {
  content: attr(data-n); position:absolute; top:-11px; right:-8px; background:var(--gold-deep); color:#fff;
  font-size:10px; font-weight:800; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center;
}
.etd-glass { position:absolute; left:50%; top:0; transform:translate(-50%,-50%); font-size:30px; opacity:0; pointer-events:none; filter:drop-shadow(0 3px 4px rgba(0,0,0,.35)); z-index:5; }
.etd-card.etd-locked { box-shadow:inset 0 0 0 3px rgba(46,204,113,.5), inset 0 3px 8px rgba(51,38,29,.18); }
.etd-card.etd-fizzle { animation: etdShake .45s ease, etdFizzleFlash .5s ease; }
@keyframes etdFizzleFlash { 0%,100% { box-shadow: inset 0 3px 8px rgba(51,38,29,.18); } 30% { box-shadow: inset 0 0 0 3px var(--wrong), inset 0 3px 8px rgba(51,38,29,.18); } }
@keyframes etdShake { 0%,100% { transform:translateX(0); } 20% { transform:translateX(-7px); } 45% { transform:translateX(7px); } 70% { transform:translateX(-4px); } 88% { transform:translateX(3px); } }
.etd-foot { display:flex; justify-content:center; margin-top:14px; }
.etd-scanbtn { font-size:15px; padding:11px 26px; }
.etd-win { margin-top:14px; text-align:center; background:linear-gradient(180deg,#E9FBEF,#D3F3DF); border:3px solid var(--correct); border-radius:14px; padding:10px 14px; animation:animBubbleIn .34s var(--spring) both; }
.etd-wp { font-weight:700; color:#1d8f4e; font-size:16px; }
.etd-wk { font-size:13.5px; color:#4d6b58; font-weight:500; margin-top:2px; }
.etd-mfield { max-width:700px; margin:0 auto; }
.etd-slots { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-bottom:18px; }
.etd-slot { flex:1 1 180px; max-width:220px; background:var(--card); border:2.5px dashed var(--swamp-mid); border-radius:14px; padding:10px 10px 12px; text-align:center; }
.etd-slot .etd-stxt { font-size:12.5px; font-weight:700; color:var(--ink); margin-bottom:8px; min-height:32px; display:flex; align-items:center; justify-content:center; }
.etd-slot .etd-sdrop { min-height:40px; border-radius:10px; background:rgba(51,38,29,.05); }
.etd-slot.etd-slot-hover { border-color:var(--stink); background:rgba(155,89,208,.08); }
.etd-slot.etd-slot-done { border-style:solid; border-color:var(--correct); }
.etd-slot.etd-slot-wrong { animation: etdSlotWrong .5s ease; border-color:var(--wrong); }
@keyframes etdSlotWrong { 0%,100% { transform:translateX(0); } 25% { transform:translateX(-5px); } 60% { transform:translateX(5px); } 85% { transform:translateX(-3px); } }
.etd-tray { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; min-height:60px; }
.etd-chip {
  display:flex; flex-direction:column; align-items:center; gap:2px; background:#fff; border:3px solid var(--ink);
  border-radius:14px; padding:9px 15px; font-size:13px; color:var(--ink); box-shadow:0 3px 0 rgba(51,38,29,.3);
  cursor:grab; touch-action:none; -webkit-user-select:none; user-select:none;
}
.etd-chip b { font-size:13.5px; }
.etd-chip span { font-weight:500; color:#6b5744; font-size:11.5px; }
.etd-chip.etd-flying { cursor:grabbing; box-shadow:0 9px 16px rgba(0,0,0,.35); }
.etd-chip.etd-seated { position:static !important; box-shadow:none; border-color:var(--correct); background:#eafff2; cursor:default; }
.anim-mchip.etd-locked-chip { opacity:.55; }
.etd-rulecard {
  margin-top:12px; font-size:13.5px; line-height:1.35; background:linear-gradient(180deg,#FFF3CE,#FBE29A);
  border:3px solid var(--gold-deep); border-radius:14px; padding:10px 14px; color:#5a4408; font-weight:700;
  max-width:980px; margin-left:auto; margin-right:auto;
}
`;

/* ---------- the anim card ---------- */
export default {
  id: 'writers-tricks',
  title: "EMILY'S TRICK DETECTOR",

  mount(host, ctx) {
    let alive = true;
    let scanBoard = null;
    let matchBoard = null;
    let mi = 0; // 0..2 = scan missions, 3 = match
    const doneSet = new Set();
    let matchDone = false;
    let ahaShown = false;
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    injectCss('writers-tricks', CSS);

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const qsub = el('div', 'etd-qsub');
    const boardHost = el('div');
    const winBox = el('div');
    stage.append(chiprow, qsub, boardHost, winBox);
    host.append(stage);

    const ruleCard = el('div', 'etd-rulecard', RULE);
    host.append(ruleCard);

    const stageRect = () => stage.getBoundingClientRect();

    function destroyBoards() {
      if (scanBoard) { scanBoard.destroy(); scanBoard = null; }
      if (matchBoard) { matchBoard.destroy(); matchBoard = null; }
    }

    function paintChips() {
      chiprow.innerHTML = '';
      SCAN_MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), `CARD ${i + 1}`);
        c.addEventListener('click', () => { sfx.ui(); startMission(i); });
        chiprow.append(c);
      });
      const unlocked = doneSet.size === SCAN_MISSIONS.length;
      const fp = el('button', 'anim-mchip' + (mi === 3 ? ' active' : '') + (matchDone ? ' done' : '') + (unlocked ? '' : ' etd-locked-chip'), 'EFFECTS \u{1F3AF}');
      fp.addEventListener('click', () => {
        if (!unlocked) { sfx.nudge(); toast(stage, 'Spot all three tricks first — then match their effects!'); return; }
        sfx.ui(); startMission(3);
      });
      chiprow.append(fp);
    }

    function startMission(i) {
      mi = i;
      winBox.innerHTML = '';
      destroyBoards();
      paintChips();
      if (i < 3) {
        const mission = SCAN_MISSIONS[i];
        qsub.textContent = 'Pick a lens, then press SCAN to sweep it down the sentence.';
        scanBoard = makeScanBoard(boardHost, mission, {
          stage,
          stageRect,
          onSolved(m) { solvedScan(m); },
        });
        return;
      }
      qsub.textContent = 'Drag each trick onto the EFFECT it creates on the reader.';
      matchBoard = makeMatchBoard(boardHost, {
        stage,
        stageRect,
        onAllMatched() { allMatched(); },
      });
    }

    function solvedScan(mission) {
      doneSet.add(mission.id);
      sfx.win(); party(stage);
      paintChips();
      winBox.innerHTML = '';
      const w = el('div', 'etd-win', `<div class="etd-wp">LENS LOCKED! \u{1F50D}</div><div class="etd-wk">${mission.worked}</div>`);
      winBox.append(w);
      const nextIdx = SCAN_MISSIONS.findIndex((m) => !doneSet.has(m.id));
      const btn = el('button', 'btn btn-gold', nextIdx !== -1 ? 'NEXT CARD ➡' : 'MATCH THE EFFECTS \u{1F3AF}');
      btn.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
      btn.addEventListener('click', () => { sfx.ui(); startMission(nextIdx !== -1 ? nextIdx : 3); });
      w.append(btn);
    }

    function allMatched() {
      matchDone = true;
      sfx.win(); party(stage);
      paintChips();
      winBox.innerHTML = '';
      const w = el('div', 'etd-win', '<div class="etd-wp">EVERY TRICK, EVERY EFFECT! \u{1F3AF}</div>'
        + '<div class="etd-wk">SIMILE makes you picture it. METAPHOR hits harder — it claims. LIST overwhelms you all at once.</div>');
      winBox.append(w);
      ctx.complete();
      if (!ahaShown) {
        ahaShown = true;
        later(() => {
          if (!alive) return;
          bubble(stage, {
            title: 'TRICK DETECTOR MASTER! \u{1F50D}',
            text: `${TAGLINE} Name the trick by its evidence — like/as, a bare IS-claim, or things piling up — then always ask what it DOES to you.`,
            img: EMILY_IMG,
          });
        }, 650);
      }
    }

    const onResize = () => { if (scanBoard) scanBoard.layout(); if (matchBoard) matchBoard.layout(); };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    startMission(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      destroyBoards();
      stage.remove();
      ruleCard.remove();
    };
  },
};
