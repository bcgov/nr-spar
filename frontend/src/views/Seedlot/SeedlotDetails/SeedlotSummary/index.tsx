import React from 'react';

import { SeedlotDisplayType } from '../../../../types/SeedlotType';

import renderFieldValue from './FieldValue';
import renderStatusTag from './Status';

import './styles.scss';

interface SeedlotSummaryProps {
  seedlot?: SeedlotDisplayType;
  isFetching: boolean;
}

const SeedlotSummary = ({ seedlot, isFetching }: SeedlotSummaryProps) => (
  <div className="seedlot-summary">
    <div className="seedlot-summary-title-section">
      <p className="seedlot-summary-title">
        Seedlot summary
      </p>
    </div>
    <div className="seedlot-summary-info-section">
      <div className="seedlot-summary-seedlot-number">
        <p className="seedlot-summary-info-label">
          Seedlot number
        </p>
        {
          renderFieldValue('seedlotNumber', isFetching, seedlot)
        }
      </div>
      <div className="seedlot-summary-seedlot-class">
        <p className="seedlot-summary-info-label">
          Seedlot class
        </p>
        {
          renderFieldValue('seedlotClass', isFetching, seedlot)
        }
      </div>
      <div className="seedlot-summary-seedlot-species">
        <p className="seedlot-summary-info-label">
          Seedlot species
        </p>
        {
          renderFieldValue('seedlotSpecies', isFetching, seedlot)
        }
      </div>
      <div className="seedlot-summary-seedlot-status">
        <p className="seedlot-summary-info-label">
          Status
        </p>
        {
          renderStatusTag(isFetching, seedlot?.seedlotStatus)
        }
      </div>
      <div className="seedlot-summary-seedlot-created">
        <p className="seedlot-summary-info-label">
          Created at
        </p>
        {
          renderFieldValue('createdAt', isFetching, seedlot)
        }
      </div>
      <div className="seedlot-summary-seedlot-modified">
        <p className="seedlot-summary-info-label">
          Last updated
        </p>
        {
          renderFieldValue('lastUpdatedAt', isFetching, seedlot)
        }
      </div>
      <div className="seedlot-summary-seedlot-approved">
        <p className="seedlot-summary-info-label">
          Approved at
        </p>
        {
          renderFieldValue('approvedAt', isFetching, seedlot)
        }
      </div>
    </div>
  </div>
);

export default SeedlotSummary;
