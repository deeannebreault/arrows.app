import React from 'react'
import { connect } from 'react-redux'
import { getPresentGraph } from '../selectors'
import { claimControl, releaseControl } from '../middlewares/collaborationMiddleware'

const styles = {
  panel: {
    position: 'fixed',
    bottom: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(30,30,30,0.92)',
    color: '#fff',
    borderRadius: 24,
    padding: '8px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 13,
    zIndex: 1000,
    boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
    userSelect: 'none',
    backdropFilter: 'blur(4px)',
  },
  dot: (color) => ({
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: color,
    display: 'inline-block',
    marginRight: 6,
    flexShrink: 0,
  }),
  btn: (primary) => ({
    background: primary ? '#4a90d9' : '#555',
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    padding: '5px 14px',
    fontSize: 12,
    cursor: 'pointer',
    fontWeight: 600,
  }),
}

function CollabControlPanel({ sessionId, tokenHolder, myUserId, currentGraph }) {
  if (!sessionId) return null

  const iHolder = tokenHolder?.id === myUserId
  const holderName = tokenHolder?.name || null

  const handleClaim = () => claimControl()
  const handleRelease = () => releaseControl(currentGraph)

  return (
    <div style={styles.panel}>
      {holderName ? (
        <>
          <span style={styles.dot('#4caf50')} />
          <span>
            {iHolder ? 'You have' : <><b>{holderName}</b> has</>} control
          </span>
          {iHolder && (
            <button style={styles.btn(true)} onClick={handleRelease}>
              Release &amp; Sync
            </button>
          )}
        </>
      ) : (
        <>
          <span style={styles.dot('#999')} />
          <span>No one editing</span>
          <button style={styles.btn(true)} onClick={handleClaim}>
            Take Control
          </button>
        </>
      )}
    </div>
  )
}

const mapStateToProps = state => ({
  sessionId: state.collaboration.sessionId,
  tokenHolder: state.collaboration.tokenHolder,
  myUserId: state.collaboration.myUserId,
  currentGraph: getPresentGraph(state),
})

export default connect(mapStateToProps)(CollabControlPanel)
