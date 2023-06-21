import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import {
  Row,
  Column,
  TextInput,
  NumberInput,
  RadioButtonGroup,
  RadioButton,
  Checkbox,
  Button,
  ComboBox,
  InlineLoading
} from '@carbon/react';
import { DocumentAdd } from '@carbon/icons-react';

import Subtitle from '../Subtitle';
import InputErrorText from '../InputErrorText';

import SeedlotRegistrationObj from '../../types/SeedlotRegistrationObj';

import { FilterObj, filterInput } from '../../utils/filterUtils';
import ComboBoxEvent from '../../types/ComboBoxEvent';
import api from '../../api-service/api';
import ApiConfig from '../../api-service/ApiConfig';
import getVegCodes from '../../api-service/vegetationCodeAPI';

import './styles.scss';

const ApplicantInformationForm = () => {
  const mockAgencyOptions: Array<string> = [
    '0032 - Strong Seeds Orchard - SSO',
    '0035 - Weak Seeds Orchard - WSO',
    '0038 - Okay Seeds Orchard - OSO'
  ];

  const navigate = useNavigate();

  const seedlotData: SeedlotRegistrationObj = {
    seedlotNumber: 0,
    applicant: {
      name: mockAgencyOptions[0],
      number: '0',
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

  const nameInputRef = useRef<HTMLInputElement>(null);
  const numberInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const speciesInputRef = useRef<HTMLButtonElement>(null);

  const [responseBody, setResponseBody] = useState<SeedlotRegistrationObj>(seedlotData);
  const [invalidNumber, setInvalidNumber] = useState<boolean>(false);
  const [invalidEmail, setInvalidEmail] = useState<boolean>(false);
  const [invalidSpecies, setInvalidSpecies] = useState<boolean>(false);

  const vegCodeQuery = useQuery({
    queryKey: ['vegetation-codes'],
    queryFn: getVegCodes
  });

  const inputChangeHandlerApplicant = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setResponseBody({
      ...responseBody,
      applicant: {
        ...responseBody.applicant,
        [name]: value
      }
    });
  };

  const comboBoxChangeHandlerApplicant = (event: ComboBoxEvent) => {
    const { selectedItem } = event;
    setResponseBody({
      ...responseBody,
      applicant: {
        ...responseBody.applicant,
        name: selectedItem
      }
    });
  };

  const inputChangeHandlerSpecies = (event: any) => {
    if (invalidSpecies) {
      setInvalidSpecies(false);
    }

    const { selectedItem } = event;
    setResponseBody({
      ...responseBody,
      species: selectedItem
    });
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

  const validateApplicantNumber = () => {
    const intNumber = +responseBody.applicant.number;
    if (intNumber < 0 || intNumber > 99) {
      setInvalidNumber(true);
    } else {
      setInvalidNumber(false);
    }
  };

  const validateApplicantEmail = () => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (!emailRegex.test(responseBody.applicant.email)) {
      setInvalidEmail(true);
    } else {
      setInvalidEmail(false);
    }
  };

  const validateAndSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (invalidNumber) {
      numberInputRef.current?.focus();
    } else if (invalidEmail) {
      emailInputRef.current?.focus();
    } else if (!responseBody.species.label) {
      setInvalidSpecies(true);
      speciesInputRef.current?.focus();
    } else {
      const url = ApiConfig.aClassSeedlot;
      api.post(url, responseBody)
        .then((response) => {
          navigate(`/seedlot/successfully-created/${response.data.seedlotNumber}`);
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(`Error: ${error}`);
        });
    }
  };

  const displaySpeciesStatus = () => {
    const { status } = vegCodeQuery;
    if (status === 'loading') {
      return (
        <InlineLoading description="Loading..." />
      );
    }
    if (status === 'error') {
      return (
        <InputErrorText description="An error occurred" />
      );
    }
    return null;
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
          <Column sm={4} md={2} lg={5}>
            <ComboBox
              id="agency-name-combobox"
              ref={nameInputRef}
              name="name"
              items={mockAgencyOptions}
              initialSelectedItem={mockAgencyOptions[0]}
              shouldFilterItem={
                ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
              }
              placeholder="Select an agency..."
              titleText="Applicant agency name"
              helperText="You can enter your agency number, name or acronym"
              onChange={(e: ComboBoxEvent) => comboBoxChangeHandlerApplicant(e)}
            />
          </Column>
          <Column sm={4} md={2} lg={5}>
            <NumberInput
              id="agency-number-input"
              name="number"
              ref={numberInputRef}
              min={0}
              max={99}
              disableWheel
              hideSteppers
              type="text"
              label="Applicant agency number"
              invalid={invalidNumber}
              invalidText="Please enter a valid value between 0 and 99"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => inputChangeHandlerApplicant(e)}
              onBlur={() => validateApplicantNumber()}
              helperText="2-digit code that identifies the address of operated office or division"
              defaultValue={0}
            />
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
              invalid={invalidEmail}
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
          <Column sm={4} md={4} lg={10}>
            <ComboBox
              className="applicant-info-combobox"
              id="applicant-info-combobox-species"
              ref={speciesInputRef}
              items={vegCodeQuery.isSuccess ? vegCodeQuery.data : []}
              selectedItem={responseBody.species}
              shouldFilterItem={
                ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
              }
              placeholder="Enter or choose an species for the seedlot"
              titleText="Seedlot species"
              onChange={(e: ComboBoxEvent) => inputChangeHandlerSpecies(e)}
              invalid={invalidSpecies}
              invalidText="Please select a species"
            />
            {
              displaySpeciesStatus()
            }
          </Column>
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
