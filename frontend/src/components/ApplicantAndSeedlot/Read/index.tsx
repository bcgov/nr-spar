import React from 'react';
import { Column, Row, FlexGrid } from '@carbon/react';

import Divider from '../../Divider';
import ReadOnlyInput from '../../ReadOnlyInput';

const ApplicantAndSeedlotRead = () => {
  const a = 'b';
  return (
    <FlexGrid className="sub-section-grid">
      <Row>
        <Column className="sub-section-title-col">
          Applicant agency
        </Column>
      </Row>
      <Row>
        <Column sm={4} md={4} lg={4}>
          <ReadOnlyInput
            id="applicant-and-seedlot-agency-name"
            label="Agency name"
            value="0032 - Strong Seeds Orchard - SSO"
          />
        </Column>
      </Row>

      <Divider />

      <Row>
        <Column className="sub-section-title-col">
          Seedlot information
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default ApplicantAndSeedlotRead;
