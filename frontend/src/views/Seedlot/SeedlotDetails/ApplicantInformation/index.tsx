import React from 'react';

import {
  Button, FlexGrid, Row,
  Column, TextInput, TextInputSkeleton
} from '@carbon/react';
import { Edit } from '@carbon/icons-react';

import { SeedlotApplicantType } from '../../../../types/SeedlotType';

import './styles.scss';

interface ApplicantSeedlotInformationProps {
  applicant?: SeedlotApplicantType;
  isFetching: boolean;
}

const ApplicantInformation = (
  { applicant, isFetching }: ApplicantSeedlotInformationProps
) => {
  const triggerMailTo = () => {
    if (applicant?.email) {
      window.location.href = `mailto: ${applicant.email}`;
    }
  };

  return (
    <FlexGrid className="applicant-seedlot-information">
      <Row className="applicant-seedlot-information-row">
        <Column>
          <p className="applicant-seedlot-information-title">
            Check your applicant and seedlot information
          </p>
        </Column>
      </Row>
      <Row className="applicant-seedlot-information-row">
        <Column sm={4} md={4} lg={4} xlg={4} max={4}>
          {
            isFetching
              ? <TextInputSkeleton />
              : (
                <TextInput
                  className="spar-display-only-input"
                  readOnly
                  id="seedlot-applicant-agency"
                  labelText="Applicant agency"
                  value={applicant?.agency ?? ''}
                />
              )
          }
        </Column>
        <Column sm={4} md={4} lg={4} xlg={4} max={4}>
          {
            isFetching
              ? <TextInputSkeleton />
              : (
                <TextInput
                  className="spar-display-only-input"
                  readOnly
                  id="seedlot-applicant-location-code"
                  labelText="Applicant location code"
                  value={applicant?.locationCode ?? ''}
                />
              )
          }
        </Column>
        <Column sm={4} md={4} lg={4} xlg={4} max={4}>
          {
            isFetching
              ? <TextInputSkeleton />
              : (
                <TextInput
                  className="spar-display-only-input email-input"
                  readOnly
                  id="seedlot-applicant-email"
                  labelText="Email address"
                  value={applicant?.email ?? ''}
                  onClick={() => triggerMailTo()}
                />
              )
          }
        </Column>
      </Row>
      <Row className="applicant-seedlot-information-row">
        <Column sm={4} md={4} lg={4} xlg={4} max={4}>
          {
            isFetching
              ? <TextInputSkeleton />
              : (
                <TextInput
                  className="spar-display-only-input"
                  readOnly
                  id="seedlot-applicant-species"
                  labelText="Seedlot species"
                  value={applicant?.species ?? ''}
                />
              )
          }
        </Column>
        <Column sm={4} md={4} lg={4} xlg={4} max={4}>
          {
            isFetching
              ? <TextInputSkeleton />
              : (
                <TextInput
                  className="spar-display-only-input"
                  readOnly
                  id="seedlot-applicant-source"
                  labelText="Specify A-class source"
                  value={applicant?.source ?? ''}
                />
              )
          }
        </Column>
        <Column sm={4} md={4} lg={4} xlg={4} max={4}>
          {
            isFetching
              ? <TextInputSkeleton />
              : (
                <TextInput
                  className="spar-display-only-input"
                  readOnly
                  id="seedlot-applicant-to-be-registered"
                  labelText="To be registered at the Tree Seed Centre?"
                  value={(applicant?.willRegister ? 'Yes' : 'No') ?? ''}
                />
              )
          }
        </Column>
        <Column sm={4} md={4} lg={4} xlg={4} max={4}>
          {
            isFetching
              ? <TextInputSkeleton />
              : (
                <TextInput
                  className="spar-display-only-input"
                  readOnly
                  id="seedlot-applicant-species"
                  labelText="Collected from a location within B.C.?"
                  value={(applicant?.isBcSource ? 'Yes' : 'No') ?? ''}
                />
              )
          }
        </Column>
      </Row>
      <Row>
        <Column>
          <Button
            kind="tertiary"
            size="md"
            className="btn-edit"
            renderIcon={Edit}
          >
            Edit applicant and seedlot
          </Button>
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default ApplicantInformation;
