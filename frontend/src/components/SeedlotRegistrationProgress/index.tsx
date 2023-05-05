import React from 'react';

import {
  ProgressIndicator,
  ProgressStep
} from '@carbon/react';

interface SeedlotRegistrationProgressProps {
  currentIndex: number;
  className?: string;
  interactFunction?: Function;
}

const SeedlotRegistrationProgress = ({
  currentIndex,
  className,
  interactFunction
}: SeedlotRegistrationProgressProps) => (
  <ProgressIndicator
    className={className}
    currentIndex={currentIndex}
    spaceEqually
    onChange={interactFunction ?? null}
  >
    <ProgressStep
      label="Collection"
      secondaryLabel="Step 1"
    />
    <ProgressStep
      label="Ownership"
      secondaryLabel="Step 2"
    />
    <ProgressStep
      label="Interim storage"
      secondaryLabel="Step 3"
    />
    <ProgressStep
      label="Orchard"
      secondaryLabel="Step 4"
    />
    <ProgressStep
      label="Parent tree and SMP"
      secondaryLabel="Step 5"
    />
    <ProgressStep
      label="Extraction and storage"
      secondaryLabel="Step 6"
    />
  </ProgressIndicator>
);

export default SeedlotRegistrationProgress;
