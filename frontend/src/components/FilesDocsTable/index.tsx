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

import File from '../../types/File';

import './styles.scss';

interface TableProps {
  elements: File[];
  headers: string[];
}

const FilesDocsTable = ({ elements, headers }: TableProps) => (
  <Table size="lg" useZebraStyles={false} className="files-docs-table">
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
    <TableBody aria-live="off">
      {elements.map((item, idx) => (
        <TableRow key={hashObject(item)} id={`row${idx}`}>
          <TableCell>{item.name}</TableCell>
          <TableCell>{item.format}</TableCell>
          <TableCell>{item.created_at}</TableCell>
          <TableCell>{item.last_update}</TableCell>
          <TableCell>{item.name}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default FilesDocsTable;
