# Design QA — 第二页功能导航

- Source visual truth: `C:\Users\HE\AppData\Local\Temp\codex-clipboard-b8bb9e5c-ffed-4530-b160-f25dd1c723cb.png`
- Implementation screenshot: `C:\Users\HE\Documents\Codex\2026-07-27\new-chat-4\hub-implementation.png`
- Combined comparison: `C:\Users\HE\Documents\Codex\2026-07-27\new-chat-4\hub-comparison.png`
- Viewport: 1610 × 977 CSS px
- Source pixels: 1610 × 977
- Implementation pixels: 1610 × 977
- Device scale factor: 1
- Density normalization: none required
- State: homepage → second-page functional navigation
- Primary interaction tested: enter second page
- Console errors: none

## Full-view comparison evidence

The implementation uses the supplied image at its native 1610 × 977 ratio. The image crop, typography, palette, illustration detail, bottom navigation, character row, central pedestal and surrounding architecture match pixel-for-pixel because the supplied raster is used directly as the page artwork.

The model anchor measured in the rendered browser at:

- X: 637.96 px
- Y: 256.95 px
- Width: 320.04 px
- Height: 412.04 px

This matches the requested X 638, Y 257, 320 × 412 px placement within sub-pixel rendering tolerance. Its horizontal center is 797.98 px, aligned with the circular pedestal.

## Focused-region comparison evidence

No separate crop was required. The model slot has no visible content in this iteration, and its exact browser bounding box was measured directly. The supplied background image contains all visible type, icons, illustrations and decorative details, so the full-resolution combined comparison is sufficient for those surfaces.

## Required fidelity surfaces

- Fonts and typography: supplied raster typography is unchanged.
- Spacing and layout rhythm: native image ratio preserved; model anchor matches requested coordinates and dimensions.
- Colors and visual tokens: supplied raster colors are unchanged.
- Image quality and asset fidelity: original 24-bit PNG is used directly without stretching or recompression.
- Copy and content: supplied raster copy is unchanged; existing invisible navigation hotspots remain functional.

## Comparison history

### Pass 1

- [P2] A visible circular back control appeared over the upper-left artwork but was not present in the source.
- Fix: converted the top-left brand area into an invisible home-return hotspot; keyboard focus still receives a visible outline.

### Pass 2

- The extra visible back control is gone.
- The only remaining overlays are the product's existing lantern cursor, sound control and gesture control. These are intentional global interaction features and do not change the underlying second-page composition.
- No actionable P0, P1 or P2 differences remain.

## Findings

No blocking or moderate fidelity issues remain.

## Implementation checklist

- [x] Replace second-page artwork.
- [x] Preserve the 1610 × 977 ratio.
- [x] Keep navigation hotspots functional.
- [x] Add an empty, non-interactive future model slot.
- [x] Anchor the slot to X 638, Y 257, 320 × 412 px.
- [x] Confirm the model slot center aligns at X ≈ 798.
- [x] Verify console output.

## Follow-up polish

- When a GLB is supplied, place its viewer inside `#hubModelSlot` and normalize the model's ground point to the slot's bottom center.

final result: passed
