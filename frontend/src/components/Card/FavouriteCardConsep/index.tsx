import React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Tile, OverflowMenu, OverflowMenuItem, Column
} from '@carbon/react';
import * as Icons from '@carbon/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { FavActivityType } from '../../../types/FavActivityTypes';
import {
  patchFavAct,
  deleteFavAct
} from '../../../api-service/favouriteActivitiesAPI';
import useWindowSize from '../../../hooks/UseWindowSize';
import { MEDIUM_SCREEN_WIDTH } from '../../../shared-constants/shared-constants';

import SmallCard from '../SmallCard';

import './styles.scss';

type FavouriteCardProps = {
  favObject: FavActivityType;
};

const FavouriteCard = ({ favObject }: FavouriteCardProps) => {
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
    <OverflowMenu
      className="fav-card-overflow"
      menuOptionsClass="fav-card-menu-options"
      aria-label={`${favObject.header} options`}
      flipped
      iconDescription="More actions"
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        e.stopPropagation();
      }}
      onClick={(e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
      }}
    >
      <OverflowMenuItem
        itemText={
          favObject.highlighted ? 'Dehighlight shortcut' : 'Highlight shortcut'
        }
        onClick={(e: React.MouseEvent<HTMLElement>) => {
          e.stopPropagation();
          highlightFavAct.mutate();
        }}
      />
      <OverflowMenuItem
        itemText="Delete shortcut"
        onClick={(e: React.MouseEvent<HTMLElement>) => {
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
        favClassName={
          favObject.highlighted ? 'fav-card-main-highlighted' : 'fav-card-main'
        }
      />
    );
  }

  return (
    <Column key={favObject.type} lg={4} md={4} sm={2}>
      {' '}
      <Tile
        className={
          favObject.highlighted
            ? 'consep-fav-card-highlighted'
            : 'consep-fav-card'
        }
        onClick={() => navigate(favObject.link)}
        tabIndex={0}
        aria-label={`Go to ${favObject.header}`}
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            navigate(favObject.link);
          }
        }}
      >
        <div className="consep-fav-card-header">
          <Icon className="fav-card-icon" />
          {ActionBtn}
        </div>
        <div className="consep-fav-card-content">
          <p>{favObject.header}</p>
        </div>
      </Tile>
    </Column>
  );
};

export default FavouriteCard;
