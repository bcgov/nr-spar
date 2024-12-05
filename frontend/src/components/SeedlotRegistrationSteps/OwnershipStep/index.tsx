import React, {
  useState, useRef, useContext,
  useEffect
} from 'react';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Accordion,
  AccordionItem,
  Button
} from '@carbon/react';
import { Add } from '@carbon/icons-react';

import ClassAContext from '../../../views/Seedlot/ContextContainerClassA/context';
import getMethodsOfPayment from '../../../api-service/methodsOfPaymentAPI';
import { ForestClientType } from '../../../types/ForestClientTypes/ForestClientType';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { getForestClientByNumberOrAcronym } from '../../../api-service/forestClientsAPI';
import { EmptyMultiOptObj } from '../../../shared-constants/shared-constants';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../config/TimeUnits';
import { getMultiOptList } from '../../../utils/MultiOptionsUtils';
import getFundingSources from '../../../api-service/fundingSourcesAPI';
import { getSeedlotFromOracleDbBySeedlotNumber } from '../../../api-service/seedlotAPI';
import TitleAccordion from '../../TitleAccordion';
import ScrollToTop from '../../ScrollToTop';
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
    defaultClientNumber: defaultAgency,
    defaultCode,
    isFormSubmitted,
    seedlotNumber
  } = useContext(ClassAContext);

  const [accordionControls, setAccordionControls] = useState<AccordionCtrlObj>({});
  const [originalSeedQty, setOriginalSeedQty] = useState<number>(0);

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
    select: (data) => getMultiOptList(data, true, false, true, ['isDefault']),
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  const getSeedlotBySeedlotNumberQuery = useQuery(
    ['get-seedlot-by-seedlotNumber', seedlotNumber],
    () => getSeedlotFromOracleDbBySeedlotNumber(seedlotNumber ?? ''),
    { enabled: !!seedlotNumber && !isReview }
  );

  // Set default method of payment for the first owner.
  useEffect(() => {
    if (methodsOfPaymentQuery.status === 'success') {
      const methods = methodsOfPaymentQuery.data;
      const defaultMethodArr = methods.filter((data: MultiOptionsObj) => data.isDefault);
      const defaultMethod = defaultMethodArr.length === 0 ? EmptyMultiOptObj : defaultMethodArr[0];
      if (!state[0].methodOfPayment.value?.code && !state[0].methodOfPayment.hasChanged) {
        const tempOwnershipData = structuredClone(state);
        tempOwnershipData[0].methodOfPayment.value = defaultMethod;
        setStepData('ownershipStep', tempOwnershipData);
      }
    }
  }, [methodsOfPaymentQuery.status, methodsOfPaymentQuery.fetchStatus]);

  const addAnOwner = () => {
    // Maximum # of ownership can be set
    if (state.length >= MAX_OWNERS) {
      return;
    }
    const newOwnerArr = insertOwnerForm(state, methodsOfPaymentQuery.data ?? []);
    const portionsInvalid = !arePortionsValid(newOwnerArr);
    setPortionsValid(newOwnerArr, portionsInvalid);
  };

  const qc = useQueryClient();

  useQueries({
    queries: state.map((singleOwner) => ({
      queryKey: ['forest-clients', singleOwner.ownerAgency.value],
      queryFn: () => getForestClientByNumberOrAcronym(singleOwner.ownerAgency.value),
      enabled: !!singleOwner.ownerAgency.value
    }))
  });

  useEffect(() => {
    if (getSeedlotBySeedlotNumberQuery.status === 'success') {
      setOriginalSeedQty(getSeedlotBySeedlotNumberQuery.data.data.originalSeedQty);
    }
  }, [getSeedlotBySeedlotNumberQuery.status, getSeedlotBySeedlotNumberQuery.fetchStatus]);

  const getFcQuery = (clientNumber: string): ForestClientType | undefined => qc.getQueryData(['forest-clients', clientNumber]);

  return (
    <div>
      <ScrollToTop enabled={!isReview} />
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
                      singleOwnerInfo.ownerAgency.value === ''
                        ? 'Owner agency name'
                        : getOwnerAgencyTitle(getFcQuery(singleOwnerInfo.ownerAgency.value))
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
                  readOnly={isFormSubmitted || originalSeedQty > 0}
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
                disabled={originalSeedQty > 0}
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
