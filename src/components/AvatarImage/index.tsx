import React from 'react';

import './style.css';
import emptyUser from '../../mock-data/img/EmptyUser.jpg';

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
