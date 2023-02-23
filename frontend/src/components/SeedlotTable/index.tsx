import React from 'react';
import { hashObject } from 'react-hash-string';

import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell
} from '@carbon/react';

import Participants from '../Participants';
import StatusItem from '../StatusItem';

import Seedlot from '../../types/Seedlot';

import formatDate from '../../utils/DateUtils';

import './styles.css';

interface TableProps {
  elements: Seedlot[];
  headers: string[];
}

const SeedlotTable = ({ elements, headers }: TableProps) => (
  <Table size="lg" useZebraStyles={false} className="seedlot-table">
    <TableHead>
      <TableRow>
        {headers.map((header, idx) => (
          <TableHeader
            key={header}
            id={`header-${header}-${idx}`}
            data-testid={`header-${header}-${idx}`}
          >
            {header}
          </TableHeader>
        ))}
      </TableRow>
    </TableHead>
    <TableBody>
      {elements.map((item, idx) => (
        <TableRow key={hashObject(item)} id={`row${idx}`}>
          <TableCell>{item.number}</TableCell>
          <TableCell>{`${item.class} class`}</TableCell>
          <TableCell>{item.lot_species}</TableCell>
          <TableCell>{item.form_step}</TableCell>
          <TableCell>
            <StatusItem status={item.status} />
          </TableCell>
          <TableCell>
            <Participants elements={item.participants} number={item.number} />
          </TableCell>
          <TableCell>{formatDate(item.created_at)}</TableCell>
          <TableCell>{formatDate(item.last_modified)}</TableCell>
          <TableCell>{formatDate(item.approved_at)}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default SeedlotTable;
