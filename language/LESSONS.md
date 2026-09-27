# Italiano Studio — Lesson Plan

The planned curriculum for the **Lessons** tab. Lessons 1–16 (Units 1–2) are built and live in `data/italian.json` → `lessons`, grouped by `unit` under the `lessonUnits` headings. The lesson format (step types, dialogues, role-play, `practice` ids) is documented in `DESIGN.md` §3.0 and §4. This file covers *what* to teach, and in what order.

Levels follow the CEFR scale: lessons 1–33 (Units 1–4) are roughly **A1** (the basics) and 34–45 (Units 5–6) roughly **A2** (everyday independence).

---

## How to write a lesson

Keep the conventions set by lessons 1–16:

- **Size:** 6–10 new words or phrases, 20–30 steps, about 35–45 Next presses. Split a lesson that grows past that.
- **Shape:** 2–4 sections, each with a heading, then words, examples and a quick check. End with an "In conversation" section: one dialogue with a `practice` role-play, and optionally a second one, often the polite/*Lei* version of the first.
- **Teach phrases before grammar.** Teach useful phrases as whole units first (*vorrei*, *mi piace*, *mi alzo*) and explain the rule in a later lesson. Point back when that happens ("Remember *mi chiamo* from lesson 2? Now you know why.").
- **Dialogues use only taught words**, plus at most one or two new context words, glossed in the text step before the dialogue (as lesson 4 does with *la stazione*). Reuse vocabulary from earlier lessons on purpose.
- **Write `wrong` distractors by hand** and aim them at the lesson's key contrast (*ha/hai*, *stanco/stanca*, *c'è/ci sono*, *è andato/ha andato*). One distractor should be tempting; the other should be clearly wrong.
- **Quick checks are ungraded**, so use them for the mistakes English speakers typically make, and always fill in `why`. Write the correct option first (`answer: 0`): the app shuffles options when it shows them.
- **`practice` ids** should include existing sentences where they fit. Add new sentences (next free id, `topic` set) when a lesson needs them in the Sentences tab.
- **Review lessons** (*Ripasso*) close each unit. They teach nothing new: checks that mix earlier lessons, then one longer dialogue that combines them.

Legend for the entries below: **Links** = existing items to reference in `practice`; **New data** = what must be added to the JSON first.

---

## Unit 1 — First conversations ✅ (built)

| # | Title | Covers |
|---|---|---|
| 1 | *Ciao!* | Greetings and goodbyes, time of day, *tu* vs *Lei* |
| 2 | *Mi chiamo…* | Name, *piacere*, *di dove sei? / sono di…* |
| 3 | *Come stai?* | *Come stai / sta / va*, answer scale, *stare* for how you are, *stanco/stanca* |
| 4 | *Per favore, grazie* | *Per favore, grazie, prego, scusi/scusa, permesso, mi dispiace*, what to say when you don't understand |
| 5 | *Io sono…* | All of *essere*, nationalities and -o/-a agreement, *non*, questions by intonation |
| 6 | *Numeri e anni* | 0–20, age with *ho / hai / ha … anni* |
| 7 | *Ripasso 1* | Review: *tu*/*Lei* side by side, *essere* / *stare* / *avere*, question–answer matching; a language-exchange dialogue and a polite homestay dialogue |

---

## Unit 2 — Things, places and numbers ✅ (built)

| # | Title | Covers |
|---|---|---|
| 8 | *Al bar* | *Vorrei* (as a phrase), café items, *per me*, *Prego? / Altro? / Basta così*, *ecco*, *Quant'è? / Quanto costa?*, paying at the *cassa* |
| 9 | *Il, la, lo* | Gender from the ending (and *la mano*, *il problema*), *il / lo / la / l'*, *un / uno / una / un'* |
| 10 | *Tanti!* | -o → -i, -a → -e, -e → -i; *i / gli / le*; invariable nouns (*caffè, città, sport, bar*) |
| 11 | *La mia famiglia* | Family nouns, all of *avere*, *mio / mia / miei / mie*, *tuo / tua*, no article with one relative |
| 12 | *Com'è?* | Four-form and two-form adjectives, position after the noun, *molto*; *grande uomo* / *bel* mentioned only |
| 13 | *Fino a cento* | Tens, compounds (*ventuno, ventotto, ventitré*), prices, *quanto costa / costano*, a market dialogue |
| 14 | *Che ore sono?* | *Sono le… / è l'una*, *e un quarto / e mezza / meno un quarto*, *a che ora? — alle…*, 24-hour clock |
| 15 | *Oggi, domani* | Days (*lunedì* vs *il lunedì*), *oggi / domani / ieri*, months, dates with *il primo*, *Quanti ne abbiamo oggi?* |
| 16 | *Ripasso 2* | Review checks across the unit; a long café catch-up dialogue |

Data added for Unit 2: nouns for the café and market (*cappuccino, cornetto, tè, succo, panino, euro, conto, cassa, mela, arancia, pomodoro, chilo*), family (*genitore, figlia, nonno, nonna*) and a new **Time & dates** topic (the seven days, *settimana, mese, mattina, pomeriggio, sera, compleanno, quarto*); numbers 21–99; sentences s185–s214. Months are glossary words, not nouns, so the Nouns drill doesn't ask for plurals like *gli agosti*. Adjectives still have no SRS ids, so lesson 12 practises through sentences.

---

## Unit 3 — Doing things: the present tense

### 17. *Parlo italiano* — Regular -are verbs
- **Goals:** Conjugate any regular -are verb and talk about your routine.
- **Teach:** The pattern *-o, -i, -a, -iamo, -ate, -ano* with *parlare, abitare, lavorare, mangiare, chiamare, studiare*; subject pronouns are usually dropped.
- **Notes:** Spelling of *mangiare* (*mangi*, not *mangii*) and *cercare / pagare* (*cerchi, paghi*): mention it.
- **Checks:** *parliamo* vs *parlamo*; *loro parlano* stress (a pronunciation note).
- **Dialogue:** A date or a new colleague: "*Dove lavori? — Lavoro in un ospedale.*" Role-play as the one answering.
- **Links:** `v:parlare:present:*`, `v:abitare:present:*`, `v:lavorare:present:*`, `v:mangiare:present:*`, `q:q3`, `q:q13`, `s:s10`, `s:s5`.
- **New data:** Verb *studiare*.

### 18. *Leggo e scrivo* — Regular -ere verbs
- **Goals:** Conjugate regular -ere verbs.
- **Teach:** *-o, -i, -e, -iamo, -ete, -ono* with *prendere, leggere, scrivere, vivere, vedere, mettere*; *prendere* for food and transport (*prendo un caffè*, *prendo il treno*).
- **Checks:** *-ete* vs *-ate*; *loro leggono*.
- **Dialogue:** Weekend habits: reading, writing, taking the train.
- **Links:** `v:prendere:present:*`, `v:leggere:present:*`, `v:scrivere:present:*`, `v:vivere:present:*`, `s:s19`, `s:s24`, `s:s32`.

### 19. *Dormo e capisco* — The two -ire patterns
- **Goals:** Conjugate -ire verbs of both kinds.
- **Teach:** *dormire / partire / aprire* (*dormo*) vs *capire / finire / preferire* (*capisco*, with -isc- in every form except *noi* and *voi*).
- **Checks:** *capisco* vs *capo*; *finiamo* (no -isc-).
- **Dialogue:** Roommates: "*A che ora parti? — Parto alle otto, ma finisco di lavorare alle sei.*"
- **Links:** `v:capire:present:*`, `v:finire:present:*`, `s:s7`.
- **New data:** Verbs *dormire, partire, aprire, preferire*.

### 20. *Faccio, vado, vengo* — Common irregular verbs
- **Goals:** Use the most frequent irregular verbs.
- **Teach:** *fare, andare, venire, uscire, bere, dire* in the present. Uses of *fare*: *fare colazione, fare una passeggiata, fare la spesa*, and weather (*fa caldo*).
- **Notes:** *andare a* + infinitive or a place; *venire con me?*
- **Checks:** *vado* vs *ando*; *facciamo*; *escono*.
- **Dialogue:** Weekend plans: "*Che cosa fai sabato? — Vado al mare. Vieni?*" Role-play as the one invited.
- **Links:** `v:fare:present:*`, `v:andare:present:*`, `v:venire:present:*`, `v:uscire:present:*`, `v:bere:present:*`, `q:q9`, `s:s3`, `s:s11`.

### 21. *Domande* — Question words
- **Goals:** Ask open questions.
- **Teach:** *chi, che cosa / cosa / che, dove, quando, perché, come, quanto / quanta / quanti / quante, quale*. *Perché* means both "why" and "because".
- **Checks:** *quanti anni* vs *quanto anni*; *qual è* (no apostrophe).
- **Dialogue:** A job interview or a new neighbour asking lots of questions. Role-play as the one asking.
- **Links:** All of `q:q1`–`q:q16`.

### 22. *Dov'è…?* — Directions and places
- **Goals:** Ask for and follow directions, and say what is where.
- **Teach:** *c'è / ci sono*; *a destra, a sinistra, dritto, all'angolo, vicino a, lontano da, di fronte a, accanto a, dietro*; *giri, vada, prenda, attraversi* as fixed polite instructions (the imperative comes later).
- **Checks:** *c'è* vs *ci sono*; *vicino alla* (preview of lesson 27).
- **Dialogue:** Asking a passer-by for the pharmacy, then the bus stop. Role-play as the tourist. A casual version follows between friends.
- **Links:** The whole directions topic, `s:s51`–`s:s75`, plus `s:s91`.

### 23. *Al ristorante* — Eating out
- **Goals:** Book a table, order a full meal, handle allergies, pay.
- **Teach:** *Ho prenotato…*, *un tavolo per due*, *il menù*, courses (*antipasto, primo, secondo, contorno, dolce*), *Che cosa mi consiglia?*, *Sono allergico/a a…*, *Il conto, per favore*, *Possiamo pagare con la carta?*
- **Notes:** Culture: the *coperto* (cover charge) is normal, tipping is optional, and the waiter won't bring the bill until you ask.
- **Checks:** Course order; *allergico* vs *allergica*; *per me* vs *a me*.
- **Dialogue:** A full dinner from arrival to paying. Role-play as the diner.
- **Links:** Most of the food topic, `s:s26`–`s:s50`, and `s:s79`, `s:s84`, `s:s92`, `s:s100`.

### 24. *Mi piace!* — Likes and preferences
- **Goals:** Say what you like and don't like, and compare.
- **Teach:** *mi piace* + singular or infinitive, *mi piacciono* + plural; *ti piace?*; *anche a me / a me no / neanche a me*; *preferire*; *di più*.
- **Notes:** *Piacere* works "backwards": the thing pleases you. Keep that explanation short.
- **Checks:** *mi piace i gatti* ✗ → *mi piacciono*; *anche a me* vs *anche io*.
- **Dialogue:** Choosing a film or a restaurant together. Role-play as either friend.
- **Links:** The preference function, `s:s126`–`s:s133`, and `q:q7`.

### 25. *Ripasso 3* — Review: a weekend in Rome
- **Dialogue:** A long one: arrive, ask directions, eat at a restaurant, talk about likes. Checks drill the present-tense verb groups.

---

## Unit 4 — Wants, needs and everyday life

### 26. *Voglio, posso, devo* — Modal verbs
- **Goals:** Say what you want, can and must do.
- **Teach:** *volere, potere, dovere* in the present + infinitive; *avere bisogno di*.
- **Checks:** *posso andare* vs *posso vado*; *devo* vs *ho bisogno di* + noun.
- **Dialogue:** Negotiating plans: "*Vuoi venire? — Vorrei, ma non posso. Devo lavorare.*"
- **Links:** `v:volere/potere/dovere:present:*`, the ability, necessity and desire functions (e.g. `s:s8`, `s:s13`, `s:s25`, `s:s77`, `s:s86`, `s:s89`, `s:s90`, `s:s98`, `s:s101`).

### 27. *A, in, da, di* — Prepositions and going places
- **Goals:** Say where you go and where you are.
- **Teach:** *a Roma / in Italia*; *a casa, a scuola, in ufficio, in banca*; *da* + person (*dal medico, da Marco*); combined forms (*al, allo, alla, all', ai, agli, alle*; the same for *del, nel, dal, sul*). Teach through the phrases, then show the table.
- **Checks:** *vado a Italia* ✗; *al mare*; *dal dottore*.
- **Dialogue:** Friends comparing their errands for the day.
- **Links:** `s:s4`, `s:s23`, `s:s62`, `s:s117`.
- **New data:** A preposition table (a `list` step is enough for the lesson; an exercise is optional).

### 28. *La mia giornata* — Reflexive verbs and routine
- **Goals:** Describe your daily routine.
- **Teach:** *mi alzo, mi lavo, mi vesto, mi chiamo* (the pay-off of lesson 2), *mi addormento*; the pronouns *mi, ti, si, ci, vi, si*; routine words (*prima, poi, dopo, di solito, sempre, mai*).
- **Notes:** Use the Bathroom nouns (*doccia, spazzolino, asciugamano …*).
- **Checks:** *mi lavo* vs *lavo*; *ci alziamo*.
- **Dialogue:** Two flatmates sharing one bathroom in the morning. Role-play as either one.
- **Links:** Bathroom nouns (`n:doccia`, `n:spazzolino`, `n:asciugamano`, `n:sapone`, …).
- **New data:** Reflexive verbs (*alzarsi, lavarsi, vestirsi, chiamarsi, svegliarsi*) in `verbs`, with a flag the grader can use.

### 29. *Vorrei…* — Polite requests with the conditional
- **Goals:** Make polite requests and wishes.
- **Teach:** Explain *vorrei* from lesson 8 properly; *potrebbe…?*, *mi piacerebbe*, *dovrei*.
- **Checks:** *vorrei* vs *voglio* depending on the setting; *potrebbe* vs *può*.
- **Dialogue:** At a hotel reception, asking for favours.
- **Links:** The conditional tense for `volere`, `potere` and `dovere`; `s:s26`, `s:s99`, `s:s100`, `s:s103`.

### 30. *So, conosco, posso* — Know and can
- **Goals:** Pick the right verb for "know" and "can".
- **Teach:** *sapere* (facts, how to do something), *conoscere* (people, places), *potere* (be able to or allowed to), *riuscire a* (manage to).
- **Checks:** *So Marco* ✗ → *Conosco Marco*; *So nuotare* vs *Posso nuotare*.
- **Dialogue:** Planning a trip: "*Conosci Napoli? — No, ma so dov'è.*"
- **Links:** `v:sapere:present:*`, `s:s67`, `s:s78`, `s:s79`, `s:s80`, `s:s85`.
- **New data:** Verb *conoscere*.

### 31. *Fare la spesa* — Shopping
- **Goals:** Buy food and clothes; ask for sizes and quantities.
- **Teach:** *un chilo, mezzo chilo, un etto, una bottiglia, un pacco*; *questo / quello*; colours (as adjectives); *la taglia*, *Posso provarlo?*, *È troppo caro.*
- **Notes:** Culture: at a market, don't touch the produce yourself; ask the seller. An *etto* is 100 g.
- **Checks:** *questa* vs *questo*; colours that agree vs *blu*/*rosa*, which don't change.
- **Dialogue:** At a market stall, then in a clothes shop.
- **New data:** A shopping topic; nouns for groceries and clothes; colour adjectives.

### 32. *Che tempo fa?* — Weather and seasons
- **Goals:** Talk about the weather.
- **Teach:** *fa caldo / freddo / bel tempo*, *piove, nevica, c'è il sole / vento*, seasons, *che bello!*
- **Dialogue:** A phone call between two cities comparing the weather.
- **Links:** `s:s17`, `n:sole`, adjectives *caldo / freddo*.

### 33. *Ripasso 4* — Review: planning a trip
- **Dialogue:** Friends plan a weekend: dates, times, who can come, shopping for food, the forecast.

---

## Unit 5 — Past and future (A2)

### 34. *Ieri ho mangiato* — Past tense with *avere*
- **Goals:** Say what you did.
- **Teach:** *avere* + past participle; regular participles (*-ato, -uto, -ito*); common irregular ones (*fatto, detto, visto, preso, letto, scritto, messo, bevuto*); time words (*ieri, stamattina, la settimana scorsa, fa*).
- **Checks:** *ho fatto* vs *ho faciuto*; *ho visto* vs *ho veduto* (the second is rare).
- **Dialogue:** Monday morning: "*Che cosa hai fatto nel fine settimana?*" Role-play as the one answering.
- **Links:** Passato prossimo forms of the verbs listed, `s:s27`, `s:s42`.

### 35. *Sono andato* — Past tense with *essere*
- **Goals:** Use *essere* verbs in the past, with agreement.
- **Teach:** Movement and change verbs (*andare, venire, uscire, partire, arrivare, tornare, stare, essere*); agreement (*è andata, siamo usciti*); reflexive verbs in the past (*mi sono alzato*).
- **Checks:** *ho andato* ✗; *Giulia è andato* ✗; *siamo arrivate*. These are ideal role-play distractors.
- **Dialogue:** Telling a friend about a trip. Role-play as the traveller (with gender agreement).
- **Links:** The passato prossimo of `andare`, `venire`, `uscire`, `essere`, `stare`. The grader already accepts both genders.
- **New data:** Verbs *arrivare, tornare*.

### 36. *Da bambino* — The imperfect
- **Goals:** Describe how things used to be.
- **Teach:** Imperfect endings (*-avo, -evo, -ivo*); *essere* (*ero*); uses for habits, descriptions, and background (age, weather, feelings in the past).
- **Checks:** *ero* vs *sono stato* for a description; *da bambino* + imperfect.
- **Dialogue:** Grandparent and grandchild looking at old photos. Role-play as the grandparent.
- **Links:** The habitual-past function, `s:s106`–`s:s116`.

### 37. *Mentre camminavo…* — Telling a story
- **Goals:** Combine the two past tenses in a story.
- **Teach:** The imperfect sets the scene, the passato prossimo moves the events forward (*Mentre camminavo, ho visto…*); *all'improvviso, poi, alla fine*.
- **Checks:** Choose the tense in a two-part sentence.
- **Dialogue:** Telling a friend about a lost wallet. Role-play as the storyteller.

### 38. *Domani andrò* — The future
- **Goals:** Talk about plans and predictions.
- **Teach:** Future endings (*-erò, -erai, -erà …*), irregular stems (*sarò, avrò, andrò, farò, verrò, vorrò*); the present tense for near plans (*domani lavoro*); *avere intenzione di*.
- **Checks:** *parlerò* vs *parlarò*; when the present tense is enough.
- **Dialogue:** New Year's resolutions, or holiday plans.
- **Links:** The future-plans function, `s:s117`–`s:s125`.

### 39. *Ripasso 5* — Review: then, now and later
- **Dialogue:** A reunion: what we did, how things used to be, what we'll do next. Checks mix the three tenses.

---

## Unit 6 — Real-life situations (A2)

### 40. *Dal medico* — At the doctor or pharmacy
- **Teach:** Body parts (*testa, mano, occhio, cuore, pancia, gola, schiena*); *mi fa male…*, *ho mal di testa / di gola*, *ho la febbre*; *la ricetta*, *in farmacia*.
- **Checks:** *mi fa male la testa* vs *mi fanno male gli occhi*.
- **Dialogue:** At the pharmacy, describing symptoms. Role-play as the patient.
- **Links:** `n:testa`, `n:mano`, `n:occhio`, `n:cuore`, `s:s52`, `s:s94`.

### 41. *In albergo* — At a hotel
- **Teach:** *una camera singola / doppia*, *per tre notti*, *la colazione è inclusa?*, *la chiave*, room problems (*il rubinetto non funziona*).
- **Dialogue:** Checking in, then calling reception about a problem.
- **Links:** Bathroom nouns (`n:rubinetto`, `n:doccia`, `n:asciugacapelli`), lesson 29's polite requests.

### 42. *In viaggio* — Trains and travel
- **Teach:** *il biglietto (di andata e ritorno)*, *il binario*, *in ritardo*, *convalidare*, *la coincidenza*, *Quanto tempo ci vuole?*
- **Notes:** Culture: validate regional train tickets before boarding.
- **Dialogue:** At the ticket office, then on the platform when a train is delayed.
- **Links:** `n:treno`, `s:s18`, `s:s69`, `s:s70`, `s:s133`.

### 43. *Pronto?* — Phone calls and object pronouns
- **Teach:** *Pronto? Chi parla? Te lo passo.*; direct object pronouns *lo, la, li, le* (*Lo vedo domani*); indirect *mi, ti, gli, le*.
- **Checks:** *lo* vs *la* for masculine and feminine objects; pronoun placement before the verb.
- **Dialogue:** Calling to change a reservation.

### 44. *Ci e ne* — Two small, very common words
- **Teach:** *ci* for places (*Ci vado domani*) and *ne* for quantities (*Quanti ne vuoi? Ne prendo due*).
- **Dialogue:** At a market: "*Quante mele vuole? — Ne prendo sei.*"
- **Links:** `s:s69`, `s:s70`, `s:s87` (*ci vuole*, *c'è bisogno*).

### 45. *Ripasso 6* — Review: a week in Italy
- **Dialogue:** A capstone conversation in several scenes (hotel, train, restaurant, pharmacy, phone call). Role-play one scene each.

---

## Later topics (B1)

Not planned in detail yet: the imperative (*tu* and *Lei*: *Scusa! Mi dica!*), comparatives and superlatives, relative pronouns (*che, cui*), the subjunctive after *penso che / spero che*, *stare* + gerund (*sto mangiando*), combined pronouns (*glielo*), the past perfect, hypotheticals (*se avessi…*), and register in writing (emails, formal letters).

---

## App and data work needed for these lessons

| Needed by | Work |
|---|---|
| 31 | New nouns (shopping, clothes) |
| 31 (and 12, retroactively) | An adjective-agreement exercise, so adjectives get SRS ids |
| 17–19, 28, 30, 35 | New verbs: *studiare, dormire, partire, aprire, preferire, conoscere, arrivare, tornare*, and reflexive verbs, all with full tense tables |
| 27 | A combined-preposition table (a `list` step is enough) |
| All | New sentences for each lesson (`topic` set, next free ids) so its `practice` list has Sentences-tab items |
| Optional | A tile-builder role-play mode (typing or building the line instead of picking it) for lessons from Unit 3 on, once learners know enough words |
