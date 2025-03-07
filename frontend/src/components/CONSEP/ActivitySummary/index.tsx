import React from 'react';
import {
  Row,
  Column,
  Accordion,
  AccordionItem
} from '@carbon/react';

import './styles.scss';

const ActivitySummary = () => (
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
          </Column>
          <Column className="info-col">
            <p className="activity-summary-info-label">
              Seedlot number
            </p>
          </Column>
          <Column className="info-col">
            <p className="activity-summary-info-label">
              Request ID
            </p>
          </Column>
          <Column className="info-col">
            <p className="activity-summary-info-label">
              Species
            </p>
          </Column>
          <Column className="info-col">
            <p className="activity-summary-info-label">
              Test result
            </p>
          </Column>
        </Row>
      </AccordionItem>
    </Accordion>
  </div>
);

export default ActivitySummary;
