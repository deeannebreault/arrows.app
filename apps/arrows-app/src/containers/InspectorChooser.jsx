import React, { Component } from 'react';
import { connect } from 'react-redux';
import { selectedRelationships, selectedAnnotations } from '../model/selection';
import InspectorContainer from './InspectorContainer';
import AnnotationInspectorContainer from './AnnotationInspectorContainer';
import GeneralInspectorContainer from './GeneralInspectorContainer';
import { getSelectedNodes } from '../selectors/inspection';
import { getPresentGraph } from '../selectors';

const mapStateToProps = (state) => {
  const selection = state.selection;
  const graph = getPresentGraph(state);
  return {
    showSelectionInspector:
      getSelectedNodes({ ...state, graph }).length > 0 ||
      selectedRelationships(graph, selection).length > 0,
    showAnnotationInspector: selectedAnnotations(graph, selection).length > 0,
  };
};

class Chooser extends Component {
  render() {
    if (this.props.showSelectionInspector) {
      return <InspectorContainer />;
    } else if (this.props.showAnnotationInspector) {
      return <AnnotationInspectorContainer />;
    } else {
      return <GeneralInspectorContainer />;
    }
  }
}

export default connect(mapStateToProps, null)(Chooser);
