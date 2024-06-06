import { SeedlotDisplayType } from '../../types/SeedlotType';

export interface TableProps {
  userId: string,
  isTscAdmin?: boolean
  isSortable?: boolean
  showSearch?: boolean
  showPagination?: boolean
  defaultPageSize?: number
}

export interface SeedlotDataTableProps {
  seedlotData: SeedlotDisplayType[],
  navigate: Function,
  isSortable: boolean,
  showSearch: boolean,
  showPagination: boolean,
  tablePagination: JSX.Element,
  isTscAdmin?: boolean
}

export type HeaderObj = {
  id: keyof SeedlotDisplayType,
  label: string
};
