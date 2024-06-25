import React, { useContext } from 'react';
import {
  Row, Column, TextInput, TextInputSkeleton
} from '@carbon/react';
import ClassAContext from '../../../views/Seedlot/ContextContainerClassA/context';
import { GeoInfoValType } from '../../../views/Seedlot/SeedlotReview/definitions';
import { PLACE_HOLDER } from '../../../shared-constants/shared-constants';
import { formatEmptyStr } from './utils';

type props = {
  isRead?: boolean;
}

const GeoInfo = ({ isRead }: props) => {
  const { isFetchingData, geoInfoVals, setGeoInfoVal } = useContext(ClassAContext);

  const formatLatLong = (isLat: boolean): string => {
    let formatted = PLACE_HOLDER;
    if (geoInfoVals) {
      const degree = isLat
        ? geoInfoVals.meanLatDeg.value : geoInfoVals.meanLongDeg.value;
      const minute = isLat
        ? geoInfoVals.meanLatMinute.value : geoInfoVals.meanLongMinute.value;
      const second = isLat
        ? geoInfoVals.meanLatSec.value : geoInfoVals.meanLongSec.value;

      if (degree && minute && second) {
        formatted = `${degree}° ${minute}' ${second}"`;
      }
    }
    return formatted;
  };

  const renderLatLong = (isLat: boolean) => {
    const latLongStr = isLat ? 'latitude' : 'longitude';
    const degKey: keyof GeoInfoValType = isLat ? 'meanLatDeg' : 'meanLongDeg';
    const minuteKey: keyof GeoInfoValType = isLat ? 'meanLatMinute' : 'meanLongMinute';
    const secKey: keyof GeoInfoValType = isLat ? 'meanLatSec' : 'meanLongSec';

    if (isFetchingData) {
      return (
        <Column className="info-col" sm={4} md={4} lg={4}>
          <TextInputSkeleton />
        </Column>
      );
    }

    if (isRead) {
      return (
        <Column className="info-col" sm={4} md={4} lg={4}>
          <TextInput
            id={`geo-info-mean-${latLongStr}`}
            labelText={`Mean ${latLongStr} of parent tree`}
            defaultValue={formatLatLong(isLat)}
            readOnly={isRead}
          />
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
        <Column className="sub-section-title-col">
          Geographic information
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          {
            isFetchingData
              ? <TextInputSkeleton />
              : (
                <TextInput
                  id={geoInfoVals.becZone.id}
                  labelText="BEC zone"
                  defaultValue={formatEmptyStr(geoInfoVals.becZone.value, isRead ?? false)}
                  readOnly={isRead}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setGeoInfoVal('becZone', e.target.value);
                  }}
                />
              )
          }

        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          {
            isFetchingData
              ? <TextInputSkeleton />
              : (
                <TextInput
                  id={geoInfoVals.subZone.id}
                  labelText="Subzone"
                  defaultValue={formatEmptyStr(geoInfoVals.subZone.value, isRead ?? false)}
                  readOnly={isRead}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setGeoInfoVal('subZone', e.target.value);
                  }}
                />
              )
          }
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          {
            isFetchingData
              ? <TextInputSkeleton />
              : (
                <TextInput
                  id={geoInfoVals.variant.id}
                  labelText="Variant"
                  defaultValue={formatEmptyStr(geoInfoVals.variant.value, isRead ?? false)}
                  readOnly={isRead}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setGeoInfoVal('variant', e.target.value);
                  }}
                />
              )
          }
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          {
            isFetchingData
              ? <TextInputSkeleton />
              : (
                <TextInput
                  id={geoInfoVals.primarySpu.id}
                  labelText="Primary seed planning unit"
                  defaultValue={formatEmptyStr(geoInfoVals.primarySpu.value, isRead ?? false)}
                  readOnly={isRead}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setGeoInfoVal('primarySpu', e.target.value);
                  }}
                />
              )
          }
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
                  labelText="Mean elevation of parent tree (m)"
                  defaultValue={formatEmptyStr(geoInfoVals.meanElevation.value, isRead ?? false)}
                  readOnly={isRead}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setGeoInfoVal('meanElevation', e.target.value);
                  }}
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
                  labelText="Effective population size"
                  defaultValue={formatEmptyStr(geoInfoVals.effectivePopSize.value, isRead ?? false)}
                  readOnly={isRead}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setGeoInfoVal('effectivePopSize', e.target.value);
                  }}
                />
              )
          }
        </Column>
      </Row>
    </>
  );
};

export default GeoInfo;
