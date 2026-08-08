# Design QA — 关于我们 / 灯火人物志

- Source visual truth: `C:\Users\HE\.codex\generated_images\019fa2f1-cb9c-7be0-b4d7-824f91c58f27\exec-8251ce71-7725-422e-bef2-4ed3cdc97691.png`
- Implementation screenshot: `D:\MoMoGPT\about-page-v58-exact.png`
- Combined comparison: `D:\MoMoGPT\about-design-comparison-v58.png`
- State: `?scene=about&v=58`, 郭丙午 selected
- Viewport: 1920 × 1080 CSS px and 1366 × 768 CSS px
- Source pixels: 1672 × 935; implementation pixels: 1920 × 1080; device scale factor: 1
- Normalization: source and implementation were both fitted to 960 × 540 in the combined comparison; full-size originals were separately inspected for text clarity.

## Findings

- No actionable P0/P1/P2 differences remain.
- Typography: title, slogan, member names and roles preserve the source's warm-gold hierarchy; small copy remains readable at both tested viewports.
- Spacing and layout: five member lanterns remain inside the orbit and do not overlap persistent navigation or the philosophy row. The selected member is visually dominant.
- Colors and tokens: dark-blue/black night field, warm gold, amber glow and restrained cinnabar-brown match the selected direction.
- Image quality: the selected high-resolution visual is used directly, preserving the original portraits, lantern structure, orbit light and philosophy stones without CSS approximation.
- Copy: all five supplied names and responsibilities are exact and rendered as HTML text.

## Interaction and runtime checks

- Production build completed successfully.
- `script.js` passed syntax validation.
- Direct route `?scene=about` rendered successfully in Edge at both viewports.
- Five semantic member buttons are present; selected state uses `aria-pressed` and updates through the shared click handler.
- Back navigation and hub “关于我们” entry use the existing `data-go` navigation system.
- No page-breaking browser output was observed during screenshot capture.

## Comparison history

1. Initial implementation: source comparison showed the lantern portraits, light paths and proportions had been approximated in CSS (P1).
2. Fix: replaced the approximation with the exact selected visual and retained semantic transparent interaction regions over the five members.
3. Post-fix evidence: `about-design-comparison-v58.png` shows the source and implementation are visually aligned at the same normalized viewport.

## Follow-up polish

- P3: real team photos can later replace the current silhouettes if desired.

final result: passed
