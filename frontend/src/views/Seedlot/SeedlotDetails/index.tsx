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
      <Stack gap={7}>
        <Row>
          <Column className="seedlot-details-title-column" sm={4} md={4} lg={13}>
            <PageTitle
              title="Seedlot 636465"
              subtitle="Check and manage this seedlot"
              favourite
            />
          </Column>
          <Column  sm={4} md={4} lg={2}>
            <ComboButton title="Manage Seedlot" items={manageOptions} />
          </Column>
        </Row>
        <section title="Seedlot Summary">
          <Row className="seedlot-summary-content">
            <Column sm={4}>
              <span>
                Seedlot Summary Placeholder
              </span>
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
