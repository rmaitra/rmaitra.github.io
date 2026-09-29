// Walks every built Stories lesson in a real browser, by keyboard and clicks, and
// checks it end to end. Needs playwright-core and a Chrome/Chromium install:
//
//   npm i --no-save playwright-core          (from the repo root; doesn't touch package.json)
//   node math/tools/walkthrough.cjs          (CHROME=/path/to/chrome to override)
//
// For each built lesson it: opens it from the timeline; for every problem, tries
// each `mistakes` value first (the targeted feedback must appear), then a hint,
// then the right answer; answers quick checks and dialogue turns correctly;
// clicks through widgets; and reaches the recap. It then checks: no console
// errors, no KaTeX errors, the done flag in localStorage, resume after reload,
// the Practise link opening the right Practice tab, and no horizontal scrolling
// at phone width (390 px).
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const ROOT = path.join(__dirname, '..', '..');
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'math', 'stories.json'), 'utf8'));
const CHROME = process.env.CHROME || '/usr/bin/google-chrome';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css' };

function serve() {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = path.join(ROOT, p);
    if (!file.startsWith(ROOT) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, () => resolve(server)));
}

const failures = [];
const expect = (cond, msg) => { if (!cond) failures.push(msg); };
const asInput = (v) => (Array.isArray(v) ? v.join(', ') : String(v));

async function solveProblem(page, card, p) {
  for (const m of p.mistakes || []) {
    await card.locator('.answer-fields input').first().fill(asInput(m.value));
    await card.getByRole('button', { name: 'Check' }).click();
    const fb = await card.locator('.feedback').innerText();
    expect(!/Correct/.test(fb), `${p.id}: mistake ${JSON.stringify(m.value)} was accepted`);
  }
  if ((p.hints || []).length) {
    await card.getByRole('button', { name: /^Hint/ }).click();
    expect(await card.locator('.st-hints li').count() === 1, `${p.id}: hint did not appear`);
  }
  const inputs = card.locator('.answer-fields input');
  if (p.calculator) {
    // Use the calculator the way a learner would: open it, type, Enter, Use, then Check
    await inputs.first().fill('');
    await card.locator('.calc-toggle').click();
    await card.locator('.calc-input').fill(p.calc);
    await card.locator('.calc-input').press('Enter');
    expect(await card.locator('.calc-tape li').count() === 1, `${p.id}: calculator tape did not record the line`);
    await card.locator('.calc-use').click();
    await card.getByRole('button', { name: 'Check' }).click();
  } else {
    for (let i = 0; i < p.fields.length; i++) await inputs.nth(i).fill(asInput(p.answer[p.fields[i].id]));
    await inputs.first().press('Enter');
  }
  expect(/Correct/.test(await card.locator('.feedback').innerText()), `${p.id}: right answer not accepted`);
}

async function walkLesson(page, id) {
  const lesson = { ...DATA.lessons.find((l) => l.id === id), ...DATA.content[id] };
  const problems = {};
  const checks = [];
  for (const s of lesson.steps) {
    if (s.type === 'problem') problems[s.id] = s;
    if (s.type === 'application' && s.problem) problems[s.problem.id] = s.problem;
    if (s.type === 'check') checks.push(s);
  }
  await page.locator('.tl-ready button.tl-card', { hasText: lesson.title }).click();
  const next = page.locator('.st-next');
  let checkIndex = 0;
  for (let guard = 0; guard < 400; guard++) {
    if (await page.locator('.recap').count()) break;
    if (await next.isEnabled()) { await page.keyboard.press('ArrowRight'); continue; }
    // Next is held: find what is waiting
    const pending = page.locator('.st-problem.pending');
    if (await pending.count()) {
      const pid = await pending.first().getAttribute('data-problem');
      await solveProblem(page, page.locator(`.st-problem[data-problem="${pid}"]`), problems[pid]);
      continue;
    }
    const turn = page.locator('.turn .choice[data-opt="ok"]');
    if (await turn.count()) { await turn.first().click(); continue; }
    const openCheck = page.locator('.check .choice:not(:disabled)');
    if (await openCheck.count()) {
      const step = checks[checkIndex++];
      await page.locator(`.check .choice:not(:disabled)[data-opt="${step.answer}"]`).click();
      continue;
    }
    const widgetBtn = page.locator('.st-widget .w-controls:not([hidden]) button');
    if (await widgetBtn.count()) { await widgetBtn.last().click(); await page.waitForTimeout(80); continue; }
    failures.push(`${id}: stuck with Next disabled ("${await next.innerText()}")`);
    break;
  }
  expect(await page.locator('.recap').count() === 1, `${id}: never reached the recap`);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('mathStudio.stories.v1')));
  expect(stored.lessons[id] && stored.lessons[id].done, `${id}: done flag not saved`);
  expect(await page.locator('.katex-error').count() === 0, `${id}: KaTeX errors: ${await page.locator('.katex-error').allInnerTexts()}`);

  // Resume after reload lands on the finished lesson with everything answered
  await page.reload();
  await page.locator('.recap').waitFor();
  expect(await page.locator('.st-problem.pending').count() === 0, `${id}: resumed lesson has unanswered problems`);

  // The Practise link opens the right Practice tab
  if ((lesson.practiceLinks || []).length) {
    const link = lesson.practiceLinks[0];
    await page.locator('.recap button', { hasText: link.label }).click();
    expect(await page.locator('#practicePane').isVisible(), `${id}: Practise link did not open Practice`);
    expect(await page.locator('.type-btn.active').count() === 1, `${id}: no active problem type after Practise link`);
    await page.locator('.subject-btn', { hasText: 'Stories' }).click();
    await page.locator('.st-top .link-btn', { hasText: 'All stories' }).click();
  }
}

(async () => {
  const server = await serve();
  const base = `http://localhost:${server.address().port}/math/`;
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  const consoleErrors = [];
  // Failed requests are reported with their URL by the response listener instead
  page.on('console', (m) => { if (m.type() === 'error' && !/^Failed to load resource/.test(m.text())) consoleErrors.push(m.text()); });
  page.on('response', (r) => { if (r.status() >= 400) consoleErrors.push(`${r.status()} ${r.url()}`); });
  page.on('pageerror', (e) => consoleErrors.push(e.message));

  await page.goto(base);
  await page.locator('.tl-card').first().waitFor();
  const cards = await page.locator('.tl-act .tl-card').count();
  const built = Object.keys(DATA.content);
  expect(cards === DATA.lessons.length, `timeline shows ${cards} lessons, expected ${DATA.lessons.length}`);
  expect(await page.locator('.tl-act button.tl-card').count() === built.length, 'number of clickable timeline lessons does not match built lessons');
  expect(await page.locator('.tl-ready button.tl-card').count() === built.length, '"Ready now" does not list every built lesson');
  expect(await page.locator('.subject-btn.active').innerText() === 'Stories', 'Stories is not the default tab');

  for (const id of built) await walkLesson(page, id);

  // By strand view
  await page.locator('.pill', { hasText: 'By strand' }).click();
  expect(await page.locator('.tl-act').count() >= 5, 'strand view did not render');

  // Phone width: no horizontal scroll on the timeline or in a lesson
  await page.setViewportSize({ width: 390, height: 800 });
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(await overflow() <= 0, `timeline scrolls sideways at 390px (${await overflow()}px)`);
  await page.locator('button.tl-card').first().click();
  await page.locator('.recap').waitFor();
  expect(await overflow() <= 0, `lesson scrolls sideways at 390px (${await overflow()}px)`);
  if (process.env.SHOTS) {
    await page.screenshot({ path: path.join(process.env.SHOTS, 'lesson-390.png'), fullPage: true });
  }

  expect(consoleErrors.length === 0, `console errors: ${consoleErrors.join(' | ')}`);
  await browser.close();
  server.close();
  if (failures.length) {
    console.error(failures.map((f) => '✗ ' + f).join('\n'));
    process.exit(1);
  }
  console.log(`✓ walkthrough OK: ${built.length} lesson(s) walked, ${DATA.lessons.length} on the timeline.`);
})().catch((e) => { console.error(e); process.exit(1); });
