import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Form, Dropdown, Input } from 'semantic-ui-react';
import moment from 'moment';

const defaultTime = moment().hour(8).minutes(0).seconds(0);

const clearState = {
  title: '',
  driver: [],
  car: [],
  dc: [],
  startDate: defaultTime.format("YYYY-MM-DD"),
  startTime: defaultTime.format("HH:mm"),
};

class ModalRouteEdit extends React.Component {

  constructor() {
    super();

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleData =        this.handleData.bind(this);
    this.saveData =          this.saveData.bind(this);
    this.close =             this.close.bind(this);

    this.state = clearState;
  }

  componentDidUpdate(prevProps) {
    const { open } = prevProps.data;
    const { data } = this.props;

    if (open != data.open && !open) {
      this.handleData(data.route);
    }
  }

  handleData(route) {
    this.setState(route ? {
      ...clearState,
      title: route.title || '',
      driver: route.driver && this.props.drivers.find(d => d.name == route.driver) 
        ? [ this.props.drivers.find(d => d.name == route.driver).id ] 
        : [],
      car: route.car && route.car.id ? [ route.car.id ] : [],
      dc: route.dc ? [ route.dc ] : [],
      startDate: moment(new Date(route.planned_time_s)).format("YYYY-MM-DD"),
      startTime: moment(new Date(route.planned_time_s)).format("HH:mm"),
    } : clearState);
  }

  handleInputChange(event, data) {
    const target = !data ? event.target : data;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState(prevState => ({ 
      [name]: Array.isArray(value)
        ? value.filter(item => !prevState[name].includes(item))
        : value
    }));
  }

  saveData() {
    const { data, fetchParams } = this.props;
    const { title, driver, car, dc, startDate, startTime } = this.state;

    const start = `${startDate}T${startTime}:00`;

    this.props.save({
      fetchParams: fetchParams(),
      pk: [data.route.id],
      title,
      car: car[0],
      dc: dc[0],
      driver: driver[0],
      plannedTimeS: moment(start).format('YYYY-MM-DDTHH:mm:ss'),
    });

    this.close();
  }

  close() {
    this.props.modalShow({ open: false, route: {} });
  }

  render() {
    const { open } = this.props.data;
    const { isLoading, drivers, cars, dcs } = this.props;
    const { title, driver, car, startDate, startTime, dc } = this.state;

    const driversOptions = drivers.map(d => ({ text: d.name, value: d.id })) || [];
    const dcOptions = dcs.map(d => ({ text: d.title, value: d.pk })) || [];
    const carsOptions = cars.map(c => ({ text: `${c.brand} - ${c.number}`, value: c.id })) || [];

    return (
      <Modal
        className="route-edit-modal" 
        open={open} >
        <Modal.Header>Редактирование маршрута</Modal.Header>
        <Modal.Content>
          {!isLoading ?
          <Form>
            <Form.Field>
              <label>Название маршрута:</label>
                <input 
                  name="title"
                  type="text"
                  value={title}
                  onChange={this.handleInputChange}
                  placeholder="Название маршрута" />
            </Form.Field>
            <Form.Field>
              <label>Распределительный центр:</label>
              <Dropdown
                fluid
                selection
                multiple
                search
                closeOnChange
                placeholder="РЦ"
                name="dc"
                value={dc}
                onChange={this.handleInputChange}
                options={dcOptions} />
            </Form.Field>
            <Form.Field>
              <label>Водитель:</label>
              <Dropdown
                fluid
                selection
                multiple
                search
                closeOnChange
                placeholder="Водители"
                name="driver"
                value={driver}
                onChange={this.handleInputChange}
                options={driversOptions} />
            </Form.Field>
            <Form.Field>
              <label>ТС:</label>
              <Dropdown
                fluid
                selection
                multiple
                search
                closeOnChange
                placeholder="ТС"
                name="car"
                value={car}
                onChange={this.handleInputChange}
                options={carsOptions} />
            </Form.Field>
            <Form.Field>
              <label>Дата отправки:</label>
                <Input 
                  onClick={e => e.stopPropagation()} 
                  onChange={this.handleInputChange}
                  value={startDate}
                  name="startDate"
                  type="date" />
            </Form.Field>
            <Form.Field>
              <label>Время отправки:</label>
                <Input 
                  onClick={e => e.stopPropagation()} 
                  onChange={this.handleInputChange}
                  value={startTime}
                  name="startTime"
                  type="time" />
            </Form.Field>
          </Form> : null}
        </Modal.Content>
        <Modal.Actions>
          <Button negative content="Отмена" onClick={() => this.close()} />
          <Button positive content="Сохранить" onClick={() => this.saveData()} />
        </Modal.Actions>
      </Modal>
    );
  }
}

ModalRouteEdit.propTypes = {
  data:        PropTypes.object,
  drivers:     PropTypes.array,
  dcs:         PropTypes.array,
  fetchParams: PropTypes.func,
  cars:        PropTypes.array,
  isLoading:   PropTypes.bool,
  save:        PropTypes.func,
  modalShow:   PropTypes.func,
};

export default ModalRouteEdit;