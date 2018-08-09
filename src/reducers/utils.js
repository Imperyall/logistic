import {
	FETCH_DELIVERY_DEPS_SUCCESS,
  FETCH_DELIVERY_ZONES_SUCCESS,
  FETCH_CARS,
  FETCH_DRIVERS,
	BEGIN_LOADING,
	CHANGE_BLOCKS_SIZE,
	SAVE_COMMENT,
  CHANGE_ZOOM,
  HANDLE_LOADING_TIMEOUT,
  HANDLE_LOADING_NEXT_TICK,
} from '../constants/actionTypes';

//import { fromJS, List } from 'immutable';

const DEFAULT_STATE = {
  deliveryDeps: [],
  deliveryZones: [],
  drivers: [],
  cars: [],
  isLoading: [],
  loadingTimeout: 0,
  loadingCurrent: 0,
  windowSize: {},
  modalData: {},
  zoom: 13,
};

export default function utils(state = DEFAULT_STATE, action) {
	switch (action.type) {
		case FETCH_DELIVERY_DEPS_SUCCESS: {
      return {
        ...state,
        deliveryDeps: action.payload,
      };
    }

    case FETCH_DELIVERY_ZONES_SUCCESS: {
      return {
        ...state,
        deliveryZones: action.payload,
      };
    }

    case FETCH_CARS: {
      return {
        ...state,
        cars: action.payload,
      };
    }

    case FETCH_DRIVERS: {
      return {
        ...state,
        drivers: action.payload,
      };
    }

    case BEGIN_LOADING: {
      const { add, end } = action.payload;
      let newLoading = state.isLoading;

      if (end) {
        newLoading.splice(state.isLoading.indexOf(end), 1);
      } else if (add) {
        newLoading.push(add);
      }

      return {
        ...state,
        isLoading: newLoading,
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

    case CHANGE_ZOOM: {
      return {
        ...state,
        zoom: action.payload,
      };
    }

    case HANDLE_LOADING_TIMEOUT: {
      const timeout = action.payload > 0 ? action.payload + 10 : 0;

      return {
        ...state,
        loadingTimeout: timeout,
        loadingCurrent: timeout,
      };
    }

    case HANDLE_LOADING_NEXT_TICK: {
      if (action.payload) return { ...state, loadingCurrent: 0 };
      if (state.loadingCurrent == 0) return state;

      return {
        ...state,
        loadingCurrent: --state.loadingCurrent,
      };
    }

    default: {
      return state;
    }
	}
}