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
  <Column sm={4} md={8} lg={8} xl={8}>
    <h1>{header}</h1>
    <div>{description}</div>
  </Column>
);

export default DescriptionBox;
