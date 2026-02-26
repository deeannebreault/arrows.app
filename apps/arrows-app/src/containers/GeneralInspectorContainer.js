import { connect } from 'react-redux';
import { createNode, setGraphStyle, setGraphStyles } from '../actions/graph';
import { createTextAnnotation } from '../actions/annotations';
import GeneralInspector from '../components/GeneralInspector';
import { getPresentGraph } from '../selectors';
import {
  styleCustomize,
  styleTheme,
  toggleDrawingMode,
  toggleTextMode,
} from '../actions/applicationLayout';
import { toggleSelection } from '../actions/selection';
import { Point } from '../model/Point';

const mapStateToProps = (state) => {
  return {
    graph: getPresentGraph(state),
    cachedImages: state.cachedImages,
    selection: state.selection,
    styleMode: state.applicationLayout.styleMode,
    drawingMode: state.applicationLayout.drawingMode,
    textMode: state.applicationLayout.textMode,
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
      dispatch(toggleTextMode());
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
