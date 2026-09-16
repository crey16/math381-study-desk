# Match modes (tautology ↔ form ↔ name) — design

**Date:** 2026-09-16
**Status:** DRAFT — parked, not yet approved. Captured so the decisions already made are not lost.
**Depends on:** `content/table6.json` from the Table 6 equivalence spec, which ships first.

## Decisions already settled

- **Board shape:** group builder. Every chip in the round is shuffled into one pool; you click or
  number-key chips to assemble a group, and a complete correct group locks. Because the check is
  "the built set equals some group", 2-piece and 3-piece groups coexist in one round with no mode
  switch — which is what makes mixing laws (2 pieces) and rules (3 pieces) work.
- **Hard mode:** chips are punched with holes, and you **drag** fragment tiles into them. One shared
  tray for the whole board, plus `max(2, holes/3)` decoys made by toggling a negation or swapping a
  variable, deduped against every real fragment, so holes can't be solved by elimination. A wrong
  drop bounces back and counts a miss.
- **Round shape:** timed. Setup screen picks the pools and the difficulty; one board of ~5 groups;
  clock counts up; best time per pool-set is saved and shown.
- **Pool picker:** which pools are in play is chosen per game on the setup screen.

## Pools

| Pool | Groups | Pieces |
|---|---|---|
| `rules` | 8 | name · argument form · tautology |
| `fallacies` | 2 | name · form · counterexample line |
| `laws` | 19 | equivalence · name — from `content/table6.json` |
| `methods` | 7 | name · what you assume · what you conclude |
| `quantifiers` | 4 | statement · its negation · rule name |
| `conditional` | 4 | name · symbolic form · English gloss |

`rules` and `fallacies` derive from the existing `bookRules`, `ruleTautologies` and `names` exports
in `generators.js`, so Table 1 stays single-sourced. `methods`, `quantifiers` and `conditional` need
about 15 short new rows.

**Chips must be unique within a round.** De Morgan has two rows in Table 6 sharing one name, so
round-building dedupes by piece text and keeps one.

## Hole punching

`js/blank.js` does not use hand-authored blanks. For a symbolic piece it runs `parse()` from
`normalize.js`, picks one or two random **subtrees**, and re-renders with the blanks in place, so a
hole is always a real subexpression and the correct tile text is generated rather than guessed.
Argument forms are parsed line by line; equivalences are split on `≡`. Name and gloss pieces blank a
whole word instead.

A tile fits a hole when the two compare equal under the parser, so identical fragments in the tray
are interchangeable.

## Input

Drag-and-drop is primary. Click-tile-then-click-hole and number-key-tile-then-number-key-hole run
through the same `select()` / `place()` pair, which keeps the keyboard-first promise in SPEC §1.

## State

`state.match = {sessions: [], attempts: [], best: {}}`, with `best` keyed
`pools.sort().join('+') + ':' + difficulty`. `validate()` accepts it and `load()` backfills it.
Attempts fold into `mastery()`'s drill-accuracy term but are excluded from median and trend, for the
same reason as the Equivalences mode.

## Open questions

- Where the mode sits in the numbered nav, given Equivalences takes `06`.
- Whether a mixed-pool round should cap the number of 3-piece groups so the board stays readable.

## Files

**New:** `js/pools.js`, `js/blank.js`, `js/match.js`.
**Edited:** `js/app.js`, `js/store.js`, `js/tests.js`, `index.html`, `style.css`.
