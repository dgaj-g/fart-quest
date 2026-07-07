// FART QUEST — js/engine/diagrams.js (DIAGRAMS agent)
//
// renderDiagram(spec) -> SVG element.
//
// Contract (ENGINE_SPEC_2 §C): pure, deterministic SVG built from a plain spec object.
// EXAM-PLAIN style is a hard rule — these mimic real exam-paper figures, NOT the game's
// look: plain white card, dark ink (#222) lines, small system-font labels, flat muted
// fills only where the maths needs colour (pie sectors, bar fills, spinner sectors,
// thermometer mercury). No gradients, no game chrome, no confetti, no --gold/--stink tokens.
//
// Implementation note: every kind is built as an SVG *markup string* first (no DOM calls
// at all while composing — "jsdom-free" by construction), then wrapped once at the very
// end. In a browser, that string becomes a real <svg> element via createElementNS +
// .innerHTML (both fully supported by modern engines, including iPad Safari) so it can be
// appendChild()'d like any other element. In a DOM-less context (Node self-tests, any
// server-side tooling) `document` doesn't exist, so we instead return a tiny element-alike
// object exposing `.outerHTML` / `.toString()` / `.viewBox` — callers that only need the
// markup (e.g. a generator doing `renderDiagram(spec).outerHTML` to embed in
// `question.visual.html`) work identically in both environments.

const SVG_NS = 'http://www.w3.org/2000/svg';
const INK = '#222';
const GRID_INK = '#8a8a8a';
const FAINT = '#cfcfcf';
const FONT_STACK = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
// Flat, muted fills for the few kinds where colour carries meaning (pie/bar/spinner/etc).
// Deliberately desaturated — no game-bright hues.
const MUTED = ['#5b7fa6', '#c98a52', '#6e9b6e', '#b06a86', '#8577b0', '#b6a23c', '#4f9c9c', '#a85c4a'];
const PAD = 14;

// ---------------------------------------------------------------------------
// Low-level string-building helpers (shared "axes/labels/ticks" toolkit).
// ---------------------------------------------------------------------------
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function n(x) {
  return Math.round(x * 100) / 100;
}
function textEl(x, y, s, opts = {}) {
  const { size = 14, anchor = 'middle', weight = 400, fill = INK, italic = false } = opts;
  return `<text x="${n(x)}" y="${n(y)}" font-size="${size}" text-anchor="${anchor}" font-weight="${weight}" fill="${fill}"${italic ? ' font-style="italic"' : ''}>${esc(s)}</text>`;
}
function lineEl(x1, y1, x2, y2, opts = {}) {
  const { stroke = INK, width = 1.6, dash } = opts;
  return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${stroke}" stroke-width="${width}"${dash ? ` stroke-dasharray="${dash}"` : ''} stroke-linecap="round"/>`;
}
function rectEl(x, y, w, h, opts = {}) {
  const { fill = 'none', stroke = INK, width = 1.6, rx = 0 } = opts;
  return `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${rx}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${width}"` : ''}/>`;
}
function circleEl(cx, cy, r, opts = {}) {
  const { fill = 'none', stroke = INK, width = 1.6 } = opts;
  return `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${width}"` : ''}/>`;
}
function polylineEl(pts, opts = {}) {
  const { stroke = INK, width = 1.6, fill = 'none' } = opts;
  const d = pts.map((p) => `${n(p[0])},${n(p[1])}`).join(' ');
  return `<polyline points="${d}" stroke="${stroke}" stroke-width="${width}" fill="${fill}" stroke-linejoin="round"/>`;
}
function polygonEl(pts, opts = {}) {
  const { stroke = INK, width = 1.6, fill = 'none' } = opts;
  const d = pts.map((p) => `${n(p[0])},${n(p[1])}`).join(' ');
  return `<polygon points="${d}" stroke="${stroke}" stroke-width="${width}" fill="${fill}" stroke-linejoin="round"/>`;
}
function pathEl(d, opts = {}) {
  const { stroke = INK, width = 1.6, fill = 'none' } = opts;
  return `<path d="${d}" stroke="${stroke}" stroke-width="${width}" fill="${fill}" stroke-linejoin="round" stroke-linecap="round"/>`;
}
// deg 0 = 12 o'clock, increases CLOCKWISE (matches SVG's y-down screen space).
function clockPoint(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}
function niceMax(max, step) {
  if (max <= 0) return step;
  return Math.ceil(max / step) * step;
}

// Wraps a kind's raw body markup in the shared exam-plain white card + padding.
function wrap(bodyW, bodyH, inner, aria) {
  const w = n(bodyW + PAD * 2);
  const h = n(bodyH + PAD * 2);
  const style = `<style>text{font-family:${FONT_STACK};}</style>`;
  const bg = rectEl(0.8, 0.8, w - 1.6, h - 1.6, { fill: '#fff', stroke: '#ccc', width: 1.4, rx: 10 });
  const body = `<g transform="translate(${PAD},${PAD})">${inner}</g>`;
  return { w, h, markup: `${style}${bg}${body}`, aria: aria || 'diagram' };
}

// ---------------------------------------------------------------------------
// Kind builders — each returns wrap(...)'s result. Kept compact; shared helpers above.
// ---------------------------------------------------------------------------

function buildClock(spec) {
  const h = ((spec.h ?? 0) % 12 + 12) % 12;
  const m = ((spec.m ?? 0) % 60 + 60) % 60;
  const R = 74;
  const cx = R, cy = R;
  let inner = circleEl(cx, cy, R, { fill: '#fff', stroke: INK, width: 2.2 });
  for (let i = 0; i < 60; i++) {
    const deg = i * 6;
    const isHour = i % 5 === 0;
    const outer = R - 4;
    const innerR = isHour ? R - 14 : R - 8;
    const [x1, y1] = clockPoint(cx, cy, outer, deg);
    const [x2, y2] = clockPoint(cx, cy, innerR, deg);
    inner += lineEl(x1, y1, x2, y2, { width: isHour ? 2 : 1 });
  }
  for (let hr = 1; hr <= 12; hr++) {
    const [tx, ty] = clockPoint(cx, cy, R - 26, hr * 30);
    inner += textEl(tx, ty + 5, String(hr), { size: 13, weight: 700 });
  }
  const hourAngle = (h + m / 60) * 30;
  const minuteAngle = m * 6;
  const [hx, hy] = clockPoint(cx, cy, R * 0.5, hourAngle);
  const [mx, my] = clockPoint(cx, cy, R * 0.82, minuteAngle);
  inner += lineEl(cx, cy, hx, hy, { width: 4 });
  inner += lineEl(cx, cy, mx, my, { width: 2.4 });
  inner += circleEl(cx, cy, 3.5, { fill: INK, stroke: 'none' });
  return wrap(R * 2, R * 2, inner, `clock showing ${h === 0 ? 12 : h}:${String(m).padStart(2, '0')}`);
}

function buildDigitalClock(spec) {
  const text = String(spec.text ?? '');
  const w = Math.max(140, text.length * 26);
  const hgt = 76;
  let inner = rectEl(0, 0, w, hgt, { fill: '#fdfdfd', stroke: INK, width: 2, rx: 8 });
  inner += `<text x="${n(w / 2)}" y="${n(hgt / 2 + 12)}" font-size="34" font-weight="700" text-anchor="middle" fill="${INK}" font-family="'SF Mono',Menlo,Consolas,monospace">${esc(text)}</text>`;
  return wrap(w, hgt, inner, `digital clock reading ${text}`);
}

function buildBarChart(spec) {
  const labels = spec.labels || [];
  const values = spec.values || [];
  const yStep = spec.yStep || 1;
  const max = niceMax(Math.max(0, ...values), yStep);
  const chartH = 180;
  const barGap = 18;
  const barW = 46;
  const chartW = Math.max(200, labels.length * (barW + barGap) + barGap);
  const originX = 46, originY = chartH;
  let inner = '';
  const steps = Math.round(max / yStep);
  for (let i = 0; i <= steps; i++) {
    const val = i * yStep;
    const y = originY - (val / max) * chartH;
    inner += lineEl(originX, y, originX + chartW, y, { stroke: FAINT, width: 1 });
    inner += textEl(originX - 8, y + 4, String(val), { size: 11, anchor: 'end' });
  }
  inner += lineEl(originX, 0, originX, originY, { width: 2 });
  inner += lineEl(originX, originY, originX + chartW, originY, { width: 2 });
  values.forEach((v, i) => {
    const bh = (v / max) * chartH;
    const bx = originX + barGap + i * (barW + barGap);
    inner += rectEl(bx, originY - bh, barW, bh, { fill: MUTED[i % MUTED.length], stroke: INK, width: 1.4 });
    inner += textEl(bx + barW / 2, originY + 18, labels[i] ?? '', { size: 12 });
  });
  if (spec.yLabel) {
    inner += `<text x="${n(-chartH / 2)}" y="14" font-size="12" text-anchor="middle" fill="${INK}" transform="rotate(-90)">${esc(spec.yLabel)}</text>`;
  }
  return wrap(originX + chartW + 10, chartH + 34, inner, `bar chart of ${labels.join(', ')}`);
}

function buildLineGraph(spec) {
  const points = spec.points || [];
  const xLabels = spec.xLabels || [];
  const yStep = spec.yStep || 1;
  const max = niceMax(Math.max(0, ...points), yStep);
  const chartH = 180;
  const chartW = Math.max(220, (points.length - 1) * 60 + 40);
  const originX = 46, originY = chartH;
  let inner = '';
  const steps = Math.round(max / yStep);
  for (let i = 0; i <= steps; i++) {
    const val = i * yStep;
    const y = originY - (val / max) * chartH;
    inner += lineEl(originX, y, originX + chartW, y, { stroke: FAINT, width: 1 });
    inner += textEl(originX - 8, y + 4, String(val), { size: 11, anchor: 'end' });
  }
  inner += lineEl(originX, 0, originX, originY, { width: 2 });
  inner += lineEl(originX, originY, originX + chartW, originY, { width: 2 });
  const step = points.length > 1 ? chartW / (points.length - 1) : 0;
  const coords = points.map((v, i) => [originX + i * step, originY - (v / max) * chartH]);
  inner += polylineEl(coords, { stroke: MUTED[0], width: 2.4 });
  coords.forEach(([x, y], i) => {
    inner += circleEl(x, y, 4, { fill: '#fff', stroke: MUTED[0], width: 2 });
    inner += textEl(x, originY + 18, xLabels[i] ?? '', { size: 12 });
  });
  return wrap(originX + chartW + 10, chartH + 34, inner, `line graph`);
}

function buildTable(spec) {
  const headers = spec.headers || [];
  const rows = spec.rows || [];
  const highlight = spec.highlight || [];
  const isHi = (r, c) => highlight.some((h) => Array.isArray(h) && h[0] === r && h[1] === c);
  const colW = 70, rowH = 34;
  const cols = headers.length || (rows[0] ? rows[0].length : 1);
  const w = cols * colW;
  const h = (rows.length + 1) * rowH;
  let inner = rectEl(0, 0, w, rowH, { fill: '#eef1f4', stroke: INK, width: 1.6 });
  headers.forEach((hd, c) => {
    inner += lineEl(c * colW, 0, c * colW, h, { width: c === 0 ? 1.6 : 1 });
    inner += textEl(c * colW + colW / 2, rowH / 2 + 5, hd, { size: 13, weight: 700 });
  });
  rows.forEach((row, r) => {
    const y = (r + 1) * rowH;
    row.forEach((cell, c) => {
      if (isHi(r, c)) inner += rectEl(c * colW, y, colW, rowH, { fill: '#fff3c9', stroke: 'none' });
      inner += textEl(c * colW + colW / 2, y + rowH / 2 + 5, cell, { size: 13 });
    });
  });
  for (let r = 0; r <= rows.length + 1; r++) inner += lineEl(0, r * rowH, w, r * rowH, { width: r <= 1 ? 1.6 : 1 });
  inner += lineEl(cols * colW, 0, cols * colW, h, { width: 1.6 });
  return wrap(w, h, inner, 'data table');
}

function buildTally(spec) {
  const rows = spec.rows || [];
  const rowH = 34, labelW = 90, gateW = 26;
  const maxGates = Math.max(1, ...rows.map((r) => Math.ceil(r[1] / 5)));
  const w = labelW + maxGates * gateW + 20;
  const h = rows.length * rowH;
  let inner = '';
  rows.forEach(([label, count], i) => {
    const y = i * rowH + rowH / 2;
    inner += textEl(labelW - 10, y + 5, label, { size: 13, anchor: 'end' });
    const full = Math.floor(count / 5);
    const rem = count % 5;
    let gx = labelW + 6;
    for (let g = 0; g < full; g++) {
      for (let s = 0; s < 4; s++) inner += lineEl(gx + s * 4, y - 10, gx + s * 4, y + 10, { width: 1.6 });
      inner += lineEl(gx - 2, y + 10, gx + 14, y - 10, { width: 1.6 });
      gx += gateW;
    }
    for (let s = 0; s < rem; s++) inner += lineEl(gx + s * 4, y - 10, gx + s * 4, y + 10, { width: 1.6 });
  });
  return wrap(w, h, inner, 'tally chart');
}

function buildPictogram(spec) {
  const rows = spec.rows || [];
  const symbol = spec.symbol || '●';
  const per = spec.per || 1;
  const labelW = 90, symW = 30, rowH = 38;
  const maxSymbols = Math.max(1, ...rows.map((r) => Math.ceil(r[1] / per)));
  const w = labelW + maxSymbols * symW + 20;
  const h = rows.length * rowH + 30;
  let inner = '';
  rows.forEach(([label, count], i) => {
    const y = i * rowH + rowH / 2 + 26;
    inner += textEl(labelW - 10, y + 6, label, { size: 13, anchor: 'end' });
    const full = Math.floor(count / per);
    const fracPart = (count - full * per) / per;
    let sx = labelW + 8;
    for (let s = 0; s < full; s++) {
      inner += textEl(sx + symW / 2, y + 8, symbol, { size: 20 });
      sx += symW;
    }
    if (fracPart >= 0.25) {
      const clipId = `pic-clip-${i}-${Math.round(fracPart * 100)}`;
      inner += `<clipPath id="${clipId}"><rect x="${n(sx)}" y="${n(y - 18)}" width="${n(symW * fracPart)}" height="24"/></clipPath>`;
      inner += `<g clip-path="url(#${clipId})">${textEl(sx + symW / 2, y + 8, symbol, { size: 20 })}</g>`;
    }
  });
  inner += textEl(w / 2, 16, `${symbol} = ${per}`, { size: 12, italic: true });
  return wrap(w, h, inner, 'pictogram');
}

function buildPie(spec) {
  const sectors = spec.sectors || [];
  const total = sectors.reduce((a, s) => a + s.value, 0) || 1;
  const R = 90, cx = R, cy = R;
  let inner = '';
  let startDeg = 0;
  sectors.forEach((s, i) => {
    const sweepDeg = (s.value / total) * 360;
    const endDeg = startDeg + sweepDeg;
    const [x1, y1] = clockPoint(cx, cy, R, startDeg);
    const [x2, y2] = clockPoint(cx, cy, R, endDeg);
    const large = sweepDeg > 180 ? 1 : 0;
    const d = `M${n(cx)},${n(cy)} L${n(x1)},${n(y1)} A${R},${R} 0 ${large} 1 ${n(x2)},${n(y2)} Z`;
    inner += pathEl(d, { fill: MUTED[i % MUTED.length], stroke: '#fff', width: 2 });
    const midDeg = startDeg + sweepDeg / 2;
    const [lx, ly] = clockPoint(cx, cy, R * 0.65, midDeg);
    if (sweepDeg > 18) inner += textEl(lx, ly + 4, s.label, { size: 11, fill: '#fff', weight: 700 });
    startDeg = endDeg;
  });
  const legendY = R * 2 + 14;
  let legendInner = '';
  sectors.forEach((s, i) => {
    const ly = legendY + i * 18;
    legendInner += rectEl(0, ly - 10, 12, 12, { fill: MUTED[i % MUTED.length], stroke: 'none' });
    legendInner += textEl(18, ly, `${s.label} (${s.value})`, { size: 12, anchor: 'start' });
  });
  const w = Math.max(R * 2, 160);
  const h = legendY + sectors.length * 18;
  return wrap(w, h, inner + legendInner, `pie chart of ${sectors.map((s) => s.label).join(', ')}`);
}

function buildVenn(spec) {
  const w = 300, h = 200;
  const r = 78;
  const c1x = w / 2 - 40, c2x = w / 2 + 40, cy = h / 2 + 6;
  let inner = rectEl(2, 2, w - 4, h - 4, { stroke: INK, width: 1.8 });
  inner += circleEl(c1x, cy, r, { fill: 'none', width: 1.8 });
  inner += circleEl(c2x, cy, r, { fill: 'none', width: 1.8 });
  inner += textEl(c1x - r * 0.6, cy - r - 8, spec.aLabel ?? 'A', { size: 14, weight: 700 });
  inner += textEl(c2x + r * 0.6, cy - r - 8, spec.bLabel ?? 'B', { size: 14, weight: 700 });
  inner += textEl(c1x - 32, cy, String(spec.aOnly ?? ''), { size: 16 });
  inner += textEl((c1x + c2x) / 2, cy, String(spec.both ?? ''), { size: 16 });
  inner += textEl(c2x + 32, cy, String(spec.bOnly ?? ''), { size: 16 });
  inner += textEl(w - 24, h - 14, String(spec.neither ?? ''), { size: 14 });
  return wrap(w, h, inner, `venn diagram of ${spec.aLabel} and ${spec.bLabel}`);
}

function buildNumline(spec) {
  const { min, max, marker, step = 1 } = spec;
  const w = 340, h = 70;
  const x0 = 20, x1 = w - 20, y = 40;
  let inner = lineEl(x0, y, x1, y, { width: 2 });
  const count = Math.round((max - min) / step);
  for (let i = 0; i <= count; i++) {
    const val = min + i * step;
    const x = x0 + ((val - min) / (max - min)) * (x1 - x0);
    inner += lineEl(x, y - 7, x, y + 7, { width: 1.6 });
    inner += textEl(x, y + 24, String(val), { size: 12 });
  }
  if (marker !== undefined && marker !== null) {
    const mx = x0 + ((marker - min) / (max - min)) * (x1 - x0);
    inner += pathEl(`M${n(mx)},${n(y - 16)} L${n(mx - 6)},${n(y - 26)} L${n(mx + 6)},${n(y - 26)} Z`, { fill: MUTED[0], stroke: 'none' });
    inner += textEl(mx, y - 30, String(marker), { size: 12, weight: 700 });
  }
  return wrap(w, h - 10, inner, `number line from ${min} to ${max}`);
}

function buildCoordgrid(spec) {
  const size = spec.size || 10;
  const cell = 26;
  const w = size * cell, h = size * cell;
  const originX = 30, originY = h + 10;
  let inner = '';
  for (let i = 0; i <= size; i++) {
    inner += lineEl(originX, originY - i * cell, originX + w, originY - i * cell, { stroke: FAINT, width: 1 });
    inner += lineEl(originX + i * cell, originY, originX + i * cell, originY - h, { stroke: FAINT, width: 1 });
    if (i % 2 === 0 || size <= 6) {
      inner += textEl(originX - 10, originY - i * cell + 4, String(i), { size: 10, anchor: 'end' });
      inner += textEl(originX + i * cell, originY + 16, String(i), { size: 10 });
    }
  }
  inner += lineEl(originX, originY, originX + w, originY, { width: 2 });
  inner += lineEl(originX, originY, originX, originY - h, { width: 2 });
  const points = spec.points || [];
  const px = (p) => originX + p.x * cell;
  const py = (p) => originY - p.y * cell;
  if (spec.shape && points.length > 2) {
    inner += polygonEl(points.map((p) => [px(p), py(p)]), { stroke: MUTED[0], width: 2 });
  }
  points.forEach((p) => {
    inner += circleEl(px(p), py(p), 4, { fill: INK, stroke: 'none' });
    if (p.label) inner += textEl(px(p) + 10, py(p) - 8, p.label, { size: 12, anchor: 'start', weight: 700 });
  });
  return wrap(originX + w + 12, h + 30, inner, 'coordinate grid');
}

// Canonical 2D shape outlines (unit-ish coordinates, scaled below).
function shapeOutline(kind) {
  switch (kind) {
    case 'square': return [[0, 0], [100, 0], [100, 100], [0, 100]];
    case 'rect': return [[0, 0], [140, 0], [140, 80], [0, 80]];
    case 'parallelogram': return [[20, 0], [140, 0], [120, 80], [0, 80]];
    case 'rhombus': return [[60, 0], [120, 50], [60, 100], [0, 50]];
    case 'kite': return [[60, 0], [110, 40], [60, 100], [10, 40]];
    case 'trapezium': return [[30, 0], [110, 0], [140, 80], [0, 80]];
    case 'triangle-right': return [[0, 0], [0, 100], [130, 100]];
    case 'triangle-equilateral': return [[65, 0], [130, 110], [0, 110]];
    case 'triangle-scalene': return [[10, 0], [140, 40], [40, 110]];
    case 'triangle-iso':
    default: return [[65, 0], [130, 110], [0, 110]];
  }
}

function polygonBounds(pts) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}

// Shared by buildShape and buildScaledrawing: draws the outline + per-side labels for a
// {kind, labels} shape spec, returns { w, h, inner } UN-wrapped (no card/pad yet).
function shapeBody(shapeSpec) {
  const labels = shapeSpec.labels || [];
  const pts = shapeSpec.kind === 'compound-L'
    ? [[0, 0], [90, 0], [90, 50], [140, 50], [140, 110], [0, 110]] // L / compound-rectangle — perimeter's "hidden side" classic
    : shapeOutline(shapeSpec.kind);
  const b = polygonBounds(pts);
  const w = b.maxX - b.minX, h = b.maxY - b.minY;
  let inner = polygonEl(pts.map((p) => [p[0] - b.minX, p[1] - b.minY]), { stroke: INK, width: 2 });
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % pts.length];
    const mx = (p[0] + q[0]) / 2 - b.minX;
    const my = (p[1] + q[1]) / 2 - b.minY;
    const dx = q[0] - p[0], dy = q[1] - p[1];
    const len = Math.hypot(dx, dy) || 1;
    // outward-ish normal offset for label placement
    const offX = (-dy / len) * 16, offY = (dx / len) * 16;
    const label = labels[i];
    if (label) inner += textEl(mx + offX, my + offY + 4, label, { size: 13, weight: 700 });
  });
  return { w, h, inner };
}

// DEVIATION from the literal ENGINE_SPEC_2 §C notation `shape{kind:'triangle-iso'|'rect'|…,labels}`:
// every renderDiagram spec is dispatched on its own top-level `kind` field (`'shape'` here),
// so that same object can't ALSO carry the specific outline name under the identical key
// `kind` without colliding. The specific 2D outline is read from `spec.shapeKind` instead
// (e.g. `{ kind: 'shape', shapeKind: 'rect', labels: [...] }`). `scaledrawing`'s nested
// `spec.shape` object has no such collision (it isn't itself dispatched on `kind`), so it
// keeps the doc's literal `{ kind: 'rect', labels }` shape.
function buildShape(spec) {
  const { w, h, inner } = shapeBody({ kind: spec.shapeKind, labels: spec.labels });
  return wrap(w + 20, h + 20, `<g transform="translate(10,10)">${inner}</g>`, `${spec.shapeKind || 'shape'} diagram`);
}

function buildPolygrid(spec) {
  const rows = spec.rows || 1, cols = spec.cols || 1;
  const cell = 28;
  const w = cols * cell, h = rows * cell;
  const shaded = spec.shaded || [];
  const isShaded = (r, c) => shaded.some((s) => (Array.isArray(s) ? s[0] === r && s[1] === c : s === r * cols + c));
  let inner = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (isShaded(r, c)) inner += rectEl(c * cell, r * cell, cell, cell, { fill: 'rgba(91,127,166,0.55)', stroke: 'none' });
    }
  }
  for (let r = 0; r <= rows; r++) inner += lineEl(0, r * cell, w, r * cell, { width: r === 0 || r === rows ? 1.8 : 1 });
  for (let c = 0; c <= cols; c++) inner += lineEl(c * cell, 0, c * cell, h, { width: c === 0 || c === cols ? 1.8 : 1 });
  return wrap(w, h, inner, `${rows} by ${cols} grid`);
}

function buildCuboid(spec) {
  const { w: cw = 3, h: ch = 2, d: cd = 2 } = spec;
  const sx = 26, sy = 26; // px per unit
  const fw = cw * sx, fh = ch * sy;
  const dx = cd * sx * 0.55, dy = -cd * sy * 0.4;
  const x0 = 16, y0 = fh + Math.max(0, -dy) + 16;
  const front = [[x0, y0], [x0 + fw, y0], [x0 + fw, y0 - fh], [x0, y0 - fh]];
  const back = front.map(([x, y]) => [x + dx, y + dy]);
  let inner = '';
  // hidden back edges (dashed)
  inner += lineEl(back[0][0], back[0][1], back[1][0], back[1][1], { dash: '4,3', stroke: GRID_INK });
  inner += lineEl(back[0][0], back[0][1], back[3][0], back[3][1], { dash: '4,3', stroke: GRID_INK });
  inner += lineEl(front[0][0], front[0][1], back[0][0], back[0][1], { dash: '4,3', stroke: GRID_INK });
  // visible edges
  inner += polygonEl(front, { width: 2 });
  inner += lineEl(front[1][0], front[1][1], back[1][0], back[1][1], { width: 2 });
  inner += lineEl(front[2][0], front[2][1], back[2][0], back[2][1], { width: 2 });
  inner += lineEl(front[3][0], front[3][1], back[3][0], back[3][1], { width: 2 });
  inner += lineEl(back[1][0], back[1][1], back[2][0], back[2][1], { width: 2 });
  inner += lineEl(back[2][0], back[2][1], back[3][0], back[3][1], { width: 2 });
  // dimension labels
  inner += textEl((front[0][0] + front[1][0]) / 2, y0 + 20, `w = ${cw}`, { size: 12 });
  inner += textEl(front[0][0] - 14, (front[0][1] + front[3][1]) / 2, `h = ${ch}`, { size: 12, anchor: 'end' });
  inner += textEl((front[0][0] + back[0][0]) / 2 - 6, (front[0][1] + back[0][1]) / 2 - 8, `d = ${cd}`, { size: 12, anchor: 'end' });
  const totalW = fw + dx + 40;
  const totalH = fh + Math.abs(dy) + 40;
  return wrap(totalW, totalH, inner, `cuboid ${cw} by ${ch} by ${cd}`);
}

// The 11 distinct nets of a cube, verified by a "rolling die across the grid" fold
// simulation (each net cell visited must map to a distinct cube face) — see
// enumerate-cube-nets derivation kept alongside the test script. Coordinates: [row, col].
const CUBE_NETS = [
  [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1], [3, 1]],
  [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1], [3, 1]],
  [[0, 1], [0, 2], [1, 1], [2, 0], [2, 1], [3, 1]],
  [[0, 1], [0, 2], [1, 1], [2, 1], [3, 0], [3, 1]],
  [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1], [3, 1]],
  [[0, 1], [1, 1], [1, 2], [2, 0], [2, 1], [3, 1]],
  [[0, 0], [1, 0], [1, 1], [1, 2], [2, 1], [3, 1]],
  [[0, 1], [1, 1], [2, 0], [2, 1], [3, 0], [4, 0]],
  [[0, 2], [1, 1], [1, 2], [2, 0], [2, 1], [3, 1]],
  [[0, 2], [1, 1], [1, 2], [2, 1], [3, 0], [3, 1]],
  [[0, 2], [1, 1], [1, 2], [2, 0], [2, 1], [3, 0]],
];

function buildNet(spec) {
  const id = Math.min(11, Math.max(1, spec.cubeNetId || 1));
  const cells = CUBE_NETS[id - 1];
  const cell = 34;
  const maxRow = Math.max(...cells.map((c) => c[0]));
  const maxCol = Math.max(...cells.map((c) => c[1]));
  let inner = '';
  cells.forEach(([r, c]) => {
    inner += rectEl(c * cell, r * cell, cell, cell, { fill: '#fdfdfd', stroke: INK, width: 1.8 });
  });
  const w = (maxCol + 1) * cell, h = (maxRow + 1) * cell;
  return wrap(w, h, inner, `cube net ${id}`);
}

function buildAngle(spec) {
  const deg = Math.max(1, Math.min(359, spec.deg ?? 90));
  const R = 80;
  const w = 220, h = 180;
  const cx = 30, cy = h - 30;
  const rayFn = (a) => {
    const rad = (a * Math.PI) / 180;
    return [cx + R * Math.cos(rad), cy - R * Math.sin(rad)];
  };
  const [r1x, r1y] = rayFn(0);
  const [r2x, r2y] = rayFn(deg);
  let inner = lineEl(cx, cy, r1x, r1y, { width: 2 });
  inner += lineEl(cx, cy, r2x, r2y, { width: 2 });
  const arcR = 26;
  const large = deg > 180 ? 1 : 0;
  const p1 = [cx + arcR, cy];
  const rad2 = (deg * Math.PI) / 180;
  const p2 = [cx + arcR * Math.cos(rad2), cy - arcR * Math.sin(rad2)];
  inner += pathEl(`M${n(p1[0])},${n(p1[1])} A${arcR},${arcR} 0 ${large} 0 ${n(p2[0])},${n(p2[1])}`, { stroke: MUTED[0], width: 2 });
  const midRad = ((deg / 2) * Math.PI) / 180;
  const lx = cx + (arcR + 20) * Math.cos(midRad);
  const ly = cy - (arcR + 20) * Math.sin(midRad);
  inner += textEl(lx, ly, `${deg}°`, { size: 13, weight: 700 });
  inner += circleEl(cx, cy, 2.5, { fill: INK, stroke: 'none' });
  inner += textEl(w / 2 - 10, h - 6, 'Not to scale', { size: 11, italic: true });
  return wrap(w, h - 10, inner, `angle of ${deg} degrees, not to scale`);
}

function buildThermometer(spec) {
  const { min, max, value } = spec;
  const tubeH = 200, tubeW = 22, bulbR = 20;
  const w = 90, h = tubeH + bulbR * 2 + 10;
  const tx = w / 2 - tubeW / 2;
  const topY = 10, bottomY = topY + tubeH;
  const range = max - min || 1;
  const clampedVal = Math.min(max, Math.max(min, value));
  const fillTop = bottomY - ((clampedVal - min) / range) * tubeH;
  let inner = rectEl(tx, topY, tubeW, tubeH, { fill: '#fff', stroke: INK, width: 1.8, rx: tubeW / 2 });
  inner += circleEl(w / 2, bottomY + bulbR - 4, bulbR, { fill: '#fff', stroke: INK, width: 1.8 });
  inner += rectEl(tx + 4, fillTop, tubeW - 8, bottomY - fillTop, { fill: '#c0625b', stroke: 'none' });
  inner += circleEl(w / 2, bottomY + bulbR - 4, bulbR - 6, { fill: '#c0625b', stroke: 'none' });
  const step = niceMax(range, 10) / (range > 40 ? 5 : 4);
  for (let v = min; v <= max; v += step) {
    const y = bottomY - ((v - min) / range) * tubeH;
    inner += lineEl(tx - 8, y, tx, y, { width: 1.4 });
    inner += textEl(tx - 12, y + 4, String(Math.round(v)), { size: 10, anchor: 'end' });
  }
  const zeroInRange = min < 0 && max > 0;
  if (zeroInRange) {
    const y0 = bottomY - ((0 - min) / range) * tubeH;
    inner += lineEl(tx - 8, y0, tx + tubeW, y0, { stroke: INK, width: 1.6 });
  }
  inner += textEl(w / 2, fillTop - 8, `${value}°`, { size: 13, weight: 700 });
  return wrap(w, h, inner, `thermometer reading ${value} degrees`);
}

function buildSpinner(spec) {
  const sectors = spec.sectors || [];
  const R = 80, cx = R, cy = R;
  const sweep = 360 / (sectors.length || 1);
  let inner = '';
  sectors.forEach((label, i) => {
    const startDeg = i * sweep, endDeg = startDeg + sweep;
    const [x1, y1] = clockPoint(cx, cy, R, startDeg);
    const [x2, y2] = clockPoint(cx, cy, R, endDeg);
    const large = sweep > 180 ? 1 : 0;
    const d = `M${n(cx)},${n(cy)} L${n(x1)},${n(y1)} A${R},${R} 0 ${large} 1 ${n(x2)},${n(y2)} Z`;
    inner += pathEl(d, { fill: MUTED[i % MUTED.length], stroke: '#fff', width: 2 });
    const midDeg = startDeg + sweep / 2;
    const [lx, ly] = clockPoint(cx, cy, R * 0.62, midDeg);
    inner += textEl(lx, ly + 4, label, { size: 12, fill: '#fff', weight: 700 });
  });
  inner += circleEl(cx, cy, R, { fill: 'none', stroke: INK, width: 2 });
  inner += pathEl(`M${n(cx - 6)},${n(cy - R - 2)} L${n(cx + 6)},${n(cy - R - 2)} L${n(cx)},${n(cy - R + 12)} Z`, { fill: INK, stroke: 'none' });
  inner += circleEl(cx, cy, 4, { fill: INK, stroke: 'none' });
  return wrap(R * 2, R * 2 + 6, inner, `spinner with sectors ${sectors.join(', ')}`);
}

function coinLabel(v) {
  if (typeof v === 'string') return v;
  return v >= 100 ? `£${v / 100}` : `${v}p`;
}
function buildCoins(spec) {
  const values = spec.values || [];
  const r = 30, gap = 16;
  const w = values.length * (r * 2 + gap) - gap;
  const h = r * 2 + 10;
  let inner = '';
  values.forEach((v, i) => {
    const cx = r + i * (r * 2 + gap);
    inner += circleEl(cx, r + 4, r, { fill: '#fdfdfd', stroke: INK, width: 1.8 });
    inner += circleEl(cx, r + 4, r - 6, { fill: 'none', stroke: INK, width: 1 });
    inner += textEl(cx, r + 9, coinLabel(v), { size: 13, weight: 700 });
  });
  return wrap(w, h, inner, `coins: ${values.map(coinLabel).join(', ')}`);
}

function buildScaledrawing(spec) {
  const shapeSpec = spec.shape || { kind: 'rect', labels: [] };
  const { w, h, inner } = shapeBody(shapeSpec);
  const capH = 26;
  const totalInner = `<g transform="translate(10,10)">${inner}</g>` + textEl((w + 20) / 2, h + 20 + capH - 6, spec.scaleText || '', { size: 13, italic: true, weight: 700 });
  return wrap(w + 20, h + 20 + capH, totalInner, `scale drawing, ${spec.scaleText || ''}`);
}

const BUILDERS = {
  clock: buildClock,
  digitalclock: buildDigitalClock,
  barchart: buildBarChart,
  linegraph: buildLineGraph,
  table: buildTable,
  tally: buildTally,
  pictogram: buildPictogram,
  pie: buildPie,
  venn: buildVenn,
  numline: buildNumline,
  coordgrid: buildCoordgrid,
  shape: buildShape,
  polygrid: buildPolygrid,
  cuboid: buildCuboid,
  net: buildNet,
  angle: buildAngle,
  thermometer: buildThermometer,
  spinner: buildSpinner,
  coins: buildCoins,
  scaledrawing: buildScaledrawing,
};

/**
 * renderDiagram(spec) -> SVG element.
 * spec = { kind: <one of BUILDERS' keys>, ...kind-specific fields (ENGINE_SPEC_2 §C) }.
 * Unknown kind throws (fail loudly — a typo'd kind is a generator bug, not a runtime one
 * to swallow silently).
 */
export function renderDiagram(spec) {
  if (!spec || typeof spec.kind !== 'string' || !BUILDERS[spec.kind]) {
    throw new Error(`renderDiagram: unknown kind "${spec && spec.kind}"`);
  }
  const { w, h, markup, aria } = BUILDERS[spec.kind](spec);
  const viewBox = `0 0 ${w} ${h}`;
  if (typeof document !== 'undefined') {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', viewBox);
    svg.setAttribute('class', 'fq-diagram');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', aria);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.style.width = '100%';
    svg.style.height = 'auto';
    svg.style.display = 'block';
    try {
      svg.innerHTML = markup; // supported by all modern engines incl. iPad Safari
    } catch (e) {
      // Defensive fallback for any WebKit build without SVGElement.innerHTML: parse via
      // DOMParser and re-parent each child node instead.
      const parsed = new DOMParser().parseFromString(`<svg xmlns="${SVG_NS}">${markup}</svg>`, 'image/svg+xml');
      Array.from(parsed.documentElement.childNodes).forEach((node) => svg.appendChild(document.importNode(node, true)));
    }
    return svg;
  }
  const full = `<svg xmlns="${SVG_NS}" viewBox="${viewBox}" class="fq-diagram" role="img" aria-label="${esc(aria)}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block">${markup}</svg>`;
  return { outerHTML: full, toString: () => full, viewBox, tagName: 'svg' };
}

export default { renderDiagram };
