import React from 'react';
import { Row, Column } from '@carbon/react';
import InfoDisplayObj from '../../../types/InfoDisplayObj';

import '../styles.scss';
import ReadOnlyInput from '../../ReadOnlyInput';

interface InfoSectionRowProps {
  items: InfoDisplayObj[];
}

const InfoSectionRow = (
  { items }: InfoSectionRowProps
) => (
  <Row className="info-section-items-row">
    {
      items.map((item) => (
        <Column key={`${item.name.toLowerCase().replace(' ', '')}-key`}>
          <ReadOnlyInput
            id={item.name.toLowerCase().replace(' ', '')}
            label={item.name}
            value={item.value}
          />
        </Column>
      ))
    }
  </Row>
);

export default InfoSectionRow;
