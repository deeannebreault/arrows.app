import React, { Component } from 'react';
import { Segment, Form, TextArea, Button, Input } from 'semantic-ui-react';

export default class AnnotationInspector extends Component {
  render() {
    const { annotations, onSaveText, onSaveStyle, onDelete } = this.props;

    if (!annotations || annotations.length === 0) {
      return null;
    }

    // For simplicity, we'll just edit the first selected annotation
    const annotation = annotations[0];
    const isTextAnnotation = annotation.type === 'TEXT';

    const disabledSubmitButtonToPreventImplicitSubmission = (
      <button
        type="submit"
        disabled
        style={{ display: 'none' }}
        aria-hidden="true"
      />
    );

    return (
      <Segment basic style={{ margin: 0 }}>
        <Form style={{ textAlign: 'left' }}>
          {disabledSubmitButtonToPreventImplicitSubmission}

          <Form.Field>
            <label>
              Selection: {annotations.length} Annotation
              {annotations.length > 1 ? 's' : ''}
            </label>
            <Button
              floated="right"
              size="small"
              icon="trash alternate outline"
              content="Delete"
              onClick={() => {
                annotations.forEach((a) => onDelete(a.id));
              }}
            />
          </Form.Field>

          <div style={{ clear: 'both', paddingTop: '1em' }} />

          {isTextAnnotation && (
            <Form.Field>
              <label>Text</label>
              <TextArea
                value={annotation.text || ''}
                onChange={(e) => onSaveText(annotation.id, e.target.value)}
                rows={3}
              />
            </Form.Field>
          )}

          <Form.Field>
            <label>Font Size</label>
            <Input
              type="number"
              value={annotation.style?.fontSize || 24}
              onChange={(e) =>
                onSaveStyle(annotation.id, {
                  fontSize: parseInt(e.target.value, 10) || 24,
                })
              }
            />
          </Form.Field>

          <Form.Field>
            <label>Color</label>
            <Input
              type="color"
              value={annotation.style?.color || '#000000'}
              onChange={(e) =>
                onSaveStyle(annotation.id, { color: e.target.value })
              }
            />
          </Form.Field>
        </Form>
      </Segment>
    );
  }
}
