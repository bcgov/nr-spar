import React from 'react';
import { hashObject } from 'react-hash-string';

import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell
} from '@carbon/react';
import { DataViewAlt } from '@carbon/icons-react';

import StatusItem from '../StatusItem';

import Activity from '../../types/Activity';

import './styles.css';

interface TableProps {
  elements: Activity[];
  clickFn: Function;
  headers: string[];
}

const ActivityTable = ({ elements, clickFn, headers }: TableProps) => (
  <Table size="lg" useZebraStyles={false} className="activity-table">
    <TableHead>
      <TableRow>
        {headers.map((header, idx) => (
          <TableHeader
            key={header}
            id={`header-${header}-${idx}`}
            data-testid={`header-${header}-${idx}`}
          >
            {header}
          </TableHeader>
        ))}
      </TableRow>
    </TableHead>
    <TableBody>
      {elements.map((item, idx) => (
        <TableRow key={hashObject(item)} id={`row${idx}`}>
          <TableCell>{item.type}</TableCell>
          <TableCell>
            <StatusItem status={item.status} />
          </TableCell>
          <TableCell>{item.request_id}</TableCell>
          <TableCell>{item.created_at}</TableCell>
          <TableCell>{item.last_viewed}</TableCell>
          <TableCell>
            <DataViewAlt onClick={() => clickFn(item.request_id)} />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default ActivityTable;
