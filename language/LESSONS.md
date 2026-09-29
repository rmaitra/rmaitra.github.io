# Italiano Studio — Lesson Plan

The planned curriculum for the **Lessons** tab. Lessons 1–25 (Units 1–3) are built and live in `data/italian.json` → `lessons`, grouped by `unit` under the `lessonUnits` headings. The lesson format (step types, dialogues, role-play, `practice` ids) is documented in `DESIGN.md` §3.0 and §4. This file covers *what* to teach, and in what order.

Levels follow the CEFR scale: lessons 1–33 (Units 1–4) are roughly **A1** (the basics), 34–45 (Units 5–6) roughly **A2** (everyday independence) and 46–78 (Units 7–11) **B1** (independent user).

---

## How to write a lesson

Keep the conventions set by lessons 1–25:

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

## Unit 3 — Doing things: the present tense ✅ (built)

| # | Title | Covers |
|---|---|---|
| 17 | *Parlo italiano* | Regular *-are* verbs (*-o, -i, -a, -iamo, -ate, -ano*), dropping the subject pronoun, *-iare* / *-care* / *-gare* spelling, *loro* stress |
| 18 | *Leggo e scrivo* | Regular *-ere* verbs (*-e, -ete, -ono*), *prendere* for ordering and transport, soft and hard *gg* |
| 19 | *Dormo e capisco* | *-ire* verbs: *dormire / partire / aprire* vs *-isc-* verbs *capire / finire / preferire* (no *-isc-* in *noi / voi*) |
| 20 | *Faccio, vado, vengo* | *fare, andare, venire, uscire, bere, dire* in the present; *fare* phrases and weather (*fa caldo*, never *è caldo*) |
| 21 | *Domande* | *chi, che cosa, dove, quando, perché, come, quanto, quale*; *quanto* agreement; *qual è* without an apostrophe |
| 22 | *Dov'è…?* | *c'è / ci sono*, place phrases (*accanto a, di fronte a…*), polite direction commands to recognise; a street dialogue and a casual text follow-up |
| 23 | *Al ristorante* | Booking, the courses, *per me* vs *a me*, *allergico / allergica*, the bill, *coperto* and tipping |
| 24 | *Mi piace!* | *mi piace / mi piacciono*, *ti / gli / le / Le piace*, *anche a me / a me no / neanche a me*, *preferire*, *di più* |
| 25 | *Ripasso 3* | Review checks across the verb groups, questions, places and likes; a long dialogue from the station to dinner in Rome |

Data added for Unit 3: verbs *studiare, dormire, partire, aprire, preferire* (all five tenses); sentences s215–s243; glossary entries for their words and set phrases (*fa caldo*, *anche a me*, *alle sei*…).

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

## B1 — Independent user (Units 7–11)

**What B1 means.** The learner can deal with most situations while travelling or living in Italy, describe experiences, events, hopes and plans, give reasons and opinions briefly, follow the main points of clear standard speech on familiar topics, and write simple connected text. In numbers (see the Progress tab), that's about **2,000 word families** and **~400 study hours**, and reading coverage of ordinary texts at **95%** or more.

**What changes from A1–A2:**
- **Grammar shifts from forms to choices.** Most checks ask *which* form fits (indicative or subjunctive? imperfect or passato prossimo? *che* or *cui*?), not how to build it. Distractors should be grammatical but wrong for the meaning.
- **Dialogues get longer and less scripted.** Aim for 10–16 lines, one role-play per lesson, and one reading passage (text + comprehension checks) in most lessons.
- **Production matters more.** From Unit 8 on, lessons end with a short task: write or say something, then compare with a model answer (see the app work at the end).
- **Vocabulary grows by topic.** Each lesson adds 15–25 words. Unit 11 lessons are organised around real tasks rather than grammar.

---

## Unit 7 — Telling it right (B1)

### 46. *Sto leggendo* — Actions in progress
- **Goals:** Say what is happening right now, and what was happening when something else happened.
- **Teach:** *stare* + gerund (*sto leggendo, stavo dormendo*); regular gerunds (*-ando, -endo*) and the irregular ones (*facendo, dicendo, bevendo*); *stare per* + infinitive (*sto per uscire*, I'm about to go out).
- **Notes:** Italian uses the plain present more than English uses "-ing": *Che fai?* is normal; *Che stai facendo?* stresses "right now".
- **Checks:** *sto mangiando* vs *sono mangiando*; *stavo per* vs *stavo* + gerund.
- **Dialogue:** A phone call interrupted twice: "*Scusa, sto cucinando. Ti richiamo tra cinque minuti.*" Role-play as the one cooking.
- **New data:** A `gerundio` form per verb (one form, not six).

### 47. *Era già partito* — The past perfect
- **Goals:** Put two past events in order.
- **Teach:** *trapassato prossimo* (*avevo mangiato, ero partito*): the imperfect of *avere / essere* + participle; *già*, *ancora*, *appena*, *non… ancora*.
- **Checks:** *Quando sono arrivato, il film era già cominciato* vs *è già cominciato*; agreement with *essere* (*era partita*).
- **Dialogue:** Missing a train: "*Quando sono arrivata al binario, il treno era già partito!*" Role-play as the traveller.
- **New data:** A `trapassato` tense (compound, stored explicitly like the passato prossimo).

### 48. *Più alto di me* — Comparing
- **Goals:** Compare people, places and things.
- **Teach:** *più / meno … di* (with nouns and pronouns), *più / meno … che* (with adjectives, verbs, and after prepositions), *(tanto) … quanto*, *così … come*; irregular *migliore / peggiore* and *meglio / peggio*.
- **Notes:** *Migliore* is an adjective (*un vino migliore*), *meglio* an adverb (*canta meglio*). Even Italians mix them up in speech.
- **Checks:** *più alto di me* vs *più alto che me*; *è più facile leggere che scrivere*; *meglio* vs *migliore*.
- **Dialogue:** Two friends comparing Rome and Milan to decide where to move. Role-play as either.
- **New data:** Comparative forms for the 20 adjectives (table or `list` steps).

### 49. *Il più bello* — Superlatives
- **Goals:** Say something is the best, the biggest, or extremely good.
- **Teach:** Relative superlative (*il ristorante più caro della città*); absolute superlative with *-issimo* (*bellissimo, buonissimo*, from lesson 25) and *molto*; irregular *ottimo, pessimo, il migliore*.
- **Checks:** *il più bello della città* vs *il più bello in città*; *buonissimo* vs *molto buonissimo*.
- **Dialogue:** A food tour guide in Bologna: "*Questa è la mortadella più buona d'Italia!*" Role-play as the tourist asking questions.

### 50. *La persona che…* — Relative pronouns
- **Goals:** Join sentences and describe things precisely.
- **Teach:** *che* (subject or object); *cui* after a preposition (*la ragazza con cui esco, la città in cui vivo, il motivo per cui…*); *quello che / ciò che* (what = the thing that); *il quale* for recognition only.
- **Checks:** *la persona con cui parlo* vs *con che parlo*; *Non capisco quello che dici*.
- **Dialogue:** Describing a lost bag at a lost-and-found office: "*È uno zaino blu, in cui c'è un computer.*" Role-play as the owner.
- **Reading:** A short biography with relative clauses (*Leonardo da Vinci* from the Readings, simplified).

### 51. *Me lo dai?* — Combined pronouns
- **Goals:** Replace both objects of a verb: "Can you give it to me?"
- **Teach:** *mi / ti / ci / vi* + *lo, la, li, le, ne* → *me lo, te la, ce ne…*; *gli / le* + object → *glielo, gliela, glieli, gliene*; position before the verb or attached to an infinitive (*Posso dartelo* / *Te lo posso dare*).
- **Notes:** *Glielo* covers "it to him", "it to her" and "it to you (polite)". Context disambiguates.
- **Checks:** *Me lo dai?* vs *Mi lo dai?*; *Gliel'ho detto*; both positions with modals.
- **Dialogue:** Borrowing and lending between flatmates: "*Mi presti la macchina? — Sì, te la presto, ma domani me la ridai.*"
- **New data:** A pronoun table; a sentence transformation drill would help (see app work).

### 52. *Ripasso 7* — Review: a trip that went wrong
- **Content:** Checks mixing the progressive, past perfect, comparisons, relatives and combined pronouns.
- **Dialogue:** Telling a friend about a disastrous weekend: the train had already left, the hotel was worse than the photos, the one person who helped. Role-play as the storyteller.

---

## Unit 8 — Giving advice and instructions (B1)

### 53. *Senti! Aspetta!* — The informal imperative
- **Goals:** Tell friends what to do, and what not to do.
- **Teach:** *tu, noi, voi* imperative (*parla, prendi, senti; parliamo; parlate*); irregular *va', fa', da', di', sta'* (and *vai, fai…* in speech); the negative *tu* form is *non* + infinitive (*Non parlare!*).
- **Checks:** *Non mangiare!* vs *Non mangia!*; *Andiamo!* (let's go).
- **Dialogue:** Friends getting ready to leave in a hurry: "*Prendi le chiavi! Non dimenticare il telefono!*" Role-play as the one giving orders.
- **New data:** An `imperativo` tense with no *io* form (the verb drill must skip missing persons).

### 54. *Mi dica!* — The polite imperative
- **Goals:** Understand and give polite instructions to strangers and customers.
- **Teach:** *Lei* forms (*scusi, senta, venga, faccia, dica, si accomodi*); why they look like the subjunctive; pronouns go *before* the *Lei* form (*Mi dica*) but *after* the *tu* form (*Dimmi*). Callback to lesson 22's *giri, vada, prenda*.
- **Checks:** *Mi dica* vs *Dimmi* by setting; *Si accomodi* at a doctor's.
- **Dialogue:** A shop assistant and a customer: "*Buongiorno, mi dica. — Senta, cerco una giacca.*" Role-play as the assistant.

### 55. *Dimmelo!* — Imperative with pronouns
- **Goals:** Say "tell me", "give it to me", "let me see".
- **Teach:** Pronouns attached to *tu / noi / voi* imperatives (*dimmi, prendilo, facciamolo*); the doubled consonant after one-syllable forms (*dammi, fammi, dimmelo, vattene*); *fammi vedere*.
- **Checks:** *Dammelo* vs *Dammilo*; *Non dirmelo* / *Non me lo dire*.
- **Dialogue:** A teenager and a parent about a phone: "*Dammelo! — No, prima fammi vedere i compiti.*"

### 56. *Dovresti…* — Giving advice
- **Goals:** Give and ask for advice politely.
- **Teach:** The conditional for advice (*dovresti, potresti, faresti meglio a…*); *Al posto tuo, io…* (if I were you); *Cosa mi consigli?* (lesson 23 callback); recognising the past conditional for regret (*avresti dovuto dirmelo*).
- **Checks:** *Dovresti riposarti* vs *Devi riposarti* (softer vs stronger); *Al posto tuo andrei* vs *vado*.
- **Dialogue:** A friend who is stressed at work asks for advice. Role-play as the adviser.
- **Task:** Write three pieces of advice for someone moving to Italy. Model answer follows.

### 57. *Qui si parla italiano* — Impersonal *si*
- **Goals:** Say what "people" or "you" generally do; read signs and instructions.
- **Teach:** Impersonal *si* (*si mangia bene qui*); passive *si* with plural agreement (*si vendono biglietti*); signs (*Vietato fumare, Si prega di…*); *come si dice…?*, *come si scrive…?*
- **Checks:** *Si vendono appartamenti* vs *Si vende appartamenti*; reflexive vs impersonal *si* (lesson 28 callback).
- **Dialogue:** A local explaining unwritten rules to a newcomer: "*Qui non si beve il cappuccino dopo pranzo!*"
- **Reading:** Five real-style signs and notices, with a check on each.

### 58. *In cucina* — Following a recipe
- **Goals:** Read and follow a recipe; explain how to make something.
- **Teach:** Recipe language: the infinitive or *Lei* / *voi* imperative (*tagliare, tagliate*), *ne* for quantities (lesson 44 callback), cooking verbs (*tagliare, bollire, mescolare, aggiungere, cuocere*), measures (*un pizzico, q.b.*).
- **Checks:** *Ne aggiungo due* vs *Li aggiungo due*; *q.b.* means "as needed".
- **Dialogue:** A grandmother teaching carbonara over the phone. Role-play as the grandchild asking questions.
- **Reading:** A short recipe (*la carbonara*), with sequence checks.
- **New data:** A cooking vocabulary set (verbs and nouns).

### 59. *Ripasso 8* — Review: helping a visitor settle in
- **Dialogue:** Showing a new flatmate around: rules of the house (impersonal *si*), what to do and not do (imperatives), where to shop and what to buy (advice).
- **Task:** Write a note for a flatmate with five instructions.

---

## Unit 9 — Opinions and feelings: the subjunctive (B1)

### 60. *Penso che sia…* — Opinions
- **Goals:** Give opinions with *penso che, credo che, mi sembra che*.
- **Teach:** The *congiuntivo presente* of *essere, avere* and regular verbs (*parli, prenda, dorma, capisca*); the three singular forms are identical, so keep the subject (*penso che tu abbia ragione*).
- **Notes:** In casual speech many Italians use the indicative after *penso che*. Teach the subjunctive as the standard, and mention that learners will hear both.
- **Checks:** *Penso che sia vero* vs *Penso che è vero* (standard vs casual); *credo che lui abbia* vs *ha*.
- **Dialogue:** Two friends discussing a film they just watched: "*Secondo me è troppo lungo. — Io penso che sia bellissimo.*"
- **New data:** A `congiuntivo_presente` tense for all verbs.

### 61. *Voglio che tu venga* — Wishes and requests
- **Goals:** Say what you want or hope other people will do.
- **Teach:** *voglio / spero / preferisco che* + subjunctive; the same-subject rule (*Spero di venire*, not *Spero che io venga*); irregular subjunctives (*vada, faccia, venga, possa, debba, voglia, stia, dia, sappia*).
- **Checks:** *Spero di vederti* vs *Spero che ti veda*; *Voglio che tu venga* vs *Voglio che tu vieni*.
- **Dialogue:** A parent and a student about to leave for a year abroad: "*Voglio che tu mi chiami ogni domenica!*" Role-play as the student negotiating.

### 62. *È importante che…* — Necessity and possibility
- **Goals:** Say what is necessary, possible or better.
- **Teach:** Impersonal expressions + subjunctive (*bisogna che, è importante che, è meglio che, è possibile che, può darsi che*); + infinitive with no specific subject (*è importante dormire*); certainty keeps the indicative (*è vero che, so che, sono sicuro che*).
- **Checks:** *È meglio che tu parta* vs *È meglio partire*; *So che è vero* vs *Penso che sia vero*.
- **Dialogue:** Planning a group trip: what needs doing, what's possible, what's better. Role-play as the organiser.

### 63. *Sono contento che…* — Feelings
- **Goals:** Express feelings about what others do or what happens.
- **Teach:** Emotion + *che* + subjunctive (*sono contento che, mi dispiace che, ho paura che, mi sorprende che*); feelings vocabulary (*contento, deluso, preoccupato, arrabbiato, emozionato, sorpreso*); *mi dispiace* callback to lesson 4.
- **Checks:** *Mi dispiace che tu non possa venire* vs *non puoi venire*; *Sono contento di vederti* (same subject).
- **Dialogue:** Congratulating and consoling: a friend got a job, another failed an exam. Role-play reacting to both.

### 64. *Benché piova* — Conjunctions with the subjunctive
- **Goals:** Link ideas: although, before, so that, unless, provided that.
- **Teach:** *benché / sebbene, prima che, affinché / perché* (so that), *a meno che, purché, senza che*; *prima di* + infinitive with the same subject; *perché* + indicative = because, + subjunctive = so that.
- **Checks:** *Esco benché piova*; *Prima di uscire* vs *Prima che tu esca*; *perché* in both senses.
- **Reading:** A short opinion piece (about 150 words) with three of these conjunctions.
- **Dialogue:** Negotiating a deal with a landlord: "*Va bene, purché paghi entro il cinque del mese.*"

### 65. *Secondo me* — Discussing and debating
- **Goals:** Hold a friendly debate: agree, disagree, give reasons, concede a point.
- **Teach:** *secondo me, per me, a mio parere*; *sono d'accordo / non sono d'accordo*, *hai ragione / torto*, *dipende*; connectors *però, invece, comunque, infatti, quindi, anzi, insomma*.
- **Notes:** *Infatti* means "indeed, exactly", not "in fact" as a contradiction. *Comunque* is the all-purpose "anyway".
- **Checks:** *Infatti* vs *invece* in context; *Hai ragione* vs *Sei ragione*.
- **Dialogue:** City vs countryside, a four-line-each debate. Role-play either side.
- **Task:** Write a short paragraph (60–80 words) giving your opinion on a topic, using two connectors.

### 66. *Ripasso 9* — Review: choosing a holiday
- **Dialogue:** Four friends choosing between the sea and the mountains: opinions, wishes, conditions, feelings. Role-play as the one who has to convince the others.
- **Checks:** Indicative or subjunctive, sentence by sentence.

---

## Unit 10 — Possibility and the unreal (B1)

### 67. *Se piove, restiamo a casa* — Real conditions
- **Goals:** Talk about what will happen if something happens.
- **Teach:** *se* + present + present / future (*Se piove, restiamo a casa*; *Se vieni, ti presento Marco*); *se* + future + future (*Se avrò tempo, verrò*); weather and plans vocabulary.
- **Checks:** Tense agreement in both halves; *se* vs *quando*.
- **Dialogue:** Planning a picnic with a bad forecast. Role-play as the planner.

### 68. *Se avessi tempo* — Unreal conditions
- **Goals:** Talk about imaginary situations and wishes.
- **Teach:** The *congiuntivo imperfetto* (*avessi, fossi, parlassi, facessi*); *se* + imperfect subjunctive + conditional (*Se avessi tempo, viaggerei di più*); *Vorrei che* + imperfect subjunctive (*Vorrei che tu fossi qui*).
- **Notes:** The famous mistake *se avrei* is heard in speech but marked as wrong. It's a perfect distractor.
- **Checks:** *Se avessi* vs *Se avrei*; *Se fossi in te* (if I were you).
- **Dialogue:** "What would you do if you won the lottery?" between friends. Role-play either.
- **New data:** A `congiuntivo_imperfetto` tense.

### 69. *Avrei dovuto* — Regrets and the past conditional
- **Goals:** Express regret and unfulfilled plans.
- **Teach:** *condizionale passato* (*avrei voluto, sarei venuto, avresti dovuto*); the future in the past in reported speech (*Ha detto che sarebbe venuto*); the third conditional for recognition only (*Se l'avessi saputo, sarei venuto*).
- **Checks:** *Avrei dovuto studiare* vs *Dovrei aver studiato*; *Ha detto che sarebbe venuto* vs *verrebbe*.
- **Dialogue:** Apologising for missing a friend's party. Role-play as the one apologising.
- **New data:** A `condizionale_passato` tense.

### 70. *Sarà a casa* — The future for guesses
- **Goals:** Make guesses about the present and talk about what will be done by a certain time.
- **Teach:** The future for probability (*Che ore saranno? — Saranno le otto*; *Sarà a casa*); the *futuro anteriore* (*Quando avrò finito, ti chiamo*); *entro* (by).
- **Checks:** *Sarà stanco* (he's probably tired) vs *È stanco*; *quando avrò finito* vs *quando ho finito* (both heard).
- **Dialogue:** Waiting for a friend who is late: "*Dove sarà? Avrà perso il treno.*"

### 71. *Ripasso 10* — Review: dreams and regrets
- **Dialogue:** An evening conversation about plans, if-onlys and what they'll do next year. Checks mix all the conditional sentence types.
- **Task:** Write five sentences starting *Se fossi…* / *Se avessi…*.

---

## Unit 11 — Real life at B1 (tasks)

These lessons are organised around a task, not a grammar point. Each one reuses Units 7–10 in a realistic setting, adds the vocabulary the task needs, and ends with a longer role-play plus a written or spoken task.

### 72. *Cerco casa* — Renting a flat
- **Teach:** *l'annuncio, l'affitto, le spese (condominiali), le bollette, la caparra, il contratto, arredato, il monolocale / bilocale*; asking questions politely (*Vorrei sapere se…*, *È possibile che…?*); *da quanto tempo* + present.
- **Reading:** Three flat adverts; choose the right one for a given person.
- **Dialogue:** Calling a landlord, then a viewing. Role-play as the tenant.

### 73. *Un colloquio* — A job interview
- **Teach:** Describing experience (*Ho lavorato per tre anni come…*, *Lavoro qui da due anni*), strengths and weaknesses, *mi piacerebbe*, *sono in grado di*; formal register throughout.
- **Checks:** *Lavoro qui da due anni* vs *Ho lavorato qui per due anni* (still working vs finished).
- **Dialogue:** A full interview for a café-manager job. Role-play as the candidate.
- **Task:** Write a four-line presentation of yourself for a CV.

### 74. *Gentile Direttore* — Formal emails
- **Teach:** Openings and closings (*Gentile…, Egregio…, Le scrivo per…, In attesa di un Suo riscontro, Cordiali saluti*); capitalised *Lei / Suo* in formal writing; informal equivalents (*Ciao, un abbraccio, a presto*).
- **Checks:** Which closing fits which email; *Le scrivo* vs *Ti scrivo*.
- **Reading:** A formal email and an informal one about the same event.
- **Task:** Write an email asking a language school about courses. Model answer and a checklist follow.

### 75. *Ho un problema* — Complaints and problems
- **Teach:** *il reclamo, il rimborso, cambiare, restituire, non funziona, è rotto, in garanzia*; polite firmness (*Vorrei parlare con il responsabile*, *Mi aspetto che…*); combined pronouns (*Me lo può cambiare?*).
- **Dialogue:** Returning a broken phone, then calling a phone company. Role-play as the customer.

### 76. *Le notizie* — Reading the news
- **Teach:** Headline style (no articles, present for past events); the passive with *essere* and *venire* (*è stato arrestato, viene chiuso*); the *passato remoto* for recognition in written narrative (*nacque, fu, ebbe*); *si dice che*, reported speech (*Il sindaco ha detto che…*).
- **Reading:** Three short news items with comprehension checks; one written in the passato remoto (a history item).
- **Dialogue:** Friends discussing a news story over coffee.
- **New data:** More readings at B1 level; a passato remoto table for recognition.

### 77. *Raccontami!* — Telling a longer story
- **Teach:** Narrative connectors (*all'inizio, a un certo punto, all'improvviso, mentre, appena, alla fine, così*); choosing between passato prossimo, imperfetto and trapassato in one story; reported speech in the past.
- **Checks:** Tense choice across a six-sentence story.
- **Dialogue:** Telling the story of how two friends met. Role-play as the storyteller.
- **Task:** Write a 100-word story about a memorable trip.

### 78. *Ripasso 11* — Capstone: a year in Italy
- **Dialogue:** A long conversation in scenes: finding a flat, starting a job, a complaint, a weekend trip, telling the story afterwards. Role-play one scene each.
- **Checks:** A mixed B1 test (20 checks) covering Units 7–11, with a short summary of which units to revisit.

---

## Later topics (B2)

Not planned in detail yet: the passato remoto for production, the *congiuntivo passato* and *trapassato*, the full third conditional, the passive with *andare* (*va fatto*), full reported speech, the gerund and participle as clause shorteners (*Arrivato a casa, …*), pronominal verbs (*andarsene, farcela, cavarsela, metterci*), idioms and proverbs, formal writing (reports, complaints, applications), and regional variety (accents, common dialect words).

---

## App and data work needed for these lessons

| Needed by | Work |
|---|---|
| 31 | New nouns (shopping, clothes) |
| 31 (and 12, retroactively) | An adjective-agreement exercise, so adjectives get SRS ids |
| 28, 30, 35 | New verbs: *conoscere, arrivare, tornare*, and reflexive verbs, all with full tense tables |
| 27 | A combined-preposition table (a `list` step is enough) |
| All | New sentences for each lesson (`topic` set, next free ids) so its `practice` list has Sentences-tab items |
| Optional | A tile-builder role-play mode (typing or building the line instead of picking it) for lessons from Unit 3 on, once learners know enough words |
| 46–47, 53, 60, 68–70 (B1) | New verb tenses and moods for all verbs: `gerundio` (one form), `trapassato`, `imperativo` (no *io* form, so the Verbs drill must skip missing persons), `congiuntivo_presente`, `congiuntivo_imperfetto`, `condizionale_passato`, and `futuro_anteriore` for recognition. The Tense filter should group them by mood. This fits the conjugation-axes design in `MULTILANGUAGE.md` §3.4 |
| 48–49 (B1) | Comparative and superlative forms for adjectives (with irregular *migliore / meglio*, *ottimo*) |
| All B1 | **Vocabulary growth to ~2,000 word families** (about 1,500 new): frequency-ranked verbs, nouns and adjectives, plus topic sets (housing, work, feelings, cooking, news, health). Track it with the Progress tab's word-family count |
| 49–51, 57–58, 64, 72–76 (B1) | **Reading steps inside lessons:** a passage followed by comprehension checks. This works today with `text` + `check` steps, but a `reading` step type (passage with 🔊 and word glosses on tap) would be better. Pick passages at ≥ 95% coverage for the target learner using the Progress coverage function |
| 56, 59, 65, 71, 73–74, 77 (B1) | **A `task` step:** a writing or speaking prompt, the learner's own answer (typed, kept only in the browser), then a model answer and a self-check list. Ungraded: free writing can't be marked automatically |
| 51, 55, 60–64 (B1) | **Two new drills:** a *transformation* drill (rewrite a sentence: replace objects with pronouns, change the tense) and a *mood-choice* drill (indicative or subjunctive, imperfect or passato prossimo, *che* or *cui*). Both are multiple choice over authored items |
| 76 (B1) | More readings, graded to B1, including one or two passages in the passato remoto |
| B1 listening | The **Listen** setting from the Progress-metrics plan (hear a sentence, then pick its meaning or build it without seeing the text), so B1 dialogues can be practised by ear |
