import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  Row,
  Column,
  NumberInput,
  ComboBox,
  RadioButtonGroup,
  RadioButton,
  Checkbox,
  CheckboxGroup,
  Button,
  TextInput,
  TextInputSkeleton,
  FlexGrid
} from '@carbon/react';
import { Add, TrashCan } from '@carbon/icons-react';
import validator from 'validator';

import { getOrchardByVegCode } from '../../../api-service/orchardAPI';
import { filterInput, FilterObj } from '../../../utils/filterUtils';
import ComboBoxEvent from '../../../types/ComboBoxEvent';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import InputErrorText from '../../InputErrorText';
import { EmptyMultiOptObj } from '../../../shared-constants/shared-constants';
import { RowDataDictType } from '../ParentTreeStep/definitions';
import Subtitle from '../../Subtitle';

import { OrchardForm, OrchardObj } from './definitions';
import { initialStagedOrchard, MAX_ORCHARDS, orchardStepText } from './constants';
import OrchardWarnModal from './OrchardWarnModal';
import orchardModalOptions from './OrchardWarnModal/definitions';

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
  tableRowData: RowDataDictType
  readOnly?: boolean
}

const OrchardStep = ({
  seedlotSpecies,
  gameticOptions,
  state,
  setStepData,
  cleanParentTables,
  tableRowData,
  readOnly
}: OrchardStepProps) => {
  const [isPliSpecies] = useState<boolean>(seedlotSpecies.code === 'PLI');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<keyof orchardModalOptions>('change');
  // Store the orchard selection until the user has confirmed the warning modal
  const [stagedOrchard, setStagedOrchard] = useState<OrchardObj>(initialStagedOrchard);

  const filterGameticOptions = (isFemale: boolean) => {
    const result = gameticOptions
      .filter((option) => {
        if (!isPliSpecies && option.isPliSpecies) {
          return false;
        }
        return option.isFemaleMethodology === isFemale;
      });
    return result;
  };

  const maleGameticOptions = useMemo(() => filterGameticOptions(false), []);
  const femaleGameticOptions = useMemo(() => filterGameticOptions(true), []);

  const orchardQuery = useQuery({
    queryKey: ['orchards', seedlotSpecies.code],
    queryFn: () => getOrchardByVegCode(seedlotSpecies.code),
    enabled: !readOnly
  });

  const setGametic = (event: ComboBoxEvent, isFemale: boolean) => {
    const clonedState = structuredClone(state);
    const selectedItem = event.selectedItem ?? EmptyMultiOptObj;
    const gameticType: keyof OrchardForm = isFemale ? 'femaleGametic' : 'maleGametic';
    clonedState[gameticType].value = selectedItem;
    setStepData(clonedState);
  };

  const setBooleanValue = (
    field: (
      'isControlledCross' | 'hasBiotechProcess' | 'hasPollenContamination' | 'isRegional'
    ),
    checked: boolean
  ) => {
    const clonedState = structuredClone(state);
    clonedState[field].value = checked;
    setStepData(clonedState);
  };

  const setAndValidateBreedPerc = (value: string, setOnly: boolean) => {
    const clonedState = structuredClone(state);
    clonedState.breedingPercentage.value = value;
    if (!setOnly) {
      clonedState.breedingPercentage.isInvalid = !validator.isInt(value, { min: 0, max: 100 });
    }
    setStepData(clonedState);
  };

  const addOrchardObj = () => {
    const orchards = structuredClone(state.orchards);
    const numOfOrchard = orchards.length;
    if (numOfOrchard < MAX_ORCHARDS) {
      const newOrchard: OrchardObj = {
        inputId: numOfOrchard,
        selectedItem: null,
        isInvalid: false
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

  const setOrchard = (inputId: number, selectedItem: MultiOptionsObj | null) => {
    const orchards = structuredClone(state.orchards);
    const selectedOrchardIndex = orchards.findIndex((orchard) => orchard.inputId === inputId);
    if (selectedOrchardIndex > -1) {
      orchards[selectedOrchardIndex].selectedItem = selectedItem;
      setStepData({
        ...state,
        orchards
      });
    }
  };

  // Remove options that are already selected by a user
  const removeSelectedOption = (data: MultiOptionsObj[]) => {
    const filteredOptions: MultiOptionsObj[] = structuredClone(data);
    state.orchards.forEach((orchard) => {
      const orchardId = orchard.selectedItem?.code;
      // The index of a matching orchard in filteredOptions
      const orchardOptIndex = filteredOptions.findIndex((option) => option.code === orchardId);
      if (orchardOptIndex > -1) {
        // Remove found option
        filteredOptions.splice(orchardOptIndex, 1);
      }
    });
    return filteredOptions;
  };

  const isTableEmpty = Object.keys(tableRowData).length === 0;

  const proceedEdit = () => {
    cleanParentTables();
    if (modalType === 'delete') {
      deleteOrchardObj();
    }
    if (modalType === 'change') {
      setOrchard(stagedOrchard.inputId, stagedOrchard.selectedItem);
    }
  };

  const renderOrchardButtons = () => {
    if (!readOnly) {
      return state.orchards.length !== 1
        ? (
          <Row className="seedlot-orchard-add-orchard">
            <Column sm={4} md={4} lg={10}>
              <Button
                size="md"
                kind="danger--tertiary"
                renderIcon={TrashCan}
                onClick={() => {
                  // Show warning only if the table is not empty and an item has been selected
                  if (!isTableEmpty && state.orchards[1].selectedItem) {
                    setModalType('delete');
                    setModalOpen(true);
                  } else deleteOrchardObj();
                }}
              >
                {orchardStepText.orchardSection.buttons.delete}
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
                {orchardStepText.orchardSection.buttons.add}
              </Button>
            </Column>
          </Row>
        );
    }
    return null;
  };

  return (
    <FlexGrid className="seedlot-orchard-step-form">
      <Row className="seedlot-orchard-title-row">
        <Column sm={4} md={8} lg={16}>
          <h2>{orchardStepText.orchardSection.title}</h2>
          <Subtitle text={orchardStepText.orchardSection.subtitle} />
        </Column>
      </Row>
      {
        state.orchards.map((orchard) => (
          <Row className="orchard-row" key={orchard.inputId}>
            <Column sm={4} md={4} lg={8} xlg={6}>
              {
                orchardQuery.isFetching ? (
                  <TextInputSkeleton />
                )
                  : (
                    <>
                      <ComboBox
                        id={`orchard-combobox-${orchard.inputId}`}
                        placeholder={orchardStepText.orchardSection.orchardInput.placeholder}
                        items={
                          orchardQuery.isSuccess
                            ? removeSelectedOption(orchardQuery.data)
                            : []
                        }
                        selectedItem={orchard.selectedItem}
                        titleText={
                          orchard.inputId === 0
                            ? orchardStepText.orchardSection.orchardInput.label
                            : orchardStepText.orchardSection.orchardInput.optLabel
                        }
                        shouldFilterItem={
                          ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
                        }
                        onChange={
                          (e: ComboBoxEvent) => {
                            if (!isTableEmpty) {
                              setModalType('change');
                              setStagedOrchard({
                                inputId: orchard.inputId,
                                selectedItem: e.selectedItem,
                                isInvalid: orchard.isInvalid
                              });
                              setModalOpen(true);
                            } else setOrchard(orchard.inputId, e.selectedItem);
                          }
                        }
                      />
                      {
                        orchardQuery.isError && !readOnly
                          ? (
                            <InputErrorText
                              description={orchardStepText.orchardSection.orchardInput.fetchError}
                            />
                          )
                          : null
                      }
                    </>
                  )
              }
            </Column>
          </Row>
        ))
      }
      {
        renderOrchardButtons()
      }
      <Row className="seedlot-orchard-title-row">
        <Column sm={4} md={8} lg={16}>
          <h2>{orchardStepText.gameteSection.title}</h2>
          <Subtitle text={orchardStepText.gameteSection.subtitle} />
        </Column>
      </Row>
      <Row className="orchard-row">
        <Column sm={4} md={8} lg={16} xlg={12}>
          <TextInput
            className="spar-display-only-input"
            id="seedlot-species-text-input"
            labelText={orchardStepText.gameteSection.seedlotSpecies}
            value={seedlotSpecies.label}
            readOnly
          />
        </Column>
      </Row>
      <Row className="orchard-row">
        <Column sm={4} md={8} lg={16} xlg={12} max={10}>
          <ComboBox
            className="gametic-combobox"
            id={state.femaleGametic.id}
            name="femaleGametic"
            items={femaleGameticOptions}
            shouldFilterItem={
              ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
            }
            placeholder={orchardStepText.gameteSection.femaleGametic.placeholder}
            titleText={orchardStepText.gameteSection.femaleGametic.label}
            invalid={state.femaleGametic.isInvalid}
            invalidText={orchardStepText.gameteSection.femaleGametic.invalid}
            onChange={(e: ComboBoxEvent) => setGametic(e, true)}
            readOnly={readOnly}
            selectedItem={state.femaleGametic.value}
          />
        </Column>
      </Row>
      <Row className="orchard-row">
        <Column sm={4} md={8} lg={16} xlg={12} max={10}>
          <ComboBox
            className="gametic-combobox"
            id={state.maleGametic.id}
            name="maleGametic"
            items={maleGameticOptions}
            shouldFilterItem={
              ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
            }
            placeholder={orchardStepText.gameteSection.maleGametic.placeholder}
            titleText={orchardStepText.gameteSection.maleGametic.label}
            invalid={state.maleGametic.isInvalid}
            invalidText={orchardStepText.gameteSection.maleGametic.invalid}
            onChange={(e: ComboBoxEvent) => setGametic(e, false)}
            readOnly={readOnly}
            selectedItem={state.maleGametic.value}
          />
        </Column>
      </Row>
      <Row className="orchard-row">
        <Column sm={4} md={8} lg={16}>
          <RadioButtonGroup
            id={state.isControlledCross.id}
            legendText={orchardStepText.gameteSection.controlledCross.label}
            name="controlled-cross-radio-btn-group"
            orientation="vertical"
            onChange={(selected: string) => setBooleanValue('isControlledCross', selected === 'Yes')}
            readOnly={readOnly}
          >
            <RadioButton
              id="controlled-cross-yes"
              checked={state.isControlledCross.value}
              labelText="Yes"
              value="Yes"
            />
            <RadioButton
              id="controlled-cross-no"
              checked={!state.isControlledCross.value}
              labelText="No"
              value="No"
            />
          </RadioButtonGroup>
        </Column>
      </Row>
      <Row className="orchard-row">
        <Column sm={4} md={8} lg={16}>
          <RadioButtonGroup
            id={state.hasBiotechProcess.id}
            legendText={orchardStepText.gameteSection.biotechProcess.label}
            name="biotech-radio-btn-group"
            orientation="vertical"
            onChange={(selected: string) => setBooleanValue('hasBiotechProcess', selected === 'Yes')}
            readOnly={readOnly}
          >
            <RadioButton
              id="biotech-yes"
              checked={state.hasBiotechProcess.value}
              labelText="Yes"
              value="Yes"
            />
            <RadioButton
              id="biotech-no"
              checked={!state.hasBiotechProcess.value}
              labelText="No"
              value="No"
            />
          </RadioButtonGroup>
        </Column>
      </Row>
      <Row className="seedlot-orchard-title-row">
        <Column sm={4} md={8} lg={16}>
          <h2>{orchardStepText.pollenSection.title}</h2>
          <Subtitle text={orchardStepText.pollenSection.subtitle} />
        </Column>
      </Row>
      <Row>
        <Column sm={4} md={8} lg={16}>
          <RadioButtonGroup
            id={state.hasPollenContamination.id}
            legendText={orchardStepText.pollenSection.pollenContamination.label}
            name="pollen-contam-radio-btn-group"
            orientation="vertical"
            onChange={(selected: string) => setBooleanValue('hasPollenContamination', selected === 'Yes')}
            readOnly={readOnly}
          >
            <RadioButton
              id="pollen-contam-yes"
              checked={state.hasPollenContamination.value}
              labelText="Yes"
              value="Yes"
            />
            <RadioButton
              id="pollen-contam-no"
              checked={!state.hasPollenContamination.value}
              labelText="No"
              value="No"
            />
          </RadioButtonGroup>
        </Column>
      </Row>
      {
        state.hasPollenContamination.value
          ? (
            <>
              <Row className="pollen-contam-row">
                <Column sm={4} md={8} lg={16} xlg={12}>
                  <NumberInput
                    id={state.breedingPercentage.id}
                    name="breedingPercentage"
                    defaultValue={state.breedingPercentage.value}
                    step={10}
                    disableWheel
                    type="number"
                    label={orchardStepText.pollenSection.breedingPercentage.label}
                    helperText={orchardStepText.pollenSection.breedingPercentage.helper}
                    invalid={state.breedingPercentage.isInvalid}
                    invalidText={orchardStepText.pollenSection.breedingPercentage.invalid}
                    onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setAndValidateBreedPerc(e.target.value, false);
                    }}
                    onClick={
                      (
                        _e: React.MouseEvent<HTMLButtonElement>,
                        target: NumStepperVal | undefined
                      ) => {
                        // A guard is needed here because any click on the input will emit a
                        //   click event, not necessarily the + - buttons
                        if (target?.value) {
                          setAndValidateBreedPerc(target.value.toString(), false);
                        }
                      }
                    }
                    readOnly={readOnly}
                  />
                </Column>
              </Row>
              <Row className="pollen-methodology-checkbox">
                <Column sm={4} md={8} lg={16}>
                  <CheckboxGroup
                    legendText={orchardStepText.pollenSection.pollenMethodology.label}
                  >
                    <Checkbox
                      id={state.isRegional.id}
                      name="pollenMethodology"
                      labelText={orchardStepText.pollenSection.pollenMethodology.checkbox}
                      checked={state.isRegional.value}
                      readOnly
                    />
                  </CheckboxGroup>
                </Column>
              </Row>
            </>
          )
          : null
      }
      <OrchardWarnModal
        open={modalOpen}
        setOpen={setModalOpen}
        modalType={modalType}
        confirmEdit={proceedEdit}
      />
    </FlexGrid>
  );
};

export default OrchardStep;
