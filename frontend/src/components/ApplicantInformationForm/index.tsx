import React, { useState } from 'react';
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
  InlineLoading
} from '@carbon/react';
import { DocumentAdd } from '@carbon/icons-react';
import validator from 'validator';

import Subtitle from '../Subtitle';
import InputErrorText from '../InputErrorText';

import { FilterObj, filterInput } from '../../utils/filterUtils';

import { SeedlotRegFormType } from '../../types/SeedlotRegistrationTypes';
import ComboBoxEvent from '../../types/ComboBoxEvent';

import getVegCodes from '../../api-service/vegetationCodeAPI';
import getApplicantAgenciesOptions from '../../api-service/applicantAgenciesAPI';
import getForestClientLocation from '../../api-service/forestClientsAPI';

import { LOCATION_CODE_LIMIT } from '../../shared-constants/shared-constants';

import ComboBoxPropsType from './definitions';
import {
  applicantAgencyFieldConfig,
  speciesFieldConfig,
  pageTexts,
  InitialSeedlotFormData
} from './constants';

import './styles.scss';

const ApplicantInformationForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SeedlotRegFormType>(InitialSeedlotFormData);
  const [invalidLocationMessage, setInvalidLocationMessage] = useState<string>('');
  const [locationCodeHelper, setLocationCodeHelper] = useState<string>(
    pageTexts.locCodeInput.helperTextDisabled
  );

  const updateAfterLocValidation = (isInvalid: boolean) => {
    setFormData((prevData) => ({
      ...prevData,
      locationCode: {
        ...prevData.locationCode,
        isInvalid
      }
    }));
    setLocationCodeHelper(pageTexts.locCodeInput.helperTextEnabled);
  };

  const validateLocationCodeMutation = useMutation({
    mutationFn: (queryParams: string[]) => getForestClientLocation(
      queryParams[0], // Client Number
      queryParams[1] // Location Code
    ),
    onError: () => {
      setInvalidLocationMessage(pageTexts.locCodeInput.invalidLocationForSelectedAgency);
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
    queryFn: () => getVegCodes(true)
  });

  const handleLocationCodeBlur = (clientNumber: string, locationCode: string) => {
    const isInRange = validator.isInt(locationCode, { min: 0, max: 99 });
    const formattedCode = (isInRange && locationCode.length === 1)
      ? locationCode.padStart(2, '0')
      : locationCode;

    // Adding this check to add an extra 0 on the left, for cases where
    // the user types values between 0 and 9
    if (isInRange) {
      setFormData((prevResBody) => ({
        ...prevResBody,
        locationCode: {
          ...prevResBody.locationCode,
          value: formattedCode,
          isInvalid: !isInRange
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
    setFormData((prevData) => ({
      ...prevData,
      [inputName]: {
        ...prevData[inputName],
        value: selectedItem?.code ? selectedItem : {
          code: '',
          label: '',
          description: ''
        }
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
      [inputName]: checked
    }));
  };

  const validateAndSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(formData);
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

  return (
    <div className="applicant-information-form">
      <form onSubmit={validateAndSubmit}>
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
              defaultSelected="tested"
              onChange={(e: string) => handleSource(e)}
            >
              <RadioButton
                id="tested-radio"
                labelText="Tested parent trees"
                value="tested"
              />
              <RadioButton
                id="untested-radio"
                labelText="Untested parent trees"
                value="untested"
              />
              <RadioButton
                id="custom-radio"
                labelText="Custom seedlot"
                value="custom"
              />
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
                checked={formData.willBeRegistered}
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
                checked={formData.isBcSource}
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

export default ApplicantInformationForm;
