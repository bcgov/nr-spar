import React from 'react';

import * as Icons from '@carbon/icons-react';
import * as Pictograms from '@carbon/pictograms-react';

import Subtitle from '../Subtitle';

import './styles.scss';

interface EmptySectionProps {
  icon?: string;
  title: string;
  description: React.ReactNode;
  pictogram?: string;
}

const EmptySection = ({
  icon, title, description, pictogram
}: EmptySectionProps) => {
  let Img;

  if (icon) {
    Img = Icons[icon];
  }
  // If both icon and pictogram are passed in then pictogram will be used
  if (pictogram) {
    Img = Pictograms[pictogram];
  }

  if (!Img) {
    Img = Icons.Help;
  }

  return (
    <div className="empty-section-container">
      <Img className="empty-section-icon" />
      <p id="empty-section-heading" role="heading" aria-level={2} className="empty-section-title">
        {title}
      </p>
      <Subtitle className="empty-section-subtitle" text={description} aria-describedby="empty-section-heading" />
    </div>
  );
};

export default EmptySection;
