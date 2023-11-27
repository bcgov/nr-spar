import React, { useState } from 'react';
import {
  Row, Column, TextInput, Checkbox, ComboBox, InlineLoading, FlexGrid
} from '@carbon/react';
import { useMutation } from '@tanstack/react-query';
import validator from 'validator';

import { getForestClientLocation } from '../../api-service/forestClientsAPI';

import ComboBoxEvent from '../../types/ComboBoxEvent';
import MultiOptionsObj from '../../types/MultiOptionsObject';
import { LOCATION_CODE_LIMIT } from '../../shared-constants/shared-constants';
import { FilterObj, filterInput } from '../../utils/filterUtils';

import ApplicantAgencyFieldsProps from './definitions';
import supportTexts from './constants';
import { formatLocationCode } from './utils';

import './styles.scss';

const ApplicantAgencyFields = ({
  checkboxId, isDefault, agency, locationCode, fieldsProps, agencyOptions,
  defaultAgency, defaultCode, setAgencyAndCode, readOnly, showCheckbox
}: ApplicantAgencyFieldsProps) => {
  const [invalidLocationMessage, setInvalidLocationMessage] = useState<string>(
    locationCode.isInvalid && agency.value
      ? supportTexts.locationCode.invalidLocationForSelectedAgency
      : supportTexts.locationCode.invalidText
  );

  const [locationCodeHelperText, setLocationCodeHelperText] = useState<string>(
    supportTexts.locationCode.helperTextEnabled
  );

  const updateAfterLocValidation = (isInvalid: boolean) => {
    const updatedLocationCode = {
      ...locationCode,
      isInvalid
    };
    setLocationCodeHelperText(supportTexts.locationCode.helperTextEnabled);
    setAgencyAndCode(isDefault, agency, updatedLocationCode);
  };

  const validateLocationCodeMutation = useMutation({
    mutationFn: (queryParams: string[]) => getForestClientLocation(
      queryParams[0],
      queryParams[1]
    ),
    onError: () => {
      setInvalidLocationMessage(supportTexts.locationCode.invalidLocationForSelectedAgency);
      updateAfterLocValidation(true);
    },
    onSuccess: () => updateAfterLocValidation(false)
  });

  const handleDefaultCheckBox = (checked: boolean) => {
    setLocationCodeHelperText(
      checked
        ? supportTexts.locationCode.helperTextEnabled
        : supportTexts.locationCode.helperTextDisabled
    );

    const updatedAgency = {
      ...agency,
      value: checked ? defaultAgency : { code: '', label: '', description: '' }
    };

    const updatedLocationCode = {
      ...locationCode,
      value: checked ? defaultCode : ''
    };

    setAgencyAndCode(checked, updatedAgency, updatedLocationCode);
  };

  const handleAgencyInput = (value: MultiOptionsObj) => {
    setLocationCodeHelperText(
      value
        ? supportTexts.locationCode.helperTextEnabled
        : supportTexts.locationCode.helperTextDisabled
    );

    const updatedAgency = {
      ...agency,
      value: value ?? { code: '', label: '', description: '' }
    };

    const updatedLocationCode = {
      ...locationCode,
      value: value ? locationCode.value : ''
    };

    setAgencyAndCode(isDefault, updatedAgency, updatedLocationCode);
  };

  const handleLocationCodeChange = (value: string) => {
    const updatedValue = value.slice(0, LOCATION_CODE_LIMIT);

    const isInRange = validator.isInt(value, { min: 0, max: 99 });

    let updatedIsInvalid = locationCode.isInvalid;

    if (!isInRange) {
      setInvalidLocationMessage(supportTexts.locationCode.invalidText);
      updatedIsInvalid = true;
    }

    const updatedLocationCode = {
      ...locationCode,
      value: updatedValue,
      isInvalid: updatedIsInvalid
    };

    setAgencyAndCode(isDefault, agency, updatedLocationCode);
  };

  const handleLocationCodeBlur = (value: string) => {
    const formattedCode = value.length ? formatLocationCode(value) : '';

    const updatedLocationCode = {
      ...locationCode,
      value: formattedCode
    };

    setAgencyAndCode(isDefault, agency, updatedLocationCode);

    if (formattedCode === '') return;

    setLocationCodeHelperText('');
    validateLocationCodeMutation.mutate([agency.value.code, formattedCode]);
  };

  return (
    <FlexGrid className="agency-information-section">
      {
        showCheckbox
          ? (
            <Row className="agency-information-row">
              <Column sm={4} md={8} lg={16} xlg={16}>
                <Checkbox
                  id={checkboxId}
                  name={fieldsProps.useDefaultCheckbox.name}
                  labelText={fieldsProps.useDefaultCheckbox.labelText}
                  readOnly={readOnly}
                  checked={isDefault}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleDefaultCheckBox(e.target.checked);
                  }}
                />
              </Column>
            </Row>
          )
          : null
      }
      <Row className="agency-information-row">
        <Column sm={4} md={4} lg={8} xlg={6}>
          <ComboBox
            id={agency.id}
            name={fieldsProps.agencyInput.name}
            placeholder={supportTexts.agency.placeholder}
            titleText={fieldsProps.agencyInput.labelText}
            helperText={supportTexts.agency.helperText}
            invalidText={fieldsProps.agencyInput.invalidText}
            items={agencyOptions}
            readOnly={isDefault || readOnly}
            selectedItem={agency.value}
            onChange={(e: ComboBoxEvent) => handleAgencyInput(e.selectedItem)}
            invalid={agency.isInvalid}
            shouldFilterItem={
              ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
            }
            size="md"
          />
        </Column>
        <Column sm={4} md={4} lg={8} xlg={6}>
          <TextInput
            id={locationCode.id}
            className="location-code-input"
            name={fieldsProps.locationCode.name}
            value={locationCode.value}
            type="number"
            placeholder={!agency.value.code ? '' : supportTexts.locationCode.placeholder}
            labelText={fieldsProps.locationCode.labelText}
            helperText={locationCodeHelperText}
            invalid={locationCode.isInvalid}
            invalidText={invalidLocationMessage}
            readOnly={isDefault || readOnly}
            disabled={!agency.value.code}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleLocationCodeChange(e.target.value);
            }}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (!e.target.readOnly) {
                handleLocationCodeBlur(e.target.value);
              }
            }}
          />
          {
            validateLocationCodeMutation.isLoading
              ? <InlineLoading description="Validating..." />
              : null
          }
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default ApplicantAgencyFields;
