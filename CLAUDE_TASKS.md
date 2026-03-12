# Arrows.app Tasks for Claude Code

## How to Use This File
Run: `bash tasks.sh` to see this list anytime.
Edit this file directly to add, update, or check off tasks.

## Current Branch: main

---

## In Progress / Next Up

### Verify Netlify Collab Deploy
**Status:** Push to main triggered Netlify rebuild with VITE_SHARE_URL + VITE_WS_URL set.

**Check:**
1. Netlify dashboard — confirm build completed successfully
2. Open `https://arrows-app-deeslab.netlify.app`
3. Click Share — session URL should appear (no error)
4. Open session URL in two tabs — changes should sync

**Backend (always-on on VPS):**
- Share API: `https://srv1410555.hstgr.cloud/api/health`
- WS server: `wss://srv1410555.hstgr.cloud/collab-ws`
- nginx + Let's Encrypt SSL (auto-renews)

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
- [x] Real-time collaboration system built (WS server + share API + Redux middleware)
- [x] nginx + Let's Encrypt SSL configured on VPS (srv1410555.hstgr.cloud)
- [x] Backend servers committed to repo (server/) with Render config as backup
- [x] Netlify env vars set (VITE_SHARE_URL, VITE_WS_URL) for collab backend

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
