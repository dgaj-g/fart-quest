// FART QUEST — js/pier/modes/tank.js — STUB (TANK agent builds the real cabinet)
// Weak-facts aquarium view + targeted splat rounds + the flush ceremony.
// See docs/PIER_SPEC.md §6 "tank". This stub is deliberately trivial — the
// TANK agent overwrites the whole file, so nothing here needs to survive.
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
  id: 'tank',
  title: 'THE GREMLIN TANK',
  blurb: 'Track your Gas Gremlins — and splat them for good.',

  mount(host, ctx) {
    injectCss('pier-stub-tank', CSS);

    const back = el('button', 'btn btn-ghost pier-stub-back', '← PIER');
    const wrap = el('div', 'pier-stub-wrap');
    wrap.appendChild(el('div', 'pier-stub-card',
      '<div class="pier-stub-emoji">🫧</div>'
      + '<h2>THE GREMLIN TANK</h2>'
      + "<p>The tank's still being filled backstage — check back soon, nose-soldier!</p>"));
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
