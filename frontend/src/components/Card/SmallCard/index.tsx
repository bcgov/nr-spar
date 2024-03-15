import React from 'react';
import * as Icons from '@carbon/icons-react';
import * as Pictograms from '@carbon/pictograms-react';
import { Tile } from '@carbon/react';
import { useNavigate } from 'react-router-dom';

import './styles.scss';

type SmallCardProps = {
  header: string,
  actionBtn: JSX.Element
  path: string,
  image: string,
  isIcon: boolean
}

const SmallCard = ({
  header, actionBtn, path, isIcon, image
}: SmallCardProps) => {
  const navigate = useNavigate();

  const Img = isIcon ? Icons[image] : Pictograms[image];

  return (
    <Tile className="small-card" onClick={() => navigate(path)}>
      <div className="image-header">
        <Img className="image" />
        <p className="header">{header}</p>
      </div>
      <div className="action-btn">
        {actionBtn}
      </div>
    </Tile>
  );
};

export default SmallCard;
