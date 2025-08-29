import React, { useContext } from 'react';
import { Row, Button, Loading } from '@carbon/react';
import { Calculator } from '@carbon/icons-react';
import { useMutation } from '@tanstack/react-query';

import ClassAContext from '../../../views/Seedlot/ContextContainerClassA/context';
import { PtValsCalcReqPayload } from '../../../types/PtCalcTypes';
import postForCalculation from '../../../api-service/parentTreeAPI';
import { fillCalculatedInfo, generatePtValCalcPayload, getParentTreesForSelectedOrchards } from './utils';

type props = {
  disableOptions: boolean,
  setShowInfoSections: React.Dispatch<React.SetStateAction<boolean>>,
  isReview?: boolean
}

const CalculateMetrics = ({ disableOptions, setShowInfoSections, isReview }: props) => {
  const {
    allStepData: { parentTreeStep: state },
    allStepData: { orchardStep },
    genWorthInfoItems,
    setGenWorthInfoItems,
    seedlotSpecies,
    isFormSubmitted,
    popSizeAndDiversityConfig,
    setPopSizeAndDiversityConfig,
    setMeanGeomInfos,
    setIsCalculatingPt,
    setGeoInfoVals,
    setGenWorthVal,
    weightedGwInfoItems
  } = useContext(ClassAContext);

  const smpBV: Record<keyof typeof weightedGwInfoItems, any> = Object.keys(
    weightedGwInfoItems
  ).reduce((acc, key) => {
    acc[key as keyof typeof weightedGwInfoItems] = null;
    return acc;
  }, {} as Record<keyof typeof weightedGwInfoItems, any>);

  Object.keys(weightedGwInfoItems).forEach((key) => {
    const typedKey = key as keyof typeof weightedGwInfoItems;
    const item = weightedGwInfoItems[typedKey];
    smpBV[typedKey] = Number(item.value);
  });

  if (isFormSubmitted && !isReview) {
    return null;
  }

  const calculateGenWorthQuery = useMutation({
    mutationFn: (data: PtValsCalcReqPayload) => postForCalculation(data),
    onSuccess: (res) => fillCalculatedInfo(
      res.data,
      genWorthInfoItems,
      setGenWorthInfoItems,
      popSizeAndDiversityConfig,
      setPopSizeAndDiversityConfig,
      setMeanGeomInfos,
      setIsCalculatingPt,
      setGeoInfoVals,
      setGenWorthVal,
      isReview
    )
  });

  return (
    <Row className="gen-worth-cal-row">
      <Button
        size="md"
        kind="tertiary"
        renderIcon={
          () => (
            <div className="gw-calc-loading-icon">
              {
                calculateGenWorthQuery.isPending
                  ? <Loading withOverlay={false} small />
                  : <Calculator />
              }
            </div>
          )
        }
        disabled={disableOptions}
        onClick={() => {
          setIsCalculatingPt(true);
          calculateGenWorthQuery.mutate(
            generatePtValCalcPayload(
              state,
              seedlotSpecies,
              getParentTreesForSelectedOrchards(
                orchardStep,
                state.allParentTreeData
              ),
              smpBV,
              orchardStep.breedingPercentage.value
            )
          );

          if (!isReview) {
            setShowInfoSections((show) => {
              if (!show) {
                return !show;
              }
              return show;
            });
          }
        }}
      >
        {
          `${isReview ? 'Recalculate' : 'Calculate'} metrics`
        }
      </Button>
    </Row>
  );
};

export default CalculateMetrics;
