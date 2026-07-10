// FART QUEST — js/anims/capitals-endmarks.js
// PHIL'S CAP DISPENSER — interactive capital-letter & end-mark machine for
// the capitals-endmarks Scout Report (Full Stop Quarry). Child taps a word's
// first letter to earn it a capital (drop+pop if it's right, the cap slides
// off if it's not), then inks the ending stamp that fits the sentence's job.

import { el, sfx, toast, bubble, party, injectCss } from './_kit.js';

const PHIL_IMG = 'assets/monsters/full-stop-phil.png';
const RULE = 'Names, places, days, months, I — and every sentence start — wear the cap.';

const EARTH_TEXT = 'When you mean the actual dirt under your wellies, "earth" stays lowercase. '
  + 'But when you mean our whole <b>PLANET</b> — the third rock from the sun — it\'s a proper noun, '
  + 'so it wears the cap, just like this sentence needed.';
const FINAL_TEXT = 'Full-Stop Phil admits it: caps are a <b>physical badge</b> worn by sentence-starts '
  + 'and names, never just decoration — and the ending mark is always picked by the sentence\'s <b>JOB</b>.';

/* ---------- pure mission data (numbers/answers worked & verified) ---------- */
const MISSIONS = [
  {
    id: 'tuesday',
    label: 'TUESDAY TRIP',
    words: ['on', 'tuesday', 'jarlath', 'went', 'to', 'belfast'],
    caps: new Set([0, 1, 2, 5]),
    endMark: '.',
    job: 'telling',
    worked: 'A sentence start, a day, a name and a place all earned the cap — and this telling sentence settled under a full stop.',
  },
  {
    id: 'sausage',
    label: 'SAUSAGE ROLL?',
    words: ['where', 'is', 'my', 'sausage', 'roll'],
    caps: new Set([0]),
    endMark: '?',
    job: 'asking',
    worked: 'Only the sentence start needed the cap here — and this asking sentence needed the question mark.',
  },
  {
    id: 'iwon',
    label: 'I WON!',
    words: ['i', "can't", 'believe', 'i', 'won'],
    caps: new Set([0, 3]),
    endMark: '!',
    job: 'shouting',
    worked: '"I" wears the cap every single time, even mid-sentence — and this shout of surprise needed the exclamation mark.',
  },
  {
    id: 'earth',
    label: 'EARTH OR earth?',
    words: ['the', 'rocket', 'left', 'earth'],
    caps: new Set([0, 3]),
    endMark: '.',
    job: 'telling',
    worked: 'Earth here means the whole PLANET, not the dirt under your wellies — so it wears the cap. This telling sentence settled under a full stop.',
    earthBubble: true,
  },
];

const STAMP_DEFS = [
  { mark: '.', name: 'FULL STOP', cls: 'dot' },
  { mark: '?', name: 'QUESTION', cls: 'q' },
  { mark: '!', name: 'EXCLAIM', cls: 'bang' },
];
const markName = (m) => ({ '.': 'full stop', '?': 'question mark', '!': 'exclamation mark' }[m]);
const markCls = (m) => STAMP_DEFS.find((s) => s.mark === m).cls;
const capWord = (w) => w.charAt(0).toUpperCase() + w.slice(1);

function markMismatchText(mission, chosen) {
  const cn = markName(chosen);
  if (mission.job === 'telling') return `Read the sentence back — it's just TELLING you something. The ${cn} you've inked doesn't fit; a telling sentence needs a full stop.`;
  if (mission.job === 'asking') return `Read the sentence back — it's genuinely ASKING something. The ${cn} you've inked doesn't fit; an asking sentence needs a question mark.`;
  return `Read the sentence back — it's SHOUTING with surprise! The ${cn} you've inked doesn't fit; a shouting sentence needs an exclamation mark.`;
}

function wordHtml(word, isCapped) {
  const first = isCapped ? word.charAt(0).toUpperCase() : word.charAt(0);
  const rest = word.slice(1);
  const badge = isCapped ? '<span class="pcd-capbadge">🧢</span>' : '';
  return `<span class="pcd-first">${badge}${first}</span><span class="pcd-rest">${rest}</span>`;
}

const CSS = `
.pcd-q { text-align: center; font-weight: 700; font-size: clamp(18px, 3vw, 24px); margin-bottom: 2px; color: var(--ink); }
.pcd-qsub { text-align: center; font-size: 12.5px; color: #6b5744; font-weight: 500; margin-bottom: 10px; min-height: 16px; }
.pcd-dispenser { display: flex; justify-content: center; gap: 10px; margin-bottom: 8px; }
.pcd-capicon { font-size: 22px; animation: pcdBob 2.4s ease-in-out infinite; display: inline-block; }
.pcd-capicon:nth-child(2) { animation-delay: .3s; }
.pcd-capicon:nth-child(3) { animation-delay: .6s; }
@keyframes pcdBob { 0%,100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-5px) rotate(4deg); } }
.pcd-bench {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px 6px;
  background: var(--card); border-radius: 16px; border: 3px solid rgba(51,38,29,.14);
  padding: 18px 14px; box-shadow: inset 0 3px 8px rgba(51,38,29,.08);
}
.pcd-word {
  position: relative; background: transparent; border: none; cursor: pointer;
  font-weight: 700; font-size: clamp(17px, 2.6vw, 22px); color: var(--ink);
  padding: 6px 3px; border-radius: 9px; transition: transform .12s;
  min-width: 44px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center;
}
.pcd-word:active { transform: scale(.92); }
.pcd-word.capped { color: #1d8f4e; }
.pcd-word.landing { animation: pcdSquash .26s ease; }
@keyframes pcdSquash { 0% { transform: scale(1); } 40% { transform: scale(1.12, .88); } 100% { transform: scale(1); } }
.pcd-word.shake { animation: pcdShake .38s ease; }
@keyframes pcdShake { 0%,100% { transform: translateX(0) rotate(0); } 25% { transform: translateX(-5px) rotate(-6deg); } 70% { transform: translateX(4px) rotate(5deg); } }
.pcd-first { position: relative; display: inline-block; }
.pcd-capbadge {
  position: absolute; top: -17px; left: 50%; transform: translateX(-50%) scale(0);
  font-size: 15px; animation: pcdBadgePop .3s var(--spring) .18s forwards;
}
@keyframes pcdBadgePop { 0% { transform: translateX(-50%) scale(0) translateY(6px); opacity: 0; } 100% { transform: translateX(-50%) scale(1) translateY(0); opacity: 1; } }
.pcd-endslot {
  display: inline-flex; align-items: center; justify-content: center; min-width: 26px; height: 30px;
  font-weight: 700; font-size: 24px; color: #b9ab97; margin-left: 2px;
}
.pcd-endslot.pcd-inked { color: var(--stink); }
.pcd-endslot.mark-dot.react { animation: pcdDot .4s ease; }
@keyframes pcdDot { 0% { transform: translateY(-8px) scale(.6); } 60% { transform: translateY(2px) scale(1.15); } 100% { transform: translateY(0) scale(1); } }
.pcd-endslot.mark-q.react { animation: pcdCurl .5s ease; }
@keyframes pcdCurl { 0% { transform: rotate(0) scale(.6); } 35% { transform: rotate(-18deg) scale(1.2); } 65% { transform: rotate(14deg) scale(1.05); } 100% { transform: rotate(0) scale(1); } }
.pcd-endslot.mark-bang.react { animation: pcdJump .45s ease; }
@keyframes pcdJump { 0% { transform: translateY(0) scale(.6); } 45% { transform: translateY(-14px) scale(1.25); } 100% { transform: translateY(0) scale(1); } }
.pcd-marks { display: flex; justify-content: center; gap: 10px; margin-top: 14px; }
.pcd-stamp {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  background: var(--card); border: 3px solid var(--swamp-mid); border-radius: 13px;
  padding: 8px 16px; cursor: pointer; box-shadow: 0 3px 0 rgba(0,0,0,.2); min-height: 44px;
}
.pcd-stamp:active { transform: translateY(2px); box-shadow: 0 1px 0 rgba(0,0,0,.2); }
.pcd-stamp .pcd-stampmark { font-size: 22px; font-weight: 700; color: var(--stink); line-height: 1; }
.pcd-stamp .pcd-stampname { font-size: 9px; font-weight: 700; letter-spacing: .06em; color: #6b5744; }
.pcd-stamp.chosen { background: var(--swamp-mid); border-color: var(--swamp-mid); }
.pcd-stamp.chosen .pcd-stampmark { color: var(--stink-lime); }
.pcd-stamp.chosen .pcd-stampname { color: var(--parchment); }
.pcd-win {
  margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF);
  border: 3px solid var(--correct); border-radius: 14px; padding: 10px 14px;
  animation: pcdWinIn .34s var(--spring) both;
}
@keyframes pcdWinIn { from { transform: scale(.85) translateY(12px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
.pcd-win .pw-line { font-weight: 700; color: #1d8f4e; font-size: 17px; }
.pcd-win .pw-worked { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 3px; }
.pcd-win .btn { margin-top: 8px; padding: 10px 22px; font-size: 15px; }
.pcd-rule {
  margin-top: 12px; font-size: 13.5px; line-height: 1.35; background: linear-gradient(180deg,#FFF3CE,#FBE29A);
  border: 3px solid var(--gold-deep); border-radius: 14px; padding: 10px 14px; color: #5a4408; font-weight: 700;
}
`;

/* ---------- the anim card ---------- */
export default {
  id: 'capitals-endmarks',
  title: "PHIL'S CAP DISPENSER",

  mount(host, ctx) {
    injectCss('capitals-endmarks', CSS);
    let alive = true;
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'pcd-q');
    const qsub = el('div', 'pcd-qsub');
    const dispenser = el('div', 'pcd-dispenser', '<span class="pcd-capicon">🧢</span><span class="pcd-capicon">🧢</span><span class="pcd-capicon">🧢</span>');
    const bench = el('div', 'pcd-bench');
    const marksRow = el('div', 'pcd-marks');
    const winBox = el('div');
    const controls = el('div', 'anim-controls');
    const lock = el('button', 'btn btn-gold', 'STAMP IT! 💨');
    const reset = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(lock, reset);
    const ruleCard = el('div', 'pcd-rule', RULE);
    stage.append(chiprow, q, qsub, dispenser, bench, marksRow, winBox, controls, ruleCard);
    host.append(stage);

    const doneSet = new Set();
    let completed = false;
    let gen = 0;
    let mi = 0;
    let mission = null;
    let capped = null;
    let pending = null;
    let currentMark = null;
    let wordEls = [];
    let stampBtns = [];
    let endSlotEl = null;

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), m.label);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
    }

    function updateSub() {
      qsub.textContent = capped.size < mission.caps.size
        ? 'Tap the words that need to wear the cap.'
        : "Now stamp the ending mark that fits this sentence's job.";
    }

    function buildBench() {
      bench.innerHTML = '';
      wordEls = mission.words.map((w, i) => {
        const btn = el('button', 'pcd-word', wordHtml(w, capped.has(i)));
        if (capped.has(i)) btn.classList.add('capped');
        btn.type = 'button';
        btn.addEventListener('click', () => tapWord(i));
        bench.append(btn);
        return btn;
      });
      endSlotEl = el('span', 'pcd-endslot', currentMark || '_');
      if (currentMark) endSlotEl.classList.add('pcd-inked', 'mark-' + markCls(currentMark));
      bench.append(endSlotEl);
    }

    function buildMarks() {
      marksRow.innerHTML = '';
      stampBtns = STAMP_DEFS.map((s) => {
        const b = el('button', 'pcd-stamp' + (currentMark === s.mark ? ' chosen' : ''),
          `<span class="pcd-stampmark">${s.mark}</span><span class="pcd-stampname">${s.name}</span>`);
        b.type = 'button';
        b.dataset.mark = s.mark;
        b.addEventListener('click', () => chooseMark(s.mark));
        marksRow.append(b);
        return b;
      });
    }

    function tapWord(i) {
      if (!alive || !mission) return;
      if (capped.has(i) || pending.has(i)) { sfx.ui(); return; }
      const word = mission.words[i];
      const btn = wordEls[i];
      if (mission.caps.has(i)) {
        pending.add(i);
        sfx.drop();
        const myGen = gen;
        btn.classList.remove('landing'); void btn.offsetWidth; btn.classList.add('landing');
        later(() => {
          if (!alive) return;
          // A mission switch (chip/reset) during this 220ms window reassigns
          // capped/pending/mission to a fresh mission's state; without this
          // generation check a stale timer would mutate the NEW mission's
          // capped Set with an index from the OLD mission, corrupting its
          // progress count and letting STAMP IT succeed without the child
          // ever tapping the new bench (dominant bug class: stale later()
          // firing across a mission switch).
          if (myGen !== gen) return;
          pending.delete(i);
          // capped is only added to the model HERE, in lockstep with the visual
          // flip, so a CHECK click can never quote a word as capped a beat
          // before its tile actually shows the capital (rule 2).
          capped.add(i);
          btn.classList.add('capped');
          btn.innerHTML = wordHtml(word, true);
          sfx.pop();
          updateSub();
          if (capped.size === mission.caps.size) toast(stage, 'All caps found! Now stamp the ending. 🧢');
        }, 220);
      } else {
        btn.classList.remove('shake'); void btn.offsetWidth; btn.classList.add('shake');
        sfx.nudge();
        toast(stage, 'Caps are earned, not worn for fun 🧢');
      }
    }

    function chooseMark(mark) {
      if (!alive || !mission) return;
      currentMark = mark;
      stampBtns.forEach((b) => b.classList.toggle('chosen', b.dataset.mark === mark));
      endSlotEl.textContent = mark;
      endSlotEl.className = 'pcd-endslot pcd-inked mark-' + markCls(mark);
      void endSlotEl.offsetWidth;
      endSlotEl.classList.add('react');
      sfx.thud();
    }

    function win() {
      doneSet.add(mission.id);
      sfx.win();
      party(stage);
      paintChips();
      const sentence = mission.words.map((w, i) => (capped.has(i) ? capWord(w) : w)).join(' ') + currentMark;
      const w = el('div', 'pcd-win', `<div class="pw-line">${sentence}</div><div class="pw-worked">${mission.worked}</div>`);
      const nextIdx = MISSIONS.findIndex((m2) => !doneSet.has(m2.id));
      if (nextIdx !== -1) {
        const nb = el('button', 'btn btn-gold', 'NEXT MISSION ➡');
        nb.addEventListener('click', () => { sfx.ui(); start(nextIdx); });
        w.append(nb);
      }
      winBox.innerHTML = '';
      winBox.append(w);
      if (mission.earthBubble) {
        later(() => { if (alive) bubble(stage, { title: 'EARTH OR earth? 🌍', text: EARTH_TEXT, img: PHIL_IMG }); }, 350);
      }
      if (!completed && doneSet.size === MISSIONS.length) {
        completed = true;
        ctx.complete();
        later(() => { if (alive) bubble(stage, { title: 'CAP MASTER! 🎩', text: FINAL_TEXT, img: PHIL_IMG }); }, mission.earthBubble ? 950 : 400);
      }
    }

    lock.addEventListener('click', () => {
      if (!mission) return;
      if (capped.size < mission.caps.size) {
        sfx.nudge();
        bubble(stage, { title: 'CAPS STILL WAITING', text: 'Some words are still waiting for their cap — look for sentence starts, names, places, days, months, or the word "I".', img: PHIL_IMG });
        return;
      }
      if (!currentMark) {
        sfx.nudge();
        toast(stage, "Phil needs an ending mark inked before he'll stamp this sentence!");
        return;
      }
      if (currentMark !== mission.endMark) {
        sfx.nudge();
        bubble(stage, { title: 'WRONG JOB FOR THAT STAMP', text: markMismatchText(mission, currentMark), img: PHIL_IMG });
        return;
      }
      sfx.ui();
      win();
    });

    reset.addEventListener('click', () => { sfx.ui(); start(mi); });

    function start(i) {
      gen++;
      mi = i;
      mission = MISSIONS[i];
      capped = new Set();
      pending = new Set();
      currentMark = null;
      winBox.innerHTML = '';
      q.textContent = mission.label;
      paintChips();
      updateSub();
      buildBench();
      buildMarks();
    }

    // no live drag/tween holds pixel state here (words flow via flexbox), but
    // per contract a resize pass still clears any transient tap animations
    // rather than leaving them stuck mid-flight on a relayout.
    const onResize = () => {
      if (!alive) return;
      wordEls.forEach((b) => b.classList.remove('shake', 'landing'));
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
      stage.remove();
    };
  },
};
