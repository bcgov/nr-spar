import React from 'react';

import { SparProgressIndicator } from '../SeedlotRegistrationProgress/SparProgressIndicator';
import { SparProgressStep } from '../SeedlotRegistrationProgress/SparProgressStep';
import { BClassProgressIndicatorConfig } from '../../views/Seedlot/ContextContainerClassB/definitions';
import { MEDIUM_SCREEN_WIDTH } from '../../shared-constants/shared-constants';
import useWindowSize from '../../hooks/UseWindowSize';

import '../SeedlotRegistrationProgress/styles.scss';

interface SeedlotRegistrationProgressClassBProps {
  progressStatus: BClassProgressIndicatorConfig;
  interactFunction?: (data: number) => void;
}

const SeedlotRegistrationProgressClassB = ({
  progressStatus,
  interactFunction
}: SeedlotRegistrationProgressClassBProps) => {
  const widowSize = useWindowSize();
  return (
    <SparProgressIndicator
      className="spar-seedlot-reg-progress-bar"
      currentIndex={-1}
      spaceEqually
      onChange={interactFunction ?? undefined}
      vertical={widowSize.innerWidth < MEDIUM_SCREEN_WIDTH}
    >
      <SparProgressStep
        label="Collection information"
        secondaryLabel="Step 1"
        complete={progressStatus.collection.isComplete}
        current={progressStatus.collection.isCurrent}
        invalid={progressStatus.collection.isInvalid}
      />
      <SparProgressStep
        label="Ownership"
        secondaryLabel="Step 2"
        complete={progressStatus.ownership.isComplete}
        current={progressStatus.ownership.isCurrent}
        invalid={progressStatus.ownership.isInvalid}
      />
      <SparProgressStep
        label="Interim storage"
        secondaryLabel="Step 3"
        complete={progressStatus.interim.isComplete}
        current={progressStatus.interim.isCurrent}
        invalid={progressStatus.interim.isInvalid}
      />
      <SparProgressStep
        label="Extraction and storage"
        secondaryLabel="Step 4"
        complete={progressStatus.extraction.isComplete}
        current={progressStatus.extraction.isCurrent}
        invalid={progressStatus.extraction.isInvalid}
      />
    </SparProgressIndicator>
  );
};

export default SeedlotRegistrationProgressClassB;
