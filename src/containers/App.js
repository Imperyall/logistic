import React from 'react';
import { connect } from 'react-redux';
import 'semantic-ui-css/semantic.min.css';
import { Grid, Form, Icon, Button, Loader } from 'semantic-ui-react';
import GoogleMap from '../components/GoogleMap';
import moment from 'moment';
import {
  fetchRoutes,
  fetchDeliveryDeps,
  moveWaypoint,
  sortRoutes,
  toggleOpenRoute,
  setCheckedRoute,
  setActiveRoute,
  setActiveWaypoint,
  optimizeRoutes,
  optimizeAllRoutes,
  addRoutes,
  recycleRoutes,
  unrecycleRoutes,
  acceptRoutes,
  uploadRoutes,
  newRoutes,
  changeDeps,
  uploadXls,
  reloadRoutes,
  setSizeBlocks,
} from '../actions';
import Table from '../components/Table';
import Overview from '../components/Overview';
// import * as Buttons from '../constants/buttons';
import '../main.scss';
const { LatLngBounds } = window.google.maps;


class App extends React.Component {
  constructor() {
    super();

    this.handleDeliveryDepsChange = this.handleDeliveryDepsChange.bind(this);
    this.handleFromDateChange = this.handleFromDateChange.bind(this);
    this.handleToDateChange = this.handleToDateChange.bind(this);
    this.handleShowRecycled = this.handleShowRecycled.bind(this);
    this.handleMoveWaypoint = this.handleMoveWaypoint.bind(this);
    this.getFetchParams = this.getFetchParams.bind(this);
    this.handleMapLoad = this.handleMapLoad.bind(this);
    this.handleUseDistance = this.handleUseDistance.bind(this);

    this.state = {
      fromDate: moment().date(1).month(1).year(2013).format('YYYY-MM-DD'),
      toDate: moment().add(1, 'days').format('YYYY-MM-DD'),
      deliveryDeps: [],
      showRecycled: false,
      isLoading: true,
      useDistance: false,
      windowSize: {},
    };
  }

  componentDidMount() {
    this.props.fetchDeliveryDeps(this.getFetchParams());
    this.props.fetchRoutes(this.getFetchParams());
    this.props.setSizeBlocks();
    this.addEventResize();
  }

  componentDidUpdate(prevProps) {
    const { bounds } = this.props;

    if (bounds && !bounds.equals(prevProps.bounds)) {
      const { east, north, south, west } = bounds.toObject();
      const boundsObj = new LatLngBounds({ lat: south, lng: west }, { lat: north, lng: east });
      this._mapComponent.fitBounds(boundsObj);
    }
  }

  getFetchParams() {
    const { fromDate, toDate, deliveryDeps, showRecycled, windowSize } = this.state;
    return {
      fromDate: moment(fromDate).format('DD.MM.YYYY'),
      toDate: moment(toDate).format('DD.MM.YYYY'),
      deliveryDeps: deliveryDeps.length > 0 ? deliveryDeps.join(',') : 'null',
      showRecycled: showRecycled,
      windowSize: windowSize,
    };
  }

  handleDeliveryDepsChange(event, data) {
    this.setState({ deliveryDeps: data.value});
  }

  handleFromDateChange(event) {
    this.setState({ fromDate: event.target.value});
  }

  handleToDateChange(event) {
    this.setState({ toDate: event.target.value});
  }

  handleShowRecycled() {
    this.setState({ showRecycled: !this.state.showRecycled});
  }

  handleUseDistance() {
    this.setState({ useDistance: !this.state.useDistance});
  }

 handleMoveWaypoint(dragIndex, hoverIndex) {
    const newRoutes = [...this.props.routes];

    const dragWaypoint = newRoutes[dragIndex.routeIndex].waypoints[dragIndex.waypointIndex];
    newRoutes[dragIndex.routeIndex].waypoints.splice(dragIndex.waypointIndex, 1);
    newRoutes[hoverIndex.routeIndex].waypoints.splice(hoverIndex.waypointIndex, 0, dragWaypoint);

    const fromRoute = newRoutes[dragIndex.routeIndex];
    const toRoute = newRoutes[hoverIndex.routeIndex];

    this.props.sortRoutes(
      this.getFetchParams(),
      {
        fromRoute: fromRoute.id,
        toRoute: toRoute.id,
        fromList: fromRoute.waypoints.map((waypoint) => waypoint.id),
        toList: toRoute.waypoints.map((waypoint) => waypoint.id),
      }
    );

    this.props.moveWaypoint(newRoutes);
  }

  handleMapLoad(map) {
    this._mapComponent = map;
    window._m = map;
  }

  addEventResize() {
    window.addEventListener('overflow', () => {
      console.log(111);
    });
  }

  onResizeBody(/*callback*/) {
    let app = this;
    let d = document, w = window;
    let prop = w._divider || 33;
    w._divider = 0;
    d.onmousedown = function() {return false;}
    d.onmousemove = function(e) { //Начальные параметры
      d.onmousemove = function(e) { //Действия при смещении
        let nx = e.clientX;
        prop = Number((w.innerWidth - nx)/w.innerWidth*100);
        if (prop > 50) {
          prop = 50;
        } else if (prop < 20) {
          prop = 20;
        }
        app.props.setSizeBlocks(prop);
      }
    }
    d.onmouseup = function() {
      app.props.setSizeBlocks(prop, true);
      w._divider = prop;
      //Callback если нужен
      d.onmousedown = function() {}
      d.onmousemove = function() {}
    }
  }

  render() {
    const { fromDate, toDate, deliveryDeps } = this.state;
    const { checkedRouteIds } = this.props;
    const deliveryDepsOptions = this.props.deliveryDeps.map((option) => ({
      text: option.title, value: option.id
    }));

    let routesForOverview = [...this.props.routes].filter((item) =>
      checkedRouteIds[item.id]
    );

    if (routesForOverview.length === 0) { routesForOverview = this.props.routes; }

    let checkedRouteIdsArray = [];
    for (let key in checkedRouteIds) {
      if (checkedRouteIds.hasOwnProperty(key) && checkedRouteIds[key]) {
        checkedRouteIdsArray.push(key);
      }
    }

    const initialOverviewData = {
      distance: 0,
      duration: 0,
      count: 0,
      countRNK: 0,
      weightAll: 0,
      volumeAll: 0,
      routeCount: routesForOverview.length,
    };

    const overviewData = routesForOverview.reduce((acc, cur) => ({
      ...acc,
      distance: acc.distance + +cur.distance / 1000,
      duration: acc.duration + +cur.duration,
      count: acc.count + +cur.count,
      weightAll: acc.weightAll + +cur.weightAll,
      volumeAll: acc.volumeAll + +cur.volumeAll,
      countRNK: acc.countRNK + +cur.countRNK,
    }), initialOverviewData);

    return (
      <div id="page">
        <div id="leftSide" style={{ width: this.props.windowSize.leftWidth }}>
          {this.props.isLoading && <Loader  size="huge" active />}
          <Form size="tiny">
            <Form.Group>
              <Form.Select
                // label="Отделы доставки"
                placeholder="Базы"
                value={deliveryDeps}
                onChange={this.handleDeliveryDepsChange}
                width={5}
                options={deliveryDepsOptions}
                search
                multiple />
              <Form.Input
                placeholder="Начало периода"
                type="date"
                value={fromDate}
                onChange={this.handleFromDateChange} />
              <Form.Input
                placeholder="Конец периода"
                type="date"
                value={toDate}
                onChange={this.handleToDateChange} />
              <Form.Checkbox 
                id="chk1" 
                checked={this.state.showRecycled} 
                onChange={this.handleShowRecycled} 
                label="Удаленные" />
              <Form.Button 
                color="blue" 
                onClick={() => { this.props.fetchRoutes(this.getFetchParams()); }} >
                Фильтр
              </Form.Button>
            </Form.Group>
          </Form>
          <Form size="tiny">
            <Form.Group>
              <Form.Button
                basic
                color="blue"
                onClick={() => { this.props.optimizeRoutes(this.getFetchParams(), checkedRouteIdsArray, this.state.useDistance); }} >
                <Icon name="road" color="blue" />
                Оптимизировать
              </Form.Button>
              <Button 
                title="Новый"
                basic 
                color="green"
                icon="plus"
                onClick={(e) => { this.props.newRoutes(this.getFetchParams()); }} >
              </Button>
              <Button 
                title="Принять"
                basic 
                color="green"
                icon="checkmark"
                onClick={() => { this.props.acceptRoutes(this.getFetchParams(), checkedRouteIdsArray); }} >
              </Button>
              <Button 
                title="Обновить"
                basic 
                color="green"
                icon="repeat"
                onClick={() => { this.props.reloadRoutes(this.getFetchParams(), checkedRouteIdsArray); }} >
              </Button>
              <Button 
                title="Загрузить"
                basic 
                color="green"
                icon="download"
                onClick={() => { this.props.addRoutes(this.getFetchParams()); }} >
              </Button>
              <Button 
                title="Выгрузить"
                basic 
                color="green"
                icon="upload"
                onClick={() => { this.props.uploadRoutes(this.getFetchParams(), checkedRouteIdsArray); }} >
              </Button>
              <Button 
                title="Удалить"
                basic 
                color="red"
                icon="trash"
                onClick={() => { this.props.recycleRoutes(this.getFetchParams(), checkedRouteIdsArray); }} >
              </Button>
              <Button 
                title="Вернуть"
                basic 
                color="red"
                icon="recycle"
                onClick={() => { this.props.unrecycleRoutes(this.getFetchParams(), checkedRouteIdsArray); }} >
              </Button>
              <Form.Button
                basic
                color="yellow"
                onClick={() => { this.props.changeDeps(this.getFetchParams(), deliveryDeps, checkedRouteIdsArray); }} >
                <Icon name="home" color="yellow" />
                Сменить базу
              </Form.Button>
              <Form.Button
                basic
                color="green"
                onClick={() => { this.props.uploadXls(this.getFetchParams(), checkedRouteIdsArray); }} >
                <Icon name="table" color="green" />
                Выгрузить отчет
              </Form.Button>
            </Form.Group>
            <Form.Group>
              <Form.Button
                basic
                color="blue"
                onClick={() => { this.props.optimizeAllRoutes(this.getFetchParams(), checkedRouteIdsArray, 'given', this.state.useDistance, 'one'); }} >
                <Icon name="truck" color="blue"/>
                <Icon name="truck" color="blue" inverted/>
                Закрепленные ТС
              </Form.Button>
              <Form.Button
                basic
                color="blue"
                onClick={() => { this.props.optimizeAllRoutes(this.getFetchParams(), checkedRouteIdsArray, 'minimal', this.state.useDistance, 'one'); }} >
                <Icon name="truck" color="blue"/>
                <Icon name="plus" color="blue"/>
                <Icon name="truck" color="blue" inverted/>
                Минимальные ТС
              </Form.Button>
              <Form.Button
                basic
                color="blue"
                onClick={() => { this.props.optimizeAllRoutes(this.getFetchParams(), checkedRouteIdsArray, 'virtual', this.state.useDistance, 'one'); }} >
                <Icon name="truck" color="blue" inverted/>
                Виртуальные ТС
              </Form.Button>
              <Form.Button
                basic
                color="blue"
                onClick={() => { this.props.optimizeAllRoutes(this.getFetchParams(), checkedRouteIdsArray, 'given', this.state.useDistance, 'nobase'); }} >
                <Icon name="home" color="blue" inverted/>
                Без баз
              </Form.Button>
              <Form.Checkbox 
                slider 
                id="chk2" 
                checked={this.state.useDistance} 
                onChange={this.handleUseDistance} 
                label="время/км" />
            </Form.Group>
          </Form>
          <Table
            routes={[...this.props.routes]}
            moveWaypoint={this.handleMoveWaypoint}
            endMoveWaypoint={(d, h) => this.handleMoveWaypoint(d, h, true)}
            toggleOpenRoute={this.props.toggleOpenRoute}
            setCheckedRoute={this.props.setCheckedRoute}
            checkedRouteIds={this.props.checkedRouteIds}
            openRouteIds={this.props.openRouteIds}
            setActiveRoute={this.props.setActiveRoute}
            setActiveWaypoint={this.props.setActiveWaypoint}
            activeRouteId={this.props.activeRouteId}
            activeWaypointId={this.props.activeWaypointId} />
        </div>
        <div id="buttonDivider">
          <Button 
            title="Изменить размер"
            icon="resize horizontal"
            onMouseDown={() => this.onResizeBody()} >
          </Button>
        </div>
        <div id="rightSide" style={{ width: this.props.windowSize.rightWidth, position:"fixed", right: 10 }}>
          <GoogleMap
            containerElement={<div style={{ height: "60vh" }} />}
            mapElement={<div style={{ height: "60vh" }} />}
            routes={this.props.routes}
            onMapLoad={this.handleMapLoad}
            center={this.props.center}
            markerPosition={this.props.markerPosition}
            markerIcon={this.props.markerIcon}
            activeWaypointId={this.props.activeWaypointId}
            setActiveWaypoint={this.props.setActiveWaypoint}
            checkedRouteIds={this.props.checkedRouteIds} />
          <Overview data={overviewData} />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  routes: state.get('routes').toJS(),
  checkedRouteIds: state.get('checkedRouteIds').toObject(),
  openRouteIds: state.get('openRouteIds').toObject(),
  deliveryDeps: state.get('deliveryDeps').toJS(),
  activeRouteId: state.get('activeRouteId'),
  activeWaypointId: state.get('activeWaypointId'),
  bounds: state.get('bounds'),
  center: state.get('center').toJS(),
  isLoading: state.get('isLoading'),
  windowSize: state.get('windowSize'),
});

const mapDispatchToProps = {
  fetchRoutes,
  fetchDeliveryDeps,
  moveWaypoint,
  sortRoutes,
  toggleOpenRoute,
  setCheckedRoute,
  setActiveRoute,
  setActiveWaypoint,
  optimizeRoutes,
  optimizeAllRoutes,
  addRoutes,
  recycleRoutes,
  unrecycleRoutes,
  acceptRoutes,
  uploadRoutes,
  newRoutes,
  changeDeps,
  uploadXls,
  reloadRoutes,
  setSizeBlocks,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
