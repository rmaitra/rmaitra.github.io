// ============ Core helpers ============
function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rndNonZero(min, max) { let v; do { v = rnd(min, max); } while (v === 0); return v; }
function choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; }
function round2(n) { return Math.round(n * 100) / 100; }

function fmtBinom(varStr, k) {
  return k >= 0 ? `(${varStr} + ${k})` : `(${varStr} - ${Math.abs(k)})`;
}

// a x^2 + b x + c  (a assumed 1 unless passed)
function fmtQuad(a, b, c) {
  let s = '';
  if (a === 1) s += 'x²';
  else if (a === -1) s += '-x²';
  else s += `${a}x²`;
  if (b !== 0) s += (b > 0 ? ' + ' : ' - ') + (Math.abs(b) === 1 ? 'x' : `${Math.abs(b)}x`);
  if (c !== 0) s += (c > 0 ? ' + ' : ' - ') + Math.abs(c);
  return s;
}

// linear a*x + b  (a assumed 1 unless passed), returns just "x + b" style, omitting b if 0
function fmtLinear(b, coefX = 1) {
  let s = coefX === 1 ? 'x' : coefX === -1 ? '-x' : `${coefX}x`;
  if (b !== 0) s += (b > 0 ? ' + ' : ' - ') + Math.abs(b);
  return s;
}

function fmtComplex(re, im) {
  re = round2(re); im = round2(im);
  if (im === 0) return `${re}`;
  const imPart = Math.abs(im) === 1 ? 'i' : `${Math.abs(im)}i`;
  if (re === 0) return (im < 0 ? '-' : '') + imPart;
  return `${re} ${im < 0 ? '-' : '+'} ${imPart}`;
}

function fmtComplexTerm(re, im) {
  return `(${fmtComplex(re, im)})`;
}

// ---------- safe expression evaluator (variable x only) ----------
function sanitizeExpr(raw) {
  if (typeof raw !== 'string') return null;
  let s = raw;
  s = s.replace(/[×]/g, '*').replace(/[÷]/g, '/').replace(/[−–]/g, '-');
  s = s.replace(/²/g, '^2').replace(/³/g, '^3');
  s = s.replace(/\s+/g, '');
  if (s.length === 0) return null;
  if (!/^[0-9x+\-*/^().]+$/i.test(s)) return null;
  // implicit multiplication
  s = s.replace(/(\d)(x)/gi, '$1*$2');
  s = s.replace(/(\d|\))(\()/g, '$1*$2');
  s = s.replace(/(x)(\()/gi, '$1*$2');
  s = s.replace(/(\))(x)/gi, '$1*$2');
  s = s.replace(/(\))(\d)/g, '$1*$2');
  s = s.replace(/(x)(\d)/gi, '$1*$2');
  s = s.replace(/\^/g, '**');
  return s;
}

function evalExprAt(raw, xVal) {
  const s = sanitizeExpr(raw);
  if (s === null) return NaN;
  try {
    const f = new Function('x', '"use strict"; return (' + s + ');');
    const v = f(xVal);
    return (typeof v === 'number' && isFinite(v)) ? v : NaN;
  } catch (e) { return NaN; }
}

const DEFAULT_SAMPLES = [0.37, 1.53, -2.21, 2.91, -0.63, 1.09, -1.77, 3.14];

function checkExpressionEquiv(userExpr, referenceFn, excludeXs = []) {
  let validCount = 0, matchCount = 0;
  for (const x of DEFAULT_SAMPLES) {
    if (excludeXs.some(e => Math.abs(e - x) < 1e-6)) continue;
    let ref;
    try { ref = referenceFn(x); } catch (e) { continue; }
    if (!isFinite(ref)) continue;
    const uv = evalExprAt(userExpr, x);
    if (!isFinite(uv)) continue;
    validCount++;
    if (Math.abs(uv - ref) < 1e-3 * Math.max(1, Math.abs(ref))) matchCount++;
  }
  if (validCount < 3) return { ok: false, reason: 'unparseable' };
  return { ok: matchCount === validCount, reason: matchCount === validCount ? 'match' : 'mismatch' };
}

// ---------- point list parsing (for conics / nonlinear systems) ----------
function parsePoints(str) {
  if (!str) return [];
  return str.split(/[;\n]+/).map(s => s.trim()).filter(Boolean).map(s => {
    const parts = s.replace(/[()]/g, '').split(',').map(p => parseFloat(p.trim()));
    if (parts.length !== 2 || parts.some(isNaN)) return null;
    return { x: parts[0], y: parts[1] };
  }).filter(Boolean);
}

function pointSetsMatch(a, b, tol = 0.05) {
  if (a.length !== b.length || a.length === 0) return false;
  const used = new Array(b.length).fill(false);
  for (const pa of a) {
    let found = -1;
    for (let i = 0; i < b.length; i++) {
      if (used[i]) continue;
      if (Math.abs(pa.x - b[i].x) < tol && Math.abs(pa.y - b[i].y) < tol) { found = i; break; }
    }
    if (found === -1) return false;
    used[found] = true;
  }
  return true;
}

function parseDirectrix(str) {
  if (!str) return null;
  const m = str.replace(/\s+/g, '').match(/^([xy])=(-?\d+(\.\d+)?)$/i);
  if (!m) return null;
  return { axis: m[1].toLowerCase(), value: parseFloat(m[2]) };
}

function near(a, b, tol = 0.01) { return Math.abs(a - b) < tol; }

// reduce num/den to lowest terms, denominator normalized positive
function reduceFraction(num, den) {
  if (den < 0) { num = -num; den = -den; }
  const g = gcd(num, den);
  return { num: num / g, den: den / g };
}

// verify a user-entered num/den fraction equals correctNum/correctDen and is fully reduced
function checkReducedFraction(userNumStr, userDenStr, correctNum, correctDen) {
  const un = parseFloat(userNumStr), ud = parseFloat(userDenStr);
  if (isNaN(un) || isNaN(ud) || ud === 0 || !Number.isInteger(un) || !Number.isInteger(ud)) {
    return { ok: false, reason: 'invalid' };
  }
  if (un * correctDen !== correctNum * ud) return { ok: false, reason: 'wrong' };
  if (gcd(un, ud) !== 1) return { ok: false, reason: 'unreduced' };
  return { ok: true, reason: 'match' };
}

// generic polynomial formatter (raw LaTeX, unwrapped). terms: [{coef, pow}], pow 0 = constant
function fmtPoly(terms) {
  let s = '';
  for (const { coef, pow } of terms) {
    if (coef === 0) continue;
    const mag = Math.abs(coef);
    const varPart = pow === 0 ? '' : pow === 1 ? 'x' : `x^{${pow}}`;
    const magPart = (mag === 1 && pow !== 0) ? '' : String(mag);
    const term = magPart + varPart;
    if (s === '') s = (coef < 0 ? '-' : '') + term;
    else s += (coef < 0 ? ' - ' : ' + ') + term;
  }
  return s === '' ? '0' : s;
}

// raw LaTeX bmatrix (unwrapped). rows: 2D array of numbers/strings
function fmtMatrix(rows) {
  const body = rows.map(r => r.join(' & ')).join(' \\\\ ');
  return `\\begin{bmatrix} ${body} \\end{bmatrix}`;
}

function divisorsOf(n) {
  const ds = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) ds.push(i);
  return ds;
}

function det3(m) {
  return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1])
    - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0])
    + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
}

function numsMatchSet(userNums, correctNums, tol = 0.05) {
  if (userNums.length !== correctNums.length || userNums.length === 0) return false;
  const used = new Array(correctNums.length).fill(false);
  for (const u of userNums) {
    let found = -1;
    for (let i = 0; i < correctNums.length; i++) {
      if (used[i]) continue;
      if (Math.abs(u - correctNums[i]) < tol) { found = i; break; }
    }
    if (found === -1) return false;
    used[found] = true;
  }
  return true;
}

// ============ Chart geometry / sampling helpers ============
// Sample y = fn(x) over [xmin, xmax], breaking the line (via a {x, y:null} gap point)
// wherever the value is undefined/huge or jumps sharply (crossing an asymptote).
function sampleFn(fn, xmin, xmax, opts) {
  opts = opts || {};
  const n = opts.n || 160;
  const yClip = opts.yClip || 40;
  const pts = [];
  let prevY = null;
  for (let i = 0; i <= n; i++) {
    const x = xmin + (xmax - xmin) * i / n;
    let y;
    try { y = fn(x); } catch (e) { y = NaN; }
    if (!isFinite(y) || Math.abs(y) > yClip) {
      pts.push({ x: round2(x), y: null });
      prevY = null;
      continue;
    }
    if (prevY !== null && Math.abs(y - prevY) > yClip * 0.6) {
      pts.push({ x: round2(x), y: null });
    }
    pts.push({ x: round2(x), y: round2(y) });
    prevY = y;
  }
  return pts;
}

function circlePoints(cx, cy, r, n) {
  n = n || 120;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = 2 * Math.PI * i / n;
    pts.push({ x: round2(cx + r * Math.cos(t)), y: round2(cy + r * Math.sin(t)) });
  }
  return pts;
}

function ellipsePoints(cx, cy, rx, ry, n) {
  n = n || 120;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = 2 * Math.PI * i / n;
    pts.push({ x: round2(cx + rx * Math.cos(t)), y: round2(cy + ry * Math.sin(t)) });
  }
  return pts;
}

// orientation: 'right'|'left' -> y^2 = k x  (param by y); 'up'|'down' -> x^2 = k y (param by x)
function parabolaPoints(orientation, k, range, n) {
  n = n || 100;
  range = range || Math.max(8, Math.abs(k) * 1.2);
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = -range + 2 * range * i / n;
    if (orientation === 'right' || orientation === 'left') {
      pts.push({ x: round2((t * t) / k), y: round2(t) });
    } else {
      pts.push({ x: round2(t), y: round2((t * t) / k) });
    }
  }
  return pts;
}

// centered at origin. xMajor true: vertices on x-axis (x = ±a cosh t, y = b sinh t)
function hyperbolaPoints(a, b, xMajor, n) {
  n = n || 60;
  const tRange = 2.2;
  function branch(sign) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = -tRange + 2 * tRange * i / n;
      if (xMajor) pts.push({ x: round2(sign * a * Math.cosh(t)), y: round2(b * Math.sinh(t)) });
      else pts.push({ x: round2(b * Math.sinh(t)), y: round2(sign * a * Math.cosh(t)) });
    }
    return pts;
  }
  return { pos: branch(1), neg: branch(-1) };
}

// image of the unit square [(0,0),(1,0),(1,1),(0,1)] under [[a,b],[c,d]], closed loop
function transformSquare(a, b, c, d) {
  const corners = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]];
  return corners.map(([x, y]) => ({ x: round2(a * x + b * y), y: round2(c * x + d * y) }));
}

// origin-anchored arrows showing where the standard basis vectors i=(1,0), j=(0,1) land
// under [[a,b],[c,d]] — i.e. the two columns of the matrix. This is the direct visual
// link between "matrix entries" and "matrix as transformation".
function basisVectorSeries(a, b, c, d, opts) {
  opts = opts || {};
  return [
    { name: opts.name1 || 'î → col 1', type: 'line', data: [{ x: 0, y: 0 }, { x: a, y: c }], color: opts.color1 || '#c792ea', marker: { enabled: true, radius: 5 }, lineWidth: 2 },
    { name: opts.name2 || 'ĵ → col 2', type: 'line', data: [{ x: 0, y: 0 }, { x: b, y: d }], color: opts.color2 || '#ffb84a', marker: { enabled: true, radius: 5 }, lineWidth: 2 }
  ];
}

// square (equal-aspect) [xRange, yRange] bounding box covering all given point arrays, with margin
function squareRangeFromPoints(pointArrays, margin) {
  margin = margin || 1;
  let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity;
  for (const arr of pointArrays) {
    for (const p of arr) {
      if (p.x == null || p.y == null) continue;
      xmin = Math.min(xmin, p.x); xmax = Math.max(xmax, p.x);
      ymin = Math.min(ymin, p.y); ymax = Math.max(ymax, p.y);
    }
  }
  if (!isFinite(xmin)) { xmin = -1; xmax = 1; ymin = -1; ymax = 1; }
  const cx = (xmin + xmax) / 2, cy = (ymin + ymax) / 2;
  const span = Math.max(xmax - xmin, ymax - ymin) / 2 + margin;
  return { xRange: [round2(cx - span), round2(cx + span)], yRange: [round2(cy - span), round2(cy + span)] };
}

