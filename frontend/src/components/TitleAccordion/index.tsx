import React from 'react';

interface TitleAccordionProps {
  title: string;
  description: string;
}

const TitleAccordion = ({
  title, description
}: TitleAccordionProps) => (
  <div className="item-section">
    <p>{title}</p>
    <p className="description-section">{description}</p>
  </div>
);

export default TitleAccordion;
