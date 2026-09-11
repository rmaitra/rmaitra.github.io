
// "+ 6" / "- 6" for splicing after an operator slot
function signMag(n) { return (n >= 0 ? '+ ' : '- ') + Math.abs(n); }

// ============ Complex Numbers ============
function genAddComplex() {
  const a = rnd(-9, 9), b = rnd(-9, 9), c = rnd(-9, 9), d = rnd(-9, 9);
  const re = a + c, im = b + d;
  return {
    id: 'add_complex', label: 'Add Complex Numbers',
    prompt: `Add \\(${fmtComplexTerm(a, b)} + ${fmtComplexTerm(c, d)}\\)`,
    fields: [{ id: 're', label: 'Real part', type: 'number' }, { id: 'im', label: 'Imaginary coefficient (of i)', type: 'number' }],
    correctAnswer: { re: String(re), im: String(im) },
    check(v) {
      const ure = parseFloat(v.re), uim = parseFloat(v.im);
      if (isNaN(ure) || isNaN(uim)) return { ok: false, message: 'Enter numbers for both parts.' };
      const ok = near(ure, re, 0.001) && near(uim, im, 0.001);
      return { ok, message: ok ? 'Correct!' : 'Not quite — recheck the real and imaginary sums.' };
    },
    steps: [
      `Add real parts: \\(${a} + ${c} = ${re}\\)`,
      `Add imaginary parts: \\(${b}i + ${d}i = ${im}i\\)`,
      `Result: \\(${fmtComplex(re, im)}\\)`
    ],
    finalAnswer: `\\(${fmtComplex(re, im)}\\)`,
    chart: {
      aspectSquare: true,
      xAxisTitle: 'Real', yAxisTitle: 'Imaginary',
      ...squareRangeFromPoints([[{ x: 0, y: 0 }, { x: a, y: b }, { x: c, y: d }, { x: re, y: im }]], 1.5),
      series: [
        { name: 'A', type: 'line', data: [{ x: 0, y: 0 }, { x: a, y: b }], color: '#4a9eff', marker: { enabled: true } },
        { name: 'B', type: 'line', data: [{ x: 0, y: 0 }, { x: c, y: d }], color: '#ff9f40', marker: { enabled: true } }
      ],
      revealSeries: [
        { name: 'A + B', type: 'line', data: [{ x: 0, y: 0 }, { x: re, y: im }], color: '#ff6b6b', marker: { enabled: true } }
      ]
    }
  };
}

function genMultiplyComplex() {
  const a = rnd(-6, 6), b = rnd(-6, 6), c = rnd(-6, 6), d = rnd(-6, 6);
  const re = a * c - b * d, im = a * d + b * c;
  return {
    id: 'multiply_complex', label: 'Multiply Complex Numbers',
    prompt: `Multiply \\(${fmtComplexTerm(a, b)} \\cdot ${fmtComplexTerm(c, d)}\\)`,
    fields: [{ id: 're', label: 'Real part', type: 'number' }, { id: 'im', label: 'Imaginary coefficient (of i)', type: 'number' }],
    correctAnswer: { re: String(re), im: String(im) },
    check(v) {
      const ure = parseFloat(v.re), uim = parseFloat(v.im);
      if (isNaN(ure) || isNaN(uim)) return { ok: false, message: 'Enter numbers for both parts.' };
      const ok = near(ure, re, 0.001) && near(uim, im, 0.001);
      return { ok, message: ok ? 'Correct!' : 'Not quite — try expanding with FOIL and remember i² = -1.' };
    },
    steps: [
      'Use FOIL: First, Outer, Inner, Last',
      `\\(${a} \\cdot ${c} = ${a * c}\\)`,
      `\\(${a} \\cdot ${d}i = ${a * d}i\\)`,
      `\\(${b}i \\cdot ${c} = ${b * c}i\\)`,
      `\\(${b}i \\cdot ${d}i = ${b * d}i^2 = ${-b * d}\\) (since \\(i^2 = -1\\))`,
      `Combine real parts: \\(${a * c} + (${-b * d}) = ${re}\\)`,
      `Combine imaginary parts: \\(${a * d}i + ${b * c}i = ${im}i\\)`,
      `Result: \\(${fmtComplex(re, im)}\\)`
    ],
    finalAnswer: `\\(${fmtComplex(re, im)}\\)`,
    chart: {
      aspectSquare: true,
      xAxisTitle: 'Real', yAxisTitle: 'Imaginary',
      ...squareRangeFromPoints([[{ x: 0, y: 0 }, { x: a, y: b }, { x: c, y: d }, { x: re, y: im }]], 1.5),
      series: [
        { name: 'A', type: 'line', data: [{ x: 0, y: 0 }, { x: a, y: b }], color: '#4a9eff', marker: { enabled: true } },
        { name: 'B', type: 'line', data: [{ x: 0, y: 0 }, { x: c, y: d }], color: '#ff9f40', marker: { enabled: true } }
      ],
      revealSeries: [
        { name: 'A · B', type: 'line', data: [{ x: 0, y: 0 }, { x: re, y: im }], color: '#ff6b6b', marker: { enabled: true } }
      ]
    }
  };
}

function genDivideComplex() {
  let c, d;
  do { c = rnd(-5, 5); d = rnd(-5, 5); } while (c === 0 && d === 0);
  const a = rnd(-9, 9), b = rnd(-9, 9);
  const denom = c * c + d * d;
  const numRe = a * c + b * d, numIm = b * c - a * d;
  const re = numRe / denom, im = numIm / denom;
  return {
    id: 'conjugate_divide', label: 'Divide Complex Numbers',
    prompt: `Divide \\(${fmtComplexTerm(a, b)} \\div ${fmtComplexTerm(c, d)}\\)`,
    fields: [{ id: 're', label: 'Real part', type: 'number' }, { id: 'im', label: 'Imaginary coefficient (of i)', type: 'number' }],
    correctAnswer: { re: String(round2(re)), im: String(round2(im)) },
    check(v) {
      const ure = parseFloat(v.re), uim = parseFloat(v.im);
      if (isNaN(ure) || isNaN(uim)) return { ok: false, message: 'Enter numbers for both parts.' };
      const ok = near(ure, re, 0.01) && near(uim, im, 0.01);
      return { ok, message: ok ? 'Correct!' : 'Not quite — multiply top and bottom by the conjugate of the denominator.' };
    },
    steps: [
      `Multiply numerator and denominator by the conjugate of the denominator, \\(${fmtComplexTerm(c, -d)}\\)`,
      `Numerator: \\(${fmtComplexTerm(a, b)}${fmtComplexTerm(c, -d)} = ${round2(numRe)} + ${round2(numIm)}i\\)`,
      `Denominator: \\(${fmtComplexTerm(c, d)}${fmtComplexTerm(c, -d)} = ${c}^2 + ${d}^2 = ${denom}\\)`,
      `Result: \\(\\dfrac{${round2(numRe)} + ${round2(numIm)}i}{${denom}} = ${fmtComplex(re, im)}\\)`
    ],
    finalAnswer: `\\(${fmtComplex(re, im)}\\)`,
    chart: {
      aspectSquare: true,
      xAxisTitle: 'Real', yAxisTitle: 'Imaginary',
      ...squareRangeFromPoints([[{ x: 0, y: 0 }, { x: a, y: b }, { x: c, y: d }, { x: re, y: im }]], 1.5),
      series: [
        { name: 'A', type: 'line', data: [{ x: 0, y: 0 }, { x: a, y: b }], color: '#4a9eff', marker: { enabled: true } },
        { name: 'B', type: 'line', data: [{ x: 0, y: 0 }, { x: c, y: d }], color: '#ff9f40', marker: { enabled: true } }
      ],
      revealSeries: [
        { name: 'A ÷ B', type: 'line', data: [{ x: 0, y: 0 }, { x: re, y: im }], color: '#ff6b6b', marker: { enabled: true } }
      ]
    }
  };
}

// ============ Polynomial Operations & Factoring ============
function genPolyDivision() {
  const a = rndNonZero(-6, 6), b = rndNonZero(-6, 6);
  const dividendTerms = [{ coef: 1, pow: 2 }, { coef: a + b, pow: 1 }, { coef: a * b, pow: 0 }];
  const referenceFn = x => (x * x + (a + b) * x + a * b) / (x + a);
  const answerExpr = fmtBinom('x', b);
  return {
    id: 'poly_division', label: 'Polynomial Long Division',
    prompt: `Divide \\((${fmtPoly(dividendTerms)}) \\div ${fmtBinom('x', a)}\\)`,
    fields: [{ id: 'expr', label: 'Quotient (in terms of x)', type: 'text' }],
    correctAnswer: { expr: answerExpr },
    check(v) {
      const r = checkExpressionEquiv(v.expr, referenceFn, [-a]);
      return { ok: r.ok, message: r.ok ? 'Correct!' : (r.reason === 'unparseable' ? "Couldn't evaluate that expression — use x, +, -, *, /, ^ and parentheses." : 'Not quite — try the division again.') };
    },
    steps: [
      `Set up long division: \\((${fmtPoly(dividendTerms)}) \\div ${fmtBinom('x', a)}\\)`,
      `\\(x^2 \\div x = x\\). Multiply: \\(x \\cdot ${fmtBinom('x', a)} = ${fmtPoly([{ coef: 1, pow: 2 }, { coef: a, pow: 1 }])}\\)`,
      `Subtract: \\((${fmtPoly(dividendTerms)}) - (${fmtPoly([{ coef: 1, pow: 2 }, { coef: a, pow: 1 }])}) = ${fmtPoly([{ coef: b, pow: 1 }, { coef: a * b, pow: 0 }])}\\)`,
      `\\(${b}x \\div x = ${b}\\). Multiply: \\(${b} \\cdot ${fmtBinom('x', a)} = ${fmtPoly([{ coef: b, pow: 1 }, { coef: a * b, pow: 0 }])}\\)`,
      'Subtract: remainder is 0',
      `Quotient: \\(${answerExpr}\\)`
    ],
    finalAnswer: `\\(${answerExpr}\\)`,
    chart: (() => {
      const xmin = Math.min(-a, -b) - 3, xmax = Math.max(-a, -b) + 3;
      return {
        series: [
          { name: 'y = quotient(x)', type: 'line', data: sampleFn(x => x + b, xmin, xmax, { yClip: 40 }), color: '#4a9eff' }
        ],
        revealSeries: [
          { name: `Hole at x = ${-a}`, type: 'scatter', data: [{ x: -a, y: -a + b }], color: '#ff6b6b', marker: { symbol: 'circle', radius: 6, fillColor: 'transparent', lineWidth: 2, lineColor: '#ff6b6b' } }
        ]
      };
    })()
  };
}

function genSumDiffCubes() {
  const b = rnd(2, 6);
  const n = b ** 3;
  const sign = choice([1, -1]);
  const referenceFn = sign === 1 ? (x => x ** 3 + n) : (x => x ** 3 - n);
  const answerExpr = sign === 1 ? `(x + ${b})(x^2 - ${b}x + ${b * b})` : `(x - ${b})(x^2 + ${b}x + ${b * b})`;
  return {
    id: 'sum_diff_cubes', label: 'Factor Sum/Difference of Cubes',
    prompt: sign === 1 ? `Factor \\(x^3 + ${n}\\)` : `Factor \\(x^3 - ${n}\\)`,
    fields: [{ id: 'expr', label: 'Factored form (in terms of x)', type: 'text' }],
    correctAnswer: { expr: answerExpr },
    check(v) {
      const r = checkExpressionEquiv(v.expr, referenceFn, []);
      return { ok: r.ok, message: r.ok ? 'Correct!' : (r.reason === 'unparseable' ? "Couldn't evaluate that expression — use x, +, -, *, /, ^ and parentheses." : 'Not quite — check the sum/difference of cubes formula.') };
    },
    steps: sign === 1 ? [
      'Recognize as sum of cubes: \\(a^3 + b^3 = (a + b)(a^2 - ab + b^2)\\)',
      `\\(x^3 + ${n} = x^3 + ${b}^3\\)`,
      `\\(a = x,\\ b = ${b}\\)`,
      `Result: \\(${answerExpr}\\)`
    ] : [
      'Recognize as difference of cubes: \\(a^3 - b^3 = (a - b)(a^2 + ab + b^2)\\)',
      `\\(x^3 - ${n} = x^3 - ${b}^3\\)`,
      `\\(a = x,\\ b = ${b}\\)`,
      `Result: \\(${answerExpr}\\)`
    ],
    finalAnswer: `\\(${answerExpr}\\)`,
    chart: (() => {
      const rootX = sign === 1 ? -b : b;
      const xmin = rootX - 4, xmax = rootX + 4;
      return {
        series: [
          { name: sign === 1 ? `y = x³ + ${n}` : `y = x³ - ${n}`, type: 'line', data: sampleFn(referenceFn, xmin, xmax, { yClip: 200 }), color: '#4a9eff' }
        ],
        revealSeries: [
          { name: 'Root', type: 'scatter', data: [{ x: rootX, y: 0 }], color: '#ff6b6b' }
        ]
      };
    })()
  };
}

function genTrinomialFactor() {
  let p = rndNonZero(-9, 9), q = rndNonZero(-9, 9);
  if (p === q) q = q > 0 ? q - 1 : q + 1;
  if (q === 0) q = 1;
  const b = p + q, c = p * q;
  const referenceFn = x => x * x + b * x + c;
  const answerExpr = `${fmtBinom('x', p)}${fmtBinom('x', q)}`;
  return {
    id: 'trinomial_factor', label: 'Factor Trinomials',
    prompt: `Factor \\(${fmtPoly([{ coef: 1, pow: 2 }, { coef: b, pow: 1 }, { coef: c, pow: 0 }])}\\)`,
    fields: [{ id: 'expr', label: 'Factored form (in terms of x)', type: 'text' }],
    correctAnswer: { expr: answerExpr },
    check(v) {
      const r = checkExpressionEquiv(v.expr, referenceFn, []);
      return { ok: r.ok, message: r.ok ? 'Correct!' : (r.reason === 'unparseable' ? "Couldn't evaluate that expression — use x, +, -, *, /, ^ and parentheses." : 'Not quite — find two numbers that multiply and add correctly.') };
    },
    steps: [
      `Find two numbers that multiply to ${c} and add to ${b}: ${p} and ${q}`,
      `Write as a product of two binomials: \\(${answerExpr}\\)`
    ],
    finalAnswer: `\\(${answerExpr}\\)`,
    chart: (() => {
      const xmin = Math.min(-p, -q) - 3, xmax = Math.max(-p, -q) + 3;
      return {
        series: [
          { name: 'y = x² + bx + c', type: 'line', data: sampleFn(referenceFn, xmin, xmax, { yClip: 60 }), color: '#4a9eff' }
        ],
        revealSeries: [
          { name: 'Roots', type: 'scatter', data: [{ x: -p, y: 0 }, { x: -q, y: 0 }], color: '#ff6b6b' }
        ]
      };
    })()
  };
}

function genRemainderTheorem() {
  const e1 = rndNonZero(-5, 5), e2 = rnd(-5, 5), e3 = rnd(-5, 5), e4 = rnd(-5, 5);
  const a = rndNonZero(-4, 4);
  const value = e1 * a ** 3 + e2 * a ** 2 + e3 * a + e4;
  const polyStr = fmtPoly([{ coef: e1, pow: 3 }, { coef: e2, pow: 2 }, { coef: e3, pow: 1 }, { coef: e4, pow: 0 }]);
  return {
    id: 'remainder_theorem', label: 'Remainder & Factor Theorems',
    prompt: `Use the Remainder Theorem to find the remainder when \\(p(x) = ${polyStr}\\) is divided by \\(${fmtBinom('x', -a)}\\)`,
    fields: [{ id: 'remainder', label: 'Remainder', type: 'number' }],
    correctAnswer: { remainder: String(value) },
    check(v) {
      const u = parseFloat(v.remainder);
      if (isNaN(u)) return { ok: false, message: 'Enter a number.' };
      const ok = near(u, value, 0.001);
      return { ok, message: ok ? 'Correct!' : `Not quite — remember the remainder equals p(${a}).` };
    },
    steps: [
      `By the Remainder Theorem, the remainder equals \\(p(${a})\\)`,
      `\\(p(${a}) = ${e1}(${a})^3 ${signMag(e2)}(${a})^2 ${signMag(e3)}(${a}) ${signMag(e4)}\\)`,
      `\\(= ${e1 * a ** 3} ${signMag(e2 * a ** 2)} ${signMag(e3 * a)} ${signMag(e4)}\\)`,
      `\\(= ${value}\\)`
    ],
    finalAnswer: `\\(${value}\\)`,
    chart: {
      series: [
        { name: 'y = p(x)', type: 'line', data: sampleFn(x => e1 * x ** 3 + e2 * x ** 2 + e3 * x + e4, a - 5, a + 5, { yClip: 250 }), color: '#4a9eff' }
      ],
      revealSeries: [
        { name: 'p(a)', type: 'scatter', data: [{ x: a, y: value }], color: '#ff6b6b' }
      ]
    }
  };
}

// ============ Rational Expressions & Equations ============
function genSimplifyRational() {
  const r = rndNonZero(-6, 6);
  const p = rndNonZero(-6, 6);
  // q must differ from p (else the reduced form is trivially 1) and from -r
  // (else the "canceled" factor (x-r) is still present in the denominator,
  // making x=r a pole rather than a removable hole).
  let q;
  do { q = rndNonZero(-6, 6); } while (q === p || q === -r);
  const numTerms = [{ coef: 1, pow: 2 }, { coef: p - r, pow: 1 }, { coef: -p * r, pow: 0 }];
  const denTerms = [{ coef: 1, pow: 2 }, { coef: q - r, pow: 1 }, { coef: -q * r, pow: 0 }];
  const referenceFn = x => (x * x + (p - r) * x - p * r) / (x * x + (q - r) * x - q * r);
  const answerExpr = `${fmtBinom('x', p)}/${fmtBinom('x', q)}`;
  const answerLatex = `\\dfrac{${fmtBinom('x', p)}}{${fmtBinom('x', q)}}`;
  return {
    id: 'simplify_rational', label: 'Simplify Rational Expressions',
    prompt: `Simplify \\(\\dfrac{${fmtPoly(numTerms)}}{${fmtPoly(denTerms)}}\\)`,
    fields: [{ id: 'expr', label: 'Simplified expression (in terms of x)', type: 'text' }],
    correctAnswer: { expr: answerExpr },
    check(v) {
      const r2 = checkExpressionEquiv(v.expr, referenceFn, []);
      return { ok: r2.ok, message: r2.ok ? 'Correct!' : (r2.reason === 'unparseable' ? "Couldn't evaluate that expression — use x, +, -, *, /, ^ and parentheses." : 'Not quite — factor numerator and denominator, then cancel common factors.') };
    },
    steps: [
      `Factor numerator: \\(${fmtPoly(numTerms)} = ${fmtBinom('x', -r)}${fmtBinom('x', p)}\\)`,
      `Factor denominator: \\(${fmtPoly(denTerms)} = ${fmtBinom('x', -r)}${fmtBinom('x', q)}\\)`,
      `Cancel the common factor \\(${fmtBinom('x', -r)}\\): result = \\(${answerLatex}\\)`,
      `Note: \\(x \\neq ${r}\\) and \\(x \\neq ${-q}\\)`
    ],
    finalAnswer: `\\(${answerLatex}\\)`,
    chart: (() => {
      const xmin = Math.min(r, -q) - 4, xmax = Math.max(r, -q) + 4;
      return {
        xPlotLines: [{ value: -q, label: `x = ${-q}` }],
        series: [
          { name: 'y = original expression', type: 'line', data: sampleFn(referenceFn, xmin, xmax, { yClip: 25 }), color: '#4a9eff' }
        ],
        revealSeries: [
          { name: `Hole at x = ${r}`, type: 'scatter', data: [{ x: r, y: (r + p) / (r + q) }], color: '#ff6b6b', marker: { symbol: 'circle', radius: 6, fillColor: 'transparent', lineWidth: 2, lineColor: '#ff6b6b' } }
        ]
      };
    })()
  };
}

function genAddRational() {
  let a = rndNonZero(-6, 6), b = rndNonZero(-6, 6);
  if (a === b) b = b > 0 ? b - 1 : b + 1;
  if (b === 0) b = 1;
  const m = rnd(1, 4) * choice([1, -1]);
  const n = rnd(1, 4) * choice([1, -1]);
  const referenceFn = x => m / (x + a) + n / (x + b);
  const numTerms = [{ coef: m + n, pow: 1 }, { coef: m * b + n * a, pow: 0 }];
  const answerExpr = `(${fmtPoly(numTerms)})/(${fmtBinom('x', a)}${fmtBinom('x', b)})`;
  const answerLatex = `\\dfrac{${fmtPoly(numTerms)}}{${fmtBinom('x', a)}${fmtBinom('x', b)}}`;
  return {
    id: 'add_rational', label: 'Add Rational Expressions',
    prompt: `Add \\(\\dfrac{${m}}{${fmtBinom('x', a)}} + \\dfrac{${n}}{${fmtBinom('x', b)}}\\)`,
    fields: [{ id: 'expr', label: 'Combined expression (in terms of x)', type: 'text' }],
    correctAnswer: { expr: answerExpr },
    check(v) {
      const r = checkExpressionEquiv(v.expr, referenceFn, []);
      return { ok: r.ok, message: r.ok ? 'Correct!' : (r.reason === 'unparseable' ? "Couldn't evaluate that expression — use x, +, -, *, /, ^ and parentheses." : 'Not quite — find a common denominator and add the numerators.') };
    },
    steps: [
      `Find the common denominator: \\(${fmtBinom('x', a)}${fmtBinom('x', b)}\\)`,
      `Rewrite: \\(\\dfrac{${m}}{${fmtBinom('x', a)}} = \\dfrac{${m}${fmtBinom('x', b)}}{${fmtBinom('x', a)}${fmtBinom('x', b)}}\\)`,
      `Rewrite: \\(\\dfrac{${n}}{${fmtBinom('x', b)}} = \\dfrac{${n}${fmtBinom('x', a)}}{${fmtBinom('x', a)}${fmtBinom('x', b)}}\\)`,
      `Add numerators: \\(${m}${fmtBinom('x', b)} ${n >= 0 ? '+' : '-'} ${Math.abs(n)}${fmtBinom('x', a)} = ${fmtPoly(numTerms)}\\)`,
      `Result: \\(${answerLatex}\\)`
    ],
    finalAnswer: `\\(${answerLatex}\\)`,
    chart: (() => {
      const xmin = Math.min(-a, -b) - 4, xmax = Math.max(-a, -b) + 4;
      return {
        xPlotLines: [{ value: -a, label: `x = ${-a}` }, { value: -b, label: `x = ${-b}` }],
        series: [
          { name: 'y = combined expression', type: 'line', data: sampleFn(referenceFn, xmin, xmax, { yClip: 25 }), color: '#4a9eff' }
        ],
        revealSeries: []
      };
    })()
  };
}

function genSolveRationalEquation() {
  let a, b, c, B, C, disc, roots;
  let tries = 0;
  do {
    tries++;
    a = rndNonZero(-6, 6); b = rndNonZero(-6, 6);
    if (a === b) b = b > 0 ? b - 1 : b + 1;
    c = rndNonZero(-6, 6);
    B = a + b - 2 * c; C = a * b - c * (a + b);
    disc = B * B - 4 * C;
    if (disc <= 0) { roots = []; continue; }
    const sq = Math.sqrt(disc);
    const x1 = (-B + sq) / 2, x2 = (-B - sq) / 2;
    roots = [x1, x2].filter(r => Math.abs(r + a) > 1e-6 && Math.abs(r + b) > 1e-6);
    const dedup = [];
    for (const r of roots) if (!dedup.some(d => Math.abs(d - r) < 1e-6)) dedup.push(r);
    roots = dedup;
  } while (roots.length === 0 && tries < 80);
  if (roots.length === 0) { a = 0; b = 1; c = 2; B = a + b - 2 * c; C = a * b - c * (a + b); disc = B * B - 4 * C; const sq = Math.sqrt(disc); roots = [(-B + sq) / 2, (-B - sq) / 2]; }
  roots = roots.map(round2).sort((x, y) => x - y);

  return {
    id: 'solve_rational_equation', label: 'Solve Rational Equations',
    prompt: `Solve \\(\\dfrac{1}{${fmtBinom('x', a)}} + \\dfrac{1}{${fmtBinom('x', b)}} = \\dfrac{1}{${c}}\\)`,
    fields: [
      { id: 'x1', label: 'Solution 1', type: 'number' },
      { id: 'x2', label: 'Solution 2 (leave blank if only one)', type: 'number' }
    ],
    correctAnswer: roots.length === 2 ? { x1: String(roots[0]), x2: String(roots[1]) } : { x1: String(roots[0]), x2: '' },
    check(v) {
      const nums = [v.x1, v.x2].map(s => (s === undefined ? '' : String(s).trim())).filter(s => s !== '').map(parseFloat).filter(n => !isNaN(n));
      if (nums.length === 0) return { ok: false, message: 'Enter at least one solution.' };
      const ok = numsMatchSet(nums, roots, 0.05);
      return { ok, message: ok ? 'Correct!' : `Not quite — this equation has ${roots.length} valid solution(s).` };
    },
    steps: [
      `Multiply both sides by \\(${c}${fmtBinom('x', a)}${fmtBinom('x', b)}\\) to clear denominators`,
      `\\(${c}${fmtBinom('x', b)} + ${c}${fmtBinom('x', a)} = ${fmtBinom('x', a)}${fmtBinom('x', b)}\\)`,
      `Expand and simplify: \\(${fmtPoly([{ coef: 1, pow: 2 }, { coef: B, pow: 1 }, { coef: C, pow: 0 }])} = 0\\)`,
      `Use the quadratic formula: \\(x = \\dfrac{${-B} \\pm \\sqrt{${disc}}}{2}\\)`,
      `Solution(s): ${roots.join(' and ')}`
    ],
    finalAnswer: roots.join(', '),
    chart: (() => {
      const lhsFn = x => 1 / (x + a) + 1 / (x + b);
      const xmin = Math.min(-a, -b, ...roots) - 4, xmax = Math.max(-a, -b, ...roots) + 4;
      return {
        xPlotLines: [{ value: -a, label: `x = ${-a}` }, { value: -b, label: `x = ${-b}` }],
        series: [
          { name: 'y = 1/(x+a) + 1/(x+b)', type: 'line', data: sampleFn(lhsFn, xmin, xmax, { yClip: 20 }), color: '#4a9eff' },
          { name: `y = 1/${c}`, type: 'line', data: [{ x: xmin, y: 1 / c }, { x: xmax, y: 1 / c }], color: '#ff9f40', dashStyle: 'Dash' }
        ],
        revealSeries: [
          { name: 'Solutions', type: 'scatter', data: roots.map(r => ({ x: r, y: 1 / c })), color: '#ff6b6b' }
        ]
      };
    })()
  };
}

// ============ Exponential & Logarithmic Functions ============
function genSolveExponential() {
  const base = choice([2, 3, 4, 5, 6]);
  const m = choice([1, 1, 1, 2, 3]);
  const k = rnd(1, 5);
  const value = Math.pow(base, k);
  const x = k / m;
  return {
    id: 'solve_exponential', label: 'Solve Exponential Equations',
    prompt: m === 1 ? `Solve \\(${base}^x = ${value}\\)` : `Solve \\(${base}^{${m}x} = ${value}\\)`,
    fields: [{ id: 'x', label: 'x', type: 'number' }],
    correctAnswer: { x: String(round2(x)) },
    check(v) {
      const u = parseFloat(v.x);
      if (isNaN(u)) return { ok: false, message: 'Enter a number.' };
      const ok = near(u, x, 0.01);
      return { ok, message: ok ? 'Correct!' : `Not quite — rewrite ${value} as a power of ${base}.` };
    },
    steps: m === 1 ? [
      `Recognize \\(${value} = ${base}^{${k}}\\)`,
      `\\(${base}^x = ${base}^{${k}}\\)`,
      `\\(x = ${k}\\)`
    ] : [
      `Recognize \\(${value} = ${base}^{${k}}\\)`,
      `\\(${base}^{${m}x} = ${base}^{${k}}\\)`,
      `\\(${m}x = ${k}\\)`,
      `\\(x = ${round2(x)}\\)`
    ],
    finalAnswer: String(round2(x)),
    chart: (() => {
      const fn = xv => Math.pow(base, m * xv);
      const xmin = Math.min(-1, x - 2), xmax = Math.max(x + 2, 3);
      return {
        series: [
          { name: m === 1 ? `y = ${base}^x` : `y = ${base}^(${m}x)`, type: 'line', data: sampleFn(fn, xmin, xmax, { yClip: value * 3 + 5 }), color: '#4a9eff' }
        ],
        revealSeries: [
          { name: 'Solution', type: 'scatter', data: [{ x: round2(x), y: value }], color: '#ff6b6b' }
        ]
      };
    })()
  };
}

function genSolveLogarithm() {
  const base = choice([2, 3, 4, 5]);
  const k = rnd(1, 4);
  const s = choice([0, 0, 0, 1, -1, 2, -2, 3]);
  const answer = Math.pow(base, k) + s;
  const argStr = s === 0 ? 'x' : `x ${s > 0 ? '- ' + s : '+ ' + Math.abs(s)}`;
  return {
    id: 'solve_logarithm', label: 'Solve Logarithmic Equations',
    prompt: `Solve \\(\\log_{${base}}(${argStr}) = ${k}\\)`,
    fields: [{ id: 'x', label: 'x', type: 'number' }],
    correctAnswer: { x: String(answer) },
    check(v) {
      const u = parseFloat(v.x);
      if (isNaN(u)) return { ok: false, message: 'Enter a number.' };
      const ok = near(u, answer, 0.001);
      return { ok, message: ok ? 'Correct!' : 'Not quite — convert to exponential form first.' };
    },
    steps: [
      `Convert to exponential form: \\(${base}^{${k}} = ${argStr}\\)`,
      `\\(${Math.pow(base, k)} = ${argStr}\\)`,
      `\\(x = ${answer}\\)`
    ],
    finalAnswer: String(answer),
    chart: (() => {
      const fn = xv => Math.log(xv - s) / Math.log(base);
      const xmin = s + 0.15, xmax = answer + Math.max(3, (answer - s) * 0.6);
      return {
        xPlotLines: [{ value: s, label: `x = ${s}` }],
        series: [
          { name: s === 0 ? `y = log_${base}(x)` : `y = log_${base}(x - ${s})`, type: 'line', data: sampleFn(fn, xmin, xmax, { yClip: 15 }), color: '#4a9eff' }
        ],
        revealSeries: [
          { name: 'Solution', type: 'scatter', data: [{ x: answer, y: k }], color: '#ff6b6b' }
        ]
      };
    })()
  };
}

function genLogProperties() {
  const a = rnd(2, 9), b = rnd(2, 9);
  const product = a * b;
  const divs = divisorsOf(product).filter(d => d > 1 && d < product);
  const c = divs.length ? choice(divs) : 1;
  const value = product / c;
  return {
    id: 'log_properties', label: 'Logarithm Properties',
    prompt: `Simplify \\(\\log(${a}) + \\log(${b}) - \\log(${c})\\) into a single \\(\\log(N)\\). Find N.`,
    fields: [{ id: 'N', label: 'N', type: 'number' }],
    correctAnswer: { N: String(value) },
    check(v) {
      const u = parseFloat(v.N);
      if (isNaN(u)) return { ok: false, message: 'Enter a number.' };
      const ok = near(u, value, 0.001);
      return { ok, message: ok ? 'Correct!' : 'Not quite — use log(a)+log(b) = log(ab) and log(a)-log(b) = log(a/b).' };
    },
    steps: [
      `Combine using \\(\\log(a) + \\log(b) = \\log(ab)\\): \\(\\log(${a} \\cdot ${b}) - \\log(${c}) = \\log(${product}) - \\log(${c})\\)`,
      `Combine using \\(\\log(a) - \\log(b) = \\log(a/b)\\): \\(\\log(${product}/${c}) = \\log(${value})\\)`,
      `\\(N = ${value}\\)`
    ],
    finalAnswer: String(value)
  };
}

const LOG_EQ_TABLE = [{ s: 3, e: 1, x: 5 }, { s: 9, e: 1, x: 10 }, { s: 15, e: 2, x: 20 }, { s: 21, e: 2, x: 25 }];
function genLogEquation() {
  const { s, e, x } = choice(LOG_EQ_TABLE);
  return {
    id: 'log_equation', label: 'Logarithmic Equations (properties)',
    prompt: `Solve \\(\\log(x) + \\log(x - ${s}) = ${e}\\)`,
    fields: [{ id: 'x', label: 'x', type: 'number' }],
    correctAnswer: { x: String(x) },
    check(v) {
      const u = parseFloat(v.x);
      if (isNaN(u)) return { ok: false, message: 'Enter a number.' };
      const ok = near(u, x, 0.01);
      return { ok, message: ok ? 'Correct!' : 'Not quite — combine the logs, convert to exponential form, then solve the quadratic (and discard invalid roots).' };
    },
    steps: [
      `Use \\(\\log(a) + \\log(b) = \\log(ab)\\): \\(\\log(x(x - ${s})) = ${e}\\)`,
      `Convert to exponential form: \\(10^{${e}} = x(x - ${s})\\)`,
      `\\(${Math.pow(10, e)} = x^2 - ${s}x\\)`,
      `\\(x^2 - ${s}x - ${Math.pow(10, e)} = 0\\)`,
      `Solving gives \\(x = ${x}\\) (the other root is discarded because it makes a log argument invalid)`
    ],
    finalAnswer: String(x),
    chart: (() => {
      const fn = xv => xv * (xv - s);
      const rhs = Math.pow(10, e);
      const xmin = Math.min(0, s) - 2, xmax = x + 4;
      return {
        series: [
          { name: 'y = x(x - s)', type: 'line', data: sampleFn(fn, xmin, xmax, { yClip: rhs * 2.5 + 10 }), color: '#4a9eff' },
          { name: `y = ${rhs}`, type: 'line', data: [{ x: xmin, y: rhs }, { x: xmax, y: rhs }], color: '#ff9f40', dashStyle: 'Dash' }
        ],
        revealSeries: [
          { name: 'Solution', type: 'scatter', data: [{ x: x, y: rhs }], color: '#ff6b6b' }
        ]
      };
    })()
  };
}

// ============ Conic Sections ============
function genCircle() {
  const h = rnd(-6, 6), k = rnd(-6, 6), r = rnd(2, 7);
  const d = -2 * h, e = -2 * k, f = h * h + k * k - r * r;
  let eqStr = 'x^2 + y^2';
  if (d !== 0) eqStr += (d > 0 ? ' + ' : ' - ') + `${Math.abs(d) === 1 ? '' : Math.abs(d)}x`;
  if (e !== 0) eqStr += (e > 0 ? ' + ' : ' - ') + `${Math.abs(e) === 1 ? '' : Math.abs(e)}y`;
  if (f !== 0) eqStr += (f > 0 ? ' + ' : ' - ') + Math.abs(f);
  eqStr += ' = 0';
  return {
    id: 'circle_standard', label: 'Circle: Standard Form',
    prompt: `Find the center and radius of \\(${eqStr}\\)`,
    fields: [
      { id: 'h', label: 'Center x-coordinate (h)', type: 'number' },
      { id: 'k', label: 'Center y-coordinate (k)', type: 'number' },
      { id: 'r', label: 'Radius (r)', type: 'number' }
    ],
    correctAnswer: { h: String(h), k: String(k), r: String(r) },
    check(v) {
      const uh = parseFloat(v.h), uk = parseFloat(v.k), ur = parseFloat(v.r);
      if ([uh, uk, ur].some(isNaN)) return { ok: false, message: 'Enter numbers for h, k, and r.' };
      const ok = near(uh, h, 0.01) && near(uk, k, 0.01) && near(ur, r, 0.01);
      return { ok, message: ok ? 'Correct!' : 'Not quite — try completing the square for both x and y.' };
    },
    steps: [
      `Group x and y terms: \\((x^2 ${d >= 0 ? '+ ' + d : '- ' + Math.abs(d)}x) + (y^2 ${e >= 0 ? '+ ' + e : '- ' + Math.abs(e)}y) = ${-f}\\)`,
      `Complete the square for x (add ${(d / 2) ** 2}) and for y (add ${(e / 2) ** 2})`,
      `\\((${fmtBinom('x', -h)})^2 + (${fmtBinom('y', -k)})^2 = ${-f + (d / 2) ** 2 + (e / 2) ** 2}\\)`,
      `Center: \\((${h}, ${k})\\), Radius: \\(\\sqrt{${r * r}} = ${r}\\)`
    ],
    finalAnswer: `Center \\((${h}, ${k})\\), Radius ${r}`,
    chart: {
      aspectSquare: true,
      ...squareRangeFromPoints([circlePoints(h, k, r)], 1.5),
      series: [
        { name: 'Circle', type: 'line', data: circlePoints(h, k, r), color: '#4a9eff' }
      ],
      revealSeries: [
        { name: 'Center', type: 'scatter', data: [{ x: h, y: k }], color: '#ff6b6b' },
        { name: 'Radius', type: 'line', data: [{ x: h, y: k }, { x: h + r, y: k }], color: '#ff6b6b', dashStyle: 'Dash', marker: { enabled: false } }
      ]
    }
  };
}

const ELLIPSE_TRIPLES = [[5, 3, 4], [5, 4, 3], [13, 12, 5], [13, 5, 12], [10, 8, 6], [10, 6, 8], [17, 15, 8], [17, 8, 15], [25, 24, 7], [25, 7, 24]];
function genEllipse() {
  const [a, b, c] = choice(ELLIPSE_TRIPLES);
  const xMajor = Math.random() < 0.5;
  const denomX = xMajor ? a * a : b * b;
  const denomY = xMajor ? b * b : a * a;
  const vertices = xMajor ? [{ x: a, y: 0 }, { x: -a, y: 0 }] : [{ x: 0, y: a }, { x: 0, y: -a }];
  const foci = xMajor ? [{ x: c, y: 0 }, { x: -c, y: 0 }] : [{ x: 0, y: c }, { x: 0, y: -c }];
  return {
    id: 'ellipse_properties', label: 'Ellipse Properties',
    prompt: `Find the vertices and foci of \\(\\dfrac{x^2}{${denomX}} + \\dfrac{y^2}{${denomY}} = 1\\)`,
    fields: [
      { id: 'vertices', label: 'Vertices (as "x,y; x,y")', type: 'text' },
      { id: 'foci', label: 'Foci (as "x,y; x,y")', type: 'text' }
    ],
    correctAnswer: { vertices: vertices.map(p => `${p.x},${p.y}`).join('; '), foci: foci.map(p => `${p.x},${p.y}`).join('; ') },
    check(v) {
      const uv = parsePoints(v.vertices), uf = parsePoints(v.foci);
      const okV = pointSetsMatch(uv, vertices), okF = pointSetsMatch(uf, foci);
      const ok = okV && okF;
      let message = 'Correct!';
      if (!ok) message = !okV && !okF ? 'Both vertices and foci look off.' : (!okV ? 'Vertices look off.' : 'Foci look off.');
      return { ok, message };
    },
    steps: [
      xMajor ? `\\(a^2 = ${a * a}\\), so \\(a = ${a}\\) (major axis along x)` : `\\(a^2 = ${a * a}\\), so \\(a = ${a}\\) (major axis along y)`,
      `\\(b^2 = ${b * b}\\), so \\(b = ${b}\\)`,
      `Vertices on the major axis: ${vertices.map(p => `\\((${p.x}, ${p.y})\\)`).join(' and ')}`,
      `\\(c^2 = a^2 - b^2 = ${a * a} - ${b * b} = ${c * c}\\), so \\(c = ${c}\\)`,
      `Foci: ${foci.map(p => `\\((${p.x}, ${p.y})\\)`).join(' and ')}`
    ],
    finalAnswer: `Vertices ${vertices.map(p => `\\((${p.x}, ${p.y})\\)`).join(', ')}; Foci ${foci.map(p => `\\((${p.x}, ${p.y})\\)`).join(', ')}`,
    chart: (() => {
      const ellipsePts = xMajor ? ellipsePoints(0, 0, a, b) : ellipsePoints(0, 0, b, a);
      return {
        aspectSquare: true,
        ...squareRangeFromPoints([ellipsePts], 1.5),
        series: [
          { name: 'Ellipse', type: 'line', data: ellipsePts, color: '#4a9eff' }
        ],
        revealSeries: [
          { name: 'Vertices', type: 'scatter', data: vertices, color: '#ff6b6b' },
          { name: 'Foci', type: 'scatter', data: foci, color: '#35c97f', marker: { symbol: 'diamond' } }
        ]
      };
    })()
  };
}

function genParabola() {
  const p = rnd(1, 6);
  const orientation = choice(['right', 'left', 'up', 'down']);
  let eqStr, focus, directrix, k4p;
  if (orientation === 'right') { k4p = 4 * p; eqStr = `y^2 = ${k4p}x`; focus = { x: p, y: 0 }; directrix = { axis: 'x', value: -p }; }
  else if (orientation === 'left') { k4p = -4 * p; eqStr = `y^2 = ${k4p}x`; focus = { x: -p, y: 0 }; directrix = { axis: 'x', value: p }; }
  else if (orientation === 'up') { k4p = 4 * p; eqStr = `x^2 = ${k4p}y`; focus = { x: 0, y: p }; directrix = { axis: 'y', value: -p }; }
  else { k4p = -4 * p; eqStr = `x^2 = ${k4p}y`; focus = { x: 0, y: -p }; directrix = { axis: 'y', value: p }; }
  return {
    id: 'parabola_standard', label: 'Parabola Properties',
    prompt: `Find the vertex, focus, and directrix of \\(${eqStr}\\)`,
    fields: [
      { id: 'vertex', label: 'Vertex (x,y)', type: 'text' },
      { id: 'focus', label: 'Focus (x,y)', type: 'text' },
      { id: 'directrix', label: 'Directrix (e.g. "x = -2")', type: 'text' }
    ],
    correctAnswer: { vertex: '0,0', focus: `${focus.x},${focus.y}`, directrix: `${directrix.axis} = ${directrix.value}` },
    check(v) {
      const uv = parsePoints(v.vertex)[0], uf = parsePoints(v.focus)[0];
      const ud = parseDirectrix(v.directrix);
      const okV = uv && near(uv.x, 0, 0.01) && near(uv.y, 0, 0.01);
      const okF = uf && near(uf.x, focus.x, 0.01) && near(uf.y, focus.y, 0.01);
      const okD = ud && ud.axis === directrix.axis && near(ud.value, directrix.value, 0.01);
      const ok = okV && okF && okD;
      return { ok, message: ok ? 'Correct!' : 'Not quite — recheck vertex, focus, and directrix against the standard form.' };
    },
    steps: [
      `Standard form has \\(4p = ${orientation === 'left' || orientation === 'down' ? -4 * p : 4 * p}\\), so \\(p = ${p}\\) (orientation: ${orientation})`,
      'Vertex: \\((0, 0)\\)',
      `Focus: \\((${focus.x}, ${focus.y})\\)`,
      `Directrix: \\(${directrix.axis} = ${directrix.value}\\)`
    ],
    finalAnswer: `Vertex \\((0,0)\\), Focus \\((${focus.x},${focus.y})\\), Directrix \\(${directrix.axis} = ${directrix.value}\\)`,
    chart: (() => {
      const curve = parabolaPoints(orientation, k4p);
      const range = squareRangeFromPoints([curve, [focus]], 1.5);
      return {
        aspectSquare: true,
        ...range,
        series: [
          { name: 'Parabola', type: 'line', data: curve, color: '#4a9eff' }
        ],
        revealSeries: [
          { name: 'Vertex', type: 'scatter', data: [{ x: 0, y: 0 }], color: '#35c97f' },
          { name: 'Focus', type: 'scatter', data: [focus], color: '#ff6b6b' }
        ],
        revealXPlotLines: directrix.axis === 'x' ? [{ value: directrix.value, label: `x = ${directrix.value}` }] : [],
        revealYPlotLines: directrix.axis === 'y' ? [{ value: directrix.value, label: `y = ${directrix.value}` }] : []
      };
    })()
  };
}

function genHyperbola() {
  const a = rnd(2, 8);
  let b = rnd(2, 8);
  if (b === a) b = b + 1;
  const xMajor = Math.random() < 0.5;
  let eqStr, vertices, slope;
  if (xMajor) { eqStr = `\\dfrac{x^2}{${a * a}} - \\dfrac{y^2}{${b * b}} = 1`; vertices = [{ x: a, y: 0 }, { x: -a, y: 0 }]; slope = b / a; }
  else { eqStr = `\\dfrac{y^2}{${a * a}} - \\dfrac{x^2}{${b * b}} = 1`; vertices = [{ x: 0, y: a }, { x: 0, y: -a }]; slope = a / b; }
  return {
    id: 'hyperbola_properties', label: 'Hyperbola Properties',
    prompt: `Find the vertices and asymptote slope of \\(${eqStr}\\)`,
    fields: [
      { id: 'vertices', label: 'Vertices (as "x,y; x,y")', type: 'text' },
      { id: 'slope', label: 'Positive asymptote slope (as a decimal)', type: 'number' }
    ],
    correctAnswer: { vertices: vertices.map(p => `${p.x},${p.y}`).join('; '), slope: String(round2(slope)) },
    check(v) {
      const uv = parsePoints(v.vertices);
      const okV = pointSetsMatch(uv, vertices);
      const us = parseFloat(v.slope);
      const okS = !isNaN(us) && near(us, slope, 0.02);
      const ok = okV && okS;
      let message = 'Correct!';
      if (!ok) message = !okV && !okS ? 'Both vertices and slope look off.' : (!okV ? 'Vertices look off.' : 'Asymptote slope looks off.');
      return { ok, message };
    },
    steps: [
      `\\(a^2 = ${a * a}\\), so \\(a = ${a}\\)`,
      `\\(b^2 = ${b * b}\\), so \\(b = ${b}\\)`,
      `Vertices: ${vertices.map(p => `\\((${p.x}, ${p.y})\\)`).join(' and ')}`,
      xMajor ? `Asymptotes: \\(y = \\pm\\dfrac{b}{a}x = \\pm${round2(slope)}x\\)` : `Asymptotes: \\(y = \\pm\\dfrac{a}{b}x = \\pm${round2(slope)}x\\)`
    ],
    finalAnswer: `Vertices ${vertices.map(p => `\\((${p.x}, ${p.y})\\)`).join(', ')}; slope \\(\\pm${round2(slope)}\\)`,
    chart: (() => {
      const branches = hyperbolaPoints(a, b, xMajor);
      const range = squareRangeFromPoints([branches.pos, branches.neg], 2);
      const rng = Math.max(Math.abs(range.xRange[0]), Math.abs(range.xRange[1]));
      return {
        aspectSquare: true,
        ...range,
        series: [
          { name: 'Hyperbola', type: 'line', data: branches.pos, color: '#4a9eff' },
          { name: 'Hyperbola', type: 'line', data: branches.neg, color: '#4a9eff', linkedTo: ':previous', showInLegend: false }
        ],
        revealSeries: [
          { name: 'Vertices', type: 'scatter', data: vertices, color: '#ff6b6b' },
          { name: 'Asymptote', type: 'line', data: [{ x: -rng, y: -rng * slope }, { x: rng, y: rng * slope }], color: '#35c97f', dashStyle: 'Dash', marker: { enabled: false } },
          { name: 'Asymptote', type: 'line', data: [{ x: -rng, y: rng * slope }, { x: rng, y: -rng * slope }], color: '#35c97f', dashStyle: 'Dash', marker: { enabled: false }, linkedTo: ':previous', showInLegend: false }
        ]
      };
    })()
  };
}

// ============ Matrix Algebra ============
function genMatrixMultiply() {
  const A = [[rnd(-5, 5), rnd(-5, 5)], [rnd(-5, 5), rnd(-5, 5)]];
  const B = [[rnd(-5, 5), rnd(-5, 5)], [rnd(-5, 5), rnd(-5, 5)]];
  const C = [
    [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
    [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]
  ];
  return {
    id: 'matrix_multiply', label: 'Matrix Multiplication',
    prompt: `Find \\(AB\\) where \\(A = ${fmtMatrix(A)}\\) and \\(B = ${fmtMatrix(B)}\\)`,
    fields: [
      { id: 'c11', label: 'Row 1, Col 1', type: 'number' }, { id: 'c12', label: 'Row 1, Col 2', type: 'number' },
      { id: 'c21', label: 'Row 2, Col 1', type: 'number' }, { id: 'c22', label: 'Row 2, Col 2', type: 'number' }
    ],
    correctAnswer: { c11: String(C[0][0]), c12: String(C[0][1]), c21: String(C[1][0]), c22: String(C[1][1]) },
    check(v) {
      const vals = ['c11', 'c12', 'c21', 'c22'].map(k => parseFloat(v[k]));
      if (vals.some(isNaN)) return { ok: false, message: 'Fill in all four entries.' };
      const ok = near(vals[0], C[0][0], 0.001) && near(vals[1], C[0][1], 0.001) && near(vals[2], C[1][0], 0.001) && near(vals[3], C[1][1], 0.001);
      return { ok, message: ok ? 'Correct!' : 'Not quite — multiply row of A by column of B for each entry.' };
    },
    steps: [
      'Multiply rows of A by columns of B',
      `Entry (1,1): \\((${A[0][0]} \\times ${B[0][0]}) + (${A[0][1]} \\times ${B[1][0]}) = ${C[0][0]}\\)`,
      `Entry (1,2): \\((${A[0][0]} \\times ${B[0][1]}) + (${A[0][1]} \\times ${B[1][1]}) = ${C[0][1]}\\)`,
      `Entry (2,1): \\((${A[1][0]} \\times ${B[0][0]}) + (${A[1][1]} \\times ${B[1][0]}) = ${C[1][0]}\\)`,
      `Entry (2,2): \\((${A[1][0]} \\times ${B[0][1]}) + (${A[1][1]} \\times ${B[1][1]}) = ${C[1][1]}\\)`
    ],
    finalAnswer: `\\(${fmtMatrix(C)}\\)`,
    chart: (() => {
      const unit = transformSquare(1, 0, 0, 1);
      const img = transformSquare(C[0][0], C[0][1], C[1][0], C[1][1]);
      return {
        aspectSquare: true,
        ...squareRangeFromPoints([unit, img], 1),
        series: [
          { name: 'Unit square', type: 'line', data: unit, color: '#888888', dashStyle: 'Dash', marker: { enabled: false } }
        ],
        revealSeries: [
          { name: 'Square transformed by AB', type: 'line', data: img, color: '#ff6b6b' }
        ]
      };
    })()
  };
}

function genDeterminant() {
  const a = rnd(-6, 6), b = rnd(-6, 6), c = rnd(-6, 6), d = rnd(-6, 6);
  const det = a * d - b * c;
  return {
    id: 'determinant', label: 'Determinants',
    prompt: `Find the determinant of \\(${fmtMatrix([[a, b], [c, d]])}\\)`,
    fields: [{ id: 'det', label: 'Determinant', type: 'number' }],
    correctAnswer: { det: String(det) },
    check(v) {
      const u = parseFloat(v.det);
      if (isNaN(u)) return { ok: false, message: 'Enter a number.' };
      const ok = near(u, det, 0.001);
      return { ok, message: ok ? 'Correct!' : 'Not quite — for [[a,b],[c,d]], det = ad - bc.' };
    },
    steps: [
      `For a 2×2 matrix \\(${fmtMatrix([['a', 'b'], ['c', 'd']])}\\), \\(\\det = ad - bc\\)`,
      `\\(\\det = (${a} \\times ${d}) - (${b} \\times ${c}) = ${a * d} - ${b * c} = ${det}\\)`
    ],
    finalAnswer: String(det),
    chart: (() => {
      const unit = transformSquare(1, 0, 0, 1);
      const img = transformSquare(a, b, c, d);
      return {
        aspectSquare: true,
        ...squareRangeFromPoints([unit, img], 1),
        series: [
          { name: 'Unit square', type: 'line', data: unit, color: '#888888', dashStyle: 'Dash', marker: { enabled: false } }
        ],
        revealSeries: [
          { name: 'Transformed square (area = |det|)', type: 'line', data: img, color: '#ff6b6b' }
        ]
      };
    })()
  };
}

function genMatrixInverse() {
  let a, b, c, d, det;
  let tries = 0;
  do {
    tries++;
    a = choice([1, -1, 2, -2, 3, -3]);
    b = rnd(-4, 4); c = rnd(-4, 4);
    const target = choice([1, -1]);
    const numer = target + b * c;
    if (numer % a === 0) { d = numer / a; det = a * d - b * c; }
    else { d = null; }
  } while (d === null && tries < 200);
  if (d === null) { a = 1; b = rnd(-4, 4); c = rnd(-4, 4); d = 1 + b * c; det = a * d - b * c; }
  const inv = [[d / det, -b / det], [-c / det, a / det]];
  return {
    id: 'matrix_inverse', label: 'Matrix Inverse',
    prompt: `Find the inverse of \\(${fmtMatrix([[a, b], [c, d]])}\\)`,
    fields: [
      { id: 'i11', label: 'Row 1, Col 1', type: 'number' }, { id: 'i12', label: 'Row 1, Col 2', type: 'number' },
      { id: 'i21', label: 'Row 2, Col 1', type: 'number' }, { id: 'i22', label: 'Row 2, Col 2', type: 'number' }
    ],
    correctAnswer: { i11: String(inv[0][0]), i12: String(inv[0][1]), i21: String(inv[1][0]), i22: String(inv[1][1]) },
    check(v) {
      const vals = ['i11', 'i12', 'i21', 'i22'].map(k => parseFloat(v[k]));
      if (vals.some(isNaN)) return { ok: false, message: 'Fill in all four entries.' };
      const ok = near(vals[0], inv[0][0], 0.001) && near(vals[1], inv[0][1], 0.001) && near(vals[2], inv[1][0], 0.001) && near(vals[3], inv[1][1], 0.001);
      return { ok, message: ok ? 'Correct!' : 'Not quite — use A⁻¹ = (1/det)·[[d, -b], [-c, a]].' };
    },
    steps: [
      `\\(\\det = (${a} \\times ${d}) - (${b} \\times ${c}) = ${det}\\)`,
      `\\(A^{-1} = \\dfrac{1}{${det}} ${fmtMatrix([[d, -b], [-c, a]])} = ${fmtMatrix(inv)}\\)`
    ],
    finalAnswer: `\\(${fmtMatrix(inv)}\\)`,
    chart: (() => {
      const unit = transformSquare(1, 0, 0, 1);
      const imgA = transformSquare(a, b, c, d);
      const imgInv = transformSquare(inv[0][0], inv[0][1], inv[1][0], inv[1][1]);
      return {
        aspectSquare: true,
        ...squareRangeFromPoints([unit, imgA, imgInv], 1),
        series: [
          { name: 'Unit square', type: 'line', data: unit, color: '#888888', dashStyle: 'Dash', marker: { enabled: false } },
          { name: 'Square transformed by A', type: 'line', data: imgA, color: '#4a9eff' }
        ],
        revealSeries: [
          { name: 'Square transformed by A⁻¹', type: 'line', data: imgInv, color: '#ff6b6b' }
        ]
      };
    })()
  };
}

// ============ Systems of Equations (Advanced) ============
function fmtLinEq3(a, b, c, rhs) {
  const terms = [];
  if (a !== 0) terms.push({ coef: a, v: 'x' });
  if (b !== 0) terms.push({ coef: b, v: 'y' });
  if (c !== 0) terms.push({ coef: c, v: 'z' });
  let s = '';
  terms.forEach((t, i) => {
    const mag = Math.abs(t.coef);
    const piece = (mag === 1 ? '' : String(mag)) + t.v;
    if (i === 0) s = (t.coef < 0 ? '-' : '') + piece;
    else s += (t.coef < 0 ? ' - ' : ' + ') + piece;
  });
  if (s === '') s = '0';
  return `${s} = ${rhs}`;
}

function genLinear3x3() {
  const x0 = rnd(-5, 5), y0 = rnd(-5, 5), z0 = rnd(-5, 5);
  let rows, D;
  let tries = 0;
  do {
    tries++;
    rows = [];
    for (let i = 0; i < 3; i++) {
      let a, b, c;
      do { a = rnd(-4, 4); b = rnd(-4, 4); c = rnd(-4, 4); } while (a === 0 && b === 0 && c === 0);
      rows.push([a, b, c]);
    }
    D = det3(rows);
  } while (D === 0 && tries < 60);
  const rhs = rows.map(([a, b, c]) => a * x0 + b * y0 + c * z0);
  const Dx = det3([[rhs[0], rows[0][1], rows[0][2]], [rhs[1], rows[1][1], rows[1][2]], [rhs[2], rows[2][1], rows[2][2]]]);
  const Dy = det3([[rows[0][0], rhs[0], rows[0][2]], [rows[1][0], rhs[1], rows[1][2]], [rows[2][0], rhs[2], rows[2][2]]]);
  const Dz = det3([[rows[0][0], rows[0][1], rhs[0]], [rows[1][0], rows[1][1], rhs[1]], [rows[2][0], rows[2][1], rhs[2]]]);
  const eqs = rows.map((r, i) => fmtLinEq3(r[0], r[1], r[2], rhs[i]));
  return {
    id: 'linear_3x3', label: '3×3 Linear Systems',
    prompt: `Solve the system: ${eqs.map(e => `\\(${e}\\)`).join(', ')}`,
    fields: [{ id: 'x', label: 'x', type: 'number' }, { id: 'y', label: 'y', type: 'number' }, { id: 'z', label: 'z', type: 'number' }],
    correctAnswer: { x: String(x0), y: String(y0), z: String(z0) },
    check(v) {
      const ux = parseFloat(v.x), uy = parseFloat(v.y), uz = parseFloat(v.z);
      if ([ux, uy, uz].some(isNaN)) return { ok: false, message: 'Enter numbers for x, y, and z.' };
      const ok = near(ux, x0, 0.01) && near(uy, y0, 0.01) && near(uz, z0, 0.01);
      return { ok, message: ok ? 'Correct!' : 'Not quite — try elimination or Cramer’s rule.' };
    },
    steps: [
      `System: ${eqs.map(e => `\\(${e}\\)`).join('; ')}`,
      `Coefficient determinant \\(D = ${D}\\)`,
      `Replace the x-column with the constants to get \\(D_x = ${Dx}\\); \\(x = D_x/D = ${Dx}/${D} = ${x0}\\)`,
      `Replace the y-column with the constants to get \\(D_y = ${Dy}\\); \\(y = D_y/D = ${Dy}/${D} = ${y0}\\)`,
      `Replace the z-column with the constants to get \\(D_z = ${Dz}\\); \\(z = D_z/D = ${Dz}/${D} = ${z0}\\)`
    ],
    finalAnswer: `\\(x = ${x0}, y = ${y0}, z = ${z0}\\)`
  };
}

function genNonlinearSystem() {
  const p = rnd(1, 7);
  let q = rnd(1, 7);
  if (q === p) q = q < 7 ? q + 1 : q - 1;
  const r2 = p * p + q * q, s = p + q;
  const points = [{ x: p, y: q }, { x: q, y: p }];
  return {
    id: 'nonlinear_system', label: 'Nonlinear Systems',
    prompt: `Solve: \\(x^2 + y^2 = ${r2}\\) and \\(x + y = ${s}\\)`,
    fields: [{ id: 'points', label: 'Solutions (as "x,y; x,y")', type: 'text' }],
    correctAnswer: { points: points.map(pt => `${pt.x},${pt.y}`).join('; ') },
    check(v) {
      const up = parsePoints(v.points);
      const ok = pointSetsMatch(up, points, 0.05);
      return { ok, message: ok ? 'Correct!' : 'Not quite — substitute y = s - x into the circle equation.' };
    },
    steps: [
      `From the linear equation: \\(y = ${s} - x\\)`,
      `Substitute into the circle equation: \\(x^2 + (${s} - x)^2 = ${r2}\\)`,
      `Expand: \\(x^2 + ${s * s} - ${2 * s}x + x^2 = ${r2}\\)`,
      `Divide by 2 and simplify: \\(x^2 - ${s}x + ${p * q} = 0\\)`,
      `Factor: \\((x - ${p})(x - ${q}) = 0\\)`,
      `\\(x = ${p}\\) or \\(x = ${q}\\)`,
      `If \\(x = ${p}\\): \\(y = ${q}\\); if \\(x = ${q}\\): \\(y = ${p}\\)`,
      `Solutions: \\((${p}, ${q})\\) and \\((${q}, ${p})\\)`
    ],
    finalAnswer: `\\((${p}, ${q})\\) and \\((${q}, ${p})\\)`,
    chart: (() => {
      const rad = Math.sqrt(r2);
      const circle = circlePoints(0, 0, rad);
      const range = squareRangeFromPoints([circle, points], 1.5);
      const rng = Math.max(Math.abs(range.xRange[0]), Math.abs(range.xRange[1]));
      return {
        aspectSquare: true,
        ...range,
        series: [
          { name: `Circle: x² + y² = ${r2}`, type: 'line', data: circle, color: '#4a9eff' },
          { name: `Line: x + y = ${s}`, type: 'line', data: [{ x: -rng, y: s + rng }, { x: rng, y: s - rng }], color: '#ff9f40' }
        ],
        revealSeries: [
          { name: 'Intersections', type: 'scatter', data: points, color: '#ff6b6b' }
        ]
      };
    })()
  };
}

const TOPIC_GENERATORS = {
  complexNumbers: [genAddComplex, genMultiplyComplex, genDivideComplex],
  polynomialOperations: [genPolyDivision, genSumDiffCubes, genTrinomialFactor, genRemainderTheorem],
  rationalExpressions: [genSimplifyRational, genAddRational, genSolveRationalEquation],
  exponentialLogarithmic: [genSolveExponential, genSolveLogarithm, genLogProperties, genLogEquation],
  conicSections: [genCircle, genEllipse, genParabola, genHyperbola],
  matrixAlgebra: [genMatrixMultiply, genDeterminant, genMatrixInverse],
  systemsOfEquations: [genLinear3x3, genNonlinearSystem]
};


