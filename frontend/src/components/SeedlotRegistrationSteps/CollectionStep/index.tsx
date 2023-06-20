import React, { useState, useRef } from 'react';
import moment from 'moment';

import {
  FlexGrid,
  Column,
  Row,
  NumberInput,
  ComboBox,
  Checkbox,
  DatePickerInput,
  DatePicker,
  TextArea
} from '@carbon/react';

import Subtitle from '../../Subtitle';

import { DATE_FORMAT, MOMENT_DATE_FORMAT, fieldsConfig } from './constants';
import { filterInput, FilterObj } from '../../../utils/filterUtils';
import {
  CollectionStepProps,
  CollectionForm,
  FormValidation
} from './definitions';
import ComboBoxEvent from '../../../types/ComboBoxEvent';

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
  const [isChecked, setIsChecked] = useState<boolean>(true);
  const [isCalcWrong, setIsCalcWrong] = useState<boolean>(false);
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

  const validateInput = (name: string, value: string | boolean) => {
    const newValidObj = { ...validationObj };
    let isInvalid = false;
    if (name === fieldsConfig.code.name) {
      if ((value as string).length !== 2) {
        isInvalid = true;
      }
      newValidObj.isLocationCodeInvalid = isInvalid;
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

  const handleFormInput = <K extends keyof CollectionForm>(
    name: string,
    value: CollectionForm[K],
    optName?: string,
    optValue?: CollectionForm[K]
  ) => {
    const newForm: CollectionForm = { ...state };
    newForm[name] = value;
    if (optName && optValue && optName !== name) {
      newForm[optName] = optValue;
    }
    setStepData(newForm);
    validateInput(name, value);
    if (optName && optValue) {
      validateInput(optName, optValue);
    }
  };

  const collectorAgencyIsChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setIsChecked(checked);
    handleFormInput(
      fieldsConfig.collector.name,
      defaultAgency,
      fieldsConfig.code.name,
      defaultCode
    );
  };

  const collectionVolumeInformationHandler = <K extends keyof CollectionForm>(
    name: string,
    value: CollectionForm[K]
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

  const collectionMethodsCheckboxes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    handleFormInput(name, checked);
    // Commenting this for now until we decide how to deal
    // with the 'other' option
    // if (name === 'other') {
    //   setIsOtherChecked(checked);
    // }
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
            checked={isChecked}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              collectorAgencyIsChecked(e);
            }}
          />
        </Column>
      </Row>
      <Row className="collection-step-row">
        <Column sm={4} md={4} lg={8} xlg={6}>
          <ComboBox
            id={fieldsConfig.collector.name}
            name={fieldsConfig.collector.name}
            ref={(el: HTMLInputElement) => addRefs(el, fieldsConfig.collector.name)}
            placeholder={fieldsConfig.collector.placeholder}
            titleText={fieldsConfig.collector.titleText}
            helperText={fieldsConfig.collector.helperText}
            invalidText={fieldsConfig.collector.invalidText}
            items={agencyOptions}
            readOnly={isChecked || readOnly}
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
          <NumberInput
            id={fieldsConfig.code.name}
            name={fieldsConfig.code.name}
            ref={(el: HTMLInputElement) => addRefs(el, fieldsConfig.code.name)}
            value={state.locationCode}
            placeholder={fieldsConfig.code.placeholder}
            label={fieldsConfig.code.label}
            helperText={fieldsConfig.code.helperText}
            invalidText={fieldsConfig.code.invalidText}
            readOnly={isChecked || readOnly}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleFormInput(
                fieldsConfig.code.name,
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
              id={fieldsConfig.startDate.name}
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
              id={fieldsConfig.endDate.name}
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
            id={fieldsConfig.numberOfContainers.name}
            name={fieldsConfig.numberOfContainers.name}
            ref={(el: HTMLInputElement) => addRefs(el, fieldsConfig.numberOfContainers.name)}
            value={state.numberOfContainers}
            label={fieldsConfig.numberOfContainers.labelText}
            readOnly={readOnly}
            invalidText={fieldsConfig.numberOfContainers.invalidText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              collectionVolumeInformationHandler(
                fieldsConfig.numberOfContainers.name,
                e.target.value
              );
            }}
            hideSteppers
            disableWheel
          />
        </Column>
        <Column sm={4} md={4} lg={8} xlg={6}>
          <NumberInput
            id={fieldsConfig.volumePerContainers.name}
            name={fieldsConfig.volumePerContainers.name}
            ref={(el: HTMLInputElement) => addRefs(el, fieldsConfig.volumePerContainers.name)}
            value={state.volumePerContainers}
            label={fieldsConfig.volumePerContainers.labelText}
            readOnly={readOnly}
            invalidText={fieldsConfig.volumePerContainers.invalidText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              collectionVolumeInformationHandler(
                fieldsConfig.volumePerContainers.name,
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
            id={fieldsConfig.volumeOfCones.name}
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
                fieldsConfig.volumeOfCones.name,
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
          <fieldset>
            <Subtitle text={fieldsConfig.collectionMethodOptionsLabel} />
            {
              collectionMethods.map((method) => (
                <Checkbox
                  id={method.label}
                  name={method.label}
                  ref={(el: HTMLInputElement) => addRefs(el, method.label)}
                  labelText={method.description}
                  readOnly={readOnly}
                  checked={state[method.label]}
                  onChange={
                    (event: React.ChangeEvent<HTMLInputElement>) => {
                      collectionMethodsCheckboxes(event);
                    }
                  }
                />
              ))

            }
          </fieldset>
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
