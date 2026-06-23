# Design QA — Главная / Собрать комплект mobile

- final result: passed
- source visual truth path: Figma `gEearPQv7btgf3igT651f9`, node `2170:55619`
- implementation screenshot: captured in Browser session at 320 × 900; PNG was not kept in the repo to avoid binary QA artifacts
- implementation URL: `http://127.0.0.1:5173/`
- viewport: 320 × 900 and spot-check 390 × 900
- state: mobile section, category dropdown open

## Full-view comparison evidence

- Figma node uses mobile container padding 20px, title 24/28, gender tabs, two 28px dropdowns with 16px gap, preview area 254px high.
- Implementation at 320px: product card is 166 × 240 at left 20px; mannequin container is 194 × 254 pinned right; mannequin image is clipped and shifted right by 24.62% like Figma.
- Implementation at 390px: dropdowns expand to 160px each with the same 16px gap; mannequin remains pinned right and does not visually collide with the product card.

## Focused region comparison evidence

- Dropdowns: two enhanced controls are rendered over the original native selects; category dropdown opens as a white list, closes siblings, uses sprite icon `/images/icons/sprite.svg#icon-rec-button-arrow-down`.
- Mannequin: base mobile model area follows Figma dimensions; source image is clipped inside the right-side frame instead of shrinking to `calc(100% - 140px)`.
- Runtime: no browser console errors during open/reload/dropdown checks.
- Build: `npm run build` passed.

## Findings

- No actionable P0/P1/P2 findings remain for the requested mobile fixes.

## Patches made since previous QA pass

- Replaced mobile native-looking selects in the build-kit filters with accessible custom dropdown controls synced to the existing native `<select>` values.
- Used the existing sprite arrow icon for the dropdown affordance.
- Corrected the mobile mannequin container to match Figma: fixed 194px right-pinned clipped frame with image shifted inside it.
- Added explicit focus styling to avoid browser-default yellow focus ring.

## Follow-up polish

- If the client later asks for a fully custom selected/hover state inside these dropdown lists, align it with the category filter popup states globally.