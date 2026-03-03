import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, Input, Message } from 'semantic-ui-react';
import { Base64 } from 'js-base64';
import { hideShareDialog } from '../actions/applicationDialogs';
import { getPresentGraph } from '../selectors';

class ShareModal extends Component {
  constructor(props) {
    super(props);
    this.state = { copied: false };
  }

  getShareUrl() {
    const { graph, diagramName } = this.props;
    const jsonString = JSON.stringify({ graph, diagramName });
    return window.location.origin + '/#/import/json=' + Base64.encode(jsonString);
  }

  handleCopy = () => {
    navigator.clipboard.writeText(this.getShareUrl()).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    });
  };

  handleClose = () => {
    this.setState({ copied: false });
    this.props.onClose();
  };

  render() {
    if (!this.props.showModal) return null;

    const url = this.getShareUrl();

    return (
      <Modal size="small" open={true} onClose={this.handleClose}>
        <Modal.Header>Share Diagram</Modal.Header>
        <Modal.Content>
          <p>
            Anyone with this link can open a copy of your current diagram.
          </p>
          <Input
            fluid
            readOnly
            value={url}
            action={
              <Button
                icon='copy'
                content='Copy'
                onClick={this.handleCopy}
              />
            }
            onFocus={e => e.target.select()}
          />
          {this.state.copied && (
            <Message positive size='small' style={{ marginTop: '0.75em' }}>
              Link copied to clipboard!
            </Message>
          )}
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.handleClose} content='Done' />
        </Modal.Actions>
      </Modal>
    );
  }
}

const mapStateToProps = state => ({
  showModal: state.applicationDialogs.showShareDialog,
  graph: getPresentGraph(state),
  diagramName: state.diagramName,
});

const mapDispatchToProps = dispatch => ({
  onClose: () => dispatch(hideShareDialog()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ShareModal);
