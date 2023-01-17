import React from 'react';

import {
  Column,
  IconButton
} from '@carbon/react';
import { Favorite } from '@carbon/icons-react';

import './styles.css';

interface PageTitleProps {
  title: string;
  subtitle: string;
  favorite?: boolean;
}

// TODO: Toggle Favorite logic
const PageTitle = ({ title, subtitle, favorite }: PageTitleProps) => (
  <Column sm={4} md={4} className="title-section">
    <div className={favorite ? 'title-favorite' : ''}>
      <h1>{title}</h1>
      {favorite && (
        <IconButton kind="ghost" label="Favorite" align="right">
          <Favorite size={28} />
        </IconButton>
      )}
    </div>
    <h4>
      {subtitle}
    </h4>
  </Column>
);

export default PageTitle;
