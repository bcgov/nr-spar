import React from 'react';

import ContextContainerClassA from '../ContextContainerClassA';

import SeedlotReviewContent from './SeedlotReviewContent';

import './styles.scss';

const SeedlotReview = () => (
  <ContextContainerClassA>
    <SeedlotReviewContent />
  </ContextContainerClassA>
);

export default SeedlotReview;
