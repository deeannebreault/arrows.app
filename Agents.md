# Agents Notes

Date: 2026-02-26
Repository: `arrows.app-text-draw`
Current focus: **Draw implementation**

## Product roadmap (user-stated)
- Text `[x]`
- Draw `[.]` (in progress)
- Share `[ ]`
- Interact through API `[ ]`
- CLI `[ ]`

## Draw implementation audit summary
A full end-to-end trace was performed from UI toggle -> mouse interaction -> action dispatch -> reducer/model updates -> canvas rendering.

### Flow traced
1. Draw mode toggle in `GeneralToolbox` / `GeneralInspectorContainer`
2. Mouse event handling in `actions/mouse.js`
3. Annotation actions in `actions/annotations.js`
4. Annotation state updates in `reducers/graph.js`
5. Annotation model helpers in `model/Annotation.js`
6. Rendering and hit-testing in `graphics/annotationRenderer.js` and `graphics/VisualGraph.js`

## Root causes found

### 1) START_DRAWING was never dispatched
- In `actions/mouse.js`, `startDrawing` returned an action object instead of dispatching it.
- Result: reducer never received `START_DRAWING`, so mouse drag state could remain incorrect for drawing behavior.

### 2) Dragging selected drawing annotations used text-annotation logic
- `mouseMove` branch for `dragType: 'ANNOTATION'` assumed `annotation.position` exists.
- `DRAWING` annotations are point-based (`points[]`) and do not have `position`.
- Result: dragging a selected drawing annotation could break or behave incorrectly.

## Changes implemented

### `apps/arrows-app/src/actions/mouse.js`
- Added import: `translateDrawingAnnotation`.
- Updated `startDrawing` to **dispatch** `START_DRAWING` instead of returning it.
- Updated `ANNOTATION` drag handling:
  - `DRAWING` annotations now dispatch translation by delta (`x`, `y`).
  - Text annotations keep existing move-by-position behavior.

### `apps/arrows-app/src/actions/annotations.js`
- Added `translateDrawingAnnotation(annotationId, delta)` action creator.

### `apps/arrows-app/src/model/Annotation.js`
- Added model helper `translateDrawingAnnotation(annotation, delta)` to shift all points.

### `apps/arrows-app/src/reducers/graph.js`
- Added import `translateDrawingAnnotation as modelTranslateDrawingAnnotation`.
- Added reducer case `TRANSLATE_DRAWING_ANNOTATION` for point translation.
- Added `TRANSLATE_DRAWING_ANNOTATION` to undo grouping (`redux-undo`) with related drag actions.

## Validation performed
- Static/editor error check on modified files: **no errors**.
- Targeted app build run:
  - Command: `npx nx build arrows-app`
  - Result: **success**

## Current draw status after fixes
- Draw mode can enter drawing drag state correctly.
- Drawing point creation during drag is preserved.
- Existing drawing annotations can be dragged/moved safely.
- Build is passing.

## Incremental progress log

### Step 1 complete: Drawing style controls in inspector
- Updated `AnnotationInspector` to render annotation-type specific controls.
- Text annotations keep `Text`, `Font Size`, and `Color` controls.
- Drawing annotations now have:
  - `Stroke Width` (clamped to 1..20)
  - `Stroke Color`
- Validation:
  - Editor diagnostics clean for updated file.
  - `npx nx build arrows-app` succeeded.

### Step 2 complete: Tiny-stroke cleanup
- Added draw completion cleanup in `mouseUp` (`DRAWING` branch):
  - Remove accidental strokes with fewer than 2 points.
  - Remove very short strokes with path length `< 2` graph units.
- Prevents click-noise artifacts from remaining on canvas.

### Step 3 complete: Point sampling to reduce noisy duplicates
- Added minimum-distance point sampling during freehand draw moves.
- `ADD_DRAWING_POINT` now only occurs when the new point is at least `0.75` graph units from the previous point.
- This keeps drawn paths cleaner and avoids over-dense point lists.

### Validation after Steps 2-3
- Editor diagnostics clean for updated draw logic.
- `npx nx build arrows-app` succeeded.

## Comprehensive testing pass (UI + Draw + Export + Import)

Date: 2026-02-26

### Scope covered
- Core UI smoke coverage for key controls:
  - `Add Node`, `Add Text`, `Draw`, `Download / Export`
  - Export modal and tabs: `PNG`, `SVG`, `Cypher`, `JSON`, `URL`, `GraphQL`
  - Import modal controls: `Choose File`, text area, `Cancel`, `Import`
- Draw workflow:
  - Toggle draw mode
  - Create freehand stroke
  - Select drawing annotation
  - Verify drawing inspector controls are present and editable (`Stroke Width`, `Stroke Color`)
- Export coverage:
  - PNG export links present and data URLs produced
  - JSON export link present and valid data URL produced
  - JSON textarea parse check (`nodes` and `relationships` arrays)
- Import coverage:
  - Add Text coverage:
    - Toggle text mode
    - Place a text annotation on canvas
    - Edit annotation text in inspector
    - Verify text annotation in exported JSON
    - Re-import JSON and verify text annotation count increases
  - Export JSON from current graph
  - Import the same JSON through Import modal
  - Verify graph updates (node count increases)

### Test implementation
- File updated: `playwright-tests.spec.js`
- Added helper functions for:
  - app load and startup-modal dismissal
  - opening/closing export modal
  - opening import modal via header menu

### Execution result
- Command: `npx playwright test playwright-tests.spec.js`
- Result: **5 passed, 0 failed**

## Remaining draw considerations (not changed yet)
These are known improvement candidates, intentionally left out of this focused fix:
- Add drawing-specific controls in `AnnotationInspector` (stroke color/width editing UI).
- Optional smoothing/sampling for freehand paths (reduce point density/noise).
- Optional minimum-point or minimum-length threshold to avoid accidental tiny marks.
- Optional selection affordances for drawings (handles/clearer hit box visuals).

## Suggested next implementation order
1. Finish draw UX polish (style controls + optional smoothing).
2. Implement sharing workflow.
3. Add API interaction layer.
4. Add CLI entry points.

## Latest requested draw requirements (captured)
- Add drawing controls for:
  - stroke color
  - stroke thickness
- Support drawing tool modes:
  - free draw marker mode
  - line mode
- Support snap toggle:
  - snap on
  - snap off
- Prioritize line mode first to simplify event handling.
- Target line-mode interaction:
  - toggle draw
  - click to place first point
  - click to place second point and create line segment

## Phase 1 implementation status (completed)

Implemented now:
- Draw settings state in `applicationLayout`:
  - `drawToolMode` (`LINE` default, `FREE` supported)
  - `drawSnapMode` (default `true`)
  - `drawStrokeColor`
  - `drawStrokeWidth`
  - `drawLineStartPoint` (for click-click line interaction)
- New draw setting actions:
  - set tool mode, snap mode, stroke color, stroke width
  - set/clear line start point
- Toolbox controls added:
  - Draw Type (Line / Free)
  - Stroke Width
  - Stroke Color
  - Snap toggle (On / Off)
- Line mode event handling:
  - Draw mode + Line mode now prioritizes click handling over entity hit-selection
  - First click stores start point
  - Second click creates drawing annotation with two points
  - Snap mode constrains the second point to horizontal/vertical relative to start
- Free mode remains drag-based and uses active stroke style.

Validation:
- `npx nx build arrows-app` (pass)
- `npx playwright test playwright-tests.spec.js` (5 passed, 0 failed)

## Deployment context snapshot
- GitHub Pages deployment now succeeds from `feature/text-and-drawing`.
- Public URL: `https://deeannebreault.github.io/arrows.app/`
