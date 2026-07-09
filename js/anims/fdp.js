// FART QUEST — js/anims/fdp.js
// PERCY'S DISGUISE WHEEL — interactive fraction/decimal/percentage machine for
// the fdp Scout Report. One amount, three linked cards, a draggable dial that
// snaps to the taught set. Structure and interaction discipline follow
// decimals-x10.js (the house reference implementation).

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const PERCY_IMG = 'assets/monsters/percy-percent.png';
const RULE = '½, 0.5 and 50% are the SAME creature in three disguises. To find a fraction OF an amount: divide by the bottom, times by the top.';

/* ---------- pure disguise engine (unit-tested in scratch script — do not "improve" the thresholds) ---------- */
const VALUES = [
  { v: 0,    frac: '0',  dec: '0',    pct: '0%'   },
  { v: 0.1,  frac: '⅒',  dec: '0.1',  pct: '10%'  },
  { v: 0.2,  frac: '⅕',  dec: '0.2',  pct: '20%'  },
  { v: 0.25, frac: '¼',  dec: '0.25', pct: '25%'  },
  { v: 0.5,  frac: '½',  dec: '0.5',  pct: '50%'  },
  { v: 0.75, frac: '¾',  dec: '0.75', pct: '75%'  },
  { v: 1,    frac: '1',  dec: '1.0',  pct: '100%' },
];
const NV = VALUES.length;
function nearestIndexForFrac(frac) {
  let best = 0; let bestD = Infinity;
  for (let i = 0; i < NV; i += 1) {
    const d = Math.abs(VALUES[i].v - frac);
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- content ---------- */
const MISSIONS = [
  { id: 'a', kind: 'set', targetIdx: 3, label: '¼ ?', prompt: 'Show Percy a QUARTER.', sub: 'Drag him along the dial — or nudge — then LOCK IT IN.' },
  { id: 'b', kind: 'set', targetIdx: 5, label: '75% ?', prompt: 'Now set Percy to SEVENTY-FIVE PER CENT.', sub: 'Drag him along the dial — or nudge — then LOCK IT IN.' },
  { id: 'c', kind: 'quiz', label: '0.2 = ?', revealIdx: 2, correctFrac: '⅕', options: ['⅕', '¼', '⅒', '½'], prompt: 'Percy’s cards flip face-down — all except the decimal. What fraction is hiding?', sub: 'Tap the fraction that matches 0.2.' },
  { id: 'd', kind: 'money', label: '25% of £60', targetIdx: 3, amount: 60, prompt: 'Set Percy to a quarter — then split Jarlath’s £60 the Percy way.', sub: 'Drag him along the dial — or nudge — then LOCK IT IN.' },
];
const SANDBOX_START = 4; // ½
const WIN_PHRASES = ['UNMASKED! 🧐', 'DISGUISE BUSTED!', 'PERCY IS IMPRESSED!', 'THE BAR NEVER LIES! 🏆'];

/* ---------- the dial widget ---------- */
function makeDial(host, opts) {
  const D = {
    W: 0, minPx: 0, maxPx: 0, px: 0, liveIdx: 0, targetIdx: 0,
    settling: false, cancelTween: null, alive: true, disabled: false,
  };
  const wrap = el('div', 'pdw-barwrap');
  const bar = el('div', 'pdw-bar');
  const fill = el('div', 'pdw-fill');
  const ticks = el('div', 'pdw-ticks');
  VALUES.forEach((v) => {
    const t = el('div', 'pdw-tick');
    t.style.left = (v.v * 100) + '%';
    ticks.append(t);
  });
  const handle = el('div', 'pdw-handle');
  handle.innerHTML = `<img src="${PERCY_IMG}" alt="" draggable="false">`;
  const hit = el('div', 'pdw-hit');
  bar.append(fill, ticks, handle, hit);
  wrap.append(bar);
  host.append(wrap);

  D.layout = function layout() {
    if (D.cancelTween) { D.cancelTween(); D.cancelTween = null; }
    drag.abort();
    bar.classList.remove('dragging');
    D.W = bar.clientWidth || 300;
    D.minPx = 0; D.maxPx = D.W;
    D.setPx(D.targetIdx / (NV - 1) * D.W, true);
  };

  D.setPx = function setPx(px, silent) {
    D.px = px;
    const frac = D.px / D.W;
    fill.style.width = (frac * 100) + '%';
    handle.style.left = (frac * 100) + '%';
    const idx = nearestIndexForFrac(frac);
    if (idx !== D.liveIdx) {
      D.liveIdx = idx;
      if (!silent) sfx.tick(0);
      if (opts.onLive) opts.onLive(idx);
    }
  };

  const rubber = (px) => (px > D.maxPx ? D.maxPx + (px - D.maxPx) * 0.25 : px < D.minPx ? D.minPx + (px - D.minPx) * 0.25 : px);

  D.settleTo = function settleTo(idx) {
    D.targetIdx = idx;
    const targetPx = idx / (NV - 1) * D.W;
    if (D.cancelTween) D.cancelTween();
    D.settling = true;
    D.cancelTween = tween((v) => D.setPx(v), D.px, targetPx, 260, () => {
      D.settling = false;
      D.cancelTween = null;
      sfx.settle();
      if (opts.onSettle) opts.onSettle(D.liveIdx);
    });
  };

  const drag = makeDrag(hit, {
    enabled: () => !D.disabled,
    onStart() {
      if (D.cancelTween) { D.cancelTween(); D.cancelTween = null; D.settling = false; }
      D.dragBase = D.px;
      bar.classList.add('dragging');
      if (opts.onFirstDrag) opts.onFirstDrag();
    },
    onMove(dx) { D.setPx(rubber(D.dragBase + dx)); },
    onEnd() {
      bar.classList.remove('dragging');
      D.settleTo(D.liveIdx);
    },
  });

  D.nudge = function nudge(dir) {
    if (D.disabled || drag.dragging()) return;
    const base = D.settling ? D.targetIdx : D.liveIdx;
    const next = Math.max(0, Math.min(NV - 1, base + dir));
    if (next === base && !D.settling) { sfx.nudge(); return; }
    D.settleTo(next);
  };
  D.setInstant = function setInstant(idx) {
    D.targetIdx = idx; D.liveIdx = idx;
    D.setPx(idx / (NV - 1) * D.W, true);
  };
  D.busy = () => D.settling || drag.dragging();
  D.destroy = function destroy() {
    D.alive = false;
    if (D.cancelTween) D.cancelTween();
    drag.destroy();
    wrap.remove();
  };
  D.layout();
  return D;
}

/* ---------- the anim card ---------- */
export default {
  id: 'fdp',
  title: 'PERCY’S DISGUISE WHEEL',

  mount(host, ctx) {
    injectCss('fdp', CSS);
    let alive = true;
    let dial = null;
    let mi = 0;
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'pdw-q');
    const qsub = el('div', 'pdw-qsub');
    const wheel = el('div', 'pdw-wheel');
    const cards = el('div', 'pdw-cards');
    const monocle = el('div', 'pdw-monocle', '🧐');
    const cFrac = el('button', 'pdw-card', '<div class="pdw-clabel">FRACTION</div><div class="pdw-cval"></div>');
    const cDec = el('button', 'pdw-card', '<div class="pdw-clabel">DECIMAL</div><div class="pdw-cval"></div>');
    const cPct = el('button', 'pdw-card', '<div class="pdw-clabel">PER CENT</div><div class="pdw-cval"></div>');
    cards.append(cFrac, cDec, cPct, monocle);
    const dialHost = el('div');
    wheel.append(cards, dialHost);
    const quizrow = el('div', 'anim-chiprow pdw-quizrow');
    const moneybox = el('div', 'pdw-moneybox');
    const winBox = el('div');
    const controls = el('div', 'anim-controls');
    const nl = el('button', 'anim-nudge', '⬅');
    const lock = el('button', 'btn btn-gold', 'LOCK IT IN 💨');
    const nr = el('button', 'anim-nudge', '➡');
    const reset = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(nl, lock, nr, reset);
    stage.append(chiprow, q, qsub, wheel, quizrow, moneybox, winBox, controls);
    host.append(stage);

    const ruleCard = el('div', 'goldcard', RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;';
    host.append(ruleCard);

    let mission = null;
    let attempts = 0;
    let cardState = VALUES[0]; // last-known true values — facedown cards never render this text

    function renderCards() {
      const map = { frac: cFrac, dec: cDec, pct: cPct };
      Object.entries(map).forEach(([k, c]) => {
        // facedown cards get ONLY the mask glyph — the real string is never placed
        // in the DOM while hidden, so there is nothing for a curious tap to reveal.
        c.querySelector('.pdw-cval').textContent = c.classList.contains('facedown') ? '❓' : cardState[k];
      });
    }
    function paintCards(idx) { cardState = VALUES[idx]; renderCards(); }
    function faceDown(which) {
      const map = { frac: cFrac, dec: cDec, pct: cPct };
      Object.entries(map).forEach(([k, c]) => c.classList.toggle('facedown', which.includes(k)));
      renderCards();
    }
    function moveMonocle(card) {
      const wR = cards.getBoundingClientRect(); const cR = card.getBoundingClientRect();
      const x = (cR.left + cR.width / 2) - (wR.left + wR.width / 2);
      monocle.style.transform = `translateX(${x}px)`;
      [cFrac, cDec, cPct].forEach((c) => c.classList.remove('looked'));
      card.classList.add('looked');
    }
    function wireCardTaps() {
      [cFrac, cDec, cPct].forEach((c) => {
        c.onclick = () => {
          if (c.classList.contains('facedown')) return;
          sfx.ui();
          moveMonocle(c);
        };
      });
    }
    wireCardTaps();

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), m.label);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
      const fp = el('button', 'anim-mchip' + (mi === MISSIONS.length ? ' active' : ''), 'FREE PLAY 🎮');
      fp.addEventListener('click', () => { sfx.ui(); start(MISSIONS.length); });
      chiprow.append(fp);
    }

    function clearExtras() {
      quizrow.innerHTML = ''; quizrow.classList.remove('show');
      moneybox.innerHTML = ''; moneybox.classList.remove('show');
      winBox.innerHTML = '';
      faceDown([]);
      monocle.style.transform = 'translateX(0px)';
      [cFrac, cDec, cPct].forEach((c) => c.classList.remove('looked'));
    }

    function start(i) {
      mi = i;
      attempts = 0;
      // A money-pour mid-flight (see runCoinPour) is driven by chained later()
      // timers that read the live `mission` var when they fire. Cancel any
      // in-flight pour outright on every navigation so it can't resolve
      // against whatever mission is now on screen.
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
      clearExtras();
      if (dial) { dial.destroy(); dial = null; }
      paintChips();
      const sandbox = i === MISSIONS.length;
      mission = sandbox ? null : MISSIONS[i];
      lock.disabled = false;
      lock.style.display = (sandbox || (mission && mission.kind === 'quiz')) ? 'none' : '';
      nl.style.display = (mission && mission.kind === 'quiz') ? 'none' : '';
      nr.style.display = (mission && mission.kind === 'quiz') ? 'none' : '';
      reset.style.display = (mission && mission.kind === 'quiz') ? 'none' : '';

      if (sandbox) {
        q.textContent = 'Free play — drag Percy anywhere on the dial.';
        qsub.textContent = 'Tap a card to see Percy look at it. Every stop is a real disguise.';
        buildDial(SANDBOX_START);
        return;
      }
      q.textContent = mission.prompt;
      qsub.textContent = mission.sub;
      if (mission.kind === 'quiz') {
        buildDial(mission.revealIdx);
        dial.disabled = true;
        faceDown(['frac', 'pct']);
        buildQuiz();
      } else {
        buildDial(sandbox ? SANDBOX_START : 0);
        if (mission.kind === 'money') buildMoneyPrompt();
      }
    }

    function buildDial(startIdx) {
      if (dial) { dial.destroy(); dial = null; }
      dial = makeDial(dialHost, {
        onLive(idx) { paintCards(idx); },
        onSettle(idx) { paintCards(idx); },
        onFirstDrag() { /* nothing extra — the live morph IS the teaching moment */ },
      });
      dial.setInstant(startIdx);
      paintCards(startIdx);
    }

    function buildQuiz() {
      quizrow.classList.add('show');
      const opts = shuffle(mission.options);
      opts.forEach((frac) => {
        const c = el('button', 'anim-mchip', frac);
        c.addEventListener('click', () => {
          if (c.disabled) return;
          if (frac === mission.correctFrac) {
            sfx.win();
            quizrow.querySelectorAll('.anim-mchip').forEach((x) => { x.disabled = true; });
            c.classList.add('done');
            faceDown([]);
            cFrac.classList.add('flipin');
            const r = VALUES[mission.revealIdx];
            const w = el('div', 'pdw-win',
              `<div class="wp">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]}</div>`
              + `<div class="wk">${r.frac} = ${r.dec} = ${r.pct} — unmasked!</div>`);
            winBox.innerHTML = ''; winBox.append(w);
            sparkleBurst(stage, stage.clientWidth / 2, 160);
            finishMission(w);
          } else {
            sfx.nudge();
            c.disabled = true;
            c.classList.add('wrongchip');
            toast(stage, 'Not that one — Percy’s decimal card still says 0.2. Try again!');
          }
        });
        quizrow.append(c);
      });
    }

    function buildMoneyPrompt() {
      moneybox.classList.add('show');
      const btn = el('button', 'btn btn-gold', 'SPLIT £60 THE PERCY WAY 💰');
      btn.disabled = true;
      moneybox.append(el('div', 'pdw-moneynote', 'Lock in the quarter first — then Percy will split Jarlath’s £60 for you.'), btn);
      moneybox._btn = btn;
    }

    nl.addEventListener('click', () => dial && dial.nudge(-1));
    nr.addEventListener('click', () => dial && dial.nudge(1));
    reset.addEventListener('click', () => { sfx.ui(); if (dial && !dial.busy() && !dial.disabled) dial.settleTo(mi === MISSIONS.length ? SANDBOX_START : 0); });

    lock.addEventListener('click', () => {
      if (!dial || dial.busy() || !mission || mission.kind === 'quiz') return;
      sfx.ui();
      const idx = dial.liveIdx;
      if (idx === mission.targetIdx) {
        if (mission.kind === 'money') { lockMoney(); return; }
        winSet(idx);
        return;
      }
      attempts += 1;
      sfx.nudge();
      const wantPct = VALUES[mission.targetIdx].pct;
      let text = idx < mission.targetIdx
        ? 'Too small — drag (or nudge) further along the dial.'
        : 'Too far — drag (or nudge) back a little.';
      if (attempts >= 2) text += `<br><br>🧐 Psst: you’re aiming for <b>${wantPct}</b> on the dial.`;
      bubble(stage, { title: 'KEEP GOING!', text, img: PERCY_IMG });
    });

    function winSet(idx) {
      doneSet.add(mission.id);
      sfx.win();
      party(stage);
      paintChips();
      const d = VALUES[idx];
      winBox.innerHTML = '';
      const w = el('div', 'pdw-win',
        `<div class="wp">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]}</div>`
        + `<div class="wk">${d.frac} = ${d.dec} = ${d.pct} — three disguises, one amount.</div>`);
      winBox.append(w);
      finishMission(w);
    }

    function lockMoney() {
      dial.disabled = true;
      lock.disabled = true;
      const btn = moneybox._btn;
      btn.disabled = false;
      moneybox.querySelector('.pdw-moneynote').textContent = 'Quarter locked in! Now split it.';
      btn.addEventListener('click', () => runCoinPour(), { once: true });
    }

    function runCoinPour() {
      const missionAtStart = mission; // snapshot: `mission` is reassigned by start() on every navigation
      const btn = moneybox._btn;
      btn.disabled = true;
      const share = mission.amount * VALUES[mission.targetIdx].v; // 60 * 0.25 = 15
      const strip = el('div', 'pdw-coinstrip');
      const readout = el('div', 'pdw-coinreadout', `£${mission.amount} ÷ 4 = <b class="pdw-coinnum">0</b>`);
      moneybox.append(readout, strip);
      let n = 0;
      const step = () => {
        if (!alive || mission !== missionAtStart) return;
        n += 1;
        strip.append(el('span', 'pdw-coin', '💰'));
        readout.querySelector('.pdw-coinnum').textContent = String(n);
        sfx.tick(0);
        if (n < share) later(step, 70);
        else later(() => {
          if (mission !== missionAtStart) return;
          sfx.win(); party(stage);
          doneSet.add(mission.id);
          paintChips();
          const w = el('div', 'pdw-win',
            `<div class="wp">SPLIT COMPLETE! 💰</div>`
            + `<div class="wk">25% of £60 = ¼ of £60 = £60 ÷ 4 = <b>£${share}</b>.</div>`);
          winBox.innerHTML = ''; winBox.append(w);
          finishMission(w);
        }, 250);
      };
      later(step, 120);
    }

    function finishMission(w) {
      if (doneSet.size === MISSIONS.length) ctx.complete();
      const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
      if (nextIdx !== -1) {
        const nb = el('button', 'btn btn-gold', 'NEXT ONE ➡');
        nb.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
        nb.addEventListener('click', () => { sfx.ui(); start(nextIdx); });
        w.append(nb);
      } else {
        const fp = el('button', 'btn btn-gold', 'FREE PLAY 🎮');
        fp.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
        fp.addEventListener('click', () => { sfx.ui(); start(MISSIONS.length); });
        w.append(fp);
        ctx.complete();
      }
    }

    const onResize = () => { if (dial) dial.layout(); };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    start(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      if (dial) dial.destroy();
      [cFrac, cDec, cPct].forEach((c) => { c.onclick = null; });
      stage.remove();
      ruleCard.remove();
    };
  },
};

/* ---------- scoped CSS (prefix pdw-) ---------- */
const CSS = `
.pdw-q { text-align: center; font-weight: 700; font-size: clamp(17px, 2.8vw, 22px); margin-bottom: 2px; }
.pdw-qsub { text-align: center; font-size: 12.5px; color: #6b5744; font-weight: 500; margin-bottom: 10px; }
.pdw-wheel { max-width: 620px; margin: 0 auto; }
.pdw-cards { position: relative; display: flex; gap: 10px; justify-content: center; margin-bottom: 26px; }
.pdw-card {
  flex: 1 1 0; min-width: 0; background: var(--card); border: 3px solid var(--swamp-mid); border-radius: 14px;
  padding: 10px 6px; text-align: center; cursor: pointer; box-shadow: 0 3px 0 rgba(0,0,0,.2);
  transition: border-color .25s, box-shadow .25s; font-family: inherit;
}
.pdw-card:active { transform: translateY(2px); }
.pdw-card.looked { border-color: var(--gold-deep); box-shadow: 0 3px 0 rgba(0,0,0,.2), 0 0 0 3px rgba(244,197,66,.35); }
.pdw-clabel { font-size: 9.5px; font-weight: 700; letter-spacing: .1em; color: #a08c74; }
.pdw-cval { font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: clamp(20px, 5vw, 28px); color: var(--ink); margin-top: 2px; min-height: 1.2em; }
.pdw-card.facedown .pdw-cval { color: #b9ab97; font-size: 22px; }
.pdw-card.flipin { animation: pdwFlip .5s var(--spring) both; }
@keyframes pdwFlip { 0% { transform: rotateY(90deg); } 100% { transform: rotateY(0deg); } }
.pdw-monocle {
  position: absolute; left: 50%; top: -20px; font-size: 22px; pointer-events: none;
  transition: transform .35s var(--spring); transform: translateX(-50%) translateX(0px);
}
.pdw-barwrap { padding: 6px 6px 0; }
.pdw-bar { position: relative; height: 30px; margin: 0 10px; }
.pdw-bar::before {
  content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 14px; transform: translateY(-50%);
  background: linear-gradient(180deg,#efe1c4,#e8d7b4); border-radius: 999px; box-shadow: inset 0 2px 6px rgba(51,38,29,.22);
}
.pdw-fill {
  position: absolute; left: 0; top: 50%; height: 14px; transform: translateY(-50%); width: 0;
  background: linear-gradient(180deg, var(--stink), #7a3fae); border-radius: 999px 0 0 999px; pointer-events: none;
}
.pdw-ticks { position: absolute; inset: 0; pointer-events: none; }
.pdw-tick { position: absolute; top: 50%; width: 3px; height: 20px; background: rgba(51,38,29,.28); transform: translate(-50%,-50%); border-radius: 2px; }
.pdw-handle {
  position: absolute; top: 50%; width: 46px; height: 46px; transform: translate(-50%,-50%); z-index: 4; pointer-events: none;
  filter: drop-shadow(0 3px 5px rgba(0,0,0,.35));
}
.pdw-handle img { width: 100%; height: 100%; object-fit: contain; }
.pdw-hit { position: absolute; left: -23px; right: -23px; top: -22px; bottom: -22px; z-index: 5; cursor: grab; touch-action: none; }
.pdw-bar.dragging .pdw-hit { cursor: grabbing; }
.pdw-bar.dragging .pdw-handle { filter: drop-shadow(0 5px 9px rgba(0,0,0,.4)); }
.pdw-quizrow { display: none; margin-top: 4px; }
.pdw-quizrow.show { display: flex; }
.pdw-quizrow .anim-mchip.wrongchip { opacity: .4; border-color: #c0392b; }
.pdw-quizrow .anim-mchip.done { background: var(--correct); color: #fff; border-color: var(--correct); }
.pdw-moneybox { display: none; flex-direction: column; align-items: center; gap: 8px; margin-top: 10px; }
.pdw-moneybox.show { display: flex; }
.pdw-moneynote { font-size: 13px; font-weight: 600; color: #6b5744; text-align: center; }
.pdw-coinreadout { font-weight: 700; font-size: 17px; color: var(--ink); }
.pdw-coinreadout b { color: var(--gold-deep); font-size: 20px; }
.pdw-coinstrip { display: flex; flex-wrap: wrap; gap: 2px; justify-content: center; max-width: 380px; }
.pdw-coin { font-size: 20px; animation: pdwCoinPop .3s var(--spring) both; }
@keyframes pdwCoinPop { 0% { transform: scale(0) translateY(-10px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
.pdw-win {
  margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF);
  border: 3px solid var(--correct); border-radius: 14px; padding: 10px 14px;
  animation: animBubbleIn .34s var(--spring) both;
}
.pdw-win .wp { font-weight: 700; color: #1d8f4e; font-size: 16px; }
.pdw-win .wk { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 2px; }
`;
