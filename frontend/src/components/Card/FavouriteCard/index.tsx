import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Tile, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import * as Icons from '@carbon/icons-react';

import './styles.scss';

interface FavouriteCardProps {
  icon: string;
  header: string;
  description: string;
  link: string;
  highlighted?: boolean;
  highlightFunction: () => void;
  deleteFunction: () => void;
}

const FavouriteCard = ({
  icon, header, description, link, highlighted, highlightFunction, deleteFunction
}: FavouriteCardProps) => {
  const Icon = Icons[icon];
  const navigate = useNavigate();
  return (
    <Tile className={highlighted ? 'fav-card-main-highlighted' : 'fav-card-main'}
          tabIndex={0}
          onClick={() => navigate(link)}>
      <div className="fav-card-header">
        <Icon className="fav-card-icon" />
        <p className="fav-card-title-small">{header}</p>
        <OverflowMenu className="fav-card-overflow" ariaLabel={`${header} options`} flipped>
          <OverflowMenuItem
            tabIndex="0"
            itemText={highlighted ? 'Dehighlight shortcut' : 'Highlight shortcut'}
            onClick={(e:Event) => {
              e.stopPropagation();
              highlightFunction();
            }}
          />
          <OverflowMenuItem
            itemText="Delete shortcut"
            onClick={(e:Event) => {
              e.stopPropagation();
              deleteFunction();
            }}
          />
        </OverflowMenu>
      </div>
      <div className="fav-card-content">
        <p className="fav-card-title-large">{header}</p>
        <p className="fav-card-content-description">{description}</p>
      </div>
    </Tile>
  );
};

export default FavouriteCard;
