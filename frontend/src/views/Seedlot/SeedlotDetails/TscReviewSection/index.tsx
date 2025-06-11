import React from 'react';
import { Button } from '@carbon/react';
import { SearchLocate } from '@carbon/icons-react';
import { useNavigate } from 'react-router-dom';

import ROUTES from '../../../../routes/constants';
import DetailSection from '../../../../components/DetailSection';
import { addParamToPath } from '../../../../utils/PathUtils';

type props = { seedlotNumber: string };

const TscReviewSection = ({ seedlotNumber }: props) => {
  const navigate = useNavigate();
  return (
    <DetailSection title="Review and approve this seedlot">
      <Button
        kind="tertiary"
        size="md"
        className="section-btn"
        renderIcon={SearchLocate}
        onClick={() => navigate(addParamToPath(ROUTES.SEEDLOT_A_CLASS_REVIEW, seedlotNumber))}
      >
        Review seedlot
      </Button>
    </DetailSection>
  );
};

export default TscReviewSection;
