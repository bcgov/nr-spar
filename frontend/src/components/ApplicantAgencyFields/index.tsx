import React, { useEffect, useState } from 'react';
import {
  Row, Column, TextInput, Checkbox, ComboBox, InlineLoading
} from '@carbon/react';
import { useMutation } from '@tanstack/react-query';
import validator from 'validator';

import { getForestClientLocation } from '../../api-service/forestClientsAPI';

import ComboBoxEvent from '../../types/ComboBoxEvent';
import MultiOptionsObj from '../../types/MultiOptionsObject';
import { FormInputType } from '../../types/FormInputType';
import { LOCATION_CODE_LIMIT } from '../../shared-constants/shared-constants';
import { formatLocationCode } from '../SeedlotRegistrationSteps/CollectionStep/utils';
import { FilterObj, filterInput } from '../../utils/filterUtils';
import getForestClientNumber from '../../utils/StringUtils';

import ApplicantAgencyFieldsProps from './definitions';
import supportTexts from './constants';

import './styles.scss';

const ApplicantAgencyFields = ({
  useDefault, agency, locationCode, fieldsProps, agencyOptions, defaultAgency,
  defaultCode, setAllValues, showDefaultCheckbox = true, inputsColSize = 6, readOnly
}: ApplicantAgencyFieldsProps) => {
  const [agencyClone, setAgencyClone] = useState<FormInputType & {value: string}>(agency);
  const [locationCodeClone, setLocationCodeClone] = useState<FormInputType & {value: string}>(
    locationCode
  );
  const [useDefaultClone, setUseDefaultClone] = useState<FormInputType & {value: boolean}>(
    useDefault
  );

  const [shouldUpdateValues, setShouldUpdateValues] = useState<boolean>(false);

  const [forestClientNumber, setForestClientNumber] = useState<string>('');
  const [invalidLocationMessage, setInvalidLocationMessage] = useState<string>(
    locationCodeClone.isInvalid && agencyClone.value
      ? supportTexts.locationCode.invalidLocationForSelectedAgency
      : supportTexts.locationCode.invalidText
  );
  const [locationCodeHelperText, setLocationCodeHelperText] = useState<string>(
    supportTexts.locationCode.helperTextDisabled
  );

  const updateAfterLocValidation = (isInvalid: boolean) => {
    setLocationCodeClone({
      ...locationCodeClone,
      isInvalid
    });
    setLocationCodeHelperText(supportTexts.locationCode.helperTextEnabled);
    setShouldUpdateValues(true);
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

    setAgencyClone({
      ...agencyClone,
      value: checked ? defaultAgency : '',
      isInvalid: false
    });
    setLocationCodeClone({
      ...locationCodeClone,
      value: checked ? defaultCode : '',
      isInvalid: false
    });
    setUseDefaultClone({
      ...useDefaultClone,
      value: checked
    });

    setShouldUpdateValues(true);
  };

  const handleAgencyInput = (value: MultiOptionsObj) => {
    setForestClientNumber(value ? value.code : '');
    setLocationCodeHelperText(
      value
        ? supportTexts.locationCode.helperTextEnabled
        : supportTexts.locationCode.helperTextDisabled
    );
    setAgencyClone({
      ...agencyClone,
      value: value ? value.label : ''
    });
    setLocationCodeClone({
      ...locationCodeClone,
      value: value ? locationCodeClone.value : ''
    });
    setShouldUpdateValues(true);
  };

  const handleLocationCodeChange = (value: string) => {
    const locationCodeUpdated = { ...locationCodeClone };
    locationCodeUpdated.value = value.slice(0, LOCATION_CODE_LIMIT);
    const isInRange = validator.isInt(value, { min: 0, max: 99 });
    if (!isInRange) {
      setInvalidLocationMessage(supportTexts.locationCode.invalidText);
      locationCodeUpdated.isInvalid = true;
    }
    setLocationCodeClone(locationCodeUpdated);
  };

  const handleLocationCodeBlur = (value: string) => {
    const formattedCode = value.length ? formatLocationCode(value) : '';
    setLocationCodeClone({
      ...locationCodeClone,
      value: formattedCode
    });
    setShouldUpdateValues(true);
    if (formattedCode === '') return;
    if (forestClientNumber) {
      setLocationCodeHelperText('');
      validateLocationCodeMutation.mutate([forestClientNumber, formattedCode]);
    }
  };

  useEffect(() => {
    if (shouldUpdateValues) {
      setAllValues(agencyClone, locationCodeClone, useDefaultClone);
    } else {
      setAgencyClone(agency);
      setLocationCodeClone(locationCode);
      setUseDefaultClone(useDefault);
      setForestClientNumber(agency.value ? getForestClientNumber(agencyClone.value) : '');
    }
    setShouldUpdateValues(false);
  }, [useDefault, agency, locationCode, shouldUpdateValues]);

  return (
    <div className="agency-information-section">
      {
        showDefaultCheckbox
          ? (
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
          )
          : null
      }
      <Row className="agency-information-row">
        <Column sm={4} md={4} lg={inputsColSize} xlg={inputsColSize}>
          <ComboBox
            id={agencyClone.id}
            name={fieldsProps.agencyInput.name}
            placeholder={supportTexts.agency.placeholder}
            titleText={fieldsProps.agencyInput.labelText}
            helperText={supportTexts.agency.helperText}
            invalidText={fieldsProps.agencyInput.invalidText}
            items={agencyOptions}
            readOnly={(showDefaultCheckbox ? useDefaultClone.value : false) || readOnly}
            selectedItem={agencyClone.value}
            onChange={(e: ComboBoxEvent) => handleAgencyInput(e.selectedItem)}
            invalid={agencyClone.isInvalid}
            shouldFilterItem={
              ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
            }
            size="md"
          />
        </Column>
        <Column sm={4} md={4} lg={inputsColSize} xlg={inputsColSize}>
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
            readOnly={(showDefaultCheckbox ? useDefaultClone.value : false) || readOnly}
            disabled={!forestClientNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleLocationCodeChange(e.target.value);
            }}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (!e.target.readOnly
                  && locationCode.value !== e.target.value) {
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
