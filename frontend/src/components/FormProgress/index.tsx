import React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Button, ProgressIndicatorSkeleton
} from '@carbon/react';
import { DocumentBlank } from '@carbon/icons-react';

import Subtitle from '../Subtitle';
import SeedlotRegistrationProgress from '../SeedlotRegistrationProgress';
import { initialProgressConfig } from '../../views/Seedlot/SeedlotRegistrationForm/constants';

import './styles.scss';

interface FormProgressProps {
  seedlotNumber?: string;
  isFetching?: boolean;
}

const FormProgress = ({ seedlotNumber, isFetching }: FormProgressProps) => {
  const navigate = useNavigate();
  if (!seedlotNumber) {
    return null;
  }
  return (
    <div className="form-progress">
      <div className="form-progress-title-section">
        <p className="form-progress-title">
          Form progress
        </p>
        <Subtitle text="Where you are in the registration process" />
      </div>
      <div className="steps-box">
        {
          isFetching
            ? <ProgressIndicatorSkeleton />
            : <SeedlotRegistrationProgress progressStatus={initialProgressConfig} />
        }
      </div>
      <div>
        <Button
          kind="tertiary"
          size="md"
          className="btn-fp"
          renderIcon={DocumentBlank}
          onClick={() => navigate(`/seedlots/registration/${seedlotNumber}`)}
          disabled={isFetching || !seedlotNumber}
        >
          Complete registration
        </Button>
      </div>
    </div>
  );
};

export default FormProgress;
