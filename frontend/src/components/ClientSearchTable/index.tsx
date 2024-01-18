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

import { ForestClientDisplayType } from '../../types/ForestClientTypes/ForestClientDisplayType';

import { TableHeaders } from './constants';
import { sortByKey } from './utils';
import { ClientSearchTableProps, HeaderObjType } from './definitions';

const ClientSearchTable = (
  {
    clientData,
    showPagination,
    tablePagination
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

  return (
    <>
      <Table size="lg" useZebraStyles={false} className="client-table">
        <TableHead>
          <TableRow>
            {/* Empty table header to fit the radio button
                correctly */}
            <TableHeader />
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
            processedData.map((client) => (
              <TableRow
                id={`client-table-row-${client.number}-${client.locationCode}`}
                key={`${client.number}-${client.locationCode}`}
              >
                <TableSelectRow
                  radio
                  ariaLabel={`Select client ${client.fullName} with location code ${client.locationCode}`}
                  id={`client-radio-${client.number}-${client.locationCode}`}
                  name={`client-radio-${client.number}-${client.locationCode}`}
                  checked={false}
                  onSelect={() => null}
                />
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
          }
        </TableBody>
      </Table>
      {
        showPagination
          ? tablePagination
          : null
      }
    </>
  );
};

export default ClientSearchTable;
