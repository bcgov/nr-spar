import React from 'react';

import {
  FlexGrid,
  Row,
  Column
} from '@carbon/react';

import { Table } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import PageTitle from '../../components/PageTitle';

interface DataType {
  key: React.Key;
  name: string;
  age: number;
  address: string;
}

const columns: TableColumnsType<DataType> = [
  {
    title: 'Name',
    dataIndex: 'name',
    filters: [
      {
        text: 'Joe',
        value: 'Joe'
      },
      {
        text: 'Category 1',
        value: 'Category 1'
      },
      {
        text: 'Category 2',
        value: 'Category 2'
      }
    ],
    filterMode: 'tree',
    filterSearch: true,
    onFilter: (value, record) => record.name.startsWith(value as string),
    width: '30%'
  },
  {
    title: 'Age',
    dataIndex: 'age',
    sorter: (a, b) => a.age - b.age
  },
  {
    title: 'Address',
    dataIndex: 'address',
    filters: [
      {
        text: 'London',
        value: 'London'
      },
      {
        text: 'New York',
        value: 'New York'
      }
    ],
    onFilter: (value, record) => record.address.startsWith(value as string),
    filterSearch: true,
    width: '40%'
  }
];

const data: DataType[] = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park'
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park'
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sydney No. 1 Lake Park'
  },
  {
    key: '4',
    name: 'Jim Red',
    age: 32,
    address: 'London No. 2 Lake Park'
  },
  {
    key: '5',
    name: 'Jim Red 1',
    age: 32,
    address: 'London No. 2 Lake Park'
  },
  {
    key: '6',
    name: 'Jim Red 2',
    age: 32,
    address: 'London No. 2 Lake Park'
  },
  {
    key: '7',
    name: 'Jim Red 3',
    age: 32,
    address: 'London No. 2 Lake Park'
  },
  {
    key: '8',
    name: 'Jim Red 4',
    age: 32,
    address: 'London No. 2 Lake Park'
  },
  {
    key: '9',
    name: 'Jim Red 5',
    age: 32,
    address: 'London No. 2 Lake Park'
  },
  {
    key: '10',
    name: 'Jim Red 6',
    age: 32,
    address: 'London No. 2 Lake Park'
  },
  {
    key: '11',
    name: 'Jim Red 7',
    age: 32,
    address: 'London No. 2 Lake Park'
  }
];

const onChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter, extra) => {
  console.log('params', pagination, filters, sorter, extra);
};

const Dashboard = () => (
  <FlexGrid className="dashboard-page">
    <Row className="dashboard-row">
      <Column>
        <PageTitle
          title="Dashboard"
        />
      </Column>
    </Row>
    <Row className="dashboard-row">
      <Column>
        <Table<DataType> columns={columns} dataSource={data} onChange={onChange} />
      </Column>
    </Row>

  </FlexGrid>
);

export default Dashboard;
