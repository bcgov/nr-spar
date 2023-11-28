import React, { useState, useRef, useEffect } from 'react';
import moment from 'moment';

import {
  Column,
  DatePicker,
  DatePickerInput,
  RadioButton,
  RadioButtonGroup,
  Row,
  TextInput,
  FlexGrid
} from '@carbon/react';

import Subtitle from '../../Subtitle';
import ApplicantAgencyFields from '../../ApplicantAgencyFields';

import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { FormInputType } from '../../../types/FormInputType';
import InterimForm from './definitions';
import { DATE_FORMAT, agencyFieldsProps, pageTexts } from './constants';

import './styles.scss';

interface InterimStorageStepProps {
  state: InterimForm,
  setStepData: Function,
  collectorAgency: string,
  collectorCode: string,
  agencyOptions: Array<MultiOptionsObj>,
  readOnly?: boolean
}

const InterimStorage = (
  {
    state,
    setStepData,
    collectorAgency,
    collectorCode,
    agencyOptions,
    readOnly
  }: InterimStorageStepProps
) => {
  const [otherRadioChecked, setOtherChecked] = useState(false);

  const setAgencyInfo = (
    agencyData: FormInputType & { value: string },
    locationCodeData: FormInputType & { value: string },
    useDefaultData: FormInputType & { value: boolean }
  ) => {
    const clonedState = structuredClone(state);
    clonedState.agencyName = agencyData;
    clonedState.locationCode = locationCodeData;
    clonedState.useCollectorAgencyInfo = useDefaultData;
    setStepData(clonedState);
  };

  // This function validates changes on both start and end dates
  // of the storage information
  const validateStorageDates = (curState: InterimForm) => {
    // Have both start and end dates
    if (curState.startDate.value !== '' && curState.endDate.value !== '') {
      return moment(curState.endDate.value, 'YYYY/MM/DD')
        .isBefore(moment(curState.startDate.value, 'YYYY/MM/DD'));
    }
    return false;
  };

  const handleStorageDates = (isStart: boolean, stringDate: string) => {
    const clonedState = structuredClone(state);
    if (isStart) {
      clonedState.startDate.value = stringDate;
    } else {
      clonedState.endDate.value = stringDate;
    }

    const isInvalid = validateStorageDates(clonedState);

    clonedState.startDate.isInvalid = isInvalid;
    clonedState.endDate.isInvalid = isInvalid;

    setStepData(clonedState);
  };

  const validateInput = (name: string) => {
    const clonedState = structuredClone(state);
    let isInvalid = false;

    if (name === 'startDate' || name === 'endDate') {
      // Have both start and end dates
      if (clonedState.startDate.value !== '' && clonedState.endDate.value !== '') {
        isInvalid = moment(clonedState.endDate.value, 'YYYY/MM/DD')
          .isBefore(moment(clonedState.startDate.value, 'YYYY/MM/DD'));
      }
      clonedState.startDate.isInvalid = isInvalid;
      clonedState.endDate.isInvalid = isInvalid;
    }
    if (name === 'storageLocation') {
      if (clonedState.storageLocation.value.length >= 55) {
        isInvalid = true;
      }
      clonedState.storageLocation.isInvalid = isInvalid;
    }
    if (name === 'facilityType') {
      if (clonedState.facilityType.value.length >= 50) {
        isInvalid = true;
      }
      clonedState.facilityType.isInvalid = isInvalid;
    }
  };

  const handleFormInput = (
    name: keyof InterimForm,
    value: string
  ) => {
    const newState = {
      ...state,
      [name]: value
    };
    setStepData(newState);
    validateInput(name);
  };

  const storageLocationInputRef = useRef<HTMLInputElement>(null);
  const storageFacilityTypeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const useDefault = state.useCollectorAgencyInfo.value;
    const agency = useDefault ? collectorAgency : state.agencyName.value;
    const code = useDefault ? collectorCode : state.locationCode.value;

    const clonedState = structuredClone(state);
    clonedState.agencyName.value = agency;
    clonedState.locationCode.value = code;
    setStepData(clonedState);
  }, [collectorAgency, collectorCode]);

  const inputChangeHandlerRadio = (selected: string) => {
    if (selected === 'OTH') {
      setOtherChecked(true);
      handleFormInput('facilityType', 'OTH');
    } else {
      setOtherChecked(false);
      handleFormInput('facilityType', selected);
    }
  };

  return (
    <FlexGrid className="interim-agency-storage-form" fullWidth>
      <Row className="interim-title-row">
        <Column sm={4} md={8} lg={16}>
          <h2>{pageTexts.interimTitleSection.title}</h2>
          <Subtitle text={pageTexts.interimTitleSection.subtitle} />
        </Column>
      </Row>
      <ApplicantAgencyFields
        useDefault={state.useCollectorAgencyInfo}
        agency={state.agencyName}
        locationCode={state.locationCode}
        fieldsProps={agencyFieldsProps}
        agencyOptions={agencyOptions}
        defaultAgency={collectorAgency}
        defaultCode={collectorCode}
        setAllValues={
          (
            agencyData: FormInputType & { value: string },
            locationCodeData: FormInputType & { value: string },
            useDefaultData: FormInputType & { value: boolean }
          ) => setAgencyInfo(agencyData, locationCodeData, useDefaultData)
        }
        readOnly={readOnly}
      />
      <Row className="interim-title-row">
        <Column sm={4} md={8} lg={16}>
          <h2>{pageTexts.storageTitleSection.title}</h2>
          <Subtitle text={pageTexts.storageTitleSection.subtitle} />
        </Column>
      </Row>
      <Row className="interim-storage-row">
        <Column className="start-date-col" sm={4} md={4} lg={8} xlg={6}>
          <DatePicker
            datePickerType="single"
            name="startDate"
            dateFormat={DATE_FORMAT}
            value={state.startDate.value}
            onChange={(_e: Array<Date>, selectedDate: string) => {
              handleStorageDates(true, selectedDate);
            }}
            readOnly={readOnly}
          >
            <DatePickerInput
              id="start-date-input"
              labelText={pageTexts.storageDate.labelTextStart}
              helperText={pageTexts.storageDate.helperText}
              placeholder={pageTexts.storageDate.placeholder}
              invalid={state.startDate.isInvalid}
              invalidText={pageTexts.storageDate.invalidText}
              readOnly={readOnly}
            />
          </DatePicker>
        </Column>
        <Column className="end-date-col" sm={4} md={4} lg={8} xlg={6}>
          <DatePicker
            datePickerType="single"
            name="endDate"
            dateFormat={DATE_FORMAT}
            minDate={state.startDate.value}
            value={state.endDate.value}
            onChange={(_e: Array<Date>, selectedDate: string) => {
              handleStorageDates(false, selectedDate);
            }}
            readOnly={readOnly}
          >
            <DatePickerInput
              id="end-date-input"
              labelText={pageTexts.storageDate.labelTextEnd}
              helperText={pageTexts.storageDate.helperText}
              placeholder={pageTexts.storageDate.placeholder}
              invalid={state.startDate.isInvalid}
              invalidText={pageTexts.storageDate.invalidText}
              readOnly={readOnly}
            />
          </DatePicker>
        </Column>
      </Row>
      <Row className="interim-storage-row">
        <Column sm={4} md={4} lg={16} xlg={12}>
          <TextInput
            id="storage-location-input"
            name="location"
            ref={storageLocationInputRef}
            type="text"
            value={state.storageLocation.value}
            labelText="Storage location"
            placeholder="Enter the location were the cones were stored"
            helperText="Enter a short name or description of the location where the cones are being temporarily stored"
            invalid={state.storageLocation.isInvalid}
            invalidText="Storage location lenght should be <= 55"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleFormInput('storageLocation', e.target.value);
            }}
            readOnly={readOnly}
          />
        </Column>
      </Row>
      <Row className="storage-type-radio">
        <Column sm={4} md={8} lg={16}>
          <RadioButtonGroup
            legendText="Storage facility type"
            name="storage-type-radiogroup"
            orientation="vertical"
            defaultSelected={state.facilityType.value}
            onChange={(e: string) => inputChangeHandlerRadio(e)}
            readOnly={readOnly}
          >
            <RadioButton
              id="outside-radio"
              labelText="Outside covered - OCV"
              value="OCV"
            />
            <RadioButton
              id="ventilated-radio"
              labelText="Ventilated room - VRM"
              value="VRM"
            />
            <RadioButton
              id="reefer-radio"
              labelText="Reefer - RFR"
              value="RFR"
            />
            <RadioButton
              id="other-radio"
              labelText="Other - OTH"
              value="OTH"
            />
          </RadioButtonGroup>
        </Column>
        {
          otherRadioChecked && (
            <Column className="storage-facility-type" sm={4} md={4} lg={16} xlg={12}>
              <TextInput
                id="storage-facility-type-input"
                name="storage-facility"
                type="text"
                ref={storageFacilityTypeInputRef}
                labelText="Storage facility type"
                placeholder="Enter the storage facility type"
                helperText="Describe the new storage facility used"
                invalid={state.facilityType.isInvalid}
                invalidText="Storage facility type lenght should be <= 50"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormInput('facilityType', e.target.value)}
                readOnly={readOnly}
              />
            </Column>
          )
        }
      </Row>
    </FlexGrid>
  );
};

export default InterimStorage;
