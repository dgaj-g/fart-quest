// FART QUEST — js/anims/apostrophes.js
// IT'S-ITS JUNCTION — a railway junction where sentence-trains roll in with
// one highlighted word. The child pulls a lever to send the train down the
// track that matches the word's JOB: OWNER (possession), SQUEEZER (letters
// squeezed out), or NO MARK (belonging pronoun / plain plural — nothing
// earned). Wrong track: the train reverses to the junction with a warm
// whistle. Right track: the train arrives and the proof lights up.

import { el, sfx, tween, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const CREATURE_IMG = 'assets/monsters/its-its-the-confused.png';
const RULE = "An apostrophe either OWNS something (the dog's ball) or SQUEEZES letters out (it's = it is). Its without an apostrophe = belonging.";

/* ---------- pure content: every mission is a sentence + the ONE correct
   track for its highlighted word. Sentences are already correctly written —
   the child's job is to classify, never to edit. Verified against the brief
   in a /tmp scratch script: every `target` string appears verbatim as a
   whole word in its `sentence`. ---------- */
const MISSIONS = [
  {
    id: 'owner1', sentence: "the dog's ball bounced", target: "dog's", track: 'owner',
    owner: 'dog', owned: 'ball',
    worked: "The dog's ball is OWNED by the dog — one owner, so the apostrophe sits before the s.",
  },
  {
    id: 'squeeze1', sentence: "it's raining again", target: "it's", track: 'squeezer',
    squeezeTo: 'it is',
    worked: "It's raining means it is raining — a SQUEEZE. Un-squeeze it and the sentence still makes perfect sense.",
  },
  {
    id: 'nomark1', sentence: 'the cat licked its paw', target: 'its', track: 'nomark',
    reason: 'its = belonging, like his and hers — no mark at all',
    worked: 'The paw belongs to the cat, but its never wears an apostrophe — just like his and hers.',
  },
  {
    id: 'nomark2', sentence: 'the dogs barked all night', target: 'dogs', track: 'nomark',
    reason: 'a plain plural earns nothing',
    worked: 'Just several dogs, barking all together — a plain plural earns nothing.',
  },
];
const WIN_PHRASES = ['FULL STEAM, RIGHT TRACK! 🚂', 'JUNCTION CLEARED! 💨', 'SORTED PERFECTLY! 🎩', 'NO DERAILING THERE!'];

/* ---------- feedback for a WRONG lever pull — every line states a fact
   true of the sentence currently on screen, never a fabricated proof. ---------- */
function mismatchText(mission, chosen) {
  const w = mission.target;
  if (mission.track === 'owner') {
    if (chosen === 'squeezer') {
      const bare = w.replace("'s", '');
      return `Try un-squeezing "${w}" — "${bare} is ${mission.owned}"? That's nonsense. This mark is OWNING something, not squeezing.`;
    }
    return `Look again — the ${mission.owned} BELONGS to the ${mission.owner}. That earns an apostrophe, not a bare word.`;
  }
  if (mission.track === 'squeezer') {
    if (chosen === 'owner') return `Nothing is being OWNED here. Try un-squeezing "${w}" instead — does it fall apart into two real words?`;
    return `That tiny mark IS doing a job here — un-squeeze "${w}" and see what two words fall out.`;
  }
  // nomark
  if (chosen === 'owner') {
    return mission.id === 'nomark1'
      ? `"${w}" already means belonging all by itself — like his or hers, it never wears an apostrophe.`
      : "Is anything actually being OWNED here? No — it's simply several of them, with nothing to own.";
  }
  return `Try un-squeezing "${w}" — it doesn't turn into two words here. No squeeze, no apostrophe.`;
}

function renderSentence(mission) {
  return mission.sentence.split(' ')
    .map((wd) => (wd === mission.target ? `<span class="iij-target">${wd}</span>` : wd))
    .join(' ');
}
function renderProof(mission) {
  if (mission.track === 'owner') {
    return `<div class="iij-proofrow"><span class="iij-chip iij-chip-owner">${mission.owner}</span>`
      + `<span class="iij-arrowtxt">owns</span><span class="iij-chip iij-chip-owner">${mission.owned}</span></div>`;
  }
  if (mission.track === 'squeezer') {
    return `<div class="iij-proofrow"><span class="iij-chip iij-chip-squeeze">${mission.target}</span>`
      + `<span class="iij-arrowtxt">=</span><span class="iij-chip iij-chip-squeeze">${mission.squeezeTo}</span>`
      + '<span class="iij-check">✓</span></div>';
  }
  return `<div class="iij-proofrow"><span class="iij-proofbadge">NO APOSTROPHE — ${mission.reason}</span></div>`;
}

/* ---------- quadratic-bezier junction geometry (percent coords, matches
   the static SVG track lines drawn once at mount) ---------- */
const JUNCTION = { x: 50, y: 10 };
const TRACK_PATHS = {
  owner: { p0: JUNCTION, c: { x: 26, y: 50 }, p1: { x: 12, y: 88 } },
  nomark: { p0: JUNCTION, c: { x: 50, y: 50 }, p1: { x: 50, y: 88 } },
  squeezer: { p0: JUNCTION, c: { x: 74, y: 50 }, p1: { x: 88, y: 88 } },
};
function bez(p0, c, p1, t) {
  const mt = 1 - t;
  return { x: mt * mt * p0.x + 2 * mt * t * c.x + t * t * p1.x, y: mt * mt * p0.y + 2 * mt * t * c.y + t * t * p1.y };
}

/* ---------- the anim card ---------- */
export default {
  id: 'apostrophes',
  title: "IT'S-ITS JUNCTION",

  mount(host, ctx) {
    let alive = true;
    let mi = 0;
    let mission = MISSIONS[0];
    let busy = false;
    let currentPathKey = null; // null == train sits idle at the junction
    let travelT = 0;
    let cancelTravel = null;
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'iij-q');
    const qsub = el('div', 'iij-qsub',
      'LEFT pulls to OWNER. RIGHT pulls to SQUEEZER. STRAIGHT ON needs NO MARK at all. Read the glowing word, then pull a lever.');
    const trackWrap = el('div', 'iij-junction');
    const svgHost = el('div', 'iij-svghost');
    svgHost.innerHTML = `<svg class="iij-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path class="iij-track owner" d="M ${TRACK_PATHS.owner.p0.x} ${TRACK_PATHS.owner.p0.y} Q ${TRACK_PATHS.owner.c.x} ${TRACK_PATHS.owner.c.y} ${TRACK_PATHS.owner.p1.x} ${TRACK_PATHS.owner.p1.y}"/>
      <path class="iij-track nomark" d="M ${TRACK_PATHS.nomark.p0.x} ${TRACK_PATHS.nomark.p0.y} Q ${TRACK_PATHS.nomark.c.x} ${TRACK_PATHS.nomark.c.y} ${TRACK_PATHS.nomark.p1.x} ${TRACK_PATHS.nomark.p1.y}"/>
      <path class="iij-track squeezer" d="M ${TRACK_PATHS.squeezer.p0.x} ${TRACK_PATHS.squeezer.p0.y} Q ${TRACK_PATHS.squeezer.c.x} ${TRACK_PATHS.squeezer.c.y} ${TRACK_PATHS.squeezer.p1.x} ${TRACK_PATHS.squeezer.p1.y}"/>
    </svg>`;
    const trainIcon = el('div', 'iij-train', '🚂');
    trackWrap.append(svgHost, trainIcon);
    const leverRow = el('div', 'iij-leverrow');
    const bOwner = el('button', 'iij-lever owner', 'OWNER<br><span class="iij-sub">owns something</span>');
    const bNomark = el('button', 'iij-lever nomark', 'NO MARK<br><span class="iij-sub">nothing owned, nothing squeezed</span>');
    const bSqueeze = el('button', 'iij-lever squeezer', 'SQUEEZER<br><span class="iij-sub">letters squeezed out</span>');
    leverRow.append(bOwner, bNomark, bSqueeze);
    const winBox = el('div');
    stage.append(chiprow, q, qsub, trackWrap, leverRow, winBox);
    host.append(stage);

    const ruleCard = el('div', 'iij-rulecard', RULE);
    host.append(ruleCard);

    function setButtonsEnabled(v) {
      [bOwner, bNomark, bSqueeze].forEach((b) => { b.disabled = !v; });
    }
    function applyTrainPos() {
      if (!currentPathKey) { trainIcon.style.left = JUNCTION.x + '%'; trainIcon.style.top = JUNCTION.y + '%'; return; }
      const path = TRACK_PATHS[currentPathKey];
      const p = bez(path.p0, path.c, path.p1, travelT);
      trainIcon.style.left = p.x + '%'; trainIcon.style.top = p.y + '%';
    }

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), `${m.target}`);
        c.addEventListener('click', () => { sfx.ui(); startMission(i); });
        chiprow.append(c);
      });
    }

    function startMission(i) {
      mi = i; mission = MISSIONS[i]; busy = false;
      if (cancelTravel) { cancelTravel(); cancelTravel = null; }
      currentPathKey = null; travelT = 0;
      applyTrainPos();
      winBox.innerHTML = '';
      q.innerHTML = renderSentence(mission);
      setButtonsEnabled(true);
      paintChips();
    }

    function reverseBack(key) {
      sfx.nudge();
      toast(stage, mismatchText(mission, key));
      // currentPathKey stays 'key' throughout so applyTrainPos() keeps
      // reading the right curve while travelT eases back from 1 to 0
      cancelTravel = tween((v) => { travelT = v; applyTrainPos(); }, 1, 0, 480, () => {
        cancelTravel = null;
        currentPathKey = null; travelT = 0; applyTrainPos();
        busy = false; setButtonsEnabled(true);
      });
    }

    function finishMission() {
      doneSet.add(mission.id);
      sfx.sparkle();
      const tr = trainIcon.getBoundingClientRect();
      const sr = stage.getBoundingClientRect();
      sparkleBurst(stage, tr.left - sr.left + tr.width / 2, tr.top - sr.top + tr.height / 2, 10);
      paintChips();
      sfx.win(); party(stage, 12);
      const phrase = WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)];
      const w = el('div', 'iij-win', `<div class="iij-wp">${phrase}</div>${renderProof(mission)}<div class="iij-wk">${mission.worked}</div>`);
      winBox.innerHTML = ''; winBox.append(w);
      const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
      const nb = el('button', 'btn btn-gold', nextIdx !== -1 ? 'NEXT ONE ➡' : 'PLAY AGAIN 🔁');
      nb.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
      nb.addEventListener('click', () => { sfx.ui(); startMission(nextIdx !== -1 ? nextIdx : 0); });
      w.append(nb);
      if (doneSet.size === MISSIONS.length) {
        ctx.complete();
        later(() => {
          if (!alive) return;
          bubble(stage, {
            title: 'JUNCTION MASTERED! 🚂',
            text: "Every apostrophe is doing exactly ONE of two jobs — OWNING or SQUEEZING — and its/it's is settled by the un-squeeze proof, never by guessing.",
            img: CREATURE_IMG,
          });
        }, 700);
      }
    }

    function pullLever(key) {
      if (busy || !mission) return;
      busy = true; setButtonsEnabled(false);
      sfx.ui(); sfx.whoosh();
      currentPathKey = key;
      const correct = key === mission.track;
      cancelTravel = tween((v) => { travelT = v; applyTrainPos(); }, 0, 1, 620, () => {
        cancelTravel = null;
        if (correct) finishMission(); else reverseBack(key);
      });
    }
    bOwner.addEventListener('click', () => pullLever('owner'));
    bNomark.addEventListener('click', () => pullLever('nomark'));
    bSqueeze.addEventListener('click', () => pullLever('squeezer'));

    const onResize = () => {
      if (!alive) return;
      const wasTravelling = !!cancelTravel;
      if (cancelTravel) { cancelTravel(); cancelTravel = null; }
      if (wasTravelling && !doneSet.has(mission.id)) {
        // abandon ANY live tween on relayout (forward check or reverse
        // whistle-back) rather than guess where it was heading
        currentPathKey = null; travelT = 0; busy = false; setButtonsEnabled(true);
      }
      applyTrainPos();
    };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    startMission(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      if (cancelTravel) cancelTravel();
      timers.forEach((t) => clearTimeout(t));
      stage.remove();
      ruleCard.remove();
    };
  },
};

const CSS = `
.iij-q { text-align: center; font-weight: 700; font-size: clamp(19px, 3vw, 26px); margin-bottom: 2px; line-height: 1.3; }
.iij-target { background: var(--gold); color: #3a2c05; padding: 1px 9px; border-radius: 8px; box-shadow: 0 2px 0 rgba(0,0,0,.2); }
.iij-qsub { text-align: center; font-size: 12.5px; color: #6b5744; font-weight: 500; margin-bottom: 10px; max-width: 560px; margin-left: auto; margin-right: auto; }
.iij-junction { position: relative; width: 100%; max-width: 520px; aspect-ratio: 10 / 8; margin: 0 auto; }
.iij-svghost { position: absolute; inset: 0; }
.iij-svg { display: block; width: 100%; height: 100%; }
.iij-track { fill: none; stroke-width: 2.4; stroke-dasharray: 6 6; opacity: .5; }
.iij-track.owner { stroke: #3B6FD1; }
.iij-track.nomark { stroke: #8a7a63; }
.iij-track.squeezer { stroke: #9B59D0; }
.iij-train {
  position: absolute; transform: translate(-50%, -50%); font-size: 30px;
  filter: drop-shadow(0 3px 4px rgba(0,0,0,.35)); pointer-events: none; z-index: 5;
  animation: iijChug 1.1s ease-in-out infinite;
}
@keyframes iijChug { 0%, 100% { margin-top: 0; } 50% { margin-top: -3px; } }
.iij-leverrow { display: flex; justify-content: center; gap: 10px; margin-top: 8px; flex-wrap: wrap; }
.iij-lever {
  flex: 1 1 140px; max-width: 190px; border-radius: 16px; border: 3px solid; padding: 10px 8px;
  font-weight: 800; font-size: 13.5px; cursor: pointer; min-height: 56px; color: #fff;
  box-shadow: 0 4px 0 rgba(0,0,0,.25);
}
.iij-lever .iij-sub { display: block; font-size: 9.5px; font-weight: 600; opacity: .85; margin-top: 2px; }
.iij-lever:active { transform: translateY(3px); box-shadow: 0 1px 0 rgba(0,0,0,.25); }
.iij-lever:disabled { opacity: .5; cursor: default; }
.iij-lever.owner { background: linear-gradient(180deg,#5C8DEE,#3B6FD1); border-color: #274c99; }
.iij-lever.nomark { background: linear-gradient(180deg,#A79579,#8a7a63); border-color: #5f523d; }
.iij-lever.squeezer { background: linear-gradient(180deg,#B478E4,#9B59D0); border-color: #5e3387; }
.iij-win {
  margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF);
  border: 3px solid var(--correct); border-radius: 14px; padding: 10px 14px;
  animation: animBubbleIn .34s var(--spring) both;
}
.iij-wp { font-weight: 700; color: #1d8f4e; font-size: 16px; }
.iij-wk { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 6px; }
.iij-proofrow { display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; margin: 8px 0; }
.iij-chip { background: #fff; border: 2.5px solid var(--ink); border-radius: 10px; padding: 4px 10px; font-weight: 700; }
.iij-chip-owner { border-color: #274c99; color: #274c99; }
.iij-chip-squeeze { border-color: #5e3387; color: #5e3387; }
.iij-arrowtxt { font-weight: 700; color: #6b5744; }
.iij-check { color: #1d8f4e; font-weight: 800; font-size: 18px; }
.iij-proofbadge {
  background: #FFF3D0; border: 2.5px solid var(--gold-deep); color: #5a4408; padding: 6px 14px;
  border-radius: 12px; font-weight: 700; display: inline-block;
}
.iij-rulecard {
  margin-top: 12px; font-size: 13.5px; line-height: 1.35; background: linear-gradient(180deg,#FFF3CE,#FBE29A);
  border: 3px solid var(--gold-deep); border-radius: 14px; padding: 10px 14px; color: #5a4408;
  font-weight: 700; max-width: 980px; margin-left: auto; margin-right: auto;
}
`;
injectCss('apostrophes', CSS);
