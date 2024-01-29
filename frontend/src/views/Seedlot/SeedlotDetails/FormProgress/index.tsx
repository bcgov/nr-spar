import React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Button, ProgressIndicatorSkeleton
} from '@carbon/react';
import { Edit } from '@carbon/icons-react';

import SeedlotRegistrationProgress from '../../../../components/SeedlotRegistrationProgress';
import { initialProgressConfig } from '../../SeedlotRegFormClassA/constants';
import PathConstants from '../../../../routes/pathConstants';
import { addParamToPath } from '../../../../utils/PathUtils';

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
          See where you are in the registration process
        </p>
      </div>
      <div className="steps-box">
        {
          isFetching
            ? <ProgressIndicatorSkeleton />
            : (
              <SeedlotRegistrationProgress
                progressStatus={initialProgressConfig}
                interactFunction={(e: number) => {
                  // Add 1 to the number to make it comply with
                  // the step numbers shown to the user
                  navigate(`${addParamToPath(PathConstants.SEEDLOT_A_CLASS_REGISTRATION, seedlotNumber ?? '')}?step=${e + 1}`);
                }}
              />
            )
        }
      </div>
      <div>
        <Button
          kind="tertiary"
          size="md"
          className="btn-fp"
          renderIcon={Edit}
          onClick={() => navigate(addParamToPath(PathConstants.SEEDLOT_A_CLASS_REGISTRATION, seedlotNumber ?? ''))}
          disabled={isFetching || !seedlotNumber}
        >
          Edit seedlot form
        </Button>
      </div>
    </div>
  );
};

export default FormProgress;
