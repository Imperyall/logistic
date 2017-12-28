import axios from 'axios';
import {
  FETCH_ROUTES_SUCCESS,
  FETCH_DELIVERY_DEPS_SUCCESS,
  MOVE_WAYPOINT,
  TOGGLE_OPEN_ROUTE,
  SET_CHECKED_ROUTE,
  SET_ACTIVE_ROUTE,
  SET_ACTIVE_WAYPOINT,
  BEGIN_LOADING,
  CHANGE_BLOCKS_SIZE,
} from '../constants/actionTypes';
import BASE_URL from '../constants/baseURL';

export const fetchRoutes = (params) => (dispatch) => {
  dispatch(beginLoading());
  return axios.get(`${BASE_URL}/routes/get/`, { params })
    .then((res) => {
      console.log('[RESPONSE][fetchRoutes]', res.data.length ? res.data : 'null');
      dispatch({ 
        type: FETCH_ROUTES_SUCCESS, 
        payload: res.data 
      });
    }).then(() => {
      dispatch(setSizeBlocks());
    });
};

export const sortRoutes = (fetchParams, sortParams) => (dispatch) => {
  dispatch(beginLoading());
  return axios.get(`${BASE_URL}/routes/sort/`, { params: sortParams })
    .then((res) => {
      console.log('[RESPONSE][sortRoutes]', res.data.length ? res.data : 'null');
      dispatch(fetchRoutes(fetchParams));
    });
};

export const optimizeRoutes = (fetchParams, pk, useDistance) => (dispatch) => {
  dispatch(beginLoading());
  return axios.get(`${BASE_URL}/routes/optimize/`, { params: { pk, useDistance } })
    .then((res) => {
      console.log('[RESPONSE][optimizeRoutes]', res.data.length ? res.data : 'null');
      dispatch(fetchRoutes(fetchParams));
    });
};

export const optimizeAllRoutes = (fetchParams, pk, opts, useDistance, bases, secondRaces) => (dispatch) => {
  dispatch(beginLoading());
  return axios.get(`${BASE_URL}/routes/all/`, { params: { pk, opts, useDistance, bases, secondRaces } })
    .then((res) => {
      console.log('[RESPONSE][optimizeAllRoutes]', res.data.length ? res.data : 'null');
      dispatch(fetchRoutes(fetchParams));
    });
};

export const addRoutes = (fetchParams) => (dispatch) => {
  dispatch(beginLoading());
  return axios.get(`${BASE_URL}/routes/add/`)
    .then((res) => {
      console.log('[RESPONSE][addRoutes]', res.data.length ? res.data : 'null');
      dispatch(fetchRoutes(fetchParams));
    });
};

export const uploadRoutes = (fetchParams, pk) => (dispatch) => {
  dispatch(beginLoading());
  return axios.get(`${BASE_URL}/routes/upload/`, { params: { pk } })
    .then((res) => {
      console.log('[RESPONSE][uploadRoutes]', res.data.length ? res.data : 'null');
      dispatch(fetchRoutes(fetchParams));
    });
};

export const uploadXls = (fetchParams, pk) => (dispatch) => {
  dispatch(beginLoading());
  return axios.get(`${BASE_URL}/routes/uploadXls/`, { params: { pk } })
    .then((res) => {
      console.log('[RESPONSE][uploadXls]', res.data.length ? res.data : 'null');
      dispatch(fetchRoutes(fetchParams));
    });
};

export const recycleRoutes = (fetchParams, pk) => (dispatch) => {
  dispatch(beginLoading());
  return axios.get(`${BASE_URL}/routes/recycle/`, { params: { pk } })
    .then((res) => {
      console.log('[RESPONSE][recycleRoutes]', res.data.length ? res.data : 'null');
      dispatch(fetchRoutes(fetchParams));
    });
};

export const unrecycleRoutes = (fetchParams, pk) => (dispatch) => {
  dispatch(beginLoading());
  return axios.get(`${BASE_URL}/routes/unrecycle/`, { params: { pk } })
    .then((res) => {
      console.log('[RESPONSE][unrecycleRoutes]', res.data.length ? res.data : 'null');
      dispatch(fetchRoutes(fetchParams));
    });
};

export const acceptRoutes = (fetchParams, pk) => (dispatch) => {
  dispatch(beginLoading());
  return axios.get(`${BASE_URL}/routes/accept/`, { params: { pk } })
    .then((res) => {
      console.log('[RESPONSE][acceptRoutes]', res.data.length ? res.data : 'null');
      dispatch(fetchRoutes(fetchParams));
    });
};

export const reloadRoutes = (fetchParams, pk) => (dispatch) => {
  dispatch(beginLoading());
  return axios.get(`${BASE_URL}/routes/reload/`, { params: { pk } })
    .then((res) => {
      console.log('[RESPONSE][reloadRoutes]', res.data.length ? res.data : 'null');
      dispatch(fetchRoutes(fetchParams));
    });
};

export const newRoutes = (fetchParams) => (dispatch) => {
  dispatch(beginLoading());
  return axios.get(`${BASE_URL}/routes/new/`)
    .then((res) => {
      console.log('[RESPONSE][newRoutes]', res.data.length ? res.data : 'null');
      dispatch(fetchRoutes(fetchParams));
    });
};

export const fetchDeliveryDeps = (params) => (dispatch) => {
  dispatch(beginLoading());
  return axios.get(`${BASE_URL}/deliverydeps/get/`, { params })
    .then((res) => {
      console.log('[RESPONSE][fetchDeliveryDeps]', res.data.length ? res.data : 'null');
      dispatch({ type: FETCH_DELIVERY_DEPS_SUCCESS, payload: res.data });
    });
};

export const changeDeps = (fetchParams,deliveryDeps, pk) => (dispatch) => {
  dispatch(beginLoading());
  return axios.get(`${BASE_URL}/routes/changedeps/`, { params: { deliveryDeps, pk } })
    .then((res) => {
      console.log('[RESPONSE][changeDeps]', res.data.length ? res.data : 'null');
      dispatch(fetchRoutes(fetchParams));
    });
};

export const moveWaypoint = (newStateRoutes) => (
  { type: MOVE_WAYPOINT, payload: newStateRoutes }
);

export const toggleOpenRoute = (routeIndex) => (
  { type: TOGGLE_OPEN_ROUTE, payload: routeIndex }
);

export const setCheckedRoute = (routeIndex, value, shift) => (
  { type: SET_CHECKED_ROUTE, payload: { routeIndex, value, shift } }
);

export const setActiveRoute = (routeIndex, value) => (
  { type: SET_ACTIVE_ROUTE, payload: { routeIndex, value } }
);

export const setActiveWaypoint = (routeIndex, waypointIndex, value, add) => (
  { type: SET_ACTIVE_WAYPOINT, payload: { routeIndex, waypointIndex, value, add } }
);

export const beginLoading = (isLoading = true) => {
  return {
    type: BEGIN_LOADING, payload: isLoading
  };
};

export const setNewBlocksSize = (data) => (
  { type: CHANGE_BLOCKS_SIZE, payload: data }
);

export const setSizeBlocks = (param = 33, final = false) => (dispatch) => { // Функция пересчета размера элементов
  const w = window, d = document;
  if (param != w._divider) {
    param = w._divider || param;
    w._sb = w.innerWidth - d.body.clientWidth || 0;
    const $left = d.getElementById('leftSide');
    const $right = d.getElementById('rightSide');
    const padding = 20, divid = 27; //Отступы по краям, ширина кнопки раздлелителя с отступами
    const wi = w.innerWidth - padding; //ширина окна, отступ по краям
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
      w.google.maps.event.trigger(w._m.context['__SECRET_MAP_DO_NOT_USE_OR_YOU_WILL_BE_FIRED'], 'resize'); //перестроение размера окна
    } else {
      $left.style.width = lwi + '%';
      $right.style.width = rwi + '%';
    }
  }
};

export const saveComment = (fetchParams, { id, text }) => (dispatch) => {
  dispatch(beginLoading());
  return axios.get(`${BASE_URL}/index/save/`, { params: { id, comment: text } })
    .then((res) => {
      console.log('[RESPONSE][saveComment]', res.data.length ? res.data : 'null');
      dispatch(fetchRoutes(fetchParams));
    });
};

export const moveWaypoints = (fetchParams, route, ids) => (dispatch) => {
  dispatch(beginLoading());
  return axios.get(`${BASE_URL}/index/move/`, { params: { route, ids } })
    .then((res) => {
      console.log('[RESPONSE][moveWaypoints]', res.data.length ? res.data : 'null');
      dispatch(fetchRoutes(fetchParams));
    });
};