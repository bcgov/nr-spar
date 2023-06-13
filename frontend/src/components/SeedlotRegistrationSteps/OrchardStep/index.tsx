/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState } from 'react';
import { useQueries, useQueryClient } from '@tanstack/react-query';

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
  Button,
  InlineLoading
} from '@carbon/react';
import { Add, TrashCan } from '@carbon/icons-react';
import InputErrorText from '../../InputErrorText';

import Subtitle from '../../Subtitle';
import { OrchardForm, OrchardObj } from './definitions';
import { MAX_ORCHARDS } from './constants';

import { getOrchardByID } from '../../../api-service/orchardAPI';
import { filterInput, FilterObj } from '../../../utils/filterUtils';

import FemaleGameticOptions from './data';
import ComboBoxEvent from '../../../types/ComboBoxEvent';
import DropDownObj from '../../../types/DropDownObject';
import OrchardDataType from '../../../types/OrchardDataType';

import './styles.scss';

type NumStepperVal = {
  value: number,
  direction: string
}

interface OrchardStepProps {
  seedlotSpecies: DropDownObj
  state: OrchardForm
  setStepData: Function,
  cleanParentTables: Function,
  readOnly?: boolean
}

const OrchardStep = ({
  seedlotSpecies, state, setStepData, cleanParentTables, readOnly
}: OrchardStepProps) => {
  const queryClient = useQueryClient();
  const [isPLISpecies] = useState<boolean>(seedlotSpecies.code === 'PLI');

  const refControl = useRef<any>({});
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

  // Set orchard name by input id, if data is not present then clear orcahrd name
  const setOrchardName = (inputId: number, data?: OrchardDataType) => {
    const newOrchards = [...state.orchards];
    /**
     * It is safe to replace item in array by index here
     * since the array is not mutable at this stage
     */
    const replaceIndex = newOrchards.findIndex((orchard) => orchard.inputId === inputId);
    if (data?.name && data.vegetationCode && data.stageCode) {
      newOrchards[replaceIndex].orchardLabel = `${data.name} - ${data.vegetationCode} - ${data.stageCode}`;
    } else {
      newOrchards[replaceIndex].orchardLabel = '';
    }
    setStepData({
      ...state,
      orchards: newOrchards
    });
  };

  useQueries({
    queries:
      state.orchards.map((orchard) => ({
        queryKey: ['orchard', orchard.orchardId],
        queryFn: () => getOrchardByID(orchard.orchardId),
        onSuccess: (data: OrchardDataType) => setOrchardName(orchard.inputId, data),
        onError: () => setOrchardName(orchard.inputId),
        enabled: orchard.orchardId.length > 0 && !readOnly,
        retry: 0,
        refetchOnMount: false,
        refetchOnWindowFocus: false
      }))
  });

  const fetchOrchardInfo = (orchardId: string, inputId: number) => {
    cleanParentTables();
    // Copy orchards from state
    const newOrchards = [...state.orchards];
    // Replace input value with id
    const replaceIndex = newOrchards.findIndex((orchard) => orchard.inputId === inputId);
    newOrchards[replaceIndex].orchardId = orchardId;
    setStepData({
      ...state,
      orchards: newOrchards
    });
    queryClient.refetchQueries({ queryKey: ['orchard', orchardId] });
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

  const addOrchardObj = () => {
    const orchards = [...state.orchards];
    const numOfOrchard = orchards.length;
    if (numOfOrchard < MAX_ORCHARDS) {
      const newOrchard: OrchardObj = {
        inputId: numOfOrchard,
        orchardId: '',
        orchardLabel: ''
      };
      orchards.push(newOrchard);
      setStepData({
        ...state,
        orchards
      });
    }
  };

  const deleteOrchardObj = () => {
    const orchards = [...state.orchards];
    const numOfOrchard = orchards.length;
    const newOrchards = orchards.filter((orchard) => orchard.inputId !== (numOfOrchard - 1));
    setStepData({
      ...state,
      orchards: newOrchards
    });
  };

  const displayOrchNameStatus = (orchard: OrchardObj) => {
    const status = queryClient.getQueryState(['orchard', orchard.orchardId])?.status;
    if (status === 'loading' && orchard.orchardId.length > 0) {
      return (
        <InlineLoading description="Loading..." />
      );
    }
    if (status === 'error' && orchard.orchardId.length > 0) {
      return (
        <InputErrorText description="Orchard name not found" />
      );
    }
    return null;
  };

  return (
    <div className="seedlot-orchard-step-form">
      <form>
        <Row className="seedlot-orchard-title-row">
          <Column sm={4} md={8} lg={16}>
            <h2>Orchard information</h2>
            <Subtitle text="Enter the contributing orchard information" />
          </Column>
        </Row>
        {
          state.orchards.map((orchard) => (
            <Row className="seedlot-orchard-field" key={orchard.inputId}>
              <Column sm={4} md={4} lg={8} xlg={6}>
                <NumberInput
                  id={`orchardId-${orchard.inputId}`}
                  name="orchardId"
                  ref={(el: HTMLInputElement) => addRefs(el, `orchardId-${orchard.inputId}`)}
                  value={orchard.orchardId}
                  invalidText="Please insert a valid orchard id between 100 and 999"
                  allowEmpty
                  min={100}
                  max={999}
                  disableWheel
                  hideSteppers
                  type="number"
                  label={orchard.inputId === 0 ? 'Orchard ID or number' : 'Additional orchard ID (optional)'}
                  placeholder="Example: 123"
                  onBlur={
                    (event: React.ChangeEvent<HTMLInputElement>) => {
                      fetchOrchardInfo(event.target.value, orchard.inputId);
                    }
                  }
                  readOnly={readOnly}
                />
              </Column>
              <Column sm={4} md={4} lg={8} xlg={6}>
                <TextInput
                  id={`orchardName-${orchard.inputId}`}
                  type="text"
                  labelText={orchard.inputId === 0 ? 'Orchard name' : 'Orchard name (optional)'}
                  placeholder="Orchard name"
                  value={orchard.orchardLabel}
                  readOnly
                />
                {
                  displayOrchNameStatus(orchard)
                }
              </Column>
            </Row>
          ))
        }
        {
          (!readOnly && state.orchards.length !== 1)
            ? (
              <Row className="seedlot-orchard-add-orchard">
                <Column sm={4} md={4} lg={10}>
                  <Button
                    size="md"
                    kind="danger--tertiary"
                    renderIcon={TrashCan}
                    onClick={() => deleteOrchardObj()}
                  >
                    Delete additional orchard
                  </Button>
                </Column>
              </Row>
            )
            : (
              <Row className="seedlot-orchard-add-orchard">
                <Column sm={4} md={4} lg={10}>
                  <Button
                    size="md"
                    kind="tertiary"
                    renderIcon={Add}
                    onClick={() => addOrchardObj()}
                  >
                    Add orchard
                  </Button>
                </Column>
              </Row>
            )
        }
        <Row className="seedlot-orchard-title-row">
          <Column sm={4} md={8} lg={16}>
            <h2>Gamete information</h2>
            <Subtitle text="Enter the seedlot gamete information" />
          </Column>
        </Row>
        <Row className="seedlot-orchard-field">
          <Column sm={4} md={8} lg={16} xlg={12}>
            <Dropdown
              id="seedlot-species-dropdown"
              titleText="Seedlot species"
              label="Seedlot species"
              selectedItem={seedlotSpecies}
              readOnly
              items={[seedlotSpecies]}
            />
          </Column>
        </Row>
        <Row className="seedlot-orchard-field">
          <Column sm={4} md={8} lg={16} xlg={12}>
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
          <Column sm={4} md={8} lg={16}>
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
            <Column sm={4} md={8} lg={16} xlg={12}>
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
