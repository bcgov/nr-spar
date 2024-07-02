import React, { useContext } from 'react';
import {
  Row, Column, TextInput, TextInputSkeleton
} from '@carbon/react';
import ClassAContext from '../../../views/Seedlot/ContextContainerClassA/context';
import { formatEmptyStr } from '../../SeedlotReviewSteps/ParentTrees/utils';
import ReadOnlyInput from '../../ReadOnlyInput';
import { getOutsideParentTreeNum } from './utils';

const PopSize = () => {
  const {
    isCalculatingPt,
    geoInfoVals,
    setGeoInfoVal,
    allStepData
  } = useContext(ClassAContext);

  return (
    <Row>
      <Column className="info-col" sm={4} md={4} lg={4}>
        {
          isCalculatingPt
            ? <TextInputSkeleton />
            : (
              <TextInput
                id={geoInfoVals.effectivePopSize.id}
                labelText="Effective population size"
                type="number"
                defaultValue={formatEmptyStr(geoInfoVals.effectivePopSize.value, true)}
                onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setGeoInfoVal('effectivePopSize', e.target.value);
                }}
              />
            )
        }
      </Column>
      <Column className="info-col" sm={4} md={4} lg={4}>
        <ReadOnlyInput
          id="smp-parents-from-outside"
          label="Number of SMP parents from outside"
          value={
            formatEmptyStr(getOutsideParentTreeNum(allStepData.parentTreeStep), true)
          }
          showSkeleton={isCalculatingPt}
        />
      </Column>
    </Row>
  );
};

export default PopSize;
