import React from 'react';

import { useNavigate } from 'react-router-dom';

import { Tile, IconButton } from '@carbon/react';
import * as Icons from '@carbon/icons-react';
import * as Pictograms from '@carbon/pictograms-react';

import ActivityHistory from '../../ActivityHistory';

import ActivityHistoryItems from '../../../mock-server/fixtures/ActivityHistoryItems';
import useWindowSize from '../../../hooks/UseWindowSize';
import { MEDIUM_SCREEN_WIDTH } from '../../../shared-constants/shared-constants';

import EmptySection from '../../EmptySection';
import SmallCard from '../SmallCard';

import './styles.scss';

interface StandardCardProps {
  header: string;
  description: string;
  url: string;
  image: string;
  type: string;
  isEmpty: boolean;
  emptyTitle: string;
  emptyDescription: string;
}

const StandardCard = ({
  header, description, url, image, type, isEmpty, emptyTitle, emptyDescription
}: StandardCardProps) => {
  const navigate = useNavigate();
  const Image = image ? Pictograms[image] : null;

  const windowSize = useWindowSize();

  const ActionBtn = (
    <IconButton className="std-card-button" kind="ghost" label="Go" align="bottom" onClick={() => { navigate(`${url}`); }}>
      <Icons.ArrowRight />
    </IconButton>
  );

  if (windowSize.innerWidth < MEDIUM_SCREEN_WIDTH) {
    return (
      <SmallCard
        header={header}
        actionBtn={ActionBtn}
        path={url}
        image={image}
        isIcon={false}
      />
    );
  }

  return (
    <Tile className="std-card-main" onClick={() => navigate(url)}>
      <div className="std-card-header">
        <div>
          <p className="std-card-title">{header}</p>
          <div className="std-card-description">
            <p>{description}</p>
          </div>
        </div>
        {
          isEmpty
            ? null
            : (
              <IconButton className="std-card-button" kind="ghost" label="Go" align="bottom" onClick={() => { navigate(`${url}`); }}>
                <Icons.ArrowRight />
              </IconButton>
            )
        }
      </div>
      {
        isEmpty
          ? <EmptySection pictogram={image} title={emptyTitle} description={emptyDescription} />
          : (
            <div>
              {type !== '4' ? (
                <Image className="std-card-pictogram" />
              ) : (
                <ActivityHistory
                  history={ActivityHistoryItems}
                />
              )}
            </div>
          )
      }
    </Tile>
  );
};

export default StandardCard;
