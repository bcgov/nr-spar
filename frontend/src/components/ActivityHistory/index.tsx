import React from 'react';

import {
  ProgressIndicator,
  ProgressStep
} from '@carbon/react';

import History from '../../types/History';

import formatDate from '../../utils/DateUtils';

import './styles.scss';

interface ActivityHistoryProps {
  history: History;
}

const statusClass = (param: string) => {
  let complete = false;
  let current = false;
  let invalid = false;
  let disabled = false;
  switch (param) {
    case 'complete':
      complete = true;
      break;
    case 'current':
      current = true;
      break;
    case 'invalid':
      invalid = true;
      break;
    default:
      disabled = true;
  }
  return {
    complete, current, invalid, disabled
  };
};

const ActivityHistory = ({ history }: ActivityHistoryProps) => (
  <div>
    <p className="activity-history-header">{`Seedlot ${history.id}`}</p>
    <ProgressIndicator vertical className="activity-history-box">
      {history.steps.map((step) => {
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

export default ActivityHistory;
