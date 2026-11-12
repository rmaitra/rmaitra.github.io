# Arabic (Modern Standard Arabic)

Open with `/language/?lang=ar`. Progress is saved under `arabiya.v1`.

## Decisions

| Topic | Choice |
|---|---|
| Variety | Modern Standard Arabic |
| Romanization | Scholarly (ALA-LC style): ā ī ū, ḥ ṣ ḍ ṭ ẓ, ʿ (ʿayn), ʾ (hamza, not written at the start of a word), th kh dh sh gh. The article assimilates as it is said (ash-shams, wa-l-bayt) |
| Vowel marks | Shown everywhere by default. The header has a *Vowel marks* toggle (it re-renders the page) and a *Romanization* toggle (turning it off blurs the romanization; hover or tap to peek) |
| Endings | Pausal: nouns and adjectives have no case endings (*al-bayt kabīr*). Verbs keep their person and mood endings (*katabtu, yaktubu*), and set phrases keep theirs (*shukran, as-salāmu ʿalaykum*) |

## Files

- **`arabic.js`** (`window.ArabicText`, also `require`-able in Node):
  - `romanize(text)`: romanization generated from fully vowelled Arabic. It handles the article and sun letters, long vowels, silent alifs (*shukran*, *katabū*), the *-iyy → -ī* nisba ending, tāʾ marbūṭa (*-a*, or *-at* before a definite noun when the word is itself indefinite, as in iḍāfa) and hamza seats. A `|` in source text marks a clitic boundary and becomes a hyphen (*wa-sahlan*).
  - `fold` / `foldRoman` / `match(guess, answers, romans)`: lenient grading. Arabic answers are compared without vowel marks and with the alif and hamza spellings unified. Romanized answers are compared without macrons, dots, ʿ ʾ, hyphens, spaces or doubled letters, and the chat spellings 3, 7, 2 and 5 are accepted. A close-but-not-exact romanization is accepted and the feedback shows the exact spelling.
  - `splits(word)`: candidate splits into *wa-/fa-*, *bi-/li-/ka-*, *al-* + stem + a possessive ending, used to gloss words like وَالْبَيْت or سَيَّارَتِي.
- **`app.js`**: everything Arabic hangs off `AR` (`data.script === 'arabic'`):
  - `target(text, {tr, inline, marks})` draws Arabic right to left with its romanization.
  - The sentence builder's answer zone and tile bank are right to left.
  - Typed answers take Arabic or romanization.
  - Nouns drill *English → Arabic*, *Arabic → English* and *Plural* (no article drill).
  - The **Alphabet** tab (`ab:` SRS ids) has four drills: letters ↔ sounds, letter shapes by position (drawn with tatwīl ـ), vowel marks on random syllables, and reading real words from the vocabulary. Each drill can be filtered by letter group, g1–g5.
  - A **Letters** table shows each letter's shapes, sun/moon status and an example word.
  - Speech stays silent, and the speaker buttons are hidden, when the browser has no Arabic voice. Desktop Chrome usually has none; Edge, Safari and Android do.
- **`data/arabic.json`**: built by **`tools/build-arabic.js`**, which is the source to edit. Run `node language/tools/build-arabic.js` (add `--show` to print every romanization). The build:
  - conjugates verbs from their stems, with explicit forms for weak verbs: 8 persons (anā, anta, anti, huwa, hiya, naḥnu, antum, hum) × past, present and future (*sa-*);
  - stores `tr` only where it differs from what `romanize()` gives;
  - fails if a lesson practice id doesn't exist, or if any sentence word has no gloss.

## Content (first pass)

39 verbs, 93 nouns (topic, gender, plural, root; feminine forms for professions), 26 adjectives (4 forms each), numbers 1–100 (counting forms), 16 prepositions, 7 conjunctions, a 77-entry glossary, 114 sentences and 15 questions.

Sentences are tagged with grammar *functions*, and the feedback explains each one: nominal sentences (no "is"), adjective agreement, iḍāfa, possessive endings, *ʿinda* (having), *hunāka* (there is), verb-first word order, *urīdu*, *uḥibbu*, the *sa-* future and *yumkinu*.

Lessons: 6 alphabet lessons (Unit 1, "The alphabet"). Grammar lessons are not written yet.

## Testing

A headless smoke test (playwright-core from the npx cache + `/usr/bin/google-chrome`, not committed) plays every lesson, answers every drill under every filter and setting, opens every table in ar, it and es, and checks gloss coverage through Progress → *Check any text*.
