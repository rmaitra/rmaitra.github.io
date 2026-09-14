# Vocabulary Learning Enhancements — Implementation Plan

Goal: extend the GRE Words app beyond word/definition memorization to support five
evidence-based learning strategies:

1. Spaced Repetition
2. Contextual Integration
3. Morphological Analysis
4. Multisensory & Dual Coding
5. Active Production & Testing

## Guiding principle

`words.json` stays **pure content** — identical for every learner. Anything that
changes per-user during study (review schedule, quiz history, streaks) lives in a
separate **progress store** (`localStorage`/IndexedDB), keyed by word. This keeps
the content file small, cacheable, and free of churn from every review.

## Current state

| Field | Status |
|---|---|
| `word`, `meaning` | done (original data) |
| `etymology` | done (`add_etymology.py` / `merge_etymology.py`, sourced from kaikki.org Wiktextract) |
| `definitions` (list of `{pos, gloss}`) | done (`add_definitions.py` / `merge_definitions.py`, same kaikki source) |
| `examples` (list of strings) | done, same pipeline; archaic-typography quotes filtered out |
| Word detail modal (click row → see all fields) | done (`index.html`) |

Coverage from the kaikki stream: ~5,245/5,343 words matched; ~5,138 have
definitions; example coverage is being re-measured after the archaic-text filter
fix (see `definitions_gaps.json` for the current miss list).

## Schema additions, by pillar

### 1. Spaced Repetition

No new fields needed. Add a **separate progress store**, not part of `words.json`:

```json
// progress.json (per-user, e.g. localStorage key "gre-words-progress")
{
  "abase": {
    "interval_days": 3,
    "ease_factor": 2.3,
    "repetitions": 2,
    "next_review": "2026-09-14",
    "last_result": "correct"
  }
}
```

- Use a standard SM-2-style algorithm: correct answer → interval grows
  (1 day → 3 days → 7 days → ease-factor-scaled beyond that); incorrect → reset to
  a short interval.
- Seed initial ease/interval from a `frequency_rank` field on the word (rarer words
  start with shorter intervals / lower ease).
- Surface this as a new "Review" tab: pulls due words (`next_review <= today`) and
  runs them through the existing quiz UI, updating the progress store on each
  answer.

**Work items:**
- [ ] Add `frequency_rank` to `words.json` (from kaikki word-frequency data, same
      stream already being read — no extra download).
- [ ] `progress.js`: get/set helpers over localStorage, SM-2 scheduling function.
- [ ] New "Review" tab in `index.html` wired to the quiz-rendering code already
      present, filtered to due words.

### 2. Contextual Integration

Mostly covered by `examples`, already implemented. Extend with data that's free
from the same kaikki records (not yet pulled):

```json
"context": {
  "synonyms": ["degrade", "humiliate", "demean"],
  "antonyms": ["exalt", "elevate"]
}
```

**Work items:**
- [ ] Extend `add_definitions.py` to also pull `synonyms` / `antonyms` /
      `related` / `derived` arrays already present in the kaikki record — same
      stream, no extra cost.
- [ ] Extend `merge_definitions.py` to write `context.synonyms` / `context.antonyms`.
- [ ] Modal: add a "Related words" section when present.

### 3. Morphological Analysis

No clean bulk dataset for this; the `etymology` text already fetched is the best
source (it usually names the parts, e.g. "from ab- + base"). Requires judgment, so
this is an LLM-assisted batch job rather than a pure script.

```json
"morphology": {
  "prefix": {"text": "a-", "meaning": "to, toward", "origin": "Latin ad-"},
  "root": {"text": "base", "meaning": "low, bottom", "origin": "Latin bassus"},
  "suffix": null,
  "family": ["base", "debase", "abasement", "basement"]
}
```

**Work items:**
- [ ] Write a batch script that feeds each word's `etymology` text + `word` to an
      LLM prompt asking it to extract prefix/root/suffix (with meaning + origin
      language) and a short word-family list, output as strict JSON.
- [ ] Run in batches of ~100–200 words (5,343 total), validate JSON, spot-check a
      sample before merging.
- [ ] `merge_morphology.py` to fold results into `words.json`.
- [ ] Modal: "Word Parts" section rendering prefix/root/suffix as chips, plus
      family list as clickable links that jump to that word's modal (if present
      in the word list).

### 4. Multisensory & Dual Coding

Two parts: (a) free structured data from kaikki, (b) generated mnemonic content.

```json
"pronunciation": {
  "ipa": "/əˈbeɪs/",
  "syllables": "a-base"
},
"mnemonic": {
  "keyword": "base",
  "visual": "Picture a king forced to bow so low his crown hits the base of the floor."
}
```

**Work items:**
- [ ] Extend `add_definitions.py` to pull `sounds[].ipa` and `hyphenation` from
      the kaikki record (already streamed, zero extra cost).
- [ ] Modal: show IPA + syllable breakdown next to the word; add a small
      "🔊 speak" button using the browser's built-in `SpeechSynthesis` API
      (`new SpeechSynthesisUtterance(word)`) — no audio files/hosting needed.
- [ ] LLM batch job (can piggyback on the morphology batch) to generate a short
      keyword + visual mnemonic per word.
- [ ] Modal: "Memory Hook" section showing the mnemonic; encourage handwriting by
      adding a "practice writing it" prompt with a blank `<textarea>` (writing
      itself isn't graded — just gives a physical-writing touchpoint).

### 5. Active Production & Testing

Cloze deletion is free (derived algorithmically from `examples` you already have).
Distractors and open-ended prompts benefit from LLM generation for quality.

```json
"practice": {
  "cloze": "The general tried to ___ his rival in front of the troops.",
  "mc_distractors": ["elevate", "praise", "ignore"],
  "produce_prompts": [
    "Write a sentence about a time someone tried to abase a rival.",
    "Explain what 'abase' means to a friend in your own words."
  ]
}
```

**Work items:**
- [ ] `generate_cloze.py`: pure string substitution — for each word, find the
      first example containing it (case-insensitive, handling simple inflections)
      and blank it out. No LLM needed.
- [ ] LLM batch job to generate 2–3 higher-quality multiple-choice distractors per
      word (near-meaning but wrong) and 1–2 "produce your own sentence" prompts.
- [ ] New quiz mode: "Cloze" (fill in the blank using `practice.cloze`) alongside
      the existing word→meaning / meaning→word modes.
- [ ] New quiz mode: "Free response" — show `produce_prompts`, let the user type
      a sentence, no auto-grading (self-assessment: "did I use it correctly?"),
      logged to the progress store as an attempt for spaced-repetition purposes.

## Suggested build order

1. **Free kaikki fields** (`frequency_rank`, `synonyms`/`antonyms`, `sounds.ipa`,
   `hyphenation`) — one more pass over the already-working extraction pipeline.
2. **Cloze generation** — pure script, no LLM, immediate payoff for pillar 5.
3. **Progress store + SM-2 scheduling + Review tab** — unlocks pillar 1, uses only
   data already in `words.json`.
4. **Modal enrichment** for whatever's landed so far (synonyms/antonyms, IPA,
   speak button, cloze quiz mode).
5. **LLM batch job** for morphology + mnemonics + distractors/prompts — run in
   chunks, spot-check quality, merge incrementally so partial progress is never
   lost.
6. **Cloze / free-response quiz modes** wired into the existing quiz UI.

## Open questions to confirm before building

- Should progress state sync anywhere (account/cloud) or stay device-local via
  `localStorage`? (Affects whether we need a backend at all.)
- Is generating morphology/mnemonics for all 5,343 words worth doing up front, or
  should it happen lazily (generate + cache the first time a word is opened in
  the app)?
