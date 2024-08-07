import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  TextInput,
  Button,
  Row,
  Column,
  Breadcrumb,
  BreadcrumbItem,
  FlexGrid
} from '@carbon/react';
import { ArrowRight } from '@carbon/icons-react';
import PageTitle from '../../../components/PageTitle';
import AuthContext from '../../../contexts/AuthContext';
import SeedlotTable from '../../../components/SeedlotTable';
import ROUTES from '../../../routes/constants';
import { addParamToPath } from '../../../utils/PathUtils';

import './styles.scss';

const ReviewSeedlots = () => {
  const navigate = useNavigate();
  const { user, isTscAdmin } = useContext(AuthContext);
  const userId = user?.userId ?? '';

  const [seedlotNumber, setSeedlotNumber] = useState<string>('');

  useEffect(() => {
    if (!isTscAdmin) {
      navigate(ROUTES.FOUR_OH_FOUR);
    }
  }, [isTscAdmin]);

  return (
    <FlexGrid fullWidth className="review-seedlots-content">
      <Row className="review-seedlots-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem onClick={() => navigate(ROUTES.SEEDLOTS)}>Seedlots</BreadcrumbItem>
        </Breadcrumb>
      </Row>
      <Row className="review-seedlots-title">
        <Column className="no-padding-col" sm={4} md={6} lg={12} xlg={12}>
          <PageTitle
            title="Review seedlots"
            subtitle={null}
            enableFavourite
            activity="reviewSeedlots"
          />
        </Column>
      </Row>
      <Row className="go-to-seedlot-section">
        <Column className="no-padding-col" sm={4} md={6} lg={14} xlg={14}>
          <TextInput
            id="go-to-seedlot-input"
            type="number"
            labelText=""
            placeholder="Enter seedlot number"
            value={seedlotNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSeedlotNumber(e.target.value)}
            onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
          />
        </Column>
        <Column sm={4} md={2} lg={2} xlg={2}>
          <Button
            kind="primary"
            size="md"
            renderIcon={ArrowRight}
            onClick={() => navigate(addParamToPath(ROUTES.SEEDLOT_DETAILS, seedlotNumber))}
          >
            Go to seedlot
          </Button>
        </Column>
      </Row>
      <div className="review-seedlots-table-wrapper">
        <Row className="review-seedlots-data-table-row">
          <SeedlotTable
            userId={userId}
            isTscAdmin={isTscAdmin}
            isSortable
            showSearch
            showPagination
            defaultPageSize={20}
          />
        </Row>
      </div>
    </FlexGrid>
  );
};

export default ReviewSeedlots;
