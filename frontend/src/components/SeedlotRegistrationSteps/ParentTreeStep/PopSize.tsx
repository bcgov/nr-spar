import React, { useContext } from 'react';
import {
  Row, Column, TextInput, TextInputSkeleton
} from '@carbon/react';
import ClassAContext from '../../../views/Seedlot/ContextContainerClassA/context';
import { GeoInfoValType } from '../../../views/Seedlot/SeedlotReview/definitions';
import { formatEmptyStr } from '../../SeedlotReviewSteps/ParentTrees/utils';
import ReadOnlyInput from '../../ReadOnlyInput';
import { getOutsideParentTreeNum, validateEffectivePopSize } from './utils';

const PopSize = () => {
  const {
    isFetchingData,
    isCalculatingPt,
    geoInfoVals,
    setGeoInfoInputObj,
    allStepData
  } = useContext(ClassAContext);

  const handleInput = (key: keyof GeoInfoValType, value: string | null) => {
    let newObj = structuredClone(geoInfoVals[key]);

    newObj.value = value ?? '';

    // Validate Ne [0.1, 999.9]
    if (key === 'effectivePopSize') {
      newObj = validateEffectivePopSize(newObj);
    }

    setGeoInfoInputObj(key, newObj);
  };

  return (
    <Row>
      <Column className="info-col" sm={4} md={4} lg={4}>
        {
          isFetchingData || isCalculatingPt
            ? <TextInputSkeleton />
            : (
              <TextInput
                id={geoInfoVals.effectivePopSize.id}
                type="number"
                labelText="Effective population size"
                defaultValue={formatEmptyStr(geoInfoVals.effectivePopSize.value, true)}
                onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
                onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleInput('effectivePopSize', e.target.value);
                }}
                invalid={geoInfoVals.effectivePopSize.isInvalid}
                invalidText={geoInfoVals.effectivePopSize.errMsg}
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
          showSkeleton={isFetchingData || isCalculatingPt}
        />
      </Column>
    </Row>
  );
};

export default PopSize;
