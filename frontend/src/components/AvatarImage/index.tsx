import React from 'react';

import emptyUser from '../../assets/img/emptyUser.jpg';
import './style.scss';

type Size = 'small' | 'large';

interface AvatarImageProps {
  userName: string;
  source?: string;
  size: Size;
}

const AvatarImage = ({ userName, source, size }: AvatarImageProps) => (
  <img src={source || emptyUser} alt={`${userName}`} className={`profile-image ${size}`} />
);

export default AvatarImage;
