const initialState = {
  sessionId: null,
  participants: [],
  cursors: {}
}

const collaboration = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_COLLAB_SESSION':
      return { ...state, sessionId: action.sessionId }

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
