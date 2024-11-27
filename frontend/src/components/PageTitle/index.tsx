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
}

const PageTitle = ({
  title,
  subtitle,
  enableFavourite,
  activity
}: PageTitleProps) => {
  const favActQueryKey = ['favourite-activities'];
  const queryClient = useQueryClient();

  const favActQuery = useQuery({
    queryKey: favActQueryKey,
    queryFn: getFavAct
  });

  const highlightFavAct = useMutation({
    mutationFn: (actObj: FavActivityPostType) => postFavAct(actObj),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favActQueryKey });
    }
  });

  const removeFavAct = useMutation({
    mutationFn: (id: number) => deleteFavAct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favActQueryKey });
    }
  });

  const thisFavAct = favActQuery?.data?.filter((act) => act.type === activity)[0];

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
                align="right"
                onClick={
                  isFavourited
                    ? () => removeFavAct.mutate(thisFavAct.id)
                    : () => highlightFavAct.mutate({ activity })
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
          ? <Subtitle text={subtitle} role="heading" aria-level="2" />
          : null
      }
    </Column>
  );
};

export default PageTitle;
