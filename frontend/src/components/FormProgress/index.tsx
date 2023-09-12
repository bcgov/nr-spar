import React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Button
} from '@carbon/react';
import { DocumentBlank } from '@carbon/icons-react';

import Subtitle from '../Subtitle';
import SeedlotRegistrationProgress from '../SeedlotRegistrationProgress';

import './styles.scss';

interface FormProgressProps {
  seedlotNumber: number;
}

const FormProgress = ({ seedlotNumber }: FormProgressProps) => {
  const navigate = useNavigate();
  return (
    <div className="form-progress">
      <div className="form-progress-title-section">
        <p className="form-progress-title">
          Form progress
        </p>
        <Subtitle text="Where you are in the registration process" />
      </div>
      <div className="steps-box">
        <SeedlotRegistrationProgress currentIndex={5} />
      </div>
      <div>
        <Button
          kind="tertiary"
          size="md"
          className="btn-fp"
          renderIcon={DocumentBlank}
          onClick={() => navigate(`/seedlots/registration/${seedlotNumber}`)}
        >
          Complete registration
        </Button>
      </div>
    </div>
  );
};

export default FormProgress;
