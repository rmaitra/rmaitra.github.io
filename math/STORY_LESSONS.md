# Kosmos: A Mathematical Voyage — story lessons (curriculum)

The proposed lessons for the **Stories** tab. The format (story arc, block types, data model) is in [`STORIES.md`](STORIES.md). This file covers *what* each lesson teaches and *where the history comes from*.

Status: **proposal**. Nothing is built.

---

## Ground rules for the history

Every lesson is built on real, checkable sources:

- **Primary source first.** Each lesson names the publication, tablet or papyrus where the mathematics actually appears, with its date and (where one exists) a standard English translation. Quotations are taken only from **public-domain** translations (marked *PD*). Copyrighted translations are cited for facts and paraphrased.
- **Secondary sources** are Wikipedia articles and [MacTutor](https://mathshistory.st-andrews.ac.uk/) biographies (University of St Andrews). A few scholarly papers or books are cited where Wikipedia is thin or the popular story is wrong.
- **Original numbers.** In-story problems use the numbers from the source where the source has them. Where they are invented for teaching, the lesson says so.
- **Legend or history?** Anecdotes that come from much later writers are labelled as such in the lesson, with who first told them. Examples: Thales' shadow, Hippasus drowned at sea, Archimedes' *Eureka*, Descartes' fly, young Gauss adding 1 to 100, Lilavati as a daughter's name.
- **Dates** use "c." where uncertain. Where scholars disagree (the stadion's length, the Bakhshali manuscript's age), the lesson gives the range and does not pick a side.
- **Links** in this file were checked to resolve on 2026-09-28.

**Format of each entry.** *People* · *Topics* (what the lesson teaches) · *In-story problem* · *Echoes today* (applications) · *Legend check* (where needed) · *Practice* (existing Algebra or Arithmetic practice topic, or *roadmap*) · *Sources*.

Lessons are in chronological order within six Acts. Physics lessons are marked *(physics)*: each one pairs a physical law with the maths it needs, and links back to the lesson where that maths was taught. Each Act ends with a **Crossroads** review lesson. Crossroads stories are fictional scenarios, clearly labelled as such, set against real historical settings.

---

## Act I — Ancient worlds (c. 1800 BCE – 415 CE)

### 1. Counting in sixties — Babylon, c. 1800–1600 BCE
- **People:** anonymous scribes of the Old Babylonian period.
- **Topics:**
  - Base-60 (sexagesimal) place value; why there was no true zero yet (a placeholder appears only much later).
  - Reading cuneiform numerals: wedges for 1 and 10.
  - Reciprocal tables: how scribes divided by multiplying.
  - The tablet YBC 7289: a square with side 30 and its diagonal, giving √2 ≈ 1;24,51,10 = 1.41421296…
  - The averaging method for square roots (later written down by Heron). The lesson explains that the Babylonian procedure is reconstructed, not stated on the tablet.
- **In-story problem:** convert 1;24,51,10 to decimal; check that side 30 × √2 gives the tablet's 42;25,35; run two rounds of averaging for √2 starting from 1½.
- **Echoes today:** 60 minutes, 60 seconds, 360°; binary and hexadecimal in computers; how a calculator finds square roots (Newton's method is the same averaging idea).
- **Practice:** Arithmetic · Exponents & Roots.
- **Sources:**
  - Fowler, D. & Robson, E. (1998). "Square Root Approximations in Old Babylonian Mathematics: YBC 7289 in Context." *Historia Mathematica* 25(4), 366–378.
  - Wikipedia: [YBC 7289](https://en.wikipedia.org/wiki/YBC_7289) · [Sexagesimal](https://en.wikipedia.org/wiki/Sexagesimal) · [Babylonian mathematics](https://en.wikipedia.org/wiki/Babylonian_mathematics) · [Heron's method](https://en.wikipedia.org/wiki/Methods_of_computing_square_roots#Heron's_method)

### 2. The scribe Ahmes — Thebes, c. 1550 BCE
- **People:** Ahmes, who copied the papyrus from an older text of about 1850–1800 BCE (reign of Amenemhat III).
- **Topics:**
  - The Rhind Mathematical Papyrus (British Museum): a teaching book of worked problems.
  - Egyptian unit fractions (every fraction written as a sum of different 1/n), and the "2/n table".
  - Multiplication by doubling.
  - The method of **false position**: guess, see how far off you are, scale.
  - Problem 50: the area of a circle of diameter 9 taken as a square of side 8, which implies π ≈ 256/81 ≈ 3.16.
- **In-story problem:** Problems 1–6: share loaves among 10 men (7 loaves → each gets ⅔ + 1/30). Problem 24: "a quantity and its 1/7 added together become 19" (answer 16 + ½ + ⅛).
- **Echoes today:** splitting a bill or an inheritance fairly; scaling a recipe; false position is the ancestor of the "secant method" computers use to solve equations.
- **Meanwhile:** the Moscow Mathematical Papyrus, Problem 14: the volume of a truncated pyramid (frustum).
- **Practice:** Arithmetic · Fractions.
- **Sources:**
  - Chace, A. B. (1927–29). *The Rhind Mathematical Papyrus*. Mathematical Association of America. Robins, G. & Shute, C. (1987). *The Rhind Mathematical Papyrus: An Ancient Egyptian Text*. British Museum Press.
  - Wikipedia: [Rhind Mathematical Papyrus](https://en.wikipedia.org/wiki/Rhind_Mathematical_Papyrus) · [Egyptian fraction](https://en.wikipedia.org/wiki/Egyptian_fraction) · [Ancient Egyptian multiplication](https://en.wikipedia.org/wiki/Ancient_Egyptian_multiplication) · [Regula falsi](https://en.wikipedia.org/wiki/Regula_falsi) · [Moscow Mathematical Papyrus](https://en.wikipedia.org/wiki/Moscow_Mathematical_Papyrus)
  - MacTutor: [Ahmes](https://mathshistory.st-andrews.ac.uk/Biographies/Ahmes/)

### 3. A pyramid's shadow — Miletus and Giza, c. 600 BCE
- **People:** Thales of Miletus (c. 624 – c. 546 BCE).
- **Topics:**
  - Similar triangles and proportion: the same Sun makes every shadow in the same ratio to its object's height.
  - Thales' theorem: an angle inscribed in a semicircle is a right angle.
  - Why Thales is called the first to *prove* things, even though none of his writings survive.
- **In-story problem:** a staff 2 cubits tall casts a 3-cubit shadow while the pyramid's shadow reaches 180 cubits from its centre; how tall is the pyramid? (Teaching numbers.)
- **Echoes today:** measuring a tree or building with a stick; map and model scales; how a camera or the eye projects an image.
- **Legend check:** the shadow story comes from Diogenes Laërtius (3rd c. CE, quoting Hieronymus) and Plutarch, centuries after Thales' death.
- **Practice:** Arithmetic · Ratios & Proportions.
- **Sources:**
  - Diogenes Laërtius, *Lives of Eminent Philosophers* I.27; Plutarch, *Dinner of the Seven Wise Men* 147A.
  - Wikipedia: [Thales of Miletus](https://en.wikipedia.org/wiki/Thales_of_Miletus) · [Thales's theorem](https://en.wikipedia.org/wiki/Thales%27s_theorem) · [Intercept theorem](https://en.wikipedia.org/wiki/Intercept_theorem)
  - MacTutor: [Thales](https://mathshistory.st-andrews.ac.uk/Biographies/Thales/)

### 4. All is number — Croton, c. 530 BCE (and far older Babylon)
- **People:** Pythagoras and the Pythagoreans; anonymous Babylonian scribes (Plimpton 322); Baudhāyana (Śulba Sūtras).
- **Topics:**
  - The Pythagorean theorem, proved by rearranging four copies of a right triangle.
  - Pythagorean triples: Plimpton 322 (c. 1800 BCE, Columbia University) lists them over a thousand years before Pythagoras.
  - The same result in India's *Śulba Sūtras* (rules for building altars) and China's *Zhoubi Suanjing* (the *gougu* theorem).
  - √2 is irrational: the proof by contradiction.
  - Pythagoras left no writings; the first surviving proof is Euclid I.47 (lesson 5).
- **In-story problem:** is a rope triangle of 3, 4 and 5 knots square? Find the diagonal of a 30 × 40 courtyard. Complete the √2 proof by choosing the reason for each step.
- **Echoes today:** builders' 3-4-5 check for square corners; screen sizes are diagonals; ladder safety (the 4-to-1 rule); distance between two points on a map or in a game.
- **Legend check:** Hippasus being drowned for revealing irrational numbers comes from much later writers (Iamblichus, c. 300 CE).
- **Practice:** Geometry · Triangles *(roadmap)*.
- **Sources:**
  - Robson, E. (2001). "Neither Sherlock Holmes nor Babylon: A Reassessment of Plimpton 322." *Historia Mathematica* 28(3), 167–206.
  - Wikipedia: [Pythagorean theorem](https://en.wikipedia.org/wiki/Pythagorean_theorem) · [Plimpton 322](https://en.wikipedia.org/wiki/Plimpton_322) · [Pythagorean triple](https://en.wikipedia.org/wiki/Pythagorean_triple) · [Square root of 2](https://en.wikipedia.org/wiki/Square_root_of_2) · [Hippasus](https://en.wikipedia.org/wiki/Hippasus) · [Shulba Sutras](https://en.wikipedia.org/wiki/Shulba_Sutras) · [Zhoubi Suanjing](https://en.wikipedia.org/wiki/Zhoubi_Suanjing)
  - MacTutor: [Pythagoras](https://mathshistory.st-andrews.ac.uk/Biographies/Pythagoras/)

### 5. The Elements — Alexandria, c. 300 BCE
- **People:** Euclid.
- **Topics:**
  - Definitions, postulates and proof: building everything from five postulates. The parallel postulate is a cliffhanger resolved in the 1800s by non-Euclidean geometry.
  - Book I, Prop. 47: Euclid's proof of Pythagoras.
  - Book VII, Props. 1–2: the **Euclidean algorithm** for the greatest common divisor, the oldest algorithm still in daily use.
  - Book IX, Prop. 20: there are infinitely many primes.
  - Visual interlude: Oliver Byrne's 1847 coloured edition.
- **In-story problem:** two ropes of 1071 and 462 cubits: what is the longest measuring rod that fits each exactly? (GCD = 21.) Supply the missing reason in the primes proof.
- **Echoes today:** reducing fractions and ratios; gear teeth; RSA encryption runs on primes and the extended Euclidean algorithm; tiling a floor with the largest square tile.
- **Practice:** Arithmetic · Fractions (lowest terms), Ratios.
- **Sources:**
  - Euclid, *Elements*, tr. T. L. Heath (1908), *The Thirteen Books of Euclid's Elements* (*PD*). D. E. Joyce's online edition: [Euclid's Elements (Clark University)](https://mathcs.clarku.edu/~djoyce/java/elements/elements.html).
  - Wikipedia: [Euclid's Elements](https://en.wikipedia.org/wiki/Euclid%27s_Elements) · [Euclidean algorithm](https://en.wikipedia.org/wiki/Euclidean_algorithm) · [Euclid's theorem](https://en.wikipedia.org/wiki/Euclid%27s_theorem) · [Oliver Byrne](https://en.wikipedia.org/wiki/Oliver_Byrne_(mathematician))
  - MacTutor: [Euclid](https://mathshistory.st-andrews.ac.uk/Biographies/Euclid/)

### 6. Squeezing π — Syracuse, c. 250 BCE
- **People:** Archimedes (c. 287 – 212 BCE).
- **Topics:**
  - *Measurement of a Circle*: inscribed and circumscribed polygons from 6 to 96 sides give 3 10/71 < π < 3 1/7.
  - Area of a circle = ½ × circumference × radius.
  - *On the Sphere and Cylinder*: a sphere has ⅔ the volume and surface of its enclosing cylinder, the result he wanted on his tomb (Cicero found the tomb in 75 BCE).
  - The Archimedes Palimpsest: *The Method* was rediscovered under a prayer book in 1906.
- **In-story problem:** use the polygon widget to double the sides and watch the bounds close in; check that 22/7 and 223/71 bracket 3.1416.
- **Echoes today:** how a bike computer turns wheel turns into distance; is one 18″ pizza bigger than two 12″ pizzas?; pipe cross-sections and flow.
- **Legend check:** the *Eureka* bath comes from Vitruvius (1st c. BCE), about two centuries later; "do not disturb my circles" comes from later retellings of his death, which Plutarch describes in several versions.
- **Practice:** Geometry · Circles *(roadmap)*.
- **Sources:**
  - Archimedes, *Measurement of a Circle*, in T. L. Heath (1897), *The Works of Archimedes* (*PD*). Cicero, *Tusculan Disputations* V.64–66.
  - Wikipedia: [Archimedes](https://en.wikipedia.org/wiki/Archimedes) · [Measurement of a Circle](https://en.wikipedia.org/wiki/Measurement_of_a_Circle) · [On the Sphere and Cylinder](https://en.wikipedia.org/wiki/On_the_Sphere_and_Cylinder) · [Archimedes Palimpsest](https://en.wikipedia.org/wiki/Archimedes_Palimpsest)
  - MacTutor: [Archimedes](https://mathshistory.st-andrews.ac.uk/Biographies/Archimedes/)

### 7. The lever and the crown *(physics)* — Syracuse, c. 250 BCE
- **People:** Archimedes; King Hiero II of Syracuse.
- **Physics:**
  - The law of the lever (*On the Equilibrium of Planes*, Book I, Props. 6–7): weights balance at distances inversely proportional to the weights.
  - Centre of gravity.
  - Buoyancy (*On Floating Bodies*, Book I): a body in a fluid is pushed up by the weight of the fluid it displaces.
- **Maths it uses:** inverse proportion; weighted averages (the centre of mass is one); density as a ratio of mass to volume.
- **In-story problem:** a 30 kg stone sits 2 m from the pivot: what weight at 0.5 m balances it (120 kg)? A 1 kg "gold" crown displaces 60 cm³ of water, but pure gold (19.3 g/cm³) would displace 51.8 cm³. Is it pure? (Teaching numbers.)
- **Echoes today:** seesaws, wrenches (why a longer handle loosens a stuck bolt), wheelbarrows and crowbars; why steel ships float and how the load line on their hull works; measuring body fat by weighing under water.
- **Legend check:** the *Eureka* bath comes from Vitruvius (*De architectura* IX), about two centuries later. In *La Bilancetta* (1586), the young Galileo argued that the water-displacement method as told could not work, and proposed a balance method instead. "Give me a place to stand and I will move the Earth" is reported by Pappus of Alexandria (c. 340 CE). Plutarch (*Life of Marcellus*) says Archimedes moved a loaded ship single-handed with pulleys.
- **Practice:** Physics · Forces *(roadmap)*; Arithmetic · Ratios & Proportions.
- **Sources:**
  - Heath, T. L. (1897). *The Works of Archimedes*: *On the Equilibrium of Planes*, *On Floating Bodies* (*PD*). Galileo, G. (1586). *La Bilancetta*.
  - Wikipedia: [Lever](https://en.wikipedia.org/wiki/Lever) · [Archimedes' principle](https://en.wikipedia.org/wiki/Archimedes%27_principle) · [On Floating Bodies](https://en.wikipedia.org/wiki/On_Floating_Bodies) · [Mechanical advantage](https://en.wikipedia.org/wiki/Mechanical_advantage) · [Hydrostatic weighing](https://en.wikipedia.org/wiki/Hydrostatic_weighing)
  - MacTutor: [Archimedes](https://mathshistory.st-andrews.ac.uk/Biographies/Archimedes/)

### 8. Measuring the Earth — Alexandria and Syene, c. 240 BCE ✅ *(built)*
- **People:** Eratosthenes of Cyrene (c. 276 – c. 194 BCE), head of the Library of Alexandria.
- **Topics:**
  - Angles as fractions of a full turn.
  - Parallel sun rays and alternate angles.
  - Proportion: 7.2° is 1/50 of a circle, so the Earth's circumference is 50 × 5,000 stadia = 250,000 stadia.
  - Error and uncertainty: the length of a stadion is not known. With a 155–160 m stade his 252,000 stades is within about 2.4% of the true value; with the Olympic or Italian stade (176–185 m) it is 10–15% too big.
  - The Sieve of Eratosthenes for listing primes.
- **In-story problem:** from the noon shadow angle and the distance, compute the circumference. Then repeat it with modern figures (Alexandria to Aswan ≈ 800 km) and compare with 40,075 km.
- **Echoes today:** GPS and geodesy; finding your latitude from the Sun's angle (celestial navigation); prime sieves in computing.
- **Legend check:** Eratosthenes' own book is lost. The method comes to us through Cleomedes (c. 1st–2nd c. CE), who simplified the numbers.
- **Practice:** Arithmetic · Ratios & Proportions, Percentages (percent error).
- **Sources:**
  - Cleomedes, *On the Circular Motions of the Celestial Bodies* I.7. Tr. Bowen, A. C. & Todd, R. B. (2004), *Cleomedes' Lectures on Astronomy*. University of California Press.
  - Wikipedia: [Eratosthenes](https://en.wikipedia.org/wiki/Eratosthenes) · [Earth's circumference](https://en.wikipedia.org/wiki/Earth%27s_circumference) · [Stadion (unit)](https://en.wikipedia.org/wiki/Stadion_(unit)) · [Sieve of Eratosthenes](https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes)
  - MacTutor: [Eratosthenes](https://mathshistory.st-andrews.ac.uk/Biographies/Eratosthenes/)

### 9. Cutting the cone — Perga, c. 200 BCE, to Alexandria, 415 CE
- **People:** Apollonius of Perga; Diocles; Hypatia of Alexandria (c. 360s – 415 CE).
- **Topics:**
  - *Conics* (8 books; books V–VII survive only in Arabic translation): ellipse, parabola and hyperbola as slices of a cone. Apollonius gave them these names.
  - The parabola's focus: Diocles' *On Burning Mirrors* proves that a parabolic mirror sends light to one point.
  - Epilogue: Hypatia, teacher and editor of mathematical texts (a commentary on Apollonius is attributed to her), killed by a mob in 415. The lesson is honest about how little of her own work is known.
- **In-story problem:** classify the curve from the angle of the cutting plane; locate the focus of a parabolic mirror y = x²/8.
- **Echoes today:** satellite dishes and solar cookers, car headlights, telescope mirrors.
- **Legend check:** Archimedes burning Roman ships with mirrors is a late legend (first told centuries later); experiments have not supported it.
- **Practice:** Algebra · Conic Sections.
- **Sources:**
  - Apollonius, *Conics*, tr. T. L. Heath (1896), *Treatise on Conic Sections* (*PD*). Toomer, G. J. (1976), *Diocles: On Burning Mirrors*. Springer.
  - Wikipedia: [Apollonius of Perga](https://en.wikipedia.org/wiki/Apollonius_of_Perga) · [Conic section](https://en.wikipedia.org/wiki/Conic_section) · [Diocles (mathematician)](https://en.wikipedia.org/wiki/Diocles_(mathematician)) · [Hypatia](https://en.wikipedia.org/wiki/Hypatia)
  - MacTutor: [Apollonius](https://mathshistory.st-andrews.ac.uk/Biographies/Apollonius/) · [Hypatia](https://mathshistory.st-andrews.ac.uk/Biographies/Hypatia/)

### 10. The Nine Chapters — Han China, c. 1st century CE; Liu Hui, 263 CE
- **People:** anonymous compilers; Liu Hui (commentary, 263); Zu Chongzhi (5th c.).
- **Topics:**
  - *Jiuzhang suanshu*: 246 practical problems on fields, grain, taxes and construction.
  - Chapter 8, *fangcheng*: solving systems of linear equations on a counting board by column elimination, the same method Europe later called Gaussian elimination.
  - Negative numbers: red and black counting rods, with rules for adding and subtracting them.
  - Liu Hui's polygon method for π (π ≈ 3.14, refined to 3.1416); Zu Chongzhi's 355/113.
- **In-story problem:** Chapter 8, Problem 1: 3 bundles of top-grade grain, 2 medium and 1 low yield 39 *dou*; 2, 3, 1 yield 34; 1, 2, 3 yield 26. Solve on the rod board: 9¼, 4¼ and 2¾ *dou* per bundle.
- **Echoes today:** mixing and nutrition problems, budgets; circuit analysis (Kirchhoff's laws give linear systems); every 3D game solves linear systems.
- **Practice:** Algebra · Systems of Equations (3×3); Arithmetic · Integers.
- **Sources:**
  - Shen Kangshen, Crossley, J. N. & Lun, A. W.-C. (1999). *The Nine Chapters on the Mathematical Art: Companion and Commentary*. Oxford University Press.
  - Wikipedia: [The Nine Chapters on the Mathematical Art](https://en.wikipedia.org/wiki/The_Nine_Chapters_on_the_Mathematical_Art) · [Counting rods](https://en.wikipedia.org/wiki/Counting_rods) · [Gaussian elimination (History)](https://en.wikipedia.org/wiki/Gaussian_elimination#History) · [Liu Hui](https://en.wikipedia.org/wiki/Liu_Hui) · [Zu Chongzhi](https://en.wikipedia.org/wiki/Zu_Chongzhi)
  - MacTutor: [Liu Hui](https://mathshistory.st-andrews.ac.uk/Biographies/Liu_Hui/)

### 11. The shortest path of light *(physics)* — Alexandria, c. 60 CE
- **People:** Hero (Heron) of Alexandria.
- **Physics:**
  - The law of reflection (angle in = angle out).
  - Hero's *Catoptrics*: reflected light takes the **shortest path** between two points, the first "least" principle in physics (lesson 31 continues it).
  - Aside: his aeolipile (a steam-spun ball) and his automata.
- **Maths it uses:**
  - The mirror-image trick: reflect one point, and the shortest path becomes a straight line.
  - Heron's formula for a triangle's area from its three sides (*Metrica* I.8).
  - Heron's square-root method (a link back to lesson 1).
- **In-story problem:** find where a ray from A must hit a mirror to reach B, and check it is the shortest route. Find the area of a 13-14-15 triangular field (84) with Heron's formula.
- **Echoes today:** bank shots in billiards and squash; periscopes and car mirrors; bike reflectors and road signs; surveying a field's area from three measured sides.
- **Legend check:** the aeolipile is often called the first steam engine, but it was a demonstration device with no practical use.
- **Practice:** Geometry · Triangles *(roadmap)*; Physics · Optics *(new topic)*.
- **Sources:**
  - Hero, *Catoptrica*; *Metrica* (rediscovered in a Constantinople manuscript in 1896).
  - Wikipedia: [Hero of Alexandria](https://en.wikipedia.org/wiki/Hero_of_Alexandria) · [Heron's formula](https://en.wikipedia.org/wiki/Heron%27s_formula) · [Specular reflection](https://en.wikipedia.org/wiki/Specular_reflection) · [Aeolipile](https://en.wikipedia.org/wiki/Aeolipile) · [Fermat's principle](https://en.wikipedia.org/wiki/Fermat%27s_principle)
  - MacTutor: [Heron](https://mathshistory.st-andrews.ac.uk/Biographies/Heron/)

### 12. Diophantus' riddle — Alexandria, c. 250 CE
- **People:** Diophantus of Alexandria.
- **Topics:**
  - *Arithmetica*: 6 books survive in Greek, and 4 more in Arabic were identified in the 1970s.
  - Syncopated algebra: the first abbreviations for an unknown and its powers, halfway between words and symbols.
  - Setting up an equation from words.
  - Diophantine equations (whole-number solutions).
  - Cliffhanger: Fermat's margin note in his copy of *Arithmetica* (1637) → Fermat's Last Theorem, proved by Andrew Wiles in 1995.
- **In-story problem:** the epitaph (childhood 1/6 of his life, a beard after 1/12 more, married after 1/7 more, a son 5 years later who lived half his father's age, then 4 more years) → 84.
- **Echoes today:** turning any word problem into an equation, e.g. comparing phone plans.
- **Legend check:** the epitaph is a puzzle in the *Greek Anthology* (compiled c. 500 CE, attributed to Metrodorus). It is not a biography.
- **Practice:** Arithmetic · Order of Operations *(a linear-equations type would fit better; see the note at the end)*.
- **Sources:**
  - Heath, T. L. (1910). *Diophantus of Alexandria: A Study in the History of Greek Algebra* (*PD*). *Greek Anthology* XIV.126.
  - Wikipedia: [Diophantus](https://en.wikipedia.org/wiki/Diophantus) · [Arithmetica](https://en.wikipedia.org/wiki/Arithmetica) · [Diophantine equation](https://en.wikipedia.org/wiki/Diophantine_equation) · [Fermat's Last Theorem](https://en.wikipedia.org/wiki/Fermat%27s_Last_Theorem)
  - MacTutor: [Diophantus](https://mathshistory.st-andrews.ac.uk/Biographies/Diophantus/)

### 13. Crossroads I — The grain ship *(review, fictional scenario)*
- **Setting:** a grain ship from Alexandria to Rome's port at Ostia (the real annual grain fleet).
- **Topics mixed:** unit fractions (sharing rations), proportion (distance by the Sun's angle), Pythagoras (a mast and its rigging), GCD (packing amphorae), a 3×3 system (cargo mix).
- **Sources:** Wikipedia: [Cura Annonae](https://en.wikipedia.org/wiki/Cura_Annonae) · [Ostia Antica](https://en.wikipedia.org/wiki/Ostia_Antica)

---

## Act II — India, the House of Wisdom and beyond (499 – 1450)

### 14. Chords become sines — Kusumapura, 499 CE
- **People:** Āryabhaṭa (476–550); background: Hipparchus (c. 190 – c. 120 BCE) and Ptolemy (c. 150 CE).
- **Topics:**
  - Trigonometry began as astronomy: Hipparchus' and Ptolemy's tables of **chords**.
  - The *Āryabhaṭīya* uses the **half-chord** (*jyā*): the modern sine. Its table has 24 values in steps of 3¾°.
  - Right-triangle trigonometry: SOH-CAH-TOA.
  - Where the word "sine" comes from: Sanskrit *jyā/jīvā* → Arabic *jība* → read as *jayb* ("fold" or "pocket") → Latin *sinus* (12th-century translators).
  - Āryabhaṭa's π ≈ 62832/20000 = 3.1416.
- **In-story problem:** a gnomon (upright stick) of 12 units casts a 9-unit shadow: find the Sun's altitude. Look up sin 30° in a reconstructed table.
- **Echoes today:** the slope of a roof or wheelchair ramp (1:12 ≈ 4.8°); surveying and range-finding; sound waves are sines (lead-in to Fourier, lesson 42).
- **Practice:** Trigonometry · Right-Triangle Trig *(roadmap)*.
- **Sources:**
  - Clark, W. E. (1930). *The Āryabhaṭīya of Āryabhaṭa* (English translation). University of Chicago Press. Ptolemy, *Almagest* I.10–11, tr. Toomer (1984).
  - Wikipedia: [Aryabhata](https://en.wikipedia.org/wiki/Aryabhata) · [Aryabhatiya](https://en.wikipedia.org/wiki/Aryabhatiya) · [History of trigonometry](https://en.wikipedia.org/wiki/History_of_trigonometry) · [Ptolemy's table of chords](https://en.wikipedia.org/wiki/Ptolemy%27s_table_of_chords) · [Āryabhaṭa's sine table](https://en.wikipedia.org/wiki/%C4%80ryabha%E1%B9%ADa%27s_sine_table)
  - MacTutor: [Aryabhata I](https://mathshistory.st-andrews.ac.uk/Biographies/Aryabhata_I/) · [Hipparchus](https://mathshistory.st-andrews.ac.uk/Biographies/Hipparchus/)

### 15. Nothing becomes a number — Bhillamāla (Bhinmal), 628 CE
- **People:** Brahmagupta (598 – c. 668).
- **Topics:**
  - The *Brāhmasphuṭasiddhānta*: the first written rules for zero as a number, and for "fortunes" (positive) and "debts" (negative).
  - A debt minus zero is a debt; a debt times a debt is a fortune.
  - Where he went wrong: he defined 0/0 = 0. The lesson explains why modern mathematics leaves it undefined.
  - Place-value decimal notation with zero spreads west (the Gwalior inscription of 876 has a dated zero).
- **In-story problem:** balance a merchant's ledger of fortunes and debts; evaluate expressions like (−3) × (−4) − 0 with Brahmagupta's rules.
- **Echoes today:** bank balances and overdrafts ("in the red"); temperatures below zero; elevations below sea level; golf scores.
- **Meanwhile:** the Maya developed an independent zero for their calendar; the Bakhshali manuscript's dot-zero (its dating is disputed).
- **Practice:** Arithmetic · Integers.
- **Sources:**
  - Colebrooke, H. T. (1817). *Algebra, with Arithmetic and Mensuration, from the Sanscrit of Brahmegupta and Bháscara* (*PD*).
  - Wikipedia: [Brahmagupta](https://en.wikipedia.org/wiki/Brahmagupta) · [Brāhmasphuṭasiddhānta](https://en.wikipedia.org/wiki/Br%C4%81hmasphu%E1%B9%ADasiddh%C4%81nta) · [0 (number)](https://en.wikipedia.org/wiki/0) · [Negative number](https://en.wikipedia.org/wiki/Negative_number) · [Maya numerals](https://en.wikipedia.org/wiki/Maya_numerals) · [Bakhshali manuscript](https://en.wikipedia.org/wiki/Bakhshali_manuscript)
  - MacTutor: [Brahmagupta](https://mathshistory.st-andrews.ac.uk/Biographies/Brahmagupta/)

### 16. Restoring and balancing — Baghdad, c. 820 CE ✅ *(built)*
- **People:** Muḥammad ibn Mūsā al-Khwārizmī (c. 780 – c. 850), at the House of Wisdom.
- **Topics:**
  - *The Compendious Book on Calculation by Completion and Balancing*: *al-jabr* (moving a subtracted term to the other side) and *al-muqābala* (cancelling like terms). The word *algebra* comes from *al-jabr*.
  - Algebra entirely in words: his six standard forms of equation.
  - **Completing the square** as a literal picture.
  - He accepted only positive roots. Why?
  - His book on Hindu numerals, translated into Latin as *Algoritmi de numero Indorum* → the word *algorithm*.
- **In-story problem:** his own example, "a square and ten roots equal thirty-nine dirhams": x² + 10x = 39 → x = 3. Then x² + 21 = 10x (both roots, 3 and 7), his example of a form with two positive answers.
- **Echoes today:** a picture frame with an even border; the height of a thrown ball (a quadratic); sizing a garden of a given area; every algorithm in software.
- **Practice:** Algebra · Polynomial Operations (Factor Trinomials).
- **Sources:**
  - Rosen, F. (1831). *The Algebra of Mohammed ben Musa* (*PD*).
  - Wikipedia: [Al-Khwarizmi](https://en.wikipedia.org/wiki/Al-Khwarizmi) · [The Compendious Book on Calculation by Completion and Balancing](https://en.wikipedia.org/wiki/The_Compendious_Book_on_Calculation_by_Completion_and_Balancing) · [Completing the square](https://en.wikipedia.org/wiki/Completing_the_square) · [House of Wisdom](https://en.wikipedia.org/wiki/House_of_Wisdom) · [Algorithm (Etymology)](https://en.wikipedia.org/wiki/Algorithm#Etymology)
  - MacTutor: [Al-Khwarizmi](https://mathshistory.st-andrews.ac.uk/Biographies/Al-Khwarizmi/)

### 17. The Book of Optics *(physics)* — Cairo, c. 1011–1021
- **People:** Ibn al-Haytham, "Alhazen" (c. 965 – c. 1040).
- **Physics:**
  - *Kitāb al-Manāẓir* (*Book of Optics*): light travels in straight lines from objects into the eye. This overturned the older idea (Euclid, Ptolemy) that the eye sends out rays.
  - The camera obscura (pinhole camera).
  - Reflection from curved mirrors.
  - Controlled, repeatable experiments as the test of a theory.
- **Maths it uses:** similar triangles (a link back to Thales, lesson 3): image size ÷ object size = box depth ÷ distance. Angles of reflection. "Alhazen's problem" (where on a curved mirror a ray must reflect), which he solved with conic sections.
- **In-story problem:** a 30 m minaret 200 m away shines through a pinhole into a room 5 m deep: how tall is the upside-down image (0.75 m)? A pinhole 1 m from a card during an eclipse: how big is the Sun's image (≈ 9 mm, from its 0.53° width)?
- **Echoes today:** every camera and phone lens; pinhole eclipse viewers; the eye; the habit of testing an idea by experiment.
- **Legend check:** the story that he faked madness to escape a failed commission from Caliph al-Hakim to dam the Nile, and wrote the *Optics* under house arrest, comes from later biographers (e.g. Ibn al-Qifṭī, 13th c.).
- **Practice:** Arithmetic · Ratios & Proportions; Physics · Optics *(new topic)*.
- **Sources:**
  - Sabra, A. I. (1989). *The Optics of Ibn al-Haytham, Books I–III: On Direct Vision*. Warburg Institute.
  - Wikipedia: [Ibn al-Haytham](https://en.wikipedia.org/wiki/Ibn_al-Haytham) · [Book of Optics](https://en.wikipedia.org/wiki/Book_of_Optics) · [Camera obscura](https://en.wikipedia.org/wiki/Camera_obscura) · [Pinhole camera](https://en.wikipedia.org/wiki/Pinhole_camera) · [Alhazen's problem](https://en.wikipedia.org/wiki/Alhazen%27s_problem)
  - MacTutor: [Al-Haytham](https://mathshistory.st-andrews.ac.uk/Biographies/Al-Haytham/)

### 18. Cubics from cones — Isfahan, 1070s
- **People:** Omar Khayyam (1048–1131).
- **Topics:**
  - *Treatise on Demonstration of Problems of Algebra* (1070): a classification of cubic equations, solved by intersecting two conic sections.
  - Why cubics resisted the square-completing trick.
  - His admission that he could not find an arithmetic (formula) solution, left for later mathematicians: the cliffhanger for lesson 24.
  - Calendar reform: the Jalali calendar (1079) and the error in a year's length.
- **In-story problem:** read off the positive root of x³ + 2x = 12 (teaching numbers) as the intersection of a parabola and a hyperbola; check it numerically (x = 2).
- **Echoes today:** leap-year rules (why 2100 won't be a leap year); graphical root-finding.
- **Practice:** Algebra · Conic Sections; Polynomial Operations.
- **Sources:**
  - Kasir, D. S. (1931). *The Algebra of Omar Khayyam*. Columbia University.
  - Wikipedia: [Omar Khayyam (Mathematics)](https://en.wikipedia.org/wiki/Omar_Khayyam#Mathematics) · [Jalali calendar](https://en.wikipedia.org/wiki/Jalali_calendar) · [Cubic equation (History)](https://en.wikipedia.org/wiki/Cubic_equation#History)
  - MacTutor: [Khayyam](https://mathshistory.st-andrews.ac.uk/Biographies/Khayyam/)

### 19. The beautiful Līlāvatī — Ujjain, 1150
- **People:** Bhāskara II (1114–1185).
- **Topics:**
  - *Līlāvatī*: arithmetic taught through verse problems, addressed to a girl called Līlāvatī.
  - The **rule of three** (proportion).
  - Simple interest.
  - Combinations: how many different dishes from six flavours?
  - Pythagorean word problems.
- **In-story problem:** his bamboo verse: a bamboo 32 cubits tall, broken by the wind, touches the ground 16 cubits from its root; how high is the break? (12 cubits, via h² + 16² = (32 − h)².)
- **Echoes today:** unit prices and recipe scaling (rule of three); interest on a loan; counting combinations for PINs, lottery odds and menu choices.
- **Legend check:** the story that Līlāvatī was his daughter, whose wedding hour was ruined by a pearl falling into a water clock, first appears in a 1587 Persian translation by Faizi.
- **Practice:** Arithmetic · Ratios & Proportions, Percentages.
- **Sources:**
  - Colebrooke (1817), above (*PD*; includes *Līlāvatī*).
  - Wikipedia: [Bhāskara II](https://en.wikipedia.org/wiki/Bh%C4%81skara_II) · [Līlāvatī](https://en.wikipedia.org/wiki/L%C4%ABl%C4%81vat%C4%AB)
  - MacTutor: [Bhaskara II](https://mathshistory.st-andrews.ac.uk/Biographies/Bhaskara_II/)

### 20. The book of calculation — Pisa, 1202
- **People:** Leonardo of Pisa, "Fibonacci" (c. 1170 – c. 1250).
- **Topics:**
  - *Liber Abaci*: bringing Hindu-Arabic numerals and place value to European merchants, who had used Roman numerals and the counting board.
  - Business mathematics: currency exchange, partnerships (sharing profit in proportion), interest.
  - The greedy algorithm for Egyptian fractions (a link back to Ahmes).
  - The rabbit problem → the Fibonacci sequence and its ratio approaching the golden ratio.
- **In-story problem:** a currency exchange and a partnership split (teaching numbers in the style of his chapters); count the rabbit pairs month by month to 377 after a year.
- **Echoes today:** currency conversion when travelling; splitting business profits by investment; spiral counts in sunflowers and pinecones (phyllotaxis).
- **Meanwhile:** the sequence appears in Indian prosody (Piṅgala, Virahāṅka, Hemachandra) centuries earlier.
- **Practice:** Arithmetic · Decimals, Percentages, Ratios.
- **Sources:**
  - Sigler, L. E. (2002). *Fibonacci's Liber Abaci: A Translation into Modern English*. Springer.
  - Wikipedia: [Fibonacci](https://en.wikipedia.org/wiki/Fibonacci) · [Liber Abaci](https://en.wikipedia.org/wiki/Liber_Abaci) · [Fibonacci sequence](https://en.wikipedia.org/wiki/Fibonacci_sequence) · [Hindu–Arabic numeral system](https://en.wikipedia.org/wiki/Hindu%E2%80%93Arabic_numeral_system) · [Greedy algorithm for Egyptian fractions](https://en.wikipedia.org/wiki/Greedy_algorithm_for_Egyptian_fractions)
  - MacTutor: [Fibonacci](https://mathshistory.st-andrews.ac.uk/Biographies/Fibonacci/)

### 21. Speed you can draw *(physics)* — Oxford and Paris, 1330s–1350s
- **People:** the "Oxford Calculators" of Merton College (Thomas Bradwardine, William Heytesbury, Richard Swineshead, John Dumbleton); Nicole Oresme (c. 1320–1382).
- **Physics:**
  - Speed as a quantity that changes: early kinematics, three centuries before Galileo.
  - The **mean speed theorem**: a body accelerating uniformly covers the same distance as one moving steadily at its average speed.
- **Maths it uses:**
  - Oresme's graphs ("latitude of forms"), in which intensity (speed) is drawn against extension (time), long before Descartes.
  - The area under a speed-time graph is the distance; areas of triangles and trapezoids.
  - Aside: Oresme's proof that the harmonic series 1 + ½ + ⅓ + … grows without limit.
- **In-story problem:** a cart speeds up evenly from 0 to 6 m/s in 10 s. Find the area under its graph (30 m) and check it against a cart moving steadily at 3 m/s. Group the harmonic series' terms as Oresme did.
- **Echoes today:** reading speed-time graphs from a fitness tracker or car; stopping distance while braking; the idea behind integration.
- **Legend check:** the mean speed theorem is often credited to Galileo (lesson 32), who proved it again. The Merton scholars stated it around 1335.
- **Practice:** Physics · Kinematics *(roadmap)*.
- **Sources:**
  - Clagett, M. (1959). *The Science of Mechanics in the Middle Ages*. University of Wisconsin Press. Clagett, M. (1968). *Nicole Oresme and the Medieval Geometry of Qualities and Motions*. University of Wisconsin Press.
  - Wikipedia: [Mean speed theorem](https://en.wikipedia.org/wiki/Mean_speed_theorem) · [Oxford Calculators](https://en.wikipedia.org/wiki/Oxford_Calculators) · [Nicole Oresme](https://en.wikipedia.org/wiki/Nicole_Oresme) · [Harmonic series (mathematics)](https://en.wikipedia.org/wiki/Harmonic_series_(mathematics))
  - MacTutor: [Oresme](https://mathshistory.st-andrews.ac.uk/Biographies/Oresme/) · [Bradwardine](https://mathshistory.st-andrews.ac.uk/Biographies/Bradwardine/)

### 22. Infinity before calculus — Kerala, c. 1400
- **People:** Mādhava of Saṅgamagrāma (c. 1340 – c. 1425) and the Kerala school (Nīlakaṇṭha, Jyeṣṭhadeva).
- **Topics:**
  - Infinite series: π/4 = 1 − 1/3 + 1/5 − 1/7 + … (later rediscovered by Gregory and Leibniz).
  - Series for sine and cosine.
  - Convergence: why the series is slow, and Mādhava's correction terms that speed it up.
  - Mādhava's work survives through later texts (*Tantrasaṅgraha*, 1501; *Yuktibhāṣā*, c. 1530).
- **In-story problem:** add the first 10 terms of the π series and compare with Archimedes (lesson 6); estimate sin 0.5 from three terms of the series.
- **Echoes today:** how calculators and computers evaluate π, sin and cos; why algorithms need to converge fast.
- **Practice:** Calculus · series *(roadmap)*.
- **Sources:**
  - Sarma, K. V. (tr.) (2008). *Gaṇita-Yukti-Bhāṣā of Jyeṣṭhadeva*. Springer / Hindustan Book Agency.
  - Wikipedia: [Madhava of Sangamagrama](https://en.wikipedia.org/wiki/Madhava_of_Sangamagrama) · [Kerala school of astronomy and mathematics](https://en.wikipedia.org/wiki/Kerala_school_of_astronomy_and_mathematics) · [Leibniz formula for π](https://en.wikipedia.org/wiki/Leibniz_formula_for_%CF%80) · [Madhava series](https://en.wikipedia.org/wiki/Madhava_series)
  - MacTutor: [Madhava](https://mathshistory.st-andrews.ac.uk/Biographies/Madhava/)

### 23. Crossroads II — The caravan ledger *(review, fictional scenario)*
- **Setting:** a trading journey from Baghdad to Hangzhou and back along the Silk Road.
- **Topics mixed:** negatives in a ledger, currency exchange, a quadratic for a courtyard, sines for a navigation angle, rule of three.
- **Sources:** Wikipedia: [Silk Road](https://en.wikipedia.org/wiki/Silk_Road)

---

## Act III — Secrets and duels: the Renaissance (1500 – 1600)

### 24. The secret of the cubic — Bologna, Venice, Milan, 1515–1548
- **People:** Scipione del Ferro, Antonio Fior, Niccolò Tartaglia, Gerolamo Cardano, Lodovico Ferrari.
- **Topics:**
  - Del Ferro's secret solution (c. 1515), passed to his student Fior.
  - The 1535 challenge: 30 problems each. Tartaglia finds the method and solves Fior's problems.
  - Cardano obtains the method under an oath of secrecy (1539), then publishes it in *Ars Magna* (1545), crediting del Ferro and Tartaglia.
  - Ferrari solves the quartic.
  - The public debate in Milan in 1548.
  - Cardano's formula for x³ + px = q; the *casus irreducibilis* (square roots of negatives appear even when the answer is real) is the cliffhanger for lesson 25.
- **In-story problem:** *Ars Magna*'s example, "cube and six things equal twenty": x³ + 6x = 20 → x = ∛(√108 + 10) − ∛(√108 − 10) = 2. Check it numerically.
- **Echoes today:** designing an open box of a given volume from a sheet; gas equations of state in engineering (van der Waals' equation is cubic in volume); cubic Bézier curves in fonts and design software.
- **Legend check:** the oath and the betrayal are told mainly from Tartaglia's side (*Quesiti et inventioni diverse*, 1546). Ferrari's public letters dispute it.
- **Practice:** Algebra · Polynomial Operations.
- **Sources:**
  - Cardano, G. (1545). *Ars Magna*, tr. T. R. Witmer (1968), *The Great Art*. MIT Press.
  - Wikipedia: [Ars Magna (Cardano book)](https://en.wikipedia.org/wiki/Ars_Magna_(Cardano_book)) · [Gerolamo Cardano](https://en.wikipedia.org/wiki/Gerolamo_Cardano) · [Niccolò Fontana Tartaglia](https://en.wikipedia.org/wiki/Niccol%C3%B2_Fontana_Tartaglia) · [Scipione del Ferro](https://en.wikipedia.org/wiki/Scipione_del_Ferro) · [Lodovico Ferrari](https://en.wikipedia.org/wiki/Lodovico_Ferrari) · [Cubic equation (Cardano's formula)](https://en.wikipedia.org/wiki/Cubic_equation#Cardano's_formula)
  - MacTutor: [Cardan](https://mathshistory.st-andrews.ac.uk/Biographies/Cardan/) · [Tartaglia](https://mathshistory.st-andrews.ac.uk/Biographies/Tartaglia/)

### 25. Impossible numbers — Bologna, 1572
- **People:** Rafael Bombelli (1526–1572); later René Descartes, Leonhard Euler, Caspar Wessel, Jean-Robert Argand, Carl Friedrich Gauss.
- **Topics:**
  - *L'Algebra*: rules for *più di meno* (+i) and *meno di meno* (−i). The square root of a negative becomes a tool, not a dead end.
  - Arithmetic with complex numbers.
  - Epilogue: Descartes calls them "imaginary" (1637, as an insult); Euler writes *i* (1777); Wessel (1799) and Argand (1806) draw them as points in a plane.
- **In-story problem:** x³ = 15x + 4. Cardano's formula gives ∛(2 + √−121) + ∛(2 − √−121). Check that (2 + i)³ = 2 + 11i, so the answer is (2 + i) + (2 − i) = 4.
- **Echoes today:** AC electrical circuits (impedance, written R + jX by engineers); signal processing and audio filters; quantum mechanics; the Mandelbrot set.
- **Practice:** Algebra · Complex Numbers.
- **Sources:**
  - Bombelli, R. (1572). *L'Algebra*. Bologna.
  - Wikipedia: [Rafael Bombelli](https://en.wikipedia.org/wiki/Rafael_Bombelli) · [Complex number (History)](https://en.wikipedia.org/wiki/Complex_number#History) · [Imaginary unit](https://en.wikipedia.org/wiki/Imaginary_unit) · [Casus irreducibilis](https://en.wikipedia.org/wiki/Casus_irreducibilis) · [Electrical impedance](https://en.wikipedia.org/wiki/Electrical_impedance)
  - MacTutor: [Bombelli](https://mathshistory.st-andrews.ac.uk/Biographies/Bombelli/)

### 26. Symbols — Leipzig, London, Bruges, Paris, 1489–1659 *(short interlude)*
- **People:** Johannes Widmann, Robert Recorde, Simon Stevin, François Viète, William Oughtred, Johann Rahn.
- **Topics:**
  - Where the symbols came from:
    - + and − in print: Widmann, 1489.
    - =: Recorde, *The Whetstone of Witte*, 1557, "bicause noe .2. thynges, can be moare equalle".
    - Letters for unknowns and for knowns: Viète, *In artem analyticem isagoge*, 1591.
    - ×: Oughtred, 1631.
    - ÷: Rahn, 1659.
  - Decimal fractions for everyone: Stevin, *De Thiende*, 1585.
  - Order of operations as a *convention*, not a law of nature.
- **In-story problem:** rewrite a problem from Recorde's wordy style in modern symbols and evaluate it; read a number in Stevin's circled-digit notation.
- **Echoes today:** money and the metric system (Stevin argued for decimal measures, and France adopted the metric system in 1795); spreadsheet formula precedence; the viral "6 ÷ 2(1 + 2)" argument.
- **Practice:** Arithmetic · Order of Operations, Decimals.
- **Sources:**
  - Recorde, R. (1557). *The Whetstone of Witte* (*PD*). Stevin, S. (1585). *De Thiende*; English tr. *Disme* (1608) (*PD*). Cajori, F. (1928–29). *A History of Mathematical Notations* (*PD*).
  - Wikipedia: [Equals sign](https://en.wikipedia.org/wiki/Equals_sign) · [Robert Recorde](https://en.wikipedia.org/wiki/Robert_Recorde) · [Simon Stevin](https://en.wikipedia.org/wiki/Simon_Stevin) · [François Viète](https://en.wikipedia.org/wiki/Fran%C3%A7ois_Vi%C3%A8te) · [Plus and minus signs](https://en.wikipedia.org/wiki/Plus_and_minus_signs) · [Obelus](https://en.wikipedia.org/wiki/Obelus) · [History of mathematical notation](https://en.wikipedia.org/wiki/History_of_mathematical_notation) · [Order of operations](https://en.wikipedia.org/wiki/Order_of_operations)
  - MacTutor: [Recorde](https://mathshistory.st-andrews.ac.uk/Biographies/Recorde/) · [Stevin](https://mathshistory.st-andrews.ac.uk/Biographies/Stevin/) · [Viète](https://mathshistory.st-andrews.ac.uk/Biographies/Viete/)

### 27. Crossroads III — The challenge *(review, fictional scenario)*
- **Setting:** the learner is challenged to a public mathematical contest in 1540s Milan, in the style of the real Tartaglia–Ferrari debate.
- **Topics mixed:** cubics, complex arithmetic, completing the square, proportion problems written in period notation.
- **Sources:** as for lessons 24–26.

---

## Act IV — The Scientific Revolution (1600 – 1750)

### 28. Mars is an ellipse *(physics)* — Prague, 1609
- **People:** Johannes Kepler (1571–1630); Tycho Brahe (1546–1601).
- **Topics:**
  - Tycho's naked-eye observations, accurate to about 1–2 arcminutes, and an 8-arcminute gap that no circle could close.
  - *Astronomia nova* (1609): orbits are ellipses with the Sun at one focus (first law); equal areas in equal times (second law).
  - *Harmonices Mundi* (1619): P² = a³ (third law).
  - Ellipse vocabulary: semi-major axis, foci, eccentricity.
  - The open question Kepler left: *why* ellipses? Newton answers it in lesson 36.
- **In-story problem:** Mars' orbit: a = 1.524 AU, e ≈ 0.093. Find the distance from the centre to the focus, and the closest and farthest distances from the Sun. Use the third law to get Mars' year ≈ 1.88 Earth years.
- **Echoes today:** satellite and GPS orbits; lithotripsy (an elliptical reflector breaks kidney stones with shock waves); whispering galleries.
- **Practice:** Algebra · Conic Sections (Ellipse).
- **Sources:**
  - Kepler, J. (1609). *Astronomia nova*, tr. W. H. Donahue (1992), *New Astronomy*. Cambridge University Press.
  - Wikipedia: [Astronomia nova](https://en.wikipedia.org/wiki/Astronomia_nova) · [Kepler's laws of planetary motion](https://en.wikipedia.org/wiki/Kepler%27s_laws_of_planetary_motion) · [Tycho Brahe](https://en.wikipedia.org/wiki/Tycho_Brahe) · [Orbit of Mars](https://en.wikipedia.org/wiki/Orbit_of_Mars) · [Extracorporeal shockwave therapy](https://en.wikipedia.org/wiki/Extracorporeal_shockwave_therapy)
  - MacTutor: [Kepler](https://mathshistory.st-andrews.ac.uk/Biographies/Kepler/)

### 29. Multiplication into addition — Edinburgh, 1614
- **People:** John Napier (1550–1617); Henry Briggs (1561–1630); Jost Bürgi (independently, 1620); Edmund Gunter and William Oughtred (the slide rule).
- **Topics:**
  - *Mirifici Logarithmorum Canonis Descriptio* (1614).
  - Log laws: log(ab) = log a + log b.
  - Briggs' base-10 tables (*Arithmetica Logarithmica*, 1624).
  - Kepler used logarithms for the *Rudolphine Tables* (1627).
  - The slide rule (c. 1620–1630), used by engineers until the 1970s.
- **In-story problem:** multiply 3,721 × 8,432 with a small log table (look up, add, look back up). Check with a slide-rule widget.
- **Echoes today:** decibels, pH and earthquake magnitude are all log scales; how much louder is 90 dB than 60 dB?; log-scale charts; slide rules on the Apollo missions.
- **Practice:** Algebra · Exponential & Logarithmic (Logarithm Properties).
- **Sources:**
  - Napier, J. (1614). *Mirifici Logarithmorum Canonis Descriptio*. Edinburgh.
  - Wikipedia: [John Napier](https://en.wikipedia.org/wiki/John_Napier) · [Logarithm (History)](https://en.wikipedia.org/wiki/Logarithm#History) · [Henry Briggs (mathematician)](https://en.wikipedia.org/wiki/Henry_Briggs_(mathematician)) · [Jost Bürgi](https://en.wikipedia.org/wiki/Jost_B%C3%BCrgi) · [Slide rule](https://en.wikipedia.org/wiki/Slide_rule) · [Decibel](https://en.wikipedia.org/wiki/Decibel)
  - MacTutor: [Napier](https://mathshistory.st-andrews.ac.uk/Biographies/Napier/) · [Briggs](https://mathshistory.st-andrews.ac.uk/Biographies/Briggs/)

### 30. Pictures of equations — Leiden and Toulouse, 1637
- **People:** René Descartes (1596–1650); Pierre de Fermat (1601–1665).
- **Topics:**
  - *La Géométrie* (1637, an appendix to the *Discourse on Method*): curves described by equations and equations drawn as curves.
  - Descartes' notation: x, y, z for unknowns; exponents like x³.
  - Fermat's parallel work (*Ad locos planos et solidos isagoge*, circulated 1636).
  - Intersections of graphs as solutions of systems.
- **In-story problem:** plot a line and a circle and find where they meet, both by graph and by algebra.
- **Echoes today:** GPS coordinates; screen pixels; spreadsheets and charts; CAD and 3D printing.
- **Legend check:** Descartes inventing coordinates while watching a fly on the ceiling is a later anecdote with no source in his writings.
- **Practice:** Algebra · Systems of Equations (Nonlinear); Geometry · Coordinate Geometry *(roadmap)*.
- **Sources:**
  - Descartes, R. (1637). *La Géométrie*, tr. D. E. Smith & M. L. Latham (1925), *The Geometry of René Descartes*. Open Court.
  - Wikipedia: [La Géométrie](https://en.wikipedia.org/wiki/La_G%C3%A9om%C3%A9trie) · [René Descartes](https://en.wikipedia.org/wiki/Ren%C3%A9_Descartes) · [Cartesian coordinate system (History)](https://en.wikipedia.org/wiki/Cartesian_coordinate_system#History) · [Pierre de Fermat](https://en.wikipedia.org/wiki/Pierre_de_Fermat)
  - MacTutor: [Descartes](https://mathshistory.st-andrews.ac.uk/Biographies/Descartes/) · [Fermat](https://mathshistory.st-andrews.ac.uk/Biographies/Fermat/)

### 31. Bending light *(physics)* — Baghdad 984, Leiden 1621, Leiden 1637, Toulouse 1662
- **People:** Ibn Sahl; Willebrord Snell (1580–1626); René Descartes; Pierre de Fermat.
- **Physics:**
  - Refraction and the sine law, n₁ sin θ₁ = n₂ sin θ₂. Ibn Sahl drew it in 984; Snell found it in 1621 but never published it; Descartes published it in *La Dioptrique* (1637).
  - Fermat's **principle of least time** (1662), which follows on from Hero's shortest path (lesson 11).
  - Total internal reflection.
  - Descartes' rainbow (*Les Météores*, 1637): why the bow sits at about 42°.
- **Maths it uses:** sines and inverse sines (a link back to Āryabhaṭa, lesson 14); minimising a travel time; ratios.
- **In-story problem:** light enters water (n = 1.33) at 45°: find the bent angle (≈ 32°). Find glass's critical angle (n = 1.5 → 41.8°). The "lifeguard problem" (run along the beach, then swim) shows why least time means bending.
- **Echoes today:** glasses and contact lenses; fibre-optic internet (light trapped by total internal reflection); why a straw looks bent in water; rainbows.
- **Legend check:** Fermat and Descartes argued bitterly over Descartes' derivation. Ibn Sahl's priority was only recognised when Roshdi Rashed reconstructed his treatise (1990).
- **Practice:** Trigonometry · Right-Triangle Trig, Inverse Trig *(roadmap)*; Physics · Optics *(new topic)*.
- **Sources:**
  - Rashed, R. (1990). "A Pioneer in Anaclastics: Ibn Sahl on Burning Mirrors and Lenses." *Isis* 81(3), 464–491. Descartes, R. (1637). *La Dioptrique*; *Les Météores*.
  - Wikipedia: [Snell's law](https://en.wikipedia.org/wiki/Snell%27s_law) · [Ibn Sahl](https://en.wikipedia.org/wiki/Ibn_Sahl) · [Fermat's principle](https://en.wikipedia.org/wiki/Fermat%27s_principle) · [Total internal reflection](https://en.wikipedia.org/wiki/Total_internal_reflection) · [Rainbow](https://en.wikipedia.org/wiki/Rainbow)
  - MacTutor: [Snell](https://mathshistory.st-andrews.ac.uk/Biographies/Snell/)

### 32. Two new sciences *(physics)* — Padua and Arcetri, 1604–1638
- **People:** Galileo Galilei (1564–1642); Simon Stevin (*meanwhile*).
- **Physics:**
  - Falling bodies speed up uniformly.
  - Distance grows with the **square** of time: distances in successive equal intervals go 1 : 3 : 5 : 7 (the odd-number rule). Galileo found it by rolling balls down ramps, timed by weighing water from a water clock.
  - Projectiles follow a **parabola**, because horizontal and vertical motion are independent.
  - *Discorsi* (1638), written under house arrest after his 1633 trial.
- **Maths it uses:** squares and quadratics; the parabola (a link back to Apollonius, lesson 9); splitting motion into components; proportion.
- **In-story problem:** a ball rolls 1 *punto* in the first beat. How far has it gone after 4 beats (16), and how far in the 4th beat alone (7)? Then use Galileo's table-edge experiment from his notebook (folio 116v): predict where a ball leaves the table and lands.
- **Echoes today:** basketball arcs, water fountains, long jump; why 45° gives the longest throw (ignoring air); braking distance grows with the square of speed.
- **Legend check:** the Leaning Tower drop comes from his secretary Vincenzo Viviani's biography (written 1654) and may never have happened. Stevin and Jan de Groot really did drop lead balls from a church tower in Delft in 1586.
- **Practice:** Physics · Kinematics *(roadmap)*; Algebra · Conic Sections (Parabola).
- **Sources:**
  - Galileo, G. (1638). *Discorsi e dimostrazioni matematiche intorno a due nuove scienze*, tr. H. Crew & A. de Salvio (1914), *Dialogues Concerning Two New Sciences* (*PD*). Drake, S. & MacLachlan, J. (1975). "Galileo's Discovery of the Parabolic Trajectory." *Scientific American* 232(3), 102–110.
  - Wikipedia: [Two New Sciences](https://en.wikipedia.org/wiki/Two_New_Sciences) · [Galileo Galilei](https://en.wikipedia.org/wiki/Galileo_Galilei) · [Galileo's Leaning Tower of Pisa experiment](https://en.wikipedia.org/wiki/Galileo%27s_Leaning_Tower_of_Pisa_experiment) · [Projectile motion](https://en.wikipedia.org/wiki/Projectile_motion) · [Inclined plane](https://en.wikipedia.org/wiki/Inclined_plane)
  - MacTutor: [Galileo](https://mathshistory.st-andrews.ac.uk/Biographies/Galileo/)

### 33. The unfinished game — Paris and Toulouse, 1654
- **People:** Blaise Pascal (1623–1662); Pierre de Fermat; Antoine Gombaud, "Chevalier de Méré"; Christiaan Huygens.
- **Topics:**
  - The problem of points: how to split the stakes of a game stopped early.
  - The Pascal–Fermat letters of summer 1654.
  - Counting outcomes; probability as a fraction.
  - Pascal's triangle (*Traité du triangle arithmétique*, published 1665).
  - Huygens' *De ratiociniis in ludo aleae* (1657): **expected value**.
- **In-story problem:** a game to 3 wins is stopped at 2–1: split 64 pistoles (48 : 16). De Méré's dice paradox: at least one six in 4 rolls (≈ 51.8%) against at least one double six in 24 rolls of two dice (≈ 49.1%).
- **Echoes today:** insurance premiums; lottery expected value; medical test results; sports odds; board game strategy.
- **Meanwhile:** the triangle was known centuries earlier to al-Karajī (Persia), Yang Hui (China, 1261) and in Indian work on metre.
- **Practice:** Probability *(new subject)*.
- **Sources:**
  - Devlin, K. (2008). *The Unfinished Game: Pascal, Fermat, and the Seventeenth-Century Letter that Made the World Modern*. Basic Books. The letters are translated in D. E. Smith (1929), *A Source Book in Mathematics*.
  - Wikipedia: [Problem of points](https://en.wikipedia.org/wiki/Problem_of_points) · [Pascal's triangle](https://en.wikipedia.org/wiki/Pascal%27s_triangle) · [Antoine Gombaud](https://en.wikipedia.org/wiki/Antoine_Gombaud) · [Expected value](https://en.wikipedia.org/wiki/Expected_value) · [Christiaan Huygens](https://en.wikipedia.org/wiki/Christiaan_Huygens)
  - MacTutor: [Pascal](https://mathshistory.st-andrews.ac.uk/Biographies/Pascal/)

### 34. Springs and swings *(physics)* — The Hague, Paris and London, 1656–1678
- **People:** Christiaan Huygens (1629–1695); Robert Hooke (1635–1703); Jean Richer.
- **Physics:**
  - A pendulum's period hardly depends on the swing's size and grows with the **square root** of its length.
  - Huygens' pendulum clock (1656), which made clocks many times more accurate.
  - *Horologium Oscillatorium* (1673): T = 2π√(L/g), and the cycloid as the perfectly even swing.
  - Hooke's law: force ∝ stretch. He announced it as the anagram "ceiiinosssttuv" (1676), which unscrambles to *ut tensio, sic vis* ("as the extension, so the force"), and published it in 1678.
  - Richer's 1672 expedition to Cayenne found his pendulum clock ran slow near the equator. Gravity is weaker there, which is the lead-in to Newton (lesson 36).
- **Maths it uses:** square roots and scaling (4 × the length gives 2 × the period); linear functions and slope (F = kx); reading a straight-line graph.
- **In-story problem:** how long is a "seconds pendulum" (2 s per full swing)? About 0.994 m. From a table of weights and stretches, find the spring constant from the slope.
- **Echoes today:** grandfather clocks and metronomes; playground swings; bathroom and luggage scales; car suspension; the 660-tonne pendulum (tuned mass damper) that steadies the Taipei 101 skyscraper.
- **Legend check:** Galileo timing a swinging lamp in Pisa Cathedral against his pulse comes from Viviani's biography.
- **Practice:** Physics · Waves & Oscillations *(roadmap: Waves & Sound)*; Arithmetic · Exponents & Roots.
- **Sources:**
  - Huygens, C. (1673). *Horologium Oscillatorium*, tr. R. J. Blackwell (1986), *The Pendulum Clock*. Iowa State University Press. Hooke, R. (1678). *Lectures de Potentia Restitutiva, or of Spring* (*PD*).
  - Wikipedia: [Pendulum clock](https://en.wikipedia.org/wiki/Pendulum_clock) · [Horologium Oscillatorium](https://en.wikipedia.org/wiki/Horologium_Oscillatorium) · [Hooke's law](https://en.wikipedia.org/wiki/Hooke%27s_law) · [Tautochrone curve](https://en.wikipedia.org/wiki/Tautochrone_curve) · [Tuned mass damper](https://en.wikipedia.org/wiki/Tuned_mass_damper)
  - MacTutor: [Huygens](https://mathshistory.st-andrews.ac.uk/Biographies/Huygens/) · [Hooke](https://mathshistory.st-andrews.ac.uk/Biographies/Hooke/)

### 35. The race for calculus — Woolsthorpe, Cambridge, Paris, 1665–1712
- **People:** Isaac Newton (1643–1727); Gottfried Wilhelm Leibniz (1646–1716).
- **Topics:**
  - Newton's plague years (1665–66) and his "fluxions" (unpublished for decades).
  - Leibniz's paper in *Acta Eruditorum* (1684), with the dy/dx and ∫ notation we still use.
  - The derivative as a rate of change and as the slope of a tangent.
  - The Royal Society's 1712 report (*Commercium Epistolicum*), secretly drafted by Newton himself; today both are credited with independent invention.
- **In-story problem:** from a table of a falling ball's positions, estimate its speed at 2 s by shrinking the time interval; find the tangent slope of y = x² at x = 3.
- **Echoes today:** speedometers (the rate of change of position); the dimensions of a can that use the least metal (optimisation); how fast a drug dose leaves the blood.
- **Practice:** Calculus · Derivatives *(roadmap)*.
- **Sources:**
  - Leibniz, G. W. (1684). "Nova methodus pro maximis et minimis…", *Acta Eruditorum*, 467–473. Newton, I. (1736). *The Method of Fluxions and Infinite Series* (written 1671) (*PD*).
  - Wikipedia: [Leibniz–Newton calculus controversy](https://en.wikipedia.org/wiki/Leibniz%E2%80%93Newton_calculus_controversy) · [Method of Fluxions](https://en.wikipedia.org/wiki/Method_of_Fluxions) · [History of calculus](https://en.wikipedia.org/wiki/History_of_calculus) · [Leibniz's notation](https://en.wikipedia.org/wiki/Leibniz%27s_notation)
  - MacTutor: [Newton](https://mathshistory.st-andrews.ac.uk/Biographies/Newton/) · [Leibniz](https://mathshistory.st-andrews.ac.uk/Biographies/Leibniz/)

### 36. The system of the world *(physics)* — Cambridge and London, 1684–1687
- **People:** Isaac Newton; Edmond Halley (who asked the question and paid for the printing); Robert Hooke (who claimed the inverse-square idea); Henry Cavendish (*epilogue*, 1798).
- **Physics:**
  - Halley's 1684 visit: what path does a planet follow under an inverse-square pull? Newton's answer grew into the *Principia* (1687).
  - The three laws of motion, F = ma.
  - Universal gravitation, F = Gm₁m₂/r².
  - Kepler's laws (lesson 28) derived from one force.
  - Cavendish measures G (1798), "weighing the Earth".
- **Maths it uses:** inverse-square scaling; formulas with several variables; circular speed v = 2πr/T and centripetal acceleration v²/r; scientific notation.
- **In-story problem:** Newton's **Moon test**. The Moon is 60 Earth radii away, so gravity there should be g/3600 ≈ 0.00272 m/s². Check it against the Moon's actual orbit (r = 384,400 km, T = 27.32 days). Then find the height of a geostationary orbit (≈ 35,800 km).
- **Echoes today:** where satellites and GPS orbit; your weight on the Moon or Mars; seatbelts and crumple zones (F = ma in a crash); lifts that make you feel heavier.
- **Legend check:** the falling apple is Newton's own late-life story (recorded by William Stukeley, 1752), but it didn't hit his head.
- **Practice:** Physics · Forces & Newton's Laws, Circular Motion & Gravitation *(roadmap)*.
- **Sources:**
  - Newton, I. (1687). *Philosophiæ Naturalis Principia Mathematica*, tr. A. Motte (1729) (*PD*); tr. I. B. Cohen & A. Whitman (1999). University of California Press.
  - Wikipedia: [Philosophiæ Naturalis Principia Mathematica](https://en.wikipedia.org/wiki/Philosophi%C3%A6_Naturalis_Principia_Mathematica) · [Newton's laws of motion](https://en.wikipedia.org/wiki/Newton%27s_laws_of_motion) · [Newton's law of universal gravitation](https://en.wikipedia.org/wiki/Newton%27s_law_of_universal_gravitation) · [Cavendish experiment](https://en.wikipedia.org/wiki/Cavendish_experiment) · [Geostationary orbit](https://en.wikipedia.org/wiki/Geostationary_orbit)
  - MacTutor: [Newton](https://mathshistory.st-andrews.ac.uk/Biographies/Newton/) · [Halley](https://mathshistory.st-andrews.ac.uk/Biographies/Halley/)

### 37. The number of growth — Basel and St Petersburg, 1683–1748
- **People:** Jacob Bernoulli (1655–1705); Leonhard Euler (1707–1783).
- **Topics:**
  - Bernoulli's compound-interest question (1683): what happens as you compound more and more often? The limit is *e* ≈ 2.71828.
  - Euler names it *e* (letter of 1731; *Mechanica*, 1736).
  - Natural logarithms; exponential growth and decay.
  - *Introductio in analysin infinitorum* (1748): Euler's formula e^{ix} = cos x + i sin x, joining lessons 14, 25 and 29.
- **In-story problem:** 1 ducat at 100% interest compounded yearly, monthly, daily and continuously (2, 2.613, 2.7146, 2.71828…).
- **Echoes today:** loan APR against APY; the rule of 72; population growth; radiocarbon dating (half-life 5,730 years); how long caffeine or a medicine stays in your body.
- **Legend check:** e^{iπ} + 1 = 0 is implied by Euler's formula, but Euler never wrote it in that form. "The most beautiful equation" is a 20th-century label.
- **Practice:** Algebra · Exponential & Logarithmic.
- **Sources:**
  - Euler, L. (1748). *Introductio in analysin infinitorum*, tr. J. D. Blanton (1988). Springer. The Euler Archive: [scholarlycommons.pacific.edu/euler](https://scholarlycommons.pacific.edu/euler/).
  - Wikipedia: [e (mathematical constant)](https://en.wikipedia.org/wiki/E_(mathematical_constant)) · [Compound interest](https://en.wikipedia.org/wiki/Compound_interest) · [Euler's formula](https://en.wikipedia.org/wiki/Euler%27s_formula) · [Euler's identity](https://en.wikipedia.org/wiki/Euler%27s_identity) · [Radiocarbon dating](https://en.wikipedia.org/wiki/Radiocarbon_dating) · [Rule of 72](https://en.wikipedia.org/wiki/Rule_of_72)
  - MacTutor: [Jacob Bernoulli](https://mathshistory.st-andrews.ac.uk/Biographies/Bernoulli_Jacob/) · [Euler](https://mathshistory.st-andrews.ac.uk/Biographies/Euler/)

### 38. Seven bridges — Königsberg, 1736
- **People:** Leonhard Euler.
- **Topics:**
  - Turning a city map into dots and lines: the birth of graph theory.
  - Vertex degree; the odd-degree rule for walking every edge exactly once (an Euler path or circuit).
  - Why the answer for Königsberg is impossible.
  - Euler's paper, presented in 1735 and published in 1741.
- **In-story problem:** count the degrees of Königsberg's four land masses (5, 3, 3, 3), so no walk exists; then test some modern maps.
- **Echoes today:** planning snowplough, postal and garbage routes (the "Chinese postman problem", Kwan Mei-Ko, 1962); network design; drawing a figure without lifting your pen.
- **Practice:** Discrete Maths *(new subject)*.
- **Sources:**
  - Euler, L. (1741). "Solutio problematis ad geometriam situs pertinentis." *Commentarii academiae scientiarum Petropolitanae* 8, 128–140 (Eneström E53). Tr. in Biggs, N., Lloyd, E. K. & Wilson, R. (1976), *Graph Theory 1736–1936*. Oxford.
  - Wikipedia: [Seven Bridges of Königsberg](https://en.wikipedia.org/wiki/Seven_Bridges_of_K%C3%B6nigsberg) · [Eulerian path](https://en.wikipedia.org/wiki/Eulerian_path) · [Graph theory](https://en.wikipedia.org/wiki/Graph_theory) · [Chinese postman problem](https://en.wikipedia.org/wiki/Chinese_postman_problem)

### 39. Why speed is squared *(physics)* — Cirey, 1740
- **People:** Émilie du Châtelet (1706–1749); Willem 's Gravesande; G. W. Leibniz; Thomas Young (*epilogue*).
- **Physics:**
  - The *vis viva* dispute: is a moving body's "force" measured by mv (the Cartesians and Newtonians) or by mv² (Leibniz)?
  - 's Gravesande dropped brass balls into soft clay (1722): twice the speed made a dent four times as deep.
  - Du Châtelet's *Institutions de Physique* (1740) argued for mv². Her French translation of the *Principia*, with commentary (published 1759), is still the standard one.
  - Kinetic energy ½mv², potential energy mgh, and their trade-off. Young introduced the word "energy" (1807).
- **Maths it uses:** quadratic scaling; solving mgh = ½mv² for v = √(2gh); square roots.
- **In-story problem:** balls dropped from 1 m, 2 m and 4 m: predict the ratio of their dents. A car at 50 km/h against 100 km/h: how many times the braking distance (4)?
- **Echoes today:** why a little extra speed makes crashes much worse; braking distances in the driving test; roller coaster drop heights; hydroelectric dams.
- **Practice:** Physics · Work, Energy & Power *(roadmap)*.
- **Sources:**
  - du Châtelet, É. (1740). *Institutions de physique*. Paris. Zinsser, J. P. (2006). *Emilie du Châtelet: Daring Genius of the Enlightenment*. Penguin.
  - Wikipedia: [Émilie du Châtelet](https://en.wikipedia.org/wiki/%C3%89milie_du_Ch%C3%A2telet) · [Vis viva](https://en.wikipedia.org/wiki/Vis_viva) · [Willem 's Gravesande](https://en.wikipedia.org/wiki/Willem_%27s_Gravesande) · [Kinetic energy](https://en.wikipedia.org/wiki/Kinetic_energy) · [Braking distance](https://en.wikipedia.org/wiki/Braking_distance)
  - MacTutor: [du Châtelet](https://mathshistory.st-andrews.ac.uk/Biographies/Chatelet/)

### 40. Crossroads IV — The longitude voyage *(review, fictional scenario)*
- **Setting:** a 1760s voyage while Britain's Longitude Prize was still open.
- **Topics mixed:** logs for navigation calculations, ellipse orbits (of Jupiter's moons, used as a clock), why a pendulum clock fails on a rolling ship (the reason John Harrison built spring-driven sea clocks), refraction near the horizon when sighting stars, probability for insurance, compound interest on the voyage loan, a route graph between ports.
- **Sources:** Wikipedia: [Longitude Act](https://en.wikipedia.org/wiki/Longitude_Act) · [History of longitude](https://en.wikipedia.org/wiki/History_of_longitude) · [John Harrison](https://en.wikipedia.org/wiki/John_Harrison)

---

## Act V — Energy, fields and machines (1800 – 1900)

### 41. Finding Ceres — Göttingen, 1801
- **People:** Carl Friedrich Gauss (1777–1855); Giuseppe Piazzi; Adrien-Marie Legendre.
- **Topics:**
  - Piazzi discovers Ceres (1 January 1801), then loses it behind the Sun.
  - Gauss predicts where it will reappear, and it is recovered on 31 December 1801.
  - The **method of least squares**: the best line through noisy data.
  - The priority dispute: Legendre published least squares first (1805); Gauss published in *Theoria motus* (1809) and said he had used it since 1795.
  - The elimination method now named after Gauss (a link back to lesson 10).
- **In-story problem:** fit a least-squares line to five noisy observations (a small teaching data set); solve the resulting 2×2 system.
- **Echoes today:** GPS position fixes; trend lines in spreadsheets; fitting prices or growth; the starting point of machine learning.
- **Legend check:** the schoolboy Gauss adding 1 to 100 in seconds comes from Sartorius von Waltershausen's 1856 memoir; the numbers grew in later retellings.
- **Practice:** Algebra · Systems of Equations.
- **Sources:**
  - Gauss, C. F. (1809). *Theoria motus corporum coelestium*, tr. C. H. Davis (1857) (*PD*). Legendre, A.-M. (1805). *Nouvelles méthodes pour la détermination des orbites des comètes*.
  - Wikipedia: [Ceres (dwarf planet)](https://en.wikipedia.org/wiki/Ceres_(dwarf_planet)) · [Least squares](https://en.wikipedia.org/wiki/Least_squares) · [Carl Friedrich Gauss](https://en.wikipedia.org/wiki/Carl_Friedrich_Gauss) · [Adrien-Marie Legendre](https://en.wikipedia.org/wiki/Adrien-Marie_Legendre)
  - MacTutor: [Gauss](https://mathshistory.st-andrews.ac.uk/Biographies/Gauss/)

### 42. Everything is waves *(physics)* — Grenoble and Paris, 1807–1822
- **People:** Joseph Fourier (1768–1830).
- **Topics:**
  - Heat flow and the 1807 memoir (Lagrange objected to it).
  - *Théorie analytique de la chaleur* (1822): any periodic signal is a sum of sines and cosines.
  - Amplitude, frequency and period.
  - Building a square wave from odd harmonics.
- **In-story problem:** add the first 1, 3 and 5 terms of the square-wave series (widget); read amplitude and period off a sine formula.
- **Echoes today:** MP3 and JPEG compression; noise-cancelling headphones; MRI scanners; a music equaliser.
- **Practice:** Trigonometry · Graphing Trig Functions *(roadmap)*.
- **Sources:**
  - Fourier, J. (1822). *Théorie analytique de la chaleur*, tr. A. Freeman (1878), *The Analytical Theory of Heat* (*PD*).
  - Wikipedia: [Joseph Fourier](https://en.wikipedia.org/wiki/Joseph_Fourier) · [Fourier series](https://en.wikipedia.org/wiki/Fourier_series) · [Fourier transform](https://en.wikipedia.org/wiki/Fourier_transform) · [JPEG](https://en.wikipedia.org/wiki/JPEG) · [MP3](https://en.wikipedia.org/wiki/MP3)
  - MacTutor: [Fourier](https://mathshistory.st-andrews.ac.uk/Biographies/Fourier/)

### 43. Current and resistance *(physics)* — Como, Cologne and Königsberg, 1800–1845
- **People:** Alessandro Volta (1745–1827); Georg Simon Ohm (1789–1854); Gustav Kirchhoff (1824–1887).
- **Physics:**
  - Volta's pile (1800), the first battery.
  - Ohm's *Die galvanische Kette, mathematisch bearbeitet* (1827): current is proportional to voltage (V = IR). It was coldly received at first.
  - Electrical power P = VI.
  - Kirchhoff's current and voltage laws (1845, written while he was still a student).
  - Series and parallel circuits.
- **Maths it uses:** direct proportion and straight-line graphs; rearranging formulas; systems of linear equations (one per loop), a link back to the Nine Chapters (lesson 10) and Gauss (lesson 41).
- **In-story problem:** find the resistance from the slope of a voltage-current table; find the combined resistance of series and parallel resistors; solve a two-loop circuit as a 2×2 system.
- **Echoes today:** why a breaker trips (a 2,000 W kettle at 230 V draws ≈ 8.7 A); choosing a resistor for an LED; phone-charger wattage; reading the kWh on an electricity bill.
- **Practice:** Physics · Electricity Basics *(roadmap)*; Algebra · Systems of Equations.
- **Sources:**
  - Ohm, G. S. (1827). *Die galvanische Kette, mathematisch bearbeitet*. Berlin. Kirchhoff, G. (1845). *Annalen der Physik* 140(4), 497–514.
  - Wikipedia: [Voltaic pile](https://en.wikipedia.org/wiki/Voltaic_pile) · [Ohm's law](https://en.wikipedia.org/wiki/Ohm%27s_law) · [Georg Ohm](https://en.wikipedia.org/wiki/Georg_Ohm) · [Kirchhoff's circuit laws](https://en.wikipedia.org/wiki/Kirchhoff%27s_circuit_laws) · [Series and parallel circuits](https://en.wikipedia.org/wiki/Series_and_parallel_circuits)
  - MacTutor: [Ohm](https://mathshistory.st-andrews.ac.uk/Biographies/Ohm/) · [Kirchhoff](https://mathshistory.st-andrews.ac.uk/Biographies/Kirchhoff/)

### 44. Note G — London, 1843
- **People:** Ada Lovelace (1815–1852); Charles Babbage (1791–1871); Luigi Menabrea.
- **Topics:**
  - The Analytical Engine: a general-purpose mechanical computer, designed but never built.
  - Lovelace's translation of Menabrea's article, with her Notes A–G, three times as long as the article.
  - Note G: a step-by-step program to compute Bernoulli numbers, with variables, loops and a table of operations.
  - Her insight that the engine could work with symbols, not only numbers (for example, music).
- **In-story problem:** trace the first few rows of her operations table; write a loop (in plain steps) that sums 1² + 2² + … + n² and check it against a formula.
- **Echoes today:** every program, spreadsheet formula and app; thinking in algorithms (a link back to al-Khwarizmi, lesson 16).
- **Practice:** — (logic/algorithm widget only).
- **Sources:**
  - Menabrea, L. F. (1842). "Sketch of the Analytical Engine", tr. with notes by A. A. Lovelace (1843), *Scientific Memoirs* 3, 666–731 (*PD*).
  - Wikipedia: [Ada Lovelace](https://en.wikipedia.org/wiki/Ada_Lovelace) · [Analytical engine](https://en.wikipedia.org/wiki/Analytical_engine) · [Note G](https://en.wikipedia.org/wiki/Note_G) · [Bernoulli number](https://en.wikipedia.org/wiki/Bernoulli_number)
  - MacTutor: [Lovelace](https://mathshistory.st-andrews.ac.uk/Biographies/Lovelace/) · [Babbage](https://mathshistory.st-andrews.ac.uk/Biographies/Babbage/)

### 45. Heat is work *(physics)* — Manchester, 1843–1850
- **People:** James Prescott Joule (1818–1889); Julius Robert Mayer and Hermann von Helmholtz (*meanwhile*).
- **Physics:**
  - Joule's paddle-wheel experiment: falling weights turn paddles in water and warm it slightly.
  - The **mechanical equivalent of heat**: his 1850 figure was 772 foot-pounds per British thermal unit; today it is 4.184 J per calorie.
  - Conservation of energy (Mayer 1842, Helmholtz 1847), the first law of thermodynamics.
- **Maths it uses:** chains of unit conversions; setting mgh equal to mcΔT; measurement error (his temperature rises were fractions of a degree, read to 1/200 °F).
- **In-story problem:** a 10 kg weight falls 2 m, twenty times, stirring 1 kg of water: how much warmer does it get (≈ 0.94 °C)? How much warmer should the water be at the bottom of a 100 m waterfall (≈ 0.23 °C)?
- **Echoes today:** food calories against exercise (how high must a 70 kg person climb to burn a 200 kcal snack, ignoring the body's efficiency?); the cost of boiling a kettle; hot brakes; why engines need radiators.
- **Legend check:** Joule measuring waterfall temperatures on his honeymoon is told by William Thomson (Lord Kelvin), who met him in the Alps in 1847. Thomson's account mentions a long thermometer, and it's unclear whether any measurement was made.
- **Practice:** Physics · Work, Energy & Power *(roadmap)*; Arithmetic · Decimals.
- **Sources:**
  - Joule, J. P. (1850). "On the Mechanical Equivalent of Heat." *Philosophical Transactions of the Royal Society* 140, 61–82 (*PD*).
  - Wikipedia: [James Prescott Joule](https://en.wikipedia.org/wiki/James_Prescott_Joule) · [Mechanical equivalent of heat](https://en.wikipedia.org/wiki/Mechanical_equivalent_of_heat) · [Conservation of energy](https://en.wikipedia.org/wiki/Conservation_of_energy) · [First law of thermodynamics](https://en.wikipedia.org/wiki/First_law_of_thermodynamics) · [Calorie](https://en.wikipedia.org/wiki/Calorie)

### 46. Diagrams that save lives — Scutari and London, 1854–1858
- **People:** Florence Nightingale (1820–1910); William Farr; John Snow (*meanwhile*).
- **Topics:**
  - Mortality in the Crimean War: most soldiers died from preventable disease, not wounds.
  - Rates, not counts: deaths per 1,000 per year.
  - Her polar-area ("coxcomb") diagrams, and how a well-chosen chart changed policy.
  - In 1858 she became the first woman elected to the (Royal) Statistical Society.
- **In-story problem:** using figures from one month of her published tables, turn deaths and army size into an annual rate per 1,000; compare disease with wounds. The numbers are to be copied from the source when authored, not invented.
- **Echoes today:** public-health dashboards (COVID-19 case rates per 100,000); reading charts in the news critically; hospital infection rates.
- **Meanwhile:** John Snow's 1854 cholera map of Broad Street in London.
- **Practice:** Arithmetic · Percentages, Ratios.
- **Sources:**
  - Nightingale, F. (1858). *Notes on Matters Affecting the Health, Efficiency, and Hospital Administration of the British Army* (*PD*).
  - Wikipedia: [Florence Nightingale](https://en.wikipedia.org/wiki/Florence_Nightingale) · [Pie chart (polar area diagram)](https://en.wikipedia.org/wiki/Pie_chart#Polar_area_diagram) · [1854 Broad Street cholera outbreak](https://en.wikipedia.org/wiki/1854_Broad_Street_cholera_outbreak)
  - MacTutor: [Nightingale](https://mathshistory.st-andrews.ac.uk/Biographies/Nightingale/)

### 47. Tables that transform — London, 1850–1858 (and Mountain View, 1998)
- **People:** James Joseph Sylvester (who coined "matrix", 1850); Arthur Cayley (1821–1895); epilogue: Sergey Brin and Larry Page.
- **Topics:**
  - Cayley's *Memoir on the Theory of Matrices* (1858): matrices as objects you can add, multiply and invert.
  - Multiplication is not commutative (AB ≠ BA).
  - The determinant and the inverse.
  - A link back to the Nine Chapters' counting boards (lesson 10).
  - Epilogue: PageRank (1998) ranks web pages using a matrix.
- **In-story problem:** multiply two 2×2 rotation and scaling matrices in both orders and see the results differ; invert a 2×2 matrix to undo a transformation.
- **Echoes today:** every rotation in a video game or phone photo editor; PageRank-style ranking; spreadsheets of data; neural networks are chains of matrix multiplications.
- **Practice:** Algebra · Matrix Algebra.
- **Sources:**
  - Cayley, A. (1858). "A Memoir on the Theory of Matrices." *Philosophical Transactions of the Royal Society of London* 148, 17–37 (*PD*). Brin, S. & Page, L. (1998). "The anatomy of a large-scale hypertextual Web search engine." *Computer Networks and ISDN Systems* 30, 107–117.
  - Wikipedia: [Matrix (mathematics) (History)](https://en.wikipedia.org/wiki/Matrix_(mathematics)#History) · [Arthur Cayley](https://en.wikipedia.org/wiki/Arthur_Cayley) · [James Joseph Sylvester](https://en.wikipedia.org/wiki/James_Joseph_Sylvester) · [PageRank](https://en.wikipedia.org/wiki/PageRank) · [Rotation matrix](https://en.wikipedia.org/wiki/Rotation_matrix)
  - MacTutor: [Cayley](https://mathshistory.st-andrews.ac.uk/Biographies/Cayley/) · [Sylvester](https://mathshistory.st-andrews.ac.uk/Biographies/Sylvester/)

### 48. Light is a wave of fields *(physics)* — London and Karlsruhe, 1831–1887
- **People:** Michael Faraday (1791–1867); James Clerk Maxwell (1831–1879); Heinrich Hertz (1857–1894).
- **Physics:**
  - Faraday's electromagnetic induction (1831): a moving magnet makes a current. It is the principle behind every generator.
  - Maxwell's "A Dynamical Theory of the Electromagnetic Field" (1865): electric and magnetic fields make waves whose speed, computed from bench measurements of electricity, matches the speed of light. So light is an electromagnetic wave.
  - Hertz makes and detects radio waves (1887).
- **Maths it uses:** scientific notation; square roots, c = 1/√(μ₀ε₀); the wave relation v = fλ; sine waves (a link back to Fourier, lesson 42).
- **In-story problem:** compute 1/√(4π×10⁻⁷ × 8.854×10⁻¹²) ≈ 3.00×10⁸ m/s. Find the wavelength of 2.4 GHz Wi-Fi (12.5 cm) and of 100 MHz FM radio (3 m).
- **Echoes today:** radio, Wi-Fi, 5G and microwave ovens; why antennas are sized to wavelengths; power-station generators, transformers and wireless phone chargers (induction).
- **Legend check:** Faraday's reply to a politician, "one day, sir, you may tax it", is widely repeated but has no contemporary source.
- **Practice:** Physics · Waves & Sound *(roadmap)*; Arithmetic · Exponents & Roots.
- **Sources:**
  - Maxwell, J. C. (1865). "A Dynamical Theory of the Electromagnetic Field." *Philosophical Transactions of the Royal Society* 155, 459–512 (*PD*). Faraday, M. (1839–55). *Experimental Researches in Electricity* (*PD*).
  - Wikipedia: [A Dynamical Theory of the Electromagnetic Field](https://en.wikipedia.org/wiki/A_Dynamical_Theory_of_the_Electromagnetic_Field) · [James Clerk Maxwell](https://en.wikipedia.org/wiki/James_Clerk_Maxwell) · [Electromagnetic induction](https://en.wikipedia.org/wiki/Electromagnetic_induction) · [Heinrich Hertz](https://en.wikipedia.org/wiki/Heinrich_Hertz) · [Speed of light](https://en.wikipedia.org/wiki/Speed_of_light)
  - MacTutor: [Maxwell](https://mathshistory.st-andrews.ac.uk/Biographies/Maxwell/)

### 49. Crossroads V — The Atlantic cable *(review, fictional scenario)*
- **Setting:** the real 1858 and 1866 transatlantic telegraph cables. The 1858 cable failed within weeks after it was driven with too high a voltage; the 1866 cable worked, using William Thomson's sensitive mirror galvanometer.
- **Topics mixed:** Ohm's law over 3,000 km of copper (resistance grows with length), heat from current, fitting a line to noisy signal readings, signal speed and wavelength, a budget of costs by matrix.
- **Sources:** Wikipedia: [Transatlantic telegraph cable](https://en.wikipedia.org/wiki/Transatlantic_telegraph_cable) · [Lord Kelvin](https://en.wikipedia.org/wiki/Lord_Kelvin)

---

## Act VI — Relativity, information and space (1900 – today)

### 50. Escaping the Earth *(physics)* — Kaluga, 1903
- **People:** Konstantin Tsiolkovsky (1857–1935); Robert Goddard (first liquid-fuel rocket, 1926) and Hermann Oberth (*meanwhile*).
- **Physics:**
  - Momentum and Newton's third law: a rocket pushes gas back, and the gas pushes the rocket forward.
  - The **rocket equation**, Δv = vₑ ln(m₀/m_f), published in "Exploration of Outer Space by Means of Reaction Devices" (1903).
  - Orbital speed (≈ 7.8 km/s).
  - Multistage rockets.
- **Maths it uses:** natural logarithms and *e* (links back to lessons 29 and 37); exponentials (mass ratio = e^(Δv/vₑ)); comparing one stage with two.
- **In-story problem:** exhaust speed 3 km/s and about 9.4 km/s needed to reach orbit (including losses): what fraction of the launch mass reaches orbit? (e^(3.13) ≈ 23, so about 4%.) Then show why a two-stage rocket does better.
- **Echoes today:** why rockets are mostly fuel; reusable boosters; the recoil of a fire hose or a released balloon; ion engines on space probes (slow thrust, very high exhaust speed).
- **Legend check:** "Earth is the cradle of humanity, but one cannot live in the cradle forever" is from a 1911 letter by Tsiolkovsky; it is often misquoted.
- **Practice:** Algebra · Exponential & Logarithmic; Physics · Momentum & Collisions *(roadmap)*.
- **Sources:**
  - Tsiolkovsky, K. E. (1903). "Исследование мировых пространств реактивными приборами" ("Exploration of Outer Space by Means of Reaction Devices"). *Nauchnoye Obozreniye* 5.
  - Wikipedia: [Tsiolkovsky rocket equation](https://en.wikipedia.org/wiki/Tsiolkovsky_rocket_equation) · [Konstantin Tsiolkovsky](https://en.wikipedia.org/wiki/Konstantin_Tsiolkovsky) · [Multistage rocket](https://en.wikipedia.org/wiki/Multistage_rocket) · [Delta-v](https://en.wikipedia.org/wiki/Delta-v) · [Robert H. Goddard](https://en.wikipedia.org/wiki/Robert_H._Goddard)

### 51. Time is relative *(physics)* — Bern, 1905
- **People:** Albert Einstein (1879–1955); Hendrik Lorentz and Henri Poincaré (*meanwhile*); Hermann Minkowski (spacetime, 1908).
- **Physics:**
  - The *annus mirabilis* papers.
  - Two postulates: the laws of physics are the same for everyone moving steadily, and light's speed is the same for all observers.
  - The light clock shows **time dilation**, with factor γ = 1/√(1 − v²/c²).
  - E = mc² (the September 1905 paper).
  - Muons from cosmic rays reach the ground only because their clocks run slow (Rossi and Hall, 1941).
- **Maths it uses:** the Pythagorean theorem on the light clock's triangle gives γ (a link back to lesson 4); square roots; rearranging formulas.
- **In-story problem:** derive γ from the light-clock triangle and evaluate it at 0.6c (1.25). GPS clocks gain about 38 μs a day overall: roughly 45 μs from weaker gravity (general relativity) minus 7 μs from their speed. Turn that into a position error at the speed of light (about 11 km a day).
- **Echoes today:** GPS on every phone; nuclear power and the Sun's energy (E = mc²); PET scans in hospitals; particle accelerators.
- **Legend check:** the extent of Mileva Marić's contribution is debated by historians; the lesson presents the evidence rather than a verdict.
- **Practice:** Arithmetic · Exponents & Roots; Physics · Relativity *(new topic)*.
- **Sources:**
  - Einstein, A. (1905). "Zur Elektrodynamik bewegter Körper." *Annalen der Physik* 17, 891–921. Einstein, A. (1905). "Ist die Trägheit eines Körpers von seinem Energieinhalt abhängig?" *Annalen der Physik* 18, 639–641. Ashby, N. (2003). "Relativity in the Global Positioning System." *Living Reviews in Relativity* 6, 1.
  - Wikipedia: [Annus mirabilis papers](https://en.wikipedia.org/wiki/Annus_mirabilis_papers) · [Special relativity](https://en.wikipedia.org/wiki/Special_relativity) · [Time dilation](https://en.wikipedia.org/wiki/Time_dilation) · [Mass–energy equivalence](https://en.wikipedia.org/wiki/Mass%E2%80%93energy_equivalence) · [Rossi–Hall experiment](https://en.wikipedia.org/wiki/Rossi%E2%80%93Hall_experiment) · [Error analysis for the Global Positioning System](https://en.wikipedia.org/wiki/Error_analysis_for_the_Global_Positioning_System)
  - MacTutor: [Einstein](https://mathshistory.st-andrews.ac.uk/Biographies/Einstein/)

### 52. Symmetry and conservation *(physics)* — Göttingen, 1915–1918
- **People:** Emmy Noether (1882–1935); David Hilbert and Felix Klein, who brought her to Göttingen to help with general relativity.
- **Physics:**
  - **Noether's theorem** (1918): every continuous symmetry has a conserved quantity.
    - The laws are the same today as tomorrow → energy is conserved.
    - The same here as there → momentum is conserved.
    - The same in every direction → angular momentum is conserved.
  - Momentum in collisions; angular momentum in spins.
- **Maths it uses:** symmetry and transformations (translations and rotations, a link back to matrices in lesson 47); what "invariant" means; the algebra of collision equations.
- **History:** she taught for years under Hilbert's name because women could not qualify as lecturers until 1919. She was dismissed under Nazi laws in 1933 and moved to Bryn Mawr College.
- **In-story problem:** a 1,000 kg car at 20 m/s hits a stopped 1,500 kg car and they lock together: how fast do they move (8 m/s), and how much kinetic energy was lost? A skater halves her moment of inertia: how much faster does she spin?
- **Echoes today:** police crash reconstruction; recoil of a hose or a rifle; spins in skating and diving; why a moving bike stays upright more easily.
- **Legend check:** Hilbert's line "we are a university, not a bathhouse", in her defence, is a second-hand anecdote.
- **Practice:** Physics · Momentum & Collisions *(roadmap)*; Geometry · Transformations *(roadmap)*.
- **Sources:**
  - Noether, E. (1918). "Invariante Variationsprobleme." *Nachrichten von der Gesellschaft der Wissenschaften zu Göttingen, Math.-Phys. Klasse*, 235–257. English tr. M. A. Tavel (1971), *Transport Theory and Statistical Physics* 1(3), 183–207.
  - Wikipedia: [Emmy Noether](https://en.wikipedia.org/wiki/Emmy_Noether) · [Noether's theorem](https://en.wikipedia.org/wiki/Noether%27s_theorem) · [Momentum](https://en.wikipedia.org/wiki/Momentum) · [Angular momentum](https://en.wikipedia.org/wiki/Angular_momentum) · [Inelastic collision](https://en.wikipedia.org/wiki/Inelastic_collision)
  - MacTutor: [Emmy Noether](https://mathshistory.st-andrews.ac.uk/Biographies/Noether_Emmy/)

### 53. Counting information — Bell Labs, 1948
- **People:** Claude Shannon (1916–2001); John Tukey (who coined "bit"); Harry Nyquist and Ralph Hartley (*meanwhile*).
- **Topics:**
  - "A Mathematical Theory of Communication" (1948): information measured in **bits**.
  - log₂: how many yes/no questions pin down one of N options?
  - Entropy as average surprise.
  - Channel capacity: why noise limits speed.
- **In-story problem:** how many bits for one of 26 letters? For a 4-digit PIN? Compute the entropy of a biased coin (p = 0.9).
- **Echoes today:** file sizes and compression (ZIP, PNG); Wi-Fi and 5G data rates; password strength in bits.
- **Practice:** Algebra · Exponential & Logarithmic.
- **Sources:**
  - Shannon, C. E. (1948). "A Mathematical Theory of Communication." *Bell System Technical Journal* 27, 379–423 and 623–656.
  - Wikipedia: [A Mathematical Theory of Communication](https://en.wikipedia.org/wiki/A_Mathematical_Theory_of_Communication) · [Claude Shannon](https://en.wikipedia.org/wiki/Claude_Shannon) · [Bit](https://en.wikipedia.org/wiki/Bit) · [Entropy (information theory)](https://en.wikipedia.org/wiki/Entropy_(information_theory)) · [Password strength](https://en.wikipedia.org/wiki/Password_strength)
  - MacTutor: [Shannon](https://mathshistory.st-andrews.ac.uk/Biographies/Shannon/)

### 54. Check the numbers *(physics)* — NASA Langley, 1960–1962
- **People:** Katherine Johnson (1918–2020); Ted Skopinski; John Glenn.
- **Topics:**
  - The West Area Computing unit: segregated Black women mathematicians at Langley.
  - Johnson and Skopinski's 1960 report on where to aim a spacecraft's launch so it passes over a chosen point on Earth.
  - Orbits as ellipses (a link back to Kepler, lesson 28, and Newton, lesson 36); spherical geometry and trigonometry.
  - Friendship 7 (20 February 1962): Glenn asked for Johnson to check the electronic computer's orbit figures by hand before he would fly.
- **In-story problem:** from an orbit's perigee and apogee altitudes (Friendship 7's published values), find the semi-major axis and eccentricity; use Kepler's third law to estimate the period (≈ 88 minutes).
- **Echoes today:** GPS and communications satellites; the ISS orbiting every 90 minutes; checking a computer's answer with an estimate.
- **Practice:** Algebra · Conic Sections; Trigonometry *(roadmap)*.
- **Sources:**
  - Skopinski, T. H. & Johnson, K. G. (1960). *Determination of Azimuth Angle at Burnout for Placing a Satellite Over a Selected Earth Position*. NASA Technical Note D-233. Shetterly, M. L. (2016). *Hidden Figures*. William Morrow.
  - NASA: [Katherine Johnson biography](https://www.nasa.gov/centers-and-facilities/langley/katherine-johnson-biography/)
  - Wikipedia: [Katherine Johnson](https://en.wikipedia.org/wiki/Katherine_Johnson) · [Mercury-Atlas 6](https://en.wikipedia.org/wiki/Mercury-Atlas_6) · [West Area Computers](https://en.wikipedia.org/wiki/West_Area_Computers) · [Hidden Figures (book)](https://en.wikipedia.org/wiki/Hidden_Figures_(book))

### 55. Crossroads VI — Mission control *(review, fictional scenario)*
- **Setting:** planning a satellite launch with a modern mission team.
- **Topics mixed:** the rocket equation for the fuel budget, orbit ellipses and Newton's gravity for the target orbit, relativity corrections to the satellite's clock, momentum for docking, least-squares tracking, matrix rotation for attitude, bits for the downlink.
- **Sources:** as for lessons 50–54.

---

## Summary

| Act | Lessons | Span | Maths strands | Physics lessons |
|---|---|---|---|---|
| I · Ancient worlds | 1–13 | c. 1800 BCE – 415 CE | Number, Geometry, Algebra (systems), Conics | 7 levers and buoyancy · 11 reflection |
| II · India, the House of Wisdom and beyond | 14–23 | 499 – 1450 | Trigonometry, Number, Algebra, Series | 17 optics and the camera · 21 speed and graphs |
| III · Secrets and duels | 24–27 | 1500 – 1600 | Algebra, Complex numbers, Notation | — |
| IV · The Scientific Revolution | 28–40 | 1609 – 1760s | Conics, Logs, Coordinates, Probability, Calculus, *e*, Graphs | 28 orbits · 31 refraction · 32 falling and projectiles · 34 pendulums and springs · 36 Newton's laws and gravity · 39 energy |
| V · Energy, fields and machines | 41–49 | 1800 – 1900 | Statistics, Waves, Computing, Data, Matrices | 42 heat and waves · 43 circuits · 45 conservation of energy · 48 electromagnetism and light |
| VI · Relativity, information and space | 50–55 | 1903 – 1962 | Logs, Information, Orbits | 50 rockets · 51 relativity · 52 symmetry and momentum · 54 orbits |

55 lessons in all: 49 stories (18 of them physics) and 6 Crossroads reviews.

### The physics thread

Read **By strand → Physics**, the physics lessons form their own story from Archimedes to spaceflight. Each is paired with the maths lesson it depends on:

| Physics lesson | Maths it leans on (earlier lesson) |
|---|---|
| 7 Lever and buoyancy | ratio and proportion (3) |
| 11 Reflection | geometry of triangles (4, 5), square roots (1) |
| 17 Pinhole camera | similar triangles (3) |
| 21 Mean speed | area of triangles (5); it is itself an early graph, 300 years before Descartes (30) |
| 28 Kepler's orbits | ellipses (9) |
| 31 Refraction | sines (14) |
| 32 Falling bodies, projectiles | squares and the parabola (9, 16) |
| 34 Pendulums and springs | square roots (1), linear graphs (30) |
| 36 Gravity | inverse proportion (7), ellipses (9, 28), calculus (35) |
| 39 Kinetic energy | quadratics (16, 32) |
| 42 Heat and waves | sines (14) |
| 43 Circuits | linear systems (10, 41) |
| 45 Heat as energy | unit conversion (26) |
| 48 Electromagnetic waves | waves (42), square roots |
| 50 Rockets | natural logs and *e* (29, 37) |
| 51 Relativity | Pythagoras (4) |
| 52 Conservation laws | transformations and matrices (47) |
| 54 Orbits for spaceflight | ellipses (28), gravity (36) |

### Practice coverage

- **Built Arithmetic and Algebra topics:** lessons 1–3, 5, 7, 8, 10, 15–20, 24–26, 28–30, 32, 34, 37, 41, 43, 45–48, 50, 51, 53 and 54.
- **Roadmap subjects:** the rest need Geometry, Trigonometry or Calculus, or new subjects: Probability, Discrete Maths, and a **Linear Equations** topic in Arithmetic (used by lessons 2 and 12).
- **Physics:** the physics lessons link into the Physics subject planned in `ROADMAP.md`:
  - Kinematics: 21, 32
  - Forces: 7, 36
  - Work & Energy: 39, 45
  - Momentum: 50, 52
  - Circular Motion & Gravitation: 36
  - Waves: 34, 48
  - Electricity: 43
  - two new topics: **Optics** (11, 17, 31) and **Relativity** (51)

**Pilot (from `STORIES.md` §7):** 8 *Measuring the Earth*, 16 *Restoring and balancing*, 32 *Two new sciences* (Galileo, the first physics lesson). 24 *The secret of the cubic* follows.
