import React from 'react';
import { Row } from '@carbon/react';
import InfoSectionColumn from '../InfoSectionColumn';
import InfoDisplayObj from '../../../types/InfoDisplayObj';

import '../styles.scss';

interface InfoSectionRowProps {
  items: InfoDisplayObj[];
}

const InfoSectionRow = (
  { items }: InfoSectionRowProps
) => (
  <Row className="info-section-items-row">
    {
      items.map((item) => (
        <InfoSectionColumn key={item.name} item={item} />
      ))
    }
  </Row>
);

export default InfoSectionRow;
