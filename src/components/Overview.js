import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'semantic-ui-react';
import { pprintSeconds } from '../utils';

const Overview = ({ data }) => (
  <Table id="table-overview" style={{ fontSize: '10px' }} size="small" compact="very" celled attached="top">
    <Table.Body>
      <Table.Row>
        <Table.Cell>Общ. расстояние</Table.Cell>
        <Table.Cell className="td-bold">{(data.distance).toFixed(1)}</Table.Cell>
        <Table.Cell>Ср. вес заявки</Table.Cell>
        <Table.Cell className="td-bold">{data.count > 0 ? (data.weightAll / (data.count * 1000)).toFixed(3) : '-'}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Общ. время</Table.Cell>
        <Table.Cell className="td-bold">{pprintSeconds(data.duration)}</Table.Cell>
        <Table.Cell>Ср. кол ТТ на ТС</Table.Cell>
        <Table.Cell className="td-bold">{data.cars.length > 0 ? (data.count / data.cars.length).toFixed(1) : '-'}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Общ. кол-во ТТ</Table.Cell>
        <Table.Cell className="td-bold">{data.count}</Table.Cell>
        <Table.Cell>Ср. кол ТТ на рейс</Table.Cell>
        <Table.Cell className="td-bold">{data.routeCount > 0 ? (data.count / data.routeCount).toFixed(1) : '-'}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Общ. кол-во РНК</Table.Cell>
        <Table.Cell className="td-bold">{data.countRNK}</Table.Cell>
        <Table.Cell>Ср. пробег на ТТ</Table.Cell>
        <Table.Cell className="td-bold">{data.count > 0 ? (data.distance / data.count).toFixed(1) : '-'}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Общ. масса (т)</Table.Cell>
        <Table.Cell className="td-bold">{(data.weightAll / 1000).toFixed(1)}</Table.Cell>
        <Table.Cell>Ср. пробег за рейс</Table.Cell>
        <Table.Cell className="td-bold">{data.routeCount > 0 ? (data.distance / data.routeCount).toFixed(1) : '-'}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Общ. объем (м3)</Table.Cell>
        <Table.Cell className="td-bold">{data.volumeAll.toFixed(1)}</Table.Cell>
        <Table.Cell>Ср. загрузка ТС (т)</Table.Cell>
        <Table.Cell className="td-bold">{data.cars.length > 0 ? (data.weightAll / (data.cars.length * 1000)).toFixed(1) : '-'}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Кол-во ТС</Table.Cell>
        <Table.Cell className="td-bold">{data.cars.length}</Table.Cell>
        <Table.Cell>Ср. время водителя</Table.Cell>
        <Table.Cell className="td-bold">{data.routeCount > 0 ? pprintSeconds(data.duration / data.routeCount) : '-'}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Кол-во рейсов</Table.Cell>
        <Table.Cell className="td-bold">{data.routeCount}</Table.Cell>
        <Table.Cell>Вр. время на ТТ</Table.Cell>
        <Table.Cell className="td-bold">{data.routeCount > 0 && data.cars.length > 0 ? ((data.duration / data.routeCount) / (data.count / data.cars.length * 60)).toFixed() : '-'}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell />
        <Table.Cell className="td-bold" />
        <Table.Cell>Вторые рейсы</Table.Cell>
        <Table.Cell className="td-bold">{data.routeCount - data.cars.length}</Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
);

Overview.propTypes = {
  data: PropTypes.object,
};

export default Overview;
