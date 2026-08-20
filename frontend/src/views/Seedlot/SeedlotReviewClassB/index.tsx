import React from 'react';

import ContextContainerClassB from '../ContextContainerClassB';

import ReviewContent from './ReviewContent';

import '../SeedlotReview/styles.scss';

/**
 * Review and edit screen for submitted B-class seedlots. TSC admins can
 * edit sections in place and approve or send the seedlot back to pending,
 * while other users get a read-only view.
 */
const SeedlotReviewClassB = () => (
  <ContextContainerClassB>
    <ReviewContent />
  </ContextContainerClassB>
);

export default SeedlotReviewClassB;
