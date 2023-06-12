import React from 'react';
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
  <div className="description-box-container">
    <h2 className="description-box-header">{header}</h2>
    <div className="description-box-description">{description}</div>
  </div>
);

export default DescriptionBox;
