import React from 'react';
// import { Table, Popup, Icon } from 'semantic-ui-react';
import { Table } from 'semantic-ui-react';
import { DragSource, DropTarget } from 'react-dnd';
import * as dragTypes from '../constants/dragTypes';
import { pprintSeconds } from '../utils';


const waypointTarget = {
  canDrop() {
    return false;
  },
  hover(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex.routeIndex === hoverIndex.routeIndex && dragIndex.waypointIndex === hoverIndex.waypointIndex) {
      return;
    }

    // Time to actually perform the action
    // props.previewMoveWaypoint(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  },
};

const waypointSource = {
  beginDrag: ({id, index}) => ({id, index}),
  endDrag(props, monitor) {
    if (!monitor.didDrop()) {
      props.endMoveWaypoint(props.index, monitor.getItem().index);
    }
  },
};


const collect = connect => ({
  connectDropTarget: connect.dropTarget(),
});

const collect2 = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
};


class Waypoint extends React.Component {
  render() {
    const { connectDragSource, connectDropTarget, isDragging, waypoint, active } = this.props;
    const style={
      cursor: 'move',
      opacity: isDragging ? 0.95 : 1,
      backgroundColor: active ? '#e0e0e0' : null,
      padding: ".2em",
    };

    // It didn't want to work with Semantic's Table.Row Component;
    // Should create an issue maybe?
    return connectDragSource(connectDropTarget(
      <tr style={style} onClick={this.props.onClick}>
        <Table.Cell><small>{waypoint.num}</small></Table.Cell>
        <Table.Cell><small>{waypoint.id1}</small></Table.Cell>
        <Table.Cell><small>{waypoint.title}</small></Table.Cell>
        <Table.Cell><small>{waypoint.deliveryDep}</small></Table.Cell>
        <Table.Cell colSpan="3"><small>{waypoint.address}</small></Table.Cell>
        {/*<Table.Cell><small>{(+waypoint.weight).toFixed()}</small></Table.Cell>*/}
        <Table.Cell><small>{waypoint.sku}</small></Table.Cell>
        <Table.Cell><small>{(+waypoint.weight).toFixed()} кг</small></Table.Cell>
        <Table.Cell><small>{waypoint.volume} м3</small></Table.Cell>
        <Table.Cell><small>{(+waypoint.pallet).toFixed(2)} паллет</small></Table.Cell>
        <Table.Cell><small>{(waypoint.distance / 1000).toFixed()} ({waypoint.distance>0 && ((waypoint.distance / waypoint.duration)*3.6).toFixed()} км/ч)</small></Table.Cell>
        <Table.Cell><small>{`${waypoint.deliveryTimeS} - ${waypoint.deliveryTimeE}`}</small></Table.Cell>
        <Table.Cell><small>{pprintSeconds(+waypoint.serviceTime)} ({`${waypoint.plannedTimeS} - ${waypoint.plannedTimeE}`})</small></Table.Cell>
        <Table.Cell>
          {/*<Popup*/}
            {/*trigger={*/}
              {/*<Icon*/}
                {/*name="info"*/}
                {/*style={{ cursor: 'help' }}*/}
                {/*onMouseDown={(e) => e.preventDefault()}*/}
              {/*/>*/}
            {/*}*/}
            {/*content={waypoint.address}*/}
            {/*position="right center"*/}
          {/*/>*/}
        </Table.Cell>
      </tr>
    ));
  }
}


const x = DropTarget(dragTypes.WAYPOINT, waypointTarget, collect)(Waypoint);
export default DragSource(dragTypes.WAYPOINT, waypointSource, collect2)(x);
