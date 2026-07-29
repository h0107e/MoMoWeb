# Design QA — 第二页临时 GLB 与成果页新背景

## Evidence

- Second-page source: `C:\Users\HE\AppData\Local\Temp\codex-clipboard-b8bb9e5c-ffed-4530-b160-f25dd1c723cb.png`
- Second-page implementation: `C:\Users\HE\Documents\Codex\2026-07-27\new-chat-4\hub-model-implementation.png`
- Second-page comparison: `C:\Users\HE\Documents\Codex\2026-07-27\new-chat-4\hub-model-comparison.png`
- Result-page source: `C:\Users\HE\AppData\Local\Temp\codex-clipboard-649c8800-501c-4d7b-bd15-5b6f2917a67d.png`
- Result-page implementation: `C:\Users\HE\Documents\Codex\2026-07-27\new-chat-4\result-bg-implementation.png`
- Result-page comparison: `C:\Users\HE\Documents\Codex\2026-07-27\new-chat-4\result-bg-comparison.png`
- Viewports: second page 1610 × 977; result page 1609 × 977
- Device scale factor: 1
- Density normalization: none required
- Tested flow: homepage → functional-navigation page → blind-box page → fish-lantern result
- Console errors: none

## Full-view comparison

The second page continues to use the supplied 1610 × 977 raster at native size. A real temporary GLB model is layered only within the designated model area. The result page uses the newly supplied 1609 × 977 raster at its native aspect ratio, with the existing result navigation, text, circular model frame and action buttons retained.

## Focused evidence

The temporary GLB slot measured in the browser at:

- X: 637.98 px
- Y: 256.98 px
- Width: 320 px
- Height: 411.98 px
- Horizontal center: 797.98 px

The GLB loaded successfully from `./assets/sample-blind-box.glb`, faded in and auto-rotated. Its ground point visually meets the center of the supplied circular pedestal.

## Required fidelity surfaces

- Fonts and typography: background-embedded typography remains unchanged; existing overlay typography is preserved.
- Spacing and layout rhythm: both source images use their native ratios; the GLB slot stays within the previously approved anchor.
- Colors and visual tokens: the sample GLB uses temporary red-lacquer and warm-gold materials aligned with the page palette.
- Image quality and asset fidelity: both supplied PNG files are used directly without recompression or stretching.
- Copy and content: existing functional navigation, result name, story and actions remain unchanged.

## Findings

No actionable P0, P1 or P2 issues remain.

The temporary GLB is intentionally simple and is not treated as final packaging artwork. Its purpose is to validate scale, camera angle, lighting, rotation and ground alignment before the user supplies the production GLB.

## Comparison history

- Pass 1: confirmed that the GLB occupied the requested 320 × 412 px area and did not overlap the title, character row or navigation.
- Pass 2: confirmed that the new result background fills the 1609 × 977 result canvas, the duplicated CSS pedestal is removed, and the result buttons remain usable.

## Implementation checklist

- [x] Add a real temporary GLB model to the second page.
- [x] Lazy-load the 3D viewer only after entering the second page.
- [x] Auto-rotate and fade the model in after loading.
- [x] Preserve the model anchor and pedestal alignment.
- [x] Replace the result-page background.
- [x] Remove the duplicated CSS pedestal.
- [x] Test the full draw flow and browser console.

## Follow-up polish

- Replace `sample-blind-box.glb` with the production box GLB while retaining the same viewer and anchor.

final result: passed
