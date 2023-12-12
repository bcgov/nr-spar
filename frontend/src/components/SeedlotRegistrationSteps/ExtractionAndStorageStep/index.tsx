import React, { useState } from 'react';
// import moment from 'moment';

import {
  Column,
  DatePicker,
  DatePickerInput,
  FlexGrid,
  InlineNotification,
  Row
} from '@carbon/react';

import Subtitle from '../../Subtitle';
import ApplicantAgencyFields from '../../ApplicantAgencyFields';

import ExtractionStorageForm from '../../../types/SeedlotTypes/ExtractionStorage';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { BooleanInputType, OptionsInputType, StringInputType } from '../../../types/FormInputType';

import {
  inputText,
  DATE_FORMAT,
  storageAgencyFields,
  extratorAgencyFields
} from './constants';

import './styles.scss';

interface ExtractionAndStorageProps {
  state: ExtractionStorageForm,
  setStepData: Function,
  defaultAgency: MultiOptionsObj,
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
  const setAgencyAndCode = (
    isDefault: BooleanInputType,
    agency: OptionsInputType,
    locationCode: StringInputType,
    isExtraction: boolean
  ) => {
    const clonedState = structuredClone(state);
    if (isExtraction) {
      clonedState.extractionUseTSC = isDefault;
      clonedState.extractionAgency = agency;
      clonedState.extractionLocationCode = locationCode;
    } else {
      clonedState.seedStorageUseTSC = isDefault;
      clonedState.seedStorageAgency = agency;
      clonedState.seedStorageLocationCode = locationCode;
    }
    setStepData(clonedState);
  };

  const [isExtractorHintOpen, setIsExtractorHintOpen] = useState<boolean>(true);
  const [isStorageHintOpen, setIsStorageHintOpen] = useState<boolean>(true);

  const validateInput = (name: string, value: string | boolean | MultiOptionsObj) => {
    // let isInvalid = false;
    switch (name) {
      case 'extractionAgency':
        if (!value) {
          // newValidObj.isExtractorCodeInvalid = isInvalid;
        }
        break;
      case 'seedStorageAgency':
        if (!value) {
          // newValidObj.isStorageCodeInvalid = isInvalid;
        }
        break;
      case 'extractionStartDate':
      case 'extractionEndDate':
        // Have both start and end dates
        if (state.extractionStartDate.value !== '' && state.extractionEndDate.value !== '') {
          // isInvalid = moment(state.extractionEndDate.value, 'YYYY/MM/DD')
          //   .isBefore(moment(state.extractionStartDate.value, 'YYYY/MM/DD'));
        }
        // newValidObj.isExtractorStartDateInvalid = isInvalid;
        // newValidObj.isExtractorEndDateInvalid = isInvalid;
        break;
      case 'seedStorageStartDate':
      case 'seedStorageEndDate':
        // Have both start and end dates
        if (state.seedStorageStartDate.value !== '' && state.seedStorageEndDate.value !== '') {
          // isInvalid = moment(state.seedStorageEndDate.value, 'YYYY/MM/DD')
          //   .isBefore(moment(state.seedStorageStartDate.value, 'YYYY/MM/DD'));
        }
        // newValidObj.isStorageStartDateInvalid = isInvalid;
        // newValidObj.isStorageEndDateInvalid = isInvalid;
        break;
      default:
        break;
    }
  };

  const handleFormInput = (
    name: keyof ExtractionStorageForm,
    value: string | boolean | MultiOptionsObj,
    optName?: keyof ExtractionStorageForm,
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
    <FlexGrid className="extraction-and-storage-form" fullWidth>
      <Row className="extraction-information-title">
        <Column sm={4} md={8} lg={16}>
          <h2>{inputText.extractionTitle.titleText}</h2>
          <Subtitle text={inputText.extractionTitle.subtitleText} />
        </Column>
      </Row>
      <ApplicantAgencyFields
        showCheckbox
        checkboxId={state.extractionUseTSC.id}
        isDefault={state.extractionUseTSC}
        agency={state.extractionAgency}
        locationCode={state.extractionLocationCode}
        fieldsProps={extratorAgencyFields}
        agencyOptions={agencyOptions}
        defaultAgency={defaultAgency.value}
        defaultCode={defaultCode}
        setAgencyAndCode={(
          isDefault: BooleanInputType,
          agency: OptionsInputType,
          locationCode: StringInputType
        ) => setAgencyAndCode(isDefault, agency, locationCode, true)}
        readOnly={readOnly}
        maxInputColSize={6}
      />
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
              invalid={state.extractionStartDate.isInvalid}
              invalidText={inputText.date.invalidText}
              disabled={state.extractionUseTSC}
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
              invalid={state.extractionEndDate.isInvalid}
              invalidText={inputText.date.invalidText}
              disabled={state.extractionUseTSC}
            />
          </DatePicker>
        </Column>
        <Column sm={4} md={8} lg={16} xlg={12}>
          {state.extractionUseTSC && !readOnly && isExtractorHintOpen && (
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
      <ApplicantAgencyFields
        showCheckbox
        checkboxId={state.seedStorageUseTSC.id}
        isDefault={state.seedStorageUseTSC}
        agency={state.seedStorageAgency}
        locationCode={state.seedStorageLocationCode}
        fieldsProps={storageAgencyFields}
        agencyOptions={agencyOptions}
        defaultAgency={defaultAgency.value}
        defaultCode={defaultCode}
        setAgencyAndCode={(
          isDefault: BooleanInputType,
          agency: OptionsInputType,
          locationCode: StringInputType
        ) => setAgencyAndCode(isDefault, agency, locationCode, false)}
        readOnly={readOnly}
        maxInputColSize={6}
      />
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
              invalid={state.seedStorageStartDate.isInvalid}
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
              invalid={state.seedStorageEndDate.isInvalid}
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
