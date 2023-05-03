import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  Row,
  Column,
  NumberInput,
  TextInput,
  Dropdown,
  ComboBox,
  RadioButtonGroup,
  RadioButton,
  Checkbox,
  Button
} from '@carbon/react';
import { Add, TrashCan } from '@carbon/icons-react';

import Subtitle from '../../Subtitle';

import SeedlotRegistration from '../../../types/SeedlotRegistration';
import { SeedlotOrchard } from '../../../types/SeedlotTypes/SeedlotOrchard';

import api from '../../../api-service/api';
import ApiConfig from '../../../api-service/ApiConfig';
import { filterInput, FilterObj } from '../../../utils/filterUtils';

import FemaleGameticOptions from './data';
import ComboBoxEvent from '../../../types/ComboBoxEvent';

import './styles.scss';

type NumStepperVal = {
  value: number,
  direction: string
}

interface OrchardStepProps {
  state: SeedlotOrchard
  setStepData: Function
  readOnly?: boolean
}

const OrchardStep = ({
  state, setStepData, readOnly
}: OrchardStepProps) => {
  const { seedlot } = useParams();
  const [seedlotApplicantData, setSeedlotApplicantData] = useState<SeedlotRegistration>();
  const [isPLISpecies, setIsPLISpecies] = useState<boolean>();

  const getSeedlotData = () => {
    if (seedlot) {
      const url = `${ApiConfig.seedlot}/${seedlot}`;
      api.get(url)
        .then((response) => {
          if (response.data.seedlotApplicantInfo) {
            setSeedlotApplicantData(response.data.seedlotApplicantInfo);
            setIsPLISpecies(response.data.seedlotApplicantInfo.species.code === 'PLI');
          }
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(`Error: ${error}`);
        });
    }
  };

  useEffect(() => {
    getSeedlotData();
  }, []);

  // Fixed messages
  const orchardIdNotFound = 'This id has no orchard assigned to it, please try a different one';
  const invalidOrchardValue = 'Please insert a valid orchard id between 100 and 999';

  const refControl = useRef<any>({});

  const [additionalOrchard, setAdditionalOrchard] = useState<boolean>(false);

  const [invalidOrchardId, setInvalidOrchardId] = useState<boolean>(false);
  const [invalidOrchardText, setInvalidOrchardText] = useState<string>(invalidOrchardValue);
  const [invalidAddOrchardId, setInvalidAddOrchardId] = useState<boolean>(false);
  const [invalidAddOrchardText, setInvalidAddOrchardText] = useState<string>(invalidOrchardValue);
  const [invalidFemGametic, setInvalidFemGametic] = useState<boolean>(false);
  const [invalidMalGametic, setInvalidMalGametic] = useState<boolean>(false);
  const [invalidBreeding, setInvalidBreeding] = useState<boolean>(false);

  const addRefs = (element: HTMLInputElement, name: string) => {
    if (element !== null) {
      refControl.current = {
        ...refControl.current,
        [name]: element
      };
    }
  };

  const setResponse = (field: string[], value: string[] | boolean) => {
    const isStrArray = Array.isArray(value);

    if (field.length === 1) {
      setStepData({
        ...state,
        [field[0]]: isStrArray ? value[0] : value
      });
    } else {
      // It only get here if we are setting 2 fields,
      // so there is no need for a 'for' or a 'map'
      setStepData({
        ...state,
        [field[0]]: isStrArray ? value[0] : value,
        [field[1]]: isStrArray ? value[1] : value
      });
    }
  };

  const validateOrchardId = (event: React.ChangeEvent<HTMLInputElement>, nameField: string) => {
    const { value, name } = event.target;
    if (value) {
      const url = `${ApiConfig.orchard}/${value}`;
      api.get(url)
        .then((response) => {
          if (response.data.orchard) {
            // Clear any errors, if any
            if (name === 'orchardId' && invalidOrchardId) {
              setInvalidOrchardId(false);
              setInvalidOrchardText(invalidOrchardValue);
            } else if (invalidAddOrchardId) {
              setInvalidAddOrchardId(false);
              setInvalidAddOrchardText(invalidOrchardValue);
            }

            setResponse([name, nameField], [value, response.data.orchard.name]);

            // Set error messages for id not found
          } else if (name === 'orchardId') {
            setInvalidOrchardText(orchardIdNotFound);
            setInvalidOrchardId(true);
          } else {
            setInvalidAddOrchardText(orchardIdNotFound);
            setInvalidAddOrchardId(true);
          }
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(`Error: ${error}`);
        });
    } else if (name === 'orchardId') {
      setInvalidOrchardId(true);
      setInvalidOrchardText(invalidOrchardValue);
    } else {
      setInvalidAddOrchardId(true);
      setInvalidAddOrchardText(invalidOrchardValue);
    }
  };

  const clearOrchardName = (nameField: string) => {
    setResponse([nameField], ['']);
  };

  const deleteAdditionalOrchard = () => {
    setResponse(['additionalId', 'additionalName'], ['', '']);
    setInvalidAddOrchardId(false);
    setInvalidAddOrchardText(invalidOrchardValue);
    setAdditionalOrchard(false);
  };

  const femaleGameticHandler = (event: ComboBoxEvent) => {
    if (invalidFemGametic) {
      setInvalidFemGametic(false);
    }
    const { selectedItem } = event;
    setResponse(['femaleGametic'], [selectedItem]);
  };

  const maleGameticHandler = (event: string) => {
    if (invalidMalGametic) {
      setInvalidMalGametic(false);
    }
    const value = event;
    setResponse(['maleGametic'], [value]);
  };

  const checkboxesHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setResponse([name], checked);
  };

  const validateBreedingPercentage = () => {
    const intNumber = +state.breedingPercentage;
    if (intNumber < 0
      || intNumber > 100
      || !state.breedingPercentage) {
      setInvalidBreeding(true);
    } else {
      setInvalidBreeding(false);
    }
  };

  return (
    <div className="seedlot-orchard-step-form">
      <form>
        <Row className="seedlot-orchard-title-row">
          <Column lg={8}>
            <h2>Orchard information</h2>
            <Subtitle text="Enter the contributing orchard information" />
          </Column>
        </Row>
        <Row className="seedlot-orchard-field">
          <Column sm={4} md={2} lg={3}>
            <NumberInput
              id="seedlot-orchard-number-input"
              name="orchardId"
              ref={(el: HTMLInputElement) => addRefs(el, 'orchardId')}
              value={state.orchardId}
              allowEmpty
              min={100}
              max={999}
              disableWheel
              hideSteppers
              type="number"
              label="Orchard ID or number"
              placeholder="Example: 123"
              invalid={invalidOrchardId}
              invalidText={invalidOrchardText}
              onBlur={(event: React.ChangeEvent<HTMLInputElement>) => validateOrchardId(event, 'orchardName')}
              onChange={() => state.orchardName && clearOrchardName('orchardName')}
              readOnly={readOnly}
            />
          </Column>
          <Column sm={4} md={2} lg={3}>
            <TextInput
              id="seedlot-orchard-name-input"
              type="text"
              labelText="Orchard name"
              placeholder="Orchard name"
              value={state.orchardName}
              readOnly={readOnly}
            />
          </Column>
        </Row>
        <Row className={additionalOrchard ? 'seedlot-orchard-field' : 'seedlot-orchard-hidden'}>
          <Column sm={4} md={2} lg={3}>
            <NumberInput
              id="seedlot-aditional-orchard-number-input"
              name="additionalId"
              ref={(el: HTMLInputElement) => addRefs(el, 'additionalId')}
              value={state.additionalId}
              allowEmpty
              min={100}
              max={999}
              disableWheel
              hideSteppers
              type="number"
              label="Additional orchard ID (optional)"
              helperText="Additional contributing orchard id"
              placeholder="Example: 123"
              invalid={invalidAddOrchardId}
              invalidText={invalidAddOrchardText}
              onBlur={(event: React.ChangeEvent<HTMLInputElement>) => validateOrchardId(event, 'additionalName')}
              onChange={() => state.additionalName && clearOrchardName('additionalName')}
              readOnly={readOnly}
            />
          </Column>
          <Column sm={4} md={2} lg={3}>
            <TextInput
              id="seedlot-aditional-orchard-name-input"
              type="text"
              labelText="Orchard name (optional)"
              placeholder="Orchard name"
              value={state.additionalName}
              readOnly={readOnly}
            />
          </Column>
        </Row>
        {(!readOnly) && (
          <Row className="seedlot-orchard-add-orchard">
            <Column sm={4} md={4} lg={10}>
              <Button
                size="md"
                className={additionalOrchard ? 'seedlot-orchard-hidden' : ''}
                kind="tertiary"
                renderIcon={Add}
                onClick={() => setAdditionalOrchard(true)}
              >
                Add orchard
              </Button>
              <Button
                size="md"
                className={additionalOrchard ? '' : 'seedlot-orchard-hidden'}
                kind="danger--tertiary"
                renderIcon={TrashCan}
                onClick={() => deleteAdditionalOrchard()}
              >
                Delete additional orchard
              </Button>
            </Column>
          </Row>
        )}
        <Row className="seedlot-orchard-title-row">
          <Column lg={8}>
            <h2>Gamete information</h2>
            <Subtitle text="Enter the seedlot gamete information" />
          </Column>
        </Row>
        <Row className="seedlot-orchard-field">
          <Column sm={4} md={4} lg={6}>
            <Dropdown
              id="seedlot-species-dropdown"
              titleText="Seedlot species"
              label="Seedlot species"
              selectedItem={seedlotApplicantData?.species}
              readOnly
              items={[seedlotApplicantData?.species]}
            />
          </Column>
        </Row>
        <Row className="seedlot-orchard-field">
          <Column sm={4} md={4} lg={6}>
            <ComboBox
              id="female-gametic-combobox"
              name="femaleGametic"
              ref={(el: HTMLInputElement) => addRefs(el, 'femaleGametic')}
              items={isPLISpecies ? FemaleGameticOptions : FemaleGameticOptions.slice(0, -2)}
              shouldFilterItem={
                ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
              }
              placeholder="Choose a female contribution method"
              titleText="Female gametic contribution methodology"
              invalid={invalidFemGametic}
              invalidText="Please select an option"
              onChange={(e: ComboBoxEvent) => femaleGameticHandler(e)}
              readOnly={readOnly}
              selectedItem={state.femaleGametic}
            />
          </Column>
        </Row>
        <Row className="seedlot-orchard-field">
          <Column sm={4} md={8} lg={16}>
            {
              // Dynamic rendering of radio buttons does not work with carbon radio button groups
              // So we are left with these gross duplicated code
              isPLISpecies
                ? (
                  <RadioButtonGroup
                    legendText="Male gametic contribution methodology"
                    name="male-gametic-radiogroup"
                    orientation="vertical"
                    className={invalidMalGametic ? 'male-gametic-invalid' : ''}
                    onChange={(e: string) => maleGameticHandler(e)}
                    valueSelected={state.maleGametic}
                  >
                    <RadioButton
                      id="m1-radio"
                      labelText="M1 - Portion of ramets in orchard"
                      value="M1"
                    />
                    <RadioButton
                      id="m2-radio"
                      labelText="M2 - Pollen volume estimate by partial survey"
                      value="M2"
                    />
                    <RadioButton
                      id="m3-radio"
                      labelText="M3 - Pollen volume estimate by 100% survey"
                      value="M3"
                    />
                    <RadioButton
                      id="m4-radio"
                      labelText="M4 - Ramet proportion by clone"
                      value="M4"
                    />
                    <RadioButton
                      id="m5-radio"
                      labelText="M5 - Ramet proportion by age and expected production"
                      value="M5"
                    />
                  </RadioButtonGroup>
                )
                : (
                  <RadioButtonGroup
                    legendText="Male gametic contribution methodology"
                    name="male-gametic-radiogroup"
                    orientation="vertical"
                    className={invalidMalGametic ? 'male-gametic-invalid' : ''}
                    onChange={(e: string) => maleGameticHandler(e)}
                    valueSelected={state.maleGametic}
                  >
                    <RadioButton
                      id="m1-radio"
                      labelText="M1 - Portion of ramets in orchard"
                      value="M1"
                    />
                    <RadioButton
                      id="m2-radio"
                      labelText="M2 - Pollen volume estimate by partial survey"
                      value="M2"
                    />
                    <RadioButton
                      id="m3-radio"
                      labelText="M3 - Pollen volume estimate by 100% survey"
                      value="M3"
                    />
                  </RadioButtonGroup>
                )
            }
          </Column>
        </Row>
        <Row className="seedlot-orchard-field">
          <Column sm={4} md={8} lg={16}>
            <label htmlFor="seedlot-produced" className="bcgov--label">
              Was the seedlot produced through controlled crosses?
            </label>
            <Checkbox
              id="seedlot-produced"
              name="controlledCross"
              labelText="No, the seedlot was not produced through controlled crosses"
              defaultChecked={state.controlledCross}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => checkboxesHandler(event)}
              readOnly={readOnly}
            />
          </Column>
        </Row>
        <Row className="seedlot-orchard-field">
          <Column sm={4} md={8} lg={16}>
            <label htmlFor="bio-processes" className="bcgov--label">
              Have biotechnological processes been used to produce this seedlot?
            </label>
            <Checkbox
              id="bio-processes"
              name="biotechProcess"
              labelText="No, biotechnological processes have not been used to produce this seedlot"
              defaultChecked={state.biotechProcess}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => checkboxesHandler(event)}
              readOnly={readOnly}
            />
          </Column>
        </Row>
        <Row className="seedlot-orchard-title-row">
          <Column lg={8}>
            <h2>Pollen information</h2>
            <Subtitle text="Enter the pollen contaminant information" />
          </Column>
        </Row>
        <Row className="seedlot-orchard-field">
          <Column sm={4} md={8} lg={16}>
            <label htmlFor="pollen-contamination" className="bcgov--label">
              Was pollen contamination present?
            </label>
            <Checkbox
              id="pollen-contamination"
              name="noPollenContamination"
              labelText="No, there was no pollen contamination present in the seed orchard"
              defaultChecked={state.noPollenContamination}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => checkboxesHandler(event)}
              readOnly={readOnly}
            />
          </Column>
        </Row>
        <div className={!state.noPollenContamination ? '' : 'seedlot-orchard-hidden'}>
          <Row className="seedlot-orchard-field">
            <Column sm={4} md={4} lg={6}>
              <NumberInput
                id="pollen-percentage-number-input"
                name="breedingPercentage"
                ref={(el: HTMLInputElement) => addRefs(el, 'breedingPercentage')}
                min={0}
                max={100}
                value={0}
                step={10}
                disableWheel
                type="number"
                label="Contaminant pollen breeding percentage (optional) (%)"
                helperText="If contaminant pollen was present and the contaminant pollen has a breeding value"
                invalid={invalidBreeding}
                invalidText="Please enter a valid value between 0 and 100"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (e?.target?.name && e?.target?.value) {
                    setResponse([e.target.name], [e.target.value]);
                  }
                }}
                onClick={
                  (
                    _e: React.MouseEvent<HTMLButtonElement>,
                    target: NumStepperVal | undefined
                  ) => {
                    // A guard is needed here because any click on the input will emit a
                    //   click event, not necessarily the + - buttons
                    if (target?.value) {
                      setResponse(['breedingPercentage'], [String(target.value)]);
                    }
                  }
                }
                onBlur={() => validateBreedingPercentage()}
                readOnly={readOnly}
              />
            </Column>
          </Row>
          <Row className="pollen-methodology-checkbox">
            <Column sm={4} md={8} lg={16}>
              <label htmlFor="pollen-methodology" className="bcgov--label">
                Contaminant pollen methodology
              </label>
              <Checkbox
                id="pollen-methodology"
                name="pollenMethodology"
                labelText="Regional pollen monitoring"
                defaultChecked={state.pollenMethodology}
                readOnly={readOnly}
              />
            </Column>
          </Row>
        </div>
      </form>
    </div>
  );
};

export default OrchardStep;
