import React, { useEffect, useState } from 'react';
import {
  TableHead,
  TableRow,
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableSelectRow
} from '@carbon/react';

import EmptySection from '../EmptySection';

import { ForestClientDisplayType } from '../../types/ForestClientTypes/ForestClientDisplayType';

import { TableHeaders } from './constants';
import { sortByKey } from './utils';
import { ClientSearchTableProps, HeaderObjType } from './definitions';

import './styles.scss';

const ClientSearchTable = (
  {
    clientData,
    showPagination,
    tablePagination,
    selectClientFn,
    currentSelected
  }: ClientSearchTableProps
) => {
  const [sortThisHeader, setSortThisHeader] = useState<keyof ForestClientDisplayType | null>(null);
  const [sortDirection, setSortDirection] = useState('NONE');
  const [processedData, setProcessedData] = useState<ForestClientDisplayType[]>(clientData);

  // Without this the table will be empty after refresh.
  useEffect(() => {
    setProcessedData(clientData);
  }, [clientData]);

  const handleSort = (headerId: keyof ForestClientDisplayType) => {
    let newDirection = 'NONE';
    if (sortThisHeader !== headerId || sortDirection === 'NONE') {
      newDirection = 'ASC';
    } else if (sortDirection === 'ASC') {
      newDirection = 'DESC';
    } else {
      newDirection = 'NONE';
    }

    setSortDirection(newDirection);
    setProcessedData((prevData) => sortByKey(prevData, headerId, newDirection));
    setSortThisHeader(headerId);
  };

  const renderRadioSelect = (client: ForestClientDisplayType) => {
    if (typeof selectClientFn === 'function') {
      return (
        <TableSelectRow
          radio
          ariaLabel={`Select client ${client.fullName} with location code ${client.locationCode}`}
          id={`client-radio-${client.number}-${client.locationCode}`}
          name="client-radio"
          checked={client === currentSelected}
          onSelect={() => {
            selectClientFn(client);
          }}
        />
      );
    }
    return null;
  };

  return (
    <>
      <Table size="lg" useZebraStyles={false} className="client-table">
        <TableHead className="client-table-header">
          <TableRow>
            {/* Empty table header to fit the radio button
                correctly */}
            <TableHeader className="radiobutton-header" />
            {
              TableHeaders.map((header: HeaderObjType) => (
                <TableHeader
                  key={header.id}
                  id={`client-table-header-${header.id}`}
                  isSortable
                  isSortHeader={sortThisHeader === header.id}
                  onClick={() => handleSort(header.id)}
                  sortDirection={sortDirection}
                >
                  {header.label}
                </TableHeader>
              ))
            }
          </TableRow>
        </TableHead>
        <TableBody>
          {
            processedData.length
              ? processedData.map((client) => (
                <TableRow
                  id={`client-table-row-${client.number}-${client.locationCode}`}
                  key={`${client.number}-${client.locationCode}`}
                >
                  {
                    renderRadioSelect(client)
                  }
                  {
                    TableHeaders.map((header) => (
                      <TableCell
                        id={`client-table-cell-${client.number}-${client.locationCode}-${header.id}`}
                        key={header.id}
                      >
                        {
                          client[header.id]
                        }
                      </TableCell>
                    ))
                  }
                </TableRow>
              ))
              : null
          }
        </TableBody>
      </Table>
      {/* Adding this empty component outside of the table
          so we don't have  to make a lot of style changes
          worry about DOM tags */}
      {
        !processedData.length
          ? (
            <EmptySection
              pictogram="UserSearch"
              title="No results found!"
              description="Nothing found for your search, try adjusting it to find what you want."
            />
          )
          : null
      }
      {
        showPagination
          ? tablePagination
          : null
      }
    </>
  );
};

export default ClientSearchTable;
