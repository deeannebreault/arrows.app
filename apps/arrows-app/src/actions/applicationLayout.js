export const windowResized = (width, height) => {
  return {
    type: 'WINDOW_RESIZED',
    width,
    height,
  };
};

export const toggleInspector = () => {
  return {
    type: 'TOGGLE_INSPECTOR',
  };
};

export const styleTheme = () => {
  return {
    type: 'STYLE_THEME',
  };
};

export const styleCustomize = () => {
  return {
    type: 'STYLE_CUSTOMIZE',
  };
};

export const setBetaFeaturesEnabled = (enabled) => ({
  type: 'SET_BETA_FEATURES_ENABLED',
  enabled,
});

export const setPersistClusters = (enabled) => ({
  type: 'SET_PERSIST_CLUSTERS',
  enabled,
});

export const toggleDrawingMode = () => ({
  type: 'TOGGLE_DRAWING_MODE',
});

export const setDrawToolMode = (mode) => ({
  type: 'SET_DRAW_TOOL_MODE',
  mode,
});

export const setDrawSnapMode = (enabled) => ({
  type: 'SET_DRAW_SNAP_MODE',
  enabled,
});

export const setDrawStrokeColor = (color) => ({
  type: 'SET_DRAW_STROKE_COLOR',
  color,
});

export const setDrawStrokeWidth = (strokeWidth) => ({
  type: 'SET_DRAW_STROKE_WIDTH',
  strokeWidth,
});

export const setDrawLineStartPoint = (point) => ({
  type: 'SET_DRAW_LINE_START_POINT',
  point,
});

export const clearDrawLineStartPoint = () => ({
  type: 'CLEAR_DRAW_LINE_START_POINT',
});

export const toggleTextMode = () => ({
  type: 'TOGGLE_TEXT_MODE',
});
