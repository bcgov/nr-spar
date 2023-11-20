import React, { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import moment from 'moment';
import validator from 'validator';

import {
  Checkbox,
  Column,
  ComboBox,
  DatePicker,
  DatePickerInput,
  FlexGrid,
  InlineNotification,
  Row,
  TextInput,
  InlineLoading
} from '@carbon/react';

import Subtitle from '../../Subtitle';

import {
  inputText,
  DATE_FORMAT,
  initLocationValidateObj
} from './constants';

import { getForestClientLocation } from '../../../api-service/forestClientsAPI';

import ExtractionStorage from '../../../types/SeedlotTypes/ExtractionStorage';
import ComboBoxEvent from '../../../types/ComboBoxEvent';
import MultiOptionsObj from '../../../types/MultiOptionsObject';

import { FilterObj, filterInput } from '../../../utils/filterUtils';
import getForestClientNumber from '../../../utils/StringUtils';
import {
  FormValidation,
  initialValidationObj,
  ValidateLocationType
} from './definitions';

import './styles.scss';

interface ExtractionAndStorageProps {
  state: ExtractionStorage,
  setStepData: Function,
  defaultAgency: string,
  defaultCode: string,
  agencyOptions: Array<MultiOptionsObj>,
  readOnly?: boolean
}

const ExtractionAndStorage = (
  {
    state,
    setStepData,
    defaultAgency,
    defaultCode,
    agencyOptions,
    readOnly
  }: ExtractionAndStorageProps
) => {
  const [validationObj, setValidationObj] = useState<FormValidation>(initialValidationObj);
  const [isExtractorHintOpen, setIsExtractorHintOpen] = useState<boolean>(true);
  const [isStorageHintOpen, setIsStorageHintOpen] = useState<boolean>(true);
  const [currentSection, setCurrentSection] = useState<string>('');
  const [locValidationObj, setLocValidationObj] = useState<ValidateLocationType>(
    initLocationValidateObj
  );

  const updateAfterLocValidation = (isInvalid: boolean) => {
    setValidationObj({
      ...validationObj,
      [currentSection === 'extractorFields' ? 'isExtractorCodeInvalid' : 'isStorageCodeInvalid']: isInvalid
    });
    setLocValidationObj({
      ...locValidationObj,
      [currentSection]: {
        ...locValidationObj[currentSection],
        locationCodeHelper: inputText.extractorCode.helperTextEnabled,
        invalidLocationMessage: isInvalid ? inputText.extractorCode.invalidLocationForSelectedAgency : ''
      }
    });
  };

  const validateLocationCodeMutation = useMutation({
    mutationFn: (queryParams: string[]) => getForestClientLocation(
      queryParams[0],
      queryParams[1]
    ),
    onError: () => updateAfterLocValidation(true),
    onSuccess: () => updateAfterLocValidation(false)
  });

  const validateLocationCode = (
    event: React.ChangeEvent<HTMLInputElement>,
    section: string
  ) => {
    let locationCode = event.target.value;
    const stepDataField = section === 'extractorFields' ? 'extractoryLocationCode' : 'seedStorageLocationCode';
    const isInRange = validator.isInt(locationCode, { min: 0, max: 99 });

    // Adding this check to add an extra 0 on the left, for cases where
    // the user types values between 0 and 9
    if (isInRange && locationCode.length === 1) {
      locationCode = locationCode.padStart(2, '0');
      setStepData({
        ...state,
        [stepDataField]: locationCode
      });
    }

    if (!isInRange) {
      setLocValidationObj({
        ...locValidationObj,
        [section]: {
          ...locValidationObj[section],
          invalidLocationMessage: inputText.extractorCode.invalidLocationValue
        }
      });
      setValidationObj({
        ...validationObj,
        [section === 'extractorFields' ? 'isExtractorCodeInvalid' : 'isStorageCodeInvalid']: true
      });
    } else if (locValidationObj[section].forestClientNumber) {
      validateLocationCodeMutation.mutate(
        [locValidationObj[section].forestClientNumber, locationCode]
      );
      setLocValidationObj({
        ...locValidationObj,
        [section]: {
          ...locValidationObj[section],
          locationCodeHelper: ''
        }
      });
      setValidationObj({
        ...validationObj,
        [section === 'extractorFields' ? 'isExtractorCodeInvalid' : 'isStorageCodeInvalid']: false
      });
    }
  };

  const validateInput = (name: string, value: string | boolean) => {
    const newValidObj = { ...validationObj };
    let isInvalid = false;
    switch (name) {
      case 'extractoryAgency':
        if (!value) {
          newValidObj.isExtractorCodeInvalid = isInvalid;
        }
        break;
      case 'seedStorageAgency':
        if (!value) {
          newValidObj.isStorageCodeInvalid = isInvalid;
        }
        break;
      case 'extractionStartDate':
      case 'extractionEndDate':
        // Have both start and end dates
        if (state.extractionStartDate !== '' && state.extractionEndDate !== '') {
          isInvalid = moment(state.extractionEndDate, 'YYYY/MM/DD')
            .isBefore(moment(state.extractionStartDate, 'YYYY/MM/DD'));
        }
        newValidObj.isExtractorStartDateInvalid = isInvalid;
        newValidObj.isExtractorEndDateInvalid = isInvalid;
        break;
      case 'seedStorageStartDate':
      case 'seedStorageEndDate':
        // Have both start and end dates
        if (state.seedStorageStartDate !== '' && state.seedStorageEndDate !== '') {
          isInvalid = moment(state.seedStorageEndDate, 'YYYY/MM/DD')
            .isBefore(moment(state.seedStorageStartDate, 'YYYY/MM/DD'));
        }
        newValidObj.isStorageStartDateInvalid = isInvalid;
        newValidObj.isStorageEndDateInvalid = isInvalid;
        break;
      default:
        break;
    }
    setValidationObj(newValidObj);
  };

  const extractorNameInputRef = useRef<HTMLInputElement>(null);
  const extractorNumberInputRef = useRef<HTMLInputElement>(null);
  const storageNameInputRef = useRef<HTMLInputElement>(null);
  const storageNumberInputRef = useRef<HTMLInputElement>(null);

  const handleFormInput = (
    name: keyof ExtractionStorage,
    value: string | boolean,
    optName?: keyof ExtractionStorage,
    optValue?: string | boolean,
    tscAgency?: string,
    checked?: boolean
  ) => {
    if (optName && optName !== name) {
      let newState = {
        ...state,
        [name]: value,
        [optName]: optValue
      };

      if (tscAgency) {
        newState = {
          ...newState,
          [tscAgency]: checked
        };
      }

      setStepData(newState);
    } else if (name === 'extractoryAgency' || name === 'seedStorageAgency') {
      const section = name === 'extractoryAgency' ? 'extractorFields' : 'storageFields';
      const stepDataField = section === 'extractorFields' ? 'extractoryLocationCode' : 'seedStorageLocationCode';
      setLocValidationObj({
        ...locValidationObj,
        [section]: {
          ...locValidationObj[section],
          forestClientNumber: value ? getForestClientNumber(value as string) : '',
          locationCodeHelper:
            value
              ? inputText.extractorCode.helperTextEnabled
              : inputText.extractorCode.helperTextDisabled
        }
      });
      setStepData({
        ...state,
        [name]: value,
        [stepDataField]: value ? state[stepDataField] : ''
      });
    } else {
      setStepData({
        ...state,
        [name]: value
      });
    }

    validateInput(name, value);
    if (optName && optValue) {
      validateInput(optName, optValue);
    }
  };

  return (
    <FlexGrid className="extractory-and-storage-form" fullWidth>
      <Row className="extraction-information-title">
        <Column sm={4} md={8} lg={16}>
          <h2>{inputText.extractionTitle.titleText}</h2>
          <Subtitle text={inputText.extractionTitle.subtitleText} />
        </Column>
      </Row>
      <Row className="extractory-agency-tsc-checkbox-row">
        <Column sm={4} md={8} lg={16}>
          <Checkbox
            id="extractory-agency-tsc-checkbox"
            name="extractory-agency-tsc"
            labelText={inputText.extractorCheckbox.labelText}
            checked={state.extractoryUseTSC}
            readOnly={readOnly}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const { checked } = e.target;
              setLocValidationObj({
                ...locValidationObj,
                extractorFields: {
                  ...locValidationObj.extractorFields,
                  locationCodeHelper:
                    !checked
                      ? inputText.extractorCode.helperTextDisabled
                      : inputText.extractorCode.helperTextEnabled
                }
              });
              handleFormInput(
                'extractoryAgency',
                checked ? defaultAgency : '',
                'extractoryLocationCode',
                checked ? defaultCode : '',
                'extractoryUseTSC',
                checked
              );
            }}
          />
        </Column>
      </Row>
      <Row className="extractor-agency-row">
        <Column className="extractor-agency-col" sm={4} md={4} lg={8} xlg={6}>
          <ComboBox
            id="extractory-agency-combobox"
            ref={extractorNameInputRef}
            name="extractory-agency"
            helperText={inputText.extractor.helperText}
            readOnly={readOnly ?? state.extractoryUseTSC}
            onChange={(e: ComboBoxEvent) => {
              handleFormInput(
                'extractoryAgency',
                e.selectedItem
                  ? e.selectedItem.label
                  : ''
              );
            }}
            selectedItem={state.extractoryAgency}
            shouldFilterItem={
              ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
            }
            titleText={inputText.extractor.titleText}
            placeholder={inputText.extractor.placeholder}
            items={agencyOptions}
            invalid={validationObj.isExtractorNameInvalid}
          />
        </Column>
        <Column className="extractor-agency-col" sm={4} md={4} lg={8} xlg={6}>
          <TextInput
            id="extractory-agency-location-code-input"
            className="extractory-agency-location-code"
            name="extractory-agency-location-code"
            ref={extractorNumberInputRef}
            value={state.extractoryLocationCode}
            type="number"
            placeholder={!locValidationObj.extractorFields.forestClientNumber ? '' : 'Example: 00'}
            labelText={inputText.extractorCode.labelText}
            helperText={locValidationObj.extractorFields.locationCodeHelper}
            invalid={validationObj.isExtractorCodeInvalid}
            invalidText={locValidationObj.extractorFields.invalidLocationMessage}
            disabled={!locValidationObj.extractorFields.forestClientNumber}
            readOnly={readOnly ?? state.extractoryUseTSC}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleFormInput('extractoryLocationCode', e.target.value);
            }}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (!e.target.readOnly) {
                setCurrentSection('extractorFields');
                validateLocationCode(e, 'extractorFields');
              }
            }}
          />
          {
            validateLocationCodeMutation.isLoading && currentSection === 'extractorFields'
              ? <InlineLoading description="Validating..." />
              : null
          }
        </Column>
      </Row>
      <Row className="extraction-date-row">
        <Column className="extraction-start-date-col" sm={4} md={4} lg={8} xlg={6}>
          <DatePicker
            datePickerType="single"
            name="extractionStartDate"
            dateFormat={DATE_FORMAT}
            value={state.extractionStartDate}
            onChange={(_e: Array<Date>, selectedDate: string) => {
              handleFormInput('extractionStartDate', selectedDate);
            }}
            readOnly={readOnly}
          >
            <DatePickerInput
              id="extraction-start-date-input"
              labelText={inputText.date.extraction.labelText.start}
              helperText={inputText.date.helperText}
              placeholder={inputText.date.placeholder}
              invalid={validationObj.isExtractorStartDateInvalid}
              invalidText={inputText.date.invalidText}
              disabled={state.extractoryUseTSC}
            />
          </DatePicker>
        </Column>
        <Column className="extraction-end-date-col" sm={4} md={4} lg={8} xlg={6}>
          <DatePicker
            datePickerType="single"
            name="extractionEndDate"
            dateFormat={DATE_FORMAT}
            value={state.extractionEndDate}
            onChange={(_e: Array<Date>, selectedDate: string) => {
              handleFormInput('extractionEndDate', selectedDate);
            }}
            readOnly={readOnly}
          >
            <DatePickerInput
              id="extraction-end-date-input"
              labelText={inputText.date.extraction.labelText.end}
              helperText={inputText.date.helperText}
              placeholder={inputText.date.placeholder}
              invalid={validationObj.isExtractorEndDateInvalid}
              invalidText={inputText.date.invalidText}
              disabled={state.extractoryUseTSC}
            />
          </DatePicker>
        </Column>
        <Column sm={4} md={8} lg={16} xlg={12}>
          {state.extractoryUseTSC && !readOnly && isExtractorHintOpen && (
            <InlineNotification
              lowContrast
              kind="info"
              title={inputText.date.extraction.notification.title}
              subtitle={inputText.date.extraction.notification.subtitle}
              onCloseButtonClick={() => { setIsExtractorHintOpen(false); }}
            />
          )}
        </Column>
      </Row>
      <Row className="temporary-seed-storage-title">
        <Column lg={16}>
          <h2>{inputText.storageTitle.titleText}</h2>
          <Subtitle text={inputText.storageTitle.subtitleText} />
        </Column>
      </Row>
      <Row className="seed-storage-agency-tsc-checkbox-row">
        <Column sm={4} md={8} lg={16}>
          <Checkbox
            id="seed-storage-agency-tsc-checkbox"
            name="seed-storage-agency-tsc"
            labelText={inputText.storageCheckbox.labelText}
            checked={state.seedStorageUseTSC}
            readOnly={readOnly}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const { checked } = e.target;
              setLocValidationObj({
                ...locValidationObj,
                storageFields: {
                  ...locValidationObj.storageFields,
                  locationCodeHelper:
                    !checked
                      ? inputText.storageCode.helperTextDisabled
                      : inputText.storageCode.helperTextEnabled
                }
              });
              handleFormInput(
                'seedStorageAgency',
                checked ? defaultAgency : '',
                'seedStorageLocationCode',
                checked ? defaultCode : '',
                'seedStorageUseTSC',
                checked
              );
            }}
          />
        </Column>
      </Row>
      <Row className="seed-storage-agency-row">
        <Column className="seed-storage-agency-col" sm={4} md={4} lg={8} xlg={6}>
          <ComboBox
            id="seed-storage-agency-combobox"
            ref={storageNameInputRef}
            name="seed-storage-agency"
            helperText={inputText.storage.helperText}
            onChange={(e: ComboBoxEvent) => {
              handleFormInput(
                'seedStorageAgency',
                e.selectedItem
                  ? e.selectedItem.label
                  : ''
              );
            }}
            selectedItem={state.seedStorageAgency}
            shouldFilterItem={
              ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
            }
            titleText={inputText.storage.titleText}
            placeholder={inputText.storage.placeholder}
            readOnly={state.seedStorageUseTSC}
            items={agencyOptions}
            invalid={validationObj.isStorageNameInvalid}
          />
        </Column>
        <Column className="seed-storage-location-code-col" sm={4} md={4} lg={8} xlg={6}>
          <TextInput
            id="seed-storage-location-code-input"
            className="storage-agency-location-code"
            name="seed-storage-location-code"
            ref={storageNumberInputRef}
            value={state.seedStorageLocationCode}
            type="number"
            placeholder={!locValidationObj.storageFields.forestClientNumber ? '' : 'Example: 00'}
            labelText={inputText.storageCode.labelText}
            helperText={locValidationObj.storageFields.locationCodeHelper}
            invalid={validationObj.isStorageCodeInvalid}
            invalidText={locValidationObj.storageFields.invalidLocationMessage}
            disabled={!locValidationObj.storageFields.forestClientNumber}
            readOnly={readOnly || state.seedStorageUseTSC}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleFormInput('seedStorageLocationCode', e.target.value);
            }}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (!e.target.readOnly) {
                setCurrentSection('storageFields');
                validateLocationCode(e, 'storageFields');
              }
            }}
          />
          {
            validateLocationCodeMutation.isLoading && currentSection === 'storageFields'
              ? <InlineLoading description="Validating..." />
              : null
          }
        </Column>
      </Row>
      <Row className="storage-date-row">
        <Column className="storage-start-date-col" sm={4} md={4} lg={8} xlg={6}>
          <DatePicker
            datePickerType="single"
            name="storageStartDate"
            dateFormat={DATE_FORMAT}
            value={state.seedStorageStartDate}
            onChange={(_e: Array<Date>, selectedDate: string) => {
              handleFormInput('seedStorageStartDate', selectedDate);
            }}
            readOnly={readOnly}
          >
            <DatePickerInput
              id="storage-start-date-input"
              labelText={inputText.date.storage.labelText.start}
              helperText={inputText.date.helperText}
              placeholder={inputText.date.placeholder}
              invalid={validationObj.isStorageStartDateInvalid}
              invalidText={inputText.date.invalidText}
              disabled={state.seedStorageUseTSC}
            />
          </DatePicker>
        </Column>
        <Column className="storage-end-date-col" sm={4} md={4} lg={8} xlg={6}>
          <DatePicker
            datePickerType="single"
            name="storageEndDate"
            dateFormat={DATE_FORMAT}
            value={state.seedStorageEndDate}
            onChange={(_e: Array<Date>, selectedDate: string) => {
              handleFormInput('seedStorageEndDate', selectedDate);
            }}
            readOnly={readOnly}
          >
            <DatePickerInput
              id="storage-end-date-input"
              labelText={inputText.date.storage.labelText.end}
              helperText={inputText.date.helperText}
              placeholder={inputText.date.placeholder}
              invalid={validationObj.isStorageEndDateInvalid}
              invalidText={inputText.date.invalidText}
              disabled={state.seedStorageUseTSC}
            />
          </DatePicker>
        </Column>
        <Column sm={4} md={8} lg={16} xlg={12}>
          {state.seedStorageUseTSC && !readOnly && isStorageHintOpen && (
            <InlineNotification
              lowContrast
              kind="info"
              title={inputText.date.storage.notification.title}
              subtitle={inputText.date.storage.notification.subtitle}
              onCloseButtonClick={() => { setIsStorageHintOpen(false); }}
            />
          )}
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default ExtractionAndStorage;
