import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Row,
  Column,
  Breadcrumb,
  BreadcrumbItem,
  FlexGrid,
  Button
} from '@carbon/react';
import { Add } from '@carbon/icons-react';

import PageTitle from '../../../components/PageTitle';
import AuthContext from '../../../contexts/AuthContext';
import SeedlotTable from '../../../components/SeedlotTable';
import ROUTES from '../../../routes/constants';
import useWindowSize from '../../../hooks/UseWindowSize';
import { MEDIUM_SCREEN_WIDTH } from '../../../shared-constants/shared-constants';

import { tableText } from './constants';

import './styles.scss';

const MySeedlots = () => {
  const navigate = useNavigate();
  const windowSize = useWindowSize();
  const { user } = useContext(AuthContext);

  const userId = user?.userId ?? '';

  return (
    <FlexGrid fullWidth className="my-seedlot-content">
      <Row className="my-seedlot-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem onClick={() => navigate(ROUTES.SEEDLOTS)}>Seedlots</BreadcrumbItem>
        </Breadcrumb>
      </Row>
      <Row className="my-seedlot-title">
        <Column className="no-padding-col" sm={4} md={6} lg={12} xlg={12}>
          <PageTitle
            title={tableText.pageTitle}
            enableFavourite
            activity="mySeedlots"
          />
        </Column>
        <Column className="no-padding-col" sm={4} md={2} lg={4} xlg={4}>
          <Button
            kind="primary"
            onClick={() => { navigate(ROUTES.SEEDLOTS_A_CLASS_CREATION); }}
            size="lg"
            className={`reg-seedlot-btn ${windowSize.innerWidth >= MEDIUM_SCREEN_WIDTH ? 'reg-btn-float-right' : null}`}
            renderIcon={Add}
          >
            {tableText.buttonText}
          </Button>
        </Column>
      </Row>
      <Row className="my-seedlot-data-table-row">
        <SeedlotTable
          userId={userId}
          isSortable
          showSearch
          showPagination
          defaultPageSize={20}
        />
      </Row>
    </FlexGrid>
  );
};

export default MySeedlots;
