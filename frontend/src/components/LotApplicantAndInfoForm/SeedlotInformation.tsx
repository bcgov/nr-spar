import React, { useEffect } from 'react';
import {
  Row,
  Column,
  ComboBox,
  RadioButton,
  RadioButtonGroup,
  RadioButtonSkeleton,
  TextInputSkeleton
} from '@carbon/react';
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
import { EmptyMultiOptObj } from '../../shared-constants/shared-constants';

import { speciesFieldConfig } from './constants';

const SeedlotInformation = (
  {
    seedlotFormData,
    setSeedlotFormData,
    isEdit
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
          id={`seedlot-source-radio-btn-${source.code.toLowerCase()}`}
          key={source.code}
          checked={seedlotFormData.sourceCode.value === source.code}
          labelText={source.description}
          value={source.code}
        />
      ));
    }
    return <InputErrorText description="Could not retrieve seedlot sources." />;
  };

  const handleBoolRadioGroup = (inputName: keyof SeedlotRegFormType, checked: boolean) => {
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
        value: selectedItem?.code ? selectedItem : EmptyMultiOptObj,
        isInvalid
      }
    }));
  };

  return (
    <>
      <Row className="section-title">
        <Column lg={8}>
          <h2>Seedlot information</h2>
          <Subtitle text="Enter the initial information about this seedlot" />
        </Column>
      </Row>
      <Row className="form-row">
        <Column sm={4} md={8} lg={16} xlg={12}>
          {
            vegCodeQuery.isFetching
              ? <TextInputSkeleton />
              : (
                <>
                  <ComboBox
                    className={isEdit ? 'spar-read-only-combobox' : null}
                    id={seedlotFormData.species.id}
                    items={isEdit ? [] : vegCodeQuery.data ?? []}
                    shouldFilterItem={
                      ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
                    }
                    selectedItem={seedlotFormData.species.value}
                    placeholder={speciesFieldConfig.placeholder}
                    titleText={isEdit ? 'Seedlot species' : speciesFieldConfig.titleText}
                    onChange={(e: ComboBoxEvent) => handleSpeciesChage(e)}
                    invalid={seedlotFormData.species.isInvalid}
                    invalidText={speciesFieldConfig.invalidText}
                    helperText={vegCodeQuery.isError ? '' : speciesFieldConfig.helperText}
                    readOnly={isEdit}
                  />
                  {
                    vegCodeQuery.isError
                      ? <InputErrorText description={`An error occurred ${vegCodeQuery.error}`} />
                      : null
                  }
                </>
              )
          }
        </Column>
      </Row>
      <Row className="form-row">
        <Column sm={4} md={8} lg={16}>
          <RadioButtonGroup
            legendText="Specify A-class source"
            name="class-source-radiogroup"
            orientation="vertical"
            onChange={(e: string) => handleSource(e)}
          >
            {
              seedlotSourcesQuery.isFetching
                ? <RadioButtonSkeleton />
                : renderSources()
            }
          </RadioButtonGroup>
        </Column>
      </Row>
      <Row className="form-row">
        <Column sm={4} md={8} lg={16}>
          <RadioButtonGroup
            name="will-be-registered-radiogroup"
            legendText="To be registered at the Tree Seed Centre?"
            orientation="vertical"
            onChange={(checkedString: string) => handleBoolRadioGroup('willBeRegistered', checkedString === 'Yes')}
          >
            <RadioButton
              id="register-w-tsc-yes"
              checked={seedlotFormData.willBeRegistered.value}
              labelText="Yes"
              value="Yes"
            />
            <RadioButton
              id="register-w-tsc-no"
              checked={!seedlotFormData.willBeRegistered.value}
              labelText="No"
              value="No"
            />
          </RadioButtonGroup>
        </Column>
      </Row>
      <Row className="form-row">
        <Column sm={4} md={8} lg={16}>
          <RadioButtonGroup
            name="collected-within-bc-radiogroup"
            legendText="Collected from a location within B.C.?"
            orientation="vertical"
            onChange={(checkedString: string) => handleBoolRadioGroup('isBcSource', checkedString === 'Yes')}
          >
            <RadioButton
              id="collected-within-bc-yes"
              checked={seedlotFormData.isBcSource.value}
              labelText="Yes"
              value="Yes"
            />
            <RadioButton
              id="collected-within-bc-no"
              checked={!seedlotFormData.isBcSource.value}
              labelText="No"
              value="No"
            />
          </RadioButtonGroup>
        </Column>
      </Row>
    </>
  );
};

export default SeedlotInformation;
