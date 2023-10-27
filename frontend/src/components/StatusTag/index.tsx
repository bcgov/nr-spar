import React from 'react';
import { Tag } from '@carbon/react';

import { StatusColourMap } from './definitions';

type StatusTagProps = {
  type: keyof typeof StatusColourMap
}

const StatusTag = ({ type }: StatusTagProps) => (
  <Tag type={StatusColourMap[type]}>
    {type}
  </Tag>
);

export default StatusTag;
