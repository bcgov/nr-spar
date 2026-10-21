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
import { ForestClientType } from '../../../types/ForestClientTypes/ForestClientType';
import { getForestClientByNumberOrAcronym } from '../../../api-service/forestClientsAPI';
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
const OwnershipStep = ({ isReview = false }: OwnershipStepProps) => {
  const {
    allStepData: { ownershipStep: state },
    setStepData,
    defaultClientNumber: defaultAgency,
    defaultCode,
    isFormSubmitted,
    seedlotNumber,
    fundingSourcesQuery,
    methodsOfPaymentQuery
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

  const getSeedlotBySeedlotNumberQuery = useQuery({
    queryKey: ['get-seedlot-by-seedlotNumber', seedlotNumber],
    queryFn: () => getSeedlotFromOracleDbBySeedlotNumber(seedlotNumber ?? ''),
    enabled: isReview && !!seedlotNumber
  });

  const addAnOwner = () => {
    // Maximum # of ownership can be set
    if (state.length >= MAX_OWNERS) {
      return;
    }
    const newOwnerArr = insertOwnerForm(state);
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

  const originalSeedQty = getSeedlotBySeedlotNumberQuery.data?.data?.originalSeedQty ?? 0;
  // The query is disabled off the review screen, so only wait for it there.
  // A disabled query never becomes successful and would lock the wizard.
  const seedQtyPending = isReview && !getSeedlotBySeedlotNumberQuery.isSuccess;
  const ownershipLocked = seedQtyPending || originalSeedQty > 0;

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
                  readOnly={(isFormSubmitted && !isReview) || ownershipLocked}
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
                disabled={ownershipLocked}
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
