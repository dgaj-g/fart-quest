// FART QUEST — js/pier/modes/splat.js — STUB (SPLAT agent builds the real cabinet)
// Whack-a-mole blitz: 5 holes, gremlins hold number cards, tap the right
// answer before the 60s clock runs out. See docs/PIER_SPEC.md §6 "splat".
// This stub is deliberately trivial — the SPLAT agent overwrites the whole
// file, so nothing here needs to survive.
import { el, injectCss } from '../../anims/_kit.js';

const CSS = `
.pier-stub-back { position:absolute; top:calc(16px + var(--safe-t,0px)); left:calc(16px + var(--safe-l,0px)); min-height:60px; padding:0 20px; font-size:16px; z-index:5; }
.pier-stub-wrap { min-height:100%; display:flex; align-items:center; justify-content:center; padding:80px 20px 40px; }
.pier-stub-card { background:var(--card); color:var(--ink); border-radius:var(--r-lg); box-shadow:var(--shadow-card); padding:36px 30px; max-width:420px; text-align:center; }
.pier-stub-emoji { font-size:56px; margin-bottom:10px; }
.pier-stub-card h2 { font-family:'Fredoka',sans-serif; margin:0 0 12px; }
.pier-stub-card p { font-size:16px; line-height:1.45; margin:0; font-weight:500; }
`;

export default {
  id: 'splat',
  title: 'SPLAT-A-GREMLIN',
  blurb: 'Whack the right number before the gremlins scarper!',

  mount(host, ctx) {
    injectCss('pier-stub-splat', CSS);

    const back = el('button', 'btn btn-ghost pier-stub-back', '← PIER');
    const wrap = el('div', 'pier-stub-wrap');
    wrap.appendChild(el('div', 'pier-stub-card',
      '<div class="pier-stub-emoji">🔨</div>'
      + '<h2>SPLAT-A-GREMLIN</h2>'
      + "<p>Nana's still bolting this cabinet to the boardwalk — check back soon, nose-soldier!</p>"));
    host.append(back, wrap);

    back.addEventListener('click', () => {
      ctx.audio.sfx('back');
      ctx.go('#/pier');
    });

    return function cleanup() {
      back.remove();
      wrap.remove();
    };
  },
};
