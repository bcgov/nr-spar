import React from 'react';
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

const renderTable = (
  seedlotData: SeedlotDisplayType[],
  navigate: Function
) => (
  <Table size="lg" useZebraStyles={false} className="seedlots-table">
    <TableHead>
      <TableRow>
        {
          HeaderConfig.map((header) => (
            <TableHeader
              key={header.id}
              id={`seedlot-table-header-${header.id}`}
            >
              {header.label}
            </TableHeader>
          ))
        }
      </TableRow>
    </TableHead>
    <TableBody>
      {
        seedlotData.map((seedlot) => (
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

export default renderTable;
