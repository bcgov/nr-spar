import { SeedlotRowType } from '../../types/SeedlotType';

export type HeaderObj = {
  id: keyof SeedlotRowType,
  label: string
};
