/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Pagination,
  Search
} from '@carbon/react';

import StatusItem from '../../../../components/StatusItem';
import Participants from '../../../../components/Participants';
import Seedlot from '../../../../types/Seedlot';
import { headerData } from '../constants';

interface HeaderType {
  key: string,
  header: string
}

interface DataTableInterface {
  headers: HeaderType[],
  onInputChange: any,
  rows: any,
  getHeaderProps: any,
  getTableProps: any,
}

interface RowInterface {
  cells: any,
}

interface SeedlotDataTableProps {
  seedlots: Seedlot[]
}

const SeedlotDataTable = ({ seedlots }: SeedlotDataTableProps) => {
  const [firstRowIndex, setFirstRowIndex] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(20);

  const paginationOnChange = (pageSize: number, page: number) => {
    if (pageSize !== currentPageSize) {
      setCurrentPageSize(pageSize);
    }
    setFirstRowIndex(pageSize * (page - 1));
  };

  const navigate = useNavigate();

  return (

    <>
      <DataTable
        rows={seedlots.slice(firstRowIndex, firstRowIndex + currentPageSize)}
        headers={headerData}
        isSortable
      >
        {({
          rows, headers, onInputChange, getHeaderProps, getTableProps
        }: DataTableInterface) => (
          <TableContainer>
            <Search
              labelText="Search"
              onChange={onInputChange}
              placeholder="Search for seedlots"
              size="lg"
            />
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header: HeaderType) => (
                    <TableHeader {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((item: RowInterface) => (
                  <TableRow key={item.cells[0].value} onClick={() => navigate(`/seedlots/details/${item.cells[0].value}`)}>
                    <TableCell>{item.cells[0].value}</TableCell>
                    <TableCell>{`${item.cells[1].value} class`}</TableCell>
                    <TableCell>{item.cells[2].value.label}</TableCell>
                    <TableCell>{item.cells[3].value}</TableCell>
                    <TableCell>
                      <StatusItem status={item.cells[4].value} />
                    </TableCell>
                    <TableCell>
                      <Participants elements={item.cells[5].value} number={item.cells[0].value} />
                    </TableCell>
                    <TableCell>{item.cells[6].value}</TableCell>
                    <TableCell>{item.cells[7].value}</TableCell>
                    <TableCell>{item.cells[8].value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
      <Pagination
        backwardText="Previous page"
        forwardText="Next page"
        itemsPerPageText=""
        page={1}
        pageNumberText="Page Number"
        pageSize={currentPageSize}
        pageSizes={[10, 20, 30, 40, 50]}
        totalItems={seedlots.length}
        onChange={({ page, pageSize }: { page: number, pageSize: number }) => {
          paginationOnChange(pageSize, page);
        }}
      />
    </>
  );
};

export default SeedlotDataTable;
