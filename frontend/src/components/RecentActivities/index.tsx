import React, { useState } from 'react';
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

// import ActivityTable from '../ActivityTable';
import EmptySection from '../EmptySection';
import Subtitle from '../Subtitle';
import FilesDocsTable from '../FilesDocsTable';
import RecentActivitiesTable from './RecentActivitiesTable';

import getRecentActivities from '../../api-service/recentActivitiesAPI';
import {
  componentTexts,
  fileDocstableHeaders,
  getEmptySectionDesc,
  getEmptySectionTitle,
  tableHeaders
} from './constants';

import './styles.scss';

const RecentActivities = () => {
  // Will let eslint ignoring it for now,
  // since we will use this state with API calls
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [filesDocsItems] = useState([]);

  const recentActivitiesQuery = useQuery({
    queryKey: ['recent-activities'],
    queryFn: getRecentActivities
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
            <TabPanels>
              {
                recentActivitiesQuery.isSuccess
                  ? (
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
                              elements={recentActivitiesQuery.data}
                              clickFn={goToActivity}
                              headers={tableHeaders}
                            />
                          )
                      }
                    </TabPanel>
                  )
                  : (
                    <DataTableSkeleton
                      showToolbar={false}
                      showHeader={false}
                    />
                  )
              }
              <TabPanel>
                {
                  filesDocsItems.length === 0
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
