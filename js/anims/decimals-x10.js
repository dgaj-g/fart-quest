// FART QUEST — js/anims/decimals-x10.js
// THE SLIDE-O-MATIC 1000 — interactive place-value machine for the
// decimals-x10 Scout Report. Digits ride a draggable strip past a fixed
// roller (the decimal point, which NEVER moves). Ported from the standalone
// proof-of-concept Damien approved on 9 Jul 2026; engine copied verbatim
// (429 unit assertions green there).

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party } from './_kit.js';

const POINTY_IMG = 'assets/monsters/pointy-mcpoopants.png';
const RULE = 'The point NEVER moves. The DIGITS slide — LEFT when you multiply (bigger), RIGHT when you divide (smaller). One slide per zero.';

/* ---------- pure place-value engine (proven in the PoC — do not "improve") ---------- */
function parseNumber(str) {
  const parts = String(str).split('.');
  const ip = parts[0] || ''; const fp = parts[1] || '';
  const intTrim = ip.replace(/^0+/, '');
  let digits; let basePlace;
  if (intTrim.length) {
    basePlace = intTrim.length - 1;
    digits = (intTrim + fp).split('').map(Number);
  } else {
    let k = 0; while (k < fp.length && fp[k] === '0') k += 1;
    basePlace = -(k + 1);
    digits = fp.slice(k).split('').map(Number);
  }
  return { str: String(str), digits, basePlace };
}

function layoutFor(m, off) {
  const n = m.digits.length;
  const hi = m.basePlace + off;
  const lo = hi - (n - 1);
  const pads = [];
  if (lo > 0) { for (let p = lo - 1; p >= 0; p -= 1) pads.push(p); }
  else if (hi < 0) { pads.push(0); for (let p = -1; p > hi; p -= 1) pads.push(p); }
  const ghost = new Set();
  for (let i = n - 1; i >= 0; i -= 1) {
    if (m.digits[i] === 0 && (hi - i) < 0) ghost.add(i); else break;
  }
  const padSet = new Set(pads);
  let bottom = lo; while (ghost.has(hi - bottom)) bottom += 1;
  const chars = [];
  const top = Math.max(hi, 0);
  for (let p = top; p >= Math.min(bottom, 0); p -= 1) {
    if (p === -1) chars.push({ ch: '.', cls: 'pt' });
    if (padSet.has(p)) chars.push({ ch: '0', cls: 'sw' });
    else if (p <= hi && p >= lo) chars.push({ ch: String(m.digits[hi - p]), cls: 'd' });
  }
  if (chars.length && chars[chars.length - 1].cls === 'pt') chars.pop();
  const text = chars.map((c) => c.ch).join('');
  const fog = hi > 4 || lo < -4;
  return { off, hi, lo, pads, ghost, chars, text, fog };
}

function fmtFactor(k) { return Math.pow(10, k).toLocaleString('en-GB'); }

/* ---------- content ---------- */
const MISSIONS = [
  { id: 'a', start: '3.2', op: '×', factor: 10, target: 1, worked: '3.2 × 10 → one slide LEFT → 32.' },
  { id: 'b', start: '5.6', op: '×', factor: 100, target: 2,
    pop: { key: 'swm', title: 'THE SEAT-WARMER! 🪑', text: 'The 5 and the 6 slid LEFT — and left the <b>Units throne EMPTY!</b> A number can\'t have a gap in it, so a <b>zero drops in to keep the seat warm</b>. Without him, 560 would collapse into 56 — ten times too small!' },
    worked: '5.6 × 100 → two slides LEFT → seat-warmer guards the Units throne → 560.' },
  { id: 'c', start: '2.5', op: '÷', factor: 10, target: -1,
    pop: { key: 'swd', title: 'GUARD OF THE FRONT DOOR 🛡️', text: 'Both digits slid RIGHT past Pointy — so the <b>seat-warmer zero guards the Units throne</b>. A decimal never starts with a bare point: it\'s <b>0.25, never .25</b>. SEAG markers hunt for that zero!' },
    worked: '2.5 ÷ 10 → one slide RIGHT → 0.25.' },
  { id: 'd', start: '15.01', op: '÷', factor: 100, target: -2,
    pop: { key: 'swd2', title: 'GUARD OF THE FRONT DOOR 🛡️', text: 'All four digits slid RIGHT — even the 0 in the middle rode along! The Units throne is empty now, so the <b>seat-warmer guards the front door: 0.1501, never .1501</b>.' },
    worked: '15.01 ÷ 100 → two slides RIGHT → 0.1501.' },
  { id: 'e', invisible: true, start: '19', op: '÷', factor: 10, target: -1,
    worked: '19 ÷ 10 → one slide RIGHT → 1.9.' },
  { id: 'f', invisible: true, start: '640', op: '÷', factor: 100, target: -2,
    pop: { key: 'off', title: 'JOB DONE, ZERO! 😴', text: 'See the zero on the very end of <b>6.40</b>? After the point, an END zero adds nothing — 6.40 and <b>6.4</b> are exactly the same size. Clock off, little fella!' },
    worked: '640 ÷ 100 → two slides RIGHT → 6.40 → the end zero clocks off → 6.4.' },
];
const SANDBOX_NUMBERS = ['3.7', '42', '0.85', '205', '90'];
const WIN_PHRASES = ['SLIDE-TASTIC! 💨', 'TEN TIMES MAGNIFICENT!', 'POINTY IS PROUD! 🎩', 'THE FENCE NEVER MOVED! 🏆'];

const COLS = [
  { place: 5, big: '…', sub: 'bigger!', fog: 'l' },
  { place: 4, big: 'TTh', sub: 'ten-thousands' },
  { place: 3, big: 'Th', sub: 'thousands' },
  { place: 2, big: 'H', sub: 'hundreds' },
  { place: 1, big: 'T', sub: 'tens' },
  { place: 0, big: 'U 👑', sub: 'Units throne', units: true },
  { place: -1, big: 't', sub: 'tenths' },
  { place: -2, big: 'h', sub: 'hundredths' },
  { place: -3, big: 'th', sub: 'thousandths' },
  { place: -4, big: 'tth', sub: 'ten-thousandths' },
  { place: -5, big: '…', sub: 'tinier!', fog: 'r' },
];
const colIdx = (place) => 5 - place;
const NCOLS = 11;

/* ---------- the machine ---------- */
function makeBoard(host, model, opts) {
  const B = {
    W: 0, tileW: 0, laneH: 0, stripX: 0, offset: 0, lastProv: 0,
    minX: 0, maxX: 0, cancelTween: null, settling: false, targetOffset: 0,
    revealed: !opts.mystery, alive: true, resetting: false, els: {},
  };
  const machine = el('div', 'som-machine' + (opts.mystery ? ' mystery' : ''));
  const board = el('div', 'som-board');
  const heads = el('div', 'som-heads');
  const lane = el('div', 'som-lane');
  const colbg = el('div', 'som-colbg');
  const fence = el('div', 'som-fence');
  const pads = el('div', 'som-pads');
  const rail = el('div', 'som-rail');
  const hit = el('div', 'som-hit');
  const roller = el('div', 'som-roller');
  const hat = el('div', 'som-hat');
  roller.innerHTML = '<svg viewBox="-40 -40 80 80"><g class="spin">'
    + '<circle r="31" fill="#E9CD92" stroke="#6B4A2F" stroke-width="3.5"/>'
    + Array.from({ length: 8 }, (_, i) => `<line x1="0" y1="-28" x2="0" y2="-17" stroke="#6B4A2F" stroke-width="3.5" stroke-linecap="round" transform="rotate(${i * 45})"/>`).join('')
    + '<circle cx="0" cy="-22.5" r="3.4" fill="#B03A2E"/></g>'
    + '<circle r="10.5" fill="#33261D"/></svg>';
  hat.innerHTML = '<svg width="40" height="30" viewBox="0 0 46 34">'
    + '<path d="M23 1 L34 24 L12 24 Z" fill="#9B59D0" stroke="#5e3387" stroke-width="2"/>'
    + '<rect x="12" y="19" width="22" height="5.5" rx="2" fill="#F4C542" stroke="#B8860B" stroke-width="1.2"/>'
    + '<ellipse cx="23" cy="27.5" rx="19" ry="5" fill="#9B59D0" stroke="#5e3387" stroke-width="2"/>'
    + '<circle cx="23" cy="11" r="2.4" fill="#F4C542"/></svg>';
  lane.append(colbg, fence, pads, rail, roller, hit);
  board.append(heads, lane, hat);
  machine.append(board);
  host.append(machine);
  const spin = roller.querySelector('.spin');
  Object.assign(B.els, { machine, lane, pads, rail, hit });

  B.layout = function layout() {
    if (B.cancelTween) { B.cancelTween(); B.cancelTween = null; }
    drag.abort();
    machine.classList.remove('dragging');
    pads.innerHTML = '';
    if (B.els.zones) { B.els.zones.remove(); B.els.zones = null; }
    const avail = Math.min(940, (host.clientWidth || 700) - 26);
    B.W = Math.max(34, Math.min(66, Math.floor(avail / NCOLS)));
    B.tileW = B.W - 8;
    B.laneH = Math.round(B.W * 1.5);
    board.style.width = (B.W * NCOLS) + 'px';
    lane.style.height = B.laneH + 'px';
    heads.innerHTML = ''; colbg.innerHTML = '';
    COLS.forEach((c) => {
      const h = el('div', 'som-head' + (c.units ? ' units' : '') + (c.fog ? ' fog' : ''));
      h.style.width = B.W + 'px';
      h.append(el('div', 'hb', c.big), el('div', 'hs', c.sub));
      heads.append(h);
      const cb = el('div', 'cb' + (c.units ? ' units' : '') + (c.fog === 'l' ? ' fog-l' : c.fog === 'r' ? ' fog-r' : ''));
      cb.style.width = B.W + 'px';
      colbg.append(cb);
    });
    const fenceX = colIdx(0) * B.W + B.W;
    fence.style.left = (fenceX - 2) + 'px';
    // roller sits at the BASELINE between the digits, like the dot in "3.5",
    // small enough never to cover the digit either side (Damien fix, 9 Jul)
    const rs = Math.round(B.W * 0.56);
    const svg = roller.querySelector('svg');
    svg.setAttribute('width', rs); svg.setAttribute('height', rs);
    roller.style.left = fenceX + 'px';
    roller.style.top = (B.laneH - Math.round(B.W * 0.32)) + 'px';
    hat.style.left = fenceX + 'px';
    hat.style.top = '10px';
    rail.innerHTML = '';
    B.tiles = model.digits.map((d, i) => {
      const t = el('div', 'som-tile', String(d));
      t.style.width = B.tileW + 'px';
      t.style.height = Math.round(B.W * 1.16) + 'px';
      t.style.fontSize = Math.round(B.W * 0.62) + 'px';
      t.style.left = (colIdx(model.basePlace - i) * B.W + 4) + 'px';
      rail.append(t);
      return t;
    });
    const offMax = 5 - model.basePlace;
    const offMin = -5 - (model.basePlace - (model.digits.length - 1));
    B.minX = -offMax * B.W;
    B.maxX = -offMin * B.W;
    B.padTiles = new Map();
    B.targetOffset = B.offset;
    B.setStripX(-B.offset * B.W, true);
    B.applySnapState(layoutFor(model, B.offset), true);
    if (opts.mystery && !B.revealed) buildZones();
  };

  B.setStripX = function setStripX(x, silent) {
    B.stripX = x;
    rail.style.transform = 'translateX(' + x + 'px)';
    spin.setAttribute('transform', 'rotate(' + ((x / (B.W * 0.28)) * 57.2958).toFixed(1) + ')');
    const prov = Math.round(-x / B.W);
    if (prov !== B.lastProv) {
      if (!silent) {
        const step = prov > B.lastProv ? 1 : -1;
        for (let p = B.lastProv + step; step > 0 ? p <= prov : p >= prov; p += step) {
          if (step > 0) sfx.tick(p); else sfx.tock(-p);
        }
      }
      B.lastProv = prov;
      if (opts.onChip) opts.onChip(prov);
    }
  };
  const clampX = (x) => Math.max(B.minX, Math.min(B.maxX, x));
  const rubber = (x) => (x > B.maxX ? B.maxX + (x - B.maxX) * 0.22 : x < B.minX ? B.minX + (x - B.minX) * 0.22 : x);

  B.settleAt = function settleAt(targetX) {
    B.targetOffset = Math.round(-targetX / B.W);
    if (B.cancelTween) B.cancelTween();
    B.settling = true;
    B.cancelTween = tween((v) => B.setStripX(v), B.stripX, targetX, 300, () => {
      B.settling = false;
      B.cancelTween = null;
      B.offset = Math.round(-B.stripX / B.W);
      sfx.settle();
      const lay = layoutFor(model, B.offset);
      B.applySnapState(lay, false);
      if (opts.onSettle) opts.onSettle(lay);
    });
  };

  const drag = makeDrag(hit, {
    enabled: () => !B.disabled && (B.revealed || !opts.mystery),
    onStart() {
      if (B.cancelTween) { B.cancelTween(); B.cancelTween = null; B.settling = false; }
      B.dragBase = B.stripX;
      machine.classList.add('dragging');
      if (opts.onFirstDrag && !B.firstDragDone) { B.firstDragDone = true; opts.onFirstDrag(); }
    },
    onMove(dx) { B.setStripX(rubber(B.dragBase + dx)); },
    onEnd() {
      machine.classList.remove('dragging');
      B.settleAt(clampX(Math.round(B.stripX / B.W) * B.W));
    },
  });

  B.nudge = function nudge(dir) {
    if (B.disabled || drag.dragging() || (opts.mystery && !B.revealed)) return;
    const base = B.settling ? B.targetOffset : B.offset;
    const target = clampX(-(base + dir) * B.W);
    if (target === -base * B.W) { sfx.nudge(); return; }
    if (opts.onFirstDrag && !B.firstDragDone) { B.firstDragDone = true; opts.onFirstDrag(); }
    B.settleAt(target);
  };
  B.reset = function reset() {
    if (drag.dragging()) return;
    B.resetting = true;
    B.settleAt(0);
  };
  B.busy = () => B.settling || drag.dragging();

  B.applySnapState = function applySnapState(lay, instant) {
    const want = new Set(lay.pads);
    const added = []; const removed = [];
    for (const p of want) if (!B.padTiles.has(p)) added.push(p);
    for (const p of B.padTiles.keys()) if (!want.has(p)) removed.push(p);
    removed.forEach((p) => {
      const t = B.padTiles.get(p); B.padTiles.delete(p);
      if (instant) { t.remove(); return; }
      t.classList.add('bowing');
      sfx.pop();
      setTimeout(() => t.remove(), 600);
    });
    added.sort((a, b) => b - a).forEach((p, i) => {
      const t = el('div', 'som-tile pad', '0');
      t.style.width = B.tileW + 'px';
      t.style.height = Math.round(B.W * 1.16) + 'px';
      t.style.fontSize = Math.round(B.W * 0.62) + 'px';
      t.style.left = (colIdx(p) * B.W + 4) + 'px';
      B.padTiles.set(p, t);
      pads.append(t);
      if (!instant) {
        t.classList.add('dropping');
        t.style.animationDelay = (i * 0.16) + 's';
        setTimeout(() => { if (B.alive) sfx.drop(); }, i * 160 + 60);
        setTimeout(() => t.classList.remove('dropping'), i * 160 + 700);
      }
    });
    B.tiles.forEach((t, i) => {
      const g = lay.ghost.has(i);
      if (g && !t.classList.contains('offduty')) {
        t.classList.add('offduty');
        if (!t.querySelector('.zzz')) t.append(el('span', 'zzz', '💤'));
      } else if (!g && t.classList.contains('offduty')) {
        t.classList.remove('offduty');
        const z = t.querySelector('.zzz'); if (z) z.remove();
      }
    });
    B.lastDiff = { added, removed };
  };

  function buildZones() {
    const zl = el('div', 'som-zones');
    lane.append(zl);
    B.els.zones = zl;
    const n = model.digits.length;
    const startCol = colIdx(model.basePlace);
    for (let k = 0; k <= n; k += 1) {
      const z = el('button', 'som-zone');
      z.style.left = ((startCol + k) * B.W) + 'px';
      z.style.animationDelay = (k * 0.22) + 's';
      const correct = k === n;
      z.addEventListener('click', () => {
        if (B.revealed) return;
        if (correct) B.reveal();
        else {
          z.classList.remove('wrongzone'); void z.offsetWidth; z.classList.add('wrongzone');
          sfx.nudge();
          if (opts.onTapZone) opts.onTapZone(false);
        }
      });
      zl.append(z);
    }
  }
  B.reveal = function reveal() {
    B.revealed = true;
    sfx.sparkle();
    sparkleBurst(lane, colIdx(0) * B.W + B.W, B.laneH / 2);
    if (B.els.zones) { B.els.zones.remove(); B.els.zones = null; }
    setTimeout(() => machine.classList.remove('mystery'), 220);
    if (opts.onTapZone) opts.onTapZone(true);
  };

  B.destroy = function destroy() {
    B.alive = false;
    if (B.cancelTween) B.cancelTween();
    drag.destroy();
    machine.remove();
  };

  B.layout();
  return B;
}

/* ---------- the anim card ---------- */
export default {
  id: 'decimals-x10',
  title: 'THE SLIDE-O-MATIC 1000',

  mount(host, ctx) {
    let alive = true;
    let board = null;
    let mi = 0; // current mission index; MISSIONS.length === sandbox
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'som-q');
    const qsub = el('div', 'som-qsub');
    const boardHost = el('div');
    const dash = el('div', 'som-dash');
    const readout = el('div', 'som-readout', '<div class="rl">THE MACHINE READS</div><div class="rn"></div>');
    const counter = el('div', 'som-counter');
    dash.append(readout, counter);
    const winBox = el('div');
    const controls = el('div', 'anim-controls som-lockrow');
    const nl = el('button', 'anim-nudge', '⬅');
    const lock = el('button', 'btn btn-gold', 'LOCK IT IN 💨');
    const nr = el('button', 'anim-nudge', '➡');
    const reset = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(nl, lock, nr, reset);
    stage.append(chiprow, q, qsub, boardHost, dash, winBox, controls);
    host.append(stage);

    const ruleCard = el('div', 'goldcard', RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;';
    host.append(ruleCard);

    let model = null;
    let mission = null;
    let attempts = 0;
    let shown = null;

    function setReadout(lay) {
      readout.querySelector('.rn').innerHTML = lay.chars.map((c) => `<span class="${c.cls}">${c.ch}</span>`).join('') || '0';
    }
    function setCounter(prov) {
      if (prov === 0) { counter.innerHTML = 'no slides yet — <b>the point never moves!</b>'; return; }
      const n = Math.abs(prov); const s = n === 1 ? '' : 's';
      counter.innerHTML = `<b>${n}</b> slide${s} <b>${prov > 0 ? 'LEFT' : 'RIGHT'}</b> — that's <b>${prov > 0 ? '× ' : '÷ '}${fmtFactor(n)}</b>`;
    }
    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), `${m.start} ${m.op} ${m.factor}`);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
      const fp = el('button', 'anim-mchip' + (mi === MISSIONS.length ? ' active' : ''), 'FREE PLAY 🕹️');
      fp.addEventListener('click', () => { sfx.ui(); start(MISSIONS.length); });
      chiprow.append(fp);
    }

    function start(i) {
      mi = i;
      attempts = 0;
      shown = new Set();
      winBox.innerHTML = '';
      if (board) { board.destroy(); board = null; }
      paintChips();
      const sandbox = i === MISSIONS.length;
      mission = sandbox ? null : MISSIONS[i];
      lock.style.display = sandbox ? 'none' : '';
      if (sandbox) {
        q.innerHTML = 'Free play — pick a number:';
        const picker = el('div', 'anim-chiprow');
        SANDBOX_NUMBERS.forEach((s2, k) => {
          const c = el('button', 'anim-mchip' + (k === 0 ? ' active' : ''), s2);
          c.addEventListener('click', () => { picker.querySelectorAll('.anim-mchip').forEach((x) => x.classList.remove('active')); c.classList.add('active'); sfx.ui(); buildBoard(s2, false); });
          picker.append(c);
        });
        qsub.innerHTML = '';
        qsub.append(picker);
        buildBoard(SANDBOX_NUMBERS[0], false);
        return;
      }
      q.innerHTML = `${mission.start} <span class="op">${mission.op} ${mission.factor}</span> = ?`;
      qsub.textContent = mission.invisible
        ? 'Hold on… no decimal point! Tap the spot where Pointy is hiding.'
        : 'Slide the digits past Pointy, then LOCK IT IN.';
      buildBoard(mission.start, !!mission.invisible);
    }

    function buildBoard(numStr, mystery) {
      if (board) { board.destroy(); board = null; }
      model = parseNumber(numStr);
      board = makeBoard(boardHost, model, {
        mystery,
        onChip: setCounter,
        onSettle(lay) {
          if (!alive) return;
          const silent = board.resetting; board.resetting = false;
          setReadout(lay); setCounter(lay.off);
          const { added, removed } = board.lastDiff;
          if (mission && lay.off === mission.target && mission.pop && !shown.has(mission.pop.key)) {
            // mission popups quote exact numbers — only ever at the matching state
            shown.add(mission.pop.key);
            const delay = added.length ? added.length * 160 + 620 : 200;
            later(() => bubble(stage, { title: mission.pop.title, text: mission.pop.text, img: POINTY_IMG }), delay);
          } else if (!silent) {
            if (added.length && !(mission && mission.pop)) toast(stage, '🪑 a seat-warmer zero drops in — the Units throne is never left empty!');
            if (removed.length) toast(stage, '🙇 the seat-warmer bows out — job done!');
            if (lay.ghost.size && !(mission && mission.pop && mission.pop.key === 'off')) toast(stage, '😴 an end zero after the point adds nothing — it clocks off');
          }
        },
        onTapZone(found) {
          if (!alive) return;
          if (!found) { toast(stage, 'Not there — Pointy hides where the whole number ENDS!'); return; }
          later(() => {
            bubble(stage, {
              title: 'FOUND HIM! 🎩',
              text: `Pointy was there <b>ALL ALONG!</b> Every whole number keeps an <b>invisible decimal point just after its Units digit</b> — ${mission.start} is really <b>${mission.start}•</b> — he only turns visible when the digits need to slide past him!`,
              img: POINTY_IMG,
            }).then(() => { if (alive) qsub.textContent = 'Now slide the digits past Pointy, then LOCK IT IN.'; });
          }, 650);
        },
      });
      setReadout(layoutFor(model, 0));
      setCounter(0);
    }

    nl.addEventListener('click', () => board && board.nudge(1));
    nr.addEventListener('click', () => board && board.nudge(-1));
    reset.addEventListener('click', () => { sfx.ui(); board && board.reset(); });

    lock.addEventListener('click', () => {
      if (!board || board.busy() || !mission) return;
      sfx.ui();
      const lay = layoutFor(model, board.offset);
      if (lay.fog) {
        sfx.nudge();
        bubble(stage, { title: 'INTO THE FOG! 🌫️', text: 'You slid so far a digit tumbled into the fog at the edge of the machine! <b>Slide back towards Pointy</b> and try again.', img: POINTY_IMG });
        return;
      }
      if (lay.off === mission.target) { win(lay); return; }
      attempts += 1;
      sfx.nudge();
      let text;
      const need = Math.abs(mission.target);
      if (lay.off === 0) text = 'The machine\'s waiting! Press your finger on the digits and <b>slide them past Pointy</b>.';
      else if (Math.sign(lay.off) !== Math.sign(mission.target)) {
        text = mission.op === '×'
          ? 'The digits slid RIGHT, and that makes numbers <b>smaller</b>. Multiplying makes numbers <b>BIGGER</b> — slide <b>LEFT</b> past Pointy!'
          : 'The digits slid LEFT, and that makes numbers <b>bigger</b>. Dividing makes numbers <b>SMALLER</b> — slide <b>RIGHT</b> past Pointy!';
      } else {
        const got = Math.abs(lay.off);
        text = `Right direction! But you slid <b>${got}</b> throne${got === 1 ? '' : 's'} — ${got > need ? 'that\'s too far.' : 'not quite far enough.'} <b>Count the zeros in ${mission.factor}</b> — one slide per zero!`;
      }
      if (attempts >= 2) text += `<br><br>🎩 Psst: <b>${mission.op} ${mission.factor}</b> means exactly <b>${need} slide${need === 1 ? '' : 's'} ${mission.target > 0 ? 'LEFT' : 'RIGHT'}</b>. You've got this!`;
      bubble(stage, { title: 'KEEP SLIDING! 💪', text, img: POINTY_IMG });
    });

    function win(lay) {
      doneSet.add(mission.id);
      sfx.win();
      party(stage);
      paintChips();
      winBox.innerHTML = '';
      const w = el('div', 'som-win',
        `<div class="wp">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]} &nbsp; ${mission.start} ${mission.op} ${mission.factor} = <b>${lay.text}</b></div>`
        + `<div class="wk">${mission.worked}</div>`);
      winBox.append(w);
      if (doneSet.size === MISSIONS.length) ctx.complete();
      const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
      if (nextIdx !== -1) {
        const nb = el('button', 'btn btn-gold', 'NEXT ONE ➡');
        nb.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
        nb.addEventListener('click', () => { sfx.ui(); start(nextIdx); });
        w.append(nb);
      } else {
        const fp = el('button', 'btn btn-gold', 'FREE PLAY 🕹️');
        fp.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
        fp.addEventListener('click', () => { sfx.ui(); start(MISSIONS.length); });
        w.append(fp);
        ctx.complete();
      }
    }

    const onResize = () => { if (board) board.layout(); };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    start(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      if (board) board.destroy();
      stage.remove();
      ruleCard.remove();
    };
  },
};
