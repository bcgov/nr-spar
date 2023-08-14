import React from 'react';
import './styles.scss';

interface PanelSectionNameProps {
  title?: string,
  light?: boolean,
  testId?: string,
}

const PanelSectionName = ({ title, light, testId }: PanelSectionNameProps) => (
  <div className={light ? 'panel-section-light' : 'panel-section'} data-testid={testId}>
    <span>
      {title}
    </span>
  </div>
);

export default PanelSectionName;
