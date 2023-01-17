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
import EmptySection from '../EmptySection';

import RecentActivityItems from '../../mock-data/RecentActivityItems';

import './styles.scss';

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
    <Row className="main-content recent-activity">
      <Column sm={4} className="recent-activity-title">
        <h3>My recent activities</h3>
        <h4 className="recent-activity-subtitle">Check your recent requests and files</h4>
      </Column>
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
              {(listItems.length === 0) && (
              <div className="empty-recent-activities">
                <EmptySection
                  icon="Application"
                  title="There is no activity to show yet!"
                  description="Your recent requests will appear here once you generate one"
                />
              </div>
              )}
            </TabPanel>
            <TabPanel>Placeholder</TabPanel>
          </TabPanels>
        </Tabs>
      </Column>
    </Row>
  );
};

export default RecentActivities;
