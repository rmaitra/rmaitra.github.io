
// ============ Order of Operations ============
function tmplExprBasic() {
  const kind = rnd(1, 4);
  let a, b, c, d, value, promptExpr, steps;
  if (kind === 1) {
    a = rnd(2, 20); b = rnd(2, 9); c = rnd(2, 15); d = rnd(1, 15);
    value = a + b * (c - d);
    promptExpr = `${a} + ${b} \\times (${c} - ${d})`;
    steps = [
      `Parentheses first: ${c} - ${d} = ${c - d}`,
      `Multiply: ${b} \\times ${c - d} = ${b * (c - d)}`,
      `Add: ${a} + ${b * (c - d)} = ${value}`
    ];
  } else if (kind === 2) {
    a = rnd(5, 20); b = rnd(1, a - 1); c = rnd(2, 9); d = rnd(1, 20);
    value = (a - b) * c + d;
    promptExpr = `(${a} - ${b}) \\times ${c} + ${d}`;
    steps = [
      `Parentheses first: ${a} - ${b} = ${a - b}`,
      `Multiply: ${a - b} \\times ${c} = ${(a - b) * c}`,
      `Add: ${(a - b) * c} + ${d} = ${value}`
    ];
  } else if (kind === 3) {
    a = rnd(10, 30); b = rnd(1, 9); c = rnd(1, 9); d = rnd(2, 6);
    value = a - (b + c) * d;
    promptExpr = `${a} - (${b} + ${c}) \\times ${d}`;
    steps = [
      `Parentheses first: ${b} + ${c} = ${b + c}`,
      `Multiply: ${b + c} \\times ${d} = ${(b + c) * d}`,
      `Subtract: ${a} - ${(b + c) * d} = ${value}`
    ];
  } else {
    d = rnd(2, 9); const q = rnd(2, 9); c = d * q; a = rnd(2, 15); b = rnd(2, 9);
    value = a * b - c / d;
    promptExpr = `${a} \\times ${b} - ${c} \\div ${d}`;
    steps = [
      `Multiply: ${a} \\times ${b} = ${a * b}`,
      `Divide: ${c} \\div ${d} = ${c / d}`,
      `Subtract: ${a * b} - ${c / d} = ${value}`
    ];
  }
  return { promptExpr, value, steps };
}

function genEvaluateExpression() {
  const t = tmplExprBasic();
  return {
    id: 'evaluate_expression', label: 'Evaluate an Expression',
    prompt: `Evaluate \\(${t.promptExpr}\\)`,
    fields: [{ id: 'value', label: 'Value', type: 'number' }],
    correctAnswer: { value: String(t.value) },
    check(v) {
      const u = parseFloat(v.value);
      if (isNaN(u)) return { ok: false, message: 'Enter a number.' };
      const ok = near(u, t.value, 0.001);
      return { ok, message: ok ? 'Correct!' : 'Not quite — check your order of operations.' };
    },
    steps: t.steps,
    finalAnswer: `\\(${t.value}\\)`
  };
}

function tmplExprExponent() {
  const kind = rnd(1, 4);
  let promptExpr, value, steps;
  if (kind === 1) {
    const a = rnd(2, 20), b = rnd(2, 6), c = rnd(2, 9);
    value = a + b * b * c;
    promptExpr = `${a} + ${b}^2 \\times ${c}`;
    steps = [
      `Exponent first: ${b}^2 = ${b * b}`,
      `Multiply: ${b * b} \\times ${c} = ${b * b * c}`,
      `Add: ${a} + ${b * b * c} = ${value}`
    ];
  } else if (kind === 2) {
    const sum = rnd(3, 12), sq = sum * sum;
    const divs = divisorsOf(sq).filter(x => x > 1 && x < sq);
    const c = divs.length ? choice(divs) : 1;
    const d = rnd(1, 10);
    value = sq / c - d;
    const a = rnd(1, sum - 1), b = sum - a;
    promptExpr = `(${a} + ${b})^2 \\div ${c} - ${d}`;
    steps = [
      `Parentheses first: ${a} + ${b} = ${sum}`,
      `Exponent: ${sum}^2 = ${sq}`,
      `Divide: ${sq} \\div ${c} = ${sq / c}`,
      `Subtract: ${sq / c} - ${d} = ${value}`
    ];
  } else if (kind === 3) {
    const a = rnd(2, 12), b = rnd(2, 9), c = rnd(2, 9);
    value = a * a - b * c;
    promptExpr = `${a}^2 - ${b} \\times ${c}`;
    steps = [
      `Exponent first: ${a}^2 = ${a * a}`,
      `Multiply: ${b} \\times ${c} = ${b * c}`,
      `Subtract: ${a * a} - ${b * c} = ${value}`
    ];
  } else {
    const a = rnd(5, 15), b = rnd(1, a - 1), c = rnd(1, 20);
    const diff = a - b;
    value = diff * diff + c;
    promptExpr = `(${a} - ${b})^2 + ${c}`;
    steps = [
      `Parentheses first: ${a} - ${b} = ${diff}`,
      `Exponent: ${diff}^2 = ${diff * diff}`,
      `Add: ${diff * diff} + ${c} = ${value}`
    ];
  }
  return { promptExpr, value, steps };
}

function genEvaluateWithExponents() {
  const t = tmplExprExponent();
  return {
    id: 'evaluate_exponents', label: 'Evaluate with Exponents',
    prompt: `Evaluate \\(${t.promptExpr}\\)`,
    fields: [{ id: 'value', label: 'Value', type: 'number' }],
    correctAnswer: { value: String(t.value) },
    check(v) {
      const u = parseFloat(v.value);
      if (isNaN(u)) return { ok: false, message: 'Enter a number.' };
      const ok = near(u, t.value, 0.001);
      return { ok, message: ok ? 'Correct!' : 'Not quite — remember exponents come before multiplication/division.' };
    },
    steps: t.steps,
    finalAnswer: `\\(${t.value}\\)`
  };
}

// ============ Fractions ============
function genAddSubFractions() {
  const b = rnd(2, 10);
  let d = rnd(2, 10);
  while (d === b) d = rnd(2, 10);
  const a = rnd(1, 9);
  const c = rnd(1, 9);
  const isAdd = choice([true, false]);
  const rawNum = isAdd ? (a * d + c * b) : (a * d - c * b);
  const rawDen = b * d;
  const { num, den } = reduceFraction(rawNum, rawDen);
  const op = isAdd ? '+' : '-';
  return {
    id: 'add_sub_fractions', label: 'Add or Subtract Fractions',
    prompt: `${isAdd ? 'Add' : 'Subtract'} \\(\\dfrac{${a}}{${b}} ${op} \\dfrac{${c}}{${d}}\\). Give your answer as a fraction in lowest terms.`,
    fields: [{ id: 'num', label: 'Numerator', type: 'number' }, { id: 'den', label: 'Denominator', type: 'number' }],
    correctAnswer: { num: String(num), den: String(den) },
    check(v) {
      const r = checkReducedFraction(v.num, v.den, num, den);
      const messages = { invalid: 'Enter whole numbers for numerator and denominator.', wrong: 'Not quite — recheck your common denominator.', unreduced: 'Right value, but reduce the fraction to lowest terms.', match: 'Correct!' };
      return { ok: r.reason === 'match', message: messages[r.reason] };
    },
    steps: [
      `Common denominator of ${b} and ${d} is ${rawDen}`,
      `Rewrite: \\(\\dfrac{${a}}{${b}} = \\dfrac{${a * d}}{${rawDen}}\\), \\(\\dfrac{${c}}{${d}} = \\dfrac{${c * b}}{${rawDen}}\\)`,
      `${isAdd ? 'Add' : 'Subtract'} numerators: ${a * d} ${op} ${c * b} = ${rawNum}`,
      `Reduce: \\(\\dfrac{${rawNum}}{${rawDen}} = \\dfrac{${num}}{${den}}\\)`
    ],
    finalAnswer: `\\(\\dfrac{${num}}{${den}}\\)`
  };
}

function genMultiplyDivideFractions() {
  const a = rnd(1, 9), b = rnd(2, 10);
  const c = rnd(1, 9), d = rnd(2, 10);
  const isMul = choice([true, false]);
  const rawNum = isMul ? a * c : a * d;
  const rawDen = isMul ? b * d : b * c;
  const { num, den } = reduceFraction(rawNum, rawDen);
  const opWord = isMul ? 'Multiply' : 'Divide';
  const opSym = isMul ? '\\times' : '\\div';
  return {
    id: 'multiply_divide_fractions', label: 'Multiply or Divide Fractions',
    prompt: `${opWord} \\(\\dfrac{${a}}{${b}} ${opSym} \\dfrac{${c}}{${d}}\\). Give your answer as a fraction in lowest terms.`,
    fields: [{ id: 'num', label: 'Numerator', type: 'number' }, { id: 'den', label: 'Denominator', type: 'number' }],
    correctAnswer: { num: String(num), den: String(den) },
    check(v) {
      const r = checkReducedFraction(v.num, v.den, num, den);
      const messages = { invalid: 'Enter whole numbers for numerator and denominator.', wrong: 'Not quite — recheck your multiplication.', unreduced: 'Right value, but reduce the fraction to lowest terms.', match: 'Correct!' };
      return { ok: r.reason === 'match', message: messages[r.reason] };
    },
    steps: isMul ? [
      `Multiply straight across: numerators ${a} \\times ${c} = ${a * c}, denominators ${b} \\times ${d} = ${b * d}`,
      `Reduce: \\(\\dfrac{${a * c}}{${b * d}} = \\dfrac{${num}}{${den}}\\)`
    ] : [
      `Flip the second fraction: \\(\\dfrac{${c}}{${d}} \\to \\dfrac{${d}}{${c}}\\)`,
      `Multiply: \\(\\dfrac{${a}}{${b}} \\times \\dfrac{${d}}{${c}} = \\dfrac{${a * d}}{${b * c}}\\)`,
      `Reduce: \\(\\dfrac{${a * d}}{${b * c}} = \\dfrac{${num}}{${den}}\\)`
    ],
    finalAnswer: `\\(\\dfrac{${num}}{${den}}\\)`
  };
}

// ============ Decimals ============
function genAddSubDecimals() {
  const a = round2(rnd(0, 2000) / 100);
  const b = round2(rnd(0, 2000) / 100);
  const isAdd = choice([true, false]);
  const value = round2(isAdd ? a + b : a - b);
  const op = isAdd ? '+' : '-';
  return {
    id: 'add_sub_decimals', label: 'Add or Subtract Decimals',
    prompt: `Evaluate \\(${a} ${op} ${b}\\)`,
    fields: [{ id: 'value', label: 'Value', type: 'number' }],
    correctAnswer: { value: String(value) },
    check(v) {
      const u = parseFloat(v.value);
      if (isNaN(u)) return { ok: false, message: 'Enter a number.' };
      const ok = near(u, value, 0.005);
      return { ok, message: ok ? 'Correct!' : 'Not quite — line up the decimal points and try again.' };
    },
    steps: [
      `Line up the decimal points: ${a} and ${b}`,
      `${isAdd ? 'Add' : 'Subtract'}: ${a} ${op} ${b} = ${value}`
    ],
    finalAnswer: `\\(${value}\\)`
  };
}

function genMultiplyDivideDecimals() {
  const isMul = choice([true, false]);
  if (isMul) {
    const a = round2(rnd(10, 200) / 10);
    const b = round2(rnd(10, 90) / 10);
    const value = round2(a * b);
    return {
      id: 'multiply_divide_decimals', label: 'Multiply or Divide Decimals',
      prompt: `Evaluate \\(${a} \\times ${b}\\)`,
      fields: [{ id: 'value', label: 'Value', type: 'number' }],
      correctAnswer: { value: String(value) },
      check(v) {
        const u = parseFloat(v.value);
        if (isNaN(u)) return { ok: false, message: 'Enter a number.' };
        const ok = near(u, value, 0.01);
        return { ok, message: ok ? 'Correct!' : 'Not quite — recheck your multiplication and decimal placement.' };
      },
      steps: [
        `Multiply as whole numbers, ignoring the decimals`,
        `Count the total decimal places in both factors, then place the decimal point in the result`,
        `\\(${a} \\times ${b} = ${value}\\)`
      ],
      finalAnswer: `\\(${value}\\)`
    };
  } else {
    const divisor = round2(rnd(2, 20) / 10);
    const quotient = rnd(2, 20);
    const dividend = round2(divisor * quotient);
    return {
      id: 'multiply_divide_decimals', label: 'Multiply or Divide Decimals',
      prompt: `Evaluate \\(${dividend} \\div ${divisor}\\)`,
      fields: [{ id: 'value', label: 'Value', type: 'number' }],
      correctAnswer: { value: String(quotient) },
      check(v) {
        const u = parseFloat(v.value);
        if (isNaN(u)) return { ok: false, message: 'Enter a number.' };
        const ok = near(u, quotient, 0.01);
        return { ok, message: ok ? 'Correct!' : 'Not quite — try shifting the decimal point so the divisor is a whole number.' };
      },
      steps: [
        `Shift the decimal point in both numbers so the divisor becomes a whole number`,
        `\\(${dividend} \\div ${divisor} = ${quotient}\\)`
      ],
      finalAnswer: `\\(${quotient}\\)`
    };
  }
}

// ============ Percentages ============
function genPercentOf() {
  const pct = rnd(1, 19) * 5;
  const base = rnd(2, 40) * 5;
  const value = round2(pct / 100 * base);
  return {
    id: 'percent_of', label: 'Percent of a Number',
    prompt: `What is ${pct}% of ${base}?`,
    fields: [{ id: 'value', label: 'Value', type: 'number' }],
    correctAnswer: { value: String(value) },
    check(v) {
      const u = parseFloat(v.value);
      if (isNaN(u)) return { ok: false, message: 'Enter a number.' };
      const ok = near(u, value, 0.01);
      return { ok, message: ok ? 'Correct!' : 'Not quite — convert the percent to a decimal, then multiply.' };
    },
    steps: [
      `Convert ${pct}% to a decimal: ${pct / 100}`,
      `Multiply: ${pct / 100} \\times ${base} = ${value}`
    ],
    finalAnswer: `\\(${value}\\)`
  };
}

function genPercentChange() {
  const oldV = rnd(4, 40) * 5;
  const pctChange = choice([10, 20, 25, 50, -10, -20, -25, -50]);
  const newV = round2(oldV * (1 + pctChange / 100));
  const value = round2((newV - oldV) / oldV * 100);
  return {
    id: 'percent_change', label: 'Percent Change',
    prompt: `A value changes from ${oldV} to ${newV}. Find the percent change. (Use a negative number for a decrease.)`,
    fields: [{ id: 'value', label: 'Percent change', type: 'number' }],
    correctAnswer: { value: String(value) },
    check(v) {
      const u = parseFloat(v.value);
      if (isNaN(u)) return { ok: false, message: 'Enter a number (use a minus sign for a decrease).' };
      const ok = near(u, value, 0.5);
      return { ok, message: ok ? 'Correct!' : 'Not quite — percent change = (new − old) ÷ old × 100.' };
    },
    steps: [
      `Find the difference: ${newV} - ${oldV} = ${round2(newV - oldV)}`,
      `Divide by the original: ${round2(newV - oldV)} \\div ${oldV} = ${round2((newV - oldV) / oldV)}`,
      `Convert to a percent: ${value}%`
    ],
    finalAnswer: `\\(${value}\\%\\)`
  };
}

// ============ Ratios & Proportions ============
function genSimplifyRatio() {
  const g = rnd(2, 9);
  let m = rnd(1, 10), n = rnd(1, 10);
  while (gcd(m, n) !== 1) { m = rnd(1, 10); n = rnd(1, 10); }
  const a = m * g, b = n * g;
  return {
    id: 'simplify_ratio', label: 'Simplify a Ratio',
    prompt: `Simplify the ratio ${a}:${b}`,
    fields: [{ id: 'num', label: 'First term', type: 'number' }, { id: 'den', label: 'Second term', type: 'number' }],
    correctAnswer: { num: String(m), den: String(n) },
    check(v) {
      const r = checkReducedFraction(v.num, v.den, m, n);
      const messages = { invalid: 'Enter whole numbers for both terms.', wrong: 'Not quite — divide both terms by their greatest common divisor.', unreduced: 'Right proportion, but reduce further to lowest terms.', match: 'Correct!' };
      return { ok: r.reason === 'match', message: messages[r.reason] };
    },
    steps: [
      `Find the GCD of ${a} and ${b}: ${g}`,
      `Divide both terms by ${g}: ${a}/${g} = ${m}, ${b}/${g} = ${n}`,
      `Simplified ratio: ${m}:${n}`
    ],
    finalAnswer: `${m}:${n}`
  };
}

function genSolveProportion() {
  const a = rnd(1, 12), b = rnd(2, 9), k = rnd(2, 8);
  const d = b * k, x = a * k;
  return {
    id: 'solve_proportion', label: 'Solve a Proportion',
    prompt: `Solve for x: \\(\\dfrac{${a}}{${b}} = \\dfrac{x}{${d}}\\)`,
    fields: [{ id: 'x', label: 'x', type: 'number' }],
    correctAnswer: { x: String(x) },
    check(v) {
      const u = parseFloat(v.x);
      if (isNaN(u)) return { ok: false, message: 'Enter a number.' };
      const ok = near(u, x, 0.001);
      return { ok, message: ok ? 'Correct!' : 'Not quite — cross-multiply and solve for x.' };
    },
    steps: [
      `Cross-multiply: ${a} \\times ${d} = ${b} \\times x`,
      `${a * d} = ${b}x`,
      `Divide both sides by ${b}: x = ${x}`
    ],
    finalAnswer: `\\(x = ${x}\\)`
  };
}

// ============ Integers ============
function genAddSubIntegers() {
  const a = rndNonZero(-20, 20);
  const b = rndNonZero(-20, 20);
  const isAdd = choice([true, false]);
  const value = isAdd ? a + b : a - b;
  const op = isAdd ? '+' : '-';
  const bDisplay = b < 0 ? `(${b})` : `${b}`;
  return {
    id: 'add_sub_integers', label: 'Add or Subtract Integers',
    prompt: `Evaluate \\(${a} ${op} ${bDisplay}\\)`,
    fields: [{ id: 'value', label: 'Value', type: 'number' }],
    correctAnswer: { value: String(value) },
    check(v) {
      const u = parseFloat(v.value);
      if (isNaN(u)) return { ok: false, message: 'Enter a number.' };
      const ok = near(u, value, 0.001);
      return { ok, message: ok ? 'Correct!' : 'Not quite — watch your signs.' };
    },
    steps: isAdd ? [
      `Add: ${a} + ${bDisplay} = ${value}`
    ] : (b < 0 ? [
      `Subtracting a negative is the same as adding: ${a} - (${b}) = ${a} + ${-b}`,
      `${a} + ${-b} = ${value}`
    ] : [
      `Subtract: ${a} - ${b} = ${value}`
    ]),
    finalAnswer: `\\(${value}\\)`
  };
}

function genMultiplyDivideIntegers() {
  const isMul = choice([true, false]);
  if (isMul) {
    const a = rndNonZero(-12, 12), b = rndNonZero(-12, 12);
    const value = a * b;
    const sameSign = (a < 0) === (b < 0);
    return {
      id: 'multiply_divide_integers', label: 'Multiply or Divide Integers',
      prompt: `Evaluate \\((${a}) \\times (${b})\\)`,
      fields: [{ id: 'value', label: 'Value', type: 'number' }],
      correctAnswer: { value: String(value) },
      check(v) {
        const u = parseFloat(v.value);
        if (isNaN(u)) return { ok: false, message: 'Enter a number.' };
        const ok = near(u, value, 0.001);
        return { ok, message: ok ? 'Correct!' : 'Not quite — same signs give a positive result, different signs give a negative result.' };
      },
      steps: [
        `${sameSign ? 'Same signs' : 'Different signs'} means the result is ${sameSign ? 'positive' : 'negative'}`,
        `${Math.abs(a)} \\times ${Math.abs(b)} = ${Math.abs(value)}`,
        `Result: ${value}`
      ],
      finalAnswer: `\\(${value}\\)`
    };
  } else {
    const divisor = rndNonZero(-12, 12);
    const quotient = rndNonZero(-12, 12);
    const dividend = divisor * quotient;
    const sameSign = (divisor < 0) === (quotient < 0);
    return {
      id: 'multiply_divide_integers', label: 'Multiply or Divide Integers',
      prompt: `Evaluate \\((${dividend}) \\div (${divisor})\\)`,
      fields: [{ id: 'value', label: 'Value', type: 'number' }],
      correctAnswer: { value: String(quotient) },
      check(v) {
        const u = parseFloat(v.value);
        if (isNaN(u)) return { ok: false, message: 'Enter a number.' };
        const ok = near(u, quotient, 0.001);
        return { ok, message: ok ? 'Correct!' : 'Not quite — same signs give a positive result, different signs give a negative result.' };
      },
      steps: [
        `${sameSign ? 'Same signs' : 'Different signs'} means the result is ${sameSign ? 'positive' : 'negative'}`,
        `${Math.abs(dividend)} \\div ${Math.abs(divisor)} = ${Math.abs(quotient)}`,
        `Result: ${quotient}`
      ],
      finalAnswer: `\\(${quotient}\\)`
    };
  }
}

// ============ Exponents & Roots ============
function genEvaluatePower() {
  const base = rndNonZero(-9, 9);
  const exp = rnd(2, 4);
  const value = Math.pow(base, exp);
  return {
    id: 'evaluate_power', label: 'Evaluate a Power',
    prompt: `Evaluate \\((${base})^{${exp}}\\)`,
    fields: [{ id: 'value', label: 'Value', type: 'number' }],
    correctAnswer: { value: String(value) },
    check(v) {
      const u = parseFloat(v.value);
      if (isNaN(u)) return { ok: false, message: 'Enter a number.' };
      const ok = near(u, value, 0.001);
      return { ok, message: ok ? 'Correct!' : (base < 0 ? 'Not quite — a negative base to an even power is positive; to an odd power it stays negative.' : 'Not quite — multiply the base by itself the given number of times.') };
    },
    steps: [
      `\\((${base})^{${exp}} = ${Array(exp).fill(`(${base})`).join(' \\times ')}\\)`,
      `Result: ${value}`
    ],
    finalAnswer: `\\(${value}\\)`
  };
}

function genSquareCubeRoot() {
  const isSquare = choice([true, false]);
  if (isSquare) {
    const root = rnd(2, 15);
    const n = root * root;
    return {
      id: 'square_cube_root', label: 'Square or Cube Root',
      prompt: `Find \\(\\sqrt{${n}}\\)`,
      fields: [{ id: 'value', label: 'Value', type: 'number' }],
      correctAnswer: { value: String(root) },
      check(v) {
        const u = parseFloat(v.value);
        if (isNaN(u)) return { ok: false, message: 'Enter a number.' };
        const ok = near(u, root, 0.001);
        return { ok, message: ok ? 'Correct!' : `Not quite — find the number that squares to ${n}.` };
      },
      steps: [
        `Find a number that squares to ${n}`,
        `${root} \\times ${root} = ${n}, so \\(\\sqrt{${n}} = ${root}\\)`
      ],
      finalAnswer: `\\(${root}\\)`
    };
  } else {
    const root = rndNonZero(-10, 10);
    const n = root * root * root;
    return {
      id: 'square_cube_root', label: 'Square or Cube Root',
      prompt: `Find the cube root of ${n}`,
      fields: [{ id: 'value', label: 'Value', type: 'number' }],
      correctAnswer: { value: String(root) },
      check(v) {
        const u = parseFloat(v.value);
        if (isNaN(u)) return { ok: false, message: 'Enter a number.' };
        const ok = near(u, root, 0.001);
        return { ok, message: ok ? 'Correct!' : `Not quite — find the number that cubes to ${n}.` };
      },
      steps: [
        `Find a number that cubes to ${n}`,
        `(${root}) \\times (${root}) \\times (${root}) = ${n}, so the cube root of ${n} is ${root}`
      ],
      finalAnswer: `\\(${root}\\)`
    };
  }
}

const ARITHMETIC_GENERATORS = {
  orderOfOperations: [genEvaluateExpression, genEvaluateWithExponents],
  fractions: [genAddSubFractions, genMultiplyDivideFractions],
  decimals: [genAddSubDecimals, genMultiplyDivideDecimals],
  percentages: [genPercentOf, genPercentChange],
  ratiosProportions: [genSimplifyRatio, genSolveProportion],
  integers: [genAddSubIntegers, genMultiplyDivideIntegers],
  exponentsRoots: [genEvaluatePower, genSquareCubeRoot]
};
