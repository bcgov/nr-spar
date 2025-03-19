import React from 'react';
import { Tag } from '@carbon/react';

import { StatusColourMap } from './definitions';

import './styles.scss';

type StatusTagProps = {
  type: keyof typeof StatusColourMap,
  renderIcon?: Object
}

const StatusTag = ({ type, renderIcon }: StatusTagProps) => {
  const tagType: keyof typeof StatusColourMap = Object.keys(StatusColourMap).includes(type) ? type : 'Unknown';
  return (
    <Tag className="status-tag" type={StatusColourMap[tagType]} renderIcon={renderIcon}>
      {type}
    </Tag>
  );
};

export default StatusTag;
