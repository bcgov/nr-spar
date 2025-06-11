import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Row,
  Column,
  Breadcrumb,
  BreadcrumbItem,
  FlexGrid
} from '@carbon/react';
import PageTitle from '../../../components/PageTitle';
import AuthContext from '../../../contexts/AuthContext';
import SeedlotTable from '../../../components/SeedlotTable';
import SeedlotNavigator from '../../../components/SeedlotNavigator';

import ROUTES from '../../../routes/constants';

import './styles.scss';

const ReviewSeedlots = () => {
  const navigate = useNavigate();
  const { user, isTscAdmin } = useContext(AuthContext);
  const userId = user?.userId ?? '';

  useEffect(() => {
    if (!isTscAdmin) {
      navigate(ROUTES.FOUR_OH_FOUR);
    }
  }, [isTscAdmin]);

  return (
    <FlexGrid fullWidth className="review-seedlots-content">
      <Row className="review-seedlots-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem onClick={() => navigate(ROUTES.SEEDLOTS)}>
            Seedlots
          </BreadcrumbItem>
        </Breadcrumb>
      </Row>
      <Row className="review-seedlots-title">
        <Column className="no-padding-col" sm={4} md={6} lg={12} xlg={12}>
          <PageTitle
            title="Review seedlots"
            enableFavourite
            activity="reviewSeedlots"
          />
        </Column>
      </Row>
      <Row className="go-to-seedlot-section">
        <SeedlotNavigator />
      </Row>
      <div className="review-seedlots-table-wrapper">
        <Row className="review-seedlots-data-table-row">
          <SeedlotTable
            userId={userId}
            isTscAdmin={isTscAdmin}
            isSortable
            showSearch
            showPagination
            defaultPageSize={50}
          />
        </Row>
      </div>
    </FlexGrid>
  );
};

export default ReviewSeedlots;
