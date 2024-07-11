import React, { useContext } from 'react';
import {
  FlexGrid, DataTableSkeleton
} from '@carbon/react';
import ParentTreeStep from '../../SeedlotRegistrationSteps/ParentTreeStep';

import ClassAContext from '../../../views/Seedlot/ContextContainerClassA/context';

import './styles.scss';

type ParentTreeReviewProps = {
  isRead: boolean;
}

const ParentTreeReview = ({ isRead }: ParentTreeReviewProps) => {
  const { isFetchingData } = useContext(ClassAContext);

  return (
    <FlexGrid className="sub-section-grid parent-tree-review">
      {
        isFetchingData
          ? (
            <DataTableSkeleton
              showToolbar={false}
              showHeader={false}
              zebra
            />
          )
          : (
            <ParentTreeStep isReviewDisplay isReviewRead={isRead} />
          )
      }

    </FlexGrid>
  );
};

export default ParentTreeReview;
