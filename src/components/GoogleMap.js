import React from 'react';
import { withGoogleMap, GoogleMap, Polyline, Marker } from "react-google-maps";


const decodeLevels = (encodedLevelsString) => {
    const decodedLevels = [];
    for (let i = 0; i < encodedLevelsString.length; ++i) {
        const level = encodedLevelsString.charCodeAt(i) - 63;
        decodedLevels.push(level);
    }
    return decodedLevels;
};

const isActiveWaypoint = (w, i) => {
  return Array.isArray(w) && w.indexOf(i) !== -1;
};

const arrowSymbol = {
  path: 'M0,-1 L0,1 L3,0 z',
  rotation: -90,
};


const renderRoutePolylines = (route, activeWaypointId) => route.waypoints.map((waypoint) => (
  <Polyline
    key={`p${waypoint.id}`}
    options={{
      strokeOpacity: 0.8,
      strokeWeight: 3,
      icons: [{
        icon: arrowSymbol,
        repeat: '100px',
        offset: '100%',
      }],
      strokeColor: isActiveWaypoint(activeWaypointId, waypoint.id) ? '#f00' : route.color,
      levels: decodeLevels('BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB')
    }}
    path={
      waypoint.geometry
        .split(',')
        .map(item => window.google.maps.geometry.encoding.decodePath(item))
        .reduce((prev, next) => [...prev, ...next], [])
    }
  />
));

export default withGoogleMap((props) => (
  <GoogleMap
    ref={props.onMapLoad}
    defaultZoom={13}
    defaultCenter={props.defaultCenter}
    options={{
      draggable: !props.lockMap,
    }}
    center={props.center}
  >
    {
      props.routes.reduce((acc, cur, rIndex) => {
        if (props.checkedRouteIds[cur.id]) {
          return [
            ...acc,
            ...cur.waypoints.map((waypoint, index) => {
              const color = isActiveWaypoint(props.activeWaypointId, waypoint.id) ? '#f00' : cur.color;
              const pos = { lat: +waypoint.lat, lng: +waypoint.lng };
              return (
                <Marker
                  key={`m${waypoint.id}`}
                  position={pos}
                  onMouseOver={() => {
                    props.handleLockMap(true);
                  }}
                  onMouseOut={() => {
                    props.handleLockMap(false);
                  }}
                  onMouseDown={() => props.onMoveWaypoint({ waypointText: waypoint.id1, waypointId: waypoint.id }) }
                  onClick={() => props.setActiveWaypoint(rIndex, index, true)}
                  icon={`https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=${index + 1}|${color.slice(1)}|000000`}
                />
              );
            }),
            ...renderRoutePolylines(cur, props.activeWaypointId)
          ];
        }
        return [...acc];
      }, [])
    }
  </GoogleMap>
));
