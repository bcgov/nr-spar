import React, { useContext } from 'react';
import {
  Row, Column, FlexGrid, TextArea, TextAreaSkeleton
} from '@carbon/react';

import Divider from '../../../../components/Divider';
import ReadOnlyInput from '../../../../components/ReadOnlyInput';
import ClassBContext from '../../ContextContainerClassB/context';
import { PLACE_HOLDER } from '../../../../shared-constants/shared-constants';
import { formatLatLong, spzListToString } from '../../../../components/SeedlotReviewSteps/AreaOfUse/utils';

/**
 * Read-only area of use section, values are calculated at submission
 * and only visible to TSC admins.
 */
const AreaOfUseRead = () => {
  const { seedlotData, richSeedlotData, isFetchingData } = useContext(ClassBContext);

  const aouSpzList = richSeedlotData?.bClassDetail?.aouSpzList ?? [];

  return (
    <FlexGrid className="sub-section-grid">
      <Row>
        <Column className="sub-section-title-col">
          Seed planning zone(s)
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={8} lg={8}>
          <ReadOnlyInput
            id="b-review-aou-spz-list"
            label="Seed planning zone(s)"
            value={
              aouSpzList.length > 0
                ? spzListToString(aouSpzList)
                : PLACE_HOLDER
            }
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>

      <Divider />

      <Row>
        <Column className="sub-section-title-col">
          Elevation, latitude and longitude
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-aou-min-elevation"
            label="Minimum elevation (m)"
            value={seedlotData?.elevationMin?.toString() ?? PLACE_HOLDER}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-aou-max-elevation"
            label="Maximum elevation (m)"
            value={seedlotData?.elevationMax?.toString() ?? PLACE_HOLDER}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-aou-min-lat"
            label="Minimum latitude"
            value={formatLatLong(
              seedlotData?.latitudeDegMin,
              seedlotData?.latitudeMinMin,
              seedlotData?.latitudeSecMin
            ) || PLACE_HOLDER}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-aou-max-lat"
            label="Maximum latitude"
            value={formatLatLong(
              seedlotData?.latitudeDegMax,
              seedlotData?.latitudeMinMax,
              seedlotData?.latitudeSecMax
            ) || PLACE_HOLDER}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-aou-min-long"
            label="Minimum longitude"
            value={formatLatLong(
              seedlotData?.longitudeDegMin,
              seedlotData?.longitudeMinMin,
              seedlotData?.longitudeSecMin
            ) || PLACE_HOLDER}
            showSkeleton={isFetchingData}
          />
        </Column>
        <Column className="info-col" sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="b-review-aou-max-long"
            label="Maximum longitude"
            value={formatLatLong(
              seedlotData?.longitudeDegMax,
              seedlotData?.longitudeMinMax,
              seedlotData?.longitudeSecMax
            ) || PLACE_HOLDER}
            showSkeleton={isFetchingData}
          />
        </Column>
      </Row>
      <Row>
        <Column className="info-col" sm={4} md={8} lg={8}>
          {
            isFetchingData
              ? <TextAreaSkeleton />
              : (
                <TextArea
                  id="b-review-aou-comment"
                  labelText="Area of use comment"
                  readOnly
                  value={seedlotData?.areaOfUseComment ?? PLACE_HOLDER}
                  rows={4}
                />
              )
          }
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default AreaOfUseRead;
