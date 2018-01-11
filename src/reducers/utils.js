import {
	FETCH_DELIVERY_DEPS_SUCCESS,
	BEGIN_LOADING,
	CHANGE_BLOCKS_SIZE,
	SAVE_COMMENT,
} from '../constants/actionTypes';

//import { fromJS, List } from 'immutable';

const DEFAULT_STATE = {
  deliveryDeps: [],
  isLoading: false,
  windowSize: {},
  modalData: {},
};

export default function utils(state = DEFAULT_STATE, action) {
	switch (action.type) {
		case FETCH_DELIVERY_DEPS_SUCCESS: {
      return {
				...state,
				deliveryDeps: action.payload,
      };
    }

    case BEGIN_LOADING: {
      return state.isLoading && action.payload
				? state 
				: {
        ...state,
        isLoading: action.payload
      };
    }

    case CHANGE_BLOCKS_SIZE: {
      return {
				...state,
				windowSize: action.payload,
      };
    }

    case SAVE_COMMENT: {
      return {
				...state,
				modalData: action.payload,
      };
    }

    default: {
      return state;
    }
	}
}