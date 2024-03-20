/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext } from 'react';
import { SeedlotAClassSubmitType } from '../../../types/SeedlotType';

const SeedlotReviewContext = createContext({
  formData: {} as SeedlotAClassSubmitType | undefined
});

export default SeedlotReviewContext;
