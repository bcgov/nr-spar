import React from 'react';
import {
  Row,
  Column,
  ComboBox,
  RadioButton,
  RadioButtonGroup,
  TextInputSkeleton
} from '@carbon/react';
import { useQuery } from '@tanstack/react-query';

import Subtitle from '../Subtitle';
import InputErrorText from '../InputErrorText';
import getVegCodes from '../../api-service/vegetationCodeAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../config/TimeUnits';
import { FilterObj, filterInput } from '../../utils/FilterUtils';
import ComboBoxEvent from '../../types/ComboBoxEvent';
import { EmptyMultiOptObj } from '../../shared-constants/shared-constants';
import MultiOptionsObj from '../../types/MultiOptionsObject';
import VegCode from '../../types/VegetationCodeType';
import { getMultiOptList } from '../../utils/MultiOptionsUtils';
import { SeedlotRegFormType } from '../../types/SeedlotRegistrationTypes';

import { SeedlotInformationProps } from './definitions';
import { speciesFieldConfig, VegCodesToFilter } from './constants';

const SeedlotInformationBClass = (
  {
    seedlotFormData,
    setSeedlotFormData,
    isEdit,
    isReview
  }: SeedlotInformationProps
) => {
  const vegCodeQuery = useQuery({
    queryKey: ['vegetation-codes'],
    queryFn: getVegCodes,
    enabled: !isEdit,
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS,
    select: (data) => {
      if (!data) {
        return [];
      }
      const filteredData = data
        .filter((vegCode: VegCode) => !VegCodesToFilter.includes(vegCode.code));
      return getMultiOptList(filteredData, true, true);
    }
  });

  const handleBoolRadioGroup = (inputName: keyof SeedlotRegFormType, checked: boolean) => {
    setSeedlotFormData((prevData) => ({
      ...prevData,
      [inputName]: {
        ...prevData[inputName],
        value: checked
      }
    }));
  };

  const handleSpeciesChange = (event: ComboBoxEvent) => {
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
          {
            isReview
              ? null
              : <Subtitle text="Enter the initial information about this seedlot." />
          }
        </Column>
      </Row>
      <Row className="form-row">
        <Column sm={4} md={8} lg={16} xlg={12}>
          {
            vegCodeQuery.isFetching
              ? <TextInputSkeleton />
              : (
                <>
                  <ComboBox<MultiOptionsObj>
                    className={isEdit ? 'spar-read-only-combobox' : null}
                    id={seedlotFormData.species.id}
                    items={isEdit ? [] : vegCodeQuery.data ?? []}
                    shouldFilterItem={
                      ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
                    }
                    selectedItem={seedlotFormData.species.value}
                    placeholder={speciesFieldConfig.placeholder}
                    titleText={isEdit ? 'Seedlot species' : speciesFieldConfig.titleText}
                    onChange={(e: ComboBoxEvent) => handleSpeciesChange(e)}
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
            name="b-class-will-be-registered-radiogroup"
            legendText="To be registered at the Tree Seed Centre?"
            orientation="vertical"
            onChange={(checkedString: string) => handleBoolRadioGroup('willBeRegistered', checkedString === 'Yes')}
          >
            <RadioButton
              id="b-class-register-w-tsc-yes"
              checked={seedlotFormData.willBeRegistered.value}
              labelText="Yes"
              value="Yes"
            />
            <RadioButton
              id="b-class-register-w-tsc-no"
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
            name="b-class-collected-within-bc-radiogroup"
            legendText="Collected from a location within B.C.?"
            orientation="vertical"
            onChange={(checkedString: string) => handleBoolRadioGroup('isBcSource', checkedString === 'Yes')}
          >
            <RadioButton
              id="b-class-collected-within-bc-yes"
              checked={seedlotFormData.isBcSource.value}
              labelText="Yes"
              value="Yes"
            />
            <RadioButton
              id="b-class-collected-within-bc-no"
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

export default SeedlotInformationBClass;
