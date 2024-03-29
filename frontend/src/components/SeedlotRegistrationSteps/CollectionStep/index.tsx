import React, { useState, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FlexGrid,
  Column,
  Row,
  NumberInput,
  CheckboxGroup,
  Checkbox,
  DatePickerInput,
  DatePicker,
  TextArea,
  CheckboxSkeleton
} from '@carbon/react';
import moment from 'moment';
import validator from 'validator';

import { BooleanInputType, OptionsInputType, StringInputType } from '../../../types/FormInputType';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../config/TimeUnits';
import getConeCollectionMethod from '../../../api-service/coneCollectionMethodAPI';

import Subtitle from '../../Subtitle';
import ApplicantAgencyFields from '../../ApplicantAgencyFields';
import ClassAContext from '../../../views/Seedlot/ContextContainerClassA/context';
import MultiOptionsObj from '../../../types/MultiOptionsObject';

import {
  DATE_FORMAT, MOMENT_DATE_FORMAT, agencyFieldsProps, fieldsConfig
} from './constants';
import {
  CollectionForm
} from './definitions';
import { calcVolume, isNumNotInRange } from './utils';

import './styles.scss';

type props = {
  isReview?: boolean
}

const CollectionStep = ({ isReview }: props) => {
  const {
    allStepData: { collectionStep: state },
    setStepData,
    defaultAgencyObj: defaultAgency,
    defaultCode,
    agencyOptions,
    isFormSubmitted
  } = useContext(ClassAContext);

  const [isCalcWrong, setIsCalcWrong] = useState<boolean>(false);

  const setAgencyAndCode = (
    isDefault: BooleanInputType,
    agency: OptionsInputType,
    locationCode: StringInputType
  ) => {
    const clonedState = structuredClone(state);
    clonedState.useDefaultAgencyInfo = isDefault;
    clonedState.collectorAgency = agency;
    clonedState.locationCode = locationCode;
    setStepData('collectionStep', clonedState);
  };

  const coneCollectionMethodsQuery = useQuery({
    queryKey: ['cone-collection-methods'],
    queryFn: getConeCollectionMethod,
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  const handleDateChange = (isStartDate: boolean, value: string) => {
    const clonedState = structuredClone(state);
    const dateType: keyof CollectionForm = isStartDate ? 'startDate' : 'endDate';

    clonedState[dateType].value = value;

    const isInvalid = moment(clonedState.endDate.value, MOMENT_DATE_FORMAT)
      .isBefore(moment(clonedState.startDate.value, MOMENT_DATE_FORMAT));

    clonedState.startDate.isInvalid = isInvalid;
    clonedState.endDate.isInvalid = isInvalid;

    setStepData('collectionStep', clonedState);
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

    setStepData('collectionStep', clonedState);
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
    setStepData('collectionStep', clonedState);
  };

  const handleCollectionMethods = (selectedMethod: string) => {
    const clonedState = structuredClone(state);
    const index = clonedState.selectedCollectionCodes.value.indexOf(selectedMethod);
    if (index > -1) {
      clonedState.selectedCollectionCodes.value.splice(index, 1);
    } else {
      clonedState.selectedCollectionCodes.value.push(selectedMethod);
    }
    setStepData('collectionStep', clonedState);
  };

  const handleComment = (value: string) => {
    const clonedState = structuredClone(state);
    clonedState.comments.value = value;
    setStepData('collectionStep', clonedState);
  };

  return (
    <FlexGrid className="collection-step-container">
      <Row className="collection-step-row">
        <Column sm={4} md={8} lg={16} xlg={16}>
          <h2 className="section-title">{fieldsConfig.titleSection.title}</h2>
          <Subtitle text={fieldsConfig.titleSection.subtitle} />
        </Column>
      </Row>
      <ApplicantAgencyFields
        showCheckbox
        isDefault={state.useDefaultAgencyInfo}
        checkboxId="collection-step-default-checkbox"
        agency={state.collectorAgency}
        locationCode={state.locationCode}
        fieldsProps={agencyFieldsProps}
        agencyOptions={agencyOptions}
        defaultAgency={defaultAgency}
        defaultCode={defaultCode}
        setAgencyAndCode={
          (
            isDefault: BooleanInputType,
            agency: OptionsInputType,
            locationCode: StringInputType
          ) => setAgencyAndCode(isDefault, agency, locationCode)
        }
        isFormSubmitted={isFormSubmitted}
        readOnly={isFormSubmitted && !isReview}
        maxInputColSize={6}
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
            readOnly={isFormSubmitted && !isReview}
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
              autoComplete="off"
            />
          </DatePicker>
        </Column>
        <Column sm={4} md={4} lg={8} xlg={6}>
          <DatePicker
            datePickerType="single"
            dateFormat={DATE_FORMAT}
            minDate={state.startDate.value}
            readOnly={isFormSubmitted && !isReview}
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
              autoComplete="off"
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
            readOnly={isFormSubmitted && !isReview}
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
            readOnly={isFormSubmitted && !isReview}
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
            readOnly={isFormSubmitted && !isReview}
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
          {
            coneCollectionMethodsQuery.isFetching
              ? (
                <>
                  <CheckboxSkeleton />
                  <CheckboxSkeleton />
                  <CheckboxSkeleton />
                </>
              )
              : (
                <CheckboxGroup
                  legendText={fieldsConfig.collectionMethodOptionsLabel}
                  id={state.selectedCollectionCodes.id}
                >
                  {
                    (coneCollectionMethodsQuery.data as MultiOptionsObj[]).map((method) => (
                      <Checkbox
                        key={method.code}
                        id={`cone-collection-method-checkbox-${method.code}`}
                        name={method.label}
                        labelText={method.description}
                        readOnly={isFormSubmitted && !isReview}
                        checked={state.selectedCollectionCodes.value.includes(method.code)}
                        onChange={() => handleCollectionMethods(method.code)}
                      />
                    ))
                  }
                </CheckboxGroup>
              )
          }
        </Column>
      </Row>
      <Row className="collection-step-row">
        <Column sm={4} md={4} lg={16} xlg={12}>
          <TextArea
            id={state.comments.id}
            name={fieldsConfig.comments.name}
            labelText={fieldsConfig.comments.labelText}
            readOnly={isFormSubmitted && !isReview}
            placeholder={fieldsConfig.comments.placeholder}
            defaultValue={state.comments.value}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
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
