import {
  createTextAnnotation as createTextAnnotationModel,
  createDrawingAnnotation as createDrawingAnnotationModel,
  createRectangleAnnotation as createRectangleAnnotationModel,
} from '../model/Annotation';
import { nextAvailableId } from '../model/Id';

export const createTextAnnotation =
  (position, text = '') =>
  (dispatch, getState) => {
    const state = getState();
    const graph = state.graph.present || state.graph;
    const annotations = graph.annotations || [];
    const newAnnotation = createTextAnnotationModel(
      nextAvailableId(annotations),
      position,
      text
    );
    console.log('Creating text annotation:', newAnnotation);

    dispatch({
      category: 'GRAPH',
      type: 'CREATE_TEXT_ANNOTATION',
      annotation: newAnnotation,
    });
  };

export const createRectangleAnnotation = (from, to) => (dispatch, getState) => {
  const state = getState();
  const graph = state.graph.present || state.graph;
  const annotations = graph.annotations || [];
  const x = Math.min(from.x, to.x);
  const y = Math.min(from.y, to.y);
  const width = Math.abs(to.x - from.x);
  const height = Math.abs(to.y - from.y);
  if (width < 5 || height < 5) return; // ignore accidental clicks
  dispatch({
    category: 'GRAPH',
    type: 'CREATE_RECTANGLE_ANNOTATION',
    annotation: createRectangleAnnotationModel(nextAvailableId(annotations), { x, y }, width, height),
  });
};

export const createDrawingAnnotation = () => (dispatch, getState) => {
  const state = getState();
  const graph = state.graph.present || state.graph;
  const annotations = graph.annotations || [];

  dispatch({
    category: 'GRAPH',
    type: 'CREATE_DRAWING_ANNOTATION',
    annotation: createDrawingAnnotationModel(nextAvailableId(annotations), []),
  });
};

export const addDrawingPoint = (annotationId, point) => ({
  category: 'GRAPH',
  type: 'ADD_DRAWING_POINT',
  annotationId,
  point,
});

export const setAnnotationText = (annotationId, text) => ({
  category: 'GRAPH',
  type: 'SET_ANNOTATION_TEXT',
  annotationId,
  text,
});

export const moveAnnotation = (annotationId, position) => ({
  category: 'GRAPH',
  type: 'MOVE_ANNOTATION',
  annotationId,
  position,
});

export const setAnnotationStyle = (annotationId, style) => ({
  category: 'GRAPH',
  type: 'SET_ANNOTATION_STYLE',
  annotationId,
  style,
});

export const deleteAnnotation = (annotationId) => ({
  category: 'GRAPH',
  type: 'DELETE_ANNOTATION',
  annotationId,
});
