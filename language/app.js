(() => {
  'use strict';

  const STORE_KEY = 'italiano.v1';
  const DAY = 86400000;
  const BOX_DAYS = [0, 1, 3, 7, 14, 30]; // Leitner: days until next review, by box
  const MASTERED_BOX = 3;
  const RECENT_WINDOW = 3; // don't repeat an item within this many questions
  const PERSON_LABEL = { io: 'io', tu: 'tu', lui: 'lui / lei', noi: 'noi', voi: 'voi', loro: 'loro' };
  const ACCENTS = ['à', 'è', 'é', 'ì', 'ò', 'ù'];

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
  const stripEnd = (s) => s.replace(/[.?!]+$/, '');
  const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const withArticle = (art, word) => (art.endsWith("'") ? art + word : art + ' ' + word);
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
    return { srs: {}, correct: 0, total: 0, streak: 0, mode: 'verbs', table: 'verbs', tableTense: 'present', filters: {}, settings: {}, autoplay: false };
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(STORE_KEY));
      if (s && s.srs) return { ...defaults(), ...s };
    } catch (e) { /* storage unavailable or corrupt */ }
    return defaults();
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  // ---------- spaced repetition (Leitner boxes) ----------
  function record(id, ok) {
    const r = state.srs[id] || { box: 0, due: 0, seen: 0, right: 0 };
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
  const FILTER_KEYS = { verbs: ['tense', 'person'], nouns: ['topic'], sentences: ['topic', 'type', 'function'] };
  const FILTER_LABEL = { tense: 'Tense', person: 'Person', topic: 'Topic', type: 'Type', function: 'Function' };
  const DEFAULT_FILTERS = { verbs: { tense: 'present' } };
  const filterList = (key) => ({ topic: data.topics, type: data.sentenceTypes, tense: data.tenseOptions, person: data.personOptions, function: data.functions })[key];
  // Non-filtering options shown as extra pill rows (persisted in state.settings)
  const SETTINGS = {
    verbs: [{
      key: 'format', label: 'Format', fallback: 'mixed',
      options: [{ id: 'mixed', label: 'Mixed' }, { id: 'choose', label: 'Choose' }, { id: 'type', label: 'Type' }],
    }],
    reading: [{
      key: 'direction', label: 'Direction', fallback: 'it-en',
      options: [{ id: 'it-en', label: 'Italian → English' }, { id: 'en-it', label: 'English → Italian' }],
    }],
  };
  const getSetting = (mode, key) => ((state.settings && state.settings[mode]) || {})[key] || SETTINGS[mode].find((x) => x.key === key).fallback;
  const labelOf = (list, id) => (list.find((x) => x.id === id) || {}).label || id;
  const activeFilters = (mode) => (state.filters && state.filters[mode]) || DEFAULT_FILTERS[mode] || {};
  const matchesFilters = (item, mode, filters, skipKey) => (FILTER_KEYS[mode] || []).every((k) =>
    k === skipKey || !filters[k] || filters[k] === 'all' || item[k] === filters[k]);
  const poolFor = (mode) => getItems(mode).filter((i) => matchesFilters(i, mode, activeFilters(mode)));

  // Due items first (weakest box, oldest due), otherwise introduce the next
  // unseen item in frequency-rank order, otherwise practise the soonest-due item.
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
      const minRank = Math.min(...fresh.map((i) => i.rank));
      pick = pickRandom(fresh.filter((i) => i.rank === minRank));
    } else {
      pick = pool.slice().sort((a, b) => state.srs[a.id].due - state.srs[b.id].due)[0];
    }
    last.push(pick.id);
    if (last.length > RECENT_WINDOW) last.shift();
    return pick;
  }

  // ---------- exercise item pools ----------
  const MODES = {
    verbs: {
      label: 'Verbs',
      desc: 'Conjugate the most common verbs. Pick a tense and person, and choose whether to select or type the answer. Verbs are introduced in frequency order.',
      build: () => data.verbs.flatMap((verb) =>
        Object.keys(verb.tenses).flatMap((tense) =>
          data.persons.map((person) => ({
            id: `v:${verb.id}:${tense}:${person}`, rank: verb.rank, verb, tense, person, form: verb.tenses[tense][person],
          })))),
      render: renderVerb,
    },
    nouns: {
      label: 'Nouns',
      desc: 'Pick the right article. Watch for lo / l’ and un / uno / un’.',
      build: () => data.nouns.map((noun) => ({ id: `n:${noun.id}`, rank: noun.rank, topic: noun.topic, noun })),
      render: renderNoun,
    },
    numbers: {
      label: 'Numbers',
      desc: 'Numbers 1\u201320, then the tens up to 100. Type the word, or pick the digits.',
      build: () => data.numbers.map((num) => ({ id: `#:${num.value}`, rank: num.rank, num })),
      render: renderNumber,
    },
    sentences: {
      label: 'Sentences',
      desc: 'Translate by tapping the Italian words into the right order.',
      build: () => [
        ...data.questions.map((s) => ({ id: `q:${s.id}`, rank: s.rank, topic: s.topic, type: s.type, function: s.function, s, isQuestion: true })),
        ...data.sentences.map((s) => ({ id: `s:${s.id}`, rank: s.rank, topic: s.topic, type: s.type, function: s.function, s, isQuestion: false })),
      ],
      render: renderSentence,
    },
    reading: {
      label: 'Reading',
      desc: 'Real Italian, from Wikipedia — translate each sentence by tapping the words into order. Vocabulary here goes beyond the rest of the app.',
      build: () => data.readings.flatMap((r, ri) => r.sentences.map((s, si) => ({
        id: `r:${s.id}`, rank: s.rank, reading: r, sIndex: si, s,
      }))),
      render: renderReading,
    },
  };
  function getItems(mode) {
    return itemCache[mode] || (itemCache[mode] = MODES[mode].build());
  }

  // ---------- audio (browser speech synthesis) ----------
  const canSpeak = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  function speak(text) {
    if (!canSpeak) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'it-IT';
    const voice = speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().replace('_', '-').startsWith('it'));
    if (voice) u.voice = voice;
    u.rate = 0.9;
    speechSynthesis.speak(u);
  }
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
    const targets = verbAnswers(item.form).map(norm);
    const g = norm(guess).replace(/^(io|tu|lui|lei|noi|voi|loro)\s+/, '');
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
      h('div', { class: 'pronoun' }, PERSON_LABEL[person]), h('div', { class: 'pronoun-en' }, personEn(person))));
    let input = null;
    let accents = null;
    let options = [];
    let buttons = [];
    const body = [prompt];

    if (choosing) {
      options = verbChoices(item);
      buttons = options.map((opt, i) =>
        h('button', { class: 'option', onclick: () => finish(opt, false) }, opt, h('span', { class: 'key' }, String(i + 1))));
      body.push(h('div', { class: 'options two' }, buttons));
      keyHandler = (e) => { const n = Number(e.key); if (n >= 1 && n <= options.length) finish(options[n - 1], false); };
    } else {
      input = h('input', { type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Conjugated form' });
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
      h('div', { class: 'big' }, verb.id),
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
      ctx.grade(res.ok);

      const table = verb.tenses[tense];
      const example = verb.examples.find((x) => x.tense === tense);
      feedback.replaceChildren(feedbackBox(res.ok, res.ok ? 'Correct!' : 'Not quite',
        h('div', { class: 'answer' }, spokenPerson(person) + ' ' + form),
        res.accentNote ? h('div', { class: 'note' }, 'Mind the accent: ' + form) : null,
        tenseInfo.description ? h('div', { class: 'note' }, tenseInfo.description) : null,
        h('table', { class: 'conj' }, data.persons.map((p) =>
          h('tr', { class: p === person ? 'asked' : '' }, h('td', {}, PERSON_LABEL[p]), h('td', {}, table[p])))),
        example ? h('div', { class: 'example' }, speakBtn(example.it),
          h('span', {}, h('span', { class: 'it' }, example.it), ' — ' + example.en)) : null));
      autoSpeak(spokenPerson(person) + ' ' + spokenForm(form));
      afterAnswer(ctx, actions, nextButton(ctx));
    }
  }

  // ---------- 2. noun articles ----------
  const DEFINITE = ['il', 'lo', 'la', "l'"];
  const INDEFINITE = ['un', 'uno', 'una', "un'"];
  const ARTICLE_RULE = {
    il: 'Masculine nouns starting with most consonants take il.',
    lo: 'Masculine nouns starting with z, s + consonant, gn, ps or pn take lo.',
    la: 'Feminine nouns starting with a consonant take la.',
    "l'": 'Nouns of either gender starting with a vowel take l’.',
    un: 'Masculine nouns starting with a vowel or most consonants take un.',
    uno: 'Masculine nouns starting with z, s + consonant, gn or ps take uno.',
    una: 'Feminine nouns starting with a consonant take una.',
    "un'": 'Feminine nouns starting with a vowel take un’.',
  };
  function indefiniteFor(noun) {
    if (noun.art === 'il') return 'un';
    if (noun.art === 'lo') return 'uno';
    if (noun.art === 'la') return 'una';
    return noun.gender === 'm' ? 'un' : "un'";
  }
  function pluralArticle(noun) {
    if (noun.art === 'il') return 'i';
    if (noun.art === 'la') return 'le';
    if (noun.art === 'lo') return 'gli';
    return noun.gender === 'm' ? 'gli' : 'le';
  }

  function renderNoun(item, ctx) {
    const { noun } = item;
    const definite = Math.random() < 0.5;
    const options = definite ? DEFINITE : INDEFINITE;
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
        h('div', { class: 'note' }, (noun.gender === 'm' ? 'masculine' : 'feminine') + ' — ' + ARTICLE_RULE[correct]),
        h('div', { class: 'example' }, speakBtn(withArticle(noun.art, noun.id)))));
      autoSpeak(withArticle(noun.art, noun.id));
      afterAnswer(ctx, actions, nextButton(ctx));
    }
  }

  // ---------- 5. numbers ----------
  function numberNote(v) {
    if (v >= 11 && v <= 16) return 'Eleven to sixteen end in -dici.';
    if (v >= 17 && v <= 19) return 'Seventeen to nineteen are dici- plus the digit: diciassette, diciotto, diciannove.';
    if (v >= 30 && v <= 90) return 'Trenta ends in -enta; quaranta to novanta end in -anta.';
    return null;
  }

  function renderNumber(item, ctx) {
    const { num } = item;
    const typed = Math.random() < 0.5;
    let answered = false;
    const feedback = h('div');
    const actions = h('div', { class: 'actions' });
    const showFeedback = (ok) => {
      const note = numberNote(num.value);
      feedback.replaceChildren(feedbackBox(ok, ok ? 'Correct!' : 'Not quite',
        h('div', { class: 'answer' }, `${num.value} = ${num.it}`),
        note ? h('div', { class: 'note' }, note) : null,
        h('div', { class: 'example' }, speakBtn(num.it))));
      autoSpeak(num.it);
      afterAnswer(ctx, actions, nextButton(ctx));
    };

    if (typed) {
      const input = h('input', { type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Number in Italian' });
      actions.append(
        h('button', { class: 'btn', onclick: () => finish(input.value, false) }, 'Check'),
        h('button', { class: 'btn secondary', onclick: () => finish('', true) }, "I don't know"));
      pane.append(h('div', { class: 'card' },
        h('div', { class: 'eyebrow' }, 'Write this number in Italian'),
        h('div', { class: 'big' }, String(num.value)),
        h('div', { class: 'prompt-row' }, input), actions, feedback));
      input.focus();
      keyHandler = (e) => { if (e.key === 'Enter') finish(input.value, false); };

      function finish(guess, gaveUp) {
        if (answered || (!gaveUp && !guess.trim())) return;
        answered = true;
        input.disabled = true;
        const ok = !gaveUp && norm(guess) === num.it;
        ctx.grade(ok);
        showFeedback(ok);
      }
    } else {
      const nearest = getItems('numbers').filter((i) => i.num.value !== num.value)
        .sort((a, b) => Math.abs(a.num.value - num.value) - Math.abs(b.num.value - num.value)).slice(0, 6);
      const options = shuffle([num.value, ...shuffle(nearest).slice(0, 3).map((i) => i.num.value)]);
      const buttons = options.map((v, i) =>
        h('button', { class: 'option', onclick: () => choose(v) }, String(v), h('span', { class: 'key' }, String(i + 1))));
      pane.append(h('div', { class: 'card' },
        h('div', { class: 'eyebrow' }, 'Which number is this?'),
        h('div', { class: 'big' }, num.it, ' ', speakBtn(num.it)),
        h('div', { class: 'options' }, buttons), feedback, actions));
      keyHandler = (e) => { const n = Number(e.key); if (n >= 1 && n <= options.length) choose(options[n - 1]); };

      function choose(v) {
        if (answered) return;
        answered = true;
        const ok = v === num.value;
        ctx.grade(ok);
        buttons.forEach((b, i) => {
          b.disabled = true;
          if (options[i] === num.value) b.classList.add('correct');
          else if (options[i] === v) b.classList.add('wrong');
        });
        showFeedback(ok);
      }
    }
  }

  // ---------- 3. sentence builder ----------
  function renderSentence(item, ctx) {
    const { s } = item;
    const words = stripEnd(s.it).split(/\s+/);
    const tiles = shuffleTiles(words.map((w, i) => ({ id: i, text: i === 0 ? w.charAt(0).toLowerCase() + w.slice(1) : w })));
    const accepted = [s.it, ...(s.accepted || [])].map((x) => norm(stripEnd(x)));
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
      ctx.grade(ok);
      const alt = (s.accepted || []);
      const fnInfo = s.function && data.functions.find((f) => f.id === s.function);
      feedback.replaceChildren(feedbackBox(ok, ok ? 'Correct!' : gaveUp ? 'Answer' : 'Not quite',
        h('div', { class: 'answer' }, s.it),
        alt.length ? h('div', { class: 'note' }, 'Also accepted: ' + alt.join(' / ')) : null,
        fnInfo ? h('div', { class: 'note' }, fnInfo.label + ' \u2014 ' + fnInfo.description) : null,
        h('div', { class: 'example' }, speakBtn(s.it), h('span', {}, s.en)),
        s.answers ? h('div', { class: 'example' }, speakBtn(s.answers[0].it),
          h('span', {}, 'Possible reply: ', h('span', { class: 'it' }, s.answers[0].it), ' — ' + s.answers[0].en)) : null));
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
      h('div', { class: 'eyebrow' }, `Reading · ${reading.title} · sentence ${sIndex + 1} of ${reading.sentences.length} · ${itToEn ? 'Italian → English' : 'English → Italian'}`),
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
      ctx.grade(ok);
      feedback.replaceChildren(feedbackBox(ok, ok ? 'Correct!' : gaveUp ? 'Answer' : 'Not quite',
        h('div', { class: 'answer' }, target),
        h('div', { class: 'example' }, speakBtn(s.it), h('span', {}, s.it + ' — ' + s.en)),
        h('div', { class: 'note' }, 'Source: Wikipedia — ',
          h('a', { href: reading.source.url, target: '_blank', rel: 'noopener' }, reading.source.title),
          ' (', reading.license, ')')));
      autoSpeak(s.it);
      afterAnswer(ctx, actions, nextButton(ctx));
    }
  }

  // ---------- 4. word tables (reference browser) ----------
  function statusOf(id) {
    const r = state.srs[id];
    return !r ? 'New' : r.box >= MASTERED_BOX ? 'Mastered' : 'Learning';
  }
  const statusCell = (id) => { const st = statusOf(id); return { node: h('span', { class: 'pill ' + st.toLowerCase() }, st) }; };
  const it = (t, speakText) => ({ t, cls: 'it', speak: speakText === undefined ? t : speakText });

  const tableTense = () => (data.tenseOptions.some((t) => t.id === state.tableTense) ? state.tableTense : 'present');

  const TABLES = {
    verbs: {
      label: 'Verbs',
      note: 'Pick a tense. Irregular verbs are highlighted in blue.',
      head: ['#', 'Infinitive', 'English', 'io', 'tu', 'lui / lei', 'noi', 'voi', 'loro', 'Aux.', 'Participle', 'Mastered'],
      rows: () => {
        const tense = tableTense();
        return data.verbs.map((v, i) => {
          const ids = data.persons.map((p) => `v:${v.id}:${tense}:${p}`);
          const mastered = ids.filter((id) => statusOf(id) === 'Mastered').length;
          const forms = v.tenses[tense];
          return {
            search: [v.id, v.en, ...Object.values(forms)].join(' '),
            cells: [i + 1, { t: v.id, cls: v.irregular ? 'it irr' : 'it', speak: v.id }, v.en,
              ...data.persons.map((p) => it(forms[p], null)), v.auxiliary, v.participle, `${mastered}/${ids.length}`],
          };
        });
      },
    },
    nouns: {
      label: 'Nouns',
      note: 'Singular and plural with definite article, plus the indefinite article.',
      head: ['#', 'Italian', 'English', 'Topic', 'Gender', 'Plural', 'A / an', 'Status'],
      rows: () => data.nouns.map((n, i) => ({
        search: [n.id, n.plural, n.en, labelOf(data.topics, n.topic)].join(' '),
        cells: [i + 1, it(withArticle(n.art, n.id)), n.en, labelOf(data.topics, n.topic), n.gender === 'm' ? 'masc.' : 'fem.',
          it(withArticle(pluralArticle(n), n.plural)), it(withArticle(indefiniteFor(n), n.id), null), statusCell(`n:${n.id}`)],
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
    numbers: {
      label: 'Numbers',
      note: '1\u201320, then the tens up to 100.',
      head: ['#', 'Digits', 'Italian', 'Status'],
      rows: () => data.numbers.map((n, i) => ({
        search: [n.value, n.it].join(' '),
        cells: [i + 1, String(n.value), it(n.it), statusCell(`#:${n.value}`)],
      })),
    },
    questions: {
      label: 'Questions',
      note: 'Common questions with a sample reply.',
      head: ['#', 'Italian', 'English', 'Sample reply', 'Status'],
      rows: () => data.questions.map((q, i) => ({
        search: [q.it, q.en, q.answers[0].it].join(' '),
        cells: [i + 1, it(q.it), q.en, it(q.answers[0].it), statusCell(`q:${q.id}`)],
      })),
    },
    sentences: {
      label: 'Sentences',
      note: 'Practice sentences from the sentence builder, labelled by type, topic and function.',
      head: ['#', 'Italian', 'English', 'Type', 'Topic', 'Function', 'Status'],
      rows: () => data.sentences.map((s, i) => ({
        search: [s.it, s.en, labelOf(data.sentenceTypes, s.type), labelOf(data.topics, s.topic), s.function ? labelOf(data.functions, s.function) : ''].join(' '),
        cells: [i + 1, it(s.it), s.en, labelOf(data.sentenceTypes, s.type), labelOf(data.topics, s.topic), s.function ? labelOf(data.functions, s.function) : '\u2014', statusCell(`s:${s.id}`)],
      })),
    },
    readings: {
      label: 'Readings',
      note: 'Real Italian text from Wikipedia, sentence by sentence, used by the Reading tab.',
      head: ['#', 'Italian', 'English', 'Source', 'Status'],
      rows: () => data.readings.flatMap((r) => r.sentences.map((s, i) => ({
        search: [s.it, s.en, r.title].join(' '),
        cells: [`${r.title} ${i + 1}`, it(s.it), s.en, r.title, statusCell(`r:${s.id}`)],
      }))),
    },
  };

  function renderTables() {
    const key = TABLES[state.table] ? state.table : 'verbs';
    const spec = TABLES[key];
    const rows = spec.rows();
    const tbody = h('tbody');
    const count = h('span', { class: 'count' });
    const search = h('input', { type: 'text', class: 'search', placeholder: 'Search Italian or English…', 'aria-label': 'Search words', autocomplete: 'off', spellcheck: 'false' });
    const plain = (s) => stripAccents(norm(s));
    const td = (c) => {
      if (typeof c !== 'object') c = { t: String(c) };
      return h('td', { class: c.cls || '' }, c.node || c.t, c.speak ? speakBtn(c.speak) : null);
    };
    function fill() {
      const q = plain(search.value);
      const shown = rows.filter((r) => !q || plain(r.search).includes(q));
      tbody.replaceChildren(...shown.map((r) => h('tr', {}, r.cells.map(td))));
      count.textContent = `${shown.length} of ${rows.length}`;
    }
    search.addEventListener('input', fill);

    pane.append(...[
      h('div', { class: 'table-tabs' }, Object.entries(TABLES).map(([k, t]) =>
        h('button', { class: 'pill-btn' + (k === key ? ' active' : ''), onclick: () => { state.table = k; save(); show(); } }, t.label))),
      key === 'verbs' ? h('div', { class: 'table-tabs' }, data.tenseOptions.map((t) =>
        h('button', { class: 'pill-btn' + (t.id === tableTense() ? ' active' : ''), onclick: () => { state.tableTense = t.id; save(); show(); } }, t.label))) : null,
      h('p', { class: 'mode-desc' }, spec.note),
      h('div', { class: 'table-tools' }, search, count),
      h('div', { class: 'table-wrap' }, h('table', { class: 'words' },
        h('thead', {}, h('tr', {}, spec.head.map((x) => h('th', {}, x)))), tbody)),
    ].filter(Boolean));
    fill();
  }

  // ---------- chrome: tabs, stats, score ----------
  function renderScore() {
    const streak = state.streak > 1 ? ` · streak ${state.streak}` : '';
    document.getElementById('scoreText').textContent = `${state.correct}/${state.total} correct${streak}`;
  }
  function renderStats() {
    const statsEl = document.getElementById('stats');
    if (state.mode === 'tables') { statsEl.replaceChildren(); return; }
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
    const tabs = [...Object.entries(MODES).map(([key, m]) => [key, m.label]), ['tables', 'Word tables']];
    document.getElementById('modeTabs').replaceChildren(...tabs.map(([key, label]) =>
      h('button', {
        class: 'mode-btn' + (key === state.mode ? ' active' : ''),
        onclick: () => { state.mode = key; save(); renderTabs(); show(); },
      }, label)));
    document.getElementById('modeDesc').textContent = state.mode === 'tables' ? '' : MODES[state.mode].desc;
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
      return h('div', { class: 'filter-row' }, h('span', { class: 'filter-label' }, FILTER_LABEL[key]),
        options.map((o) => {
          const active = (cur[key] || 'all') === o.id;
          const n = items.filter((i) => matchesFilters(i, mode, cur, key) && (o.id === 'all' || i[key] === o.id)).length;
          return h('button', {
            class: 'pill-btn' + (active ? ' active' : ''), disabled: n === 0 && !active,
            onclick: () => { state.filters = { ...state.filters, [mode]: { ...cur, [key]: o.id } }; recent[mode] = []; save(); renderFilters(); ask(); },
          }, o.label, h('span', { class: 'n' }, String(n)));
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
      }, o.label))));
    el.replaceChildren(...filterRows, ...settingRows);
  }

  function show() {
    renderTabs();
    renderFilters();
    if (state.mode === 'tables') {
      keyHandler = null;
      pane.replaceChildren();
      renderTables();
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
      grade: (ok) => { if (!graded) { graded = true; record(item.id, ok); } },
      next: ask,
    });
    renderStats();
  }

  function init(json) {
    data = json;
    if (!MODES[state.mode] && state.mode !== 'tables') state.mode = 'verbs';
    document.addEventListener('keydown', (e) => {
      if (!keyHandler || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Enter' && e.target.tagName === 'BUTTON') return; // let the focused button handle it
      keyHandler(e);
    });
    if (canSpeak) {
      const toggle = document.getElementById('autoplayToggle');
      const box = document.getElementById('autoplay');
      toggle.hidden = false;
      box.checked = !!state.autoplay;
      box.addEventListener('change', () => { state.autoplay = box.checked; save(); });
      speechSynthesis.getVoices(); // warm up the async voice list
    }
    document.getElementById('resetLink').addEventListener('click', () => {
      if (!confirm('Reset all progress and scores?')) return;
      state = { ...defaults(), mode: state.mode, table: state.table, tableTense: state.tableTense, filters: state.filters, settings: state.settings, autoplay: state.autoplay };
      save();
      renderScore();
      show();
    });
    renderScore();
    show();
  }

  fetch('data/italian.json')
    .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(init)
    .catch((err) => {
      pane.replaceChildren(h('div', { class: 'error' },
        'Could not load data/italian.json (' + err.message + '). Serve this folder over http (e.g. node server.js) instead of opening the file directly.'));
    });
})();
