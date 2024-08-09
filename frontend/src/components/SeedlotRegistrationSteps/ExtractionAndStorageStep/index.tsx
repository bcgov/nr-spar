import React, { useContext, useState } from 'react';

import {
  Column,
  DatePicker,
  DatePickerInput,
  FlexGrid,
  InlineNotification,
  Row
} from '@carbon/react';

import Subtitle from '../../Subtitle';
import ScrollToTop from '../../ScrollToTop';
import ClientAndCodeInput from '../../ClientAndCodeInput';
import ClassAContext from '../../../views/Seedlot/ContextContainerClassA/context';
import { dateStringToISO, now } from '../../../utils/DateUtils';
import ExtractionStorageForm from '../../../types/SeedlotTypes/ExtractionStorage';
import { BooleanInputType, StringInputType } from '../../../types/FormInputType';
import { tscAgencyObj, tscLocationCode } from '../../../views/Seedlot/ContextContainerClassA/constants';

import {
  inputText,
  DATE_FORMAT,
  storageTextConfig,
  extractorTextConfig
} from './constants';

import './styles.scss';

interface ExtractionAndStorageProps {
  isReview?: boolean
}

const ExtractionAndStorage = (
  { isReview }: ExtractionAndStorageProps
) => {
  const {
    allStepData: { extractionStorageStep: state },
    setStepData,
    isFormSubmitted
  } = useContext(ClassAContext);

  const [isExtractorHintOpen, setIsExtractorHintOpen] = useState<boolean>(true);
  const [isStorageHintOpen, setIsStorageHintOpen] = useState<boolean>(true);

  const setClientAndCode = (
    agency: StringInputType,
    locationCode: StringInputType,
    checkBoxInput: BooleanInputType,
    extractionOrStorage: ('extraction' | 'seedStorage')
  ) => {
    const clonedState = structuredClone(state);
    clonedState[extractionOrStorage].agency = agency;
    clonedState[extractionOrStorage].locationCode = locationCode;
    if (checkBoxInput) {
      clonedState[extractionOrStorage].useTSC = checkBoxInput;
    }

    setStepData('extractionStorageStep', clonedState);
  };

  // This function validates changes on both start and end dates
  const validateStorageDates = (curState: ExtractionStorageForm, extractionOrStorage: ('extraction' | 'seedStorage')) => {
    const startDate = dateStringToISO(curState[extractionOrStorage].startDate.value);
    const endDate = dateStringToISO(curState[extractionOrStorage].endDate.value);

    // Check if the start date is set before the end date
    if (startDate !== '' && endDate !== '') {
      return endDate < startDate;
    }
    return false;
  };

  const handleDates = (
    isStart: boolean,
    extractionOrStorage: ('extraction' | 'seedStorage'),
    stringDate: string
  ) => {
    const clonedState = structuredClone(state);
    if (isStart) {
      clonedState[extractionOrStorage].startDate.value = stringDate;
    } else {
      clonedState[extractionOrStorage].endDate.value = stringDate;
    }

    const isInvalid = validateStorageDates(clonedState, extractionOrStorage);
    clonedState[extractionOrStorage].startDate.isInvalid = isInvalid;
    clonedState[extractionOrStorage].endDate.isInvalid = isInvalid;
    setStepData('extractionStorageStep', clonedState);
  };

  return (
    <FlexGrid className="extraction-and-storage-form" fullWidth>
      <ScrollToTop enabled={!isReview} />
      <Row className="extraction-information-title">
        <Column className="section-title" sm={4} md={8} lg={16}>
          <h2>{inputText.extractionTitle.titleText}</h2>
          {
            !isReview
              ? (
                <Subtitle text={inputText.extractionTitle.subtitleText} />
              )
              : null
          }
        </Column>
      </Row>
      <ClientAndCodeInput
        showCheckbox
        checkboxId={state.extraction.useTSC.id}
        clientInput={state.extraction.agency}
        locationCodeInput={state.extraction.locationCode}
        textConfig={extractorTextConfig}
        defaultClientNumber={tscAgencyObj.code}
        defaultLocCode={tscLocationCode}
        setClientAndCode={(
          clientInput: StringInputType,
          locationCodeInput: StringInputType,
          checkBoxInput?: BooleanInputType
        ) => setClientAndCode(clientInput, locationCodeInput, checkBoxInput!, 'extraction')}
        readOnly={isFormSubmitted && !isReview}
        maxInputColSize={6}
        checkBoxInput={state.extraction.useTSC}
      />
      <Row className="extraction-date-row">
        <Column className="extraction-start-date-col" sm={4} md={4} lg={8} xlg={6}>
          <DatePicker
            datePickerType="single"
            name="extractionStartDate"
            dateFormat={DATE_FORMAT}
            maxDate={now}
            value={state.extraction.startDate.value}
            onChange={(_e: Array<Date>, selectedDate: string) => {
              handleDates(true, 'extraction', selectedDate);
            }}
            readOnly={isFormSubmitted && !isReview}
          >
            <DatePickerInput
              id={state.extraction.startDate.id}
              labelText={inputText.date.extraction.labelText.start}
              helperText={inputText.date.helperText}
              placeholder={inputText.date.placeholder}
              invalid={state.extraction.startDate.isInvalid}
              invalidText={inputText.date.invalidText}
              disabled={state.extraction.useTSC.value}
              autoComplete="off"
            />
          </DatePicker>
        </Column>
        <Column className="extraction-end-date-col" sm={4} md={4} lg={8} xlg={6}>
          <DatePicker
            datePickerType="single"
            name="extractionEndDate"
            dateFormat={DATE_FORMAT}
            maxDate={now}
            value={state.extraction.endDate.value}
            onChange={(_e: Array<Date>, selectedDate: string) => {
              handleDates(false, 'extraction', selectedDate);
            }}
            readOnly={isFormSubmitted && !isReview}
          >
            <DatePickerInput
              id={state.extraction.endDate.id}
              labelText={inputText.date.extraction.labelText.end}
              helperText={inputText.date.helperText}
              placeholder={inputText.date.placeholder}
              invalid={state.extraction.endDate.isInvalid}
              invalidText={inputText.date.invalidText}
              disabled={state.extraction.useTSC.value}
              autoComplete="off"
            />
          </DatePicker>
        </Column>
        <Column sm={4} md={8} lg={16} xlg={12}>
          {state.extraction.useTSC.value && !isFormSubmitted && isExtractorHintOpen && (
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
        <Column className="section-title" sm={4} md={8} lg={16}>
          <h2>{inputText.storageTitle.titleText}</h2>
          {
            !isReview
              ? (
                <Subtitle text={inputText.storageTitle.subtitleText} />
              )
              : null
          }
        </Column>
      </Row>
      <ClientAndCodeInput
        showCheckbox
        checkboxId={state.seedStorage.useTSC.id}
        clientInput={state.seedStorage.agency}
        locationCodeInput={state.seedStorage.locationCode}
        textConfig={storageTextConfig}
        defaultClientNumber={tscAgencyObj.code}
        defaultLocCode={tscLocationCode}
        setClientAndCode={(
          client: StringInputType,
          locationCode: StringInputType,
          checkBoxInput?: BooleanInputType
        ) => setClientAndCode(client, locationCode, checkBoxInput!, 'seedStorage')}
        readOnly={isFormSubmitted && !isReview}
        maxInputColSize={6}
        checkBoxInput={state.seedStorage.useTSC}
      />
      <Row className="storage-date-row">
        <Column className="storage-start-date-col" sm={4} md={4} lg={8} xlg={6}>
          <DatePicker
            datePickerType="single"
            name="storageStartDate"
            dateFormat={DATE_FORMAT}
            maxDate={!isReview ? now : undefined}
            value={state.seedStorage.startDate.value}
            onChange={(_e: Array<Date>, selectedDate: string) => {
              handleDates(true, 'seedStorage', selectedDate);
            }}
            readOnly={isFormSubmitted && !isReview}
          >
            <DatePickerInput
              id={state.seedStorage.startDate.id}
              labelText={inputText.date.storage.labelText.start}
              helperText={inputText.date.helperText}
              placeholder={inputText.date.placeholder}
              invalid={state.seedStorage.startDate.isInvalid}
              invalidText={inputText.date.invalidText}
              disabled={state.seedStorage.useTSC.value}
              autoComplete="off"
            />
          </DatePicker>
        </Column>
        <Column className="storage-end-date-col" sm={4} md={4} lg={8} xlg={6}>
          <DatePicker
            datePickerType="single"
            name="storageEndDate"
            dateFormat={DATE_FORMAT}
            maxDate={!isReview ? now : undefined}
            value={state.seedStorage.endDate.value}
            onChange={(_e: Array<Date>, selectedDate: string) => {
              handleDates(false, 'seedStorage', selectedDate);
            }}
            readOnly={isFormSubmitted && !isReview}
          >
            <DatePickerInput
              id={state.seedStorage.endDate.id}
              labelText={inputText.date.storage.labelText.end}
              helperText={inputText.date.helperText}
              placeholder={inputText.date.placeholder}
              invalid={state.seedStorage.endDate.isInvalid}
              invalidText={inputText.date.invalidText}
              disabled={state.seedStorage.useTSC.value}
              autoComplete="off"
            />
          </DatePicker>
        </Column>
        <Column sm={4} md={8} lg={16} xlg={12}>
          {state.seedStorage.useTSC.value && !isFormSubmitted && isStorageHintOpen && (
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
