import React, { useContext } from 'react';
import { Row, Button, Loading } from '@carbon/react';
import { Calculator } from '@carbon/icons-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import ClassAContext from '../../../views/Seedlot/ContextContainerClassA/context';
import { PtValsCalcReqPayload } from '../../../types/PtCalcTypes';
import postForCalculation from '../../../api-service/parentTreeAPI';
import ErrorToast from '../../Toast/ErrorToast';
import { ErrToastOption } from '../../../config/ToastifyConfig';
import {
  fillCalculatedInfo,
  generatePtValCalcPayload,
  getParentTreesForSelectedOrchards
} from './utils';

import { WeightedGwKey, CalculateMetricsProps } from './definitions';

const CalculateMetrics = ({
  disableOptions,
  setShowInfoSections,
  isReview
}: CalculateMetricsProps) => {
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

  const smpBv: Record<WeightedGwKey, number> = Object.entries(weightedGwInfoItems).reduce(
    (acc, [key, item]) => {
      acc[key as WeightedGwKey] = Number(item.value);
      return acc;
    },
  {} as Record<WeightedGwKey, number>
  );

  if (isFormSubmitted && !isReview) {
    return null;
  }

  const calculateGenWorthQuery = useMutation({
    // Build the payload inside mutationFn so a validation throw (e.g. a row with no
    // parentTreeId) lands in onError instead of escaping the click handler.
    mutationFn: (buildPayload: () => PtValsCalcReqPayload) => postForCalculation(buildPayload()),
    onError: (err: Error) => {
      setIsCalculatingPt(false);
      toast.error(
        <ErrorToast title="Calculate metrics failed" subtitle={err.message} />,
        ErrToastOption
      );
    },
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
        renderIcon={() => (
          <div className="gw-calc-loading-icon">
            {calculateGenWorthQuery.isPending ? (
              <Loading withOverlay={false} small />
            ) : (
              <Calculator />
            )}
          </div>
        )}
        disabled={disableOptions}
        onClick={() => {
          setIsCalculatingPt(true);
          calculateGenWorthQuery.mutate(
            () => generatePtValCalcPayload(
              state,
              seedlotSpecies,
              getParentTreesForSelectedOrchards(
                orchardStep,
                state.allParentTreeData
              ),
              smpBv,
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
        {`${isReview ? 'Recalculate' : 'Calculate'} metrics`}
      </Button>
    </Row>
  );
};

export default CalculateMetrics;
