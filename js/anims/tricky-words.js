// FART QUEST — js/anims/tricky-words.js
// THE MEMORY HOOK FORGE — interactive spelling-hook machine for the
// tricky-words Scout Report (Spelling Sewers). Big letter tiles spell a
// monster word; the forge dresses the word with its hook (collar+socks,
// a parking rat, a torch that finds FINITE, or a silly chant), then the
// letters scatter and the child rebuilds the word from a shuffled tray —
// the hook items stay behind as faint ghost anchors to help them remember.

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const NECC_IMG = 'assets/monsters/neccessarry-the-unspellable.png';
const RULE = 'Hard words need a hook: nec-ESS-ary has one collar and two socks. Make the word ridiculous and it sticks.';

/* ---------- pure mission data (spellings + hook geometry — proven in a
   scratch node harness: every span/group reconstructs its word exactly,
   and 500 randomised rebuild simulations never dead-end on a duplicate
   letter) ---------- */
function span(a, b) { return { a, b, mid: Math.floor((a + b) / 2) }; }
const MISSIONS = [
  {
    id: 'necessary', word: 'NECESSARY', chip: 'NECESSARY', hookKind: 'collar-socks',
    collarIdx: 2, sockIdx: [4, 5],
    dressQ: 'Dress NECESSARY with its hook.',
    dressSub: 'Drag ONE collar onto the C, then TWO socks onto the two S’s.',
    bubbleTitle: 'ONE COLLAR, TWO SOCKS! 🥋',
    bubbleText: 'necessary has one Collar (one C) and two Socks (two S’s) — nec-ESS-ary. Only one C, but TWO S’s.',
    rebuildQ: 'NECESSARY scattered! Rebuild it.',
    rebuildSub: 'Drag every tile back into its gap — the collar and socks are still faintly there to help.',
    winText: 'nec-ESS-ary — one Collar, two Socks, sorted forever.',
  },
  {
    id: 'separate', word: 'SEPARATE', chip: 'SEPARATE', hookKind: 'rat',
    span: span(4, 6),
    dressQ: 'Find the rat hiding in SEPARATE.',
    dressSub: 'Drag the rat into the middle of the word — park him in his hiding spot.',
    bubbleTitle: 'GOTCHA! 🐀',
    bubbleText: 'there is A RAT in the middle of sep-A-RAT-e. Never “seperate” — that spelling has no rat at all.',
    rebuildQ: 'SEPARATE scattered! Rebuild it.',
    rebuildSub: 'Drag every tile back into its gap — the rat is still faintly parked to help.',
    winText: 'sep-A-RAT-e — find the rat, spell it right, every time.',
  },
  {
    id: 'definitely', word: 'DEFINITELY', chip: 'DEFINITELY', hookKind: 'finite',
    span: span(2, 7),
    dressQ: 'Shine the torch and find FINITE.',
    dressSub: 'Drag the torch to the middle of the word and let go — find where FINITE lights up.',
    bubbleTitle: 'FOUND IT! 🔦',
    bubbleText: 'definitely has "finite" hiding inside — defi-NITE-ly. It is never defin-ATE-ly. There is no "ate" in definitely, no matter how hungry you are.',
    rebuildQ: 'DEFINITELY scattered! Rebuild it.',
    rebuildSub: 'Drag every tile back into its gap — the FINITE glow is still faintly there to help.',
    winText: 'defi-NITE-ly — finite is hiding inside, every time.',
  },
  {
    id: 'wednesday', word: 'WEDNESDAY', chip: 'WEDNESDAY', hookKind: 'chant',
    groups: [[0, 2], [3, 5], [6, 8]], groupLabels: ['WED', 'NES', 'DAY'],
    dressQ: 'Speak WEDNESDAY silly.',
    dressSub: 'Tap the button and chant the word in three chunks.',
    bubbleTitle: 'SAY IT SILLY! 📣',
    bubbleText: 'Wednesday hides WED — like a wedding — right in the middle: WED-nes-day.',
    rebuildQ: 'WEDNESDAY scattered! Rebuild it.',
    rebuildSub: 'Drag every tile back into its gap — WED / NES / DAY are still faintly marked to help.',
    winText: 'WED-NES-DAY — chant it silly, spell it right.',
  },
];

function fisherYates(arr) {
  const a2 = arr.slice();
  for (let i = a2.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a2[i], a2[j]] = [a2[j], a2[i]];
  }
  return a2;
}

const CSS = `
.mhf-wordrow { display: flex; justify-content: center; gap: 4px; flex-wrap: nowrap; margin: 12px 0 22px; }
.mhf-tile {
  position: relative; flex: 0 1 56px; min-width: 26px; height: 56px;
  display: flex; align-items: center; justify-content: center;
  background: #fff; border: 3px solid var(--ink); border-radius: 11px;
  font-weight: 800; font-size: clamp(15px, 4.2vw, 25px); color: var(--ink);
  box-shadow: 0 3px 0 rgba(51,38,29,.3);
}
.mhf-tile.mhf-slot { background: rgba(255,255,255,.4); border-style: dashed; color: transparent; box-shadow: none; }
.mhf-tile.mhf-filled { animation: mhfPop .4s var(--spring) both; }
@keyframes mhfPop { 0% { transform: scale(.5); } 60% { transform: scale(1.12); } 100% { transform: scale(1); } }
.mhf-badge { position: absolute; font-size: 15px; pointer-events: none; z-index: 3; }
.mhf-badge.mhf-collar { top: -16px; left: 50%; transform: translateX(-50%); }
.mhf-badge.mhf-sock { bottom: -14px; left: 50%; transform: translateX(-50%); }
.mhf-badge.ghost { opacity: .35; }
.mhf-zone { background: rgba(155,89,208,.16); }
.mhf-zone.ghost { background: rgba(155,89,208,.09); }
.mhf-zone.mhf-zl { border-top-left-radius: 22px; border-bottom-left-radius: 22px; }
.mhf-zone.mhf-zr { border-top-right-radius: 22px; border-bottom-right-radius: 22px; }
.mhf-chantzone-0 { background: rgba(230,126,34,.18); }
.mhf-chantzone-1 { background: rgba(52,152,219,.18); }
.mhf-chantzone-2 { background: rgba(46,204,113,.18); }
.mhf-ratcap { position: absolute; top: -24px; left: 50%; transform: translateX(-50%); font-size: 19px; pointer-events: none; z-index: 3; }
.mhf-ratcap.ghost { opacity: .35; }
.mhf-glowcap {
  position: absolute; top: -22px; left: 50%; transform: translateX(-50%); pointer-events: none; z-index: 3;
  color: var(--gold-deep); font-weight: 800; font-size: 10.5px; letter-spacing: .06em;
  background: #FFF3D0; border: 2px solid var(--gold-deep); border-radius: 999px; padding: 1px 7px; white-space: nowrap;
}
.mhf-glowcap.ghost { opacity: .4; }
.mhf-grouplabel {
  position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%); pointer-events: none;
  font-size: 9px; font-weight: 800; letter-spacing: .08em; color: #7c6247; white-space: nowrap;
}
.mhf-grouplabel.ghost { opacity: .45; }
.mhf-tile.mhf-chantlit { animation: mhfChantPulse .5s ease; background: #FFF3D0; border-color: var(--gold-deep); }
@keyframes mhfChantPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.14); } }
.mhf-tray { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; margin-top: 8px; min-height: 62px; }
.mhf-chip {
  position: relative; width: 52px; height: 52px; border-radius: 14px; background: var(--card);
  border: 3px solid var(--swamp-mid); display: flex; align-items: center; justify-content: center;
  font-size: 23px; font-weight: 800; color: var(--ink); cursor: grab; box-shadow: 0 3px 0 rgba(0,0,0,.25);
  touch-action: none; will-change: transform; user-select: none;
}
.mhf-chip.dragging { cursor: grabbing; z-index: 25; }
.mhf-chant { text-align: center; font-weight: 800; font-size: clamp(19px, 4.6vw, 28px); margin-top: 12px; min-height: 34px; color: var(--stink); letter-spacing: .04em; }
.mhf-chant .hot { color: var(--gold-deep); }
.mhf-speakbtn { display: block; margin: 6px auto 0; }
.mhf-contbtn { display: block; margin: 14px auto 0; }
`;

/* ---------- shared geometry helpers ---------- */
function nearestIdx(cx, tileEls) {
  let best = 0; let bestD = Infinity;
  tileEls.forEach((t, i) => {
    const r = t.getBoundingClientRect(); const c = r.left + r.width / 2;
    const d = Math.abs(c - cx);
    if (d < bestD) { bestD = d; best = i; }
  });
  return best;
}
function zoneCapsule(tileEls, sp, cls) {
  for (let i = sp.a; i <= sp.b; i += 1) {
    cls.split(' ').forEach((c) => tileEls[i].classList.add(c));
    if (i === sp.a) tileEls[i].classList.add('mhf-zl');
    if (i === sp.b) tileEls[i].classList.add('mhf-zr');
  }
}
function addBadge(tile, kind, ghost) {
  tile.appendChild(el('span', `mhf-badge mhf-${kind}${ghost ? ' ghost' : ''}`, kind === 'collar' ? '🔗' : '🧦'));
}
function addRatCap(tile, ghost) { tile.appendChild(el('span', `mhf-ratcap${ghost ? ' ghost' : ''}`, '🐀')); }
function addGlowCap(tile, ghost) { tile.appendChild(el('span', `mhf-glowcap${ghost ? ' ghost' : ''}`, 'FINITE')); }
function addGroupLabel(tile, text, ghost) { tile.appendChild(el('span', `mhf-grouplabel${ghost ? ' ghost' : ''}`, text)); }

function buildTiles(letters) {
  const wrap = el('div', 'mhf-wordrow');
  const tiles = letters.map((ch) => { const t = el('div', 'mhf-tile', ch); wrap.append(t); return t; });
  return { wrap, tiles };
}
function buildSlots(word, locked) {
  const wrap = el('div', 'mhf-wordrow');
  const tiles = word.split('').map((ch, i) => {
    const filled = locked[i] != null;
    const t = el('div', 'mhf-tile' + (filled ? ' mhf-filled' : ' mhf-slot'), filled ? ch : '');
    wrap.append(t);
    return t;
  });
  return { wrap, tiles };
}

function applyDressDecor(tileEls, mission, state) {
  if (mission.hookKind === 'collar-socks') {
    if (state.collared) addBadge(tileEls[mission.collarIdx], 'collar', false);
    mission.sockIdx.forEach((si, k) => { if (state.socked[k]) addBadge(tileEls[si], 'sock', false); });
  } else if (mission.hookKind === 'rat') {
    if (state.hookDone) { zoneCapsule(tileEls, mission.span, 'mhf-zone'); addRatCap(tileEls[mission.span.mid], false); }
  } else if (mission.hookKind === 'finite') {
    if (state.hookDone) { zoneCapsule(tileEls, mission.span, 'mhf-zone'); addGlowCap(tileEls[mission.span.mid], false); }
  } else if (mission.hookKind === 'chant' && state.chanted) {
    mission.groups.forEach((g, i) => {
      zoneCapsule(tileEls, { a: g[0], b: g[1] }, `mhf-chantzone-${i}`);
      addGroupLabel(tileEls[Math.floor((g[0] + g[1]) / 2)], mission.groupLabels[i], false);
    });
  }
}
function applyGhostDecor(tileEls, mission) {
  if (mission.hookKind === 'collar-socks') {
    addBadge(tileEls[mission.collarIdx], 'collar', true);
    mission.sockIdx.forEach((si) => addBadge(tileEls[si], 'sock', true));
  } else if (mission.hookKind === 'rat') {
    zoneCapsule(tileEls, mission.span, 'mhf-zone ghost'); addRatCap(tileEls[mission.span.mid], true);
  } else if (mission.hookKind === 'finite') {
    zoneCapsule(tileEls, mission.span, 'mhf-zone ghost'); addGlowCap(tileEls[mission.span.mid], true);
  } else if (mission.hookKind === 'chant') {
    mission.groups.forEach((g, i) => {
      zoneCapsule(tileEls, { a: g[0], b: g[1] }, `mhf-chantzone-${i}`);
      addGroupLabel(tileEls[Math.floor((g[0] + g[1]) / 2)], mission.groupLabels[i], true);
    });
  }
}

/* ---------- generic draggable chip: tracks 1:1 while live, tweens to its
   resolved target (or bounces home) on release, never a CSS transition
   while the pointer is down ---------- */
function attachDragChip(chip, resolve, onSettled) {
  let curX = 0; let curY = 0; let cancelT = null; let active = true;
  const drag = makeDrag(chip, {
    enabled: () => active,
    onStart() { if (cancelT) { cancelT(); cancelT = null; } chip.classList.add('dragging'); },
    onMove(dx, dy) { chip.style.transform = `translate(${curX + dx}px, ${curY + dy}px)`; },
    onEnd(dx, dy) {
      chip.classList.remove('dragging');
      const draggedX = curX + dx; const draggedY = curY + dy;
      const r = chip.getBoundingClientRect();
      const cx = r.left + r.width / 2; const cy = r.top + r.height / 2;
      const res = resolve(cx, cy);
      const toX = res.ok ? draggedX + res.offX : 0;
      const toY = res.ok ? draggedY + res.offY : 0;
      const fromX = draggedX; const fromY = draggedY;
      cancelT = tween((v) => {
        chip.style.transform = `translate(${fromX + (toX - fromX) * v}px, ${fromY + (toY - fromY) * v}px)`;
      }, 0, 1, 260, () => {
        cancelT = null;
        curX = res.ok ? toX : 0; curY = res.ok ? toY : 0;
        chip.style.transform = `translate(${curX}px, ${curY}px)`;
        if (res.ok) active = false;
        onSettled(res);
      });
    },
  });
  return { destroy() { active = false; if (cancelT) cancelT(); drag.destroy(); } };
}

/* ---------- the anim card ---------- */
export default {
  id: 'tricky-words',
  title: 'THE MEMORY HOOK FORGE',

  mount(host, ctx) {
    let alive = true;
    let mi = 0;
    let phase = 'dress'; // 'dress' | 'rebuild'
    let genTok = 0; // bumps on every render; stale timers/bubbles check it before acting
    const doneSet = new Set();
    const timers = new Set();
    let activeChips = [];
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); return id; };
    const clearChips = () => { activeChips.forEach((c) => c.destroy()); activeChips = []; };

    injectCss('tricky-words', CSS);

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'som-q');
    const qsub = el('div', 'som-qsub');
    const boardHost = el('div');
    const winBox = el('div');
    const controls = el('div', 'anim-controls');
    const resetBtn = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(resetBtn);
    stage.append(chiprow, q, qsub, boardHost, winBox, controls);
    host.append(stage);

    const ruleCard = el('div', null, RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;';
    host.append(ruleCard);

    let mission = null;
    let state = null; // dress-phase flags
    let rebuild = null; // { locked: [] , order: [] }

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), m.chip);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
    }

    function freshDressState(m) {
      if (m.hookKind === 'collar-socks') return { collared: false, socked: [false, false], collarTray: 2, sockTray: 2 };
      if (m.hookKind === 'chant') return { chanted: false };
      return { hookDone: false }; // rat / finite
    }

    function dressComplete() {
      if (mission.hookKind === 'collar-socks') return state.collared && state.socked.every(Boolean);
      if (mission.hookKind === 'chant') return state.chanted;
      return state.hookDone;
    }

    /* ---------- DRESS phase ---------- */
    function renderDress() {
      clearChips();
      const myGen = (genTok += 1);
      boardHost.innerHTML = '';
      winBox.innerHTML = '';
      q.innerHTML = mission.dressQ;
      qsub.textContent = mission.dressSub;
      const { wrap, tiles } = buildTiles(mission.word.split(''));
      applyDressDecor(tiles, mission, state);
      boardHost.append(wrap);

      if (mission.hookKind === 'collar-socks') {
        const tray = el('div', 'mhf-tray');
        boardHost.append(tray);
        for (let i = 0; i < state.collarTray; i += 1) tray.append(makeHookChip('🔗', 'collar'));
        for (let i = 0; i < state.sockTray; i += 1) tray.append(makeHookChip('🧦', 'sock'));
      } else if (mission.hookKind === 'rat') {
        if (!state.hookDone) { const tray = el('div', 'mhf-tray'); tray.append(makeHookChip('🐀', 'rat')); boardHost.append(tray); }
      } else if (mission.hookKind === 'finite') {
        if (!state.hookDone) { const tray = el('div', 'mhf-tray'); tray.append(makeHookChip('🔦', 'finite')); boardHost.append(tray); }
      } else if (mission.hookKind === 'chant') {
        renderChant();
      }

      function makeHookChip(glyph, kind) {
        const chip = el('div', 'mhf-chip', glyph);
        const c = attachDragChip(chip, (cx, cy) => resolveHook(kind, cx, cy, tiles), (res) => {
          if (myGen !== genTok) return;
          if (res.ok) {
            if (kind === 'collar') { state.collared = true; state.collarTray -= 1; sfx.pop(); }
            else if (kind === 'sock') { state.socked[res.si] = true; state.sockTray -= 1; sfx.pop(); }
            else { state.hookDone = true; sfx.sparkle(); }
            renderDress();
            if (dressComplete()) advanceFromDress();
          } else {
            sfx.nudge();
            toast(stage, bounceMsg(kind, res));
          }
        });
        activeChips.push(c);
        return chip;
      }

      function resolveHook(kind, cx, cy, tileEls) {
        const idx = nearestIdx(cx, tileEls);
        const r = tileEls[idx].getBoundingClientRect();
        if (kind === 'collar') {
          if (idx === mission.collarIdx && !state.collared) return { ok: true, offX: (r.left + r.width / 2) - cx, offY: (r.top - 16) - cy };
          return { ok: false, dressed: idx === mission.collarIdx };
        }
        if (kind === 'sock') {
          const si = mission.sockIdx.indexOf(idx);
          if (si !== -1 && !state.socked[si]) return { ok: true, si, offX: (r.left + r.width / 2) - cx, offY: (r.bottom + 14) - cy };
          return { ok: false, dressed: si !== -1 };
        }
        // rat / finite — single park spot at the span's middle tile
        if (idx === mission.span.mid && !state.hookDone) return { ok: true, offX: (r.left + r.width / 2) - cx, offY: (r.top - 22) - cy };
        return { ok: false };
      }

      function bounceMsg(kind, res) {
        if (kind === 'collar') return res.dressed ? 'That C already has its collar — no neck for a second one!' : 'Collars only fit a C — necessary has just the one!';
        if (kind === 'sock') return res.dressed ? 'That S is already wearing its sock!' : 'Socks only fit the S’s — count them in necessary!';
        if (mission.hookKind === 'rat') return 'Not there — sniff again! The rat hides somewhere in the middle of separate.';
        return 'Keep sliding — FINITE is hiding somewhere in the middle of definitely.';
      }
    }

    function renderChant() {
      const btn = el('button', 'btn btn-gold mhf-speakbtn', '📣 SPEAK IT SILLY');
      const caption = el('div', 'mhf-chant', '&nbsp;');
      boardHost.append(btn, caption);
      let contBtn = null;
      const showContinue = () => {
        if (contBtn) return;
        contBtn = el('button', 'btn btn-gold mhf-contbtn', 'GOT IT — SCRAMBLE! 💨');
        contBtn.addEventListener('click', () => { sfx.ui(); advanceFromDress(); });
        boardHost.append(contBtn);
      };
      if (state.chanted) {
        // re-entering after a resize/nav — show the settled state, no need to replay
        caption.innerHTML = mission.groupLabels.map((s) => `<span class="hot">${s}</span>`).join('-');
        showContinue();
      }
      btn.addEventListener('click', () => {
        if (!alive) return;
        sfx.ui();
        const tiles = Array.from(boardHost.querySelectorAll('.mhf-tile'));
        const myGen = genTok;
        const step = (i) => {
          if (!alive || myGen !== genTok) return;
          tiles.forEach((t) => t.classList.remove('mhf-chantlit'));
          if (i >= mission.groups.length) {
            caption.innerHTML = mission.groupLabels.map((s) => `<span class="hot">${s}</span>`).join('-');
            sfx.sparkle();
            if (!state.chanted) {
              state.chanted = true;
              applyDressDecor(tiles, mission, state);
            }
            showContinue();
            return;
          }
          const [a, b] = mission.groups[i];
          for (let k = a; k <= b; k += 1) tiles[k].classList.add('mhf-chantlit');
          caption.innerHTML = mission.groupLabels.map((s, si) => (si === i ? `<span class="hot">${s}</span>` : s)).join('-');
          sfx.tick(i);
          later(() => step(i + 1), 620);
        };
        step(0);
      });
    }

    function advanceFromDress() {
      // Snapshot the mission + generation at schedule time: a mission-chip
      // tap or RESET during this 260ms gap (or during the bubble's own wait)
      // always bumps genTok via renderDress/renderRebuild, so checking it
      // (alongside the mission identity, belt-and-suspenders) stops a stale
      // timer from congratulating/advancing the WRONG mission.
      const myGen = genTok;
      const myMission = mission;
      later(() => {
        if (!alive || phase !== 'dress' || genTok !== myGen || mission !== myMission) return;
        bubble(stage, { title: myMission.bubbleTitle, text: myMission.bubbleText, img: NECC_IMG }).then(() => {
          if (!alive || phase !== 'dress' || genTok !== myGen || mission !== myMission) return;
          enterRebuild();
        });
      }, 260);
    }

    /* ---------- REBUILD phase ---------- */
    function enterRebuild() {
      phase = 'rebuild';
      const ids = mission.word.split('').map((_, i) => i);
      rebuild = { locked: new Array(ids.length).fill(null), order: fisherYates(ids) };
      renderRebuild();
    }

    function renderRebuild() {
      clearChips();
      const myGen = (genTok += 1);
      boardHost.innerHTML = '';
      winBox.innerHTML = '';
      q.innerHTML = mission.rebuildQ;
      qsub.textContent = mission.rebuildSub;
      const { wrap, tiles } = buildSlots(mission.word, rebuild.locked);
      applyGhostDecor(tiles, mission);
      boardHost.append(wrap);

      const trayIds = rebuild.order.filter((id) => !rebuild.locked.includes(id));
      const tray = el('div', 'mhf-tray');
      boardHost.append(tray);
      trayIds.forEach((tileId) => {
        const letter = mission.word[tileId];
        const chip = el('div', 'mhf-chip', letter);
        const c = attachDragChip(chip, (cx, cy) => {
          const idx = nearestIdx(cx, tiles);
          if (rebuild.locked[idx] == null && mission.word[idx] === letter) {
            const r = tiles[idx].getBoundingClientRect();
            return { ok: true, idx, offX: (r.left + r.width / 2) - cx, offY: (r.top + r.height / 2) - cy };
          }
          return { ok: false };
        }, (res) => {
          if (myGen !== genTok) return;
          if (res.ok) {
            rebuild.locked[res.idx] = tileId;
            sfx.drop();
            renderRebuild();
            if (rebuild.locked.every((v) => v != null)) winMission();
          } else {
            sfx.nudge();
            toast(stage, 'Not that gap — try another tile!');
          }
        });
        activeChips.push(c);
        tray.append(chip);
      });
    }

    function winMission() {
      if (!alive) return;
      doneSet.add(mission.id);
      sfx.win(); party(stage);
      const r = boardHost.getBoundingClientRect(); const sr = stage.getBoundingClientRect();
      sparkleBurst(stage, r.left - sr.left + r.width / 2, r.top - sr.top + Math.min(90, r.height / 2));
      paintChips();
      winBox.innerHTML = '';
      const w = el('div', 'som-win', `<div class="wp">HOOKED FOR GOOD! 🔥</div><div class="wk">${mission.winText}</div>`);
      winBox.append(w);
      if (doneSet.size === MISSIONS.length) ctx.complete();
      const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
      if (nextIdx !== -1) {
        const nb = el('button', 'btn btn-gold', 'NEXT ONE ➡');
        nb.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
        nb.addEventListener('click', () => { sfx.ui(); start(nextIdx); });
        w.append(nb);
      } else {
        ctx.complete();
      }
    }

    function start(i) {
      mi = i; mission = MISSIONS[i]; phase = 'dress';
      state = freshDressState(mission); rebuild = null;
      paintChips();
      renderDress();
    }

    resetBtn.addEventListener('click', () => { sfx.ui(); start(mi); });

    const onResize = () => {
      if (!alive) return;
      if (phase === 'dress') renderDress(); else renderRebuild();
    };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    start(0);

    return function cleanup() {
      alive = false;
      genTok += 1;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      clearChips();
      stage.remove();
      ruleCard.remove();
    };
  },
};
