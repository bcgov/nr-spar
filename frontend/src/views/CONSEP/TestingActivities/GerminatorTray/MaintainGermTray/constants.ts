/* eslint-disable camelcase */
import { type MRT_ColumnDef } from 'material-react-table';
import { GermTrayColumn } from './definitions';

export const getGermTrayColumns = (): MRT_ColumnDef<GermTrayColumn>[] => [
  {
    accessorKey: 'germinatorTrayId',
    header: 'Germ tray',
    enableEditing: false
  },
  {
    accessorKey: 'actualStartDate',
    header: 'Soak start date',
    enableEditing: false
  },
  {
    accessorKey: 'activityTypeCd',
    header: 'Test Type',
    enableEditing: false
  },
  {
    accessorKey: 'germinatorId',
    header: 'Germinator Id',
    enableEditing: true
  }
];
