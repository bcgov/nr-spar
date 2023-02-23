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
  favourite?: boolean;
}

// TODO: Toggle Favourite logic
const PageTitle = ({ title, subtitle, favourite }: PageTitleProps) => (
  <Column sm={4} md={4} className="title-section">
    <div className={favourite ? 'title-favourite' : 'title-no-favourite'}>
      <h1>{title}</h1>
      {favourite && (
        <IconButton kind="ghost" label="Favourite" align="right">
          <Favorite size={28} />
        </IconButton>
      )}
    </div>
    <Subtitle text={subtitle} />
  </Column>
);

export default PageTitle;
