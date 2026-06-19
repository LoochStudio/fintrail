# Design QA — Программа лояльности

- Final result: passed
- Scope: desktop, 1440 × 900
- Source of truth: Figma `4212:55890`, `4339:48261`, `3696:51174`, `3881:58506`, `3696:51246`
- Implementation: `http://127.0.0.1:5173/personal/loyalty/`
- State checked: initial page, operations carousel at start and fully scrolled right, second loyalty level expanded, first FAQ expanded, animated progress state

## Evidence

- Full-view pass: section order, shared personal header, viewed products, community and footer verified in the browser.
- Focused pass: hero 366 px; tiers 549 px; operations 167 px; FAQ/Trade-in 495 px; help 92 px.
- Gaps: 40 px after personal header/hero/tier/operations, 60 px before help and viewed products.
- Interaction: operations carousel scrolls by mouse drag, touch/trackpad overflow and keyboard arrows; level and FAQ accordions open and close siblings; progress updates ARIA state and loops.
- Runtime: no browser console errors.
- Build: `npm run build` passed.

## Patches made

- Converted the operations row into an accessible horizontal carousel while preserving the intentionally clipped final card in its initial state.
- Replaced operation amount icons with the matching `icon-loyalty-cashback` sprite symbol.

## Notes

- Desktop implementation matches the supplied Figma frames. Tablet and mobile layouts are intentionally outside this iteration.
