import React, { useContext, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';

import {
  Column,
  DatePicker,
  DatePickerInput,
  RadioButton,
  RadioButtonGroup,
  Row,
  TextInput,
  FlexGrid,
  RadioButtonSkeleton
} from '@carbon/react';

import Subtitle from '../../Subtitle';
import ApplicantAgencyFields from '../../ApplicantAgencyFields';

import getFacilityTypes from '../../../api-service/facilityTypesAPI';
import { getMultiOptList } from '../../../utils/MultiOptionsUtils';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { BooleanInputType, OptionsInputType, StringInputType } from '../../../types/FormInputType';
import { EmptyBooleanInputType } from '../../../shared-constants/shared-constants';

import ClassAContext from '../../../views/Seedlot/ContextContainerClassA/context';
import InterimForm from './definitions';
import {
  DATE_FORMAT, MAX_FACILITY_DESC_CHAR, agencyFieldsProps, pageTexts
} from './constants';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../config/TimeUnits';

import './styles.scss';

type InterimStepProps = {
  isReview?: boolean
}

const InterimStep = ({ isReview }:InterimStepProps) => {
  const {
    allStepData: { interimStep: state },
    allStepData: { collectionStep: { collectorAgency } },
    allStepData: { collectionStep: { locationCode: collectorCode } },
    setStepData,
    agencyOptions,
    isFormSubmitted
  } = useContext(ClassAContext);

  const [otherChecked, setOtherChecked] = useState(state.facilityType.value === 'OTH');

  const setAgencyAndCode = (
    agencyData: OptionsInputType,
    locationCodeData: StringInputType,
    useDefaultData: BooleanInputType
  ) => {
    const clonedState = structuredClone(state);
    clonedState.agencyName = agencyData;
    clonedState.locationCode = locationCodeData;
    clonedState.useCollectorAgencyInfo = useDefaultData;
    setStepData('interimStep', clonedState);
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
    setStepData('interimStep', clonedState);
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

    setStepData('interimStep', clonedState);
  };

  const handleOtherFacilityTypeInput = (facilityType: string) => {
    const clonedState = structuredClone(state);
    clonedState.facilityOtherType.value = facilityType;

    clonedState.facilityOtherType.isInvalid = facilityType.length > 50;

    setStepData('interimStep', clonedState);
  };

  const facilityTypesQuery = useQuery({
    queryKey: ['facility-types'],
    queryFn: getFacilityTypes,
    select: (data: any) => getMultiOptList(data),
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  const renderFacilityTypes = (facilityTypes: Array<MultiOptionsObj>) => {
    // Safety check if there are no facility types set
    if (facilityTypes.length) {
      // Change order of the array to set the
      // OTH value on the last position
      const otherType = facilityTypes.filter((types: MultiOptionsObj) => types.code === 'OTH');
      if (otherType.length) {
        facilityTypes.push(facilityTypes.splice(facilityTypes.indexOf(otherType[0]), 1)[0]);
      }

      return facilityTypes.map((type: MultiOptionsObj) => (
        <RadioButton
          id={`facility-type-radio-btn-${type.code.toLowerCase()}`}
          key={type.code}
          labelText={type.label}
          value={type.code}
        />
      ));
    }
    return null;
  };

  return (
    <FlexGrid className="interim-agency-storage-form" fullWidth>
      <Row className="interim-title-row">
        <Column className="section-title" sm={4} md={8} lg={16}>
          <h2>{pageTexts.interimTitleSection.title}</h2>
          {
            !isReview
              ? (
                <Subtitle text={pageTexts.interimTitleSection.subtitle} />
              )
              : null
          }
        </Column>
      </Row>
      <ApplicantAgencyFields
        showCheckbox={!isReview}
        checkboxId={state.useCollectorAgencyInfo.id}
        isDefault={isReview ? EmptyBooleanInputType : state.useCollectorAgencyInfo}
        agency={state.agencyName}
        locationCode={state.locationCode}
        fieldsProps={agencyFieldsProps}
        agencyOptions={agencyOptions}
        defaultAgency={collectorAgency.value}
        defaultCode={collectorCode.value}
        setAgencyAndCode={(
          isDefault: BooleanInputType,
          agency: OptionsInputType,
          locationCode: StringInputType
        ) => setAgencyAndCode(agency, locationCode, isDefault)}
        isFormSubmitted={isFormSubmitted}
        readOnly={isFormSubmitted && !isReview}
        maxInputColSize={6}
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
            readOnly={isFormSubmitted && !isReview}
          >
            <DatePickerInput
              id="start-date-input"
              labelText={pageTexts.storageDate.labelTextStart}
              helperText={pageTexts.storageDate.helperText}
              placeholder={pageTexts.storageDate.placeholder}
              invalid={state.startDate.isInvalid}
              invalidText={pageTexts.storageDate.invalidText}
              readOnly={isFormSubmitted}
              autoComplete="off"
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
            readOnly={isFormSubmitted && !isReview}
          >
            <DatePickerInput
              id="end-date-input"
              labelText={pageTexts.storageDate.labelTextEnd}
              helperText={pageTexts.storageDate.helperText}
              placeholder={pageTexts.storageDate.placeholder}
              invalid={state.startDate.isInvalid}
              invalidText={pageTexts.storageDate.invalidText}
              readOnly={isFormSubmitted}
              autoComplete="off"
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
            readOnly={isFormSubmitted && !isReview}
          >
            {
              facilityTypesQuery.isFetching
                ? (
                  <>
                    <RadioButtonSkeleton />
                    <RadioButtonSkeleton />
                    <RadioButtonSkeleton />
                    <RadioButtonSkeleton />
                  </>
                )
                : renderFacilityTypes(facilityTypesQuery.data ?? [])
            }
          </RadioButtonGroup>
        </Column>
        {
          otherChecked
            ? (
              <Column className="storage-facility-type" sm={4} md={4} lg={16} xlg={12}>
                <TextInput
                  id={state.facilityOtherType.id}
                  name="storage-facility"
                  defaultValue={state.facilityOtherType.value}
                  labelText={pageTexts.storageFacility.labelText}
                  placeholder={pageTexts.storageFacility.otherInput.placeholder}
                  helperText={pageTexts.storageFacility.otherInput.helperText}
                  invalid={state.facilityOtherType.isInvalid}
                  invalidText={pageTexts.storageFacility.otherInput.invalidText}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleOtherFacilityTypeInput(e.target.value);
                  }}
                  readOnly={isFormSubmitted && !isReview}
                  enableCounter
                  maxCount={MAX_FACILITY_DESC_CHAR}
                />
              </Column>
            )
            : null
        }
      </Row>
    </FlexGrid>
  );
};

export default InterimStep;
