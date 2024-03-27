import React from 'react';
import { FlexGrid, Column, Row } from '@carbon/react';

import './styles.scss';

type DetailSectionProps = {
  title: string,
  children: React.ReactNode
}

/**
 * A section wrapper that provides a white container with rounded border and paddings.
 * Intended for Seedlot Detail page, can be used elsewhere.
 */
const DetailSection = ({ title, children }: DetailSectionProps) => (
  <FlexGrid className="detail-section-grid">
    <Row className="title-row">
      <Column>
        <p className="title-text">
          {title}
        </p>
      </Column>
    </Row>
    {children}
  </FlexGrid>
);

export default DetailSection;
