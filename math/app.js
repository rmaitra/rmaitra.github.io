// ============ Data (fetched at startup) ============
var DATA = null;

// ============ Subjects (each with its own topics, generators, and JSON data file) ============
var SUBJECTS = {
  algebra: {
    label: 'Algebra',
    title: 'Advanced Algebra Studio',
    dataKey: 'advancedAlgebra',
    dataFile: 'advanced_algebra.json',
    topicOrder: ['complexNumbers', 'polynomialOperations', 'rationalExpressions', 'exponentialLogarithmic', 'conicSections', 'matrixAlgebra', 'systemsOfEquations'],
    typeMeta: {
      complexNumbers: [
        { label: 'Add Complex Numbers' }, { label: 'Multiply Complex Numbers' }, { label: 'Divide Complex Numbers' }
      ],
      polynomialOperations: [
        { label: 'Polynomial Long Division' }, { label: 'Factor Sum/Difference of Cubes' },
        { label: 'Factor Trinomials' }, { label: 'Remainder & Factor Theorems' }
      ],
      rationalExpressions: [
        { label: 'Simplify Rational Expressions' }, { label: 'Add Rational Expressions' }, { label: 'Solve Rational Equations' }
      ],
      exponentialLogarithmic: [
        { label: 'Solve Exponential Equations' }, { label: 'Solve Logarithmic Equations' },
        { label: 'Logarithm Properties' }, { label: 'Logarithmic Equations' }
      ],
      conicSections: [
        { label: 'Circle: Standard Form' }, { label: 'Ellipse Properties' }, { label: 'Parabola Properties' }, { label: 'Hyperbola Properties' }
      ],
      matrixAlgebra: [
        { label: 'Matrix Multiplication' }, { label: 'Determinants' }, { label: 'Matrix Inverse' }
      ],
      systemsOfEquations: [
        { label: '3×3 Linear Systems' }, { label: 'Nonlinear Systems' }
      ]
    },
    generators: TOPIC_GENERATORS
  },
  arithmetic: {
    label: 'Arithmetic',
    title: 'Arithmetic Studio',
    dataKey: 'arithmetic',
    dataFile: 'arithmetic.json',
    topicOrder: ['orderOfOperations', 'fractions', 'decimals', 'percentages', 'ratiosProportions', 'integers', 'exponentsRoots'],
    typeMeta: {
      orderOfOperations: [
        { label: 'Evaluate an Expression' }, { label: 'Evaluate with Exponents' }
      ],
      fractions: [
        { label: 'Add or Subtract Fractions' }, { label: 'Multiply or Divide Fractions' }
      ],
      decimals: [
        { label: 'Add or Subtract Decimals' }, { label: 'Multiply or Divide Decimals' }
      ],
      percentages: [
        { label: 'Percent of a Number' }, { label: 'Percent Change' }
      ],
      ratiosProportions: [
        { label: 'Simplify a Ratio' }, { label: 'Solve a Proportion' }
      ],
      integers: [
        { label: 'Add or Subtract Integers' }, { label: 'Multiply or Divide Integers' }
      ],
      exponentsRoots: [
        { label: 'Evaluate a Power' }, { label: 'Square or Cube Root' }
      ]
    },
    generators: ARITHMETIC_GENERATORS
  }
};
var SUBJECT_ORDER = ['algebra', 'arithmetic'];

// ============ Scratchpad quick-insert toolbar ============
var SCRATCH_VARS = ['x', 'y', 'z', 'i'];
var SCRATCH_SYMBOLS = ['+', '−', '×', '÷', '(', ')', '^', '√', 'π', '²', '³', '='];

// ============ State ============
var state = {
  subject: SUBJECT_ORDER[0],
  topic: SUBJECTS[SUBJECT_ORDER[0]].topicOrder[0],
  mode: 'learn',
  typeIndex: 0,
  problem: null,
  scored: false,
  chartInstance: null,
  chartRevealed: false
};

// ============ Scoring (localStorage) ============
const SCORE_KEY = 'algebraStudioScores_v1';
function loadScores() {
  try { return JSON.parse(localStorage.getItem(SCORE_KEY)) || {}; } catch (e) { return {}; }
}
function saveScores(s) {
  try { localStorage.setItem(SCORE_KEY, JSON.stringify(s)); } catch (e) { /* ignore */ }
}
function recordAttempt(topicKey, correct) {
  const scores = loadScores();
  if (!scores[topicKey]) scores[topicKey] = { correct: 0, attempted: 0 };
  scores[topicKey].attempted++;
  if (correct) scores[topicKey].correct++;
  saveScores(scores);
  renderScoreboard();
}
function renderScoreboard() {
  const scores = loadScores();
  let correct = 0, attempted = 0;
  for (const k in scores) { correct += scores[k].correct; attempted += scores[k].attempted; }
  document.getElementById('scoreText').textContent = `${correct}/${attempted} correct`;
}
function resetScores() {
  if (confirm('Reset all practice scores? This cannot be undone.')) {
    localStorage.removeItem(SCORE_KEY);
    renderScoreboard();
  }
}

// ============ Rendering ============
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderMath(container) {
  if (typeof renderMathInElement !== 'function') return;
  try {
    renderMathInElement(container, {
      delimiters: [{ left: '\\(', right: '\\)', display: false }],
      throwOnError: false
    });
  } catch (e) { /* fail quietly, plain text is still readable */ }
}

function seriesForHighcharts(s) {
  const out = Object.assign({}, s);
  out.connectNulls = false;
  if (out.marker === undefined) out.marker = out.type === 'scatter' ? { enabled: true, radius: 5 } : { enabled: false };
  if (out.type === 'scatter' && out.dataLabels === undefined && out.data.length <= 4) {
    out.dataLabels = { enabled: true, format: '({point.x}, {point.y})', style: { fontSize: '10px' } };
  }
  return out;
}

function plotLineConfig(pl, color) {
  return { value: pl.value, color: color, dashStyle: 'Dash', width: 1, zIndex: 3, label: { text: pl.label || '', style: { color: color, fontSize: '10px' } } };
}

function renderProblemChart(p) {
  state.chartInstance = null;
  state.chartRevealed = false;
  if (!p.chart || typeof Highcharts === 'undefined') return;
  const c = p.chart;
  const xAxisOpts = { title: { text: c.xAxisTitle || null }, lineColor: '#333', gridLineColor: '#1e1e1e' };
  const yAxisOpts = { title: { text: c.yAxisTitle || null }, lineColor: '#333', gridLineColor: '#1e1e1e' };
  if (c.xRange) { xAxisOpts.min = c.xRange[0]; xAxisOpts.max = c.xRange[1]; }
  if (c.yRange) { yAxisOpts.min = c.yRange[0]; yAxisOpts.max = c.yRange[1]; }
  if (c.xPlotLines && c.xPlotLines.length) xAxisOpts.plotLines = c.xPlotLines.map(pl => plotLineConfig(pl, '#666'));
  if (c.yPlotLines && c.yPlotLines.length) yAxisOpts.plotLines = c.yPlotLines.map(pl => plotLineConfig(pl, '#666'));

  const chartOpts = { type: 'line' };
  if (c.aspectSquare) { chartOpts.width = 340; chartOpts.height = 340; } else { chartOpts.height = 260; }

  const totalSeriesCount = c.series.length + (c.revealSeries || []).length;

  state.chartInstance = Highcharts.chart('chartContainer', {
    chart: chartOpts,
    title: { text: undefined },
    xAxis: xAxisOpts,
    yAxis: yAxisOpts,
    legend: { enabled: totalSeriesCount > 1 },
    plotOptions: { series: { animation: false, enableMouseTracking: true } },
    series: c.series.map(seriesForHighcharts)
  });
}

function revealChartAnswer(p) {
  if (!p.chart || !state.chartInstance || state.chartRevealed) return;
  state.chartRevealed = true;
  (p.chart.revealSeries || []).forEach(s => state.chartInstance.addSeries(seriesForHighcharts(s), false));
  if (p.chart.revealXPlotLines) p.chart.revealXPlotLines.forEach(pl => state.chartInstance.xAxis[0].addPlotLine(plotLineConfig(pl, '#ff6b6b')));
  if (p.chart.revealYPlotLines) p.chart.revealYPlotLines.forEach(pl => state.chartInstance.yAxis[0].addPlotLine(plotLineConfig(pl, '#ff6b6b')));
  const total = p.chart.series.length + (p.chart.revealSeries || []).length;
  if (total > 1) state.chartInstance.update({ legend: { enabled: true } }, false);
  state.chartInstance.redraw();
}

function renderSubjectTabs() {
  const nav = document.getElementById('subjectTabs');
  nav.innerHTML = '';
  SUBJECT_ORDER.forEach(key => {
    const btn = document.createElement('button');
    btn.className = 'subject-btn' + (key === state.subject ? ' active' : '');
    btn.textContent = SUBJECTS[key].label;
    btn.onclick = () => selectSubject(key);
    nav.appendChild(btn);
  });
  const title = SUBJECTS[state.subject].title;
  document.getElementById('subjectTitle').textContent = title;
  document.title = title;
}

function selectSubject(key) {
  if (key === state.subject) return;
  state.subject = key;
  state.topic = SUBJECTS[key].topicOrder[0];
  state.typeIndex = 0;
  renderSubjectTabs();
  renderTopicNav();
  renderTopicHeader();
  renderLearn();
  renderPracticeShell();
}

function renderTopicNav() {
  const nav = document.getElementById('topicNav');
  nav.innerHTML = '';
  SUBJECTS[state.subject].topicOrder.forEach(key => {
    const btn = document.createElement('button');
    btn.className = 'topic-btn' + (key === state.topic ? ' active' : '');
    btn.textContent = DATA[state.subject][key].title;
    btn.onclick = () => selectTopic(key);
    nav.appendChild(btn);
  });
}

function selectTopic(key) {
  state.topic = key;
  state.typeIndex = 0;
  renderTopicNav();
  renderTopicHeader();
  renderLearn();
  renderPracticeShell();
}

function renderTopicHeader() {
  const topic = DATA[state.subject][state.topic];
  document.getElementById('topicHeader').innerHTML = `
    <h2>${escapeHtml(topic.title)}</h2>
    <p class="topic-desc">${escapeHtml(topic.description)}</p>
  `;
}

function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
  document.getElementById('learnPane').hidden = mode !== 'learn';
  document.getElementById('practicePane').hidden = mode !== 'practice';
}

function renderLearn() {
  const topic = DATA[state.subject][state.topic];
  const pane = document.getElementById('learnPane');
  let html = '';
  topic.concepts.forEach(concept => {
    html += `<div class="concept-card">
      <h3>${escapeHtml(concept.name)}</h3>
      <p class="concept-explanation">${escapeHtml(concept.explanation)}</p>`;
    concept.examples.forEach(ex => {
      html += `<div class="example">
        <p class="example-problem"><span class="tag">Problem</span> ${escapeHtml(ex.problem)}</p>
        <details>
          <summary>Show steps</summary>
          <ol>${ex.steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol>
        </details>
        <p class="example-solution"><span class="tag tag-solution">Solution</span> ${escapeHtml(ex.solution)}</p>
      </div>`;
    });
    html += `</div>`;
  });
  pane.innerHTML = html;
  renderMath(pane);
}

function renderPracticeShell() {
  const pane = document.getElementById('practicePane');
  const types = SUBJECTS[state.subject].typeMeta[state.topic];
  let typeBtns = types.map((t, i) =>
    `<button class="type-btn${i === state.typeIndex ? ' active' : ''}" data-idx="${i}">${escapeHtml(t.label)}</button>`
  ).join('');
  pane.innerHTML = `
    <div class="type-nav">${typeBtns}</div>
    <div id="problemArea"></div>
  `;
  pane.querySelectorAll('.type-btn').forEach(btn => {
    btn.onclick = () => {
      state.typeIndex = parseInt(btn.dataset.idx, 10);
      pane.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadProblem();
    };
  });
  loadProblem();
}

function loadProblem() {
  const gen = SUBJECTS[state.subject].generators[state.topic][state.typeIndex];
  state.problem = gen();
  state.scored = false;
  renderProblem();
}

function renderProblem() {
  const p = state.problem;
  const area = document.getElementById('problemArea');
  const fieldsHtml = p.fields.map(f =>
    `<div class="field-row">
      <label>${escapeHtml(f.label)}</label>
      <input type="text" inputmode="${f.type === 'number' ? 'decimal' : 'text'}" data-field="${f.id}" autocomplete="off" spellcheck="false">
    </div>`
  ).join('');

  area.innerHTML = `
    <div class="problem-card">
      <div class="problem-type-label">${escapeHtml(SUBJECTS[state.subject].typeMeta[state.topic][state.typeIndex].label)}</div>
      <div class="problem-prompt">${escapeHtml(p.prompt)}</div>
      ${p.chart ? `<div id="chartContainer" class="chart-container"${p.chart.aspectSquare ? ' data-square="true"' : ''}></div>` : ''}
      <label class="scratch-label">Your work <span>(scratchpad — not graded, just for you)</span></label>
      <div class="scratch-toolbar" id="scratchToolbar">
        ${SCRATCH_VARS.map(v => `<button type="button" class="symbol-btn var-btn" data-insert="${v}">${v}</button>`).join('')}
        ${SCRATCH_SYMBOLS.map(s => `<button type="button" class="symbol-btn" data-insert="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join('')}
      </div>
      <textarea id="scratchpad" rows="4" placeholder="Write out your steps here..."></textarea>
      <div class="answer-fields">${fieldsHtml}</div>
      <div class="action-row">
        <button id="checkBtn" class="primary">Check Answer</button>
        <button id="showSolBtn" class="secondary">Show Solution</button>
        <button id="newProblemBtn" class="secondary">New Problem</button>
      </div>
      <div class="feedback" id="feedback" hidden></div>
      <div class="solution-box" id="solutionBox" hidden>
        <h4>Worked Solution</h4>
        <ol id="solutionSteps"></ol>
        <p class="final-answer">Final answer: <strong id="finalAnswerText"></strong></p>
      </div>
    </div>
  `;

  document.getElementById('checkBtn').onclick = checkAnswer;
  document.getElementById('showSolBtn').onclick = showSolution;
  document.getElementById('newProblemBtn').onclick = loadProblem;
  area.querySelectorAll('.answer-fields input').forEach(inp => {
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') checkAnswer(); });
  });
  area.querySelectorAll('.symbol-btn').forEach(btn => {
    btn.addEventListener('click', () => insertAtCursor(document.getElementById('scratchpad'), btn.dataset.insert));
  });
  renderMath(document.querySelector('.problem-prompt'));
  renderProblemChart(p);
}

function insertAtCursor(textarea, text) {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  textarea.value = textarea.value.slice(0, start) + text + textarea.value.slice(end);
  const newPos = start + text.length;
  textarea.focus();
  textarea.setSelectionRange(newPos, newPos);
}

function collectValues() {
  const values = {};
  document.querySelectorAll('.answer-fields input').forEach(inp => {
    values[inp.dataset.field] = inp.value;
  });
  return values;
}

function checkAnswer() {
  const p = state.problem;
  const values = collectValues();
  const result = p.check(values);
  const fb = document.getElementById('feedback');
  fb.hidden = false;
  fb.textContent = result.message || (result.ok ? 'Correct!' : 'Not quite.');
  fb.className = 'feedback ' + (result.ok ? 'ok' : 'bad');

  if (!state.scored) {
    state.scored = true;
    recordAttempt(state.topic, result.ok);
  }
  if (result.ok) showSolution();
}

function showSolution() {
  const p = state.problem;
  const box = document.getElementById('solutionBox');
  box.hidden = false;
  document.getElementById('solutionSteps').innerHTML = p.steps.map(s => `<li>${escapeHtml(s)}</li>`).join('');
  document.getElementById('finalAnswerText').innerHTML = escapeHtml(p.finalAnswer);
  renderMath(box);
  revealChartAnswer(p);
}

// ============ Init ============
async function init() {
  if (typeof Highcharts !== 'undefined') {
    Highcharts.setOptions({
      chart: { backgroundColor: 'transparent', style: { fontFamily: "'Space Grotesk', sans-serif" } },
      credits: { enabled: false },
      accessibility: { enabled: false },
      title: { text: undefined },
      xAxis: { labels: { style: { color: '#aaaaaa' } }, title: { style: { color: '#aaaaaa' } } },
      yAxis: { labels: { style: { color: '#aaaaaa' } }, title: { style: { color: '#aaaaaa' } } },
      legend: { itemStyle: { color: '#aaaaaa' }, itemHoverStyle: { color: '#e0e0e0' } },
      tooltip: { backgroundColor: '#16181a', style: { color: '#e0e0e0' }, borderColor: '#1e1e1e' }
    });
  }
  DATA = {};
  try {
    for (const key of SUBJECT_ORDER) {
      const s = SUBJECTS[key];
      const res = await fetch(s.dataFile);
      if (!res.ok) throw new Error('HTTP ' + res.status + ' loading ' + s.dataFile);
      const json = await res.json();
      DATA[key] = json[s.dataKey];
    }
  } catch (e) {
    document.querySelector('main').innerHTML =
      '<p style="color:#ff6b6b;padding:2rem 0;">Couldn\'t load practice data (' + escapeHtml(e.message) + '). ' +
      'This page needs to be served over http(s) — try running a local server instead of opening the file directly.</p>';
    return;
  }
  renderSubjectTabs();
  renderTopicNav();
  renderTopicHeader();
  renderLearn();
  renderPracticeShell();
  renderScoreboard();
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.onclick = () => setMode(btn.dataset.mode);
  });
  document.getElementById('resetScoreLink').onclick = (e) => { e.preventDefault(); resetScores(); };
}

document.addEventListener('DOMContentLoaded', init);
