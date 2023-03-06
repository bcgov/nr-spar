import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';

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
import getUrl from '../../utils/ApiUtils';
import ApiAddresses from '../../utils/ApiAddresses';
import { useAuth } from '../../contexts/AuthContext';
import FilesDocsTable from '../FilesDocsTable';

const RecentActivities = () => {
  const { token } = useAuth();
  const [listItems, setListItems] = useState([]);
  const [filesDocsItems, setFilesDocsItems] = useState([]);

  const getAxiosConfig = () => {
    const axiosConfig = {};
    if (token) {
      const headers = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      Object.assign(axiosConfig, headers);
    }
    return axiosConfig;
  };

  useEffect(() => {
    axios.get(getUrl(ApiAddresses.RecentActivitiesRetrieveAll), getAxiosConfig())
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
    <Row className="main-content recent-activity">
      <Column sm={4} className="recent-activity-title">
        <h2>My recent activities</h2>
        <Subtitle text="Check your recent requests and files" className="recent-activity-subtitle" />
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
            <TabPanel>
              <FilesDocsTable
                elements={filesDocsItems}
                headers={fileDocstableHeaders}
              />
              {(filesDocsItems.length === 0) && (
              <div className="empty-recent-activity-files-docs">
                <EmptySection
                  icon="Application"
                  title="There is no files & docs to show yet!"
                  description="Your recent files & docs will appear here once you generate one"
                />
              </div>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Column>
    </Row>
  );
};

export default RecentActivities;
