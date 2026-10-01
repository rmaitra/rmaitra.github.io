// ============ Narration ============
// Reads lesson beats aloud with the device's own speechSynthesis voices, if the
// learner picks one from the narrator menu. Which voices and accents exist depends
// on the browser and system (Edge has the most).
//
// The text functions touch no DOM, so they can be loaded and checked in Node.
(function () {
  'use strict';

  const PREF_KEY = 'mathStudio.narrator';

  // ---------- spoken text ----------
  // Respellings for names speech voices tend to get wrong. They were tuned against
  // espeak (the pronouncer behind many simple voices); lower-case, mostly
  // unhyphenated spellings work best, since each hyphenated piece gets its own stress.
  const LEXICON = {
    Syene: 'sigh-eenie',
    Cyrene: 'sighreeni',
    skaphe: 'skahfee',
    gnomon: 'nohmon',
    stadion: 'stahdion',
    Cleomedes: 'Klee-ommadeez',
    Canopus: 'kuh-nohpus',
    Nicomachus: 'Nye-kommakus',
  };

  const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const ORD = { one: 'first', two: 'second', three: 'third', five: 'fifth', eight: 'eighth', nine: 'ninth', twelve: 'twelfth' };
  const REGNAL = { II: 'Second', III: 'Third', IV: 'Fourth', V: 'Fifth', VI: 'Sixth' };
  function words(n) {
    if (n < 20) return ONES[n];
    return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
  }
  // 50 → "fiftieth", 48 → "forty-eighth"
  function ordinal(n) {
    const w = words(n);
    const parts = w.split('-');
    const last = parts.pop();
    const o = ORD[last] || (last.endsWith('y') ? last.slice(0, -1) + 'ieth' : last + 'th');
    return [...parts, o].join('-');
  }
  function fraction(a, b) {
    const n = Number(a), d = Number(b);
    if (n === 1 && Number.isInteger(d) && d >= 3 && d < 100) return 'one ' + ordinal(d);
    if (n === 1 && d === 2) return 'one half';
    return `${a} over ${b}`;
  }

  // A small TeX-to-speech pass, enough for the notation the lessons use. Anything
  // it reads badly can be overridden with a `say` field on the step or line.
  function speakTex(src) {
    let s = src;
    s = s.replace(/(\d)\\,(?=\d)/g, '$1,');
    s = s.replace(/\\text\{([^}]*)\}/g, ' ‹$1› ');
    for (let i = 0; i < 3; i++) {
      s = s.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, (m, a, b) => ` ‹${fraction(a.trim(), b.trim())}› `);
    }
    s = s.replace(/\^\{?2\}?/g, ' squared').replace(/\^\{?3\}?/g, ' cubed').replace(/\^\{([^}]*)\}/g, ' to the power $1').replace(/\^(\w)/g, ' to the power $1');
    const sym = { times: 'times', div: 'divided by', approx: 'is about', cdot: 'times', pi: 'pi', theta: 'theta', alpha: 'alpha', beta: 'beta', le: 'is at most', ge: 'is at least', ne: 'is not equal to', sqrt: 'the square root of' };
    s = s.replace(/\\([a-zA-Z]+)/g, (m, name) => (sym[name] ? ` ${sym[name]} ` : ' '));
    // Operators only outside \text{…}, which is protected by ‹ › until here
    s = s.split(/(‹[^›]*›)/).map((part) => part.startsWith('‹') ? part.slice(1, -1) : part
      .replace(/=/g, ' equals ').replace(/\+/g, ' plus ').replace(/[−-]/g, ' minus ').replace(/[{}]/g, ' ')).join(' ');
    return s;
  }

  function speakable(text) {
    if (!text) return '';
    let s = String(text);
    s = s.replace(/\\\((.*?)\\\)/g, (m, t) => speakTex(t)).replace(/\\\[(.*?)\\\]/g, (m, t) => speakTex(t));
    s = s.replace(/\*/g, '');
    s = s.replace(/\bc\.\s*(?=\d)/g, 'around ');
    s = s.replace(/(\d)\s*[–—-]\s*(?=(around )?\d)/g, '$1 to ');
    s = s.replace(/\b1\/(\d+)th\b/g, (m, b) => fraction(1, b));
    s = s.replace(/\b(\d+)\/(\d+)\b/g, (m, a, b) => fraction(a, b));
    s = s.replace(/\b([A-Z][a-z]+) (II|III|IV|V|VI)\b/g, (m, name, r) => `${name} the ${REGNAL[r]}`);
    s = s.replace(/°\s*N\b/g, ' degrees north').replace(/°\s*S\b/g, ' degrees south').replace(/°/g, ' degrees');
    s = s.replace(/(\d)\s*km\b/g, '$1 kilometres').replace(/(\d)\s*m\b/g, '$1 metres');
    s = s.replace(/\bBCE\b/g, 'B.C.E.').replace(/\bCE\b/g, 'C.E.');
    s = s.replace(/[—–]/g, ', ');
    for (const [word, say] of Object.entries(LEXICON)) s = s.replace(new RegExp(`\\b${word}\\b`, 'g'), say);
    return s.replace(/\s+([,.;:?!])/g, '$1').replace(/\s{2,}/g, ' ').trim();
  }

  const join = (...parts) => parts.filter(Boolean).map((p) => {
    const t = speakable(p);
    return /[.?!:…"”][)]?$/.test(t) ? t : t + '.';
  }).join(' ');

  function dialogueLine(step, line) {
    if (line.narration) return line.say || line.narration;
    const name = step.speakers[line.s].name;
    return line.say || (name === 'You' ? `You: ${line.text}` : `${name}: ${line.text}`);
  }

  // The words read for one beat (see Stories.lessonBeats), or '' for beats with
  // nothing to read (a bare diagram). Any step, derivation line or dialogue line
  // can carry `say` to replace the generated text.
  function beatText(beat) {
    const { step } = beat;
    if (!step) return beat.kind === 'recap' ? 'Lesson complete.' : '';
    if (step.say && beat.kind !== 'derive' && beat.kind !== 'turn' && beat.kind !== 'lines') return join(step.say);
    switch (beat.kind) {
      case 'scene': return join(`${step.place}, ${step.year}`, step.text);
      case 'picture': return join(step.caption);
      case 'heading':
      case 'text': return join(step.text);
      case 'person': return join(step.name, step.dates, step.bio);
      case 'quote': return join(step.text, step.cite && `From ${step.cite.replace(/\s*\((\d{4})\)/, ', $1')}`);
      case 'thenNow': return join(`Then: ${step.then}`, `Now: ${step.now}`, step.note);
      case 'note': return join(step.label || 'Note', step.text);
      case 'meanwhile': return join(`Meanwhile, ${step.place}`, step.text);
      case 'list': return join(step.title, ...step.items.map((it) => `${it.then}: ${it.now}`));
      case 'derive': {
        const l = beat.line;
        const nb = beat.last && step.notebook ? [`Notebook: ${step.notebook.title}`, step.notebook.text] : [];
        return l.say ? join(l.say, ...nb) : join(`\\(${l.math}\\)`, l.why, ...nb);
      }
      case 'widget': return '';
      case 'problem': return join(step.prompt);
      case 'application': return join(`${step.field}: ${step.title}`, step.text, step.problem && step.problem.prompt);
      case 'check': return join('Quick check', step.prompt);
      case 'turn': return join(...(beat.first && step.title ? [step.title.replace(/\s*\(dramatised\)/i, '')] : []),
        ...beat.before.map((l) => dialogueLine(step, l)), 'Your turn');
      case 'lines': return join(...(beat.first && step.title ? [step.title.replace(/\s*\(dramatised\)/i, '')] : []),
        ...beat.lines.map((l) => dialogueLine(step, l)));
      default: return '';
    }
  }

  // ---------- player (browser only) ----------
  let current = null;       // { el, onend } for the beat being read
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // 'off' or the chosen voice's name
  function pref() {
    try { return localStorage.getItem(PREF_KEY) || 'off'; } catch (e) { return 'off'; }
  }
  function setPref(v) {
    try { localStorage.setItem(PREF_KEY, v); } catch (e) { /* ignore */ }
  }
  function deviceVoices() {
    if (!canSpeak) return [];
    return speechSynthesis.getVoices().filter((v) => /^en([-_]|$)/i.test(v.lang))
      .sort((a, b) => a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name));
  }
  const chosenVoice = () => deviceVoices().find((v) => v.name === pref());
  const enabled = () => !!chosenVoice();

  function finish() {
    if (!current) return;
    const c = current;
    current = null;
    if (c.el) c.el.classList.remove('speaking');
    if (c.onend) c.onend();
  }
  function stop() {
    if (canSpeak) speechSynthesis.cancel();
    finish();
  }

  // Read `text`, highlighting `el` while it plays; `onend` fires when it stops.
  // One utterance per sentence, because some browsers cut long utterances off
  // part-way.
  function play(text, el, onend) {
    stop();
    if (!text || !enabled()) { if (onend) onend(); return; }
    const mine = current = { el, onend };
    if (el) el.classList.add('speaking');
    const voice = chosenVoice();
    const sentences = text.match(/[^.?!…]+[.?!…"”]*\s*/g) || [text];
    sentences.forEach((s, i) => {
      const u = new SpeechSynthesisUtterance(s.trim());
      u.voice = voice;
      u.lang = voice.lang;
      if (i === sentences.length - 1) u.onend = () => { if (current === mine) finish(); };
      speechSynthesis.speak(u);
    });
  }

  // The narrator menu, hidden when the device has no English voices. `onchange`
  // runs after the choice is saved.
  function control(onchange) {
    const select = document.createElement('select');
    select.className = 'narrator-select';
    select.setAttribute('aria-label', 'Narrator');
    select.title = 'Read the lesson aloud with one of this device’s voices';
    const fill = () => {
      const chosen = pref();
      const voices = deviceVoices();
      const opt = (value, label) => {
        const o = document.createElement('option');
        o.value = value;
        o.textContent = label;
        o.selected = value === chosen;
        return o;
      };
      select.replaceChildren(opt('off', 'Narrator off'), ...voices.map((v) => opt(v.name, `${v.name} (${v.lang})`)));
      // A saved voice that this device doesn't have: switch narration off
      if (voices.length && !voices.some((v) => v.name === chosen)) { select.value = 'off'; setPref('off'); }
      select.hidden = !voices.length;
    };
    fill();
    if (canSpeak) speechSynthesis.addEventListener('voiceschanged', fill);
    select.addEventListener('change', () => { setPref(select.value); stop(); if (onchange) onchange(select.value); });
    return select;
  }

  const api = { beatText, speakable, play, stop, control, enabled, isPlaying: () => !!current };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.Narration = api;
})();
