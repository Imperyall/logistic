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
    const docs = waypoint.doc.length;
    const style={
      cursor: 'move',
      opacity: isDragging ? 0.95 : 1,
      backgroundColor: active 
        ? '#e0e0e0' 
        : (duplicate.hasOwnProperty(rowId) 
            && docs
            && waypoint.doc[0].waypoint 
            && duplicate[rowId].includes(waypoint.doc[0].waypoint.pk) 
              ? '#ffb7b7' 
              : null),
      padding: ".2em",
    };

    const filterClass = value => {
      if (!filter) return '';
      value = Array.isArray(value) ? value : [value];
      for (let val of value) {
        return val !== null && String(val).toLowerCase().indexOf(filter.toLowerCase()) !== -1 ? 'activeFilter' : '';
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
        <Table.Cell>
          <small style={{ display: 'grid' }}>
            {waypoint.num}
            {waypoint.doc[0].waypoint.group && <span><Icon name="grid layout" color="red" /></span>}
          </small>
        </Table.Cell>
        <Table.Cell className={filterClass(waypoint.doc[0].id1)}>
          <small style={{ display: 'grid' }}>{waypoint.doc.map((doc, index) => (<span key={`id1${index}`}>{doc.id1}</span>))}</small>
          <span style={{ fontSize: '8px' }}>({waypoint.id})</span>
        </Table.Cell>
        {/*<Table.Cell><small>{(+waypoint.weight).toFixed()}</small></Table.Cell>*/}
        <Table.Cell>
          <small style={{ display: 'grid' }}>{waypoint.doc.map((doc, index) => (<span key={`sku${index}`}>{doc.sku}</span>))}</small>
        </Table.Cell>
        <Table.Cell>
          <small style={{ display: 'grid' }}>{waypoint.doc.map((doc, index) => (<span key={`weight${index}`}>{(+doc.weight).toFixed()}</span>))}</small>
        </Table.Cell>
        <Table.Cell>
          <small style={{ display: 'grid' }}>{waypoint.doc.map((doc, index) => (<span key={`volume${index}`}>{doc.volume}</span>))}</small>
        </Table.Cell>
        <Table.Cell>
        <small style={{ display: 'grid' }}>{waypoint.doc.map((doc, index) => (<span key={`pallet${index}`}>{(+doc.pallet).toFixed(2)}</span>))}</small>
        </Table.Cell>
        <Table.Cell className={filterClass(waypoint.doc[0].waypoint.title)}>
          <small style={{ display: 'grid' }}>
            <span>{waypoint.doc[0].waypoint.title}</span>
            {waypoint.doc[0].waypoint.group && <span>({waypoint.doc[0].waypoint.group})</span>}
          </small>
        </Table.Cell>
        <Table.Cell className={filterClass(waypoint.doc[0].delivery_dep)}>
          <small>{waypoint.doc[0].delivery_dep}</small>
        </Table.Cell>
        <Table.Cell className={filterClass(waypoint.doc[0].waypoint.address)} colSpan="3">
          <small style={{ display: 'grid' }}>
            <span>{waypoint.doc[0].waypoint.address}</span>
            {waypoint.doc[0].info_ol && <span className="doc-info-span">инф. ОЛ: {waypoint.doc[0].info_ol}</span>}
            {waypoint.doc[0].info_driver && <span className="doc-info-span">инф. для водит.: {waypoint.doc[0].info_driver}</span>}
          </small>
        </Table.Cell>
        <Table.Cell>
          <small>{(waypoint.distance / 1000).toFixed()} ({waypoint.distance > 0 && ((waypoint.distance / waypoint.duration) * 3.6).toFixed()} км/ч)</small>
        </Table.Cell>
        <Table.Cell>
          <small>{`${moment(waypoint.doc[0].delivery_time_s, "HH:mm:ss").format("HH:mm")} - ${moment(waypoint.doc[0].delivery_time_e, "HH:mm:ss").format("HH:mm")}`}</small>
        </Table.Cell> 
        <Table.Cell>
          <small>{pprintSeconds(+waypoint.service_time)} ({`${moment(waypoint.planned_time_s).format("HH:mm")} - ${moment(waypoint.planned_time_e).format("HH:mm")}`})</small>
        </Table.Cell>
        <Table.Cell 
          onClick={e => {
            e.stopPropagation();
            this.props.modalShow({ open: true, id: waypoint.id, id1: waypoint.doc[0].id1, comment: waypoint.comment });
          }} 
          style={{ cursor: 'pointer' }} 
          textAlign="center">
          <Icon name="edit" color={waypoint.comment ? 'green' : 'black'} title={waypoint.comment ? waypoint.comment : 'Добавить комментарий'} />
          {/*<Popup
            trigger={
              <Icon
                name="info"
                style={{ cursor: 'help' }}
                onMouseDown={(e) => e.preventDefault()} />
            }
            content={waypoint.address}
            position="right center" />*/}
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

