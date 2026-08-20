import React from 'react';

import {
  Button, FlexGrid, Row,
  Column, TextInput, TextInputSkeleton
} from '@carbon/react';
import { Edit } from '@carbon/icons-react';
import { useNavigate } from 'react-router-dom';

import DetailSection from '../../../../components/DetailSection';
import { SeedlotApplicantType } from '../../../../types/SeedlotType';
import { addParamToPath } from '../../../../utils/PathUtils';
import EmailDisplay from '../../../../components/EmailDisplay';
import { formatYesNo } from '../sections/bClass/utils';

import './styles.scss';

interface ApplicantFieldsBClassProps {
  applicant?: SeedlotApplicantType;
  isFetching: boolean;
}

const ApplicantFieldsBClass = ({
  applicant,
  isFetching
}: ApplicantFieldsBClassProps) => (
  <>
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
                id="seedlot-applicant-superior-provenance"
                labelText="Superior provenance?"
                value={formatYesNo(applicant?.superiorProvenance)}
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
                value={formatYesNo(applicant?.willRegister)}
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
                value={formatYesNo(applicant?.isBcSource)}
              />
            )
        }
      </Column>
    </Row>
  </>
);

interface ApplicantFieldsAClassProps {
  applicant?: SeedlotApplicantType;
  isFetching: boolean;
}

const ApplicantFieldsAClass = ({
  applicant,
  isFetching
}: ApplicantFieldsAClassProps) => (
  <>
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
                value={formatYesNo(applicant?.willRegister)}
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
                value={formatYesNo(applicant?.isBcSource)}
              />
            )
        }
      </Column>
    </Row>
  </>
);

interface ApplicantSeedlotInformationProps {
  seedlotNumber?: string;
  applicant?: SeedlotApplicantType;
  isFetching: boolean;
  hideEditButton: boolean;
  variant?: 'A' | 'B';
  editApplicantRoute: string;
}

const ApplicantInformation = ({
  seedlotNumber,
  applicant,
  isFetching,
  hideEditButton,
  variant = 'A',
  editApplicantRoute
}: ApplicantSeedlotInformationProps) => {
  const navigate = useNavigate();
  const isBClass = variant === 'B';
  const showEditButton = !hideEditButton && !isBClass;

  return (
    <DetailSection title="Check your applicant and seedlot information">
      <FlexGrid className="applicant-seedlot-information">
        {
          isBClass
            ? (
              <ApplicantFieldsBClass
                applicant={applicant}
                isFetching={isFetching}
              />
            )
            : (
              <ApplicantFieldsAClass
                applicant={applicant}
                isFetching={isFetching}
              />
            )
        }
        {
          showEditButton
            ? (
              <Row>
                <Column>
                  <Button
                    kind="tertiary"
                    size="md"
                    className="section-btn"
                    renderIcon={Edit}
                    onClick={() => navigate(addParamToPath(editApplicantRoute, seedlotNumber ?? ''))}
                  >
                    Edit applicant
                  </Button>
                </Column>
              </Row>
            )
            : null
        }
      </FlexGrid>
    </DetailSection>
  );
};

export default ApplicantInformation;
