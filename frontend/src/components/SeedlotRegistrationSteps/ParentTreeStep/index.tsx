/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Tabs,
  TabList,
  Tab,
  FlexGrid,
  Row,
  Column,
  ActionableNotification
} from '@carbon/react';

import DropDownObj from '../../../types/DropDownObject';
import DescriptionBox from '../../DescriptionBox';
import { OrchardObj } from '../OrchardStep/definitions';
import getPageText from './constants';
import { tabTypes } from './definitions';
import { getTabString, processOrchardIDs } from './utils';

import './styles.scss';

interface ParentTreeStepProps {
  seedlotSpecies: DropDownObj
  state: object;
  setStepData: Function;
  orchards: Array<OrchardObj>;
}

const ParentTreeStep = (
  {
    seedlotSpecies,
    state,
    setStepData,
    orchards
  }: ParentTreeStepProps
) => {
  const pageText = getPageText();
  const [hasOrchardID, setHasOrchardID] = useState<boolean>(false);
  const [orchardIDs, setOrchardIDs] = useState<Array<string>>([]);
  const [currentTab, setCurrentTab] = useState(tabTypes.coneTab);

  useEffect(
    () => {
      const processedOrchardIDs = processOrchardIDs(orchards);
    },
    [orchards]
  );

  return (
    <FlexGrid className="parent-tree-step-container">
      <Row>
        <Column sm={4} md={8} lg={16} xlg={16}>
          <Tabs onChange={
            (value: { selectedIndex: number }) => setCurrentTab(getTabString(value.selectedIndex))
          }
          >
            <TabList className="parent-tree-step-tab-list" aria-label="List of tabs">
              <Tab>{pageText.coneTab.tabTitle}</Tab>
              <Tab>{pageText.successTab.tabTitle}</Tab>
              <Tab>{pageText.mixTab.tabTitle}</Tab>
            </TabList>
            <FlexGrid className="parent-tree-tab-container">
              <Row className="title-row">
                <Column sm={4} md={8} lg={16} xlg={12} max={10}>
                  <DescriptionBox
                    header={pageText[currentTab].tabTitle}
                    description={pageText[currentTab].tabDescription}
                  />
                </Column>
              </Row>
              <Row className="notification-row">
                <Column>
                  <ActionableNotification
                    kind="info"
                    lowContrast
                    title={pageText.notificationTitle}
                    inline
                    actionButtonLabel=""
                  >
                    <span className="notification-subtitle">
                      {pageText[currentTab].notificationSubtitle}
                    </span>
                  </ActionableNotification>
                </Column>
              </Row>
            </FlexGrid>
          </Tabs>
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default ParentTreeStep;
