import React, {Component} from 'react'
import {connect} from "react-redux";
import {selectedRelationships} from "../model/selection";
import InspectorContainer from "./InspectorContainer";
import GeneralInspectorContainer from "./GeneralInspectorContainer";
import AnnotationInspector from "../components/AnnotationInspector";
import { getSelectedNodes } from "../selectors/inspection";
import { getPresentGraph } from "../selectors"

const mapStateToProps = state => {
  const selection = state.selection
  const graph = getPresentGraph(state)
  const hasSelectedAnnotation = selection.entities.some(e => e.entityType === 'annotation')
  return {
    showSelectionInspector: getSelectedNodes(({...state, graph})).length > 0 || selectedRelationships(graph, selection).length > 0,
    showAnnotationInspector: hasSelectedAnnotation && !getSelectedNodes(({...state, graph})).length && !selectedRelationships(graph, selection).length
  }
}

class Chooser extends Component {
  render() {
    if (this.props.showAnnotationInspector) return <AnnotationInspector/>
    if (this.props.showSelectionInspector) return <InspectorContainer/>
    return <GeneralInspectorContainer/>
  }
}

export default connect(
  mapStateToProps,
  null
)(Chooser)