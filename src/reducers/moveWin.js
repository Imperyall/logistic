import {
	HANDLE_VISIBLE,
	HANDLE_WINDOW_ROUTE,
	HANDLE_WINDOW_POINT,
} from '../constants/actionTypes';

const DEFAULT_STATE = {
  show: false,
  r_id: 0,
  r_text: null,
  w_id: 0,
  w_text: null,
};

export default function moveWin(state = DEFAULT_STATE, action) {
	switch (action.type) {
		case HANDLE_VISIBLE: {
			if (state.show == action.payload) return state;

			return action.payload 
				? {	...state,	show: action.payload } 
				: DEFAULT_STATE;
		}

		case HANDLE_WINDOW_ROUTE: {
			const { r_id, r_text } = action.payload;

			return state.r_id === r_id && state.r_text === r_text 
				? state
				: { ...state, r_id, r_text };
		}

		case HANDLE_WINDOW_POINT: {
			const { w_id, w_text } = action.payload;
			
			return state.w_id === w_id && state.w_text === w_text 
				? state
				: { ...state, w_id, w_text	};
		}

		default: {
			return state;
		}
	}
}