# Draw Toggle Plan

## Scope
This plan is focused on the **Draw toggle next to Add Text** in the toolbox (`Draw` / `Stop Drawing`) and the drawing behavior it controls.

## Goal
Ensure draw mode is reliable, predictable, and testable:
- Clicking `Draw` always enables drawing mode.
- Clicking `Stop Drawing` always disables drawing mode.
- Draw mode and text mode stay mutually exclusive.
- Canvas click/drag behavior matches the active mode.
- UI label and internal state are always in sync.

## Current context
The toggle lives in the toolbox next to Add Text and is wired through:
- `GeneralToolbox` button (`content={drawingMode ? 'Stop Drawing' : 'Draw'}`)
- `GeneralInspectorContainer` dispatching `toggleDrawingMode()`
- `applicationLayout` reducer (`TOGGLE_DRAWING_MODE`)
- Mouse action flow (`actions/mouse.js`) using `state.applicationLayout.drawingMode`

## Step-by-step debugging plan

### 1) Verify toggle state transitions
- Confirm every click on Draw button dispatches `TOGGLE_DRAWING_MODE`.
- Confirm reducer flips `drawingMode` and forces `textMode: false`.
- Confirm UI label updates immediately based on state.
- Confirm second click returns to `drawingMode: false`.

Acceptance:
- `Draw -> Stop Drawing -> Draw` works repeatedly without drift.

### 2) Verify mutual exclusion with Add Text
- Enable text mode (`Add Text`), then click `Draw`.
- Confirm text mode is disabled and draw mode is enabled.
- Enable draw mode, then click `Add Text`.
- Confirm draw mode is disabled and text mode is enabled.

Acceptance:
- Never both true at once.

### 3) Verify mouse behavior in each mode
- In draw mode:
  - Click/drag on empty canvas creates/extends drawing annotation.
- In text mode:
  - Click empty canvas creates text annotation and exits text mode.
- In normal mode:
  - Click/drag follows selection/marquee behavior.

Acceptance:
- Mode-specific action always fires; no cross-mode side effects.

### 4) Verify selected-annotation interactions do not break toggle expectations
- Select drawing annotation and drag it.
- Re-toggle Draw and create a second drawing.
- Toggle off and select/edit annotations.

Acceptance:
- Toggle state remains stable before/after annotation interactions.

### 5) Add explicit E2E guardrails for toggle behavior
Extend Playwright tests to assert:
- Draw button text switches both directions.
- Text mode and draw mode cancel each other.
- Drawing works only when draw mode is on.

Acceptance:
- Deterministic test pass locally and in CI.

## Layer ordering decision (forward/backward)

### What is available today
This app has a `layers` extension concept in `applicationLayout.layers`, but it is used for selector/event extension hooks, not a user-facing z-order stack for annotations.

### Decision branch
1. **If true drawing z-order operations are feasible with low risk**
   - Add annotation ordering actions (bring forward/send backward).
   - Implement reorder in graph reducer and rendering order.
   - Add inspector controls and tests.
2. **If not feasible in current framework scope**
   - Keep a single annotation layer (current behavior).
   - Document explicitly that forward/backward ordering is deferred.

## Recommended immediate implementation order
1. Finalize Draw toggle reliability checks (state + UI + interaction).
2. Lock in E2E assertions for toggle mutual exclusion and behavior.
3. Run full test suite and fix any flaky selectors.
4. Evaluate z-order feasibility; if high risk, defer and stay single-layer.

## Success criteria
- Draw toggle is stable across repeated use.
- Add Text and Draw never conflict.
- Drawing creation and editing paths are reliable.
- Tests pass consistently (local and CI).
- Layer-ordering path is explicitly decided (implement now or defer).

## New product notes (requested)

### Drawing capabilities to support
- Style controls:
  - Color
  - Thickness
- Drawing modes:
  - `LINE` mode
  - `FREE` (marker/freehand) mode
- Snap behavior:
  - Snap `ON`
  - Snap `OFF`

### Priority decision
- Prioritize `LINE` mode first to simplify event handling.

### LINE mode interaction model (initial)
- User toggles Draw mode on.
- First click places a start point.
- Next click places an end point and creates a line segment.
- Repeated clicks can extend a polyline (segment-by-segment), or the interaction can stop after one segment if product chooses single-segment mode first.

### Implementation guidance
- Keep state explicit:
  - `drawingMode` (on/off)
  - `drawToolMode` (`LINE` or `FREE`)
  - `snapMode` (boolean)
  - active style (`strokeColor`, `strokeWidth`)
- For line mode, prefer click-based point events over drag-stream sampling.
- Introduce snap logic in line mode only first; defer freehand snap unless needed.

### Delivery phases
1. Phase 1: `LINE` mode + color/thickness + snap toggle + tests. ✅ Implemented
2. Phase 2: `FREE` mode with same style controls.
3. Phase 3: optional advanced snapping and UX polish.

## Phase 1 shipped behavior
- Draw defaults to `LINE` tool mode.
- `Draw` toggle enables drawing.
- In line mode:
  - click once to set start point
  - click again to create segment
- Snap toggle:
  - `On`: constrains line to horizontal/vertical axis from start point
  - `Off`: uses raw clicked end point
- Stroke style controls are active from toolbox:
  - color
  - thickness
