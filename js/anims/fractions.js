// FART QUEST — js/anims/fractions.js
// THE FAIR-SHARE BLADE — interactive chocolate-bar fraction machine for the
// fractions Scout Report (Fraction Falls / Halfbottom the Divided).
// Core: a cut-dial (2-8) re-slices a chocolate bar into that many equal
// pieces; tapping pieces "takes" them and the fraction display builds
// itself, taken/slices. Guided missions cover building fractions,
// equivalence (the TWIN CHECK) and fraction-of-an-amount.

import {
  el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss,
} from './_kit.js';

const HALFBOTTOM_IMG = 'assets/monsters/halfbottom-the-divided.png';
const RULE = 'The bottom number says how many equal pieces. The top says how many you take.';
const WIN_PHRASES = ['FAIR SHARES! 🍫', 'PERFECTLY SLICED!', 'HALFBOTTOM APPROVES! 🙌', 'CHOP-TASTIC!'];

/* ---------- tiny pure helpers (independently re-checked, see report) ---------- */
function sweetsFor(amount, denom, taken) { return (amount / denom) * taken; }
// maps a real bar's taken-piece indices onto an equivalent bar with
// ghostDenom = denom * k slices, so the shaded region always lines up
// pixel-for-pixel no matter WHICH pieces were taken.
function ghostShadeSet(realTaken, k) {
  const s = new Set();
  realTaken.forEach((i) => { for (let j = 0; j < k; j += 1) s.add(i * k + j); });
  return s;
}

/* ---------- content ---------- */
const MISSIONS = [
  {
    id: 'a', type: 'build', denom: 4, taken: 3, label: '¾',
    stem: 'Cut the bar into <b>4</b> equal pieces and take <b>3</b> — build <b>¾</b>!',
    worked: 'Bottom = 4 equal pieces. Top = 3 taken. That’s ¾.',
  },
  {
    id: 'b', type: 'build', denom: 6, taken: 2, label: '2/6',
    stem: 'Cut the bar into <b>6</b> equal pieces and take <b>2</b> — build <b>2/6</b>!',
    worked: 'Bottom = 6 equal pieces. Top = 2 taken. That’s 2/6.',
  },
  {
    id: 'c', type: 'twin', denom: 2, taken: 1, ghostDenom: 4, ghostTaken: 2, label: '½ = 2/4',
    stem: 'Build <b>½</b> first — cut into <b>2</b> and take <b>1</b>. Then press TWIN CHECK!',
    worked: 'To make an equivalent fraction, multiply the TOP and the BOTTOM by the SAME number — ½ ×2 = 2/4, same chocolate!',
  },
  {
    id: 'd', type: 'amount', denom: 4, taken: 3, amount: 12, label: '¾ of 12',
    stem: '<b>12 sweets</b> landed on the bar’s 4 slices, 3 each. Take <b>¾</b> of the bar to collect your share!',
    worked: 'Fraction of an amount: divide by the BOTTOM, then multiply by the TOP. 12 ÷ 4 = 3, then 3 × 3 = 9 sweets!',
  },
];

const CSS = `
.fsb-q { text-align:center; font-weight:700; font-size:clamp(17px,3vw,23px); margin-bottom:2px; line-height:1.3; }
.fsb-qsub { text-align:center; font-size:12.5px; color:#6b5744; font-weight:500; margin-bottom:10px; }
.fsb-dialrow { display:flex; align-items:center; justify-content:center; gap:14px; margin-bottom:6px; }
.fsb-dialnum { font-weight:700; font-size:20px; color:var(--gold-deep); min-width:24px; text-align:center; }
.fsb-track { position:relative; height:10px; border-radius:6px; background:linear-gradient(180deg,#e8d7b4,#dcc9a0); box-shadow:inset 0 2px 5px rgba(51,38,29,.25); touch-action:none; }
.fsb-track.fsb-locked { opacity:.4; pointer-events:none; }
.fsb-track-fill { position:absolute; left:0; top:0; bottom:0; border-radius:6px; background:linear-gradient(90deg,var(--gold),var(--gold-deep)); z-index:1; }
.fsb-stop { position:absolute; top:50%; transform:translate(-50%,-50%); width:26px; height:26px; border-radius:50%; border:2px solid #b9a279; background:var(--card); font-size:10px; font-weight:700; color:#8a7458; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; z-index:2; }
.fsb-stop::before { content:''; position:absolute; inset:-9px; }
.fsb-knob { position:absolute; top:50%; width:30px; height:30px; transform:translate(-50%,-50%); border-radius:50%; background:radial-gradient(circle at 35% 30%, #fff3ce, var(--gold-deep)); border:3px solid var(--ink); box-shadow:0 3px 0 rgba(0,0,0,.3); z-index:3; cursor:grab; }
.fsb-knob::before { content:''; position:absolute; inset:-7px; }
.fsb-track.dragging .fsb-knob { cursor:grabbing; }
.fsb-barwrap { position:relative; margin:16px auto 0; display:flex; justify-content:center; }
.fsb-bar { display:flex; padding:8px; border-radius:16px; background:linear-gradient(160deg,#7a4c26,#4f2f16); box-shadow:0 5px 0 rgba(0,0,0,.3), inset 0 2px 4px rgba(255,255,255,.12); }
.fsb-piece { height:82px; border-radius:7px; background:linear-gradient(150deg,#a06b3a,#7a4a22); box-shadow:inset 0 0 0 2px rgba(0,0,0,.18), 0 2px 0 rgba(0,0,0,.25); display:flex; align-items:center; justify-content:center; cursor:pointer; }
.fsb-piece.taken { background:linear-gradient(150deg,var(--gold),var(--gold-deep)); box-shadow:inset 0 0 0 2px rgba(255,255,255,.4); transform:translateY(-10px); }
.fsb-piece.chop { animation:fsbChop .5s cubic-bezier(.22,1.2,.36,1) both; }
@keyframes fsbChop { 0% { transform:translateY(-26px) scale(.7); opacity:0; } 60% { transform:translateY(3px) scale(1.05); opacity:1; } 100% { transform:translateY(0) scale(1); } }
.fsb-candy { font-size:13px; filter:drop-shadow(0 1px 1px rgba(0,0,0,.3)); }
.fsb-ghost { position:absolute; display:flex; opacity:0; pointer-events:none; transform:scale(.9); }
.fsb-ghost.show { animation:fsbGhostIn .4s var(--spring) both; }
@keyframes fsbGhostIn { from { opacity:0; transform:scale(.85); } to { opacity:1; transform:scale(1); } }
.fsb-gpiece { flex:1 1 0; margin:0 2px; border-radius:6px; border:3px dashed rgba(255,255,255,.75); }
.fsb-gpiece.shaded { background:rgba(155,89,208,.5); border-color:#9B59D0; }
.fsb-dash { display:flex; align-items:center; justify-content:center; gap:14px; flex-wrap:wrap; margin-top:14px; }
.fsb-frac { display:flex; flex-direction:column; align-items:center; background:#241d15; border-radius:12px; padding:8px 22px; border:3px solid #4a3b28; box-shadow:inset 0 3px 10px rgba(0,0,0,.6); }
.fsb-num, .fsb-den { font-size:26px; font-weight:700; color:var(--stink-lime); line-height:1.1; text-shadow:0 0 10px rgba(199,244,100,.35); }
.fsb-barline { width:28px; height:3px; background:var(--stink-lime); margin:3px 0; border-radius:2px; }
.fsb-status { background:var(--swamp-mid); color:var(--parchment); border-radius:12px; padding:9px 15px; font-weight:700; font-size:clamp(12.5px,2vw,14.5px); box-shadow:0 3px 0 rgba(0,0,0,.3); text-align:center; max-width:260px; }
.fsb-status b { color:var(--stink-lime); }
.fsb-sweets { text-align:center; margin-top:10px; font-weight:700; font-size:13.5px; color:#6b5744; min-height:18px; }
.fsb-sweets b { color:var(--gold-deep); }
.fsb-win { margin-top:12px; text-align:center; background:linear-gradient(180deg,#E9FBEF,#D3F3DF); border:3px solid var(--correct); border-radius:14px; padding:10px 14px; animation:fsbGhostIn .34s var(--spring) both; }
.fsb-win .fw-p { font-weight:700; color:#1d8f4e; font-size:16px; }
.fsb-win .fw-k { font-size:13.5px; color:#4d6b58; font-weight:500; margin-top:2px; }
`;

/* ---------- the chocolate-bar machine ---------- */
function makeChocBar(host, opts) {
  const B = {
    alive: true, denom: opts.startDenom, startDenom: opts.startDenom, taken: new Set(),
    settling: false, disabled: !!opts.lockDenom, cancelTween: null, pendingDenom: opts.startDenom,
  };
  let knobX = 0; let lastLiveDenom = B.denom; let trackW = 0; let stopGap = 0;
  let chopTimers = [];

  const wrap = el('div', 'fsb-wrap');
  const dialRow = el('div', 'fsb-dialrow');
  const track = el('div', 'fsb-track' + (B.disabled ? ' fsb-locked' : ''));
  const fill = el('div', 'fsb-track-fill');
  const knob = el('div', 'fsb-knob');
  track.append(fill, knob);
  const dialNum = el('div', 'fsb-dialnum', String(B.denom));
  dialRow.append(track, dialNum);
  const barWrap = el('div', 'fsb-barwrap');
  const bar = el('div', 'fsb-bar');
  const ghost = el('div', 'fsb-ghost');
  barWrap.append(bar, ghost);
  wrap.append(dialRow, barWrap);
  host.append(wrap);

  function liveDenomAtX(x) {
    const idx = Math.max(0, Math.min(6, Math.round(x / stopGap)));
    return idx + 2;
  }
  function applyKnobX(x, silent) {
    knobX = x;
    knob.style.left = x + 'px';
    fill.style.width = x + 'px';
    const live = liveDenomAtX(x);
    if (live !== lastLiveDenom) {
      if (!silent) sfx[live > lastLiveDenom ? 'tick' : 'tock'](Math.abs(live - lastLiveDenom));
      lastLiveDenom = live;
      dialNum.textContent = live;
    }
  }
  function hideGhost() { ghost.classList.remove('show'); ghost.innerHTML = ''; }

  // .fsb-ghost is a sibling of .fsb-bar inside .fsb-barwrap, not a child of it —
  // so it can't just inset:8px off the wrapper (the bar is centred and capped
  // narrower than the wrapper). Read the bar's actual rendered box instead,
  // which shares the same offsetParent (barWrap), and inset by the bar's own
  // 8px padding so the ghost grid lines up with the real piece area exactly.
  function positionGhost() {
    ghost.style.left = (bar.offsetLeft + 8) + 'px';
    ghost.style.top = (bar.offsetTop + 8) + 'px';
    ghost.style.width = (bar.offsetWidth - 16) + 'px';
    ghost.style.height = (bar.offsetHeight - 16) + 'px';
  }

  function notifyChange() {
    if (opts.onChange) opts.onChange({ denom: B.denom, taken: B.taken.size });
  }

  function togglePiece(i) {
    if (B.settling) return;
    const p = bar.children[i];
    if (!p) return;
    if (B.taken.has(i)) { B.taken.delete(i); p.classList.remove('taken'); sfx.tock(1); }
    else { B.taken.add(i); p.classList.add('taken'); sfx.pop(); }
    notifyChange();
  }

  function rebuildPieces({ animate, preserveTaken }) {
    if (!preserveTaken) B.taken = new Set();
    chopTimers.forEach((t) => clearTimeout(t)); chopTimers = [];
    bar.innerHTML = '';
    const n = B.denom;
    const totalW = Math.max(160, Math.min(600, (host.clientWidth || 700) - 40));
    const gap = 6;
    const pieceW = Math.max(30, (totalW - (n - 1) * gap) / n);
    bar.style.width = totalW + 'px';
    for (let i = 0; i < n; i += 1) {
      const p = el('div', 'fsb-piece' + (B.taken.has(i) ? ' taken' : ''));
      p.style.width = pieceW + 'px';
      if (i > 0) p.style.marginLeft = gap + 'px';
      if (opts.candyPerPiece) p.append(el('span', 'fsb-candy', '🍬'.repeat(opts.candyPerPiece)));
      if (animate) {
        p.classList.add('chop');
        p.style.animationDelay = (i * 0.05) + 's';
        const id = setTimeout(() => { if (B.alive) sfx.pop(); }, i * 70 + 40);
        chopTimers.push(id);
      }
      p.addEventListener('click', () => togglePiece(i));
      bar.append(p);
    }
    hideGhost();
  }

  function commitDenom(n) {
    if (B.disabled) return;
    n = Math.max(2, Math.min(8, n));
    if (B.cancelTween) { B.cancelTween(); B.cancelTween = null; }
    const changed = n !== B.denom;
    B.pendingDenom = n;
    B.settling = true;
    const fromX = knobX;
    const toX = (n - 2) * stopGap;
    B.cancelTween = tween((x) => applyKnobX(x, false), fromX, toX, 220, () => {
      B.cancelTween = null;
      B.settling = false;
      B.denom = n;
      B.pendingDenom = n;
      dialNum.textContent = n;
      if (changed) { rebuildPieces({ animate: true, preserveTaken: false }); }
      else { sfx.settle(); }
      notifyChange();
    });
  }

  const knobDrag = makeDrag(knob, {
    enabled: () => !B.disabled,
    onStart() {
      if (B.cancelTween) { B.cancelTween(); B.cancelTween = null; B.settling = false; }
      track.classList.add('dragging');
      B.dragBase = knobX;
    },
    onMove(dx) {
      const x = Math.max(0, Math.min(trackW, B.dragBase + dx));
      applyKnobX(x, false);
    },
    onEnd() {
      track.classList.remove('dragging');
      commitDenom(lastLiveDenom);
    },
  });

  B.layout = function layout() {
    if (B.cancelTween) { B.cancelTween(); B.cancelTween = null; B.settling = false; }
    knobDrag.abort();
    track.classList.remove('dragging');
    const availTrack = Math.min(300, (host.clientWidth || 640) - 60);
    trackW = Math.max(160, availTrack);
    stopGap = trackW / 6;
    track.style.width = trackW + 'px';
    track.querySelectorAll('.fsb-stop').forEach((s) => s.remove());
    for (let i = 0; i <= 6; i += 1) {
      const s = el('button', 'fsb-stop', String(i + 2));
      s.style.left = (i * stopGap) + 'px';
      s.addEventListener('click', () => { if (!B.disabled) commitDenom(i + 2); });
      track.append(s);
    }
    lastLiveDenom = B.denom;
    dialNum.textContent = B.denom;
    applyKnobX((B.denom - 2) * stopGap, true);
    rebuildPieces({ animate: false, preserveTaken: true });
  };

  B.nudge = function nudge(dir) {
    if (B.disabled) { sfx.nudge(); return; }
    const base = B.settling ? B.pendingDenom : B.denom;
    const n = Math.max(2, Math.min(8, base + dir));
    if (n === base) { sfx.nudge(); return; }
    commitDenom(n);
  };

  B.reset = function reset() {
    if (knobDrag.dragging()) return;
    const base = B.settling ? B.pendingDenom : B.denom;
    if (base !== B.startDenom) { commitDenom(B.startDenom); }
    else if (B.taken.size) {
      B.taken.clear();
      rebuildPieces({ animate: false, preserveTaken: true });
      sfx.ui();
      notifyChange();
    } else { sfx.nudge(); }
  };

  B.showGhost = function showGhost(ghostDenom) {
    if (ghostDenom % B.denom !== 0) return;
    const k = ghostDenom / B.denom;
    const shaded = ghostShadeSet(B.taken, k);
    positionGhost();
    ghost.innerHTML = '';
    for (let i = 0; i < ghostDenom; i += 1) {
      ghost.append(el('div', 'fsb-gpiece' + (shaded.has(i) ? ' shaded' : '')));
    }
    ghost.classList.remove('show'); void ghost.offsetWidth; ghost.classList.add('show');
  };
  B.hideGhost = hideGhost;
  B.state = () => ({ denom: B.denom, taken: B.taken.size });
  B.busy = () => B.settling || knobDrag.dragging();
  B.destroy = function destroy() {
    B.alive = false;
    if (B.cancelTween) B.cancelTween();
    chopTimers.forEach((t) => clearTimeout(t));
    knobDrag.destroy();
    wrap.remove();
  };

  B.layout();
  return B;
}

/* ---------- the anim card ---------- */
export default {
  id: 'fractions',
  title: 'THE FAIR-SHARE BLADE',

  mount(host, ctx) {
    let alive = true;
    let board = null;
    let mission = null;
    let mi = 0;
    let attempts = 0;
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    injectCss('fractions', CSS);

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'fsb-q');
    const qsub = el('div', 'fsb-qsub');
    const boardHost = el('div');
    const dash = el('div', 'fsb-dash');
    const fracBox = el('div', 'fsb-frac', '<div class="fsb-num">0</div><div class="fsb-barline"></div><div class="fsb-den">2</div>');
    const status = el('div', 'fsb-status');
    dash.append(fracBox, status);
    const sweetsBox = el('div', 'fsb-sweets');
    const winBox = el('div');
    const controls = el('div', 'anim-controls');
    const dm = el('button', 'anim-nudge', '−');
    const commitBtn = el('button', 'btn btn-gold', 'LOCK IT IN 💨');
    const dp = el('button', 'anim-nudge', '+');
    const resetBtn = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(dm, commitBtn, dp, resetBtn);
    stage.append(chiprow, q, qsub, boardHost, dash, sweetsBox, winBox, controls);
    host.append(stage);

    const ruleCard = el('div', 'goldcard', RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;';
    host.append(ruleCard);

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), m.label);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
      const fp = el('button', 'anim-mchip' + (mi === MISSIONS.length ? ' active' : ''), 'FREE PLAY 🕹️');
      fp.addEventListener('click', () => { sfx.ui(); start(MISSIONS.length); });
      chiprow.append(fp);
    }

    function paintFrac(st) {
      fracBox.querySelector('.fsb-num').textContent = st.taken;
      fracBox.querySelector('.fsb-den').textContent = st.denom;
      status.innerHTML = st.taken === 0
        ? 'no pieces taken yet — tap some chocolate!'
        : `<b>${st.taken}</b> out of <b>${st.denom}</b> equal piece${st.denom === 1 ? '' : 's'} taken`;
    }

    function paintSweets(st) {
      if (mission && mission.type === 'amount') {
        const each = mission.amount / mission.denom;
        const total = sweetsFor(mission.amount, st.denom, st.taken);
        sweetsBox.innerHTML = `🍬 <b>${st.taken}</b> slice${st.taken === 1 ? '' : 's'} × <b>${each}</b> = <b>${total}</b> sweets`;
      } else if (!mission) {
        if (24 % st.denom === 0) {
          const each = 24 / st.denom;
          const total = sweetsFor(24, st.denom, st.taken);
          sweetsBox.innerHTML = `🍬 out of 24 sweets: <b>${st.taken}</b> × <b>${each}</b> = <b>${total}</b>`;
        } else {
          sweetsBox.innerHTML = `🍬 24 sweets won’t split evenly into <b>${st.denom}</b> — try 2, 3, 4, 6 or 8!`;
        }
      } else {
        sweetsBox.innerHTML = '';
      }
    }

    function buildBoard(o) {
      if (board) { board.destroy(); board = null; }
      board = makeChocBar(boardHost, {
        startDenom: o.startDenom,
        lockDenom: o.lockDenom,
        candyPerPiece: o.candyPerPiece || 0,
        onChange(st) { if (!alive) return; paintFrac(st); paintSweets(st); },
      });
      paintFrac(board.state());
      paintSweets(board.state());
    }

    function start(i) {
      mi = i;
      attempts = 0;
      winBox.innerHTML = '';
      paintChips();
      const sandbox = i === MISSIONS.length;
      mission = sandbox ? null : MISSIONS[i];
      const locked = !!mission && mission.type === 'amount';
      dm.disabled = locked; dp.disabled = locked;
      dm.style.opacity = locked ? '.35' : ''; dp.style.opacity = locked ? '.35' : '';
      if (sandbox) {
        commitBtn.style.display = 'none';
        q.textContent = 'Free play — turn the dial, tap your pieces!';
        qsub.textContent = 'Watch the fraction build itself: bottom = pieces, top = taken.';
        buildBoard({ startDenom: 2, lockDenom: false, candyPerPiece: 0 });
        return;
      }
      commitBtn.style.display = '';
      commitBtn.textContent = mission.type === 'twin' ? 'TWIN CHECK 🔍' : 'LOCK IT IN 💨';
      q.innerHTML = mission.stem;
      qsub.textContent = mission.type === 'amount'
        ? `The dial's locked at ${mission.denom} for this one — just tap your pieces!`
        : mission.type === 'twin'
          ? 'Turn the dial and tap a piece, then press TWIN CHECK.'
          : 'Turn the dial to set the bottom number, then tap pieces for the top.';
      buildBoard({
        startDenom: mission.type === 'amount' ? mission.denom : 2,
        lockDenom: locked,
        candyPerPiece: mission.type === 'amount' ? mission.amount / mission.denom : 0,
      });
    }

    function markDone(m, st) {
      doneSet.add(m.id);
      paintChips();
      winBox.innerHTML = '';
      const w = el('div', 'fsb-win',
        `<div class="fw-p">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]} — <b>${st.taken}/${st.denom}</b></div>`
        + `<div class="fw-k">${m.worked}</div>`);
      winBox.append(w);
      const nextIdx = MISSIONS.findIndex((x) => !doneSet.has(x.id));
      const btn = el('button', 'btn btn-gold', nextIdx !== -1 ? 'NEXT ONE ➡' : 'FREE PLAY 🕹️');
      btn.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
      btn.addEventListener('click', () => { sfx.ui(); start(nextIdx !== -1 ? nextIdx : MISSIONS.length); });
      w.append(btn);
      if (doneSet.size === MISSIONS.length) ctx.complete();
    }

    function win(st) {
      sfx.win();
      party(stage);
      markDone(mission, st);
    }

    dm.addEventListener('click', () => board && board.nudge(-1));
    dp.addEventListener('click', () => board && board.nudge(1));
    resetBtn.addEventListener('click', () => { if (board) board.reset(); attempts = 0; });

    commitBtn.addEventListener('click', () => {
      if (!board || board.busy() || !mission) return;
      sfx.ui();
      const st = board.state();
      if (mission.type === 'twin') {
        if (st.denom === mission.denom && st.taken === mission.taken) {
          board.showGhost(mission.ghostDenom);
          sfx.sparkle();
          sparkleBurst(stage, stage.clientWidth / 2, 170);
          later(() => {
            bubble(stage, {
              title: 'TWIN FOUND! 👯',
              text: `<b>${mission.taken}/${mission.denom}</b> and <b>${mission.ghostTaken}/${mission.ghostDenom}</b> shade the exact same chocolate! ${mission.worked}`,
              img: HALFBOTTOM_IMG,
            }).then(() => { if (!alive) return; sfx.win(); party(stage); markDone(mission, st); });
          }, 500);
        } else {
          sfx.nudge();
          bubble(stage, {
            title: 'BUILD ½ FIRST',
            text: 'Turn the dial to <b>2</b> and tap <b>1</b> piece to build ½ — then press TWIN CHECK!',
            img: HALFBOTTOM_IMG,
          });
        }
        return;
      }
      if (st.denom === mission.denom && st.taken === mission.taken) { win(st); return; }
      attempts += 1;
      sfx.nudge();
      let text;
      if (mission.type === 'amount') {
        const got = sweetsFor(mission.amount, st.denom, st.taken);
        text = `You’ve taken <b>${st.taken}</b> slice${st.taken === 1 ? '' : 's'} so far — that’s <b>${got}</b> sweets. We need <b>${mission.taken}</b> slices for <b>${mission.taken}/${mission.denom}</b>.`;
      } else if (st.denom !== mission.denom) {
        text = `Turn the dial first — it's cut into <b>${st.denom}</b> right now, but we need <b>${mission.denom}</b> equal pieces.`;
      } else if (st.taken === 0) {
        text = `The bottom's set right! Now tap <b>${mission.taken}</b> piece${mission.taken === 1 ? '' : 's'} to build the top number.`;
      } else {
        text = `The bottom's cut right! But you've taken <b>${st.taken}</b> piece${st.taken === 1 ? '' : 's'} — we need <b>${mission.taken}</b>.`;
      }
      if (attempts >= 2) text += `<br><br>🍫 Psst: turn the dial to <b>${mission.denom}</b> and take <b>${mission.taken}</b> piece${mission.taken === 1 ? '' : 's'}.`;
      bubble(stage, { title: 'KEEP SLICING! 💪', text, img: HALFBOTTOM_IMG });
    });

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
