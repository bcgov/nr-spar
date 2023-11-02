import React from 'react';
import { RadioButtonSkeleton } from '@carbon/react';
import Subtitle from '../../../../components/Subtitle';

import { SeedlotDisplayType } from '../../../../types/SeedlotType';

import './styles.scss';
import StatusTag from '../../../../components/StatusTag';

interface SeedlotSummaryProps {
  seedlot?: SeedlotDisplayType;
  isFetching: boolean;
}

const SeedlotSummary = ({ seedlot, isFetching }: SeedlotSummaryProps) => {
  const renderValue = (name: keyof SeedlotDisplayType) => {
    if (isFetching) {
      return <RadioButtonSkeleton />;
    }
    if (seedlot) {
      return name === 'seedlotStatus'
        ? <StatusTag type={seedlot.seedlotStatus} />
        : (
          <p className="seedlot-summary-info-value">
            {seedlot[name]}
          </p>
        );
    }
    return null;
  };

  return (
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
            renderValue('seedlotNumber')
          }
        </div>
        <div className="seedlot-summary-seedlot-class">
          <p className="seedlot-summary-info-label">
            Seedlot class
          </p>
          {
            renderValue('seedlotClass')
          }
        </div>
        <div className="seedlot-summary-seedlot-species">
          <p className="seedlot-summary-info-label">
            Seedlot species
          </p>
          {
            renderValue('seedlotSpecies')
          }
        </div>
        <div className="seedlot-summary-seedlot-status">
          <p className="seedlot-summary-info-label">
            Status
          </p>
          {
            renderValue('seedlotStatus')
          }
        </div>
        <div className="seedlot-summary-seedlot-created">
          <p className="seedlot-summary-info-label">
            Created at
          </p>
          {
            renderValue('createdAt')
          }
        </div>
        <div className="seedlot-summary-seedlot-modified">
          <p className="seedlot-summary-info-label">
            Last updated
          </p>
          {
            renderValue('lastUpdatedAt')
          }
        </div>
        <div className="seedlot-summary-seedlot-approved">
          <p className="seedlot-summary-info-label">
            Approved at
          </p>
          {
            renderValue('approvedAt')
          }
        </div>
      </div>
    </div>
  );
};

export default SeedlotSummary;
