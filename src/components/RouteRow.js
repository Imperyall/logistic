import React from 'react';
import { Table, Checkbox, Icon } from 'semantic-ui-react';
import { DropTarget } from 'react-dnd';
import * as dragTypes from '../constants/dragTypes';
import { pprintSeconds } from '../utils';


const routeTarget = {
  canDrop() {
    return false;
  },
  hover(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const { routeIndex } = props;

    // Don't replace items with themselves
    if (dragIndex.routeIndex === routeIndex) {
      return;
    }

    // Time to actually perform the action
    // props.endMoveWaypoint(dragIndex, { routeIndex, waypointIndex: 0 });

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = { routeIndex, waypointIndex: 0 };
  },
};


const collect = connect => ({
  connectDropTarget: connect.dropTarget(),
});

const RouteRow = (props) => {
  const Th = (ownProps) => (
    <Table.HeaderCell
      {...ownProps}
      style={{borderTop: `.1em solid #e0e0e0`, }}
    />
  );

  const {
    route,
    routeIndex,
    onToggleOpen,
    onCheckboxChange,
    onClick,
    active,
    checked,
    connectDropTarget,
    rowTitle,
  } = props;

  const style={
    backgroundColor: active ? '#E0E0E0' : route.collection ? '#E0EDEF': route.bin ? "#EFE0E0" : '#EFEFFF',
    cursor: "pointer",
    userSelect: "none",
  };
// backgroundColor: route.collection ? '#F0FDFF':'#ffffff'

  return connectDropTarget(
    <tr key={routeIndex} 
        onClick={onClick}
        onMouseEnter={() => { if (props.ifMoveWaypoint) props.handleWindowRoute({ r_text: rowTitle + (route.id1 === null ? "" : route.id1), r_id: route.id }); }} 
        onMouseLeave={() => { if (props.ifMoveWaypoint) props.handleWindowRoute({ r_text: null, r_id: 0 }); }}
        style={style}>
      <Th collapsing>
        <Checkbox
          onClick={(e) => e.stopPropagation()}
          onChange={onCheckboxChange}
          checked={checked}
        />
      </Th>
      <Th>
        {route.autocreated && <Icon name="desktop" color="blue" />}
        <span/>{route.recycled && <Icon name="remove circle" color="red" />}
        <span/>{route.accepted && <Icon name="check circle" color="green" />}
        <small>
          {rowTitle}
          {/*{route.collectionRem && "Непопавшие РНК "}*/}
          {route.id1} <br/> {!route.bin && <small>{route.createdDate}</small>}
        </small>
      </Th>
      <Th><small>{!route.bin && <span>{route.car && route.car} {route.car && route.car_brand}</span>} {route.car_virtual && "виртуальный"}</small></Th>
      <Th>{!route.bin && <small> База: {route.deliveryDeps} </small>}<br/></Th>
      <Th>{!route.bin && <small> Логист: {route.author} </small>}</Th>
      <Th>{!route.bin && <small> Вид оптимизации: <br/> {route.optimizeType} </small>}</Th>
      <Th><small>РНК: {route.countRNK} ТТ: {route.count}</small></Th>
      <Th><small>SKU: {route.sku}</small></Th>
      <Th><small>Масса {(+route.weightAll).toFixed()} кг {(route.car||route.car_virtual) && ((route.weightAll * 100) / route.car_weight).toFixed()+"%"}</small></Th>
      <Th><small>Объем {route.volumeAll} м3 {(route.car||route.car_virtual) && ((route.volumeAll * 100) / route.car_volume).toFixed()+"%"}</small></Th>
      <Th><small>Паллет {(+route.pallet).toFixed(2)} шт.</small></Th>
      <Th><small>Километраж {(route.distance / 1000).toFixed()} км</small></Th>
      <Th><small>Время в ТТ: {pprintSeconds(+route.serviceTimeAll)}</small></Th>
      <Th><small>Общее время: {pprintSeconds(+route.duration)} ({route.plannedTimeS} - {route.plannedTimeE})</small></Th>
      <Th textAlign="center" collapsing>
        <Icon
          name="list"
          style={{ cursor: 'pointer', color:`${route.color}` }}
          onClick={onToggleOpen}
        />
      </Th>
    </tr>
  );
};


export default DropTarget(dragTypes.WAYPOINT, routeTarget, collect)(RouteRow);
