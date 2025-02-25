import React from 'react';
import { FlexGrid, Row, Column } from '@carbon/react';
import ROUTES from '../../../../routes/constants';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import PageTitle from '../../../../components/PageTitle';
import ActivitySummary from '../ActivitySummary';

const MoistureContent = () => {
  const createBreadcrumbItems = () => {
    const crumbsList = [];
    crumbsList.push({ name: 'CONSEP', path: ROUTES.CONSEP_FAVOURITE_ACTIVITIES });
    crumbsList.push({ name: 'Testing activities search', path: ROUTES.TESTING_REQUESTS_REPORT });
    crumbsList.push({ name: 'Testing list', path: ROUTES.TESTING_ACTIVITIES_LIST });
    return crumbsList;
  };

  return (
    <FlexGrid className="consep-moisture-content">
      <Row className="seedlot-details-breadcrumb">
        <Breadcrumbs crumbs={createBreadcrumbItems()} />
      </Row>
      <Row className="page-title">
        <PageTitle
          title="Moisture content oven for seedlot 64132"
          enableFavourite
        />
      </Row>
      <Row>
        <Column>
          <ActivitySummary />
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default MoistureContent;
