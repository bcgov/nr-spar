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
  CheckboxGroup,
  Button,
  TextInputSkeleton
} from '@carbon/react';
import { Add, TrashCan } from '@carbon/icons-react';

import Subtitle from '../../Subtitle';

import { getOrchardByVegCode } from '../../../api-service/orchardAPI';
import { filterInput, FilterObj } from '../../../utils/filterUtils';
import ComboBoxEvent from '../../../types/ComboBoxEvent';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import InputErrorText from '../../InputErrorText';

import { OrchardForm, OrchardObj } from './definitions';
import { initialStagedOrchard, MAX_ORCHARDS, orchardStepText } from './constants';
import OrchardWarnModal from './OrchardWarnModal';
import orchardModalOptions from './OrchardWarnModal/definitions';
import { RowDataDictType } from '../ParentTreeStep/definitions';

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
  const refControl = useRef<any>({});
  const [invalidFemGametic, setInvalidFemGametic] = useState<boolean>(false);
  const [invalidMalGametic, setInvalidMalGametic] = useState<boolean>(false);
  const [invalidBreeding, setInvalidBreeding] = useState<boolean>(false);
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
    enabled: !readOnly
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
    <div className="seedlot-orchard-step-form">
      <form>
        <Row className="seedlot-orchard-title-row">
          <Column sm={4} md={8} lg={16}>
            <h2>{orchardStepText.orchardSection.title}</h2>
            <Subtitle text={orchardStepText.orchardSection.subtitle} />
          </Column>
        </Row>
        {
          state.orchards.map((orchard) => (
            <Row className="seedlot-orchard-field" key={orchard.inputId}>
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
                                  selectedItem: e.selectedItem
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
        <Row className="seedlot-orchard-field">
          <Column sm={4} md={8} lg={16} xlg={12}>
            <Dropdown
              id="seedlot-species-dropdown"
              titleText={orchardStepText.gameteSection.seedlotSpecies}
              label={orchardStepText.gameteSection.seedlotSpecies}
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
              placeholder={orchardStepText.gameteSection.femaleGametic.placeholder}
              titleText={orchardStepText.gameteSection.femaleGametic.label}
              invalid={invalidFemGametic}
              invalidText={orchardStepText.gameteSection.femaleGametic.invalid}
              onChange={(e: ComboBoxEvent) => femaleGameticHandler(e)}
              readOnly={readOnly}
              selectedItem={state.femaleGametic}
            />
          </Column>
        </Row>
        <Row className="seedlot-orchard-field">
          <Column sm={4} md={8} lg={16}>
            <RadioButtonGroup
              legendText={orchardStepText.gameteSection.maleGametic.label}
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
            <CheckboxGroup legendText={orchardStepText.gameteSection.controlledCross.label}>
              <Checkbox
                id="seedlot-produced"
                name="controlledCross"
                labelText={orchardStepText.gameteSection.controlledCross.checkbox}
                defaultChecked={state.controlledCross}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => checkboxesHandler(event)}
                readOnly={readOnly}
              />
            </CheckboxGroup>
          </Column>
        </Row>
        <Row className="seedlot-orchard-field">
          <Column sm={4} md={8} lg={16}>
            <CheckboxGroup legendText={orchardStepText.gameteSection.biotechProcess.label}>
              <Checkbox
                id="bio-processes"
                name="biotechProcess"
                labelText={orchardStepText.gameteSection.biotechProcess.checkbox}
                defaultChecked={state.biotechProcess}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => checkboxesHandler(event)}
                readOnly={readOnly}
              />
            </CheckboxGroup>
          </Column>
        </Row>
        <Row className="seedlot-orchard-title-row">
          <Column sm={4} md={8} lg={16}>
            <h2>{orchardStepText.pollenSection.title}</h2>
            <Subtitle text={orchardStepText.pollenSection.subtitle} />
          </Column>
        </Row>
        <Row className="seedlot-orchard-field">
          <Column sm={4} md={8} lg={16}>
            <CheckboxGroup legendText={orchardStepText.pollenSection.noPollenContamination.label}>
              <Checkbox
                id="pollen-contamination"
                name="noPollenContamination"
                labelText={orchardStepText.pollenSection.noPollenContamination.checkbox}
                defaultChecked={state.noPollenContamination}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => checkboxesHandler(event)}
                readOnly={readOnly}
              />
            </CheckboxGroup>
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
                      label={orchardStepText.pollenSection.breedingPercentage.label}
                      helperText={orchardStepText.pollenSection.breedingPercentage.helper}
                      invalid={invalidBreeding}
                      invalidText={orchardStepText.pollenSection.breedingPercentage.invalid}
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
                    <CheckboxGroup
                      legendText={orchardStepText.pollenSection.pollenMethodology.label}
                    >
                      <Checkbox
                        id="pollen-methodology"
                        name="pollenMethodology"
                        labelText={orchardStepText.pollenSection.pollenMethodology.checkbox}
                        defaultChecked={state.pollenMethodology}
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
      </form>
    </div>
  );
};

export default OrchardStep;
