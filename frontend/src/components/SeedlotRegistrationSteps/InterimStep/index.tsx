import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import moment from 'moment';
import validator from 'validator';

import {
  Checkbox,
  Column,
  ComboBox,
  DatePicker,
  DatePickerInput,
  RadioButton,
  RadioButtonGroup,
  Row,
  TextInput,
  FlexGrid,
  InlineLoading
} from '@carbon/react';

import Subtitle from '../../Subtitle';

import getForestClientLocation from '../../../api-service/forestClientsAPI';

import { FilterObj, filterInput } from '../../../utils/filterUtils';
import getForestClientNumber from '../../../utils/StringUtils';
import { LOCATION_CODE_LIMIT } from '../../../shared-constants/shared-constants';
import ComboBoxEvent from '../../../types/ComboBoxEvent';
import InterimForm from './definitions';
import pageTexts from './constants';

import './styles.scss';

const DATE_FORMAT = 'Y/m/d';

interface InterimStorageStepProps {
  state: InterimForm,
  setStepData: Function,
  collectorAgency: string,
  collectorCode: string,
  agencyOptions: Array<string>,
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
  type FormValidation = {
    isNameInvalid: boolean,
    isCodeInvalid: boolean,
    isStartDateInvalid: boolean,
    isEndDateInvalid: boolean,
    isStorageInvalid: boolean,
    isFacilityInvalid: boolean,
  }

  const initialValidationObj: FormValidation = {
    isNameInvalid: false,
    isCodeInvalid: false,
    isStartDateInvalid: false,
    isEndDateInvalid: false,
    isStorageInvalid: false,
    isFacilityInvalid: false
  };

  const [validationObj, setValidationObj] = useState<FormValidation>(initialValidationObj);
  const [forestClientNumber, setForestClientNumber] = useState<string>('');
  const [invalidLocationMessage, setInvalidLocationMessage] = useState<string>('');
  const [locHelper, setLocHelper] = useState<string>(pageTexts.locationCode.helperTextEnabled);

  const [otherRadioChecked, setOtherChecked] = useState(false);

  const updateAfterLocValidation = (isInvalid: boolean) => {
    setValidationObj({
      ...validationObj,
      isCodeInvalid: isInvalid
    });
    setLocHelper(pageTexts.locationCode.helperTextEnabled);
  };

  const validateLocationCodeMutation = useMutation({
    mutationFn: (queryParams:string[]) => getForestClientLocation(
      queryParams[0],
      queryParams[1]
    ),
    onError: () => {
      setInvalidLocationMessage(pageTexts.locationCode.invalidLocationForSelectedAgency);
      updateAfterLocValidation(true);
    },
    onSuccess: () => updateAfterLocValidation(false)
  });

  const validateLocationCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const locationCode = event.target.value;
    const isDoubleAndInRange = locationCode.length === 2
      && validator.isInt(locationCode, { min: 0, max: 99 });

    if (!isDoubleAndInRange) {
      setInvalidLocationMessage(pageTexts.locationCode.invalidLocationValue);
      setValidationObj({
        ...validationObj,
        isCodeInvalid: true
      });
      return;
    }

    if (forestClientNumber) {
      validateLocationCodeMutation.mutate([forestClientNumber, locationCode]);
      setValidationObj({
        ...validationObj,
        isCodeInvalid: false
      });
      setLocHelper('');
    }
  };

  const validateInput = (name: string, value?: string) => {
    const newValidObj = structuredClone(validationObj);
    let isInvalid = false;

    if (name === 'agencyName') {
      if (!value) {
        newValidObj.isCodeInvalid = false;
      }
    }
    if (name === 'startDate' || name === 'endDate') {
      // Have both start and end dates
      if (state.startDate !== '' && state.endDate !== '') {
        isInvalid = moment(state.endDate, 'YYYY/MM/DD')
          .isBefore(moment(state.startDate, 'YYYY/MM/DD'));
      }
      newValidObj.isStartDateInvalid = isInvalid;
      newValidObj.isEndDateInvalid = isInvalid;
    }
    if (name === 'storageLocation') {
      if (state.storageLocation.length >= 55) {
        isInvalid = true;
      }
      newValidObj.isStorageInvalid = isInvalid;
    }
    if (name === 'facilityType') {
      if (state.facilityType.length >= 50) {
        isInvalid = true;
      }
      newValidObj.isFacilityInvalid = isInvalid;
    }

    setValidationObj(newValidObj);
  };

  const handleFormInput = (
    name: keyof InterimForm,
    value: string,
    optName?: keyof InterimForm,
    optValue?: string,
    setCollectorAgency?: boolean,
    checked?: boolean
  ) => {
    if (optName && optName !== name) {
      const newState = {
        ...state,
        [name]: value,
        [optName]: optValue
      };

      if (setCollectorAgency) {
        newState.useCollectorAgencyInfo = checked || false;
      }

      setStepData(newState);
    } else if (name === 'agencyName') {
      setForestClientNumber(value ? getForestClientNumber(value) : '');
      setLocHelper(
        value
          ? pageTexts.locationCode.helperTextEnabled
          : pageTexts.locationCode.helperTextDisabled
      );
      setStepData({
        ...state,
        [name]: value,
        locationCode: value ? state.locationCode : ''
      });
    } else {
      setStepData({
        ...state,
        [name]: (name === 'locationCode' ? value.slice(0, LOCATION_CODE_LIMIT) : value)
      });
    }

    validateInput(name, value);
    if (optName && optValue) {
      validateInput(optName, value);
    }
  };

  const nameInputRef = useRef<HTMLInputElement>(null);
  const numberInputRef = useRef<HTMLInputElement>(null);
  const storageLocationInputRef = useRef<HTMLInputElement>(null);
  const storageFacilityTypeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const useDefault = state.useCollectorAgencyInfo;
    const agency = useDefault ? collectorAgency : state.agencyName;
    const code = useDefault ? collectorCode : state.locationCode;

    handleFormInput(
      'agencyName',
      agency,
      'locationCode',
      code,
      true,
      useDefault
    );
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
          <h2>Interim agency</h2>
          <Subtitle text="Enter the interim agency information" />
        </Column>
      </Row>
      <Row className="interim-agency-checkbox-row">
        <Column sm={4} md={8} lg={16}>
          <Checkbox
            id="interim-agency-checkbox"
            name="interim-agency"
            labelText="Use collector agency as interim storage agency"
            checked={state.useCollectorAgencyInfo}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const { checked } = e.target;
              setLocHelper(
                !checked
                  ? pageTexts.locationCode.helperTextDisabled
                  : pageTexts.locationCode.helperTextEnabled
              );
              handleFormInput(
                'agencyName',
                checked ? collectorAgency : '',
                'locationCode',
                checked ? collectorCode : '',
                true,
                checked
              );
            }}
            readOnly={readOnly}
          />
        </Column>
      </Row>
      <Row className="agency-information">
        <Column sm={4} md={4} lg={8} xlg={6}>
          <ComboBox
            id="agency-name-combobox"
            ref={nameInputRef}
            name="name"
            helperText="You can enter the agency number, name or acronym"
            onChange={(e: ComboBoxEvent) => { handleFormInput('agencyName', e.selectedItem); }}
            selectedItem={state.agencyName}
            shouldFilterItem={
              ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
            }
            titleText="Interim agency"
            placeholder="Select Interim agency name"
            items={agencyOptions}
            invalid={validationObj.isNameInvalid}
            readOnly={readOnly ?? state.useCollectorAgencyInfo}
          />
        </Column>
        <Column sm={4} md={4} lg={8} xlg={6}>
          <TextInput
            id="agency-number-input"
            className="agency-number-location-code"
            name="locationCode"
            ref={numberInputRef}
            value={state.locationCode}
            type="number"
            placeholder={!forestClientNumber ? '' : 'Example: 00'}
            labelText="Interim agency location code"
            helperText={locHelper}
            invalid={validationObj.isCodeInvalid}
            invalidText={invalidLocationMessage}
            disabled={!forestClientNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleFormInput('locationCode', e.target.value);
            }}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
              validateLocationCode(e);
            }}
            readOnly={readOnly ?? state.useCollectorAgencyInfo}
          />
          {
            validateLocationCodeMutation.isLoading
              ? <InlineLoading description="Validating..." />
              : null
          }
        </Column>
      </Row>
      <Row className="interim-title-row">
        <Column sm={4} md={8} lg={16}>
          <h2>Storage information</h2>
          <Subtitle text="Enter the interim storage information for this seedlot" />
        </Column>
      </Row>
      <Row className="interim-storage-row">
        <Column className="start-date-col" sm={4} md={4} lg={8} xlg={6}>
          <DatePicker
            datePickerType="single"
            name="startDate"
            dateFormat={DATE_FORMAT}
            value={state.startDate}
            onChange={(_e: Array<Date>, selectedDate: string) => {
              handleFormInput('startDate', selectedDate);
            }}
            readOnly={readOnly}
          >
            <DatePickerInput
              id="start-date-input"
              labelText="Storage start date"
              helperText="year/month/day"
              placeholder="yyyy/mm/dd"
              invalid={validationObj.isStartDateInvalid}
              invalidText="Please enter a valid date"
              readOnly={readOnly}
            />
          </DatePicker>
        </Column>
        <Column className="end-date-col" sm={4} md={4} lg={8} xlg={6}>
          <DatePicker
            datePickerType="single"
            name="endDate"
            dateFormat={DATE_FORMAT}
            minDate={state.startDate}
            value={state.endDate}
            onChange={(_e: Array<Date>, selectedDate: string) => {
              handleFormInput('endDate', selectedDate);
            }}
            readOnly={readOnly}
          >
            <DatePickerInput
              id="end-date-input"
              labelText="Storage end date"
              helperText="year/month/day"
              placeholder="yyyy/mm/dd"
              invalid={validationObj.isEndDateInvalid}
              invalidText="Please enter a valid date"
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
            value={state.storageLocation}
            labelText="Storage location"
            placeholder="Enter the location were the cones were stored"
            helperText="Enter a short name or description of the location where the cones are being temporarily stored"
            invalid={validationObj.isStorageInvalid}
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
            defaultSelected={state.facilityType}
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
                invalid={validationObj.isFacilityInvalid}
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
