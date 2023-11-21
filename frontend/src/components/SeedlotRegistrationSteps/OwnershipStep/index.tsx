import React, { useState, useRef, useEffect } from 'react';
import {
  Accordion,
  AccordionItem,
  Button
} from '@carbon/react';
import { Add } from '@carbon/icons-react';

import TitleAccordion from '../../TitleAccordion';
import SingleOwnerInfo from './SingleOwnerInfo';

import {
  StateReturnObj,
  AccordionCtrlObj,
  AccordionItemHeadClick,
  OwnershipStepProps,
  SingleOwnerForm
} from './definitions';
import {
  insertOwnerForm,
  deleteOwnerForm,
  getAgencyName,
  formatPortionPerc,
  arePortionsValid
} from './utils';
import {
  DEFAULT_INDEX,
  MAX_OWNERS
} from './constants';

import './styles.scss';

/*
  Component
*/
const OwnershipStep = (
  {
    state,
    setStepData,
    invalidState,
    defaultCode,
    defaultAgency,
    agencyOptions,
    readOnly,
    fundingSources,
    methodsOfPayment
  }: OwnershipStepProps
) => {
  const [accordionControls, setAccordionControls] = useState<AccordionCtrlObj>({});

  const refControl = useRef<any>({});

  const setPortionsValid = (updatedArray: SingleOwnerForm[], isInvalid: boolean) => {
    const clonedArray = structuredClone(updatedArray);
    for (let i = 0; i < updatedArray.length; i += 1) {
      clonedArray[i].ownerPortion.isInvalid = isInvalid;
    }
    setStepData(clonedArray);
  };

  const addAnOwner = () => {
    // Maximum # of ownership can be set
    if (state.length >= MAX_OWNERS) {
      return;
    }
    const newOwnerArr = insertOwnerForm(state, methodsOfPayment);
    setStepData(newOwnerArr);
  };

  const deleteAnOwner = (id: number) => {
    const {
      newOwnerArr
    }: StateReturnObj = deleteOwnerForm(id, state, invalidState);
    delete refControl.current[id];
    const portionsInvalid = !arePortionsValid(newOwnerArr);
    setPortionsValid(newOwnerArr, portionsInvalid);
  };

  useEffect(() => {
    const useDefault = state[DEFAULT_INDEX].useDefaultAgencyInfo.value;
    const agencyValue = useDefault ? defaultAgency : state[DEFAULT_INDEX].ownerAgency.value;
    const codeValue = useDefault ? defaultCode : state[DEFAULT_INDEX].ownerCode.value;

    const clonedState = structuredClone(state);
    clonedState[DEFAULT_INDEX].ownerAgency.value = agencyValue;
    clonedState[DEFAULT_INDEX].ownerCode.value = codeValue;
    setStepData(clonedState);
  }, [defaultAgency, defaultCode]);

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

  const checkPortionSum = (updatedEntry: SingleOwnerForm, entryId: number) => {
    const clonedState = structuredClone(state);
    clonedState[entryId] = updatedEntry;
    const portionsInvalid = !arePortionsValid(clonedState);
    setPortionsValid(clonedState, portionsInvalid);
  };

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
                    title={singleOwnerInfo.ownerAgency.value === ''
                      ? 'Owner agency name'
                      : getAgencyName(singleOwnerInfo.ownerAgency.value)}
                    description={`${formatPortionPerc(singleOwnerInfo.ownerPortion.value)}% owner portion`}
                  />
                )}
              >
                <SingleOwnerInfo
                  ownerInfo={singleOwnerInfo}
                  agencyOptions={agencyOptions}
                  defaultAgency={defaultAgency}
                  defaultCode={defaultCode}
                  fundingSources={fundingSources}
                  methodsOfPayment={methodsOfPayment}
                  addRefs={(element: HTMLInputElement, name: string) => {
                    addRefs(element, singleOwnerInfo.id, name);
                  }}
                  deleteAnOwner={(id: number) => deleteAnOwner(id)}
                  setState={(singleState: SingleOwnerForm, id: number) => {
                    const arrayClone = structuredClone(state);
                    arrayClone[id] = singleState;
                    setStepData(arrayClone);
                  }}
                  checkPortionSum={
                    (updtEntry: SingleOwnerForm, id: number) => checkPortionSum(updtEntry, id)
                  }
                  readOnly={readOnly}
                />
              </AccordionItem>
            ))
          }
        </Accordion>
        <Button
          kind="tertiary"
          size="md"
          className="owner-add-btn"
          renderIcon={Add}
          onClick={addAnOwner}
        >
          Add owner
        </Button>
      </div>
    </div>
  );
};

export default OwnershipStep;
