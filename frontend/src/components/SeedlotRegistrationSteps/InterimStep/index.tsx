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
  const [otherChecked, setOtherChecked] = useState(state.facilityType.value === 'OTH');

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
    // Check if the start date is set before the end date
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

  const handleFacilityType = (selected: string) => {
    const clonedState = structuredClone(state);
    clonedState.facilityType.value = selected;

    if (selected === 'OTH') {
      // Display the 'Other' text field
      setOtherChecked(true);
    } else if (otherChecked) {
      // Set value back to false otherwise
      setOtherChecked(false);
    }

    setStepData(clonedState);
  };

  const handleOtherFacilityTypeInput = (facilityType: string) => {
    const clonedState = structuredClone(state);
    clonedState.facilityOtherType.value = facilityType;

    if (facilityType.length >= 50) {
      clonedState.facilityOtherType.isInvalid = true;
    }
    setStepData(clonedState);
  };

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
      <Row className="storage-type-radio">
        <Column sm={4} md={8} lg={16}>
          <RadioButtonGroup
            legendText={pageTexts.storageFacility.labelText}
            name="storage-type-radiogroup"
            orientation="vertical"
            defaultSelected={state.facilityType.value}
            onChange={(e: string) => handleFacilityType(e)}
            readOnly={readOnly}
          >
            <RadioButton
              id="outside-radio"
              labelText={pageTexts.storageFacility.outsideLabel}
              value={pageTexts.storageFacility.outsideValue}
            />
            <RadioButton
              id="ventilated-radio"
              labelText={pageTexts.storageFacility.ventilatedLabel}
              value={pageTexts.storageFacility.ventilatedValue}
            />
            <RadioButton
              id="reefer-radio"
              labelText={pageTexts.storageFacility.reeferLabel}
              value={pageTexts.storageFacility.reeferValue}
            />
            <RadioButton
              id="other-radio"
              labelText={pageTexts.storageFacility.otherLabel}
              value={pageTexts.storageFacility.otherValue}
            />
          </RadioButtonGroup>
        </Column>
        {
          otherChecked
            ? (
              <Column className="storage-facility-type" sm={4} md={4} lg={16} xlg={12}>
                <TextInput
                  id={state.facilityOtherType.id}
                  name="storage-facility"
                  value={state.facilityOtherType.value}
                  ref={storageFacilityTypeInputRef}
                  labelText={pageTexts.storageFacility.labelText}
                  placeholder={pageTexts.storageFacility.otherInput.placeholder}
                  helperText={pageTexts.storageFacility.otherInput.helperText}
                  invalid={state.facilityOtherType.isInvalid}
                  invalidText={pageTexts.storageFacility.otherInput.invalidText}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleOtherFacilityTypeInput(e.target.value);
                  }}
                  readOnly={readOnly}
                />
              </Column>
            )
            : null
        }
      </Row>
    </FlexGrid>
  );
};

export default InterimStorage;
