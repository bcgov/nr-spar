import { ForestClientSearchType } from '../../types/ForestClientTypes/ForestClientSearchType';

export type HeaderObjType = {
  id: keyof ForestClientSearchType,
  label: string
};

export interface ClientSearchTableProps {
  clientData: ForestClientSearchType[],
  showPagination: boolean,
  tablePagination: JSX.Element,
  selectClientFn?: Function,
  currentSelected?: ForestClientSearchType
}
