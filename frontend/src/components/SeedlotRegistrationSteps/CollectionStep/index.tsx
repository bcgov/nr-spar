import React, { useState, useEffect } from 'react';
import {
  FlexGrid,
  Column,
  Row,
  NumberInput,
  CheckboxGroup,
  Checkbox,
  DatePickerInput,
  DatePicker,
  TextArea
} from '@carbon/react';
import moment from 'moment';
import validator from 'validator';

import Subtitle from '../../Subtitle';
import ApplicantAgencyFields from '../../ApplicantAgencyFields';

import { FormInputType } from '../../../types/FormInputType';

import {
  DATE_FORMAT, MOMENT_DATE_FORMAT, agencyFieldsProps, fieldsConfig
} from './constants';
import {
  CollectionStepProps,
  CollectionForm
} from './definitions';
import { calcVolume, isNumNotInRange } from './utils';

import './styles.scss';

const CollectionStep = (
  {
    state,
    setStepData,
    defaultAgency,
    defaultCode,
    agencyOptions,
    collectionMethods,
    readOnly
  }: CollectionStepProps
) => {
  const [isCalcWrong, setIsCalcWrong] = useState<boolean>(false);

  const setAgencyInfo = (
    valueAgency: FormInputType & { value: string },
    valueLocation: FormInputType & { value: string },
    valueUseDefault: FormInputType & { value: boolean }
  ) => {
    const clonedState = structuredClone(state);
    clonedState.collectorAgency = valueAgency;
    clonedState.locationCode = valueLocation;
    clonedState.useDefaultAgencyInfo = valueUseDefault;
    setStepData(clonedState);
  };

  useEffect(() => {
    const useDefault = state.useDefaultAgencyInfo.value;
    const agencyValue = useDefault ? defaultAgency : state.collectorAgency.value;
    const codeValue = useDefault ? defaultCode : state.locationCode.value;

    const clonedState = structuredClone(state);
    clonedState.collectorAgency.value = agencyValue;
    clonedState.locationCode.value = codeValue;
    setStepData(clonedState);
  }, [defaultAgency, defaultCode]);

  const handleDateChange = (isStartDate: boolean, value: string) => {
    const clonedState = structuredClone(state);
    const dateType: keyof CollectionForm = isStartDate ? 'startDate' : 'endDate';

    clonedState[dateType].value = value;

    const isInvalid = moment(clonedState.endDate.value, MOMENT_DATE_FORMAT)
      .isBefore(moment(clonedState.startDate.value, MOMENT_DATE_FORMAT));

    clonedState.startDate.isInvalid = isInvalid;
    clonedState.endDate.isInvalid = isInvalid;

    setStepData(clonedState);
  };

  const handleContainerNumAndVol = (isNum: boolean, value: string) => {
    const clonedState = structuredClone(state);
    const isOverDecimal = !validator.isDecimal(value, { decimal_digits: '0,3' });

    const isNotInRange = isNumNotInRange(value);
    const valType: keyof CollectionForm = isNum ? 'numberOfContainers' : 'volumePerContainers';
    clonedState[valType].value = value;
    clonedState[valType].isInvalid = isNotInRange || isOverDecimal;

    const multipliedVol = calcVolume(
      clonedState.numberOfContainers.value,
      clonedState.volumePerContainers.value
    );
    clonedState.volumeOfCones.value = multipliedVol;

    setStepData(clonedState);
  };

  const handleVolOfCones = (value: string) => {
    const clonedState = structuredClone(state);
    const isOverDecimal = !validator.isDecimal(value, { decimal_digits: '0,3' });
    clonedState.volumeOfCones.isInvalid = isOverDecimal;
    clonedState.volumeOfCones.value = value;

    const multipliedVol = calcVolume(
      clonedState.numberOfContainers.value,
      clonedState.volumePerContainers.value
    );

    if (!isOverDecimal) {
      setIsCalcWrong(Number(multipliedVol).toFixed(3) !== Number(value).toFixed(3));
    }
    setStepData(clonedState);
  };

  const handleCollectionMethods = (selectedMethod: string) => {
    const clonedState = structuredClone(state);
    const index = clonedState.selectedCollectionCodes.value.indexOf(selectedMethod);
    if (index > -1) {
      clonedState.selectedCollectionCodes.value.splice(index, 1);
    } else {
      clonedState.selectedCollectionCodes.value.push(selectedMethod);
    }
    setStepData(clonedState);
  };

  const handleComment = (value: string) => {
    const clonedState = structuredClone(state);
    clonedState.comments.value = value;
    setStepData(clonedState);
  };

  return (
    <FlexGrid className="collection-step-container">
      <Row className="collection-step-row">
        <Column sm={4} md={8} lg={16} xlg={16}>
          <h2>{fieldsConfig.titleSection.title}</h2>
          <Subtitle text={fieldsConfig.titleSection.subtitle} />
        </Column>
      </Row>
      <ApplicantAgencyFields
        useDefault={state.useDefaultAgencyInfo}
        agency={state.collectorAgency}
        locationCode={state.locationCode}
        fieldsProps={agencyFieldsProps}
        agencyOptions={agencyOptions}
        defaultAgency={defaultAgency}
        defaultCode={defaultCode}
        setAllValues={
          (
            agencyData: FormInputType & { value: string },
            locationCodeData: FormInputType & { value: string },
            useDefaultData: FormInputType & { value: boolean }
          ) => setAgencyInfo(agencyData, locationCodeData, useDefaultData)
        }
        readOnly={readOnly}
      />
      <Row className="collection-step-row">
        <Column sm={4} md={8} lg={16} xlg={16}>
          <h2>{fieldsConfig.collectionTitle.title}</h2>
          <Subtitle text={fieldsConfig.collectionTitle.subtitle} />
        </Column>
      </Row>
      <Row className="collection-step-row">
        <Column sm={4} md={4} lg={8} xlg={6}>
          <DatePicker
            datePickerType="single"
            dateFormat={DATE_FORMAT}
            readOnly={readOnly}
            value={state.startDate.value}
            onChange={(_e: Array<Date>, selectedDate: string) => {
              handleDateChange(true, selectedDate);
            }}
          >
            <DatePickerInput
              id={state.startDate.id}
              name={fieldsConfig.startDate.name}
              placeholder={fieldsConfig.startDate.placeholder}
              labelText={fieldsConfig.startDate.labelText}
              helperText={fieldsConfig.startDate.helperText}
              invalid={state.startDate.isInvalid}
              invalidText={fieldsConfig.startDate.invalidText}
              size="md"
            />
          </DatePicker>
        </Column>
        <Column sm={4} md={4} lg={8} xlg={6}>
          <DatePicker
            datePickerType="single"
            dateFormat={DATE_FORMAT}
            minDate={state.startDate.value}
            readOnly={readOnly}
            value={state.endDate.value}
            onChange={(_e: Array<Date>, selectedDate: string) => {
              handleDateChange(false, selectedDate);
            }}
          >
            <DatePickerInput
              id={state.endDate.id}
              name={fieldsConfig.endDate.name}
              placeholder={fieldsConfig.endDate.placeholder}
              labelText={fieldsConfig.endDate.labelText}
              helperText={fieldsConfig.endDate.helperText}
              invalid={state.endDate.isInvalid}
              invalidText={fieldsConfig.endDate.invalidText}
              size="md"
            />
          </DatePicker>
        </Column>
      </Row>
      <Row className="collection-step-row">
        <Column sm={4} md={4} lg={8} xlg={6}>
          <NumberInput
            id={state.numberOfContainers.id}
            name={fieldsConfig.numberOfContainers.name}
            value={state.numberOfContainers.value}
            label={fieldsConfig.numberOfContainers.labelText}
            readOnly={readOnly}
            invalid={state.numberOfContainers.isInvalid}
            invalidText={fieldsConfig.numberOfContainers.invalidText}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleContainerNumAndVol(true, e.target.value);
            }}
            hideSteppers
            disableWheel
          />
        </Column>
        <Column sm={4} md={4} lg={8} xlg={6}>
          <NumberInput
            id={state.volumePerContainers.id}
            name={fieldsConfig.volumePerContainers.name}
            value={state.volumePerContainers.value}
            label={fieldsConfig.volumePerContainers.labelText}
            readOnly={readOnly}
            invalid={state.volumePerContainers.isInvalid}
            invalidText={fieldsConfig.volumePerContainers.invalidText}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleContainerNumAndVol(false, e.target.value);
            }}
            hideSteppers
            disableWheel
          />
        </Column>
      </Row>
      <Row className="collection-step-row">
        <Column sm={4} md={4} lg={16} xlg={12}>
          <NumberInput
            id={state.volumeOfCones.id}
            name={fieldsConfig.volumeOfCones.name}
            value={state.volumeOfCones.value}
            label={fieldsConfig.volumeOfCones.labelText}
            invalid={state.volumeOfCones.isInvalid}
            invalidText={fieldsConfig.volumeOfCones.invalidText}
            helperText={fieldsConfig.volumeOfCones.helperText}
            warn={isCalcWrong}
            readOnly={readOnly}
            warnText={fieldsConfig.volumeOfCones.warnText}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleVolOfCones(e.target.value);
            }}
            hideSteppers
            disableWheel
          />
        </Column>
      </Row>
      <Row className="collection-step-row">
        <Column sm={4} md={8} lg={16} xlg={16}>
          <CheckboxGroup
            legendText={fieldsConfig.collectionMethodOptionsLabel}
            id={state.selectedCollectionCodes.id}
          >
            {
              collectionMethods.map((method) => (
                <Checkbox
                  key={method.code}
                  id={method.label}
                  name={method.label}
                  labelText={method.description}
                  readOnly={readOnly}
                  checked={state.selectedCollectionCodes.value.includes(method.code)}
                  onChange={() => handleCollectionMethods(method.code)}
                />
              ))
            }
          </CheckboxGroup>
        </Column>
      </Row>
      <Row className="collection-step-row">
        <Column sm={4} md={4} lg={16} xlg={12}>
          <TextArea
            id={state.comments.id}
            name={fieldsConfig.comments.name}
            value={state.comments.value}
            labelText={fieldsConfig.comments.labelText}
            readOnly={readOnly}
            placeholder={fieldsConfig.comments.placeholder}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleComment(e.target.value);
            }}
            rows={5}
            maxCount={400}
            enableCounter
          />
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default CollectionStep;
