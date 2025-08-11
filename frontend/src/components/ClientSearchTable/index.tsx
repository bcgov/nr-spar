import React, { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import {
  TableHead,
  TableRow,
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableSelectRow,
  Pagination,
  DataTableSkeleton
} from '@carbon/react';

import prefix from '../../styles/classPrefix';
import { ForestClientSearchType } from '../../types/ForestClientTypes/ForestClientSearchType';
import PaginationChangeType from '../../types/PaginationChangeType';
import { getForestClientFullName } from '../../utils/ForestClientUtils';

import EmptySection from '../EmptySection';

import { DEFAULT_PAGE_NUM, DEFAULT_PAGE_SIZE, TableHeaders } from './constants';
import { sortByKey } from './utils';
import { ClientSearchTableProps, HeaderObjType } from './definitions';

import './styles.scss';

const ClientSearchTable = (
  {
    clientData,
    showPagination,
    selectClientFn,
    currentSelected,
    mutationFn
  }: ClientSearchTableProps
) => {
  const [sortThisHeader, setSortThisHeader] = useState<keyof ForestClientSearchType | null>(null);
  const [sortDirection, setSortDirection] = useState('NONE');
  const [processedData, setProcessedData] = useState<ForestClientSearchType[]>(clientData);

  const [currPageNumber, setCurrPageNumber] = useState<number>(DEFAULT_PAGE_NUM);
  const [currPageSize, setCurrPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  const sliceData = (pageNum: number, pageSize: number, data?: ForestClientSearchType[]) => {
    const dataToSlice = data ?? clientData;
    return dataToSlice
      .slice((pageNum - 1) * pageSize).slice(0, pageSize);
  };

  const handlePagination = (paginationObj: PaginationChangeType) => {
    setCurrPageNumber(paginationObj.page - 1);
    setCurrPageSize(paginationObj.pageSize);
    setProcessedData(
      sliceData(paginationObj.page, paginationObj.pageSize)
    );
  };

  useEffect(() => {
    setCurrPageNumber(DEFAULT_PAGE_NUM);
    setCurrPageSize(DEFAULT_PAGE_SIZE);
    setProcessedData(
      sliceData(DEFAULT_PAGE_NUM, DEFAULT_PAGE_SIZE)
    );
  }, [clientData]);

  const handleSort = (headerId: keyof ForestClientSearchType) => {
    let newDirection = 'NONE';
    if (sortThisHeader !== headerId || sortDirection === 'NONE') {
      newDirection = 'ASC';
    } else if (sortDirection === 'ASC') {
      newDirection = 'DESC';
    } else {
      newDirection = 'NONE';
    }

    setSortDirection(newDirection);
    setSortThisHeader(headerId);

    const sorted = sortByKey(clientData, headerId, newDirection);

    const sliced = sliceData(currPageNumber + 1, currPageSize, sorted);

    setProcessedData(sliced);
  };

  if (mutationFn?.status === 'pending') {
    return (
      <DataTableSkeleton
        showToolbar={false}
        showHeader={false}
      />
    );
  }

  if (mutationFn?.status === 'error') {
    const error = mutationFn.error as AxiosError;
    return (
      <EmptySection
        pictogram="FaceVeryDissatisfied"
        title="An unexpected error occuried"
        description={(
          <span>
            Something went wrong while trying to search for users...
            <br />
            Error Message:
            {` ${error.message}`}
          </span>
        )}
      />
    );
  }

  if (mutationFn?.status === 'idle') {
    return (
      <EmptySection
        pictogram="Summit"
        title="Nothing to show yet!"
        description={(
          <span>
            Start by searching for a client or agency acronym,
            <br />
            number, or name. The matching results will be
            <br />
            shown here.
          </span>
        )}
      />
    );
  }

  return (
    <>
      <Table size="lg" useZebraStyles={false} className="client-table">
        <TableHead className="client-table-header">
          <TableRow>
            {/* Empty table header to fit the radio button
                correctly */}
            <TableHeader className="radiobutton-header" aria-label="placeholder for layout purposes" />
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
        <TableBody className="client-results-table">
          {
            processedData.length
              ? processedData.map((client) => (
                <TableRow
                  id={`client-table-row-${client.clientNumber}-${client.locationCode}`}
                  key={`${client.clientNumber}-${client.locationCode}`}
                  className={client === currentSelected ? `${prefix}--data-table--selected` : ''}
                >
                  {
                    typeof selectClientFn === 'function'
                      ? (
                        <TableSelectRow
                          radio
                          ariaLabel={`Select client ${client.clientName} with location code ${client.locationCode}`}
                          id={`client-radio-${client.clientNumber}-${client.locationCode}`}
                          name={`client-radio-${client.clientNumber}-${client.locationCode}`}
                          checked={client === currentSelected}
                          onSelect={() => {
                            selectClientFn(client);
                          }}
                        />
                      )
                      : null
                  }
                  {
                    TableHeaders.map((header) => (
                      <TableCell
                        id={`client-table-cell-${client.clientNumber}-${client.locationCode}-${header.id}`}
                        key={header.id}
                      >
                        {
                          header.id === 'clientName'
                            ? getForestClientFullName(client)
                            : client[header.id]
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
        !clientData.length && mutationFn?.status === 'success'
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
        showPagination && clientData.length > 10
          ? (
            <Pagination
              className="general-data-table-pagination"
              page={currPageNumber + 1}
              pageSize={currPageSize}
              pageSizes={[10, 20, 30, 40, 50]}
              itemsPerPageText=""
              totalItems={clientData.length ?? 0}
              onChange={
                (paginationObj: PaginationChangeType) => {
                  handlePagination(paginationObj);
                }
              }
            />
          )
          : null
      }
    </>
  );
};

export default ClientSearchTable;
