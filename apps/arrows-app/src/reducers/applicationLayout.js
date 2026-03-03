import { Size } from '../model/Size';

const applicationLayout = (
  state = {
    windowSize: new Size(window.innerWidth, window.innerHeight),
    inspectorVisible: true,
    styleMode: 'theme',
    drawingMode: false,
    textMode: false,
    drawToolMode: 'LINE',
    drawSnapMode: true,
    drawStrokeColor: '#000000',
    drawStrokeWidth: 2,
    drawLineStartPoint: null,
    betaFeaturesEnabled: false,
    layers: [],
  },
  action
) => {
  switch (action.type) {
    case 'WINDOW_RESIZED':
      return {
        ...state,
        windowSize: new Size(action.width, action.height),
      };

    case 'TOGGLE_INSPECTOR':
      return {
        ...state,
        inspectorVisible: !state.inspectorVisible,
      };

    case 'STYLE_THEME':
      return {
        ...state,
        styleMode: 'theme',
      };

    case 'STYLE_CUSTOMIZE':
      return {
        ...state,
        styleMode: 'customize',
      };

    case 'SET_BETA_FEATURES_ENABLED':
      return {
        ...state,
        layers: [],
        betaFeaturesEnabled: action.enabled,
      };
    case 'SET_PERSIST_CLUSTERS':
      const clusterLayer = state.layers.find((layer) => layer.name === 'gangs');
      if (clusterLayer && clusterLayer.persist !== action.enabled) {
        const otherLayers = state.layers.filter(
          (layer) => layer.name !== 'gangs'
        );
        return {
          ...state,
          layers: otherLayers.concat([
            {
              ...clusterLayer,
              persist: action.enabled,
            },
          ]),
        };
      } else {
        return state;
      }
    case 'TOGGLE_DRAWING_MODE':
      return {
        ...state,
        drawingMode: !state.drawingMode,
        textMode: false,
        drawLineStartPoint: null,
      };
    case 'SET_DRAW_TOOL_MODE':
      return {
        ...state,
        drawToolMode: action.mode,
        drawLineStartPoint: null,
      };
    case 'SET_DRAW_SNAP_MODE':
      return {
        ...state,
        drawSnapMode: action.enabled,
      };
    case 'SET_DRAW_STROKE_COLOR':
      return {
        ...state,
        drawStrokeColor: action.color,
      };
    case 'SET_DRAW_STROKE_WIDTH':
      return {
        ...state,
        drawStrokeWidth: action.strokeWidth,
      };
    case 'SET_DRAW_LINE_START_POINT':
      return {
        ...state,
        drawLineStartPoint: action.point,
      };
    case 'CLEAR_DRAW_LINE_START_POINT':
      return {
        ...state,
        drawLineStartPoint: null,
      };
    case 'TOGGLE_TEXT_MODE':
      return {
        ...state,
        textMode: !state.textMode,
        drawingMode: false,
        drawLineStartPoint: null,
      };
    default:
      return state;
  }
};

export default applicationLayout;
