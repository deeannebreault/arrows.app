import { connect } from 'react-redux';
import { createNode, setGraphStyle, setGraphStyles } from '../actions/graph';
import { createTextAnnotation } from '../actions/annotations';
import GeneralInspector from '../components/GeneralInspector';
import { getPresentGraph } from '../selectors';
import {
  styleCustomize,
  styleTheme,
  toggleDrawingMode,
} from '../actions/applicationLayout';
import { toggleSelection } from '../actions/selection';
import { Point } from '../model/Point';
import { computeCanvasSize } from '../model/applicationLayout';

const mapStateToProps = (state) => {
  return {
    graph: getPresentGraph(state),
    cachedImages: state.cachedImages,
    selection: state.selection,
    styleMode: state.applicationLayout.styleMode,
    drawingMode: state.applicationLayout.drawingMode,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onSelect: (entities) => {
      dispatch(toggleSelection(entities, 'replace'));
    },
    onSaveGraphStyle: (key, value) => {
      dispatch(setGraphStyle(key, value));
    },
    onPlusNodeClick: () => {
      dispatch(createNode());
    },
    onAddTextClick: () => {
      dispatch((dispatch2, getState) => {
        const state = getState();
        const vt = state.viewTransformation;
        const canvasSize = computeCanvasSize(state.applicationLayout);
        const graphX = (canvasSize.width / 2 - vt.offset.dx) / vt.scale;
        const graphY = (canvasSize.height / 2 - vt.offset.dy) / vt.scale;
        dispatch2(createTextAnnotation(new Point(graphX, graphY), 'New text'));
      });
    },
    onToggleDrawingMode: () => {
      dispatch(toggleDrawingMode());
    },
    onStyleTheme: () => {
      dispatch(styleTheme());
    },
    onStyleCustomize: () => {
      dispatch(styleCustomize());
    },
    onApplyTheme: (style) => {
      dispatch(setGraphStyles(style));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(GeneralInspector);
