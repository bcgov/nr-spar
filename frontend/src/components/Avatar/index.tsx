import React from 'react';
import './style.scss';

type AvatarProps = {
  initial: string,
  size: 'sm' | 'md'
}

/**
 * An avatar that displays user's initial
 */
const Avatar = ({ initial, size }: AvatarProps) => (
  <div className={`initial-avatar-${size} ${initial.length ? `initial-bg-${initial.charAt(0).toLowerCase()}` : ''}`}>
    {initial}
  </div>
);

export default Avatar;
