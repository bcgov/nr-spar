/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  Row,
  Column,
  NumberInput,
  Dropdown,
  ComboBox,
  RadioButtonGroup,
  RadioButton,
  Checkbox,
  Button
} from '@carbon/react';
import { Add, TrashCan } from '@carbon/icons-react';

import Subtitle from '../../Subtitle';

import { getOrchardByVegCode } from '../../../api-service/orchardAPI';
import { filterInput, FilterObj } from '../../../utils/filterUtils';
import ComboBoxEvent from '../../../types/ComboBoxEvent';
import MultiOptionsObj from '../../../types/MultiOptionsObject';

import { OrchardForm, OrchardObj } from './definitions';
import { MAX_ORCHARDS, orcharStepText } from './constants';

import './styles.scss';

type NumStepperVal = {
  value: number,
  direction: string
}

interface OrchardStepProps {
  seedlotSpecies: MultiOptionsObj
  gameticOptions: MultiOptionsObj[],
  state: OrchardForm
  setStepData: Function,
  cleanParentTables: Function,
  readOnly?: boolean
}

const OrchardStep = ({
  seedlotSpecies,
  gameticOptions,
  state,
  setStepData,
  cleanParentTables,
  readOnly
}: OrchardStepProps) => {
  const [isPliSpecies] = useState<boolean>(seedlotSpecies.code === 'PLI');
  const refControl = useRef<any>({});
  const [invalidFemGametic, setInvalidFemGametic] = useState<boolean>(false);
  const [invalidMalGametic, setInvalidMalGametic] = useState<boolean>(false);
  const [invalidBreeding, setInvalidBreeding] = useState<boolean>(false);

  const filterGameticOptions = (gender: string) => {
    const result = gameticOptions
      .filter((option) => {
        if (!isPliSpecies && option.isPliSpecies) {
          return false;
        }
        return option.code.toLowerCase().startsWith(gender);
      });
    return result;
  };

  const maleGameticOptions = useMemo(() => filterGameticOptions('m'), []);
  const femaleGameticOptions = useMemo(() => filterGameticOptions('f'), []);

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

  const orchardQuery = useQuery({
    queryKey: ['orchards', seedlotSpecies.code],
    queryFn: () => getOrchardByVegCode(seedlotSpecies.code),
    retry: 3,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

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
    const orchards = structuredClone(state.orchards);
    const numOfOrchard = orchards.length;
    if (numOfOrchard < MAX_ORCHARDS) {
      const newOrchard: OrchardObj = {
        inputId: numOfOrchard,
        selectedItem: null
      };
      orchards.push(newOrchard);
      setStepData({
        ...state,
        orchards
      });
    }
  };

  const deleteOrchardObj = () => {
    const orchards = structuredClone(state.orchards);
    const numOfOrchard = orchards.length;
    const newOrchards = orchards.filter((orchard) => orchard.inputId !== (numOfOrchard - 1));
    setStepData({
      ...state,
      orchards: newOrchards
    });
  };

  return (
    <div className="seedlot-orchard-step-form">
      <form>
        <Row className="seedlot-orchard-title-row">
          <Column sm={4} md={8} lg={16}>
            <h2>{orcharStepText.orchardSection.title}</h2>
            <Subtitle text={orcharStepText.orchardSection.subtitle} />
          </Column>
        </Row>
        {
          state.orchards.map((orchard) => (
            <Row className="seedlot-orchard-field" key={orchard.inputId}>
              <Column sm={4} md={4} lg={8} xlg={6}>
                <ComboBox
                  id={`orchard-combobox-${orchard.inputId}`}
                  // TODO: use skeleton and filter
                  items={orchardQuery.isSuccess ? orchardQuery.data : []}
                  selectedItem={orchard.selectedItem}
                  titleText={
                    orchard.inputId === 0
                      ? orcharStepText.orchardSection.orchardInput.label
                      : orcharStepText.orchardSection.orchardInput.optLabel
                  }
                  shouldFilterItem={
                    ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
                  }
                />
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
                    {orcharStepText.orchardSection.buttons.delete}
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
                    {orcharStepText.orchardSection.buttons.add}
                  </Button>
                </Column>
              </Row>
            )
        }
        <Row className="seedlot-orchard-title-row">
          <Column sm={4} md={8} lg={16}>
            <h2>{orcharStepText.gameteSection.title}</h2>
            <Subtitle text={orcharStepText.gameteSection.subtitle} />
          </Column>
        </Row>
        <Row className="seedlot-orchard-field">
          <Column sm={4} md={8} lg={16} xlg={12}>
            <Dropdown
              id="seedlot-species-dropdown"
              titleText={orcharStepText.gameteSection.seedlotSpecies}
              label={orcharStepText.gameteSection.seedlotSpecies}
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
              items={femaleGameticOptions}
              shouldFilterItem={
                ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
              }
              placeholder={orcharStepText.gameteSection.femaleGametic.placeholder}
              titleText={orcharStepText.gameteSection.femaleGametic.label}
              invalid={invalidFemGametic}
              invalidText={orcharStepText.gameteSection.femaleGametic.invalid}
              onChange={(e: ComboBoxEvent) => femaleGameticHandler(e)}
              readOnly={readOnly}
              selectedItem={state.femaleGametic}
            />
          </Column>
        </Row>
        <Row className="seedlot-orchard-field">
          <Column sm={4} md={8} lg={16}>
            <RadioButtonGroup
              legendText={orcharStepText.gameteSection.maleGametic.label}
              name="male-gametic-radiogroup"
              orientation="vertical"
              className={invalidMalGametic ? 'male-gametic-invalid' : ''}
              onChange={(e: string) => maleGameticHandler(e)}
              valueSelected={state.maleGametic}
            >
              {maleGameticOptions.map((item) => (
                <RadioButton
                  key={item.code}
                  id={`${item.code.toLowerCase()}-radio`}
                  labelText={item.label}
                  value={item.code}
                />
              ))}
            </RadioButtonGroup>
          </Column>
        </Row>
        <Row className="seedlot-orchard-field">
          <Column sm={4} md={8} lg={16}>
            <label htmlFor="seedlot-produced" className="bcgov--label">
              {orcharStepText.gameteSection.controlledCross.label}
            </label>
            <Checkbox
              id="seedlot-produced"
              name="controlledCross"
              labelText={orcharStepText.gameteSection.controlledCross.checkbox}
              defaultChecked={state.controlledCross}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => checkboxesHandler(event)}
              readOnly={readOnly}
            />
          </Column>
        </Row>
        <Row className="seedlot-orchard-field">
          <Column sm={4} md={8} lg={16}>
            <label htmlFor="bio-processes" className="bcgov--label">
              {orcharStepText.gameteSection.biotechProcess.label}
            </label>
            <Checkbox
              id="bio-processes"
              name="biotechProcess"
              labelText={orcharStepText.gameteSection.biotechProcess.checkbox}
              defaultChecked={state.biotechProcess}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => checkboxesHandler(event)}
              readOnly={readOnly}
            />
          </Column>
        </Row>
        <Row className="seedlot-orchard-title-row">
          <Column sm={4} md={8} lg={16}>
            <h2>{orcharStepText.pollenSection.title}</h2>
            <Subtitle text={orcharStepText.pollenSection.subtitle} />
          </Column>
        </Row>
        <Row className="seedlot-orchard-field">
          <Column sm={4} md={8} lg={16}>
            <label htmlFor="pollen-contamination" className="bcgov--label">
              {orcharStepText.pollenSection.noPollenContamination.label}
            </label>
            <Checkbox
              id="pollen-contamination"
              name="noPollenContamination"
              labelText={orcharStepText.pollenSection.noPollenContamination.checkbox}
              defaultChecked={state.noPollenContamination}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => checkboxesHandler(event)}
              readOnly={readOnly}
            />
          </Column>
        </Row>
        {
          !state.noPollenContamination
            ? (
              <>
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
                      label={orcharStepText.pollenSection.breedingPercentage.label}
                      helperText={orcharStepText.pollenSection.breedingPercentage.helper}
                      invalid={invalidBreeding}
                      invalidText={orcharStepText.pollenSection.breedingPercentage.invalid}
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
                      {orcharStepText.pollenSection.pollenMethodology.label}
                    </label>
                    <Checkbox
                      id="pollen-methodology"
                      name="pollenMethodology"
                      labelText={orcharStepText.pollenSection.pollenMethodology.checkbox}
                      defaultChecked={state.pollenMethodology}
                      readOnly
                    />
                  </Column>
                </Row>
              </>
            )
            : null
        }
      </form>
    </div>
  );
};

export default OrchardStep;
