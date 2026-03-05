import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { Modal, Button, Loader, Message, Input, List, Icon } from 'semantic-ui-react';
import { hideShareDialog } from '../actions/applicationDialogs';
import { getPresentGraph } from '../selectors';

const SHARE_URL = import.meta.env?.VITE_SHARE_URL || '';
const API_KEY = import.meta.env?.VITE_API_KEY || null;

function apiHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (API_KEY) headers['x-api-key'] = API_KEY;
  return headers;
}

const NAME_KEY = 'collab_user_name';

function getSavedName() {
  return localStorage.getItem(NAME_KEY) || '';
}

function saveName(name) {
  const trimmed = name.trim() || 'Anonymous';
  localStorage.setItem(NAME_KEY, trimmed);
  sessionStorage.setItem(NAME_KEY, trimmed);
}

function ShareModal({ showModal, graph, diagramName, onClose }) {
  const [view, setView] = useState('browser'); // 'browser' | 'new'
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [creating, setCreating] = useState(false);
  const [sessionUrl, setSessionUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [yourName, setYourName] = useState(getSavedName);

  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true);
    setError(null);
    try {
      const resp = await fetch(`${SHARE_URL}/api/shares?active=true`, {
        headers: apiHeaders(),
      });
      if (!resp.ok) throw new Error('Could not load sessions');
      const data = await resp.json();
      setSessions(data.sessions || []);
    } catch (err) {
      setError('Could not reach the collaboration server.');
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    if (showModal) {
      setView('browser');
      setSessionUrl(null);
      setError(null);
      setCopied(false);
      fetchSessions();
    }
  }, [showModal, fetchSessions]);

  useEffect(() => {
    if (view === 'new') {
      setSessionName(diagramName || 'Untitled');
      setSessionUrl(null);
      setError(null);
    }
  }, [view, diagramName]);

  const handleJoin = (session) => {
    saveName(yourName);
    window.location.hash = `/collab/${session.id}`;
    onClose();
  };

  const handleCreate = async () => {
    saveName(yourName);
    setCreating(true);
    setError(null);
    try {
      const resp = await fetch(`${SHARE_URL}/api/share`, {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({ graphData: graph, diagramName: sessionName || 'Untitled' }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Server error');
      setSessionUrl(data.sessionUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = () => {
    if (!sessionUrl) return;
    navigator.clipboard.writeText(sessionUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  if (!showModal) return null;

  return (
    <Modal size='small' open={true} onClose={onClose}>
      <Modal.Header>
        <Icon name='users' />
        {view === 'browser' ? 'Live Share' : 'Start New Session'}
      </Modal.Header>

      <Modal.Content>
        <Input
          fluid
          label={<label style={{ display: 'flex', alignItems: 'center', padding: '0 0.75em', background: '#f5f5f5', border: '1px solid rgba(34,36,38,.15)', borderRight: 'none', borderRadius: '4px 0 0 4px', whiteSpace: 'nowrap' }}>Your name</label>}
          placeholder='How others will see you…'
          value={yourName}
          onChange={e => setYourName(e.target.value)}
          style={{ marginBottom: '1.25em' }}
        />

        {view === 'browser' && (
          <>
            {loadingSessions && <Loader active inline='centered' content='Loading sessions…' style={{ marginBottom: '1em' }} />}

            {!loadingSessions && error && (
              <Message warning>
                <Message.Header>Collaboration server unavailable</Message.Header>
                <p>{error}</p>
              </Message>
            )}

            {!loadingSessions && !error && sessions.length === 0 && (
              <Message info>
                <p>No active sessions right now. Start one below.</p>
              </Message>
            )}

            {!loadingSessions && sessions.length > 0 && (
              <>
                <p style={{ marginBottom: '0.5em', color: '#666', fontSize: '0.9em' }}>
                  Click a session to join and sync your diagram in real time.
                </p>
                <List divided relaxed selection>
                  {sessions.map(s => (
                    <List.Item key={s.id} onClick={() => handleJoin(s)} style={{ cursor: 'pointer' }}>
                      <List.Icon name='circle' color='green' verticalAlign='middle' />
                      <List.Content>
                        <List.Header>{s.diagram_name}</List.Header>
                        <List.Description style={{ fontSize: '0.8em' }}>
                          {s.access_count} {s.access_count === 1 ? 'join' : 'joins'} · updated {new Date(s.updated_at).toLocaleTimeString()}
                        </List.Description>
                      </List.Content>
                    </List.Item>
                  ))}
                </List>
              </>
            )}
          </>
        )}

        {view === 'new' && (
          <>
            {!sessionUrl && (
              <>
                <p style={{ marginBottom: '0.75em' }}>
                  Give this session a name, then share the link with collaborators.
                </p>
                <Input
                  fluid
                  placeholder='Session name…'
                  value={sessionName}
                  onChange={e => setSessionName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !creating && handleCreate()}
                  style={{ marginBottom: '0.75em' }}
                />
              </>
            )}

            {error && (
              <Message negative>
                <Message.Header>Could not create session</Message.Header>
                <p>{error}</p>
              </Message>
            )}

            {sessionUrl && (
              <>
                <p style={{ marginBottom: '0.5em', color: '#666' }}>
                  Share this link — anyone with it can join and edit in real time.
                </p>
                <Input
                  fluid
                  readOnly
                  value={sessionUrl}
                  onFocus={e => e.target.select()}
                  action={
                    <Button icon='copy' content='Copy' onClick={handleCopy} />
                  }
                />
                {copied && (
                  <Message positive size='small' style={{ marginTop: '0.5em' }}>
                    Link copied to clipboard!
                  </Message>
                )}
              </>
            )}
          </>
        )}
      </Modal.Content>

      <Modal.Actions>
        {view === 'browser' && (
          <>
            <Button
              icon='add'
              content='Start New Session'
              primary
              onClick={() => setView('new')}
            />
            <Button content='Close' onClick={onClose} />
          </>
        )}
        {view === 'new' && (
          <>
            <Button
              icon='arrow left'
              content='Back'
              basic
              onClick={() => setView('browser')}
            />
            {!sessionUrl && (
              <Button
                icon='share'
                content='Share & Copy Link'
                primary
                loading={creating}
                disabled={creating || !sessionName.trim()}
                onClick={handleCreate}
              />
            )}
            {sessionUrl && (
              <Button content='Done' onClick={onClose} />
            )}
          </>
        )}
      </Modal.Actions>
    </Modal>
  );
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
