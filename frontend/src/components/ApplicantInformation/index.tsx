import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import {
  Row,
  Column,
  TextInput,
  NumberInput,
  Dropdown,
  RadioButtonGroup,
  RadioButton,
  Checkbox,
  Button
} from '@carbon/react';
import { DocumentAdd } from '@carbon/icons-react';

import Subtitle from '../Subtitle';

import SeedlotRegistration from '../../types/SeedlotRegistration';
import GeneticClassesType from '../../types/GeneticClasses';

import getUrl from '../../utils/ApiUtils';
import ApiAddresses from '../../utils/ApiAddresses';
import { useAuth } from '../../contexts/AuthContext';

import './styles.scss';

const ApplicantInformation = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const getAxiosConfig = () => {
    const axiosConfig = {};
    if (token) {
      const headers = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      Object.assign(axiosConfig, headers);
    }
    return axiosConfig;
  };

  const seedlotData: SeedlotRegistration = {
    seedlotNumber: 0,
    applicant: {
      name: '',
      number: '',
      email: ''
    },
    species: '',
    source: 'tested',
    registered: true,
    collectedBC: true
  };

  const nameInputRef = useRef<HTMLInputElement>(null);
  const numberInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const speciesInputRef = useRef<HTMLButtonElement>(null);

  const [responseBody, setResponseBody] = useState<SeedlotRegistration>(seedlotData);
  const [invalidName, setInvalidName] = useState<boolean>(false);
  const [invalidNumber, setInvalidNumber] = useState<boolean>(false);
  const [invalidEmail, setInvalidEmail] = useState<boolean>(false);
  const [invalidSpecies, setInvalidSpecies] = useState<boolean>(false);

  const [geneticClasses, setGeneticClasses] = useState<string[]>([]);

  const getGeneticClasses = () => {
    axios.get(getUrl(ApiAddresses.GeneticClassesRetrieveAll), getAxiosConfig())
      .then((response) => {
        const classes: string[] = [];
        if (response.data.geneticClasses) {
          response.data.geneticClasses.forEach((element: GeneticClassesType) => {
            classes.push(element.description);
          });
        }
        setGeneticClasses(classes);
      })
      .catch((error) => {
        // eslint-disable-next-line
        console.error(`Error: ${error}`);
      });
  };

  getGeneticClasses();

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

  const validateApplicantName = () => {
    const nameRegex = /^[a-z]+(?:['-.\s][a-z]+)*$/i;
    if (!nameRegex.test(responseBody.applicant.name)) {
      setInvalidName(true);
    } else {
      setInvalidName(false);
    }
  };

  const validateApplicantNumber = () => {
    const intNumber = +responseBody.applicant.number;
    if (intNumber <= 0 || intNumber >= 99) {
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

    if (invalidName) {
      nameInputRef.current?.focus();
    } else if (invalidNumber) {
      numberInputRef.current?.focus();
    } else if (invalidEmail) {
      emailInputRef.current?.focus();
    } else if (!responseBody.species) {
      setInvalidSpecies(true);
      speciesInputRef.current?.focus();
    } else {
      axios.post(getUrl(ApiAddresses.AClassSeedlotPost), responseBody, getAxiosConfig())
        .then((response) => {
          navigate('/seedlot/successfully-created/' + response.data.seedlotNumber);
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(`Error: ${error}`);
        });
    }
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
            <TextInput
              id="agency-name-input"
              ref={nameInputRef}
              name="name"
              type="text"
              labelText="Applicant agency name"
              enableCounter
              maxCount={8}
              invalid={invalidName}
              invalidText="Please enter a valid name"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => inputChangeHandlerApplicant(e)}
              onBlur={() => validateApplicantName()}
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
            />
          </Column>
        </Row>
        <Row className="agency-email">
          <Column sm={4} md={4} lg={10}>
            <TextInput
              id="appliccant-email-input"
              name="email"
              ref={emailInputRef}
              type="text"
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
        <Row className="seedlot-species-dropdown">
          <Column sm={4} md={4} lg={10}>
            <Dropdown
              id="seedlot-species-dropdown"
              ref={speciesInputRef}
              titleText="Seedlot species"
              helperText="Type or search for the seedlot species using the drop-down list"
              label="Enter or choose an species for the seedlot"
              invalid={invalidSpecies}
              invalidText="Please select a species"
              items={geneticClasses}
              onChange={(e: any) => inputChangeHandlerSpecies(e)}
            />
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

export default ApplicantInformation;
