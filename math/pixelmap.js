// ============ Pixel maps ============
// Draws a chunky pixel-art map of where a story takes place, from Natural Earth
// coastlines, lakes and rivers (math/map-data.json, built by tools/build-map.mjs).
//
// PixelMap.render(el, opts, { live }) where opts (from a `scene` step's `map`) is:
//   center: [lon, lat], span: degrees of longitude across the map,
//   from:   { center, span }  optional start view for the zoom-in on a live render,
//   pins:   [{ at: [lon, lat], label }]            the main place (gold pin)
//   places: [{ at, label, side }]                  secondary places (small dots)
//   routes: [{ path: [[lon, lat], …] }]            dashed journeys through waypoints
//   labels: [{ at, text, kind: 'river' | 'sea' }]  map text
//   caption, today: { label, url }                 text and a "see it today" link
//
// The map is drawn at low resolution (one map pixel = PX screen pixels) with no
// anti-aliasing, then scaled up with image-rendering: pixelated.
var PixelMap = (function () {
  const PX = 4; // screen pixels per map pixel
  const ASPECT = 0.55; // height / width
  const COLORS = {
    deep: [7, 18, 29], shallow: [13, 34, 51], coast: [92, 77, 42],
    land: [43, 38, 24], landAlt: [38, 34, 21], fertile: [31, 51, 32], fertileAlt: [27, 45, 28],
    river: [61, 127, 179], lake: [13, 34, 51], route: [255, 210, 122], dot: [232, 220, 196], outline: [18, 12, 4],
    pin: [255, 210, 122], pinLight: [255, 244, 214]
  };
  // Pixel sprites: '#' outline, 'o' gold, 'w' highlight; the tip is the bottom '#'
  const PIN = [
    '..###..',
    '.#ooo#.',
    '#oowoo#',
    '#owwwo#',
    '#oowoo#',
    '.#ooo#.',
    '..#o#..',
    '..#o#..',
    '...#...'
  ];
  const DOT = ['.#.', '#w#', '.#.'];

  let dataPromise = null;
  function loadData() {
    if (!dataPromise) {
      dataPromise = fetch('map-data.json').then((r) => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(decode);
    }
    return dataPromise;
  }
  // Delta-encoded integer rings → Float64Array [lon, lat, …] with a bounding box
  function decodeLine(arr, unit) {
    const pts = new Float64Array(arr.length);
    let x = 0, y = 0, minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < arr.length; i += 2) {
      x += arr[i]; y += arr[i + 1];
      const lon = x * unit, lat = y * unit;
      pts[i] = lon; pts[i + 1] = lat;
      if (lon < minX) minX = lon; if (lon > maxX) maxX = lon;
      if (lat < minY) minY = lat; if (lat > maxY) maxY = lat;
    }
    return { pts, minX, minY, maxX, maxY };
  }
  function decode(d) {
    return {
      land: d.land.map((r) => decodeLine(r, d.unit)),
      lakes: d.lakes.map((r) => decodeLine(r, d.unit)),
      rivers: d.rivers.flatMap((r) => r.lines.map((l) => decodeLine(l, d.unit))),
      source: d.source
    };
  }

  // Equirectangular projection around the view centre, scaled so `span` degrees of
  // longitude fill the width (shapes stay true near the centre latitude).
  function projection(view, W, H) {
    const cos = Math.cos(view.center[1] * Math.PI / 180);
    const k = W / (view.span * cos);
    return {
      x: (lon) => (lon - view.center[0]) * cos * k + W / 2,
      y: (lat) => H / 2 - (lat - view.center[1]) * k,
      lonMin: view.center[0] - view.span / 2, lonMax: view.center[0] + view.span / 2,
      latMin: view.center[1] - (H / 2) / k, latMax: view.center[1] + (H / 2) / k
    };
  }
  const visible = (r, p) => !(r.maxX < p.lonMin || r.minX > p.lonMax || r.maxY < p.latMin || r.minY > p.latMax);

  // Fill rings into a coverage mask (1 = inside) using the canvas, then threshold
  // so every map pixel is either in or out: no soft edges.
  function mask(ctx, rings, p, W, H) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    for (const r of rings) {
      if (!visible(r, p)) continue;
      const a = r.pts;
      ctx.moveTo(p.x(a[0]), p.y(a[1]));
      for (let i = 2; i < a.length; i += 2) ctx.lineTo(p.x(a[i]), p.y(a[i + 1]));
      ctx.closePath();
    }
    ctx.fill('evenodd');
    const img = ctx.getImageData(0, 0, W, H).data;
    const out = new Uint8Array(W * H);
    for (let i = 0; i < out.length; i++) out[i] = img[i * 4 + 3] > 110 ? 1 : 0;
    return out;
  }

  // Bresenham line on the pixel grid; calls plot(x, y, stepIndex)
  function line(x0, y0, x1, y1, plot) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy, n = 0;
    for (;;) {
      plot(x0, y0, n++);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  const hash = (x, y) => ((x * 73856093) ^ (y * 19349663)) >>> 0;

  function paint(ctx, scratch, data, view, W, H, overlays, t) {
    const p = projection(view, W, H);
    const land = mask(scratch, data.land, p, W, H);
    const lake = mask(scratch, data.lakes, p, W, H);
    // 0 water, 1 land, 2 river
    const cls = new Uint8Array(W * H);
    for (let i = 0; i < cls.length; i++) cls[i] = land[i] && !lake[i] ? 1 : 0;
    for (const r of data.rivers) {
      if (!visible(r, p)) continue;
      const a = r.pts;
      for (let i = 2; i < a.length; i += 2) {
        line(p.x(a[i - 2]), p.y(a[i - 1]), p.x(a[i]), p.y(a[i + 1]), (x, y) => {
          if (x >= 0 && y >= 0 && x < W && y < H && cls[y * W + x] === 1) cls[y * W + x] = 2;
        });
      }
    }
    const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? -1 : cls[y * W + x]);
    const near = (x, y, r, want) => {
      for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (at(x + i, y + j) === want) return true;
      return false;
    };
    const img = ctx.createImageData(W, H);
    const d = img.data;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const c = cls[y * W + x];
        const alt = hash(x, y) % 5 === 0;
        let col;
        if (c === 0) col = near(x, y, 1, 1) || near(x, y, 1, 2) ? COLORS.shallow : COLORS.deep;
        else if (c === 2) col = COLORS.river;
        else if (near(x, y, 1, 0)) col = COLORS.coast;
        else if (near(x, y, 2, 2)) col = alt ? COLORS.fertileAlt : COLORS.fertile;
        else col = alt ? COLORS.landAlt : COLORS.land;
        const o = (y * W + x) * 4;
        d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255;
      }
    }
    const put = (x, y, col) => {
      x = Math.round(x); y = Math.round(y);
      if (x < 0 || y < 0 || x >= W || y >= H) return;
      const o = (y * W + x) * 4;
      d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2];
    };
    const sprite = (rows, cx, cy, ax, ay, colorFor) => rows.forEach((row, j) => [...row].forEach((ch, i) => {
      const col = colorFor(ch);
      if (col) put(cx - ax + i, cy - ay + j, col);
    }));
    // Routes follow their waypoints; the dash pattern runs on across segments
    for (const r of overlays.routes || []) {
      const pts = r.path || [r.from, r.to];
      let step = 0;
      for (let i = 1; i < pts.length; i++) {
        let n0 = step;
        line(p.x(pts[i - 1][0]), p.y(pts[i - 1][1]), p.x(pts[i][0]), p.y(pts[i][1]), (x, y, n) => {
          if (i > 1 && n === 0) return; // don't double-plot the shared corner
          if ((n0 + n) % 4 < 2) put(x, y, COLORS.route);
          step = n0 + n + 1;
        });
      }
    }
    for (const pl of overlays.places || []) {
      sprite(DOT, p.x(pl.at[0]), p.y(pl.at[1]), 1, 1, (ch) => (ch === '#' ? COLORS.outline : ch === 'w' ? COLORS.dot : null));
    }
    const bob = t != null && Math.floor(t / 500) % 2 ? 1 : 0;
    for (const pin of overlays.pins || []) {
      sprite(PIN, p.x(pin.at[0]), p.y(pin.at[1]) - bob, 3, PIN.length - 1, (ch) => (ch === '#' ? COLORS.outline : ch === 'o' ? COLORS.pin : ch === 'w' ? COLORS.pinLight : null));
    }
    ctx.putImageData(img, 0, 0);
    return p;
  }

  function render(el, opts, env) {
    const live = env && env.live;
    const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const frame = document.createElement('div');
    frame.className = 'pm-frame';
    const canvas = document.createElement('canvas');
    canvas.className = 'pm-canvas';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Map: ' + [...(opts.pins || []), ...(opts.places || [])].map((x) => x.label).join(', '));
    const layer = document.createElement('div');
    layer.className = 'pm-labels';
    frame.append(canvas, layer);
    const foot = document.createElement('div');
    foot.className = 'pm-foot';
    const cap = document.createElement('span');
    cap.textContent = opts.caption || '';
    foot.append(cap);
    if (opts.today) {
      const a = document.createElement('a');
      a.href = opts.today.url; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = opts.today.label + ' ↗';
      foot.append(a);
    }
    const credit = document.createElement('span');
    credit.className = 'pm-credit';
    credit.textContent = 'Map data: Natural Earth. Coastlines and rivers are today’s.';
    foot.append(credit);
    el.append(frame, foot);

    const ctx = canvas.getContext('2d');
    const scratchCanvas = document.createElement('canvas');
    const scratch = scratchCanvas.getContext('2d', { willReadFrequently: true });
    let data = null, W = 0, H = 0, anim = null, lastView = null;
    const target = { center: opts.center, span: opts.span };

    function size() {
      const width = Math.max(60, Math.floor(frame.clientWidth / PX));
      if (width === W) return false;
      W = width; H = Math.round(W * ASPECT);
      canvas.width = W; canvas.height = H;
      scratchCanvas.width = W; scratchCanvas.height = H;
      canvas.style.aspectRatio = `${W} / ${H}`;
      return true;
    }
    function labels(p) {
      const pos = (at) => ({ left: (p.x(at[0]) / W) * 100, top: (p.y(at[1]) / H) * 100 });
      const items = [
        ...(opts.pins || []).map((x) => ({ at: x.at, text: x.label, cls: 'pm-pin-label', side: x.side || 'right' })),
        ...(opts.places || []).map((x) => ({ at: x.at, text: x.label, cls: 'pm-place-label', side: x.side || 'right' })),
        ...(opts.labels || []).map((x) => ({ at: x.at, text: x.text, cls: 'pm-' + (x.kind || 'place') + '-label', side: 'center' }))
      ];
      layer.replaceChildren(...items.map((it) => {
        const s = document.createElement('span');
        const { left, top } = pos(it.at);
        s.className = 'pm-label ' + it.cls + ' side-' + it.side;
        s.style.left = left + '%'; s.style.top = top + '%';
        s.textContent = it.text;
        return s;
      }));
    }
    function draw(view, t, withLabels) {
      lastView = view;
      const p = paint(ctx, scratch, data, view, W, H, opts, t);
      if (withLabels) { labels(p); layer.classList.add('on'); } else layer.classList.remove('on');
    }
    // The pin bobs gently while the map is on screen (not with reduced motion)
    function idle() {
      if (still || !frame.isConnected) return;
      let lastBob = -1;
      const tick = (t) => {
        if (!frame.isConnected || anim) return;
        const bob = Math.floor(t / 500) % 2;
        if (bob !== lastBob) { lastBob = bob; paint(ctx, scratch, data, target, W, H, opts, t); }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    function zoomIn() {
      const from = opts.from || { center: target.center, span: target.span * 3 };
      const start = performance.now(), dur = 1800;
      const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
      // Interpolate the span on a log scale so the zoom feels even
      anim = (now) => {
        const u = Math.min(1, (now - start) / dur), e = ease(u);
        const view = {
          center: [from.center[0] + (target.center[0] - from.center[0]) * e, from.center[1] + (target.center[1] - from.center[1]) * e],
          span: Math.exp(Math.log(from.span) + (Math.log(target.span) - Math.log(from.span)) * e)
        };
        draw(view, null, u >= 1);
        if (u < 1 && frame.isConnected) requestAnimationFrame(anim);
        else { anim = null; idle(); }
      };
      requestAnimationFrame(anim);
    }

    loadData().then((d) => {
      data = d;
      size();
      if (live && !still) zoomIn();
      else { draw(target, 0, true); idle(); }
      if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(() => { if (size() && !anim) draw(target, 0, true); }).observe(frame);
      }
    }).catch((e) => {
      frame.classList.add('pm-error');
      cap.textContent = `(Map unavailable: ${e.message})`;
    });
  }

  return { render, loadData };
})();
