import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import {
  Row,
  Column,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  DataTableSkeleton
} from '@carbon/react';

import EmptySection from '../EmptySection';
import Subtitle from '../Subtitle';
import RecentActivitiesTable from './RecentActivitiesTable';

import getRecentActivities from '../../api-service/recentActivitiesAPI';
import getFilesAndDocs from '../../api-service/filesAndDocsAPI';

import {
  componentTexts,
  getEmptySectionDesc,
  getEmptySectionTitle,
  activitiesHeaders,
  filesAndDocsHeaders
} from './constants';

import './styles.scss';

const RecentActivities = () => {
  const recentActivitiesQuery = useQuery({
    queryKey: ['recent-activities'],
    queryFn: getRecentActivities
  });

  const filesAndDocsQuery = useQuery({
    queryKey: ['files-docs'],
    queryFn: getFilesAndDocs
  });

  const navigate = useNavigate();

  const goToActivity = (requestId: string) => {
    navigate(`/activity/${requestId}`);
  };

  return (
    <>
      <Row className="recent-activity-title-row">
        <Column>
          <h2>{componentTexts.title}</h2>
          <Subtitle text={componentTexts.subtitle} className="recent-activity-subtitle" />
        </Column>
      </Row>
      <Row>
        <Column className="recent-activity-table">
          <Tabs>
            <TabList aria-label={componentTexts.tabs.ariaLabel}>
              <Tab>{componentTexts.tabs.requests}</Tab>
              <Tab>{componentTexts.tabs.files}</Tab>
            </TabList>
            {
              recentActivitiesQuery.isSuccess
              && filesAndDocsQuery.isSuccess
                ? (
                  <TabPanels>
                    <TabPanel>
                      {
                        recentActivitiesQuery.data.length === 0
                          ? (
                            <div className="empty-recent-activities">
                              <EmptySection
                                pictogram="Farm_02"
                                title={getEmptySectionTitle('activity')}
                                description={getEmptySectionDesc('requests')}
                              />
                            </div>
                          )
                          : (
                            <RecentActivitiesTable
                              headers={activitiesHeaders}
                              elements={recentActivitiesQuery.data}
                              clickFn={goToActivity}
                            />
                          )
                      }
                    </TabPanel>
                    <TabPanel>
                      {
                        filesAndDocsQuery.data.length === 0
                          ? (
                            <div className="empty-recent-activity-files-docs">
                              <EmptySection
                                pictogram="Farm_02"
                                title={getEmptySectionTitle('files & docs')}
                                description={getEmptySectionDesc('files & docs')}
                              />
                            </div>
                          )
                          : (
                            <RecentActivitiesTable
                              headers={filesAndDocsHeaders}
                              elements={filesAndDocsQuery.data}
                              clickFn={goToActivity}
                              isDocTable
                            />
                          )
                      }
                    </TabPanel>
                  </TabPanels>
                )
                : (
                  <DataTableSkeleton
                    showToolbar={false}
                    showHeader={false}
                  />
                )
            }
          </Tabs>
        </Column>
      </Row>
    </>
  );
};

export default RecentActivities;
