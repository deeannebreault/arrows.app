import { getPresentGraph } from '../selectors'
import { constructGraphFromFile } from '../storage/googleDriveStorage'

// Use Vite env vars if set, otherwise use proxied relative paths (works for both local and remote access)
const WS_URL = (import.meta.env?.VITE_WS_URL) || (window.location.origin.replace(/^http/, 'ws') + '/collab-ws')
const SHARE_URL = (import.meta.env?.VITE_SHARE_URL) || ''

export const collabUrlRegex = /^#\/collab\/(.+)/

let ws = null
let sessionId = null
let _remoteUpdate = false
let debounceTimer = null
let reconnectDelay = 1000
let storeRef = null

function getUserId() {
  let id = sessionStorage.getItem('collab_user_id')
  if (!id) {
    id = 'user-' + Math.random().toString(36).slice(2, 9)
    sessionStorage.setItem('collab_user_id', id)
  }
  return id
}

function getUserName() {
  return sessionStorage.getItem('collab_user_name') || 'Anonymous'
}

function disconnect() {
  if (ws) {
    ws.onclose = null // prevent reconnect loop
    ws.close()
    ws = null
  }
  sessionId = null
  clearTimeout(debounceTimer)
}

function connect(id, store) {
  if (sessionId === id) return // already in this session
  disconnect()
  sessionId = id
  storeRef = store
  const userId = getUserId()
  const userName = getUserName()
  const url = `${WS_URL}?session=${encodeURIComponent(id)}&user=${encodeURIComponent(userId)}&name=${encodeURIComponent(userName)}`

  ws = new WebSocket(url)

  ws.onopen = () => {
    console.log('[collab] Connected to session', id)
    reconnectDelay = 1000
    store.dispatch({ type: 'SET_COLLAB_SESSION', sessionId: id, userId: getUserId() })
  }

  ws.onmessage = (event) => {
    let msg
    try {
      msg = JSON.parse(event.data)
    } catch (e) {
      return
    }
    handleServerMessage(msg, store)
  }

  ws.onclose = () => {
    console.log('[collab] Disconnected, reconnecting in', reconnectDelay, 'ms')
    setTimeout(() => {
      if (sessionId) connect(sessionId, storeRef)
    }, reconnectDelay)
    reconnectDelay = Math.min(reconnectDelay * 2, 30000)
  }

  ws.onerror = (err) => {
    console.error('[collab] WebSocket error', err)
  }
}

function applyRemoteGraph(graph, store) {
  if (!graph) return
  try {
    const parsed = constructGraphFromFile(graph).graph
    _remoteUpdate = true
    store.dispatch({ type: 'GETTING_GRAPH_SUCCEEDED', storedGraph: parsed })
    _remoteUpdate = false
    // Dispatch a no-op viewport action to guarantee a canvas redraw
    store.dispatch({ type: 'COLLAB_REDRAW' })
  } catch (e) {
    console.warn('[collab] Failed to apply remote graph', e)
  }
}

function handleServerMessage(msg, store) {
  switch (msg.type) {
    case 'session_state': {
      const graph = msg.data?.graph
      if (graph) {
        applyRemoteGraph(graph, store)
      } else if (sessionId) {
        // WS server lost the in-memory graph — fall back to REST API
        const url = `${SHARE_URL}/api/share/${encodeURIComponent(sessionId)}`
        const headers = {}
        if (import.meta.env?.VITE_API_KEY) headers['x-api-key'] = import.meta.env.VITE_API_KEY
        fetch(url, { headers })
          .then(r => r.ok ? r.json() : null)
          .then(data => { if (data?.graphData) applyRemoteGraph(data.graphData, store) })
          .catch(e => console.warn('[collab] Could not fetch graph from REST API', e))
      }
      store.dispatch({ type: 'UPDATE_PARTICIPANTS', participants: msg.data?.participants || [] })
      store.dispatch({ type: 'CONTROL_UPDATE', tokenHolder: msg.data?.token_holder || null })
      break
    }
    case 'graph_update': {
      applyRemoteGraph(msg.data, store)
      break
    }
    case 'control_update': {
      store.dispatch({ type: 'CONTROL_UPDATE', tokenHolder: msg.data?.token_holder || null })
      if (msg.data?.graph) {
        applyRemoteGraph(msg.data.graph, store)
      }
      break
    }
    case 'cursor_update': {
      store.dispatch({
        type: 'REMOTE_CURSOR_UPDATE',
        userId: msg.data?.user_id,
        userName: msg.data?.user_name,
        position: msg.data?.position
      })
      break
    }
    case 'participant_joined':
    case 'participant_left': {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'get_state' }))
      }
      break
    }
    default:
      break
  }
}

function sendGraphUpdate(graph) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'graph_update', data: graph }))
  }
}

export function claimControl() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'claim_control' }))
  }
}

export function releaseControl(graph) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'release_control', data: { graph } }))
  }
}

function checkHash(store) {
  const match = window.location.hash.match(collabUrlRegex)
  if (match) {
    connect(match[1], store)
  } else if (sessionId) {
    disconnect()
  }
}

export const collaborationMiddleware = store => next => action => {
  const result = next(action)

  // Listen for hash changes (joining/switching sessions)
  if (!window._collabHashListenerSet) {
    window._collabHashListenerSet = true
    window.addEventListener('hashchange', () => checkHash(store))
    checkHash(store) // check on startup
  }

  // Skip broadcasting remote updates to prevent echo loops
  if (_remoteUpdate) return result

  // On GRAPH actions, debounce and broadcast to collaborators
  if (action.category === 'GRAPH' && sessionId) {
    const newGraph = getPresentGraph(store.getState())
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      sendGraphUpdate(newGraph)
    }, 300)
  }

  return result
}
