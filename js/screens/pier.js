// FART QUEST — js/screens/pier.js (HUB/CHASSIS agent)
// WHIFF-END PIER — the seaside times-tables arcade world. This single screen
// module handles BOTH routes: `#/pier` (the hub — cabinet cards, DELUXE
// lever, flushed-gremlin counter) and `#/pier/:mode` (mounts one of the five
// machine modules full-screen). See docs/PIER_SPEC.md §3/§4/§8 and
// docs/PIER_REWORK.md (THE binding fix contract, esp. §1 THE LAYOUT LAW and
// §2/#6 the caption-bar policy) for what this file implements.
//
// REWORK v2 (this pass) — chassis changes, see css/pier.css's header comment
// block for the full contract this file + css/pier.css + js/pier/padkit.js
// together establish:
// - `.pier-screen` is now the mandatory flex column (hud/stage/dock or, for
//   modes, a single flex:1 `.pier-mode-host`) — THE LAYOUT LAW, §1.
// - A mute button (🔊/🔇, always ≥60px, contract §4) is built ONCE here and
//   is screen-level (position:fixed) so it exists on every route regardless
//   of whether a given mode has adopted the new chassis yet.
// - The hub is rebuilt compact enough to fit 1000×540 with the DELUXE lever
//   on screen with zero scrolling (§1/§3 "hub").
// - pier.say() (the caption bar) now refuses to echo text a welcome/end
//   overlay is already showing verbatim — see padkit.js's
//   markOnScreen()/isOnScreen() and the §2/#6 comment on `say()` below.
//
// Cross-agent contract notes (read before touching this file):
// - `js/pier/facts.js` (ENGINE agent) is imported statically — it's already
//   on disk and its exports are frozen per §5, so this mirrors how the rest
//   of the app imports firm sibling modules (e.g. lesson.js -> anims/index.js).
// - `js/pier/content.js` (CONTENT agent) did NOT exist yet at the time this
//   file was originally written. Rather than let a still-landing content
//   module take the WHOLE APP down (main.js statically imports this screen,
//   so a failed static import here would fail main.js's module graph too),
//   content.js is loaded defensively via a dynamic import with a safe empty-
//   shape fallback (see `ensureContent()` below). Once content.js lands with
//   the shape described in §9 (`nana`/`announcer`/`dave`/`gremlin` line
//   pools, each entry `{id, text}`), captions pick it up with zero code
//   changes here.
// - The "pier kit" object passed to every mode's `mount(host, ctx, pier)` is
//   `{ facts, content, say, deluxe, mountChassis }` — `facts` is the engine
//   module, one `content` slice per §9's namespaces, `say(entry)` is this
//   file's caption bar (also used internally by the hub), `deluxe` is a
//   boolean snapshot of `facts.deluxeOn()` taken at mount time (modes don't
//   need it to change live under them — the lever lives on the hub, a
//   different route/mount), and `mountChassis` is `js/pier/padkit.js`'s
//   chassis builder PRE-BOUND to this mode's `host` element — a convenience
//   on top of `{facts,content,say,deluxe}` (§4's frozen list); a mode may
//   equally `import { mountChassis } from '../padkit.js'` directly and call
//   `mountChassis(host, opts)` itself. Both are the identical function.

import facts from '../pier/facts.js';
import { el, sfx as animSfx } from '../anims/_kit.js';
import { mulberry32, pick } from '../rng.js';
import { mountChassis, buildMuteButton, isOnScreen } from '../pier/padkit.js';

import splat from '../pier/modes/splat.js';
import gunge from '../pier/modes/gunge.js';
import ghost from '../pier/modes/ghost.js';
import teacups from '../pier/modes/teacups.js';
import tank from '../pier/modes/tank.js';

const MODES = { splat, gunge, ghost, teacups, tank };
const MODE_ORDER = ['splat', 'gunge', 'ghost', 'teacups', 'tank'];

// Supplementary hub-only display metadata for each cabinet. title/blurb are
// deliberately NOT duplicated here — those come straight off each mode
// module (§4: "title: cabinet name", "blurb: hub card one-liner"), so a real
// mode landing over its stub updates the hub card copy with zero edits here.
// `short` is a NEW, hub-only addition (this rework): the compact 5-cards-in-
// one-row hub grid (§1/§3 "hub" — must fit 1000×540 with zero scroll) has no
// room for a mode's full cabinet name ("SPLAT-A-GREMLIN" etc.) at readable
// size — `mod.title` is still used everywhere else (welcome/end screens,
// document semantics); this is purely a tighter hub-tile label.
const MACHINE_META = {
  splat: {
    emoji: '🔨', short: 'SPLAT', tiers: true, metric: 'score', direction: 'high', fmt: (b) => `${b.score} splat${b.score === 1 ? '' : 's'} in 60s`,
  },
  gunge: {
    emoji: '🪣', short: 'GUNGE', tiers: true, metric: 'seconds', direction: 'high', fmt: (b) => `${b.seconds}s survived`,
  },
  ghost: {
    emoji: '👻', short: 'GHOST', tiers: true, metric: 'ms', direction: 'low', fmt: (b) => formatMs(b.ms),
  },
  teacups: { emoji: '🍵', short: 'CUPS', tiers: false },
  tank: { emoji: '🫧', short: 'TANK', tiers: false },
};

const TIER_ORDER = ['bronze', 'silver', 'gold'];
const TIER_ICON = { bronze: '🥉', silver: '🥈', gold: '🥇' };

const CHAR_META = {
  nana: { emoji: '👵', label: 'NANA WINDBREAKER', cls: 'ct-nana' },
  announcer: { emoji: '📣', label: 'PIER TANNOY', cls: 'ct-announcer' },
  dave: { emoji: '🐦', label: 'DAVE', cls: 'ct-dave' },
  gremlin: { emoji: '👺', label: 'GAS GREMLIN', cls: 'ct-gremlin' },
};

/* ---------- tiny helpers ---------- */
function formatMs(ms) {
  if (typeof ms !== 'number' || !Number.isFinite(ms)) return '—';
  const totalSec = ms / 1000;
  const m = Math.floor(totalSec / 60);
  const s = totalSec - m * 60;
  return m > 0 ? `${m}m ${s.toFixed(2)}s` : `${s.toFixed(2)}s`;
}
function freshRng() {
  return mulberry32((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
}
function pickLine(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return pick(freshRng(), arr);
}
function characterFromId(id) {
  const seg = String(id || '').split('-');
  return seg[1] || 'nana';
}

/* ---------- content.js (CONTENT agent) — dynamic + defensive, see header ---------- */
const EMPTY_CONTENT = { nana: {}, announcer: {}, dave: {}, gremlin: {} };
let content = EMPTY_CONTENT;
let contentLoadPromise = null;
function ensureContent() {
  if (contentLoadPromise) return contentLoadPromise;
  contentLoadPromise = import('../pier/content.js')
    .then((mod) => {
      const raw = (mod && mod.default) ? mod.default : mod;
      content = {
        nana: (raw && raw.nana) || {},
        announcer: (raw && raw.announcer) || {},
        dave: (raw && raw.dave) || {},
        gremlin: (raw && raw.gremlin) || {},
      };
    })
    .catch(() => { content = EMPTY_CONTENT; /* not landed yet — pier stays fully playable, just caption-quiet */ });
  return contentLoadPromise;
}

/* ---------- caption bar (§9, policy per REWORK §2/#6) — implemented once
   here, shared by hub + every mode via pier.say() ---------- */
function buildCaptionBar(ctx) {
  const bar = el('div', 'pier-caption-bar');
  const avatar = el('div', 'pier-caption-avatar');
  const body = el('div', 'pier-caption-body');
  const tag = el('div', 'pier-caption-tag');
  const text = el('div', 'pier-caption-text');
  body.append(tag, text);
  bar.append(avatar, body);
  let hideTimer = null;

  function say(entry) {
    if (!entry || !entry.text) return;
    // VO always attempts (it's audio, not a second VISIBLE copy of the line)
    // even when the caption bubble itself is suppressed below.
    try { ctx.audio.vo(entry.id); } catch (e) { /* vo() never throws, but never trust it from here */ }
    // §2/#6, binding: "the caption bar must not echo text already displayed
    // on screen" — a welcome/end/ceremony card built via padkit.js's
    // overlay({..., speaks: entry}) has already registered its text; skip
    // the bubble entirely rather than print the same line twice at once
    // (the exact v1 bug this rework fixes).
    if (isOnScreen(entry.text)) return;
    clearTimeout(hideTimer);
    const meta = CHAR_META[characterFromId(entry.id)] || CHAR_META.nana;
    avatar.textContent = meta.emoji;
    tag.textContent = meta.label;
    bar.classList.remove('ct-nana', 'ct-announcer', 'ct-dave', 'ct-gremlin');
    bar.classList.add(meta.cls);
    text.textContent = entry.text;
    bar.classList.remove('show');
    void bar.offsetWidth; // restart the enter animation even on rapid-fire says
    bar.classList.add('show');
    hideTimer = setTimeout(() => bar.classList.remove('show'), 5200);
  }

  return {
    el: bar,
    say,
    destroy() {
      clearTimeout(hideTimer);
      bar.remove();
    },
  };
}

/* ---------- DELUXE lever ---------- */
function buildLever(ctx, deluxeOn, caption, grid) {
  const wrap = el('div', 'pier-lever-wrap');
  wrap.innerHTML = `
    <div class="pier-lever-label">DELUXE<span>adds 11s &amp; 12s facts</span></div>
    <button type="button" class="pier-lever${deluxeOn ? ' on' : ''}" aria-pressed="${deluxeOn}">
      <span class="pier-lever-track"><span class="pier-lever-knob"></span></span>
    </button>
    <div class="pier-lever-state">${deluxeOn ? 'ON' : 'OFF'}</div>
  `;
  const btn = wrap.querySelector('.pier-lever');
  const stateEl = wrap.querySelector('.pier-lever-state');

  btn.addEventListener('click', async () => {
    if (btn.disabled) return;
    btn.disabled = true;
    const next = !btn.classList.contains('on');
    try { await facts.setDeluxe(next); } catch (e) { /* best-effort persistence */ }
    btn.classList.toggle('on', next);
    btn.setAttribute('aria-pressed', String(next));
    stateEl.textContent = next ? 'ON' : 'OFF';
    ctx.audio.sfx(next ? 'unlock' : 'click');
    const line = pickLine(next ? content.nana.deluxeOn : content.nana.deluxeOff);
    if (line) caption.say(line);
    const note = grid.querySelector('[data-machine="teacups"] .pier-cab-note');
    if (note) note.textContent = `Tables ${next ? '2–12' : '2–10'}`;
    btn.disabled = false;
  });

  return wrap;
}

/* ---------- cabinet card ---------- */
function tierChips(modeId, bestVal) {
  const tiers = facts.nanaTiers(modeId);
  if (!tiers) return '';
  const meta = MACHINE_META[modeId];
  return TIER_ORDER.map((t) => {
    const threshold = tiers[t];
    const achieved = bestVal != null && threshold != null
      && (meta.direction === 'high' ? bestVal >= threshold : bestVal <= threshold);
    return `<span class="pier-tier-chip${achieved ? ' achieved' : ''}" title="${t}">${TIER_ICON[t]}</span>`;
  }).join('');
}

function buildCabinetCard(modeId, ctx, bests) {
  const mod = MODES[modeId];
  const meta = MACHINE_META[modeId];
  const best = bests[modeId];
  const card = el('div', 'pier-cab' + (meta.tiers ? '' : ' pier-cab-plain'));
  card.dataset.machine = modeId;

  let subHtml = '';
  if (meta.tiers) {
    const bestVal = best ? best[meta.metric] : null;
    const trophy = best && best.goldSeen ? '<span class="pier-trophy" title="Gold beaten!">🏆</span>' : '';
    subHtml = `<div class="pier-cab-sub">`
      + `<span class="pier-cab-pb">${best ? meta.fmt(best) : 'no PB yet'}</span>`
      + `<span class="pier-tier-row">${tierChips(modeId, bestVal)}${trophy}</span>`
      + `</div>`;
  } else if (modeId === 'teacups') {
    subHtml = `<div class="pier-cab-note">Tables ${facts.deluxeOn() ? '2–12' : '2–10'}</div>`;
  }

  card.innerHTML = `
    <div class="pier-cab-head"><span class="pier-cab-emoji">${meta.emoji}</span><h3>${meta.short}</h3></div>
    <div class="pier-cab-blurb">${mod.blurb}</div>
    ${subHtml}
    <button type="button" class="btn btn-gold pier-cab-play">PLAY</button>
  `;
  card.querySelector('.pier-cab-play').addEventListener('click', () => {
    ctx.audio.sfx('confirm');
    ctx.go(`#/pier/${modeId}`);
  });
  return card;
}

/* ---------- hub view ---------- */
async function mountHub(screen, ctx, caption) {
  screen.classList.add('pier-hub-screen');
  await ensureContent();

  let bests = {};
  try { bests = (await facts.getBests()) || {}; } catch (e) { bests = {}; }
  let flushedCount = 0;
  try { flushedCount = facts.flushed() || 0; } catch (e) { flushedCount = 0; }

  const chassis = mountChassis(screen, {
    onBack: () => { ctx.audio.sfx('back'); ctx.go('#/map'); },
    backLabel: '← MAP',
    hudClass: 'pier-hub-hud',
    stageClass: 'pier-hub-stage',
    dockClass: 'pier-hub-dock',
  });

  const title = el('div', 'pier-hub-title', '🎡 WHIFF-END PIER');
  const flushedChip = el('div', 'pier-flushed-chip', `🚽 <b>${flushedCount}</b> gremlin${flushedCount === 1 ? '' : 's'} flushed`);
  chassis.hud.append(title, flushedChip);

  const grid = el('div', 'pier-cabinets');
  MODE_ORDER.forEach((id) => grid.appendChild(buildCabinetCard(id, ctx, bests)));
  chassis.stage.append(grid);

  chassis.dock.append(buildLever(ctx, facts.deluxeOn(), caption, grid));

  const welcomeLine = pickLine(content.nana.welcome);
  if (welcomeLine) caption.say(welcomeLine);
}

/* ---------- module-scope teardown refs (router calls unmount() before every re-mount) ---------- */
let activeModeCleanup = null;
let activeCaption = null;

export async function mount(root, ctx, params) {
  // Sounds-toggle mirror (exact pattern as renderAnimCard in js/screens/lesson.js)
  // — the anim-kit synth is a page-global singleton, so this keeps it honouring
  // a Sounds preference flipped before this session's first anim/pier visit.
  animSfx.setEnabled(ctx.prefs.sfxOn !== false);
  // Same track keeps playing across every pier route — music() early-returns
  // when the requested track is already the active one.
  ctx.audio.music('pier');

  try { await facts.load(ctx); } catch (e) { /* pier still renders; bests/gremlins just read as empty */ }

  const modeId = params && params.mode;
  const mod = modeId ? MODES[modeId] : null;

  if (modeId && !mod) {
    // Unknown mode -> hub + toast (§4). Route back through the real '/pier'
    // hash rather than hand-rendering a fallback here, so there's exactly one
    // code path that ever builds the hub UI.
    ctx.toast("That cabinet's not built yet, pet — back to the pier!");
    ctx.go('#/pier');
    return;
  }

  const screen = el('div', 'pier-screen screen enter-pop');
  root.appendChild(screen);

  const caption = buildCaptionBar(ctx);
  screen.appendChild(caption.el);
  activeCaption = caption;

  // Always-visible mute toggle (REWORK §4) — screen-level (position:fixed,
  // css/pier.css), built ONCE per mount regardless of hub vs mode route, so
  // it's guaranteed present even for a machine mode that hasn't been rebuilt
  // against mountChassis yet.
  const muteBtn = buildMuteButton(ctx);
  screen.appendChild(muteBtn);

  if (mod) {
    const host = el('div', 'pier-mode-host');
    screen.appendChild(host);
    await ensureContent();
    const pierKit = {
      facts,
      content,
      say: caption.say,
      deluxe: facts.deluxeOn(),
      // Convenience: this mode's own chassis builder, pre-bound to `host` —
      // see this file's header comment. Additive to the §4 frozen
      // {facts,content,say,deluxe} shape.
      mountChassis: (opts) => mountChassis(host, opts),
    };
    try {
      activeModeCleanup = mod.mount(host, ctx, pierKit);
    } catch (e) {
      // A broken machine must never trap the child on a dead screen.
      activeModeCleanup = null;
      ctx.toast("That machine's jammed — Nana's sending you back to the pier!");
      ctx.go('#/pier');
    }
  } else {
    await mountHub(screen, ctx, caption);
  }
}

export function unmount() {
  if (activeModeCleanup) {
    try { activeModeCleanup(); } catch (e) { /* a mode's cleanup must never break navigation */ }
    activeModeCleanup = null;
  }
  if (activeCaption) {
    activeCaption.destroy();
    activeCaption = null;
  }
}

export default { mount, unmount };
