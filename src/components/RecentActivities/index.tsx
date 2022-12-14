import React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Row,
  Column,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from '@carbon/react';
import ActivityTable from '../ActivityTable';

import RecentActivityItems from '../../mock-data/RecentActivityItems';

import './styles.css';

const RecentActivities = () => {
  const listItems = RecentActivityItems;

  const navigate = useNavigate();

  const goToActivity = (requestId: string) => {
    navigate(`/activity/${requestId}`);
  };

  const tableHeaders: string[] = [
    'Activity type',
    'Status',
    'Request ID',
    'Created at',
    'Last viewed',
    'View'
  ];

  return (
    <>
      <Row className="main-content recent-activity">
        <Column sm={4}>
          <h3>My recent activities</h3>
        </Column>
        <Column sm={4}>
          <h4>Check your recent requests and files</h4>
        </Column>
      </Row>
      <Row>
        <Column sm={4}>
          <Tabs>
            <TabList aria-label="List of tabs">
              <Tab>Requests</Tab>
              <Tab>Files & Docs.</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <ActivityTable
                  elements={listItems}
                  clickFn={goToActivity}
                  headers={tableHeaders}
                />
              </TabPanel>
              <TabPanel>Placeholder</TabPanel>
            </TabPanels>
          </Tabs>
        </Column>
      </Row>
    </>
  );
};

export default RecentActivities;
