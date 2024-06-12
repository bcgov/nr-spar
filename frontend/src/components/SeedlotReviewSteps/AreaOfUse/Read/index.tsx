import React, { useContext } from 'react';
import {
  FlexGrid, Row, Column,
  TextArea, TextAreaSkeleton
} from '@carbon/react';

import ClassAContext from '../../../../views/Seedlot/ContextContainerClassA/context';
import ReadOnlyInput from '../../../ReadOnlyInput';
import { formatLatLong, formatSpz, spzListToString } from '../utils';
import Divider from '../../../Divider';
import SeedMapSection from '../SeedMapSection';

const AreaOfUseRead = () => {
  const {
    isFetchingData, richSeedlotData
  } = useContext(ClassAContext);

  return (
    <FlexGrid className="sub-section-grid">
      {/* SPZ */}
      <Row>
        <Column className="sub-section-title-col">
          Seed Planning Zone(s) (SPZ)
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={8} lg={8}>
          <ReadOnlyInput
            id="primary-spz-input-readonly"
            label="Primary seed planning zone"
            value={
              richSeedlotData?.primarySpz
                ? formatSpz(richSeedlotData.primarySpz)
                : ''
            }
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={8} lg={8}>
          <ReadOnlyInput
            id="additional-spz-input-readonly"
            label="Additional seed planning zone(s)"
            value={
              richSeedlotData?.additionalSpzList
                ? spzListToString(richSeedlotData.additionalSpzList)
                : ''
            }
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>

      <Divider />

      <Row>
        <Column className="sub-section-title-col">
          Elevation, Latitude and Longitude
        </Column>
      </Row>
      {/* Elevation */}
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="min-elevation-input-readonly"
            label="Minimum Elevation (m):"
            value={
              richSeedlotData?.seedlot.elevationMin?.toString()
            }
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="max-elevation-input-readonly"
            label="Maximum Elevation (m):"
            value={
              richSeedlotData?.seedlot.elevationMax?.toString()
            }
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      {/* Latitude */}
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="min-lat-input-readonly"
            label="Minimum Latitude:"
            value={
              formatLatLong(
                richSeedlotData?.seedlot.latitudeDegMin,
                richSeedlotData?.seedlot.latitudeMinMin,
                richSeedlotData?.seedlot.latitudeSecMin
              )
            }
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="max-lat-input-readonly"
            label="Maximum Latitude:"
            value={
              formatLatLong(
                richSeedlotData?.seedlot.latitudeDegMax,
                richSeedlotData?.seedlot.latitudeMinMax,
                richSeedlotData?.seedlot.latitudeSecMax
              )
            }
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      {/* Longitude */}
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="min-long-input-readonly"
            label="Minimum Longitude:"
            value={
              formatLatLong(
                richSeedlotData?.seedlot.longitudeDegMin,
                richSeedlotData?.seedlot.longitudeMinMin,
                richSeedlotData?.seedlot.longitudeSecMin
              )

            }
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="max-long-input-readonly"
            label="Maximum Longitude:"
            value={
              formatLatLong(
                richSeedlotData?.seedlot.longitudeDegMax,
                richSeedlotData?.seedlot.longitudeMinMax,
                richSeedlotData?.seedlot.longitudeSecMax
              )
            }
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      {/* Area of Use Comment */}
      <Row>
        <Column className="info-col" sm={4} md={8} lg={8}>
          {
            isFetchingData
              ? <TextAreaSkeleton />
              : (
                <TextArea
                  id="area-of-use-comment-input-readonly"
                  labelText="Area of use comment:"
                  readOnly
                  value={
                    richSeedlotData?.seedlot.areaOfUseComment ?? ''
                  }
                />
              )
          }
        </Column>
      </Row>

      <Divider />

      <SeedMapSection />
    </FlexGrid>
  );
};

export default AreaOfUseRead;
