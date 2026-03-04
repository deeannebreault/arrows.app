# Arrows.app Tasks for Claude Code

## How to Use This File
Run: `bash tasks.sh` to see this list anytime.
Edit this file directly to add, update, or check off tasks.

## Current Branch: main

---

## In Progress / Next Up

### Verify GitHub Pages Deployment
**Status:** Merging to main should have triggered the deploy workflow.

**Check:**
1. Visit GitHub Actions tab on the repo
2. Confirm `deploy.yml` workflow ran successfully
3. Test the live Pages URL

**If failing:**
- Check `.github/workflows/deploy.yml` base URL config
- Ensure Pages source is set to "GitHub Actions" in repo Settings → Pages

---

## Backlog

### Mobile Touch Support for Annotations
- Add touch event handlers alongside mouse events in annotation interaction code
- Files: `apps/arrows-ts/src/interactions/MouseHandler.js`

### Annotation Editing
- Allow users to edit existing text annotations (double-click to edit)
- Files: `apps/arrows-ts/src/components/` (annotation inspector panel)

### Fix Pre-existing Test Failures
- `src/graphics/utils/circleWordWrap.test.js` — `splitIntoLines is not a function`
- `src/app/app.spec.tsx` — broken import `./app` (case sensitivity or missing file)

---

## Completed ✅

- [x] Text annotations: rendering, mouse interactions, persistence
- [x] Line-first drawing mode with controls and e2e coverage
- [x] Share button added to Header
- [x] Redux plumbing for Share dialog
- [x] ShareModal implemented (URL generation + copy to clipboard)
- [x] Annotation cleanup: removed debug console.logs, fixed duplicate ...state spreads
- [x] GitHub Pages deployment workflow added
- [x] Merged feature/text-and-drawing → main
- [x] claude-historian-mcp registered
- [x] CLAUDE.md updated with session start checklist

---

## Commands

```bash
# Run dev server (for local testing)
npx nx serve arrows-ts

# Build
npm run build

# Run tests
npx nx test arrows-ts

# Run e2e
npx nx e2e arrows-ts-e2e

# Push and check CI
git push origin main
```
