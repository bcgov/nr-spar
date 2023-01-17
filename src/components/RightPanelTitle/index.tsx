import React from 'react';

import { IconButton } from '@carbon/react';
import { Settings, Close } from '@carbon/icons-react';

import './styles.css';

interface RightPanelTitleProps {
  title: string;
  closeFn: Function;
}

const RightPanelTitle = ({ title, closeFn }: RightPanelTitleProps) => (
  <div className="right-title-section">
    <h4>
      {title}
    </h4>
    <div className="right-title-buttons">
      <IconButton kind="ghost" label="Settings" align="bottom">
        <Settings />
      </IconButton>
      <IconButton kind="ghost" label="Close" onClick={closeFn} align="bottom">
        <Close />
      </IconButton>
    </div>
  </div>
);

export default RightPanelTitle;
