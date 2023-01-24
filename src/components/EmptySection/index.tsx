import React from 'react';

import * as Icons from '@carbon/icons-react';

import Subtitle from '../Subtitle';

import './styles.scss';

interface EmptySectionProps {
  icon: string;
  title: string;
  description: string;
}

const EmptySection = ({
  icon, title, description
}: EmptySectionProps) => {
  const Icon = Icons[icon];
  return (
    <div className="empty-section-container">
      <Icon className="empty-section-icon" />
      <p>
        {title}
      </p>
      <Subtitle text={description} />
    </div>
  );
};

export default EmptySection;
