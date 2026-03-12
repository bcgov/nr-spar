import { GermTrayCreateResponseType } from '../../../../../types/consep/GerminatorTrayType';

export type GermTrayColumn = GermTrayCreateResponseType & {
  germinatorId: string;
  isPending: boolean;
};
