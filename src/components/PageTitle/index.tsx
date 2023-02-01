import React from 'react';

import {
  Column,
  IconButton
} from '@carbon/react';
import { Favorite } from '@carbon/icons-react';

import Subtitle from '../Subtitle';

import './styles.scss';

interface PageTitleProps {
  title: string;
  subtitle: string;
  favorite?: boolean;
}

// TODO: Toggle Favorite logic
const PageTitle = ({ title, subtitle, favorite }: PageTitleProps) => (
  <Column sm={4} md={4} className="title-section">
    <div className={favorite ? 'title-favorite' : 'title-no-favorite'}>
      <h1>{title}</h1>
      {favorite && (
        <IconButton kind="ghost" label="Favorite" align="right">
          <Favorite size={28} />
        </IconButton>
      )}
    </div>
    <Subtitle text={subtitle} />
  </Column>
);

export default PageTitle;
