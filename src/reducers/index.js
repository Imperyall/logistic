import { combineReducers } from 'redux';

import points  from './points';
import utils   from './utils';
import moveWin from './moveWin';

const rootReducer = combineReducers({
  points,
  utils,
  moveWin,
});

// IMPORTANT: Note that with Redux, state should NEVER be changed.
// State is considered immutable. Instead,
// create a copy of the state passed and set new values on the copy.
// Note that I'm using immutable.js to create a copy of current state
// and update values on the copy.
export default rootReducer;