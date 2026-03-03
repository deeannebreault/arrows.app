# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start dev server (http://localhost:4200)
nx serve arrows-ts

# Build for production
npm run build           # or: nx run arrows-ts:build

# Run unit tests
nx test arrows-ts       # app tests
nx test model           # model lib tests
nx test graphics        # graphics lib tests
nx test selectors       # selectors lib tests

# Run a single test file
nx test model -- --reporter=verbose --testFile=libs/model/src/lib/Id.test.ts

# Run e2e tests (requires dev server running or uses serve-static)
nx e2e arrows-ts-e2e

# Lint
nx lint arrows-ts

# Visualize dependency graph
nx graph
```

## Architecture

This is an **Nx monorepo** containing a React-Redux app for drawing Neo4j property graphs, plus standalone libraries for rendering.

### Workspaces

| Path | Purpose |
|------|---------|
| `apps/arrows-ts/` | Active app — React 18 + Redux + TypeScript, built with Vite |
| `apps/arrows-ts-e2e/` | Cypress e2e tests |
| `apps/arrows-app/` | Legacy JS app — archival snapshot kept for reference only |
| `libs/model/` | TypeScript data model (`@neo4j-arrows/model`) |
| `libs/graphics/` | TypeScript rendering library (`@neo4j-arrows/graphics`) |
| `libs/selectors/` | TypeScript Redux selectors (`@neo4j-arrows/selectors`) |

**Migration in progress**: The app in `apps/arrows-ts/src/` still contains older JS copies of graphics, model, and selectors code (`src/graphics/`, `src/model/`, `src/selectors/`). New code should use the `libs/` versions imported via their package paths. The JS copies are being replaced by the TypeScript libraries over time.

### Core Architectural Principle

The rendering core (`libs/graphics`) **must remain dependency-free** — no React, no Redux. It produces Canvas/SVG output and can be adopted independently across Neo4j products. The React-Redux app layer depends on the core; the core must not depend on the app.

### State Management (Redux)

`apps/arrows-ts/src/reducers/index.ts` defines the combined reducer. Key slices:

- `graph` — wrapped with `redux-undo` for undo/redo; contains nodes, relationships, and annotations
- `selection` — currently selected nodes/relationships
- `gestures` — in-progress mouse gestures (drag-to-create, marquee selection)
- `mouse` — raw mouse position/state
- `viewTransformation` — pan/zoom state
- `applicationLayout` — canvas size, inspector visibility, layer config
- `applicationDialogs` — which modal is open (save, export, import, etc.)
- `googleDrive` — Google Drive auth/picker state
- `features` — feature flags (`storage.GOOGLE_DRIVE`, `storage.LOCAL_STORAGE`, `storage.DATABASE`)

Selectors in `src/selectors/index.js` compute `VisualGraph` (via `getVisualGraph`) from the graph + view state. The `getGraph` selector supports optional layers (e.g. text annotations layer) by composing reducers via `state.applicationLayout.layers`.

### Interaction Model

User interactions flow through:
1. **`GraphDisplay`** component handles mouse events on the canvas
2. **`MouseHandler.js`** in `src/interactions/` interprets raw mouse events into gestures
3. **`Keybindings.ts`** maps keyboard shortcuts to named actions (UNDO, REDO, DELETE_SELECTION, etc.)
4. Actions are dispatched to Redux and reducers update state

### Rendering Pipeline

1. Redux state → selectors → `VisualGraph` (layout-resolved nodes/relationships with visual properties)
2. `VisualGraph` → `canvasRenderer` (Canvas 2D) or `visualsRenderer` (SVG)
3. Arrow styles include: `StraightArrow`, `BalloonArrow`, `ElbowArrow`, `RectilinearArrow`
4. Relationships with the same source/target are bundled (`RoutedRelationshipBundle`)

### Google Drive / Storage

- `VITE_GOOGLE_API_KEY` env var required at build time for Google Drive integration (injected via Secret Manager in Cloud Build)
- OAuth client ID is in `apps/arrows-ts/src/config.ts`; authorized JS origins must be registered in Google Cloud Console for each deployment environment

### Testing

- **Unit tests**: Vitest (via `@nx/vite:test`) — test files co-located with source as `*.test.ts` / `*.test.js`
- **E2e tests**: Cypress — all tests currently in `apps/arrows-ts-e2e/src/e2e/app.cy.ts`
- E2e CI mode uses `serve-static` (pre-built) rather than the dev server
