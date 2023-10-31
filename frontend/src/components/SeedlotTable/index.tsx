import React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell
} from '@carbon/react';

import { SeedlotDisplayType } from '../../types/SeedlotType';

import './styles.scss';
import { HeaderConfig } from './constants';
import StatusTag from '../StatusTag';

interface TableProps {
  seedlots: SeedlotDisplayType[];
}

const SeedlotTable = ({ seedlots }: TableProps) => {
  const navigate = useNavigate();

  return (
    <Table size="lg" useZebraStyles={false} className="seedlots-table">
      <TableHead>
        <TableRow>
          {HeaderConfig.map((header) => (
            <TableHeader
              key={header.id}
              id={`seedlot-table-header-${header.id}`}
            >
              {header.label}
            </TableHeader>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {
          seedlots.map((seedlot) => (
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

export default SeedlotTable;
