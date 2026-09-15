# Math Studio — Roadmap

Planning doc for the next subjects to add, following the existing pattern: each **subject** (Algebra, Arithmetic, ...) has several **topics**, each topic has a Learn tab (concepts + worked examples) and a Practice tab (2-4 generated problem types, graded automatically).

Suggested build order: **Geometry → Trigonometry → Calculus → Physics** (Physics leans on trig identities and derivative/integral mechanics, so it should come last).

---

## Geometry

Shapes, angles, and measurement in the plane and in 3D.

1. **Angles & Angle Relationships** — complementary/supplementary angles, vertical angles, angles formed by a transversal cutting parallel lines
   - Practice: solve for a missing angle given a relationship; identify/compute angles from a parallel-lines-and-transversal diagram
2. **Triangles** — angle sum, classifying triangles, Pythagorean theorem, special right triangles (30-60-90, 45-45-90)
   - Practice: find a missing side via Pythagorean theorem; find missing sides/angles in a special right triangle; find a missing triangle angle
3. **Polygons & Quadrilaterals** — interior/exterior angle sums, properties of parallelograms/trapezoids/rhombi, regular polygons
   - Practice: interior/exterior angle sum for an n-gon; solve for a missing angle or side in a parallelogram/trapezoid
4. **Perimeter & Area** — triangles, quadrilaterals, regular polygons, composite figures
   - Practice: area/perimeter of a given shape; area of a composite figure (add/subtract regions)
5. **Circles** — circumference, area, arc length, sector area, central/inscribed angles
   - Practice: circumference/area from radius or diameter; arc length or sector area from a central angle
6. **Surface Area & Volume** — prisms, cylinders, pyramids, cones, spheres
   - Practice: volume of a solid; surface area of a solid
7. **Coordinate Geometry** — distance formula, midpoint formula, slope, equation of a line through two points
   - Practice: distance/midpoint between two points; find the equation of a line through two points
8. **Transformations** — translations, reflections, rotations, dilations as coordinate rules
   - Practice: apply a given transformation to a point/shape and find the image coordinates

---

## Trigonometry

Right-triangle trig, the unit circle, identities, and graphing.

1. **Right Triangle Trigonometry** — SOH-CAH-TOA, solving for a missing side or angle, angle of elevation/depression
   - Practice: find a missing side given an angle and one side; find a missing angle given two sides
2. **The Unit Circle** — special angles (multiples of 30°/45°), reference angles, exact values of sin/cos/tan
   - Practice: evaluate sin/cos/tan at a special angle; find the reference angle for a given angle
3. **Trig Identities** — Pythagorean identities, reciprocal/quotient identities, simplifying expressions
   - Practice: simplify a trig expression using an identity; verify/complete an identity numerically
4. **Graphing Trig Functions** — amplitude, period, phase shift, vertical shift for sine/cosine/tangent
   - Practice: read amplitude/period/shift off a function's equation; write an equation from a description of the graph
5. **Solving Trig Equations** — basic equations over a stated interval, using identities to reduce to a solvable form
   - Practice: solve \(a\sin(bx+c) = k\) style equations over \([0, 2\pi)\)
6. **Law of Sines & Law of Cosines** — solving oblique (non-right) triangles, the ambiguous (SSA) case
   - Practice: find a missing side/angle via Law of Sines; find a missing side/angle via Law of Cosines
7. **Inverse Trig Functions** — evaluating arcsin/arccos/arctan, domain and range
   - Practice: evaluate an inverse trig function at a standard value

---

## Calculus

Limits through basic integration, with an eye toward what Physics will need.

1. **Limits & Continuity** — evaluating limits algebraically/graphically, one-sided limits, limits at infinity, identifying discontinuities
   - Practice: evaluate a limit (direct substitution, factoring, or rationalizing); determine if a piecewise function is continuous at a point
2. **Derivatives — Rules** — power, product, quotient, and chain rules; derivatives of trig/exponential/log functions
   - Practice: differentiate a polynomial/product/quotient/composite function
3. **Derivatives — Applications** — related rates, optimization, curve sketching (increasing/decreasing, concavity, critical/inflection points)
   - Practice: find critical points and classify local max/min; solve a basic related-rates or optimization word problem
4. **Integrals — Basics** — antiderivatives, power rule for integration, u-substitution, definite integrals via the Fundamental Theorem of Calculus
   - Practice: find an indefinite integral; evaluate a definite integral
5. **Integrals — Applications** — area between two curves, volume of revolution (disk/washer), average value of a function
   - Practice: find the area between two curves; find the volume of a solid of revolution
6. **Differential Equations (intro)** — separable equations, slope fields, exponential growth/decay models
   - Practice: solve a separable differential equation; solve a growth/decay word problem

---

## Physics (Applied Math)

Framed as "the math of mechanics" — formula-driven problems that reuse the algebra/trig/calculus already built, rather than a full physics course.

1. **Kinematics** — position/velocity/acceleration relationships, constant-acceleration equations, free fall, projectile motion
   - Practice: solve a constant-acceleration kinematics problem for a missing variable; find range/max height of a projectile
2. **Forces & Newton's Laws** — net force, \(F = ma\), friction, inclined planes, tension in simple systems
   - Practice: find net force or acceleration given forces; solve a friction or inclined-plane problem
3. **Work, Energy & Power** — work-energy theorem, kinetic/potential energy, conservation of mechanical energy, power
   - Practice: find work done by a force; apply conservation of energy to find a speed or height
4. **Momentum & Collisions** — impulse-momentum theorem, conservation of momentum, elastic vs. inelastic collisions
   - Practice: find momentum/impulse; solve a 1D collision for a final velocity
5. **Circular Motion & Gravitation** — centripetal acceleration/force, universal gravitation, basic orbital relationships
   - Practice: find centripetal force/acceleration; apply Newton's law of gravitation between two masses
6. **Waves & Sound** *(stretch)* — wave speed/frequency/wavelength relationship, basic wave properties
   - Practice: solve \(v = f\lambda\) for a missing variable
7. **Electricity Basics** *(stretch)* — Ohm's law, series/parallel circuits, electric power
   - Practice: solve for V/I/R via Ohm's law; find equivalent resistance in a simple series/parallel circuit

---

## Notes for implementation later

- Same architecture as Algebra/Arithmetic: one `<subject>.json` (Learn content) + one `<subject>_generators.js` (Practice, 2-4 hand-written generator/checker pairs per topic), registered in `SUBJECTS` in `app.js`.
- Geometry and some Physics topics (projectile motion, circles, transformations) are good candidates for the existing Highcharts chart infrastructure (`sampleFn`, `circlePoints`, `transformSquare`, etc. in `core.js`) — may want a couple of new geometry-specific chart helpers (e.g. drawing a labeled polygon/triangle from vertices).
- Calculus checkers can mostly reuse the existing numeric-equivalence approach (`checkExpressionEquiv`/`evalExprAt` in `core.js`) for derivative/antiderivative answers, same as the rational-expression generators do today.
- Physics problems are just algebra with units in the prompt — no new checking machinery needed, but prompts/answers should state units explicitly and decide whether the grader requires them (recommend: grade the numeric value only, state the expected unit in the prompt/label).
