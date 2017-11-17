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
} from '../constants/actionTypes';
import BASE_URL from '../constants/baseURL';


export const fetchRoutes = (params) => (dispatch) => {
  return axios.get(`${BASE_URL}/routes/get/`, { params })
    .then((res) => {
      dispatch({ type: FETCH_ROUTES_SUCCESS, payload: res.data });
    });
};

export const sortRoutes = (fetchParams, sortParams) => (dispatch) => {
  return axios.get(`${BASE_URL}/routes/sort/`, { params: sortParams })
    .then(() => {
      dispatch(fetchRoutes(fetchParams));
    });
};

export const optimizeRoutes = (fetchParams, pk, useDistance) => (dispatch) => {
  return axios.get(`${BASE_URL}/routes/optimize/`, { params: { pk, useDistance } })
    .then(() => {
      dispatch(fetchRoutes(fetchParams));
    });
};

export const optimizeAllRoutes = (fetchParams, pk, opts, useDistance, bases) => (dispatch) => {
  return axios.get(`${BASE_URL}/routes/all/`, { params: { pk, opts, useDistance, bases } })
    .then(() => {
      dispatch(fetchRoutes(fetchParams));
    });
};

export const addRoutes = (fetchParams) => (dispatch) => {
  return axios.get(`${BASE_URL}/routes/add/`)
    .then(() => {
      dispatch(fetchRoutes(fetchParams));
    });
};

export const uploadRoutes = (fetchParams, pk) => (dispatch) => {
  return axios.get(`${BASE_URL}/routes/upload/`, { params: { pk } })
    .then(() => {
      dispatch(fetchRoutes(fetchParams));
    });
};

export const uploadXls = (fetchParams, pk) => (dispatch) => {
  return axios.get(`${BASE_URL}/routes/uploadXls/`, { params: { pk } })
    .then(() => {
      dispatch(fetchRoutes(fetchParams));
    });
};

export const recycleRoutes = (fetchParams, pk) => (dispatch) => {
  return axios.get(`${BASE_URL}/routes/recycle/`, { params: { pk } })
    .then(() => {
      dispatch(fetchRoutes(fetchParams));
    });
};

export const unrecycleRoutes = (fetchParams, pk) => (dispatch) => {
  return axios.get(`${BASE_URL}/routes/unrecycle/`, { params: { pk } })
    .then(() => {
      dispatch(fetchRoutes(fetchParams));
    });
};

export const acceptRoutes = (fetchParams, pk) => (dispatch) => {
  return axios.get(`${BASE_URL}/routes/accept/`, { params: { pk } })
    .then(() => {
      dispatch(fetchRoutes(fetchParams));
    });
};

export const reloadRoutes = (fetchParams, pk) => (dispatch) => {
  return axios.get(`${BASE_URL}/routes/reload/`, { params: { pk } })
    .then(() => {
      dispatch(fetchRoutes(fetchParams));
    });
};

export const newRoutes = (fetchParams) => (dispatch) => {
  return axios.get(`${BASE_URL}/routes/new/`)
    .then(() => {
      dispatch(fetchRoutes(fetchParams));
    });
};

export const fetchDeliveryDeps = (params) => (dispatch) => {
  return axios.get(`${BASE_URL}/deliverydeps/get/`, { params })
    .then((res) => {
      dispatch({ type: FETCH_DELIVERY_DEPS_SUCCESS, payload: res.data });
    });
};

export const changeDeps = (fetchParams,deliveryDeps, pk) => (dispatch) => {
  return axios.get(`${BASE_URL}/routes/changedeps/`, { params: { deliveryDeps, pk } })
    .then(() => {
      dispatch(fetchRoutes(fetchParams));
    });
};


export const moveWaypoint = (newStateRoutes) => (
  { type: MOVE_WAYPOINT, payload: newStateRoutes }
);

export const toggleOpenRoute = (routeIndex) => (
  { type: TOGGLE_OPEN_ROUTE, payload: routeIndex }
);

export const setCheckedRoute = (routeIndex, value) => (
  { type: SET_CHECKED_ROUTE, payload: { routeIndex, value } }
);

export const setActiveRoute = (routeIndex, value) => (
  { type: SET_ACTIVE_ROUTE, payload: { routeIndex, value } }
);

export const setActiveWaypoint = (routeIndex, waypointIndex, value) => (
  { type: SET_ACTIVE_WAYPOINT, payload: { routeIndex, waypointIndex, value } }
);

export const beginLoading = (isLoading) => {
  return {
    type: BEGIN_LOADING, payload: isLoading
  };
};

