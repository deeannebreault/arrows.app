#!/bin/bash
# Quick task list for arrows.app
echo "=== Arrows.app Tasks ==="
echo ""
echo "Location: $(pwd)"
echo "Branch: $(git branch --show-current)"
echo ""
cat CLAUDE_TASKS.md 2>/dev/null || echo "Error: CLAUDE_TASKS.md not found"
