import React from 'react';
import { Table } from 'semantic-ui-react';
import WaypointRow from './WaypointRow';
import RouteRow from './RouteRow';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import './Table.scss';


class RouteTable extends React.Component {
  render() {
    const routeTables = this.props.routes.map((route, index) => {
      let rows = [
        <RouteRow
          route={route}
          routeIndex={index}
          onClick={() => {
            this.props.setActiveRoute(index, !(route.id === this.props.activeRouteId));
          }}
          checked={this.props.checkedRouteIds[route.id]}
          onCheckboxChange={() => this.props.setCheckedRoute(index, !this.props.checkedRouteIds[route.id])}
          active={this.props.activeRouteId === route.id}
          endMoveWaypoint={this.props.endMoveWaypoint}
          onToggleOpen={(e) => {
            e.stopPropagation();
            this.props.toggleOpenRoute(route.id);
          }}
        />
      ];

      if (this.props.openRouteIds[route.id]) {
        rows = [
          ...rows,
          ...route.waypoints.map((waypoint, index2) => {
            return (
              <WaypointRow
                waypoint={waypoint} key={`${index}-${index2}`}
                index={{ routeIndex: index, waypointIndex: index2 }}
                previewMoveWaypoint={this.props.previewMoveWaypoint}
                endMoveWaypoint={this.props.endMoveWaypoint}
                onClick={() => {
                  this.props.setActiveWaypoint(index, index2, !(waypoint.id === this.props.activeWaypointId));
                }}
                active={this.props.activeWaypointId === waypoint.id}
              />
            );
          })
        ];
      }

      return rows;
    });

    return (
      <Table size="small" very compact celled structured>
        <Table.Header>
          <Table.Row>
            {/*<Table.HeaderCell className="table-th">№</Table.HeaderCell>*/}
            {/*<Table.HeaderCell className="table-th">№ и дата РНК</Table.HeaderCell>*/}
            {/*<Table.HeaderCell className="table-th" width={2}>Контрагент</Table.HeaderCell>*/}
            {/*<Table.HeaderCell className="table-th" width={2}>Адрес ТТ</Table.HeaderCell>*/}
            {/*<Table.HeaderCell className="table-th">Отдел доставки</Table.HeaderCell>*/}
            {/*<Table.HeaderCell className="table-th">Склад</Table.HeaderCell>*/}
            {/*<Table.HeaderCell className="table-th">Вид клиента</Table.HeaderCell>*/}
            {/*<Table.HeaderCell className="table-th">Кол-во SKU</Table.HeaderCell>*/}
            {/*<Table.HeaderCell className="table-th">Масса РНК(кг)</Table.HeaderCell>*/}
            {/*<Table.HeaderCell className="table-th">Объем РНК(м3)</Table.HeaderCell>*/}
            {/*<Table.HeaderCell className="table-th">Кол-во паллет</Table.HeaderCell>*/}
            {/*<Table.HeaderCell className="table-th">Километраж</Table.HeaderCell>*/}
            {/*<Table.HeaderCell className="table-th">Время приема ТТ</Table.HeaderCell>*/}
            {/*<Table.HeaderCell className="table-th" >Время разгрузки(мин)</Table.HeaderCell>*/}
            {/*<Table.HeaderCell className="table-th"></Table.HeaderCell>*/}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {routeTables}
        </Table.Body>
      </Table>
    );
  }
}


export default DragDropContext(HTML5Backend)(RouteTable);

