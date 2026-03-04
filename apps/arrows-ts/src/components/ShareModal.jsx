import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, Input, Message, Loader } from 'semantic-ui-react';
import { hideShareDialog } from '../actions/applicationDialogs';
import { getPresentGraph } from '../selectors';

const SHARE_URL = import.meta.env?.VITE_SHARE_URL || ''

class ShareModal extends Component {
  constructor(props) {
    super(props);
    this.state = { copied: false, sessionUrl: null, loading: false, error: null };
  }

  componentDidUpdate(prevProps) {
    // When modal opens, create a session
    if (!prevProps.showModal && this.props.showModal) {
      this.createSession();
    }
    // Reset when modal closes
    if (prevProps.showModal && !this.props.showModal) {
      this.setState({ sessionUrl: null, loading: false, error: null, copied: false });
    }
  }

  async createSession() {
    const { graph, diagramName } = this.props;
    this.setState({ loading: true, error: null, sessionUrl: null });
    try {
      const resp = await fetch(`${SHARE_URL}/api/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ graphData: graph, diagramName: diagramName || 'Untitled' })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Server error');
      this.setState({ sessionUrl: data.sessionUrl, loading: false });
    } catch (err) {
      this.setState({ error: err.message, loading: false });
    }
  }

  handleCopy = () => {
    const { sessionUrl } = this.state;
    if (!sessionUrl) return;
    navigator.clipboard.writeText(sessionUrl).then(() => {
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
    const { sessionUrl, loading, error, copied } = this.state;

    return (
      <Modal size="small" open={true} onClose={this.handleClose}>
        <Modal.Header>Share Diagram (Live Collaboration)</Modal.Header>
        <Modal.Content>
          <p>
            Share this link so others can join and edit in real time. All changes sync automatically.
          </p>
          {loading && <Loader active inline="centered" content="Creating session..." />}
          {error && (
            <Message negative>
              <Message.Header>Could not create session</Message.Header>
              <p>{error}</p>
            </Message>
          )}
          {sessionUrl && (
            <>
              <Input
                fluid
                readOnly
                value={sessionUrl}
                action={
                  <Button
                    icon='copy'
                    content='Copy'
                    onClick={this.handleCopy}
                  />
                }
                onFocus={e => e.target.select()}
              />
              {copied && (
                <Message positive size='small' style={{ marginTop: '0.75em' }}>
                  Link copied to clipboard!
                </Message>
              )}
            </>
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
