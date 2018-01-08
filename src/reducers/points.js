import {
	FETCH_ROUTES_SUCCESS,
	TOGGLE_OPEN_ROUTE,
	SET_ACTIVE_ROUTE,
	SET_CHECKED_ROUTE,
	MOVE_WAYPOINT,
	SET_ACTIVE_WAYPOINT,
} from '../constants/actionTypes';
import { getRouteColor } from '../utils';
// import { fromJS, Map, List } from 'immutable';

const DEFAULT_STATE = {
	routes: [],
  route: {},
  openRouteIds: {},
  checkedRouteIds: {},
  activeRouteId: null,
  activeWaypointId: null,
  bounds: null,
  markers: {},
  center: { lat: 45.0392651, lng: 39.0817043 },
};

const getRouteBounds = (route) => {
  const bounds = new window.google.maps.LatLngBounds();
  if (route.waypoints.length) {
    const points = route.waypoints.map((waypoint) => (
      waypoint.geometry.split(',').map(item => window.google.maps.geometry.encoding.decodePath(item)).reduce((prev, next) => [...prev, ...next])
    )).reduce((prev, next) => [...prev, ...next]);

    points.forEach((point) => bounds.extend(point));
  }
  return bounds;
};

const getRandomString = () => Math.random().toString(36).substring(7);

export default function points(state = DEFAULT_STATE, action) {
	switch (action.type) {
		case FETCH_ROUTES_SUCCESS: {
      return {
				...state,
				routes: action.payload.map((item, index) => ({ ...item, color: getRouteColor(index) })),
      }
    }

    case TOGGLE_OPEN_ROUTE: {
      return {
				...state,
				openRouteIds: { 
					...state.openRouteIds,
					[action.payload]: !state.openRouteIds[action.payload],
				}
      }
    }

    case SET_ACTIVE_ROUTE: {
        const { routeIndex, value } = action.payload;

        return {
					...state,
					bounds: value 
						? { ...getRouteBounds(state.routes[routeIndex]).toJSON(), hash: getRandomString(), }
						: null,
					activeRouteId: value ? state.routes[routeIndex].id : null,
					activeWaypointId: null,
				}
    }

    case SET_CHECKED_ROUTE: {
      let newState = state, 
					shi = false, 
					markers = state.markers;
      const { routeIndex, value, shift } = action.payload;
      const route = state.routes[routeIndex],
            waypoints = route.waypoints,
            id = route.id;

      if (shift) {
        let array = state.checkedRouteIds,
            checks = [], count = 0;

        for (let key in array) {
          if (array[key]) {
            count++;
            checks.push(key);
          }
        }

        if (count === 1) {
          if (id === parseInt(checks[0])) {
            delete markers[routeIndex];

            newState = {
							...newState,
							checkedRouteIds: { ...newState.checkedRouteIds, id: false },
							markers: markers,
            }
          } else {
            let routes = state.routes, next;

            if (routes.length) routes.forEach((item, index) => {
              if (item.id == checks[0]) next = index;
            })

            let first = Math.min(next, routeIndex),
                sec = Math.max(next, routeIndex);

            for (let i = first; i <= sec; i++) {
              newState = {
								...newState,
								checkedRouteIds: { 
									...newState.checkedRouteIds, 
									[state.routes[i].id]: true,
								}
              }

              let wa = state.routes[i].waypoints;

              for (let key in wa) {
                if (!markers[i]) markers[i] = new Array();
                markers[i].push({ lat: +wa[key].lat, lng: +wa[key].lng });
              }
            }

            shi = true;
          }
        }
      }

      if (!shi) {
        if (value) {
          for (let key of waypoints) {
            if (!markers[routeIndex]) markers[routeIndex] = new Array();
            markers[routeIndex].push({ lat: +key.lat, lng: +key.lng });
          }
        } else {
          delete markers[routeIndex];
        }
      }

      newState = {
				...newState,
				bounds: value 
					? { ...getRouteBounds(route).toJSON(), hash: getRandomString() }
					: null,
				markers: markers,
      }

      return shi 
				? newState 
				: {
						...newState,
						checkedRouteIds: { ...newState.checkedRouteIds, [id]: value },
					}
    }

    case MOVE_WAYPOINT: {
			return {
				...state,
				routes: action.payload,
			}
		}

		case SET_ACTIVE_WAYPOINT: {
			let newState = state;
			const { routeIndex, waypointIndex, add } = action.payload;
			const waypoint = state.routes[routeIndex].waypoints[waypointIndex];

			let array = state.activeWaypointId ?  state.activeWaypointId : [], 
					id = waypoint.id,
					ind = array.indexOf(id);

			if (add) {
				ind !== -1 ? (array.length == 1 ? array = null : array.splice(ind, 1)) : array.push(id);
			} else {
				ind === -1 ? array = [id] : array = null;
			}

			//if (value) {
			const center = { lat: +waypoint.lat, lng: +waypoint.lng };
						newState = {
							...newState,
							center: center,
						}
			//}

			return {
				...newState,
				activeWaypointId: array,
				activeRouteId: null,
			}
		}

    default: {
      return state;
    }
	}
}