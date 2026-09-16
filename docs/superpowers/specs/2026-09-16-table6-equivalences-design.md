# Table 6 equivalence drills — design

**Date:** 2026-09-16
**Status:** approved, ready for an implementation plan
**Scope:** the "Name the law" rapid-fire category, rebuilt on the full Table 6, plus a new
top-level `06 / Equivalences` mode that asks you to complete the other side of a row.

The match modes (tautology ↔ form ↔ name) are a separate design and are **not** in scope here.
They share `content/table6.json`, so this spec ships first.

## 1. Problem

Table 6 is the one table on Test 1 that has to be recalled in both directions: you name a law when
you justify a proof step, and you produce the other side when you rewrite an expression. Today the
app only does the first, and only partially:

- `js/generators.js` hard-codes a 14-entry `laws` array. Table 6 has **19** rows.
- Most paired laws appear in one direction only. `dom` only ever asks `p ∨ T ≡ T`; `p ∧ F ≡ F` is
  never drilled. Same for identity, idempotent, commutative, associative, distributive, absorption,
  negation.
- Rows are always printed with `rename()` applied, so the drill never shows the table as Rosen
  prints it.
- Nothing asks you to *produce* an equivalent form.

## 2. Content

### 2.1 `content/table6.json`

Exactly the 19 rows of Rosen Table 6 (8th ed., p. 29), in the book's order. No Table 7 or 8 rows.

```json
{"id": "t6-dist-2", "law": "dist", "name": "Distributive", "order": 13,
 "left": "p ∧ (q ∨ r)", "right": "(p ∧ q) ∨ (p ∧ r)"}
```

| order | law | left | right | name |
|---|---|---|---|---|
| 1 | identity | `p ∧ T` | `p` | Identity |
| 2 | identity | `p ∨ F` | `p` | Identity |
| 3 | dom | `p ∨ T` | `T` | Domination |
| 4 | dom | `p ∧ F` | `F` | Domination |
| 5 | idem | `p ∨ p` | `p` | Idempotent |
| 6 | idem | `p ∧ p` | `p` | Idempotent |
| 7 | dn | `¬(¬p)` | `p` | Double negation |
| 8 | comm | `p ∨ q` | `q ∨ p` | Commutative |
| 9 | comm | `p ∧ q` | `q ∧ p` | Commutative |
| 10 | assoc | `(p ∨ q) ∨ r` | `p ∨ (q ∨ r)` | Associative |
| 11 | assoc | `(p ∧ q) ∧ r` | `p ∧ (q ∧ r)` | Associative |
| 12 | dist | `p ∨ (q ∧ r)` | `(p ∨ q) ∧ (p ∨ r)` | Distributive |
| 13 | dist | `p ∧ (q ∨ r)` | `(p ∧ q) ∨ (p ∧ r)` | Distributive |
| 14 | dm | `¬(p ∧ q)` | `¬p ∨ ¬q` | De Morgan |
| 15 | dm | `¬(p ∨ q)` | `¬p ∧ ¬q` | De Morgan |
| 16 | abs | `p ∨ (p ∧ q)` | `p` | Absorption |
| 17 | abs | `p ∧ (p ∨ q)` | `p` | Absorption |
| 18 | neg | `p ∨ ¬p` | `T` | Negation |
| 19 | neg | `p ∧ ¬p` | `F` | Negation |

### 2.2 `content/table7.json`

The three rows Dr. Joe allows to be cited from Tables 7 and 8, same schema with `t7-` ids, `order` continuing at 20:

| order | law | left | right | name |
|---|---|---|---|---|
| 20 | implication | `p → q` | `¬p ∨ q` | Conditional-disjunction (7.1) |
| 21 | contrapositive | `p → q` | `¬q → ¬p` | Contrapositive |
| 22 | biconditional | `p ↔ q` | `(p → q) ∧ (q → p)` | Biconditional definition (8.1) |

Both files load in `app.js` alongside the existing content fetches, as `data.table6` and `data.table7`.

### 2.3 The Table 7/8 toggle

`state.settings.includeTable7`, **default `false`**, because these three rows have not been studied
yet and being tested on them is noise.

- A checkbox on the rapid-fire setup screen, beside the category list:
  *"Include Tables 7/8 rows — 3 rows you haven't covered yet."*
- The same checkbox on the Equivalences setup screen; one setting, both screens.
- Off: the three rows never appear in either drill, are excluded from every coverage count and
  denominator, and the coverage grid reads out of 19. On: both drills draw from all 22 and
  denominators become 22.

The existing `laws` array in `generators.js` is deleted; its three Table 7/8 entries are exactly the
rows now in `table7.json`, so no content is lost.

## 3. Drill one — "Name the law" (existing rapid-fire category)

No new mode. The `law` category in `js/rapidfire.js` keeps its label, its clock, its miss bank and
its `1.3-<law>` topic tags; only its item source and presentation change.

- **Source:** `data.table6` (plus `data.table7` when the toggle is on) instead of the hard-coded array.
- **Prompt:** the row centred in Table 6 layout, `left ≡ right`, name withheld.
- **Answer:** the law name, graded by `textCanonical`, the alias lookup the category already uses. The `aliases` table in
  `normalize.js` is extended to cover every name in the two files, including the short forms already
  in muscle memory: `dm`, `demorgan`, `de morgans`, `dn`, `dist`, `assoc`, `comm`, `idem`, `abs`,
  `dom`, `identity`, `negation`.
- **Explanation on a miss:** the full row with its name, as `full(law)` renders today.

### 3.1 Escalating variation

Per-row history lives in `state.table6[rowId] = {right, wrong, lastSeen}`, incremented on every
answer in either drill.

| `right` for that row | Presentation |
|---|---|
| 0–1 | Rosen's letters, verbatim |
| 2–4 | Variables renamed (`a ∧ (b ∨ c) ≡ (a ∧ b) ∨ (a ∧ c)`) |
| 5+ | One variable substituted with a compound (`(p → q) ∧ (r ∨ s) ≡ …`) |

Renaming reuses the existing `rename()` approach but must be **injective** — two distinct variables
may never map to the same letter, or the row stops being an instance of the law.

## 4. Drill two — `06 / Equivalences` (new top-level mode)

A new mode in `js/equivalences.js`, lazy-loaded from `route()` in `app.js` with the same
`try/catch` fallback panel rapid-fire uses. Nav gains `06 Equivalences`; home gains a mode card.

- **Task:** the law's name plus one side of the row; the other side is blank. Which side is blanked
  is random per item, so absorption is drilled as both `p ∨ (p ∧ q) ≡ ___` and `___ ≡ p`.
  When the blanked side is the bare `p`, `T` or `F`, the item is still legitimate but trivial —
  those rows (identity, domination, idempotent, absorption, negation) always blank the **compound**
  side instead.
- **Pacing:** untimed. Default is a walk through the table in book order; a "weak rows only" toggle
  restricts to rows where `wrong > right`.
- **Wrong answer:** reveals the full row with its name, and requeues that row three items later,
  mirroring rapid-fire's requeue.
- **Coverage grid:** one cell per row under the prompt — empty, amber (`wrong > 0, right < 2`),
  green (`right ≥ 2`). 19 cells, or 22 with the toggle on.
- **Keyboard:** typed answer, Enter submits, same symbol entry as rapid-fire (`->`, `&`, `v`, `~`
  all normalize through `symbols()`).

## 5. The structural matcher

The one piece that needs new logic in `normalize.js`.

`canonical(parse(x))` sorts the arguments of `∧`/`∨` and flattens same-operator chains, so it
reports `p ∨ q` and `q ∨ p` as identical. Grading this drill with it would accept echoing the prompt
back for **commutative, associative and idempotent** — precisely the rows the drill exists to teach.

Add:

```js
export function print(node)          // re-render a parse tree, minimal parens, no reordering
export function structural(given, expected)  // print(parse(given)) === print(parse(expected))
```

- `print` emits parentheses only where precedence requires them, so `(p ∧ q) ∨ r` and `p ∧ q ∨ r`
  compare equal but `p ∨ (q ∧ r)` stays distinct from `(p ∨ q) ∧ r`.
- Input still passes through `symbols()` first, so `->`, `~`, `&`, `v`, `true`/`T`, and stray
  whitespace are all accepted.
- `structural` returns `false` rather than throwing when the input does not parse; a malformed
  answer is a wrong answer, not a crash.

`matches()` is untouched, so every existing drill keeps its current grading.

## 6. State and persistence

Added to `fresh()` in `js/store.js`:

```js
settings: { …, includeTable7: false },
table6: {},                               // rowId -> {right, wrong, lastSeen}
equivalences: { attempts: [], sessions: [] }
```

- `validate()` accepts both new keys and rejects malformed ones in the style of the existing checks.
- `load()` backfills them when absent, the way `wrongMode` is backfilled today, so the current
  localStorage save and any previously exported JSON still load without error.
- `save()` trims `equivalences.attempts` to the last 2000, matching the rapid-fire cap.
- Attempts carry `{ok, ms, topic, cat:'complete', item, prompt, given, expected}` — the rapid-fire
  attempt shape, so the miss bank and weakness report can read them unchanged.

### Mastery

`mastery()` folds `equivalences.attempts` into the drill-accuracy term `r` alongside rapid-fire, but
**excludes** them from `median` and `trend`. Those two are rapid-fire speed metrics; typing a full
expression takes several times longer than typing a name, and mixing the two would make the median
meaningless.

## 7. Error handling

- A lazy-import failure shows the same visible panel rapid-fire shows, not a blank screen.
- If `content/table6.json` fails to fetch or parse, the Equivalences mode renders an explicit error
  naming the file, and the `law` rapid-fire category is disabled on the setup screen rather than
  producing empty items.
- An unparseable row in the content file is a test failure (§8), not a runtime surprise.

## 8. Tests

All in `js/tests.js`, all pure functions; the board DOM stays untested, consistent with the rest of
the app.

1. **Every row is true.** For each row in both files, parse both sides and compare `evaluate()` over
   all 2ⁿ assignments of its variables. This is the test that matters most — a typo in the table
   would actively teach the wrong law.
2. **Row counts.** `table6.json` has 19 rows; `table7.json` has 3; `order` values are 1–22 with no
   gaps or duplicates; every `law` key has a name in `names`.
3. **Structural matcher accepts** the distributive answer, `T` for `true`, `->` for `→`, and
   redundant outer parentheses.
4. **Structural matcher rejects** the echo: `p ∨ q` is not an answer to `p ∨ q ≡ ___` (commutative),
   and `(p ∨ q) ∨ r` is not an answer to itself (associative).
5. **Structural matcher returns false, does not throw,** on garbage input.
6. **Renaming is injective** — no two distinct variables collapse to one letter — and a renamed row
   is still a true equivalence when re-checked by truth table.
7. **The toggle is honoured:** with `includeTable7` false, no item drawn by either drill has an `id`
   beginning `t7-`, and the coverage denominator is 19.

## 9. Files

**New**
- `content/table6.json` — 19 rows
- `content/table7.json` — 3 rows
- `js/equivalences.js` — the new mode

**Edited**
- `js/generators.js` — `law()` reads `data.table6`; the hard-coded `laws` array is removed
- `js/normalize.js` — `print()`, `structural()`, extended `aliases`
- `js/app.js` — content fetch, `#equivalences` route, nav entry, home mode card
- `js/store.js` — `includeTable7`, `state.table6`, `state.equivalences`, validate/load/save, mastery
- `js/rapidfire.js` — the Table 7/8 checkbox on the setup screen
- `js/tests.js` — the tests in §8
- `index.html` — nav link
- `style.css` — Table 6 row layout, coverage grid
