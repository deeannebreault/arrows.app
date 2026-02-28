# DebugPanel Integration Guide

## Overview
The DebugPanel provides visual debugging tools for investigating text/drawing annotation issues in arrows.app.

## Features
- ✅ Toggle debug mode on/off
- ✅ Show/hide bounding boxes for all elements
- ✅ Display position markers
- ✅ Grid overlay for alignment
- ✅ Selected node inspection
- ✅ Graph statistics
- ✅ One-click logging to console

## Installation

### 1. Import the component

```jsx
import { DebugPanel } from './features/debug/DebugPanel';
import './features/debug/DebugPanel.css';
```

### 2. Add to your layout

```jsx
// In your main app component or inspector panel
<DebugPanel 
  graph={currentGraph}
  selectedNode={selectedNode}
  canvasRef={canvasRef}
  onToggleDebugMode={(enabled) => setDebugMode(enabled)}
/>
```

### 3. Wire up canvas reference

```jsx
const canvasRef = useRef(null);

// In your canvas component
<canvas ref={canvasRef} ... />
```

## Usage

### For Text Annotation Debugging:
1. Enable "Debug Mode"
2. Check "Show Bounding Boxes"
3. Select a text annotation
4. View position and size in the panel
5. Check if bounds match visible text

### For Drawing Annotation Debugging:
1. Enable "Debug Mode"  
2. Check "Show Positions"
3. Look for the green position markers
4. Verify path points are correct

### Key Debugging Tips:

**Text not visible?**
- Check "Selected Node" bounds
- If width/height is 0, text isn't rendering
- If position is off-screen, that's the bug!

**Drawing not showing?**
- Look for position markers
- If no markers, element wasn't created
- If markers but no lines, path data is wrong

## Integration with Canvas Renderer

To show actual bounding boxes on canvas, modify your render loop:

```javascript
if (debugMode && showBoundingBoxes) {
  // Draw bounding boxes for all annotations
  annotations.forEach(annotation => {
    ctx.strokeStyle = '#f9e2af';
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(
      annotation.bounds.x,
      annotation.bounds.y,
      annotation.bounds.width,
      annotation.bounds.height
    );
    
    // Label
    ctx.fillStyle = '#f9e2af';
    ctx.font = '10px sans-serif';
    ctx.fillText(
      annotation.type,
      annotation.bounds.x,
      annotation.bounds.y - 5
    );
  });
}
```

## CSS Customization

Override default styles:

```css
.debug-panel {
  /* Your custom panel styles */
}

.debug-bounding-box {
  /* Change box color */
  border-color: #your-color;
}
```

## Future Enhancements

- [ ] Real-time FPS counter
- [ ] Memory usage tracking
- [ ] Network request logging
- [ ] Redux state inspection
- [ ] Performance profiling

## Troubleshooting

**Panel not showing?**
- Check component import path
- Verify CSS is imported

**Bounding boxes not appearing?**
- Make sure `canvasRef` is passed correctly
- Check debug mode is enabled

**Stats showing 0?**
- Verify `graph` prop has nodes/annotations

## Contributing

When you fix a bug using this panel:
1. Document what the debug info revealed
2. Update this guide with the solution
3. Commit with reference to the fix
