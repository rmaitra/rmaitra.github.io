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

  return { completeSquare, balance };
})();
