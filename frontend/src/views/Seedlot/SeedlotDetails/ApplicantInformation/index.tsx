import React from 'react';

import { Button, RadioButtonSkeleton } from '@carbon/react';
import { Edit } from '@carbon/icons-react';

import Subtitle from '../../../../components/Subtitle';
import { SeedlotApplicantType } from '../../../../types/SeedlotType';

import './styles.scss';

interface ApplicantSeedlotInformationProps {
  applicant?: SeedlotApplicantType;
  isFetching: boolean;
}

const ApplicantInformation = (
  { applicant, isFetching }: ApplicantSeedlotInformationProps
) => {
  const renderValue = (name: keyof SeedlotApplicantType) => {
    if (isFetching) {
      return <RadioButtonSkeleton />;
    }
    if (applicant) {
      return (
        <p className="applicant-seedlot-info-value">
          {applicant[name]}
        </p>
      );
    }
    return null;
  };

  return (
    <div className="applicant-seedlot-information">
      <div className="applicant-seedlot-information-title-section">
        <p className="applicant-seedlot-information-title">
          Applicant and seedlot information
        </p>
        <Subtitle text="Check your seedlot initial information" />
      </div>
      <div>
        <div className="applicant-seedlot-info-section">
          <div className="applicant-seedlot-agency-name">
            <p className="applicant-seedlot-info-label">
              Applicant agency name
            </p>
            {
              renderValue('agency')
            }
          </div>
          <div className="applicant-seedlot-agency-number">
            <p className="applicant-seedlot-info-label">
              Applicant agency number
            </p>
            {
              renderValue('locationCode')
            }
          </div>
          <div className="applicant-seedlot-agency-email">
            <p className="applicant-seedlot-info-label">
              Applicant email address
            </p>
            {
              renderValue('email')
            }
          </div>
          <div className="applicant-seedlot-seedlot-species">
            <p className="applicant-seedlot-info-label">
              Seedlot species
            </p>
            {
              renderValue('species')
            }
          </div>
          <div className="applicant-seedlot-class-a-source">
            <p className="applicant-seedlot-info-label">
              Class A source
            </p>
            {
              renderValue('source')
            }
          </div>
        </div>
        <div className="applicant-seedlot-registered-collected">
          <div className="applicant-seedlot-registered">
            <p className="applicant-seedlot-info-label">
              To be registered?
            </p>
            {
              renderValue('willRegister')
            }
          </div>
          <div className="applicant-seedlot-collected">
            <p className="applicant-seedlot-info-label">
              Collected from B.C. source?
            </p>
            {
              renderValue('bcSource')
            }
          </div>
        </div>
        <Button
          kind="tertiary"
          size="md"
          className="btn-edit"
          renderIcon={Edit}
        >
          Edit applicant
        </Button>
      </div>
    </div>
  );
};

export default ApplicantInformation;
