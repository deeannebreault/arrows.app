import { Point } from './Point';
import { nextAvailableId } from './Id';

export const createTextAnnotation = (id, position, text = '', style = {}) => ({
  id,
  type: 'TEXT',
  position,
  text,
  style: {
    fontSize: style.fontSize || 16,
    fontFamily: style.fontFamily || 'sans-serif',
    color: style.color || '#000000',
    backgroundColor: style.backgroundColor || 'rgba(255, 255, 200, 0.8)',
    ...style,
  },
});

export const createRectangleAnnotation = (id, position, width, height, style = {}) => ({
  id,
  type: 'RECTANGLE',
  position,
  width: Math.abs(width),
  height: Math.abs(height),
  style: {
    strokeColor: style.strokeColor || '#4a90d9',
    strokeWidth: style.strokeWidth || 2,
    fillColor: style.fillColor || '#4a90d9',
    fillOpacity: style.fillOpacity !== undefined ? style.fillOpacity : 0,
    ...style,
  },
});

export const createDrawingAnnotation = (id, points = [], style = {}) => ({
  id,
  type: 'DRAWING',
  points,
  style: {
    strokeColor: style.strokeColor || '#000000',
    strokeWidth: style.strokeWidth || 2,
    ...style,
  },
});

export const setAnnotationText = (annotation, text) => ({
  ...annotation,
  text,
});

export const setAnnotationPosition = (annotation, position) => ({
  ...annotation,
  position,
});

export const addDrawingPoint = (annotation, point) => ({
  ...annotation,
  points: [...annotation.points, point],
});

export const setAnnotationStyle = (annotation, style) => ({
  ...annotation,
  style: { ...annotation.style, ...style },
});

export const emptyAnnotationState = () => ({
  annotations: [],
});
