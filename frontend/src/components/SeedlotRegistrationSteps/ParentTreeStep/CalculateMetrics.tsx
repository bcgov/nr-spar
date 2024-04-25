import React, { useContext } from 'react';
import { Row, Button, Loading } from '@carbon/react';
import { Calculator } from '@carbon/icons-react';
import { useMutation } from '@tanstack/react-query';

import ClassAContext from '../../../views/Seedlot/ContextContainerClassA/context';
import { PtValsCalcReqPayload } from '../../../types/PtCalcTypes';
import postForCalculation from '../../../api-service/parentTreeAPI';
import { fillCalculatedInfo, generatePtValCalcPayload } from './utils';
import { geneticWorthDict } from './constants';

type props = {
  disableOptions: boolean,
  name: string,
  setShowInfoSections: React.Dispatch<React.SetStateAction<boolean>>
}

const CalculateMetrics = ({ disableOptions, name, setShowInfoSections }: props) => {
  const {
    allStepData: { parentTreeStep: state },
    genWorthInfoItems,
    setGenWorthInfoItems,
    seedlotSpecies,
    isFormSubmitted,
    popSizeAndDiversityConfig,
    setPopSizeAndDiversityConfig,
    meanGeomInfos,
    setMeanGeomInfos
  } = useContext(ClassAContext);

  if (isFormSubmitted) {
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
      meanGeomInfos,
      setMeanGeomInfos
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
                calculateGenWorthQuery.isLoading
                  ? <Loading withOverlay={false} small />
                  : <Calculator />
              }
            </div>
          )
        }
        disabled={disableOptions}
        onClick={() => {
          calculateGenWorthQuery.mutate(
            generatePtValCalcPayload(
              state,
              geneticWorthDict,
              seedlotSpecies
            )
          );

          setShowInfoSections((show) => {
            if (!show) {
              return !show;
            }
            return show;
          });
        }}
      >
        {name}
      </Button>
    </Row>
  );
};

export default CalculateMetrics;
