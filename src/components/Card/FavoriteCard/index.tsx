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
    <Tile className={highlighted ? 'fav-card-main-highlighted' : 'fav-card-main'} tabIndex={0}>
      <div className="fav-card-header">
        <Icon className="fav-card-icon" />
        <p className="fav-card-title-small">{header}</p>
        <OverflowMenu className="fav-card-overflow" ariaLabel={`${header} options`} flipped>
          <OverflowMenuItem tabIndex="0" itemText={highlighted ? 'Dehighlight shortcut' : 'Highlight shortcut'} onClick={highlightFunction} />
          <OverflowMenuItem itemText="Delete shortcut" onClick={deleteFunction} />
        </OverflowMenu>
      </div>
      <div className="fav-card-content">
        <p className="fav-card-title-large">{header}</p>
        <p className="fav-card-content-description">{description}</p>
      </div>
    </Tile>
  );
};

export default FavoriteCard;
