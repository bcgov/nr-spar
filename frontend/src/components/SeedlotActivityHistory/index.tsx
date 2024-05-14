import React from 'react';
import {
  Dropdown,
  ProgressIndicator,
  ProgressStep
} from '@carbon/react';

import Subtitle from '../Subtitle';

import { formatDate } from '../../utils/DateUtils';
import statusClass from '../../utils/HistoryStatus';

import './styles.scss';

const dropdownOptions = [
  'All activities',
  'Own activity',
  'Agency activity',
  'TSC activity'
];

const ActivityHistoryMock = {
  id: 12345,
  steps: [
    {
      step: 12,
      status: 'current',
      description: 'Seedlot is now under review by the TSC',
      date: '2023-01-22'
    },
    {
      step: 11,
      status: 'complete',
      description: 'Accepted declaration of terms',
      date: '2023-01-22'
    },
    {
      step: 10,
      status: 'complete',
      description: 'Extraction and storage completed by extractory agency',
      date: '2023-01-22'
    },
    {
      step: 9,
      status: '',
      description: 'Extraction and storage pending by extractory agency',
      date: '2023-01-13'
    },
    {
      step: 8,
      status: 'complete',
      description: 'Extractory agency added to this form',
      date: '2023-01-13'
    },
    {
      step: 7,
      status: 'invalid',
      description: 'Declaration of terms incomplete',
      date: '2023-01-12'
    },
    {
      step: 6,
      status: 'invalid',
      description: 'Extraction and storage incomplete',
      date: '2023-01-12'
    },
    {
      step: 5,
      status: 'complete',
      description: 'Completed parent tree and SMP',
      date: '2022-12-14'
    },
    {
      step: 4,
      status: 'complete',
      description: 'Completed interim storage',
      date: '2022-12-14'
    },
    {
      step: 3,
      status: 'complete',
      description: 'Completed ownership',
      date: '2022-12-14'
    },
    {
      step: 2,
      status: 'complete',
      description: 'Completed collection',
      date: '2022-12-14'
    },
    {
      step: 1,
      status: 'complete',
      description: 'Started registration',
      date: '2022-11-24'
    }
  ]
};

const SeedlotActivityHistory = () => (
  <div className="seedlot-activity-history">
    <div className="seedlot-activity-history-title-section">
      <p className="seedlot-activity-history-title">
        Keep track of activity history
      </p>
      <Subtitle text="Get updates on seedlot related activities" />
    </div>
    <Dropdown
      id="seedlot-activity-history-filter"
      label="Filter activity history steps"
      aria-label="Filter activity history steps"
      className="seedlot-activity-history-dropdown"
      initialSelectedItem={dropdownOptions[0]}
      items={dropdownOptions}
    />
    <ProgressIndicator vertical className="seedlot-activity-history-box">
      {ActivityHistoryMock.steps.map((step) => {
        const status = statusClass(step.status);
        return (
          <ProgressStep
            key={step.step.toString()}
            complete={status.complete}
            current={status.current}
            invalid={status.invalid}
            disabled={status.disabled}
            label={step.description}
            secondaryLabel={formatDate(step.date)}
          />
        );
      })}
    </ProgressIndicator>
  </div>
);

export default SeedlotActivityHistory;
