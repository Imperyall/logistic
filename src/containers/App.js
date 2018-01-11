import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import 'semantic-ui-css/semantic.min.css';
import { Form, Button, Loader, Dropdown, Input, Icon } from 'semantic-ui-react';
import GoogleMap from '../components/GoogleMap';
import moment from 'moment';
import * as actionsMap from '../actions';
import { debounce, EventUtil } from '../utils';
import Table from '../components/Table';
import Overview from '../components/Overview';
import '../main.scss';
import ModalExtend from '../components/ModalExtend';
import MoveWindow from '../components/MoveWindow';

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
    this.handleSecondRaces = this.handleSecondRaces.bind(this);
    this.handleModalShow = this.handleModalShow.bind(this);
    this.modalShow = this.modalShow.bind(this);
    this.handleLockMap = this.handleLockMap.bind(this);
    this.handleFilterValue = this.handleFilterValue.bind(this);

    this.state = {
      fromDate: moment().date(1).month(1).year(2013).format('YYYY-MM-DD'),
      toDate: moment().add(1, 'days').format('YYYY-MM-DD'),
      deliveryDeps: [],
      showRecycled: false,
      isLoading: true,
      useDistance: false,
      secondRaces: false,
      modalData: {},
      lockMap: false,
      filterValue: '',
    };
  }

  componentDidMount() {
    this.props.fetchDeliveryDeps(this.getFetchParams());
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
  }

  getFetchParams() {
    const { fromDate, toDate, deliveryDeps, showRecycled } = this.state;
    return {
      fromDate: moment(fromDate).format('DD.MM.YYYY'),
      toDate: moment(toDate).format('DD.MM.YYYY'),
      deliveryDeps: deliveryDeps.length > 0 ? deliveryDeps.join(',') : 'null',
      showRecycled,
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
    this.setState((prevState) => { 
      return { showRecycled: !prevState.showRecycled };
    });
  }

  handleUseDistance() {
    this.setState((prevState) => { 
      return { useDistance: !prevState.useDistance };
    });
  }

  handleSecondRaces() {
    this.setState((prevState) => { 
      return { secondRaces: !prevState.secondRaces };
    });
  }

  handleModalShow() {
    this.setState((prevState) => { 
      return { modalData: { open : !prevState.modalData.open } };
    });
  }

  handleFilterValue(data) {
    this.setState({ filterValue: data.value});
  }

  handleLockMap(state) {
    this.setState({ lockMap: state });
  }

  modalShow({ open, id, comment, id1 }) {
    if (!open && id) {
      this.props.saveComment(this.getFetchParams(), { id, comment });
    }
    this.setState({
      modalData: { open, id, comment, id1 }
    });
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
          {this.props.isLoading && <Loader size="huge" active />}
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
                onClick={() => this.props.fetchRoutes(this.getFetchParams())} >
                Фильтр
              </Form.Button>
            </Form.Group>
          </Form>
          <Form size="tiny">
            <Form.Group>
              <Form.Button
                basic
                color="blue"
                onClick={() => this.props.optimizeRoutes(this.getFetchParams(), checkedRouteIdsArray, this.state.useDistance)} >
                {/*<Icon name="road" color="blue" />*/}
                Оптимизировать
              </Form.Button>
              <Button 
                title="Новый"
                basic 
                color="green"
                icon="plus"
                onClick={() => this.props.newRoutes(this.getFetchParams())} />
              <Button 
                title="Принять"
                basic 
                color="green"
                icon="checkmark"
                onClick={() => this.props.acceptRoutes(this.getFetchParams(), checkedRouteIdsArray)} />
              <Button 
                title="Обновить"
                basic 
                color="green"
                icon="repeat"
                onClick={() => this.props.reloadRoutes(this.getFetchParams(), checkedRouteIdsArray)} />
              <Button 
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
                onClick={() => this.props.uploadRoutes(this.getFetchParams(), checkedRouteIdsArray)} />
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
              {/*<Form.Button
                basic
                color="yellow"
                onClick={() => this.props.changeDeps(this.getFetchParams(), deliveryDeps, checkedRouteIdsArray)} >
                {/*<Icon name="home" color="yellow" />*/}
                {/*Сменить базу*/}
              {/*</Form.Button>*/}
              <Form.Button
                basic
                color="green"
                onClick={() => this.props.uploadXls(this.getFetchParams(), checkedRouteIdsArray)} >
                {/*<Icon name="table" color="green" />*/}
                Выгрузить отчет
              </Form.Button>
              {checkedRouteIdsArray.length !== 0 ? 
              <Dropdown 
                text="Сменить базу" 
                icon="move"
                labeled
                button 
                className="icon deps-button">
                <Dropdown.Menu>
                  <Dropdown.Header content="Базы" />
                  <Dropdown.Divider />
                  {this.props.deliveryDeps.map(option => 
                    (<Dropdown.Item 
                      key={option.id} 
                      value={option.id} 
                      onClick={() => this.props.changeDeps(this.getFetchParams(), [option.id], checkedRouteIdsArray)} 
                      text={option.title} />)
                  )}
                </Dropdown.Menu>  
              </Dropdown> : null }
              {this.props.activeWaypointId !== null ? 
              <Dropdown 
                text="Переместить" 
                icon="move"
                labeled
                button 
                className="icon move-button">
                <Dropdown.Menu>
                  <Dropdown.Header content="Маршрут для перемещения" />
                  <Dropdown.Divider />
                  {this.props.routes.map(item => 
                    (<Dropdown.Item 
                      key={item.id} 
                      value={item.id} 
                      onClick={() => this.props.moveWaypoints(this.getFetchParams(), item.id, this.props.activeWaypointId)} 
                      text={item.collection ? "Набор РНК " : item.collectionRem ? "Непопавшие РНК " : item.bin ? "Корзина" : "Маршрут " + item.id1} />)
                  )}
                </Dropdown.Menu>  
              </Dropdown> : null }
            </Form.Group>
            <Form.Group>
              <Form.Button
                basic
                color="blue"
                onClick={() => this.props.optimizeAllRoutes(this.getFetchParams(), checkedRouteIdsArray, 'given', this.state.useDistance, 'one', this.state.secondRaces)} >
                {/*<Icon name="truck" color="blue"/>
                <Icon name="truck" color="blue" inverted/>*/}
                Закрепленные ТС
              </Form.Button>
              <Form.Button
                basic
                color="blue"
                onClick={() => this.props.optimizeAllRoutes(this.getFetchParams(), checkedRouteIdsArray, 'minimal', this.state.useDistance, 'one', this.state.secondRaces)} >
                {/*<Icon name="truck" color="blue"/>
                <Icon name="plus" color="blue"/>
                <Icon name="truck" color="blue" inverted/>*/}
                Минимальные ТС
              </Form.Button>
              <Form.Button
                basic
                color="blue"
                onClick={() => this.props.optimizeAllRoutes(this.getFetchParams(), checkedRouteIdsArray, 'virtual', this.state.useDistance, 'one', this.state.secondRaces)} >
                {/*<Icon name="truck" color="blue" inverted/>*/}
                Виртуальные ТС
              </Form.Button>
              {/* <Form.Button
              //   basic
              //   color="blue"
              //   onClick={() => this.props.optimizeAllRoutes(this.getFetchParams(), checkedRouteIdsArray, 'given', this.state.useDistance, 'nobase', this.state.secondRaces)} >
              //   <Icon name="home" color="blue" inverted/>
              //   Без баз
              // </Form.Button> */}
              <Form.Checkbox 
                slider 
                id="chk2" 
                checked={this.state.useDistance} 
                onChange={this.handleUseDistance} 
                label="время/км" />
              <Form.Checkbox 
                slider 
                id="chk3" 
                checked={this.state.secondRaces} 
                onChange={this.handleSecondRaces} 
                label="Повторный выезд" />
            </Form.Group>
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
          <Table
            routes={[...this.props.routes]}
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
              routes={this.props.routes}
              lockMap={this.state.lockMap}
              handleLockMap={this.handleLockMap}
              handleShowText={this.handleShowText}
              app={this.props}
              onMapLoad={this.handleMapLoad}
              center={this.props.center}
              //markerPosition={this.props.markerPosition}
              //markerIcon={this.props.markerIcon}
              activeWaypointId={this.props.activeWaypointId}
              markers={this.props.markers}
              setActiveWaypoint={this.props.setActiveWaypoint}
              checkedRouteIds={this.props.checkedRouteIds} />
            <Overview data={overviewData} />
          </div>
        </div>
        <ModalExtend 
          data={this.state.modalData}
          modalShow={this.modalShow} />
        <MoveWindow
          data={this.props.moveWindow} />
      </div>
    );
  }
}

App.propTypes = {
  fetchDeliveryDeps: PropTypes.func,
  fetchRoutes:       PropTypes.func,
  setSizeBlocks:     PropTypes.func,
  bounds:            PropTypes.object,
  saveComment:       PropTypes.func,
  routes:            PropTypes.array,
  sortRoutes:        PropTypes.func,
  moveWaypoint:      PropTypes.func,
  checkedRouteIds:   PropTypes.object,
  deliveryDeps:      PropTypes.array,
  windowSize:        PropTypes.object,
  isLoading:         PropTypes.bool,
  optimizeRoutes:    PropTypes.func,
  optimizeAllRoutes: PropTypes.func,
  newRoutes:         PropTypes.func,
  acceptRoutes:      PropTypes.func,
  reloadRoutes:      PropTypes.func,
  addRoutes:         PropTypes.func,
  uploadRoutes:      PropTypes.func,
  recycleRoutes:     PropTypes.func,
  unrecycleRoutes:   PropTypes.func,
  uploadXls:         PropTypes.func,
  changeDeps:        PropTypes.func,
  activeWaypointId:  PropTypes.array,
  toggleOpenRoute:   PropTypes.func,
  handleWindowRoute: PropTypes.func,
  moveWindow:        PropTypes.object,
  setCheckedRoute:   PropTypes.func,
  openRouteIds:      PropTypes.object,
  moveWaypoints:     PropTypes.func,
  setActiveRoute:    PropTypes.func,
  setActiveWaypoint: PropTypes.func,
  activeRouteId:     PropTypes.array,
  center:            PropTypes.object,
  markers:           PropTypes.array,
};

const mapStateToProps = (state) => ({
    routes: state.points.routes,
    checkedRouteIds: state.points.checkedRouteIds,
    openRouteIds: state.points.openRouteIds,
    deliveryDeps: state.utils.deliveryDeps,
    activeRouteId: state.points.activeRouteId,
    activeWaypointId: state.points.activeWaypointId,
    bounds: state.points.bounds,
    center: state.points.center,
    isLoading: state.utils.isLoading,
    windowSize: state.utils.windowSize,
    modalData: state.utils.modalData,
    markers: state.points.markers,
    moveWindow: state.moveWin,
});

const mapDispatchToProps = actionsMap;

export default connect(mapStateToProps, mapDispatchToProps)(App);
