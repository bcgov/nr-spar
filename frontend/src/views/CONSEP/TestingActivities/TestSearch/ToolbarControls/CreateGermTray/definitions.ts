/* eslint-disable camelcase */
import { type MRT_TableInstance } from 'material-react-table';
import type { TestingSearchResponseType } from '../../../../../../types/consep/TestingSearchType';

export interface GermTrayOptions {
  printDishLabels: boolean;
  printGerminationTrayLabels: boolean;
  printGerminationCoverSheet: boolean;
  printGerminationTestRecord: boolean;
}

export interface CreateGermTrayProps {
  table: MRT_TableInstance<TestingSearchResponseType>;
  onClose: () => void;
}

export interface CreateGermTrayRequest {
  activityTypeCd: string;
  riaSkey: number;
  actualBeginDtTm: string | null;
}
