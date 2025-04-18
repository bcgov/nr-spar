import React from 'react';
import {
  Row,
  Column,
  Accordion,
  AccordionItem,
  RadioButtonSkeleton
} from '@carbon/react';

import { ActivitySummaryType } from '../../../types/ActivitySummaryType';

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
        {item[name]}
      </p>
    );
  }
  return null;
};

const ActivitySummary = ({ item, isFetching }: ActivitySummaryProps) => (
  <div className="activity-summary-container">
    <Accordion className="activity-summary">
      <AccordionItem
        open
        title="Activity summary"
      >
        <Row>
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
              Seedlot number
            </p>
            {
              renderFieldValue('seedlotNumber', isFetching, item)
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
      </AccordionItem>
    </Accordion>
  </div>
);

export default ActivitySummary;
