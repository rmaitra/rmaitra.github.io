# rmaitra.github.io

Small, open-source web apps by Raj Maitra, served with GitHub Pages at
**https://rmaitra.github.io**. Most are single static pages: plain HTML, CSS and
JavaScript with no build step. The homepage lists them from `artifacts.json`.

| App | Path | What it is |
|---|---|---|
| Italiano Studio | [`/language/`](language/) | Guided Italian lessons and spaced-repetition drills |
| Math Studio | [`/math/`](math/) | Practice problems for arithmetic and advanced algebra |
| GRE Words | [`/words/`](words/) | GRE word list with definitions, etymologies and quizzes |
| Exploration of a Cell | [`/cell.html`](cell.html) | 3D tour of a eukaryotic cell |
| Endometriosis Library | [`/endo/`](endo/) | Summaries of recent endometriosis research |
| Stumble | [`/stumble/`](stumble/) | Random walks around the IndieWeb |
| Libre Broadcast | [`/news.html`](news.html) | RSS news reader |
| Audio Sequencer | [`/sequencer.html`](sequencer.html) | Browser audio sequencer |
| Loonatic Tunes | [`/loonatic-tunes.html`](loonatic-tunes.html) | Album browser and player |
| Masterbook Season Creator | [`/frisbee-season.html`](frisbee-season.html) | Frisbee season planner demo |
| Resilience Report | [`/2026-resilience-report.html`](2026-resilience-report.html) | Financial analysis report |

## Running locally

Some apps load JSON with `fetch`, so serve the folder over HTTP instead of opening
files directly:

```bash
npm install && node server.js      # then open http://localhost:3000/
# or
python3 -m http.server 8000
```

## License

The code and original content in this repository are released under the
[MIT License](LICENSE). You're welcome to copy, change and reuse them; please keep the
copyright notice.

### Third-party material

These parts are **not** covered by the MIT License and keep their own terms:

| Material | Where | Source and license |
|---|---|---|
| Reading passages | `language/data/italian.json` → `readings` | Excerpts from [Italian Wikipedia](https://it.wikipedia.org/), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Each passage links its source article in the app. |
| Definitions and etymologies | `words/words.json`, `words/definitions_map.json`, `words/etymology_map.json` | From [Wiktionary](https://en.wiktionary.org/), via [kaikki.org](https://kaikki.org/), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Adapted (shortened and merged). |
| Middle-earth map data | `lotr.json`, `lotr.html` | Terrain traced from a Middle-earth map image (`12mi_middle_earth.png`). Middle-earth and its place names belong to the Tolkien Estate. Not covered by the MIT License. |
| Research papers | `endo/articles/` | The summaries are original. The papers they describe (linked by PubMed Central ID) belong to their authors and publishers. |
| Libraries | loaded from CDNs, not stored here | three.js, Vue, KaTeX, Chart.js, VexFlow, paper.js and Moment.js are open source under their own licenses. **Highcharts** (used by one page) is proprietary, free only for non-commercial use. |
| Fonts | Google Fonts | SIL Open Font License. |

Content under CC BY-SA 4.0 may be reused under that license, with attribution and
share-alike, not under MIT.
