import React from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  Tooltip,
  Row,
  Column,
  Loading
} from '@carbon/react';
import { Information } from '@carbon/icons-react';

import FavouriteCard from '../Card/FavouriteCard';
import EmptySection from '../EmptySection';
import Subtitle from '../Subtitle';
import { getFavAct } from '../../api-service/favouriteActivitiesAPI';
import useWindowSize from '../../hooks/UseWindowSize';

import './styles.scss';
import { MEDIUM_SCREEN_WIDTH } from '../../shared-constants/shared-constants';

const FavouriteActivities = () => {
  const windowSize = useWindowSize();

  const favActQueryKey = ['favourite-activities'];

  const favActQuery = useQuery({
    queryKey: favActQueryKey,
    queryFn: getFavAct
  });

  return (
    <Row
      className={
        `favourite-activities ${windowSize.innerWidth < MEDIUM_SCREEN_WIDTH
          ? 'favourite-activities-sm-padding' : 'favourite-activities-padding'}`
      }
    >
      <Column sm={4} md={8} lg={16} xlg={4} className="favourite-activities-title">
        <h2>My favourite activities</h2>
        <Subtitle text="Quick access to your favourite activities." className="favourite-activities-subtitle" />
        <Tooltip
          className="favourite-activity-tooltip"
          align="top"
          label="You can add a shortcut to your favourite activity by clicking on the heart icon inside each page."
        >
          <button className="tooltip-button" type="button" aria-label="favourite activity description tooltip">
            <Information />
          </button>
        </Tooltip>
      </Column>
      <Column sm={4} md={8} lg={16} xlg={12} className="favourite-activities-cards">
        <Row>
          {
            favActQuery.isLoading ? <Loading role="status" aria-live="polite" withOverlay={false}>
                                      <span className="visually-hidden">Loading, please wait...</span>
                                    </Loading> : null
          }
          {
            favActQuery.isSuccess
            && favActQuery.data
            && (
              favActQuery.data.length === 0
                ? (
                  <EmptySection
                    icon="Application"
                    title="You don't have any favourites to show yet!"
                    description="You can favourite your most used
                    activities by clicking on the heart icon inside each page"
                  />
                ) : favActQuery.data.map((favObject) => (
                  <FavouriteCard
                    key={favObject.type}
                    favObject={favObject}
                  />
                ))
            )
          }
        </Row>
      </Column>
    </Row>
  );
};

export default FavouriteActivities;
