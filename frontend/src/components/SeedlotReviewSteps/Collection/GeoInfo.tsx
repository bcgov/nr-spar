import React, { useContext } from 'react';
import {
  Row, Column, TextInput, TextInputSkeleton
} from '@carbon/react';

import ClassAContext from '../../../views/Seedlot/ContextContainerClassA/context';
import { GeoInfoValType } from '../../../views/Seedlot/SeedlotReview/definitions';
import { PLACE_HOLDER } from '../../../shared-constants/shared-constants';
import ReadOnlyInput from '../../ReadOnlyInput';
import {
  validateDegreeRange, validateElevationRange, validateMinuteOrSecondRange
} from '../AreaOfUse/utils';

import { formatEmptyStr, validateEffectivePopSize } from './utils';

type props = {
  isRead?: boolean;
}

const GeoInfo = ({ isRead }: props) => {
  const {
    isFetchingData, geoInfoVals, setGeoInfoInputObj,
    seedlotData, richSeedlotData, seedlotSpecies
  } = useContext(ClassAContext);

  const formatLatLong = (isLat: boolean): string => {
    let formatted = PLACE_HOLDER;
    if (geoInfoVals) {
      const degree = isLat
        ? geoInfoVals.meanLatDeg.value : geoInfoVals.meanLongDeg.value;
      const minute = isLat
        ? geoInfoVals.meanLatMinute.value : geoInfoVals.meanLongMinute.value;
      const second = isLat
        ? geoInfoVals.meanLatSec.value : geoInfoVals.meanLongSec.value;

      formatted = `${Number(degree)}° ${Number(minute)}' ${Number(second)}"`;
    }

    return formatted;
  };

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

    // Validate Ne [0.1, 999.9]
    if (key === 'effectivePopSize') {
      newObj = validateEffectivePopSize(newObj);
    }

    setGeoInfoInputObj(key, newObj);
  };

  const renderLatLong = (isLat: boolean) => {
    const latLongStr = isLat ? 'latitude' : 'longitude';
    const degKey: keyof GeoInfoValType = isLat ? 'meanLatDeg' : 'meanLongDeg';
    const minuteKey: keyof GeoInfoValType = isLat ? 'meanLatMinute' : 'meanLongMinute';
    const secKey: keyof GeoInfoValType = isLat ? 'meanLatSec' : 'meanLongSec';

    if (isRead || isFetchingData) {
      return (
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id={`geo-info-mean-${latLongStr}`}
            label={`Mean ${latLongStr} of parent tree`}
            value={formatLatLong(isLat)}
            showSkeleton={isFetchingData}
          />
        </Column>
      );
    }

    return (
      <>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <TextInput
            id={`geo-info-mean-${latLongStr}-deg`}
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
            id={`geo-info-mean-${latLongStr}-minute`}
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
            id={`geo-info-mean-${latLongStr}-sec`}
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
        <Column className="sub-section-title-col">
          Geographic information
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="geo-info-bec-zone"
            label="BEC zone"
            value={seedlotData ? `${seedlotData.bgcZoneCode} - ${seedlotData.bgcZoneDescription}` : PLACE_HOLDER}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="geo-info-bec-sub-zone"
            label="Subzone"
            value={seedlotData?.bgcSubzoneCode ?? PLACE_HOLDER}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="geo-info-bec-variant"
            label="Variant"
            value={seedlotData?.variant ?? PLACE_HOLDER}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="geo-info-primary-spu"
            label="Primary seed planning unit"
            value={
              `${seedlotSpecies.code} ${richSeedlotData?.primarySpu?.seedPlanZoneCode} ${richSeedlotData?.primarySpu?.elevationBand}`
            }
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          {
            isFetchingData
              ? <TextInputSkeleton />
              : (
                <TextInput
                  id={geoInfoVals.meanElevation.id}
                  type="number"
                  labelText="Mean elevation of parent tree (m)"
                  defaultValue={formatEmptyStr(geoInfoVals.meanElevation.value, isRead ?? false)}
                  readOnly={isRead}
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
            isFetchingData
              ? <TextInputSkeleton />
              : (
                <TextInput
                  id={geoInfoVals.effectivePopSize.id}
                  type="number"
                  labelText="Effective population size"
                  defaultValue={formatEmptyStr(geoInfoVals.effectivePopSize.value, isRead ?? false)}
                  readOnly={isRead}
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
      </Row>
    </>
  );
};

export default GeoInfo;
