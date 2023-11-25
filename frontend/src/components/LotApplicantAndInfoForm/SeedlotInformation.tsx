import React, { useEffect } from 'react';
import {
  Button,
  Row,
  Column,
  ComboBox,
  RadioButton,
  RadioButtonGroup,
  Checkbox,
  CheckboxGroup,
  RadioButtonSkeleton,
  TextInputSkeleton
} from '@carbon/react';
import { DocumentAdd, Save } from '@carbon/icons-react';
import { useQuery } from '@tanstack/react-query';

import { SeedlotRegFormType } from '../../types/SeedlotRegistrationTypes';

import Subtitle from '../Subtitle';
import { SeedlotInformationProps } from './definitions';
import SeedlotSourceType from '../../types/SeedlotSourceType';
import InputErrorText from '../InputErrorText';
import getVegCodes from '../../api-service/vegetationCodeAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../config/TimeUnits';
import getSeedlotSources from '../../api-service/SeedlotSourcesAPI';
import { FilterObj, filterInput } from '../../utils/filterUtils';
import ComboBoxEvent from '../../types/ComboBoxEvent';
import { speciesFieldConfig } from './constants';
import focusById from '../../utils/FocusUtils';
import { convertToPayload } from './utils';

const SeedlotInformation = (
  {
    seedlotFormData,
    setSeedlotFormData,
    isEdit,
    seedlotMutationFunc
  }: SeedlotInformationProps
) => {
  const vegCodeQuery = useQuery({
    queryKey: ['vegetation-codes'],
    queryFn: () => getVegCodes(true),
    enabled: !isEdit,
    staleTime: THREE_HOURS, // will not refetch for 3 hours
    cacheTime: THREE_HALF_HOURS // data is cached 3.5 hours then deleted
  });

  const seedlotSourcesQuery = useQuery({
    queryKey: ['seedlot-sources'],
    queryFn: () => getSeedlotSources(),
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  const setDefaultSource = (sources: SeedlotSourceType[]) => {
    sources.forEach((source) => {
      if (source.isDefault) {
        setSeedlotFormData((prevData) => ({
          ...prevData,
          sourceCode: {
            ...prevData.sourceCode,
            value: source.code
          }
        }));
      }
    });
  };

  /**
   *  Default value is only set once upon query success, when cache data is used
   *  we will need to set the default again here.
   */
  useEffect(() => {
    if (seedlotSourcesQuery.isSuccess && !seedlotFormData.sourceCode.value) {
      setDefaultSource(seedlotSourcesQuery.data);
    }
  }, [seedlotSourcesQuery.isFetched]);

  const renderSources = () => {
    if (seedlotSourcesQuery.isFetched) {
      return seedlotSourcesQuery.data.map((source: SeedlotSourceType) => (
        <RadioButton
          key={source.code}
          checked={seedlotFormData.sourceCode.value === source.code}
          id={`seedlot-source-radio-btn-${source.code.toLocaleLowerCase()}`}
          labelText={source.description}
          value={source.code}
        />
      ));
    }
    return <InputErrorText description="Could not retrieve seedlot sources." />;
  };

  const handleCheckBox = (inputName: keyof SeedlotRegFormType, checked: boolean) => {
    setSeedlotFormData((prevData) => ({
      ...prevData,
      [inputName]: {
        ...prevData[inputName],
        value: checked
      }
    }));
  };

  const handleSource = (value: string) => {
    setSeedlotFormData((prevData) => ({
      ...prevData,
      sourceCode: {
        ...prevData.sourceCode,
        value
      }
    }));
  };

  /**
   * Handle combobox changes for agency and species.
   */
  const handleSpeciesChage = (event: ComboBoxEvent) => {
    const { selectedItem } = event;
    const isInvalid = selectedItem === null;
    setSeedlotFormData((prevData) => ({
      ...prevData,
      species: {
        ...prevData.species,
        value: selectedItem?.code ? selectedItem : {
          code: '',
          label: '',
          description: ''
        },
        isInvalid
      }
    }));
  };

  const setInputValidation = (inputName: keyof SeedlotRegFormType, isInvalid: boolean) => (
    setSeedlotFormData((prevData) => ({
      ...prevData,
      [inputName]: {
        ...prevData[inputName],
        isInvalid
      }
    }))
  );

  const validateAndSubmitCreation = () => {
    // Validate client
    if (seedlotFormData.client.isInvalid || !seedlotFormData.client.value.code) {
      setInputValidation('client', true);
      focusById(seedlotFormData.client.id);
      return;
    }
    // Vaidate location code
    if (
      seedlotFormData.locationCode.isInvalid
      || !seedlotFormData.locationCode.value
      // || !validateLocationCodeMutation.isSuccess
    ) {
      setInputValidation('locationCode', true);
      // setInvalidLocationMessage(pageTexts.locCodeInput.invalidLocationValue);
      focusById(seedlotFormData.locationCode.id);
      return;
    }
    // Validate email
    if (seedlotFormData.email.isInvalid || !seedlotFormData.email.value) {
      setInputValidation('email', true);
      focusById(seedlotFormData.email.id);
      return;
    }
    // Validate species
    if (seedlotFormData.species.isInvalid || !seedlotFormData.species.value.code) {
      setInputValidation('species', true);
      focusById(seedlotFormData.species.id);
      return;
    }
    // Source code, and the two booleans always have a default value so there's no need to check.

    // Submit Seedlot.
    const payload = convertToPayload(seedlotFormData);
    seedlotMutationFunc(payload);
  };

  return (
    <>
      <Row className="seedlot-information-title">
        <Column lg={8}>
          <h2>Seedlot information</h2>
          <Subtitle text="Enter the initial information about this seedlot" />
        </Column>
      </Row>
      <Row className="seedlot-species-row">
        {
          vegCodeQuery.isFetching
            ? (
              <Column sm={4} md={2} lg={10}>
                <TextInputSkeleton />
              </Column>
            )
            : (
              <Column sm={4} md={2} lg={10}>
                <ComboBox
                  id={seedlotFormData.species.id}
                  items={vegCodeQuery.isFetched ? vegCodeQuery.data : []}
                  shouldFilterItem={
                    ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
                  }
                  placeholder={speciesFieldConfig.placeholder}
                  titleText={speciesFieldConfig.titleText}
                  onChange={(e: ComboBoxEvent) => handleSpeciesChage(e)}
                  invalid={seedlotFormData.species.isInvalid}
                  invalidText={speciesFieldConfig.invalidText}
                  helperText={vegCodeQuery.isError ? '' : speciesFieldConfig.helperText}
                />
                {
                  vegCodeQuery.isError
                    ? <InputErrorText description={`An error occurred ${vegCodeQuery.error}`} />
                    : null
                }
              </Column>
            )
        }
      </Row>
      <Row className="class-source-radio">
        <Column sm={4} md={8} lg={16}>
          <RadioButtonGroup
            legendText="Class A source"
            name="class-source-radiogroup"
            orientation="vertical"
            onChange={(e: string) => handleSource(e)}
          >
            {
              seedlotSourcesQuery.isFetching
                ? (
                  <RadioButtonSkeleton />
                )
                : renderSources()
            }
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
              checked={seedlotFormData.willBeRegistered.value}
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
              checked={seedlotFormData.isBcSource.value}
              onChange={
                (e: React.ChangeEvent<HTMLInputElement>) => handleCheckBox('isBcSource', e.target.checked)
              }
            />
          </CheckboxGroup>
        </Column>
      </Row>
      <Row>
        <Column lg={8}>
          <Button
            className="submit-button"
            renderIcon={isEdit ? Save : DocumentAdd}
            onClick={() => validateAndSubmitCreation()}
          >
            {
              isEdit
                ? 'Save edit'
                : 'Create seedlot number'
            }
          </Button>
        </Column>
      </Row>
    </>
  );
};

export default SeedlotInformation;
