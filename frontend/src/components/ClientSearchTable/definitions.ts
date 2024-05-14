import { UseMutationResult } from '@tanstack/react-query';
import { ForestClientSearchType } from '../../types/ForestClientTypes/ForestClientSearchType';

export type HeaderObjType = {
  id: keyof ForestClientSearchType,
  label: string
};

export interface ClientSearchTableProps {
  clientData: ForestClientSearchType[],
  showPagination: boolean,
  selectClientFn?: Function,
  currentSelected?: ForestClientSearchType
  mutationFn?: UseMutationResult<ForestClientSearchType[], unknown, void, unknown>
}
