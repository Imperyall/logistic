import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import 'semantic-ui-css/semantic.min.css';
import { Form, Button, Loader, Dropdown, Input, Icon, Checkbox } from 'semantic-ui-react';
import GoogleMap from '../components/GoogleMap';
import moment from 'moment';
import * as actionsMap from '../actions';
import { debounce, EventUtil } from '../utils';
import Table from '../components/Table';
import Overview from '../components/Overview';
import ModalExtend from '../components/ModalExtend';
import MoveWindow from '../components/MoveWindow';
import ModalWaypointEdit from '../components/ModalWaypointEdit';
import ModalRouteEdit from '../components/ModalRouteEdit';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

const { LatLngBounds } = window.google.maps;
const fullTimeFormat = 'YYYY-MM-DDTHH:mm:ss';

window.notify = NotificationManager;

class App extends React.Component {
  constructor() {
    super();

    this.handleDeliveryDepsChange =  this.handleDeliveryDepsChange.bind(this);
    this.handleDeliveryZonesChange = this.handleDeliveryZonesChange.bind(this);
    this.handleFromDateChange =      this.handleFromDateChange.bind(this);
    this.handleToDateChange =        this.handleToDateChange.bind(this);
    this.handleRecycled =            this.handleRecycled.bind(this);
    this.handleMoveWaypoint =        this.handleMoveWaypoint.bind(this);
    this.getFetchParams =            this.getFetchParams.bind(this);
    this.handleMapLoad =             this.handleMapLoad.bind(this);
    this.handleModalShow =           this.handleModalShow.bind(this);
    this.handleNewRouteNumber =      this.handleNewRouteNumber.bind(this);
    this.handleWaypointEditShow =    this.handleWaypointEditShow.bind(this);
    this.modalShow =                 this.modalShow.bind(this);
    this.waypointEditShow =          this.waypointEditShow.bind(this);
    this.routeEditShow =             this.routeEditShow.bind(this);
    this.handleFilterValue =         this.handleFilterValue.bind(this);
    this.handleMapZoom =             this.handleMapZoom.bind(this);
    this.saveWaypoint =              this.saveWaypoint.bind(this);
    this.startLoadingTimer =         this.startLoadingTimer.bind(this);
    this.handleChangeCluster =       this.handleChangeCluster.bind(this);

    this.state = {
      fromDate: moment().format('YYYY-MM-DD'),
      toDate: moment().add(1, 'days').format('YYYY-MM-DD'),
      deliveryDeps: [],
      deliveryZones: [],
      recycled: false,
      isLoading: true,
      modalData: {},
      newRouteNumber: '',
      waypointModalData: {},
      routeModalData: {},
      filterValue: '',
      clustered: true,
    };
  }

  componentDidMount() {
    this.props.fetchDeliveryDeps(this.getFetchParams());
    this.props.fetchDrivers();
    this.props.fetchRoutes(this.getFetchParams());
    this.props.setSizeBlocks();
  }

  componentDidUpdate(prevProps) {
    const { bounds } = this.props;

    if (bounds && bounds !== prevProps.bounds) {
      const { east, north, south, west } = bounds;//.toObject();
      const boundsObj = new LatLngBounds({ lat: south, lng: west }, { lat: north, lng: east });
      this._mapComponent.fitBounds(boundsObj);
    }

    if (prevProps.loadingCurrent == 0 && this.props.loadingCurrent != 0) {
      this.startLoadingTimer();
    }
  }

  getFetchParams(fullTime) {
    const { fromDate, toDate, deliveryDeps } = this.state;
    let delivery_dep = deliveryDeps.length > 0 ? deliveryDeps : null,
        recycled = !this.state.recycled ? null : this.state.recycled;
    const format = fullTime ? fullTimeFormat : 'YYYY-MM-DD';

    return {
      delivery_date_from: moment(fromDate).format(format),
      delivery_date_to: moment(toDate).format(format),
      delivery_dep,
      recycled,
    };
  }

  startLoadingTimer() {
    const end = this.props.loadingTimeout;
    if (end > 0) {
      if (this._loadingTick) {
        clearInterval(this._loadingTick);
        this._loadingTick = false;
      }
      
      this._loadingTick = setInterval(() => this.props.next(), 1000);
      setTimeout(() => clearInterval(this._loadingTick), end * 1000);
    }
  }

  handleChangeCluster() {
    this.setState(prevState => ({ clustered: !prevState.clustered }));
  }

  handleDeliveryDepsChange(event, data) {
    this.setState({ deliveryDeps: data.value });
    this.props.fetchDeliveryZones(data.value);
  }

  handleDeliveryZonesChange(event, data) {
    this.setState({ deliveryZones: data.value });
  }

  handleFromDateChange(event) {
    this.setState({ fromDate: event.target.value });
  }

  handleToDateChange(event) {
    this.setState({ toDate: event.target.value });
  }

  handleRecycled() {
    this.setState(prevState => { 
      return { recycled: !prevState.recycled };
    });
  }

  handleModalShow() {
    this.setState(prevState => ({ modalData: { open : !prevState.modalData.open } }));
  }

  handleWaypointEditShow() {
    const find_point = (arr, id) => {
      if (id.length == 0 || arr.length == 0) return {};

      for (let i of arr) {
        const item = i.index.find(w => w.id == id[0]);

        if (item) return item;
      }

      return {};
    };

    this.setState(prevState => ({ 
      waypointModalData: { 
        open: !prevState.waypointModalData.open, 
        waypoint: find_point(this.props.routes, this.props.activeWaypointId),
      }
    }));
  }

  handleRouteEditShow() {
    this.setState(prevState => {
      const open = !prevState.routeModalData.open;
      open && this.props.fetchCars({ ...this.getFetchParams(true), avail: true });

      return { routeModalData: { open, route: this.props.routes.find(r => this.props.checkedRouteIds[r.id]) } };
    });
  }

  handleNewRouteNumber(event) {
    this.setState({ newRouteNumber: event ? event.target.value : '' });
  }

  handleFilterValue(data) {
    this.setState({ filterValue: data.value });
  }

  modalShow({ open, id, comment, id1 }) {
    if (!open && id) {
      this.props.saveComment(this.getFetchParams(), { id, comment });
    }
    this.setState({ modalData: { open, id, comment, id1 } });
  }

  waypointEditShow({ open, waypoint }) {
    this.setState({ waypointModalData: { open, waypoint } });
  }

  routeEditShow({ open, route }) {
    this.setState({ routeModalData: { open, route } });
  }

  handleMapZoom() {
    this.props.changeZoom(this._mapComponent.getZoom());
  }

  saveWaypoint(params) {
    this.props.saveWaypoint(this.getFetchParams(), params);
  }

  handleMoveWaypoint(dragIndex, hoverIndex) {
    const newRoutes = [...this.props.routes];

    const dragWaypoint = newRoutes[dragIndex.routeIndex].index[dragIndex.waypointIndex];
    newRoutes[dragIndex.routeIndex].index.splice(dragIndex.waypointIndex, 1);
    newRoutes[hoverIndex.routeIndex].index.splice(hoverIndex.waypointIndex, 0, dragWaypoint);

    const fromRoute = newRoutes[dragIndex.routeIndex];
    const toRoute = newRoutes[hoverIndex.routeIndex];

    this.props.sortRoutes(
      this.getFetchParams(),
      {
        fromRoute: fromRoute.id,
        toRoute: toRoute.id,
        fromList: fromRoute.index.map(waypoint => waypoint.id),
        toList: toRoute.index.map(waypoint => waypoint.id),
      }
    );

    this.props.moveWaypoint(newRoutes);
  }

  handleMapLoad(map) {
    this._mapComponent = map;
    window._m = map;
  }

  render() {
    const { fromDate, toDate, deliveryDeps, deliveryZones } = this.state;
    const { checkedRouteIds, routes } = this.props;
    const deliveryDepsOptions = this.props.deliveryDeps.map(option => ({
      text: option.title, value: option.id
    }));

    const deliveryZonesOptions = this.props.deliveryZones.length !== 0 ? this.props.deliveryZones.map(option => ({
      text: option.title, value: option.id
    })) : [];

    const routesForOverview = Object.values(checkedRouteIds).includes(true) ? routes.filter(item => checkedRouteIds[item.id]) : routes;

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
      cars: [],
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
      cars: !cur.car || acc.cars.includes(cur.car.id) ? acc.cars : [ ...acc.cars, cur.car.id ],
    }), initialOverviewData);

    const optimizeAllRoutes = options => this.props.getLoadingTimeout(() => this.props.optimizeAllRoutes(this.getFetchParams(), checkedRouteIdsArray, options, 'one'));
    const upload1C = options => this.props.upload1C(this.getFetchParams(), { deliveryDeps, deliveryZones, options });

    return (
      <div id="page">
        <div id="leftSide" style={{ width: this.props.windowSize.leftWidth }}>
          {this.props.isLoading && <Loader size="huge" active >{this.props.loadingCurrent != 0 && `${this.props.loadingCurrent} сек.`}</Loader>}
          <Form size="tiny">
            <Form.Group>
              <Form.Select
                placeholder="Базы"
                value={deliveryDeps}
                onChange={this.handleDeliveryDepsChange}
                width={5}
                options={deliveryDepsOptions}
                search
                closeOnChange
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
                className="vertical-auto"
                checked={this.state.recycled} 
                onChange={this.handleRecycled} 
                label="Удаленные" />
              <Form.Button 
                color="blue" 
                onClick={() => this.props.fetchRoutes(this.getFetchParams())} >
                Фильтр
              </Form.Button>
            </Form.Group>
          </Form>
          {this.props.deliveryZones.length !== 0 ? 
            <Form size="tiny">
              <div className="fields nomarginl">
                <Dropdown 
                  placeholder="Зоны" 
                  fluid 
                  onChange={this.handleDeliveryZonesChange}
                  multiple 
                  selection 
                  className="deliveryZones"
                  options={deliveryZonesOptions} />
              </div>
            </Form>
          : null }
          <Form size="tiny">
            <div className="fields nomarginl">
              <Dropdown 
                style={{ minWidth: '156px' }}
                className="ui basic orange button button-div"
                text="Загрузить РНК" >
                <Dropdown.Menu>
                  <Dropdown.Item text="Все документы" onClick={() => upload1C('1')} />
                  <Dropdown.Item text="Документы не в маршрутах" onClick={() => upload1C('2')} />
                  <Dropdown.Item text="Не выгружены в 1С" onClick={() => upload1C('3')} />
                  <Dropdown.Item text="Выгружены в 1С" onClick={() => upload1C('4')} />
                  <Dropdown.Item text="Документы у сотрудников" onClick={() => upload1C('5')} />
                </Dropdown.Menu> 
              </Dropdown>
              <Dropdown 
                className="ui basic icon green button button-div"
                title="Добавить маршрут"
                icon="level down" >
                <Dropdown.Menu className="dropdown-add-route">
                  <Dropdown.Item text="Создать пустой" onClick={() => this.props.newRoutes(this.getFetchParams())} />
                  <Dropdown.Item>
                  {
                    <div className="dropdown-add-route-line">
                      <Input 
                        maxLength="5"
                        onChange={this.handleNewRouteNumber}
                        value={this.state.newRouteNumber}
                        onClick={e => e.stopPropagation()} 
                        size="small" />
                      <Button 
                        title={`Загрузить маршрут № ${this.state.newRouteNumber}`}
                        disabled={this.state.newRouteNumber == ''}
                        icon="chevron down"
                        color="green"
                        onClick={() => {
                          this.props.addRoutes(this.getFetchParams(), this.state.newRouteNumber);
                          this.handleNewRouteNumber();
                        }} />
                    </div>
                  }
                  </Dropdown.Item>
                </Dropdown.Menu> 
              </Dropdown>
              <Button 
                title="Принять для 1C"
                basic 
                color="yellow"
                icon="checkmark"
                onClick={() => this.props.acceptRoutes(this.getFetchParams(), checkedRouteIdsArray)} />
              <Button 
                title="Исключить из 1C"
                basic 
                color="yellow"
                icon="dont"
                onClick={() => this.props.unacceptRoutes(this.getFetchParams(), checkedRouteIdsArray)} />
              <Button 
                title="Пересчитать маршрут"
                basic 
                color="green"
                icon="repeat"
                onClick={() => this.props.reloadRoutes(this.getFetchParams(), checkedRouteIdsArray)} />
              {/*<Button 
                title="Загрузить"
                basic 
                color="green"
                icon="download"
                onClick={() => this.props.addRoutes(this.getFetchParams())} />
              <Button 
                title="Выгрузить"
                basic 
                color="green"
                icon="upload"
                onClick={() => this.props.uploadRoutes(this.getFetchParams(), checkedRouteIdsArray)} />*/}
              <Button 
                title="Удалить"
                basic 
                color="red"
                icon="trash"
                onClick={() => this.props.recycleRoutes(this.getFetchParams(), checkedRouteIdsArray)} />
              <Button 
                title="Вернуть"
                basic 
                color="red"
                icon="recycle"
                onClick={() => this.props.unrecycleRoutes(this.getFetchParams(), checkedRouteIdsArray)} />
              { /*<Button 
                title="Выгрузить отчет"
                basic 
                color="green"
                icon="file excel outline"
                onClick={() => this.props.uploadXls(this.getFetchParams(), checkedRouteIdsArray)} />*/}
              <Button 
                title="Оптимизировать маршруты"
                basic 
                color="blue"
                icon="random"
                onClick={() => this.props.optimizeRoutes(this.getFetchParams(), checkedRouteIdsArray)} />
              <Dropdown 
                className="ui basic icon orange button button-div"
                title="Решить транспортную задачу"
                icon="play" >
                <Dropdown.Menu>
                  <Dropdown.Item text="Закрепленные ТС" onClick={() => optimizeAllRoutes('given')} />
                  <Dropdown.Item text="Минимальные ТС" onClick={() => optimizeAllRoutes('minimal')} />
                  <Dropdown.Item text="Виртуальные ТС" onClick={() => optimizeAllRoutes('virtual')} />
                </Dropdown.Menu> 
              </Dropdown>
              {checkedRouteIdsArray.length !== 0 ? 
              <div className="buttons_row">
                <Dropdown 
                  className="ui icon basic teal button button-div"
                  title="Сменить базу"
                  icon="home" >
                  <Dropdown.Menu>
                    <Dropdown.Header content="Базы:" />
                    <Dropdown.Menu scrolling>
                      {this.props.deliveryDeps.map(option => 
                        (<Dropdown.Item 
                          key={option.id} 
                          value={option.id} 
                          onClick={() => this.props.routeEdit({ fetchParams: this.getFetchParams(), deliveryDeps: [option.id], pk: checkedRouteIdsArray })} 
                          text={option.title} />)
                      )}
                    </Dropdown.Menu>
                  </Dropdown.Menu> 
                </Dropdown>
                <Button 
                  title="Редактировать маршрут"
                  basic 
                  color="teal"
                  icon="edit"
                  onClick={() => this.handleRouteEditShow()} />
              </div> : null }
              {this.props.activeWaypointId !== null ? 
              <div className="buttons_row">
                <Dropdown 
                  className="ui icon basic violet button button-div"
                  title="Переместить в другой маршрут" 
                  icon="move" >
                  <Dropdown.Menu>
                    <Dropdown.Header content="Маршрут для перемещения" />
                    <Dropdown.Menu scrolling>
                      {routes.map(item => 
                        (<Dropdown.Item 
                          key={item.id} 
                          value={item.id} 
                          onClick={() => this.props.moveWaypoints(this.getFetchParams(), item.id, this.props.activeWaypointId)} 
                          text={item.collection ? "Набор РНК " : item.collectionRem ? "Непопавшие РНК " : item.bin ? "Корзина" : "Маршрут " + item.id1} />)
                      )}
                    </Dropdown.Menu> 
                  </Dropdown.Menu>  
                </Dropdown>
                <Button 
                  title="Редактировать торговую точку"
                  basic 
                  color="violet"
                  icon="edit"
                  onClick={() => this.handleWaypointEditShow()} />
              </div> : null }
            </div>
          </Form>
          <Input 
            icon
            placeholder="Фильтр..."
            size="small"
            onChange={debounce((e, d) => this.handleFilterValue(d), 500)}
            className="filter-input">
            <input />
            <Icon name="search" />
          </Input>
          <Checkbox 
            style={{ float: 'right' }}
            title="Группировать близлежащие точки"
            slider
            checked={this.state.clustered}
            onChange={this.handleChangeCluster} />
          <Table
            routes={[...routes]}
            filter={this.state.filterValue}
            moveWaypoint={this.handleMoveWaypoint}
            endMoveWaypoint={(d, h) => this.handleMoveWaypoint(d, h)}
            toggleOpenRoute={this.props.toggleOpenRoute}
            handleWindowRoute={this.props.handleWindowRoute}
            ifMoveWaypoint={this.props.moveWindow.show}
            setCheckedRoute={this.props.setCheckedRoute}
            checkedRouteIds={this.props.checkedRouteIds}
            openRouteIds={this.props.openRouteIds}
            setActiveRoute={this.props.setActiveRoute}
            setActiveWaypoint={this.props.setActiveWaypoint}
            activeRouteId={this.props.activeRouteId}
            activeWaypointId={this.props.activeWaypointId}
            duplicate={this.props.duplicate}
            modalShow={this.modalShow} />
        </div>
        <div id="buttonDivider">
          <Button 
            title="Изменить размер"
            icon="resize horizontal"
            onMouseDown={() => new EventUtil({ type: 'RESIZE', app: this.props })} />
        </div>
        <div id="rightSide" style={{ width: this.props.windowSize.rightWidth }}>
          <div>
            <GoogleMap
              containerElement={<div style={{ height: "60vh" }} />}
              mapElement={<div style={{ height: "60vh" }} />}
              routes={routes}
              lockMap={this.props.moveWindow.show}
              handleShowText={this.handleShowText}
              app={this.props}
              onMapLoad={this.handleMapLoad}
              center={this.props.center}
              zoom={this.props.zoom}
              changeZoom={this.handleMapZoom}
              clustered={this.state.clustered}
              //markerPosition={this.props.markerPosition}
              //markerIcon={this.props.markerIcon}
              activeWaypointId={this.props.activeWaypointId}
              // markers={this.props.markers}
              setActiveWaypoint={this.props.setActiveWaypoint}
              checkedRouteIds={this.props.checkedRouteIds} />
            <Overview data={overviewData} />
          </div>
        </div>
        <ModalExtend 
          data={this.state.modalData}
          modalShow={this.modalShow} />
        <ModalWaypointEdit
          center={this.props.center}
          save={this.saveWaypoint}
          data={this.state.waypointModalData}
          modalShow={this.waypointEditShow} />
        <ModalRouteEdit
          isLoading={this.props.isLoading}
          drivers={this.props.drivers}
          cars={this.props.cars}
          dcs={[]}
          fetchParams={this.getFetchParams}
          save={this.props.routeEdit}
          data={this.state.routeModalData}
          modalShow={this.routeEditShow} />
        <MoveWindow
          data={this.props.moveWindow} />
        <NotificationContainer/>
      </div>
    );
  }
}

App.propTypes = {
  fetchDeliveryDeps: PropTypes.func,
  fetchDrivers:      PropTypes.func,
  fetchRoutes:       PropTypes.func,
  fetchCars:         PropTypes.func,
  fetchDeliveryZones:PropTypes.func,
  getDeliveryZones:  PropTypes.func,
  bounds:            PropTypes.object,
  saveComment:       PropTypes.func,
  setSizeBlocks:     PropTypes.func,
  routes:            PropTypes.array,
  sortRoutes:        PropTypes.func,
  moveWaypoint:      PropTypes.func,
  checkedRouteIds:   PropTypes.object,
  deliveryDeps:      PropTypes.array,
  cars:              PropTypes.array,
  drivers:           PropTypes.array,
  deliveryZones:     PropTypes.array,
  windowSize:        PropTypes.object,
  isLoading:         PropTypes.bool,
  optimizeRoutes:    PropTypes.func,
  optimizeAllRoutes: PropTypes.func,
  newRoutes:         PropTypes.func,
  acceptRoutes:      PropTypes.func,
  unacceptRoutes:    PropTypes.func,
  reloadRoutes:      PropTypes.func,
  addRoutes:         PropTypes.func,
  uploadRoutes:      PropTypes.func,
  recycleRoutes:     PropTypes.func,
  unrecycleRoutes:   PropTypes.func,
  uploadXls:         PropTypes.func,
  upload1C:          PropTypes.func,
  routeEdit:         PropTypes.func,
  activeWaypointId:  PropTypes.array,
  toggleOpenRoute:   PropTypes.func,
  handleWindowRoute: PropTypes.func,
  moveWindow:        PropTypes.object,
  setCheckedRoute:   PropTypes.func,
  openRouteIds:      PropTypes.object,
  moveWaypoints:     PropTypes.func,
  setActiveRoute:    PropTypes.func,
  setActiveWaypoint: PropTypes.func,
  activeRouteId:     PropTypes.number,
  center:            PropTypes.object,
  markers:           PropTypes.array,
  zoom:              PropTypes.number,
  changeZoom:        PropTypes.func,
  saveWaypoint:      PropTypes.func,
  loadingTimeout:    PropTypes.number,
  loadingCurrent:    PropTypes.number,
  next:              PropTypes.func,
  getLoadingTimeout: PropTypes.func,
  duplicate:         PropTypes.object,
};

const mapStateToProps = state => ({
    routes:           state.points.routes,
    checkedRouteIds:  state.points.checkedRouteIds,
    openRouteIds:     state.points.openRouteIds,
    deliveryDeps:     state.utils.deliveryDeps,
    deliveryZones:    state.utils.deliveryZones,
    activeRouteId:    state.points.activeRouteId,
    activeWaypointId: state.points.activeWaypointId,
    bounds:           state.points.bounds,
    center:           state.points.center,
    isLoading:        state.utils.isLoading.length != 0 || state.utils.loadingCurrent != 0,
    windowSize:       state.utils.windowSize,
    modalData:        state.utils.modalData,
    markers:          state.points.markers,
    moveWindow:       state.moveWin,
    cars:             state.utils.cars,
    drivers:          state.utils.drivers,
    zoom:             state.utils.zoom,
    loadingTimeout:   state.utils.loadingTimeout,
    loadingCurrent:   state.utils.loadingCurrent,
    duplicate:        state.points.duplicate,
});

const mapDispatchToProps = actionsMap;

export default connect(mapStateToProps, mapDispatchToProps)(App);
