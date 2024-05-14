import React from 'react';
import { TagSkeleton } from '@carbon/react';
import { StatusColourMap } from '../../../../components/StatusTag/definitions';
import StatusTag from '../../../../components/StatusTag';

const renderStatusTag = (
  isFetching: boolean,
  seedlotStatus?: keyof typeof StatusColourMap
) => {
  if (isFetching) {
    return <TagSkeleton />;
  }
  if (seedlotStatus) {
    return <StatusTag type={seedlotStatus} />;
  }
  return null;
};

export default renderStatusTag;
