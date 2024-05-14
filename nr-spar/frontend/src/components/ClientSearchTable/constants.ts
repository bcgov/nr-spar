import { HeaderObjType } from './definitions';

export const DEFAULT_PAGE_NUM = 0;

export const DEFAULT_PAGE_SIZE = 10;

export const TableHeaders: Array<HeaderObjType> = [
  {
    id: 'acronym',
    label: 'Acronym'
  },
  {
    id: 'clientNumber',
    label: 'Number'
  },
  {
    id: 'clientName',
    label: 'Full name'
  },
  {
    id: 'locationCode',
    label: 'Loc. code'
  },
  {
    id: 'locationName',
    label: 'Location'
  },
  {
    id: 'city',
    label: 'City'
  }
];
