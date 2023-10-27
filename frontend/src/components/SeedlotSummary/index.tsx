import React from 'react';

import Subtitle from '../Subtitle';
import StatusItem from '../StatusItem';
import Participants from '../Participants';

import Seedlot from '../../types/SeedlotType';

import './styles.scss';

interface SeedlotSummaryProps {
  seedlotData: Seedlot;
}

const SeedlotSummary = ({ seedlotData }: SeedlotSummaryProps) => (
  <div className="seedlot-summary">
    <div className="seedlot-summary-title-section">
      <p className="seedlot-summary-title">
        Seedlot summary
      </p>
      <Subtitle text="The main information of your seedlot" />
    </div>
    <div className="seedlot-summary-info-section">
      <div className="seedlot-summary-seedlot-number">
        <p className="seedlot-summary-info-label">
          Seedlot number
        </p>
        <p className="seedlot-summary-info-value">
          {seedlotData.number}
        </p>
      </div>
      <div className="seedlot-summary-seedlot-class">
        <p className="seedlot-summary-info-label">
          Seedlot class
        </p>
        <p className="seedlot-summary-info-value">
          {seedlotData.class}
        </p>
      </div>
      <div className="seedlot-summary-seedlot-species">
        <p className="seedlot-summary-info-label">
          Seedlot species
        </p>
        <p className="seedlot-summary-info-value">
          {seedlotData.lot_species.label}
        </p>
      </div>
      <div className="seedlot-summary-seedlot-form">
        <p className="seedlot-summary-info-label">
          Form step
        </p>
        <p className="seedlot-summary-info-value">
          {seedlotData.form_step}
        </p>
      </div>
      <div className="seedlot-summary-seedlot-status">
        <p className="seedlot-summary-info-label">
          Status
        </p>
        <div className="seedlot-summary-info-value">
          <StatusItem status={seedlotData.status} />
        </div>
      </div>
      <div className="seedlot-summary-seedlot-participants">
        <p className="seedlot-summary-info-label">
          Participants
        </p>
        <div className="seedlot-summary-info-value">
          <Participants
            elements={seedlotData.participants}
            number={seedlotData.participants.length}
          />
        </div>
      </div>
      <div className="seedlot-summary-seedlot-created">
        <p className="seedlot-summary-info-label">
          Created at
        </p>
        <p className="seedlot-summary-info-value">
          {seedlotData.created_at}
        </p>
      </div>
      <div className="seedlot-summary-seedlot-modified">
        <p className="seedlot-summary-info-label">
          Last modified
        </p>
        <p className="seedlot-summary-info-value">
          {seedlotData.last_modified}
        </p>
      </div>
      <div className="seedlot-summary-seedlot-approved">
        <p className="seedlot-summary-info-label">
          Approved at
        </p>
        <p className="seedlot-summary-info-value">
          {seedlotData.approved_at}
        </p>
      </div>
    </div>
  </div>
);

export default SeedlotSummary;
