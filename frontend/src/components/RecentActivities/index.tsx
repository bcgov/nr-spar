import React, { useEffect, useState } from 'react';
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
import Subtitle from '../Subtitle';

import './styles.scss';
import api from '../../api-service/api';
import ApiConfig from '../../api-service/ApiConfig';
import FilesDocsTable from '../FilesDocsTable';

const RecentActivities = () => {
  const [listItems, setListItems] = useState([]);
  // Will let eslint ignoring it for now,
  // since we will use this state with API calls
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [filesDocsItems] = useState([]);

  useEffect(() => {
    const url = ApiConfig.recentActivities;
    api.get(url)
      .then((response) => {
        setListItems(response.data);
      })
      // eslint-disable-next-line
      .catch((error) => console.error(`Error: ${error}`));
  }, []);

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

  const fileDocstableHeaders: string[] = [
    'File name',
    'File format',
    'Created at',
    'Last update',
    'Actions'
  ];

  return (
    <>
      <Row className="recent-activity-title-row">
        <Column>
          <h2>My recent activities</h2>
          <Subtitle text="Check your recent requests and files" className="recent-activity-subtitle" />
        </Column>
      </Row>
      <Row>
        <Column className="recent-activity-table">
          <Tabs>
            <TabList aria-label="List of tabs">
              <Tab>Requests</Tab>
              <Tab>Files & Docs.</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                {
                  listItems.length === 0
                    ? (
                      <div className="empty-recent-activities">
                        <EmptySection
                          icon="Application"
                          title="There is no activity to show yet!"
                          description="Your recent requests will appear here once you generate one"
                        />
                      </div>
                    )
                    : (
                      <ActivityTable
                        elements={listItems}
                        clickFn={goToActivity}
                        headers={tableHeaders}
                      />
                    )
                }
              </TabPanel>
              <TabPanel>
                {
                  filesDocsItems.length === 0
                    ? (
                      <div className="empty-recent-activity-files-docs">
                        <EmptySection
                          icon="Application"
                          title="There is no files & docs to show yet!"
                          description="Your recent files & docs will appear here once you generate one"
                        />
                      </div>
                    )
                    : (
                      <FilesDocsTable
                        elements={filesDocsItems}
                        headers={fileDocstableHeaders}
                      />
                    )
                }
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Column>
      </Row>
    </>
  );
};

export default RecentActivities;
