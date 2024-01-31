import React from 'react';

import EmptySection from '../EmptySection';
import { NetworkErrorProps } from './defintions';

const NetworkError = ({ title, description }: NetworkErrorProps) => (
  <EmptySection icon="InProgressError" title={title ?? 'Network errors...'} description={description} />
);

export default NetworkError;
