import React from 'react';

import './styles.scss';

import { Tile, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import * as Icons from '@carbon/icons-react';

interface CardProps {
  icon: string;
  header: string;
  description: string;
  highlighted?: boolean;
  highlightFunction?: () => void;
  deleteFunction?: () => void;
}

const Card = ({
  icon, header, description, highlighted, highlightFunction, deleteFunction
}: CardProps) => {
  const Icon = Icons[icon];
  return (
    <Tile className={highlighted ? 'card-main-highlighted' : 'card-main'}>
      <span className="card-header">
        <Icon className="card-icon" />
        <OverflowMenu className="card-overflow" ariaLabel="overflow-menu">
          <OverflowMenuItem tabIndex="0" itemText={highlighted ? 'Dehighlight shortcut' : 'Highlight shortcut'} onClick={highlightFunction} />
          <OverflowMenuItem itemText="Delete shortcut" onClick={deleteFunction} />
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
