import React from 'react';
import { hashObject } from 'react-hash-string';

import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  Button
} from '@carbon/react';
import * as Icons from '@carbon/icons-react';

import StatusItem from '../../StatusItem';

import formatDate from '../../../utils/DateUtils';

import './styles.scss';

interface TableProps {
  elements: any[];
  clickFn: Function;
  headers: string[];
  docTable?: boolean;
}

const RecentActivitiesTable = ({
  elements,
  clickFn,
  headers,
  docTable
}: TableProps) => {
  const getFilesAndDocsIcons = (format: string) => {
    const iconSize = '18';
    switch (format) {
      case 'PDF file':
        return (
          <Icons.DocumentPdf size={iconSize} />
        );
      case 'Word file':
        return (
          <Icons.DocumentWordProcessor size={iconSize} />
        );
      default:
        return (
          <Icons.Document size={iconSize} />
        );
    }
  };

  const createTableCell = (obj: any, key: string, index: number) => {
    const mapKey = `${key}-${index}`;
    switch (key) {
      case 'status':
        return (
          <TableCell key={mapKey} className="activities-table-cell">
            <StatusItem status={obj[key]} />
          </TableCell>
        );
      case 'created_at':
      case 'last_update':
      case 'last_viewed':
        return (
          <TableCell key={mapKey} className="activities-table-cell">
            {formatDate(obj[key])}
          </TableCell>
        );
      case 'name':
        return (
          <TableCell key={mapKey} className="activities-table-cell">
            {getFilesAndDocsIcons(obj.format)}
            {obj[key]}
          </TableCell>
        );
      default:
        return (
          <TableCell key={mapKey} className="activities-table-cell">
            {obj[key]}
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
        {
          elements.map((item, idx) => (
            <TableRow key={hashObject(item)} id={`row${idx}`}>
              {
                Object.keys(item).map((key) => {
                  if (key.toLowerCase() !== 'id') {
                    return createTableCell(item, key, idx);
                  }
                  return null;
                })
              }
              <TableCell
                className="activities-table-action"
                tabIndex={0}
                aria-label="View more"
              >
                <Button
                  hasIconOnly
                  iconDescription={`View ${docTable ? 'file' : 'request'}`}
                  tooltipPosition="bottom"
                  kind="ghost"
                  onClick={() => clickFn(item.id)}
                  renderIcon={Icons.DataViewAlt}
                  size="md"
                />
                {
                  docTable
                    ? (
                      <Button
                        hasIconOnly
                        iconDescription="Download file"
                        tooltipPosition="bottom"
                        kind="ghost"
                        onClick={() => null}
                        renderIcon={Icons.Download}
                        size="md"
                      />
                    )
                    : null
                }
              </TableCell>
            </TableRow>
          ))
        }
      </TableBody>
    </Table>
  );
};

export default RecentActivitiesTable;
