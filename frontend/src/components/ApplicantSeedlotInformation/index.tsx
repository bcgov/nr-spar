import React from 'react';

import { Button } from '@carbon/react';
import { Edit } from '@carbon/icons-react';

import Subtitle from '../Subtitle';

import SeedlotRegistrationObj from '../../types/SeedlotRegistrationTypes';

import './styles.scss';

interface ApplicantSeedlotInformationProps {
  seedlotApplicantData: SeedlotRegistrationObj;
}

const ApplicantSeedlotInformation = (
  { seedlotApplicantData }: ApplicantSeedlotInformationProps
) => (
  <div className="applicant-seedlot-information">
    <div className="applicant-seedlot-information-title-section">
      <p className="applicant-seedlot-information-title">
        Applicant and seedlot information
      </p>
      <Subtitle text="Check your seedlot initial information" />
    </div>
    {seedlotApplicantData && (
      <div>
        <div className="applicant-seedlot-info-section">
          <div className="applicant-seedlot-agency-name">
            <p className="applicant-seedlot-info-label">
              Applicant agency name
            </p>
            <p className="applicant-seedlot-info-value">
              {seedlotApplicantData.applicant.name}
            </p>
          </div>
          <div className="applicant-seedlot-agency-number">
            <p className="applicant-seedlot-info-label">
              Applicant agency number
            </p>
            <p className="applicant-seedlot-info-value">
              {seedlotApplicantData.applicant.number}
            </p>
          </div>
          <div className="applicant-seedlot-agency-email">
            <p className="applicant-seedlot-info-label">
              Applicant email address
            </p>
            <p className="applicant-seedlot-info-value">
              {seedlotApplicantData.applicant.email}
            </p>
          </div>
          <div className="applicant-seedlot-seedlot-species">
            <p className="applicant-seedlot-info-label">
              Seedlot species
            </p>
            <p className="applicant-seedlot-info-value">
              {seedlotApplicantData.species.label}
            </p>
          </div>
          <div className="applicant-seedlot-class-a-source">
            <p className="applicant-seedlot-info-label">
              Class A source
            </p>
            <p className="applicant-seedlot-info-value">
              {seedlotApplicantData.source}
            </p>
          </div>
        </div>
        <div className="applicant-seedlot-registered-collected">
          <div className="applicant-seedlot-registered">
            <p className="applicant-seedlot-info-label">
              To be registered?
            </p>
            <p className="applicant-seedlot-info-value">
              {seedlotApplicantData.registered ? ('Yes, to be registered with the Tree Seed Centre')
                : ('No')}
            </p>
          </div>
          <div className="applicant-seedlot-collected">
            <p className="applicant-seedlot-info-label">
              Collected from B.C. source?
            </p>
            <p className="applicant-seedlot-info-value">
              {seedlotApplicantData.collectedBC ? ('Yes, collected from a location within B.C.')
                : ('No')}
            </p>
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
    )}
  </div>
);

export default ApplicantSeedlotInformation;
