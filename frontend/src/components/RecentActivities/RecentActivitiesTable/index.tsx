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

import StatusItem from '../../StatusItem';

import formatDate from '../../../utils/DateUtils';

import './styles.scss';

interface TableProps {
  elements: any[];
  clickFn: Function;
  headers: string[];
}

const RecentActivitiesTable = ({ elements, clickFn, headers }: TableProps) => {
  const createTableCell = (value: any, key: string, index: number) => {
    const mapKey = `${key}-${index}`;
    switch (key) {
      case 'status':
        return (
          <TableCell key={mapKey} className="activities-table-cell">
            <StatusItem status={value} />
          </TableCell>
        );
      case 'created_at':
      case 'last_update':
      case 'last_viewed':
        return (
          <TableCell key={mapKey} className="activities-table-cell">
            {formatDate(value)}
          </TableCell>
        );
      default:
        return (
          <TableCell key={mapKey} className="activities-table-cell">
            {value}
          </TableCell>
        );
    }
  };

  return (
    <Table size="lg" className="activity-table">
      <TableHead>
        <TableRow>
          {headers.map((header, idx) => (
            <TableHeader
              key={header}
              id={`header-${header}-${idx}`}
              data-testid={`header-${header}-${idx}`}
              className="activities-table-header"
            >
              {header}
            </TableHeader>
          ))}
        </TableRow>
      </TableHead>
      <TableBody aria-live="off">
        {elements.map((item, idx) => (
          <TableRow key={hashObject(item)} id={`row${idx}`}>
            {
              Object.keys(item).map((key) => {
                if (key.toLowerCase() !== 'id') {
                  return createTableCell(item[key], key, idx);
                }
                return null;
              })
            }
            <TableCell
              className="activities-table-cell"
              tabIndex={0}
              aria-label="View more"
              onClick={() => clickFn(item.id)}
            >
              <DataViewAlt />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default RecentActivitiesTable;
