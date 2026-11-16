import { GermTrayType } from '../../../../../types/consep/GerminatorTrayType';

/**
 * A row of the tray table: what the user edits. The revision count is not part of it; the
 * page keeps the last saved state of each tray, revision included, on the side.
 */
export type GermTrayColumn = Pick<GermTrayType, 'germinatorTrayId' | 'activityTypeCd' | 'actualStartDate'> & {
  germinatorId: string;
};
