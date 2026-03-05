import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import thunkMiddleware from 'redux-thunk'
import {render} from 'react-dom';
import {Provider} from 'react-redux'
import {createStore, applyMiddleware} from 'redux'

import reducer from './reducers'

import { unregister as unregisterServiceWorker } from './registerServiceWorker'
import 'semantic-ui-css/semantic.min.css'
import {viewportMiddleware} from "./middlewares/viewportMiddleware"
import {storageMiddleware} from "./middlewares/storageMiddleware";
import {windowLocationHashMiddleware} from "./middlewares/windowLocationHashMiddleware";
import {initGoogleDriveApi} from "./actions/googleDrive";
import {windowResized} from "./actions/applicationLayout";
import {initRecentStorage, recentStorageMiddleware} from "./middlewares/recentStorageMiddleware";
import {imageCacheMiddleware} from "./middlewares/imageCacheMiddleware";
import {collaborationMiddleware} from "./middlewares/collaborationMiddleware";

import './styles.css'

import App from './app/App';

const middleware = [
  recentStorageMiddleware,
  storageMiddleware,
  collaborationMiddleware,
  windowLocationHashMiddleware,
  viewportMiddleware,
  imageCacheMiddleware
]

const store = createStore(
  reducer,
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__(),
  applyMiddleware(thunkMiddleware, ...middleware)
)
initGoogleDriveApi(store)
store.dispatch(windowResized(window.innerWidth, window.innerHeight))
store.dispatch(initRecentStorage(store.getState()))


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <Provider store={store}>
          <App />
        </Provider>,
  </StrictMode>
);

unregisterServiceWorker()