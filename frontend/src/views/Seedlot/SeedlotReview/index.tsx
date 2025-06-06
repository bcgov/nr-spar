import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router';

import ContextContainerClassA from '../ContextContainerClassA';
import AuthContext from '../../../contexts/AuthContext';

import SeedlotReviewContent from './SeedlotReviewContent';

import './styles.scss';

const SeedlotReview = () => {
  const { isTscAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isTscAdmin) {
      navigate('/');
    }
  }, [isTscAdmin]);

  if (!isTscAdmin) {
    return null;
  }

  return (
    <ContextContainerClassA>
      <SeedlotReviewContent />
    </ContextContainerClassA>
  );
};

export default SeedlotReview;
