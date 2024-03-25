import { createContext } from 'react';
import { SeedlotType } from '../../../types/SeedlotType';

const SeedlotReviewContext = createContext({
  seedlotData: {} as SeedlotType
});

export default SeedlotReviewContext;
