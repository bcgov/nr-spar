import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlexGrid,
  Row,
  Column,
  Stack,
  Breadcrumb,
  BreadcrumbItem,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from '@carbon/react';

import PageTitle from '../../../components/PageTitle';
import ComboButton from '../../../components/ComboButton';
import SeedlotSummary from '../../../components/SeedlotSummary';

import './styles.scss';

const manageOptions = [
  {
    text: 'Share seedlot',
    onClickFunction: () => null
  },
  {
    text: 'Print seedlot',
    onClickFunction: () => null
  },
  {
    text: 'Duplicate seedlot',
    onClickFunction: () => null
  },
  {
    text: 'Delete seedlot',
    onClickFunction: () => null
  },
];

const SeedlotDetails = () => {
  const navigate = useNavigate();
  return (
    <FlexGrid className="seedlot-details-page">
      <Row className="seedlot-details-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem onClick={() => navigate('/seedlot')} >Seedlots</BreadcrumbItem>
          <BreadcrumbItem>Existing seedlots</BreadcrumbItem>
        </Breadcrumb>
      </Row>
      <Stack gap={6}>
        <Row className="seedlot-summary-title">
          <PageTitle
            title="Seedlot 636465"
            subtitle="Check and manage this seedlot"
            favourite
          />
          <ComboButton title="Manage Seedlot" items={manageOptions} />
        </Row>
        <section title="Seedlot Summary">
          <Row className="seedlot-summary-content">
            <Column sm={4}>
              <SeedlotSummary />
            </Column>
          </Row>
        </section>
        <section title="Seedlot Details">
          <Row className="seedlot-details-content">
            <Column sm={4}>
              <Tabs>
                <TabList aria-label="List of tabs">
                  <Tab>Seedlot Details</Tab>
                  <Tab>Activity history</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>Seedlot details' Tab Content Placeholder</TabPanel>
                  <TabPanel>Activity history's Tab Content Placebolder</TabPanel>
                </TabPanels>
              </Tabs>
            </Column>
          </Row>
        </section>
      </Stack>
    </FlexGrid>
  );
};

export default SeedlotDetails;
