# Kosmos: debrief — 2026-09-29

Where **Kosmos: A Mathematical Voyage** stands, what was decided, what's rough, and what to tackle next. For details, see [`STORIES.md`](STORIES.md) (design), [`STORY_LESSONS.md`](STORY_LESSONS.md) (all 55 lessons with sources) and [`ROADMAP.md`](ROADMAP.md) (practice subjects and the women-in-stories plan).

---

## 1. Where we are

Kosmos teaches mathematics and physics through the people who worked them out. You move through a timeline from Babylon to NASA; each lesson puts you in a real time and place, has you solve the problem they faced, then shows where the idea is used today. The existing Algebra and Arithmetic practice sit alongside it as tabs.

**Built and working**

| Area | State |
|---|---|
| **Lessons** | 2 of 55: **8 *Measuring the Earth*** (Eratosthenes, c. 240 BCE) and **16 *Restoring and balancing*** (al-Khwarizmi, c. 820). The other 53 show on the timeline, greyed out as planned. |
| **Timeline home** | "Ready now" strip, *By time* (6 Acts) and *By strand* (incl. Physics) views, progress per lesson. |
| **Lesson player** | One step per Next. New steps scroll to reading height (about ⅓ down the screen). It resumes where you left off. Next waits for anything unfinished. Nothing is scored. |
| **Step types** | scene, picture, person, quote, then/now, check, problem (hints, targeted wrong-answer feedback, worked solution), derive, widget, dialogue with "your turn" choices, note, list, meanwhile, application, recap. |
| **Calculator** | Opt-in per problem. It has a tape of your working, *Ans*, keys for phones and "Use this answer"; it uses its own parser, not `eval`. On for 3 problems. |
| **Interactive diagrams** | `completeSquare`, `balance` (al-Khwarizmi); `sunRays`, `noonSun`, `sieve` (Eratosthenes). |
| **Pixel maps** | Natural Earth coastlines drawn as chunky pixels, with a zoom-in, a pin, historical routes (the Khurasan Road, the Nile) and the historic Aral Sea. |
| **Pixel scenes & characters** | DOS/VGA-style scenes built from a kit of 31 parts. Characters are generated from a short spec, with robe or Greek chiton and himation, a standing sprite, a sitting sprite and a front-facing portrait, and they blink and breathe. Six scenes are drawn across the two lessons. |
| **Name & About** | Renamed **Kosmos: A Mathematical Voyage** — *A finite journey through infinite ideas.* An About page covers the motivation, the *Cosmos* homage, open sources, the human–AI credits, how it's built (with diagrams) and the repository link. |
| **Checks** | `tools/check-stories.mjs` (validator), `tools/walkthrough.cjs` (plays every lesson in Chrome, including the calculator and diagrams, and checks phone width), `tools/build-map.mjs` (map data). All pass. |

**Sources:** every lesson cites primary publications plus Wikipedia and MacTutor. Quotations come from public-domain translations checked word for word against Internet Archive scans (Rosen 1831; Heath 1913 and 1921). That check caught and fixed two of my misquotations.

---

## 2. Not yet committed

Your last commit (`765f0a9`) predates most of today's work. Uncommitted:

- **New:** `math/about.html`, `math/DEBRIEF.md`
- **Changed:** `math/index.html`, `app.js`, `stories.js`, `stories.json`, `widgets.js`, `pixelart.js`, `tools/check-stories.mjs`, `tools/walkthrough.cjs`, `STORIES.md`, `STORY_LESSONS.md`, `ROADMAP.md`, and **`/artifacts.json`** (the homepage card, outside `math/`)

These cover the Eratosthenes lesson, Greek dress, the calculator, the latitude diagram, reading-height scrolling, the rename, the About page and the women-in-stories note.

**Before committing, you may want to run:**

```bash
node math/tools/check-stories.mjs
npm i --no-save playwright-core && node math/tools/walkthrough.cjs   # optional, needs Chrome
python3 -m http.server 8000                                          # then open http://localhost:8000/math/
```

---

## 3. Decisions so far

| Topic | Decision |
|---|---|
| Structure | Stories tab (default) inside the app; Algebra/Arithmetic practice stay as tabs. |
| Scoring | Nothing in Stories is scored; problems are checked only. |
| Audience | Adult self-learner; digestible. Rigorous versions possibly later. |
| Voice | Second person, present tense; the learner has a realistic role per lesson. Dialogue is marked "dramatised". |
| Sources | Primary sources plus Wikipedia/MacTutor; public-domain quotes only; "Legend or history?" notes for anecdotes. |
| Units | Units of the time inside the story (dirhams, stades); modern units in *Echoes today*. |
| Physics | Woven into the same timeline as a strand (18 physics lessons planned), not a separate course. |
| Visuals | Pixel maps (not live map tiles) plus DOS-style pixel scenes and characters, all drawn in code. Characters are not likenesses. |
| Calculator | Opt-in per problem, keeping "Use this answer". |
| Reading | New steps appear about ⅓ down the screen, with a spacer below; the Next bar stays at the bottom. |
| Name | *Kosmos: A Mathematical Voyage*; tagline *A finite journey through infinite ideas.* Storage keys unchanged so progress survives. |
| Women | Include female characters as much as possible; the fictional learner can be female; you'll research female mathematicians. |
| Git | You commit; I don't. |

---

## 4. Known gaps and rough edges

- **No female characters yet.** The generator can't draw women's dress, hair or head coverings, and both built lessons are all-male. This is the top item below.
- **Not built from the design:**
  - the Notebook tab (Notebook pages only appear in lesson recaps);
  - `proof`, `experiment` and `practice` (live generator) steps, and the `quantity` check;
  - read-aloud;
  - the journey map on the timeline.
- **Practice links:** the lessons link to Arithmetic and Algebra only. Geometry, Trigonometry, Calculus, Physics, Probability and Discrete practice don't exist yet (see `ROADMAP.md`).
- **Art polish:**
  - the himation in Eratosthenes' portrait reads a bit like a blanket;
  - the lamp glow in the al-Khwarizmi afternoon scene is a heavy dither;
  - the pictures haven't had your review in detail.
- **Content growth:** `stories.json` is 61 KB with 2 lessons. At 55 lessons it will be around 1.5 MB, so at some point it should be split into one file per lesson, loaded on demand.
- **About page:** the lesson counts and cast update themselves, but "~5,200 lines" and the collaboration bullets are hand-written.
- **Tooling:**
  - the walk-through needs `playwright-core` installed by hand;
  - link checking is ad hoc (Wikipedia rate-limits bursts), so a `tools/check-links` script would help;
  - nothing runs automatically on push.
- **Minor:** the site has no `favicon.ico` (the 404 is harmless).

---

## 5. What to tackle next (suggested order)

1. **Commit today's work** (§2).
2. **Female characters.** Add women's clothing, hair and head coverings to the generator, researched per period (Greek, Abbasid first). Then make the learner female in one of the built lessons. Small, similar in size to the Greek-dress work.
3. **Galileo (lesson 32), the first physics lesson.** It needs:
   - the `experiment` step: a simulated ramp with a water clock and noisy readings, where you find the 1 : 3 : 5 : 7 pattern;
   - the `quantity` check (units);
   - a projectile diagram;
   - a Padua/Arcetri scene kit.

   It's also a natural lesson for a female learner (Galileo's daughter Maria Celeste corresponded with him, though she was in a convent; the lesson must stay within what the sources say).
4. **Cardano (lesson 24).** The most dramatic story (the secret, the oath, the contest), and it leads into complex numbers, which link to existing Algebra practice.
5. **Split `stories.json` per lesson** before the content grows much further.
6. **Notebook tab:** collect every result learned, searchable, with "Who's who".
7. **Journey map** on the timeline home: needs coordinates for all 55 lessons.
8. **A practice subject for the stories:** Physics or Geometry first, so more lessons get *Practise this* links.
9. **Tooling:** run the validator (and optionally a link check) automatically on push.
10. **Later:** read-aloud narration, a map view of how mathematics moved, and the spaced-repetition review queue from the design.

A reasonable pace is one lesson per working session: research and source checks, writing, art-kit additions, then tests and a screenshot review.

---

## 6. Open questions for you

- After Galileo, **which lesson next**? Cardano (drama and algebra), or back to Act I in order (Babylon, Ahmes)?
- **Female learner:** which built lesson should switch first, and should we aim for roughly half of all lessons?
- **Your research list:** when it's ready, should new lessons for women be added to the 55-lesson timeline, or should some existing lessons be reframed around them (e.g. a fuller Hypatia lesson)?
- **Art review:** anything in the six scenes you'd like changed before the style is used in more lessons?
