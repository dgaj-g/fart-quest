// FART QUEST — js/anims/between-lines.js
// NED'S CLUE SCALES — interactive inference machine for the between-lines
// Scout Report (Storybog / Nudge-Nudge Ned). A mini-scene sits above a
// balance scale; the child drags clue chips onto Ned's pan. Real clues nudge
// a feelings-dial; a single clue only ever leaves it leaning and jittery
// (Ned's lore: never trust one sniff) — it takes TWO clues that agree on the
// same feeling to lock it in. Claim chips built from "always / never /
// entirely" wording weigh nothing at all and float off the pan like
// balloons. Counting/lock logic proven in a /tmp scratch script (18 green
// assertions) before this file was written.

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const NED_IMG = 'assets/monsters/nudge-nudge-ned.png';
const RULE = "The text gives clues, not answers. Ask: what do these clues ADD UP to? Beware answers with 'always', 'never', 'entirely'.";

/* ---------- pure helper ---------- */
function fisherYates(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- the four feeling zones on the dial, left to right ---------- */
const ZONES = [
  { id: 'sad', label: 'SAD', emoji: '\u{1F622}', frac: 0.125, color: '#5B7FBD' },
  { id: 'angry', label: 'ANGRY', emoji: '\u{1F620}', frac: 0.375, color: '#E0654B' },
  { id: 'nervous', label: 'NERVOUS', emoji: '\u{1F62C}', frac: 0.625, color: '#9B59D0' },
  { id: 'excited', label: 'EXCITED', emoji: '\u{1F929}', frac: 0.875, color: '#2ecc71' },
];
const zoneById = Object.fromEntries(ZONES.map((z) => [z.id, z]));

/* ---------- content — three missions, each with a mini-scene, real clue
   chips (tagged with the zone they point to) and one claim chip (absolute
   wording, weighs nothing). Every real clue's text is a faithful paraphrase
   of its own numbered passage line, so the clue chip and the passage always
   agree. Exactly one zone in each mission can ever reach a count of two —
   proven in the scratch script — so the lock always resolves to the correct
   target, never a wrong feeling. ---------- */
const MISSIONS = [
  {
    id: 'match', title: 'THE BIG MATCH', target: 'nervous',
    passage: [
      'His hands would not stop moving, tapping out a rhythm on his knees.',
      'He checked his watch, then checked it again barely ten seconds later.',
      "He tried to tie his laces and got the knot muddled twice.",
      "When the whistle finally blew for warm-ups, he jumped as if he'd been stung.",
    ],
    clues: [
      { id: 'm1', text: 'Hands that would not stop moving.', zone: 'nervous', real: true, line: 1 },
      { id: 'm2', text: 'Checked his watch twice in ten seconds.', zone: 'nervous', real: true, line: 2 },
      { id: 'm3', text: 'Got the knot in his laces muddled — twice.', zone: 'nervous', real: true, line: 3 },
      { id: 'md', text: 'Michael is ALWAYS calm before a match.', real: false },
    ],
    worked: 'Two clues agreed — NERVOUS! However you got there, two separate details both pointed the same way — one clue could be a coincidence, but two that agree are a pattern.',
  },
  {
    id: 'birthday', title: "AOIFE'S BIRTHDAY MORNING", target: 'excited',
    passage: [
      "Aoife's eyes popped open before the birds had even started singing.",
      'She checked her birthday list for the ninth time that morning, though nothing on it had changed.',
      'She hummed under her breath pulling on her socks, then burst into full song halfway down the stairs.',
      'She hopped down two steps at a time, laughing as she nearly tripped over the dog.',
    ],
    clues: [
      { id: 'b1', text: 'Awake before the birds — eyes popped straight open.', zone: 'excited', real: true, line: 1 },
      { id: 'b2', text: 'Checked her list NINE times, though nothing had changed.', zone: 'excited', real: true, line: 2 },
      { id: 'b3', text: 'Humming, then bursting into full song on the stairs.', zone: 'excited', real: true, line: 3 },
      { id: 'bd', text: 'Aoife is ENTIRELY obsessed with birthdays, every single year.', real: false },
    ],
    worked: 'Two clues agreed — EXCITED! However you got there, two separate details both pointed the same way — energy bursting out before the day has even properly begun.',
  },
  {
    id: 'results', title: 'THE TEST RESULTS', target: 'nervous',
    passage: [
      'Ruby’s fists were clenched tight in her lap as she waited.',
      'Her eyes kept flicking to the classroom door, half-expecting bad news any second.',
      'Under the desk, her leg bounced in a fast, steady rhythm against the floor tiles.',
      'When Mr Byrne finally called her name, she nearly dropped her pencil case.',
    ],
    clues: [
      { id: 'r1', text: 'Fists clenched tight in her lap.', zone: 'angry', real: true, line: 1 },
      { id: 'r2', text: 'Eyes flicking to the door, half-expecting bad news.', zone: 'nervous', real: true, line: 2 },
      { id: 'r3', text: 'Leg bouncing fast under the desk.', zone: 'nervous', real: true, line: 3 },
      { id: 'rd', text: 'Ruby is NEVER nervous before a test.', real: false },
    ],
    worked: "Two clues agreed — NERVOUS! Clenched fists on their own could mean anger — but nerves clench fists too. It's the eyes on the door AND the bouncing leg, agreeing with each other, that sniff out the true feeling.",
  },
];

/* ---------- feedback copy, gated by exact state (rule 2) ---------- */
const MSG_ONE = "Just one clue — Ned's nose is twitching, but one sniff proves nothing. Find a clue that AGREES with it.";
const MSG_DISAGREE = "Those clues are pulling in different directions. Ned needs TWO that agree before he'll trust the dial.";
const MSG_CLAIM = "Too big a claim to weigh! 'Always', 'never' and 'entirely' float clean off Ned's pan.";

const FLY_MS = 260;
const KEEP_MS = 320;
const CLAIM_MS = 520;

/* ---------- one mission's scale + dial + tray ---------- */
function makeBoard(host, mission, opts) {
  let alive = true;
  let locked = false;
  let leanZone = null; // id of the zone the needle is currently leaning towards
  const counts = { sad: 0, angry: 0, nervous: 0, excited: 0 };
  const timers = new Set();
  const blater = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

  const field = el('div', 'ncs-field');
  const passageBox = el('div', 'ncs-passage',
    '<ol>' + mission.passage.map((l) => `<li>${l}</li>`).join('') + '</ol>');
  const scale = el('div', 'ncs-scale');
  const beam = el('div', 'ncs-beamicon', '⚖️');
  const pan = el('div', 'ncs-pan');
  const panHint = el('div', 'ncs-panhint', 'drop a clue here');
  const kept = el('div', 'ncs-kept');
  pan.append(panHint, kept);
  scale.append(beam, pan);
  const gauge = el('div', 'ncs-gauge');
  const track = el('div', 'ncs-track');
  const zoneEls = {};
  ZONES.forEach((z) => {
    const zd = el('div', 'ncs-zone', `<span class="nz-e">${z.emoji}</span><span class="nz-l">${z.label}</span>`);
    zd.style.left = ((z.frac - 0.125) * 100) + '%';
    track.append(zd);
    zoneEls[z.id] = zd;
  });
  const needleWrap = el('div', 'ncs-needle-wrap wobble');
  const needle = el('div', 'ncs-needle');
  needleWrap.append(needle);
  gauge.append(track, needleWrap);
  const trayRow = el('div', 'ncs-tray');
  field.append(passageBox, scale, gauge, trayRow);
  host.append(field);

  function fieldRect() { return field.getBoundingClientRect(); }
  function panHit(x, y) {
    const fr = fieldRect(); const r = pan.getBoundingClientRect(); const pad = 18;
    const lx = r.left - fr.left - pad; const ty = r.top - fr.top - pad;
    const rx = r.right - fr.left + pad; const by = r.bottom - fr.top + pad;
    return x >= lx && x <= rx && y >= ty && y <= by;
  }

  function needlePx(frac) {
    const w = track.clientWidth || 1;
    return frac * w;
  }
  function currentFrac() {
    if (locked) return zoneById[mission.target].frac;
    return leanZone ? zoneById[leanZone].frac : 0.5;
  }
  function positionNeedle(instant, cancelPrev) {
    const px = needlePx(currentFrac());
    if (cancelPrev && board.needleCancel) { board.needleCancel(); board.needleCancel = null; }
    if (instant) { needleWrap.style.left = px + 'px'; return; }
    const from = parseFloat(needleWrap.style.left) || needlePx(0.5);
    board.needleCancel = tween((v) => { needleWrap.style.left = v + 'px'; }, from, px, 380, () => { board.needleCancel = null; });
  }

  // FLIP-style: measure where a chip would rest inside a container once
  // reflowed, then pull it back out before painting — same trick used by
  // words-in-context for its tray.
  function measureRest(container, chipEl) {
    const saved = chipEl.style.cssText;
    chipEl.style.cssText = '';
    container.appendChild(chipEl);
    const r = chipEl.getBoundingClientRect();
    const fr = fieldRect();
    const pos = { x: r.left - fr.left, y: r.top - fr.top };
    field.appendChild(chipEl);
    chipEl.style.cssText = saved;
    return pos;
  }

  function returnToTray(chip, curLeft, curTop) {
    const rest = measureRest(trayRow, chip.el);
    chip.cancelTween = tween((t) => {
      chip.el.style.left = (curLeft + (rest.x - curLeft) * t) + 'px';
      chip.el.style.top = (curTop + (rest.y - curTop) * t) + 'px';
    }, 0, 1, FLY_MS, () => {
      chip.cancelTween = null;
      if (!alive) return;
      chip.status = 'tray';
      chip.el.classList.remove('ncs-flying');
      chip.el.style.cssText = '';
      trayRow.appendChild(chip.el);
    });
  }

  function bumpBeam() {
    beam.classList.remove('bump'); void beam.offsetWidth; beam.classList.add('bump');
  }

  function evaluateAfterDrop() {
    const zone = leanZone;
    if (counts[zone] === 2) {
      locked = true;
      needleWrap.classList.remove('wobble');
      positionNeedle(false, true);
      blater(() => {
        if (!alive) return;
        needleWrap.classList.add('locked');
        zoneEls[zone].classList.add('ncs-zone-locked');
        sfx.win();
        sparkleBurst(field, needlePx(zoneById[zone].frac) + track.getBoundingClientRect().left - fieldRect().left, gauge.getBoundingClientRect().top - fieldRect().top + 30);
        Object.values(chipMap).forEach((c) => {
          if (c.status === 'tray' || c.status === 'flying') { c.locked = true; c.el.classList.add('ncs-chip-spent'); }
        });
        opts.onLocked(mission, zone);
      }, 400);
      return;
    }
    const total = ZONES.reduce((s, z) => s + counts[z.id], 0);
    if (total === 1) opts.onFeedback('one');
    else opts.onFeedback('disagree');
  }

  function keepChip(chip, curLeft, curTop) {
    const rest = measureRest(kept, chip.el);
    kept.classList.add('has'); panHint.classList.add('hide');
    chip.cancelTween = tween((t) => {
      chip.el.style.left = (curLeft + (rest.x - curLeft) * t) + 'px';
      chip.el.style.top = (curTop + (rest.y - curTop) * t) + 'px';
    }, 0, 1, KEEP_MS, () => {
      chip.cancelTween = null;
      if (!alive) return;
      chip.status = 'kept';
      chip.el.classList.remove('ncs-flying');
      chip.el.classList.add('ncs-chip-kept');
      chip.el.style.cssText = '';
      kept.appendChild(chip.el);
      sfx.tick();
      bumpBeam();
      counts[chip.zone] += 1;
      leanZone = chip.zone;
      needleWrap.classList.remove('locked');
      positionNeedle(false, true);
      evaluateAfterDrop();
    });
  }

  function floatClaimAway(chip, curLeft, curTop) {
    chip.status = 'gone';
    chip.cancelTween = tween((t) => {
      chip.el.style.left = curLeft + 'px';
      chip.el.style.top = (curTop - t * 130) + 'px';
      chip.el.style.opacity = String(1 - t);
    }, 0, 1, CLAIM_MS, () => {
      chip.cancelTween = null;
      if (!alive) return;
      chip.el.remove();
      sfx.whoosh();
      opts.onFeedback('claim');
    });
  }

  const order = fisherYates(mission.clues);
  const chipMap = {};
  order.forEach((c) => {
    const pEl = el('div', 'ncs-chip', '\u{1F43D} ' + c.text);
    trayRow.append(pEl);
    chipMap[c.id] = { ...c, el: pEl, status: 'tray', cancelTween: null, locked: false, w: 0, h: 0, origLeft: 0, origTop: 0 };
  });
  Object.values(chipMap).forEach((chip) => {
    chip.drag = makeDrag(chip.el, {
      enabled: () => alive && !locked && !chip.locked && chip.status === 'tray',
      onStart() {
        if (chip.cancelTween) { chip.cancelTween(); chip.cancelTween = null; }
        const fr = fieldRect(); const r = chip.el.getBoundingClientRect();
        chip.origLeft = r.left - fr.left; chip.origTop = r.top - fr.top;
        chip.w = r.width; chip.h = r.height;
        chip.el.style.width = chip.w + 'px'; chip.el.style.height = chip.h + 'px';
        chip.el.style.position = 'absolute';
        chip.el.style.left = chip.origLeft + 'px'; chip.el.style.top = chip.origTop + 'px';
        chip.el.style.zIndex = 50;
        field.appendChild(chip.el);
        chip.el.classList.add('ncs-flying');
        chip.status = 'flying';
      },
      onMove(dx, dy) {
        const left = chip.origLeft + dx; const top = chip.origTop + dy;
        chip.el.style.left = left + 'px'; chip.el.style.top = top + 'px';
        pan.classList.toggle('ncs-hover', panHit(left + chip.w / 2, top + chip.h / 2));
      },
      onEnd(dx, dy) {
        const left = chip.origLeft + dx; const top = chip.origTop + dy;
        const hit = panHit(left + chip.w / 2, top + chip.h / 2);
        pan.classList.remove('ncs-hover');
        if (!hit || locked) { returnToTray(chip, left, top); return; }
        if (chip.real) keepChip(chip, left, top);
        else floatClaimAway(chip, left, top);
      },
    });
  });

  const board = {
    needleCancel: null,
    layout() {
      // abandon any live drag/tween and snap everything to a clean state at
      // the new geometry rather than guess where an animation was heading
      timers.forEach((t) => clearTimeout(t));
      if (board.needleCancel) { board.needleCancel(); board.needleCancel = null; }
      pan.classList.remove('ncs-hover');
      Object.values(chipMap).forEach((c) => {
        if (c.drag) c.drag.abort();
        if (c.cancelTween) { c.cancelTween(); c.cancelTween = null; }
        if (c.status === 'flying') {
          c.status = 'tray'; c.el.classList.remove('ncs-flying'); c.el.style.cssText = '';
          trayRow.appendChild(c.el);
        }
      });
      positionNeedle(true, false);
    },
    destroy() {
      alive = false;
      timers.forEach((t) => clearTimeout(t));
      if (board.needleCancel) board.needleCancel();
      Object.values(chipMap).forEach((c) => { if (c.cancelTween) c.cancelTween(); if (c.drag) c.drag.destroy(); });
      field.remove();
    },
  };
  positionNeedle(true, false);
  return board;
}

/* ---------- CSS (prefix ncs-) ---------- */
const CSS = `
.ncs-qsub { text-align:center; font-size:12.5px; color:#6b5744; font-weight:500; margin-bottom:12px; max-width:600px; margin-left:auto; margin-right:auto; }
.ncs-field { position:relative; }
.ncs-passage { max-width:600px; margin:0 auto 14px; background:#fff; border:2.5px solid rgba(51,38,29,.16); border-radius:14px; padding:10px 16px; }
.ncs-passage ol { margin:0; padding-left:22px; }
.ncs-passage li { font-size:14px; line-height:1.55; font-weight:500; color:var(--ink); margin-bottom:2px; }
.ncs-scale { display:flex; flex-direction:column; align-items:center; gap:4px; margin-bottom:10px; }
.ncs-beamicon { font-size:30px; transform-origin:50% 20%; }
.ncs-beamicon.bump { animation: ncsBump .5s var(--spring); }
@keyframes ncsBump { 0% { transform:scale(1) rotate(0); } 35% { transform:scale(1.22) rotate(-6deg); } 100% { transform:scale(1) rotate(0); } }
.ncs-pan {
  position:relative; min-width:220px; max-width:640px; width:92%; min-height:54px;
  border:3px dashed rgba(155,89,208,.55); border-radius:16px; background:rgba(155,89,208,.06);
  display:flex; align-items:center; justify-content:center; flex-wrap:wrap; gap:6px; padding:8px 12px;
  transition: background .25s, border-color .25s;
}
.ncs-pan.ncs-hover { background:rgba(155,89,208,.22); border-color:rgba(155,89,208,.9); }
.ncs-panhint { font-size:12.5px; font-weight:700; color:#a08cc4; letter-spacing:.03em; text-transform:uppercase; }
.ncs-panhint.hide { display:none; }
.ncs-kept { display:flex; flex-wrap:wrap; gap:6px; justify-content:center; }
.ncs-chip-kept {
  font-size:12.5px; font-weight:700; background:#fff; border:2px solid var(--correct); color:#1d8f4e;
  border-radius:999px; padding:6px 11px; box-shadow:0 2px 0 rgba(46,204,113,.35);
}
.ncs-gauge { position:relative; max-width:640px; width:92%; margin:6px auto 4px; height:64px; }
.ncs-track { position:relative; display:flex; height:40px; border-radius:12px; overflow:hidden; box-shadow:inset 0 2px 6px rgba(51,38,29,.2); }
.ncs-zone { position:absolute; top:0; bottom:0; width:25%; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(51,38,29,.05); border-right:1.5px dashed rgba(51,38,29,.1); transition: background .35s, box-shadow .35s; }
.ncs-zone:last-child { border-right:none; }
.ncs-zone .nz-e { font-size:17px; line-height:1; }
.ncs-zone .nz-l { font-size:8.5px; font-weight:800; letter-spacing:.06em; color:#7c6247; margin-top:1px; }
.ncs-zone.ncs-zone-locked { background:rgba(46,204,113,.28); box-shadow:inset 0 0 0 3px var(--correct); animation: ncsZonePop .5s var(--spring); }
.ncs-zone.ncs-zone-locked .nz-l { color:#1d8f4e; }
@keyframes ncsZonePop { 0% { transform:scale(1); } 45% { transform:scale(1.12); } 100% { transform:scale(1); } }
.ncs-needle-wrap { position:absolute; top:-4px; transform:translateX(-50%); pointer-events:none; }
.ncs-needle { width:0; height:0; margin:0 auto; border-left:11px solid transparent; border-right:11px solid transparent; border-top:17px solid #8a6d3b; filter:drop-shadow(0 2px 2px rgba(0,0,0,.3)); }
.ncs-needle-wrap.wobble .ncs-needle { animation: ncsWobble 1.15s ease-in-out infinite; }
@keyframes ncsWobble { 0%,100% { transform: translateX(0) rotate(0deg); } 50% { transform: translateX(3px) rotate(4deg); } }
.ncs-needle-wrap.locked .ncs-needle { border-top-color: var(--correct); animation:none; transform:none; }
.ncs-tray { display:flex; flex-wrap:wrap; gap:9px; justify-content:center; margin-top:14px; min-height:50px; }
.ncs-chip {
  display:inline-flex; align-items:center; gap:6px; padding:10px 15px; background:#fff;
  border:3px solid var(--ink); border-radius:999px; font-weight:700; font-size:14px; color:var(--ink);
  box-shadow:0 3px 0 rgba(51,38,29,.3); cursor:grab; touch-action:none;
  -webkit-user-select:none; user-select:none; max-width:280px;
  animation: ncsFloat 3.4s ease-in-out infinite;
}
.ncs-chip:nth-child(2n) { animation-delay:.5s; }
.ncs-chip:nth-child(3n) { animation-delay:1.1s; }
@keyframes ncsFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-4px); } }
.ncs-chip.ncs-flying { cursor:grabbing; box-shadow:0 9px 16px rgba(0,0,0,.35); animation:none; }
.ncs-chip.ncs-chip-spent { opacity:.35; animation:none; pointer-events:none; }
.ncs-win {
  margin-top:14px; text-align:center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF);
  border:3px solid var(--correct); border-radius:14px; padding:10px 14px;
  animation: animBubbleIn .34s var(--spring) both;
}
.ncs-wp { font-weight:700; color:#1d8f4e; font-size:16px; }
.ncs-wk { font-size:13.5px; color:#4d6b58; font-weight:500; margin-top:2px; }
.ncs-rulecard {
  margin-top:12px; font-size:13.5px; line-height:1.35; background: linear-gradient(180deg,#FFF3CE,#FBE29A);
  border:3px solid var(--gold-deep); border-radius:14px; padding:10px 14px; color:#5a4408;
  font-weight:700; max-width:980px; margin-left:auto; margin-right:auto;
}
`;

/* ---------- the anim card ---------- */
export default {
  id: 'between-lines',
  title: "NED'S CLUE SCALES",

  mount(host, ctx) {
    let alive = true;
    let board = null;
    let mi = 0;
    let ahaShown = false;
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    injectCss('between-lines', CSS);

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const qsub = el('div', 'ncs-qsub', "Drag clues onto Ned's pan and watch the dial. Two clues that AGREE lock it — big claims like 'always' or 'never' won't weigh a thing.");
    const boardHost = el('div');
    const winBox = el('div');
    const controls = el('div', 'anim-controls');
    const resetBtn = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(resetBtn);
    const ruleCard = el('div', 'ncs-rulecard', RULE);
    stage.append(chiprow, qsub, boardHost, winBox, controls, ruleCard);
    host.append(stage);

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), m.title);
        c.addEventListener('click', () => { sfx.ui(); startMission(i); });
        chiprow.append(c);
      });
    }

    function destroyBoard() { if (board) { board.destroy(); board = null; } }

    function startMission(i) {
      mi = i;
      const mission = MISSIONS[i];
      winBox.innerHTML = '';
      destroyBoard();
      paintChips();
      board = makeBoard(boardHost, mission, {
        onLocked(m, zone) { win(m, zone); },
        onFeedback(kind) {
          if (!alive) return;
          if (kind === 'one') { sfx.nudge(); toast(stage, MSG_ONE); }
          else if (kind === 'disagree') { sfx.nudge(); toast(stage, MSG_DISAGREE); }
          else if (kind === 'claim') { toast(stage, MSG_CLAIM); }
        },
      });
    }

    function win(mission, zone) {
      doneSet.add(mission.id);
      party(stage);
      paintChips();
      winBox.innerHTML = '';
      const zoneInfo = zoneById[zone];
      const w = el('div', 'ncs-win',
        `<div class="ncs-wp">LOCKED! ${zoneInfo.emoji} ${zoneInfo.label}</div><div class="ncs-wk">${mission.worked}</div>`);
      winBox.append(w);
      const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
      if (nextIdx !== -1) {
        const nb = el('button', 'btn btn-gold', 'NEXT ONE ➡');
        nb.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;min-height:44px;';
        nb.addEventListener('click', () => { sfx.ui(); startMission(nextIdx); });
        w.append(nb);
      }
      if (doneSet.size === MISSIONS.length) {
        ctx.complete();
        if (!ahaShown) {
          ahaShown = true;
          later(() => {
            if (!alive) return;
            bubble(stage, {
              title: 'CLUE SCALES MASTERED! \u{1F43D}',
              text: "Feelings are never written down in so many words — the clues ADD UP, and one clue is never enough. That's the whole trick, sniffed out.",
              img: NED_IMG,
            });
          }, 700);
        }
      }
    }

    resetBtn.addEventListener('click', () => { sfx.ui(); startMission(mi); });

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
    };
  },
};
