import React from 'react';
import { Table } from 'semantic-ui-react';
import { pprintSeconds } from '../utils';


const Overview = ({ data }) => (
  <Table size="small" compact="very" striped attached={top}>
    <Table.Body>
      <Table.Row>
        <Table.Cell>Общее расстояние</Table.Cell>
        <Table.Cell textAlign="right">{data.distance.toFixed()}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Общее время</Table.Cell>
        <Table.Cell textAlign="right">{pprintSeconds(data.duration)}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Общее количество ТТ</Table.Cell>
        <Table.Cell textAlign="right">{data.count}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Общее количество РНК</Table.Cell>
        <Table.Cell textAlign="right">{data.countRNK}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Общее масса</Table.Cell>
        <Table.Cell textAlign="right">{data.weightAll.toFixed()}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Общее объем</Table.Cell>
        <Table.Cell textAlign="right">{data.volumeAll.toFixed(3)}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Удельный пробег на ТТ</Table.Cell>
        <Table.Cell textAlign="right">
          {data.count > 0 ? (data.distance / data.count).toFixed() : '-'}
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Удельный пробег на маршрут</Table.Cell>
        <Table.Cell textAlign="right">
          {data.routeCount !== 0 ? (data.distance / data.routeCount).toFixed() : '-'}
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Среднее кол-во ТТ в маршруте</Table.Cell>
        <Table.Cell textAlign="right">
          {data.routeCount !== 0 ? (data.count / data.routeCount).toFixed() : '-'}
        </Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
);


export default Overview;
