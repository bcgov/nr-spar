import React from 'react';
import {
  Row, Column, FlexGrid, TextArea, TextAreaSkeleton, Button
} from '@carbon/react';
import { Launch } from '@carbon/icons-react';

import DetailSection from '../../../../../components/DetailSection';
import ReadOnlyInput from '../../../../../components/ReadOnlyInput';
import Divider from '../../../../../components/Divider';
import { RichSeedlotType, SeedlotType } from '../../../../../types/SeedlotType';
import { PLACE_HOLDER } from '../../../../../shared-constants/shared-constants';
import { formatLatLong, spzListToString } from '../../../../../components/SeedlotReviewSteps/AreaOfUse/utils';
import { formatOptionalString } from './utils';

import './styles.scss';

type AreaOfUseProps = {
  seedlot: SeedlotType,
  richSeedlot?: RichSeedlotType,
  isFetching: boolean
};

const AreaOfUse = ({
  seedlot,
  richSeedlot,
  isFetching
}: AreaOfUseProps) => {
  const aouSpzList = richSeedlot?.bClassDetail?.aouSpzList ?? [];

  return (
    <DetailSection title="Area of use">
      <FlexGrid className="b-class-detail-section">
        <Row>
          <Column className="sub-section-title-col">
            Seed planning zone(s)
          </Column>
        </Row>
        <Row>
          <Column className="info-col" sm={4} md={8} lg={8}>
            <ReadOnlyInput
              id="b-detail-aou-spz-list"
              label="Seed planning zone(s)"
              value={
                aouSpzList.length > 0
                  ? spzListToString(aouSpzList)
                  : PLACE_HOLDER
              }
              showSkeleton={isFetching}
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
              id="b-detail-aou-min-elevation"
              label="Minimum elevation (m)"
              value={seedlot.elevationMin?.toString() ?? PLACE_HOLDER}
              showSkeleton={isFetching}
            />
          </Column>
          <Column className="info-col" sm={4} md={4} lg={4}>
            <ReadOnlyInput
              id="b-detail-aou-max-elevation"
              label="Maximum elevation (m)"
              value={seedlot.elevationMax?.toString() ?? PLACE_HOLDER}
              showSkeleton={isFetching}
            />
          </Column>
        </Row>
        <Row>
          <Column className="info-col" sm={4} md={4} lg={4}>
            <ReadOnlyInput
              id="b-detail-aou-min-lat"
              label="Minimum latitude"
              value={formatLatLong(
                seedlot.latitudeDegMin,
                seedlot.latitudeMinMin,
                seedlot.latitudeSecMin
              ) || PLACE_HOLDER}
              showSkeleton={isFetching}
            />
          </Column>
          <Column className="info-col" sm={4} md={4} lg={4}>
            <ReadOnlyInput
              id="b-detail-aou-max-lat"
              label="Maximum latitude"
              value={formatLatLong(
                seedlot.latitudeDegMax,
                seedlot.latitudeMinMax,
                seedlot.latitudeSecMax
              ) || PLACE_HOLDER}
              showSkeleton={isFetching}
            />
          </Column>
        </Row>
        <Row>
          <Column className="info-col" sm={4} md={4} lg={4}>
            <ReadOnlyInput
              id="b-detail-aou-min-long"
              label="Minimum longitude"
              value={formatLatLong(
                seedlot.longitudeDegMin,
                seedlot.longitudeMinMin,
                seedlot.longitudeSecMin
              ) || PLACE_HOLDER}
              showSkeleton={isFetching}
            />
          </Column>
          <Column className="info-col" sm={4} md={4} lg={4}>
            <ReadOnlyInput
              id="b-detail-aou-max-long"
              label="Maximum longitude"
              value={formatLatLong(
                seedlot.longitudeDegMax,
                seedlot.longitudeMinMax,
                seedlot.longitudeSecMax
              ) || PLACE_HOLDER}
              showSkeleton={isFetching}
            />
          </Column>
        </Row>

        <Row>
          <Column className="info-col" sm={4} md={8} lg={8}>
            {
              isFetching
                ? <TextAreaSkeleton />
                : (
                  <TextArea
                    id="b-detail-aou-comment"
                    labelText="Area of use comment"
                    readOnly
                    value={formatOptionalString(seedlot.areaOfUseComment ?? undefined)}
                    rows={4}
                  />
                )
            }
          </Column>
        </Row>

        <Row className="section-action-row">
          <Column>
            <Button
              kind="tertiary"
              size="md"
              renderIcon={Launch}
              disabled
            >
              SeedMap (Area of use)
            </Button>
          </Column>
        </Row>
      </FlexGrid>
    </DetailSection>
  );
};

export default AreaOfUse;
