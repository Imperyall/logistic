import { fromJS, Map, List } from 'immutable';
import { getRouteColor } from '../utils';

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
  SAVE_COMMENT,
} from '../constants/actionTypes';

const initialState = fromJS({
  routes: List(),
  route: Map(),
  deliveryDeps: List(),
  openRouteIds: Map(),
  checkedRouteIds: Map(),
  activeRouteId: null,
  activeWaypointId: null,
  bounds: null,
  isLoading: false,
  center: Map({ lat: 45.0392651, lng: 39.0817043 }),
  windowSize: {},
  modalData: {},
});


const getRandomString = () => Math.random().toString(36).substring(7);


const getRouteBounds = (route) => {
  const bounds = new window.google.maps.LatLngBounds();

  const points = route.get('waypoints').map((waypoint) => (
    waypoint.get('geometry')
      .split(',')
      .map(item => window.google.maps.geometry.encoding.decodePath(item))
      .reduce((prev, next) => [...prev, ...next], [])
  )).reduce((prev, next) => [...prev, ...next], []);

  points.forEach((point) => bounds.extend(point.toJSON()));

  return bounds;
};


// IMPORTANT: Note that with Redux, state should NEVER be changed.
// State is considered immutable. Instead,
// create a copy of the state passed and set new values on the copy.
// Note that I'm using immutable.js to create a copy of current state
// and update values on the copy.
export default function rootReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_ROUTES_SUCCESS:
      return state.set(
        'routes',
        fromJS(action.payload.map((item, index) => ({ ...item, color: getRouteColor(index) })))
      ).set('isLoading', false);
    case FETCH_DELIVERY_DEPS_SUCCESS:
      return state.set('deliveryDeps', fromJS(action.payload));
    case MOVE_WAYPOINT:
      return state.set('routes', fromJS(action.payload));
    case TOGGLE_OPEN_ROUTE:
      return state.setIn(
        ['openRouteIds', action.payload],
        !state.get('openRouteIds').get(action.payload)
      );
    case SET_CHECKED_ROUTE:
      return (() => {
        let newState = state;
        const { routeIndex, value } = action.payload;
        const route = state.get('routes').get(routeIndex);
        newState = newState.set(
          'bounds',
          value ?
            fromJS({ ...getRouteBounds(route).toJSON(), hash: getRandomString() }) :
            null
        );
        return newState.setIn(['checkedRouteIds', route.get('id')], value);
      })();
    case SET_ACTIVE_ROUTE:
      return (() => {
        let newState = state;
        const { routeIndex, value } = action.payload;
        const route = state.get('routes').get(routeIndex);

        return newState
          .set(
            'bounds',
            value ?
              fromJS({ ...getRouteBounds(route).toJSON(), hash: getRandomString() }) :
              null
          )
          .set('activeRouteId', value ? state.get('routes').get(routeIndex).get('id') : null)
          .set('activeWaypointId', null);
      })();
    case SET_ACTIVE_WAYPOINT:
      return (() => {
        let newState = state;
        const { routeIndex, waypointIndex, add } = action.payload;
        const waypoint = state.get('routes').get(routeIndex).get('waypoints').get(waypointIndex);

        let array = state.get('activeWaypointId') ? state.get('activeWaypointId') : [], 
            id = waypoint.get('id'),
            ind = array.indexOf(id);

        if (add) {
          ind !== -1 ? (array.length == 1 ? array = null : array.splice(ind, 1)) : array.push(id);
        } else {
          ind === -1 ? array = [id] : array = null;
        }

        //if (value) {
          const center = Map({ lat: +waypoint.get('lat'), lng: +waypoint.get('lng')});
          newState = newState.set('center', center);
        //}

        return newState
          .set('activeWaypointId', array)
          .set('activeRouteId', null);
        })();
    case BEGIN_LOADING:
      return state.set('isLoading', action.payload);
    case CHANGE_BLOCKS_SIZE:
      return state.set('windowSize', action.payload);
    case SAVE_COMMENT:
      return state.set('modalData', action.payload);
    default:
      return state;
  }
}
