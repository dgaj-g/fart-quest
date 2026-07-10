// FART QUEST — js/anims/special-numbers.js
// THE PRIME PROBE — Prime Slime's rectangle-forming factor investigator for
// the special-numbers Scout Report. Feed a number to the door: pebbles
// tumble out. Drag the Rectangle Former to test every rows×cols shape the
// pebbles can form. A number that only EVER forms the single queue (1×n) is
// PRIME. Then stamp the verdict.

import { el, sfx, tween, makeDrag, toast, bubble, party, injectCss } from './_kit.js';

const SLIME_IMG = 'assets/monsters/prime-slime.png';
const RULE = 'A prime has exactly TWO factors: 1 and itself. 1 is not prime. 2 is the only even one.';

/* ---------- pure factor-pair engine (independently re-verified, see report) ---------- */
function primeInfo(n) {
  const pairs = [];
  for (let r = 1; r * r <= n; r += 1) {
    if (n % r === 0) pairs.push([r, n / r]);
  }
  const isPrime = n > 1 && pairs.length === 1;
  const realRects = pairs.filter((p) => p[0] > 1);
  const square = pairs.find((p) => p[0] === p[1] && p[0] > 1) || null;
  return { n, pairs, isPrime, realRects, square };
}

function pairsLabel(pairs) { return pairs.map(([r, c]) => `${r}×${c}`).join(', '); }

// Worked text for the win box — MUST be built from what the child actually
// discovered on screen (the `discovered`/`shownFlags` state), never from the
// ground-truth `info.pairs`/`info.square`, or it can contradict the visible
// "REAL RECTANGLES FOUND" count / assert a square bonus that was never shown.
function workedText(info, discovered, shownFlags) {
  const { n, isPrime } = info;
  if (n === 1) return '1 has only <b>ONE</b> factor — itself. A prime needs exactly <b>TWO</b>, so 1 is NEVER prime.';
  if (isPrime) {
    let t = `${n} only ever forms the queue: <b>1×${n}</b>. Exactly two factors — <b>${n} IS prime.</b>`;
    if (n === 2) t += ' And 2 is the ONLY even prime there will ever be.';
    return t;
  }
  const realPairs = [...discovered]
    .map((k) => k.split(',').map(Number))
    .filter(([r]) => r > 1)
    .sort((a, b) => a[0] - b[0]);
  let t = realPairs.length > 0
    ? `${n} forms <b>${pairsLabel(realPairs)}</b> — ${realPairs.length} rectangle${realPairs.length === 1 ? '' : 's'} found, so <b>${n} is NOT prime.</b>`
    : `${n} is <b>NOT prime</b> — it has more factors than just 1 and itself.`;
  if (shownFlags.has('sq')) {
    const sq = realPairs.find(([r, c]) => r === c);
    if (sq) t += ` And <b>${sq[0]}×${sq[1]}</b> is a perfect square — bonus flag! 🟨`;
  }
  return t;
}

/* ---------- content ---------- */
const MISSIONS = [
  { id: 'a', n: 12 },
  { id: 'b', n: 13 },
  { id: 'c', n: 9 },
  { id: 'd', n: 2 },
  { id: 'e', n: 1 },
];
const SANDBOX_NUMBERS = [15, 17, 8, 20, 11];

const CSS = `
.prp-q { text-align: center; font-weight: 700; font-size: clamp(19px, 3.2vw, 27px); margin-bottom: 2px; color: var(--ink); }
.prp-qsub { text-align: center; font-size: 12.5px; color: #6b5744; font-weight: 500; margin-bottom: 8px; }
.prp-door { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 4px; }
.prp-doorimg { width: 50px; height: 50px; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,.3)); animation: prpBob 2.6s ease-in-out infinite; }
@keyframes prpBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
.prp-doorlabel { font-weight: 700; font-size: 13.5px; color: var(--stink); background: var(--card); border-radius: 999px; padding: 6px 14px; box-shadow: 0 3px 0 rgba(0,0,0,.15); }
.prp-pebblewrap { display: flex; justify-content: center; margin: 12px 0; min-height: 56px; transition: box-shadow .3s, outline-color .3s; border-radius: 14px; }
.prp-pebblewrap.prp-square { outline: 3px solid #9B59D0; outline-offset: 7px; box-shadow: 0 0 18px rgba(155,89,208,.4); }
.prp-pebbles { display: grid; gap: 4px; }
.prp-pebble { display: flex; align-items: center; justify-content: center; animation: prpTumble .5s cubic-bezier(.22,1.2,.36,1) both; }
@keyframes prpTumble { 0% { transform: translateY(-36px) scale(.5); opacity: 0; } 60% { transform: translateY(4px) scale(1.08); opacity: 1; } 100% { transform: translateY(0) scale(1); } }
.prp-pebble.prp-orphan { outline: 2px dashed #c0392b; outline-offset: 2px; border-radius: 50%; animation: prpTumble .5s cubic-bezier(.22,1.2,.36,1) both, prpWobble 1.6s ease-in-out .5s infinite; }
@keyframes prpWobble { 0%, 100% { transform: rotate(0); } 50% { transform: rotate(-8deg); } }
.prp-single { text-align: center; font-size: 14.5px; font-weight: 600; color: #6b5744; margin: 10px 0 4px; }
.prp-readout { text-align: center; font-weight: 700; font-size: clamp(13.5px, 2.4vw, 16px); color: var(--ink); margin: 4px 0 2px; min-height: 20px; }
.prp-readout b { color: var(--stink-lime); background: var(--swamp-mid); padding: 1px 8px; border-radius: 8px; }
.prp-readout .ok { color: #1d8f4e; font-weight: 700; }
.prp-readout .bad { color: #c0392b; font-weight: 700; }
.prp-sliderrow { display: flex; align-items: center; justify-content: center; margin: 8px 0 2px; }
.prp-track { position: relative; width: min(400px, 82vw); height: 14px; background: var(--swamp-mid); border-radius: 999px; box-shadow: inset 0 2px 5px rgba(0,0,0,.3); touch-action: none; }
.prp-handle { position: absolute; top: 50%; width: 34px; height: 34px; margin-left: -17px; transform: translateY(-50%); border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fff2c4, var(--gold) 65%, var(--gold-deep)); border: 3px solid var(--gold-deep); box-shadow: 0 3px 0 rgba(0,0,0,.3); cursor: grab; }
.prp-track.prp-dragging .prp-handle { cursor: grabbing; }
.prp-tally { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin: 8px 0 2px; min-height: 30px; }
.prp-chip { background: var(--card); border: 2px solid var(--swamp-mid); border-radius: 999px; padding: 5px 11px; font-weight: 700; font-size: 12px; color: var(--ink); animation: animBubbleIn .3s var(--spring) both; }
.prp-chip.prp-queue { border-color: var(--gold-deep); color: var(--gold-deep); }
.prp-chip.prp-square { border-color: #9B59D0; color: #6e3aa0; }
.prp-count { text-align: center; font-size: 12.5px; font-weight: 700; color: #6b5744; margin-bottom: 6px; }
.prp-verdictrow { display: flex; gap: 12px; justify-content: center; margin-top: 10px; flex-wrap: wrap; }
.prp-stamp { min-width: 148px; padding: 13px 18px; font-size: 15.5px; font-weight: 800; border-radius: 14px; border: none; cursor: pointer; box-shadow: 0 4px 0 rgba(0,0,0,.3); }
.prp-stamp:active { transform: translateY(3px); box-shadow: 0 1px 0 rgba(0,0,0,.3); }
.prp-stamp:disabled { opacity: .45; cursor: default; }
.prp-stamp.prp-prime { background: #2ecc71; color: #0b3d20; }
.prp-stamp.prp-notprime { background: #e74c3c; color: #3d0b0b; }
.prp-win { margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF); border: 3px solid var(--correct); border-radius: 14px; padding: 10px 14px; animation: animBubbleIn .34s var(--spring) both; }
.prp-win .wp { font-weight: 700; color: #1d8f4e; font-size: 16px; }
.prp-win .wk { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 2px; }
`;

/* ---------- the Rectangle Former slider ---------- */
function makeSlider(container, n, opts) {
  const S = { cols: n, x: 0, stepW: 0, trackW: 0, cancelTween: null, firstMoved: false };
  const track = el('div', 'prp-track');
  const handle = el('div', 'prp-handle');
  track.append(handle);
  container.append(track);

  function colsToX(cols) { return (n - cols) * S.stepW; }
  function xToCols(x) { return Math.max(1, Math.min(n, n - Math.round(x / (S.stepW || 1)))); }

  S.setX = function setX(x, silent) {
    S.x = x;
    handle.style.left = x + 'px';
    const cols = xToCols(x);
    if (cols !== S.cols) {
      S.cols = cols;
      if (!silent) sfx.tick();
      opts.onCols(cols);
    }
  };

  S.layout = function layout() {
    if (S.cancelTween) { S.cancelTween(); S.cancelTween = null; }
    drag.abort();
    track.classList.remove('prp-dragging');
    const avail = Math.min(400, (container.clientWidth || 440) - 40);
    S.trackW = Math.max(50, avail);
    S.stepW = n > 1 ? S.trackW / (n - 1) : 0;
    S.setX(colsToX(S.cols), true);
  };

  const drag = makeDrag(handle, {
    onStart() {
      if (S.cancelTween) { S.cancelTween(); S.cancelTween = null; }
      S.dragBase = S.x;
      track.classList.add('prp-dragging');
      if (!S.firstMoved) { S.firstMoved = true; opts.onFirstMove(); }
    },
    onMove(dx) { S.setX(Math.max(0, Math.min(S.trackW, S.dragBase + dx))); },
    onEnd() {
      track.classList.remove('prp-dragging');
      const target = colsToX(S.cols);
      S.cancelTween = tween((v) => S.setX(v, true), S.x, target, 180, () => { S.cancelTween = null; });
    },
  });

  S.nudge = function nudge(dir) {
    if (drag.dragging()) return;
    const target = Math.max(1, Math.min(n, S.cols + dir));
    if (target === S.cols) { sfx.nudge(); return; }
    if (!S.firstMoved) { S.firstMoved = true; opts.onFirstMove(); }
    if (S.cancelTween) S.cancelTween();
    S.cancelTween = tween((v) => S.setX(v), S.x, colsToX(target), 200, () => { S.cancelTween = null; });
  };

  S.reset = function reset() {
    if (drag.dragging() || S.cols === n) return;
    if (S.cancelTween) S.cancelTween();
    S.cancelTween = tween((v) => S.setX(v), S.x, colsToX(n), 220, () => { S.cancelTween = null; });
  };

  S.destroy = function destroy() {
    if (S.cancelTween) S.cancelTween();
    drag.destroy();
    track.remove();
  };

  S.layout();
  return S;
}

/* ---------- pebble grid ---------- */
function renderPebbles(mount, n, cols) {
  mount.innerHTML = '';
  const avail = Math.min(600, (mount.parentElement ? mount.parentElement.clientWidth : 600) || 600) - 8;
  const size = Math.max(15, Math.min(30, Math.floor((avail - (cols - 1) * 4) / cols)));
  mount.style.gridTemplateColumns = `repeat(${cols}, ${size}px)`;
  mount.style.gridAutoRows = `${size}px`;
  const leftover = n % cols;
  const fullCount = n - leftover;
  for (let i = 0; i < n; i += 1) {
    const orphan = leftover > 0 && i >= fullCount;
    const p = el('span', 'prp-pebble' + (orphan ? ' prp-orphan' : ''), '🟢');
    p.style.width = size + 'px'; p.style.height = size + 'px'; p.style.fontSize = Math.round(size * 0.72) + 'px';
    p.style.animationDelay = (i * 0.014) + 's';
    mount.append(p);
  }
}

/* ---------- the anim card ---------- */
export default {
  id: 'special-numbers',
  title: 'THE PRIME PROBE',

  mount(host, ctx) {
    let alive = true;
    let mi = 0;
    let currentMission = null;
    let info = null;
    let explored = false;
    let discovered = new Set();
    let shownFlags = new Set();
    let lastCols = 1;
    let slider = null;
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'prp-q');
    const qsub = el('div', 'prp-qsub');
    const sandboxPicker = el('div');
    const door = el('div', 'prp-door');
    const doorImg = el('img', 'prp-doorimg'); doorImg.src = SLIME_IMG; doorImg.alt = 'Prime Slime';
    const doorLabel = el('div', 'prp-doorlabel', 'PEBBLES OUT: —');
    door.append(doorImg, doorLabel);
    const pebbleWrap = el('div', 'prp-pebblewrap');
    const pebbleMount = el('div', 'prp-pebbles');
    pebbleWrap.append(pebbleMount);
    const single = el('div', 'prp-single', 'Just ONE lonely pebble — nowhere to rearrange it.');
    const readout = el('div', 'prp-readout');
    const sliderHost = el('div', 'prp-sliderrow');
    const nudgeRow = el('div', 'anim-controls');
    const nl = el('button', 'anim-nudge', '⬅');
    const resetBtn = el('button', 'anim-ghostbtn', '↩ RESET');
    const nr = el('button', 'anim-nudge', '➡');
    nudgeRow.append(nl, resetBtn, nr);
    const tally = el('div', 'prp-tally');
    const countLabel = el('div', 'prp-count', 'REAL RECTANGLES FOUND: 0');
    const verdictRow = el('div', 'prp-verdictrow');
    const primeBtn = el('button', 'prp-stamp prp-prime', '🟢 PRIME');
    const notPrimeBtn = el('button', 'prp-stamp prp-notprime', '🔴 NOT PRIME');
    verdictRow.append(primeBtn, notPrimeBtn);
    const winBox = el('div');

    stage.append(chiprow, q, qsub, sandboxPicker, door, pebbleWrap, single, readout, sliderHost, nudgeRow, tally, countLabel, verdictRow, winBox);
    host.append(stage);

    const ruleCard = el('div', 'goldcard', RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;';
    host.append(ruleCard);

    injectCss('special-numbers', CSS);

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), `Probe ${m.n}`);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
      const fp = el('button', 'anim-mchip' + (mi === MISSIONS.length ? ' active' : ''), 'FREE PLAY 🕹️');
      fp.addEventListener('click', () => { sfx.ui(); start(MISSIONS.length); });
      chiprow.append(fp);
    }

    function updateReadout(n, cols) {
      const rem = n % cols;
      if (rem !== 0) {
        readout.innerHTML = `${cols} across doesn't divide evenly <span class="bad">— ${rem} pebble${rem === 1 ? '' : 's'} left over</span>`;
        return;
      }
      const rows = n / cols;
      if (rows === 1 || cols === 1) {
        readout.innerHTML = `<b>${rows} × ${cols}</b> = ${n} — just <span class="bad">the queue</span>, nothing rectangular about it`;
      } else {
        readout.innerHTML = `<b>${rows} × ${cols}</b> = ${n} <span class="ok">✅ a real rectangle!</span>`;
      }
    }

    function registerPair(r, c, silent) {
      const key = r + ',' + c;
      if (discovered.has(key)) return;
      discovered.add(key);
      const isQueue = r === 1;
      const isSquare = r === c && r > 1;
      const label = isQueue ? `1×${c} (the queue)` : isSquare ? `${r}×${c} 🟨` : `${r}×${c}`;
      const chip = el('div', 'prp-chip' + (isQueue ? ' prp-queue' : '') + (isSquare ? ' prp-square' : ''), label);
      tally.append(chip);
      const realCount = [...discovered].filter((k) => Number(k.split(',')[0]) > 1).length;
      countLabel.textContent = realCount > 0
        ? `REAL RECTANGLES FOUND: ${realCount}`
        : 'REAL RECTANGLES FOUND: 0 — just the queue so far';
      if (silent) return;
      sfx.sparkle();
      if (isSquare && !shownFlags.has('sq')) {
        shownFlags.add('sq');
        const nn = info.n; // capture now — info is reassigned on probe switch, and this fires after a delay
        later(() => bubble(stage, {
          title: 'SQUARE NUMBER! 🟨',
          text: `<b>${r}×${c}</b> — every side the same! ${nn} is a <b>perfect square</b>. That doesn't save it though: more than two factors still means <b>NOT prime</b>.`,
          img: SLIME_IMG,
        }), 260);
      }
    }

    function handleColsChange(cols) {
      const n = info.n;
      lastCols = cols;
      renderPebbles(pebbleMount, n, cols);
      updateReadout(n, cols);
      const rem = n % cols;
      const isSquareNow = rem === 0 && (n / cols) === cols && cols > 1;
      pebbleWrap.classList.toggle('prp-square', isSquareNow);
      if (rem === 0) registerPair(Math.min(n / cols, cols), Math.max(n / cols, cols));
    }

    function buildProbe(n) {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
      info = primeInfo(n);
      explored = n === 1;
      discovered = new Set();
      shownFlags = new Set();
      lastCols = n;
      winBox.innerHTML = '';
      primeBtn.disabled = false; notPrimeBtn.disabled = false;
      if (slider) { slider.destroy(); slider = null; }
      pebbleWrap.classList.remove('prp-square');
      doorLabel.textContent = `PEBBLES OUT: ${n}`;
      const hasSlider = n > 1;
      sliderHost.style.display = hasSlider ? '' : 'none';
      nudgeRow.style.display = hasSlider ? '' : 'none';
      readout.style.display = hasSlider ? '' : 'none';
      tally.style.display = hasSlider ? '' : 'none';
      countLabel.style.display = hasSlider ? '' : 'none';
      single.style.display = hasSlider ? 'none' : '';
      renderPebbles(pebbleMount, n, n);
      if (hasSlider) {
        updateReadout(n, n);
        tally.innerHTML = '';
        countLabel.textContent = 'REAL RECTANGLES FOUND: 0 — just the queue so far';
        registerPair(1, n, true);
        sliderHost.innerHTML = '';
        slider = makeSlider(sliderHost, n, {
          onCols(cols) { handleColsChange(cols); },
          onFirstMove() { explored = true; },
        });
      }
    }

    function start(i) {
      mi = i;
      currentMission = i < MISSIONS.length ? MISSIONS[i] : null;
      winBox.innerHTML = '';
      paintChips();
      if (currentMission) {
        q.textContent = `PROBE ${currentMission.n}`;
        qsub.textContent = currentMission.n === 1
          ? 'Only one pebble in the whole springs — is that enough for Prime Slime to say yes?'
          : 'Drag the Rectangle Former to test every shape — does it ever form a REAL rectangle, or just queue?';
        sandboxPicker.innerHTML = '';
        buildProbe(currentMission.n);
      } else {
        q.textContent = 'Free play — probe a number:';
        qsub.textContent = '';
        const picker = el('div', 'anim-chiprow');
        SANDBOX_NUMBERS.forEach((num, k) => {
          const c = el('button', 'anim-mchip' + (k === 0 ? ' active' : ''), String(num));
          c.addEventListener('click', () => {
            picker.querySelectorAll('.anim-mchip').forEach((x) => x.classList.remove('active'));
            c.classList.add('active');
            sfx.ui();
            buildProbe(num);
          });
          picker.append(c);
        });
        sandboxPicker.innerHTML = '';
        sandboxPicker.append(picker);
        buildProbe(SANDBOX_NUMBERS[0]);
      }
    }

    function stamp(choice) {
      if (!info) return;
      if (!explored) {
        sfx.nudge();
        toast(stage, `Slide the Rectangle Former first — see what shapes ${info.n} makes!`);
        return;
      }
      const truePrime = info.isPrime;
      const correct = (choice === 'prime') === truePrime;
      if (correct) {
        sfx.win();
        party(stage);
        primeBtn.disabled = true; notPrimeBtn.disabled = true;
        if (currentMission) doneSet.add(currentMission.id);
        paintChips();
        const w = el('div', 'prp-win',
          `<div class="wp">${truePrime ? 'PRIME! 🎉' : 'NOT PRIME! 🎉'} — Prime Slime agrees.</div>`
          + `<div class="wk">${workedText(info, discovered, shownFlags)}</div>`);
        winBox.innerHTML = '';
        winBox.append(w);
        if (truePrime && info.n === 2) {
          later(() => bubble(stage, {
            title: 'THE GUARD LETS HIM IN! 🛡️',
            text: 'Every OTHER even number has 2 hiding inside it as a secret extra factor, so it can never be prime again. 2 itself only ever forms the queue: <b>1×2</b>. The guard makes one exception — 2 is the ONLY even prime there will ever be.',
            img: SLIME_IMG,
          }), 550);
        }
        if (currentMission) {
          const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
          if (nextIdx !== -1) {
            const nb = el('button', 'btn btn-gold', 'NEXT ONE ➡');
            nb.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
            nb.addEventListener('click', () => { sfx.ui(); start(nextIdx); });
            w.append(nb);
          } else {
            ctx.complete();
            const fp = el('button', 'btn btn-gold', 'FREE PLAY 🕹️');
            fp.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
            fp.addEventListener('click', () => { sfx.ui(); start(MISSIONS.length); });
            w.append(fp);
          }
        }
        return;
      }
      sfx.nudge();
      if (info.n === 1 && choice === 'prime') {
        later(() => bubble(stage, {
          title: 'NOT SO FAST! 🎩',
          text: 'Prime Slime shakes his head sadly — 1 only has <b>ONE</b> factor (itself), not the two a prime needs. Try <b>NOT PRIME</b>.',
          img: SLIME_IMG,
        }), 120);
      } else if (truePrime) {
        toast(stage, `Have another look — every shape you've tried folds back to the queue (1×${info.n}). That's the prime signature!`);
      } else {
        const foundReal = [...discovered].filter((k) => Number(k.split(',')[0]) > 1).length;
        toast(stage, foundReal > 0
          ? `Not yet — you've already found ${foundReal} real rectangle${foundReal === 1 ? '' : 's'} here. A true prime can NEVER do that.`
          : 'Keep sliding the Rectangle Former — test a few more shapes before you decide.');
      }
    }

    nl.addEventListener('click', () => { if (slider) slider.nudge(1); });
    nr.addEventListener('click', () => { if (slider) slider.nudge(-1); });
    resetBtn.addEventListener('click', () => { sfx.ui(); if (slider) slider.reset(); });
    primeBtn.addEventListener('click', () => { sfx.ui(); stamp('prime'); });
    notPrimeBtn.addEventListener('click', () => { sfx.ui(); stamp('not'); });

    const onResize = () => {
      if (slider) slider.layout();
      if (info) renderPebbles(pebbleMount, info.n, slider ? slider.cols : lastCols);
    };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    start(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      if (slider) slider.destroy();
      stage.remove();
      ruleCard.remove();
    };
  },
};
