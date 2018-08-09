import {
	FETCH_ROUTES_SUCCESS,
	TOGGLE_OPEN_ROUTE,
	SET_ACTIVE_ROUTE,
	SET_CHECKED_ROUTE,
	MOVE_WAYPOINT,
	SET_ACTIVE_WAYPOINT,
  CLEAR_SELECTION,
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
  markers: [],
  duplicate: {},
  center: { lat: 45.0392651, lng: 39.0817043 },
};

const getRouteBounds = route => {
  const bounds = new window.google.maps.LatLngBounds();
  if (route.index.length) {
    const points = route.index.map(index => (
      index.geometry 
      ? index.geometry.split(',').map(item => window.google.maps.geometry.encoding.decodePath(item)).reduce((prev, next) => [...prev, ...next])
      : [new window.google.maps.LatLng(index.doc.waypoint.lat, index.doc.waypoint.lng)]
    )).reduce((prev, next) => [...prev, ...next]);

    points.forEach(point => bounds.extend(point));
  }

  return bounds;
};

const getRandomString = () => Math.random().toString(36).substring(7);

export default function points(state = DEFAULT_STATE, action) {
	switch (action.type) {
		case FETCH_ROUTES_SUCCESS: {
      let waypoints = {};
      let duplicate = {};

      const routes = action.payload.map((item, index) => {
        let [count, weightAll, volumeAll, sku, pallet, serviceTimeAll] = [ [], 0, 0, 0, 0, 0 ];
        let indexes = [];

        for (let i in item.index) {
          const doc = item.index[i].doc, current = item.index[i];
          const waypoint = (doc && 'waypoint' in doc) ? doc.waypoint : false;

          const position = { lat: waypoint ? +waypoint.lat : 0, lng: waypoint ? +waypoint.lng : 0 };

          if (!item.collection && !item.bin && waypoint) {
            for (let w in waypoints) {
              if (w != item.id && waypoints[w].includes(waypoint.pk)) {
                if (!Array.isArray(duplicate[item.id])) duplicate[item.id] = [];
                if (!Array.isArray(duplicate[w])) duplicate[w] = [];
                if (!duplicate[w].includes(waypoint.pk)) duplicate[w].push(waypoint.pk);
                if (!duplicate[item.id].includes(waypoint.pk)) duplicate[item.id].push(waypoint.pk);
              }
            }

            if (!Array.isArray(waypoints[item.id])) waypoints[item.id] = [];
            waypoints[item.id].push(waypoint.pk);
          }

          let single = true;
          if (!indexes.find(ind => ind.lat == position.lat && ind.lng == position.lng)) indexes.push(position); else single = false;

          count = waypoint && count.indexOf(waypoint.pk) === -1 ? [ ...count, waypoint.pk ] : count;
          serviceTimeAll += +current.service_time;
          item.index[i] = { ...current, title: single ? (+i + 1).toString() : '', single };
          if (doc) {
            weightAll += +doc.weight;
            volumeAll += +doc.volume;
            sku += +doc.sku;
            pallet += +doc.pallet;
          }
        }

        return {
          ...item, 
          countRNK: item.index.length,
          count: count.length,//: item.index.reduce((acc, cur) => acc.indexOf(cur.doc.waypoint.pk) === -1 ? [ ...acc, cur.doc.waypoint.pk ] : acc, []).length,
          weightAll,//: item.index.reduce((acc, cur) => (acc + +cur.doc.weight), 0).toFixed(),
          volumeAll,//: item.index.reduce((acc, cur) => (acc + +cur.doc.volume), 0).toFixed(3),
          sku,
          pallet,
          serviceTimeAll,
          color: getRouteColor(index)
        };
      });

      return { ...state, routes, duplicate };
    }

    case TOGGLE_OPEN_ROUTE: {
      const { routeIndex, mapSelect } = action.payload;
      if (state.openRouteIds[routeIndex] && mapSelect) return state;

      return {
        ...state,
        openRouteIds: 
          mapSelect 
          ? { [routeIndex]: true } 
          : { ...state.openRouteIds, [routeIndex]: !state.openRouteIds[routeIndex] }
      };
    }

    case CLEAR_SELECTION: {
      let checked = state.checkedRouteIds;

      for (let i in checked) {
        if (action.payload.indexOf(i) !== -1) checked[i] = false;
      }

      return {
        ...state,
        checkedRouteIds: checked,
        bounds: null,
      };
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
				};
    }

    case SET_CHECKED_ROUTE: {
      let newState = state, 
					shi = false, 
					markers = state.markers;
      const { routeIndex, value, shift } = action.payload;
      const route = state.routes[routeIndex],
            waypoints = route.index,
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
            };
          } else {
            let routes = state.routes, next;

            if (routes.length) routes.forEach((item, index) => {
              if (item.id == checks[0]) next = index;
            });

            let first = Math.min(next, routeIndex),
                sec = Math.max(next, routeIndex);

            for (let i = first; i <= sec; i++) {
              newState = {
								...newState,
								checkedRouteIds: { 
									...newState.checkedRouteIds, 
									[state.routes[i].id]: true,
								}
              };

              let wa = state.routes[i].index;

              for (let key in wa) {
                if (!markers[i]) markers[i] = new Array();
                markers[i].push({ lat: +wa[key].doc.waypoint.lat, lng: +wa[key].doc.waypoint.lng });
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
            markers[routeIndex].push({ lat: +key.doc.waypoint.lat, lng: +key.doc.waypoint.lng });
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
      };

      return shi 
				? newState 
				: {
						...newState,
						checkedRouteIds: { ...newState.checkedRouteIds, [id]: value },
					};
    }

    case MOVE_WAYPOINT: {
			return {
				...state,
				routes: action.payload,
			};
		}

		case SET_ACTIVE_WAYPOINT: {
			let newState = state;
			const { routeIndex, waypointIndex, add } = action.payload;
			const waypoint = state.routes[routeIndex].index[waypointIndex];

			let array = state.activeWaypointId ?  state.activeWaypointId : [], 
					id = waypoint.id,
					ind = array.indexOf(id);

			if (add) {
				ind !== -1 ? (array.length == 1 ? array = null : array.splice(ind, 1)) : array.push(id);
			} else {
				ind === -1 ? array = [id] : array = null;
			}

			//if (value) {
			newState = { ...newState, center: { lat: +waypoint.doc.waypoint.lat, lng: +waypoint.doc.waypoint.lng } };
			//}

			return {
				...newState,
				activeWaypointId: array,
				activeRouteId: null,
			};
		}

    default: {
      return state;
    }
	}
}