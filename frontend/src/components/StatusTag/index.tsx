import React from 'react';
import { Tag } from '@carbon/react';

import { StatusColourMap } from './definitions';

type StatusTagProps = {
  type: keyof typeof StatusColourMap
}

const StatusTag = ({ type }: StatusTagProps) => {
  const tagType: keyof typeof StatusColourMap = Object.keys(StatusColourMap).includes(type) ? type : 'Unkown';
  return (
    <Tag type={StatusColourMap[tagType]}>
      {type}
    </Tag>
  );
};

export default StatusTag;
