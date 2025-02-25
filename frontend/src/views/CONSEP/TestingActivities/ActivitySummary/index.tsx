import React from 'react';
import { FlexGrid, Row, Column } from '@carbon/react';

const ActivitySummary = () => (
  <FlexGrid className="activity-summary-container">
    <Row className="activity-summary">
      <Column sm={4} md={8} lg={16} className="activity-summary-title-section">
        <p className="activity-summary-title">
          Activity summary
        </p>
      </Column>
      <Column sm={4} md={8} lg={16} className="activity-summary-info-section">
        <Row>
          <Column sm={2} md={2} lg={3} xlg={2} className="info-col">
            <p className="activity-summary-info-label">
              Activity
            </p>
          </Column>
          <Column sm={2} md={2} lg={3} xlg={2} className="info-col">
            <p className="activity-summary-info-label">
              Seedlot number
            </p>
          </Column>
          <Column sm={2} md={2} lg={3} xlg={2} className="info-col">
            <p className="activity-summary-info-label">
              Request ID
            </p>
          </Column>
          <Column sm={2} md={2} lg={3} xlg={2} className="info-col">
            <p className="activity-summary-info-label">
              Species
            </p>
          </Column>
          <Column sm={2} md={2} lg={3} xlg={2} className="info-col">
            <p className="activity-summary-info-label">
              Test result
            </p>
          </Column>
        </Row>
      </Column>
    </Row>
  </FlexGrid>
);

export default ActivitySummary;
