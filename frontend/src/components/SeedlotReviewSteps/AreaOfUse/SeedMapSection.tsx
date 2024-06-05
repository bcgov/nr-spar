import React from 'react';
import { Row, Column, Button } from '@carbon/react';
import { MapBoundaryVegetation } from '@carbon/icons-react';

const SeedMapSection = () => (
  <>
    <Row>
      <Column className="sub-section-title-col">
        Seedmap and other tool(s)
      </Column>
    </Row>

    <Row>
      <Column className="info-col" sm={4} md={4} lg={4}>
        <Button
          kind="ghost"
          renderIcon={MapBoundaryVegetation}
          iconDescription="map icon"
          onClick={
            () => window.open('https://www2.gov.bc.ca', '_blank', 'noopener')
          }
        >
          View Tested Parent Tree Areas of Use
        </Button>
      </Column>
    </Row>
  </>
);

export default SeedMapSection;
