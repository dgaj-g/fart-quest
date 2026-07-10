// FART QUEST — js/anims/spelling-rules.js
// THE RULE PIPES — interactive spelling-machinery for the spelling-rules
// Scout Report (The Spelling Sewers). Words flow down pipes and hit one of
// three ancient laws: the CLAW grabs a silent e before -ing, the Y-VALVE
// flips a consonant-y into ies, and the LETTER SLOT settles ie vs ei
// (reversed straight after a c). A bonus pipe doubles a final consonant.

import { el, sfx, tween, makeDrag, toast, bubble, party, injectCss } from './_kit.js';

const LEEN_IMG = 'assets/monsters/i-before-e-leen.png';
const RULE = 'i before e except after c (when it rhymes with bee); drop the e when adding -ing; y turns to ies.';

/* ---------- pure word-machinery (tested independently — do not "improve") ---------- */
function dropSilentE(word, ending) { return word.slice(0, -1) + ending; }
function yPreIsConsonant(word) { const pre = word[word.length - 2]; return !'aeiou'.includes(pre); }
function yValveResult(word, ending) { return yPreIsConsonant(word) ? word.slice(0, -1) + 'ies' : word + ending; }
function slotResult(prefix, mid, suffix) { return prefix + mid + suffix; }
function doubleResult(base, ending) { return base + base[base.length - 1] + ending; }

function fisherYates(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- shared DOM builders ---------- */
function buildTileRow(letters, extraClassFn) {
  const row = el('div', 'rpp-pipe');
  const tiles = letters.map((ch, i) => {
    const t = el('div', 'rpp-tile', ch.toUpperCase());
    if (extraClassFn) { const c = extraClassFn(i); if (c) t.classList.add(c); }
    row.append(t);
    return t;
  });
  return { row, tiles };
}
function buildJoinTail(row, endingLabel) {
  row.append(el('div', 'rpp-plus', '+'));
  row.append(el('div', 'rpp-end', endingLabel));
  row.append(el('div', 'rpp-arrow', '→'));
  const readout = el('div', 'rpp-readout', '<span class="rpp-ph">?</span>');
  row.append(readout);
  return readout;
}
function nearestTileIndex(tiles, clientX) {
  let best = 0; let bestDist = Infinity;
  tiles.forEach((t, i) => {
    const r = t.getBoundingClientRect();
    const d = Math.abs(clientX - (r.left + r.right) / 2);
    if (d < bestDist) { bestDist = d; best = i; }
  });
  return best;
}
function flyToBin(stageEl, fromEl, toEl, letter) {
  const sr = stageEl.getBoundingClientRect();
  const fr = fromEl.getBoundingClientRect();
  const tr = toEl.getBoundingClientRect();
  const s = el('span', 'rpp-flyletter', letter.toUpperCase());
  s.style.left = (fr.left - sr.left + fr.width / 2 - 10) + 'px';
  s.style.top = (fr.top - sr.top + fr.height / 2 - 10) + 'px';
  s.style.setProperty('--dx', (tr.left + tr.width / 2 - fr.left - fr.width / 2) + 'px');
  s.style.setProperty('--dy', (tr.top + tr.height / 2 - fr.top - fr.height / 2) + 'px');
  stageEl.appendChild(s);
  setTimeout(() => { if (s.parentNode) s.remove(); }, 600);
}

/* ---------- content ---------- */
const PREDICT_OPTS = [{ key: 'ies', label: 'SWAP TO IES' }, { key: 's', label: 'JUST ADD S' }];
const WIN_PHRASES = ['PIPES ALIGNED! 🔧', 'I-BEFORE-E-LEEN NODS! ✅', 'RULE LOCKED IN!', 'NOT A DRIP OUT OF PLACE! 💧'];

const MISSIONS = [
  { id: 'a', type: 'claw', word: 'hope', ending: 'ing', target: dropSilentE('hope', 'ing'), label: 'HOPE + ING',
    q: 'HOPE is chugging down the pipe towards <b>+ING</b>.',
    sub: 'Drag the claw to the letter that has to go before the pipes can join — then let go.',
    worked: '"hope" ends in a silent e. Drop it before adding -ing: hop + ing = hoping.' },
  { id: 'b', type: 'claw', word: 'make', ending: 'ing', target: dropSilentE('make', 'ing'), label: 'MAKE + ING',
    q: 'MAKE is next up to the joining valve, heading for <b>+ING</b>.',
    sub: 'Grab the silent letter with the claw and drop it in the bin.',
    worked: '"make" ends in a silent e, dropped before -ing: mak + ing = making.' },
  { id: 'c', type: 'valve', word: 'cry', ending: 's', target: yValveResult('cry', 's'), correctPredict: yPreIsConsonant('cry') ? 'ies' : 's', label: 'CRY + S',
    q: 'CRY is rolling up to the Y-valve, heading for <b>+S</b>.',
    sub: 'Predict what happens to the y, then spin the valve to find out.',
    worked: '"cry" ends consonant + y (r + y), so swap the y for ies: cr + ies = cries.' },
  { id: 'd', type: 'valve', word: 'boy', ending: 's', target: yValveResult('boy', 's'), correctPredict: yPreIsConsonant('boy') ? 'ies' : 's', label: 'BOY + S',
    q: 'BOY is rolling up to that same Y-valve, heading for <b>+S</b>.',
    sub: 'Predict what happens to the y this time, then spin the valve.',
    worked: '"boy" has a vowel (o) right before the y, so the y stays put and s just tacks on: boy + s = boys.' },
  { id: 'e', type: 'slot', prefix: 'bel', suffix: 've', correct: 'ie', options: ['ie', 'ei'], afterC: false, target: slotResult('bel', 'ie', 've'), label: 'BEL_EVE',
    q: 'A gap has opened in the pipe: <b>BEL _ _ VE</b>.',
    sub: 'No c anywhere nearby — slot in the letters that belong.',
    worked: '"believe" has no c nearby, so i goes first: bel-i-e-ve, believe.' },
  { id: 'f', type: 'slot', prefix: 'rec', suffix: 've', correct: 'ei', options: ['ie', 'ei'], afterC: true, target: slotResult('rec', 'ei', 've'), label: 'REC_VE',
    q: 'Another gap: <b>REC _ _ VE</b> — and look what\'s glowing.',
    sub: 'That c changes everything. Slot in the letters that belong.',
    worked: '"receive" comes straight after a c, so e goes first: rec-e-i-ve, receive.' },
  { id: 'g', type: 'choice', base: 'swim', ending: 'ing', correct: 'swimming', wrong: 'swiming', target: doubleResult('swim', 'ing'), label: 'SWIM + ING',
    q: 'SWIM is short, with just one vowel before its last letter — bonus pipe time.',
    sub: 'Pick the spelling you think survives the doubling pipe.',
    worked: '"swim" is short with one vowel before its last letter, so double the m before -ing: swi + mm + ing = swimming.' },
];

/* ---------- the anim card ---------- */
export default {
  id: 'spelling-rules',
  title: 'THE RULE PIPES',

  mount(host, ctx) {
    injectCss('spelling-rules', CSS);
    let alive = true;
    let mi = 0;
    let gen = 0; // bumped on every start() so late-firing later() win callbacks from a mission the child has since left/restarted can no-op
    let activeWidget = null;
    let completedCalled = false;
    let ahaShown = false;
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'som-q');
    const qsub = el('div', 'som-qsub');
    const machineHost = el('div');
    const controls = el('div', 'anim-controls');
    const resetBtn = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(resetBtn);
    const winBox = el('div');
    stage.append(chiprow, q, qsub, machineHost, controls, winBox);
    host.append(stage);

    const ruleCard = el('div', 'rpp-rulecard', RULE);
    host.append(ruleCard);

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), m.label);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
    }

    function finishMission(m) {
      doneSet.add(m.id);
      sfx.win();
      party(stage);
      paintChips();
      showWinCard(m);
      if (doneSet.size === MISSIONS.length && !completedCalled) {
        completedCalled = true;
        ctx.complete();
        if (!ahaShown) {
          ahaShown = true;
          later(() => {
            if (!alive) return;
            bubble(stage, {
              title: 'THE RULES CLICK INTO PLACE! 🔧',
              text: 'Spelling rules are machinery, not luck — a silent <b>E</b> drops before -ing, a <b>Y</b> after a consonant flips to <b>IES</b>, and a <b>C</b> right before ie/ei reverses the order. Three ancient laws, three simple checks.',
              img: LEEN_IMG,
            });
          }, 650);
        }
      }
    }

    function showWinCard(m) {
      winBox.innerHTML = '';
      const w = el('div', 'rpp-win',
        `<div class="rpp-wp">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]}</div>`
        + `<div class="rpp-wk">${m.worked}</div>`);
      winBox.append(w);
      const nextIdx = MISSIONS.findIndex((mm) => !doneSet.has(mm.id));
      const btn = el('button', 'btn btn-gold', nextIdx !== -1 ? 'NEXT ONE ➡' : 'PLAY IT AGAIN 🔁');
      btn.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
      btn.addEventListener('click', () => { sfx.ui(); start(nextIdx !== -1 ? nextIdx : 0); });
      w.append(btn);
    }

    /* ---------- LAW TWO: the claw ---------- */
    function renderClaw(mission) {
      const wrap = el('div');
      const { row, tiles } = buildTileRow(mission.word.split(''));
      const readout = buildJoinTail(row, '+' + mission.ending.toUpperCase());
      wrap.append(row);
      const zone = el('div', 'rpp-clawzone');
      const track = el('div', 'rpp-track');
      const claw = el('div', 'rpp-claw', '🦾');
      track.append(claw);
      const binWrap = el('div');
      const bin = el('div', 'rpp-bin', '🗑️');
      binWrap.append(bin, el('div', 'rpp-binlabel', 'BIN'));
      zone.append(track, binWrap);
      wrap.append(zone);
      machineHost.append(wrap);

      let attempts = 0; let clawX = 0; let targetedIdx = -1; let cancelTween = null; let resolved = false;

      const drag = makeDrag(claw, {
        enabled: () => alive && !resolved,
        onStart() {
          if (cancelTween) { cancelTween(); cancelTween = null; clawX = 0; claw.style.transform = 'translateX(0px)'; }
        },
        onMove(dx, dy, e) {
          const maxX = track.getBoundingClientRect().width - claw.offsetWidth;
          const nx = Math.max(0, Math.min(maxX, clawX + dx));
          claw.style.transform = `translateX(${nx}px)`;
          const idx = nearestTileIndex(tiles, e.clientX);
          if (idx !== targetedIdx) {
            if (targetedIdx >= 0) tiles[targetedIdx].classList.remove('rpp-targeted');
            targetedIdx = idx;
            tiles[idx].classList.add('rpp-targeted');
          }
        },
        onEnd(dx, dy, e) {
          const maxX = track.getBoundingClientRect().width - claw.offsetWidth;
          clawX = Math.max(0, Math.min(maxX, clawX + dx));
          if (targetedIdx >= 0) { tiles[targetedIdx].classList.remove('rpp-targeted'); targetedIdx = -1; }
          const idx = nearestTileIndex(tiles, e.clientX);
          cancelTween = tween((v) => { claw.style.transform = `translateX(${v}px)`; }, clawX, 0, 260, () => { cancelTween = null; });
          clawX = 0;
          attemptGrab(idx);
        },
      });

      function attemptGrab(idx) {
        if (resolved) return;
        const silentIdx = mission.word.length - 1;
        if (idx === silentIdx) {
          resolved = true;
          const letter = mission.word[idx];
          tiles[idx].classList.add('rpp-grabbed');
          flyToBin(stage, tiles[idx], bin, letter);
          sfx.pop();
          const g = gen;
          later(() => {
            if (g !== gen) return;
            sfx.drop();
            readout.innerHTML = `<span>${mission.target.toUpperCase()}</span>`;
            readout.classList.remove('rpp-pop'); void readout.offsetWidth; readout.classList.add('rpp-pop');
            finishMission(mission);
          }, 420);
        } else {
          attempts += 1;
          sfx.nudge();
          const letter = mission.word[idx];
          tiles[idx].classList.remove('rpp-cough'); void tiles[idx].offsetWidth; tiles[idx].classList.add('rpp-cough');
          toast(stage, attempts === 1
            ? `Not that one — the pipe coughs "${letter.toUpperCase()}" straight back out.`
            : `In "${mission.word}", only the very last letter is silent — that's the one to grab.`);
        }
      }

      return {
        destroy() { if (cancelTween) cancelTween(); drag.destroy(); },
        onResize() { drag.abort(); if (cancelTween) { cancelTween(); cancelTween = null; } clawX = 0; claw.style.transform = 'translateX(0px)'; },
      };
    }

    /* ---------- LAW THREE: the y-valve ---------- */
    function renderValve(mission) {
      const wrap = el('div');
      const { row, tiles } = buildTileRow(mission.word.split(''), (i) => (i === mission.word.length - 1 ? 'rpp-yhi' : null));
      const readout = buildJoinTail(row, '+' + mission.ending.toUpperCase());
      wrap.append(row);

      const predictRow = el('div', 'rpp-predictrow');
      let predicted = null;
      fisherYates(PREDICT_OPTS).forEach((o) => {
        const c = el('button', 'anim-mchip', o.label);
        c.addEventListener('click', () => {
          if (resolved || busy) return;
          sfx.ui();
          predicted = o.key;
          predictRow.querySelectorAll('.anim-mchip').forEach((b) => b.classList.remove('active'));
          c.classList.add('active');
        });
        predictRow.append(c);
      });
      wrap.append(predictRow);

      const valveZone = el('div', 'rpp-valvezone');
      const valve = el('div', 'rpp-valve');
      valve.innerHTML = '<svg viewBox="-32 -32 64 64"><circle r="27" fill="#E9CD92" stroke="#6B4A2F" stroke-width="4"/>'
        + '<line x1="0" y1="-23" x2="0" y2="-9" stroke="#6B4A2F" stroke-width="4" stroke-linecap="round"/><circle r="8" fill="#33261D"/></svg>';
      valveZone.append(valve, el('div', 'rpp-binlabel', 'SPIN'));
      wrap.append(valveZone);
      machineHost.append(wrap);

      let rotation = 0; let lastAngle = 0; let center = { x: 0, y: 0 };
      let cancelTween = null; let resolved = false; let busy = false;
      const angleAt = (x, y) => Math.atan2(y - center.y, x - center.x) * 180 / Math.PI;

      const drag = makeDrag(valve, {
        enabled: () => alive && !resolved && !busy,
        onStart(e) {
          if (cancelTween) { cancelTween(); cancelTween = null; rotation = 0; valve.style.transform = 'rotate(0deg)'; }
          const r = valve.getBoundingClientRect();
          center = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
          lastAngle = angleAt(e.clientX, e.clientY);
        },
        onMove(dx, dy, e) {
          const a = angleAt(e.clientX, e.clientY);
          let delta = a - lastAngle;
          if (delta > 180) delta -= 360; else if (delta < -180) delta += 360;
          rotation += delta; lastAngle = a;
          valve.style.transform = `rotate(${rotation}deg)`;
        },
        onEnd() {
          const spun = Math.abs(rotation) >= 130;
          if (!spun) { springBack(); return; }
          if (!predicted) { toast(stage, 'Predict first — tap an ending, then give it a real spin.'); springBack(); return; }
          busy = true;
          resolveValve();
        },
      });
      function springBack() {
        cancelTween = tween((v) => { valve.style.transform = `rotate(${v}deg)`; }, rotation, 0, 260, () => { cancelTween = null; rotation = 0; });
      }
      function resolveValve() {
        sfx.tick();
        const sign = rotation < 0 ? -1 : 1;
        const target = sign * Math.ceil(Math.abs(rotation) / 360) * 360;
        cancelTween = tween((v) => { valve.style.transform = `rotate(${v}deg)`; }, rotation, target, 300, () => {
          cancelTween = null; rotation = 0; valve.style.transform = 'rotate(0deg)';
          revealTruth();
        });
      }
      function revealTruth() {
        const g = gen;
        const yTile = tiles[tiles.length - 1];
        if (mission.correctPredict === 'ies') {
          yTile.classList.add('rpp-flip');
          later(() => { if (g !== gen) return; yTile.textContent = 'IES'; yTile.classList.add('rpp-hiflip'); }, 175);
          sfx.pop();
        } else {
          yTile.classList.add('rpp-shield');
          sfx.blip(500);
        }
        later(() => {
          if (g !== gen) return;
          readout.innerHTML = `<span>${mission.target.toUpperCase()}</span>`;
          readout.classList.remove('rpp-pop'); void readout.offsetWidth; readout.classList.add('rpp-pop');
          sfx.drop();
          if (predicted === mission.correctPredict) {
            resolved = true;
            finishMission(mission);
          } else {
            const consonant = mission.correctPredict === 'ies';
            const title = consonant ? 'LISTEN TO THE CONSONANT! 👂' : 'THE VOWEL GUARDS THE Y! 🛡️';
            const text = consonant
              ? `The letter right before the y in "${mission.word}" is a consonant. A consonant before y always tips it over into <b>ies</b>: ${mission.target}.`
              : `The letter right before the y in "${mission.word}" is a vowel. A vowel before y pacifies the valve — the y stays put and s just tacks on: ${mission.target}.`;
            bubble(stage, { title, text, img: LEEN_IMG }).then(() => {
              if (!alive) return;
              busy = false; predicted = null;
              predictRow.querySelectorAll('.anim-mchip').forEach((b) => b.classList.remove('active'));
              readout.innerHTML = '<span class="rpp-ph">?</span>';
              yTile.classList.remove('rpp-flip', 'rpp-hiflip', 'rpp-shield');
              yTile.textContent = mission.word[mission.word.length - 1].toUpperCase();
            });
          }
        }, 420);
      }

      return {
        destroy() { if (cancelTween) cancelTween(); drag.destroy(); },
        onResize() { drag.abort(); if (cancelTween) { cancelTween(); cancelTween = null; } rotation = 0; busy = false; valve.style.transform = 'rotate(0deg)'; },
      };
    }

    /* ---------- LAW ONE: the letter slot ---------- */
    function renderSlot(mission) {
      const wrap = el('div');
      const row = el('div', 'rpp-pipe');
      const prefixLetters = mission.prefix.split('');
      prefixLetters.forEach((ch, i) => {
        const t = el('div', 'rpp-tile', ch.toUpperCase());
        if (mission.afterC && ch === 'c' && i === prefixLetters.length - 1) t.classList.add('rpp-glowc');
        row.append(t);
      });
      const slotTiles = [0, 1].map(() => { const t = el('div', 'rpp-tile rpp-slotph', '?'); row.append(t); return t; });
      mission.suffix.split('').forEach((ch) => row.append(el('div', 'rpp-tile', ch.toUpperCase())));
      wrap.append(row);

      const optRow = el('div', 'rpp-slotrow');
      let resolved = false;
      fisherYates(mission.options).forEach((opt) => {
        const c = el('button', 'anim-mchip', opt.toUpperCase());
        c.addEventListener('click', () => {
          if (resolved) return;
          sfx.ui();
          if (opt === mission.correct) {
            resolved = true;
            const chars = opt.toUpperCase().split('');
            slotTiles.forEach((t, i) => { t.classList.remove('rpp-slotph'); t.textContent = chars[i]; t.classList.add('rpp-flyin'); });
            sfx.pop();
            const g = gen;
            later(() => { if (g !== gen) return; sfx.drop(); finishMission(mission); }, 300);
          } else {
            sfx.nudge();
            c.classList.remove('rpp-wobble'); void c.offsetWidth; c.classList.add('rpp-wobble');
            toast(stage, mission.afterC
              ? 'Straight after that glowing c — e comes first here. Try the other tile.'
              : 'No c in sight — i comes first here. Try the other tile.');
          }
        });
        optRow.append(c);
      });
      wrap.append(optRow);
      machineHost.append(wrap);
      return { destroy() {}, onResize() {} };
    }

    /* ---------- BONUS: the doubling pipe ---------- */
    function renderChoice(mission) {
      const wrap = el('div');
      const { row } = buildTileRow(mission.base.split(''));
      const readout = buildJoinTail(row, '+' + mission.ending.toUpperCase());
      wrap.append(row);

      const optRow = el('div', 'rpp-choicerow');
      let resolved = false;
      fisherYates([mission.correct, mission.wrong]).forEach((opt) => {
        const c = el('button', 'anim-mchip', opt.toUpperCase());
        c.addEventListener('click', () => {
          if (resolved) return;
          sfx.ui();
          if (opt === mission.correct) {
            resolved = true;
            const idx = mission.base.length - 1;
            const chars = mission.target.toUpperCase().split('').map((ch, i) => (i === idx || i === idx + 1 ? `<span class="rpp-hi">${ch}</span>` : ch));
            readout.innerHTML = `<span>${chars.join('')}</span>`;
            readout.classList.remove('rpp-pop'); void readout.offsetWidth; readout.classList.add('rpp-pop');
            sfx.thud();
            const g = gen;
            later(() => { if (g === gen) sfx.thud(); }, 140);
            later(() => { if (g !== gen) return; finishMission(mission); }, 380);
          } else {
            sfx.nudge();
            c.classList.remove('rpp-wobble'); void c.offsetWidth; c.classList.add('rpp-wobble');
            toast(stage, `"${mission.base}" is short with just one vowel before its last letter — that final letter needs doubling before -ing.`);
          }
        });
        optRow.append(c);
      });
      wrap.append(optRow);
      machineHost.append(wrap);
      return { destroy() {}, onResize() {} };
    }

    function start(i) {
      mi = i;
      gen += 1;
      winBox.innerHTML = '';
      if (activeWidget) { activeWidget.destroy(); activeWidget = null; }
      machineHost.innerHTML = '';
      paintChips();
      const m = MISSIONS[i];
      q.innerHTML = m.q;
      qsub.textContent = m.sub;
      if (m.type === 'claw') activeWidget = renderClaw(m);
      else if (m.type === 'valve') activeWidget = renderValve(m);
      else if (m.type === 'slot') activeWidget = renderSlot(m);
      else activeWidget = renderChoice(m);
    }

    resetBtn.addEventListener('click', () => { sfx.ui(); start(mi); });

    const onResize = () => { if (activeWidget && activeWidget.onResize) activeWidget.onResize(); };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    start(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      if (activeWidget) activeWidget.destroy();
      stage.remove();
      ruleCard.remove();
    };
  },
};

/* ---------- scoped styles (prefix rpp-) ---------- */
const CSS = `
.rpp-pipe { display:flex; align-items:center; justify-content:center; gap:6px; flex-wrap:wrap; margin:10px 0; perspective:300px; }
.rpp-tile { min-width:34px; height:44px; padding:0 6px; display:flex; align-items:center; justify-content:center; background:var(--card); border:3px solid var(--ink); border-radius:10px; font-weight:800; font-size:clamp(16px,3vw,22px); color:var(--ink); box-shadow:0 3px 0 rgba(0,0,0,.3); }
.rpp-tile.rpp-glowc { border-color:var(--gold-deep); background:linear-gradient(180deg,#FFF3CE,#FBE29A); animation:rppGlow 1.6s ease-in-out infinite; }
@keyframes rppGlow { 0%,100%{filter:brightness(1);} 50%{filter:brightness(1.25);} }
.rpp-tile.rpp-yhi { border-color:#9B59D0; box-shadow:0 0 0 3px rgba(155,89,208,.28),0 3px 0 rgba(0,0,0,.3); }
.rpp-tile.rpp-slotph { color:#b9ab97; border-style:dashed; background:transparent; box-shadow:none; }
.rpp-tile.rpp-targeted { box-shadow:0 0 0 3px rgba(155,89,208,.4),0 3px 0 rgba(0,0,0,.3); }
.rpp-tile.rpp-cough { animation:rppCough .45s ease; }
@keyframes rppCough { 0%,100%{transform:translateY(0) rotate(0);} 25%{transform:translateY(-4px) rotate(-8deg);} 60%{transform:translateY(2px) rotate(7deg);} }
.rpp-tile.rpp-grabbed { animation:rppGrab .55s ease-in both; }
@keyframes rppGrab { 0%{transform:translateY(0) rotate(0) scale(1); opacity:1;} 40%{transform:translateY(-14px) rotate(-10deg) scale(1.05);} 100%{transform:translate(38px,-64px) rotate(50deg) scale(.4); opacity:0;} }
.rpp-tile.rpp-flyin { animation:rppFlyIn .4s var(--spring) both; }
@keyframes rppFlyIn { 0%{transform:translateY(-18px) scale(.5); opacity:0;} 70%{transform:translateY(3px) scale(1.1); opacity:1;} 100%{transform:translateY(0) scale(1);} }
.rpp-tile.rpp-flip { animation:rppFlipTile .35s ease; }
@keyframes rppFlipTile { 0%{transform:rotateY(0);} 50%{transform:rotateY(90deg);} 100%{transform:rotateY(0);} }
.rpp-tile.rpp-hiflip { color:var(--gold-deep); border-color:var(--gold-deep); }
.rpp-tile.rpp-shield { animation:rppShieldPulse .5s ease; box-shadow:0 0 0 4px rgba(46,204,113,.35),0 3px 0 rgba(0,0,0,.3); }
@keyframes rppShieldPulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.15);} }
.rpp-plus, .rpp-arrow { font-weight:900; font-size:20px; color:var(--gold-deep); }
.rpp-end { min-width:54px; height:44px; padding:0 10px; display:flex; align-items:center; justify-content:center; background:var(--swamp-mid); color:var(--stink-lime); border-radius:10px; font-weight:800; font-size:16px; box-shadow:0 3px 0 rgba(0,0,0,.3); }
.rpp-readout { min-width:130px; min-height:50px; padding:8px 16px; background:#101014; border-radius:12px; border:3px solid var(--gold-deep); display:flex; align-items:center; justify-content:center; box-shadow:inset 0 3px 10px rgba(0,0,0,.6); }
.rpp-readout span { font-weight:800; font-size:clamp(18px,3.6vw,26px); color:var(--stink-lime); letter-spacing:.02em; }
.rpp-readout .rpp-ph { color:#5a5a63; font-weight:600; }
.rpp-readout .rpp-hi { color:var(--gold); }
.rpp-readout.rpp-pop { animation:rppPop .32s var(--spring) both; }
@keyframes rppPop { 0%{transform:scale(.7);} 100%{transform:scale(1);} }
.rpp-clawzone { display:flex; align-items:center; justify-content:center; gap:18px; margin-top:12px; flex-wrap:wrap; }
.rpp-track { position:relative; width:min(320px,80vw); height:52px; background:linear-gradient(180deg,#2b2b30,#1a1a1e); border-radius:16px; border:3px solid #111; box-shadow:inset 0 3px 8px rgba(0,0,0,.5); touch-action:none; }
.rpp-claw { position:absolute; top:50%; left:0; width:52px; height:52px; margin-top:-26px; border-radius:50%; background:radial-gradient(circle at 35% 30%,#8fd0ff,#3a7fae); border:3px solid #1f4d6b; box-shadow:0 4px 0 rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center; font-size:24px; cursor:grab; touch-action:none; will-change:transform; }
.rpp-claw:active { cursor:grabbing; }
.rpp-bin { font-size:28px; text-align:center; }
.rpp-binlabel { font-size:10px; font-weight:800; letter-spacing:.08em; color:var(--gold-deep); text-align:center; margin-top:2px; }
.rpp-valvezone { display:flex; flex-direction:column; align-items:center; gap:2px; margin-top:6px; }
.rpp-valve { width:76px; height:76px; touch-action:none; cursor:grab; will-change:transform; }
.rpp-valve:active { cursor:grabbing; }
.rpp-valve svg { display:block; filter:drop-shadow(0 2px 3px rgba(0,0,0,.35)); }
.rpp-flyletter { position:absolute; z-index:26; width:20px; height:20px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:18px; color:var(--gold-deep); pointer-events:none; animation:rppFlyBin .55s cubic-bezier(.3,.8,.4,1) both; }
@keyframes rppFlyBin { 0%{transform:translate(0,0) scale(1) rotate(0); opacity:1;} 100%{transform:translate(var(--dx),var(--dy)) scale(.3) rotate(35deg); opacity:0;} }
.rpp-predictrow, .rpp-choicerow, .rpp-slotrow { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; margin-top:10px; }
.rpp-wobble { animation:rppCough .45s ease; }
.rpp-win { margin-top:12px; text-align:center; background:linear-gradient(180deg,#E9FBEF,#D3F3DF); border:3px solid var(--correct); border-radius:14px; padding:10px 14px; animation:animBubbleIn .34s var(--spring) both; }
.rpp-wp { font-weight:700; color:#1d8f4e; font-size:16px; }
.rpp-wk { font-size:13.5px; color:#4d6b58; font-weight:500; margin-top:2px; }
.rpp-rulecard { margin-top:12px; font-size:13.5px; line-height:1.35; background:linear-gradient(180deg,#FFF3CE,#FBE29A); border:3px solid var(--gold-deep); border-radius:14px; padding:10px 14px; color:#5a4408; font-weight:700; }
`;
