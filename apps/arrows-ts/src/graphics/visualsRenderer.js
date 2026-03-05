import Gestures from "./Gestures";
import CanvasAdaptor from "./utils/CanvasAdaptor";
import {VisualGuides} from "./VisualGuides";
import { drawRectPreview } from "./annotationRenderer";

const layerManager = (() => {
  let layers = []
  return {
    register: (name, drawFunction) => layers.push({
      name,
      draw: drawFunction
    }),
    clear: () => {
      layers = []
    },
    renderAll: (ctx, displayOptions) => {
      layers.forEach(layer => layer.draw(ctx, displayOptions))
    }
  }
})()

export const renderVisuals = ({visuals, canvas, displayOptions}) => {
  const { visualGraph, backgroundImage, gestures, guides, handles, rectPreview } = visuals

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, displayOptions.canvasSize.width, displayOptions.canvasSize.height);

  const visualGestures = new Gestures(visualGraph, gestures)
  const visualGuides = new VisualGuides(visualGraph, guides)

  layerManager.clear()

  layerManager.register('BACKGROUND IMAGE', backgroundImage.draw.bind(backgroundImage))
  layerManager.register('GUIDES ACTUAL POSITION', visualGuides.drawActualPosition.bind(visualGuides))
  layerManager.register('GESTURES', visualGestures.draw.bind(visualGestures))
  layerManager.register('GRAPH', visualGraph.draw.bind(visualGraph))
  layerManager.register('HANDLES', handles.draw.bind(handles))

  layerManager.register('GUIDES SNAP LINES', visualGuides.draw.bind(visualGuides))

  layerManager.renderAll(new CanvasAdaptor(ctx), displayOptions)

  // Draw rect preview with raw ctx (uses strokeRect/fillRect not in CanvasAdaptor)
  if (rectPreview && rectPreview.from && rectPreview.to) {
    drawRectPreview(ctx, rectPreview.from, rectPreview.to, displayOptions.viewTransformation)
  }
}
