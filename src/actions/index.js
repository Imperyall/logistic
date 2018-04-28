import axios from 'axios';
import {
  FETCH_ROUTES_SUCCESS,
  FETCH_DELIVERY_DEPS_SUCCESS,
  FETCH_DELIVERY_ZONES_SUCCESS,
  MOVE_WAYPOINT,
  TOGGLE_OPEN_ROUTE,
  SET_CHECKED_ROUTE,
  SET_ACTIVE_ROUTE,
  SET_ACTIVE_WAYPOINT,
  BEGIN_LOADING,
  CHANGE_BLOCKS_SIZE,
  HANDLE_VISIBLE,
  HANDLE_WINDOW_ROUTE,
  HANDLE_WINDOW_POINT,
  CLEAR_SELECTION,
} from '../constants/actionTypes';
import BASE_URL from '../constants/baseURL';

const logging = (fun, response) => {
  //process.env.NODE_ENV === 'development' && 
  console.log(`[RESPONSE][${fun}]`, response.data && response.data.length ? response.data : 'null');
};

export function fetchRoutes(params) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/routes/get/`, { params })
      .then((res) => {
        logging('fetchRoutes', res);
        
        dispatch({ type: FETCH_ROUTES_SUCCESS, payload: res.data });
        dispatch(beginLoading(false));
      }).then(() => {
        dispatch(setSizeBlocks());
      });
  };
}

export function sortRoutes(fetchParams, sortParams) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/routes/sort/`, { params: sortParams })
      .then((res) => {
        logging('sortRoutes', res);
        
        dispatch(fetchRoutes(fetchParams));
      });
  };
}

export function optimizeRoutes(fetchParams, pk) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/routes/optimize/`, { params: { pk } })
      .then((res) => {
        logging('optimizeRoutes', res);
        
        dispatch(fetchRoutes(fetchParams));
      });
  };
}

export function optimizeAllRoutes(fetchParams, pk, opts, bases) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/routes/all/`, { params: { pk, opts, bases } })
      .then((res) => {
        logging('optimizeAllRoutes', res);
        
        dispatch(fetchRoutes(fetchParams));
      });
  };
}

export function addRoutes(fetchParams) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/routes/add/`)
      .then((res) => {
        logging('addRoutes', res);
        
        dispatch(fetchRoutes(fetchParams));
      });
  };
}

export function uploadRoutes(fetchParams, pk) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/routes/upload/`, { params: { pk } })
    .then((res) => {
      logging('uploadRoutes', res);
        
      dispatch(fetchRoutes(fetchParams));
    });
  };
}

export function uploadXls(fetchParams, pk) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/routes/uploadXls/`, { params: { pk } })
      .then((res) => {
        logging('uploadXls', res);
        
        dispatch(fetchRoutes(fetchParams));
      });
  };
}

export function recycleRoutes(fetchParams, pk) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/routes/recycle/`, { params: { pk } })
      .then((res) => {
        logging('recycleRoutes', res);
        dispatch(clearSelection(pk));
        
        dispatch(fetchRoutes(fetchParams));
      });
  };
}

export function unrecycleRoutes(fetchParams, pk) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/routes/unrecycle/`, { params: { pk } })
      .then((res) => {
        logging('unrecycleRoutes', res);
        
        dispatch(fetchRoutes(fetchParams));
      });
  };
}

export function acceptRoutes(fetchParams, pk) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/routes/accept/`, { params: { pk } })
      .then((res) => {
        logging('acceptRoutes', res);
        
        dispatch(fetchRoutes(fetchParams));
      });
  };
}

export function reloadRoutes(fetchParams, pk) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/routes/reload/`, { params: { pk } })
      .then((res) => {
        logging('reloadRoutes', res);
        
        dispatch(fetchRoutes(fetchParams));
      });
  };
}

export function newRoutes(fetchParams) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/routes/new/`)
      .then((res) => {
        logging('newRoutes', res);
        
        dispatch(fetchRoutes(fetchParams));
      });
  };
}

export function fetchDeliveryDeps(params) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/deliverydeps/get/`, { params })
      .then((res) => {
        logging('fetchDeliveryDeps', res);
        
        dispatch({ type: FETCH_DELIVERY_DEPS_SUCCESS, payload: res.data });
      });
  };
}

export function fetchDeliveryZones(params) {
  return (dispatch) => {
    //dispatch(beginLoading());

    if (!params.length) {
      return dispatch({ type: FETCH_DELIVERY_ZONES_SUCCESS, payload: [] });
    } else {
      return axios.get(`${BASE_URL}/deliveryzones/get/`, { params: { delivery_deps_list: params } })
        .then((res) => {
          logging('fetchDeliveryZones', res);
          
          dispatch({ type: FETCH_DELIVERY_ZONES_SUCCESS, payload: res.data });
        });
    }
  };
}

export function changeDeps(fetchParams, deliveryDeps, pk) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/routes/changedeps/`, { params: { deliveryDeps, pk } })
      .then((res) => {
        logging('changeDeps', res);
        
        dispatch(fetchRoutes(fetchParams));
      });
  };
}

export function moveWaypoint(newStateRoutes) {
  return (dispatch) => {
    dispatch({
      type: MOVE_WAYPOINT, 
      payload: newStateRoutes
    });
  };
}

export function toggleOpenRoute(routeIndex) {
  return (dispatch) => {
    dispatch({
      type: TOGGLE_OPEN_ROUTE,
      payload: routeIndex
    });
  };
}

export function setCheckedRoute(routeIndex, value, shift) {
  return (dispatch) => {
    dispatch({
      type: SET_CHECKED_ROUTE, 
      payload: { routeIndex, value, shift }
    });
  };
}

export function setActiveRoute(routeIndex, value) {
  return (dispatch) => {
    dispatch({
      type: SET_ACTIVE_ROUTE, 
      payload: { routeIndex, value }
    });
  };
}

export function setActiveWaypoint(routeIndex, waypointIndex, value, add) {
  return (dispatch) => {
    dispatch({
      type: SET_ACTIVE_WAYPOINT,
      payload: { routeIndex, waypointIndex, value, add }
    });
  };
}

export function beginLoading(isLoading = true) {
  return (dispatch) => {
    dispatch({
      type: BEGIN_LOADING, 
      payload: isLoading
    });
  };
}

export function setNewBlocksSize(data) {
  return (dispatch) => {
    dispatch({
      type: CHANGE_BLOCKS_SIZE,
      payload: data
    });
  };
}

export function clearSelection(data) {
  return (dispatch) => {
    dispatch({
      type: CLEAR_SELECTION,
      payload: data
    });
  };
}

export function setSizeBlocks(di = 33, final = false) { // Функция пересчета размера элементов
  return (dispatch) => {
    const param = window._divider || di;
    window._sb = window.innerWidth - document.body.clientWidth || 0;

    const padding = 20, divid = 27; //Отступы по краям, ширина кнопки раздлелителя с отступами
    const wi = window.innerWidth - padding; //ширина окна, отступ по краям
    const widivi = divid/wi*100; //Ширина разделителя в процентах
    const pp = padding/wi*100; //Padding percent
    
    const rwi = Number((param - pp).toFixed(2));
    const lwi = Number((100 - param - widivi).toFixed(2));

    if (final) {
      dispatch(
        setNewBlocksSize({
          'leftWidth': lwi + '%',
          'rightWidth': rwi + '%',
        })
      );

      window.google.maps.event.trigger(window._m.context['__SECRET_MAP_DO_NOT_USE_OR_YOU_WILL_BE_FIRED'], 'resize'); //перестроение размера окна
    } else {
      document.getElementById('leftSide').style.width = lwi + '%';
      document.getElementById('rightSide').style.width = rwi + '%';
    }
  };
}

export function saveComment(fetchParams, { id, comment }) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/index/save/`, { params: { id, comment } })
      .then((res) => {
        logging('saveComment', res);
        
        dispatch(fetchRoutes(fetchParams));
    });
  };
}

export function moveWaypoints(fetchParams, route, ids) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/index/move/`, { params: { route, ids } })
      .then((res) => {
        logging('moveWaypoints', res);
        
        dispatch(fetchRoutes(fetchParams));
    });
  };
}

export function handleShowWindow(state) {
  return (dispatch) => {
    dispatch({
      type: HANDLE_VISIBLE,
      payload: state
    });
  };
}

export function handleWindowRoute({ r_id, r_text }) {
  return (dispatch) => {
    dispatch({
      type: HANDLE_WINDOW_ROUTE,
      payload: { r_id, r_text }
    });
  };
}

export function handleWindowPoint({ w_id, w_text }) {
  return (dispatch) => {
    dispatch({
      type: HANDLE_WINDOW_POINT,
      payload: { w_id, w_text }
    });
  };
}

export function upload1C(fetchParams, { deliveryDeps, deliveryZones, options }) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/routes/copy_loaded/`, { params: { deliveryDeps, deliveryZones, options } })
      .then((res) => {
        logging('copy_loaded', res);
        
        dispatch(fetchRoutes(fetchParams));
      });
  };
}