import React, { useEffect, useState } from 'react';
import {
  TableHead,
  TableRow,
  Table,
  TableHeader,
  TableBody,
  TableCell
} from '@carbon/react';

import StatusTag from '../StatusTag';
import { SeedlotDisplayType } from '../../types/SeedlotType';

import { HeaderConfig } from './constants';

interface SeedlotDataTableProps {
  seedlotData: SeedlotDisplayType[],
  navigate: Function,
  isSortable: boolean
}

const SeedlotDataTable = (
  { seedlotData, navigate, isSortable }: SeedlotDataTableProps
) => {
  const [sortThisHeader, setSortThisHeader] = useState('');
  const [sortDirection, setSortDirection] = useState('NONE');
  const [sortedData, setSortedData] = useState<SeedlotDisplayType[]>(seedlotData);

  // Without this the table will be empty after refresh.
  useEffect(() => {
    setSortedData(seedlotData);
  }, [seedlotData]);

  const sortByKey = (headerId: keyof SeedlotDisplayType, direction: string) => {
    setSortedData((prevData) => {
      if (direction === 'ASC') {
        return prevData.sort((a, b) => {
          if (a[headerId] > b[headerId]) {
            return 1;
          }
          if (a[headerId] < b[headerId]) {
            return -1;
          }
          return 0;
        });
      }
      if (direction === 'DESC') {
        return prevData.sort((a, b) => {
          if (a[headerId] < b[headerId]) {
            return 1;
          }
          if (a[headerId] > b[headerId]) {
            return -1;
          }
          return 0;
        });
      }
      return seedlotData;
    });
  };

  const handleSort = (headerId: keyof SeedlotDisplayType) => {
    let newDirection = 'NONE';
    if (sortThisHeader !== headerId || sortDirection === 'NONE') {
      newDirection = 'ASC';
    } else if (sortDirection === 'ASC') {
      newDirection = 'DESC';
    } else {
      newDirection = 'NONE';
    }

    setSortDirection(newDirection);
    sortByKey(headerId, newDirection);

    setSortThisHeader(headerId);
  };

  return (
    <Table size="lg" useZebraStyles={false} className="seedlots-table">
      <TableHead>
        <TableRow>
          {
            HeaderConfig.map((header) => (
              <TableHeader
                key={header.id}
                id={`seedlot-table-header-${header.id}`}
                isSortable={isSortable}
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
          sortedData.map((seedlot) => (
            <TableRow
              id={`seedlot-table-row-${seedlot.seedlotNumber}`}
              key={seedlot.seedlotNumber}
              onClick={() => navigate(`/seedlots/details/${seedlot.seedlotNumber}`)}
            >
              {
                HeaderConfig.map((header) => (
                  <TableCell
                    id={`seedlot-table-cell-${seedlot.seedlotNumber}-${header.id}`}
                    key={header.id}
                  >
                    {
                      header.id === 'seedlotStatus'
                        ? <StatusTag type={seedlot.seedlotStatus} />
                        : seedlot[header.id]
                    }
                  </TableCell>
                ))
              }
            </TableRow>
          ))
        }
      </TableBody>
    </Table>
  );
};

export default SeedlotDataTable;
