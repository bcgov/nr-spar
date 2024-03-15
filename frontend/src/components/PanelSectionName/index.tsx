import React from 'react';
import './styles.scss';

interface PanelSectionNameProps {
  title?: string,
  light?: boolean
}

const PanelSectionName = ({ title, light }: PanelSectionNameProps) => (
  <div className={light ? 'panel-section-light' : 'panel-section'}>
    <span>
      {title}
    </span>
  </div>
);

export default PanelSectionName;
