import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Tile, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import * as Icons from '@carbon/icons-react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FavActivityType } from '../../../types/FavActivityTypes';
import { putFavAct, deleteFavAct } from '../../../api-service/favouriteActivitiesAPI';
import './styles.scss';

interface FavouriteCardProps {
  activity: FavActivityType,
  index: number
}

const FavouriteCard = ({
  activity,
  index
}: FavouriteCardProps) => {
  const Icon = Icons[activity.image];
  const navigate = useNavigate();
  const favActQueryKey = ['favourite-activities'];
  const queryClient = useQueryClient();

  const highlightFavAct = useMutation({
    mutationFn: () => putFavAct('highlighted', activity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favActQueryKey });
    }
  });

  const removeFavAct = useMutation({
    mutationFn: () => deleteFavAct(activity.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favActQueryKey });
    }
  });

  return (
    <Tile
      className={activity.highlighted ? 'fav-card-main-highlighted' : 'fav-card-main'}
      tabIndex={index}
      onClick={() => navigate(activity.link)}
    >
      <div className="fav-card-header">
        <Icon className="fav-card-icon" />
        <p className="fav-card-title-small">{activity.header}</p>
        <OverflowMenu className="fav-card-overflow" ariaLabel={`${activity.header} options`} flipped>
          <OverflowMenuItem
            itemText={activity.highlighted ? 'Dehighlight shortcut' : 'Highlight shortcut'}
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
      </div>
      <div className="fav-card-content">
        <p className="fav-card-title-large">{activity.header}</p>
        <p className="fav-card-content-description">{activity.description}</p>
      </div>
    </Tile>
  );
};

export default FavouriteCard;
