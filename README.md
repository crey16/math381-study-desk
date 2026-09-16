# MATH 381 study desk

Run from this folder:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. No build, package install, or network service is required. KaTeX and its fonts are local; Unicode remains readable without it.

Study in order: Flashcards (flip cards, then Learn) → Rapid-fire → Weakness report → Problem grind.

Learn (`#flashcards/learn`) works like Quizlet Learn: rounds of seven multiple-choice questions with distractors drawn from the same topic, then you mark each card Know or Still learning. Known cards leave the rotation; still-learning cards come back first in the next round. Marks feed the Leitner boxes (Know = Good, Don't know = Again) and appear on the flip-card view, which uses the same arrow keys.

Keyboard: home `1–4` selects a mode; `Esc` returns home; `?` shows help. Cards: `→` marks Know, `←` marks Don't know. Learn: `1–4` picks an answer, `→`/`←` marks it, `Enter` accepts the highlighted mark or starts the next round. Rapid-fire: type for auto-advance, `Enter` submits a miss, a wrong answer pauses the clock until `Enter`/`Space` (or pick a timed display in setup), Escape ends the session; every miss goes to a miss bank you can browse with arrow keys and drill directly; symbol buttons under the answer box insert ¬ ∧ ∨ → ↔ ∀ ∃ and friends if you cannot type them. Problems: `N`/`P` navigate, `H` reveals hints, `S` toggles the solution, `1`/`2`/`3` grades Wrong/Partly/Right. Shortcuts are inactive while typing scratch work; Tab navigates controls.

Progress is stored only in `localStorage["math381.v1"]`. Export for backup or transfer; Import validates then asks before replacing progress. Reset asks for confirmation. A page refresh loads updated content while preserving progress. Keep the same host/port to use the same browser storage.

Open http://localhost:8000/tests.html for browser assertions. The app contains 189 cards, 85 topic notes, and 425 worked problems: 282 textbook, 27 homework, 56 class/practice, 60 generated. See [DECISIONS.md](DECISIONS.md) for source corrections and exact exercise coverage. The supplied 1.1 and 1.7 extracts stop at #27 and #24, respectively; later textbook exercise prompts are not included. Mixed quantifier-inference exercises and Cartesian products are excluded.

Authoring helpers in `scripts/` are optional and are not part of the runtime. They require Node only if you choose to run them; the study app does not. Untracked `materials/` files are the user's original source materials; `SPEC.md` and `CLAUDE_CODE_PROMPT.md` are the private build brief and are also left untracked on purpose. `.qa/` is ignored via `.gitignore`.
