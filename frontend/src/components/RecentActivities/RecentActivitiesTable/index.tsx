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

import StatusTag from '../../StatusTag';

import { formatDate } from '../../../utils/DateUtils';

import ActivityIcons from '../../../enums/ActivityIcons';
import FilesAndDocsIcons from '../../../enums/FilesAndDocsIcons';

import './styles.scss';

interface TableProps {
  elements: any[];
  clickFn: Function;
  headers: string[];
  isDocTable?: boolean;
}

const RecentActivitiesTable = ({
  elements,
  clickFn,
  headers,
  isDocTable
}: TableProps) => {
  const iconSize = '18';

  const writeFileFormat = (format: string) => `${format} file`;

  const createTableCell = (obj: any, key: string, index: number) => {
    const mapKey = `${key}-${index}`;
    let Img;
    switch (key) {
      case 'status':
        return (
          <TableCell key={mapKey} className="activities-table-cell">
            <StatusTag type={obj[key]} />
          </TableCell>
        );
      case 'createdAt':
      case 'lastUpdate':
      case 'lastViewed':
        return (
          <TableCell key={mapKey} className="activities-table-cell">
            {formatDate(obj[key])}
          </TableCell>
        );
      case 'name':
        Img = Icons[
          FilesAndDocsIcons[obj.format]
            ? FilesAndDocsIcons[obj.format]
            : FilesAndDocsIcons.GENERIC
        ];
        return (
          <TableCell key={mapKey} className="activities-table-cell">
            <Img size={iconSize} />
            {obj[key]}
          </TableCell>
        );
      case 'format':
        return (
          <TableCell key={mapKey} className="activities-table-cell">
            {writeFileFormat(obj[key])}
          </TableCell>
        );
      case 'activity':
        Img = Icons[ActivityIcons[obj.type]];
        return (
          <TableCell key={mapKey} className="activities-table-cell">
            <Img size={iconSize} />
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
          {headers.map((header) => (
            <TableHeader
              key={header}
              id={`header-${header.toLowerCase().replace(' ', '-')}`}
              data-testid={`header-${header.toLowerCase().replace(' ', '-')}`}
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
                  if (key.toLowerCase() !== 'id' && key.toLowerCase() !== 'type') {
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
                  iconDescription={`View ${isDocTable ? 'file' : 'request'}`}
                  tooltipPosition="bottom"
                  kind="ghost"
                  onClick={() => clickFn(item.id)}
                  renderIcon={Icons.DataViewAlt}
                  size="md"
                />
                {
                  isDocTable
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
