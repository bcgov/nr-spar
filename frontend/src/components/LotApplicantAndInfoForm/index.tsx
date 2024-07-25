import React, { useContext, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  Row,
  Column,
  TextInput,
  FlexGrid
} from '@carbon/react';
import validator from 'validator';

import Subtitle from '../Subtitle';
import Divider from '../Divider';
import ClientAndCodeInput from '../ClientAndCodeInput';
import { StringInputType } from '../../types/FormInputType';
import AuthContext from '../../contexts/AuthContext';
import { getForestClientByNumberOrAcronym } from '../../api-service/forestClientsAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../config/TimeUnits';

import SeedlotInformation from './SeedlotInformation';
import { FormProps } from './definitions';
import {
  vegLotAgency,
  vegLotLocationCode,
  clientAndCodeInputText
} from './constants';

import './styles.scss';

/**
 * This component displays a form for seedlot or veglot creation/edition.
 */
const LotApplicantAndInfoForm = ({
  isSeedlot,
  isEdit,
  isReview,
  seedlotFormData,
  setSeedlotFormData
}: FormProps) => {
  const { selectedClientRoles } = useContext(AuthContext);

  const defaultApplicantAgencyQuery = useQuery(
    {
      queryKey: ['forest-clients', selectedClientRoles?.clientId],
      queryFn: () => getForestClientByNumberOrAcronym(selectedClientRoles?.clientId!),
      enabled: !isEdit && !isReview && !!selectedClientRoles?.clientId,
      staleTime: THREE_HOURS,
      cacheTime: THREE_HALF_HOURS
    }
  );

  useEffect(() => {
    // Pre-fill the applicant client number based on user selected role
    if (defaultApplicantAgencyQuery.status === 'success' && !seedlotFormData?.client.value && setSeedlotFormData) {
      const forestClient = defaultApplicantAgencyQuery.data;

      setSeedlotFormData((prevForm) => ({
        ...prevForm,
        client: {
          ...prevForm.client,
          value: forestClient.clientNumber
        }
      }));
    }
  }, [defaultApplicantAgencyQuery.status]);

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

  const setClientAndCode = (client: StringInputType, locationCode: StringInputType) => {
    if (isSeedlot && setSeedlotFormData) {
      setSeedlotFormData((prevData) => ({
        ...prevData,
        client,
        locationCode
      }));
    }
  };

  return (
    <FlexGrid className="applicant-information-form">
      <Row className="section-title">
        <Column lg={8}>
          <h2>Applicant agency</h2>
          {
            isReview
              ? null
              : <Subtitle text="Enter the applicant agency information" />
          }
        </Column>
      </Row>
      <ClientAndCodeInput
        showCheckbox={false}
        checkboxId="lot-information-default-checkbox"
        clientInput={isSeedlot && seedlotFormData ? seedlotFormData.client : vegLotAgency}
        locationCodeInput={
          isSeedlot && seedlotFormData
            ? seedlotFormData.locationCode
            : vegLotLocationCode
        }
        textConfig={clientAndCodeInputText}
        setClientAndCode={
          (
            client: StringInputType,
            locationCode: StringInputType
          ) => setClientAndCode(client, locationCode)
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
            helperText="The Tree Seed Centre will use this to communicate with the applicant"
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
            <>
              {
                isReview
                  ? <Divider />
                  : null
              }
              <SeedlotInformation
                seedlotFormData={seedlotFormData}
                setSeedlotFormData={setSeedlotFormData}
                isEdit={isEdit}
                isReview={isReview}
              />
            </>
          )
          : null // The false case is reserved for vegLog
      }
    </FlexGrid>
  );
};

export default LotApplicantAndInfoForm;
