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

import { tableText } from './constants';

import './styles.scss';

const MySeedlots = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const userId = user?.userId ?? '';

  return (
    <FlexGrid fullWidth className="my-seedlot-content">
      <Row className="my-seedlot-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem onClick={() => navigate('/seedlots')}>Seedlots</BreadcrumbItem>
        </Breadcrumb>
      </Row>
      <Row className="my-seedlot-title">
        <Column sm={4} md={6} lg={14} xlg={12}>
          <PageTitle
            title={tableText.pageTitle}
            subtitle={tableText.pageSubtitle}
            enableFavourite
            activity="mySeedlots"
          />
        </Column>
        <Column sm={4} md={2} lg={2} xlg={4}>
          <Button
            kind="primary"
            onClick={() => { navigate('/seedlots/register-a-class'); }}
            size="lg"
            className="btn-my-seedlot"
            renderIcon={Add}
          >
            {tableText.buttonText}
          </Button>
        </Column>
      </Row>
      <Row className="my-seedlot-data-table-row">
        <SeedlotTable userId={userId} isSortable showSearch showPagination defaultPageSize={20} />
      </Row>
    </FlexGrid>
  );
};

export default MySeedlots;
