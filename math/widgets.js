// ============ Story widgets ============
// Interactive figures used inside Stories lessons. Each widget is
// WIDGETS[name](el, params, api) where api = { live, done(), math(el) }.
// A live widget calls api.done() when the learner has finished with it, which
// releases the lesson's Next button. A non-live widget (a lesson being resumed)
// draws its final state straight away.
var WIDGETS = (function () {
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function svgEl(tag, attrs, text) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (text != null) el.textContent = text;
    return el;
  }

  function htmlEl(tag, cls, html) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html != null) el.innerHTML = html;
    return el;
  }

  // ---------- Completing the square ----------
  // al-Khwarizmi's second demonstration: the ten roots (a 10-by-x rectangle) are
  // split into two 5-by-x halves laid along two sides of the square, and the
  // missing 5-by-5 corner is filled in. Drawn to scale with the true root.
  function completeSquare(el, params, api) {
    const b = params.b, c = params.c;
    const h = b / 2;
    const x = Math.sqrt(c + h * h) - h;
    const U = 24, M = 34;
    const W = (x + b) * U + 2 * M, H = (x + h) * U + 2 * M;
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, class: 'w-svg', role: 'img', 'aria-label': 'Completing the square diagram' });
    const px = (v) => M + v * U;
    const fmt = (v) => String(Math.round(v * 100) / 100);

    const rect = (x0, y0, w, hh, cls) => svgEl('rect', { x: px(x0), y: px(y0), width: w * U, height: hh * U, class: cls });
    const label = (cx, cy, text, cls) => svgEl('text', { x: px(cx), y: px(cy), class: 'w-label ' + (cls || ''), 'text-anchor': 'middle', 'dominant-baseline': 'middle' }, text);
    const group = (cls, ...kids) => { const g = svgEl('g', { class: 'w-part ' + cls }); kids.forEach((k) => g.appendChild(k)); return g; };

    const square = group('sq', rect(0, 0, x, x, 'w-sq'), label(x / 2, x / 2, 'x²'));
    const whole = group('whole', rect(x, 0, b, x, 'w-rect'), label(x + b / 2, x / 2, `${b} roots = ${b}x`));
    const halfA = group('half', rect(x, 0, h, x, 'w-rect'), label(x + h / 2, x / 2, `${fmt(h)}x`));
    const halfB = group('half', rect(0, x, x, h, 'w-rect'), label(x / 2, x + h / 2, `${fmt(h)}x`));
    const corner = group('corner', rect(x, x, h, h, 'w-corner'), label(x + h / 2, x + h / 2, fmt(h * h)));
    const sides = group('sides',
      svgEl('line', { x1: px(0), y1: px(0) - 10, x2: px(x + h), y2: px(0) - 10, class: 'w-dim' }),
      label((x + h) / 2, -22 / U, `side: x + ${fmt(h)} = ${fmt(x + h)}`, 'w-dim-label'));
    [square, whole, halfA, halfB, corner, sides].forEach((g) => svg.appendChild(g));

    const caption = htmlEl('div', 'w-caption');
    const btn = htmlEl('button', 'primary');
    btn.type = 'button';
    const controls = htmlEl('div', 'w-controls');
    controls.appendChild(btn);

    const stages = [
      { show: [square, whole], caption: `The square and the ten roots together have area \\(${c}\\). The rectangle is \\(${b}\\) long and \\(x\\) wide.`, action: 'Split the roots in half' },
      { show: [square, halfA, halfB], caption: `Cut the rectangle into two halves, each \\(${fmt(h)}\\) by \\(x\\), and lay them along two sides of the square. The area is still \\(${c}\\).`, action: 'Fill the missing corner' },
      { show: [square, halfA, halfB, corner], caption: `The shape is almost a square. The gap in the corner is \\(${fmt(h)} \\times ${fmt(h)} = ${fmt(h * h)}\\). Fill it, and the area becomes \\(${c} + ${fmt(h * h)} = ${fmt(c + h * h)}\\).`, action: 'Measure the big square' },
      { show: [square, halfA, halfB, corner, sides], caption: `A square of area \\(${fmt(c + h * h)}\\) has side \\(${fmt(x + h)}\\). That side is \\(x + ${fmt(h)}\\), so \\(x = ${fmt(x + h)} - ${fmt(h)} = ${fmt(x)}\\).` }
    ];
    let stage = -1;
    function go(i) {
      stage = i;
      const s = stages[i];
      [square, whole, halfA, halfB, corner, sides].forEach((g) => g.classList.toggle('on', s.show.includes(g)));
      caption.innerHTML = s.caption;
      api.math(caption);
      if (s.action) { btn.textContent = s.action; controls.hidden = false; }
      else { controls.hidden = true; api.done(); }
    }
    btn.addEventListener('click', () => { if (stage < stages.length - 1) go(stage + 1); });

    el.append(svg, caption, controls);
    go(api.live ? 0 : stages.length - 1);
  }

  // ---------- Balance ----------
  // Two pans holding the terms on each side of an equation. Each stage is an
  // action (al-jabr, al-muqabala, ...) that turns one equation into the next.
  function balance(el, params, api) {
    const stages = params.stages;
    const beam = htmlEl('div', 'w-beam');
    beam.setAttribute('aria-hidden', 'true');
    const left = htmlEl('div', 'w-pan');
    const right = htmlEl('div', 'w-pan');
    const pans = htmlEl('div', 'w-pans');
    pans.append(left, htmlEl('div', 'w-eq', '='), right);
    const caption = htmlEl('div', 'w-caption');
    const btn = htmlEl('button', 'primary');
    btn.type = 'button';
    const controls = htmlEl('div', 'w-controls');
    controls.appendChild(btn);

    let stage = -1;
    function fill(pan, terms) {
      pan.replaceChildren(...terms.map((t, i) => {
        const chip = htmlEl('span', 'w-chip');
        chip.textContent = t;
        chip.style.animationDelay = `${i * 60}ms`;
        return chip;
      }));
    }
    function go(i) {
      stage = i;
      const s = stages[i];
      fill(left, s.left);
      fill(right, s.right);
      caption.textContent = s.caption || '';
      api.math(pans);
      api.math(caption);
      const next = stages[i + 1];
      if (next) { btn.innerHTML = next.action; api.math(btn); controls.hidden = false; }
      else { controls.hidden = true; api.done(); }
    }
    btn.addEventListener('click', () => { if (stage < stages.length - 1) go(stage + 1); });

    el.append(beam, pans, caption, controls);
    go(api.live ? 0 : stages.length - 1);
  }

  // ---------- Sun rays (Eratosthenes) ----------
  // Parallel sunlight on a curved Earth: no shadow at Syene, a shadow at Alexandria,
  // and the same angle again at the Earth's centre. The angle is drawn larger than
  // the real 7.2° so it can be seen.
  function sunRays(el, params, api) {
    const R = 250, O = { x: 180, y: 330 }, L = 30;
    const th = (params.drawAngle || 22) * Math.PI / 180;
    const S = { x: O.x, y: O.y - R };
    const A = { x: O.x - R * Math.sin(th), y: O.y - R * Math.cos(th) };
    const u = { x: -Math.sin(th), y: -Math.cos(th) }; // "up" at Alexandria
    const T = { x: A.x + L * u.x, y: A.y + L * u.y }; // tip of Alexandria's gnomon
    const s = -L * Math.tan(th); // shadow along the ground, away from Syene
    const P = { x: A.x + s * Math.cos(th), y: A.y - s * Math.sin(th) };
    const surfaceY = (x) => O.y - Math.sqrt(Math.max(0, R * R - (x - O.x) * (x - O.x)));
    const arc = (c, r, a1, a2) => {
      const p1 = { x: c.x + r * Math.cos(a1), y: c.y + r * Math.sin(a1) }, p2 = { x: c.x + r * Math.cos(a2), y: c.y + r * Math.sin(a2) };
      return `M${p1.x.toFixed(1)} ${p1.y.toFixed(1)} A${r} ${r} 0 0 ${a2 > a1 ? 1 : 0} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    };
    const ang = (from, to) => Math.atan2(to.y - from.y, to.x - from.x);
    const rays = [];
    for (let x = 30; x <= 330; x += 25) rays.push(`<line class="sr-ray" x1="${x}" y1="0" x2="${x}" y2="${surfaceY(x).toFixed(1)}"/>`);
    const svg = `
      <svg viewBox="0 0 360 340" class="w-svg sr" role="img" aria-label="Sun rays on the curved Earth">
        <defs><marker id="sr-arrow" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L6 3 L0 6 Z" class="sr-arrowhead"/></marker></defs>
        <circle cx="${O.x}" cy="${O.y}" r="${R}" class="sr-earth"/>
        <g class="sr-rays">${rays.join('')}<line class="sr-ray sr-ray-a" x1="${T.x.toFixed(1)}" y1="0" x2="${P.x.toFixed(1)}" y2="${P.y.toFixed(1)}"/></g>
        <text x="352" y="14" class="sr-text" text-anchor="end">sunlight</text>
        <g class="w-part sr-radii"><line class="sr-radius" x1="${O.x}" y1="${O.y}" x2="${S.x}" y2="${S.y}"/><line class="sr-radius" x1="${O.x}" y1="${O.y}" x2="${A.x.toFixed(1)}" y2="${A.y.toFixed(1)}"/>
          <path class="sr-angle" d="${arc(O, 46, ang(O, A), ang(O, S))}"/><text class="sr-alpha" x="${O.x - 16}" y="${O.y - 52}">α</text>
          <circle cx="${O.x}" cy="${O.y}" r="3" class="sr-dot"/><text class="sr-text" x="${O.x + 8}" y="${O.y - 4}">centre</text></g>
        <path class="w-part sr-arcpath" d="M${A.x.toFixed(1)} ${A.y.toFixed(1)} A${R} ${R} 0 0 1 ${S.x} ${S.y}"/>
        <line class="sr-gnomon" x1="${S.x}" y1="${S.y}" x2="${S.x}" y2="${S.y - L}"/>
        <line class="sr-gnomon" x1="${A.x.toFixed(1)}" y1="${A.y.toFixed(1)}" x2="${T.x.toFixed(1)}" y2="${T.y.toFixed(1)}"/>
        <g class="w-part sr-shadow"><line class="sr-shade" x1="${A.x.toFixed(1)}" y1="${A.y.toFixed(1)}" x2="${P.x.toFixed(1)}" y2="${P.y.toFixed(1)}"/>
          <path class="sr-angle" d="${arc(T, 16, ang(T, A), ang(T, P))}"/><text class="sr-alpha" x="${(T.x + 6).toFixed(1)}" y="${(T.y + 26).toFixed(1)}">α</text></g>
        <g class="w-part sr-syene"><circle cx="${S.x}" cy="${S.y - L}" r="7" class="sr-ring"/></g>
        <text class="sr-label" x="${S.x + 8}" y="${S.y + 16}">Syene</text>
        <text class="sr-label" x="${(A.x - 64).toFixed(1)}" y="${(A.y + 18).toFixed(1)}">Alexandria</text>
        <text class="w-part sr-arclabel" x="${((A.x + S.x) / 2 - 20).toFixed(1)}" y="${((A.y + S.y) / 2 - 22).toFixed(1)}">5,000 stades</text>
      </svg>`;
    el.insertAdjacentHTML('beforeend', svg);
    const root = el.lastElementChild;
    const part = (cls) => root.querySelector('.' + cls);
    const caption = htmlEl('div', 'w-caption');
    const btn = htmlEl('button', 'primary');
    btn.type = 'button';
    const controls = htmlEl('div', 'w-controls');
    controls.appendChild(btn);
    const note = htmlEl('div', 'w-note', 'The angle is drawn much larger than the real one so you can see it.');
    el.append(caption, controls, note);

    const stages = [
      { on: [], caption: 'The sun is so far away that its rays arrive parallel. Two upright sticks (*gnomons*) stand on the curved Earth: one at Syene, one at Alexandria.', action: 'Look at Syene at noon' },
      { on: ['sr-syene'], caption: 'At Syene the stick points straight at the sun. The light runs along it, so it casts no shadow.', action: 'Look at Alexandria' },
      { on: ['sr-shadow'], caption: 'At the same moment in Alexandria, the stick leans away from the sunlight and casts a shadow. The angle between stick and ray, \\(\\alpha\\), is \\(\\tfrac{1}{50}\\) of a circle.', action: 'Extend the sticks into the Earth' },
      { on: ['sr-shadow', 'sr-radii'], caption: 'Both sticks point straight out from the Earth\'s centre. Extend them and they meet there. The ray at Alexandria and the line through Syene are parallel, so the angle at the centre is the same \\(\\alpha\\) (alternate angles).', action: 'Measure the Earth' },
      { on: ['sr-shadow', 'sr-radii', 'sr-arcpath', 'sr-arclabel'], caption: 'So the arc from Syene to Alexandria is \\(\\tfrac{1}{50}\\) of the whole circle. The whole circle is \\(50 \\times 5000 = 250{,}000\\) stades.' }
    ];
    let stage = -1;
    function go(i) {
      stage = i;
      const st = stages[i];
      ['sr-syene', 'sr-shadow', 'sr-radii', 'sr-arcpath', 'sr-arclabel'].forEach((c) => part(c).classList.toggle('on', st.on.includes(c)));
      caption.innerHTML = st.caption.replace(/\*([^*]+)\*/g, '<em class="term">$1</em>');
      api.math(caption);
      if (st.action) { btn.textContent = st.action; controls.hidden = false; }
      else { controls.hidden = true; api.done(); }
    }
    btn.addEventListener('click', () => { if (stage < stages.length - 1) go(stage + 1); });
    go(api.live ? 0 : stages.length - 1);
  }

  // ---------- Sieve of Eratosthenes ----------
  // Circle the next number still standing and cross out its multiples. Once the
  // next prime squared passes the limit, everything left standing is prime.
  function sieve(el, params, api) {
    const max = params.max || 50;
    const grid = htmlEl('div', 'sv-grid');
    const cells = {};
    for (let n = 1; n <= max; n++) {
      const c = htmlEl('span', 'sv-cell' + (n === 1 ? ' sv-one' : ''));
      c.textContent = n;
      cells[n] = c;
      grid.appendChild(c);
    }
    const caption = htmlEl('div', 'w-caption');
    const btn = htmlEl('button', 'primary');
    btn.type = 'button';
    const controls = htmlEl('div', 'w-controls');
    controls.appendChild(btn);
    el.append(grid, caption, controls);

    const crossed = new Set([1]);
    const primesUsed = [];
    const nextPrime = () => { for (let n = (primesUsed[primesUsed.length - 1] || 1) + 1; n <= max; n++) if (!crossed.has(n)) return n; return null; };
    const standing = () => { let k = 0; for (let n = 2; n <= max; n++) if (!crossed.has(n)) k++; return k; };
    function sweep(p, animate) {
      primesUsed.push(p);
      cells[p].classList.add('sv-prime');
      for (let m = 2 * p; m <= max; m += p) {
        if (crossed.has(m)) continue;
        crossed.add(m);
        cells[m].classList.add('sv-out');
        if (animate) cells[m].classList.add('sv-new');
      }
    }
    function finish() {
      for (let n = 2; n <= max; n++) if (!crossed.has(n)) cells[n].classList.add('sv-prime');
      const q = nextPrime();
      caption.textContent = (q ? `The next number left is ${q}, and ${q} × ${q} = ${q * q} is bigger than ${max}, so anything still standing has no smaller factor. ` : '') +
        `Every number still standing is prime: ${standing()} primes up to ${max}.`;
      controls.hidden = true;
      api.done();
    }
    function step(animate) {
      grid.querySelectorAll('.sv-new').forEach((c) => c.classList.remove('sv-new'));
      const p = nextPrime();
      if (!p || p * p > max) { finish(); return; }
      sweep(p, animate);
      const q = nextPrime();
      caption.textContent = `${p} is prime, so every multiple of ${p} (${2 * p}, ${3 * p}, …) is crossed out. ${standing()} numbers are still standing.`;
      btn.textContent = q && q * q <= max ? `Circle ${q} and cross out its multiples` : 'Finish: circle everything left';
    }
    btn.addEventListener('click', () => step(true));
    if (api.live) {
      caption.textContent = `Every number from 2 to ${max}. 1 is not prime. Start with 2, the first prime.`;
      btn.textContent = 'Circle 2 and cross out its multiples';
    } else {
      while (true) { const p = nextPrime(); if (!p || p * p > max) break; sweep(p, false); }
      finish();
    }
  }

  // ---------- Noon sun on an equinox ----------
  // A cross-section of the Earth with sunlight arriving parallel to the equator (as
  // at an equinox). Drag your latitude φ; the noon sun's height h above your horizon
  // follows, and the right angle between your horizon and the Earth's radius shows
  // why h + φ = 90°.
  function noonSun(el, params, api) {
    const O = { x: 140, y: 150 }, R = 92;
    const places = params.places || [['Equator', 0], ['Rome', 41.9], ['London', 51.5], ['Far north', 70]];
    el.insertAdjacentHTML('beforeend', `
      <svg viewBox="0 0 360 300" class="w-svg ns" role="img" aria-label="The noon sun's height and your latitude">
        <g class="ns-rays"></g>
        <circle cx="${O.x}" cy="${O.y}" r="${R}" class="ns-earth"/>
        <path class="ns-night" d="M${O.x} ${O.y - R} A${R} ${R} 0 0 0 ${O.x} ${O.y + R} Z"/>
        <line x1="${O.x - R - 14}" y1="${O.y}" x2="${O.x + R + 14}" y2="${O.y}" class="ns-equator"/>
        <text x="${O.x - R - 12}" y="${O.y - 6}" class="ns-small">equator</text>
        <line x1="${O.x}" y1="${O.y - R - 10}" x2="${O.x}" y2="${O.y + R + 10}" class="ns-axis"/>
        <text x="${O.x - 22}" y="${O.y - R - 14}" class="ns-small">North Pole</text>
        <g class="ns-live"></g>
        <g class="ns-sun"><circle cx="340" cy="${O.y}" r="11" class="ns-sundisc"/><text x="322" y="${O.y + 30}" class="ns-small">sun</text></g>
      </svg>`);
    const svg = el.lastElementChild;
    const live = svg.querySelector('.ns-live');
    // parallel rays from the sun, stopping at the Earth's surface
    const rays = [];
    for (let y = O.y - R + 12; y <= O.y + R - 12; y += 20) {
      const dx = Math.sqrt(R * R - (y - O.y) * (y - O.y));
      rays.push(`<line x1="328" y1="${y}" x2="${(O.x + dx).toFixed(1)}" y2="${y}" class="ns-ray" marker-end="url(#ns-arrow)"/>`);
    }
    svg.querySelector('.ns-rays').innerHTML = `<defs><marker id="ns-arrow" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill="#ffd27a"/></marker></defs>` + rays.join('');

    const readout = htmlEl('div', 'ns-readout');
    const slider = htmlEl('input', 'ns-slider');
    Object.assign(slider, { type: 'range', min: 0, max: 80, step: 1 });
    slider.setAttribute('aria-label', 'Your latitude in degrees north');
    const presets = places.map(([name, lat]) => {
      const b = htmlEl('button', 'calc-key');
      b.type = 'button';
      b.textContent = name;
      b.addEventListener('click', () => { slider.value = Math.round(lat); draw(lat); api.done(); });
      return b;
    });
    const controls = htmlEl('div', 'w-controls ns-controls');
    controls.append(htmlEl('label', 'ns-label', 'Your latitude'), slider, ...presets);
    const caption = htmlEl('div', 'w-caption', 'Sunlight arrives parallel to the equator at an equinox. Your horizon touches the Earth where you stand, at right angles to the line from the centre. That right angle is why the sun\'s height \\(h\\) and your latitude \\(\\varphi\\) always add up to 90°.');
    el.append(readout, controls, caption);
    api.math(caption);

    const pt = (deg, r) => ({ x: O.x + r * Math.cos(deg * Math.PI / 180), y: O.y - r * Math.sin(deg * Math.PI / 180) });
    const arcPath = (c, r, a1, a2) => { // angles in degrees, counter-clockwise from +x
      const p1 = { x: c.x + r * Math.cos(a1 * Math.PI / 180), y: c.y - r * Math.sin(a1 * Math.PI / 180) };
      const p2 = { x: c.x + r * Math.cos(a2 * Math.PI / 180), y: c.y - r * Math.sin(a2 * Math.PI / 180) };
      return `M${p1.x.toFixed(1)} ${p1.y.toFixed(1)} A${r} ${r} 0 0 ${a2 > a1 ? 0 : 1} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    };
    function draw(lat) {
      const phi = Math.max(0, Math.min(80, lat));
      const h = 90 - phi;
      const P = pt(phi, R);
      const out = pt(phi, R + 44); // straight up (zenith) from you
      // horizon: the tangent at P, drawn both ways
      const tdir = { x: Math.sin(phi * Math.PI / 180), y: Math.cos(phi * Math.PI / 180) };
      const H1 = { x: P.x - 58 * tdir.x, y: P.y - 58 * tdir.y }, H2 = { x: P.x + 58 * tdir.x, y: P.y + 58 * tdir.y };
      // right-angle mark between radius and horizon
      const rdir = { x: Math.cos(phi * Math.PI / 180), y: -Math.sin(phi * Math.PI / 180) };
      const k = 9, q1 = { x: P.x - k * rdir.x, y: P.y - k * rdir.y }, q2 = { x: q1.x + k * tdir.x, y: q1.y + k * tdir.y }, q3 = { x: P.x + k * tdir.x, y: P.y + k * tdir.y };
      // angle of the horizon (towards the equator side) measured counter-clockwise from +x
      const horizonAng = -(90 - phi);
      const hl = { x: P.x + 44 * Math.cos((horizonAng / 2) * Math.PI / 180), y: P.y - 44 * Math.sin((horizonAng / 2) * Math.PI / 180) };
      const fl = pt(phi / 2, 40);
      live.innerHTML = `
        <line x1="${O.x}" y1="${O.y}" x2="${out.x.toFixed(1)}" y2="${out.y.toFixed(1)}" class="ns-radius"/>
        <text x="${(out.x + 4).toFixed(1)}" y="${(out.y - 10).toFixed(1)}" class="ns-small">straight up</text>
        <line x1="${H1.x.toFixed(1)}" y1="${H1.y.toFixed(1)}" x2="${H2.x.toFixed(1)}" y2="${H2.y.toFixed(1)}" class="ns-horizon"/>
        <text x="${(H2.x + 5).toFixed(1)}" y="${(H2.y + 4).toFixed(1)}" class="ns-small ns-hlabel">your horizon</text>
        <path d="M${q1.x.toFixed(1)} ${q1.y.toFixed(1)} L${q2.x.toFixed(1)} ${q2.y.toFixed(1)} L${q3.x.toFixed(1)} ${q3.y.toFixed(1)}" class="ns-right"/>
        <line x1="${P.x.toFixed(1)}" y1="${P.y.toFixed(1)}" x2="328" y2="${P.y.toFixed(1)}" class="ns-toSun"/>
        ${phi > 0.5 ? `<path d="${arcPath(O, 30, 0, phi)}" class="ns-phiarc"/>` : ''}
        ${phi >= 4 ? `<text x="${fl.x.toFixed(1)}" y="${(fl.y + 4).toFixed(1)}" class="ns-phi">φ</text>` : ''}
        <path d="${arcPath(P, 30, horizonAng, 0)}" class="ns-harc"/>
        <text x="${hl.x.toFixed(1)}" y="${(hl.y + 4).toFixed(1)}" class="ns-h">h</text>
        <circle cx="${P.x.toFixed(1)}" cy="${P.y.toFixed(1)}" r="4.5" class="ns-you"/>
        <text x="${(P.x - 12 * rdir.x - 22).toFixed(1)}" y="${(P.y - 12 * rdir.y + 14).toFixed(1)}" class="ns-youlabel">you</text>`;
      readout.innerHTML = `Latitude <b class="ns-phi-t">φ = ${Math.round(phi)}°</b> → noon sun <b class="ns-h-t">h = ${Math.round(h)}°</b> above the horizon. &nbsp; ${Math.round(h)}° + ${Math.round(phi)}° = 90°`;
    }
    slider.addEventListener('input', () => { draw(Number(slider.value)); api.done(); });
    const start = params.start != null ? params.start : 45;
    slider.value = start;
    draw(start);
    if (!api.live) api.done();
  }

  return { completeSquare, balance, sunRays, sieve, noonSun };
})();
