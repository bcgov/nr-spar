import React from 'react';

import './styles.css';

import ACTIVITY_STATUS from '../../enums/ActivityStatus';

const statusClass = (param: number) => {
  switch (param) {
    case 1:
      return 'status-item-progress';
    case 2:
      return 'status-item-approved';
    case 3:
      return 'status-item-canceled';
    default:
      return '';
  }
};

interface StatusProps {
  status: number;
}

const StatusItem = ({ status }: StatusProps) => (
  <div className={`status-item ${statusClass(status)}`}>
    {Object.values(ACTIVITY_STATUS)[status]}
  </div>
);

export default StatusItem;
