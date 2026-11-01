'use strict';
/* Floor Plan Studio — vector floor plan editor (SVG). World coordinates are in project units (ft or m). */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const f4 = n => +(+n).toFixed(4);
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const UNITS = {
  ft: { name: 'Feet & inches', major: 1, sub: 4, wall: 0.5, door: 3, window: 3, opening: 3, text: 0.6, dim: 0.45, zoom: 40, toM: 0.3048,
        bars: [1, 2, 5, 10, 20, 50, 100] },
  m:  { name: 'Meters', major: 1, sub: 10, wall: 0.15, door: 0.9, window: 1, opening: 0.9, text: 0.2, dim: 0.14, zoom: 130, toM: 1,
        bars: [0.5, 1, 2, 5, 10, 20, 50] },
};
const COLORS = { wall: '#1f2937', line: '#374151', text: '#111827', door: '#1f2937', dim: '#374151' };

/* ---------- vector math ---------- */
const V = {
  add: (a, b) => ({ x: a.x + b.x, y: a.y + b.y }),
  sub: (a, b) => ({ x: a.x - b.x, y: a.y - b.y }),
  mul: (a, k) => ({ x: a.x * k, y: a.y * k }),
  dot: (a, b) => a.x * b.x + a.y * b.y,
  cross: (a, b) => a.x * b.y - a.y * b.x,
  len: a => Math.hypot(a.x, a.y),
  dist: (a, b) => Math.hypot(a.x - b.x, a.y - b.y),
  norm: a => { const l = Math.hypot(a.x, a.y) || 1; return { x: a.x / l, y: a.y / l }; },
  perp: a => ({ x: -a.y, y: a.x }),
  mid: (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }),
  dir: ang => ({ x: Math.cos(ang), y: Math.sin(ang) }),
  r: p => ({ x: f4(p.x), y: f4(p.y) }),
};
function projSeg(p, a, b) {
  const ab = V.sub(b, a), L2 = V.dot(ab, ab);
  const t = L2 ? clamp(V.dot(V.sub(p, a), ab) / L2, 0, 1) : 0;
  const pt = V.add(a, V.mul(ab, t));
  return { pt, t, d: V.dist(p, pt), len: Math.sqrt(L2) };
}
const P2 = p => `${f4(p.x)} ${f4(p.y)}`;

/* ---------- lengths ---------- */
function fmtLen(v, units = P.units) {
  if (!isFinite(v)) return '';
  const neg = v < 0 ? '-' : ''; v = Math.abs(v);
  if (units === 'm') { const cm = Math.round(v * 1000) / 10; return neg + (v < 1 ? cm.toFixed(cm % 1 ? 1 : 0) + ' cm' : v.toFixed(2) + ' m'); }
  const q = Math.round(v * 48);                // quarter inches
  const ft = Math.floor(q / 48), rem = q - ft * 48, inch = Math.floor(rem / 4), fr = ['', '¼', '½', '¾'][rem % 4];
  return neg + (ft ? `${ft}'-${inch}${fr}"` : `${inch}${fr}"`);
}
function parseLen(str, units = P.units) {
  let s = String(str).trim().toLowerCase().replace(/[’′]/g, "'").replace(/[”″]/g, '"').replace(/''/g, '"');
  s = s.replace(/'\s*-\s*/, "' ");
  const NUM = '(\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d*\\.?\\d+)';
  const num = t => { t = t.trim(); let m;
    if ((m = t.match(/^(\d+)\s+(\d+)\/(\d+)$/))) return +m[1] + m[2] / m[3];
    if ((m = t.match(/^(\d+)\/(\d+)$/))) return m[1] / m[2];
    return parseFloat(t); };
  const sign = s.startsWith('-') ? -1 : 1; s = s.replace(/^-\s*/, '');
  let m, meters = null;
  if ((m = s.match(new RegExp(`^${NUM}\\s*(?:'|ft|feet|foot)\\s*(?:${NUM}\\s*(?:"|in|inch|inches)?)?$`))))
    meters = (num(m[1]) + (m[2] ? num(m[2]) / 12 : 0)) * 0.3048;
  else if ((m = s.match(new RegExp(`^${NUM}\\s*(?:"|in|inch|inches)$`)))) meters = num(m[1]) * 0.0254;
  else if ((m = s.match(new RegExp(`^${NUM}\\s*(mm|cm|m)$`)))) meters = num(m[1]) * { mm: 0.001, cm: 0.01, m: 1 }[m[2]];
  else if ((m = s.match(new RegExp(`^${NUM}$`)))) return sign * num(m[1]);
  if (meters == null || !isFinite(meters)) return NaN;
  return sign * meters / UNITS[units].toM;
}

/* ---------- markdown (small, safe subset) ---------- */
function mdToHtml(src) {
  const safeUrl = u => !/^\s*(javascript|data|vbscript):/i.test(u.replace(/&\w+;/g, ''));
  const inline = raw => {
    let s = esc(raw); const codes = [];
    s = s.replace(/`([^`]+)`/g, (m, c) => { codes.push(c); return `\u0001${codes.length - 1}\u0001`; });
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, a, u) => safeUrl(u) ? `<img alt="${a}" src="${u}">` : a);
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => safeUrl(u) ? `<a href="${u}" target="_blank" rel="noopener">${t}</a>` : t);
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/__([^_]+)__/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*\s][^*]*)\*/g, '<em>$1</em>').replace(/(^|[^\w])_([^_]+)_(?![\w])/g, '$1<em>$2</em>');
    s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    s = s.replace(/ {2,}\n|\\\n/g, '<br>');
    return s.replace(/\u0001(\d+)\u0001/g, (m, i) => `<code>${codes[i]}</code>`);
  };
  const lines = String(src || '').replace(/\r\n?/g, '\n').split('\n');
  const isTableSep = l => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l);
  const cells = l => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
  const startsBlock = (l, n) => /^(#{1,6})\s|^```|^>|^\s*([-*+]|\d+[.)])\s+|^\s*([-*_])(\s*\3){2,}\s*$/.test(l) || (l.includes('|') && n !== undefined && isTableSep(n));
  let out = '', i = 0;
  while (i < lines.length) {
    const l = lines[i];
    let m;
    if (!l.trim()) { i++; continue; }
    if (/^```/.test(l)) {
      const buf = []; i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++; out += `<pre><code>${esc(buf.join('\n'))}</code></pre>`; continue;
    }
    if ((m = l.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/))) { out += `<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`; i++; continue; }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(l)) { out += '<hr>'; i++; continue; }
    if (/^>/.test(l)) {
      const buf = []; while (i < lines.length && /^>/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      out += `<blockquote>${mdToHtml(buf.join('\n'))}</blockquote>`; continue;
    }
    if (l.includes('|') && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const head = cells(l); i += 2; let rows = '';
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) rows += '<tr>' + cells(lines[i++]).map(c => `<td>${inline(c)}</td>`).join('') + '</tr>';
      out += `<table><thead><tr>${head.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`; continue;
    }
    if ((m = l.match(/^\s*([-*+]|\d+[.)])\s+/))) {
      const ordered = /\d/.test(m[1]), re = ordered ? /^\s*\d+[.)]\s+/ : /^\s*[-*+]\s+/; const items = [];
      while (i < lines.length) {
        const li = lines[i];
        if (re.test(li)) items.push(li.replace(re, ''));
        else if (li.trim() && /^\s{2,}/.test(li) && items.length) items[items.length - 1] += '\n' + li.trim();
        else break;
        i++;
      }
      const tag = ordered ? 'ol' : 'ul';
      out += `<${tag}>` + items.map(t => {
        const tm = t.match(/^\[( |x|X)\]\s+(.*)$/s);
        return tm ? `<li class="task">${tm[1] === ' ' ? '☐' : '☑'} ${inline(tm[2])}</li>` : `<li>${inline(t)}</li>`;
      }).join('') + `</${tag}>`;
      continue;
    }
    const buf = [l]; i++;
    while (i < lines.length && lines[i].trim() && !startsBlock(lines[i], lines[i + 1])) buf.push(lines[i++]);
    out += `<p>${inline(buf.join('\n'))}</p>`;
  }
  return out;
}

/* ---------- storage ---------- */
const store = {
  index() { try { return JSON.parse(localStorage.getItem('fp:index')) || []; } catch { return []; } },
  load(id) { try { return JSON.parse(localStorage.getItem('fp:p:' + id)); } catch { return null; } },
  save(p) {
    localStorage.setItem('fp:p:' + p.id, JSON.stringify(p));
    const idx = this.index().filter(i => i.id !== p.id);
    idx.push({ id: p.id, name: p.name, modified: p.modified, count: p.elements.length });
    localStorage.setItem('fp:index', JSON.stringify(idx));
    localStorage.setItem('fp:current', p.id);
  },
  remove(id) {
    localStorage.removeItem('fp:p:' + id);
    localStorage.setItem('fp:index', JSON.stringify(this.index().filter(i => i.id !== id)));
  },
};

function newProject(name = 'Untitled plan', units = 'ft') {
  const U = UNITS[units];
  return normalizeProject({
    id: uid(), name, units, created: Date.now(), modified: Date.now(),
    description: `# ${name}\n\nDescribe the design here: rooms, finishes, furniture, open questions.\n`,
    elements: [],
  });
}
function normalizeProject(p) {
  p.units = UNITS[p.units] ? p.units : 'ft';
  const U = UNITS[p.units];
  p.id ||= uid(); p.name ||= 'Untitled plan';
  p.created ||= Date.now(); p.modified ||= Date.now();
  p.description ??= '';
  p.elements = Array.isArray(p.elements) ? p.elements.filter(e => e && e.type) : [];
  p.elements.forEach(e => { e.id ||= uid(); });
  p.grid = Object.assign({ major: U.major, sub: U.sub, snap: true }, p.grid || {});
  p.wallWidth ??= U.wall;
  p.print = Object.assign({ orientation: 'landscape', grid: true, description: true }, p.print || {});
  return p;
}
function sampleProject() {
  const p = newProject('Sample studio', 'ft');
  const W = 0.5, c = COLORS.wall;
  const wall = (ax, ay, bx, by) => ({ id: uid(), type: 'line', a: { x: ax, y: ay }, b: { x: bx, y: by }, width: W, color: c });
  p.elements = [
    wall(0, 0, 20, 0), wall(20, 0, 20, 14), wall(20, 14, 0, 14), wall(0, 14, 0, 0), wall(12, 0, 12, 7), wall(12, 7, 12, 14), wall(12, 7, 20, 7),
    { id: uid(), type: 'door', kind: 'door', p: { x: 5, y: 14 }, angle: Math.PI, width: 3, wall: W, flip: 1, hinge: 1, color: COLORS.door },
    { id: uid(), type: 'door', kind: 'door', p: { x: 12, y: 3.5 }, angle: Math.PI / 2, width: 2.5, wall: W, flip: -1, hinge: 1, color: COLORS.door },
    { id: uid(), type: 'door', kind: 'door', p: { x: 12, y: 10.5 }, angle: -Math.PI / 2, width: 3, wall: W, flip: 1, hinge: 1, color: COLORS.door },
    { id: uid(), type: 'door', kind: 'window', p: { x: 6, y: 0 }, angle: 0, width: 5, wall: W, flip: 1, hinge: 1, color: COLORS.door },
    { id: uid(), type: 'door', kind: 'window', p: { x: 20, y: 10.5 }, angle: Math.PI / 2, width: 3, wall: W, flip: 1, hinge: 1, color: COLORS.door },
    { id: uid(), type: 'curve', a: { x: 1.5, y: 11 }, b: { x: 8.5, y: 11 }, c: { x: 5, y: 7.5 }, width: 0, color: COLORS.line, dash: true },
    { id: uid(), type: 'text', p: { x: 5, y: 10.2 }, text: 'rug', size: 0.45, rot: 0, color: '#6b7280', italic: true },
    { id: uid(), type: 'text', p: { x: 6, y: 6 }, text: 'Living / Kitchen', size: 0.7, rot: 0, color: COLORS.text, bold: true },
    { id: uid(), type: 'text', p: { x: 16, y: 3.5 }, text: 'Bath', size: 0.6, rot: 0, color: COLORS.text },
    { id: uid(), type: 'text', p: { x: 16, y: 10.5 }, text: 'Bedroom', size: 0.7, rot: 0, color: COLORS.text, bold: true },
    { id: uid(), type: 'dim', a: { x: 0, y: 0 }, b: { x: 20, y: 0 }, off: -1.5, size: 0.45, color: COLORS.dim },
    { id: uid(), type: 'dim', a: { x: 20, y: 0 }, b: { x: 20, y: 14 }, off: -1.5, size: 0.45, color: COLORS.dim },
  ];
  p.description = `# Sample studio

A small sample plan to show what the tools do. Delete anything you like, or start a **New** project.

## Rooms
| Room | Size | Notes |
|---|---|---|
| Living / Kitchen | 12' × 14' | Open plan, window on north wall |
| Bedroom | 8' × 7' | Door swings in, window on east wall |
| Bath | 8' × 7' | Door from living room |

## To do
- [x] Lay out walls
- [ ] Pick flooring
- [ ] Measure for a sofa

> Tip: select an item to edit its exact size in the **Properties** tab.
`;
  return p;
}

/* ---------- app state ---------- */
let P;                       // current project
let tool = 'select';
let sel = new Set();
let draft = null;            // in-progress drawing
let drag = null;             // select-tool drag / pan state
let cur = null;              // last snapped cursor result {pt, kind}
let curRaw = { x: 0, y: 0 };
let ghost = [];              // preview elements
let down = null;             // pointerdown info
let spaceDown = false;
let undoStack = [], redoStack = [];
let saveTimer = null;
let curveAsWall = false;

const svg = $('#canvas');
const U = () => UNITS[P.units];
const step = () => P.grid.major / P.grid.sub;
const byId = id => P.elements.find(e => e.id === id);
const selected = () => P.elements.filter(e => sel.has(e.id));

/* ---------- undo ---------- */
const snap = () => JSON.stringify(P.elements);
function pushUndo(s = snap()) { undoStack.push(s); if (undoStack.length > 300) undoStack.shift(); redoStack = []; updUndo(); }
function undo() { if (!undoStack.length) return; redoStack.push(snap()); P.elements = JSON.parse(undoStack.pop()); afterHistory(); }
function redo() { if (!redoStack.length) return; undoStack.push(snap()); P.elements = JSON.parse(redoStack.pop()); afterHistory(); }
function afterHistory() { draft = null; ghost = []; sel = new Set([...sel].filter(byId)); changed(); }
function updUndo() { $('#btnUndo').disabled = !undoStack.length; $('#btnRedo').disabled = !redoStack.length; }

function changed(opts = {}) {
  render();
  if (!opts.keepProps) renderProps();
  scheduleSave();
  updUndo();
}
function scheduleSave() {
  $('#saveState').textContent = 'Saving…';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 400);
}
function saveNow() {
  clearTimeout(saveTimer);
  P.modified = Date.now();
  try {
    store.save(P);
    $('#saveState').textContent = 'Saved in browser · ' + new Date(P.modified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (err) {
    $('#saveState').textContent = '⚠ Browser storage full — use Save JSON';
  }
}

/* ---------- view ---------- */
function toWorld(ev) {
  const r = svg.getBoundingClientRect(), v = P.view;
  return { x: (ev.clientX - r.left - v.x) / v.s, y: (ev.clientY - r.top - v.y) / v.s };
}
function toScreen(p) { const v = P.view; return { x: p.x * v.s + v.x, y: p.y * v.s + v.y }; }
function zoomAt(sx, sy, factor) {
  const v = P.view, ns = clamp(v.s * factor, U().zoom * 0.05, U().zoom * 20);
  const wx = (sx - v.x) / v.s, wy = (sy - v.y) / v.s;
  v.s = ns; v.x = sx - wx * ns; v.y = sy - wy * ns;
  render(); scheduleSave();
}
function fitView() {
  const W = svg.clientWidth, H = svg.clientHeight;
  const b = bboxAll(P.elements);
  if (!b) { P.view = { s: U().zoom, x: W * 0.15, y: H * 0.15 }; render(); return; }
  const bw = Math.max(b.x1 - b.x0, step()), bh = Math.max(b.y1 - b.y0, step());
  const s = clamp(Math.min((W - 80) / bw, (H - 100) / bh), U().zoom * 0.05, U().zoom * 6);
  P.view = { s, x: W / 2 - (b.x0 + bw / 2) * s, y: (H - 26) / 2 - (b.y0 + bh / 2) * s };
  render(); scheduleSave();
}

/* ---------- geometry per element ---------- */
function doorGeom(e) {
  const u = V.dir(e.angle), n = V.mul(V.perp(u), e.flip || 1);
  const a = V.sub(e.p, V.mul(u, e.width / 2)), b = V.add(e.p, V.mul(u, e.width / 2));
  const H = (e.hinge || 1) > 0 ? a : b, O = (e.hinge || 1) > 0 ? b : a;
  const L = V.add(H, V.mul(n, e.width));
  return { u, n, a, b, H, O, L };
}
function dimGeom(e) {
  const d = V.sub(e.b, e.a), len = V.len(d), u = len ? V.mul(d, 1 / len) : { x: 1, y: 0 }, n = V.perp(u);
  const A = V.add(e.a, V.mul(n, e.off)), B = V.add(e.b, V.mul(n, e.off));
  return { len, u, n, A, B };
}
function elPoints(e) {
  switch (e.type) {
    case 'line': return [e.a, e.b];
    case 'curve': { const pts = []; for (let i = 0; i <= 16; i++) pts.push(qpt(e, i / 16)); return pts; }
    case 'text': {
      const lines = (e.text || '').split('\n'), w = Math.max(...lines.map(l => l.length), 1) * e.size * 0.3, h = lines.length * e.size * 0.6;
      return [{ x: e.p.x - w, y: e.p.y - h }, { x: e.p.x + w, y: e.p.y + h }];
    }
    case 'door': { const g = doorGeom(e); return e.kind === 'door' ? [g.a, g.b, g.L] : [g.a, g.b]; }
    case 'dim': { const g = dimGeom(e); return [e.a, e.b, g.A, g.B]; }
  }
  return [];
}
const qpt = (e, t) => ({ x: (1 - t) ** 2 * e.a.x + 2 * (1 - t) * t * e.c.x + t * t * e.b.x, y: (1 - t) ** 2 * e.a.y + 2 * (1 - t) * t * e.c.y + t * t * e.b.y });
function bboxAll(els) {
  let b = null;
  for (const e of els) for (const p of elPoints(e)) {
    if (!b) b = { x0: p.x, y0: p.y, x1: p.x, y1: p.y };
    else { b.x0 = Math.min(b.x0, p.x); b.y0 = Math.min(b.y0, p.y); b.x1 = Math.max(b.x1, p.x); b.y1 = Math.max(b.y1, p.y); }
  }
  return b;
}
function pointKeys(e) { return { line: ['a', 'b'], curve: ['a', 'b', 'c'], text: ['p'], door: ['p'], dim: ['a', 'b'] }[e.type] || []; }
function translate(e, d) { for (const k of pointKeys(e)) e[k] = V.r(V.add(e[k], d)); }

/* ---------- snapping ---------- */
function snapPoint(w, exclude = new Set()) {
  const tol = 10 / P.view.s;
  let best = null, bd = tol;
  for (const e of P.elements) {
    if (exclude.has(e.id) || (e.type !== 'line' && e.type !== 'curve')) continue;
    for (const p of [e.a, e.b]) { const d = V.dist(w, p); if (d < bd) { bd = d; best = { pt: { ...p }, kind: 'point' }; } }
  }
  if (best) return best;
  let edge = null, ed = Infinity;
  for (const e of P.elements) {
    if (exclude.has(e.id) || e.type !== 'line') continue;
    const pr = projSeg(w, e.a, e.b);
    if (pr.d < Math.max(tol * 0.6, (e.width || 0) / 2) && pr.d < ed) { ed = pr.d; edge = { pt: pr.pt, kind: 'edge' }; }
  }
  if (edge) {
    // prefer a grid point if it also lies on the segment
    if (P.grid.snap) {
      const g = { x: Math.round(w.x / step()) * step(), y: Math.round(w.y / step()) * step() };
      if (V.dist(g, edge.pt) < 1e-6) return { pt: g, kind: 'edge' };
    }
    return edge;
  }
  if (P.grid.snap) return { pt: { x: Math.round(w.x / step()) * step(), y: Math.round(w.y / step()) * step() }, kind: 'grid' };
  return { pt: { ...w }, kind: 'free' };
}
function pointFor(ev, anchor, exclude) {
  const w = toWorld(ev);
  curRaw = w;
  if (ev.shiftKey && anchor) {
    const ang = Math.round(Math.atan2(w.y - anchor.y, w.x - anchor.x) / (Math.PI / 4)) * (Math.PI / 4);
    const u = V.dir(ang);
    let d = V.dot(V.sub(w, anchor), u);
    if (P.grid.snap) d = Math.round(d / step()) * step();
    return { pt: V.add(anchor, V.mul(u, d)), kind: 'angle' };
  }
  return snapPoint(w, exclude);
}
function findWall(w, tolPx = 22) {
  let best = null;
  for (const e of P.elements) {
    if (e.type !== 'line') continue;
    const pr = projSeg(w, e.a, e.b);
    const lim = Math.max(tolPx / P.view.s, (e.width || 0) / 2 + 4 / P.view.s);
    const score = pr.d - (e.width > 0 ? 1e-3 : 0);
    if (pr.d < lim && (!best || score < best.score)) best = { el: e, ...pr, score, ang: Math.atan2(e.b.y - e.a.y, e.b.x - e.a.x) };
  }
  return best;
}
function fitOpeningToWall(o, w, setSide) {
  const fw = findWall(w);
  if (!fw) return false;
  let t = fw.t;
  if (fw.len > o.width) t = clamp(t, o.width / 2 / fw.len, 1 - o.width / 2 / fw.len);
  const p = V.add(fw.el.a, V.mul(V.sub(fw.el.b, fw.el.a), t));
  if (P.grid.snap) { // slide along the wall to a grid step
    const along = Math.round(t * fw.len / step()) * step() / (fw.len || 1);
    const tt = fw.len > o.width ? clamp(along, o.width / 2 / fw.len, 1 - o.width / 2 / fw.len) : along;
    Object.assign(p, V.add(fw.el.a, V.mul(V.sub(fw.el.b, fw.el.a), tt)));
  }
  o.p = V.r(p); o.angle = fw.ang; o.wall = fw.el.width > 0 ? fw.el.width : P.wallWidth;
  if (setSide) o.flip = V.dot(V.sub(w, p), V.perp(V.dir(fw.ang))) >= 0 ? 1 : -1;
  return true;
}

/* ---------- rendering ---------- */
function gridMarkup(b, s, print) {
  let minor = step(), major = P.grid.major;
  if (!print) {
    if (minor * s < 7) minor = null;
    let k = 0; while (major * s < 14) { major *= k++ % 2 ? 2 : 5; }
    if (!minor && major !== P.grid.major) { minor = major / (k % 2 ? 5 : 2); if (minor * s < 7) minor = null; }
  } else if ((b.x1 - b.x0) / minor > 500) minor = null;
  const lines = (st, skip) => {
    let d = '';
    for (let i = Math.ceil(b.x0 / st), n = Math.floor(b.x1 / st); i <= n; i++) {
      const x = i * st; if (skip && Math.abs(x / skip - Math.round(x / skip)) < 1e-6) continue;
      d += `M${f4(x)} ${f4(b.y0)}V${f4(b.y1)}`;
    }
    for (let i = Math.ceil(b.y0 / st), n = Math.floor(b.y1 / st); i <= n; i++) {
      const y = i * st; if (skip && Math.abs(y / skip - Math.round(y / skip)) < 1e-6) continue;
      d += `M${f4(b.x0)} ${f4(y)}H${f4(b.x1)}`;
    }
    return d;
  };
  const c1 = print ? '#eceef1' : '#eef0f3', c2 = print ? '#d3d8de' : '#d5dae1';
  let out = '<g pointer-events="none">';
  if (minor) out += `<path d="${lines(minor, major)}" stroke="${c1}" stroke-width="${print ? 0.4 : 1}" vector-effect="non-scaling-stroke" fill="none"/>`;
  out += `<path d="${lines(major)}" stroke="${c2}" stroke-width="${print ? 0.6 : 1}" vector-effect="non-scaling-stroke" fill="none"/>`;
  return out + '</g>';
}

const HAIR = (w = 1.25) => `stroke-width="${w}" vector-effect="non-scaling-stroke"`;
const HIT = d => `<path class="hit" d="${d}" fill="none" stroke="transparent" stroke-width="14" vector-effect="non-scaling-stroke" stroke-linecap="round"/>`;

function elMarkup(e, o = {}) {
  const id = o.hl || o.ghost ? '' : ` data-id="${e.id}"`;
  const color = esc(e.color || '#222');
  switch (e.type) {
    case 'line': case 'curve': {
      const d = e.type === 'line' ? `M${P2(e.a)}L${P2(e.b)}` : `M${P2(e.a)}Q${P2(e.c)} ${P2(e.b)}`;
      const thick = e.width > 0;
      const st = thick ? `stroke-width="${f4(e.width)}" stroke-linecap="${e.type === 'line' ? 'square' : 'butt'}"` : `${HAIR(e.weight || 1.5)} stroke-linecap="round"`;
      const dash = e.dash ? (thick ? ` stroke-dasharray="${f4(e.width * 1.6)} ${f4(e.width * 1.2)}"` : ' stroke-dasharray="7 5"') : '';
      return `<g${id}><path d="${d}" fill="none" stroke="${color}" ${st}${dash}/>${o.hl || o.ghost ? '' : HIT(d)}</g>`;
    }
    case 'text': {
      const lines = String(e.text || '').split('\n'), n = lines.length, x = f4(e.p.x);
      const ts = lines.map((l, i) => `<tspan x="${x}" dy="${i ? '1.2em' : f4(-(n - 1) * 0.6) + 'em'}">${esc(l) || ' '}</tspan>`).join('');
      return `<g${id}><text x="${x}" y="${f4(e.p.y)}" font-size="${f4(e.size)}" fill="${color}" text-anchor="middle" dominant-baseline="central"` +
        `${e.bold ? ' font-weight="700"' : ''}${e.italic ? ' font-style="italic"' : ''}${e.rot ? ` transform="rotate(${f4(-e.rot)} ${x} ${f4(e.p.y)})"` : ''} pointer-events="all">${ts}</text></g>`;
    }
    case 'door': {
      const g = doorGeom(e), t = e.wall || P.wallWidth, nn = V.perp(g.u), h = V.mul(nn, t / 2);
      const jamb = p => `M${P2(V.sub(p, h))}L${P2(V.add(p, h))}`;
      let d = jamb(g.a) + jamb(g.b), extra = '';
      const box = [V.sub(g.a, h), V.sub(g.b, h), V.add(g.b, h), V.add(g.a, h)];
      let hitPoly = `<polygon class="fillhit" points="${box.map(P2).join(' ')}" fill="transparent" stroke="none" pointer-events="all"/>`;
      if (e.kind === 'door') {
        const sweep = V.cross(V.sub(g.O, g.H), g.n) > 0 ? 1 : 0;
        extra = `<path d="M${P2(g.H)}L${P2(g.L)}" stroke="${color}" ${HAIR(2.2)} fill="none"/>` +
          `<path d="M${P2(g.O)}A${f4(e.width)} ${f4(e.width)} 0 0 ${sweep} ${P2(g.L)}" stroke="${color}" ${HAIR(1)} fill="none" stroke-dasharray="4 3"/>`;
        hitPoly += `<polygon class="fillhit" points="${[g.H, g.O, g.L].map(P2).join(' ')}" fill="transparent" stroke="none" pointer-events="all"/>`;
      } else if (e.kind === 'window') {
        const q = V.mul(nn, t / 2), q2 = V.mul(nn, t / 6);
        d += `M${P2(V.sub(g.a, q))}L${P2(V.sub(g.b, q))}M${P2(V.add(g.a, q))}L${P2(V.add(g.b, q))}` +
             `M${P2(V.sub(g.a, q2))}L${P2(V.sub(g.b, q2))}M${P2(V.add(g.a, q2))}L${P2(V.add(g.b, q2))}`;
      } else {
        extra = `<path d="M${P2(g.a)}L${P2(g.b)}" stroke="${color}" ${HAIR(0.8)} stroke-dasharray="3 4" fill="none"/>`;
      }
      return `<g${id}><path d="${d}" stroke="${color}" ${HAIR(1.25)} fill="none"/>${extra}${o.hl || o.ghost ? '' : hitPoly}</g>`;
    }
    case 'dim': {
      const g = dimGeom(e), sz = e.size || U().dim, sg = Math.sign(e.off) || 1;
      const gap = V.mul(g.n, sg * sz * 0.25), over = V.mul(g.n, sg * sz * 0.35);
      const tick = V.mul(V.norm(V.add(g.u, g.n)), sz * 0.35);
      let d = '';
      if (Math.abs(e.off) > sz * 0.3) d += `M${P2(V.add(e.a, gap))}L${P2(V.add(g.A, over))}M${P2(V.add(e.b, gap))}L${P2(V.add(g.B, over))}`;
      d += `M${P2(V.sub(g.A, V.mul(g.u, sz * 0.3)))}L${P2(V.add(g.B, V.mul(g.u, sz * 0.3)))}`;
      d += `M${P2(V.sub(g.A, tick))}L${P2(V.add(g.A, tick))}M${P2(V.sub(g.B, tick))}L${P2(V.add(g.B, tick))}`;
      let deg = Math.atan2(g.u.y, g.u.x) * 180 / Math.PI; if (deg > 90.01 || deg <= -90) deg += 180;
      const m = V.mid(g.A, g.B), label = e.label ? e.label : fmtLen(g.len);
      const txt = `<text transform="translate(${P2(m)}) rotate(${f4(deg)})" y="${f4(-sz * 0.3)}" font-size="${f4(sz)}" fill="${color}" text-anchor="middle"` +
        ` stroke="#fff" stroke-width="${f4(sz * 0.3)}" paint-order="stroke" stroke-linejoin="round" pointer-events="all">${esc(label)}</text>`;
      return `<g${id}><path d="${d}" stroke="${color}" ${HAIR(1)} fill="none"/>${txt}${o.hl || o.ghost ? '' : HIT(`M${P2(g.A)}L${P2(g.B)}`)}</g>`;
    }
  }
  return '';
}

// Returns markup for a list of elements, in layers. Doors/windows/openings cut gaps in thick walls via an SVG mask.
function sceneMarkup(els, pfx, o = {}) {
  const ops = els.filter(e => e.type === 'door');
  const strokes = els.filter(e => e.type === 'line' || e.type === 'curve');
  const walls = strokes.filter(e => e.width > 0), hair = strokes.filter(e => !(e.width > 0));
  let defs = '', mask = '';
  const gapEls = o.gaps || ops;
  if (gapEls.length && walls.length) {
    const b = bboxAll(o.allEls || els), m = 5;
    const r = `x="${f4(b.x0 - m)}" y="${f4(b.y0 - m)}" width="${f4(b.x1 - b.x0 + 2 * m)}" height="${f4(b.y1 - b.y0 + 2 * m)}"`;
    defs = `<defs><mask id="${pfx}gaps" maskUnits="userSpaceOnUse" ${r}><rect ${r} fill="#fff"/>` +
      gapEls.map(d => { const g = doorGeom(d); return `<path d="M${P2(g.a)}L${P2(g.b)}" stroke="#000" stroke-width="${f4((d.wall || P.wallWidth) * 1.35 + 0.01)}" stroke-linecap="butt"/>`; }).join('') +
      '</mask></defs>';
    mask = ` mask="url(#${pfx}gaps)"`;
  }
  const L = arr => arr.map(e => elMarkup(e, o)).join('');
  return `${defs}<g${mask}>${L(walls)}</g>${L(hair)}${L(ops)}${L(els.filter(e => e.type === 'dim'))}${L(els.filter(e => e.type === 'text'))}`;
}

function render() {
  if (!P.view) { fitView(); return; }
  const v = P.view, s = v.s, W = svg.clientWidth, H = svg.clientHeight;
  const vb = { x0: -v.x / s, y0: -v.y / s, x1: (W - v.x) / s, y1: (H - v.y) / s };
  let out = `<g transform="translate(${f4(v.x)} ${f4(v.y)}) scale(${s})">`;
  out += gridMarkup(vb, s, false);
  out += sceneMarkup(P.elements, 'c');
  const sels = selected();
  if (sels.length) out += `<g class="hl" opacity=".85">${sceneMarkup(sels, 'h', { hl: true, gaps: P.elements.filter(e => e.type === 'door'), allEls: P.elements })}</g>`;
  if (ghost.length) out += `<g class="ghost">${ghost.map(e => elMarkup(e, { ghost: true })).join('')}</g>`;
  out += overlayMarkup(sels);
  out += '</g>';
  svg.innerHTML = out;
  $('#zoomLbl').textContent = Math.round(s / U().zoom * 100) + '%';
}

function overlayMarkup(sels) {
  const s = P.view.s, r = 5 / s;
  let o = '';
  if (sels.length === 1 && tool === 'select') {
    const e = sels[0];
    const hd = (p, key, cls = '') => `<circle class="handle ${cls}" data-handle="${key}" cx="${f4(p.x)}" cy="${f4(p.y)}" r="${f4(r)}"/>`;
    if (e.type === 'curve') o += `<path d="M${P2(e.a)}L${P2(e.c)}L${P2(e.b)}" stroke="#2563eb" ${HAIR(1)} stroke-dasharray="4 3" fill="none" pointer-events="none"/>`;
    if (e.type === 'line' || e.type === 'curve' || e.type === 'dim') o += hd(e.a, 'a') + hd(e.b, 'b');
    if (e.type === 'curve') o += hd(e.c, 'c', 'ctrl');
    if (e.type === 'dim') { const g = dimGeom(e); o += hd(V.mid(g.A, g.B), 'off', 'ctrl'); }
    if (e.type === 'door') { const g = doorGeom(e); o += hd(g.a, 'wa') + hd(g.b, 'wb'); }
  }
  if (draft && (draft.tool === 'wall' || draft.tool === 'line') && draft.made > 1)
    o += `<circle cx="${f4(draft.first.x)}" cy="${f4(draft.first.y)}" r="${f4(r * 1.4)}" fill="none" stroke="#16a34a" ${HAIR(1.5)} pointer-events="none"/>`;
  if (cur && (tool !== 'select' || drag?.kind === 'handle') && cur.kind !== 'free' && cur.kind !== 'grid') {
    const c = { point: '#16a34a', edge: '#ea580c', angle: '#2563eb' }[cur.kind] || '#2563eb', q = 5 / s;
    o += `<rect x="${f4(cur.pt.x - q)}" y="${f4(cur.pt.y - q)}" width="${f4(2 * q)}" height="${f4(2 * q)}" fill="none" stroke="${c}" ${HAIR(1.5)} pointer-events="none"/>`;
  }
  if (drag?.kind === 'marquee' && drag.b) {
    const x = Math.min(drag.a.x, drag.b.x), y = Math.min(drag.a.y, drag.b.y);
    o += `<rect x="${f4(x)}" y="${f4(y)}" width="${f4(Math.abs(drag.b.x - drag.a.x))}" height="${f4(Math.abs(drag.b.y - drag.a.y))}" fill="rgba(37,99,235,.08)" stroke="#2563eb" ${HAIR(1)} stroke-dasharray="4 3" pointer-events="none"/>`;
  }
  return o;
}

/* ---------- tools ---------- */
const ICON = {
  select: '<path d="M5 3l11 6.5-4.6 1.4 3 5.4-2 1.1-3-5.4L6 15.5z" fill="currentColor"/>',
  pan: '<path d="M10 2v16M2 10h16M10 2 7.5 4.5M10 2l2.5 2.5M10 18l-2.5-2.5M10 18l2.5-2.5M2 10l2.5-2.5M2 10l2.5 2.5M18 10l-2.5-2.5M18 10l-2.5 2.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
  wall: '<path d="M3 16V5h14" stroke="currentColor" stroke-width="3.5" fill="none"/>',
  line: '<path d="M3 17 17 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="3" cy="17" r="1.8" fill="currentColor"/><circle cx="17" cy="3" r="1.8" fill="currentColor"/>',
  curve: '<path d="M3 16Q6 2 17 5" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
  rect: '<rect x="3" y="4" width="14" height="12" stroke="currentColor" stroke-width="3" fill="none"/>',
  door: '<path d="M3 17h3M15 17h2M6 17V5" stroke="currentColor" stroke-width="2" fill="none"/><path d="M6 5a12 12 0 0 1 9 12" stroke="currentColor" stroke-width="1.2" stroke-dasharray="2 1.5" fill="none"/>',
  window: '<path d="M2 8h4M14 8h4M2 12h4M14 12h4" stroke="currentColor" stroke-width="2"/><path d="M6 7v6M14 7v6M6 8.5h8M6 11.5h8" stroke="currentColor" stroke-width="1.2"/>',
  opening: '<path d="M2 10h4M14 10h4" stroke="currentColor" stroke-width="4"/><path d="M6 7v6M14 7v6" stroke="currentColor" stroke-width="1.3"/><path d="M7 10h6" stroke="currentColor" stroke-width="1" stroke-dasharray="1.5 1.5"/>',
  text: '<path d="M4 4h12M10 4v13M7 17h6" stroke="currentColor" stroke-width="2" fill="none"/>',
  dim: '<path d="M3 6v8M17 6v8M3 10h14" stroke="currentColor" stroke-width="1.5"/><path d="M1.5 11.5 4.5 8.5M15.5 11.5l3-3" stroke="currentColor" stroke-width="1.5"/>',
};
const TOOLS = [
  ['select', 'Select', 'V'], ['pan', 'Pan', 'H'], '-',
  ['wall', 'Wall', 'W'], ['rect', 'Room', 'R'], ['line', 'Line', 'L'], ['curve', 'Curve', 'C'], '-',
  ['door', 'Door', 'D'], ['window', 'Window', 'N'], ['opening', 'Opening', 'O'], '-',
  ['text', 'Text', 'T'], ['dim', 'Measure', 'M'],
];
const HINTS = {
  select: 'Click to select · drag to move · Shift-click adds · drag empty space to box-select · Del deletes · arrows nudge',
  pan: 'Drag to pan · wheel to zoom (tip: Space-drag or middle-drag pans from any tool)',
  wall: 'Click to start, click each corner · double-click / Enter / Esc / right-click to finish · Shift = 45° angles',
  line: 'Thin line: click to start, click each point · double-click / Enter to finish · Shift = 45° angles',
  rect: 'Click (or drag) two opposite corners to draw a room of four walls',
  curve: 'Click start, click end, then move to bend and click to finish (drag the control point later to adjust)',
  door: 'Click on a wall to place a door — it swings toward the side you click on',
  window: 'Click on a wall to place a window',
  opening: 'Click on a wall to place an opening (gap with no door)',
  text: 'Click to place a label, then type in the Properties panel',
  dim: 'Click two points to measure, then move to offset the dimension line and click',
};
function buildToolbar() {
  $('#tools').innerHTML = TOOLS.map(t => t === '-' ? '<div class="tsep"></div>' :
    `<button data-tool="${t[0]}" title="${t[1]} (${t[2]})"><svg viewBox="0 0 20 20">${ICON[t[0]]}</svg>${t[1]}</button>`).join('');
  $('#tools').addEventListener('click', e => { const b = e.target.closest('[data-tool]'); if (b) setTool(b.dataset.tool); });
}
function setTool(t) {
  tool = t; draft = null; ghost = []; cur = null;
  $$('#tools button').forEach(b => b.classList.toggle('on', b.dataset.tool === t));
  svg.classList.toggle('select', t === 'select');
  svg.classList.toggle('pan', t === 'pan');
  $('#stHint').textContent = HINTS[t] || '';
  hideTip(); render(); renderProps();
}

/* ---------- element creation ---------- */
function addEl(e) { e.id = uid(); P.elements.push(e); return e; }
function addChainSegment(pt) {
  if (V.dist(pt, draft.last) < 1e-6) return;
  pushUndo();
  const isWall = draft.tool === 'wall';
  addEl({ type: 'line', a: V.r(draft.last), b: V.r(pt), width: isWall ? P.wallWidth : 0, color: isWall ? COLORS.wall : COLORS.line });
  draft.made++; draft.last = pt;
  if (draft.made > 1 && V.dist(pt, draft.first) < 1e-6) endDraft(); // closed loop
  changed();
}
function endDraft() { draft = null; ghost = []; hideTip(); render(); }
function makeRect(a, b) {
  if (Math.abs(a.x - b.x) < 1e-6 || Math.abs(a.y - b.y) < 1e-6) return null;
  const p = [a, { x: b.x, y: a.y }, b, { x: a.x, y: b.y }];
  return p.map((q, i) => ({ type: 'line', a: V.r(q), b: V.r(p[(i + 1) % 4]), width: P.wallWidth, color: COLORS.wall }));
}
function curveFrom(a, b, m) { return { type: 'curve', a: V.r(a), b: V.r(b), c: V.r(V.sub(V.mul(m, 2), V.mid(a, b))), width: 0, color: COLORS.line }; }
function dimFrom(a, b, m) {
  const n = V.perp(V.norm(V.sub(b, a)));
  return { type: 'dim', a: V.r(a), b: V.r(b), off: f4(V.dot(V.sub(m, a), n)), size: U().dim, color: COLORS.dim };
}
function openingAt(kind, w) {
  const o = { type: 'door', kind, p: V.r(snapPoint(w).pt), angle: 0, width: U()[kind], wall: P.wallWidth, flip: 1, hinge: 1, color: COLORS.door };
  fitOpeningToWall(o, w, true);
  return o;
}

/* ---------- pointer handling ---------- */
svg.addEventListener('contextmenu', e => e.preventDefault());
svg.addEventListener('wheel', e => {
  e.preventDefault();
  const r = svg.getBoundingClientRect();
  const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
  zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-clamp(dy, -100, 100) * 0.0022));
}, { passive: false });

svg.addEventListener('pointerdown', ev => {
  try { svg.setPointerCapture(ev.pointerId); } catch {}
  document.activeElement?.blur?.();
  down = { sx: ev.clientX, sy: ev.clientY, started: false };
  if (ev.button === 1 || tool === 'pan' || spaceDown || (ev.button === 2 && !draft)) {
    drag = { kind: 'pan', sx: ev.clientX, sy: ev.clientY, vx: P.view.x, vy: P.view.y };
    svg.classList.add('panning'); return;
  }
  if (ev.button === 2) { endDraft(); return; }
  if (ev.button !== 0) return;

  if (tool === 'select') return selectDown(ev);

  const anchor = draft ? (draft.last || draft.start || draft.a) : null;
  const c = pointFor(ev, anchor); const pt = c.pt; cur = c;
  switch (tool) {
    case 'wall': case 'line':
      if (!draft) { draft = { tool, first: pt, last: pt, made: 0 }; down.started = true; }
      else addChainSegment(pt);
      break;
    case 'rect':
      if (!draft) { draft = { tool, start: pt }; down.started = true; }
      else finishRect(pt);
      break;
    case 'curve': case 'dim':
      if (!draft) { draft = { tool, a: pt, stage: 1 }; down.started = true; }
      else if (draft.stage === 1) { if (V.dist(pt, draft.a) > 1e-6) { draft.b = pt; draft.stage = 2; } }
      else finishBend(pt);
      break;
    case 'door': case 'window': case 'opening': {
      pushUndo(); const o = addEl(openingAt(tool, toWorld(ev)));
      sel = new Set([o.id]); ghost = []; changed(); break;
    }
    case 'text': {
      pushUndo();
      const t = addEl({ type: 'text', p: V.r(pt), text: 'Label', size: U().text, rot: 0, color: COLORS.text, bold: false });
      sel = new Set([t.id]); setTool('select'); changed();
      switchTab('props');
      const ta = $('#props [data-p="text"]'); if (ta) { ta.focus(); ta.select(); }
      break;
    }
  }
  updateGhost(); render();
});

function finishRect(pt) {
  const walls = makeRect(draft.start, pt);
  if (!walls) return;
  pushUndo(); walls.forEach(addEl); draft = null; ghost = []; hideTip(); changed();
}
function finishBend(pt) {
  pushUndo();
  const e = addEl(draft.tool === 'curve' ? curveFrom(draft.a, draft.b, pt) : dimFrom(draft.a, draft.b, pt));
  if (draft.tool === 'curve' && curveAsWall) { e.width = P.wallWidth; e.color = COLORS.wall; }
  draft = null; ghost = []; hideTip(); changed();
}

svg.addEventListener('pointermove', ev => {
  if (drag?.kind === 'pan') {
    P.view.x = drag.vx + ev.clientX - drag.sx; P.view.y = drag.vy + ev.clientY - drag.sy; render(); return;
  }
  const w = toWorld(ev); curRaw = w;
  $('#stCoords').textContent = `x ${fmtLen(w.x)}   y ${fmtLen(w.y)}`;
  if (tool === 'select') { selectMove(ev); return; }
  if (tool === 'pan') return;
  const anchor = draft ? (draft.stage === 2 ? null : (draft.last || draft.start || draft.a)) : null;
  cur = pointFor(ev, anchor);
  updateGhost();
  render();
});

svg.addEventListener('pointerup', ev => {
  if (drag?.kind === 'pan') { drag = null; svg.classList.remove('panning'); scheduleSave(); return; }
  if (tool === 'select') { selectUp(ev); return; }
  // drag-to-draw: releasing far from the press finishes the segment
  if (down?.started && draft && Math.hypot(ev.clientX - down.sx, ev.clientY - down.sy) > 6 && cur) {
    if (draft.tool === 'wall' || draft.tool === 'line') addChainSegment(cur.pt);
    else if (draft.tool === 'rect') finishRect(cur.pt);
    else if (draft.stage === 1 && V.dist(cur.pt, draft.a) > 1e-6) { draft.b = cur.pt; draft.stage = 2; }
    updateGhost(); render();
  }
  down = null;
});
svg.addEventListener('pointerleave', () => { if (!drag && tool !== 'select') { ghost = draft ? ghost : []; hideTip(); render(); } });

svg.addEventListener('dblclick', ev => {
  if (draft && (draft.tool === 'wall' || draft.tool === 'line')) { endDraft(); return; }
  if (tool === 'select') {
    const g = ev.target.closest('[data-id]'); if (!g) return;
    const e = byId(g.dataset.id);
    switchTab('props');
    const f = $('#props [data-p="text"]') || $('#props [data-p="label"]');
    if (e && f) { f.focus(); f.select?.(); }
  }
});

function updateGhost() {
  ghost = [];
  if (!cur) return hideTip();
  const pt = cur.pt;
  if (!draft) {
    if (['door', 'window', 'opening'].includes(tool)) ghost = [openingAt(tool, curRaw)];
    hideTip(); return;
  }
  if (draft.tool === 'wall' || draft.tool === 'line') {
    ghost = [{ type: 'line', a: draft.last, b: pt, width: draft.tool === 'wall' ? P.wallWidth : 0, color: COLORS.wall }];
    tipLen(draft.last, pt);
  } else if (draft.tool === 'rect') {
    ghost = makeRect(draft.start, pt) || [];
    showTip(`${fmtLen(Math.abs(pt.x - draft.start.x))} × ${fmtLen(Math.abs(pt.y - draft.start.y))}`);
  } else if (draft.stage === 1) {
    ghost = draft.tool === 'dim' ? [dimFrom(draft.a, pt, draft.a)] : [{ type: 'line', a: draft.a, b: pt, width: 0, color: COLORS.line }];
    tipLen(draft.a, pt);
  } else {
    ghost = [draft.tool === 'curve' ? curveFrom(draft.a, draft.b, pt) : dimFrom(draft.a, draft.b, pt)];
    showTip(draft.tool === 'curve' ? 'Click to set the bend' : 'Click to place the dimension line');
  }
}
function tipLen(a, b) {
  let ang = -Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI; if (ang < 0) ang += 360;
  showTip(`${fmtLen(V.dist(a, b))}  ·  ${ang.toFixed(ang % 1 ? 1 : 0)}°`);
}
function showTip(text) {
  const tip = $('#tip'), s = toScreen(curRaw);
  tip.textContent = text; tip.style.display = 'block';
  tip.style.left = (s.x + 16) + 'px'; tip.style.top = (s.y + 16) + 'px';
}
function hideTip() { $('#tip').style.display = 'none'; }

/* select tool */
function selectDown(ev) {
  const w = toWorld(ev);
  const h = ev.target.closest('[data-handle]');
  if (h && sel.size === 1) {
    const e = selected()[0], key = h.dataset.handle;
    const linked = [];
    if ((e.type === 'line' || e.type === 'curve') && (key === 'a' || key === 'b') && !ev.altKey) {
      for (const o of P.elements) if (o !== e && (o.type === 'line' || o.type === 'curve'))
        for (const k of ['a', 'b']) if (V.dist(o[k], e[key]) < 1e-6) linked.push([o, k]);
    }
    drag = { kind: 'handle', e, key, linked, before: snap(), moved: false };
    return;
  }
  const g = ev.target.closest('[data-id]');
  if (g) {
    const id = g.dataset.id;
    if (ev.shiftKey) { sel.has(id) ? sel.delete(id) : sel.add(id); }
    else if (!sel.has(id)) sel = new Set([id]);
    if (sel.has(id)) {
      const els = selected();
      drag = { kind: 'move', start: w, orig: els.map(e => [e, JSON.parse(JSON.stringify(e))]), before: snap(), moved: false };
    }
    render(); renderProps();
    return;
  }
  if (!ev.shiftKey) sel.clear();
  drag = { kind: 'marquee', a: w, b: null, add: ev.shiftKey };
  render(); renderProps();
}
function selectMove(ev) {
  if (!drag) return;
  const w = toWorld(ev);
  if (drag.kind === 'marquee') { drag.b = w; render(); return; }
  if (drag.kind === 'move') {
    if (!drag.moved && Math.hypot(ev.clientX - down.sx, ev.clientY - down.sy) < 4) return;
    drag.moved = true;
    let d = V.sub(w, drag.start);
    if (P.grid.snap) d = { x: Math.round(d.x / step()) * step(), y: Math.round(d.y / step()) * step() };
    if (ev.shiftKey) { if (Math.abs(d.x) > Math.abs(d.y)) d.y = 0; else d.x = 0; }
    for (const [e, o] of drag.orig) {
      for (const k of pointKeys(e)) e[k] = V.r(V.add(o[k], d));
      if (e.type === 'door' && drag.orig.length === 1) {
        const target = V.add(o.p, V.sub(w, drag.start));
        if (!fitOpeningToWall(e, target, false)) { e.angle = o.angle; e.wall = o.wall; }
      }
    }
    render(); return;
  }
  if (drag.kind === 'handle') {
    drag.moved = true;
    const e = drag.e, key = drag.key;
    if (key === 'off') {
      const n = V.perp(V.norm(V.sub(e.b, e.a)));
      let off = V.dot(V.sub(w, e.a), n);
      if (P.grid.snap) off = Math.round(off / step()) * step();
      e.off = f4(off);
    } else if (key === 'wa' || key === 'wb') {
      const g = doorGeom(e), fixed = key === 'wa' ? g.b : g.a;
      let L = Math.abs(V.dot(V.sub(w, fixed), g.u));
      if (P.grid.snap) L = Math.round(L / step()) * step();
      L = Math.max(L, step());
      const sgn = key === 'wa' ? -1 : 1;
      e.width = f4(L); e.p = V.r(V.add(fixed, V.mul(g.u, sgn * L / 2)));
    } else {
      const excl = new Set([e.id, ...drag.linked.map(([o]) => o.id)]);
      const other = key === 'a' ? e.b : key === 'b' ? e.a : null;
      cur = pointFor(ev, e.type === 'curve' && key === 'c' ? null : other, excl);
      e[key] = V.r(cur.pt);
      for (const [o, k] of drag.linked) o[k] = V.r(cur.pt);
      if (e.type === 'line' || e.type === 'dim') tipLen(e.a, e.b);
    }
    render(); return;
  }
}
function selectUp() {
  if (!drag) return;
  if (drag.kind === 'marquee') {
    if (drag.b) {
      const x0 = Math.min(drag.a.x, drag.b.x), x1 = Math.max(drag.a.x, drag.b.x), y0 = Math.min(drag.a.y, drag.b.y), y1 = Math.max(drag.a.y, drag.b.y);
      for (const e of P.elements) {
        const pts = elPoints(e);
        if (pts.length && pts.every(p => p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1)) sel.add(e.id);
      }
    }
    drag = null; render(); renderProps(); return;
  }
  if ((drag.kind === 'move' || drag.kind === 'handle') && drag.moved) {
    pushUndo(drag.before); drag = null; cur = null; hideTip(); changed(); return;
  }
  drag = null; cur = null; hideTip(); render();
}

/* ---------- keyboard ---------- */
document.addEventListener('keydown', ev => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
  const mod = ev.ctrlKey || ev.metaKey;
  if (mod && ev.key.toLowerCase() === 's') { ev.preventDefault(); exportJson(); return; }
  if (mod && ev.key.toLowerCase() === 'p') { ev.preventDefault(); printPlan(); return; }
  if (typing) { if (ev.key === 'Escape') document.activeElement.blur(); return; }
  if (mod && ev.key.toLowerCase() === 'z') { ev.preventDefault(); ev.shiftKey ? redo() : undo(); return; }
  if (mod && ev.key.toLowerCase() === 'y') { ev.preventDefault(); redo(); return; }
  if (mod && ev.key.toLowerCase() === 'a') { ev.preventDefault(); setTool('select'); sel = new Set(P.elements.map(e => e.id)); render(); renderProps(); return; }
  if (mod && ev.key.toLowerCase() === 'd') { ev.preventDefault(); duplicateSel(); return; }
  if (mod) return;
  if (ev.key === ' ') { spaceDown = true; svg.classList.add('pan'); ev.preventDefault(); return; }
  if (ev.key === 'Escape') { if (draft) endDraft(); else if (tool !== 'select') setTool('select'); else { sel.clear(); render(); renderProps(); } return; }
  if (ev.key === 'Enter') { if (draft) endDraft(); return; }
  if (ev.key === 'Delete' || ev.key === 'Backspace') { deleteSel(); ev.preventDefault(); return; }
  if (ev.key.startsWith('Arrow') && sel.size) {
    ev.preventDefault();
    const k = ev.shiftKey ? P.grid.major : step();
    const d = { ArrowLeft: { x: -k, y: 0 }, ArrowRight: { x: k, y: 0 }, ArrowUp: { x: 0, y: -k }, ArrowDown: { x: 0, y: k } }[ev.key];
    pushUndo(); selected().forEach(e => translate(e, d)); changed(); return;
  }
  const k = ev.key.toUpperCase();
  if (k === 'F') { fitView(); return; }
  if (k === 'G') { P.grid.snap = !P.grid.snap; syncSnap(); scheduleSave(); return; }
  const t = TOOLS.find(t => t[2] === k); if (t) setTool(t[0]);
});
document.addEventListener('keyup', ev => { if (ev.key === ' ') { spaceDown = false; svg.classList.remove('pan'); svg.classList.toggle('pan', tool === 'pan'); } });

function deleteSel() {
  if (!sel.size) return;
  pushUndo(); P.elements = P.elements.filter(e => !sel.has(e.id)); sel.clear(); changed();
}
function duplicateSel() {
  if (!sel.size) return;
  pushUndo();
  const off = { x: P.grid.major, y: P.grid.major }, ids = [];
  for (const e of selected()) { const c = JSON.parse(JSON.stringify(e)); translate(c, off); ids.push(addEl(c).id); }
  sel = new Set(ids); changed();
}
function reorder(front) {
  pushUndo();
  const s = P.elements.filter(e => sel.has(e.id)), rest = P.elements.filter(e => !sel.has(e.id));
  P.elements = front ? [...rest, ...s] : [...s, ...rest]; changed();
}

/* ---------- properties panel ---------- */
const TYPE_LABEL = e => e.type === 'line' ? (e.width > 0 ? 'Wall' : 'Line') : e.type === 'curve' ? (e.width > 0 ? 'Curved wall' : 'Curve') :
  e.type === 'door' ? { door: 'Door', window: 'Window', opening: 'Opening' }[e.kind] : e.type === 'dim' ? 'Measurement' : 'Text';

function fld(label, inner) { return `<div class="field"><label>${label}</label>${inner}</div>`; }
const inLen = (p, v) => `<input type="text" data-p="${p}" data-t="len" value="${esc(fmtLen(v))}">`;
const inNum = (p, v, stp = 1) => `<input type="number" data-p="${p}" data-t="num" step="${stp}" value="${f4(v)}">`;
const inColor = (p, v) => `<input type="color" data-p="${p}" data-t="text" value="${esc(v)}">`;
const inChk = (p, v, txt) => `<label><input type="checkbox" data-p="${p}" data-t="check"${v ? ' checked' : ''}> ${txt}</label>`;
const angDeg = rad => { let d = -rad * 180 / Math.PI; d = ((d % 360) + 360) % 360; return f4(+d.toFixed(2)); };

function renderProps() {
  const box = $('#props'), els = selected();
  if (!els.length) {
    box.innerHTML = `<h3>${tool === 'select' ? 'Nothing selected' : TOOLS.find(t => t[0] === tool)?.[1] + ' tool'}</h3>
      <p class="note">${HINTS[tool]}</p>
      ${tool === 'curve' ? `<div class="row"><label><input type="checkbox" id="curveWall"${curveAsWall ? ' checked' : ''}> Draw as curved wall (thick)</label></div>` : ''}
      <h4>Shortcuts</h4>
      <div class="kbd">
        <kbd>V</kbd><span>Select</span><kbd>W</kbd><span>Wall</span><kbd>R</kbd><span>Room (4 walls)</span>
        <kbd>L</kbd><span>Line</span><kbd>C</kbd><span>Curve</span><kbd>D N O</kbd><span>Door · Window · Opening</span>
        <kbd>T</kbd><span>Text</span><kbd>M</kbd><span>Measure</span><kbd>Space</kbd><span>Hold to pan</span>
        <kbd>Wheel</kbd><span>Zoom</span><kbd>F</kbd><span>Fit drawing</span><kbd>G</kbd><span>Toggle grid snap</span>
        <kbd>Shift</kbd><span>Lock to 45° while drawing</span><kbd>Alt</kbd><span>Drag a corner without moving joined walls</span>
        <kbd>Ctrl Z / ⇧Z</kbd><span>Undo / redo</span><kbd>Ctrl D</kbd><span>Duplicate</span>
      </div>
      <h4>Plan</h4>
      <p class="note">${P.elements.length} items · ${P.elements.filter(e => e.type === 'line' && e.width > 0).length} walls ·
        ${P.elements.filter(e => e.type === 'door').length} doors/windows/openings</p>
      <p class="note">Lengths accept <code>12'6"</code>, <code>12' 6 1/2"</code>, <code>150cm</code>, <code>3.2m</code>, or a plain number in project units.</p>`;
    const cw = $('#curveWall'); if (cw) cw.onchange = () => { curveAsWall = cw.checked; };
    return;
  }
  const actions = `<div class="row"><button data-act="dup">Duplicate</button><button data-act="front">To front</button><button data-act="back">To back</button><button data-act="del" class="danger">Delete</button></div>`;
  if (els.length > 1) {
    box.innerHTML = `<h3>${els.length} items selected</h3>${actions}<p class="note">Drag to move them together, or use the arrow keys (Shift for bigger steps).</p>`;
    bindProps(null); return;
  }
  const e = els[0];
  let h = `<h3>${TYPE_LABEL(e)}</h3>`;
  if (e.type === 'line' || e.type === 'curve') {
    if (e.type === 'line') {
      h += fld('Length', inLen('_len', V.dist(e.a, e.b)));
      h += fld('Angle (°)', `<input type="number" data-p="_ang" data-t="num" step="any" value="${angDeg(Math.atan2(e.b.y - e.a.y, e.b.x - e.a.x))}">`);
    } else {
      let L = 0; for (let i = 1; i <= 64; i++) L += V.dist(qpt(e, (i - 1) / 64), qpt(e, i / 64));
      h += fld('Arc length', `<span class="ro">${fmtLen(L)}</span>`);
    }
    h += fld('Thickness', inLen('width', e.width || 0));
    h += `<p class="note" style="margin-top:-4px;margin-bottom:8px">0 = thin line; anything thicker draws as a wall.</p>`;
    h += fld('Color', inColor('color', e.color || '#000000'));
    h += fld('Style', inChk('dash', e.dash, 'Dashed'));
    h += fld('Start', `<span class="ro">${fmtLen(e.a.x)}, ${fmtLen(e.a.y)}</span>`);
  } else if (e.type === 'text') {
    h += fld('Text', `<textarea data-p="text" data-t="live" rows="3">${esc(e.text)}</textarea>`);
    h += fld('Size', inLen('size', e.size));
    h += fld('Rotation (°)', inNum('rot', e.rot || 0, 'any'));
    h += fld('Color', inColor('color', e.color));
    h += fld('Style', inChk('bold', e.bold, 'Bold') + ' &nbsp; ' + inChk('italic', e.italic, 'Italic'));
  } else if (e.type === 'door') {
    h += fld('Type', `<select data-p="kind" data-t="text">${['door', 'window', 'opening'].map(k => `<option value="${k}"${e.kind === k ? ' selected' : ''}>${k[0].toUpperCase() + k.slice(1)}</option>`).join('')}</select>`);
    h += fld('Width', inLen('width', e.width));
    h += fld('Wall thickness', inLen('wall', e.wall || P.wallWidth));
    h += fld('Angle (°)', `<input type="number" data-p="_dang" data-t="num" step="any" value="${angDeg(e.angle)}">`);
    h += fld('Color', inColor('color', e.color || COLORS.door));
    h += `<div class="row">${e.kind === 'door' ? '<button data-act="flip">Flip swing side</button><button data-act="hinge">Swap hinge</button>' : '<button data-act="flip">Flip side</button>'}<button data-act="rot">Rotate 90°</button></div>`;
    h += `<p class="note">Drag it along a wall to reposition; drag the end handles to resize.</p>`;
  } else if (e.type === 'dim') {
    h += fld('Measured', `<span class="ro">${fmtLen(V.dist(e.a, e.b))}</span>`);
    h += fld('Label', `<input type="text" data-p="label" data-t="text" value="${esc(e.label || '')}" placeholder="(automatic)">`);
    h += fld('Offset', inLen('off', e.off));
    h += fld('Text size', inLen('size', e.size || U().dim));
    h += fld('Color', inColor('color', e.color || COLORS.dim));
  }
  box.innerHTML = h + actions;
  bindProps(e);
}
function bindProps(e) {
  $$('#props [data-act]').forEach(b => b.onclick = () => {
    const a = b.dataset.act;
    if (a === 'del') return deleteSel();
    if (a === 'dup') return duplicateSel();
    if (a === 'front' || a === 'back') return reorder(a === 'front');
    pushUndo();
    if (a === 'flip') e.flip = -(e.flip || 1);
    if (a === 'hinge') e.hinge = -(e.hinge || 1);
    if (a === 'rot') e.angle = f4(e.angle + Math.PI / 2);
    changed();
  });
  if (!e) return;
  $$('#props [data-p]').forEach(inp => {
    const p = inp.dataset.p, t = inp.dataset.t;
    if (t === 'live') {
      let pushed = false;
      inp.addEventListener('focus', () => { pushed = false; });
      inp.addEventListener('input', () => { if (!pushed) { pushUndo(); pushed = true; } e[p] = inp.value; changed({ keepProps: true }); });
      return;
    }
    const ev = inp.type === 'color' ? 'input' : 'change';
    let colorPushed = false;
    inp.addEventListener(ev, () => {
      let val;
      if (t === 'len') { val = parseLen(inp.value); if (!isFinite(val)) { toast('Could not read that length'); renderProps(); return; } }
      else if (t === 'num') { val = parseFloat(inp.value); if (!isFinite(val)) return; }
      else if (t === 'check') val = inp.checked;
      else val = inp.value;
      if (inp.type === 'color') { if (!colorPushed) { pushUndo(); colorPushed = true; } }
      else pushUndo();
      if (p === '_len') { const u = V.norm(V.sub(e.b, e.a)); e.b = V.r(V.add(e.a, V.mul(u, Math.max(val, 0)))); }
      else if (p === '_ang') { const L = V.dist(e.a, e.b), r = -val * Math.PI / 180; e.b = V.r(V.add(e.a, V.mul(V.dir(r), L))); }
      else if (p === '_dang') e.angle = f4(-val * Math.PI / 180);
      else if (p === 'width' || p === 'size' || p === 'wall') e[p] = f4(Math.max(0, val));
      else e[p] = val;
      changed({ keepProps: inp.type === 'color' });
    });
  });
}

/* ---------- settings panel ---------- */
function renderSettings() {
  const g = P.grid;
  $('#settings').innerHTML = `
    <h3>Drawing</h3>
    ${fld('Units', `<select id="setUnits">${Object.entries(UNITS).map(([k, u]) => `<option value="${k}"${P.units === k ? ' selected' : ''}>${u.name}</option>`).join('')}</select>`)}
    ${fld('Grid size', `<input type="text" id="setMajor" value="${esc(fmtLen(g.major))}">`)}
    ${fld('Subdivisions', `<input type="number" id="setSub" min="1" max="24" step="1" value="${g.sub}">`)}
    <p class="note" style="margin-top:-4px">Snap step: ${fmtLen(step())}</p>
    ${fld('Snap', `<label><input type="checkbox" id="setSnap"${g.snap ? ' checked' : ''}> Snap to grid</label>`)}
    ${fld('Wall thickness', `<input type="text" id="setWall" value="${esc(fmtLen(P.wallWidth))}">`)}
    <p class="note" style="margin-top:-4px">Used for new walls and rooms.</p>
    <h4>Print / PDF</h4>
    ${fld('Orientation', `<select id="setOrient"><option value="landscape"${P.print.orientation === 'landscape' ? ' selected' : ''}>Landscape</option><option value="portrait"${P.print.orientation === 'portrait' ? ' selected' : ''}>Portrait</option></select>`)}
    ${fld('Include', `<div><label><input type="checkbox" id="setPGrid"${P.print.grid ? ' checked' : ''}> Grid</label><br><label><input type="checkbox" id="setPDesc"${P.print.description ? ' checked' : ''}> Description</label></div>`)}
    <p class="note">In the print dialog choose “Save as PDF” as the destination.</p>
    <h4>Storage</h4>
    <p class="note">This project is saved automatically in this browser (local storage). Clearing site data removes it — keep a <b>Save JSON</b> copy of anything important.</p>`;
  $('#setUnits').onchange = ev => {
    const nu = ev.target.value;
    if (P.elements.length && confirm(`Convert the existing drawing to ${UNITS[nu].name.toLowerCase()}?\n\nOK = convert sizes (a 10 ft wall stays 10 ft long)\nCancel = keep the numbers as they are`)) convertUnits(nu);
    else { P.units = nu; P.grid.major = UNITS[nu].major; P.grid.sub = UNITS[nu].sub; P.wallWidth = UNITS[nu].wall; }
    renderSettings(); fitView(); changed();
  };
  $('#setMajor').onchange = ev => { const v = parseLen(ev.target.value); if (v > 0) P.grid.major = f4(v); renderSettings(); changed(); };
  $('#setSub').onchange = ev => { P.grid.sub = clamp(Math.round(+ev.target.value) || 1, 1, 24); renderSettings(); changed(); };
  $('#setSnap').onchange = ev => { P.grid.snap = ev.target.checked; syncSnap(); scheduleSave(); };
  $('#setWall').onchange = ev => { const v = parseLen(ev.target.value); if (v > 0) P.wallWidth = f4(v); renderSettings(); scheduleSave(); };
  $('#setOrient').onchange = ev => { P.print.orientation = ev.target.value; scheduleSave(); };
  $('#setPGrid').onchange = ev => { P.print.grid = ev.target.checked; scheduleSave(); };
  $('#setPDesc').onchange = ev => { P.print.description = ev.target.checked; scheduleSave(); };
}
function convertUnits(nu) {
  pushUndo();
  const k = UNITS[P.units].toM / UNITS[nu].toM;
  const sc = p => ({ x: f4(p.x * k), y: f4(p.y * k) });
  for (const e of P.elements) {
    for (const key of pointKeys(e)) e[key] = sc(e[key]);
    for (const key of ['width', 'size', 'wall', 'off']) if (typeof e[key] === 'number') e[key] = f4(e[key] * k);
  }
  P.units = nu; P.grid.major = UNITS[nu].major; P.grid.sub = UNITS[nu].sub; P.wallWidth = f4(P.wallWidth * k);
  if (P.view) P.view.s /= k;
}
function syncSnap() { $('#snapTgl').checked = P.grid.snap; const s = $('#setSnap'); if (s) s.checked = P.grid.snap; }

/* ---------- description ---------- */
let mdMode = 'write';
function setMdMode(m) {
  mdMode = m;
  $$('.mdbar [data-md]').forEach(b => b.classList.toggle('on', b.dataset.md === m));
  $('#descInput').classList.toggle('hidden', m !== 'write');
  $('#descPreview').classList.toggle('hidden', m !== 'preview');
  if (m === 'preview') $('#descPreview').innerHTML = mdToHtml(P.description) || '<p class="muted">Nothing written yet.</p>';
}
$$('.mdbar [data-md]').forEach(b => b.onclick = () => setMdMode(b.dataset.md));
$('#descInput').addEventListener('input', ev => { P.description = ev.target.value; scheduleSave(); });

function switchTab(name) {
  $$('.tabs [data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === name));
  $$('.panel').forEach(p => p.classList.toggle('on', p.id === 'tab-' + name));
  if (name === 'settings') renderSettings();
  if (name === 'desc' && mdMode === 'preview') setMdMode('preview');
}
$$('.tabs [data-tab]').forEach(b => b.onclick = () => switchTab(b.dataset.tab));

/* ---------- print / pdf ---------- */
function buildPrintSheet() {
  const els = P.elements, b0 = bboxAll(els) || { x0: 0, y0: 0, x1: 10, y1: 10 };
  const pad = Math.max((b0.x1 - b0.x0), (b0.y1 - b0.y0)) * 0.04 + P.grid.major;
  const b = { x0: b0.x0 - pad, y0: b0.y0 - pad, x1: b0.x1 + pad, y1: b0.y1 + pad };
  const bw = b.x1 - b.x0;
  // scale bar under the drawing
  const target = bw / 5, bars = U().bars;
  const L = bars.reduce((best, v) => Math.abs(v - target) < Math.abs(best - target) ? v : best, bars[0]);
  const bh = bw * 0.012, by = b.y1 + bh * 1.5, fs = bh * 1.6;
  let bar = '';
  for (let i = 0; i < 4; i++) bar += `<rect x="${f4(b.x0 + i * L / 4)}" y="${f4(by)}" width="${f4(L / 4)}" height="${f4(bh)}" fill="${i % 2 ? '#fff' : '#000'}" stroke="#000" stroke-width="0.6" vector-effect="non-scaling-stroke"/>`;
  bar += `<text x="${f4(b.x0)}" y="${f4(by + bh + fs * 1.1)}" font-size="${f4(fs)}">0</text><text x="${f4(b.x0 + L)}" y="${f4(by + bh + fs * 1.1)}" font-size="${f4(fs)}" text-anchor="middle">${esc(fmtLen(L))}</text>`;
  const vbH = by + bh + fs * 1.6 - b.y0;
  const land = P.print.orientation === 'landscape';
  const svgH = land ? 158 : 215; // mm
  const planSvg = `<svg class="plan" xmlns="http://www.w3.org/2000/svg" viewBox="${f4(b.x0)} ${f4(b.y0)} ${f4(bw)} ${f4(vbH)}" style="height:${svgH}mm" preserveAspectRatio="xMidYMid meet" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif">
    ${P.print.grid ? gridMarkup(b, 1, true) : ''}${sceneMarkup(els, 'p', { ghost: true })}${bar}</svg>`;
  const date = new Date().toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
  $('#print-sheet').innerHTML = `<header><h1>${esc(P.name)}</h1><div class="meta">${date} · units: ${UNITS[P.units].name.toLowerCase()} · grid ${esc(fmtLen(P.grid.major))}</div></header>
    ${planSvg}${P.print.description && P.description.trim() ? `<section class="md">${mdToHtml(P.description)}</section>` : ''}`;
  let ps = $('#pageStyle'); if (!ps) { ps = document.createElement('style'); ps.id = 'pageStyle'; document.head.appendChild(ps); }
  ps.textContent = `@page { size: ${land ? 'landscape' : 'portrait'}; margin: 12mm; }`;
}
function printPlan() { buildPrintSheet(); setTimeout(() => window.print(), 50); }
window.addEventListener('beforeprint', buildPrintSheet);

/* ---------- json import / export ---------- */
const slug = s => (s || 'floor-plan').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'floor-plan';
function exportJson(proj) {
  if (!proj || proj === P) { saveNow(); proj = P; }
  const data = { app: 'floor-plan-studio', version: 1, exported: new Date().toISOString(), project: proj };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = slug(proj.name) + '.floorplan.json';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('Downloaded ' + a.download);
}
function importJsonFile(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const data = JSON.parse(r.result);
      const raw = data.project || data;
      if (!raw || !Array.isArray(raw.elements)) throw new Error('No elements found');
      const p = normalizeProject(raw);
      if (store.load(p.id) && !confirm(`“${p.name}” is already in this browser.\n\nOK = replace the browser copy with this file\nCancel = import as a separate copy`)) {
        p.id = uid(); p.name += ' (imported)';
      }
      saveNow(); openProject(p); saveNow();
      $('#projDlg').open && $('#projDlg').close();
      toast('Loaded ' + p.name);
    } catch (err) { alert('Could not open that file: ' + err.message); }
  };
  r.readAsText(file);
}
$('#fileIn').onchange = ev => { const f = ev.target.files[0]; if (f) importJsonFile(f); ev.target.value = ''; };
document.addEventListener('dragover', e => e.preventDefault());
document.addEventListener('drop', e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f && /json/i.test(f.type + f.name)) importJsonFile(f); });

/* ---------- projects ---------- */
function openProject(p) {
  P = normalizeProject(p);
  sel.clear(); draft = null; ghost = []; undoStack = []; redoStack = [];
  $('#projName').value = P.name;
  $('#descInput').value = P.description;
  setMdMode(P.description.trim() && mdMode === 'preview' ? 'preview' : 'write');
  syncSnap(); renderSettings();
  localStorage.setItem('fp:current', P.id);
  if (!P.view) fitView(); else render();
  renderProps(); updUndo();
}
function renderProjList() {
  const idx = store.index().sort((a, b) => b.modified - a.modified);
  $('#projList').innerHTML = idx.length ? idx.map(i => `<div class="proj${i.id === P.id ? ' cur' : ''}" data-open="${i.id}">
      <div class="grow"><div class="pn">${esc(i.name)}</div><div class="pm">${new Date(i.modified).toLocaleString()} · ${i.count} items</div></div>
      <button data-dl="${i.id}" title="Download JSON">JSON</button><button data-rm="${i.id}" class="danger" title="Delete from browser">Delete</button></div>`).join('')
    : '<p class="muted" style="padding:12px">No saved projects yet.</p>';
}
$('#projList').addEventListener('click', ev => {
  const rm = ev.target.closest('[data-rm]'), dl = ev.target.closest('[data-dl]'), op = ev.target.closest('[data-open]');
  if (rm) {
    const id = rm.dataset.rm, p = store.load(id);
    if (!confirm(`Delete “${p?.name || 'this project'}” from this browser? This can't be undone.`)) return;
    store.remove(id);
    if (id === P.id) { const next = store.index().sort((a, b) => b.modified - a.modified)[0]; openProject(next ? store.load(next.id) : newProject()); saveNow(); }
    renderProjList(); return;
  }
  if (dl) { saveNow(); const p = store.load(dl.dataset.dl); if (p) exportJson(p); return; }
  if (op) { saveNow(); const p = store.load(op.dataset.open); if (p) openProject(p); $('#projDlg').close(); }
});
function createNew() {
  saveNow();
  const name = prompt('Name for the new plan:', 'Untitled plan'); if (name === null) return;
  openProject(newProject(name.trim() || 'Untitled plan', P.units)); saveNow(); setTool('wall');
  $('#projDlg').open && $('#projDlg').close();
}

/* ---------- misc ui ---------- */
let toastTimer;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200); }

$('#projName').addEventListener('input', ev => { P.name = ev.target.value || 'Untitled plan'; scheduleSave(); });
$('#btnProjects').onclick = () => { saveNow(); renderProjList(); $('#projDlg').showModal(); };
$('#btnNew').onclick = createNew;
$('#dlgNew').onclick = createNew;
$('#btnOpen').onclick = $('#dlgImport').onclick = () => $('#fileIn').click();
$('#btnSave').onclick = () => exportJson();
$('#btnPrint').onclick = printPlan;
$('#btnUndo').onclick = undo;
$('#btnRedo').onclick = redo;
$('[data-close]').onclick = () => $('#projDlg').close();
$('#zoomIn').onclick = () => zoomAt(svg.clientWidth / 2, svg.clientHeight / 2, 1.25);
$('#zoomOut').onclick = () => zoomAt(svg.clientWidth / 2, svg.clientHeight / 2, 0.8);
$('#zoomFit').onclick = fitView;
$('#snapTgl').onchange = ev => { P.grid.snap = ev.target.checked; syncSnap(); scheduleSave(); };
window.addEventListener('resize', () => render());
window.addEventListener('beforeunload', () => { if (P) saveNow(); });

/* ---------- boot ---------- */
buildToolbar();
(function boot() {
  const curId = localStorage.getItem('fp:current');
  let p = curId && store.load(curId);
  if (!p) { const first = store.index().sort((a, b) => b.modified - a.modified)[0]; p = first && store.load(first.id); }
  if (!p) p = sampleProject();
  openProject(p);
  saveNow();
  setTool('select');
})();
