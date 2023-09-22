import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, UseQueryResult, useMutation } from '@tanstack/react-query';

import {
  Row,
  Column,
  TextInput,
  RadioButtonGroup,
  RadioButton,
  Checkbox,
  Button,
  ComboBox,
  TextInputSkeleton,
  InlineLoading
} from '@carbon/react';
import { DocumentAdd } from '@carbon/icons-react';
import validator from 'validator';

import Subtitle from '../Subtitle';
import InputErrorText from '../InputErrorText';

import getForestClientNumber from '../../utils/StringUtils';
import { FilterObj, filterInput } from '../../utils/filterUtils';

import SeedlotRegistrationObj from '../../types/SeedlotRegistrationObj';
import ComboBoxEvent from '../../types/ComboBoxEvent';

import api from '../../api-service/api';
import ApiConfig from '../../api-service/ApiConfig';
import getVegCodes from '../../api-service/vegetationCodeAPI';
import getApplicantAgenciesOptions from '../../api-service/applicantAgenciesAPI';
import getForestClientLocation from '../../api-service/forestClientsAPI';

import { LOCATION_CODE_LIMIT } from '../../shared-constants/shared-constants';

import ComboBoxPropsType from './definitions';
import {
  applicantAgencyFieldProps,
  speciesFieldProps,
  pageTexts
} from './constants';

import './styles.scss';

const ApplicantInformationForm = () => {
  const navigate = useNavigate();

  const seedlotData: SeedlotRegistrationObj = {
    seedlotNumber: 0,
    applicant: {
      name: '',
      number: '',
      email: ''
    },
    species: {
      label: '',
      code: '',
      description: ''
    },
    source: 'tested',
    registered: true,
    collectedBC: true
  };

  const agencyInputRef = useRef<HTMLInputElement>(null);
  const numberInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const speciesInputRef = useRef<HTMLButtonElement>(null);

  const [responseBody, setResponseBody] = useState<SeedlotRegistrationObj>(seedlotData);
  const [isLocationCodeInvalid, setIsLocationCodeInvalid] = useState<boolean>(false);
  const [isEmailInvalid, setIsEmailInvalid] = useState<boolean>(false);
  const [isSpeciesInvalid, setIsSpeciesInvalid] = useState<boolean>(false);
  const [forestClientNumber, setForestClientNumber] = useState<string>('');
  const [invalidLocationMessage, setInvalidLocationMessage] = useState<string>('');
  const [locationCodeHelper, setLocationCodeHelper] = useState<string>(
    pageTexts.locCodeInput.helperTextDisabled
  );

  const updateAfterLocValidation = (isInvalid: boolean) => {
    setIsLocationCodeInvalid(isInvalid);
    setLocationCodeHelper(pageTexts.locCodeInput.helperTextEnabled);
  };

  const validateLocationCodeMutation = useMutation({
    mutationFn: (queryParams:string[]) => getForestClientLocation(
      queryParams[0],
      queryParams[1]
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

  const locationCodeChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = event.target;
    setResponseBody({
      ...responseBody,
      applicant: {
        ...responseBody.applicant,
        number: (value.slice(0, LOCATION_CODE_LIMIT))
      }
    });
  };

  const validateLocationCode = () => {
    let applicantNumber = responseBody.applicant.number;
    const isInRange = validator.isInt(applicantNumber, { min: 0, max: 99 });

    // Adding this check to add an extra 0 on the left, for cases where
    // the user types values between 0 and 9
    if (isInRange && applicantNumber.length === 1) {
      applicantNumber = applicantNumber.padStart(2, '0');
      setResponseBody({
        ...responseBody,
        applicant: {
          ...responseBody.applicant,
          number: applicantNumber
        }
      });
    }

    if (!isInRange) {
      setInvalidLocationMessage(pageTexts.locCodeInput.invalidLocationValue);
      setIsLocationCodeInvalid(true);
      return;
    }

    if (forestClientNumber) {
      validateLocationCodeMutation.mutate([forestClientNumber, applicantNumber]);
      setIsLocationCodeInvalid(false);
      setLocationCodeHelper('');
    }
  };

  const inputChangeHandlerApplicant = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    setResponseBody({
      ...responseBody,
      applicant: {
        ...responseBody.applicant,
        [name]: value
      }
    });
  };

  const comboBoxChangeHandler = (event: ComboBoxEvent, isApplicantAgency: boolean) => {
    const { selectedItem } = event;
    if (isApplicantAgency) {
      setResponseBody({
        ...responseBody,
        applicant: {
          ...responseBody.applicant,
          name: selectedItem,
          number: selectedItem ? responseBody.applicant.number : ''
        }
      });
      if (!selectedItem) {
        setIsLocationCodeInvalid(false);
      }
      setForestClientNumber(selectedItem ? getForestClientNumber(selectedItem) : '');
      setLocationCodeHelper(
        selectedItem
          ? pageTexts.locCodeInput.helperTextEnabled
          : pageTexts.locCodeInput.helperTextDisabled
      );
    } else {
      setResponseBody({
        ...responseBody,
        species: selectedItem
      });
    }
  };

  const inputChangeHandlerRadio = (event: string) => {
    const value = event;
    setResponseBody({
      ...responseBody,
      source: value
    });
  };

  const inputChangeHandlerCheckboxes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setResponseBody({
      ...responseBody,
      [name]: checked
    });
  };

  const validateApplicantEmail = () => {
    if (validator.isEmail(responseBody.applicant.email)) {
      setIsEmailInvalid(false);
    } else {
      setIsEmailInvalid(true);
    }
  };

  const validateAndSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLocationCodeInvalid) {
      numberInputRef.current?.focus();
    } else if (isEmailInvalid) {
      emailInputRef.current?.focus();
    } else if (!responseBody.species.label) {
      setIsSpeciesInvalid(true);
      speciesInputRef.current?.focus();
    } else {
      const url = ApiConfig.aClassSeedlot;
      api.post(url, responseBody)
        .then((response) => {
          navigate(`/seedlots/successfully-created/${response.data.seedlotNumber}`);
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(`Error: ${error}`);
        });
    }
  };

  const displayCombobox = (
    query: UseQueryResult,
    propsValues: ComboBoxPropsType,
    isApplicantComboBox = false
  ) => {
    const { status, fetchStatus, isSuccess } = query;
    const fetchError = status === 'error';

    if (fetchStatus === 'fetching') {
      return (
        <Column sm={4} md={2} lg={isApplicantComboBox ? 5 : 10}>
          <TextInputSkeleton />
        </Column>
      );
    }
    return (
      <Column sm={4} md={2} lg={isApplicantComboBox ? 5 : 10}>
        {/* For now the default selected item will not be set,
            we need the information from each user to set the
            correct one */}
        <ComboBox
          className={propsValues.className}
          id={propsValues.id}
          ref={isApplicantComboBox ? agencyInputRef : speciesInputRef}
          items={isSuccess ? query.data : []}
          shouldFilterItem={
            ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
          }
          placeholder={propsValues.placeholder}
          titleText={propsValues.titleText}
          onChange={(e: ComboBoxEvent) => comboBoxChangeHandler(e, isApplicantComboBox)}
          invalid={!isApplicantComboBox && isSpeciesInvalid}
          invalidText={propsValues.invalidText}
          helperText={fetchError ? '' : propsValues.helperText}
          disabled={fetchError}
        />
        {
          fetchError
            ? <InputErrorText description="An error occurred" />
            : null
        }
      </Column>
    );
  };

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
            displayCombobox(applicantAgencyQuery, applicantAgencyFieldProps, true)
          }
          <Column sm={4} md={2} lg={5}>
            <TextInput
              className="agency-number-wrapper-class"
              id="agency-number-input"
              name="number"
              ref={numberInputRef}
              type="number"
              value={responseBody.applicant.number}
              labelText="Applicant agency number"
              invalid={isLocationCodeInvalid}
              placeholder={!forestClientNumber ? '' : '00'}
              invalidText={invalidLocationMessage}
              disabled={!forestClientNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => locationCodeChangeHandler(e)}
              onBlur={() => validateLocationCode()}
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
              ref={emailInputRef}
              type="email"
              labelText="Applicant email address"
              helperText="The Tree Seed Centre will uses it to communicate with the applicant"
              invalid={isEmailInvalid}
              invalidText="Please enter a valid email"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => inputChangeHandlerApplicant(e)}
              onBlur={() => validateApplicantEmail()}
            />
          </Column>
        </Row>
        <Row className="seedlot-information-title">
          <Column lg={8}>
            <h2>Seedlot information</h2>
            <Subtitle text="Enter the initial information about this seedlot" />
          </Column>
        </Row>
        <Row className="seedlot-species-combobox">
          {
            displayCombobox(vegCodeQuery, speciesFieldProps)
          }
        </Row>
        <Row className="class-source-radio">
          <Column sm={4} md={8} lg={16}>
            <RadioButtonGroup
              legendText="Class A source"
              name="class-source-radiogroup"
              orientation="vertical"
              defaultSelected="tested"
              onChange={(e: string) => inputChangeHandlerRadio(e)}
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
            <label htmlFor="registered-tree-seed-center" className="bcgov--label">
              To be registered?
            </label>
            <Checkbox
              id="registered-tree-seed-center"
              name="registered"
              labelText="Yes, to be registered with the Tree Seed Centre"
              defaultChecked
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => inputChangeHandlerCheckboxes(e)}
            />
          </Column>
        </Row>
        <Row className="collected-checkbox">
          <Column sm={4} md={8} lg={16}>
            <label htmlFor="collected-bc" className="bcgov--label">
              Collected from B.C. source?
            </label>
            <Checkbox
              id="collected-bc"
              name="collectedBC"
              labelText="Yes, collected from a location within B.C."
              defaultChecked
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => inputChangeHandlerCheckboxes(e)}
            />
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
