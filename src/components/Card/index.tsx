import React from 'react';

import './styles.css';

import { Tile, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import * as Icons from '@carbon/icons-react';

interface CardProps {
  icon: string;
  header: string;
  description: string;
}

const Card = ({ icon, header, description }: CardProps) => {
  const Icon = Icons[icon];
  return (
    <Tile className="card-main" tabIndex="0">
      <span className="card-header">
        <Icon className="card-icon" />
        <OverflowMenu className="card-overflow" ariaLabel="overflow-menu">
          <OverflowMenuItem itemText="Item 1" />
          <OverflowMenuItem itemText="Item 2" />
          <OverflowMenuItem itemText="Item 3" />
        </OverflowMenu>
      </span>
      <div className="card-content">
        <h5>{header}</h5>
        <p>{description}</p>
      </div>
    </Tile>
  );
};

export default Card;
