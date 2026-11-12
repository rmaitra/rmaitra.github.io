(() => {
  'use strict';

  // Languages the app can teach. Each has its own data file and its own saved progress
  // (Italian keeps its original storage key so existing progress still loads).
  const LANGS = [
    { code: 'it', name: 'Italiano', app: 'Italiano Studio', file: 'data/italian.json', storeKey: 'italiano.v1', backup: 'italiano-studio' },
    { code: 'es', name: 'Español', app: 'Español Studio', file: 'data/spanish.json', storeKey: 'espanol.v1', backup: 'espanol-studio' },
    { code: 'ar', name: 'العربية', app: 'Arabic Studio', file: 'data/arabic.json', storeKey: 'arabiya.v1', backup: 'arabic-studio', uiLang: 'en' },
  ];
  const LANG_KEY = 'studio.lang';
  const LANG = (() => {
    const find = (code) => LANGS.find((l) => l.code === code);
    const fromUrl = find(new URLSearchParams(location.search).get('lang'));
    let stored = null;
    try { stored = find(localStorage.getItem(LANG_KEY)); } catch (e) { /* storage unavailable */ }
    const lang = fromUrl || stored || LANGS[0];
    try { localStorage.setItem(LANG_KEY, lang.code); } catch (e) { /* ignore */ }
    return lang;
  })();
  const STORE_KEY = LANG.storeKey;
  const DAY = 86400000;
  const BOX_DAYS = [0, 1, 3, 7, 14, 30]; // Leitner: days until next review, by box
  const MASTERED_BOX = 3;
  const RECENT_WINDOW = 3; // don't repeat an item within this many questions
  // Filled from the language data in init(): subject pronoun per person, helper keys for typing
  let PERSON_LABEL = {};
  let ACCENTS = [];
  let SUBJECT_RE = /^$/;
  // UI text can say {lang} for the language name ("Italian", "Spanish")
  const tl = (s) => String(s).replace(/\{lang\}/g, data ? data.name : '');
  // Arabic script (data.script === 'arabic'): right-to-left text, romanization, lenient matching
  let AR = false;
  const AT = window.ArabicText;

  const pane = document.getElementById('pane');
  let data = null;
  let state = load();
  const recent = {};
  const itemCache = {};
  let keyHandler = null;

  // ---------- small helpers ----------
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
  const norm = (s) => s.normalize('NFC').toLowerCase().replace(/[’‘`´]/g, "'").replace(/\s+/g, ' ').trim();
  const stripAccents = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  // Trailing . ? ! (and Arabic ؟) and Spanish-style leading ¿ ¡ (so the first tile doesn't give itself away)
  const stripEnd = (s) => s.replace(/^[¿¡]+/, '').replace(/[.?!؟]+$/, '');
  const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const withArticle = (art, word) => (art.endsWith("'") ? art + word : art + ' ' + word);
  // The word a verb or noun is shown as. Italian and Spanish ids are the words themselves;
  // Arabic entries have ascii ids and the Arabic in `it`.
  const vw = (v) => v.it || v.id;
  const nw = (n) => n.it || n.id;
  const nounDisplay = (n) => (n.art ? withArticle(n.art, nw(n)) : nw(n));
  const pluralDisplay = (n) => (n.plural == null ? null : n.art ? withArticle(pluralArticle(n), n.plural) : n.plural);
  const romanOf = (text, tr) => (AR ? tr || AT.romanize(text) : '');
  // Target-language text. Latin languages: the plain string. Arabic: the Arabic (right to left,
  // vowel marks unless turned off) with its romanization underneath (or beside, `inline`).
  function target(text, opts = {}) {
    if (!AR || text == null) return text;
    const shown = opts.marks || !state.hideMarks ? text : AT.stripMarks(text);
    const tr = opts.tr === false ? '' : romanOf(text, opts.tr);
    return h('span', { class: 'tgt' + (opts.inline ? ' inline' : '') },
      h('bdi', { class: 'ar', lang: 'ar', dir: 'rtl' }, shown), tr ? h('span', { class: 'tr' }, tr) : null);
  }
  // Arabic without romanization (alphabet prompts), always with vowel marks
  const arOnly = (text, cls) => h('bdi', { class: 'ar' + (cls ? ' ' + cls : ''), lang: 'ar', dir: 'rtl' }, text);
  // Target text inside a plain-text note: romanized for Arabic, so English lines stay left to right
  const plainTarget = (text) => (AR ? AT.romanize(text) : text);
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ---------- persistence ----------
  function defaults() {
    return {
      srs: {}, correct: 0, total: 0, streak: 0, mode: 'lessons', table: 'verbs', tableTense: 'present', filters: {}, settings: {}, autoplay: false,
      lessons: {}, lesson: null, lessonAudio: false, lessonHandsFree: false, lessonHideEn: false,
      log: [], time: { total: 0, days: {} },
    };
  }
  // Fill a stored (or imported) state with defaults for anything missing.
  // A function declaration, not a const: load() runs at startup, above this line.
  function hydrate(s) {
    return { ...defaults(), ...s, time: { total: 0, days: {}, ...s.time }, log: Array.isArray(s.log) ? s.log : [] };
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(STORE_KEY));
      if (s && s.srs) return hydrate(s);
    } catch (e) { /* storage unavailable or corrupt */ }
    return defaults();
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  // ---------- study time ----------
  // Counts time while the page is visible and the learner did something (or speech was
  // playing) in the last minute. Stored per local day in state.time.
  const IDLE_AFTER = 60000;
  const TICK = 15000;
  let lastActive = Date.now();
  let lastTick = Date.now();
  const markActive = () => { lastActive = Date.now(); };
  const dayKey = (t) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  function tickTime() {
    const now = Date.now();
    const elapsed = Math.min(now - lastTick, TICK * 2);
    lastTick = now;
    if (document.visibilityState !== 'visible' || now - lastActive > IDLE_AFTER) return;
    const day = dayKey(now);
    state.time.total += elapsed;
    state.time.days[day] = (state.time.days[day] || 0) + elapsed;
    save();
  }
  function startTimeTracking() {
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((ev) => document.addEventListener(ev, markActive, { passive: true }));
    document.addEventListener('visibilitychange', () => { lastTick = Date.now(); markActive(); });
    setInterval(tickTime, TICK);
  }

  // ---------- spaced repetition (Leitner boxes) ----------
  // Every graded answer is also logged as [time, itemId, ok 1/0, box before (-1 = first try), kind]
  // for the Progress tab; kind is 'choice', 'typed' or 'tiles'.
  const LOG_MAX = 5000;
  function record(id, ok, kind) {
    const r = state.srs[id] || { box: 0, due: 0, seen: 0, right: 0 };
    state.log.push([Date.now(), id, ok ? 1 : 0, r.seen ? r.box : -1, kind || 'choice']);
    if (state.log.length > LOG_MAX) state.log.splice(0, state.log.length - LOG_MAX);
    r.seen++;
    if (ok) {
      r.right++;
      r.box = Math.min(r.box + 1, BOX_DAYS.length - 1);
      r.due = Date.now() + BOX_DAYS[r.box] * DAY;
    } else {
      r.box = 0;
      r.due = Date.now();
    }
    state.srs[id] = r;
    state.total++;
    if (ok) { state.correct++; state.streak++; } else { state.streak = 0; }
    save();
    renderScore();
    renderStats();
  }

  // ---------- topic / type filters ----------
  const FILTER_KEYS = { alphabet: ['akind', 'group'], verbs: ['tense', 'person'], nouns: ['topic'], sentences: ['topic', 'type', 'function'], listening: ['kind', 'topic'] };
  const FILTER_LABEL = { tense: 'Tense', person: 'Person', topic: 'Topic', type: 'Type', function: 'Function', kind: 'Hear', akind: 'Drill', group: 'Letters' };
  const DEFAULT_FILTERS = { verbs: { tense: 'present' }, alphabet: { group: 'g1' } };
  const filterList = (key) => ({
    topic: data.topics, type: data.sentenceTypes, tense: data.tenseOptions, person: data.personOptions, function: data.functions, kind: LISTEN_KINDS,
    akind: ALPHA_KINDS, group: data.alphabet ? data.alphabet.groups : [],
  })[key];
  // Non-filtering options shown as extra pill rows (persisted in state.settings)
  const SETTINGS = {
    verbs: [{
      key: 'format', label: 'Format', fallback: 'mixed',
      options: [{ id: 'mixed', label: 'Mixed' }, { id: 'choose', label: 'Choose' }, { id: 'type', label: 'Type' }],
    }],
    nouns: [{
      key: 'drill', label: 'Drill', fallback: 'mixed',
      // Languages without articles (Arabic) drill reading and plurals instead
      get options() {
        return data && !data.grammar.articles
          ? [{ id: 'mixed', label: 'Mixed' }, { id: 'meaning', label: 'English → {lang}' }, { id: 'reading', label: '{lang} → English' }, { id: 'plural', label: 'Plural' }]
          : [{ id: 'mixed', label: 'Mixed' }, { id: 'article', label: 'Article' }, { id: 'meaning', label: 'Meaning' }];
      },
    }],
    reading: [{
      key: 'direction', label: 'Direction', fallback: 'it-en',
      options: [{ id: 'it-en', label: '{lang} → English' }, { id: 'en-it', label: 'English → {lang}' }],
    }],
  };
  const getSetting = (mode, key) => ((state.settings && state.settings[mode]) || {})[key] || SETTINGS[mode].find((x) => x.key === key).fallback;
  const labelOf = (list, id) => (list.find((x) => x.id === id) || {}).label || id;
  const activeFilters = (mode) => (state.filters && state.filters[mode]) || DEFAULT_FILTERS[mode] || {};
  const matchesFilters = (item, mode, filters, skipKey) => (FILTER_KEYS[mode] || []).every((k) =>
    k === skipKey || !filters[k] || filters[k] === 'all' || item[k] === filters[k]);
  const poolFor = (mode) => getItems(mode).filter((i) => matchesFilters(i, mode, activeFilters(mode)));

  // Due items first (weakest box, oldest due), otherwise introduce a random
  // unseen item, otherwise practise one of the soonest-due items.
  function pickNext(mode) {
    const items = poolFor(mode);
    const now = Date.now();
    const last = (recent[mode] = recent[mode] || []);
    let pool = items.filter((i) => !last.includes(i.id));
    if (!pool.length) pool = items;

    const due = [];
    const fresh = [];
    for (const i of pool) {
      const r = state.srs[i.id];
      if (!r) fresh.push(i);
      else if (r.due <= now) due.push(i);
    }

    let pick;
    if (due.length && (!fresh.length || due.length >= 5 || Math.random() < 0.7)) {
      due.sort((a, b) => state.srs[a.id].box - state.srs[b.id].box || state.srs[a.id].due - state.srs[b.id].due);
      pick = due[Math.floor(Math.random() * Math.min(3, due.length))];
    } else if (fresh.length) {
      pick = pickRandom(fresh);
    } else {
      const soonest = pool.slice().sort((a, b) => state.srs[a.id].due - state.srs[b.id].due);
      pick = pickRandom(soonest.slice(0, 3));
    }
    last.push(pick.id);
    if (last.length > RECENT_WINDOW) last.shift();
    return pick;
  }

  // ---------- exercise item pools ----------
  const MODES = {
    alphabet: {
      label: 'Alphabet',
      desc: 'Learn the letters: their sounds, their shapes at the start, middle and end of a word, the vowel marks, and then read real words. Pick a letter group to focus on.',
      build: alphabetItems,
      render: renderAlphabet,
    },
    verbs: {
      label: 'Verbs',
      desc: 'Conjugate the most common verbs. Pick a tense and person, and choose whether to select or type the answer.',
      build: () => data.verbs.flatMap((verb) =>
        Object.keys(verb.tenses).flatMap((tense) =>
          data.persons.map((person) => ({
            id: `v:${verb.id}:${tense}:${person}`, rank: verb.rank, verb, tense, person, form: verb.tenses[tense][person],
          })))),
      render: renderVerb,
    },
    nouns: {
      label: 'Nouns',
      desc: 'Pick the right article, or pick the noun that matches an English meaning. Watch for lo / l’ and un / uno / un’.',
      build: () => data.nouns.map((noun) => ({ id: `n:${noun.id}`, rank: noun.rank, topic: noun.topic, noun })),
      render: renderNoun,
    },
    numbers: {
      label: 'Numbers',
      desc: 'Numbers 1\u2013100. Type the word, or pick the digits.',
      build: () => data.numbers.map((num) => ({ id: `#:${num.value}`, rank: num.rank, num })),
      render: renderNumber,
    },
    sentences: {
      label: 'Sentences',
      desc: 'Translate by tapping the {lang} words into the right order.',
      build: () => [
        ...data.questions.map((s) => ({ id: `q:${s.id}`, rank: s.rank, topic: s.topic, type: s.type, function: s.function, s, isQuestion: true })),
        ...data.sentences.map((s) => ({ id: `s:${s.id}`, rank: s.rank, topic: s.topic, type: s.type, function: s.function, s, isQuestion: false })),
      ],
      render: renderSentence,
    },
    reading: {
      label: 'Reading',
      desc: 'Real {lang}, from Wikipedia — translate each sentence by tapping the words into order. Vocabulary here goes beyond the rest of the app.',
      build: () => data.readings.flatMap((r, ri) => r.sentences.map((s, si) => ({
        id: `r:${s.id}`, rank: s.rank, reading: r, sIndex: si, s,
      }))),
      render: renderReading,
    },
    listening: {
      label: 'Listening',
      desc: 'Dictation: listen to a word or a sentence and type what you hear. Replay as often as you like, at normal or slow speed.',
      build: listeningItems,
      render: renderListening,
    },
  };
  function getItems(mode) {
    return itemCache[mode] || (itemCache[mode] = MODES[mode].build());
  }

  // ---------- audio (browser speech synthesis) ----------
  // A segment is { text, lang: 'target' | 'en', voice?, pitch?, rate? }; 'target' is the
  // language being learned (data.speechLang), 'en' is used for lesson narration.
  const canSpeak = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  let noTargetVoice = false; // Arabic only: the browser has voices, but none for the language
  let speechRun = 0;
  const speechLang = (seg) => (seg.lang === 'en' ? 'en-US' : data.speechLang || data.language);
  function pickVoice(lang, n) {
    const want = lang.toLowerCase();
    const voices = speechSynthesis.getVoices()
      .filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(want.slice(0, 2)))
      .sort((a, b) => (b.lang.toLowerCase().replace('_', '-') === want) - (a.lang.toLowerCase().replace('_', '-') === want));
    return voices.length ? voices[n % voices.length] : null;
  }
  function utter(seg) {
    return new Promise((resolve) => {
      // Read "ciao / salve" as a pause rather than "slash", and drop ellipses
      const u = new SpeechSynthesisUtterance(seg.text.replace(/\s*\/\s*/g, ', ').replace(/…/g, ' '));
      u.lang = speechLang(seg);
      const voice = pickVoice(u.lang, seg.voice || 0);
      // With no Arabic voice the default (English) voice would read garbage: stay silent
      if (!voice && AR && seg.lang !== 'en' && speechSynthesis.getVoices().length) { resolve(); return; }
      if (voice) u.voice = voice;
      u.rate = seg.rate || (seg.lang === 'en' ? 1 : 0.9);
      u.pitch = seg.pitch || 1;
      const timer = setTimeout(resolve, 3000 + seg.text.length * 120); // some engines never fire onend
      u.onend = u.onerror = () => { clearTimeout(timer); markActive(); resolve(); };
      markActive();
      speechSynthesis.speak(u);
    });
  }
  // Speak segments in order; resolves true only if nothing interrupted them
  function say(segments) {
    if (!canSpeak || !segments.length) return Promise.resolve(false);
    const run = ++speechRun;
    speechSynthesis.cancel();
    return segments.reduce((p, seg) => p.then(() => run === speechRun && utter(seg)), Promise.resolve())
      .then(() => run === speechRun);
  }
  // Many desktop browsers ship no Arabic voice: hide the audio controls and say so
  function checkVoices() {
    if (!canSpeak || !AR || !speechSynthesis.getVoices().length) return;
    const none = !pickVoice(data.speechLang, 0);
    if (none === noTargetVoice) return;
    noTargetVoice = none;
    document.body.classList.toggle('no-voice', none);
    const note = document.getElementById('voiceNote');
    note.hidden = !none;
    note.textContent = tl('This browser has no {lang} voice, so audio is off. Microsoft Edge, Safari and Chrome on Android include one.');
    if (state.mode === 'listening') show();
  }
  function stopSpeech() {
    speechRun++;
    if (canSpeak) speechSynthesis.cancel();
  }
  const speak = (text) => { say([{ text, lang: 'target' }]); };
  const speakBtn = (text) => canSpeak ? h('button', { class: 'speak', title: 'Listen', 'aria-label': 'Listen', onclick: () => speak(text) }, '🔊') : null;
  const autoSpeak = (text) => { if (state.autoplay) speak(text); };

  // ---------- shared UI ----------
  function feedbackBox(ok, verdictText, ...body) {
    return h('div', { class: 'feedback ' + (ok ? 'good' : 'bad') }, h('div', { class: 'verdict' }, verdictText), ...body);
  }
  function nextButton(ctx) {
    return h('button', { class: 'btn', onclick: ctx.next }, 'Next →');
  }
  function afterAnswer(ctx, actionsEl, nextBtn) {
    actionsEl.replaceChildren(nextBtn);
    nextBtn.focus();
    keyHandler = (e) => { if (e.key === 'Enter') ctx.next(); };
  }

  // ---------- 0. alphabet (Arabic script) ----------
  // Four drills over data.alphabet: letter and sound (ab:<letter>), letter shapes by position
  // (ab:<letter>:i|m|f), vowel marks on a syllable (ab:mark:<id>), and reading real words from
  // the vocabulary (ab:w:n|a|v:<id>). Items carry the letter group they need, for the filter.
  const ALPHA_KINDS = [{ id: 'letter', label: 'Letters' }, { id: 'form', label: 'Shapes' }, { id: 'mark', label: 'Vowel marks' }, { id: 'word', label: 'Read words' }];
  const POS_LABEL = { i: 'at the start of a word', m: 'in the middle of a word', f: 'at the end of a word' };
  const POS_SHORT = { i: 'start', m: 'middle', f: 'end' };
  const TATWEEL = 'ـ';
  const letterForm = (L, pos) => (pos === 'i' ? L.ch + TATWEEL : pos === 'm' ? TATWEEL + L.ch + TATWEEL : pos === 'f' ? TATWEEL + L.ch : L.ch);
  const groupNum = (g) => Number(String(g).replace(/\D/g, '')) || 1;
  const letterById = (id) => data.alphabet.letters.find((L) => L.id === id);
  const letterOfChar = (ch) => data.alphabet.letters.find((L) => L.ch === ch) || ('أإآؤئ'.includes(ch) ? letterById('hamza') : null);
  // The letter group a word needs: its hardest letter or mark (hamza seats count as hamza)
  function wordGroup(text) {
    const markGroup = (id) => groupNum((data.alphabet.marks.find((m) => m.id === id) || { group: 'g1' }).group);
    let g = 1;
    for (const u of AT.units(text)) {
      const L = u.ch && letterOfChar(u.ch);
      if (L) g = Math.max(g, groupNum(L.group));
      if (u.marks.includes('ّ')) g = Math.max(g, markGroup('shadda'));
      if (u.marks.some((m) => 'ًٌٍ'.includes(m))) g = Math.max(g, markGroup('tanwin_a'));
    }
    return g;
  }
  function alphabetItems() {
    if (!data.alphabet) return [];
    const items = [];
    data.alphabet.letters.forEach((L) => {
      items.push({ id: `ab:${L.id}`, akind: 'letter', group: L.group, L });
      L.positions.forEach((pos) => items.push({ id: `ab:${L.id}:${pos}`, akind: 'form', group: L.group, L, pos }));
    });
    data.alphabet.marks.forEach((M) => items.push({ id: `ab:mark:${M.id}`, akind: 'mark', group: M.group, M }));
    const seen = new Set();
    [
      ...data.nouns.map((n) => ({ key: `n:${n.id}`, it: nw(n), en: n.en })),
      ...data.adjectives.map((a) => ({ key: `a:${a.id}`, it: a.forms.ms, en: a.en })),
      ...data.verbs.map((v) => ({ key: `v:${v.id}`, it: vw(v), en: `${v.en} (he did it, past)` })),
    ].forEach((w) => {
      if (seen.has(AT.fold(w.it))) return;
      seen.add(AT.fold(w.it));
      items.push({ id: `ab:w:${w.key}`, akind: 'word', group: `g${wordGroup(w.it)}`, w });
    });
    return items;
  }
  // Up to n other letters with different sounds: look-alikes first, then the same group
  function similarLetters(L, n, allow = () => true) {
    const all = data.alphabet.letters.filter((x) => x !== L && x.sound !== L.sound && allow(x));
    const sim = shuffle(L.similar.map(letterById).filter((x) => x && all.includes(x)));
    const same = shuffle(all.filter((x) => x.group === L.group && !sim.includes(x)));
    const rest = shuffle(all.filter((x) => !sim.includes(x) && !same.includes(x)));
    const out = [];
    for (const x of [...sim, ...same, ...rest]) if (out.length < n && !out.some((o) => o.sound === x.sound)) out.push(x);
    return out;
  }
  // A letter's shapes (alone, start, middle, end), name, sound, tip and an example word
  function letterCard(L, pos) {
    const shapes = [['alone', L.ch, null], ...L.positions.map((p) => [POS_SHORT[p], letterForm(L, p), p])];
    return h('div', { class: 'letter-card' },
      h('div', { class: 'shapes', dir: 'rtl' }, shapes.map(([label, glyph, p]) =>
        h('div', { class: 'shape' + (p === (pos || null) ? ' on' : '') }, arOnly(glyph, 'glyph-shape'), h('span', {}, label)))),
      h('div', { class: 'note' }, target(L.name, { inline: true, marks: true }), ` · sound: ${L.sound}`, !L.joins && L.positions.length ? ' · doesn’t join the next letter' : ''),
      h('div', { class: 'note' }, L.tip),
      h('div', { class: 'example' }, speakBtn(L.example.it), h('span', {}, target(L.example.it, { inline: true, tr: L.example.tr, marks: true }), ' — ' + L.example.en)));
  }
  function renderAlphaLetter(item, ctx) {
    const { L } = item;
    const showGlyph = Math.random() < 0.5;
    choiceCard(ctx, {
      eyebrow: showGlyph ? 'What sound does this letter make?' : 'Which letter makes this sound?',
      prompt: showGlyph ? arOnly(L.ch, 'glyph')
        : [h('span', { class: 'sound-prompt' }, L.sound), h('span', { class: 'gloss-inline' }, AT.romanize(L.name)), speakBtn(L.name)],
      options: shuffle([L, ...similarLetters(L, 3)]), correct: L, say: L.name,
      label: showGlyph ? (o) => [h('span', { class: 'opt-main' }, o.sound), h('span', { class: 'opt-sub' }, AT.romanize(o.name))] : (o) => arOnly(o.ch, 'glyph-opt'),
      feedback: (ok, pick) => [letterCard(L),
        !ok ? h('div', { class: 'note' }, 'You picked ', arOnly(pick.ch), ` (${AT.romanize(pick.name)}, ${pick.sound}).`) : null],
    });
  }
  function renderAlphaForm(item, ctx) {
    const { L, pos } = item;
    choiceCard(ctx, {
      eyebrow: `Which letter is this? · ${POS_LABEL[pos]}`, prompt: arOnly(letterForm(L, pos), 'glyph'),
      options: shuffle([L, ...similarLetters(L, 3, (x) => x.positions.includes(pos))]), correct: L, say: L.name,
      label: (o) => arOnly(o.ch, 'glyph-opt'),
      feedback: (ok, pick) => [letterCard(L, pos),
        !ok ? h('div', { class: 'note' }, 'You picked ', arOnly(pick.ch), ` (${AT.romanize(pick.name)}), which looks like `, arOnly(letterForm(pick, pos)), ' here.') : null],
    });
  }
  // A syllable built from the mark's template (C and D are random consonants the learner knows)
  function renderAlphaMark(item, ctx) {
    const { M } = item;
    // Consonants from the letter group being practised (all of them under "All")
    const chosen = activeFilters('alphabet').group;
    const upTo = Math.min(4, Math.max(groupNum(M.group), chosen && chosen !== 'all' ? groupNum(chosen) : 4));
    const pool = data.alphabet.letters.filter((x) => x.consonant && groupNum(x.group) <= upTo);
    const [C, D] = shuffle(pool);
    const fill = (tpl) => tpl.replace('C', C.ch).replace('D', D.ch);
    const text = fill(M.tpl);
    const answer = AT.romanize(text);
    const others = shuffle(data.alphabet.marks.filter((x) => x !== M)).sort((a, b) => (b.set === M.set) - (a.set === M.set));
    const options = [answer];
    for (const o of others) { const r = AT.romanize(fill(o.tpl)); if (options.length < 4 && !options.includes(r)) options.push(r); }
    choiceCard(ctx, {
      eyebrow: 'How do you read this?', prompt: arOnly(text, 'glyph'), options: shuffle(options), correct: answer, label: (o) => o, say: text,
      feedback: () => [h('div', { class: 'answer' }, target(text, { marks: true, inline: true })),
        h('div', { class: 'note' }, target(M.name, { inline: true, marks: true }), ' — ' + M.en), h('div', { class: 'example' }, speakBtn(text))],
    });
  }
  // Each letter of a word with its sound and vowel
  function spellOut(word) {
    const vowel = { 'َ': 'a', 'ِ': 'i', 'ُ': 'u', 'ً': 'an', 'ٍ': 'in', 'ٌ': 'un', 'ٰ': 'ā' };
    return AT.units(word).filter((u) => u.ch).map((u) => {
      const L = letterOfChar(u.ch);
      const v = u.marks.map((m) => vowel[m] || '').join('');
      return h('span', { class: 'spell-chip' }, arOnly(u.ch + u.marks.join('')),
        h('span', {}, (L ? L.sound : u.ch) + (u.marks.includes('ّ') ? ' ×2' : '') + (v ? ' + ' + v : '')));
    });
  }
  const accentBar = (input) => h('div', { class: 'accents' }, ACCENTS.map((ch) =>
    h('button', {
      class: 'accent-btn', type: 'button', tabindex: '-1',
      onclick: () => { input.setRangeText(ch, input.selectionStart, input.selectionEnd, 'end'); input.focus(); },
    }, ch)));
  function renderAlphaWord(item, ctx) {
    const { w } = item;
    let answered = false;
    const input = h('input', { type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'How the word sounds', placeholder: 'Type it in Latin letters…' });
    const accents = accentBar(input);
    const feedback = h('div');
    const actions = h('div', { class: 'actions' },
      h('button', { class: 'btn', onclick: check }, 'Check'),
      h('button', { class: 'btn secondary', onclick: () => finish('', true) }, "I don't know"));
    pane.append(h('div', { class: 'card' },
      h('div', { class: 'eyebrow' }, 'Read this word'),
      h('div', { class: 'big' }, arOnly(w.it, 'glyph-word')),
      h('div', { class: 'gloss' }, 'Type how it sounds. Long-vowel lines, dots and ʿ are optional: kitab is fine for kitāb.'),
      h('div', { class: 'prompt-row' }, input), accents, actions, feedback));
    input.focus();
    keyHandler = (e) => { if (e.key === 'Enter') check(); };
    function check() { if (!answered && input.value.trim()) finish(input.value, false); }
    function finish(guess, gaveUp) {
      if (answered) return;
      answered = true;
      input.disabled = true;
      accents.remove();
      const res = gaveUp || AT.hasArabic(guess) ? { ok: false } : AT.match(guess, [w.it]);
      ctx.grade(res.ok, 'typed');
      feedback.replaceChildren(feedbackBox(res.ok, res.ok ? 'Correct!' : gaveUp ? 'Answer' : 'Not quite',
        h('div', { class: 'answer' }, target(w.it, { marks: true, inline: true })),
        res.close ? h('div', { class: 'note' }, 'Spelled exactly: ' + res.close) : null,
        !res.ok && !gaveUp ? h('div', { class: 'note' }, 'You typed: ' + guess.trim()) : null,
        h('div', { class: 'note' }, 'It means: ' + w.en),
        h('div', { class: 'spell', dir: 'rtl' }, spellOut(w.it)),
        h('div', { class: 'example' }, speakBtn(w.it))));
      autoSpeak(w.it);
      afterAnswer(ctx, actions, nextButton(ctx));
    }
  }
  function renderAlphabet(item, ctx) {
    ({ letter: renderAlphaLetter, form: renderAlphaForm, mark: renderAlphaMark, word: renderAlphaWord })[item.akind](item, ctx);
  }

  // ---------- 1. verb conjugation ----------
  // Accepted spellings of a form; "andato/a" also accepts "andato" and "andata"
  const verbAnswers = (form) => {
    const m = form.match(/^(.*)(.)\/(.)$/);
    return m ? [form, m[1] + m[2], m[1] + m[3]] : [form];
  };
  const spokenForm = (form) => form.replace(/\/\w$/, '');
  const spokenPerson = (p) => PERSON_LABEL[p].split(' ')[0];
  const personEn = (p) => (data.personOptions.find((o) => o.id === p) || {}).en || '';

  function checkVerb(guess, item) {
    if (AR) {
      // Arabic or romanized, with or without the subject pronoun (anā aktubu)
      const words = guess.trim().split(/\s+/);
      const pron = AT.fold(PERSON_LABEL[item.person]);
      const romanPron = AT.foldRoman(AT.romanize(PERSON_LABEL[item.person]));
      if (words.length > 1 && (AT.fold(words[0]) === pron || AT.foldRoman(words[0]) === romanPron)) words.shift();
      const res = AT.match(words.join(' '), [item.form]);
      return { ok: res.ok, romanNote: res.close };
    }
    const targets = verbAnswers(item.form).map(norm);
    const g = norm(guess).replace(SUBJECT_RE, '');
    if (targets.includes(g)) return { ok: true };
    if (targets.map(stripAccents).includes(stripAccents(g))) return { ok: true, accentNote: true };
    return { ok: false };
  }

  // Three wrong options: the same verb and tense in other persons, topped up from other tenses
  function verbChoices(item) {
    const { verb, tense, person, form } = item;
    const banned = new Set(verbAnswers(form).map(norm));
    const pool = [];
    const add = (f) => { if (!banned.has(norm(f)) && !pool.includes(f)) pool.push(f); };
    shuffle(data.persons.filter((p) => p !== person)).forEach((p) => add(verb.tenses[tense][p]));
    if (pool.length < 3) shuffle(Object.keys(verb.tenses).filter((t) => t !== tense)).forEach((t) => add(verb.tenses[t][person]));
    return shuffle([form, ...pool.slice(0, 3)]);
  }

  function renderVerb(item, ctx) {
    const { verb, tense, person, form } = item;
    const format = getSetting('verbs', 'format');
    const choosing = format === 'choose' || (format === 'mixed' && Math.random() < 0.5);
    const tenseInfo = data.tenseOptions.find((t) => t.id === tense) || {};
    let answered = false;
    const feedback = h('div');
    const actions = h('div', { class: 'actions' });
    const prompt = h('div', { class: 'prompt-row' }, h('div', { class: 'pronoun-block' },
      h('div', { class: 'pronoun' }, target(PERSON_LABEL[person])), h('div', { class: 'pronoun-en' }, personEn(person))));
    let input = null;
    let accents = null;
    let options = [];
    let buttons = [];
    const body = [prompt];

    if (choosing) {
      options = verbChoices(item);
      buttons = options.map((opt, i) =>
        h('button', { class: 'option', onclick: () => finish(opt, false) }, target(opt), h('span', { class: 'key' }, String(i + 1))));
      body.push(h('div', { class: 'options two' }, buttons));
      keyHandler = (e) => { const n = Number(e.key); if (n >= 1 && n <= options.length) finish(options[n - 1], false); };
    } else {
      input = h('input', { type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Conjugated form', placeholder: data.ui.inputHint || null });
      prompt.append(input);
      accents = h('div', { class: 'accents' }, ACCENTS.map((ch) =>
        h('button', {
          class: 'accent-btn', type: 'button', tabindex: '-1',
          onclick: () => { input.setRangeText(ch, input.selectionStart, input.selectionEnd, 'end'); input.focus(); },
        }, ch)));
      actions.append(
        h('button', { class: 'btn', onclick: check }, 'Check'),
        h('button', { class: 'btn secondary', onclick: () => finish('', true) }, "I don't know"));
      body.push(accents);
      keyHandler = (e) => { if (e.key === 'Enter') check(); };
    }

    pane.append(h('div', { class: 'card' },
      h('div', { class: 'eyebrow' }, 'Conjugate · ' + (tenseInfo.title || tense) + (choosing ? ' · choose' : ' · type')),
      h('div', { class: 'big' }, target(verb.cite || vw(verb))),
      h('div', { class: 'gloss' }, verb.en + (verb.irregular ? ' · irregular' : '')),
      ...body, actions, feedback));
    if (input) input.focus();

    function check() {
      if (!answered && input.value.trim()) finish(input.value, false);
    }
    function finish(guess, gaveUp) {
      if (answered) return;
      answered = true;
      let res;
      if (choosing) {
        res = { ok: !gaveUp && guess === form };
        buttons.forEach((b, i) => {
          b.disabled = true;
          if (options[i] === form) b.classList.add('correct');
          else if (options[i] === guess) b.classList.add('wrong');
        });
      } else {
        input.disabled = true;
        accents.remove();
        res = gaveUp ? { ok: false } : checkVerb(guess, item);
      }
      ctx.grade(res.ok, choosing ? 'choice' : 'typed');

      const table = verb.tenses[tense];
      const example = verb.examples.find((x) => x.tense === tense);
      feedback.replaceChildren(feedbackBox(res.ok, res.ok ? 'Correct!' : 'Not quite',
        h('div', { class: 'answer' }, target(spokenPerson(person) + ' ' + form)),
        res.accentNote ? h('div', { class: 'note' }, 'Mind the accent: ' + form) : null,
        res.romanNote ? h('div', { class: 'note' }, 'Spelled exactly: ' + res.romanNote) : null,
        tenseInfo.description ? h('div', { class: 'note' }, tenseInfo.description) : null,
        h('table', { class: 'conj' }, data.persons.map((p) =>
          h('tr', { class: p === person ? 'asked' : '' }, h('td', {}, target(PERSON_LABEL[p], { inline: true })), h('td', {}, target(table[p], { inline: true }))))),
        example ? h('div', { class: 'example' }, speakBtn(example.it),
          h('span', {}, h('span', { class: 'it' }, target(example.it, { tr: example.tr })), ' — ' + example.en)) : null));
      autoSpeak(spokenPerson(person) + ' ' + spokenForm(form));
      afterAnswer(ctx, actions, nextButton(ctx));
    }
  }

  // ---------- 2. noun articles ----------
  // Article choices and rules come from data.grammar.articles. Lookups try "<article>|<gender>"
  // first (Italian l' depends on gender; Spanish el agua is feminine), then the article alone.
  const articles = () => data.grammar.articles;
  const byArticle = (map, art, gender) => map[`${art}|${gender}`] || map[art];
  const indefiniteFor = (noun) => noun.indef || byArticle(articles().indefiniteOf, noun.art, noun.gender);
  const pluralArticle = (noun) => noun.plArt || byArticle(articles().pluralOf, noun.art, noun.gender);
  const articleRule = (art, gender) => byArticle(articles().rules, art, gender) || '';

  function renderNoun(item, ctx) {
    const drill = getSetting('nouns', 'drill');
    if (!data.grammar.articles) {
      const pick = drill === 'mixed' ? pickRandom(['meaning', 'reading', 'plural']) : drill;
      if (pick === 'plural' && item.noun.plural) renderNounPlural(item, ctx);
      else if (pick === 'reading') renderNounReading(item, ctx);
      else renderNounMeaning(item, ctx);
      return;
    }
    if (drill === 'meaning' || (drill === 'mixed' && Math.random() < 0.5)) renderNounMeaning(item, ctx);
    else renderNounArticle(item, ctx);
  }
  const genderLabel = (n) => (n.gender === 'm' ? 'masculine' : 'feminine');
  // Singular · plural, as shown in noun feedback
  const nounForms = (n) => [target(nounDisplay(n)), ...(pluralDisplay(n) ? ['  ·  ', target(pluralDisplay(n))] : [])];
  // A small choice drill: options are rendered by `label`, `correct` is the right option
  function choiceCard(ctx, { eyebrow, prompt, sub, options, correct, label, kind, feedback: explain, say }) {
    let answered = false;
    const feedback = h('div');
    const actions = h('div', { class: 'actions' });
    const buttons = options.map((o, i) => h('button', { class: 'option', onclick: () => choose(o) }, label(o), h('span', { class: 'key' }, String(i + 1))));
    pane.append(h('div', { class: 'card' },
      h('div', { class: 'eyebrow' }, eyebrow), h('div', { class: 'big' }, prompt), sub ? h('div', { class: 'gloss' }, sub) : null,
      h('div', { class: 'options' }, buttons), feedback, actions));
    keyHandler = (e) => { const n = Number(e.key); if (n >= 1 && n <= options.length) choose(options[n - 1]); };
    function choose(pick) {
      if (answered) return;
      answered = true;
      const ok = pick === correct;
      ctx.grade(ok, kind || 'choice');
      buttons.forEach((b, i) => {
        b.disabled = true;
        if (options[i] === correct) b.classList.add('correct');
        else if (options[i] === pick) b.classList.add('wrong');
      });
      feedback.replaceChildren(feedbackBox(ok, ok ? 'Correct!' : 'Not quite', ...explain(ok, pick)));
      if (say) autoSpeak(say);
      afterAnswer(ctx, actions, nextButton(ctx));
    }
  }
  // Arabic → English
  function renderNounReading(item, ctx) {
    const { noun } = item;
    choiceCard(ctx, {
      eyebrow: tl('What does this {lang} word mean?'), prompt: [target(nw(noun)), speakBtn(nw(noun))],
      options: nounChoices(noun), correct: noun, label: (n) => n.en, say: nw(noun),
      feedback: (ok, pick) => [
        h('div', { class: 'answer' }, nounForms(noun)),
        h('div', { class: 'note' }, `${genderLabel(noun)} — ${noun.en}${noun.root ? ' · root ' : ''}`, noun.root ? target(noun.root, { tr: false }) : null),
        !ok ? h('div', { class: 'note' }, target(nw(pick), { inline: true }), ' means ' + pick.en + '.') : null],
    });
  }
  // Singular → plural (Arabic broken plurals)
  function renderNounPlural(item, ctx) {
    const { noun } = item;
    const others = shuffle(data.nouns.filter((n) => n.plural && n.plural !== noun.plural));
    const options = shuffle([noun, ...others.slice(0, 3)]);
    choiceCard(ctx, {
      eyebrow: 'What is the plural?', prompt: target(nw(noun)), sub: noun.en,
      options, correct: noun, label: (n) => target(n.plural), say: noun.plural,
      feedback: (ok, pick) => [
        h('div', { class: 'answer' }, nounForms(noun)),
        h('div', { class: 'note' }, pluralNote(noun)),
        !ok ? h('div', { class: 'note' }, target(pick.plural, { inline: true }), ' is the plural of ', target(nw(pick), { inline: true }), ' (' + pick.en + ').') : null,
        h('div', { class: 'example' }, speakBtn(noun.plural))],
    });
  }
  // Sound plurals add an ending; broken plurals rearrange the vowels
  function pluralNote(n) {
    const bare = AR ? AT.fold(n.plural) : n.plural;
    if (AR && /ون$/.test(bare)) return 'Sound masculine plural: add -ūn. Used for male people (muʿallim → muʿallimūn).';
    if (AR && /ات$/.test(bare)) return 'Sound feminine plural: -a becomes -āt. Common for words ending in tāʾ marbūṭa.';
    return AR ? 'Broken plural: the consonants stay, the vowels and the pattern change. Learn it with the word.' : '';
  }

  // Three wrong nouns, preferring the same topic
  function nounChoices(noun) {
    const others = shuffle(data.nouns.filter((n) => n.id !== noun.id && n.en !== noun.en));
    const pool = [...others.filter((n) => n.topic === noun.topic), ...others.filter((n) => n.topic !== noun.topic)];
    return shuffle([noun, ...pool.slice(0, 3)]);
  }

  function renderNounMeaning(item, ctx) {
    const { noun } = item;
    const options = nounChoices(noun);
    let answered = false;

    const feedback = h('div');
    const actions = h('div', { class: 'actions' });
    const buttons = options.map((n, i) =>
      h('button', { class: 'option', onclick: () => choose(n) }, target(nounDisplay(n)), h('span', { class: 'key' }, String(i + 1))));

    pane.append(h('div', { class: 'card' },
      h('div', { class: 'eyebrow' }, 'Which noun means'),
      h('div', { class: 'big' }, noun.en),
      h('div', { class: 'options' }, buttons),
      feedback, actions));
    keyHandler = (e) => { const n = Number(e.key); if (n >= 1 && n <= options.length) choose(options[n - 1]); };

    function choose(pick) {
      if (answered) return;
      answered = true;
      const ok = pick === noun;
      ctx.grade(ok);
      buttons.forEach((b, i) => {
        b.disabled = true;
        if (options[i] === noun) b.classList.add('correct');
        else if (options[i] === pick) b.classList.add('wrong');
      });
      const singular = nounDisplay(noun);
      feedback.replaceChildren(feedbackBox(ok, ok ? 'Correct!' : 'Not quite',
        h('div', { class: 'answer' }, nounForms(noun)),
        h('div', { class: 'note' }, genderLabel(noun) + ' — ' + noun.en),
        !ok ? h('div', { class: 'note' }, target(nounDisplay(pick), { inline: true }), ' means ' + pick.en + '.') : null,
        h('div', { class: 'example' }, speakBtn(singular))));
      autoSpeak(singular);
      afterAnswer(ctx, actions, nextButton(ctx));
    }
  }

  function renderNounArticle(item, ctx) {
    const { noun } = item;
    const definite = Math.random() < 0.5;
    const options = definite ? articles().definite : articles().indefinite;
    const correct = definite ? noun.art : indefiniteFor(noun);
    let answered = false;

    const feedback = h('div');
    const actions = h('div', { class: 'actions' });
    const buttons = options.map((opt, i) =>
      h('button', { class: 'option', onclick: () => choose(opt) }, opt, h('span', { class: 'key' }, String(i + 1))));

    pane.append(h('div', { class: 'card' },
      h('div', { class: 'eyebrow' }, definite ? 'Definite article (the)' : 'Indefinite article (a / an)'),
      h('div', { class: 'big' }, h('span', { class: 'blank' }, ' '), noun.id),
      h('div', { class: 'gloss' }, noun.en),
      h('div', { class: 'options' }, buttons),
      feedback, actions));
    keyHandler = (e) => { const n = Number(e.key); if (n >= 1 && n <= options.length) choose(options[n - 1]); };

    function choose(opt) {
      if (answered) return;
      answered = true;
      const ok = opt === correct;
      ctx.grade(ok);
      buttons.forEach((b, i) => {
        b.disabled = true;
        if (options[i] === correct) b.classList.add('correct');
        else if (options[i] === opt) b.classList.add('wrong');
      });
      const singular = withArticle(correct, noun.id);
      const plural = withArticle(pluralArticle(noun), noun.plural);
      feedback.replaceChildren(feedbackBox(ok, ok ? 'Correct!' : 'Not quite',
        h('div', { class: 'answer' }, singular + '  ·  ' + plural),
        h('div', { class: 'note' }, (noun.gender === 'm' ? 'masculine' : 'feminine') + ' — ' + articleRule(correct, noun.gender)),
        h('div', { class: 'example' }, speakBtn(withArticle(noun.art, noun.id)))));
      autoSpeak(withArticle(noun.art, noun.id));
      afterAnswer(ctx, actions, nextButton(ctx));
    }
  }

  // ---------- 5. numbers ----------
  // First matching rule in data.grammar.numberNotes: { from, to, lastDigit?, text }
  function numberNote(v) {
    const rule = (data.grammar.numberNotes || []).find((r) =>
      v >= r.from && v <= r.to && (r.lastDigit == null || v % 10 === r.lastDigit));
    return rule ? rule.text : null;
  }

  function renderNumber(item, ctx) {
    const { num } = item;
    const typed = Math.random() < 0.5;
    let answered = false;
    const feedback = h('div');
    const actions = h('div', { class: 'actions' });
    const showFeedback = (ok, accentNote) => {
      const note = numberNote(num.value);
      feedback.replaceChildren(feedbackBox(ok, ok ? 'Correct!' : 'Not quite',
        h('div', { class: 'answer' }, `${num.value} = `, target(num.it, { tr: num.tr })),
        accentNote ? h('div', { class: 'note' }, (AR ? 'Spelled exactly: ' + romanOf(num.it, num.tr) : 'Mind the accent: ' + num.it)) : null,
        note ? h('div', { class: 'note' }, note) : null,
        h('div', { class: 'example' }, speakBtn(num.it))));
      autoSpeak(num.it);
      afterAnswer(ctx, actions, nextButton(ctx));
    };

    if (typed) {
      const input = h('input', { type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': tl('Number in {lang}'), placeholder: data.ui.inputHint || null });
      actions.append(
        h('button', { class: 'btn', onclick: () => finish(input.value, false) }, 'Check'),
        h('button', { class: 'btn secondary', onclick: () => finish('', true) }, "I don't know"));
      pane.append(h('div', { class: 'card' },
        h('div', { class: 'eyebrow' }, tl('Write this number in {lang}')),
        h('div', { class: 'big' }, String(num.value)),
        h('div', { class: 'prompt-row' }, input), actions, feedback));
      input.focus();
      keyHandler = (e) => { if (e.key === 'Enter') finish(input.value, false); };

      function finish(guess, gaveUp) {
        if (answered || (!gaveUp && !guess.trim())) return;
        answered = true;
        input.disabled = true;
        if (AR) {
          const res = gaveUp ? { ok: false } : AT.match(guess, [num.it], [romanOf(num.it, num.tr)]);
          ctx.grade(res.ok, 'typed');
          showFeedback(res.ok, !!res.close);
          return;
        }
        const exact = !gaveUp && norm(guess) === num.it;
        const ok = exact || (!gaveUp && stripAccents(norm(guess)) === stripAccents(num.it));
        ctx.grade(ok, 'typed');
        showFeedback(ok, ok && !exact);
      }
    } else {
      const nearest = getItems('numbers').filter((i) => i.num.value !== num.value)
        .sort((a, b) => Math.abs(a.num.value - num.value) - Math.abs(b.num.value - num.value)).slice(0, 6);
      const options = shuffle([num.value, ...shuffle(nearest).slice(0, 3).map((i) => i.num.value)]);
      const buttons = options.map((v, i) =>
        h('button', { class: 'option', onclick: () => choose(v) }, String(v), h('span', { class: 'key' }, String(i + 1))));
      pane.append(h('div', { class: 'card' },
        h('div', { class: 'eyebrow' }, 'Which number is this?'),
        h('div', { class: 'big' }, target(num.it, { tr: num.tr }), ' ', speakBtn(num.it)),
        h('div', { class: 'options' }, buttons), feedback, actions));
      keyHandler = (e) => { const n = Number(e.key); if (n >= 1 && n <= options.length) choose(options[n - 1]); };

      function choose(v) {
        if (answered) return;
        answered = true;
        const ok = v === num.value;
        ctx.grade(ok, 'choice');
        buttons.forEach((b, i) => {
          b.disabled = true;
          if (options[i] === num.value) b.classList.add('correct');
          else if (options[i] === v) b.classList.add('wrong');
        });
        showFeedback(ok);
      }
    }
  }

  // ---------- word glosses (sentence feedback) ----------
  // Every known word form -> { en, note, lemma }. Hand-written glossary entries (incl. multi-word
  // phrases) win over articles, prepositions and conjunctions, which win over generated forms.
  // `lemma` is the word family the form belongs to (v:mangiare, n:casa, a:buono, #:20, w:di,
  // g:mio …); multi-word glossary phrases get a p: family of their own.
  let lexicon = null;
  let lexiconFold = null;
  const articleAgreement = (a) => a.gender.split('/').map((g) => (g === 'm' ? 'masc.' : 'fem.')).join(' / ') + ' ' + (a.number === 'pl' ? 'pl.' : 'sing.');
  // Compound numbers (ventitré) count toward their ten (venti)
  const numberFamily = (v) => `#:${v <= 20 || v % 10 === 0 ? v : v - (v % 10)}`;
  function getLexicon() {
    if (lexicon) return lexicon;
    lexicon = new Map();
    // Arabic also gets a lookup without vowel marks (a word can be marked differently in a sentence)
    lexiconFold = new Map();
    const add = (word, en, note, lemma) => {
      const k = norm(word);
      if (!lexicon.has(k)) lexicon.set(k, { en, note, lemma });
      if (AR && !lexiconFold.has(AT.fold(word))) lexiconFold.set(AT.fold(word), { en, note, lemma });
    };
    // A glossary word joins an existing family when one matches (euro → n:euro, vada → v:andare)
    const families = new Map();
    data.verbs.forEach((v) => families.set(norm(vw(v)), `v:${v.id}`));
    data.nouns.forEach((n) => [nw(n), n.plural, n.fem].filter(Boolean).forEach((f) => families.has(norm(f)) || families.set(norm(f), `n:${n.id}`)));
    data.adjectives.forEach((a) => Object.values(a.forms).forEach((f) => families.has(norm(f)) || families.set(norm(f), `a:${a.id}`)));
    (data.glossary || []).forEach((w) => {
      const base = norm(w.lemma || w.it);
      const lemma = /\s/.test(w.it) && !w.lemma ? `p:${base}` : families.get(base) || `g:${base}`;
      add(w.it, w.en, w.pos, lemma);
    });
    (data.articles || []).forEach((a) => add(a.it, a.en, `${a.type} article · ${articleAgreement(a)}`,
      a.type === 'partitive' ? `w:${norm(a.note.split(' ')[0])}` : `art:${a.type}`));
    (data.prepositions || []).filter((p) => !/\s/.test(p.it)).forEach((p) => add(p.it, p.en, p.type === 'articulated' ? p.note : 'preposition',
      `w:${norm(p.type === 'articulated' ? p.note.split(' ')[0] : p.it === 'ad' ? 'a' : p.it)}`));
    (data.conjunctions || []).forEach((c) => add(c.it, c.en, 'conjunction', `w:${norm(c.it)}`));
    const verbForms = new Map();
    data.verbs.forEach((v) => {
      const lemma = `v:${v.id}`;
      add(vw(v), v.en, AR ? 'verb · past, he (dictionary form)' : 'verb · infinitive', lemma);
      Object.entries(v.tenses).forEach(([tense, forms]) => data.persons.forEach((p) => {
        const words = forms[p].split(' ');
        const main = words[words.length - 1];
        const m = main.match(/^(.*)(.)\/(.)$/);
        const variants = m ? [m[1] + m[2], m[1] + m[3]] : [main];
        // Compound tenses: gloss the participle; the auxiliary is glossed as its own verb
        if (words.length > 1) return variants.forEach((w) => add(w, v.en, `verb · participle of ${v.id}`, lemma));
        const key = norm(main) + '|' + tense;
        if (!verbForms.has(key)) verbForms.set(key, { word: main, v, tense, persons: [] });
        if (verbForms.get(key).v === v) verbForms.get(key).persons.push(plainTarget(PERSON_LABEL[p]));
      }));
    });
    verbForms.forEach(({ word, v, tense, persons }) =>
      add(word, v.en, `verb · ${plainTarget(vw(v))}, ${labelOf(data.tenseOptions, tense).toLowerCase()}, ${persons.join(' / ')}`, `v:${v.id}`));
    data.nouns.forEach((n) => {
      add(nw(n), n.en, `noun · ${n.gender === 'm' ? 'masc.' : 'fem.'}`, `n:${n.id}`);
      if (n.plural) add(n.plural, n.en + ' (pl.)', `noun · plural of ${plainTarget(nw(n))}`, `n:${n.id}`);
      if (n.fem) add(n.fem, n.en + ' (f.)', `noun · feminine of ${plainTarget(nw(n))}`, `n:${n.id}`);
    });
    data.adjectives.forEach((a) => Object.values(a.forms).forEach((f) => add(f, a.en, 'adjective', `a:${a.id}`)));
    data.numbers.forEach((n) => add(n.it, String(n.value), 'number', numberFamily(n.value)));
    return lexicon;
  }

  // Split text into words (elided forms like l'acqua become l' + acqua), then gloss them,
  // matching the longest glossary phrase (up to 4 words) first. Each entry carries its word
  // family (`lemma`), the families of a phrase's parts, and whether the app knows the word.
  function glossWords(sentence) {
    const lex = getLexicon();
    const tokens = [];
    let start = true; // at the start of a sentence (capitals there aren't names)
    sentence.split(/\s+/).forEach((raw) => {
      const w = raw.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{M}\p{N}'’]+$/gu, '');
      const ends = /[.?!…]["»”)]*$/.test(raw);
      if (w) {
        const m = w.match(/^(\p{L}+['’])(\p{L}.*)$/u);
        if (m) tokens.push({ t: m[1], start }, { t: m[2], start: false }); else tokens.push({ t: w, start });
        start = false;
      }
      if (ends) start = true;
    });
    const join = (list) => list.reduce((acc, t, i) => acc + (i && !/['’]$/.test(list[i - 1].t) ? ' ' : '') + t.t, '');
    const out = [];
    for (let i = 0; i < tokens.length;) {
      let n = Math.min(4, tokens.length - i);
      for (; n > 1 && !lookupWord(join(tokens.slice(i, i + n)), false); n--);
      const text = join(tokens.slice(i, i + n));
      const hit = lookupWord(text, n === 1);
      const isName = !hit && !tokens[i].start && /^\p{Lu}/u.test(text);
      out.push({
        it: text, en: hit ? hit.en : isName ? text : '—', note: hit ? hit.note : isName ? 'name' : '',
        lemma: hit ? hit.lemma : null, isName, inApp: !!hit,
        parts: n > 1 ? tokens.slice(i, i + n).map((tk) => (lex.get(norm(tk.t)) || {}).lemma || null) : null,
        words: n,
      });
      i += n;
    }
    return out;
  }
  // Exact form, then (Arabic) without vowel marks, then with clitics split off: wa- + al- + bayt
  function lookupWord(text, split) {
    const lex = getLexicon();
    const hit = lex.get(norm(text));
    if (hit || !AR) return hit;
    const folded = lexiconFold.get(AT.fold(text));
    if (folded || !split) return folded;
    for (const sp of AT.splits(text)) {
      const base = lexiconFold.get(sp.stem);
      if (!base) continue;
      const pieces = [...sp.pre.map((p) => p.form), sp.suf && sp.suf.form].filter(Boolean).join(' ');
      const en = [...sp.pre.map((p) => p.en), base.en].join(' ') + (sp.suf ? ` + ${sp.suf.en}` : '');
      return { en, note: base.note + (pieces ? ' · with ' + pieces : ''), lemma: base.lemma };
    }
    return null;
  }
  const glossList = (sentence) => h('div', { class: 'gloss-list' }, glossWords(sentence).map((g) =>
    h('div', { class: 'gloss-row' }, h('span', { class: 'it' }, target(g.it, { inline: true })), h('span', {}, g.en), h('span', { class: 'gloss-note' }, g.note))));

  // ---------- 3. sentence builder ----------
  function renderSentence(item, ctx) {
    const { s } = item;
    const words = stripEnd(s.it).split(/\s+/);
    const tiles = shuffleTiles(words.map((w, i) => ({ id: i, text: i === 0 ? w.charAt(0).toLowerCase() + w.slice(1) : w })));
    const accepted = [s.it, ...(s.accepted || [])].map((x) => norm(stripEnd(x)));
    let placed = [];
    let answered = false;

    const zone = h('div', { class: 'answer-zone', dir: AR ? 'rtl' : null });
    const bank = h('div', { class: 'bank', dir: AR ? 'rtl' : null });
    const feedback = h('div');
    const checkBtn = h('button', { class: 'btn', onclick: check, disabled: true }, 'Check');
    const actions = h('div', { class: 'actions' }, checkBtn,
      h('button', { class: 'btn secondary', onclick: () => { placed = []; refresh(); } }, 'Clear'),
      h('button', { class: 'btn secondary', onclick: () => finish(false, true) }, 'Show answer'));

    pane.append(h('div', { class: 'card' },
      h('div', { class: 'eyebrow' }, ['Translate', labelOf(data.sentenceTypes, s.type), labelOf(data.topics, s.topic), s.function && labelOf(data.functions, s.function)].filter(Boolean).join(' \u00B7 ')),
      h('div', { class: 'big' }, s.en), zone, bank, actions, feedback));
    refresh();
    keyHandler = (e) => { if (e.key === 'Enter') check(); };

    function shuffleTiles(list) {
      let out = shuffle(list);
      for (let n = 0; n < 5 && list.length > 1 && out.every((t, i) => t.id === i); n++) out = shuffle(list);
      return out;
    }
    function refresh() {
      const inZone = new Set(placed.map((t) => t.id));
      zone.replaceChildren(...placed.map((t) => h('button', { class: 'tile', disabled: answered, onclick: () => { placed = placed.filter((p) => p !== t); refresh(); } }, target(t.text))));
      bank.replaceChildren(...tiles.filter((t) => !inZone.has(t.id)).map((t) => h('button', { class: 'tile', disabled: answered, onclick: () => { placed.push(t); refresh(); } }, target(t.text))));
      checkBtn.disabled = answered || placed.length !== tiles.length;
    }
    function check() {
      if (answered || placed.length !== tiles.length) return;
      finish(accepted.includes(norm(placed.map((t) => t.text).join(' '))), false);
    }
    function finish(ok, gaveUp) {
      answered = true;
      if (gaveUp) placed = tiles.slice().sort((a, b) => a.id - b.id);
      refresh();
      if (!gaveUp) zone.classList.add(ok ? 'correct' : 'wrong');
      ctx.grade(ok, 'tiles');
      const alt = (s.accepted || []);
      const fnInfo = s.function && data.functions.find((f) => f.id === s.function);
      feedback.replaceChildren(feedbackBox(ok, ok ? 'Correct!' : gaveUp ? 'Answer' : 'Not quite',
        h('div', { class: 'answer' }, target(s.it, { tr: s.tr })),
        alt.length ? h('div', { class: 'note' }, 'Also accepted: ' + alt.join(' / ')) : null,
        fnInfo ? h('div', { class: 'note' }, fnInfo.label + ' \u2014 ' + fnInfo.description) : null,
        h('div', { class: 'example' }, speakBtn(s.it), h('span', {}, s.en)),
        glossList(s.it),
        s.answers ? h('div', { class: 'example' }, speakBtn(s.answers[0].it),
          h('span', {}, 'Possible reply: ', h('span', { class: 'it' }, target(s.answers[0].it, { tr: s.answers[0].tr })), ' — ' + s.answers[0].en)) : null));
      autoSpeak(s.it);
      afterAnswer(ctx, actions, nextButton(ctx));
    }
  }

  // ---------- 4. reading (real-text tile translation) ----------
  function renderReading(item, ctx) {
    const { reading, sIndex, s } = item;
    const itToEn = getSetting('reading', 'direction') === 'it-en';
    const prompt = itToEn ? s.it : s.en;
    const target = itToEn ? s.en : s.it;
    const words = stripEnd(target).split(/\s+/);
    const tiles = shuffleTiles(words.map((w, i) => ({ id: i, text: i === 0 ? w.charAt(0).toLowerCase() + w.slice(1) : w })));
    const accepted = [norm(stripEnd(target))];
    let placed = [];
    let answered = false;

    const zone = h('div', { class: 'answer-zone' });
    const bank = h('div', { class: 'bank' });
    const feedback = h('div');
    const checkBtn = h('button', { class: 'btn', onclick: check, disabled: true }, 'Check');
    const actions = h('div', { class: 'actions' }, checkBtn,
      h('button', { class: 'btn secondary', onclick: () => { placed = []; refresh(); } }, 'Clear'),
      h('button', { class: 'btn secondary', onclick: () => finish(false, true) }, 'Show answer'));

    pane.append(h('div', { class: 'card' },
      h('div', { class: 'eyebrow' }, `Reading · ${reading.title} · sentence ${sIndex + 1} of ${reading.sentences.length} · ${tl(itToEn ? '{lang} → English' : 'English → {lang}')}`),
      h('div', { class: 'big' }, prompt, itToEn ? speakBtn(s.it) : null), zone, bank, actions, feedback));
    refresh();
    keyHandler = (e) => { if (e.key === 'Enter') check(); };

    function shuffleTiles(list) {
      let out = shuffle(list);
      for (let n = 0; n < 5 && list.length > 1 && out.every((t, i) => t.id === i); n++) out = shuffle(list);
      return out;
    }
    function refresh() {
      const inZone = new Set(placed.map((t) => t.id));
      zone.replaceChildren(...placed.map((t) => h('button', { class: 'tile', disabled: answered, onclick: () => { placed = placed.filter((p) => p !== t); refresh(); } }, t.text)));
      bank.replaceChildren(...tiles.filter((t) => !inZone.has(t.id)).map((t) => h('button', { class: 'tile', disabled: answered, onclick: () => { placed.push(t); refresh(); } }, t.text)));
      checkBtn.disabled = answered || placed.length !== tiles.length;
    }
    function check() {
      if (answered || placed.length !== tiles.length) return;
      finish(accepted.includes(norm(placed.map((t) => t.text).join(' '))), false);
    }
    function finish(ok, gaveUp) {
      answered = true;
      if (gaveUp) placed = tiles.slice().sort((a, b) => a.id - b.id);
      refresh();
      if (!gaveUp) zone.classList.add(ok ? 'correct' : 'wrong');
      ctx.grade(ok, 'tiles');
      feedback.replaceChildren(feedbackBox(ok, ok ? 'Correct!' : gaveUp ? 'Answer' : 'Not quite',
        h('div', { class: 'answer' }, target),
        h('div', { class: 'example' }, speakBtn(s.it), h('span', {}, s.it + ' — ' + s.en)),
        reading.source ? h('div', { class: 'note' }, 'Source: Wikipedia — ',
          h('a', { href: reading.source.url, target: '_blank', rel: 'noopener' }, reading.source.title),
          ' (', reading.license, ')') : null));
      autoSpeak(s.it);
      afterAnswer(ctx, actions, nextButton(ctx));
    }
  }

  // ---------- 5. listening (dictation) ----------
  // Hear a word or a sentence and type it. Items have their own SRS ids (l:n:casa, l:s:s12 …),
  // so hearing a word is tracked apart from reading it. Capitals and punctuation are ignored.
  const LISTEN_KINDS = [{ id: 'word', label: 'Words' }, { id: 'sentence', label: 'Sentences' }];
  const SLOW_RATE = 0.6;
  function listeningItems() {
    const word = (id, rank, extra) => ({ id: `l:${id}`, rank, kind: 'word', ...extra });
    const sentence = (p, s) => ({
      id: `l:${p}:${s.id}`, rank: s.rank, kind: 'sentence', topic: s.topic, say: s.it, answers: [s.it], show: s.it, tr: s.tr, en: s.en, gloss: true,
    });
    return [
      ...data.nouns.map((n) => word(`n:${n.id}`, n.rank, {
        topic: n.topic, say: nounDisplay(n), answers: [nounDisplay(n), nw(n)], show: nounDisplay(n), en: n.en,
        hint: n.art ? 'A noun. The article is optional.' : 'A noun.',
      })),
      ...data.verbs.map((v) => word(`v:${v.id}`, v.rank, { say: vw(v), answers: [vw(v)], show: vw(v), en: v.en, hint: AR ? 'A verb: he did it (past).' : 'A verb in the infinitive.' })),
      ...data.numbers.map((n) => word(`#:${n.value}`, n.rank, {
        say: n.it, answers: [n.it, String(n.value)], show: AR ? n.it : `${n.it} = ${n.value}`, tr: n.tr, value: n.value, en: String(n.value), hint: 'A number. Type the word or the digits.',
      })),
      ...data.questions.map((s) => sentence('q', s)),
      ...data.sentences.map((s) => sentence('s', s)),
    ];
  }
  const dictationWords = (s) => norm(s.replace(/[^\p{L}\p{N}'’‘`´\s]/gu, ' ')).split(' ').filter(Boolean);
  function checkDictation(guess, answers, item) {
    if (AR) {
      if (item && item.value != null && guess.trim() === String(item.value)) return { ok: true };
      const res = AT.match(guess.replace(/[.?!؟،,]/g, ' '), answers.map((a) => a.replace(/[.?!؟،,]/g, ' ')),
        answers.map((a, i) => (i === 0 && item && item.tr ? item.tr : AT.romanize(a))));
      return { ok: res.ok, romanNote: res.close };
    }
    const g = dictationWords(guess).join(' ');
    const targets = answers.map((a) => dictationWords(a).join(' '));
    if (targets.includes(g)) return { ok: true };
    if (targets.map(stripAccents).includes(stripAccents(g))) return { ok: true, accentNote: true };
    return { ok: false };
  }
  // The target's words, each flagged if the guess has it in order (longest common subsequence)
  function dictationDiff(guess, target) {
    const a = dictationWords(target);
    const b = dictationWords(guess);
    const lcs = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
    for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
    const ok = new Array(a.length).fill(false);
    for (let i = 0, j = 0; i < a.length && j < b.length;) {
      if (a[i] === b[j]) { ok[i] = true; i++; j++; } else if (lcs[i + 1][j] >= lcs[i][j + 1]) i++; else j++;
    }
    const shown = stripEnd(target).split(/\s+/);
    return (shown.length === a.length ? shown : a).map((text, i) => ({ text, ok: ok[i] }));
  }

  function renderListening(item, ctx) {
    if (!canSpeak || noTargetVoice) {
      pane.append(h('div', { class: 'empty' }, noTargetVoice ? tl('Listening needs a {lang} voice, and this browser doesn’t have one.') : 'Listening needs speech synthesis, which this browser does not offer.'));
      return;
    }
    let answered = false;
    const play = (rate) => { say([{ text: item.say, lang: 'target', rate }]); if (!answered) input.focus(); };
    const input = h('input', { type: 'text', class: 'dictation', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', 'aria-label': 'What you heard', placeholder: AR ? 'Type what you hear, in Arabic or romanized…' : 'Type what you hear…' });
    const accents = h('div', { class: 'accents' }, ACCENTS.map((ch) =>
      h('button', {
        class: 'accent-btn', type: 'button', tabindex: '-1',
        onclick: () => { input.setRangeText(ch, input.selectionStart, input.selectionEnd, 'end'); input.focus(); },
      }, ch)));
    const hint = h('div', { class: 'gloss' }, item.hint || 'A sentence. Capitals and punctuation don’t matter.');
    const feedback = h('div');
    const actions = h('div', { class: 'actions' },
      h('button', { class: 'btn', onclick: check }, 'Check'),
      h('button', { class: 'btn secondary', onclick: () => { hint.textContent = 'It means: ' + item.en; input.focus(); } }, 'Show meaning'),
      h('button', { class: 'btn secondary', onclick: () => finish('', true) }, "I don't know"));

    pane.append(h('div', { class: 'card' },
      h('div', { class: 'eyebrow' }, ['Listen and type', labelOf(LISTEN_KINDS, item.kind).replace(/s$/, ''), item.topic && labelOf(data.topics, item.topic)].filter(Boolean).join(' \u00B7 ')),
      h('div', { class: 'listen-row' },
        h('button', { class: 'btn listen-play', onclick: () => play() }, '🔊 Play'),
        h('button', { class: 'btn secondary', onclick: () => play(SLOW_RATE) }, '🐢 Slow')),
      hint,
      h('div', { class: 'prompt-row' }, input), accents, actions, feedback));
    input.focus();
    keyHandler = (e) => { if (e.key === 'Enter') check(); };
    play();

    function check() {
      if (!answered && input.value.trim()) finish(input.value, false);
    }
    function finish(guess, gaveUp) {
      if (answered) return;
      answered = true;
      input.disabled = true;
      accents.remove();
      const res = gaveUp ? { ok: false } : checkDictation(guess, item.answers, item);
      ctx.grade(res.ok, 'typed');
      const diff = !AR && !res.ok && !gaveUp && item.kind === 'sentence' ? dictationDiff(guess, item.show) : null;
      feedback.replaceChildren(feedbackBox(res.ok, res.ok ? 'Correct!' : gaveUp ? 'Answer' : 'Not quite',
        h('div', { class: 'answer' }, diff ? diff.flatMap((w, i) => [i ? ' ' : '', h('span', { class: w.ok ? '' : 'missed' }, w.text)])
          : AR ? [target(item.show, { tr: item.tr }), item.value != null ? ` = ${item.value}` : null] : item.show),
        res.accentNote ? h('div', { class: 'note' }, 'Mind the accents: ' + item.show) : null,
        res.romanNote ? h('div', { class: 'note' }, 'Spelled exactly: ' + res.romanNote) : null,
        !res.ok && !gaveUp ? h('div', { class: 'note' }, 'You typed: ' + guess.trim()) : null,
        h('div', { class: 'example' }, speakBtn(item.say), h('span', {}, item.en)),
        item.gloss ? glossList(item.say) : null));
      afterAnswer(ctx, actions, nextButton(ctx));
    }
  }

  // ---------- 4. word tables (reference browser) ----------
  function statusOf(id) {
    const r = state.srs[id];
    return !r ? 'New' : r.box >= MASTERED_BOX ? 'Mastered' : 'Learning';
  }
  const statusCell = (id) => { const st = statusOf(id); return { node: h('span', { class: 'pill ' + st.toLowerCase() }, st) }; };
  const it = (t, speakText, tr) => ({ t, cls: 'it', speak: speakText === undefined ? t : speakText, tr });
  const hasField = (list, key) => list.some((x) => x[key]);

  const tableTense = () => (data.tenseOptions.some((t) => t.id === state.tableTense) ? state.tableTense : 'present');

  const TABLES = {
    letters: {
      label: 'Letters',
      note: 'The alphabet, read right to left. Most letters change shape depending on where they sit in a word; six never join the letter after them. The l of al- (the) merges into a following sun letter.',
      head: ['#', 'Letter', 'Name', 'Sound', 'Start', 'Middle', 'End', 'al-', 'Example', 'Status'],
      rows: () => (data.alphabet ? data.alphabet.letters : []).map((L, i) => ({
        search: [L.ch, L.name, AT.romanize(L.name), L.sound, L.example.en].join(' '),
        cells: [i + 1, { node: arOnly(L.ch, 'glyph-cell'), speak: L.name }, it(L.name, null), L.sound,
          ...['i', 'm', 'f'].map((p) => (L.positions.includes(p) ? { node: arOnly(letterForm(L, p), 'glyph-cell small') } : '—')),
          L.sun == null ? '—' : L.sun ? 'sun' : 'moon', { node: [target(L.example.it, { inline: true, tr: L.example.tr }), ' ' + L.example.en], speak: L.example.it },
          statusCell(`ab:${L.id}`)],
      })),
    },
    verbs: {
      label: 'Verbs',
      note: 'Pick a tense. Irregular verbs are highlighted in blue.',
      head: () => ['#', AR ? 'Verb' : 'Infinitive', 'English', ...data.persons.map((p) => (AR ? target(PERSON_LABEL[p], { inline: true }) : PERSON_LABEL[p])),
        ...(hasField(data.verbs, 'auxiliary') ? ['Aux.', 'Participle'] : []), ...(hasField(data.verbs, 'root') ? ['Root'] : []), 'Mastered'],
      rows: () => {
        const tense = tableTense();
        return data.verbs.map((v, i) => {
          const ids = data.persons.map((p) => `v:${v.id}:${tense}:${p}`);
          const mastered = ids.filter((id) => statusOf(id) === 'Mastered').length;
          const forms = v.tenses[tense];
          return {
            search: [vw(v), v.en, ...Object.values(forms)].join(' '),
            cells: [i + 1, { t: v.cite || vw(v), cls: v.irregular ? 'it irr' : 'it', speak: vw(v) }, v.en,
              ...data.persons.map((p) => it(forms[p], null)),
              ...(hasField(data.verbs, 'auxiliary') ? [v.auxiliary, v.participle] : []),
              ...(hasField(data.verbs, 'root') ? [v.root ? { node: arOnly(v.root) } : '—'] : []),
              `${mastered}/${ids.length}`],
          };
        });
      },
    },
    nouns: {
      label: 'Nouns',
      get note() { return data.grammar.articles ? 'Singular and plural with definite article, plus the indefinite article.' : 'Singular and plural.'; },
      get head() {
        return data.grammar.articles ? ['#', '{lang}', 'English', 'Topic', 'Gender', 'Plural', 'A / an', 'Status']
          : ['#', '{lang}', 'English', 'Topic', 'Gender', 'Plural', 'Root', 'Status'];
      },
      rows: () => data.nouns.map((n, i) => ({
        search: [nw(n), n.plural || '', n.en, labelOf(data.topics, n.topic)].join(' '),
        cells: data.grammar.articles
          ? [i + 1, it(withArticle(n.art, n.id)), n.en, labelOf(data.topics, n.topic), n.gender === 'm' ? 'masc.' : 'fem.',
            it(withArticle(pluralArticle(n), n.plural)), it(withArticle(indefiniteFor(n), n.id), null), statusCell(`n:${n.id}`)]
          : [i + 1, it(nw(n)), n.en, labelOf(data.topics, n.topic), n.gender === 'm' ? 'masc.' : 'fem.',
            n.plural ? it(n.plural) : '—', n.root ? { node: arOnly(n.root) } : '—', statusCell(`n:${n.id}`)],
      })),
    },
    adjectives: {
      label: 'Adjectives',
      note: 'Adjectives agree with the noun in gender and number.',
      head: ['#', 'English', 'Masc. sing.', 'Fem. sing.', 'Masc. pl.', 'Fem. pl.'],
      rows: () => data.adjectives.map((a, i) => ({
        search: [a.en, ...Object.values(a.forms)].join(' '),
        cells: [i + 1, a.en, it(a.forms.ms), it(a.forms.fs, null), it(a.forms.mp, null), it(a.forms.fp, null)],
      })),
    },
    articles: {
      label: 'Articles',
      note: 'Definite (the), indefinite (a / an) and partitive (some). The article depends on the gender, the number and the first letters of the next word.',
      head: ['#', '{lang}', 'English', 'Type', 'Agreement', 'When to use'],
      rows: () => (data.articles || []).map((a, i) => ({
        search: [a.it, a.en, a.type, a.note].join(' '),
        cells: [i + 1, it(a.it), a.en, a.type, articleAgreement(a), a.note],
      })),
    },
    prepositions: {
      label: 'Prepositions',
      note: 'Simple prepositions, the articulated forms they make with the definite article (di + il = del), and common prepositional phrases.',
      head: ['#', '{lang}', 'English', 'Type', 'Notes'],
      rows: () => (data.prepositions || []).map((p, i) => ({
        search: [p.it, p.en, p.type, p.note].join(' '),
        cells: [i + 1, it(p.it, undefined, p.tr), p.en, p.type, p.note],
      })),
    },
    conjunctions: {
      label: 'Conjunctions',
      note: 'Coordinating conjunctions join equal parts; subordinating ones introduce a dependent clause.',
      head: ['#', '{lang}', 'English', 'Type', 'Example'],
      rows: () => (data.conjunctions || []).map((c, i) => ({
        search: [c.it, c.en, c.type, c.note].join(' '),
        cells: [i + 1, it(c.it, undefined, c.tr), c.en, c.type, AR ? c.note : it(c.note)],
      })),
    },
    numbers: {
      label: 'Numbers',
      note: '1\u2013100. Compound numbers join the ten and the unit into one word.',
      head: ['#', 'Digits', '{lang}', 'Status'],
      rows: () => data.numbers.map((n, i) => ({
        search: [n.value, n.it].join(' '),
        cells: [i + 1, String(n.value), it(n.it, undefined, n.tr), statusCell(`#:${n.value}`)],
      })),
    },
    questions: {
      label: 'Questions',
      note: 'Common questions with a sample reply.',
      head: ['#', '{lang}', 'English', 'Sample reply', 'Status'],
      rows: () => data.questions.map((q, i) => ({
        search: [q.it, q.en, q.answers[0].it].join(' '),
        cells: [i + 1, it(q.it, undefined, q.tr), q.en, it(q.answers[0].it, undefined, q.answers[0].tr), statusCell(`q:${q.id}`)],
      })),
    },
    sentences: {
      label: 'Sentences',
      note: 'Practice sentences from the sentence builder, labelled by type, topic and function.',
      head: ['#', '{lang}', 'English', 'Type', 'Topic', 'Function', 'Status'],
      rows: () => data.sentences.map((s, i) => ({
        search: [s.it, s.en, labelOf(data.sentenceTypes, s.type), labelOf(data.topics, s.topic), s.function ? labelOf(data.functions, s.function) : ''].join(' '),
        cells: [i + 1, it(s.it, undefined, s.tr), s.en, labelOf(data.sentenceTypes, s.type), labelOf(data.topics, s.topic), s.function ? labelOf(data.functions, s.function) : '\u2014', statusCell(`s:${s.id}`)],
      })),
    },
    readings: {
      label: 'Readings',
      note: 'Real {lang} text from Wikipedia, sentence by sentence, used by the Reading tab.',
      head: ['#', '{lang}', 'English', 'Source', 'Status'],
      rows: () => data.readings.flatMap((r) => r.sentences.map((s, i) => ({
        search: [s.it, s.en, r.title].join(' '),
        cells: [`${r.title} ${i + 1}`, it(s.it), s.en, r.title, statusCell(`r:${s.id}`)],
      }))),
    },
  };

  // Tables with nothing to show in this language (no readings yet, no articles in Arabic) are left out
  const tableKeys = () => Object.keys(TABLES).filter((k) => TABLES[k].rows().length);
  function renderTables() {
    const key = tableKeys().includes(state.table) ? state.table : 'verbs';
    const spec = TABLES[key];
    // Arabic rows can also be searched by their romanization, with or without macrons
    const rows = spec.rows().map((r) => (AR ? { ...r, search: r.search + ' ' + AT.romanize(r.search) } : r));
    const tbody = h('tbody');
    const count = h('span', { class: 'count' });
    const search = h('input', { type: 'text', class: 'search', placeholder: tl('Search {lang} or English…'), 'aria-label': 'Search words', autocomplete: 'off', spellcheck: 'false' });
    const plain = (s) => (AR ? AT.foldRoman(AT.fold(s)) : stripAccents(norm(s)));
    const td = (c) => {
      if (c == null) c = '—';
      if (typeof c !== 'object') c = { t: String(c) };
      const content = c.node || (AR && /\bit\b/.test(c.cls || '') ? target(c.t, { inline: true, tr: c.tr }) : c.t);
      return h('td', { class: c.cls || '' }, content, c.speak ? speakBtn(c.speak) : null);
    };
    function fill() {
      const q = plain(search.value);
      const shown = rows.filter((r) => !q || plain(r.search).includes(q));
      tbody.replaceChildren(...shown.map((r) => h('tr', {}, r.cells.map(td))));
      count.textContent = `${shown.length} of ${rows.length}`;
    }
    search.addEventListener('input', fill);

    pane.append(...[
      h('div', { class: 'table-tabs' }, tableKeys().map((k) =>
        h('button', { class: 'pill-btn' + (k === key ? ' active' : ''), onclick: () => { state.table = k; save(); show(); } }, TABLES[k].label))),
      key === 'verbs' ? h('div', { class: 'table-tabs' }, data.tenseOptions.map((t) =>
        h('button', { class: 'pill-btn' + (t.id === tableTense() ? ' active' : ''), onclick: () => { state.tableTense = t.id; save(); show(); } }, t.label))) : null,
      h('p', { class: 'mode-desc' }, tl((data.ui.tableNotes || {})[key] || spec.note)),
      h('div', { class: 'table-tools' }, search, count),
      h('div', { class: 'table-wrap' }, h('table', { class: 'words' },
        h('thead', {}, h('tr', {}, (typeof spec.head === 'function' ? spec.head() : spec.head).map((x) => h('th', {}, typeof x === 'string' ? tl(x) : x)))), tbody)),
    ].filter(Boolean));
    fill();
  }

  // ---------- 7. progress (learning metrics) ----------
  const PROGRESS_DESC = 'How much {lang} you know, measured the way fluency research does: word families, how much of a real text you can read, how well reviews stick, and time spent.';
  const KNOWN_BOX = 2; // an item counts as known once it has been answered right on a spaced review
  const FAMILY_TYPES = [['v', 'Verbs'], ['n', 'Nouns'], ['a', 'Adjectives'], ['#', 'Numbers'], ['other', 'Other words']];
  const familyType = (f) => { const p = f.split(':')[0]; return ['v', 'n', 'a', '#'].includes(p) ? p : 'other'; };
  const isPhrase = (f) => f && f.startsWith('p:');

  // Word families the learner has met (answered at least once) and knows (an item at box ≥ 2).
  // Evidence: the family's own drill items (verbs, nouns, numbers) and every word in a sentence
  // or question, read or heard (Listening ids are the same ids behind an l: prefix). Reading
  // items don't count: their tiles are often the English words.
  // `produced` = families typed correctly at least once (Verbs, Numbers and Listening).
  function familyKnowledge() {
    // Every family the app teaches: the vocabulary lists, plus function and glossary words
    const all = new Set([...data.verbs.map((v) => `v:${v.id}`), ...data.nouns.map((n) => `n:${n.id}`),
      ...data.adjectives.map((a) => `a:${a.id}`), ...data.numbers.map((n) => numberFamily(n.value))]);
    for (const e of getLexicon().values()) if (e.lemma && !isPhrase(e.lemma)) all.add(e.lemma);
    const sentences = new Map([...data.questions.map((q) => [`q:${q.id}`, q]), ...data.sentences.map((x) => [`s:${x.id}`, x])]);
    const familiesOf = (fullId) => {
      const id = fullId.replace(/^l:/, '');
      const [p, a] = id.split(':');
      if (p === 'v') return [`v:${a}`];
      if (p === 'n') return [`n:${a}`];
      if (p === '#') return [numberFamily(Number(a))];
      const sent = sentences.get(id);
      return sent ? glossWords(sent.it).flatMap((g) => [g.lemma, ...(g.parts || [])]).filter(Boolean) : [];
    };
    const met = new Set();
    const known = new Set();
    const phrases = new Set();
    const produced = new Set();
    for (const [id, r] of Object.entries(state.srs)) {
      if (!r.seen || id.startsWith('r:')) continue;
      for (const f of familiesOf(id)) {
        if (isPhrase(f)) { if (r.box >= KNOWN_BOX) phrases.add(f); continue; }
        met.add(f);
        if (r.box >= KNOWN_BOX) known.add(f);
      }
    }
    for (const [, id, ok, , kind] of state.log) if (ok && kind === 'typed') familiesOf(id).forEach((f) => produced.add(f));
    return { all, met, known, phrases, produced };
  }

  // Share of running words (names excluded) whose family is known. A phrase counts as known if
  // it was learnt as a phrase or all of its words are known.
  function coverage(text, fk) {
    let total = 0;
    let knownWords = 0;
    const tokens = glossWords(text).map((g) => {
      if (g.isName) return { ...g, status: 'name' };
      const ok = !!g.lemma && (fk.known.has(g.lemma) || fk.phrases.has(g.lemma) || (!!g.parts && g.parts.every((f) => f && fk.known.has(f))));
      total += g.words;
      if (ok) knownWords += g.words;
      return { ...g, status: ok ? 'known' : g.inApp ? 'learning' : 'new' };
    });
    return { pct: total ? (100 * knownWords) / total : 0, known: knownWords, total, tokens };
  }

  // Reviews = answers to items that had already reached box 1 (a spaced interval had passed)
  function retention(since, match) {
    let n = 0;
    let ok = 0;
    for (const [t, id, good, prevBox] of state.log) if (t >= since && prevBox >= 1 && (!match || match(id))) { n++; ok += good; }
    return { n, ok, pct: n ? (100 * ok) / n : null };
  }
  function firstTries(prefix) {
    const first = new Map();
    for (const [, id, ok] of state.log) if (id.startsWith(prefix) && !first.has(id)) first.set(id, ok);
    return first;
  }

  const fmtInt = (n) => Math.round(n).toLocaleString('en-US');
  const fmtPct = (x) => (x == null ? '—' : `${Math.floor(x)}%`);
  function fmtDuration(ms) {
    const min = Math.floor(ms / 60000);
    if (min < 60) return `${min} min`;
    return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')} min`;
  }
  function pmeter(value, max, label, marks = []) {
    const pct = Math.max(0, Math.min(100, max ? (100 * value) / max : 0));
    return h('span', { class: 'pmeter', role: 'meter', 'aria-label': label, 'aria-valuemin': '0', 'aria-valuemax': String(max), 'aria-valuenow': String(Math.round(value)), title: label },
      h('span', { class: 'pmeter-fill', style: `width:${pct}%` }),
      marks.map((m) => h('span', { class: 'pmeter-mark', style: `left:${(100 * m) / max}%` })));
  }
  const tile = (label, value, sub) => h('div', { class: 'ptile' },
    h('div', { class: 'ptile-label' }, label), h('div', { class: 'ptile-value' }, value), sub ? h('div', { class: 'ptile-sub' }, sub) : null);
  const psection = (title, note, ...body) => h('section', { class: 'psec' },
    h('h3', { class: 'psec-title' }, title), note ? h('p', { class: 'psec-note' }, note) : null, ...body);

  function renderProgress() {
    const fk = familyKnowledge();
    const targets = data.progress || { coverage: { ready: 95, comfortable: 98 }, levels: [] };
    const { ready, comfortable } = targets.coverage;
    const levels = targets.levels || [];
    const now = Date.now();
    const days = state.time.days;
    const dayMs = (offset) => days[dayKey(now - offset * DAY)] || 0;
    const week = [0, 1, 2, 3, 4, 5, 6].reduce((sum, i) => sum + dayMs(i), 0);
    const hours = state.time.total / 3600000;

    // Headline: word families
    const vocabLevel = levels.find((l) => l.families > fk.known.size) || levels[levels.length - 1];
    const hoursLevel = levels.find((l) => l.hours > hours) || levels[levels.length - 1];
    const hero = h('div', { class: 'phero' },
      h('div', { class: 'ptile-label' }, 'Word families you know'),
      h('div', { class: 'phero-value' }, fmtInt(fk.known.size)),
      h('div', { class: 'ptile-sub' }, `${fmtInt(fk.met.size)} met · ${fmtInt(fk.produced.size)} typed correctly · ${fmtInt(fk.all.size)} in the app`),
      vocabLevel ? h('div', { class: 'plevel' },
        h('div', { class: 'plevel-row' }, h('span', {}, `Toward ${vocabLevel.label}`), h('span', { class: 'num' }, `${fmtInt(fk.known.size)} / ~${fmtInt(vocabLevel.families)}`)),
        pmeter(fk.known.size, vocabLevel.families, `${fk.known.size} of about ${vocabLevel.families} word families for ${vocabLevel.id}`)) : null);

    // Tiles: time, retention, answers
    const ret30 = retention(now - 30 * DAY);
    const answers = state.log.length;
    const rightAll = state.log.reduce((sum, e) => sum + e[2], 0);
    const tiles = h('div', { class: 'ptiles' },
      tile('Study time', fmtDuration(state.time.total), `${fmtDuration(dayMs(0))} today · ${fmtDuration(week)} this week`),
      tile('Retention', fmtPct(ret30.pct), ret30.n ? `${fmtInt(ret30.ok)} of ${fmtInt(ret30.n)} reviews remembered · 30 days` : 'No spaced reviews yet'),
      tile('Answers', fmtInt(answers), answers ? `${fmtPct((100 * rightAll) / answers)} correct` : 'Answer a drill to start'));
    const hoursBlock = hoursLevel ? h('div', { class: 'plevel' },
      h('div', { class: 'plevel-row' }, h('span', {}, `Study hours toward ${hoursLevel.label}`), h('span', { class: 'num' }, `${hours.toFixed(1)} / ~${hoursLevel.hours} h`)),
      pmeter(hours, hoursLevel.hours, `${hours.toFixed(1)} of about ${hoursLevel.hours} hours for ${hoursLevel.id}`)) : null;

    // Families by type
    const byType = FAMILY_TYPES.map(([key, label]) => {
      const count = (set) => [...set].filter((f) => familyType(f) === key).length;
      return h('tr', {}, h('td', {}, label), h('td', { class: 'num' }, fmtInt(count(fk.known))), h('td', { class: 'num' }, fmtInt(count(fk.met))), h('td', { class: 'num' }, fmtInt(count(fk.all))));
    });
    const familiesTable = h('table', { class: 'ptable' },
      h('thead', {}, h('tr', {}, ['Type', 'Known', 'Met', 'In the app'].map((x, i) => h('th', { class: i ? 'num' : '' }, x)))),
      h('tbody', {}, byType));

    // Reading coverage, per passage
    const readFirst = firstTries('r:');
    const readingRows = data.readings.map((r) => {
      const cov = coverage(r.sentences.map((x) => x.it).join(' '), fk);
      const tried = r.sentences.filter((x) => readFirst.has(`r:${x.id}`));
      const firstOk = tried.filter((x) => readFirst.get(`r:${x.id}`)).length;
      const status = cov.pct >= comfortable ? 'Comfortable' : cov.pct >= ready ? 'Ready' : '';
      return h('tr', {},
        h('td', {}, r.title),
        h('td', { class: 'pcov' }, pmeter(cov.pct, 100, `${Math.floor(cov.pct)}% of words known in ${r.title}`, [ready, comfortable])),
        h('td', { class: 'num' }, fmtPct(cov.pct)),
        h('td', {}, status ? h('span', { class: 'pill ' + (status === 'Comfortable' ? 'mastered' : 'learning') }, status) : ''),
        h('td', { class: 'num' }, tried.length ? `${firstOk} / ${tried.length}` : '—'));
    });
    const readingTable = h('div', { class: 'table-wrap' }, h('table', { class: 'ptable' },
      h('thead', {}, h('tr', {}, ['Reading', 'Words you know', '', 'Status', 'First try'].map((x, i) => h('th', { class: i >= 2 && i !== 3 ? 'num' : '' }, x)))),
      h('tbody', {}, readingRows)));

    // Retention by tab
    const retRows = Object.entries(MODES).filter(([key]) => activeModes().includes(key)).map(([key, m]) => {
      const r = retention(0, (id) => PRACTICE_MODE[id.split(':')[0]] === key);
      return h('tr', {}, h('td', {}, m.label), h('td', { class: 'num' }, fmtInt(r.n)), h('td', { class: 'num' }, fmtPct(r.pct)));
    });
    const retTable = h('table', { class: 'ptable' },
      h('thead', {}, h('tr', {}, ['Tab', 'Reviews', 'Remembered'].map((x, i) => h('th', { class: i ? 'num' : '' }, x)))),
      h('tbody', {}, retRows));

    // Check any text
    const area = h('textarea', { class: 'ptext', rows: '5', dir: 'auto', placeholder: tl('Paste some {lang}: a news paragraph, a song verse, a menu…'), 'aria-label': tl('{lang} text to check'), spellcheck: 'false' });
    const result = h('div', { class: 'presult' });
    const check = () => {
      const text = area.value.trim();
      if (!text) { result.replaceChildren(); return; }
      const cov = coverage(text, fk);
      const verdict = cov.pct >= comfortable ? 'comfortable reading' : cov.pct >= ready ? 'readable with some guessing' : 'too many unknown words to read comfortably yet';
      result.replaceChildren(
        h('div', { class: 'plevel-row' }, h('span', {}, `You know ${fmtInt(cov.known)} of ${fmtInt(cov.total)} words: ${verdict}.`), h('span', { class: 'num' }, fmtPct(cov.pct))),
        pmeter(cov.pct, 100, `${Math.floor(cov.pct)}% of words known`, [ready, comfortable]),
        h('p', { class: 'ptokens', dir: AR ? 'rtl' : null }, cov.tokens.flatMap((t, i) => [i ? ' ' : '', h('span', { class: 'tok ' + t.status, title: t.status === 'new' ? 'Not in the app yet' : `${t.en}${t.note ? ' · ' + t.note : ''}` }, t.it)])),
        h('div', { class: 'plegend' },
          h('span', {}, h('span', { class: 'tok known' }, 'known')),
          h('span', {}, h('span', { class: 'tok learning' }, 'in the app, not known yet')),
          h('span', {}, h('span', { class: 'tok new' }, 'not in the app')),
          h('span', {}, h('span', { class: 'tok name' }, 'name (not counted)'))));
    };
    const checker = h('div', {}, area, h('div', { class: 'actions' }, h('button', { class: 'btn', onclick: check }, 'Check coverage')), result);

    pane.append(
      hero, tiles, hoursBlock,
      psection('Word families', `A word family is a word with all its forms: ${data.ui.familyExample} count once. Known means answered right on a spaced review (box 2 or higher), in its own drill or inside a sentence.`, familiesTable),
      !data.readings.length ? psection('Reading coverage', tl('There are no {lang} readings yet.')) : psection('Reading coverage', `The share of words in each passage that you know. At ${ready}% you can follow a text and guess the rest; at ${comfortable}% reading is comfortable. First try is how many sentences you got right on the first attempt in the Reading tab.`, readingTable),
      psection('Retention by tab', 'How often you remembered an item when it came back after a spaced interval. Around 85–90% means reviews are well paced.', retTable),
      psection('Check any text', tl('Paste {lang} from anywhere to see how much of it you could read today.'), checker),
      backupSection(),
      targets.sourceNote ? h('p', { class: 'psec-note' }, targets.sourceNote) : null);
  }

  // ---------- progress backup (export / import a file) ----------
  const BACKUP_APP = LANG.backup;
  let backupNotice = ''; // shown under the buttons; survives the re-render after an import
  function exportProgress() {
    save();
    const blob = new Blob([JSON.stringify({ app: BACKUP_APP, version: 1, language: data.language, exported: new Date().toISOString(), state }, null, 1)], { type: 'application/json' });
    const a = h('a', { href: URL.createObjectURL(blob), download: `${BACKUP_APP}-progress-${dayKey(Date.now())}.json` });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  // Accepts a file written by exportProgress (or a bare state object); throws with a readable message
  function parseBackup(text) {
    let file;
    try { file = JSON.parse(text); } catch (e) { throw new Error('This file is not valid JSON.'); }
    const s = file && file.app === BACKUP_APP ? file.state : file;
    const plain = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
    if (file && file.app && file.app !== BACKUP_APP) throw new Error('This file is from a different app.');
    if (!plain(s) || !plain(s.srs)) throw new Error(`This file does not contain ${LANG.app} progress.`);
    if (file.language && file.language !== data.language) throw new Error(`This backup is for another language (${file.language}).`);
    const srs = {};
    for (const [id, r] of Object.entries(s.srs)) {
      if (plain(r) && [r.box, r.due, r.seen, r.right].every(Number.isFinite)) {
        srs[id] = { box: Math.max(0, Math.min(BOX_DAYS.length - 1, Math.round(r.box))), due: r.due, seen: r.seen, right: r.right };
      }
    }
    const log = (Array.isArray(s.log) ? s.log : []).filter((e) => Array.isArray(e) && Number.isFinite(e[0]) && typeof e[1] === 'string');
    return { state: hydrate({ ...s, srs, log, lesson: null }), exported: file.exported || null };
  }
  function importProgress(file, onDone) {
    const reader = new FileReader();
    reader.onerror = () => onDone('Could not read that file.');
    reader.onload = () => {
      let backup;
      try { backup = parseBackup(String(reader.result)); } catch (e) { onDone(e.message); return; }
      const count = (st) => {
        const done = Object.values(st.lessons || {}).filter((l) => l.done).length;
        return `${fmtInt(Object.keys(st.srs).length)} items, ${fmtInt(st.total)} answers, ${done} lesson${done === 1 ? '' : 's'} done`;
      };
      const when = backup.exported ? ` from ${new Date(backup.exported).toLocaleString()}` : '';
      if (!confirm(`Replace the progress in this browser (${count(state)}) with the backup${when} (${count(backup.state)})?`)) { onDone(null); return; }
      state = { ...backup.state, mode: 'progress' };
      save();
      renderScore();
      const box = document.getElementById('autoplay');
      if (box) box.checked = !!state.autoplay;
      show();
      onDone(null, `Progress restored${when}.`);
    };
    reader.readAsText(file);
  }
  function backupSection() {
    const status = h('p', { class: 'psec-note', role: 'status' });
    const picker = h('input', {
      type: 'file', accept: '.json,application/json', hidden: true,
      onchange: () => {
        const file = picker.files[0];
        picker.value = '';
        if (file) importProgress(file, (err, done) => { backupNotice = err ? 'Import failed: ' + err : done || ''; const el = document.getElementById('backupStatus'); if (el) el.textContent = backupNotice; });
      },
    });
    status.id = 'backupStatus';
    status.textContent = backupNotice;
    backupNotice = '';
    return psection('Back up your progress', 'Progress is stored only in this browser, so clearing site data or switching device loses it. Export saves everything (reviews, lessons, study time, settings) to a file; import loads such a file and replaces what is here.',
      h('div', { class: 'actions' },
        h('button', { class: 'btn', onclick: () => { exportProgress(); status.textContent = 'Saved a backup file to your downloads.'; } }, 'Export progress'),
        h('button', { class: 'btn secondary', onclick: () => picker.click() }, 'Import progress…'), picker),
      status);
  }

  // ---------- 6. lessons (guided, step-by-step presentations) ----------
  // Lesson text marks target-language phrases with *asterisks*: they are highlighted,
  // tappable to hear, and read with the target-language voice when narrating.
  const LESSONS_DESC = 'Short guided lessons in a suggested order: new words, examples and quick checks, then a real conversation. Read along, or turn on Read aloud and listen.';
  const PRACTICE_MODE = { ab: 'alphabet', v: 'verbs', n: 'nouns', '#': 'numbers', q: 'sentences', s: 'sentences', r: 'reading', l: 'listening' };
  const T = (text, extra) => ({ text, lang: 'target', ...extra });
  const E = (text) => ({ text, lang: 'en' });
  const speechOf = (text) => (text || '').split(/\*([^*]+)\*/)
    .map((t, i) => (i % 2 ? T(t) : E(t)))
    .filter((s) => /[\p{L}\p{N}]/u.test(s.text));
  // Arabic phrases show their romanization after them, except in quick checks (`noTr`),
  // where it would give the answer away
  const rich = (text, noTr) => (text || '').split(/\*([^*]+)\*/)
    .map((t, i) => (i % 2 ? h('span', { class: 'tl', title: 'Listen', onclick: () => speak(t) },
      AR && AT.hasArabic(t) ? [arOnly(state.hideMarks ? AT.stripMarks(t) : t), noTr ? null : h('span', { class: 'tr-inline' }, AT.romanize(t))] : t) : t))
    .filter((x) => x !== '');
  const cell = (x) => h('button', { class: 'cell', title: 'Listen', onclick: () => speak(x.say || x.it) },
    h('span', { class: 'c-it' }, target(x.it, { tr: x.tr })), h('span', { class: 'c-en' }, x.en));

  const lessonList = () => (data.lessons || []).slice().sort((a, b) => a.order - b.order);
  const lessonProgress = (id) => (state.lessons && state.lessons[id]) || { pos: 0, done: false };
  function setLessonProgress(id, patch) {
    state.lessons = { ...state.lessons, [id]: { ...lessonProgress(id), ...patch } };
    save();
  }
  // Queue the lesson's practice items for review (due now), unless already seen
  function seedPractice(lesson) {
    for (const id of lesson.practice || []) {
      if (!state.srs[id]) state.srs[id] = { box: 0, due: Date.now(), seen: 0, right: 0 };
    }
    save();
  }

  // One beat per press of Next. A dialogue gives a beat per line; with `practice` it
  // is followed by a role-play pass where each of that speaker's lines is a choice.
  function lessonBeats(lesson) {
    const beats = [];
    for (const step of lesson.steps) {
      if (step.type !== 'dialogue') { beats.push({ kind: step.type, step }); continue; }
      step.lines.forEach((line, i) => beats.push({ kind: 'line', step, line, first: i === 0 }));
      if (!step.practice) continue;
      beats.push({ kind: 'roleplay', step });
      let before = [];
      for (const line of step.lines) {
        if (line.s === step.practice) { beats.push({ kind: 'turn', step, line, before }); before = []; }
        else before.push(line);
      }
      if (before.length) beats.push({ kind: 'lines', step, lines: before });
    }
    beats.push({ kind: 'recap' });
    return beats;
  }

  function openLesson(id) {
    state.lesson = id;
    save();
    show();
    window.scrollTo(0, 0);
  }
  function closeLesson() {
    state.lesson = null;
    save();
    show();
  }

  function renderLessons() {
    const lesson = lessonList().find((l) => l.id === state.lesson);
    if (lesson) renderLesson(lesson);
    else renderLessonList();
  }

  const checkOrder = new WeakMap();
  function renderLessonList() {
    const lessons = lessonList();
    if (!lessons.length) { pane.append(h('div', { class: 'empty' }, 'No lessons yet.')); return; }
    const unitTitle = (id) => ((data.lessonUnits || []).find((u) => u.id === id) || {}).title;
    pane.append(h('ol', { class: 'lesson-list' }, lessons.flatMap((l, i) => {
      const p = lessonProgress(l.id);
      const heading = l.unit && (i === 0 || lessons[i - 1].unit !== l.unit)
        ? h('li', { class: 'unit-head' }, `Unit ${l.unit}`, unitTitle(l.unit) ? h('span', {}, ' \u00B7 ' + unitTitle(l.unit)) : null) : null;
      const started = !p.done && p.pos > 0;
      return [heading, h('li', {}, h('button', { class: 'lesson-card' + (p.done ? ' done' : ''), onclick: () => openLesson(l.id) },
        h('span', { class: 'lesson-num' }, p.done ? '✓' : String(i + 1)),
        h('span', { class: 'lesson-body' },
          h('span', { class: 'lesson-title' }, l.title, h('span', { class: 'lesson-sub' }, l.subtitle)),
          h('span', { class: 'lesson-goals' }, l.goals.map((g) => g.replace(/\*/g, '')).join(' · ')),
          started ? h('span', { class: 'meter' }, h('span', { style: `width:${Math.round(100 * (p.pos + 1) / lessonBeats(l).length)}%` })) : null),
        h('span', { class: 'lesson-go' }, p.done ? 'Review' : started ? 'Continue' : 'Start')))].filter(Boolean);
    })));
  }

  let lessonTimer = null;
  function renderLesson(lesson) {
    const lessons = lessonList();
    const number = lessons.indexOf(lesson) + 1;
    const beats = lessonBeats(lesson);
    const last = beats.length - 1;
    const allLines = lesson.steps.filter((s) => s.type === 'dialogue').flatMap((s) => s.lines).filter((l) => l.it);
    let pos = -1;
    let blocked = false; // an unanswered question holds the Next button
    let choose = null; // answers the open question by option index (keys 1–9)
    let thread = null; // the conversation currently being built

    const flow = h('div', { class: 'lesson-flow' + (state.lessonHideEn ? ' hide-en' : '') });
    const nextBtn = h('button', { class: 'btn', onclick: () => advance() }, 'Next');
    const fill = h('span');
    const counter = h('span', { class: 'count' });
    const bar = h('div', { class: 'lesson-bar' }, h('span', { class: 'meter' }, fill), counter, nextBtn);

    const boxes = {};
    const toggle = (key, label, onchange) => h('label', { class: 'toggle' },
      boxes[key] = h('input', { type: 'checkbox', checked: !!state[key], onchange: (e) => { state[key] = e.target.checked; onchange(state[key]); save(); } }),
      label);
    pane.append(
      h('div', { class: 'lesson-top' },
        h('button', { class: 'link-btn', onclick: closeLesson }, '← All lessons'),
        h('div', { class: 'lesson-tools' },
          canSpeak ? toggle('lessonAudio', 'Read aloud', (on) => {
            if (on) return;
            stopSpeech();
            clearTimeout(lessonTimer);
            state.lessonHandsFree = boxes.lessonHandsFree.checked = false;
          }) : null,
          canSpeak ? toggle('lessonHandsFree', 'Hands-free', (on) => {
            clearTimeout(lessonTimer);
            if (!on) return;
            state.lessonAudio = boxes.lessonAudio.checked = true;
            autoNext();
          }) : null,
          toggle('lessonHideEn', 'Hide chat translations', (on) => flow.classList.toggle('hide-en', on)),
          h('button', { class: 'link-btn', onclick: () => { setLessonProgress(lesson.id, { pos: 0 }); show(); } }, 'restart'))),
      h('header', { class: 'lesson-head' },
        h('div', { class: 'eyebrow' }, `Lesson ${number} · ${lesson.subtitle}`),
        h('h2', {}, lesson.title),
        h('div', { class: 'goals-label' }, 'By the end you’ll be able to:'),
        h('ul', { class: 'goals' }, lesson.goals.map((g) => h('li', {}, rich(g))))),
      flow, bar);

    keyHandler = (e) => {
      const n = Number(e.key);
      if (choose && n >= 1 && n <= 9) { choose(n - 1); return; }
      const onControl = ['BUTTON', 'INPUT', 'A'].includes(e.target.tagName);
      if (e.key === 'ArrowRight' || ((e.key === ' ' || e.key === 'Enter') && !onControl)) {
        e.preventDefault();
        advance();
      }
    };

    function advance() {
      clearTimeout(lessonTimer);
      if (blocked || pos >= last) return;
      reveal(pos + 1, true);
    }
    function reveal(i, live) {
      pos = i;
      blocked = false;
      choose = null;
      const { el, speech } = renderBeat(beats[i], live);
      if (i === last) {
        setLessonProgress(lesson.id, { pos, done: true });
        seedPractice(lesson);
      } else {
        setLessonProgress(lesson.id, { pos });
      }
      updateBar();
      if (live) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        narrate(speech);
      }
      return el;
    }
    function answered(speech) {
      blocked = false;
      choose = null;
      updateBar();
      nextBtn.focus({ preventScroll: true });
      narrate(speech);
    }
    function updateBar() {
      fill.style.width = `${Math.round(100 * (pos + 1) / beats.length)}%`;
      counter.textContent = `${pos + 1} / ${beats.length}`;
      nextBtn.disabled = blocked;
      nextBtn.textContent = blocked ? 'Choose an answer' : 'Next';
      bar.hidden = pos >= last;
    }
    function narrate(speech) {
      clearTimeout(lessonTimer);
      if (!state.lessonAudio || !canSpeak) return;
      if (!speech.length) { autoNext(); return; }
      say(speech).then((finished) => { if (finished) autoNext(); });
    }
    function autoNext() {
      clearTimeout(lessonTimer);
      if (state.lessonHandsFree && !blocked && pos < last) lessonTimer = setTimeout(advance, 700);
    }

    const speakerIndex = (step, s) => Object.keys(step.speakers).indexOf(s);
    // The role-played speaker sits on the right, like your own messages
    const isRight = (step, s) => (step.practice ? s === step.practice : speakerIndex(step, s) === 1);
    const lineSpeech = (step, line) => (line.narration ? [E(line.narration)]
      : [T(line.it, { voice: speakerIndex(step, line.s), pitch: [0.95, 1.15, 1.05][speakerIndex(step, line.s) % 3] })]);
    function bubble(step, line) {
      if (line.narration) return h('div', { class: 'narr' }, line.narration);
      return h('div', { class: 'bubble ' + (isRight(step, line.s) ? 'right' : 'left'), title: 'Listen', onclick: () => say(lineSpeech(step, line)) },
        h('div', { class: 'who' }, step.speakers[line.s].name),
        h('div', { class: 'b-it' }, target(line.it, { tr: line.tr })),
        h('div', { class: 'en' }, line.en));
    }
    const wrongLines = (line) => (line.wrong && line.wrong.length ? line.wrong
      : shuffle(allLines.filter((l) => norm(l.it) !== norm(line.it))).slice(0, 2).map((l) => l.it));
    const choiceBtn = (content, k, onpick) => h('button', { class: 'choice', onclick: () => onpick(k) },
      h('span', { class: 'key' }, String(k + 1)), h('span', {}, content));

    // Appends one beat to the page; returns the element to scroll to and what to say
    function renderBeat(beat, live) {
      const { step } = beat;
      const add = (node) => flow.appendChild(node);
      let el;
      let speech = [];
      switch (beat.kind) {
        case 'heading':
          el = add(h('h3', { class: 'blk l-h' }, rich(step.text)));
          speech = speechOf(step.text);
          break;
        case 'text':
          el = add(h('p', { class: 'blk l-p' }, rich(step.text)));
          speech = speechOf(step.text);
          break;
        case 'word':
          el = add(h('div', { class: 'blk word' },
            h('div', { class: 'w-it' }, target(step.it, { tr: step.tr, marks: true }), speakBtn(step.say || step.it)),
            h('div', { class: 'w-en' }, step.en),
            step.note ? h('div', { class: 'w-note' }, rich(step.note)) : null));
          speech = [T(step.say || step.it), E(step.en), ...speechOf(step.note)];
          break;
        case 'example':
          el = add(h('div', { class: 'blk ex' }, speakBtn(step.it),
            h('div', {}, h('div', { class: 'ex-it' }, target(step.it, { tr: step.tr })), h('div', { class: 'ex-en' }, step.en))));
          speech = [T(step.it), E(step.en)];
          break;
        case 'note':
          el = add(h('aside', { class: 'blk callout' },
            h('div', { class: 'callout-label' }, step.label || 'Note'), h('div', {}, rich(step.text))));
          speech = [E((step.label || 'Note') + '.'), ...speechOf(step.text)];
          break;
        case 'list':
          el = add(h('div', { class: 'blk' },
            step.title ? h('div', { class: 'list-title' }, rich(step.title)) : null,
            h('div', { class: 'list-grid' }, step.items.map(cell))));
          speech = [...speechOf(step.title), ...step.items.map((x) => T(x.say || x.it))];
          break;
        case 'check': {
          const fb = h('div', { class: 'check-fb' });
          let done = !live;
          // Options are authored with the answer first; show them in a shuffled order that stays put on re-render
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
            const explain = step.why ? step.why : ok ? '' : `The answer is ${step.options[step.answer]}.`;
            fb.replaceChildren(h('span', { class: 'verdict ' + (ok ? 'good' : 'bad') }, ok ? 'Yes! ' : 'Not quite. '), ...rich(explain));
            answered([E(ok ? 'Yes!' : 'Not quite.'), ...speechOf(explain)]);
          };
          const buttons = order.map((j, k) => choiceBtn(rich(step.options[j], true), k, pick));
          el = add(h('div', { class: 'blk check' }, h('div', { class: 'eyebrow' }, 'Quick check'),
            h('div', { class: 'check-q' }, rich(step.prompt, true)), h('div', { class: 'choices' }, buttons), fb));
          if (live) {
            blocked = true;
            choose = pick;
            speech = speechOf(step.prompt);
          } else {
            mark(answerAt);
            if (step.why) fb.append(...rich(step.why));
          }
          break;
        }
        case 'line':
          if (beat.first) {
            thread = add(h('div', { class: 'blk thread' }, step.title ? h('div', { class: 'thread-title' }, step.title) : null));
            if (step.title) speech.push(E(step.title + '.'));
          }
          el = thread.appendChild(bubble(step, beat.line));
          speech.push(...lineSpeech(step, beat.line));
          break;
        case 'roleplay': {
          const name = step.speakers[step.practice].name;
          el = thread = add(h('div', { class: 'blk thread roleplay' },
            h('div', { class: 'thread-title' }, `Your turn: you’re ${name}`),
            h('div', { class: 'thread-sub' }, `Replay “${step.title}”. Each time it’s ${name}’s turn, pick what to say.`)));
          speech = [E(`Your turn. You're ${name}. Each time it's ${name}'s turn, pick what to say.`)];
          break;
        }
        case 'turn': {
          const name = step.speakers[step.practice].name;
          for (const l of beat.before) {
            thread.append(bubble(step, l));
            speech.push(...lineSpeech(step, l));
          }
          if (!live) { el = thread.appendChild(bubble(step, beat.line)); break; }
          const options = shuffle([beat.line.it, ...wrongLines(beat.line)]);
          let done = false;
          const pick = (k) => {
            if (done || k >= options.length) return;
            done = true;
            const ok = options[k] === beat.line.it;
            const reply = bubble(step, beat.line);
            if (ok) reply.classList.add('got');
            el.replaceWith(...(ok ? [] : [h('div', { class: 'turn-miss' }, `You picked “${options[k]}”. ${name} would say:`)]), reply);
            answered([...(ok ? [] : [E(`Not quite. ${name} would say:`)]), ...lineSpeech(step, beat.line)]);
          };
          el = thread.appendChild(h('div', { class: 'turn' }, h('div', { class: 'who' }, `You (${name})`),
            options.map((o, k) => choiceBtn(target(o), k, pick))));
          blocked = true;
          choose = pick;
          break;
        }
        case 'lines':
          for (const l of beat.lines) {
            el = thread.appendChild(bubble(step, l));
            speech.push(...lineSpeech(step, l));
          }
          break;
        case 'recap': {
          const items = lesson.steps.flatMap((s) => (s.type === 'word' ? [s] : s.type === 'list' && s.recap ? s.items : []));
          const modes = [...new Set((lesson.practice || []).map((id) => PRACTICE_MODE[id.split(':')[0]]).filter(Boolean))];
          const next = lessons[number];
          const practise = (m) => {
            state.mode = m;
            // The alphabet recap opens on every group; the lesson's items are due first anyway
            state.filters = { ...state.filters, [m]: m === 'alphabet' ? {} : DEFAULT_FILTERS[m] || {} };
            recent[m] = [];
            save();
            show();
            window.scrollTo(0, 0);
          };
          el = add(h('section', { class: 'blk recap' },
            h('h3', { class: 'l-h' }, 'Lesson complete'),
            h('p', { class: 'l-p' }, 'Here is everything this lesson introduced. Tap anything to hear it again.'),
            h('div', { class: 'list-grid' }, items.map(cell)),
            modes.length ? h('p', { class: 'l-p muted' }, `This lesson’s practice items are now in your review queue, so they’ll come up soon in ${modes.map((m) => MODES[m].label).join(' and ')}.`) : null,
            h('div', { class: 'actions' },
              next ? h('button', { class: 'btn', onclick: () => openLesson(next.id) }, `Next lesson: ${next.title} →`) : null,
              modes.map((m) => h('button', { class: 'btn secondary', onclick: () => practise(m) }, `Practise in ${MODES[m].label}`)),
              h('button', { class: 'btn secondary', onclick: closeLesson }, 'All lessons'))));
          speech = [E('Lesson complete.')];
          break;
        }
        default:
          el = add(h('div', { class: 'blk' }));
      }
      return { el, speech };
    }

    // Resume where the learner left off: earlier beats render already answered
    const start = Math.min(lessonProgress(lesson.id).pos, last);
    let lastEl = null;
    for (let i = 0; i <= start; i++) lastEl = reveal(i, i === 0 && start === 0);
    if (start > 0 && start < last) requestAnimationFrame(() => lastEl.scrollIntoView({ block: 'center' }));
  }

  // ---------- chrome: tabs, stats, score ----------
  function renderScore() {
    const streak = state.streak > 1 ? ` · streak ${state.streak}` : '';
    document.getElementById('scoreText').textContent = `${state.correct}/${state.total} correct${streak}`;
  }
  function renderStats() {
    const statsEl = document.getElementById('stats');
    if (!MODES[state.mode]) { statsEl.replaceChildren(); return; }
    const now = Date.now();
    let fresh = 0, learning = 0, mastered = 0, due = 0;
    for (const i of poolFor(state.mode)) {
      const r = state.srs[i.id];
      if (!r) { fresh++; continue; }
      if (r.box >= MASTERED_BOX) mastered++; else learning++;
      if (r.due <= now) due++;
    }
    const stat = (label, n) => h('span', { class: 'stat' }, label, h('b', {}, String(n)));
    statsEl.replaceChildren(stat('New', fresh), stat('Learning', learning), stat('Mastered', mastered), stat('Due', due));
  }
  function renderTabs() {
    const tabs = [['lessons', 'Lessons'], ...activeModes().map((key) => [key, MODES[key].label]), ['tables', 'Word tables'], ['progress', 'Progress']];
    document.getElementById('modeTabs').replaceChildren(...tabs.map(([key, label]) =>
      h('button', {
        class: 'mode-btn' + (key === state.mode ? ' active' : ''),
        onclick: () => {
          if (key === 'lessons') state.lesson = null; // the tab always leads back to the list
          state.mode = key;
          save();
          show();
        },
      }, label)));
    const desc = state.mode === 'tables' ? '' : state.mode === 'progress' ? PROGRESS_DESC : state.mode === 'lessons' ? (state.lesson ? '' : LESSONS_DESC)
      : (data.ui.modeDesc || {})[state.mode] || MODES[state.mode].desc;
    document.getElementById('modeDesc').textContent = tl(desc);
    document.querySelector('main').classList.toggle('wide', state.mode === 'tables');
  }

  function renderFilters() {
    const el = document.getElementById('filters');
    const mode = state.mode;
    const keys = FILTER_KEYS[mode] || [];
    const settings = SETTINGS[mode] || [];
    if (!keys.length && !settings.length) { el.replaceChildren(); return; }
    const items = getItems(mode);
    const cur = activeFilters(mode);
    const filterRows = keys.map((key) => {
      const present = new Set(items.map((i) => i[key]));
      const options = [{ id: 'all', label: 'All' }, ...filterList(key).filter((o) => present.has(o.id))];
      if (options.length === 1) return null; // nothing to choose between (no functions tagged yet)
      return h('div', { class: 'filter-row' }, h('span', { class: 'filter-label' }, FILTER_LABEL[key]),
        options.map((o) => {
          const active = (cur[key] || 'all') === o.id;
          const n = items.filter((i) => matchesFilters(i, mode, cur, key) && (o.id === 'all' || i[key] === o.id)).length;
          return h('button', {
            class: 'pill-btn' + (active ? ' active' : ''), disabled: n === 0 && !active,
            onclick: () => { state.filters = { ...state.filters, [mode]: { ...cur, [key]: o.id } }; recent[mode] = []; save(); renderFilters(); ask(); },
          }, AR && AT.hasArabic(o.label) ? h('bdi', { dir: 'ltr' }, o.label) : o.label, h('span', { class: 'n' }, String(n)));
        }));
    });
    const settingRows = settings.map((set) => h('div', { class: 'filter-row' }, h('span', { class: 'filter-label' }, set.label),
      set.options.map((o) => h('button', {
        class: 'pill-btn' + (getSetting(mode, set.key) === o.id ? ' active' : ''),
        onclick: () => {
          state.settings = { ...state.settings, [mode]: { ...(state.settings || {})[mode], [set.key]: o.id } };
          recent[mode] = [];
          save(); renderFilters(); ask();
        },
      }, tl(o.label)))));
    el.replaceChildren(...filterRows.filter(Boolean), ...settingRows);
  }

  function show() {
    clearTimeout(lessonTimer);
    stopSpeech();
    renderTabs();
    renderFilters();
    if (!MODES[state.mode]) {
      keyHandler = null;
      pane.replaceChildren();
      if (state.mode === 'tables') renderTables();
      else if (state.mode === 'progress') renderProgress();
      else renderLessons();
      renderStats();
    } else {
      ask();
    }
  }

  function ask() {
    const mode = state.mode;
    keyHandler = null;
    pane.replaceChildren();
    if (!poolFor(mode).length) {
      pane.append(h('div', { class: 'empty' }, 'Nothing matches these filters.'));
      renderStats();
      return;
    }
    const item = pickNext(mode);
    let graded = false;
    MODES[mode].render(item, {
      grade: (ok, kind) => { if (!graded) { graded = true; record(item.id, ok, kind); } },
      next: ask,
    });
    renderStats();
  }

  // Drill tabs that have items in this language (a language without readings has no Reading tab)
  const activeModes = () => Object.keys(MODES).filter((key) => getItems(key).length);

  function init(json) {
    data = json;
    data.ui = data.ui || {};
    data.grammar = data.grammar || {};
    ['readings', 'articles', 'prepositions', 'conjunctions', 'adjectives', 'questions', 'sentences', 'glossary', 'lessons'].forEach((k) => { data[k] = data[k] || []; });
    AR = data.script === 'arabic';
    PERSON_LABEL = Object.fromEntries(data.personOptions.map((o) => [o.id, o.pronoun || o.id]));
    ACCENTS = data.ui.accents || [];
    // A typed verb may start with its subject pronoun ("noi parliamo", "él habla", "usted habla")
    const pronouns = [...new Set(Object.values(PERSON_LABEL).flatMap((p) => p.split(' / ')).flatMap((p) => [norm(p), stripAccents(norm(p))]))];
    SUBJECT_RE = new RegExp(`^(${pronouns.join('|')})\\s+`);
    if (!activeModes().includes(state.mode) && !['tables', 'lessons', 'progress'].includes(state.mode)) state.mode = 'lessons';
    startTimeTracking();
    document.addEventListener('keydown', (e) => {
      if (!keyHandler || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Enter' && e.target.tagName === 'BUTTON') return; // let the focused button handle it
      // Checking a typed answer moves focus to Next; without this the same Enter would also press it
      if (e.key === 'Enter' && e.target.tagName === 'INPUT') e.preventDefault();
      keyHandler(e);
    });
    if (canSpeak) {
      const toggle = document.getElementById('autoplayToggle');
      const box = document.getElementById('autoplay');
      toggle.hidden = false;
      box.checked = !!state.autoplay;
      box.addEventListener('change', () => { state.autoplay = box.checked; save(); });
      speechSynthesis.getVoices(); // warm up the async voice list
      speechSynthesis.addEventListener('voiceschanged', checkVoices);
      checkVoices();
    }
    if (AR) {
      // Romanization can be blurred (hover or tap to peek); vowel marks can be hidden
      const trBox = document.getElementById('showTr');
      const marksBox = document.getElementById('showMarks');
      document.getElementById('trToggle').hidden = false;
      document.getElementById('marksToggle').hidden = false;
      trBox.checked = !state.hideTr;
      marksBox.checked = !state.hideMarks;
      document.body.classList.toggle('hide-tr', !!state.hideTr);
      trBox.addEventListener('change', () => { state.hideTr = !trBox.checked; document.body.classList.toggle('hide-tr', state.hideTr); save(); });
      marksBox.addEventListener('change', () => { state.hideMarks = !marksBox.checked; save(); show(); });
    }
    document.getElementById('resetLink').addEventListener('click', () => {
      if (!confirm('Reset all progress and scores?')) return;
      state = {
        ...defaults(), mode: state.mode, table: state.table, tableTense: state.tableTense, filters: state.filters, settings: state.settings, autoplay: state.autoplay,
        lessonAudio: state.lessonAudio, lessonHandsFree: state.lessonHandsFree, lessonHideEn: state.lessonHideEn,
        hideTr: state.hideTr, hideMarks: state.hideMarks,
      };
      save();
      renderScore();
      show();
    });
    renderScore();
    show();
  }

  // Header: app name and the language switcher (switching reloads with ?lang=, since
  // every cache and the saved state belong to one language)
  function renderLanguagePicker() {
    document.title = LANG.app;
    document.querySelector('.topbar h1').textContent = LANG.app;
    document.documentElement.lang = LANG.uiLang || LANG.code;
    const select = document.getElementById('langSelect');
    select.replaceChildren(...LANGS.map((l) => h('option', { value: l.code, selected: l === LANG }, l.name)));
    select.addEventListener('change', () => {
      try { localStorage.setItem(LANG_KEY, select.value); } catch (e) { /* ignore */ }
      const url = new URL(location.href);
      url.searchParams.set('lang', select.value);
      location.href = url.href;
    });
  }
  renderLanguagePicker();

  fetch(LANG.file)
    .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(init)
    .catch((err) => {
      pane.replaceChildren(h('div', { class: 'error' },
        'Could not load ' + LANG.file + ' (' + err.message + '). Serve this folder over http (e.g. node server.js) instead of opening the file directly.'));
    });
})();
