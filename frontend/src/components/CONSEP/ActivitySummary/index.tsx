import React from 'react';
import {
  Row,
  Column,
  RadioButtonSkeleton
} from '@carbon/react';

import { ActivitySummaryType } from '../../../types/consep/TestingActivityType';

import './styles.scss';

interface ActivitySummaryProps {
  item?: ActivitySummaryType;
  isFetching: boolean;
}

const renderFieldValue = (
  name: keyof ActivitySummaryType,
  isFetching: boolean,
  item?: ActivitySummaryType
) => {
  if (isFetching) {
    return <RadioButtonSkeleton />;
  }
  if (item) {
    return (
      <p className="activity-summary-info-value">
        {name === 'testResult' ? Number(item[name]).toFixed(4) : item[name]}
      </p>
    );
  }
  return null;
};

const ActivitySummary = ({ item, isFetching }: ActivitySummaryProps) => (
  <div className="activity-summary-container">
    <Row className="activity-summary">
      <Column className="info-col">
        <p className="activity-summary-info-label">
          Activity
        </p>
        {
          renderFieldValue('activity', isFetching, item)
        }
      </Column>
      <Column className="info-col">
        <p className="activity-summary-info-label">
          Lot number
        </p>
        {
          !item?.seedlotNumber || item.seedlotNumber === '00000'
            ? renderFieldValue('familyLotNumber', isFetching, item)
            : renderFieldValue('seedlotNumber', isFetching, item)
        }
      </Column>
      <Column className="info-col">
        <p className="activity-summary-info-label">
          Request ID
        </p>
        {
          renderFieldValue('requestId', isFetching, item)
        }
      </Column>
      <Column className="info-col">
        <p className="activity-summary-info-label">
          Species
        </p>
        {
          renderFieldValue('speciesAndClass', isFetching, item)
        }
      </Column>
      <Column className="info-col">
        <p className="activity-summary-info-label">
          Test result
        </p>
        {
          renderFieldValue('testResult', isFetching, item)
        }
      </Column>
    </Row>
  </div>
);

export default ActivitySummary;
