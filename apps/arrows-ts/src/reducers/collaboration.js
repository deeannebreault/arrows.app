const initialState = {
  sessionId: null,
  participants: [],
  cursors: {},
  tokenHolder: null,   // { id, name } or null
  myUserId: null,
}

const collaboration = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_COLLAB_SESSION':
      return { ...state, sessionId: action.sessionId, myUserId: action.userId || state.myUserId }

    case 'CONTROL_UPDATE':
      return { ...state, tokenHolder: action.tokenHolder }

    case 'UPDATE_PARTICIPANTS':
      return { ...state, participants: action.participants }

    case 'REMOTE_CURSOR_UPDATE':
      return {
        ...state,
        cursors: {
          ...state.cursors,
          [action.userId]: { userName: action.userName, position: action.position }
        }
      }

    case 'CLEAR_COLLAB_SESSION':
      return initialState

    default:
      return state
  }
}

export default collaboration
