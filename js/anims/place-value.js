// FART QUEST — js/anims/place-value.js
// THE THRONE WEIGH-IN — interactive place-value machine for the place-value
// Scout Report (Number Swamp). One digit tile, five thrones (TTh…U); drag the
// digit onto a throne and a brass value-meter rolls to digit×throne while
// gold seat-warmer zeros fill every seat below it.

import { el, sfx, tween, makeDrag, bubble, party, injectCss } from './_kit.js';

const BARON_IMG = 'assets/monsters/baron-bumdigit.png';
const RULE = 'Read the digit, then ask: WHICH THRONE is it sitting on? Digit × throne = its value.';

/* ---------- pure place-value engine (kept DOM-free — unit-tested separately) ---------- */
const THRONES = [
  { place: 4, big: 'TTh', sub: 'ten-thousands' },
  { place: 3, big: 'Th', sub: 'thousands' },
  { place: 2, big: 'H', sub: 'hundreds' },
  { place: 1, big: 'T', sub: 'tens' },
  { place: 0, big: 'U', sub: 'units' },
];
const NCOLS = THRONES.length;

function valueOf(digit, place) { return digit * Math.pow(10, place); }
function fmtNum(n) { return Math.round(n).toLocaleString('en-GB'); }
function thronePhrase(place) { const t = THRONES.find((x) => x.place === place); return `${t.big} (${t.sub})`; }
function placeMult(place) { return Math.pow(10, place).toLocaleString('en-GB'); }
function digitsOf(v) { return String(Math.max(0, Math.round(Math.abs(v)))).length; }

const MISSIONS = [
  {
    id: 'a', tiles: [7], targetValue: 700,
    qText: 'Make the 7 worth <b>seven hundred</b>.',
    qsub: 'Drag the 7 onto the throne that makes it worth 700.',
    check: (place, value) => place === 2,
    tail: '',
  },
  {
    id: 'b', tiles: [4], targetValue: 4000,
    qText: 'Make the 4 worth <b>4,000</b>.',
    qsub: 'Drag the 4 onto the throne that makes it worth 4,000.',
    check: (place) => place === 3,
    tail: '',
  },
  {
    id: 'c', tiles: [3], targetValue: 900,
    qText: 'Put the 3 where it <b>beats 900</b>.',
    qsub: 'Find a throne that makes 3 worth more than 900.',
    check: (place, value) => value > 900,
    tail: ' — that beats 900',
  },
  {
    id: 'd', tiles: [5, 2], targetValue: 400,
    qText: 'Build a number <b>worth more than 400</b>.',
    qsub: 'Two tiles are waiting — drag one onto a throne.',
    check: (place, value) => value > 400,
    tail: ' — that beats 400',
  },
];
const SANDBOX_DIGITS = [2, 5, 6, 8, 9];
const WIN_PHRASES = ['THRONE CLAIMED! 👑', 'ROYAL DECREE!', 'THE PALACE APPROVES!', 'BARON BUMDIGIT BOWS!'];

function workedText(digit, place, tail) {
  return `${digit} on the ${thronePhrase(place)} throne → ${digit} × ${placeMult(place)} = <b>${fmtNum(valueOf(digit, place))}</b>${tail}.`;
}
function failText(mission, value) {
  if (value <= 0) return 'Drag the digit onto a throne first!';
  if (mission.id === 'c' || mission.id === 'd') {
    const extra = mission.id === 'd' ? 'the other tile, or ' : '';
    return `The meter reads <b>${fmtNum(value)}</b> — that doesn't beat ${mission.targetValue} yet. Try ${extra}a bigger throne!`;
  }
  const dir = value < mission.targetValue ? 'bigger' : 'smaller';
  return `The meter reads <b>${fmtNum(value)}</b> — try a ${dir} throne!`;
}

/* ---------- styles ---------- */
const CSS = `
.pvw-q { text-align:center; font-weight:700; font-size:clamp(18px,3.2vw,26px); margin-bottom:2px; }
.pvw-qsub { text-align:center; font-size:12.5px; color:#6b5744; font-weight:500; margin-bottom:10px; }
.pvw-playfield { position:relative; margin:12px auto 0; touch-action:none; }
.pvw-throne {
  position:absolute; bottom:0; display:flex; flex-direction:column; align-items:center;
  justify-content:flex-start; border-radius:16px 16px 9px 9px; box-sizing:border-box;
  background:linear-gradient(180deg, rgba(155,89,208,.14), rgba(155,89,208,.04));
  border:2.5px solid rgba(91,51,135,.28);
  transition:transform .4s var(--spring), box-shadow .4s, background .4s, border-color .4s;
}
.pvw-throne .pt-b { font-weight:700; font-size:15px; color:var(--stink); line-height:1.1; margin-top:8px; }
.pvw-throne .pt-s { font-size:8.5px; color:#8a76a0; font-weight:600; white-space:nowrap; }
.pvw-throne.occupied {
  transform:scale(1.1); border-color:var(--gold-deep);
  background:linear-gradient(180deg, rgba(244,197,66,.26), rgba(244,197,66,.06));
  box-shadow:0 0 0 4px rgba(244,197,66,.3), 0 8px 16px rgba(91,51,135,.25);
}
.pvw-throne.occupied .pt-b { color:var(--gold-deep); }
.pvw-crown { position:absolute; font-size:22px; pointer-events:none; animation:pvwCrownPop .4s var(--spring) both; z-index:9; }
@keyframes pvwCrownPop { from { transform:translate(-50%,-60%) scale(.3); opacity:0; } to { transform:translate(-50%,-100%) scale(1); opacity:1; } }
.pvw-tile {
  position:absolute; display:flex; align-items:center; justify-content:center;
  background:#fff; border:3px solid var(--ink); border-radius:14px; color:var(--ink);
  font-weight:700; box-shadow:0 4px 0 rgba(51,38,29,.3); cursor:grab; touch-action:none;
  will-change:left,top; z-index:6;
}
.pvw-tile.dragging { cursor:grabbing; z-index:20; }
.pvw-tile.zero { background:#FFF3D0; border-color:var(--gold-deep); color:var(--gold-deep); box-shadow:0 4px 0 rgba(217,162,27,.4); pointer-events:none; z-index:5; }
.pvw-tile.zero.dropping { animation:pvwDropIn .6s cubic-bezier(.22,1.2,.36,1) both; }
@keyframes pvwDropIn {
  0% { transform:translateY(-160px) scale(.7); opacity:0; }
  55% { transform:translateY(0) scale(1); opacity:1; }
  72% { transform:translateY(-12px) scale(1.06,.92); }
  100% { transform:translateY(0) scale(1); }
}
.pvw-tile.zero.bowing { animation:pvwBowOut .5s ease-in both; }
@keyframes pvwBowOut {
  0% { transform:translateY(0) rotate(0); }
  40% { transform:translateY(-16px) rotate(-14deg); }
  100% { transform:translate(-34px,-64px) rotate(-40deg); opacity:0; }
}
.pvw-dash { display:flex; align-items:center; justify-content:center; gap:12px; flex-wrap:wrap; margin-top:14px; }
.pvw-meter {
  background:#241d15; border-radius:12px; padding:6px 18px; min-width:170px; text-align:center;
  box-shadow:inset 0 3px 10px rgba(0,0,0,.6); border:3px solid #4a3b28;
}
.pvw-meter .ml { font-size:9px; letter-spacing:.2em; color:#8f7a5e; font-weight:700; }
.pvw-meter .mv { font-size:clamp(22px,3.4vw,30px); font-weight:700; color:var(--stink-lime); letter-spacing:.04em; line-height:1.1; text-shadow:0 0 12px rgba(199,244,100,.35); }
.pvw-eq { min-width:180px; text-align:center; font-weight:700; font-size:clamp(13px,2vw,15px); color:var(--gold-deep); }
.pvw-rule {
  margin-top:12px; font-size:13.5px; line-height:1.35; font-weight:700; color:#5a4408;
  background:linear-gradient(180deg,#FFF3CE,#FBE29A); border:3px solid var(--gold-deep);
  border-radius:14px; padding:10px 14px;
}
.pvw-win {
  margin-top:12px; text-align:center; background:linear-gradient(180deg,#E9FBEF,#D3F3DF);
  border:3px solid var(--correct); border-radius:14px; padding:10px 14px;
  animation:pvwWinIn .34s var(--spring) both;
}
@keyframes pvwWinIn { from { transform:scale(.85) translateY(14px); opacity:0; } to { transform:scale(1) translateY(0); opacity:1; } }
.pvw-win .wp { font-weight:700; color:#1d8f4e; font-size:16px; }
.pvw-win .wk { font-size:13.5px; color:#4d6b58; font-weight:500; margin-top:2px; }
.pvw-win .wa { font-size:12.5px; color:#3f7a58; font-weight:700; margin-top:6px; font-style:italic; }
`;

/* ---------- the anim card ---------- */
export default {
  id: 'place-value',
  title: 'THE THRONE WEIGH-IN',

  mount(host, ctx) {
    injectCss('place-value', CSS);
    let alive = true;
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'pvw-q');
    const qsub = el('div', 'pvw-qsub');
    const playfield = el('div', 'pvw-playfield');
    const dash = el('div', 'pvw-dash');
    const meterBox = el('div', 'pvw-meter', '<div class="ml">THE THRONE METER READS</div><div class="mv">—</div>');
    const eqLine = el('div', 'pvw-eq');
    dash.append(meterBox, eqLine);
    const winBox = el('div');
    const controls = el('div', 'anim-controls');
    const nl = el('button', 'anim-nudge', '⬅');
    const lock = el('button', 'btn btn-gold', 'LOCK IT IN 💨');
    const nr = el('button', 'anim-nudge', '➡');
    const resetBtn = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(nl, lock, nr, resetBtn);
    stage.append(chiprow, q, qsub, playfield, dash, winBox, controls);
    host.append(stage);

    const ruleCard = el('div', 'pvw-rule', RULE);
    host.append(ruleCard);

    // ---- geometry ----
    let colW = 100; let tileSize = 72; let trayH = 90; let throneH = 130; let pfW = 500;
    const throneEls = THRONES.map((t) => {
      const th = el('div', 'pvw-throne');
      th.append(el('div', 'pt-b', t.big), el('div', 'pt-s', t.sub));
      playfield.append(th);
      return th;
    });
    let crownEl = null;

    function colX(c) { return c * colW + colW / 2; }
    function throneSeatPos(place) {
      const c = THRONES.findIndex((t) => t.place === place);
      return { x: colX(c), y: trayH + throneH - tileSize / 2 - 10 };
    }
    function trayPos(idx, total) {
      if (total <= 1) return { x: pfW / 2, y: trayH / 2 };
      const spacing = Math.min(colW * 1.15, pfW / (total + 1));
      return { x: pfW / 2 + (idx - (total - 1) / 2) * spacing, y: trayH / 2 };
    }
    function sizeTileEl(elx) {
      elx.style.width = tileSize + 'px';
      elx.style.height = tileSize + 'px';
      elx.style.fontSize = Math.round(tileSize * 0.5) + 'px';
    }
    function paintTile(t) {
      t.el.style.left = Math.round(t.x - tileSize / 2) + 'px';
      t.el.style.top = Math.round(t.y - tileSize / 2) + 'px';
    }

    // ---- live state ----
    let tiles = [];        // current draggable tile states this mission
    let warmers = new Map(); // column index -> zero tile el
    let occupied = null;   // { tile, place }
    let mi = 0;
    let mission = null;
    let attempts = 0;
    let anyDragging = false;
    let meterTween = null;
    let meterVal = 0;
    let meterDigits = 0;
    const doneSet = new Set();
    let seenSeatWarmer = false;
    let masteryShown = false;
    let picker = null;

    function busy() { return anyDragging || !!meterTween; }

    function paintMeter(v) {
      const r = Math.round(v);
      meterBox.querySelector('.mv').textContent = r <= 0 ? '—' : fmtNum(r);
    }
    function rollMeter(newValue, digit, place) {
      if (meterTween) { meterTween(); meterTween = null; }
      const from = meterVal;
      meterVal = newValue;
      meterTween = tween((v) => {
        paintMeter(v);
        const dc = digitsOf(v);
        if (dc !== meterDigits) { sfx.tick(dc); meterDigits = dc; }
      }, from, newValue, 480, () => {
        meterTween = null;
        paintMeter(newValue);
        sfx.settle();
        eqLine.innerHTML = (digit != null && place != null && newValue > 0)
          ? `${digit} × ${placeMult(place)} = ${fmtNum(newValue)}` : '';
        if (place != null && place > 0 && !seenSeatWarmer) {
          seenSeatWarmer = true;
          later(() => bubble(stage, {
            title: 'THE ROYAL SEAT-WARMER 👑',
            text: 'Zero has the most important bottom in the palace! He hops onto every empty throne between your digit and the Units throne, so nobody slides into the wrong seat. Take him away and the number collapses — completely the wrong size.',
            img: BARON_IMG,
          }), 350);
        }
      });
    }

    function updateThroneVisuals(place) {
      throneEls.forEach((thEl, c) => thEl.classList.toggle('occupied', place != null && THRONES[c].place === place));
      if (crownEl) { crownEl.remove(); crownEl = null; }
      if (place != null) {
        const c = THRONES.findIndex((t) => t.place === place);
        crownEl = el('span', 'pvw-crown', '👑');
        crownEl.style.left = colX(c) + 'px';
        crownEl.style.top = (trayH + 6) + 'px';
        playfield.append(crownEl);
      }
    }

    function updateSeatWarmers(newPlace) {
      const want = new Set();
      if (newPlace != null) THRONES.forEach((t, c) => { if (t.place < newPlace) want.add(c); });
      const removed = [];
      for (const c of warmers.keys()) if (!want.has(c)) removed.push(c);
      removed.forEach((c) => {
        const w = warmers.get(c); warmers.delete(c);
        w.classList.add('bowing'); sfx.pop();
        later(() => w.remove(), 520);
      });
      const added = [];
      for (const c of want) if (!warmers.has(c)) added.push(c);
      added.sort((a, b) => a - b).forEach((c, i) => {
        const w = el('div', 'pvw-tile zero', '0');
        sizeTileEl(w);
        const pos = throneSeatPos(THRONES[c].place);
        w.style.left = Math.round(pos.x - tileSize / 2) + 'px';
        w.style.top = Math.round(pos.y - tileSize / 2) + 'px';
        playfield.append(w);
        warmers.set(c, w);
        w.classList.add('dropping');
        w.style.animationDelay = (i * 0.12) + 's';
        later(() => { if (alive) sfx.drop(); }, i * 120 + 80);
        later(() => w.classList.remove('dropping'), i * 120 + 650);
      });
    }

    function animateTileTo(t, pos, instant) {
      if (t.cancelTween) { t.cancelTween(); t.cancelTween = null; }
      const fromX = t.x; const fromY = t.y;
      if (instant) { t.x = pos.x; t.y = pos.y; paintTile(t); return; }
      t.cancelTween = tween((v) => {
        t.x = fromX + (pos.x - fromX) * v;
        t.y = fromY + (pos.y - fromY) * v;
        paintTile(t);
      }, 0, 1, 300, () => { t.cancelTween = null; });
    }

    function placeTile(t, place) {
      if (occupied && occupied.tile !== t) {
        const prev = occupied.tile;
        prev.place = null;
        animateTileTo(prev, trayPos(tiles.indexOf(prev), tiles.length));
      }
      t.place = place;
      occupied = { tile: t, place };
      animateTileTo(t, throneSeatPos(place));
      updateSeatWarmers(place);
      updateThroneVisuals(place);
      rollMeter(valueOf(t.value, place), t.value, place);
    }

    function returnToTray(t) {
      const wasOccupied = occupied && occupied.tile === t;
      t.place = null;
      animateTileTo(t, trayPos(tiles.indexOf(t), tiles.length));
      if (wasOccupied) {
        occupied = null;
        updateSeatWarmers(null);
        updateThroneVisuals(null);
        rollMeter(0, null, null);
      }
    }

    function makeTile(value, idx, total) {
      const tileEl = el('div', 'pvw-tile', String(value));
      sizeTileEl(tileEl);
      const home = trayPos(idx, total);
      const t = { value, el: tileEl, x: home.x, y: home.y, place: null, cancelTween: null };
      paintTile(t);
      playfield.append(tileEl);
      const drag = makeDrag(tileEl, {
        enabled: () => alive,
        onStart() {
          if (t.cancelTween) { t.cancelTween(); t.cancelTween = null; }
          anyDragging = true;
          t.dragBase = { x: t.x, y: t.y };
          tileEl.classList.add('dragging');
        },
        onMove(dx, dy) {
          t.x = t.dragBase.x + dx;
          t.y = t.dragBase.y + dy;
          paintTile(t);
        },
        onEnd() {
          anyDragging = false;
          tileEl.classList.remove('dragging');
          if (t.y > trayH) {
            let c = Math.floor(t.x / colW);
            c = Math.max(0, Math.min(NCOLS - 1, c));
            placeTile(t, THRONES[c].place);
          } else {
            returnToTray(t);
          }
        },
      });
      t.drag = drag;
      return t;
    }

    function clearBoard() {
      tiles.forEach((t) => { if (t.cancelTween) t.cancelTween(); t.drag.destroy(); t.el.remove(); });
      tiles = [];
      warmers.forEach((w) => w.remove());
      warmers = new Map();
      occupied = null;
      updateThroneVisuals(null);
      rollMeter(0, null, null);
      if (meterTween) { meterTween(); meterTween = null; }
      paintMeter(0);
      eqLine.innerHTML = '';
    }

    function buildTiles(values) {
      clearBoard();
      tiles = values.map((v, i) => makeTile(v, i, values.length));
    }

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), m.tiles.join('+'));
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
      winBox.innerHTML = '';
      paintChips();
      const sandbox = i === MISSIONS.length;
      mission = sandbox ? null : MISSIONS[i];
      lock.style.display = sandbox ? 'none' : '';
      if (sandbox) {
        q.textContent = 'Free play — choose a digit:';
        qsub.innerHTML = '';
        picker = el('div', 'anim-chiprow');
        SANDBOX_DIGITS.forEach((d, k) => {
          const c = el('button', 'anim-mchip' + (k === 0 ? ' active' : ''), String(d));
          c.addEventListener('click', () => {
            picker.querySelectorAll('.anim-mchip').forEach((x) => x.classList.remove('active'));
            c.classList.add('active'); sfx.ui(); buildTiles([d]);
          });
          picker.append(c);
        });
        qsub.append(picker);
        buildTiles([SANDBOX_DIGITS[0]]);
        return;
      }
      picker = null;
      q.innerHTML = mission.qText;
      qsub.textContent = mission.qsub;
      buildTiles(mission.tiles);
    }

    nl.addEventListener('click', () => {
      if (!occupied || busy()) { sfx.nudge(); return; }
      const np = occupied.place - 1;
      if (np < 0) { sfx.nudge(); return; }
      sfx.ui(); placeTile(occupied.tile, np);
    });
    nr.addEventListener('click', () => {
      if (!occupied || busy()) { sfx.nudge(); return; }
      const np = occupied.place + 1;
      if (np > 4) { sfx.nudge(); return; }
      sfx.ui(); placeTile(occupied.tile, np);
    });
    resetBtn.addEventListener('click', () => {
      sfx.ui();
      if (mission) buildTiles(mission.tiles);
      else if (tiles[0]) buildTiles([tiles[0].value]);
    });

    lock.addEventListener('click', () => {
      if (!mission || busy()) return;
      sfx.ui();
      if (!occupied) { bubble(stage, { title: 'EMPTY THRONE!', text: failText(mission, 0), img: BARON_IMG }); return; }
      const { tile: t, place } = occupied;
      const value = valueOf(t.value, place);
      if (mission.check(place, value)) { win(t, place, value); return; }
      attempts += 1;
      sfx.nudge();
      let text = failText(mission, value);
      if (attempts >= 2) text += `<br><br>👑 Psst: ${RULE}`;
      bubble(stage, { title: 'KEEP TRYING! 💪', text, img: BARON_IMG });
    });

    function win(t, place, value) {
      doneSet.add(mission.id);
      sfx.win();
      party(stage);
      paintChips();
      winBox.innerHTML = '';
      const w = el('div', 'pvw-win',
        `<div class="wp">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]}</div>`
        + `<div class="wk">${workedText(t.value, place, mission.tail)}</div>`);
      winBox.append(w);
      const allDone = doneSet.size === MISSIONS.length;
      if (allDone && !masteryShown) {
        masteryShown = true;
        w.append(el('div', 'wa', 'Same digit, wildly different value — the THRONE does the work!'));
        ctx.complete();
      }
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
      }
    }

    function layout() {
      // relayout abandons live drags/tweens first
      tiles.forEach((t) => { if (t.drag) t.drag.abort(); if (t.cancelTween) { t.cancelTween(); t.cancelTween = null; } t.el.classList.remove('dragging'); });
      anyDragging = false;

      const avail = Math.min(760, (host.clientWidth || 700) - 24);
      colW = Math.max(92, Math.min(150, Math.floor(avail / NCOLS)));
      tileSize = Math.max(56, Math.min(96, colW - 26));
      trayH = Math.round(tileSize * 1.35 + 22);
      throneH = Math.round(colW * 1.35);
      pfW = colW * NCOLS;
      const pfH = trayH + throneH;
      playfield.style.width = pfW + 'px';
      playfield.style.height = pfH + 'px';

      throneEls.forEach((thEl, c) => {
        thEl.style.left = (c * colW + 3) + 'px';
        thEl.style.width = (colW - 6) + 'px';
        thEl.style.height = throneH + 'px';
      });

      // reposition tiles instantly at their current logical slot
      tiles.forEach((t) => {
        sizeTileEl(t.el);
        const pos = t.place != null ? throneSeatPos(t.place) : trayPos(tiles.indexOf(t), tiles.length);
        t.x = pos.x; t.y = pos.y;
        paintTile(t);
      });
      warmers.forEach((w, c) => {
        sizeTileEl(w);
        const pos = throneSeatPos(THRONES[c].place);
        w.style.left = Math.round(pos.x - tileSize / 2) + 'px';
        w.style.top = Math.round(pos.y - tileSize / 2) + 'px';
      });
      if (crownEl && occupied) {
        const c = THRONES.findIndex((t) => t.place === occupied.place);
        crownEl.style.left = colX(c) + 'px';
        crownEl.style.top = (trayH + 6) + 'px';
      }
    }

    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(layout, 180); };
    let rsTimer = null;
    window.addEventListener('resize', rsHandler);

    layout();
    start(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      if (meterTween) meterTween();
      tiles.forEach((t) => { if (t.cancelTween) t.cancelTween(); t.drag.destroy(); });
      stage.remove();
      ruleCard.remove();
    };
  },
};
