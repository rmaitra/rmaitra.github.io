# Italiano Studio — Lesson Plan

The planned curriculum for the **Lessons** tab. It continues from lessons 1–6, which are already in `data/italian.json` → `lessons`. The lesson format (step types, dialogues, role-play, `practice` ids) is documented in `DESIGN.md` §3.0 and §4. This file covers *what* to teach, and in what order.

Levels follow the CEFR scale: lessons 1–33 (Units 1–4) are roughly **A1** (the basics) and 34–45 (Units 5–6) roughly **A2** (everyday independence).

---

## How to write a lesson

Keep the conventions set by lessons 1–6:

- **Size:** 6–10 new words or phrases, 20–30 steps, about 35–45 Next presses. Split a lesson that grows past that.
- **Shape:** 2–4 sections, each with a heading, then words, examples and a quick check. End with an "In conversation" section: one dialogue with a `practice` role-play, and optionally a second one, often the polite/*Lei* version of the first.
- **Teach phrases before grammar.** Teach useful phrases as whole units first (*vorrei*, *mi piace*, *mi alzo*) and explain the rule in a later lesson. Point back when that happens ("Remember *mi chiamo* from lesson 2? Now you know why.").
- **Dialogues use only taught words**, plus at most one or two new context words, glossed in the text step before the dialogue (as lesson 4 does with *la stazione*). Reuse vocabulary from earlier lessons on purpose.
- **Write `wrong` distractors by hand** and aim them at the lesson's key contrast (*ha/hai*, *stanco/stanca*, *c'è/ci sono*, *è andato/ha andato*). One distractor should be tempting; the other should be clearly wrong.
- **Quick checks are ungraded**, so use them for the mistakes English speakers typically make, and always fill in `why`.
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

### 7. *Ripasso 1* — Review: meeting someone new
- **Goals:** Hold a whole first conversation, from greeting to goodbye, with the right register.
- **Content:** Checks that mix lessons 1–6: choosing the register (*tu*/*Lei* forms side by side), *essere* vs *stare* vs *avere* (*sono stanco*, *sto bene*, *ho vent'anni*), matching questions to answers.
- **Dialogue:** A long one at a language exchange. Two people greet, introduce themselves, give where they're from, nationality, age and how they are, then say goodbye. Role-play as either speaker. Add a polite version with an older host.
- **Links:** `q:q1`, `q:q2`, `q:q5`, `q:q11`, `s:s134`–`s:s151`.

---

## Unit 2 — Things, places and numbers

### 8. *Al bar* — Ordering at a café
- **Goals:** Order food and drink, ask the price, pay.
- **Teach:** *Vorrei…* (as a phrase; the grammar comes in lesson 29), *un caffè / un cappuccino / un cornetto / un'acqua*, *per me…*, *Quanto costa? / Quant'è?*, *il conto*, *lo scontrino*, *euro*, *Prego?* (what can I get you?), *Altro? — No, basta così.*
- **Notes:** Culture: at many bars you pay at the *cassa* first and hand the *scontrino* to the barista. Cappuccino is a morning drink. *Un caffè* means an espresso. Standing at the counter costs less than sitting.
- **Checks:** *vorrei* vs *voglio* (the polite one); *un* vs *una* in front of the items (preview of lesson 9); prices using 1–20.
- **Dialogue:** Morning bar: order a cappuccino and a cornetto, ask the price, pay. Role-play as the customer. A second dialogue has two friends ordering *per me… / e per te?*
- **Links:** `s:s30`, `s:s33`, `s:s44`, `s:s96`, `s:s103`, `s:s104`, `s:s144`, `q:q12`, `n:caffè`, `n:scontrino`.
- **New data:** Nouns *cappuccino, cornetto, tè, succo, panino, euro*. Sentences *Quant'è?*, *Altro? No, basta così.*

### 9. *Il, la, lo* — Gender and articles
- **Goals:** Guess a noun's gender from its ending and choose *il / lo / la / l'* and *un / uno / una / un'*.
- **Teach:** -o usually masculine, -a usually feminine, -e either. The article rules (the Nouns tab's `ARTICLE_RULE` text is the reference): *lo / uno* before z, s + consonant, gn, ps; *l'* before vowels; *un'* only for feminine nouns.
- **Notes:** Learn every noun together with its article. Exceptions worth knowing: *la mano*, *il problema*.
- **Checks:** *lo zaino* vs *il zaino*, *un'amica* vs *un amico*, *l'acqua*.
- **Dialogue:** Packing for a trip: "*Hai lo zaino? — Sì, e il telefono.*" Role-play as the one checking the list.
- **Links:** Nouns tab items such as `n:zaino`, `n:studente`, `n:amica`, `n:amico`, `n:acqua`, `n:mano`, `n:problema`, `n:sport`, `n:psicologo`.

### 10. *Tanti!* — Plurals
- **Goals:** Make nouns and articles plural.
- **Teach:** -o → -i, -a → -e, -e → -i; *il → i*, *lo / l' (m) → gli*, *la / l' (f) → le*. Nouns that don't change: *il caffè → i caffè*, *la città → le città*, *lo sport → gli sport*.
- **Checks:** *gli amici* vs *i amici*; *le case*; *due caffè*, not *due caffèi*.
- **Dialogue:** Ordering at a bar for a group: "*Tre caffè e due cornetti, per favore.*" Reuses lesson 8.
- **Links:** Noun plurals are already in the data (the `plural` field). New sentences where needed.

### 11. *La mia famiglia* — Family and *avere*
- **Goals:** Describe your family; use every form of *avere*; use possessives.
- **Teach:** All of *avere* (*ho, hai, ha, abbiamo, avete, hanno*); *padre, madre, fratello, sorella, figlio/figlia, genitori, nonno/nonna*; *mio / mia / miei / mie*, *tuo / tua*.
- **Notes:** No article with a singular family member (*mia madre*), but keep it in the plural (*i miei fratelli*) and with *la mia famiglia*. The *h* in the forms of *avere* is silent (from lesson 6).
- **Checks:** *mia madre* vs *la mia madre*; *hanno* vs *sono* for age; *mio fratello* vs *mia fratello*.
- **Dialogue:** Looking at a photo: "*Chi è? — È mia sorella. Ha dodici anni.*" Role-play as the photo's owner.
- **Links:** `v:avere:present:*`, `s:s2`, `s:s5`, `s:s12`, `q:q6`, `n:padre`, `n:madre`, `n:fratello`, `n:sorella`, `n:figlio`, `n:famiglia`.
- **New data:** Nouns *genitori, nonno, nonna, figlia*.

### 12. *Com'è?* — Describing with adjectives
- **Goals:** Describe people and things with adjectives that agree.
- **Teach:** Four endings for -o adjectives, two for -e adjectives; adjectives usually go *after* the noun (*una casa grande*); *molto*; *essere* + adjective. This is the first lesson to use the `adjectives` data.
- **Notes:** A few adjectives come first and change meaning with position (*un grande uomo*); mention that only. *Bello* changes like the article (*un bel libro*): mention it, don't drill it.
- **Checks:** *le case piccole*, *i ragazzi simpatici*, *una ragazza alta*.
- **Dialogue:** Describing a new flatmate or a new town to a friend. Role-play as the one describing.
- **Links:** Adjectives (they have no SRS ids yet); `s:s6`, `s:s16`, `s:s21`, `s:s9`.
- **New data:** An adjective-agreement exercise would give adjectives SRS ids (on DESIGN.md's future list). Until then, use sentences.

### 13. *Fino a cento* — Numbers to 100, prices
- **Goals:** Count to 100, read prices and phone numbers.
- **Teach:** Tens (*trenta … cento*); the vowel drop (*ventuno, ventotto*); the accent on *-tré* (*ventitré*); prices (*tre euro e cinquanta*).
- **Checks:** *ventotto* vs *ventiotto*; *quarantatré*.
- **Dialogue:** At a market stall, asking the price of several things. Role-play as the buyer.
- **Links:** `#:20`–`#:100`.
- **New data:** Numbers 21–99 in `numbers` (the Numbers tab would then drill them too).

### 14. *Che ore sono?* — Telling the time
- **Goals:** Tell the time and say when things happen.
- **Teach:** *Che ore sono? / Che ora è?*; *Sono le tre*, *È l'una*, *mezzogiorno / mezzanotte*; *e un quarto, e mezza, meno un quarto*; *A che ora…? — Alle otto.*
- **Notes:** Timetables use the 24-hour clock (*le venti e trenta*).
- **Checks:** *è l'una* vs *sono le una*; *alle* vs *a le*.
- **Dialogue:** Planning to meet: "*A che ora parte il treno? — Alle nove e mezza.*" Role-play as the one asking.
- **Links:** `q:q8`, `q:q10`, `s:s18`, `n:ora`, `n:orologio`.

### 15. *Oggi, domani* — Days, months, dates
- **Goals:** Talk about days, dates and when things happen.
- **Teach:** Days of the week (lower case, *il lunedì* = on Mondays), months, *oggi / domani / ieri / stasera*, *il fine settimana*, dates (*il primo maggio*, *il tre giugno*), *Quanti ne abbiamo oggi?*
- **Checks:** *lunedì* vs *il lunedì*; *il primo* vs *il uno*.
- **Dialogue:** Booking a dinner: which day, what time. Combines lessons 13 and 14.
- **New data:** A `time` topic with days and months (a list in the data, or nouns).

### 16. *Ripasso 2* — Review: a day out
- **Content:** Checks that mix articles, plurals, *avere*, adjectives, numbers and time.
- **Dialogue:** A longer one: meeting a friend at a bar at a set time, ordering for two, talking about family, paying.

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
| 8, 10, 11, 31 | New nouns (drinks and snacks, family, shopping, clothes) |
| 13 | Numbers 21–99 in `numbers` |
| 15 | Days and months (a new topic or list) |
| 12, 31 | An adjective-agreement exercise, so adjectives get SRS ids |
| 17–19, 28, 30, 35 | New verbs: *studiare, dormire, partire, aprire, preferire, conoscere, arrivare, tornare*, and reflexive verbs, all with full tense tables |
| 27 | A combined-preposition table (a `list` step is enough) |
| All | New sentences for each lesson (`topic` set, next free ids) so its `practice` list has Sentences-tab items |
| Optional | A tile-builder role-play mode (typing or building the line instead of picking it) for lessons from Unit 3 on, once learners know enough words |
