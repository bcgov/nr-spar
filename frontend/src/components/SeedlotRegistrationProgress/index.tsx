import React from 'react';

import {
  ProgressIndicator,
  ProgressStep
} from '@carbon/react';

import { ProgressIndicatorConfig } from '../../views/Seedlot/ContextContainerClassA/definitions';
import { MEDIUM_SCREEN_WIDTH } from '../../shared-constants/shared-constants';
import useWindowSize from '../../hooks/UseWindowSize';

import './styles.scss';

interface SeedlotRegistrationProgressProps {
  progressStatus: ProgressIndicatorConfig;
  interactFunction?: Function;
}

const SeedlotRegistrationProgress = ({
  progressStatus,
  interactFunction
}: SeedlotRegistrationProgressProps) => {
  const widowSize = useWindowSize();
  return (
    <ProgressIndicator
      // Needs to feed it a -1 value otherwise step 1 will stuck at current
      className="spar-seedlot-reg-progress-bar"
      currentIndex={-1}
      spaceEqually
      onChange={interactFunction ?? null}
      vertical={widowSize.innerWidth < MEDIUM_SCREEN_WIDTH}
    >
      <ProgressStep
        label="Collection"
        secondaryLabel="Step 1"
        complete={progressStatus.collection.isComplete}
        current={progressStatus.collection.isCurrent}
        invalid={progressStatus.collection.isInvalid}
      />
      <ProgressStep
        label="Ownership"
        secondaryLabel="Step 2"
        complete={progressStatus.ownership.isComplete}
        current={progressStatus.ownership.isCurrent}
        invalid={progressStatus.ownership.isInvalid}
      />
      <ProgressStep
        label="Interim storage"
        secondaryLabel="Step 3"
        complete={progressStatus.interim.isComplete}
        current={progressStatus.interim.isCurrent}
        invalid={progressStatus.interim.isInvalid}
      />
      <ProgressStep
        label="Orchard"
        secondaryLabel="Step 4"
        complete={progressStatus.orchard.isComplete}
        current={progressStatus.orchard.isCurrent}
        invalid={progressStatus.orchard.isInvalid}
      />
      <ProgressStep
        label="Parent tree and SMP"
        secondaryLabel="Step 5"
        complete={progressStatus.parent.isComplete}
        current={progressStatus.parent.isCurrent}
        invalid={progressStatus.parent.isInvalid}
      />
      <ProgressStep
        label="Extraction and storage"
        secondaryLabel="Step 6"
        complete={progressStatus.extraction.isComplete}
        current={progressStatus.extraction.isCurrent}
        invalid={progressStatus.extraction.isInvalid}
      />
    </ProgressIndicator>
  );
};

export default SeedlotRegistrationProgress;
