/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
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
import getPageText from './constants';
import { tabTypes } from './definitions';

import './styles.scss';

interface ParentTreeStepProps {
  seedlotSpecies: DropDownObj
  state: object;
  setStepData: Function;
}

const ParentTreeStep = (
  {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    seedlotSpecies,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    state,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setStepData
  }: ParentTreeStepProps
) => {
  const pageText = getPageText();
  const [hasOrchardID, setHasOrchardID] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState(tabTypes.coneTab);

  const setTabString = (selectedIndex: number) => {
    switch (selectedIndex) {
      case 0:
        setCurrentTab(tabTypes.coneTab);
        break;
      case 1:
        setCurrentTab(tabTypes.successTab);
        break;
      case 2:
        setCurrentTab(tabTypes.mixTab);
        break;
      default:
        break;
    }
  };

  return (
    <FlexGrid className="parent-tree-step-container">
      <Row>
        <Column sm={4} md={8} lg={16} xlg={16}>
          <Tabs onChange={
            (value: { selectedIndex: number }) => setTabString(value.selectedIndex)
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
