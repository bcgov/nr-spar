import React from 'react';
import { Tag } from '@carbon/react';

import ACTIVITY_STATUS from '../../enums/ActivityStatus';

import './styles.scss';

const statusClass = (param: number) => {
  switch (param) {
    case 1:
      // Submited
      return 'cyan';
    case 2:
      // Approved
      return 'green';
    case 3:
      // Canceled
      return 'magenta';
    case 4:
      // Incomplete
      return 'purple';
    case 5:
      // Expired
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
  <Tag className="status-item" type={`${statusClass(status)}`}>
    {Object.values(ACTIVITY_STATUS)[status]}
  </Tag>
);

export default StatusItem;
