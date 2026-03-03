import { connect } from 'react-redux';
import {
  setAnnotationText,
  setAnnotationStyle,
  deleteAnnotation,
} from '../actions/annotations';
import AnnotationInspector from '../components/AnnotationInspector';
import { getPresentGraph } from '../selectors';
import { selectedAnnotations } from '../model/selection';

const mapStateToProps = (state) => {
  const graph = getPresentGraph(state);
  const annotations = selectedAnnotations(graph, state.selection);
  return {
    annotations,
    inspectorVisible: state.applicationLayout.inspectorVisible,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onSaveText: (annotationId, text) => {
      dispatch(setAnnotationText(annotationId, text));
    },
    onSaveStyle: (annotationId, style) => {
      dispatch(setAnnotationStyle(annotationId, style));
    },
    onDelete: (annotationId) => {
      dispatch(deleteAnnotation(annotationId));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AnnotationInspector);
