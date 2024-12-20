import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  FlexGrid,
  Row,
  Column,
  Button,
  Tooltip
} from '@carbon/react';
import { Information } from '@carbon/icons-react';

import FavouriteActivities from '../../../components/FavouriteActivities';
import FavouriteActivityModal from './FavouriteActivityModal';
import { getFavAct } from '../../../api-service/favouriteActivitiesAPI';

import FavIcon from '../../../assets/img/fav-icon.svg';

import './styles.scss';

const FavouriteActivity = () => {
  const [open, setOpen] = useState(false);

  const handleSetOpen = (value: boolean) => {
    setOpen(value);
  };

  const favActQueryKey = ['favourite-activities'];

  const favActQuery = useQuery({
    queryKey: favActQueryKey,
    queryFn: getFavAct
  });

  return (
    <FlexGrid className="consep-fav-page">
      {favActQuery.isSuccess && favActQuery.data
              && favActQuery.data.filter((fav) => fav.isConsep).length > 0 ? (
                <>
                  <Row className="consep-fav-header-row">
                    <Column lg={8} md={6} sm={4}>
                      <Row className="consep-favourite-activities-title">
                        <span><h3>My favourite activities</h3></span>
                        <span>
                          <Tooltip
                            className="consep-favourite-activity-tooltip"
                            align="right"
                            label="You can add a shortcut to your favourite activity by clicking on the heart icon inside each page."
                          >
                            <Information />
                          </Tooltip>
                        </span>
                      </Row>

                    </Column>
                    <Column lg={8} md={2} sm={0} className="consep-add-fav-action">
                      <Button onClick={() => handleSetOpen(true)} className="consep-add-fav-btn">
                        Add favourite +
                      </Button>
                    </Column>
                  </Row>
                  <Row className="consep-fav-row">
                    <Column>
                      <section title="Favourite activities">
                        <FavouriteActivities isConsep />
                      </section>
                    </Column>
                  </Row>
                </>
        ) : (
          <Row className="consep-fav-row">
            <Column className="consep-fav-non-content-section">
              <img src={FavIcon} alt="My Icon" className="consep-fav-non-content-icon" />
              <p className="consep-fav-non-content-title">You don’t have any favorites to show yet!</p>
              <p className="consep-fav-non-content-subtitle">
                You can favorite your activities by clicking on add
                favorite activity or by clicking on the heart icon inside each page
              </p>
              <Button onClick={() => handleSetOpen(true)} className="consep-fav-non-content-btn">
                Add favourite activity +
              </Button>
            </Column>
          </Row>
        )}

      <FavouriteActivityModal open={open} setOpen={handleSetOpen} />
    </FlexGrid>
  );
};

export default FavouriteActivity;
