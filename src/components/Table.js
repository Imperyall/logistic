import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'semantic-ui-react';
import WaypointRow from './WaypointRow';
import RouteRow from './RouteRow';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import './Table.scss';

class RouteTable extends React.Component {
  constructor() {
    super();

    this.handleOrder = this.handleOrder.bind(this);
    this.checkOpen = this.checkOpen.bind(this);

    this.state = {
      order: -1,
      openSort: false,
      routeSort: null,
      thSort: null,
    };
  }

  checkOpen() {
    let clear = true;
    const { openRouteIds } = this.props;

    if (Object.keys(openRouteIds).length == 0) clear = false; else
    for (let item in openRouteIds) {
      if (openRouteIds[item]) clear = false;
    }

    if (clear) this.handleOrder({ openSort: false, routeSort: null, thSort: null });
  }

  handleOrder({ openSort, routeSort, thSort }) {
    this.setState((prevState) => {
      return {
        openSort,
        routeSort,
        thSort,
        order: prevState.thSort !== thSort ? -1 : prevState.order * -1,
      };
    });
  }

  render() {
    const routeTables = this.props.routes.map((route, index) => {

      const ifFilter = this.props.filter !== null && this.props.filter !== '';
      const rowTitle = route.collection ? "Набор РНК" : route.collectionRem ? "Непопавшие РНК " : route.bin ? "Корзина" : "Маршрут ";

      const clickFilter = (routeSort, thSort, e) => {
        e.stopPropagation();
        this.handleOrder({ openSort: true, routeSort, thSort });
      };

      let waypoints = [];

      if (ifFilter || this.props.openRouteIds[route.id]) {
        waypoints = route.waypoints;
        const { openSort, thSort, routeSort, order } = this.state;

        if (openSort && this.props.openRouteIds[routeSort]) {
          waypoints = waypoints.sort((a,b) => {
            const numbers = ["num", "sku", "weight", "volumeAll", "pallet", "distance"];
            
            if (numbers.indexOf(thSort) === -1) {
              if (a[thSort] > b[thSort]) return order * -1; else
              if (a[thSort] < b[thSort]) return order * 1;  else
              if (a[thSort] === b[thSort]) return 0;
            } else {
              return order * (+b[thSort] - +a[thSort]);
            }
          });
        }

        waypoints = waypoints.map((waypoint, index2) => {
          const active = Array.isArray(this.props.activeWaypointId) ? this.props.activeWaypointId.indexOf(waypoint.id) !== -1 : false;

          return (
            <WaypointRow
              //key={index2}
              waypoint={waypoint} key={`${index}-${index2}`}
              index={{ routeIndex: index, waypointIndex: index2 }}
              rowTitle={rowTitle + (route.id1 === null ? "" : route.id1)}
              rowId={route.id}
              handleWindowRoute={this.props.handleWindowRoute}
              ifMoveWaypoint={this.props.ifMoveWaypoint}
              //previewMoveWaypoint={this.props.previewMoveWaypoint}
              endMoveWaypoint={this.props.endMoveWaypoint}
              modalShow={this.props.modalShow}
              onClick={(e) => this.props.setActiveWaypoint(index, index2, !active, e.ctrlKey)}
              active={active}
              filter={this.props.filter}
            />
          );
        });

        if (ifFilter) {
          waypoints = waypoints.filter((waypoint) => {
            waypoint = waypoint.props.waypoint;
            const props = [
              //'num',
              'address',
              'deliveryDep',
              //'base',
              //'distance',
              //'duration',
              'id1',
              //'pallet',
              //'sku',
              'title',
              //'volume',
              //'weight',
            ];

            for (const prop of props) {
              if (waypoint.hasOwnProperty(prop) && waypoint[prop] !== null && String(waypoint[prop]).toLowerCase().indexOf(this.props.filter.toLowerCase()) !== -1) return true;
            }

            return false;
          });
        }
      }      

      let rows = !ifFilter || ifFilter && waypoints.length ? [
        <RouteRow
          key={index}
          route={route}
          rowTitle={rowTitle}
          routeIndex={index}
          handleWindowRoute={this.props.handleWindowRoute}
          ifMoveWaypoint={this.props.ifMoveWaypoint}
          onClick={() => this.props.setActiveRoute(index, !(route.id === this.props.activeRouteId))}
          checked={this.props.checkedRouteIds[route.id]}
          onCheckboxChange={(e) => this.props.setCheckedRoute(index, !this.props.checkedRouteIds[route.id], e.shiftKey)}
          active={this.props.activeRouteId === route.id}
          endMoveWaypoint={this.props.endMoveWaypoint}
          ifOpen={!!this.props.openRouteIds[route.id]}
          state={this.state}
          clickFilter={clickFilter}
          onToggleOpen={(e) => {
            e.stopPropagation();
            this.props.toggleOpenRoute(route.id);
            this.checkOpen();
          }}
        />
      ] : [];

      // if (this.props.openRouteIds[route.id] || ifFilter) {
      //   rows = [...rows, ...waypoints];
      // }

      return [...rows, ...waypoints];
    });

    return (
      <Table size="small" compact="very" celled structured className="main-table">
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

RouteTable.propTypes = {
  routes:            PropTypes.array,
  filter:            PropTypes.string,
  activeWaypointId:  PropTypes.array,
  handleWindowRoute: PropTypes.func,
  ifMoveWaypoint:    PropTypes.bool,
  endMoveWaypoint:   PropTypes.func,
  modalShow:         PropTypes.func,
  setActiveWaypoint: PropTypes.func,
  setActiveRoute:    PropTypes.func,
  activeRouteId:     PropTypes.number,
  checkedRouteIds:   PropTypes.object,
  setCheckedRoute:   PropTypes.func,
  toggleOpenRoute:   PropTypes.func,
  openRouteIds:      PropTypes.object,
};

export default DragDropContext(HTML5Backend)(RouteTable);

