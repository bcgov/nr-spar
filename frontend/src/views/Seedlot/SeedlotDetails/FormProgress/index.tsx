import React from 'react';

import { QueryStatusType } from '../../../../types/QueryStatusType';
import { SeedlotStatusCode } from '../../../../types/SeedlotType';
import AClassFormProgress from './AClassFormProgress';
import BClassFormProgress from './BClassFormProgress';

interface FormProgressProps {
  seedlotNumber?: string;
  seedlotStatusCode?: SeedlotStatusCode;
  getSeedlotQueryStatus: QueryStatusType;
  isBClass?: boolean;
}

const FormProgress = ({
  isBClass = false,
  ...props
}: FormProgressProps) => (
  isBClass
    ? <BClassFormProgress {...props} />
    : <AClassFormProgress {...props} />
);

export default FormProgress;
