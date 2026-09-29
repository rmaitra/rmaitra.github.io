# Math Studio — Stories (design proposal)

A new **Stories** tab: guided lessons that teach each topic by following the people who worked it out. The learner moves through history from Babylonian clay tablets to NASA. At each stop they meet the problem people actually faced, solve it with the original numbers, see the idea proved, and then see where the same maths is used today, in engineering and in daily life.

**Physics is woven into the same timeline**, not kept as a separate course. The two grew up together: Archimedes' lever, Galileo's ramps, Newton's gravity, Maxwell's light and Einstein's clocks each needed a piece of maths, and each gave that maths its most convincing use. A physics lesson pairs a physical law with the maths it needs, re-runs the real experiment, and links back to the lesson where that maths was taught.

It reuses the lesson engine from Italiano Studio (`language/`): one beat per **Next**, the page building downward, quick checks, dialogue with a "Your turn" pass, resume, a recap, and lessons that feed the drills. It adds what maths needs: problems that are actually checked, step-by-step derivations and proofs, interactive figures, and a timeline.

Status: **in progress.** Lesson 16, *Restoring and balancing* (al-Khwarizmi), is built and is the Stories tab's first lesson. The other 54 lessons show on the timeline, greyed out as planned. Decided so far: Stories is the default tab; nothing in Stories is scored; the learner is an adult self-learner; the role changes each lesson; diagrams are drawn in code; there is no read-aloud yet; units in a story are the ones used at the time (dirhams, cubits), and modern units in *Echoes today*.

---

## 1. What the learner experiences

### 1.1 The Stories home: a timeline

```
┌─ Stories ───────────────────────── [ By time | By strand ] ─┐
│                                                              │
│  ACT I · ANCIENT WORLDS                    3000 BCE – 500 CE │
│  │                                                           │
│  ●─ c.1800 BCE  Babylon       Counting in sixties      ✓     │
│  │              Number · roots                               │
│  ●─ c.1550 BCE  Thebes        The scribe Ahmes         ▰▰▱   │
│  │              Number · fractions                           │
│  ○─ c.600 BCE   Miletus       A pyramid's shadow     Start   │
│  │              Geometry · ratio                             │
│  ...                                                         │
│  ACT II · THE HOUSE OF WISDOM                   500 – 1400   │
│  ○─ 628         Bhinmal       Nothing becomes a number       │
│  ○─ c.820       Baghdad       Restoring and balancing        │
└──────────────────────────────────────────────────────────────┘
```

- **By time** (the default) is one chronological story that mixes the strands, grouped into six **Acts** (eras).
- **By strand** regroups the same lessons into threads: *Number · Geometry · Algebra · Trigonometry · Calculus · Probability & Data · Computing · Physics*. Within a strand they stay in date order, so "the story of algebra" or "the story of physics" can be read on its own. A lesson can belong to several strands: Galileo is *Physics · Algebra*, since the parabola is the maths his motion needs.
- Each lesson card shows the year, place, title, the person or people, strand chips, and status (Start / Continue ▰▰▱ / Review ✓). As in Italiano: a suggested order, **nothing locked**.
- A small "Recommended before" line (from `prereqs`) appears when a lesson leans on an earlier one, e.g. *Bombelli* recommends *Cardano*.

### 1.2 Inside a lesson: the story arc

Every lesson follows the same seven-part arc. The template is what makes it read as a story and not a textbook chapter with anecdotes added:

| # | Part | What happens | Typical blocks |
|---|---|---|---|
| 1 | **Cold open** | Date, place, who you are in this scene, and the practical problem people faced (floods, taxes, trade, astronomy, gambling). | `scene`, `text`, `person` |
| 2 | **The problem as they saw it** | The original wording, then the same thing in modern notation. | `quote`, `thenNow`, `check` |
| 3 | **Try it first** | The learner attempts it naively (guessing, measuring) before the idea is shown. Struggling first makes the insight land. In physics lessons this is **run the experiment**: take readings from a simulation of the real apparatus and look for the pattern. | `problem` (easy to try, hard to finish), `widget`, `experiment` |
| 4 | **The insight** | The key idea, shown step by step, with an interactive figure where it helps. | `derive`, `widget`, `proof`, `note` |
| 5 | **Your turn in the story** | 1–3 checked problems with the historical numbers, then a dialogue in which the learner picks the right reasoning at each step. | `problem`, `dialogue` |
| 6 | **What happened next** | Consequences, rivals, parallel discoveries elsewhere, a "Legend or history?" note, and a lead-in to the next lesson. | `text`, `note`, `meanwhile` |
| 7 | **Echoes today** | 2–3 application cards (one engineering or science, one everyday, one wildcard), each with its own problem. Then the Notebook recap and the practice links. | `application`, `recap` |

**Size:** 30–45 beats, about 10–15 minutes, like the Italian lessons.

### 1.3 Who "you" are

There is no fantasy time-travel frame. Each lesson gives the learner a plausible **role** inside the scene, written in the second person:

- an apprentice scribe at a Babylonian tablet house,
- a student copying at the Library of Alexandria,
- a copyist at the House of Wisdom in Baghdad,
- a merchant's clerk in Pisa,
- a friend reading Pascal's letters over his shoulder,
- an assistant weighing the water clock while Galileo rolls balls down a ramp,
- Joule's helper reading a thermometer to 1/200 of a degree,
- a "human computer" at NASA Langley.

The role is what makes the role-play dialogues work. You are the one who has to give the mathematician the next step.

### 1.4 The Notebook (replaces the word recap)

The recap in Italiano lists the lesson's word cards. Here, every lesson adds **Notebook pages**: the results, methods and terms it taught. For example:

> **Completing the square** — al-Khwarizmi, Baghdad, c. 820
> Halve the coefficient of *x*, square it, add it to both sides. \(x^2+10x=39 \Rightarrow (x+5)^2=64\).
> ↳ Used in: *projectile peaks, the quadratic formula, circle equations*

A new top-level **Notebook** tab (the counterpart of Word tables) collects every page learned so far. It can be searched, grouped by strand or by person, and every entry links back to its lesson. A **Who's who** sub-tab lists each person with dates, place and the lessons they appear in.

### 1.5 Links to Practice

The recap ends with **Practise this →** buttons that open the matching existing topic and problem type. For example, al-Khwarizmi links to *Algebra → Polynomial Operations → Factor Trinomials*. The lesson can also embed one **live generated problem** ("Try one like it") using the existing generators. The math app has no spaced repetition yet, so the first version uses deep links. An SRS queue is listed under later work (§8).

---

## 2. Block types

Block types carried over from `language/` (same behaviour): `heading`, `text`, `note` (callout with a label), `list`, `check` (multiple choice, ungraded; Next waits for an answer; options authored answer-first and shuffled), and `dialogue` (with an optional `practice` role-play).

New block types:

| Block | Purpose | Rendering |
|---|---|---|
| `scene` | Opens a lesson or changes location: year, place, role, one line of atmosphere. | Large year, place in small caps, and a thin timeline strip showing where this lesson sits among all the others. |
| `person` | Introduces a mathematician. | Monogram card (initials, not a portrait: for most ancient figures nobody knows what they looked like, and the card says so), dates, place, one-line bio. Stored in `people`. |
| `quote` | A primary source in translation. | Serif block quote with a citation line. Public-domain translations only (e.g. Heath's Euclid, Rosen's al-Khwarizmi). |
| `thenNow` | Old wording next to modern notation. | Two columns: *"A square and ten roots equal thirty-nine dirhams"* next to \(x^2+10x=39\). Stacked on phones. |
| `derive` | A derivation revealed one line per Next, with a short reason in the margin for each line. | KaTeX lines that line up on `=`. |
| `proof` | A proof in which some steps ask the learner for the reason. | Numbered statements. A step with `ask` shows 3 reasons to choose from (ungraded, with a `why`). A "∎" closes it. |
| `problem` | A checked problem inside the story. | Prompt, optional figure, answer fields, **Check**, a hint ladder (Hint 1 → Hint 2 → Show me), and a worked solution. Next waits until it is solved or revealed. |
| `practice` | One live problem from an existing generator. | Reuses `renderProblem()` inside the lesson, plus a *New problem* button. |
| `widget` | An interactive figure. | Named SVG widget with parameters from JSON. It can set a `goal` (e.g. "shrink the gap below 0.01") that releases Next. |
| `meanwhile` | A parallel discovery elsewhere. | Side card: "Meanwhile in China…" / "…and in Kerala". Makes sure credit goes to every culture that found the result. |
| `experiment` | A re-run of a real historical experiment (physics lessons). | A simulated apparatus built from a widget: Galileo's ramp, Joule's paddle wheel, Hooke's spring, Ohm's circuit. The learner takes readings, which have realistic noise, into a small table and then finds the law (a ratio, a square, a slope). A `source` line says what the original experiment was and where it is described. |
| `application` | An "Echoes today" card. | A `field` label (Engineering / Everyday / Computing / Medicine / Finance / Sport / Art), a title, 2–4 sentences, and an optional nested `problem`. |
| `recap` | Generated, like in Italiano. | Notebook pages from `notebook: true` blocks, application titles, sources, Practise links, Next lesson. |

### 2.1 Checking problems

In-story problems are **checked** (the learner sees right or wrong), but they **do not count toward the scoreboard**, just as the Italian lesson checks don't feed SRS. The lesson is for learning, and the scoreboard stays a measure of practice. The recap reports "4 of 5 solved without hints" for the learner's own information.

Answer checking uses what `core.js` already has:

| `check` | Uses | Example |
|---|---|---|
| `number` | tolerance compare (`tol`, default 1e-6 relative) | Earth's circumference in stadia |
| `quantity` | `number` plus a `unit` label shown after the field and a looser default tolerance (1% relative), since physical data is measured. The unit is stated, not graded, following the plan in `ROADMAP.md`. | The Moon's acceleration: 0.00272 m/s² |
| `fraction` | the fraction checker from `arithmetic_generators.js` (including the "right value, but reduce it" message) | Ahmes' loaves: \(\tfrac{7}{10}\) |
| `expr` | `checkExpressionEquiv(user, ref)` with `ref` as an expression string | "Write the area of the L-shape": `x^2+10*x` |
| `points` | `parsePoints` + `pointSetsMatch` | Kepler's foci |
| `choice` | index | "Which is larger?" |
| `complex` | real/imaginary fields, like the complex-number generators | Bombelli: \((2+i)^3\) |

Hints are authored and ordered. Wrong answers can have targeted feedback: `mistakes: [{ value: 13, say: "You added 25 but forgot to take the square root." }]`, the math version of the Italian lessons' hand-written `wrong` distractors.

### 2.2 Widgets (first set)

Widgets are plain SVG with no libraries, in a registry `WIDGETS[name](el, params, api)`. `api.done()` releases Next and `api.set(k, v)` exposes a value to the next beats. The first set covers the pilot and several later lessons:

| Widget | Shows | Reused by |
|---|---|---|
| `completeSquare` | Drag to split the 10x strip into two 5x strips and fill the missing corner. | al-Khwarizmi, quadratic formula, conics |
| `balance` | A two-pan scale: al-jabr moves a term across, al-muqābala cancels like terms. | al-Khwarizmi, Diophantus, systems |
| `polygonPi` | Inscribed and circumscribed n-gons, n doubling 6 → 96, perimeter bounds squeezing π. | Archimedes, Madhava (compare speeds) |
| `shadowAngle` | Sun rays over a curved Earth; a slider sets the shadow angle at Alexandria. | Eratosthenes, Thales, trigonometry |
| `similarTriangles` | A stick, a pyramid and two shadows; drag to scale. | Thales, map scales |
| `rodArray` | Chinese counting-rod board, red and black rods; column operations. | Nine Chapters, integers, matrices |
| `numberLine` | Fortunes and debts on a line; animated addition and subtraction. | Brahmagupta, integers |
| `growth` | Compounding n times per year; the curve approaches *e*. | Bernoulli/Euler, logs, finance |
| `plot` | A Highcharts function plot with sliders (existing chart setup). | Descartes, Kepler, Fourier, calculus |
| `lever` | A beam on a pivot; drag weights along it. | Archimedes, torque, centre of mass |
| `rays` | A ray to drag across mirrors and between materials; angles are shown live. | Hero, Ibn al-Haytham, Snell, Fermat |
| `ramp` | A ball on an adjustable ramp with a water-clock timer; also launches off the table edge. | Galileo, the Oxford Calculators, projectiles |
| `oscillator` | A pendulum or a spring; length, mass and stiffness sliders. | Huygens, Hooke, waves |
| `orbit` | A body under inverse-square gravity; set its speed and watch the ellipse. | Kepler, Newton, Katherine Johnson, rockets |
| `circuit` | A battery, resistors and a meter; series or parallel. | Ohm, Kirchhoff, the Atlantic cable |

---

### 2.3 Visuals: pixel maps, scenes and characters (built)

The visual style is chunky pixel art in the app's dark palette. Everything is drawn in code.

**Pixel map** ✅ (`pixelmap.js`), shown in a `scene` step that has a `map`:
- Natural Earth coastlines, lakes and rivers are drawn onto a low-resolution grid (one map pixel = 4 screen pixels) with no anti-aliasing, then each pixel is coloured deep water, shallow water, coast, land, river, or green land within two pixels of a river. So Mesopotamia's river valleys show up on their own.
- Pins, place dots and dashed routes are hand-drawn pixel sprites. Routes follow waypoints: the Baghdad map traces the Khurasan Road to Khwarazm instead of a straight line across the Caspian.
- A live scene zooms in from a wider view (`from`); a resumed scene, or one with reduced motion, is drawn in its final state. The pin bobs gently.
- Labels use the Silkscreen pixel font.
- The caption has a "see it today" OpenStreetMap link and a data credit.
- The map data lives in `map-data.json` (≈226 KB, loaded only when a map is shown), built by `node math/tools/build-map.mjs`. That script simplifies and compresses Natural Earth's 1:50m data, drops modern canals, and swaps today's shrunken Aral Sea for Natural Earth's historic outline.
- Coastlines and rivers are otherwise today's, and the credit says so.

```jsonc
"map": { "center": [51, 38.3], "span": 30,                 // [lon, lat]; degrees of longitude across
         "from": { "center": [30, 30], "span": 120 },      // optional zoom-in start
         "pins": [{ "at": [44.39, 33.34], "label": "Baghdad" }],
         "places": [{ "at": [59.15, 42.3], "label": "Khwarazm", "side": "left" }],
         "routes": [{ "path": [[44.39, 33.34], [48.51, 34.8], …] }],
         "labels": [{ "at": [43.1, 36.4], "text": "Tigris", "kind": "river" }],
         "caption": "…", "today": { "label": "…", "url": "https://www.openstreetmap.org/…" } }
```

**Pixel pictures and characters** ✅ (`pixelart.js`), in the style of DOS-era adventure games:
- **Scenes:**
  - A `picture` step, or a `scene` step's `picture`, is drawn at 288×120 (or `size: [192, 80]` for close-ups, which make characters about twice as prominent).
  - Gradients use ordered (Bayer) dithering.
  - It animates at 8 fps only while on screen, and stays still when reduced motion is set.
  - Scenes are composed from a **kit** of parts listed in `layers`, e.g. `{ "kit": "palm", "x": 22, "base": 78, "h": 30 }`:
    - Outdoor: `sky` (morning/afternoon/dusk/night), `stars`, `birds`, `roundCity` (brick wall, towers, gate, rooftops, and the Green Dome with its horseman statue), `palm`, `river` (reflects everything above it, with ripples), `sailboat`, `kuphar`, `reeds`.
    - Indoor: `wall` (baked brick), `window` (pointed arch showing sky and skyline), `beam` (sunlight), `floor`, `shelves` (codices in flat stacks), `rug`, `lamp` (flickers when lit), `glow`, `inkpot`.
    - New settings mean adding kit parts, not painting pictures.
- **Characters** are generated from a spec in the lesson's `characters`:
  - `{ skin, hair, beard: none|short|full|long, beardColor, headwear: turban|cap|none, headwearColor, robe, outer, sash, prop: book|scroll|none, seed }`.
  - In scenes, a `cast` entry places them `stand`ing or `sit`ting cross-legged (optionally `write`ing on a board on the knee), facing left or right, with blinking and a breathing bob.
  - A separate front-facing 24×26 **bust** is drawn for person cards (`person.character`) and speech bubbles (`speakers[x].character`).
  - The same spec always produces the same person.
- **Honesty rules:** every picture has a caption, labelled a reconstruction where it is one; period details are sourced, with links in the caption. For example, the Green Dome, its horseman statue and the kuphar boats all come from Wikipedia, and black robes come from black being the Abbasid dynastic colour. A character's `note` says it is not a likeness.
- `check-stories.mjs` validates kit names, cast and character references, and captions.

**Next (planned):**
- **More kit parts** as lessons need them: Alexandria's harbour, a Greek colonnade, a Renaissance study, a telescope, 1960s NASA desks.
- **A journey map on the timeline:** needs coordinates for all 55 lessons.

## 3. Data model: `math/stories.json`

This follows the Italiano pattern: all content is in JSON and the app contains no lesson text. Math inside text uses KaTeX `\\( … \\)` as in the existing JSON. `*term*` marks a key term (highlighted, and it links to its Notebook page once learned).

```jsonc
{
  "acts": [ { "id": "ancient", "title": "Ancient worlds", "span": "3000 BCE – 500 CE" }, … ],
  "strands": [ { "id": "algebra", "label": "Algebra", "color": "#b48cff" }, … ],
  "people": [
    { "id": "khwarizmi", "name": "Muḥammad ibn Mūsā al-Khwārizmī", "short": "al-Khwarizmi",
      "born": "c. 780", "died": "c. 850", "place": "Baghdad",
      "bio": "Scholar at the House of Wisdom; his book on al-jabr gave algebra its name.",
      "sources": ["https://mathshistory.st-andrews.ac.uk/Biographies/Al-Khwarizmi/"] }
  ],
  "lessons": [ {
    "id": "al-jabr", "order": 16, "act": "wisdom", "strands": ["algebra"],
    "year": 820, "yearLabel": "c. 820", "place": "Baghdad",
    "people": ["khwarizmi"], "role": "a young copyist at the House of Wisdom",
    "title": "Restoring and balancing", "subtitle": "al-Khwarizmi and the quadratic",
    "goals": ["Turn a problem in words into an equation", "Solve \\(x^2+bx=c\\) by completing the square"],
    "prereqs": ["nine-chapters"],
    "practiceLinks": [ { "subject": "algebra", "topic": "polynomialOperations", "type": 2 } ],
    "sources": [ { "title": "Rosen (1831), The Algebra of Mohammed ben Musa", "url": "…" } ],
    "steps": [
      { "type": "scene", "year": "c. 820", "place": "Baghdad", "text": "The House of Wisdom…" },
      { "type": "quote", "text": "One square, and ten roots of the same, are equal to thirty-nine dirhems…",
        "cite": "al-Khwarizmi, tr. Rosen (1831)" },
      { "type": "thenNow", "then": "a square and ten roots equal thirty-nine", "now": "\\(x^2 + 10x = 39\\)" },
      { "type": "problem", "id": "guess", "prompt": "Guess and check: which whole number works?",
        "fields": [{ "id": "x", "label": "x" }], "check": "number", "answer": { "x": 3 },
        "hints": ["Try \\(x=2\\): \\(4+20=24\\). Too small.", "Try \\(x=4\\): \\(16+40=56\\). Too big."],
        "mistakes": [{ "value": 4, "say": "\\(16+40=56\\), which overshoots 39." }],
        "solution": ["\\(3^2 + 10\\cdot 3 = 9 + 30 = 39\\) ✓"] },
      { "type": "widget", "name": "completeSquare", "params": { "b": 10, "c": 39 }, "goal": "filled" },
      { "type": "derive", "lines": [
        { "math": "x^2 + 10x = 39", "why": "the problem" },
        { "math": "x^2 + 10x + 25 = 64", "why": "fill the missing \\(5\\times5\\) corner" },
        { "math": "(x+5)^2 = 64", "why": "it is now a complete square" },
        { "math": "x = 3", "why": "the side is 8, so \\(x = 8 - 5\\)" } ],
        "notebook": { "title": "Completing the square", "text": "Halve the roots, square, add to both sides." } },
      { "type": "application", "field": "Everyday", "title": "A frame with an even border",
        "text": "…", "problem": { … } }
    ]
  } ]
}
```

**Persisted state:** a new key `mathStudio.stories.v1`, separate from the existing `algebraStudioScores_v1`, so scores are untouched:

```js
{ lessons: { [id]: { pos, done, solved, hinted } },
  lesson,                    // open lesson or null
  view: 'time' | 'strand',
  audio, handsFree }
```

Notebook contents are derived from finished lessons, not stored separately.

**As built**, `stories.json` splits the two roles of a lesson:
- `lessons` holds the timeline entry for all 55 lessons (`id`, `order`, `act`, `year`, `place`, `title`, `people`, `strands`, and `review` for Crossroads).
- `content[id]` holds a built lesson's `role`, `goals`, `practiceLinks`, `sources` and `steps`.

A lesson counts as built, and becomes clickable on the timeline, as soon as it has a `content` entry.

**Block types built:** `scene`, `heading`, `text`, `person`, `quote`, `thenNow`, `check`, `problem` (checks `number` and `set`, where `set` means several answers in any order; optional `unit` label), `widget` (`completeSquare`, `balance`), `derive` (with an optional `notebook` page), `note`, `list` (then/now rows), `dialogue` (the `practice` speaker's lines become choices), `meanwhile`, `application` (with a nested problem) and the generated `recap`.

**Not built yet:** `proof`, `practice` (a live generator), `experiment`, the `quantity` check, the Notebook tab and read-aloud.

---

## 4. Architecture

The math app is currently `index.html` + `core.js` + `generators.js` + `arithmetic_generators.js` + `app.js`, with global functions and JSON loaded with `fetch`. Additions:

| File | Contents |
|---|---|
| `stories.json` | Acts, strands, people, lessons (above). |
| `stories.js` | The lesson player, ported from `language/app.js` (`lessonBeats`, `renderLesson`, `renderBeat`, resume, keyboard, read-aloud), the timeline home and the Notebook tab. |
| `widgets.js` | The SVG widget registry. |
| `app.js` (small changes) | Top navigation becomes **Stories · Algebra · Arithmetic · Notebook**; Stories is the default. `renderProblem`/`checkAnswer` are reworked a little so a `practice` block can mount one inside a lesson. |

**Port or share the player?** Port it (copy and adapt). The beat and resume logic is the same, but most block types differ, and the two apps have different state shapes. If a third app appears, extract `/shared/lesson-player.js` then, with block types added as plugins. That matches the "generic engine" idea in `language/MULTILANGUAGE.md`.

**Read aloud:** optional, as in Italiano. KaTeX doesn't speak well, so math blocks take an optional `say` ("x squared plus ten x equals thirty-nine"). Without it, narration skips the formula.

---

## 5. Curriculum

The full lesson list is in **[`STORY_LESSONS.md`](STORY_LESSONS.md)**: 55 lessons in six Acts, from Babylon (c. 1800 BCE) to NASA (1962). There are 49 stories, 18 of them physics, and 6 *Crossroads* reviews. For each lesson it gives:
- the people and the topics taught (physics lessons split these into *Physics* and *Maths it uses*);
- the in-story problem;
- applications ("Echoes today");
- a legend check where one is needed;
- the Practice link;
- sources: the primary publication plus Wikipedia and MacTutor links, all checked to resolve.

| Act | Lessons | Span |
|---|---|---|
| I · Ancient worlds | 1–13 | c. 1800 BCE – 415 CE |
| II · India, the House of Wisdom and beyond | 14–23 | 499 – 1450 |
| III · Secrets and duels | 24–27 | 1500 – 1600 |
| IV · The Scientific Revolution | 28–40 | 1609 – 1760s |
| V · Energy, fields and machines | 41–49 | 1800 – 1900 |
| VI · Relativity, information and space | 50–55 | 1903 – 1962 |

**Physics practice.** Physics lessons link to the Physics subject already planned in `ROADMAP.md` (Kinematics, Forces, Work & Energy, Momentum, Circular Motion & Gravitation, Waves, Electricity), plus two new topics: **Optics** and **Relativity**. Until those are built, physics lessons carry their own checked problems and link to the Arithmetic or Algebra topic their maths uses.

---

## 6. How to write a story lesson

The equivalent of the "How to write a lesson" rules in `language/LESSONS.md`:

- **Size:** 30–45 beats, one main idea, 1–3 Notebook pages. Split a lesson that grows past that.
- **Follow the arc** in §1.2. Always start with *why people needed it*: the practical pressure (tax, flood, trade, a bet) is what gives the story its drive.
- **Use the original numbers** for the in-story problem whenever a source has them (Rhind 24, al-Khwarizmi's 39, Cardano's 20, the Nine Chapters' grain). Put the modern version next to it with `thenNow`.
- **Let the learner try before the insight.** At least one problem or widget comes before the method is revealed.
- **Show why it works, not only the steps.** At least one `derive` or `proof` per lesson. Proofs ask for the *reason* for 1–2 steps, and the distractors are common misconceptions.
- **Honest history.** Anything anecdotal (Thales' shadow, Hippasus drowned, the Eureka bath, Descartes' fly, young Gauss's sum, Galois' last night) goes in a `note` labelled **Legend or history?**, which says who first told the story and when. Use "c." for uncertain dates. Don't invent dialogue for real people and present it as fact. Dialogue lines are marked as dramatised, and any quotation must be sourced.
- **Credit parallel discoveries.** If the result was known earlier or independently elsewhere (Babylon and India for Pythagoras, China for elimination, Kerala for series, the Maya for zero), add a `meanwhile` block.
- **Three Echoes:** one engineering or science, one everyday skill, one wildcard. Each should have a small problem, and the numbers must be realistic (real mortgage rates, real dish sizes).
- **Wrong-answer feedback:** each checked problem has at least one `mistakes` entry for the most likely error.
- **Physics lessons:**
  - **Name the maths.** List the maths the law needs and link back to the lesson that taught it.
  - **Re-run the real experiment.** The `experiment` block should mirror what was actually done (Galileo's water clock, 's Gravesande's clay, Joule's paddle wheel), not a modern idealised version, and should say where it is described.
  - **Real constants.** Use SI units and real constants (g = 9.81 m/s², the Moon's real distance and period), with the unit shown on every answer field.
- **Sources:** every lesson lists 1–3 (MacTutor, a public-domain translation, a museum record for artefacts). They are shown in the recap.
- **Images:** SVG diagrams by default. Public-domain photos of artefacts (YBC 7289, the Rhind papyrus, Plimpton 322) are optional, loaded from Wikimedia Commons with an attribution line, like the Reading tab's Wikipedia credit.

---

## 7. Build plan

1. **Engine + pilot (3 lessons):** the port of the player, the new block types (including `experiment` and `quantity` checks), 5 widgets (`completeSquare`, `balance`, `shadowAngle`, `rodArray`, `ramp`), the timeline home and the Notebook tab. Pilot lessons, chosen to cover different strands, test the physics format, and link to existing Practice topics:
   - **8 Eratosthenes**: geometry and ratio, the strongest single visual.
   - **16 al-Khwarizmi** ✅ built first: algebra, balance and completing-the-square widgets.
   - **32 Galileo**: the first physics lesson; the ramp experiment, the odd-number rule and the parabola (it links to Algebra · Conic Sections).
   - Next after the pilot: **24 Cardano**, the most dramatic story, which leads into complex numbers.
2. **Validation script** ✅ `node math/tools/check-stories.mjs`. It runs every problem's own answer through the real checker in `stories.js` (the answer must pass) and each `mistakes` value (it must fail and show its message). It also checks lesson ids and orders, acts, strands, widgets, practice links, quick-check indexes, dialogue speakers and wrong options, and balanced `\( \)` and `*term*` markers.
3. **Browser walk-through** ✅ `node math/tools/walkthrough.cjs`. This needs `npm i --no-save playwright-core` and Chrome. It walks every built lesson from the timeline: it tries each mistake value, a hint, then the right answer, and answers the checks, turns and diagrams. It then checks for console and KaTeX errors, the saved done flag, resuming after a reload, the Practise link, the By strand view and a 390 px layout with no sideways scrolling.
4. **Then Act I in order**, one Act per round, adding each Act's widgets as needed.

---

## 8. Later

- **Spaced repetition for Practice** (Leitner, as in Italiano): finishing a lesson would queue its linked problem types.
- A **map view** of the timeline, showing how mathematics moved: Babylon → Alexandria → Baghdad → Pisa → Europe → everywhere.
- **"Letters" style** for dialogues based on real correspondence (Fermat–Pascal, Cardano–Tartaglia): rendered as dated letters, not chat bubbles.
- **Strand certificates**: a summary page per strand once all its lessons are done.
- Deeper **Echoes** as short case studies (how GPS uses Eratosthenes plus relativity; how JPEG uses Fourier).
- **Physics Practice subject** (from `ROADMAP.md`, plus Optics and Relativity), so physics lessons get the same Practise links as maths ones.
- A **sandbox** mode for the physics widgets (ramp, orbit, circuit, rays), free to play with outside a lesson.
- Later physics lessons beyond 1962: Bernoulli's fluids (1738), thermodynamics and engines (Carnot, 1824), the quantum (Planck 1900, Bohr 1913), and semiconductors.
