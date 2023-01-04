import React from 'react';
import { Tag } from '@carbon/react';

import ACTIVITY_STATUS from '../../enums/ActivityStatus';

const statusClass = (param: number) => {
  switch (param) {
    case 1:
      // In progress
      return 'cyan';
    case 2:
      // Approved
      return 'green';
    case 3:
      // Canceled
      return 'magenta';
    default:
      // Pending
      return 'gray';
  }
};

interface StatusProps {
  status: number;
}

const StatusItem = ({ status }: StatusProps) => (
  <Tag type={`${statusClass(status)}`}>
    {Object.values(ACTIVITY_STATUS)[status]}
  </Tag>
);

export default StatusItem;
