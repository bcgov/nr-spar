import React from 'react';
import { Column } from '@carbon/react';
import './styles.scss';

type DescriptionBoxProps = {
  header: string
  description: React.ReactNode
}

const DescriptionBox = (
  {
    header,
    description
  }: DescriptionBoxProps
) => (
  <Column className="description-box-container" sm={4} md={8} lg={8} xlg={8}>
    <h1 className="description-box-header">{header}</h1>
    <div className="description-box-description">{description}</div>
  </Column>
);

export default DescriptionBox;
