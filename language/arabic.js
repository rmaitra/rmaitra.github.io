// Arabic script helpers: romanization, lenient answer matching, vowel-mark display and
// clitic splitting for word glosses. Loaded before app.js as window.ArabicText, and
// requirable from Node so data scripts use the same romanizer.
(function (root) {
  'use strict';

  const FATHA = 'َ';
  const DAMMA = 'ُ';
  const KASRA = 'ِ';
  const SUKUN = 'ْ';
  const SHADDA = 'ّ';
  const TAN_FATH = 'ً';
  const TAN_DAMM = 'ٌ';
  const TAN_KASR = 'ٍ';
  const DAGGER_ALEF = 'ٰ';
  const TATWEEL = 'ـ';
  const MARK_RE = /[ً-ْٰ]/;
  const MARKS_RE = /[ً-ْٰ]/g;

  // Scholarly (ALA-LC style) romanization of each consonant
  const CONS = {
    'ء': 'ʾ', 'أ': 'ʾ', 'إ': 'ʾ', 'ؤ': 'ʾ', 'ئ': 'ʾ',
    'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'ḥ', 'خ': 'kh', 'د': 'd', 'ذ': 'dh',
    'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 'ṣ', 'ض': 'ḍ', 'ط': 'ṭ', 'ظ': 'ẓ',
    'ع': 'ʿ', 'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
    'ه': 'h', 'و': 'w', 'ي': 'y',
  };
  const HAMZA = new Set(['ء', 'أ', 'إ', 'ؤ', 'ئ']);
  // The l of al- merges into these (ash-shams, not al-shams)
  const SUN = new Set(['ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ل', 'ن']);
  const PROCLITIC = { 'و': 'wa', 'ف': 'fa', 'ب': 'bi', 'ك': 'ka', 'ل': 'li' };
  const PUNCT = { '؟': '?', '،': ',', '؛': ';', '٪': '%' };
  const isAlef = (c) => c === 'ا' || c === 'ٱ';

  const hasArabic = (s) => /[؀-ۿ]/.test(s || '');

  // A word as letters, each with the marks written on it
  function units(word) {
    const out = [];
    for (const ch of word.normalize('NFC')) {
      if (ch === TATWEEL || ch === '‌' || ch === '‍') continue;
      if (MARK_RE.test(ch)) {
        if (out.length) out[out.length - 1].marks.push(ch);
        else out.push({ ch: '', marks: [ch] });
      } else {
        out.push({ ch, marks: [] });
      }
    }
    return out;
  }
  const has = (u, m) => !!u && u.marks.includes(m);
  const vowelOf = (u) => (has(u, FATHA) ? 'a' : has(u, KASRA) ? 'i' : has(u, DAMMA) ? 'u' : '');
  const tanwinOf = (u) => (has(u, TAN_FATH) ? 'an' : has(u, TAN_KASR) ? 'in' : has(u, TAN_DAMM) ? 'un' : '');
  const marked = (u) => !!(vowelOf(u) || tanwinOf(u) || has(u, SUKUN) || has(u, SHADDA));
  const isDefinite = (word) => {
    const us = units(word);
    if (us.length > 2 && isAlef(us[0].ch) && us[1].ch === 'ل') return true;
    if (us.length > 3 && PROCLITIC[us[0].ch] && isAlef(us[1].ch) && us[2].ch === 'ل') return true;
    return us.length > 2 && us[0].ch === 'ل' && has(us[0], KASRA) && us[1].ch === 'ل';
  };

  // One word (no spaces, no | markers). `nextDefinite`: the next word starts with al-,
  // so a final tāʾ marbūṭa on an indefinite word is read -at (sayyārat al-muʿallim).
  function romanizeSegment(word, nextDefinite) {
    const us = units(word);
    let out = '';
    let i = 0;
    let start = 0; // index of the first letter after al- (a hamza there isn't written)
    let skipShadda = -1;
    const lengthen = (long) => {
      const short = { ā: 'a', ī: 'i', ū: 'u' }[long];
      if (out.endsWith(short)) out = out.slice(0, -1);
      out += long;
    };
    // The definite article; us[at] is its lām
    const article = (at, lead) => {
      const next = us[at + 1];
      if (SUN.has(next.ch) && has(next, SHADDA)) {
        out += lead + CONS[next.ch] + '-';
        skipShadda = at + 1;
      } else {
        out += lead + 'l-';
      }
      i = start = at + 1;
    };
    const plainLam = (u) => u && u.ch === 'ل' && !vowelOf(u) && !has(u, SHADDA);
    const definite = isDefinite(word);
    if (us.length > 2 && isAlef(us[0].ch) && !has(us[0], KASRA) && !has(us[0], DAMMA) && plainLam(us[1])) {
      article(1, 'a');
    } else if (us.length > 3 && PROCLITIC[us[0].ch] && vowelOf(us[0]) && isAlef(us[1].ch) && plainLam(us[2])) {
      out += PROCLITIC[us[0].ch] + '-';
      article(2, '');
    } else if (us.length > 2 && us[0].ch === 'ل' && has(us[0], KASRA) && plainLam(us[1])) {
      out += 'li-';
      article(1, '');
    }

    for (; i < us.length; i++) {
      const u = us[i];
      const c = u.ch;
      const prev = us[i - 1];
      const last = i === us.length - 1;
      if (!c) { out += vowelOf(u) + tanwinOf(u); continue; }
      if (PUNCT[c]) { out += PUNCT[c]; continue; }
      if (c >= '٠' && c <= '٩') { out += String(c.charCodeAt(0) - 0x660); continue; }
      if (isAlef(c)) {
        if (i === start) { out += vowelOf(u) || 'a'; continue; } // word-initial alif (wasl): ism, ithnān
        if (last && prev && tanwinOf(prev) === 'an') continue; // shukran: the alif after -an is silent
        if (last && prev && prev.ch === 'و' && !vowelOf(prev)) continue; // katabū, mashaw
        lengthen('ā');
        if (tanwinOf(u)) out += 'n';
        continue;
      }
      if (c === 'آ') { out += (i === start ? '' : 'ʾ') + 'ā'; continue; }
      if (c === 'ى') { lengthen('ā'); if (tanwinOf(u)) out += 'n'; continue; }
      if (c === 'ة') {
        const v = vowelOf(u) || tanwinOf(u);
        const pre = /[aā]$/.test(out) ? '' : 'a';
        if (v) out += pre + 't' + v;
        else if (last && nextDefinite && !definite) out += pre + 't';
        else out += pre;
        continue;
      }
      // Long vowels: ḍamma + wāw = ū, kasra + yāʾ = ī
      if ((c === 'و' || c === 'ي') && !marked(u)) {
        if (out.endsWith(c === 'و' ? 'u' : 'i')) { lengthen(c === 'و' ? 'ū' : 'ī'); continue; }
      }
      // Word-final -iyy (nisba) is read -ī in pause: ʿarabī
      if (c === 'ي' && last && has(u, SHADDA) && !vowelOf(u) && !tanwinOf(u) && out.endsWith('i')) { lengthen('ī'); continue; }
      const t = CONS[c];
      if (t === undefined) { out += c; continue; }
      if (!(HAMZA.has(c) && i === start)) {
        out += t;
        if (has(u, SHADDA) && i !== skipShadda) out += t;
      }
      const v = vowelOf(u);
      out += v + tanwinOf(u);
      if (has(u, DAGGER_ALEF)) lengthen('ā');
      else if (HAMZA.has(c) && i === start && !v) out += c === 'إ' ? 'i' : 'a';
    }
    return out;
  }

  // Romanize a text. Authors may put | at a clitic boundary in source data (وَ|سَهْلًا):
  // it becomes a hyphen (wa-sahlan) and is never shown in Arabic (see clean()).
  function romanize(text) {
    if (!text) return '';
    const parts = String(text).split(/(\s+)/);
    return parts.map((part, k) => {
      if (/^\s*$/.test(part) || !hasArabic(part)) return part;
      const next = parts.slice(k + 1).find((p) => !/^\s*$/.test(p)) || '';
      const nextDefinite = isDefinite(next.replace(/\|/g, ''));
      // Letters and vowel marks only; punctuation such as ، ؟ stays outside the word
      const lead = part.match(/^[^ؠ-ٰٟ-ۓ|]*/)[0];
      const trail = part.slice(lead.length).match(/[^ؠ-ٰٟ-ۓ|]*$/)[0];
      const core = part.slice(lead.length, part.length - trail.length);
      const segs = core.split('|');
      return lead + segs.map((s, j) => romanizeSegment(s, j === segs.length - 1 && nextDefinite)).join('-') + trail;
    }).join('').replace(/[؟،؛٪]/g, (m) => PUNCT[m]).replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660));
  }

  const clean = (text) => String(text || '').replace(/\|/g, '');
  const stripMarks = (text) => String(text || '').replace(MARKS_RE, '');

  // Lenient Arabic comparison: no vowel marks, one alif, ة = ه, ى = ي, any hamza seat
  function fold(text) {
    return String(text || '').normalize('NFC').replace(MARKS_RE, '').replace(/[ـ‌‍|]/g, '')
      .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[ؤئ]/g, 'ء')
      .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660))
      .replace(/[؟،؛.,!?:;"«»()]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  // Lenient romanization comparison: no macrons or dots, no ʿ ʾ or hyphens, no spaces,
  // doubled letters single (kitaab = kitāb), and the common chat spellings 3, 2, 7, 5
  function foldRoman(text) {
    return String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      .replace(/(?<=[a-z])7|7(?=[a-z])/g, 'h').replace(/(?<=[a-z])5|5(?=[a-z])/g, 'kh')
      .replace(/(?<=[a-z])[23]|[23](?=[a-z])/g, '')
      .replace(/[ʿʾʻʼ'’‘`´\-.,!?;:]/g, '').replace(/\s+/g, '')
      .replace(/([a-z])\1+/g, '$1');
  }
  const exactRoman = (s) => String(s || '').normalize('NFC').toLowerCase().replace(/[’‘`´']/g, 'ʾ').replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim();

  // Is a typed answer (Arabic, with or without vowel marks, or romanized) one of the answers?
  // `answers` are Arabic texts; `romans` their romanizations (romanized from Arabic if omitted).
  function match(guess, answers, romans) {
    const g = String(guess || '').trim();
    if (!g) return { ok: false };
    if (hasArabic(g)) return { ok: answers.some((a) => fold(a) === fold(g)) };
    const trs = (romans && romans.length ? romans : answers.map(romanize)).filter(Boolean);
    if (trs.some((t) => exactRoman(t) === exactRoman(g))) return { ok: true };
    const hit = trs.find((t) => foldRoman(t) === foldRoman(g));
    return hit ? { ok: true, close: hit } : { ok: false };
  }

  // Ways to split a word into proclitics + stem + suffix, fewest pieces first, for glossing
  // words like وَالْبَيْت (wa- + al- + bayt) or سَيَّارَتِي (sayyāra + -ī). Works on folded text.
  const PRE1 = [['و', 'wa-', 'and'], ['ف', 'fa-', 'so / and']];
  const PRE2 = [['ب', 'bi-', 'with / by / in'], ['ل', 'li-', 'for / to'], ['ك', 'ka-', 'like']];
  const SUFFIX = [['ي', '-ī', 'my / me'], ['ني', '-nī', 'me'], ['ك', '-ka / -ki', 'your / you'], ['ه', '-hu', 'his / him / its'],
    ['ها', '-hā', 'her / it'], ['نا', '-nā', 'our / us'], ['كم', '-kum', 'your (pl.) / you all'], ['هم', '-hum', 'their / them']];
  function splits(word) {
    const f = fold(word);
    const out = [];
    for (const p1 of [null, ...PRE1]) {
      const a = p1 ? (f.startsWith(p1[0]) ? f.slice(1) : null) : f;
      if (a === null) continue;
      for (const p2 of [null, ...PRE2]) {
        const b = p2 ? (a.startsWith(p2[0]) ? a.slice(1) : null) : a;
        if (b === null) continue;
        const arts = [[b, false]];
        if (b.startsWith('ال')) arts.push([b.slice(2), true]);
        if (p2 && p2[0] === 'ل' && b.startsWith('ل')) arts.push([b.slice(1), true]); // li + al- = lil-
        for (const [c, art] of arts) {
          for (const s of [null, ...SUFFIX]) {
            if (s && (art || !c.endsWith(s[0]))) continue;
            let stem = s ? c.slice(0, -s[0].length) : c;
            const stems = [stem];
            if (s && stem.endsWith('ت')) stems.push(stem.slice(0, -1) + 'ه'); // sayyārat-ī → sayyāra
            if (!s && !art && stem.endsWith('ا')) stems.push(stem.slice(0, -1)); // mashghūlan → mashghūl
            for (stem of stems) {
              if (stem.length < 2) continue;
              const pre = [p1, p2].filter(Boolean).map(([, form, en]) => ({ form, en }));
              if (art) pre.push({ form: 'al-', en: 'the' });
              const pieces = pre.length + (s ? 1 : 0) + (stem !== c && !s ? 1 : 0);
              if (pieces) out.push({ stem, pre, suf: s ? { form: s[1], en: s[2] } : null, pieces });
            }
          }
        }
      }
    }
    return out.sort((x, y) => x.pieces - y.pieces);
  }

  const api = { romanize, clean, stripMarks, fold, foldRoman, match, splits, hasArabic, units, SUN };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ArabicText = api;
})(typeof window !== 'undefined' ? window : this);
