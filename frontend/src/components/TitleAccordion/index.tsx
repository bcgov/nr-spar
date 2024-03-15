import React from 'react';

interface TitleAccordionProps {
  title: string;
  description: string;
}

const TitleAccordion = ({
  title, description
}: TitleAccordionProps) => (
  <div className="item-section">
    <p className="item-title-section">{title}</p>
    <p className="item-description-section">{description}</p>
  </div>
);

export default TitleAccordion;
