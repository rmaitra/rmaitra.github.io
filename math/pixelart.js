// ============ Pixel art: scenes and characters ============
// DOS-era style pictures for Stories, drawn entirely in code at 288×120 and scaled
// up with image-rendering: pixelated. Gradients use ordered (Bayer) dithering, as
// VGA games did.
//
//   PixelArt.picture(el, spec, characters, { live })  a scene banner
//   PixelArt.portrait(el, characterSpec, size)        head-and-shoulders crop
//
// A picture spec (a `picture` step, or a `scene` step's `picture`) is:
//   { size: [w, h] (default 288×120; 192×80 for close-ups), sky: 'morning' | 'afternoon' | 'dusk' | 'night',
//     layers: [{ kit: 'roundCity', …params }],   drawn in order (see KIT below)
//     cast:   [{ who, x, pose: 'stand' | 'sit', face: 'left' | 'right', write }],
//     caption, sources: [{ title, url }] }
// Characters are generated from a spec (see CHARACTER below); nothing here is a
// likeness of a real person.
var PixelArt = (function () {
  const W = 288, H = 120;
  const FPS = 8;

  const hx = (s) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
  const mixRGB = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  const hash = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

  const SKIES = {
    morning: ['#3c5c8c', '#5a7cae', '#8aa4c4', '#c8c0a4', '#e6cc96'],
    afternoon: ['#35558a', '#5078b0', '#86a2c2', '#d4bc8a', '#e8b872'],
    dusk: ['#1b1030', '#3b1d4a', '#7a3350', '#c8643a', '#e8a24a'],
    night: ['#060a1a', '#0c1430', '#141e40', '#1c2848', '#243054'],
    noon: ['#1c4686', '#2a5ea4', '#4a80c0', '#7aa8d6', '#b4d0e6']
  };
  const P = {
    outline: hx('#120c10'),
    brick: hx('#9a7450'), brickLit: hx('#b88c5e'), brickShade: hx('#6a4e36'), brickDark: hx('#3e2c20'),
    roof: hx('#7e6044'), roofShade: hx('#5a4230'),
    dome: hx('#3f8a5e'), domeLit: hx('#6ab484'), domeShade: hx('#285a3e'),
    window: hx('#1a1210'),
    palmTrunk: hx('#4a3422'), palmTrunkDark: hx('#2e2016'), frond: hx('#2f5a34'), frondLit: hx('#4c7e44'), frondDark: hx('#1c3a22'),
    water: hx('#2c4a6c'), waterDark: hx('#1c3048'), shimmer: hx('#c8d8e0'),
    hull: hx('#5a3a22'), hullDark: hx('#34220f'), sail: hx('#dcccaa'), sailShade: hx('#b0a080'), mast: hx('#3a2616'),
    reed: hx('#3e5a2a'), reedDark: hx('#23361a'), mud: hx('#3a3020'),
    wall: hx('#5a4640'), wallLit: hx('#6e5850'), mortar: hx('#3a2c28'), wallDark: hx('#2a201e'),
    floor: hx('#4a3830'), floorDark: hx('#34282a'), floorLine: hx('#2a1e1c'),
    wood: hx('#5a3a22'), woodLit: hx('#7a5232'), woodDark: hx('#34220f'),
    paper: hx('#e8dcc0'), paperShade: hx('#b8aa88'),
    books: ['#7a3a2a', '#3a4a6a', '#5a5a2a', '#6a2a3a', '#4a3a2a', '#2a4a3a'].map(hx),
    rug: hx('#7a2a2a'), rugDark: hx('#521c1c'), rugGold: hx('#c8943a'), rugBlue: hx('#2a3a6a'),
    brass: hx('#b08a3a'), brassDark: hx('#6a5020'),
    flame: hx('#ffd27a'), flameCore: hx('#fff4d6'), flameOuter: hx('#ff9a3a'),
    glow: hx('#ffc070'), beam: hx('#f4e0b0'),
    star: hx('#e8dcc4'), bird: hx('#2a2030'),
    sea: hx('#23557a'), seaDark: hx('#153650'), crest: hx('#e4eef0'),
    stone: hx('#dccfb2'), stoneShade: hx('#b0a284'), stoneDark: hx('#7e7058'), stoneLine: hx('#9a8c70'),
    rock: hx('#5e5244'), rockDark: hx('#3a322a'),
    tile: hx('#9a4a32'), tileShade: hx('#6e3222'),
    sand: hx('#d4b47a'), sandShade: hx('#b8965c'), sandLight: hx('#e6cc96'),
    soil: hx('#8a6a44'), soilDark: hx('#5e4630'), soilDeep: hx('#3e2e20'),
    sun: hx('#fff6d8'), sunHalo: hx('#ffe9a8'),
    portico: hx('#3e3428'), porticoDark: hx('#2a2219'),
    clay: hx('#b0643a'), clayShade: hx('#7e4426'),
    bronze: hx('#8a6a3a'), bronzeDark: hx('#4e3a1e'),
    shadow: hx('#1a140e')
  };

  // ---------- frame buffer ----------
  function Buf(w, h) {
    this.w = w; this.h = h;
    this.d = new Uint8ClampedArray(w * h * 4);
  }
  Buf.prototype.set = function (x, y, c) {
    x = Math.round(x); y = Math.round(y);
    if (!c || x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const o = (y * this.w + x) * 4;
    this.d[o] = c[0]; this.d[o + 1] = c[1]; this.d[o + 2] = c[2]; this.d[o + 3] = 255;
  };
  Buf.prototype.get = function (x, y) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
    const o = (y * this.w + x) * 4;
    return this.d[o + 3] ? [this.d[o], this.d[o + 1], this.d[o + 2]] : null;
  };
  Buf.prototype.rect = function (x, y, w, h, c) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, c);
  };
  // Ordered dither: choose b over a where t (0..1) beats the Bayer threshold
  Buf.prototype.dither = function (x, y, a, b, t) {
    this.set(x, y, t * 16 > BAYER[y & 3][x & 3] + 0.5 ? b : a);
  };
  // Blend what's there toward c by `amt`, dithered so it stays chunky
  Buf.prototype.tint = function (x, y, c, amt, strength) {
    if (amt * 16 <= BAYER[y & 3][x & 3] + 0.5) return;
    const cur = this.get(x, y);
    if (cur) this.set(x, y, mixRGB(cur, c, strength));
  };
  // Vertical gradient through the colour stops, dithered between neighbours
  Buf.prototype.vgrad = function (x0, y0, w, h, stops) {
    const cols = stops.map((s) => (typeof s === 'string' ? hx(s) : s));
    for (let y = y0; y < y0 + h; y++) {
      const u = ((y - y0) / Math.max(1, h - 1)) * (cols.length - 1);
      const k = Math.min(cols.length - 2, Math.floor(u));
      for (let x = x0; x < x0 + w; x++) this.dither(x, y, cols[k], cols[k + 1], u - k);
    }
  };
  Buf.prototype.ellipse = function (cx, cy, rx, ry, c, half) {
    for (let y = -ry; y <= (half ? 0 : ry); y++) {
      const span = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
      for (let x = -span; x <= span; x++) this.set(cx + x, cy + y, c);
    }
  };
  // Blit a sprite: rows of characters, legend maps a character to a colour
  Buf.prototype.sprite = function (rows, legend, x, y, flip) {
    const w = rows[0].length;
    rows.forEach((row, j) => [...row].forEach((ch, i) => {
      const c = legend[ch];
      if (c) this.set(x + (flip ? w - 1 - i : i), y + j, c);
    }));
  };
  // Blit another buffer (a character), mirrored if flip, with (ax, ay) as its anchor
  Buf.prototype.blit = function (src, x, y, flip) {
    for (let j = 0; j < src.h; j++) for (let i = 0; i < src.w; i++) {
      const c = src.get(i, j);
      if (c) this.set(x + (flip ? src.w - 1 - i : i), y + j, c);
    }
  };

  // ---------- sprites ----------
  const SAIL_BOAT = [
    '.........s..........',
    '........ss..........',
    '.......sSs..........',
    '......sSsm..........',
    '.....sSssm..........',
    '....sSsssm..........',
    '...sSssssm..........',
    '..sSsssssm..........',
    '.sSssssssm..........',
    'sssssssssm..........',
    '.........m..........',
    'hhhhhhhhhhhhhhhhhh..',
    '.HhhhhhhhhhhhhhhhH..',
    '..HHHHHHHHHHHHHHH...'
  ];
  const KUPHAR = [
    '.....p......',
    '....fp......',
    '....Fp......',
    '....Fp......',
    '.rrrrrrrr...',
    'kkkkkkkkkk..',
    '.KkkkkkkK...',
    '..KKKKKK....'
  ];
  const HORSEMAN = [
    '..l.',
    '..l.',
    '.hl.',
    'hhh.',
    'hhhh',
    'h..h'
  ];
  const PALM_CROWN = [
    '..aa.....aa...',
    '.abba...abba..',
    'ab..bbcbb..ba.',
    'a...abccba...a',
    '...ab.cc.ba...',
    '..ab..cc..ba..',
    '.a....cc....a.'
  ];
  const BIRD = [['a.a', '.a.'], ['...', 'aaa']];
  // Greek merchant ship: square striped sail, curved stern post, steering oar
  const MERCHANT = [
    '..........m..........',
    '...ssssssssssssss....',
    '...sSsSsSsSsSsSss....',
    '...ssssssssssssss....',
    '...sSsSsSsSsSsSss....',
    '...ssssssssssssss....',
    '...sSsSsSsSsSsSss....',
    '..........m..........',
    '..........m........hh',
    'h.........m........h.',
    'hhhhhhhhhhhhhhhhhhhh.',
    '.HhhhhhhhhhhhhhhhhH..',
    '..HHHHHHHHHHHHHHHH...',
    '..................o..',
    '.................o...'
  ];
  const AMPHORA = [
    '.aa.',
    'a..a',
    '.cc.',
    'cccc',
    'cCcc',
    'cCcc',
    '.cc.',
    '.cc.',
    '..c.'
  ];

  // x position of something drifting across the picture (either direction), wrapping at the edges
  function drift(p, ctx, margin, w) {
    if (!p.drift) return p.x;
    const span = w + margin;
    return ((((p.x + margin / 2 + ctx.t * p.drift) % span) + span) % span) - margin / 2;
  }

  // ---------- the kit ----------
  // Each part draws into the buffer (b.w × b.h): part(b, params, ctx) where ctx = { t, frame, sky }
  const KIT = {
    sky(b, p, ctx) {
      b.vgrad(0, 0, b.w, p.h || b.h, SKIES[ctx.sky] || SKIES.morning);
    },
    stars(b, p, ctx) {
      for (let i = 0; i < 40; i++) {
        const x = Math.floor(hash(i, 1) * b.w), y = Math.floor(hash(i, 2) * (p.h || 50));
        const on = (ctx.frame + i * 3) % 23 !== 0;
        if (on) b.set(x, y, hash(i, 3) > 0.7 ? P.star : mixRGB(P.star, [20, 24, 60], 0.5));
      }
    },
    birds(b, p, ctx) {
      (p.flock || [[60, 20], [70, 16], [78, 22]]).forEach(([x0, y0], i) => {
        const x = (x0 + ctx.t * 6) % (b.w + 20) - 10;
        b.sprite(BIRD[(ctx.frame + i) % 2], { a: P.bird }, x, y0 + Math.round(Math.sin(ctx.t + i) * 1));
      });
    },
    // The Round City seen across the river: brick wall and towers, a gate, rooftops,
    // and the palace's Green Dome with its horseman statue at the centre.
    roundCity(b, p) {
      const { x0 = 60, x1 = 250, base = 78 } = p;
      const cx = p.domeX || Math.round((x0 + x1) / 2);
      // rooftops behind the wall
      for (let x = x0 + 4; x < x1 - 4; x += 6) {
        const hgt = 4 + Math.floor(hash(x, 7) * 7);
        const top = base - 12 - hgt;
        b.rect(x, top, 6, hgt, hash(x, 8) > 0.5 ? P.roof : P.roofShade);
        b.rect(x, top, 6, 1, P.brickLit);
        if (hash(x, 9) > 0.6) b.set(x + 2, top + 2, P.window);
      }
      // the Green Dome: drum, dome, finial and the horseman
      const dy = base - 46;
      b.rect(cx - 9, dy + 12, 19, 16, P.brickShade);
      b.rect(cx - 9, dy + 12, 19, 1, P.brickLit);
      for (let i = 0; i < 4; i++) b.rect(cx - 7 + i * 5, dy + 16, 2, 4, P.window);
      b.ellipse(cx, dy + 12, 12, 12, P.domeShade, true);
      b.ellipse(cx - 1, dy + 11, 10, 10, P.dome, true);
      b.ellipse(cx - 4, dy + 6, 3, 3, P.domeLit, true);
      b.rect(cx, dy - 3, 1, 3, P.brass);
      b.sprite(HORSEMAN, { h: P.brassDark, l: P.brass }, cx - 2, dy - 9);
      // outer wall with towers and crenellations
      const wallTop = base - 12;
      b.rect(x0, wallTop, x1 - x0, 12, P.brick);
      for (let x = x0; x < x1; x++) {
        if ((x - x0) % 4 < 2) b.set(x, wallTop - 1, P.brick);
        if (hash(x, 11) > 0.85) b.set(x, wallTop + 3 + Math.floor(hash(x, 12) * 7), P.brickShade);
      }
      b.rect(x0, base - 2, x1 - x0, 2, P.brickShade);
      for (let x = x0; x <= x1 - 5; x += 16) {
        b.rect(x, wallTop - 4, 5, 16, P.brickLit);
        b.rect(x + 4, wallTop - 4, 1, 16, P.brickShade);
        b.set(x + 1, wallTop - 5, P.brickLit); b.set(x + 3, wallTop - 5, P.brickLit);
      }
      // the gate: two taller towers and a dark arch
      const gx = cx - 8;
      b.rect(gx - 5, wallTop - 8, 6, 20, P.brickLit);
      b.rect(gx + 16, wallTop - 8, 6, 20, P.brickLit);
      b.rect(gx + 21, wallTop - 8, 1, 20, P.brickShade);
      b.rect(gx + 3, wallTop + 3, 10, 9, P.brickDark);
      b.ellipse(gx + 8, wallTop + 3, 5, 3, P.brickDark, true);
    },
    palm(b, p, ctx) {
      const { x, base, h = 26, lean = 0 } = p;
      for (let j = 0; j < h; j++) {
        const u = j / h;
        const tx = x + Math.round(lean * u * u * 6);
        const c = j % 3 === 0 ? P.palmTrunkDark : P.palmTrunk;
        b.set(tx, base - j, c); b.set(tx + 1, base - j, P.palmTrunkDark);
      }
      const topX = x + Math.round(lean * 6);
      const sway = ctx.frame % 16 < 8 ? 0 : 1;
      b.sprite(PALM_CROWN, { a: P.frondDark, b: P.frond, c: P.frondLit }, topX - 6 + sway, base - h - 3);
    },
    // River: reflects everything above its surface, with a gentle ripple
    river(b, p, ctx) {
      const y0 = p.y, y1 = p.y1 || b.h;
      for (let y = y0; y < y1; y++) {
        const depth = (y - y0) / (y1 - y0);
        for (let x = 0; x < b.w; x++) {
          const off = Math.round(Math.sin(y * 0.9 + ctx.t * 2.2) * (1 + depth * 1.5));
          const src = b.get(x + off, 2 * y0 - y - 1);
          const base = p.tone === 'sea' ? mixRGB(P.sea, P.seaDark, depth) : mixRGB(P.water, P.waterDark, depth);
          const refl = src ? mixRGB(src, base, 0.55) : base;
          b.dither(x, y, base, refl, 0.75 - depth * 0.5);
        }
      }
      // moving highlights
      for (let i = 0; i < 26; i++) {
        const y = y0 + 2 + Math.floor(hash(i, 21) * (y1 - y0 - 3));
        const x = Math.floor((hash(i, 22) * b.w + ctx.t * (4 + hash(i, 23) * 6)) % b.w);
        const len = 2 + Math.floor(hash(i, 24) * 4);
        if ((ctx.frame + i) % 5) for (let k = 0; k < len; k++) b.set(x + k, y, mixRGB(P.shimmer, p.tone === 'sea' ? P.sea : P.water, 0.4));
      }
      // small white wave crests on open sea
      if (p.tone === 'sea') for (let i = 0; i < 14; i++) {
        const y = y0 + 4 + Math.floor(hash(i, 51) * (y1 - y0 - 5));
        const x = Math.floor((hash(i, 52) * b.w - ctx.t * 3) % b.w + b.w) % b.w;
        if ((ctx.frame + i * 2) % 7 < 4) { b.set(x, y, P.crest); b.set(x + 1, y - 1, P.crest); b.set(x + 2, y, P.crest); }
      }
    },
    sailboat(b, p, ctx) {
      const x = drift(p, ctx, 40, b.w);
      const bob = ctx.frame % 8 < 4 ? 0 : 1;
      b.sprite(SAIL_BOAT, { s: P.sail, S: P.sailShade, m: P.mast, h: P.hull, H: P.hullDark }, x, p.y - 13 + bob, p.flip);
    },
    kuphar(b, p, ctx) {
      const x = drift(p, ctx, 30, b.w);
      const bob = ctx.frame % 6 < 3 ? 0 : 1;
      b.sprite(KUPHAR, { p: P.mast, f: hx('#b98260'), F: hx('#d8d0c0'), r: P.woodLit, k: P.wood, K: P.woodDark }, x, p.y - 7 + bob);
    },
    reeds(b, p, ctx) {
      const y = p.y;
      b.rect(0, y + 4, b.w, b.h - y - 4, P.mud);
      for (let x = 0; x < b.w; x += 2) {
        if (hash(x, 31) < 0.35) continue;
        const hgt = 4 + Math.floor(hash(x, 32) * 9);
        const sway = (ctx.frame + x) % 12 < 6 ? 0 : 1;
        for (let j = 0; j < hgt; j++) b.set(x + (j > hgt - 3 ? sway : 0), y + 6 - j, j % 4 === 0 ? P.reedDark : P.reed);
      }
    },
    // ----- interiors -----
    // Baked-brick wall, darker toward the edges
    wall(b, p) {
      const y1 = p.y1 || 96;
      for (let y = 0; y < y1; y++) for (let x = 0; x < b.w; x++) {
        const row = Math.floor(y / 4), off = row % 2 ? 5 : 0;
        const mortar = y % 4 === 3 || (x + off) % 10 === 9;
        let c = mortar ? P.mortar : hash(Math.floor((x + off) / 10), row) > 0.8 ? P.wallLit : P.wall;
        const edge = Math.min(x, b.w - 1 - x) / 30;
        b.dither(x, y, P.wallDark, c, Math.min(1, 0.35 + edge));
      }
    },
    // Pointed-arch window showing the sky, the far skyline and the Green Dome
    window(b, p, ctx) {
      const { x, y, w, h } = p;
      const inside = (i, j) => {
        const r = w / 2, cx = x + r;
        if (j >= y + r * 0.9) return i >= x && i < x + w;
        // pointed arch: two circle arcs meeting at the top
        const dl = Math.hypot(i - (x + w * 0.9), j - (y + r * 0.9)), dr = Math.hypot(i - (x + w * 0.1), j - (y + r * 0.9));
        return i >= x && i < x + w && dl <= w * 0.9 && dr <= w * 0.9 && j >= y - r * 0.2 && Math.abs(i - cx) <= r;
      };
      const sky = SKIES[ctx.sky] || SKIES.morning;
      for (let j = y - 10; j < y + h; j++) for (let i = x; i < x + w; i++) {
        if (!inside(i, j)) continue;
        const u = Math.max(0, Math.min(1, (j - (y - 10)) / (h + 10))) * (sky.length - 1), k = Math.min(sky.length - 2, Math.floor(u));
        b.dither(i, j, hx(sky[k]), hx(sky[k + 1]), u - k);
      }
      // distant skyline and dome through the window
      const hz = y + h - 8;
      for (let i = x; i < x + w; i++) {
        const hgt = 2 + Math.floor(hash(i >> 2, 41) * 5);
        for (let j = hz - hgt; j < y + h; j++) if (inside(i, j)) b.set(i, j, P.roofShade);
      }
      const dcx = x + Math.round(w * 0.62);
      b.ellipse(dcx, hz - 5, 5, 5, P.domeShade, true);
      b.ellipse(dcx - 1, hz - 5, 4, 4, P.dome, true);
      b.rect(dcx - 5, hz - 5, 11, 4, P.roofShade);
      // frame and sill
      for (let j = y - 12; j < y + h + 2; j++) for (let i = x - 2; i < x + w + 2; i++) {
        if (inside(i, j)) continue;
        if (inside(i - 2, j) || inside(i + 2, j) || inside(i, j + 2) || inside(i, j - 2)) b.set(i, j, P.brickLit);
      }
      b.rect(x - 3, y + h, w + 6, 2, P.brickLit);
      b.rect(x - 3, y + h + 2, w + 6, 1, P.brickShade);
    },
    // A sunbeam from the window falling across the floor
    beam(b, p) {
      const { x, y, w, y1 = b.h, slope = -0.8, strength = 0.18 } = p;
      for (let j = y; j < y1; j++) {
        const sx = x + (j - y) * slope;
        for (let i = Math.round(sx); i < sx + w; i++) b.tint(i, j, P.beam, 0.55, strength);
      }
    },
    floor(b, p) {
      const y = p.y;
      b.vgrad(0, y, b.w, b.h - y, [P.floorDark, P.floor, P.floor]);
      for (let x = 0; x < b.w; x += 16) for (let j = y; j < b.h; j++) b.set(x + Math.round((x - b.w / 2) * (j - y) / 60), j, P.floorLine);
      [y, y + 5, y + 12, y + 21].forEach((j) => { if (j < b.h) b.rect(0, j, b.w, 1, P.floorLine); });
    },
    // Wooden shelves with codices lying in flat stacks
    shelves(b, p) {
      const { x, y, w, h, rows = 4 } = p;
      b.rect(x, y, w, h, P.woodDark);
      b.rect(x, y, 2, h, P.wood); b.rect(x + w - 2, y, 2, h, P.wood);
      const gap = Math.floor(h / rows);
      for (let r = 0; r < rows; r++) {
        const sy = y + (r + 1) * gap - 2;
        b.rect(x, sy, w, 2, P.woodLit);
        let bx = x + 3;
        while (bx < x + w - 10) {
          const bw = 6 + Math.floor(hash(bx, r) * 4);
          const n = 1 + Math.floor(hash(bx, r + 9) * Math.min(4, (gap - 4) / 2));
          for (let k = 0; k < n; k++) {
            const c = P.books[Math.floor(hash(bx + k, r * 7) * P.books.length)];
            const by = sy - 2 - k * 2;
            b.rect(bx + (k % 2), by, bw, 2, c);
            b.rect(bx + (k % 2), by, 1, 2, P.paperShade);
          }
          bx += bw + 1 + Math.floor(hash(bx, r + 3) * 2);
        }
      }
    },
    rug(b, p) {
      const { x, y, w, h } = p;
      b.rect(x, y, w, h, P.rug);
      for (let i = x; i < x + w; i++) { b.set(i, y, P.rugGold); b.set(i, y + h - 1, P.rugGold); if (i % 4 === 0) { b.set(i, y + 2, P.rugBlue); b.set(i, y + h - 3, P.rugBlue); } }
      for (let j = y; j < y + h; j++) { b.set(x, j, P.rugGold); b.set(x + w - 1, j, P.rugGold); }
      for (let i = x + 6; i < x + w - 6; i += 8) { b.set(i, y + Math.floor(h / 2), P.rugGold); b.set(i + 1, y + Math.floor(h / 2), P.rugDark); }
    },
    // Oil lamp on a brass stand; when lit, it flickers and casts a warm glow
    lamp(b, p, ctx) {
      const { x, base, lit } = p;
      b.rect(x - 3, base, 7, 1, P.brassDark);
      b.rect(x, base - 22, 1, 22, P.brass);
      b.rect(x - 3, base - 23, 7, 2, P.brass);
      b.rect(x - 2, base - 21, 5, 1, P.brassDark);
      if (!lit) return;
      const f = ctx.frame % 3;
      const flame = [['.o.', 'oyo', 'yWy'], ['..o', '.oy', 'yWy'], ['o..', 'oy.', 'yWy']][f];
      b.sprite(flame, { o: P.flameOuter, y: P.flame, W: P.flameCore }, x - 1, base - 26);
    },
    // Warm dithered light around a point (drawn after the cast so it lights them too)
    glow(b, p, ctx) {
      const { x, y, r = 50, strength = 0.28 } = p;
      const flicker = 1 + Math.sin(ctx.t * 9) * 0.04;
      for (let j = Math.max(0, y - r); j < Math.min(b.h, y + r); j++) for (let i = Math.max(0, x - r); i < Math.min(b.w, x + r); i++) {
        const d = Math.hypot(i - x, (j - y) * 1.2) / (r * flicker);
        if (d < 1) b.tint(i, j, P.glow, Math.sqrt(1 - d), strength);
      }
    },
    inkpot(b, p) {
      b.rect(p.x, p.base - 3, 4, 3, hx('#1a1a22'));
      b.rect(p.x + 1, p.base - 4, 2, 1, hx('#2a2a34'));
      b.set(p.x + 2, p.base - 6, P.paper); b.set(p.x + 3, p.base - 7, P.paper);
    },
    // ----- sun, sea and harbour -----
    sun(b, p) {
      const { x, y, r = 5 } = p;
      for (let j = -r * 3; j <= r * 3; j++) for (let i = -r * 3; i <= r * 3; i++) {
        const d = Math.hypot(i, j);
        if (d <= r) b.set(x + i, y + j, P.sun);
        else if (d < r * 3) b.tint(x + i, y + j, P.sunHalo, 1 - (d - r) / (r * 2), 0.45);
      }
    },
    // The Lighthouse of Alexandria on its island: square, octagonal and round tiers
    // of light stone with a fire at the top
    pharos(b, p, ctx) {
      const { x, base } = p;
      b.ellipse(x, base, 26, 5, P.rockDark, true);
      b.ellipse(x - 2, base - 1, 22, 4, P.rock, true);
      const tier = (w, h, y1, oct) => {
        const y0 = y1 - h;
        b.rect(x - w, y0, 2 * w + 1, h, P.stone);
        b.rect(x + w - 2, y0, 3, h, P.stoneShade);
        if (oct) { b.rect(x - w, y0, 1, h, P.stoneShade); b.rect(x + w - 4, y0, 1, h, P.stoneLine); }
        b.rect(x - w - 1, y0, 2 * w + 3, 1, P.stoneShade);
        for (let j = y0 + 3; j < y1 - 2; j += 5) for (let i = x - w + 3; i < x + w - 2; i += 4) b.rect(i, j, 1, 2, P.stoneDark);
        return y0;
      };
      let y = base - 3;
      y = tier(10, 30, y, false);
      y = tier(7, 17, y, true);
      y = tier(4, 10, y, false);
      b.rect(x - 5, y - 1, 11, 1, P.stoneShade);
      const f = ctx.frame % 3;
      const flame = [['..o..', '.oyo.', 'oyWyo'], ['...o.', '.oyo.', 'oyWyo'], ['.o...', '.oyo.', 'oyWyo']][f];
      b.sprite(flame, { o: P.flameOuter, y: P.flame, W: P.flameCore }, x - 2, y - 4);
      for (let j = -8; j <= 8; j++) for (let i = -8; i <= 8; i++) { const d = Math.hypot(i, j) / 8; if (d < 1) b.tint(x + i, y - 2 + j, P.glow, 1 - d, 0.25); }
    },
    // Limestone town buildings along the shore, flat roofs, a few tiled
    houses(b, p) {
      const { x0, x1, base } = p;
      for (let x = x0; x < x1; x += 7) {
        const hgt = 8 + Math.floor(hash(x, 61) * 14);
        const top = base - hgt;
        b.rect(x, top, 7, hgt, hash(x, 62) > 0.5 ? P.stone : P.stoneShade);
        b.rect(x + 6, top, 1, hgt, P.stoneLine);
        if (hash(x, 63) > 0.6) { b.rect(x - 1, top - 2, 9, 2, P.tile); b.rect(x - 1, top - 1, 9, 1, P.tileShade); }
        for (let j = top + 3; j < base - 2; j += 5) if (hash(x, j) > 0.4) b.rect(x + 2, j, 2, 2, P.stoneDark);
      }
    },
    // A Greek temple front: steps, columns, entablature and pediment
    temple(b, p) {
      const { x, base, w = 40, cols = 6 } = p;
      const colH = Math.round(w * 0.45);
      b.rect(x - 2, base - 3, w + 4, 3, P.stoneShade);
      b.rect(x, base - 5, w, 2, P.stone);
      const gap = (w - 4) / (cols - 1);
      b.rect(x + 1, base - 5 - colH, w - 2, colH, P.portico);
      for (let c = 0; c < cols; c++) {
        const cx = Math.round(x + 1 + c * gap);
        b.rect(cx, base - 5 - colH, 3, colH, P.stone);
        b.rect(cx + 2, base - 5 - colH, 1, colH, P.stoneShade);
      }
      const eTop = base - 5 - colH - 4;
      b.rect(x - 1, eTop, w + 2, 4, P.stone);
      b.rect(x - 1, eTop + 3, w + 2, 1, P.stoneShade);
      const ph = Math.round(w / 6);
      for (let j = 0; j < ph; j++) { const half = Math.round((w / 2 + 1) * (j + 1) / ph); b.rect(x + w / 2 - half, eTop - ph + j, 2 * half, 1, j === ph - 1 ? P.stoneShade : P.stone); }
    },
    ship(b, p, ctx) {
      const x = drift(p, ctx, 40, b.w);
      const bob = ctx.frame % 8 < 4 ? 0 : 1;
      b.sprite(MERCHANT, { s: P.sail, S: P.tile, m: P.mast, h: P.hull, H: P.hullDark, o: P.woodDark }, x, p.y - 12 + bob, p.flip);
    },
    // Stone quay along the bottom, with amphorae waiting to be loaded
    quay(b, p) {
      const y = p.y;
      for (let j = y; j < b.h; j++) for (let i = 0; i < b.w; i++) {
        const row = Math.floor((j - y) / 5), off = row % 2 ? 6 : 0;
        const line = (j - y) % 5 === 4 || (i + off) % 12 === 11;
        b.set(i, j, line ? P.stoneLine : hash(Math.floor((i + off) / 12), row) > 0.7 ? P.stoneShade : P.stone);
      }
      b.rect(0, y, b.w, 1, P.stoneShade);
      for (const ax of p.amphorae || []) b.sprite(AMPHORA, { a: P.clayShade, c: P.clay, C: P.clayShade }, ax, y - 9);
    },
    // ----- courtyard and desert -----
    // A colonnade (stoa) across the back of a courtyard: roof, architrave, columns, shaded walkway
    colonnade(b, p) {
      const { top, base, gap = 22, x0 = 0, x1 = b.w } = p;
      b.rect(x0, top, x1 - x0, 3, P.tile);
      b.rect(x0, top + 3, x1 - x0, 1, P.tileShade);
      b.rect(x0, top + 4, x1 - x0, 5, P.stone);
      b.rect(x0, top + 8, x1 - x0, 1, P.stoneShade);
      b.rect(x0, top + 9, x1 - x0, base - top - 9, P.portico);
      for (let i = x0 + 8; i < x1 - 6; i += 30) b.rect(i, base - 16, 8, 16, P.porticoDark);
      for (let x = x0 + 4; x < x1 - 2; x += gap) {
        b.rect(x - 1, top + 9, 7, 2, P.stone);
        b.rect(x, top + 11, 5, base - top - 13, P.stone);
        b.rect(x + 3, top + 11, 2, base - top - 13, P.stoneShade);
        b.rect(x + 1, top + 11, 1, base - top - 13, P.stoneLine);
        b.rect(x - 1, base - 2, 7, 2, P.stoneShade);
      }
      b.rect(x0, base, x1 - x0, 1, P.stoneShade);
    },
    paving(b, p) {
      const y = p.y;
      for (let j = y; j < b.h; j++) for (let i = 0; i < b.w; i++) {
        const row = Math.floor((j - y) / 6), off = row % 2 ? 8 : 0;
        const line = (j - y) % 6 === 5 || (i + off) % 16 === 15;
        b.set(i, j, line ? P.stoneLine : hash(Math.floor((i + off) / 16), row + 90) > 0.75 ? P.stoneShade : P.stone);
      }
    },
    // A skaphe: a stone bowl sundial on a pedestal, with a pointer (gnomon) at the
    // bottom of the bowl and the noon shadow it casts
    skaphe(b, p) {
      const { x, base, shadow = 3 } = p;
      // pedestal
      b.rect(x - 5, base - 13, 11, 13, P.stoneDark);
      b.rect(x - 4, base - 13, 8, 13, P.stoneShade);
      b.rect(x - 3, base - 13, 3, 13, P.stone);
      b.rect(x - 7, base - 1, 15, 1, P.shadow);
      // bowl: outside, then the dark hollow seen over the rim
      const rimY = base - 22;
      for (let j = 0; j <= 9; j++) {
        const half = Math.round(12 * Math.sqrt(1 - (j * j) / 100));
        b.rect(x - half, rimY + j, 2 * half + 1, 1, j < 2 ? P.stone : j < 6 ? P.stoneShade : P.stoneDark);
      }
      for (let j = 0; j <= 3; j++) {
        const half = Math.round(11 * Math.sqrt(1 - (j * j) / 16));
        b.rect(x - half, rimY - 3 + j, 2 * half + 1, 1, j === 0 ? P.stoneLine : P.portico);
      }
      b.rect(x - 12, rimY, 25, 1, P.stone);
      for (let i = -9; i <= 9; i += 3) b.set(x + i, rimY - 1, P.stoneLine); // hour lines
      // bronze pointer and its shadow across the hollow
      b.rect(x, rimY - 7, 1, 6, P.bronze);
      b.set(x, rimY - 8, P.flame);
      for (let k = 1; k <= shadow; k++) { b.set(x - k, rimY - 1, P.shadow); b.set(x - k, rimY - 2, P.shadow); }
    },
    sand(b, p) {
      const { y, y1 = b.h } = p;
      for (let j = y; j < y1; j++) for (let i = 0; i < b.w; i++) {
        const v = hash(i, j + 300);
        b.set(i, j, v > 0.93 ? P.sandShade : v < 0.06 ? P.sandLight : P.sand);
      }
      b.rect(0, y, b.w, 1, P.sandLight);
    },
    // Cut-away of the ground, to show what's below the surface
    strata(b, p) {
      const { y, y1 = b.h } = p;
      for (let j = y; j < y1; j++) {
        const u = (j - y) / (y1 - y);
        for (let i = 0; i < b.w; i++) b.dither(i, j, u < 0.5 ? P.soil : P.soilDark, u < 0.5 ? P.soilDark : P.soilDeep, (u % 0.5) * 2);
      }
      for (let i = 0; i < b.w; i += 3) if (hash(i, 71) > 0.6) b.set(i, y + 2 + Math.floor(hash(i, 72) * (y1 - y - 4)), P.rock);
      b.rect(0, y, b.w, 1, P.sandShade);
    },
    // A well, shown cut away: sunlight straight overhead lights it down to the water
    well(b, p, ctx) {
      const { x, ground, depth = 22, w = 10, lit = true } = p;
      const bottom = ground + depth;
      for (let j = ground - 4; j < ground; j++) for (let i = x - w / 2 - 2; i <= x + w / 2 + 2; i++) b.set(i, j, (i + j) % 4 === 0 ? P.stoneLine : P.stoneShade);
      b.rect(x - w / 2 - 2, ground - 5, w + 5, 1, P.stone);
      for (let j = ground; j < bottom; j++) {
        b.set(x - w / 2 - 1, j, P.stoneDark); b.set(x + w / 2 + 1, j, P.stoneDark);
        for (let i = x - w / 2; i <= x + w / 2; i++) b.set(i, j, lit ? mixRGB(P.sunHalo, P.soil, (j - ground) / depth * 0.35) : P.soilDeep);
      }
      for (let i = x - w / 2; i <= x + w / 2; i++) {
        b.set(i, bottom, (i + ctx.frame) % 3 ? hx('#bfe0ff') : P.sun);
        b.set(i, bottom + 1, hx('#6a9ac8'));
      }
    },
    // An upright stick; `shadow` is its shadow's length along the ground (0 = none)
    gnomon(b, p) {
      const { x, base, h = 12, shadow = 0 } = p;
      b.rect(x - 1, base - 1, 3, 1, P.stoneDark);
      b.rect(x, base - h, 1, h, P.woodDark);
      for (let k = 1; k <= shadow; k++) b.set(x + k, base - 1, P.shadow);
    }
  };

  // ---------- characters ----------
  // A character spec: { skin, hair, hairStyle: 'curly', beard: 'none'|'short'|'full'|'long', beardColor,
  //   headwear: 'turban'|'cap'|'none', headwearColor, dress: 'robe'|'chiton', robe, outer,
  //   drape: 'himation', sash, prop: 'book'|'scroll'|'none', seed }
  const SKIN = { light: ['#d8a882', '#a87a5a'], medium: ['#b98260', '#8a5a3e'], deep: ['#8a5a3a', '#5e3a24'] };
  const HAIR = { black: '#1a1412', brown: '#3a2618', grey: '#8a8480', salt: '#5e5856', white: '#d0ccc4' };
  const CLOTH = {
    black: ['#2a2632', '#18161e', '#3e3848'], white: ['#d8d0c0', '#a89e8c', '#f0ead8'],
    undyed: ['#b8a684', '#8a7a5c', '#d4c4a0'], indigo: ['#34467a', '#222e52', '#4a5e9a'],
    madder: ['#7e2e2a', '#541e1c', '#9e443c'], saffron: ['#c89a3a', '#94701f', '#e0b85a'],
    green: ['#33603e', '#20402a', '#4a7e54'], brown: ['#5e3e24', '#3c2816', '#7e5634'], cream: ['#e0d4b4', '#b4a684', '#f4ecd4']
  };
  const cl = (name, fallback) => (CLOTH[name] || CLOTH[fallback] || CLOTH.undyed).map(hx);

  function drawHead(g, spec, ox, oy, blink) {
    const [skin, skinShade] = (SKIN[spec.skin] || SKIN.medium).map(hx);
    const hair = hx(HAIR[spec.hair] || HAIR.black);
    const beardC = hx(HAIR[spec.beardColor || spec.hair] || HAIR.black);
    const set = (x, y, c) => g.set(x + ox, y + oy, c);
    // face and skull
    for (let y = 5; y <= 11; y++) for (let x = 6; x <= 10; x++) set(x, y, skin);
    for (let x = 7; x <= 9; x++) set(x, 4, skin);
    set(11, 8, skin); set(11, 9, skinShade); // nose
    set(7, 8, skinShade); // ear
    set(10, 10, skinShade); // mouth
    for (let y = 5; y <= 9; y++) { set(5, y, hair); set(6, y, hair); }
    set(9, 7, blink ? skin : hx('#1a1210'));
    set(9, 6, hair); set(10, 6, hair);
    // beard
    const b = spec.beard || 'none';
    if (b === 'short') { for (let x = 7; x <= 10; x++) set(x, 11, beardC); set(8, 12, beardC); set(9, 12, beardC); set(10, 10, beardC); }
    if (b === 'full' || b === 'long') {
      for (let y = 9; y <= 12; y++) for (let x = 7; x <= 10; x++) set(x, y, beardC);
      set(11, 10, beardC); set(10, 9, beardC); set(11, 9, skinShade);
      set(10, 10, hx('#2a1a14'));
      if (b === 'long') { for (let y = 13; y <= 15; y++) for (let x = 8; x <= 10 - (y - 13 > 1 ? 1 : 0); x++) set(x, y, beardC); }
    }
    // headwear
    const hw = spec.headwear || 'none';
    const [hc, hcShade, hcLit] = cl(spec.headwearColor || 'white');
    if (hw === 'turban') {
      const rows = [[7, 9], [6, 10], [5, 11], [5, 11], [5, 11]];
      rows.forEach(([a, z], k) => { for (let x = a; x <= z; x++) set(x, k + 1, (x + k + (spec.seed || 0)) % 3 === 0 ? hcShade : hc); });
      set(7, 2, hcLit); set(6, 3, hcLit);
      if ((spec.seed || 0) % 2) { set(5, 6, hc); set(5, 7, hcShade); set(4, 8, hc); } // loose end at the back
    } else if (hw === 'cap') {
      for (let x = 7; x <= 9; x++) set(x, 3, hc);
      for (let x = 6; x <= 10; x++) set(x, 4, x === 6 ? hcShade : hc);
      set(8, 3, hcLit);
    } else {
      for (let x = 6; x <= 10; x++) set(x, 3, hair);
      for (let x = 5; x <= 10; x++) set(x, 4, hair);
      if (spec.hairStyle === 'curly') { const hl = mixRGB(hair, [200, 180, 150], 0.25); set(7, 3, hl); set(9, 4, hl); set(5, 6, hl); set(6, 8, hl); set(10, 3, hair); set(11, 4, hair); }
    }
  }

  function outline(g) {
    const out = new Buf(g.w, g.h);
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
      const c = g.get(x, y);
      if (c) { out.set(x, y, c); continue; }
      if (g.get(x - 1, y) || g.get(x + 1, y) || g.get(x, y - 1) || g.get(x, y + 1)) out.set(x, y, P.outline);
    }
    return out;
  }

  // Standing, facing right, 18×38 with feet on the bottom row.
  // dress 'robe' (default): ankle-length robe, optionally with an open outer robe.
  // dress 'chiton': Greek knee-length tunic with bare arms and legs and sandals;
  //   with drape 'himation' the `outer` colour is a cloak hung from the (far) left
  //   shoulder down the back and wrapped diagonally round the lower body.
  function standing(spec, frame) {
    const g = new Buf(18, 38);
    const seed = spec.seed || 0;
    const blink = (frame + seed * 7) % 37 === 0;
    const breath = Math.floor((frame + seed * 3) / 8) % 2;
    const [robe, robeShade, robeLit] = cl(spec.robe || 'undyed');
    const outer = spec.outer ? cl(spec.outer) : null;
    const [skin, skinShade] = (SKIN[spec.skin] || SKIN.medium).map(hx);
    const chiton = spec.dress === 'chiton';
    const sandal = hx('#5a3a22');
    const left = (y) => (y <= 13 ? 6 : y <= 21 ? 5 : 5 - Math.floor((y - 21) / 5));
    const right = (y) => (y <= 13 ? 11 : y <= 21 ? 12 : 12 + Math.floor((y - 21) / 6));
    const hem = chiton ? 28 : 35;
    for (let y = 13; y <= hem; y++) {
      for (let x = left(y); x <= right(y); x++) {
        let c = x === left(y) ? robeShade : x === right(y) ? robeLit : robe;
        if (!chiton && outer && !(x >= right(y) - 2 && y >= 15)) c = x === left(y) ? outer[1] : x === right(y) - 3 ? outer[2] : outer[0];
        if (y === hem) c = !chiton && outer && x < right(y) - 2 ? outer[1] : robeShade;
        if (chiton && (x + y) % 4 === 0 && y > 22) c = robeShade; // folds
        g.set(x, y, c);
      }
    }
    if (chiton) {
      // bare legs and sandals
      for (let y = hem + 1; y <= 35; y++) { g.set(7, y, skinShade); g.set(8, y, skin); g.set(10, y, skinShade); g.set(11, y, skin); }
      g.set(6, 36, sandal); g.set(7, 36, sandal); g.set(8, 36, sandal); g.set(10, 36, sandal); g.set(11, 36, sandal); g.set(12, 36, sandal);
      g.set(8, 34, sandal); g.set(11, 34, sandal); // straps
      if (outer && spec.drape === 'himation') {
        for (let y = 13; y <= 31; y++) for (let x = left(Math.min(y, 30)) - (y > 28 ? 1 : 0); x <= right(Math.min(y, 30)); x++) {
          const back = x <= left(y) + 2;
          const wrapped = y >= 26 - Math.round((x - left(y)) * 0.8);
          if (!(back || wrapped)) continue;
          g.set(x, y, (x + 2 * y) % 5 === 0 ? outer[1] : x === left(y) ? outer[1] : outer[0]);
        }
      }
    } else {
      g.set(7, 36, hx('#3a2616')); g.set(8, 36, hx('#3a2616')); g.set(11, 36, hx('#3a2616')); g.set(12, 36, hx('#3a2616'));
    }
    if (spec.sash) { const [s, ss] = cl(spec.sash); for (let x = left(22); x <= right(22); x++) { g.set(x, 22, s); g.set(x, 23, ss); } }
    // front arm and what it holds (bare below a short sleeve with a chiton)
    const sleeve = !chiton && outer ? outer : [robe, robeShade, robeLit];
    const armC = (y) => (chiton && y >= 17 ? [skin, skinShade] : [sleeve[0], sleeve[1]]);
    const prop = spec.prop || 'none';
    if (prop === 'none') {
      for (let y = 15; y <= 25; y++) { const [a, b2] = armC(y); g.set(10, y, a); g.set(11, y, b2); }
      g.set(11, 26, skin);
    } else {
      for (let y = 15; y <= 20; y++) { const [a, b2] = armC(y); g.set(10, y, a); g.set(11, y, b2); }
      const fore = chiton ? skin : sleeve[0];
      g.set(12, 20, fore); g.set(12, 21, fore); g.set(13, 21, fore);
      if (prop === 'book') {
        g.rect(12, 16, 4, 4, hx('#6a2e22')); g.rect(12, 16, 4, 1, P.paper); g.set(15, 17, P.paper);
        g.set(14, 20, skin); g.set(15, 20, skin);
      } else if (prop === 'scroll') {
        g.rect(12, 19, 4, 2, P.paper); g.set(12, 19, P.paperShade); g.set(15, 20, P.paperShade);
        g.set(14, 21, skin);
      }
    }
    // head (bobs with breathing)
    drawHead(g, spec, 0, breath, blink);
    return outline(g);
  }

  // Sitting cross-legged on the floor, facing right, writing on a board on the knee
  function sitting(spec, frame, writing) {
    const g = new Buf(22, 28);
    const seed = spec.seed || 0;
    const blink = (frame + seed * 7) % 37 === 0;
    const [robe, robeShade, robeLit] = cl(spec.robe || 'undyed');
    const outer = spec.outer ? cl(spec.outer) : null;
    const top = outer || [robe, robeShade, robeLit];
    const [skin] = (SKIN[spec.skin] || SKIN.medium).map(hx);
    // lap and crossed legs
    for (let y = 20; y <= 26; y++) {
      const a = y === 20 ? 5 : y === 26 ? 4 : 3, z = y === 20 ? 15 : y === 26 ? 17 : 18;
      for (let x = a; x <= z; x++) g.set(x, y, x === a || y === 26 ? top[1] : top[0]);
    }
    g.set(18, 26, hx('#3a2616')); g.set(19, 26, hx('#3a2616'));
    // torso
    for (let y = 13; y <= 20; y++) for (let x = 6; x <= 12; x++) g.set(x, y, x === 6 ? top[1] : x === 12 ? top[2] : top[0]);
    if (outer) for (let y = 15; y <= 19; y++) g.set(11, y, robe);
    // writing board on the knee, with a sheet
    g.rect(13, 18, 7, 1, P.woodLit); g.rect(13, 19, 7, 1, P.woodDark);
    g.rect(14, 17, 5, 1, P.paper);
    if (spec.prop === 'book') { g.rect(14, 16, 5, 1, hx('#6a2e22')); }
    // arm with pen: moves along the line while writing
    const hand = writing ? 14 + (Math.floor(frame / 2) % 3) : 15;
    g.set(10, 15, top[0]); g.set(11, 16, top[0]); g.set(12, 16, top[0]); g.set(13, 16, top[0]);
    g.set(hand, 16, skin);
    if (writing) { g.set(hand + 1, 15, hx('#1a1210')); }
    drawHead(g, spec, 1, 0, blink);
    return outline(g);
  }

  // ---------- rendering ----------
  const still = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function drawScene(b, spec, chars, t, frame) {
    const ctx = { t, frame, sky: spec.sky || 'morning' };
    const after = [];
    for (const layer of spec.layers || []) {
      const part = KIT[layer.kit];
      if (!part) continue;
      if (layer.kit === 'glow' || layer.kit === 'beam' && layer.over) { after.push(layer); continue; }
      part(b, layer, ctx);
    }
    const cast = (spec.cast || []).slice().sort((a, z) => (a.y || 0) - (z.y || 0));
    for (const c of cast) {
      const cs = chars && chars[c.who];
      if (!cs) continue;
      const sprite = c.pose === 'sit' ? sitting(cs, frame, c.write) : standing(cs, frame);
      if (c.shadow) for (let i = -c.shadow; i <= c.shadow; i++) { b.tint(Math.round(c.x) + i, (c.y || 110), P.shadow, 1, 0.5); b.tint(Math.round(c.x) + i - 1, (c.y || 110) + 1, P.shadow, 1, 0.35); }
      b.blit(sprite, Math.round(c.x - sprite.w / 2), (c.y || 110) - sprite.h + 1, c.face === 'left');
    }
    for (const layer of after) KIT[layer.kit](b, layer, ctx);
  }

  function picture(el, spec, chars, env) {
    const [w, hgt] = spec.size || [W, H];
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = hgt;
    canvas.className = 'px-canvas';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', spec.alt || spec.caption || 'Scene');
    const frameEl = document.createElement('div');
    frameEl.className = 'px-frame';
    frameEl.append(canvas);
    el.append(frameEl);
    if (spec.caption || spec.sources) {
      const cap = document.createElement('figcaption');
      cap.className = 'px-caption';
      const txt = document.createElement('span');
      txt.textContent = spec.caption || '';
      cap.append(txt);
      for (const s of spec.sources || []) {
        const a = document.createElement('a');
        a.href = s.url; a.target = '_blank'; a.rel = 'noopener';
        a.textContent = s.title + ' ↗';
        cap.append(' ', a);
      }
      el.append(cap);
    }
    const ctx = canvas.getContext('2d');
    const b = new Buf(w, hgt);
    const paint = (t, frame) => {
      b.d.fill(0);
      drawScene(b, spec, chars, t, frame);
      ctx.putImageData(new ImageData(b.d, w, hgt), 0, 0);
    };
    paint(0, 0);
    if (still()) return;
    // Animate at a DOS-like frame rate while the picture is on screen
    let visible = true, last = 0, frame = 0;
    const start = performance.now();
    if (typeof IntersectionObserver !== 'undefined') {
      new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(frameEl);
    }
    const loop = (now) => {
      if (!frameEl.isConnected) return;
      if (visible && now - last >= 1000 / FPS) {
        last = now;
        frame++;
        paint((now - start) / 1000, frame);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  // Front-facing head-and-shoulders portrait, 24×26: the close-up that dialogue
  // boxes and person cards use (drawn separately from the small scene sprite, as
  // old adventure games did).
  function bust(spec) {
    const g = new Buf(24, 26);
    const [skin, skinShade] = (SKIN[spec.skin] || SKIN.medium).map(hx);
    const hair = hx(HAIR[spec.hair] || HAIR.black);
    const beardC = hx(HAIR[spec.beardColor || spec.hair] || HAIR.black);
    const [robe, robeShade, robeLit] = cl(spec.robe || 'undyed');
    const outer = spec.outer ? cl(spec.outer) : null;
    const dark = hx('#1a1210'), lip = mixRGB(skinShade, [90, 30, 30], 0.35);
    const span = (y, a, z, c) => { for (let x = a; x <= z; x++) g.set(x, y, c); };
    // shoulders: outer robe at the sides, inner robe in a V at the neck
    for (let y = 19; y <= 25; y++) {
      const a = Math.max(0, 3 - (y - 19)), z = Math.min(23, 20 + (y - 19));
      for (let x = a; x <= z; x++) {
        const inV = Math.abs(x - 11.5) <= 1 + (y - 19) * 0.6;
        const c = outer && !inV ? (x < 8 ? outer[1] : x > 15 ? outer[0] : outer[2]) : inV ? robe : x < 8 ? robeShade : x > 15 ? robe : robeLit;
        g.set(x, y, c);
      }
    }
    if (spec.dress === 'chiton') {
      // round neckline, and a himation over the (viewer's right) shoulder, wrapped across the chest
      for (let y = 19; y <= 25; y++) {
        const a = Math.max(0, 3 - (y - 19)), z = Math.min(23, 20 + (y - 19));
        for (let x = a; x <= z; x++) {
          let c = x < 8 ? robeShade : x > 15 ? robe : robeLit;
          if (outer && spec.drape === 'himation' && y >= 19 + (22 - x) * 0.3) c = (x + 2 * y) % 6 === 0 ? outer[1] : x > 17 ? outer[2] : outer[0];
          g.set(x, y, c);
        }
      }
    }
    if (spec.sash && !outer) { const [s] = cl(spec.sash); span(24, 4, 19, s); }
    // neck and face
    span(17, 10, 13, skinShade); span(18, 10, 13, skinShade);
    span(7, 9, 14, skin); for (let y = 8; y <= 15; y++) span(y, 8, 15, skin);
    span(16, 9, 14, skin); span(17, 10, 13, skin);
    for (let y = 9; y <= 15; y++) g.set(15, y, skinShade);
    g.set(7, 11, skinShade); g.set(7, 12, skinShade); g.set(16, 11, skinShade); g.set(16, 12, skinShade); // ears
    // eyes, brows, nose, mouth
    span(10, 9, 10, hair); span(10, 13, 14, hair);
    g.set(9, 11, hx('#e8dcc8')); g.set(10, 11, dark); g.set(13, 11, dark); g.set(14, 11, hx('#e8dcc8'));
    g.set(12, 12, skinShade); g.set(12, 13, skinShade); g.set(11, 13, skinShade);
    span(15, 11, 12, lip);
    // beard
    const b = spec.beard || 'none';
    if (b === 'short') { span(14, 10, 13, beardC); span(16, 9, 14, beardC); span(17, 10, 13, beardC); g.set(8, 15, beardC); g.set(15, 15, beardC); }
    if (b === 'full' || b === 'long') {
      span(14, 9, 14, beardC);
      for (let y = 15; y <= 17; y++) span(y, 8, 15, beardC);
      span(18, 9, 14, beardC); span(19, 10, 13, beardC);
      g.set(8, 13, beardC); g.set(15, 13, beardC); g.set(8, 14, beardC); g.set(15, 14, beardC);
      span(15, 11, 12, lip);
      if (b === 'long') { span(20, 10, 13, beardC); span(21, 10, 13, beardC); span(22, 11, 12, beardC); }
    }
    // headwear
    const hw = spec.headwear || 'none';
    const [hc, hcShade, hcLit] = cl(spec.headwearColor || 'white');
    if (hw === 'turban') {
      const rows = [[9, 14], [7, 16], [6, 17], [6, 17], [6, 17], [6, 17], [6, 17], [7, 16]];
      rows.forEach(([a, z], k) => {
        for (let x = a; x <= z; x++) {
          const wrap = (x + 2 * (k + 1) + (spec.seed || 0)) % 5 === 0;
          g.set(x, k + 1, wrap ? hcShade : x < 9 && k < 4 ? hcLit : hc);
        }
      });
      g.set(6, 9, hcShade); g.set(17, 9, hcShade);
    } else if (hw === 'cap') {
      span(4, 9, 14, hc); span(5, 8, 15, hc); span(6, 8, 15, hc); span(7, 8, 15, hcShade);
      g.set(10, 5, hcLit); g.set(11, 4, hcLit);
      g.set(7, 8, hair); g.set(16, 8, hair); g.set(7, 9, hair); g.set(16, 9, hair);
    } else {
      span(5, 9, 14, hair); span(6, 8, 15, hair); span(7, 8, 15, hair); g.set(7, 8, hair); g.set(16, 8, hair); g.set(7, 9, hair); g.set(16, 9, hair);
      if (spec.hairStyle === 'curly') {
        span(4, 10, 13, hair);
        const hl = mixRGB(hair, [200, 180, 150], 0.25);
        [[10, 4], [13, 5], [9, 6], [12, 6], [15, 7], [8, 7], [11, 5]].forEach(([x, y]) => g.set(x, y, hl));
      }
    }
    return outline(g);
  }

  // Draw a character's portrait at `size` CSS px wide
  function portrait(el, spec, size) {
    const face = bust(spec);
    const bg = new Buf(24, 26);
    bg.vgrad(0, 0, 24, 26, ['#3a2e1c', '#1c1810']);
    bg.blit(face, 0, 0, false);
    const canvas = document.createElement('canvas');
    canvas.width = 24; canvas.height = 26;
    canvas.className = 'px-portrait';
    canvas.style.width = (size || 72) + 'px';
    canvas.getContext('2d').putImageData(new ImageData(bg.d, 24, 26), 0, 0);
    el.append(canvas);
    return canvas;
  }

  return { picture, portrait, kits: Object.keys(KIT), W, H };
})();
