import React, { useState, useRef } from 'react';
import {
  Accordion,
  AccordionItem
} from '@carbon/react';

import TitleAccordion from '../../TitleAccordion';
import SingleOwnerInfo from './SingleOwnerInfo';
import DropDownObj from '../../../types/DropDownObject';

import {
  StateReturnObj,
  ValidationProp,
  SingleOwnerForm,
  AccordionCtrlObj,
  AccordionItemHeadClick
} from './definitions';
import {
  insertOwnerForm,
  deleteOwnerForm,
  getAgencyName,
  formatPortionPerc,
  calcResvOrSurp,
  skipForInvalidLength,
  getValidKey,
  isInputInvalid,
  arePortionsValid
} from './utils';
import {
  DEFAULT_INDEX,
  MAX_OWNERS,
  inputText,
  validTemplate
} from './constants';

import './styles.scss';

interface OwnershipStepProps {
  defaultAgency: string
  defaultCode: string,
  agencyOptions: Array<string>,
  state: Array<SingleOwnerForm>,
  setStepData: Function,
  readOnly?: boolean,
  fundingSources: Array<DropDownObj>,
  paymentMethods: Array<DropDownObj>
}

/*
  Component
*/
const OwnershipStep = (
  {
    state,
    setStepData,
    defaultCode,
    defaultAgency,
    agencyOptions,
    readOnly,
    fundingSources,
    paymentMethods
  }: OwnershipStepProps
) => {
  const initialValidState = { ...validTemplate };
  initialValidState.id = DEFAULT_INDEX;
  const [validationArray, setValidationArray] = useState([initialValidState]);

  const [disableInputs, setDisableInputs] = useState(true);

  const [accordionControls, setAccordionControls] = useState<AccordionCtrlObj>({});

  const refControl = useRef<any>({});

  const setPortionsValid = (isInvalid: boolean) => {
    const updatedArray = [...validationArray];
    const len = updatedArray.length;
    for (let i = 0; i < len; i += 1) {
      updatedArray[i].portion = {
        isInvalid,
        invalidText: inputText.portion.invalidText
      };
    }
    setValidationArray(updatedArray);
  };

  const setValidation = (
    index: number,
    name: string | keyof ValidationProp,
    isInvalid: boolean,
    invalidText: string,
    optName?: string | keyof ValidationProp,
    optIsInvalid?: boolean,
    optInvalidText?: string
  ) => {
    const updatedArray = [...validationArray];
    if (optName) {
      updatedArray[index] = {
        ...updatedArray[index],
        [name]: {
          isInvalid,
          invalidText
        },
        [optName]: {
          isInvalid: optIsInvalid,
          invalidText: optInvalidText
        }
      };
    } else {
      updatedArray[index] = {
        ...updatedArray[index],
        [name]: {
          isInvalid,
          invalidText
        }
      };
    }
    setValidationArray(updatedArray);
  };

  const validateInput = (
    index: number,
    name: string,
    value: string,
    optName?: string,
    optIsInvalid?: boolean,
    optInvalidText?: string
  ) => {
    const { isInvalid, invalidText } = isInputInvalid(name, value);
    const validKey = getValidKey(name);
    if (optName) {
      setValidation(index, validKey, isInvalid, invalidText, optName, optIsInvalid, optInvalidText);
    } else {
      setValidation(index, validKey, isInvalid, invalidText);
    }
  };

  // Optional name and value can be passed in to set two values at once
  const handleInputChange = (
    index: number,
    name: string,
    value: string,
    optionalName?: string,
    optionalValue?: string
  ) => {
    const updatedArray = [...state];
    /*
      If the input is invalid, don't update state values (no more typing)
          e.g. if a user types 133 in owner code we should only display 13 instead
               of showing the input is invalid
       Currently this does not work for decimal enforcement, the state can be forced
       to have 2 decimal places but the carbon input will still show user's input
          e.g. input: 0.1222 state: 0.12, on_screen:  0.1222
       Not sure why this is happening since the input value is linked to state
     */
    if (skipForInvalidLength(name, value)) return;
    if (optionalName) {
      updatedArray[index] = {
        ...updatedArray[index],
        [name]: value,
        [optionalName]: optionalValue
      };
    } else {
      updatedArray[index] = {
        ...updatedArray[index],
        [name]: value
      };
    }
    // Auto calc either reserved or surplus and validate the other one
    if (name === 'reservedPerc' || name === 'surplusPerc') {
      const {
        newArr,
        isInvalid,
        invalidText,
        validKey
      } = calcResvOrSurp(index, name, value, updatedArray);
      setStepData(newArr);
      validateInput(index, name, value, validKey, isInvalid, invalidText);
    } else if (name === 'ownerCode' && optionalName === 'ownerAgency') {
      // This if block is needed due to the checkbox, if unchecked, set both input to invalid
      setStepData(updatedArray);
      const agencyKey = getValidKey(optionalName);
      const isInvalid = optionalValue === '';
      const { invalidText } = inputText.owner;
      validateInput(index, name, value, agencyKey, isInvalid, invalidText);
    } else if (name === 'ownerPortion') {
      setStepData(updatedArray);
      // Prioritize single input validation
      const { isInvalid, invalidText } = isInputInvalid(name, value);
      if (isInvalid) {
        const validKey = getValidKey(name);
        setValidation(index, validKey, isInvalid, invalidText);
      } else {
        // If the single number is ok then we check the sum
        const portionsInvalid = !arePortionsValid(updatedArray);
        setPortionsValid(portionsInvalid);
      }
    } else {
      setStepData(updatedArray);
      validateInput(index, name, value);
    }
  };

  const addAnOwner = () => {
    // Maximum # of ownership can be set
    if (state.length >= MAX_OWNERS) {
      return;
    }
    const {
      newValidArr,
      newOwnerArr
    }: StateReturnObj = insertOwnerForm(state, validationArray);
    setStepData(newOwnerArr);
    setValidationArray(newValidArr);
  };

  const deleteAnOwner = (id: number) => {
    const {
      newOwnerArr,
      newValidArr
    }: StateReturnObj = deleteOwnerForm(id, state, validationArray);
    delete refControl.current[id];
    const portionsInvalid = !arePortionsValid(newOwnerArr);
    setPortionsValid(portionsInvalid);
    setStepData(newOwnerArr);
    setValidationArray(newValidArr);
  };

  const setDefaultAgencyNCode = (checked: boolean) => {
    if (checked) {
      handleInputChange(DEFAULT_INDEX, 'ownerCode', defaultCode, 'ownerAgency', defaultAgency);
      setDisableInputs(true);
    } else {
      handleInputChange(DEFAULT_INDEX, 'ownerCode', '', 'ownerAgency', '');
      setDisableInputs(false);
    }
  };

  const addRefs = (element: HTMLInputElement, id: number, name: string) => {
    if (element !== null) {
      refControl.current[id] = {
        ...refControl.current[id],
        [name]: element
      };
    }
  };

  const toggleAccordion = (id: number, isOpen: boolean) => {
    const newAccCtrls = { ...accordionControls };
    newAccCtrls[id] = isOpen;
    setAccordionControls(newAccCtrls);
  };

  // Leaving these here for future use
  // const areAllInputsValid = (): boolean => {
  //   const {
  //     allValid,
  //     invalidId,
  //     invalidField,
  //     invalidValue,
  //     ownerOk
  //   } = getInvalidIdAndKey(state, validationArray);
  //   if (!allValid) {
  //     if (!ownerOk) {
  //       validateInput(invalidId, invalidField, invalidValue);
  //     }
  //     toggleAccordion(invalidId, true);
  //     refControl.current[invalidId][invalidField].focus();
  //     return false;
  //   }
  //   return true;
  // };

  return (
    <div>
      {(!readOnly) && (
      <div className="ownership-header">
        <div className="ownership-step-title-box">
          <h3>
            Ownership
          </h3>
          <p>
            Enter the seedlot&apos;s ownership information, the agencies listed as
            owners are the ones who are charged for cone and seed processing fees
          </p>
        </div>
      </div>
      )}

      <div className="ownership-form-container">
        <Accordion className="steps-accordion">
          {
            state.map((singleOwnerInfo) => (
              <AccordionItem
                className="single-accordion-item"
                key={`${singleOwnerInfo.id}`}
                open={
                  Object.prototype.hasOwnProperty.call(accordionControls, singleOwnerInfo.id)
                    ? accordionControls[singleOwnerInfo.id]
                    : true
                }
                onHeadingClick={
                  (e: AccordionItemHeadClick) => {
                    toggleAccordion(singleOwnerInfo.id, e.isOpen);
                  }
                }
                title={(
                  <TitleAccordion
                    title={singleOwnerInfo.ownerAgency === ''
                      ? 'Owner agency name'
                      : getAgencyName(singleOwnerInfo.ownerAgency)}
                    description={`${formatPortionPerc(singleOwnerInfo.ownerPortion)}% owner portion`}
                  />
                )}
              >
                <SingleOwnerInfo
                  ownerInfo={singleOwnerInfo}
                  agencyOptions={agencyOptions}
                  fundingSources={fundingSources}
                  methodsOfPayment={paymentMethods}
                  disableInputs={disableInputs}
                  addRefs={(element: HTMLInputElement, name: string) => {
                    addRefs(element, singleOwnerInfo.id, name);
                  }}
                  validationProp={validationArray[singleOwnerInfo.id]}
                  handleInputChange={
                    (name: string, value: string) => {
                      handleInputChange(singleOwnerInfo.id, name, value);
                    }
                  }
                  setDefaultAgencyNCode={
                    (checked: boolean) => setDefaultAgencyNCode(checked)
                  }
                  addAnOwner={addAnOwner}
                  deleteAnOwner={(id: number) => deleteAnOwner(id)}
                  readOnly={readOnly}
                />
              </AccordionItem>
            ))
          }
        </Accordion>
      </div>
    </div>
  );
};

export default OwnershipStep;
