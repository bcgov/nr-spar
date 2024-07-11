import React, {
  useState, useRef, useContext
} from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Accordion,
  AccordionItem,
  Button
} from '@carbon/react';
import { Add } from '@carbon/icons-react';

import ClassAContext from '../../../views/Seedlot/ContextContainerClassA/context';
import getMethodsOfPayment from '../../../api-service/methodsOfPaymentAPI';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { EmptyMultiOptObj } from '../../../shared-constants/shared-constants';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../config/TimeUnits';
import { getMultiOptList } from '../../../utils/MultiOptionsUtils';
import getFundingSources from '../../../api-service/fundingSourcesAPI';
import TitleAccordion from '../../TitleAccordion';
import SingleOwnerInfo from './SingleOwnerInfo';

import {
  StateReturnObj,
  AccordionCtrlObj,
  AccordionItemHeadClick,
  SingleOwnerForm
} from './definitions';
import {
  insertOwnerForm,
  deleteOwnerForm,
  formatPortionPerc,
  arePortionsValid,
  getOwnerAgencyTitle
} from './utils';
import { MAX_OWNERS } from './constants';

import './styles.scss';

type OwnershipStepProps = {
  isReview?: boolean
}

/*
  Component
*/
const OwnershipStep = ({ isReview }: OwnershipStepProps) => {
  const {
    allStepData: { ownershipStep: state },
    setStepData,
    defaultAgencyObj: defaultAgency,
    defaultCode,
    isFormSubmitted
  } = useContext(ClassAContext);

  const [accordionControls, setAccordionControls] = useState<AccordionCtrlObj>({});

  const refControl = useRef<any>({});

  const setPortionsValid = (updatedArray: SingleOwnerForm[], isInvalid: boolean) => {
    const clonedArray = structuredClone(updatedArray);
    for (let i = 0; i < updatedArray.length; i += 1) {
      clonedArray[i].ownerPortion.isInvalid = isInvalid;
    }
    setStepData('ownershipStep', clonedArray);
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

  const fundingSourcesQuery = useQuery({
    queryKey: ['funding-sources'],
    queryFn: getFundingSources,
    select: (data) => getMultiOptList(data),
    enabled: !isFormSubmitted,
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  const methodsOfPaymentQuery = useQuery({
    queryKey: ['methods-of-payment'],
    queryFn: getMethodsOfPayment,
    onSuccess: (dataArr: MultiOptionsObj[]) => {
      const defaultMethodArr = dataArr.filter((data: MultiOptionsObj) => data.isDefault);
      const defaultMethod = defaultMethodArr.length === 0 ? EmptyMultiOptObj : defaultMethodArr[0];
      if (!state[0].methodOfPayment.value.code && !state[0].methodOfPayment.hasChanged) {
        const tempOwnershipData = structuredClone(state);
        tempOwnershipData[0].methodOfPayment.value = defaultMethod;
        setStepData('ownershipStep', tempOwnershipData);
      }
    },
    select: (data) => getMultiOptList(data, true, false, true, ['isDefault']),
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  const addAnOwner = () => {
    // Maximum # of ownership can be set
    if (state.length >= MAX_OWNERS) {
      return;
    }
    const newOwnerArr = insertOwnerForm(state, methodsOfPaymentQuery.data ?? []);
    setStepData('ownershipStep', newOwnerArr);
  };

  return (
    <div>
      <div className="ownership-header">
        <div className="ownership-step-title-box">
          {
            isReview
              ? null
              : (
                <>
                  <h3>
                    Ownership
                  </h3>
                  <p>
                    Enter the seedlot&apos;s ownership information, the agencies listed as
                    owners are the ones who are charged for cone and seed processing fees
                  </p>
                </>
              )
          }
        </div>
      </div>
      <div className="ownership-form-container">
        <Accordion className="steps-accordion">
          {
            state.map((singleOwnerInfo) => (
              <AccordionItem
                className="single-accordion-item"
                key={`${singleOwnerInfo.id}`}
                id={`ownership-accordion-item-${singleOwnerInfo.id}`}
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
                    title={
                      singleOwnerInfo.ownerAgency.value.label === ''
                        ? 'Owner agency name'
                        : getOwnerAgencyTitle(singleOwnerInfo.ownerAgency.value.description)
                    }
                    description={`${formatPortionPerc(singleOwnerInfo.ownerPortion.value)}% owner portion`}
                  />
                )}
              >
                <SingleOwnerInfo
                  ownerInfo={singleOwnerInfo}
                  defaultAgency={defaultAgency}
                  defaultCode={defaultCode}
                  fundingSourcesQuery={fundingSourcesQuery}
                  methodsOfPaymentQuery={methodsOfPaymentQuery}
                  deleteAnOwner={(id: number) => deleteAnOwner(id)}
                  setState={(singleState: SingleOwnerForm, id: number) => {
                    const arrayClone = structuredClone(state);
                    arrayClone[id] = singleState;
                    setStepData('ownershipStep', arrayClone);
                  }}
                  checkPortionSum={
                    (updtEntry: SingleOwnerForm, id: number) => checkPortionSum(updtEntry, id)
                  }
                  readOnly={isFormSubmitted}
                  isReview={isReview}
                />
              </AccordionItem>
            ))
          }
        </Accordion>
        {
          !isFormSubmitted || isReview
            ? (
              <Button
                kind="tertiary"
                size="md"
                className="owner-add-btn"
                renderIcon={Add}
                onClick={addAnOwner}
              >
                Add owner
              </Button>
            )
            : null
        }
      </div>
    </div>
  );
};

export default OwnershipStep;
