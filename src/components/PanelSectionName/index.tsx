import React from 'react';
import './styles.scss';

interface PanelSectionNameProps {
  title?: string
}

const PanelSectionName = ({ title }: PanelSectionNameProps) => (
  <div className="panel-section">
    <span>
      {title}
    </span>
  </div>
);

export default PanelSectionName;
