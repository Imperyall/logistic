import axios from 'axios';
import {
  FETCH_ROUTES_SUCCESS,
  FETCH_DELIVERY_DEPS_SUCCESS,
  FETCH_DELIVERY_ZONES_SUCCESS,
  FETCH_CARS,
  FETCH_DRIVERS,
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
import { getRandomString } from '../utils';

const logging = (fun, response) => {
  //process.env.NODE_ENV === 'development' && 
  console.log(`[RESPONSE][${fun}]`, response.data && response.data.length ? response.data : 'null');

  if (response.data && response.data.hasOwnProperty('code')) notify(response.data.code, response.data.text);
};

const notify = (type, text) => {
  switch (type.toLowerCase()) {
    case 'info':
      window.notify.info(text);
      break;
    case 'success':
      window.notify.success(text);
      break;
    case 'warning':
      window.notify.warning(text, 'Предупреждение');
      break;
    case 'error':
      window.notify.error(text, 'Ошибка');
      break;
  }
};

export const fetchRoutes = (params) => dispatch => {
  const eventId = getRandomString();
  dispatch(beginLoading({ add: eventId }));

  return axios.get(`${BASE_URL}/routes/get/`, { params })
    .then((res) => {
      logging('fetchRoutes', res);
      
      dispatch({ type: FETCH_ROUTES_SUCCESS, payload: res.data });
    }).then(() => {
      dispatch(setSizeBlocks());
    }).catch(res => {
      logging('error', res);
    }).finally(() => dispatch(beginLoading({ end: eventId })));
};

export const sortRoutes = (fetchParams, sortParams) => dispatch => {
  const eventId = getRandomString();
  dispatch(beginLoading({ add: eventId }));

  return axios.get(`${BASE_URL}/routes/sort/`, { params: sortParams })
    .then((res) => {
      logging('sortRoutes', res);
      
      dispatch(fetchRoutes(fetchParams));
    }).catch(res => {
      logging('error', res);
    }).finally(() => dispatch(beginLoading({ end: eventId })));
};

export const optimizeRoutes = (fetchParams, pk) => dispatch => {
  const eventId = getRandomString();
  dispatch(beginLoading({ add: eventId }));
  
  return axios.get(`${BASE_URL}/routes/optimize/`, { params: { pk } })
    .then((res) => {
      logging('optimizeRoutes', res);
      
      dispatch(fetchRoutes(fetchParams));
    }).catch(res => {
      logging('error', res);
    }).finally(() => dispatch(beginLoading({ end: eventId })));
};

export const optimizeAllRoutes = (fetchParams, pk, opts, bases) => dispatch => {
  const eventId = getRandomString();
  dispatch(beginLoading({ add: eventId }));

  return axios.get(`${BASE_URL}/routes/all/`, { params: { pk, opts, bases } })
    .then((res) => {
      logging('optimizeAllRoutes', res);

      dispatch(fetchRoutes(fetchParams));
    }).catch(res => {
      logging('error', res);
    }).finally(() => dispatch(beginLoading({ end: eventId })));
};

export const addRoutes = (fetchParams) => dispatch => {
  const eventId = getRandomString();
  dispatch(beginLoading({ add: eventId }));

  return axios.get(`${BASE_URL}/routes/add/`)
    .then((res) => {
      logging('addRoutes', res);
      
      dispatch(fetchRoutes(fetchParams));
    }).catch(res => {
      logging('error', res);
    }).finally(() => dispatch(beginLoading({ end: eventId })));
};

export const uploadRoutes = (fetchParams, pk) => dispatch => {
  const eventId = getRandomString();
  dispatch(beginLoading({ add: eventId }));

  return axios.get(`${BASE_URL}/routes/upload/`, { params: { pk } })
    .then((res) => {
      logging('uploadRoutes', res);
        
      dispatch(fetchRoutes(fetchParams));
    }).catch(res => {
      logging('error', res);
    }).finally(() => dispatch(beginLoading({ end: eventId })));
};

export const uploadXls = (fetchParams, pk) => dispatch => {
  const eventId = getRandomString();
  dispatch(beginLoading({ add: eventId }));

  return axios.get(`${BASE_URL}/routes/uploadXls/`, { params: { pk } })
    .then((res) => {
      logging('uploadXls', res);
      
      dispatch(fetchRoutes(fetchParams));
    }).catch(res => {
      logging('error', res);
    }).finally(() => dispatch(beginLoading({ end: eventId })));
};

export const recycleRoutes = (fetchParams, pk) => dispatch => {
  const eventId = getRandomString();
  dispatch(beginLoading({ add: eventId }));

  return axios.get(`${BASE_URL}/routes/recycle/`, { params: { pk } })
    .then((res) => {
      logging('recycleRoutes', res);
      dispatch(clearSelection(pk));
      
      dispatch(fetchRoutes(fetchParams));
    }).catch(res => {
      logging('error', res);
    }).finally(() => dispatch(beginLoading({ end: eventId })));
};

export const unrecycleRoutes = (fetchParams, pk) => dispatch => {
  const eventId = getRandomString();
  dispatch(beginLoading({ add: eventId }));

  return axios.get(`${BASE_URL}/routes/unrecycle/`, { params: { pk } })
    .then((res) => {
      logging('unrecycleRoutes', res);
      
      dispatch(fetchRoutes(fetchParams));
    }).catch(res => {
      logging('error', res);
    }).finally(() => dispatch(beginLoading({ end: eventId })));
};

export const acceptRoutes = (fetchParams, pk) => dispatch => {
  const eventId = getRandomString();
  dispatch(beginLoading({ add: eventId }));

  return axios.get(`${BASE_URL}/routes/accept/`, { params: { pk } })
    .then((res) => {
      logging('acceptRoutes', res);
      
      dispatch(fetchRoutes(fetchParams));
    }).catch(res => {
      logging('error', res);
    }).finally(() => dispatch(beginLoading({ end: eventId })));
};

export const unacceptRoutes = (fetchParams, pk) => dispatch => {
  const eventId = getRandomString();
  dispatch(beginLoading({ add: eventId }));

  return axios.get(`${BASE_URL}/routes/unaccept/`, { params: { pk } })
    .then((res) => {
      logging('unacceptRoutes', res);
      
      dispatch(fetchRoutes(fetchParams));
    }).catch(res => {
      logging('error', res);
    }).finally(() => dispatch(beginLoading({ end: eventId })));
};

export const reloadRoutes = (fetchParams, pk) => dispatch => {
  const eventId = getRandomString();
  dispatch(beginLoading({ add: eventId }));

  return axios.get(`${BASE_URL}/routes/reload/`, { params: { pk } })
    .then((res) => {
      logging('reloadRoutes', res);
      
      dispatch(fetchRoutes(fetchParams));
    }).catch(res => {
      logging('error', res);
    }).finally(() => dispatch(beginLoading({ end: eventId })));
};

export const newRoutes = (fetchParams) => dispatch => {
  const eventId = getRandomString();
  dispatch(beginLoading({ add: eventId }));

  return axios.get(`${BASE_URL}/routes/new/`)
    .then((res) => {
      logging('newRoutes', res);
      
      dispatch(fetchRoutes(fetchParams));
    }).catch(res => {
      logging('error', res);
    }).finally(() => dispatch(beginLoading({ end: eventId })));
};

export const fetchDeliveryDeps = (params) => dispatch => {
  const eventId = getRandomString();
  dispatch(beginLoading({ add: eventId }));

  return axios.get(`${BASE_URL}/deliverydeps/get/`, { params })
    .then((res) => {
      logging('fetchDeliveryDeps', res);
      
      dispatch({ type: FETCH_DELIVERY_DEPS_SUCCESS, payload: res.data });
    }).catch(res => {
      logging('error', res);
    }).finally(() => dispatch(beginLoading({ end: eventId })));
};

export const fetchCars = ({ delivery_dep, date_to, date_from }) => dispatch => {
  const eventId = getRandomString();
  dispatch(beginLoading({ add: eventId }));

  return axios.get(`${BASE_URL}/mon/cars/`, { params: { format: 'json', delivery_dep, date_to, date_from } })
    .then((res) => {
      logging('fetchCars', res);
      
      dispatch({ type: FETCH_CARS, payload: res.data });
    }).catch(res => {
      logging('error', res);
    }).finally(() => dispatch(beginLoading({ end: eventId })));
};

export const fetchDrivers = () => dispatch => {
  const eventId = getRandomString();
  dispatch(beginLoading({ add: eventId }));

  return axios.get(`${BASE_URL}/driver/`, { params: { format: 'json' } })
    .then((res) => {
      logging('fetchDrivers', res);
      
      dispatch({ type: FETCH_DRIVERS, payload: res.data });
    }).catch(res => {
      logging('error', res);
    }).finally(() => dispatch(beginLoading({ end: eventId })));
};

export const fetchDeliveryZones = params => dispatch => {
  const eventId = getRandomString();
  dispatch(beginLoading({ add: eventId }));

  if (!params.length) {
    dispatch(beginLoading({ end: eventId }));

    return dispatch({ type: FETCH_DELIVERY_ZONES_SUCCESS, payload: [] });
  } else {
    return axios.get(`${BASE_URL}/deliveryzones/get/`, { params: { delivery_deps_list: params } })
      .then((res) => {
        logging('fetchDeliveryZones', res);
        
        dispatch({ type: FETCH_DELIVERY_ZONES_SUCCESS, payload: res.data });
      }).catch(res => {
        logging('error', res);
    }).finally(() => dispatch(beginLoading({ end: eventId })));
  }
};

export const routeEdit = ({ fetchParams, deliveryDeps, pk, car, driver, plannedTimeS }) => dispatch => {
  const eventId = getRandomString();
  dispatch(beginLoading({ add: eventId }));

  return axios.get(`${BASE_URL}/routes/edit/`, { params: { deliveryDeps, pk, car, driver, plannedTimeS } })
    .then((res) => {
      logging('routeEdit', res);
      
      dispatch(fetchRoutes(fetchParams));
    }).catch(res => {
      logging('error', res);
    }).finally(() => dispatch(beginLoading({ end: eventId })));
};

export const moveWaypoint = (newStateRoutes) => dispatch => {
  dispatch({
    type: MOVE_WAYPOINT, 
    payload: newStateRoutes
  });
};

export const toggleOpenRoute = (routeIndex) => dispatch => {
  dispatch({
    type: TOGGLE_OPEN_ROUTE,
    payload: routeIndex
  });
};

export const setCheckedRoute = (routeIndex, value, shift) => dispatch => {
  dispatch({
    type: SET_CHECKED_ROUTE, 
    payload: { routeIndex, value, shift }
  });
};

export const setActiveRoute = (routeIndex, value) => dispatch => {
  dispatch({
    type: SET_ACTIVE_ROUTE, 
    payload: { routeIndex, value }
  });
};

export const setActiveWaypoint = (routeIndex, waypointIndex, value, add) => dispatch => {
  dispatch({
    type: SET_ACTIVE_WAYPOINT,
    payload: { routeIndex, waypointIndex, value, add }
  });
};

export const beginLoading = (isLoading = true) => dispatch => {
  dispatch({
    type: BEGIN_LOADING, 
    payload: isLoading
  });
};

export const setNewBlocksSize = (data) => dispatch => {
  dispatch({
    type: CHANGE_BLOCKS_SIZE,
    payload: data
  });
};

export const clearSelection = (data) => dispatch => {
  dispatch({
    type: CLEAR_SELECTION,
    payload: data
  });
};

export const setSizeBlocks = (di = 33, final = false) => dispatch => { // Функция пересчета размера элементов
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

export const saveComment = (fetchParams, { id, comment }) => dispatch => {
  const eventId = getRandomString();
  dispatch(beginLoading({ add: eventId }));

  return axios.get(`${BASE_URL}/index/save/`, { params: { id, comment } })
    .then((res) => {
      logging('saveComment', res);

      dispatch(fetchRoutes(fetchParams));
    }).catch(res => {
      logging('error', res);
    }).finally(() => dispatch(beginLoading({ end: eventId })));
};

export const moveWaypoints = (fetchParams, route, ids) => dispatch => {
  const eventId = getRandomString();
  dispatch(beginLoading({ add: eventId }));

  return axios.get(`${BASE_URL}/index/move/`, { params: { route, ids } })
    .then((res) => {
      logging('moveWaypoints', res);

      dispatch(fetchRoutes(fetchParams));
    }).catch(res => {
      logging('error', res);
    }).finally(() => dispatch(beginLoading({ end: eventId })));
};

export const handleShowWindow = (state) => dispatch => {
  dispatch({
    type: HANDLE_VISIBLE,
    payload: state
  });
};

export const handleWindowRoute = ({ r_id, r_text }) => dispatch => {
  dispatch({
    type: HANDLE_WINDOW_ROUTE,
    payload: { r_id, r_text }
  });
};

export const handleWindowPoint = ({ w_id, w_text }) => dispatch => {
  dispatch({
    type: HANDLE_WINDOW_POINT,
    payload: { w_id, w_text }
  });
};

export const upload1C = (fetchParams, { deliveryDeps, deliveryZones, options }) => dispatch => {
  const eventId = getRandomString();
  dispatch(beginLoading({ add: eventId }));

  return axios.get(`${BASE_URL}/routes/copy_loaded/`, { params: { deliveryDeps, deliveryZones, options } })
    .then((res) => {
      logging('copy_loaded', res);

      dispatch(fetchRoutes(fetchParams));
    }).catch(res => {
      logging('error', res);
    }).finally(() => dispatch(beginLoading({ end: eventId })));
};