import React, { useState, useRef } from 'react';
import moment from 'moment';

import {
  Checkbox,
  Column,
  ComboBox,
  DatePicker,
  DatePickerInput,
  FlexGrid,
  InlineNotification,
  Row,
  TextInput
} from '@carbon/react';

import Subtitle from '../../Subtitle';

import {
  inputText,
  DATE_FORMAT
} from './constants';

import ExtractionStorage from '../../../types/SeedlotTypes/ExtractionStorage';
import { FilterObj, filterInput } from '../../../utils/filterUtils';
import ComboBoxEvent from '../../../types/ComboBoxEvent';
import {
  FormValidation,
  initialValidationObj
} from './definitions';

import './styles.scss';

interface ExtractionAndStorageProps {
  state: ExtractionStorage,
  setStepData: Function,
  defaultAgency: string,
  defaultCode: string,
  agencyOptions: Array<string>,
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
  const [isExtractorChecked, setIsExtractorChecked] = useState<boolean>(true);
  const [isStorageChecked, setIsStorageChecked] = useState<boolean>(true);
  const [isExtractorHintOpen, setIsExtractorHintOpen] = useState<boolean>(true);
  const [isStorageHintOpen, setIsStorageHintOpen] = useState<boolean>(true);

  const validateInput = (name: string, value: string) => {
    const newValidObj = { ...validationObj };
    let isInvalid = false;
    switch (name) {
      case 'extractoryLocationCode':
        if (value.length !== 2) {
          isInvalid = true;
        }
        newValidObj.isExtractorCodeInvalid = isInvalid;
        break;
      case 'seedStorageLocationCode':
        if (value.length !== 2) {
          isInvalid = true;
        }
        newValidObj.isStorageCodeInvalid = isInvalid;
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
    value: string,
    optName?: keyof ExtractionStorage,
    optValue?: string
  ) => {
    const newForm = { ...state };
    newForm[name] = value;
    if (optName && optValue && optName !== name) {
      newForm[optName] = optValue;
    }
    setStepData(newForm);
    validateInput(name, value);
    if (optName && optValue) {
      validateInput(optName, optValue);
    }
  };

  const extractorIsChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setIsExtractorChecked(checked);
    if (checked) {
      handleFormInput('extractoryAgency', defaultAgency, 'extractoryLocationCode', defaultCode);
    }
  };

  const storageIsChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setIsStorageChecked(checked);
    if (checked) {
      handleFormInput('seedStorageAgency', defaultAgency, 'seedStorageLocationCode', defaultCode);
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
            defaultChecked
            readOnly={readOnly}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => extractorIsChecked(e)}
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
            readOnly={readOnly ?? isExtractorChecked}
            onChange={(e: ComboBoxEvent) => { handleFormInput('extractoryAgency', e.selectedItem); }}
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
            name="extractory-agency-location-code"
            ref={extractorNumberInputRef}
            value={state.extractoryLocationCode}
            type="number"
            labelText={inputText.extractorCode.labelText}
            helperText={inputText.extractorCode.helperText}
            invalid={validationObj.isExtractorCodeInvalid}
            invalidText={inputText.extractorCode.invalidText}
            readOnly={readOnly ?? isExtractorChecked}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleFormInput('extractoryLocationCode', e.target.value);
            }}
          />
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
              disabled={isExtractorChecked}
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
              disabled={isExtractorChecked}
            />
          </DatePicker>
        </Column>
        <Column sm={4} md={8} lg={16} xlg={12}>
          {isExtractorChecked && !readOnly && isExtractorHintOpen && (
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
            defaultChecked
            readOnly={readOnly}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => storageIsChecked(e)}
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
            onChange={(e: ComboBoxEvent) => handleFormInput('seedStorageAgency', e.selectedItem)}
            selectedItem={state.seedStorageAgency}
            shouldFilterItem={
              ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
            }
            titleText={inputText.storage.titleText}
            placeholder={inputText.storage.placeholder}
            readOnly={isStorageChecked || readOnly}
            items={agencyOptions}
            invalid={validationObj.isStorageNameInvalid}
          />
        </Column>
        <Column className="seed-storage-location-code-col" sm={4} md={4} lg={8} xlg={6}>
          <TextInput
            id="seed-storage-location-code-input"
            name="seed-storage-location-code"
            ref={storageNumberInputRef}
            value={state.seedStorageLocationCode}
            type="number"
            labelText={inputText.storageCode.labelText}
            helperText={inputText.storageCode.helperText}
            invalid={validationObj.isStorageCodeInvalid}
            invalidText={inputText.storageCode.invalidText}
            readOnly={isStorageChecked || readOnly}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleFormInput('seedStorageLocationCode', e.target.value);
            }}
          />
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
              disabled={isStorageChecked}
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
              disabled={isStorageChecked}
            />
          </DatePicker>
        </Column>
        <Column sm={4} md={8} lg={16} xlg={12}>
          {isStorageChecked && !readOnly && isStorageHintOpen && (
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
