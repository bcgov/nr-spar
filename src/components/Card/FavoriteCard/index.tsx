import React from 'react';

import { Tile, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import * as Icons from '@carbon/icons-react';

import './styles.scss';

interface FavoriteCardProps {
  icon: string;
  header: string;
  description: string;
  highlighted?: boolean;
  highlightFunction?: () => void;
  deleteFunction?: () => void;
}

const FavoriteCard = ({
  icon, header, description, highlighted, highlightFunction, deleteFunction
}: FavoriteCardProps) => {
  const Icon = Icons[icon];
  return (
    <Tile className={highlighted ? 'fav-card-main-highlighted' : 'fav-card-main'}>
      <div className="fav-card-header">
        <Icon className="fav-card-icon" />
        <h5 className="fav-card-title-small">{header}</h5>
        <OverflowMenu className="fav-card-overflow" ariaLabel="overflow-menu" flipped>
          <OverflowMenuItem tabIndex="0" itemText={highlighted ? 'Dehighlight shortcut' : 'Highlight shortcut'} onClick={highlightFunction} />
          <OverflowMenuItem itemText="Delete shortcut" onClick={deleteFunction} />
        </OverflowMenu>
      </div>
      <div className="fav-card-content">
        <h5 className="fav-card-title-large">{header}</h5>
        <p>{description}</p>
      </div>
    </Tile>
  );
};

export default FavoriteCard;
