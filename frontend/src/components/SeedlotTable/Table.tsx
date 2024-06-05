import React, { useEffect, useState } from 'react';
import {
  TableHead,
  TableRow,
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableToolbarSearch
} from '@carbon/react';

import StatusTag from '../StatusTag';
import { SeedlotDisplayType } from '../../types/SeedlotType';

import { ExclusiveAdminRows, HeaderConfig } from './constants';
import { sortByKey } from './utils';
import { SeedlotDataTableProps } from './definitions';
import ROUTES from '../../routes/constants';
import { addParamToPath } from '../../utils/PathUtils';

const SeedlotDataTable = (
  {
    seedlotData,
    navigate,
    isSortable,
    showSearch,
    showPagination,
    tablePagination,
    isTscAdmin
  }: SeedlotDataTableProps
) => {
  const [sortThisHeader, setSortThisHeader] = useState<keyof SeedlotDisplayType | null>(null);
  const [sortDirection, setSortDirection] = useState('NONE');
  const [processedData, setProcessedData] = useState<SeedlotDisplayType[]>(seedlotData);

  // Without this the table will be empty after refresh.
  useEffect(() => {
    setProcessedData(seedlotData);
  }, [seedlotData]);

  useEffect(() => {
    if (!isTscAdmin) {
      HeaderConfig.filter((header) => !ExclusiveAdminRows.includes(header.id));
    }
  }, []);

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
    setProcessedData((prevData) => sortByKey(prevData, headerId, newDirection));

    setSortThisHeader(headerId);
  };

  const handleSearch = (searchValue: string) => {
    if (!searchValue) {
      setProcessedData(sortByKey(seedlotData, sortThisHeader, sortDirection));
      return;
    }
    const searchString = searchValue.toLowerCase();
    setProcessedData((prevData) => {
      const filtered = prevData.filter((seedlot) => {
        const keys = Object.keys(seedlot) as (keyof SeedlotDisplayType)[];
        let hasMatch: boolean = false;
        keys.forEach((key) => {
          if (seedlot[key].toLowerCase().includes(searchString)) {
            hasMatch = true;
          }
        });
        return hasMatch;
      });
      if (filtered.length > 0) {
        return sortByKey(filtered, sortThisHeader, sortDirection);
      }
      return filtered;
    });
  };

  return (
    <>
      {
        showSearch
          ? (
            <TableToolbarSearch
              persistent
              placeholder="Search for seedlots"
              onChange={
                (a: React.ChangeEvent<HTMLInputElement>) => handleSearch(a.target.value)
              }
            />
          )
          : null
      }
      <Table size="lg" useZebraStyles={false} className="seedlot-data-table">
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
            processedData.map((seedlot) => (
              <TableRow
                id={`seedlot-table-row-${seedlot.seedlotNumber}`}
                key={seedlot.seedlotNumber}
                onClick={() => navigate(addParamToPath(ROUTES.SEEDLOT_DETAILS, seedlot.seedlotNumber ?? ''))}
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
      {
        showPagination
          ? tablePagination
          : null
      }
    </>
  );
};

export default SeedlotDataTable;
