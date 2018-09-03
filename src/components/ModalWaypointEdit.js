import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Form, TextArea, Checkbox, Divider } from 'semantic-ui-react';
import GoogleMap from './GoogleMap';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';

const clear_state = { 
  kontragent_id1: '',
  id1: '',
  kontragent_title: '',
  title: '',
  address: '',
  lat: '',
  lng: '',
  delivery_time_s: '',
  delivery_time_e: '',
  position: false,
  location_floor: '',
  distance: '',
  porter: false,
  center: null,
  search: '',
  service_time: '',
  volume: '',
  weight: '',
  doc_delivery_time_s: '',
  doc_delivery_time_e: '',
};

class ModalWaypointEdit extends React.Component {

  constructor() {
    super();

    this.handleInputChange =  this.handleInputChange.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleSearchSelect = this.handleSearchSelect.bind(this);
    this.dragEnd =            this.dragEnd.bind(this);
    this.handleWaypoint =     this.handleWaypoint.bind(this);

    this.state = clear_state;
  }

  componentDidUpdate(prevProps) {
    const { open } = prevProps.data;

    if (open != this.props.data.open && !open) {
      let { waypoint } = this.props.data;

      waypoint = waypoint 
        ? { 
          ...waypoint.doc.waypoint,  
          pk: waypoint.id,
          service_time: waypoint.service_time,
          volume: waypoint.doc.volume,
          weight: waypoint.doc.weight,
          doc_delivery_time_s: waypoint.doc.delivery_time_s,
          doc_delivery_time_e: waypoint.doc.delivery_time_e,
        } : null;

      this.handleWaypoint(waypoint);
    }
  }

  handleWaypoint(waypoint) {
    this.setState(!waypoint ? clear_state : {
      ...clear_state,
      pk: waypoint.pk,
      kontragent_id1: waypoint.kontragent_id1,
      id1: waypoint.id1,
      kontragent_title: waypoint.kontragent_title,
      title: waypoint.title,
      address: waypoint.address,
      lat: waypoint.lat,
      lng: waypoint.lng,
      delivery_time_s: waypoint.delivery_time_s,
      delivery_time_e: waypoint.delivery_time_e,
      position: waypoint.position,
      location_floor: waypoint.location_floor,
      distance: waypoint.distance,
      porter: waypoint.porter,
      service_time: (waypoint.service_time / 60).toFixed(),
      volume: waypoint.volume,
      weight: waypoint.weight,
      doc_delivery_time_s: waypoint.doc_delivery_time_s,
      doc_delivery_time_e: waypoint.doc_delivery_time_e,
    });
  }

  handleSearchChange(search) {
    this.setState({ search });
  }

  handleSearchSelect(search) {
    geocodeByAddress(search)
      .then(results => {
        this.setState({ search: results[0].formatted_address });
        return getLatLng(results[0]);
      }).then(latLng => this.setState({ ...latLng, center: latLng }))
      .catch(error => window.notify.error(error, 'Ошибка'));
  }

  dragEnd(event) {
    const lat = event.latLng.lat(), lng = event.latLng.lng();
    if (lat && lng) this.setState({ lat, lng });
  }

  handleInputChange(event, data) {
    const target = !data ? event.target : data;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({ [name]: value });
  }

  render() {
    const { open } = this.props.data;

    return (
      <Modal 
        className="waypoint-edit-modal" 
        open={open} >
        <Modal.Header>Редактирование торговой точки</Modal.Header>
        <Modal.Content style={{ marginLeft: '0' }}>
          <Form>
            <Form.Field>
              <label>
                Код контрагента в 1С:
                <input 
                  name="kontragent_id1"
                  type="number"
                  value={this.state.kontragent_id1}
                  onChange={this.handleInputChange}
                  placeholder="Код контрагента в 1С" />
              </label>
            </Form.Field>
            <Form.Field>
              <label>
                Код ТТ в 1С:
                <input 
                  name="id1"
                  type="text"
                  value={this.state.id1}
                  onChange={this.handleInputChange}
                  placeholder="Код ТТ в 1С" />
              </label>
            </Form.Field>
            <Form.Field>
              <label>
                Название контрагента:
                <input 
                  name="kontragent_title"
                  type="text"
                  value={this.state.kontragent_title}
                  onChange={this.handleInputChange}
                  placeholder="Название контрагента" />
              </label>
            </Form.Field>
            <Form.Field>
              <label>
                Название ТТ:
                <input 
                  name="title"
                  type="text"
                  value={this.state.title}
                  onChange={this.handleInputChange}
                  placeholder="Название ТТ" />
              </label>
            </Form.Field>
            <Form.Field>
              <label>
                Адрес:
                <TextArea 
                  name="address"
                  autoHeight
                  value={this.state.address}
                  onChange={this.handleInputChange}
                  placeholder="Адрес" />
              </label>
            </Form.Field>
            <Form.Field>
              <label>
                Широта:
                <input 
                  name="lat"
                  type="number"
                  value={this.state.lat}
                  onChange={this.handleInputChange}
                  placeholder="Широта" />
              </label>
            </Form.Field>
            <Form.Field>
              <label>
                Долгота:
                <input 
                  name="lng"
                  type="number"
                  value={this.state.lng}
                  onChange={this.handleInputChange}
                  placeholder="Долгота" />
              </label>
            </Form.Field>
            <Form.Field>
              <label>
                Прием с:
                <input 
                  name="delivery_time_s"
                  type="time"
                  value={this.state.delivery_time_s}
                  onChange={this.handleInputChange}
                  placeholder="Прием с" />
              </label>
            </Form.Field>
            <Form.Field>
              <label>
                Прием по:
                <input 
                  name="delivery_time_e"
                  type="time"
                  value={this.state.delivery_time_e}
                  onChange={this.handleInputChange}
                  placeholder="Прием по" />
              </label>
            </Form.Field>
            <Form.Field>
              <Checkbox 
                name="position"
                type="checkbox"
                checked={this.state.position}
                onChange={this.handleInputChange}
                label="По позиционная сдача" />
            </Form.Field>
            <Form.Field>
              <label>
                Этаж (подвал):
                <input 
                  name="location_floor"
                  type="number"
                  value={this.state.location_floor}
                  onChange={this.handleInputChange}
                  placeholder="Этаж (подвал)" />
              </label>
            </Form.Field>
            <Form.Field>
              <label>
                Расстояние от парковки до разгрузки:
                <input 
                  name="distance"
                  type="text"
                  value={this.state.distance}
                  onChange={this.handleInputChange}
                  placeholder="Расстояние от парковки до разгрузки" />
              </label>
            </Form.Field>
            <Form.Field>
              <Checkbox 
                name="porter"
                type="checkbox"
                checked={this.state.porter}
                onChange={this.handleInputChange}
                label="Наличие грузчика" />
            </Form.Field>
            <Divider />
            <label>Изменение накладной</label>
            <Form.Field>
              <label>
                Время приема (в мин):
                <input 
                  name="service_time"
                  type="number"
                  value={this.state.service_time}
                  onChange={this.handleInputChange} />
              </label>
            </Form.Field>
            <Form.Field>
              <label>
                Объём:
                <input 
                  name="volume"
                  type="number"
                  value={this.state.volume}
                  onChange={this.handleInputChange}
                  placeholder="Объём" />
              </label>
            </Form.Field>
            <Form.Field>
              <label>
                Вес:
                <input 
                  name="weight"
                  type="number"
                  value={this.state.weight}
                  onChange={this.handleInputChange}
                  placeholder="Вес" />
              </label>
            </Form.Field>
            <Form.Field>
              <label>
                Время приема с:
                <input 
                  name="doc_delivery_time_s"
                  type="time"
                  value={this.state.doc_delivery_time_s}
                  onChange={this.handleInputChange} />
              </label>
            </Form.Field>
            <Form.Field>
              <label>
                Время приема по:
                <input 
                  name="doc_delivery_time_e"
                  type="time"
                  value={this.state.doc_delivery_time_e}
                  onChange={this.handleInputChange} />
              </label>
            </Form.Field>
          </Form>

          <PlacesAutocomplete
            value={this.state.search}
            onError={(status, clearSuggestions) => clearSuggestions()}
            shouldFetchSuggestions={this.state.search.length > 3}
            onChange={this.handleSearchChange}
            onSelect={this.handleSearchSelect} >
              {({ getInputProps, suggestions, getSuggestionItemProps }) => (
                <div className="search-bar-container">
                  <div className="search-input-container">
                    <input
                      {...getInputProps({
                        placeholder: 'Поиск по адресу ...',
                        className: 'location-search-input'
                      })}
                    />
                    <div className="autocomplete-container">
                      {suggestions.map((suggestion, index) => {
                        const className = suggestion.active ? 'suggestion-item--active' : 'suggestion-item';
                        return (
                          <div key={`item${index}`}{...getSuggestionItemProps(suggestion, { className })}>
                            <span>{suggestion.description}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
          </PlacesAutocomplete>
          <GoogleMap
            containerElement={<div className="map" />}
            mapElement={<div style={{ height: "60vh" }} />}
            dragEnd={this.dragEnd}
            lockMap={false}
            markers={this.state.lat == '' || this.state.lng == '' ? null :[{
              id: 1,
              lat: this.state.lat,
              lng: this.state.lng,
            }]}
            center={this.state.center || this.props.center} />
        </Modal.Content>
        <Modal.Actions className="bottom-side">
          <Button negative content="Отмена" onClick={() => this.props.modalShow({ open: false, waypoint: {} })}/>
          <Button positive content="Сохранить" onClick={() => {
              this.props.save(this.state);
              this.props.modalShow({ open: false, waypoint: {} });
            }}/>
        </Modal.Actions>
      </Modal>
    );
  }
}

ModalWaypointEdit.propTypes = {
  modalShow: PropTypes.func,
  save:      PropTypes.func,
  data:      PropTypes.object,
  center:    PropTypes.object,
};

export default ModalWaypointEdit;