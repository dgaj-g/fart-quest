// FART QUEST — js/anims/plurals-collectives.js
// THE CLONING CRANK — a holding pen in the Geese Precinct. Crank the handle
// and the pen fills with animals one at a time. On the SECOND animal the
// Geese Police need the plural relabelled: two cards offered, and picking
// the regularised trap gets the CARD (never the child) warmly arrested.
// Keep cranking and the correct label sticks for every animal after — right
// up until the pen is a whole crowd, which earns its own collective-noun
// name from a final set of cards. Rounds swap the animal.

import { el, sfx, tween, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const CREATURE_IMG = 'assets/monsters/the-geese-police.png';
const RULE = 'Some plurals break the rules (geese, oxen, mice) and groups get one name: a herd, a flock, a swarm.';

/* ---------- pure content: every mission is one animal through the crank.
   pluralWrong / groupWrongs are invented or real trap words, never the
   correct answer under a different name. Verified in a /tmp scratch script
   against the reducer below for every mission's full crank+answer sequence. ---------- */
const MISSIONS = [
  {
    id: 'goose', animalWord: 'goose', emoji: '🪿', target: 5,
    pluralWord: 'geese', pluralWrong: 'gooses',
    pluralWrongReason: "Nice try — but goose is one of the Precinct's biggest rule-breakers. Two of them are never gooses — straight to the filing cabinet with that one!",
    groupWord: 'a gaggle', groupWrongs: ['a herd', 'a swarm'],
    groupWrongReasons: {
      'a herd': 'Herd belongs to the cows down the lane, not a waddling gang of geese.',
      'a swarm': 'Swarm is for a buzzing cloud of insects, not honking geese.',
    },
    noChange: false,
    masteryLine: 'One goose waddles off alone — but call two of them gooses and you\'re nicked. It\'s GEESE. And the whole waddling gang together? A GAGGLE!',
  },
  {
    id: 'mouse', animalWord: 'mouse', emoji: '🐭', target: 4,
    pluralWord: 'mice', pluralWrong: 'mouses',
    pluralWrongReason: 'Mouse throws the rulebook out too — two of them are never mouses. Off to the filing cabinet!',
    groupWord: 'a mischief', groupWrongs: ['a herd', 'a pack'],
    groupWrongReasons: {
      'a herd': 'Herd is for grazing giants like cows — these are tiny scurrying mice.',
      'a pack': 'Pack belongs to hunters like wolves, not scurrying mice.',
    },
    noChange: false,
    masteryLine: 'Mouse changes completely to MICE — and a scurrying crowd of them earns a wonderfully cheeky name: a MISCHIEF!',
  },
  {
    id: 'sheep', animalWord: 'sheep', emoji: '🐑', target: 6,
    pluralWord: 'sheep', pluralWrong: 'sheeps',
    pluralWrongReason: 'Careful — sheep is sneaky. It refuses to change AT ALL, even with a whole field of them. That extra -s gets arrested on the spot!',
    groupWord: 'a flock', groupWrongs: ['a herd', 'a shoal'],
    groupWrongReasons: {
      'a herd': 'Herd belongs to the cows down the lane, not woolly sheep.',
      'a shoal': 'Shoal is the special word for fish, not sheep.',
    },
    noChange: true,
    masteryLine: 'Sheep never changes, one or a hundred — but the whole gathered crowd still earns its own name: a FLOCK!',
  },
  {
    id: 'cow', animalWord: 'cow', emoji: '🐮', target: 5,
    pluralWord: 'cows', pluralWrong: 'cowen',
    pluralWrongReason: "Whoa — not every plural rebels! Cow just wants a plain -s, like nearly all the swamp's words do. That fancy ending gets arrested.",
    groupWord: 'a herd', groupWrongs: ['a flock', 'a pack'],
    groupWrongReasons: {
      'a flock': 'Flock belongs to the sheep and birds, not the cows.',
      'a pack': 'Pack is for hunters like wolves, not grazing cows.',
    },
    noChange: false,
    masteryLine: 'Cow keeps it simple — just add -s for COWS — and the whole grazing crowd is a HERD!',
  },
  {
    id: 'bee', animalWord: 'bee', emoji: '🐝', target: 7,
    pluralWord: 'bees', pluralWrong: 'beeses',
    pluralWrongReason: "Bees is already a full plural — you can't pile another ending on top. Straight to the filing cabinet!",
    groupWord: 'a swarm', groupWrongs: ['a colony', 'a flock'],
    groupWrongReasons: {
      'a colony': 'Colony is for ants, or bees settled quietly in a hive — this lot is buzzing and on the move.',
      'a flock': 'Flock is the word for birds or sheep, not buzzing bees.',
    },
    noChange: false,
    masteryLine: 'Bee just adds -s for BEES — and an angry buzzing cloud of them is a SWARM!',
  },
];
const WIN_PHRASES = ['CASE CLOSED! 🚔', 'PEN FULL, LABELS RIGHT! 🐾', 'BOOKED CORRECTLY! 📋', 'THE PRECINCT APPROVES!'];

/* ---------- pure state machine (no DOM). Phases:
   single -> pluralcheck -> cranking -> groupcheck -> done
   Tested exhaustively in a /tmp scratch script for every mission. ---------- */
function crankTick(state, target) {
  if (state.phase !== 'single' && state.phase !== 'cranking') return state;
  const count = state.count + 1;
  let phase;
  if (count === 2) phase = 'pluralcheck';
  else if (count === target) phase = 'groupcheck';
  else phase = 'cranking';
  return { ...state, count, phase };
}
function answerPlural(state, correct, word) {
  if (state.phase !== 'pluralcheck') return state;
  if (!correct) return state;
  return { ...state, phase: 'cranking', pluralLocked: word };
}
function answerGroup(state, correct, word) {
  if (state.phase !== 'groupcheck') return state;
  if (!correct) return state;
  return { ...state, phase: 'done', groupLocked: word };
}
function freshState() { return { count: 1, phase: 'single', pluralLocked: null, groupLocked: null }; }

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- the anim card ---------- */
export default {
  id: 'plurals-collectives',
  title: 'THE CLONING CRANK',

  mount(host, ctx) {
    let alive = true;
    let mi = 0;
    let mission = MISSIONS[0];
    let state = freshState();
    let busy = false;
    let wrongCount = 0;
    let shown = new Set();
    let cancelWheel = null;
    let wheelDeg = 0;
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'pcc-q', 'THE CLONING CRANK');
    const qsub = el('div', 'pcc-qsub');
    const yard = el('div', 'pcc-yard');
    const plaque = el('div', 'pcc-plaque', '🚔 PRECINCT HOLDING PEN');
    const tokens = el('div', 'pcc-tokens');
    const labelbar = el('div', 'pcc-labelbar');
    const groupbar = el('div', 'pcc-groupbar');
    yard.append(plaque, tokens, labelbar, groupbar);
    const crankRow = el('div', 'anim-controls');
    const crankBtn = el('button', 'pcc-crank');
    crankBtn.innerHTML = '<span class="pcc-wheel"><svg viewBox="-30 -30 60 60"><circle r="24" fill="#E9CD92" stroke="#6B4A2F" stroke-width="3.5"/>'
      + Array.from({ length: 6 }, (_, i) => `<line x1="0" y1="-21" x2="0" y2="-13" stroke="#6B4A2F" stroke-width="3.5" stroke-linecap="round" transform="rotate(${i * 60})"/>`).join('')
      + '<circle r="7" fill="#33261D"/></svg></span><span class="pcc-cranklabel">CRANK IT! 🌀</span>';
    crankRow.append(crankBtn);
    const cardsRow = el('div', 'pcc-cards');
    const winBox = el('div');
    stage.append(chiprow, q, qsub, yard, crankRow, cardsRow, winBox);
    host.append(stage);

    const ruleCard = el('div', 'pcc-rulecard', RULE);
    host.append(ruleCard);

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), `${m.emoji} ${m.animalWord.toUpperCase()}`);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
    }

    function currentLabelWord() {
      if (state.phase === 'single') return mission.animalWord;
      return state.pluralLocked || mission.animalWord;
    }

    function renderTokens() {
      tokens.innerHTML = '';
      for (let i = 0; i < state.count; i += 1) {
        tokens.append(el('span', 'pcc-token', mission.emoji));
      }
    }

    function renderLabel() {
      const word = currentLabelWord();
      labelbar.textContent = `${state.count} ${word.toUpperCase()}`;
      if (state.groupLocked) {
        groupbar.textContent = state.groupLocked.toUpperCase();
        groupbar.classList.add('locked');
      } else {
        groupbar.textContent = '';
        groupbar.classList.remove('locked');
      }
    }

    function renderCrankEnabled() {
      const canCrank = alive && !busy && (state.phase === 'single' || state.phase === 'cranking');
      crankBtn.disabled = !canCrank;
      crankBtn.style.visibility = (state.phase === 'groupcheck' || state.phase === 'done') ? 'hidden' : 'visible';
    }

    function clearCards() { cardsRow.innerHTML = ''; }

    function showPluralCards() {
      clearCards();
      wrongCount = 0;
      qsub.textContent = `Two animals now — pick the right word for MORE THAN ONE ${mission.animalWord}.`;
      const opts = shuffle([
        { word: mission.pluralWord, correct: true },
        { word: mission.pluralWrong, correct: false },
      ]);
      opts.forEach((opt) => {
        const b = el('button', 'pcc-card', opt.word.toUpperCase());
        b.addEventListener('click', () => handlePluralChoice(opt, b));
        cardsRow.append(b);
      });
    }

    function showGroupCards() {
      clearCards();
      wrongCount = 0;
      qsub.textContent = `The pen is full! What do you call a whole crowd of ${mission.pluralWord}?`;
      const opts = shuffle([
        { word: mission.groupWord, correct: true },
        ...mission.groupWrongs.map((w) => ({ word: w, correct: false })),
      ]);
      opts.forEach((opt) => {
        const b = el('button', 'pcc-card pcc-card-group', opt.word.toUpperCase());
        b.addEventListener('click', () => handleGroupChoice(opt, b));
        cardsRow.append(b);
      });
    }

    function arrestCard(btn) {
      btn.classList.remove('arrested'); void btn.offsetWidth; btn.classList.add('arrested');
      sfx.nudge();
    }

    function handlePluralChoice(opt, btn) {
      if (busy || state.phase !== 'pluralcheck') return;
      if (!opt.correct) {
        wrongCount += 1;
        arrestCard(btn);
        if (wrongCount >= 2) {
          bubble(stage, { title: 'GEESE POLICE! 🚨', text: mission.pluralWrongReason, img: CREATURE_IMG });
        } else {
          toast(stage, '🚨 ' + mission.pluralWrongReason);
        }
        return;
      }
      busy = true;
      renderCrankEnabled();
      sfx.drop();
      btn.classList.add('stamped');
      state = answerPlural(state, true, opt.word);
      later(() => {
        if (!alive) return;
        renderLabel();
        clearCards();
        toast(stage, `📋 ${opt.word.toUpperCase()} stamped onto the pen — that label sticks now!`);
        qsub.textContent = 'Keep cranking — the label stays put while the pen fills up.';
        busy = false;
        renderCrankEnabled();
        if (mission.noChange && !shown.has('nochange-' + mission.id)) {
          shown.add('nochange-' + mission.id);
          later(() => {
            if (!alive) return;
            bubble(stage, {
              title: 'SNEAKY ONE! 😏',
              text: `Look closely — <b>${mission.pluralWord}</b> hasn't changed at all! It's still ${mission.pluralWord}, one or a whole field of them. Some plurals refuse to change one single letter.`,
              img: CREATURE_IMG,
            });
          }, 250);
        }
      }, 520);
    }

    function handleGroupChoice(opt, btn) {
      if (busy || state.phase !== 'groupcheck') return;
      if (!opt.correct) {
        wrongCount += 1;
        arrestCard(btn);
        const reason = mission.groupWrongReasons[opt.word] || 'Not quite the right crowd-name for this lot.';
        if (wrongCount >= 2) {
          bubble(stage, { title: 'GEESE POLICE! 🚨', text: reason, img: CREATURE_IMG });
        } else {
          toast(stage, '🚨 ' + reason);
        }
        return;
      }
      busy = true;
      sfx.win();
      btn.classList.add('stamped');
      state = answerGroup(state, true, opt.word);
      doneSet.add(mission.id);
      paintChips();
      renderLabel();
      clearCards();
      renderCrankEnabled();
      const gr = groupbar.getBoundingClientRect();
      const sr = stage.getBoundingClientRect();
      party(stage, 14);
      sparkleBurst(stage, gr.left - sr.left + gr.width / 2, gr.top - sr.top + gr.height / 2, 12);
      qsub.textContent = `Case closed — ${state.count} ${mission.pluralWord} make ${mission.groupWord}.`;
      winBox.innerHTML = '';
      const phrase = WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)];
      const w = el('div', 'pcc-win', `<div class="pcc-wp">${phrase}</div><div class="pcc-wk">${mission.masteryLine}</div>`);
      winBox.append(w);
      const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
      const nb = el('button', 'btn btn-gold', nextIdx !== -1 ? 'NEXT ANIMAL ➡' : 'PLAY AGAIN 🔁');
      nb.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
      nb.addEventListener('click', () => { sfx.ui(); start(nextIdx !== -1 ? nextIdx : 0); });
      w.append(nb);
      busy = false;
      if (doneSet.size === MISSIONS.length) {
        ctx.complete();
        later(() => {
          if (!alive) return;
          bubble(stage, {
            title: 'PRECINCT MASTERED! 🐾',
            text: `${RULE} Some plurals transform completely, some refuse to change one bit — and every crowd, whatever it is, earns exactly one special name.`,
            img: CREATURE_IMG,
          });
        }, 700);
      }
    }

    function spinWheel() {
      if (cancelWheel) { cancelWheel(); cancelWheel = null; }
      const from = wheelDeg;
      const to = wheelDeg + 90;
      cancelWheel = tween((v) => {
        wheelDeg = v;
        crankBtn.querySelector('.pcc-wheel').style.transform = `rotate(${v}deg)`;
      }, from, to, 340, () => { cancelWheel = null; });
    }

    function crank() {
      if (busy || !(state.phase === 'single' || state.phase === 'cranking')) return;
      busy = true;
      renderCrankEnabled();
      spinWheel();
      sfx.tick(Math.max(0, state.count - 1));
      state = crankTick(state, mission.target);
      const newTok = el('span', 'pcc-token popping', mission.emoji);
      tokens.append(newTok);
      renderLabel();
      later(() => {
        if (!alive) return;
        sfx.pop();
        busy = false;
        if (state.phase === 'pluralcheck') showPluralCards();
        else if (state.phase === 'groupcheck') showGroupCards();
        else qsub.textContent = 'Keep cranking — the label stays put while the pen fills up.';
        renderCrankEnabled();
      }, 280);
    }
    crankBtn.addEventListener('click', () => { sfx.ui(); crank(); });

    function start(i) {
      mi = i;
      mission = MISSIONS[i];
      state = freshState();
      busy = false;
      wrongCount = 0;
      shown = new Set();
      if (cancelWheel) { cancelWheel(); cancelWheel = null; }
      wheelDeg = 0;
      crankBtn.querySelector('.pcc-wheel').style.transform = 'rotate(0deg)';
      winBox.innerHTML = '';
      clearCards();
      qsub.textContent = `One ${mission.animalWord} in the pen. Crank the handle to bring in another.`;
      renderTokens();
      renderLabel();
      renderCrankEnabled();
      paintChips();
    }

    const onResize = () => {
      if (!alive) return;
      if (cancelWheel) { cancelWheel(); cancelWheel = null; }
      wheelDeg = Math.round(wheelDeg / 90) * 90;
      crankBtn.querySelector('.pcc-wheel').style.transform = `rotate(${wheelDeg}deg)`;
    };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    start(0);
    later(() => {
      if (!alive) return;
      bubble(stage, {
        title: 'WELCOME TO THE PRECINCT! 🪿',
        text: 'Crank the handle and the pen fills up. On the SECOND animal, pick the right plural — pick wrong and the CARD gets arrested, never you! Fill the whole pen and name the crowd to close the case.',
        img: CREATURE_IMG,
      });
    }, 200);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      if (cancelWheel) cancelWheel();
      stage.remove();
      ruleCard.remove();
    };
  },
};

const CSS = `
.pcc-q { text-align: center; font-weight: 700; font-size: clamp(19px, 3.2vw, 27px); margin-bottom: 2px; letter-spacing: .01em; }
.pcc-qsub { text-align: center; font-size: 12.5px; color: #6b5744; font-weight: 500; margin-bottom: 10px; max-width: 560px; margin-left: auto; margin-right: auto; min-height: 32px; }
.pcc-yard {
  position: relative; max-width: 560px; margin: 0 auto; border-radius: 16px;
  background: linear-gradient(180deg,#efe1c4,#e0d0a8); border: 4px dashed #8a6d3b;
  padding: 14px 12px 12px; text-align: center; box-shadow: inset 0 3px 10px rgba(51,38,29,.15);
}
.pcc-plaque {
  display: inline-block; background: var(--stink); color: #fff; font-weight: 700; font-size: 11px;
  letter-spacing: .08em; padding: 4px 12px; border-radius: 999px; margin-bottom: 8px;
  box-shadow: 0 3px 0 rgba(0,0,0,.25);
}
.pcc-tokens { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; min-height: 46px; align-items: center; }
.pcc-token { font-size: 30px; line-height: 1; filter: drop-shadow(0 3px 3px rgba(0,0,0,.25)); }
.pcc-token.popping { animation: pccPopIn .42s cubic-bezier(.22,1.4,.36,1) both; }
@keyframes pccPopIn { 0% { transform: scale(0) translateY(10px); opacity: 0; } 60% { transform: scale(1.18) translateY(-4px); opacity: 1; } 100% { transform: scale(1) translateY(0); } }
.pcc-labelbar {
  margin-top: 10px; font-weight: 800; font-size: clamp(17px, 2.6vw, 22px); color: var(--gold-deep);
  letter-spacing: .03em;
}
.pcc-groupbar {
  min-height: 20px; margin-top: 4px; font-weight: 800; font-size: 14px; color: #1d8f4e; letter-spacing: .08em;
}
.pcc-groupbar.locked { animation: pccBadgeIn .4s var(--spring) both; }
@keyframes pccBadgeIn { from { transform: scale(.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.pcc-crank {
  display: flex; flex-direction: column; align-items: center; gap: 3px; background: var(--swamp-mid);
  border: none; border-radius: 16px; padding: 8px 22px; cursor: pointer; box-shadow: 0 4px 0 rgba(0,0,0,.35);
  min-height: 60px;
}
.pcc-crank:active { transform: translateY(3px); box-shadow: 0 1px 0 rgba(0,0,0,.35); }
.pcc-crank:disabled { opacity: .45; cursor: default; }
.pcc-wheel { display: block; width: 34px; height: 34px; }
.pcc-wheel svg { display: block; width: 100%; height: 100%; filter: drop-shadow(0 2px 2px rgba(0,0,0,.3)); }
.pcc-cranklabel { color: var(--stink-lime); font-weight: 700; font-size: 13px; }
.pcc-cards { display: flex; justify-content: center; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
.pcc-card {
  background: var(--card); border: 3px solid var(--swamp-mid); color: var(--ink); border-radius: 14px;
  padding: 12px 18px; font-weight: 800; font-size: 15px; cursor: pointer; min-height: 52px;
  box-shadow: 0 4px 0 rgba(0,0,0,.22);
}
.pcc-card:active { transform: translateY(3px); box-shadow: 0 1px 0 rgba(0,0,0,.22); }
.pcc-card.arrested { animation: pccArrest .55s ease; }
@keyframes pccArrest {
  0%, 100% { transform: translateX(0) rotate(0); background: var(--card); }
  15% { transform: translateX(-6px) rotate(-3deg); background: #FBD8D2; }
  35% { transform: translateX(6px) rotate(3deg); }
  55% { transform: translateX(-4px) rotate(-2deg); background: #FBD8D2; }
  75% { transform: translateX(4px) rotate(2deg); }
}
.pcc-card.stamped { background: linear-gradient(180deg,#E9FBEF,#D3F3DF); border-color: var(--correct); color: #1d8f4e; }
.pcc-win {
  margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF);
  border: 3px solid var(--correct); border-radius: 14px; padding: 10px 14px;
  animation: animBubbleIn .34s var(--spring) both;
}
.pcc-wp { font-weight: 700; color: #1d8f4e; font-size: 16px; }
.pcc-wk { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 6px; }
.pcc-rulecard {
  margin-top: 12px; font-size: 13.5px; line-height: 1.35; background: linear-gradient(180deg,#FFF3CE,#FBE29A);
  border: 3px solid var(--gold-deep); border-radius: 14px; padding: 10px 14px; color: #5a4408;
  font-weight: 700; max-width: 980px; margin-left: auto; margin-right: auto;
}
`;
injectCss('plurals-collectives', CSS);
