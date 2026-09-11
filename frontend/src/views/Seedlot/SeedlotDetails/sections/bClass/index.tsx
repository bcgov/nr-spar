import React from 'react';

import { RichSeedlotType, SeedlotType } from '../../../../../types/SeedlotType';
import SourceInformation from './SourceInformation';
import CollectionInformation from './CollectionInformation';
import AreaOfUse from './AreaOfUse';

type BClassDetailSectionsProps = {
  seedlot: SeedlotType,
  richSeedlot?: RichSeedlotType,
  isFetching: boolean,
  showAreaOfUse?: boolean
};

const BClassDetailSections = ({
  seedlot,
  richSeedlot,
  isFetching,
  showAreaOfUse
}: BClassDetailSectionsProps) => (
  <>
    <SourceInformation
      seedlot={seedlot}
      richSeedlot={richSeedlot}
      isFetching={isFetching}
    />
    <CollectionInformation
      seedlot={seedlot}
      isFetching={isFetching}
    />
    {
      showAreaOfUse
        ? (
          <AreaOfUse
            seedlot={seedlot}
            richSeedlot={richSeedlot}
            isFetching={isFetching}
          />
        )
        : null
    }
  </>
);

export default BClassDetailSections;
