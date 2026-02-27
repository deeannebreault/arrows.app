import { emptyGraph } from '../model/Graph';
import {
  addLabel,
  renameLabel,
  removeLabel,
  moveTo,
  setCaption,
} from '../model/Node';
import { reverse, setType } from '../model/Relationship';
import {
  removeProperty,
  renameProperty,
  setArrowsProperty,
  setProperty,
  removeArrowsProperty,
} from '../model/properties';
import { idsMatch } from '../model/Id';
import {
  nodeStyleAttributes,
  relationshipStyleAttributes,
} from '../model/styling';
import undoable, { groupByActionTypes } from 'redux-undo';
import { nodeSelected, relationshipSelected } from '../model/selection';
import {
  setAnnotationText as modelSetAnnotationText,
  setAnnotationPosition,
  setAnnotationStyle as modelSetAnnotationStyle,
  addDrawingPoint as modelAddDrawingPoint,
  translateDrawingAnnotation as modelTranslateDrawingAnnotation,
} from '../model/Annotation';

const graph = (state = emptyGraph(), action) => {
  switch (action.type) {
    case 'NEW_GOOGLE_DRIVE_DIAGRAM':
    case 'NEW_LOCAL_STORAGE_DIAGRAM':
      return emptyGraph();

    case 'CREATE_NODE': {
      const newNodes = state.nodes.slice();
      newNodes.push({
        id: action.newNodeId,
        position: action.newNodePosition,
        caption: action.caption,
        style: action.style,
        labels: [],
        properties: {},
      });
      return {
        ...state,
        nodes: newNodes,
      };
    }

    case 'CREATE_NODES_AND_RELATIONSHIPS': {
      const newNodes = [
        ...state.nodes,
        ...action.targetNodeIds.map((targetNodeId, i) => {
          return {
            id: targetNodeId,
            position: action.targetNodePositions[i],
            caption: action.caption,
            style: action.style,
            labels: [],
            properties: {},
          };
        }),
      ];
      const newRelationships = [
        ...state.relationships,
        ...action.newRelationshipIds.map((newRelationshipId, i) => {
          return {
            id: newRelationshipId,
            type: '',
            style: {},
            properties: {},
            fromId: action.sourceNodeIds[i],
            toId: action.targetNodeIds[i],
          };
        }),
      ];

      return {
        ...state,
        nodes: newNodes,
        relationships: newRelationships,
      };
    }

    case 'CONNECT_NODES': {
      const newRelationships = [
        ...state.relationships,
        ...action.newRelationshipIds.map((newRelationshipId, i) => {
          return {
            id: newRelationshipId,
            type: '',
            style: {},
            properties: {},
            fromId: action.sourceNodeIds[i],
            toId: action.targetNodeIds[i],
          };
        }),
      ];
      return {
        ...state,
        relationships: newRelationships,
      };
    }

    case 'SET_NODE_CAPTION': {
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          nodeSelected(action.selection, node.id)
            ? setCaption(node, action.caption)
            : node
        ),
      };
    }

    case 'ADD_LABEL': {
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          nodeSelected(action.selection, node.id)
            ? addLabel(node, action.label)
            : node
        ),
      };
    }

    case 'ADD_LABELS': {
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          action.nodeLabels.hasOwnProperty(node.id)
            ? addLabel(node, action.nodeLabels[node.id])
            : node
        ),
      };
    }

    case 'RENAME_LABEL': {
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          nodeSelected(action.selection, node.id)
            ? renameLabel(node, action.oldLabel, action.newLabel)
            : node
        ),
      };
    }

    case 'REMOVE_LABEL': {
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          nodeSelected(action.selection, node.id)
            ? removeLabel(node, action.label)
            : node
        ),
      };
    }

    case 'MERGE_NODES': {
      const nodeIdMap = new Map();
      for (const spec of action.mergeSpecs) {
        for (const purgedNodeId of spec.purgedNodeIds) {
          nodeIdMap.set(purgedNodeId, spec.survivingNodeId);
        }
      }
      const translateNodeId = (nodeId) =>
        nodeIdMap.has(nodeId) ? nodeIdMap.get(nodeId) : nodeId;
      return {
        ...state,
        nodes: state.nodes
          .filter((node) => {
            return !action.mergeSpecs.some((spec) =>
              spec.purgedNodeIds.includes(node.id)
            );
          })
          .map((node) => {
            const spec = action.mergeSpecs.find(
              (spec) => spec.survivingNodeId === node.id
            );
            if (spec) {
              let mergedProperties = node.properties;
              for (const purgedNodeId of spec.purgedNodeIds) {
                const purgedNode = state.nodes.find(
                  (node) => node.id === purgedNodeId
                );
                mergedProperties = {
                  ...mergedProperties,
                  ...purgedNode.properties,
                };
              }
              return {
                ...node,
                properties: mergedProperties,
                position: spec.position,
              };
            } else {
              return node;
            }
          }),
        relationships: state.relationships.map((relationship) => {
          return {
            ...relationship,
            fromId: translateNodeId(relationship.fromId),
            toId: translateNodeId(relationship.toId),
          };
        }),
      };
    }

    case 'RENAME_PROPERTY': {
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          nodeSelected(action.selection, node.id)
            ? renameProperty(node, action.oldPropertyKey, action.newPropertyKey)
            : node
        ),
        relationships: state.relationships.map((relationship) =>
          relationshipSelected(action.selection, relationship.id)
            ? renameProperty(
                relationship,
                action.oldPropertyKey,
                action.newPropertyKey
              )
            : relationship
        ),
      };
    }

    case 'SET_PROPERTY': {
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          nodeSelected(action.selection, node.id)
            ? setProperty(node, action.key, action.value)
            : node
        ),
        relationships: state.relationships.map((relationship) =>
          relationshipSelected(action.selection, relationship.id)
            ? setProperty(relationship, action.key, action.value)
            : relationship
        ),
      };
    }

    case 'SET_PROPERTY_VALUES': {
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          action.nodePropertyValues.hasOwnProperty(node.id)
            ? setProperty(node, action.key, action.nodePropertyValues[node.id])
            : node
        ),
      };
    }

    case 'SET_ARROWS_PROPERTY': {
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          nodeStyleAttributes.includes(action.key) &&
          nodeSelected(action.selection, node.id)
            ? setArrowsProperty(node, action.key, action.value)
            : node
        ),
        relationships: state.relationships.map((relationship) =>
          relationshipStyleAttributes.includes(action.key) &&
          relationshipSelected(action.selection, relationship.id)
            ? setArrowsProperty(relationship, action.key, action.value)
            : relationship
        ),
      };
    }

    case 'REMOVE_PROPERTY': {
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          nodeSelected(action.selection, node.id)
            ? removeProperty(node, action.key)
            : node
        ),
        relationships: state.relationships.map((relationship) =>
          relationshipSelected(action.selection, relationship.id)
            ? removeProperty(relationship, action.key)
            : relationship
        ),
      };
    }

    case 'REMOVE_ARROWS_PROPERTY': {
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          nodeSelected(action.selection, node.id)
            ? removeArrowsProperty(node, action.key)
            : node
        ),
        relationships: state.relationships.map((relationship) =>
          relationshipSelected(action.selection, relationship.id)
            ? removeArrowsProperty(relationship, action.key)
            : relationship
        ),
      };
    }

    case 'SET_GRAPH_STYLE': {
      const graphStyle = { ...state.style };
      graphStyle[action.key] = action.value;
      return {
        ...state,
        style: graphStyle,
      };
    }

    case 'SET_GRAPH_STYLES': {
      const graphStyle = { ...state.style };
      for (const [key, value] of Object.entries(action.style)) {
        graphStyle[key] = value;
      }
      return {
        ...state,
        style: graphStyle,
      };
    }

    case 'MOVE_NODES':
    case 'MOVE_NODES_END_DRAG':
      const nodeIdToNode = {};
      let clean = true;
      state.nodes.forEach((node) => {
        nodeIdToNode[node.id] = node;
      });
      action.nodePositions.forEach((nodePosition) => {
        if (nodeIdToNode[nodePosition.nodeId]) {
          const oldNode = nodeIdToNode[nodePosition.nodeId];
          clean &= oldNode.position.isEqual(nodePosition.position);
          nodeIdToNode[nodePosition.nodeId] = moveTo(
            oldNode,
            nodePosition.position
          );
        }
      });

      if (clean) return state;

      return {
        ...state,
        nodes: Object.values(nodeIdToNode),
      };

    case 'SET_RELATIONSHIP_TYPE':
      return {
        ...state,
        relationships: state.relationships.map((relationship) =>
          relationshipSelected(action.selection, relationship.id)
            ? setType(relationship, action.relationshipType)
            : relationship
        ),
      };

    case 'DUPLICATE_NODES_AND_RELATIONSHIPS': {
      const newNodes = state.nodes.slice();
      Object.keys(action.nodeIdMap).forEach((newNodeId) => {
        const spec = action.nodeIdMap[newNodeId];
        const oldNode = state.nodes.find((n) => idsMatch(n.id, spec.oldNodeId));
        const newNode = {
          id: newNodeId,
          position: spec.position,
          caption: oldNode.caption,
          style: { ...oldNode.style },
          labels: [...oldNode.labels],
          properties: { ...oldNode.properties },
        };
        newNodes.push(newNode);
      });

      const newRelationships = state.relationships.slice();
      Object.keys(action.relationshipIdMap).forEach((newRelationshipId) => {
        const spec = action.relationshipIdMap[newRelationshipId];
        const oldRelationship = state.relationships.find((r) =>
          idsMatch(r.id, spec.oldRelationshipId)
        );
        const newRelationship = {
          id: newRelationshipId,
          type: oldRelationship.type,
          fromId: spec.fromId,
          toId: spec.toId,
          style: { ...oldRelationship.style },
          properties: { ...oldRelationship.properties },
        };
        newRelationships.push(newRelationship);
      });

      return {
        ...state,
        nodes: newNodes,
        relationships: newRelationships,
      };
    }

    case 'IMPORT_NODES_AND_RELATIONSHIPS': {
      const newNodes = [...state.nodes, ...action.nodes];
      const newRelationships = [
        ...state.relationships,
        ...action.relationships,
      ];
      const newAnnotations = [
        ...(state.annotations || []),
        ...(action.annotations || []),
      ];

      return {
        ...state,
        nodes: newNodes,
        relationships: newRelationships,
        annotations: newAnnotations,
      };
    }

    case 'DELETE_NODES_AND_RELATIONSHIPS':
      return {
        ...state,
        nodes: state.nodes.filter((node) => !action.nodeIdMap[node.id]),
        relationships: state.relationships.filter(
          (relationship) => !action.relationshipIdMap[relationship.id]
        ),
      };

    case 'REVERSE_RELATIONSHIPS':
      return {
        ...state,
        relationships: state.relationships.map((relationship) =>
          relationshipSelected(action.selection, relationship.id)
            ? reverse(relationship)
            : relationship
        ),
      };

    case 'INLINE_RELATIONSHIPS':
      return {
        ...state,
        nodes: state.nodes
          .filter(
            (node) =>
              !action.relationshipSpecs.some(
                (spec) => spec.removeNodeId === node.id
              )
          )
          .map((node) => {
            const spec = action.relationshipSpecs.find(
              (spec) => spec.addPropertiesNodeId === node.id
            );
            if (spec) {
              let augmentedNode = node;
              for (const label of spec.labels) {
                augmentedNode = addLabel(augmentedNode, label);
              }
              for (const [key, value] of Object.entries(spec.properties)) {
                augmentedNode = setProperty(augmentedNode, key, value);
              }
              return augmentedNode;
            } else {
              return node;
            }
          }),
        relationships: state.relationships.filter(
          (relationship) =>
            !action.relationshipSpecs.some(
              (spec) =>
                spec.removeNodeId === relationship.fromId ||
                spec.removeNodeId === relationship.toId
            )
        ),
      };

    case 'GETTING_GRAPH_SUCCEEDED':
      return action.storedGraph;

    // Annotation cases
    case 'CREATE_TEXT_ANNOTATION':
      return {
        ...state,
        annotations: [...(state.annotations || []), action.annotation],
      };

    case 'CREATE_DRAWING_ANNOTATION':
      return {
        ...state,
        annotations: [...(state.annotations || []), action.annotation],
      };

    case 'ADD_DRAWING_POINT':
      return {
        ...state,
        annotations: (state.annotations || []).map((annotation) =>
          annotation.id === action.annotationId
            ? modelAddDrawingPoint(annotation, action.point)
            : annotation
        ),
      };

    case 'SET_ANNOTATION_TEXT':
      return {
        ...state,
        annotations: (state.annotations || []).map((annotation) =>
          annotation.id === action.annotationId
            ? modelSetAnnotationText(annotation, action.text)
            : annotation
        ),
      };

    case 'MOVE_ANNOTATION':
      return {
        ...state,
        annotations: (state.annotations || []).map((annotation) =>
          annotation.id === action.annotationId
            ? setAnnotationPosition(annotation, action.position)
            : annotation
        ),
      };

    case 'TRANSLATE_DRAWING_ANNOTATION':
      return {
        ...state,
        annotations: (state.annotations || []).map((annotation) =>
          annotation.id === action.annotationId && annotation.type === 'DRAWING'
            ? modelTranslateDrawingAnnotation(annotation, action.delta)
            : annotation
        ),
      };

    case 'SET_ANNOTATION_STYLE':
      return {
        ...state,
        annotations: (state.annotations || []).map((annotation) =>
          annotation.id === action.annotationId
            ? modelSetAnnotationStyle(annotation, action.style)
            : annotation
        ),
      };

    case 'DELETE_ANNOTATION':
      return {
        ...state,
        annotations: (state.annotations || []).filter(
          (annotation) => annotation.id !== action.annotationId
        ),
      };

    default:
      return state;
  }
};

export default undoable(graph, {
  filter: (action) => action.category === 'GRAPH',
  groupBy: groupByActionTypes([
    'MOVE_NODES',
    'ADD_DRAWING_POINT',
    'MOVE_ANNOTATION',
    'TRANSLATE_DRAWING_ANNOTATION',
  ]),
});
