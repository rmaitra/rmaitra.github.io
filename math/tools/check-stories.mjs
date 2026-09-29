// Validates math/stories.json. Run from the repo root:  node math/tools/check-stories.mjs
//
// - every lesson has a unique id and order 1..N, a known act and known strands
// - every built lesson (in `content`) has goals, sources and a role
// - every problem's own answer passes the real checker from stories.js, and
//   every `mistakes` value fails it (so the targeted feedback can actually show)
// - quick-check answers are in range; dialogue speakers exist; each practice
//   turn has 2 hand-written wrong options
// - widgets exist in widgets.js; practice links point at real subjects/topics
// - KaTeX \( \) delimiters and *term* markers are balanced in every string
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(join(dir, 'stories.json'), 'utf8'));
const errors = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);

// Load the real checker from stories.js (it touches no DOM at load time)
const sandbox = { window: {}, console };
vm.runInNewContext(readFileSync(join(dir, 'stories.js'), 'utf8'), sandbox);
const { checkAnswer } = sandbox.window.Stories;

// Kit part names from pixelart.js (also DOM-free at load time)
const artBox = { window: {} };
vm.runInNewContext(readFileSync(join(dir, 'pixelart.js'), 'utf8') + '\nwindow.PixelArt = PixelArt;', artBox);
const kits = artBox.window.PixelArt.kits;

const widgetSrc = readFileSync(join(dir, 'widgets.js'), 'utf8');
const widgetNames = (widgetSrc.match(/return \{([^}]+)\};\s*\}\)\(\);\s*$/) || ['', ''])[1].split(',').map((s) => s.trim()).filter(Boolean);
const appSrc = readFileSync(join(dir, 'app.js'), 'utf8');

// ---- lesson list ----
const acts = new Set(data.acts.map((a) => a.id));
const strands = new Set(data.strands.map((s) => s.id));
const ids = new Set();
const orders = data.lessons.map((l) => l.order).sort((a, b) => a - b);
orders.forEach((o, i) => { if (o !== i + 1) err('lessons', `orders are not 1..${orders.length} (found ${o} at position ${i + 1})`); });
for (const l of data.lessons) {
  const where = `lesson ${l.order} (${l.id})`;
  if (ids.has(l.id)) err(where, 'duplicate id');
  ids.add(l.id);
  if (!acts.has(l.act)) err(where, `unknown act ${l.act}`);
  for (const s of l.strands) if (!strands.has(s)) err(where, `unknown strand ${s}`);
  for (const k of ['year', 'place', 'title']) if (!l[k]) err(where, `missing ${k}`);
}

// ---- string checks ----
function checkString(where, s) {
  if (typeof s !== 'string') return;
  const open = (s.match(/\\\(/g) || []).length, close = (s.match(/\\\)/g) || []).length;
  if (open !== close) err(where, `unbalanced \\( \\) in "${s.slice(0, 60)}…"`);
  const outside = s.replace(/\\\(.*?\\\)/g, '');
  if ((outside.match(/\*/g) || []).length % 2) err(where, `unbalanced *term* markers in "${s.slice(0, 60)}…"`);
}
function walkStrings(where, v) {
  if (typeof v === 'string') checkString(where, v);
  else if (Array.isArray(v)) v.forEach((x) => walkStrings(where, x));
  else if (v && typeof v === 'object') for (const k in v) walkStrings(where, v[k]);
}

// ---- problems ----
function checkProblem(where, p) {
  if (!p.id) err(where, 'problem without id');
  if (!Array.isArray(p.fields) || !p.fields.length) { err(where, 'problem without fields'); return; }
  if (!['number', 'set'].includes(p.check)) err(where, `unknown check "${p.check}"`);
  const field = p.fields[0].id;
  const asInput = (v) => (Array.isArray(v) ? v.join(', ') : String(v));
  const values = {};
  for (const f of p.fields) values[f.id] = asInput(p.answer[f.id]);
  const r = checkAnswer(p, values);
  if (!r.ok) err(where, `own answer is rejected: ${JSON.stringify(values)} → ${r.message}`);
  for (const m of p.mistakes || []) {
    const mv = { ...values, [field]: asInput(m.value) };
    const rm = checkAnswer(p, mv);
    if (rm.ok) err(where, `mistake value ${JSON.stringify(m.value)} is accepted as correct`);
    else if (rm.message !== m.say) err(where, `mistake value ${JSON.stringify(m.value)} doesn't trigger its feedback`);
  }
  if (!(p.solution || []).length) err(where, 'problem without a worked solution');
}

// ---- built lessons ----
const topicKnown = (name) => new RegExp(`topicOrder: \\[[^\\]]*'${name}'`).test(appSrc);
for (const [id, c] of Object.entries(data.content || {})) {
  const where = `content ${id}`;
  if (!ids.has(id)) err(where, 'no lesson with this id in the lesson list');
  for (const k of ['role', 'goals', 'sources', 'steps']) if (!c[k] || (Array.isArray(c[k]) && !c[k].length)) err(where, `missing ${k}`);
  walkStrings(where, c);
  for (const p of c.practiceLinks || []) {
    if (!new RegExp(`\\b${p.subject}: \\{`).test(appSrc)) err(where, `practice link to unknown subject ${p.subject}`);
    if (!topicKnown(p.topic)) err(where, `practice link to unknown topic ${p.topic}`);
  }
  const problemIds = new Set();
  c.steps.forEach((s, i) => {
    const at = `${where} step ${i + 1} (${s.type})`;
    const problems = s.type === 'problem' ? [s] : s.type === 'application' && s.problem ? [s.problem] : [];
    for (const p of problems) {
      if (problemIds.has(p.id)) err(at, `duplicate problem id ${p.id}`);
      problemIds.add(p.id);
      checkProblem(at, p);
    }
    if (s.type === 'check') {
      if (!(s.answer >= 0 && s.answer < s.options.length)) err(at, 'answer index out of range');
      if (!s.why) err(at, 'quick check without a "why"');
    }
    if (s.type === 'widget' && !widgetNames.includes(s.name)) err(at, `unknown widget ${s.name} (known: ${widgetNames.join(', ')})`);
    if (s.type === 'dialogue') {
      for (const line of s.lines) {
        if (line.narration) continue;
        if (!s.speakers[line.s]) err(at, `undeclared speaker ${line.s}`);
        if (s.practice && line.s === s.practice && (!line.wrong || line.wrong.length !== 2)) err(at, `practice line needs 2 wrong options: "${line.text}"`);
      }
    }
    if (s.type === 'derive' && !(s.lines || []).length) err(at, 'empty derivation');
    const chars = c.characters || {};
    const pic = s.type === 'picture' ? s : s.type === 'scene' ? s.picture : null;
    if (pic) {
      for (const l of pic.layers || []) if (!kits.includes(l.kit)) err(at, `unknown picture kit "${l.kit}" (known: ${kits.join(', ')})`);
      for (const who of pic.cast || []) if (!chars[who.who]) err(at, `picture cast "${who.who}" is not in characters`);
      if (!pic.caption) err(at, 'picture without a caption');
    }
    if (s.type === 'person' && s.character && !chars[s.character]) err(at, `person character "${s.character}" is not in characters`);
    if (s.type === 'dialogue') for (const sp of Object.values(s.speakers)) if (sp.character && !chars[sp.character]) err(at, `speaker character "${sp.character}" is not in characters`);
    if (s.type === 'scene' && s.map) {
      const m = s.map;
      const lonLat = (p) => Array.isArray(p) && p.length === 2 && Math.abs(p[0]) <= 180 && Math.abs(p[1]) <= 90;
      if (!lonLat(m.center) || !(m.span > 0)) err(at, 'map needs center [lon, lat] and a positive span');
      if (m.from && (!lonLat(m.from.center) || !(m.from.span > 0))) err(at, 'map "from" needs center and span');
      const pts = [...(m.pins || []), ...(m.places || []), ...(m.labels || [])].map((x) => x.at)
        .concat(...(m.routes || []).map((r) => r.path || [r.from, r.to]));
      pts.forEach((p) => { if (!lonLat(p)) err(at, `bad map coordinate ${JSON.stringify(p)} (use [lon, lat])`); });
      if (!(m.pins || []).length) err(at, 'map without a pin');
      if (!m.caption) err(at, 'map without a caption');
    }
  });
}

const built = Object.keys(data.content || {}).length;
if (errors.length) {
  console.error(errors.map((e) => '✗ ' + e).join('\n'));
  console.error(`\n${errors.length} problem(s) found.`);
  process.exit(1);
}
console.log(`✓ stories.json OK: ${data.lessons.length} lessons listed, ${built} built.`);
