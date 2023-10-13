import React, { useState, useEffect } from 'react';
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
  const [locationCodeHelperText, setLocationCodeHelperText] = useState<string>(
    fieldsConfig.code.helperTextEnabled
  );

  // Commenting this for now until we decide how to deal
  // with the 'other' option
  // const [isOtherChecked, setIsOtherChecked] = useState<boolean | string>(state.other);

  // const refControl = useRef<any>({});

  // const addRefs = (element: HTMLInputElement, name: string) => {
  //   if (element !== null) {
  //     refControl.current = {
  //       ...refControl.current,
  //       [name]: element
  //     };
  //   }
  // };

  // const cloneState = (): CollectionForm => {
  //   const transferredObjs: TransferListItem[] = [];
  //   const keys = Object.keys(state) as Array<keyof typeof state>;
  //   keys.forEach((key) => {
  //     if (state[key].ref) {
  //       transferredObjs.push(state[key].ref);
  //     }
  //   });
  //   return structuredClone(state, { transfer: transferredObjs });
  // };

  const setRef = (el: HTMLInputElement, name: keyof CollectionForm) => {
    console.log('settingref...', name);
    if (state && el) {
      const clonedState = { ...state };
      clonedState[name].ref = el;
      // setStepData(clonedState);
    }
  };

  const updateAfterLocValidation = (isInvalid: boolean) => {
    setValidationObj({
      ...validationObj,
      isLocationCodeInvalid: isInvalid
    });
    setLocationCodeHelperText(fieldsConfig.code.helperTextEnabled);
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
      if (state.startDate.value !== '' && state.endDate.value !== '') {
        isInvalid = moment(state.endDate.value, MOMENT_DATE_FORMAT)
          .isBefore(moment(state.startDate.value, MOMENT_DATE_FORMAT));
      }
      newValidObj.isStartDateInvalid = isInvalid;
      newValidObj.isEndDateInvalid = isInvalid;
    }
    if (name === fieldsConfig.numberOfContainers.name) {
      if (+state.numberOfContainers.value < 0) {
        isInvalid = true;
      }
      newValidObj.isNumberOfContainersInvalid = isInvalid;
    }
    if (name === fieldsConfig.volumePerContainers.name) {
      if (+state.volumePerContainers.value < 0) {
        isInvalid = true;
      }
      newValidObj.isVolumePerContainersInvalid = isInvalid;
    }
    if (name === fieldsConfig.volumeOfCones.name) {
      if (+state.volumeOfCones.value < 0) {
        isInvalid = true;
      }
      newValidObj.isVolumeOfConesInvalid = isInvalid;
    }

    setValidationObj(newValidObj);
  };

  const handleFormInput = (
    name: keyof CollectionForm,
    value: string | string[],
    optName?: keyof CollectionForm,
    optValue?: string | string[],
    setDefaultAgency?: boolean,
    checked?: boolean
  ) => {
    const clonedState = { ...state };
    if (optName && optName !== name) {
      clonedState[name].value = value;
      clonedState[optName].value = optName;

      if (setDefaultAgency) {
        clonedState.useDefaultAgencyInfo.value = checked ?? false;
      }

      setStepData(clonedState);
    } else if (name === fieldsConfig.collector.name) {
      const getValue: string = (Array.isArray(value)) ? value[0] : value;
      setForestClientNumber(getValue ? getForestClientNumber(getValue) : '');
      setLocationCodeHelperText(
        getValue
          ? fieldsConfig.code.helperTextEnabled
          : fieldsConfig.code.helperTextDisabled
      );
      clonedState[name].value = value;
      clonedState.locationCode.value = getValue ? state.locationCode.value : '';
      setStepData(clonedState);
    } else {
      clonedState[name].value = name === fieldsConfig.code.name
        ? value.slice(0, LOCATION_CODE_LIMIT)
        : value;
      setStepData(clonedState);
    }

    validateInput(name, (Array.isArray(value)) ? value[0] : value);
    if (optName && optValue) {
      validateInput(optName);
    }
  };

  useEffect(() => {
    const useDefault = state.useDefaultAgencyInfo.value;
    const agency = useDefault ? defaultAgency : state.collectorAgency.value;
    const code = useDefault ? defaultCode : state.locationCode.value;

    handleFormInput(
      'collectorAgency',
      agency,
      'locationCode',
      code,
      true,
      useDefault
    );
  }, [defaultAgency, defaultCode]);

  const collectionVolumeInformationHandler = (
    name: keyof CollectionForm,
    value: string | string[]
  ) => {
    const numberOfContainers = state.numberOfContainers.value;
    const volumePerContainers = state.volumePerContainers.value;
    const volumeOfCones = state.volumeOfCones.value;
    const conesCalc = Number(numberOfContainers) * Number(volumePerContainers);

    if (name === fieldsConfig.volumeOfCones.name) {
      handleFormInput(
        fieldsConfig.volumeOfCones.name,
        value
      );
      setIsCalcWrong(
        conesCalc !== Number(volumeOfCones)
      );
    } else {
      handleFormInput(
        name,
        value,
        'volumeOfCones',
        conesCalc.toString()
      );
      setIsCalcWrong(false);
    }
  };

  const collectionMethodsCheckboxes = (selectedMethod: string) => {
    const { selectedCollectionCodes } = state;
    const index = selectedCollectionCodes.value.indexOf(selectedMethod);
    if (index > -1) {
      selectedCollectionCodes.value.splice(index, 1);
    } else {
      selectedCollectionCodes.value.push(selectedMethod);
    }
    handleFormInput('selectedCollectionCodes', selectedCollectionCodes.value);
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
      setLocationCodeHelperText('');
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
            ref={(el: HTMLInputElement) => setRef(el, 'useDefaultAgencyInfo')}
            labelText={fieldsConfig.checkbox.labelText}
            readOnly={readOnly}
            checked={state.useDefaultAgencyInfo.value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const { checked } = e.target;
              setLocationCodeHelperText(
                !checked
                  ? fieldsConfig.code.helperTextDisabled
                  : fieldsConfig.code.helperTextEnabled
              );
              handleFormInput(
                'collectorAgency',
                checked ? defaultAgency : '',
                'locationCode',
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
            ref={(el: HTMLInputElement) => setRef(el, 'collectorAgency')}
            placeholder={fieldsConfig.collector.placeholder}
            titleText={fieldsConfig.collector.titleText}
            helperText={fieldsConfig.collector.helperText}
            invalidText={fieldsConfig.collector.invalidText}
            items={agencyOptions}
            readOnly={state.useDefaultAgencyInfo || readOnly}
            selectedItem={state.collectorAgency.value}
            onChange={(e: ComboBoxEvent) => {
              handleFormInput(
                'collectorAgency',
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
            ref={(el: HTMLInputElement) => setRef(el, 'locationCode')}
            value={state.locationCode.value}
            type="number"
            placeholder={!forestClientNumber ? '' : fieldsConfig.code.placeholder}
            labelText={fieldsConfig.code.label}
            helperText={locationCodeHelperText}
            invalid={validationObj.isLocationCodeInvalid}
            invalidText={invalidLocationMessage}
            readOnly={state.useDefaultAgencyInfo.value || readOnly}
            disabled={!forestClientNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleFormInput(
                'locationCode',
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
            value={state.startDate.value}
            onChange={(_e: Array<Date>, selectedDate: string) => {
              handleFormInput(
                'startDate',
                selectedDate
              );
            }}
          >
            <DatePickerInput
              id="collection-start-date-picker"
              name={fieldsConfig.startDate.name}
              ref={(el: HTMLInputElement) => setRef(el, 'startDate')}
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
            minDate={state.startDate.value}
            readOnly={readOnly}
            value={state.endDate.value}
            onChange={(_e: Array<Date>, selectedDate: string) => {
              handleFormInput(
                'endDate',
                selectedDate
              );
            }}
          >
            <DatePickerInput
              id="collection-end-date-picker"
              name={fieldsConfig.endDate.name}
              ref={(el: HTMLInputElement) => setRef(el, 'endDate')}
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
            ref={(el: HTMLInputElement) => setRef(el, 'numberOfContainers')}
            value={state.numberOfContainers.value}
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
            ref={(el: HTMLInputElement) => setRef(el, 'volumePerContainers')}
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
            ref={(el: HTMLInputElement) => setRef(el, 'volumeOfCones')}
            value={state.volumeOfCones.value}
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
            ref={(el: HTMLInputElement) => setRef(el, 'selectedCollectionCodes')}
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
            ref={(el: HTMLInputElement) => setRef(el, 'comments')}
            value={state.comments.value}
            labelText={fieldsConfig.comments.labelText}
            readOnly={readOnly}
            placeholder={fieldsConfig.comments.placeholder}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleFormInput(
                'comments',
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
