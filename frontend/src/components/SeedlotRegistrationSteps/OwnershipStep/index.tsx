import React, { useState, useRef } from 'react';
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
  formatPortionPerc,
  arePortionsValid
} from './utils';
import { MAX_OWNERS } from './constants';

import './styles.scss';

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
    }: StateReturnObj = deleteOwnerForm(id, state);
    delete refControl.current[id];
    const portionsInvalid = !arePortionsValid(newOwnerArr);
    setPortionsValid(newOwnerArr, portionsInvalid);
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
                    title={singleOwnerInfo.ownerAgency.value.label === ''
                      ? 'Owner agency name'
                      : singleOwnerInfo.ownerAgency.value.description}
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
