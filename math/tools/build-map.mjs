// Builds math/map-data.json, the coastline, lake and river data behind the Stories
// pixel maps. Run from the repo root:  node math/tools/build-map.mjs
//
// Source: Natural Earth 1:50m land, lakes and rivers (public domain), fetched from
// the natural-earth-vector repository. Today's shrunken Aral Sea is swapped for
// Natural Earth's historic outline (ne_10m_lakes_historic), because these maps
// show the world of the past; every other coastline and river is the modern one.
//
// Output format (compact on purpose, loaded only when a map is shown):
//   { unit, land: [ring...], lakes: [ring...], rivers: [{ name, lines: [line...] }] }
// Every ring/line is a flat array of integers [x0, y0, dx1, dy1, …] in `unit`
// degrees (x = longitude, y = latitude), each point stored as a delta from the last.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'map-data.json');
const BASE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/';
const UNIT = 0.02; // degrees per stored integer step
const TOLERANCE = 0.04; // Douglas–Peucker tolerance in degrees (about one pixel at the closest zoom)
const MIN_RING_AREA = 0.02; // square degrees; smaller islands and lakes vanish below one pixel anyway
const MAX_RIVER_RANK = 6; // Natural Earth scalerank: lower is more important

async function get(name) {
  const res = await fetch(BASE + name + '.geojson');
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  return res.json();
}

// Douglas–Peucker line simplification
function simplify(pts, tol) {
  if (pts.length <= 2) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = pts[a], [bx, by] = pts[b];
    const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
    let far = -1, farD = tol * tol;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = pts[i];
      let t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
      t = Math.max(0, Math.min(1, t));
      const ex = ax + t * dx - px, ey = ay + t * dy - py;
      const d = ex * ex + ey * ey;
      if (d > farD) { farD = d; far = i; }
    }
    if (far >= 0) { keep[far] = 1; stack.push([a, far], [far, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}

function area(ring) {
  let s = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) s += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]);
  return Math.abs(s / 2);
}

// Quantise to UNIT steps, drop repeated points, delta-encode
function encode(pts) {
  const out = [];
  let px = 0, py = 0, first = true;
  for (const [x, y] of pts) {
    const qx = Math.round(x / UNIT), qy = Math.round(y / UNIT);
    if (!first && qx === px && qy === py) continue;
    out.push(first ? qx : qx - px, first ? qy : qy - py);
    px = qx; py = qy; first = false;
  }
  return out;
}

function polygonsOf(geom) {
  if (!geom) return [];
  if (geom.type === 'Polygon') return [geom.coordinates];
  if (geom.type === 'MultiPolygon') return geom.coordinates;
  return [];
}
function linesOf(geom) {
  if (!geom) return [];
  if (geom.type === 'LineString') return [geom.coordinates];
  if (geom.type === 'MultiLineString') return geom.coordinates;
  return [];
}

function rings(features) {
  const out = [];
  for (const f of features) {
    for (const poly of polygonsOf(f.geometry)) {
      for (const ring of poly) {
        if (area(ring) < MIN_RING_AREA) continue;
        const s = simplify(ring, TOLERANCE);
        if (s.length >= 4) out.push(encode(s));
      }
    }
  }
  return out;
}

const [land, lakes, historic, rivers] = await Promise.all([
  get('ne_50m_land'), get('ne_50m_lakes'), get('ne_10m_lakes_historic'), get('ne_50m_rivers_lake_centerlines')
]);

const isAral = (f) => /Aral/.test(f.properties.name || '');
const lakeFeatures = lakes.features.filter((f) => !isAral(f)).concat(historic.features.filter(isAral));

const riverMap = new Map();
for (const f of rivers.features) {
  if ((f.properties.scalerank ?? 99) > MAX_RIVER_RANK) continue;
  const name = f.properties.name_en || f.properties.name || '';
  if (/Canal/.test(name)) continue; // modern canals (Suez, Panama …) don't belong on a map of the past
  const lines = linesOf(f.geometry).map((l) => encode(simplify(l, TOLERANCE))).filter((l) => l.length >= 4);
  if (!lines.length) continue;
  if (!riverMap.has(name)) riverMap.set(name, []);
  riverMap.get(name).push(...lines);
}

const data = {
  source: 'Natural Earth 1:50m land, lakes and rivers (public domain, naturalearthdata.com); historic Aral Sea outline from ne_10m_lakes_historic. Modern coastlines and rivers.',
  unit: UNIT,
  land: rings(land.features),
  lakes: rings(lakeFeatures),
  rivers: [...riverMap].map(([name, lines]) => ({ name, lines }))
};
const json = JSON.stringify(data);
writeFileSync(OUT, json);
const pts = (arr) => arr.reduce((n, r) => n + r.length / 2, 0);
console.log(`✓ wrote ${OUT}: ${(json.length / 1024).toFixed(0)} KB · ${data.land.length} land rings (${pts(data.land)} pts) · ${data.lakes.length} lakes · ${data.rivers.length} rivers`);
