import React from 'react';
import {
  Row, Column, FlexGrid, Button
} from '@carbon/react';
import { Launch } from '@carbon/icons-react';

import DetailSection from '../../../../../components/DetailSection';
import ReadOnlyInput from '../../../../../components/ReadOnlyInput';
import Divider from '../../../../../components/Divider';
import Subtitle from '../../../../../components/Subtitle';
import {
  RichSeedlotType, SeedlotType
} from '../../../../../types/SeedlotType';
import { isSuperiorProvenanceSeedlot } from '../../utils';
import {
  formatBecZone,
  formatDmsWithHemisphere,
  formatOptionalNumber,
  formatOptionalString
} from './utils';

import './styles.scss';

type SourceInformationProps = {
  seedlot: SeedlotType,
  richSeedlot?: RichSeedlotType,
  isFetching: boolean
};

const SourceInformation = ({
  seedlot,
  richSeedlot,
  isFetching
}: SourceInformationProps) => {
  const isSuperiorProvenance = isSuperiorProvenanceSeedlot(seedlot);
  const hasCollectionGeometry = !!richSeedlot?.bClassDetail?.collectionGeometry;

  return (
    <DetailSection title="Source information">
      <FlexGrid className="b-class-detail-section">
        <Row>
          <Column>
            <Subtitle text="Natural stand collection site details" />
          </Column>
        </Row>
        <Row>
          <Column className="info-col" sm={4} md={4} lg={4}>
            <ReadOnlyInput
              id="b-detail-location"
              label={isSuperiorProvenance ? 'Provenance' : 'Location'}
              value={formatOptionalString(seedlot.collectionLocationDesc)}
              showSkeleton={isFetching}
            />
          </Column>
          <Column className="info-col" sm={4} md={4} lg={4}>
            <ReadOnlyInput
              id="b-detail-org-unit"
              label="Collection org unit"
              value={formatOptionalNumber(seedlot.orgUnitNo)}
              showSkeleton={isFetching}
            />
          </Column>
          <Column className="info-col" sm={4} md={4} lg={4}>
            <ReadOnlyInput
              id="b-detail-collection-radius"
              label="Radius of collection area (km)"
              value={formatOptionalNumber(seedlot.collectionAreaRadius)}
              showSkeleton={isFetching}
            />
          </Column>
        </Row>
        <Row>
          <Column className="info-col" sm={4} md={4} lg={4}>
            <ReadOnlyInput
              id="b-detail-seed-plan-zone"
              label="Seed planning zone"
              value={formatOptionalString(seedlot.seedPlanZoneCode)}
              showSkeleton={isFetching}
            />
          </Column>
          {
            seedlot.seedPlanZoneCode === 'M'
              ? (
                <Column className="info-col" sm={4} md={4} lg={4}>
                  <ReadOnlyInput
                    id="b-detail-geographic-area"
                    label="Geographic area"
                    value={formatOptionalString(seedlot.seedCoastAreaCode)}
                    showSkeleton={isFetching}
                  />
                </Column>
              )
              : null
          }
        </Row>

        <Divider />

        <Row>
          <Column className="sub-section-title-col">
            Elevation
          </Column>
        </Row>
        <Row>
          <Column className="info-col" sm={4} md={4} lg={4}>
            <ReadOnlyInput
              id="b-detail-elevation-mean"
              label="Mean elevation (m)"
              value={formatOptionalNumber(seedlot.collectionElevation)}
              showSkeleton={isFetching}
            />
          </Column>
          <Column className="info-col" sm={4} md={4} lg={4}>
            <ReadOnlyInput
              id="b-detail-elevation-min"
              label="Minimum elevation (m)"
              value={formatOptionalNumber(seedlot.collectionElevationMin)}
              showSkeleton={isFetching}
            />
          </Column>
          <Column className="info-col" sm={4} md={4} lg={4}>
            <ReadOnlyInput
              id="b-detail-elevation-max"
              label="Maximum elevation (m)"
              value={formatOptionalNumber(seedlot.collectionElevationMax)}
              showSkeleton={isFetching}
            />
          </Column>
        </Row>

        <Divider />

        <Row>
          <Column className="sub-section-title-col">
            Coordinates (collection mean)
          </Column>
        </Row>
        <Row>
          <Column className="info-col" sm={4} md={4} lg={4}>
            <ReadOnlyInput
              id="b-detail-latitude"
              label="Latitude"
              value={formatDmsWithHemisphere(
                seedlot.collectionLatitudeDeg,
                seedlot.collectionLatitudeMin,
                seedlot.collectionLatitudeSec,
                seedlot.collectionLatitudeCode
              )}
              showSkeleton={isFetching}
            />
          </Column>
          <Column className="info-col" sm={4} md={4} lg={4}>
            <ReadOnlyInput
              id="b-detail-longitude"
              label="Longitude"
              value={formatDmsWithHemisphere(
                seedlot.collectionLongitudeDeg,
                seedlot.collectionLongitudeMin,
                seedlot.collectionLongitudeSec,
                seedlot.collectionLongitudeCode
              )}
              showSkeleton={isFetching}
            />
          </Column>
        </Row>

        <Divider />

        <Row>
          <Column className="sub-section-title-col">
            BEC zone
          </Column>
        </Row>
        <Row>
          <Column className="info-col" sm={4} md={4} lg={4}>
            <ReadOnlyInput
              id="b-detail-bec-zone"
              label="BEC zone"
              value={formatBecZone(seedlot.bgcZoneCode, seedlot.bgcZoneDescription)}
              showSkeleton={isFetching}
            />
          </Column>
          <Column className="info-col" sm={4} md={4} lg={4}>
            <ReadOnlyInput
              id="b-detail-bec-subzone"
              label="Subzone"
              value={formatOptionalString(seedlot.bgcSubzoneCode)}
              showSkeleton={isFetching}
            />
          </Column>
          <Column className="info-col" sm={4} md={4} lg={4}>
            <ReadOnlyInput
              id="b-detail-bec-variant"
              label="Variant"
              value={formatOptionalString(seedlot.variant)}
              showSkeleton={isFetching}
            />
          </Column>
          <Column className="info-col" sm={4} md={4} lg={4}>
            <ReadOnlyInput
              id="b-detail-bec-version"
              label="BEC version"
              value={formatOptionalNumber(seedlot.becVersionId)}
              showSkeleton={isFetching}
            />
          </Column>
        </Row>

        {
          hasCollectionGeometry
            ? (
              <Row className="section-action-row">
                <Column>
                  <Button
                    kind="tertiary"
                    size="md"
                    renderIcon={Launch}
                    disabled
                  >
                    SeedMap (Collection)
                  </Button>
                </Column>
              </Row>
            )
            : null
        }
      </FlexGrid>
    </DetailSection>
  );
};

export default SourceInformation;
