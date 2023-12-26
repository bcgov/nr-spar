import React from 'react';

import {
  ProgressIndicator,
  ProgressStep
} from '@carbon/react';

import History from '../../types/History';

import { formatDate } from '../../utils/DateUtils';
import statusClass from '../../utils/HistoryStatus';

import './styles.scss';

interface ActivityHistoryProps {
  history: History;
}

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
