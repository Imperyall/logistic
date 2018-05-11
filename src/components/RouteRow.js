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

const RouteRow = props => {
  const Th = ownProps => (
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
    ifOpen,
    state,
  } = props;

  const titleText = {
    num: "Сортировать по порядку",
    id1: "Сортировать по маршруту",
    title: "Сортировать по заголовку",
    address: "Сортировать по адресу",
    sku: "Сортировать по SKU",
    weight: "Сортировать по массе",
    volumeAll: "Сортировать по объему",
    pallet: "Сортировать по паллетам",
    distance: "Сортировать по дистанции",
  };

  const style = {
    backgroundColor: active ? '#e8e8e8' : route.collection ? '#E0EDEF': route.bin ? "#EFE0E0" : '#EFEFFF',
    cursor: "pointer",
    userSelect: "none",
  };

  

  const getFilterClass = (th) => {
    if (!ifOpen) return null;

    const { openSort, thSort, order } = state;
    const filterCss = "th-filterable";
    const sortCss = openSort && th === thSort ? ( order == "-1" ? " asc" : " desc" ) : "";

    return filterCss + sortCss;
  };

// backgroundColor: route.collection ? '#F0FDFF':'#ffffff'

  return connectDropTarget(
    <tr key={routeIndex} 
        onClick={onClick}
        onMouseEnter={() => { if (props.ifMoveWaypoint) props.handleWindowRoute({ r_text: rowTitle + (route.id1 === null ? "" : route.id1), r_id: route.id }); }} 
        onMouseLeave={() => { if (props.ifMoveWaypoint) props.handleWindowRoute({ r_text: null, r_id: 0 }); }}
        style={style}>
      <Th collapsing
        className={getFilterClass('num')}
        onClick={(e) => ifOpen && props.clickFilter(route.id, 'num', e)}
        title={ifOpen && titleText.num}>
        <Checkbox
          onClick={(e) => e.stopPropagation()}
          onChange={onCheckboxChange}
          checked={checked}
        />
      </Th>
      <Th className={getFilterClass('id1')}
          onClick={(e) => ifOpen && props.clickFilter(route.id, 'id1', e)}
          title={ifOpen && titleText.id1}>
        {route.autocreated && <span><Icon name="desktop" color="blue" /></span>}
        {route.recycled && <span><Icon name="remove circle" color="red" /></span>}
        {route.accepted && <span><Icon name="check circle" color="yellow" /></span>}
        {route.accepted_tabs && <span><Icon name="check circle" color="green" /></span>}
        <small>
          {rowTitle}
          {/*{route.collectionRem && "Непопавшие РНК "}*/}
          {route.id1} <br/> {!route.bin && <small>{route.createdDate}</small>}
        </small>
      </Th>
      <Th className={getFilterClass('title')}
          onClick={(e) => ifOpen && props.clickFilter(route.id, 'title', e)}
          title={ifOpen && titleText.title}>
        <small style={{ display: 'grid' }}>
          {!route.bin && <span className="nowr">{route.car}</span>}
          {!route.bin && <span className="nowr">{route.car && route.car_brand}</span>}
          {!route.bin && <span className="nowr">{route.car_driver}</span>} 
          {route.car_virtual && <span>виртуальный</span>}
        </small>
      </Th>
      <Th>{!route.bin && <small> База: {route.deliveryDeps} </small>}<br/></Th>
      <Th>{!route.bin && <small> Логист: {route.author} </small>}</Th>
      <Th>{!route.bin && <small> Вид оптимизации: <br/> {route.optimizeType} </small>}</Th>
      <Th className={getFilterClass('address')}
          onClick={(e) => ifOpen && props.clickFilter(route.id, 'address', e)}
          title={ifOpen && titleText.address}>
        <small>РНК: {route.countRNK} ТТ: {route.count}</small>
      </Th>
      <Th className={getFilterClass('sku')}
          onClick={(e) => ifOpen && props.clickFilter(route.id, 'sku', e)}
          title={ifOpen && titleText.sku}>
        <small>SKU: {route.sku}</small>
      </Th>
      <Th className={getFilterClass('weight')}
          onClick={(e) => ifOpen && props.clickFilter(route.id, 'weight', e)}
          title={ifOpen && titleText.weight}>
        <small>Масса {(+route.weightAll).toFixed()} кг {(route.car||route.car_virtual) && ((route.weightAll * 100) / route.car_weight).toFixed()+"%"}</small>
      </Th>
      <Th className={getFilterClass('volumeAll')}
          onClick={(e) => ifOpen && props.clickFilter(route.id, 'volumeAll', e)}
          title={ifOpen && titleText.volumeAll}>
        <small>Объем {route.volumeAll} м3 {(route.car||route.car_virtual) && ((route.volumeAll * 100) / route.car_volume).toFixed()+"%"}</small>
      </Th>
      <Th className={getFilterClass('pallet')}
          onClick={(e) => ifOpen && props.clickFilter(route.id, 'pallet', e)}
          title={ifOpen && titleText.pallet}>
        <small>Паллет {(+route.pallet).toFixed(2)} шт.</small>
      </Th>
      <Th className={getFilterClass('distance')}
          onClick={(e) => ifOpen && props.clickFilter(route.id, 'distance', e)}
          title={ifOpen && titleText.distance}>
        <small>Километраж {(route.distance / 1000).toFixed()} км</small>
      </Th>
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
