import React from 'react';

import { useNavigate } from 'react-router-dom';

import { Tile, IconButton } from '@carbon/react';
import * as Icons from '@carbon/icons-react';

import './styles.scss';

interface StandardCardProps {
  header: string;
  description: string;
  url: string;
}

const StandardCard = ({
  header, description, url
}: StandardCardProps) => {
  const navigate = useNavigate();
  return (
    <Tile className="std-card-main">
      <div className="std-card-header">
        <h4 className="std-card-title">{header}</h4>
        <IconButton className="std-card-button" kind="ghost" label="Go" align="bottom" onClick={() => { navigate(`${url}`); }}>
          <Icons.ArrowRight />
        </IconButton>
      </div>
      <div className="std-card-content">
        <p>{description}</p>
      </div>
    </Tile>
  );
};

export default StandardCard;
