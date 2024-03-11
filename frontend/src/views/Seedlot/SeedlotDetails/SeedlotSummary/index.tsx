import React from 'react';
import { Row, Column } from '@carbon/react';

import { SeedlotDisplayType } from '../../../../types/SeedlotType';

import renderFieldValue from './FieldValue';
import renderStatusTag from './Status';

import './styles.scss';

interface SeedlotSummaryProps {
  seedlot?: SeedlotDisplayType;
  isFetching: boolean;
}

const SeedlotSummary = ({ seedlot, isFetching }: SeedlotSummaryProps) => (
  <Row className="seedlot-summary">
    <Column sm={4} md={8} lg={16} className="seedlot-summary-title-section">
      <p className="seedlot-summary-title">
        Seedlot summary
      </p>
    </Column>
    <Column sm={4} md={8} lg={16} className="seedlot-summary-info-section">
      <Row>
        <Column sm={2} md={2} lg={3} xlg={2} className="info-col">
          <p className="seedlot-summary-info-label">
            Seedlot number
          </p>
          {
            renderFieldValue('seedlotNumber', isFetching, seedlot)
          }
        </Column>
        <Column sm={2} md={2} lg={3} xlg={2} className="info-col">
          <p className="seedlot-summary-info-label">
            Seedlot class
          </p>
          {
            renderFieldValue('seedlotClass', isFetching, seedlot)
          }
        </Column>
        <Column sm={2} md={2} lg={3} xlg={2} className="info-col">
          <p className="seedlot-summary-info-label">
            Seedlot species
          </p>
          {
            renderFieldValue('seedlotSpecies', isFetching, seedlot)
          }
        </Column>
        <Column sm={2} md={2} lg={3} xlg={2} className="info-col">
          <p className="seedlot-summary-info-label">
            Status
          </p>
          {
            renderStatusTag(isFetching, seedlot?.seedlotStatus)
          }
        </Column>
        <Column sm={2} md={2} lg={3} xlg={2} className="info-col">
          <p className="seedlot-summary-info-label">
            Created at
          </p>
          {
            renderFieldValue('createdAt', isFetching, seedlot)
          }
        </Column>
        <Column sm={2} md={2} lg={3} xlg={2} className="info-col">
          <p className="seedlot-summary-info-label">
            Last updated
          </p>
          {
            renderFieldValue('lastUpdatedAt', isFetching, seedlot)
          }
        </Column>
        <Column sm={2} md={2} lg={3} xlg={2} className="info-col">
          <p className="seedlot-summary-info-label">
            Approved at
          </p>
          {
            renderFieldValue('approvedAt', isFetching, seedlot)
          }
        </Column>
      </Row>
    </Column>
  </Row>
);

export default SeedlotSummary;
