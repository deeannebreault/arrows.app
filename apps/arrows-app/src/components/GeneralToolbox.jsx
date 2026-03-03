import React, { Component } from 'react';
import { Button, Checkbox, Form, Input, Select } from 'semantic-ui-react';

export class GeneralToolbox extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      drawingMode,
      onToggleDrawingMode,
      textMode,
      drawToolMode,
      onSetDrawToolMode,
      drawSnapMode,
      onSetDrawSnapMode,
      drawStrokeColor,
      onSetDrawStrokeColor,
      drawStrokeWidth,
      onSetDrawStrokeWidth,
    } = this.props;

    const toolboxItems = (
      <div>
        <Button
          primary
          floated="right"
          size="small"
          icon="circle"
          content="Add Node"
          onClick={this.props.onPlusNodeClick}
        />
        <Button
          floated="right"
          size="small"
          icon="font"
          content={textMode ? 'Cancel Text' : 'Add Text'}
          color={textMode ? 'red' : undefined}
          onClick={this.props.onAddTextClick}
        />
        <Button
          floated="right"
          size="small"
          icon="pencil"
          content={drawingMode ? 'Stop Drawing' : 'Draw'}
          color={drawingMode ? 'red' : undefined}
          onClick={onToggleDrawingMode}
        />

        <div style={{ clear: 'both', paddingTop: 12 }} />

        <Form.Group widths="equal">
          <Form.Field>
            <label>Draw Type</label>
            <Select
              fluid
              options={[
                { key: 'line', text: 'Line', value: 'LINE' },
                { key: 'free', text: 'Free', value: 'FREE' },
              ]}
              value={drawToolMode}
              onChange={(_, data) => onSetDrawToolMode(data.value)}
            />
          </Form.Field>

          <Form.Field>
            <label>Stroke Width</label>
            <Input
              type="number"
              min={1}
              max={20}
              value={drawStrokeWidth}
              onChange={(e) =>
                onSetDrawStrokeWidth(
                  Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 2))
                )
              }
            />
          </Form.Field>

          <Form.Field>
            <label>Stroke Color</label>
            <Input
              type="color"
              value={drawStrokeColor}
              onChange={(e) => onSetDrawStrokeColor(e.target.value)}
            />
          </Form.Field>

          <Form.Field>
            <label>Snap</label>
            <div style={{ paddingTop: 7 }}>
              <Checkbox
                toggle
                checked={drawSnapMode}
                onChange={(_, data) => onSetDrawSnapMode(Boolean(data.checked))}
                label={drawSnapMode ? 'On' : 'Off'}
              />
            </div>
          </Form.Field>
        </Form.Group>
      </div>
    );

    return <Form.Field>{toolboxItems}</Form.Field>;
  }
}
