import React from 'react';
import PropTypes from 'prop-types';
// import { Table, Popup, Icon } from 'semantic-ui-react';
import { Table, Icon } from 'semantic-ui-react';
import { DragSource, DropTarget } from 'react-dnd';
import * as dragTypes from '../constants/dragTypes';
import { pprintSeconds } from '../utils';
import moment from 'moment';

const waypointTarget = {
  canDrop() {
    return true;
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
  beginDrag: (props) => ({ ...props }),
  endDrag(props, monitor) {
    if (monitor.didDrop()) {
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
    const { connectDragSource, connectDropTarget, isDragging, filter, waypoint, active, rowTitle, rowId, duplicate } = this.props;
    const style={
      cursor: 'move',
      opacity: isDragging ? 0.95 : 1,
      backgroundColor: active ? '#e0e0e0' : (duplicate.hasOwnProperty(rowId) && waypoint.doc.waypoint && duplicate[rowId].includes(waypoint.doc.waypoint.pk) ? '#ffb7b7' : null),
      padding: ".2em",
    };

    const filterClass = value => {
      if (!filter) return 'null';
      value = Array.isArray(value) ? value : [value];
      for (let val of value) {
        return val !== null && String(val).toLowerCase().indexOf(filter.toLowerCase()) !== -1 ? 'activeFilter' : null;
      }
    };

    // It didn't want to work with Semantic's Table.Row Component;
    // Should create an issue maybe?
    return connectDragSource(connectDropTarget(
      <tr style={style} 
          id={`${this.props.index.routeIndex}-${this.props.index.waypointIndex}`}
          onClick={this.props.onClick}
          onMouseEnter={() => { if (this.props.ifMoveWaypoint) this.props.handleWindowRoute({ r_id: rowId, r_text: rowTitle }); }}
          onMouseLeave={() => { if (this.props.ifMoveWaypoint) this.props.handleWindowRoute({ r_id: 0, r_text: null }); }} >
        <Table.Cell><small>{waypoint.num}</small></Table.Cell>
        <Table.Cell className={filterClass(waypoint.doc.id1)}>{waypoint.doc.waypoint.base && <Icon name="home" color="green" />}<small>{waypoint.doc.id1}</small><br/><span style={{ fontSize: '8px' }}>({waypoint.id})</span></Table.Cell>
        <Table.Cell className={filterClass(waypoint.doc.waypoint.title)}><small>{waypoint.doc.waypoint.title}</small></Table.Cell>
        <Table.Cell className={filterClass(waypoint.doc.delivery_dep)}><small>{waypoint.doc.delivery_dep}</small></Table.Cell>
        <Table.Cell className={filterClass(waypoint.doc.waypoint.address)} colSpan="3"><small>{waypoint.doc.waypoint.address}</small></Table.Cell>
        {/*<Table.Cell><small>{(+waypoint.weight).toFixed()}</small></Table.Cell>*/}
        <Table.Cell><small>{waypoint.doc.sku}</small></Table.Cell>
        <Table.Cell><small>{(+waypoint.doc.weight).toFixed()} кг</small></Table.Cell>
        <Table.Cell><small>{waypoint.doc.volume} м3</small></Table.Cell>
        <Table.Cell><small>{(+waypoint.doc.pallet).toFixed(2)} паллет</small></Table.Cell>
        <Table.Cell><small>{(waypoint.distance / 1000).toFixed()} ({waypoint.distance > 0 && ((waypoint.distance / waypoint.duration) * 3.6).toFixed()} км/ч)</small></Table.Cell>
        <Table.Cell><small>{`${moment(waypoint.doc.delivery_time_s, "HH:mm:ss").format("HH:mm")} - ${moment(waypoint.doc.delivery_time_e, "HH:mm:ss").format("HH:mm")}`}</small></Table.Cell>
        <Table.Cell><small>{pprintSeconds(+waypoint.service_time)} ({`${moment(waypoint.planned_time_s).format("HH:mm")} - ${moment(waypoint.planned_time_e).format("HH:mm")}`})</small></Table.Cell>
        <Table.Cell 
          onClick={(e) => {
            e.stopPropagation();
            this.props.modalShow({ open: true, id: waypoint.id, id1: waypoint.doc.id1, comment: waypoint.comment });
          }} 
          style={{cursor: 'pointer'}} 
          textAlign="center">
          <Icon name="edit" color={waypoint.comment ? 'green' : 'black'} title={waypoint.comment ? waypoint.comment : 'Добавить комментарий'} />
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

Waypoint.propTypes = {
  connectDragSource: PropTypes.func,
  connectDropTarget: PropTypes.func,
  isDragging:        PropTypes.bool,
  filter:            PropTypes.string,
  waypoint:          PropTypes.object,
  active:            PropTypes.bool,
  rowTitle:          PropTypes.string,
  rowId:             PropTypes.number,
  ifMoveWaypoint:    PropTypes.bool,
  handleWindowRoute: PropTypes.func,
  onClick:           PropTypes.func,
  modalShow:         PropTypes.func,
  index:             PropTypes.object,
  duplicate:         PropTypes.object,
};

const x = DropTarget(dragTypes.WAYPOINT, waypointTarget, collect)(Waypoint);
export default DragSource(dragTypes.WAYPOINT, waypointSource, collect2)(x);

