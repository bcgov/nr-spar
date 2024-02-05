import { ForestClientDisplayType } from '../../types/ForestClientTypes/ForestClientDisplayType';

export type HeaderObjType = {
  id: keyof ForestClientDisplayType,
  label: string
};

export interface ClientSearchTableProps {
  clientData: ForestClientDisplayType[],
  showPagination: boolean,
  tablePagination: JSX.Element,
  selectClientFn?: Function,
  currentSelected?: ForestClientDisplayType
}
