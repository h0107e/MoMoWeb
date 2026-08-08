# Design QA — 关于我们 / 灯火人物志

- Source visual truth: `D:\MoMoGPT\about-page-v59-no-labels.png` plus the requirement that all visible copy remain editable HTML text
- Implementation screenshot: `D:\MoMoGPT\about-page-v60-interactive.png`
- State: `?scene=about&v=60`, 郭丙午 selected
- Viewport: 1920 × 1080 CSS px and 1366 × 768 CSS px
- Source pixels: 1672 × 935; implementation pixels: 1920 × 1080; device scale factor: 1
- Normalization: source and implementation were both fitted to 960 × 540 in the combined comparison; full-size originals were separately inspected for text clarity.

## Findings

- No actionable P0/P1/P2 differences remain.
- Typography: title, slogan, member names and roles preserve the source's warm-gold hierarchy; small copy remains readable at both tested viewports.
- Spacing and layout: five member lanterns remain inside the orbit and do not overlap persistent navigation or the philosophy row. The selected member is visually dominant.
- Colors and tokens: dark-blue/black night field, warm gold, amber glow and restrained cinnabar-brown match the selected direction.
- Image quality: the text-free high-resolution illustration preserves the portraits, lantern structure, orbit light and philosophy stones; no generated typography remains in the background.
- Copy: title, slogan, central identity, all five supplied names and responsibilities, interaction hint and philosophy copy are exact editable HTML text.

## Interaction and runtime checks

- Production build completed successfully.
- `script.js` passed syntax validation.
- Direct route `?scene=about` rendered successfully in Edge at both viewports.
- Five semantic member buttons are present; selected state uses `aria-pressed`, updates through the shared click handler and exposes hover/focus/gesture-dwell highlight states.
- Back navigation and hub “关于我们” entry use the existing `data-go` navigation system.
- No page-breaking browser output was observed during screenshot capture.

## Comparison history

1. Initial implementation: the selected mockup was used as one flattened image, leaving generated text errors and only transparent hotspots (P1).
2. Fix: created a text-free visual layer, moved every visible label into HTML, and made the five member regions real semantic controls with active states.
3. Post-fix evidence: `about-page-v60-interactive.png` shows clean typography aligned to the five portraits and three philosophy stones, with no baked-in labels.

## Follow-up polish

- P3: real team photos can later replace the current silhouettes if desired.

final result: passed
