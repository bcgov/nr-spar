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
  isIcon: boolean,
  favClassName?: string,
  favTabIndex?: number
}

const SmallCard = ({
  header, actionBtn, path, isIcon, image, favClassName, favTabIndex
}: SmallCardProps) => {
  const navigate = useNavigate();

  const Img = isIcon ? Icons[image] : Pictograms[image];

  return (
    <Tile className={`${favClassName} small-card`} tabIndex={favTabIndex} onClick={() => navigate(path)}>
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
