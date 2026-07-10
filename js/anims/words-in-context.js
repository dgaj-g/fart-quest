// FART QUEST — js/anims/words-in-context.js
// THE SWAP-IN SOCKET — interactive vocabulary-in-context machine for the
// words-in-context Scout Report (Storybog / Synonym Sinead). The mystery
// word glows in a socket inside its sentence; the child drags a candidate
// meaning-plug in, the sentence visibly rebuilds itself with the swap
// inserted, and only the meaning that survives the whole sentence seats
// with a CLUNK — a bad swap sparks and ejects back to the tray. The trap
// plug in every mission is always the word's most FAMOUS meaning, straight
// from the topic file's own "Aha".

import { el, sfx, tween, makeDrag, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const SINEAD_IMG = 'assets/monsters/synonym-sinead.png';
const RULE = 'Swap each option INTO the sentence and read it aloud — only the true meaning survives the swap.';
const TAGLINE = 'The dictionary meaning you know best is often a trap hiding in this very sentence.';

const FLY_MS = 220;
const DWELL_MS = 750;
const SPARK_MS = 520;
const EJECT_MS = 260;

/* ---------- pure helper ---------- */
function fisherYates(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- content — every mission is a sentence split around ONE target
   word, plus its meaning-plugs. Exactly one plug per mission has
   correct:true (checked in a /tmp scratch script). The `famous` flag marks
   the word's most well-known dictionary meaning — the trap the brief
   promises will always spark in THIS sentence. `why` is shown only once the
   sentence has actually been rebuilt with that exact plug, so the quote in
   the feedback always matches what's on screen. ---------- */
const MISSIONS = [
  {
    id: 'sharp', word: 'sharp',
    before: 'The pain in his ankle was ', after: '.',
    plugs: [
      { id: 'clever', text: 'clever', correct: false, famous: false,
        why: 'Can pain be CLEVER? That means quick-thinking — and pain doesn’t have a mind of its own!' },
      { id: 'sudden', text: 'sudden and intense', correct: true },
      { id: 'pointy', text: 'pointy, like a knife-edge', correct: false, famous: true,
        why: 'Remember the chef’s knife? “Good at cutting” is the meaning most people think of first for sharp — but pain has no blade and no edge. It doesn’t survive the swap here.' },
    ],
    worked: '“sharp” here means sudden and intense — not clever (pain can’t think) and not pointy (pain has no edge). Only the true meaning survives the swap.',
  },
  {
    id: 'rose', word: 'rose',
    before: 'When her name was called, Aoife ', after: ' to answer the question.',
    plugs: [
      { id: 'flower', text: 'a red flower with thorns', correct: false, famous: true,
        why: 'A red flower with thorns is the meaning most people think of first for rose — but Aoife is a person, not a plant!' },
      { id: 'stood', text: 'stood up from her seat', correct: true },
      { id: 'increased', text: 'increased or went up', correct: false, famous: false,
        why: 'That fits prices or temperatures going up, not a person standing up from her chair.' },
    ],
    worked: '“rose” here means stood up from her seat — not a flower, and nothing is increasing. Only the true meaning survives the swap.',
  },
  {
    id: 'rigid', word: 'rigid',
    before: 'By morning the window was ', after: ' with frost.',
    plugs: [
      { id: 'strict', text: 'strict and following the rules without exception', correct: false, famous: true,
        why: '“Strict, following the rules” is the meaning most people think of first for rigid — that’s rigid RULES. But a window can’t follow rules!' },
      { id: 'stiff', text: 'stiff and unable to bend', correct: true },
      { id: 'cold', text: 'freezing cold to touch', correct: false, famous: false,
        why: 'Close — but that describes the FROST, not what RIGID means. Rigid is about bending, not temperature.' },
    ],
    worked: '“rigid” here means stiff and unable to bend — not strict (that’s rigid rules) and not just cold (that’s the frost). Only the true meaning survives the swap.',
  },
  {
    id: 'setback', word: 'setback',
    before: 'The ', after: ' cost them the match.',
    plugs: [
      { id: 'equipment', text: 'piece of broken sports equipment', correct: false, famous: true,
        why: 'Your brain jumps to something breaking — but nothing in the sentence says any equipment broke at all.' },
      { id: 'problem', text: 'problem or difficulty that gets in your way', correct: true },
      { id: 'victory', text: 'fantastic victory', correct: false, famous: false,
        why: 'That’s the OPPOSITE of a setback — a fantastic victory wouldn’t COST them the match!' },
    ],
    worked: '“setback” here means a problem or difficulty that gets in your way — nothing broke, and it’s certainly not a victory. Only the true meaning survives the swap.',
  },
];

/* ---------- the swap-in socket board (one mission's worth) ---------- */
function makeBoard(host, mission, opts) {
  let boardAlive = true;
  let busy = false;
  let solved = false;
  let pendingTimer = null;
  const blater = (fn, ms) => {
    pendingTimer = setTimeout(() => { pendingTimer = null; if (boardAlive) fn(); }, ms);
    return pendingTimer;
  };

  const field = el('div', 'sis-field');
  const sentence = el('div', 'sis-sentence');
  sentence.append(document.createTextNode(mission.before));
  const socket = el('span', 'sis-socket sis-idle');
  const wordSpan = el('span', 'sis-word', mission.word);
  const badge = el('span', 'sis-badge', '\u{1F50C}');
  socket.append(wordSpan, badge);
  sentence.append(socket);
  sentence.append(document.createTextNode(mission.after));
  const trayRow = el('div', 'sis-tray');
  field.append(sentence, trayRow);
  host.append(field);

  function setSocketState(cls, text, badgeEmoji) {
    socket.classList.remove('sis-idle', 'sis-testing', 'sis-correct', 'sis-wrong');
    socket.classList.add(cls);
    wordSpan.textContent = text;
    badge.textContent = badgeEmoji || '';
  }

  function fieldRect() { return field.getBoundingClientRect(); }
  function overSocket(x, y) {
    const fr = fieldRect();
    const r = socket.getBoundingClientRect();
    const pad = 16;
    const lx = r.left - fr.left - pad; const ty = r.top - fr.top - pad;
    const rx = r.right - fr.left + pad; const by = r.bottom - fr.top + pad;
    return x >= lx && x <= rx && y >= ty && y <= by;
  }

  // FLIP-style pre-measure: reinsert into the tray to see where it will
  // actually rest once it reflows, then pull it back out before painting.
  function measureTrayRest(plug) {
    const saved = plug.el.style.cssText;
    plug.el.style.cssText = '';
    trayRow.appendChild(plug.el);
    const r = plug.el.getBoundingClientRect();
    const fr = fieldRect();
    const pos = { x: r.left - fr.left, y: r.top - fr.top };
    field.appendChild(plug.el);
    plug.el.style.cssText = saved;
    return pos;
  }

  function returnToTray(plug, curLeft, curTop) {
    const rest = measureTrayRest(plug);
    plug.cancelTween = tween((t) => {
      plug.el.style.left = (curLeft + (rest.x - curLeft) * t) + 'px';
      plug.el.style.top = (curTop + (rest.y - curTop) * t) + 'px';
    }, 0, 1, EJECT_MS, () => {
      plug.cancelTween = null;
      if (!boardAlive) return;
      plug.status = 'tray';
      plug.el.classList.remove('sis-flying');
      plug.el.style.cssText = '';
      trayRow.appendChild(plug.el);
    });
  }

  function resolveTest(plug) {
    if (!boardAlive) return;
    if (plug.correct) {
      setSocketState('sis-correct', plug.text, '✅');
      sfx.drop(); sfx.sparkle();
      const sr = socket.getBoundingClientRect(); const fr = fieldRect();
      sparkleBurst(field, sr.left - fr.left + sr.width / 2, sr.top - fr.top + sr.height / 2, 10);
      plug.status = 'seated';
      plug.el.remove();
      solved = true;
      Object.values(plugMap).forEach((p) => { if (p !== plug && p.el.isConnected) p.el.remove(); });
      busy = false;
      blater(() => { if (boardAlive) opts.onSolved(); }, 450);
    } else {
      setSocketState('sis-wrong', plug.text, '⚡');
      sfx.nudge();
      blater(() => {
        if (!boardAlive) return;
        // Keep the socket + rejected plug exactly as shown (sis-wrong,
        // plug.text still seated) until the explanation bubble — which
        // quotes this exact swapped sentence — has been read and dismissed.
        // Reverting to idle / ejecting the plug here would let the bubble
        // quote a sentence the board is no longer displaying (Rule 2).
        opts.onWrong(mission, plug, () => {
          if (!boardAlive) return;
          setSocketState('sis-idle', mission.word, '\u{1F50C}');
          // A relayout during the (now longer, bubble-gated) wait can have
          // already forced this plug back into the tray via layout()'s own
          // "abandon live tween" path — only fly it home if that hasn't
          // happened, so we don't double-return the same plug.
          if (plug.status === 'testing') {
            plug.el.style.opacity = '1';
            returnToTray(plug, plug.curX, plug.curY);
          }
          Object.values(plugMap).forEach((p) => p.el.classList.remove('sis-locked'));
          busy = false;
        });
      }, SPARK_MS);
    }
  }

  function testPlug(plug, curLeft, curTop) {
    busy = true;
    Object.values(plugMap).forEach((p) => { if (p !== plug) p.el.classList.add('sis-locked'); });
    const sr = socket.getBoundingClientRect(); const fr = fieldRect();
    const targetX = sr.left - fr.left + sr.width / 2 - plug.w / 2;
    const targetY = sr.top - fr.top + sr.height / 2 - plug.h / 2;
    plug.status = 'testing';
    plug.cancelTween = tween((t) => {
      plug.el.style.left = (curLeft + (targetX - curLeft) * t) + 'px';
      plug.el.style.top = (curTop + (targetY - curTop) * t) + 'px';
    }, 0, 1, FLY_MS, () => {
      plug.cancelTween = null;
      if (!boardAlive) return;
      plug.curX = targetX; plug.curY = targetY;
      plug.el.style.opacity = '0';
      setSocketState('sis-testing', plug.text, '');
      sfx.blip(560, 0.09, 0.12);
      blater(() => resolveTest(plug), DWELL_MS);
    });
  }

  const order = fisherYates(mission.plugs);
  const plugMap = {};
  order.forEach((p) => {
    const pEl = el('div', 'sis-plug', '\u{1F50C} ' + p.text);
    trayRow.append(pEl);
    plugMap[p.id] = {
      ...p, el: pEl, status: 'tray', cancelTween: null, drag: null,
      w: 0, h: 0, origLeft: 0, origTop: 0, curX: 0, curY: 0,
    };
  });
  Object.values(plugMap).forEach((plug) => {
    plug.drag = makeDrag(plug.el, {
      enabled: () => boardAlive && !busy && plug.status === 'tray',
      onStart() {
        if (plug.cancelTween) { plug.cancelTween(); plug.cancelTween = null; }
        const fr = fieldRect();
        const r = plug.el.getBoundingClientRect();
        plug.origLeft = r.left - fr.left; plug.origTop = r.top - fr.top;
        plug.w = r.width; plug.h = r.height;
        plug.el.style.width = plug.w + 'px'; plug.el.style.height = plug.h + 'px';
        plug.el.style.position = 'absolute';
        plug.el.style.left = plug.origLeft + 'px'; plug.el.style.top = plug.origTop + 'px';
        plug.el.style.zIndex = 50;
        field.appendChild(plug.el);
        plug.el.classList.add('sis-flying');
        plug.status = 'flying';
      },
      onMove(dx, dy) {
        const left = plug.origLeft + dx; const top = plug.origTop + dy;
        plug.el.style.left = left + 'px'; plug.el.style.top = top + 'px';
        socket.classList.toggle('sis-hover', overSocket(left + plug.w / 2, top + plug.h / 2));
      },
      onEnd(dx, dy) {
        const left = plug.origLeft + dx; const top = plug.origTop + dy;
        const hit = overSocket(left + plug.w / 2, top + plug.h / 2);
        socket.classList.remove('sis-hover');
        if (hit && !busy && plug.status === 'flying') testPlug(plug, left, top);
        else if (plug.status === 'flying') returnToTray(plug, left, top);
      },
    });
  });

  return {
    layout() {
      // relayout abandons any live flight/test — snap everything back to a
      // clean idle state rather than guess where an animation was heading
      if (pendingTimer) { clearTimeout(pendingTimer); pendingTimer = null; }
      busy = false;
      socket.classList.remove('sis-hover');
      Object.values(plugMap).forEach((p) => {
        if (p.drag) p.drag.abort();
        if (p.cancelTween) { p.cancelTween(); p.cancelTween = null; }
        if (p.status !== 'seated') {
          p.status = 'tray';
          p.el.classList.remove('sis-flying', 'sis-locked');
          p.el.style.cssText = '';
          trayRow.appendChild(p.el);
        }
      });
      if (!solved) setSocketState('sis-idle', mission.word, '\u{1F50C}');
    },
    destroy() {
      boardAlive = false;
      if (pendingTimer) clearTimeout(pendingTimer);
      Object.values(plugMap).forEach((p) => {
        if (p.cancelTween) p.cancelTween();
        if (p.drag) p.drag.destroy();
      });
      field.remove();
    },
  };
}

const CSS = `
.sis-qsub { text-align:center; font-size:12.5px; color:#6b5744; font-weight:500; margin-bottom:14px; max-width:560px; margin-left:auto; margin-right:auto; }
.sis-field { position:relative; }
.sis-sentence { font-size:clamp(17px,2.6vw,22px); font-weight:600; line-height:1.6; text-align:center; max-width:640px; margin:0 auto 20px; color:var(--ink); }
.sis-socket { display:inline-flex; position:relative; align-items:center; gap:5px; padding:3px 13px; border-radius:11px; font-weight:800; margin:0 2px; transition: background .25s, color .25s; }
.sis-word { }
.sis-badge { font-size:13px; }
.sis-socket.sis-idle { background: rgba(244,197,66,.24); color:var(--gold-deep); box-shadow:0 0 0 3px rgba(244,197,66,.4) inset; animation: sisGlow 1.6s ease-in-out infinite; }
.sis-socket.sis-hover { background: rgba(155,89,208,.3); box-shadow:0 0 0 3px rgba(155,89,208,.5) inset; animation:none; }
.sis-socket.sis-testing { background:#fff; color:var(--ink); box-shadow:0 0 0 3px rgba(51,38,29,.28) inset; animation: sisPulse .5s ease-in-out infinite; }
.sis-socket.sis-correct { background: rgba(46,204,113,.22); color:#1d8f4e; box-shadow:0 0 0 3px rgba(46,204,113,.5) inset; animation: sisClunk .4s var(--spring); }
.sis-socket.sis-wrong { background: rgba(231,76,60,.24); color:#a53125; box-shadow:0 0 0 3px rgba(231,76,60,.4) inset; animation: sisSpark .48s ease; }
@keyframes sisGlow { 0%,100% { box-shadow:0 0 0 3px rgba(244,197,66,.4) inset; } 50% { box-shadow:0 0 0 7px rgba(244,197,66,.6) inset; } }
@keyframes sisPulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.045); } }
@keyframes sisClunk { 0% { transform:scale(1.28); } 60% { transform:scale(.93); } 100% { transform:scale(1); } }
@keyframes sisSpark { 0%,100% { transform: translateX(0) rotate(0); } 20% { transform: translateX(-6px) rotate(-3deg); } 45% { transform: translateX(6px) rotate(3deg); } 70% { transform: translateX(-4px) rotate(-2deg); } }
.sis-tray { display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-top:6px; min-height:54px; }
.sis-plug {
  display:inline-flex; align-items:center; gap:6px; padding:11px 16px; background:#fff;
  border:3px solid var(--ink); border-radius:999px; font-weight:700; font-size:14.5px; color:var(--ink);
  box-shadow:0 3px 0 rgba(51,38,29,.3); cursor:grab; touch-action:none;
  -webkit-user-select:none; user-select:none;
}
.sis-plug.sis-flying { cursor:grabbing; box-shadow:0 9px 16px rgba(0,0,0,.35); }
.sis-plug.sis-locked { opacity:.4; pointer-events:none; }
.sis-win {
  margin-top:14px; text-align:center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF);
  border:3px solid var(--correct); border-radius:14px; padding:10px 14px;
  animation: animBubbleIn .34s var(--spring) both;
}
.sis-wp { font-weight:700; color:#1d8f4e; font-size:16px; }
.sis-wk { font-size:13.5px; color:#4d6b58; font-weight:500; margin-top:2px; }
.sis-rulecard {
  margin-top:12px; font-size:13.5px; line-height:1.35; background: linear-gradient(180deg,#FFF3CE,#FBE29A);
  border:3px solid var(--gold-deep); border-radius:14px; padding:10px 14px; color:#5a4408;
  font-weight:700; max-width:980px; margin-left:auto; margin-right:auto;
}
`;

/* ---------- the anim card ---------- */
export default {
  id: 'words-in-context',
  title: 'THE SWAP-IN SOCKET',

  mount(host, ctx) {
    let alive = true;
    let board = null;
    let mi = 0;
    let gen = 0;
    let ahaShown = false;
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    injectCss('words-in-context', CSS);

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const qsub = el('div', 'sis-qsub', 'Drag a plug into the glowing socket. The sentence rebuilds itself — read the WHOLE thing before you judge it.');
    const boardHost = el('div');
    const winBox = el('div');
    stage.append(chiprow, qsub, boardHost, winBox);
    host.append(stage);

    const ruleCard = el('div', 'sis-rulecard', RULE);
    host.append(ruleCard);

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), m.word.toUpperCase());
        c.addEventListener('click', () => { sfx.ui(); startMission(i); });
        chiprow.append(c);
      });
    }

    function destroyBoard() { if (board) { board.destroy(); board = null; } }

    function startMission(i) {
      mi = i;
      gen += 1;
      const mission = MISSIONS[i];
      winBox.innerHTML = '';
      destroyBoard();
      paintChips();
      const myGen = gen;
      board = makeBoard(boardHost, mission, {
        onSolved() { win(mission); },
        onWrong(m, plug, revert) { showWrong(m, plug, revert, myGen); },
      });
    }

    function showWrong(mission, plug, revert, myGen) {
      const swapped = `${mission.before}${plug.text}${mission.after}`;
      later(() => {
        // The mission-select chips stay clickable during this short window
        // (the full-stage veil only appears once the bubble itself opens),
        // so guard against a chip-tap having already switched to a
        // different mission — showing this swap's feedback over a board
        // that's moved on would quote a sentence that's no longer displayed.
        if (!alive || myGen !== gen) return;
        bubble(stage, {
          title: plug.famous ? 'THE FAMOUS TRAP! ⭐' : 'SPARKED! ⚡',
          text: `“${swapped}” — ${plug.why}`,
          img: SINEAD_IMG,
        }).then(() => { if (alive && myGen === gen) revert(); });
      }, 80);
    }

    function win(mission) {
      doneSet.add(mission.id);
      sfx.win(); party(stage);
      paintChips();
      winBox.innerHTML = '';
      const w = el('div', 'sis-win',
        `<div class="sis-wp">CLUNK! SEATED PERFECTLY! \u{1F50C}</div><div class="sis-wk">${mission.worked}</div>`);
      winBox.append(w);
      const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
      if (nextIdx !== -1) {
        const nb = el('button', 'btn btn-gold', 'NEXT ONE ➡');
        nb.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
        nb.addEventListener('click', () => { sfx.ui(); startMission(nextIdx); });
        w.append(nb);
      }
      if (doneSet.size === MISSIONS.length) {
        ctx.complete();
        if (!ahaShown) {
          ahaShown = true;
          later(() => {
            if (!alive) return;
            bubble(stage, { title: 'SWAP-IN MASTER! \u{1F50C}', text: `${TAGLINE} Always swap it INTO the sentence and let the sentence judge.`, img: SINEAD_IMG });
          }, 700);
        }
      }
    }

    const onResize = () => { if (board) board.layout(); };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    startMission(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      destroyBoard();
      stage.remove();
      ruleCard.remove();
    };
  },
};
