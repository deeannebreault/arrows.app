import React from 'react';
import { connect } from 'react-redux';
import { Form, Button } from 'semantic-ui-react';
import { setAnnotationStyle, deleteAnnotation } from '../actions/annotations';
import { getPresentGraph } from '../selectors';

const AnnotationInspector = ({ annotation, dispatch }) => {
  if (!annotation || annotation.type !== 'RECTANGLE') return null;

  const style = annotation.style || {};

  const update = (patch) => {
    dispatch(setAnnotationStyle(annotation.id, { ...style, ...patch }));
  };

  return (
    <div style={{ padding: '12px 16px' }}>
      <div style={{ fontWeight: 600, marginBottom: 12, color: '#555' }}>Rectangle</div>
      <Form size="small">
        <Form.Field>
          <label>Stroke color</label>
          <input
            type="color"
            value={style.strokeColor || '#4a90d9'}
            onChange={(e) => update({ strokeColor: e.target.value })}
            style={{ width: 40, height: 28, border: 'none', cursor: 'pointer' }}
          />
        </Form.Field>
        <Form.Field>
          <label>Stroke width</label>
          <input
            type="range"
            min={1} max={16} step={1}
            value={style.strokeWidth || 2}
            onChange={(e) => update({ strokeWidth: Number(e.target.value) })}
            style={{ width: '100%' }}
          />
          <span style={{ fontSize: 12, color: '#888' }}>{style.strokeWidth || 2}px</span>
        </Form.Field>
        <Form.Field>
          <label>Fill color</label>
          <input
            type="color"
            value={style.fillColor || '#4a90d9'}
            onChange={(e) => update({ fillColor: e.target.value })}
            style={{ width: 40, height: 28, border: 'none', cursor: 'pointer' }}
          />
        </Form.Field>
        <Form.Field>
          <label>Fill opacity ({Math.round((style.fillOpacity || 0) * 100)}%)</label>
          <input
            type="range"
            min={0} max={1} step={0.05}
            value={style.fillOpacity || 0}
            onChange={(e) => update({ fillOpacity: Number(e.target.value) })}
            style={{ width: '100%' }}
          />
        </Form.Field>
      </Form>
      <Button
        size="mini"
        color="red"
        basic
        style={{ marginTop: 8 }}
        onClick={() => dispatch(deleteAnnotation(annotation.id))}
      >
        Delete rectangle
      </Button>
    </div>
  );
};

const mapStateToProps = (state) => {
  const graph = getPresentGraph(state);
  const selectedAnnotationId = state.selection.entities
    .find((e) => e.entityType === 'annotation')?.id;
  const annotation = selectedAnnotationId
    ? (graph.annotations || []).find((a) => a.id === selectedAnnotationId)
    : null;
  return { annotation };
};

export default connect(mapStateToProps)(AnnotationInspector);
