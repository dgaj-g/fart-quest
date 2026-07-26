// FART QUEST — js/pier/padkit.js (HUB agent)
// WHIFF-END PIER shared numpad: makeNumpad(host, {onSubmit(valueString)}) ->
// {clear(), setEnabled(bool), destroy()}. Used by gunge/ghost/teacups/tank
// (splat is tap-based and has no numpad). Digits 0-9, backspace, GO — that's
// the WHOLE keyboard. Pier answers are always positive whole numbers (max
// 144), so there is deliberately no minus key and no decimal point: nobody
// can ever type a shape of answer the fact engine wouldn't accept.
//
// Design note (spec is silent on this): the factory also renders its own tiny
// live readout above the keys, so a child can see what they've typed before
// pressing GO. The §5/§4 contract only names {clear,setEnabled,destroy} — the
// readout is bundled in because a numpad with zero visual feedback while
// typing would be a real usability hole for a 9-year-old on a touchscreen.

import { el, sfx } from '../anims/_kit.js';

const MAX_DIGITS = 3; // every Pier answer is <=144 — three digits is always headroom enough

const KEY_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['⌫', '0', 'GO'],
];

/**
 * makeNumpad(host, opts)
 *   host          — element to append the numpad into
 *   opts.onSubmit — called with the typed value as a STRING when GO is
 *                   pressed on a non-empty entry. The numpad does not clear
 *                   itself after submit — the caller decides (right away for
 *                   a "locks in and moves on" mode, or after showing feedback).
 * returns { clear(), setEnabled(bool), destroy() }
 */
export function makeNumpad(host, opts) {
  const o = opts || {};
  let value = '';
  let enabled = true;
  let alive = true;

  const wrap = el('div', 'pier-numpad');
  const readout = el('div', 'pier-numpad-readout');
  const rval = el('span', 'pnr-value');
  const rcursor = el('span', 'pnr-cursor');
  readout.append(rval, rcursor);
  const grid = el('div', 'pier-numpad-grid');
  wrap.append(readout, grid);

  function paint() {
    rval.textContent = value;
    rcursor.style.display = value ? 'none' : '';
  }

  function pressDigit(d) {
    if (!enabled) return;
    if (value.length >= MAX_DIGITS) { sfx.nudge(); return; }
    value += d;
    sfx.ui();
    paint();
  }
  function pressBack() {
    if (!enabled) return;
    if (!value) { sfx.nudge(); return; }
    value = value.slice(0, -1);
    sfx.tock(1);
    paint();
  }
  function pressGo() {
    if (!enabled) return;
    if (!value) { sfx.nudge(); return; }
    const submitted = value;
    sfx.ui();
    if (o.onSubmit) o.onSubmit(submitted);
  }

  KEY_ROWS.forEach((row) => {
    row.forEach((label) => {
      const isBack = label === '⌫';
      const isGo = label === 'GO';
      const btn = el('button', 'pier-numpad-key' + (isGo ? ' pnk-go' : isBack ? ' pnk-back' : ''), label);
      btn.type = 'button';
      btn.addEventListener('click', () => {
        if (isBack) pressBack();
        else if (isGo) pressGo();
        else pressDigit(label);
      });
      grid.appendChild(btn);
    });
  });

  paint();
  host.appendChild(wrap);

  return {
    clear() { value = ''; paint(); },
    setEnabled(v) {
      enabled = !!v;
      wrap.classList.toggle('pnp-disabled', !enabled);
    },
    destroy() {
      if (!alive) return;
      alive = false;
      wrap.remove();
    },
  };
}

export default { makeNumpad };
