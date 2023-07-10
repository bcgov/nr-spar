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

import './styles.scss';

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
            className="recent-activities-header"
          >
            {header}
          </TableHeader>
        ))}
      </TableRow>
    </TableHead>
    <TableBody aria-live="off">
      {elements.map((item, idx) => (
        <TableRow key={hashObject(item)} id={`row${idx}`}>
          <TableCell className="recent-activities-header">{item.type}</TableCell>
          <TableCell className="recent-activities-header">
            <StatusItem status={item.status} />
          </TableCell>
          <TableCell className="recent-activities-header">
            {item.request_id}
          </TableCell>
          <TableCell className="recent-activities-header">
            {item.created_at}
          </TableCell>
          <TableCell className="recent-activities-header">
            {item.last_viewed}
          </TableCell>
          <TableCell
            className="recent-activities-header"
            tabIndex={0}
            aria-label={`${item.type} view more`}
            onClick={() => clickFn(item.request_id)}
          >
            <DataViewAlt />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default ActivityTable;
