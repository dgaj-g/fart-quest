// FART QUEST — js/anims/metric-units.js
// CENTI-PEED'S LADDER LIFT — interactive unit-conversion ladder for the
// metric-units Scout Report. Structure and interaction discipline follow
// decimals-x10.js (the house reference implementation) — the place-value
// slide engine below is the same trick wearing a wellington boot.

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const CENTI_IMG = 'assets/monsters/centi-peed.png';
const RULE = 'kilo = ×1000, centi = ÷100, milli = ÷1000. Slide the digits, never the point.';

/* ---------- pure place-value engine (same trick as the Slide-o-Matic — proven, do not "improve") ---------- */
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
  return { off, hi, lo, chars, text };
}
function fmtFactor(k) { return Math.pow(10, k).toLocaleString('en-GB'); }

/* ---------- ladder data ---------- */
const FAMILIES = {
  length: { name: 'LENGTH', emoji: '📏', rungs: [
    { key: 'km', label: 'km', sub: 'kilometres', log: 3 },
    { key: 'm', label: 'm', sub: 'metres', log: 0 },
    { key: 'cm', label: 'cm', sub: 'centimetres', log: -2 },
    { key: 'mm', label: 'mm', sub: 'millimetres', log: -3 },
  ] },
  mass: { name: 'MASS', emoji: '⚖️', rungs: [
    { key: 'kg', label: 'kg', sub: 'kilograms', log: 3 },
    { key: 'g', label: 'g', sub: 'grams', log: 0 },
  ] },
  capacity: { name: 'CAPACITY', emoji: '🧴', rungs: [
    { key: 'l', label: 'l', sub: 'litres', log: 0 },
    { key: 'ml', label: 'ml', sub: 'millilitres', log: -3 },
  ] },
};
function offsetBetween(family, fromIdx, toIdx) {
  const r = FAMILIES[family].rungs;
  return r[fromIdx].log - r[toIdx].log;
}
function factorLabel(family, fromIdx, toIdx) {
  const off = offsetBetween(family, fromIdx, toIdx);
  if (off === 0) return null;
  return { dir: off > 0 ? '×' : '÷', n: fmtFactor(Math.abs(off)) };
}

/* ---------- content ---------- */
const MISSIONS = [
  { id: 'a', kind: 'convert', family: 'mass', fromIdx: 0, toIdx: 1, start: '4',
    q: '4 kg = ? g', instr: 'Drag Centi-Peed DOWN the mass ladder, from kg to g.',
    worked: '4 kg — climbing DOWN from kg to g is one rung, ×1000 → 4000 g.' },
  { id: 'b', kind: 'convert', family: 'length', fromIdx: 2, toIdx: 1, start: '250',
    q: '250 cm = ? m', instr: 'Drag Centi-Peed UP the ladder, from cm to m.',
    worked: '250 cm — climbing UP from cm to m is ÷100 → 2.5 m.' },
  { id: 'c', kind: 'convert', family: 'length', fromIdx: 1, toIdx: 2, start: '3.5',
    q: '3.5 m = ? cm', instr: 'Drag Centi-Peed DOWN the ladder, from m to cm.',
    worked: '3.5 m — climbing DOWN from m to cm is ×100 → 350 cm.' },
  { id: 'd', kind: 'sort', family: 'length', object: { emoji: '🚪', label: 'A door’s height' }, targetIdx: 1,
    q: 'Which rung suits a door’s height?', instr: 'Drag the card onto the SENSIBLE rung.',
    worked: 'A door is about a couple of metres tall — far too big for cm or mm, nowhere near a km. The m rung wins.' },
];
const SANDBOX = {
  length: ['1.2', '640', '75'],
  mass: ['2.5', '900'],
  capacity: ['1.5', '250'],
};
const WIN_PHRASES = ['LADDER LEGEND! 🪜', 'CENTI-PEED IS PROUD! 🥾', 'RUNG BY RUNG, PERFECT!', 'WELLIES OFF TO YOU!'];

/* ---------- geometry ---------- */
const RUNG_H = 74;

export default {
  id: 'metric-units',
  title: "CENTI-PEED'S LADDER LIFT",

  mount(host, ctx) {
    let alive = true;
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    injectCss('metric-units', `
      .cpl-q { text-align: center; font-weight: 700; font-size: clamp(19px, 3.2vw, 27px); margin-bottom: 2px; }
      .cpl-qsub { text-align: center; font-size: 12.5px; color: #6b5744; font-weight: 500; margin-bottom: 10px; min-height: 16px; }
      .cpl-wrap { position: relative; margin: 0 auto; display: flex; justify-content: center; touch-action: none; }
      .cpl-ladder { position: relative; }
      .cpl-rail { position: absolute; left: 50%; top: 0; bottom: 0; width: 10px; transform: translateX(-50%); background: linear-gradient(90deg, #8a6d3b, #b18e4f, #8a6d3b); border-radius: 5px; box-shadow: inset 0 0 0 2px rgba(51,38,29,.25); }
      .cpl-rung { position: absolute; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between; height: 0; }
      .cpl-rlabel { position: absolute; top: -13px; background: var(--card); border: 2.5px solid var(--swamp-mid); color: var(--ink); font-weight: 700; border-radius: 999px; padding: 3px 11px; font-size: 13px; box-shadow: 0 3px 0 rgba(0,0,0,.2); white-space: nowrap; z-index: 2; }
      .cpl-rlabel .rs { display: block; font-size: 8px; font-weight: 500; color: #a08c74; text-align: center; }
      .cpl-rlabel.left { right: calc(50% + 44px); }
      .cpl-rlabel.right { left: calc(50% + 44px); }
      .cpl-rlabel.target { border-color: var(--gold-deep); animation: cplTargetPulse 1.4s ease-in-out infinite; }
      @keyframes cplTargetPulse { 0%,100% { box-shadow: 0 3px 0 rgba(0,0,0,.2), 0 0 0 0 rgba(244,197,66,.4); } 50% { box-shadow: 0 3px 0 rgba(0,0,0,.2), 0 0 0 7px rgba(244,197,66,0); } }
      .cpl-factor { position: absolute; left: 50%; transform: translate(-50%, -50%); z-index: 3; background: #241d15; color: #8f7a5e; font-weight: 700; font-size: 11.5px; border-radius: 8px; padding: 2px 7px; white-space: nowrap; border: 2px solid #4a3b28; transition: color .25s, background .25s, border-color .25s; }
      .cpl-factor.lit { color: var(--stink-lime); background: #33291b; border-color: var(--gold-deep); text-shadow: 0 0 8px rgba(199,244,100,.5); }
      .cpl-platform { position: absolute; left: 50%; transform: translate(-50%, -50%); z-index: 6; cursor: grab; display: flex; align-items: center; gap: 6px; background: var(--card); border: 3px solid var(--ink); border-radius: 16px; padding: 5px 12px 5px 6px; box-shadow: 0 4px 0 rgba(0,0,0,.3); touch-action: none; }
      .cpl-platform:active, .cpl-platform.dragging { cursor: grabbing; }
      .cpl-platform img { width: 34px; height: 34px; object-fit: contain; filter: drop-shadow(0 2px 3px rgba(0,0,0,.3)); pointer-events: none; }
      .cpl-pnum { display: flex; gap: 1px; pointer-events: none; }
      .cpl-pnum span { font-weight: 700; font-size: 19px; color: var(--ink); min-width: 11px; text-align: center; }
      .cpl-pnum span.sw { color: var(--gold-deep); }
      .cpl-pnum span.pt { color: var(--stink); font-weight: 900; }
      .cpl-pnum span.enter { animation: cplTileIn .4s var(--spring) both; }
      @keyframes cplTileIn { 0% { transform: translateY(-14px) scale(.6); opacity: 0; } 60% { transform: translateY(2px) scale(1.15); opacity: 1; } 100% { transform: translateY(0) scale(1); } }
      .cpl-unitchip { background: var(--swamp-mid); color: var(--stink-lime); font-weight: 700; font-size: 12px; border-radius: 999px; padding: 2px 9px; pointer-events: none; }
      .cpl-card { position: absolute; z-index: 6; cursor: grab; touch-action: none; display: flex; flex-direction: column; align-items: center; gap: 2px; background: var(--card); border: 3px solid var(--swamp-mid); border-radius: 14px; padding: 8px 12px; box-shadow: 0 4px 0 rgba(0,0,0,.25); text-align: center; width: 108px; }
      .cpl-card.dragging { cursor: grabbing; }
      .cpl-card .ce { font-size: 30px; }
      .cpl-card .cl { font-size: 11.5px; font-weight: 700; color: var(--ink); line-height: 1.15; }
      .cpl-card.snapped { border-color: var(--correct); animation: animBubbleIn .3s var(--spring) both; }
      .cpl-card.springback { animation: cplSpring .4s ease both; }
      @keyframes cplSpring { 0%,100% { transform: translate(0,0) rotate(0); } 30% { transform: translate(-6px, -4px) rotate(-4deg); } 60% { transform: translate(4px, 2px) rotate(3deg); } }
      .cpl-status { background: var(--swamp-mid); color: var(--parchment); border-radius: 12px; padding: 9px 15px; font-weight: 700; font-size: clamp(13px, 2vw, 15px); box-shadow: 0 3px 0 rgba(0,0,0,.3); text-align: center; margin: 14px auto 0; max-width: 480px; }
      .cpl-status b { color: var(--stink-lime); }
      .cpl-win { margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF); border: 3px solid var(--correct); border-radius: 14px; padding: 10px 14px; animation: animBubbleIn .34s var(--spring) both; }
      .cpl-win .wp { font-weight: 700; color: #1d8f4e; font-size: 16px; }
      .cpl-win .wk { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 2px; }
      .cpl-win .wbtn { margin-top: 8px; padding: 10px 22px; font-size: 15px; }
      .cpl-lockrow .btn { font-size: 16px; padding: 12px 24px; }
      .cpl-famrow { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-bottom: 8px; }
    `);

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'cpl-q');
    const qsub = el('div', 'cpl-qsub');
    const wrap = el('div', 'cpl-wrap');
    const status = el('div', 'cpl-status', 'no rungs climbed yet');
    const winBox = el('div');
    const controls = el('div', 'anim-controls cpl-lockrow');
    const nu = el('button', 'anim-nudge', '⬆');
    const lock = el('button', 'btn btn-gold', 'LOCK IT IN 💨');
    const nd = el('button', 'anim-nudge', '⬇');
    const resetBtn = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(nu, lock, nd, resetBtn);
    stage.append(chiprow, q, qsub, wrap, status, winBox, controls);
    host.append(stage);

    const ruleCard = el('div', 'goldcard', RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;';
    host.append(ruleCard);

    let mi = 0;                 // current mission index; MISSIONS.length === sandbox
    let mission = null;
    let sandbox = false;
    let ladder = null;          // active ladder rig
    let attempts = 0;

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const lbl = m.kind === 'convert' ? `${m.start} ${FAMILIES[m.family].rungs[m.fromIdx].label}→${FAMILIES[m.family].rungs[m.toIdx].label}` : 'sensible unit';
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), lbl);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
      const fp = el('button', 'anim-mchip' + (sandbox ? ' active' : ''), 'FREE PLAY 🕹️');
      fp.addEventListener('click', () => { sfx.ui(); startSandbox(); });
      chiprow.append(fp);
    }

    /* ---------- ladder rig: shared by convert-mode (platform) and sort-mode (card) ---------- */
    function buildLadder(familyKey, opts) {
      wrap.innerHTML = '';
      const family = FAMILIES[familyKey];
      const rungs = family.rungs;
      const N = rungs.length;
      const trackH = RUNG_H * (N - 1);
      const ladderEl = el('div', 'cpl-ladder');
      ladderEl.style.height = trackH + 'px';
      ladderEl.style.width = '210px';
      const rail = el('div', 'cpl-rail');
      ladderEl.append(rail);
      const rungYs = rungs.map((r, i) => i * RUNG_H);
      rungs.forEach((r, i) => {
        const rEl = el('div', 'cpl-rung');
        rEl.style.top = rungYs[i] + 'px';
        const label = el('div', 'cpl-rlabel' + (i % 2 === 0 ? ' left' : ' right') + (opts.targetIdx === i ? ' target' : ''), `${r.label}<span class="rs">${r.sub}</span>`);
        rEl.append(label);
        ladderEl.append(rEl);
      });
      const factorEls = [];
      for (let i = 0; i < N - 1; i += 1) {
        const down = factorLabel(familyKey, i, i + 1);   // travelling i -> i+1 (down the ladder)
        const up = factorLabel(familyKey, i + 1, i);      // travelling i+1 -> i (up the ladder)
        const fEl = el('div', 'cpl-factor', `${down.dir}${down.n}`);
        fEl.dataset.down = `${down.dir}${down.n}`;
        fEl.dataset.up = `${up.dir}${up.n}`;
        fEl.style.top = ((rungYs[i] + rungYs[i + 1]) / 2) + 'px';
        ladderEl.append(fEl);
        factorEls.push(fEl);
      }
      wrap.append(ladderEl);

      function litRange(a, b) {
        const lo = Math.min(a, b); const hi = Math.max(a, b);
        const goingDown = b >= a; // travelling FROM a TO b
        factorEls.forEach((f, i) => {
          const lit = i >= lo && i < hi;
          f.classList.toggle('lit', lit);
          f.textContent = goingDown ? f.dataset.down : f.dataset.up;
        });
      }
      function nearestRung(y) { return Math.max(0, Math.min(N - 1, Math.round(y / RUNG_H))); }
      function clampY(y) { return Math.max(0, Math.min(trackH, y)); }
      function rubberY(y) { return y > trackH ? trackH + (y - trackH) * 0.25 : y < 0 ? y * 0.25 : y; }

      return { ladderEl, rungs, N, trackH, rungYs, litRange, nearestRung, clampY, rubberY };
    }

    /* ---------- convert mode ---------- */
    function startConvert(m) {
      const rig = buildLadder(m.family, { targetIdx: m.toIdx });
      const model = parseNumber(m.start);
      const startRung = m.fromIdx;
      let curIdx = startRung;
      let pendingIdx = startRung;
      let curChars = layoutFor(model, 0).chars;
      let cancelTween = null;
      let settling = false;

      const platform = el('div', 'cpl-platform');
      const img = el('img'); img.src = CENTI_IMG; img.alt = 'Centi-Peed';
      const pnum = el('div', 'cpl-pnum');
      const unitChip = el('div', 'cpl-unitchip', rig.rungs[startRung].label);
      platform.append(img, pnum, unitChip);
      rig.ladderEl.append(platform);
      const hit = platform;

      function renderChars(chars, animate) {
        const oldLen = pnum.children.length;
        pnum.innerHTML = '';
        chars.forEach((c, i) => {
          const s = el('span', c.cls, c.ch);
          if (animate && c.cls === 'sw') { s.classList.add('enter'); later(() => { if (alive) sfx.drop(); }, i * 40); }
          pnum.append(s);
        });
        if (animate && chars.length < oldLen) sfx.pop();
      }
      renderChars(curChars, false);

      function setY(y, live) {
        platform.style.top = (y) + 'px';
        if (live) {
          const idx = rig.nearestRung(y);
          if (idx !== pendingIdx) {
            pendingIdx = idx;
            const dir = idx > curIdx ? 1 : -1;
            if (dir > 0) sfx.tick(Math.abs(idx - curIdx)); else sfx.tock(Math.abs(idx - curIdx));
            rig.litRange(startRung, idx);
            unitChip.textContent = rig.rungs[idx].label;
            const off = offsetBetween(m.family, startRung, idx);
            const lay = layoutFor(model, off);
            renderChars(lay.chars, true);
            curChars = lay.chars;
            updateStatus(off);
          }
        }
      }
      function updateStatus(off) {
        if (off === 0) { status.innerHTML = 'no rungs climbed yet'; return; }
        const n = Math.abs(off);
        status.innerHTML = `<b>${n}</b> rung${n === 1 ? '' : 's'} <b>${off > 0 ? 'DOWN' : 'UP'}</b> — that's <b>${off > 0 ? '× ' : '÷ '}${fmtFactor(n)}</b>`;
      }
      setY(rig.rungYs[startRung], false);
      rig.litRange(startRung, startRung);
      updateStatus(0);

      function settleAt(idx) {
        pendingIdx = idx;
        if (cancelTween) cancelTween();
        settling = true;
        const fromY = parseFloat(platform.style.top) || 0;
        cancelTween = tween((v) => setY(v, false), fromY, rig.rungYs[idx], 260, () => {
          settling = false; cancelTween = null;
          curIdx = idx;
          sfx.settle();
          unitChip.textContent = rig.rungs[idx].label;
          rig.litRange(startRung, idx);
          const off = offsetBetween(m.family, startRung, idx);
          const lay = layoutFor(model, off);
          renderChars(lay.chars, true);
          curChars = lay.chars;
          updateStatus(off);
        });
      }

      const dragCtrl = makeDrag(hit, {
        enabled: () => !settling,
        onStart() {
          if (cancelTween) { cancelTween(); cancelTween = null; settling = false; }
          platform.classList.add('dragging');
          dragBaseY = parseFloat(platform.style.top) || 0;
        },
        onMove(dx, dy) { setY(rig.rubberY(rig.clampY(dragBaseY + dy)), true); },
        onEnd() {
          platform.classList.remove('dragging');
          settleAt(rig.nearestRung(parseFloat(platform.style.top) || 0));
        },
      });
      let dragBaseY = 0;

      function nudge(dir) {
        if (settling || dragCtrl.dragging()) return;
        const base = pendingIdx;
        const target = Math.max(0, Math.min(rig.N - 1, base + dir));
        if (target === base) { sfx.nudge(); return; }
        settleAt(target);
      }

      lock.style.display = '';
      nu.style.display = '';
      nd.style.display = '';
      status.style.display = '';
      lock.onclick = () => {
        if (settling || dragCtrl.dragging()) return;
        sfx.ui();
        if (curIdx === m.toIdx) { winConvert(m, model); return; }
        attempts += 1;
        sfx.nudge();
        const need = Math.abs(offsetBetween(m.family, m.fromIdx, m.toIdx));
        let text;
        if (curIdx === startRung) {
          text = 'Take hold of Centi-Peed and drag him up or down the ladder!';
        } else if (Math.sign(curIdx - startRung) !== Math.sign(m.toIdx - startRung)) {
          text = `Wrong way! You want the <b>${rig.rungs[m.toIdx].label}</b> rung — that's ${m.toIdx > startRung ? 'further DOWN' : 'further UP'} the ladder.`;
        } else {
          const got = Math.abs(curIdx - startRung);
          text = `Right direction! But you're ${got > need ? 'past it' : 'not quite there'} — you want the <b>${rig.rungs[m.toIdx].label}</b> rung exactly.`;
        }
        if (attempts >= 2) text += `<br><br>🥾 Psst: <b>${rig.rungs[m.fromIdx].label} → ${rig.rungs[m.toIdx].label}</b> is exactly <b>${need} rung${need === 1 ? '' : 's'}</b> away. You've got this!`;
        bubble(stage, { title: 'CLIMB ON! 🪜', text, img: CENTI_IMG });
      };
      nu.onclick = () => nudge(-1);
      nd.onclick = () => nudge(1);
      resetBtn.onclick = () => { sfx.ui(); if (!dragCtrl.dragging()) settleAt(startRung); };

      ladder = {
        cleanup() { if (cancelTween) cancelTween(); dragCtrl.destroy(); },
        layout(g) {
          if (cancelTween) { cancelTween(); cancelTween = null; settling = false; }
          dragCtrl.abort();
          setY(rig.rungYs[curIdx], false);
          rig.litRange(startRung, curIdx);
        },
      };
    }

    function winConvert(m, model) {
      doneSet.add(m.id);
      sfx.win(); party(stage);
      paintChips();
      winBox.innerHTML = '';
      const lay = layoutFor(model, offsetBetween(m.family, m.fromIdx, m.toIdx));
      const w = el('div', 'cpl-win',
        `<div class="wp">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]} &nbsp; ${m.start} ${FAMILIES[m.family].rungs[m.fromIdx].label} = <b>${lay.text} ${FAMILIES[m.family].rungs[m.toIdx].label}</b></div>`
        + `<div class="wk">${m.worked}</div>`);
      winBox.append(w);
      advanceOrFreePlay(w);
    }

    /* ---------- sort mode ---------- */
    function startSort(m) {
      const rig = buildLadder(m.family, { targetIdx: -1 });
      lock.style.display = 'none';
      nu.style.display = 'none';
      nd.style.display = 'none';
      status.style.display = 'none';
      let placed = false;
      const CARD_W = 108; const CARD_H = 84; // matches .cpl-card box (border-box)

      const ladderCenterX = rig.ladderEl.offsetLeft + rig.ladderEl.offsetWidth / 2;
      const tray = el('div', 'cpl-card', `<span class="ce">${m.object.emoji}</span><span class="cl">${m.object.label}</span>`);
      const trayX = ladderCenterX - CARD_W / 2; const trayY = rig.trackH + 44;
      tray.style.left = trayX + 'px'; tray.style.top = trayY + 'px';
      wrap.style.minHeight = (trayY + CARD_H + 12) + 'px';
      wrap.append(tray);
      let baseX = trayX; let baseY = trayY;

      const dragCtrl = makeDrag(tray, {
        enabled: () => !placed,
        onStart() { tray.classList.add('dragging'); dragBase = { x: baseX, y: baseY }; },
        onMove(dx, dy) {
          baseX = dragBase.x + dx; baseY = dragBase.y + dy;
          tray.style.left = baseX + 'px'; tray.style.top = baseY + 'px';
        },
        onEnd() {
          tray.classList.remove('dragging');
          const cardCenterX = baseX + CARD_W / 2;
          const cardCenterY = baseY + CARD_H / 2;
          const closeEnoughX = Math.abs(cardCenterX - ladderCenterX) < 90;
          if (closeEnoughX && cardCenterY > -RUNG_H / 2 && cardCenterY < rig.trackH + RUNG_H / 2) {
            const idx = rig.nearestRung(cardCenterY);
            evaluate(idx);
          } else {
            springBack();
          }
        },
      });
      let dragBase = { x: trayX, y: trayY };

      function springBack() {
        tray.classList.remove('springback'); void tray.offsetWidth; tray.classList.add('springback');
        sfx.nudge();
        baseX = trayX; baseY = trayY;
        tray.style.left = baseX + 'px'; tray.style.top = baseY + 'px';
      }

      function evaluate(idx) {
        baseY = rig.rungYs[idx] - CARD_H / 2;
        baseX = ladderCenterX - CARD_W / 2;
        tray.style.left = baseX + 'px'; tray.style.top = baseY + 'px';
        if (idx === m.targetIdx) {
          placed = true;
          tray.classList.add('snapped');
          sfx.win(); party(stage);
          sparkleBurst(stage, wrap.offsetLeft + baseX, wrap.offsetTop + baseY + (tray.offsetHeight || 0) / 2);
          doneSet.add(m.id);
          paintChips();
          winBox.innerHTML = '';
          const w = el('div', 'cpl-win',
            `<div class="wp">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]} &nbsp; ${m.object.label} → <b>${rig.rungs[idx].label}</b></div>`
            + `<div class="wk">${m.worked}</div>`);
          winBox.append(w);
          advanceOrFreePlay(w);
        } else {
          attempts += 1;
          sfx.nudge();
          later(() => { if (alive) springBack(); }, 260);
          let text = `The <b>${rig.rungs[idx].label}</b> rung isn't the sensible fit for a door. Try another rung!`;
          if (attempts >= 2) text += '<br><br>🥾 Psst: think how many of that unit would stack up to a door’s height — too many, or too few?';
          later(() => bubble(stage, { title: 'HMMM, NOT QUITE 🚪', text, img: CENTI_IMG }), 300);
        }
      }

      resetBtn.onclick = () => { sfx.ui(); if (!placed && !dragCtrl.dragging()) springBack(); };

      ladder = {
        cleanup() { dragCtrl.destroy(); },
        layout() { dragCtrl.abort(); },
      };
    }

    function advanceOrFreePlay(w) {
      const nextIdx = MISSIONS.findIndex((m2) => !doneSet.has(m2.id));
      if (nextIdx !== -1) {
        const nb = el('button', 'btn btn-gold wbtn', 'NEXT ONE ➡');
        nb.addEventListener('click', () => { sfx.ui(); start(nextIdx); });
        w.append(nb);
      } else {
        const fp = el('button', 'btn btn-gold wbtn', 'FREE PLAY 🕹️');
        fp.addEventListener('click', () => { sfx.ui(); startSandbox(); });
        w.append(fp);
        ctx.complete();
      }
      if (doneSet.size === MISSIONS.length) ctx.complete();
    }

    /* ---------- sandbox (free play) ---------- */
    function startSandbox() {
      sandbox = true;
      mi = -1;
      mission = null;
      attempts = 0;
      winBox.innerHTML = '';
      if (ladder) { ladder.cleanup(); ladder = null; }
      paintChips();
      let famKey = 'length';
      lock.style.display = 'none';
      nu.style.display = '';
      nd.style.display = '';
      status.style.display = '';

      function render() {
        q.innerHTML = 'Free play — pick a family and a rung!';
        const famRow = el('div', 'cpl-famrow');
        Object.keys(FAMILIES).forEach((k) => {
          const c = el('button', 'anim-mchip' + (k === famKey ? ' active' : ''), `${FAMILIES[k].emoji} ${FAMILIES[k].name}`);
          c.addEventListener('click', () => { if (k === famKey) return; sfx.ui(); famKey = k; render(); });
          famRow.append(c);
        });
        const numRow = el('div', 'anim-chiprow');
        SANDBOX[famKey].forEach((s2, k) => {
          const c = el('button', 'anim-mchip' + (k === 0 ? ' active' : ''), s2);
          c.addEventListener('click', () => {
            numRow.querySelectorAll('.anim-mchip').forEach((x) => x.classList.remove('active'));
            c.classList.add('active'); sfx.ui();
            buildSandboxRig(famKey, s2);
          });
          numRow.append(c);
        });
        qsub.innerHTML = '';
        qsub.append(famRow, numRow);
        buildSandboxRig(famKey, SANDBOX[famKey][0]);
      }

      function buildSandboxRig(fk, numStr) {
        if (ladder) { ladder.cleanup(); ladder = null; }
        const rig = buildLadder(fk, { targetIdx: -1 });
        const model = parseNumber(numStr);
        const startRung = 0;
        let curIdx = startRung;
        let pendingIdx = startRung;
        let cancelTween = null; let settling = false;

        const platform = el('div', 'cpl-platform');
        const img = el('img'); img.src = CENTI_IMG; img.alt = 'Centi-Peed';
        const pnum = el('div', 'cpl-pnum');
        const unitChip = el('div', 'cpl-unitchip', rig.rungs[startRung].label);
        platform.append(img, pnum, unitChip);
        rig.ladderEl.append(platform);

        function renderChars(chars) {
          pnum.innerHTML = '';
          chars.forEach((c) => pnum.append(el('span', c.cls, c.ch)));
        }
        renderChars(layoutFor(model, 0).chars);

        function setY(y, live) {
          platform.style.top = y + 'px';
          if (live) {
            const idx = rig.nearestRung(y);
            if (idx !== pendingIdx) {
              pendingIdx = idx;
              const dir = idx > curIdx ? 1 : -1;
              if (dir > 0) sfx.tick(Math.abs(idx - curIdx)); else sfx.tock(Math.abs(idx - curIdx));
              rig.litRange(startRung, idx);
              unitChip.textContent = rig.rungs[idx].label;
              const off = offsetBetween(fk, startRung, idx);
              renderChars(layoutFor(model, off).chars);
              updateStatus(off);
            }
          }
        }
        function updateStatus(off) {
          if (off === 0) { status.innerHTML = 'no rungs climbed yet'; return; }
          const n = Math.abs(off);
          status.innerHTML = `<b>${n}</b> rung${n === 1 ? '' : 's'} <b>${off > 0 ? 'DOWN' : 'UP'}</b> — that's <b>${off > 0 ? '× ' : '÷ '}${fmtFactor(n)}</b>`;
        }
        setY(rig.rungYs[startRung], false);
        updateStatus(0);

        let dragBaseY = 0;
        const dragCtrl = makeDrag(platform, {
          enabled: () => !settling,
          onStart() {
            if (cancelTween) { cancelTween(); cancelTween = null; settling = false; }
            platform.classList.add('dragging');
            dragBaseY = parseFloat(platform.style.top) || 0;
          },
          onMove(dx, dy) { setY(rig.rubberY(rig.clampY(dragBaseY + dy)), true); },
          onEnd() {
            platform.classList.remove('dragging');
            const idx = rig.nearestRung(parseFloat(platform.style.top) || 0);
            pendingIdx = idx;
            if (cancelTween) cancelTween();
            settling = true;
            const fromY = parseFloat(platform.style.top) || 0;
            cancelTween = tween((v) => setY(v, false), fromY, rig.rungYs[idx], 240, () => {
              settling = false; cancelTween = null; curIdx = idx;
              sfx.settle();
              const off = offsetBetween(fk, startRung, idx);
              renderChars(layoutFor(model, off).chars);
              updateStatus(off);
            });
          },
        });

        nu.onclick = () => { if (!settling && !dragCtrl.dragging()) jumpTo(pendingIdx - 1); };
        nd.onclick = () => { if (!settling && !dragCtrl.dragging()) jumpTo(pendingIdx + 1); };
        function jumpTo(target) {
          target = Math.max(0, Math.min(rig.N - 1, target));
          if (target === pendingIdx) { sfx.nudge(); return; }
          pendingIdx = target;
          if (cancelTween) cancelTween();
          settling = true;
          const fromY = parseFloat(platform.style.top) || 0;
          cancelTween = tween((v) => setY(v, false), fromY, rig.rungYs[target], 240, () => {
            settling = false; cancelTween = null; curIdx = target;
            sfx.settle();
            const off = offsetBetween(fk, startRung, target);
            renderChars(layoutFor(model, off).chars);
            updateStatus(off);
          });
        }
        resetBtn.onclick = () => { sfx.ui(); if (!dragCtrl.dragging()) jumpTo(startRung); };

        ladder = {
          cleanup() { if (cancelTween) cancelTween(); dragCtrl.destroy(); },
          layout() {
            if (cancelTween) { cancelTween(); cancelTween = null; settling = false; }
            dragCtrl.abort();
            setY(rig.rungYs[curIdx], false);
            rig.litRange(startRung, curIdx);
          },
        };
      }

      render();
    }

    function start(i) {
      sandbox = false;
      mi = i;
      attempts = 0;
      winBox.innerHTML = '';
      if (ladder) { ladder.cleanup(); ladder = null; }
      paintChips();
      mission = MISSIONS[i];
      q.innerHTML = mission.q;
      qsub.textContent = mission.instr;
      status.innerHTML = 'no rungs climbed yet';
      if (mission.kind === 'convert') startConvert(mission); else startSort(mission);
    }

    const onResize = () => { if (ladder) ladder.layout(); };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    start(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      if (ladder) ladder.cleanup();
      stage.remove();
      ruleCard.remove();
    };
  },
};
