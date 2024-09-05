import React, { useState, useMemo, useContext } from 'react';
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
  FlexGrid,
  DropdownSkeleton
} from '@carbon/react';
import { Add, TrashCan } from '@carbon/icons-react';
import validator from 'validator';

import { getOrchardByVegCode } from '../../../api-service/orchardAPI';
import getGameticMethodology from '../../../api-service/gameticMethodologyAPI';
import { filterInput, FilterObj } from '../../../utils/FilterUtils';
import ComboBoxEvent from '../../../types/ComboBoxEvent';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import InputErrorText from '../../InputErrorText';
import { EmptyMultiOptObj } from '../../../shared-constants/shared-constants';
import { getMultiOptList } from '../../../utils/MultiOptionsUtils';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../config/TimeUnits';
import ScrollToTop from '../../ScrollToTop';
import Subtitle from '../../Subtitle';
import ReadOnlyInput from '../../ReadOnlyInput';
import ClassAContext from '../../../views/Seedlot/ContextContainerClassA/context';

import { OrchardForm } from './definitions';
import { orchardStepText } from './constants';
import OrchardWarnModal from './OrchardWarnModal';
import orchardModalOptions from './OrchardWarnModal/definitions';

import './styles.scss';
import { OptionsInputType } from '../../../types/FormInputType';

type NumStepperVal = {
  value: number,
  direction: string
}

interface OrchardStepProps {
  cleanParentTables: Function;
  isReview?: boolean;
}

const OrchardStep = ({
  cleanParentTables, isReview
}: OrchardStepProps) => {
  const {
    allStepData: { orchardStep: state },
    allStepData: { parentTreeStep: { tableRowData } },
    setStepData,
    seedlotSpecies,
    isFormSubmitted
  } = useContext(ClassAContext);

  const [isPliSpecies] = useState<boolean>(seedlotSpecies.code === 'PLI');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<keyof orchardModalOptions>('change');
  // Store the orchard selection until the user has confirmed the warning modal
  const [stagedOrchard, setStagedOrchard] = useState<OptionsInputType | null>(null);

  const gameticMethodologyQuery = useQuery({
    queryKey: ['gametic-methodologies'],
    queryFn: getGameticMethodology,
    select: (data) => getMultiOptList(data, true, false, true, ['isFemaleMethodology', 'isPliSpecies']),
    enabled: !isFormSubmitted || isReview,
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  const filterGameticOptions = (isFemale: boolean) => {
    if (gameticMethodologyQuery.status === 'success') {
      const result = gameticMethodologyQuery.data
        .filter((option) => {
          if (!isPliSpecies && option.isPliSpecies) {
            return false;
          }
          return option.isFemaleMethodology === isFemale;
        });
      return result;
    }
    return [];
  };

  const maleGameticOptions = useMemo(() => filterGameticOptions(false), [
    gameticMethodologyQuery.status
  ]);
  const femaleGameticOptions = useMemo(() => filterGameticOptions(true), [
    gameticMethodologyQuery.status
  ]);

  const orchardQuery = useQuery({
    queryKey: ['orchards', seedlotSpecies.code],
    queryFn: () => getOrchardByVegCode(seedlotSpecies.code),
    enabled: !isFormSubmitted,
    select: (orchards) => orchards
      .filter((orchard) => (orchard.stageCode !== 'RET'))
      .map((orchard) => (
        ({
          code: orchard.id,
          description: orchard.name,
          label: `${orchard.id} - ${orchard.name} - ${orchard.lotTypeCode} - ${orchard.stageCode}`,
          spuId: orchard.spuId
        })
      ))
      .sort((a, b) => Number(a.code) - Number(b.code))
  });

  const setGametic = (event: ComboBoxEvent, isFemale: boolean) => {
    const clonedState = structuredClone(state);
    const selectedItem = event.selectedItem ?? EmptyMultiOptObj;
    const gameticType: keyof OrchardForm = isFemale ? 'femaleGametic' : 'maleGametic';
    clonedState[gameticType].value = selectedItem;
    setStepData('orchardStep', clonedState);
  };

  const setBooleanValue = (
    field: (
      'isControlledCross' | 'hasBiotechProcess' | 'hasPollenContamination' | 'isRegional'
    ),
    checked: boolean
  ) => {
    const clonedState = structuredClone(state);
    clonedState[field].value = checked;
    setStepData('orchardStep', clonedState);
  };

  const setAndValidateBreedPerc = (value: string, setOnly: boolean) => {
    const clonedState = structuredClone(state);
    clonedState.breedingPercentage.value = value;
    if (!setOnly) {
      clonedState.breedingPercentage.isInvalid = !validator.isInt(value, { min: 0, max: 100 });
    }
    setStepData('orchardStep', clonedState);
  };

  const addOrchardObj = () => {
    const orchards = structuredClone(state.orchards);
    orchards.secondaryOrchard.enabled = true;
    setStepData(
      'orchardStep',
      {
        ...state,
        orchards
      }
    );
  };

  const deleteOrchardObj = () => {
    const orchards = structuredClone(state.orchards);
    orchards.secondaryOrchard.enabled = false;
    orchards.secondaryOrchard.value = EmptyMultiOptObj;
    setStepData(
      'orchardStep',
      {
        ...state,
        orchards
      }
    );
  };

  const setOrchard = (
    isPrimary: boolean,
    selectedItem: MultiOptionsObj | null
  ) => {
    const orchards = structuredClone(state.orchards);

    if (isPrimary) {
      orchards.primaryOrchard.value = selectedItem ?? EmptyMultiOptObj;
    } else {
      orchards.secondaryOrchard.value = selectedItem ?? EmptyMultiOptObj;
    }

    setStepData(
      'orchardStep',
      {
        ...state,
        orchards
      }
    );
  };

  // Remove options that are already selected by a user
  const removeSelectedOption = (data: MultiOptionsObj[]) => {
    const filteredOptions: MultiOptionsObj[] = structuredClone(data);
    const orchardId = state.orchards.primaryOrchard.value.code;
    // The index of a matching orchard in filteredOptions
    const orchardOptIndex = filteredOptions.findIndex((option) => option.code === orchardId);
    if (orchardOptIndex > -1) {
      // Remove found option
      filteredOptions.splice(orchardOptIndex, 1);
    }
    return filteredOptions;
  };

  const isTableEmpty = Object.keys(tableRowData).length === 0;

  const proceedEdit = () => {
    cleanParentTables();
    if (modalType === 'delete') {
      deleteOrchardObj();
    }
    if (modalType === 'change' && stagedOrchard) {
      setOrchard(
        stagedOrchard.id === state.orchards.primaryOrchard.id,
        stagedOrchard.value
      );
    }
  };

  const renderOrchardButtons = () => {
    if (!isFormSubmitted && !isReview) {
      return state.orchards.secondaryOrchard.enabled
        ? (
          <Row className="seedlot-orchard-add-orchard">
            <Column sm={4} md={4} lg={10}>
              <Button
                size="md"
                kind="danger--tertiary"
                renderIcon={TrashCan}
                onClick={() => {
                  // Show warning only if the table is not empty and an item has been selected
                  if (!isTableEmpty && state.orchards.secondaryOrchard.value.code) {
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

  const renderOrchardFields = () => {
    if (isFormSubmitted && isReview) {
      return (
        <div className="orchard-fields-review-only">
          <Row>
            <Column sm={4} md={4} lg={4}>
              <ReadOnlyInput
                id={state.orchards.primaryOrchard.id}
                label="Orchard ID or number"
                value={state.orchards.primaryOrchard.value.label}
              />
            </Column>
          </Row>
          {
            state.orchards.secondaryOrchard.value.label
              ? (
                <Row>
                  <Column sm={4} md={4} lg={4}>
                    <ReadOnlyInput
                      id={state.orchards.secondaryOrchard.id}
                      label="Orchard ID or number"
                      value={state.orchards.secondaryOrchard.value.label}
                    />
                  </Column>
                </Row>
              )
              : null
          }
        </div>
      );
    }
    return (
      <>
        <Row className="orchard-row">
          <Column sm={4} md={4} lg={8} xlg={6}>
            {
            orchardQuery.isFetching ? (
              <TextInputSkeleton />
            )
              : (
                <>
                  <ComboBox
                    id={state.orchards.primaryOrchard.id}
                    placeholder={orchardStepText.orchardSection.orchardInput.placeholder}
                    items={
                      orchardQuery.status === 'success'
                        ? removeSelectedOption(orchardQuery.data)
                        : []
                    }
                    selectedItem={state.orchards.primaryOrchard.value}
                    titleText={
                      orchardStepText.orchardSection.orchardInput.label
                    }
                    shouldFilterItem={
                      ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
                    }
                    onChange={
                      (e: ComboBoxEvent) => {
                        if (!isTableEmpty) {
                          setModalType('change');
                          setStagedOrchard({
                            ...state.orchards.primaryOrchard,
                            value: e.selectedItem
                          });
                          setModalOpen(true);
                        } else setOrchard(true, e.selectedItem);
                      }
                    }
                    readOnly={isFormSubmitted || isReview}
                  />
                  {
                    orchardQuery.isError && !isFormSubmitted
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
        {/* Secondary Orchard */}
        {
        state.orchards.secondaryOrchard.enabled
          ? (
            <Row className="orchard-row">
              <Column sm={4} md={4} lg={8} xlg={6}>
                {
              orchardQuery.isFetching ? (
                <TextInputSkeleton />
              )
                : (
                  <>
                    <ComboBox
                      id={state.orchards.secondaryOrchard.id}
                      placeholder={orchardStepText.orchardSection.orchardInput.placeholder}
                      items={
                        orchardQuery.status === 'success'
                          ? removeSelectedOption(orchardQuery.data)
                          : []
                      }
                      selectedItem={state.orchards.secondaryOrchard.value}
                      titleText={
                        orchardStepText.orchardSection.orchardInput.secondaryLabel
                      }
                      shouldFilterItem={
                        ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
                      }
                      onChange={
                        (e: ComboBoxEvent) => {
                          if (!isTableEmpty) {
                            setModalType('change');
                            setStagedOrchard({
                              ...state.orchards.secondaryOrchard,
                              value: e.selectedItem
                            });
                            setModalOpen(true);
                          } else setOrchard(false, e.selectedItem);
                        }
                      }
                      readOnly={isFormSubmitted || isReview}
                    />
                    {
                      orchardQuery.isError && !isFormSubmitted
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
          )
          : null
      }
      </>
    );
  };

  return (
    <FlexGrid className="seedlot-orchard-step-form">
      <ScrollToTop enabled={!isReview} />
      <Row className={`seedlot-orchard-title-row ${isReview ? 'remove-bottom-margin' : ''}`}>
        <Column className="section-title" sm={4} md={8} lg={16}>
          <h2>{orchardStepText.orchardSection.title}</h2>
          {
            !isReview
              ? (
                <Subtitle text={orchardStepText.orchardSection.subtitle} />
              )
              : null
          }
        </Column>
      </Row>
      {
        renderOrchardFields()
      }
      {
        renderOrchardButtons()
      }
      <Row className="seedlot-gamete-title-row">
        <Column className="section-title" sm={4} md={8} lg={16}>
          <h2>{orchardStepText.gameteSection.title}</h2>
          {
            !isReview
              ? (
                <Subtitle text={orchardStepText.gameteSection.subtitle} />
              )
              : null
          }
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
        <Column sm={4} md={4} lg={8} xlg={6}>
          {
            gameticMethodologyQuery.isFetching
              ? <DropdownSkeleton />
              : (
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
                  readOnly={isFormSubmitted && !isReview}
                  selectedItem={state.femaleGametic.value}
                />
              )
          }
        </Column>
      </Row>
      <Row className="orchard-row">
        <Column sm={4} md={4} lg={8} xlg={6}>
          {
            gameticMethodologyQuery.isFetching
              ? <DropdownSkeleton />
              : (
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
                  readOnly={isFormSubmitted && !isReview}
                  selectedItem={state.maleGametic.value}
                />
              )
          }
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
            readOnly={isFormSubmitted && !isReview}
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
            readOnly={isFormSubmitted && !isReview}
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
        <Column className="section-title" sm={4} md={8} lg={16}>
          <h2>{orchardStepText.pollenSection.title}</h2>
          {
            !isReview
              ? (
                <Subtitle text={orchardStepText.pollenSection.subtitle} />
              )
              : null
          }
        </Column>
      </Row>
      <Row className="orchard-row">
        <Column sm={4} md={8} lg={16}>
          <RadioButtonGroup
            id={state.hasPollenContamination.id}
            legendText={orchardStepText.pollenSection.pollenContamination.label}
            name="pollen-contam-radio-btn-group"
            orientation="vertical"
            onChange={(selected: string) => setBooleanValue('hasPollenContamination', selected === 'Yes')}
            readOnly={isFormSubmitted && !isReview}
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
                <Column sm={4} md={4} lg={8} xlg={6}>
                  <NumberInput
                    id={state.breedingPercentage.id}
                    name="breedingPercentage"
                    defaultValue={state.breedingPercentage.value}
                    step={10}
                    disableWheel
                    hideSteppers
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
                    readOnly={isFormSubmitted && !isReview}
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
