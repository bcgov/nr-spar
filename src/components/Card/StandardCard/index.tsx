import React from 'react';

import { useNavigate } from 'react-router-dom';

import { Tile, IconButton } from '@carbon/react';
import * as Icons from '@carbon/icons-react';
import * as Pictograms from '@carbon/pictograms-react';

import ActivityHistory from '../../ActivityHistory';

import ActivityHistoryItems from '../../../mock-data/ActivityHistoryItems';

import './styles.scss';

interface StandardCardProps {
  header: string;
  description: string;
  url: string;
  image: string;
}

const StandardCard = ({
  header, description, url, image
}: StandardCardProps) => {
  const navigate = useNavigate();
  const Image = Pictograms[image];
  return (
    <Tile className="std-card-main">
      <div className="std-card-header">
        <div>
          <p className="std-card-title">{header}</p>
          <div className="std-card-description">
            <p>{description}</p>
          </div>
        </div>
        <IconButton className="std-card-button" kind="ghost" label="Go" align="bottom" onClick={() => { navigate(`${url}`); }}>
          <Icons.ArrowRight />
        </IconButton>
      </div>
      <div>
        {image ? (
          <Image className="std-card-pictogram" />
        ) : (
          <ActivityHistory
            history={ActivityHistoryItems}
          />
        )}
      </div>
    </Tile>
  );
};

export default StandardCard;
