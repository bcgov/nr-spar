import React, { useContext } from 'react';
import {
  Row, Column, TextInput, TextInputSkeleton
} from '@carbon/react';
import ClassAContext from '../../../views/Seedlot/ContextContainerClassA/context';
import { GeoInfoValType } from '../../../views/Seedlot/SeedlotReview/definitions';
import { formatEmptyStr } from '../../SeedlotReviewSteps/ParentTrees/utils';

const SpatialData = () => {
  const { isCalculatingPt, geoInfoVals, setGeoInfoVal } = useContext(ClassAContext);

  const renderLatLong = (isLat: boolean) => {
    const latLongStr = isLat ? 'latitude' : 'longitude';
    const degKey: keyof GeoInfoValType = isLat ? 'meanLatDeg' : 'meanLongDeg';
    const minuteKey: keyof GeoInfoValType = isLat ? 'meanLatMinute' : 'meanLongMinute';
    const secKey: keyof GeoInfoValType = isLat ? 'meanLatSec' : 'meanLongSec';

    if (isCalculatingPt) {
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
            id={`geo-info-mean-${latLongStr}-deg`}
            labelText={`Mean ${latLongStr} degree`}
            defaultValue={geoInfoVals[degKey].value}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
              setGeoInfoVal(degKey, e.target.value);
            }}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <TextInput
            id={`geo-info-mean-${latLongStr}-minute`}
            labelText={`Mean ${latLongStr} minute`}
            defaultValue={geoInfoVals[minuteKey].value}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
              setGeoInfoVal(minuteKey, e.target.value);
            }}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <TextInput
            id={`geo-info-mean-${latLongStr}-sec`}
            labelText={`Mean ${latLongStr} second`}
            defaultValue={geoInfoVals[secKey].value}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
              setGeoInfoVal(secKey, e.target.value);
            }}
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
            isCalculatingPt
              ? <TextInputSkeleton />
              : (
                <TextInput
                  id={geoInfoVals.meanElevation.id}
                  labelText="Mean elevation of parent tree (m)"
                  defaultValue={formatEmptyStr(geoInfoVals.meanElevation.value, true)}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setGeoInfoVal('meanElevation', e.target.value);
                  }}
                />
              )
          }
        </Column>
      </Row>
    </>
  );
};

export default SpatialData;
