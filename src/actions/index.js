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
} from '../constants/actionTypes';
import BASE_URL from '../constants/baseURL';

export function fetchRoutes(params) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/routes/get/`, { params })
      .then((res) => {
        console.log('[RESPONSE][fetchRoutes]', res.data.length ? res.data : 'null');
        
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
        console.log('[RESPONSE][sortRoutes]', res.data.length ? res.data : 'null');
        
        dispatch(fetchRoutes(fetchParams));
      });
  };
}

export function optimizeRoutes(fetchParams, pk, useDistance) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/routes/optimize/`, { params: { pk, useDistance } })
      .then((res) => {
        console.log('[RESPONSE][optimizeRoutes]', res.data.length ? res.data : 'null');
        
        dispatch(fetchRoutes(fetchParams));
      });
  };
}

export function optimizeAllRoutes(fetchParams, pk, opts, useDistance, bases, secondRaces) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/routes/all/`, { params: { pk, opts, useDistance, bases, secondRaces } })
      .then((res) => {
        console.log('[RESPONSE][optimizeAllRoutes]', res.data.length ? res.data : 'null');
        
        dispatch(fetchRoutes(fetchParams));
      });
  };
}

export function addRoutes(fetchParams) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/routes/add/`)
      .then((res) => {
        console.log('[RESPONSE][addRoutes]', res.data.length ? res.data : 'null');
        
        dispatch(fetchRoutes(fetchParams));
      });
  };
}

export function uploadRoutes(fetchParams, pk) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/routes/upload/`, { params: { pk } })
    .then((res) => {
      console.log('[RESPONSE][uploadRoutes]', res.data.length ? res.data : 'null');
        
        dispatch(fetchRoutes(fetchParams));
      });
  };
}

export function uploadXls(fetchParams, pk) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/routes/uploadXls/`, { params: { pk } })
      .then((res) => {
        console.log('[RESPONSE][uploadXls]', res.data.length ? res.data : 'null');
        
        dispatch(fetchRoutes(fetchParams));
      });
  };
}

export function recycleRoutes(fetchParams, pk) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/routes/recycle/`, { params: { pk } })
      .then((res) => {
        console.log('[RESPONSE][recycleRoutes]', res.data.length ? res.data : 'null');
        
        dispatch(fetchRoutes(fetchParams));
      });
  };
}

export function unrecycleRoutes(fetchParams, pk) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/routes/unrecycle/`, { params: { pk } })
      .then((res) => {
        console.log('[RESPONSE][unrecycleRoutes]', res.data.length ? res.data : 'null');
        
        dispatch(fetchRoutes(fetchParams));
      });
  };
}

export function acceptRoutes(fetchParams, pk) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/routes/accept/`, { params: { pk } })
      .then((res) => {
        console.log('[RESPONSE][acceptRoutes]', res.data.length ? res.data : 'null');
        
        dispatch(fetchRoutes(fetchParams));
      });
  };
}

export function reloadRoutes(fetchParams, pk) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/routes/reload/`, { params: { pk } })
      .then((res) => {
        console.log('[RESPONSE][reloadRoutes]', res.data.length ? res.data : 'null');
        
        dispatch(fetchRoutes(fetchParams));
      });
  };
}

export function newRoutes(fetchParams) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/routes/new/`)
      .then((res) => {
        console.log('[RESPONSE][newRoutes]', res.data.length ? res.data : 'null');
        
        dispatch(fetchRoutes(fetchParams));
      });
  };
}

export function fetchDeliveryDeps(params) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/deliverydeps/get/`, { params })
      .then((res) => {
        console.log('[RESPONSE][fetchDeliveryDeps]', res.data.length ? res.data : 'null');
        
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
          console.log('[RESPONSE][fetchDeliveryZones]', res.data.length ? res.data : 'null');
          
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
        console.log('[RESPONSE][changeDeps]', res.data.length ? res.data : 'null');
        
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
        console.log('[RESPONSE][saveComment]', res.data.length ? res.data : 'null');
        
        dispatch(fetchRoutes(fetchParams));
    });
  };
}

export function moveWaypoints(fetchParams, route, ids) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/index/move/`, { params: { route, ids } })
      .then((res) => {
        console.log('[RESPONSE][moveWaypoints]', res.data.length ? res.data : 'null');
        
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

export function upload1C(fetchParams, { deliveryDeps, deliveryZones }) {
  return (dispatch) => {
    dispatch(beginLoading());

    return axios.get(`${BASE_URL}/routes/copy_loaded/`, { params: { deliveryDeps, deliveryZones } })
      .then((res) => {
        console.log('[RESPONSE][copy_loaded]', res.data.length ? res.data : 'null');
        
        dispatch(fetchRoutes(fetchParams));
      });
  };
}