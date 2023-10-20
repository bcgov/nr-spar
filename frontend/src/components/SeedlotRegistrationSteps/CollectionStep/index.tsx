import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  FlexGrid,
  Column,
  Row,
  NumberInput,
  ComboBox,
  CheckboxGroup,
  Checkbox,
  DatePickerInput,
  DatePicker,
  TextArea,
  TextInput,
  InlineLoading
} from '@carbon/react';
import moment from 'moment';
import validator from 'validator';

import Subtitle from '../../Subtitle';
import getForestClientLocation from '../../../api-service/forestClientsAPI';
import { filterInput, FilterObj } from '../../../utils/filterUtils';
import getForestClientNumber from '../../../utils/StringUtils';
import { LOCATION_CODE_LIMIT } from '../../../shared-constants/shared-constants';
import ComboBoxEvent from '../../../types/ComboBoxEvent';

import { DATE_FORMAT, MOMENT_DATE_FORMAT, fieldsConfig } from './constants';
import {
  CollectionStepProps,
  CollectionForm
} from './definitions';
import { calcVolume, formatLocationCode, isNumNotInRange } from './utils';

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
  const [forestClientNumber, setForestClientNumber] = useState<string>('');
  const [invalidLocationMessage, setInvalidLocationMessage] = useState<string>('');
  const [locationCodeHelperText, setLocationCodeHelperText] = useState<string>(
    fieldsConfig.code.helperTextEnabled
  );

  const updateAfterLocValidation = (isInvalid: boolean) => {
    const clonedState = structuredClone(state);
    clonedState.locationCode.isInvalid = isInvalid;
    setLocationCodeHelperText(fieldsConfig.code.helperTextEnabled);
    setStepData(clonedState);
  };

  const validateLocationCodeMutation = useMutation({
    mutationFn: (queryParams: string[]) => getForestClientLocation(
      queryParams[0],
      queryParams[1]
    ),
    onError: () => {
      setInvalidLocationMessage(fieldsConfig.code.invalidLocationForSelectedAgency);
      updateAfterLocValidation(true);
    },
    onSuccess: () => updateAfterLocValidation(false)
  });

  useEffect(() => {
    const useDefault = state.useDefaultAgencyInfo.value;
    const agencyValue = useDefault ? defaultAgency : state.collectorAgency.value;
    const codeValue = useDefault ? defaultCode : state.locationCode.value;

    const clonedState = structuredClone(state);
    clonedState.collectorAgency.value = agencyValue;
    clonedState.locationCode.value = codeValue;
    setStepData(clonedState);
  }, [defaultAgency, defaultCode]);

  const handleDefaultCheckBox = (checked: boolean) => {
    setLocationCodeHelperText(
      checked
        ? fieldsConfig.code.helperTextEnabled
        : fieldsConfig.code.helperTextDisabled
    );
    const clonedState = structuredClone(state);
    clonedState.collectorAgency.value = checked ? defaultAgency : '';
    clonedState.locationCode.value = checked ? defaultCode : '';
    clonedState.useDefaultAgencyInfo.value = checked;
    setStepData(clonedState);
  };

  const handleCollectorInput = (value: string) => {
    setForestClientNumber(value ? getForestClientNumber(value) : '');
    setLocationCodeHelperText(
      value
        ? fieldsConfig.code.helperTextEnabled
        : fieldsConfig.code.helperTextDisabled
    );
    const clonedState = structuredClone(state);
    clonedState.collectorAgency.value = value;
    clonedState.locationCode.value = value ? state.locationCode.value : '';
    setStepData(clonedState);
  };

  const handleLocationCodeChange = (value: string) => {
    const clonedState = structuredClone(state);
    clonedState.locationCode.value = value.slice(0, LOCATION_CODE_LIMIT);
    const isInRange = validator.isInt(value, { min: 0, max: 99 });
    if (!isInRange) {
      setInvalidLocationMessage(fieldsConfig.code.invalidText);
      clonedState.locationCode.isInvalid = true;
    }
    setStepData(clonedState);
  };

  const handleLocationCodeBlur = (value: string) => {
    const formattedCode = value.length ? formatLocationCode(value) : '';
    if (formattedCode === '') return;
    const clonedState = structuredClone(state);
    clonedState.locationCode.value = formattedCode;
    setStepData(clonedState);
    if (forestClientNumber) {
      validateLocationCodeMutation.mutate([forestClientNumber, formattedCode]);
      setLocationCodeHelperText('');
    }
  };

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
      <Row className="collection-step-row">
        <Column sm={4} md={8} lg={16} xlg={16}>
          <Checkbox
            id={state.useDefaultAgencyInfo.id}
            name={fieldsConfig.checkbox.name}
            labelText={fieldsConfig.checkbox.labelText}
            readOnly={readOnly}
            checked={state.useDefaultAgencyInfo.value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleDefaultCheckBox(e.target.checked);
            }}
          />
        </Column>
      </Row>
      <Row className="collection-step-row">
        <Column sm={4} md={4} lg={8} xlg={6}>
          <ComboBox
            id={state.collectorAgency.id}
            name={fieldsConfig.collector.name}
            placeholder={fieldsConfig.collector.placeholder}
            titleText={fieldsConfig.collector.titleText}
            helperText={fieldsConfig.collector.helperText}
            invalidText={fieldsConfig.collector.invalidText}
            items={agencyOptions}
            readOnly={state.useDefaultAgencyInfo.value || readOnly}
            selectedItem={state.collectorAgency.value}
            onChange={(e: ComboBoxEvent) => handleCollectorInput(e.selectedItem)}
            invalid={state.collectorAgency.isInvalid}
            shouldFilterItem={
              ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
            }
            size="md"
          />
        </Column>
        <Column sm={4} md={4} lg={8} xlg={6}>
          <TextInput
            id={state.locationCode.id}
            className="cone-collector-location-code"
            name={fieldsConfig.code.name}
            value={state.locationCode.value}
            type="number"
            placeholder={!forestClientNumber ? '' : fieldsConfig.code.placeholder}
            labelText={fieldsConfig.code.label}
            helperText={locationCodeHelperText}
            invalid={state.locationCode.isInvalid}
            invalidText={invalidLocationMessage}
            readOnly={state.useDefaultAgencyInfo.value || readOnly}
            disabled={!forestClientNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleLocationCodeChange(e.target.value);
            }}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleLocationCodeBlur(e.target.value);
            }}
          />
          {
            validateLocationCodeMutation.isLoading
              ? <InlineLoading description="Validating..." />
              : null
          }
        </Column>
      </Row>
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
