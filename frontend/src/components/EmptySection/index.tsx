import React from 'react';

import * as Icons from '@carbon/icons-react';
import * as Pictograms from '@carbon/pictograms-react';

import Subtitle from '../Subtitle';

import './styles.scss';

interface EmptySectionProps {
  icon?: string;
  title: string;
  description: string | React.ReactNode;
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

  return (
    <div className="empty-section-container">
      <Img className="empty-section-icon" />
      <p className="empty-section-title">
        {title}
      </p>
      <Subtitle className="empty-section-subtitle" text={description} />
    </div>
  );
};

export default EmptySection;
