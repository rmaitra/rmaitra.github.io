// ============ Stories ============
// History-of-mathematics lessons (see STORIES.md). The lesson player follows the
// Italiano Studio pattern: a lesson is a list of steps, flattened into "beats";
// each press of Next reveals one beat at the bottom of the page. Problems,
// quick checks, widgets and dialogue turns hold Next until they are answered.
// Nothing here is scored: in-story problems are checked, never recorded.
//
// No DOM access happens at load time, so tools/check-stories.mjs can load this
// file in Node and reuse the answer checker.
(function () {
  'use strict';

  const STORE_KEY = 'mathStudio.stories.v1';
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

  let data = null;
  let root = null;
  let hooks = {};
  let state = null;
  let keyHandler = null;

  // ---------- helpers ----------
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === 'class') el.className = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (v === true) el.setAttribute(k, '');
      else if (v !== false && v != null) el.setAttribute(k, v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid);
    return el;
  }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  // Text markup: \( … \) is KaTeX (rendered after insertion), *term* is a highlighted key term
  function rich(text) {
    const out = [];
    String(text || '').split(/(\\\(.*?\\\))/).forEach((part, i) => {
      if (i % 2) { out.push(part); return; }
      part.split(/\*([^*]+)\*/).forEach((t, j) => {
        if (t === '') return;
        out.push(j % 2 ? h('em', { class: 'term' }, t) : t);
      });
    });
    return out;
  }
  function math(el) {
    if (typeof renderMathInElement !== 'function') return;
    try {
      renderMathInElement(el, {
        delimiters: [{ left: '\\(', right: '\\)', display: false }],
        throwOnError: false
      });
    } catch (e) { /* plain text is still readable */ }
  }
  function tex(src, display) {
    const span = h('span', { class: 'tex' });
    if (typeof katex !== 'undefined') {
      try { katex.render(src, span, { displayMode: !!display, throwOnError: false }); return span; } catch (e) { /* fall through */ }
    }
    span.textContent = src;
    return span;
  }

  // ---------- answer checking (pure; also used by tools/check-stories.mjs) ----------
  function parseNum(raw) {
    if (raw == null) return NaN;
    const s = String(raw).trim().replace(/[−–]/g, '-').replace(/,/g, '').replace(/\s+/g, '');
    if (s === '') return NaN;
    const frac = s.match(/^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
    if (frac) return parseFloat(frac[1]) / parseFloat(frac[2]);
    return /^-?(\d+\.?\d*|\.\d+)$/.test(s) ? parseFloat(s) : NaN;
  }
  function parseList(raw) {
    return String(raw || '').split(/\s*(?:[,;]|\band\b|\bor\b)\s*/i).filter((s) => s.trim() !== '').map((s) => parseNum(s));
  }
  const near = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
  function sameSet(got, want, tol) {
    if (got.length !== want.length) return false;
    const a = got.slice().sort((p, q) => p - q), b = want.slice().sort((p, q) => p - q);
    return a.every((v, i) => near(v, b[i], tol));
  }
  // Returns { ok, message } for a problem step and the raw field values
  function checkAnswer(problem, values) {
    const tol = problem.tol != null ? problem.tol : 1e-6;
    const field = problem.fields[0].id;
    if (problem.check === 'set') {
      const got = parseList(values[field]);
      if (!got.length || got.some(isNaN)) return { ok: false, message: 'Enter numbers separated by commas, like 2, 5.' };
      if (sameSet(got, problem.answer[field], tol)) return { ok: true };
      const m = (problem.mistakes || []).find((mk) => sameSet(got, mk.value, tol));
      return { ok: false, message: m ? m.say : 'Not quite. Check each answer in the equation, or take a hint.' };
    }
    // 'number': every field must match
    for (const f of problem.fields) {
      const v = parseNum(values[f.id]);
      if (isNaN(v)) return { ok: false, message: 'Enter a number (like 3, -2, 1.5 or 7/2).' };
    }
    const allRight = problem.fields.every((f) => near(parseNum(values[f.id]), problem.answer[f.id], tol));
    if (allRight) return { ok: true };
    const first = parseNum(values[field]);
    const m = (problem.mistakes || []).find((mk) => near(first, mk.value, tol));
    return { ok: false, message: m ? m.say : 'Not quite. Try again, or take a hint.' };
  }
  // ---------- calculator (pure; also used by tools/check-stories.mjs) ----------
  // A small recursive-descent evaluator for the in-problem calculator. It understands
  // numbers (commas allowed as thousands separators), + − × ÷ (or * /), brackets,
  // ^ and ² for powers, √ (or sqrt) and Ans. Nothing typed is ever run as code.
  // Returns a finite number, or throws an Error with a short reason.
  function calcEval(src, ans) {
    const s = String(src || '')
      .replace(/[−–]/g, '-').replace(/×/g, '*').replace(/÷/g, '/')
      .replace(/sqrt/gi, '√').replace(/\s+/g, '');
    let i = 0;
    const peek = () => s[i];
    const fail = (msg) => { throw new Error(msg); };
    function number() {
      const m = s.slice(i).match(/^(\d{1,3}(,\d{3})+|\d+)(\.\d+)?|^\.\d+/);
      if (!m) return null;
      i += m[0].length;
      return parseFloat(m[0].replace(/,/g, ''));
    }
    // primary: number | Ans | ( expr ) | √ primary
    function primary() {
      const c = peek();
      if (c === '(') {
        i++;
        const v = expr();
        if (peek() !== ')') fail('missing )');
        i++;
        return v;
      }
      if (c === '√') { i++; const v = postfix(); if (v < 0) fail('√ of a negative'); return Math.sqrt(v); }
      if (/^ans/i.test(s.slice(i, i + 3))) {
        i += 3;
        if (ans == null) fail('no answer yet');
        return ans;
      }
      const n = number();
      if (n == null) fail(c ? `unexpected “${c}”` : 'incomplete');
      return n;
    }
    function postfix() {
      let v = primary();
      while (peek() === '²') { i++; v = v * v; }
      return v;
    }
    // power is right-associative and binds tighter than a leading minus: -2^2 = -4
    function power() {
      const base = postfix();
      if (peek() === '^') { i++; return Math.pow(base, unary()); }
      return base;
    }
    function unary() {
      if (peek() === '-') { i++; return -unary(); }
      if (peek() === '+') { i++; return unary(); }
      return power();
    }
    // term: products and quotients, with implicit multiplication like 2(3) or 2√9
    function term() {
      let v = unary();
      for (;;) {
        const c = peek();
        if (c === '*') { i++; v *= unary(); }
        else if (c === '/') { i++; const d = unary(); if (d === 0) fail('division by zero'); v /= d; }
        else if (c === '(' || c === '√' || (c && /^ans/i.test(s.slice(i, i + 3)))) v *= unary();
        else return v;
      }
    }
    function expr() {
      let v = term();
      for (;;) {
        const c = peek();
        if (c === '+') { i++; v += term(); }
        else if (c === '-') { i++; v -= term(); }
        else return v;
      }
    }
    if (!s) fail('empty');
    const v = expr();
    if (i < s.length) fail(`unexpected “${s[i]}”`);
    if (!isFinite(v)) fail('too big');
    return v;
  }
  // Drop floating-point noise (0.1 + 0.2) and show thousands separators
  const calcClean = (v) => parseFloat(v.toPrecision(12));
  const calcShow = (v) => calcClean(v).toLocaleString('en-US', { maximumFractionDigits: 10 });
  // Show an expression the way it's typed on the keys: × ÷ − with spaces
  const prettyCalc = (s) => String(s).replace(/\*/g, ' × ').replace(/\//g, ' ÷ ').replace(/([\d)²])\s*-/g, '$1 − ').replace(/\+/g, ' + ').replace(/\s+/g, ' ').trim();

  function answerText(problem) {
    return problem.fields.map((f) => {
      const a = problem.answer[f.id];
      return Array.isArray(a) ? a.join(', ') : String(a);
    });
  }

  // ---------- persistence ----------
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(STORE_KEY));
      if (s && typeof s === 'object') return { lessons: {}, lesson: null, view: 'time', ...s };
    } catch (e) { /* storage unavailable or corrupt */ }
    return { lessons: {}, lesson: null, view: 'time' };
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }
  const progress = (id) => state.lessons[id] || { pos: 0, done: false };
  function setProgress(id, patch) {
    state.lessons[id] = { ...progress(id), ...patch };
    save();
  }

  // ---------- data ----------
  const lessons = () => data.lessons.slice().sort((a, b) => a.order - b.order);
  const isBuilt = (l) => !!(data.content && data.content[l.id]);
  const fullLesson = (l) => ({ ...l, ...data.content[l.id] });
  const actOf = (l) => data.acts.find((a) => a.id === l.act);
  const actNumber = (l) => ROMAN[data.acts.indexOf(actOf(l))];
  const strandLabel = (id) => (data.strands.find((s) => s.id === id) || {}).label || id;

  // One beat per press of Next. Derivations reveal a line per beat. A dialogue with
  // `practice` turns each of that speaker's lines into a choice, shown together with
  // the lines leading up to it.
  function lessonBeats(lesson) {
    const beats = [];
    for (const step of lesson.steps) {
      if (step.type === 'derive') {
        step.lines.forEach((line, i) => beats.push({ kind: 'derive', step, line, first: i === 0, last: i === step.lines.length - 1 }));
      } else if (step.type === 'dialogue') {
        let before = [];
        let first = true;
        for (const line of step.lines) {
          if (step.practice && line.s === step.practice) {
            beats.push({ kind: 'turn', step, line, before, first });
            before = [];
            first = false;
          } else before.push(line);
        }
        if (before.length) beats.push({ kind: 'lines', step, lines: before, first });
      } else beats.push({ kind: step.type, step });
    }
    beats.push({ kind: 'recap' });
    return beats;
  }

  // ---------- home: the timeline ----------
  function renderHome() {
    const all = lessons();
    const ready = all.filter(isBuilt).length;
    const view = state.view === 'strand' ? 'strand' : 'time';
    const pill = (id, label) => h('button', { class: 'pill' + (view === id ? ' active' : ''), onclick: () => { state.view = id; save(); render(); } }, label);

    root.append(
      h('header', { class: 'st-home-head' },
        h('h2', { class: 'st-tagline' }, 'A finite journey through infinite ideas.'),
        h('p', { class: 'st-intro' }, 'Mathematics and physics, told through the people who worked them out. Each lesson puts you in a real time and place, has you solve the problem they faced, then shows where the same idea is used today.'),
        h('div', { class: 'st-home-bar' },
          h('div', { class: 'pills' }, pill('time', 'By time'), pill('strand', 'By strand')),
          h('span', { class: 'st-count' }, `${ready} of ${all.length} lessons ready · the rest are planned`))));

    const card = (l) => {
      const built = isBuilt(l);
      const p = progress(l.id);
      const started = built && !p.done && p.pos > 0;
      const status = !built ? 'Coming later' : p.done ? 'Review ✓' : started ? 'Continue' : 'Start';
      const body = [
        h('span', { class: 'tl-year' }, l.year),
        h('span', { class: 'tl-body' },
          h('span', { class: 'tl-title' }, h('span', { class: 'tl-num' }, `${l.order}.`), ' ', l.title),
          h('span', { class: 'tl-meta' }, [l.place, ...(l.people.length ? [l.people.join(', ')] : [])].join(' · ')),
          h('span', { class: 'tl-strands' }, l.strands.map((s) => h('span', { class: 'chip chip-' + s }, strandLabel(s)))),
          started ? h('span', { class: 'meter' }, h('span', { style: `width:${Math.round(100 * (p.pos + 1) / lessonBeats(fullLesson(l)).length)}%` })) : null),
        h('span', { class: 'tl-go' }, status)
      ];
      const cls = 'tl-card' + (built ? '' : ' locked') + (p.done ? ' done' : '') + (l.review ? ' review' : '');
      return h('li', { class: 'tl-item' }, built
        ? h('button', { class: cls, onclick: () => openLesson(l.id) }, body)
        : h('div', { class: cls, title: 'Planned. Not built yet.', 'aria-disabled': 'true' }, body));
    };

    const readyNow = all.filter(isBuilt);
    if (readyNow.length) {
      root.append(h('section', { class: 'tl-ready' },
        h('h3', { class: 'tl-act-head' }, 'Ready now', h('span', {}, 'grey lessons below are planned')),
        h('ol', { class: 'tl-list flat' }, readyNow.map(card))));
    }

    if (view === 'time') {
      for (const act of data.acts) {
        const items = all.filter((l) => l.act === act.id);
        root.append(h('section', { class: 'tl-act' },
          h('h3', { class: 'tl-act-head' }, `Act ${ROMAN[data.acts.indexOf(act)]} · ${act.title}`, h('span', {}, act.span)),
          h('ol', { class: 'tl-list' }, items.map(card))));
      }
    } else {
      for (const strand of data.strands) {
        const items = all.filter((l) => l.strands.includes(strand.id));
        if (!items.length) continue;
        root.append(h('section', { class: 'tl-act' },
          h('h3', { class: 'tl-act-head' }, strand.label, h('span', {}, `${items.length} lessons`)),
          h('ol', { class: 'tl-list' }, items.map(card))));
      }
    }
  }

  // ---------- lesson player ----------
  function openLesson(id) {
    state.lesson = id;
    save();
    render();
    window.scrollTo(0, 0);
  }
  function closeLesson() {
    state.lesson = null;
    save();
    render();
    window.scrollTo(0, 0);
  }

  const checkOrder = new WeakMap();
  const hasArt = typeof PixelArt !== 'undefined';
  const narr = typeof Narration !== 'undefined' ? Narration : null;

  function renderLesson(meta) {
    const lesson = fullLesson(meta);
    const beats = lessonBeats(lesson);
    const last = beats.length - 1;
    let pos = -1;
    // Next is held while anything on screen is still waiting (a problem, a question, a
    // diagram). Each hold returns a token; Next frees up once every token is released.
    let holds = [];
    let choose = null; // answers the open multiple-choice question by index (keys 1–9)
    let deriveBox = null;
    let thread = null;

    const flow = h('div', { class: 'lesson-flow' });
    const nextBtn = h('button', { class: 'primary st-next', onclick: () => advance() }, 'Next');
    const fill = h('span');
    const counter = h('span', { class: 'st-counter' });
    // Narration: with a narrator chosen, each newly revealed beat is read aloud, and
    // the listen button replays (or stops) the current one.
    let posEl = null;
    const listenBtn = h('button', { class: 'secondary st-listen', type: 'button', 'aria-label': 'Read this step aloud', onclick: () => listen() });
    function listen() {
      if (narr.isPlaying()) narr.stop();
      else speak(posEl);
    }
    function speak(el) {
      narr.play(narr.beatText(beats[pos]), el, updateListen);
      updateListen();
    }
    function updateListen() {
      listenBtn.hidden = !narr || !narr.enabled();
      listenBtn.textContent = narr && narr.isPlaying() ? '■ Stop' : '▶ Listen';
    }
    const bar = h('div', { class: 'st-bar' }, h('span', { class: 'meter' }, fill), counter, narr ? listenBtn : null, nextBtn);

    root.append(
      h('div', { class: 'st-top' },
        h('button', { class: 'link-btn', onclick: closeLesson }, '← All stories'),
        h('div', { class: 'st-top-right' },
          narr ? narr.control(() => { updateListen(); if (narr.enabled() && posEl) speak(posEl); }) : null,
          h('button', { class: 'link-btn', onclick: () => { setProgress(lesson.id, { pos: 0 }); render(); window.scrollTo(0, 0); } }, 'restart'))),
      h('header', { class: 'st-head' },
        h('div', { class: 'eyebrow' }, `Act ${actNumber(lesson)} · Lesson ${lesson.order} · ${lesson.year} · ${lesson.place}`),
        h('h2', {}, lesson.title),
        lesson.subtitle ? h('p', { class: 'st-subtitle' }, lesson.subtitle) : null,
        h('div', { class: 'st-role' }, 'You are ', h('strong', {}, lesson.role), '.'),
        h('div', { class: 'goals-label' }, 'By the end you’ll be able to:'),
        h('ul', { class: 'goals' }, lesson.goals.map((g) => h('li', {}, rich(g))))),
      flow, bar);
    math(root);

    keyHandler = (e) => {
      const n = Number(e.key);
      const t = e.target.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA') return;
      if (choose && n >= 1 && n <= 9) { choose(n - 1); return; }
      if (e.key === 'ArrowRight' || ((e.key === ' ' || e.key === 'Enter') && t !== 'BUTTON' && t !== 'A')) {
        e.preventDefault();
        advance();
      }
    };

    function advance() {
      if (holds.length || pos >= last) return;
      reveal(pos + 1, true, true);
    }
    // `fresh` is a beat revealed by Next (read aloud if narrating), not one restored
    // on reopening the lesson.
    function reveal(i, live, fresh) {
      pos = i;
      holds = [];
      choose = null;
      const el = renderBeat(beats[i], live);
      // A dialogue thread or derivation grows across beats, so render math in the whole block
      const block = flow.lastElementChild || flow;
      math(block);
      // Beats restored on reopening appear at once; only newly revealed ones animate in
      if (!live && block !== flow) [block, ...block.querySelectorAll('*')].forEach((n) => n.classList.add('no-anim'));
      setProgress(lesson.id, i === last ? { pos, done: true } : { pos });
      updateBar();
      if (live && el) bringIntoView(el, true);
      posEl = el;
      if (narr) {
        if (fresh && narr.enabled()) speak(el);
        else narr.stop();
      }
      return el;
    }
    function hold(reason) {
      const token = { reason };
      holds.push(token);
      updateBar();
      return token;
    }
    function release(token) {
      holds = holds.filter((x) => x !== token);
      updateBar();
      if (holds.length) return;
      choose = null;
      nextBtn.focus({ preventScroll: true });
    }
    function updateBar() {
      fill.style.width = `${Math.round(100 * (pos + 1) / beats.length)}%`;
      counter.textContent = `${pos + 1} / ${beats.length}`;
      nextBtn.disabled = holds.length > 0;
      nextBtn.textContent = holds.length ? holds[0].reason : 'Next';
      bar.hidden = pos >= last;
      flow.classList.toggle('finished', pos >= last);
    }

    const add = (node) => flow.appendChild(node);

    // Put a newly revealed step at reading height, about a third of the way down the
    // screen, instead of at the bottom edge. A step too tall to fit there (a picture,
    // a diagram, a problem) gets its top near the top of the screen instead, so it's
    // never cut off at the start. The spacer below the lesson (.lesson-flow) makes room
    // to scroll the last step up this far.
    function bringIntoView(el, smooth) {
      const r = el.getBoundingClientRect();
      const view = window.innerHeight;
      const room = view - bar.offsetHeight - view * 0.33;
      const anchor = r.height <= room ? 0.33 : 0.08;
      const top = window.scrollY + r.top - view * anchor;
      const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: Math.max(0, top), behavior: smooth && !still ? 'smooth' : 'auto' });
    }

    // ----- calculator strip (problems with `calculator: true`) -----
    // Type an expression; the result shows as you type. Enter adds it to the tape
    // above (so the working stays visible) and sets Ans. "Use" copies the result into
    // the answer field; the learner still presses Check.
    function calculator(inputs, isSet) {
      let ans = null;
      const tape = h('ol', { class: 'calc-tape' });
      const input = h('input', { type: 'text', class: 'calc-input', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Calculator expression', placeholder: 'e.g. 250000 × 157.5' });
      const preview = h('span', { class: 'calc-preview', 'aria-live': 'polite' });
      const useBtn = h('button', { class: 'primary calc-use', type: 'button', disabled: true, onclick: () => use() }, 'Use');
      const current = () => { try { return calcEval(input.value, ans); } catch (e) { return null; } };
      function update() {
        const v = input.value.trim() ? current() : null;
        preview.textContent = v == null ? (input.value.trim() ? '…' : '') : `= ${calcShow(v)}`;
        const shown = v != null ? v : ans;
        useBtn.disabled = shown == null;
        useBtn.textContent = shown == null ? 'Use' : `Use ${calcShow(shown)} ↑`;
      }
      function commit() {
        let v;
        try { v = calcEval(input.value, ans); } catch (e) { preview.textContent = `(${e.message})`; return; }
        tape.append(h('li', {}, h('span', { class: 'calc-expr' }, prettyCalc(input.value)), h('span', { class: 'calc-eq' }, ` = ${calcShow(v)}`)));
        ans = calcClean(v);
        input.value = '';
        update();
      }
      function use() {
        const v = input.value.trim() ? current() : ans;
        if (v == null) return;
        const target = inputs[0];
        const text = String(calcClean(v));
        target.value = isSet && target.value.trim() ? `${target.value.replace(/[\s,]+$/, '')}, ${text}` : text;
        target.focus({ preventScroll: true });
      }
      input.addEventListener('input', update);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } });
      const insert = (txt) => {
        const a = input.selectionStart ?? input.value.length, z = input.selectionEnd ?? input.value.length;
        input.value = input.value.slice(0, a) + txt + input.value.slice(z);
        input.focus({ preventScroll: true });
        input.setSelectionRange(a + txt.length, a + txt.length);
        update();
      };
      const keys = [['+'], ['−'], ['×'], ['÷'], ['('], [')'], ['√'], ['²', 'x²'], ['Ans']]
        .map(([k, label]) => h('button', { class: 'calc-key', type: 'button', 'aria-label': k === '²' ? 'squared' : null, onclick: () => insert(k) }, label || k));
      const el = h('div', { class: 'calc', hidden: true },
        tape,
        h('div', { class: 'calc-row' }, input, preview),
        h('div', { class: 'calc-keys' }, keys, h('button', { class: 'calc-key calc-enter', type: 'button', onclick: () => commit() }, '='), useBtn));
      return {
        el,
        toggle(btn) {
          el.hidden = !el.hidden;
          btn.setAttribute('aria-expanded', String(!el.hidden));
          btn.classList.toggle('active', !el.hidden);
          if (!el.hidden) input.focus({ preventScroll: true });
        }
      };
    }

    // ----- problem card (used by `problem` steps and inside applications) -----
    function problemCard(problem, live) {
      const inputs = problem.fields.map((f) => h('input', {
        type: 'text', inputmode: problem.check === 'set' ? 'text' : 'decimal', autocomplete: 'off', spellcheck: 'false',
        'aria-label': f.label, 'data-field': f.id,
        onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); check(); } }
      }));
      const fields = h('div', { class: 'answer-fields' }, problem.fields.map((f, i) => h('div', { class: 'field-row' },
        h('label', {}, f.label), h('div', { class: 'st-input' }, inputs[i], f.unit ? h('span', { class: 'st-unit' }, f.unit) : null))));
      const fb = h('div', { class: 'feedback', hidden: true });
      const hintBox = h('ol', { class: 'st-hints', hidden: true });
      const solution = h('div', { class: 'solution-box', hidden: true },
        h('h4', {}, 'Worked solution'), h('ol', {}, (problem.solution || []).map((s) => h('li', {}, rich(s)))),
        problem.calc ? h('p', { class: 'calc-line' }, 'On the calculator: ', h('code', {}, prettyCalc(problem.calc))) : null);
      let hintsShown = 0;
      const hints = problem.hints || [];
      const checkBtn = h('button', { class: 'primary', type: 'button', onclick: () => check() }, 'Check');
      const hintBtn = h('button', { class: 'secondary', type: 'button', onclick: () => hint() }, hints.length ? `Hint (1 of ${hints.length})` : 'Hint');
      const showBtn = h('button', { class: 'secondary', type: 'button', onclick: () => finish(false) }, 'Show me');
      const calc = problem.calculator ? calculator(inputs, problem.check === 'set') : null;
      const calcBtn = calc ? h('button', { class: 'secondary calc-toggle', type: 'button', 'aria-expanded': 'false', onclick: () => calc.toggle(calcBtn) }, 'Calculator') : null;
      const actions = h('div', { class: 'action-row' }, checkBtn, hints.length ? hintBtn : null, showBtn, calcBtn);
      const card = h('div', { class: 'blk st-problem' + (live ? ' pending' : ''), 'data-problem': problem.id },
        h('div', { class: 'eyebrow' }, 'Your turn'),
        h('div', { class: 'problem-prompt' }, rich(problem.prompt)),
        fields, actions, calc ? calc.el : null, hintBox, fb, solution);

      function hint() {
        if (hintsShown >= hints.length) return;
        const li = h('li', {}, rich(hints[hintsShown]));
        hintBox.append(li);
        hintBox.hidden = false;
        math(li);
        hintsShown++;
        hintBtn.textContent = hintsShown < hints.length ? `Hint (${hintsShown + 1} of ${hints.length})` : 'No more hints';
        hintBtn.disabled = hintsShown >= hints.length;
      }
      function check() {
        if (!card.classList.contains('pending')) return;
        const values = {};
        inputs.forEach((inp) => { values[inp.dataset.field] = inp.value; });
        const r = checkAnswer(problem, values);
        if (r.ok) { finish(true); return; }
        fb.hidden = false;
        fb.className = 'feedback bad';
        fb.replaceChildren(...rich(r.message));
        math(fb);
      }
      function finish(solved) {
        card.classList.remove('pending');
        card.classList.add(solved ? 'solved' : 'shown');
        const answers = answerText(problem);
        inputs.forEach((inp, i) => { if (!solved) inp.value = answers[i]; inp.disabled = true; });
        actions.hidden = true;
        if (calc) calc.el.hidden = true;
        fb.hidden = false;
        fb.className = 'feedback ' + (solved ? 'ok' : 'neutral');
        fb.textContent = solved ? 'Correct!' : 'Here’s how it works out.';
        solution.hidden = !(problem.solution && problem.solution.length);
        math(solution);
        if (live) release(token);
      }
      let token = null;
      if (live) {
        token = hold('Solve the problem to continue');
        requestAnimationFrame(() => inputs[0].focus({ preventScroll: true }));
      } else {
        const answers = answerText(problem);
        inputs.forEach((inp, i) => { inp.value = answers[i]; inp.disabled = true; });
        actions.hidden = true;
        solution.hidden = !(problem.solution && problem.solution.length);
      }
      return card;
    }

    // ----- interactive diagrams (widgets.js); Next waits until the diagram is finished -----
    function mountWidget(box, name, params, live) {
      const make = typeof WIDGETS !== 'undefined' && WIDGETS[name];
      if (!make) { box.textContent = `(missing widget: ${name})`; return box; }
      let finished = false;
      const token = live ? hold('Work through the diagram') : null;
      make(box, params || {}, {
        live,
        math,
        done: () => { if (finished) return; finished = true; if (live) release(token); }
      });
      return box;
    }

    // ----- multiple choice (quick checks and dialogue turns) -----
    const choiceBtn = (content, k, onpick, orig) => h('button', { class: 'choice', 'data-opt': orig, onclick: () => onpick(k) },
      h('span', { class: 'key' }, String(k + 1)), h('span', {}, content));

    function bubble(step, line) {
      if (line.narration) return h('div', { class: 'narr' }, rich(line.narration));
      const right = line.s === step.practice;
      const speaker = step.speakers[line.s];
      const who = speaker.character && lesson.characters && lesson.characters[speaker.character];
      const b = h('div', { class: 'bubble ' + (right ? 'right' : 'left') },
        h('div', { class: 'who' }, speaker.name), h('div', {}, rich(line.text)));
      if (!who || !hasArt) return b;
      const face = h('div', { class: 'avatar', 'aria-hidden': 'true' });
      PixelArt.portrait(face, who, 48);
      return h('div', { class: 'bubble-row ' + (right ? 'right' : 'left') }, face, b);
    }
    function threadFor(step, first) {
      if (first || !thread) {
        thread = add(h('div', { class: 'blk thread' },
          h('div', { class: 'thread-title' }, step.title || 'Conversation'),
          step.practice ? h('div', { class: 'thread-sub' }, `When it’s your turn, pick what ${step.speakers[step.practice].name.toLowerCase() === 'you' ? 'you say' : step.speakers[step.practice].name + ' says'}.`) : null));
      }
      return thread;
    }

    // Appends one beat to the page; returns the element to scroll to
    function renderBeat(beat, live) {
      const { step } = beat;
      switch (beat.kind) {
        case 'scene': {
          // A scene can open with a pixel picture; its map then follows the text
          const picBox = step.picture && hasArt ? h('figure', { class: 'st-picture' }) : null;
          const mapBox = step.map && typeof PixelMap !== 'undefined' ? h('div', { class: 'st-map' }) : null;
          const el = add(h('section', { class: 'blk st-scene' + (picBox || mapBox ? ' has-map' : '') },
            picBox || mapBox,
            h('div', { class: 'scene-year' }, step.year),
            h('div', { class: 'scene-place' }, step.place),
            h('p', {}, rich(step.text)),
            picBox ? mapBox : null));
          if (picBox) PixelArt.picture(picBox, step.picture, lesson.characters, { live });
          if (mapBox) PixelMap.render(mapBox, step.map, { live: live && !picBox });
          return el;
        }
        case 'picture': {
          const fig = add(h('figure', { class: 'blk st-picture' }));
          if (hasArt) PixelArt.picture(fig, step, lesson.characters, { live });
          return fig;
        }
        case 'heading':
          return add(h('h3', { class: 'blk l-h' }, rich(step.text)));
        case 'text':
          return add(h('p', { class: 'blk l-p' }, rich(step.text)));
        case 'person': {
          const words = step.name.split(/\s+/);
          const initials = (words[0][0] + words[words.length - 1].replace(/^al-/i, '')[0]).toUpperCase();
          const who = step.character && lesson.characters && lesson.characters[step.character];
          const face = h('div', { class: who && hasArt ? 'person-portrait' : 'monogram', 'aria-hidden': 'true' }, who && hasArt ? null : initials);
          if (who && hasArt) PixelArt.portrait(face, who, 72);
          return add(h('div', { class: 'blk st-person' },
            face,
            h('div', {},
              h('div', { class: 'person-name' }, step.name),
              h('div', { class: 'person-meta' }, [step.dates, step.place].filter(Boolean).join(' · ')),
              h('div', { class: 'person-bio' }, rich(step.bio)),
              who && who.note ? h('div', { class: 'person-note' }, rich(who.note)) : null)));
        }
        case 'quote':
          return add(h('figure', { class: 'blk st-quote' },
            h('blockquote', {}, rich(step.text)),
            h('figcaption', {}, '— ', step.cite)));
        case 'thenNow':
          return add(h('div', { class: 'blk st-thennow' },
            h('div', { class: 'tn-col' }, h('div', { class: 'tn-label' }, 'Then'), h('div', { class: 'tn-then' }, rich(step.then))),
            h('div', { class: 'tn-arrow', 'aria-hidden': 'true' }, '→'),
            h('div', { class: 'tn-col' }, h('div', { class: 'tn-label' }, 'Now'), h('div', { class: 'tn-now' }, rich(step.now))),
            step.note ? h('div', { class: 'tn-note' }, rich(step.note)) : null));
        case 'note':
          return add(h('aside', { class: 'blk callout' },
            h('div', { class: 'callout-label' }, step.label || 'Note'), h('div', {}, rich(step.text))));
        case 'meanwhile':
          return add(h('aside', { class: 'blk callout meanwhile' },
            h('div', { class: 'callout-label' }, `Meanwhile · ${step.place}`), h('div', {}, rich(step.text))));
        case 'list':
          return add(h('div', { class: 'blk' },
            step.title ? h('div', { class: 'list-title' }, rich(step.title)) : null,
            h('div', { class: 'st-list' }, step.items.map((it) => h('div', { class: 'st-list-row' },
              h('span', { class: 'tn-then' }, rich(it.then)), h('span', {}, rich(it.now)))))));
        case 'derive': {
          if (beat.first || !deriveBox) deriveBox = add(h('div', { class: 'blk st-derive' }));
          const row = deriveBox.appendChild(h('div', { class: 'derive-row' },
            h('div', { class: 'derive-math' }, tex(beat.line.math, true)),
            h('div', { class: 'derive-why' }, rich(beat.line.why))));
          if (beat.last && step.notebook) {
            deriveBox.append(h('div', { class: 'notebook-page' },
              h('div', { class: 'callout-label' }, 'Notebook'),
              h('div', { class: 'nb-title' }, step.notebook.title),
              h('div', {}, rich(step.notebook.text))));
          }
          return beat.last && step.notebook ? deriveBox.lastChild : row;
        }
        case 'widget':
          return add(mountWidget(h('div', { class: 'blk st-widget' }), step.name, step.params, live));
        case 'problem':
          return add(problemCard(step, live));
        case 'application': {
          const card = add(h('section', { class: 'blk st-app' },
            h('div', { class: 'app-field' }, step.field),
            h('h4', { class: 'app-title' }, step.title),
            h('p', {}, rich(step.text))));
          if (step.widget) card.append(mountWidget(h('div', { class: 'st-widget' }), step.widget.name, step.widget.params, live));
          if (step.problem) card.append(problemCard(step.problem, live));
          return card;
        }
        case 'check': {
          const fb = h('div', { class: 'check-fb' });
          let done = !live;
          if (!checkOrder.has(step)) checkOrder.set(step, shuffle(step.options.map((_, j) => j)));
          const order = checkOrder.get(step);
          const answerAt = order.indexOf(step.answer);
          const mark = (k) => buttons.forEach((b, j) => {
            b.disabled = true;
            if (j === answerAt) b.classList.add('correct');
            else if (j === k) b.classList.add('wrong');
          });
          const pick = (k) => {
            if (done || k >= step.options.length) return;
            done = true;
            mark(k);
            const ok = k === answerAt;
            fb.replaceChildren(h('span', { class: 'verdict ' + (ok ? 'good' : 'bad') }, ok ? 'Yes! ' : 'Not quite. '), ...rich(step.why || ''));
            math(fb);
            release(token);
          };
          let token = null;
          const buttons = order.map((j, k) => choiceBtn(rich(step.options[j]), k, pick, j));
          const el = add(h('div', { class: 'blk check' }, h('div', { class: 'eyebrow' }, 'Quick check'),
            h('div', { class: 'check-q' }, rich(step.prompt)), h('div', { class: 'choices' }, buttons), fb));
          if (live) { token = hold('Choose an answer'); choose = pick; }
          else { mark(answerAt); if (step.why) fb.append(...rich(step.why)); }
          return el;
        }
        case 'turn': {
          const box = threadFor(step, beat.first);
          for (const l of beat.before) box.append(bubble(step, l));
          const reply = () => bubble(step, beat.line);
          if (!live) return box.appendChild(reply());
          const options = shuffle([{ text: beat.line.text, ok: true }, ...(beat.line.wrong || []).map((t) => ({ text: t, ok: false }))]);
          let done = false;
          const who = step.speakers[step.practice].name;
          const pick = (k) => {
            if (done || k >= options.length) return;
            done = true;
            const ok = options[k].ok;
            const r = reply();
            if (ok) (r.classList.contains('bubble') ? r : r.querySelector('.bubble')).classList.add('got');
            turnEl.replaceWith(...(ok ? [] : [h('div', { class: 'turn-miss' }, `Not quite: “${options[k].text}” A better step:`)]), r);
            math(box);
            release(token);
          };
          const turnEl = box.appendChild(h('div', { class: 'turn' }, h('div', { class: 'who' }, who === 'You' ? 'Your turn' : `You (${who})`),
            options.map((o, k) => choiceBtn(rich(o.text), k, pick, o.ok ? 'ok' : 'no'))));
          const token = hold('Choose an answer');
          choose = pick;
          return turnEl;
        }
        case 'lines': {
          const box = threadFor(step, beat.first);
          let el = box;
          for (const l of beat.lines) el = box.appendChild(bubble(step, l));
          return el;
        }
        case 'recap':
          return add(renderRecap(lesson));
        default:
          return add(h('div', { class: 'blk' }, `(unknown step: ${beat.kind})`));
      }
    }

    // Resume where the learner left off: earlier beats render already answered,
    // the current one renders live so an open problem can still be answered.
    const start = Math.min(progress(lesson.id).pos, last);
    let lastEl = null;
    for (let i = 0; i <= start; i++) lastEl = reveal(i, i === start && i !== last);
    if (start > 0 && lastEl) requestAnimationFrame(() => bringIntoView(lastEl, false));
    updateListen();
  }

  function renderRecap(lesson) {
    const pages = lesson.steps.filter((s) => s.notebook).map((s) => s.notebook);
    const all = lessons();
    const nextBuilt = all.find((l) => l.order > lesson.order && isBuilt(l));
    const nextInLine = all.find((l) => l.order === lesson.order + 1);
    return h('section', { class: 'blk recap' },
      h('h3', { class: 'l-h' }, 'Lesson complete'),
      pages.length ? h('div', {},
        h('div', { class: 'list-title' }, 'Added to your notebook'),
        pages.map((p) => h('div', { class: 'notebook-page' }, h('div', { class: 'nb-title' }, p.title), h('div', {}, rich(p.text))))) : null,
      (lesson.practiceLinks || []).length ? h('div', { class: 'recap-block' },
        h('div', { class: 'list-title' }, 'Practise this'),
        h('div', { class: 'action-row' }, lesson.practiceLinks.map((p) => h('button', {
          class: 'secondary', type: 'button', onclick: () => hooks.openPractice && hooks.openPractice(p.subject, p.topic, p.type)
        }, `${p.label} →`)))) : null,
      h('div', { class: 'recap-block' },
        h('div', { class: 'list-title' }, 'Sources'),
        h('ul', { class: 'st-sources' }, (lesson.sources || []).map((s) => h('li', {},
          s.url ? h('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.title) : s.title)))),
      h('div', { class: 'action-row' },
        nextBuilt ? h('button', { class: 'primary', type: 'button', onclick: () => openLesson(nextBuilt.id) }, `Next lesson: ${nextBuilt.title} →`) : null,
        h('button', { class: 'secondary', type: 'button', onclick: closeLesson }, 'All stories')),
      !nextBuilt && nextInLine ? h('p', { class: 'l-p muted' }, `Next on the timeline: “${nextInLine.title}” (${nextInLine.year}, ${nextInLine.place}), coming later.`) : null);
  }

  // ---------- mounting ----------
  function render() {
    if (!root) return;
    if (narr) narr.stop();
    keyHandler = null;
    root.replaceChildren();
    if (!data) { root.append(h('p', { class: 'l-p muted' }, 'Loading stories…')); return; }
    const open = state.lesson && data.lessons.find((l) => l.id === state.lesson && isBuilt(l));
    if (open) renderLesson(open);
    else renderHome();
  }

  async function init(el, hookFns) {
    root = el;
    hooks = hookFns || {};
    state = load();
    document.addEventListener('keydown', (e) => {
      if (keyHandler && !root.hidden && !e.metaKey && !e.ctrlKey && !e.altKey) keyHandler(e);
    });
    render();
    try {
      const res = await fetch('stories.json');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      data = await res.json();
    } catch (e) {
      root.replaceChildren(h('p', { class: 'feedback bad' }, `Couldn't load stories (${e.message}). This page needs to be served over http(s).`));
      return;
    }
    render();
  }

  window.Stories = { init, render, checkAnswer, parseNum, parseList, lessonBeats, calcEval };
})();
