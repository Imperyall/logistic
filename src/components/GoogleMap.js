import React from 'react';
import { withGoogleMap, GoogleMap, Polyline, Marker } from "react-google-maps";
import MarkerClusterer from "react-google-maps/lib/addons/MarkerClusterer";
import { EventUtil, generateIcon } from '../utils';

const decodeLevels = encodedLevelsString => {
    const decodedLevels = [];
    for (let i = 0; i < encodedLevelsString.length; ++i) {
        const level = encodedLevelsString.charCodeAt(i) - 63;
        decodedLevels.push(level);
    }
    return decodedLevels;
};

const isActiveWaypoint = (w, i) => Array.isArray(w) && w.indexOf(i) !== -1;
const arrowSymbol = { path: 'M0,-1 L0,1 L3,0 z', rotation: -90 };

const maxZoom = 17;

const renderRoutePolylines = (route, activeWaypointId) => route.index.map(waypoint => (
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
        .reduce((prev, next) => [...prev, ...next])
    }
  />
));

export default withGoogleMap(props => (
  <GoogleMap
    ref={props.onMapLoad}
    defaultZoom={props.zoom || maxZoom}
    onZoomChanged={() => props.changeZoom && props.changeZoom()}
    defaultCenter={props.defaultCenter}
    options={{
      draggable: !props.lockMap,
    }}
    center={props.center}
  >
    <MarkerClusterer
      // onClick={() => props.handleLockMap(false)}
      averageCenter
      enableRetinaIcons
      maxZoom={maxZoom}
      gridSize={60}
    >
      {[
        props.routes && props.routes.reduce((acc, cur, rIndex) => {
          if (props.checkedRouteIds[cur.id]) {
            return [
              ...acc,
              ...cur.index.map((waypoint, index) => {
                const color = isActiveWaypoint(props.activeWaypointId, waypoint.id) ? '#f00' : cur.color;
                const pos = { lat: +waypoint.doc.waypoint.lat, lng: +waypoint.doc.waypoint.lng };

                return (
                  <Marker
                    key={`m${waypoint.id}`}
                    position={pos}
                    onMouseDown={() => new EventUtil({ type: 'GOOGLEMAP', app: props.app, param: { w_text: waypoint.doc.id1, w_id: waypoint.id } })}
                    onClick={() => props.setActiveWaypoint({ routeIndex: rIndex, waypointIndex: index, scroll: cur.id })}
                    label={waypoint.title}
                    icon={generateIcon(color)}
                  />
                );
              }),
              ...renderRoutePolylines(cur, props.activeWaypointId)
            ];
          }
          return [...acc];
        }, []),
        props.markers && props.markers.map(waypoint => {
          return (
            <Marker
              key={`m${waypoint.id}`}
              position={{ lat: +waypoint.lat, lng: +waypoint.lng }}
              draggable={true}
              onDragEnd={props.dragEnd}
              icon={`https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=1|f00|000000`}
            />
          );
        })
      ]}
    </MarkerClusterer>
  </GoogleMap>
));
