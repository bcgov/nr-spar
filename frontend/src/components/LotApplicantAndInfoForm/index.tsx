import React from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  Row,
  Column,
  TextInput,
  FlexGrid
} from '@carbon/react';
import validator from 'validator';

import Subtitle from '../Subtitle';
import ApplicantAgencyFields from '../ApplicantAgencyFields';
import getApplicantAgenciesOptions from '../../api-service/applicantAgenciesAPI';
import { BooleanInputType, OptionsInputType, StringInputType } from '../../types/FormInputType';

import SeedlotInformation from './SeedlotInformation';
import { FormProps } from './definitions';
import {
  vegLotAgency,
  vegLotLocationCode,
  agencyFieldsProp
} from './constants';

import './styles.scss';

/**
 * This component displays a form for seedlot or veglot creation/edition.
 */
const LotApplicantAndInfoForm = ({
  isSeedlot,
  isEdit,
  seedlotFormData,
  setSeedlotFormData
}: FormProps) => {
  const applicantAgencyQuery = useQuery({
    queryKey: ['applicant-agencies'],
    enabled: !isEdit,
    queryFn: () => getApplicantAgenciesOptions()
  });

  const handleEmail = (value: string) => {
    const isEmailInvalid = !validator.isEmail(value);
    if (isSeedlot && setSeedlotFormData) {
      setSeedlotFormData((prevData) => ({
        ...prevData,
        email: {
          ...prevData.email,
          value,
          isInvalid: isEmailInvalid
        }
      }));
    }
  };

  const setAgencyAndCode = (agency: OptionsInputType, locationCode: StringInputType) => {
    if (isSeedlot && setSeedlotFormData) {
      setSeedlotFormData((prevData) => ({
        ...prevData,
        client: agency,
        locationCode
      }));
    }
  };

  return (
    <FlexGrid className="applicant-information-form">
      <Row className="section-title">
        <Column lg={8}>
          <h2>Applicant agency</h2>
          <Subtitle text="Enter the applicant agency information" />
        </Column>
      </Row>
      <ApplicantAgencyFields
        showCheckbox={false}
        isDefault={{ id: '', isInvalid: false, value: false }}
        checkboxId="lot-information-default-checkbox"
        agency={isSeedlot && seedlotFormData ? seedlotFormData.client : vegLotAgency}
        locationCode={
          isSeedlot && seedlotFormData
            ? seedlotFormData.locationCode
            : vegLotLocationCode
        }
        fieldsProps={agencyFieldsProp}
        agencyOptions={isEdit ? [] : applicantAgencyQuery.data ?? []}
        setAgencyAndCode={
          (
            _isDefault: BooleanInputType,
            agency: OptionsInputType,
            locationCode: StringInputType
          ) => setAgencyAndCode(agency, locationCode)
        }
        readOnly={isEdit}
        maxInputColSize={6}
      />
      <Row className="agency-email-row">
        <Column sm={4} md={8} lg={16} xlg={12}>
          <TextInput
            id={seedlotFormData?.email.id}
            name="email"
            type="email"
            labelText="Applicant email address"
            helperText="The Tree Seed Centre will uses it to communicate with the applicant"
            invalid={seedlotFormData ? seedlotFormData.email.isInvalid : null}
            invalidText="Please enter a valid email"
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleEmail(e.target.value)}
            defaultValue={isEdit && seedlotFormData ? seedlotFormData.email.value : ''}
          />

        </Column>
      </Row>
      {
        isSeedlot && seedlotFormData && setSeedlotFormData
          ? (
            <SeedlotInformation
              seedlotFormData={seedlotFormData}
              setSeedlotFormData={setSeedlotFormData}
              isEdit={isEdit}
            />
          )
          : null // The false case is reserved for vegLog
      }
    </FlexGrid>
  );
};

export default LotApplicantAndInfoForm;
