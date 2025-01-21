import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  Column,
  IconButton
} from '@carbon/react';
import { Favorite, FavoriteFilled } from '@carbon/icons-react';

import Subtitle from '../Subtitle';

import { getFavAct, postFavAct, deleteFavAct } from '../../api-service/favouriteActivitiesAPI';
import { FavActivityPostType } from '../../types/FavActivityTypes';

import './styles.scss';

interface PageTitleProps {
  title: string;
  subtitle?: string | React.ReactNode;
  enableFavourite?: boolean;
  activity?: string;
  isConsep?: boolean;
}

const PageTitle = ({
  title,
  subtitle,
  enableFavourite,
  activity,
  isConsep = false
}: PageTitleProps) => {
  const favActQueryKey = ['favourite-activities'];
  const queryClient = useQueryClient();

  const favActQuery = useQuery({
    queryKey: favActQueryKey,
    queryFn: getFavAct
  });

  const addFavAct = useMutation({
    mutationFn: (actObjs: FavActivityPostType[]) => postFavAct(actObjs),
    onSuccess: () => {
      queryClient.invalidateQueries(favActQueryKey);
    }
  });

  const removeFavAct = useMutation({
    mutationFn: (id: number) => deleteFavAct(id),
    onSuccess: () => {
      queryClient.invalidateQueries(favActQueryKey);
    }
  });

  const thisFavAct = favActQuery?.data?.filter(
    (act) => act.type === activity && act.isConsep === isConsep
  )[0];

  const isFavourited = thisFavAct !== undefined;

  return (
    <Column className="title-section">
      <div className="title-favourite">
        <h1>{title}</h1>
        {
          (enableFavourite && activity)
            ? (
              <IconButton
                kind="ghost"
                label={isFavourited ? 'Unfavourite' : 'Favourite'}
                aria-label={isFavourited ? 'Unfavourite' : 'Favourite'}
                aria-pressed={isFavourited}
                align="right"
                onClick={
                  isFavourited
                    ? () => removeFavAct.mutate(thisFavAct.id)
                    : () => addFavAct.mutate([{ activity }])
                }
              >
                {
                  isFavourited
                    ? (<FavoriteFilled size={28} />)
                    : (<Favorite size={28} />)
                }
              </IconButton>
            )
            : null
        }
      </div>
      {
        subtitle
          ? <Subtitle text={subtitle} />
          : null
      }
    </Column>
  );
};

export default PageTitle;
