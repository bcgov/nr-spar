import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import moment from 'moment';

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

import validator from 'validator';

import Subtitle from '../../Subtitle';

import getForestClientLocation from '../../../api-service/forestClientsAPI';

import { DATE_FORMAT, MOMENT_DATE_FORMAT, fieldsConfig } from './constants';
import { filterInput, FilterObj } from '../../../utils/filterUtils';
import getForestClientNumber from '../../../utils/StringUtils';
import { LOCATION_CODE_LIMIT } from '../../../shared-constants/shared-constants';
import ComboBoxEvent from '../../../types/ComboBoxEvent';
import {
  CollectionStepProps,
  CollectionForm,
  FormValidation
} from './definitions';

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
  const initialValidationObj: FormValidation = {
    isNameInvalid: false,
    isLocationCodeInvalid: false,
    isStartDateInvalid: false,
    isEndDateInvalid: false,
    isNumberOfContainersInvalid: false,
    isVolumePerContainersInvalid: false,
    isVolumeOfConesInvalid: false,
    isCollectionMethodsInvalid: false
  };

  const [validationObj, setValidationObj] = useState<FormValidation>(initialValidationObj);
  const [isCalcWrong, setIsCalcWrong] = useState<boolean>(false);
  const [forestClientNumber, setForestClientNumber] = useState<string>('');
  const [invalidLocationMessage, setInvalidLocationMessage] = useState<string>('');
  const [locationCodeHelper, setLocationCodeHelper] = useState<string>(
    fieldsConfig.code.helperTextEnabled
  );

  // Commenting this for now until we decide how to deal
  // with the 'other' option
  // const [isOtherChecked, setIsOtherChecked] = useState<boolean | string>(state.other);

  const refControl = useRef<any>({});

  const addRefs = (element: HTMLInputElement, name: string) => {
    if (element !== null) {
      refControl.current = {
        ...refControl.current,
        [name]: element
      };
    }
  };

  const updateAfterLocValidation = (isInvalid: boolean) => {
    setValidationObj({
      ...validationObj,
      isLocationCodeInvalid: isInvalid
    });
    setLocationCodeHelper(fieldsConfig.code.helperTextEnabled);
  };

  const validateLocationCodeMutation = useMutation({
    mutationFn: (queryParams:string[]) => getForestClientLocation(
      queryParams[0],
      queryParams[1]
    ),
    onError: () => {
      setInvalidLocationMessage(fieldsConfig.code.invalidLocationForSelectedAgency);
      updateAfterLocValidation(true);
    },
    onSuccess: () => updateAfterLocValidation(false)
  });

  const validateInput = (name: string, value?: string) => {
    const newValidObj = { ...validationObj };
    let isInvalid = false;
    if (name === fieldsConfig.collector.name) {
      if (!value) {
        newValidObj.isLocationCodeInvalid = false;
      }
    }

    if (name === fieldsConfig.startDate.name || name === fieldsConfig.endDate.name) {
      // Have both start and end dates
      if (state.startDate !== '' && state.endDate !== '') {
        isInvalid = moment(state.endDate, MOMENT_DATE_FORMAT)
          .isBefore(moment(state.startDate, MOMENT_DATE_FORMAT));
      }
      newValidObj.isStartDateInvalid = isInvalid;
      newValidObj.isEndDateInvalid = isInvalid;
    }
    if (name === fieldsConfig.numberOfContainers.name) {
      if (+state.numberOfContainers < 0) {
        isInvalid = true;
      }
      newValidObj.isNumberOfContainersInvalid = isInvalid;
    }
    if (name === fieldsConfig.volumePerContainers.name) {
      if (+state.volumePerContainers < 0) {
        isInvalid = true;
      }
      newValidObj.isVolumePerContainersInvalid = isInvalid;
    }
    if (name === fieldsConfig.volumeOfCones.name) {
      if (+state.volumeOfCones < 0) {
        isInvalid = true;
      }
      newValidObj.isVolumeOfConesInvalid = isInvalid;
    }

    setValidationObj(newValidObj);
  };

  const handleFormInput = (
    name: string,
    value: string | string[],
    optName?: string,
    optValue?: string | string[],
    setDefaultAgency?: boolean,
    checked?: boolean
  ) => {
    if (optName && optName !== name) {
      const newState = {
        ...state,
        [name]: value,
        [optName]: optValue
      };

      if (setDefaultAgency) {
        newState.useDefaultAgencyInfo = checked || false;
      }

      setStepData(newState);
    } else if (name === fieldsConfig.collector.name) {
      const getValue: string = (Array.isArray(value)) ? value[0] : value;
      setForestClientNumber(getValue ? getForestClientNumber(getValue) : '');
      setLocationCodeHelper(
        getValue
          ? fieldsConfig.code.helperTextEnabled
          : fieldsConfig.code.helperTextDisabled
      );
      setStepData({
        ...state,
        [name]: value,
        locationCode: getValue ? state.locationCode : ''
      });
    } else {
      setStepData({
        ...state,
        [name]: (name === fieldsConfig.code.name ? value.slice(0, LOCATION_CODE_LIMIT) : value)
      });
    }
    validateInput(name, (Array.isArray(value)) ? value[0] : value);
    if (optName && optValue) {
      validateInput(optName);
    }
  };

  useEffect(() => {
    const useDefault = state.useDefaultAgencyInfo;
    const agency = useDefault ? defaultAgency : state.collectorAgency;
    const code = useDefault ? defaultCode : state.locationCode;

    handleFormInput(
      fieldsConfig.collector.name,
      agency,
      fieldsConfig.code.name,
      code,
      true,
      useDefault
    );
  }, [defaultAgency, defaultCode]);

  const collectionVolumeInformationHandler = (
    name: string,
    value: string | string[]
  ) => {
    const numberOfContainers = +refControl.current[fieldsConfig.numberOfContainers.name].value;
    const volumePerContainers = +refControl.current[fieldsConfig.volumePerContainers.name].value;
    const volumeOfCones = +refControl.current[fieldsConfig.volumeOfCones.name].value;
    const conesCalc = (numberOfContainers * volumePerContainers);

    if (name === fieldsConfig.volumeOfCones.name) {
      handleFormInput(
        fieldsConfig.volumeOfCones.name,
        value
      );
      setIsCalcWrong(
        (numberOfContainers * volumePerContainers) !== volumeOfCones
      );
    } else {
      handleFormInput(
        name,
        value,
        fieldsConfig.volumeOfCones.name,
        conesCalc.toString()
      );
      setIsCalcWrong(false);
    }
  };

  const collectionMethodsCheckboxes = (selectedMethod: string) => {
    const { selectedCollectionCodes } = state;
    const index = selectedCollectionCodes.indexOf(selectedMethod);
    if (index > -1) {
      selectedCollectionCodes.splice(index, 1);
    } else {
      selectedCollectionCodes.push(selectedMethod);
    }
    handleFormInput('selectedCollectionCodes', selectedCollectionCodes);
  };

  const validateLocationCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    let locationCode = event.target.value;
    const isInRange = validator.isInt(locationCode, { min: 0, max: 99 });

    // Adding this check to add an extra 0 on the left, for cases where
    // the user types values between 0 and 9
    if (isInRange && locationCode.length === 1) {
      locationCode = locationCode.padStart(2, '0');
      setStepData({
        ...state,
        locationCode
      });
    }

    if (!isInRange) {
      setInvalidLocationMessage(fieldsConfig.code.invalidText);
      setValidationObj({
        ...validationObj,
        isLocationCodeInvalid: true
      });
      return;
    }

    if (forestClientNumber) {
      validateLocationCodeMutation.mutate([forestClientNumber, locationCode]);
      setValidationObj({
        ...validationObj,
        isLocationCodeInvalid: false
      });
      setLocationCodeHelper('');
    }
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
            id={fieldsConfig.checkbox.name}
            name={fieldsConfig.checkbox.name}
            ref={(el: HTMLInputElement) => addRefs(el, fieldsConfig.checkbox.name)}
            labelText={fieldsConfig.checkbox.labelText}
            readOnly={readOnly}
            checked={state.useDefaultAgencyInfo}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const { checked } = e.target;
              setLocationCodeHelper(
                !checked
                  ? fieldsConfig.code.helperTextDisabled
                  : fieldsConfig.code.helperTextEnabled
              );
              handleFormInput(
                fieldsConfig.collector.name,
                checked ? defaultAgency : '',
                fieldsConfig.code.name,
                checked ? defaultCode : '',
                true,
                checked
              );
            }}
          />
        </Column>
      </Row>
      <Row className="collection-step-row">
        <Column sm={4} md={4} lg={8} xlg={6}>
          <ComboBox
            id="collector-agency-combobox"
            name={fieldsConfig.collector.name}
            ref={(el: HTMLInputElement) => addRefs(el, fieldsConfig.collector.name)}
            placeholder={fieldsConfig.collector.placeholder}
            titleText={fieldsConfig.collector.titleText}
            helperText={fieldsConfig.collector.helperText}
            invalidText={fieldsConfig.collector.invalidText}
            items={agencyOptions}
            readOnly={state.useDefaultAgencyInfo || readOnly}
            selectedItem={state.collectorAgency}
            onChange={(e: ComboBoxEvent) => {
              handleFormInput(
                fieldsConfig.collector.name,
                e.selectedItem
              );
            }}
            invalid={validationObj.isNameInvalid}
            shouldFilterItem={
              ({ item, inputValue }: FilterObj) => filterInput({ item, inputValue })
            }
            size="md"
          />
        </Column>
        <Column sm={4} md={4} lg={8} xlg={6}>
          <TextInput
            id="collector-location-code-input"
            className="cone-collector-location-code"
            name={fieldsConfig.code.name}
            ref={(el: HTMLInputElement) => addRefs(el, fieldsConfig.code.name)}
            value={state.locationCode}
            type="number"
            placeholder={!forestClientNumber ? '' : fieldsConfig.code.placeholder}
            labelText={fieldsConfig.code.label}
            helperText={locationCodeHelper}
            invalid={validationObj.isLocationCodeInvalid}
            invalidText={invalidLocationMessage}
            readOnly={state.useDefaultAgencyInfo || readOnly}
            disabled={!forestClientNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleFormInput(
                fieldsConfig.code.name,
                e.target.value
              );
            }}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (!e.target.readOnly) {
                validateLocationCode(e);
              }
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
            value={state.startDate}
            onChange={(_e: Array<Date>, selectedDate: string) => {
              handleFormInput(
                fieldsConfig.startDate.name,
                selectedDate
              );
            }}
          >
            <DatePickerInput
              id="collection-start-date-picker"
              name={fieldsConfig.startDate.name}
              ref={(el: HTMLInputElement) => addRefs(el, fieldsConfig.startDate.name)}
              placeholder={fieldsConfig.startDate.placeholder}
              labelText={fieldsConfig.startDate.labelText}
              helperText={fieldsConfig.startDate.helperText}
              invalid={validationObj.isStartDateInvalid}
              invalidText={fieldsConfig.startDate.invalidText}
              size="md"
            />
          </DatePicker>
        </Column>
        <Column sm={4} md={4} lg={8} xlg={6}>
          <DatePicker
            datePickerType="single"
            dateFormat={DATE_FORMAT}
            minDate={state.startDate}
            readOnly={readOnly}
            value={state.endDate}
            onChange={(_e: Array<Date>, selectedDate: string) => {
              handleFormInput(
                fieldsConfig.endDate.name,
                selectedDate
              );
            }}
          >
            <DatePickerInput
              id="collection-end-date-picker"
              name={fieldsConfig.endDate.name}
              ref={(el: HTMLInputElement) => addRefs(el, fieldsConfig.endDate.name)}
              placeholder={fieldsConfig.endDate.placeholder}
              labelText={fieldsConfig.endDate.labelText}
              helperText={fieldsConfig.endDate.helperText}
              invalid={validationObj.isEndDateInvalid}
              invalidText={fieldsConfig.endDate.invalidText}
              size="md"
            />
          </DatePicker>
        </Column>
      </Row>
      <Row className="collection-step-row">
        <Column sm={4} md={4} lg={8} xlg={6}>
          <NumberInput
            id="collection-num-of-container-input"
            name={fieldsConfig.numberOfContainers.name}
            ref={(el: HTMLInputElement) => addRefs(el, fieldsConfig.numberOfContainers.name)}
            value={state.numberOfContainers}
            label={fieldsConfig.numberOfContainers.labelText}
            readOnly={readOnly}
            invalidText={fieldsConfig.numberOfContainers.invalidText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              collectionVolumeInformationHandler(
                fieldsConfig.numberOfContainers.name as keyof CollectionForm,
                e.target.value
              );
            }}
            hideSteppers
            disableWheel
          />
        </Column>
        <Column sm={4} md={4} lg={8} xlg={6}>
          <NumberInput
            id="collection-colume-perc-input"
            name={fieldsConfig.volumePerContainers.name}
            ref={(el: HTMLInputElement) => addRefs(el, fieldsConfig.volumePerContainers.name)}
            value={state.volumePerContainers}
            label={fieldsConfig.volumePerContainers.labelText}
            readOnly={readOnly}
            invalidText={fieldsConfig.volumePerContainers.invalidText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              collectionVolumeInformationHandler(
                fieldsConfig.volumePerContainers.name as keyof CollectionForm,
                e.target.value
              );
            }}
            hideSteppers
            disableWheel
          />
        </Column>
      </Row>
      <Row className="collection-step-row">
        <Column sm={4} md={4} lg={16} xlg={12}>
          <NumberInput
            id="collection-value-of-cones-input"
            name={fieldsConfig.volumeOfCones.name}
            ref={(el: HTMLInputElement) => addRefs(el, fieldsConfig.volumeOfCones.name)}
            value={state.volumeOfCones}
            label={fieldsConfig.volumeOfCones.labelText}
            invalidText={fieldsConfig.volumeOfCones.invalidText}
            helperText={fieldsConfig.volumeOfCones.helperText}
            warn={isCalcWrong}
            readOnly={readOnly}
            warnText={fieldsConfig.volumeOfCones.warnText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              collectionVolumeInformationHandler(
                fieldsConfig.volumeOfCones.name as keyof CollectionForm,
                e.target.value
              );
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
          >
            {
              collectionMethods.map((method) => (
                <Checkbox
                  key={method.code}
                  id={method.label}
                  name={method.label}
                  ref={(el: HTMLInputElement) => addRefs(el, method.label)}
                  labelText={method.description}
                  readOnly={readOnly}
                  checked={state.selectedCollectionCodes.includes(method.code)}
                  onChange={() => collectionMethodsCheckboxes(method.code)}
                />
              ))
            }
          </CheckboxGroup>
        </Column>
        {
        // Commenting this for now until we decide how to deal
        // with the 'other' option
        /* <Column className="" sm={4} md={4} lg={16} xlg={12}>
          {
            isOtherChecked && (
              <TextInput
                className="collection-method__input"
                id={fieldsConfig.collectionMethod.name}
                name={fieldsConfig.collectionMethod.name}
                type="text"
                ref={(el: HTMLInputElement) => addRefs(el, fieldsConfig.collectionMethod.name)}
                labelText={fieldsConfig.collectionMethod.labelText}
                placeholder={fieldsConfig.collectionMethod.placeholder}
                helperText={fieldsConfig.collectionMethod.helperText}
                readOnly={readOnly}
                value={state.collectionMethodName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleFormInput(
                    fieldsConfig.collectionMethod.name,
                    e.target.value
                  );
                }}
              />
            )
          }
        </Column> */}
      </Row>
      <Row className="collection-step-row">
        <Column sm={4} md={4} lg={16} xlg={12}>
          <TextArea
            name={fieldsConfig.comments.name}
            ref={(el: HTMLInputElement) => addRefs(el, fieldsConfig.comments.name)}
            value={state.comments}
            labelText={fieldsConfig.comments.labelText}
            readOnly={readOnly}
            placeholder={fieldsConfig.comments.placeholder}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleFormInput(
                fieldsConfig.comments.name,
                e.target.value
              );
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
