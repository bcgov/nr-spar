import React from 'react';

import {
  Button, FlexGrid, Row,
  Column, TextInput, TextInputSkeleton
} from '@carbon/react';
import { Edit } from '@carbon/icons-react';
import { useNavigate } from 'react-router';

import { SeedlotApplicantType } from '../../../../types/SeedlotType';
import { addParamToPath } from '../../../../utils/PathUtils';
import ROUTES from '../../../../routes/constants';
import EmailDisplay from '../../../../components/EmailDisplay';

import './styles.scss';

interface ApplicantSeedlotInformationProps {
  seedlotNumber?: string;
  applicant?: SeedlotApplicantType;
  isFetching: boolean;
  hideEditButton: boolean;
}

const ApplicantInformation = ({
  seedlotNumber,
  applicant,
  isFetching,
  hideEditButton
}: ApplicantSeedlotInformationProps) => {
  const navigate = useNavigate();

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
                  title=""
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
                  title=""
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
                <EmailDisplay
                  value={applicant?.email ?? ''}
                  label="Email address"
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
                  title=""
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
                  title=""
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
                  title=""
                  className="spar-display-only-input"
                  readOnly
                  id="seedlot-applicant-to-be-registered"
                  labelText="To be registered at the Tree Seed Centre?"
                  value={(applicant?.willRegister ? 'Yes' : 'No')}
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
                  title=""
                  className="spar-display-only-input"
                  readOnly
                  id="seedlot-applicant-within-bc"
                  labelText="Collected from a location within B.C.?"
                  value={(applicant?.isBcSource ? 'Yes' : 'No')}
                />
              )
          }
        </Column>
      </Row>
      {
        hideEditButton
          ? null
          : (
            <Row>
              <Column>
                <Button
                  kind="tertiary"
                  size="md"
                  className="section-btn"
                  renderIcon={Edit}
                  onClick={() => navigate(addParamToPath(ROUTES.SEEDLOT_A_CLASS_EDIT, seedlotNumber ?? ''))}
                >
                  Edit applicant
                </Button>
              </Column>
            </Row>
          )
      }
    </FlexGrid>
  );
};

export default ApplicantInformation;
