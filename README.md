# MATH 381 study desk

Run from this folder:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. No build, package install, or network service is required. KaTeX and its fonts are local; Unicode remains readable without it.

Study in order: Flashcards (one set per section: flip cards, then Learn) → Rapid-fire → Weakness report → Problem grind.

Flashcards are grouped into seven sets, one per section (`#flashcards/1.3`). Flip through a set marking Know or Don't know; the summary offers a pass over only the still-learning cards, Learn on the set, or the next set. Learn (`#flashcards/learn/1.3`) works like Quizlet Learn: rounds of seven multiple-choice questions with distractors drawn from the same topic, then you mark each card Know or Still learning. Known cards leave the rotation; still-learning cards come back first in the next round. Marks feed the Leitner boxes (Know = Good, Don't know = Again) and appear on the flip-card view, which uses the same arrow keys.

Keyboard: home `1–4` selects a mode; `Esc` returns home; `?` shows help. Cards: `→` marks Know, `←` marks Don't know. Learn: `1–4` picks an answer, `→`/`←` marks it, `Enter` accepts the highlighted mark or starts the next round. Rapid-fire: type for auto-advance (it advances only when what you typed cannot grow into a longer accepted spelling, so “dom” waits for “domination” while “mp” fires at once), `Enter` submits a miss, `I don't know` (or Enter on an empty box) reveals the answer and counts as a miss, a wrong answer pauses the clock until `Enter`/`Space` (or pick a timed display in setup), Escape ends the session; every miss goes to a miss bank you can browse with arrow keys and drill directly; “Name the rule” shows each §1.6 rule exactly as in Table 1 (p, q, r, premises over a line) and you type the name or its abbreviation; switch “Rules of inference” in setup to renamed variables when ready; the “Which proof method?” category (direct, contraposition, contradiction, contradiction of an implication, biconditional, TFAE, counterexample; aliases such as cp, ci, iff, tfae, ce) mixes 72 hand-written theorem statements with verified generated variants and accepts plain “contradiction” for both contradiction types unless “Strict contradiction types” is on; symbol buttons under the answer box insert ¬ ∧ ∨ → ↔ ∀ ∃ and friends if you cannot type them. Problems: `N`/`P` navigate, `H` reveals hints, `S` toggles the solution, `1`/`2`/`3` grades Wrong/Partly/Right. Shortcuts are inactive while typing scratch work; Tab navigates controls.

Progress is stored only in `localStorage["math381.v1"]`. Export for backup or transfer; Import validates then asks before replacing progress. Reset asks for confirmation. A page refresh loads updated content while preserving progress. Keep the same host/port to use the same browser storage.

Open http://localhost:8000/tests.html for browser assertions. The app contains 187 cards, 86 topic notes, and 425 worked problems: 282 textbook, 27 homework, 56 class/practice, 60 generated. See [DECISIONS.md](DECISIONS.md) for source corrections and exact exercise coverage. The supplied 1.1 and 1.7 extracts stop at #27 and #24, respectively; later textbook exercise prompts are not included. Mixed quantifier-inference exercises and Cartesian products are excluded.

Authoring helpers in `scripts/` are optional and are not part of the runtime. They require Node only if you choose to run them; the study app does not. Untracked `materials/` files are the original source materials, and private build briefs remain outside the repository. `.qa/` is ignored via `.gitignore`.

This public repository contains the runnable study app and its authored content. The private source packets and build briefs remain outside the repository.
