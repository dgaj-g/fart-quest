// FART QUEST — js/anims/commas-colons.js
// THE COMMA CHAMELEON HUNT — interactive punctuation animation for the
// commas-colons Scout Report. Commas are live chameleons in camouflage;
// the child taps the gap between words where a pause should hide. The
// colon is a different creature (the Colon Twins) dragged into place.

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const CHAM_IMG = 'assets/monsters/comma-chameleon.png';
const RULE = "A comma is a small pause that keeps a list or a sentence tidy; a colon announces what's coming.";

/* ---------- pure hunt engine (tested standalone, do not "improve" casually) ---------- */
function words(s) { return s.split(' '); }

const MISSIONS = [
  {
    id: 'm1', kind: 'gap',
    words: words('Whiffbeard packed a peg a torch and his pride'),
    correctGaps: [3], decoyGap: 5,
    label: 'Peg Hunt',
    qsub: 'One chameleon is camouflaged in this list. Tap between two words to check for him.',
    worked: '"a peg, <b>a torch</b> and his pride" — a pause after "peg", but never a pause right before the final "and".',
  },
  {
    id: 'm2', kind: 'gap',
    words: words('The recipe needs eggs flour sugar and one brave frog'),
    correctGaps: [3, 4], decoyGap: 5,
    label: 'Recipe Hunt',
    qsub: 'Two chameleons are hiding in this list — find them both.',
    worked: '"eggs, flour, sugar and one brave frog" — a pause after "eggs" AND after "flour", but none right before "and".',
  },
  {
    id: 'm3', kind: 'gap',
    words: words('After tea Jarlath trained his goose'),
    correctGaps: [1], decoyGap: null,
    label: 'Fronted Opener',
    qsub: 'This sentence opens with a scene-setter. Find where its one pause hides.',
    worked: '"After tea" sets the scene before the main action — the pause comes right after it, before "Jarlath".',
  },
  {
    id: 'm4', kind: 'colon',
    head: words('Bring these'), tail: 'rope, boots and courage',
    correctGapAfter: 1, wrongGapAfter: 0,
    label: 'Colon Twins',
    qsub: 'Drag the Colon Twins to the spot where they can announce the list — but they only stick after a COMPLETE sentence.',
    worked: '"Bring these" is a whole sentence on its own, so the colon can stand at its door: "Bring these: rope, boots and courage."',
  },
];

function classifyGap(mission, gapIndex, foundSet) {
  if (foundSet.has(gapIndex)) return 'already';
  if (mission.correctGaps.includes(gapIndex)) return 'correct';
  if (mission.decoyGap === gapIndex) return 'decoy';
  return 'wrong';
}
function isGapMissionComplete(mission, foundSet) {
  return mission.correctGaps.every((g) => foundSet.has(g)) && foundSet.size === mission.correctGaps.length;
}
function nearestUnfoundCorrectGap(mission, foundSet, tappedGap) {
  const remaining = mission.correctGaps.filter((g) => !foundSet.has(g));
  if (!remaining.length) return null;
  let best = remaining[0]; let bestD = Math.abs(remaining[0] - tappedGap);
  for (const g of remaining) {
    const d = Math.abs(g - tappedGap);
    if (d < bestD) { best = g; bestD = d; }
  }
  return best;
}
function classifyColonDrop(mission, matchedPad) {
  if (matchedPad === null) return 'none';
  if (matchedPad === mission.correctGapAfter) return 'correct';
  if (matchedPad === mission.wrongGapAfter) return 'wrong';
  return 'none';
}

/* ---------- CSS (prefix cch-) ---------- */
const CSS = `
.cch-q { text-align:center; font-weight:700; font-size:14px; color:#6b5744; margin-bottom:2px; }
.cch-sentence {
  position: relative; display:flex; flex-wrap:wrap; align-items:center; justify-content:center;
  gap:3px 0; font-size: clamp(17px, 2.9vw, 23px); font-weight:700; color: var(--ink);
  line-height: 2.3; padding: 18px 10px; background: linear-gradient(180deg,#eef7e2,#e2f0cd);
  border-radius: 16px; box-shadow: inset 0 3px 8px rgba(51,38,29,.12); touch-action: pan-y;
}
.cch-word { padding: 2px 3px; }
.cch-gap {
  position: relative; display:inline-flex; align-items:center; justify-content:center;
  width: 44px; height: 44px; margin: 0 -11px; cursor: pointer; border: none; background: transparent;
  border-radius: 8px; vertical-align: middle; padding: 0;
}
.cch-gap:active { background: rgba(51,38,29,.08); }
.cch-gap.found { cursor: default; }
.cch-gap .cch-mark {
  font-size: 26px; font-weight: 900; color: var(--gold-deep); line-height: 1;
  text-shadow: 0 1px 0 rgba(0,0,0,.15); animation: cchIn .42s var(--spring) both;
}
.cch-gap .cch-cham { font-size: 17px; animation: cchIn .32s ease both; }
@keyframes cchIn { 0% { opacity:0; transform: scale(.3) rotate(-18deg); } 60% { opacity:1; transform: scale(1.25) rotate(8deg); } 100% { opacity:1; transform: scale(1) rotate(0); } }
.cch-decoy-face { position:absolute; top:-6px; font-size:18px; animation: cchShake .5s ease both; pointer-events:none; }
@keyframes cchShake { 0%,100% { transform: rotate(0); } 20% { transform: rotate(-20deg); } 40% { transform: rotate(16deg); } 60% { transform: rotate(-12deg); } 80% { transform: rotate(6deg); } }
.cch-rustle { position:absolute; top:2px; font-size:14px; animation: cchRustle .4s ease both; pointer-events:none; }
@keyframes cchRustle { 0%,100% { transform: translateX(0) rotate(0); opacity: .9; } 25% { transform: translateX(-4px) rotate(-8deg); } 75% { transform: translateX(4px) rotate(8deg); opacity: .9; } }
.cch-scurry { position:absolute; top:-4px; left:50%; font-size:15px; pointer-events:none; animation: cchScurry .5s ease-out both; }
@keyframes cchScurry { 0% { opacity:0; transform: translate(-50%,0) scale(.6); } 20% { opacity:1; } 100% { opacity:0; transform: translate(calc(-50% + var(--sx,0px)), -8px) scale(.85); } }
.cch-tail { padding: 2px 3px; color: var(--ink); }
.cch-pad {
  display:inline-flex; align-items:center; justify-content:center; width: 26px; height: 30px;
  margin: 0 1px; border-radius: 50%; border: 3px dashed rgba(155,89,208,.55);
  background: rgba(155,89,208,.08); vertical-align: middle;
}
.cch-pad.locked { border-style: solid; border-color: var(--gold-deep); background: rgba(244,197,66,.18); }
.cch-pad .cch-colonmark { font-size: 22px; font-weight: 900; color: var(--gold-deep); animation: cchIn .4s var(--spring) both; }
.cch-tray { position: relative; height: 74px; margin-top: 6px; }
.cch-colon {
  position: absolute; left: 50%; top: 8px; width: 46px; height: 58px; margin-left: -23px;
  cursor: grab; touch-action: none; animation: cchBob 2.1s ease-in-out infinite;
}
.cch-colon.dragging { animation: none; cursor: grabbing; z-index: 20; }
.cch-colon.locked { display: none; }
@keyframes cchBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
.cch-egg {
  position: absolute; left: 50%; width: 30px; height: 30px; margin-left: -15px; border-radius: 50%;
  background: linear-gradient(160deg,#FFF3D0,#F4C542); border: 3px solid var(--ink);
  box-shadow: 0 3px 0 rgba(217,162,27,.4);
}
.cch-egg.top { top: 0; }
.cch-egg.bot { top: 28px; }
.cch-egg .eye { position:absolute; top: 9px; left: 8px; width: 6px; height: 6px; border-radius: 50%; background: var(--ink); }
.cch-egg .eye + .eye { left: 17px; }
.cch-taghint { text-align:center; font-size: 12px; color:#7c6247; font-weight:600; margin-top: 6px; }
.cch-win {
  margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF);
  border: 3px solid var(--correct); border-radius: 14px; padding: 10px 14px;
  animation: animBubbleIn .34s var(--spring) both;
}
.cch-win .wp { font-weight: 700; color: #1d8f4e; font-size: 16px; }
.cch-win .wk { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 2px; }
.cch-rule {
  margin-top: 12px; font-size: 13.5px; line-height: 1.35; background: linear-gradient(180deg,#FFF3CE,#FBE29A);
  border: 3px solid var(--gold-deep); border-radius: 14px; padding: 10px 14px; color: #5a4408; font-weight: 700;
}
`;

/* ---------- the anim card ---------- */
export default {
  id: 'commas-colons',
  title: 'THE COMMA CHAMELEON HUNT',

  mount(host, ctx) {
    injectCss('commas-colons', CSS);
    let alive = true;
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'cch-q');
    const sentenceHost = el('div');
    const controls = el('div', 'anim-controls');
    const resetBtn = el('button', 'anim-ghostbtn', '↩ RESET HUNT');
    controls.append(resetBtn);
    const winBox = el('div');
    stage.append(chiprow, q, sentenceHost, controls, winBox);
    host.append(stage);
    const ruleCard = el('div', 'cch-rule', RULE);
    host.append(ruleCard);

    let mi = 0;
    let mission = null;
    let foundSet = new Set();
    let attempts = 0;
    let shownBubble = false;
    let colonBoard = null; // active drag rig for m4, so resize can abandon it
    let completed = false; // guards the closing trophy bubble + ctx.complete() from re-firing on replay

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), m.label);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
    }

    function start(i) {
      // Cancel any in-flight completion timer (700ms winGap / 500ms winColon,
      // or the decoy/leaf/scurry cosmetics) before switching — otherwise a
      // mission-switch tap during the delay lets a stale timer fire against
      // the NEWLY reassigned `mission`, falsely marking an untouched mission
      // done and showing its "CAUGHT HIM!" explanation for the wrong board.
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
      mi = i;
      mission = MISSIONS[i];
      foundSet = new Set();
      attempts = 0;
      shownBubble = false;
      winBox.innerHTML = '';
      if (colonBoard) { colonBoard.destroy(); colonBoard = null; }
      paintChips();
      q.textContent = mission.qsub;
      if (mission.kind === 'gap') buildGapSentence(); else buildColonSentence();
    }

    /* ---------- gap-tap missions (m1–m3) ---------- */
    // Rebuilding must preserve already-found commas (resize must not undo progress).
    function buildGapSentence() {
      sentenceHost.innerHTML = '';
      const wrap = el('div', 'cch-sentence');
      mission.words.forEach((w, i) => {
        wrap.append(el('span', 'cch-word', w));
        if (i < mission.words.length - 1) {
          const gap = el('button', 'cch-gap');
          gap.dataset.gap = String(i);
          if (foundSet.has(i)) {
            gap.classList.add('found');
            gap.append(el('span', 'cch-mark', ','));
          } else {
            gap.addEventListener('click', () => onGapTap(gap, i));
          }
          wrap.append(gap);
        }
      });
      sentenceHost.append(wrap);
    }

    function gapPos(wrap, gapEl) {
      const wr = wrap.getBoundingClientRect(); const gr = gapEl.getBoundingClientRect();
      return { x: gr.left - wr.left + gr.width / 2, y: gr.top - wr.top };
    }

    function onGapTap(gapEl, gapIndex) {
      if (!alive || mission.kind !== 'gap') return;
      const wrap = gapEl.closest('.cch-sentence');
      const status = classifyGap(mission, gapIndex, foundSet);
      if (status === 'already') return;
      if (status === 'correct') {
        foundSet.add(gapIndex);
        gapEl.classList.add('found');
        const cham = el('span', 'cch-cham', '🦎');
        gapEl.append(cham);
        sfx.pop();
        later(() => {
          if (!alive || !gapEl.isConnected) return;
          cham.remove();
          gapEl.append(el('span', 'cch-mark', ','));
          sfx.sparkle();
          const p = gapPos(wrap, gapEl);
          sparkleBurst(wrap, p.x, p.y);
        }, 420);
        toast(stage, foundSet.size === 1 && mission.correctGaps.length > 1
          ? 'Got him! One more chameleon still hiding. 🦎'
          : 'Got him! That pause was hiding right there. 🦎');
        if (isGapMissionComplete(mission, foundSet)) later(() => winGap(), 700);
        return;
      }
      attempts += 1;
      if (status === 'decoy') {
        const face = el('span', 'cch-decoy-face', '🦎');
        gapEl.append(face);
        later(() => face.remove(), 520);
        sfx.nudge();
        if (!shownBubble) {
          shownBubble = true;
          bubble(stage, {
            title: 'NO PAUSE THERE! 🙅',
            text: 'The chameleon shakes his head — <b>no pause ever sits right before the final "and"</b> in a list. That gap looks tempting, but he refuses to hide there!',
            img: CHAM_IMG,
          });
        } else {
          toast(stage, 'He shakes his head — never a pause before the final "and"!');
        }
        return;
      }
      // wrong (non-decoy) gap
      const leaf = el('span', 'cch-rustle', '🍃');
      gapEl.append(leaf);
      later(() => leaf.remove(), 420);
      sfx.nudge();
      const target = nearestUnfoundCorrectGap(mission, foundSet, gapIndex);
      if (target !== null) {
        const gaps = wrap.querySelectorAll('.cch-gap');
        const targetEl = gaps[target];
        if (targetEl) {
          const dx = Math.max(-70, Math.min(70, gapPos(wrap, targetEl).x - gapPos(wrap, gapEl).x));
          const scurry = el('span', 'cch-scurry', '🦎');
          scurry.style.setProperty('--sx', dx + 'px');
          gapEl.append(scurry);
          later(() => scurry.remove(), 520);
        }
      }
      if (attempts >= 3) {
        toast(stage, mission.decoyGap != null
          ? 'Tip: read the list out loud — a pause comes after each item except right before the final "and".'
          : 'Tip: find exactly where the opening phrase ends, before the main action starts.', 3200);
      } else {
        toast(stage, 'Empty gap — nothing camouflaged here. Try another spot.');
      }
    }

    function winGap() {
      if (!alive) return;
      doneSet.add(mission.id);
      sfx.win();
      party(stage);
      paintChips();
      showWin();
    }

    /* ---------- colon-drag mission (m4) ---------- */
    function buildColonSentence() {
      sentenceHost.innerHTML = '';
      const wrap = el('div', 'cch-sentence');
      const pads = [];
      mission.head.forEach((w, i) => {
        wrap.append(el('span', 'cch-word', w));
        const pad = el('span', 'cch-pad');
        pad.dataset.pad = String(i);
        pads.push(pad);
        wrap.append(pad);
      });
      wrap.append(el('span', 'cch-tail', mission.tail));
      sentenceHost.append(wrap);
      const tray = el('div', 'cch-tray');
      const colon = el('div', 'cch-colon',
        '<div class="cch-egg top"><span class="eye"></span><span class="eye"></span></div><div class="cch-egg bot"></div>');
      tray.append(colon);
      sentenceHost.append(tray);
      sentenceHost.append(el('div', 'cch-taghint', 'Drag the Colon Twins ⬆ up to the sentence'));

      let dx = 0; let dy = 0; let locked = false; let cancelTween = null;
      const drag = makeDrag(colon, {
        enabled: () => !locked,
        onStart() {
          if (cancelTween) { cancelTween(); cancelTween = null; }
          colon.classList.add('dragging');
          sfx.whoosh();
        },
        onMove(mx, my) {
          dx = mx; dy = my;
          colon.style.transform = `translate(${dx}px, ${dy}px)`;
        },
        onEnd(mx, my, e) {
          // keep .dragging (disables the idle bob keyframe) until the settle
          // tween below finishes — otherwise the CSS animation and the JS
          // transform fight over the same property mid-flight.
          const px = e.clientX; const py = e.clientY;
          let matched = null;
          pads.forEach((pad, i) => {
            const r = pad.getBoundingClientRect();
            const pad16 = 18;
            if (px >= r.left - pad16 && px <= r.right + pad16 && py >= r.top - pad16 && py <= r.bottom + pad16) matched = i;
          });
          const result = classifyColonDrop(mission, matched);
          if (result === 'correct') {
            const cr = colon.getBoundingClientRect();
            const pr = pads[matched].getBoundingClientRect();
            const targetDx = dx + (pr.left + pr.width / 2) - (cr.left + cr.width / 2);
            const targetDy = dy + (pr.top + pr.height / 2) - (cr.top + cr.height / 2);
            cancelTween = tween((v) => {
              colon.style.transform = `translate(${dx + (targetDx - dx) * v}px, ${dy + (targetDy - dy) * v}px)`;
            }, 0, 1, 240, () => {
              cancelTween = null;
              locked = true;
              colon.classList.remove('dragging');
              colon.classList.add('locked');
              pads[matched].classList.add('locked');
              pads[matched].append(el('span', 'cch-colonmark', ':'));
              sfx.sparkle();
              const wr = wrap.getBoundingClientRect(); const pr2 = pads[matched].getBoundingClientRect();
              sparkleBurst(wrap, pr2.left - wr.left + pr2.width / 2, pr2.top - wr.top);
              later(() => winColon(), 500);
            });
            return;
          }
          if (result === 'wrong') {
            sfx.thud();
            attempts += 1;
            if (!shownBubble) {
              shownBubble = true;
              bubble(stage, {
                title: 'NOT FINISHED YET! 🚧',
                text: '"Bring" bounces the Colon Twins right off — it isn\'t a complete sentence on its own (bring WHAT?). A colon can only stand at the door of a sentence that already makes sense by itself.',
              });
            } else {
              toast(stage, '"Bring" alone isn\'t a finished sentence — the Twins won\'t stick there!');
            }
          } else {
            sfx.nudge();
          }
          cancelTween = tween((v) => {
            colon.style.transform = `translate(${dx * (1 - v)}px, ${dy * (1 - v)}px)`;
          }, 0, 1, 260, () => { cancelTween = null; dx = 0; dy = 0; colon.classList.remove('dragging'); });
        },
      });
      colonBoard = {
        destroy() { if (cancelTween) cancelTween(); drag.destroy(); },
        abandon() {
          if (cancelTween) { cancelTween(); cancelTween = null; }
          drag.abort();
          colon.classList.remove('dragging');
          dx = 0; dy = 0;
          colon.style.transform = 'translate(0,0)';
        },
      };
    }

    function winColon() {
      if (!alive) return;
      doneSet.add(mission.id);
      sfx.win();
      party(stage);
      paintChips();
      showWin();
    }

    function showWin() {
      winBox.innerHTML = '';
      const w = el('div', 'cch-win',
        `<div class="wp">CAUGHT HIM! 🦎✨</div><div class="wk">${mission.worked}</div>`);
      winBox.append(w);
      const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
      if (nextIdx !== -1) {
        const nb = el('button', 'btn btn-gold', 'NEXT ONE ➡');
        nb.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;min-height:44px;display:inline-flex;align-items:center;justify-content:center;';
        nb.addEventListener('click', () => { sfx.ui(); start(nextIdx); });
        w.append(nb);
      } else if (!completed) {
        completed = true;
        later(() => {
          if (!alive) return;
          bubble(stage, {
            title: 'THE CAVE IS CLEAR! 🏆',
            text: 'Commas are pauses you can SEE once you know where they hide — after every list item except the very last one before "and". And a colon only ever stands at the door of a COMPLETE sentence.',
            img: CHAM_IMG,
          });
        }, 300);
        ctx.complete();
      }
    }

    resetBtn.addEventListener('click', () => { sfx.ui(); start(mi); });

    const onResize = () => {
      if (colonBoard) colonBoard.abandon();
      if (mission && mission.kind === 'gap') buildGapSentence();
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
      if (colonBoard) colonBoard.destroy();
      stage.remove();
      ruleCard.remove();
    };
  },
};
