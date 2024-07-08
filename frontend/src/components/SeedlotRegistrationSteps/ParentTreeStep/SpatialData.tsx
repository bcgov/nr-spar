import React, { useContext } from 'react';
import {
  Row, Column, TextInput, TextInputSkeleton
} from '@carbon/react';
import ClassAContext from '../../../views/Seedlot/ContextContainerClassA/context';
import { GeoInfoValType } from '../../../views/Seedlot/SeedlotReview/definitions';
import { formatEmptyStr } from '../../SeedlotReviewSteps/ParentTrees/utils';
import {
  validateElevationRange, validateDegreeRange, validateMinuteOrSecondRange
} from '../../SeedlotReviewSteps/AreaOfUse/utils';
import ReadOnlyInput from '../../ReadOnlyInput';

/**
 * Colletion
 */
const SpatialData = ({ isReviewRead }: { isReviewRead: boolean }) => {
  const {
    isFetchingData,
    isCalculatingPt,
    geoInfoVals,
    setGeoInfoInputObj
  } = useContext(ClassAContext);

  if (isReviewRead) {
    return (
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="collection-mean-lat"
            label="Mean latitude"
            value={`${geoInfoVals.meanLatDeg.value}° ${geoInfoVals.meanLatMinute.value}' ${geoInfoVals.meanLatSec.value}"`}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="collection-mean-long"
            label="Mean longitude"
            value={`${geoInfoVals.meanLongDeg.value}° ${geoInfoVals.meanLongMinute.value}' ${geoInfoVals.meanLongSec.value}"`}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="collection-mean-elev"
            label="Mean elevation"
            value={`${geoInfoVals.meanElevation.value} m`}
          />
        </Column>
      </Row>
    );
  }

  const handleInput = (key: keyof GeoInfoValType, value: string | null) => {
    let newObj = structuredClone(geoInfoVals[key]);

    newObj.value = value ?? '';

    // Validate Elevation
    if (key === 'meanElevation') {
      newObj = validateElevationRange(newObj);
    }

    // Validate Degree
    if (key === 'meanLatDeg' || key === 'meanLongDeg') {
      const isLat = key === 'meanLatDeg';
      newObj = validateDegreeRange(newObj, isLat);
    }

    // Validate Minute and Second
    if (key === 'meanLatMinute' || key === 'meanLongMinute'
      || key === 'meanLatSec' || key === 'meanLongSec'
    ) {
      newObj = validateMinuteOrSecondRange(newObj);
    }

    setGeoInfoInputObj(key, newObj);
  };

  const renderLatLong = (isLat: boolean) => {
    const latLongStr = isLat ? 'latitude' : 'longitude';
    const degKey: keyof GeoInfoValType = isLat ? 'meanLatDeg' : 'meanLongDeg';
    const minuteKey: keyof GeoInfoValType = isLat ? 'meanLatMinute' : 'meanLongMinute';
    const secKey: keyof GeoInfoValType = isLat ? 'meanLatSec' : 'meanLongSec';

    if (isCalculatingPt || isFetchingData) {
      return (
        <Column className="info-col" sm={4} md={4} lg={4}>
          <TextInputSkeleton />
        </Column>
      );
    }

    return (
      <>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <TextInput
            id={geoInfoVals[degKey].id}
            type="number"
            labelText={`Mean ${latLongStr} degree`}
            defaultValue={geoInfoVals[degKey].value}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleInput(degKey, e.target.value);
            }}
            invalid={geoInfoVals[degKey].isInvalid}
            invalidText={geoInfoVals[degKey].errMsg}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <TextInput
            id={geoInfoVals[minuteKey].id}
            type="number"
            labelText={`Mean ${latLongStr} minute`}
            defaultValue={geoInfoVals[minuteKey].value}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleInput(minuteKey, e.target.value);
            }}
            invalid={geoInfoVals[minuteKey].isInvalid}
            invalidText={geoInfoVals[minuteKey].errMsg}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <TextInput
            id={geoInfoVals[secKey].id}
            type="number"
            labelText={`Mean ${latLongStr} second`}
            defaultValue={geoInfoVals[secKey].value}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleInput(secKey, e.target.value);
            }}
            invalid={geoInfoVals[secKey].isInvalid}
            invalidText={geoInfoVals[secKey].errMsg}
          />
        </Column>
      </>
    );
  };

  return (
    <>
      <Row>
        {
          renderLatLong(true)
        }
      </Row>
      <Row>
        {
          renderLatLong(false)
        }
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          {
            isFetchingData || isCalculatingPt
              ? <TextInputSkeleton />
              : (
                <TextInput
                  id={geoInfoVals.meanElevation.id}
                  type="number"
                  labelText="Mean elevation of parent tree (m)"
                  defaultValue={formatEmptyStr(geoInfoVals.meanElevation.value, true)}
                  onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleInput('meanElevation', e.target.value);
                  }}
                  invalid={geoInfoVals.meanElevation.isInvalid}
                  invalidText={geoInfoVals.meanElevation.errMsg}
                />
              )
          }
        </Column>
      </Row>
    </>
  );
};

export default SpatialData;
