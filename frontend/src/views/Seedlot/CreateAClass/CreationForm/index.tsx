import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, UseQueryResult, useMutation } from '@tanstack/react-query';

import {
  Row,
  Column,
  TextInput,
  RadioButtonGroup,
  RadioButton,
  Checkbox,
  CheckboxGroup,
  Button,
  ComboBox,
  TextInputSkeleton,
  InlineLoading,
  RadioButtonSkeleton,
  ActionableNotification
} from '@carbon/react';
import { DocumentAdd } from '@carbon/icons-react';
import validator from 'validator';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

import Subtitle from '../../../../components/Subtitle';
import InputErrorText from '../../../../components/InputErrorText';

import { ErrToastOption } from '../../../../config/ToastifyConfig';
import { FilterObj, filterInput } from '../../../../utils/filterUtils';
import focusById from '../../../../utils/FocusUtils';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../../config/TimeUnits';

import { SeedlotRegFormType, SeedlotRegPayloadType } from '../../../../types/SeedlotRegistrationTypes';
import SeedlotSourceType from '../../../../types/SeedlotSourceType';
import ComboBoxEvent from '../../../../types/ComboBoxEvent';

import getVegCodes from '../../../../api-service/vegetationCodeAPI';
import getApplicantAgenciesOptions from '../../../../api-service/applicantAgenciesAPI';
import { getForestClientLocation } from '../../../../api-service/forestClientsAPI';
import getSeedlotSources from '../../../../api-service/SeedlotSourcesAPI';
import { postSeedlot } from '../../../../api-service/seedlotAPI';
import { LOCATION_CODE_LIMIT } from '../../../../shared-constants/shared-constants';
import ErrorToast from '../../../../components/Toast/ErrorToast';

import ComboBoxPropsType from './definitions';
import {
  applicantAgencyFieldConfig,
  speciesFieldConfig,
  pageTexts,
  InitialSeedlotFormData
} from './constants';
import { convertToPayload } from './utils';

import './styles.scss';

const CreationForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SeedlotRegFormType>(InitialSeedlotFormData);
  const [invalidLocationMessage, setInvalidLocationMessage] = useState<string>('');
  const [locationCodeHelper, setLocationCodeHelper] = useState<string>(
    pageTexts.locCodeInput.helperTextDisabled
  );

  const setInputValidation = (inputName: keyof SeedlotRegFormType, isInvalid: boolean) => (
    setFormData((prevData) => ({
      ...prevData,
      [inputName]: {
        ...prevData[inputName],
        isInvalid
      }
    }))
  );

  const updateAfterLocValidation = (isInvalid: boolean) => {
    setInputValidation('locationCode', isInvalid);
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
    queryFn: () => getApplicantAgenciesOptions()
  });

  const vegCodeQuery = useQuery({
    queryKey: ['vegetation-codes'],
    queryFn: () => getVegCodes(true),
    staleTime: THREE_HOURS, // will not refetch for 3 hours
    cacheTime: THREE_HALF_HOURS // data is cached 3.5 hours then deleted
  });

  const setDefaultSource = (sources: SeedlotSourceType[]) => {
    sources.forEach((source) => {
      if (source.isDefault) {
        setFormData((prevData) => ({
          ...prevData,
          sourceCode: {
            ...prevData.sourceCode,
            value: source.code
          }
        }));
      }
    });
  };

  const seedlotSourcesQuery = useQuery({
    queryKey: ['seedlot-sources'],
    queryFn: () => getSeedlotSources(),
    onSuccess: (sources) => setDefaultSource(sources),
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  /**
   *  Default value is only set once upon query success, when cache data is used
   *  we will need to set the default again here.
   */
  useEffect(() => {
    if (seedlotSourcesQuery.isSuccess && !formData.sourceCode.value) {
      setDefaultSource(seedlotSourcesQuery.data);
    }
  }, [seedlotSourcesQuery.isFetched]);

  const handleLocationCodeBlur = (clientNumber: string, locationCode: string) => {
    const isInRange = validator.isInt(locationCode, { min: 0, max: 99 });
    // Padding 0 in front of single digit code
    const formattedCode = (isInRange && locationCode.length === 1)
      ? locationCode.padStart(2, '0')
      : locationCode;

    if (isInRange) {
      setFormData((prevResBody) => ({
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
    setFormData((prevResBody) => ({
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
    setFormData((prevData) => ({
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

    if (isApplicantAgency && selectedItem?.code && formData.locationCode.value) {
      validateLocationCodeMutation.mutate([selectedItem.code, formData.locationCode.value]);
    }
  };

  const handleSource = (value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      sourceCode: {
        ...prevData.sourceCode,
        value
      }
    }));
  };

  const handleEmail = (value: string) => {
    const isEmailInvalid = !validator.isEmail(value);
    setFormData((prevData) => ({
      ...prevData,
      email: {
        ...prevData.email,
        value,
        isInvalid: isEmailInvalid
      }
    }));
  };

  const handleCheckBox = (inputName: keyof SeedlotRegFormType, checked: boolean) => {
    setFormData((prevData) => ({
      ...prevData,
      [inputName]: {
        ...prevData[inputName],
        value: checked
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

  const renderSources = () => {
    if (seedlotSourcesQuery.isSuccess) {
      return seedlotSourcesQuery.data.map((source: SeedlotSourceType) => (
        <RadioButton
          key={source.code}
          checked={formData.sourceCode.value === source.code}
          id={`seedlot-source-radio-btn-${source.code.toLocaleLowerCase()}`}
          labelText={source.description}
          value={source.code}
        />
      ));
    }
    return <InputErrorText description="Could not retrieve seedlot sources." />;
  };

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
          {/* For now the default selected item will not be set,
            we need the information from each user to set the
            correct one */}
          <ComboBox
            id={isApplicantComboBox ? formData.client.id : formData.species.id}
            items={query.isSuccess ? query.data : []}
            shouldFilterItem={
              ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
            }
            placeholder={propsValues.placeholder}
            titleText={propsValues.titleText}
            onChange={(e: ComboBoxEvent) => handleComboBox(e, isApplicantComboBox)}
            invalid={isApplicantComboBox ? formData.client.isInvalid : formData.species.isInvalid}
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

  const validateAndSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate client
    if (formData.client.isInvalid || !formData.client.value.code) {
      setInputValidation('client', true);
      focusById(formData.client.id);
      return;
    }
    // Vaidate location code
    if (
      formData.locationCode.isInvalid
      || !formData.locationCode.value
      || !validateLocationCodeMutation.isSuccess
    ) {
      setInputValidation('locationCode', true);
      setInvalidLocationMessage(pageTexts.locCodeInput.invalidLocationValue);
      focusById(formData.locationCode.id);
      return;
    }
    // Validate email
    if (formData.email.isInvalid || !formData.email.value) {
      setInputValidation('email', true);
      focusById(formData.email.id);
      return;
    }
    // Validate species
    if (formData.species.isInvalid || !formData.species.value.code) {
      setInputValidation('species', true);
      focusById(formData.species.id);
      return;
    }
    // Source code, and the two booleans always have a default value so there's no need to check.

    // Submit Seedlot.
    const payload = convertToPayload(formData);
    seedlotMutation.mutate(payload);
  };

  return (
    <div className="applicant-information-form">
      <form onSubmit={validateAndSubmit}>
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
        <Row className="agency-information">
          {
            displayCombobox(applicantAgencyQuery, applicantAgencyFieldConfig, true)
          }
          <Column sm={4} md={2} lg={5}>
            <TextInput
              className="agency-number-wrapper-class"
              id="agency-number-input"
              name="number"
              type="number"
              value={formData.locationCode.value}
              labelText="Applicant agency number"
              invalid={formData.locationCode.isInvalid}
              placeholder={!formData.client.value?.code ? '' : '00'}
              invalidText={invalidLocationMessage}
              disabled={!formData.client.value?.code}
              onChange={
                (
                  e: React.ChangeEvent<HTMLInputElement>
                ) => handleLocationCode(e.target.value)
              }
              onBlur={
                (
                  e: React.ChangeEvent<HTMLInputElement>
                ) => handleLocationCodeBlur(formData.client.value?.code, e.target.value)
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
        </Row>
        <Row className="agency-email">
          <Column sm={4} md={4} lg={10}>
            <TextInput
              id="appliccant-email-input"
              name="email"
              type="email"
              labelText="Applicant email address"
              helperText="The Tree Seed Centre will uses it to communicate with the applicant"
              invalid={formData.email.isInvalid}
              invalidText="Please enter a valid email"
              onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleEmail(e.target.value)}
            />
          </Column>
        </Row>
        <Row className="seedlot-information-title">
          <Column lg={8}>
            <h2>Seedlot information</h2>
            <Subtitle text="Enter the initial information about this seedlot" />
          </Column>
        </Row>
        <Row className="seedlot-species-row">
          {
            displayCombobox(vegCodeQuery, speciesFieldConfig)
          }
        </Row>
        <Row className="class-source-radio">
          <Column sm={4} md={8} lg={16}>
            <RadioButtonGroup
              legendText="Class A source"
              name="class-source-radiogroup"
              orientation="vertical"
              onChange={(e: string) => handleSource(e)}
            >
              {
                seedlotSourcesQuery.isFetching
                  ? (
                    <RadioButtonSkeleton />
                  )
                  : renderSources()
              }
            </RadioButtonGroup>
          </Column>
        </Row>
        <Row className="registered-checkbox">
          <Column sm={4} md={8} lg={16}>
            <CheckboxGroup legendText="To be registered?">
              <Checkbox
                id="registered-tree-seed-center"
                name="registered"
                labelText="Yes, to be registered with the Tree Seed Centre"
                checked={formData.willBeRegistered.value}
                onChange={
                  (e: React.ChangeEvent<HTMLInputElement>) => handleCheckBox('willBeRegistered', e.target.checked)
                }
              />
            </CheckboxGroup>
          </Column>
        </Row>
        <Row className="collected-checkbox">
          <Column sm={4} md={8} lg={16}>
            <CheckboxGroup legendText="Collected from B.C. source?">
              <Checkbox
                id="collected-bc"
                name="collectedBC"
                labelText="Yes, collected from a location within B.C."
                checked={formData.isBcSource.value}
                onChange={
                  (e: React.ChangeEvent<HTMLInputElement>) => handleCheckBox('isBcSource', e.target.checked)
                }
              />
            </CheckboxGroup>
          </Column>
        </Row>
        <Row className="save-button">
          <Column lg={8}>
            <Button renderIcon={DocumentAdd} type="submit">
              Create seedlot number
            </Button>
          </Column>
        </Row>
      </form>
    </div>
  );
};

export default CreationForm;
