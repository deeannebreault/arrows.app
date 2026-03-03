import { Point } from './Point';
import { nextAvailableId } from './Id';

export const createTextAnnotation = (id, position, text = '', style = {}) => ({
  id,
  type: 'TEXT',
  position,
  text,
  style: {
    fontSize: style.fontSize || 14,
    fontFamily: style.fontFamily || 'sans-serif',
    color: style.color || '#000000',
    backgroundColor: style.backgroundColor || 'transparent',
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

export const translateDrawingAnnotation = (annotation, delta) => ({
  ...annotation,
  points: (annotation.points || []).map((point) => ({
    x: point.x + delta.x,
    y: point.y + delta.y,
  })),
});

export const setAnnotationStyle = (annotation, style) => ({
  ...annotation,
  style: { ...annotation.style, ...style },
});

export const emptyAnnotationState = () => ({
  annotations: [],
});
