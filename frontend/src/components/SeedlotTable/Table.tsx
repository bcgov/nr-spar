import React, { useEffect, useState } from 'react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
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
import { getForestClientByNumberOrAcronym } from '../../api-service/forestClientsAPI';
import { SeedlotDisplayType } from '../../types/SeedlotType';
import { ForestClientType } from '../../types/ForestClientTypes/ForestClientType';
import ROUTES from '../../routes/constants';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../config/TimeUnits';
import { addParamToPath } from '../../utils/PathUtils';

import { ExclusiveAdminRows, HeaderConfig } from './constants';
import { sortSeedlotsByKey } from './utils';
import { HeaderObj, SeedlotDataTableProps } from './definitions';

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
  const [sortDirection, setSortDirection] = useState<'NONE' | 'ASC' | 'DESC'>('NONE');
  const [processedData, setProcessedData] = useState<SeedlotDisplayType[]>(seedlotData);

  // Without this the table will be empty after refresh.
  useEffect(() => {
    setProcessedData(seedlotData);
  }, [seedlotData]);

  const handleSort = (headerId: keyof SeedlotDisplayType) => {
    let newDirection: 'NONE' | 'ASC' | 'DESC' = 'NONE';
    if (sortThisHeader !== headerId || sortDirection === 'NONE') {
      newDirection = 'ASC';
    } else if (sortDirection === 'ASC') {
      newDirection = 'DESC';
    } else {
      newDirection = 'NONE';
    }

    setSortDirection(newDirection);
    setProcessedData(sortSeedlotsByKey(seedlotData, headerId, newDirection));
    setSortThisHeader(headerId);
  };

  const handleSearch = (searchValue: string) => {
    if (!searchValue) {
      setProcessedData(sortSeedlotsByKey(seedlotData, sortThisHeader, sortDirection));
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
        return sortSeedlotsByKey(filtered, sortThisHeader, sortDirection);
      }
      return filtered;
    });
  };

  const uniqueAgencies = Array.from(new Set(seedlotData.map((seedlot) => seedlot.applicantAgency)));

  const clientDataQuery = useQueries({
    queries: uniqueAgencies.map((applicantAgency) => ({
      queryKey: ['forest-clients', applicantAgency],
      queryFn: () => getForestClientByNumberOrAcronym(applicantAgency),
      enabled: isTscAdmin,
      staleTime: THREE_HOURS,
      gcTime: THREE_HALF_HOURS
    }))
  });

  const qc = useQueryClient();

  const displayTableData = (seedlot: SeedlotDisplayType, curHeader: HeaderObj) => {
    if (curHeader.id === 'applicantAgency' && clientDataQuery && clientDataQuery.every((client) => client.isSuccess)) {
      const clientData: ForestClientType | undefined = qc.getQueryData(['forest-clients', seedlot.applicantAgency]);
      return clientData?.clientName || seedlot[curHeader.id];
    }
    return seedlot[curHeader.id];
  };

  return (
    <>
      {
        showSearch
          ? (
            <TableToolbarSearch
              className={isTscAdmin ? 'tsc-admin-background' : ''}
              persistent
              placeholder="Filter seedlots"
              onChange={
                (a: React.ChangeEvent<HTMLInputElement>) => handleSearch(a.target.value)
              }
            />
          )
          : null
      }
      <Table size="lg" useZebraStyles className="seedlot-data-table">
        <TableHead>
          <TableRow>
            {
              HeaderConfig.filter(
                (header) => (
                  isTscAdmin
                    ? true
                    : !ExclusiveAdminRows.includes(header.id))
              ).map((header) => (
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
                  HeaderConfig.filter(
                    (header) => (
                      isTscAdmin
                        ? true
                        : !ExclusiveAdminRows.includes(header.id))
                  ).map((header) => (
                    <TableCell
                      id={`seedlot-table-cell-${seedlot.seedlotNumber}-${header.id}`}
                      key={header.id}
                    >
                      {
                        header.id === 'seedlotStatus'
                          ? <StatusTag type={seedlot.seedlotStatus} />
                          : displayTableData(seedlot, header)
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
