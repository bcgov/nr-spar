import React, { useState } from 'react';
import {
  Row, Column, TextInput, Checkbox, ComboBox, InlineLoading
} from '@carbon/react';
import { useMutation } from '@tanstack/react-query';
import validator from 'validator';

import { getForestClientLocation } from '../../api-service/forestClientsAPI';

import ComboBoxEvent from '../../types/ComboBoxEvent';
import MultiOptionsObj from '../../types/MultiOptionsObject';
import { LOCATION_CODE_LIMIT } from '../../shared-constants/shared-constants';
import { formatLocationCode } from '../SeedlotRegistrationSteps/CollectionStep/utils';
import { FilterObj, filterInput } from '../../utils/filterUtils';
import getForestClientNumber from '../../utils/StringUtils';

import ApplicantAgencyFieldsProps from './definitions';
import supportTexts from './constants';

import './styles.scss';

const ApplicantAgencyFields = ({
  useDefault, agency, locationCode, fieldsProps, agencyOptions,
  defaultAgency, defaultCode, setAllValues, readOnly
}: ApplicantAgencyFieldsProps) => {
  const agencyClone = structuredClone(agency);
  const locationCodeClone = structuredClone(locationCode);
  const useDefaultClone = structuredClone(useDefault);

  const [forestClientNumber, setForestClientNumber] = useState<string>(
    agencyClone.value ? getForestClientNumber(agencyClone.value) : ''
  );
  const [invalidLocationMessage, setInvalidLocationMessage] = useState<string>(
    locationCodeClone.isInvalid && agencyClone.value
      ? supportTexts.locationCode.invalidLocationForSelectedAgency
      : supportTexts.locationCode.invalidText
  );
  const [locationCodeHelperText, setLocationCodeHelperText] = useState<string>(
    supportTexts.locationCode.helperTextEnabled
  );

  const updateAfterLocValidation = (isInvalid: boolean) => {
    locationCodeClone.isInvalid = isInvalid;
    setLocationCodeHelperText(supportTexts.locationCode.helperTextEnabled);
    setAllValues(agencyClone, locationCodeClone, useDefaultClone);
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

    agencyClone.value = checked ? defaultAgency : '';
    locationCodeClone.value = checked ? defaultCode : '';
    useDefaultClone.value = checked;

    setAllValues(agencyClone, locationCodeClone, useDefaultClone);
  };

  const handleAgencyInput = (value: MultiOptionsObj) => {
    setForestClientNumber(value ? value.code : '');
    setLocationCodeHelperText(
      value
        ? supportTexts.locationCode.helperTextEnabled
        : supportTexts.locationCode.helperTextDisabled
    );
    agencyClone.value = value ? value.label : '';
    locationCodeClone.value = value ? locationCodeClone.value : '';
    setAllValues(agencyClone, locationCodeClone, useDefaultClone);
  };

  const handleLocationCodeChange = (value: string) => {
    locationCodeClone.value = value.slice(0, LOCATION_CODE_LIMIT);
    const isInRange = validator.isInt(value, { min: 0, max: 99 });
    if (!isInRange) {
      setInvalidLocationMessage(supportTexts.locationCode.invalidText);
      locationCodeClone.isInvalid = true;
    }
    setAllValues(agencyClone, locationCodeClone, useDefaultClone);
  };

  const handleLocationCodeBlur = (value: string) => {
    const formattedCode = value.length ? formatLocationCode(value) : '';
    if (formattedCode === '') return;
    locationCodeClone.value = formattedCode;
    setAllValues(agencyClone, locationCodeClone, useDefaultClone);
    if (forestClientNumber) {
      validateLocationCodeMutation.mutate([forestClientNumber, formattedCode]);
      setLocationCodeHelperText('');
    }
  };

  return (
    <div className="agency-information-section">
      <Row className="agency-information-row">
        <Column sm={4} md={8} lg={16} xlg={16}>
          <Checkbox
            id={useDefaultClone.id}
            name={fieldsProps.useDefaultCheckbox.name}
            labelText={fieldsProps.useDefaultCheckbox.labelText}
            readOnly={readOnly}
            checked={useDefaultClone.value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleDefaultCheckBox(e.target.checked);
            }}
          />
        </Column>
      </Row>
      <Row className="agency-information-row">
        <Column sm={4} md={4} lg={8} xlg={6}>
          <ComboBox
            id={agencyClone.id}
            name={fieldsProps.agencyInput.name}
            placeholder={supportTexts.agency.placeholder}
            titleText={fieldsProps.agencyInput.labelText}
            helperText={supportTexts.agency.helperText}
            invalidText={fieldsProps.agencyInput.invalidText}
            items={agencyOptions}
            readOnly={useDefaultClone.value || readOnly}
            selectedItem={agencyClone.value}
            onChange={(e: ComboBoxEvent) => handleAgencyInput(e.selectedItem)}
            invalid={agencyClone.isInvalid}
            shouldFilterItem={
              ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
            }
            size="md"
          />
        </Column>
        <Column sm={4} md={4} lg={8} xlg={6}>
          <TextInput
            id={locationCodeClone.id}
            className="location-code-input"
            name={fieldsProps.locationCode.name}
            value={locationCodeClone.value}
            type="number"
            placeholder={!forestClientNumber ? '' : supportTexts.locationCode.placeholder}
            labelText={fieldsProps.locationCode.labelText}
            helperText={locationCodeHelperText}
            invalid={locationCodeClone.isInvalid}
            invalidText={invalidLocationMessage}
            readOnly={useDefaultClone.value || readOnly}
            disabled={!forestClientNumber}
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
    </div>
  );
};

export default ApplicantAgencyFields;
