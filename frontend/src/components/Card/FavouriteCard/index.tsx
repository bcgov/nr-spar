import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Tile, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import * as Icons from '@carbon/icons-react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FavActivityType } from '../../../types/FavActivityTypes';
import { patchFavAct, deleteFavAct } from '../../../api-service/favouriteActivitiesAPI';

import useWindowSize from '../../../hooks/UseWindowSize';
import { MEDIUM_SCREEN_WIDTH } from '../../../shared-constants/shared-constants';
import SmallCard from '../SmallCard';

import './styles.scss';

interface FavouriteCardProps {
  favObject: FavActivityType,
  index: number
}

const FavouriteCard = ({
  favObject,
  index
}: FavouriteCardProps) => {
  const Icon = Icons[favObject.image];
  const navigate = useNavigate();
  const favActQueryKey = ['favourite-activities'];
  const queryClient = useQueryClient();

  const windowSize = useWindowSize();

  const highlightFavAct = useMutation({
    mutationFn: () => patchFavAct('highlighted', favObject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favActQueryKey });
    }
  });

  const removeFavAct = useMutation({
    mutationFn: () => deleteFavAct(favObject.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favActQueryKey });
    }
  });

  const ActionBtn = (
    <OverflowMenu className="fav-card-overflow" menuOptionsClass="fav-card-menu-options" aria-label={`${favObject.header} options`} flipped iconDescription="More actions">
      <OverflowMenuItem
        itemText={favObject.highlighted ? 'Dehighlight shortcut' : 'Highlight shortcut'}
        onClick={(e: Event) => {
          e.stopPropagation();
          highlightFavAct.mutate();
        }}
      />
      <OverflowMenuItem
        itemText="Delete shortcut"
        onClick={(e: Event) => {
          e.stopPropagation();
          removeFavAct.mutate();
        }}
      />
    </OverflowMenu>
  );

  if (windowSize.innerWidth < MEDIUM_SCREEN_WIDTH) {
    return (
      <SmallCard
        header={favObject.header}
        actionBtn={ActionBtn}
        path={favObject.link}
        image={favObject.image}
        isIcon
        favClassName={favObject.highlighted ? 'fav-card-main-highlighted' : 'fav-card-main'}
        favTabIndex={index}
      />
    );
  }

  return (
    <Tile
      className={favObject.highlighted ? 'fav-card-main-highlighted' : 'fav-card-main'}
      tabIndex={index}
      onClick={() => navigate(favObject.link)}
    >
      <div className="fav-card-header">
        <Icon className="fav-card-icon" />
        {ActionBtn}
      </div>
      <div className="fav-card-content">
        <p className="fav-card-title-large">{favObject.header}</p>
        <p className="fav-card-content-description">{favObject.description}</p>
      </div>
    </Tile>
  );
};

export default FavouriteCard;
