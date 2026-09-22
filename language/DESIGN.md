# Italiano Studio — Design & Build Notes

A static, single-page web app for practising Italian: verb conjugation, noun articles, numbers and sentence building, with spaced repetition and a browsable reference of every word. All language content lives in one JSON file; the app code contains no vocabulary.

- **Live path:** `/language/` (homepage card in `/artifacts.json`)
- **Stack:** plain HTML + CSS + vanilla JS (no framework, no build step, no dependencies)
- **Persistence:** browser `localStorage` (key `italiano.v1`)
- **Audio:** browser `speechSynthesis` (it-IT voice)

---

## 1. Running it

The data is loaded with `fetch('data/italian.json')`, so the folder must be served over HTTP (opening `index.html` from `file://` shows an error banner explaining this).

```bash
node server.js        # from the repo root, then open http://localhost:3000/language/
# or
python3 -m http.server 8000   # from the repo root, then /language/
```

On GitHub Pages it works as-is.

## 2. File layout

| File | Lines | Purpose |
|---|---|---|
| `index.html` | ~220 | Page shell and all CSS (design tokens, components). |
| `app.js` | ~740 | All logic in one IIFE: state, spaced repetition, filters, four exercises, tables, audio. |
| `data/italian.json` | ~2,360 | All language content and UI labels for categories (≈85 KB). |
| `DESIGN.md` | — | This document. |

---

## 3. Feature inventory

The top bar has six tabs: **Verbs · Nouns · Numbers · Sentences · Reading · Word tables**. The header also shows a running score (`correct/total`, plus a streak once it exceeds 1), an **Auto-play audio** toggle (only shown when the browser supports speech synthesis) and a **reset progress** link.

### 3.1 Verbs (conjugation)
- 30 verbs × 5 tenses × 6 persons = **900 forms**.
- **Tenses:** present, passato prossimo, imperfetto, futuro semplice, condizionale presente.
- **Filters:** *Tense* (default Present, or All) and *Person* — I (io), you (tu), he / she (lui / lei), we (noi), you all (voi), they (loro).
- **Format:** *Mixed* (random per question, default), *Choose* (four options) or *Type*.
  - *Type:* free text, accent buttons (à è é ì ò ù), Check / "I don't know". A leading pronoun is tolerated ("noi parliamo").
  - *Choose:* one correct form plus three distractors — the same verb and tense in other persons, topped up from other tenses when a form repeats (e.g. *essere* io = loro = "sono"). Keys 1–4 select.
- **Passato prossimo with *essere*** is stored as `sono andato/a`, `siamo andati/e`; the grader accepts either gender.
- **Accent tolerance:** an answer that is right except for accents (e.g. "e" for *è*) counts as correct with a "Mind the accent" note.
- **Feedback:** verdict, the answer with its pronoun, a one-line description of the tense, the full six-person table (asked row highlighted), and an example sentence (present tense only) with a 🔊 button.
- Irregular verbs (15 of 30) are flagged in the prompt.

### 3.2 Nouns (articles)
- 85 nouns: 67 everyday + 18 bathroom (*bagno, doccia, lavandino, asciugamano, carta igienica, asciugacapelli …*).
- Multiple choice, randomly **definite** (il / lo / la / l') or **indefinite** (un / uno / una / un'). Keys 1–4 select.
- Feedback shows the singular and plural with articles (`il libro · i libri`), the gender and the rule that applies (e.g. "Masculine nouns starting with z, s + consonant, gn, ps or pn take *lo*").
- Filter: *Topic* (Everyday / Bathroom).

### 3.3 Numbers
- 28 numbers: 1–20, then 30, 40 … 90, 100.
- Randomly either **type the word** for a digit or **pick the digit** for an Italian word (four nearest-value options). Hints for the *-dici*, *dici-* and *-anta* patterns.

### 3.4 Sentences (word-order builder)
- 149 items: 16 questions + 133 sentences. The English prompt is shown and the user taps shuffled Italian word tiles into order; **Check** is enabled once all tiles are placed; **Clear** and **Show answer** available.
- Word-order variants are accepted where the JSON lists them (e.g. *Domani devo lavorare* / *Devo lavorare domani*).
- **Three independent labels per sentence**, each with its own filter row (counts shown; combinations with no items are greyed out):
  - **Type** — Statement, Negative, Question, Request / command.
  - **Topic** — Everyday, Ordering food, Directions.
  - **Function** — Ability / permission, Necessity / need, Desire / wish, Used to / was, Future plans, Likes / preferences (optional; most older sentences have none).
- The prompt eyebrow shows the labels (`Translate · Negative · Ordering food · Ability / permission`); feedback adds a short grammar note for the function and, for questions, a sample reply.

### 3.5 Reading (real-text tile translation)
- 14 short readings (46 sentences total), sourced from Italian Wikipedia lead paragraphs (`data/italian.json` → `readings`), each a `{id, title, source: {title, url}, license, sentences: [{id, it, en, rank}]}`.
- Reuses the same word-tile mechanic as Sentences (tap the target-language words into order; Check / Clear / Show answer), one sentence at a time, walked through a reading in order via `rank` (global across all readings) before the SRS starts resurfacing due items.
- **Direction setting** (pill row, persisted in `state.settings.reading.direction`, same mechanism as the Verbs format setting): *Italian → English* (default — Italian sentence shown with a 🔊 button, tap English words into order) or *English → Italian* (English shown, tap Italian words into order, the original behaviour).
- Unlike the rest of the app, vocabulary here is **not** limited to what's taught elsewhere — this is real encyclopedic Italian, lightly trimmed for sentence length (long compound/subordinate clauses shortened or split; parenthetical IPA/citations and huge grouped numbers dropped) but not paraphrased otherwise.
- Feedback includes a "Source: Wikipedia — `<article>` (CC BY-SA 4.0)" attribution line linking to the original article, since the Italian text is reused verbatim/near-verbatim under Wikipedia's license.
- SRS ids: `r:<readingId>-<sentenceIndex>` (e.g. `r:colosseo-0`). No filters yet (topic/type tagging could be added later, same pattern as Sentences).
- There is **no "Simple Italian" Wikipedia** (unlike Simple English); readings are pulled from the regular `it.wikipedia.org` and curated down to short, complete, tile-able sentences.

### 3.6 Word tables (reference)
Sub-tabs: **Verbs · Nouns · Adjectives · Numbers · Questions · Sentences**.
- Search box (case- and accent-insensitive, also matches topic/type/function labels) with an "x of y" counter.
- *Verbs* has a tense picker; irregular verbs are blue; a *Mastered* column shows progress (`n/6`) for the chosen tense.
- Most tables show a per-row **status** pill (New / Learning / Mastered) drawn from the user's spaced-repetition data.
- 🔊 buttons on Italian cells; wide horizontal scroll container for the 12-column verb table.

### 3.7 Cross-cutting behaviour
- **Progress** persists per item across sessions; **reset progress** keeps the user's chosen tab, filters and settings.
- **Stats bar** (New / Learning / Mastered / Due) reflects the currently filtered pool.
- **Keyboard:** Enter checks / advances, 1–4 choose an option; focus moves to the Next button after each answer.
- **Audio:** 🔊 buttons speak Italian text; the optional auto-play toggle speaks each correct answer.

---

## 4. Data model (`data/italian.json`)

Top-level keys:

| Key | Contents |
|---|---|
| `language`, `name` | `"it"`, `"Italian"` |
| `persons` | `["io","tu","lui","noi","voi","loro"]` (order used everywhere) |
| `personOptions` | `{id, label, en}` — filter labels and English gloss |
| `tenseOptions` | `{id, label, title, description}` — chip label, eyebrow title, feedback note |
| `topics`, `sentenceTypes`, `functions` | `{id, label[, description]}` — category labels |
| `verbs`, `nouns`, `adjectives`, `numbers`, `questions`, `sentences` | the content (below) |

```jsonc
// verb
{ "id": "andare", "en": "to go", "rank": 5, "auxiliary": "essere", "participle": "andato", "irregular": true,
  "tenses": {
    "present":          { "io": "vado", "tu": "vai", "lui": "va", "noi": "andiamo", "voi": "andate", "loro": "vanno" },
    "passato_prossimo": { "io": "sono andato/a", "tu": "sei andato/a", "lui": "è andato/a", "noi": "siamo andati/e", ... },
    "imperfetto": {...}, "futuro": {...}, "condizionale": {...}
  },
  "examples": [{ "tense": "present", "it": "Vado a scuola in treno.", "en": "I go to school by train." }] }

// noun
{ "id": "libro", "en": "book", "rank": 34, "topic": "everyday", "gender": "m", "art": "il", "plural": "libri" }

// adjective (defined in data; no exercise uses it yet)
{ "id": "buono", "en": "good", "rank": 1, "forms": { "ms": "buono", "fs": "buona", "mp": "buoni", "fp": "buone" } }

// number
{ "value": 14, "it": "quattordici", "rank": 14 }

// sentence  (questions use the same fields plus "word" and "answers": [{it, en}])
{ "id": "s76", "rank": 26, "topic": "everyday", "type": "negative", "function": "ability",
  "it": "Non posso venire domani.", "en": "I can't come tomorrow.", "accepted": [] }
```

### Data design decisions
- **Everything is explicit.** Conjugation tables, articles, plurals and adjective forms are stored in full instead of being computed by rules, so irregular forms can never break the grader.
- **`rank`** is a frequency/teaching order used to introduce new items. It is per-topic for nouns and sentences (ties are broken randomly so "All" interleaves topics). Table "#" columns are simple row numbers, not ranks.
- **Stable ids.** Sentence ids (`s1…s133`) are never renumbered; new content is appended so saved progress stays valid.
- **`accepted`** holds word-order variants only (same set of words).
- **Categories are data-driven.** Labels and descriptions live in the JSON lists; adding a topic, type or function needs no code change beyond tagging items.

### Content inventory
| Type | Count | Notes |
|---|---|---|
| Verbs | 30 | 15 irregular; 900 conjugated forms |
| Nouns | 85 | 67 everyday, 18 bathroom |
| Adjectives | 20 | four forms each (not yet exercised) |
| Numbers | 28 | 1–20, tens to 100 |
| Questions | 16 | with sample replies |
| Sentences | 133 | 68 everyday, 39 ordering food, 26 directions |
| Readings | 14 (46 sentences) | Wikipedia lead-paragraph excerpts, curated; CC BY-SA 4.0, attributed in-app |

---

## 5. Architecture

`app.js` is one IIFE organised into commented sections, top to bottom:

1. **Helpers** — `h()` (tiny DOM builder; sets text via `append`, never `innerHTML`), `norm`, `stripAccents`, `shuffle`, `withArticle`.
2. **Persistence** — `defaults / load / save` (all storage access wrapped in try/catch).
3. **Spaced repetition** — `record`, `pickNext`.
4. **Filters and settings** — `FILTER_KEYS`, `DEFAULT_FILTERS`, `SETTINGS`, `matchesFilters`, `poolFor`.
5. **Item pools** — the `MODES` registry: each mode has `label`, `desc`, `build()` (items from data) and `render(item, ctx)`.
6. **Audio** — `speak`, `speakBtn`, `autoSpeak`.
7. **Shared UI** — `feedbackBox`, `nextButton`, `afterAnswer`.
8. **Exercises** — `renderVerb`, `renderNoun`, `renderNumber`, `renderSentence`.
9. **Word tables** — declarative `TABLES` specs (`head`, `note`, `rows()`) and one generic `renderTables`.
10. **Chrome** — `renderScore`, `renderStats`, `renderTabs`, `renderFilters`, `show`, `ask`, `init`.

**Adding an exercise** means adding a `MODES` entry (build + render) and, optionally, a `FILTER_KEYS`/`SETTINGS` entry and a `TABLES` entry. `pickNext`, stats, filters, scoring and persistence come for free.

**Render flow:** `show()` draws tabs and filters, then either `renderTables()` or `ask()`. `ask()` picks an item with `pickNext`, then calls the mode's `render(item, ctx)`, where `ctx.grade(ok)` records the result (once) and `ctx.next` asks again.

### Item ids (the SRS keys)
`v:<verb>:<tense>:<person>` · `n:<noun>` · `#:<value>` · `q:<id>` · `s:<id>`.
The answer format (Choose vs Type) is deliberately not part of the id.

### Persisted state (`localStorage["italiano.v1"]`)
```js
{ srs: { [itemId]: { box, due, seen, right } },
  correct, total, streak,           // scoreboard
  mode, table, tableTense,          // last-used tab / table / verb-table tense
  filters: { [mode]: { tense?, person?, topic?, type?, function? } },
  settings: { verbs: { format } },
  autoplay }
```
Loading merges over `defaults()` so older saves keep working when new fields are added.

---

## 6. Learning design

### Spaced repetition (Leitner boxes)
- Box 0–5 with review intervals `[0, 1, 3, 7, 14, 30]` days.
- Correct → next box, due after that box's interval. Wrong → box 0, due immediately.
- **Mastered** = box ≥ 3. **Learning** = seen but below that. **New** = never seen. **Due** = `due <= now`.

### Choosing the next item (`pickNext`)
1. Take the filtered pool and exclude the last 3 items shown (cleared whenever a filter or setting changes).
2. Split into *due* and *fresh* (never seen).
3. Pick from **due** if there are ≥ 5 of them, or if there are no fresh items, or 70% of the time otherwise; due items are sorted by weakest box then oldest due, and one of the top three is chosen at random.
4. Otherwise introduce the **fresh item with the lowest `rank`** (random among ties) — so vocabulary is introduced in frequency order.
5. If nothing is due or fresh, practise the soonest-due item.

### Grading rules
- **Text answers:** lower-cased, NFC-normalised, curly apostrophes normalised, whitespace collapsed. Accent-only mistakes are accepted with a note. `x/y` forms accept both variants.
- **Sentence tiles:** the first word is lower-cased so capitalisation gives nothing away; trailing `. ? !` is stripped; comparison is normalised.
- Showing the answer or "I don't know" counts as wrong and resets the item to box 0.

### Pedagogy choices
- Mixed formats: recognition (choose) and recall (type) alternate by default.
- Every answer, right or wrong, shows the whole paradigm (verb table, plural + rule, sentence translation) so each attempt teaches something.
- Sentence categories (type / topic / function) let a learner drill a specific situation, such as "Ordering food" or "Necessity".

---

## 7. Visual & interaction design

- **Theme:** dark, matching the rest of the site and the sibling Math Studio. Tokens in `:root`: background `#000`, cards `#111213`, accent `#4a9eff`, good `#35c97f` on `#10281c`, bad `#ff6b6b` on `#2c1414`, text `#e0e0e0 / #aaa / #888`.
- **Type:** Space Grotesk (Google Fonts); prompts 2rem/700, eyebrows small-caps-style uppercase labels.
- **Layout:** centred column (max 760 px) for exercises; widened to 1240 px for tables. Under 520 px the option grid drops to two columns.
- **Components:** mode tabs, pill buttons (filters, sub-tabs, settings), stat chips, exercise card, option buttons (with number hints), word tiles + answer zone, feedback box (green/red), conjugation table, status pills, accent-key row, 🔊 speak buttons.
- **Feedback states:** correct/wrong colouring on option buttons and the answer zone; disabled and greyed pills for empty filter combinations.
- **Accessibility touches:** real `<button>`s and `<input>`s, `aria-label`s on inputs/speak buttons, `aria-live="polite"` on the exercise pane, keyboard-first flow (focus moves to Next). Colour is never the only signal (verdict text accompanies it).

---

## 8. Testing & verification (as done during development)

No test files are committed. Each change was verified with temporary iframe-driven pages run in headless Chrome (`google-chrome --headless=new --dump-dom`, served from the repo root) that:
- answered every item in a mode correctly (all 900 verb forms in Choose mode, all 28 numbers in both directions, all 149 sentences by tapping tiles);
- checked filter counts against the JSON, disabled combinations, persistence across reload, wrong-answer paths, accent tolerance and keyboard input;
- checked the tables (row/column counts, search, per-tense views).

Data was validated with scripts that check: 42 reference conjugations, article ↔ initial-letter rules, `lo` triggers, gender ↔ article, that `question`/`negative` labels agree with the sentence text, unique sentence text, valid category ids, and that `accepted` variants use the same words.

---

## 9. Known limitations

- Examples exist only for the **present** tense; other tenses show the table and a tense note.
- **Adjectives** are in the data and tables but have no exercise yet.
- The passato prossimo of *essere* verbs uses the `o/a`, `i/e` shorthand rather than separate masculine/feminine rows.
- Speech quality depends on the user's OS/browser voices; some systems have no Italian voice.
- Progress lives only in one browser (no export, sync or accounts).
- The data-generation script and test pages were not kept in the repo; the JSON is now edited by hand.
- **Reading is a small pilot** (14 readings / 46 sentences, hand-curated and hand-translated from Wikipedia, not build-generated). No filters, no word-order `accepted` variants, and no topic tagging yet. If it's worth keeping, growing it (more articles, per-reading topic tags, an LLM-assisted curate+translate pipeline) is future work rather than done.
- No subjunctive, imperative, reflexive verbs, object pronouns or prepositions yet — so "I wish I were…" style sentences can't be taught.

---

## 10. Possible future enhancements

### Content
- **More tenses and moods:** imperativo, congiuntivo presente/imperfetto (needed for real "wishes"), trapassato prossimo, gerundio, and reflexive verbs (*chiamarsi, alzarsi*).
- **Bigger vocabulary:** top 500 → 1,000 verbs/nouns/adjectives; more topics (travel, shopping, health, work, family, weather, hotel, transport, emergencies), and a `level` field (A1/A2/B1) so learners can pick a path.
- **More number work:** 21–99 with the vowel-dropping rule (*ventuno, ventotto*), hundreds and thousands, prices, dates, telling time, ordinals.
- **Example sentences for every tense**, generated per verb and checked.
- **Function words:** prepositions and articulated prepositions (*a + il = al*), possessives, demonstratives, object and reflexive pronouns, *ci / ne*.
- **Cultural notes** attached to items (formal *Lei* vs informal *tu*, café ordering etiquette).

### New exercise types
- **Adjective agreement** (data already exists): pick/type the right form for a noun, plus adjective position.
- **Plural formation** (type the plural) and **gender guessing** with ending-based hints.
- **Cloze / fill-in-the-blank** sentences using the verb tables; **spot the error**; **sentence transformation** (present → past, statement → question).
- **Listening:** dictation (hear → type) and listen-and-choose the meaning.
- **Speaking:** pronunciation checking with the browser `SpeechRecognition` API, comparing the transcript to the target.
- **Matching game** (Italian ↔ English) and a timed **speed round**.
- **Translation typing** with accepted-variant lists (also ignoring dropped subject pronouns), plus **distractor tiles** in the sentence builder for extra difficulty.
- **Dialogues:** short multi-turn conversations with listen, fill-the-blank and reply-choosing exercises (see below).

### Conversations and audio
- **Pre-generated dialogues:** a build-time script asks the Claude API for dialogues in the app's JSON shape (speakers, lines, English, vocabulary used), validates them against the word lists, and writes them to `data/`. Doing it at build time keeps the API key off the client and the site static.
- **Better voices without a server:** pre-generate mp3s with a cloud TTS (OpenAI, Google, Azure, ElevenLabs) and commit them, or run a browser model — `kokoro-js` or `@mintplex-labs/piper-tts-web` (both are believed to offer Italian voices; check before adopting). Keep `speechSynthesis` as the fallback.
- **Slow / normal speed toggle** and per-voice selection (male/female).

### Learning science and motivation
- **Per-item statistics view:** accuracy by tense, person, gender, topic; a "weak spots" practice session made from the lowest-scoring items.
- **Adaptive difficulty:** adjust Choose vs Type based on a box level (recognition first, recall once an item is comfortable).
- **Proper scheduling:** SM-2 / FSRS instead of fixed boxes; an interval that grows with ease; a daily review cap and "reviews due today" count.
- **Sessions and goals:** timed or N-question sessions with a summary, daily goal, streak calendar, and level/XP.
- **Unlock paths:** require mastery of the top N words before releasing the next group.
- **Hints:** first-letter hint → full answer, with hints lowering the SRS credit.
- **Confusable-pair drilling** (*essere/stare*, *avere/essere* auxiliaries, *piace/piacciono*).

### UX and product
- **Progress export / import** (JSON download) and optional sync (e.g. a small backend or a gist) so progress survives clearing the browser and moves between devices.
- **Multi-select filters** (e.g. io + tu only) and remembering filters per mode; a "custom deck" builder from the tables (star words to study).
- **Tables:** column sorting, a topic/function filter, print/CSV export, and flashcard mode straight from a table row.
- **Installable PWA:** service worker for offline use, an app icon and a manifest.
- **Theme and accessibility:** light theme, font-size control, reduced-motion support, better screen-reader announcements for feedback, and an on-screen Italian keyboard for mobile.
- **Interface language switch** and UI text moved into a strings file.

### Engineering
- **Commit the tooling:** keep the data-generation and validation scripts in the repo (`language/tools/`), plus a JSON Schema for `italian.json`, and run validation in CI.
- **Automated tests:** turn the ad-hoc headless-Chrome checks into a small Playwright or Vitest suite with fixtures.
- **Split `app.js`** into ES modules (state, srs, exercises, tables, audio) once it grows further; lazy-load rarely used data.
- **Multi-language architecture:** the app is already data-driven, so a second language (Spanish, French …) mostly means a new JSON file plus per-language rules for articles, persons and tenses (`persons`, `tenseOptions` and label lists are already in the data).
- **Content pipeline:** a review workflow (LLM-drafted, native-speaker-checked) with a `reviewed` flag on items.
