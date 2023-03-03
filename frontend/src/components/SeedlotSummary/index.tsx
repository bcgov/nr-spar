import React from 'react';

import Subtitle from '../Subtitle';
import StatusItem from '../StatusItem';
import Participants from '../Participants';

import './styles.scss';

const SeedlotSummary = () => (
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
          636465
        </p>
      </div>
      <div className="seedlot-summary-seedlot-class">
        <p className="seedlot-summary-info-label">
          Seedlot class
        </p>
        <p className="seedlot-summary-info-value">
          Class A
        </p>
      </div>
      <div className="seedlot-summary-seedlot-species">
        <p className="seedlot-summary-info-label">
          Seedlot species
        </p>
        <p className="seedlot-summary-info-value">
          SX - Spruce hybrid
        </p>
      </div>
      <div className="seedlot-summary-seedlot-form">
        <p className="seedlot-summary-info-label">
          Form step
        </p>
        <p className="seedlot-summary-info-value">
          Collection
        </p>
      </div>
      <div className="seedlot-summary-seedlot-status">
        <p className="seedlot-summary-info-label">
          Status
        </p>
        <div className="seedlot-summary-info-value">
          <StatusItem status={4} />
        </div>
      </div>
      <div className="seedlot-summary-seedlot-participants">
        <p className="seedlot-summary-info-label">
          Participants
        </p>
        <div className="seedlot-summary-info-value">
          <Participants elements={["John Doe"]} number={1} />
        </div>
      </div>
      <div className="seedlot-summary-seedlot-created">
        <p className="seedlot-summary-info-label">
          Created at
        </p>
        <p className="seedlot-summary-info-value">
         Sep 08, 2021
        </p>
      </div>
      <div className="seedlot-summary-seedlot-modified">
        <p className="seedlot-summary-info-label">
          Last modified
        </p>
        <p className="seedlot-summary-info-value">
         Dec 24, 2022
        </p>
      </div>
      <div className="seedlot-summary-seedlot-approved">
        <p className="seedlot-summary-info-label">
          Approved  at
        </p>
        <p className="seedlot-summary-info-value">
          --
        </p>
      </div>
    </div>
  </div>
);

export default SeedlotSummary;
