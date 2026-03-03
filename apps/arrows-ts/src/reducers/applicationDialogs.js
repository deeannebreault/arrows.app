import {retrieveHelpDismissed} from "../actions/localStorage";
export default function applicationDialogs(state = {
  showExportDialog: false,
  showSaveAsDialog: false,
  showImportDialog: false,
  showHelpDialog: !retrieveHelpDismissed(),
  showShareDialog: false
}, action) {
  switch (action.type) {
    case 'SHOW_EXPORT_DIALOG':
      return {
        ...state,
        showExportDialog: true
      }

    case 'HIDE_EXPORT_DIALOG':
      return {
        ...state,
        showExportDialog: false
      }

    case 'SHOW_SAVE_AS_DIALOG':
      return {
        ...state,
        showSaveAsDialog: true
      }

    case 'HIDE_SAVE_AS_DIALOG':
      return {
        ...state,
        showSaveAsDialog: false
      }

    case 'SHOW_IMPORT_DIALOG':
      return {
        ...state,
        showImportDialog: true
      }

    case 'HIDE_IMPORT_DIALOG':
      return {
        ...state,
        showImportDialog: false
      }

    case 'SHOW_HELP_DIALOG':
      return {
        ...state,
        showHelpDialog: true
      }

    case 'HIDE_HELP_DIALOG':
      return {
        ...state,
        showHelpDialog: false
      }

    case 'SHOW_SHARE_DIALOG':
      return {
        ...state,
        showShareDialog: true
      }

    case 'HIDE_SHARE_DIALOG':
      return {
        ...state,
        showShareDialog: false
      }

    default:
      return state
  }

}