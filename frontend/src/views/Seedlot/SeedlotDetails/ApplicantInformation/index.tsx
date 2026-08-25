import React from 'react';

import {
  Button, FlexGrid, Row,
  Column, TextInput, TextInputSkeleton
} from '@carbon/react';
import { Edit } from '@carbon/icons-react';
import { useNavigate } from 'react-router-dom';

import DetailSection from '../../../../components/DetailSection';
import { SeedlotApplicantType } from '../../../../types/SeedlotType';
import ROUTES from '../../../../routes/constants';
import { addParamToPath } from '../../../../utils/PathUtils';
import EmailDisplay from '../../../../components/EmailDisplay';
import { formatYesNo } from '../utils';

import './styles.scss';

type ApplicantField = {
  id: string;
  label: string;
  value: string;
  kind?: 'text' | 'email';
};

const getApplicantFieldRows = (
  applicant: SeedlotApplicantType | undefined,
  variant: 'A' | 'B'
): ApplicantField[][] => {
  const classSpecificField: ApplicantField = variant === 'B'
    ? {
      id: 'seedlot-applicant-superior-provenance',
      label: 'Superior provenance?',
      value: formatYesNo(applicant?.superiorProvenance)
    }
    : {
      id: 'seedlot-applicant-source',
      label: 'Specify A-class source',
      value: applicant?.source ?? ''
    };

  return [
    [
      {
        id: 'seedlot-applicant-agency',
        label: 'Applicant agency',
        value: applicant?.agency ?? ''
      },
      {
        id: 'seedlot-applicant-location-code',
        label: 'Applicant location code',
        value: applicant?.locationCode ?? ''
      },
      {
        id: 'seedlot-applicant-email',
        label: 'Email address',
        value: applicant?.email ?? '',
        kind: 'email'
      }
    ],
    [
      {
        id: 'seedlot-applicant-species',
        label: 'Seedlot species',
        value: applicant?.species ?? ''
      },
      classSpecificField,
      {
        id: 'seedlot-applicant-to-be-registered',
        label: 'To be registered at the Tree Seed Centre?',
        value: formatYesNo(applicant?.willRegister)
      },
      {
        id: 'seedlot-applicant-within-bc',
        label: 'Collected from a location within B.C.?',
        value: formatYesNo(applicant?.isBcSource)
      }
    ]
  ];
};

const ApplicantFieldColumn = ({
  field,
  isFetching
}: {
  field: ApplicantField;
  isFetching: boolean;
}) => {
  let content: React.ReactNode = (
    <TextInput
      title=""
      className="spar-display-only-input"
      readOnly
      id={field.id}
      labelText={field.label}
      value={field.value}
    />
  );

  if (isFetching) {
    content = <TextInputSkeleton />;
  } else if (field.kind === 'email') {
    content = (
      <EmailDisplay
        value={field.value}
        label={field.label}
      />
    );
  }

  return (
    <Column sm={4} md={4} lg={4} xlg={4} max={4}>
      {content}
    </Column>
  );
};

interface ApplicantSeedlotInformationProps {
  seedlotNumber?: string;
  applicant?: SeedlotApplicantType;
  isFetching: boolean;
  hideEditButton: boolean;
  variant?: 'A' | 'B';
}

const ApplicantInformation = ({
  seedlotNumber,
  applicant,
  isFetching,
  hideEditButton,
  variant = 'A'
}: ApplicantSeedlotInformationProps) => {
  const navigate = useNavigate();
  const fieldRows = getApplicantFieldRows(applicant, variant);

  return (
    <DetailSection title="Check your applicant and seedlot information">
      <FlexGrid className="applicant-seedlot-information">
        {
          fieldRows.map((row) => (
            <Row
              key={row.map((field) => field.id).join('-')}
              className="applicant-seedlot-information-row"
            >
              {
                row.map((field) => (
                  <ApplicantFieldColumn
                    key={field.id}
                    field={field}
                    isFetching={isFetching}
                  />
                ))
              }
            </Row>
          ))
        }
        {
          !hideEditButton
            ? (
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
            : null
        }
      </FlexGrid>
    </DetailSection>
  );
};

export default ApplicantInformation;
