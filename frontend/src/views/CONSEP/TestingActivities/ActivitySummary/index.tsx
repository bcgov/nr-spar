import React from 'react';
import {
  FlexGrid,
  Row,
  Column,
  Accordion,
  AccordionItem
} from '@carbon/react';

import './styles.scss';
import { Report } from '@carbon/icons-react';

const ActivitySummary = () => (
  <FlexGrid className="activity-summary-container">
    <Accordion className="activity-summary">
      <AccordionItem
        open
        title="Activity summary"
        renderIcon={() => <Report />}
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
  </FlexGrid>
);

export default ActivitySummary;
