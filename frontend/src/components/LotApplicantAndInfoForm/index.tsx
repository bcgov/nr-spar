import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, UseQueryResult, useMutation } from '@tanstack/react-query';

import {
  Row,
  Column,
  TextInput,
  ComboBox,
  TextInputSkeleton,
  InlineLoading,
  ActionableNotification
} from '@carbon/react';
import validator from 'validator';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

import Subtitle from '../Subtitle';
import InputErrorText from '../InputErrorText';

import { ErrToastOption } from '../../config/ToastifyConfig';
import { FilterObj, filterInput } from '../../utils/filterUtils';

import { SeedlotRegFormType, SeedlotRegPayloadType } from '../../types/SeedlotRegistrationTypes';
import ComboBoxEvent from '../../types/ComboBoxEvent';

import getApplicantAgenciesOptions from '../../api-service/applicantAgenciesAPI';
import { getForestClientLocation } from '../../api-service/forestClientsAPI';
import { postSeedlot } from '../../api-service/seedlotAPI';
import { LOCATION_CODE_LIMIT } from '../../shared-constants/shared-constants';
import ErrorToast from '../Toast/ErrorToast';

import SeedlotInformation from './SeedlotInformation';
import { ComboBoxPropsType, FormProps } from './definitions';
import {
  applicantAgencyFieldConfig,
  pageTexts,
  InitialSeedlotFormData
} from './constants';

import './styles.scss';
import ApplicantAgencyFields from '../ApplicantAgencyFields';

/**
 * This component displays a form for seedlot or veglot creation/edition.
 */
const LotApplicantAndInfoForm = ({ isSeedlot, isEdit }: FormProps) => {
  const navigate = useNavigate();
  const [
    seedlotFormData,
    setSeedlotFormData
  ] = useState<SeedlotRegFormType>(InitialSeedlotFormData);
  const [invalidLocationMessage, setInvalidLocationMessage] = useState<string>('');
  const [locationCodeHelper, setLocationCodeHelper] = useState<string>(
    pageTexts.locCodeInput.helperTextDisabled
  );

  const updateAfterLocValidation = (isInvalid: boolean) => {
    //  setInputValidation('locationCode', isInvalid);
    setLocationCodeHelper(pageTexts.locCodeInput.helperTextEnabled);
  };

  const validateLocationCodeMutation = useMutation({
    mutationFn: (queryParams: string[]) => getForestClientLocation(
      queryParams[0], // Client Number
      queryParams[1] // Location Code
    ),
    onError: (err: AxiosError) => {
      const errMsg = err.code === 'ERR_BAD_REQUEST'
        ? pageTexts.locCodeInput.invalidLocationForSelectedAgency
        : pageTexts.locCodeInput.cannotVerify;
      setInvalidLocationMessage(errMsg);
      updateAfterLocValidation(true);
    },
    onSuccess: () => updateAfterLocValidation(false)
  });

  const applicantAgencyQuery = useQuery({
    queryKey: ['applicant-agencies'],
    enabled: !isEdit,
    queryFn: () => getApplicantAgenciesOptions()
  });

  const handleLocationCodeBlur = (clientNumber: string, locationCode: string) => {
    const isInRange = validator.isInt(locationCode, { min: 0, max: 99 });
    // Padding 0 in front of single digit code
    const formattedCode = (isInRange && locationCode.length === 1)
      ? locationCode.padStart(2, '0')
      : locationCode;

    if (isInRange) {
      setSeedlotFormData((prevResBody) => ({
        ...prevResBody,
        locationCode: {
          ...prevResBody.locationCode,
          value: formattedCode,
          isInvalid: false
        }
      }));
    }

    if (!isInRange) {
      setInvalidLocationMessage(pageTexts.locCodeInput.invalidLocationValue);
      return;
    }

    if (clientNumber && locationCode) {
      validateLocationCodeMutation.mutate([clientNumber, formattedCode]);
    }
  };

  /**
   * Handle changes for location code.
   */
  const handleLocationCode = (
    value: string
  ) => {
    setSeedlotFormData((prevResBody) => ({
      ...prevResBody,
      locationCode: {
        ...prevResBody.locationCode,
        value: value.slice(0, LOCATION_CODE_LIMIT)
      }
    }));
  };

  /**
   * Handle combobox changes for agency and species.
   */
  const handleComboBox = (event: ComboBoxEvent, isApplicantAgency: boolean) => {
    const { selectedItem } = event;
    const inputName: keyof SeedlotRegFormType = isApplicantAgency ? 'client' : 'species';
    const isInvalid = selectedItem === null;
    setSeedlotFormData((prevData) => ({
      ...prevData,
      [inputName]: {
        ...prevData[inputName],
        value: selectedItem?.code ? selectedItem : {
          code: '',
          label: '',
          description: ''
        },
        isInvalid
      }
    }));

    if (isApplicantAgency && selectedItem?.code && seedlotFormData.locationCode.value) {
      validateLocationCodeMutation.mutate([selectedItem.code, seedlotFormData.locationCode.value]);
    }
  };

  const handleEmail = (value: string) => {
    const isEmailInvalid = !validator.isEmail(value);
    setSeedlotFormData((prevData) => ({
      ...prevData,
      email: {
        ...prevData.email,
        value,
        isInvalid: isEmailInvalid
      }
    }));
  };

  const seedlotMutation = useMutation({
    mutationFn: (payload: SeedlotRegPayloadType) => postSeedlot(payload),
    onError: (err: AxiosError) => {
      toast.error(
        <ErrorToast
          title="Creation failure"
          subtitle={`Your application could not be created. Please try again later. ${err.code}: ${err.message}`}
        />,
        ErrToastOption
      );
    },
    onSuccess: (res) => navigate({
      pathname: '/seedlots/creation-success',
      search: `?seedlotNumber=${res.data.seedlotNumber}&seedlotClass=A`
    })
  });

  const displayCombobox = (
    query: UseQueryResult,
    propsValues: ComboBoxPropsType,
    isApplicantComboBox = false
  ) => (
    query.isFetching
      ? (
        <Column sm={4} md={2} lg={isApplicantComboBox ? 5 : 10}>
          <TextInputSkeleton />
        </Column>
      )
      : (
        <Column sm={4} md={2} lg={isApplicantComboBox ? 5 : 10}>
          <ComboBox
            id={isApplicantComboBox ? seedlotFormData.client.id : seedlotFormData.species.id}
            items={query.isSuccess ? query.data : []}
            shouldFilterItem={
              ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
            }
            placeholder={propsValues.placeholder}
            titleText={propsValues.titleText}
            onChange={(e: ComboBoxEvent) => handleComboBox(e, isApplicantComboBox)}
            invalid={
              isApplicantComboBox
                ? seedlotFormData.client.isInvalid
                : seedlotFormData.species.isInvalid
            }
            invalidText={propsValues.invalidText}
            helperText={query.isError ? '' : propsValues.helperText}
            disabled={query.isError}
          />
          {
            query.isError
              ? <InputErrorText description={`An error occurred ${query.error}`} />
              : null
          }
        </Column>
      )
  );

  return (
    <Column className="applicant-information-form">
      {
        seedlotMutation.isError
          ? (
            <Row className="error-row">
              <Column>
                <ActionableNotification
                  id="create-seedlot-error-banner"
                  kind="error"
                  lowContrast
                  title="Your application could not be created"
                  inline
                  actionButtonLabel=""
                  onClose={() => false}
                >
                  An error has occurred when trying to create your seedlot number.
                  Please try submiting it again later.
                  {' '}
                  {`${seedlotMutation.error.code}: ${seedlotMutation.error.message}`}
                </ActionableNotification>
              </Column>
            </Row>
          )
          : null
      }
      <Row className="applicant-agency-title">
        <Column lg={8}>
          <h2>Applicant agency</h2>
          <Subtitle text="Enter the applicant agency information" />
        </Column>
      </Row>
      <Row>
        {/* <ApplicantAgencyFields
          useDefault={}
        /> */}
      </Row>
      {/* <Row className="agency-information">
        {
          displayCombobox(applicantAgencyQuery, applicantAgencyFieldConfig, true)
        }
        <Column sm={4} md={2} lg={5}>
          <TextInput
            className="agency-number-wrapper-class"
            id="agency-number-input"
            name="number"
            type="number"
            value={seedlotFormData.locationCode.value}
            labelText="Applicant agency number"
            invalid={seedlotFormData.locationCode.isInvalid}
            placeholder={!seedlotFormData.client.value?.code ? '' : '00'}
            invalidText={invalidLocationMessage}
            disabled={!seedlotFormData.client.value?.code}
            onChange={
              (
                e: React.ChangeEvent<HTMLInputElement>
              ) => handleLocationCode(e.target.value)
            }
            onBlur={
              (
                e: React.ChangeEvent<HTMLInputElement>
              ) => handleLocationCodeBlur(seedlotFormData.client.value?.code, e.target.value)
            }
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            helperText={locationCodeHelper}
          />
          {
            validateLocationCodeMutation.isLoading
              ? <InlineLoading description="Validating..." />
              : null
          }
        </Column>
      </Row> */}
      <Row className="agency-email">
        <Column sm={4} md={4} lg={10}>
          <TextInput
            id="appliccant-email-input"
            name="email"
            type="email"
            labelText="Applicant email address"
            helperText="The Tree Seed Centre will uses it to communicate with the applicant"
            invalid={seedlotFormData.email.isInvalid}
            invalidText="Please enter a valid email"
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleEmail(e.target.value)}
          />
        </Column>
      </Row>
      {
        isSeedlot
          ? (
            <SeedlotInformation
              seedlotFormData={seedlotFormData}
              setSeedlotFormData={setSeedlotFormData}
              isEdit={isEdit}
              seedlotMutationFunc={seedlotMutation.mutate}
            />
          )
          : null // The false case is reserved for vegLog
      }
    </Column>
  );
};

export default LotApplicantAndInfoForm;
