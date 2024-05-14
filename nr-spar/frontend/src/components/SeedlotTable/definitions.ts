import { SeedlotDisplayType } from '../../types/SeedlotType';

export interface TableProps {
  userId: string,
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
  tablePagination: JSX.Element
}

export type HeaderObj = {
  id: keyof SeedlotDisplayType,
  label: string
};
