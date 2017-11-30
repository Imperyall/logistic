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
      strokeColor: activeWaypointId !== waypoint.id ? route.color : '#f00',
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
    center={props.center}
  >
    {
      props.routes.reduce((acc, cur, rIndex) => {
        if (props.checkedRouteIds[cur.id]) {
          return [
            ...acc,
            ...cur.waypoints.map((waypoint, index) => {
              const color = props.activeWaypointId !== waypoint.id ? cur.color : '#f00';
              return (
                <Marker
                  key={`m${waypoint.id}`}
                  position={{ lat: +waypoint.lat, lng: +waypoint.lng }}
                  onClick={(e) => props.setActiveWaypoint(rIndex, index, true)}
                  icon={`https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=${index + 1}|${color.slice(1)}|000000`}
                />
             );}),
            ...renderRoutePolylines(cur, props.activeWaypointId)
          ];
        }
        return [...acc];
      }, [])
    }
  </GoogleMap>
));
