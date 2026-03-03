import React, { Component } from 'react';
import { Button, Form } from 'semantic-ui-react';

export class GeneralToolbox extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { drawingMode, onToggleDrawingMode } = this.props;

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
          content="Add Text"
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
      </div>
    );

    return <Form.Field>{toolboxItems}</Form.Field>;
  }
}
